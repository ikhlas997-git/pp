/* Offline support: network-first for app files, falling back to cache */
const CACHE = 'teacher-app-v2';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './assets/css/app.css', './assets/img/icon.svg', './assets/img/icon-192.png', './assets/img/icon-512.png', './assets/img/apple-touch-icon.png', './assets/vendor/xlsx.full.min.js',
  ...['i18n', 'db', 'ui', 'settings', 'schemas', 'crud', 'students', 'grades', 'drawings', 'search', 'dashboard', 'app'].map(f => `./assets/js/${f}.js`)
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host);
  if (!cacheable) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
