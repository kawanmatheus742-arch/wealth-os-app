/* Dymivra Service Worker 7.1.9
   Atualiza identidade do PWA e mantém suporte a notificações Android/PWA.
   Mantém cache leve para não travar novas versões do index.html.
*/

const DYMIVRA_CACHE = "dymivra-cache-v7-1-9";
const DYMIVRA_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(DYMIVRA_CACHE)
      .then((cache) => cache.addAll(DYMIVRA_ASSETS).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== DYMIVRA_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Para HTML/navegação, tenta rede primeiro para evitar app preso em versão antiga.
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(DYMIVRA_CACHE).then((cache) => cache.put(req, copy)).catch(() => null);
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Para arquivos estáticos, cache primeiro com atualização em segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(DYMIVRA_CACHE).then((cache) => cache.put(req, copy)).catch(() => null);
          }
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});