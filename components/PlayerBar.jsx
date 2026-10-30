"use client";
import { Volume2, VolumeX, Maximize2 } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { SURAHS } from "@/data/surahs";
import Avatar from "./Avatar";
import { Slider, Seek, Transport } from "./Controls";
import { ReciterMenu, SpeedMenu, SleepMenu } from "./Extras";

export default function PlayerBar() {
  const p = usePlayer();
  const s = p.surah ? SURAHS[p.surah - 1] : null;

  return (
    <footer className="player">
      {p.error && <div className="player-error">{p.error}</div>}

      <button className="pl-left" onClick={() => p.setNowOpen(true)} aria-label="Open now playing">
        <Avatar reciter={p.reciter} size={56} className={p.playing ? "pulse" : ""} />
        <div className="pl-meta">
          <div className="pl-title">{s ? `${s.n}. ${s.en}` : p.t("choose")}</div>
          <div className="pl-sub">{p.reciter.name}{s && <span className="ar"> · {s.ar}</span>}</div>
        </div>
      </button>

      <div className="pl-center"><Transport /><Seek /></div>

      <div className="pl-right">
        <ReciterMenu />
        <span className="hide-sm"><SpeedMenu /></span>
        <span className="hide-sm"><SleepMenu /></span>
        <div className="vol hide-sm">
          <button className="ic" onClick={() => p.setVolume(p.volume ? 0 : 0.9)} aria-label="Mute">
            {p.volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <Slider value={p.volume} max={1} onChange={p.setVolume} label="Volume" />
        </div>
        <button className="ic" onClick={() => p.setNowOpen(true)} aria-label="Full screen"><Maximize2 size={18} /></button>
      </div>
    </footer>
  );
}
