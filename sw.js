// ================================================================
//  紫微斗數排盤系統 - Service Worker
//  版本：v10
// ================================================================

const CACHE_NAME = 'ziwei-v10';

// 需要快取的核心資源
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// 外部字型（網路優先，失敗時略過）
const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Noto+Sans+TC:wght@300;400;500;700&display=swap',
];

// ── 安裝：快取核心資源 ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 安裝並快取核心資源');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── 啟動：清除舊版快取 ──────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] 清除舊快取:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── 攔截請求：Cache First（核心資源）/ Network First（其他）──────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理 http/https
  if (!url.protocol.startsWith('http')) return;

  // 字型：Network First，失敗才用快取
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // 同源資源：Cache First
  if (url.origin === location.origin) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // 其他跨域資源：直接 fetch
  event.respondWith(fetch(request));
});

// Cache First：有快取就用，否則去網路並存入快取
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('離線模式：找不到資源', { status: 503 });
  }
}

// Network First：先網路，失敗才用快取
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}
