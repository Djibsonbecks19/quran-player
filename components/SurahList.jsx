"use client";
import { useCallback, useMemo, useState } from "react";
import { Play, Pause, Search, Shuffle, Heart, Info } from "lucide-react";
import { SURAHS } from "@/data/surahs";
import { RECITERS } from "@/data/reciters";
import { usePlayer } from "@/lib/PlayerContext";
import Avatar from "./Avatar";
import { QuranBook } from "./Icons";
import ReciterModal from "./ReciterModal";
import HomeStrip from "./HomeStrip";
import { JUZ_START } from "@/data/juz";
import { toArabicDigits } from "@/lib/i18n";

const TABS = ["All", "Meccan", "Medinan"];

export default function SurahList({ view }) {
  const p = usePlayer();
  const { reciter, reciterId, t } = p;
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("All");
  const [profile, setProfile] = useState(false);
  const closeProfile = useCallback(() => setProfile(false), []);
  const reciterFaved = p.favReciters.includes(reciterId);

  const items = useMemo(() => {
    let base = view === "recent"
      ? p.recents.map((x) => ({ ...SURAHS[x.n - 1], r: x.r }))
      : SURAHS.map((s) => ({ ...s, r: reciterId }));
    if (view === "favs") base = base.filter((s) => p.favs.includes(s.n));
    if (view === "all" && tab !== "All") base = base.filter((s) => s.type === tab);
    const s = q.trim().toLowerCase();
    if (s) base = base.filter((x) => x.en.toLowerCase().includes(s) || x.ar.includes(s) || String(x.n) === s);
    return base;
  }, [view, tab, q, reciterId, p.favs, p.recents]);

  const isCurrent = (s) => p.surah === s.n && p.reciterId === s.r;
  const playRandom = () => { p.setShuffle(true); p.playSurah(Math.ceil(Math.random() * 114), reciterId); };
  const nameOf = (id) => RECITERS.find((r) => r.id === id)?.name;

  return (
    <>
    <main className="main">
      {view === "all" ? (
        <section className="hero" key={reciterId}>
          <button className="hero-avatar-btn" onClick={() => setProfile(true)} aria-label={`About ${reciter.name}`}>
            <Avatar reciter={reciter} size={168} className="hero-avatar" />
            {reciterFaved && <span className="fav-badge" title="Favourite reciter"><Heart size={14} fill="currentColor" /></span>}
            <span className="avatar-hint"><Info size={15} /> Profile</span>
          </button>
          <div className="hero-text">
            <span className="chip"><QuranBook size={14} /> {t("reciter")}</span>
            <h1>{p.lang === "ar" ? reciter.ar : reciter.name}</h1>
            <p className="hero-ar">{p.lang === "ar" ? reciter.name : reciter.ar}</p>
            <p className="hero-sub">{t("fullQuran")}</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => p.playSurah(1, reciterId)}><Play size={18} fill="currentColor" /> {t("playQuran")}</button>
              <button className="btn-ghost" onClick={playRandom}><Shuffle size={18} /> {t("shuffle")}</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="page-head">
          <h1>{view === "favs" ? t("likedTitle") : view === "juz" ? t("juzTitle") : t("recentTitle")}</h1>
          <p>{view === "favs" ? `${p.favs.length} ${t("saved")}` : view === "juz" ? t("juzSub") : t("pickUp")}</p>
        </section>
      )}

      {view === "all" && <HomeStrip />}

      {view === "juz" ? (
        <div className="juz-grid">
          {JUZ_START.map(([sn, an], i) => (
            <button key={i} className="juz" onClick={() => p.playFrom(sn, an, reciterId)}>
              <span className="juz-n">{p.lang === "ar" ? toArabicDigits(i + 1) : i + 1}</span>
              <span className="juz-t"><b>{t("juzN")} {p.lang === "ar" ? toArabicDigits(i + 1) : i + 1}</b>
                <small>{t("startsAt")} {SURAHS[sn - 1].en} · {t("ayah")} {an}</small></span>
              <span className="ar juz-ar">{SURAHS[sn - 1].ar}</span>
            </button>
          ))}
        </div>
      ) : (<>
      <div className="toolbar">
        <div className="searchbar">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} />
        </div>
        {view === "all" && (
          <div className="tabs" role="tablist">
            {TABS.map((x) => <button key={x} role="tab" aria-selected={tab === x} className={tab === x ? "on" : ""} onClick={() => setTab(x)}>{t(x)}</button>)}
          </div>
        )}
      </div>

      <div className={`table view-${view}`}>
        <div className="row head">
          <span>#</span><span>{t("colSurah")}</span><span className="hide-sm">{t("colRevelation")}</span><span className="hide-sm right">{t("colAyahs")}</span><span /><span />
        </div>
        {items.map((s) => {
          const cur = isCurrent(s);
          const liked = p.favs.includes(s.n);
          return (
            <div key={`${s.n}-${s.r}`} className={`row item ${cur ? "current" : ""}`} onClick={() => p.playSurah(s.n, s.r)}>
              <span className="num">{cur && p.playing ? <span className="eq"><i /><i /><i /></span> : s.n}</span>
              <div className="title">
                <div>
                  <b>{s.en}</b>
                  <small>{view === "recent" ? nameOf(s.r) : `${s.ayahs} ${t("ayahs")}`}</small>
                </div>
                <span className="ar">{s.ar}</span>
              </div>
              <span className="hide-sm muted">{t(s.type)}</span>
              <span className="hide-sm muted right">{s.ayahs}</span>
              <button className={`heart ${liked ? "liked" : ""}`} aria-label={liked ? "Unlike" : "Like"}
                onClick={(e) => { e.stopPropagation(); p.toggleFav(s.n); }}>
                <Heart size={17} fill={liked ? "currentColor" : "none"} />
              </button>
              <button className="play-btn" aria-label={`Play ${s.en}`} onClick={(e) => { e.stopPropagation(); p.playSurah(s.n, s.r); }}>
                {cur && p.playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
            </div>
          );
        })}
        {!items.length && (
          <div className="empty">
            {q ? `${t("noMatch")} “${q}”.`
              : view === "favs" ? t("emptyFavs")
              : t("emptyRecent")}
          </div>
        )}
      </div>
      </>)}
    </main>
    {profile && <ReciterModal reciter={reciter} onClose={closeProfile} />}
    </>
  );
}
