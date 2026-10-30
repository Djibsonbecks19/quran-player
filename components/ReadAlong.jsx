"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { loadSurahText, buildTimings, indexAt } from "@/lib/quranText";
import { toArabicDigits } from "@/lib/i18n";
import { useStored } from "@/lib/useStored";

// Arabic text + translation with the current ayah highlighted.
// Highlight timing is estimated (see buildTimings) so it can drift by a few seconds.
export default function ReadAlong() {
  const p = usePlayer();
  const [verses, setVerses] = useState(null);
  const [err, setErr] = useState(false);
  const [showTr, setShowTr] = useStored("q:tr", true);
  const box = useRef(null);
  const lastIdx = useRef(-1);

  useEffect(() => {
    if (!p.surah) return;
    let live = true;
    setVerses(null); setErr(false); lastIdx.current = -1;
    loadSurahText(p.surah).then((v) => live && setVerses(v)).catch(() => live && setErr(true));
    return () => { live = false; };
  }, [p.surah]);

  const starts = useMemo(() => (verses && p.duration ? buildTimings(verses, p.surah, p.duration) : null), [verses, p.duration, p.surah]);
  const cur = starts ? indexAt(starts, p.time) : -1;

  useEffect(() => {
    if (cur < 0 || cur === lastIdx.current || !box.current) return;
    lastIdx.current = cur;
    const el = box.current.querySelector(`[data-i="${cur}"]`);
    if (el) box.current.scrollTo({ top: el.offsetTop - box.current.clientHeight / 3, behavior: "smooth" });
  }, [cur]);

  if (!p.surah) return null;
  return (
    <div className="ra">
      <div className="ra-bar">
        <span>{p.t("readAlong")}</span>
        <button className={`ic bordered ${showTr ? "on" : ""}`} onClick={() => setShowTr(!showTr)} aria-pressed={showTr}><Languages size={16} /> {p.t("translation")}</button>
      </div>
      <div className="ra-box" ref={box}>
        {!verses && !err && <div className="ra-msg"><Loader2 size={18} className="spin" /></div>}
        {err && <div className="ra-msg">Couldn’t load the text. Check your connection.</div>}
        {verses && verses.map((v, i) => (
          <button key={v.n} data-i={i} className={`ra-v ${i === cur ? "cur" : ""}`} onClick={() => starts && p.seek(starts[i])}>
            <span className="ra-ar ar" dir="rtl">{v.ar} <span className="ra-n">﴿{toArabicDigits(v.n)}﴾</span></span>
            {showTr && v.en && <span className="ra-en">{v.en}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
