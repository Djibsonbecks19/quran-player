"use client";
import { useCallback, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SurahList from "@/components/SurahList";
import PlayerBar from "@/components/PlayerBar";
import NowPlaying from "@/components/NowPlaying";
import Toast from "@/components/Toast";
import PrayerPanel from "@/components/PrayerPanel";
import Tasbih from "@/components/Tasbih";
import Khatam from "@/components/Khatam";
import { usePlayer } from "@/lib/PlayerContext";
import { useInstall } from "@/lib/pwa";

export default function Home() {
  const { switchReciter } = usePlayer();
  const install = useInstall();
  const [view, setView] = useState("all"); // all | juz | favs | recent
  const [tool, setTool] = useState(null);   // prayer | tasbih | khatam
  const close = useCallback(() => setTool(null), []);
  return (
    <div className="app">
      <Sidebar view={view} setView={setView} onTool={setTool} onInstall={install}
        onSelect={(id) => { switchReciter(id); if (view === "recent" || view === "juz") setView("all"); }} />
      <SurahList view={view} />
      <PlayerBar />
      <NowPlaying />
      <Toast />
      {tool === "prayer" && <PrayerPanel onClose={close} />}
      {tool === "tasbih" && <Tasbih onClose={close} />}
      {tool === "khatam" && <Khatam onClose={close} onJuz={() => setView("juz")} />}
    </div>
  );
}
