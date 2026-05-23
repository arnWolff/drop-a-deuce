// sw.js — minimal SW that satisfies installability + offline fallback
const CACHE = 'peche-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.ico'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(ASSETS.map((a) => c.add(a)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML so updates are picked up; cache-first for the rest.
// Skip Leaflet tiles & Firebase calls — they don't belong in the cache.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Don't intercept tiles or auth/firestore traffic
  if (url.host.includes('tile.openstreetmap.org')) return;
  if (url.host.includes('firebaseio.com')) return;
  if (url.host.includes('googleapis.com')) return;
  if (url.host.includes('firebase.app')) return;
  if (url.host.includes('firebaseapp.com')) return;
  if (url.host.includes('gstatic.com')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
