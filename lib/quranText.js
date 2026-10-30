// Arabic text + English translation, fetched in the browser.
// Primary: alquran.cloud (one request, both editions). Fallback: quran.com.
const memo = new Map();
export const strip = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "");

function dropBismillah(ar, n, i) {
  if (i !== 0 || n === 1 || n === 9) return ar;
  const tok = ar.trim().split(/\s+/);
  return strip(tok[0]) === "بسم" ? tok.slice(4).join(" ") : ar;
}
const plain = (h) => String(h || "").replace(/<sup[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();

async function viaAlQuran(n) {
  const r = await fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,en.sahih`);
  if (!r.ok) throw new Error("alquran " + r.status);
  const d = (await r.json()).data;
  return d[0].ayahs.map((a, i) => ({ n: a.numberInSurah, ar: dropBismillah(a.text, n, i), en: d[1].ayahs[i]?.text || "" }));
}
async function viaQuranCom(n) {
  const [a, t] = await Promise.all([
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${n}`).then((r) => r.json()),
    fetch(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${n}`).then((r) => r.json()),
  ]);
  return a.verses.map((v, i) => ({ n: i + 1, ar: v.text_uthmani, en: plain(t.translations[i]?.text) }));
}

export async function loadSurahText(n) {
  if (memo.has(n)) return memo.get(n);
  let v;
  try { v = await viaAlQuran(n); } catch { v = await viaQuranCom(n); }
  memo.set(n, v);
  return v;
}

// One ayah by its position in the whole Quran (1–6236), for the daily ayah card.
export async function loadAyah(gn) {
  const r = await fetch(`https://api.alquran.cloud/v1/ayah/${gn}/editions/quran-uthmani,en.sahih`);
  if (!r.ok) throw new Error("ayah " + r.status);
  const d = (await r.json()).data;
  const s = d[0].surah.number;
  return { surah: s, n: d[0].numberInSurah, ar: dropBismillah(d[0].text, s, d[0].numberInSurah - 1), en: d[1].text };
}

// Estimated start time (seconds) of each ayah. We don't have verse-level timestamps for
// these recordings, so time is shared out by letter count (+ a small pause per ayah).
export function buildTimings(verses, n, duration) {
  const w = verses.map((v) => strip(v.ar).replace(/\s/g, "").length + 6);
  const bism = n !== 1 && n !== 9 ? 40 : 0;
  const total = bism + w.reduce((a, b) => a + b, 0);
  let acc = bism;
  return w.map((x) => { const s = (acc / total) * duration; acc += x; return s; });
}
export function indexAt(starts, t) {
  let lo = 0, hi = starts.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (starts[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
}
