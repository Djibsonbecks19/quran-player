"use client";
import { Users, Check, Timer } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { RECITERS } from "@/data/reciters";
import Popover from "./Popover";
import Avatar from "./Avatar";
import { Mosque } from "./Icons";
import { fmt } from "./Controls";

export function ReciterMenu({ up = true, align = "right" }) {
  const p = usePlayer();
  return (
    <Popover up={up} align={align} trigger={(open, tg) => (
      <button className={`ic bordered ${open ? "on" : ""}`} onClick={tg} aria-label="Switch reciter"><Users size={18} /><span className="hide-sm">{p.t("reciter")}</span></button>
    )}>
      {(close) => (
        <>
          <div className="menu-head"><Mosque size={15} /> {p.t("switchReciter")}</div>
          {RECITERS.map((r) => (
            <button key={r.id} className="menu-item" onClick={() => { p.switchReciter(r.id); close(); }}>
              <Avatar reciter={r} size={34} />
              <span>{r.name}</span>
              {r.id === p.reciterId && <Check size={16} />}
            </button>
          ))}
        </>
      )}
    </Popover>
  );
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
export function SpeedMenu({ up = true, align = "right" }) {
  const p = usePlayer();
  return (
    <Popover up={up} align={align} menuClass="sm" trigger={(open, tg) => (
      <button className={`ic bordered ${open ? "on" : ""}`} onClick={tg} aria-label="Playback speed">{p.speed}x</button>
    )}>
      {(close) => (
        <>
          <div className="menu-head">{p.t("speed")}</div>
          {SPEEDS.map((s) => (
            <button key={s} className="menu-item" onClick={() => { p.setSpeed(s); close(); }}>
              <span>{s}x</span>{p.speed === s && <Check size={16} />}
            </button>
          ))}
        </>
      )}
    </Popover>
  );
}

const SLEEP = [[15, "15 minutes"], [30, "30 minutes"], [45, "45 minutes"], [60, "1 hour"], ["end", "End of surah"]];
export function SleepMenu({ up = true, align = "right" }) {
  const p = usePlayer();
  const active = !!p.sleep;
  return (
    <Popover up={up} align={align} menuClass="sm" trigger={(open, tg) => (
      <button className={`ic bordered ${active ? "on" : open ? "on" : ""}`} onClick={tg} aria-label="Sleep timer">
        <Timer size={18} />
        {p.sleep?.type === "time" && <span className="tabnum">{fmt(p.sleepLeft)}</span>}
        {p.sleep?.type === "end" && <span>End</span>}
      </button>
    )}>
      {(close) => (
        <>
          <div className="menu-head">{p.t("sleepTimer")}</div>
          {SLEEP.map(([v, label]) => (
            <button key={v} className="menu-item" onClick={() => { p.startSleep(v); close(); }}><span>{v === "end" ? p.t("endOfSurah") : label}</span></button>
          ))}
          {active && <button className="menu-item danger" onClick={() => { p.startSleep(null); close(); }}><span>{p.t("turnOff")}</span></button>}
        </>
      )}
    </Popover>
  );
}
