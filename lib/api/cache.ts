// lib/utils/cache.ts
const CACHE_PREFIX = 'hadith_cache_';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_CACHE_SIZE = 30; // Reduced from 50 to be more conservative
const STORAGE_LIMIT_THRESHOLD = 0.8; // 80% of storage limit
const CLEANUP_PERCENTAGE = 0.5; // Clean 50% when limit is reached

interface CacheItem<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    size: number; // Track individual item size
}

interface CacheStats {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
    storageUsagePercentage: number;
}

export class CacheManager {
    private static isStorageAvailable(): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    private static getEstimatedStorageSize(): number {
        if (!this.isStorageAvailable()) return 0;

        let totalSize = 0;
        try {
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += key.length + (localStorage.getItem(key)?.length || 0);
                }
            }
        } catch {
            // Fallback estimation
            totalSize = JSON.stringify(localStorage).length;
        }
        return totalSize;
    }

    private static isNearStorageLimit(): boolean {
        const currentSize = this.getEstimatedStorageSize();
        // Assume 5MB limit (conservative estimate)
        const estimatedLimit = 5 * 1024 * 1024;
        return (currentSize / estimatedLimit) > STORAGE_LIMIT_THRESHOLD;
    }

    static async get<T>(key: string): Promise<T | null> {
        if (!this.isStorageAvailable()) return null;

        try {
            const cached = localStorage.getItem(CACHE_PREFIX + key);
            if (!cached) return null;

            const item: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is expired
            if (now - item.timestamp > CACHE_DURATION) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }

            // Update access statistics (but don't save immediately to avoid writes)
            item.accessCount += 1;
            item.lastAccessed = now;

            // Only update if it's been more than 5 minutes since last update
            const shouldUpdate = now - item.timestamp > 5 * 60 * 1000;
            if (shouldUpdate) {
                try {
                    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
                } catch {
                    // If we can't update stats, still return the data
                }
            }

            return item.data;
        } catch (error) {
            console.error('Cache read error:', error);
            // Try to remove corrupted item
            try {
                localStorage.removeItem(CACHE_PREFIX + key);
            } catch { }
            return null;
        }
    }

    static async set<T>(key: string, data: T): Promise<void> {
        if (!this.isStorageAvailable()) return;

        const serializedData = JSON.stringify(data);
        const itemSize = serializedData.length + key.length;

        // Skip caching if item is too large (>500KB)
        if (itemSize > 500 * 1024) {
            console.warn('Cache item too large, skipping:', key, itemSize);
            return;
        }

        try {
            const now = Date.now();
            const item: CacheItem<T> = {
                data,
                timestamp: now,
                accessCount: 1,
                lastAccessed: now,
                size: itemSize,
            };

            const itemString = JSON.stringify(item);

            // Proactive cleanup if near storage limit
            if (this.isNearStorageLimit()) {
                await this.aggressiveCleanup();
            }

            // Try to set the item
            try {
                localStorage.setItem(CACHE_PREFIX + key, itemString);
            } catch (quotaError) {
                // If quota exceeded, try progressive cleanup
                console.warn('Storage quota exceeded, attempting cleanup...');

                // First, clear expired items
                this.clearOldCache();

                // Then clear least used items
                await this.clearLeastUsed(Math.ceil(MAX_CACHE_SIZE * CLEANUP_PERCENTAGE));

                // Try again
                try {
                    localStorage.setItem(CACHE_PREFIX + key, itemString);
                } catch (secondError) {
                    // If still failing, do more aggressive cleanup
                    await this.clearLeastUsed(Math.ceil(MAX_CACHE_SIZE * 0.8));

                    // Final attempt
                    try {
                        localStorage.setItem(CACHE_PREFIX + key, itemString);
                    } catch (finalError) {
                        console.error('Failed to cache after multiple cleanup attempts:', finalError);
                        throw finalError;
                    }
                }
            }
        } catch (error) {
            console.error('Cache write error:', error);
            throw error; // Re-throw so calling code knows caching failed
        }
    }

    private static async aggressiveCleanup(): Promise<void> {
        console.log('Performing aggressive cache cleanup...');

        // Clear expired items first
        this.clearOldCache();

        // Clear a larger portion of least used items
        await this.clearLeastUsed(Math.ceil(MAX_CACHE_SIZE * 0.6));
    }

    static async ensureCacheSize(): Promise<void> {
        const stats = this.getCacheStats();
        if (stats.totalItems >= MAX_CACHE_SIZE) {
            await this.clearLeastUsed(Math.ceil(MAX_CACHE_SIZE * 0.3));
        }
    }

    static async clearLeastUsed(count: number): Promise<void> {
        if (!this.isStorageAvailable()) return;

        const keys = Object.keys(localStorage);
        const cacheItems: { key: string; item: CacheItem<unknown>; score: number }[] = [];

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const item = JSON.parse(cached) as CacheItem<unknown>;

                        // Calculate score based on access frequency, recency, and size
                        const ageScore = (Date.now() - item.lastAccessed) / CACHE_DURATION;
                        const accessScore = 1 / (item.accessCount + 1);
                        const sizeScore = (item.size || 1000) / (100 * 1024); // Penalize large items

                        // Lower score = higher priority for deletion
                        const score = (ageScore * 0.4) + (accessScore * 0.4) + (sizeScore * 0.2);

                        cacheItems.push({ key, item, score });
                    }
                } catch {
                    // Remove corrupted items
                    localStorage.removeItem(key);
                }
            }
        });

        // Sort by score (highest score = least important, delete first)
        cacheItems.sort((a, b) => b.score - a.score);

        // Remove least important items
        const itemsToRemove = Math.min(count, cacheItems.length);
        for (let i = 0; i < itemsToRemove; i++) {
            try {
                localStorage.removeItem(cacheItems[i].key);
            } catch {
                // Continue even if removal fails
            }
        }

        console.log(`Cleaned up ${itemsToRemove} cache items`);
    }

    static getCacheStats(): CacheStats {
        if (!this.isStorageAvailable()) {
            return {
                totalItems: 0,
                totalSize: 0,
                oldestItem: 0,
                newestItem: 0,
                storageUsagePercentage: 0
            };
        }

        const keys = Object.keys(localStorage);
        let totalItems = 0;
        let totalSize = 0;
        let oldestItem = Date.now();
        let newestItem = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                totalItems++;
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                    try {
                        const parsed = JSON.parse(item) as CacheItem<unknown>;
                        oldestItem = Math.min(oldestItem, parsed.timestamp);
                        newestItem = Math.max(newestItem, parsed.timestamp);
                    } catch { }
                }
            }
        });

        const overallStorageSize = this.getEstimatedStorageSize();
        const storageUsagePercentage = (overallStorageSize / (5 * 1024 * 1024)) * 100; // Assume 5MB limit

        return {
            totalItems,
            totalSize,
            oldestItem,
            newestItem,
            storageUsagePercentage: Math.min(100, storageUsagePercentage)
        };
    }

    static clearOldCache(): void {
        if (!this.isStorageAvailable()) return;

        const keys = Object.keys(localStorage);
        const now = Date.now();
        let clearedCount = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const item = JSON.parse(cached) as CacheItem<unknown>;
                        if (now - item.timestamp > CACHE_DURATION) {
                            localStorage.removeItem(key);
                            clearedCount++;
                        }
                    }
                } catch {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            }
        });

        if (clearedCount > 0) {
            console.log(`Cleared ${clearedCount} expired cache items`);
        }
    }

    static clearAll(): void {
        if (!this.isStorageAvailable()) return;

        const keys = Object.keys(localStorage);
        let clearedCount = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
                clearedCount++;
            }
        });

        console.log(`Cleared all ${clearedCount} cache items`);
    }

    // New utility methods
    static getStorageInfo(): { used: number; percentage: number; available: number } {
        if (!this.isStorageAvailable()) {
            return { used: 0, percentage: 0, available: 0 };
        }

        const used = this.getEstimatedStorageSize();
        const limit = 5 * 1024 * 1024; // 5MB conservative estimate
        const percentage = (used / limit) * 100;
        const available = Math.max(0, limit - used);

        return { used, percentage: Math.min(100, percentage), available };
    }

    // Method to check if we can safely cache an item
    static canCache(dataSize: number): boolean {
        if (!this.isStorageAvailable()) return false;

        const storageInfo = this.getStorageInfo();
        const requiredSpace = dataSize + 1000; // Add buffer for metadata

        return storageInfo.available > requiredSpace && storageInfo.percentage < 90;
    }
}