// A lotus drawn petal by petal in 3D and projected to a 2D canvas.
// Every petal is its own curved, cupped surface hinged at the base; opening = each ring tilting outward in turn.
(function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // easeInOutCubic
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const mix = (a, b, t) => a + (b - a) * t;
  function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  // rings from outside in. open: tilt from vertical at full bloom (radians), bud: tilt when closed
  const RINGS = [
    { n: 8, len: .96, wid: .62, r0: .10, bud: .40, open: .98, bend: .16, cup: .42, delay: 0.00, off: .5 },
    { n: 8, len: .94, wid: .60, r0: .08, bud: .34, open: .84, bend: .14, cup: .46, delay: .12, off: 0 },
    { n: 6, len: .80, wid: .58, r0: .06, bud: .28, open: .60, bend: .10, cup: .50, delay: .24, off: .25 },
    { n: 5, len: .62, wid: .54, r0: .05, bud: .22, open: .40, bend: .05, cup: .52, delay: .36, off: .7 },
  ];

  window.Lotus = function (cv, o = {}) {
    const P = Object.assign({
      base: '#fff7f2', mid: '#f8cddb', tip: '#e98fae', edge: 'rgba(176,74,112,.28)', vein: 'rgba(196,96,132,.20)',
      inside: '#fff1f4', pod: '#e9d27a', podTop: '#d9be55', stamen: '#f2c35a',
      elev: .30, size: .5, glow: 0, line: false, lineColor: '#7e3452', fillAlpha: 1,
    }, o);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    function resize() { const r = cv.getBoundingClientRect(); dpr = Math.min(3, window.devicePixelRatio || 1); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); }
    resize();

    const ce = Math.cos(P.elev), se = Math.sin(P.elev);
    // world: x right, y up, z toward viewer. camera looks down by elev.
    const proj = (x, y, z, S, cx, cy) => [cx + x * S, cy - (y * ce - z * se) * S, z * ce + y * se];

    function petal(ring, k, e, t) {
      const R = RINGS[ring], local = clamp((e - R.delay) / (1 - R.delay * .6));
      const ee = ease(local);
      const phi = (k + R.off) / R.n * TAU + (ring % 2 ? .05 : -.05) * (1 - ee) + Math.sin(t * .0004 + k) * .006;
      const breathe = local >= 1 ? Math.sin(t * .0012 + ring) * .025 : 0;
      const tilt = mix(R.bud, R.open, ee) + breathe;
      const len = mix(.98 + ring * .03, R.len, ee), wid = R.wid * mix(.72, 1, ee);
      const cup = R.cup * mix(1.25, 1, ee), bend = mix(-R.bud * 2.1, R.bend, ee);
      const cp = Math.cos(phi), sp = Math.sin(phi);
      const wdir = [-sp, 0, cp];
      const N = 14, M = 6, pts = [];
      // centreline
      let x = R.r0 * cp, y = 0, z = R.r0 * sp; const cl = [[x, y, z]], dirs = [];
      for (let i = 1; i <= N; i++) {
        const s = (i - .5) / N, th = tilt + bend * Math.pow(s, 1.3);
        const d = [Math.sin(th) * cp, Math.cos(th), Math.sin(th) * sp];
        x += d[0] * len / N; y += d[1] * len / N; z += d[2] * len / N; cl.push([x, y, z]); dirs.push(d);
      }
      dirs.push(dirs[dirs.length - 1]); dirs.unshift(dirs[0]);
      // surface grid: s along, u across (-1..1)
      const grid = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, hw = wid * Math.pow(Math.sin(Math.PI * Math.pow(s, .7)), .7) * .5 * (.3 + .7 * Math.min(1, s / .3));
        const d = dirs[i];
        // inward normal = wdir x d  (points toward the centre / up)
        const n = [wdir[1] * d[2] - wdir[2] * d[1], wdir[2] * d[0] - wdir[0] * d[2], wdir[0] * d[1] - wdir[1] * d[0]];
        const row = [];
        for (let j = -M; j <= M; j++) {
          const u = j / M, c = cup * hw * u * u * (1 - s * .4);
          row.push([cl[i][0] + wdir[0] * hw * u * 1 - n[0] * c, cl[i][1] + wdir[1] * hw * u - n[1] * c, cl[i][2] + wdir[2] * hw * u - n[2] * c]);
        }
        grid.push(row);
      }
      return { ring, k, grid, cl, phi, tilt, ee };
    }

    function render(e, t, opt = {}) {
      const S = Math.min(W, H) * P.size * (opt.scale || 1), cx = W / 2, cy = H * (opt.cy || .62);
      ctx.clearRect(0, 0, W, H);
      const petals = [];
      for (let r = 0; r < RINGS.length; r++) for (let k = 0; k < RINGS[r].n; k++) petals.push(petal(r, k, e, t));
      // project + depth
      for (const p of petals) {
        p.pg = p.grid.map(row => row.map(q => proj(q[0], q[1], q[2], S, cx, cy)));
        const mid = p.pg[Math.round(p.pg.length * .55)][6]; p.depth = mid[2] - p.ring * .0001 * 0;
        // which face do we see? normal from projected cross
        const a = p.pg[2][0], b = p.pg[2][12], c = p.pg[10][6];
        p.face = ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
      }
      petals.sort((a, b) => a.depth - b.depth);

      // pod + stamens sit in the middle, drawn after the back petals
      const podAt = petals.findIndex(p => p.depth > 0);
      const drawPod = () => {
        const o = clamp((e - .45) / .4); if (o <= 0) return;
        const [px, py] = proj(0, .1, 0, S, cx, cy);
        ctx.save(); ctx.globalAlpha = o;
        // stamens: thin golden filaments in a ring
        for (let i = 0; i < 40; i++) {
          const a = i / 40 * TAU, rr = .13 + (i % 3) * .015, h = .1 + .05 * ((i * 7) % 5) / 5;
          const p0 = proj(Math.cos(a) * .06, .06, Math.sin(a) * .06, S, cx, cy), p1 = proj(Math.cos(a) * rr * o, .06 + h, Math.sin(a) * rr * o, S, cx, cy);
          ctx.strokeStyle = 'rgba(232,180,80,.85)'; ctx.lineWidth = .9 * dpr; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
          ctx.fillStyle = '#f7d27a'; ctx.beginPath(); ctx.ellipse(p1[0], p1[1], 1.6 * dpr, 2.4 * dpr, 0, 0, TAU); ctx.fill();
        }
        // seed pod: flat-topped cone
        const top = proj(0, .2, 0, S, cx, cy), rx = .085 * S, ry = rx * se;
        const g = ctx.createLinearGradient(top[0], top[1] - ry, top[0], top[1] + rx);
        g.addColorStop(0, '#f1e3a0'); g.addColorStop(1, '#c9b555');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(top[0], top[1], rx, ry, 0, 0, TAU); ctx.fill();
        const bot = proj(0, .1, 0, S, cx, cy);
        ctx.beginPath(); ctx.moveTo(top[0] - rx, top[1]); ctx.lineTo(bot[0] - rx * .7, bot[1]); ctx.lineTo(bot[0] + rx * .7, bot[1]); ctx.lineTo(top[0] + rx, top[1]); ctx.closePath(); ctx.fillStyle = '#d9c463'; ctx.fill();
        ctx.fillStyle = '#e9da8f'; ctx.beginPath(); ctx.ellipse(top[0], top[1], rx, ry, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(150,130,40,.55)';
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr = i ? .55 : 0; ctx.beginPath(); ctx.ellipse(top[0] + Math.cos(a) * rx * rr, top[1] + Math.sin(a) * ry * rr, 1.4 * dpr, 1 * dpr, 0, 0, TAU); ctx.fill(); }
        ctx.restore();
      };

      petals.forEach((p, idx) => {
        if (idx === (podAt < 0 ? petals.length : podAt)) drawPod();
        const g = p.pg, n = g.length - 1;
        ctx.beginPath();
        ctx.moveTo(g[0][0][0], g[0][0][1]);
        for (let i = 1; i <= n; i++) ctx.lineTo(g[i][0][0], g[i][0][1]);
        for (let i = n; i >= 0; i--) ctx.lineTo(g[i][12][0], g[i][12][1]);
        ctx.closePath();
        const b = g[0][6], tp = g[n][6];
        const inner = p.face < 0;
        const gr = ctx.createLinearGradient(b[0], b[1], tp[0], tp[1]);
        {
          gr.addColorStop(0, P.base); gr.addColorStop(.5, inner ? P.inside : P.mid); gr.addColorStop(1, inner ? (P.tipIn || P.mid) : P.tip);
          ctx.fillStyle = gr;
        }
        if (P.paper) { const f = ctx.fillStyle; ctx.fillStyle = P.paper; ctx.fill(); ctx.fillStyle = f; }
        ctx.globalAlpha = P.fillAlpha; ctx.fill(); ctx.globalAlpha = 1;
        // soft sheen on the outer face
        if (P.fillAlpha > .05) {
          const sh = ctx.createLinearGradient(g[4][0][0], g[4][0][1], g[4][12][0], g[4][12][1]);
          sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.5, inner ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.18)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = sh; ctx.fill();
          // depth shade toward the base for the petals in front
          ctx.fillStyle = `rgba(120,40,70,${.05 + .05 * (p.ring === 0 ? 1 : 0)})`;
        }
        ctx.lineWidth = (P.line ? 1 : .7) * dpr; ctx.strokeStyle = P.line ? hexA(P.lineColor, P.lineAlpha == null ? 1 : P.lineAlpha) : P.edge; ctx.stroke();
        // veins
        ctx.strokeStyle = P.line ? hexA(P.lineColor, .3 * (P.lineAlpha == null ? 1 : P.lineAlpha)) : P.vein; ctx.lineWidth = .6 * dpr;
        for (const j of [3, 6, 9]) { ctx.beginPath(); ctx.moveTo(g[1][j][0], g[1][j][1]); for (let i = 2; i < n - 1; i++) ctx.lineTo(g[i][j][0], g[i][j][1]); ctx.stroke(); }
      });
      if (podAt < 0) drawPod();
      // the flower sits in the water: its base melts away
      const by = proj(0, 0, 0, S, cx, cy)[1];
      ctx.save(); ctx.globalCompositeOperation = 'destination-out';
      const fd = P.fade == null ? .07 : P.fade, fg = ctx.createLinearGradient(0, by - S * fd, 0, by + S * .01); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = fg; ctx.fillRect(0, by - S * fd, W, H); ctx.restore();
    }
    return { render, resize, P, get W() { return W; }, get H() { return H; } };
  };
  window.Lotus.ease = ease; window.Lotus.easeOut = easeOut; window.Lotus.clamp = clamp;
})();
