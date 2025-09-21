import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hadith.net - Authentic Islamic Hadith Collections',
        short_name: 'Hadith.net',
        description: 'Read authentic Hadith collections with translations in multiple languages. A modern PWA for Islamic studies.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        orientation: 'portrait-primary',
        scope: '/',
        id: 'hadith-net-pwa',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'books', 'reference', 'lifestyle'],

        // Enhanced icons array with proper sizing and purposes
        icons: [
            // Small sizes for notifications and shortcuts
            {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any'
            },

            // Standard app icon sizes
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },

            // Maskable icons for better Android adaptive icon support
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },

            // Apple touch icons (if you have specific ones)
            {
                src: '/icons/icon-180x180.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any'
            }
        ],

        // Enhanced shortcuts for quick access
        shortcuts: [
            {
                name: 'Sahih Bukhari',
                short_name: 'Bukhari',
                description: 'Read Sahih Bukhari collection',
                url: '/books/bukhari',
                icons: [
                    {
                        src: '/icons/icon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    }
                ]
            },
            {
                name: 'Sahih Muslim',
                short_name: 'Muslim',
                description: 'Read Sahih Muslim collection',
                url: '/books/muslim',
                icons: [
                    {
                        src: '/icons/icon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    }
                ]
            }
        ],

        // Better PWA configuration
        prefer_related_applications: false,
        related_applications: [],

        // Enhanced display and UI
        display_override: ['standalone', 'minimal-ui'],
        launch_handler: {
            client_mode: 'navigate-existing'
        }
    };
}