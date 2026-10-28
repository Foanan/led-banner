/* LED 滚动字幕 · Service Worker
 * 策略：预缓存全部静态资源，请求优先走缓存（ignoreSearch 让 ?text= 之类的参数也能命中）
 * 升级时把 CACHE 常量往上加（v2 → v3 → …），否则用户永远看到旧版本。
 * 前缀 led-banner- 不要改：activate 只清理这个前缀的旧缓存。
 */
const CACHE = 'led-banner-v2';
// 只清理本应用自己的旧缓存：caches.keys() 是整个 origin 的，
// 同一个域名下若还有别的 PWA，不能把它们一起删掉
const CACHE_PREFIX = 'led-banner-';

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
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 逐个缓存：任何一个资源 404 都只跳过它，不再拖垮整个安装
    await Promise.all(
      ASSETS.map((url) =>
        cache.add(url).catch((err) => console.warn('[SW] 跳过未能缓存:', url, err))
      )
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE)
          .map((k) => caches.delete(k))
      ))
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
