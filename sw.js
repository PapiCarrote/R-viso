// Service worker RévisO — installable + cache hors-ligne (same-origin uniquement)
const CACHE = 'reviso-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', e => {
  // On ne gère que les GET de notre propre site ; le reste (Supabase, CDN) passe normalement
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network; // cache d'abord (rapide/hors-ligne), sinon réseau
    })
  );
});
