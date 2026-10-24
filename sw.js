// Offline cache for the app shell. Bump VERSION when shipping changes.
const VERSION = 'uts-v72';
const SHELL = ['./', './index.html', './styles.css', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/icon-64.png',
  './js/app.js', './js/data.js', './js/cycle.js', './js/icons.js', './js/cosmic.js', './js/figure.js', './js/figure3d.js', './js/torso.js', './js/torso3d.js', './js/photos.js', './js/seasonal.js', './js/welcome3d.js', './js/sfx.js', './models/body.glb'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so edits show up immediately), cache as offline fallback.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // own files: always revalidate with the server (skips the 10-minute browser cache), photos/CDN: normal
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(fetch(e.request, own ? { cache: 'no-cache' } : undefined).then(res => {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./#/today')));
});
