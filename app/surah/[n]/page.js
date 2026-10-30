import Home from "../../page";
import { SURAHS } from "@/data/surahs";

// /surah/18?reciter=maher opens the same app, cued to that surah (see PlayerContext → readLink)
export function generateMetadata({ params }) {
  const s = SURAHS[parseInt(params.n, 10) - 1];
  if (!s) return {};
  return {
    title: `${s.en} (${s.ar}) — Tilawa`,
    description: `Listen to Surah ${s.en} · ${s.ayahs} ayahs.`,
    openGraph: { title: `Surah ${s.en} — Tilawa`, description: `Listen to Surah ${s.en} (${s.ar}).` },
  };
}
export default function SurahPage() { return <Home />; }
