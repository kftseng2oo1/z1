// Service Worker — 紫微斗數AI大師
// 每次上傳新版 index.html 時，把 CACHE_VERSION 加 1
const CACHE_VERSION = 'v4';
const CACHE_NAME = 'ziwei-z1-' + CACHE_VERSION;
const OFFLINE_URL = '/z1/offline.html';
const PRECACHE_URLS = [
  '/z1/',
  '/z1/index.html',
  '/z1/manifest.json',
  '/z1/icon.svg',
  '/z1/offline.html',
  '/z1/icon-192.png',
  '/z1/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW] Pre-cache failure:', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  // 其他網域（API 等）一律不經過 SW，避免被快取住
  if (!sameOrigin && !isFont) return;

  const isDocument = req.mode === 'navigate' || req.destination === 'document';

  if (isDocument) {
    // HTML：Network-First — 有網路一定拿最新版，離線才用快取
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(async () => {
        return (await caches.match(req, { ignoreSearch: true }))
            || (await caches.match('/z1/index.html'))
            || (await caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // 靜態資源 / 字型：Cache-First
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
