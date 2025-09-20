const CACHE_NAME = 'hadith-net-v1';
const API_CACHE_NAME = 'hadith-api-v1';
const RUNTIME_CACHE = 'hadith-runtime-v1';

// Only cache assets that definitely exist
const STATIC_ASSETS = [
    '/',
    '/manifest.json'
    // Remove icon references until you confirm they exist
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png',
];

// Install event - Cache static assets with individual error handling
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        Promise.all([
            cacheAssetsIndividually(),
            self.skipWaiting()
        ])
    );
});

// Cache assets one by one to avoid total failure
async function cacheAssetsIndividually() {
    const cache = await caches.open(CACHE_NAME);

    for (const asset of STATIC_ASSETS) {
        try {
            console.log(`Caching asset: ${asset}`);
            await cache.add(asset);
            console.log(`✅ Successfully cached: ${asset}`);
        } catch (error) {
            console.error(`❌ Failed to cache ${asset}:`, error);
            // Continue with other assets even if one fails
        }
    }

    // Try to cache icons if they exist
    const iconAssets = [
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
    ];

    for (const icon of iconAssets) {
        try {
            const response = await fetch(icon);
            if (response.ok) {
                await cache.put(icon, response);
                console.log(`✅ Successfully cached icon: ${icon}`);
            } else {
                console.warn(`⚠️ Icon not found: ${icon} (${response.status})`);
            }
        } catch (error) {
            console.warn(`⚠️ Could not cache icon ${icon}:`, error.message);
        }
    }
}

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

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) return;

    const url = new URL(request.url);

    // Handle API requests from CDN
    if (url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle requests from your domain
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
            // Update cache in background
            fetchAndUpdateCache(request, cache);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
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

// Handle static assets - Cache first with fallback
async function handleStaticAssets(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Static asset request failed:', error);

        // Try to return a cached version if network fails
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // For images, return a placeholder or let it fail gracefully
        if (request.destination === 'image') {
            return new Response('', { status: 404, statusText: 'Image not found' });
        }

        throw error;
    }
}

// Handle page requests - Network first, fallback to cache
async function handlePageRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            // Don't await this to avoid slowing down the response
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('Failed to cache page:', err);
            });
        }
        return networkResponse;
    } catch {
        console.log('Network failed, trying cache...');

        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Try to return the cached root page as fallback
        const rootCache = await cache.match('/');
        if (rootCache) {
            return rootCache;
        }

        // Last resort - basic offline page
        return new Response(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Hadith.net</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f5f5f5;
                        color: #333;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { color: #0ea5e9; margin-bottom: 1rem; }
                    button {
                        background: #0ea5e9;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 1rem;
                    }
                    button:hover { background: #0284c7; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📖 Hadith.net</h1>
                    <h2>You're offline</h2>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' },
            status: 200
        });
    }
}

// Background cache update
async function fetchAndUpdateCache(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        console.log('Background cache update failed:', error);
    }
}

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Skip waiting received');
        self.skipWaiting();
    }
});

// Handle push notifications (if you plan to use them)
self.addEventListener('push', event => {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body || 'New notification from Hadith.net',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                vibrate: [200, 100, 200],
                data: data.data || {},
                actions: data.actions || []
            };

            event.waitUntil(
                self.registration.showNotification(data.title || 'Hadith.net', options)
            );
        } catch (error) {
            console.error('Push notification error:', error);
        }
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});

console.log('Service Worker: Script loaded successfully');