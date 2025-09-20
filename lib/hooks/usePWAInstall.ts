// lib/hooks/usePWAInstall.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IBeforeInstallPromptEvent } from '@/lib/types/hadith';

interface PWAInstallState {
    isInstallable: boolean;
    isInstalled: boolean;
    isInstalling: boolean;
    installPrompt: IBeforeInstallPromptEvent | null;
}

export function usePWAInstall() {
    const [state, setState] = useState<PWAInstallState>({
        isInstallable: false,
        isInstalled: false,
        isInstalling: false,
        installPrompt: null,
    });

    // Check if app is already installed
    const checkIfInstalled = useCallback(() => {
        if (typeof window === 'undefined') return false;

        // Check if running in standalone mode (installed PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
            || document.referrer.includes('android-app://');

        return isStandalone;
    }, []);

    // Install the PWA
    const installPWA = useCallback(async () => {
        if (!state.installPrompt) {
            console.warn('Install prompt not available');
            return false;
        }

        setState(prev => ({ ...prev, isInstalling: true }));

        try {
            // Show the install prompt
            await state.installPrompt.prompt();

            // Wait for user choice
            const choiceResult = await state.installPrompt.userChoice;

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

    // Dismiss the install prompt
    const dismissInstall = useCallback(() => {
        setState(prev => ({
            ...prev,
            isInstallable: false,
            installPrompt: null,
        }));
    }, []);

    useEffect(() => {
        // Check if already installed
        const isInstalled = checkIfInstalled();
        if (isInstalled) {
            setState(prev => ({ ...prev, isInstalled: true }));
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            const installEvent = e as IBeforeInstallPromptEvent;

            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();

            // Save the event so it can be triggered later
            setState(prev => ({
                ...prev,
                isInstallable: true,
                installPrompt: installEvent,
            }));

            console.log('PWA install prompt available');
        };

        // Listen for successful app installation
        const handleAppInstalled = (e: Event) => {
            console.log('PWA was installed successfully');
            setState(prev => ({
                ...prev,
                isInstalled: true,
                isInstallable: false,
                installPrompt: null,
                isInstalling: false,
            }));
        };

        // Add event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check for iOS Safari install capability
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !(window as any).MSStream &&
            !checkIfInstalled();

        if (isIOSSafari) {
            setState(prev => ({
                ...prev,
                isInstallable: true
            }));
        }

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [checkIfInstalled]);

    return {
        ...state,
        installPWA,
        dismissInstall,
        canInstall: state.isInstallable && !state.isInstalled && !state.isInstalling,
    };
}