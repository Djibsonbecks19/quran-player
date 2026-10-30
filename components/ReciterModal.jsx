"use client";
import { useEffect, useRef } from "react";
import { X, Heart, Play, CalendarDays, MapPin, Mic } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { BIOS } from "@/data/bios";
import Avatar from "./Avatar";
import { Crescent } from "./Icons";

export default function ReciterModal({ reciter, onClose }) {
  const p = usePlayer();
  const bio = BIOS[reciter.id] || { country: "", status: "", born: "—", role: "Reciter", summary: "No biography added yet.", timeline: [] };
  const closeRef = useRef(null);
  const faved = p.favReciters.includes(reciter.id);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", key, true);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key, true); };
  }, [onClose]);

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rm-title">
        <button className="ic modal-x" ref={closeRef} onClick={onClose} aria-label="Close"><X size={20} /></button>

        <header className="rm-head">
          <Avatar reciter={reciter} size={150} className="rm-avatar" />
          <div className="rm-head-text">
            <div className="rm-chips">
              {bio.country && <span className="chip"><MapPin size={13} /> {bio.country}</span>}
              {bio.status && <span className="chip"><Crescent size={13} /> {bio.status}</span>}
            </div>
            <h2 id="rm-title">{reciter.name}</h2>
            <p className="rm-ar ar">{reciter.ar}</p>
            <div className="hero-actions">
              <button className={`btn-ghost fav-btn ${faved ? "on" : ""}`} aria-pressed={faved} onClick={() => p.toggleFavReciter(reciter.id)}>
                <Heart size={18} fill={faved ? "currentColor" : "none"} /> {faved ? "Favourited" : "Add to favourites"}
              </button>
              <button className="btn-primary" onClick={() => { p.playSurah(1, reciter.id); onClose(); }}>
                <Play size={18} fill="currentColor" /> Play Quran
              </button>
            </div>
          </div>
        </header>

        <div className="rm-stats">
          <div><CalendarDays size={17} /><small>Born</small><b>{bio.born}</b></div>
          <div><Mic size={17} /><small>Known as</small><b>{bio.role}</b></div>
          <div><MapPin size={17} /><small>Country</small><b>{bio.country || "—"}</b></div>
        </div>

        <section className="rm-sec">
          <h3>About</h3>
          <p>{bio.summary}</p>
        </section>

        {bio.timeline.length > 0 && (
          <section className="rm-sec">
            <h3>Timeline</h3>
            <ol className="timeline">
              {bio.timeline.map((e, i) => (
                <li key={i} style={{ "--i": i }}>
                  <span className="tl-y">{e.y}</span>
                  <span className="tl-t">{e.t}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="rm-note">Compiled from public sources and may be incomplete. Please verify before quoting.</p>
      </div>
    </div>
  );
}
