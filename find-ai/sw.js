/* 《大家来找AI娘》 service worker.
   更新策略（star 2026-11-17 定）：玩家零操作——新版在下一次打开时自动生效。
   - skipWaiting + clients.claim：新 SW 立即接管，不等旧页面全关。
   - 同源请求一律网络优先（拿到新版即用，并顺手刷新缓存），断网才回退缓存。
   - 缓存按版本命名，激活时清旧版缓存；localStorage（图鉴/语言）不在此列，永不触碰。 */
const CACHE = 'findai-v7';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
