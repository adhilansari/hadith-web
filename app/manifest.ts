import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hadith.net - Authentic Islamic Hadith Collections',
        short_name: 'Hadith.net',
        description: 'Read authentic Hadith collections with translations in multiple languages',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        orientation: 'portrait',
        scope: '/',
        icons: [
            {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        categories: ['education', 'books', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
        screenshots: [
            {
                src: '/screenshots/home-desktop.png',
                type: 'image/png',
                sizes: '1280x720',
                form_factor: 'wide',
            },
            {
                src: '/screenshots/home-mobile.png',
                type: 'image/png',
                sizes: '375x812',
                form_factor: 'narrow',
            },
        ],
    };
}