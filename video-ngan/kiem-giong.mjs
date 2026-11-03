// Nghe lại giọng đã tạo bằng ElevenLabs Speech-to-Text (scribe_v1) và so với lời gốc từng cảnh.
//   ELEVENLABS_API_KEY=... node kiem-giong.mjs [i01 …]
// In tỉ lệ khớp theo từ (bỏ dấu câu) và các từ lệch; kết quả lưu giong/<ma>/<canh>.nghe.txt.
// STT hay nghe nhầm tên riêng / tiếng Anh (Implant, veneer, Smile) — chỉ chỗ lệch ĐỔI NGHĨA mới cần tạo lại cảnh.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEO } from "./kich-ban.mjs";

const GOC = path.dirname(fileURLToPath(import.meta.url));
const KHOA = process.env.ELEVENLABS_API_KEY;
if (!KHOA) { console.error("Thiếu ELEVENLABS_API_KEY"); process.exit(1); }

const tu = (s) => s.toLowerCase().replace(/\[[^\]]*\]/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

/** Khoảng cách sửa theo từ → danh sách lệch. */
function soKhop(a, b) {
  const m = a.length, n = b.length, D = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) D[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const lech = []; let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { i--; j--; continue; }
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { lech.unshift(`${a[i - 1]}→${b[j - 1]}`); i--; j--; }
    else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { lech.unshift(`${a[i - 1]}→∅`); i--; }
    else { lech.unshift(`∅→${b[j - 1]}`); j--; }
  }
  return { ty: 1 - D[m][n] / Math.max(1, m), lech };
}

const chon = process.argv.slice(2);
for (const v of VIDEO) {
  if (chon.length && !chon.includes(v.ma)) continue;
  for (const c of v.canh) {
    const f = path.join(GOC, "giong", v.ma, `${c.id}.mp3`);
    if (!fs.existsSync(f)) { console.log(`${v.ma}/${c.id}: chưa có giọng`); continue; }
    const fd = new FormData();
    fd.append("model_id", "scribe_v1");
    fd.append("language_code", "vi");
    fd.append("file", new Blob([fs.readFileSync(f)], { type: "audio/mpeg" }), `${c.id}.mp3`);
    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KHOA }, body: fd });
    if (!r.ok) { console.log(`${v.ma}/${c.id}: STT lỗi ${r.status} ${(await r.text()).slice(0, 200)}`); continue; }
    const nghe = (await r.json()).text ?? "";
    fs.writeFileSync(f.replace(/\.mp3$/, ".nghe.txt"), nghe);
    const { ty, lech } = soKhop(tu(c.noi.join(" ")), tu(nghe));
    console.log(`${ty >= 0.9 ? "✓" : "✗"} ${v.ma}/${c.id}: khớp ${(ty * 100).toFixed(0)}%${lech.length ? " · " + lech.join(", ") : ""}`);
  }
}
