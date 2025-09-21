'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallState {
    isInstallable: boolean;
    isInstalled: boolean;
    isInstalling: boolean;
    installPrompt: BeforeInstallPromptEvent | null;
    canInstall: boolean;
    isIOSSafari: boolean;
    isAndroid: boolean;
    isDesktop: boolean;
    browserName: string;
}

interface BeforeInstallPromptEvent extends Event {
    platforms: string[];
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
    standalone?: boolean;
}

export function usePWAInstall() {
    const [state, setState] = useState<PWAInstallState>({
        isInstallable: false,
        isInstalled: false,
        isInstalling: false,
        installPrompt: null,
        canInstall: false,
        isIOSSafari: false,
        isAndroid: false,
        isDesktop: false,
        browserName: 'Unknown',
    });

    // Enhanced browser detection
    const detectBrowser = useCallback(() => {
        if (typeof navigator === 'undefined') return {
            isIOSSafari: false,
            isAndroid: false,
            isDesktop: false,
            browserName: 'Unknown'
        };

        const userAgent = navigator.userAgent;

        // iOS Safari detection
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(userAgent);
        const isIOSSafari = isIOS && isSafari;

        // Android detection
        const isAndroid = /Android/.test(userAgent);

        // Desktop detection
        const isDesktop = !isIOS && !isAndroid;

        // Browser name detection
        let browserName = 'Unknown';
        if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
            browserName = 'Chrome';
        } else if (/Firefox/.test(userAgent)) {
            browserName = 'Firefox';
        } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
            browserName = 'Safari';
        } else if (/Edge/.test(userAgent)) {
            browserName = 'Edge';
        } else if (/Opera|OPR/.test(userAgent)) {
            browserName = 'Opera';
        }

        return { isIOSSafari, isAndroid, isDesktop, browserName };
    }, []);

    // More accurate installation detection
    const checkIfInstalled = useCallback(() => {
        if (typeof window === 'undefined') return false;

        // Check if running in standalone mode (actually installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // iOS Safari standalone check
        const isIOSStandalone = (window.navigator as NavigatorWithStandalone).standalone === true;

        // Android installed app check
        const isAndroidApp = document.referrer.includes('android-app://');

        // Additional check: if URL contains utm_source=web_app_manifest
        const isFromManifest = window.location.search.includes('utm_source=web_app_manifest');

        console.log('Installation detection:', {
            isStandalone,
            isIOSStandalone,
            isAndroidApp,
            isFromManifest,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            referrer: document.referrer
        });

        return isStandalone || isIOSStandalone || isAndroidApp || isFromManifest;
    }, []);

    // Enhanced installation criteria check
    const checkInstallationCriteria = useCallback(async () => {
        if (typeof window === 'undefined') return false;

        try {
            // Check if service worker is registered
            const swRegistration = await navigator.serviceWorker?.getRegistration();
            const hasServiceWorker = !!swRegistration;

            // Check if manifest is accessible
            const manifestResponse = await fetch('/manifest.json').catch(() => null);
            const hasManifest = manifestResponse?.ok;

            // Check if HTTPS (or localhost)
            const isSecure = window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            // Check if not already installed
            const notInstalled = !checkIfInstalled();

            console.log('PWA Installation Criteria:', {
                hasServiceWorker,
                hasManifest,
                isSecure,
                notInstalled,
                userAgent: navigator.userAgent
            });

            return hasServiceWorker && hasManifest && isSecure && notInstalled;
        } catch (error) {
            console.error('Error checking installation criteria:', error);
            return false;
        }
    }, [checkIfInstalled]);

    const installPWA = useCallback(async () => {
        console.log('Install PWA triggered for:', state.browserName);
        console.log('Has install prompt:', !!state.installPrompt);

        // Priority 1: Use native install prompt if available
        if (state.installPrompt) {
            setState(prev => ({ ...prev, isInstalling: true }));

            try {
                await state.installPrompt.prompt();
                const choiceResult = await state.installPrompt.userChoice;

                console.log('User installation choice:', choiceResult.outcome);

                if (choiceResult.outcome === 'accepted') {
                    setState(prev => ({
                        ...prev,
                        isInstalled: true,
                        isInstallable: false,
                        canInstall: false,
                        installPrompt: null,
                        isInstalling: false,
                    }));
                    return true;
                } else {
                    setState(prev => ({ ...prev, isInstalling: false }));
                    return false;
                }
            } catch (error) {
                console.error('Installation error:', error);
                setState(prev => ({ ...prev, isInstalling: false }));
                return false;
            }
        }

        // Priority 2: iOS Safari manual instructions
        if (state.isIOSSafari) {
            console.log('iOS Safari - showing manual install instructions');
            return 'ios-instructions';
        }

        // Priority 3: Other browsers - show manual instructions
        if (state.isAndroid || state.isDesktop) {
            console.log('No native prompt available, showing manual instructions');
            return 'manual-install';
        }

        // Fallback
        console.warn('Install not supported on this platform');
        return false;
    }, [state]);

    // Force refresh installation status
    const refreshInstallStatus = useCallback(() => {
        const browserInfo = detectBrowser();
        const isInstalled = checkIfInstalled();

        console.log('Refreshing install status:', { isInstalled, browserInfo });

        setState(prev => ({
            ...prev,
            ...browserInfo,
            isInstalled,
            canInstall: !isInstalled && (prev.isInstallable || prev.isIOSSafari)
        }));
    }, [detectBrowser, checkIfInstalled]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        console.log('PWA Hook: Initializing...');

        const browserInfo = detectBrowser();
        const isInstalled = checkIfInstalled();

        console.log('Initial state:', { browserInfo, isInstalled });

        setState(prev => ({
            ...prev,
            ...browserInfo,
            isInstalled,
            canInstall: !isInstalled
        }));

        if (isInstalled) return;

        let deferredPrompt: BeforeInstallPromptEvent | null = null;

        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('beforeinstallprompt event received - native install available!');
            e.preventDefault();

            const installEvent = e as BeforeInstallPromptEvent;
            deferredPrompt = installEvent;

            setState(prev => ({
                ...prev,
                isInstallable: true,
                installPrompt: installEvent,
                canInstall: !prev.isInstalled,
            }));
        };

        const handleAppInstalled = () => {
            console.log('App installed successfully');
            setState(prev => ({
                ...prev,
                isInstalled: true,
                isInstallable: false,
                canInstall: false,
                installPrompt: null,
                isInstalling: false,
            }));
            deferredPrompt = null;
        };

        // Listen for display mode changes (when app is actually installed)
        const handleDisplayModeChange = () => {
            console.log('Display mode changed, checking install status...');
            setTimeout(refreshInstallStatus, 1000); // Delay to ensure state has updated
        };

        // Add event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Listen for display mode changes
        const displayModeQuery = window.matchMedia('(display-mode: standalone)');
        displayModeQuery.addListener(handleDisplayModeChange);

        // Check installation criteria and enable install options
        checkInstallationCriteria().then(meetsCriteria => {
            if (meetsCriteria && !isInstalled) {
                console.log('PWA installation criteria met');
                setState(prev => ({
                    ...prev,
                    isInstallable: true,
                    canInstall: true,
                }));
            }
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            displayModeQuery.removeListener(handleDisplayModeChange);
        };
    }, [detectBrowser, checkIfInstalled, checkInstallationCriteria, refreshInstallStatus]);

    const getDebugInfo = useCallback(() => ({
        ...state,
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        serviceWorkerSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        displayMode: typeof window !== 'undefined' ?
            (window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser') : 'N/A',
        standaloneIOS: typeof window !== 'undefined' ? (window.navigator as NavigatorWithStandalone).standalone : false,
        referrer: typeof document !== 'undefined' ? document.referrer : 'N/A',
        timestamp: new Date().toISOString(),
    }), [state]);

    // Manual reset function for development/testing
    const resetInstallState = useCallback(() => {
        console.log('Manually resetting install state');
        setState(prev => ({
            ...prev,
            isInstalled: false,
            canInstall: true,
            isInstallable: true,
        }));
    }, []);

    return {
        ...state,
        installPWA,
        refreshInstallStatus,
        resetInstallState, // For development/testing
        getDebugInfo,
    };
}