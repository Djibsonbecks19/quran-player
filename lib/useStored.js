"use client";
import { useEffect, useState } from "react";

// useState that remembers its value in localStorage
export function useStored(key, initial) {
  const [v, setV] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s !== null) setV(JSON.parse(s)); } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v, ready]);
  return [v, setV, ready];
}
