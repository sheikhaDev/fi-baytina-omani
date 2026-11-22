const cacheName = 'fi-baytina-omani-v2';
const files = [
  './', 'index.html', 'style.css', 'data.js', 'store.js', 'engine3d.js', 'app.js',
  'house.png', 'kitchen.png', 'majlis.png', 'bedroom.png', 'water.png',
  'apple.png', 'book.png', 'ball.png', 'blanket.png', 'help.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok && response.status === 200) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const saved = await cache.match(request) || (request.mode === 'navigate' && await cache.match('index.html'));
      if (saved) return saved;
      throw error;
    }
  })());
});
