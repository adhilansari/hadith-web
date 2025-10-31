'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const validateAndRegisterServiceWorker = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Unregister existing service workers in development
                    if (process.env.NODE_ENV === 'development') {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                        }
                    }

                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });


                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Could show update notification here
                                }
                            });
                        }
                    });

                } catch (error) {
                    console.error('Service worker registration failed:', error);
                }
            }
        };

        const validateIcons = async () => {
            const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
            const validIcons = [];

            for (const size of iconSizes) {
                try {
                    const response = await fetch(`/icons/icon-${size}x${size}.png`);
                    if (response.ok) {
                        validIcons.push(size);
                    } else {
                        console.warn(`Icon missing: icon-${size}x${size}.png`);
                    }
                } catch {
                    console.warn(`Failed to validate icon: icon-${size}x${size}.png`);
                }
            }

            return validIcons;
        };

        const setupPWA = async () => {
            // Validate icons
            await validateIcons();

            // Register service worker
            await validateAndRegisterServiceWorker();

            // Add required meta tags
            if (!document.querySelector('link[rel="manifest"]')) {
                const manifestLink = document.createElement('link');
                manifestLink.rel = 'manifest';
                manifestLink.href = '/manifest.json';
                document.head.appendChild(manifestLink);
            }

            if (!document.querySelector('meta[name="theme-color"]')) {
                const themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                themeColorMeta.content = '#0ea5e9';
                document.head.appendChild(themeColorMeta);
            }

            // Apple-specific meta tags
            if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
                const appleMeta = document.createElement('meta');
                appleMeta.name = 'apple-mobile-web-app-capable';
                appleMeta.content = 'yes';
                document.head.appendChild(appleMeta);
            }

            if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
                const appleStatusMeta = document.createElement('meta');
                appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
                appleStatusMeta.content = 'default';
                document.head.appendChild(appleStatusMeta);
            }

            // Apple touch icon
            if (!document.querySelector('link[rel="apple-touch-icon"]')) {
                const appleTouchIcon = document.createElement('link');
                appleTouchIcon.rel = 'apple-touch-icon';
                appleTouchIcon.href = '/icons/icon-192x192.png';
                document.head.appendChild(appleTouchIcon);
            }
        };

        // Setup PWA after a small delay to ensure DOM is ready
        const timer = setTimeout(setupPWA, 1000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}