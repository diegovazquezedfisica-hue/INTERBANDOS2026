const CACHE_NAME = "interbandos-2026-v2";
const ARCHIVOS_CORE = [
  "./",
  "./index.html",
  "./escudo.png",
  "./rojos.png",
  "./azules.png",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_CORE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Nunca cachear los pedidos al Worker/Sheet: siempre tienen que ir a buscar datos frescos
  if (event.request.url.includes("workers.dev")) return;

  event.respondWith(
    caches.match(event.request).then((cacheado) => {
      return (
        cacheado ||
        fetch(event.request)
          .then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
            return respuesta;
          })
          .catch(() => cacheado)
      );
    })
  );
});
