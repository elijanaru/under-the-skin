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
