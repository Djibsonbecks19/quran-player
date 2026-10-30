"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { RECITERS, audioUrl, DEFAULT_SOURCE } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import { useStored } from "./useStored";
import { STR } from "./i18n";
import { loadSurahText, buildTimings } from "./quranText";

// /surah/18?reciter=maher&t=95  (or ?s=18&r=maher)
function readLink() {
  try {
    const u = new URL(window.location.href);
    const m = u.pathname.match(/\/surah\/(\d{1,3})/);
    const n = parseInt(m ? m[1] : u.searchParams.get("s") || "", 10);
    if (!(n >= 1 && n <= 114)) return null;
    const r = u.searchParams.get("reciter") || u.searchParams.get("r");
    return { n, r: RECITERS.some((x) => x.id === r) ? r : null, t: parseFloat(u.searchParams.get("t") || "0") || 0 };
  } catch { return null; }
}

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const resume = useRef({ t: 0, play: false });
  const triedOther = useRef(false);
  const restored = useRef(false);
  const lastSave = useRef(0);
  const toastTimer = useRef(null);
  const api = useRef({});
  const jump = useRef(null);

  const [reciterId, setReciterId] = useState(RECITERS[0].id);
  const [surah, setSurah] = useState(null);
  const [mode, setMode] = useState(DEFAULT_SOURCE);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sleep, setSleep] = useState(null); // {type:"time",at} | {type:"end"} | null
  const [sleepLeft, setSleepLeft] = useState(0);

  // remembered between visits
  const [favs, setFavs] = useStored("q:favs", []);
  const [recents, setRecents] = useStored("q:recents", []);
  const [speed, setSpeed] = useStored("q:speed", 1);
  const [volume, setVolume] = useStored("q:vol", 0.9);
  const [last, setLast, lastReady] = useStored("q:last", null);
  const [favReciters, setFavReciters] = useStored("q:favReciters", []);
  const [lang, setLang] = useStored("q:lang", "en");
  const t = useCallback((k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const reciter = RECITERS.find((r) => r.id === reciterId);

  const showToast = useCallback((msg) => {
    setToast({ msg, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  // start a fresh track (resets the remote/local fallback)
  const begin = (t, play) => { triedOther.current = false; setMode(DEFAULT_SOURCE); resume.current = { t, play }; };

  // ── load audio whenever reciter / surah / source changes
  useEffect(() => {
    if (!surah) return;
    const a = audioRef.current;
    setError("");
    setLoading(true);
    a.src = audioUrl(reciter, surah, mode);
    a.load();
  }, [reciterId, surah, mode]); // eslint-disable-line

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  // ── restore last session (paused) on first visit load
  useEffect(() => {
    if (!lastReady || restored.current) return;
    restored.current = true;
    const link = readLink();
    if (link) {
      const r = link.r || (last && RECITERS.some((x) => x.id === last.r) ? last.r : RECITERS[0].id);
      setReciterId(r);
      resume.current = { t: link.t, play: false };
      setSurah(link.n);
      showToast(`${SURAHS[link.n - 1].en} — tap play`);
      return;
    }
    if (last && RECITERS.some((r) => r.id === last.r)) {
      setReciterId(last.r);
      if (last.n) { resume.current = { t: last.t || 0, play: false }; setSurah(last.n); }
    }
  }, [lastReady]); // eslint-disable-line

  useEffect(() => {
    if (!restored.current) return;
    setLast((l) => ({ r: reciterId, n: surah, t: l && l.n === surah && l.r === reciterId ? l.t : resume.current.t || 0 }));
  }, [reciterId, surah]); // eslint-disable-line

  // keep the address bar shareable
  useEffect(() => {
    if (!restored.current || !surah) return;
    try { window.history.replaceState(null, "", `/surah/${surah}?reciter=${reciterId}`); } catch {}
  }, [surah, reciterId]);

  useEffect(() => {
    if (!surah) return;
    setRecents((r) => [{ n: surah, r: reciterId }, ...r.filter((x) => !(x.n === surah && x.r === reciterId))].slice(0, 12));
  }, [surah, reciterId]); // eslint-disable-line

  // ── actions
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!surah) return;
    a.paused ? a.play().catch(() => {}) : a.pause();
  }, [surah]);

  const playSurah = useCallback((n, id) => {
    if (n === surah && (!id || id === reciterId)) { toggle(); return; }
    begin(0, true);
    if (id && id !== reciterId) setReciterId(id);
    setSurah(n);
  }, [surah, reciterId, toggle]); // eslint-disable-line

  // start a surah and jump to an ayah (approximate, see lib/quranText.js)
  const playFrom = useCallback((n, ayah, id) => {
    if (ayah > 1) jump.current = { n, ayah }; else jump.current = null;
    const same = n === surah && (!id || id === reciterId);
    if (same) {
      const a = audioRef.current;
      if (ayah > 1) { jumpNow(a, n, ayah); a.play().catch(() => {}); } else { a.currentTime = 0; a.play().catch(() => {}); }
      jump.current = null;
      return;
    }
    begin(0, true);
    if (id && id !== reciterId) setReciterId(id);
    setSurah(n);
  }, [surah, reciterId]); // eslint-disable-line

  const shareLink = useCallback(async (withTime) => {
    if (!surah) return;
    const u = `${window.location.origin}/surah/${surah}?reciter=${reciterId}${withTime && time > 5 ? `&t=${Math.floor(time)}` : ""}`;
    const title = `${SURAHS[surah - 1].en} — ${reciter.name}`;
    try {
      if (navigator.share) { await navigator.share({ title, url: u }); return; }
      await navigator.clipboard.writeText(u);
      showToast("Link copied");
    } catch (e) { if (e?.name !== "AbortError") showToast("Couldn't copy the link"); }
  }, [surah, reciterId, time, reciter, showToast]); // eslint-disable-line

  const switchReciter = useCallback((id) => {
    if (id === reciterId) return;
    const a = audioRef.current;
    begin(a?.currentTime || 0, a ? !a.paused : false);
    setReciterId(id);
    showToast(`Reciter: ${RECITERS.find((r) => r.id === id).name}`);
  }, [reciterId, showToast]); // eslint-disable-line

  const next = useCallback(() => {
    if (!surah) return;
    begin(0, true);
    if (shuffle) { let r; do { r = Math.ceil(Math.random() * 114); } while (r === surah); setSurah(r); }
    else setSurah(surah === 114 ? 1 : surah + 1);
  }, [surah, shuffle]); // eslint-disable-line

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (!surah) return;
    if (a.currentTime > 3) { a.currentTime = 0; return; }
    begin(0, true);
    setSurah(surah === 1 ? 114 : surah - 1);
  }, [surah]); // eslint-disable-line

  const jumpNow = (a, n, ayah) => {
    loadSurahText(n).then((v) => {
      if (!a.duration || audioRef.current !== a) return;
      const st = buildTimings(v, n, a.duration);
      if (st[ayah - 1] != null) { a.currentTime = st[ayah - 1]; setTime(a.currentTime); }
    }).catch(() => {});
  };

  const seek = (t) => { const a = audioRef.current; if (a) { a.currentTime = Math.max(0, Math.min(t, a.duration || t)); setTime(a.currentTime); } };

  const toggleFav = useCallback((n) => {
    const has = favs.includes(n);
    setFavs(has ? favs.filter((x) => x !== n) : [...favs, n]);
    showToast(has ? `Removed ${SURAHS[n - 1].en} from Liked` : `Added ${SURAHS[n - 1].en} to Liked`);
  }, [favs, showToast]); // eslint-disable-line

  const toggleFavReciter = useCallback((id) => {
    const has = favReciters.includes(id);
    const name = RECITERS.find((r) => r.id === id)?.name;
    setFavReciters(has ? favReciters.filter((x) => x !== id) : [...favReciters, id]);
    showToast(has ? `Removed ${name} from favourites` : `${name} added to favourites`);
  }, [favReciters, showToast]); // eslint-disable-line

  const startSleep = (opt) => {
    if (opt == null) { setSleep(null); showToast("Sleep timer off"); }
    else if (opt === "end") { setSleep({ type: "end" }); showToast("Will stop at the end of this surah"); }
    else { setSleep({ type: "time", at: Date.now() + opt * 60000 }); showToast(`Sleep timer: ${opt} min`); }
  };

  useEffect(() => {
    if (!sleep || sleep.type !== "time") { setSleepLeft(0); return; }
    const tick = () => {
      const left = Math.max(0, Math.round((sleep.at - Date.now()) / 1000));
      setSleepLeft(left);
      if (left <= 0) { audioRef.current?.pause(); setSleep(null); showToast("Sleep timer finished"); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sleep]); // eslint-disable-line

  const onEnded = () => {
    const a = audioRef.current;
    if (sleep?.type === "end") { setSleep(null); showToast("Sleep timer finished"); return; }
    if (repeat === "one") { a.currentTime = 0; a.play(); return; }
    if (repeat === "off" && surah === 114 && !shuffle) { setPlaying(false); return; }
    next();
  };

  const onError = () => {
    if (!triedOther.current) {
      triedOther.current = true;
      const a = audioRef.current;
      resume.current = { t: a.currentTime || 0, play: resume.current.play || !a.paused };
      setMode((m) => (m === "remote" ? "local" : "remote"));
      return;
    }
    setLoading(false);
    setPlaying(false);
    setError("Couldn't load this surah. Check your connection or add the file to /public/audio.");
  };

  // ── lock-screen / media keys
  useEffect(() => {
    if (!surah || !("mediaSession" in navigator)) return;
    const s = SURAHS[surah - 1];
    navigator.mediaSession.metadata = new MediaMetadata({ title: `Surah ${s.en}`, artist: reciter.name, album: "Quran" });
    navigator.mediaSession.setActionHandler("play", toggle);
    navigator.mediaSession.setActionHandler("pause", toggle);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, [surah, reciterId, toggle, next, prev]); // eslint-disable-line

  // ── keyboard shortcuts
  api.current = { toggle, next, prev, seek, toggleFav, surah, volume, setVolume, nowOpen, setNowOpen, time };
  useEffect(() => {
    const h = (e) => {
      const t = e.target;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      const c = api.current;
      switch (e.key) {
        case " ": if (t.tagName === "BUTTON") return; e.preventDefault(); c.toggle(); break;
        case "ArrowRight": c.seek(c.time + 10); break;
        case "ArrowLeft": c.seek(c.time - 10); break;
        case "ArrowUp": e.preventDefault(); c.setVolume(Math.min(1, c.volume + 0.05)); break;
        case "ArrowDown": e.preventDefault(); c.setVolume(Math.max(0, c.volume - 0.05)); break;
        case "n": c.next(); break;
        case "p": c.prev(); break;
        case "m": c.setVolume(c.volume ? 0 : 0.9); break;
        case "l": if (c.surah) c.toggleFav(c.surah); break;
        case "f": c.setNowOpen(!c.nowOpen); break;
        case "Escape": c.setNowOpen(false); break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const value = {
    reciter, reciterId, surah, playing, time, duration, volume, shuffle, repeat, error, loading,
    favs, favReciters, recents, speed, sleep, sleepLeft, toast, nowOpen, lang, setLang, t, mode, last,
    playFrom, shareLink, showToast, audioUrl: surah ? audioUrl(reciter, surah, mode) : null,
    setVolume, setShuffle, setRepeat, setSpeed, setNowOpen, playSurah, toggle, next, prev, seek,
    switchReciter, toggleFav, toggleFavReciter, startSleep,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          setTime(e.target.currentTime);
          const now = Date.now();
          if (restored.current && now - lastSave.current > 5000) {
            lastSave.current = now;
            setLast((l) => (l ? { ...l, t: e.target.currentTime } : l));
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          setLoading(false);
          e.target.playbackRate = speed;
          const { t, play } = resume.current;
          if (t) e.target.currentTime = t;
          if (jump.current && jump.current.n === surah) { const j = jump.current; jump.current = null; jumpNow(e.target, j.n, j.ayah); }
          if (play) e.target.play().catch(() => {});
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={onEnded}
        onError={onError}
      />
    </Ctx.Provider>
  );
}
