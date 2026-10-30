"use client";
import { Heart, History, Grid3x3, Compass, Download } from "lucide-react";
import { RECITERS } from "@/data/reciters";
import { usePlayer } from "@/lib/PlayerContext";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { Mosque, Crescent, QuranBook, Beads } from "./Icons";

export default function Sidebar({ view, setView, onSelect, onTool, onInstall }) {
  const { reciterId, playing, favs, favReciters, t, lang, setLang } = usePlayer();
  const pinned = RECITERS.filter((r) => favReciters.includes(r.id));
  const rest = RECITERS.filter((r) => !favReciters.includes(r.id));
  const NAV = [["all", t("surahs"), QuranBook], ["juz", t("juz"), Grid3x3], ["favs", t("liked"), Heart], ["recent", t("recent"), History]];
  const TOOLS = [["prayer", t("prayer"), Compass], ["tasbih", t("tasbih"), Beads], ["khatam", t("khatam"), QuranBook]];
  const Item = ({ r, fav }) => (
    <button className={`side-item ${reciterId === r.id ? "active" : ""}`} onClick={() => onSelect(r.id)}>
      <Avatar reciter={r} size={44} />
      <div className="side-meta">
        <span className="side-name">{r.name}</span>
        <span className="side-ar">{r.ar}</span>
      </div>
      {fav && <Heart size={14} fill="currentColor" className="side-heart" />}
      {reciterId === r.id && playing && <span className="eq"><i /><i /><i /></span>}
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Crescent size={22} /></div>
        <div className="brand-txt">
          <div className="brand-name">Tilawa</div>
          <div className="brand-sub">القرآن الكريم</div>
        </div>
        <button className="ic lang-btn" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label="Language">{t("language")}</button>
        <ThemeToggle />
      </div>

      <nav className="nav">
        {NAV.map(([id, label, Icon]) => (
          <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
            <Icon size={18} /> {label}
            {id === "favs" && favs.length > 0 && <b className="count">{favs.length}</b>}
          </button>
        ))}
        <div className="nav-sep" />
        {TOOLS.map(([id, label, Icon]) => (
          <button key={id} className="nav-item" onClick={() => onTool(id)}><Icon size={18} /> {label}</button>
        ))}
        {onInstall && <button className="nav-item" onClick={onInstall}><Download size={18} /> {t("install")}</button>}
      </nav>

      <div className="side-head"><Mosque size={16} /> {t("reciters")}</div>
      <div className="side-list">
        {pinned.length > 0 && <div className="side-sub">{t("favourites")}</div>}
        {pinned.map((r) => <Item key={r.id} r={r} fav />)}
        {pinned.length > 0 && <div className="side-sub">{t("allReciters")}</div>}
        {rest.map((r) => <Item key={r.id} r={r} />)}
      </div>
    </aside>
  );
}
