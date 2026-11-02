// Welcome hero: an overexposed, grainy female torso whose anatomy surfaces "under the skin"
// (smoky shadows breathe in and drift upward), with long side strokes and a glitching centre logo.
// Fully procedural — no photo assets.

const MARKS = [
  { a: 'under the skin.', b: 'HORMONES · CYCLE · RITUAL' },
  { a: 'XX — 2026', b: 'LIVE IN SYNC' },
  { a: '水 木 火 土', b: 'FOUR INNER SEASONS' },
  { a: 'under the skin.', b: 'YOUR BODY, DECODED' },
  { a: '♀ · ☾ · ✦', b: 'BODY · MOON · STARS' },
];

function grainCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 28;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// One shadow "brush": soft blurred shape drawn in torso-relative units (0..1 x, 0..1 y).
function shade(ctx, W, H, f) {
  ctx.save();
  ctx.filter = `blur(${f.blur * W}px)`;
  ctx.globalAlpha = f.a;
  ctx.fillStyle = f.c || '#0b130e';
  ctx.strokeStyle = f.c || '#0b130e';
  if (f.type === 'ellipse') {
    ctx.beginPath(); ctx.ellipse(f.x * W, f.y * H, f.rx * W, f.ry * H, f.rot || 0, 0, Math.PI * 2); ctx.fill();
  } else if (f.type === 'arc') {
    ctx.lineWidth = f.w * W; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(f.p[0] * W, f.p[1] * H); ctx.quadraticCurveTo(f.p[2] * W, f.p[3] * H, f.p[4] * W, f.p[5] * H); ctx.stroke();
  } else if (f.type === 'leaf') {
    const [x, y, h, w, dir] = f.p;
    ctx.beginPath(); ctx.moveTo(x * W, y * H);
    ctx.bezierCurveTo((x + w * dir) * W, (y + h * .3) * H, (x + w * dir * .4) * W, (y + h * .7) * H, (x + w * dir * .1) * W, (y + h) * H);
    ctx.bezierCurveTo((x - w * dir * .2) * W, (y + h * .6) * H, (x - w * dir * .05) * W, (y + h * .2) * H, x * W, y * H);
    ctx.fill();
  }
  ctx.restore();
}

// Anatomy map (mirrored where needed). `reveal` scales each layer: 0 = pure white shirt, 1 = full anatomy.
function anatomy() {
  const L = [];
  // hair / chin shadow at the top
  L.push({ type: 'ellipse', x: .5, y: -.02, rx: .32, ry: .11, blur: .035, a: .85, layer: 0 });
  L.push({ type: 'ellipse', x: .2, y: .02, rx: .16, ry: .05, blur: .03, a: .6, rot: -.4, layer: 0 });
  L.push({ type: 'ellipse', x: .8, y: .02, rx: .16, ry: .05, blur: .03, a: .6, rot: .4, layer: 0 });
  // neck & collarbones
  L.push({ type: 'ellipse', x: .5, y: .1, rx: .1, ry: .05, blur: .04, a: .45, layer: 1 });
  for (const s of [-1, 1]) L.push({ type: 'arc', p: [.5 + s * .05, .17, .5 + s * .18, .14, .5 + s * .33, .18], w: .02, blur: .022, a: .4, layer: 1 });
  // bust under-shadow
  for (const s of [-1, 1]) L.push({ type: 'arc', p: [.5 + s * .05, .36, .5 + s * .17, .41, .5 + s * .3, .33], w: .05, blur: .045, a: .38, layer: 2 });
  // ribs
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const y = .44 + i * .045;
    L.push({ type: 'arc', p: [.5 + s * .06, y, .5 + s * .17, y - .025, .5 + s * (.28 - i * .015), y + .02], w: .022, blur: .028, a: .3 - i * .04, layer: 2 });
  }
  // abdominal line & navel
  L.push({ type: 'arc', p: [.5, .46, .505, .56, .5, .64], w: .025, blur: .03, a: .28, layer: 3 });
  L.push({ type: 'ellipse', x: .5, y: .655, rx: .011, ry: .018, blur: .009, a: .8, layer: 3 });
  L.push({ type: 'ellipse', x: .5, y: .65, rx: .035, ry: .03, blur: .02, a: .3, layer: 3 });
  // waist contour shading & hip lines
  for (const s of [-1, 1]) {
    L.push({ type: 'arc', p: [.5 + s * .3, .4, .5 + s * .24, .62, .5 + s * .3, .86], w: .05, blur: .05, a: .32, layer: 2 });
    L.push({ type: 'arc', p: [.5 + s * .2, .72, .5 + s * .12, .8, .5 + s * .06, .92], w: .03, blur: .035, a: .28, layer: 3 });
  }
  let sd = 5; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) L.push({ type: 'ellipse', x: .2 + rr() * .6, y: .15 + rr() * .75, rx: .02 + rr() * .06, ry: .015 + rr() * .05, blur: .03, a: .05 + rr() * .07, layer: 1 + (i % 3) });
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) L.push({ type: 'ellipse', x: .5 + s * .07, y: .5 + i * .06, rx: .045, ry: .022, blur: .025, a: .13, layer: 3 });
  return L;
}

export function mountTorso(canvas, markEl) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const shapes = anatomy();
  let W, H, grain, raf, alive = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // offscreen layers for each anatomy depth so we can fade them separately
  let layers = [];
  function build() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    grain = grainCanvas(Math.ceil(W / 2), Math.ceil(H / 2));
    layers = [0, 1, 2, 3].map(li => {
      const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * 1.25 * dpr;
      const g = c.getContext('2d'); g.scale(dpr, dpr);
      shapes.filter(s => s.layer === li).forEach(s => shade(g, W, H, s));
      return c;
    });
  }
  build();
  const t0 = performance.now();
  let markI = 0, lastSwap = 0;
  function swapMark(t) {
    if (!markEl) return;
    markI = (markI + 1) % MARKS.length;
    const m = MARKS[markI];
    markEl.classList.remove('glitching'); void markEl.offsetWidth; markEl.classList.add('glitching');
    markEl.querySelector('.tm-a').textContent = m.a;
    markEl.querySelector('.tm-b').textContent = m.b;
    lastSwap = t;
  }
  function frame(now) {
    if (!alive) return;
    const t = (now - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // overexposed paper-white base with a faint cool vignette
    const bg = ctx.createRadialGradient(W / 2, H * .45, H * .1, W / 2, H * .5, H * .8);
    bg.addColorStop(0, '#f6f7f3'); bg.addColorStop(1, '#dfe3dc');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // breathing reveal: the body surfaces from under the white, layer by layer, and drifts upward
    const cycle = (t % 6.5) / 6.5;
    const drift = cycle * H * .1; // "going up"
    for (let li = 0; li < layers.length; li++) {
      const phase = Math.sin(Math.PI * Math.min(1, Math.max(0, cycle * 1.25 - li * .07)));
      ctx.globalAlpha = Math.max(0, phase) * (li === 0 ? 1 : .95);
      ctx.drawImage(layers[li], 0, 0, W * dpr, H * 1.25 * dpr, 0, H * .06 - drift, W, H * 1.25);
    }
    ctx.globalAlpha = 1;
    // long blurred dark limbs past the frame edges (deep green-brown)
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.filter = `blur(${W * .012}px)`;
      const x = s < 0 ? W * .1 : W * .9, sway = Math.sin(t * .7 + s) * W * .006;
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, 'rgba(36,52,38,.15)'); grd.addColorStop(.3, 'rgba(36,52,38,.8)'); grd.addColorStop(1, 'rgba(26,40,30,.9)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.moveTo(x + sway, H * .05 - drift * .3);
      ctx.bezierCurveTo(x + s * W * .08, H * .3, x - s * W * .02 + sway, H * .62, x + s * W * .06, H);
      ctx.lineTo(x - s * W * .01, H);
      ctx.bezierCurveTo(x - s * W * .035, H * .62, x - s * W * .02, H * .32, x + sway, H * .05 - drift * .3);
      ctx.fill(); ctx.restore();
    }
    // film grain
    ctx.globalAlpha = .9;
    const gx = (Math.random() * 40) | 0, gy = (Math.random() * 40) | 0;
    ctx.drawImage(grain, -gx, -gy, W + 40, H + 40);
    ctx.globalAlpha = 1;
    // fade into the app's black at the bottom
    const fade = ctx.createLinearGradient(0, H * .72, 0, H);
    fade.addColorStop(0, 'rgba(5,6,5,0)'); fade.addColorStop(1, 'rgba(5,6,5,1)');
    ctx.fillStyle = fade; ctx.fillRect(0, H * .72, W, H * .28);
    if (t - lastSwap > 1.3) swapMark(t);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const ro = new ResizeObserver(() => build()); ro.observe(canvas);
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
}
