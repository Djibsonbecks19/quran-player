"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { useStored } from "@/lib/useStored";
import { toArabicDigits } from "@/lib/i18n";
import Modal from "./Modal";
import { Beads } from "./Icons";

const DHIKR = ["سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله", "أستغفر الله"];
const TARGETS = [33, 99, 100, 0];

export default function Tasbih({ onClose }) {
  const p = usePlayer();
  const [count, setCount] = useStored("q:tasbih:count", 0);
  const [rounds, setRounds] = useStored("q:tasbih:rounds", 0);
  const [target, setTarget] = useStored("q:tasbih:target", 33);
  const [dhikr, setDhikr] = useStored("q:tasbih:dhikr", 0);
  const [tick, setTick] = useState(0); // restarts the tap animation

  const tap = () => {
    setTick((x) => x + 1);
    const n = count + 1;
    if (target && n >= target) {
      setCount(0); setRounds(rounds + 1);
      try { navigator.vibrate?.([30, 40, 60]); } catch {}
      p.showToast(`${target} ✓`);
    } else {
      setCount(n);
      try { navigator.vibrate?.(8); } catch {}
    }
  };
  const reset = () => { setCount(0); setRounds(0); };
  const R = 92, C = 2 * Math.PI * R, frac = target ? count / target : 0;
  const num = (n) => (p.lang === "ar" ? toArabicDigits(n) : n);

  return (
    <Modal title={p.t("tasbih")} icon={Beads} onClose={onClose} width={440}>
      <div className="tb-dhikr ar">{DHIKR[dhikr]}</div>
      <div className="tb-pick">
        {DHIKR.map((d, i) => <button key={d} className={`chip-btn ar ${dhikr === i ? "on" : ""}`} onClick={() => setDhikr(i)}>{d}</button>)}
      </div>
      <button className="tb-btn" onClick={tap} aria-label={`Count ${count}`}>
        <svg viewBox="0 0 200 200" className="tb-ring">
          <circle cx="100" cy="100" r={R} className="tb-track" />
          <circle cx="100" cy="100" r={R} className="tb-fill" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
        </svg>
        <span key={tick} className="tb-num">{num(count)}</span>
        <small>{target ? `/ ${num(target)}` : "∞"}</small>
      </button>
      <div className="tb-foot">
        <div className="tb-targets">
          {TARGETS.map((x) => <button key={x} className={`chip-btn ${target === x ? "on" : ""}`} onClick={() => { setTarget(x); setCount(0); }}>{x || "∞"}</button>)}
        </div>
        <span className="muted">× {num(rounds)}</span>
        <button className="ic bordered" onClick={reset}><RotateCcw size={16} /> {p.t("reset")}</button>
      </div>
    </Modal>
  );
}
