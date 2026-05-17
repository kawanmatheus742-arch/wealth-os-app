// Dymivra Stable Service Worker
// Mantém aparência de app, evita cache antigo travando telas e prioriza HTML sempre atualizado.
const DYMIVRA_CACHE = 'dymivra-stable-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(DYMIVRA_CACHE).then(cache => cache.addAll(ASSETS).catch(() => null))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== DYMIVRA_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(DYMIVRA_CACHE).then(cache => cache.put('/index.html', copy)).catch(() => null);
          return res;
        })
        .catch(() => caches.match('/index.html').then(cached => cached || caches.match('/')))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(DYMIVRA_CACHE).then(cache => cache.put(req, copy)).catch(() => null);
        return res;
      }).catch(() => cached))
    );
  }
});
