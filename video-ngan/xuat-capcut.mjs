// Đóng gói bộ dựng CapCut cho từng video → xuat/capcut/<ma>/ + xuat/capcut/<ma>.zip
//   node dung.mjs && node render.mjs && node dung.mjs --sach && node render.mjs --sach && node xuat-capcut.mjs
// Mỗi bộ: video có/không phụ đề, 3 làn âm thanh tách (giọng, nhạc, hiệu ứng) + bản trộn, phụ đề .srt, ảnh, logo, hướng dẫn.
// Mọi làn âm thanh dài đúng bằng video, bắt đầu từ 0 → kéo thả vào CapCut là khớp, không phải căn lại.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { VIDEO } from "./kich-ban.mjs";
import { ANH } from "./anh-kho.mjs";

const GOC = path.dirname(fileURLToPath(import.meta.url));
const ff = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args]);
const dai = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

/** Đọc các <audio> trong index.html của bản dựng: src, mốc bắt đầu, độ dài, âm lượng. */
function docAudio(thu) {
  const html = fs.readFileSync(path.join(thu, "index.html"), "utf8");
  return [...html.matchAll(/<audio id="([^"]+)" class="clip" src="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*data-volume="([\d.]+)"/g)]
    .map(([, id, src, bd, d, v]) => ({ id, src: path.join(thu, src), bd: +bd, d: +d, v: +v }));
}

/** Trộn một nhóm clip thành một làn dài `tong` giây, mỗi clip đặt đúng mốc và âm lượng như trong video. */
function tronLan(clips, tong, ra) {
  if (!clips.length) return false;
  const vao = clips.flatMap((c) => ["-i", c.src]);
  const loc = clips.map((c, i) => `[${i}:a]atrim=0:${c.d},volume=${c.v},adelay=${Math.round(c.bd * 1000)}:all=1[a${i}]`).join(";");
  const tron = `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,apad,atrim=0:${tong}[ra]`;
  ff([...vao, "-filter_complex", `${loc};${tron}`, "-map", "[ra]", "-ar", "44100", "-b:a", "192k", ra]);
  return true;
}

const HUONG_DAN = (v, tong) => `# Bộ dựng CapCut — ${v.ma} · ${v.ten}

Dọc 9:16 · 1080×1920 · 30 fps · ${tong.toFixed(1)} giây. Mọi file âm thanh dài đúng bằng video và bắt đầu từ giây 0.

| File | Dùng để |
|---|---|
| \`${v.ma}-co-phu-de.mp4\` | Bản hoàn chỉnh — đăng thẳng được |
| \`${v.ma}-khong-phu-de.mp4\` | Hình + âm thanh đầy đủ, KHÔNG phụ đề — để làm phụ đề kiểu CapCut |
| \`am-thanh/giong-doc.mp3\` | Riêng giọng đọc (Hanh - NhaKhoa) |
| \`am-thanh/nhac-nen.mp3\` | Riêng nhạc nền (không lời) |
| \`am-thanh/hieu-ung.mp3\` | Riêng tiếng hiệu ứng (whoosh, pop, click…) |
| \`am-thanh/tron-day-du.mp3\` | Bản trộn y như trong video |
| \`phu-de.srt\` | Phụ đề khớp từng câu (đã soát đúng chính tả với lời đọc) |
| \`anh/\`, \`logo/\` | Ảnh và logo đã dùng trong video |

## Cách 1 — Đăng nhanh, chỉ thêm nhạc trend / sticker
1. CapCut → **Dự án mới** → chọn \`${v.ma}-co-phu-de.mp4\`.
2. Thêm sticker, hiệu ứng, nhạc trend nếu muốn (nhớ hạ nhạc trend xuống ~10–15% để không át giọng).
3. Xuất 1080p · 30 fps.

## Cách 2 — Làm lại phụ đề / chỉnh âm thanh
1. CapCut → **Dự án mới** → chọn \`${v.ma}-khong-phu-de.mp4\`. Bấm vào đoạn video → **Âm lượng = 0** (tắt tiếng gốc).
2. **Âm thanh → Trích xuất / Nhập** lần lượt \`giong-doc.mp3\`, \`nhac-nen.mp3\`, \`hieu-ung.mp3\`; kéo cả ba về **đầu dòng thời gian (00:00)**.
   Giọng 100%, nhạc ~30%, hiệu ứng ~50% (đúng tỉ lệ trong video), hoặc chỉnh theo ý.
3. Phụ đề: **Văn bản → Phụ đề tự động** (chọn tiếng Việt, nguồn = giọng đọc) **hoặc** trên CapCut máy tính:
   **Văn bản → Phụ đề cục bộ / Nhập phụ đề** → chọn \`phu-de.srt\`. Sau đó áp kiểu chữ chung cho tất cả.
   Nếu dùng phụ đề tự động, soát lại các từ: *Implant, veneer, Tâm Đức Smile, inbox* (máy hay nghe nhầm).
4. Giữ vùng an toàn: phụ đề đặt khoảng giữa 60–72% chiều cao khung, cách mép trái/phải ≥ 90 px (tránh nút TikTok).
5. Xuất 1080p · 30 fps.

## Lưu ý nội dung (DNA Tâm Đức Smile)
Không thêm: "không đau", "vĩnh viễn", "100%", "số 1", giá / ưu đãi chưa được xác nhận. Ảnh kho (pexels-*) chỉ làm nền,
không ghi chú như bác sĩ / khách hàng của phòng khám. Giữ dòng miễn trừ ở cảnh cuối.
`;

fs.mkdirSync(path.join(GOC, "xuat", "capcut"), { recursive: true });
const chon = process.argv.slice(2);
for (const v of VIDEO) {
  if (chon.length && !chon.includes(v.ma)) continue;
  const thu = path.join(GOC, "ban-dung", v.ma);
  const coPD = path.join(GOC, "xuat", `${v.ma}.mp4`), khongPD = path.join(GOC, "xuat", `${v.ma}-sach.mp4`);
  if (!fs.existsSync(coPD) || !fs.existsSync(khongPD)) { console.error(`${v.ma}: thiếu xuat/${v.ma}.mp4 hoặc xuat/${v.ma}-sach.mp4`); continue; }
  const ra = path.join(GOC, "xuat", "capcut", v.ma);
  fs.rmSync(ra, { recursive: true, force: true });
  for (const d of ["am-thanh", "anh", "logo"]) fs.mkdirSync(path.join(ra, d), { recursive: true });
  const tong = dai(coPD);

  fs.copyFileSync(coPD, path.join(ra, `${v.ma}-co-phu-de.mp4`));
  fs.copyFileSync(khongPD, path.join(ra, `${v.ma}-khong-phu-de.mp4`));
  fs.copyFileSync(path.join(thu, "phu-de.srt"), path.join(ra, "phu-de.srt"));
  const au = docAudio(thu);
  tronLan(au.filter((a) => a.id.startsWith("giong-")), tong, path.join(ra, "am-thanh", "giong-doc.mp3"));
  tronLan(au.filter((a) => a.id === "nhac-nen").map((a) => ({ ...a, v: 1 })), tong, path.join(ra, "am-thanh", "nhac-nen.mp3"));
  tronLan(au.filter((a) => a.id.startsWith("sfx-")).map((a) => ({ ...a, v: Math.min(1, a.v * 2) })), tong, path.join(ra, "am-thanh", "hieu-ung.mp3"));
  ff(["-i", coPD, "-vn", "-ar", "44100", "-b:a", "192k", path.join(ra, "am-thanh", "tron-day-du.mp3")]);
  for (const [ten] of Object.values(ANH[v.ma] ?? {})) fs.copyFileSync(path.join(GOC, "anh", ten), path.join(ra, "anh", ten));
  for (const f of fs.readdirSync(path.join(GOC, "logo"))) fs.copyFileSync(path.join(GOC, "logo", f), path.join(ra, "logo", f));
  fs.writeFileSync(path.join(ra, "HUONG-DAN-CAPCUT.md"), HUONG_DAN(v, tong));
  const zip = path.join(GOC, "xuat", "capcut", `${v.ma}-capcut.zip`);
  fs.rmSync(zip, { force: true });
  execFileSync("zip", ["-qr", zip, v.ma], { cwd: path.join(GOC, "xuat", "capcut") });
  console.log(`${v.ma} → xuat/capcut/${v.ma}-capcut.zip (${(fs.statSync(zip).size / 1e6).toFixed(1)} MB)`);
}
