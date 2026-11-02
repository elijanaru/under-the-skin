// Tiny synthesized sound effects (no audio files): airy whooshes for the welcome screen.
let ctx = null;
function ac() {
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function noise(c, secs) {
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * secs), c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = b; return s;
}
// A filtered-noise sweep. `up` sweeps the filter upward (arriving), otherwise down (passing by).
export function whoosh({ dur = 1.6, vol = 0.5, from = 300, to = 3200, boom = false } = {}) {
  const c = ac(); if (!c) return false;
  const t = c.currentTime, src = noise(c, dur + 0.2);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur * 0.75);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const pan = c.createStereoPanner ? c.createStereoPanner() : null;
  if (pan) { pan.pan.setValueAtTime(-0.5, t); pan.pan.linearRampToValueAtTime(0.5, t + dur); }
  src.connect(bp); bp.connect(g); (pan ? (g.connect(pan), pan) : g).connect(c.destination);
  src.start(t); src.stop(t + dur + 0.2);
  if (boom) { // soft low swell under the whoosh
    const o = c.createOscillator(), og = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(90, t + dur * 0.55); o.frequency.exponentialRampToValueAtTime(38, t + dur + 0.6);
    og.gain.setValueAtTime(0.0001, t + dur * 0.5); og.gain.exponentialRampToValueAtTime(vol * 0.9, t + dur * 0.7); og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
    o.connect(og); og.connect(c.destination); o.start(t + dur * 0.5); o.stop(t + dur + 0.9);
  }
  return c.state === 'running';
}
// Soft glassy chime for hovering buttons (two quick sine notes with a gentle fade).
let lastChime = 0;
export function chime({ vol = 0.12 } = {}) {
  const c = ac(); if (!c || c.state !== 'running') return;
  const now = performance.now(); if (now - lastChime < 350) return; lastChime = now;
  const t = c.currentTime;
  [[1318.5, 0], [1975.5, 0.06]].forEach(([f, d]) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(vol, t + d + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.6);
    o.connect(g); g.connect(c.destination); o.start(t + d); o.stop(t + d + 0.65);
  });
}
// Very soft, warm bell for button presses: a mellow sine with a gentle octave and a quiet airy breath.
export function soft({ vol = 0.09 } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime, out = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 2400; out.gain.value = 1; out.connect(lp); lp.connect(c.destination);
  [[523.25, 1], [1046.5, .35], [783.99, .25]].forEach(([f, a], i) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.02 + i * .01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.5);
  });
}
