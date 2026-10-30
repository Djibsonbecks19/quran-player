// Save a surah's MP3 in the browser (Cache API). The service worker serves it back
// (with Range support) so playback and seeking work with no connection.
const NAME = "quran-audio";
const ok = () => typeof caches !== "undefined";
export async function isSaved(url) { try { return ok() && !!(await (await caches.open(NAME)).match(url)); } catch { return false; } }
export async function saveAudio(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  await (await caches.open(NAME)).put(url, res);
}
export async function removeAudio(url) { try { await (await caches.open(NAME)).delete(url); } catch {} }
