'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const registerServiceWorker = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    console.log('🔄 Registering service worker...');

                    // Unregister any existing service workers first (for development)
                    if (window.location.hostname === 'localhost') {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                            console.log('🗑️ Unregistered old service worker');
                        }
                    }

                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });

                    console.log('✅ Service Worker registered:', registration);

                    // Wait for service worker to be ready
                    await navigator.serviceWorker.ready;
                    console.log('✅ Service Worker ready');

                    // Check if we're in standalone mode
                    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
                    console.log('Standalone mode:', isStandalone);

                } catch (error) {
                    console.error('❌ Service worker registration failed:', error);
                }
            } else {
                console.warn('⚠️ Service workers not supported');
            }
        };

        const checkManifest = async () => {
            try {
                const response = await fetch('/manifest.json');
                if (response.ok) {
                    const manifest = await response.json();
                    console.log('✅ Manifest loaded:', manifest);

                    // Validate required fields
                    const required = ['name', 'start_url', 'display', 'icons'];
                    const missing = required.filter(field => !manifest[field]);

                    if (missing.length > 0) {
                        console.warn('⚠️ Manifest missing required fields:', missing);
                    } else {
                        console.log('✅ Manifest validation passed');
                    }
                } else {
                    console.error('❌ Failed to load manifest.json');
                }
            } catch (error) {
                console.error('❌ Manifest check failed:', error);
            }
        };

        // Add manifest link if not present
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = '/manifest.json';
            document.head.appendChild(manifestLink);
            console.log('➕ Added manifest link to head');
        }

        // Add theme-color meta if not present
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            themeColorMeta.content = '#0ea5e9';
            document.head.appendChild(themeColorMeta);
            console.log('➕ Added theme-color meta to head');
        }

        // Run checks
        const timer = setTimeout(async () => {
            await checkManifest();
            await registerServiceWorker();

            // Additional debug info
            console.log('🔍 PWA Debug Info:', {
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                isSecure: window.isSecureContext,
                serviceWorkerSupported: 'serviceWorker' in navigator,
                manifestLink: !!document.querySelector('link[rel="manifest"]')
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}