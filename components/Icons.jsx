const base = (p) => ({ width: p.size || 20, height: p.size || 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", ...p });

export const Mosque = (p) => (
  <svg {...base(p)}><path d="M12 2v3" /><path d="M7 14a5 5 0 0 1 10 0" /><path d="M5 14h14v7H5z" /><path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3" /><path d="M2 21V9l1.5-2L5 9v12" /><path d="M19 21V9l1.5-2L22 9v12" /></svg>
);
export const Crescent = (p) => (
  <svg {...base(p)}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /><path d="M17 3.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" /></svg>
);
export const QuranBook = (p) => (
  <svg {...base(p)}><path d="M5 4h13a1 1 0 0 1 1 1v14H6a1 1 0 0 0-1 1z" /><path d="M5 4v16" /><path d="M12.5 8.5l.6 1.3 1.4.2-1 1 .3 1.4-1.3-.7-1.3.7.3-1.4-1-1 1.4-.2z" /></svg>
);
export const Beads = (p) => (
  <svg {...base(p)}><circle cx="12" cy="4" r="1.6" /><circle cx="17.5" cy="7" r="1.6" /><circle cx="19" cy="13" r="1.6" /><circle cx="15.5" cy="18.5" r="1.6" /><circle cx="8.5" cy="18.5" r="1.6" /><circle cx="5" cy="13" r="1.6" /><circle cx="6.5" cy="7" r="1.6" /><path d="M12 20.1V23" /></svg>
);
