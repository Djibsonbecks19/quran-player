// ─────────────────────────────────────────────────────────────
//  SOURCE MODE
//   "remote" → stream from mp3quran.net, auto-fallback to /public/audio
//   "local"  → use /public/audio/<id>/001.mp3 first, fallback to remote
// ─────────────────────────────────────────────────────────────
export const DEFAULT_SOURCE = "remote";

// `server` = base URL where files are named 001.mp3 … 114.mp3
// `image`  = /public/reciters/<id>.jpg  (add yours; initials avatar shows until then)
// If a server link ever changes, find the new one at https://mp3quran.net
export const RECITERS = [
  { id: "maher",    name: "Maher Al Muaiqly",          ar: "ماهر المعيقلي",       server: "https://server12.mp3quran.net/maher/" },
  { id: "alafasy",  name: "Mishary Rashid Alafasy",    ar: "مشاري راشد العفاسي",  server: "https://server8.mp3quran.net/afs/" },
  { id: "sudais",   name: "Abdulrahman Al-Sudais",     ar: "عبدالرحمن السديس",    server: "https://server11.mp3quran.net/sds/" },
  { id: "shuraim",  name: "Saud Al-Shuraim",           ar: "سعود الشريم",         server: "https://server7.mp3quran.net/shur/" },
  { id: "ghamdi",   name: "Saad Al-Ghamdi",            ar: "سعد الغامدي",         server: "https://server7.mp3quran.net/s_gmd/" },
  { id: "dosari",   name: "Yasser Al-Dosari",          ar: "ياسر الدوسري",        server: "https://server11.mp3quran.net/yasser/" },
  { id: "ajmi",     name: "Ahmad Al-Ajmi",             ar: "أحمد العجمي",         server: "https://server10.mp3quran.net/ajm/" },
  { id: "qatami",   name: "Nasser Al-Qatami",          ar: "ناصر القطامي",        server: "https://server6.mp3quran.net/qtm/" },
  { id: "basit",    name: "Abdul Basit Abdul Samad",   ar: "عبدالباسط عبدالصمد",  server: "https://server7.mp3quran.net/basit/" },
  { id: "husary",   name: "Mahmoud Khalil Al-Husary",  ar: "محمود خليل الحصري",   server: "https://server13.mp3quran.net/husr/" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi",ar: "محمد صديق المنشاوي",  server: "https://server10.mp3quran.net/minsh/" },
].map((r) => ({ ...r, image: `/reciters/${r.id}.jpg` }));

const pad = (n) => String(n).padStart(3, "0");

export function audioUrl(reciter, surahNumber, mode = DEFAULT_SOURCE) {
  const file = `${pad(surahNumber)}.mp3`;
  return mode === "local" ? `/audio/${reciter.id}/${file}` : `${reciter.server}${file}`;
}
