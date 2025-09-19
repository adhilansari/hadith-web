'use client';

import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
    const { theme, setTheme } = useSettings();

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes first
        root.classList.remove('light', 'dark', 'theme-blue', 'theme-emerald', 'theme-purple');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else if (theme === 'light' || theme === 'dark') {
            root.classList.add(theme);
        } else if (theme === 'blue' || theme === 'emerald' || theme === 'purple') {
            // For colored themes, apply dark mode AND the specific theme class
            root.classList.add('dark', `theme-${theme}`);
        }

        // Set meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            let themeColor = '#ffffff'; // default light

            if (theme === 'dark' || theme === 'blue' || theme === 'emerald' || theme === 'purple') {
                themeColor = '#0f172a'; // dark background
            } else if (theme === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeColor = isDark ? '#0f172a' : '#ffffff';
            }

            metaThemeColor.setAttribute('content', themeColor);
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        const themes = ['light', 'dark', 'system'] as const;
        const currentIndex = themes.indexOf(theme as any);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const cycleColorThemes = () => {
        const colorThemes = ['blue', 'emerald', 'purple'] as const;
        const currentIndex = colorThemes.indexOf(theme as any);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % colorThemes.length;
        setTheme(colorThemes[nextIndex]);
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        cycleColorThemes,
    };
}