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

export function usePWAInstall() {
    const [state, setState] = useState<PWAInstallState>({
        isInstallable: false,
        isInstalled: false,
        isInstalling: false,
        installPrompt: null,
    });

    const checkPWARequirements = useCallback(async () => {
        if (typeof window === 'undefined') return {
            https: false,
            serviceWorker: false,
            manifest: false,
            manifestValid: false,
            serviceWorkerRegistered: false,
            icons: false
        };

        const requirements = {
            https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
            serviceWorker: 'serviceWorker' in navigator,
            manifest: false,
            manifestValid: false,
            serviceWorkerRegistered: false,
            icons: false
        };

        // Check manifest
        try {
            const manifestResponse = await fetch('/manifest.json');
            requirements.manifest = manifestResponse.ok;

            if (requirements.manifest) {
                const manifestData = await manifestResponse.json();
                requirements.manifestValid = !!(
                    manifestData.name &&
                    manifestData.start_url &&
                    manifestData.display &&
                    manifestData.icons &&
                    manifestData.icons.length >= 2
                );
                requirements.icons = manifestData.icons.some((icon: { sizes: string }) =>
                    icon.sizes === '192x192' || icon.sizes === '512x512'
                );
            }
        } catch (error) {
            console.error('Manifest check failed:', error);
        }

        // Check service worker
        if (requirements.serviceWorker) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                requirements.serviceWorkerRegistered = !!registration;
            } catch (error) {
                console.error('Service worker check failed:', error);
            }
        }

        console.log('PWA Requirements Check:', requirements);
        return requirements;
    }, []);

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
            console.warn('Install prompt not available - checking requirements...');
            await checkPWARequirements();

            // Show helpful message
            alert('Install prompt not available. Please check:\n' +
                '1. You are on HTTPS or localhost\n' +
                '2. Manifest.json is valid\n' +
                '3. Service worker is registered\n' +
                '4. You haven\'t dismissed the prompt recently\n\n' +
                'Check browser console for detailed requirements.');
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
    }, [state.installPrompt, checkPWARequirements]);

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

        // Initial requirements check
        checkPWARequirements();

        const isInstalled = checkIfInstalled();
        console.log('Is app installed?', isInstalled);

        if (isInstalled) {
            setState(prev => ({ ...prev, isInstalled: true }));
            return;
        }

        let deferredPrompt: BeforeInstallPromptEvent | null = null;

        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            console.log('✅ beforeinstallprompt event fired!');
            e.preventDefault();
            deferredPrompt = e;
            setState(prev => ({
                ...prev,
                isInstallable: true,
                installPrompt: e,
            }));
        };

        const handleAppInstalled = () => {
            console.log('✅ appinstalled event fired');
            setState(prev => ({
                ...prev,
                isInstalled: true,
                isInstallable: false,
                installPrompt: null,
                isInstalling: false,
            }));
            deferredPrompt = null;
        };

        // Add event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Enhanced iOS detection
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            /Safari/.test(navigator.userAgent) &&
            !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

        if (isIOSSafari && !isInstalled) {
            console.log('iOS Safari detected - enabling manual install');
            setState(prev => ({ ...prev, isInstallable: true }));
        }

        // Force show in development after 5 seconds if no prompt
        if (window.location.hostname === 'localhost') {
            const devTimer = setTimeout(() => {
                if (!deferredPrompt && !isInstalled) {
                    console.log('Development: Force enabling install after 5s timeout');
                    setState(prev => ({
                        ...prev,
                        isInstallable: true
                    }));
                }
            }, 5000);

            return () => {
                clearTimeout(devTimer);
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
                window.removeEventListener('appinstalled', handleAppInstalled);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [checkIfInstalled, checkPWARequirements]);

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
            timestamp: new Date().toISOString()
        };
    }, [state]);

    const forceCheck = useCallback(async () => {
        console.log('Force checking PWA requirements...');
        const requirements = await checkPWARequirements();

        if (requirements.https &&
            requirements.manifest &&
            requirements.manifestValid &&
            requirements.serviceWorkerRegistered) {
            console.log('✅ All PWA requirements met - install should be available');
            if (!state.isInstalled && !state.isInstallable) {
                setState(prev => ({ ...prev, isInstallable: true }));
            }
        } else {
            console.log('❌ PWA requirements not met:', requirements);
        }

        return requirements;
    }, [checkPWARequirements, state.isInstalled, state.isInstallable]);

    return {
        ...state,
        installPWA,
        dismissInstall,
        canInstall: state.isInstallable && !state.isInstalled && !state.isInstalling,
        getDebugInfo,
        forceCheck, // New method to manually trigger requirements check
        checkPWARequirements // Expose for debugging
    };
}