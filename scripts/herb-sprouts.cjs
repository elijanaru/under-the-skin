// Whimsical storybook herb sprouts for the apothecary garden. viewBox 0 0 100 170, soil line ~ y 122 (roots below).
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const f = n => +(+n).toFixed(2);
let defs, gid, cache;
const reset = () => { defs = []; gid = 0; cache = {}; };
function lg(stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
  const k = 'l' + JSON.stringify([stops, x1, y1, x2, y2]); if (cache[k]) return cache[k];
  const id = 'g' + gid++; defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`);
  return (cache[k] = `url(#${id})`);
}
function rg(stops, cx = .36, cy = .3, r = .78) {
  const k = 'r' + JSON.stringify([stops, cx, cy, r]); if (cache[k]) return cache[k];
  const id = 'g' + gid++; defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`);
  return (cache[k] = `url(#${id})`);
}
const LEAF = () => lg([[0, '#d9efaa'], [.45, '#97c766'], [1, '#5b9140']]);
const LEAF_D = () => lg([[0, '#b6e08c'], [.5, '#62a14a'], [1, '#2f6a33']]);
const INK = '#3f6430';
// quadratic bezier helpers: point + heading (0 = straight up, clockwise degrees)
const qb = (P, t) => { const [a, b, c] = P; const u = 1 - t;
  const x = u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], y = u * u * a[1] + 2 * u * t * b[1] + t * t * c[1];
  const dx = 2 * u * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), dy = 2 * u * (b[1] - a[1]) + 2 * t * (c[1] - b[1]);
  return [x, y, Math.atan2(dx, -dy) * 180 / Math.PI]; };
const qd = P => `M${f(P[0][0])} ${f(P[0][1])} Q${f(P[1][0])} ${f(P[1][1])} ${f(P[2][0])} ${f(P[2][1])}`;
const stem = (d, w, c, hi, o = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${o}/>` +
  (hi ? `<path d="${d}" fill="none" stroke="${hi}" stroke-width="${f(w * .32)}" stroke-linecap="round" opacity=".6" transform="translate(${f(-w * .2)} 0)"/>` : '');
function leaf(x, y, a, L, W, o = {}) {
  const p = `M0 0C${f(W * .95)} ${f(-L * .2)} ${f(W * .8)} ${f(-L * .78)} 0 ${f(-L)}C${f(-W * .8)} ${f(-L * .78)} ${f(-W * .95)} ${f(-L * .2)} 0 0Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="${p}" fill="${o.fill || LEAF()}" stroke="${o.stroke || INK}" stroke-width="${o.sw || .6}" stroke-linejoin="round"/>` +
    (o.vein === false ? '' : `<path d="M0 ${f(-L * .1)}Q${f(W * .14)} ${f(-L * .5)} 0 ${f(-L * .84)}" fill="none" stroke="${o.veinC || '#f1fadf'}" stroke-width="${f(Math.max(.5, W * .1))}" stroke-linecap="round" opacity=".85"/>`) +
    (o.veins3 ? `<path d="M0 ${f(-L * .12)}Q${f(W * .55)} ${f(-L * .45)} ${f(W * .18)} ${f(-L * .8)}M0 ${f(-L * .12)}Q${f(-W * .55)} ${f(-L * .45)} ${f(-W * .18)} ${f(-L * .8)}" fill="none" stroke="${o.veinC || '#f1fadf'}" stroke-width=".5" opacity=".75"/>` : '') +
    `<ellipse cx="${f(-W * .34)}" cy="${f(-L * .56)}" rx="${f(W * .13)}" ry="${f(L * .15)}" fill="#fff" opacity=".35"/></g>`;
}
function heart(x, y, a, s, fill) {
  const p = `M0 0C${f(-s * .9)} ${f(-s * .45)} ${f(-s * 1.05)} ${f(-s * 1.25)} ${f(-s * .5)} ${f(-s * 1.3)}C${f(-s * .2)} ${f(-s * 1.32)} 0 ${f(-s * 1.1)} 0 ${f(-s * .95)}C0 ${f(-s * 1.1)} ${f(s * .2)} ${f(-s * 1.32)} ${f(s * .5)} ${f(-s * 1.3)}C${f(s * 1.05)} ${f(-s * 1.25)} ${f(s * .9)} ${f(-s * .45)} 0 0Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="${p}" fill="${fill || LEAF()}" stroke="${INK}" stroke-width=".6" stroke-linejoin="round"/><path d="M0 ${f(-s * .1)}L0 ${f(-s * .85)}" stroke="#f1fadf" stroke-width=".6" stroke-linecap="round" opacity=".85"/><ellipse cx="${f(-s * .5)}" cy="${f(-s * .95)}" rx="${f(s * .14)}" ry="${f(s * .22)}" fill="#fff" opacity=".35"/></g>`;
}
function berry(x, y, rx, ry, pal, o = {}) {
  return (o.stalk ? `<path d="M${f(x)} ${f(y - ry + .5)}Q${f(x + (o.bend || 1.5))} ${f(y - ry - o.stalk * .6)} ${f(x + (o.sx || 0))} ${f(y - ry - o.stalk)}" fill="none" stroke="${o.stalkC || '#6f8f3c'}" stroke-width=".8" stroke-linecap="round"/>` : '') +
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${rg(pal)}" stroke="${o.stroke || 'rgba(90,20,20,.45)'}" stroke-width=".5" ${o.rot ? `transform="rotate(${o.rot} ${f(x)} ${f(y)})"` : ''}/>` +
    `<ellipse cx="${f(x - rx * .35)}" cy="${f(y - ry * .38)}" rx="${f(rx * .26)}" ry="${f(ry * .2)}" fill="#fff" opacity=".75"/><circle cx="${f(x + rx * .3)}" cy="${f(y + ry * .35)}" r="${f(rx * .08)}" fill="#fff" opacity=".35"/>`;
}
function spark(x, y, s, c = '#fff', op = 1) {
  const k = s * .14;
  return `<path d="M${f(x)} ${f(y - s)}C${f(x + k)} ${f(y - k)} ${f(x + k)} ${f(y - k)} ${f(x + s)} ${f(y)}C${f(x + k)} ${f(y + k)} ${f(x + k)} ${f(y + k)} ${f(x)} ${f(y + s)}C${f(x - k)} ${f(y + k)} ${f(x - k)} ${f(y + k)} ${f(x - s)} ${f(y)}C${f(x - k)} ${f(y - k)} ${f(x - k)} ${f(y - k)} ${f(x)} ${f(y - s)}Z" fill="${c}" opacity="${op}"/>`;
}
const sparks = list => list.map(([x, y, s, c], i) => spark(x, y, s, c || (i % 2 ? '#f6b8cb' : '#f2cf6b'), 1)).join('');
function flower5(x, y, r, petal, center = '#ffd86b', rot = 0) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${f(-r * .62)}" rx="${f(r * .42)}" ry="${f(r * .62)}" fill="${petal}" stroke="rgba(80,50,90,.35)" stroke-width=".4" transform="rotate(${i * 72})"/>`;
  return s + `<circle r="${f(r * .3)}" fill="${center}"/></g>`;
}
// roots: a soft fan of curly roots with a few hairs
function roots(x, y, n = 6, len = 36, spread = 22, c = '#b98d63', c2 = '#d9b88f') {
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) - .5 : 0, sg = t < 0 ? -1 : t > 0 ? 1 : (i % 2 ? 1 : -1);
    const ex = x + t * spread * 2, ey = y + len * (.78 + .22 * Math.cos(t * 2.4));
    const d = `M${f(x + t * 3)} ${f(y)}C${f(x + t * spread * .4)} ${f(y + len * .4)} ${f(ex - t * spread * .3)} ${f(ey - len * .45)} ${f(ex)} ${f(ey)}q${f(sg * .4)} 2.6 ${f(sg * 2.6)} 3.2`;
    s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f(1.8 - Math.abs(t) * 1)}" stroke-linecap="round"/>`;
    const hx = x + t * spread * .9, hy = y + len * .45;
    s += `<path d="M${f(hx)} ${f(hy)}q${f(sg * 2.4)} 1 ${f(sg * 4)} 4.5M${f(x + t * spread * 1.5)} ${f(y + len * .68)}q${f(sg * 1.8)} .6 ${f(sg * 3)} 3.4" fill="none" stroke="${c2}" stroke-width=".6" stroke-linecap="round"/>`;
  }
  return s;
}
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170"><defs>${defs.join('')}</defs>${body}</svg>`;

const P = {};
// ---- Astragalus: feathery leaflet sprays, butter-yellow pea bells, a creamy taproot ----
P.astragalus = () => {
  let b = '', top = '';
  const root = lg([[0, '#fff6e4'], [.6, '#efdcb6'], [1, '#d6b98a']], 0, 0, 1, 0);
  b += `<path d="M43.5 118C43 134 46.5 151 49.5 167C52.5 151 57 134 56.5 118Z" fill="${root}" stroke="#c4a374" stroke-width=".7"/>`;
  b += `<path d="M45.5 128q4.5 1.2 9 0M46.5 138q3.5 1 7 0M47.5 148q2.5.8 5 0" fill="none" stroke="#caa97c" stroke-width=".55" stroke-linecap="round"/>`;
  b += roots(48, 136, 3, 18, 12, '#c9a87c', '#e2c9a2') + roots(52, 148, 2, 14, 10, '#c9a87c', '#e2c9a2');
  const S = [[[50, 121], [36, 84], [17, 40]], [[50, 121], [42, 70], [33, 22]], [[50, 121], [53, 66], [54, 12]], [[50, 121], [60, 72], [72, 24]], [[50, 121], [66, 88], [86, 44]]];
  S.forEach((s, k) => {
    b += stem(qd(s), 1.5, '#6c9a44', '#c3e39a');
    for (let t = .3; t <= .93; t += .09) { const [x, y, a] = qb(s, t), sz = 1 - t * .35;
      b += leaf(x, y, a - 62, 6.6 * sz, 3.4 * sz, { vein: false, sw: .45 }) + leaf(x, y, a + 62, 6.6 * sz, 3.4 * sz, { vein: false, sw: .45 }); }
    const [x, y] = qb(s, 1);
    b += leaf(x, y, qb(s, .98)[2], 5.5, 3, { vein: false, sw: .45 });
    const bell = lg([[0, '#fffbe0'], [.6, '#fbe07c'], [1, '#e7b844']]);
    [[-4, -3, -30], [4, -3.5, 25], [0, -7, 0], [-3.5, 2, -55], [4, 2, 55]].forEach(([dx, dy, r]) =>
      top += `<path transform="translate(${f(x + dx)} ${f(y + dy)}) rotate(${r})" d="M0 -3.4C2.4 -3.4 2.8 0 2.2 2.4C1 3.6 -1 3.6 -2.2 2.4C-2.8 0 -2.4 -3.4 0 -3.4Z" fill="${bell}" stroke="#c99a35" stroke-width=".45"/>`);
  });
  b += `<ellipse cx="50" cy="120.5" rx="6.5" ry="2.4" fill="#7da653"/>`;
  return b + top + sparks([[12, 22, 2.6], [90, 18, 3.2, '#f6d77a'], [80, 60, 2], [20, 68, 1.8, '#f6d77a']]);
};
// ---- Red dates (jujube): a little tree with glossy leaves and plump ruby dates ----
P['red-dates'] = () => {
  let b = roots(50, 122, 6, 36, 22);
  b += stem('M50 123C47 106 54 92 50 76C47 62 52 46 51 28', 4.6, '#7f5838', '#c79a6e');
  const B = [[[50, 86], [36, 80], [20, 66]], [[50, 76], [66, 70], [82, 56]], [[50, 58], [38, 50], [24, 34]], [[51, 50], [64, 42], [76, 26]], [[51, 30], [50, 22], [52, 12]]];
  B.forEach(s => { b += stem(qd(s), 2, '#7f5838', '#c79a6e');
    for (let t = .35; t <= 1.01; t += .22) { const [x, y, a] = qb(s, t); b += leaf(x, y, a + (t * 100 % 2 > 1 ? 70 : -70), 9, 4.8); }
    const [x, y, a] = qb(s, 1); b += leaf(x, y, a, 8.5, 4.6); });
  const pal = [[0, '#ffb4a2'], [.4, '#e0463f'], [1, '#8d1d24']];
  [[24, 74, 0], [80, 64, 0], [30, 44, 0], [72, 36, 0], [62, 80, 0]].forEach(([x, y]) => { b += berry(x, y, 5, 6.4, pal, { stalk: 4, stalkC: '#7f5838' }); });
  [[40, 30], [60, 18]].forEach(([x, y]) => b += flower5(x, y, 2.6, '#eef3b5', '#c9d65a'));
  return b + sparks([[14, 40, 2.4], [88, 30, 3, '#f6d77a'], [46, 10, 2]]);
};
// ---- Ginger: reedy stems with long ribbon leaves over a chubby golden rhizome ----
P.ginger = () => {
  let b = roots(48, 132, 5, 26, 16, '#c79a63', '#e2c28f');
  const S = [[[38, 118], [30, 74], [20, 24]], [[45, 116], [44, 66], [40, 12]], [[54, 116], [58, 66], [62, 14]], [[62, 118], [72, 78], [82, 28]]];
  S.forEach((s, k) => { b += stem(qd(s), 1.7, '#7aa84c', '#d3eba6');
    for (let t = .3, j = k; t <= .96; t += .16, j++) { const [x, y, a] = qb(s, t); b += leaf(x, y, a + (j % 2 ? 42 : -42), 22 * (1 - t * .3), 4, { fill: LEAF_D() }); } });
  const rh = rg([[0, '#fff0c9'], [.55, '#e6bd78'], [1, '#b98442']], .4, .3, .9);
  [[36, 121, 7.5, 5.5, -15], [47, 124, 8.5, 6.5, 5], [58, 121, 8, 6, 15], [42, 131, 6.5, 5, -25], [55, 131, 6.5, 5, 25], [66, 126, 5, 4, 35]].forEach(([x, y, rx, ry, r]) =>
    b += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="${rh}" stroke="#a8773c" stroke-width=".6"/><path d="M${x - rx * .6} ${y - 1}q${rx * .6} 1.6 ${rx * 1.2} 0" fill="none" stroke="#c9985a" stroke-width=".5"/><ellipse cx="${f(x - rx * .35)}" cy="${f(y - ry * .4)}" rx="${f(rx * .25)}" ry="${f(ry * .18)}" fill="#fff" opacity=".55"/>`);
  [[30, 117], [69, 122], [50, 117.5]].forEach(([x, y]) => b += `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.5" fill="#f4a7a2"/>`);
  return b + sparks([[12, 50, 2.4, '#f6d77a'], [88, 14, 3], [52, 6, 2]]);
};
// ---- Clove: glossy evergreen sapling crowned with coral bud bouquets ----
P.clove = () => {
  let b = roots(50, 122, 6, 36, 22);
  b += stem('M50 123C48 104 53 88 50 70C48 58 51 48 50 38', 4, '#7f5838', '#c79a6e');
  const B = [[[50, 92], [38, 84], [30, 66]], [[50, 84], [62, 76], [70, 60]], [[50, 62], [44, 50], [34, 40]], [[50, 58], [58, 48], [66, 36]]];
  B.forEach(s => { b += stem(qd(s), 1.8, '#7f5838', '#c79a6e'); });
  [[50, 100, -60], [50, 96, 62], [30, 66, -30], [70, 60, 32], [36, 74, -95], [64, 70, 95], [50, 76, -50], [50, 70, 48]].forEach(([x, y, a]) => b += leaf(x, y, a, 15, 6, { fill: LEAF_D() }));
  const bud = lg([[0, '#ffb595'], [1, '#d4553f']]), head = rg([[0, '#ffe3d2'], [.6, '#f29b84'], [1, '#c85a46']]);
  const cluster = (cx, cy, n, sp) => { let s = ''; for (let i = 0; i < n; i++) { const a = -sp / 2 + sp * i / (n - 1), r = a * Math.PI / 180, L = 9 + (i % 2) * 2;
    const tx = cx + Math.sin(r) * L, ty = cy - Math.cos(r) * L;
    s += `<path d="M${cx} ${cy}L${f(tx)} ${f(ty)}" stroke="${bud}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${f(tx)}" cy="${f(ty)}" r="2.1" fill="${head}" stroke="#b34b3a" stroke-width=".4"/><path d="M${f(tx - 1.4)} ${f(ty + .6)}l1.4 -1.6 1.4 1.6" fill="none" stroke="#d46a52" stroke-width=".5"/>`; }
    return s; };
  b += cluster(50, 38, 6, 120) + cluster(34, 40, 4, 90) + cluster(66, 36, 4, 90);
  return b + sparks([[16, 30, 2.6, '#f6d77a'], [86, 22, 2.2], [82, 84, 2]]);
};
// ---- Cinnamon: curly-barked sapling, rosy new leaves on top ----
P.cinnamon = () => {
  let b = roots(50, 122, 6, 36, 22);
  const bark = lg([[0, '#b8714a'], [1, '#7a3f25']], 0, 0, 1, 0);
  b += stem('M50 123C48 104 53 86 50 66C49 52 51 40 50 28', 5, '#8e4b2c', '#d4936a');
  // little curled bark scrolls
  [[50.5, 104, 1], [49.5, 84, -1]].forEach(([x, y, s]) => b += `<path d="M${x} ${y}c${3 * s} -1 ${5 * s} 1 ${4.5 * s} 3.5c-.5 2 ${-3 * s} 2.2 ${-3.4 * s} .4c-.3 -1.4 ${1 * s} -2 ${1.8 * s} -1.2" fill="none" stroke="#e0a77c" stroke-width="1" stroke-linecap="round"/>`);
  const old = LEAF_D(), young = lg([[0, '#ffd9cc'], [.5, '#f29a86'], [1, '#c8604c']]);
  const SB = [[[50, 80], [36, 72], [24, 56]], [[50, 62], [64, 54], [76, 40]]];
  SB.forEach(sb => { b += stem(qd(sb), 2, '#8e4b2c', '#d4936a'); [[.45, -70], [.5, 70], [1, 0]].forEach(([t, o]) => { const [x, y, a] = qb(sb, t); b += leaf(x, y, a + o, t === 1 ? 14 : 13, 6, { fill: t === 1 && sb === SB[1] ? young : old, veins3: true, stroke: t === 1 && sb === SB[1] ? '#a5493a' : INK, veinC: t === 1 && sb === SB[1] ? '#ffe9e2' : '#eef8da' }); }); });
  [[50, 96, -64, 16, 7, old], [50, 92, 66, 16, 7, old], [50, 72, -58, 15, 6.5, old], [50, 68, 60, 15, 6.5, old], [50, 50, -48, 13, 6, young], [50, 47, 50, 13, 6, young], [50, 32, -22, 11, 5, young], [50, 31, 24, 11, 5, young]]
    .forEach(([x, y, a, L, W, fill]) => b += leaf(x, y, a, L, W, { fill, veins3: true, stroke: fill === young ? '#a5493a' : INK, veinC: fill === young ? '#ffe9e2' : '#eef8da' }));
  b += `<ellipse cx="50" cy="26" rx="2" ry="3.4" fill="${young}" stroke="#a5493a" stroke-width=".5"/>`;
  return b + sparks([[20, 40, 2.6], [82, 30, 3, '#f6d77a'], [80, 80, 2]]);
};
// ---- Goji: arching wands, lilac star flowers, glossy orange-red teardrops ----
P.goji = () => {
  let b = roots(50, 122, 6, 36, 22);
  const S = [[[50, 122], [24, 84], [14, 40]], [[50, 122], [46, 66], [52, 14]], [[50, 122], [80, 82], [88, 40]]];
  S.forEach((s, k) => { b += stem(qd(s), 1.7, '#8f7552', '#d7bf98');
    for (let t = .28, j = k; t <= .98; t += .12, j++) { const [x, y, a] = qb(s, t); b += leaf(x, y, a + (j % 2 ? 55 : -55), 9.5 * (1 - t * .25), 3.2); } });
  const pal = [[0, '#ffd2a8'], [.45, '#f6643c'], [1, '#b42f1d']];
  [[0, .52, 1], [0, .74, -1], [1, .44, 1], [1, .68, -1], [2, .5, -1], [2, .74, 1]].forEach(([k, t, s]) => { const [x, y] = qb(S[k], t);
    b += berry(x + s * 4, y + 7, 2.8, 4.6, pal, { stalk: 3.5, sx: -s * 3, stalkC: '#8f7552', stroke: 'rgba(140,30,20,.45)' }); });
  [[0, .9], [1, .86], [2, .9]].forEach(([k, t]) => { const [x, y] = qb(S[k], t); b += flower5(x + 3, y - 2, 3.4, '#c7a1f0', '#ffe27a', 18); });
  return b + sparks([[30, 22, 2.4, '#f6d77a'], [76, 18, 3], [92, 70, 2]]);
};
// ---- Reishi: two lacquered mushroom fans on a mossy knoll ----
P.reishi = () => {
  let b = '';
  for (let i = 0; i < 9; i++) { const x = 30 + i * 5, l = 20 + (i * 7 % 13);
    b += `<path d="M${x} 122q${(i % 2 ? 3 : -3)} ${l * .5} ${(i % 3) - 1} ${l}" fill="none" stroke="#f3eadb" stroke-width=".8" stroke-linecap="round" opacity=".95"/><circle cx="${(i % 3) - 1 + x}" cy="${122 + l}" r=".9" fill="#fff"/>`; }
  const st = lg([[0, '#a0492f'], [1, '#5b2016']], 0, 0, 1, 0);
  b += stem('M38 120C34 104 44 88 38 64', 5, '#6f2a1c', '#c26a4b') + stem('M60 120C64 108 58 96 66 84', 4, '#6f2a1c', '#c26a4b');
  const cap = (x, y, s, r) => {
    const fill = rg([[0, '#ffc08e'], [.35, '#d9533a'], [.75, '#8e2219'], [1, '#4d130f']], .38, .28, .9);
    return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-26 4C-28 -10 -9 -17 4 -15C19 -13 30 -6 27 4C14 10 -13 10 -26 4Z" fill="${fill}" stroke="#5a1a12" stroke-width=".7"/>` +
      `<path d="M-26 4C-13 10 14 10 27 4" fill="none" stroke="#ffd98a" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M-18 1C-16 -8 -4 -11 6 -10C16 -9 21 -4 20 2M-10 -1C-8 -6 0 -7 6 -6.5C12 -6 14 -3 13 0" fill="none" stroke="#f2a36f" stroke-width=".8" opacity=".55"/>` +
      `<ellipse cx="-9" cy="-9" rx="8" ry="2.6" fill="#fff" opacity=".5" transform="rotate(-10 -9 -9)"/><circle cx="12" cy="-7" r="1.2" fill="#fff" opacity=".6"/></g>`; };
  b += cap(38, 62, 1, -6) + cap(67, 84, .62, 8);
  // moss knoll with tiny clover
  b += `<path d="M24 122C26 115 34 113 40 116C44 111 54 111 58 116C64 112 74 114 76 122Z" fill="${lg([[0, '#b9dd84'], [1, '#6a9c45']])}" stroke="${INK}" stroke-width=".5"/>`;
  [[28, 116], [70, 116.5]].forEach(([x, y]) => b += heart(x, y, -20, 2.6) + heart(x + 1, y, 25, 2.4));
  return b + sparks([[14, 40, 2.6, '#f6d77a'], [84, 52, 3], [52, 30, 2]]);
};
// ---- Chaga: a birch stump in a white coat with a charcoal chaga hug and a fresh twig ----
P.chaga = () => {
  let b = roots(49, 122, 6, 34, 22, '#a98260', '#cfb08c');
  const bark = lg([[0, '#ffffff'], [.6, '#f3f0e8'], [1, '#d9d4c8']], 0, 0, 1, 0);
  b += `<path d="M34 122V40C34 37 64 37 64 40V122Z" fill="${bark}" stroke="#b9b2a2" stroke-width=".7"/>`;
  b += `<ellipse cx="49" cy="40" rx="15" ry="4.2" fill="${lg([[0, '#fbf1dc'], [1, '#e6cfa6']])}" stroke="#c7ad82" stroke-width=".6"/><ellipse cx="49" cy="40" rx="9" ry="2.4" fill="none" stroke="#d8bd92" stroke-width=".5"/><ellipse cx="49" cy="40" rx="4" ry="1.1" fill="none" stroke="#d8bd92" stroke-width=".5"/>`;
  [[38, 54, 6], [44, 66, 4], [37, 80, 5], [46, 94, 6], [39, 108, 4], [52, 50, 4], [55, 112, 5]].forEach(([x, y, w]) => b += `<path d="M${x} ${y}h${w}" stroke="#3b3a36" stroke-width="1.5" stroke-linecap="round"/>`);
  const conk = rg([[0, '#5a4a40'], [.5, '#2b2320'], [1, '#141010']], .35, .3, .9);
  b += `<path d="M60 64C70 60 78 66 78 76C80 86 74 96 64 96C60 92 61 86 59 80C61 74 58 70 60 64Z" fill="${conk}" stroke="#0d0b0a" stroke-width=".6"/>`;
  b += `<path d="M63 72l4 2 2 5-3 3 1 5M69 79l5 1M66 82l-3 4 2 4M71 88l-2 3M65 66l3 3" fill="none" stroke="#d98b3e" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="M62 70l1 0M73 72l1 1M68 92h1" stroke="#7a5236" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="66" cy="70" rx="3" ry="1.4" fill="#fff" opacity=".18"/>`;
  b += stem('M56 39C58 30 62 24 68 18', 1.6, '#7f5838', '#c79a6e') + leaf(62, 27, 60, 9, 6) + leaf(66, 20, -10, 8, 5.4) + flower5(70, 16, 0, '#fff');
  b += `<path d="M30 122C31 117 36 116 38 119C40 115 44 116 44 122Z" fill="#8fbf62" stroke="${INK}" stroke-width=".5"/>`;
  return b + sparks([[22, 30, 2.6, '#f6d77a'], [84, 40, 3], [86, 104, 2]]);
};
// ---- He shou wu: heart-leaf vine twirling up a little cane, rosy tubers below ----
P['he-shou-wu'] = () => {
  let b = '';
  const tub = rg([[0, '#d78a6c'], [.55, '#9b4a33'], [1, '#5f2a1d']], .38, .3, .85);
  b += `<path d="M50 122C50 130 42 134 38 140M50 122C52 132 60 132 62 142M50 122C50 136 50 146 48 154" fill="none" stroke="#a97a5a" stroke-width="1.4" stroke-linecap="round"/>`;
  [[37, 146, 7, 9, -18], [62, 147, 7.5, 9.5, 14], [48, 158, 6.5, 8, 4]].forEach(([x, y, rx, ry, r]) =>
    b += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="${tub}" stroke="#4d2016" stroke-width=".6"/><ellipse cx="${f(x - rx * .35)}" cy="${f(y - ry * .4)}" rx="${f(rx * .22)}" ry="${f(ry * .16)}" fill="#fff" opacity=".45"/><path d="M${x - 3} ${y + 2}q3 1.4 6 0" fill="none" stroke="#c07a5e" stroke-width=".5"/>`);
  b += stem('M50 124V14', 2.2, '#c9a873', '#f2e1b8');
  b += `<circle cx="50" cy="13" r="1.6" fill="#d9bb86"/>`;
  // vine twirling around the cane
  let d = 'M50 122', pts = [];
  for (let y = 122, i = 0; y > 16; y -= 3, i++) { const x = 50 + Math.sin(i * .62) * 7; d += ` L${f(x)} ${f(y)}`; pts.push([x, y, Math.cos(i * .62)]); }
  b += `<path d="${d}" fill="none" stroke="#5f9a3c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach(([x, y, c], i) => { if (i % 4 === 2 && y < 112) b += `<path d="M${f(x)} ${f(y)}q${c > 0 ? 5 : -5} -1 ${c > 0 ? 8 : -8} 2" fill="none" stroke="#5f9a3c" stroke-width=".8"/>` + heart(x + (c > 0 ? 8 : -8), y + 2, c > 0 ? 112 : -112, 8.6 - y / 50); });
  b += `<path d="M53 16q6 -4 4 -9q-2 -3 -4 0" fill="none" stroke="#5f9a3c" stroke-width=".7" stroke-linecap="round"/>`;
  [[58, 14], [61, 18], [56, 9]].forEach(([x, y]) => b += `<circle cx="${x}" cy="${y}" r="1.3" fill="#fffaf0" stroke="#d9cdb3" stroke-width=".35"/>`);
  return b + sparks([[22, 34, 2.6, '#f6d77a'], [80, 26, 3], [84, 90, 2]]);
};
for (const [n, fn] of Object.entries(P)) { reset(); const body = fn(); fs.writeFileSync(path.join(OUT, n + '.svg'), svg(body)); }
console.log('wrote', Object.keys(P).length);
