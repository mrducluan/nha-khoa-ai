// Hình minh hoạ nha khoa tự vẽ bằng SVG (không dùng ảnh người thật, không dùng ảnh kho có bản quyền).
// Mỗi hình vẽ trong khung 900 × 640 (vùng hình cố định của khung dọc: x 90–990, y 490–1130) nên KHÔNG bao giờ
// chạm vùng tiêu đề (y 250–470) hay vùng phụ đề (y ≥ 1190).
// Hàm hình: (c, { p, d, moc }) → { svg, js, sfx }  — js dùng biến `tl` (GSAP timeline của cảnh).

export const MAU = {
  nen: "#061826", nen2: "#0B2A3D", mat: "#0E3048", mat2: "#123A55", vien: "#24557A",
  chu: "#F4F9FC", mo: "#A9C3D6", nhat: "#7C9AB0",
  vang: "#FFD27A", ngoc: "#4FE0C8", troi: "#6CC4FF", son: "#FF7A6B", hong: "#F59AA8",
};

const r3 = (x) => Math.round(x * 1000) / 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Mốc thời gian: câu i, phần f (0 đầu câu → 1 cuối câu); không có câu đó thì lấy dự phòng. */
const moc_ = (moc, d) => (i, f = 0, du = d * 0.5) => (moc[i] ? r3(moc[i].bd + (moc[i].kt - moc[i].bd) * f) : r3(du));

// ---------------------------------------------------------------- vật liệu chung
export function defs(p) {
  return `<defs>
<radialGradient id="${p}en" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#F4F8FB"/><stop offset="0.8" stop-color="#DCE7F0"/><stop offset="1" stop-color="#C3D3E0"/></radialGradient>
<linearGradient id="${p}nat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4ECDB"/><stop offset="0.55" stop-color="#FFFDF6"/><stop offset="0.86" stop-color="#F7F7F2"/><stop offset="1" stop-color="#C9DDEB"/></linearGradient>
<linearGradient id="${p}rt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9C08E"/><stop offset="0.4" stop-color="#F6EAD0"/><stop offset="1" stop-color="#C9AD78"/></linearGradient>
<linearGradient id="${p}gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDC0CA"/><stop offset="0.35" stop-color="#F49AAA"/><stop offset="1" stop-color="#C95870"/></linearGradient>
<linearGradient id="${p}bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E8C6"/><stop offset="0.5" stop-color="#E6CF9E"/><stop offset="1" stop-color="#BE9F68"/></linearGradient>
<linearGradient id="${p}ti" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#66737F"/><stop offset="0.42" stop-color="#EEF2F5"/><stop offset="0.7" stop-color="#B5C0CA"/><stop offset="1" stop-color="#5E6A76"/></linearGradient>
<linearGradient id="${p}moi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F08A8F"/><stop offset="1" stop-color="#C9505E"/></linearGradient>
<linearGradient id="${p}kl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4C555E"/><stop offset="0.5" stop-color="#9AA3AC"/><stop offset="1" stop-color="#4C555E"/></linearGradient>
<radialGradient id="${p}sang" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE7A8" stop-opacity="0.55"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}ngocSang" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#4FE0C8" stop-opacity="0.5"/><stop offset="1" stop-color="#4FE0C8" stop-opacity="0"/></radialGradient>
<pattern id="${p}xp" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="4" fill="rgba(140,105,55,0.22)"/><circle cx="25" cy="22" r="5" fill="rgba(140,105,55,0.16)"/></pattern>
<filter id="${p}bong" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.38"/></filter>
<filter id="${p}rb" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#02101A" flood-opacity="0.45"/></filter>
<linearGradient id="${p}bl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<filter id="${p}mo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
</defs>`;
}

// ---------------------------------------------------------------- linh kiện
const CROWN = "M-70 40 C-70 8 -32 -2 -12 12 C0 4 12 4 22 12 C40 -2 70 8 70 40 L68 118 C68 136 58 148 46 150 L-46 150 C-58 148 -68 136 -68 118 Z";
const ROOT = "M-50 140 C-54 200 -46 258 -32 288 C-22 306 -8 296 -6 268 L-2 190 C-1 180 1 180 2 190 L6 268 C8 296 22 306 32 288 C46 258 54 200 50 140 Z";

/** Răng hàm nhìn nghiêng. (x, y) = giữa mặt nhai; up = răng hàm trên (lật dọc). */
function rangHam(p, id, x, y, s, { up = false, chanRang = true, vien = false } = {}) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s} ${up ? -s : s})">
  ${chanRang ? `<path d="${ROOT}" fill="url(#${p}rt)" stroke="#BFA678" stroke-width="2"/>` : ""}
  <path d="${CROWN}" fill="url(#${p}en)" stroke="${vien ? "#FFFFFF" : "#B5C7D6"}" stroke-width="${vien ? 4 : 2}" filter="url(#${p}rb)"/>
  <path d="M-34 30 Q0 52 36 30" stroke="#B9CCDB" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M-52 40 C-50 20 -36 14 -24 22" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.95"/>
  <ellipse cx="40" cy="60" rx="8" ry="22" fill="#FFFFFF" opacity="0.55"/>
</g></g>`;
}
function maoSu(p, id, x, y, s) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="${CROWN}" fill="url(#${p}en)" stroke="#B5C7D6" stroke-width="2" filter="url(#${p}rb)"/>
  <path d="M-34 30 Q0 52 36 30" stroke="#B9CCDB" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M-52 40 C-50 20 -36 14 -24 22" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.95"/>
  <ellipse cx="40" cy="60" rx="8" ry="22" fill="#FFFFFF" opacity="0.55"/>
</g></g>`;
}
/** Trụ Implant: (x, y) = mép trên của trụ. */
function truImplant(p, id, x, y, s) {
  const ren = Array.from({ length: 9 }, (_, i) => {
    const yy = 22 + i * 23, w = 44 - (11 * yy) / 215;
    return `<path d="M${r3(-w)} ${yy} L${r3(w)} ${yy + 11}" stroke="#56626E" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`;
  }).join("");
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-45 0 L45 0 L33 215 Q0 250 -33 215 Z" fill="url(#${p}ti)" stroke="#55616C" stroke-width="2"/>${ren}
  <rect x="-42" y="-10" width="84" height="14" rx="5" fill="#CBD4DC" stroke="#55616C" stroke-width="2"/>
  <clipPath id="${id}-cl"><path d="M-45 0 L45 0 L33 215 Q0 250 -33 215 Z"/></clipPath>
  <g clip-path="url(#${id}-cl)"><rect class="${p}-bong-ti" x="-120" y="-20" width="40" height="300" fill="url(#${p}bl)" transform="rotate(12)"/></g>
</g></g>`;
}
/** Khớp nối (abutment): (x, y) = đáy khớp nối. */
function khopNoi(p, id, x, y, s) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-25 -72 Q0 -80 25 -72 L37 0 L-37 0 Z" fill="url(#${p}ti)" stroke="#55616C" stroke-width="2"/>
  <path d="M-30 -24 L30 -24" stroke="#56626E" stroke-width="4" opacity="0.7"/>
</g></g>`;
}
/** Răng cửa nhìn thẳng (x, y) = giữa mép trên thân răng. */
function rangCua(W, H) {
  return `M${-W * 0.42} 0 L${W * 0.42} 0 C${W * 0.5} ${H * 0.3} ${W * 0.52} ${H * 0.75} ${W * 0.46} ${H * 0.94} Q${W * 0.44} ${H} ${W * 0.34} ${H} L${-W * 0.34} ${H} Q${-W * 0.44} ${H} ${-W * 0.46} ${H * 0.94} C${-W * 0.52} ${H * 0.75} ${-W * 0.5} ${H * 0.3} ${-W * 0.42} 0 Z`;
}
/** Nhãn dạng viên thuốc trong SVG. */
function nhan(id, x, y, chu, mau, { co = 32, nen = "rgba(6,24,38,0.92)" } = {}) {
  const w = Math.round(chu.length * co * 0.56 + 48), h = Math.round(co * 1.7);
  return `<g id="${id}" opacity="0"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${nen}" stroke="${mau}" stroke-width="3"/>
<text x="${x}" y="${y + co * 0.36}" text-anchor="middle" font-family="BVP" font-weight="800" font-size="${co}" fill="${mau}">${esc(chu)}</text></g>`;
}
const hienNhan = (id, t) => `tl.fromTo("#${id}", {opacity:0, y:16}, {opacity:1, y:0, duration:0.35, ease:"back.out(1.8)"}, ${r3(t)});`;

/** Nụ cười (toạ độ cục bộ x −360…360, y −170…190). kieu: "tu_nhien" | "gach_men"; vienXam: viền xám 2 răng cửa. */
function nuCuoi(p, id, { kieu = "tu_nhien", vienXam = false } = {}) {
  const RANG = [[0, 84, 118], [1, 66, 100], [2, 62, 104], [3, 56, 86], [4, 50, 76]];
  const tam = [42, 117, 181, 240, 293];
  const gach = kieu === "gach_men";
  const top = (x) => r3(-64 + 62 * (x / 320) ** 2);
  const tren = [-1, 1].flatMap((sg) => RANG.map(([i, w, h]) => {
    const x = sg * tam[i], t = top(x), H = gach ? 112 : h;
    return `<g transform="translate(${x} ${gach ? -58 : t})"><path d="${rangCua(gach ? w * 1.04 : w, H)}" fill="${gach ? "#FFFFFF" : `url(#${p}nat)`}" stroke="${gach ? "#E8F2FF" : "#D9CDB3"}" stroke-width="2"/>
${gach ? `<rect x="${-w * 0.28}" y="${H * 0.18}" width="${w * 0.14}" height="${H * 0.5}" rx="4" fill="#E9F6FF"/>` : ""}
${vienXam && i === 0 ? `<rect class="${id}-xam" x="${-w * 0.42}" y="0" width="${w * 0.84}" height="11" rx="3" fill="#59626C"/>` : ""}</g>`;
  })).join("");
  const duoi = [-1, 1].flatMap((sg) => [0, 1, 2, 3].map((i) => {
    const x = sg * (34 + i * 68);
    return `<rect x="${x - 31}" y="${70 - i * 6}" width="62" height="80" rx="14" fill="${gach ? "#F4F8FF" : "#E9DFCB"}"/>`;
  })).join("");
  return `<g id="${id}">
<clipPath id="${id}-cl"><path d="M-320 -10 Q-180 -110 0 -85 Q180 -110 320 -10 Q180 130 0 135 Q-180 130 -320 -10 Z"/></clipPath>
<path d="M-360 -10 Q-200 -175 0 -122 Q200 -175 360 -10 Q200 195 0 185 Q-200 195 -360 -10 Z" fill="url(#${p}moi)"/>
<path d="M-320 -10 Q-180 -110 0 -85 Q180 -110 320 -10 Q180 130 0 135 Q-180 130 -320 -10 Z" fill="#3A0E18"/>
<g clip-path="url(#${id}-cl)">${duoi}${tren}
<path d="M-330 -12 Q-180 -112 0 -88 Q180 -112 330 -12 L330 4 Q180 -78 0 -62 Q-180 -78 -330 4 Z" fill="url(#${p}gm)"/></g>
<path d="M-250 -92 Q-120 -128 -40 -112" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="10" stroke-linecap="round" fill="none"/>
</g>`;
}

// ---------------------------------------------------------------- các hình
export const HINH = {
  // i01 — hàng răng, một răng rơi mất, dấu hỏi ở chỗ trống
  rang_mat(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const xs = [150, 300, 450, 600, 750];
    const t = T(0, 0.35);
    return {
      svg: `
<rect x="40" y="370" width="820" height="240" rx="40" fill="url(#${p}bn)"/><rect x="40" y="370" width="820" height="240" rx="40" fill="url(#${p}xp)"/>
${xs.map((x, i) => rangHam(p, `${p}-rg${i}`, x, 210, 0.86)).join("")}
<path d="M40 362 Q100 344 150 360 Q225 384 300 360 Q375 344 450 360 Q525 384 600 360 Q675 344 750 360 Q810 380 860 362 L860 404 L40 404 Z" fill="url(#${p}gm)"/>
<g id="${p}-ma" opacity="0"><g transform="translate(450 210) scale(0.86)"><path d="${CROWN}" fill="none" stroke="${MAU.chu}" stroke-opacity="0.55" stroke-width="5" stroke-dasharray="14 12"/></g></g>
<g id="${p}-hoi" opacity="0"><circle cx="450" cy="150" r="78" fill="${MAU.son}"/><text x="450" y="186" text-anchor="middle" font-family="BVP" font-weight="900" font-size="110" fill="#FFFFFF">?</text></g>
<circle id="${p}-vong" cx="450" cy="270" r="120" fill="none" stroke="${MAU.son}" stroke-width="6" opacity="0"/>`,
      js: `
tl.fromTo("[id^='${p}-rg']", {opacity:0, y:40}, {opacity:1, y:0, duration:0.45, stagger:0.07, ease:"back.out(1.6)"}, 0.1);
tl.to("#${p}-rg2", {y:-330, rotation:24, svgOrigin:"450 290", opacity:0, duration:0.6, ease:"power3.in"}, ${t});
tl.to("#${p}-ma", {opacity:1, duration:0.3}, ${r3(t + 0.45)});
tl.fromTo("#${p}-hoi", {opacity:0, scale:0.3, svgOrigin:"450 150"}, {opacity:1, scale:1, svgOrigin:"450 150", duration:0.45, ease:"back.out(2.4)"}, ${r3(t + 0.6)});
tl.fromTo("#${p}-vong", {opacity:0.9, scale:0.6, svgOrigin:"450 270"}, {opacity:0, scale:1.5, svgOrigin:"450 270", duration:1.1, ease:"power2.out", repeat:2, immediateRender:false}, ${r3(t + 0.7)});
tl.to("#${p}-hoi", {y:-14, duration:0.5, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(t + 1.1)});`,
      sfx: [{ f: "whoosh-short", t, v: 0.4 }, { f: "pop", t: t + 0.6, v: 0.5 }],
    };
  },

  // i01 — răng kế bên nghiêng, răng đối diện trồi xuống
  rang_nghieng(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const xs = [150, 300, 450, 600, 750];
    const t1 = T(1, 0.15), t2 = T(2, 0.1);
    return {
      svg: `
<rect x="40" y="0" width="820" height="150" rx="34" fill="url(#${p}bn)"/><rect x="40" y="0" width="820" height="150" rx="34" fill="url(#${p}xp)"/>
${xs.map((x, i) => rangHam(p, `${p}-u${i}`, x, 268, 0.72, { up: true })).join("")}
<path d="M40 150 Q100 166 150 152 Q225 128 300 152 Q375 166 450 152 Q525 128 600 152 Q675 166 750 152 Q810 132 860 150 L860 120 L40 120 Z" fill="url(#${p}gm)"/>
<rect x="40" y="430" width="820" height="210" rx="34" fill="url(#${p}bn)"/><rect x="40" y="430" width="820" height="210" rx="34" fill="url(#${p}xp)"/>
${xs.map((x, i) => (i === 2 ? "" : rangHam(p, `${p}-l${i}`, x, 318, 0.72))).join("")}
<path d="M40 424 Q100 410 150 422 Q225 442 300 422 Q375 410 450 426 Q525 442 600 422 Q675 410 750 422 Q810 438 860 424 L860 456 L40 456 Z" fill="url(#${p}gm)"/>
<g id="${p}-ml" opacity="0"><path d="M345 360 Q390 330 410 365" stroke="${MAU.vang}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M398 346 L412 368 L388 370" stroke="${MAU.vang}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
<g id="${p}-mr" opacity="0"><path d="M555 360 Q510 330 490 365" stroke="${MAU.vang}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M502 346 L488 368 L512 370" stroke="${MAU.vang}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
<g id="${p}-md" opacity="0"><path d="M450 345 L450 400" stroke="${MAU.son}" stroke-width="8" stroke-linecap="round"/><path d="M432 384 L450 404 L468 384" stroke="${MAU.son}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
${nhan(`${p}-n1`, 225, 600, "Nghiêng dần", MAU.vang)}
${nhan(`${p}-n2`, 690, 600, "Trồi xuống", MAU.son)}`,
      js: `
tl.fromTo("[id^='${p}-u'], [id^='${p}-l']", {opacity:0}, {opacity:1, duration:0.4, stagger:0.05}, 0.1);
tl.fromTo("#${p}-ml, #${p}-mr", {opacity:0}, {opacity:1, duration:0.3}, ${t1});
tl.to("#${p}-l1", {rotation:13, svgOrigin:"300 534", duration:1.6, ease:"power2.inOut"}, ${r3(t1 + 0.2)});
tl.to("#${p}-l3", {rotation:-13, svgOrigin:"600 534", duration:1.6, ease:"power2.inOut"}, ${r3(t1 + 0.2)});
${hienNhan(`${p}-n1`, t1 + 0.6)}
tl.fromTo("#${p}-md", {opacity:0}, {opacity:1, duration:0.3}, ${t2});
tl.to("#${p}-u2", {y:62, duration:1.4, ease:"power2.inOut"}, ${r3(t2 + 0.2)});
${hienNhan(`${p}-n2`, t2 + 0.6)}`,
      sfx: [{ f: "whoosh", t: t1 + 0.2, v: 0.3 }, { f: "pop", t: t1 + 0.6, v: 0.4 }, { f: "whoosh-short", t: t2 + 0.2, v: 0.3 }, { f: "pop", t: t2 + 0.6, v: 0.4 }],
    };
  },

  // i01 — xương hàm dưới chỗ mất răng tiêu dần
  xuong_tieu(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const bone = (k) => `M40 300 L270 300 C340 300 360 ${300 + k} 450 ${300 + k} C540 ${300 + k} 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z`;
    const gum = (k) => `M40 268 L270 268 C340 268 360 ${268 + k} 450 ${268 + k} C540 ${268 + k} 560 268 630 268 L860 268 L860 300 L630 300 C560 300 540 ${300 + k} 450 ${300 + k} C360 ${300 + k} 340 300 270 300 L40 300 Z`;
    const t1 = T(1, 0.05), t2 = T(2, 0);
    const K = 125;
    return {
      svg: `
<path id="${p}-bn" d="${bone(0)}" fill="url(#${p}bn)"/><path id="${p}-bx" d="${bone(0)}" fill="url(#${p}xp)"/>
${rangHam(p, `${p}-a`, 160, 135, 0.95)}${rangHam(p, `${p}-b`, 740, 135, 0.95)}
<path id="${p}-gm" d="${gum(0)}" fill="url(#${p}gm)"/>
<path id="${p}-cu" d="M270 300 L630 300" stroke="${MAU.chu}" stroke-width="5" stroke-dasharray="14 12" opacity="0"/>
<g id="${p}-mt" opacity="0">${[390, 450, 510].map((x) => `<path d="M${x} 330 L${x} 395 M${x - 15} 380 L${x} 397 L${x + 15} 380" stroke="${MAU.son}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
${nhan(`${p}-n0`, 450, 590, "Xương hàm", MAU.vang)}
${nhan(`${p}-n1`, 450, 220, "Tiêu dần theo thời gian", MAU.son, { co: 30 })}
${nhan(`${p}-n2`, 450, 590, "Mỏng hơn → làm răng phức tạp hơn", MAU.son, { co: 30 })}
<rect id="${p}-quet" x="40" y="250" width="820" height="10" rx="5" fill="${MAU.ngoc}" opacity="0" filter="url(#${p}mo)"/>`,
      js: `
tl.fromTo(["#${p}-bn","#${p}-bx","#${p}-a","#${p}-b","#${p}-gm"], {opacity:0}, {opacity:1, duration:0.5, stagger:0.06}, 0.1);
tl.fromTo("#${p}-quet", {opacity:0.9, y:0}, {opacity:0.2, y:370, duration:1.4, ease:"power1.inOut", immediateRender:false}, ${T(0, 0.3)});
${hienNhan(`${p}-n0`, T(0, 0.6))}
tl.to("#${p}-n0", {opacity:0, duration:0.25}, ${r3(t1 - 0.1)});
tl.to("#${p}-cu", {opacity:0.75, duration:0.3}, ${t1});
const ${p}K = {k:0};
tl.to(${p}K, {k:${K}, duration:${r3(Math.max(1.5, T(1, 0.95) - t1))}, ease:"power1.inOut", onUpdate:()=>{
  const k = ${p}K.k;
  const b = "M40 300 L270 300 C340 300 360 "+(300+k)+" 450 "+(300+k)+" C540 "+(300+k)+" 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z";
  const g = "M40 268 L270 268 C340 268 360 "+(268+k)+" 450 "+(268+k)+" C540 "+(268+k)+" 560 268 630 268 L860 268 L860 300 L630 300 C560 300 540 "+(300+k)+" 450 "+(300+k)+" C360 "+(300+k)+" 340 300 270 300 L40 300 Z";
  document.querySelector("#${p}-bn").setAttribute("d", b); document.querySelector("#${p}-bx").setAttribute("d", b);
  document.querySelector("#${p}-gm").setAttribute("d", g); }}, ${t1});
tl.fromTo("#${p}-mt", {opacity:0, y:-20}, {opacity:1, y:0, duration:0.4}, ${r3(t1 + 0.3)});
${hienNhan(`${p}-n1`, T(1, 0.55))}
${hienNhan(`${p}-n2`, t2 + 0.2)}`,
      sfx: [{ f: "riser", t: t1, v: 0.25 }, { f: "pop", t: T(1, 0.55), v: 0.4 }, { f: "pop", t: t2 + 0.2, v: 0.4 }],
    };
  },

  // i01 — lắp Implant vào chỗ trống, lực nhai truyền xuống xương
  implant_lap(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const k = 40;
    const t0 = T(0, 0.25), tCrown = T(0, 0.75), t1 = T(1, 0.1), t2 = T(2, 0.05);
    return {
      svg: `
<path d="M40 300 L270 300 C340 300 360 ${300 + k} 450 ${300 + k} C540 ${300 + k} 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z" fill="url(#${p}bn)"/>
<path id="${p}-xg" d="M40 300 L270 300 C340 300 360 ${300 + k} 450 ${300 + k} C540 ${300 + k} 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z" fill="url(#${p}xp)"/>
<ellipse id="${p}-sang" cx="450" cy="520" rx="230" ry="120" fill="url(#${p}ngocSang)" opacity="0"/>
${rangHam(p, `${p}-a`, 160, 135, 0.95)}${rangHam(p, `${p}-b`, 740, 135, 0.95)}
${truImplant(p, `${p}-tru`, 450, 330, 1)}
${khopNoi(p, `${p}-kn`, 450, 330, 1)}
${maoSu(p, `${p}-mao`, 450, 150, 0.95)}
<path d="M40 268 L270 268 C340 268 360 ${268 + k} 450 ${268 + k} C540 ${268 + k} 560 268 630 268 L860 268 L860 300 L630 300 C560 300 540 ${300 + k} 450 ${300 + k} C360 ${300 + k} 340 300 270 300 L40 300 Z" fill="url(#${p}gm)" opacity="0.92"/>
<g id="${p}-luc" opacity="0">${[400, 450, 500].map((x) => `<path class="${p}-mu" d="M${x} 360 L${x} 450 M${x - 16} 433 L${x} 453 L${x + 16} 433" stroke="${MAU.ngoc}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
<rect id="${p}-ct" x="300" y="110" width="300" height="520" rx="26" fill="rgba(108,196,255,0.08)" stroke="${MAU.troi}" stroke-width="5" stroke-dasharray="18 12" opacity="0"/>
${nhan(`${p}-n0`, 720, 470, "Trụ Implant", MAU.chu, { co: 30 })}
${nhan(`${p}-n1`, 720, 60, "Mão sứ", MAU.chu, { co: 30 })}
${nhan(`${p}-n2`, 450, 60, "Chụp phim: xương còn đủ?", MAU.troi, { co: 32 })}`,
      js: `
tl.fromTo(["#${p}-a","#${p}-b"], {opacity:0}, {opacity:1, duration:0.4}, 0.1);
tl.fromTo("#${p}-tru", {opacity:0, y:-420}, {opacity:1, y:0, duration:0.7, ease:"power3.in"}, ${t0});
tl.to("#${p}-tru", {y:6, duration:0.08, yoyo:true, repeat:3}, ${r3(t0 + 0.7)});
${hienNhan(`${p}-n0`, t0 + 0.8)}
tl.fromTo("#${p}-kn", {opacity:0, y:-300}, {opacity:1, y:0, duration:0.5, ease:"power3.in"}, ${r3(tCrown - 0.6)});
tl.fromTo("#${p}-mao", {opacity:0, y:-320}, {opacity:1, y:0, duration:0.55, ease:"bounce.out"}, ${tCrown});
${hienNhan(`${p}-n1`, tCrown + 0.45)}
tl.to(["#${p}-n0","#${p}-n1"], {opacity:0, duration:0.25}, ${r3(t1 - 0.05)});
tl.fromTo("#${p}-luc", {opacity:0}, {opacity:1, duration:0.2}, ${t1});
tl.fromTo(".${p}-mu", {y:-30, opacity:0}, {y:40, opacity:1, duration:0.8, stagger:0.12, repeat:2, ease:"power1.in"}, ${t1});
tl.fromTo("#${p}-sang", {opacity:0}, {opacity:1, duration:0.8, yoyo:true, repeat:3}, ${r3(t1 + 0.4)});
tl.to("#${p}-luc", {opacity:0, duration:0.3}, ${r3(t2 - 0.2)});
tl.fromTo("#${p}-ct", {opacity:0, scale:1.15, svgOrigin:"450 370"}, {opacity:1, scale:1, svgOrigin:"450 370", duration:0.45, ease:"expo.out"}, ${t2});
${hienNhan(`${p}-n2`, t2 + 0.3)}`,
      sfx: [{ f: "whoosh-short", t: t0, v: 0.35 }, { f: "click-soft", t: t0 + 0.7, v: 0.5 }, { f: "pop", t: tCrown + 0.4, v: 0.45 }, { f: "riser", t: t1, v: 0.2 }, { f: "click-soft", t: t2, v: 0.45 }],
    };
  },

  // i02 — trụ Implant với thẻ giá "???"
  gia_hoi(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.1);
    return {
      svg: `
<ellipse cx="300" cy="330" rx="240" ry="260" fill="url(#${p}ngocSang)" opacity="0.6"/>
${truImplant(p, `${p}-tru`, 300, 150, 1.35)}
${khopNoi(p, `${p}-kn`, 300, 150, 1.35)}
<g id="${p}-the">
  <path d="M300 40 Q420 30 560 120" stroke="${MAU.mo}" stroke-width="4" fill="none"/>
  <g transform="translate(560 120) rotate(14)">
    <path d="M0 0 L60 -40 L250 -40 Q270 -40 270 -20 L270 150 Q270 170 250 170 L60 170 Z" fill="${MAU.vang}" filter="url(#${p}bong)"/>
    <circle cx="44" cy="0" r="12" fill="${MAU.nen}"/>
    <text x="165" y="22" text-anchor="middle" font-family="BVP" font-weight="800" font-size="34" fill="${MAU.nen}">GIÁ TRỤ</text>
    <text x="165" y="128" text-anchor="middle" font-family="BVP" font-weight="900" font-size="96" fill="${MAU.nen}">???</text>
  </g>
</g>
<g id="${p}-dau" opacity="0"><g transform="translate(450 575) rotate(-6)"><rect x="-300" y="-52" width="600" height="104" rx="22" fill="rgba(6,24,38,0.9)" stroke="${MAU.son}" stroke-width="7"/>
<text x="0" y="20" text-anchor="middle" font-family="BVP" font-weight="900" font-size="54" fill="${MAU.son}">4 CÂU NÊN HỎI</text></g></g>`,
      js: `
tl.fromTo("#${p}-tru", {opacity:0, y:60}, {opacity:1, y:0, duration:0.6, ease:"expo.out"}, 0.1);
tl.fromTo("#${p}-kn", {opacity:0, y:-120}, {opacity:1, y:0, duration:0.5, ease:"bounce.out"}, 0.45);
tl.fromTo("#${p}-the", {opacity:0, rotation:-25, svgOrigin:"300 40"}, {opacity:1, rotation:0, svgOrigin:"300 40", duration:0.9, ease:"elastic.out(1,0.45)"}, ${T(0, 0.3)});
tl.to("#${p}-the", {rotation:4, svgOrigin:"300 40", duration:0.8, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(T(0, 0.3) + 0.9)});
tl.fromTo("#${p}-dau", {opacity:0, scale:2, svgOrigin:"450 575"}, {opacity:1, scale:1, svgOrigin:"450 575", duration:0.35, ease:"power4.in"}, ${t1});`,
      sfx: [{ f: "click-soft", t: 0.6, v: 0.4 }, { f: "whoosh", t: T(0, 0.3), v: 0.3 }, { f: "impact-bass-1", t: t1 + 0.33, v: 0.5 }],
    };
  },

  // i02 — 3 phần của một răng Implant (tách rời)
  implant_tach(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tm = [T(1, 0.05), T(2, 0.05), T(3, 0.1)];
    const day = (y1, y2) => `M330 ${y1} L470 ${y1} L470 ${y2}`;
    return {
      svg: `
<ellipse cx="300" cy="330" rx="230" ry="300" fill="url(#${p}ngocSang)" opacity="0.45"/>
${maoSu(p, `${p}-mao`, 300, 12, 1.05)}
${khopNoi(p, `${p}-kn`, 300, 300, 1.25)}
${truImplant(p, `${p}-tru`, 300, 352, 1.05)}
<g id="${p}-l2" opacity="0"><path d="M385 90 L520 90" stroke="${MAU.vang}" stroke-width="4"/><circle cx="385" cy="90" r="8" fill="${MAU.vang}"/>
  <text x="535" y="102" font-family="BVP" font-weight="900" font-size="46" fill="${MAU.chu}">Mão sứ</text>
  <text x="535" y="146" font-family="BVP" font-weight="600" font-size="28" fill="${MAU.mo}">Phần nhìn thấy khi cười</text></g>
<g id="${p}-l1" opacity="0"><path d="M355 260 L520 260" stroke="${MAU.vang}" stroke-width="4"/><circle cx="355" cy="260" r="8" fill="${MAU.vang}"/>
  <text x="535" y="272" font-family="BVP" font-weight="900" font-size="46" fill="${MAU.chu}">Khớp nối</text>
  <text x="535" y="316" font-family="BVP" font-weight="600" font-size="28" fill="${MAU.mo}">(abutment)</text></g>
<g id="${p}-l0" opacity="0"><path d="M360 470 L520 470" stroke="${MAU.vang}" stroke-width="4"/><circle cx="360" cy="470" r="8" fill="${MAU.vang}"/>
  <text x="535" y="482" font-family="BVP" font-weight="900" font-size="46" fill="${MAU.chu}">Trụ Implant</text>
  <text x="535" y="526" font-family="BVP" font-weight="600" font-size="28" fill="${MAU.mo}">Nằm trong xương hàm</text></g>`,
      js: `
tl.fromTo("#${p}-mao", {opacity:0, y:-80}, {opacity:1, y:0, duration:0.55, ease:"expo.out"}, 0.15);
tl.fromTo("#${p}-kn", {opacity:0, scale:0.4, svgOrigin:"300 260"}, {opacity:1, scale:1, svgOrigin:"300 260", duration:0.5, ease:"back.out(2)"}, 0.3);
tl.fromTo("#${p}-tru", {opacity:0, y:80}, {opacity:1, y:0, duration:0.55, ease:"expo.out"}, 0.45);
${tm.map((t, i) => `tl.fromTo("#${p}-l${i}", {opacity:0, x:-30}, {opacity:1, x:0, duration:0.4, ease:"expo.out"}, ${r3(t)});
tl.fromTo("#${[`${p}-tru`, `${p}-kn`, `${p}-mao`][i]}", {scale:1}, {scale:1.08, svgOrigin:"${["300 470", "300 260", "300 90"][i]}", duration:0.2, yoyo:true, repeat:1}, ${r3(t)});`).join("\n")}`,
      sfx: tm.map((t) => ({ f: "pop", t, v: 0.45 })),
    };
  },

  // i03 — bữa cơm: bát cơm, đũa, bóng thoại; am = phiên bản ấm (hai bát + tim)
  bua_com(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const bat = (id, x, y, s) => `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="-6" rx="190" ry="40" fill="#FFFFFF"/>
  <path d="M-170 -40 Q-150 -120 -60 -128 Q0 -150 60 -128 Q150 -120 170 -40 Z" fill="#FFFFFF"/>
  ${Array.from({ length: 22 }, (_, i) => `<ellipse cx="${-140 + (i % 11) * 28}" cy="${-60 - Math.floor(i / 11) * 36 - (i % 3) * 6}" rx="9" ry="5" fill="#EDEDE6" transform="rotate(${(i * 37) % 80 - 40} ${-140 + (i % 11) * 28} ${-60 - Math.floor(i / 11) * 36})"/>`).join("")}
  <path d="M-200 -10 L200 -10 Q190 150 0 160 Q-190 150 -200 -10 Z" fill="#E8F0F6"/>
  <path d="M-200 -10 L200 -10 Q198 20 190 40 L-190 40 Q-198 20 -200 -10 Z" fill="#2E6C9A"/>
  <path d="M-150 75 Q0 100 150 75" stroke="#2E6C9A" stroke-width="6" fill="none" opacity="0.6"/>
  <ellipse cx="0" cy="160" rx="70" ry="12" fill="#C9D7E2"/>
</g></g>`;
    const khoi = (x) => `<path class="${p}-k" d="M${x} 0 C${x - 20} -30 ${x + 20} -50 ${x} -80 C${x - 20} -110 ${x + 20} -130 ${x} -160" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    const loi = esc(c.loi);
    const w = Math.min(820, Math.round(loi.length * 23 + 90));
    const am = !!c.am;
    return {
      svg: `
<ellipse cx="450" cy="420" rx="420" ry="220" fill="url(#${p}sang)" opacity="${am ? 1 : 0.6}"/>
<g id="${p}-thoai" opacity="0"><rect x="${450 - w / 2}" y="20" width="${w}" height="110" rx="55" fill="#FFFFFF"/>
  <path d="M${am ? 560 : 340} 126 L${am ? 600 : 300} 176 L${am ? 520 : 380} 126 Z" fill="#FFFFFF"/>
  <text x="450" y="90" text-anchor="middle" font-family="BVP" font-weight="800" font-size="42" fill="${MAU.nen}">${loi}</text></g>
${am ? `${bat(`${p}-b1`, 270, 470, 0.72)}${bat(`${p}-b2`, 630, 470, 0.72)}
<g id="${p}-tim" opacity="0"><path transform="translate(450 270) scale(2.4)" d="M0 12 C-24 -6 -14 -26 0 -14 C14 -26 24 -6 0 12 Z" fill="${MAU.son}"/></g>`
    : `${bat(`${p}-b1`, 450, 420, 0.92)}
<g id="${p}-dua" opacity="0"><path d="M640 260 L800 470" stroke="#C88A4E" stroke-width="16" stroke-linecap="round"/><path d="M672 250 L820 452" stroke="#D9A066" stroke-width="16" stroke-linecap="round"/></g>`}
<g transform="translate(0 300)">${am ? [270, 630].map((x) => khoi(x)).join("") : [400, 450, 500].map((x) => khoi(x)).join("")}</g>
${nhan(`${p}-mh`, 450, 612, "Tình huống minh họa", MAU.mo, { co: 26 })}`,
      js: `
tl.fromTo("[id^='${p}-b']", {opacity:0, y:60}, {opacity:1, y:0, duration:0.6, stagger:0.12, ease:"expo.out"}, 0.1);
${am ? `tl.fromTo("#${p}-tim", {opacity:0, scale:0.3, svgOrigin:"450 270"}, {opacity:1, scale:1, svgOrigin:"450 270", duration:0.5, ease:"back.out(2.2)"}, ${T(0, 0.3)});
tl.to("#${p}-tim", {scale:1.12, svgOrigin:"450 270", duration:0.45, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(T(0, 0.3) + 0.5)});`
    : `tl.fromTo("#${p}-dua", {opacity:0, x:60}, {opacity:1, x:0, duration:0.5, ease:"expo.out"}, 0.4);`}
tl.fromTo(".${p}-k", {opacity:0, y:20}, {opacity:1, y:-20, duration:1.6, stagger:0.3, repeat:3, yoyo:true, ease:"sine.inOut"}, 0.3);
tl.fromTo("#${p}-thoai", {opacity:0, scale:0.6, svgOrigin:"450 130"}, {opacity:1, scale:1, svgOrigin:"450 130", duration:0.45, ease:"back.out(1.8)"}, ${T(0, am ? 0.05 : 0.45)});
${hienNhan(`${p}-mh`, 0.8)}`,
      sfx: [{ f: "pop", t: T(0, am ? 0.05 : 0.45), v: 0.4 }, ...(am ? [{ f: "sparkle", t: T(0, 0.3), v: 0.4 }] : [])],
    };
  },

  // s01 — răng cửa, mũi khoan tiến lại, biển dừng
  canh_bao_mai(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tStop = T(0, 0.12);
    return {
      svg: `
<path d="M150 70 Q450 -10 750 70 L750 150 Q450 90 150 150 Z" fill="url(#${p}gm)"/>
<g id="${p}-r"><g transform="translate(400 120)"><path d="${rangCua(250, 380)}" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="3"/>
<path d="M-70 60 Q-80 160 -60 260" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.8"/></g></g>
<g id="${p}-khoan"><g transform="translate(560 300)">
  <rect x="40" y="-34" width="340" height="68" rx="34" fill="#C9D3DC" stroke="#7D8A96" stroke-width="3"/>
  <rect x="0" y="-48" width="90" height="96" rx="28" fill="#E3E9EE" stroke="#7D8A96" stroke-width="3"/>
  <rect x="-48" y="-9" width="56" height="18" rx="6" fill="#9AA6B1"/><circle cx="-50" cy="0" r="12" fill="#7D8A96"/>
</g></g>
<g id="${p}-cam" opacity="0"><circle cx="520" cy="300" r="150" fill="rgba(255,122,107,0.12)" stroke="${MAU.son}" stroke-width="22"/><path d="M414 194 L626 406" stroke="${MAU.son}" stroke-width="22" stroke-linecap="round"/></g>
${nhan(`${p}-n`, 450, 600, "Biết đúng vấn đề trước đã", MAU.ngoc)}`,
      js: `
tl.fromTo("#${p}-r", {opacity:0, y:40}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, 0.05);
tl.fromTo("#${p}-khoan", {x:420, opacity:0}, {x:0, opacity:1, duration:0.55, ease:"power3.out"}, 0.1);
tl.to("#${p}-khoan", {x:-4, duration:0.05, yoyo:true, repeat:5}, 0.65);
tl.fromTo("#${p}-cam", {opacity:0, scale:2.2, svgOrigin:"520 300"}, {opacity:1, scale:1, svgOrigin:"520 300", duration:0.3, ease:"power4.in"}, ${tStop});
tl.to("#${p}-khoan", {x:420, opacity:0, duration:0.6, ease:"power3.in"}, ${r3(tStop + 0.5)});
tl.to("#${p}-cam", {x:-70, duration:0.6, ease:"power2.out"}, ${r3(tStop + 0.6)});
${hienNhan(`${p}-n`, T(1, 0.4))}`,
      sfx: [{ f: "key-press", t: 0.6, v: 0.4 }, { f: "impact-bass-1", t: tStop + 0.28, v: 0.55 }, { f: "pop", t: T(1, 0.4), v: 0.4 }],
    };
  },

  // s01 — men răng: răng thật vs răng đã mài
  mai_rang(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tMai = T(0, 0.3);
    return {
      svg: `
<path d="M40 40 Q225 0 410 40 L410 100 Q225 60 40 100 Z" fill="url(#${p}gm)"/>
<path d="M490 40 Q675 0 860 40 L860 100 Q675 60 490 100 Z" fill="url(#${p}gm)"/>
<g transform="translate(225 80)"><path d="${rangCua(230, 360)}" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="3"/>
  <path d="${rangCua(176, 300)}" transform="translate(0 20)" fill="none" stroke="${MAU.vang}" stroke-width="4" stroke-dasharray="10 8" opacity="0.8"/></g>
<g transform="translate(675 80)">
  <path id="${p}-men" d="${rangCua(230, 360)}" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="3"/>
  <path id="${p}-cu" d="${rangCua(230, 360)}" fill="none" stroke="${MAU.son}" stroke-width="4" stroke-dasharray="12 10" opacity="0"/>
  <path d="${rangCua(176, 300)}" transform="translate(0 20)" fill="url(#${p}rt)" stroke="#BFA678" stroke-width="3"/></g>
<g id="${p}-bui">${Array.from({ length: 14 }, (_, i) => `<circle cx="${675 + ((i * 53) % 220) - 110}" cy="${120 + ((i * 89) % 300)}" r="${4 + (i % 3) * 2}" fill="#FFFFFF" opacity="0"/>`).join("")}</g>
<text x="225" y="500" text-anchor="middle" font-family="BVP" font-weight="900" font-size="40" fill="${MAU.chu}">Răng thật</text>
<text x="675" y="500" text-anchor="middle" font-family="BVP" font-weight="900" font-size="40" fill="${MAU.chu}">Sau khi mài</text>
${nhan(`${p}-n0`, 225, 570, "Lớp men", MAU.vang, { co: 30 })}
${nhan(`${p}-n1`, 675, 570, "Không mọc lại", MAU.son, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-men", {opacity:1}, {opacity:0, duration:1.0, ease:"power2.in"}, ${tMai});
tl.to("#${p}-cu", {opacity:0.9, duration:0.3}, ${r3(tMai + 0.9)});
tl.fromTo("#${p}-bui circle", {opacity:0, y:0}, {opacity:0.9, y:60, duration:0.9, stagger:0.05, ease:"power1.out"}, ${tMai});
tl.to("#${p}-bui circle", {opacity:0, duration:0.4}, ${r3(tMai + 1.4)});
${hienNhan(`${p}-n0`, 0.6)}
${hienNhan(`${p}-n1`, tMai + 1.0)}`,
      sfx: [{ f: "riser", t: tMai, v: 0.25 }, { f: "pop", t: tMai + 1.0, v: 0.45 }],
    };
  },

  // s02 — nụ cười có viền xám ở 2 răng sứ cửa
  nu_cuoi(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t = T(0, 0.45);
    return {
      svg: `
<g transform="translate(450 330) scale(1.12)">${nuCuoi(p, `${p}-nc`, { vienXam: true })}</g>
<ellipse id="${p}-vong" cx="450" cy="262" rx="150" ry="62" fill="none" stroke="${MAU.son}" stroke-width="8" opacity="0"/>
${nhan(`${p}-n`, 450, 600, "Viền xám ở chân răng sứ", MAU.son)}`,
      js: `
tl.fromTo("#${p}-nc", {opacity:0, scale:0.85, svgOrigin:"0 0"}, {opacity:1, scale:1, svgOrigin:"0 0", duration:0.6, ease:"expo.out"}, 0.05);
tl.fromTo(".${p}-nc-xam", {opacity:0}, {opacity:1, duration:0.6}, ${r3(t - 0.3)});
tl.fromTo("#${p}-vong", {opacity:0, scale:1.6, svgOrigin:"450 262"}, {opacity:1, scale:1, svgOrigin:"450 262", duration:0.4, ease:"back.out(1.8)"}, ${t});
tl.to("#${p}-vong", {scale:1.08, svgOrigin:"450 262", duration:0.45, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(t + 0.4)});
${hienNhan(`${p}-n`, t + 0.3)}`,
      sfx: [{ f: "pop", t, v: 0.45 }],
    };
  },

  // s02 — mặt cắt răng sứ kim loại, nướu co lại lộ viền xám, ánh sáng bị chặn
  su_cat_lop(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.15), t2 = T(2, 0.05);
    return {
      svg: `<g transform="translate(330 0)">
<path d="M-112 400 L112 400 L72 640 L-72 640 Z" fill="url(#${p}rt)" opacity="0.9"/>
<path d="M-128 395 L-140 130 Q-128 40 -50 35 L50 35 Q128 40 140 130 L128 395 Z" fill="url(#${p}en)" stroke="#BCCDDA" stroke-width="3"/>
<path id="${p}-kl" d="M-128 412 L-104 128 Q-92 80 -42 78 L42 78 Q92 80 104 128 L128 412 Z" fill="url(#${p}kl)"/>
<path d="M-112 400 L-90 140 Q-80 100 -40 95 L40 95 Q80 100 90 140 L112 400 Z" fill="url(#${p}rt)"/>
<g id="${p}-nuou">
  <path d="M-300 372 Q-180 350 -131 392 L-128 640 L-300 640 Z" fill="url(#${p}gm)"/>
  <path d="M300 372 Q180 350 131 392 L128 640 L300 640 Z" fill="url(#${p}gm)"/></g>
<g id="${p}-as" opacity="0">${[-60, 0, 60].map((x) => `<path d="M${x - 140} -20 L${x - 30} 95" stroke="${MAU.vang}" stroke-width="7" stroke-linecap="round"/><path d="M${x - 46} 80 L${x - 26} 100 M${x - 18} 76 L${x - 40} 102" stroke="${MAU.son}" stroke-width="6" stroke-linecap="round"/>`).join("")}</g>
<ellipse id="${p}-vong" cx="-128" cy="425" rx="46" ry="34" fill="none" stroke="${MAU.son}" stroke-width="6" opacity="0"/>
</g>
<g id="${p}-g0" opacity="0"><path d="M500 90 L620 90" stroke="${MAU.mo}" stroke-width="3"/><text x="635" y="102" font-family="BVP" font-weight="900" font-size="34" fill="${MAU.chu}">Lớp sứ</text></g>
<g id="${p}-g1" opacity="0"><path d="M440 230 L620 230" stroke="${MAU.mo}" stroke-width="3"/><text x="635" y="242" font-family="BVP" font-weight="900" font-size="34" fill="${MAU.vang}">Sườn kim loại</text></g>
<g id="${p}-g2" opacity="0"><path d="M520 520 L620 520" stroke="${MAU.mo}" stroke-width="3"/><text x="635" y="532" font-family="BVP" font-weight="900" font-size="34" fill="${MAU.hong}">Nướu</text></g>
${nhan(`${p}-n1`, 200, 600, "Lộ viền xám", MAU.son, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-g0, #${p}-g1, #${p}-g2", {opacity:0, x:-20}, {opacity:1, x:0, duration:0.4, stagger:0.25}, ${T(0, 0.45)});
tl.fromTo("#${p}-kl", {opacity:0.4}, {opacity:1, duration:0.3, yoyo:true, repeat:3}, ${T(0, 0.55)});
tl.to("#${p}-nuou", {y:46, duration:1.6, ease:"power2.inOut"}, ${t1});
tl.fromTo("#${p}-vong", {opacity:0, scale:1.6, svgOrigin:"-128 425"}, {opacity:1, scale:1, svgOrigin:"-128 425", duration:0.4, ease:"back.out(2)"}, ${r3(t1 + 1.4)});
${hienNhan(`${p}-n1`, t1 + 1.6)}
tl.fromTo("#${p}-as", {opacity:0, y:-30}, {opacity:1, y:0, duration:0.5}, ${t2});`,
      sfx: [{ f: "whoosh", t: T(0, 0.45), v: 0.3 }, { f: "pop", t: t1 + 1.4, v: 0.45 }, { f: "click-soft", t: t2 + 0.3, v: 0.4 }],
    };
  },

  // s02 — so sánh ánh sáng: sườn kim loại vs toàn sứ
  anh_sang(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.05);
    const mao = (x, kimLoai) => `<g transform="translate(${x} 70) scale(0.82)">
  <path d="M-128 395 L-140 130 Q-128 40 -50 35 L50 35 Q128 40 140 130 L128 395 Z" fill="${kimLoai ? "#E6E6E2" : `url(#${p}nat)`}" stroke="#BCCDDA" stroke-width="3"/>
  ${kimLoai ? `<path d="M-128 412 L-104 128 Q-92 80 -42 78 L42 78 Q92 80 104 128 L128 412 Z" fill="url(#${p}kl)"/>` : ""}
  <path d="M-112 400 L-90 140 Q-80 100 -40 95 L40 95 Q80 100 90 140 L112 400 Z" fill="url(#${p}rt)" opacity="${kimLoai ? 1 : 0.85}"/>
  <path d="M-250 ${kimLoai ? 418 : 372} Q-180 ${kimLoai ? 396 : 350} -131 ${kimLoai ? 438 : 392} L-128 560 L-250 560 Z" fill="url(#${p}gm)"/>
  <path d="M250 ${kimLoai ? 418 : 372} Q180 ${kimLoai ? 396 : 350} 131 ${kimLoai ? 438 : 392} L128 560 L250 560 Z" fill="url(#${p}gm)"/>
</g>`;
    return {
      svg: `
<clipPath id="${p}-ct"><rect x="0" y="0" width="900" height="560"/></clipPath>
<g clip-path="url(#${p}-ct)">
<g id="${p}-a">${mao(225, true)}</g>
<g id="${p}-b">${mao(675, false)}</g>
<ellipse id="${p}-sang" cx="675" cy="220" rx="170" ry="190" fill="url(#${p}sang)" opacity="0"/>
<g id="${p}-r1" opacity="0">${[-50, 10].map((x) => `<path d="M${225 + x - 110} -10 L${225 + x - 30} 120" stroke="${MAU.vang}" stroke-width="7" stroke-linecap="round"/>`).join("")}</g>
<g id="${p}-r2" opacity="0">${[-50, 10].map((x) => `<path d="M${675 + x - 110} -10 L${675 + x + 60} 270" stroke="${MAU.vang}" stroke-width="7" stroke-linecap="round" stroke-opacity="0.85"/>`).join("")}</g>
</g>
${nhan(`${p}-na`, 225, 600, "Sườn kim loại", MAU.son, { co: 32 })}
${nhan(`${p}-nb`, 675, 600, "Toàn sứ", MAU.ngoc, { co: 32 })}`,
      js: `
tl.fromTo("#${p}-a", {opacity:0, x:-60}, {opacity:1, x:0, duration:0.5, ease:"expo.out"}, 0.1);
tl.fromTo("#${p}-b", {opacity:0, x:60}, {opacity:1, x:0, duration:0.5, ease:"expo.out"}, 0.25);
${hienNhan(`${p}-na`, 0.5)}
${hienNhan(`${p}-nb`, T(0, 0.25))}
tl.fromTo("#${p}-r1", {opacity:0, y:-40}, {opacity:1, y:0, duration:0.5}, ${t1});
tl.fromTo("#${p}-r2", {opacity:0, y:-40}, {opacity:1, y:0, duration:0.5}, ${r3(t1 + 0.3)});
tl.to("#${p}-sang", {opacity:1, duration:0.8, yoyo:true, repeat:3, ease:"sine.inOut"}, ${r3(t1 + 0.7)});`,
      sfx: [{ f: "whoosh-short", t: 0.1, v: 0.3 }, { f: "sparkle", t: t1 + 0.7, v: 0.4 }],
    };
  },

  // s03 — hai nụ cười: A trắng gạch men vs B tự nhiên
  hai_nu_cuoi(c, { p, d, moc }) {
    const T = moc_(moc, d);
    return {
      svg: `
<g id="${p}-a"><g transform="translate(450 150) scale(0.78)">${nuCuoi(p, `${p}-ga`, { kieu: "gach_men" })}</g></g>
<g id="${p}-b"><g transform="translate(450 470) scale(0.78)">${nuCuoi(p, `${p}-tn`)}</g></g>
<g id="${p}-sao" opacity="0">${[[300, 70], [600, 100], [470, 40]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" fill="#FFFFFF"/>`).join("")}</g>
${nhan(`${p}-na`, 110, 150, "A", MAU.son, { co: 44 })}
${nhan(`${p}-nb`, 110, 470, "B", MAU.ngoc, { co: 44 })}
${nhan(`${p}-ta`, 790, 30, "Gạch men?", MAU.son, { co: 30 })}
${nhan(`${p}-tb`, 790, 352, "Tự nhiên", MAU.ngoc, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-a", {opacity:0, y:-40}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, 0.1);
tl.fromTo("#${p}-sao", {opacity:0, scale:0.4, svgOrigin:"450 70"}, {opacity:1, scale:1, svgOrigin:"450 70", duration:0.4, ease:"back.out(2)"}, ${T(0, 0.55)});
tl.to("#${p}-sao", {rotation:20, svgOrigin:"450 70", opacity:0.4, duration:0.6, yoyo:true, repeat:3}, ${r3(T(0, 0.55) + 0.4)});
${hienNhan(`${p}-na`, 0.4)}
${hienNhan(`${p}-ta`, T(0, 0.6))}
tl.fromTo("#${p}-b", {opacity:0, y:40}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, ${T(1, 0.2)});
${hienNhan(`${p}-nb`, T(1, 0.3))}
${hienNhan(`${p}-tb`, T(1, 0.45))}`,
      sfx: [{ f: "sparkle", t: T(0, 0.55), v: 0.45 }, { f: "pop", t: T(1, 0.2), v: 0.4 }],
    };
  },

  // s03 — bảng so màu: con trỏ từ "quá trắng" sang "hài hoà"
  bang_mau(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const MAU_RANG = ["#FFFFFF", "#F8F3E6", "#F1E6CF", "#E9DABA", "#E0CDA5", "#D5BF90"];
    const x = (i) => 125 + i * 130;
    const t1 = T(1, 0.15), tChon = T(1, 0.55);
    return {
      svg: `
<g id="${p}-mau">
  <circle cx="290" cy="90" r="62" fill="#E5B48A"/><text x="290" y="200" text-anchor="middle" font-family="BVP" font-weight="800" font-size="30" fill="${MAU.mo}">Màu da</text>
  <g transform="translate(610 90)"><path d="M-90 0 Q0 -66 90 0 Q0 66 -90 0 Z" fill="#F2EEE6"/><circle r="34" fill="#5A3B26"/><circle r="14" fill="#140A04"/><circle cx="10" cy="-10" r="7" fill="#FFFFFF"/></g>
  <text x="610" y="200" text-anchor="middle" font-family="BVP" font-weight="800" font-size="30" fill="${MAU.mo}">Lòng trắng mắt</text>
</g>
${MAU_RANG.map((m, i) => `<g class="${p}-tab"><g transform="translate(${x(i)} 260)"><path d="${rangCua(96, 170)}" fill="${m}" stroke="#C9BFA8" stroke-width="2"/></g></g>`).join("")}
<g id="${p}-con"><rect x="${x(0) - 60}" y="240" width="120" height="210" rx="22" fill="none" stroke="${MAU.son}" stroke-width="7"/></g>
${nhan(`${p}-n0`, 230, 520, "Quá trắng, lệch tông", MAU.son, { co: 28 })}
${nhan(`${p}-n1`, 560, 520, "Hài hòa với bạn ✓", MAU.ngoc, { co: 30 })}
<g id="${p}-day" opacity="0"><path d="M290 210 Q310 230 ${x(2) - 10} 245" stroke="${MAU.ngoc}" stroke-width="4" stroke-dasharray="10 8" fill="none"/><path d="M610 210 Q590 230 ${x(2) + 10} 245" stroke="${MAU.ngoc}" stroke-width="4" stroke-dasharray="10 8" fill="none"/></g>`,
      js: `
tl.fromTo(".${p}-tab", {opacity:0, y:40}, {opacity:1, y:0, duration:0.4, stagger:0.08, ease:"back.out(1.7)"}, 0.1);
tl.fromTo("#${p}-con", {opacity:0}, {opacity:1, duration:0.3}, 0.7);
${hienNhan(`${p}-n0`, 0.9)}
tl.fromTo("#${p}-mau", {opacity:0, y:-30}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, ${t1});
tl.to("#${p}-n0", {opacity:0, duration:0.25}, ${r3(tChon - 0.2)});
tl.to("#${p}-con", {x:${x(2) - x(0)}, duration:0.7, ease:"power3.inOut"}, ${tChon});
tl.to("#${p}-con rect", {stroke:"${MAU.ngoc}", duration:0.3}, ${r3(tChon + 0.5)});
tl.fromTo("#${p}-day", {opacity:0}, {opacity:1, duration:0.4}, ${r3(tChon + 0.6)});
${hienNhan(`${p}-n1`, tChon + 0.7)}`,
      sfx: [{ f: "click-soft", t: 0.7, v: 0.4 }, { f: "whoosh-short", t: tChon, v: 0.35 }, { f: "pop", t: tChon + 0.7, v: 0.45 }],
    };
  },

  // s03 — ba khuôn mặt, ba dáng răng
  khuon_mat(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const MAT = [
      { x: 150, ten: "Mặt tròn", mat: `<ellipse cx="0" cy="0" rx="112" ry="128"/>`, rw: 40, rh: 44 },
      { x: 450, ten: "Mặt vuông", mat: `<rect x="-112" y="-140" width="224" height="280" rx="56"/>`, rw: 44, rh: 46 },
      { x: 750, ten: "Mặt dài", mat: `<ellipse cx="0" cy="0" rx="92" ry="160"/>`, rw: 34, rh: 58 },
    ];
    const mat = MAT.map((m, i) => `<g id="${p}-m${i}" opacity="0"><g transform="translate(${m.x} 190)">
  <g fill="rgba(108,196,255,0.08)" stroke="${MAU.mo}" stroke-width="6">${m.mat}</g>
  <circle cx="-38" cy="-30" r="9" fill="${MAU.mo}"/><circle cx="38" cy="-30" r="9" fill="${MAU.mo}"/>
  <path d="M-50 52 Q0 92 50 52" fill="#3A0E18" stroke="${MAU.son}" stroke-width="5"/>
</g>
<g transform="translate(${m.x} 400)"><path d="${rangCua(m.rw * 2.4, m.rh * 2.4)}" transform="translate(${-m.rw * 1.25} 0)" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="2"/>
  <path d="${rangCua(m.rw * 2.4, m.rh * 2.4)}" transform="translate(${m.rw * 1.25} 0)" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="2"/></g>
<text x="${m.x}" y="${400 + Math.max(...MAT.map((q) => q.rh)) * 2.4 + 70}" text-anchor="middle" font-family="BVP" font-weight="900" font-size="38" fill="${MAU.chu}">${m.ten}</text></g>`).join("");
    const tm = [T(1, 0.02), T(1, 0.14), T(1, 0.27)];
    return {
      svg: mat,
      js: tm.map((t, i) => `tl.fromTo("#${p}-m${i}", {opacity:0, y:40, scale:0.9, svgOrigin:"${MAT[i].x} 300"}, {opacity:1, y:0, scale:1, svgOrigin:"${MAT[i].x} 300", duration:0.45, ease:"back.out(1.7)"}, ${r3(t)});`).join("\n"),
      sfx: tm.map((t) => ({ f: "pop", t, v: 0.4 })),
    };
  },

  // s03 — độ trong ở rìa cắn
  do_trong(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.1);
    return {
      svg: `
<clipPath id="${p}-cl"><path d="${rangCua(300, 430)}" transform="translate(600 40)"/></clipPath>
<path d="M60 40 Q225 0 390 40 L390 70 Q225 40 60 70 Z" fill="url(#${p}gm)"/>
<g transform="translate(225 60)"><path d="${rangCua(200, 290)}" fill="#FFFFFF" stroke="#E2ECF4" stroke-width="3"/></g>
<path d="M440 30 Q600 -10 760 30 L760 60 Q600 30 440 60 Z" fill="url(#${p}gm)"/>
<g transform="translate(600 40)"><path d="${rangCua(300, 430)}" fill="url(#${p}nat)" stroke="#D9CDB3" stroke-width="3"/></g>
<g clip-path="url(#${p}-cl)">
  <rect x="440" y="360" width="320" height="120" fill="#BBD7EC" opacity="0.55"/>
  <rect id="${p}-quet" x="380" y="340" width="60" height="160" fill="#FFFFFF" opacity="0.7" filter="url(#${p}mo)"/>
</g>
<text x="225" y="430" text-anchor="middle" font-family="BVP" font-weight="900" font-size="36" fill="${MAU.chu}">Một màu, đục</text>
<text x="600" y="540" text-anchor="middle" font-family="BVP" font-weight="900" font-size="36" fill="${MAU.chu}">Có độ trong</text>
<g id="${p}-chi" opacity="0"><path d="M400 420 L455 420" stroke="${MAU.ngoc}" stroke-width="5" stroke-linecap="round"/><circle cx="465" cy="420" r="9" fill="${MAU.ngoc}"/></g>
${nhan(`${p}-n`, 600, 605, "Rìa cắn hơi trong", MAU.ngoc, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-quet", {x:0}, {x:420, duration:1.4, ease:"power2.inOut", repeat:2, repeatDelay:0.4}, ${t1});
tl.fromTo("#${p}-chi", {opacity:0, x:-20}, {opacity:1, x:0, duration:0.35}, ${r3(t1 + 0.2)});
${hienNhan(`${p}-n`, t1 + 0.3)}`,
      sfx: [{ f: "sparkle", t: t1, v: 0.4 }, { f: "pop", t: t1 + 0.3, v: 0.4 }],
    };
  },
};

// ---------------------------------------------------------------- logo
/** Logo Tâm Đức Smile vẽ lại bằng SVG nội tuyến (cỏ 4 lá tim + chữ), dùng khi chưa có file logo gốc trong logo/.
 *  Khung 705 × 147 như logo gốc; chữ dùng phông Be Vietnam Pro đã nạp trong trang. */
export function logoSvg(id, rong) {
  const XANH = "#1F8F5B", DO = "#E3262F";
  const TIM = "M0 18 C0 4 -24 -2 -28 14 C-31 28 -14 40 0 52 C14 40 31 28 28 14 C24 -2 0 4 0 18 Z";
  const la = [[72, 8, 0], [136, 73, 90], [72, 138, 180], [8, 73, -90]].map(([x, y, g]) =>
    `<g transform="translate(${x} ${y}) rotate(${g})"><path d="${TIM}" transform="scale(1.08)" fill="#FFFFFF" stroke="${XANH}" stroke-width="7" stroke-linejoin="round"/>
  <path d="${TIM}" transform="translate(0 14) scale(0.42)" fill="${DO}"/></g>`).join("");
  return `<svg id="${id}" width="${rong}" height="${Math.round((rong * 147) / 705)}" viewBox="0 0 705 147">
${la}
<text x="205" y="80" font-family="BVP" font-weight="900" font-size="66" fill="${DO}" textLength="305" lengthAdjust="spacingAndGlyphs">TÂM ĐỨC</text>
<text x="527" y="80" font-family="BVP" font-weight="800" font-size="68" fill="${XANH}" textLength="172" lengthAdjust="spacingAndGlyphs">Smile</text>
<path transform="translate(597 16) scale(0.2)" d="${TIM}" fill="${DO}"/>
<line x1="205" y1="118" x2="262" y2="118" stroke="${XANH}" stroke-width="3"/><line x1="642" y1="118" x2="699" y2="118" stroke="${XANH}" stroke-width="3"/>
<text x="452" y="130" text-anchor="middle" font-family="BVP" font-weight="700" font-size="34" fill="${XANH}" textLength="350" lengthAdjust="spacingAndGlyphs">Răng Tốt Sức Khoẻ Tốt</text>
</svg>`;
}
