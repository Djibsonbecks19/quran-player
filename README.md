# Tilawa – Quran player (Next.js)

    npm install
    npm run dev        # http://localhost:3000
    npm run download -- maher alafasy   # optional: save audio offline

- Reciters / audio links: `data/reciters.js` (DEFAULT_SOURCE = "remote" streams, "local" uses /public/audio)
- Reciter photos: `public/reciters/<id>.jpg`
- Shortcuts: Space play/pause · ←/→ seek 10s · ↑/↓ volume · N next · P previous · M mute · L like · F full screen

- Reciter profiles: edit `data/bios.js` (shown when you click the reciter photo in the big header)
- Favourite reciters are pinned to the top of the sidebar

## v4 additions

- **Share links** – `/surah/18?reciter=maher` (add `&t=95` to start at 1:35). The address bar updates as you listen; the Share button in full-screen copies it.
- **Read along** – full-screen player → *Read along*. Arabic + English (Saheeh International) from alquran.cloud, quran.com as fallback. Highlight timing is *estimated* from verse length (no verse timestamps for these recordings), so it can drift a few seconds; tap a verse to jump to it.
- **Install / offline** – PWA (manifest + `public/sw.js`, active in `npm run build && npm start` / production). *Save offline* in full-screen stores that surah's MP3 in the browser; this only works if the audio host allows CORS, otherwise use `npm run download`.
- **Juz** list (starts at the first verse of each juz), **Continue listening**, **Reciter of the day**, **Daily ayah**, **Tasbih**, **Khatam tracker**, **Prayer times + Qibla** (Aladhan API), **Arabic / RTL** toggle.
- Strings for Arabic live in `lib/i18n.js`.
