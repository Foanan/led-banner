/* LED 滚动字幕 · Service Worker
 * 策略：预缓存全部静态资源，请求优先走缓存（ignoreSearch 让 ?text= 之类的参数也能命中）
 * 升级时把 CACHE 常量改成 v2、v3……否则用户永远看到旧版本。
 */
const CACHE = 'led-banner-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './install.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((hit) => hit || fetch(event.request))
      .catch(() => caches.match('./index.html'))
  );
});
