// components/layout/Sidebar.tsx (Fixed version)
'use client';

import { X, Settings, Book, Languages, Palette, Type, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '@/lib/types/hadith';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const [isClient, setIsClient] = useState(false);
    const settings = useSettings();

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        theme,
        language,
        fontSize,
        arabicFontSize,
        setTheme,
        setLanguage,
        setFontSize,
        setArabicFontSize,
        _hasHydrated
    } = settings;

    const themes: { key: Theme; label: string; icon: React.ReactNode }[] = [
        { key: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
        { key: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
        { key: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
        { key: 'blue', label: 'Ocean Blue', icon: <div className="w-4 h-4 rounded-full bg-blue-500" /> },
        { key: 'emerald', label: 'Forest Green', icon: <div className="w-4 h-4 rounded-full bg-emerald-500" /> },
        { key: 'purple', label: 'Royal Purple', icon: <div className="w-4 h-4 rounded-full bg-purple-500" /> },
    ];

    const languages = [
        { code: 'eng', name: 'English' },
        { code: 'ara', name: 'العربية' },
        // { code: 'urd', name: 'اردو' },
        // { code: 'tur', name: 'Türkçe' },
        // { code: 'ind', name: 'Indonesia' },
    ];

    const fontSizes = [
        { key: 'small', label: 'Small' },
        { key: 'medium', label: 'Medium' },
        { key: 'large', label: 'Large' },
    ];

    // Memoized handlers to prevent unnecessary re-renders
    const handleThemeChange = useCallback((newTheme: Theme) => {
        console.log('Theme changing to:', newTheme);
        setTheme(newTheme);
    }, [setTheme]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        console.log('Language changing to:', newLanguage);
        setLanguage(newLanguage);
    }, [setLanguage]);

    const handleFontSizeChange = useCallback((newSize: 'small' | 'medium' | 'large') => {
        console.log('Font size changing to:', newSize);
        setFontSize(newSize);
    }, [setFontSize]);

    const handleArabicFontSizeChange = useCallback((newSize: 'small' | 'medium' | 'large') => {
        console.log('Arabic font size changing to:', newSize);
        setArabicFontSize(newSize);
    }, [setArabicFontSize]);

    // Don't render until hydrated and on client
    if (!isClient || !_hasHydrated) {
        return null;
    }

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary-500" />
                            <h2 className="text-lg font-semibold">Settings</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Current Settings Debug */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-500 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                <div>Theme: {theme}</div>
                                <div>Language: {language}</div>
                                <div>Font Size: {fontSize}</div>
                                <div>Arabic Font: {arabicFontSize}</div>
                                <div>Hydrated: {_hasHydrated ? 'Yes' : 'No'}</div>
                            </div>
                        )}

                        {/* Theme Selection */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-4 h-4 text-primary-500" />
                                <h3 className="font-medium">Theme</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {themes.map(({ key, label, icon }) => (
                                    <Button
                                        key={key}
                                        variant={theme === key ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleThemeChange(key)}
                                        className="justify-start gap-2 h-10"
                                    >
                                        {icon}
                                        <span className="text-xs">{label}</span>
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* Language Selection */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Languages className="w-4 h-4 text-primary-500" />
                                <h3 className="font-medium">Translation Language</h3>
                            </div>
                            <div className="space-y-2">
                                {languages.map(({ code, name }) => (
                                    <Button
                                        key={code}
                                        variant={language === code ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleLanguageChange(code)}
                                        className="w-full justify-start"
                                    >
                                        {name}
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* Font Size Settings */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Type className="w-4 h-4 text-primary-500" />
                                <h3 className="font-medium">Font Size</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Translation Text</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {fontSizes.map(({ key, label }) => (
                                            <Button
                                                key={key}
                                                variant={fontSize === key ? 'primary' : 'ghost'}
                                                size="sm"
                                                onClick={() => handleFontSizeChange(key as 'small' | 'medium' | 'large')}
                                                className="text-xs"
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Arabic Text</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {fontSizes.map(({ key, label }) => (
                                            <Button
                                                key={key}
                                                variant={arabicFontSize === key ? 'primary' : 'ghost'}
                                                size="sm"
                                                onClick={() => handleArabicFontSizeChange(key as 'small' | 'medium' | 'large')}
                                                className="text-xs"
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* App Info */}
                        <Card variant="glass">
                            <div className="flex items-center gap-2 mb-2">
                                <Book className="w-4 h-4 text-primary-500" />
                                <h3 className="font-medium">About Hadith.net</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                A modern, responsive PWA for reading authentic Hadith collections with translations.
                                Built with Next.js 15 and Tailwind CSS v4.
                            </p>
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                                Version 1.0.0
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}