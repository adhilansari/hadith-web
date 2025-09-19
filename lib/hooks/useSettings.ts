// lib/hooks/useSettings.ts (Simplified version)
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import type { Theme, IExtendedSettings, ILanguageOption } from '@/lib/types/hadith';

interface SettingsStore extends IExtendedSettings {
    // Internal state
    _hasHydrated: boolean;
    setHasHydrated: (hasHydrated: boolean) => void;

    // Theme actions
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    cycleColorThemes: () => void;

    // Language actions
    setLanguage: (language: string) => void;
    getAvailableLanguages: () => ILanguageOption[];

    // Font size actions
    setFontSize: (size: 'small' | 'medium' | 'large') => void;
    setArabicFontSize: (size: 'small' | 'medium' | 'large') => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    increaseArabicFontSize: () => void;
    decreaseArabicFontSize: () => void;

    // Reading preferences
    setShowGrades: (show: boolean) => void;
    setShowReferences: (show: boolean) => void;
    setShowArabicNumbers: (show: boolean) => void;
    setAutoScrollToNext: (auto: boolean) => void;

    // Accessibility
    setHighContrast: (enabled: boolean) => void;
    setReducedMotion: (enabled: boolean) => void;

    // App preferences
    setCompactMode: (compact: boolean) => void;
    setShowBookmarks: (show: boolean) => void;
    setEnableNotifications: (enable: boolean) => void;

    // Data management
    updateLastSyncTime: () => void;
    updateCacheSize: (size: number) => void;

    // Reset and backup
    reset: () => void;
    exportSettings: () => string;
    importSettings: (settings: string) => boolean;
}

const defaultSettings: IExtendedSettings = {
    // Theme settings
    theme: 'system',

    // Language settings
    language: 'eng',

    // Font settings
    fontSize: 'medium',
    arabicFontSize: 'medium',

    // Reading preferences
    showGrades: true,
    showReferences: true,
    showArabicNumbers: true,
    autoScrollToNext: false,

    // Accessibility
    highContrast: false,
    reducedMotion: false,

    // App preferences
    compactMode: false,
    showBookmarks: true,
    enableNotifications: true,

    // Data management
    lastSyncTime: 0,
    cacheSize: 0,
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            ...defaultSettings,
            _hasHydrated: false,

            setHasHydrated: (hasHydrated) => {
                set({ _hasHydrated: hasHydrated });
            },

            // Theme actions - REMOVED DOM manipulation from here
            setTheme: (theme) => {
                console.log('useSettings: Setting theme to', theme);
                set({ theme });
                // Theme application is now handled by ThemeProvider
            },

            toggleTheme: () => {
                const { theme } = get();
                const basicThemes: Theme[] = ['light', 'dark', 'system'];
                const currentIndex = basicThemes.indexOf(theme);
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % basicThemes.length;
                get().setTheme(basicThemes[nextIndex]);
            },

            cycleColorThemes: () => {
                const { theme } = get();
                const colorThemes: Theme[] = ['blue', 'emerald', 'purple'];
                const currentIndex = colorThemes.indexOf(theme);
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % colorThemes.length;
                get().setTheme(colorThemes[nextIndex]);
            },

            // Language actions
            setLanguage: (language) => set({ language }),

            getAvailableLanguages: () => [
                { code: 'eng', name: 'English', nativeName: 'English' },
                { code: 'ara', name: 'Arabic', nativeName: 'العربية' },
                { code: 'urd', name: 'Urdu', nativeName: 'اردو' },
                { code: 'tur', name: 'Turkish', nativeName: 'Türkçe' },
                { code: 'ind', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
                { code: 'mal', name: 'Malay', nativeName: 'Bahasa Melayu' },
                { code: 'fra', name: 'French', nativeName: 'Français' },
                { code: 'spa', name: 'Spanish', nativeName: 'Español' },
            ],

            // Font size actions
            setFontSize: (fontSize) => set({ fontSize }),
            setArabicFontSize: (arabicFontSize) => set({ arabicFontSize }),

            increaseFontSize: () => {
                const { fontSize } = get();
                const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
                const currentIndex = sizes.indexOf(fontSize);
                if (currentIndex < sizes.length - 1) {
                    set({ fontSize: sizes[currentIndex + 1] });
                }
            },

            decreaseFontSize: () => {
                const { fontSize } = get();
                const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
                const currentIndex = sizes.indexOf(fontSize);
                if (currentIndex > 0) {
                    set({ fontSize: sizes[currentIndex - 1] });
                }
            },

            increaseArabicFontSize: () => {
                const { arabicFontSize } = get();
                const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
                const currentIndex = sizes.indexOf(arabicFontSize);
                if (currentIndex < sizes.length - 1) {
                    set({ arabicFontSize: sizes[currentIndex + 1] });
                }
            },

            decreaseArabicFontSize: () => {
                const { arabicFontSize } = get();
                const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
                const currentIndex = sizes.indexOf(arabicFontSize);
                if (currentIndex > 0) {
                    set({ arabicFontSize: sizes[currentIndex - 1] });
                }
            },

            // Reading preferences
            setShowGrades: (showGrades) => set({ showGrades }),
            setShowReferences: (showReferences) => set({ showReferences }),
            setShowArabicNumbers: (showArabicNumbers) => set({ showArabicNumbers }),
            setAutoScrollToNext: (autoScrollToNext) => set({ autoScrollToNext }),

            // Accessibility
            setHighContrast: (highContrast) => {
                set({ highContrast });
                if (typeof window !== 'undefined') {
                    requestAnimationFrame(() => {
                        document.documentElement.classList.toggle('high-contrast', highContrast);
                    });
                }
            },

            setReducedMotion: (reducedMotion) => {
                set({ reducedMotion });
                if (typeof window !== 'undefined') {
                    requestAnimationFrame(() => {
                        document.documentElement.classList.toggle('reduced-motion', reducedMotion);
                    });
                }
            },

            // App preferences
            setCompactMode: (compactMode) => set({ compactMode }),
            setShowBookmarks: (showBookmarks) => set({ showBookmarks }),
            setEnableNotifications: (enableNotifications) => set({ enableNotifications }),

            // Data management
            updateLastSyncTime: () => set({ lastSyncTime: Date.now() }),
            updateCacheSize: (cacheSize) => set({ cacheSize }),

            // Reset and backup
            reset: () => {
                set({ ...defaultSettings, _hasHydrated: true });
            },

            exportSettings: () => {
                const settings = get();
                const exportData = {
                    theme: settings.theme,
                    language: settings.language,
                    fontSize: settings.fontSize,
                    arabicFontSize: settings.arabicFontSize,
                    showGrades: settings.showGrades,
                    showReferences: settings.showReferences,
                    showArabicNumbers: settings.showArabicNumbers,
                    autoScrollToNext: settings.autoScrollToNext,
                    highContrast: settings.highContrast,
                    reducedMotion: settings.reducedMotion,
                    compactMode: settings.compactMode,
                    showBookmarks: settings.showBookmarks,
                    enableNotifications: settings.enableNotifications,
                };
                return JSON.stringify(exportData, null, 2);
            },

            importSettings: (settingsJson: string) => {
                try {
                    const importedSettings = JSON.parse(settingsJson);

                    // Validate imported settings
                    const validThemes: Theme[] = ['light', 'dark', 'system', 'blue', 'emerald', 'purple'];
                    const validFontSizes = ['small', 'medium', 'large'];

                    if (!validThemes.includes(importedSettings.theme)) {
                        importedSettings.theme = 'system';
                    }

                    if (!validFontSizes.includes(importedSettings.fontSize)) {
                        importedSettings.fontSize = 'medium';
                    }

                    if (!validFontSizes.includes(importedSettings.arabicFontSize)) {
                        importedSettings.arabicFontSize = 'medium';
                    }

                    // Apply validated settings
                    set((state) => ({
                        ...state,
                        ...importedSettings,
                        _hasHydrated: true,
                    }));

                    return true;
                } catch (error) {
                    console.error('Failed to import settings:', error);
                    return false;
                }
            },
        }),
        {
            name: 'hadith-settings',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);

// Custom hook with hydration check
export const useSettings = () => {
    const store = useSettingsStore();
    const { _hasHydrated } = store;

    // Return store but prevent usage before hydration
    return _hasHydrated ? store : { ...defaultSettings, ...store, _hasHydrated };
};