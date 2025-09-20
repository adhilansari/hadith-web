// components/layout/Sidebar.tsx (Enhanced with new theme system)
'use client';

import { X, Settings, Book, Languages, Palette, Type, Moon, Sun, Monitor, Download, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { useTheme } from '@/lib/hooks/useTheme';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';
import { useCallback, useEffect, useState } from 'react';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const [isClient, setIsClient] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const settings = useSettings();
    const pwa = usePWAInstall();
    const { theme, setTheme, getAllThemes } = useTheme();

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        language,
        fontSize,
        arabicFontSize,
        setLanguage,
        setFontSize,
        setArabicFontSize,
        _hasHydrated
    } = settings;

    // Get all available themes with enhanced metadata
    const availableThemes = getAllThemes();

    // Group themes for better organization
    const basicThemes = availableThemes.filter(t => ['light', 'dark', 'system'].includes(t.key));
    const colorThemes = availableThemes.filter(t => !['light', 'dark', 'system'].includes(t.key));

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

    const handlePWAInstall = useCallback(async () => {
        // Check if it's iOS Safari
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !('MSStream' in window);

        if (isIOSSafari) {
            setShowIOSInstructions(true);
            return;
        }

        // For other browsers, use the standard install prompt
        const installed = await pwa.installPWA();
        if (installed) {
            console.log('App installed successfully!');
        }
    }, [pwa]);

    // Check if device is iOS
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Get theme icon
    const getThemeIcon = (themeKey: string) => {
        switch (themeKey) {
            case 'light':
                return <Sun className="w-4 h-4" />;
            case 'dark':
                return <Moon className="w-4 h-4" />;
            case 'system':
                return <Monitor className="w-4 h-4" />;
            case 'blue':
                return <div className="w-4 h-4 rounded-full bg-blue-500" />;
            case 'emerald':
                return <div className="w-4 h-4 rounded-full bg-emerald-500" />;
            case 'purple':
                return <div className="w-4 h-4 rounded-full bg-purple-500" />;
            case 'orange':
                return <div className="w-4 h-4 rounded-full bg-orange-500" />;
            case 'rose':
                return <div className="w-4 h-4 rounded-full bg-rose-500" />;
            case 'teal':
                return <div className="w-4 h-4 rounded-full bg-teal-500" />;
            default:
                return <Palette className="w-4 h-4" />;
        }
    };

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
            <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">

                        {/* PWA Install Section */}
                        {(pwa.canInstall || (!pwa.isInstalled && isIOS)) && !showIOSInstructions && (
                            <Card className="border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                    <h3 className="font-medium text-foreground">Install App</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Install Hadith.net as an app for a better experience with offline access.
                                </p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handlePWAInstall}
                                    disabled={pwa.isInstalling}
                                    className="w-full"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {pwa.isInstalling ? 'Installing...' : isIOS ? 'Install Instructions' : 'Install App'}
                                </Button>
                            </Card>
                        )}

                        {/* iOS Install Instructions */}
                        {showIOSInstructions && (
                            <Card className="border-blue-500/20 bg-blue-500/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Share className="w-4 h-4 text-blue-500" />
                                        <h3 className="font-medium text-foreground">Install on iOS</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowIOSInstructions(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                                    <p className="font-medium">To install this app on your iPhone/iPad:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Tap the <Share className="w-3 h-3 inline mx-1" /> share button in Safari</li>
                                        <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                                        <li>Tap &quot;Add&quot; to install the app</li>
                                    </ol>
                                </div>
                            </Card>
                        )}

                        {/* Already Installed Message */}
                        {pwa.isInstalled && (
                            <Card className="border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Download className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-medium text-emerald-600 dark:text-emerald-400">App Installed</h3>
                                </div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    Hadith.net is installed on your device. You can access it from your home screen.
                                </p>
                            </Card>
                        )}

                        {/* Theme Selection */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-4 h-4 text-primary" />
                                <h3 className="font-medium text-foreground">Theme</h3>
                            </div>

                            {/* Basic Themes */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Basic Themes</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {basicThemes.map((themeItem) => (
                                        <Button
                                            key={themeItem.key}
                                            variant={theme === themeItem.key ? 'primary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setTheme(themeItem.key)}
                                            className="flex-col gap-1 h-auto py-2"
                                        >
                                            {getThemeIcon(themeItem.key)}
                                            <span className="text-xs">{themeItem.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Themes */}
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Color Themes</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {colorThemes.map((themeItem) => (
                                        <Button
                                            key={themeItem.key}
                                            variant={theme === themeItem.key ? 'primary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setTheme(themeItem.key)}
                                            className="justify-start gap-2 h-10"
                                        >
                                            {getThemeIcon(themeItem.key)}
                                            <span className="text-xs">{themeItem.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Language Selection */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Languages className="w-4 h-4 text-primary" />
                                <h3 className="font-medium text-foreground">Translation Language</h3>
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
                                <Type className="w-4 h-4 text-primary" />
                                <h3 className="font-medium text-foreground">Font Size</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm text-muted-foreground mb-2">Translation Text</h4>
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
                                    <h4 className="text-sm text-muted-foreground mb-2">Arabic Text</h4>
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
                        <Card className="glassmorphism">
                            <div className="flex items-center gap-2 mb-2">
                                <Book className="w-4 h-4 text-primary" />
                                <h3 className="font-medium text-foreground">About Hadith.net</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                A modern, responsive PWA for reading authentic Hadith collections with translations.
                                Built with Next.js 15 and Tailwind CSS v4.
                            </p>
                            <div className="mt-3 text-xs text-muted-foreground">
                                Version 1.0.0
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}