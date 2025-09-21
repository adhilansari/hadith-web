'use client';

import { X, Settings, Book, Palette, Type, Download, Smartphone, Share, Monitor, Chrome, Globe, RefreshCw, Bug, Zap, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const [isClient, setIsClient] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [showManualInstructions, setShowManualInstructions] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const settings = useSettings();
    const pwa = usePWAInstall();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        fontSize,
        arabicFontSize,
        setFontSize,
        setArabicFontSize,
        _hasHydrated,
    } = settings;

    const { theme, setTheme, getAllThemes } = useTheme();

    // Get all available themes with enhanced metadata
    const availableThemes = getAllThemes();

    // Group themes for better organization
    const basicThemes = availableThemes.filter(t => ['light', 'dark', 'system'].includes(t.key));
    const colorThemes = availableThemes.filter(t => !['light', 'dark', 'system'].includes(t.key));

    const fontSizes = [
        { key: 'small', label: 'Small' },
        { key: 'medium', label: 'Medium' },
        { key: 'large', label: 'Large' },
    ];

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

    const handlePWAInstall = useCallback(async () => {
        const result = await pwa.installPWA();

        if (result === 'ios-instructions') {
            setShowIOSInstructions(true);
        } else if (result === 'manual-install') {
            setShowManualInstructions(true);
        } else if (result === true) {
            // Refresh status after successful install
            setTimeout(() => pwa.refreshInstallStatus(), 2000);
        }
    }, [pwa]);

    const shouldShowInstallOption = () => {
        console.log('Should show install?', {
            isInstalled: pwa.isInstalled,
            canInstall: pwa.canInstall,
            isIOSSafari: pwa.isIOSSafari,
            hasPrompt: !!pwa.installPrompt
        });
        return !pwa.isInstalled && (pwa.canInstall || pwa.isIOSSafari);
    };

    const getBrowserIcon = (browser: string) => {
        switch (browser.toLowerCase()) {
            case 'chrome': return <Chrome className="w-4 h-4" />;
            case 'firefox': return <Globe className="w-4 h-4" />;
            case 'safari': return <Globe className="w-4 h-4" />;
            case 'edge': return <Globe className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const getInstallButtonText = () => {
        if (pwa.isInstalling) return 'Installing...';
        if (pwa.installPrompt) return 'Install Now'; // Native prompt available
        return 'Install App'; // Manual install
    };

    if (!isClient || !_hasHydrated || !open) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose} />

            <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                        </div>
                        <div className="flex gap-2">
                            {process.env.NODE_ENV === 'development' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDebug(!showDebug)}
                                    title="Toggle Debug"
                                >
                                    <Bug className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">

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

                        {/* Font Settings */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Type className="w-4 h-4 text-primary" />
                                <h3 className="font-medium">Font Size</h3>
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
                                                onClick={() => setFontSize(key as 'small' | 'medium' | 'large')}
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
                                                onClick={() => setArabicFontSize(key as 'small' | 'medium' | 'large')}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Debug Panel */}
                        {showDebug && process.env.NODE_ENV === 'development' && (
                            <Card className="border-yellow-500/20 bg-yellow-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bug className="w-4 h-4 text-yellow-500" />
                                    <h3 className="font-medium text-yellow-600">PWA Debug</h3>
                                </div>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                                    <div>Is Installed: {pwa.isInstalled ? '✅' : '❌'}</div>
                                    <div>Can Install: {pwa.canInstall ? '✅' : '❌'}</div>
                                    <div>Is Installable: {pwa.isInstallable ? '✅' : '❌'}</div>
                                    <div>Has Native Prompt: {pwa.installPrompt ? '✅' : '❌'}</div>
                                    <div>Browser: {pwa.browserName}</div>
                                    <div>iOS Safari: {pwa.isIOSSafari ? '✅' : '❌'}</div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={pwa.refreshInstallStatus}
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs flex-1"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Refresh
                                    </Button>
                                    <Button
                                        onClick={pwa.resetInstallState}
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs flex-1"
                                    >
                                        Reset State
                                    </Button>
                                </div>
                                <Button
                                    onClick={() => console.log('PWA Debug:', pwa.getDebugInfo())}
                                    size="sm"
                                    variant="ghost"
                                    className="w-full mt-2 text-xs"
                                >
                                    Log Debug Info
                                </Button>
                            </Card>
                        )}

                        {/* PWA Install Section */}
                        {shouldShowInstallOption() && !showIOSInstructions && !showManualInstructions && (
                            <Card className="border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-2 mb-3">
                                    {pwa.installPrompt ? (
                                        <Zap className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Smartphone className="w-4 h-4 text-primary" />
                                    )}
                                    <h3 className="font-medium">Install App</h3>
                                    {pwa.installPrompt && (
                                        <div className="ml-auto">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Quick Install
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {pwa.installPrompt
                                        ? 'Install Hadith.net with one click for the best experience.'
                                        : 'Install Hadith.net for offline access and better performance.'
                                    }
                                </p>
                                {/* <div className="flex items-center gap-2 mb-3">
                                    {getBrowserIcon(pwa.browserName)}
                                    <span className="text-xs text-muted-foreground">
                                        {pwa.browserName} on {pwa.isAndroid ? 'Android' : pwa.isIOSSafari ? 'iOS' : 'Desktop'}
                                    </span>
                                    {pwa.installPrompt && (
                                        <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                                            Native Install Ready
                                        </span>
                                    )}
                                </div> */}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handlePWAInstall}
                                    disabled={pwa.isInstalling}
                                    className="w-full"
                                >
                                    {pwa.installPrompt && !pwa.isInstalling && (
                                        <Zap className="w-4 h-4 mr-2" />
                                    )}
                                    {/* {!pwa.installPrompt && !pwa.isInstalling && (
                                        <Download className="w-4 h-4 mr-2" />
                                    )} */}
                                    {getInstallButtonText()}
                                </Button>
                            </Card>
                        )}

                        {/* iOS Install Instructions */}
                        {showIOSInstructions && (
                            <Card className="border-blue-500/20 bg-blue-500/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Share className="w-4 h-4 text-blue-500" />
                                        <h3 className="font-medium">Install on iOS Safari</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowIOSInstructions(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Tap the Share button at the bottom of Safari</li>
                                        <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                                        <li>Tap &quot;Add&quot; to install Hadith.net</li>
                                        <li>Find the app icon on your home screen</li>
                                    </ol>
                                </div>
                            </Card>
                        )}

                        {/* Manual Install Instructions */}
                        {showManualInstructions && (
                            <Card className="border-yellow-500/20 bg-yellow-500/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getBrowserIcon(pwa.browserName)}
                                        <h3 className="font-medium">Install in {pwa.browserName}</h3>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowManualInstructions(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400 space-y-2">
                                    {pwa.browserName === 'Chrome' && (
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Click the three dots menu (⋮) in Chrome</li>
                                            <li>Select &quot;Install Hadith.net...&quot; or look for install icon in address bar</li>
                                            <li>Click &quot;Install&quot; in the popup</li>
                                        </ol>
                                    )}
                                    {pwa.browserName === 'Firefox' && (
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Look for the install icon in the address bar</li>
                                            <li>Click it and select &quot;Install&quot;</li>
                                            <li>Or use the three lines menu → &quot;Install this site as an app&quot;</li>
                                        </ol>
                                    )}
                                    {pwa.browserName === 'Edge' && (
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Click the three dots menu (⋯) in Edge</li>
                                            <li>Select &quot;Apps&quot; → &quot;Install this site as an app&quot;</li>
                                            <li>Click &quot;Install&quot; in the popup</li>
                                        </ol>
                                    )}
                                    {!['Chrome', 'Firefox', 'Edge'].includes(pwa.browserName) && (
                                        <p>Look for an install option in your browser&apos;s menu or address bar.</p>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Already Installed */}
                        {pwa.isInstalled && (
                            <Card className="border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Download className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-medium text-emerald-600 dark:text-emerald-400">App Installed</h3>
                                </div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    Hadith.net is installed and works offline. Access it from your home screen or app launcher.
                                </p>
                            </Card>
                        )}

                        <Card>
                            <div className="flex items-center gap-2 mb-2">
                                <Book className="w-4 h-4 text-primary" />
                                <h3 className="font-medium">About</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Modern PWA for authentic Hadith collections with translations.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}