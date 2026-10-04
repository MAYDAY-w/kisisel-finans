const CACHE_NAME = 'kisisel-muhasebe-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Simple network-first or cache-fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
