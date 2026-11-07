// Soát kịch bản trước khi lên giọng / dựng:  node kiem-tra.mjs
//  1. noi và phu_de cùng số câu.
//  2. Phụ đề khớp TỪNG CHỮ với lời đọc (bỏ tag, bỏ *, số viết bằng chữ số đổi về cách đọc).
//  3. Rà cụm từ cấm theo DNA Nha khoa Asia (docs/marketing/DNA_NHA_KHOA_ASIA.md) (cùng quy tắc với dental_ai/content_compliance.py).
import { VIDEO, MIEN_TRU, SLOGAN } from "./kich-ban.mjs";

const DOC_SO = [
  ["1900 8040", "một chín không không, tám không bốn không"],
  ["All-on-4", "All on Four"], ["3D", "ba đê"], ["30", "ba mươi"], ["6", "sáu"],
  ["1", "một"], ["2", "hai"], ["3", "ba"], ["4", "bốn"],
];
const boDau = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const chuan = (s) => s.toLowerCase().replace(/\[[^\]]*\]/g, " ").replace(/\*/g, "").replace(/…|\.\.\./g, " ")
  .replace(/[.,!?:;—–\-\/]/g, " ").replace(/\s+/g, " ").trim();
function docPhuDe(s) {
  let x = s;
  for (const [so, chu] of DOC_SO) x = x.replace(new RegExp(`(^|[^\\d])${so.replace(" ", "\\s")}(?![\\d])`, "g"), `$1${chu}`);
  return x;
}

// [mức, mã, regex trên chữ bỏ dấu]
const CAM = [
  ["CẤM", "không đau / không ê buốt", /(100 ?%|hoan toan|tuyet doi|cam ket|dam bao)? ?khong (he )?(dau|e buot)\b/],
  ["CẤM", "tuyệt đối", /100 ?%|vinh vien|tron doi|an toan tuyet doi|chac chan (dep|thanh cong|hieu qua|khoi)|khong (co |gay )?bien chung|khong (can )?mai rang|chinh xac 99/],
  ["CẤM", "so sánh nhất", /\bso (1|mot)\b|hang dau|tot nhat|re nhat|uy tin nhat|dep nhat|duy nhat/],
  ["CẤM", "cam kết kết quả", /(cam ket|dam bao|bao dam) (ket qua|thanh cong|dep|hieu qua|100)/],
  ["CẦN XÁC NHẬN", "giá", /\d[\d.,]*\s*(d|dong|vnd|k|tr|trieu)\b/],
  ["CẦN XÁC NHẬN", "ưu đãi", /giam (gia )?\d+ ?%|tra gop 0|0 ?(d|dong) tra truoc|qua tang|tang kem|mien phi|uu dai|khuyen mai|tuan nay|chi con \d+|so luong co han/],
  ["CẦN XÁC NHẬN", "năm / chi nhánh / đối tác", /(hon|tren) \d+ nam|\d+ nam kinh nghiem|doi tac (kim cuong|diamond)|diamond|\d+ chi nhanh|\d+ co so/],
];

let loi = 0;
const bao = (m) => { loi++; console.log("✗ " + m); };
const chuoi = (c) => [
  ...(c.noi ?? []), ...(c.phu_de ?? []), ...(c.tieu_de ?? []), ...(c.dong ?? []), c.phu ?? "", c.loi ?? "",
  ...(c.muc ?? []).flatMap((m) => [m.chu, m.phu ?? "", m.ra ?? ""]), c.chot?.chu ?? "", ...(c.chip ?? []), ...Object.values(c.khuyen_mai ?? {}),
];

for (const v of VIDEO) {
  let tong = 0;
  for (const c of v.canh) {
    const id = `${v.ma}/${c.id}`;
    if (c.noi.length !== c.phu_de.length) bao(`${id}: noi ${c.noi.length} câu, phu_de ${c.phu_de.length} câu`);
    c.noi.forEach((n, i) => {
      const a = chuan(n), b = chuan(docPhuDe(c.phu_de[i] ?? ""));
      if (a !== b) bao(`${id} câu ${i + 1}: phụ đề lệch lời đọc\n    đọc: ${a}\n    chữ: ${b}`);
      const tag = n.match(/\[[^\]]*\]/g) ?? [];
      if (tag.length > 2) bao(`${id} câu ${i + 1}: quá nhiều tag cảm xúc`);
      if (/\d/.test(n.replace(/\[[^\]]*\]/g, ""))) bao(`${id} câu ${i + 1}: lời đọc còn chữ số — đọc bằng chữ`);
    });
    for (const s of chuoi(c)) for (const [muc, ma, re] of CAM) {
      if (!re.test(boDau(s))) continue;
      if (muc === "CẦN XÁC NHẬN" && (v.xac_nhan ?? []).some((x) => s.includes(x))) { console.log(`  ℹ ${id}: “${s}” — đã được chủ dự án xác nhận`); continue; }
      bao(`${id}: [${muc} · ${ma}] “${s}”`);
    }
    tong += c.noi.map((n) => n.replace(/\[[^\]]*\]/g, "")).join(" ").split(/\s+/).length;
  }
  if (!v.canh.some((c) => c.noi.some((n) => n.includes("[warmly]")))) bao(`${v.ma}: thiếu đoạn [warmly] để lắng`);
  console.log(`${v.ma} · ${v.ten} · ${v.canh.length} cảnh · ~${tong} tiếng ≈ ${Math.round(tong / 4.4)}s`);
}
for (const s of [MIEN_TRU, SLOGAN]) for (const [muc, ma, re] of CAM) if (re.test(boDau(s))) bao(`chung: [${muc} · ${ma}] “${s}”`);
console.log(loi ? `\n${loi} lỗi` : "\n✓ Kịch bản sạch: phụ đề khớp lời đọc, không cụm từ cấm.");
process.exit(loi ? 1 : 0);
