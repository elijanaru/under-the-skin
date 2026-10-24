// "Technical" female body: a living cloud of glowing pearl particles on canvas,
// with a scan-light, breathing motion and HUD focus markers (womb, head, heart...).

const W = 200, H = 500;
// Right half of the silhouette (x >= 100); mirrored for the left.
const HALF = [[100, 70], [108, 73], [110, 83], [117, 87], [127, 91], [137, 96], [145, 103], [150, 113], [153, 128], [156, 160], [160, 205], [164, 250], [167, 280],
  [163, 292], [157, 284], [152, 252], [147, 210], [141, 168], [136, 140], [131, 132], [133, 152], [130, 172], [123, 200], [126, 224], [136, 250],
  [140, 276], [137, 318], [131, 360], [126, 392], [128, 432], [122, 472], [126, 492], [107, 494], [106, 470], [108, 432], [107, 392], [106, 340], [100, 300]];

export const FOCUS = {
  head: { x: 100, y: 44, r: 34, label: 'PINEAL · PITUITARY' },
  heart: { x: 112, y: 150, r: 18, label: 'HEART · FIRE' },
  womb: { x: 100, y: 262, r: 22, label: 'UTERUS · OVARIES' },
  body: { x: 100, y: 250, r: 120, label: 'FULL CYCLE' },
  stars: { x: 100, y: 44, r: 52, label: 'YOUR STARS' },
};

let pts = null;
function buildPoints() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(100, 42, 21, 27, 0, 0, Math.PI * 2); g.fill();
  g.beginPath();
  HALF.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = HALF.length - 1; i >= 0; i--) g.lineTo(200 - HALF[i][0], HALF[i][1]);
  g.closePath(); g.fill();
  // blurred copy gives an inner "depth" value for shading
  const b = document.createElement('canvas'); b.width = W; b.height = H;
  const bg = b.getContext('2d'); bg.filter = 'blur(6px)'; bg.drawImage(c, 0, 0);
  const a = g.getImageData(0, 0, W, H).data, ab = bg.getImageData(0, 0, W, H).data;
  const out = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < H; y += 2.2) for (let x = 0; x < W; x += 2.2) {
    const jx = x + (rnd() - .5) * 2, jy = y + (rnd() - .5) * 2;
    const i = ((jy | 0) * W + (jx | 0)) * 4;
    if (a[i + 3] < 128) continue;
    const depth = ab[i + 3] / 255; // 1 = deep inside, lower = near edge
    // rim-lit glass look: brighter at edges and along the centre line
    const rim = 1 - depth, centre = Math.max(0, 1 - Math.abs(jx - 100) / 26) * .35;
    out.push({ x: jx, y: jy, s: .45 + rnd() * 1.15, b: Math.min(1, .3 + rim * .95 + centre + rnd() * .3), ph: rnd() * 6.28 });
  }
  return out;
}

export function mountFigure(canvas, { focus = null, mode = 'full', intro = true } = {}) {
  if (!pts) pts = buildPoints();
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let cw, ch, scale, ox, oy, raf, t0 = performance.now();
  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = r.width; ch = r.height;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    scale = Math.min(cw / W, ch / H) * .96;
    ox = (cw - W * scale) / 2; oy = (ch - H * scale) / 2;
  }
  resize();
  const F = focus ? FOCUS[focus] : null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(now) {
    const t = (now - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const breathe = 1 + Math.sin(t * 1.1) * .006;
    const scanY = t < 2.6 && intro ? -999 : ((t - 2.6) * 70) % (H + 120) - 60;
    ctx.save();
    ctx.translate(ox + W * scale / 2, oy + H * scale / 2); ctx.scale(scale * breathe, scale); ctx.translate(-W / 2, -H / 2);
    // soft inner glow
    const glow = ctx.createRadialGradient(100, 220, 10, 100, 220, 220);
    glow.addColorStop(0, 'rgba(255,255,255,.07)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(-300, -300, 800, 1100);
    const lift = Math.sin(t * .6) * 3; // slow levitation
    for (const p of pts) {
      // rise-in: points appear from the feet upward and float up into place
      let k = 1;
      if (intro && !reduce) { const start = (1 - p.y / H) * 1.6 + p.ph * .05; k = Math.min(1, Math.max(0, (t - start) / .9)); if (k <= 0) continue; }
      const ease = 1 - Math.pow(1 - k, 3);
      const rise = (1 - ease) * (40 + p.ph * 6);
      const tw = .75 + .25 * Math.sin(t * 2 + p.ph);
      const scan = Math.max(0, 1 - Math.abs(p.y - scanY) / 18);
      let near = 0;
      if (F) { const d = Math.hypot(p.x - F.x, p.y - F.y); near = Math.max(0, 1 - d / F.r); }
      const al = Math.min(1, p.b * tw + scan * .7 + near * .6) * ease;
      const dx = Math.sin(t * .8 + p.y * .03) * .35;
      ctx.fillStyle = near > .2 ? `rgba(212,239,154,${al})` : `rgba(240,244,236,${al})`;
      ctx.beginPath(); ctx.arc(p.x + dx, p.y + rise - lift, p.s * (1 + scan * .6 + near * .5), 0, 6.283); ctx.fill();
      if (k < 1) { ctx.fillStyle = `rgba(212,239,154,${(1 - k) * .5})`; ctx.fillRect(p.x + dx - .3, p.y + rise - lift, .6, 6 * (1 - k)); }
    }
    // HUD focus marker
    if (F) {
      const pulse = (Math.sin(t * 2.4) + 1) / 2;
      ctx.strokeStyle = `rgba(212,239,154,${.5 + pulse * .4})`; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.arc(F.x, F.y, F.r * (.85 + pulse * .15), 0, 6.283); ctx.stroke();
      ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(F.x, F.y, F.r * 1.35, t * .5, t * .5 + 4.5); ctx.stroke(); ctx.setLineDash([]);
      if (focus === 'stars') for (let i = 0; i < 12; i++) {
        const a = t * .35 + i * (Math.PI * 2 / 12);
        ctx.fillStyle = `rgba(212,239,154,${.5 + .5 * Math.sin(t * 3 + i)})`;
        ctx.beginPath(); ctx.arc(F.x + Math.cos(a) * F.r * 1.25, F.y + Math.sin(a) * F.r * .9, 1.4, 0, 6.283); ctx.fill();
      }
      // leader line + label
      const lx = F.x + F.r + 26, ly = F.y - F.r * .6;
      ctx.strokeStyle = 'rgba(212,239,154,.7)';
      ctx.beginPath(); ctx.moveTo(F.x + F.r * .7, F.y - F.r * .3); ctx.lineTo(lx - 6, ly); ctx.lineTo(lx + 40, ly); ctx.stroke();
      ctx.fillStyle = 'rgba(212,239,154,.9)'; ctx.font = '500 6.5px Outfit, sans-serif';
      ctx.fillText(F.label, lx - 4, ly - 3);
    }
    ctx.restore();
    // technical frame
    if (mode === 'full') {
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
      const m = 10, L = 16;
      [[m, m, 1, 1], [cw - m, m, -1, 1], [m, ch - m, 1, -1], [cw - m, ch - m, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
      });
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '500 9px Outfit, sans-serif';
      ctx.fillText(`SCAN ${String(Math.floor((scanY + 60) / (H + 120) * 100)).padStart(2, '0')}%`, 14, ch - 16);
      ctx.textAlign = 'right'; ctx.fillText('XX · UNDER THE SKIN', cw - 14, ch - 16); ctx.textAlign = 'left';
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}

// Glowing translucent shelf-mushroom cluster with a digital glitch (SVG).
export function mushroomArt(variant = 0, cls = '') {
  const shelves = [[60, 70, 58, 20], [40, 100, 66, 24], [70, 132, 52, 18], [48, 160, 60, 20]].slice(0, 3 + (variant % 2));
  const id = 'mg' + variant;
  const caps = shelves.map(([x, y, w, h], i) => {
    const gills = Array.from({ length: 9 }, (_, k) => { const gx = x - w + (k + 1) * (w * 2 / 10); return `<line x1="${gx}" y1="${y}" x2="${x + (gx - x) * .4 + 30}" y2="${y + h * .55}" />`; }).join('');
    return `<g style="--i:${i}"><path d="M${x - w} ${y} Q ${x - w * .2} ${y - h * 1.6} ${x + w} ${y - h * .2} Q ${x + w + 6} ${y + 4} ${x + 34} ${y + h * .6} Q ${x - w * .1} ${y + h * .2} ${x - w} ${y}Z" fill="url(#${id})" stroke="rgba(240,244,236,.55)" stroke-width=".8"/>
      <g stroke="rgba(240,244,236,.22)" stroke-width=".5">${gills}</g></g>`;
  }).join('');
  return `<svg class="mushroom ${cls}" viewBox="0 0 160 200" aria-hidden="true"><defs>
      <radialGradient id="${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#cfd9cc" stop-opacity=".18"/><stop offset="1" stop-color="#9fcf8c" stop-opacity=".05"/></radialGradient>
      <filter id="${id}b"><feGaussianBlur stdDeviation="5"/></filter></defs>
    <rect x="128" y="0" width="22" height="200" rx="8" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)"/>
    <ellipse cx="80" cy="110" rx="60" ry="70" fill="rgba(212,239,154,.08)" filter="url(#${id}b)"/>
    <g class="mush-caps">${caps}</g>
    <g class="glitch">${[[44, 62, 52, 6], [26, 104, 70, 5], [60, 140, 40, 4], [30, 168, 48, 5]].map(([x, y, w, h], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="--d:${i * .7}s"/>`).join('')}</g>
  </svg>`;
}

// Pearl nautilus: logarithmic spiral shell drawn as glowing pearls (SVG).
export function nautilusArt(cls = '') {
  const cx = 100, cy = 100, b = 0.17, a = 4.2, dots = [], septa = [];
  for (let t = 0; t <= Math.PI * 4.6; t += 0.045) {
    const r = a * Math.exp(b * t), x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.6 + r / 60).toFixed(2)}" opacity="${(0.45 + Math.min(.55, r / 120)).toFixed(2)}"/>`);
  }
  // chamber walls: short arcs from each turn inward
  for (let t = Math.PI * 1.2; t <= Math.PI * 4.6; t += 0.42) {
    const r1 = a * Math.exp(b * t), r0 = a * Math.exp(b * (t - Math.PI * 2));
    for (let k = 0; k <= 8; k++) {
      const rr = r0 + (r1 - r0) * k / 8, tt = t - 0.18 * Math.sin(Math.PI * k / 8);
      septa.push(`<circle cx="${(cx + rr * Math.cos(tt)).toFixed(1)}" cy="${(cy + rr * Math.sin(tt)).toFixed(1)}" r="${(0.45 + rr / 110).toFixed(2)}" opacity=".5"/>`);
    }
  }
  return `<svg class="nautilus ${cls}" viewBox="0 0 200 200" aria-hidden="true"><defs>
      <radialGradient id="nau-g"><stop offset="0" stop-color="#d4ef9a" stop-opacity=".18"/><stop offset="1" stop-color="#d4ef9a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="100" cy="100" r="96" fill="url(#nau-g)"/>
    <g fill="#f3f5ef">${dots.join('')}${septa.join('')}</g></svg>`;
}
