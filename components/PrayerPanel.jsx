"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, LocateFixed, Loader2, Navigation2 } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { useStored } from "@/lib/useStored";
import Modal from "./Modal";

const METHODS = [["3", "Muslim World League"], ["2", "ISNA (North America)"], ["4", "Umm al-Qura (Makkah)"], ["5", "Egyptian General Authority"], ["1", "Karachi"], ["21", "Morocco"], ["12", "France (UOIF)"], ["13", "Turkey (Diyanet)"], ["18", "Tunisia"], ["19", "Algeria"]];
const NAMES = [["Fajr", "الفجر"], ["Sunrise", "الشروق"], ["Dhuhr", "الظهر"], ["Asr", "العصر"], ["Maghrib", "المغرب"], ["Isha", "العشاء"]];
const KAABA = { lat: 21.422487, lon: 39.826206 };

export function qiblaBearing(lat, lon) {
  const r = Math.PI / 180, dl = (KAABA.lon - lon) * r, f1 = lat * r, f2 = KAABA.lat * r;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return ((Math.atan2(y, x) / r) + 360) % 360;
}
const toMin = (hhmm) => { const m = /(\d{1,2}):(\d{2})/.exec(hhmm || ""); return m ? +m[1] * 60 + +m[2] : 0; };
const nowSecIn = (tz) => {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date());
    const g = (t) => +parts.find((x) => x.type === t).value % 24;
    return g("hour") * 3600 + g("minute") * 60 + g("second");
  } catch { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); }
};
const dmy = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`; };
const hms = (s) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function PrayerPanel({ onClose }) {
  const p = usePlayer();
  const [method, setMethod] = useStored("q:pt:method", "3");
  const [data, setData] = useStored("q:pt:data", null); // { date, lat, lon, label, timings, tz, hijri, method }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [now, setNow] = useState(0);
  const [heading, setHeading] = useState(null);
  const askedAuto = useRef(false);

  const fetchTimes = async (url, label, coords) => {
    setBusy(true); setErr("");
    try {
      const r = await fetch(url);
      const j = await r.json();
      if (!r.ok || j.code !== 200) throw new Error(j.data || "failed");
      const d = j.data;
      setData({
        date: dmy(), label, method,
        lat: coords?.lat ?? d.meta.latitude, lon: coords?.lon ?? d.meta.longitude,
        timings: d.timings, tz: d.meta.timezone,
        hijri: `${d.date.hijri.day} ${d.date.hijri.month.en} ${d.date.hijri.year} AH`,
      });
    } catch { setErr("Couldn’t get prayer times (offline or place not found)."); }
    setBusy(false);
  };
  const locate = () => {
    if (!navigator.geolocation) { setErr("Location isn’t available. Enter a city instead."); return; }
    setBusy(true); setErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { const { latitude: lat, longitude: lon } = pos.coords; fetchTimes(`https://api.aladhan.com/v1/timings/${dmy()}?latitude=${lat}&longitude=${lon}&method=${method}`, "Your location", { lat, lon }); },
      () => { setBusy(false); setErr("Location was blocked. Enter a city below instead."); },
      { timeout: 10000, maximumAge: 600000 }
    );
  };
  const byCity = (e) => {
    e.preventDefault();
    if (!city.trim() || !country.trim()) return;
    fetchTimes(`https://api.aladhan.com/v1/timingsByCity/${dmy()}?city=${encodeURIComponent(city.trim())}&country=${encodeURIComponent(country.trim())}&method=${method}`, `${city.trim()}, ${country.trim()}`);
  };

  // refresh when the day or method changed since the saved result
  useEffect(() => {
    if (!data || askedAuto.current) return;
    askedAuto.current = true;
    if (data.date !== dmy() || data.method !== method) {
      const u = `https://api.aladhan.com/v1/timings/${dmy()}?latitude=${data.lat}&longitude=${data.lon}&method=${method}`;
      fetchTimes(u, data.label, { lat: data.lat, lon: data.lon });
    }
  }, [data]); // eslint-disable-line

  useEffect(() => { const id = setInterval(() => setNow((x) => x + 1), 1000); return () => clearInterval(id); }, []);

  const changeMethod = (m) => {
    setMethod(m);
    if (data) fetchTimes(`https://api.aladhan.com/v1/timings/${dmy()}?latitude=${data.lat}&longitude=${data.lon}&method=${m}`, data.label, { lat: data.lat, lon: data.lon });
  };

  const next = useMemo(() => {
    if (!data) return null;
    const cur = nowSecIn(data.tz);
    const list = NAMES.filter(([k]) => k !== "Sunrise").map(([k, ar]) => ({ k, ar, s: toMin(data.timings[k]) * 60 }));
    const up = list.find((x) => x.s > cur);
    return up ? { ...up, left: up.s - cur } : { ...list[0], left: list[0].s + 86400 - cur };
  }, [data, now]); // eslint-disable-line

  // compass
  const bearing = data ? qiblaBearing(data.lat, data.lon) : null;
  const startCompass = async () => {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) {
        if ((await DeviceOrientationEvent.requestPermission()) !== "granted") return;
      }
      const h = (e) => {
        const v = e.webkitCompassHeading != null ? e.webkitCompassHeading : e.alpha != null ? (360 - e.alpha) % 360 : null;
        if (v != null) setHeading(v);
      };
      window.addEventListener("deviceorientationabsolute", h, true);
      window.addEventListener("deviceorientation", h, true);
    } catch { setErr("Compass isn’t available on this device."); }
  };
  const needle = bearing == null ? 0 : bearing - (heading ?? 0);

  return (
    <Modal title={p.t("prayer")} icon={Compass} onClose={onClose} width={560}>
      {!data && (
        <div className="pt-start">
          <p className="muted">Prayer times and the Qibla direction need your location. It’s only used to ask the free Aladhan service for today’s times.</p>
          <button className="btn-primary" onClick={locate} disabled={busy}>{busy ? <Loader2 size={18} className="spin" /> : <LocateFixed size={18} />} Use my location</button>
          <form className="pt-city" onSubmit={byCity}>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g. Dakar)" />
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (e.g. Senegal)" />
            <button className="btn-ghost sm" disabled={busy}>Go</button>
          </form>
        </div>
      )}
      {err && <div className="pt-err">{err}</div>}
      {data && (
        <>
          {next && (
            <div className="pt-next">
              <span className="muted">Next · {data.label}</span>
              <b>{next.k} <span className="ar">{next.ar}</span></b>
              <span className="pt-count tabnum">{hms(next.left)}</span>
            </div>
          )}
          <div className="pt-list">
            {NAMES.map(([k, ar]) => (
              <div key={k} className={`pt-row ${next && next.k === k ? "cur" : ""}`}>
                <span>{k}</span><span className="ar muted">{ar}</span><b className="tabnum">{String(data.timings[k]).slice(0, 5)}</b>
              </div>
            ))}
          </div>
          <div className="pt-meta muted">{data.hijri} <button className="link" onClick={() => setData(null)}>Change place</button></div>

          <div className="pt-method">
            <label className="muted">Calculation method{" "}
              <select value={method} onChange={(e) => changeMethod(e.target.value)}>{METHODS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
            </label>
          </div>

          <div className="qibla">
            <div className="q-dial" aria-label={`Qibla ${Math.round(bearing)} degrees from north`}>
              <i className="q-n">N</i>
              <div className="q-needle" style={{ transform: `rotate(${needle}deg)` }}><Navigation2 size={34} fill="currentColor" /></div>
              <span className="q-kaaba">🕋</span>
            </div>
            <div className="q-info">
              <b>Qibla · {Math.round(bearing)}°</b>
              <small className="muted">{heading == null ? "Measured clockwise from north. Face north and the arrow shows the way." : "Turn until the arrow points straight up."}</small>
              <button className="btn-ghost sm" onClick={startCompass}>Use phone compass</button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
