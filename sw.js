const CACHE_NAME = 'survive-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/sim.html',
  '/debrief.html',
  '/map.html',
  '/style.css',
  '/app.js',
  '/sim.js'
];

// Install — cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Fetch — serve from cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});