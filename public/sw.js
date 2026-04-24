// Wealth OS Premium — Etapa 5A.1 Service Worker seguro
// Esta versão evita travar o app durante testes no StackBlitz/Vite.
// Ela prepara PWA sem prender HTML antigo no cache.

const CACHE_NAME = 'wealth-os-premium-v5a1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Não mexe em Supabase, APIs externas, StackBlitz/Vite ou navegação HTML.
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('brapi.dev') ||
    url.hostname.includes('brapi.com.br') ||
    url.hostname.includes('stackblitz') ||
    url.hostname.includes('webcontainer') ||
    req.mode === 'navigate'
  ) {
    return;
  }

  // Cache leve apenas para ícones e manifest do próprio app.
  if (
    url.origin === self.location.origin &&
    (
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('/manifest.json')
    )
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();

            caches.open(CACHE_NAME)
              .then((cache) => cache.put(req, clone))
              .catch(() => null);
          }

          return res;
        });
      })
    );
  }
});