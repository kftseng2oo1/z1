// ================================================================
//  紫微斗數排盤系統 - Service Worker  v10
// ================================================================
const CACHE_NAME = 'ziwei-v10';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './ziwei-icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 快取核心資源');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirst(request)); return;
  }
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request)); return;
  }
  event.respondWith(fetch(request));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch { return new Response('離線模式：找不到資源', { status: 503 }); }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.status === 200) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch {
    return (await caches.match(req)) || new Response('', { status: 503 });
  }
}
