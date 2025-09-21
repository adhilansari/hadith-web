const CACHE_NAME = 'hadith-net-v1';
const API_CACHE_NAME = 'hadith-api-v1';
const RUNTIME_CACHE = 'hadith-runtime-v1';

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/offline.html' // Add offline.html to cache
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            console.log('Service Worker: Install complete');
            return self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Install failed', error);
        })
    );
});

// Activate event
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

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Handle API requests from CDN
    if (url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle same-origin requests
    if (url.origin === self.location.origin) {
        // Handle navigation requests (HTML pages)
        if (request.mode === 'navigate') {
            event.respondWith(handleNavigationRequest(request));
            return;
        }

        // Handle other assets
        event.respondWith(handleAssetRequest(request));
        return;
    }
});

// Handle API requests - Cache first strategy
async function handleAPIRequest(request) {
    try {
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            // Return cached response and update in background
            fetchAndCache(request, cache);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('API request failed:', error);
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        return cachedResponse || new Response(
            JSON.stringify({ error: 'Network unavailable' }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle navigation requests - Network first, fallback to offline page
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful page responses
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Navigation failed, serving offline page');

        // Try to serve cached page first
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Serve offline page
        const offlineResponse = await caches.match('/offline.html');
        return offlineResponse || createOfflinePage();
    }
}

// Handle asset requests - Cache first strategy
async function handleAssetRequest(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return cached version if available
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(request);
    }
}

// Background fetch and cache
function fetchAndCache(request, cache) {
    fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
    }).catch(console.error);
}

// Create offline page if not cached
function createOfflinePage() {
    return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hadith.net - Offline</title>
            <style>
                body {
                    font-family: system-ui, sans-serif;
                    text-align: center;
                    padding: 2rem;
                    background: #f8fafc;
                    color: #334155;
                }
                .container { max-width: 400px; margin: 0 auto; }
                .icon { font-size: 4rem; margin-bottom: 1rem; }
                h1 { color: #0ea5e9; margin-bottom: 0.5rem; }
                p { margin-bottom: 1.5rem; line-height: 1.6; }
                .retry-btn {
                    background: #0ea5e9;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .retry-btn:hover { background: #0284c7; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">📖</div>
                <h1>You're Offline</h1>
                <p>Please check your connection and try again.</p>
                <button class="retry-btn" onclick="location.reload()">Try Again</button>
            </div>
        </body>
        </html>
    `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
    });
}

console.log('Service Worker: Loaded successfully');