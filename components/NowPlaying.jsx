"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, BookOpen, Share2, DownloadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { SURAHS } from "@/data/surahs";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { Seek, Transport } from "./Controls";
import { ReciterMenu, SpeedMenu, SleepMenu } from "./Extras";
import ReadAlong from "./ReadAlong";
import { isSaved, saveAudio, removeAudio } from "@/lib/offline";

const BARS = Array.from({ length: 36 }, (_, i) => ({ d: 0.6 + ((i * 37) % 10) / 11, delay: -((i * 53) % 10) / 9, h: 30 + ((i * 29) % 70) }));

export default function NowPlaying() {
  const p = usePlayer();
  const s = p.surah ? SURAHS[p.surah - 1] : null;
  const liked = s && p.favs.includes(s.n);
  const [read, setRead] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = p.audioUrl;
  useEffect(() => { setSaved(false); if (url) isSaved(url).then(setSaved); }, [url]);
  const toggleOffline = async () => {
    if (!url || busy) return;
    setBusy(true);
    try {
      if (saved) { await removeAudio(url); setSaved(false); p.showToast("Offline copy removed"); }
      else { p.showToast("Saving… large surahs can take a while"); await saveAudio(url); setSaved(true); p.showToast("Saved — plays without internet"); }
    } catch { p.showToast("This stream can’t be saved. Try npm run download instead."); }
    setBusy(false);
  };

  return (
    <section className={`np ${p.nowOpen ? "open" : ""}`} aria-hidden={!p.nowOpen} aria-label="Now playing">
      <div className="np-bg" style={{ backgroundImage: `url(${p.reciter.image})` }} />
      <div className="np-top">
        <button className="ic" onClick={() => p.setNowOpen(false)} aria-label="Close"><ChevronDown size={24} /></button>
        <span className="np-label">{p.t("nowPlaying")}</span>
        <ThemeToggle />
      </div>

      <div className="np-body">
        <div className={`np-art ${p.playing ? "playing" : ""}`}>
          <svg className="np-ring" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.35">
            <circle cx="50" cy="50" r="49" strokeDasharray="0.6 1.8" />
            <rect x="12" y="12" width="76" height="76" />
            <rect x="12" y="12" width="76" height="76" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="40" />
          </svg>
          <Avatar reciter={p.reciter} size={300} className="np-avatar" />
        </div>

        <div className="np-ar ar" key={p.surah || 0}>{s ? s.ar : "القرآن الكريم"}</div>
        <div className="np-title">{s ? `${s.n}. ${s.en}` : p.t("choose")}</div>
        <div className="np-sub">{p.reciter.name}</div>

        <div className={`viz ${p.playing ? "on" : ""}`} aria-hidden="true">
          {BARS.map((b, i) => <i key={i} style={{ "--d": `${b.d}s`, "--delay": `${b.delay}s`, "--h": `${b.h}%` }} />)}
        </div>

        <div className="np-controls"><Seek /><Transport /></div>

        <div className="np-tools">
          <button className={`ic bordered heart ${liked ? "liked" : ""}`} disabled={!s} onClick={() => s && p.toggleFav(s.n)} aria-label="Like">
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </button>
          <ReciterMenu align="left" />
          <SpeedMenu align="center" />
          <SleepMenu align="right" />
        </div>
        <div className="np-tools">
          <button className={`ic bordered ${read ? "on" : ""}`} disabled={!s} onClick={() => setRead(!read)} aria-pressed={read}><BookOpen size={18} /> {p.t("readAlong")}</button>
          <button className="ic bordered" disabled={!s} onClick={() => p.shareLink(true)}><Share2 size={18} /> {p.t("share")}</button>
          <button className={`ic bordered ${saved ? "on" : ""}`} disabled={!s} onClick={toggleOffline} title={saved ? p.t("removeOffline") : p.t("saveOffline")}>
            {busy ? <Loader2 size={18} className="spin" /> : saved ? <CheckCircle2 size={18} /> : <DownloadCloud size={18} />} {saved ? p.t("savedOffline") : p.t("saveOffline")}
          </button>
        </div>
        {read && <ReadAlong />}
      </div>
    </section>
  );
}
