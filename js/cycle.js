// Cycle math: dates, periods derived from logs, predictions, phases and hormone model.
import { PERIOD_FLOWS } from './data.js';

const DAY = 86400000;

export function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function iso(d) {
  const x = startOfDay(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
export function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return startOfDay(x); }
export function diffDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / DAY); }
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Consecutive period-flow days (gaps of 1 day allowed) form one period.
export function periodsFromLogs(logs) {
  const days = Object.keys(logs).filter(k => PERIOD_FLOWS.includes(logs[k].flow)).sort();
  const out = [];
  let cur = null;
  for (const k of days) {
    const d = parseISO(k);
    if (cur && diffDays(d, cur.end) <= 2) cur.end = d;
    else { cur = { start: d, end: d }; out.push(cur); }
  }
  return out.map(p => ({ ...p, length: diffDays(p.end, p.start) + 1 }));
}

export function cycleStats(state) {
  const logs = state.logs;
  const periods = periodsFromLogs(logs);
  const lengths = [];
  for (let i = 1; i < periods.length; i++) {
    const l = diffDays(periods[i].start, periods[i - 1].start);
    if (l >= 15 && l <= 60) lengths.push(l);
  }
  const recent = lengths.slice(-6);
  const avgCycle = recent.length ? Math.round(mean(recent)) : state.profile.cycleLength;
  const plens = periods.slice(0, -1).concat(periods.slice(-1).filter(p => diffDays(new Date(), p.end) > 1))
    .filter(p => p.length <= 10).slice(-6).map(p => p.length);
  const avgPeriod = plens.length ? Math.round(mean(plens)) : state.profile.periodLength;
  const variation = recent.length > 1 ? Math.max(...recent) - Math.min(...recent) : 0;
  return { logs, periods, lengths, avgCycle, avgPeriod, variation };
}

export function ovulationDay(L, P) { return clamp(L - 14, P + 3, L - 5); }

export function phaseFor(cd, L, P) {
  const ov = ovulationDay(L, P);
  if (cd <= P) return 'menstrual';
  if (cd < ov - 1) return 'follicular';
  if (cd <= ov + 1) return 'ovulatory';
  return 'luteal';
}

// Day ranges for each phase, for charts.
export function phaseRanges(L, P) {
  const ov = ovulationDay(L, P);
  return [
    { key: 'menstrual', from: 1, to: P },
    { key: 'follicular', from: P + 1, to: ov - 2 },
    { key: 'ovulatory', from: ov - 1, to: ov + 1 },
    { key: 'luteal', from: ov + 2, to: L },
  ].filter(r => r.to >= r.from);
}

export function dayInfo(date, stats) {
  const { periods, avgCycle: L, avgPeriod: P, logs } = stats;
  if (!periods.length) return null;
  const d = startOfDay(date);
  const today = startOfDay(new Date());
  let startP = null;
  for (const p of periods) { if (p.start <= d) startP = p; else break; }
  if (!startP) return null;

  const last = periods[periods.length - 1];
  const nextRaw = addDays(last.start, L);
  const lateBy = diffDays(today, nextRaw); // >0 → late, 0 → due today
  const anchor = lateBy >= 0 ? addDays(today, 1) : nextRaw;

  let start = startP.start, predicted = false;
  if (startP === last && d >= anchor && d > today) {
    const k = Math.floor(diffDays(d, anchor) / L);
    start = addDays(anchor, k * L);
    predicted = true;
  }
  const cd = diffDays(d, start) + 1;
  const ov = ovulationDay(L, P);
  const phase = cd > L ? 'luteal' : phaseFor(cd, L, P);
  const log = logs[iso(d)] || {};
  const periodActual = PERIOD_FLOWS.includes(log.flow);
  const periodPredicted = !periodActual && d > today && cd <= P;
  const nextStart = (startP === last && !predicted) ? anchor : addDays(start, L);
  const isToday = d.getTime() === today.getTime();
  return {
    date: d, cd, L, P, ov, phase, predicted,
    fertile: cd >= ov - 5 && cd <= ov + 1,
    isOvulation: cd === ov,
    isPeriod: periodActual || periodPredicted, periodActual, periodPredicted,
    late: isToday && startP === last && lateBy > 0 ? lateBy : 0,
    dueToday: isToday && startP === last && lateBy === 0,
    daysToPeriod: Math.max(0, diffDays(nextStart, d)),
    daysToOv: cd < ov ? ov - cd : cd === ov ? 0 : (L - cd) + ov,
    cycleStart: start, nextStart,
  };
}

// ---- Hormone model (relative levels 0–1, shaped on textbook curves) ----
const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
function raw(cd, L, P) {
  const ov = ovulationDay(L, P);
  return {
    estrogen: 0.1 + 0.12 * g(cd, 3.5, 1.6) + 0.14 * clamp((cd - P) / (ov - P), 0, 1) / (1 + Math.exp((cd - ov - 1.5) / 0.9)) + 0.8 * g(cd, ov - 1.3, 2.4) + 0.42 * g(cd, ov + 7, 3.2),
    progesterone: 0.03 + 0.97 * g(cd, ov + 7.5, 3.6),
    lh: 0.07 + 0.93 * g(cd, ov - 0.4, 0.8),
    fsh: 0.2 + 0.18 * g(cd, 3, 4) + 0.38 * g(cd, ov - 0.4, 0.9) + 0.12 * g(cd, L + 1, 2),
    testosterone: 0.32 + 0.55 * g(cd, ov - 0.6, 3),
  };
}
const cache = {};
function maxes(L, P) {
  const k = L + ':' + P;
  if (!cache[k]) {
    const m = { estrogen: 0, progesterone: 0, lh: 0, fsh: 0, testosterone: 0 };
    for (let x = 1; x <= L; x += 0.1) { const r = raw(x, L, P); for (const h in m) m[h] = Math.max(m[h], r[h]); }
    cache[k] = m;
  }
  return cache[k];
}
export function hormonesAt(cd, L, P) {
  const x = clamp(cd, 1, L), r = raw(x, L, P), m = maxes(L, P), out = {};
  for (const h in r) out[h] = r[h] / m[h];
  return out;
}
export function hormoneLevel(v) { return v < 0.25 ? 'Low' : v < 0.5 ? 'Moderate' : v < 0.82 ? 'High' : 'Peak'; }
export function hormoneTrend(cd, L, P, h) {
  const a = hormonesAt(cd - 0.5, L, P)[h], b = hormonesAt(cd + 0.5, L, P)[h];
  return b - a > 0.03 ? 'rising' : a - b > 0.03 ? 'falling' : 'steady';
}
export function energyAt(cd, L, P) {
  const h = hormonesAt(cd, L, P);
  let e = 0.3 + 0.5 * h.estrogen + 0.2 * h.testosterone;
  if (cd <= 2) e -= 0.15;
  if (cd > L - 4) e -= 0.12;
  return clamp(e, 0.12, 1);
}
