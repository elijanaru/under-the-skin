// Tiny synthesized sound effects (no audio files): airy whooshes for the welcome screen.
let ctx = null;
function ac() {
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// One master volume for every sound, so a single tap mutes them all (remembered on this phone).
let master = null, muted = (() => { try { return localStorage.getItem('uts.sound') === 'off'; } catch { return false; } })();
function out(c) { if (!master) { master = c.createGain(); master.gain.value = muted ? 0 : 1; master.connect(c.destination); } return master; }
export const isMuted = () => muted;
export function setMuted(m) {
  muted = !!m; try { localStorage.setItem('uts.sound', muted ? 'off' : 'on'); } catch {}
  if (master && ctx) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(muted ? 0 : 1, t + .4); }
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
  src.connect(bp); bp.connect(g); (pan ? (g.connect(pan), pan) : g).connect(out(c));
  src.start(t); src.stop(t + dur + 0.2);
  if (boom) { // soft low swell under the whoosh
    const o = c.createOscillator(), og = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(90, t + dur * 0.55); o.frequency.exponentialRampToValueAtTime(38, t + dur + 0.6);
    og.gain.setValueAtTime(0.0001, t + dur * 0.5); og.gain.exponentialRampToValueAtTime(vol * 0.9, t + dur * 0.7); og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
    o.connect(og); og.connect(out(c)); o.start(t + dur * 0.5); o.stop(t + dur + 0.9);
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
    o.connect(g); g.connect(out(c)); o.start(t + d); o.stop(t + d + 0.65);
  });
}
// Very soft, warm bell for button presses: a mellow sine with a gentle octave and a quiet airy breath.
export function soft({ vol = 0.09 } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime, out = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 2400; out.gain.value = 1; out.connect(lp); lp.connect(out(c));
  [[523.25, 1], [1046.5, .35], [783.99, .25]].forEach(([f, a], i) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.02 + i * .01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.5);
  });
}

// ---- natural sounds: wind through leaves and soft singing-bowl tones (no whoosh, no boom) ----
// Pinkish noise, low-passed, swelling and settling like a breeze moving through a forest.
function pink(c, secs) {
  const b = c.createBuffer(2, Math.ceil(c.sampleRate * secs), c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099; b1 = .963 * b1 + w * .2965; b2 = .57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * .1848) * .16; } }
  const s = c.createBufferSource(); s.buffer = b; return s;
}
export function breeze({ dur = 3.2, vol = 0.22, bright = 1 } = {}) {
  const c = ac(); if (!c) return false;
  const t = c.currentTime, src = pink(c, dur + .3), lp = c.createBiquadFilter(), hp = c.createBiquadFilter(), g = c.createGain();
  lp.type = 'lowpass'; lp.Q.value = .4; hp.type = 'highpass'; hp.frequency.value = 180;
  // the filter opens and closes twice, like two gusts
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(1400 * bright, t + dur * .35); lp.frequency.linearRampToValueAtTime(800, t + dur * .55);
  lp.frequency.linearRampToValueAtTime(1900 * bright, t + dur * .75); lp.frequency.linearRampToValueAtTime(600, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .4);
  g.gain.setTargetAtTime(vol * .7, t + dur * .55, .3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .2);
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out(c)); src.start(t); src.stop(t + dur + .3);
  return c.state === 'running';
}
// A soft bowl / wind-chime tone: sine partials with a slow shimmer and a long natural decay.
export function bowl({ notes = [523.25], gap = .18, vol = 0.07, decay = 3.2, delay = 0 } = {}) {
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + delay, lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(out(c));
  notes.forEach((f, n) => {
    const t = t0 + n * gap;
    [[1, 1], [2.01, .28], [2.76, .12]].forEach(([m, a]) => {
      const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'sine'; o.frequency.value = f * m; lfo.frequency.value = 4.5 + n * .7; lg.gain.value = f * m * .0025; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + .03); g.gain.exponentialRampToValueAtTime(0.0001, t + decay * (m === 1 ? 1 : .6));
      o.connect(g); g.connect(lp); o.start(t); lfo.start(t); o.stop(t + decay + .1); lfo.stop(t + decay + .1);
    });
  });
}
// The moments of the intro: only air, no bells or dings.
export const introSound = () => breeze({ dur: 4, vol: .12 });
export const enterSound = () => breeze({ dur: 2.2, vol: .16, bright: 1.3 });
export const arriveSound = () => breeze({ dur: 3.4, vol: .1 });
// Rain and birds under the whole onboarding: a 72 s seamless loop, faded in and out.
let amb = null, ambWant = false, ambLoading = null;
export function ambience(on, { vol = .32, fade = on ? 2.5 : 3.5 } = {}) {
  ambWant = on;
  const c = ac(); if (!c) return;
  if (on && !amb) {
    if (!ambLoading) ambLoading = fetch('sounds/forest-rain.m4a').then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(buf => {
      const src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; src.loop = true; g.gain.value = 0.0001;
      src.connect(g); g.connect(out(c)); src.start(); amb = { src, g }; ambLoading = null; ambience(ambWant, { vol });
    }).catch(() => { ambLoading = null; });
    return;
  }
  if (!amb) return;
  const t = c.currentTime, g = amb.g.gain;
  g.cancelScheduledValues(t); g.setValueAtTime(Math.max(g.value, 0.0001), t);
  g.exponentialRampToValueAtTime(on ? vol : 0.0001, t + fade);
  if (!on) { const a = amb; setTimeout(() => { if (!ambWant && amb === a) { try { a.src.stop(); } catch {} amb = null; } }, fade * 1000 + 200); }
}
