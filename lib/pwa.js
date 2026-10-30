"use client";
import { useEffect, useState } from "react";

// Registers the service worker (production only) and exposes the "install app" prompt.
export function useInstall() {
  const [ev, setEv] = useState(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const h = (e) => { e.preventDefault(); setEv(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setEv(null));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  return ev ? async () => { ev.prompt(); await ev.userChoice; setEv(null); } : null;
}
