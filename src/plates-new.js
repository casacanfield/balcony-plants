// ---- Textbook-style plates: ink outlines with a light color wash, drawn from tokens so both themes work ----
const INK = "var(--ink)";
const f1 = n => n.toFixed(1);
function rot(x, y, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return [cx + (x * c - y * s), cy + (x * s + y * c)]; }
// serrated broad leaf from base (bx,by) pointing at angle deg
function leaf(bx, by, len, w, deg, teeth = 9) {
  const a = deg * Math.PI / 180, L = [], R = [], n = teeth * 2;
  for (let i = 0; i <= n; i++) {
    const t = i / n, half = w * Math.pow(Math.sin(Math.PI * Math.min(t * 1.08, 1)), .85) * (1 - .25 * t);
    const tooth = t > .18 && t < .96 && i % 2 ? 1.9 : 0;
    L.push(rot(t * len, -(half + tooth), bx, by, a)); R.push(rot(t * len, half + tooth, bx, by, a));
  }
  const pts = L.concat(R.reverse()).map(p => p.map(f1).join(" "));
  const tip = rot(len, 0, bx, by, a);
  let veins = "";
  [.3, .5, .7].forEach(t => {
    [-1, 1].forEach(sd => {
      const p0 = rot(t * len, 0, bx, by, a), p1 = rot(t * len + w * .55, sd * w * .62 * (1 - .25 * t), bx, by, a);
      veins += `<path d="M${f1(p0[0])} ${f1(p0[1])} L${f1(p1[0])} ${f1(p1[1])}" stroke="${INK}" stroke-width=".5" opacity=".6"/>`;
    });
  });
  return `<path d="M${pts.join(" L")} Z" fill="var(--leaf)" fill-opacity=".28" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M${f1(bx)} ${f1(by)} L${f1(tip[0])} ${f1(tip[1])}" stroke="${INK}" stroke-width=".7"/>${veins}`;
}
function floret(x, y, r, deg, fill, op = .45) {
  let s = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg})">`;
  for (let k = 0; k < 4; k++) s += `<ellipse cx="0" cy="${f1(-r * .55)}" rx="${f1(r * .42)}" ry="${f1(r * .55)}" transform="rotate(${k * 90})" fill="${fill}" fill-opacity="${op}" stroke="${INK}" stroke-width=".45"/>`;
  return s + `<circle r="${f1(r * .14)}" fill="${INK}"/></g>`;
}
function head(cx, cy, r, fillA, fillB, n = 44, op = .45) {
  let s = "";
  for (let i = n - 1; i >= 0; i--) {
    const a = i * 2.39996, d = r * Math.sqrt((i + .5) / n);
    s += floret(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .78, r * .21, (i * 31) % 90, i % 3 ? fillA : fillB, op);
  }
  return s;
}
function bud(x, y, deg, size = 1) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg}) scale(${size})"><path d="M0 0 C-4 -3 -4 -10 0 -14 C4 -10 4 -3 0 0 Z" fill="var(--leaf)" fill-opacity=".55" stroke="${INK}" stroke-width=".8"/><path d="M0 -1 L0 -11" stroke="${INK}" stroke-width=".4"/></g>`;
}
function stem(d, w = 2.4, color = "var(--leaf)") {
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 1.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${INK}" stroke-width=".5" stroke-linecap="round" transform="translate(1.2 .6)" opacity=".5"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}
// leader line + label (lines = array of strings)
let BARE = false, WASH = null;
function note(x1, y1, x2, y2, lines, anchor = "start") {
  if (BARE) return "";
  const dx = anchor === "start" ? 3 : -3;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width=".55" fill="none"/><circle cx="${x1}" cy="${y1}" r="1.5" fill="${INK}"/>
    <text x="${x2 + dx}" y="${y2 - (lines.length - 1) * 5.2 + 3}" text-anchor="${anchor}" class="pl">${lines.map((l, i) => `<tspan x="${x2 + dx}" dy="${i ? 10.4 : 0}">${l}</tspan>`).join("")}</text>`;
}
function snip(x1, x2, y, lines, lx) {
  return `<path d="M${x1} ${y} L${x2} ${y}" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>
    <g transform="translate(${x2 + 4} ${y - 7}) scale(.6)" fill="none" stroke="var(--foe)" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="19" r="4"/><circle cx="17" cy="19" r="4"/><path d="M7.5 16 L19 1 M14.5 16 L3 1"/></g>
    <text x="${lx}" y="${y + 4}" class="pl snipl">${lines.map((l, i) => `<tspan x="${lx}" dy="${i ? 10.4 : 0}">${l}</tspan>`).join("")}</text>`;
}
function plate(vb, body, title, wash) {
  if (BARE) body = body.replace(/<text[\s\S]*?<\/text>/g, "");
  if (WASH) wash = WASH;
  const [x, y, w, h] = vb.split(" ").map(Number), cx = x + w / 2, cy = y + h * .48;
  const blob = wash ? `<path d="M${cx - w * .36} ${cy} C${cx - w * .4} ${cy - h * .38} ${cx + w * .12} ${cy - h * .46} ${cx + w * .32} ${cy - h * .26} C${cx + w * .48} ${cy - h * .06} ${cx + w * .38} ${cy + h * .38} ${cx + w * .04} ${cy + h * .4} C${cx - w * .26} ${cy + h * .42} ${cx - w * .34} ${cy + h * .2} ${cx - w * .36} ${cy} Z" fill="${wash}" opacity=".55"/>` : "";
  return `<svg viewBox="${vb}" role="img" aria-label="${title}"><defs><filter id="sketch" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter></defs><style>.pl{font:600 9.5px var(--f-body);fill:var(--ink)}.pl.snipl{fill:var(--foe);font-weight:800}.pt{font:italic 500 9px var(--f-body);fill:var(--muted)}</style>${blob}<g filter="url(#sketch)">${body.replace(/<text[\s\S]*?<\/text>/g, "")}</g>${(body.match(/<text[\s\S]*?<\/text>/g) || []).join("")}</svg>`;
}

// heather: curved wiry stems; scale leaves on the lower part, little bells hanging all along the upper part
let _seed = 11;
const rnd = () => ((_seed = (_seed * 16807) % 2147483647) / 2147483647);
function qpt(p0, c, p1, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}
function qtan(p0, c, p1, t) {
  const dx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), dy = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
  return Math.atan2(dy, dx);
}
function heatherStem(p0, p1, bend, fl, op, opt = {}) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  const c = [mx + Math.cos(a + Math.PI / 2) * bend, my + Math.sin(a + Math.PI / 2) * bend];
  const d = `M${f1(p0[0])} ${f1(p0[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}`;
  let s = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="var(--soil)" stroke-width="1.3" stroke-linecap="round"/>`;
  const leafFrom = opt.leafFrom ?? .14, flowerFrom = opt.flowerFrom ?? .55;
  // scale leaves
  if (opt.leaves !== false) for (let t = leafFrom, i = 0; t < (fl ? flowerFrom : .97); t += .036, i++) {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t), sd = i % 2 ? 1 : -1, L = 4 + rnd() * 1.6;
    const lx = x + Math.cos(ta + sd * .45) * L, ly = y + Math.sin(ta + sd * .45) * L;
    s += `<path d="M${f1(x)} ${f1(y)} L${f1(lx)} ${f1(ly)}" stroke="${INK}" stroke-width="2.7" stroke-linecap="round"/><path d="M${f1(x)} ${f1(y)} L${f1(lx)} ${f1(ly)}" stroke="var(--leaf)" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  // bells, each on a tiny stalk off the stem
  if (fl) for (let t = flowerFrom, i = 0; t < .97; t += (opt.step ?? .034), i++) {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t), sd = i % 2 ? 1 : -1;
    const ang = ta + sd * 1.15, L = 3.2 + rnd();
    const bx = x + Math.cos(ang) * L, by = y + Math.sin(ang) * L, r = 2.9 + rnd() * .8 - t * .6;
    const deg = ang * 180 / Math.PI + 90;
    s += `<path d="M${f1(x)} ${f1(y)} L${f1(bx)} ${f1(by)}" stroke="${INK}" stroke-width=".7"/>
      <ellipse cx="${f1(bx + Math.cos(ang) * r * .8)}" cy="${f1(by + Math.sin(ang) * r * .8)}" rx="${f1(r)}" ry="${f1(r * 1.3)}" transform="rotate(${f1(deg)} ${f1(bx + Math.cos(ang) * r * .8)} ${f1(by + Math.sin(ang) * r * .8)})" fill="${fl}" fill-opacity="${op}" stroke="${INK}" stroke-width=".6"/>`;
  }
  return s;
}
function heatherBush(fl, op) {
  _seed = 11;
  const base = [150, 254];
  const mains = [
    [[150, 92], 10], [[124, 104], -14], [[178, 100], 16], [[100, 128], -20], [[200, 124], 22],
    [[84, 162], -18], [[218, 158], 20], [[138, 96], 6], [[164, 98], -8],
  ];
  let s = "";
  mains.forEach(([tip, bend], i) => {
    const p0 = [base[0] + (i % 3 - 1) * 2, base[1]];
    s += heatherStem(p0, tip, bend, fl[i % fl.length], op);
    if (i < 7) { // a side twig off each main stem
      const mx = (p0[0] + tip[0]) / 2, my = (p0[1] + tip[1]) / 2, a = Math.atan2(tip[1] - p0[1], tip[0] - p0[0]);
      const c = [mx + Math.cos(a + Math.PI / 2) * bend, my + Math.sin(a + Math.PI / 2) * bend];
      const start = qpt(p0, c, tip, .45), dir = (tip[0] < 150 ? -1 : 1) * (i === 0 ? -1 : 1);
      const twigTip = [start[0] + dir * 22, start[1] - 40];
      s += heatherStem(start, twigTip, dir * 5, fl[(i + 1) % fl.length], op, { leafFrom: .1, flowerFrom: .45 });
    }
  });
  return s;
}

// urn plant: arching strap leaves with silver bands, forming a cup
function strap(p0, deg, len, w, curl, fill = "var(--muted)", op = .3, bands = true) {
  const a = deg * Math.PI / 180;
  const p1 = [p0[0] + Math.cos(a) * len, p0[1] + Math.sin(a) * len];
  const side = Math.cos(a) >= 0 ? 1 : -1;
  const c = [p0[0] + Math.cos(a) * len * .55 + side * curl * .2, p0[1] + Math.sin(a) * len * .55 - curl];
  const L = [], R = [], n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n, pt = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t);
    const half = w * Math.sqrt(Math.max(0, 1 - Math.pow(t, 3.2))) * (.8 + .2 * Math.sin(Math.PI * t));
    L.push([pt[0] + Math.cos(ta - Math.PI / 2) * half, pt[1] + Math.sin(ta - Math.PI / 2) * half]);
    R.push([pt[0] + Math.cos(ta + Math.PI / 2) * half, pt[1] + Math.sin(ta + Math.PI / 2) * half]);
  }
  const pts = L.concat(R.reverse()).map(q => q.map(f1).join(" "));
  let s = `<path d="M${pts.join(" L")} Z" fill="${fill}" fill-opacity="${op}" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>`;
  if (bands) for (let t = .1; t < .9; t += .08) {
    const l = L[Math.round(t * n)], r = R[n - Math.round(t * n)];
    s += `<path d="M${f1(l[0])} ${f1(l[1])} L${f1(r[0])} ${f1(r[1])}" stroke="#ffffff" stroke-width="1.8" opacity=".5"/>`;
  }
  return s;
}
function rosette(cx, cy, sc, fill, op, browned = 0, bands = true) {
  const leaves = [[-104, 96, 9, 8], [-76, 96, 9, 8], [-128, 94, 10, 22], [-52, 94, 10, 22], [-150, 90, 10, 38], [-30, 90, 10, 38], [-172, 80, 9, 48], [-8, 80, 9, 48]];
  return leaves.map(([deg, len, w, curl], i) => strap([cx, cy], deg, len * sc, w * sc, curl * sc, i < browned ? "var(--soil)" : fill, i < browned ? .45 : op, bands)).join("") +
    `<path d="M${cx - 22 * sc} ${cy + 2} Q${cx} ${cy + 12 * sc} ${cx + 22 * sc} ${cy + 2}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
}
function brHead(cx, cy, fill) {
  let s = stem(`M${cx} ${cy + 96} C${cx - 2} ${cy + 70} ${cx + 2} ${cy + 40} ${cx} ${cy + 14}`, 3, "var(--feed)");
  const rows = [[0, 1], [8, 3], [16, 4], [24, 5], [32, 5], [40, 4], [48, 3]];
  rows.forEach(([dy, k]) => {
    for (let j = 0; j < k; j++) {
      const x = cx + (j - (k - 1) / 2) * 9, y = cy - 30 + dy;
      s += `<path d="M${x - 5} ${y + 7} L${x} ${y - 7} L${x + 5} ${y + 7} Z" fill="${fill}" fill-opacity=".7" stroke="${INK}" stroke-width=".7" stroke-linejoin="round"/>`;
      if ((j + dy / 8) % 3 === 1) s += `<circle cx="${x}" cy="${y + 1}" r="1.8" fill="var(--feed)" stroke="${INK}" stroke-width=".4"/>`;
    }
  });
  return s;
}

// inch plant: trailing stems, pointed leaves with two silver stripes, three-petal flowers
function zebLeaf(bx, by, len, w, deg) {
  const a = deg * Math.PI / 180, n = 14, L = [], R = [], S1 = [], S2 = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, half = w * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), .75) * (1 - .15 * t);
    L.push(rot(t * len, -half, bx, by, a)); R.push(rot(t * len, half, bx, by, a));
    if (t > .12 && t < .85) { S1.push(rot(t * len, -half * .55, bx, by, a)); S2.push(rot(t * len, half * .55, bx, by, a)); }
  }
  const pts = L.concat(R.slice().reverse()).map(q => q.map(f1).join(" "));
  const line = q => "M" + q.map(z => z.map(f1).join(" ")).join(" L");
  const tip = rot(len, 0, bx, by, a);
  return `<path d="M${pts.join(" L")} Z" fill="var(--feed)" fill-opacity=".8" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="${line(S1)}" fill="none" stroke="#ffffff" stroke-width="${f1(w * .5)}" stroke-linecap="round" opacity=".75"/>
    <path d="${line(S2)}" fill="none" stroke="#ffffff" stroke-width="${f1(w * .5)}" stroke-linecap="round" opacity=".75"/>
    <path d="M${f1(bx)} ${f1(by)} L${f1(tip[0])} ${f1(tip[1])}" stroke="${INK}" stroke-width=".6" opacity=".7"/>`;
}
function triFlower(x, y, r) {
  let s = "";
  for (let k = 0; k < 3; k++) s += `<ellipse cx="0" cy="${f1(-r * .6)}" rx="${f1(r * .55)}" ry="${f1(r * .7)}" transform="translate(${f1(x)} ${f1(y)}) rotate(${k * 120 + 10})" fill="var(--pink)" fill-opacity=".8" stroke="${INK}" stroke-width=".6"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .22)}" fill="#ffffff" stroke="${INK}" stroke-width=".4"/>`;
}
function trail(p0, p1, bend, flowers, opt = {}) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  const c = [mx + Math.cos(a + Math.PI / 2) * bend, my + Math.sin(a + Math.PI / 2) * bend];
  let s = stem(`M${f1(p0[0])} ${f1(p0[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}`, 2, "var(--feed)");
  const ts = opt.ts || [.18, .36, .54, .72, .9];
  ts.forEach((t, i) => {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t) * 180 / Math.PI, sd = i % 2 ? 1 : -1;
    s += zebLeaf(x, y, 26 + t * 10, 7 + t * 2, ta + sd * 52);
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${INK}"/>`;
  });
  if (flowers) { const ta = qtan(p0, c, p1, 1) * 180 / Math.PI; s += zebLeaf(p1[0], p1[1], 18, 6, ta - 40) + zebLeaf(p1[0], p1[1], 18, 6, ta + 40) + triFlower(p1[0] + 2, p1[1] - 4, 8); }
  return s;
}
function inchClump(fl) {
  return trail([150, 70], [64, 220], -30, fl) + trail([150, 70], [236, 222], 30, fl) +
    trail([150, 70], [110, 250], -12, false) + trail([150, 70], [196, 252], 14, fl, { ts: [.2, .4, .6, .8] }) +
    trail([150, 70], [96, 120], -14, false, { ts: [.4, .8] }) + trail([150, 70], [210, 112], 16, fl, { ts: [.4, .8] });
}

// spider plant: arching grassy leaves with a cream center stripe, runners with star flowers and babies
function grass(p0, deg, len, w, droop) {
  const a = deg * Math.PI / 180, side = Math.cos(a) >= 0 ? 1 : -1;
  const p1 = [p0[0] + Math.cos(a) * len + side * droop * .5, p0[1] + Math.sin(a) * len + droop];
  const c = [p0[0] + Math.cos(a) * len * .7, p0[1] + Math.sin(a) * len * .7 - droop * .4];
  const L = [], R = [], M = [], n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n, pt = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t), half = w * (1 - Math.pow(t, 1.6)) + .2;
    L.push([pt[0] + Math.cos(ta - Math.PI / 2) * half, pt[1] + Math.sin(ta - Math.PI / 2) * half]);
    R.push([pt[0] + Math.cos(ta + Math.PI / 2) * half, pt[1] + Math.sin(ta + Math.PI / 2) * half]);
    if (t < .85) M.push(pt);
  }
  const pts = L.concat(R.slice().reverse()).map(q => q.map(f1).join(" "));
  return `<path d="M${pts.join(" L")} Z" fill="var(--leaf)" fill-opacity=".55" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M${M.map(q => q.map(f1).join(" ")).join(" L")}" fill="none" stroke="#fffbe6" stroke-width="${f1(w * .7)}" stroke-linecap="round" opacity=".8"/>`;
}
function spiderTuft(cx, cy, sc) {
  const L = [[-95, 70, 4, 6], [-80, 74, 4, 10], [-110, 66, 4, 16], [-65, 68, 4, 18], [-130, 62, 4, 34], [-50, 62, 4, 34], [-150, 58, 3.6, 46], [-30, 58, 3.6, 46], [-168, 50, 3.4, 50], [-12, 50, 3.4, 50]];
  return L.map(([d, l, w, dr]) => grass([cx, cy], d, l * sc, w * sc, dr * sc)).join("");
}
function star(x, y, r) {
  let s = "";
  for (let k = 0; k < 6; k++) s += `<ellipse cx="0" cy="${f1(-r * .55)}" rx="${f1(r * .25)}" ry="${f1(r * .55)}" transform="translate(${f1(x)} ${f1(y)}) rotate(${k * 60})" fill="#ffffff" stroke="${INK}" stroke-width=".5"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .18)}" fill="var(--sun)"/>`;
}
function runner(p0, p1, bend, opt = {}) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
  const c = [mx, my - bend];
  let s = stem(`M${f1(p0[0])} ${f1(p0[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}`, 1.4, "var(--sun)");
  if (opt.flowers) [.45, .62, .78].forEach(t => { const q = qpt(p0, c, p1, t); s += star(q[0], q[1] - 3, 6); });
  if (opt.baby) s += spiderTuft(p1[0], p1[1], .32) + `<path d="M${p1[0] - 4} ${p1[1]} l-2 7 M${p1[0]} ${p1[1]} l0 8 M${p1[0] + 4} ${p1[1]} l2 7" stroke="${INK}" stroke-width=".8"/>`;
  return s;
}

// pothos: heart-shaped leaves with yellow streaks on trailing vines, root bumps at the joints
function heartLeaf(x, y, L, deg) {
  const d = `M0 0 C${-.15 * L} ${.12 * L} ${-.6 * L} ${.05 * L} ${-.5 * L} ${-.35 * L} C${-.4 * L} ${-.7 * L} ${-.1 * L} ${-.9 * L} 0 ${-L} C${.1 * L} ${-.9 * L} ${.4 * L} ${-.7 * L} ${.5 * L} ${-.35 * L} C${.6 * L} ${.05 * L} ${.15 * L} ${.12 * L} 0 0 Z`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})">
    <path d="${d}" fill="var(--leaf)" fill-opacity=".6" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M${-.18 * L} ${-.25 * L} q${.08 * L} ${-.25 * L} ${.12 * L} ${-.55 * L} M${.2 * L} ${-.2 * L} q${-.04 * L} ${-.3 * L} ${-.1 * L} ${-.6 * L} M${-.32 * L} ${-.4 * L} q${.06 * L} ${-.12 * L} ${.16 * L} ${-.26 * L}" fill="none" stroke="var(--sun)" stroke-width="${f1(L * .07)}" stroke-linecap="round" opacity=".75"/>
    <path d="M0 -2 L0 ${-L * .92}" stroke="${INK}" stroke-width=".6"/></g>`;
}
function vine(p0, p1, bend, ts) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  const c = [mx + Math.cos(a + Math.PI / 2) * bend, my + Math.sin(a + Math.PI / 2) * bend];
  let s = stem(`M${f1(p0[0])} ${f1(p0[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}`, 1.8, "var(--leaf)");
  (ts || [.15, .32, .5, .68, .86, 1]).forEach((t, i) => {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t) * 180 / Math.PI, sd = i % 2 ? 1 : -1;
    s += heartLeaf(x, y, 20 + t * 10, ta + 90 + sd * 70) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="var(--soil)" stroke="${INK}" stroke-width=".5"/>`;
  });
  return s;
}

// tomato: compound leaves of toothed leaflets, yellow star flowers, round fruit
function tomLeaf(x, y, len, deg) {
  const a = deg * Math.PI / 180, tip = [x + Math.cos(a) * len, y + Math.sin(a) * len];
  let s = `<path d="M${f1(x)} ${f1(y)} L${f1(tip[0])} ${f1(tip[1])}" stroke="${INK}" stroke-width="1"/>`;
  [.3, .55, .8].forEach((t, i) => {
    const px = x + Math.cos(a) * len * t, py = y + Math.sin(a) * len * t;
    s += leaf(px, py, len * .32, len * .1, deg - 60, 5) + leaf(px, py, len * .32, len * .1, deg + 60, 5);
  });
  return s + leaf(tip[0], tip[1], len * .34, len * .11, deg, 5);
}
function yStar(x, y, r) {
  let s = "";
  for (let k = 0; k < 5; k++) s += `<path d="M0 0 L${f1(-r * .28)} ${f1(-r * .7)} L0 ${f1(-r)} L${f1(r * .28)} ${f1(-r * .7)} Z" transform="translate(${f1(x)} ${f1(y)}) rotate(${k * 72})" fill="var(--sun)" fill-opacity=".85" stroke="${INK}" stroke-width=".5"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .22)}" fill="var(--sun)" stroke="${INK}" stroke-width=".5"/>`;
}
function fruit(x, y, r, fill) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill}" fill-opacity=".8" stroke="${INK}" stroke-width=".9"/>
    <path d="M${f1(x - r * .35)} ${f1(y - r * .45)} q${f1(r * .2)} ${f1(-r * .2)} ${f1(r * .45)} ${f1(-r * .1)}" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".6"/>
    ${[0, 72, 144, 216, 288].map(d => `<path d="M${f1(x)} ${f1(y - r)} l0 -${f1(r * .35)}" transform="rotate(${d} ${f1(x)} ${f1(y - r)})" stroke="var(--leaf)" stroke-width="1.6" stroke-linecap="round"/>`).join("")}`;
}

// basil: smooth glossy paired leaves, square stem, whorled white flower spikes
function basilLeaf(x, y, len, deg) {
  const a = deg * Math.PI / 180, n = 12, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, half = len * .36 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), .8) * (1 - .3 * t);
    L.push(rot(t * len, -half, x, y, a)); R.push(rot(t * len, half, x, y, a));
  }
  const pts = L.concat(R.reverse()).map(q => q.map(f1).join(" "));
  const tip = rot(len, 0, x, y, a);
  return `<path d="M${pts.join(" L")} Z" fill="var(--leaf)" fill-opacity=".55" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M${f1(x)} ${f1(y)} L${f1(tip[0])} ${f1(tip[1])}" stroke="${INK}" stroke-width=".5"/>`;
}
function basilSpike(x, yTop, yBot, fill = "#ffffff") {
  let s = stem(`M${x} ${yBot} L${x} ${yTop}`, 1.2, "var(--leaf)");
  for (let y = yTop + 4, i = 0; y < yBot; y += 9, i++) {
    [-1, 1].forEach(sd => s += `<ellipse cx="${f1(x + sd * 4.5)}" cy="${f1(y)}" rx="3" ry="2.2" transform="rotate(${sd * 20} ${f1(x + sd * 4.5)} ${f1(y)})" fill="${fill}" stroke="${INK}" stroke-width=".5"/>`);
    s += `<path d="M${x - 6} ${y + 3} q6 3 12 0" fill="none" stroke="${INK}" stroke-width=".6"/>`;
  }
  return s;
}
function basilPlant(flowers) {
  let s = stem("M150 268 L150 70", 2.6, "var(--leaf)") + stem("M150 176 C130 160 118 140 114 104", 2, "var(--leaf)") + stem("M150 160 C170 146 182 126 186 96", 2, "var(--leaf)");
  [[150, 236, 44], [150, 196, 40], [150, 146, 34], [150, 104, 26]].forEach(([x, y, l]) => s += basilLeaf(x, y, l, 200) + basilLeaf(x, y, l, -20));
  [[116, 130, 26], [184, 122, 26]].forEach(([x, y, l]) => s += basilLeaf(x, y, l, 210) + basilLeaf(x, y, l, -30));
  if (flowers) s += basilSpike(150, 26, 72) + basilSpike(114, 58, 106) + basilSpike(186, 50, 98);
  else s += basilLeaf(150, 72, 18, 230) + basilLeaf(150, 72, 18, -50) + basilLeaf(114, 106, 16, 240) + basilLeaf(114, 106, 16, -60) + basilLeaf(186, 98, 16, 240) + basilLeaf(186, 98, 16, -60);
  return s;
}

// flaming sword: a flat spike of overlapping yellow bracts
function sword(cx, top, bottom) {
  let s = stem(`M${cx} ${bottom} L${cx} ${top + 8}`, 2.4, "var(--leaf)");
  const n = 11, span = bottom - 40 - top;
  for (let i = 0; i < n; i++) {
    const y = bottom - 40 - i * span / n, sd = i % 2 ? 1 : -1, sc = 1 - i * .045;
    const ex = cx + sd * 6 * sc, ey = y - 4;
    s += `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="${f1(6.5 * sc)}" ry="${f1(13 * sc)}" transform="rotate(${sd * 38} ${f1(ex)} ${f1(ey)})" fill="var(--yellow)" fill-opacity=".9" stroke="${INK}" stroke-width=".7"/>`;
  }
  return s;
}

// pepper: smooth pointed leaves, nodding white flowers, hanging pods
function pod(x, y, len, fill, deg = 0) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg})">
    <path d="M-5 4 C-7 ${f1(len * .5)} -3 ${f1(len * .9)} 0 ${f1(len)} C3 ${f1(len * .9)} 7 ${f1(len * .5)} 5 4 Z" fill="${fill}" fill-opacity=".85" stroke="${INK}" stroke-width=".9"/>
    <path d="M-5 4 Q0 -1 5 4" fill="var(--leaf)" stroke="${INK}" stroke-width=".8"/><path d="M0 1 L0 -7" stroke="${INK}" stroke-width="1.6"/><path d="M0 1 L0 -7" stroke="var(--leaf)" stroke-width=".8"/>
    <path d="M-2 10 Q-3 ${f1(len * .5)} -1 ${f1(len * .8)}" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".5"/></g>`;
}
function nodFlower(x, y, r) {
  let s = `<path d="M${x} ${y - 8} L${x} ${y}" stroke="${INK}" stroke-width=".8"/>`;
  for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="${f1(r * .55)}" rx="${f1(r * .3)}" ry="${f1(r * .55)}" transform="translate(${x} ${y}) rotate(${k * 72 - 144})" fill="#ffffff" stroke="${INK}" stroke-width=".5"/>`;
  return s + `<circle cx="${x}" cy="${y + 1}" r="${f1(r * .22)}" fill="var(--sun)"/>`;
}

// strawberry: leaves in threes with toothed leaflets, white five-petal flowers, seeded red berries, runners
function trifol(x, y, len, deg) {
  let s = stem(`M${x} ${y} L${f1(x + Math.cos((deg - 90) * Math.PI / 180) * len)} ${f1(y + Math.sin((deg - 90) * Math.PI / 180) * len)}`, 1.3, "var(--leaf)");
  const tx = x + Math.cos((deg - 90) * Math.PI / 180) * len, ty = y + Math.sin((deg - 90) * Math.PI / 180) * len;
  return s + leaf(tx, ty, 20, 9, deg - 135, 6) + leaf(tx, ty, 20, 9, deg - 45, 6) + leaf(tx, ty, 22, 10, deg - 90, 6);
}
function whiteFlower(x, y, r) {
  let s = "";
  for (let k = 0; k < 5; k++) s += `<circle cx="${f1(x + Math.cos(k * 1.2566) * r * .55)}" cy="${f1(y + Math.sin(k * 1.2566) * r * .55)}" r="${f1(r * .45)}" fill="#ffffff" stroke="${INK}" stroke-width=".5"/>`;
  return s + `<circle cx="${x}" cy="${y}" r="${f1(r * .35)}" fill="var(--yellow)" stroke="${INK}" stroke-width=".5"/>`;
}
function berry(x, y, r) {
  let s = `<path d="M${x} ${y - r} C${x + r * 1.1} ${y - r} ${x + r * .9} ${y + r * .6} ${x} ${y + r * 1.25} C${x - r * .9} ${y + r * .6} ${x - r * 1.1} ${y - r} ${x} ${y - r} Z" fill="var(--foe)" fill-opacity=".85" stroke="${INK}" stroke-width=".8"/>`;
  for (let i = 0; i < 7; i++) s += `<circle cx="${f1(x + Math.cos(i * 2.4) * r * .45)}" cy="${f1(y + Math.sin(i * 2.4) * r * .55)}" r=".9" fill="var(--yellow)"/>`;
  return s + `<path d="M${x - r * .7} ${y - r * .9} L${x} ${y - r * .5} L${x + r * .7} ${y - r * .9} M${x} ${y - r} L${x} ${y - r * 1.6}" stroke="var(--leaf)" stroke-width="1.4" fill="none"/>`;
}

// green onion: upright hollow tube leaves from slim white bases; flower = round ball of tiny cream florets on a tall hollow stalk
function tubeLeaf(x, y, deg, len, w, droop) {
  const p0 = [x, y], a = deg * Math.PI / 180, side = Math.cos(a) >= 0 ? 1 : -1;
  const p1 = [x + Math.cos(a) * len + side * droop, y + Math.sin(a) * len + droop * .3];
  const c = [x + Math.cos(a) * len * .6, y + Math.sin(a) * len * .6];
  const L = [], R = [], M = [], n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n, pt = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t), half = w * (t < .8 ? 1 : Math.max(0, (1 - t) / .2)) + .15;
    L.push([pt[0] + Math.cos(ta - Math.PI / 2) * half, pt[1] + Math.sin(ta - Math.PI / 2) * half]);
    R.push([pt[0] + Math.cos(ta + Math.PI / 2) * half, pt[1] + Math.sin(ta + Math.PI / 2) * half]);
    if (t < .8) M.push([pt[0] + Math.cos(ta - Math.PI / 2) * half * .35, pt[1] + Math.sin(ta - Math.PI / 2) * half * .35]);
  }
  const pts = L.concat(R.slice().reverse()).map(q => q.map(f1).join(" "));
  return `<path d="M${pts.join(" L")} Z" fill="var(--leaf)" fill-opacity=".5" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M${M.map(q => q.map(f1).join(" ")).join(" L")}" fill="none" stroke="#fffbe6" stroke-width="${f1(w * .45)}" stroke-linecap="round" opacity=".75"/>`;
}
function onionBase(x, y) {
  return `<path d="M${x - 3.6} ${y - 18} C${x - 4.6} ${y - 6} ${x - 5} ${y - 1} ${x} ${y + 2} C${x + 5} ${y - 1} ${x + 4.6} ${y - 6} ${x + 3.6} ${y - 18} Z" fill="#ffffff" stroke="${INK}" stroke-width=".8"/>` +
    `<path d="M${x - 1.5} ${y + 2} l-2 6 M${x} ${y + 2} l0 7 M${x + 1.5} ${y + 2} l2 6" stroke="${INK}" stroke-width=".6"/>`;
}
function onionClump(cx, y, sc = 1) {
  const L = [[-12, -100, 132, 2.6, 4], [-8, -93, 146, 2.6, 2], [-4, -85, 118, 2.5, 6], [0, -90, 156, 2.7, 1], [4, -96, 124, 2.5, 5], [8, -86, 138, 2.6, 3], [12, -80, 110, 2.4, 8], [-14, -110, 96, 2.3, 10]];
  let s = "";
  L.forEach(([dx, d, l, w, dr]) => { s += tubeLeaf(cx + dx * sc, y - 16 * sc, d, l * sc, w * sc, dr * sc); });
  [-12, 0, 12].forEach(dx => { s += `<g transform="translate(${f1(cx + dx * sc)} ${y}) scale(${sc}) translate(${f1(-(cx + dx * sc))} ${-y})">${onionBase(cx + dx * sc, y)}</g>`; });
  return s;
}
function umbel(x, y, r) {
  _seed = 31; let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffbe6" fill-opacity=".9" stroke="${INK}" stroke-width=".5"/>`;
  for (let k = 0; k < 46; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * .92, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="1.8" fill="#ffffff" stroke="${INK}" stroke-width=".45"/><circle cx="${f1(px)}" cy="${f1(py)}" r=".6" fill="var(--yellow)"/>`;
  }
  return s;
}
function scape(x, y, top, bulge = 1) {
  const m = (y + top) / 2;
  return `<path d="M${x - 1.6} ${y} C${x - 3.4 * bulge} ${m + 20} ${x - 3.4 * bulge} ${m - 20} ${x - 1.4} ${top} L${x + 1.4} ${top} C${x + 3.4 * bulge} ${m - 20} ${x + 3.4 * bulge} ${m + 20} ${x + 1.6} ${y} Z" fill="var(--leaf)" fill-opacity=".6" stroke="${INK}" stroke-width=".8"/>`;
}

// monstera adansonii: oval pointed leaves, a bit lopsided, with oval holes between the veins; thin brown aerial roots at the joints
function ell(cx, cy, rx, ry) { return `M${f1(cx - rx)} ${f1(cy)} a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0 a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0 Z`; }
function holeLeaf(x, y, L, deg) {
  const out = `M0 0 C${-.42 * L} ${-.08 * L} ${-.5 * L} ${-.62 * L} 0 ${-L} C${.38 * L} ${-.66 * L} ${.36 * L} ${-.1 * L} 0 0 Z`;
  let holes = "";
  [[-.2, -.3, .09, .05], [-.23, -.52, .085, .045], [-.15, -.72, .06, .035], [.17, -.36, .08, .045], [.16, -.58, .07, .04]].forEach(([hx, hy, rx, ry]) => holes += ell(hx * L, hy * L, rx * L, ry * L));
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})">
    <path d="${out} ${holes}" fill-rule="evenodd" fill="var(--leaf)" fill-opacity=".62" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M0 -2 L0 ${f1(-L * .94)}" stroke="${INK}" stroke-width=".6"/></g>`;
}
function monsVine(p0, p1, bend, ts) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  const c = [mx + Math.cos(a + Math.PI / 2) * bend, my + Math.sin(a + Math.PI / 2) * bend];
  let s = stem(`M${f1(p0[0])} ${f1(p0[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}`, 1.8, "var(--leaf)"), roots = "";
  (ts || [.15, .34, .53, .72, .9]).forEach((t, i) => {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t) * 180 / Math.PI, sd = i % 2 ? 1 : -1;
    roots += `<path d="M${f1(x)} ${f1(y)} q${-sd * 5} 10 ${-sd * 1} 20" fill="none" stroke="var(--soil)" stroke-width="1.3" stroke-linecap="round"/>`;
    s += holeLeaf(x, y, 30 + t * 12, ta + 90 + sd * 68);
  });
  return s + roots;
}

// ginger: reed-like stalks with long narrow smooth leaves in two rows; knobbly tan root (rhizome) at the surface
function lanceLeaf(x, y, len, w, deg, droop = 6, fill = "var(--leaf)") {
  const p0 = [x, y], a = deg * Math.PI / 180, side = Math.cos(a) >= 0 ? 1 : -1;
  const p1 = [x + Math.cos(a) * len, y + Math.sin(a) * len + droop];
  const c = [x + Math.cos(a) * len * .55, y + Math.sin(a) * len * .55 - droop * .3];
  const L = [], R = [], n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n, pt = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t), half = w * Math.pow(Math.sin(Math.PI * Math.min(t * 1.05, 1)), .8) * (1 - .35 * t) + .1;
    L.push([pt[0] + Math.cos(ta - Math.PI / 2) * half, pt[1] + Math.sin(ta - Math.PI / 2) * half]);
    R.push([pt[0] + Math.cos(ta + Math.PI / 2) * half, pt[1] + Math.sin(ta + Math.PI / 2) * half]);
  }
  const pts = L.concat(R.slice().reverse()).map(q => q.map(f1).join(" "));
  return `<path d="M${pts.join(" L")} Z" fill="${fill}" fill-opacity=".5" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M${f1(x)} ${f1(y)} Q${f1(c[0])} ${f1(c[1])} ${f1(p1[0])} ${f1(p1[1])}" fill="none" stroke="${INK}" stroke-width=".5" opacity=".7"/>`;
}
function gingerStalk(x, y, h, lean, n = 6) {
  const top = [x + lean, y - h], c = [x + lean * .2, y - h * .5];
  let s = stem(`M${x} ${y} Q${f1(c[0])} ${f1(c[1])} ${f1(top[0])} ${f1(top[1])}`, 1.8, "var(--leaf)");
  for (let i = 0; i < n; i++) {
    const t = .3 + .7 * i / (n - 1), [px, py] = qpt([x, y], c, top, t), sd = i % 2 ? 1 : -1;
    s += lanceLeaf(px, py, 62 - i * 4, 5.5, sd > 0 ? -26 : -154, 12);
  }
  return s;
}
function rhizome(x, y, sc = 1) {
  const knobs = [[0, 0, 16, 9], [20, -3, 13, 8], [36, 2, 11, 7], [-18, 2, 12, 8], [10, 9, 9, 6], [-30, -2, 8, 6]];
  let s = "";
  knobs.forEach(([dx, dy, rx, ry]) => {
    s += `<ellipse cx="${f1(x + dx * sc)}" cy="${f1(y + dy * sc)}" rx="${f1(rx * sc)}" ry="${f1(ry * sc)}" fill="#e6c68c" stroke="${INK}" stroke-width=".8"/>`;
    s += `<path d="M${f1(x + dx * sc - rx * sc * .3)} ${f1(y + dy * sc - ry * sc * .8)} q2 ${f1(ry * sc * .8)} 0 ${f1(ry * sc * 1.6)}" fill="none" stroke="${INK}" stroke-width=".45" opacity=".6"/>`;
  });
  s += [[40, -4], [-34, -4]].map(([dx, dy]) => `<ellipse cx="${f1(x + dx * sc)}" cy="${f1(y + dy * sc)}" rx="${f1(3 * sc)}" ry="${f1(2.2 * sc)}" fill="var(--pink)" stroke="${INK}" stroke-width=".5"/>`).join("");
  return s;
}

// lavender: woody grey base, tufts of narrow grey-green leaves, long bare stalks topped with spikes of purple whorls
const LAVLEAF = "#8fa39a";
function lavSpike(x, y, top, lean = 0) {
  let s = stem(`M${f1(x)} ${f1(y)} Q${f1(x + lean * .3)} ${f1((y + top) / 2)} ${f1(x + lean)} ${f1(top)}`, 1, "var(--leaf)");
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), yy = top + 3 + t * 34 + (i > 4 ? (i - 4) * 6 : 0), xx = x + lean - lean * .3 * t * .4, r = 3.4 - t * 1.1;
    s += `<ellipse cx="${f1(xx - r * .7)}" cy="${f1(yy)}" rx="${f1(r * .75)}" ry="${f1(r)}" fill="var(--feed)" fill-opacity=".8" stroke="${INK}" stroke-width=".5"/>` +
      `<ellipse cx="${f1(xx + r * .7)}" cy="${f1(yy)}" rx="${f1(r * .75)}" ry="${f1(r)}" fill="var(--feed)" fill-opacity=".8" stroke="${INK}" stroke-width=".5"/>` +
      `<ellipse cx="${f1(xx)}" cy="${f1(yy - 1)}" rx="${f1(r * .6)}" ry="${f1(r * .9)}" fill="var(--feed)" stroke="${INK}" stroke-width=".5"/>`;
  }
  return s;
}
function lavTuft(x, y, sc = 1) {
  let s = "";
  [-160, -140, -122, -106, -90, -74, -58, -40, -20].forEach((d, i) => { s += lanceLeaf(x, y, (15 + (i % 3) * 4) * sc, 1.7 * sc, d, 2, LAVLEAF); });
  return s;
}
function lavBush(flowers, sc = 1, cx = 150, base = 236) {
  const P = (dx, dy) => [cx + dx * sc, base + dy * sc];
  let s = "";
  const woody = [[-6, -58, -30], [-3, -36, -44], [0, -12, -50], [3, 14, -48], [6, 38, -40], [8, 60, -26]];
  const tips = [];
  woody.forEach(([a, c, d]) => {
    const [x0, y0] = P(a, 0), [x1, y1] = P(c, d);
    s += stem(`M${f1(x0)} ${f1(y0)} Q${f1((x0 + x1) / 2)} ${f1(y0 - 4 * sc)} ${f1(x1)} ${f1(y1)}`, 2.2 * sc, "#9b9089");
    tips.push([x1, y1], [(x0 + x1 * 2) / 3 + 0, (y0 + y1 * 2) / 3 + 2 * sc]);
  });
  if (flowers) {
    [[-36, -44, -150, -12], [-12, -50, -176, -4], [14, -48, -170, 6], [38, -40, -146, 14], [-58, -30, -122, -20], [60, -26, -126, 20], [0, -52, -188, 0]].forEach(([a, b, top, lean]) => {
      const [x0, y0] = P(a, b); s += lavSpike(x0, y0 - 10 * sc, base + top * sc, lean * sc);
    });
  }
  tips.concat([P(-24, -52), P(26, -52), P(-48, -42), P(50, -38)]).forEach(([x, y]) => { s += lavTuft(x, y, sc); });
  return s;
}

// star jasmine: woody twining stem, glossy dark oval leaves in opposite pairs, white pinwheel flowers in loose clusters
function glossLeaf(x, y, L, deg) {
  const d = `M0 0 C${-.34 * L} ${-.18 * L} ${-.3 * L} ${-.78 * L} 0 ${-L} C${.3 * L} ${-.78 * L} ${.34 * L} ${-.18 * L} 0 0 Z`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})"><path d="${d}" fill="var(--leaf)" fill-opacity=".85" stroke="${INK}" stroke-width=".9"/>
    <path d="M${f1(-.12 * L)} ${f1(-.3 * L)} Q${f1(-.16 * L)} ${f1(-.6 * L)} ${f1(-.04 * L)} ${f1(-.82 * L)}" fill="none" stroke="#ffffff" stroke-width="${f1(L * .06)}" stroke-linecap="round" opacity=".45"/>
    <path d="M0 -2 L0 ${f1(-L * .94)}" stroke="${INK}" stroke-width=".55"/></g>`;
}
function pinwheel(x, y, r) {
  let s = "";
  for (let k = 0; k < 5; k++) s += `<path d="M0 0 C${f1(r * .1)} ${f1(-r * .5)} ${f1(r * .7)} ${f1(-r * 1.05)} ${f1(r * .2)} ${f1(-r * 1.1)} C${f1(-r * .25)} ${f1(-r * 1.1)} ${f1(-r * .3)} ${f1(-r * .5)} 0 0 Z" transform="translate(${f1(x)} ${f1(y)}) rotate(${k * 72})" fill="#ffffff" stroke="${INK}" stroke-width=".6"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .14)}" fill="var(--yellow)" stroke="${INK}" stroke-width=".4"/>`;
}
function jasVine(p0, c, p1, pairs, flowers, sc = 1) {
  let s = stem(`M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`, 1.6 * sc, "#8a7a6a");
  pairs.forEach(t => {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t) * 180 / Math.PI;
    s += glossLeaf(x, y, 24 * sc, ta + 90 - 62) + glossLeaf(x, y, 24 * sc, ta + 90 + 62);
  });
  (flowers || []).forEach(([t, n]) => {
    const [x, y] = qpt(p0, c, p1, t);
    for (let i = 0; i < n; i++) {
      const a = (-150 + i * 40) * Math.PI / 180, fx = x + Math.cos(a) * 18 * sc, fy = y + Math.sin(a) * 18 * sc - 6 * sc;
      s += `<path d="M${f1(x)} ${f1(y)} L${f1(fx)} ${f1(fy)}" stroke="var(--leaf)" stroke-width="1"/>` + pinwheel(fx, fy, 7 * sc);
    }
  });
  return s;
}

// morning glory: twining vine of heart-shaped leaves, trumpet flowers seen face-on and side-on, round seed pods
function mgLeaf(x, y, L, deg) {
  const d = `M0 0 C${-.15 * L} ${.12 * L} ${-.6 * L} ${.05 * L} ${-.5 * L} ${-.35 * L} C${-.42 * L} ${-.68 * L} ${-.12 * L} ${-.86 * L} 0 ${-L} C${.12 * L} ${-.86 * L} ${.42 * L} ${-.68 * L} ${.5 * L} ${-.35 * L} C${.6 * L} ${.05 * L} ${.15 * L} ${.12 * L} 0 0 Z`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})"><path d="${d}" fill="var(--leaf)" fill-opacity=".55" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M0 -2 L0 ${f1(-L * .92)} M0 ${f1(-L * .3)} l${f1(-L * .25)} ${f1(-L * .18)} M0 ${f1(-L * .3)} l${f1(L * .25)} ${f1(-L * .18)} M0 ${f1(-L * .55)} l${f1(-L * .2)} ${f1(-L * .14)} M0 ${f1(-L * .55)} l${f1(L * .2)} ${f1(-L * .14)}" fill="none" stroke="${INK}" stroke-width=".5" opacity=".7"/></g>`;
}
function trumpetFace(x, y, r) {
  let s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="var(--feed)" fill-opacity=".75" stroke="${INK}" stroke-width=".9"/>`;
  for (let k = 0; k < 5; k++) { const a = (k * 72 - 90) * Math.PI / 180; s += `<path d="M${f1(x + Math.cos(a) * r * .3)} ${f1(y + Math.sin(a) * r * .3)} L${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r)}" stroke="#ffffff" stroke-width="1.6" opacity=".8"/>`; }
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .3)}" fill="#ffffff" stroke="${INK}" stroke-width=".5"/>`;
}
function trumpetSide(x, y, len, deg) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})"><path d="M0 0 C${f1(len * .3)} -3 ${f1(len * .6)} -4 ${f1(len)} ${f1(-len * .38)} L${f1(len)} ${f1(len * .38)} C${f1(len * .6)} 4 ${f1(len * .3)} 3 0 0 Z" fill="var(--feed)" fill-opacity=".75" stroke="${INK}" stroke-width=".8"/>
    <ellipse cx="${f1(len)}" cy="0" rx="${f1(len * .1)}" ry="${f1(len * .38)}" fill="var(--feed)" stroke="${INK}" stroke-width=".7"/></g>`;
}
function mgVine(p0, c, p1, leaves, sc = 1) {
  let s = stem(`M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`, 1.2 * sc, "var(--leaf)");
  leaves.forEach((t, i) => {
    const [x, y] = qpt(p0, c, p1, t), ta = qtan(p0, c, p1, t) * 180 / Math.PI, sd = i % 2 ? 1 : -1;
    s += mgLeaf(x, y, (26 - t * 6) * sc, ta + 90 + sd * 75);
  });
  return s;
}
function mgPlant(flowers) {
  let s = `<path d="M150 266 L150 26 M120 266 L120 40 M180 266 L180 40" stroke="#b8a888" stroke-width="1.4" stroke-dasharray="1 0"/><path d="M110 266 L190 266" stroke="var(--soil)" stroke-width="3"/>`;
  s += mgVine([150, 262], [100, 170], [176, 44], [.15, .3, .45, .6, .75, .9]);
  s += mgVine([150, 262], [200, 200], [124, 70], [.25, .5, .7, .88]);
  if (flowers) {
    const A = [[150, 262], [100, 170], [176, 44]], B = [[150, 262], [200, 200], [124, 70]];
    const at = (V, tt, dx, dy) => { const [x, y] = qpt(V[0], V[1], V[2], tt); return [x, y, x + dx, y + dy]; };
    [[A, .82, 26, -10, "face", 15], [A, .38, -30, -8, "face", 12], [B, .62, 28, -6, "side", 26]].forEach(([V, tt, dx, dy, kind, r]) => {
      const [x, y, fx, fy] = at(V, tt, dx, dy);
      s += `<path d="M${f1(x)} ${f1(y)} Q${f1((x + fx) / 2)} ${f1(Math.min(y, fy) - 6)} ${f1(fx)} ${f1(fy)}" fill="none" stroke="var(--leaf)" stroke-width="1.2"/>`;
      s += kind === "face" ? trumpetFace(fx + Math.sign(dx) * r * .7, fy, r) : trumpetSide(fx, fy, r, -14);
    });
    const [x, y] = qpt(B[0], B[1], B[2], .28);
    [[16, 4], [24, 12]].forEach(([dx, dy]) => { s += `<path d="M${f1(x)} ${f1(y)} L${f1(x + dx)} ${f1(y + dy - 5)}" stroke="var(--leaf)" stroke-width="1"/><circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="5" fill="#d8c9a3" stroke="${INK}" stroke-width=".7"/><path d="M${f1(x + dx - 4)} ${f1(y + dy - 4)} l3 3 M${f1(x + dx + 4)} ${f1(y + dy - 4)} l-3 3" stroke="${INK}" stroke-width=".6"/>`; });
  }
  return s;
}

// succulent box: aeonium rosettes on woody stems, pine-tree crassula, ghost plant rosette, freckled ox tongue, striped zebra plant
function rosetteTop(x, y, r, n, fill, op = .6, edge = "var(--pink)") {
  let s = "";
  [1, .72, .45].forEach((k, ring) => {
    const m = Math.round(n * (ring ? .8 : 1));
    for (let i = 0; i < m; i++) {
      const a = (i / m) * 360 + ring * 17;
      s += `<path d="M0 0 C${f1(-r * k * .38)} ${f1(-r * k * .35)} ${f1(-r * k * .32)} ${f1(-r * k * .95)} 0 ${f1(-r * k)} C${f1(r * k * .32)} ${f1(-r * k * .95)} ${f1(r * k * .38)} ${f1(-r * k * .35)} 0 0 Z" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})" fill="${fill}" fill-opacity="${op}" stroke="${edge}" stroke-width=".9"/>`;
    }
  });
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .12)}" fill="${fill}" stroke="${INK}" stroke-width=".4"/>`;
}
function rosetteSide(x, y, r, fill, edge) {
  let s = "";
  [-70, -40, -12, 12, 40, 70, -55, 55, 0].forEach((d, i) => {
    const L = r * (i > 5 ? .7 : 1);
    s += `<path d="M0 0 C${f1(-L * .3)} ${f1(-L * .3)} ${f1(-L * .28)} ${f1(-L * .9)} 0 ${f1(-L)} C${f1(L * .28)} ${f1(-L * .9)} ${f1(L * .3)} ${f1(-L * .3)} 0 0 Z" transform="translate(${f1(x)} ${f1(y)}) rotate(${d})" fill="${fill}" fill-opacity=".7" stroke="${edge}" stroke-width=".9"/>`;
  });
  return s;
}
function pineCrassula(x, y, h) {
  let s = stem(`M${x} ${y} C${x - 2} ${y - h * .4} ${x + 3} ${y - h * .7} ${x} ${y - h}`, 1.6, "#9b8a74");
  s += stem(`M${x} ${y - h * .45} Q${x + 14} ${y - h * .6} ${x + 18} ${y - h * .85}`, 1.2, "#9b8a74");
  const tips = [[x, y - h], [x + 18, y - h * .85]];
  for (let i = 0; i < 6; i++) { const yy = y - h * (.2 + i * .14); tips.push([x + (i % 2 ? 1 : -1), yy]); }
  tips.forEach(([px, py], j) => {
    [-60, -30, 30, 60, -10, 10].forEach((d, k) => { if (j > 1 && k > 3) return; s += lanceLeaf(px, py, 13, 1.6, -90 + d, 2); });
  });
  return s;
}
function oxTongue(x, y, deg, L) {
  let dots = ""; _seed = 53;
  for (let i = 0; i < 26; i++) dots += `<circle cx="${f1((rnd() - .5) * L * .26)}" cy="${f1(-rnd() * L * .9 - 4)}" r=".9" fill="#f4f0d8"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg})"><path d="M${f1(-L * .14)} 0 C${f1(-L * .18)} ${f1(-L * .5)} ${f1(-L * .16)} ${f1(-L * .9)} 0 ${f1(-L)} C${f1(L * .16)} ${f1(-L * .9)} ${f1(L * .18)} ${f1(-L * .5)} ${f1(L * .14)} 0 Z" fill="var(--leaf)" fill-opacity=".9" stroke="${INK}" stroke-width=".9"/>${dots}</g>`;
}
function zebraLeaf(x, y, deg, L) {
  let bands = "";
  for (let i = 1; i < 7; i++) bands += `<path d="M${f1(-L * .1 * (1 - i / 8))} ${f1(-L * i / 7.5)} l${f1(L * .2 * (1 - i / 8))} 0" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg})"><path d="M${f1(-L * .12)} 0 C${f1(-L * .12)} ${f1(-L * .5)} ${f1(-L * .06)} ${f1(-L * .85)} 0 ${f1(-L)} C${f1(L * .06)} ${f1(-L * .85)} ${f1(L * .12)} ${f1(-L * .5)} ${f1(L * .12)} 0 Z" fill="var(--leaf)" fill-opacity=".95" stroke="${INK}" stroke-width=".8"/>${bands}</g>`;
}

const PLATES = {
  hydrangeaBloom: () => plate("-26 0 330 284",
    stem("M140 254 C140 220 139 170 140 110") +
    leaf(139, 222, 62, 19, 200) + leaf(141, 222, 62, 19, -20) +
    leaf(139, 168, 52, 16, 215) + leaf(141, 168, 52, 16, -35) +
    head(140, 74, 50, "var(--water)", "var(--feed)") +
    note(118, 50, 70, 26, ["Round head of", "small 4-petal", "florets"], "end") +
    note(171, 92, 196, 104, ["Blue on acid soil,", "pink on chalky"]) +
    note(96, 206, 72, 168, ["Big glossy,", "toothed leaves"], "end") +
    note(141, 222, 196, 236, ["Leaves in", "opposite pairs"]) +
    `<text x="140" y="278" text-anchor="middle" class="pt">summer, in flower</text>`,
    "Textbook drawing of bigleaf hydrangea in flower: a round head of small four-petal florets above big toothed leaves in opposite pairs", "var(--water-bg)"),

  hydrangeaRest: () => plate("-26 0 330 284",
    stem("M140 254 C140 210 138 150 140 98", 3.2, "var(--soil)") +
    stem("M140 200 C150 180 170 160 182 140", 2.6, "var(--soil)") +
    bud(137, 232, -55) + bud(143, 232, 55) +
    bud(138, 176, -55) + bud(142, 176, 55) +
    bud(176, 150, -10, .85) + bud(140, 98, 0, 1.1) +
    head(140, 72, 34, "var(--sun)", "var(--soil)", 30, .3) +
    note(114, 64, 72, 40, ["Old flower head", "dries papery tan"], "end") +
    note(145, 172, 196, 168, ["Fat buds in pairs:", "next year's flowers"]) +
    note(140, 240, 72, 232, ["Bare, light brown", "woody stems"], "end") +
    `<text x="140" y="278" text-anchor="middle" class="pt">winter, leaves dropped</text>`,
    "Textbook drawing of bigleaf hydrangea resting in winter: bare woody stems with fat paired buds and a dried papery flower head", "var(--soil-bg)"),

  hydrangeaSnipSummer: () => plate("-24 0 284 246",
    stem("M110 214 C110 180 109 130 110 70") +
    leaf(109, 196, 48, 15, 205) + leaf(111, 196, 48, 15, -25) +
    leaf(109, 132, 40, 13, 215) + leaf(111, 132, 40, 13, -35) +
    leaf(109, 92, 14, 5, 230, 4) + leaf(111, 92, 14, 5, -50, 4) +
    head(110, 48, 32, "var(--water)", "var(--muted)", 32, .25) +
    note(92, 40, 56, 22, ["Fading flower"], "end") +
    note(114, 92, 158, 82, ["Small leaves:", "skip these"]) +
    snip(86, 134, 122, ["Snip here, above", "the first pair of", "full-size leaves"], 156) +
    note(111, 194, 158, 200, ["Buds lower down:", "next year's flowers"]) +
    `<text x="120" y="240" text-anchor="middle" class="pt">summer · deadheading</text>`,
    "Diagram: in summer, snip a fading flower stem just above the first pair of full-size leaves below the head"),

  hydrangeaSnipSpring: () => plate("-24 0 284 246",
    stem("M110 214 C110 180 109 130 110 70", 2.8, "var(--soil)") +
    bud(107, 186, -55) + bud(113, 186, 55) +
    bud(107, 124, -55, 1.15) + bud(113, 124, 55, 1.15) +
    head(110, 48, 30, "var(--sun)", "var(--soil)", 28, .3) +
    note(90, 40, 56, 22, ["Last year's", "dried head"], "end") +
    snip(86, 134, 106, ["Snip here, just", "above the first", "fat buds"], 156) +
    note(113, 184, 158, 196, ["Leave the rest", "of the stem"]) +
    `<text x="120" y="240" text-anchor="middle" class="pt">spring · clearing old heads</text>`,
    "Diagram: in spring, snip off last year's dried flower head just above the first pair of fat buds"),

  heatherBloom: () => plate("-26 0 330 284",
    heatherBush(["var(--feed)", "var(--pink)"], .7) +
    note(118, 104, 92, 40, ["Spikes of tiny", "bell flowers,", "pink or purple"], "end") +
    note(196, 176, 236, 196, ["Tiny scale-", "like leaves", "on the stems"]) +
    note(150, 246, 214, 252, ["Wiry, woody,", "branching stems"]) +
    `<text x="150" y="278" text-anchor="middle" class="pt">late summer to fall, in flower</text>`,
    "Textbook drawing of heather in flower: wiry branching stems with tiny scale-like leaves and spikes of small pink and purple bell flowers", "var(--feed-bg)"),

  heatherRest: () => plate("-26 0 330 284",
    heatherBush(["var(--sun)", "var(--soil)"], .35) +
    note(118, 104, 60, 46, ["Old flowers dry", "papery tan or rust"], "end") +
    note(196, 150, 240, 150, ["Leaves stay", "green all year"]) +
    `<text x="150" y="278" text-anchor="middle" class="pt">winter, resting</text>`,
    "Textbook drawing of heather resting in winter: evergreen scale-like leaves with dried papery flower spikes", "var(--soil-bg)"),

  heatherSnipSpring: () => (_seed = 5, plate("-24 0 284 246",
    heatherStem([110, 226], [112, 40], 8, "var(--sun)", .4, { leafFrom: .32, flowerFrom: .7, step: .022 }) +
    heatherStem([110, 226], [86, 196], -4, null, 0, { leaves: false }) + heatherStem([110, 226], [134, 196], 4, null, 0, { leaves: false }) +
    note(112, 58, 56, 40, ["Last year's", "faded flowers"], "end") +
    snip(86, 134, 99, ["Snip here, just", "below the old", "flowers"], 156) +
    note(113, 140, 158, 150, ["Green leafy part:", "it regrows from here"]) +
    note(111, 206, 158, 214, ["Bare brown wood:", "never cut here"]) +
    `<text x="120" y="242" text-anchor="middle" class="pt">early spring · light haircut</text>`,
    "Diagram: in early spring, snip heather just below last year's faded flowers, staying in the green leafy part and never into bare brown wood")),

  urnBloom: () => plate("-26 0 330 284",
    rosette(150, 232, 1.15, "var(--muted)", .32) +
    brHead(150, 84, "var(--pink)") +
    note(136, 64, 72, 34, ["Spiky pink", "flower head", "on a stalk"], "end") +
    note(212, 196, 222, 150, ["Silvery leaves", "with pale bands"]) +
    note(150, 236, 214, 262, ["Leaves form a cup", "that holds water"]) +
    `<text x="150" y="280" text-anchor="middle" class="pt">flowering, once per rosette</text>`,
    "Textbook drawing of an urn plant in flower: a rosette of arching silvery banded leaves forming a cup, with a spiky pink flower head on a stalk", "var(--feed-bg)"),

  urnRest: () => plate("-26 0 330 284",
    rosette(140, 222, 1.05, "var(--muted)", .3, 3) +
    rosette(222, 250, .42, "var(--leaf)", .35) +
    rosette(70, 254, .34, "var(--leaf)", .35) +
    note(92, 160, 56, 120, ["Mom fades and", "browns after", "flowering"], "end") +
    note(222, 236, 226, 196, ["Babies grow", "at the base"]) +
    note(140, 226, 182, 274, ["Water cup", "in the center"]) +
    `<text x="40" y="280" text-anchor="middle" class="pt">after flowering</text>`,
    "Textbook drawing of an urn plant after flowering: the mother rosette browning, with small baby rosettes at its base", "var(--soil-bg)"),

  urnSnipMom: () => plate("-24 0 284 246",
    rosette(130, 172, .85, "var(--soil)", .3, 8) +
    rosette(40, 208, .45, "var(--leaf)", .35) +
    snip(96, 164, 184, ["Cut mom off", "here, close to", "the base"], 186) +
    note(150, 118, 196, 98, ["Mom, mostly", "brown"]) +
    note(36, 196, -10, 140, ["Leave the", "baby"]) +
    `<text x="120" y="242" text-anchor="middle" class="pt">spring · removing the old mom</text>`,
    "Diagram: in spring, once the mother rosette is mostly brown, cut her off close to the base and leave the baby rosette"),

  inchBloom: () => plate("-26 0 330 284",
    inchClump(true) +
    note(219, 106, 222, 56, ["Small pink", "three-petal", "flowers"]) +
    note(80, 176, 72, 140, ["Pointed leaves", "striped silver"], "end") +
    note(150, 70, 96, 30, ["Trailing stems"], "end") +
    `<text x="150" y="280" text-anchor="middle" class="pt">spring to fall, in flower</text>`,
    "Textbook drawing of an inch plant in flower: trailing stems with pointed purple leaves striped silver and small three-petal pink flowers at the tips", "var(--feed-bg)"),

  inchRest: () => plate("-26 0 330 284",
    inchClump(false) +
    note(80, 176, 72, 140, ["Silver stripes", "stay all year"], "end") +
    note(196, 252, 214, 266, ["Leaf joints: it", "roots and", "branches here"]) +
    `<text x="40" y="280" text-anchor="middle" class="pt">no flowers</text>`,
    "Textbook drawing of an inch plant without flowers: trailing stems of silver-striped purple leaves, with the leaf joints marked", "var(--soil-bg)"),

  inchSnip: () => plate("-24 0 284 246",
    // 1: before
    stem("M36 226 C38 180 34 130 38 64", 2, "var(--feed)") +
    zebLeaf(37, 196, 30, 8, -160) + zebLeaf(36, 150, 30, 8, -20) + zebLeaf(37, 104, 28, 8, -160) + zebLeaf(38, 66, 22, 7, -30) +
    [196, 150, 104].map(y => `<circle cx="37" cy="${y}" r="1.8" fill="${INK}"/>`).join("") +
    `<path d="M14 142 L46 142" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    // 2: after the cut, two shoots from the joint
    stem("M120 226 C122 196 118 168 120 144", 2, "var(--feed)") +
    `<path d="M116 144 L124 144" stroke="${INK}" stroke-width="1.6"/>` +
    zebLeaf(121, 196, 30, 8, -160) + zebLeaf(120, 150, 30, 8, -20) +
    stem("M120 152 C110 140 104 126 100 112", 1.4, "var(--feed)") + stem("M120 152 C130 140 136 128 142 116", 1.4, "var(--feed)") +
    zebLeaf(100, 114, 14, 5, -120) + zebLeaf(142, 118, 14, 5, -60) +
    `<circle cx="120" cy="152" r="1.8" fill="${INK}"/>` +
    // 3: the cut piece rooting in a glass
    `<path d="M192 150 L196 228 L236 228 L240 150" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    `<path d="M193.5 176 L195.5 227 L236.5 227 L238.5 176 Z" fill="var(--water)" fill-opacity=".22"/>` +
    stem("M216 214 C215 180 217 150 216 112", 1.8, "var(--feed)") +
    zebLeaf(216, 132, 26, 7, -150) + zebLeaf(216, 116, 22, 7, -40) +
    `<path d="M216 214 q-6 6 -10 10 M216 214 q2 7 0 12 M216 214 q6 5 10 8" fill="none" stroke="${INK}" stroke-width=".9"/>` +
    `<text x="38" y="34" text-anchor="middle" class="pl"><tspan x="38">1. Snip just</tspan><tspan x="38" dy="10.4">above a joint</tspan></text>` +
    `<text x="122" y="34" text-anchor="middle" class="pl"><tspan x="122">2. Two new</tspan><tspan x="122" dy="10.4">shoots grow</tspan></text>` +
    `<text x="216" y="34" text-anchor="middle" class="pl"><tspan x="216">3. The cut piece</tspan><tspan x="216" dy="10.4">roots in water</tspan></text>` +
    `<text x="120" y="242" text-anchor="middle" class="pt">any time · pinching back</text>`,
    "Diagram: snip an inch plant stem just above a leaf joint; two new shoots grow from that joint, and the cut piece roots in water"),

  spiderBloom: () => plate("-26 0 330 284",
    spiderTuft(150, 172, 1.2) +
    runner([150, 170], [-6, 246], 96, { flowers: true }) + runner([150, 170], [278, 236], 92, { flowers: true, baby: true }) +
    note(150, 120, 96, 40, ["Long arching leaves,", "cream stripe down", "the middle"], "end") +
    note(237, 164, 236, 52, ["Little white", "star flowers", "on runners"]) +
    note(276, 230, 256, 270, ["A baby forms", "at the tip"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">spring to fall, flowering</text>`,
    "Textbook drawing of a spider plant: a tuft of arching striped leaves with long runners carrying small white star flowers and a baby plant at the tip", "var(--friend-bg)"),

  spiderRest: () => plate("-26 0 330 284",
    spiderTuft(150, 172, 1.2) +
    runner([150, 170], [10, 250], 90, { baby: true }) + runner([150, 170], [282, 250], 90, { baby: true }) +
    note(12, 244, -14, 116, ["Babies dangle,", "ready to pot"]) +
    note(150, 120, 214, 50, ["Leaves stay", "striped all year"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">no flowers</text>`,
    "Textbook drawing of a spider plant with baby plants dangling from runners on both sides", "var(--soil-bg)"),

  spiderSnip: () => plate("-24 0 284 246",
    spiderTuft(70, 170, 1) + runner([70, 168], [214, 206], 80, { baby: true }) +
    `<path d="M118 126 L118 162" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<g transform="translate(111 104) scale(.6)" fill="none" stroke="var(--foe)" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="19" r="4"/><circle cx="17" cy="19" r="4"/><path d="M7.5 16 L19 1 M14.5 16 L3 1"/></g>` +
    `<text x="134" y="104" class="pl snipl"><tspan x="134">Snip the runner here</tspan><tspan x="134" dy="10.4">to pot the baby</tspan></text>` +
    note(70, 172, -16, 222, ["Cut old leaves off", "right at the base"]) +
    `<text x="120" y="242" text-anchor="middle" class="pt">any time · babies and old leaves</text>`,
    "Diagram: snip a spider plant runner near the mother to pot the baby, and cut old leaves off at the base"),

  pothosVine: () => plate("-26 0 330 284",
    vine([150, 50], [60, 250], -24) + vine([150, 50], [240, 254], 26) + vine([150, 50], [150, 262], 6, [.2, .42, .64, .86]) +
    heartLeaf(150, 52, 30, -30) + heartLeaf(150, 52, 30, 30) + heartLeaf(150, 52, 26, 0) +
    note(98, 130, 52, 92, ["Heart-shaped,", "waxy leaves with", "yellow streaks"], "end") +
    note(204, 160, 212, 112, ["Little brown root", "bumps at each", "leaf joint"]) +
    note(84, 170, -14, 40, ["Long trailing", "vines"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">all year, rarely flowers</text>`,
    "Textbook drawing of a pothos: trailing vines of heart-shaped leaves streaked yellow, with small brown root bumps at each leaf joint", "var(--friend-bg)"),

  pothosSnip: () => plate("-24 0 284 246",
    stem("M40 226 C42 180 38 130 40 64", 2, "var(--leaf)") +
    heartLeaf(40, 196, 26, -70) + heartLeaf(40, 150, 26, 70) + heartLeaf(40, 104, 24, -70) + heartLeaf(40, 66, 20, 60) +
    [196, 150, 104].map(y => `<circle cx="40" cy="${y}" r="2.2" fill="var(--soil)" stroke="${INK}" stroke-width=".5"/>`).join("") +
    `<path d="M12 138 L36 138" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<path d="M150 170 L156 228 L224 228 L230 170 Z" fill="var(--soil-bg)" stroke="${INK}" stroke-width="1.2"/><path d="M146 170 L234 170" stroke="${INK}" stroke-width="2"/>` +
    stem("M176 172 C175 150 178 128 176 104", 1.6, "var(--leaf)") + heartLeaf(176, 128, 22, -65) + heartLeaf(176, 106, 20, 55) +
    stem("M204 172 C205 152 202 134 204 116", 1.6, "var(--leaf)") + heartLeaf(204, 136, 20, 60) + heartLeaf(204, 118, 18, -50) +
    `<text x="40" y="34" text-anchor="middle" class="pl"><tspan x="40">1. Snip just above</tspan><tspan x="40" dy="10.4">a root bump</tspan></text>` +
    `<text x="190" y="66" text-anchor="middle" class="pl"><tspan x="190">2. Poke cuttings back</tspan><tspan x="190" dy="10.4">into the same pot</tspan></text>` +
    `<text x="120" y="242" text-anchor="middle" class="pt">spring · making it fuller</text>`,
    "Diagram: snip a pothos vine just above a leaf joint with a root bump, then poke the cuttings back into the same pot to make it fuller"),

  tomatoBloom: () => plate("-26 0 330 284",
    stem("M150 266 C148 220 152 160 148 60", 3, "var(--leaf)") +
    tomLeaf(149, 230, 56, 200) + tomLeaf(151, 200, 56, -20) + tomLeaf(150, 160, 50, 205) + tomLeaf(149, 120, 46, -25) + tomLeaf(149, 84, 34, 210) +
    stem("M150 178 C168 176 180 182 188 196", 1.2, "var(--leaf)") + fruit(186, 206, 11, "var(--foe)") + fruit(204, 200, 9, "var(--friend)") + fruit(172, 210, 8, "var(--foe)") +
    stem("M149 104 C130 100 118 96 108 92", 1.2, "var(--leaf)") + yStar(108, 90, 9) + yStar(122, 84, 8) + yStar(96, 100, 8) +
    note(108, 90, 62, 52, ["Yellow star", "flowers in clusters"], "end") +
    note(204, 200, 224, 160, ["Fruit start green,", "ripen red"]) +
    note(122, 220, 100, 252, ["Fuzzy leaves of", "toothed leaflets"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">summer, flowering and fruiting</text>`,
    "Textbook drawing of a tomato plant: a fuzzy stem with leaves made of toothed leaflets, clusters of yellow star flowers and round fruit ripening from green to red", "var(--sun-bg)"),

  tomatoYoung: () => plate("-26 0 330 284",
    stem("M150 266 C149 230 151 190 150 150", 3, "var(--leaf)") +
    tomLeaf(150, 236, 50, 200) + tomLeaf(150, 214, 50, -20) + tomLeaf(150, 186, 44, 210) + tomLeaf(150, 166, 40, -30) + tomLeaf(150, 150, 30, -90) +
    note(110, 222, 60, 190, ["Leaves smell", "strongly when", "brushed"], "end") +
    note(150, 160, 214, 130, ["Hairy green stem"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">spring, young plant</text>`,
    "Textbook drawing of a young tomato plant with fuzzy toothed compound leaves", "var(--friend-bg)"),

  tomatoSnip: () => plate("-24 0 284 246",
    `<path d="M50 150 L60 232 L180 232 L190 150 Z" fill="var(--soil-bg)" stroke="${INK}" stroke-width="1.2"/><path d="M44 150 L196 150" stroke="${INK}" stroke-width="2"/>` +
    `<path d="M120 156 q-14 20 -30 34 M120 156 q2 26 -4 48 M120 156 q16 18 34 30 M108 176 q-8 6 -16 6 M128 180 q10 6 16 14" fill="none" stroke="var(--soil)" stroke-width="1.6" stroke-linecap="round"/>` +
    stem("M120 150 C119 120 121 80 120 40", 2.6, "var(--leaf)") + tomLeaf(120, 110, 40, 200) + tomLeaf(120, 80, 40, -20) +
    snip(96, 144, 146, [], 0) + `<text x="152" y="112" class="pl snipl"><tspan x="152">Cut at soil level</tspan><tspan x="152" dy="10.4">when it stops</tspan><tspan x="152" dy="10.4">fruiting</tspan></text>` +
    note(140, 186, 206, 206, ["Leave the roots", "to feed the soil"]) +
    `<text x="120" y="244" text-anchor="middle" class="pt">fall · end of the season</text>`,
    "Diagram: in fall, cut the tomato off at soil level and leave its roots in the pot to feed the soil"),

  basilBloom: () => plate("-26 0 330 284",
    basilPlant(true) +
    note(145, 40, 84, 22, ["Spikes of small", "white flowers in rings"], "end") +
    note(190, 200, 228, 176, ["Glossy leaves", "in opposite pairs"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">late summer, flowering</text>`,
    "Textbook drawing of basil in flower: a square stem with glossy leaves in opposite pairs, topped by spikes of small white flowers in rings", "var(--friend-bg)"),

  basilLeafy: () => plate("-26 0 330 284",
    basilPlant(false) +
    note(150, 72, 214, 40, ["New pairs of leaves", "at every tip"]) +
    note(110, 200, 60, 170, ["Soft, rounded,", "glossy leaves"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">summer, leafy</text>`,
    "Textbook drawing of leafy basil with soft rounded glossy leaves in pairs", "var(--friend-bg)"),

  basilSnip: () => plate("-24 0 284 246",
    stem("M60 236 L60 60", 2.4, "var(--leaf)") +
    basilLeaf(60, 200, 36, 200) + basilLeaf(60, 200, 36, -20) + basilLeaf(60, 150, 32, 200) + basilLeaf(60, 150, 32, -20) + basilLeaf(60, 104, 26, 220) + basilLeaf(60, 104, 26, -40) + basilLeaf(60, 64, 16, 240) + basilLeaf(60, 64, 16, -60) +
    `<path d="M40 126 L80 126" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<text x="60" y="30" text-anchor="middle" class="pl"><tspan x="60">Summer: pinch just</tspan><tspan x="60" dy="10.4">above a leaf pair</tspan></text>` +
    stem("M180 236 L180 60", 1.6, "var(--soil)") +
    basilSpike(180, 64, 160, "var(--soil-bg)") +
    `<path d="M164 172 L196 172" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<text x="180" y="30" text-anchor="middle" class="pl"><tspan x="180">Fall: once spikes are</tspan><tspan x="180" dy="10.4">brown and dry, snip</tspan><tspan x="180" dy="10.4">and rub out seeds</tspan></text>` +
    `<text x="120" y="244" text-anchor="middle" class="pt">picking and seed saving</text>`,
    "Diagram: in summer pinch basil just above a pair of leaves; in fall, once the flower spikes are brown and dry, snip them and rub out the seeds"),

  swordBloom: () => plate("-26 0 330 284",
    rosette(150, 232, 1.15, "var(--leaf)", .45, 0, false) +
    sword(150, 26, 196) +
    note(162, 80, 200, 46, ["Flat, feather-", "shaped spike of", "yellow bracts"]) +
    note(222, 190, 244, 140, ["Smooth,", "soft leaves"]) +
    note(150, 236, 214, 262, ["Leaves form a cup", "that holds water"]) +
    `<text x="150" y="280" text-anchor="middle" class="pt">flowering, once per rosette</text>`,
    "Textbook drawing of a flaming sword bromeliad: a rosette of smooth leaves forming a cup, with a flat feather-shaped yellow flower spike", "var(--sun-bg)"),

  swordRest: () => plate("-26 0 330 284",
    rosette(140, 222, 1.05, "var(--leaf)", .42, 3, false) +
    rosette(222, 250, .42, "var(--leaf)", .45, 0, false) +
    rosette(70, 254, .34, "var(--leaf)", .45, 0, false) +
    note(92, 160, 56, 120, ["Mom fades and", "browns after", "flowering"], "end") +
    note(222, 236, 226, 196, ["Babies grow", "at the base"]) +
    `<text x="40" y="280" text-anchor="middle" class="pt">after flowering</text>`,
    "Textbook drawing of a flaming sword after flowering: the mother rosette browning with baby rosettes at its base", "var(--soil-bg)"),

  pepperBloom: () => plate("-26 0 330 284",
    stem("M150 266 C150 230 150 200 150 170", 3, "var(--leaf)") +
    stem("M150 170 C136 150 120 130 104 104", 2.4, "var(--leaf)") + stem("M150 170 C164 150 182 130 196 104", 2.4, "var(--leaf)") + stem("M150 170 L150 96", 2.2, "var(--leaf)") +
    [[150, 220, 34, 200], [150, 220, 34, -20], [128, 140, 30, 220], [172, 140, 30, -40], [104, 106, 26, 230], [196, 106, 26, -50], [150, 100, 24, 250], [150, 100, 24, -70], [116, 122, 24, 160], [184, 122, 24, 20]].map(([x, y, l, d]) => basilLeaf(x, y, l, d)).join("") +
    pod(136, 150, 40, "var(--foe)", 8) + pod(166, 152, 36, "var(--friend)", -8) + pod(190, 116, 30, "var(--foe)", -14) +
    nodFlower(112, 118, 9) + nodFlower(150, 92, 8) +
    note(112, 120, 60, 70, ["Small white", "nodding flowers"], "end") +
    note(194, 140, 230, 186, ["Peppers hang", "down, green", "then red"]) +
    note(150, 222, 214, 240, ["Smooth, pointed", "glossy leaves"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">summer, flowering and fruiting</text>`,
    "Textbook drawing of a pepper plant: smooth pointed leaves, small white nodding flowers and peppers hanging down, green and red", "var(--sun-bg)"),

  pepperSeedling: () => plate("-26 0 330 284",
    `<path d="M70 240 Q150 228 230 240" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    stem("M150 238 C150 214 149 190 150 160", 2.4, "var(--leaf)") +
    basilLeaf(150, 196, 30, 190) + basilLeaf(150, 196, 30, -10) +
    basilLeaf(150, 162, 36, 235) + basilLeaf(150, 162, 36, -55) + basilLeaf(150, 160, 18, -90) +
    note(118, 196, 62, 214, ["Two narrow", "seed leaves"], "end") +
    note(170, 140, 214, 118, ["First pointed", "true leaves"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">just coming up</text>`,
    "Textbook drawing of a pepper seedling with two narrow seed leaves and its first pointed true leaves", "var(--friend-bg)"),

  pepperSnip: () => plate("-24 0 284 246",
    stem("M40 30 C80 34 110 40 140 52", 2.4, "var(--leaf)") +
    basilLeaf(70, 34, 30, -60) + basilLeaf(110, 42, 30, 210) +
    stem("M120 46 C122 56 122 64 121 74", 1.4, "var(--leaf)") +
    pod(121, 80, 86, "var(--foe)", 0) +
    `<path d="M108 68 L134 68" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<g transform="translate(138 65) scale(.6)" fill="none" stroke="var(--foe)" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="19" r="4"/><circle cx="17" cy="19" r="4"/><path d="M7.5 16 L19 1 M14.5 16 L3 1"/></g>` +
    `<text x="158" y="70" class="pl snipl"><tspan x="158">Snip the little</tspan><tspan x="158" dy="10.4">stem, don't pull</tspan></text>` +
    `<text x="158" y="130" class="pl"><tspan x="158">Pick at any color:</tspan><tspan x="158" dy="10.4">green is fine,</tspan><tspan x="158" dy="10.4">red is sweeter</tspan></text>` +
    `<text x="120" y="244" text-anchor="middle" class="pt">summer and fall · picking</text>`,
    "Diagram: snip a pepper off by its little stem instead of pulling, at any color"),

  strawBloom: () => plate("-26 0 330 284",
    `<path d="M70 236 Q150 226 230 236" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    trifol(150, 232, 70, 0) + trifol(146, 232, 60, -38) + trifol(154, 232, 60, 38) + trifol(148, 232, 44, -70) + trifol(152, 232, 44, 70) +
    stem("M150 232 C120 210 108 196 100 184", 1.2, "var(--leaf)") + whiteFlower(100, 180, 10) +
    stem("M150 232 C180 220 196 210 204 200", 1.2, "var(--leaf)") + berry(206, 210, 10) +
    stem("M150 232 C174 214 186 200 190 186", 1.2, "var(--leaf)") + whiteFlower(190, 182, 9) +
    note(96, 176, 56, 140, ["White flowers,", "yellow center"], "end") +
    note(212, 214, 226, 252, ["Red berry,", "seeds outside"]) +
    note(150, 140, 214, 92, ["Leaves in threes,", "toothed edges"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">late spring to summer</text>`,
    "Textbook drawing of a strawberry plant: leaves in threes with toothed edges, white five-petal flowers and a red berry", "var(--foe-bg)"),

  strawLeafy: () => plate("-26 0 330 284",
    `<path d="M40 236 Q150 226 260 236" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    trifol(120, 232, 60, -10) + trifol(116, 232, 50, -45) + trifol(124, 232, 50, 30) +
    stem("M124 230 C170 200 210 210 238 228", 1.1, "var(--soil)") +
    trifol(238, 230, 26, -10) + trifol(238, 230, 22, 30) +
    `<path d="M234 232 l-3 6 M238 232 l0 7 M242 232 l3 6" stroke="${INK}" stroke-width=".8"/>` +
    note(180, 206, 196, 160, ["Runner"]) +
    note(240, 214, 236, 120, ["Baby plant", "roots where", "it lands"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">summer, sending out runners</text>`,
    "Textbook drawing of a strawberry plant sending a runner out to a baby plant that roots where it lands", "var(--friend-bg)"),

  strawSnip: () => plate("-24 0 284 246",
    `<path d="M10 206 Q130 196 250 206" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    trifol(60, 202, 56, -10) + trifol(56, 202, 46, -45) + trifol(64, 202, 46, 30) +
    stem("M64 200 C110 170 170 180 210 198", 1.1, "var(--soil)") + trifol(210, 200, 26, -10) + trifol(210, 200, 22, 30) +
    `<path d="M104 166 L104 196" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<g transform="translate(97 146) scale(.6)" fill="none" stroke="var(--foe)" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="19" r="4"/><circle cx="17" cy="19" r="4"/><path d="M7.5 16 L19 1 M14.5 16 L3 1"/></g>` +
    `<text x="120" y="120" class="pl snipl"><tspan x="120">Only once the pot is full:</tspan><tspan x="120" dy="10.4">snip the runner near mom</tspan></text>` +
    `<text x="120" y="232" text-anchor="middle" class="pt">otherwise let them root</text>`,
    "Diagram: once the pot is full, snip a strawberry runner near the mother plant; otherwise let runners root"),
  onionBloom: () => plate("-26 0 330 284",
    `<path d="M60 236 Q150 226 240 236" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    onionClump(150, 232) + scape(140, 216, 70, 1.4) + scape(164, 216, 92, 1.2) + umbel(140, 60, 15) + umbel(164, 82, 13) +
    note(127, 56, 70, 40, ["Ball of tiny", "cream flowers"], "end") +
    note(165, 150, 232, 150, ["Hollow round", "leaves"]) +
    note(138, 228, 70, 210, ["Slim white base,", "no big bulb"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">late spring to summer</text>`,
    "Textbook drawing of a green onion in bloom: hollow round leaves, slim white bases and round balls of tiny cream flowers on tall stalks", "var(--sun-bg)"),

  onionLeafy: () => plate("-26 0 330 284",
    `<path d="M60 236 Q150 226 240 236" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    onionClump(150, 232) +
    note(165, 150, 232, 150, ["Hollow round", "leaves"]) +
    note(138, 228, 70, 210, ["Slim white base,", "no big bulb"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">most of the year</text>`,
    "Textbook drawing of a green onion: a clump of upright hollow round leaves from slim white bases", "var(--friend-bg)"),

  onionSnip: () => plate("-24 0 284 246",
    `<path d="M40 206 Q120 198 200 206" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    onionClump(120, 202, .82) +
    snip(84, 150, 168, [], 0) + `<text x="168" y="152" class="pl snipl"><tspan x="168">Cut a finger's</tspan><tspan x="168" dy="10.4">width above</tspan><tspan x="168" dy="10.4">the soil</tspan></text>` +
    note(128, 202, 176, 226, ["It regrows", "from the base"]) +
    `<text x="120" y="244" text-anchor="middle" class="pt">any time you want some</text>`,
    "Diagram: cut green onion leaves a finger's width above the soil; it regrows from the base"),
  monsteraVine: () => plate("-36 0 350 284",
    monsVine([150, 46], [64, 254], -26) + monsVine([150, 46], [236, 258], 24) + monsVine([150, 46], [152, 266], 6, [.22, .46, .7, .92]) +
    holeLeaf(150, 50, 36, -32) + holeLeaf(150, 50, 36, 30) +
    note(196, 156, 232, 120, ["Oval holes", "between veins"]) +
    note(116, 150, 46, 110, ["Pointed, slightly", "lopsided leaves"], "end") +
    note(203, 214, 256, 190, ["Thin brown", "air roots"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">all year, rarely flowers</text>`,
    "Textbook drawing of a Monstera adansonii: trailing vines of pointed oval leaves with oval holes, and thin brown air roots at each leaf joint", "var(--friend-bg)"),

  monsteraSnip: () => plate("-24 0 284 246",
    stem("M40 226 C42 180 38 130 40 64", 2, "var(--leaf)") +
    holeLeaf(40, 196, 30, -68) + holeLeaf(40, 150, 30, 68) + holeLeaf(40, 104, 28, -68) + holeLeaf(40, 66, 24, 60) +
    [196, 150, 104].map((y, i) => `<path d="M40 ${y} q${i % 2 ? -3 : 3} 7 ${i % 2 ? -1 : 1} 14" fill="none" stroke="var(--soil)" stroke-width="1.1" stroke-linecap="round"/>`).join("") +
    `<path d="M12 138 L36 138" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<path d="M150 170 L156 228 L224 228 L230 170 Z" fill="var(--soil-bg)" stroke="${INK}" stroke-width="1.2"/><path d="M146 170 L234 170" stroke="${INK}" stroke-width="2"/>` +
    stem("M176 172 C175 150 178 128 176 104", 1.6, "var(--leaf)") + holeLeaf(176, 130, 24, -62) + holeLeaf(176, 108, 22, 55) +
    stem("M204 172 C205 152 202 134 204 116", 1.6, "var(--leaf)") + holeLeaf(204, 138, 22, 60) + holeLeaf(204, 120, 20, -50) +
    `<text x="40" y="34" text-anchor="middle" class="pl"><tspan x="40">1. Snip just above</tspan><tspan x="40" dy="10.4">an air root</tspan></text>` +
    `<text x="190" y="66" text-anchor="middle" class="pl"><tspan x="190">2. Poke cuttings back</tspan><tspan x="190" dy="10.4">into the same pot</tspan></text>` +
    `<text x="120" y="242" text-anchor="middle" class="pt">whenever it gets too long</text>`,
    "Diagram: snip a Monstera adansonii vine just above an air root, then poke the cuttings back into the same pot"),
  gingerPlant: () => plate("-46 0 370 284",
    gingerStalk(130, 222, 170, -14) + gingerStalk(156, 224, 196, 6, 7) + gingerStalk(178, 222, 150, 22) +
    rhizome(152, 228) +
    `<path d="M50 232 Q150 224 250 232" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    note(206, 120, 244, 84, ["Long, narrow", "leaves, two rows"]) +
    note(128, 176, 60, 150, ["Reed-like", "stalks"], "end") +
    note(186, 233, 222, 256, ["Knobbly root:", "the ginger you eat"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">spring to fall, rarely flowers</text>`,
    "Textbook drawing of a ginger plant: reed-like stalks with long narrow leaves in two rows, rising from a knobbly tan root at the soil surface", "var(--sun-bg)"),

  gingerSnip: () => plate("-24 0 284 246",
    `<path d="M30 140 L40 214 L200 214 L210 140 Z" fill="var(--soil-bg)" stroke="${INK}" stroke-width="1.2"/><path d="M24 140 L216 140" stroke="${INK}" stroke-width="2"/>` +
    stem("M110 146 C108 110 112 80 110 50", 1.6, "var(--leaf)") + stem("M130 146 C132 116 128 96 132 70", 1.6, "var(--leaf)") +
    lanceLeaf(110, 80, 34, 4, -150, 6) + lanceLeaf(110, 64, 30, 4, -30, 6) + lanceLeaf(131, 96, 32, 4, -30, 6) +
    rhizome(118, 150, .9) +
    `<path d="M152 132 L152 166" stroke="var(--foe)" stroke-width="1.6" stroke-dasharray="4 3"/>` +
    `<text x="164" y="100" class="pl snipl"><tspan x="164">Break off a piece</tspan><tspan x="164" dy="10.4">at the pot's edge</tspan></text>` +
    note(100, 154, 84, 122, ["Leave the rest", "to keep growing"], "end") +
    `<text x="120" y="236" text-anchor="middle" class="pt">harvest · late summer to fall</text>`,
    "Diagram: break off a piece of ginger root at the edge of the pot and leave the rest to keep growing"),
  lavenderBloom: () => plate("-26 0 330 284",
    `<path d="M60 238 Q150 230 240 238" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    lavBush(true) +
    note(140, 76, 80, 50, ["Spikes of tiny", "purple flowers"], "end") +
    note(200, 200, 238, 176, ["Narrow grey-", "green leaves"]) +
    note(146, 228, 56, 252, ["Woody grey", "base"], "end") +
    `<text x="150" y="280" text-anchor="middle" class="pt">early to late summer</text>`,
    "Textbook drawing of lavender in flower: a woody grey base, tufts of narrow grey-green leaves and long stalks topped with spikes of tiny purple flowers", "var(--feed-bg)"),

  lavenderRest: () => plate("-26 0 330 284",
    `<path d="M60 238 Q150 230 240 238" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    lavBush(false) +
    note(200, 200, 238, 176, ["Narrow grey-", "green leaves"]) +
    note(146, 228, 56, 252, ["Woody grey", "base"], "end") +
    `<text x="150" y="280" text-anchor="middle" class="pt">fall to spring, a grey-green mound</text>`,
    "Textbook drawing of lavender out of flower: a low mound of narrow grey-green leaves on a woody grey base", "var(--friend-bg)"),

  lavenderSnip: () => plate("-24 0 284 246",
    `<path d="M40 214 Q120 206 200 214" fill="none" stroke="var(--soil)" stroke-width="3"/>` +
    lavBush(true, .78, 110, 212) +
    snip(40, 172, 156, [], 0) + `<text x="190" y="142" class="pl snipl"><tspan x="190">Cut off the old</tspan><tspan x="190" dy="10.4">flower stalks, just</tspan><tspan x="190" dy="10.4">into the leaves</tspan></text>` +
    note(112, 200, 176, 196, ["Never into the", "woody grey stem"]) +
    `<text x="120" y="238" text-anchor="middle" class="pt">late summer · after the bees are done</text>`,
    "Diagram: after flowering, cut lavender back by a third, staying in the green leafy part and never into the woody grey stem"),
  jasmineBloom: () => plate("-36 0 350 284",
    `<path d="M150 266 L150 30" stroke="#b8a888" stroke-width="2.4"/><path d="M110 266 L190 266" stroke="var(--soil)" stroke-width="3"/>` +
    jasVine([150, 262], [110, 160], [168, 40], [.18, .38, .58, .78], [[.5, 3], [.92, 4]]) +
    jasVine([150, 262], [210, 190], [218, 110], [.3, .5, .7], [[.86, 3]]) +
    jasVine([150, 262], [96, 214], [84, 130], [.4, .62], [[.84, 3]]) +
    note(150, 92, 72, 64, ["White pinwheel", "flowers, sweet", "scent at night"], "end") +
    note(124, 220, 50, 236, ["Glossy dark", "leaves in pairs"], "end") +
    note(212, 168, 244, 190, ["Woody, twining", "stems"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">early to mid summer</text>`,
    "Textbook drawing of star jasmine in flower: woody twining stems with glossy dark oval leaves in pairs and clusters of white pinwheel-shaped flowers", "var(--water-bg)"),

  jasmineRest: () => plate("-36 0 350 284",
    `<path d="M150 266 L150 30" stroke="#b8a888" stroke-width="2.4"/><path d="M110 266 L190 266" stroke="var(--soil)" stroke-width="3"/>` +
    jasVine([150, 262], [110, 160], [168, 40], [.18, .38, .58, .78, .94]) +
    jasVine([150, 262], [210, 190], [218, 110], [.3, .5, .7, .9]) +
    jasVine([150, 262], [96, 214], [84, 130], [.4, .62, .86]) +
    note(124, 220, 50, 236, ["Glossy dark", "leaves in pairs"], "end") +
    note(212, 168, 244, 190, ["Woody, twining", "stems"]) +
    `<text x="150" y="282" text-anchor="middle" class="pt">fall to spring, evergreen</text>`,
    "Textbook drawing of star jasmine out of flower: woody twining stems with glossy dark oval leaves in pairs, green all year", "var(--friend-bg)"),

  jasmineSnip: () => plate("-24 0 284 246",
    jasVine([60, 220], [70, 140], [150, 70], [.2, .45, .7, .92], null, .9) +
    snip(86, 122, 128, [], 0) + `<text x="144" y="116" class="pl snipl"><tspan x="144">Only if it's in the</tspan><tspan x="144" dy="10.4">way: snip just</tspan><tspan x="144" dy="10.4">above a leaf pair</tspan></text>` +
    `<text x="120" y="244" text-anchor="middle" class="pt">summer · right after flowering</text>`,
    "Diagram: right after flowering, snip a stray star jasmine shoot just above a pair of leaves, only if it's in the way"),
  mgBloom: () => plate("-36 0 350 284",
    mgPlant(true) +
    note(200, 70, 232, 46, ["Trumpet flowers,", "open mornings"]) +
    note(122, 200, 52, 214, ["Heart-shaped", "leaves"], "end") +
    note(197, 236, 236, 250, ["Round seed", "pods"]) +
    note(150, 26, 80, 30, ["Twines up", "any support"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">summer to fall</text>`,
    "Textbook drawing of a morning glory in flower: a twining vine of heart-shaped leaves with purple trumpet flowers and round seed pods", "var(--feed-bg)"),

  mgRest: () => plate("-36 0 350 284",
    mgPlant(false) +
    note(122, 200, 52, 214, ["Heart-shaped", "leaves"], "end") +
    note(150, 26, 80, 30, ["Twines up", "any support"], "end") +
    `<text x="150" y="282" text-anchor="middle" class="pt">spring, climbing</text>`,
    "Textbook drawing of a morning glory out of flower: a twining vine of heart-shaped leaves climbing a support", "var(--friend-bg)"),

  mgWait: () => plate("-24 0 284 246",
    `<path d="M30 206 L210 206" stroke="var(--soil)" stroke-width="3"/>` +
    `<path d="M70 204 C66 160 76 120 68 80 C62 56 72 40 66 26" fill="none" stroke="#a89878" stroke-width="2"/><path d="M68 120 q-14 -6 -18 -18 M70 90 q12 -4 16 -16" fill="none" stroke="#a89878" stroke-width="1.2"/>` +
    `<text x="66" y="224" text-anchor="middle" class="pt"><tspan x="66">winter: leave</tspan><tspan x="66" dy="10">it standing</tspan></text>` +
    `<path d="M108 120 L128 120" stroke="${INK}" stroke-width="1.2"/><path d="M124 116 L128 120 L124 124" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    stem("M172 204 C170 186 174 172 172 160", 1.2, "var(--leaf)") + mgLeaf(172, 176, 16, -60) + mgLeaf(172, 164, 14, 55) +
    `<text x="172" y="120" text-anchor="middle" class="pl"><tspan x="172">Sprouts from the</tspan><tspan x="172" dy="10.4">base in spring?</tspan><tspan x="172" dy="10.4">It's the perennial.</tspan></text>` +
    `<text x="172" y="224" text-anchor="middle" class="pt"><tspan x="172">nothing back? it was</tspan><tspan x="172" dy="10">the annual: pull it then</tspan></text>`,
    "Diagram: leave the dead morning glory vine standing over winter; if it sprouts from the base in spring it's the perennial, if not it was the annual"),
  succBox: () => plate("-36 0 350 284",
    `<path d="M-4 236 L8 262 L292 262 L304 236 Z" fill="var(--soil-bg)" stroke="${INK}" stroke-width="1.2"/><path d="M-10 236 L310 236" stroke="${INK}" stroke-width="2"/>` +
    stem("M44 234 C42 200 48 170 46 130", 2.4, "#9b8a74") + stem("M46 190 Q30 180 24 160", 1.8, "#9b8a74") +
    rosetteSide(46, 132, 30, "var(--leaf)", "var(--pink)") + rosetteSide(24, 160, 18, "var(--leaf)", "var(--pink)") +
    pineCrassula(104, 234, 96) +
    rosetteSide(160, 232, 20, "#d9c7e4", "var(--feed)") + rosetteSide(178, 234, 13, "#d9c7e4", "var(--feed)") +
    oxTongue(216, 234, -14, 52) + oxTongue(226, 234, 18, 44) +
    [-26, -12, 0, 12, 26].map((d, i) => zebraLeaf(270, 234, d, 34 + (i % 2) * 8)).join("") +
    note(52, 108, 64, 58, ["Aeonium:", "rosettes on", "woody stems"]) +
    note(110, 140, 120, 96, ["Pine tree", "crassula"]) +
    note(160, 214, 172, 176, ["Ghost plant"]) +
    note(220, 196, 226, 140, ["Ox tongue:", "white freckles"]) +
    note(272, 200, 280, 166, ["Zebra", "plant"]) +
    `<text x="150" y="280" text-anchor="middle" class="pt">all year, east balcony box</text>`,
    "Textbook drawing of the succulent box: aeonium rosettes on woody stems, a pine-tree crassula, pale lilac ghost plant rosettes, freckled ox tongue leaves and a white-striped zebra plant", "var(--friend-bg)"),

  succSnip: () => plate("-24 0 284 246",
    `<path d="M20 200 L220 200" stroke="var(--soil)" stroke-width="3"/>` +
    `<g transform="translate(48 196) rotate(-80)"><path d="M0 0 C-6 -4 -6 -20 0 -26 C6 -20 6 -4 0 0 Z" fill="#d9c7e4" stroke="${INK}" stroke-width=".8"/></g>` +
    `<text x="48" y="226" text-anchor="middle" class="pt"><tspan x="48">a leaf drops</tspan></text>` +
    `<path d="M84 180 L104 180" stroke="${INK}" stroke-width="1.2"/><path d="M100 176 L104 180 L100 184" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    `<g transform="translate(150 196) rotate(-80)"><path d="M0 0 C-6 -4 -6 -20 0 -26 C6 -20 6 -4 0 0 Z" fill="#d9c7e4" stroke="${INK}" stroke-width=".8"/></g>` +
    `<path d="M150 198 l-4 10 M151 198 l1 12 M152 198 l5 9" stroke="var(--soil)" stroke-width=".8"/>` + rosetteSide(152, 192, 8, "#d9c7e4", "var(--feed)") +
    `<text x="160" y="226" text-anchor="middle" class="pt"><tspan x="160">it roots and makes a baby</tspan></text>` +
    `<text x="120" y="150" text-anchor="middle" class="pl"><tspan x="120">Let fallen leaves and broken</tspan><tspan x="120" dy="10.4">bits root where they land</tspan></text>`,
    "Diagram: a fallen succulent leaf left on the soil roots and grows a baby rosette"),
};
