const CACHE_NAME = 'hadith-net-v1';
const API_CACHE_NAME = 'hadith-api-v1';

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        // Return cached response
                        return response;
                    }

                    // Fetch from network and cache
                    return fetch(request).then(networkResponse => {
                        // Only cache successful responses
                        if (networkResponse.status === 200) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Return a fallback response if network fails
                        return new Response(JSON.stringify({ error: 'Network unavailable' }), {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                });
            })
        );
        return;
    }

    // Handle static assets
    if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request);
            })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'hadith-sync') {
        event.waitUntil(
            // Handle offline bookmarks, settings sync, etc.
            Promise.resolve()
        );
    }
});
