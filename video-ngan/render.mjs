// Xuất MP4 từ ban-dung/<ma>/ → xuat/<ma>.mp4 (1080×1920, 30 fps).
//   node render.mjs [i01 …]
// Máy không có Chrome của HyperFrames: đặt HYPERFRAMES_BROWSER_PATH tới một Chrome headless có sẵn.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { VIDEO } from "./kich-ban.mjs";

const GOC = path.dirname(fileURLToPath(import.meta.url));
// node render.mjs --sach [ma…] → xuat/<ma>-sach.mp4 (bản không phụ đề, dựng bằng node dung.mjs --sach).
const SACH = process.argv.includes("--sach");
const chon = process.argv.slice(2).filter((x) => !x.startsWith("--"));
fs.mkdirSync(path.join(GOC, "xuat"), { recursive: true });
for (const v of VIDEO) {
  if (chon.length && !chon.includes(v.ma)) continue;
  const ten = SACH ? `${v.ma}-sach` : v.ma;
  const thu = path.join(GOC, "ban-dung", ten);
  if (!fs.existsSync(thu)) { console.error(`${v.ma}: chưa dựng — chạy node dung.mjs ${v.ma}`); continue; }
  const ra = path.join(GOC, "xuat", `${ten}.mp4`);
  execFileSync(path.join(GOC, "node_modules/.bin/hyperframes"), ["render", "-o", ra, "--quiet"], { cwd: thu, stdio: "inherit" });
  console.log(`${v.ma} → ${path.relative(GOC, ra)}`);
}
