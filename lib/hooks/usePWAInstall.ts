// lib/hooks/usePWAInstall.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallState {
    isInstallable: boolean;
    isInstalled: boolean;
    isInstalling: boolean;
    installPrompt: BeforeInstallPromptEvent | null;
}

interface BeforeInstallPromptEvent extends Event {
    platforms: string[];
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export function usePWAInstall() {
    const [state, setState] = useState<PWAInstallState>({
        isInstallable: false,
        isInstalled: false,
        isInstalling: false,
        installPrompt: null,
    });

    const checkIfInstalled = useCallback(() => {
        if (typeof window === 'undefined') return false;

        // Check for standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as NavigatorWithStandalone).standalone === true ||
            document.referrer.includes('android-app://');

        return isStandalone;
    }, []);

    interface NavigatorWithStandalone extends Navigator {
        standalone?: boolean;
    }

    const installPWA = useCallback(async () => {
        console.log('InstallPWA called, prompt available:', !!state.installPrompt);

        if (!state.installPrompt) {
            console.warn('Install prompt not available');
            return false;
        }

        setState(prev => ({ ...prev, isInstalling: true }));

        try {
            await state.installPrompt.prompt();
            const choiceResult = await state.installPrompt.userChoice;
            console.log('User choice:', choiceResult);

            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installation accepted');
                setState(prev => ({
                    ...prev,
                    isInstalled: true,
                    isInstallable: false,
                    installPrompt: null,
                    isInstalling: false,
                }));
                return true;
            } else {
                console.log('PWA installation dismissed');
                setState(prev => ({ ...prev, isInstalling: false }));
                return false;
            }
        } catch (error) {
            console.error('Error during PWA installation:', error);
            setState(prev => ({ ...prev, isInstalling: false }));
            return false;
        }
    }, [state.installPrompt]);

    const dismissInstall = useCallback(() => {
        setState(prev => ({
            ...prev,
            isInstallable: false,
            installPrompt: null,
        }));
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        console.log('PWA Hook: Initializing...');

        const isInstalled = checkIfInstalled();
        console.log('Is app installed?', isInstalled);

        if (isInstalled) {
            setState(prev => ({ ...prev, isInstalled: true }));
            return;
        }

        let deferredPrompt: BeforeInstallPromptEvent | null = null;

        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            console.log('beforeinstallprompt event fired!');
            e.preventDefault();
            deferredPrompt = e;
            setState(prev => ({
                ...prev,
                isInstallable: true,
                installPrompt: e,
            }));
        };

        const handleAppInstalled = () => {
            console.log('appinstalled event fired');
            setState(prev => ({
                ...prev,
                isInstalled: true,
                isInstallable: false,
                installPrompt: null,
                isInstalling: false,
            }));
            deferredPrompt = null;
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check for iOS Safari
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            /Safari/.test(navigator.userAgent) &&
            !/CriOS/.test(navigator.userAgent) &&
            !/FxiOS/.test(navigator.userAgent);

        if (isIOSSafari && !isInstalled) {
            console.log('iOS Safari detected - enabling manual install');
            setState(prev => ({ ...prev, isInstallable: true }));
        }

        // Register service worker if not already done
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(registration => {
                    console.log('Service Worker registered from hook:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [checkIfInstalled]);

    const getDebugInfo = useCallback(() => {
        if (typeof window === 'undefined') return {};

        return {
            isInstallable: state.isInstallable,
            isInstalled: state.isInstalled,
            isInstalling: state.isInstalling,
            hasPrompt: !!state.installPrompt,
            canInstall: state.isInstallable && !state.isInstalled && !state.isInstalling,
            userAgent: navigator.userAgent,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            referrer: document.referrer,
            manifestPresent: document.querySelector('link[rel="manifest"]') !== null,
        };
    }, [state]);

    return {
        ...state,
        installPWA,
        dismissInstall,
        canInstall: state.isInstallable && !state.isInstalled && !state.isInstalling,
        getDebugInfo
    };
}