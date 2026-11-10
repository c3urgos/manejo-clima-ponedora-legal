// SW V405 - Manejo Clima Ponedora - Premium sin duplicado + fix doble sticky
// Cambiar CACHE_NAME en cada versión obliga al celular a bajar la nueva app
const CACHE_NAME = 'manejo-clima-ponedora-V405';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-192-maskable.png', './icon-512-maskable.png'];
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE)).catch(()=>{}));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))).then(()=> self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Network-first para index.html para que siempre tome la última versión subida a GitHub
  if (new URL(e.request.url).pathname.endsWith('index.html') || new URL(e.request.url).pathname.endsWith('/')) {
    e.respondWith(fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE_NAME).then((c) => c.put(e.request, copy)).catch(()=>{});
      return r;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    const copy = r.clone();
    caches.open(CACHE_NAME).then((c) => c.put(e.request, copy)).catch(()=>{});
    return r;
  }).catch(() => caches.match('./index.html'))));
});
