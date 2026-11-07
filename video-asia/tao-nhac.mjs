// Tạo nhạc nền không lời bằng ElevenLabs Music → nhac/<kieu>.mp3 (chuẩn hoá −16 LUFS).
//   ELEVENLABS_API_KEY=... node tao-nhac.mjs [sang am]
// dung.mjs cắt theo độ dài video, thêm fade vào/ra và đặt nhỏ hơn giọng ~10 dB.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const GOC = path.dirname(fileURLToPath(import.meta.url));
const KHOA = process.env.ELEVENLABS_API_KEY;
if (!KHOA) { console.error("Thiếu ELEVENLABS_API_KEY"); process.exit(1); }

export const NHAC = {
  sang: "Bright, warm, modern instrumental for a friendly dental clinic social video: soft plucked synth, light piano, gentle claps, positive and trustworthy, no vocals, steady 100 BPM, clean mix suitable under voiceover",
  "soi-dong": "Energetic upbeat instrumental for a dental clinic TikTok video: punchy modern pop drums, bouncy bass, bright synth stabs, claps and short risers, confident and fun, no vocals, 124 BPM, leaves space in the mids for a voiceover",
  am: "Gentle emotional instrumental for a family story about caring for an elderly mother: soft felt piano, warm strings pad, hopeful not sad, slow 72 BPM, no vocals, sparse and clean under voiceover, brightening toward the end",
};

const chon = process.argv.slice(2);
fs.mkdirSync(path.join(GOC, "nhac"), { recursive: true });
for (const [kieu, prompt] of Object.entries(NHAC)) {
  if (chon.length && !chon.includes(kieu)) continue;
  const r = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST", headers: { "xi-api-key": KHOA, "content-type": "application/json" },
    body: JSON.stringify({ prompt, music_length_ms: 66000, force_instrumental: true }),
  });
  if (!r.ok) { console.error(`${kieu}: ${r.status} ${(await r.text()).slice(0, 200)}`); continue; }
  const tho = path.join(GOC, "nhac", `${kieu}.tho.mp3`);
  fs.writeFileSync(tho, Buffer.from(await r.arrayBuffer()));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tho, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k", path.join(GOC, "nhac", `${kieu}.mp3`)]);
  fs.rmSync(tho);
  console.log(`nhac/${kieu}.mp3`);
}
