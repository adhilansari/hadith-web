'use client';

import { useEffect, useState } from 'react';
import { useSettings } from './useSettings';
import type { Theme } from '@/lib/types/hadith';

// Theme configuration with metadata
const THEME_CONFIG = {
    light: { label: 'Light', baseClass: 'light', isDark: false, metaColor: '#ffffff' },
    dark: { label: 'Dark', baseClass: 'dark', isDark: true, metaColor: '#0f172a' },
    system: { label: 'System', baseClass: 'system', isDark: null, metaColor: null },
    blue: { label: 'Ocean Blue', baseClass: 'theme-blue', isDark: null, metaColor: { light: '#f0f6ff', dark: '#0c1429' } },
    emerald: { label: 'Forest Green', baseClass: 'theme-emerald', isDark: null, metaColor: { light: '#f0fdf9', dark: '#022c0b' } },
    purple: { label: 'Royal Purple', baseClass: 'theme-purple', isDark: null, metaColor: { light: '#faf5ff', dark: '#140a2e' } },
    orange: { label: 'Warm Sunset', baseClass: 'theme-orange', isDark: null, metaColor: { light: '#fff7ed', dark: '#2d1509' } },
    rose: { label: 'Rose Garden', baseClass: 'theme-rose', isDark: null, metaColor: { light: '#fff1f2', dark: '#2d0920' } },
    teal: { label: 'Ocean Teal', baseClass: 'theme-teal', isDark: null, metaColor: { light: '#f0fdfa', dark: '#0a2622' } },
} as const;

export function useTheme() {
    const { theme, setTheme } = useSettings();
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    // Apply theme to document (runs only in browser)
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const root = document.documentElement;
        const config = THEME_CONFIG[theme];
        if (!config) return;

        // Remove all existing theme classes
        const allClasses = ['light', 'dark', 'theme-blue', 'theme-emerald', 'theme-purple', 'theme-orange', 'theme-rose', 'theme-teal'];
        root.classList.remove(...allClasses);

        // Handle system theme
        if (theme === 'system') {
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(systemIsDark ? 'dark' : 'light');
            updateMetaThemeColor(systemIsDark ? '#0f172a' : '#ffffff');
            setIsDarkTheme(systemIsDark);
            return;
        }

        // Handle basic light/dark themes
        if (theme === 'light' || theme === 'dark') {
            root.classList.add(theme);
            if (config.metaColor && typeof config.metaColor === 'string') {
                updateMetaThemeColor(config.metaColor);
            }
            setIsDarkTheme(config.isDark ?? false);
            return;
        }

        // Handle color themes (with dark/light support)
        const colorThemes = ['blue', 'emerald', 'purple', 'orange', 'rose', 'teal'];
        if (colorThemes.includes(theme)) {
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const useDarkMode = systemIsDark;

            root.classList.add(config.baseClass);
            if (useDarkMode) root.classList.add('dark');

            if (config.metaColor && typeof config.metaColor === 'object') {
                const metaColor = useDarkMode ? config.metaColor.dark : config.metaColor.light;
                updateMetaThemeColor(metaColor);
            }
            setIsDarkTheme(useDarkMode);
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
            updateMetaThemeColor(e.matches ? '#0f172a' : '#ffffff');
            setIsDarkTheme(e.matches);
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, [theme]);

    // Update meta theme-color for mobile browsers and PWA
    const updateMetaThemeColor = (color: string) => {
        if (typeof document === 'undefined') return;

        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute('content', color);

        let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!appleStatusBar) {
            appleStatusBar = document.createElement('meta');
            appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
            document.head.appendChild(appleStatusBar);
        }
        const isDarkColor = color !== '#ffffff';
        appleStatusBar.setAttribute('content', isDarkColor ? 'black-translucent' : 'default');
    };

    // Get all available themes
    const getAllThemes = () =>
        Object.entries(THEME_CONFIG).map(([key, config]) => ({
            key: key as Theme,
            ...config,
        }));

    // Get themed colors for components
    const getThemedColors = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return {
                primary: '',
                primaryForeground: '',
                background: '',
                foreground: '',
                muted: '',
                mutedForeground: '',
                accent: '',
                border: '',
            };
        }
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        return {
            primary: computedStyle.getPropertyValue('--primary').trim(),
            primaryForeground: computedStyle.getPropertyValue('--primary-foreground').trim(),
            background: computedStyle.getPropertyValue('--background').trim(),
            foreground: computedStyle.getPropertyValue('--foreground').trim(),
            muted: computedStyle.getPropertyValue('--muted').trim(),
            mutedForeground: computedStyle.getPropertyValue('--muted-foreground').trim(),
            accent: computedStyle.getPropertyValue('--accent').trim(),
            border: computedStyle.getPropertyValue('--border').trim(),
        };
    };

    // Theme switching methods
    const toggleBasicTheme = () => {
        const basicThemes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = basicThemes.indexOf(theme);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % basicThemes.length;
        setTheme(basicThemes[nextIndex]);
    };

    const cycleColorThemes = () => {
        const colorThemes: Theme[] = ['blue', 'emerald', 'purple', 'orange', 'rose', 'teal'];
        const currentIndex = colorThemes.indexOf(theme);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % colorThemes.length;
        setTheme(colorThemes[nextIndex]);
    };

    const cycleAllThemes = () => {
        const allThemes = Object.keys(THEME_CONFIG) as Theme[];
        const currentIndex = allThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % allThemes.length;
        setTheme(allThemes[nextIndex]);
    };

    const getFeatureCardVariant = () => {
        switch (theme) {
            case 'blue':
                return 'feature-card-blue';
            case 'emerald':
                return 'feature-card-emerald';
            case 'purple':
                return 'feature-card-purple';
            default:
                return 'feature-card-blue'; // default fallback
        }
    };

    return {
        theme,
        setTheme,
        themeConfig: THEME_CONFIG[theme],
        isDarkTheme,
        getAllThemes,
        getThemedColors,
        getFeatureCardVariant,
        toggleBasicTheme,
        cycleColorThemes,
        cycleAllThemes,
    };
}
