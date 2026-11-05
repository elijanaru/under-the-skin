// Offline cache for the app shell. Bump VERSION when shipping changes.
const VERSION = 'uts-v608';
const SHELL = ['./', './index.html', './styles.css', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/icon-64.png', './icons/icon-32.png', './icons/icon-maskable-512.png',
  './js/app.js', './js/data.js', './js/cycle.js', './js/icons.js', './js/cosmic.js', './js/astro.js', './js/moonguide.js', './js/moon3d.js', './js/figure.js', './js/figure3d.js', './js/torso.js', './js/torso3d.js', './js/photos.js', './js/seasonal.js', './js/world.js', './js/ground.js', './js/athlete.js', './js/bodymap.js', './js/molecules.js', './js/welcome3d.js', './js/teacup3d.js', './js/sfx.js', './js/sun.js', './js/account.js', './js/config.js', './images/planet.jpg', './images/gate-rose.webp', './images/flower-menstrual.webp', './images/flower-follicular.webp', './images/flower-ovulatory.webp', './images/flower-luteal.webp', './images/period.png', './images/partner-cinema.webp', './images/partner-hands.jpg', './images/ground-roots.jpg', './images/pixel-aura-0.png', './images/pixel-aura-1.png', './images/pixel-aura-2.png', './images/pixel-aura-3.png', './images/sun-moon.webp', './images/sun-moon.mp4', './images/tea-ginger.webp', './images/sun-moon-poster.webp', './images/rhythm-sun.webp', './images/move-stardust.mp4', './images/move-stardust.webp', './images/move-meditate.webp', './images/move-walk.webp', './images/move-yoga.webp', './images/move-sport.webp', './images/move-pilates.webp', './images/move-hiit.webp', './images/move-lift.webp', './images/season-veg.webp', './images/season-fruit.webp', './images/stress-meditate.mp4', './images/stress-meditate.webp', './images/stress-breathe.mp4', './images/stress-breathe.webp', './images/forest-path.jpg', './images/welcome-forest.jpg', './images/intro-forest.jpg', './images/forest-calm.jpg', './images/tile-meditate.webp', './images/tile-ground.webp', './images/tile-walk.webp', './images/tile-yoga.webp', './images/tile-sport.webp', './images/tile-pilates.webp', './images/tile-hiit.webp', './images/tile-lift.webp', './images/purpose-body.jpg', './images/purpose-conceive.jpg', './images/period-food.webp', './images/plate.webp', './images/read-lilies.webp', './models/body2.glb', './models/teacup.glb', './models/moon.glb', './images/cup-chai.webp', './images/cup-glass.webp', './sounds/forest-stream.m4a'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so edits show up immediately), cache as offline fallback.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // never store account data (Supabase sends apikey/authorization) or the live love relay stream: health data must
  // not outlive sign-out in the cache, and an endless SSE body would be written to the cache forever
  if (e.request.headers.has('apikey') || e.request.headers.has('authorization') || new URL(e.request.url).hostname === 'ntfy.sh') return;
  // own files: always revalidate with the server (skips the 10-minute browser cache), photos/CDN: normal
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(fetch(e.request, own ? { cache: 'no-cache' } : undefined).then(res => {
    if (!res.ok && res.type !== 'opaque') return res; // don't replace a good offline copy with an error page
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./#/today')));
});
