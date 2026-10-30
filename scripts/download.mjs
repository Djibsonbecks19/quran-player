import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const src = fs.readFileSync("data/reciters.js", "utf8");
const all = [...src.matchAll(/id:\s*"([^"]+)".*?server:\s*"([^"]+)"/g)].map((m) => ({ id: m[1], server: m[2] }));
const wanted = process.argv.slice(2);
const targets = wanted.length ? all.filter((r) => wanted.includes(r.id)) : all;
if (!targets.length) { console.log("No matching reciter ids. Available:", all.map((r) => r.id).join(", ")); process.exit(1); }
const pad = (n) => String(n).padStart(3, "0");

async function grab(url, dest) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const tmp = dest + ".part";
      await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmp));
      fs.renameSync(tmp, dest);
      return true;
    } catch (e) {
      if (attempt === 3) { console.log(`  ✗ failed ${url} (${e.message})`); return false; }
    }
  }
}

for (const r of targets) {
  const dir = path.join("public", "audio", r.id);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n▶ ${r.id}`);
  let next = 1;
  const worker = async () => {
    while (next <= 114) {
      const n = next++;
      const dest = path.join(dir, `${pad(n)}.mp3`);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue;
      if (await grab(`${r.server}${pad(n)}.mp3`, dest)) console.log(`  ✓ ${pad(n)}.mp3`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}
console.log("\nDone.");
