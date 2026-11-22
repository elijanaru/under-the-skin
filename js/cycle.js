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
  // one or two days of bleeding less than 21 days after a period started is spotting, not a new cycle: it stays on the
  // calendar but doesn't restart her cycle (unless it is happening right now, when it may be an early period beginning)
  const today = startOfDay(new Date()), kept = [];
  for (const p of out.map(p => ({ ...p, length: diffDays(p.end, p.start) + 1 }))) {
    const prev = kept[kept.length - 1], now = diffDays(today, p.end) <= 1;
    if (prev && p.length <= 2 && diffDays(p.start, prev.start) < 21 && !now) continue;
    kept.push(p);
  }
  return kept;
}

export function cycleStats(state) {
  const logs = state.logs;
  const periods = periodsFromLogs(logs);
  const lengths = [];
  for (let i = 1; i < periods.length; i++) {
    const l = diffDays(periods[i].start, periods[i - 1].start);
    // under 21 days is usually spotting or a one-off, not a cycle: keep it out of the average so one early bleed doesn't halve every prediction
    if (l >= 21 && l <= 60) lengths.push(l);
  }
  // a cycle about twice her usual length almost always means one period went unlogged, so with at least two
  // other cycles to compare, it stays out of the average (her real cycles are still counted)
  const med = a => { const b = [...a].sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
  const clean = lengths.filter((l, i) => { const rest = lengths.filter((_, j) => j !== i); return rest.length < 2 || l < 1.75 * med(rest); });
  const recent = clean.slice(-6);
  // "I'm not sure" in onboarding: start from 28 days, and her first full logged cycle replaces it straight away
  const avgCycle = recent.length ? Math.round(mean(recent)) : (+state.profile.cycleLength || 28);
  const learning = !recent.length && !!state.profile.cycleUnsure;
  const plens = periods.slice(0, -1).concat(periods.slice(-1).filter(p => diffDays(new Date(), p.end) > 1))
    .filter(p => p.length <= 10).slice(-6).map(p => p.length);
  const avgPeriod = plens.length ? Math.round(mean(plens)) : (+state.profile.periodLength || 5);
  const variation = recent.length > 1 ? Math.max(...recent) - Math.min(...recent) : 0;
  const ovSeen = learnLuteal(logs, periods, avgCycle);
  // On the pill (19 Nov 2026): the pill stops egg release, and the bleed comes in the pill break, so it is predicted from
  // her pack (21 + 7: bleed about day 23 to 27; 24 + 4: about day 26 to 28), not from her past cycles. Implant, shot,
  // ring and patch also stop egg release. A hormonal IUD usually doesn't, and coming off the pill brings it back.
  const pr = state.profile || {}, onPill = pr.bc === 'pill' && pr.bcPlan !== 'stop';
  const pill = onPill && /^\d{4}-\d\d-\d\d$/.test(pr.pillStart || '') && pr.pillKind !== 'cont'
    ? { start: parseISO(pr.pillStart), kind: pr.pillKind === '24' ? '24' : '21', from: pr.pillKind === '24' ? 26 : 23, to: pr.pillKind === '24' ? 28 : 27 } : null;
  const noOv = onPill || (pr.bc === 'other' && pr.bcPlan !== 'stop');
  // on a no-break or mini pill, or before her pack is set, there is no bleed the app can honestly predict
  const noPred = onPill && !pill;
  return { logs, periods, lengths: clean, learning, avgCycle: pill ? 28 : avgCycle, avgPeriod: pill ? pill.to - pill.from + 1 : avgPeriod, variation, ovSeen, pill, noOv, noPred };
}

// Egg-white discharge is the peak fertile sign: the last egg-white day of a cycle is taken as her egg release.
// From those days we learn her own luteal length (egg release to next period, 14 by default), and an
// egg-white day in the current cycle moves this cycle's egg release straight to it.
let LUTEAL = 14;
function learnLuteal(logs, periods, L) {
  const egg = Object.keys(logs).filter(k => logs[k].fluid === 'Egg white').sort().map(parseISO);
  const seen = [], past = [];
  periods.forEach((p, i) => {
    const next = periods[i + 1], end = next ? next.start : addDays(p.start, 60);
    const ds = egg.filter(d => d >= addDays(p.start, p.length + 2) && d < end);
    if (!ds.length) return;
    const cd = diffDays(ds[ds.length - 1], p.start) + 1;
    if (next) { const lut = diffDays(next.start, p.start) - cd + 1; if (lut >= 9 && lut <= 18) past.push(lut); }
    seen.push({ start: p.start, cd, current: !next });
  });
  const cur = seen.find(x => x.current);
  const learned = past.length ? Math.round(mean(past.slice(-4))) : null;
  LUTEAL = cur && cur.cd < L - 3 ? L - cur.cd : learned || 14;
  return { cycles: seen.length, cd: cur ? cur.cd : null, luteal: learned };
}

export function ovulationDay(L, P) { return clamp(L - LUTEAL, P + 3, L - 5); }

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
  let cd = diffDays(d, start) + 1;
  // a finished cycle is placed by when her next period really came, not by the average: egg release sits a luteal
  // length before that bleed. Under 21 days was most likely spotting or an early bleed, so no fertile days are drawn.
  const nextP = predicted ? null : periods[periods.indexOf(startP) + 1];
  const Lc = nextP ? diffDays(nextP.start, startP.start) : 0;
  const Lx = Lc >= 21 && Lc <= 60 ? Lc : L, tooShort = Lc > 0 && Lc < 21;
  const ov = ovulationDay(Lx, P);
  let phase = cd > Lx ? 'luteal' : tooShort && cd > P ? 'follicular' : phaseFor(cd, Lx, P);
  // on the pill her "cycle day" counts from the start of the last pill-break bleed (pack day `from`), so the ring,
  // the phase and the countdown to the next bleed always add up to her 28-day pack
  const pk0 = stats.pill;
  if (pk0 && d >= addDays(pk0.start, -28)) {
    const pdd = ((diffDays(d, pk0.start) % 28) + 28) % 28 + 1;
    cd = ((pdd - pk0.from) % 28 + 28) % 28 + 1; start = addDays(d, 1 - cd);
    // no egg release on the pill, so no ovulatory days: bleed, then a rising half, then a quieter half before the break
    phase = cd <= pk0.to - pk0.from + 1 ? 'menstrual' : cd <= 14 ? 'follicular' : 'luteal';
  }
  const log = logs[iso(d)] || {};
  const periodActual = PERIOD_FLOWS.includes(log.flow);
  // today counts too: on day 2 of her period before she has logged today, she is still on her period
  const periodPredicted = !stats.noPred && !periodActual && d >= today && cd <= P;
  const nextStart = (startP === last && !predicted) ? anchor : nextP ? nextP.start : addDays(start, L);
  const isToday = d.getTime() === today.getTime();
  // pill: the next bleed is the next pill break she hasn't bled in yet
  const pk = stats.pill; let pillDay = null, pillPred = periodPredicted, pillNext = nextStart;
  if (pk) {
    const pd = x => ((diffDays(x, pk.start) % 28) + 28) % 28 + 1, pt = pd(today);
    let nb = addDays(today, pk.from - pt); if (pt > pk.to) nb = addDays(nb, 28);
    if (nb <= today && last.start >= addDays(nb, -3)) nb = addDays(nb, 28); // this break's bleed is already logged
    pillDay = pd(d); const ws = addDays(d, pk.from - pillDay);
    // a break that is still to come, or the one she is bleeding in now (its first day already logged)
    pillPred = !periodActual && d >= today && pillDay >= pk.from && pillDay <= pk.to && (ws >= nb || last.start >= addDays(ws, -3));
    pillNext = nb;
  }
  const noOv = !!stats.noOv;
  return {
    date: d, cd, L: Lx, P, ov, phase, predicted,
    fertile: !noOv && !tooShort && cd >= ov - 5 && cd <= ov + 1,
    isOvulation: !noOv && !tooShort && cd === ov,
    isPeriod: periodActual || (pk ? pillPred : periodPredicted), periodActual, periodPredicted: pk ? pillPred : periodPredicted,
    // while the app is still guessing her length ("I'm not sure"), passing day 28 is not "late": the period is simply due any day
    late: !pk && !noOv && !stats.noPred && !stats.learning && isToday && startP === last && lateBy > 0 ? lateBy : 0,
    anyDay: !pk && !stats.noPred && !!stats.learning && isToday && startP === last && lateBy >= 0,
    dueToday: !pk && isToday && startP === last && lateBy === 0,
    daysToPeriod: Math.max(0, diffDays(pk ? pillNext : nextStart, d)),
    daysToOv: noOv ? 999 : cd < ov ? ov - cd : cd === ov ? 0 : (L - cd) + ov,
    cycleStart: start, nextStart: pk ? pillNext : nextStart, noOv, pillDay, noPred: !!stats.noPred,
  };
}

// ---- Hormone model ----
// One shared scale, shaped on the standard textbook curves (28-day reference charts, scaled to her cycle):
// LH surge is the tallest spike, estrogen peaks ~1–2 days before ovulation, dips but stays above period levels, then a
// second luteal hump about half the height of the first (estradiol ~40 pg/mL early, ~250 at the peak, ~140 mid-luteal);
// progesterone rises after ovulation and peaks ~7 days later; FSH has an early-follicular hump and a small
// mid-cycle spike; testosterone stays low with only a gentle rise around ovulation.
const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
const ga = (x, mu, sl, sr) => g(x, mu, x < mu ? sl : sr); // asymmetric bell
function raw(cd, L, P) {
  const ov = ovulationDay(L, P), f = (ov - 1) / 13; // stretch follicular shapes to her follicular length
  return {
    estrogen: 0.12 + 0.83 * ga(cd, ov - 1.6, 3.4 * f, 1.6) + 0.42 * ga(cd, ov + 7, 3.6, 2.6),
    progesterone: 0.07 + 0.78 * ga(cd, ov + 7.5, 3.4, 2.7),
    lh: 0.1 + 0.04 * g(cd, 3, 3 * f) + 1.15 * ga(cd, ov - 0.8, 0.7, 1.15) + 0.03 * g(cd, ov + 5, 4),
    fsh: 0.08 + 0.17 * g(cd, 4 * f + 1, 3.3 * f) + 0.27 * ga(cd, ov - 0.7, 0.8, 1.3) + 0.12 * g(cd, L + 1.5, 1.8),
    testosterone: 0.06 + 0.07 * g(cd, ov - 0.5, 2.2),
  };
}
// Shared-scale levels for drawing the curves (estrogen peak ≈ 0.95, LH surge ≈ 1.25).
export function hormonesAt(cd, L, P) { return raw(clamp(cd, 1, L + 1), L, P); }
const cache = {};
function range(L, P) {
  const k = L + ':' + P;
  if (!cache[k]) {
    const lo = {}, hi = {};
    for (let x = 1; x <= L; x += 0.1) { const r = raw(x, L, P); for (const h in r) { lo[h] = Math.min(lo[h] ?? 9, r[h]); hi[h] = Math.max(hi[h] ?? 0, r[h]); } }
    cache[k] = { lo, hi };
  }
  return cache[k];
}
// 0–1 position of each hormone within its own monthly range — used for labels, bars and energy.
export function hormonesRel(cd, L, P) {
  const r = hormonesAt(cd, L, P), { lo, hi } = range(L, P), out = {};
  for (const h in r) out[h] = clamp((r[h] - lo[h]) / (hi[h] - lo[h]), 0, 1);
  return out;
}
export function hormoneLevel(r) { return r < 0.2 ? 'Low' : r < 0.45 ? 'Moderate' : r < 0.8 ? 'High' : 'Peak'; }
// Which way a hormone is heading. On its top or bottom day (higher or lower than both neighbours) it is
// "steady": the day of the estrogen peak must not show a falling arrow next to "Peak".
export function trendOf(prev, today, next) {
  if ((today >= prev && today >= next) || (today <= prev && today <= next)) return 'steady';
  return next - today > 0.03 ? 'rising' : today - next > 0.03 ? 'falling' : 'steady';
}
export function hormoneTrend(cd, L, P, h) {
  const r = d => hormonesRel(d, L, P)[h];
  return trendOf(r(cd - 1), r(cd), r(cd + 1));
}
// Typical energy (0–1). Changes across the cycle are real but moderate: lowest in the days before and the first
// days of the period, rising with estrogen, highest around ovulation, steady in the early/mid luteal phase.
export function energyAt(cd, L, P) {
  const h = hormonesRel(cd, L, P), late = cd > L - 4;
  let e = 0.48 + 0.34 * h.estrogen + 0.08 * h.testosterone + (late ? 0 : 0.06 * h.progesterone);
  if (cd <= 2) e -= 0.06;       // heaviest bleeding days
  if (late) e -= 0.06 * (cd - (L - 4)) / 4 + 0.04; // premenstrual dip
  return clamp(e, 0.35, 0.92);
}
