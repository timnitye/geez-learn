const CACHE_NAME = "geez-learn-v1";

const PRE_CACHE = [
  "/",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation: network-first, fallback to cached shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // Next.js static assets: cache-first (content-hashed)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return resp;
        })
      )
    );
    return;
  }

  // Same-origin: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return resp;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // External: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
