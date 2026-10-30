"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";

// Shared popup shell for the tools (prayer, tasbih, khatam)
export default function Modal({ title, icon: Icon, onClose, children, width = 560 }) {
  const { t } = usePlayer();
  const closeRef = useRef(null);
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
      <div className="modal tool" style={{ width: `min(${width}px, 100%)` }} role="dialog" aria-modal="true" aria-label={title}>
        <button className="ic modal-x" ref={closeRef} onClick={onClose} aria-label={t("close")}><X size={20} /></button>
        <h2 className="tool-title">{Icon && <Icon size={22} />} {title}</h2>
        {children}
      </div>
    </div>
  );
}
