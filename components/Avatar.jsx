"use client";
import { useEffect, useRef, useState } from "react";

export default function Avatar({ reciter, size = 48, className = "" }) {
  const [broken, setBroken] = useState(false);
  const img = useRef(null);
  useEffect(() => {
    setBroken(false);
    // the image may have already failed before React attached onError (server-rendered page)
    const t = setTimeout(() => { const i = img.current; if (i && i.complete && i.naturalWidth === 0) setBroken(true); }, 0);
    return () => clearTimeout(t);
  }, [reciter.image]);
  const initials = reciter.name.split(" ").filter((w) => !/^(Al|Abdul|Abdulrahman)/i.test(w) || w.length > 3).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div className={`avatar ${className}`} style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {broken ? (
        <span>{initials}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} src={reciter.image} alt={reciter.name} onError={() => setBroken(true)} />
      )}
    </div>
  );
}
