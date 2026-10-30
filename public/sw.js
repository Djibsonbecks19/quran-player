// Tilawa service worker: app shell + runtime caching + offline audio.
const V = "v1";
const SHELL = `shell-${V}`, STATIC = `static-${V}`, API = `api-${V}`, AUDIO = "quran-audio";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/", "/manifest.webmanifest", "/icon-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== AUDIO && ![SHELL, STATIC, API].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const swr = async (req, name) => {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req).then((r) => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => hit || Response.error());
  return hit || net;
};
const cacheFirst = async (req, name) => {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok || r.type === "opaque") cache.put(req, r.clone());
  return r;
};
const networkFirst = async (req, name) => {
  const cache = await caches.open(name);
  try { const r = await fetch(req); if (r.ok) cache.put(req, r.clone()); return r; }
  catch { return (await cache.match(req)) || (req.mode === "navigate" ? await cache.match("/") : undefined) || Response.error(); }
};

async function audio(req) {
  const cache = await caches.open(AUDIO);
  const hit = await cache.match(req.url);
  if (!hit) return fetch(req);
  const range = req.headers.get("range");
  if (!range) return hit;
  const blob = await hit.blob();
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  const start = +m[1];
  const end = m[2] ? Math.min(+m[2], blob.size - 1) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: { "Content-Type": "audio/mpeg", "Content-Range": `bytes ${start}-${end}/${blob.size}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" },
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (/\.mp3$/i.test(url.pathname)) return e.respondWith(audio(req));
  if (["api.alquran.cloud", "api.quran.com"].includes(url.hostname)) return e.respondWith(swr(req, API));
  if (["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) return e.respondWith(cacheFirst(req, STATIC));
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || /\.(png|jpe?g|svg|ico|webp)$/i.test(url.pathname)) return e.respondWith(cacheFirst(req, STATIC));
  e.respondWith(networkFirst(req, SHELL));
});
