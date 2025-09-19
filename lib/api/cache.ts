const CACHE_PREFIX = 'hadith_cache_';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_CACHE_SIZE = 50; // Maximum number of cached items

interface CacheItem<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

interface CacheStats {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
}

export class CacheManager {
    static async get<T>(key: string): Promise<T | null> {
        if (typeof window === 'undefined') return null;

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

            // Update access statistics
            item.accessCount += 1;
            item.lastAccessed = now;
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));

            return item.data;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    static async set<T>(key: string, data: T): Promise<void> {
        if (typeof window === 'undefined') return;

        try {
            const now = Date.now();
            const item: CacheItem<T> = {
                data,
                timestamp: now,
                accessCount: 1,
                lastAccessed: now,
            };

            // Check cache size and clean if necessary
            await this.ensureCacheSize();

            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (error) {
            console.error('Cache write error:', error);
            // Try to make space and retry
            await this.clearLeastUsed(5);
            try {
                const item: CacheItem<T> = {
                    data,
                    timestamp: Date.now(),
                    accessCount: 1,
                    lastAccessed: Date.now(),
                };
                localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
            } catch {
                console.warn('Failed to cache after cleanup');
            }
        }
    }

    static async ensureCacheSize(): Promise<void> {
        const stats = this.getCacheStats();
        if (stats.totalItems >= MAX_CACHE_SIZE) {
            await this.clearLeastUsed(Math.ceil(MAX_CACHE_SIZE * 0.3)); // Clear 30%
        }
    }

    static async clearLeastUsed(count: number): Promise<void> {
        if (typeof window === 'undefined') return;

        const keys = Object.keys(localStorage);
        const cacheItems: { key: string; item: CacheItem<any> }[] = [];

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const item = JSON.parse(cached);
                        cacheItems.push({ key, item });
                    }
                } catch {
                    localStorage.removeItem(key);
                }
            }
        });

        // Sort by access count and last accessed time
        cacheItems.sort((a, b) => {
            const scoreA = a.item.accessCount * 0.7 + (a.item.lastAccessed / 1000000) * 0.3;
            const scoreB = b.item.accessCount * 0.7 + (b.item.lastAccessed / 1000000) * 0.3;
            return scoreA - scoreB;
        });

        // Remove least used items
        for (let i = 0; i < Math.min(count, cacheItems.length); i++) {
            localStorage.removeItem(cacheItems[i].key);
        }
    }

    static getCacheStats(): CacheStats {
        if (typeof window === 'undefined') return { totalItems: 0, totalSize: 0, oldestItem: 0, newestItem: 0 };

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
                        const parsed = JSON.parse(item);
                        oldestItem = Math.min(oldestItem, parsed.timestamp);
                        newestItem = Math.max(newestItem, parsed.timestamp);
                    } catch { }
                }
            }
        });

        return { totalItems, totalSize, oldestItem, newestItem };
    }

    static clearOldCache(): void {
        if (typeof window === 'undefined') return;

        const keys = Object.keys(localStorage);
        const now = Date.now();

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const item = JSON.parse(cached);
                        if (now - item.timestamp > CACHE_DURATION) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    static clearAll(): void {
        if (typeof window === 'undefined') return;

        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    }
}