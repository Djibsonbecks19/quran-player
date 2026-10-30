"use client";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2 } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";

export const fmt = (t) => {
  if (!isFinite(t)) return "0:00";
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};

export function Slider({ value, max, onChange, label }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <input type="range" aria-label={label} className="slider" min={0} max={max || 1} step="any" value={value}
      style={{ "--p": `${pct}%` }} onChange={(e) => onChange(parseFloat(e.target.value))} />
  );
}

export function Seek() {
  const p = usePlayer();
  return (
    <div className="seek">
      <span>{fmt(p.time)}</span>
      <Slider value={p.time} max={p.duration} onChange={p.seek} label="Seek" />
      <span>{fmt(p.duration)}</span>
    </div>
  );
}

export function Transport() {
  const p = usePlayer();
  return (
    <div className="controls">
      <button className={`ic ${p.shuffle ? "on" : ""}`} onClick={() => p.setShuffle(!p.shuffle)} aria-label="Shuffle"><Shuffle size={18} /></button>
      <button className="ic" onClick={p.prev} aria-label="Previous"><SkipBack size={20} fill="currentColor" /></button>
      <button className={`play-main ${p.playing ? "is-playing" : ""}`} onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"} disabled={!p.surah}>
        {p.loading && p.surah ? <Loader2 size={20} className="spin" /> : p.playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
      <button className="ic" onClick={p.next} aria-label="Next"><SkipForward size={20} fill="currentColor" /></button>
      <button className={`ic ${p.repeat !== "off" ? "on" : ""}`} aria-label="Repeat"
        onClick={() => p.setRepeat(p.repeat === "off" ? "all" : p.repeat === "all" ? "one" : "off")}>
        {p.repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
      </button>
    </div>
  );
}
