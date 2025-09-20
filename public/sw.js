const CACHE_NAME = 'hadith-net-v1';
const API_CACHE_NAME = 'hadith-api-v1';
const RUNTIME_CACHE = 'hadith-runtime-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - Cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('Service Worker: Caching static assets');
                    return cache.addAll(STATIC_ASSETS).catch(err => {
                        console.error('Failed to cache assets:', err);
                        // Cache assets individually to avoid failing the entire installation
                        return Promise.allSettled(
                            STATIC_ASSETS.map(asset => cache.add(asset))
                        );
                    });
                }),
            self.skipWaiting()
        ])
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                const validCaches = [CACHE_NAME, API_CACHE_NAME, RUNTIME_CACHE];
                return Promise.all(
                    cacheNames
                        .filter(cacheName => !validCaches.includes(cacheName))
                        .map(cacheName => {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch event - Network strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) return;

    // Handle API requests from CDN
    if (url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle Next.js static files and pages
    if (url.origin === self.location.origin) {
        // Static assets (images, icons, etc.)
        if (request.destination === 'image' ||
            url.pathname.startsWith('/icons/') ||
            url.pathname.startsWith('/_next/static/')) {
            event.respondWith(handleStaticAssets(request));
            return;
        }

        // HTML pages and documents
        if (request.destination === 'document' ||
            request.headers.get('accept')?.includes('text/html')) {
            event.respondWith(handlePageRequest(request));
            return;
        }

        // Other assets (JS, CSS)
        if (request.destination === 'script' ||
            request.destination === 'style' ||
            url.pathname.startsWith('/_next/')) {
            event.respondWith(handleStaticAssets(request));
            return;
        }
    }
});

// Handle API requests - Cache first, then network
async function handleAPIRequest(request) {
    try {
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            fetchAndUpdateCache(request, cache);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('API request failed:', error);
        return new Response(JSON.stringify({ error: 'Network unavailable' }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle static assets - Cache first
async function handleStaticAssets(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Static asset request failed:', error);
        throw error;
    }
}

// Handle page requests - Network first, fallback to cache
async function handlePageRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const offlineResponse = await cache.match('/');
        if (offlineResponse) {
            return offlineResponse;
        }

        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Hadith.net</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <h1>You're offline</h1>
                <p>Please check your internet connection and try again.</p>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

async function fetchAndUpdateCache(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        console.log('Background cache update failed:', error);
    }
}

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Skip waiting received');
        self.skipWaiting();
    }
});

console.log('Service Worker: Script loaded');