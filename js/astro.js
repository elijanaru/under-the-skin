// Birth chart maths, in the spirit of flatlib (traditional Western astrology), written in plain JS so it runs offline.
// Planet positions use Paul Schlyter's published orbital elements (accurate to a few arc minutes, plenty for signs and degrees),
// the Ascendant and Midheaven come from sidereal time, houses are whole-sign, aspects and dignities follow the traditional tables.

const R = Math.PI / 180, rev = x => ((x % 360) + 360) % 360;
const sin = x => Math.sin(x * R), cos = x => Math.cos(x * R), atan2 = (y, x) => rev(Math.atan2(y, x) / R);

export const PLANETS = [
  { k: 'sun', name: 'Sun', glyph: '☉︎', orb: 15 },
  { k: 'moon', name: 'Moon', glyph: '☽︎', orb: 12 },
  { k: 'mercury', name: 'Mercury', glyph: '☿︎', orb: 7 },
  { k: 'venus', name: 'Venus', glyph: '♀︎', orb: 7 },
  { k: 'mars', name: 'Mars', glyph: '♂︎', orb: 8 },
  { k: 'jupiter', name: 'Jupiter', glyph: '♃︎', orb: 9 },
  { k: 'saturn', name: 'Saturn', glyph: '♄︎', orb: 9 },
];
export const SIGN_KEYS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

// Julian day from a UTC Date, and Schlyter's day number (0 = 2000 Jan 0.0 UT).
const jd = date => date.getTime() / 864e5 + 2440587.5;
const dayNo = date => jd(date) - 2451543.5;

function elements(k, d) {
  switch (k) {
    case 'sun': return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.0470 + 0.9856002585 * d };
    case 'moon': return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d };
    case 'mercury': return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
    case 'venus': return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
    case 'mars': return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
    case 'jupiter': return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
    case 'saturn': return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
  }
}

// Position in its orbit: ecliptic x, y, z around the central body (Sun, or Earth for the Moon).
function orbit({ N, i, w, a, e, M }) {
  M = rev(M);
  let E = M + (e / R) * sin(M) * (1 + e * cos(M));
  for (let n = 0; n < 6; n++) E = E - (E - (e / R) * sin(E) - M) / (1 - e * cos(E));
  const xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sin(E), v = atan2(yv, xv), r = Math.hypot(xv, yv), u = v + w;
  return { x: r * (cos(N) * cos(u) - sin(N) * sin(u) * cos(i)), y: r * (sin(N) * cos(u) + cos(N) * sin(u) * cos(i)), z: r * sin(u) * sin(i) };
}

// Tropical ecliptic longitude (degrees, equinox of date) of each traditional planet, seen from Earth.
export function longitudes(date) {
  const d = dayNo(date), S = elements('sun', d), sun = orbit(S), out = {};
  out.sun = atan2(sun.y, sun.x);
  const Mo = elements('moon', d), mo = orbit(Mo);
  const Ms = rev(S.M), Mm = rev(Mo.M), Ls = Ms + S.w, Lm = Mm + Mo.w + Mo.N, D = Lm - Ls, F = Lm - Mo.N;
  out.moon = rev(atan2(mo.y, mo.x)
    - 1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D) - 0.057 * sin(Mm - 2 * D + Ms)
    + 0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms) - 0.035 * sin(D) - 0.031 * sin(Mm + Ms)
    - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D));
  const Mj = rev(elements('jupiter', d).M), Mt = rev(elements('saturn', d).M);
  for (const k of ['mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
    const p = orbit(elements(k, d));
    let lon = atan2(p.y, p.x), r = Math.hypot(p.x, p.y, p.z), lat = Math.asin(p.z / r) / R;
    if (k === 'jupiter') lon += -0.332 * sin(2 * Mj - 5 * Mt - 67.6) - 0.056 * sin(2 * Mj - 2 * Mt + 21) + 0.042 * sin(3 * Mj - 5 * Mt + 21) - 0.036 * sin(Mj - 2 * Mt) + 0.022 * cos(Mj - Mt) + 0.023 * sin(2 * Mj - 3 * Mt + 52) - 0.016 * sin(Mj - 5 * Mt - 69);
    if (k === 'saturn') lon += 0.812 * sin(2 * Mj - 5 * Mt - 67.6) - 0.229 * cos(2 * Mj - 4 * Mt - 2) + 0.119 * sin(Mj - 2 * Mt - 3) + 0.046 * sin(2 * Mj - 6 * Mt - 69) + 0.014 * sin(Mj - 3 * Mt + 32);
    const xh = r * cos(lon) * cos(lat), yh = r * sin(lon) * cos(lat);
    out[k] = atan2(yh + sun.y, xh + sun.x);
  }
  return out;
}

// Ascendant and Midheaven for a moment and place (latitude north +, longitude east +).
export function angles(date, lat, lng) {
  const d = dayNo(date), eps = 23.4393 - 3.563e-7 * d;
  const ramc = rev(280.46061837 + 360.98564736629 * (jd(date) - 2451545) + lng);
  const asc = atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(lat * R) * sin(eps)));
  const mc = atan2(sin(ramc), cos(ramc) * cos(eps));
  return { asc, mc };
}

export const signOf = lon => SIGN_KEYS[Math.floor(rev(lon) / 30)];
export const degIn = lon => rev(lon) % 30;

// Traditional dignities: a planet is strongest at home (domicile) or exalted, weakest in detriment or fall.
const DOMICILE = { sun: ['leo'], moon: ['cancer'], mercury: ['gemini', 'virgo'], venus: ['taurus', 'libra'], mars: ['aries', 'scorpio'], jupiter: ['sagittarius', 'pisces'], saturn: ['capricorn', 'aquarius'] };
const EXALT = { sun: 'aries', moon: 'taurus', mercury: 'virgo', venus: 'pisces', mars: 'capricorn', jupiter: 'cancer', saturn: 'libra' };
const opp = s => SIGN_KEYS[(SIGN_KEYS.indexOf(s) + 6) % 12];
export function dignity(p, sign) {
  if (DOMICILE[p].includes(sign)) return 'home';
  if (EXALT[p] === sign) return 'exalted';
  if (DOMICILE[p].map(opp).includes(sign)) return 'detriment';
  if (opp(EXALT[p]) === sign) return 'fall';
  return '';
}

// The five classical (Ptolemaic) aspects. Orb = half the sum of both planets' orbs, as in traditional practice.
export const ASPECTS = [
  { k: 'conjunction', name: 'together with', angle: 0, glyph: '☌︎' },
  { k: 'sextile', name: 'sextile', angle: 60, glyph: '⚹︎' },
  { k: 'square', name: 'square', angle: 90, glyph: '□︎' },
  { k: 'trine', name: 'trine', angle: 120, glyph: '△︎' },
  { k: 'opposition', name: 'opposite', angle: 180, glyph: '☍︎' },
];
export function aspectBetween(a, b, orbA, orbB, tight = 1) {
  const d = Math.abs(((a - b + 540) % 360) - 180), max = (orbA + orbB) / 2 * tight;
  for (const x of ASPECTS) { const off = Math.abs(d - x.angle); if (off <= max) return { ...x, off }; }
  return null;
}

// Local birth time at a place in an IANA time zone → the real UTC moment (handles summer time of that year).
export function zonedToUTC(dateISO, timeHM, tz) {
  const [y, m, d] = dateISO.split('-').map(Number), [hh, mm] = (timeHM || '12:00').split(':').map(Number);
  const want = Date.UTC(y, m - 1, d, hh, mm);
  if (!tz) return new Date(want);
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  let t = want;
  for (let n = 0; n < 3; n++) {
    const p = Object.fromEntries(fmt.formatToParts(new Date(t)).map(x => [x.type, x.value]));
    const seen = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    t += want - seen;
  }
  return new Date(t);
}

// A full chart: planets with sign, degree, house and dignity, plus the angles when the birth time and place are known.
export function chart({ date, time, place }) {
  const when = zonedToUTC(date, time, place && place.tz), L = longitudes(when);
  const ang = time && place ? angles(when, place.lat, place.lng) : null;
  const ascSign = ang ? SIGN_KEYS.indexOf(signOf(ang.asc)) : null;
  const house = lon => ascSign == null ? null : ((SIGN_KEYS.indexOf(signOf(lon)) - ascSign + 12) % 12) + 1;
  const planets = PLANETS.map(p => ({ ...p, lon: L[p.k], sign: signOf(L[p.k]), deg: degIn(L[p.k]), house: house(L[p.k]), dignity: dignity(p.k, signOf(L[p.k])) }));
  const aspects = [];
  for (let i = 0; i < planets.length; i++) for (let j = i + 1; j < planets.length; j++) {
    const a = aspectBetween(planets[i].lon, planets[j].lon, planets[i].orb, planets[j].orb, .6);
    if (a) aspects.push({ a: planets[i].k, b: planets[j].k, ...a });
  }
  return { date, when, planets, aspects: aspects.sort((x, y) => x.off - y.off), asc: ang && { lon: ang.asc, sign: signOf(ang.asc), deg: degIn(ang.asc) }, mc: ang && { lon: ang.mc, sign: signOf(ang.mc), deg: degIn(ang.mc) }, house, hasTime: !!(time && place) };
}

// Today's sky against her chart: where the Moon is, which house it lights up, and the closest touches to her planets.
export function transits(natal, now = new Date()) {
  const L = longitudes(now), hits = [];
  for (const t of PLANETS) for (const n of natal.planets) {
    if (t.k === 'moon' && n.k === 'moon') continue;
    const a = aspectBetween(L[t.k], n.lon, t.k === 'moon' ? 6 : 3, t.k === 'moon' ? 6 : 3);
    if (a) hits.push({ t: t.k, n: n.k, ...a });
  }
  return { moon: { lon: L.moon, sign: signOf(L.moon), house: natal.house(L.moon) }, sky: L, hits: hits.sort((x, y) => (x.t === 'moon' ? 0 : 1) - (y.t === 'moon' ? 0 : 1) || x.off - y.off) };
}

// ---------- the Moon page: real phase, age and the next new and full moon ----------
// Elongation is the Moon's angle from the Sun: 0 new, 90 first quarter, 180 full, 270 last quarter.
export const elongation = date => { const L = longitudes(date); return rev(L.moon - L.sun); };
// first moment after `from` (within `days`) when the elongation crosses `target`
function nextCross(from, target, days = 32) {
  const off = t => rev(elongation(t) - target + 180) - 180; // -180..180, crosses 0 going up
  let a = from, fa = off(a);
  for (let h = 6; h <= days * 24; h += 6) {
    const b = new Date(from.getTime() + h * 36e5), fb = off(b);
    if (fa < 0 && fb >= 0 && fb - fa < 90) {
      for (let i = 0; i < 24; i++) { const m = new Date((a.getTime() + b.getTime()) / 2); if (off(m) < 0) a = m; else b.setTime(m.getTime()); }
      return new Date((a.getTime() + b.getTime()) / 2);
    }
    a = b; fa = fb;
  }
  return null;
}
function prevNew(now) { const back = new Date(now.getTime() - 31 * 864e5); let t = nextCross(back, 0), last = t; while (t && t <= now) { last = t; t = nextCross(new Date(t.getTime() + 864e5), 0); } return last; }
export function moonNow(now = new Date()) {
  const L = longitudes(now), e = rev(L.moon - L.sun), last = prevNew(now);
  return { elong: e, illum: (1 - Math.cos(e * Math.PI / 180)) / 2, waxing: e < 180, sign: signOf(L.moon), deg: degIn(L.moon),
    age: last ? (now - last) / 864e5 : e / 360 * 29.53, lastNew: last, nextNew: nextCross(now, 0), nextFull: nextCross(now, 180) };
}
// when the Moon next enters `sign` (about every 27.3 days), and whether it is there now
export function moonInSign(sign, now = new Date()) {
  const inIt = t => signOf(longitudes(t).moon) === sign;
  if (inIt(now)) { let t = new Date(now); while (inIt(t)) t = new Date(t.getTime() + 36e5); return { now: true, until: t }; }
  for (let h = 2; h < 30 * 24; h += 2) { const t = new Date(now.getTime() + h * 36e5); if (inIt(t)) { let s = new Date(t.getTime() - 2 * 36e5); while (!inIt(s)) s = new Date(s.getTime() + 15 * 6e4); return { now: false, from: s }; } }
  return null;
}
