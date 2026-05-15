const CACHE_NAME = 'musafir-v1';
const MAP_CACHE = 'musafir-maps-v1';
const TILE_ORIGINS = [
  'https://tile.openstreetmap.org',
  'https://a.tile.openstreetmap.org',
  'https://b.tile.openstreetmap.org',
  'https://c.tile.openstreetmap.org'
];

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// ── Install: cache app shell ────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

// ── Activate: prune old caches ───────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== MAP_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for tiles, network-first for everything else ──────────
self.addEventListener('fetch', e => {
  const { request } = e;

  // Cache-first strategy for OSM map tiles
  if (TILE_ORIGINS.some(o => request.url.startsWith(o))) {
    e.respondWith(
      caches.open(MAP_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(resp => {
              cache.put(request, resp.clone());
              return resp;
            })
            .catch(() => cached); // serve stale tile if offline
        })
      )
    );
    return;
  }

  // Network-first with cache fallback for all other requests
  e.respondWith(
    fetch(request)
      .then(resp => {
        if (resp.ok) {
          caches.open(CACHE_NAME).then(c => c.put(request, resp.clone()));
        }
        return resp;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Musafir — Offline</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0;
           background: #FDF6E3; color: #1a1a1a; text-align: center; padding: 24px; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 800; color: #006A4E; margin: 0 0 8px; }
    p { font-size: 15px; color: #666; max-width: 280px; line-height: 1.6; }
    button { margin-top: 24px; padding: 14px 28px; background: #006A4E;
             color: white; border: none; border-radius: 12px; font-size: 15px;
             font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="icon">🧭</div>
  <h1>You're offline</h1>
  <p>Musafir needs a connection to load new content. Previously cached pages and offline maps are still available.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`,
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});
