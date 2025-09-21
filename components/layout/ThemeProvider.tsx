// components/layout/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/hooks/useSettings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, _hasHydrated } = useSettings();

    useEffect(() => {
        // Only apply theme changes after hydration is complete
        if (!_hasHydrated) return;

        const root = window.document.documentElement;

        // Remove all theme classes first
        root.classList.remove('light', 'dark', 'theme-blue', 'theme-emerald', 'theme-purple');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else if (theme === 'light' || theme === 'dark') {
            root.classList.add(theme);
        } else if (theme === 'blue' || theme === 'emerald' || theme === 'purple') {
            // For colored themes, apply dark mode and theme class
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
    }, [theme, _hasHydrated]);

    // Listen for system theme changes only when theme is 'system'
    useEffect(() => {
        if (!_hasHydrated || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, _hasHydrated]);

    return <>{children}</>;
}