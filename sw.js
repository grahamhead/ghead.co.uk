const CACHE_NAME = 'dashboard-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/icon.svg',
    '/manifest.json'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Automatically activate new SW versions immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const url = event.request.url;
    // Let APIs bypass cache ALWAYS
    if (url.includes('api.open-meteo.com') ||
        url.includes('api.binance.com') ||
        url.includes('allorigins.win') ||
        url.includes('api.rss2json.com') ||
        url.includes('google.com/s2/favicons')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).catch(() => {
                    console.warn('Network & cache failed for', event.request.url);
                });
            })
    );
});
