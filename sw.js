const CACHE_NAME = "clima-ponedora-v3";
const urlsToCache = [
  "/manejo-clima-ponedora-legal/",
  "/manejo-clima-ponedora-legal/index.html",
  "/manejo-clima-ponedora-legal/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
