const CACHE_NAME = "moontomi-pwa-v1";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
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

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;
        const cachedHome = await caches.match("/");
        return cachedHome || Response.error();
      })
    );
    return;
  }

  // Static assets (icons, rank overlays, fonts, _next/static): Cache-first with background update
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/rank/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
