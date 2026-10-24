import {
  PHASES, PHASE_ORDER, PHASE_COLOR, RECIPES, ARTICLES, FLOWS, PERIOD_FLOWS, SYMPTOMS, MOODS, FLUIDS, SEX, LIBIDO, GOALS, TCM, RITUALS, SUPPORT, NUTRITION, SYMPTOM_FOODS, EVIDENCE, RELIEF, REMEDIES, DAY_GUIDE, MOVES, MOVE_GUIDE, HORMONE_LIBRARY, HABITS, FERTILITY_FOODS,
} from './data.js';
import * as C from './cycle.js';
import { icon } from './icons.js';
import * as Z from './cosmic.js';
import { mountFigure, mushroomArt, nautilusArt } from './figure.js';
import { mountTorso } from './torso.js';
import { RECIPE_PHOTOS, photoUrl, DISH_PHOTOS, dishPhoto, HORMONE_PHOTOS, hormonePhoto } from './photos.js';
import * as SZ from './seasonal.js';

const KEY = 'rhythm.v1';
const $app = document.getElementById('app');
const $overlay = document.getElementById('overlay');
const $toast = document.getElementById('toast');

let state = load();
const ui = {
  nourishPhase: null, openNeed: 0,
  shareAudience: 'partner', shareFertile: false,
  selected: C.iso(new Date()), planTab: 'nourish', calMonth: null, calSelected: C.iso(new Date()),
  logDate: null, onbStep: 0, onb: { name: '', last: C.iso(C.addDays(new Date(), -10)), cycleLength: 28, periodLength: 5, goals: [] },
  timer: null, checked: {}, hidden: {}, lastRoute: '',
};

function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (d, o) => d.toLocaleDateString('en-US', o);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const todayISO = () => C.iso(new Date());
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
function getLog(k) { return state.logs[k] || {}; }
function setLog(k, patch) {
  const cur = { ...getLog(k), ...patch };
  for (const f in cur) { const v = cur[f]; if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) delete cur[f]; }
  if (Object.keys(cur).length) state.logs[k] = cur; else delete state.logs[k];
  save();
}
function route() {
  const h = location.hash.replace(/^#\/?/, '') || 'today';
  const [path, q] = h.split('?');
  const [name, id] = path.split('/');
  return { name, id, q: new URLSearchParams(q || ''), key: h };
}
function go(h) { location.hash = '#/' + h; }
function toast(msg) {
  $toast.textContent = msg; $toast.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => $toast.classList.remove('show'), 1600);
}
let M;
function model() { const stats = C.cycleStats(state); return { stats, today: C.startOfDay(new Date()), info: C.dayInfo(new Date(), stats) }; }
function pick(list, seed) { return list[((seed % list.length) + list.length) % list.length]; }
function dayNum(d) { return Math.floor(C.startOfDay(d).getTime() / 864e5); }

// ---------- shared chrome ----------
function statusbar() {
  const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '');
  return `<div class="statusbar"><span>${t}</span><span class="island"></span><span class="sb-icons">
    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
    <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="22.5" y="4" width="1.8" height="4" rx="1" fill="currentColor" opacity=".5"/></svg>
  </span></div>`;
}
function topbar(title, { back } = {}) {
  const left = back
    ? `<button class="icon-btn dark" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>`
    : `<span class="tb-spacer"></span>`;
  return `<header class="topbar">${left}<div class="topbar-title">${title}</div>
    <button class="icon-btn dark" data-action="nav" data-to="profile" aria-label="Menu">${icon('menu', 22)}</button></header>`;
}
function tabbar(active) {
  const items = [['today', 'home', 'Today'], ['calendar', 'calendar', 'Calendar'], ['log', 'plus', 'Log'], ['plan', 'yinyang', 'Nourish & rituals'], ['insights', 'chart', 'Insights']];
  return `<nav class="tabbar">${items.map(([to, ic, label]) =>
    `<button class="tab ${to === 'log' ? 'tab-main' : ''} ${active === to ? 'active' : ''}" data-action="nav" data-to="${to}" aria-label="${label}">${icon(ic, to === 'log' ? 26 : 21)}</button>`).join('')}</nav>`;
}
function sectionTitle(t, more) {
  return `<div class="section-title"><h3>${t}</h3>${more ? `<button class="link" data-action="nav" data-to="${more[1]}">${more[0]}</button>` : ''}</div>`;
}

// ---------- SVG: phase ring ----------
function polar(cx, cy, r, a) { const t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
function ring(info, size = 270) {
  const { L, P, cd } = info, cx = size / 2, cy = size / 2, r = size / 2 - 16;
  const ang = d => -90 + (d - 1) / L * 360;
  const col = PHASE_COLOR.light;
  const arcs = C.phaseRanges(L, P).map(s => {
    const active = s.key === info.phase;
    return `<path d="${arcPath(cx, cy, r, ang(s.from) + 1.6, ang(s.to + 1) - 1.6)}" stroke="${col[s.key]}" stroke-width="${active ? 14 : 8}" stroke-linecap="round" fill="none" opacity="${active ? 1 : .35}"/>`;
  }).join('');
  let ticks = '';
  for (let d = 1; d <= L; d++) {
    const [x, y] = polar(cx, cy, r - 22, ang(d) + 180 / L);
    const past = d < Math.min(cd, L + 1);
    ticks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${d === info.ov ? 3.2 : 1.6}" fill="${d === info.ov ? col.ovulatory : '#0d0f0d'}" opacity="${d === info.ov ? 1 : past ? .55 : .14}"/>`;
  }
  const m = Math.min(cd, L);
  const [mx, my] = polar(cx, cy, r, ang(m) + 180 / L);
  const sub = info.late ? `Period ${plural(info.late, 'day')} late`
    : info.dueToday ? 'Period expected today'
    : info.isPeriod ? (info.periodActual ? 'Period' : 'Period likely')
    : info.isOvulation ? 'Ovulation day'
    : info.daysToOv <= 5 && info.cd < info.ov ? `Ovulation in ${plural(info.daysToOv, 'day')}`
    : `Period in ${plural(info.daysToPeriod, 'day')}`;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="100%">
    <defs><radialGradient id="ringGlow"><stop offset="0" stop-color="${col[info.phase]}" stop-opacity=".22"/><stop offset="1" stop-color="${col[info.phase]}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r - 34}" fill="url(#ringGlow)" class="ring-breathe"/>
    ${arcs}${ticks}
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="13" fill="#fff" stroke="#0d0f0d" stroke-width="1.5"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="5" fill="#0d0f0d"/>
    <text x="${cx}" y="${cy - 34}" text-anchor="middle" class="ring-label">CYCLE DAY</text>
    <text x="${cx}" y="${cy + 26}" text-anchor="middle" class="ring-num">${cd}</text>
    <text x="${cx}" y="${cy + 54}" text-anchor="middle" class="ring-sub">${sub}</text>
  </svg>`;
}

// ---------- flowing cycle hero (dark, liquid rings, glowing phase arc, today orb) ----------
function ringSub(info) {
  return info.late ? `Period ${plural(info.late, 'day')} late`
    : info.dueToday ? 'Period expected today'
    : info.isPeriod ? (info.periodActual ? `Period · day ${info.cd}` : 'Period likely')
    : info.isOvulation ? 'Egg release today'
    : info.daysToOv <= 5 && info.cd < info.ov ? `Ovulation in ${plural(info.daysToOv, 'day')}`
    : `Period in ${plural(info.daysToPeriod, 'day')}`;
}
function flowRing(info, id = 'fr', showOv = true) {
  const S = 300, c = S / 2, R = 116, { L, P } = info, cd = Math.min(info.cd, L);
  const ang = d => -90 + (d - 1) / L * 360;
  const liquid = (r0, a, k, ph, a2, k2) => { let d = ''; for (let t = 0; t <= 360; t += 3) { const th = t * Math.PI / 180, r = r0 + a * Math.sin(k * th + ph) + a2 * Math.sin(k2 * th - ph); d += `${d ? 'L' : 'M'}${(c + r * Math.cos(th)).toFixed(1)} ${(c + r * Math.sin(th)).toFixed(1)}`; } return d + 'Z'; };
  const arcs = C.phaseRanges(L, P).map(r => { const on = r.key === info.phase;
    return `<path class="fh-arc ${on ? 'on' : ''}" d="${arcPath(c, c, R, ang(r.from) + 1.2, ang(r.to + 1) - 1.2)}" stroke="${on ? `url(#${id}-g)` : PHASE_COLOR.dark[r.key]}" stroke-width="${on ? 7 : 2}" stroke-linecap="round" fill="none" opacity="${on ? 1 : .3}" ${on ? `filter="url(#${id}-glow)"` : ''} pathLength="1"/>`; }).join('');
  const [mx, my] = polar(c, c, R, ang(cd) + 180 / L), [ox, oy] = polar(c, c, R, ang(info.ov) + 180 / L);
  const col = PHASE_COLOR.dark[info.phase];
  return `<svg class="fh-svg" viewBox="0 0 ${S} ${S}" width="100%">
    <defs>
      <radialGradient id="${id}-bg"><stop offset="0" stop-color="${col}" stop-opacity=".26"/><stop offset=".6" stop-color="${col}" stop-opacity=".06"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="${col}"/><stop offset="1" stop-color="#d4ef9a"/></linearGradient>
      <filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="${id}-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
    </defs>
    <circle cx="${c}" cy="${c}" r="${R - 8}" fill="url(#${id}-bg)" class="fh-breathe"/>
    <g class="fh-flow f1"><path d="${liquid(R - 16, 5, 3, 0, 2.5, 7)}" stroke="#9fcf8c" stroke-opacity=".32" fill="none" stroke-width="1" filter="url(#${id}-soft)"/></g>
    <g class="fh-flow f2"><path d="${liquid(R + 12, 4, 5, 1.3, 2, 2)}" stroke="#d4ef9a" stroke-opacity=".22" fill="none" stroke-width="1"/></g>
    <g class="fh-flow f3"><path d="${liquid(R - 28, 6, 4, 2.1, 3, 9)}" stroke="#ffffff" stroke-opacity=".12" fill="none" stroke-width="1"/></g>
    <circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#fff" stroke-opacity=".06"/>
    ${arcs}
    ${showOv ? `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><ellipse rx="3.4" ry="4.2" fill="#f4f5f0" stroke="#d4ef9a" stroke-width="1"/></g>` : ''}
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="16" fill="${col}" opacity=".25" class="fh-halo"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7.5" fill="#fff" filter="url(#${id}-glow)"/>
  </svg>`;
}
function flowHero(info, { eyebrow, title, season, stats = [], badge = '', id = 'fr', showOv = true, center } = {}) {
  return `<section class="fhero">
    <div class="fh-aurora"><i></i><i></i><i></i></div>
    <div class="fh-top"><div><div class="eyebrow">${eyebrow}</div><h2 class="fh-phase">${title}</h2><div class="fh-season">${season}</div></div>${badge}</div>
    <div class="fh-ring">${flowRing(info, id, showOv)}
      <div class="fh-center"><span class="fh-k">Cycle day</span><span class="fh-day">${Math.min(info.cd, info.L)}</span><span class="fh-sub">${center || ringSub(info)}</span></div></div>
    ${stats.length ? `<div class="fh-stats">${stats.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}
  </section>`;
}

// ---------- SVG: hormone cycle chart (interactive) ----------
const HORMONES = [
  { key: 'estrogen', name: 'Estrogen', color: '#ff8fc4', w: 3 },
  { key: 'progesterone', name: 'Progesterone', color: '#5fd38a', w: 3 },
  { key: 'testosterone', name: 'Testosterone', color: '#ff4d4d', w: 2.6 },
];
const BAND = { menstrual: 'rgba(242,244,238,.075)', follicular: 'rgba(159,207,140,.10)', ovulatory: 'rgba(212,239,154,.16)', luteal: 'rgba(63,138,92,.17)' };

function chartGeom(L, compact) {
  const W = 360, H = compact ? 200 : 290;
  const top = compact ? 10 : 52, bot = H - (compact ? 24 : 44);
  const x0 = 4, x1 = W - 4;
  const X = t => x0 + (t - 1) / L * (x1 - x0);
  const Y = v => bot - 10 - v * (bot - top - 34);
  return { W, H, top, bot, X, Y };
}
function cycleChart(info, { id = 'cc', compact = false } = {}) {
  const { L, P } = info;
  const cd = Math.min(info.cd, L);
  const { W, H, top, bot, X, Y } = chartGeom(L, compact);
  const ranges = C.phaseRanges(L, P);
  const bands = ranges.map(r => {
    const active = r.key === info.phase;
    const x = X(r.from) + 1.5, w = X(r.to + 1) - X(r.from) - 3;
    const label = PHASES[r.key].name;
    const days = r.from === r.to ? `Day ${r.from}` : `Day ${r.from}–${r.to}`;
    return `<g class="band ${active ? 'active' : ''}">
      <rect x="${x.toFixed(1)}" y="${top}" width="${w.toFixed(1)}" height="${bot - top}" rx="${compact ? 10 : 14}" fill="${BAND[r.key]}" ${active ? `stroke="${PHASE_COLOR.dark[r.key]}" stroke-opacity=".45" stroke-width="1"` : ''}/>
      ${compact ? `<text x="${(x + w / 2).toFixed(1)}" y="${bot + 16}" text-anchor="middle" class="band-days ${active ? 'on' : ''}">${label.slice(0, w < 40 ? 3 : 20)}</text>`
      : `<text x="${(x + w / 2).toFixed(1)}" y="${top - 26}" text-anchor="middle" class="band-name ${active ? 'on' : ''}">${label}</text>
         <text x="${(x + w / 2).toFixed(1)}" y="${top - 12}" text-anchor="middle" class="band-sub">phase</text>
         <text x="${(x + w / 2).toFixed(1)}" y="${bot + 20}" text-anchor="middle" class="band-days ${active ? 'on' : ''}">${days}</text>`}
    </g>`;
  }).join('');
  const curves = HORMONES.map(h => {
    let d = '';
    for (let t = 1; t <= L + 1.001; t += 0.2) {
      const v = C.hormonesAt(t - 0.5, L, P)[h.key];
      d += `${d ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`;
    }
    return `<path class="curve ${ui.hidden[h.key] ? 'off' : ''}" data-h="${h.key}" d="${d}" pathLength="1" stroke="${h.color}" stroke-width="${h.w}" fill="none" stroke-linecap="round" ${h.dash ? `stroke-dasharray="${h.dash}"` : ''} filter="${h.key === 'estrogen' ? `url(#${id}-glow)` : ''}"/>`;
  }).join('');
  // estrogen area wash
  let area = `M${X(1)} ${bot}`;
  for (let t = 1; t <= L + 1.001; t += 0.25) area += `L${X(t).toFixed(1)} ${Y(C.hormonesAt(t - 0.5, L, P).estrogen).toFixed(1)}`;
  area += `L${X(L + 1)} ${bot}Z`;
  const mx = X(cd + 0.5);
  const my = Y(C.hormonesAt(cd, L, P).estrogen);
  return `<div class="cchart ${compact ? 'compact' : ''}" data-chart="${id}" data-l="${L}" data-p="${P}" data-cd="${cd}" data-compact="${compact ? 1 : ''}">
    <svg viewBox="0 0 ${W} ${H}" width="100%" class="cchart-svg">
      <defs>
        <filter id="${id}-glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="${id}-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fc4" stop-opacity=".16"/><stop offset="1" stop-color="#ff8fc4" stop-opacity="0"/></linearGradient>
      </defs>
      ${bands}
      <path d="${area}" fill="url(#${id}-area)" class="area ${ui.hidden.estrogen ? 'off' : ''}"/>
      ${curves}
      ${(() => { const ov = C.ovulationDay(L, P), ex = X(ov + 0.5), ey = bot - (compact ? 9 : 12); return `<g class="egg-mark" transform="translate(${ex.toFixed(1)} ${ey})"><title>LH surge → egg release · day ${ov}</title>
        <circle r="${compact ? 6 : 7.5}" class="egg-halo"/><ellipse rx="${compact ? 3 : 3.6}" ry="${compact ? 3.8 : 4.6}" class="egg-shell"/><circle r="1.3" cy=".6" class="egg-yolk"/>
        ${compact ? '' : `<text y="-12" text-anchor="middle" class="egg-t">egg · day ${ov}</text>`}</g>`; })()}
      <g class="here">
        <line x1="${mx}" x2="${mx}" y1="${top + 4}" y2="${bot - 4}" stroke="#fff" stroke-opacity=".55" stroke-dasharray="2 4"/>
        <circle cx="${mx}" cy="${my}" r="12" fill="#fff" opacity=".18" class="pulse"/>
        <circle cx="${mx}" cy="${my}" r="5.5" fill="#fff"/>
        <g transform="translate(${Math.min(Math.max(mx, 34), W - 34)} ${top + 16})">
          <rect x="-30" y="-11" width="60" height="22" rx="11" fill="#fff"/>
          <text y="4" text-anchor="middle" class="here-label">YOU · ${cd}</text>
        </g>
      </g>
      <g class="scrub" style="opacity:0">
        <line class="s-line" y1="${top + 4}" y2="${bot - 4}" stroke="#d4ef9a" stroke-width="1.2"/>
        <circle class="s-dot" r="6" fill="#d4ef9a"/>
      </g>
      <rect class="hit" x="0" y="${top}" width="${W}" height="${bot - top}" fill="transparent"/>
    </svg>
    <div class="legend ${compact ? 'static' : ''}">${HORMONES.map(h => `<${compact ? 'span' : `button data-action="toggleHormone" data-h="${h.key}"`} class="lg ${ui.hidden[h.key] ? 'off' : ''}"><svg width="22" height="8"><line x1="1" y1="4" x2="21" y2="4" stroke="${h.color}" stroke-width="${h.w}" stroke-linecap="round" ${h.dash ? `stroke-dasharray="${h.dash}"` : ''}/></svg>${h.name}</${compact ? 'span' : 'button'}>`).join('')}<span class="lg egg-lg"><span class="egg-dot"></span>Egg release</span></div>
    <div class="readout" id="${id}-read">${readout(info.cd, L, P, info.cd === cd ? true : false)}</div>
  </div>`;
}
function readout(cdRaw, L, P, isYou) {
  const cd = Math.min(cdRaw, L);
  const ph = C.phaseFor(cd, L, P), h = C.hormonesRel(cd, L, P), tcm = TCM[ph];
  const rows = HORMONES.map(x => {
    const tr = C.hormoneTrend(cd, L, P, x.key);
    return `<div class="ro-row"><span class="ro-name"><svg width="16" height="8"><line x1="1" y1="4" x2="15" y2="4" stroke="${x.color}" stroke-width="2.2" stroke-linecap="round" ${x.dash ? `stroke-dasharray="${x.dash}"` : ''}/></svg>${x.name}</span>
      <span class="ro-bar"><b style="width:${Math.round(h[x.key] * 100)}%;background:${x.color}"></b></span>
      <span class="ro-lvl">${C.hormoneLevel(h[x.key])} <em class="tr ${tr}">${tr === 'rising' ? '↗' : tr === 'falling' ? '↘' : '→'}</em></span></div>`;
  }).join('');
  return `<div class="ro-head"><div><div class="eyebrow">${isYou ? 'You are here' : 'Exploring'} · day ${cdRaw}</div>
      <div class="ro-phase">${PHASES[ph].name} <span>· ${PHASES[ph].season}</span></div></div>
      <div class="ro-tcm"><span class="glyph">${tcm.elementGlyph}</span><span>${tcm.stage}</span></div></div>
    <div class="ro-rows">${rows}</div>
    ${(() => { const ov = C.ovulationDay(L, P), d = ov - cd; return `<div class="ro-egg"><span class="egg-dot"></span>${d === 0 ? 'LH surge — egg releasing today' : d === 1 ? 'LH surge — egg release tomorrow' : d > 1 ? `Egg release in ${d} days · day ${ov}` : `Egg released on day ${ov}`}</div>`; })()}`;
}
function bindCharts() {
  document.querySelectorAll('.cchart').forEach(el => {
    const L = +el.dataset.l, P = +el.dataset.p, cdYou = +el.dataset.cd, compact = !!el.dataset.compact;
    const svg = el.querySelector('svg'), hit = el.querySelector('.hit'), scrub = el.querySelector('.scrub');
    const line = scrub.querySelector('.s-line'), dot = scrub.querySelector('.s-dot');
    const read = el.querySelector('.readout');
    const { X, Y, W } = chartGeom(L, compact);
    let last = null;
    const move = e => {
      const r = svg.getBoundingClientRect();
      const vx = (e.clientX - r.left) / r.width * W;
      const cd = Math.max(1, Math.min(L, Math.floor((vx - 4) / (W - 8) * L) + 1));
      if (cd === last) return; last = cd;
      const x = X(cd + 0.5), y = Y(C.hormonesAt(cd, L, P).estrogen);
      line.setAttribute('x1', x); line.setAttribute('x2', x); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      scrub.style.opacity = cd === cdYou ? 0 : 1;
      read.innerHTML = readout(cd, L, P, cd === cdYou);
      el.classList.toggle('scrubbing', cd !== cdYou);
    };
    hit.addEventListener('pointerdown', e => { hit.setPointerCapture(e.pointerId); move(e); });
    hit.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'mouse') move(e); });
    const reset = () => { last = null; scrub.style.opacity = 0; el.classList.remove('scrubbing'); read.innerHTML = readout(cdYou, L, P, true); };
    hit.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') reset(); });
    hit.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { clearTimeout(el._t); el._t = setTimeout(reset, 3500); } });
    hit.addEventListener('pointercancel', () => { clearTimeout(el._t); el._t = setTimeout(reset, 3500); });
  });
}

// recipe card art: real photo when available, glow art otherwise
function recipeArt(r, shape, seed) {
  const u = photoUrl(r.id, 500);
  return u ? `<img class="rc-photo" src="${u}" alt="${esc(r.name)}" loading="lazy" decoding="async"><span class="rc-shade"></span>` : glowArt(shape, seed);
}

// ---------- glow art (cards like the reference) ----------
function glowArt(shape, seed = 0) {
  const shapes = {
    wave: 'M10 70 C 30 30, 60 30, 70 55 S 100 90, 110 50 L 110 120 L 10 120 Z',
    crown: 'M10 120 L 10 60 L 35 80 L 60 40 L 85 80 L 110 60 L 110 120 Z',
    drop: 'M60 25 C 85 60, 100 75, 100 92 A 40 40 0 0 1 20 92 C 20 75, 35 60, 60 25 Z',
    hill: 'M0 120 C 20 60, 45 45, 60 45 S 100 60, 120 120 Z',
    orb: 'M60 30 A 38 38 0 1 1 59.9 30 Z',
    peak: 'M5 120 C 30 110, 45 30, 60 30 S 90 110, 115 120 Z',
  };
  return `<svg class="glow-art" viewBox="0 0 120 120" preserveAspectRatio="none"><defs>
    <radialGradient id="ga${seed}" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="#e6f7b0"/><stop offset=".35" stop-color="#b8d97a"/><stop offset=".75" stop-color="#4f7a3a" stop-opacity=".6"/><stop offset="1" stop-color="#1c2e17" stop-opacity="0"/></radialGradient>
    <filter id="gb${seed}"><feGaussianBlur stdDeviation="7"/></filter></defs>
    <path d="${shapes[shape] || shapes.orb}" fill="url(#ga${seed})" filter="url(#gb${seed})"/></svg>`;
}

// ---------- views ----------
function viewOnboarding() {
  const s = ui.onbStep, o = ui.onb;
  const dots = `<div class="onb-dots">${[1, 2, 3, 4, 5, 6].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div>`;
  if (s === 0) {
    return `<div class="onb onb-welcome full dark beyond">
      <canvas class="welcome3d"></canvas>
      <div class="bw-vignette"></div>
      <div class="bw-hero"><h1 class="bw-title">under<br>the skin</h1></div>
      <div class="welcome-ui">
        <button class="btn btn-light btn-block" data-action="onbEnter">Enter</button>
        <button class="btn btn-ghost btn-block" data-action="onbDemo">Explore with sample data</button>
        <button class="link welcome-privacy" data-action="nav" data-to="privacy">Private by design — your data never leaves your phone</button>
      </div>
      <div class="bw-flash"></div>
    </div>`;
  }
  const body = {
    1: `<h2 class="onb-title">What should we<br>call you?</h2>
        <input class="field" data-input="onb.name" placeholder="Your first name" value="${esc(o.name)}" autocomplete="given-name" maxlength="24">`,
    2: `<h2 class="onb-title">Add a profile<br>picture</h2>
        <p class="muted">So you — and your partner, if you share — recognise your rhythm at a glance. It stays on your phone.</p>
        <label class="photo-pick">${o.photo ? `<img src="${o.photo}" alt="">` : `<span class="pp-plus">${icon('plus', 28)}</span><span class="pp-cap">Choose a photo</span>`}
          <input type="file" accept="image/*" data-photo="onb" hidden></label>
        ${o.photo ? '' : '<button class="link" data-action="onbNext" style="align-self:center">Skip for now</button>'}`,
    3: `<h2 class="onb-title">When were<br>you born?</h2>
        <p class="muted">Your birthday connects your cycle to your zodiac sign, your Chinese element and the moon. Optional.</p>
        <input class="field" type="date" data-input="onb.birthday" value="${o.birthday || ''}" max="${todayISO()}">
        <button class="link" data-action="onbNext" style="align-self:flex-start">Skip for now</button>`,
    4: `<h2 class="onb-title">When did your last<br>period start?</h2>
        <input class="field" type="date" data-input="onb.last" value="${o.last}" max="${todayISO()}">
        <div class="stepper-row"><span>How many days does it usually last?</span>${stepper('periodLength', o.periodLength, 'onb')}</div>`,
    5: `<h2 class="onb-title">How long is your<br>cycle, usually?</h2>
        <p class="muted">First day of one period to the first day of the next. Not sure? 28 is a good start — we'll learn your real rhythm as you log.</p>
        <div class="big-stepper">${stepper('cycleLength', o.cycleLength, 'onb', true)}<span>days</span></div>`,
    6: `<h2 class="onb-title">What would you<br>like to focus on?</h2>
        <div class="chips">${GOALS.map(g => `<button class="chip ${o.goals.includes(g) ? 'on' : ''}" data-action="onbGoal" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div>`,
  }[s];
  return `<div class="onb no-fig">
    <div class="onb-top"><button class="icon-btn dark" data-action="onbBack">${icon('chevL', 22)}</button>${dots}<span style="width:40px"></span></div>
    <div class="onb-body">${body}</div>
    <div class="onb-foot">
      <button class="btn btn-light btn-block" data-action="onbNext" ${s === 1 && !o.name.trim() ? 'disabled' : ''}>${s === 6 ? 'Begin' : 'Continue'}</button>
      ${s === 6 ? '<p class="fine">Under the Skin offers estimates for wellbeing, not medical advice, and must not be used as contraception.</p>' : ''}
    </div>
  </div>`;
}
function stepper(field, val, scope, big) {
  return `<div class="stepper ${big ? 'big' : ''}"><button data-action="step" data-field="${field}" data-d="-1" data-scope="${scope}">−</button>
    <span class="num">${val}</span><button data-action="step" data-field="${field}" data-d="1" data-scope="${scope}">+</button></div>`;
}

function viewToday() {
  const { stats, today } = M;
  const name = esc(state.profile.name || 'you');
  if (!M.info) {
    return `${topbar('Today')}<div class="pad"><h1 class="hello">${greeting()},<br><b>${name}</b></h1>
      <div class="card card-light empty"><h3>Log your period to begin</h3><p>Tap the day your last period started and we'll map your whole cycle.</p>
      <button class="btn btn-dark" data-action="nav" data-to="calendar">Open calendar</button></div></div>`;
  }
  const info = M.info, ph = PHASES[info.phase], tcm = TCM[info.phase], N = NUTRITION[info.phase];
  const energy = Math.round(C.energyAt(info.cd, info.L, info.P) * 100);
  const seed = dayNum(today);
  const chips = [];
  if (info.late) chips.push(`<span class="hchip">${icon('drop', 14)} ${plural(info.late, 'day')} late</span>`);
  else if (info.isPeriod) chips.push(`<span class="hchip">${icon('drop', 14)} Period · day ${info.cd}</span>`);
  else chips.push(`<span class="hchip">${icon('drop', 14)} Period in ${plural(info.daysToPeriod, 'day')}</span>`);
  chips.push(`<span class="hchip">${icon('sun', 14)} ${info.isOvulation ? 'Ovulation today' : `Ovulation in ${plural(info.daysToOv, 'day')}`}</span>`);
  chips.push(`<span class="hchip ${info.fertile ? 'hl' : ''}">${icon('spark', 14)} ${info.fertile ? 'Fertile' : 'Low fertility'}</span>`);

  // one compact "heads-up" card: reminders, unusual cycle, learned patterns
  const alerts = dueReminders().map(x => `<div class="al-row"><span class="al-ic">${icon(x.icon, 15)}</span>
      <span class="al-t" ${x.to ? `data-action="nav" data-to="${x.to}"` : ''}><b>${x.title}</b><small>${x.body}</small></span>
      <button class="bn-x" data-action="dismissRem" data-id="${x.id}" aria-label="Dismiss">${icon('close', 14)}</button></div>`);
  upcomingPatterns(patterns()).forEach(x => { const rk = reliefKey(x.name); alerts.push(`<div class="al-row" ${rk ? `data-action="nav" data-to="relief/${encodeURIComponent(rk)}"` : ''}>
      <span class="al-ic">${icon('chart', 15)}</span><span class="al-t"><b>${x.name} ${x.inDays === 0 ? 'today' : x.inDays === 1 ? 'tomorrow' : `in ${x.inDays} days`}</b><small>Your pattern: days ${x.from}–${x.to}</small></span>${rk ? icon('chevR', 14) : ''}</div>`); });

  // 7-day energy bars for the tile
  let bars = '';
  for (let i = 0; i < 7; i++) { const di = C.dayInfo(C.addDays(today, i), stats); if (di) bars += `<b style="height:${Math.round(C.energyAt(di.cd, di.L, di.P) * 100)}%;background:${PHASE_COLOR.dark[di.phase]}"></b>`; }
  const warm = warmWindow(info);
  const topNeed = N.needs.find(n => n.ev !== 'tcm');
  const recipe = pick(recipesFor(info.phase, info), seed);
  const ritual = pick(RITUALS.filter(r => r.phases.includes(info.phase)), seed);
  const tlog = getLog(todayISO()), logged = Object.keys(tlog).length;
  const article = ARTICLES.find(a => a.phase === info.phase) || ARTICLES[0];
  const summary = ph.hormones.split('. ')[0] + '.';

  return `${topbar('Today')}
  <div class="pad">
    <div class="hello-row slim"><div><div class="eyebrow">${fmt(today, { weekday: 'long', month: 'long', day: 'numeric' })}</div><h1 class="hello sm">${greeting()}, <b>${name}</b></h1></div>
      <button class="avatar ${state.profile.photo ? 'has-photo' : ''}" data-action="nav" data-to="profile">${avatarInner(state.profile)}</button></div>

    ${flowHero(info, { eyebrow: 'You are in your', title: `${ph.name} <em>phase</em>`, season: ph.season, id: 'today',
      badge: `<div class="fh-side"><span class="fh-glyph" title="${tcm.element}">${tcm.elementGlyph}</span>${info.fertile ? `<span class="fh-badge">${icon('spark', 13)} Fertile</span>` : ''}</div>`,
      stats: [[info.isPeriod ? 'Period' : 'Next period', info.late ? `${info.late}d late` : info.isPeriod ? `Day ${info.cd}` : `${info.daysToPeriod} days`], ['Egg release', info.isOvulation ? 'Today' : info.cd < info.ov ? `in ${info.daysToOv}d` : `day ${info.ov}`], ['Energy', `${energy}%`]] })}

    ${alerts.length ? `<section class="card glass alerts">${alerts.slice(0, 2).join('')}</section>` : ''}
    ${cycleFlag()}

    ${sectionTitle('Your hormones', ['Explore', 'hormones'])}
    <section class="card glass chart-card">${cycleChart(info, { id: 'today', compact: true })}
      <p class="cc-hint">${icon('chevL', 12)} Swipe the chart to see any day ${icon('chevR', 12)}</p>
      <button class="cc-more" data-action="nav" data-to="hormones">What each hormone does ${icon('chevR', 14)}</button></section>
    ${fullCycleGuide(info)}

    ${moveCard(info)}

    ${alignmentCard(info)}
    ${partnersCard(info)}

    ${sectionTitle('At a glance')}
    <div class="glance">
      <button class="card glass gl" data-action="nav" data-to="insights"><div class="eyebrow">Energy</div>
        <div class="gl-v"><span class="dotnum">${energy}</span><small>%</small></div><div class="gl-bars">${bars}</div><div class="gl-s">next 7 days</div></button>
      <button class="card glass gl" data-action="planTab" data-v="nourish"><div class="eyebrow">Eat</div>
        <div class="gl-h">${warm ? 'Warm & cooked' : 'Raw & living'}</div><div class="gl-s">${(() => { const sz = SZ.seasonal(myCountry(), new Date().getMonth() + 1).filter(i => i.ph.includes(info.phase) && i.kind !== 'wild').slice(0, 2); return sz.length ? sz.map(i => i.f).join(' · ') : topNeed.foods.slice(0, 2).join(' · '); })()}</div></button>
      <button class="card glass gl" data-action="planTab" data-v="mind"><div class="eyebrow">Mind</div>
        <div class="gl-h">${ph.superpower.title}</div><div class="gl-s">${ph.mind.title}</div></button>
      <button class="card glass gl" data-action="planTab" data-v="rituals"><div class="eyebrow">Eastern</div>
        <div class="gl-h"><span class="gl-g">${tcm.elementGlyph}</span> ${tcm.element}</div><div class="gl-s">${tcm.tea.name}</div></button>
    </div>

    ${sectionTitle('Today’s plan')}
    <div class="hscroll">
      ${(() => { const d = seasonalDishesToday(info, 1)[0]; if (!d) return ''; const ph = dishPhoto(d.name, 500); return `<button class="rcard ${ph ? 'has-photo' : ''}" data-action="nav" data-to="season">${ph ? `<img class="rc-photo" src="${ph}" alt="" loading="lazy"><span class="rc-shade"></span>` : glowArt('hill', 5)}<div class="rc-top"><span class="rc-k">In season · ${d.warm ? 'Warm' : 'Raw'}</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${d.name}</div><div class="rc-m">${d.used.map(i => i.f).slice(0, 2).join(' · ')}</div></button>`; })()}
      <button class="rcard ${photoUrl(recipe.id) ? 'has-photo' : ''}" data-action="nav" data-to="recipe/${recipe.id}">${recipeArt(recipe, 'wave', 1)}<div class="rc-top"><span class="rc-k">Nourish${recipe.warm ? ' · Warm' : recipe.raw ? ' · Raw' : ''}</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${recipe.name}</div><div class="rc-m">${recipe.time} min · ${recipe.meal}</div></button>
      <button class="rcard" data-action="nav" data-to="ritual/${ritual.id}">${glowArt('crown', 2)}<div class="rc-top"><span class="rc-k">Ritual</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${ritual.name}</div><div class="rc-m">${ritual.mins} min · TCM</div></button>
      ${(() => { const ls = lemonState(); return `<button class="rcard" data-action="nav" data-to="remedy/lemon-water">${glowArt('orb', 4)}<div class="rc-top"><span class="rc-k">Morning ritual</span><span class="rc-go">${ls && !ls.over && ls.doneToday ? icon('check', 16) : icon('chevR', 16)}</span></div><div class="rc-t">Lemon water</div><div class="rc-m">${ls && !ls.over ? `Day ${ls.day} of 28` : 'Start your 28 days'}</div></button>`; })()}
      <button class="rcard" data-action="nav" data-to="point/${info.phase}">${glowArt('drop', 3)}<div class="rc-top"><span class="rc-k">Acupressure</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${tcm.point.code} · ${tcm.point.name}</div><div class="rc-m">${tcm.point.secs}s · press & breathe</div></button>
    </div>

    ${logged ? `${sectionTitle('Today’s log', ['Edit', 'log'])}<section class="card glass"><div class="chips">${logChips(tlog)}</div></section>`
    : `<section class="card checkin" data-action="nav" data-to="log"><div><div class="eyebrow">Daily check-in</div><h3>How do you feel today?</h3></div><span class="round-go">${icon('plus', 22)}</span></section>`}

    ${sectionTitle('More for you')}
    <section class="card glass more">
      <button class="more-row" data-action="nav" data-to="habits"><span class="art-ic">${icon('check', 18)}</span><span class="art-t">Hormone habits</span>${icon('chevR', 16)}</button>
      <button class="more-row" data-action="nav" data-to="cosmic"><span class="art-ic">${icon('star', 18)}</span><span class="art-t">Cosmic rhythm</span>${icon('chevR', 16)}</button>
      <button class="more-row" data-action="nav" data-to="share"><span class="art-ic">${icon('heart', 18)}</span><span class="art-t">Partner mode</span>${icon('chevR', 16)}</button>
      <button class="more-row" data-action="nav" data-to="article/${article.id}"><span class="art-ic">${icon('book', 18)}</span><span class="art-t">${article.title}</span>${icon('chevR', 16)}</button>
    </section>
    <p class="fine center">Predictions are estimates based on your logs — not medical advice or contraception.</p>
  </div>`;
}
function logChips(l) {
  const out = [];
  if (l.flow) out.push(`${icon('drop', 13)} ${FLOWS.find(f => f.id === l.flow)?.label}`);
  (l.symptoms || []).forEach(s => out.push(s));
  (l.moods || []).forEach(s => out.push(s));
  if (l.energy) out.push(`${icon('bolt', 13)} Energy ${l.energy}/5`);
  return out.map(x => `<span class="chip static">${x}</span>`).join('');
}

function viewCalendar() {
  const { stats, today } = M;
  const m = ui.calMonth ? C.parseISO(ui.calMonth) : new Date(today.getFullYear(), today.getMonth(), 1);
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<span></span>';
  for (let n = 1; n <= days; n++) {
    const d = new Date(m.getFullYear(), m.getMonth(), n), k = C.iso(d), di = C.dayInfo(d, stats), lg = state.logs[k];
    const cls = ['cal-d'];
    if (di) {
      if (di.periodActual) cls.push('period');
      else if (di.periodPredicted) cls.push('period-pred');
      else if (di.isOvulation && di.cd <= di.L) cls.push('ovu');
    }
    if (k === todayISO()) cls.push('today');
    if (k === ui.calSelected) cls.push('sel');
    cells += `<button class="${cls.join(' ')}" data-action="calSelect" data-date="${k}"><span>${n}</span>${lg && (lg.symptoms || lg.moods || lg.notes) ? '<i class="logdot"></i>' : ''}</button>`;
  }
  const sd = C.parseISO(ui.calSelected), si = C.dayInfo(sd, stats), slog = getLog(ui.calSelected);
  const isFuture = sd > today;
  const hasFlow = PERIOD_FLOWS.includes(slog.flow);
  const nextP = M.info ? M.info.nextStart : null;
  const ov = M.info ? C.addDays(M.info.cycleStart, M.info.ov - 1) : null;
  const nextOv = ov && ov < today ? C.addDays(ov, M.info.L) : ov;
  return `${topbar('Calendar')}
  <div class="pad">
    <div class="cal-head"><button class="icon-btn" data-action="calMove" data-d="-1">${icon('chevL', 20)}</button>
      <h2>${fmt(m, { month: 'long' })} <span>${m.getFullYear()}</span></h2>
      <button class="icon-btn" data-action="calMove" data-d="1">${icon('chevR', 20)}</button></div>
    <section class="card glass cal">
      <div class="cal-w">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend"><span><i class="lg-p"></i>Period</span><span><i class="lg-pp"></i>Next period (expected)</span><span><i class="lg-o"></i>Egg release (estimate)</span></div>
    </section>
    <section class="card card-light day-panel">
      <div class="dp-head"><div><div class="eyebrow dark">${fmt(sd, { weekday: 'long' })}</div><h3>${fmt(sd, { month: 'long', day: 'numeric' })}</h3></div>
        ${si ? `<span class="phase-tag" style="--c:${PHASE_COLOR.light[si.phase]}">${PHASES[si.phase].name} · day ${si.cd}</span>` : ''}</div>
      ${si ? `<p class="dp-text">${si.periodActual ? `Period · day ${si.cd}.` : si.periodPredicted ? (si.cd === 1 ? 'Your next period is expected to start today.' : 'Your period is expected around this day.') : si.isOvulation ? 'Estimated egg release (ovulation).' : PHASES[si.phase].tagline}</p>` : '<p class="dp-text">No cycle data for this day yet.</p>'}
      ${Object.keys(slog).length ? `<div class="chips">${logChips(slog)}</div>` : ''}
      ${isFuture ? '' : `<div class="dp-actions">
        <button class="btn ${hasFlow ? 'btn-outline-dark' : 'btn-dark'}" data-action="togglePeriod">${icon('drop', 16)} ${hasFlow ? 'Remove period' : 'Period day'}</button>
        <button class="btn btn-outline-dark" data-action="logDay" data-date="${ui.calSelected}">${icon('plus', 16)} Log</button></div>`}
    </section>
    ${M.info ? `${sectionTitle('Your periods')}
    <div class="upcoming">
      ${(() => { const last = stats.periods[stats.periods.length - 1]; return `<div class="card glass up"><span class="up-ic">${icon('drop', 18)}</span><div class="up-k">Last period</div><div class="up-v">${fmt(last.start, { month: 'short', day: 'numeric' })}</div><div class="up-s">${plural(last.length || stats.avgPeriod, 'day')}</div></div>`; })()}
      <div class="card glass up"><span class="up-ic">${icon('drop', 18)}</span><div class="up-k">Next period</div><div class="up-v">${fmt(nextP, { month: 'short', day: 'numeric' })}</div><div class="up-s">${M.info.late ? `${M.info.late}d late` : `in ${plural(M.info.daysToPeriod, 'day')}`}</div></div>
    </div>` : ''}
  </div>`;
}

function viewLog() {
  const k = ui.logDate || todayISO(), d = C.parseISO(k), l = getLog(k);
  const isToday = k === todayISO();
  const chipset = (field, list, multi) => `<div class="chips">${list.map(v => {
    const on = multi ? (l[field] || []).includes(v) : l[field] === v;
    return `<button class="chip ${on ? 'on' : ''}" data-action="logSet" data-field="${field}" data-v="${esc(v)}" data-multi="${multi ? 1 : ''}">${esc(v)}</button>`;
  }).join('')}</div>`;
  return `${topbar('Check-in')}
  <div class="pad">
    <div class="log-date"><button class="icon-btn" data-action="logMove" data-d="-1">${icon('chevL', 20)}</button>
      <div><div class="eyebrow">${isToday ? 'Today' : fmt(d, { weekday: 'long' })}</div><h2>${fmt(d, { month: 'long', day: 'numeric' })}</h2></div>
      <button class="icon-btn" data-action="logMove" data-d="1" ${isToday ? 'disabled' : ''}>${icon('chevR', 20)}</button></div>

    <section class="card glass log-sec"><h4>${icon('drop', 16)} Period flow</h4>
      <div class="flow">${FLOWS.map(f => `<button class="flow-o ${l.flow === f.id ? 'on' : ''}" data-action="logSet" data-field="flow" data-v="${f.id}">
        <span class="drops">${f.drops ? Array.from({ length: f.drops }, () => icon('drop', 15, 1.4)).join('') : '<i class="spot"></i>'}</span>${f.label}</button>`).join('')}</div></section>

    <section class="card glass log-sec"><h4>${icon('heart', 16)} Mood</h4>${chipset('moods', MOODS, true)}</section>
    <section class="card glass log-sec"><h4>${icon('spark', 16)} Symptoms</h4>${chipset('symptoms', SYMPTOMS, true)}</section>
    <section class="card glass log-sec"><h4>${icon('bolt', 16)} Energy</h4>
      <div class="energy-pick">${[1, 2, 3, 4, 5].map(n => `<button class="${l.energy >= n ? 'on' : ''}" data-action="logSet" data-field="energy" data-v="${n}"><b style="height:${30 + n * 12}%"></b></button>`).join('')}</div>
      <div class="ep-labels"><span>Drained</span><span>Radiant</span></div></section>
    <button class="btn btn-light btn-block" data-action="nav" data-to="today">${icon('check', 18)} Done</button>
  </div>`;
}

function viewPlan() {
  const info = M.info, phase = info ? info.phase : 'follicular', ph = PHASES[phase], tcm = TCM[phase];
  const tabs = [['nourish', 'Nourish'], ['rituals', 'Rituals'], ['mind', 'Mind']];
  let body = '';
  if (ui.planTab === 'nourish') {
    body = nourishBody(phase);
  } else if (ui.planTab === 'rituals') {
    const rits = RITUALS.slice().sort((a, b) => b.phases.includes(phase) - a.phases.includes(phase));
    body = `<section class="card tcm-card">
        <div class="tcm-glyph">${tcm.elementGlyph}</div>
        <div class="tcm-main"><div class="eyebrow">${tcm.stage} · ${tcm.element} · ${tcm.organ}</div><h3>${tcm.principle}</h3><p class="body">${tcm.ritual}</p></div></section>
      <button class="card point-card" data-action="nav" data-to="point/${phase}">
        <div class="pt-dot"><span></span></div>
        <div><div class="eyebrow">Acupressure point</div><h3>${tcm.point.code} · ${tcm.point.name}</h3><p class="body sm">${tcm.point.does}</p></div>${icon('chevR', 18)}</button>
      ${cosmicCard()}
      <button class="card gro-cta" data-action="nav" data-to="relief"><span class="art-ic">${icon('heart', 20)}</span><span class="art-t">Relief guide<small>Cramps, PMS, sleep, skin & more</small></span>${icon('chevR', 18)}</button>
      ${sectionTitle('Remedies')}
      <div class="grid2">${M.info ? remedyCards(M.info) : ''}</div>
      ${sectionTitle('Rituals')}
      <div class="grid2">${rits.map((r, i) => `<button class="rcard tall" data-action="nav" data-to="ritual/${r.id}">${glowArt(['crown', 'drop', 'hill', 'wave', 'orb', 'peak'][i % 6], 40 + i)}
        <span class="rc-glyph">${r.glyph}</span>
        <div class="rc-top"><span class="rc-k">${r.mins} min</span>${r.phases.includes(phase) ? `<span class="rc-badge">For you</span>` : ''}</div>
        <div class="rc-t">${r.name}</div></button>`).join('')}</div>
      ${sectionTitle('The tide of your cycle')}
      <section class="card glass">${PHASE_ORDER.map(p => `<div class="tide ${p === phase ? 'on' : ''}"><span class="tide-g">${TCM[p].elementGlyph}</span>
        <div><div class="tide-n">${PHASES[p].name} <em>· ${TCM[p].stage}</em></div><div class="tide-s">${TCM[p].principle}</div></div></div>`).join('')}</section>`;
  } else {
    body = `<section class="card card-light"><div class="eyebrow dark">Superpower</div><h3 class="dark-h">${ph.superpower.title}</h3><p class="dp-text">${ph.superpower.text}</p></section>
      ${[['mind', ph.mind, 'Work & focus'], ['users', ph.social, 'Social'], ['heart', ph.selfcare, 'Self-care']].map(([ic, o, k]) => `
      <section class="card glass mind-row"><span class="art-ic">${icon(ic, 20)}</span><div><div class="eyebrow">${k}</div><h3>${o.title}</h3><p class="body sm">${o.text}</p></div></section>`).join('')}
      ${sectionTitle('Your month at a glance')}
      <section class="card glass">${PHASE_ORDER.map(p => `<div class="tide ${p === phase ? 'on' : ''}"><span class="tide-dot" style="background:${PHASE_COLOR.dark[p]}"></span>
        <div><div class="tide-n">${PHASES[p].name} <em>· ${PHASES[p].superpower.title}</em></div><div class="tide-s">${PHASES[p].mind.title} · ${PHASES[p].social.title}</div></div></div>`).join('')}</section>`;
  }
  return `${topbar({ nourish: 'Nourish', rituals: 'Rituals', mind: 'Mind' }[ui.planTab])}
  <div class="pad">
    <div class="page-art">${mushroomArt(1, 'corner')}<h1 class="page-h">${ph.name} <span>phase</span></h1><p class="muted">${info ? `Cycle day ${info.cd} · ${tcm.stage}` : ''}</p></div>
    <div class="seg">${tabs.map(([k, l]) => `<button class="${ui.planTab === k ? 'on' : ''}" data-action="planTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

// TCM warm window: during the period and the last 2–3 days before it, no raw/cold food.
function warmWindow(info) { return !!info && (info.phase === 'menstrual' || info.cd >= info.L - 2); }
function recipesFor(phase, info) {
  const warm = warmWindow(info);
  let list = RECIPES.filter(r => r.phases.includes(phase) && !(warm && r.raw));
  if (!list.length) list = RECIPES.filter(r => !(warm && r.raw));
  return list;
}

// ---------- nourish (structured, evidence-graded) ----------
function plateSvg(plate, phase) {
  const R = 70, C = 2 * Math.PI * R, cols = ['#d4ef9a', '#9fcf8c', '#3f8a5c', '#f3f5ef'];
  let off = 0;
  const segs = plate.map(([, pct], i) => {
    const len = pct / 100 * C;
    const seg = `<circle cx="90" cy="90" r="${R}" fill="none" stroke="${cols[i]}" stroke-width="26" stroke-dasharray="${(len - 3).toFixed(1)} ${(C - len + 3).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 90 90)" class="plate-seg" style="animation-delay:${i * .12}s"/>`;
    off += len; return seg;
  }).join('');
  return `<div class="plate"><svg viewBox="0 0 180 180" width="150" height="150">${segs}
      <text x="90" y="86" text-anchor="middle" class="plate-k">YOUR</text><text x="90" y="104" text-anchor="middle" class="plate-v">plate</text></svg>
    <div class="plate-leg">${plate.map(([k, pct], i) => `<div><i style="background:${cols[i]}"></i><span>${k}</span><b>${pct}%</b></div>`).join('')}</div></div>`;
}
function evBadge(ev) { return `<span class="ev ev-${ev}">${EVIDENCE[ev].short}</span>`; }
function recentSymptoms() {
  const out = {};
  for (let i = 0; i < 4; i++) (getLog(C.iso(C.addDays(new Date(), -i))).symptoms || []).forEach(s => { out[s] = 1; });
  return Object.keys(out);
}
function typicalSymptoms(phase) {
  const counts = {};
  for (const k in state.logs) {
    const di = C.dayInfo(C.parseISO(k), M.stats);
    if (di && di.phase === phase) (state.logs[k].symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
}
function nourishBody(current) {
  const phase = ui.nourishPhase || current, N = NUTRITION[phase], ph = PHASES[phase];
  const recs = RECIPES.slice().sort((a, b) => (b.phases.includes(phase) - a.phases.includes(phase)) || ((phase === current ? warmWindow(M.info) : phase === 'menstrual') ? (!!a.raw - !!b.raw) || (!!b.warm - !!a.warm) : (!!b.raw - !!a.raw)));
  const recent = phase === current ? recentSymptoms() : [];
  const typical = typicalSymptoms(phase).filter(s => !recent.includes(s));
  const fixes = recent.concat(typical).filter(s => SYMPTOM_FOODS[s]).slice(0, 4);
  return `
    <div class="phase-pick">${PHASE_ORDER.map(p => `<button class="${p === phase ? 'on' : ''}" data-action="nourishPhase" data-v="${p}"><i style="background:${PHASE_COLOR.dark[p]}"></i>${PHASES[p].name}${p === current ? '<em>now</em>' : ''}</button>`).join('')}</div>
    <section class="card card-light">
      <div class="eyebrow dark">${ph.name} nutrition</div><h3 class="dark-h">${N.focus}</h3>
      <p class="dp-text">${N.why}</p>
      <div class="hunger">${icon('bolt', 16)}<span>${N.energy}</span></div>
    </section>

    ${sectionTitle('What your body needs')}
    <section class="card glass needs">${N.needs.map((x, i) => `
      <div class="need ${ui.openNeed === i ? 'open' : ''}">
        <button class="need-h" data-action="openNeed" data-i="${i}"><span class="need-n">${x.n}</span>${evBadge(x.ev)}<span class="need-t">${x.target}</span>${icon('chevD', 16)}</button>
        <div class="need-b"><p class="body sm">${x.why}</p><div class="foods">${x.foods.map(f => `<span class="food">${f}</span>`).join('')}</div></div>
      </div>`).join('')}
      <div class="ev-leg">${Object.keys(EVIDENCE).map(k => `<span>${evBadge(k)} ${EVIDENCE[k].label}</span>`).join('')}</div>
    </section>

    ${phase === current ? seasonCard() : ''}
    ${phase === current ? (() => { const ds = seasonalDishesToday(M.info, 2); return ds.length ? `<div class="grid2 season-dishes">${ds.map((d, i) => { const ph = dishPhoto(d.name, 400); return `<button class="rcard tall ${ph ? 'has-photo' : ''}" data-action="nav" data-to="season">${ph ? `<img class="rc-photo" src="${ph}" alt="" loading="lazy"><span class="rc-shade"></span>` : glowArt('orb', 60 + i)}<div class="rc-top"><span class="rc-k">${d.warm ? 'Warm' : 'Raw'} · in season</span></div><div class="rc-t">${d.name}</div></button>`; }).join('')}</div>` : ''; })() : ''}
    ${fertilityFoods()}

    ${fixes.length ? `${sectionTitle(recent.length ? 'For how you feel' : `Your usual ${ph.name.toLowerCase()} symptoms`)}
    <div class="fixes">${fixes.map(s => { const f = SYMPTOM_FOODS[s]; return `<section class="card glass fix">
      <div class="fix-h"><span class="fix-s">${s}${recent.includes(s) ? '<em>logged</em>' : ''}</span>${evBadge(f.ev)}</div>
      <p class="body sm">${f.tip}</p><div class="foods">${f.foods.map(x => `<span class="food">${x}</span>`).join('')}</div>
      ${reliefKey(s) ? `<button class="link fix-more" data-action="nav" data-to="relief/${encodeURIComponent(reliefKey(s))}">Full relief guide ${icon('chevR', 14)}</button>` : ''}</section>`; }).join('')}</div>` : ''}

    <button class="card gro-cta" data-action="nav" data-to="grocery"><span class="art-ic">${icon('check', 20)}</span><span class="art-t">Build my grocery list<small>From your next 7 days of phases</small></span>${icon('chevR', 18)}</button>

    ${sectionTitle('A day of eating')}
    <section class="card glass dayplan">${N.day.map(d => `
      <${d.recipe ? `button data-action="nav" data-to="recipe/${d.recipe}"` : 'div'} class="dp-row">
        <span class="dp-meal">${d.meal}</span><span class="dp-what">${d.what}</span>${d.recipe ? `<span class="dp-go">${icon('chevR', 16)}</span>` : ''}
      </${d.recipe ? 'button' : 'div'}>`).join('')}</section>

    ${sectionTitle('Go easy on')}
    <section class="card glass">${N.limit.map(l => `<div class="limit"><span class="limit-x">${icon('close', 14, 2)}</span><div><div class="limit-n">${l.x}</div><div class="tide-s">${l.why}</div></div></div>`).join('')}</section>

    ${sectionTitle('Recipes')}
    <div class="grid2">${recs.map((r, i) => `<button class="rcard tall ${photoUrl(r.id) ? 'has-photo' : ''}" data-action="nav" data-to="recipe/${r.id}">${recipeArt(r, ['wave', 'orb', 'drop', 'hill', 'crown', 'peak'][i % 6], 20 + i)}
      <div class="rc-top"><span class="rc-k">${r.meal}${r.raw ? ' · Raw' : r.warm ? ' · Warm' : ''}</span>${r.phases.includes(phase) ? `<span class="rc-badge">${ph.name}</span>` : ''}</div>
      <div class="rc-t">${r.name}</div><div class="rc-m">${r.time} min · ${r.kcal} kcal</div></button>`).join('')}</div>
    <p class="fine">Targets are general adult guidance (e.g. iron 18 mg/day for menstruating women). Evidence for cycle-specific eating is still developing — use it as a guide and talk to a doctor or dietitian about supplements, heavy periods or ongoing symptoms.</p>`;
}

// ---------- cosmic rhythm ----------
function cosmicProfile() {
  const b = state.profile.birthday; if (!b) return null;
  const [y, m, d] = b.split('-').map(Number);
  const sign = Z.sunSign(m, d), cz = Z.chineseZodiac(y, m, d);
  return { sign, cz, five: Z.FIVE[cz.element], bridge: Z.EL_BRIDGE[sign.el] };
}
function cosmicCard() {
  const cp = cosmicProfile(), moon = Z.moonPhase(new Date());
  return `<button class="card cosmic-card" data-action="nav" data-to="cosmic">
    <span class="cc-glyphs"><b>${cp ? cp.sign.glyph : '✦'}</b><i>${cp ? cp.cz.animal.han : '☯'}</i></span>
    <span class="cc-t"><span class="eyebrow">Cosmic rhythm · ${moon.name}</span>
      <span class="share-t">${cp ? `${cp.sign.name} · ${cp.cz.element} ${cp.cz.animal.name}` : 'Add your birthday to unlock your zodiac'}</span></span>${icon('chevR', 18)}</button>`;
}
function viewCosmic() {
  const cp = cosmicProfile(), now = new Date(), moon = Z.moonPhase(now);
  const phase = M.info ? M.info.phase : null;
  const mtype = Z.moonCycleType(M.stats.periods.map(p => p.start));
  const mc = mtype ? Z.MOON_CYCLES[mtype] : null;
  const moonSvg = (illum, waxing) => {
    const r = 46, k = Math.cos(illum * Math.PI) * r; // terminator ellipse
    return `<svg viewBox="0 0 120 120" width="120" height="120" class="moon"><defs><radialGradient id="mg"><stop offset="0" stop-color="#f6fbe9"/><stop offset="1" stop-color="#cfe3a8"/></radialGradient></defs>
      <circle cx="60" cy="60" r="${r}" fill="#1a231b"/>
      <path d="M60 ${60 - r} A${r} ${r} 0 0 ${waxing ? 1 : 0} 60 ${60 + r} A${Math.abs(k)} ${r} 0 0 ${(k > 0) === waxing ? 0 : 1} 60 ${60 - r}Z" fill="url(#mg)"/>
      <circle cx="60" cy="60" r="${r + 10}" fill="none" stroke="rgba(212,239,154,.15)"/></svg>`;
  };
  const birthdayField = `<input class="field" type="date" data-input="profile.birthday" value="${state.profile.birthday || ''}" max="${todayISO()}">`;
  if (!cp) {
    return `${topbar('Cosmic rhythm', { back: true })}<div class="pad">
      <h1 class="page-h">Your <span>cosmic rhythm</span></h1>
      <p class="muted">Western zodiac, Chinese zodiac and the five elements of Chinese medicine, woven into your cycle. Add your birthday to begin.</p>
      <section class="card glass mt">${birthdayField}<button class="btn btn-light btn-block" data-action="saveBirthday">Reveal my rhythm</button></section>
      ${moonSection()}
    </div>`;
  }
  function moonSection() {
    return `${sectionTitle('The moon tonight')}
      <section class="card glass moon-card">${moonSvg(moon.illum, moon.age < 14.77)}
        <div><div class="eyebrow">${Math.round(moon.illum * 100)}% lit · day ${Math.floor(moon.age) + 1} of the lunar month</div><h3>${moon.name}</h3><p class="body sm">${moon.ritual}</p></div></section>
      ${mc ? `<section class="card card-light"><div class="eyebrow dark">Your moon cycle · ${mc.when.toLowerCase()}</div><h3 class="dark-h">${mc.name} cycle</h3><p class="dp-text">${mc.meaning}</p></section>` : ''}`;
  }
  const { sign, cz, five, bridge } = cp;
  return `${topbar('Cosmic rhythm', { back: true })}
  <div class="pad">
    <section class="cosmic-hero">
      <div class="stars"></div>${nautilusArt('ch-nautilus')}
      <div class="ch-row"><div class="ch-glyph">${sign.glyph}</div><div class="ch-x">×</div><div class="ch-glyph han">${cz.animal.han}</div></div>
      <h1>${sign.name} <span>·</span> ${cz.element} ${cz.animal.name}</h1>
      <p class="ch-sub">${sign.mode} ${sign.el} sign · ${cz.yin ? 'Yin' : 'Yang'} ${cz.element} year ${cz.year}</p>
      ${phase ? `<div class="ch-today"><div class="eyebrow">${sign.el} in your ${PHASES[phase].name.toLowerCase()} phase</div><p>${Z.EL_PHASE[sign.el][phase]}</p></div>` : ''}
    </section>

    ${sectionTitle(`${sign.glyph} ${sign.name}`)}
    <section class="card glass">
      <div class="kv"><span>Element</span><b>${sign.mode} ${sign.el}</b></div>
      <div class="kv"><span>Body in astrology</span><b>${sign.body}</b></div>
      <div class="kv col"><span>Your gift</span><b>${sign.gift}</b></div>
      <div class="kv col"><span>Your shadow</span><b>${sign.shadow}</b></div>
    </section>
    <section class="card tcm-card"><div class="tcm-glyph">${Z.FIVE[bridge.tcm].han}</div><div class="tcm-main"><div class="eyebrow">East meets West</div><h3>${sign.el} sign × ${bridge.organ}</h3><p class="body sm">${bridge.note}</p></div></section>
    <section class="card card-light"><div class="eyebrow dark">${sign.name} ritual</div><p class="dp-text">${sign.ritual}</p><p class="aff">“${sign.aff}”</p></section>

    ${sectionTitle(`${cz.animal.han} Year of the ${cz.animal.name}`)}
    <section class="card glass"><div class="kv"><span>Nature</span><b>${cz.animal.traits}</b></div><p class="body">${cz.animal.gift} ${cz.animal.tip}</p></section>

    ${sectionTitle(`${five.han} Your element: ${cz.element}`)}
    <section class="card tcm-card five">
      <div class="tcm-main">
        <div class="five-grid">
          <div><span>Organ</span><b>${five.organ}</b></div><div><span>Season</span><b>${five.season}</b></div>
          <div><span>Colour</span><b>${five.color}</b></div><div><span>Taste</span><b>${five.taste}</b></div>
        </div>
        <div class="emo"><span class="emo-b">${icon('sun', 14)} Balanced: ${five.emotion[0]}</span><span class="emo-u">${icon('moon', 14)} Out of balance: ${five.emotion[1]}</span></div>
        <p class="body sm">${five.cycle}</p>
        <div class="foods">${five.foods.map(f => `<span class="food">${f}</span>`).join('')}</div>
        <p class="body sm"><b class="lime">Ritual · </b>${five.ritual}</p>
      </div>
    </section>

    ${moonSection()}

    ${sectionTitle('Birthday')}
    <section class="card glass">${birthdayField}</section>
    <p class="fine center">Astrology, the five elements and moon cycles are spiritual traditions for reflection — not science or medical advice. In Chinese astrology the year begins at Li Chun (~4 Feb).</p>
  </div>`;
}

// ---------- grocery list (built from the coming week's phases) ----------
const AISLES = [
  ['Produce', /spinach|pepper|citrus|kiwi|strawberr|broccoli|berr|avocado|beet|banana|potato|kale|rocket|cucumber|tomato|pear|lemon|orange|fennel|asparagus|sprout|cauliflower|greens|radish|pumpkin|watermelon|pomegranate|apple|prune|cherr|mulberr|ginger$|^ginger|fresh ginger/i],
  ['Protein', /meat|salmon|sardine|egg|chicken|turkey|tofu|tempeh|beef|shellfish|prawn|fish|lamb/i],
  ['Grains & legumes', /lentil|oat|quinoa|rice|bean|chickpea|millet|sourdough|cracker|grain|congee/i],
  ['Dairy & alternatives', /yoghurt|yogurt|kefir|milk/i],
  ['Seeds, nuts & pantry', /seed|almond|walnut|cashew|chocolate|chia|flax|tahini|date|goji|sesame|seaweed|cinnamon|miso|kimchi|sauerkraut|nut butter|honey|turmeric|salt|peel/i],
  ['Teas & drinks', /tea|water|coconut/i],
];
function weekPhases() {
  const out = [];
  for (let i = 0; i < 7; i++) { const di = C.dayInfo(C.addDays(new Date(), i), M.stats); if (di && !out.includes(di.phase)) out.push(di.phase); }
  return out.length ? out : ['follicular'];
}
function groceryItems() {
  const items = {};
  for (const ph of weekPhases()) {
    for (const nd of NUTRITION[ph].needs) for (const f of nd.foods) {
      const name = f.replace(/\s*\(.*\)/, '').replace(/\s*\d+%\+?/, '').trim();
      if (/^(soups|water$|every|plenty)/i.test(name)) continue;
      const key = name.toLowerCase();
      if (!items[key]) items[key] = { name, phases: [], why: nd.n };
      if (!items[key].phases.includes(ph)) items[key].phases.push(ph);
    }
  }
  const groups = AISLES.map(([a]) => [a, []]);
  const other = ['Other', []];
  for (const it of Object.values(items)) {
    const pantry = AISLES.findIndex(([a]) => a.startsWith('Seeds'));
    const g = /tea$/i.test(it.name) ? AISLES.length - 1 : AISLES[pantry][1].test(it.name) && !/^(ginger|lemon)/i.test(it.name) ? pantry : AISLES.findIndex(([, re]) => re.test(it.name));
    (g >= 0 ? groups[g][1] : other[1]).push(it);
  }
  // local seasonal foods that suit the coming week's phases go first
  const ph = weekPhases(), taken = new Set(Object.keys(items));
  const season = SZ.seasonal(myCountry(), new Date().getMonth() + 1)
    .filter(i => i.ph.some(p => ph.includes(p)) && !taken.has(i.f.toLowerCase()) && i.kind !== 'wild')
    .slice(0, 10).map(i => ({ name: i.f, phases: i.ph.filter(p => ph.includes(p)), why: `In season · ${{ warm: 'warming', cool: 'cooling', neutral: 'neutral' }[i.nature]}` }));
  return [['In season now', season], ...groups, other].filter(([, l]) => l.length);
}
function viewGrocery() {
  const phases = weekPhases(), groups = groceryItems(), got = state.grocery || {};
  const total = groups.reduce((n, [, l]) => n + l.length, 0), done = groups.reduce((n, [, l]) => n + l.filter(i => got[i.name.toLowerCase()]).length, 0);
  return `${topbar('Grocery list', { back: true })}
  <div class="pad">
    <h1 class="page-h">This week’s <span>basket</span></h1>
    <p class="muted">Built from the nutrients your next 7 days need — ${phases.map(p => `<b class="phase-inline" style="--c:${PHASE_COLOR.dark[p]}">${PHASES[p].name}</b>`).join(' then ')}.</p>
    <section class="card glass gro-prog"><div class="gp-top"><span>${done} of ${total} in the basket</span><button class="link" data-action="groClear">Clear ticks</button></div>
      <div class="gp-bar"><b style="width:${total ? done / total * 100 : 0}%"></b></div></section>
    ${groups.map(([aisle, list]) => `${sectionTitle(aisle)}
      <section class="card glass">${list.map(it => { const k = it.name.toLowerCase(); return `<button class="check-row gro ${got[k] ? 'on' : ''}" data-action="groToggle" data-k="${esc(k)}">
        <span class="cb">${icon('check', 14, 2.2)}</span><span class="gro-n">${esc(it.name)}<small>${it.why}</small></span>
        <span class="gro-ph">${it.phases.map(p => `<i style="background:${PHASE_COLOR.dark[p]}" title="${PHASES[p].name}"></i>`).join('')}</span></button>`; }).join('')}</section>`).join('')}
    <button class="btn btn-light btn-block" data-action="groShare">${icon('download', 18)} Share list</button>
    <p class="fine center">Dots show which phase each food supports.</p>
  </div>`;
}
function eatTodayCard(info) {
  const N = NUTRITION[info.phase];
  const top = N.needs.filter(n => n.ev !== 'tcm').slice(0, 2);
  const sym = recentSymptoms().find(s => SYMPTOM_FOODS[s]);
  return `<section class="card glass eat">
    <div class="eat-h"><div><div class="eyebrow">Eat today</div><h3>${N.focus}</h3></div></div>
    ${top.map(n => `<div class="eat-row"><span class="eat-n">${n.n}</span>${evBadge(n.ev)}<span class="eat-f">${n.foods.slice(0, 3).join(' · ')}</span></div>`).join('')}
    ${sym ? `<div class="eat-sym" ${reliefKey(sym) ? `data-action="nav" data-to="relief/${encodeURIComponent(reliefKey(sym))}"` : ''}>${icon('spark', 14)}<span><b>${sym}?</b> ${SYMPTOM_FOODS[sym].foods.slice(0, 3).join(', ')}</span></div>` : ''}
    <div class="eat-acts"><button class="btn btn-light" data-action="planTab" data-v="nourish">Full guide</button><button class="btn btn-ghost" data-action="nav" data-to="grocery">${icon('check', 16)} Grocery list</button></div>
  </section>`;
}

// ---------- reminders ----------
const REM_DEFAULT = { period: true, periodDays: 2, phase: true, checkin: true, checkinHour: 20, dismissed: {}, fired: {} };
function rem() { return state.reminders = { ...REM_DEFAULT, ...(state.reminders || {}) }; }
function dueReminders() {
  if (!M || !M.info) return [];
  const r = rem(), info = M.info, today = todayISO(), out = [];
  if (r.period) {
    if (info.late) out.push({ id: 'late', icon: 'drop', title: `Period ${plural(info.late, 'day')} late`, body: 'Stress, travel and sleep can shift your cycle. Log your period when it arrives — and take a test if pregnancy is possible.' });
    else if (info.dueToday) out.push({ id: 'due', icon: 'drop', title: 'Period expected today', body: 'Keep warm, have supplies ready and plan a softer day.' });
    else if (!info.isPeriod && info.daysToPeriod <= r.periodDays) out.push({ id: 'period', icon: 'drop', title: `Period in ${plural(info.daysToPeriod, 'day')}`, body: 'Pack supplies, stock up on iron-rich food and ginger tea, and keep your calendar light.' });
  }
  if (r.phase) {
    const y = C.dayInfo(C.addDays(new Date(), -1), M.stats);
    if (y && y.phase !== info.phase) out.push({ id: 'phase-' + info.phase, icon: 'spark', title: `Welcome to your ${PHASES[info.phase].name} phase`, body: `${PHASES[info.phase].tagline} Focus: ${NUTRITION[info.phase].focus}` });
  }
  if (r.checkin && !state.logs[today] && new Date().getHours() >= r.checkinHour) {
    out.push({ id: 'checkin', icon: 'heart', title: 'How are you feeling today?', body: 'A 10-second check-in helps Under the Skin learn your patterns.', to: 'log' });
  }
  return out.filter(x => r.dismissed[x.id] !== today);
}
function fireNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const r = rem(), today = todayISO();
  let changed = false;
  for (const x of dueReminders()) {
    if (r.fired[x.id] === today) continue;
    r.fired[x.id] = today; changed = true;
    const opts = { body: x.body, icon: 'icons/icon-192.png', badge: 'icons/icon-64.png', tag: x.id };
    navigator.serviceWorker?.ready.then(reg => reg.showNotification(x.title, opts)).catch(() => new Notification(x.title, opts));
  }
  if (changed) save();
}
function reminderBanners() {
  return dueReminders().map(x => `<section class="card banner">
    <span class="bn-ic">${icon(x.icon, 18)}</span>
    <div class="bn-t" ${x.to ? `data-action="nav" data-to="${x.to}"` : ''}><b>${x.title}</b><p>${x.body}</p></div>
    <button class="bn-x" data-action="dismissRem" data-id="${x.id}" aria-label="Dismiss">${icon('close', 16)}</button></section>`).join('');
}
function remindersSection() {
  const r = rem(), perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const tg = (k, label, sub) => `<div class="stepper-row"><span>${label}<small>${sub}</small></span><button class="toggle ${r[k] ? 'on' : ''}" data-action="remToggle" data-k="${k}"><i></i></button></div>`;
  const hr = h => `${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`;
  return `${sectionTitle('Reminders')}
    <section class="card glass">
      ${tg('period', 'Period coming', 'A heads-up before it starts')}
      ${r.period ? `<div class="stepper-row sub"><span>Days before</span>${stepper('periodDays', r.periodDays, 'rem')}</div>` : ''}
      ${tg('phase', 'New phase', 'When your hormones shift')}
      ${tg('checkin', 'Daily check-in', 'If you haven’t logged yet')}
      ${r.checkin ? `<div class="stepper-row sub"><span>From</span><div class="stepper"><button data-action="remHour" data-d="-1">−</button><span class="num">${hr(r.checkinHour)}</span><button data-action="remHour" data-d="1">+</button></div></div>` : ''}
      ${perm === 'granted' ? `<p class="fine" style="margin:8px 0 0">${icon('check', 13)} Phone notifications on</p>`
        : perm === 'denied' ? '<p class="fine" style="margin:8px 0 0">Notifications are blocked in your browser settings — reminders show inside the app.</p>'
        : perm === 'unsupported' ? '<p class="fine" style="margin:8px 0 0">Reminders show inside the app. Add Under the Skin to your home screen for notifications.</p>'
        : `<button class="btn btn-light btn-block" data-action="remPermission">${icon('spark', 16)} Turn on notifications</button>`}
    </section>`;
}

// ---------- relief guide ----------
const MOOD_TO_RELIEF = { Irritable: 'PMS mood', Anxious: 'PMS mood', Sad: 'PMS mood' };
function reliefKey(sym) { return RELIEF[sym] ? sym : MOOD_TO_RELIEF[sym] || null; }
function viewReliefIndex() {
  const recent = new Set();
  for (let i = 0; i < 4; i++) { const l = getLog(C.iso(C.addDays(new Date(), -i))); [...(l.symptoms || []), ...(l.moods || [])].forEach(s => { const k = reliefKey(s); if (k) recent.add(k); }); }
  const keys = Object.keys(RELIEF).sort((a, b) => recent.has(b) - recent.has(a));
  return `${topbar('Relief', { back: true })}
  <div class="pad">
    <div class="page-art">${mushroomArt(0, 'corner')}<h1 class="page-h">Feel better, <span>gently</span></h1></div>
    <p class="muted">What helps — body, food and Chinese medicine — with honest evidence labels.</p>
    <div class="relief-grid">${keys.map((k, i) => `<button class="rcard tall relief-c" data-action="nav" data-to="relief/${encodeURIComponent(k)}">${glowArt(['drop', 'wave', 'orb', 'hill', 'crown', 'peak'][i % 6], 70 + i)}
      <div class="rc-top"><span class="rc-k">${RELIEF[k].steps.length} steps</span>${recent.has(k) ? '<span class="rc-badge">Logged</span>' : ''}</div><div class="rc-t">${k}</div></button>`).join('')}</div>
  </div>`;
}
function viewRelief(id) {
  const k = decodeURIComponent(id || ''), R = RELIEF[k]; if (!R) return viewMissing();
  const food = SYMPTOM_FOODS[k] || (k === 'PMS mood' ? SYMPTOM_FOODS.Cravings : null);
  return `${topbar('Relief', { back: true })}
  <div class="pad">
    <h1 class="page-h">${k}</h1>
    <section class="card card-light mt"><div class="eyebrow dark">Why it happens</div><p class="dp-text">${R.why}</p></section>
    ${sectionTitle('What helps')}
    <section class="card glass relief-steps">${R.steps.map((x, i) => `<${x.to ? `button data-action="nav" data-to="${x.to}"` : 'div'} class="rs">
      <span class="step-n">${i + 1}</span><div class="rs-b"><div class="rs-h"><b>${x.t}</b>${evBadge(x.ev)}</div><p class="body sm">${x.d}</p></div>${x.to ? icon('chevR', 16) : ''}
    </${x.to ? 'button' : 'div'}>`).join('')}</section>
    ${food ? `${sectionTitle('Eat')}<section class="card glass"><p class="body sm" style="margin:0 0 10px">${food.tip}</p><div class="foods">${food.foods.map(f => `<span class="food">${f}</span>`).join('')}</div></section>` : ''}
    <section class="card tcm-card"><div class="tcm-glyph">${icon('yinyang', 30)}</div><div class="tcm-main"><div class="eyebrow">Chinese medicine view</div><p class="body" style="margin-top:6px">${R.tcm}</p></div></section>
    <p class="fine center">General information, not medical advice. Check with a pharmacist before taking painkillers or supplements.</p>
  </div>`;
}
// Flags cycles outside the usual 21–35 day range (or a too-short gap that is probably a mis-tap).
function cycleFlag() {
  const ps = M.stats.periods; if (ps.length < 2) return '';
  const a = ps[ps.length - 2], b = ps[ps.length - 1], gap = C.diffDays(b.start, a.start);
  const key = C.iso(b.start);
  if ((state.flagDismissed || '') === key) return '';
  let msg = '';
  if (gap < 15) msg = `Your latest period was logged ${gap} days after the previous one. If that was spotting or a mis-tap, remove it in the calendar so predictions stay accurate.`;
  else if (gap < 21) msg = `Your last cycle was ${gap} days — shorter than the usual 21–35. One short cycle is common; if it keeps happening, mention it to your doctor.`;
  else if (gap > 35) msg = `Your last cycle was ${gap} days — longer than the usual 21–35. Stress, travel or illness can do this; if it keeps happening, mention it to your doctor.`;
  if (!msg) return '';
  return `<section class="card flag"><span class="bn-ic">${icon('spark', 18)}</span><div class="bn-t"><b>Unusual cycle</b><p>${msg}</p>
    <div class="flag-acts"><button class="link" data-action="flagEdit" data-date="${key}">Open calendar</button><button class="link muted-l" data-action="flagDismiss" data-k="${key}">It’s correct</button></div></div></section>`;
}

// ---------- personal patterns (learned from logs) ----------
function patterns() {
  const L = M.stats.avgCycle, sym = {}, energy = Array.from({ length: L + 1 }, () => []), cycles = new Set();
  for (const k in state.logs) {
    const di = C.dayInfo(C.parseISO(k), M.stats); if (!di || di.cd > L) continue;
    const l = state.logs[k]; cycles.add(C.iso(di.cycleStart));
    [...(l.symptoms || []), ...(l.moods || []).filter(m => MOOD_TO_RELIEF[m])].forEach(s => {
      const x = sym[s] = sym[s] || { name: s, days: Array(L + 1).fill(0), n: 0, cycles: new Set() };
      x.days[di.cd]++; x.n++; x.cycles.add(C.iso(di.cycleStart));
    });
    if (l.energy) energy[di.cd].push(l.energy);
  }
  const list = Object.values(sym).filter(x => x.n >= 3 && x.cycles.size >= 2).map(x => {
    const max = Math.max(...x.days), peak = x.days.indexOf(max);
    let a = peak, b = peak;
    while (a > 1 && x.days[a - 1] >= max * 0.5) a--;
    while (b < L && x.days[b + 1] >= max * 0.5) b++;
    return { ...x, peak, from: a, to: b, max, phase: C.phaseFor(peak, L, M.stats.avgPeriod), cyclesN: x.cycles.size };
  }).sort((p, q) => q.n - p.n);
  const eAvg = energy.map(v => v.length ? v.reduce((s, x) => s + x, 0) / v.length : null);
  return { list, eAvg, L, cycles: cycles.size };
}
function upcomingPatterns(P) {
  if (!M.info) return [];
  const out = [];
  for (const x of P.list) {
    for (let i = 0; i <= 5; i++) {
      const di = C.dayInfo(C.addDays(new Date(), i), M.stats);
      if (di && di.cd >= x.from && di.cd <= x.to) { out.push({ ...x, inDays: i }); break; }
    }
  }
  return out.slice(0, 3);
}
function headsUpCard() {
  const P = patterns(), up = upcomingPatterns(P);
  if (!up.length) return '';
  return `${sectionTitle('Heads-up from your patterns')}
    <section class="card glass headsup">${up.map(x => { const rk = reliefKey(x.name); return `<${rk ? `button data-action="nav" data-to="relief/${encodeURIComponent(rk)}"` : 'div'} class="hu-row">
      <span class="hu-when">${x.inDays === 0 ? 'Today' : x.inDays === 1 ? 'Tomorrow' : `In ${x.inDays} days`}</span>
      <span class="hu-t"><b>${x.name}</b> usually shows up on ${x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`}<small>Seen in ${x.cyclesN} of your cycles</small></span>${rk ? icon('chevR', 16) : ''}</${rk ? 'button' : 'div'}>`; }).join('')}</section>`;
}
function patternsSection() {
  const P = patterns(), L = P.L, info = M.info;
  // energy: your logged average vs the hormone model
  const W = 340, H = 120, X = d => 10 + (d - 1) / (L - 1) * (W - 20), Y = v => H - 14 - (v - 1) / 4 * (H - 30);
  let model = '', mine = '', dots = '';
  for (let d = 1; d <= L; d++) model += `${d === 1 ? 'M' : 'L'}${X(d).toFixed(1)} ${Y(1 + 4 * C.energyAt(d, L, M.stats.avgPeriod)).toFixed(1)}`;
  const pts = [];
  for (let d = 1; d <= L; d++) { // 3-day smoothing over logged days
    const w = [P.eAvg[d - 1], P.eAvg[d], P.eAvg[d + 1]].filter(v => v != null);
    if (P.eAvg[d] != null && w.length) pts.push([d, w.reduce((a, b) => a + b, 0) / w.length]);
  }
  pts.forEach(([d, v], i) => { mine += `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(v).toFixed(1)}`; dots += `<circle cx="${X(d).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2.2" fill="#d4ef9a"/>`; });
  const bands = C.phaseRanges(L, M.stats.avgPeriod).map(r => `<rect x="${X(r.from) - 4}" y="4" width="${X(r.to) - X(r.from) + 8}" height="${H - 18}" rx="8" fill="${BAND[r.key]}"/>`).join('');
  const energyCard = pts.length >= 6 ? `<section class="card glass">
      <div class="eyebrow">Energy · your logs vs your hormones</div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" class="pat-svg">${bands}
        <path d="${model}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="4 4"/>
        <path d="${mine}" fill="none" stroke="#d4ef9a" stroke-width="2.4" stroke-linejoin="round"/>${dots}
        ${info ? `<line x1="${X(Math.min(info.cd, L))}" x2="${X(Math.min(info.cd, L))}" y1="6" y2="${H - 14}" stroke="#fff" stroke-dasharray="2 3" opacity=".6"/>` : ''}
        <text x="10" y="${H - 1}" class="pat-ax">Day 1</text><text x="${W - 10}" y="${H - 1}" text-anchor="end" class="pat-ax">Day ${L}</text></svg>
      <div class="pat-leg"><span><i class="me"></i>You (logged)</span><span><i class="mo"></i>Hormone forecast</span></div>
    </section>` : '';
  const rows = P.list.slice(0, 6).map(x => `<div class="pat-row">
      <div class="pat-h"><b>${x.name}</b><span>${x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`} · ${PHASES[x.phase].name}</span></div>
      <div class="pat-strip">${x.days.slice(1).map((v, i) => `<i style="opacity:${v ? .25 + .75 * v / x.max : 1};background:${v ? PHASE_COLOR.dark[C.phaseFor(i + 1, L, M.stats.avgPeriod)] : 'rgba(255,255,255,.05)'}"></i>`).join('')}</div>
    </div>`).join('');
  return `${sectionTitle('Your patterns')}
    ${P.list.length || energyCard ? `${energyCard}
      ${rows ? `<section class="card glass"><div class="eyebrow" style="margin-bottom:6px">When your symptoms show up</div>${rows}
        <div class="pat-days"><span>Day 1</span><span>Ovulation ~${C.ovulationDay(L, M.stats.avgPeriod)}</span><span>Day ${L}</span></div></section>` : ''}`
      : `<section class="card glass"><p class="muted" style="margin:0">Log symptoms and energy across 2 cycles and Under the Skin will show you <b>your</b> patterns — which days cramps, bloating or low moods tend to arrive, and how your energy really moves.</p></section>`}`;
}

// ---------- remedies ----------
function remediesFor(info) {
  const warm = warmWindow(info);
  return REMEDIES.filter(r => r.phases.includes(info.phase) && !(warm && r.raw));
}
function lemonState() {
  const L = state.lemon; if (!L || !L.start) return null;
  const day = C.diffDays(new Date(), C.parseISO(L.start)) + 1;
  if (day > 28) return { ...L, day, over: true };
  return { ...L, day, week: Math.ceil(day / 7), doneToday: !!(L.done || {})[todayISO()], count: Object.keys(L.done || {}).length };
}
function viewRemedy(id) {
  const r = REMEDIES.find(x => x.id === id); if (!r) return viewMissing();
  const info = M.info, warm = warmWindow(info), organPhase = PHASE_ORDER.find(p => TCM[p].organ.includes(r.organ));
  let tracker = '';
  if (r.days) {
    const ls = lemonState();
    if (!ls || ls.over) {
      tracker = `<section class="card card-light"><div class="eyebrow dark">28-day ritual</div><h3 class="dark-h">${ls?.over ? 'Ready for another round?' : 'Start your 28 days'}</h3>
        <p class="dp-text">${info && info.cd === 1 ? 'Today is day 1 of your cycle — the perfect day to begin.' : info ? `Best started on day 1 of your cycle — your next one is in ${plural(info.daysToPeriod, 'day')}. You can also start today.` : ''}</p>
        <button class="btn btn-dark btn-block" data-action="lemonStart">${icon('play', 16)} Start today</button></section>`;
    } else {
      const wk = r.weeks[Math.min(ls.week, 4) - 1];
      let dots = '';
      for (let d = 1; d <= 28; d++) { const k = C.iso(C.addDays(C.parseISO(ls.start), d - 1)); dots += `<i class="${(ls.done || {})[k] ? 'on' : ''} ${d === ls.day ? 'now' : ''}"></i>`; }
      tracker = `<section class="card glass lemon">
        <div class="lm-top"><div><div class="eyebrow">Day ${ls.day} of 28 · week ${ls.week}</div><h3>${wk.add}</h3><p class="body sm">${wk.gain}</p></div>
          <button class="lm-tick ${ls.doneToday ? 'on' : ''}" data-action="lemonTick">${icon('check', 22, 2.2)}</button></div>
        <div class="lm-dots">${dots}</div><div class="lm-foot">${ls.count} of 28 mornings done</div></section>`;
    }
  }
  return `${topbar('Remedy', { back: true })}
  <div class="pad">
    <section class="detail-hero remedy-hero">${glowArt('orb', 95)}<span class="dh-glyph">${r.glyph}</span>
      <div class="dh-in"><div class="eyebrow">${r.nature} · ${r.element} · ${r.organ}</div><h1>${r.name}</h1></div></section>
    ${r.raw && warm ? `<section class="card flag"><span class="bn-ic">${icon('yinyang', 18)}</span><div class="bn-t"><b>Not today</b><p>You’re in your warm window — Chinese medicine keeps raw and cold food away during your period and the days before. Save this for your follicular phase.</p></div></section>` : ''}
    ${tracker}
    <section class="card tcm-card"><div class="tcm-glyph">${Z.FIVE[r.element].han}</div><div class="tcm-main"><div class="eyebrow">How it connects</div>
      <p class="body" style="margin-top:6px">${r.why}</p>
      ${organPhase ? `<p class="body sm">${r.organ} is the organ of your <b class="lime">${PHASES[organPhase].name}</b> phase (${TCM[organPhase].element}).</p>` : ''}</div></section>
    ${sectionTitle(r.days ? 'You need' : 'Ingredients')}
    <section class="card glass">${r.ingredients.map(g => `<div class="ing">${icon('leaf', 14)}<span>${g}</span></div>`).join('')}</section>
    ${sectionTitle('How')}
    <section class="card glass">${r.steps.map((x, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${x}</p></div>`).join('')}</section>
    ${r.weeks ? `${sectionTitle('Week by week')}<section class="card glass">${r.weeks.map(w => `<div class="tide on"><span class="tide-g">${w.w}</span><div><div class="tide-n">${w.add}</div><div class="tide-s">${w.gain}</div></div></div>`).join('')}</section>` : ''}
    <p class="fine center">Traditional home remedies — not a replacement for medical care.</p>
  </div>`;
}
function remedyCards(info) {
  return REMEDIES.slice().sort((a, b) => remediesFor(info).includes(b) - remediesFor(info).includes(a)).map((r, i) => {
    const ok = remediesFor(info).includes(r);
    return `<button class="rcard tall ${ok ? '' : 'dim'}" data-action="nav" data-to="remedy/${r.id}">${glowArt(['orb', 'drop', 'wave', 'crown', 'hill'][i % 5], 80 + i)}
      <span class="rc-glyph">${r.glyph}</span><div class="rc-top"><span class="rc-k">${r.organ} · ${r.element}</span>${ok ? '' : '<span class="rc-badge">Not now</span>'}</div><div class="rc-t">${r.name}</div></button>`;
  }).join('');
}

// Marks the single calendar day closest to the exact new / full moon.
function moonEvent(d) {
  const SYN = 29.530588853, at = x => Z.moonAge(new Date(x.getFullYear(), x.getMonth(), x.getDate(), 12));
  const dNew = a => Math.min(a, SYN - a), dFull = a => Math.abs(a - SYN / 2);
  const a0 = at(C.addDays(d, -1)), a1 = at(d), a2 = at(C.addDays(d, 1));
  if (dNew(a1) < 1 && dNew(a1) < dNew(a0) && dNew(a1) <= dNew(a2)) return 'new';
  if (dFull(a1) < 1 && dFull(a1) < dFull(a0) && dFull(a1) <= dFull(a2)) return 'full';
  return null;
}

// ---------- everything connected ----------
function moonIcon(moon, size = 18) {
  const r = size / 2 - 1, c = size / 2, k = Math.cos(moon.illum * Math.PI) * r, wax = moon.age < 14.77;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="rgba(212,239,154,.15)"/>
    <path d="M${c} ${c - r} A${r} ${r} 0 0 ${wax ? 1 : 0} ${c} ${c + r} A${Math.abs(k).toFixed(2)} ${r} 0 0 ${(k > 0) === wax ? 0 : 1} ${c} ${c - r}Z" fill="#d4ef9a"/></svg>`;
}
function alignmentCard(info) {
  const ph = PHASES[info.phase], tcm = TCM[info.phase], moon = Z.moonPhase(new Date()), cp = cosmicProfile();
  const h = C.hormonesRel(Math.min(info.cd, info.L), info.L, info.P);
  const hs = HORMONES.filter(x => x.key !== 'fsh').map(x => ({ ...x, v: h[x.key], tr: C.hormoneTrend(Math.min(info.cd, info.L), info.L, info.P, x.key) })).sort((a, b) => b.v - a.v).slice(0, 2);
  const hLine = hs.map(x => `${x.name} ${C.hormoneLevel(x.v).toLowerCase()}${x.tr === 'rising' ? ' ↗' : x.tr === 'falling' ? ' ↘' : ''}`).join(' · ');
  const waxing = moon.age < 14.77, building = info.phase === 'follicular' || info.phase === 'ovulatory';
  const moonSync = waxing === building ? (waxing ? 'In sync — moon and hormones are both building.' : 'In sync — moon and body are both turning inward.') : (waxing ? 'The moon is building while your body turns inward — honour your body first.' : 'The moon is releasing while your energy rises — use both: let go and begin.');
  const rem = remediesFor(info)[dayNum(new Date()) % Math.max(1, remediesFor(info).length)] || REMEDIES[0];
  const top = hs[0];
  const tile = (g, t, to, han) => `<button class="cx" data-action="nav" data-to="${to}"><span class="cx-g ${han ? 'han' : ''}">${g}</span><span class="cx-t">${t}</span></button>`;
  return `${sectionTitle('Everything connected')}
  <div class="cx-row">
    ${tile(`<i style="background:${top.color}"></i>`, `${top.name} ${top.tr === 'rising' ? '↗' : top.tr === 'falling' ? '↘' : ''}`, 'hormones')}
    ${tile(tcm.elementGlyph, tcm.element, 'point/' + info.phase, true)}
    ${tile(moonIcon(moon, 26), /full/i.test(moon.name) ? 'Full moon' : /new/i.test(moon.name) ? 'New moon' : /wax/i.test(moon.name) ? 'Waxing' : /wan/i.test(moon.name) ? 'Waning' : moon.name, 'cosmic')}
    ${tile(cp ? cp.sign.glyph : '✦', cp ? cp.sign.name : 'Stars', 'cosmic')}
    ${tile(rem.glyph, rem.name.split(' ')[0], 'remedy/' + rem.id, true)}
  </div>`;
}

// ---------- daily focus ----------
function dayWindow(info) {
  const { cd, L, P, ov } = info;
  if (cd > L - 4 || cd > L) return 'premenstrual';
  if (cd <= Math.min(2, P)) return 'flow-start';
  if (cd <= P) return 'flow-end';
  if (cd <= ov - 5) return 'rising';
  if (cd <= ov - 2) return 'building';
  if (cd <= ov + 1) return 'peak';
  if (cd <= ov + 6) return 'settle';
  return 'focus';
}

// ---------- full cycle guide: hormones (shared scale) + ovaries + uterine lining + days ----------
const FULL_H = [
  { key: 'lh', name: 'LH', color: '#b18cff' }, { key: 'fsh', name: 'FSH', color: '#6cc4ff' },
  { key: 'estrogen', name: 'Estrogen', color: '#ff8fc4' }, { key: 'progesterone', name: 'Progesterone', color: '#5fd38a' },
  { key: 'testosterone', name: 'Testosterone', color: '#ff4d4d' },
];
function liningAt(cd, L, P, ov) { // relative endometrium thickness
  if (cd <= P) return 1 - 0.75 * (cd - 1) / Math.max(1, P - 1);
  if (cd <= ov) return 0.25 + 0.35 * (cd - P) / (ov - P);
  if (cd <= ov + 7) return 0.6 + 0.38 * (cd - ov) / 7;
  return 0.98 - 0.08 * Math.max(0, cd - (L - 3)) / 3;
}
function ovaryArt(cd, ov, L, x, y) {
  if (cd < ov) { // growing follicle: outer cells, fluid cavity (antrum) from ~a week before ovulation, egg
    const k = (cd - 1) / Math.max(1, ov - 2), r = 3.5 + 10 * k, an = cd >= ov - 7 ? r * (0.25 + 0.4 * k) : 0;
    return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ff8fc4" fill-opacity=".28" stroke="#ff8fc4" stroke-width="1.2"/>
      ${an ? `<circle cx="${-r * .18}" cy="${r * .1}" r="${an}" fill="#bfe3ff" fill-opacity=".55"/>` : ''}<circle cx="${r * .35}" cy="${-r * .25}" r="${Math.max(1.6, r * .22)}" fill="#fff"/></g>`;
  }
  if (cd === ov) return `<g transform="translate(${x} ${y})"><path d="M-12 -4 Q-14 -14 -3 -14 Q6 -16 11 -7 Q15 2 7 9 Q0 15 -7 10 Q-13 5 -12 -4Z" fill="#bfe3ff" fill-opacity=".5" stroke="#ff8fc4" stroke-width="1.4"/>
    <circle cx="3" cy="16" r="3.4" fill="#fff" stroke="#ff8fc4"/><circle cx="7" cy="12" r="1" fill="#bfe3ff"/><circle cx="-1" cy="13" r=".8" fill="#bfe3ff"/></g>`;
  const d = cd - ov, life = L - ov, k = d <= 7 ? 0.55 + 0.45 * d / 7 : 1 - 0.6 * (d - 7) / Math.max(1, life - 7), r = 13 * k, pale = d > 9;
  return `<g transform="translate(${x} ${y})"><ellipse rx="${r * 1.15}" ry="${r}" fill="${pale ? '#e9e4d0' : '#f6dfa0'}" fill-opacity="${pale ? .5 : .85}" stroke="${pale ? '#cfc8ad' : '#e9c46a'}"/>
    ${pale ? '' : `<path d="M${-r * .5} 0 Q${-r * .2} ${-r * .3} 0 0 T${r * .5} 0" stroke="#c0392b" stroke-width="${Math.max(1, r * .18)}" fill="none" stroke-linecap="round"/>`}</g>`;
}
function fullCycleGuide(info) {
  const L = info.L, P = info.P, ov = C.ovulationDay(L, P), cd = Math.min(info.cd, L);
  const COL = { m: '#e5484d', f: '#f3c4a6', o: '#2fbf71', l: '#a9c7ef' };
  const kind = d => d <= P ? 'm' : Math.abs(d - ov) <= 1 ? 'o' : d < ov ? 'f' : 'l';
  const stages = [
    { k: 'm', name: 'Period', days: [1, P], art: 1, lining: 1, lead: [['Estrogen', '#ff8fc4', 'low'], ['Progesterone', '#5fd38a', 'low']],
      text: 'Hormones are at their lowest, so last month’s lining sheds. Your brain sends FSH to start a new egg growing.' },
    { k: 'f', name: 'Building up', days: [P + 1, ov - 2], art: Math.round((P + ov) / 2), lining: Math.round((P + ov) / 2), lead: [['Estrogen', '#ff8fc4', 'rising']],
      text: 'One egg grows inside its follicle and makes more and more estrogen, which rebuilds the lining and lifts your energy.' },
    { k: 'o', name: 'Egg release', days: [ov - 1, ov + 1], art: ov, lining: ov, lead: [['Estrogen', '#ff8fc4', 'peak'], ['LH', '#b18cff', 'surge'], ['Testosterone', '#ff4d4d', 'small lift']],
      text: `Peak estrogen triggers the LH surge and the egg is released around day ${ov}. Fertile window: about days ${ov - 5}–${ov + 1}.` },
    { k: 'l', name: 'After ovulation', days: [ov + 2, L], art: ov + 6, lining: ov + 7, lead: [['Progesterone', '#5fd38a', 'high']],
      text: 'The empty follicle becomes the corpus luteum and makes progesterone. The lining thickens. If there’s no pregnancy, both hormones drop and your period starts.' },
  ];
  // picture: ovaries across the month, the uterine lining, and the days
  const W = 360, x0 = 6, x1 = W - 6, X = t => x0 + (t - 1) / L * (x1 - x0), cw = (x1 - x0) / L;
  const oy = 54, lt = 112, lb = 156, sy = 166;
  const cand = [1, 4, 7, 10, ov - 2, ov, ov + 3, ov + 6, ov + 10, L - 1].filter(d => d >= 1 && d <= L);
  const pics = []; for (const d of [...new Set(cand)].sort((a, b) => a - b)) { const prev = pics[pics.length - 1]; if (prev !== undefined && X(d) - X(prev) < 27) { if (d === ov) pics.pop(); else continue; } pics.push(d); }
  const caps = [[Math.round((1 + ov) / 2) - 1, 'Egg growing'], [ov, 'Egg released'], [ov + 6, 'Yellow body'], [L - 1, 'Shrinks']];
  let lining = `M${X(1)} ${lb}`;
  for (let t = 1; t <= L + 1; t += 0.25) lining += `L${X(t).toFixed(1)} ${(lb - 4 - liningAt(Math.min(t, L), L, P, ov) * (lb - lt - 6)).toFixed(1)}`;
  lining += `L${X(L + 1)} ${lb}Z`;
  const drops = Array.from({ length: P }, (_, i) => `<circle cx="${X(i + 1.5)}" cy="${lb + 0}" r="2.2" fill="#e5484d"/>`).join('');
  const mid = (a, b) => ((X(a) + X(b + 1)) / 2).toFixed(1);
  const diagram = `<svg viewBox="0 0 ${W} 206" width="100%" class="fcg-svg">
    <text x="${x0}" y="14" class="fcg-row">OVARY</text>
    ${pics.map(d => `<g transform="translate(${X(d + .5).toFixed(1)} ${oy}) scale(1.05)">${ovaryArt(d, ov, L, 0, 0)}</g>`).join('')}
    ${caps.filter(([d]) => d >= 1 && d <= L).map(([d, t]) => `<text x="${Math.min(W - 26, Math.max(26, X(d + .5))).toFixed(1)}" y="${oy + 32}" text-anchor="middle" class="fcg-cap">${t}</text>`).join('')}
    <text x="${x0}" y="${lt - 6}" class="fcg-row">UTERINE LINING</text>
    <path d="${lining}" fill="#f2a5ad" fill-opacity=".6"/>${drops}
    ${Array.from({ length: L }, (_, i) => { const d = i + 1; return `<rect x="${(X(d) + .6).toFixed(1)}" y="${sy}" width="${(cw - 1.2).toFixed(1)}" height="12" rx="2" fill="${COL[kind(d)]}" ${d === cd ? 'stroke="#fff" stroke-width="1.8"' : ''}/>`; }).join('')}
    <line x1="${X(cd + .5)}" x2="${X(cd + .5)}" y1="22" y2="${sy - 2}" stroke="#fff" stroke-opacity=".5" stroke-dasharray="2 3"/>
    <text x="${X(cd + .5)}" y="${sy + 24}" text-anchor="middle" class="fcg-today">Today · day ${cd}</text>
    <text x="${x0}" y="${sy + 36}" class="fcg-k">Day 1</text><text x="${x1}" y="${sy + 36}" text-anchor="end" class="fcg-k">Day ${L}</text>
  </svg>`;
  return `<details class="card glass fcg"><summary><span class="art-ic">${icon('chart', 20)}</span><span class="art-t">Full cycle guide<small>What happens in your body, step by step</small></span>${icon('chevD', 18)}</summary>
    <div class="fcg-body">
      ${diagram}
      ${stages.map((st, i) => `<div class="fcg-st ${st.days[0] <= cd && cd <= st.days[1] ? 'on' : ''}">
        <div class="fcg-hd"><span class="fcg-dot" style="background:${COL[st.k]}"></span><b>${i + 1}. ${st.name}</b><span class="fcg-days">${st.days[0] === st.days[1] ? `Day ${st.days[0]}` : `Days ${st.days[0]}–${st.days[1]}`}</span></div>
        <div class="fcg-lead">${st.lead.map(([n, c, w]) => `<span><i style="background:${c}"></i>${n} <em>${w}</em></span>`).join('')}</div>
        <p>${st.text}</p></div>`).join('')}
      <p class="fine">Typical timing for your ${L}-day cycle — real days shift a little from cycle to cycle.</p>
    </div></details>`;
}

// ---------- hormone explainer (real photos) ----------
function viewHormones() {
  const { info } = M, L = info.L, P = info.P, cd = Math.min(info.cd, L), h = C.hormonesRel(cd, L, P), ph = PHASES[info.phase];
  const keyOf = n => ({ Oestrogen: 'estrogen', Progesterone: 'progesterone', FSH: 'fsh', LH: 'lh', Testosterone: 'testosterone' })[n];
  const cards = HORMONE_LIBRARY.map((x, i) => {
    const u = hormonePhoto(x.n, 700), cr = HORMONE_PHOTOS[x.n], k = keyOf(x.n);
    const lvl = k ? (() => { const tr = C.hormoneTrend(cd, L, P, k); return `<span class="hx-lvl"><b style="width:${Math.round(h[k] * 100)}%"></b></span><span class="hx-now">Today: ${C.hormoneLevel(h[k])}${tr === 'rising' ? ' ↗' : tr === 'falling' ? ' ↘' : ''}</span>`; })() : '';
    return `<article class="card hx" id="hx-${i}">
      ${u ? `<div class="hx-photo"><img src="${u}" alt="" loading="lazy" decoding="async"><span class="hx-shade"></span><span class="hx-gland">${x.g}</span>${cr ? `<span class="hx-cr">Photo · ${esc(cr.by)} / Unsplash</span>` : ''}</div>` : ''}
      <div class="hx-b"><div class="hx-top"><h3>${x.n}</h3>${lvl ? `<div class="hx-meter">${lvl}</div>` : ''}</div>
        <p class="body sm">${x.role}</p>
        <div class="hx-row"><span class="eyebrow">In your cycle</span><p>${x.cycle}</p></div>
        <div class="hx-row"><span class="eyebrow">Support it</span><p>${x.support}</p></div></div>
    </article>`;
  }).join('');
  return `${topbar('Hormones', { back: true })}
  <div class="pad">
    <h1 class="page-h">The role of <span>your hormones</span></h1>
    <section class="card glass chart-card">${cycleChart(info, { id: 'hx', compact: true })}
      <p class="body sm">Day ${info.cd} · ${ph.name} phase. ${ph.hormones}</p></section>
    <div class="hx-index">${HORMONE_LIBRARY.map((x, i) => `<a href="#/hormones" data-action="hxJump" data-i="${i}">${x.n}</a>`).join('')}</div>
    ${cards}
    <p class="fine center">Photos: Unsplash (free licence). Hormone curves are a typical model, not lab values.</p>
  </div>`;
}

// ---------- movement by cycle ----------
function windowAt(cd, L, P) { return dayWindow({ cd, L, P, ov: C.ovulationDay(L, P) }); }
function moveDots(n) { return `<span class="mv-dots">${[1, 2, 3].map(i => `<i class="${n >= i ? 'on' : ''}"></i>`).join('')}</span>`; }
const MV_WORD = ['Rest instead', 'Go lighter', 'Good', 'Best time'];
const MOVE_PHOTO = { 'flow-start': 'Melatonin', 'premenstrual': 'Melatonin', 'flow-end': 'Cortisol', 'settle': 'Cortisol', 'focus': 'Cortisol', rising: 'Adrenaline', building: 'Testosterone', peak: 'Testosterone' };
function moveCard(info) {
  const k = dayWindow(info), g = MOVE_GUIDE[k], best = MOVES.filter(m => g.r[m.k] === 3).map(m => m.n), u = hormonePhoto(MOVE_PHOTO[k], 700);
  return `${sectionTitle('Move today', ['Guide', 'move'])}
    <button class="card move-card photo" data-action="nav" data-to="move">${u ? `<img src="${u}" alt="" loading="lazy"><span class="mv-shade"></span>` : ''}
      <div class="mv-in"><h3>${g.title}</h3><div class="mv-best">${best.map(b => `<span>${b}</span>`).join('')}</div></div></button>`;
}
function viewMove() {
  const { info } = M, L = info.L, P = info.P, key = dayWindow(info), g = MOVE_GUIDE[key];
  const days = Array.from({ length: L }, (_, i) => windowAt(i + 1, L, P));
  const spans = k => { const out = []; let s = null; days.forEach((w, i) => { const ok = MOVE_GUIDE[w].r[k] === 3; if (ok && s === null) s = i + 1; if ((!ok || i === L - 1) && s !== null) { out.push([s, ok ? i + 1 : i]); s = null; } }); return out; };
  const rng = ([a, b]) => a === b ? `day ${a}` : `days ${a}–${b}`;
  const strip = k => `<div class="mv-strip">${days.map((w, i) => `<i class="r${MOVE_GUIDE[w].r[k]} ${i + 1 === Math.min(info.cd, L) ? 'now' : ''}"></i>`).join('')}</div>`;
  return `${topbar('Move', { back: true })}
  <div class="pad">
    <h1 class="page-h">Move with <span>your cycle</span></h1>
    <section class="card card-light">
      <div class="eyebrow dark">Today · day ${info.cd} · ${PHASES[info.phase].name}</div>
      <h3 class="dark-h">${g.title}</h3><p class="dp-text">${g.tip}</p>
      <div class="mv-today">${MOVES.map(m => `<div class="mv-t r${g.r[m.k]}"><span>${m.n}</span><em>${MV_WORD[g.r[m.k]]}</em></div>`).join('')}</div>
    </section>
    ${sectionTitle('Best time for each')}
    ${MOVES.map(m => { const sp = spans(m.k); return `<section class="card glass mv-row">
      <div class="mv-rh"><b>${m.n}</b>${moveDots(g.r[m.k])}</div><small class="muted">${m.d}</small>
      ${strip(m.k)}
      <p class="body sm">${sp.length ? `Best on ${sp.map(rng).join(' & ')} of your ${L}-day cycle.` : 'Fine any time — follow your energy.'}</p></section>`; }).join('')}
    <div class="mv-leg"><span><i class="r3"></i>Best</span><span><i class="r2"></i>Good</span><span><i class="r1"></i>Lighter</span><span><i class="r0"></i>Rest</span><span><i class="now"></i>Today</span></div>
    ${sectionTitle('Your month of movement')}
    <section class="card glass">${Object.entries(MOVE_GUIDE).filter(([k]) => days.includes(k)).map(([k, x]) => { const idx = days.map((w, i) => w === k ? i + 1 : 0).filter(Boolean); return `<div class="mv-win ${k === key ? 'on' : ''}"><span class="mv-d">${idx[0] === idx[idx.length - 1] ? idx[0] : `${idx[0]}–${idx[idx.length - 1]}`}</span><div><b>${x.title}</b><p class="body sm">${x.tip}</p></div></div>`; }).join('')}</section>
    <p class="fine center">Research on training by cycle phase is still emerging and results are mixed. Your energy on the day always wins — some women set personal bests on their period.</p>
  </div>`;
}

// ---------- hormone habits ----------
function habitsDone(k) { return ((state.habits || {})[k] || []); }
function viewHabits() {
  const k = todayISO(), done = habitsDone(k), total = HABITS.length, n = done.length;
  const R = 46, Cc = 2 * Math.PI * R;
  let week = '';
  for (let i = 6; i >= 0; i--) { const d = C.addDays(new Date(), -i), c = habitsDone(C.iso(d)).length; week += `<div class="hb-day"><b style="height:${Math.max(6, c / total * 100)}%"></b><span>${fmt(d, { weekday: 'narrow' })}</span></div>`; }
  const group = (g, title, sub) => `${sectionTitle(title)}<p class="muted" style="margin:-6px 4px 10px">${sub}</p>
    <section class="card glass habits">${HABITS.filter(h => h.g === g).map(h => `<button class="hb ${done.includes(h.id) ? 'on' : ''}" data-action="habitTick" data-id="${h.id}">
      <span class="cb">${icon('check', 13, 2.4)}</span><span class="hb-t"><b>${h.t}</b><small>${h.why}</small></span></button>`).join('')}</section>`;
  return `${topbar('Hormone habits', { back: true })}
  <div class="pad">
    <section class="card hb-hero">
      <svg viewBox="0 0 110 110" width="110" height="110"><circle cx="55" cy="55" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>
        <circle cx="55" cy="55" r="${R}" fill="none" stroke="#d4ef9a" stroke-width="9" stroke-linecap="round" stroke-dasharray="${Cc}" stroke-dashoffset="${Cc * (1 - n / total)}" transform="rotate(-90 55 55)" style="transition:stroke-dashoffset .5s"/>
        <text x="55" y="60" text-anchor="middle" class="hb-num">${n}</text></svg>
      <div><div class="eyebrow">Today</div><h3>${n} of ${total} habits</h3><p class="body sm">Small daily choices that protect your hormones and fertility.</p><div class="hb-week">${week}</div></div>
    </section>
    ${group('protect', 'Protect your hormones', 'The opposite of what harms women’s health most.')}
    ${group('fertile', 'Fertility & feminine flow', 'Fundamentals for a warm womb and a calm nervous system.')}
    <p class="fine center">You’re not the problem — the modern world is designed against your rhythm. One habit at a time.</p>
  </div>`;
}
function hormoneLibrary() {
  return `${sectionTitle('Your hormones, explained')}
    <div class="fig-wrap lib"><canvas class="figure" data-focus="head"></canvas><span class="lib-cap">Glands from head to womb — tap a hormone below</span></div>
    <section class="card glass hlib">${HORMONE_LIBRARY.map(h => `<details class="hl"><summary><span class="hl-n">${h.n}</span><span class="hl-g">${h.g}</span>${icon('chevD', 14)}</summary>
      <p>${h.role}</p><p><b class="lime">In your cycle · </b>${h.cycle}</p><p><b class="lime">Support it · </b>${h.support}</p></details>`).join('')}</section>`;
}
function fertilityFoods() {
  return `${sectionTitle('Fertility foods & habits')}
    <section class="card glass ff">${FERTILITY_FOODS.map(x => `<div class="ff-row"><b>${x.f}</b><span>${x.why}</span></div>`).join('')}</section>`;
}

// ---------- couples: partners who also use the app ----------
const SYNC = {
  'menstrual|menstrual': 'You’re both on your period — cancel plans, share the hot water bottle, rest together.',
  'luteal|luteal': 'You’re both in your luteal phase — extra gentle, fewer plans, lots of patience with each other.',
  'luteal|menstrual': 'One of you is bleeding, one is premenstrual — a cosy, low-key few days for you both.',
  'follicular|follicular': 'You’re both rising — perfect for trying something new together.',
  'ovulatory|ovulatory': 'You’re both at your peak — plan the date night.',
  'follicular|ovulatory': 'Both of you have high energy — go out, be social, make plans.',
};
function syncNote(a, b) { return SYNC[[a, b].sort().join('|')] || SYNC[[b, a].join('|')] || SYNC[[a, b].join('|')] || 'Different tides this week — whoever has more energy carries a little more, and you switch next week.'; }
function ptAvatar(p, cls = '') { return `<span class="pt-av ${cls}">${p.t ? `<img src="${p.t}" alt="">` : esc((p.n || '?')[0])}${cls.includes('sm') ? '' : `<i style="background:${PHASE_COLOR.dark[snapInfo(p, new Date()).phase]}"></i>`}</span>`; }
function partnersCard(info) {
  const ps = state.partners || [];
  if (!ps.length) return `${sectionTitle('Your partner')}
    <button class="card glass partner add" data-action="nav" data-to="partners"><span class="pt-av">${icon('heart', 20)}</span>
      <span class="pt-b"><b>See where your partner is</b><small>Swap links and you’ll both see each other’s cycle, mood and energy here.</small></span>${icon('chevR', 16)}</button>`;
  return `${sectionTitle(ps.length > 1 ? 'Your people' : 'Your partner', ['All', 'partners'])}
    ${ps.map(p => { const pi = snapInfo(p, new Date()), ph = PHASES[pi.phase], en = Math.round(C.energyAt(pi.cd, pi.L, pi.P) * 100);
      return `<button class="card glass partner" data-action="nav" data-to="partners/${p.id}">
        ${ptAvatar(p)}
        <span class="pt-b"><span class="eyebrow">${esc(p.n)} · day ${pi.cd} of ${pi.L}</span><b>${ph.name} · ${ph.season}</b>
          <span class="pt-meter"><b style="width:${en}%"></b></span>
          <small>${partnerStatus(pi, p)} · ${en}% energy</small>
          <small class="pt-sync">${icon('heart', 12)} ${syncNote(info.phase, pi.phase)}</small></span>${icon('chevR', 16)}</button>`; }).join('')}`;
}
// One line saying what is happening for her right now / next.
function partnerStatus(pi, p) {
  if (pi.isPeriod) return `Period · day ${pi.cd}`;
  if (pi.daysToPeriod <= 3) return `Period in ${plural(pi.daysToPeriod, 'day')}`;
  if (p.f && pi.isOvulation) return 'Egg release today';
  if (pi.cd > pi.L - 6) return `Premenstrual · period in ${plural(pi.daysToPeriod, 'day')}`;
  return `Period in ${plural(pi.daysToPeriod, 'day')}`;
}
// What she probably feels, built from her hormones, energy and where she is heading.
function partnerRead(pi, p) {
  const h = C.hormonesRel(pi.cd, pi.L, pi.P), lv = k => C.hormoneLevel(h[k]).toLowerCase(), en = C.energyAt(pi.cd, pi.L, pi.P);
  const out = [];
  out.push(`Estrogen is ${lv('estrogen')}, progesterone ${lv('progesterone')}, testosterone ${lv('testosterone')}.`);
  if (pi.isPeriod) out.push(pi.cd <= 2 ? 'The first days of bleeding are the heaviest — warmth, rest and fewer plans help most.' : 'Bleeding is easing and her energy is slowly coming back.');
  else if (pi.cd > pi.L - 4) out.push('Hormones are dropping before her period — she may feel tired, sensitive or bloated. Extra patience goes a long way.');
  else if (pi.phase === 'ovulatory') out.push('She’s at her peak — most social, confident and chatty. Great time for a date.');
  else if (pi.phase === 'follicular') out.push('Energy is rising — she’s likely up for new plans and adventures.');
  else out.push('She’s turning inward — cosy plans and calm evenings suit her best.');
  out.push(en > .75 ? 'Energy: high.' : en > .5 ? 'Energy: steady.' : 'Energy: low — help her rest.');
  return out.join(' ');
}
function viewPartners(id) {
  const ps = state.partners || [];
  if (id) { const p = ps.find(x => x.id === id); return p ? viewPartner(p) : viewMissing(); }
  return `${topbar('Partners', { back: true })}
  <div class="pad">
    <h1 class="page-h">Your <span>people</span></h1>
    ${ps.length ? ps.map(p => { const pi = snapInfo(p, new Date()), ph = PHASES[pi.phase], en = Math.round(C.energyAt(pi.cd, pi.L, pi.P) * 100);
      return `<button class="card glass partner big" data-action="nav" data-to="partners/${p.id}">${ptAvatar(p, 'lg')}
        <span class="pt-b"><span class="eyebrow">${p.a === 'friend' ? 'Friend' : 'Partner'} · day ${pi.cd} of ${pi.L}</span><b>${esc(p.n)} · ${ph.name}</b>
        <span class="pt-meter"><b style="width:${en}%"></b></span><small>${partnerStatus(pi, p)} · ${en}% energy</small></span>${icon('chevR', 16)}</button>`; }).join('')
    : `<section class="card card-light"><div class="eyebrow dark">How it works</div><h3 class="dark-h">See each other’s rhythm</h3>
        <p class="dp-text">1. Send her your link below. 2. She sends you hers from her Under the Skin app. 3. Open it and tap “Add to my app” — she appears here with her phase, hormones, energy and how to be there for her.</p></section>`}
    <button class="btn btn-light btn-block" data-action="nav" data-to="share">${icon('heart', 18)} Send my link to my partner</button>
    <p class="fine center">Only her name and cycle estimates are shared — never her symptoms, moods or notes.</p>
  </div>`;
}
function viewPartner(p) {
  const today = C.startOfDay(new Date()), pi = snapInfo(p, today), ph = PHASES[pi.phase], tcm = TCM[pi.phase];
  const S = SUPPORT[pi.phase], sup = S[p.a === 'friend' ? 'friend' : 'partner'], en = Math.round(C.energyAt(pi.cd, pi.L, pi.P) * 100);
  const mv = MOVE_GUIDE[dayWindow(pi)], rec = pick(recipesFor(pi.phase, pi), dayNum(today) + 3);
  // next 14 days for both of you; best shared day = highest combined energy
  const me = M.stats, days = [];
  for (let i = 0; i < 14; i++) {
    const d = C.addDays(today, i), hi = snapInfo(p, d), yi = C.dayInfo(d, me);
    const low = hi.isPeriod || hi.cd > hi.L - 4 || (yi && (yi.isPeriod || yi.cd > yi.L - 4));
    days.push({ d, hi, yi, score: 1.4 * C.energyAt(hi.cd, hi.L, hi.P) + (yi ? C.energyAt(Math.min(yi.cd, yi.L), yi.L, yi.P) : .5) - (low ? 1 : 0) });
  }
  const best = days.slice(1).reduce((a, b) => b.score > a.score ? b : a, days[1]);
  const strip = (who, f) => `<div class="sx-row"><span class="sx-n">${who}</span>${days.map(x => { const i = f(x); return `<i style="background:${i ? PHASE_COLOR.dark[i.phase] : 'rgba(255,255,255,.06)'}" class="${i && i.isPeriod ? 'per' : ''} ${x === best ? 'best' : ''}"></i>`; }).join('')}</div>`;
  const nextPeriod = C.addDays(today, pi.daysToPeriod), pms = C.addDays(nextPeriod, -4), egg = C.addDays(today, pi.daysToOv);
  const events = [
    pi.isPeriod ? { t: `On her period · day ${pi.cd} of ${pi.P}`, d: 'Now', on: true, at: today } : { at: nextPeriod, t: 'Next period', d: fmt(nextPeriod, { weekday: 'short', month: 'short', day: 'numeric' }), sub: `in ${plural(pi.daysToPeriod, 'day')}` },
    !pi.isPeriod && pi.cd <= pi.L - 4 ? { at: pms, t: 'PMS window starts', d: fmt(pms, { weekday: 'short', month: 'short', day: 'numeric' }), sub: 'extra gentle from here' } : null,
    p.f ? { at: egg, t: pi.isOvulation ? 'Egg release today' : 'Next egg release', d: pi.isOvulation ? 'Today' : fmt(egg, { weekday: 'short', month: 'short', day: 'numeric' }), sub: pi.fertile ? 'fertile window now' : '' } : null,
    { at: best.d, t: 'Best day together', d: fmt(best.d, { weekday: 'short', month: 'short', day: 'numeric' }), sub: 'you both have the most energy', on: true },
  ].filter(Boolean).sort((a, b) => a.at - b.at);
  const list = (arr, cls) => `<ul class="plist ${cls || ''}">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `${topbar(esc(p.n), { back: true })}
  <div class="pad">
    <div class="ptd-head">${ptAvatar(p, 'xl')}<div><div class="eyebrow">${p.a === 'friend' ? 'Friend' : 'Partner'} · ${fmt(today, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
      <h1 class="hello" style="margin:4px 0 0">${esc(p.n)} is in her<br><b>${ph.name} phase</b></h1></div></div>
    ${flowHero(pi, { eyebrow: `${ph.season} · ${tcm.stage}`, title: ph.tagline, season: `${tcm.elementGlyph} ${tcm.element} element`, id: 'pt', showOv: !!p.f, center: partnerStatus(pi, p),
      badge: p.f && pi.fertile ? `<span class="fh-badge">${icon('spark', 13)} Fertile</span>` : '',
      stats: [['Next period', pi.isPeriod ? 'Now' : `${pi.daysToPeriod} days`], ['Phase', ph.name], ['Energy', `${en}%`]] })}
    <section class="card glass ptd-read"><div class="eyebrow">Right now</div><p class="body">${partnerRead(pi, p)}</p><p class="body sm muted">${S.feel}</p></section>

    ${sectionTitle('Her hormones')}
    <section class="card glass chart-card">${cycleChart(pi, { id: 'pt', compact: true })}</section>

    ${sectionTitle('Coming up')}
    <section class="card glass ptd-ev">${events.map(e => `<div class="pe ${e.on ? 'on' : ''}"><span class="pe-d">${e.d}</span><span class="pe-t"><b>${e.t}</b>${e.sub ? `<small>${e.sub}</small>` : ''}</span></div>`).join('')}</section>

    ${sectionTitle('You two · next 14 days')}
    <section class="card glass sync-x">
      ${strip('Her', x => x.hi)}${strip('You', x => x.yi)}
      <div class="sx-days">${days.map((x, i) => `<span>${i === 0 ? '•' : fmt(x.d, { weekday: 'narrow' })}</span>`).join('')}</div>
      <p class="body sm">${icon('heart', 12)} ${syncNote(M.info ? M.info.phase : pi.phase, pi.phase)}</p>
      <div class="h-leg">${PHASE_ORDER.map(k => `<span><b style="background:${PHASE_COLOR.dark[k]}"></b>${PHASES[k].name}</span>`).join('')}<span><b class="sx-best"></b>Best day</span></div>
    </section>

    ${sectionTitle(p.a === 'friend' ? 'How to be a good friend' : 'How to show up today')}
    <section class="card glass">${list(sup.do, 'yes')}${sup.avoid ? `<div class="eyebrow mt">Maybe avoid</div>${list(sup.avoid, 'no')}` : ''}</section>
    ${sup.gifts ? `${sectionTitle('What to give her')}
    <div class="hscroll">${sup.gifts.map((g, i) => `<div class="rcard gift">${glowArt(['orb', 'drop', 'wave', 'crown', 'hill'][i % 5], 80 + i)}<div class="rc-top"><span class="rc-k">Gift idea</span></div><div class="rc-t">${esc(g)}</div></div>`).join('')}</div>` : ''}
    <div class="ptd-grid">
      <section class="card tcm-card"><div class="tcm-glyph">${tcm.elementGlyph}</div><div class="tcm-main"><div class="eyebrow">Make her a cup of</div><h3>${tcm.tea.name}</h3><p class="body sm">${tcm.tea.why}</p></div></section>
      <button class="card glass ptd-cook" data-action="nav" data-to="recipe/${rec.id}"><span class="art-ic">${icon('bowl', 20)}</span><span class="art-t">Cook for her: ${rec.name}<small>${rec.warm ? 'Warm & cooked' : rec.raw ? 'Fresh & raw' : 'For her phase'} · ${rec.time} min</small></span>${icon('chevR', 18)}</button>
      <section class="card glass"><div class="eyebrow">Her body today</div><h3 style="margin:6px 0 4px;font-weight:400">${mv.title}</h3><p class="body sm">Best for ${MOVES.filter(m => mv.r[m.k] === 3).map(m => m.n.toLowerCase()).join(', ')} — join her.</p></section>
      ${sup.date ? `<section class="card card-light"><div class="eyebrow dark">Date idea</div><h3 class="dark-h">${esc(sup.date)}</h3></section>` : sup.plan ? `<section class="card card-light"><div class="eyebrow dark">Plan idea</div><h3 class="dark-h">${esc(sup.plan)}</h3></section>` : ''}
    </div>
    <p class="fine center">Estimated from the cycle ${esc(p.n)} shared${p.added ? ` on ${fmt(new Date(p.added), { month: 'short', day: 'numeric' })}` : ''}. When her next period starts, ask her to send her link again to keep it exact — every body is different, so ask her too.</p>
    <button class="btn btn-ghost btn-block" data-action="removePartner" data-id="${p.id}">Remove ${esc(p.n)}</button>
  </div>`;
}

// ---------- seasonal foods ----------
// best seasonal dishes for today: in season, warm/raw rule, then those fitting the current phase
function seasonalDishesToday(info, n = 2) {
  const items = SZ.seasonal(myCountry(), new Date().getMonth() + 1);
  let ds = SZ.dishesFor(items);
  if (info && warmWindow(info)) ds = ds.filter(d => d.warm);
  const fit = d => info && d.used.some(i => i.ph.includes(info.phase)) ? 1 : 0;
  ds.sort((a, b) => fit(b) - fit(a) || (info && !warmWindow(info) ? (!!a.warm - !!b.warm) : 0) || b.score - a.score);
  return ds.slice(0, n);
}
function myCountry() { return state.profile.country || SZ.guessCountry(); }
function phaseFoodWords(phase) {
  const words = new Set();
  [...PHASES[phase].foods, ...TCM[phase].foods, ...NUTRITION[phase].needs.flatMap(n => n.foods)]
    .forEach(f => f.toLowerCase().split(/[\s&,()+/-]+/).forEach(w => { if (w.length > 3) words.add(w.replace(/s$/, '')); }));
  return words;
}
function seasonMatches(items, phase) {
  const words = phaseFoodWords(phase);
  return items.filter(i => i.f.toLowerCase().split(/[\s&,()]+/).some(w => w.length > 3 && words.has(w.replace(/s$/, ''))));
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function seasonCard() {
  const c = myCountry(), m = new Date().getMonth() + 1, items = SZ.seasonal(c, m), name = SZ.COUNTRIES.find(x => x[0] === c)?.[1];
  const match = M.info ? items.filter(i => i.ph.includes(M.info.phase)) : [];
  const show = [...match, ...items.filter(i => !match.includes(i))].slice(0, 7);
  return `<button class="card glass season-card" data-action="nav" data-to="season">
    <div class="sc-head"><div><div class="eyebrow">In season · ${esc(name)} · ${MONTHS[m - 1]}</div><h3>${items.length} local foods right now</h3></div>${icon('chevR', 18)}</div>
    <div class="foods">${show.map(i => `<span class="food ${match.includes(i) ? 'match' : ''}">${i.f}</span>`).join('')}</div>
    ${match.length ? `<p class="body sm" style="margin-top:10px">${icon('spark', 12)} Highlighted foods suit your ${PHASES[M.info.phase].name.toLowerCase()} phase.</p>` : ''}
  </button>`;
}
function viewSeason() {
  const c = myCountry(), m = ui.seasonMonth || new Date().getMonth() + 1, filt = ui.seasonFilter || 'all';
  const all = SZ.seasonal(c, m), items = filt === 'all' ? all : all.filter(i => i.nature === filt);
  const sn = SZ.seasonName(c, m), tcm = SZ.SEASON_TCM[sn];
  const phase = M.info ? M.info.phase : null, match = phase ? all.filter(i => i.ph.includes(phase)) : [];
  const warm = M.info && warmWindow(M.info);
  const NAT = { warm: ['Warming', 'sun'], neutral: ['Neutral', 'yinyang'], cool: ['Cooling', 'drop'] };
  const chip = i => `<button class="food sf ${match.includes(i) ? 'match' : ''} ${ui.seasonFood === i.f ? 'sel' : ''}" data-action="seasonFood" data-f="${esc(i.f)}"><i class="nat ${i.nature}"></i>${i.f}</button>`;
  const yearAll = SZ.yearTable(c);
  const sel = all.find(i => i.f === ui.seasonFood) || yearAll.find(i => i.f === ui.seasonFood);
  const selMonths = sel && (yearAll.find(i => i.f === sel.f) || {}).months || [];
  const inNow = selMonths.includes(m);
  const detail = sel ? `<section class="card card-light sf-detail">
      <div class="dp-head"><div><div class="eyebrow dark">${NAT[sel.nature][0]} in Chinese medicine</div><h3 class="dark-h">${sel.f}</h3></div>
        <button class="bn-x" data-action="seasonFood" data-f="${esc(sel.f)}" aria-label="Close">${icon('close', 16)}</button></div>
      <p class="dp-text">${icon('calendar', 13)} In season ${SZ.monthRange(selMonths)}${inNow ? ' — <b>now</b>' : ` · back in ${SZ.nextSeasonStart(selMonths, m)}`}</p>
      ${sel.nut.length ? `<div class="chips" style="margin-top:10px">${sel.nut.map(n => `<span class="chip static">${n}</span>`).join('')}</div>` : ''}
      ${sel.ph.length ? `<p class="dp-text">Best in your ${sel.ph.map(p => `<b>${PHASES[p].name.toLowerCase()}</b>`).join(' & ')} phase${sel.ph.length > 1 ? 's' : ''}.${phase && sel.ph.includes(phase) ? ' That’s your phase right now.' : ''}</p>` : ''}
      <p class="dp-text">${sel.nature === 'cool' ? (warm ? 'Cooling food — in your warm window, cook it gently or pair it with ginger and cinnamon.' : 'Cooling and fresh — lovely raw on your raw-first days.') : sel.nature === 'warm' ? 'Warming — supports circulation and is welcome all cycle, especially around your period.' : 'Neutral — balanced for every phase, raw or cooked.'}</p>
    </section>` : '';
  const group = (kind, title) => { const l = items.filter(i => i.kind === kind); return l.length ? `${sectionTitle(title)}<section class="card glass"><div class="foods">${l.map(chip).join('')}</div></section>` : ''; };
  return `${topbar('In season', { back: true })}
  <div class="pad">
    <h1 class="page-h">What’s <span>in season</span></h1>
    <p class="muted">Local, seasonal food is fresher, richer in nutrients and closest to food as nature made it. Tap a food for details.</p>
    <div class="season-ctl">
      <select class="field sm" data-input="profile.country" aria-label="Country">${SZ.COUNTRIES.map(([code, nm]) => `<option value="${code}" ${code === c ? 'selected' : ''}>${nm}</option>`).join('')}</select>
      <div class="stepper"><button data-action="seasonMonth" data-d="-1">‹</button><span class="num month">${MONTHS[m - 1].slice(0, 3)}</span><button data-action="seasonMonth" data-d="1">›</button></div>
    </div>
    <section class="card tcm-card season-tcm"><div class="tcm-glyph">${tcm.han}</div><div class="tcm-main"><div class="eyebrow">${sn} · ${tcm.el} element</div><p class="body" style="margin-top:6px">${tcm.note}</p>
      <details class="st-more"><summary>${icon('yinyang', 13)} ${sn} ritual · ${tcm.ritual.t}</summary>
        ${tcm.ritual.steps.map((x, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${x}</p></div>`).join('')}
        <div class="kv"><span>Tea</span><b>${tcm.tea}</b></div>
        <div class="kv"><span>Rhythm</span><b>${tcm.sleep}</b></div>
        <div class="kv"><span>Emotion</span><b>${tcm.emotion[0]} · watch for ${tcm.emotion[1].toLowerCase()}</b></div>
      </details></div></section>
    ${match.length ? `${sectionTitle(`Perfect for your ${PHASES[phase].name.toLowerCase()} phase`)}
      <section class="card card-light"><div class="foods">${match.map(chip).join('')}</div>
      ${warm ? `<p class="dp-text">${icon('sun', 13)} You’re in your warm window — cook these gently rather than eating them raw.</p>` : ''}</section>` : ''}
    ${detail}
    ${(() => {
      let ds = SZ.dishesFor(all);
      ds = warm ? ds.filter(d => d.warm) : [...ds.filter(d => !d.warm), ...ds.filter(d => d.warm)];
      ds = ds.slice(0, 4);
      if (!ds.length) return '';
      return `${sectionTitle('Cook with the season')}
        ${warm ? `<p class="muted" style="margin:-6px 4px 10px">${icon('yinyang', 12)} Warm window — warm, cooked dishes only.</p>` : ''}
        ${ds.map(d => { const fit = phase && d.used.some(i => i.ph.includes(phase)); return `<details class="card glass dish">
          <summary>${dishPhoto(d.name) ? `<img class="dish-thumb" src="${dishPhoto(d.name, 160)}" alt="" loading="lazy">` : ''}<span class="dish-tag ${d.warm ? 'w' : 'r'}">${d.warm ? 'Warm' : 'Raw'}</span><span class="dish-n">${d.name}${fit ? `<small>${icon('spark', 11)} Good for your ${PHASES[phase].name.toLowerCase()} phase</small>` : ''}</span>${icon('chevD', 16)}</summary>
          <div class="foods" style="margin-top:12px">${d.used.map(i => `<span class="food match">${i.f}</span>`).join('')}${d.extra.map(e => `<span class="food">${e}</span>`).join('')}</div>
          <p class="body sm">${d.how}</p>
          ${DISH_PHOTOS[d.name] ? `<img class="dish-photo" src="${dishPhoto(d.name, 700)}" alt="${esc(d.name)}" loading="lazy"><p class="fine" style="margin:6px 0 0">Photo: <a class="src" href="${DISH_PHOTOS[d.name].page}?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">${esc(DISH_PHOTOS[d.name].by)}</a> on Unsplash</p>` : ''}</details>`; }).join('')}`;
    })()}
    <div class="seg">${[['month', 'This month'], ['year', 'Whole year']].map(([k, l]) => `<button class="${(ui.seasonView || 'month') === k ? 'on' : ''}" data-action="seasonView" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="seg nat-seg">${[['all', 'All'], ['warm', 'Warming'], ['neutral', 'Neutral'], ['cool', 'Cooling']].map(([k, l]) => `<button class="${filt === k ? 'on' : ''}" data-action="seasonFilter" data-v="${k}">${k !== 'all' ? `<i class="nat ${k}"></i>` : ''}${l}</button>`).join('')}</div>
    ${(ui.seasonView || 'month') === 'year' ? (() => {
      const yt = SZ.yearTable(c).filter(i => filt === 'all' || i.nature === filt), L = 'JFMAMJJASOND';
      const block = (kind, title) => { const l = yt.filter(i => i.kind === kind); return l.length ? `${sectionTitle(title)}<section class="card glass year">
        <div class="yr-row yr-head"><span></span>${[...L].map((ch, i) => `<i class="${i + 1 === m ? 'now' : ''}">${ch}</i>`).join('')}</div>
        ${l.map(i => `<div class="yr-row ${phase && i.ph.includes(phase) ? 'fit' : ''} ${ui.seasonFood === i.f ? 'sel' : ''}" data-action="seasonFood" data-f="${esc(i.f)}"><span><i class="nat ${i.nature}"></i>${i.f}</span>${[...L].map((_, k) => `<b class="${i.months.includes(k + 1) ? 'on' : ''} ${k + 1 === m ? 'now' : ''}"></b>`).join('')}</div>`).join('')}
      </section>` : ''; };
      return block('veg', 'Vegetables') + block('fruit', 'Fruit') + block('herb', 'Fresh herbs') + block('animal', 'Fish, meat & dairy') + block('wild', 'Wild & foraged') + block('other', 'Nuts & more');
    })() : `${group('veg', 'Vegetables')}${group('fruit', 'Fruit')}${group('herb', 'Fresh herbs')}${group('animal', 'Fish, meat & dairy')}${group('wild', 'Wild & foraged')}${group('other', 'Nuts & more')}`}
    ${(() => {
      const nm = m % 12 + 1, next = SZ.seasonal(c, nm), now = all.map(i => i.f), nx = next.map(i => i.f);
      const coming = next.filter(i => !now.includes(i.f)), leaving = all.filter(i => !nx.includes(i.f));
      if (!coming.length && !leaving.length) return '';
      return `${sectionTitle(`Looking ahead to ${MONTHS[nm - 1]}`)}
        <section class="card glass ahead">
          ${coming.length ? `<div class="ah-row"><span class="ah-k">${icon('spark', 13)} Arriving</span><div class="foods">${coming.map(i => `<span class="food"><i class="nat ${i.nature}"></i>${i.f}</span>`).join('')}</div></div>` : ''}
          ${leaving.length ? `<div class="ah-row"><span class="ah-k">${icon('clock', 13)} Last chance</span><div class="foods">${leaving.map(i => `<span class="food">${i.f}</span>`).join('')}</div></div>` : ''}
        </section>`;
    })()}
    ${!items.length ? '<p class="muted center">Nothing with this nature in season this month.</p>' : ''}
    <p class="fine center">Typical regional field seasons — they shift a little by weather and area. Forage only what you can identify with certainty.</p>
  </div>`;
}

function viewInsights() {
  const { stats } = M, info = M.info;
  if (!info) return `${topbar('Insights')}<div class="pad"><p class="muted">Log a period to unlock insights.</p></div>`;
  const ph = PHASES[info.phase];
  // cycle history
  const ps = stats.periods;
  const hist = [];
  for (let i = 0; i < ps.length; i++) {
    const next = ps[i + 1];
    const len = next ? C.diffDays(next.start, ps[i].start) : null;
    hist.push({ start: ps[i].start, len, plen: ps[i].length, current: !next });
  }
  const maxLen = Math.max(35, ...hist.map(h => h.len || info.cd));
  const histRows = hist.slice(-6).reverse().map(h => {
    const L = h.len || info.cd;
    return `<div class="hrow"><div class="h-date">${fmt(h.start, { month: 'short', day: 'numeric' })}</div>
      <div class="h-track"><div class="h-bar ${h.current ? 'cur' : ''}" style="width:${L / maxLen * 100}%"><b style="width:${Math.min(h.plen, L) / L * 100}%"></b>
      ${!h.current || info.cd >= info.ov ? `<i style="left:${(C.ovulationDay(h.len || info.L, h.plen) - .5) / L * 100}%"></i>` : ''}</div></div>
      <div class="h-len">${h.current ? `<em>day ${info.cd}</em>` : `${h.len}d`}</div></div>`;
  }).join('');
  // symptom patterns
  const counts = {};
  const moodBy = {}; const energyBy = {};
  for (const k in state.logs) {
    const di = C.dayInfo(C.parseISO(k), stats); if (!di) continue;
    const l = state.logs[k];
    (l.symptoms || []).forEach(s => { counts[s] = counts[s] || { n: 0, by: {} }; counts[s].n++; counts[s].by[di.phase] = (counts[s].by[di.phase] || 0) + 1; });
    (l.moods || []).forEach(s => { moodBy[di.phase] = moodBy[di.phase] || {}; moodBy[di.phase][s] = (moodBy[di.phase][s] || 0) + 1; });
    if (l.energy) { energyBy[di.phase] = energyBy[di.phase] || []; energyBy[di.phase].push(l.energy); }
  }
  const top = Object.entries(counts).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  const topMax = top.length ? top[0][1].n : 1;
  const symRows = top.map(([s, v]) => {
    const p = Object.entries(v.by).sort((a, b) => b[1] - a[1])[0][0];
    return `<div class="sym"><span class="sym-n">${s}</span><span class="sym-bar"><b style="width:${v.n / topMax * 100}%;background:${PHASE_COLOR.dark[p]}"></b></span><span class="sym-p">${PHASES[p].name}</span></div>`;
  }).join('');
  const phaseRows = PHASE_ORDER.map(p => {
    const e = energyBy[p], avg = e ? e.reduce((a, b) => a + b, 0) / e.length : 0;
    const mood = moodBy[p] ? Object.entries(moodBy[p]).sort((a, b) => b[1] - a[1])[0][0] : '—';
    return `<div class="pp"><span class="pp-dot" style="background:${PHASE_COLOR.dark[p]}"></span><span class="pp-n">${PHASES[p].name}</span>
      <span class="pp-e">${[1, 2, 3, 4, 5].map(n => `<i class="${avg >= n - 0.5 ? 'on' : ''}"></i>`).join('')}</span><span class="pp-m">${mood}</span></div>`;
  }).join('');

  const tab = ui.insTab || 'cycle';
  const tabs = [['cycle', 'Cycle'], ['patterns', 'Patterns'], ['learn', 'Learn']];
  let body = '';
  if (tab === 'cycle') body = `
    <section class="card glass big-chart">${cycleChart(info, { id: 'ins' })}</section>
    <p class="muted center" style="margin:-4px 0 12px">Drag across the chart to explore any day.</p>
    ${fullCycleGuide(info)}
    ${cycleFlag()}
    <section class="card card-light where">
      <div class="eyebrow dark">Where you are</div>
      <h3 class="dark-h">Day ${info.cd} of ${info.L} · ${ph.name}</h3>
      <div class="prog"><div class="prog-track">${C.phaseRanges(info.L, info.P).map(r => `<span style="flex:${r.to - r.from + 1};background:${PHASE_COLOR.light[r.key]}"></span>`).join('')}</div>
        <i style="left:${(Math.min(info.cd, info.L) - .5) / info.L * 100}%"></i></div>
      <p class="dp-text">${ph.hormones}</p>
    </section>
    <div class="stats">
      <div class="card glass stat"><div class="dotnum xl">${stats.avgCycle}</div><div class="stat-k">Avg cycle<br>days</div></div>
      <div class="card glass stat"><div class="dotnum xl">${stats.avgPeriod}</div><div class="stat-k">Avg period<br>days</div></div>
      <div class="card glass stat"><div class="dotnum xl">${stats.lengths.length}</div><div class="stat-k">Cycles<br>tracked</div></div>
      <div class="card glass stat"><div class="dotnum xl">±${stats.variation}</div><div class="stat-k">Cycle<br>variation</div></div>
    </div>
    ${sectionTitle('Cycle history')}
    <section class="card glass">${histRows}<div class="h-leg"><span><b class="p"></b>Period</span><span><b class="o"></b>Ovulation (est.)</span></div></section>`;
  else if (tab === 'patterns') body = `
    ${patternsSection()}
    ${sectionTitle('By phase')}
    <section class="card glass"><div class="pp head"><span></span><span class="pp-n">Phase</span><span class="pp-e">Energy</span><span class="pp-m">Top mood</span></div>${phaseRows}</section>
    ${sectionTitle('Most logged symptoms')}
    <section class="card glass">${symRows || '<p class="muted" style="margin:0">Log symptoms to see which phase they cluster in.</p>'}</section>`;
  else body = `
    <button class="card gro-cta" data-action="nav" data-to="relief"><span class="art-ic">${icon('heart', 20)}</span><span class="art-t">Relief guide<small>Cramps, PMS, sleep, skin & more</small></span>${icon('chevR', 18)}</button>
    <button class="card gro-cta" data-action="nav" data-to="habits"><span class="art-ic">${icon('check', 20)}</span><span class="art-t">Hormone habits<small>Daily checklist for hormones & fertility</small></span>${icon('chevR', 18)}</button>
    <button class="card gro-cta" data-action="nav" data-to="hormones"><span class="art-ic">${icon('chart', 20)}</span><span class="art-t">Your hormones, explained<small>All 14 hormones — what they do & how to support them</small></span>${icon('chevR', 18)}</button>
    <button class="card gro-cta" data-action="nav" data-to="move"><span class="art-ic">${icon('leaf', 20)}</span><span class="art-t">Move with your cycle<small>When to lift heavy, sprint, do yoga or meditate</small></span>${icon('chevR', 18)}</button>
    ${PHASE_ORDER.concat([null]).map(p => { const list = ARTICLES.filter(a => a.phase === p); return list.length ? `${sectionTitle(p ? PHASES[p].name + (p === info.phase ? ' · now' : '') : 'Foundations')}
      ${list.map(a => `<button class="card glass article-row" data-action="nav" data-to="article/${a.id}"><span class="art-ic">${icon('book', 20)}</span><span class="art-t">${a.title}<small>${a.mins} min read</small></span>${icon('chevR', 18)}</button>`).join('')}` : ''; }).join('')}`;
  return `${topbar('Insights')}
  <div class="pad">
    <h1 class="page-h">Your <span>hormone cycle</span></h1>
    <div class="seg">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="insTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

function viewRecipe(id) {
  const r = RECIPES.find(x => x.id === id); if (!r) return viewMissing();
  const fav = (state.favorites || []).includes(id);
  return `${topbar('Recipe', { back: true })}
  <div class="pad">
    <section class="detail-hero ${photoUrl(r.id) ? 'has-photo' : ''}">${photoUrl(r.id) ? `<img class="dh-photo" src="${photoUrl(r.id, 1000)}" alt="${esc(r.name)}"><span class="dh-shade"></span>` : glowArt('orb', 90)}<div class="dh-in"><div class="eyebrow">${r.meal} · ${r.phases.map(p => PHASES[p].name).join(' & ')}</div><h1>${r.name}</h1>
      <div class="dh-meta"><span>${icon('clock', 15)} ${r.time} min</span><span>${icon('bolt', 15)} ${r.kcal} kcal</span></div></div>
      <button class="fav ${fav ? 'on' : ''}" data-action="fav" data-id="${id}">${icon('heart', 20)}</button></section>
    <div class="chips">${r.warm ? `<span class="chip static warm">${icon('sun', 13)} Warm</span>` : r.raw ? `<span class="chip static">${icon('leaf', 13)} Raw</span>` : ''}${r.nutrients.map(n => `<span class="chip static">${n}</span>`).join('')}</div>
    ${r.raw && warmWindow(M.info) ? `<p class="fine" style="margin:10px 2px 0">${icon('yinyang', 12)} Raw/cold — Chinese medicine says save it for after your period.</p>` : ''}
    ${sectionTitle('Ingredients')}
    <section class="card glass">${r.ingredients.map((g, i) => { const k = id + i; return `<button class="check-row ${ui.checked[k] ? 'on' : ''}" data-action="check" data-k="${k}"><span class="cb">${icon('check', 14, 2.2)}</span>${g}</button>`; }).join('')}</section>
    ${sectionTitle('Method')}
    <section class="card glass">${r.steps.map((s, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${s}</p></div>`).join('')}</section>
    ${r.source ? `<p class="fine center">Adapted from <a class="src" href="${r.url}" target="_blank" rel="noopener">${r.source}</a></p>` : ''}
    ${RECIPE_PHOTOS[r.id] ? `<p class="fine center">Photo: <a class="src" href="${RECIPE_PHOTOS[r.id].page}?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">${esc(RECIPE_PHOTOS[r.id].by)}</a> on <a class="src" href="https://unsplash.com/?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></p>` : ''}
  </div>`;
}
function viewRitual(id) {
  const r = RITUALS.find(x => x.id === id); if (!r) return viewMissing();
  return `${topbar('Ritual', { back: true })}
  <div class="pad">
    <section class="detail-hero">${glowArt('crown', 91)}<span class="dh-glyph">${r.glyph}</span><div class="dh-in"><div class="eyebrow">${r.phases.map(p => PHASES[p].name).join(' · ')}</div><h1>${r.name}</h1>
      <div class="dh-meta"><span>${icon('clock', 15)} ${r.mins} min</span><span>${icon('yinyang', 15)} TCM ritual</span></div></div></section>
    <section class="card card-light"><div class="eyebrow dark">Why it helps</div><p class="dp-text">${r.why}</p></section>
    ${sectionTitle('Steps')}
    <section class="card glass">${r.steps.map((s, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${s}</p></div>`).join('')}</section>
    <button class="btn btn-light btn-block" data-action="timer" data-title="${esc(r.name)}" data-secs="${r.mins * 60}">${icon('play', 16)} Start ${r.mins}-minute timer</button>
  </div>`;
}
function viewPoint(phase) {
  const t = TCM[phase]; if (!t) return viewMissing();
  const p = t.point;
  return `${topbar('Acupressure', { back: true })}
  <div class="pad">
    <section class="detail-hero point-hero">
      <svg viewBox="0 0 200 140" class="foot"><path d="M60 20 C 40 40, 38 90, 50 120 C 58 135, 95 135, 105 120 C 120 95, 112 60, 100 35 C 92 18, 72 10, 60 20 Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
        <circle cx="${phase === 'luteal' ? 92 : phase === 'ovulatory' ? 78 : phase === 'follicular' ? 58 : 54}" cy="${phase === 'luteal' ? 40 : phase === 'ovulatory' ? 70 : phase === 'follicular' ? 108 : 92}" r="7" fill="#d4ef9a" class="pulse-pt"/></svg>
      <div class="dh-in"><div class="eyebrow">${t.stage} · ${t.organ}</div><h1>${p.code} · ${p.name}</h1></div></section>
    <section class="card card-light"><div class="eyebrow dark">Where</div><p class="dp-text">${p.where}</p><div class="eyebrow dark mt">What it does</div><p class="dp-text">${p.does}</p></section>
    <section class="card glass"><div class="step"><span class="step-n">1</span><p>Find the point — it often feels slightly tender.</p></div>
      <div class="step"><span class="step-n">2</span><p>Press firmly with your thumb, making slow small circles.</p></div>
      <div class="step"><span class="step-n">3</span><p>Breathe slowly into your belly. Repeat on the other side.</p></div></section>
    <button class="btn btn-light btn-block" data-action="timer" data-title="${p.code} · ${p.name}" data-secs="${p.secs}">${icon('play', 16)} Press for ${p.secs} seconds</button>
    <p class="fine center">Avoid strong pressure on SP6 and CV4 if you might be pregnant.</p>
  </div>`;
}
function viewArticle(id) {
  const a = ARTICLES.find(x => x.id === id); if (!a) return viewMissing();
  return `${topbar('Learn', { back: true })}
  <div class="pad article">
    <div class="eyebrow">${a.phase ? PHASES[a.phase].name + ' phase · ' : ''}${a.mins} min read</div>
    <h1>${a.title}</h1>${a.body.map(p => `<p>${p}</p>`).join('')}
  </div>`;
}
function avatarInner(p) { return p.photo ? `<img src="${p.photo}" alt="">` : esc((p.name || 'R')[0].toUpperCase()); }
// Downscale a chosen photo to a 320px square JPEG data URL so it fits comfortably in local storage.
function readPhoto(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const S = 320, c = document.createElement('canvas'); c.width = c.height = S;
      const m = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      const t = document.createElement('canvas'); t.width = t.height = 56; t.getContext('2d').drawImage(c, 0, 0, 56, 56);
      URL.revokeObjectURL(url); res({ full: c.toDataURL('image/jpeg', 0.82), thumb: t.toDataURL('image/jpeg', 0.6) });
    };
    img.onerror = rej; img.src = url;
  });
}
document.addEventListener('change', e => {
  const t = e.target, scope = t.dataset?.photo, f = t.files?.[0]; if (!scope || !f) return;
  readPhoto(f).then(d => {
    if (scope === 'onb') { ui.onb.photo = d.full; ui.onb.thumb = d.thumb; } else { state.profile.photo = d.full; state.profile.thumb = d.thumb; save(); toast('Profile picture saved'); }
    render();
  }).catch(() => toast('Couldn’t read that photo'));
});
function viewProfile() {
  const p = state.profile, s = M.stats;
  return `${topbar('Profile', { back: true })}
  <div class="pad">
    <div class="profile-head"><label class="avatar xl ${p.photo ? 'has-photo' : ''}">${avatarInner(p)}<span class="av-edit">${icon('plus', 14, 2.4)}</span><input type="file" accept="image/*" data-photo="profile" hidden></label>
      <input class="field name-field" data-input="profile.name" value="${esc(p.name)}" placeholder="Your name" maxlength="24"></div>
    ${sectionTitle('Birthday')}
    <section class="card glass"><input class="field" type="date" data-input="profile.birthday" value="${p.birthday || ''}" max="${todayISO()}"><button class="list-btn" data-action="nav" data-to="cosmic">${icon('star', 18)} See my cosmic rhythm</button></section>
    ${sectionTitle('Country')}
    <section class="card glass"><select class="field sm" data-input="profile.country">${SZ.COUNTRIES.map(([code, nm]) => `<option value="${code}" ${code === myCountry() ? 'selected' : ''}>${nm}</option>`).join('')}</select>
      <p class="fine" style="margin:8px 0 0">Used for seasonal foods.</p></section>
    ${sectionTitle('Cycle')}
    <section class="card glass">
      <div class="stepper-row"><span>Default cycle length<small>Used until you've logged 2+ periods · now ${s.avgCycle}d</small></span>${stepper('cycleLength', p.cycleLength, 'profile')}</div>
      <div class="stepper-row"><span>Default period length<small>Now ${s.avgPeriod}d</small></span>${stepper('periodLength', p.periodLength, 'profile')}</div>
    </section>
    ${sectionTitle('Focus')}
    <section class="card glass"><div class="chips">${GOALS.map(g => `<button class="chip ${(p.goals || []).includes(g) ? 'on' : ''}" data-action="profileGoal" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div></section>
    ${remindersSection()}
    ${sectionTitle('Partner mode')}
    <section class="card glass"><button class="list-btn" data-action="nav" data-to="share">${icon('heart', 18)} Share my cycle with partner & friends</button>
      <button class="list-btn" data-action="nav" data-to="partners">${icon('chart', 18)} See my partners' dashboard</button>
      ${(state.partners || []).map(x => `<div class="list-btn">${ptAvatar(x, 'sm')}<span style="flex:1">${esc(x.n)}<small class="muted" style="display:block;font-size:12px">On your dashboard</small></span><button class="link muted-l" data-action="removePartner" data-id="${x.id}">Remove</button></div>`).join('')}</section>
    ${sectionTitle('Your data')}
    <section class="card glass">
      <button class="list-btn" data-action="export">${icon('download', 18)} Export my data (JSON)</button>
      <button class="list-btn" data-action="demo">${icon('spark', 18)} Load sample cycles</button>
      <button class="list-btn" data-action="nav" data-to="privacy">${icon('heart', 18)} Privacy — your data stays on your phone</button>
      <button class="list-btn danger" data-action="reset">${icon('trash', 18)} Delete all data</button>
    </section>
    <p class="fine">Everything is stored privately on this device. Under the Skin gives wellbeing estimates based on your logs and on Traditional Chinese Medicine concepts; it is not medical advice and must not be used as contraception.</p>
  </div>`;
}

// ---------- partner mode ----------
function b64e(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64d(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch { return null; } }
function shareLink() {
  const { stats } = M, last = stats.periods[stats.periods.length - 1];
  const snap = { n: state.profile.name || 'Her', s: C.iso(last.start), c: stats.avgCycle, p: stats.avgPeriod, a: ui.shareAudience, f: ui.shareFertile ? 1 : 0 };
  if (state.profile.thumb) snap.t = state.profile.thumb;
  return `${location.origin}${location.pathname}#/with?d=${b64e(snap)}`;
}
// Cycle info rebuilt from a shared snapshot (projected forward cycle by cycle).
function snapInfo(snap, date) {
  const L = snap.c, P = snap.p, d = C.startOfDay(date), s = C.parseISO(snap.s);
  const diff = Math.max(0, C.diffDays(d, s)), k = Math.floor(diff / L);
  const start = C.addDays(s, k * L), cd = diff - k * L + 1, ov = C.ovulationDay(L, P);
  return {
    cd, L, P, ov, phase: C.phaseFor(cd, L, P), cycleStart: start, nextStart: C.addDays(start, L),
    isPeriod: cd <= P, periodActual: cd <= P, isOvulation: cd === ov, fertile: cd >= ov - 5 && cd <= ov + 1,
    daysToPeriod: L - cd + 1, daysToOv: cd < ov ? ov - cd : cd === ov ? 0 : (L - cd) + ov, late: 0, dueToday: false,
  };
}
function viewShare() {
  if (!M.info) return `${topbar('Partner mode', { back: true })}<div class="pad"><p class="muted">Log a period first so there is something to share.</p></div>`;
  const aud = ui.shareAudience, sup = SUPPORT[M.info.phase][aud];
  return `${topbar('Partner mode', { back: true })}
  <div class="pad">
    <h1 class="page-h">Share your <span>rhythm</span></h1>
    <p class="muted">Send a private link. They'll see your phase, how you might feel and how to show up for you — and it updates every day on its own. If your partner uses Under the Skin too, she can add you with one tap and you'll both see each other's cycle.</p>
    <div class="seg">${[['partner', 'Partner'], ['friend', 'Friends']].map(([k, l]) => `<button class="${aud === k ? 'on' : ''}" data-action="shareAud" data-v="${k}">${l}</button>`).join('')}</div>
    <section class="card card-light">
      <div class="eyebrow dark">They will see today</div>
      <h3 class="dark-h">${esc(state.profile.name || 'You')} · ${PHASES[M.info.phase].name}</h3>
      <p class="dp-text">${SUPPORT[M.info.phase].feel}</p>
      <div class="chips mt">${sup.do.slice(0, 3).map(x => `<span class="chip static">${esc(x)}</span>`).join('')}</div>
    </section>
    <section class="card glass">
      <div class="stepper-row"><span>Share period dates<small>Next period countdown</small></span><span class="toggle on locked"><i></i></span></div>
      <div class="stepper-row"><span>Share fertile window<small>Off by default</small></span><button class="toggle ${ui.shareFertile ? 'on' : ''}" data-action="shareFertile"><i></i></button></div>
      <div class="stepper-row"><span>Symptoms, moods & notes<small>Always private</small></span><span class="toggle locked"><i></i></span></div>
    </section>
    <button class="btn btn-light btn-block" data-action="shareSend">${icon('heart', 18)} Share link with ${aud === 'partner' ? 'my partner' : 'friends'}</button>
    <button class="btn btn-ghost btn-block" data-action="sharePreview">Preview what they'll see</button>
    <p class="fine center">The link holds your name and cycle estimates only. Anyone with the link can view it — share it with people you trust.</p>
  </div>`;
}
function viewWith(q) {
  const snap = b64d(q.get('d') || '');
  if (!snap || !snap.s || !snap.c) return `<div class="pad"><h1 class="page-h" style="margin-top:80px">Link not valid</h1><p class="muted">Ask her to send it again.</p></div>`;
  const today = C.startOfDay(new Date()), info = snapInfo(snap, today), ph = PHASES[info.phase], tcm = TCM[info.phase];
  const S = SUPPORT[info.phase], role = snap.a === 'friend' ? 'friend' : 'partner', sup = S[role];
  const name = esc(snap.n);
  let week = '';
  for (let i = 0; i < 7; i++) {
    const d = C.addDays(today, i), di = snapInfo(snap, d);
    week += `<div class="pw"><span class="pw-d">${i === 0 ? 'Today' : fmt(d, { weekday: 'short' })}</span><i style="background:${PHASE_COLOR.dark[di.phase]}"></i><span class="pw-p">${PHASES[di.phase].name.slice(0, 3)}</span>${di.isPeriod ? icon('drop', 12) : ''}</div>`;
  }
  const list = (arr, cls) => `<ul class="plist ${cls || ''}">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const chips = [`<span class="hchip">${icon('drop', 14)} ${info.isPeriod ? 'On her period' : `Period in ${plural(info.daysToPeriod, 'day')}`}</span>`];
  if (snap.f) chips.push(`<span class="hchip ${info.fertile ? 'hl' : ''}">${icon('spark', 14)} ${info.fertile ? 'Fertile window' : 'Low fertility'}</span>`);
  return `<header class="topbar"><span class="tb-spacer"></span><div class="topbar-title">${name}’s rhythm</div><span style="width:40px"></span></header>
  <div class="pad">
    <div class="eyebrow">${role === 'partner' ? 'Partner view' : 'Friend view'} · ${fmt(today, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
    <h1 class="hello" style="margin:6px 0 16px">${name} is in her<br><b>${ph.name} phase</b></h1>
    ${flowHero(info, { eyebrow: ph.season, title: ph.tagline, season: `${tcm.elementGlyph} ${tcm.element} element`, id: 'with', showOv: !!snap.f,
      center: info.isPeriod ? 'On her period' : `Period in ${plural(info.daysToPeriod, 'day')}`,
      badge: snap.f && info.fertile ? `<span class="fh-badge">${icon('spark', 13)} Fertile</span>` : '',
      stats: [['Next period', info.isPeriod ? 'Now' : `${info.daysToPeriod} days`], ['Phase', ph.name], ['Energy', `${Math.round(C.energyAt(info.cd, info.L, info.P) * 100)}%`]] })}
    ${(() => { const g = DAY_GUIDE[dayWindow(info)], rec = pick(recipesFor(info.phase, info), dayNum(today)); return `
    <section class="card glass pv-day">
      <div class="pv-top"><div><div class="eyebrow">Her day · ${g.energy.toLowerCase()} energy</div><h3>${g.title}</h3></div><span class="pv-e">${g.energy}</span></div>
      <p class="body sm">Today is best for ${g.best.slice(0, 3).join(', ').toLowerCase()}.</p>
    </section>
    <details class="card glass pv-cook"><summary><span class="art-ic">${icon('bowl', 20)}</span><span class="art-t">Cook for her: ${rec.name}<small>${rec.warm ? 'Warm & cooked — just right for this phase' : rec.raw ? 'Fresh & raw — perfect for her phase' : 'Made for her phase'} · ${rec.time} min</small></span>${icon('chevD', 18)}</summary>
      <div class="pv-rec"><div class="eyebrow">Ingredients</div>${rec.ingredients.map(g => `<div class="ing">${icon('leaf', 14)}<span>${g}</span></div>`).join('')}
      <div class="eyebrow mt">Method</div>${rec.steps.map((x, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${x}</p></div>`).join('')}</div></details>`; })()}
    ${sectionTitle('How she may feel')}
    <section class="card glass"><p class="body" style="margin:0">${S.feel}</p></section>
    ${sectionTitle(role === 'partner' ? 'How to show up' : 'How to be a good friend')}
    <section class="card glass">${list(sup.do, 'yes')}</section>
    ${role === 'partner' ? `${sectionTitle('What to give her')}
    <div class="hscroll">${sup.gifts.map((g, i) => `<div class="rcard gift">${glowArt(['orb', 'drop', 'wave', 'crown', 'hill'][i % 5], 60 + i)}<div class="rc-top"><span class="rc-k">Gift idea</span></div><div class="rc-t">${esc(g)}</div></div>`).join('')}</div>
    ${sectionTitle('Maybe avoid')}<section class="card glass">${list(sup.avoid, 'no')}</section>
    <section class="card tcm-card"><div class="tcm-glyph">${tcm.elementGlyph}</div><div class="tcm-main"><div class="eyebrow">Make her a cup of</div><h3>${tcm.tea.name}</h3><p class="body sm">${tcm.tea.why}</p></div></section>
    <section class="card card-light"><div class="eyebrow dark">Date idea</div><h3 class="dark-h">${esc(sup.date)}</h3></section>`
    : `<section class="card card-light"><div class="eyebrow dark">Plan idea</div><h3 class="dark-h">${esc(sup.plan)}</h3></section>`}
    ${sectionTitle('Her week ahead')}
    <section class="card glass"><div class="pweek">${week}</div></section>
    <p class="fine center">Estimates based on her cycle — every body is different, so ask her too.</p>
    ${state && state.onboarded
      ? ((state.partners || []).some(x => x.n === snap.n && x.s === snap.s)
        ? `<a class="btn btn-ghost btn-block" href="#/today">${icon('check', 16)} ${name} is on your dashboard</a>`
        : `<button class="btn btn-light btn-block" data-action="addPartner" data-d="${esc(q.get('d'))}">${icon('heart', 16)} Add ${name} to my app</button>
           <p class="fine center">You both use Under the Skin — add her and you’ll see each other’s cycle side by side.</p>`)
      : `<a class="btn btn-ghost btn-block" href="#/today">Get Under the Skin for yourself</a>`}
  </div>`;
}

function viewPrivacy() {
  return `${topbar('Privacy', { back: true })}
  <div class="pad article">
    <div class="eyebrow">Under the Skin</div>
    <h1>Your data stays with you</h1>
    <p><b>Everything you log stays on your own phone.</b> Your cycle, symptoms, moods, notes, habits and birthday are stored only in this app on your device. There is no account, no server and no cloud — we never see, collect or sell your data.</p>
    <p><b>No tracking.</b> No analytics, no advertising, no cookies for tracking.</p>
    <p><b>Partner links.</b> When you share your cycle, the link contains only your first name and cycle estimates (last period start, average cycle and period length). Symptoms, moods and notes are never included. Anyone with the link can view it, so share it only with people you trust.</p>
    <p><b>Images and fonts.</b> Recipe photos load from Unsplash and fonts from Google Fonts; the 3D graphics library loads from jsDelivr. These services receive standard web requests (like your IP address) but none of your health data.</p>
    <p><b>Delete anytime.</b> Profile → “Delete all data” erases everything from this device. Deleting the app or clearing your browser data does the same — so export a backup first if you want to keep it.</p>
    <p><b>Not medical advice.</b> Predictions are estimates based on your logs and traditional knowledge. Under the Skin is not a contraceptive and does not diagnose or treat any condition.</p>
  </div>`;
}

function viewMissing() { return `${topbar('Not found', { back: true })}<div class="pad"><p class="muted">That page doesn't exist.</p></div>`; }

// ---------- overlay timer ----------
let tick = null;
function renderOverlay() {
  const t = ui.timer;
  if (!t) { $overlay.innerHTML = ''; $overlay.className = ''; return; }
  const mm = Math.floor(t.remaining / 60), ss = String(t.remaining % 60).padStart(2, '0');
  const pct = 1 - t.remaining / t.secs, R = 120, Ccirc = 2 * Math.PI * R;
  $overlay.className = 'show';
  $overlay.innerHTML = `<div class="timer">
    <button class="icon-btn dark tm-close" data-action="timerClose">${icon('close', 22)}</button>
    <div class="eyebrow">${t.done ? 'Complete' : 'Breathe slowly'}</div><h2>${esc(t.title)}</h2>
    <div class="tm-ring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="${R}" stroke="rgba(255,255,255,.08)" stroke-width="10" fill="none"/>
      <circle cx="140" cy="140" r="${R}" stroke="#d4ef9a" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${Ccirc}" stroke-dashoffset="${Ccirc * (1 - pct)}" transform="rotate(-90 140 140)" style="transition:stroke-dashoffset 1s linear"/></svg>
      <div class="tm-breath ${t.running ? 'run' : ''}"></div>
      <div class="tm-num dotnum">${t.done ? icon('check', 56, 2) : `${mm}:${ss}`}</div></div>
    ${t.done ? `<button class="btn btn-light" data-action="timerClose">Done</button>` : `<button class="round-btn" data-action="timerToggle">${icon(t.running ? 'pause' : 'play', 26, 2.2)}</button>`}
  </div>`;
}
function startTick() {
  clearInterval(tick);
  tick = setInterval(() => {
    const t = ui.timer; if (!t) { clearInterval(tick); return; }
    if (!t.running || t.done) return;
    t.remaining--;
    if (t.remaining <= 0) { t.remaining = 0; t.done = true; t.running = false; navigator.vibrate?.(200); }
    renderOverlay();
  }, 1000);
}

// ---------- demo data ----------
function rng(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function demoState(name) {
  const today = C.startOfDay(new Date()), r = rng(7);
  const lens = [29, 27, 28, 30, 28];
  const starts = [C.addDays(today, -11)];
  for (let i = lens.length - 1; i >= 0; i--) starts.unshift(C.addDays(starts[0], -lens[i]));
  const logs = {};
  const flows = ['medium', 'heavy', 'medium', 'light', 'light'];
  starts.forEach((s, ci) => {
    const L = lens[ci] || 28;
    for (let d = 1; d <= L; d++) {
      const day = C.addDays(s, d - 1); if (day > today) break;
      const k = C.iso(day), ph = C.phaseFor(d, 28, 5), l = {};
      if (d <= 5 && !(d === 5 && ci % 2)) l.flow = flows[d - 1];
      if (r() < 0.62) {
        const sym = { menstrual: ['Cramps', 'Fatigue', 'Back pain'], follicular: ['Headache'], ovulatory: ['Bloating'], luteal: ['Bloating', 'Cravings', 'Tender breasts', 'Acne', 'Insomnia'] }[ph];
        const mood = { menstrual: ['Calm', 'Sensitive', 'Unmotivated'], follicular: ['Happy', 'Energetic', 'Calm'], ovulatory: ['Confident', 'Social', 'Energetic'], luteal: ['Irritable', 'Anxious', 'Calm', 'Sensitive'] }[ph];
        if (r() < 0.6) l.symptoms = [sym[Math.floor(r() * sym.length)]];
        l.moods = [mood[Math.floor(r() * mood.length)]];
        l.energy = Math.max(1, Math.min(5, Math.round({ menstrual: 2, follicular: 4, ovulatory: 5, luteal: 3 }[ph] + (r() - 0.5) * 1.6)));
        l.sleep = Math.round((6.5 + r() * 2) * 2) / 2;
      }
      if (Object.keys(l).length) logs[k] = l;
    }
  });
  return { onboarded: true, profile: { name: name || 'Elle', cycleLength: 28, periodLength: 5, goals: ['Understand my hormones', 'Ease PMS'] }, logs, favorites: [] };
}

// ---------- actions ----------
const actions = {
  nav: d => go(d.to),
  back: () => (history.length > 1 ? history.back() : go('today')),
  selectDay: d => { ui.selected = d.date; render(); },
  onbEnter: d => {
    const w = welcome3d, el = document.querySelector('.onb-welcome');
    if (el?.classList.contains('entering')) return;
    if (!w || !el) return actions.onbNext(d);
    el.classList.add('entering');
    import('./sfx.js').then(S => S.whoosh({ dur: 1.3, vol: 0.6, from: 400, to: 5200, boom: true })).catch(() => {});
    w.enter().then(() => actions.onbNext(d));
  },
  onbNext: () => {
    if (ui.onbStep < 6) { ui.onbStep++; render(); return; }
    const o = ui.onb, logs = {}, s = C.parseISO(o.last);
    for (let i = 0; i < o.periodLength; i++) { const d = C.addDays(s, i); if (d <= new Date()) logs[C.iso(d)] = { flow: i === 0 || i === 1 ? 'medium' : 'light' }; }
    ui.arrive = true;
    state = { onboarded: true, profile: { name: o.name.trim(), cycleLength: o.cycleLength, periodLength: o.periodLength, goals: o.goals, birthday: o.birthday || undefined, photo: o.photo || undefined, thumb: o.thumb || undefined }, logs, favorites: [] };
    save(); go('today'); render();
  },
  onbBack: () => { ui.onbStep = Math.max(0, ui.onbStep - 1); render(); },
  onbGoal: d => { const g = ui.onb.goals; const i = g.indexOf(d.v); i < 0 ? g.push(d.v) : g.splice(i, 1); render(); },
  onbDemo: () => { state = demoState(ui.onb.name.trim()); save(); go('today'); render(); },
  step: d => {
    const lim = { cycleLength: [20, 45], periodLength: [2, 10], periodDays: [1, 7] }[d.field];
    const tgt = d.scope === 'onb' ? ui.onb : d.scope === 'rem' ? rem() : state.profile;
    tgt[d.field] = Math.max(lim[0], Math.min(lim[1], tgt[d.field] + +d.d));
    if (d.scope !== 'onb') save();
    render();
  },
  calMove: d => {
    const m = ui.calMonth ? C.parseISO(ui.calMonth) : new Date();
    ui.calMonth = C.iso(new Date(m.getFullYear(), m.getMonth() + +d.d, 1)); render();
  },
  calSelect: d => { ui.calSelected = d.date; render(); },
  togglePeriod: () => {
    const k = ui.calSelected, l = getLog(k);
    setLog(k, { flow: PERIOD_FLOWS.includes(l.flow) ? null : 'medium' });
    toast(PERIOD_FLOWS.includes(getLog(k).flow) ? 'Period day added' : 'Period day removed'); render();
  },
  logDay: d => { ui.logDate = d.date; go('log'); },
  logMove: d => {
    const n = C.addDays(C.parseISO(ui.logDate || todayISO()), +d.d);
    if (n > new Date()) return;
    ui.logDate = C.iso(n); render();
  },
  logSet: d => {
    const k = ui.logDate || todayISO(), l = getLog(k);
    let v = d.field === 'energy' ? +d.v : d.v;
    if (d.multi) { const a = [...(l[d.field] || [])]; const i = a.indexOf(v); i < 0 ? a.push(v) : a.splice(i, 1); v = a; }
    else if (l[d.field] === v) v = null;
    setLog(k, { [d.field]: v }); render();
  },
  logSleep: d => {
    const k = ui.logDate || todayISO(), cur = getLog(k).sleep ?? 7.5;
    setLog(k, { sleep: Math.max(0, Math.min(14, (getLog(k).sleep == null ? 7.5 : cur + +d.d))) }); render();
  },
  planTab: d => { ui.planTab = d.v; if (route().name !== 'plan') go('plan'); else render(); },
  toggleHormone: d => { ui.hidden[d.h] = !ui.hidden[d.h]; render(); },
  fav: d => { const f = state.favorites = state.favorites || []; const i = f.indexOf(d.id); i < 0 ? f.push(d.id) : f.splice(i, 1); save(); render(); },
  check: d => { ui.checked[d.k] = !ui.checked[d.k]; render(); },
  timer: d => { ui.timer = { title: d.title, secs: +d.secs, remaining: +d.secs, running: true, done: false }; renderOverlay(); startTick(); },
  timerToggle: () => { ui.timer.running = !ui.timer.running; renderOverlay(); },
  timerClose: () => { ui.timer = null; clearInterval(tick); renderOverlay(); },
  dismissRem: d => { rem().dismissed[d.id] = todayISO(); save(); render(); },
  remToggle: d => { const r = rem(); r[d.k] = !r[d.k]; save(); render(); },
  remHour: d => { const r = rem(); r.checkinHour = (r.checkinHour + +d.d + 24) % 24; save(); render(); },
  remPermission: async () => { try { await Notification.requestPermission(); } catch { /* unsupported */ } render(); fireNotifications(); },
  flagDismiss: d => { state.flagDismissed = d.k; save(); render(); },
  flagEdit: d => { ui.calSelected = d.date; const x = C.parseISO(d.date); ui.calMonth = C.iso(new Date(x.getFullYear(), x.getMonth(), 1)); go('calendar'); },
  lemonStart: () => { state.lemon = { start: todayISO(), done: {} }; save(); toast('Your 28 days begin'); render(); },
  lemonTick: () => { const L = state.lemon; if (!L) return; L.done = L.done || {}; const k = todayISO(); L.done[k] ? delete L.done[k] : (L.done[k] = 1); save(); render(); },
  focusTick: d => { const k = todayISO(), f = state.focusDone = state.focusDone || {}; const a = f[k] = f[k] || []; const i = +d.i; a.includes(i) ? a.splice(a.indexOf(i), 1) : a.push(i); for (const x in f) if (x !== k) delete f[x]; save(); render(); },
  habitTick: d => { const k = todayISO(), H = state.habits = state.habits || {}; const a = H[k] = H[k] || []; a.includes(d.id) ? a.splice(a.indexOf(d.id), 1) : a.push(d.id);
    const cut = C.iso(C.addDays(new Date(), -60)); for (const x in H) if (x < cut) delete H[x]; save(); render(); },
  addPartner: d => { const snap = b64d(d.d); if (!snap) return; const ps = state.partners = (state.partners || []).filter(x => x.n !== snap.n);
    ps.push({ ...snap, id: Date.now().toString(36), added: Date.now() }); save(); toast(`${snap.n} added`); go('partners/' + ps[ps.length - 1].id); },
  openPartner: d => { const p = (state.partners || []).find(x => x.id === d.id); if (p) { const { id, ...snap } = p; location.hash = '#/with?d=' + b64e(snap); } },
  removePartner: d => { const p = (state.partners || []).find(x => x.id === d.id); if (!p || !confirm(`Remove ${p.n}?`)) return; state.partners = state.partners.filter(x => x.id !== d.id); save(); if (route().name === 'partners') go('partners'); else render(); },
  seasonView: d => { ui.seasonView = d.v; render(); },
  seasonFood: d => { ui.seasonFood = ui.seasonFood === d.f ? null : d.f; render(); if (ui.seasonFood) document.querySelector('.sf-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  seasonFilter: d => { ui.seasonFilter = d.v; render(); },
  seasonMonth: d => { const m = (ui.seasonMonth || new Date().getMonth() + 1) + +d.d; ui.seasonMonth = ((m - 1 + 12) % 12) + 1; render(); },
  insTab: d => { ui.insTab = d.v; render(); },
  hxJump: d => { document.getElementById('hx-' + d.i)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  groToggle: d => { const g = state.grocery = state.grocery || {}; g[d.k] ? delete g[d.k] : (g[d.k] = 1); save(); render(); },
  groClear: () => { state.grocery = {}; save(); render(); },
  groShare: async () => {
    const got = state.grocery || {};
    const text = 'My Under the Skin grocery list\n\n' + groceryItems().map(([a, l]) => `${a}\n` + l.filter(i => !got[i.name.toLowerCase()]).map(i => `• ${i.name}`).join('\n')).join('\n\n');
    if (navigator.share) { try { await navigator.share({ title: 'Grocery list', text }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(text); toast('List copied'); } catch { toast('Couldn’t copy'); }
  },
  saveBirthday: () => { if (state.profile.birthday) render(); else toast('Pick your birthday first'); },
  nourishPhase: d => { ui.nourishPhase = d.v; ui.openNeed = 0; render(); },
  openNeed: d => { ui.openNeed = ui.openNeed === +d.i ? -1 : +d.i; render(); },
  shareAud: d => { ui.shareAudience = d.v; render(); },
  shareFertile: () => { ui.shareFertile = !ui.shareFertile; render(); },
  shareSend: async () => {
    const url = shareLink(), title = `${state.profile.name || 'My'}’s rhythm`;
    if (navigator.share) { try { await navigator.share({ title, text: 'Here’s where I am in my cycle 🌿', url }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { prompt('Copy this link', url); }
  },
  sharePreview: () => { location.hash = shareLink().split('#')[1]; },
  copyText: async d => { try { await navigator.clipboard.writeText(d.t); toast('Message copied'); } catch { toast('Couldn’t copy'); } },
  profileGoal: d => { const g = state.profile.goals = state.profile.goals || []; const i = g.indexOf(d.v); i < 0 ? g.push(d.v) : g.splice(i, 1); save(); render(); },
  export: () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `under-the-skin-${todayISO()}.json`; a.click();
  },
  demo: () => { if (confirm('Replace your logs with sample cycles?')) { state = demoState(state.profile.name); save(); toast('Sample cycles loaded'); go('today'); render(); } },
  reset: () => { if (confirm('Delete all your Rhythm data from this device?')) { localStorage.removeItem(KEY); state = null; ui.onbStep = 0; go('today'); render(); } },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('input', e => {
  const f = e.target.dataset?.input; if (!f) return;
  const [scope, key] = f.split('.'), v = e.target.value;
  if (scope === 'onb') { ui.onb[key] = v; const b = document.querySelector('[data-action="onbNext"]'); if (b && ui.onbStep === 1) b.disabled = !v.trim(); }
  else if (scope === 'profile') { state.profile[key] = v; save(); if (key === 'country') render(); }
  else if (scope === 'log') { const n = key === 'temp' ? (v === '' ? null : Math.round(parseFloat(v) * 100) / 100) : v; setLog(ui.logDate || todayISO(), { [key]: Number.isNaN(n) ? null : n }); }
});

// ---------- render ----------
let unmountFigs = [];
let welcome3d = null; // the running welcome scene (for the fly-through on Enter)
let fig3d = null; // lazily loaded Three.js module (null = not tried, false = unavailable)
function mountFigures() {
  unmountFigs.forEach(f => f()); unmountFigs = [];
  document.querySelectorAll('canvas.torso').forEach(c => unmountFigs.push(mountTorso(c, c.parentElement.querySelector('.torso-mark'))));
  document.querySelectorAll('canvas.torso3d').forEach(c => {
    const grain = c.parentElement.querySelector('canvas.grain');
    import('./torso3d.js').then(m => { if (!c.isConnected) return; unmountFigs.push(m.mountTorso3D(c, grain)); })
      .catch(() => { if (c.isConnected) unmountFigs.push(mountTorso(c, null)); });
  });
  document.querySelectorAll('canvas.welcome3d').forEach(c => {
    const wrap = c.closest('.onb-welcome');
    const fail = () => { if (!c.isConnected) return; const f = document.createElement('div'); f.className = 'fig-wrap welcome hero'; f.innerHTML = '<canvas class="figure" data-focus=""></canvas>'; c.replaceWith(f); mountFigures(); };
    c.addEventListener('welcome-fail', fail);
    import('./welcome3d.js').then(m => {
      if (!c.isConnected) return; if (!m.webglOK()) throw new Error('no webgl');
      const w = m.mountWelcome3D(c, { onReady: () => wrap?.classList.add('arrived') });
      // arrival whoosh: plays right away if sound is allowed, otherwise on the first touch
      import('./sfx.js').then(S => {
        const intro = () => S.whoosh({ dur: 2.6, vol: 0.45, from: 180, to: 2600 });
        if (navigator.userActivation?.hasBeenActive) intro();
        else wrap?.addEventListener('pointerdown', e => { if (!e.target.closest('[data-action="onbEnter"]')) intro(); }, { once: true });
      }).catch(() => {});
      welcome3d = w; unmountFigs.push(() => { w.destroy(); if (welcome3d === w) welcome3d = null; });
    }).catch(fail);
  });
  document.querySelectorAll('canvas.figure').forEach(c => {
    const opts = { focus: c.dataset.focus || null, mode: c.closest('.welcome') ? 'full' : 'lite', intro: !!c.closest('.welcome') };
    const flat = () => unmountFigs.push(mountFigure(c, opts));
    if (fig3d === false) return flat();
    const go = m => { if (!c.isConnected) return; try { unmountFigs.push(m.mountFigure3D(c, opts)); c.classList.add('is3d'); } catch { fig3d = false; flat(); } };
    if (fig3d) return go(fig3d);
    import('./figure3d.js').then(m => { if (!m.webglOK()) throw new Error('no webgl'); fig3d = m; go(m); }).catch(() => { fig3d = false; if (c.isConnected) flat(); });
  });
}
// After the last onboarding question: a dark "arrival" moment, then the dashboard rises into place.
function playArrival(view) {
  const info = M.info, ph = PHASES[info.phase], name = esc(state.profile.name || '');
  const el = document.createElement('div');
  el.className = 'arrive';
  el.innerHTML = `<div class="ar-ring">${flowRing(info, 'ar')}</div>
    <div class="ar-text"><p class="ar-1">Welcome${name ? `, ${name}` : ''}</p>
    <p class="ar-2">You’re on day ${Math.min(info.cd, info.L)} — your <em>${ph.name.toLowerCase()} phase</em></p>
    <p class="ar-3">${ph.season}. Your rhythm is ready.</p></div>`;
  $app.appendChild(el);
  view.classList.add('arrive-in');
  import('./sfx.js').then(S => { S.whoosh({ dur: 2.4, vol: 0.3, from: 150, to: 1400 }); setTimeout(() => S.whoosh({ dur: 1.2, vol: 0.5, from: 500, to: 5000, boom: true }), 3000); }).catch(() => {});
  setTimeout(() => el.classList.add('out'), 3400);
  setTimeout(() => { el.remove(); document.getElementById('view')?.classList.remove('arrive-in'); }, 5200);
}
function render() {
  const r = route();
  const prev = document.getElementById('view');
  const keep = prev && ui.lastRoute === r.key ? prev.scrollTop : 0;
  const fresh = ui.lastRoute !== r.key;
  if (r.name !== 'log' && fresh) ui.logDate = r.name === 'log' ? ui.logDate : ui.logDate;
  ui.lastRoute = r.key;

  if (r.name === 'with') {
    $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''}" id="view">${viewWith(r.q)}</div>`;
    return;
  }
  if (!state || !state.onboarded) {
    $app.innerHTML = `${statusbar()}<div class="view onb-view ${fresh ? 'enter' : ''}" id="view">${viewOnboarding()}</div>`;
    mountFigures();
    return;
  }
  M = model();
  const views = {
    today: viewToday, calendar: viewCalendar, log: viewLog, plan: viewPlan, insights: viewInsights, profile: viewProfile, share: viewShare, cosmic: viewCosmic, grocery: viewGrocery, remedy: () => viewRemedy(r.id), habits: viewHabits, partners: () => viewPartners(r.id), hormones: viewHormones, move: viewMove, season: viewSeason, privacy: viewPrivacy, relief: () => (r.id ? viewRelief(r.id) : viewReliefIndex()),
    recipe: () => viewRecipe(r.id), ritual: () => viewRitual(r.id), point: () => viewPoint(r.id), article: () => viewArticle(r.id),
  };
  const tabs = ['today', 'calendar', 'log', 'plan', 'insights'];
  const html = (views[r.name] || viewToday)();
  const arriving = $app.querySelector('.arrive');
  $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''} ${arriving ? 'arrive-in' : ''}" id="view">${html}</div>${tabs.includes(r.name) || !views[r.name] ? tabbar(r.name in views ? r.name : 'today') : ''}`;
  if (arriving) $app.appendChild(arriving);
  const v = document.getElementById('view');
  v.scrollTop = keep;
  if (ui.arrive && r.name === 'today' && M.info) { ui.arrive = false; playArrival(v); }
  bindCharts();
  fireNotifications();
  mountFigures();
  const wk = document.getElementById('week');
  if (wk) { const on = wk.querySelector('.on'); if (on) wk.scrollLeft = on.offsetLeft - wk.clientWidth / 2 + on.clientWidth / 2; }
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
setInterval(() => { if (state?.onboarded) { M = model(); fireNotifications(); } }, 15 * 60 * 1000);
window.addEventListener('hashchange', () => { if (route().name !== 'log') ui.logDate = null; render(); });
setInterval(() => { const sb = document.querySelector('.statusbar span'); if (sb) sb.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, ''); }, 30000);
render();
