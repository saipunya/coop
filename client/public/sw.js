// TODO Mapping:
// - Cache static assets (JS, CSS, images) on install -> STATIC_ASSETS precache in install event
// - Cache API responses for /accounts and /transactions -> match in fetch (API_CACHE)
// - Enable offline mode to show last fetched data -> cache fallback when network fails
// - Update cache when new version of app is deployed -> VERSION changes => old caches purged in activate

const VERSION = 'v2'; // bump to deploy new version
const STATIC_CACHE = `static-${VERSION}`;
const API_CACHE = `api-${VERSION}`;
const STATIC_ASSETS = [
  '/app/',              // root of PWA (served by index.html)
  '/app/index.html',
  '/app/manifest.json',
  '/app/favicon.ico'
  // Additional built assets (hashed) will be cached lazily on first request
];

// Install: pre-cache core shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, API_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Helper: identify API endpoints to cache
function isCacheableApi(url) {
  return (
    url.pathname === '/api/accounts' ||
    /^\/api\/accounts\/\d+\/transactions$/.test(url.pathname)
  );
}

// Fetch handler
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // API caching (network-first)
  if (url.pathname.startsWith('/api/')) {
    if (isCacheableApi(url)) {
      event.respondWith(
        fetch(req)
          .then(res => {
            const clone = res.clone();
            caches.open(API_CACHE).then(c => c.put(req, clone));
            return res;
          })
          .catch(() => caches.match(req))
      );
    }
    return; // do not override other API routes
  }

  // Static assets: try cache-first then network (for better offline)
  if (
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'image' ||
    req.destination === 'font'
  ) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(req, clone));
          return res;
        }).catch(()=>cached); // final fallback
      })
    );
    return;
  }

  // Navigation requests (SPA shell) -> offline fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('/app/index.html')
      )
    );
  }
});
