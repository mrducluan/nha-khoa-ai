// Dựng dự án HyperFrames cho 6 video nha khoa từ kich-ban.mjs.
//   node dung.mjs            → dựng cả 6 vào ban-dung/<ma>/
//   node dung.mjs i01 s02    → chỉ dựng video chỉ định
// Có giọng thật (giong/<ma>/<canh>.json + .mp3 do tao-giong.mjs sinh) → cảnh dài theo giọng, phụ đề khớp từng câu.
// Chưa có giọng → thời lượng ước theo số âm tiết để duyệt hình.
//
// BỐ CỤC CỐ ĐỊNH (khung 1080 × 1920) — chữ và hình không bao giờ chồng nhau:
//   y 150–215   thương hiệu (nền)            y 250–470   tiêu đề cảnh
//   y 490–1130  vùng hình / thẻ              y 1190–1370 phụ đề karaoke
//   y 1450      khẩu hiệu mờ (nền)           lề trái/phải ≥ 90 px (tránh cột nút TikTok bên phải)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEO, MIEN_TRU, HOTLINE, SLOGAN, CTA_NUT, CTA_PHU } from "./kich-ban.mjs";
import { HINH, MAU, defs, logoSvg } from "./minh-hoa.mjs";
import { ANH, DO_CHE } from "./anh-kho.mjs";

const GOC = path.dirname(fileURLToPath(import.meta.url));
// Logo chính thức: đặt file vào logo/ (png/svg/webp). Có logo → CTA và đầu khung dùng logo thật; chưa có → chữ + biểu tượng răng.
const LOGO = fs.existsSync(path.join(GOC, "logo")) ? fs.readdirSync(path.join(GOC, "logo")).find((f) => /\.(png|svg|webp|jpe?g)$/i.test(f)) : null;
const RANG_LOGO = "M-70 40 C-70 8 -32 -2 -12 12 C0 4 12 4 22 12 C40 -2 70 8 70 40 L68 118 C66 160 50 200 34 200 C20 200 16 150 0 150 C-16 150 -20 200 -34 200 C-50 200 -66 160 -68 118 Z";
const W = 1080, H = 1920;
const VUNG = { tieuDe: 250, hinh: 490, hinhCao: 640, phuDe: 1190 };
const TOC_DO = 4.4;        // âm tiết / giây khi chưa có giọng
const DAU_GIONG = 0.15;    // giọng vào sau đầu cảnh
const DUOI_CANH = 0.5;     // khoảng lặng cuối cảnh

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const boTag = (s) => s.replace(/\[[^\]]*\]\s*/g, "").trim();
const amTiet = (s) => boTag(s).split(/\s+/).filter(Boolean).length;
const r3 = (x) => Math.round(x * 1000) / 1000;
const toMau = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

function hat(n) { let x = n; return () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296); }

const PHONG = `
@font-face { font-family: "BVP"; src: url("assets/fonts/BeVietnamPro-400.ttf"); font-weight: 400; }
@font-face { font-family: "BVP"; src: url("assets/fonts/BeVietnamPro-600.ttf"); font-weight: 600; }
@font-face { font-family: "BVP"; src: url("assets/fonts/BeVietnamPro-800.ttf"); font-weight: 800; }
@font-face { font-family: "BVP"; src: url("assets/fonts/BeVietnamPro-900.ttf"); font-weight: 900; }
@font-face { font-family: "NR"; src: url("assets/fonts/Newsreader-500i.ttf"); font-weight: 500; font-style: italic; }`;

const CHUNG = `${PHONG}
#root { position: absolute; inset: 0; font-family: "BVP"; color: ${MAU.chu}; }
.khung { position: absolute; inset: 0; }
.hl { color: ${MAU.vang}; }
.tde { position: absolute; left: 90px; right: 90px; text-align: center; font-weight: 900; line-height: 1.14; letter-spacing: -0.015em; }
.tde .w { display: inline-block; }
.nho { position: absolute; left: 110px; right: 110px; text-align: center; font-weight: 700; font-size: 44px; line-height: 1.3; color: ${MAU.mo}; }
.hinh { position: absolute; left: 90px; top: ${VUNG.hinh}px; width: 900px; height: ${VUNG.hinhCao}px; overflow: visible; }
.anhnen { position: absolute; inset: 0; overflow: hidden; }
.anhnen img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.anhmo { position: absolute; inset: 0; background: ${MAU.nen}; }
.anhphu { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6,24,38,0.9) 0%, rgba(6,24,38,0.55) 11%, rgba(6,24,38,0) 30%, rgba(6,24,38,0) 54%, rgba(6,24,38,0.88) 62%, rgba(6,24,38,0.97) 72%, rgba(6,24,38,0.97) 100%); }
.coanh .tde { text-shadow: 0 6px 24px rgba(0,0,0,0.75), 0 2px 0 rgba(0,0,0,0.45); }
.pan { position: absolute; left: 66px; top: ${VUNG.hinh - 24}px; width: 948px; height: ${VUNG.hinhCao + 48}px; border-radius: 44px; background: rgba(6,24,38,0.74); border: 2px solid rgba(255,255,255,0.08); box-shadow: 0 30px 80px rgba(0,0,0,0.45); }
.quang { position: absolute; left: 190px; top: ${VUNG.hinh + 40}px; width: 700px; height: 560px; border-radius: 50%; background: radial-gradient(closest-side, rgba(108,196,255,0.28), rgba(79,224,200,0.10) 55%, rgba(79,224,200,0) 100%); opacity: 0; }
.chip { display: inline-block; padding: 14px 30px; border-radius: 999px; background: rgba(79,224,200,0.12); border: 2px solid rgba(79,224,200,0.6); color: ${MAU.ngoc}; font-weight: 800; font-size: 36px; white-space: nowrap; }
`;

/** Cỡ chữ để một dòng vừa 900 px (chữ đậm có dấu ≈ 0,58 em mỗi ký tự). */
const co = (s, max = 92) => Math.min(max, Math.floor(900 / (s.replace(/\*/g, "").length * 0.58)));

function tachTu(s, lop = "w") {
  return s.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((doan) => {
    const vang = doan.startsWith("*");
    const t = vang ? doan.slice(1, -1) : doan;
    return t.split(/\s+/).filter(Boolean).map((w) => `<span class="${lop}${vang ? " hl" : ""}">${esc(w)}</span>`);
  }).join(" ");
}

/** Tiêu đề cảnh (1–2 dòng) trong vùng y 250–470. */
function tieuDe(p, dong, dau0 = false) {
  if (!dong?.length) return { html: "", js: "" };
  const fs = Math.min(...dong.map((x) => co(x, dong.length > 1 ? 92 : 96)));
  const cao = Math.round(fs * 1.16);
  const dau = dong.length > 1 ? VUNG.tieuDe : VUNG.tieuDe + 50;
  return {
    html: dong.map((s, i) => `<div id="${p}-td${i}" class="tde" style="top:${dau + i * cao}px; font-size:${fs}px; white-space:nowrap">${tachTu(s)}</div>`).join(""),
    // Cảnh mở đầu: tiêu đề hiện ngay từ khung 0 (ảnh bìa TikTok/Reels không bị trống), chỉ "đập" nhẹ.
    js: dong.map((_, i) => dau0 ? `
tl.fromTo("#${p}-td${i}", {scale:1.12}, {scale:1, duration:0.45, ease:"back.out(2)"}, ${r3(i * 0.12)});` : `
tl.fromTo("#${p}-td${i} .w", {opacity:0, y:24, filter:"blur(8px)"}, {opacity:1, y:0, filter:"blur(0px)", duration:0.32, stagger:0.06, ease:"power3.out"}, ${r3(0.05 + i * 0.28)});`).join(""),
  };
}

// ---------------------------------------------------------------- kiểu cảnh
const KIEU = {
  minh_hoa(c, x) {
    const f = HINH[c.hinh];
    if (!f) throw new Error(`Chưa có hình ${c.hinh}`);
    const h = f(c, x);
    const td = tieuDe(x.p, c.tieu_de, x.dau);
    return {
      css: "",
      // Quầng sáng sau hình + máy quay đẩy chậm (Ken Burns) + ánh kim quét qua trụ Implant.
      html: `${td.html}<div id="${x.p}-quang" class="quang"></div><svg id="${x.p}-svg" class="hinh" viewBox="0 0 900 640">${defs(x.p)}${h.svg}</svg>`,
      js: `${x.anhDau ? `tl.set("#${x.p}-svg", {opacity:0}, 0);` : `tl.fromTo("#${x.p}-svg", {opacity:${x.dau ? 1 : 0}, scale:0.96}, {opacity:1, scale:1, duration:0.5, ease:"expo.out"}, 0.05);`}
tl.to("#${x.p}-svg", {scale:1.025, duration:${r3(Math.max(1, x.d - 0.8))}, ease:"none"}, 0.55);
tl.fromTo("#${x.p}-quang", {opacity:0, scale:0.8}, {opacity:1, scale:1, duration:0.8, ease:"expo.out"}, 0.05);
tl.to("#${x.p}-quang", {scale:1.12, opacity:0.7, duration:1.8, yoyo:true, repeat:${Math.max(1, Math.floor(x.d / 1.8) - 1)}, ease:"sine.inOut"}, 0.9);
tl.fromTo(".${x.p}-bong-ti", {x:0}, {x:240, duration:1.4, repeat:${Math.max(0, Math.floor(x.d / 2.4) - 1)}, repeatDelay:1, ease:"power1.inOut"}, 0.8);${td.js}\n${h.js}`,
      sfx: h.sfx ?? [],
    };
  },

  danh_sach(c, x) {
    const { p, d, moc } = x;
    const n = c.muc.length;
    const GAP = 24, CHOT = c.chot ? 120 : 0;
    const cao = Math.min(150, Math.floor((VUNG.hinhCao - CHOT - (n - 1) * GAP) / n));
    const tongCao = n * cao + (n - 1) * GAP + CHOT;
    const dau = VUNG.hinh + Math.round((VUNG.hinhCao - tongCao) / 2);
    const lech = Math.max(0, moc.length - n);
    const tMuc = c.muc.map((m, i) => {
      const k = m.cau ?? Math.min(moc.length - 1, i + lech);
      const mm = moc[k];
      return r3(mm ? mm.bd + (mm.kt - mm.bd) * (m.tre ?? 0) : 0.4 + i * 0.8);
    });
    const kieu = c.kieu ?? "so";
    const dau_ = (m, i) => {
      if (kieu === "check") return `<div class="${p}-o"><svg viewBox="0 0 60 60" width="60" height="60"><rect x="4" y="4" width="52" height="52" rx="12" fill="none" stroke="${MAU.ngoc}" stroke-width="5"/><path id="${p}-v${i}" d="M16 31 L26 41 L45 19" fill="none" stroke="${MAU.ngoc}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="50"/></svg></div>`;
      if (kieu === "the") return `<div class="${p}-o ${p}-thanh" style="background:${[MAU.ngoc, MAU.troi, MAU.vang][i % 3]}"></div>`;
      return `<div class="${p}-o ${p}-so">${i + 1}</div>`;
    };
    const the = c.muc.map((m, i) => `
<div id="${p}-m${i}" class="${p}-the" style="top:${dau + i * (cao + GAP)}px; height:${cao}px">
  ${dau_(m, i)}
  ${kieu === "doi"
    ? `<div class="${p}-trai">${esc(m.chu)}</div><div class="${p}-mui">→</div><div class="${p}-phai">${esc(m.ra)}</div>`
    : `<div class="${p}-chu"><div class="${p}-ch">${esc(m.chu)}</div>${m.phu ? `<div class="${p}-ph">${esc(m.phu)}</div>` : ""}</div>`}
</div>`).join("");
    const noi = kieu === "buoc" && n > 1
      ? `<div id="${p}-day" style="position:absolute; left:${90 + 36 + 48}px; top:${dau + cao / 2}px; width:6px; height:${(n - 1) * (cao + GAP)}px; background:${MAU.vien}; transform-origin:top;"></div>` : "";
    const chot = c.chot ? `<div id="${p}-chot" class="${p}-chot" style="top:${dau + n * (cao + GAP) + 6}px"><span>${esc(c.chot.chu)}</span></div>` : "";
    const tChot = c.chot ? r3(moc[c.chot.cau] ? moc[c.chot.cau].bd + 0.2 : d * 0.8) : 0;
    const td = tieuDe(p, c.tieu_de, x.dau);
    const coChu = kieu === "doi" ? 40 : cao < 130 ? 44 : 48;
    return {
      css: `
.${p}-the { position:absolute; left:90px; right:90px; display:flex; align-items:center; gap:30px; padding:0 36px; border-radius:32px; background:rgba(14,48,72,0.92); border:2px solid rgba(108,196,255,0.22); box-shadow:0 24px 60px rgba(0,0,0,0.35); }
.${p}-o { flex:none; width:96px; height:96px; display:flex; align-items:center; justify-content:center; position:relative; z-index:2; }
.${p}-so { border-radius:999px; background:${MAU.vang}; color:${MAU.nen}; font-size:54px; font-weight:900; }
.${p}-thanh { width:16px; height:${Math.round(cao * 0.62)}px; border-radius:8px; }
.${p}-chu { flex:1; min-width:0; }
.${p}-ch { font-size:${coChu}px; font-weight:900; line-height:1.15; }
.${p}-ph { font-size:30px; font-weight:600; color:${MAU.mo}; margin-top:6px; }
.${p}-trai { flex:1; min-width:0; font-size:${coChu}px; font-weight:800; line-height:1.15; color:${MAU.chu}; }
.${p}-mui { flex:none; font-size:48px; font-weight:900; color:${MAU.mo}; }
.${p}-phai { flex:none; max-width:330px; padding:12px 24px; border-radius:22px; background:rgba(79,224,200,0.14); border:2px solid ${MAU.ngoc}; color:${MAU.ngoc}; font-size:36px; font-weight:900; line-height:1.15; text-align:center; }
.${p}-chot { position:absolute; left:90px; right:90px; text-align:center; }
.${p}-chot span { display:inline-block; padding:18px 36px; border-radius:26px; background:${MAU.nen}; border:4px solid ${MAU.son}; color:${MAU.son}; font-size:40px; font-weight:900; }`,
      html: `${td.html}${noi}${the}${chot}`,
      js: `${td.js}
${noi ? `tl.fromTo("#${p}-day", {scaleY:0}, {scaleY:1, duration:${r3(Math.max(0.5, tMuc[n - 1] - tMuc[0]))}, ease:"none"}, ${tMuc[0]});` : ""}
${c.muc.map((_, i) => `tl.fromTo("#${p}-m${i}", {opacity:0, x:${i % 2 ? 120 : -120}}, {opacity:1, x:0, duration:0.5, ease:"expo.out"}, ${tMuc[i]});
${kieu === "check" ? `tl.to("#${p}-v${i}", {strokeDashoffset:0, duration:0.35, ease:"power2.out"}, ${r3(tMuc[i] + 0.55)});` : ""}`).join("\n")}
${c.chot ? `tl.fromTo("#${p}-chot", {opacity:0, scale:1.5, rotation:-4}, {opacity:1, scale:1, rotation:-2, duration:0.35, ease:"power4.in"}, ${tChot});` : ""}`,
      sfx: [...tMuc.map((t) => ({ f: "whoosh-short", t, v: 0.3 })), ...(kieu === "check" ? tMuc.map((t) => ({ f: "click-soft", t: t + 0.55, v: 0.45 })) : []),
        ...(c.chot ? [{ f: "impact-bass-1", t: tChot + 0.3, v: 0.45 }] : [])],
    };
  },

  chu(c, { p, d, moc }) {
    const n = c.dong.length;
    const fs = Math.min(...c.dong.map((x) => co(x, 112)));
    const cao = Math.round(fs * 1.18);
    const dau = 640 - Math.round((n * cao) / 2) + 120;
    const tPhu = moc.length > 1 ? moc[moc.length - 1].bd : d * 0.6;
    return {
      css: `#${p}-phu { top:${dau + n * cao + 70}px; color:${MAU.ngoc}; font-weight:800; }
#${p}-ngoac { position:absolute; left:0; right:0; top:${dau - 190}px; text-align:center; font-family:"NR"; font-style:italic; font-size:220px; line-height:1; color:rgba(255,210,122,0.35); }`,
      html: `<div id="${p}-ngoac">“</div>${c.dong.map((s, i) => `<div id="${p}-d${i}" class="tde" style="top:${dau + i * cao}px; font-size:${fs}px; white-space:nowrap">${tachTu(s)}</div>`).join("")}
${c.phu ? `<div id="${p}-phu" class="nho">${esc(c.phu)}</div>` : ""}`,
      js: `tl.fromTo("#${p}-ngoac", {opacity:0, y:-30}, {opacity:1, y:0, duration:0.5}, 0.05);` + c.dong.map((_, i) => `
tl.fromTo("#${p}-d${i} .w", {opacity:0, filter:"blur(8px)"}, {opacity:1, filter:"blur(0px)", duration:0.16, stagger:0.08, ease:"power3.out"}, ${r3(0.15 + i * 0.5)});`).join("") +
        (c.phu ? `\ntl.fromTo("#${p}-phu", {opacity:0, y:24}, {opacity:1, y:0, duration:0.4, ease:"expo.out"}, ${r3(tPhu)});` : ""),
      sfx: [{ f: "whoosh", t: 0.02, v: 0.3 }],
    };
  },

  cta(c, { p, d, moc }) {
    const tNut = moc.length > 1 ? moc[1].bd : d * 0.5;
    const logo = LOGO
      ? `<img id="${p}-lg" src="assets/logo/${LOGO}" alt="Nha khoa Tâm Đức Smile" style="max-width:640px; max-height:230px; object-fit:contain; background:#FFFFFF; padding:22px 34px; border-radius:36px; box-shadow:0 24px 60px rgba(0,0,0,0.35);" />`
      : `<div style="background:#FFFFFF; padding:30px 38px; border-radius:40px; box-shadow:0 24px 60px rgba(0,0,0,0.35); line-height:0;">${logoSvg(`${p}-lg`, 720)}</div>`;
    return {
      css: `
#${p}-logo { position:absolute; left:0; right:0; top:240px; height:290px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
#${p}-nk { font-size:40px; font-weight:700; color:${MAU.mo}; letter-spacing:0.18em; text-transform:uppercase; margin-top:22px; }
#${p}-ten { font-size:100px; font-weight:900; color:${MAU.chu}; letter-spacing:-0.02em; line-height:1.05; }
#${p}-ten span { color:${MAU.ngoc}; }
#${p}-nut { position:absolute; left:140px; right:140px; top:600px; height:160px; border-radius:80px; background:linear-gradient(180deg, #FFE09A, ${MAU.vang}); box-shadow:0 20px 50px rgba(255,210,122,0.35), inset 0 -6px 0 rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; gap:26px; }
#${p}-nut b { font-size:70px; font-weight:900; color:${MAU.nen}; letter-spacing:0.01em; }
#${p}-song { position:absolute; left:140px; right:140px; top:600px; height:160px; border-radius:80px; border:5px solid ${MAU.vang}; opacity:0; }
#${p}-phu { position:absolute; left:90px; right:90px; top:796px; text-align:center; font-size:40px; font-weight:800; color:${MAU.chu}; }
#${p}-tay { position:absolute; left:900px; top:650px; width:120px; height:140px; }
#${p}-chips { position:absolute; left:90px; right:90px; top:890px; display:flex; flex-wrap:wrap; justify-content:center; gap:20px 16px; }
#${p}-chips .chip { font-size:32px; padding:12px 26px; }
#${p}-mt { position:absolute; left:110px; right:110px; top:1010px; text-align:center; font-size:26px; color:${MAU.nhat}; font-weight:600; line-height:1.3; }`,
      html: `
<div id="${p}-logo">${logo}</div>
<div id="${p}-song"></div>
<div id="${p}-nut"><svg width="78" height="78" viewBox="0 0 78 78"><path d="M39 6 C20 6 6 19 6 35 C6 44 10 51 17 56 L14 72 L30 63 C33 64 36 64 39 64 C58 64 72 51 72 35 C72 19 58 6 39 6 Z" fill="${MAU.nen}"/><circle cx="25" cy="35" r="5" fill="${MAU.vang}"/><circle cx="39" cy="35" r="5" fill="${MAU.vang}"/><circle cx="53" cy="35" r="5" fill="${MAU.vang}"/></svg><b>${esc(CTA_NUT)}</b></div>
<div id="${p}-phu">${esc(CTA_PHU)}</div>
<svg id="${p}-tay" viewBox="0 0 120 140"><path d="M44 8 C52 8 56 14 56 22 L56 62 L60 62 L60 50 C60 43 72 43 72 50 L72 64 L76 64 L76 56 C76 49 88 49 88 56 L88 70 L92 70 L92 64 C92 57 104 57 104 64 L104 100 C104 122 90 134 70 134 L58 134 C44 134 36 126 28 114 L10 86 C6 79 15 72 22 78 L32 90 L32 22 C32 14 36 8 44 8 Z" fill="#FFFFFF" stroke="${MAU.nen}" stroke-width="6" stroke-linejoin="round"/></svg>
<div id="${p}-chips">${c.chip.slice(0, 2).map((s, i) => `<span class="chip" id="${p}-c${i}">${esc(s)}</span>`).join("")}</div>
<div id="${p}-mt">${esc(MIEN_TRU)}</div>`,
      js: `
tl.fromTo("#${p}-logo", {opacity:0, scale:0.8}, {opacity:1, scale:1, duration:0.6, ease:"expo.out"}, 0.05);
tl.fromTo("#${p}-nut", {opacity:0, scale:0.6}, {opacity:1, scale:1, duration:0.5, ease:"back.out(2)"}, 0.5);
tl.fromTo("#${p}-phu", {opacity:0, y:20}, {opacity:1, y:0, duration:0.4, ease:"expo.out"}, 0.8);
tl.fromTo("#${p}-chips .chip", {opacity:0, y:24, scale:0.9}, {opacity:1, y:0, scale:1, duration:0.35, stagger:0.12, ease:"back.out(1.7)"}, 1.0);
tl.fromTo("#${p}-mt", {opacity:0}, {opacity:1, duration:0.4}, 1.4);
tl.fromTo("#${p}-tay", {opacity:0, x:120, y:120}, {opacity:1, x:0, y:0, duration:0.5, ease:"power3.out"}, ${r3(tNut)});
${[0, 1, 2].map((k) => `tl.to("#${p}-tay", {scale:0.86, duration:0.12, yoyo:true, repeat:1, transformOrigin:"40% 10%"}, ${r3(tNut + 0.6 + k * 1.1)});
tl.to("#${p}-nut", {scale:0.95, duration:0.12, yoyo:true, repeat:1}, ${r3(tNut + 0.6 + k * 1.1)});
tl.fromTo("#${p}-song", {opacity:0.9, scale:1}, {opacity:0, scale:1.18, duration:0.7, ease:"power2.out", immediateRender:false}, ${r3(tNut + 0.66 + k * 1.1)});`).join("\n")}`,
      sfx: [{ f: "sparkle", t: 0.3, v: 0.5 }, { f: "pop", t: 0.55, v: 0.4 }, ...[0, 1, 2].map((k) => ({ f: "click-soft", t: tNut + 0.6 + k * 1.1, v: 0.5 }))],
    };
  },
};

// ---------------------------------------------------------------- thời lượng
function docGiong(ma, id) {
  const f = path.join(GOC, "giong", ma, `${id}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
}

function lichCanh(video) {
  let t = 0;
  return video.canh.map((c) => {
    if (c.noi.length !== c.phu_de.length) throw new Error(`${video.ma}/${c.id}: noi và phu_de lệch số câu`);
    const g = docGiong(video.ma, c.id);
    let moc, d;
    if (g) {
      moc = g.cau.map((x) => ({ bd: DAU_GIONG + x.bd, kt: DAU_GIONG + x.kt }));
      d = DAU_GIONG + g.dur + DUOI_CANH;
    } else {
      let x = DAU_GIONG + 0.1;
      moc = c.noi.map((s) => { const dd = amTiet(s) / TOC_DO; const m = { bd: x, kt: x + dd }; x += dd + 0.32; return m; });
      d = moc[moc.length - 1].kt + DUOI_CANH + 0.2;
    }
    if (c.loai === "cta") d += 2.4; // giữ khung CTA + dòng miễn trừ thêm ~2,4 s
    d = Math.max(d, 3.2);
    const ra = { c, bd: t, d: r3(d), moc: moc.map((m) => ({ bd: r3(m.bd), kt: r3(m.kt) })), giong: g };
    t = r3(t + d);
    return ra;
  });
}

// ---------------------------------------------------------------- phụ đề
function nhomPhuDe(cau, bd, kt) {
  const tu = [];
  let vang = false;
  for (const raw of cau.split(/\s+/).filter(Boolean)) {
    let w = raw; const mo = w.startsWith("*"); if (mo) { vang = true; w = w.slice(1); }
    const dong = w.includes("*"); w = w.replace(/\*/g, "");
    tu.push({ w, vang: vang || mo });
    if (dong) vang = false;
  }
  const nhom = []; let cur = [];
  tu.forEach((x, i) => {
    cur.push(x);
    const ngat = /[.,!?…:;—]$/.test(x.w) || x.w === "—" || x.w === "·";
    if (cur.length >= 5 || (ngat && cur.length >= 2) || i === tu.length - 1) { nhom.push(cur); cur = []; }
  });
  // Nhóm 1 từ lẻ cuối câu → gộp vào nhóm trước cho đỡ giật.
  if (nhom.length > 1 && nhom.at(-1).length === 1 && nhom.at(-2).length <= 5) nhom.at(-2).push(...nhom.pop());
  const tong = tu.reduce((s, x) => s + x.w.length + 1, 0);
  let t = bd;
  return nhom.map((g) => {
    const len = g.reduce((s, x) => s + x.w.length + 1, 0);
    const dd = ((kt - bd) * len) / tong;
    let tt = t;
    const words = g.map((x) => { const wd = (dd * (x.w.length + 1)) / len; const r = { ...x, t: r3(tt) }; tt += wd; return r; });
    const ra = { bd: r3(t), kt: r3(t + dd), words };
    t += dd;
    return ra;
  });
}

function canhPhuDe(lich) {
  const nhom = [];
  for (const s of lich) s.c.phu_de.forEach((cau, i) => {
    const m = s.moc[i];
    nhom.push(...nhomPhuDe(cau, s.bd + m.bd, s.bd + Math.max(m.kt, m.bd + 0.6)));
  });
  nhom.forEach((g, i) => { const sau = nhom[i + 1]; g.het = r3(sau ? Math.min(sau.bd, g.kt + 0.6) : g.kt + 0.6); });
  const html = nhom.map((g, i) => `<div id="pd-${i}" class="pd"><span class="pd-nen">${g.words.map((w, j) => `<span id="pd-${i}-${j}" class="pw${w.vang ? " hl" : ""}">${esc(w.w)}</span>`).join(" ")}</span></div>`).join("\n");
  const js = nhom.map((g, i) => `
tl.fromTo("#pd-${i}", {opacity:0, y:16, scale:0.96}, {opacity:1, y:0, scale:1, duration:0.12, ease:"power3.out"}, ${r3(g.bd)});
${g.words.map((w, j) => `tl.fromTo("#pd-${i}-${j}", {opacity:0.45}, {opacity:1, duration:0.08}, ${w.t});`).join("\n")}
tl.to("#pd-${i}", {opacity:0, duration:0.08, ease:"power2.in"}, ${r3(g.het - 0.08)});
tl.set("#pd-${i}", {opacity:0, visibility:"hidden"}, ${g.het});`).join("");
  return `<template>
<style>
${PHONG}
#root { position:absolute; inset:0; }
.pd { position:absolute; left:110px; right:110px; top:${VUNG.phuDe}px; text-align:center; font-family:"BVP"; font-weight:900; font-size:60px; line-height:1.2; color:${MAU.chu}; opacity:0; text-wrap: balance; }
.pd-nen { -webkit-box-decoration-break: clone; box-decoration-break: clone; background: rgba(6,24,38,0.62); border-radius: 18px; padding: 4px 18px; text-shadow: 0 4px 0 rgba(0,0,0,0.5); }
.pd .hl { color:${MAU.vang}; }
</style>
<div id="root" data-composition-id="phu-de" data-width="${W}" data-height="${H}">
<div id="pd-khung" class="clip" data-start="0" data-duration="${lich.at(-1).bd + lich.at(-1).d}" data-layout-allow-caption-zone data-layout-allow-overlap>
${html}
</div></div>
<script>
const tl = gsap.timeline({ paused: true });
${js}
window.__timelines["phu-de"] = tl;
</script>
</template>`;
}

// ---------------------------------------------------------------- ghép dự án
function canhFile(video, s) {
  const f = KIEU[s.c.loai];
  if (!f) throw new Error(`Chưa có kiểu cảnh ${s.c.loai}`);
  const p = `${video.ma}${s.c.id.replace(/-/g, "")}`;
  // Ảnh nền thật (anh-kho.mjs): cảnh mở đầu cho ảnh sáng ~1,2 s rồi tối dần, hình minh hoạ hiện trên tấm nền riêng.
  const anh = ANH[video.ma]?.[s.c.id];
  const k = f(s.c, { p, d: s.d, moc: s.moc, video, dau: s.bd === 0, anhDau: !!anh && s.bd === 0 && s.c.loai === "minh_hoa" });
  const ra = r3(s.d - 0.28);
  let anhHtml = "", anhJs = "";
  if (anh) {
    const che = DO_CHE[s.c.loai] ?? 0.8, moDau = s.bd === 0 && s.c.loai === "minh_hoa";
    const pan = s.c.loai === "minh_hoa" ? `<div id="${p}-pan" class="pan"></div>` : "";
    anhHtml = `<div class="anhnen"><img id="${p}-anh" src="assets/anh/${anh[0]}" style="object-position:${anh[1]}" alt="" /></div><div id="${p}-mo" class="anhmo" style="opacity:${moDau ? 0.15 : che}"></div><div class="anhphu"></div>${pan}`;
    anhJs = `tl.fromTo("#${p}-anh", {scale:1.12}, {scale:1.0, duration:${s.d}, ease:"none"}, 0);
${moDau ? `tl.to("#${p}-mo", {opacity:${che}, duration:0.6, ease:"power2.inOut"}, 1.2);
tl.fromTo("#${p}-pan", {opacity:0, y:60}, {opacity:1, y:0, duration:0.6, ease:"expo.out"}, 1.2);
tl.fromTo("#${p}-svg", {opacity:0, scale:0.96}, {opacity:1, scale:1, duration:0.5, ease:"expo.out", immediateRender:false}, 1.3);`
    : (pan ? `tl.fromTo("#${p}-pan", {opacity:0, scale:0.97}, {opacity:1, scale:1, duration:0.5, ease:"expo.out"}, 0.05);` : "")}`;
  }
  return {
    sfx: (k.sfx ?? []).map((x) => ({ ...x, t: r3(s.bd + Math.max(0, x.t)) })).filter((x) => x.t < s.bd + s.d),
    html: `<template>
<style>
${CHUNG}
${k.css}
</style>
<div id="root" data-composition-id="${s.c.id}" data-width="${W}" data-height="${H}">
<div id="${p}-khung" class="clip khung" data-start="0" data-duration="${s.d}">
<div id="${p}-noi" class="khung${anh ? " coanh" : ""}">
${anhHtml}
${k.html}
</div></div></div>
<script>
const tl = gsap.timeline({ paused: true });
${k.js}
${anhJs}
tl.to("#${p}-noi", {opacity:0, filter:"blur(10px)", duration:0.24, ease:"power2.in"}, ${ra});
window.__timelines["${s.c.id}"] = tl;
</script>
</template>`,
  };
}

/** Lớp trên cùng (dưới phụ đề): logo + khẩu hiệu — nằm trên ảnh nền của từng cảnh. */
function dauFile(tong) {
  return `<template>
<style>
${PHONG}
#root { position:absolute; inset:0; }
#nen-hieu { position:absolute; left:0; right:0; top:156px; display:flex; justify-content:center; align-items:center; gap:16px; font-family:"BVP"; font-weight:800; font-size:34px; color:${MAU.chu}; }
#nen-hieu i { font-style:normal; font-weight:700; font-size:26px; color:${MAU.ngoc}; padding:6px 16px; border-radius:999px; border:2px solid rgba(79,224,200,0.5); }
#nen-chan { position:absolute; left:0; right:0; top:1452px; text-align:center; font-family:"BVP"; font-weight:800; font-size:30px; color:rgba(79,224,200,0.38); letter-spacing:0.1em; }
</style>
<div id="root" data-composition-id="dau" data-width="${W}" data-height="${H}">
<div id="dau-khung" class="clip" data-start="0" data-duration="${tong}" data-layout-ignore>
  ${LOGO ? `<div id="nen-hieu"><img src="assets/logo/${LOGO}" alt="" style="height:76px; background:#FFFFFF; padding:8px 18px; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.35);" /></div>` : `<div id="nen-hieu"><span style="background:#FFFFFF; padding:8px 16px; border-radius:16px; line-height:0;">${logoSvg("nen-logo", 260)}</span></div>`}
  <div id="nen-chan">${esc(SLOGAN.toUpperCase())}</div>
</div></div>
<script>
window.__timelines["dau"] = gsap.timeline({ paused: true });
</script>
</template>`;
}

function nenFile(tong, video) {
  const r = hat(11);
  const bot = Array.from({ length: 26 }, (_, i) => {
    const x = Math.round(r() * W), y = Math.round(r() * H), s = Math.round(r() * 60 + 14), o = (r() * 0.12 + 0.04).toFixed(2);
    return `<circle class="nen-bt" cx="${x}" cy="${y}" r="${s}" fill="${i % 3 ? "#6CC4FF" : "#4FE0C8"}" opacity="${o}"/>`;
  }).join("");
  const lap = Array.from({ length: 40 }, () => {
    const x = Math.round(r() * W), y = Math.round(r() * H), s = (r() * 2 + 1).toFixed(1), o = (r() * 0.5 + 0.2).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity="${o}"/>`;
  }).join("");
  return `<template>
<style>
${PHONG}
#root { position:absolute; inset:0; }
#nen-day { position:absolute; inset:0; background: radial-gradient(1100px 900px at 50% 30%, #0F3550 0%, ${MAU.nen} 65%); }
#nen-bot, #nen-lap { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
</style>
<div id="root" data-composition-id="nen" data-width="${W}" data-height="${H}">
<div id="nen-khung" class="clip" data-start="0" data-duration="${tong}" data-layout-ignore>
  <div id="nen-day"></div>
  <div id="nen-toi" style="position:absolute; inset:0; background: radial-gradient(1300px 1500px at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,6,12,0.55) 100%);"></div>
  <svg id="nen-bot" viewBox="0 0 ${W} ${H}">${bot}</svg>
  <svg id="nen-lap" viewBox="0 0 ${W} ${H}">${lap}</svg>
</div></div>
<script>
const tl = gsap.timeline({ paused: true });
tl.fromTo("#nen-bot", {y:0}, {y:-160, duration:${tong}, ease:"none"}, 0);
tl.fromTo("#nen-lap", {y:0, opacity:0.6}, {y:-60, opacity:1, duration:${tong}, ease:"none"}, 0);
window.__timelines["nen"] = tl;
</script>
</template>`;
}

const _dai = {};
function dodai(f) {
  if (!_dai[f]) _dai[f] = r3(Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(GOC, "am-thanh", `${f}.mp3`)]).toString().trim()));
  return _dai[f];
}

function dung(video) {
  const lich = lichCanh(video);
  const tong = r3(lich.at(-1).bd + lich.at(-1).d);
  const thu = path.join(GOC, "ban-dung", video.ma);
  fs.rmSync(path.join(thu, "compositions"), { recursive: true, force: true });
  for (const d of ["compositions", "assets/fonts", "assets/sfx", "assets/giong", "assets/nhac"]) fs.mkdirSync(path.join(thu, d), { recursive: true });
  for (const f of fs.readdirSync(path.join(GOC, "phong"))) if (f.endsWith(".ttf")) fs.copyFileSync(path.join(GOC, "phong", f), path.join(thu, "assets/fonts", f));
  fs.copyFileSync(path.join(GOC, "node_modules/gsap/dist/gsap.min.js"), path.join(thu, "assets/gsap.min.js"));
  if (LOGO) { fs.mkdirSync(path.join(thu, "assets/logo"), { recursive: true }); fs.copyFileSync(path.join(GOC, "logo", LOGO), path.join(thu, "assets/logo", LOGO)); }

  fs.rmSync(path.join(thu, "assets/anh"), { recursive: true, force: true });
  fs.mkdirSync(path.join(thu, "assets/anh"), { recursive: true });
  for (const [ten] of Object.values(ANH[video.ma] ?? {})) fs.copyFileSync(path.join(GOC, "anh", ten), path.join(thu, "assets/anh", ten));
  const hosts = [], sfx = [], giong = [];
  for (const s of lich) {
    const cf = canhFile(video, s);
    fs.writeFileSync(path.join(thu, "compositions", `${s.c.id}.html`), cf.html);
    hosts.push(`<div id="${s.c.id}" data-composition-id="${s.c.id}" data-composition-src="compositions/${s.c.id}.html" data-start="${s.bd}" data-duration="${s.d}" data-track-index="2" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:2"></div>`);
    if (s !== lich[0]) sfx.push({ f: ["whoosh", "whoosh-short", "whoosh-cinematic"][sfx.length % 3], t: r3(s.bd - 0.12), v: 0.28 });
    sfx.push(...cf.sfx);
    if (s.giong) {
      const ten = `${s.c.id}.mp3`;
      fs.copyFileSync(path.join(GOC, "giong", video.ma, ten), path.join(thu, "assets/giong", ten));
      giong.push(`<audio id="giong-${s.c.id}" class="clip" src="assets/giong/${ten}" data-start="${r3(s.bd + DAU_GIONG)}" data-duration="${r3(s.giong.dur)}" data-track-index="5" data-volume="1"></audio>`);
    }
  }
  const coGiong = giong.length > 0;
  const dungSfx = new Set();
  // Mỗi tiếng tối đa 3 s; xếp làn sao cho không làn nào có hai tiếng chồng nhau.
  const lan = [];
  const sfxHtml = sfx.filter((x) => x.t >= 0 && x.t < tong - 0.2).sort((a, b) => a.t - b.t).map((x, i) => {
    dungSfx.add(x.f);
    const v = r3((x.v ?? 0.5) * (coGiong ? 0.5 : 1));
    const dai = r3(Math.min(dodai(x.f), 3, tong - x.t));
    let k = lan.findIndex((het) => het <= x.t);
    if (k < 0) { lan.push(0); k = lan.length - 1; }
    lan[k] = x.t + dai + 0.01;
    return `<audio id="sfx-${i}" class="clip" src="assets/sfx/${x.f}.mp3" data-start="${x.t}" data-duration="${dai}" data-track-index="${6 + k}" data-volume="${v}"></audio>`;
  }).join("\n    ");
  for (const f of dungSfx) fs.copyFileSync(path.join(GOC, "am-thanh", `${f}.mp3`), path.join(thu, "assets/sfx", `${f}.mp3`));

  // Nhạc nền (không lời, nhỏ dưới giọng ~ −20 dB) nếu đã tạo bằng tao-nhac.mjs.
  let nhac = "";
  const fn = path.join(GOC, "nhac", `${video.nhac ?? "sang"}.mp3`);
  if (fs.existsSync(fn)) {
    const ra = path.join(thu, "assets/nhac", "nen.mp3");
    const dn = r3(Math.min(tong, Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", fn]).toString().trim())));
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", fn, "-t", String(dn), "-af", `afade=t=in:d=0.8,afade=t=out:st=${r3(dn - 2.5)}:d=2.5`, "-b:a", "160k", ra]);
    // Giọng −16 LUFS, nhạc −16 LUFS × 0,3 ≈ −26,5 LUFS → nhạc thấp hơn giọng ~10 dB.
    nhac = `<audio id="nhac-nen" class="clip" src="assets/nhac/nen.mp3" data-start="0" data-duration="${dn}" data-track-index="4" data-volume="${coGiong ? 0.3 : 0.5}"></audio>`;
  }

  fs.writeFileSync(path.join(thu, "compositions", "nen.html"), nenFile(tong, video));
  fs.writeFileSync(path.join(thu, "compositions", "dau.html"), dauFile(tong));
  fs.writeFileSync(path.join(thu, "compositions", "phu-de.html"), canhPhuDe(lich));
  fs.writeFileSync(path.join(thu, "hyperframes.json"), JSON.stringify({
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
    media: { autoProxy: true }, authoringSkill: "hyperframes",
  }, null, 2));
  fs.writeFileSync(path.join(thu, "index.html"), `<!doctype html>
<html lang="vi" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(video.ma)} — ${esc(video.ten)}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${MAU.nen}; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${tong}" data-width="${W}" data-height="${H}">
    <div id="nen" data-composition-id="nen" data-composition-src="compositions/nen.html" data-start="0" data-duration="${tong}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:1"></div>
    ${hosts.join("\n    ")}
    <div id="dau" data-composition-id="dau" data-composition-src="compositions/dau.html" data-start="0" data-duration="${tong}" data-track-index="20" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:4"></div>
    <div id="phu-de" data-composition-id="phu-de" data-composition-src="compositions/phu-de.html" data-start="0" data-duration="${tong}" data-track-index="3" data-track-kind="captions" data-width="${W}" data-height="${H}" style="z-index:5"></div>
    ${nhac}
    ${giong.join("\n    ")}
    ${sfxHtml}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
  return { ma: video.ma, tong, canh: lich.map((s) => `${s.c.id}:${s.d}s${s.giong ? "🎙" : ""}`), coGiong };
}

const chon = process.argv.slice(2);
for (const v of VIDEO) if (!chon.length || chon.includes(v.ma)) console.log(JSON.stringify(dung(v)));
