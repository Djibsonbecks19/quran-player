"use client";
import { usePlayer } from "@/lib/PlayerContext";

export default function Toast() {
  const { toast } = usePlayer();
  return <div className="toast-wrap" aria-live="polite">{toast && <div key={toast.id} className="toast">{toast.msg}</div>}</div>;
}
