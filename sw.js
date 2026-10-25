const CACHE = 'quiz-poudlard-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/favicon-48.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord pour la page (mises à jour), cache en secours ; cache d'abord + rafraîchissement pour le reste (Tailwind, icônes, polices).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate';
  if (isPage) {
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put('index.html', r.clone())); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
