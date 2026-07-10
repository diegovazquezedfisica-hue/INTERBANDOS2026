const CACHE_NAME = "interbandos-2026-v3";
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

// Estrategia NETWORK-FIRST: siempre intenta traer la version mas nueva de internet.
// Solo usa la copia guardada si no hay conexion (modo offline).
// Asi la app nunca vuelve a mostrar una version vieja mientras haya internet.
self.addEventListener("fetch", (event) => {
  // Nunca cachear los pedidos al Worker/Sheet: siempre tienen que ir a buscar datos frescos
  if (event.request.url.includes("workers.dev")) return;

  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
