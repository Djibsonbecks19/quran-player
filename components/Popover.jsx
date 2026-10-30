"use client";
import { useEffect, useRef, useState } from "react";

export default function Popover({ trigger, children, align = "right", up = true, menuClass = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key, true);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key, true); };
  }, [open]);
  return (
    <div className="pop" ref={ref}>
      {trigger(open, () => setOpen(!open))}
      {open && <div className={`menu ${up ? "up" : "down"} ${align} ${menuClass}`}>{children(() => setOpen(false))}</div>}
    </div>
  );
}
