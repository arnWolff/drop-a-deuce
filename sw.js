/* Pose ta pêche / Drop a Peach - Service Worker v2
 * Mobile-first redesign. Network-first for HTML so updates land fast;
 * cache-first for everything else so the app keeps working offline.
 */
const CACHE = 'peche-v2';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.ico',
  './favicon-32.png'
];

// Leaflet + fonts come from CDNs. We let them be cached opportunistically
// (runtime caching below) rather than failing install if any are slow.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Best-effort: don't reject the whole install if one icon is missing.
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            /* ignore individual asset failures */
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Allow the page to ask the SW to activate immediately after an update.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isHTMLRequest(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache opaque cross-origin tile requests beyond the browser default.
  // OpenStreetMap tile usage policy discourages aggressive caching by third parties.
  if (url.hostname.endsWith('tile.openstreetmap.org')) return;

  // HTML → network-first, fall back to cached shell offline.
  if (isHTMLRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Everything else → cache-first, then network, then cache the network response.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Only cache successful, basic/cors responses to avoid bloating with errors.
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached); // last-resort
    })
  );
});
