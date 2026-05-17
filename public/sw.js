// Dymivra Service Worker — Scroll Unlock
// Versão nova para limpar cache antigo e destravar a tela.
const DYMIVRA_CACHE = 'dymivra-scroll-unlock-2026-05-17-v1';
const CORE_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(DYMIVRA_CACHE).then(cache => cache.addAll(CORE_ASSETS).catch(() => null))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(name => {
      if (name !== DYMIVRA_CACHE) return caches.delete(name);
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML sempre vem da rede primeiro para não prender versão bugada.
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => res)
        .catch(() => caches.match('/index.html').then(cached => cached || Response.error()))
    );
    return;
  }

  // Arquivos do próprio app: cache leve, mas sem travar HTML antigo.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(DYMIVRA_CACHE).then(cache => cache.put(req, copy)).catch(() => null);
          return res;
        });
      }).catch(() => cached)
    );
  }
});
