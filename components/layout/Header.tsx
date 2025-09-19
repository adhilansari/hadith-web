// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { Menu, Settings, Search, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/lib/hooks/useSettings';
import { Sidebar } from './Sidebar';

export function Header() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme, toggleTheme, cycleColorThemes } = useSettings();

    const themeIcons = {
        light: <Sun className="w-5 h-5" />,
        dark: <Moon className="w-5 h-5" />,
        system: <Monitor className="w-5 h-5" />,
        blue: <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />,
        emerald: <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />,
        purple: <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800" />,
    };

    const handleThemeToggle = () => {
        // If it's a color theme, cycle through color themes
        if (theme === 'blue' || theme === 'emerald' || theme === 'purple') {
            cycleColorThemes();
        } else {
            // Otherwise toggle between light/dark/system
            toggleTheme();
        }
    };

    // Double-click to switch between basic themes and color themes
    const handleThemeDoubleClick = () => {
        const isColorTheme = ['blue', 'emerald', 'purple'].includes(theme);
        if (isColorTheme) {
            setTheme('system');
        } else {
            setTheme('blue');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border glassmorphism">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>

                            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                                Hadith.net
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Search className="w-5 h-5" />
                            </Button>

                            {/* Theme Toggle Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleThemeToggle}
                                onDoubleClick={handleThemeDoubleClick}
                                title={`Current theme: ${theme}. Click to cycle, double-click to switch between basic/color themes`}
                                className="relative"
                            >
                                {themeIcons[theme] || themeIcons.system}
                                {/* Small indicator for color themes */}
                                {(theme === 'blue' || theme === 'emerald' || theme === 'purple') && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary opacity-80" />
                                )}
                            </Button>

                            {/* Quick Color Theme Switcher */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cycleColorThemes}
                                title="Cycle color themes"
                                className="hidden sm:flex"
                            >
                                <Palette className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
    );
}