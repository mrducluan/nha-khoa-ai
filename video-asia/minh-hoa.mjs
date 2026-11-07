// Hình minh hoạ nha khoa tự vẽ bằng SVG (không dùng ảnh người thật, không dùng ảnh kho có bản quyền).
// Mỗi hình vẽ trong khung 900 × 640 (vùng hình cố định của khung dọc: x 90–990, y 490–1130) nên KHÔNG bao giờ
// chạm vùng tiêu đề (y 250–470) hay vùng phụ đề (y ≥ 1190).
// Hàm hình: (c, { p, d, moc }) → { svg, js, sfx }  — js dùng biến `tl` (GSAP timeline của cảnh).

export const MAU = {
  nen: "#04201B", nen2: "#073229", mat: "#0B3B32", mat2: "#0F4A3E", vien: "#1F6B5A",
  chu: "#F3FBF8", mo: "#A6D2C6", nhat: "#7AA89A",
  vang: "#FFC24D", ngoc: "#00D0A6", troi: "#6CC4FF", son: "#FF7A6B", hong: "#F59AA8",
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
<radialGradient id="${p}ngocSang" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#00D0A6" stop-opacity="0.5"/><stop offset="1" stop-color="#00D0A6" stop-opacity="0"/></radialGradient>
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
function nhan(id, x, y, chu, mau, { co = 32, nen = "rgba(4,32,27,0.92)" } = {}) {
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
    const k = 0; // nướu và xương phẳng: răng Implant thẳng hàng với 2 răng bên
    const t0 = T(0, 0.25), tCrown = T(0, 0.75), t1 = T(1, 0.1), t2 = T(2, 0.05);
    return {
      svg: `
<path d="M40 300 L270 300 C340 300 360 ${300 + k} 450 ${300 + k} C540 ${300 + k} 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z" fill="url(#${p}bn)"/>
<path id="${p}-xg" d="M40 300 L270 300 C340 300 360 ${300 + k} 450 ${300 + k} C540 ${300 + k} 560 300 630 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z" fill="url(#${p}xp)"/>
<ellipse id="${p}-sang" cx="450" cy="520" rx="230" ry="120" fill="url(#${p}ngocSang)" opacity="0"/>
${rangHam(p, `${p}-a`, 160, 135, 0.95)}${rangHam(p, `${p}-b`, 740, 135, 0.95)}
${truImplant(p, `${p}-tru`, 450, 304, 1)}
${khopNoi(p, `${p}-kn`, 450, 304, 0.95)}
${maoSu(p, `${p}-mao`, 450, 135, 0.95)}
<path d="M40 268 L270 268 C340 268 360 ${268 + k} 450 ${268 + k} C540 ${268 + k} 560 268 630 268 L860 268 L860 300 L630 300 C560 300 540 ${300 + k} 450 ${300 + k} C360 ${300 + k} 340 300 270 300 L40 300 Z" fill="url(#${p}gm)" opacity="0.92"/>
<g id="${p}-luc" opacity="0">${[352, 548].map((x) => `<path class="${p}-mu" d="M${x} 360 L${x} 450 M${x - 16} 433 L${x} 453 L${x + 16} 433" stroke="${MAU.ngoc}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
<rect id="${p}-ct" x="300" y="110" width="300" height="520" rx="26" fill="rgba(108,196,255,0.08)" stroke="${MAU.troi}" stroke-width="5" stroke-dasharray="18 12" opacity="0"/>
<g id="${p}-d0" opacity="0"><path d="M450 548 L450 588" stroke="${MAU.vang}" stroke-width="4"/><circle cx="450" cy="548" r="7" fill="${MAU.vang}"/></g>
${nhan(`${p}-n0`, 450, 612, "Trụ Implant", MAU.vang, { co: 30 })}
<g id="${p}-d1" opacity="0"><path d="M450 128 L450 88" stroke="${MAU.vang}" stroke-width="4"/><circle cx="450" cy="128" r="7" fill="${MAU.vang}"/></g>
${nhan(`${p}-n1`, 450, 62, "Mão sứ", MAU.vang, { co: 30 })}
${nhan(`${p}-n2`, 450, 60, c.nhan2 ?? "Chụp phim: xương còn đủ?", MAU.troi, { co: 32 })}`,
      js: `
tl.fromTo(["#${p}-a","#${p}-b"], {opacity:0}, {opacity:1, duration:0.4}, 0.1);
tl.fromTo("#${p}-tru", {opacity:0, y:-420}, {opacity:1, y:0, duration:0.7, ease:"power3.in"}, ${t0});
tl.to("#${p}-tru", {y:6, duration:0.08, yoyo:true, repeat:3}, ${r3(t0 + 0.7)});
${hienNhan(`${p}-n0`, t0 + 0.8)}
tl.fromTo("#${p}-d0", {opacity:0}, {opacity:1, duration:0.3}, ${r3(t0 + 0.8)});
tl.fromTo("#${p}-kn", {opacity:0, y:-300}, {opacity:1, y:0, duration:0.5, ease:"power3.in"}, ${r3(tCrown - 0.6)});
tl.fromTo("#${p}-mao", {opacity:0, y:-320}, {opacity:1, y:0, duration:0.55, ease:"bounce.out"}, ${tCrown});
${hienNhan(`${p}-n1`, tCrown + 0.45)}
tl.fromTo("#${p}-d1", {opacity:0}, {opacity:1, duration:0.3}, ${r3(tCrown + 0.45)});
tl.to(["#${p}-n0","#${p}-n1","#${p}-d0","#${p}-d1"], {opacity:0, duration:0.25}, ${r3(t1 - 0.05)});
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
<g id="${p}-dau" opacity="0"><g transform="translate(450 575) rotate(-6)"><rect x="-300" y="-52" width="600" height="104" rx="22" fill="rgba(4,32,27,0.9)" stroke="${MAU.son}" stroke-width="7"/>
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
<g transform="translate(450 330) scale(1.12)">${nuCuoi(p, `${p}-nc`, { vienXam: c.vien_xam ?? true })}</g>
<ellipse id="${p}-vong" cx="450" cy="262" rx="150" ry="62" fill="none" stroke="${c.mau_nhan ? MAU[c.mau_nhan] : MAU.son}" stroke-width="8" opacity="0"/>
${nhan(`${p}-n`, 450, 600, c.nhan ?? "Viền xám ở chân răng sứ", c.mau_nhan ? MAU[c.mau_nhan] : MAU.son)}`,
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

// ---------------------------------------------------------------- a01 (All-on-4)
Object.assign(HINH, {
  // a01 — cốc nước đầu giường, hàm giả tháo lắp chìm trong nước, ánh trăng
  ly_ham_gia(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tRang = T(0, 0.35);
    const rangHang = Array.from({ length: 10 }, (_, i) => {
      const x = 362 + i * 18, h = 30 - Math.abs(i - 4.5) * 2.4;
      return `<rect x="${x}" y="402" width="16" height="${h}" rx="6" fill="url(#${p}en)" stroke="#C9D6E0" stroke-width="1"/>`;
    }).join("");
    const bot = Array.from({ length: 9 }, (_, i) => `<circle class="${p}-bot" cx="${375 + ((i * 47) % 150)}" cy="${520 - (i % 3) * 30}" r="${3 + (i % 3) * 2}" fill="#FFFFFF" opacity="0"/>`).join("");
    return {
      svg: `
<circle cx="140" cy="110" r="64" fill="#FFF3C4" opacity="0.92"/><circle cx="168" cy="96" r="58" fill="#073229" opacity="0.92"/>
<circle id="${p}-trang" cx="140" cy="110" r="120" fill="url(#${p}sang)" opacity="0.5"/>
<rect x="60" y="560" width="780" height="22" rx="8" fill="#5B3B26"/><rect x="60" y="578" width="780" height="40" rx="6" fill="#3E2818"/>
<ellipse cx="450" cy="560" rx="150" ry="16" fill="#000" opacity="0.35"/>
<g id="${p}-ly">
  <path d="M320 150 L580 150 L560 548 Q450 566 340 548 Z" fill="rgba(180,220,245,0.10)" stroke="rgba(255,255,255,0.55)" stroke-width="5"/>
  <path d="M327 250 L573 250 L560 548 Q450 566 340 548 Z" fill="rgba(108,196,255,0.28)"/>
  <ellipse cx="450" cy="250" rx="123" ry="12" fill="rgba(170,225,255,0.45)"/>
  <g id="${p}-ham"><g transform="rotate(-6 450 410)">
    <path d="M352 400 Q450 352 548 400 L548 414 Q450 380 352 414 Z" fill="url(#${p}gm)"/>
    <path d="M352 400 Q450 360 548 400" stroke="#FBC4CD" stroke-width="3" fill="none"/>
    ${rangHang}
  </g></g>
  ${bot}
  <path d="M350 170 L346 520" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.35"/>
</g>
${nhan(`${p}-mh`, 700, 520, "Tình huống minh họa", MAU.mo, { co: 24 })}`,
      js: `
tl.fromTo("#${p}-ly", {opacity:0, y:40}, {opacity:1, y:0, duration:0.6, ease:"expo.out"}, 0.05);
tl.fromTo("#${p}-ham", {y:-150, opacity:0}, {y:0, opacity:1, duration:1.2, ease:"power2.out"}, ${tRang});
tl.fromTo(".${p}-bot", {opacity:0, y:0}, {opacity:0.75, y:-220, duration:2.2, stagger:0.25, repeat:2, ease:"none"}, ${r3(tRang + 0.3)});
tl.to("#${p}-trang", {opacity:0.9, duration:1.6, yoyo:true, repeat:3, ease:"sine.inOut"}, 0.4);
${hienNhan(`${p}-mh`, 0.8)}`,
      sfx: [{ f: "whoosh-short", t: tRang, v: 0.25 }],
    };
  },

  // a01 — All-on-4: 2 trụ trước thẳng + 2 trụ sau nghiêng 30–45° (tránh lỗ cằm), cả dãy răng bắt vít lên trụ
  all_on_4(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tTru = T(0, 0.55), tNghieng = T(1, 0.1), tXuong = T(1, 0.45), tCau = T(2, 0.05);
    // cung răng (dải cong) — y theo đường cong Q(60,300)–(450,220)–(840,300)
    const yCung = (x) => { const t = (x - 60) / 780; return (1 - t) ** 2 * 300 + 2 * (1 - t) * t * 220 + t * t * 300; };
    const tru = [[215, -35], [372, 0], [528, 0], [685, 35]];
    const truSvg = tru.map(([x, g], i) => `<g id="${p}-t${i}" opacity="0"><g transform="rotate(${g} ${x} ${r3(yCung(x) + 40)})">${truImplant(p, `${p}-ti${i}`, x, r3(yCung(x) + 40), 0.6)}</g></g>`).join("");
    const RANG = Array.from({ length: 14 }, (_, i) => {
      const x = 96 + i * 54.5, y = yCung(x) - 2, w = 54 - Math.abs(i - 6.5) * 1.4, h = 84 - Math.abs(i - 6.5) * 3.6;
      return `<rect x="${r3(x - w / 2)}" y="${r3(y - h)}" width="${r3(w)}" height="${r3(h)}" rx="${r3(w * 0.38)}" fill="url(#${p}en)" stroke="#BCCDDA" stroke-width="1.5"/>`;
    }).join("");
    return {
      svg: `
<path d="M60 316 Q450 236 840 316 L840 560 Q450 640 60 560 Z" fill="url(#${p}bn)"/>
<path d="M60 316 Q450 236 840 316 L840 560 Q450 640 60 560 Z" fill="url(#${p}xp)"/>
<ellipse id="${p}-chac" cx="450" cy="430" rx="230" ry="120" fill="url(#${p}ngocSang)" opacity="0"/>
<g fill="${MAU.vang}"><circle cx="150" cy="470" r="11"/><circle cx="750" cy="470" r="11"/></g>
<path d="M60 300 Q450 220 840 300 L840 330 Q450 250 60 330 Z" fill="url(#${p}gm)"/>
${truSvg}
<g id="${p}-goc" opacity="0">
  <path d="M215 ${r3(yCung(215) + 40)} L215 ${r3(yCung(215) + 170)}" stroke="${MAU.mo}" stroke-width="3" stroke-dasharray="8 6"/>
  <path d="M685 ${r3(yCung(685) + 40)} L685 ${r3(yCung(685) + 170)}" stroke="${MAU.mo}" stroke-width="3" stroke-dasharray="8 6"/>
</g>
<g id="${p}-cau" opacity="0">
  <path d="M70 ${r3(yCung(70) + 2)} Q450 ${r3(yCung(450) * 2 - 0.5 * (yCung(70) + yCung(830)) - 4)} 830 ${r3(yCung(830) + 2)} L830 ${r3(yCung(830) - 26)} Q450 ${r3(yCung(450) * 2 - 0.5 * (yCung(70) + yCung(830)) - 32)} 70 ${r3(yCung(70) - 26)} Z" fill="url(#${p}gm)" stroke="#E07D93" stroke-width="2"/>
  ${RANG}
</g>
${nhan(`${p}-n0`, 450, 612, "2 trụ thẳng · 2 trụ nghiêng 30–45°", MAU.vang, { co: 28 })}
${nhan(`${p}-n1`, 450, 40, "Cả hàm răng bắt vít cố định", MAU.ngoc, { co: 30 })}
${nhan(`${p}-n2`, 790, 540, "Né dây thần kinh", MAU.vang, { co: 22 })}`,
      js: `
${tru.map((_, i) => `tl.fromTo("#${p}-t${i}", {opacity:0, y:-60}, {opacity:1, y:0, duration:0.5, ease:"power3.out"}, ${r3(tTru + i * 0.18)});`).join("\n")}
tl.fromTo("#${p}-goc", {opacity:0}, {opacity:1, duration:0.4}, ${tNghieng});
${hienNhan(`${p}-n0`, tNghieng + 0.2)}
${hienNhan(`${p}-n2`, tNghieng + 0.6)}
tl.to("#${p}-chac", {opacity:1, duration:0.8, yoyo:true, repeat:2, ease:"sine.inOut"}, ${tXuong});
tl.to(["#${p}-n2","#${p}-goc"], {opacity:0, duration:0.3}, ${r3(tCau - 0.1)});
tl.fromTo("#${p}-cau", {opacity:0, y:-260}, {opacity:1, y:0, duration:0.8, ease:"bounce.out"}, ${tCau});
${hienNhan(`${p}-n1`, tCau + 0.7)}`,
      sfx: [...tru.map((_, i) => ({ f: "click-soft", t: tTru + i * 0.18 + 0.4, v: 0.4 })), { f: "pop", t: tCau + 0.6, v: 0.5 }],
    };
  },
});

// ================================================================ Nha khoa Asia (4 hình mới)
/** Người dạng khối tròn (đầu + thân), (x, y) = đỉnh đầu. */
function nguoi(id, x, y, s, { than = MAU.ngoc, da = "#F2C9A0", toc = "#2B2B33", mu = null } = {}) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-78 120 C-78 92 -48 78 0 78 C48 78 78 92 78 120 L84 330 Q84 350 64 350 L-64 350 Q-84 350 -84 330 Z" fill="${than}"/>
  <circle cx="0" cy="36" r="38" fill="${da}"/>
  ${mu ? `<path d="M-40 30 C-40 -6 40 -6 40 30 Z" fill="${mu}"/>` : `<path d="M-38 30 C-42 -8 40 -10 38 26 C26 6 -18 4 -38 30 Z" fill="${toc}"/>`}
</g></g>`;
}

Object.assign(HINH, {
  // i01 — người nhà đứng ngoài vách kính, bên trong là ghế nha + bác sĩ
  phong_kinh(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.15);
    const tia = [0, 1, 2].map((i) => `<path d="M${398 + i * 22} ${80 + i * 40} L${430 + i * 22} ${40 + i * 40}" stroke="#FFFFFF" stroke-width="${6 - i * 2}" stroke-linecap="round" opacity="0.6"/>`).join("");
    return {
      svg: `
<rect x="40" y="598" width="820" height="8" rx="4" fill="${MAU.vien}"/>
<ellipse id="${p}-den" cx="660" cy="70" rx="120" ry="34" fill="url(#${p}sang)" opacity="0"/>
<g id="${p}-trong" opacity="0">
  <path d="M500 470 L760 430 Q790 426 792 450 L796 482 Q798 500 778 504 L520 540 Q496 544 494 520 Z" fill="#D7E3E8" stroke="#9FB3BF" stroke-width="3"/>
  <rect x="610" y="520" width="26" height="78" rx="8" fill="#9FB3BF"/><rect x="560" y="586" width="130" height="16" rx="8" fill="#9FB3BF"/>
  <path d="M540 470 C560 440 640 430 720 420 L740 452 C680 470 600 482 548 498 Z" fill="${MAU.hong}"/>
  <circle cx="512" cy="448" r="34" fill="#F2C9A0"/><path d="M482 440 C480 410 540 404 544 436 C528 424 498 426 482 440 Z" fill="#D9D9DE"/>
  ${nguoi(`${p}-bs`, 700, 230, 0.78, { than: "#FFFFFF", mu: MAU.ngoc })}
  <rect x="620" y="300" width="70" height="12" rx="6" fill="#9FB3BF" transform="rotate(-18 655 306)"/>
</g>
<g id="${p}-kinh" opacity="0">
  <rect x="372" y="40" width="64" height="560" rx="10" fill="rgba(108,196,255,0.16)" stroke="${MAU.troi}" stroke-width="4"/>
  <clipPath id="${p}-kcl"><rect x="372" y="40" width="64" height="560" rx="10"/></clipPath>
  <g clip-path="url(#${p}-kcl)">${tia}<rect class="${p}-quet" x="300" y="0" width="40" height="640" fill="url(#${p}bl)" transform="rotate(14 404 320)"/></g>
</g>
${nguoi(`${p}-con`, 230, 230, 1.02, { than: MAU.ngoc })}
<g id="${p}-tay"><ellipse cx="362" cy="380" rx="16" ry="22" fill="#F2C9A0"/><path d="M300 330 Q330 360 352 378" stroke="${MAU.ngoc}" stroke-width="30" stroke-linecap="round" fill="none"/></g>
<g id="${p}-tim" opacity="0"><path transform="translate(404 150) scale(1.5)" d="M0 18 C0 4 -24 -2 -28 14 C-31 28 -14 40 0 52 C14 40 31 28 28 14 C24 -2 0 4 0 18 Z" fill="${MAU.son}"/></g>
${nhan(`${p}-n0`, 220, 625, "Người nhà", MAU.ngoc, { co: 30 })}
${nhan(`${p}-n1`, 660, 625, "Phòng phẫu thuật", MAU.vang, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-kinh", {opacity:0, scaleY:0.6, svgOrigin:"404 600"}, {opacity:1, scaleY:1, svgOrigin:"404 600", duration:0.6, ease:"expo.out"}, 0.05);
tl.fromTo("#${p}-trong", {opacity:0, x:40}, {opacity:1, x:0, duration:0.6, ease:"expo.out"}, 0.25);
tl.fromTo("#${p}-den", {opacity:0}, {opacity:1, duration:0.6}, 0.4);
tl.fromTo(["#${p}-con","#${p}-tay"], {opacity:0, x:-160}, {opacity:1, x:0, duration:0.7, ease:"power3.out"}, 0.2);
tl.fromTo(".${p}-quet", {x:-120}, {x:260, duration:1.6, repeat:${Math.max(1, Math.floor(d / 2.6))}, repeatDelay:0.9, ease:"power1.inOut"}, 0.9);
tl.to("#${p}-tay", {x:4, duration:0.5, yoyo:true, repeat:${Math.max(1, Math.floor(d / 1))}, ease:"sine.inOut"}, 1.0);
${hienNhan(`${p}-n0`, T(0, 0.35))}
${hienNhan(`${p}-n1`, T(0, 0.75))}
tl.fromTo("#${p}-tim", {opacity:0, scale:0.2, svgOrigin:"404 180"}, {opacity:1, scale:1, svgOrigin:"404 180", duration:0.5, ease:"back.out(2.4)"}, ${t1});
tl.to("#${p}-tim", {scale:1.12, svgOrigin:"404 180", duration:0.4, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(t1 + 0.5)});`,
      sfx: [{ f: "whoosh-short", t: 0.2, v: 0.3 }, { f: "pop", t: T(0, 0.35), v: 0.35 }, { f: "sparkle", t: t1, v: 0.4 }],
    };
  },

  // i02 — hàm trên: xoang hàm sà xuống, nâng màng xoang + ghép xương, đặt trụ
  nang_xoang(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tNang = T(0, 0.3), tTru = T(1, 0.15), t2 = T(2, 0.15);
    return {
      svg: `
<path d="M60 60 L840 60 L840 360 L60 360 Z" fill="url(#${p}bn)"/><path d="M60 60 L840 60 L840 360 L60 360 Z" fill="url(#${p}xp)"/>
<path d="M200 262 C200 110 300 64 450 64 C600 64 700 110 700 262 Z" fill="${MAU.nen2}" stroke="#F49AAA" stroke-width="6"/>
<g id="${p}-ghep"><path d="M300 262 C300 150 600 150 600 262 Z" fill="url(#${p}bn)"/><path d="M300 262 C300 150 600 150 600 262 Z" fill="url(#${p}xp)"/>
<path d="M300 262 C300 150 600 150 600 262" stroke="#F49AAA" stroke-width="7" fill="none"/></g>
${rangHam(p, `${p}-a`, 160, 560, 0.95, { up: true })}${rangHam(p, `${p}-b`, 740, 560, 0.95, { up: true })}
<g id="${p}-tru" opacity="0"><g transform="rotate(180 450 388)">${truImplant(p, `${p}-ti`, 450, 388, 0.78)}</g></g>
<path d="M60 360 L840 360 L840 392 L60 392 Z" fill="url(#${p}gm)"/>
<g id="${p}-do" opacity="0"><path d="M820 266 L820 356 M806 266 L834 266 M806 356 L834 356" stroke="${MAU.vang}" stroke-width="5"/></g>
${nhan(`${p}-n0`, 450, 160, "Xoang hàm", MAU.mo, { co: 30 })}
${nhan(`${p}-n1`, 450, 612, "Xương dưới xoang còn mỏng", MAU.vang, { co: 30 })}
${nhan(`${p}-n2`, 450, 612, "Nâng màng xoang + ghép xương", MAU.ngoc, { co: 30 })}
${nhan(`${p}-n3`, 450, 612, "Xương đủ chắc: đặt trụ cùng lúc", MAU.ngoc, { co: 30 })}
${nhan(`${p}-n4`, 450, 612, "Quá mỏng: ghép trước, đặt trụ sau", MAU.vang, { co: 30 })}`,
      js: `
tl.set("#${p}-ghep", {scaleY:0.02, svgOrigin:"450 262"}, 0);
tl.fromTo(["#${p}-a","#${p}-b"], {opacity:0, y:30}, {opacity:1, y:0, duration:0.5, stagger:0.08}, 0.1);
${hienNhan(`${p}-n0`, 0.3)}
tl.fromTo("#${p}-do", {opacity:0}, {opacity:1, duration:0.3}, 0.5);
${hienNhan(`${p}-n1`, 0.6)}
tl.to(["#${p}-n0","#${p}-n1"], {opacity:0, duration:0.25}, ${r3(tNang - 0.1)});
tl.to("#${p}-ghep", {scaleY:1, svgOrigin:"450 262", duration:1.2, ease:"power2.out"}, ${tNang});
${hienNhan(`${p}-n2`, tNang + 0.4)}
tl.to("#${p}-n2", {opacity:0, duration:0.25}, ${r3(tTru - 0.1)});
tl.fromTo("#${p}-tru", {opacity:0, y:260}, {opacity:1, y:0, duration:0.8, ease:"power3.out"}, ${tTru});
${hienNhan(`${p}-n3`, tTru + 0.6)}
tl.to("#${p}-n3", {opacity:0, duration:0.25}, ${r3(t2 - 0.1)});
tl.to("#${p}-tru", {opacity:0.3, duration:0.4}, ${t2});
${hienNhan(`${p}-n4`, t2 + 0.2)}`,
      sfx: [{ f: "riser", t: tNang, v: 0.25 }, { f: "whoosh-short", t: tTru, v: 0.35 }, { f: "click-soft", t: tTru + 0.8, v: 0.45 }, { f: "pop", t: t2 + 0.2, v: 0.4 }],
    };
  },

  // i03 — mảng bám quanh cổ trụ → nướu viêm → xương quanh trụ tiêu → trụ lung lay
  viem_implant(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t0 = T(0, 0.3), t1 = T(1, 0.1), t1b = T(1, 0.55), t2 = T(2, 0.2);
    const bone = "M40 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z";
    const gum = "M40 268 L860 268 L860 300 L40 300 Z";
    const mb = Array.from({ length: 14 }, (_, i) => {
      const x = 372 + ((i * 53) % 156), y = 262 + ((i * 17) % 34), r = 5 + (i % 3) * 2;
      return `<circle class="${p}-mb" cx="${x}" cy="${y}" r="${r}" fill="#E6D27A" opacity="0"/>`;
    }).join("");
    return {
      svg: `
<path d="${bone}" fill="url(#${p}bn)"/><path d="${bone}" fill="url(#${p}xp)"/>
<g id="${p}-lom"><path d="M364 300 L405 300 L405 404 Z" fill="${MAU.nen2}"/><path d="M536 300 L495 300 L495 404 Z" fill="${MAU.nen2}"/></g>
${rangHam(p, `${p}-a`, 160, 135, 0.95)}${rangHam(p, `${p}-b`, 740, 135, 0.95)}
<g id="${p}-cum">${truImplant(p, `${p}-tru`, 450, 304, 1)}${khopNoi(p, `${p}-kn`, 450, 304, 0.95)}${maoSu(p, `${p}-mao`, 450, 135, 0.95)}</g>
<path d="${gum}" fill="url(#${p}gm)" opacity="0.92"/>
<path id="${p}-do" d="${gum}" fill="${MAU.son}" opacity="0"/>
${mb}
${nhan(`${p}-n0`, 450, 60, "Mảng bám quanh cổ trụ", MAU.vang, { co: 30 })}
${nhan(`${p}-n1`, 450, 612, "Nướu viêm · xương quanh trụ tiêu", MAU.son, { co: 30 })}
${nhan(`${p}-n2`, 450, 60, "Viêm quanh Implant", MAU.son, { co: 34 })}`,
      js: `
tl.set("#${p}-lom", {scaleY:0, svgOrigin:"450 300"}, 0);
tl.fromTo(["#${p}-a","#${p}-b","#${p}-cum"], {opacity:0}, {opacity:1, duration:0.45, stagger:0.06}, 0.05);
tl.fromTo(".${p}-mb", {opacity:0, scale:0, transformOrigin:"50% 50%"}, {opacity:0.95, scale:1, transformOrigin:"50% 50%", duration:0.3, stagger:0.06, ease:"back.out(2)"}, ${t0});
${hienNhan(`${p}-n0`, t0 + 0.4)}
tl.to("#${p}-do", {opacity:0.7, duration:0.8, ease:"power1.in"}, ${t1});
tl.to("#${p}-do", {opacity:0.45, duration:0.5, yoyo:true, repeat:3, ease:"sine.inOut"}, ${r3(t1 + 0.8)});
tl.to("#${p}-lom", {scaleY:1, svgOrigin:"450 300", duration:1.2, ease:"power1.inOut"}, ${t1b});
${hienNhan(`${p}-n1`, t1b + 0.3)}
tl.to("#${p}-n0", {opacity:0, duration:0.25}, ${r3(t2 - 0.1)});
tl.to("#${p}-cum", {rotation:3, svgOrigin:"450 420", duration:0.12, yoyo:true, repeat:9, ease:"sine.inOut"}, ${t2});
${hienNhan(`${p}-n2`, t2 + 0.15)}`,
      sfx: [{ f: "pop", t: t0 + 0.4, v: 0.35 }, { f: "riser", t: t1b, v: 0.25 }, { f: "impact-bass-1", t: t2, v: 0.4 }],
    };
  },

  // s03 — 2 răng sứ cửa giữ màu cũ, các răng thật trắng lên sau tẩy trắng
  lech_mau(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t0 = T(0, 0.35), t1 = T(1, 0.12);
    const RANG = [[0, 84, 118], [1, 66, 100], [2, 62, 104], [3, 56, 86], [4, 50, 76]];
    const tam = [42, 117, 181, 240, 293];
    const top = (x) => r3(-64 + 62 * (x / 320) ** 2);
    const lop = (cls, mau, chon) => [-1, 1].flatMap((sg) => RANG.filter(([i]) => chon(i)).map(([i, w, h]) =>
      `<g transform="translate(${sg * tam[i]} ${top(sg * tam[i])})"><path class="${cls}" d="${rangCua(w, h)}" fill="${mau}" opacity="0"/></g>`)).join("");
    return {
      svg: `
<g transform="translate(450 330) scale(1.12)">${nuCuoi(p, `${p}-nc`)}
<g clip-path="url(#${p}-nc-cl)">${lop(`${p}-vang`, "#D8B566", () => true)}${lop(`${p}-trang`, "#FFFFFF", (i) => i > 0)}</g></g>
<g id="${p}-chi" opacity="0"><path d="M450 112 L403 228 M450 112 L497 228" stroke="${MAU.vang}" stroke-width="4"/><circle cx="403" cy="228" r="7" fill="${MAU.vang}"/><circle cx="497" cy="228" r="7" fill="${MAU.vang}"/></g>
${nhan(`${p}-n0`, 450, 80, "2 răng sứ", MAU.vang, { co: 32 })}
<g id="${p}-lap" opacity="0">${[[230, 250], [670, 240], [300, 330], [610, 330]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z" fill="#FFFFFF"/>`).join("")}</g>
${nhan(`${p}-n1`, 240, 600, "Răng thật: trắng lên", MAU.ngoc, { co: 28 })}
${nhan(`${p}-n2`, 660, 600, "Răng sứ: màu cũ", MAU.son, { co: 28 })}`,
      js: `
tl.fromTo("#${p}-nc", {opacity:0, scale:0.85, svgOrigin:"0 0"}, {opacity:1, scale:1, svgOrigin:"0 0", duration:0.6, ease:"expo.out"}, 0.05);
tl.set(".${p}-vang", {opacity:0.38}, 0);
tl.fromTo("#${p}-chi", {opacity:0}, {opacity:1, duration:0.3}, ${t0});
${hienNhan(`${p}-n0`, t0)}
tl.to(".${p}-trang", {opacity:0.72, duration:1.0, stagger:0.05, ease:"power1.inOut"}, ${t1});
tl.fromTo("#${p}-lap", {opacity:0, scale:0.4, svgOrigin:"450 290"}, {opacity:1, scale:1, svgOrigin:"450 290", duration:0.5, ease:"back.out(2)"}, ${r3(t1 + 0.6)});
tl.to("#${p}-lap", {opacity:0.3, duration:0.4, yoyo:true, repeat:5}, ${r3(t1 + 1.1)});
${hienNhan(`${p}-n1`, t1 + 0.9)}
${hienNhan(`${p}-n2`, t1 + 1.5)}`,
      sfx: [{ f: "pop", t: t0, v: 0.4 }, { f: "sparkle", t: t1 + 0.6, v: 0.45 }, { f: "pop", t: t1 + 1.5, v: 0.4 }],
    };
  },
});

// ================================================================ Nha khoa Asia — tổng quát / chữa tủy (g01–g03)
const TUY = "M-38 50 Q0 30 38 50 L36 120 Q34 150 34 170 L30 270 Q26 282 22 270 L16 160 Q0 150 -16 160 L-22 270 Q-26 282 -30 270 L-34 170 Q-34 150 -36 120 Z";
/** Răng hàm cắt dọc: men, ngà, buồng tủy + ống tủy. (x, y) = giữa mặt nhai. */
function rangCat(p, id, x, y, s) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="${ROOT}" fill="url(#${p}rt)" stroke="#BFA678" stroke-width="2"/>
  <path d="${CROWN}" fill="url(#${p}en)" stroke="#B5C7D6" stroke-width="2" filter="url(#${p}rb)"/>
  <path d="M-58 44 C-56 22 -30 10 -12 22 C0 14 12 14 22 22 C38 10 58 22 58 44 L56 116 C54 132 46 140 36 142 L-36 142 C-46 140 -54 132 -56 116 Z" fill="#F3E4C2" opacity="0.85"/>
  <path id="${id}-tuy" d="${TUY}" fill="#E8616B"/>
  <path d="M-52 40 C-50 20 -36 14 -24 22" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.95"/>
</g></g>`;
}
const SET = (x, y, s, mau) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -40 L-14 -4 L4 -4 L-8 40 L22 -12 L4 -12 L16 -40 Z" fill="${mau}"/>`;
const VIEN = (id, x, y, g) => `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) rotate(${g})"><rect x="-34" y="-15" width="68" height="30" rx="15" fill="#FFFFFF"/><path d="M0 -15 L19 -15 A15 15 0 0 1 19 15 L0 15 Z" fill="${MAU.son}"/></g></g>`;

Object.assign(HINH, {
  // g01 — cơn đau tủy: buồng tủy viêm đỏ nhịp đập, viên kháng sinh bị chặn ngoài "buồng tủy kín"
  rang_tuy(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const hook = c.kieu_tuy === "hook";
    const t1 = T(hook ? 0 : 1, hook ? 0.55 : 0.1), t2 = T(hook ? 1 : 2, 0.2);
    const vien = [[700, 120, -20], [760, 300, 15], [690, 470, -35]].map(([x, y, g], i) => VIEN(`${p}-v${i}`, x, y, g)).join("");
    return {
      svg: `
${rangCat(p, `${p}-r`, 330, 80, 1.65)}
<ellipse id="${p}-quang" cx="330" cy="260" rx="120" ry="160" fill="${MAU.son}" opacity="0" filter="url(#${p}mo)"/>
<g id="${p}-set" opacity="0">${SET(180, 150, 1.2, MAU.vang)}${SET(480, 140, 1.4, MAU.vang)}${SET(500, 330, 1, MAU.vang)}</g>
<path id="${p}-khien" d="M330 70 C230 70 210 140 222 230 C232 320 270 420 330 470 C390 420 428 320 438 230 C450 140 430 70 330 70 Z" fill="none" stroke="${MAU.troi}" stroke-width="6" stroke-dasharray="16 10" opacity="0"/>
${vien}
${nhan(`${p}-n0`, 330, 600, hook ? "Đau nhức cả đêm" : "Tủy viêm trong buồng tủy kín", MAU.son, { co: 30 })}
${nhan(`${p}-n1`, 690, 600, hook ? "Mua thuốc uống?" : "Thuốc khó tới nơi", MAU.vang, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-r", {opacity:0, y:40}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, 0.05);
tl.to("#${p}-r-tuy", {fill:"#FF3B4A", duration:0.35, yoyo:true, repeat:${Math.max(3, Math.floor(d / 0.7))}, ease:"sine.inOut"}, 0.4);
tl.fromTo("#${p}-quang", {opacity:0}, {opacity:0.35, duration:0.35, yoyo:true, repeat:${Math.max(3, Math.floor(d / 0.7))}, ease:"sine.inOut"}, 0.4);
tl.fromTo("#${p}-set", {opacity:0, scale:0.6, svgOrigin:"330 240"}, {opacity:1, scale:1, svgOrigin:"330 240", duration:0.3, ease:"back.out(2.4)"}, 0.5);
tl.to("#${p}-set", {opacity:0.4, duration:0.2, yoyo:true, repeat:${Math.max(3, Math.floor(d / 0.5))}}, 0.9);
${hienNhan(`${p}-n0`, T(0, 0.25))}
${hook ? "" : `tl.fromTo("#${p}-khien", {opacity:0, scale:1.15, svgOrigin:"330 270"}, {opacity:1, scale:1, svgOrigin:"330 270", duration:0.45, ease:"expo.out"}, ${r3(t1 + 0.6)});`}
tl.fromTo(["#${p}-v0","#${p}-v1","#${p}-v2"], {opacity:0, x:200}, {opacity:1, x:0, duration:0.5, stagger:0.15, ease:"power3.out"}, ${t1});
${hook ? `tl.to(["#${p}-v0","#${p}-v1","#${p}-v2"], {y:-10, duration:0.4, yoyo:true, repeat:5, stagger:0.1, ease:"sine.inOut"}, ${r3(t1 + 0.8)});`
  : `tl.to(["#${p}-v0","#${p}-v1","#${p}-v2"], {x:-150, duration:0.45, stagger:0.12, ease:"power2.in"}, ${r3(t1 + 1.2)});
tl.to(["#${p}-v0","#${p}-v1","#${p}-v2"], {x:-40, rotation:40, svgOrigin:"700 300", opacity:0.35, duration:0.5, stagger:0.12, ease:"power2.out"}, ${r3(t1 + 1.65)});`}
${hienNhan(`${p}-n1`, t2)}`,
      sfx: [{ f: "impact-bass-1", t: 0.45, v: 0.45 }, { f: "whoosh-short", t: t1, v: 0.35 }, ...(hook ? [] : [{ f: "click-soft", t: t1 + 1.65, v: 0.5 }]), { f: "pop", t: t2, v: 0.4 }],
    };
  },

  // g02 — răng đã chữa tủy, miếng trám lớn: vết nứt chạy qua múi, múi răng vỡ văng ra
  rang_vo(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tNut = T(0, 0.75), tVo = T(1, 0.05);
    return {
      svg: `
${rangCat(p, `${p}-r`, 450, 90, 1.6)}
<g transform="translate(450 90) scale(1.6)">
  <path d="M-30 18 C-20 6 14 6 24 20 L22 70 L-28 70 Z" fill="#CFD8E0" stroke="#8E9BA7" stroke-width="2"/>
  <g id="${p}-manh"><path d="M24 20 C40 -2 70 8 70 40 L68 96 L36 78 L22 70 Z" fill="url(#${p}en)" stroke="#B5C7D6" stroke-width="2"/></g>
  <path id="${p}-nut" d="M24 20 L30 46 L22 70 L36 78 L68 96" fill="none" stroke="#3A0E18" stroke-width="4" stroke-linecap="round" stroke-dasharray="140" stroke-dashoffset="140"/>
</g>
<g id="${p}-rac" opacity="0"><text x="720" y="170" text-anchor="middle" font-family="BVP" font-weight="900" font-size="96" fill="${MAU.son}" transform="rotate(-10 720 170)">RẮC!</text></g>
${nhan(`${p}-n0`, 300, 600, "Răng đã chữa tủy", MAU.mo, { co: 30 })}
${nhan(`${p}-n1`, 640, 600, "Vỡ mất một múi", MAU.son, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-r", {opacity:0, y:40}, {opacity:1, y:0, duration:0.5, ease:"expo.out"}, 0.05);
${hienNhan(`${p}-n0`, 0.4)}
tl.to("#${p}-nut", {strokeDashoffset:0, duration:0.35, ease:"power2.in"}, ${tNut});
tl.fromTo("#${p}-rac", {opacity:0, scale:2.2, svgOrigin:"720 150"}, {opacity:1, scale:1, svgOrigin:"720 150", duration:0.25, ease:"power4.in"}, ${r3(tNut + 0.3)});
tl.to("#${p}-manh", {x:90, y:-70, rotation:38, svgOrigin:"50 50", opacity:0, duration:0.7, ease:"power2.out"}, ${tVo});
tl.to("#${p}-r", {x:-6, duration:0.05, yoyo:true, repeat:5}, ${tVo});
${hienNhan(`${p}-n1`, tVo + 0.4)}`,
      sfx: [{ f: "impact-bass-1", t: tNut + 0.3, v: 0.6 }, { f: "whoosh-short", t: tVo, v: 0.4 }, { f: "pop", t: tVo + 0.4, v: 0.4 }],
    };
  },

  // g02 — nứt dọc xuống chân răng → không giữ được → nhổ, trồng lại bằng Implant
  nut_doc(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tNut = T(0, 0.35), tNho = T(1, 0.15), tImp = T(1, 0.55);
    const bone = "M40 300 L860 300 L860 610 Q860 640 830 640 L70 640 Q40 640 40 610 Z";
    return {
      svg: `
<path d="${bone}" fill="url(#${p}bn)"/><path d="${bone}" fill="url(#${p}xp)"/>
${rangHam(p, `${p}-a`, 160, 135, 0.95)}${rangHam(p, `${p}-b`, 740, 135, 0.95)}
<g id="${p}-rang">${rangHam(p, `${p}-r`, 450, 135, 0.95)}
<path id="${p}-nut" d="M452 150 L446 210 L456 270 L444 330 L452 420" fill="none" stroke="#3A0E18" stroke-width="6" stroke-linecap="round" stroke-dasharray="290" stroke-dashoffset="290"/></g>
<g id="${p}-moi" opacity="0">${truImplant(p, `${p}-tru`, 450, 304, 1)}${khopNoi(p, `${p}-kn`, 450, 304, 0.95)}${maoSu(p, `${p}-mao`, 450, 135, 0.95)}</g>
<path d="M40 268 L860 268 L860 300 L40 300 Z" fill="url(#${p}gm)" opacity="0.92"/>
<g id="${p}-x" opacity="0"><path d="M380 160 L520 300 M520 160 L380 300" stroke="${MAU.son}" stroke-width="22" stroke-linecap="round"/></g>
${nhan(`${p}-n0`, 450, 612, "Nứt dọc tới chân răng", MAU.son, { co: 30 })}
${nhan(`${p}-n1`, 450, 60, "Nhổ → trồng lại bằng Implant", MAU.ngoc, { co: 30 })}`,
      js: `
tl.fromTo(["#${p}-a","#${p}-b","#${p}-rang"], {opacity:0}, {opacity:1, duration:0.45, stagger:0.06}, 0.05);
tl.to("#${p}-nut", {strokeDashoffset:0, duration:0.9, ease:"power1.in"}, ${tNut});
${hienNhan(`${p}-n0`, tNut + 0.7)}
tl.fromTo("#${p}-x", {opacity:0, scale:1.8, svgOrigin:"450 230"}, {opacity:1, scale:1, svgOrigin:"450 230", duration:0.3, ease:"power4.in"}, ${tNho});
tl.to(["#${p}-rang","#${p}-x"], {y:-360, opacity:0, duration:0.6, ease:"power3.in"}, ${r3(tNho + 0.6)});
tl.to("#${p}-n0", {opacity:0, duration:0.25}, ${r3(tNho + 0.6)});
tl.fromTo("#${p}-moi", {opacity:0, y:-260}, {opacity:1, y:0, duration:0.6, ease:"bounce.out"}, ${tImp});
${hienNhan(`${p}-n1`, tImp + 0.5)}`,
      sfx: [{ f: "riser", t: tNut, v: 0.3 }, { f: "impact-bass-1", t: tNho + 0.25, v: 0.5 }, { f: "whoosh-short", t: tNho + 0.6, v: 0.4 }, { f: "pop", t: tImp + 0.5, v: 0.45 }],
    };
  },
});

// ================================================================ Bộ biểu tượng (đợt 2) — khung 100 × 100, nét trắng trên nền tròn màu
const NET = `fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const RANG_IC = "M28 30 C28 18 40 14 50 20 C60 14 72 18 72 30 C72 44 68 52 66 66 C64 80 60 86 56 86 C52 86 52 70 50 70 C48 70 48 86 44 86 C40 86 36 80 34 66 C32 52 28 44 28 30 Z";
export const ICON = {
  xquang: `<rect x="18" y="22" width="64" height="56" rx="8" ${NET}/><path d="M38 36 C38 30 50 28 50 34 C50 28 62 30 62 36 C62 48 58 56 55 64 C54 68 52 62 50 58 C48 62 46 68 45 64 C42 56 38 48 38 36 Z" fill="#FFFFFF" opacity="0.9"/>`,
  tuy: `<path d="${RANG_IC}" ${NET}/><path d="M44 34 Q50 30 56 34 L54 56 L52 76 M46 56 L48 76" stroke="#FF8A8A" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  nho: `<path d="${RANG_IC}" ${NET} transform="translate(0 6)"/><path d="M50 6 L50 20 M42 13 L50 5 L58 13" ${NET}/>`,
  sot: `<rect x="42" y="12" width="16" height="52" rx="8" ${NET}/><circle cx="50" cy="74" r="13" fill="#FFFFFF"/><path d="M50 40 L50 70" stroke="#FF6B5B" stroke-width="7" stroke-linecap="round"/><path d="M66 24 L74 24 M66 36 L72 36" ${NET}/>`,
  sung: `<path d="M30 28 C30 16 70 16 70 28 L74 52 C80 60 78 80 60 84 L40 84 C26 82 24 66 28 56 Z" ${NET}/><circle cx="42" cy="42" r="3" fill="#FFFFFF"/><circle cx="58" cy="42" r="3" fill="#FFFFFF"/><ellipse cx="68" cy="64" rx="12" ry="10" fill="#FF8A8A" opacity="0.9"/><path d="M42 66 Q48 62 54 66" ${NET}/>`,
  tho: `<path d="M50 14 L50 44" ${NET}/><path d="M50 44 C40 44 22 52 22 72 C22 82 30 86 38 84 C46 82 48 72 48 60 M50 44 C60 44 78 52 78 72 C78 82 70 86 62 84 C54 82 52 72 52 60" ${NET}/><path d="M80 20 L90 14 M80 30 L92 30" stroke="#FF8A8A" stroke-width="6" stroke-linecap="round"/>`,
  sau_vo: `<path d="M28 30 C28 18 40 14 50 20 L44 32 L54 40 L46 52 C46 48 36 46 34 60 C32 52 28 44 28 30 Z M54 22 C62 14 72 18 72 30 C72 44 68 52 66 66 C64 80 60 86 56 86 C52 86 52 70 50 70 C48 70 48 86 44 86 C40 86 36 80 34 66" ${NET}/><circle cx="60" cy="40" r="6" fill="#3A0E18" stroke="#FFFFFF" stroke-width="3"/>`,
  nut_chan: `<path d="${RANG_IC}" ${NET}/><path d="M52 18 L46 34 L54 46 L46 60 L52 76" stroke="#FF8A8A" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  lung_lay: `<g transform="rotate(-10 50 60)"><path d="${RANG_IC}" ${NET} transform="translate(0 -6)"/></g><path d="M14 80 Q50 66 86 80" ${NET}/><path d="M16 40 L22 46 M84 40 L78 46 M12 56 L20 58 M88 56 L80 58" ${NET}/>`,
  implant: `<path d="M34 16 C34 8 66 8 66 16 L64 30 L36 30 Z" fill="#FFFFFF"/><path d="M44 30 L56 30 L56 40 L44 40 Z" ${NET}/><path d="M40 42 L60 42 L56 84 Q50 92 44 84 Z" ${NET}/><path d="M40 54 L60 58 M41 66 L59 70 M43 78 L57 82" ${NET}/>`,
  cau: `<path d="M12 40 C12 30 30 30 30 40 L30 70 L12 70 Z M41 38 C41 30 59 30 59 38 L59 62 L41 62 Z M70 40 C70 30 88 30 88 40 L88 70 L70 70 Z" ${NET}/><path d="M30 46 L41 46 M59 46 L70 46" ${NET}/><path d="M14 78 L28 78 M72 78 L86 78" ${NET}/>`,
  ham: `<path d="M14 64 C14 30 86 30 86 64 L76 64 C76 42 24 42 24 64 Z" ${NET}/><path d="M28 50 L28 42 M38 44 L38 36 M50 42 L50 34 M62 44 L62 36 M72 50 L72 42" ${NET}/><path d="M10 72 Q50 82 90 72" stroke="#FF8A8A" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  rang_cua: `<path d="M34 18 L66 18 C70 40 70 64 64 82 Q58 88 50 88 Q42 88 36 82 C30 64 30 40 34 18 Z" ${NET}/><path d="M42 40 L58 40" ${NET}/>`,
  rang_ham: `<path d="${RANG_IC}" ${NET}/><path d="M36 34 Q50 42 64 34" ${NET}/>`,
  nghien: `<path d="M18 36 L82 36 M18 64 L82 64" ${NET}/><path d="M24 36 L24 26 M38 36 L38 26 M52 36 L52 26 M66 36 L66 26 M76 36 L76 26 M24 64 L24 74 M38 64 L38 74 M52 64 L52 74 M66 64 L66 74 M76 64 L76 74" ${NET}/><path d="M30 50 L40 44 L50 56 L60 44 L70 56" stroke="#FFC24D" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// ---------------------------------------------------------------- nhân vật răng 3D (đợt 2)
const THAN_RANG = "M-120 -40 C-120 -128 -40 -150 0 -104 C40 -150 120 -128 120 -40 C120 30 104 70 92 140 C80 214 64 250 40 250 C14 250 18 160 0 160 C-18 160 -14 250 -40 250 C-64 250 -80 214 -92 140 C-104 70 -120 30 -120 -40 Z";
/** Nhân vật răng bóng 3D có mặt. mat: "dau" (nhắm tịt, mếu) · "lo" (mắt tròn, miệng méo) · "buon" · "vui". (x, y) = tâm thân. */
export function rangNhanVat(p, id, x, y, s, mat = "vui") {
  const mt = {
    dau: `<path d="M-62 -14 L-34 -2 L-62 10 M62 -14 L34 -2 L62 10" stroke="#3A2A2A" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-30 52 Q-15 38 0 50 Q15 38 30 52" stroke="#3A2A2A" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    lo: `<circle cx="-46" cy="-4" r="16" fill="#FFFFFF" stroke="#3A2A2A" stroke-width="5"/><circle cx="46" cy="-4" r="16" fill="#FFFFFF" stroke="#3A2A2A" stroke-width="5"/><circle cx="-42" cy="0" r="7" fill="#3A2A2A"/><circle cx="42" cy="0" r="7" fill="#3A2A2A"/><path d="M-70 -34 L-30 -26 M70 -34 L30 -26" stroke="#3A2A2A" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="52" rx="16" ry="12" fill="#3A2A2A"/>`,
    buon: `<circle cx="-44" cy="-2" r="9" fill="#3A2A2A"/><circle cx="44" cy="-2" r="9" fill="#3A2A2A"/><path d="M-66 -30 L-28 -20 M66 -30 L28 -20" stroke="#3A2A2A" stroke-width="7" stroke-linecap="round"/><path d="M-26 56 Q0 36 26 56" stroke="#3A2A2A" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    vui: `<path d="M-60 0 Q-46 -18 -32 0 M32 0 Q46 -18 60 0" stroke="#3A2A2A" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30 34 Q0 70 30 34 Z" fill="#3A2A2A"/><path d="M-16 50 Q0 60 16 50" stroke="#F49AAA" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  }[mat];
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="282" rx="110" ry="18" fill="#000" opacity="0.28" filter="url(#${p}mo)"/>
  <g id="${id}-than"><path d="${THAN_RANG}" fill="url(#${p}en)" stroke="#CFE0EA" stroke-width="4"/>
  <path d="M-92 -50 C-92 -98 -54 -116 -24 -96" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" fill="none" opacity="0.95"/>
  <path d="M96 -30 C100 20 92 70 84 110" stroke="#B8CCDA" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.6"/>
  <ellipse cx="-70" cy="28" rx="18" ry="11" fill="#F49AAA" opacity="0.55"/><ellipse cx="70" cy="28" rx="18" ry="11" fill="#F49AAA" opacity="0.55"/>
  ${mt}</g>
</g></g>`;
}

Object.assign(HINH, {
  // g01 hook — nhân vật răng đau nhức, tia sét quay quanh, vỉ thuốc rơi xuống
  rang_nhan_dau(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const t1 = T(1, 0.05);
    const vien = [[200, 60, -25], [700, 40, 20], [150, 300, 35], [760, 260, -15]].map(([x, y, g], i) => VIEN(`${p}-v${i}`, x, y, g)).join("");
    return {
      svg: `
<circle cx="450" cy="300" r="240" fill="url(#${p}ngocSang)" opacity="0.5"/>
<circle id="${p}-do" cx="450" cy="300" r="200" fill="${MAU.son}" opacity="0" filter="url(#${p}mo)"/>
${rangNhanVat(p, `${p}-nv`, 450, 250, 1.0, "dau")}
<g id="${p}-set">${SET(250, 170, 1.5, MAU.vang)}${SET(660, 150, 1.7, MAU.vang)}${SET(690, 380, 1.2, MAU.vang)}${SET(220, 400, 1.1, MAU.vang)}</g>
<path id="${p}-mo-hoi" d="M600 60 C590 84 584 96 600 104 C616 96 610 84 600 60 Z" fill="${MAU.troi}" opacity="0"/>
${vien}
${nhan(`${p}-n0`, 450, 610, "Uống kháng sinh cho đỡ?", MAU.vang, { co: 32 })}`,
      js: `
tl.fromTo("#${p}-nv", {opacity:0, y:120, scaleY:0.7, svgOrigin:"450 530"}, {opacity:1, y:0, scaleY:1, svgOrigin:"450 530", duration:0.6, ease:"elastic.out(1, 0.5)"}, 0.05);
tl.to("#${p}-nv-than", {x:-8, rotation:-3, svgOrigin:"0 250", duration:0.07, yoyo:true, repeat:${Math.max(6, Math.floor(d / 0.14))}, ease:"none"}, 0.7);
tl.fromTo("#${p}-do", {opacity:0}, {opacity:0.4, duration:0.3, yoyo:true, repeat:${Math.max(3, Math.floor(d / 0.6))}, ease:"sine.inOut"}, 0.6);
tl.fromTo("#${p}-set", {opacity:0, rotation:-20, svgOrigin:"450 280"}, {opacity:1, rotation:0, svgOrigin:"450 280", duration:0.4, ease:"back.out(2)"}, 0.5);
tl.to("#${p}-set", {rotation:360, svgOrigin:"450 280", duration:${r3(d)}, ease:"none"}, 0.9);
tl.fromTo("#${p}-mo-hoi", {opacity:0, y:-10}, {opacity:1, y:30, duration:0.9, repeat:${Math.max(1, Math.floor(d / 1.2))}, ease:"power1.in"}, 0.8);
tl.fromTo(["#${p}-v0","#${p}-v1","#${p}-v2","#${p}-v3"], {opacity:0, y:-260}, {opacity:1, y:0, duration:0.7, stagger:0.12, ease:"bounce.out"}, ${T(0, 0.55)});
${hienNhan(`${p}-n0`, T(0, 0.8))}
tl.to("#${p}-nv-than", {scaleY:0.9, svgOrigin:"0 250", duration:0.18, yoyo:true, repeat:3}, ${t1});`,
      sfx: [{ f: "impact-bass-1", t: 0.1, v: 0.5 }, { f: "whoosh-short", t: T(0, 0.55), v: 0.4 }, { f: "pop", t: T(0, 0.8), v: 0.45 }, { f: "key-press", t: t1, v: 0.4 }],
    };
  },

  // g03 hook — nhân vật răng lung lay trong nướu, bóng thoại "Phải nhổ!"
  rang_lac(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tBong = T(0, 0.55), t1 = T(1, 0.1);
    return {
      svg: `
<path d="M40 470 Q450 400 860 470 L860 640 L40 640 Z" fill="url(#${p}gm)"/>
<path d="M40 500 Q450 440 860 500" stroke="#FDC0CA" stroke-width="6" fill="none" opacity="0.6"/>
${rangNhanVat(p, `${p}-nv`, 450, 250, 0.95, "lo")}
<path d="M40 520 Q450 470 860 520 L860 640 L40 640 Z" fill="url(#${p}gm)" opacity="0.96"/>
<g id="${p}-rung">${[[250, 300], [650, 300], [270, 380], [630, 380]].map(([x, y], i) => `<path d="M${x} ${y} l${i % 2 ? 22 : -22} -10" stroke="${MAU.chu}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`).join("")}</g>
<g id="${p}-bong" opacity="0"><path d="M520 30 L840 30 Q870 30 870 60 L870 130 Q870 160 840 160 L640 160 L600 200 L606 160 L550 160 Q520 160 520 130 L520 60 Q520 30 550 30 Z" fill="#FFFFFF"/>
<text x="695" y="114" text-anchor="middle" font-family="BVP" font-weight="900" font-size="56" fill="${MAU.son}">Phải nhổ!</text></g>
<g id="${p}-hoi" opacity="0">${[0, 1, 2].map((i) => `<text x="${130 + i * 70}" y="${150 - i * 30}" font-family="BVP" font-weight="900" font-size="${70 + i * 14}" fill="${MAU.vang}">?</text>`).join("")}</g>`,
      js: `
tl.fromTo("#${p}-nv", {opacity:0, y:-200}, {opacity:1, y:0, duration:0.7, ease:"bounce.out"}, 0.05);
tl.to("#${p}-nv", {rotation:6, svgOrigin:"450 520", duration:0.16, yoyo:true, repeat:${Math.max(6, Math.floor(d / 0.32))}, ease:"sine.inOut"}, 0.8);
tl.fromTo("#${p}-rung", {opacity:0}, {opacity:1, duration:0.16, yoyo:true, repeat:${Math.max(6, Math.floor(d / 0.32))}}, 0.8);
tl.fromTo("#${p}-bong", {opacity:0, scale:0.3, svgOrigin:"600 200"}, {opacity:1, scale:1, svgOrigin:"600 200", duration:0.45, ease:"back.out(2.2)"}, ${tBong});
tl.fromTo("#${p}-hoi", {opacity:0, y:30}, {opacity:1, y:0, duration:0.4, ease:"back.out(2)"}, ${t1});
tl.to("#${p}-hoi", {y:-12, duration:0.45, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(t1 + 0.4)});`,
      sfx: [{ f: "whoosh-short", t: 0.05, v: 0.35 }, { f: "impact-bass-1", t: tBong, v: 0.5 }, { f: "pop", t: t1, v: 0.45 }],
    };
  },

  // g03 — thanh thời gian: sớm (giữ răng) → muộn (phải nhổ); nhân vật răng đi dọc thanh, đổi nét mặt
  dong_thoi_gian(c, { p, d, moc }) {
    const T = moc_(moc, d);
    const tDi = T(0, 0.15), tToi = T(0, 0.95), tVe = T(1, 0.05);
    const ic = ["rang_ham", "tuy", "lung_lay"];
    return {
      svg: `
<defs><linearGradient id="${p}-tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${MAU.ngoc}"/><stop offset="0.55" stop-color="${MAU.vang}"/><stop offset="1" stop-color="${MAU.son}"/></linearGradient></defs>
<rect x="80" y="430" width="740" height="28" rx="14" fill="${MAU.mat2}"/>
<rect id="${p}-thanh" x="80" y="430" width="740" height="28" rx="14" fill="url(#${p}-tg)"/>
<text x="110" y="510" font-family="BVP" font-weight="800" font-size="34" fill="${MAU.ngoc}">SỚM</text>
<text x="790" y="510" text-anchor="end" font-family="BVP" font-weight="800" font-size="34" fill="${MAU.son}">MUỘN</text>
<g id="${p}-a">${rangNhanVat(p, `${p}-nv1`, 0, 0, 0.62, "vui")}</g>
<g id="${p}-b" opacity="0">${rangNhanVat(p, `${p}-nv2`, 0, 0, 0.62, "buon")}</g>
${ic.map((k, i) => `<g class="${p}-ic" opacity="0"><circle cx="${150 + i * 120}" cy="580" r="46" fill="${MAU.ngoc}"/><g transform="translate(${150 + i * 120 - 30} 550) scale(0.6)">${ICON[k]}</g></g>`).join("")}
${nhan(`${p}-n0`, 680, 580, "Giữ được răng thật", MAU.ngoc, { co: 30 })}`,
      js: `
tl.fromTo("#${p}-thanh", {scaleX:0, svgOrigin:"80 444"}, {scaleX:1, svgOrigin:"80 444", duration:0.8, ease:"power2.out"}, 0.1);
tl.set(["#${p}-a","#${p}-b"], {x:190, y:250}, 0);
tl.fromTo("#${p}-a", {opacity:0, scale:0.4, svgOrigin:"190 420"}, {opacity:1, scale:1, svgOrigin:"190 420", duration:0.5, ease:"back.out(2)"}, 0.3);
tl.to(["#${p}-a","#${p}-b"], {x:700, duration:${r3(Math.max(0.8, tToi - tDi))}, ease:"power1.in"}, ${tDi});
tl.to("#${p}-a", {opacity:0, duration:0.25}, ${r3(tToi - 0.5)});
tl.to("#${p}-b", {opacity:1, duration:0.25}, ${r3(tToi - 0.5)});
tl.to(["#${p}-a","#${p}-b"], {x:190, duration:0.6, ease:"back.out(1.6)"}, ${tVe});
tl.to("#${p}-b", {opacity:0, duration:0.2}, ${tVe});
tl.to("#${p}-a", {opacity:1, duration:0.2}, ${tVe});
tl.to("#${p}-a", {y:232, duration:0.3, yoyo:true, repeat:5, ease:"sine.inOut"}, ${r3(tVe + 0.7)});
tl.fromTo(".${p}-ic", {opacity:0, y:30}, {opacity:1, y:0, duration:0.35, stagger:0.15, ease:"back.out(2)"}, ${r3(tVe + 0.5)});
${hienNhan(`${p}-n0`, T(1, 0.6))}`,
      sfx: [{ f: "riser", t: tDi, v: 0.25 }, { f: "whoosh", t: tVe, v: 0.35 }, { f: "pop", t: tVe + 0.5, v: 0.4 }, { f: "sparkle", t: T(1, 0.6), v: 0.4 }],
    };
  },
});
