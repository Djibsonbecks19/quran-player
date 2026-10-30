"use client";
import { useEffect, useState } from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import { usePlayer } from "@/lib/PlayerContext";
import { loadAyah } from "@/lib/quranText";
import { toArabicDigits } from "@/lib/i18n";
import Avatar from "./Avatar";
import { fmt } from "./Controls";

const dayNumber = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };

export default function HomeStrip() {
  const p = usePlayer();
  const day = dayNumber();
  const rod = RECITERS[day % RECITERS.length];
  const [ayah, setAyah] = useState(null);

  // one ayah per day, picked from the whole Quran (6,236 ayahs)
  useEffect(() => {
    const gn = ((day * 7919) % 6236) + 1;
    const key = `q:ayah:${day}`;
    try { const c = JSON.parse(localStorage.getItem(key) || "null"); if (c) { setAyah(c); return; } } catch {}
    let live = true;
    loadAyah(gn).then((a) => { if (!live) return; setAyah(a); try { localStorage.setItem(key, JSON.stringify(a)); } catch {} }).catch(() => {});
    return () => { live = false; };
  }, [day]);

  const l = p.last;
  const cont = l && l.n && RECITERS.find((r) => r.id === l.r);

  return (
    <div className="strip">
      {cont && (
        <button className="card" onClick={() => { p.playFrom(l.n, 1, l.r); if (l.t > 5) setTimeout(() => p.seek(l.t), 600); }}>
          <span className="card-k"><RotateCcw size={14} /> {p.t("continue")}</span>
          <b>{l.n}. {SURAHS[l.n - 1].en}</b>
          <small>{cont.name}{l.t > 5 ? ` · ${fmt(l.t)}` : ""}</small>
          <span className="card-go"><Play size={14} fill="currentColor" /> {p.t("resume")}</span>
        </button>
      )}
      <button className="card" onClick={() => p.switchReciter(rod.id)}>
        <span className="card-k"><Sparkles size={14} /> {p.t("reciterOfDay")}</span>
        <span className="card-row"><Avatar reciter={rod} size={42} /><span><b>{rod.name}</b><small className="ar">{rod.ar}</small></span></span>
        <span className="card-go"><Play size={14} fill="currentColor" /> {p.t("listen")}</span>
      </button>
      {ayah && (
        <div className="card ayah-card">
          <span className="card-k">{p.t("dailyAyah")} · {SURAHS[ayah.surah - 1].en} {ayah.surah}:{ayah.n}</span>
          <span className="ar ayah-ar" dir="rtl">{ayah.ar} ﴿{toArabicDigits(ayah.n)}﴾</span>
          <small className="ayah-en">{ayah.en}</small>
          <button className="card-go" onClick={() => p.playFrom(ayah.surah, ayah.n)}><Play size={14} fill="currentColor" /> {p.t("playFromHere")}</button>
        </div>
      )}
    </div>
  );
}
