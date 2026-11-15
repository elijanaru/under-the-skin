// The date ticket's motion, ported from the Rive scene (rive/ticket/gen.py) so it plays in the app with no runtime and no splash.
// "send" on his phone: press-squeeze, spring, turn to the back, fold into an envelope with a heart seal, crouch and fly off with hearts.
// "arrive" on hers: drop in on the "With love" back, land with a squash and a hop, turn over to the front, a light sweep.
// All positions are Rive artboard units (ticket 340 x 170 at 200,250), scaled to the real ticket's width.
const PI = Math.PI;
function bez(x1, y1, x2, y2) {
  const bx = t => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3, by = t => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3;
  return u => { if (u <= 0) return 0; if (u >= 1) return 1; let lo = 0, hi = 1; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (bx(m) < u) lo = m; else hi = m; } return by((lo + hi) / 2); };
}
const EASE_OUT = bez(.22, .8, .32, 1), EASE_IO = bez(.45, 0, .25, 1), EASE_IN = bez(.5, 0, .85, .45), SOFT = bez(.4, 0, .2, 1);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const damp = (t, p, d) => (t < 0 ? 0 : Math.exp(-d * t) * Math.cos(2 * PI * t / p));
const dsin = (t, p, d) => (t < 0 ? 0 : Math.exp(-d * t) * Math.sin(2 * PI * t / p));
const flip = (t0, t1) => t => PI * SOFT(seg(t, t0, t1));
const HEART = 'M12 21C12 21 3 14.5 3 8.5C3 5.5 5.3 3.5 8 3.5C9.8 3.5 11.2 4.6 12 6C12.8 4.6 14.2 3.5 16 3.5C18.7 3.5 21 5.5 21 8.5C21 14.5 12 21 12 21Z';

// ── SEND ──
const thS = flip(0.30, 0.95);
const sSqY = t => { let v = t < 0.12 ? 1 - 0.075 * EASE_OUT(t / 0.12) : 1 - 0.075 * damp(t - 0.12, 0.30, 6.5); v += t < 1.52 ? -0.05 * Math.sin(PI * seg(t, 1.36, 1.52)) : 0.045 * Math.sin(PI * seg(t, 1.52, 1.82)); return v; };
const sSqX = t => { let v = t < 0.12 ? 1 + 0.045 * EASE_OUT(t / 0.12) : 1 + 0.045 * damp(t - 0.12, 0.30, 6.5); v += t < 1.52 ? 0.03 * Math.sin(PI * seg(t, 1.36, 1.52)) : -0.03 * Math.sin(PI * seg(t, 1.52, 1.82)); return v; };
const sLift = t => -15 * EASE_OUT(seg(t, 0.10, 0.42)) - 7 * Math.sin(thS(t)) + 9 * EASE_IO(seg(t, 0.95, 1.30));
const P0 = [200, 254], P1 = [210, 150], P2 = [300, 40], P3 = [392, -70];
const path = s => { const u = 1 - s; return [0, 1].map(i => u ** 3 * P0[i] + 3 * u * u * s * P1[i] + 3 * u * s * s * P2[i] + s ** 3 * P3[i]); };
const FLY = bez(.55, 0, .72, .9), sProg = t => FLY(seg(t, 1.50, 2.12));
const sTx = t => (t >= 1.5 ? path(sProg(t))[0] : 200);
const sTy = t => (t >= 1.5 ? path(sProg(t))[1] : 250) + (t < 1.52 ? 5 * Math.sin(PI * seg(t, 1.36, 1.52)) : 0);
const sRot = t => -0.035 * Math.sin(thS(t)) + (t < 1.52 ? 0.035 * Math.sin(PI * seg(t, 1.36, 1.52)) : 0) - 0.34 * EASE_IO(seg(t, 1.50, 2.0)) + 0.06 * Math.sin(PI * seg(t, 1.6, 2.1));
const SC = bez(.4, 0, .3, 1), sScale = t => 1 - 0.7 * SC(seg(t, 1.50, 2.05)), sOp = t => 1 - EASE_IN(seg(t, 1.86, 2.12));
const FLAP = bez(.55, 0, .25, 1), flapY = t => (t < 1.12 ? -EASE_OUT(seg(t, 0.98, 1.12)) : -1 + 2 * FLAP(seg(t, 1.12, 1.36)) + 0.04 * Math.sin(PI * seg(t, 1.33, 1.46)));
const sealS = t => (t >= 1.36 ? 1 - damp(t - 1.36, 0.26, 12) : 0);
const HEARTS = (() => { // born along the flight path, drift up and fade (same seeds of motion as the Rive file, fixed here)
  const births = [1.66, 1.74, 1.82, 1.89, 1.96], ox = [-9, 2, -12, 4, -3], size = [0.82, 0.62, 0.9, 0.66, 0.78], sway = [-7, 8, -6, 7, -8], rise = [44, 40, 50, 46, 41], col = ['#e6809c', '#f4c6d6', '#d98aa5', '#efb3c6', '#e6809c'];
  return births.map((tb, i) => { const [bx, by] = path(sProg(tb)); return { tb, bx: bx + ox[i] - 6, by: by + 18, size: size[i], sway: sway[i], rise: rise[i], col: col[i] }; });
})();
function sendFrame(t) {
  const th = thS(t), k = 0.075 * Math.sin(2 * th), lift = sLift(t), s = sScale(t);
  return { x: sTx(t), y: sTy(t), rot: sRot(t), s, op: sOp(t), sqx: sSqX(t), sqy: sSqY(t), k, fx: Math.max(0, Math.abs(Math.cos(th))), fy: 1 + 0.045 * Math.sin(th),
    lift, shY: 9 - 0.75 * lift, shOp: 1 + 0.028 * lift, shade: Math.sin(th) ** 1.5, back: th > PI / 2, backContent: 1 - EASE_IO(seg(t, 0.98, 1.14)),
    env: EASE_IO(seg(t, 0.96, 1.10)), flap: seg(t, 0.96, 1.0), flapY: flapY(t), flapSh: EASE_IO(seg(t, 1.22, 1.36)), seal: sealS(t), sealR: -0.5 * (1 - EASE_OUT(seg(t, 1.36, 1.62))),
    hearts: HEARTS.map(h => { const u = seg(t, h.tb, h.tb + 0.48), on = t >= h.tb, sc = on ? h.size * (1 - damp(t - h.tb, 0.24, 10)) : 0;
      return { x: h.bx + h.sway * Math.sin(PI * 1.2 * u), y: h.by - h.rise * EASE_OUT(u), op: on ? Math.min(1, (t - h.tb) / 0.07) * (1 - EASE_IN(seg(t, h.tb + 0.216, h.tb + 0.48))) : 0, s: sc, r: 0.22 * Math.sin(PI * 1.6 * u) * Math.sign(h.sway), col: h.col }; }) };
}
// ── ARRIVE ──
const T_LAND = 0.64, thA = flip(1.02, 1.62), DROP = bez(.5, 0, .82, .58), ROT = bez(.3, 0, .4, 1), GL = bez(.42, 0, .3, 1);
function arriveFrame(t) {
  const th = thA(t), u = t - T_LAND, lift = -16 * Math.sin(th), dp = DROP(seg(t, 0, T_LAND)), s = 0.94 + 0.06 * EASE_OUT(seg(t, 0, T_LAND));
  const y = t < T_LAND ? -150 + 400 * DROP(t / T_LAND) : 250 - (u >= 0.07 && u <= 0.37 ? 11 * Math.sin(PI * seg(u, 0.07, 0.37)) : 0);
  const x = 200 + 24 * (1 - EASE_OUT(seg(t, 0, T_LAND))) - (t < T_LAND ? 6 * Math.sin(PI * seg(t, 0, T_LAND)) : 0);
  const rot = -0.2 * (1 - ROT(seg(t, 0, T_LAND))) + 0.05 * Math.sin(PI * seg(t, 0.25, T_LAND + 0.25)) - 0.03 * Math.sin(th);
  const settle = t < 1.76 ? Math.sin(PI * seg(t, 1.60, 1.76)) : 0;
  return { x, y, rot, s, op: 1, sqx: 1 + 0.065 * dsin(t - T_LAND, 0.36, 6.5) + 0.018 * settle, sqy: 1 - 0.10 * dsin(t - T_LAND, 0.36, 6.5) - 0.03 * settle,
    k: -0.075 * Math.sin(2 * th), fx: Math.abs(Math.cos(th)), fy: 1 + 0.045 * Math.sin(th), lift, shY: 9 + 26 * (1 - dp) - 0.75 * lift, shOp: (0.15 + 0.85 * dp * dp) * (1 + 0.028 * lift),
    shade: Math.sin(th) ** 1.5, back: th < PI / 2, backContent: 1, env: 0, flap: 0, flapY: 0, flapSh: 0, seal: 0, sealR: 0, glint: -330 + 660 * GL(seg(t, 1.58, 2.22)), hearts: [] };
}

// the moving ticket: a front and a back copy of the real ticket, shade layers, an envelope and hearts
function build(vt, W, H) {
  const u = W / 340, HW = W / 2, HH = H / 2, fh = 96 * H / 170;
  const root = document.createElement('div'); root.className = 'tkm'; root.setAttribute('aria-hidden', 'true');
  const env = `<svg class="tkm-env" viewBox="${-HW} ${-HH} ${W} ${H}" width="${W}" height="${H}">
    <defs><linearGradient id="tkmB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dee4"/><stop offset="1" stop-color="#edd0d8"/></linearGradient>
      <linearGradient id="tkmL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecc8d2"/><stop offset="1" stop-color="#f2d6dd"/></linearGradient>
      <radialGradient id="tkmS" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#e7a1b6"/><stop offset="1" stop-color="#b65d7b"/></radialGradient>
      <filter id="tkmF" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <rect x="${-HW}" y="${-HH}" width="${W}" height="${H}" rx="6" fill="url(#tkmB)" stroke="rgba(183,123,136,.45)" stroke-width=".8"/>
    <path d="M${-HW} ${-HH}L-20 -2L${-HW} ${HH}ZM${HW} ${-HH}L20 -2L${HW} ${HH}Z" fill="#f4dbe1" stroke="rgba(183,123,136,.3)" stroke-width=".6" stroke-linejoin="round"/>
    <path d="M${-HW} ${HH}L-6 2L6 2L${HW} ${HH}Z" fill="url(#tkmL)" stroke="rgba(183,123,136,.4)" stroke-width=".7" stroke-linejoin="round"/>
    <g class="tkm-fl"><path class="tkm-flsh" d="M${-HW + 6} 3L${HW - 6} 3L0 ${fh}Z" fill="rgba(90,58,64,.22)" filter="url(#tkmF)"/>
      <path class="tkm-flap" d="M${-HW} 0L${HW} 0L0 ${fh}Z" stroke="rgba(183,123,136,.5)" stroke-width=".8" stroke-linejoin="round"/></g>
    <g class="tkm-seal"><circle r="${13 * u}" fill="url(#tkmS)" stroke="rgba(156,75,102,.5)" stroke-width=".8"/><path d="${HEART}" transform="translate(${-6 * u} ${-6 * u}) scale(${0.5 * u})" fill="rgba(255,244,246,.95)"/></g></svg>`;
  root.innerHTML = `<div class="tkm-t"><i class="tkm-sh"></i><div class="tkm-lift"><div class="tkm-face tkm-front"></div><div class="tkm-face tkm-back"></div>${env}</div></div>${HEARTS.map(() => `<svg class="tkm-h" viewBox="0 0 24 24" width="${24 * u}" height="${24 * u}"><path d="${HEART}"/></svg>`).join('')}`;
  for (const [cls, keep] of [['.tkm-front', 'front'], ['.tkm-back', 'back']]) {
    const c = vt.cloneNode(true); c.classList.add('tkm-vt', 'show-' + keep); c.style.width = W + 'px';
    const f = root.querySelector(cls); f.appendChild(c); f.insertAdjacentHTML('beforeend', `<i class="tkm-shade"></i>${keep === 'front' ? '<i class="tkm-glint"></i>' : ''}`);
  }
  Object.assign(root.style, { width: W + 'px', height: H + 'px' });
  const q = s => root.querySelector(s);
  const el = { t: q('.tkm-t'), lift: q('.tkm-lift'), sh: q('.tkm-sh'), front: q('.tkm-front'), back: q('.tkm-back'), shadeF: q('.tkm-front .tkm-shade'), shadeB: q('.tkm-back .tkm-shade'),
    backC: q('.tkm-back .vt-back'), env: q('.tkm-env'), fl: q('.tkm-fl'), flap: q('.tkm-flap'), flsh: q('.tkm-flsh'), seal: q('.tkm-seal'), glint: q('.tkm-glint'), hearts: [...root.querySelectorAll('.tkm-h')] };
  const apply = f => {
    const dx = (f.x - 200) * u, dy = (f.y - 250) * u;
    el.t.style.opacity = f.op;
    el.t.style.transform = `translate(${dx}px,${dy}px) rotate(${f.rot}rad) scale(${f.s}) translateY(${HH}px) scale(${f.sqx},${f.sqy}) translateY(${-HH}px) rotate(${PI / 4 + f.k / 2}rad) scale(${1 + f.k / 2},${1 - f.k / 2}) rotate(${-PI / 4}rad) scale(${Math.max(0.001, f.fx)},${f.fy})`;
    el.lift.style.transform = `translateY(${f.lift * u}px)`;
    el.sh.style.transform = `translateY(${f.shY * u}px)`; el.sh.style.opacity = Math.max(0, Math.min(1, f.shOp));
    el.front.style.visibility = f.back ? 'hidden' : 'visible'; el.back.style.visibility = f.back ? 'visible' : 'hidden';
    el.shadeF.style.opacity = el.shadeB.style.opacity = f.shade;
    if (el.backC) el.backC.style.opacity = f.backContent;
    el.env.style.opacity = f.env; el.fl.style.opacity = f.flap;
    el.fl.setAttribute('transform', `translate(0 ${-HH}) scale(1 ${f.flapY || 0.0001})`);
    el.flap.setAttribute('fill', f.flapY < 0 ? '#e7c0cb' : '#f1d2da'); el.flsh.style.opacity = f.flapSh;
    el.seal.setAttribute('transform', `translate(0 ${9 * u}) rotate(${f.sealR * 180 / PI}) scale(${f.seal || 0.0001})`);
    if (el.glint) el.glint.style.transform = `translateX(${(f.glint ?? -330) * u}px) skewX(-18deg)`;
    f.hearts.forEach((h, i) => { const n = el.hearts[i]; n.style.opacity = h.op; n.style.fill = h.col; n.style.transform = `translate(${(h.x - 200) * u + HW - 12 * u}px,${(h.y - 250) * u + HH - 12 * u}px) rotate(${h.r}rad) scale(${h.s || 0.0001})`; });
    if (!f.hearts.length) el.hearts.forEach(n => { n.style.opacity = 0; });
  };
  return { root, apply };
}
function run(frame, dur, apply) {
  return new Promise(res => { const t0 = performance.now(); const step = now => { const t = Math.min(dur, (now - t0) / 1000); apply(frame(t)); if (t < dur) requestAnimationFrame(step); else res(true); }; apply(frame(0)); requestAnimationFrame(step); });
}
// his tap: plays over the real ticket (el = the tappable section holding .vt); resolves when the ticket has flown off
export async function send(el) {
  const vt = el.querySelector('.vt'); if (!vt) return false;
  const r = vt.getBoundingClientRect(), { root, apply } = build(vt, r.width, r.height);
  Object.assign(root.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', zIndex: 90 });
  document.body.appendChild(root); apply(sendFrame(0)); el.classList.add('gone');
  await run(sendFrame, 147 / 60, apply); root.remove(); return true;
}
// her phone: plays inside the ticket box (box holds the real .vt, which stays hidden until the ticket has landed and turned)
export async function arrive(box) {
  const vt = box.querySelector('.vt'); if (!vt) return false;
  const W = box.clientWidth, H = vt.offsetHeight, { root, apply } = build(vt, W, H);
  Object.assign(root.style, { position: 'absolute', left: 0, top: 0, zIndex: 5 });
  box.classList.add('tkm-on'); box.appendChild(root);
  await run(arriveFrame, 138 / 60, apply); box.classList.remove('tkm-on'); root.remove(); return true;
}
