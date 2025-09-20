// components/PWAInstaller.tsx
'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const registerServiceWorker = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    console.log('Registering service worker...');
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });

                    console.log('Service Worker registered:', registration);

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        console.log('Service worker update found');
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('New service worker installed, refresh may be needed');
                                    // You could show a notification to refresh here
                                }
                            });
                        }
                    });

                    if (registration.waiting) {
                        console.log('Service worker waiting, activating...');
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }

                } catch (error) {
                    console.error('Service worker registration failed:', error);
                }
            }
        };

        // Add manifest link if not present
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = '/manifest.json';
            document.head.appendChild(manifestLink);
        }

        // Add theme-color meta if not present
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            themeColorMeta.content = '#0ea5e9';
            document.head.appendChild(themeColorMeta);
        }

        const timer = setTimeout(registerServiceWorker, 1000);
        return () => clearTimeout(timer);
    }, []);

    return null;
}