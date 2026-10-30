const CACHE_NAME = 'bizkaibus-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/favicon.png',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/bus-marker.png',
  '/img/stop-marker.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => console.warn('PWA cache error:', err));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Nunca cachear llamadas a APIs de tiempo real o autenticación
  if (url.pathname.startsWith('/bizkaibus') || url.pathname.startsWith('/auth') || event.request.method !== 'GET') {
    return;
  }

  // Network-first con fallback a caché
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia actualizada en segundo plano si es un asset local
        if (response.status === 200 && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
