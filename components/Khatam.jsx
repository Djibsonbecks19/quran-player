"use client";
import { Check, Play } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { useStored } from "@/lib/useStored";
import { JUZ_START } from "@/data/juz";
import { toArabicDigits } from "@/lib/i18n";
import Modal from "./Modal";
import { QuranBook } from "./Icons";

const DAYS = [30, 60, 90];
const today = () => new Date().toISOString().slice(0, 10);

export default function Khatam({ onClose }) {
  const p = usePlayer();
  const [k, setK] = useStored("q:khatam", { start: null, days: 30, done: [] });
  const num = (n) => (p.lang === "ar" ? toArabicDigits(n) : n);
  const started = !!k.start;
  const dayIdx = started ? Math.max(1, Math.floor((Date.now() - new Date(k.start + "T00:00:00").getTime()) / 86400000) + 1) : 0;
  const goal = started ? Math.min(30, Math.ceil((30 * dayIdx) / k.days)) : 0;
  const n = k.done.length;
  const diff = n - goal;
  const next = Array.from({ length: 30 }, (_, i) => i + 1).find((j) => !k.done.includes(j));

  const toggle = (j) => setK({ ...k, start: k.start || today(), done: k.done.includes(j) ? k.done.filter((x) => x !== j) : [...k.done, j] });
  const restart = () => setK({ start: today(), days: k.days, done: [] });

  return (
    <Modal title={p.t("khatam")} icon={QuranBook} onClose={onClose} width={560}>
      <div className="kh-sum">
        <b>{num(n)} / {num(30)}</b>
        <span className="muted">{n === 30 ? "ماشاء الله — تقبل الله ختمتكم 🤲" : started ? (diff >= 0 ? `Day ${dayIdx} · ${diff === 0 ? "on track" : `${diff} juz ahead`}` : `Day ${dayIdx} · ${-diff} juz behind (goal: ${goal} by today)`) : "Tap a juz when you finish it to begin."}</span>
      </div>
      <div className="kh-bar"><i style={{ width: `${(n / 30) * 100}%` }} /></div>
      <div className="kh-grid">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
          <button key={j} className={`kh-cell ${k.done.includes(j) ? "done" : ""}`} onClick={() => toggle(j)} aria-pressed={k.done.includes(j)} aria-label={`${p.t("juzN")} ${j}`}>
            {k.done.includes(j) ? <Check size={16} /> : num(j)}
          </button>
        ))}
      </div>
      <div className="kh-foot">
        <label className="muted">Finish in{" "}
          <select value={k.days} onChange={(e) => setK({ ...k, days: +e.target.value })}>
            {DAYS.map((d) => <option key={d} value={d}>{d} days{d === 30 ? " (Ramadan)" : ""}</option>)}
          </select>
        </label>
        {next && <button className="btn-ghost sm" onClick={() => { const [s, a] = JUZ_START[next - 1]; p.playFrom(s, a); onClose(); }}><Play size={14} fill="currentColor" /> {p.t("juzN")} {num(next)}</button>}
        <button className="ic bordered" onClick={restart}>{p.t("reset")}</button>
      </div>
    </Modal>
  );
}
