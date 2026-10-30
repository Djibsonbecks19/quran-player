"use client";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const flip = () => {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.classList.add("theming");           // smooth colour fade
    el.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setTimeout(() => el.classList.remove("theming"), 450);
  };
  return (
    <button className="ic theme" onClick={flip} aria-label="Toggle light / dark mode" title="Light / dark mode">
      <span className="theme-ic"><Sun size={19} className="sun" /><Moon size={19} className="moon" /></span>
    </button>
  );
}
