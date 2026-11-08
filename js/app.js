import {
  PHASES, PHASE_ORDER, PHASE_COLOR, BLOOD_COL, RECIPES, ARTICLES, ARTICLE_STUDIES, ARTICLE_PIC, LETTERS, FLOWS, PERIOD_FLOWS, SYMPTOMS, MOODS, PLAN_METHOD, GLOW_RESULTS, RESEARCH_WALL, STUDY_BA, SHADES, BODY_GROUPS, MOOD_LIST, GOOD_FEELINGS, DISCHARGE, DOWN_EXTRA, INTIMACY, INTAKE, SUPPS, DISRUPTORS, LOG_EMOJI, SYMPTOM_WHY, FLUIDS, SEX, LIBIDO, GOALS, TCM, RITUALS, SUPPORT, NUTRITION, SYMPTOM_FOODS, EVIDENCE, RELIEF, REMEDIES, SUGAR_TRICKS, TEA_GUIDE, TEA_PROFILES, NUTRIENTS, REMEDY_SCIENCE, SUPP_LIB, SUPP_FOOD, SUPP_FOOD_AMT, RELIEF_LINKS, PLATE_PETALS, PLATE_SHARE, PLATE_EV, PLATE_SPICE_WHY, PLATE_SEASON, PLATE_GRID, PLATE_MEAL, SUGAR_SCIENCE, SUGAR_CYCLE, HABIT_FOCUS, CALM_SCIENCE, NUTRIENT_ROLE, SUPP_PAIR, SUPERFOODS, DIETS, DIET_GUIDE, RITUAL_SCIENCE, POINT_SCIENCE, EAT_CATS, EAT_GUIDE, PURPOSES, FOCUS, TIPS, BIRTH_CONTROL, BC_PLAN, ROADMAP, TTC_TIPS, TIP_DO, TTC_DO, DAY_GUIDE, MOVES, MOVE_GUIDE, MOVE_DOSE, MOVE_SCIENCE, MIND_GUIDE, MIND_SCIENCE, CYCLE_SCIENCE, HORMONE_SCIENCE, HORMONE_LIBRARY, HABITS, FERTILITY_FOODS, AUTUMN_RITUALS, WINTER_HERBS,
} from './data.js';
import * as C from './cycle.js';
import { icon } from './icons.js';
import * as Z from './cosmic.js';
import * as AS from './astro.js';
import * as MG from './moonguide.js';
import { mountFigure, mushroomArt, nautilusArt } from './figure.js';
import { mountTorso } from './torso.js';
import { RECIPE_PHOTOS, photoUrl, DISH_PHOTOS, dishPhoto, HORMONE_PHOTOS, hormonePhoto, CARE_PHOTOS, carePhoto, STAR_PHOTOS, starPhoto, foodPhoto, FOOD_PHOTOS, teaPhoto } from './photos.js';
import * as SZ from './seasonal.js';
import { WORLD, worldOf, PHASE_EAT, PANTRY } from './world.js';
import { TRAIN_SAFE, TRAIN_SAFE_CREDIT, TRAIN_WHEN, TRAIN_NUM } from './athlete.js';
import { BODY_MAP, BODY_PIN } from './bodymap.js';
import { GROUND_NOW, GROUND_WHERE, GROUND_PHASE, GROUND_MOON, GROUND_ROOTS, GROUND_STUDIES, GROUND_CAUTION } from './ground.js';
import { MOLECULES, MOL_BALL } from './molecules.js';
import { sunTimes, COUNTRY_GEO } from './sun.js';
import * as A from './account.js';

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
function save(quiet) {
  if (state && !quiet) state.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  if (!quiet) { cloudSoon(); calSoon(); }
}

// ---------- account sync ----------
// Local-first. With an account, every change is pushed a moment later; on sign-in and on each open the
// newer copy wins. The first time a phone joins an account both copies are merged, so nothing is lost.
const byId = (a = [], b = []) => { const m = new Map(); for (const x of [...a, ...b]) m.set(x.id ?? JSON.stringify(x), x); return [...m.values()]; };
function mergeStates(a, b) {
  const [old, neu] = (a.updatedAt || 0) > (b.updatedAt || 0) ? [b, a] : [a, b];
  return { ...old, ...neu, logs: { ...old.logs, ...neu.logs }, aura: { ...old.aura, ...neu.aura }, events: byId(old.events, neu.events), partners: byId(old.partners, neu.partners), favorites: [...new Set([...(old.favorites || []), ...(neu.favorites || [])])] };
}
const sync = { busy: false, at: 0, err: '' };
function cloudSoon() { if (!A.currentUser() || !state?.onboarded) return; clearTimeout(cloudSoon.t); cloudSoon.t = setTimeout(cloudSync, 1500); }
async function cloudSync() {
  const u = A.currentUser(); if (!u || sync.busy) return;
  sync.busy = true;
  const wasOn = !!state?.onboarded;
  try {
    const remote = await A.pull(), r = remote?.data;
    const linked = state?.account === u.id, other = state?.account && !linked; // other = this phone belonged to another login
    let take = false, changed = false;
    // a brand-new account on a phone that holds someone else's data: keep a backup, start clean
    if (other && !r?.onboarded) { try { localStorage.setItem(KEY + '.backup', JSON.stringify(state)); } catch {} state = null; changed = true; }
    if (r?.onboarded) {
      if (!state?.onboarded) take = true;
      else if (other) { try { localStorage.setItem(KEY + '.backup', JSON.stringify(state)); } catch {} take = true; }
      else if (!linked) { state = mergeStates(state, r); changed = true; }
      else if ((remote.updated_at || 0) > (state.updatedAt || 0)) take = true;
      if (take) { state = r; changed = true; }
    }
    if (state?.onboarded) {
      const firstLink = !linked && !take;
      state.account = u.id; state.consentAt = state.consentAt || +lsGet('uts.consentAt') || Date.now();
      if (firstLink) state.updatedAt = Date.now();
      save(true);
      if (!take && (firstLink || !remote || (state.updatedAt || 0) > (remote.updated_at || 0))) await A.push(state);
    }
    sync.at = Date.now(); sync.err = '';
  } catch (e) { sync.err = e.message || 'Could not sync'; }
  sync.busy = false;
  M = state?.onboarded ? model() : M;
  if (!wasOn && state?.onboarded) { ui.arrive = true; go('today'); }
  // only redraw when the data changed (or on the account page): a redraw mid-typing would close the keyboard
  if (changed || !wasOn !== !state?.onboarded || route().name === 'account') render();
}
function o_ok() { return ui.onb.noPeriod || /^\d{4}-\d\d-\d\d$/.test(ui.onb.last || ''); }
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
A.onUser((u, ev) => {
  if (ev === 'PASSWORD_RECOVERY') { ui.acRecover = true; go('account'); }
  // signed in but no cycle set up yet (new account): skip the welcome and go straight to setting it up
  if (u && !(state && state.onboarded)) { ui.onbStep = Math.max(ui.onbStep, 1); ui.onbGateDone = true; cloudSync().then(() => { if (!(state && state.onboarded) && route().name === 'account' && !ui.acRecover) go('today'); }); return; }
  if (u) { if (ev === 'SIGNED_IN' && route().name === 'account' && !ui.acToastDone) { ui.acToastDone = true; toast('Signed in: your data is saved'); } cloudSync(); } else render(); });
A.boot();


// ---------- iPhone / Android app ----------
// Inside the store apps (Capacitor) the page lives at capacitor://localhost, so links meant for other people
// point at the public website, and files and shares go through the phone's own share sheet.
const CAP = window.Capacitor, NATIVE = !!CAP?.isNativePlatform?.();
const PUBLIC_URL = 'https://elijanaru.github.io/under-the-skin/';
if (NATIVE) document.documentElement.classList.add('native-' + CAP.getPlatform());
const appBase = () => (NATIVE ? PUBLIC_URL : location.origin + location.pathname);
// true when a share sheet was shown (shared or cancelled), false when there is none
async function shareOut(o) {
  const S = NATIVE && CAP.Plugins?.Share;
  if (S) { try { await S.share(o); } catch { /* cancelled */ } return true; }
  if (navigator.share) { try { await navigator.share(o); } catch { /* cancelled */ } return true; }
  return false;
}
async function saveFile(name, text, type) {
  const F = NATIVE && CAP.Plugins?.Filesystem, S = NATIVE && CAP.Plugins?.Share;
  if (F && S) {
    try { const { uri } = await F.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' }); await S.share({ title: name, files: [uri] }); } catch { /* cancelled */ }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

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
  const items = [['today', 'home', 'Today'], ['calendar', 'calendar', 'Calendar'], ['log', 'plus', 'Log'], ['plan', 'bowl', 'Food guide'], ['insights', 'chart', 'Insights']];
  return `<nav class="tabbar">${items.map(([to, ic, label]) =>
    `<button class="tab ${to === 'log' ? 'tab-main' : ''} ${active === to ? 'active' : ''}" data-action="nav" data-to="${to}" aria-label="${label}">${icon(ic, to === 'log' ? 26 : 21)}</button>`).join('')}</nav>`;
}
// Each section on a page gets the next tone (deep green, lime glow, black glass), so sections are easy to tell apart.
let secN = 0;
function sectionTitle(t, more) {
  return `<div class="section-title tone-${secN++ % 3}"><h3>${t}</h3>${more ? `<button class="link" data-action="nav" data-to="${more[1]}">${more[0]}</button>` : ''}</div>`;
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

// ---------- purpose & focus ----------
const GOAL_TO_FOCUS = { 'Ease PMS': 'pms', 'Clearer skin': 'skin', 'Better sleep': 'sleep', 'Balance my mood': 'mood', 'Eat for my cycle': 'eat', 'Balance with TCM': 'tcm', 'Understand my hormones': 'hormones', 'Predict my period': 'hormones' };
function purpose() { const p = state.profile; return p.purpose || ((p.goals || []).includes('Trying to conceive') ? 'conceive' : 'know'); }
function focusKeys() { const p = state.profile; if (p.focus) return p.focus; const f = [...new Set((p.goals || []).map(g => GOAL_TO_FOCUS[g]).filter(Boolean))]; return f.length ? f : ['hormones', 'energy', 'eat']; }
function ttc() { return purpose() === 'conceive'; }
function purposePicker(cur, act, full) {
  if (cur === 'notnow') cur = 'know';
  return `<div class="purp ${full ? 'full' : ''}">${PURPOSES.map(x => { const u = x.img || hormonePhoto(x.photo, 600); return `<button class="purp-c ${cur === x.k ? 'on' : ''} ${x.soon ? 'soon' : ''}" ${x.soon ? 'disabled' : `data-action="${act}" data-v="${x.k}"`}>${u ? `<img src="${u}" alt=""${x.pos ? ` style="object-position:${x.pos}"` : ''}>` : ''}<span class="pc-shade"></span><span class="pc-in"><b>${x.t}</b><small>${x.s}</small></span>${x.soon ? '<span class="pc-soon">Coming soon</span>' : `<span class="pc-check">${icon('check', 14, 2.6)}</span>`}</button>`; }).join('')}</div>`;
}
const FOCUS_G = { pms: '🌺', skin: '💧', sleep: '😴', mood: '🌤️', energy: '⚡', eat: '🥗', tcm: '☯️', hormones: '🧬', body: '🔥', bloat: '🫧', regular: '🗓️' };
function focusTiles(cur, act) { return `<div class="ftiles">${FOCUS.map(f => `<button class="ft ${cur.includes(f.k) ? 'on' : ''}" data-action="${act}" data-v="${f.k}"><span>${FOCUS_G[f.k]}</span>${f.t}</button>`).join('')}</div>`; }
// toggle selection classes in place — no full re-render, so it stays smooth
function markOn(act, v, single) { document.querySelectorAll(`[data-action="${act}"]`).forEach(b => { if (single) b.classList.toggle('on', b.dataset.v === v); else if (b.dataset.v === v) b.classList.toggle('on'); }); }
function focusPicker(cur, act) { return `<div class="chips">${FOCUS.map(f => `<button class="chip ${cur.includes(f.k) ? 'on' : ''}" data-action="${act}" data-v="${f.k}">${f.t}</button>`).join('')}</div>`; }
// Where each tip leads when tapped.
const TIP_TO = { pms: 'article/progesterone-pms', skin: 'article/skin-cycle', sleep: 'article/sleep', mood: 'article/brain', energy: 'article/iron', eat: 'article/eat-cycle', tcm: 'article/yin-yang', body: 'article/train-cycle', bloat: 'article/bloating', regular: 'article/four-phases', ttc: 'article/ovulation-signs' };
const HORMONE_READ = { menstrual: 'iron', follicular: 'estrogen', ovulatory: 'ovulation-signs', luteal: 'progesterone-pms' };
// Every tip opens an article: what she logged picks the read.
const LOG_READ = { Acne: 'skin-cycle', Bloating: 'bloating', Nausea: 'bloating', Constipation: 'bloating', Diarrhea: 'bloating', Fatigue: 'iron', Dizziness: 'iron', 'Hair shedding': 'iron', 'Brain fog': 'brain', Anxious: 'brain', 'Low mood': 'brain', Unmotivated: 'brain', Sensitive: 'brain' };
const logRead = n => `article/${LOG_READ[n] || 'progesterone-pms'}`;
// Tip deck: a question, the tip, and one clear way in, per thing she wants help with.
const TIP_DECK = { pms: ['drop', 'Cramps creeping in?', 'Ease my PMS'], skin: ['spark', 'Skin acting up?', 'Skin relief'], sleep: ['moon', 'Trouble winding down?', 'Sleep better'], mood: ['sun', 'Feeling up and down?', 'Mood & your brain'], energy: ['bolt', 'Running low?', 'Get my energy back'], eat: ['bowl', 'What should I eat today?', 'Open my plan'], tcm: ['yinyang', 'What is your inner season?', 'Yin & yang'], hormones: ['chart', 'What is my body doing?', 'See my hormones'], body: ['leaf', 'Want a strong, toned body?', 'Best training times'], bloat: ['cup', 'Feeling bloated?', 'Bloating relief'], regular: ['calendar', 'Want a steadier cycle?', 'The four phases'], ttc: ['heart', 'Trying for a baby?', 'Signs of egg release'] };
// A tip from her own check-ins: a pattern due today or tomorrow, a hard symptom from the last two days, or her fertile sign.
function checkinTip(info) {
  const tip = (t, deck, to) => ({ k: 'mine', t: 'From your check-ins', photo: 'Progesterone', tip: t, deck, to });
  const rel = logRead;
  const up = M.stats.periods.length ? upcomingPatterns(patterns()).find(x => x.inDays <= 1 && QUICK_FIX[x.name]) : null;
  if (up) return tip(`${up.name} usually comes on ${dayRange(up)} for you. Get ahead of it: ${QUICK_FIX[up.name]}`, ['spark', `${up.name} ${up.inDays ? 'tomorrow' : 'today'}?`, 'Get ahead of it'], rel(up.name));
  for (const d of [0, -1]) {
    const l = state.logs[C.iso(C.addDays(new Date(), d))] || {};
    const s = [...(l.symptoms || []), ...(l.moods || [])].find(x => QUICK_FIX[x] && !GOOD_FEELINGS.includes(x));
    if (s) return tip(`You logged ${s.toLowerCase()} ${d ? 'yesterday' : 'today'}. ${QUICK_FIX[s]}`, ['spark', `Still feeling ${s.toLowerCase()}?`, 'What helps'], rel(s));
    if (l.fluid === 'Egg white') return tip(`Your egg-white sign moved your egg release to day ${info.ov}. Energy, confidence and desire peak around now.`, ['heart', 'Your fertile days are here', 'See my hormones'], 'article/ovulation-signs');
  }
  return null;
}
// Saved tips: every tip is an action she can do now, and the bookmark keeps it on her Saved page.
const TIPREG = {};
const isSaved = id => (state.savedTips || []).some(x => x.id === id);
function regTip(id, t, d, to) { if (d) TIPREG[id] = { id, t, a: d[0], s: [d[1], d[2]], w: d[3], to }; return id; }
const saveBtn = (id, cls = '') => `<button class="sv-btn ${cls} ${isSaved(id) ? 'on' : ''}" data-action="saveTip" data-id="${id}" aria-pressed="${isSaved(id)}" aria-label="${isSaved(id) ? 'Saved' : 'Save this tip'}">${icon('save', 17, 1.8)}</button>`;
const doSteps = d => `<span class="dos"><span class="dos-w">${icon('clock', 12)} ${d[3]}</span><b>${d[0]}</b><ol><li>${d[1]}</li><li>${d[2]}</li></ol></span>`;
function tipsCard(info) {
  const ph = info.phase, list = [], mine = checkinTip(info);
  if (mine) list.push(mine);
  const tph = info.cd >= info.ov - 5 && info.cd <= info.ov ? 'ovulatory' : ph;
  if (ttc()) list.push({ k: 'ttc', t: 'Trying to conceive', photo: 'Prolactin', tip: TTC_TIPS[tph], d: TTC_DO[tph], id: `ttc-${tph}` });
  focusKeys().forEach(k => { const f = FOCUS.find(x => x.k === k); if (f) list.push({ k, t: f.t, photo: f.photo, tip: TIPS[k][ph], d: TIP_DO[k] && TIP_DO[k][ph], id: `${k}-${ph}` }); });
  if (!list.length) return '';
  const [lead] = list, D = x => x.deck || TIP_DECK[x.k] || ['spark', x.t, 'Show me'];
  const [lic, lq] = D(lead), lu = hormonePhoto(lead.photo, 900), to = x => x.to || (x.k === 'hormones' ? `article/${HORMONE_READ[ph]}` : TIP_TO[x.k]) || 'article/four-phases';
  const la = ARTICLES.find(a => `article/${a.id}` === to(lead)), lcta = `${icon('book', 14)} Read the article${la ? ` · ${la.mins} min` : ''}`;
  if (lead.d) regTip(lead.id, lead.t, lead.d, to(lead));
  const n = (state.savedTips || []).length;
  return `${sectionTitle('Your tip today', n ? [`${icon('save', 12)} Saved · ${n}`, 'saved'] : ['Edit', 'profile'])}
    <div class="tf-w">
    <button class="tf" data-action="nav" data-to="${to(lead)}">
      <span class="tf-media">${lu ? `<img src="${lu}" alt="" loading="lazy">` : ''}<span class="tf-tag">${icon(lic, 13)} ${lead.t}</span><b class="tf-q">${lq}</b></span>
      ${lead.d ? doSteps(lead.d) : `<span class="tf-p">${lead.tip}</span>`}
      <span class="tf-cta">${lcta} ${icon('chevR', 14)}</span></button>
      ${lead.d ? saveBtn(lead.id, 'float') : ''}</div>`;
}
// ---------- one page per "Best things to do today" tile ----------
const FRIENDS = {
  menstrual: { ideas: ['Film night at home', 'A slow walk and talk with one friend', 'Let people bring you soup'], skip: 'Big parties and late nights', why: 'With hormones at their lowest, most women want fewer, closer people. Warm touch and hugs release oxytocin, which can soften pain and stress.' },
  follicular: { ideas: ['Try a new class with a friend', 'Plan a trip or a weekend', 'Say yes to meeting someone new'], skip: 'Cancelling out of habit', why: 'Rising estrogen lifts dopamine, the curiosity chemical. New people and new places feel exciting instead of tiring now.' },
  ovulatory: { ideas: ['Dinner, dancing or a party', 'Have the big conversation', 'Plan a date night'], skip: 'Staying home out of guilt', why: 'Estrogen and testosterone peak. Words come easily, confidence is high and you are at your most social.' },
  luteal: { ideas: ['One close friend over tea', 'Cook together at home', 'A voice note instead of meeting when tired'], skip: 'Overbooking and late-night arguments', why: 'Progesterone calms you but also makes you more sensitive to stress and criticism. Small, warm and familiar feels best.' },
};
// the Today tile in a few words: [title, do, skip]
const FRIENDS_TILE = { menstrual: ['Film night at home', 'A slow walk', 'Big parties'], follicular: ['A new class together', 'Meet someone new', 'Cancelling plans'], ovulatory: ['Dinner or dancing', 'The big talk', 'Hiding at home'], luteal: ['Tea with one friend', 'Cook together', 'Late arguments'] };
const TOPIC_PIC = { eat: 'images/season-veg.webp', friends: 'images/partner-hands.jpg', stretch: 'images/move-walk.webp', meditate: 'images/move-meditate.webp', tea: 'images/tea-ginger.webp' };
function viewTopic(k) {
  const info = M.info; if (!info || !TOPIC_PIC[k]) return viewMissing();
  const w = dayWindow(info), ph = info.phase, P = PHASES[ph];
  const head = { eat: ['Eat', FOOD_NEEDS[w][0]], friends: ['Friends', PEOPLE_PLAN[ph][0]], stretch: ['Stretch', STRETCH[w][0]], meditate: ['Meditate', MEDITATE[w][0]], tea: ['Tea', TEA_DAY[w][1]] }[k];
  const steps = k === 'stretch' ? STRETCH[w] : k === 'meditate' ? MEDITATE[w] : null;
  let body = '';
  if (steps) body = `<section class="card tp-card"><p class="tp-lead">${steps[1]}</p><ol class="gr-steps">${steps[2].map((t, i) => `<li><i>${i + 1}</i><span><b>${t}</b></span></li>`).join('')}</ol>
      <div class="tp-f"><span class="dos-w">${icon('clock', 12)} Today</span>${saveBtn(regTip(`${k}-${w}`, head[0], [steps[0], steps[2][0], steps[2][1] || '', 'Today'], `do/${k}`))}</div></section>
    <button class="bz-cta" data-action="nav" data-to="breathe"><i class="bz-mini"></i><span><b>Breathe with me</b><small>A guided breath for your phase</small></span>${icon('chevR', 16)}</button>`;
  else if (k === 'friends') { const F = FRIENDS[ph];
    body = `<section class="card tp-card"><div class="tp-k">${icon('heart', 14)} Ideas for today</div>
      <div class="tp-ideas">${F.ideas.map((t, i) => `<span><i>${i + 1}</i>${t}</span>`).join('')}</div>
      <div class="en-r no tp-skip">${icon('close', 12, 2.4)}<span><em>Skip</em>${F.skip}</span></div>
      <div class="tp-f"><span class="dos-w">${icon('clock', 12)} This week</span>${saveBtn(regTip(`friends-${ph}`, 'Friends', [PEOPLE_PLAN[ph][0], F.ideas[0], F.ideas[1], 'This week'], 'do/friends'))}</div>
      <details class="gr-why"><summary>Why in this phase ${icon('chevD', 13)}</summary><p>${F.why}</p></details></section>
    ${sectionTitle('Across your cycle')}
    <section class="card tp-card"><div class="tp-cyc">${PHASE_ORDER.map(p => `<span class="${p === ph ? 'on' : ''}" style="--c:${PH_HEX[p]}"><i></i><small>${PHASES[p].name}</small><b>${PEOPLE_PLAN[p][0]}</b></span>`).join('')}</div></section>`; }
  else body = `<section class="card tp-card tp-wrap">${todayTiles(info, k)}</section>`;
  return `${topbar(head[0], { back: true })}
  <div class="pad tp">
    <section class="tp-hero"><img src="${TOPIC_PIC[k]}" alt=""><span class="tp-hero-t"><small>Day ${Math.min(info.cd, info.L)} · ${P.name}</small><b>${head[1]}</b></span></section>
    ${body}
  </div>`;
}
// Stress opens Breathe with this on top: her cortisol through the day, her stress level today, and why breath brings it down.
const CT_V = x => x < 7.6 ? .12 + .88 * Math.exp(-(((x - 7.6) / 1.1) ** 2)) : .1 + .9 * Math.exp(-(x - 7.6) / 5);
const CT_TIP = [[5, 'Lowest', 'Deep sleep and repair. Your body rests its alarm.'], [7, 'Rising', 'Your body gets you ready to wake.'], [9.5, 'Morning peak', 'A healthy peak. Get daylight and protein, no need to calm it.'], [14, 'Easing', 'Your best hours for focus and hard tasks.'], [18, 'Afternoon', 'A 3 min breath break stops stress pushing it back up.'], [22, 'Evening', 'Long out-breaths help it fall so you can sleep.'], [24.1, 'Low', 'Screens off. Melatonin takes over now.']];
const ctX = x => 10 + x / 24 * 300, ctY = v => 94 - v * 80;
const ctTime = x => { const h = Math.floor(x) % 24, m = Math.round((x % 1) * 60); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`; };
function ctRead(x) { const v = CT_V(x), [, word, tip] = CT_TIP.find(t => x < t[0]); return { v, word, tip, lvl: v > .7 ? 'High' : v > .35 ? 'Medium' : 'Low' }; }
// drag or tap along the curve: the dot and the one headline follow her finger
function ctScrub(inp) {
  const box = inp.closest('.ct'), x = +inp.value, r = ctRead(x), cx = ctX(x).toFixed(1), cy = ctY(r.v).toFixed(1), m = box.querySelector('.ct-m');
  m.setAttribute('cx', cx); m.setAttribute('cy', cy);
  box.querySelector('.ct-hl').innerHTML = `Cortisol is <b class="l${r.lvl[0]}">${r.lvl.toLowerCase()}</b> at ${ctTime(x)}`;
  box.querySelector('.ct-tip').textContent = r.tip;
  inp.setAttribute('aria-valuetext', `${ctTime(x)}: ${r.lvl.toLowerCase()} cortisol`);
}
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('.ct-range')) ctScrub(e.target); });
// Stress opens Breathe with this on top: one headline, one tip, one clean curve of her day (slide along it), studies behind a tap.
function cortisolSec(info) {
  const h = nowH(), pts = [];
  for (let x = 0; x <= 24; x += .25) pts.push([x, CT_V(x)]);
  const d = pts.map(([x, v], i) => `${i ? 'L' : 'M'}${ctX(x).toFixed(1)} ${ctY(v).toFixed(1)}`).join(' ');
  const r = ctRead(h);
  return `<section class="card ct ct3">
    <small class="ct-k">Your stress hormone</small>
    <h3 class="ct-hl">Cortisol is <b class="l${r.lvl[0]}">${r.lvl.toLowerCase()}</b> right now</h3>
    <p class="ct-tip">${r.tip}</p>
    <div class="ct-wrap">
      <svg class="ct-g" viewBox="0 0 320 112" aria-hidden="true">
        <defs><linearGradient id="ctF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6a443" stop-opacity=".3"/><stop offset="1" stop-color="#d6a443" stop-opacity="0"/></linearGradient></defs>
        <path d="${d} L${ctX(24)} 96 L${ctX(0)} 96 Z" fill="url(#ctF)"/><path d="${d}" fill="none" stroke="#b07a22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle class="ct-m" cx="${ctX(h).toFixed(1)}" cy="${ctY(r.v).toFixed(1)}" r="8" fill="#fff" stroke="#20301a" stroke-width="3"/>
        ${[[6, '6am'], [12, '12pm'], [18, '6pm']].map(([x, t]) => `<text x="${ctX(x)}" y="110" text-anchor="middle" class="ct-ax">${t}</text>`).join('')}</svg>
      <input class="ct-range" type="range" min="0" max="24" step="0.25" value="${(Math.round(h * 4) / 4).toFixed(2)}" aria-label="Slide through your day"></div>
    <p class="ct-foot">${icon('leaf', 13)} Breathing out longer than in lowers it within minutes.</p>
    <details class="gr-why"><summary>What studies found ${icon('chevD', 13)}</summary><p><b>Ma et al. 2017</b> (Frontiers in Psychology): 8 weeks of slow belly breathing lowered saliva cortisol and improved focus in 40 adults.</p><p><b>Balban et al. 2023</b> (Cell Reports Medicine): 5 minutes a day of breathing with long out-breaths lifted mood and lowered breathing rate more than meditation.</p><p>Cortisol peaks about 30 to 45 minutes after you wake and falls toward night.</p></details>
  </section>`;
}
// Move page: six health checks for women who train, each a tile that opens two steps, why, and one study.
// Train safe: six tiles; the open one is a graphic first (one big number and a small chart), then two steps, when in the cycle it matters, and the reading behind one tap.
function tsViz(k) {
  const W = 300;
  if (k === 'fuel') { const x = v => 14 + v / 60 * (W - 28); return `<svg viewBox="0 0 ${W} 64" class="tsv"><rect x="14" y="22" width="${x(30) - 14}" height="14" rx="7" class="tsv-bad"/><rect x="${x(30)}" y="22" width="${x(45) - x(30)}" height="14" class="tsv-mid"/><rect x="${x(45)}" y="22" width="${W - 14 - x(45)}" height="14" rx="7" class="tsv-good"/>
    <line x1="${x(30)}" y1="14" x2="${x(30)}" y2="44" class="tsv-mark"/><text x="${x(30)}" y="10" class="tsv-t c">30</text><text x="${x(45)}" y="10" class="tsv-t c">45</text>
    <text x="14" y="58" class="tsv-s">Cycle switches off</text><text x="${W - 14}" y="58" class="tsv-s e">Healthy fuel</text></svg>`; }
  if (k === 'iron') { const x = h => 14 + h / 12 * (W - 28); return `<svg viewBox="0 0 ${W} 64" class="tsv"><line x1="14" y1="30" x2="${W - 14}" y2="30" class="tsv-axis"/>
    <rect x="${x(3)}" y="18" width="${x(6) - x(3)}" height="24" rx="8" class="tsv-bad"/><text x="${(x(3) + x(6)) / 2}" y="34" class="tsv-t c w">absorbs less</text>
    <rect x="${x(0) - 2}" y="18" width="${x(2) - x(0) + 2}" height="24" rx="8" class="tsv-good"/><text x="${(x(0) + x(2)) / 2}" y="34" class="tsv-t c w">eat iron</text>
    ${[0, 3, 6, 9, 12].map(h => `<text x="${x(h)}" y="58" class="tsv-s c">${h === 0 ? 'Train' : `+${h}h`}</text>`).join('')}</svg>`; }
  if (k === 'bone') { const y0 = 40, s = 9; return `<svg viewBox="0 0 ${W} 72" class="tsv"><line x1="20" y1="${y0}" x2="${W - 20}" y2="${y0}" class="tsv-axis"/>
    <rect x="70" y="${y0 - 2.9 * s}" width="56" height="${2.9 * s}" rx="6" class="tsv-good"/><text x="98" y="${y0 - 2.9 * s - 5}" class="tsv-t c">+2.9%</text><text x="98" y="${y0 + 26}" class="tsv-s c">Heavy lifting</text>
    <rect x="174" y="${y0}" width="56" height="${1.2 * s}" rx="6" class="tsv-bad"/><text x="202" y="${y0 + 1.2 * s + 13}" class="tsv-t c">−1.2%</text><text x="202" y="${y0 - 6}" class="tsv-s c">Light exercise</text></svg>`; }
  if (k === 'knee') return `<div class="tsv-knees">${[0, 1, 2].map(i => `<span class="${i === 2 ? 'off' : ''}">${icon('bolt', 20)}</span>`).join('')}<small>3 injuries become 2 with the warm-up</small></div>`;
  if (k === 'heat') return `<div class="tsv-heat"><span><i style="--h:44%"></i><b>36.4°</b><small>First half</small></span><span class="hot"><i style="--h:78%"></i><b>36.8°</b><small>After ovulation</small></span></div>`;
  if (k === 'protein') return `<div class="tsv-palm">${['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(m => `<span>${icon('hand', 22)}<b>24 g</b><small>${m}</small></span>`).join('')}<p>At 60 kg: about 96 g a day, one palm per meal</p></div>`;
  return '';
}
function trainSafe() {
  const open = ui.tsOpen, x = TRAIN_SAFE.find(t => t[0] === open), ph = M.info && M.info.phase;
  const strip = k => `<div class="ts-when"><small>When it matters most</small><div>${PHASE_ORDER.map(p => `<span class="${TRAIN_WHEN[k].includes(p) ? 'on' : ''} ${p === ph ? 'now' : ''}" style="--c:${PH_HEX[p]}"><i></i>${PHASES[p].name}${p === ph ? '<em>now</em>' : ''}</span>`).join('')}</div></div>`;
  return `${sectionTitle('Train safe')}
    <div class="ts-grid">${TRAIN_SAFE.map(([k, g, t, l]) => `<button class="ts ${k === open ? 'on' : ''}" data-action="tsOpen" data-k="${k}" aria-expanded="${k === open}"><span class="ts-ic">${icon(g, 18)}</span><b>${t}</b><small>${l}</small></button>`).join('')}</div>
    ${x ? (() => { const N = TRAIN_NUM[x[0]]; return `<section class="card ts-more ts2">
      <div class="ts2-h"><span class="ts-ic">${icon(x[1], 18)}</span><b>${x[2]}</b>${saveBtn(regTip(`train-${x[0]}`, 'Train safe', [x[2], x[4][0], x[4][1], 'This week'], 'move'))}</div>
      <div class="ts2-big"><div class="ts2-n"><b>${N[0]}</b><small>${N[1]}</small></div><p>${N[2]}</p></div>
      ${tsViz(x[0])}
      <div class="ts2-do"><small>${icon('check', 12)} Do this</small><ol>${x[4].map((t, i) => `<li><i>${i + 1}</i>${t}</li>`).join('')}</ol></div>
      ${strip(x[0])}
      <p class="ts-ph">${icon('moon', 13)} ${x[7]}</p>
      <details class="gr-why ts2-more"><summary>Why, and the study ${icon('chevD', 13)}</summary><p class="ts-why">${x[5]}</p>
        <div class="ts-study"><span class="gr-y">${x[6][0].match(/\d{4}/)[0]}</span><span><b>${x[6][0].replace(/ \d{4}$/, '')}</b><small>${x[6][1]}</small></span></div></details>
    </section>`; })() : ''}
    <p class="ts-credit">${TRAIN_SAFE_CREDIT}</p>`;
}
// ---------- grounding: bare skin on the earth ----------
// A tiny drawn scene for each surface in "Where to stand" (same order as GROUND_WHERE).
const GROUND_ART = [
  '<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#efdcbc"/><path d="M0 0h120v16c-14 6-24-4-40 2s-26 8-40 2S12 12 0 18z" fill="#a9cdd0"/><path d="M0 18c12-6 26 2 40-2s24-8 40-2 26 4 40-2" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><g fill="#caa77a"><ellipse cx="44" cy="34" rx="4" ry="6.5"/><ellipse cx="58" cy="44" rx="4" ry="6.5"/><ellipse cx="74" cy="32" rx="4" ry="6.5"/></g></svg>',
  `<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#e3ecd3"/><g fill="none" stroke="#6c823e" stroke-width="2.4" stroke-linecap="round">${Array.from({ length: 14 }, (_, i) => `<path d="M${6 + i * 8.4} 56c${i % 2 ? 2 : -2}-10 ${i % 3 - 1}-20 ${i % 2 ? 4 : -3}-${24 + (i * 7) % 14}"/>`).join('')}</g><g fill="#fff" stroke="#9fc3c8" stroke-width=".8"><circle cx="22" cy="24" r="2.4"/><circle cx="64" cy="18" r="2.8"/><circle cx="96" cy="28" r="2.2"/></g></svg>`,
  '<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#8a6a4f"/><rect width="120" height="18" fill="#dfe6d0"/><path d="M0 18c20-4 40 3 60 0s40-3 60 0v38H0z" fill="#7a5b42"/><g fill="#a3876c"><circle cx="20" cy="40" r="2"/><circle cx="92" cy="44" r="2.4"/><circle cx="76" cy="32" r="1.6"/></g><path d="M58 30V12" stroke="#6c823e" stroke-width="2.4" stroke-linecap="round"/><path d="M58 18c-8-2-12-7-12-11 7 0 12 5 12 11zM58 15c7-2 11-6 11-10-6 0-11 4-11 10z" fill="#8c9768"/></svg>',
  '<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#cfe3e4"/><circle cx="92" cy="14" r="7" fill="#f3d9a4"/><g fill="none" stroke="#6f9ea4" stroke-width="2.4" stroke-linecap="round"><path d="M4 30c8-5 16 5 24 0s16-5 24 0 16 5 24 0 16-5 24 0 16 5 24 0"/><path d="M-4 42c8-5 16 5 24 0s16-5 24 0 16 5 24 0 16-5 24 0 16 5 24 0"/></g><path d="M0 50c20-4 40 4 60 0s40-4 60 0v6H0z" fill="#efdcbc"/></svg>',
  '<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#ebe7df"/><g fill="#b8b0a3"><ellipse cx="26" cy="40" rx="16" ry="9"/><ellipse cx="62" cy="44" rx="20" ry="9"/><ellipse cx="98" cy="38" rx="14" ry="8"/></g><g fill="#cfc8bc"><ellipse cx="44" cy="28" rx="11" ry="6"/><ellipse cx="82" cy="26" rx="9" ry="5"/></g></svg>',
  '<svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#4b4b49"/><path d="M8 30h22M46 30h22M84 30h22" stroke="#e9e6df" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="28" r="15" fill="none" stroke="#e48aa1" stroke-width="4"/><path d="M49 39l22-22" stroke="#e48aa1" stroke-width="4" stroke-linecap="round"/></svg>',
];
const groundCta = () => `<button class="gr-cta" data-action="nav" data-to="ground"><img src="images/ground-roots.jpg" alt="" loading="lazy"><span><b>Ground yourself</b><small>Bare feet on the earth · 15 min</small></span>${icon('chevR', 16)}</button>`;
const habitsCta = () => `<button class="gr-cta" data-action="nav" data-to="habits"><img src="${carePhoto('lemon-water', 300) || 'images/tea-ginger.webp'}" alt="" loading="lazy"><span><b>Daily habits that help</b><small>Your checklist · small things, every day</small></span>${icon('chevR', 16)}</button>`;
function viewGround() {
  const info = M.info, ph = info && info.phase, P = ph && GROUND_PHASE[ph];
  const late = info && info.daysToPeriod <= 3 && !info.isPeriod, phd = P && (late && ph === 'luteal' ? P.d : P.d);
  const card = (id, title, d) => `<div class="gr-do"><div class="gr-do-h"><span class="dos-w">${icon('clock', 12)} ${d[3]}</span>${saveBtn(regTip(id, title, d, 'ground'))}</div><b>${d[0]}</b><ol><li>${d[1]}</li><li>${d[2]}</li></ol></div>`;
  const open = ui.grStudy;
  return `${topbar('Grounding', { back: true })}
  <div class="pad gr">
    <section class="gr-hero"><video class="dpt-vid" src="images/ground-cat.mp4" poster="images/ground-cat.webp" muted loop playsinline preload="none" aria-label="A ginger cat rolling happily in the warm dust"></video>
      <span class="gr-hero-t"><small>Earthing</small><b>Ground yourself</b><em>Bare skin on the earth. Your body takes on the ground’s calm, steady charge.</em></span>
      <span class="gr-hero-n"><b class="dotnum">15</b><small>min a day</small></span></section>

    ${sectionTitle('Try it now')}
    <section class="card gr-card">
      <div class="gr-flow">${[['Shoes off', 'Skin touches earth'], ['Stay 15 min', 'Phone away'], ['Breathe down', 'Feel your soles']].map(([a, b], i) => `<span><i>${i + 1}</i><b>${a}</b><small>${b}</small></span>`).join('<u></u>')}</div>
      ${card('ground-now', 'Grounding', GROUND_NOW)}
    </section>

    ${P ? `${sectionTitle(`For your ${PHASES[ph].name.toLowerCase()} phase`)}
    <section class="card gr-card gr-ph" style="--c:${PH_HEX[ph]}">
      <div class="gr-ph-h"><span class="gr-ph-dot"></span><b>${P.t}</b>${ph === 'menstrual' || late ? `<span class="gr-warm">${icon('thermo', 12)} Keep warm</span>` : ''}</div>
      ${card(`ground-${ph}`, `Grounding · ${PHASES[ph].name}`, phd)}
      <details class="gr-why"><summary>Why in this phase ${icon('chevD', 13)}</summary><p>${P.why}</p></details>
    </section>` : ''}

    ${sectionTitle('Where to stand')}
    <section class="card gr-card"><div class="gr-where">${GROUND_WHERE.map(([n, v, t], i) => `<div class="${v ? '' : 'no'}"><span class="gr-art">${GROUND_ART[i] || ''}</span><span class="gr-m" aria-label="${v ? `Connects ${v} of 3` : 'Blocks it'}">${[1, 2, 3].map(i => `<i class="${i <= v ? 'on' : ''}"></i>`).join('')}</span><b>${n}</b><small>${t}</small></div>`).join('')}</div></section>

    ${sectionTitle('Golden roots')}
    <section class="card gr-card gr-roots">
      <div class="gr-rart" aria-hidden="true"><svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice"><rect width="320" height="34" fill="#e9e2d2"/><rect y="34" width="320" height="86" fill="#3a2e22"/><path d="M0 34h320" stroke="#6c823e" stroke-width="3"/><g fill="#6c823e"><path d="M118 34c-2-8 1-14 3-16 0 6 1 11-1 16z"/><path d="M268 34c2-9-1-15-3-17 0 7-1 12 1 17z"/><path d="M220 34c-1-6 1-10 3-12 0 5 0 9-1 12z"/></g><circle cx="160" cy="22" r="9" fill="#304023"/><path d="M146 34c0-8 6-12 14-12s14 4 14 12z" fill="#304023"/><g class="gr-rl" fill="none" stroke="#e6b65a" stroke-linecap="round"><path stroke-width="3" d="M160 36c0 20-2 40 0 78"/><path stroke-width="2.4" d="M160 52c-14 8-30 14-52 34"/><path stroke-width="2.4" d="M160 56c16 8 32 16 50 36"/><path stroke-width="1.8" d="M128 70c-14 4-30 4-50 14"/><path stroke-width="1.8" d="M190 74c16 2 34 4 54 16"/><path stroke-width="1.4" d="M108 86c-8 8-14 16-16 26"/><path stroke-width="1.4" d="M210 92c6 8 10 14 12 22"/><path stroke-width="1.4" d="M160 84c-8 10-12 18-14 30"/></g></svg><span>Roots down</span></div>
      <ol class="gr-steps">${GROUND_ROOTS.steps.map(([a, b], i) => `<li><i>${i + 1}</i><span><b>${a}</b><small>${b}</small></span></li>`).join('')}</ol>
      <div class="gr-rt-f"><span class="dos-w">${icon('clock', 12)} ${GROUND_ROOTS.mins} min</span><span class="gr-rt-s">${saveBtn(regTip('ground-roots', 'Grounding · roots', GROUND_ROOTS.d, 'ground'))}</span></div>
      <p class="gr-fine">An old visualisation used in many traditions. Treat it as a calming practice.</p>
    </section>

    ${sectionTitle('What studies found')}
    <section class="card gr-card gr-st">${GROUND_STUDIES.map(([a, y, j, f, d], i) => `<button class="gr-s ${open === i ? 'on' : ''}" data-action="grStudy" data-i="${i}" aria-expanded="${open === i}"><span class="gr-y">${y}</span><span class="gr-s-t"><b>${f}</b><small>${a} · ${j}</small></span>${icon('chevD', 14)}</button>${open === i ? `<p class="gr-s-d">${d}</p>` : ''}`).join('')}
      <p class="gr-caution">${icon('spark', 13)} ${GROUND_CAUTION}</p></section>
  </div>`;
}
function viewSaved() {
  const L = state.savedTips || [];
  return `${topbar('Saved tips', { back: true })}
  <div class="pad sv">
    <p class="sv-lead">${L.length ? `${L.length} ${L.length === 1 ? 'tip' : 'tips'} you can use any day. Tap the bookmark to remove one.` : 'Tap the bookmark on any tip and it lands here, ready to use.'}</p>
    ${L.length ? L.slice().reverse().map(x => `<section class="card sv-c">
      <div class="sv-h"><span class="sv-t">${x.t}</span>${saveBtn(x.id)}</div>
      <b class="sv-a">${x.a}</b>
      <ol class="sv-s">${x.s.map((st, i) => `<li><span>${i + 1}</span>${st}</li>`).join('')}</ol>
      <div class="sv-f"><span class="dos-w">${icon('clock', 12)} ${x.w}</span>${x.to ? `<button class="link" data-action="nav" data-to="${x.to}">Why it helps ${icon('chevR', 12)}</button>` : ''}</div>
    </section>`).join('') : `<div class="sv-empty">${icon('save', 30, 1.4)}<b>Nothing saved yet</b><small>Tips on Today and across the app each have a bookmark.</small><button class="btn btn-dark" data-action="nav" data-to="today">See today’s tips</button></div>`}
  </div>`;
}
// Articles to read around today's tips: this phase first, then what she wants help with.
const ARTICLE_PHOTO = { 'skin-cycle': 'Testosterone', estrogen: 'Oestrogen', 'progesterone-pms': 'Progesterone', iron: 'Active vitamin D', 'yin-yang': 'Thyroid hormones', 'seed-cycling': 'Insulin', 'four-phases': 'LH', brain: 'Serotonin', sleep: 'Melatonin', 'ovulation-signs': 'FSH' };
const FOCUS_READS = {
  sleep: { to: 'rhythm', k: 'Sleep & light', t: 'Why your body follows the sun', m: '6 min read', photo: 'Melatonin' },
  pms: { to: 'relief', k: 'PMS & cramps', t: 'Gentle relief for every symptom', m: 'Guide', photo: 'Progesterone' },
  eat: { to: 'season', k: 'Food', t: 'What’s in season for your cycle', m: 'Guide', photo: 'Insulin' },
  energy: { to: 'move', k: 'Energy', t: 'When to train hard and when to rest', m: 'Guide', photo: 'Adrenaline' },
  mood: { to: 'rhythm', k: 'Mood', t: 'Sun, people & your mood', m: '6 min read', photo: 'Serotonin' },
  hormones: { to: 'hormones', k: 'Hormones', t: 'What each hormone does', m: 'Guide', photo: 'Oestrogen' },
  skin: { to: 'season', k: 'Skin', t: 'Seasonal foods for your skin', m: 'Guide', photo: 'Active vitamin D' },
  tcm: { to: 'plan', k: 'Chinese medicine', t: 'Your inner season & element', m: 'Guide', photo: 'Thyroid hormones' },
};
// ---------- the letter: a swipeable read on Today, a new one on top every time she opens the app ----------
const PIC = { hormone: hormonePhoto, care: carePhoto, food: foodPhoto };
// Topic-matched Unsplash photos for every read (free licence), so the picture says what it's about.
const READ_PHOTO = { 'letter-01': '1581714161666-dade083654ae', 'letter-02': '1564020435666-f67ed5319a32', 'letter-03': '1590779032260-5623d6774f7a',
  'letter-04': '1552916016-9cbd0be0f03e', 'letter-05': '1613578519724-22fdb5d06388', 'letter-06': '1626711245920-92866962c63a', 'letter-07': '1692029861107-991b13db6ad0',
  'letter-08': '1634463278803-f9f71890e67d', 'letter-09': '1506784983877-45594efa4cbe', 'letter-10': '1603572298498-848f70a46d29', 'letter-11': '1779338325364-0af4b2290b66',
  'letter-12': '1640331703778-9aac4d988e26', 'four-phases': '1787822976738-d44fa2a85e4f', estrogen: '1544507888-56d73eb6046e', 'progesterone-pms': '1614088685112-0a760b71a3c8',
  'yin-yang': '1745864709009-457569a2aed1', iron: '1588168333986-5078d3ae3976', 'seed-cycling': '1651241587503-a874db54a1a7', brain: '1491975474562-1f4e30bc9468',
  sleep: '1522587750645-7e0e798b2b59', 'ovulation-signs': '1594790628624-9e563bea851d' };
const READ_LOCAL = { 'four-phases': 'images/read-seasons.webp', 'letter-09': 'images/read-lilies.webp', 'eat-cycle': 'images/season-veg.webp', 'train-cycle': 'images/move-lift.webp', bloating: 'images/tea-ginger.webp' }; // our own photos: lilies opening, bud to bloom, like a cycle
function readPic(x, w = 900) {
  if (READ_LOCAL[x.id]) return READ_LOCAL[x.id];
  const u = READ_PHOTO[x.id]; if (u) return `https://images.unsplash.com/photo-${u}?w=${w}&h=${Math.round(w * 1.3)}&fit=crop&auto=format&q=70`;
  return x.pic ? PIC[x.pic[0]](x.pic[1], w) : ARTICLE_PHOTO[x.id] ? hormonePhoto(ARTICLE_PHOTO[x.id], w) : '';
}
// What a read is about, for its chip: the letter's topic, or the phase, or Basics.
const readTopic = x => x.tag || (x.phase ? PHASES[x.phase].name : 'Basics');
const READS = () => [...LETTERS, ...ARTICLES];
const OPENS = (() => { let n = 0; try { n = +(localStorage.getItem('uts.opens') || 0) + 1; localStorage.setItem('uts.opens', n); } catch { /* storage off */ } return n; })();
let opensNow = OPENS;
function readsCard(info) {
  const m = new Date().getMonth() + 1, read = state.read || {};
  const letter = LETTERS.find(l => l.month === m);
  const past = LETTERS.filter(l => l.month < m).reverse();
  const arts = [...ARTICLES].sort((a, b) => { const sc = x => x.phase === info.phase ? 2 : x.phase ? 0 : 1; return sc(b) - sc(a); });
  let rest = [...arts, ...past].sort((a, b) => !!read[a.id] - !!read[b.id]);
  const k = rest.length ? opensNow % rest.length : 0; rest = [...rest.slice(k), ...rest.slice(0, k)];
  const list = (letter && !read[letter.id] ? [letter, ...rest] : [...rest.slice(0, 1), ...(letter ? [letter] : []), ...rest.slice(1)]).slice(0, 8);
  const tag = x => x.month ? `Letter · ${MONTHS[x.month - 1]}` : x.phase ? `${PHASES[x.phase].name} phase` : 'Basics';
  return `${sectionTitle('Read', ['All reads', 'learn'])}
    <div class="lt-track deck" data-dots="lt-dots">${list.map(x => { const u = readPic(x); return `<button class="lt" data-action="nav" data-to="article/${x.id}">
      ${u ? `<img src="${u}" alt="" loading="lazy">` : glowArt('wave', 3)}<span class="lt-shade"></span>
      <span class="lt-tag">${tag(x)}${!read[x.id] ? '<i>new</i>' : ''}</span>
      <span class="lt-b"><b>${x.title}</b>${x.lead ? `<small>${x.lead}</small>` : ''}<span class="lt-cta">${icon('book', 14)} Read · ${x.mins} min</span></span></button>`; }).join('')}</div>
    <div class="lt-dots" id="lt-dots">${list.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
}
document.addEventListener('scroll', e => { const t = e.target; if (t.classList?.contains('deck')) deckFx(t); }, true);
// The plate draws itself in when it scrolls into view.
const plIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); plIO.unobserve(e.target); } }), { threshold: .35 }) : null;
new MutationObserver(() => { document.querySelectorAll('.deck').forEach(deckFx); document.querySelectorAll('.pl-anim:not(.in)').forEach(el => { if (plIO) plIO.observe(el); setTimeout(() => el.classList.add('in'), plIO ? 8000 : 0); }); }).observe(document.getElementById('app'), { childList: true, subtree: false });
// coming back to the app after a while counts as a new open: the next read moves to the front
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 10 * 60 * 1000) { opensNow++; if (route().name === 'today') render(); } });
function conceiveCard(info) {
  if (!ttc()) return '';
  const today = C.startOfDay(new Date()), start = C.addDays(info.cycleStart, info.ov - 6), peak1 = C.addDays(info.cycleStart, info.ov - 3), ovd = C.addDays(info.cycleStart, info.ov - 1);
  const inWin = info.cd >= info.ov - 5 && info.cd <= info.ov, d2 = C.diffDays(start, today);
  const u = hormonePhoto('Prolactin', 800);
  return `<section class="conceive">${u ? `<img src="${u}" alt="">` : ''}<span class="cv-shade"></span><div class="cv-in">
    <div class="eyebrow">Fertile window</div>
    <h3>${inWin ? (info.cd >= info.ov - 2 ? 'Your best days are now' : 'Your fertile window is open') : d2 > 0 ? `Opens in ${plural(d2, 'day')}` : 'Next window next cycle'}</h3>
    <p>${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(ovd, { month: 'short', day: 'numeric' })} · best: ${fmt(peak1, { month: 'short', day: 'numeric' })} – ${fmt(ovd, { month: 'short', day: 'numeric' })}</p>
    <div class="cv-bar">${Array.from({ length: 6 }, (_, i) => { const d = info.ov - 5 + i; return `<i class="${d >= info.ov - 2 ? 'peak' : ''} ${d === info.cd ? 'now' : ''}"></i>`; }).join('')}</div>
    <small>Sex every 1–2 days in this window gives the best chance. Estimates: an ovulation test confirms your real day.</small></div></section>`;
}

// ---------- flowing cycle hero (dark, liquid rings, glowing phase arc, today orb) ----------
function ringSub(info) {
  return info.late ? `Period ${plural(info.late, 'day')} late`
    : info.dueToday ? 'Period expected today'
    : info.isPeriod || info.cd <= info.P ? `Period · day ${info.cd}`
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
      <linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="${col}"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/></linearGradient>
      <filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="${id}-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
    </defs>
    <circle cx="${c}" cy="${c}" r="${R - 8}" fill="url(#${id}-bg)" class="fh-breathe"/>
    <g class="fh-flow f1"><path d="${liquid(R - 16, 5, 3, 0, 2.5, 7)}" stroke="hsl(calc(var(--hb) + 103 * var(--hk)) calc(41% * var(--hs2)) 68%)" stroke-opacity=".32" fill="none" stroke-width="1"/></g>
    <g class="fh-flow f2"><path d="${liquid(R + 12, 4, 5, 1.3, 2, 2)}" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-opacity=".22" fill="none" stroke-width="1"/></g>
    <g class="fh-flow f3"><path d="${liquid(R - 28, 6, 4, 2.1, 3, 9)}" stroke="#ffffff" stroke-opacity=".12" fill="none" stroke-width="1"/></g>
    <circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#fff" stroke-opacity=".06"/>
    ${arcs}
    ${showOv ? `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><ellipse rx="3.4" ry="4.2" fill="#f4f5f0" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="1"/></g>` : ''}
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="16" fill="${col}" opacity=".25" class="fh-halo"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7.5" fill="#fff" filter="url(#${id}-glow)"/>
  </svg>`;
}
const PHASE_WELCOME = {
  menstrual: { feel: 'Quieter and more inward. Rest is productive now.', soak: 'warm soups, red meat & red dates, ginger tea, heat on your belly.' },
  follicular: { feel: 'Lighter, curious and motivated as estrogen rises.', soak: 'fresh greens, eggs, citrus. And new ideas.' },
  ovulatory: { feel: 'Confident, social and glowing. Your peak energy.', soak: 'raw salads, berries, oysters, sunshine and good company.' },
  luteal: { feel: 'Grounded at first, then more sensitive before your period.', soak: 'sweet potato, roots, magnesium, dark chocolate, early nights.' },
};
function flowHero(info, { eyebrow, title, season, stats = [], badge = '', id = 'fr', showOv = true, center, action = '', pills = [] } = {}) {
  return `<section class="fhero ${pills.length ? 'oura' : ''}">
    ${pills.length ? `<div class="fh-pills">${pills.map(([v, k, to]) => `<button class="fh-pill" ${to ? `data-action="nav" data-to="${to}"` : ''}><b>${v}</b><small>${k}</small></button>`).join('')}</div>` : ''}
    <div class="fh-aurora"><i></i><i></i><i></i></div>
    <div class="fh-top"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h2 class="fh-phase">${title}</h2><div class="fh-season">${season}</div></div>${badge}</div>
    <div class="fh-ring"><div class="fh-liquid" aria-hidden="true"><i></i><i></i><i></i></div>${flowRing(info, id, showOv)}
      <div class="fh-center"><span class="fh-k">Cycle day</span><span class="fh-day">${Math.min(info.cd, info.L)}</span><span class="fh-sub">${center || ringSub(info)}</span></div></div>
    ${stats.length ? `<div class="fh-stats">${stats.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}
    ${action}
  </section>`;
}

// ---------- SVG: hormone cycle chart (interactive) ----------
const HORMONES = [
  { key: 'estrogen', name: 'Estrogen', color: '#e0457b', w: 3 },
  { key: 'progesterone', name: 'Progesterone', color: '#3f8a2e', w: 3 },
  { key: 'testosterone', name: 'Testosterone', color: '#e8590c', w: 2.6 },
];
const BAND = { menstrual: 'rgba(224,69,123,.1)', follicular: 'rgba(63,138,46,.08)', ovulatory: 'rgba(230,170,30,.14)', luteal: 'rgba(120,90,200,.09)' };

function chartGeom(L, compact) {
  const W = 360, H = compact ? 200 : 290;
  const top = compact ? 10 : 52, bot = H - (compact ? 24 : 44);
  const x0 = 4, x1 = W - 4;
  const X = t => x0 + (t - 1) / L * (x1 - x0);
  const Y = v => bot - 10 - v * (bot - top - 34);
  return { W, H, top, bot, X, Y };
}
function cycleChart(info, { id = 'cc', compact = false, who = 'You' } = {}) {
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
        <linearGradient id="${id}-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0457b" stop-opacity=".16"/><stop offset="1" stop-color="#e0457b" stop-opacity="0"/></linearGradient>
      </defs>
      ${bands}
      <path d="${area}" fill="url(#${id}-area)" class="area ${ui.hidden.estrogen ? 'off' : ''}"/>
      ${curves}
      ${(() => { const ov = C.ovulationDay(L, P), ex = X(ov + 0.5), t = `Egg release · day ${ov}`, pw = t.length * 5.3 + 18, near = Math.abs(cd - ov) <= 4, px = Math.max(pw / 2 + 2, Math.min(W - pw / 2 - 2, near ? (cd >= ov ? ex - pw / 2 - 18 : ex + pw / 2 + 18) : ex)), py = top + 11, ey = bot - 12;
        return `<g class="egg-mark"><title>LH surge → egg release · day ${ov}</title>
        <line class="egg-line" x1="${ex.toFixed(1)}" y1="${top + 4}" x2="${ex.toFixed(1)}" y2="${ey - 8}"/>
        <g transform="translate(${ex.toFixed(1)} ${ey})"><circle class="egg-halo" r="10"/><ellipse class="egg-shell" rx="5" ry="6.4" cy="-.4"/><circle class="egg-yolk" r="2.3" cy=".6"/></g></g>`; })()}
      <g class="here">
        <line x1="${mx}" x2="${mx}" y1="${top + 4}" y2="${bot - 4}" stroke="#fff" stroke-opacity=".55" stroke-dasharray="2 4"/>
        <circle cx="${mx}" cy="${my}" r="12" fill="#fff" opacity=".18" class="pulse"/>
        <circle cx="${mx}" cy="${my}" r="5.5" fill="#fff"/>
        <g transform="translate(${Math.min(Math.max(mx, 34), W - 34)} ${top + 16})">
          <rect x="-30" y="-11" width="60" height="22" rx="11" fill="#fff"/>
          <text y="4" text-anchor="middle" class="here-label">${who.toUpperCase()} · ${cd}</text>
        </g>
      </g>
      <g class="scrub" style="opacity:0">
        <line class="s-line" y1="${top + 4}" y2="${bot - 4}" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="1.2"/>
        <circle class="s-dot" r="6" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/>
      </g>
      <rect class="hit" x="0" y="${top}" width="${W}" height="${bot - top}" fill="transparent"/>
    </svg>
    <div class="legend ${compact ? 'static' : ''}">${HORMONES.map(h => `<${compact ? 'span' : `button data-action="toggleHormone" data-h="${h.key}"`} class="lg ${ui.hidden[h.key] ? 'off' : ''}"><svg width="22" height="8"><line x1="1" y1="4" x2="21" y2="4" stroke="${h.color}" stroke-width="${h.w}" stroke-linecap="round" ${h.dash ? `stroke-dasharray="${h.dash}"` : ''}/></svg>${h.name}</${compact ? 'span' : 'button'}>`).join('')}<span class="lg egg-lg"><svg class="egg-ic" viewBox="-7 -8 14 16" width="12" height="14" aria-hidden="true"><ellipse rx="5" ry="6.4" cy="-.4" fill="#fff" stroke="#c9961a" stroke-width="1.6"/><circle r="2.3" cy=".6" fill="#e8b52c"/></svg>Egg release</span></div>
    <div class="readout" id="${id}-read">${readout(info.cd, L, P, info.cd === cd ? true : false)}</div>
  </div>`;
}
// One drawn arrow per level: up for high and peak, flat for moderate, down for low.
const trArrow = tr => `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform:rotate(${tr === 'rising' ? -40 : tr === 'falling' ? 40 : 0}deg)"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>`;
function readout(cdRaw, L, P, isYou) {
  const cd = Math.min(cdRaw, L);
  const ph = C.phaseFor(cd, L, P), h = C.hormonesRel(cd, L, P), tcm = TCM[ph];
  // which way each hormone is heading: today against tomorrow in the model (after the last day the next cycle starts)
  const nx = C.hormonesRel(cd >= L ? 1 : cd + 1, L, P);
  const rows = HORMONES.map(x => {
    return `<div class="ro-row"><span class="ro-name"><svg width="16" height="8"><line x1="1" y1="4" x2="15" y2="4" stroke="${x.color}" stroke-width="2.2" stroke-linecap="round" ${x.dash ? `stroke-dasharray="${x.dash}"` : ''}/></svg>${x.name}</span>
      <span class="ro-bar"><b style="width:${Math.max(6, Math.round(h[x.key] * 100))}%;background:${x.color}"></b></span>
      <span class="ro-lvl">${(() => { const lv = C.hormoneLevel(h[x.key]), d = /High|Peak/.test(lv) ? 'rising' : lv === 'Low' ? 'falling' : 'steady'; return `${lv} <em class="tr ${d}" aria-hidden="true">${trArrow(d)}</em>`; })()}</span></div>`;
  }).join('');
  return `<div class="ro-head"><div class="ro-phase">Day ${cdRaw} · ${PHASES[ph].name}</div></div>
    <div class="ro-rows">${rows}</div>
    ${(() => { const ov = C.ovulationDay(L, P), d = ov - cd; return `<div class="ro-egg"><svg class="egg-ic" viewBox="-7 -8 14 16" width="12" height="14" aria-hidden="true"><ellipse rx="5" ry="6.4" cy="-.4" fill="#fff" stroke="#c9961a" stroke-width="1.6"/><circle r="2.3" cy=".6" fill="#e8b52c"/></svg>${d === 0 ? 'Egg release today' : d === 1 ? 'Egg release tomorrow' : d > 1 ? `Egg release in ${d} days · day ${ov}` : `Egg released on day ${ov}`}</div>`; })()}`;
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
    <radialGradient id="ga${seed}" cx="50%" cy="65%" r="60%"><stop offset="0" stop-color="hsl(calc(var(--hb) + 74 * var(--hk)) calc(82% * var(--hs)) 83%)"/><stop offset=".35" stop-color="hsl(calc(var(--hb) + 81 * var(--hk)) calc(56% * var(--hs2)) 66%)"/><stop offset=".75" stop-color="hsl(calc(var(--hb) + 100 * var(--hk)) calc(36% * var(--hs2)) 35%)" stop-opacity=".6"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 107 * var(--hk)) calc(33% * var(--hs2)) 14%)" stop-opacity="0"/></radialGradient>
    <filter id="gb${seed}"><feGaussianBlur stdDeviation="7"/></filter></defs>
    <path d="${shapes[shape] || shapes.orb}" fill="url(#ga${seed})" filter="url(#gb${seed})"/></svg>`;
}

// ---------- views ----------
const ONB_ART = {
  hello: '<circle cx="110" cy="70" r="26"/><path d="M60 175 C62 128 84 108 110 108 C136 108 158 128 160 175"/><circle cx="110" cy="110" r="78" opacity=".25" stroke-dasharray="3 7"/><circle cx="178" cy="44" r="3"/><circle cx="40" cy="60" r="2"/>',
  moon: '<circle cx="110" cy="100" r="40"/><path d="M110 60 A40 40 0 0 1 110 140 A26 40 0 0 0 110 60Z" fill="currentColor" fill-opacity=".2"/><ellipse cx="110" cy="100" rx="92" ry="30" opacity=".35" transform="rotate(-18 110 100)"/><circle cx="196" cy="70" r="5"/><circle cx="30" cy="132" r="3"/><circle cx="60" cy="30" r="1.8"/><circle cx="170" cy="168" r="2"/>',
  drop: '<path d="M110 30 C90 70 72 92 72 118 a38 38 0 0 0 76 0 C148 92 130 70 110 30Z"/><circle cx="110" cy="118" r="62" opacity=".25" stroke-dasharray="3 7"/><path d="M96 124 a14 14 0 0 0 14 14" opacity=".6"/>',
  ring: '<circle cx="110" cy="100" r="62" opacity=".3"/>' + Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(110 + 62 * Math.cos(a)).toFixed(1)}" cy="${(100 + 62 * Math.sin(a)).toFixed(1)}" r="${i === 13 ? 5 : 2}"/>`; }).join('') + '<path d="M110 38 A62 62 0 0 1 172 100" stroke-width="4"/>',
};
// default profile silhouette (head + shoulders) — used before someone adds a photo
const AVATAR_SVG = `<svg class="avatar-sil" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="currentColor" opacity=".16"/><circle cx="50" cy="40" r="17" fill="currentColor" opacity=".9"/><path d="M18 100 C18 78 32 66 50 66 C68 66 82 78 82 100Z" fill="currentColor" opacity=".9"/></svg>`;
function onbArt(k) { return `<div class="onb-art"><svg viewBox="0 0 220 200" aria-hidden="true"><defs><filter id="og-${k}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" filter="url(#og-${k})">${ONB_ART[k]}</g></svg></div>`; }
const hormonalBC = k => !!BIRTH_CONTROL.find(b => b.k === k && b.h);
// which issues the 90-day plan covers, from the onboarding answers or the saved profile
function planKeys(p) {
  const k = [];
  if (hormonalBC(p.bc) && p.bcPlan !== 'stay') k.push('offpill');
  else if (p.noPeriod && !hormonalBC(p.bc)) k.push('comeback');
  (p.focus && p.focus.length ? p.focus : ['hormones', 'energy', 'eat']).forEach(f => ROADMAP[f] && !k.includes(f) && k.push(f));
  if (k.length < 3 && !k.includes('hormones')) k.push('hormones');
  return k;
}
// "Research-backed results in 90 days": a winding thread of the results she picked, then the month-by-month plan
function roadmapHTML(...a) { return deEmoji(roadmapRaw(...a)); }
function roadmapRaw(keys, name, day) {
  const H = 62, n = keys.length, X = [42, 58];
  const pts = keys.map((k, i) => [X[i % 2] * 3, i * H + H / 2]);
  const d = pts.map(([x, y], i) => i ? `C ${pts[i - 1][0]} ${y - H / 2}, ${x} ${pts[i - 1][1] + H / 2}, ${x} ${y}` : `M ${x} ${y}`).join(' ');
  const m = ui.rmM ?? (day ? Math.min(2, Math.floor((day - 1) / 30)) : 0);
  const stay = hormonalBC((state && state.profile) ? state.profile.bc : ui.onb.bc) && ((state && state.profile) ? state.profile.bcPlan : ui.onb.bcPlan) === 'stay';
  return `<div class="rm rm2">
    <header class="rm2-hero"><span class="rm2-orb" aria-hidden="true"></span>
      <p>${name ? `${esc(name)}, with` : 'With'} daily use, here’s what we expect you to reach</p>
      <h2>Research-backed<br>results <em>in</em> 90 days</h2>${day ? `<span class="rm-day">Day <b>${day}</b> of 90</span>` : ''}</header>
    <div class="rm-thread" style="height:${n * H}px">
      <svg viewBox="0 0 300 ${n * H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>
      ${keys.map((k, i) => `<div class="rm-node ${i % 2 ? 'r' : 'l'}" style="top:${i * H + H / 2}px;left:${X[i % 2]}%;--i:${i}"><i></i><span>${ROADMAP[k].o}</span></div>`).join('')}
    </div>

    <section class="rm2-glow">
      <div class="rm2-k">The goal</div>
      <h3>You will be <em>glowing</em></h3>
      <p class="rm2-sub">When your hormones are fed, rested and in rhythm, it shows on your face, skin and hair.</p>
      <div class="rm2-gg">${GLOW_RESULTS.map(r => `<div class="rm2-gc"><span>${r.g}</span><b>${r.t}</b><p>${r.s}</p>${evBadge(r.ev)}</div>`).join('')}</div>
    </section>

    <section class="rm2-how">
      <div class="rm2-k">The method</div>
      <h3>How we get you there</h3>
      <div class="rm2-tabs" role="tablist">${PLAN_METHOD.map((p, i) => `<button class="${i === m ? 'on' : ''}" data-action="rmMonth" data-v="${i}" role="tab"><span>${p.g}</span><b>${p.k}</b><small>${p.d}</small></button>`).join('')}</div>
      ${PLAN_METHOD.map((p, i) => `<div class="rm2-month" ${i === m ? '' : 'hidden'}>
        <p class="rm2-line">${p.line}</p>
        <ol class="rm2-pts">${p.pts.map(([g, t, x]) => `<li><span>${g}</span><div><b>${t}</b><p>${x}</p></div></li>`).join('')}</ol>
        <div class="rm2-k sm">For your goals</div>
        <div class="rm-steps">${keys.map(k => `<div class="rm-step"><span class="rm-g">${ROADMAP[k].g}</span><div><b>${ROADMAP[k].t}</b><p>${ROADMAP[k].m[i]}</p></div></div>`).join('')}</div>
      </div>`).join('')}
    </section>

    <section class="rm2-res">
      <div class="rm2-k">The science</div>
      <h3>What research shows</h3>
      <p class="rm2-sub">Tap a study to read more.</p>
      <div class="rm2-wall">${RESEARCH_WALL.map((r, i) => `<button class="rm2-st ${r.big ? 'big' : ''}" data-action="rmFlip" style="--i:${i}">
        <span class="rm2-n">${r.n}</span><span class="rm2-t">${r.t}</span><span class="rm2-more">${r.more}</span>
        <span class="rm2-src">${evBadge(r.ev)}<small>${r.src}</small></span></button>`).join('')}</div>
      <div class="rm2-goals">${keys.map(k => `<p>${ROADMAP[k].g} ${ROADMAP[k].r} ${evBadge(ROADMAP[k].ev)}</p>`).join('')}</div>
    </section>
    ${stay ? '<p class="fine">On hormonal birth control your hormones stay level, so your phases here are estimates of a natural cycle. Your plan for skin, body, sleep and mood still works.</p>' : ''}
  </div>`;
}
// Onboarding step 9: the plan as a funnel. Her results, our founder's before & after, the research it rests on, then the three months.
const O9_STUDIES = [
  { n: '29.3', u: 'days', t: 'The real average cycle across 600,000 cycles. Only 13% were 28 days, so your plan follows yours.', cite: 'Bull et al. 2019', j: 'npj Digital Medicine', ev: 'strong' },
  { n: '48', u: '%', t: 'Fewer PMS symptoms with 1,200 mg of calcium a day, within three cycles.', cite: 'Thys-Jacobs et al. 1998', j: 'Am J Obstet Gynecol', ev: 'strong' },
  { n: '6', u: 'weeks', t: 'Of more fruit and vegetables gave faces a visibly healthier, golden glow.', cite: 'Whitehead et al. 2012', j: 'PLoS ONE', ev: 'some' },
  { n: '12', u: 'weeks', t: 'On a low-sugar diet cut acne spots in a controlled trial.', cite: 'Smith et al. 2007', j: 'Am J Clin Nutr', ev: 'some' },
];
const O9_ALWAYS = ['Balanced hormones', 'Eating with your cycle', 'Ancient Eastern medicine for every phase', 'Your own tea guide', 'Living with your hormones, not against them'];
const O9_JOURNALS = ['npj Digital Medicine', 'Am J Obstet Gynecol', 'PLoS ONE', 'Am J Clin Nutr', 'BMJ', 'Br J Sports Med', 'Obstetrics & Gynecology'];
const laurel = side => `<svg class="o9-laurel ${side}" viewBox="0 0 14 30" aria-hidden="true"><path d="M11 29 C 4 24, 2 14, 6 2" fill="none"/>${[[5, 24, -40], [3.4, 18, -25], [3, 12, -10], [4.4, 6.5, 8]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="3.6" transform="rotate(${r} ${x} ${y})"/>`).join('')}</svg>`;
// Her own hormone curve, drawn from what she just told us (cycle length, period length, last period).
function onbHormones() {
  const o = ui.onb, L = o.unsure ? 28 : (+o.cycleLength || 28), P = +o.periodLength || 5;
  const ago = o.last ? C.diffDays(new Date(), C.parseISO(o.last)) : (+o.ago || 0);
  const cd = o.noPeriod ? 1 : ((ago % L) + L) % L + 1, ph = (C.phaseRanges(L, P).find(r => cd >= r.from && cd <= r.to) || {}).key || 'menstrual';
  return `<section class="o9-card o9-hp">
      <h3>Your <em>hormones</em></h3>
      <p class="o9-sub">${o.noPeriod ? 'How a natural cycle moves. Your plan follows it as soon as your period is back.' : `Your ${L}-day cycle. You’re on day ${cd}, in your ${PHASES[ph].name.toLowerCase()} phase.`}</p>
      ${cycleChart({ L, P, cd, phase: ph }, { id: 'onb9', compact: true })}
      <div class="o9-sl"><input type="range" class="o9-day" min="1" max="${L}" value="${cd}" data-l="${L}" data-p="${P}" data-you="${cd}" style="--p:${((cd - 1) / (L - 1) * 100).toFixed(1)}%" aria-label="Slide through your cycle, day by day">
        <div class="o9-sl-ends"><span>Day 1</span><span>Slide through your cycle</span><span>Day ${L}</span></div></div>
      <div class="o9-live" aria-live="polite">${o9Live(cd, L, P, cd)}</div>
    </section>`;
}
// the live part of the onboarding hormone panel: which day, which phase, each hormone's level and what it feels like
const O9_HMEAN = { estrogen: ['energy, confidence and glow', 'mood lifting, skin softening', 'quieter, softer energy'], progesterone: ['calm, warmth and a need for rest', 'winding down, getting cosy', 'light and quick'], testosterone: ['drive and desire', 'a little spark', 'gentle drive'] };
function o9Live(cd, L, P, you) {
  const ph = C.phaseFor(cd, L, P), h = C.hormonesRel(cd, L, P), P_ = PHASES[ph];
  return `<div class="o9-lh"><b>Day ${cd}${cd === you ? ' <i>· today</i>' : ''}</b><span class="o9-chip ${ph}">${P_.name} · ${P_.season}</span></div>
    <div class="o9-lv">${HORMONES.map(x => { const lv = C.hormoneLevel(h[x.key]), m = /High|Peak/.test(lv) ? 0 : lv === 'Moderate' ? 1 : 2;
      return `<div class="o9-lr"><span class="o9-ln"><i style="background:${x.color}"></i>${x.name}</span><span class="o9-lb"><b style="width:${Math.max(4, Math.round(h[x.key] * 100))}%;background:${x.color}"></b></span><em>${lv}</em><small>${O9_HMEAN[x.key][m]}</small></div>`; }).join('')}</div>
    <p class="o9-feel"><b>${P_.superpower.title}.</b> ${P_.superpower.text}</p>`;
}
function onbPlanHTML(keys, name) {
  const badges = O9_JOURNALS.map(j => `<span class="o9-j">${laurel('l')}<b>${j}</b>${laurel('r')}</span>`).join('');
  return `<div class="o9">
    <section class="o9-hero">
      <h2>${name ? `${esc(name)}, your plan` : 'Your plan'}<br>is <em>ready</em></h2>
      <p>Built around your goals and your own cycle.</p>
      <figure class="o9-lily"><img src="images/read-lilies.webp" alt="A lily opening from bud to full bloom" loading="lazy">
        <ol>${[['Day 1', 'Start'], ['Day 30', 'Reset'], ['Day 60', 'Rebuild'], ['Day 90', 'Glow']].map(([d, t]) => `<li><b>${d}</b><small>${t}</small></li>`).join('')}</ol></figure>
      <ul class="o9-goals">${[...new Set([...keys.map(k => ROADMAP[k].o), ...O9_ALWAYS])].map(t => `<li><span>${icon('check', 13, 2.6)}</span>${t}</li>`).join('')}</ul>
    </section>

    <section class="o9-card o9-ba">
      <h3>It worked for <em>our founder</em></h3>
      <div class="o9-cmp" style="--x:50%">
        <img src="images/ba-slide-before.jpg" alt="Our founder before, running at the same pace every day">
        <img class="o9-after" src="images/ba-slide-after.jpg" alt="Our founder after 1 year of living with her hormones">
        <span class="o9-tag b">Before</span><span class="o9-tag a">After 1 year</span>
        <span class="o9-hand" aria-hidden="true">${icon('chevL', 13, 2.6)}${icon('chevR', 13, 2.6)}</span>
        <input class="o9-range" type="range" min="0" max="100" value="50" aria-label="Slide between before and after">
      </div>
      <ul class="o9-honest"><li>${icon('check', 12, 2.8)}No filter</li><li>${icon('check', 12, 2.8)}No makeup</li><li>${icon('check', 12, 2.8)}No surgery</li><li>${icon('check', 12, 2.8)}Same angle</li></ul>
    </section>

    <section class="o9-card o9-sci">
      <h3>Backed by <em>research</em></h3>
      <p class="o9-sub">Every step in your plan comes from studies published in</p>
      <div class="o9-marq" aria-label="${O9_JOURNALS.join(', ')}"><div>${badges}${badges}</div></div>
      <ol class="o9-st">${O9_STUDIES.map(x => `<li><span class="o9-n"><b>${x.n}</b><small>${x.u}</small></span><div><p>${x.t}</p><small>${x.cite} · <i>${x.j}</i> ${evBadge(x.ev)}</small></div></li>`).join('')}</ol>
    </section>

    ${onbHormones()}
  </div>`;
}
const planDay = () => { const p = state.profile; return p.planStart ? C.diffDays(M.today, C.parseISO(p.planStart)) + 1 : 0; };
// ---------- promise, how to follow, before & after ----------
// Before & after photos stay on this phone only: their own storage key, never in the synced state.
const BA_KEY = 'rhythm.ba';
function baGet() { try { return JSON.parse(localStorage.getItem(BA_KEY)) || {}; } catch (e) { return {}; } }
function baSet(v) { try { localStorage.setItem(BA_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
const BA_METRICS = [
  ['PMS mood days', l => (l.moods || []).some(m => ['Irritable', 'Mood swings', 'Anxious', 'Low mood', 'Sad', 'Tearful', 'Angry', 'Stressed'].includes(m)), 'down'],
  ['Cramp days', l => (l.symptoms || []).includes('Cramps'), 'down'],
  ['Breakout days', l => (l.symptoms || []).includes('Acne'), 'down'],
  ['Bloated days', l => (l.symptoms || []).includes('Bloating'), 'down'],
  ['Tired days', l => (l.symptoms || []).includes('Fatigue'), 'down'],
];
function promiseHTML(day) {
    return `${sectionTitle('Our founder’s before & after')}
    <section class="card glass fba"><div class="ba-pair">
      <figure><img src="images/ba-founder-before.jpg" alt="The founder before, living against her cycle" loading="lazy"><figcaption><b>Before</b><small>Running at the same pace every day</small></figcaption></figure>
      <figure><img src="images/ba-founder-after.jpg" alt="The founder after, living with her hormones" loading="lazy"><figcaption><b>After</b><small>Living with my hormones</small></figcaption></figure></div>
      <p class="fba-p">Clearer skin, calmer face, more glow. One woman’s story, not a promise.</p>
      <button class="link fba-go" data-action="nav" data-to="relief/Face%20fascia">How to release face fascia ${icon('chevR', 12)}</button></section>
    ${sectionTitle('Shades of living with your hormones')}
    ${paletteHTML()}`;
}
function paletteHTML() {
  const sel = ui.shade ?? -1, x = SHADES[sel];
  return `<section class="pal"><div class="pal-grid">${SHADES.map((h, i) => `<button class="pan ${h.tex} ${i === sel ? 'on' : ''}" style="--pc:${h.c}" data-action="shade" data-i="${i}" aria-pressed="${i === sel}">
      <span class="pan-n">${h.n}</span><span class="pan-t">${h.t}</span><span class="pan-name">${h.name}</span></button>`).join('')}</div>
    ${x ? `<div class="pal-sw" style="--pc:${x.c}"><div class="pal-swh"><i></i><b>${x.name}</b>${x.story ? '<span class="pal-story">Personal story</span>' : evBadge(x.ev)}</div><p>${x.line}</p><small>${x.src}</small></div>`
      : '<p class="pal-hint">Tap a shade to swatch it.</p>'}</section>`;
}
// ---------- your plan: the 90-day hero, before & after, the science we build on, your hormone panel ----------
// The hormone axis, tap a part to read what it does.
const AXIS = [
  { k: 'brain', n: 'Hypothalamus', t: 'The conductor', ev: 'strong', d: 'Deep in your brain it sends GnRH in pulses. Stress, too little food and short sleep slow these pulses, which is why a hard month can shift your period.' },
  { k: 'pit', n: 'Pituitary', t: 'The messenger', ev: 'strong', d: 'Answers with FSH, which ripens an egg follicle, and a surge of LH that releases the egg around the middle of your cycle.' },
  { k: 'ova', n: 'Ovaries', t: 'The makers', ev: 'strong', d: 'Make estrogen in the first half, progesterone after ovulation and a little testosterone. They report back to the brain, which sets the next pulse.' },
  { k: 'body', n: 'Your body', t: 'Where you feel it', ev: 'some', d: 'Skin, mood, sleep, appetite and energy carry receptors for these hormones, so they move with the same rhythm. That is the rhythm your plan follows.' },
];
const PLAN_STUDIES = [
  { n: '29.3 days', c: 'var(--sci-1)', i: 'calendar', t: 'is the average cycle across 600,000 cycles. Only 13% were exactly 28 days, so your plan follows your own length.', cite: 'Bull et al. 2019 · npj Digital Medicine', ev: 'strong' },
  { n: '48%', c: 'var(--sci-2)', i: 'drop', t: 'fewer PMS symptoms with 1,200 mg calcium a day, against 30% on placebo, within three cycles.', cite: 'Thys-Jacobs et al. 1998 · Am J Obstet Gynecol', ev: 'strong' },
  { n: '39 °C', c: 'var(--sci-3)', i: 'thermo', t: 'of steady warmth on the belly eased period pain as well as ibuprofen. It is why your period days are warm days.', cite: 'Akin et al. 2001 · Obstetrics & Gynecology', ev: 'some' },
];
const BA_LIST = {
  before: ['The same pace every day', 'PMS takes you by surprise', 'Tired by 3 pm', 'Breakouts and bloating', 'Guilt on slow days'],
  after: ['A plan for every phase', 'You know what is coming', 'Steadier energy', 'Calmer skin, more glow', 'Rest without guilt'],
};
// A tiny pearl with a leaf on her head: sad under a rain cloud, glowing in the sun.
function pearlPal(happy) {
  const id = happy ? 'pp-h' : 'pp-s';
  return `<svg class="pal-svg ${happy ? 'happy' : 'sad'}" viewBox="0 0 120 120" aria-hidden="true"><defs>
      <radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="${happy ? '#fbe9ef' : '#e9e2ea'}"/><stop offset="1" stop-color="${happy ? '#efc3d2' : '#c9bccb'}"/></radialGradient></defs>
    <ellipse cx="60" cy="110" rx="28" ry="5" fill="rgba(40,30,40,.14)"/>
    <path class="pal-leaf" d="M60 34 C 56 24, 58 16, 66 12 C 70 20, 68 28, 60 34 Z" fill="#8fae5a"/><path d="M60 34 C 61 27, 63 21, 66 13" stroke="#5f7d36" stroke-width="1.2" fill="none"/>
    <circle cx="60" cy="72" r="38" fill="url(#${id})" stroke="rgba(255,255,255,.9)" stroke-width="1.5"/>
    <ellipse cx="44" cy="80" rx="6" ry="3.6" fill="#f0a3b8" opacity="${happy ? .75 : .35}"/><ellipse cx="76" cy="80" rx="6" ry="3.6" fill="#f0a3b8" opacity="${happy ? .75 : .35}"/>
    ${happy ? `<path d="M42 70 q6 -7 12 0 M66 70 q6 -7 12 0" stroke="#304023" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M50 82 q10 11 20 0 Z" fill="#c4566f"/>`
      : `<path d="M43 64 l9 3 M77 64 l-9 3" stroke="#304023" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="72" r="2.6" fill="#304023"/><circle cx="72" cy="72" r="2.6" fill="#304023"/><path d="M52 88 q8 -6 16 0" stroke="#304023" stroke-width="2.2" stroke-linecap="round" fill="none"/><path class="pal-tear" d="M47 77 q-2 4 0 6 q2 -2 0 -6 Z" fill="#9cc3e6"/>`}
  </svg>`;
}
function baCompare() {
  const cloud = `<svg class="bav-cloud" viewBox="0 0 120 70" aria-hidden="true"><path d="M30 52 C 14 52, 12 32, 28 30 C 30 14, 54 10, 60 24 C 70 12, 94 16, 92 34 C 106 34, 108 52, 92 52 Z" fill="#a99bb0"/><path class="rd r1" d="M40 58 q-2 4 0 6 q2 -2 0 -6Z"/><path class="rd r2" d="M62 60 q-2 4 0 6 q2 -2 0 -6Z"/><path class="rd r3" d="M82 57 q-2 4 0 6 q2 -2 0 -6Z"/></svg>`;
  const spark = n => `<svg class="bav-sp s${n}" viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0-10C.5-1.4 1.4-.5 10 0 1.4.5.5 1.4 0 10-.5 1.4-1.4.5-10 0-1.4-.5-.5-1.4 0-10Z"/></svg>`;
  return `<section class="bav" aria-label="Before and after">
    <div class="bav-c bav-b">${cloud}<h3>Before</h3><ul>${BA_LIST.before.map(t => `<li>${icon('close', 12, 2.2)}<span>${t}</span></li>`).join('')}</ul><span class="bav-pal">${pearlPal(false)}</span></div>
    <div class="bav-c bav-a"><span class="bav-sun" aria-hidden="true"></span><h3>After</h3><ul>${BA_LIST.after.map(t => `<li>${icon('check', 13, 2.4)}<span>${t}</span></li>`).join('')}</ul>${spark(1)}${spark(2)}${spark(3)}<span class="bav-pal">${pearlPal(true)}</span></div>
  </section>`;
}
function axisHTML() {
  const on = ui.axis || 'brain', x = AXIS.find(a => a.k === on);
  return `<section class="card glass sci-axis" data-on="${on}">
    <div class="ax-stage">
      <svg class="ax-svg" viewBox="0 0 340 300" aria-hidden="true"><defs>
        ${[['brain', '#c9b6f0'], ['pit', '#f1c96a'], ['ova', '#ef9db4'], ['body', '#9cc27a']].map(([k, c]) => `<radialGradient id="ax-${k}"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
        <marker id="ax-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="rgba(48,64,35,.45)"/></marker></defs>
        <g class="ax-body"><ellipse cx="170" cy="50" rx="25" ry="29"/><path d="M156 77 C 155 90, 150 96, 134 100 C 110 106, 98 120, 96 146 L 94 196 C 94 226, 106 252, 122 296 M184 77 C 185 90, 190 96, 206 100 C 230 106, 242 120, 244 146 L 246 196 C 246 226, 234 252, 218 296"/></g>
        <path class="ax-flow f1" d="M170 58 L170 70" marker-end="url(#ax-ar)"/>
        <path class="ax-flow f2" d="M162 80 C 120 120, 122 190, 146 226" marker-end="url(#ax-ar)"/>
        <path class="ax-flow f3 back" d="M196 230 C 226 186, 222 110, 186 60" marker-end="url(#ax-ar)"/>
        <path class="ax-flow f4" d="M170 226 C 170 200, 170 184, 170 168" marker-end="url(#ax-ar)"/>
        <g class="ax-n n-brain"><circle cx="170" cy="48" r="26" fill="url(#ax-brain)"/></g>
        <g class="ax-n n-pit"><circle cx="170" cy="76" r="14" fill="url(#ax-pit)"/></g>
        <g class="ax-n n-ova"><circle cx="148" cy="236" r="18" fill="url(#ax-ova)"/><circle cx="192" cy="236" r="18" fill="url(#ax-ova)"/></g>
        <g class="ax-n n-body"><circle cx="170" cy="150" r="30" fill="url(#ax-body)"/></g>
      </svg>
      ${AXIS.map(a => `<button class="ax-chip c-${a.k} ${a.k === on ? 'on' : ''}" data-action="axis" data-k="${a.k}" aria-pressed="${a.k === on}"><b>${a.n}</b><small>${a.t}</small></button>`).join('')}
      <span class="ax-fb">feedback</span>
    </div>
    <div class="ax-detail"><div class="ax-dh"><b>${x.n}</b>${evBadge(x.ev)}</div><p>${x.d}</p></div>
  </section>`;
}
function scienceHTML() {
  return `<section class="sci">
    <h2 class="sci-h">Built on <span>hormone science</span></h2>
    <p class="sci-sub">Four parts talk to each other every day of your cycle. Tap one.</p>
    ${axisHTML()}
    <div class="sci-stats">${PLAN_STUDIES.map(x => `<div class="sci-s"><span class="sci-ic">${icon(x.i, 18)}</span><div class="sci-t"><p><b style="color:${x.c}">${x.n}</b> ${x.t}</p><small>${x.cite} ${evBadge(x.ev)}</small></div></div>`).join('')}</div>
  </section>`;
}
function hormonePanelHTML() {
  if (!M.info) return '';
  const rows = [['#ef8fb1', 'Estrogen', 'Rises before ovulation: energy, confidence and glow.'], ['#9cc27a', 'Progesterone', 'Leads after ovulation: calm, warmth and more need for rest.'], ['#e0645c', 'Testosterone', 'A small peak mid-cycle: drive and desire.']];
  return `${sectionTitle('Your hormone panel', ['Each hormone', 'hormones'])}
    <section class="card glass chart-card hp">${cycleChart(M.info, { id: 'plan', compact: true })}
      <div class="hp-read"><p class="hp-k">How to read it</p>${rows.map(([c, n, t]) => `<div class="hp-r"><i style="background:${c}"></i><div><b>${n}</b><span>${t}</span></div></div>`).join('')}
        <p class="hp-now">The white dot is you today, day ${M.info.cd}. Your plan changes as these lines cross.</p></div></section>`;
}
function viewRoadmap() {
  const p = state.profile;
  if (!p.planStart) { p.planStart = todayISO(); save(true); }
  const day = Math.max(1, Math.min(90, planDay())), m = Math.min(2, Math.floor((day - 1) / 30));
  return `${topbar('Your plan', { back: true })}<div class="pad">
    <section class="ph">
      <div class="ph-ring" role="img" aria-label="Day ${day} of 90"><svg viewBox="0 0 120 120"><circle class="t" cx="60" cy="60" r="52"/><circle class="p" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="${Math.max(1.5, day / 90 * 100).toFixed(1)} 100"/></svg>
        <div><b>${day}</b><small>of 90 days</small></div></div>
      <h1 class="page-h">Your <span>90 days</span></h1>
      <p class="ph-p">Month ${m + 1} · ${PLAN_METHOD[m].k}. Check in every day and follow today’s plan: your check-ins show what changed.</p>
      <div class="ph-cta"><button class="ph-b w" data-action="nav" data-to="log">${icon('check', 15)} Check in</button><button class="ph-b" data-action="nav" data-to="today">Today’s plan ${icon('chevR', 14)}</button></div>
    </section>
    ${baCompare()}
    ${scienceHTML()}
    ${hormonePanelHTML()}
    ${promiseHTML(day)}
    ${sectionTitle('Your 90 days')}${roadmapHTML(planKeys(p), '', day)}
    <p class="center"><button class="link" data-action="nav" data-to="profile">Change goals or birth control in Profile</button></p>
    <p class="fine center">Underskin is a wellness app, not medical advice.</p></div>`;
}
// Sizes the hand-lettered title to its real drawn letters once the script font has loaded, so swashes never leave the screen.
// Draws a word in a bold brush script as an even grid of small dots, like a soft LED sign.
function dotWord(svg) {
  const go = () => { if (!svg.isConnected || svg.childElementCount) return;
    const FS = 200, FONT = `${FS}px 'Yellowtail'`, c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
    const ls = `${Math.round(FS * .025)}px`; x.font = FONT; if ('letterSpacing' in x) x.letterSpacing = ls; const W = Math.ceil(x.measureText(svg.dataset.word).width + FS * .5), H = Math.ceil(FS * 1.35);
    c.width = W; c.height = H; x.font = FONT; if ('letterSpacing' in x) x.letterSpacing = ls; x.fillStyle = '#000'; x.fillText(svg.dataset.word, FS * .25, FS * .95);
    const px = x.getImageData(0, 0, W, H).data, S = 6, R = 2.4, dots = [];
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let j = S / 2; j < H; j += S) for (let i = S / 2; i < W; i += S) if (px[((j | 0) * W + (i | 0)) * 4 + 3] > 110) {
      dots.push(`<circle cx="${i}" cy="${j}" r="${R}"/>`); x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
    svg.setAttribute('viewBox', `${x0 - 6} ${y0 - 6} ${x1 - x0 + 12} ${y1 - y0 + 12}`); svg.innerHTML = dots.join(''); svg.classList.add('fit'); };
  (document.fonts?.load ? document.fonts.load("200px 'Yellowtail'") : Promise.resolve()).then(go, go);
}
function fitHand(svg) {
  const go = () => { if (!svg.isConnected) return; const g = svg.querySelector('.h-g');
    if (g.dataset.word && !g.childElementCount) pearlWord(g, g.dataset.word);
    const k = g.dataset.box ? g.dataset.box.split(' ').map(Number) : null, b = k ? { x: k[0], y: k[1], width: k[2], height: k[3] } : g.getBBox(), p = k ? 10 : 6;
    svg.setAttribute('viewBox', `${b.x - p} ${b.y - p} ${b.width + p * 2} ${b.height + p * 2}`); svg.classList.add('fit'); };
  (document.fonts?.load ? document.fonts.load("900 100px 'Grenze Gotisch'") : Promise.resolve()).then(go, go);
}
// Strings a word in pearls: draws it in the script font, finds the middle of every stroke (distance transform)
// and packs round pearls along it, big where the stroke is thick and small where it is thin.
function pearlWord(g, word) {
  // heavy broad-nib gothic, squeezed narrow, its thick strokes paved solid with stones
  const FS = 230, SQ = .8, FONT = `900 ${FS}px 'Grenze Gotisch'`, c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
  const lines = word.split('|'); x.font = FONT; if ('letterSpacing' in x) x.letterSpacing = `${Math.round(FS * -.03)}px`;
  const ws = lines.map(l => x.measureText(l).width * SQ), off = lines.length > 1 ? (ws[0] - ws[1]) / 2 : 0; // stacked lines, centred
  const W = Math.ceil(Math.max(ws[0], off + (ws[1] || 0)) + FS * .8), H = Math.ceil(FS * (.64 + lines.length * .68));
  c.width = W; c.height = H; x.font = FONT; if ('letterSpacing' in x) x.letterSpacing = `${Math.round(FS * -.03)}px`; x.textBaseline = 'alphabetic';
  x.fillStyle = '#000'; x.setTransform(SQ, 0, 0, 1, 0, 0);
  lines.forEach((l, n) => { const lx = (FS * .4 + (n ? off : 0)) / SQ, ly = FS * (.9 + n * .68); x.fillText(l, lx, ly); });
  x.setTransform(1, 0, 0, 1, 0, 0);
  const px = x.getImageData(0, 0, W, H).data, D = new Float32Array(W * H), INF = 1e9;
  for (let i = 0; i < W * H; i++) D[i] = px[i * 4 + 3] > 100 ? INF : 0;
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? 0 : D[j * W + i];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (D[k]) D[k] = Math.min(D[k], at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + 1.414, at(i + 1, j - 1) + 1.414); }
  for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) { const k = j * W + i; if (D[k]) D[k] = Math.min(D[k], at(i + 1, j) + 1, at(i, j + 1) + 1, at(i + 1, j + 1) + 1.414, at(i - 1, j + 1) + 1.414); }
  const cand = [];
  for (let j = 1; j < H - 1; j += 2) for (let i = 1; i < W - 1; i += 2) { const d = D[j * W + i]; if (d >= 2.6) cand.push([i, j, d]); } // every inside point: pavé fills the stroke
  cand.sort((a, b) => b[2] - a[2]);
  const S = 24, grid = new Map(), placed = [], key = (a, b) => a + ',' + b;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [i, j, d] of cand) {
    const r = Math.min(8, d * (.84 + rnd() * .12)), gi = Math.floor(i / S), gj = Math.floor(j / S); let ok = true;
    for (let a = gi - 1; a <= gi + 1 && ok; a++) for (let b = gj - 1; b <= gj + 1 && ok; b++) for (const q of grid.get(key(a, b)) || []) if (Math.hypot(q[0] - i, q[1] - j) < (q[2] + r) * .93) { ok = false; break; }
    if (!ok) continue; const pr = [i, j, r]; placed.push(pr); (grid.get(key(gi, gj)) || grid.set(key(gi, gj), []).get(key(gi, gj))).push(pr);
  }
  const big = placed.slice().sort((a, b) => b[2] - a[2]).filter((p, n, arr) => arr.slice(0, n).every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > W * .1)).slice(0, 7);
  const star = (p, n) => `<path class="p-star" style="animation-delay:${(n * .9).toFixed(1)}s" transform="translate(${p[0] - p[2] * .25} ${p[1] - p[2] * .3}) scale(${(p[2] / 4.2).toFixed(2)})" d="M0-10C.5-1.4 1.4-.5 10 0 1.4.5.5 1.4 0 10-.5 1.4-1.4.5-10 0-1.4-.5-.5-1.4 0-10Z"/>`;
  if (g.dataset.vines && placed.length) { // crystal filigree (skipped if the word drew nothing, e.g. off-screen before layout): drawn curls (different on each side) with leaves sprouting along them and a few tiny flowers
    const word = placed.slice(), wx0 = Math.min(...word.map(p => p[0] - p[2])), wx1 = Math.max(...word.map(p => p[0] + p[2])), wy0 = Math.min(...word.map(p => p[1] - p[2])), wy1 = Math.max(...word.map(p => p[1] + p[2]));
    const bw = wx1 - wx0, bh = Math.min(wy1 - wy0, bw * .5), P = (u, v) => `${(wx0 + u * bw).toFixed(1)} ${(v > .5 ? wy1 - (1 - v) * bh : wy0 + v * bh).toFixed(1)}`;
    const flower = (x, y, r) => { placed.push([x, y, r * 1.2]); for (let k = 0; k < 5; k++) { const a = k * 1.2566 + .3; placed.push([x + Math.cos(a) * r * 2.3, y + Math.sin(a) * r * 2.3, r * (.95 + rnd() * .2)]); } };
    const leaf = (x, y, h, side, r) => { const a = h + side * (.75 + rnd() * .3); [[2.2, .95], [4.2, 1.1], [6.1, .8], [7.6, .45]].forEach(([t, w]) => placed.push([x + Math.cos(a) * t * r, y + Math.sin(a) * t * r, r * w])); };
    const V = [ // [path in word-box units (v<0 above, v>1 below), start radius, end radius, leaves, flower at the tip]
      ['M .46 1.02 C .34 1.32, .16 1.32, .08 1.12 C .04 1.01, .12 .95, .16 1.04 C .18 1.09, .13 1.12, .12 1.07', 4.6, 2.2, 3, 0],
      ['M .24 1.22 C .22 1.40, .30 1.48, .34 1.40', 3, 1.8, 0, 1],
      ['M .30 .06 C .26 -.26, .34 -.44, .42 -.38 C .46 -.34, .43 -.27, .40 -.30', 3.8, 2, 2, 0],
      ['M .10 .02 C .02 -.20, -.02 -.42, .06 -.52 C .10 -.56, .15 -.50, .11 -.46', 3.4, 2, 1, 0],
      ['M .19 -.28 C .14 -.40, .17 -.52, .23 -.52', 2.6, 1.7, 0, 1],
      ['M .52 1.03 C .66 1.26, .80 1.38, .93 1.20 C .98 1.10, .90 1.02, .86 1.10 C .84 1.15, .89 1.17, .90 1.13', 4.6, 2.2, 3, 0],
      ['M .72 1.30 C .76 1.46, .68 1.52, .64 1.44', 3, 1.8, 1, 0],
      ['M .64 .04 C .70 -.30, .60 -.48, .54 -.40 C .51 -.35, .55 -.30, .57 -.33', 3.8, 2, 1, 0],
      ['M .92 .06 C 1.00 -.16, .98 -.48, .88 -.56 C .83 -.59, .80 -.52, .84 -.49', 3.4, 2, 2, 0],
      ['M .80 -.10 C .84 -.28, .80 -.40, .75 -.40', 2.6, 1.7, 0, 1]];
    const ns = 'http://www.w3.org/2000/svg', tmp = document.createElementNS(ns, 'path'); g.appendChild(tmp);
    V.filter(([d]) => lines.length < 2 || !/ -\./.test(d)).forEach(([d, r0, r1, nl, fl]) => { // stacked: only the curls below, so the title stays low
      tmp.setAttribute('d', d.replace(/(-?[\d.]+)[ ,]+(-?[\d.]+)/g, (_, u, v) => P(+u, +v)));
      if (!tmp.getAttribute('d') || /NaN/.test(tmp.getAttribute('d'))) return; const L = tmp.getTotalLength(); if (!L) return; let at = 0, side = rnd() < .5 ? 1 : -1, next = nl ? .2 + rnd() * .1 : 2;
      while (at <= L) { const k = at / L, r = r0 + (r1 - r0) * k, q = tmp.getPointAtLength(at); placed.push([q.x, q.y, r]);
        if (k > next) { const q2 = tmp.getPointAtLength(Math.min(L, at + 2)); leaf(q.x, q.y, Math.atan2(q2.y - q.y, q2.x - q.x), side, r * .95); side = -side; next += .6 / nl + rnd() * .08; }
        at += r * 2 + 1.2; }
      if (fl) { const e = tmp.getPointAtLength(L); flower(e.x, e.y, r1 * 1.15); } });
    tmp.remove();
  }
  const x0 = Math.min(...placed.map(p => p[0] - p[2])), x1 = Math.max(...placed.map(p => p[0] + p[2])), y0 = Math.min(...placed.map(p => p[1] - p[2])), y1 = Math.max(...placed.map(p => p[1] + p[2]));
  g.dataset.box = `${x0} ${y0} ${x1 - x0} ${y1 - y0}`; // exact crystal bounds, so the word sits dead centre
  g.innerHTML = placed.sort((a, b) => a[0] - b[0]).map(([i, j, r]) => `<use class="p-bead" href="#crys" style="--d:${(i / W * 1.8).toFixed(2)}s" x="${(i - r).toFixed(1)}" y="${(j - r).toFixed(1)}" width="${(r * 2).toFixed(1)}" height="${(r * 2).toFixed(1)}" transform="rotate(${Math.round(rnd() * 45)} ${i} ${j})"/>`).join('') + big.map(star).join('');
}
// A tiny pearl pet with a leaf sprout, waving and hugging a heart: the face of "no subscriptions".
function promisePet() {
  return `<svg class="op-pet" viewBox="14 8 136 140" aria-hidden="true"><defs>
      <radialGradient id="opp-b" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fdeef3"/><stop offset="1" stop-color="#f1c3d3"/></radialGradient>
      <radialGradient id="opp-h" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ff9fb8"/><stop offset="1" stop-color="#d94d74"/></radialGradient></defs>
    <ellipse class="op-pet-sh" cx="80" cy="140" rx="34" ry="5.5" fill="rgba(60,30,40,.14)"/>
    <g class="op-pet-body">
      <path d="M80 44 C 75 32, 77 22, 87 17 C 92 27, 89 37, 80 44 Z" fill="#8fae5a"/><path d="M80 44 C 81 35, 84 26, 87 18" stroke="#5f7d36" stroke-width="1.4" fill="none"/>
      <path d="M74 42 C 66 36, 58 37, 55 41 C 61 46, 68 46, 74 42 Z" fill="#a4c46c"/>
      <ellipse cx="80" cy="90" rx="46" ry="44" fill="url(#opp-b)" stroke="#fff" stroke-width="2"/>
      <path class="op-pet-wave" d="M37 82 C 26 74, 22 62, 27 56" stroke="#efc0cf" stroke-width="9" stroke-linecap="round" fill="none"/>
      <ellipse cx="60" cy="94" rx="7" ry="4.2" fill="#f3a3b9" opacity=".8"/><ellipse cx="100" cy="94" rx="7" ry="4.2" fill="#f3a3b9" opacity=".8"/>
      <path d="M60 82 q6 -8 12 0 M88 82 q6 -8 12 0" stroke="#2c3a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M72 96 q8 9 16 0 Z" fill="#c4566f"/>
      <g class="op-pet-heart" transform="translate(98 112)"><path d="M0 8 C -14 -2, -10 -14, 0 -7 C 10 -14, 14 -2, 0 8 Z" fill="url(#opp-h)" stroke="#fff" stroke-width="1.6"/></g>
      <path d="M118 100 C 112 110, 104 114, 98 113" stroke="#efc0cf" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
    <g class="op-pet-sp"><path d="M136 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#e8b52c"/><path d="M24 26 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#c4566f"/><circle cx="142" cy="74" r="2.4" fill="#8fae5a"/></g>
  </svg>`;
}
function onbPromise() {
  const no = [['subscriptions', 'One payment, yours for good'], ['ads', 'Never, not even small ones'], ['hidden fees', 'The price you see is all'], ['selling your data', 'It stays yours, always'], ['popups', 'No nagging to upgrade']];
  const steps = [['gift', 'Today', 'Full app, free'], ['calendar', 'Day 3', 'Decide, no charge before'], ['heart', 'Forever', 'One payment']];
  return `<div class="op op2">
    <section class="op-hero">
      ${promisePet()}
      <h2>We hate<br><s>subscriptions</s></h2>
      <p>We’re a small team and this is our passion project. Try everything free for 3 days. If you love it, unlock the full app with one payment.</p>
    </section>
    <section class="op-card op-path">${steps.map(([ic, t, d], i) => `<div class="op-st ${i === 0 ? 'now' : ''}"><span>${icon(ic, 17)}</span><b>${t}</b><small>${d}</small></div>`).join('')}</section>
    <section class="op-card"><ul class="op-no">${no.map(([a, b]) => `<li><span class="op-x">${icon('close', 12, 2.6)}</span><div><b>No ${a}</b><small>${b}</small></div></li>`).join('')}</ul></section>
  </div>`;
}
// The cycle question shows her actual cycle: four phase arcs sized from the length she picks, redrawn on every tap.
function bcQHTML(o) {
  return hormonalBC(o.bc) ? `<div class="bc-q"><h3>Would you like to come off it?</h3>
    <p class="muted sm">We’ll guide you step by step.</p>
    <div class="chips">${BC_PLAN.map(b => `<button class="chip ${o.bcPlan === b.k ? 'on' : ''}" data-action="onbBcPlan" data-v="${b.k}">${b.t}</button>`).join('')}</div>
    ${o.bcPlan === 'stop' ? '<p class="fine">Talk to your doctor before you stop, and use condoms or a copper IUD if you don’t want to get pregnant: you can ovulate in your very first cycle.</p>' : ''}</div>` : '';
}
// Little drawings of each birth control method for the onboarding question.
const BC_PIC = {
  none: `<svg viewBox="0 0 48 48"><defs><radialGradient id="bp-f" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fff6f8"/><stop offset="1" stop-color="#ee9db3"/></radialGradient></defs>
    <path d="M24 30 C 24 36, 22 40, 18 44" stroke="#6c823e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M21 39 C 15 38, 13 34, 14 31 C 18 31, 21 34, 21 39 Z" fill="#8fae5a"/>
    ${[0, 72, 144, 216, 288].map(r => `<ellipse cx="24" cy="12" rx="6.5" ry="9" fill="url(#bp-f)" transform="rotate(${r} 24 20)"/>`).join('')}<circle cx="24" cy="20" r="4" fill="#f1c96a"/></svg>`,
  pill: `<svg viewBox="0 0 48 48"><defs><linearGradient id="bp-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#d9d6e0"/></linearGradient></defs>
    <rect x="7" y="5" width="34" height="38" rx="6" fill="url(#bp-b)"/>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<circle cx="${15 + c * 9}" cy="${12 + r * 8.2}" r="3.2" fill="${r === 3 ? '#f4c6d3' : '#fff'}" stroke="rgba(48,64,35,.25)" stroke-width=".8"/>`).join('')).join('')}</svg>`,
  hiud: `<svg viewBox="0 0 48 48"><path d="M8 11 C 14 14, 34 14, 40 11" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="21.5" y="12" width="5" height="24" rx="2.5" fill="#fff"/>
    <rect x="20.5" y="17" width="7" height="13" rx="3.5" fill="#efd4dd"/><path d="M24 36 C 23 40, 25 42, 24 46 M24 36 C 26 40, 22 43, 23 46" stroke="#8a917f" stroke-width="1" fill="none"/></svg>`,
  other: `<svg viewBox="0 0 48 48"><circle cx="22" cy="24" r="14" fill="none" stroke="#efd4dd" stroke-width="5"/><circle cx="22" cy="24" r="14" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.4"/>
    <rect x="30" y="7" width="5" height="26" rx="2.5" fill="#fff" transform="rotate(28 32 20)"/></svg>`,
  copper: `<svg viewBox="0 0 48 48"><defs><linearGradient id="bp-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8693a"/><stop offset=".5" stop-color="#f0b07a"/><stop offset="1" stop-color="#a85a2e"/></linearGradient></defs>
    <path d="M8 11 C 14 14, 34 14, 40 11" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="21.5" y="12" width="5" height="24" rx="2.5" fill="#fff"/>
    ${[16, 19, 22, 25, 28, 31].map(y => `<rect x="20" y="${y}" width="8" height="2" rx="1" fill="url(#bp-c)"/>`).join('')}<path d="M24 36 C 23 40, 25 42, 24 46" stroke="#8a917f" stroke-width="1" fill="none"/></svg>`,
};
function onbCycleRing(L, P) {
  const R = 74, C = 2 * Math.PI * R, ov = Math.max(P + 3, L - 14);
  const parts = [['menstrual', 1, P], ['follicular', P + 1, ov - 2], ['ovulatory', ov - 1, ov + 1], ['luteal', ov + 2, L]];
  const col = { menstrual: '#e58b9f', follicular: '#9cc27a', ovulatory: '#f1c96a', luteal: '#b9a2e8' };
  const arc = ([k, a, b]) => { const len = (b - a + 1) / L * C, off = (a - 1) / L * C; return `<circle class="ocr-a" r="${R}" stroke="${col[k]}" stroke-dasharray="${Math.max(0, len - 3).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}"/>`; };
  return `<div class="onb-ring" aria-label="A ${L}-day cycle: period ${P} days, ovulation around day ${ov}">
    <svg viewBox="-24 -24 248 248" aria-hidden="true"><g class="ocr-rot">
      <circle class="ocr-o" r="${R}" cx="100" cy="100"/>
      <g transform="translate(100 100) rotate(-90)">${parts.map(arc).join('')}</g></g>
      <g transform="translate(100 100) rotate(-90)"><g class="ocr-spin">${[[56, .16, 6], [38, .34, 8], [22, .65, 10], [10, 1, 12]].map(([d, o, w]) => `<circle r="${R}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-opacity="${o}" stroke-dasharray="${d} ${(C - d).toFixed(1)}" stroke-dashoffset="${d}"/>`).join('')}
        <circle class="ocr-head" cx="${R}" cy="0" r="6.5"/></g></g>
    </svg></div>`;
}
function viewOnboarding() {
  const s = ui.onbStep, o = ui.onb;
  const dots = `<div class="onb-dots">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<i class="${i < s ? 'on' : i === s ? 'now' : ''}"></i>`).join('')}</div>`;
  if (s === 0) {
    return `<div class="onb onb-welcome full dark beyond">
      <canvas class="welcome3d"></canvas>
      <div class="bw-vignette"></div>${sndBtn('float')}
      <div class="welcome-ui">
        <div class="bw-title-wrap"><span class="orn-l"><svg class="orn" viewBox="0 0 120 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
<path d="M118 60 C96 62 84 52 74 40 C64 28 50 22 38 28 C26 34 28 50 40 50 C50 50 50 38 42 38"/>
<path d="M90 58 C86 72 72 80 58 76 C48 73 48 62 56 62 C62 62 62 70 56 70" />
<path d="M74 40 C70 26 74 14 86 10 C94 8 98 16 92 20"/>
<path d="M38 28 C30 16 18 14 10 20 C4 26 10 34 16 30" />
<path d="M58 76 C44 84 26 82 16 74"/></g>
<g fill="currentColor"><path d="M82 46 c6 -2 10 2 8 7 c-5 1 -9 -2 -8 -7z"/><path d="M64 30 c2 -6 8 -7 11 -3 c-3 5 -8 6 -11 3z"/><path d="M30 60 c-2 -6 2 -10 7 -8 c1 5 -2 9 -7 8z"/>
<path d="M100 66 c4 -4 9 -3 10 1 c-4 4 -9 3 -10 -1z"/><circle cx="86" cy="10" r="2.4"/><circle cx="10" cy="20" r="2"/><circle cx="16" cy="74" r="2.2"/>
<g transform="translate(46 12)"><circle r="3.2"/><circle cx="0" cy="-5" r="2.4"/><circle cx="4.8" cy="-1.5" r="2.4"/><circle cx="3" cy="4" r="2.4"/><circle cx="-3" cy="4" r="2.4"/><circle cx="-4.8" cy="-1.5" r="2.4"/></g></g></svg></span><h1 class="bw-dots" aria-label="Underskin"><svg class="dot-word" data-word="underskin" aria-hidden="true"></svg></h1><h1 class="bw-script bw-hand" hidden aria-hidden="true"><svg class="uts-hand pearl" viewBox="0 0 600 220" aria-hidden="true">
          <defs><radialGradient id="crysRim" cx=".5" cy=".5" r=".5"><stop offset=".75" stop-color="#eef1f8"/><stop offset=".92" stop-color="#9aa3b8"/><stop offset="1" stop-color="#5d6478"/></radialGradient><radialGradient id="crysTab" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#eef3fb"/><stop offset="1" stop-color="#bcc6da"/></radialGradient><symbol id="crys" viewBox="-10 -10 20 20"><circle r="10" fill="url(#crysRim)"/><path fill="#ffffff" d="M4.07 -1.68L8.50 -3.52L8.50 3.52L4.07 1.68Z"/><path fill="#c9d1e2" d="M4.07 1.68L8.50 3.52L3.52 8.50L1.68 4.07Z"/><path fill="#f7dbe8" d="M1.68 4.07L3.52 8.50L-3.52 8.50L-1.68 4.07Z"/><path fill="#8f9bb4" d="M-1.68 4.07L-3.52 8.50L-8.50 3.52L-4.07 1.68Z"/><path fill="#ffffff" d="M-4.07 1.68L-8.50 3.52L-8.50 -3.52L-4.07 -1.68Z"/><path fill="#cfe9e2" d="M-4.07 -1.68L-8.50 -3.52L-3.52 -8.50L-1.68 -4.07Z"/><path fill="#e9edf6" d="M-1.68 -4.07L-3.52 -8.50L3.52 -8.50L1.68 -4.07Z"/><path fill="#9ea8c0" d="M1.68 -4.07L3.52 -8.50L8.50 -3.52L4.07 -1.68Z"/><polygon points="4.07,-1.68 4.07,1.68 1.68,4.07 -1.68,4.07 -4.07,1.68 -4.07,-1.68 -1.68,-4.07 1.68,-4.07" fill="url(#crysTab)"/><path fill="#fff" d="M-2.6-5.6l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" opacity=".95"/></symbol></defs>
          <g class="h-g" data-word="under|skin" data-vines="1"></g></svg></h1><span class="orn-r"><svg class="orn" viewBox="0 0 120 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
<path d="M118 60 C96 62 84 52 74 40 C64 28 50 22 38 28 C26 34 28 50 40 50 C50 50 50 38 42 38"/>
<path d="M90 58 C86 72 72 80 58 76 C48 73 48 62 56 62 C62 62 62 70 56 70" />
<path d="M74 40 C70 26 74 14 86 10 C94 8 98 16 92 20"/>
<path d="M38 28 C30 16 18 14 10 20 C4 26 10 34 16 30" />
<path d="M58 76 C44 84 26 82 16 74"/></g>
<g fill="currentColor"><path d="M82 46 c6 -2 10 2 8 7 c-5 1 -9 -2 -8 -7z"/><path d="M64 30 c2 -6 8 -7 11 -3 c-3 5 -8 6 -11 3z"/><path d="M30 60 c-2 -6 2 -10 7 -8 c1 5 -2 9 -7 8z"/>
<path d="M100 66 c4 -4 9 -3 10 1 c-4 4 -9 3 -10 -1z"/><circle cx="86" cy="10" r="2.4"/><circle cx="10" cy="20" r="2"/><circle cx="16" cy="74" r="2.2"/>
<g transform="translate(46 12)"><circle r="3.2"/><circle cx="0" cy="-5" r="2.4"/><circle cx="4.8" cy="-1.5" r="2.4"/><circle cx="3" cy="4" r="2.4"/><circle cx="-3" cy="4" r="2.4"/><circle cx="-4.8" cy="-1.5" r="2.4"/></g></g></svg></span></div>
        <p class="bw-sub2">Live with your biological rhythm</p>
        <p class="bw-by">Designed by women, <span>for women</span></p>
        <button class="pearl-btn" data-action="onbEnter"><span>Enter</span></button>
        <button class="link welcome-privacy" data-action="nav" data-to="privacy">Private by design: we don’t track you or sell your data</button>
      </div>
      <div class="bw-flash"></div>
    </div>`;
  }
  if (s === 1 && !ui.onbGateDone && !A.currentUser() && A.configured()) return viewGate(); // no sign-up screen until accounts are switched on
  const bd = o.birthday ? (() => { const [y, m, d] = o.birthday.split('-').map(Number); const sign = Z.sunSign(m, d), moon = Z.moonPhase(new Date(y, m - 1, d, 12)), cz = Z.chineseZodiac(y, m, d); return { sign, moon, cz }; })() : null;
  const body = {
    1: `<div class="onb-avatar">${o.photo ? `<img src="${o.photo}" alt="">` : AVATAR_SVG}</div><h2 class="onb-title">What should we <span>call you?</span></h2>
        <input class="field big-in" data-input="onb.name" placeholder="Your first name" value="${esc(o.name)}" autocomplete="given-name" maxlength="24">
        <p class="onb-greet ${o.name.trim() ? 'on' : ''}">Nice to meet you, <b>${esc(o.name.trim())}</b> ✦</p>`,
    2: `<h2 class="onb-title">Add a <span>profile picture</span></h2>
        <p class="muted">So you and your partner, if you share, recognise your rhythm at a glance.</p>
        <label class="photo-pick"><span class="pp-frame">${o.photo ? `<img src="${o.photo}" alt="">` : AVATAR_SVG}</span><span class="pp-add">${icon(o.photo ? 'check' : 'plus', 18, 2.4)}</span>
          <input type="file" accept="image/*" data-photo="onb" hidden></label>
        ${o.photo ? '' : '<button class="link" data-action="onbNext" style="align-self:center">Skip for now</button>'}`,
    3: `<h2 class="onb-title">How do <span>you eat?</span></h2>
        <p class="muted">Your recipes, food guide and supplements follow this. You can change it any time in your profile.</p>
        <div class="dt-grid">${DIETS.map((x, i) => `<button class="dt-c ${(o.diet || 'all') === x.k ? 'on' : ''}" data-action="onbDiet" data-v="${x.k}" style="--i:${i}" aria-pressed="${(o.diet || 'all') === x.k}"><img src="${DIET_PIC[x.k]()}" alt="" loading="eager"><span class="dt-shade"></span><span class="dt-ok">${icon('check', 14, 2.6)}</span><span class="dt-tx"><b>${x.t}</b><small>${x.s}</small></span></button>`).join('')}</div>
        <div class="dt-peek" aria-live="polite">${dvPeek(o.diet || 'all')}</div>`,
    4: `<div class="onb-cut"><img src="images/period.png" alt=""></div><h2 class="onb-title">When did your last <span>period start?</span></h2>
        <div class="ago">${[[7, 'About 1 week ago'], [14, '2 weeks ago'], [21, '3 weeks ago'], [30, 'About 1 month ago'], ['none', 'I don’t have a period right now']].map(([v, t]) =>
          `<button class="chip ${(v === 'none' ? o.noPeriod : !o.noPeriod && o.ago === v) ? 'on' : ''} ${v === 'none' ? 'ago-none' : ''}" data-action="onbAgo" data-v="${v}">${t}</button>`).join('')}</div>
        ${o.noPeriod ? '<p class="muted sm">That’s okay. We’ll build your plan around getting it back, and the app maps your cycle as soon as you log your next bleed.</p>'
          : `<label class="ago-exact"><span>Or pick the exact day</span><input class="field" type="date" data-input="onb.last" value="${o.last}" max="${todayISO()}"></label>
        <div class="stepper-row"><span>How many days does it usually last?</span>${stepper('periodLength', o.periodLength, 'onb')}</div>`}`,
    5: `${onbCycleRing(o.unsure ? 28 : o.cycleLength, o.periodLength || 5)}<h2 class="onb-title">How long is your <span>cycle, usually?</span></h2>
        <p class="muted">First day of one period to the first day of the next.</p>
        <div class="big-stepper ${o.unsure ? 'dim' : ''}">${stepper('cycleLength', o.cycleLength, 'onb', true)}<span>days</span></div>
        <button class="chip unsure ${o.unsure ? 'on' : ''}" data-action="onbUnsure">${o.unsure ? icon('check', 14, 2.4) : ''} I’m not sure</button>
        ${o.unsure ? '<p class="muted sm">No problem: we’ll start with 28 days and learn your real cycle automatically as soon as you log your next period.</p>' : ''}`,
    6: `<h2 class="onb-title">Are you on <span>birth control?</span></h2>
        <div class="bc-list">${BIRTH_CONTROL.map(b => `<button class="bc-opt has-pic ${o.bc === b.k ? 'on' : ''}" data-action="onbBc" data-v="${b.k}"><span class="bc-pic">${BC_PIC[b.k] || ''}</span><span class="bc-tx"><b>${b.t}</b><small>${b.s}</small></span><i>${icon('check', 14, 2.6)}</i></button>`).join('')}</div>
        <div class="bc-slot">${bcQHTML(o)}</div>`,
    7: `<h2 class="onb-title">Why are <span>you here?</span></h2>
        ${purposePicker(o.purpose || 'know', 'onbPurpose', true)}`,
    8: `<h2 class="onb-title">What are <span>your goals?</span></h2>
        <p class="muted">Pick as many as you like. We build your plan around them.</p>
        ${focusTiles(o.focus || [], 'onbFocus')}`,
    9: onbPlanHTML(planKeys(o), o.name.trim()),
    10: onbPromise(),
  }[s];

  const flash = ui.flashOut ? '<div class="flash-out"></div>' : ''; ui.flashOut = false;
  const anim = ui.onbAnim || ''; ui.onbAnim = '';
  return `<div class="onb no-fig step-${s} ${anim}">${flash}
    <div class="onb-top"><button class="icon-btn dark" data-action="onbBack">${icon('chevL', 22)}</button>${dots}${sndBtn()}</div>
    <div class="onb-body">${body}</div>
    <div class="onb-foot">
      <button class="pearl-btn wide" data-action="onbNext" ${s === 1 && !o.name.trim() ? 'disabled' : ''}><span>${s === 10 ? 'Start my 3 free days' : s === 8 ? 'See my plan' : 'Continue'}</span></button>
      ${s === 10 ? '<p class="fine rm2-note">Underskin is a wellness app, not medical advice.</p>' : ''}
    </div>
  </div>`;
}
function stepper(field, val, scope, big) {
  return `<div class="stepper ${big ? 'big' : ''}"><button data-action="step" data-field="${field}" data-d="-1" data-scope="${scope}">−</button>
    <span class="num">${val}</span><button data-action="step" data-field="${field}" data-d="1" data-scope="${scope}">+</button></div>`;
}

// a soft, filled blood drop with a highlight for iron and period reminders
const DROP_ART = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><defs><linearGradient id="alDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2788f"/><stop offset="1" stop-color="#a8344f"/></linearGradient></defs><path d="M12 2.8c3.4 4.4 6.6 8 6.6 11.7a6.6 6.6 0 0 1-13.2 0C5.4 10.8 8.6 7.2 12 2.8z" fill="url(#alDrop)"/><path d="M8.9 14.2c0 1.8 1.1 3.2 2.6 3.6" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/></svg>`;
function viewToday() {
  const { stats, today } = M;
  const name = esc(state.profile.name || 'you');
  if (!M.info) {
    return `<div class="pad home"><div class="home-top solo"><h1 class="hello">${greeting()},<br><b>${name}</b></h1><button class="avatar ${state.profile.photo ? 'has-photo' : ''}" data-action="nav" data-to="profile" aria-label="Your profile">${avatarInner(state.profile)}</button></div>
      ${state.profile.noPeriod ? `<div class="card card-light empty"><h3>When your period comes, tap here</h3><p>We map your whole cycle from that day. Until then, your plan below helps it come back.</p>
      <button class="btn btn-dark" data-action="periodStart">My period started today</button></div>`
      : `<div class="card card-light empty"><h3>Log your period to begin</h3><p>Tap the day your last period started and we'll map your whole cycle.</p>
      <button class="btn btn-dark" data-action="nav" data-to="calendar">Open calendar</button></div>`}
</div>`;
  }
  const info = M.info, ph = PHASES[info.phase], tcm = TCM[info.phase], N = NUTRITION[info.phase];
  const energy = Math.round(myEnergy(info) * 100);
  const seed = dayNum(today);
  const chips = [];
  if (info.late) chips.push(`<span class="hchip">${icon('drop', 14)} ${plural(info.late, 'day')} late</span>`);
  else if (info.isPeriod) chips.push(`<span class="hchip">${icon('drop', 14)} Period · day ${info.cd}</span>`);
  else chips.push(`<span class="hchip">${icon('drop', 14)} Period in ${plural(info.daysToPeriod, 'day')}</span>`);
  chips.push(`<span class="hchip">${icon('sun', 14)} ${info.isOvulation ? 'Ovulation today' : `Ovulation in ${plural(info.daysToOv, 'day')}`}</span>`);
  if (ttc()) chips.push(`<span class="hchip ${info.fertile ? 'hl' : ''}">${icon('spark', 14)} ${info.fertile ? 'Fertile' : 'Low fertility'}</span>`);

  // one compact "heads-up" card: reminders, unusual cycle, learned patterns
  const alerts = dueReminders().filter(x => !/^(phase-|rh-)/.test(x.id)).map(x => `<div class="al-row"><span class="al-ic ${x.icon === 'drop' ? 'drop' : ''}">${x.icon === 'drop' ? DROP_ART : icon(x.icon, 17)}</span>
      <span class="al-t" ${x.to ? `data-action="nav" data-to="${x.to}"` : ''}><b>${esc(x.title)}</b><small>${esc(x.body)}</small></span>
      <button class="bn-x" data-action="dismissRem" data-id="${x.id}" aria-label="Dismiss">${icon('close', 14)}</button></div>`);
  upcomingPatterns(patterns()).forEach(x => { const rk = reliefKey(x.name); alerts.push(`<div class="al-row" ${rk ? `data-action="nav" data-to="relief/${encodeURIComponent(rk)}"` : ''}>
      <span class="al-ic">${icon('chart', 15)}</span><span class="al-t"><b>${x.name} ${x.inDays === 0 ? 'today' : x.inDays === 1 ? 'tomorrow' : `in ${x.inDays} days`}</b><small>Your pattern: days ${x.from}–${x.to}</small>${QUICK_FIX[x.name] ? `<em class="al-fix">${icon('spark', 12)} ${QUICK_FIX[x.name]}</em>` : ''}</span>${rk ? icon('chevR', 14) : ''}</div>`); });

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

  const head = `<div class="home-top"><div><div class="eyebrow">${fmt(today, { weekday: 'long', month: 'long', day: 'numeric' })}</div><h1 class="hello sm">${greeting()}, <b>${name}</b></h1></div>
      <button class="avatar ${state.profile.photo ? 'has-photo' : ''}" data-action="nav" data-to="profile" aria-label="Your profile">${avatarInner(state.profile)}</button></div>`;
  return `<div class="pad home">
    ${todayHub(info, energy, head)}

    ${conceiveCard(info)}
    ${(() => { // at most two notices, most important first
      const n = [...alerts];
      if (info.cd >= info.ov - 2 && info.cd <= info.ov + 1) n.push(`<button class="al-row" data-action="nav" data-to="relief/${encodeURIComponent('Ovulation pain')}"><span class="al-ic">${icon('spark', 15)}</span><span class="al-t"><b>Twinge on one side?</b><small>That may be ovulation. 7 ways to ease it</small></span>${icon('chevR', 14)}</button>`);
      return n.length ? `<section class="card glass alerts">${n.slice(0, 2).join('')}</section>` : '';
    })()}
    ${cycleFlag()}

    ${seasonBento(info)}
    ${sectionTitle('Eat today', ['Nourish', 'plan'])}
    <div class="hscroll">
      <button class="rcard ${photoUrl(recipe.id) ? 'has-photo' : ''}" data-action="nav" data-to="recipe/${recipe.id}">${recipeArt(recipe, 'wave', 1)}<div class="rc-top"><span class="rc-k">Recipe${recipe.warm ? ' · Warm' : recipe.raw ? ' · Raw' : ''}</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${recipe.name}</div><div class="rc-m">${recipe.time} min · ${recipe.meal}</div></button>
      ${(() => { const ls = lemonState(); return `<button class="rcard ${carePhoto('lemon-water') ? 'has-photo' : ''}" data-action="nav" data-to="remedy/lemon-water">${careArt('lemon-water', 'orb', 4)}<div class="rc-top"><span class="rc-k">Morning ritual</span><span class="rc-go">${ls && !ls.over && ls.doneToday ? icon('check', 16) : icon('chevR', 16)}</span></div><div class="rc-t">Lemon water</div><div class="rc-m">${ls && !ls.over ? `Day ${ls.day} of 28` : 'Start your 28 days'}</div></button>`; })()}
      ${(() => { const S = SUPERFOODS[info.phase], L0 = S.list.filter(f => !(f[5] && myDiet() === 'vegan')), f = L0[dayNum(today) % L0.length], pic = f[4] ? (f[4][0] === 'tea' ? teaPhoto(f[4][1], 500, 650) : foodPhoto(f[4][1], 500)) : null;
        return `<button class="rcard sf-card ${pic ? 'has-photo' : ''}" data-action="superGo">${pic ? `<img class="rc-photo" src="${pic}" alt="" loading="lazy"><span class="rc-shade"></span>` : `${glowArt('orb', 7)}<span class="sf-e" aria-hidden="true">${f[0]}</span>`}<div class="rc-top"><span class="rc-k">Superfood</span><span class="rc-go">${icon('chevR', 16)}</span></div><div class="rc-t">${f[1]}</div><div class="rc-m">${f[3].split(/[,.:]/)[0]}</div></button>`; })()}
    </div>

    ${dietGuideCard(info.phase, true)}
    ${habitsHome(info)}

    ${sectionTitle('Your hormones', ['Explore', 'hormones'])}
    <section class="card glass chart-card">${cycleChart(info, { id: 'today', compact: true })}
      <div class="cc-links one"><button data-action="nav" data-to="hormones">${icon('chart', 15)} Explore your hormones ${icon('chevR', 14)}</button></div></section>
    ${moleculeRow(info)}

    ${partnersCard(info)}

    ${logged ? `${sectionTitle('Today’s log', ['Edit', 'log'])}<section class="card glass"><div class="chips">${logChips(tlog)}</div><button class="br-cta" data-action="nav" data-to="brain">${icon('spark', 15)} What your body is saying ${icon('chevR', 15)}</button></section>`
    : `<button class="ci2" data-action="nav" data-to="log">
      <span class="ci2-top"><span class="ci2-k">${icon('heart', 14)} Check-in · day ${info.cd}</span><span class="ci2-chip">${icon('clock', 12)} 30 sec</span></span>
      <span class="ci2-mid"><span><b>How do you feel today?</b><small>Mood, energy, sleep and body. Each check-in sharpens your predictions.</small></span></span>
      <span class="ci2-cta">Log today ${icon('chevR', 14)}</span></button>`}

    ${tipsCard(info)}

    ${sectionTitle('Explore')}
    ${exploreGrid(info)}

    ${readsCard(info)}
    <p class="fine center">Predictions are estimates based on your logs, not medical advice or contraception.</p>
  </div>`;
}
// Explore: every button a full photo with a frosted label.
function exploreGrid(info) {
  const tiles = [['manifest', 'spark', 'Manifest', 'Live it as done', 'images/forest-calm.jpg'], ['hormones', 'book', 'Hormones', 'What each one does', hormonePhoto('Oestrogen', 500)], ['guide', 'chart', 'Cycle guide', `Day ${info.cd}, day by day`, 'images/forest-path.jpg'],
    ['relief', 'heart', 'Relief', 'Cramps, PMS, sleep', 'images/relief-stardust.webp', 'images/relief-stardust.mp4'],
    ['season', 'bowl', 'In season', 'Local foods', 'images/season-fruit.webp'], ['tea', 'cup', 'Tea guide', 'For every need', 'images/tea-ginger.webp'], ['breathe', 'leaf', 'Breathe', 'Meditate & breathe', 'images/tile-meditate.webp']];
  // round photo bubbles in a 2-3-2 honeycomb, each with its own coloured rim and the name on the photo
  const rim = ['#a98bd0', '#d4708f', '#7f9a4c', '#e08aa5', '#d9a441', '#c98a52', '#6fa49a'];
  const bub = ([to, ic, t, sub, img, vid], i) => `<button class="xb" data-action="nav" data-to="${to}" style="--i:${i};--rim:${rim[i]}" aria-label="${t}: ${sub}">${vid ? `<video class="dpt-vid" src="${vid}" poster="${img}" muted loop playsinline preload="none" aria-hidden="true"></video>` : `<img src="${img}" alt="" loading="lazy">`}<span class="xb-t">${t}</span></button>`;
  const rows = [tiles.slice(0, 2), tiles.slice(2, 5), tiles.slice(5)];
  let k = 0;
  return `<div class="xp3">${rows.map(r => `<div class="xp3-r">${r.map(x => bub(x, k++)).join('')}</div>`).join('')}</div>`;
}
// Home: today's habits as a cute tick list; her phase's habits first, a little sprout that grows leaves as she ticks.
const HB_SHORT = { 'phone-free': ['mind', 'Phone-free hour'], calm: ['heart', '10 min meditation'], coffee: ['cup', 'Coffee with food'], sleep: ['moon', '7 to 9h sleep'], 'real-food': ['bowl', 'Real food'], 'alcohol-free': ['drop', 'No alcohol'], 'no-blue': ['sun', 'Dim screens at night'], move: ['leaf', 'Move your body'], nature: ['seed', 'Time in nature'], clean: ['spark', 'Clean beauty'], 'warm-feet': ['thermo', 'Warm feet'], 'egg-yolks': ['shell', 'Egg yolks'] };
function habitsHome(info) {
  const list = HABITS.filter(h => h.g === 'protect' && HB_SHORT[h.id]), ids = list.map(h => h.id), done = habitsDone(todayISO()).filter(id => ids.includes(id));
  const focus = info ? HABIT_FOCUS[info.phase].filter(id => ids.includes(id)) : [];
  const pick = [...focus, ...ids.filter(id => !focus.includes(id))].slice(0, 6), n = pick.filter(id => done.includes(id)).length;
  const leaves = pick.map((_, i) => { const y = 52 - i * 7.5, l = i % 2 === 0; return `<path class="${i < n ? 'on' : ''}" d="M30 ${y} q${l ? -13 : 13} -2 ${l ? -15 : 15} -11 q${l ? 11 : -11} 1 ${l ? 15 : -15} 11z"/>`; }).join('');
  return `${sectionTitle('Daily habits', ['All', 'habits'])}
    <section class="card hh">
      <div class="hh-top"><svg class="hh-sprout" viewBox="0 0 60 64" aria-hidden="true"><path class="hh-stem" d="M30 62 V${52 - (pick.length - 1) * 7.5 - 8}"/>${leaves}</svg>
        <div><b class="hh-n">${n}<small>/${pick.length}</small></b><span>${n === pick.length ? 'All done. Your hormones thank you.' : n ? 'Growing nicely, keep going' : 'Tick one to grow a leaf'}</span></div></div>
      <div class="hh-list">${pick.map(id => { const [ic, t] = HB_SHORT[id], on = done.includes(id); return `<button class="hh-i ${on ? 'on' : ''}" data-action="habitTick" data-id="${id}" aria-pressed="${on}"><span class="hh-cb">${icon(on ? 'check' : ic, 14, on ? 2.6 : 1.8)}</span><span>${t}</span>${focus.includes(id) ? '<i class="hh-ph" title="Good for your phase"></i>' : ''}</button>`; }).join('')}</div>
    </section>`;
}
function logChips(l) {
  const out = [], e = x => `${icon(LOG_IC[x] || 'spark', 13)} ${x}`;
  if (l.flow) out.push(`${icon('drop', 13)} ${FLOWS.find(f => f.id === l.flow)?.label}`);
  if (l.fluid) out.push(e(l.fluid));
  if (l.bcol) out.push(`${icon('drop', 13)} ${l.bcol}`);
  [...(l.down || []), ...(l.symptoms || []), ...(l.moods || []), ...(l.disrupt || [])].forEach(s => out.push(e(s)));
  if (l.energy) out.push(`${icon('bolt', 13)} Energy ${l.energy}/5`);
  if (l.sleep != null) out.push(`${icon('moon', 13)} ${l.sleep}h sleep`);
  (l.supp || []).forEach(x => out.push(`${icon('check', 13)} ${x}`));
  return out.map(x => `<span class="chip static">${x}</span>`).join('');
}

// ---------- plan ahead: events on future days, with how to prepare for that part of the cycle ----------
const EV_KINDS = [['date', 'heart', 'Date'], ['exam', 'book', 'Exam'], ['trip', 'plane', 'Trip'], ['talk', 'mic', 'Presentation'], ['party', 'star', 'Party'], ['sport', 'bolt', 'Sport event'], ['other', 'spark', 'Other']];
const EV_GROUP = { 'flow-start': 'men', 'flow-end': 'men', rising: 'fol', building: 'fol', peak: 'ovu', settle: 'lut', focus: 'lut', premenstrual: 'pre' };
const EV_PREP = {
  date: { men: 'Plan something cosy: dinner in, a film, warm food. Bring supplies.', fol: 'Try something new together. You feel curious and light.', ovu: 'Your most radiant, social days. Go out and dress up.', lut: 'Choose calm and warm: a slow dinner or a long walk.', pre: 'Eat before you go and keep it cosy, close to home.' },
  exam: { men: 'Study early so the last days are light. Warm protein breakfast, heat for cramps, sleep in.', fol: 'Fresh energy and motivation: a good time to sit it.', ovu: 'Energy is often high. Eat protein before, don’t skip breakfast.', lut: 'Protein snacks keep your energy and focus steady.', pre: 'Plan breaks, eat every 3–4 hours, magnesium the evenings before and early nights.' },
  trip: { men: 'Pack supplies, a heat patch and ginger tea. Plan rest stops.', fol: 'Perfect for adventure and new places.', ovu: 'Social and full of energy: great for city trips and friends.', lut: 'Pack snacks and something cosy. Plan some quiet time.', pre: 'Your period may start on the trip: pack supplies, warm layers and magnesium. Travel can shift it a day or two.' },
  talk: { men: 'Keep it simple, rehearse early and rest the day before.', fol: 'Fresh energy: a good day for it.', ovu: 'Many women feel most social and outgoing now.', lut: 'Prepare notes and breathe out slowly before you start.', pre: 'Prepare well ahead, eat protein before, box breathing right before you go on.' },
  party: { men: 'Go if you feel like it and leave early, guilt-free. Warm drinks.', fol: 'Say yes: you’ll enjoy meeting people.', ovu: 'Your sparkling days. Enjoy it fully.', lut: 'Eat a real meal first so you don’t crash.', pre: 'Eat before you go. Alcohol can hit harder now, so plan to leave early.' },
  sport: { men: 'Go easier: longer warm-up, lighter pace, keep warm after.', fol: 'Energy is rising: push a bit harder in training if you feel like it.', ovu: 'Energy is often high. Warm up well, your joints may be looser.', lut: 'Steady pace. Drink more, you run hotter.', pre: 'Lower the intensity, focus on technique, extra carbs the day before.' },
  other: { men: 'Keep the day light, stay warm and rest when you can.', fol: 'Fresh energy: a good time for new things.', ovu: 'Your most outgoing, confident days.', lut: 'Steady and focused. Eat regularly and plan a calm evening.', pre: 'Plan buffers, warm food and an early night before.' },
};
function events() { return state.events = state.events || []; }
function evInfo(e) { const di = C.dayInfo(C.parseISO(e.date), M.stats); if (!di) return null; return { di, prep: (EV_PREP[e.kind] || EV_PREP.other)[EV_GROUP[dayWindow(di)]] }; }
function evKind(k) { return EV_KINDS.find(x => x[0] === k) || EV_KINDS[6]; }
function evName(e) { return e.t || evKind(e.kind)[2]; }
const gday = d => C.iso(d).replace(/-/g, '');
function gcalUrl(e) {
  const x = evInfo(e), d = C.parseISO(e.date);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: evName(e), dates: `${gday(d)}/${gday(C.addDays(d, 1))}`, details: x ? `Day ${x.di.cd} · ${PHASES[x.di.phase].name} phase. ${x.prep} (Underskin)` : '' });
  return 'https://calendar.google.com/calendar/render?' + q;
}
function evCard(e) {
  const x = evInfo(e), k = evKind(e.kind);
  return `<div class="ev-card"><span class="ev-g">${icon(k[1], 20)}</span><div class="ev-b"><b>${esc(evName(e))}</b>
    ${x ? `<small>${fmt(C.parseISO(e.date), { weekday: 'short', month: 'short', day: 'numeric' })} · day ${x.di.cd} · ${PHASES[x.di.phase].name}</small><p>${x.prep}</p>` : ''}
    <div class="ev-act"><a class="ev-g-btn" href="${gcalUrl(e)}" target="_blank" rel="noopener">${icon('calendar', 13)} Add to Google Calendar</a><button class="link muted-l" data-action="evDel" data-id="${e.id}">Remove</button></div></div></div>`;
}
function planForm(date) {
  if (ui.planOpen !== date) return `<button class="btn btn-outline-dark btn-block ev-add" data-action="planOpen" data-date="${date}">${icon('plus', 16)} Plan something on this day</button>`;
  const kind = ui.planKind || 'date';
  return `<div class="ev-form"><div class="ev-kinds">${EV_KINDS.map(([k, g, n]) => `<button class="${k === kind ? 'on' : ''}" data-action="planKind" data-v="${k}">${icon(g, 14)} ${n}</button>`).join('')}</div>
    <div class="dp-actions"><button class="btn btn-outline-dark" data-action="planOpen" data-date="">Cancel</button><button class="btn btn-dark" data-action="planSave" data-date="${date}">${icon('check', 16)} Save</button></div></div>`;
}
function upcomingEvents() {
  const t = todayISO(), list = events().filter(e => e.date >= t).sort((a, b) => a.date < b.date ? -1 : 1);
  return `${sectionTitle('Coming up')}
    ${list.length ? `<div class="ev-list">${list.slice(0, 6).map(evCard).join('')}</div>` : `<p class="fine" style="margin:0 4px 10px">Tap a future day above and plan a date, exam, trip or presentation. You’ll see which phase you’ll be in and how to prepare.</p>`}`;
}
// Calendar top: one dial of her cycle with today's marker, the big number, and three bubbles.
const PH_HEX = { menstrual: '#d9768f', follicular: '#6c823e', ovulatory: '#d6a443', luteal: '#9b87c4' };
function calDial(inf, size = 132) {
  const L = inf.L, cx = size / 2, r = size / 2 - 10, gap = 1.2, runs = [];
  for (let d = 1; d <= L; d++) { const p = C.phaseFor(d, L, inf.P); if (runs.length && runs[runs.length - 1].p === p) runs[runs.length - 1].b = d; else runs.push({ p, a: d, b: d }); }
  const ang = d => -90 + (d - 1) / L * 360, cd = Math.min(inf.cd, L);
  const arcs = runs.map(({ p, a, b }) => `<path d="${arcPath(cx, cx, r, ang(a) + gap, ang(b + 1) - gap)}" stroke="${PH_HEX[p]}" stroke-width="${p === inf.phase ? 11 : 7}" stroke-linecap="round" fill="none" opacity="${p === inf.phase ? 1 : .55}"/>`).join('');
  const [mx, my] = polar(cx, cx, r, ang(cd + .5));
  return `<svg class="cdial" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${arcs}
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="8.5" fill="#fff" stroke="#20301a" stroke-width="2.5"/></svg>
    <span class="cdial-c"><small>Day</small><b>${inf.cd}</b><em>of ${L}</em></span>`;
}
function calTop(inf, fStart, nextOv, short) {
  const fertileNow = inf.fertile && !inf.isPeriod, dOv = inf.daysToOv, ph = PHASES[inf.phase];
  const big = inf.isPeriod ? [`${inf.cd}`, 'day of your period'] : inf.late ? [`${inf.late}`, inf.late === 1 ? 'day late' : 'days late'] : [`${inf.daysToPeriod}`, inf.daysToPeriod === 1 ? 'day to your period' : 'days to your period'];
  const sub = inf.isPeriod ? `Next one ${fmt(C.addDays(inf.cycleStart, inf.L), { weekday: 'short', month: 'short', day: 'numeric' })}` : inf.late ? 'A late period is common. Stress and travel can shift it.' : `Expected ${fmt(inf.nextStart, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  const bub = (c, k, v, s) => `<div class="cb3" style="--c:${c}"><i></i><small>${k}</small><b>${v}</b><span>${s}</span></div>`;
  return `<section class="cal3">
    <div class="cal3-row"><div class="cal3-num"><span class="eyebrow">${inf.isPeriod ? 'Your period' : inf.late ? 'Your period' : 'Next period'}</span>
      <b class="dotnum">${big[0]}</b><p>${big[1]}</p><small>${sub}</small></div>
      <div class="cdial-w">${calDial(inf)}</div></div>
  </section>`;
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
      cls.push(`ph-${di.phase}`);
      // her period is running: every day from its first day to its expected end is red, unless she logged that day as dry
      const ongoing = M.info && M.info.isPeriod && d >= C.startOfDay(M.info.cycleStart) && d < C.addDays(M.info.cycleStart, M.info.P) && !(lg && lg.flow === 'none');
      if (di.periodActual || ongoing) cls.push('period');
      else if (di.periodPredicted) cls.push('period-pred');
      else if (di.isOvulation && di.cd <= di.L) cls.push('ovu');
      else if (di.fertile && di.cd <= di.L) cls.push('fertile');
    }
    if (k === todayISO()) cls.push('today');
    if (k === ui.calSelected && !ui.calEdit) cls.push('sel');
    if (ui.calEdit && d > today) cls.push('locked');
    cells += `<button class="${cls.join(' ')}" data-action="calSelect" data-date="${k}"><span>${n}</span>${lg && (lg.symptoms || lg.moods || lg.notes) ? '<i class="logdot"></i>' : ''}${events().some(e => e.date === k) ? '<i class="evdot"></i>' : ''}</button>`;
  }
  const sd = C.parseISO(ui.calSelected), si = C.dayInfo(sd, stats), slog = getLog(ui.calSelected);
  const isFuture = sd > today;
  const hasFlow = PERIOD_FLOWS.includes(slog.flow);
  const nextP = M.info ? M.info.nextStart : null;
  const ov = M.info ? C.addDays(M.info.cycleStart, M.info.ov - 1) : null;
  const nextOv = ov && ov < today ? C.addDays(ov, M.info.L) : ov;
  const thisMonth = m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth();
  const slide = ui.calSlide ? (ui.calSlide > 0 ? 'slide-l' : 'slide-r') : ''; ui.calSlide = 0;
  const inf = M.info, fStart = nextOv ? C.addDays(nextOv, -5) : null;
  const short = d => fmt(d, { month: 'short', day: 'numeric' });
  const answer = inf ? calTop(inf, fStart, nextOv, short) : '';
  const selLine = si ? (si.periodActual ? `Period · day ${si.cd}` : si.periodPredicted ? 'Period expected' : si.isOvulation ? 'Egg release (estimate)' : si.fertile ? `Fertile · ${PHASES[si.phase].name}` : `${PHASES[si.phase].name} · day ${si.cd}`) : '';
  return `${topbar('Calendar')}
  <div class="pad">
    ${answer}
    <div class="cal-head"><button class="icon-btn" data-action="calMove" data-d="-1" aria-label="Previous month">${icon('chevL', 20)}</button>
      <h2><button class="cal-title" data-action="calPick">${fmt(m, { month: 'long' })} <span>${m.getFullYear()}</span>${icon('chevD', 16)}</button>${thisMonth ? '' : '<button class="cal-today" data-action="calToday">Today</button>'}</h2>
      <button class="icon-btn" data-action="calMove" data-d="1" aria-label="Next month">${icon('chevR', 20)}</button></div>
    <section class="card glass cal cal2 ${ui.calEdit ? 'editing' : ''}">
      <div class="cal-w">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div>
      ${ui.calPick ? `<div class="cal-pick"><div class="cp-y"><button class="icon-btn" data-action="calYear" data-d="-1" aria-label="Previous year">${icon('chevL', 18)}</button><b>${ui.calPick}</b><button class="icon-btn" data-action="calYear" data-d="1" aria-label="Next year">${icon('chevR', 18)}</button></div>
        <div class="cp-m">${Array.from({ length: 12 }, (_, i) => `<button class="${ui.calPick === m.getFullYear() && i === m.getMonth() ? 'on' : ''} ${ui.calPick === today.getFullYear() && i === today.getMonth() ? 'now' : ''}" data-action="calSetMonth" data-m="${i}">${fmt(new Date(2000, i, 1), { month: 'short' })}</button>`).join('')}</div></div>`
      : `<div class="cal-grid ${slide}">${cells}</div>`}
      ${ui.calEdit ? `<div class="cal-editbar"><span>Tap each day you bled</span><button class="btn btn-light cal-done" data-action="calEdit">Done</button></div>`
        : `<div class="cal2-legend"><span><i class="lg-p"></i>Period</span><span><i class="lg-f"></i>Fertile</span><span><i class="lg-o"></i>Egg release</span></div>
      ${calDayLine(sd, si, slog, selLine, isFuture)}
      <button class="cal-editbtn" data-action="calEdit">${icon('drop', 15)} Edit period days</button>`}
    </section>
    ${cycleBars()}
    ${events().some(e => e.date >= todayISO()) ? upcomingEvents() : ''}
  </div>
`;
}
// Under the calendar: her last cycles as bars (period days red, the rest in the cycle's phase tints), length in Doto, tap for dates.
function cycleBars() {
  const ps = M.stats.periods, info = M.info; if (!info || ps.length < 2) return '';
  const rows = [];
  for (let i = Math.max(0, ps.length - 7); i < ps.length - 1; i++) { const L = C.diffDays(ps[i + 1].start, ps[i].start); if (L >= 15 && L <= 60) rows.push({ s: ps[i].start, P: Math.min(ps[i].length, L), L }); }
  if (!rows.length) return '';
  const cur = { s: info.cycleStart, P: info.P, L: info.L, now: Math.min(info.cd, info.L) };
  const all = [...rows, cur], max = Math.max(...all.map(r => r.L), 35), avg = M.stats.avgCycle, pm = Math.max(1, Math.round(M.stats.variation / 2));
  const sd = d => fmt(d, { month: 'short', day: 'numeric' }), pct = n => (n / max * 100).toFixed(1);
  const row = (r, i) => { const ov = Math.max(r.P + 1, r.L - 14), end = C.addDays(r.s, r.L - 1);
    return `<details class="cyb-r ${r.now ? 'now' : ''}" style="--i:${i}"><summary><span class="cyb-d">${r.now ? 'Now' : sd(r.s)}</span>
      <span class="cyb-bar"><i class="cyb-p" style="width:${pct(r.P)}%"></i><i class="cyb-e" style="width:${pct(Math.max(0, ov - 6 - r.P))}%"></i><i class="cyb-f" style="width:${pct(Math.max(0, Math.min(5, ov - 1 - r.P)))}%"></i><i class="cyb-o" style="width:${pct(1)}%"></i><i class="cyb-l" style="width:${pct(r.L - ov)}%"></i>${r.now ? `<i class="cyb-fut" style="left:${pct(r.now)}%;width:${pct(Math.max(0, r.L - r.now))}%"></i><b class="cyb-you" style="left:${pct(r.now - .5)}%"></b>` : ''}</span>
      <span class="cyb-n">${r.now ? r.now : r.L}</span></summary>
      <p>${r.now ? `Started ${sd(r.s)} · day ${r.now} of about ${r.L} · next period around ${sd(info.nextStart)}` : `${sd(r.s)} to ${sd(end)} · period ${plural(r.P, 'day')} · egg release around day ${ov}`}</p></details>`; };
  const diff = rows.length > 1 ? M.stats.variation : 0;
  return `${sectionTitle('Your last cycles')}
    <section class="card cyb">
      <div class="cyb-top2"><span class="cyb-big"><b class="dotnum">${avg}</b><small>day cycle</small></span>
        <span class="cyb-chips"><em class="${diff <= 4 ? 'ok' : diff <= 7 ? 'mid' : 'hi'}">${diff <= 4 ? 'Steady' : diff <= 7 ? 'A bit changeable' : 'Varies a lot'} ±${pm}</em><em>${icon('drop', 12)} Period ${M.stats.avgPeriod} days</em></span></div>
      <div class="cyb-rows">${all.map(row).join('')}</div>
      <div class="cyb-leg"><span><i class="cyb-p"></i>Period</span><span><i class="cyb-f"></i>Fertile</span><span><i class="cyb-o"></i>Egg release</span><small>Tap a row</small></div>
    </section>`;
}

// Under the calendar: the moon as one big black widget, the 3D moon as the hero, how lit it is, three ring bubbles, one white pill into the moon page.
function moonWidget() {
  const mn = moonData(), pg = MG.phaseGuideAt(mn.elong), info = M.info, phase = info && info.phase;
  const L = (M.stats && M.stats.cycleLength) || state.profile.cycleLength || 28, lit = Math.round(mn.illum * 100), plain = MG.MOON_PLAIN[pg.k] || MG.MOON_PLAIN.new;
  const next = [['New moon', mn.nextNew, 'new'], ['Full moon', mn.nextFull, 'full']].filter(x => x[1]).sort((a, b) => a[1] - b[1])[0];
  const days = next ? Math.max(0, Math.round((next[1] - Date.now()) / 864e5)) : 0;
  return `<section class="cn cn2 sw">${skyDust()}
    <button class="sw-top" data-action="nav" data-to="moon"><span class="cn-pill">${icon('moon', 14)} The moon</span><span class="sw-go" aria-label="Open the moon page">${icon('chevR', 18)}</span></button>
    <div class="sw-sky"><div class="mn-orb sw-orb">${moonArt(mn.elong, 'mn-flat')}<canvas class="moon3d" data-e="${mn.elong.toFixed(1)}" aria-label="The Moon as it looks tonight, ${lit} percent lit. Drag to turn it."></canvas></div></div>
    <div class="cn-score"><small>Tonight</small><b>${lit}%</b><span>${pg.name}</span></div>
    <div class="cn-rings">
      ${ringBub(info ? info.cd / L : 0, info ? info.cd : '–', 'day', 'Body', info ? MG.INNER_SEASON[phase].name : 'your cycle', 'body')}
      ${ringBub(mn.age / 29.53, Math.floor(mn.age) + 1, '', 'Moon day', 'of 29.5', 'moon')}
      ${ringBub(next ? 1 - days / 15 : 0, days, 'd', next ? next[0] : 'Next', next ? mnDay(next[1]) : '', 'self')}
    </div>
    <div class="cn-msg"><small>${pg.theme} · ${mn.waxing ? 'growing' : 'shrinking'}</small><p>${plain[1][0]}</p><button class="cn-cta" data-action="nav" data-to="moon">Open the moon</button></div>
  </section>`;
}
// The tapped day as one quiet line: the date, what it is, one pill to log it.
function calDayLine(sd, si, slog, selLine, isFuture) {
  const c = si ? (si.periodActual || si.periodPredicted ? '#d42a40' : si.isOvulation ? '#d6a443' : si.fertile ? '#c9b98a' : PH_HEX[si.phase]) : '#c9c9c9';
  const logged = !!(slog.symptoms?.length || slog.moods?.length || slog.flow || slog.notes);
  return `<div class="cdl day-panel"><i style="background:${c}"></i><span><small>${fmt(sd, { weekday: 'short', month: 'short', day: 'numeric' })}</small><b>${selLine || 'No cycle data yet'}</b></span>
    ${isFuture ? '' : `<button class="cdl-go" data-action="logDay" data-date="${C.iso(sd)}">${icon(logged ? 'check' : 'plus', 14)} ${logged ? 'Edit' : 'Log'}</button>`}</div>`;
}
// The tapped day as a glass card: hormone and energy rings, her mode for the day, what she logged.
function calDayCard(sd, si, slog, selLine, isFuture, hasFlow) {
  const head = `<div class="cd-h"><div><small>${fmt(sd, { weekday: 'long', month: 'long', day: 'numeric' })}</small><b>${selLine || 'No cycle data yet'}</b></div>
    ${isFuture ? '' : `<button class="cal2-btn ${hasFlow ? 'on' : ''}" data-action="togglePeriod">${icon('drop', 14)} ${hasFlow ? 'Bled' : 'Bled?'}</button>`}</div>`;
  if (!si) return `<div class="cal2-sel cd day-panel">${head}</div>`;
  const { cd, L, P } = si, rel = C.hormonesRel(cd, L, P), c = COMPASS[dayWindow(si)];
  const rings = [['Estrogen', rel.estrogen], ['Progest.', rel.progesterone], ['Testost.', rel.testosterone], ['Energy', C.energyAt(cd, L, P)]].map(([n, v], i) => {
    const R = 22, len = 2 * Math.PI * R, lvl = i === 3 ? (v < .5 ? 'Low' : v < .7 ? 'Steady' : 'High') : C.hormoneLevel(v);
    return `<div class="cd-r"><svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="${R}" class="cd-bg"/>${v > .02 ? `<circle cx="27" cy="27" r="${R}" class="cd-fg" stroke-dasharray="${(v * len).toFixed(1)} ${len.toFixed(1)}" transform="rotate(-90 27 27)"/>` : ''}</svg>
      <span class="cd-n">${Math.round(v * 100)}</span><small>${n}</small><em>${lvl}</em></div>`;
  }).join('');
  const logged = [...(slog.symptoms || []), ...(slog.moods || [])].slice(0, 6), dayEv = events().filter(e => e.date === C.iso(sd));
  return `<div class="cal2-sel cd day-panel">${head}
    <div class="cd-rings">${rings}</div>
    <div class="cd-mode"><span class="cd-m">${c.mode}</span><p>${c.why}</p></div>
    ${logged.length ? `<div class="cd-log">${logged.map(x => `<span>${icon(LOG_IC[x] || 'spark', 13)} ${x}</span>`).join('')}</div>` : ''}
    ${dayEv.map(evCard).join('')}
    <div class="cd-cta">${isFuture ? '' : `<button class="pill-cta" data-action="logDay" data-date="${C.iso(sd)}">${icon('plus', 14)} ${logged.length ? 'Edit log' : 'Log this day'}</button>`}
      <button class="cd-link" data-action="nav" data-to="hormones">Your hormones ${icon('chevR', 14)}</button></div>
    <p class="cd-note">Estimated from your cycle · rings show where each hormone sits in its own monthly range.</p>
  </div>`;
}

// ---------- your cycle in Apple / Google Calendar (.ics with one all-day event per stretch) ----------
const CAL_WORD = { // one word per stretch of the cycle, shown as the calendar event title
  'flow-start': ['🩸', 'Period', 'Rest'], 'flow-end': ['🩸', 'Period', 'Plan'],
  rising: ['🌱', 'Follicular', 'Gym'], building: ['🌱', 'Follicular', 'Model'],
  peak: ['✨', 'Ovulation', 'Party'], settle: ['🍂', 'Luteal', 'Focus'],
  focus: ['🍂', 'Luteal', 'Finish'], premenstrual: ['🌙', 'Pre-period', 'Cosy'],
};
function calStretches(days = 182, start = M.today) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = C.addDays(start, i), di = C.dayInfo(d, M.stats); if (!di) continue;
    const w = dayWindow(di), last = out[out.length - 1];
    if (last && last.w === w && +C.addDays(last.to, 1) === +d) last.to = d; else out.push({ w, from: d, to: d, di });
  }
  return out;
}
// everything that goes into her calendar: the cycle stretches plus her own plans
function calItems() {
  // from the start of this cycle, so today's stretch shows in full
  const out = calStretches(182 + C.diffDays(M.today, M.info.cycleStart), M.info.cycleStart).map(x => { const [g, ph, word] = CAL_WORD[x.w], c = COMPASS[x.w];
    return { k: `${ymdOf(x.from)}-${x.w}`, t: `${g} ${ph} · ${word}`, from: x.from, to: x.to, d: `${c.mode}. ${c.why}\nLean into: ${c.work}\n\nAn estimate from Underskin, not contraception.` }; });
  events().filter(e => e.date >= todayISO()).forEach(e => { const x = evInfo(e), d = C.parseISO(e.date);
    out.push({ k: 'e' + e.id, t: evName(e), from: d, to: d, d: x ? `Day ${x.di.cd} · ${PHASES[x.di.phase].name} phase. ${x.prep}` : '' }); });
  return out;
}
const ymdOf = d => C.iso(d).replace(/-/g, '');
function calICS() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const txt = t => String(t).replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const ev = calItems().map(x => ['BEGIN:VEVENT', `UID:uts-${x.k}@undertheskin`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymdOf(x.from)}`, `DTEND;VALUE=DATE:${ymdOf(C.addDays(x.to, 1))}`,
    `SUMMARY:${txt(x.t)}`, `DESCRIPTION:${txt(x.d)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT'].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Underskin//Cycle//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:My cycle', ...ev, 'END:VCALENDAR'].join('\r\n');
}
// In the iPhone / Android app: write straight into a "My cycle" calendar on the phone (it syncs on to
// iCloud or Google from there) and rewrite it whenever her cycle or plans change.
const calPlugin = () => NATIVE && CAP.Plugins?.CapacitorCalendar;
let calTimer = null, calBusy = false;
function calSoon() { if (state?.profile?.calSync && calPlugin()) { clearTimeout(calTimer); calTimer = setTimeout(() => calWrite(false), 1500); } }
async function calWrite(ask) {
  const P = calPlugin(), pr = state.profile; if (!P || !M.info || calBusy) return false;
  const items = calItems(), key = items.map(x => x.k + ymdOf(x.to) + x.t).join('|');
  if (!ask && pr.calKey === key) return true; // nothing changed since the last write
  calBusy = true;
  try {
    if (ask && (await P.requestFullCalendarAccess())?.result !== 'granted') { toast('Allow calendar access in your phone settings to sync'); return false; }
    const cals = (await P.listCalendars())?.result || [];
    if (!pr.calId || !cals.some(c => c.id === pr.calId)) { pr.calId = (await P.createCalendar({ title: 'My cycle', color: '#9fcf8c', accountName: 'Underskin' })).id; pr.calEv = []; }
    if (pr.calEv?.length) await P.deleteEventsById({ ids: pr.calEv, commit: false }).catch(() => {});
    const ids = [];
    for (const x of items) { const r = await P.createEvent({ calendarId: pr.calId, title: x.t, description: x.d, isAllDay: true, startDate: +x.from, endDate: +x.to, commit: false }); if (r?.id) ids.push(r.id); }
    if (CAP.getPlatform?.() === 'ios') await P.commit().catch(() => {});
    Object.assign(pr, { calEv: ids, calKey: key, calSync: true, calAdded: Date.now() }); save(true);
    return true;
  } catch { if (ask) toast('Couldn’t reach your calendar. Try again.'); return false; }
  finally { calBusy = false; }
}
async function calStop() {
  const P = calPlugin(), pr = state.profile;
  if (P && pr.calId) await P.deleteCalendar({ id: pr.calId }).catch(() => {});
  Object.assign(pr, { calSync: false, calId: null, calEv: [], calKey: null }); save(true); toast('Removed from your calendar'); render();
}
function calSyncCard() {
  const next = calStretches(40).slice(0, 4), added = state.profile.calAdded, stale = added && M.stats.periods.length && +M.stats.periods[M.stats.periods.length - 1].start > added;
  return `${sectionTitle('In your calendar')}
    <section class="card glass cal-sync">
      <div class="cs-ev">${next.map((x, i) => { const [g, ph, word] = CAL_WORD[x.w]; return `<div class="${i === 0 ? 'now' : ''}"><span class="cs-d">${i === 0 ? 'Now' : fmt(x.from, { month: 'short', day: 'numeric' })}</span><span class="cs-t">${g} ${ph} · <b>${word}</b></span></div>`; }).join('')}</div>
      <p class="body sm">Your next 6 months in Apple or Google Calendar: one word for each part of your cycle, plus the plans you add here, so you see it all at a glance.</p>
      ${calPlugin() ? (state.profile.calSync
        ? `<div class="cs-on">${icon('check', 14, 2.4)} Syncing to your “My cycle” calendar. It updates by itself.</div>
           <button class="link center-link" data-action="calStop">Stop syncing</button>`
        : `<button class="btn btn-light btn-block" data-action="calSync">${icon('calendar', 16)} Sync with my calendar</button>`)
      : `<button class="btn btn-light btn-block" data-action="calSync">${icon('calendar', 16)} ${stale ? 'Update my calendar' : added ? 'Add again' : 'Add to my calendar'}</button>
      ${stale ? '<p class="fine" style="margin:8px 0 0">You logged a new period since you added it. Add it again so the dates match.</p>' : ''}`}
    </section>`;
}

const LOG_SECS = [['flow', 'drop', 'Period & down there'], ['body', 'user', 'Body'], ['mind', 'mind', 'Mind & mood'], ['rest', 'bolt', 'Energy'],
  ['desire', 'heart', 'Desire & intimacy'], ['disrupt', 'clock', 'Cycle disruptors'], ['note', 'book', 'Note']];
// What she is most likely to feel today: her own patterns first, then what's common in this phase.
const PHASE_LIKELY = { menstrual: ['Cramps', 'Fatigue', 'Back pain', 'Bloating'], follicular: ['Energetic', 'Glowing skin', 'Acne', 'Headache'],
  ovulatory: ['Energetic', 'Glowing skin', 'Bloating', 'Pelvic pain'], luteal: ['Bloating', 'Tender breasts', 'Cravings', 'Acne'] };
function likelyToday(di) {
  const all = BODY_GROUPS.flatMap(([, l]) => l), out = [];
  if (di && M.stats.periods.length) patterns().list.filter(x => di.cd >= x.from && di.cd <= x.to).forEach(x => out.push(x.name));
  if (di) out.push(...PHASE_LIKELY[di.phase]);
  return [...new Set(out)].map(n => all.find(([v]) => v === n)).filter(Boolean).slice(0, 4);
}
const lgPick = (on, field, v, multi, cls, inner, lab = v) => `<button class="${cls} ${on ? 'on' : ''}" data-action="logSet" data-field="${field}" data-v="${esc(v)}" data-multi="${multi ? 1 : ''}" aria-pressed="${on}" aria-label="${esc(lab)}">${inner}</button>`;
const DRIVE = [['🌙', 'Quiet'], ['🌸', 'Soft'], ['🌷', 'Warm'], ['🌹', 'Craving'], ['🔥', 'On fire']];
const SLIDER_WORDS = { body: ['Rough', 'Meh', 'Okay', 'Good', 'Great'], mind: ['Heavy', 'Low', 'Okay', 'Good', 'Light'], drive: ['None', 'Low', 'Medium', 'High', 'On fire'] };
function logSlider(field, q, l) {
  const v = l[field], set = v != null;
  return `<div class="lg-slide ${set ? 'set' : ''}" style="--v:${((set ? v : 3) - 1) / 4}">
    <div class="lg-sq"><span>${q}</span><b id="lv-${field}">${set ? SLIDER_WORDS[field][v - 1] : 'Slide to set'}</b></div>
    <input type="range" min="1" max="5" step="1" value="${set ? v : 3}" data-input="log.${field}" aria-label="${q}">
    <div class="lg-ends"><span>${SLIDER_WORDS[field][0]}</span><span>${SLIDER_WORDS[field][4]}</span></div></div>`;
}
// A tea for what she logged in the check-in. [warm-window swap] keeps cooling herbs away from her period days.
const SYMPTOM_TEA = {
  Cramps: 'Ginger', 'Ovulation pain': 'Chamomile', 'Pelvic pain': 'Ginger', Headache: ['Peppermint', 'Ginger'], 'Back pain': 'Ginger', 'Joint pain': 'Ginger',
  'Tender breasts': 'Dandelion leaf', Bloating: 'Fennel', Nausea: 'Ginger', Constipation: 'Dandelion leaf', Diarrhea: 'Chamomile', Cravings: 'Cinnamon', 'Big appetite': 'Cinnamon',
  Acne: 'Spearmint', 'Oily skin': 'Spearmint', 'Dry skin': 'Rose', 'Hair shedding': 'Nettle', Fatigue: ['Green tea', 'Ginger & red dates'], Insomnia: 'Valerian root',
  'Brain fog': 'Rosemary', Dizziness: 'Ginger & red dates', 'Cold hands & feet': 'Cinnamon', 'Feeling hot': ['Hibiscus', 'Rose'], 'Night sweats': 'Rose',
  Anxious: 'Chamomile', Stressed: 'Lavender', Sad: 'Saffron', 'Low mood': 'Saffron', Tearful: 'Lemon balm', Sensitive: 'Lemon balm',
  Irritable: 'Rose', Angry: 'Rose', 'Mood swings': 'Rose', Unmotivated: ['Green tea', 'Ginger & red dates'],
};
const SYM_GUIDE = { Cramps: 'cramps', 'Pelvic pain': 'cramps', 'Back pain': 'cramps', 'Joint pain': 'cramps', 'Ovulation pain': 'ovulation', Bloating: 'bloating', Constipation: 'bloating',
  'Tender breasts': 'pms', Irritable: 'pms', Angry: 'pms', 'Mood swings': 'pms', Cravings: 'pms', Nausea: 'nausea', Headache: 'headache', Acne: 'skin', 'Oily skin': 'skin', 'Dry skin': 'skin',
  'Hair shedding': 'skin', Fatigue: 'energy', Unmotivated: 'energy', Dizziness: 'heavy', Insomnia: 'sleep', 'Night sweats': 'sleep', Anxious: 'stress', Stressed: 'stress' };
function teaRef(name, sym) { // the tea's page in the guide section that fits the symptom, else the first place it appears
  const order = [SYM_GUIDE[sym], 'feel', ...TEA_GUIDE.map(g => g.k)];
  for (const k of order) { const G = k && TEA_GUIDE.find(g => g.k === k), i = G ? G.teas.findIndex(t => t[1] === name) : -1; if (i >= 0) return { to: `tea/${G.k}-${i}`, why: G.teas[i][2] }; }
  return null;
}
function logTeas(l, di) {
  const warm = warmWindow(di), picks = new Map();
  [...(l.symptoms || []), ...(l.moods || [])].forEach(s => {
    const v = SYMPTOM_TEA[s]; if (!v) return; const n = Array.isArray(v) ? v[warm ? 1 : 0] : v;
    if (!picks.has(n)) picks.set(n, []); picks.get(n).push(s);
  });
  const list = [...picks].slice(0, 2).map(([n, f]) => ({ n, f: f.map(x => x.toLowerCase()), r: teaRef(n, f[0]) })).filter(x => x.r);
  if (!list.length) return '';
  const and = f => f.length > 2 ? `${f.slice(0, 2).join(', ')} & more` : f.join(' & ');
  return `<section class="lt-card"><div class="lt-h">${icon('cup', 16)} <b>Your tea for today</b></div>
    ${list.map(x => `<button class="lt-t" data-action="nav" data-to="${x.r.to}"><img src="${teaPhoto(x.n, 200, 200)}" alt="" loading="lazy"><span><small>For your ${and(x.f)}</small><b>${x.n}</b><em>${x.r.why}</em></span>${icon('chevR', 16)}</button>`).join('')}</section>`;
}
function viewLog() {
  const k = ui.logDate || todayISO(), d = C.parseISO(k), l = getLog(k);
  const isToday = k === todayISO(), di = M.stats ? C.dayInfo(d, M.stats) : null;
  const open = ui.logOpen = ui.logOpen || { flow: 1, body: 1 };
  // Bleeding is only asked for around her period; otherwise one quiet button opens it.
  const bleeding = !!l.flow || !!l.bcol || (di && di.isPeriod && !l.fluid);
  const bleedOn = !di || di.phase === 'menstrual' || di.isPeriod || di.late || (di.daysToPeriod <= 2) || !!l.flow || ui.showBleed === k;
  const chips = (field, list, multi = true) => `<div class="lg-chips">${list.map(([v, e, lab]) => {
    const on = multi ? (l[field] || []).includes(v) : String(l[field]) === v;
    return `<button class="lg-chip lg-tile ${on ? 'on' : ''}" data-action="logSet" data-field="${field}" data-v="${esc(v)}" data-multi="${multi ? 1 : ''}" aria-pressed="${on}"><span class="lt-e" aria-hidden="true">${e}</span><small>${esc(lab || v)}</small></button>`;
  }).join('')}</div>`;
  const has = f => (l[f] || []).length;
  const count = {
    flow: (l.flow ? 1 : 0) + (l.fluid ? 1 : 0) + (l.bcol ? 1 : 0) + has('down'),
    body: has('symptoms'), mind: has('moods'), rest: l.energy ? 1 : 0,
    desire: (l.drive ? 1 : 0) + has('intim'), disrupt: has('disrupt'), note: l.notes ? 1 : 0,
  };
  const inner = {
    flow: `${bleedOn ? `<div class="lg-k">Bleeding</div><p class="lg-why">${icon('spark', 12)}<span>Sharpens your period and egg release dates.</span></p>
      <div class="fd">${FLOWS.map((f, i) => lgPick(l.flow === f.id, 'flow', f.id, false, 'fd-o', `<i style="--s:${[14, 22, 30, 40][i]}px"></i><small>${f.label}</small>`, f.label)).join('')}</div>`
      : `<button class="lg-pstart" data-action="logBleed">${icon('drop', 16)}<span><b>My period started</b><small>Or log bleeding or spotting</small></span>${icon('chevR', 15)}</button>`}
      ${bleeding ? `<div class="lg-k">Colour</div><p class="lg-why">${icon('spark', 12)}<span>The colour shows how fresh the blood is.</span></p>
      <div class="bcl">${BLOOD_COL.map(([v, c]) => lgPick(l.bcol === v, 'bcol', v, false, 'bcl-o', `<i style="--c:${c}"></i><small>${v}</small>`)).join('')}</div>
      ${l.bcol ? `<p class="bcl-say">${BLOOD_COL.find(b => b[0] === l.bcol)?.[2] || ''}</p>` : ''}`
      : `<div class="lg-k">Discharge</div><p class="lg-why">${icon('spark', 12)}<span>Egg white marks your fertile days.</span></p>
      <div class="tx">${DISCHARGE.filter(([v]) => v !== 'Clumpy').map(([v, e]) => lgPick(l.fluid === v, 'fluid', v, false, `tx-o${v === 'Egg white' ? ' fert' : ''}`, `<span>${e}</span><small>${v}</small>`)).join('')}</div>`}
      <div class="lg-k">Anything else</div><p class="lg-why">${icon('spark', 12)}<span>Flags what’s worth a doctor’s check.</span></p>
      <div class="fl">${lgPick(l.fluid === 'Clumpy', 'fluid', 'Clumpy', false, 'fl-o', '<span>☁️</span>Clumpy', 'Clumpy')}${DOWN_EXTRA.map(([v, e]) => lgPick((l.down || []).includes(v), 'down', v, true, 'fl-o', `<span>${e}</span>${v}`)).join('')}</div>
      <details class="lg-star"><summary><span class="lg-star-i" aria-hidden="true">✦</span>What counts as an unusual colour? ${icon('chevD', 13)}</summary>
        <div class="lg-star-b"><p><b>Discharge:</b> healthy is clear, white or cream. Green, yellow-green or grey, especially with a smell or itch, is unusual.</p>
        <p><b>Period:</b> bright red, dark red, brown and pink are all normal. Grey, or orange with a smell, is unusual.</p>
        <p>One odd day is rarely a worry. If it lasts more than a few days, see a doctor or pharmacist.</p></div></details>`,
    body: (() => { const lk = likelyToday(di), lkN = lk.map(([v]) => v), sym = l.symptoms || [];
      return `${lk.length ? `<div class="lg-k">Likely today</div><div class="lk">${lk.map(([v, e]) => lgPick(sym.includes(v), 'symptoms', v, true, 'lk-o', `<span>${e}</span><small>${v}</small>`)).join('')}</div>` : ''}
      ${BODY_GROUPS.map(([g, list]) => { const rest = list.filter(([v]) => !lkN.includes(v)); return rest.length ? `<div class="lg-k">${g}</div><div class="pl">${rest.map(([v, e]) => lgPick(sym.includes(v), 'symptoms', v, true, 'pl-o', `<span>${e}</span>${v}`)).join('')}</div>` : ''; }).join('')}`; })(),
    mind: ['Light', 'Heavy'].map(side => `<div class="lg-k">${side === 'Light' ? 'Feeling light' : 'Feeling heavy'}</div><div class="mb ${side === 'Light' ? 'up' : 'down'}">${MOOD_LIST.filter(([m]) => GOOD_FEELINGS.includes(m) === (side === 'Light')).map(([v, e], i) => {
      const on = (l.moods || []).includes(v); return `<button class="mb-b ${on ? 'on' : ''}" style="--i:${i}" data-action="logSet" data-field="moods" data-v="${esc(v)}" data-multi="1" aria-pressed="${on}"><span>${e}</span><small>${v}</small></button>`; }).join('')}</div>`).join(''),
    rest: `<div class="bt"><div class="bt-body">${[1, 2, 3, 4, 5].map(n => `<button class="bt-c ${l.energy >= n ? 'on' : ''}" data-action="logSet" data-field="energy" data-v="${n}" aria-label="Energy ${n} of 5" aria-pressed="${l.energy === n}"></button>`).join('')}</div><i class="bt-cap"></i></div>
      <div class="dz-l"><span>Drained</span><b>${l.energy ? ['Drained', 'Low', 'Okay', 'Good', 'Radiant'][l.energy - 1] : 'Tap your battery'}</b><span>Radiant</span></div>`,
    desire: `<div class="lg-k">Sex drive</div>
      <div class="dz"><div class="dz-track">
        ${DRIVE.map(([e, w], i) => `<button class="dz-s ${l.drive >= i + 1 ? 'lit' : ''} ${l.drive === i + 1 ? 'on' : ''}" style="--i:${i}" data-action="logSet" data-field="drive" data-v="${i + 1}" aria-label="Sex drive: ${w}" aria-pressed="${l.drive === i + 1}"><span>${e}</span></button>`).join('')}</div>
        <div class="dz-l"><span>Quiet</span><b>${l.drive ? DRIVE[l.drive - 1][1] : 'Tap your level'}</b><span>On fire</span></div></div>
      <div class="lg-k">Sex today</div>
      <div class="sx">${INTIMACY.filter(([n]) => n.startsWith('Sex,')).map(([v, e]) => { const on = (l.intim || []).includes(v); return `<button class="sx-c ${on ? 'on' : ''}" data-action="logSet" data-field="intim" data-v="${esc(v)}" data-multi="1" aria-pressed="${on}"><span>${e}</span><small>${v.endsWith('unprotected') ? 'Unprotected' : 'Protected'}</small></button>`; }).join('')}</div>
      <p class="lg-fine">Only you see this.</p>`,
    fuel: `<div class="lg-k">Food</div>${chips('intake', INTAKE.filter(([n]) => n === 'Raw & cold food'))}<div class="lg-k">Supplements & medicine <button class="link lg-more" data-action="nav" data-to="nutrients">Doses & food first ${icon('chevR', 11)}</button></div>${chips('supp', SUPPS)}`,
    disrupt: `<p class="lg-fine top">These can shift your cycle.</p><div class="rt">${DISRUPTORS.filter(([n]) => ['Alcohol', 'Illness', 'Travel', 'Big stress', 'Shock or loss'].includes(n)).map(([v, e]) => lgPick((l.disrupt || []).includes(v), 'disrupt', v, true, 'rt-o', `<span>${e}</span><small>${v}</small>`)).join('')}</div>`,
    note: `<textarea class="lg-note" rows="3" placeholder="Anything you want to remember about today…" data-input="log.notes">${esc(l.notes || '')}</textarea>`,
  };
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  return `${topbar('Check-in')}
  <div class="pad lg">
    <div class="log-date"><button class="icon-btn" data-action="logMove" data-d="-1" aria-label="Previous day">${icon('chevL', 20)}</button>
      <div><div class="eyebrow">${isToday ? 'Today' : fmt(d, { weekday: 'long' })}${di ? ` · Day ${di.cd} · ${PHASES[di.phase].name}` : ''}</div><h2>${fmt(d, { month: 'long', day: 'numeric' })}</h2></div>
      <button class="icon-btn" data-action="logMove" data-d="1" aria-label="Next day" ${isToday ? 'disabled' : ''}>${icon('chevR', 20)}</button></div>
    ${(() => { const y = state.logs[C.iso(C.addDays(d, -1))]; return !total && y && Object.keys(y).some(f => f !== 'notes') ? `<button class="lg-copy" data-action="logCopy">${icon('plus', 16)}<span><b>Same as yesterday</b><small>One tap, then change what’s different</small></span></button>` : ''; })()}
    ${LOG_SECS.map(([id, e, t], i) => `<section class="lg-sec ${open[id] ? 'open' : ''}" style="animation-delay:${i * 40}ms">
      <button class="lg-head" data-action="logSec" data-s="${id}" aria-expanded="${!!open[id]}"><span class="lg-ic">${icon(e, 18)}</span><b>${t}</b>${count[id] ? `<small>${count[id]}</small>` : ''}<span class="lg-chev">${icon('chevR', 16)}</span></button>
      ${open[id] ? `<div class="lg-in">${inner[id]}</div>` : ''}</section>`).join('')}
    <div class="lg-go"><button class="btn btn-light btn-block" data-action="nav" data-to="brain${isToday ? '' : '/' + k}" ${total ? '' : 'disabled'}>${total ? `Continue ${icon('chevR', 18)}` : 'Tap what fits today'}</button></div>
  </div>`;
}

// ---------- the check-in brain: reads today's log against her phase and her own history ----------
const RAW_COLD = /cucumber|kiwi|berr|cherr|salad|smoothie|iced|chia/i;
const dayRange = x => x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`;
function cyclesWith(name, di) { // other cycles where she logged this
  const set = new Set(), cur = C.iso(di.cycleStart);
  for (const k in state.logs) {
    const l = state.logs[k], hit = (l.symptoms || []).includes(name) || (l.moods || []).includes(name) || (name === 'Spotting' && l.flow === 'spotting');
    if (!hit) continue;
    const d2 = C.dayInfo(C.parseISO(k), M.stats); if (d2 && C.iso(d2.cycleStart) !== cur) set.add(C.iso(d2.cycleStart));
  }
  return set.size;
}
function spotWhy(di, ov, L) {
  if (di.phase === 'menstrual' || di.cd <= 7) return 'Light spotting at the start or end of your period is usually old blood clearing out.';
  if (Math.abs(di.cd - ov) <= 2) return 'Spotting around ovulation is common: estrogen dips for a moment right after the egg is released.';
  if (di.cd >= L - 3) return 'Spotting a day or two before your period often means it’s about to start, as progesterone falls.';
  return 'Spotting at this point in your cycle is less typical. Once is usually nothing (stress, sex, a new pill or travel). If it keeps happening, mention it to a doctor.';
}
function brainRead(k) {
  const l = getLog(k), di = M.stats ? C.dayInfo(C.parseISO(k), M.stats) : null; if (!di) return null;
  const L = di.L || M.stats.avgCycle, ph = di.phase, ov = C.ovulationDay(L, M.stats.avgPeriod), warm = warmWindow({ phase: ph, cd: di.cd, L });
  const P = patterns(), notes = [], cards = [];
  const items = [...(l.symptoms || []), ...(l.moods || [])];
  if (l.flow === 'spotting') items.unshift('Spotting');
  const note = (emo, t, p, ev, tone = 'info') => notes.push({ emo, t, p, ev, tone });
  // signs from down there
  if (l.fluid === 'Egg white') {
    const Pd = M.stats.avgPeriod, base = Math.max(Pd + 3, Math.min(L - 5, L - (M.stats.ovSeen.luteal || 14))), diff = di.cd - base;
    Math.abs(diff) <= 1 ? note('🥚', 'Your fertile sign', `Stretchy, clear discharge is estrogen at its peak, right on time for egg release around day ${ov}.`, 'strong', 'good')
      : note('🥚', `Egg release moved to day ${ov}`, `Your egg-white sign came ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'day' : 'days'} ${diff < 0 ? 'earlier' : 'later'} than I predicted, so I moved this cycle’s egg release and fertile days to match your body.`, 'strong', 'good');
  }
  if (l.fluid === 'Clumpy' || (l.down || []).some(x => ['Unusual colour', 'Strong smell', 'Itching', 'Burning'].includes(x)))
    note('🌸', 'Your intimate balance', 'Clumpy discharge, a new colour or smell, itching or burning can mean a yeast or bacterial imbalance. If it lasts more than a few days, see a doctor or pharmacist.', 'strong', 'warn');
  if (l.bcol === 'Grey' || (l.bcol === 'Orange' && (l.down || []).some(x => ['Strong smell', 'Itching'].includes(x)))) note('🩸', 'About that colour', BLOOD_COL.find(b => b[0] === l.bcol)[2], 'strong', 'warn');
  if ((l.down || []).includes('Blood clots')) note('🩸', 'About clots', 'Small clots on heavy days are normal. Clots bigger than a coin, or soaking a pad or tampon every hour, are worth checking with a doctor.', 'strong', 'warn');
  if (l.flow === 'heavy') note('🥩', 'Heavy day', 'Refill iron: red meat, lentils, dark greens with a squeeze of lemon, and keep warm.', 'strong');
  // sex and desire
  if ((l.intim || []).includes('Sex, unprotected') && di.fertile) note('💞', 'You’re in your fertile window', 'If you’re not trying for a baby, a pharmacist can talk you through emergency contraception. Underskin is not contraception.', 'strong', 'warn');
  if (l.drive >= 4 && Math.abs(di.cd - ov) <= 3) note('🌹', 'Desire right on cue', 'Estrogen and testosterone peak around ovulation, and your sex drive is following them.', 'some', 'good');
  if (l.drive && l.drive <= 2 && (ph === 'luteal' || ph === 'menstrual')) note('🌹', 'Lower desire is normal now', 'With hormones low, desire often quiets. It usually returns as estrogen rises after your period.', 'some');
  // how she feels overall
  if (l.body && l.mind && l.body <= 2 && l.mind <= 2) note('🫶', 'A heavy day', ph === 'menstrual' || di.cd > L - 4 ? 'Low body and low mood are common when hormones are at their lowest. Do less today without guilt. This passes.' : 'A low day outside your usual dip. Rest, eat warm food, and notice if stress or sleep is behind it.', 'some');
  if (l.sleep != null && l.sleep < 6.5) note('🌙', 'Short sleep', ph === 'luteal' ? 'After ovulation your body runs warmer and sleeps lighter. A cool room and magnesium in the evening can help.' : 'Less than 6.5 hours makes cravings, mood and pain all feel stronger tomorrow. Aim for an early night.', 'some');
  // disruptors and intake
  const dis = (l.disrupt || []).filter(x => ['Illness', 'Travel', 'Big stress', 'Shock or loss'].includes(x));
  if (dis.length) note('🌪️', 'Your cycle may shift', `${dis.join(', ')} can delay ovulation, so your next period may come a few days late. I’ll keep that in mind.`, 'some');
  if ((l.disrupt || []).includes('Alcohol') && ph === 'luteal') note('🍷', 'Alcohol before your period', 'It can make PMS, sleep and mood swings feel stronger this week.', 'some');
  if ((l.intake || []).includes('Raw & cold food') && warm) note('🍲', 'Keep it warm these days', 'Chinese medicine keeps food warm and cooked during your period and the days before it, so Blood can flow smoothly.', 'tcm');
  // symptom by symptom
  for (const s of items) {
    const W = SYMPTOM_WHY[s] || {}, good = GOOD_FEELINGS.includes(s), pat = P.list.find(x => x.name === s);
    const why = s === 'Spotting' ? spotWhy(di, ov, L) : W[ph] || W.why || '';
    let learn;
    if (pat) learn = di.cd >= pat.from && di.cd <= pat.to ? `Your pattern: usually on ${dayRange(pat)}, seen in ${pat.cyclesN} cycles.` : `Usually on ${dayRange(pat)} for you. Today is day ${di.cd}, so it came at a different time this cycle.`;
    else { const n = cyclesWith(s, di); learn = n ? `Seen in ${n + 1} cycles so far. A few more check-ins and I’ll predict it for you.` : 'New for me. I’ll watch if it comes back around this day next cycle.'; }
    let other = '';
    if (W.other && ((s === 'Pelvic pain' && !['menstrual', 'ovulatory'].includes(ph)) || (s === 'Low mood' && pat && pat.phase === 'luteal' && pat.cyclesN >= 2) || (s === 'Fatigue' && cyclesWith(s, di) >= 2) || s === 'Night sweats')) other = W.other;
    if (s === 'Spotting' && ph !== 'menstrual' && di.cd > 7 && Math.abs(di.cd - ov) > 2 && di.cd < L - 3 && cyclesWith(s, di) >= 2) other = 'You’ve now spotted mid-cycle in several cycles. That’s worth a calm check with your doctor.';
    const f = SYMPTOM_FOODS[s], foods = f ? f.foods.filter(x => !(warm && RAW_COLD.test(x))).slice(0, 4) : [];
    cards.push({ s, good, why, ev: W.ev || 'some', learn, other, fix: QUICK_FIX[s] || '', foods, rk: reliefKey(s) });
  }
  return { l, di, ph, notes, cards, up: upcomingPatterns(P), P };
}
// What already worked for her (her ♥ relief steps) plus one tea and the nutrients for this symptom.
function brainLinks(k) {
  if (!k || !RELIEF[k]) return '';
  const L = RELIEF_LINKS[k] || {}, help = ((state.reliefHelp || {})[k] || []).map(i => RELIEF[k].steps[i]).filter(Boolean);
  const tea = L.tea ? (TEA_GUIDE.find(t => t.k === L.tea) || { teas: [] }).teas[0] : null;
  const pills = [tea ? `<button data-action="nav" data-to="tea/${L.tea}-0"><span>${icon('cup', 14)}</span>${tea[1]}</button>` : '',
    ...(L.nu || []).slice(0, 2).map(id => { const n = NUTRIENTS.find(x => x.id === id); return n ? `<button data-action="nav" data-to="nutrients/${id}"><span>${nuIc(id, 16)}</span>${n.n}</button>` : ''; })].join('');
  return `${help.length ? `<div class="br-works"><small>${icon('heart', 12)} Works for you</small><p>${help.slice(0, 2).map(x => x.t).join(' · ')}</p></div>` : ''}
      ${pills ? `<div class="br-fix"><small>Teas & nutrients</small></div><div class="tea-more br-pills">${pills}</div>` : ''}`;
}
// Drawn icons for the brain page: one per log group, and one per note.
const LOG_IC = Object.fromEntries([[BODY_GROUPS.flatMap(([, l]) => l), 'user'], [MOOD_LIST, 'mind'], [DISCHARGE, 'drop'], [DOWN_EXTRA, 'drop'], [INTIMACY, 'heart'],
  [INTAKE, 'bowl'], [SUPPS, 'flask'], [DISRUPTORS, 'bolt']].flatMap(([l, ic]) => l.map(([n]) => [n, ic])).concat([['Spotting', 'drop']]));
const NOTE_IC = { '🥚': 'spark', '🌸': 'leaf', '🩸': 'drop', '🥩': 'fish', '💞': 'heart', '🌹': 'heart', '🫶': 'heart', '🌙': 'moon', '🌪️': 'clock', '🍷': 'cup', '🍲': 'thermo' };
// The plan on the body page: one short why, then at most two fixes she can tap, each with a picture.
const SYM_EMOJI = Object.fromEntries([...BODY_GROUPS.flatMap(([, l]) => l), ...MOOD_LIST, ['Spotting', '🩸']]);
const firstLine = t => (t || '').split(/(?<=\.)\s/)[0];
const FIX_EMOJI = [[/heat|hot water|warm (socks|bath)|foot soak/i, '🔥'], [/tea/i, '🍵'], [/magnesium/i, '🌰'], [/walk/i, '🚶‍♀️'], [/water|hydrat/i, '💧'], [/salt/i, '🧂'],
  [/breath/i, '🫧'], [/sleep|night|bed/i, '🌙'], [/protein|egg/i, '🥚'], [/iron|meat/i, '🥩'], [/daylight|sun/i, '☀️'], [/bath/i, '🛁'], [/stretch|cat-cow|yoga/i, '🧘‍♀️'],
  [/zinc|pumpkin/i, '🎃'], [/ginger/i, '🫚'], [/fennel|peppermint|mint/i, '🌿'], [/chocolate/i, '🍫'], [/banana|potato/i, '🍌'], [/bra\b/i, '👙'], [/cream|oil|cleanse|mask/i, '🧴'],
  [/omega|salmon|fish/i, '🐟'], [/call|company|kind/i, '📞'], [/broth|congee|soup|warm meal|cooked/i, '🍲'], [/fibre|fiber/i, '🥦'], [/eat|meal|snack/i, '🍽️']];
function planRecs(c, warm) {
  const fix = c.fix.replace(/\.$/, '').split(/,\s*|\.\s+|;\s*/)[0], cap = fix.charAt(0).toUpperCase() + fix.slice(1);
  const breathe = ['Anxious', 'Irritable', 'Sensitive', 'Low mood', 'Headache'].includes(c.s);
  const out = [breathe ? { k: 'Breathe', t: 'Calm sigh, 1 min', e: '🫧', to: 'breathe' }
    : { k: 'Do this', t: cap, e: (FIX_EMOJI.find(([r]) => r.test(fix)) || [, '🌿'])[1], to: c.rk ? `relief/${encodeURIComponent(c.rk)}` : 'relief' }];
  const v = SYMPTOM_TEA[c.s], tea = v && (Array.isArray(v) ? v[warm ? 1 : 0] : v), ref = tea && teaRef(tea, c.s);
  if (ref) out.push({ k: 'Sip', t: `${tea} tea`.replace(/ tea tea$/i, ' tea'), cup: /ginger|cinnamon|chai|cacao|red date|turmeric|dandelion/i.test(tea) ? 'images/cup-chai.webp' : 'images/cup-glass.webp', to: ref.to });
  else if (c.rk && !breathe) out.push({ k: 'More ways', t: 'Full relief guide', e: '✨', to: `relief/${encodeURIComponent(c.rk)}` });
  return out.slice(0, 2);
}
function viewBrain(id) {
  const k = id && /^\d{4}-\d\d-\d\d$/.test(id) ? id : todayISO(), R = brainRead(k);
  const ph = R ? PHASES[R.ph] : null, isToday = k === todayISO();
  // only what to do and what to watch: warnings first, then a tickable plan, then what's going well
  const warns = R ? [...R.notes.filter(x => x.tone === 'warn').map(x => ({ ic: NOTE_IC[x.emo] || 'spark', t: x.t, p: x.p })),
    ...R.cards.filter(c => c.other).map(c => ({ ic: LOG_IC[c.s] || 'spark', t: `About your ${c.s.toLowerCase()}`, p: c.other }))] : [];
  const warmNow = R && warmWindow(R.di);
  const acts = R ? [...R.cards.filter(c => !c.good && c.fix).map(c => ({ id: c.s, e: SYM_EMOJI[c.s] || '🌿', t: c.s, why: firstLine(c.why), recs: planRecs(c, warmNow) })),
    ...R.notes.filter(x => x.tone === 'info').map(x => ({ id: x.t, e: x.emo, t: x.t, why: x.p, recs: [] }))] : [];
  const good = R ? [...R.notes.filter(x => x.tone === 'good'), ...R.cards.filter(c => c.good).map(c => ({ t: c.s, p: c.why }))] : [];
  const n = warns.length + acts.length + good.length;
  const body = !R || !n ? `<section class="br-empty"><p>Log a few things and I’ll tell you exactly what to do today.</p><button class="btn btn-light" data-action="nav" data-to="log">${icon('plus', 18)} Check in</button></section>` : `
    ${warns.map(w => `<section class="bx-warn"><span class="bx-wi">!</span><div><small>Check this</small><b>${w.t}</b><p>${w.p}</p></div></section>`).join('')}
    ${acts.length ? `<div class="br-h">What helps today</div>
    <div class="bx-plan">${acts.map(x => `<section class="bx-t">
      <div class="bx-top"><span class="bx-e">${x.e}</span><b>${x.t}</b></div>
      ${x.why ? `<p class="bx-why">${x.why}</p>` : ''}
      ${x.recs.length ? `<div class="bx-recs">${x.recs.map(r => `<button class="bx-r" data-action="nav" data-to="${r.to}">${r.cup ? `<span class="cup3" aria-hidden="true"><img src="${r.cup}" alt=""><i></i></span>` : r.img ? `<img src="${r.img}" alt="" loading="lazy">` : `<span class="bx-re">${r.e}</span>`}<span class="bx-rt"><small>${r.k}</small>${r.t}</span></button>`).join('')}</div>` : ''}
    </section>`).join('')}</div>` : ''}
    ${good.length ? `<div class="br-h">Going well</div><div class="bx-good">${good.map(g => `<div><b>🌟 ${g.t}</b>${g.p ? `<p>${g.p}</p>` : ''}</div>`).join('')}</div>` : ''}`;
  return `<section class="br-hero br2">
    <div class="br2-top"><button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <button class="spec-btn br2-home" data-action="nav" data-to="today" aria-label="Home">${icon('home', 20)}</button></div>
    <div class="br2-card">
      <svg class="br2-pal" viewBox="0 0 160 140" aria-hidden="true">
        <g class="br2-bub"><rect x="96" y="6" width="58" height="34" rx="17" fill="#fff" stroke="#304023" stroke-width="2"/><path d="M106 38 l-6 10 l14 -9" fill="#fff" stroke="#304023" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="113" cy="23" r="3.4" fill="#e0457b"/><circle cx="125" cy="23" r="3.4" fill="#e6a81e"/><circle cx="137" cy="23" r="3.4" fill="#3f8a2e"/></g>
        <g class="br2-body"><path d="M72 30 C104 30 120 58 118 86 C116 116 96 132 70 132 C42 132 22 114 22 86 C22 56 42 30 72 30Z" fill="#fbe3ea" stroke="#304023" stroke-width="2.4"/>
          <path d="M54 80 q6 -7 12 0" fill="none" stroke="#304023" stroke-width="2.6" stroke-linecap="round"/><path d="M80 80 q6 -7 12 0" fill="none" stroke="#304023" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M64 94 q9 8 18 0" fill="none" stroke="#304023" stroke-width="2.6" stroke-linecap="round"/>
          <ellipse cx="46" cy="94" rx="7" ry="4.5" fill="#f4a9bf"/><ellipse cx="100" cy="94" rx="7" ry="4.5" fill="#f4a9bf"/>
          <path d="M70 30 q-4 -12 6 -16 q-1 9 -6 16" fill="#6c823e" stroke="#304023" stroke-width="2" stroke-linejoin="round"/></g>
      </svg>
      <div class="br2-day"><span>${isToday ? 'Today' : fmt(C.parseISO(k), { month: 'short', day: 'numeric' })}</span>${R ? `<span>Day <b>${R.di.cd}</b></span><span class="br2-ph">${ph.name}</span>` : ''}</div>
      <h1 class="br2-h">What your body<em>is saying</em></h1>
      ${n ? `<p class="br2-n">${acts.length ? `<b>${acts.length}</b> ${acts.length === 1 ? 'tip' : 'tips'}` : ''}${acts.length && warns.length ? ' · ' : ''}${warns.length ? `<b>${warns.length}</b> to check` : ''}${!acts.length && !warns.length ? 'All looking good' : ''}</p>` : ''}
    </div>
  </section>
  <div class="pad br br2b">
    ${body}
    ${R && isToday && R.up.length ? `<div class="br-h">Get ahead of it</div>${R.up.map(x => `<section class="br-up"><span class="hu-when">${x.inDays === 0 ? 'Today' : x.inDays === 1 ? 'Tomorrow' : `In ${x.inDays} days`}</span><div><b>${x.name}</b> usually on ${dayRange(x)}${QUICK_FIX[x.name] ? `<small>${QUICK_FIX[x.name]}</small>` : ''}</div></section>`).join('')}` : ''}
    <button class="btn btn-dark btn-block br2-go" data-action="nav" data-to="today">${icon('home', 18)} Back to home</button>
    <button class="btn btn-ghost btn-block" data-action="logDay" data-date="${k}">Edit check-in</button>
    <p class="fine center">General information, not medical advice or contraception.</p>
  </div>`;
}

// Plain-English copy for the Nourish / Rituals / Mind tabs (no jargon).
const PLAIN = {
  menstrual: {
    eat: 'Your body is shedding and losing iron. Warm, cooked, iron-rich food refills you and eases cramps.',
    tcm: 'Chinese medicine sees your period as a time to stay warm, so blood can flow freely. Cold food and drinks slow it down.', focus: 'Stay warm & rest',
    do: 'Keep your feet and lower back warm, sip something hot, and try a ginger foot soak before bed.',
    mind: 'Hormones are at their lowest. Your mind turns inward. Great for reflecting, journaling and saying no to extra plans.',
  },
  follicular: {
    eat: 'Estrogen is rising and your body is rebuilding. Fresh, light food and plenty of protein fit perfectly now.',
    tcm: 'After your period your body is refilling. Like spring after winter. Nourishing food and good sleep help it rebuild.', focus: 'Rebuild & sleep well',
    do: 'Go to bed before 11pm. Deep sleep is when your body rebuilds best this week.',
    mind: 'Rising estrogen often lifts mood and energy. A lovely time to start new things.',
  },
  ovulatory: {
    eat: 'You’re at your peak. Light, raw, colourful food, zinc and fibre support you and help clear extra estrogen.',
    tcm: 'Around ovulation your body is at its warmest and most active. Keep things flowing and don’t overheat.', focus: 'Stay in flow',
    do: 'Move, laugh, get outside. And cool down with fresh fruit and lots of water.',
    mind: 'Many women feel most social and outgoing now. A lovely time to connect, speak up and see people.',
  },
  luteal: {
    eat: 'Progesterone rises and your body burns more energy. Grounding, cooked food with complex carbs and magnesium keeps you steady.',
    tcm: 'Before your period energy can feel “stuck”. Tension, bloating, moodiness. Gentle movement and warmth keep it moving.', focus: 'Keep energy moving',
    do: 'Walk, stretch and breathe deeply every day. It can ease tension, bloating and mood swings.',
    mind: 'Energy turns calmer and steadier. Finish projects, organise, tidy. And give yourself softer evenings.',
  },
};
// Rituals tab: three small things for her focus, shown as icon tiles
const RIT_STEPS = {
  menstrual: [['thermo', 'Feet and lower back warm'], ['cup', 'Sip something hot'], ['drop', 'Ginger foot soak at night']],
  follicular: [['moon', 'In bed before 11pm'], ['bowl', 'Protein at every meal'], ['sun', 'Morning daylight']],
  ovulatory: [['leaf', 'Move and get outside'], ['heart', 'Laugh with people'], ['drop', 'Fresh fruit and water']],
  luteal: [['leaf', 'Walk every day'], ['hand', 'Stretch in the evening'], ['mind', 'Breathe deeply']],
};
// A little cat friend for calm widgets: asleep on period days, bright-eyed otherwise, happy at ovulation
function petCat(mood = 'awake') {
  const eyes = mood === 'sleep' ? '<path d="M44 60 q6 5 12 0 M64 60 q6 5 12 0" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>'
    : mood === 'joy' ? '<path d="M44 62 q6 -7 12 0 M64 62 q6 -7 12 0" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>'
    : '<circle cx="50" cy="59" r="4.2" fill="#304023"/><circle cx="70" cy="59" r="4.2" fill="#304023"/><circle cx="51.5" cy="57.4" r="1.4" fill="#fff"/><circle cx="71.5" cy="57.4" r="1.4" fill="#fff"/>';
  return `<svg class="pet-cat ${mood}" viewBox="0 0 120 100" aria-hidden="true"><g class="pet-b">
    <path d="M22 86 C14 60 26 34 60 34 C94 34 106 60 98 86 Z" fill="#fff" stroke="#304023" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M34 42 L30 22 L48 34 M86 42 L90 22 L72 34" fill="#fff" stroke="#304023" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M35 33 L33 27 L40 31 M85 33 L87 27 L80 31" fill="#f4a9bf"/>${eyes}
    <path d="M57 68 q3 3 6 0" fill="none" stroke="#304023" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="38" cy="69" rx="6" ry="3.6" fill="#f4a9bf"/><ellipse cx="82" cy="69" rx="6" ry="3.6" fill="#f4a9bf"/>
    <path d="M98 80 q16 -2 12 -18" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/></g>
    ${mood === 'sleep' ? '<path class="pet-z" d="M100 14 h8 l-8 8 h8" fill="none" stroke="#8c9768" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : mood === 'joy' ? '<path class="pet-z" d="M104 12 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#e6b1c4"/>' : ''}</svg>`;
}
function whatsGoingOn(text) { return `<section class="card wgo"><div class="eyebrow">What’s going on</div><p>${text}</p></section>`; }
function viewPlan() {
  const info = M.info, phase = info ? info.phase : 'follicular', ph = PHASES[phase], tcm = TCM[phase], P = PLAIN[phase];
  const tabs = [['nourish', 'Nourish'], ['rituals', 'Rituals'], ['mind', 'Mind']];
  let body = '';
  if (ui.planTab === 'nourish') {
    body = nourishBody(phase);
  } else if (ui.planTab === 'rituals') {
    const rits = RITUALS.slice().sort((a, b) => b.phases.includes(phase) - a.phases.includes(phase));
    body = `<section class="rfx"><div class="rfx-top"><span class="rfx-g"><b>${tcm.elementGlyph}</b><small>${tcm.element}</small></span>
        <div><small>Your focus now</small><h3>${P.focus}</h3></div></div>
      <div class="rfx-steps">${RIT_STEPS[phase].map(([ic, t], i) => `<span style="--i:${i}"><i>${icon(ic, 18)}</i><b>${t}</b></span>`).join('')}</div>
      <details class="rfx-why"><summary>Why, in Chinese medicine ${icon('chevD', 13)}</summary><p>${P.tcm}</p><p>${P.do}</p></details></section>
      <div class="two-tiles">
        <button class="card glass tile" data-action="nav" data-to="point/${phase}"><div class="pt-dot sm"><span></span></div><small>Press this point</small><b>${tcm.point.name}</b><span class="muted sm">${tcm.point.secs} seconds</span></button>
        <div class="card glass tile"><span class="tile-ic">${icon('leaf', 22)}</span><small>Tea for today</small><b>${tcm.tea.name}</b></div>
      </div>
      ${sectionTitle('Rituals for you')}
      <div class="grid2 rit-g">${rits.map((r, i) => `<button class="rcard tall ${carePhoto(r.id) ? 'has-photo' : ''}" data-action="nav" data-to="ritual/${r.id}">${careArt(r.id, ['crown', 'drop', 'hill', 'wave', 'orb', 'peak'][i % 6], 40 + i)}
        <div class="rc-top"><span class="rit-min">${icon('clock', 11)} ${r.mins} min</span><span class="rit-seal" aria-hidden="true">${r.glyph}</span></div>
        <div class="rit-foot">${r.phases.includes(phase) ? `<span class="rit-you">For you</span>` : ''}<div class="rc-t">${r.name}</div></div></button>`).join('')}</div>
      ${sectionTitle('Home remedies')}
      <div class="grid2 rit-g">${M.info ? remedyCards(M.info) : ''}</div>
      <button class="card gro-cta" data-action="nav" data-to="relief"><span class="art-ic">${icon('heart', 20)}</span><span class="art-t">Relief guide<small>Cramps, PMS, sleep, skin</small></span>${icon('chevR', 18)}</button>`;
  } else {
    const rows = [['mind', ph.mind, 'Work'], ['users', ph.social, 'Social'], ['heart', ph.selfcare, 'Self-care']];
    const MG = M.info ? MIND_GUIDE[dayWindow(M.info)] : null, words = ['Low', 'Lower', 'Steady', 'High'];
    const rings = MG ? [['energy', '⚡', 'Energy'], ['mood', '☀️', 'Mood lift'], ['social', '💬', 'Social'], ['rest', '🌙', 'Rest need']].map(([k, g, n], i) => {
      const v = MG[k], R = 27, Cc = 2 * Math.PI * R, pct = [12, 38, 70, 100][v];
      return `<div class="mv2-b r${k === 'rest' ? Math.min(3, v) : v}" style="--i:${i}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * pct / 100).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g">${g}</span><b>${n}</b><small>${k === 'rest' ? ['Low', 'Some', 'Usual', 'More'][v] : words[v]}</small></div>`;
    }).join('') : '';
    body = `<section class="spx"><div class="spx-art">${petCat(phase === 'menstrual' ? 'sleep' : phase === 'ovulatory' ? 'joy' : 'awake')}</div>
        <div class="spx-t"><small>Your superpower now</small><h3>${ph.superpower.title}</h3><p>${ph.superpower.text}</p></div>
        <details class="rfx-why"><summary>What’s going on ${icon('chevD', 13)}</summary><p>${P.mind}</p></details></section>
      ${MG ? `<section class="mind-today"><div class="mvd-k">Your mind today · typical</div><div class="mind-rings">${rings}</div><p class="mvd-f">Your abilities stay the same all month. Energy and mood shift, and every woman’s pattern is her own.</p></section>` : ''}
      <div class="mg3" role="list">${rows.map(([ic, o, k], i) => `<div class="mg3-c t${i}" role="listitem" style="--i:${i}"><span class="mg3-e" aria-hidden="true">${['📝', '🫶', '🛁'][i]}</span><em>${k}</em><b>${o.title}</b><p>${o.text}</p>
        <svg class="mg3-paw" viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="26" rx="8" ry="6.5"/><circle cx="10" cy="16" r="3.4"/><circle cx="16.5" cy="10.5" r="3.4"/><circle cx="23.5" cy="10.5" r="3.4"/><circle cx="30" cy="16" r="3.4"/></svg></div>`).join('')}</div>
      ${sectionTitle('Your month')}
      <div class="month-strip">${PHASE_ORDER.map(p => `<div class="ms ${p === phase ? 'on' : ''}"><i style="background:${PHASE_COLOR.dark[p]}"></i><b>${PHASES[p].name}</b><span>${PHASES[p].superpower.title}</span></div>`).join('')}</div>
      ${sectionTitle('What studies found')}
      <section class="card glass mv-sci">${MIND_SCIENCE.map(x => `<details class="mvs"><summary><b>${x.t}</b>${evBadge(x.ev)}</summary><p>${x.s}</p><cite>${x.c}</cite></details>`).join('')}</section>
      <p class="fine center">Low mood that stays, or PMS that takes over your life, is worth a doctor’s visit.</p>`;
  }
  return `${phaseFoodPic(phase, true)}
  <div class="pad">
    ${ui.planTab === 'nourish' ? eatGoal(phase) : ''}
    <div class="seg">${tabs.map(([k, l]) => `<button class="${ui.planTab === k ? 'on' : ''}" data-action="planTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

// TCM warm window: during the period and the last 2–3 days before it, no raw/cold food.
function warmWindow(info) { return !!info && (info.phase === 'menstrual' || info.cd > info.L - 4); } // same days as the premenstrual window
// How many of a recipe's ingredients are in season this month where she lives.
const seasonKey = f => f.toLowerCase().replace(/\(.*\)/, '').split(/ & | and |,/)[0].trim().replace(/s$/, '');
function seasonHits(r) {
  const now = SZ.seasonal(myCountry(), new Date().getMonth() + 1).map(i => seasonKey(i.f)).filter(k => k.length > 2);
  return r.ingredients.filter(x => now.some(k => String(x).toLowerCase().includes(k))).length;
}
function recipesFor(phase, info) {
  const warm = warmWindow(info);
  let list = myRecipes().filter(r => r.phases.includes(phase) && !(warm && r.raw));
  if (!list.length) list = myRecipes().filter(r => !(warm && r.raw));
  // in-season recipes first, so the suggestions turn with the seasons
  return list.map(r => [seasonHits(r), r]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

// ---------- nourish (structured, evidence-graded) ----------
function evBadge() { return ''; } // evidence labels are hidden everywhere (the user's call); data keeps them
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
// Around the period (Chinese medicine): fruit gets stewed, dairy warmed, nothing raw-cold.
function warmChips(list, cat, warm) {
  if (!warm) return list;
  if (cat === 'fruit') return list.filter(([, n]) => !/orange|citrus|kiwi|melon/i.test(n)).map(([e, n]) => [e, /date|dried|stewed|baked|compote/i.test(n) ? n : `${/banana/i.test(n) ? 'Baked' : 'Stewed'} ${n.toLowerCase()}`]);
  if (cat === 'dairy') return list.map(([e, n]) => [e, /milk/i.test(n) && !/warm/i.test(n) ? `${n}, warmed` : /yoghurt|yogurt|kefir/i.test(n) && !/room temperature/i.test(n) ? `${n}, at room temperature` : n]);
  if (cat === 'veg') return list.map(([e, n]) => [e, /salad|raw/i.test(n) ? n.replace(/^raw\s+/i, 'Cooked ') : n]);
  return list;
}
// Dairy, drinks & supplements as a little shelf of floating bubbles; tap one to read why, in place.
const EB_WHY = [[/B12/i, 'Plants have none. 25 to 100 µg a day, or 1,000 µg twice a week, keeps energy and mood up.'], [/algae/i, 'DHA and EPA straight from algae, where fish get theirs. 250 to 500 mg a day for cramps, mood and skin.'], [/kefir|yoghurt/i, 'Live cultures for a calm gut and clearer skin.'], [/smoothie/i, 'Protein and calcium in one glass, with fruit.'], [/milk/i, 'Calcium and magnesium. Best warm in the days around your period.'],
  [/butter|ghee/i, 'Vitamins A and K2 for skin, bones and hormones.'], [/cheese/i, 'Calcium and protein in a bite.'], [/coffee/i, 'Keep it. Enjoy it with food, an hour away from iron-rich meals.'],
  [/matcha|green tea/i, 'Calm focus: caffeine with L-theanine.'], [/cacao/i, 'Magnesium for cravings, cramps and calm.'], [/ginger/i, 'Warms the belly and eases cramps.'], [/red date/i, 'Builds blood in Chinese medicine, gently sweet.'],
  [/raspberry leaf/i, 'A classic tea for the womb, mild and earthy.'], [/broth/i, 'Minerals, collagen and warmth.'], [/nettle/i, 'Iron and minerals after bleeding.'], [/chamomile/i, 'Helps you wind down before sleep.'],
  [/hibiscus/i, 'Tart, cooling and full of antioxidants.'], [/coconut water/i, 'Potassium for hot, sweaty days.'], [/lemon/i, 'A fresh start with vitamin C.'], [/mineral water/i, 'Magnesium and calcium you can drink.'], [/juice/i, 'Greens in a glass for your liver.']];
const EB_PIC = [[/kefir/i, () => foodPhoto('Kefir', 240)], [/yoghurt/i, () => foodPhoto('Greek yoghurt', 240)], [/milk/i, () => foodPhoto('Grass-fed raw milk & butter', 240)], [/butter|ghee/i, () => 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=240&h=240&fit=crop&auto=format&q=72'], [/cheese/i, () => foodPhoto('Fresh sheep & goat cheese', 240)],
  [/red date/i, () => teaPhoto('Ginger & red dates', 240, 240)], [/ginger/i, () => teaPhoto('Ginger', 240, 240)], [/chamomile/i, () => teaPhoto('Chamomile', 240, 240)], [/nettle/i, () => teaPhoto('Nettle leaf', 240, 240)]];
const EB_TINT = { dairy: ['#fbf3e6', '#f3e2c4'], drinks: ['#f0f4e6', '#dce7c8'], supps: ['#f3edf8', '#e2d6f0'] };
const sfPic = f => f[4] ? (f[4][0] === 'tea' ? teaPhoto(f[4][1], 240, 240) : foodPhoto(f[4][1], 240)) : null;
function superInner(phase) {
  const S = SUPERFOODS[phase], warm = warmWindow(M.info) && phase === (M.info && M.info.phase);
  const items = S.list.filter(f => !(f[5] && myDiet() === 'vegan')).map(f => { const pic = sfPic(f), face = pic ? `<img src="${pic}" alt="" loading="lazy"><i>${f[0]}</i>` : `<em>${f[0]}</em>`;
    return { n: f[1], face, panel: `<span class="ebp-f">${face}</span><span class="ebp-t"><b>${f[1]}</b><small>${f[2]}</small><span class="ebp-d"><span>${icon('drop', 12)} ${f[3]}</span></span></span>` }; });
  return `<p class="eb-lead">${S.lead}</p>
      <div class="eb-grid" style="--t1:#fbf1e4;--t2:#f2dcc0">${items.map((x, i) => `<button class="eb-i ${i ? '' : 'on'}" data-action="ebPick" style="--i:${i}"><span class="eb-b">${x.face}</span><small>${x.n}</small><template>${x.panel}</template></button>`).join('')}</div>
      <div class="eb-panel"><div class="ebp-in" aria-live="polite">${items[0].panel}</div>${warm ? `<p class="eb-warm">${icon('sun', 13)} These days: spices in warm food and drinks, nothing raw or iced.</p>` : ''}</div>
      <p class="eg-note">Food-sized amounts. Ask your doctor or pharmacist if you are pregnant or take medication.</p>`;
}
function eatCatInner(phase, cat) {
  if (cat === 'super') return superInner(phase);
  const ct = EAT_CATS.find(c => c.k === cat); let C0 = EAT_GUIDE[phase].cats[cat];
  // trying to conceive: prenatal + CoQ10, and no ashwagandha
  if (cat === 'supps' && (myDiet() === 'veg' || myDiet() === 'vegan')) C0 = [C0[0] + (myDiet() === 'vegan' ? ' As a vegan, B12 every day and algae omega-3 come first.' : ' As a vegetarian, algae omega-3 replaces fish oil.'),
    [...(myDiet() === 'vegan' || /menstrual|luteal/.test(phase) ? [['💧', 'Vitamin B12']] : []), ...C0[1].filter(([, n]) => !/B12/.test(n)).map(([g, n]) => /omega-3/i.test(n) ? ['🌊', 'Algae omega-3'] : [g, n])]];
  if (cat === 'supps' && ttc()) C0 = [C0[0] + ' Trying to conceive: start a prenatal with folate.', [['🤰', 'Prenatal with methylfolate'], ['🔋', 'CoQ10'], ...C0[1].filter(([, n]) => !/Ashwagandha/.test(n))]];
  const warm = warmWindow(M.info) && phase === (M.info && M.info.phase), [t1, t2] = EB_TINT[cat] || EB_TINT.drinks;
  const items = warmChips(C0[1], cat, warm).map(([g, n]) => {
    const x = cat === 'supps' && !/algae|B12/i.test(n) && suppOf(n), why = x ? x.desc.split('. ')[0] + '.' : (EB_WHY.find(([r]) => r.test(n)) || [0, C0[0]])[1], pic = cat === 'supps' ? null : (EB_PIC.find(([r]) => r.test(n)) || [])[1]?.();
    const face = pic ? `<img src="${pic}" alt="" loading="lazy"><i>${g}</i>` : `<em>${g}</em>`;
    return { n, face, panel: `<span class="ebp-f">${face}</span><span class="ebp-t"><b>${n}</b><small>${why}</small>${/raw milk|milk, warmed|warm raw/i.test(n) && cat !== 'supps' ? `<span class="ebp-w">${icon('thermo', 13)} Warm raw milk very gently on low heat, only until it feels warm on your lip. Never boil it, or the good enzymes and bacteria are lost.</span>` : ''}${x ? `<span class="ebp-d"><span>${icon('drop', 12)} ${x.dose}</span><span>${icon('clock', 12)} ${x.when}</span></span><button class="ebp-go" data-action="nav" data-to="supp/${x.id}">Doses and studies ${icon('chevR', 13)}</button>` : ''}</span>` };
  });
  return `<p class="eb-lead">${C0[0]}</p>
      <div class="eb-grid" style="--t1:${t1};--t2:${t2}">${items.map((x, i) => `<button class="eb-i ${i ? '' : 'on'}" data-action="ebPick" style="--i:${i}"><span class="eb-b">${x.face}</span><small>${x.n.replace(/\s*\(.*\)$/, '')}</small><template>${x.panel}</template></button>`).join('')}</div>
      <div class="eb-panel"><div class="ebp-in" aria-live="polite">${items[0]?.panel || ''}</div>${warm && (cat === 'dairy' || cat === 'drinks') ? `<p class="eb-warm">${icon('sun', 13)} These days: everything warm or at room temperature, nothing iced.</p>` : ''}</div>
      ${cat === 'supps' ? `<p class="eg-note">Check with your doctor or pharmacist if you take medication${ttc() ? ' or might be pregnant' : ''}.</p><button class="sup-all" data-action="nav" data-to="supp">All supplements: doses and studies ${icon('chevR', 14)}</button>` : ''}`;
}
// The two best dishes for each phase, as one photo card with the day, the phase and its tagline in the middle.
// Menstrual photos (Pexels licence): broth by jenvit keiwalinsarid (3559899), steak (618775). Others: recipe photos (Unsplash).
// The two foundation foods of each phase: whole foods, not dishes or snacks.
const PHASE_DISHES = {
  menstrual: { img: 'images/period-food.webp', alt: 'A bowl of clear bone broth and a raw beef steak on a wooden board', d: [['bone broth', 'minerals and amino acids to replenish the body'], ['grass-fed beef', 'replenishes the iron lost while you bleed']] },
  follicular: { d: [['broccoli', 'cruciferous greens help your liver clear used estrogen', 'Broccoli'], ['oranges', 'vitamin C and fresh, light energy for rising estrogen', 'Oranges & mandarins']] },
  ovulatory: { d: [['raspberries', 'antioxidants and fibre for your brightest days', 'Raspberries'], ['asparagus', 'folate and fibre that help estrogen leave the body', 'Asparagus']] },
  luteal: { d: [['sweet potatoes', 'slow carbs and B6 keep blood sugar and mood steady', 'Sweet potatoes'], ['almonds', 'magnesium for calmer PMS and fewer cravings', 'Almonds']] },
};
function phaseFoodPic(phase, full) {
  const X = PHASE_DISHES[phase], info = M.info;
  let day = '';
  if (info && info.phase === phase) day = `Day ${info.cd}`;
  else if (M.stats) { const r = C.phaseRanges(M.stats.avgCycle, M.stats.avgPeriod).find(x => x.key === phase); if (r) day = r.from === r.to ? `Day ${r.from}` : `Days ${r.from}–${r.to}`; }
  const [t, b] = X.d, name = phase === 'ovulatory' ? 'Ovulation' : `${PHASES[phase].name} phase`;
  const photos = X.img ? `<img class="pf-one" src="${X.img}" alt="${X.alt}" decoding="async">`
    : X.d.map(([n, , k]) => `<img class="pf-half" src="${foodPhoto(k, 900)}" alt="${n}" decoding="async">`).join('');
  return `<figure class="pfood pfood2 pfood3 ${full ? 'pf-full' : ''}">${photos}
    <span class="pf-l pf-top"><b>${t[0]}</b>${t[1]}</span>
    <span class="pf-mid">${day ? `<small class="pf-day">${day}</small>` : ''}<b>${name}</b><em>${PHASES[phase].tagline}</em></span>
    <span class="pf-l pf-bot"><b>${b[0]}</b>${b[1]}</span></figure>`;
}
// Deck motion: cards tilt, shrink and fade as they leave the centre.
function deckFx(t) {
  const c = t.getBoundingClientRect(), mid = c.left + c.width / 2;
  let best = 0, bd = 9;
  [...t.children].forEach((el, j) => {
    const r = el.getBoundingClientRect(), d = Math.max(-1.4, Math.min(1.4, (r.left + r.width / 2 - mid) / r.width)), a = Math.min(1, Math.abs(d));
    el.style.transform = `perspective(1000px) rotateY(${(-d * 12).toFixed(2)}deg) scale(${(1 - a * .1).toFixed(3)})`;
    el.style.opacity = (1 - a * .45).toFixed(2);
    if (Math.abs(d) < bd) { bd = Math.abs(d); best = j; }
  });
  [...t.children].forEach((el, j) => el.classList.toggle('front', j === best));
  document.querySelectorAll(`#${t.dataset.dots} i`).forEach((d, j) => d.classList.toggle('on', j === best));
}
// Every recipe, by meal. The ones made for her phase come first; raw ones step back while she should eat warm.
const MEALS = [['Breakfast', 'sun'], ['Lunch', 'leaf'], ['Dinner', 'bowl'], ['Snack', 'berry'], ['Drink', 'cup']];
function allRecipes(phase, warm) {
  const meal = ui.mealTab || 'Breakfast';
  const list = myRecipes().filter(r => r.meal === meal).map(r => ({ r, s: (r.phases.includes(phase) ? 2 : 0) + (warm ? (r.warm ? 1 : r.raw ? -2 : 0) : (r.raw ? 1 : 0)) })).sort((a, b) => b.s - a.s);
  return `${sectionTitle('All recipes')}
    <div class="meal-tabs">${MEALS.map(([m, g]) => `<button class="${m === meal ? 'on' : ''}" data-action="mealTab" data-v="${m}"><span>${icon(g, 18)}</span>${m === 'Snack' ? 'Snacks' : m === 'Drink' ? 'Drinks' : m}<small>${RECIPES.filter(r => r.meal === m).length}</small></button>`).join('')}</div>
    <div class="meal-grid">${list.map(({ r }, i) => `<button class="rcard sm ${photoUrl(r.id) ? 'has-photo' : ''}" data-action="nav" data-to="recipe/${r.id}">${recipeArt(r, ['wave', 'orb', 'drop', 'hill'][i % 4], 60 + i)}
      <div class="rc-top">${r.phases.includes(phase) ? '<span class="rc-k now">For now</span>' : `<span class="rc-k">${r.raw ? 'Raw' : r.warm ? 'Warm' : PHASES[r.phases[0]].name}</span>`}</div>
      <div class="rc-t">${r.name}</div><div class="rc-m">${r.time} min</div></button>`).join('')}</div>`;
}
// ---------- the cycle × season plate (petal wheel) ----------
// Warm & cooked during her period and the days before it (TCM), whatever the season.
const plateWarm = ph => ph === ui.plNow ? warmWindow(M.info) : ph === 'menstrual';
// Seasonal vegetables / fruit for her country, ranked by phase fit and TCM temperature.
function plateSeasonal(kind, phase, season, warm) {
  const isNow = season === SZ.seasonName(myCountry(), new Date().getMonth() + 1);
  if (!isNow) return PLATE_SEASON[season][kind].map(x => { const n = x.slice(x.indexOf(' ') + 1); return { n, g: x.slice(0, x.indexOf(' ')), photo: findFoodPhoto(n) }; });
  const kinds = kind === 'veg' ? ['veg', 'wild', 'fungi'] : ['fruit'];
  const items = SZ.seasonal(myCountry(), new Date().getMonth() + 1).filter(i => kinds.includes(i.kind));
  const score = i => (i.ph.includes(phase) ? 2 : 0) + (warm ? (i.nature === 'cool' ? -2 : i.nature === 'warm' ? 1 : 0) : phase === 'luteal' ? (i.nature === 'warm' ? 1 : i.nature === 'cool' ? -1 : 0) : (season === 'Summer' && i.nature === 'cool' ? .5 : 0)) + (foodPhoto(i.f) ? .3 : 0);
  const out = items.map(i => ({ i, s: score(i) })).sort((a, b) => b.s - a.s).slice(0, 4).map(({ i }) => ({ n: i.f, photo: foodPhoto(i.f, 300) }));
  return out.length ? out : plateSeasonal(kind, phase, season === 'Winter' ? 'Autumn' : season, warm);
}
// A photo for a food name, trying the plural and the plain name ("Toasted sourdough" → "Sourdough").
function findFoodPhoto(n, w = 300) {
  const base = n.replace(/^(cooked|fresh|toasted|new|baby|wild|grass-fed|pasture|slow-braised|raw|roasted|dried)\s+/i, '');
  for (const c of [n, base, base + 's', base + 'es', base.replace(/y$/, 'ies')]) { const k = Object.keys(FOOD_PHOTOS).find(x => x.toLowerCase() === c.toLowerCase()); if (k) return foodPhoto(k, w); }
  const k = Object.keys(FOOD_PHOTOS).find(x => x.toLowerCase().split(/ & |, /).some(p => p === base.toLowerCase() || p === base.toLowerCase() + 's'));
  return k ? foodPhoto(k, w) : '';
}
// The picture that fills each section of the plate when none of its foods has one.
function plateFoods(k, phase, season, warm) {
  if (k === 'veg' || k === 'fruit') return plateSeasonal(k, phase, season, warm);
  const idx = { protein: 0, carbs: 1, fats: 2, spice: 3 }[k];
  let list = PLATE_GRID[phase][season][idx];
  if (k === 'protein' && (myDiet() === 'veg' || myDiet() === 'vegan')) { const keep = list.filter(x => plainFits(x)); list = [...keep, ...PLANT_PROTEIN[phase].filter(x => plainFits(x) && !keep.includes(x))].slice(0, Math.max(4, list.length)); }
  return list.map(x => { const n = x.slice(x.indexOf(' ') + 1); return { g: x.slice(0, x.indexOf(' ')), n, photo: findFoodPhoto(n) }; });
}
function plateWhy(k, phase) { return k === 'spice' ? PLATE_SPICE_WHY[phase] : EAT_GUIDE[phase].cats[k][0]; }
function petalPath(cx, r0, r1, a0, a1, rr = 7) {
  const p = (r, a) => `${(cx + r * Math.sin(a)).toFixed(1)} ${(cx - r * Math.cos(a)).toFixed(1)}`;
  const i0 = r0 + rr, i1 = r1 - rr, d0 = rr / i1, e0 = rr / i0;
  return `M${p(i0, a0 + e0)} L${p(i1, a0 + d0)} A${i1} ${i1} 0 0 1 ${p(i1, a1 - d0)} L${p(i0, a1 - e0)} A${i0} ${i0} 0 0 0 ${p(i0, a0 + e0)}Z`;
}
// A divided plate: each section is as wide as its share and filled with a photo of its food.
const PLATE_ORDER = ['veg', 'fats', 'protein', 'spice', 'carbs', 'fruit'];
// One calm, close-up whole-food photo per plate section, so the plate reads as one set.
const UNS = id => `https://images.unsplash.com/photo-${id}?w=420&h=420&fit=crop&auto=format&q=70`;
const PEX = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=420&h=420&fit=crop`;
const PLATE_SET = {
  protein: { menstrual: UNS('1783632665766-2806d10f2a03'), follicular: UNS('1641999161954-f6a92e137b84'), ovulatory: UNS('1706982272171-8ce965c1c996'), luteal: UNS('1603048297172-c92544798d5a') },
  spice: { menstrual: UNS('1635843104103-ddd88e1c5141'), follicular: UNS('1726994803809-0e065bd4b25b'), ovulatory: PEX(13632808), luteal: UNS('1702989052359-541ef30e5973') },
  fats: { menstrual: PEX(35339669), follicular: PEX(35339669), ovulatory: PEX(35339669), luteal: PEX(35339669) },
  carbs: { menstrual: PEX(7456548), follicular: PEX(7456548), ovulatory: PEX(39467457), luteal: PEX(39467457) },
  veg: () => UNS('1558234608-ae0b60563965'),
  fruit: { Winter: UNS('1788512337872-7390113a5318'), Autumn: UNS('1788512337872-7390113a5318'), Spring: UNS('1594282241894-4da286138f44'), Summer: PEX(6316703), 'Late summer': PEX(6316703) },
};
const plateSetPic = (k, phase, season) => k === 'protein' && (myDiet() === 'veg' || myDiet() === 'vegan') ? foodPhoto('Peas & broad beans', 420) : k === 'veg' ? PLATE_SET.veg() : k === 'fruit' ? PLATE_SET.fruit[season] : PLATE_SET[k][phase];
// A rounded food portion: the wedge between angles a0 and a1, pulled in by h from both cut edges.
function portionPath(cx, cy, R, a0, a1, h = 2.6, rr = 7) {
  const u = a => [Math.sin(a), -Math.cos(a)], n = a => [Math.cos(a), Math.sin(a)], f = v => v.toFixed(1);
  const half = (a1 - a0) / 2, t = h / Math.sin(Math.min(half, Math.PI / 2 - .01)), [bx, by] = u(a0 + half);
  const A = [cx + t * bx, cy + t * by];
  const edge = (a, r, side) => { const [ux, uy] = u(a), [nx, ny] = n(a); return [cx + r * ux + side * h * nx, cy + r * uy + side * h * ny]; };
  const arc = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const P0 = edge(a0, R - rr, 1), C0 = arc(a0 + h / R), Q0 = arc(a0 + (h + rr) / R), Q1 = arc(a1 - (h + rr) / R), C1 = arc(a1 - h / R), P1 = edge(a1, R - rr, -1);
  const big = a1 - a0 - 2 * (h + rr) / R > Math.PI ? 1 : 0;
  return `M${f(A[0])} ${f(A[1])} L${f(P0[0])} ${f(P0[1])} Q${f(C0[0])} ${f(C0[1])} ${f(Q0[0])} ${f(Q0[1])} A${R} ${R} 0 ${big} 1 ${f(Q1[0])} ${f(Q1[1])} Q${f(C1[0])} ${f(C1[1])} ${f(P1[0])} ${f(P1[1])}Z`;
}
function plateWheel(phase, season, sel, warm) {
  // Her plate is a real photo. Each food is its own rounded portion with a shadow, sitting in the well;
  // small portions get a minimum size so they stay easy to tap (labels show the true share).
  const S = PLATE_SHARE[phase], cx = 180, cy = 184, R = 92, tau = 2 * Math.PI, f = n => n.toFixed(1);
  const vis = Object.fromEntries(PLATE_ORDER.map(k => [k, Math.max(S[k], 11)])), tot = PLATE_ORDER.reduce((t, k) => t + vis[k], 0);
  const at = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  let a = -tau * vis.veg / tot / 2, defs = '', segs = '', labels = '';
  PLATE_ORDER.forEach((k, i) => {
    const P = PLATE_PETALS.find(x => x.k === k), sh = S[k], a0 = a, a1 = a + tau * vis[k] / tot, mid = (a0 + a1) / 2; a = a1;
    const on = k === sel, d = portionPath(cx, cy, R, a0, a1), pic = plateSetPic(k, phase, season);
    const [ix, iy] = at(R * .55, mid), sz = R * 1.6, [mx, my] = [Math.sin(mid), -Math.cos(mid)];
    defs += `<clipPath id="pls-${k}"><path d="${d}"/></clipPath>`;
    segs += `<g transform="translate(${f(mx * 1.6)} ${f(my * 1.6)})"><g class="pls ${on ? 'on' : ''}" data-action="plPetal" data-v="${k}" role="button" aria-label="${P.n} ${sh}%" style="--d:${(.55 + i * .13).toFixed(2)}s;--lx:${f(mx * 5)}px;--ly:${f(my * 5)}px"><g class="pls-lift">
      <path d="${d}" class="pls-bg"/>${pic ? `<image href="${pic}" x="${f(ix - sz / 2)}" y="${f(iy - sz / 2)}" width="${f(sz)}" height="${f(sz)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pls-${k})"/>` : ''}
      <path d="${d}" fill="url(#pl-vol)" class="pls-vol"/><path d="${d}" class="pls-rim" clip-path="url(#pls-${k})"/><path d="${d}" class="pls-veil"/></g></g></g>`;
    const [tx, ty] = at(131, mid);
    labels += `<g class="pll ${on ? 'on' : ''}" data-action="plPetal" data-v="${k}" style="--d:${(1.3 + i * .08).toFixed(2)}s"><rect x="${f(tx - 30)}" y="${f(ty - 19)}" width="60" height="40" rx="14" class="pll-hit"/><text x="${f(tx)}" y="${f(ty - 2)}" text-anchor="middle" class="pll-n">${P.s}</text><text x="${f(tx)}" y="${f(ty + 12)}" text-anchor="middle" class="pll-v">${sh}%</text></g>`;
  });
  return `<svg class="plate2 plate3" viewBox="0 0 360 362" role="group" aria-label="Your plate"><defs>${defs}
    <radialGradient id="pl-fade" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#fff"/><stop offset=".97" stop-color="#000"/></radialGradient>
    <mask id="pl-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#pl-fade)"/></mask>
    <radialGradient id="pl-vol" gradientUnits="userSpaceOnUse" cx="${cx - 26}" cy="${cy - 32}" r="${R * 1.45}"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <filter id="pl-ds" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".38"/><feDropShadow dx="2" dy="9" stdDeviation="7" flood-color="#1b1f1b" flood-opacity=".42"/></filter></defs>
    <image class="pl-photo" href="images/plate.webp" x="-21.6" y="-18.5" width="405" height="405"/>
    <circle cx="${cx}" cy="${cy}" r="${R + 6}" class="pl-well"/>
    <g filter="url(#pl-ds)">${segs}</g>${labels}</svg>`;
}
// What the Chinese-medicine idea for each phase means, in everyday words.
const PLATE_TCM_PLAIN = {
  menstrual: 'Your body is letting go and loses warmth with the blood. Keep it warm and flowing: warm, cooked meals and red foods like red dates, goji and red meat help you rebuild. It’s your Water time, like winter, so rest more.',
  follicular: 'Your blood is building back up and energy is rising. Fresh herbs, eggs and lighter meals help you grow. It’s your Wood time, like spring, so start new things.',
  ovulatory: 'You’re at your peak, warm and outgoing. Colourful, fresh food keeps that heat in balance. It’s your Fire time, like summer, so go out and connect.',
  luteal: 'Your body is slowing down and holding warmth for your period. Simple warm meals, roots and squash keep you calm and steady. It’s your Earth time, like late summer, so slow down.',
};
// Three short rules for the plate (cook, taste, element) as tiles; the full sentence opens under the tile she taps.
const PLATE_COOK_SHORT = { Winter: 'Slow-cooked', Spring: 'Steamed & fresh', Summer: 'Raw & fresh', 'Late summer': 'Gently cooked', Autumn: 'Roasted & braised' };
function plRules(R) {
  const open = R.find(r => r[0] === ui.plRule);
  return `<div class="plr">${R.map(([k, ic, kick, v]) => `<button class="plr-t ${open && open[0] === k ? 'on' : ''}" data-action="plRule" data-v="${k}" aria-expanded="${!!open && open[0] === k}">${ic}<small>${kick}</small><b>${v}</b></button>`).join('')}</div>
    ${open ? `<div class="plr-d"><b>${open[4]}</b><p>${open[5]}</p></div>` : '<p class="plr-hint">Tap one to see why</p>'}`;
}
function plateSection(current) {
  ui.plNow = current;
  const phase = current, m = new Date().getMonth() + 1, nowSeason = SZ.seasonName(myCountry(), m);
  const season = nowSeason, sel = ui.plPetal || 'veg', warm = plateWarm(phase);
  const T = SZ.SEASON_TCM[season], PSn = PLATE_SEASON[season], tcm = TCM[phase], P = PLATE_PETALS.find(x => x.k === sel);
  const foods = plateFoods(sel, phase, season, warm), live = (sel === 'veg' || sel === 'fruit') && season === nowSeason;
  const country = SZ.COUNTRIES.find(x => x[0] === myCountry())?.[1] || '';
  const cook = warm ? `Warm and cooked, even in ${season === 'Summer' || season === 'Late summer' ? 'the heat' : season.toLowerCase()}. No iced drinks during your period and the 2–3 days before it.` : phase === 'luteal' ? `${PSn.cook} Lean warmer as your period gets close.` : PSn.cook;
  return `<section class="pl">
    <div class="pl-head"><div class="mv2-eyebrow">Your plate today</div><h2>${PHASES[phase].name} × ${season.toLowerCase()}</h2><p>${PSn.aim} · ${T.el} season ${T.han}</p></div>
    <div class="pl-wheel ${ui.plAnim ? 'pl-anim' : ''}">${plateWheel(phase, season, sel, warm)}</div>
    <div class="pl-det" data-k="${sel}">
      <div class="pld-h"><b>${P.n}</b><span class="pld-p">${PLATE_SHARE[phase][sel]}%</span></div>
      <p>${plateWhy(sel, phase)}${live ? ` <em>In season in ${country} now.</em>` : ''}</p>
      <div class="pld-foods">${foods.map(x => `<div>${x.photo ? `<img src="${x.photo}" alt="" loading="lazy">` : `<span>${x.g || '•'}</span>`}<small>${x.n}</small></div>`).join('')}</div>
    </div>
    ${plRules([
      ['cook', `<i class="plr-ic">${warm ? '🍲' : phase === 'luteal' ? '🥘' : '🥗'}</i>`, 'Cook', warm ? 'Warm & cooked' : phase === 'luteal' ? 'Lean warmer' : PLATE_COOK_SHORT[season] || 'Fresh & cooked', 'How to cook today', cook],
      ['taste', `<i class="plr-ic">${{ Spring: '🌱', Summer: '🍒', 'Late summer': '🌽', Autumn: '🧄', Winter: '🫚' }[season] || '🌿'}</i>`, 'Taste', PSn.taste[0], `Taste of ${season.toLowerCase()} <em class="pl-han">${T.han}</em>`, PSn.taste[1]],
      ['tcm', `<i class="plr-ic">${{ Water: '💧', Wood: '🌳', Fire: '🔥', Earth: '⛰️' }[tcm.element] || '🌿'}</i>`, 'Element', `${tcm.element} time`, 'Your cycle in Chinese medicine', PLATE_TCM_PLAIN[phase]],
    ])}
    ${plTea()}
    ${plTonight(phase, warm)}
  </section>`;
}
// Tea for today as a full recommendation: the floating cup, the tea and why.
function plTea() {
  const td = TEA_DAY[M.info ? dayWindow(M.info) : 'rising'], chai = /ginger|cinnamon|chai|cacao|red date|turmeric|dandelion/i.test(td[1]);
  return `<button class="card pl-teac" data-action="nav" data-to="do/tea"><span class="plt-cup cup3d-w"><img src="images/${chai ? 'cup-chai' : 'cup-glass'}.webp" alt="" loading="lazy"><canvas class="teacup3d" aria-label="${td[1]}, turning slowly"></canvas></span>
    <span class="plt-t"><small>Tea for today</small><b>${td[1]}</b><em>${td[2]}</em></span>${icon('chevR', 16)}</button>`;
}
// Tonight's plate: one real recipe for her phase, with its photo, a new one every day.
// The same recipe is the Eat tile on Today, so both always name one dish.
function tonightRecipe(phase, warm) {
  const pool = myRecipes().filter(r => r.phases.includes(phase) && (r.meal === 'Dinner' || r.meal === 'Lunch') && (!warm || !r.raw));
  const list = pool.length ? pool : myRecipes().filter(r => r.phases.includes(phase));
  if (!list.length) return null;
  const day = Math.floor((C.startOfDay(new Date()) - new Date(2026, 0, 1)) / 864e5);
  return list[((day % list.length) + list.length) % list.length];
}
function plTonight(phase, warm) {
  const r = tonightRecipe(phase, warm); if (!r) return '';
  const u = photoUrl(r.id, 900);
  return `<button class="card pl-tonight" data-action="nav" data-to="recipe/${r.id}">${u ? `<img src="${u}" alt="${esc(r.name)}" loading="lazy">` : glowArt('orb', 7)}<span class="plto-sh"></span>
    <span class="plto-t"><small>Tonight’s plate · ${r.time} min</small><b>${r.name}</b><span class="plm-cta">Cook it ${icon('chevR', 14)}</span></span></button>`;
}
// Her food goal for the phase, shown right under the big phase photo.
function eatGoal(phase) {
  const E = EAT_GUIDE[phase], warm = warmWindow(M.info);
  return `<section class="eat-goal eat-goal-top">
      <div class="eg2-in"><div class="eyebrow">${PHASES[phase].name} · your goal</div><h2>${E.goal}</h2><p>${E.why}</p>
      <span class="eg-rule ${warm ? 'warm' : 'raw'}">${icon(warm ? 'sun' : 'leaf', 14)} Today: ${warm ? 'warm & cooked' : 'raw & fresh'}</span></div></section>`;
}
// Cycle foods decoded: what each phase asks of your plate, as a 2×2 of photo collages (current phase first).
const CYCLE_FOODS = {
  menstrual: ['The return', 'Rebuild your blood and iron, all warm and cooked.', ['Slow stews', 'Beef', 'Bone broth', 'Seaweed', 'Molasses', 'Dates'], ['Healing broth', 'Red meat', 'Seaweed (gim & miyeok)', 'Blackstrap molasses']],
  follicular: ['The garden wakes', 'Light, blood-building and kind to your liver.', ['Citrus', 'Lentils', 'Eggs', 'Liver', 'Wild salmon', 'Kimchi'], ['Citrus', 'Wild salmon', 'Pasture eggs', 'Aged kimchi (mugeunji)']],
  ovulatory: ['Full bloom', 'Hydrating, cooling and calming for inflammation.', ['Aloe', 'Berries', 'Seafood', 'Fresh herbs', 'Coconut'], ['Berries', 'Oysters', 'Sardines', 'Mint']],
  luteal: ['The harvest', 'Warming, grounding and rich in minerals.', ['Root veg', 'Millet', 'Sesame', 'Ghee', 'Cinnamon'], ['Sweet potatoes', 'Pumpkin & winter squash', 'Carrots', 'Cinnamon bark']],
};
function cycleFoods(phase) {
  const pic = n => FOOD_PHOTOS[n] ? foodPhoto(n, 240) : teaPhoto(n, 240, 240);
  const order = [phase, ...PHASE_ORDER.filter(p => p !== phase)];
  return `${sectionTitle('Cycle foods decoded')}
    <p class="cf-sub">Each phase shifts your metabolism, your body heat and the nutrients you burn through. Eat with it and your hormones stay steadier while your reserves fill back up.</p>
    <div class="cf-grid cf2">${order.map((p, i) => { const [t, d, foods, ph] = cycFoods(p), big = (n, w) => FOOD_PHOTOS[n] ? foodPhoto(n, w) : teaPhoto(n, w, Math.round(w * 1.15)); return `<section class="cf-c ${p === phase ? 'now' : ''}" data-phase="${p}" data-action="cfOpen" data-p="${p}" role="button" tabindex="0" aria-label="${PHASES[p].name} foods: ${t}" style="--i:${i};--c:${PH_HEX[p]}">
      <div class="cf-arch"><img src="${big(ph[0], 420)}" alt="" loading="lazy">${p === phase ? `<span class="cf-now">${icon('heart', 11, 2.2)} now</span>` : ''}</div>
      <div class="cf-stk">${ph.slice(1).map((n, k) => `<img src="${pic(n)}" alt="" loading="lazy" style="--k:${k}">`).join('')}</div>
      <div class="cf-t"><small><i></i>${PHASES[p].name}</small><b>${t}</b><p>${d}</p><span class="cf-chips">${foods.slice(0, 4).map(f => `<em>${f}</em>`).join('')}</span><span class="cf-more">See why ${icon('chevD', 12)}</span></div></section>`; }).join('')}</div>
    <div class="cf-sheet" aria-live="polite"></div>`;
}
// Tapping a cycle-food card opens its detail under the grid: the goal, why, and every food with a photo.
function cfSheet(p) {
  const [t, , foods, ph] = cycFoods(p), E = EAT_GUIDE[p], pic = n => FOOD_PHOTOS[n] ? foodPhoto(n, 200) : teaPhoto(n, 200, 200);
  return `<div class="cfs" style="--c:${PH_HEX[p]}"><button class="cfs-x" data-action="cfOpen" data-p="${p}" aria-label="Close">${icon('close', 14, 2.2)}</button>
    <small><i></i>${PHASES[p].name} · ${t}</small><b>${E.goal}</b><p>${E.why}</p>
    <div class="cfs-f">${ph.map(n => `<span><img src="${pic(n)}" alt="" loading="lazy"><em>${n}</em></span>`).join('')}</div>
    <div class="cf-chips cfs-c">${foods.map(f => `<em>${f}</em>`).join('')}</div></div>`;
}
function nourishBody(current) {
  const phase = current, N = NUTRITION[phase], warm = warmWindow(M.info);
  const recs = myRecipes().filter(r => r.phases.includes(phase)).sort((a, b) => warm ? (!!b.warm - !!a.warm) : (!!b.raw - !!a.raw));
  const recent = recentSymptoms().filter(s => SYMPTOM_FOODS[s]).slice(0, 2);
  const EXTRA = EAT_CATS.filter(c => !PLATE_PETALS.some(p => p.k === c.k)), cat = EXTRA.some(c => c.k === ui.eatCat) ? ui.eatCat : EXTRA[0].k;
  return `${dietGuideCard(phase)}${plateSection(phase)}${cycleFoods(phase)}${sectionTitle('Drinks, supplements & superfoods')}
    <div class="eat-tabs eb-tabs">${EXTRA.map(c => `<button class="${c.k === cat ? 'on' : ''}" data-action="eatCat" data-v="${c.k}"><span class="ebt-e">${{ drinks: '🍵', supps: '💊', super: '🫚' }[c.k] || ''}</span>${{ drinks: 'Drinks', super: 'Superfoods' }[c.k] || c.t}</button>`).join('')}</div>
    <section class="card eat-cat eb" data-phase="${phase}">${eatCatInner(phase, cat)}</section>

    <span id="pl-recipes"></span>${sectionTitle('Recipes for you')}
    <div class="hscroll">${recs.map((r, i) => `<button class="rcard ${photoUrl(r.id) ? 'has-photo' : ''}" data-action="nav" data-to="recipe/${r.id}">${recipeArt(r, ['wave', 'orb', 'drop', 'hill'][i % 4], 20 + i)}
      <div class="rc-top"><span class="rc-k">${r.raw ? 'Raw' : r.warm ? 'Warm' : r.meal}</span><span class="rc-go">${icon('chevR', 16)}</span></div>
      <div class="rc-t">${r.name}</div><div class="rc-m">${r.time} min</div></button>`).join('')}</div>

    ${recent.length ? `${sectionTitle('For how you feel')}${recent.map(s => { const f = SYMPTOM_FOODS[s]; return `<section class="card glass fix"><div class="fix-h"><span class="fix-s">${s}</span></div><div class="foods">${f.foods.slice(0, 5).map(x => `<span class="food">${x}</span>`).join('')}</div></section>`; }).join('')}` : ''}

    ${sugarSection(phase)}
    <button class="card gro-cta" data-action="nav" data-to="grocery"><span class="art-ic">${icon('check', 20)}</span><span class="art-t">My grocery list<small>For the next 7 days</small></span>${icon('chevR', 18)}</button>`;
}

// Blood-sugar tricks inside Nourish. Her own pattern shows only when her logs reveal one.
const SUGAR_SYMPTOMS = ['Cravings', 'Fatigue', 'Dizziness'];
// A real photo for each blood-sugar trick, with its emoji as a little badge.
const SB_PIC = { fibre: () => foodPhoto('Aged kimchi (mugeunji)', 360), move: () => 'images/tile-walk.webp', acv: () => foodPhoto('Apples', 360), tea: () => teaPhoto('Tea', 360, 240),
  berberine: () => teaPhoto('Dandelion leaf', 360, 240), d3mg: () => 'images/rhythm-sun.webp', minerals: () => foodPhoto('Oysters', 360), spices: () => teaPhoto('Cinnamon', 360, 240) };
function sugarSection(phase) {
  const on = sugarDone(), pat = M.info ? patterns().list.filter(x => SUGAR_SYMPTOMS.includes(x.name)) : [];
  const luteal = phase === 'luteal';
  return `${sectionTitle('Blood sugar tricks', ['How they work', 'sugar'])}
    <section class="card sugar-big">
      <div class="sb-top"><div><small>Your next meal</small><b>Tap what you do,<br>watch the spike shrink</b></div>
        <div class="sb-score" id="sg-score">${sugarScore(on)}</div></div>
      ${luteal ? `<p class="sb-note">${icon('spark', 13)} Second half of your cycle: you’re a little less insulin-sensitive, so these help most now.</p>` : ''}
      ${pat.length ? `<div class="sm-pat">${pat.slice(0, 2).map(x => `<div>${icon('chart', 14)}<span><b>Your pattern:</b> ${x.name.toLowerCase()} on ${x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`} · use these tricks then</span></div>`).join('')}</div>` : ''}
      <div id="sg-chart" class="sb-chart">${sugarCurve(on)}</div>
      ${[['before', '1', 'Before you eat'], ['with', '2', 'With your meal'], ['daily', '3', 'Every day']].map(([w, n, t]) => `<div class="sb-step"><div class="sb-sh"><span>${n}</span>${t}</div>
        <div class="sb-grid">${SUGAR_TRICKS.filter(x => x.w === w).map(x => `<button class="sb-t sb-pic ${on.includes(x.k) ? 'on' : ''}" data-action="sugarTrick" data-v="${x.k}"><span class="sb-ph">${SB_PIC[x.k] ? `<img src="${SB_PIC[x.k]()}" alt="" loading="lazy">` : ''}<em>${x.g}</em></span><b>${x.n}</b><small>${x.t}</small><i class="sb-ck">${icon('check', 14, 2.6)}</i></button>`).join('')}</div></div>`).join('')}
    </section>`;
}
// Tricks overlap, so they don't simply add up: combined, the illustration caps the spike reduction at 50%.
function sugarKeep(on) { return Math.max(.5, SUGAR_TRICKS.reduce((k, t) => on.includes(t.k) ? k * (1 - t.eff) : k, 1)); }
function sugarScore(on) {
  const keep = sugarKeep(on);
  return keep === 1 ? `<b>0</b><span>tricks yet</span>` : `<b>−${Math.round((1 - keep) * 100)}%</b><span>spike</span>`;
}

// ---------- cosmic rhythm ----------
function cosmicProfile() {
  const b = state.profile.birthday; if (!b) return null;
  const [y, m, d] = b.split('-').map(Number);
  const sign = Z.sunSign(m, d), cz = Z.chineseZodiac(y, m, d);
  return { sign, cz, five: Z.FIVE[cz.element], bridge: Z.EL_BRIDGE[sign.el] };
}
// small night card that opens the Moon page
function moonLink() {
  const mn = moonData(), pg = MG.phaseGuideAt(mn.elong), ms = signOfK(mn.sign);
  return `<button class="mn-link" data-action="nav" data-to="moon">${moonArt(mn.elong)}<span><small>${pg.name} · ${Math.round(mn.illum * 100)}% lit</small><b>Your inner weather tonight</b><i>Heart, mind and spirit, plus your moon ritual</i></span>${icon('chevR', 18)}</button>`;
}
function cosmicCard() {
  const cp = cosmicProfile(), moon = Z.moonPhase(new Date());
  return `<button class="card cosmic-card" data-action="nav" data-to="cosmic">
    <span class="cc-glyphs"><b>${cp ? cp.sign.glyph : '✦'}</b><i>${cp ? cp.cz.animal.han : '☯'}</i></span>
    <span class="cc-t"><span class="eyebrow">Cosmic rhythm · ${moon.name}</span>
      <span class="share-t">${cp ? `${cp.sign.name} · ${cp.cz.element} ${cp.cz.animal.name}` : 'Add your birthday to unlock your zodiac'}</span></span>${icon('chevR', 18)}</button>`;
}
// Hand-made line art for each "Your stars" topic (glowing lime strokes, gently breathing).
const STAR_ART = {
  emotions: '<path d="M20 120 Q50 90 80 120 T140 120 T200 120"/><path d="M20 145 Q50 115 80 145 T140 145 T200 145" opacity=".55"/><path d="M20 95 Q50 65 80 95 T140 95 T200 95" opacity=".35"/><circle cx="110" cy="55" r="14"/>',
  body: '<path d="M110 30 a14 14 0 1 1 0.1 0"/><path d="M110 58 C92 70 90 96 98 112 C104 124 92 140 94 168 M110 58 C128 70 130 96 122 112 C116 124 128 140 126 168"/><path d="M98 80 L72 104 M122 80 L148 62"/><circle cx="110" cy="112" r="40" opacity=".25"/>',
  moon: '<circle cx="110" cy="100" r="46"/><path d="M110 54 A46 46 0 0 1 110 146 A30 46 0 0 0 110 54Z" fill="currentColor" fill-opacity=".18"/><circle cx="40" cy="40" r="2"/><circle cx="180" cy="60" r="1.6"/><circle cx="170" cy="160" r="2.2"/><circle cx="50" cy="150" r="1.4"/>',
  path: '<path d="M30 170 C70 160 60 120 100 115 S150 80 140 55 S170 30 195 28" stroke-dasharray="4 6"/><circle cx="30" cy="170" r="5"/><circle cx="100" cy="115" r="4"/><circle cx="140" cy="55" r="4"/><circle cx="195" cy="28" r="7"/>',
  social: '<circle cx="70" cy="95" r="22"/><circle cx="150" cy="95" r="22"/><circle cx="110" cy="150" r="22"/><path d="M92 95 H128 M80 115 L98 132 M140 115 L122 132" opacity=".6"/>',
  romance: '<circle cx="90" cy="100" r="40"/><circle cx="130" cy="100" r="40"/><path d="M110 70 C100 82 100 118 110 130 C120 118 120 82 110 70Z" fill="currentColor" fill-opacity=".2"/>',
  career: '<path d="M30 170 H70 V135 H110 V100 H150 V65 H190"/><path d="M160 40 L190 40 L190 70" /><path d="M120 90 L190 40" opacity=".5"/>',
  beauty: '<ellipse cx="110" cy="95" rx="44" ry="58"/><path d="M110 153 V185 M85 185 H135"/><path d="M95 70 Q110 60 125 70" opacity=".5"/>',
  creativity: '<path d="M110 100 m0 0 a6 6 0 1 1 12 0 a18 18 0 1 1 -36 0 a30 30 0 1 1 60 0 a42 42 0 1 1 -84 0 a54 54 0 1 1 108 0"/>',
  sensuality: '<path d="M110 160 C70 130 70 80 110 40 C150 80 150 130 110 160Z"/><path d="M110 160 C80 150 50 120 45 90 C75 95 100 120 110 160Z" opacity=".6"/><path d="M110 160 C140 150 170 120 175 90 C145 95 120 120 110 160Z" opacity=".6"/>',
  fragrance: '<rect x="85" y="95" width="50" height="70" rx="12"/><rect x="100" y="78" width="20" height="17" rx="4"/><path d="M105 70 C95 55 120 50 108 32 M118 66 C130 52 112 44 124 28" opacity=".55"/>',
  flower: '<circle cx="110" cy="85" r="10"/>' + [0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="110" cy="58" rx="11" ry="20" transform="rotate(${a} 110 85)"/>`).join('') + '<path d="M110 105 C108 135 112 160 110 185 M110 150 C95 140 85 140 78 148 M110 160 C125 150 135 150 142 158" opacity=".7"/>',
};
const STAR_N = { emotions: '01', body: '02', moon: '03', path: '04', social: '05', romance: '06', career: '07', beauty: '08', creativity: '09', sensuality: '10', fragrance: '11', flower: '12' };
function starArt(k) {
  return `<svg class="sa" viewBox="0 0 220 200" aria-hidden="true"><defs><filter id="sg-${k}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" filter="url(#sg-${k})">${STAR_ART[k] || ''}</g></svg>`;
}
// ---------- readings from her birth chart: each topic is read from the planet that rules it, in the sign and house it sits in ----------
// [point, field in SIGN_DEPTH, what this placement says]; 'asc' = rising sign, 'mc' = top of the chart, 'h5' = 5th house sign
const TOPIC_PLAN = {
  emotions: [['moon', 'emotions', 'How you feel'], ['h4', 'emotions', 'What makes you feel safe']],
  body: [['asc', 'body', 'Your body and first impression'], ['mars', 'body', 'Your physical energy']],
  path: [['sun', 'path', 'Who you are becoming'], ['jupiter', 'path', 'Where you grow and get lucky']],
  social: [['mercury', 'social', 'How you talk and connect'], ['jupiter', 'social', 'How you are generous']],
  romance: [['venus', 'romance', 'How you love'], ['mars', 'romance', 'What draws you in']],
  career: [['mc', 'career', 'Your calling'], ['saturn', 'career', 'Where you build mastery']],
  beauty: [['venus', 'beauty', 'Your beauty'], ['asc', 'beauty', 'How your look reads']],
  creativity: [['sun', 'creativity', 'Your creative fire'], ['h5', 'creativity', 'What you love to make']],
  sensuality: [['venus', 'sensuality', 'What you desire'], ['mars', 'sensuality', 'How you go after it']],
  fragrance: [['venus', 'fragrance', 'Your scent, from your Venus'], ['moon', 'fragrance', 'Your comfort scent, from your Moon']],
  flower: [['venus', 'fragrance', 'Your Venus']],
};
const PT = { asc: ['↑', 'Rising'], mc: ['MC', 'Midheaven'], h4: ['⌂', '4th house'], h5: ['✦', '5th house'] };
function chartRead(k) {
  const c = birthChart(state.profile), plan = TOPIC_PLAN[k]; if (!c || !plan) return null;
  const ord = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th');
  const signAt = h => c.asc ? AS.SIGN_KEYS[(AS.SIGN_KEYS.indexOf(c.asc.sign) + h - 1) % 12] : null;
  const rows = plan.map(([p, f, role]) => {
    let sign, house, glyph, name, dig = '';
    if (p === 'asc' || p === 'mc') { if (!c.asc) return null; sign = c[p].sign; house = p === 'asc' ? 1 : c.house(c.mc.lon); [glyph, name] = PT[p]; }
    else if (p === 'h4' || p === 'h5') { sign = signAt(+p[1]); if (!sign) return null; house = +p[1]; [glyph, name] = PT[p]; }
    else { const x = c.planets.find(y => y.k === p); sign = x.sign; house = x.house; glyph = x.glyph; name = x.name; dig = x.dignity; }
    const line = (Z.SIGN_DEPTH[sign] || {})[f]; if (!line) return null;
    const title = p === 'h4' || p === 'h5' ? `${signOfK(sign).name} on your ${name}` : p === 'asc' ? `${signOfK(sign).name} rising` : p === 'mc' ? `${signOfK(sign).name} Midheaven` : `${name} in ${signOfK(sign).name}${house ? `, ${ord(house)} house` : ''}`;
    return { p, glyph, title, role, line, dig, sign, house };
  }).filter(Boolean);
  if (!rows.length) return null;
  // today: the sky touching the planets of this topic
  const tr = AS.transits(c), keys = plan.map(x => x[0]), pName = q => AS.PLANETS.find(x => x.k === q).name;
  const hits = tr.hits.filter(h => keys.includes(h.n)).slice(0, 2).map(h => `${h.t === 'moon' ? 'The Moon' : pName(h.t)} ${Z.ASPECT_VERB[h.k]} your ${pName(h.n)} today: ${Z.ASPECT_TONE[h.k]}`);
  const main = AS.PLANETS.find(x => x.k === keys.find(q => AS.PLANETS.some(y => y.k === q)));
  const sky = main && { name: main.name, glyph: main.glyph, sign: AS.signOf(tr.sky[main.k]), house: c.house(tr.sky[main.k]) };
  return { rows, hits, sky, peek: rows[0].title.replace(/, \d+\w+ house$/, '') };
}
function starTile(k, cls = '') {
  const T = Z.STAR_TOPICS[k], phase = M.info ? M.info.phase : 'follicular';
  const cr = k === 'moon' ? null : chartRead(k);
  const peek = k === 'moon' ? Z.moonPhase(new Date()).name : cr ? cr.peek : (T.phase[phase] || '').split(/[—.:]/)[0];
  const ph_ = starPhoto(k, 600);
  return `<button class="st-tile ${cls} ${ph_ ? 'has-photo' : ''}" data-action="nav" data-to="cosmic/${k}">${ph_ ? `<img class="st-photo" src="${ph_}" alt="" loading="lazy"><span class="st-shade"></span>` : `<span class="st-art">${starArt(k)}</span>`}
    <span class="st-meta"><small>${STAR_N[k]}</small><b>${T.t}</b><em>${peek}</em></span></button>`;
}
const constellation = (n, t) => `<div class="st-rule"><span>${n}</span><i></i><span>${t}</span></div>`;
function starSections() {
  return `${constellation('I', 'Readings')}
    <div class="st-head"><h2>Your <span>readings</span></h2><p>${birthChart(state.profile) ? 'Read from your birth chart, today\'s sky and your cycle' : 'Your sign and your hormones, woven together for today'}</p></div>
    <div class="st-grid two">${starTile('emotions', 'tall')}${starTile('body', 'tall')}</div>
    ${starTile('moon', 'wide solo')}
    ${constellation('II', 'Guidance')}
    <div class="st-head"><h2>Your <span>guidance</span></h2><p>Use your cycle and your stars to move through life</p></div>
    <div class="st-grid guide">${starTile('path', 'wide')}${starTile('social')}${starTile('romance', 'tall2')}${starTile('career')}</div>
    ${constellation('III', 'Feminine energy')}
    <div class="st-head"><h2>Feminine <span>energy</span></h2><p>Self-care rituals for your sign and your phase</p></div>
    <div class="st-grid two">${starTile('beauty')}${starTile('creativity')}</div>
    ${starTile('sensuality', 'wide solo')}
    <div class="st-grid two">${starTile('fragrance')}${starTile('flower')}</div>`;
}
function viewStar(k) {
  const T = Z.STAR_TOPICS[k], cp = cosmicProfile(); if (!T) return viewMissing();
  const phase = M.info ? M.info.phase : 'follicular', ph = PHASES[phase], tc = TCM[phase], u = starPhoto(k, 1100), moon = Z.moonPhase(new Date());
  const A = Z.TOPIC_ASTRO[k], S = cp ? cp.sign : null, SD = S ? Z.SIGN_DEPTH[S.k] : null, CR = k === 'moon' ? null : chartRead(k);
  const poss = n => /s$/.test(n) ? `${n}’` : `${n}’s`;
  const waxing = moon.age < 14.77, building = phase === 'follicular' || phase === 'ovulatory';
  const phaseLine = k === 'moon' ? (waxing === building ? 'The moon and your body are moving the same way right now. Go with it.' : 'The moon and your body are on different tides. Honour your body first, the moon second.') : T.phase[phase];
  const signLine = !S ? '' : k === 'flower' ? `${S.name}’s flower is the ${Z.SIGN_FLOWER[S.k].toLowerCase()}, the bloom said to carry your sign’s qualities.` : k === 'moon' ? `Ruled by ${SD.ruler}, ${S.name} ${S.el === 'Water' ? 'feels the moon’s pull strongly' : 'feels the moon most through mood and sleep'}.` : SD[k] || T.el[S.el] || '';
  const title = k === 'moon' ? `The <em>${moon.name.toLowerCase()}</em>` : `Your <em>${T.t.toLowerCase()}</em>`;
  const order = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  const seasons = k === 'moon' ? '' : `<div class="sd-h">${T.t} through your month</div>
    <div class="sd-seasons">${order.map(p => `<div class="sd-sea ${p === phase ? 'on' : ''}" data-p="${p}"><span class="sd-dot"></span><b>${PHASES[p].name}</b><small>${PHASES[p].season}</small><p>${T.phase[p]}</p>${p === phase ? '<i>You are here</i>' : ''}</div>`).join('')}</div>`;
  const tries = [
    k === 'moon' ? moon.ritual : `${ph.superpower.title}: ${ph.superpower.text}`,
    S ? S.ritual : null,
    S && T.el[S.el] && T.el[S.el] !== signLine ? T.el[S.el] : null,
    `${tc.element} season in TCM: ${tc.principle.toLowerCase()}.`,
  ].filter(Boolean);
  const split = t => { const i = t.indexOf(': '); return i > 0 && i < 40 ? [t.slice(0, i), t.slice(i + 2)] : ['', t]; };
  const chip = (g, n, v) => `<span class="zs-chip"><small>${n}</small><b>${g ? `${g} ` : ''}${v}</b></span>`;
  return `<div class="pad zs">
    <section class="zs-photo"><img src="${u || starPhoto('sky', 1100)}" alt="" decoding="async">
      <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button></section>
    <div class="zs-head"><span class="zs-eye">${STAR_N[k] || 'Your stars'} · ${ph.name} phase</span><h1>${title}</h1>${k === 'moon' ? `<p>${Math.round(moon.illum * 100)}% lit tonight</p>` : ''}</div>

    ${S ? `<section class="zs-sign" style="--zc:${({ Fire: '#c2563a', Earth: '#5f7a34', Air: '#4a7ea8', Water: '#4a5aa0' })[S.el] || '#20301a'}">
      <div class="zs-sign-top"><span class="zs-glyph">${S.glyph}</span><span><small>Your sign</small><b>${S.name}</b><em>${S.el} · ruled by ${SD.ruler}</em></span></div>
      <p class="zs-says">${signLine || S.gift + '.'}</p>
      <div class="zs-chips">${chip('', 'Colour', SD.color)}${chip('', 'Stone', SD.stone)}${chip('', 'Flower', Z.SIGN_FLOWER[S.k])}</div>
    </section>` : `<section class="zs-sign"><p class="zs-says">Add your birthday and this page reads ${T ? T.t.toLowerCase() : 'it'} for your sign.</p><button class="btn btn-dark" data-action="nav" data-to="profile">Add birthday</button></section>`}

    <section class="zs-today" style="--c:${PH_HEX[phase]}"><span class="zs-dot"></span><div><small>Today · ${ph.name} · ${ph.season}</small><p>${phaseLine}</p></div></section>

    <h2 class="zs-h">Try today</h2>
    <ol class="zs-try">${tries.slice(0, 3).map((t, i) => { const [h, x] = split(t); return `<li><i>${i + 1}</i><span>${h ? `<b>${h}</b>` : ''}${x}</span></li>`; }).join('')}</ol>

    ${S ? `<div class="zs-two"><section class="zs-gift"><small>${icon('spark', 13)} Your gift</small><p>${S.gift}.</p></section><section class="zs-shadow"><small>${icon('moon', 13)} Watch for</small><p>${S.shadow}.</p></section></div>` : ''}

    ${k === 'moon' ? '' : `<h2 class="zs-h">${T.t} through your month</h2>
    <div class="zs-month">${order.map(p => `<div class="${p === phase ? 'on' : ''}" style="--c:${PH_HEX[p]}"><span class="zs-dot"></span><div><b>${PHASES[p].name}${p === phase ? ' <em>now</em>' : ''}</b><p>${T.phase[p]}</p></div></div>`).join('')}</div>`}

    ${CR || A ? `<details class="zs-more"><summary>${icon('star', 15)} In your birth chart ${icon('chevD', 14)}</summary>
      ${CR ? CR.rows.map(r => `<div class="sdc-r"><span class="sdc-g">${r.glyph}</span><div><small>${r.role}</small><b>${r.title}</b><p>${r.line}</p></div></div>`).join('') : ''}
      ${A ? `<div class="sdc-r"><span class="sdc-g">${A.glyph}</span><div><small>${A.planet} · ${A.house}</small><p>${A.why}</p></div></div>` : ''}</details>` : ''}

    ${S ? `<section class="zs-aff"><small>Say it today</small><p>“${S.aff}”</p></section>` : ''}
    <p class="fine center">Astrology is a tradition for reflection, not science. Your cycle part is based on typical hormone patterns.</p>
  </div>`;
}
// ---------- birth chart: traditional Western astrology in the style of flatlib, computed offline in js/astro.js ----------
const signOfK = k => Z.SIGNS.find(x => x.k === k);
function birthChart(p) {
  if (!p || !/^\d{4}-\d\d-\d\d$/.test(p.birthday || '')) return null;
  const key = [p.birthday, p.birthTime, p.birthPlace && p.birthPlace.lat, p.birthPlace && p.birthPlace.lng].join('|');
  if (birthChart.k !== key) { birthChart.k = key; try { birthChart.v = AS.chart({ date: p.birthday, time: p.birthTime, place: p.birthPlace }); } catch { birthChart.v = null; } }
  return birthChart.v;
}
// Without a birth time the Moon could sit in the sign next door when it is close to the edge.
const moonSure = c => c.hasTime || (c.planets[1].deg > 6.5 && c.planets[1].deg < 23.5);
async function placeFind(scope) {
  const q = String((scope === 'onb' ? ui.onb.placeQ : ui.placeQ) || '').trim();
  if (q.length < 2) { toast('Type the city you were born in'); return; }
  ui.placeBusy = true; render();
  try {
    const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`)).json();
    ui.placeRes = (j.results || []).map(x => ({ name: [x.name, x.country].filter(Boolean).join(', '), area: x.admin1 && x.admin1 !== x.name && !x.admin1.includes(x.name) ? x.admin1 : '', lat: +x.latitude.toFixed(3), lng: +x.longitude.toFixed(3), tz: x.timezone }));
    if (!ui.placeRes.length) toast('No place found. Try the nearest bigger city.');
  } catch { ui.placeRes = []; toast('You seem to be offline. Try again in a moment.'); }
  ui.placeBusy = false; render();
}
function birthInputs(scope, src) {
  const pl = src.birthPlace, res = ui.placeRes || [], q = scope === 'onb' ? ui.onb.placeQ : ui.placeQ;
  return `<div class="bi">
    <label class="bi-row"><span>${icon('clock', 16)} Birth time</span><input class="field" type="time" data-input="${scope}.birthTime" value="${src.birthTime || ''}"></label>
    ${pl ? `<div class="bi-row bi-pl"><span>${icon('pin', 16)} Born in</span><b>${esc(pl.name)}</b><button class="link" data-action="placeClear" data-scope="${scope}">Change</button></div>`
      : `<div class="bi-find"><input class="field" data-input="${scope === 'onb' ? 'onb' : 'ui'}.placeQ" placeholder="City you were born in" value="${esc(q || '')}" autocomplete="off" enterkeyhint="search"><button class="btn btn-dark" data-action="placeFind" data-scope="${scope}" ${ui.placeBusy ? 'disabled' : ''}>${ui.placeBusy ? '…' : 'Find'}</button></div>
        ${res.length ? `<div class="bi-res">${res.map((r, i) => `<button data-action="placePick" data-scope="${scope}" data-i="${i}">${icon('pin', 14)}<span>${esc(r.name)}${r.area ? `<small>${esc(r.area)}</small>` : ''}</span></button>`).join('')}</div>` : ''}`}
    <p class="bi-note">${src.birthTime && pl ? 'Your Moon, Rising sign and houses are ready.' : 'Time and place give you your Rising sign and houses. The time is usually on your birth certificate.'}</p>
  </div>`;
}
// The three that matter most: Sun, Moon, Rising, as round bubbles.
function bigThree(c) {
  const b = (g, k, sign, sub) => `<div class="b3"><span class="b3-g">${g}</span><b>${sign ? signOfK(sign).name : 'Add time'}</b><small>${k}${sub || ''}</small></div>`;
  return `<div class="b3s">${b(c.planets[0].glyph, 'Sun', c.planets[0].sign)}${b(c.planets[1].glyph, 'Moon', c.planets[1].sign, moonSure(c) ? '' : ' · about')}${b('↑', 'Rising', c.asc && c.asc.sign)}</div>`;
}
function chartWheel(c) {
  const cx = 150, cy = 150, base = c.asc ? c.asc.lon : 0, EL = { Fire: '#f6dde3', Earth: '#e6eecf', Air: '#f3eee6', Water: '#e3e7f4' };
  const pt = (lon, r) => { const t = (180 + lon - base) * Math.PI / 180; return [cx + r * Math.cos(t), cy - r * Math.sin(t)]; };
  const arc = (a0, a1, r0, r1) => { const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r1} ${r1} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${r0} ${r0} 0 0 1 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`; };
  const signs = Z.SIGNS.slice().sort((a, b) => AS.SIGN_KEYS.indexOf(a.k) - AS.SIGN_KEYS.indexOf(b.k));
  let ring = signs.map((sg, i) => { const [gx, gy] = pt(i * 30 + 15, 127); return `<path d="${arc(i * 30, i * 30 + 30, 113, 141)}" fill="${EL[sg.el]}" stroke="#fff" stroke-width="1.5"/><text x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" class="cw-sg">${sg.glyph}</text>`; }).join('');
  // planets: step inward when two sit close together so the glyphs never overlap
  const ps = c.planets.slice().sort((a, b) => a.lon - b.lon); let last = -99, lvl = 0;
  const marks = ps.map(p => { lvl = p.lon - last < 9 ? (lvl + 1) % 3 : 0; last = p.lon; const r = 96 - lvl * 15, [x, y] = pt(p.lon, r), [tx, ty] = pt(p.lon, 113);
    return `<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${pt(p.lon, 108)[0].toFixed(1)}" y2="${pt(p.lon, 108)[1].toFixed(1)}" class="cw-tick"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" class="cw-pc ${p.k}"/><text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="cw-pg">${p.glyph}</text>`; }).join('');
  const lines = c.aspects.filter(a => a.k !== 'conjunction').map(a => { const A = c.planets.find(p => p.k === a.a), B = c.planets.find(p => p.k === a.b), [x1, y1] = pt(A.lon, 58), [x2, y2] = pt(B.lon, 58);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="cw-as ${/square|opposition/.test(a.k) ? 'hard' : 'soft'}"/>`; }).join('');
  const seg = lon => { const [x1, y1] = pt(lon, 60), [x2, y2] = pt(lon, 141); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="cw-ax"/>`; };
  const axis = c.asc ? (() => { const [lx, ly] = pt(c.asc.lon, 151), [nx, ny] = pt(c.mc.lon, 151);
    return `${seg(c.asc.lon)}${seg(c.asc.lon + 180)}${seg(c.mc.lon)}<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="cw-al">AC</text><text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" class="cw-al">MC</text>`; })() : '';
  return `<svg class="cw" viewBox="-12 -12 324 324" role="img" aria-label="Your birth chart wheel">${ring}<circle cx="${cx}" cy="${cy}" r="113" class="cw-in"/><circle cx="${cx}" cy="${cy}" r="58" class="cw-core"/>${lines}${axis}${marks}
    <text x="${cx}" y="${cy - 7}" class="cw-c1">${new Date(c.date + 'T12:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</text><text x="${cx}" y="${cy + 12}" class="cw-c2">your sky at birth</text></svg>`;
}
function chartTab(cp) {
  const p = state.profile, c = birthChart(p); if (!c) return '';
  const phase = M.info && M.info.phase, tr = AS.transits(c), ord = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th');
  const pp = phase && Z.PHASE_PLANET[phase], pl = pp && c.planets.find(x => x.k === pp[0]);
  const ppText = pl && (pl.k === 'moon' ? (Z.SIGN_DEPTH[pl.sign] || {}).emotions : Z.PLANET_LINE[pl.k](Z.SIGN_STYLE[pl.sign]));
  const pName = k => AS.PLANETS.find(x => x.k === k).name;
  return `${c.hasTime ? '' : `<section class="card glass bi-card"><div class="eyebrow dark">Complete your chart</div><h3 class="dark-h">Add your birth time and place</h3>${birthInputs('profile', p)}</section>`}
    <section class="card glass cw-card">${chartWheel(c)}${bigThree(c)}</section>
    ${pl ? `<section class="cz-pp"><span class="cz-pp-g">${pl.glyph}</span><div><small>${pp[1]}</small><b>${pl.name} in ${signOfK(pl.sign).name}</b><p>${pp[2]} ${ppText}</p></div></section>` : ''}
    ${sectionTitle('Today in your chart')}
    <section class="card glass cz-sky"><div class="cz-sky-m"><span>${AS.PLANETS[1].glyph}</span><div><b>The Moon is in ${signOfK(tr.moon.sign).name}${tr.moon.house ? `, your ${ord(tr.moon.house)} house` : ''}</b>
      <p>${tr.moon.house ? `${Z.HOUSES[tr.moon.house - 1][0]}. ${Z.HOUSES[tr.moon.house - 1][1]}` : `A day to move ${Z.SIGN_STYLE[tr.moon.sign]}. Add your birth time and place to see which part of your life it lights up.`}</p></div></div>
      ${tr.hits.slice(0, 3).map(h => `<div class="cz-hit"><span class="cz-hit-g">${h.glyph}</span><div><b>${h.t === 'moon' ? 'The Moon' : pName(h.t)} ${Z.ASPECT_VERB[h.k]} your ${pName(h.n)}</b><small>${Z.PLANET_THEME[h.n].charAt(0).toUpperCase() + Z.PLANET_THEME[h.n].slice(1)} · ${Z.ASPECT_TONE[h.k]}</small></div></div>`).join('')}</section>
    ${sectionTitle('Your planets')}
    <section class="card glass cz-pl">${c.planets.map(x => `<div class="cz-pr"><span class="cz-pr-g">${x.glyph}</span><div class="cz-pr-t"><b>${x.name} in ${signOfK(x.sign).name} <i>${Math.floor(x.deg)}°</i></b><small>${x.house ? `${ord(x.house)} house · ${Z.HOUSES[x.house - 1][0]}` : Z.PLANET_THEME[x.k].charAt(0).toUpperCase() + Z.PLANET_THEME[x.k].slice(1)}</small><p>${Z.PLANET_LINE[x.k](Z.SIGN_STYLE[x.sign])}${x.dignity ? ` ${Z.DIGNITY_NOTE[x.dignity]}` : ''}</p></div>${x.dignity ? `<em class="cz-dg ${x.dignity}">${Z.DIGNITY_WORD[x.dignity]}</em>` : ''}</div>`).join('')}</section>
    ${c.hasTime ? `${sectionTitle('Birth time and place')}<section class="card glass">${birthInputs('profile', p)}</section>` : ''}`;
}
// ---------- Cosmic rhythm, redesigned: a night hero with her birth chart drawn in light particles, the big three as
// ring bubbles and today's line; below, white cards that explain everything in plain words ----------
const ORD = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th');
const pNameOf = k => AS.PLANETS.find(x => x.k === k).name;
// the chart wheel as glowing dots: dotted sign ring, dotted house spokes, planets as bright stars
function particleWheel(c) {
  const cx = 160, cy = 160, base = c && c.asc ? c.asc.lon : 0;
  const pt = (lon, r) => { const t = (180 + lon - base) * Math.PI / 180; return [cx + r * Math.cos(t), cy - r * Math.sin(t)]; };
  const f = n => n.toFixed(1);
  let rings = '', signs = '', spokes = '', planets = '', lines = '';
  rings = [150, 128, 104].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="pw-ring r${i}"/>`).join('');
  for (let i = 0; i < 12; i++) {
    const [x1, y1] = pt(i * 30, 104), [x2, y2] = pt(i * 30, 150), [gx, gy] = pt(i * 30 + 15, 139);
    spokes += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="pw-spoke"/>`;
    signs += `<text x="${f(gx)}" y="${f(gy)}" class="pw-sg">${Z.SIGNS[i].glyph}</text>`;
  }
  if (c) {
    // spread close planets apart along the ring (the tick still points to the true degree), alternate two radii in clusters
    const ps = [...c.planets].sort((a, b) => a.lon - b.lon), disp = ps.map(p => p.lon);
    for (let n = 0; n < 4; n++) for (let i = 1; i < disp.length; i++) if (disp[i] - disp[i - 1] < 13) { const mid = (disp[i] + disp[i - 1]) / 2; disp[i - 1] = mid - 6.5; disp[i] = mid + 6.5; }
    ps.forEach((p, i) => { const close = (i > 0 && disp[i] - disp[i - 1] < 20) && i % 2 === 1, r = close ? 70 : 88; const [x, y] = pt(disp[i], r), [dx, dy] = pt(p.lon, 104), [ex, ey] = pt(disp[i], r + 11);
      planets += `<line x1="${f(ex)}" y1="${f(ey)}" x2="${f(dx)}" y2="${f(dy)}" class="pw-tick"/><circle cx="${f(dx)}" cy="${f(dy)}" r="2.2" class="pw-dot"/><circle cx="${f(x)}" cy="${f(y)}" r="9" class="pw-halo"/><text x="${f(x)}" y="${f(y)}" class="pw-pg">${p.glyph}</text>`; });
    lines = c.aspects.filter(a => a.k !== 'conjunction').slice(0, 10).map(a => { const A = c.planets.find(p => p.k === a.a), B = c.planets.find(p => p.k === a.b); if (!A || !B) return ''; const [x1, y1] = pt(A.lon, 58), [x2, y2] = pt(B.lon, 58); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="pw-asp ${a.k}"/>`; }).join('');
    if (c.asc) { const [ax, ay] = pt(c.asc.lon, 162); planets += `<text x="${f(ax)}" y="${f(ay)}" class="pw-ac">AC</text>`; }
  }
  return `<svg class="pw" viewBox="0 0 320 320" role="img" aria-label="Your birth chart drawn as stars">
    ${rings}${spokes}${signs}<circle cx="${cx}" cy="${cy}" r="58" class="pw-core"/>${lines}${planets}</svg>`;
}
// Today's sky for her, as one number: easy angles from today's planets to her birth chart add, tense ones take away,
// and the Moon's element agreeing with her Sun's element adds a little. A reflection aid, not a forecast.
const ASP_W = { trine: 9, sextile: 6, conjunction: 4, square: -7, opposition: -6 };
const EL_FRIEND = { Fire: 'Air', Air: 'Fire', Earth: 'Water', Water: 'Earth' };
const capF = t => t.charAt(0).toUpperCase() + t.slice(1);
const HIT_SAY = {
  conjunction: (t, n) => `${capF(t)} and ${n} come together. Strong and focused.`,
  trine: (t, n) => `${capF(t)} can flow easily into ${n}. Use the easy energy.`,
  sextile: (t, n) => `${capF(t)} can open a small door for ${n}. Say yes to it.`,
  square: (t, n) => `${capF(t)} can rub against ${n}. Some friction, so go gently.`,
  opposition: (t, n) => `${capF(t)} can pull against ${n}. Find the middle.`,
};
const NAT_THEME = { sun: 'who you are', moon: 'your feelings', mercury: 'your mind', venus: 'your love life', mars: 'your drive', jupiter: 'your luck', saturn: 'your patience' };
const SKY_THEME = { sun: 'today’s light', moon: 'today’s feelings', mercury: 'today’s thoughts', venus: 'today’s charm', mars: 'today’s drive', jupiter: 'today’s luck', saturn: 'today’s duties' };
function skyScore(c) {
  if (!c) return null;
  const tr = AS.transits(c), base = 62;
  // the same planet making the same angle to several of hers reads as one line: "The Moon faces your Sun, Mars and Saturn"
  const and = a => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
  const groups = [];
  tr.hits.slice(0, 6).forEach(h => { const w = h.k === 'conjunction' && (h.t === 'saturn' || h.t === 'mars') ? -3 : ASP_W[h.k];
    const g = groups.find(x => x.t === h.t && x.k === h.k); if (g) { g.ns.push(h.n); g.w += w; } else groups.push({ t: h.t, k: h.k, glyph: h.glyph, ns: [h.n], w }); });
  const rows = groups.slice(0, 4).map(g => ({ ...g, tg: AS.PLANETS.find(x => x.k === g.t).glyph,
    title: `${g.t === 'moon' ? 'The Moon' : pNameOf(g.t)} ${Z.ASPECT_VERB[g.k]} your ${and(g.ns.map(pNameOf))}`,
    say: HIT_SAY[g.k](SKY_THEME[g.t], and(g.ns.map(n => NAT_THEME[n]))) }));
  const sunEl = signOfK(c.planets[0].sign).el, moonEl = signOfK(tr.moon.sign).el;
  const mw = moonEl === sunEl ? 6 : EL_FRIEND[sunEl] === moonEl ? 4 : -2;
  const el = { w: mw, title: `Moon in ${moonEl}, your Sun in ${sunEl}`, say: mw > 4 ? 'Same element. What you feel and who you are agree today.' : mw > 0 ? 'Friendly elements. Feelings support you.' : 'Different elements. Feelings may not match your plans, and that is fine.' };
  const s = Math.max(18, Math.min(97, Math.round(base + rows.reduce((t, r) => t + r.w, 0) + mw)));
  return { s, base, rows, el, tr, word: s >= 76 ? 'Easy flow' : s >= 58 ? 'Mixed sky' : 'Go gently', tone: s >= 76 ? 'easy' : s >= 58 ? 'mixed' : 'gentle' };
}
// a black opal stone with her Sun sign's stars drawn in light
function opalStone(sign) {
  const S = MG.STARS[sign];
  const stars = S ? `<svg class="op-stars" viewBox="0 0 100 100" aria-hidden="true">${S.l.map(([a, b]) => `<line x1="${S.s[a][0]}" y1="${S.s[a][1]}" x2="${S.s[b][0]}" y2="${S.s[b][1]}"/>`).join('')}
    ${S.s.map(([x, y, r], i) => `<circle class="op-sg" cx="${x}" cy="${y}" r="${r * 2.2}"/><circle class="op-st" cx="${x}" cy="${y}" r="${r * 0.7}" style="--i:${i}"/>`).join('')}</svg>` : '';
  return `<div class="op" aria-hidden="true"><span class="op-halo"></span><span class="op-stone"><i class="op-flash"></i><i class="op-flash b"></i>${stars}<i class="op-shine"></i></span><span class="op-floor"></span></div>`;
}
// a ring bubble: a thin progress ring with the value inside
function ringBub(frac, val, unit, k, sub, cls) {
  const r = 30, C2 = 2 * Math.PI * r, f = Math.max(0.02, Math.min(1, frac || 0));
  return `<div class="rb rb-${cls}"><svg viewBox="0 0 72 72" class="rb-svg" aria-hidden="true"><circle cx="36" cy="36" r="${r}" class="rb-bg"/><circle cx="36" cy="36" r="${r}" class="rb-fg" stroke-dasharray="${(C2 * f).toFixed(1)} ${C2.toFixed(1)}" transform="rotate(-90 36 36)"/></svg>
    <span class="rb-v"><b>${val}</b>${unit ? `<small>${unit}</small>` : ''}</span><span class="rb-k">${k}</span><span class="rb-s">${sub}</span></div>`;
}
function cosmicNight(cp, c) {
  const mn = moonData(), ms = signOfK(mn.sign), info = M.info, phase = info && info.phase, sc = skyScore(c);
  const sunK = c ? c.planets[0].sign : cp.sign.k, sun = signOfK(sunK);
  const L = (M.stats && M.stats.cycleLength) || state.profile.cycleLength || 28;
  const top = sc && sc.rows[0];
  const msg = top ? top.say : sc ? sc.el.say : `A day to move ${Z.SIGN_STYLE[mn.sign]}.`;
  const three = c ? `${sun.name} Sun · ${signOfK(c.planets[1].sign).name} Moon${c.asc ? ` · ${signOfK(c.asc.sign).name} rising` : ''}` : `${sun.name} Sun`;
  return `<section class="cn cn2">${skyDust()}
    <div class="cn-top"><button class="cn-back" data-action="back" aria-label="Back">${icon('chevL', 20)}</button><span class="cn-pill">Cosmic rhythm</span><span class="cn-sp"></span></div>
    ${opalStone(sunK)}
    <div class="cn-score ${sc ? sc.tone : ''}"><small>${sc ? 'Today’s sky for you' : 'Your sign'}</small>${sc ? `<b>${sc.s}</b><span>${sc.word}</span>` : `<h1>${sun.name}</h1>`}</div>
    <div class="cn-rings">
      ${ringBub(info ? info.cd / L : 0, info ? info.cd : '–', 'day', 'Body', info ? MG.INNER_SEASON[phase].name : 'your cycle', 'body')}
      ${ringBub(mn.illum, Math.round(mn.illum * 100), '%', 'Moon', `in ${ms.name}`, 'moon')}
      ${ringBub(c ? c.planets[0].deg / 30 : 0.5, sun.glyph, '', 'Self', `${sun.name} Sun`, 'self')}
    </div>
    <div class="cn-msg"><small>${three}</small><p>${msg}</p>${sc ? '<button class="cn-cta" data-action="czWhy">See why</button>' : ''}</div>
  </section>`;
}
// Today tab: why the number is what it is, the three rings in plain words, the phase planet, then the readings
function cosmicToday(cp, c) {
  const mn = moonData(), pg = MG.phaseGuideAt(mn.elong), ms = signOfK(mn.sign), info = M.info, phase = info && info.phase, inner = phase && MG.INNER_SEASON[phase];
  const sc = skyScore(c), pp = phase && c && Z.PHASE_PLANET[phase], pl = pp && c.planets.find(x => x.k === pp[0]);
  const ppText = pl && (pl.k === 'moon' ? (Z.SIGN_DEPTH[pl.sign] || {}).emotions : Z.PLANET_LINE[pl.k](Z.SIGN_STYLE[pl.sign]));
  const val = w => `<em class="cw-v ${w > 0 ? 'up' : 'dn'}">${w > 0 ? '+' : '−'}${Math.abs(w)}</em>`;
  const ring = (cls, k, t, p) => `<div class="c3-r ${cls}"><span class="c3-dot"></span><div><b>${k} <i>${t}</i></b><p>${p}</p></div></div>`;
  return `${sc ? `<section class="card cx-why"><div class="cw-h"><div><small>Why today is</small><b>${sc.s} · ${sc.word}</b></div><span class="cw-big ${sc.tone}">${sc.s}</span></div>
      <p class="cw-lead">Every day starts at ${sc.base}. Easy angles between today’s planets and your birth chart add points, tense ones take some away.</p>
      ${sc.rows.map(r => `<div class="cw-r"><span class="cw-g">${r.tg}<i>${r.glyph}</i></span><div><b>${r.title}</b><p>${r.say}</p></div>${val(r.w)}</div>`).join('')}
      <div class="cw-r"><span class="cw-g">${AS.PLANETS[1].glyph}<i>△</i></span><div><b>${sc.el.title}</b><p>${sc.el.say}</p></div>${val(sc.el.w)}</div>
      ${sc.rows.length ? '' : '<p class="cw-quiet">No planet is pressing on your chart today. A quiet sky, so follow your cycle.</p>'}</section>` : ''}
    <section class="card c3"><div class="c3-h"><small>Your three rings</small><b>Three rhythms, one you</b></div>
      ${info ? ring('body', 'Body', `day ${info.cd}, ${inner.name.toLowerCase()}`, 'Your hormones set your energy. Everything else sits on top of this.') : ''}
      ${ring('mood', 'Moon', `${pg.name.toLowerCase()} in ${ms.name}`, 'Changes every two and a half days and colours how feelings show up.')}
      ${ring('self', 'Self', c ? `${signOfK(c.planets[0].sign).name} Sun` : `${cp.sign.name} Sun`, 'Your birth chart. It never changes, it shows your style.')}
      ${info ? `<div class="c3-all"><small>All together</small><p>${MG.innerBlend(mn.waxing, phase)}</p></div>` : ''}</section>
    ${pl ? `<section class="card cx-pp"><span class="cx-pg">${pl.glyph}</span><div><small>${pp[1]}</small><b>${pl.name} in ${signOfK(pl.sign).name}</b><p>${pp[2]} ${ppText.charAt(0).toLowerCase() + ppText.slice(1)}</p></div></section>` : ''}
    ${moonLink()}
    ${starSections()}`;
}
// Chart tab: the wheel explained, then every placement as a clean spec sheet
function cosmicChart(cp, c) {
  const p = state.profile;
  if (!c) return `<section class="card cx-add"><b>Add your birthday</b><p>Your birth chart is calculated on your phone from your birthday, time and place.</p><button class="btn btn-dark btn-block" data-action="nav" data-to="profile">Add birthday</button></section>`;
  return `${c.hasTime ? '' : `<section class="card cx-add"><small>Make it exact</small><b>Add your birth time and place</b><p>Without them we know your planets' signs, but not your rising sign or houses.</p>${birthInputs('profile', p)}</section>`}
    <section class="cx-wheel">${particleWheel(c)}<div class="cn-core"><small>Your sky at birth</small><b>${new Date(c.date + 'T12:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</b></div>
      <div class="cxw-key">${c.planets.map(x => `<span><i>${x.glyph}</i>${x.name}</span>`).join('')}<span class="ln easy"><i></i>easy angle</span><span class="ln hard"><i></i>tense angle</span></div></section>
    <section class="card cx-how"><div class="cx-hw"><b>☉ Planet</b><span>what part of you</span></div><div class="cx-hw"><b>♓︎ Sign</b><span>how it acts</span></div><div class="cx-hw"><b>12th house</b><span>where in life</span></div></section>
    <section class="card cx-spec"><small class="cx-k">Your placements</small>
      ${c.planets.map(x => `<div class="cx-pr"><div class="cx-pt"><b>${x.name}</b><span>${x.glyph} ${signOfK(x.sign).name} ${Math.floor(x.deg)}°</span></div>
        <small>${Z.PLANET_THEME[x.k].charAt(0).toUpperCase() + Z.PLANET_THEME[x.k].slice(1)}${x.house ? ` · ${ORD(x.house)} house, ${Z.HOUSES[x.house - 1][0].toLowerCase()}` : ''}${x.dignity ? ` · <em class="cz-dg ${x.dignity}">${Z.DIGNITY_WORD[x.dignity]}</em>` : ''}</small>
        <p>${Z.PLANET_LINE[x.k](Z.SIGN_STYLE[x.sign])}${x.dignity ? ` ${Z.DIGNITY_NOTE[x.dignity]}` : ''}</p></div>`).join('')}
      ${c.asc ? `<div class="cx-pr"><div class="cx-pt"><b>Rising</b><span>↑ ${signOfK(c.asc.sign).name}</span></div><small>How you come across · your body</small><p>${(Z.SIGN_DEPTH[c.asc.sign] || {}).body || ''}</p></div>` : ''}
    </section>
    ${c.hasTime ? `${sectionTitle('Birth time and place')}<section class="card cx-add">${birthInputs('profile', p)}</section>` : ''}`;
}
function viewCosmic() {
  const cp = cosmicProfile(), now = new Date(), moon = Z.moonPhase(now);
  const phase = M.info ? M.info.phase : null;
  const mtype = Z.moonCycleType(M.stats.periods.map(p => p.start));
  const mc = mtype ? Z.MOON_CYCLES[mtype] : null;
  const moonSvg = (illum, waxing) => {
    const r = 46, k = Math.cos(illum * Math.PI) * r; // terminator ellipse
    return `<svg viewBox="0 0 120 120" width="120" height="120" class="moon"><defs><radialGradient id="mg"><stop offset="0" stop-color="#f6fbe9"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 80 * var(--hk)) calc(51% * var(--hs2)) 77%)"/></radialGradient></defs>
      <circle cx="60" cy="60" r="${r}" fill="#1a231b"/>
      <path d="M60 ${60 - r} A${r} ${r} 0 0 ${waxing ? 1 : 0} 60 ${60 + r} A${Math.abs(k)} ${r} 0 0 ${(k > 0) === waxing ? 0 : 1} 60 ${60 - r}Z" fill="url(#mg)"/>
      <circle cx="60" cy="60" r="${r + 10}" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77% / .15)"/></svg>`;
  };
  const birthdayField = `<input class="field" type="date" data-input="profile.birthday" value="${state.profile.birthday || ''}" max="${todayISO()}">`;
  if (!cp) {
    return `<section class="cn">${skyDust()}
      <div class="cn-top"><button class="cn-back" data-action="back" aria-label="Back">${icon('chevL', 20)}</button><span class="cn-pill">Cosmic rhythm</span><span class="cn-sp"></span></div>
      <div class="cn-wheel">${particleWheel(null)}<div class="cn-core"><small>Your birth chart</small><b>Waiting for you</b></div></div>
      <div class="cn-name"><small>Your big three</small><h1>Your sky at birth</h1></div>
      <p class="cn-lead">Add your birthday and we draw your chart and link it to your cycle and the Moon.</p></section>
    <div class="pad czx">
      <section class="card cx-add"><small>Start here</small><b>When were you born?</b>${birthdayField}<button class="btn btn-dark btn-block" data-action="saveBirthday">Reveal my rhythm</button></section>
      ${starSections()}
      ${moonSection()}
    </div>`;
  }
  function moonSection() {
    return `${moonLink()}${sectionTitle('The moon tonight')}
      ${(() => { const mn = moonData(), pg = MG.phaseGuideAt(mn.elong); return `<section class="card sx mn-now">${moonArt(mn.elong)}<div><small class="sx-k">${Math.round(mn.illum * 100)}% lit · day ${Math.floor(mn.age) + 1} of 29.5</small><b>${pg.name}</b><p>${pg.theme}. ${pg.heart}</p></div></section>`; })()}
      ${mc ? `<section class="card sx"><small class="sx-k">Your moon cycle · ${mc.when.toLowerCase()}</small><b class="sx-b">${mc.name} cycle</b><p class="sx-p">${mc.meaning}</p></section>` : ''}
      ${M.info ? moonMonth() : ''}
      ${sectionTitle('The moon and your cycle')}
      <section class="card glass tea-study"><div class="ts-i"><p>A lunar month lasts 29.5 days and the average cycle 29.3, so the idea of a moon rhythm is old and lovely. Long-term diaries of 22 women showed their cycles fell in step with the moon now and then, more often in younger women and with longer cycles. Artificial light at night and age weakened the link.</p><small>Helfrich-Förster 2021 (Science Advances) · Bull 2019</small></div>
        <div class="ts-i"><p>Large app studies with millions of cycles found no overall sync. So the moon is a beautiful mirror for reflection, not something your body must follow. Darker nights and less screen light are the part with science behind them.</p><small>Clue app analysis of 7.5 million cycles</small></div>
        </section>`;
  }
  // 30 days ahead: the moon each night above the colour of her phase that day.
  function moonMonth() {
    const days = Array.from({ length: 30 }, (_, i) => { const d = C.addDays(new Date(), i); return { d, m: Z.moonPhase(d), di: C.dayInfo(d, M.stats), ev: moonEvent(d) }; });
    return `${sectionTitle('Your next 30 nights')}
      <section class="card glass mm"><div class="mm-row">${days.map(({ d, m, di, ev }, i) => `<div class="mm-d ${i === 0 ? 'now' : ''} ${ev ? 'ev' : ''}">
        <span class="mm-tag">${ev === 'full' ? 'Full' : ev === 'new' ? 'New' : di && di.cd === 1 ? '🩸' : ''}</span>${moonSvg(m.illum, m.age < 14.77).replace('class="moon"', 'class="moon mini"')}
        <b>${d.getDate()}</b><i style="background:${di ? PHASE_COLOR.dark[di.phase] : 'transparent'}"></i></div>`).join('')}</div>
        <div class="mm-key">${PHASE_ORDER.map(ph => `<span><i style="background:${PHASE_COLOR.dark[ph]}"></i>${PHASES[ph].name}</span>`).join('')}</div></section>`;
  }
  const { sign, cz, five, bridge } = cp, tab = ['today', 'chart', 'moon', 'sign'].includes(ui.czTab) ? ui.czTab : 'today', bc = birthChart(state.profile);
  const badge = (g, k, v) => `<div class="cz-b"><span class="cz-g ${/[\u4e00-\u9fff]/.test(g) ? 'han' : ''}">${g}</span><b>${v}</b><small>${k}</small></div>`;
  // Signs tab: one clean spec sheet per tradition (Western sign, East meets West, Chinese year, five elements)
  const spec = (k, v) => `<div class="sx-r"><span>${k}</span><b>${v}</b></div>`;
  const signTab = `
    <section class="card sx"><div class="sx-h"><span class="sx-g">${sign.glyph}</span><div><small>Your Sun sign</small><b>${sign.name}</b><i>${sign.mode} ${sign.el}</i></div></div>
      ${spec('Body in astrology', sign.body)}${spec('Your gift', sign.gift)}${spec('Your shadow', sign.shadow)}
      <div class="sx-rit"><small>${sign.name} ritual</small><p>${sign.ritual}</p><q>${sign.aff}</q></div></section>
    <section class="card sx"><div class="sx-h"><span class="sx-g han">${Z.FIVE[bridge.tcm].han}</span><div><small>East meets West</small><b>${sign.el} × ${bridge.organ}</b></div></div>
      <p class="sx-p">${bridge.note}</p></section>
    <section class="card sx"><div class="sx-h"><span class="sx-g han">${cz.animal.han}</span><div><small>Your Chinese year</small><b>${cz.element} ${cz.animal.name}</b><i>${cz.animal.traits}</i></div></div>
      <p class="sx-p">${cz.animal.gift} ${cz.animal.tip}</p></section>
    <section class="card sx"><div class="sx-h"><span class="sx-g han">${five.han}</span><div><small>Your element</small><b>${cz.element}</b></div></div>
      <div class="sx-4">${[['Organ', five.organ], ['Season', five.season], ['Colour', five.color], ['Taste', five.taste]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <div class="sx-emo"><span class="up">${icon('sun', 14)} In balance: ${five.emotion[0]}</span><span class="dn">${icon('moon', 14)} Out of balance: ${five.emotion[1]}</span></div>
      <p class="sx-p">${five.cycle}</p>
      <div class="sx-foods">${five.foods.map(f => `<span>${f}</span>`).join('')}</div>
      <div class="sx-rit"><small>Ritual</small><p>${five.ritual}</p></div></section>
    <section class="card sx"><small class="sx-k">Your birthday</small>${birthdayField}</section>`;
  return `${cosmicNight(cp, bc)}
  <div class="pad czx">
    <div class="seg cx-seg">${[['today', 'Today'], ['chart', 'Chart'], ['moon', 'Moon'], ['sign', 'Signs']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="czTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${tab === 'chart' ? cosmicChart(cp, bc) : tab === 'sign' ? `${phase ? `<section class="card sx sx-now"><small class="sx-k">${sign.el} sign, ${PHASES[phase].name.toLowerCase()} phase</small><p>${Z.EL_PHASE[sign.el][phase]}</p></section>` : ''}${signTab}` : tab === 'moon' ? moonSection() : cosmicToday(cp, bc)}
    <p class="fine center">Your chart is calculated on your phone with the traditional Western method (planets, whole-sign houses, aspects). Astrology, the five elements and moon cycles are spiritual traditions for reflection, not science or medical advice.</p>
  </div>`;
}
// ---------- the Moon page: tonight's real moon, the inner weather it brings (heart, mind, spirit), the moon in her chart, rituals ----------
function moonData() { const k = Math.floor(Date.now() / 6e4); if (moonData.k !== k) { moonData.k = k; moonData.v = AS.moonNow(new Date()); } return moonData.v; }
function moonArt(e, cls = '') { // flat moon for the phase guide and the no-3D fallback; e = elongation in degrees
  const r = 46, illum = (1 - Math.cos(e * Math.PI / 180)) / 2, waxing = e < 180, k = Math.cos(illum * Math.PI) * r;
  return `<svg viewBox="0 0 120 120" class="mn-art ${cls}" aria-hidden="true"><circle cx="60" cy="60" r="${r}" fill="#2a323d" stroke="rgba(255,255,255,.32)" stroke-width="2"/>
    <path d="M60 ${60 - r} A${r} ${r} 0 0 ${waxing ? 1 : 0} 60 ${60 + r} A${Math.abs(k).toFixed(2)} ${r} 0 0 ${(k > 0) === waxing ? 0 : 1} 60 ${60 - r}Z" fill="#f3efe6"/></svg>`;
}
function starShape(sign) {
  const S = MG.STARS[sign]; if (!S) return '';
  return `<svg class="mn-stars" viewBox="0 0 100 100" aria-hidden="true">${S.l.map(([a, b]) => `<line x1="${S.s[a][0]}" y1="${S.s[a][1]}" x2="${S.s[b][0]}" y2="${S.s[b][1]}"/>`).join('')}
    ${S.s.map(([x, y, r], i) => `<circle class="mn-sg" cx="${x}" cy="${y}" r="${r * 1.9}"/><circle class="mn-st" cx="${x}" cy="${y}" r="${r * 0.62}" style="--i:${i}"/>`).join('')}</svg>`;
}
function skyDust() { // fixed scatter of faint stars behind the moon
  let s = 7, out = ''; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) out += `<circle cx="${(rnd() * 100).toFixed(1)}" cy="${(rnd() * 100).toFixed(1)}" r="${(0.12 + rnd() * 0.28).toFixed(2)}" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
  return `<svg class="mn-dust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
}
const mnDay = d => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const mnTime = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const mnIn = d => { const n = Math.round((C.startOfDay(d) - C.startOfDay(new Date())) / 864e5); return n <= 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`; };
// Inner weather: moon light vs her energy as two meters, then Heart / Mind / Spirit as forecast tiles; the full reading opens under a tile.
// After the practice: how real did it feel? Five moons from new to full, the last 7 nights as a strip, and a tip for tonight.
const MANI_E = [0, 0, 45, 90, 125, 180];
const MANI_TIP = [
  ['Far away', 'That is normal at the start. Tonight try it as you fall asleep, when your body is heavy and your mind is soft.'],
  ['A glimpse', 'Shrink the scene: one moment, one sentence, one touch. Small and vivid beats big and blurry.'],
  ['Getting closer', 'Stay in it a little longer and notice one detail you have not seen before.'],
  ['Almost real', 'Lovely. Carry that feeling into one small thing you do tomorrow.'],
  ['Felt real', 'Now let it be, the way you do not dig up a seed to check on it. Return to the feeling, not the how.'],
];
// How real it felt, 1 to 5: a ring that fills from the centre.
const feelDot = x => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.2"/><circle cx="12" cy="12" r="${(1.6 + x * 1.8).toFixed(1)}" fill="currentColor" fill-opacity="${(.35 + x * .13).toFixed(2)}"/></svg>`;
function maniFeel() {
  const F = state.maniFeel || {}, t = todayISO(), v = F[t] || 0;
  const days = Array.from({ length: 7 }, (_, i) => C.addDays(new Date(), i - 6)), n = days.filter(d => F[C.iso(d)]).length;
  return `<div class="mf"><div class="mf-h"><b>How real did it feel?</b><small>tap a circle</small></div>
    <div class="mf-moons">${[1, 2, 3, 4, 5].map(x => `<button class="${x === v ? 'on' : ''}" data-action="maniFeel" data-v="${x}" aria-label="${MANI_TIP[x - 1][0]}">${feelDot(x)}</button>`).join('')}</div>
    ${v ? `<p class="mf-tip"><b>${MANI_TIP[v - 1][0]}.</b> ${MANI_TIP[v - 1][1]}</p>` : ''}
    <div class="mf-week">${days.map(d => { const r = F[C.iso(d)]; return `<span class="${C.iso(d) === t ? 'now' : ''}">${r ? feelDot(r) : '<i></i>'}<small>${fmt(d, { weekday: 'narrow' })}</small></span>`; }).join('')}
      <em><b class="dotnum">${n}</b>of 7 nights</em></div></div>`;
}
function innerWeather(mn, pg, phase, inner, ms, feel) {
  const plain = MG.MOON_PLAIN[pg.k] || MG.MOON_PLAIN.new, open = ui.wxOpen, learn = open === 'learn';
  const T = [['heart', 'Heart', pg.heart, inner && inner.heart], ['mind', 'Mind', pg.mind, inner && inner.mind], ['star', 'Spirit', pg.spirit, inner && inner.spirit]];
  const cur = T.find(t => t[0] === open);
  return `<section class="card mn-weather wx2">
    <button class="wx2-head" data-action="wxOpen" data-v="learn" aria-expanded="${learn}">
      <span class="wx2-moon">${moonArt(mn.elong)}</span>
      <span class="wx2-t"><small>Tonight’s moon · ${pg.theme}</small><b>${pg.name}</b><em>${plain[0]}</em></span>
      <span class="wx2-q">${learn ? icon('chevD', 16) : '?'}</span></button>
    ${learn ? `<div class="wx2-learn">
      <div class="wx2-cycle">${MG.PHASE_GUIDE.map(g => `<span class="${g.k === pg.k ? 'on' : ''}"><i>${moonArt((g.at[0] + g.at[1]) / 2)}</i><small>${g.theme}</small></span>`).join('')}</div>
      <div class="wx2-words">${MG.MOON_WORDS.map(([w, m]) => `<span><b>${w}</b> ${m}</span>`).join('')}</div>
      <p>The moon takes 29.5 days to go from dark to full and back. Many traditions use each stage as a mood for the month: begin at the new moon, act while it grows, let go while it shrinks.</p>
      <a class="link" href="#/moon">The full moon guide ${icon('chevR', 12)}</a></div>` : ''}
    <div class="wx2-do">
      <div><span class="wx2-ic moon">${icon('moon', 15)}</span><span><small>The moon says</small><b>${plain[1][0]}</b><em>${plain[1][1]}</em></span>${saveBtn(regTip(`moon-${pg.k}`, `${pg.name} · moon`, [`${pg.theme} with the moon`, plain[1][0], plain[1][1], 'Tonight'], 'moon'))}</div>
      ${phase ? `<div><span class="wx2-ic body">${icon('heart', 15)}</span><span><small>Your body says · ${inner.name}</small><b>${MG.BODY_DO[phase]}</b></span></div>` : ''}
    </div>
    ${inner ? `<p class="wx2-blend">${MG.innerBlend(mn.waxing, phase)}</p>` : ''}
    <div class="wx2-tabs">${T.map(([ic, t]) => `<button class="${open === ic ? 'on' : ''}" data-action="wxOpen" data-v="${ic}" aria-expanded="${open === ic}">${icon(ic, 14)} ${t}</button>`).join('')}</div>
    ${cur ? `<div class="wx-more"><div class="wx-r"><span class="wx-tag moon">${icon('moon', 12)} Moon</span><p>${cur[2]}</p></div>${cur[3] ? `<div class="wx-r"><span class="wx-tag body">${icon('heart', 12)} You</span><p>${cur[3]}</p></div>` : ''}</div>` : ''}
  </section>`;
}
// Manifest: Neville Goddard's way of living the wish as a feeling, picked for her cycle phase. Steps as a graphic, how-to behind a tap.
const MANI_TECH = ['scene', 'end', 'talk', 'feeling', 'revision', 'sats', 'lullaby'];
// practices that suit any day of the cycle, with how long they take
const MANI_ANY = [['talk', '1 min, anytime'], ['feeling', '3 min'], ['lullaby', 'As you fall asleep']];
// why each practice suits that phase, in two short lines: what her body gives her, and when to do it
const MANI_FIT = { menstrual: ['You sink into rest easily', 'As you fall asleep'], follicular: ['Fresh, new energy', 'In the morning'], ovulatory: ['Easy to speak and act', 'All through the day'], luteal: ['You see what to change', 'Before sleep'] };
const MANI_WHY = { scene: 'Picture one small moment that proves it is real.', end: 'Act and feel as if it already happened.', talk: 'Catch the inner chat and rewrite it kindly.', feeling: 'Stay with the feeling, let go of the how.', revision: 'At night, replay a hard moment the way you wished.', lullaby: 'Repeat a few soft words that mean it is done.', sats: 'Play your scene as you drift off to sleep.' };
const MANI_ART = {
  scene: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M6 16l4-5 3 3 2-2 3 4"/><circle cx="16" cy="9" r="1.4"/>',
  end: '<path d="M6 21V4"/><path d="M6 4h11l-2 4 2 4H6"/>',
  talk: '<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4a3 3 0 0 1-2-3z"/><path d="M8 9h8M8 12h5"/>',
  feeling: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  revision: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/>',
  lullaby: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  sats: '<path d="M3 11c3 4.5 15 4.5 18 0"/><path d="M6 14.5l-1.5 2M10 16l-.5 2.5M14 16l.5 2.5M18 14.5l1.5 2"/>',
};
const maniArt = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MANI_ART[k]}</svg>`;
// The teaching behind the page: Neville Goddard's idea in four steps, in our own words (never quoted),
// framed as a spiritual practice. The step her phase leans on is lit in her phase colour.
const MANI_IDEA = [
  ['spark', 'Imagine', 'See the wish as already done, in one small scene.', 'follicular'],
  ['heart', 'Feel', 'The feeling makes it real to you, the words alone do not.', 'ovulatory'],
  ['moon', 'Sleep on it', 'The mood you drift off in sinks in the deepest.', 'menstrual'],
  ['clock', 'Persist', 'Come back to the feeling until it feels normal.', 'luteal'],
];
// Neville Goddard's signs that the feeling has settled, and his idea of letting the route appear (in our own words)
const MANI_SIGN = [['heart', 'Relief', 'The wanting softens into a quiet thank you.'], ['leaf', 'Normal', 'It feels like an old fact, not a big event.'], ['check', 'No checking', 'You stop looking for proof. You just expect it.']];
function maniLanded() {
  return `<section class="mfl">
    <div class="mfl-s">${MANI_SIGN.map(([ic, t, d]) => `<div class="mfl-t"><span>${icon(ic, 17)}</span><b>${t}</b><small>${d}</small></div>`).join('')}</div>
    <div class="mfl-path"><div class="mfl-line" aria-hidden="true"><i></i><i></i><i></i><i></i><span>${icon('star', 15)}</span></div>
      <div><b>Then let the how come</b><small>You don’t plan the route. Small events line up one by one, and you follow the ones that feel right.</small></div></div>
    <details class="mfl-more"><summary>Read more ${icon('chevD', 13)}</summary>
      <p>Goddard said a wish is settled when you no longer feel the need to wish for it. The hunger turns into calm, the way you stop thinking about dinner once you have eaten.</p>
      <p>If you catch yourself checking or doubting, don’t fight it. Go back to your scene tonight and rest in it again until it feels ordinary.</p>
      <p>He called the path that follows a bridge of small events: a call, a chance meeting, an idea in the shower. Your part is to notice them and take the next step.</p></details>
  </section>`;
}
function maniIdea(phase) {
  return `<section class="mfi">
    <div class="mfi-flow">${MANI_IDEA.map(([ic, t, d, p], i) => `<div class="mfi-s ${p === phase ? 'now' : ''}" style="--c:${PH_HEX[p]}">
      <span class="mfi-ic">${icon(ic, 18)}</span><div><b><em class="dotnum">${i + 1}</em>${t}${p === phase ? '<i>your phase</i>' : ''}</b><small>${d}</small></div></div>`).join('')}</div>
    <p class="mfi-by">From the teaching of <b>Neville Goddard</b> (1905 to 1972), shared in his short 1944 book on feeling, told here in our own words.</p>
    <details class="mfi-more"><summary>Read the idea ${icon('chevD', 13)}</summary>
      <p>Goddard taught that your inner life comes first. What you keep feeling to be true about yourself slowly shapes how you act, what you notice and what you go after.</p>
      <p>So instead of asking or hoping, you quietly take on the feeling of already having it. Not by force: you rest in it, the way you relax into a warm bath.</p>
      <p>He saw the drowsy state before sleep as the easiest door, because the busy mind is quiet and the last feeling of the day stays with you through the night.</p>
      <p>Your cycle changes how easy each step feels. Imagining comes easily in the fresh follicular days, feeling is strongest around ovulation, the drowsy moment is natural on your period, and the luteal phase is for staying with it.</p>
      <p class="mfi-note">A spiritual practice for reflection and calm, not a science. It works alongside action, never instead of it.</p></details>
  </section>`;
}
// Build your scene: one short moment that could only happen after the wish came true,
// with a place, a person, a line they say and something you feel or touch (after Neville Goddard's teaching)
const SCENE_F = [['place', 'pin', 'Where are you?', 'In my own bright studio'], ['who', 'users', 'Who is with you?', 'My best friend'], ['line', 'lips', 'What do they say?', 'I knew you would do it'], ['touch', 'hand', 'What do you feel?', 'Her hug, warm and tight']];
function sceneLine(S) {
  const t = x => esc((S[x] || '').trim().replace(/[.!“”"]+$/g, '').replace(/^[“"]/, '')), p = t('place'), w = t('who'), l = t('line'), h = t('touch');
  if (!p && !w && !l && !h) return '<span class="msb-empty">Your scene appears here as you fill the four frames.</span>';
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  return [p && `<b>${cap(p)}</b>.`, (w || l) && `${w ? `<b>${cap(w)}</b>` : 'Someone'} ${l ? `says <b>“${cap(l)}.”</b>` : 'is there with you.'}`, h && `I feel <b>${h.charAt(0).toLowerCase() + h.slice(1)}</b>.`].filter(Boolean).join(' ');
}
function sceneBuilder() {
  const S = state.maniScene || {}, n = SCENE_F.filter(([k]) => (S[k] || '').trim()).length;
  return `<section class="card msb">
    <div class="msb-h"><div><small>Your scene</small><h3>One moment, after it came true</h3></div><b class="msb-n"><span class="dotnum">${n}</span>/4</b></div>
    <div class="msb-film">${SCENE_F.map(([k, ic, q, ph], i) => `<label class="msb-f ${(S[k] || '').trim() ? 'on' : ''}" style="--i:${i}"><span class="msb-ic">${icon(ic, 16)}</span><small>${q}</small><input class="msb-in" data-input="scene.${k}" value="${esc(S[k] || '')}" placeholder="${ph}" maxlength="60" autocomplete="off"></label>`).join('')}</div>
    <div class="msb-play"><span class="msb-loop" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/></svg></span><p class="msb-line">${sceneLine(S)}</p></div>
    <p class="msb-how">Close your eyes, play it as if you are there, and replay it until it feels normal. Then let sleep take it.</p>
    <details class="msb-more"><summary>Why a tiny scene works ${icon('chevD', 13)}</summary>
      <div class="msb-why">${[['spark', 'It implies the end', 'Pick a moment that could only happen after the wish came true, like a friend congratulating you.'], ['hand', 'Touch and sound make it real', 'A hug, a handshake, a voice you know. The body believes what it feels more than what it reads.'], ['clock', 'A few seconds, on loop', 'Short enough to replay in five seconds. Repeat it until it stops feeling new.'], ['moon', 'Same scene each night', 'Keep it until it feels like a memory. Change it only when the wish itself changes.']].map(([ic, t, d]) => `<div><span>${icon(ic, 14)}</span><p><b>${t}</b>${d}</p></div>`).join('')}</div>
      <p class="mm-src">After Neville Goddard’s teaching, in our own words. A spiritual practice for reflection.</p></details>
  </section>`;
}
function viewManifest() {
  const phase = M.info && M.info.phase, cy = phase && MG.MANIFEST_CYCLE[phase], mk = cy ? cy[0] : 'feeling';
  const k = MANI_TECH.includes(ui.maniK) ? ui.maniK : mk, T = MG.MANIFEST[k], scene = (state.manifest || {})[todayISO()] || '';
  return `${topbar('Manifest', { back: true })}
  <div class="pad mn mfp">
    <section class="mfp-hero"><img src="images/forest-calm.jpg" alt="" decoding="async"><span class="mfp-shade"></span>
      <span class="mfp-t"><small>${k === mk && phase ? `For your ${PHASES[phase].name.toLowerCase()} phase` : 'Today’s practice'}</small><b>${T.name}</b><em>${k === mk && cy ? cy[1] : MANI_WHY[k]}</em></span></section>
    <section class="card mn-mani">
      <ol class="mm-flow">${T.short.map((x, i) => `<li style="--i:${i}"><span>${i + 1}</span><b>${x}</b></li>`).join('')}</ol>
      ${maniFeel()}
      <details class="mm-more"><summary>Show me how ${icon('chevR', 14)}</summary>
        <ol class="mm-steps">${T.steps.map(x => `<li>${x}</li>`).join('')}</ol>
        <p class="mm-src">After Neville Goddard’s teaching in <i>Feeling is the Secret</i>: live the wish first as a feeling. A spiritual practice for reflection.</p></details></section>
    ${sceneBuilder()}
    ${sectionTitle('Your month of manifesting')}
    <div class="mfm">${PHASE_ORDER.map(p => { const t = MG.MANIFEST_CYCLE[p][0], [fit, when] = MANI_FIT[p]; return `<button class="mfm-p ${p === phase ? 'now' : ''} ${t === k ? 'on' : ''}" style="--c:${PH_HEX[p]}" data-action="maniK" data-v="${t}">
      <span class="mfm-h"><i></i>${PHASES[p].name}${p === phase ? '<em>Now</em>' : ''}</span>
      <span class="mfm-r"><span class="mfm-a">${maniArt(t)}</span><b>${MG.MANIFEST[t].name}</b></span>
      <small>${fit}</small><span class="mfm-w">${icon('clock', 11)}${when}</span></button>`; }).join('')}</div>
    ${sectionTitle('Any day of your cycle')}
    <div class="mfa" role="list">${MANI_ANY.map(([o, t]) => `<button class="mfa-c ${o === k ? 'on' : ''}" role="listitem" data-action="maniK" data-v="${o}"><span class="mfa-a">${maniArt(o)}</span><b>${MG.MANIFEST[o].name}</b><small>${MANI_WHY[o]}</small><em>${icon('clock', 12)} ${t}</em><span class="mfa-go">${o === k ? 'On top now' : `Try it ${icon('chevR', 12)}`}</span></button>`).join('')}</div>
    ${sectionTitle('How you know it landed')}
    ${maniLanded()}
    ${sectionTitle('The idea behind it')}
    ${maniIdea(phase)}
  </div>`;
}
function viewMoon() { return `<div class="pad mn">${moonPage(false)}</div>`; }
// the moon and her readings in one flow: full page at #/moon, and below the calendar (embed)
function moonPage(embed) {
  const mn = moonData(), pg = MG.phaseGuideAt(mn.elong), ms = signOfK(mn.sign), phase = M.info && M.info.phase, inner = phase && MG.INNER_SEASON[phase];
  const inward = !phase || phase === 'menstrual' || phase === 'luteal', feel = MG.MOON_SIGN_FEEL[mn.sign];
  const c = birthChart(state.profile), tr = c && AS.transits(c), natal = c && c.planets[1], ord = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th');
  const ret = natal && AS.moonInSign(natal.sign);
  const events = [['New moon', mn.nextNew, 'new'], ['Full moon', mn.nextFull, 'full']].filter(x => x[1]).sort((a, b) => a[1] - b[1]);
  // rituals: intentions at the new moon, release at the full moon; the tab follows whichever is nearer
  const notes = state.moonNotes || [], lastNew = notes.filter(n => n.type === 'new').at(-1), lastFull = notes.filter(n => n.type === 'full').at(-1);
  const nearNew = mn.elong >= 337.5 || mn.elong < 30, nearFull = mn.elong >= 150 && mn.elong < 210;
  const cur = lastNew && mn.lastNew && new Date(lastNew.date + 'T12:00') >= new Date(mn.lastNew - 7 * 864e5); // set for this moon month
  const rit = ui.moonRit || (nearFull ? 'full' : nearNew ? 'new' : events[0][2]);
  const draft = ui.moonDraft || (ui.moonDraft = {}), tj = (state.moonJournal || {})[todayISO()] || '';
  const ritEvent = rit === 'new' ? (nearNew ? null : mn.nextNew) : (nearFull ? null : mn.nextFull);
  const ritLead = rit === 'new'
    ? (nearNew ? 'The new moon is here. Name up to three things you want to grow this month.' : `The next new moon is ${mnDay(mn.nextNew)}. Write your intentions now or on the night.`)
    : (nearFull ? 'The full moon is here. Write what you are ready to let go of, then release it.' : `The next full moon is ${mnDay(mn.nextFull)}. Note what feels heavy so you can release it then.`);
  return `<section class="mn-hero ${embed ? 'emb' : ''}">${skyDust()}
      ${embed ? '' : `<button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>`}
      <div class="mn-top"><small>The Moon tonight</small><b>${pg.theme}</b></div>
      <div class="mn-orb">${moonArt(mn.elong, 'mn-flat')}<canvas class="moon3d" data-e="${mn.elong.toFixed(1)}" aria-label="The Moon as it looks tonight, ${Math.round(mn.illum * 100)} percent lit. Drag to turn it."></canvas></div>
      <div class="mn-side l"><small>Moon day</small><b class="num">${Math.floor(mn.age) + 1}</b></div>
      <div class="mn-side r"><small>Lit</small><b class="num">${Math.round(mn.illum * 100)}%</b></div>
      <div class="mn-name"><h1>${pg.name}</h1><p>${pg.theme} · ${mn.waxing ? 'waxing, growing brighter' : 'waning, growing darker'}</p></div>
      <div class="mn-next">${events.map(([n, d, k]) => `<div class="mn-ev ${k}"><i>${moonArt(k === 'new' ? 0 : 180)}</i><span><small>${n}</small><b>${mnDay(d)}</b><small>${mnIn(d)} · ${mnTime(d)}</small></span></div>`).join('')}</div>
    </section>

    ${innerWeather(mn, pg, phase, inner, ms, feel)}

    <section class="mn-aff"><small>Say it today</small><p>“${Object.values(MG.MOON_AFFIRM)[MG.PHASE_GUIDE.indexOf(pg) % 12][inward ? 0 : 1]}”</p></section>

    ${(() => { const mk = MG.MANIFEST_MOON[pg.k] || 'feeling', cy = phase && MG.MANIFEST_CYCLE[phase], k = ui.maniK && MG.MANIFEST[ui.maniK] ? ui.maniK : mk, T = MG.MANIFEST[k], scene = (state.manifest || {})[todayISO()] || '';
      const opts = [...new Set([mk, cy && cy[0]].filter(Boolean))];
      return `<section class="card mn-mani"><div class="mm-h"><span class="mm-art" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" class="mm-o"/><path d="M24 14c-5 4-5 16 0 20 5-4 5-16 0-20z" class="mm-s"/><circle cx="24" cy="24" r="3" class="mm-c"/></svg></span><div class="mn-k"><small>Manifest tonight</small><b>${opts.length > 1 ? 'Feel the wish as done' : T.name}</b></div></div>
        ${opts.length > 1 ? `<div class="mm-pick">${opts.map(o => `<button class="${o === k ? 'on' : ''}" data-action="maniK" data-v="${o}">${o === mk ? `${icon('moon', 13)} For the moon` : `${icon('heart', 13)} For your body`}<b>${MG.MANIFEST[o].name}</b></button>`).join('')}</div>` : ''}
        <p class="mm-why">${k === mk ? T.why : cy[1]}</p>
        <ol class="mm-flow">${T.short.map((x, i) => `<li style="--i:${i}"><span>${i + 1}</span><b>${x}</b></li>`).join('')}</ol>
        ${maniFeel()}
        <details class="mm-more"><summary>Show me how ${icon('chevR', 14)}</summary>
          <ol class="mm-steps">${T.steps.map(x => `<li>${x}</li>`).join('')}</ol>
          <label class="mm-scene"><span>My scene, in the present tense</span><textarea class="field mn-ta" data-input="mani.today" rows="2" placeholder="I am… / I have… / It feels so good that…">${esc(scene)}</textarea></label>
          <p class="mm-src">After Neville Goddard’s teaching in <i>Feeling is the Secret</i>: live the wish first as a feeling. A spiritual practice for reflection.</p></details></section>`; })()}

    <section class="card mn-ask"><div class="mn-k"><small>Tonight's reflection</small><b>${pg.ask}</b></div>
      <textarea class="field mn-ta" data-input="moonj.today" rows="3" placeholder="Write freely. Only you can see this.">${esc(tj)}</textarea>
      <div class="mn-prac">${icon('spark', 16)}<p><b>One-minute practice · </b>${pg.practice}</p></div></section>

    ${sectionTitle('Moon ritual')}
    <section class="card mn-rit">
      <div class="seg mn-seg">${[['new', 'New moon · intentions'], ['full', 'Full moon · release']].map(([k, l]) => `<button class="${rit === k ? 'on' : ''}" data-action="moonRit" data-v="${k}">${l}</button>`).join('')}</div>
      <p class="mn-rl">${ritLead}</p>
      ${rit === 'full' && lastNew ? `<div class="mn-past"><small>Your intentions from ${mnDay(new Date(lastNew.date + 'T12:00'))} · halfway check</small>${lastNew.items.map((t, i) => `<button class="mn-it ${lastNew.done && lastNew.done[i] ? 'done' : ''}" data-action="moonTick" data-id="${lastNew.id}" data-i="${i}">${icon('check', 14)}<span>${esc(t)}</span></button>`).join('')}</div>` : ''}
      ${rit === 'new' && lastNew && !nearNew && cur ? `<div class="mn-past"><small>This month's intentions · set ${mnDay(new Date(lastNew.date + 'T12:00'))}</small>${lastNew.items.map((t, i) => `<button class="mn-it ${lastNew.done && lastNew.done[i] ? 'done' : ''}" data-action="moonTick" data-id="${lastNew.id}" data-i="${i}">${icon('check', 14)}<span>${esc(t)}</span></button>`).join('')}</div>` : ''}
      ${rit === 'new' && lastNew && (nearNew || !cur) ? `<div class="mn-past"><small>Last time you wished for</small>${lastNew.items.map((t, i) => `<div class="mn-it ${lastNew.done && lastNew.done[i] ? 'done' : ''}">${icon('check', 14)}<span>${esc(t)}</span></div>`).join('')}</div>` : ''}
      ${rit === 'full' && lastFull ? `<p class="mn-rel">${icon('leaf', 14)} You released ${lastFull.items.length} thing${lastFull.items.length === 1 ? '' : 's'} on ${mnDay(new Date(lastFull.date + 'T12:00'))}.</p>` : ''}
      <div class="mn-ins">${[0, 1, 2].map(i => `<input class="field" data-input="moon.i${i}" value="${esc(draft['i' + i] || '')}" placeholder="${rit === 'new' ? ['I want to feel…', 'I will make time for…', 'I am open to…'][i] : ['I let go of…', 'I no longer need…', 'I forgive…'][i]}" maxlength="90">`).join('')}</div>
      <button class="btn btn-dark btn-block" data-action="moonSave" data-t="${rit}">${rit === 'new' ? `${icon('spark', 16)} Set my intentions` : `${icon('leaf', 16)} Release it`}</button>
      ${ritEvent ? `<p class="fine center">Saved with today's date. You can come back on ${mnDay(ritEvent)} too.</p>` : ''}
    </section>

    ${sectionTitle('The 8 moon phases')}
    <div class="mn-pg">${MG.PHASE_GUIDE.map(p => `<article class="mn-pc ${p === pg ? 'on' : ''}">${moonArt((p.at[0] + p.at[1]) / 2 % 360)}<small>${p === pg ? 'Now · ' : ''}${p.theme}</small><b>${p.name}</b><p>${p.heart}</p><p class="mn-pm">${p.mind}</p></article>`).join('')}</div>

    <p class="fine center">The Moon's phase and dates are calculated on your phone from real orbits. Moon rituals and the inner seasons are traditions for reflection, not medical advice.</p>`;
}
// Full-bleed night-sky hero shared by both states of the cosmic page.
function cosmicHero(title, sub, extra = '') {
  return `<section class="mv2 cz-hero">
    <img class="mv2-bg" src="${starPhoto('sky', 1100)}" alt="" decoding="async"><span class="mv2-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <div class="mv2-eyebrow">Your cosmic rhythm</div>
    <h1 class="rh2-h">${title}</h1>
    <p class="mv2-now">${sub}</p>${extra}
  </section>`;
}

// ---------- grocery list (built from the coming week's phases) ----------
const AISLES = [
  ['Produce', /spinach|pepper|citrus|kiwi|strawberr|broccoli|berr|avocado|beet|banana|potato|kale|rocket|cucumber|tomato|pear|lemon|orange|fennel|asparagus|sprout|cauliflower|greens|radish|pumpkin|watermelon|pomegranate|apple|prune|cherr|mulberr|ginger$|^ginger|fresh ginger|cabbage|carrot|lettuce|leek|parsnip|squash|celeri|chard|onion|garlic|turnip|courgette|zucchini|mushroom|quince|plum|grape|fig|artichoke|salsify|fruit|watercress|nettle/i],
  ['Protein', /meat|salmon|sardine|egg|chicken|turkey|beef|shellfish|prawn|fish|\blamb(?!'s)|liver|venison|mussel|oyster/i],
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
  // Out of season locally? Leave it out and offer an in-season swap with the same nutrient.
  const m = new Date().getMonth() + 1, table = SZ.yearTable(myCountry()), nowSeason = SZ.seasonal(myCountry(), m);
  const ALIAS = { berries: /berr/i, 'leafy greens': /kale|spinach|chard|greens|lettuce/i, citrus: /citrus|orange|lemon|mandarin/i };
  const seasonOf = n => { const re = ALIAS[n]; const hits = table.filter(t => re ? re.test(t.f) : t.f.toLowerCase() === n); return hits.length ? hits.some(t => t.months.includes(m)) : null; };
  const swaps = [];
  for (const k of Object.keys(items)) {
    if (seasonOf(k) !== false) continue;
    const it = items[k], alt = nowSeason.find(i => i.nut.some(n => n.toLowerCase() === it.why.toLowerCase()) && !items[i.f.toLowerCase()]);
    swaps.push({ out: it.name, alt: alt ? alt.f : '', why: it.why });
    if (alt) items[alt.f.toLowerCase()] = { name: alt.f, phases: it.phases, why: `${it.why} · in season` };
    delete items[k];
  }
  // a general name next to a specific one (berries next to blueberries) is the same shopping
  const GENERIC = { berries: /berr/i, beans: /black beans|kidney beans/i, yoghurt: /greek yoghurt/i, 'leafy greens': /spinach|kale|chard/i, 'wild fish': /salmon|sardine|mackerel/i };
  for (const [g, re] of Object.entries(GENERIC)) if (items[g] && Object.keys(items).some(k => k !== g && re.test(k))) { const keep = Object.keys(items).find(k => k !== g && re.test(k)); items[g].phases.forEach(p => { if (!items[keep].phases.includes(p)) items[keep].phases.push(p); }); delete items[g]; }
  groceryItems.swaps = swaps;
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
  // meat and organs come right after what's in season
  const AISLE_FIRST = ['In season now', 'Protein'], rank = a => { const i = AISLE_FIRST.indexOf(a); return i < 0 ? 9 : i; };
  const phases = weekPhases(), groups = groceryItems().map((g, i) => [g, i]).sort((x, y) => rank(x[0][0]) - rank(y[0][0]) || x[1] - y[1]).map(x => x[0]), swaps = groceryItems.swaps || [], got = state.grocery || {};
  const flat = groups.flatMap(([, l]) => l), total = flat.length, done = flat.filter(i => got[i.name.toLowerCase()]).length;
  const ring = (pct, r, w) => { const C0 = 2 * Math.PI * r; return `<circle cx="${r + w}" cy="${r + w}" r="${r}" class="gr-bg" stroke-width="${w}"/>${pct > 0 ? '' : '<!--'}<circle cx="${r + w}" cy="${r + w}" r="${r}" class="gr-fg" stroke-width="${w}" stroke-dasharray="${(pct * C0).toFixed(1)} ${C0.toFixed(1)}" transform="rotate(-90 ${r + w} ${r + w})"/>${pct > 0 ? '' : '-->'}`; };
  // nutrients this week's basket covers, each with how much of it is ticked
  const nut = {};
  for (const it of flat) { const n = it.why.replace(/ · in season$/, ''); if (/^in season/i.test(n)) continue; (nut[n] = nut[n] || []).push(it); }
  const nuts = Object.entries(nut).sort((x, y) => y[1].length - x[1].length).slice(0, 8);
  const warm = M.info && warmWindow(M.info) || phases.includes('menstrual');
  const aisle = groups.some(([a]) => a === ui.groAisle) ? ui.groAisle : (groups[0] || [''])[0];
  return `${topbar('Grocery list', { back: true })}
  <div class="pad">
    <h1 class="page-h">This week’s <span>basket</span></h1>
    <p class="muted">Built from what your next 7 days need: ${phases.map(p => `<b class="phase-inline" style="--c:${PHASE_COLOR.dark[p]}">${PHASES[p].name}</b>`).join(' then ')}.</p>
    <section class="card glass gro-score">
      <div class="gs-ring"><svg viewBox="0 0 124 124">${ring(total ? done / total : 0, 54, 8)}</svg><div><b>${done}</b><small>of ${total}</small></div></div>
      <div class="gs-t"><div class="eyebrow">In the basket</div><p>${done === total && total ? 'All done. Your week is stocked.' : done ? `${total - done} to go. Tick them off as you shop.` : 'Tick foods off as you shop. Each nutrient ring fills up.'}</p>
        ${done ? '<button class="link" data-action="groClear">Clear ticks</button>' : ''}</div>
    </section>
    <div class="gro-nuts">${nuts.map(([n, l]) => { const d = l.filter(i => got[i.name.toLowerCase()]).length; return `<div class="gn ${d === l.length ? 'full' : ''}"><svg viewBox="0 0 64 64">${ring(d / l.length, 27, 5)}</svg><b>${d}/${l.length}</b><small>${n}</small></div>`; }).join('')}</div>
    ${warm ? `<p class="gro-warm">${icon('sun', 14)} Your period falls in this week: cook the produce and stew the fruit on those days.</p>` : ''}
    ${sectionTitle('Your list')}
    <div class="tea-tabs gro-tabs">${groups.map(([a, l]) => { const d = l.filter(i => got[i.name.toLowerCase()]).length; return `<button class="${a === aisle ? 'on' : ''} ${d === l.length ? 'full' : ''}" data-action="groAisle" data-v="${esc(a)}">${a} <i>${d}/${l.length}</i></button>`; }).join('')}</div>
    ${groups.filter(([a]) => a === aisle).map(([, list]) => `
      <section class="card glass">${list.map(it => { const k = it.name.toLowerCase(), ph = foodPhoto(it.name, 120); return `<button class="check-row gro ${got[k] ? 'on' : ''}" data-action="groToggle" data-k="${esc(k)}">
        <span class="cb">${icon('check', 14, 2.2)}</span>${ph ? `<img class="gro-img" src="${ph}" alt="" loading="lazy">` : ''}<span class="gro-n">${esc(it.name)}<small>${it.why}</small></span>
        <span class="gro-ph">${it.phases.map(p => `<i style="background:${PHASE_COLOR.dark[p]}" title="${PHASES[p].name}"></i>`).join('')}</span></button>`; }).join('')}</section>`).join('')}
    ${swaps.length ? `${sectionTitle('Swapped for the season')}<section class="card glass gro-swap">${swaps.map(x => `<div><s>${x.out}</s>${icon('chevR', 12)}<b>${x.alt || 'skip this week'}</b><small>${x.why}</small></div>`).join('')}
      <p class="fine" style="margin:8px 0 0">Not in season where you live this month, so swapped for a local food with the same nutrient.</p></section>` : ''}
    <section class="card glass gro-share"><div><b>Shopping with someone?</b><small>Send the list as text</small></div><button class="pill-cta" data-action="groShare">${icon('download', 15)} Share list</button></section>
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
const REM_DEFAULT = { period: true, periodDays: 2, phase: true, cycle: true, rhythm: true, checkin: true, checkinHour: 20, calm: true, calmHour: 18, dismissed: {}, fired: {} };
const hr12 = h => `${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`;
// How stressed she is today: 2 = she logged stress, 1 = a high-stress part of her cycle, 0 = calm
const STRESS_MOODS = ['Stressed', 'Anxious', 'Irritable', 'Angry', 'Overwhelmed'];
function stressToday(info) {
  const l = state.logs[todayISO()] || {};
  if ((l.moods || []).some(m => STRESS_MOODS.includes(m)) || (l.disrupt || []).some(x => ['Big stress', 'Shock or loss'].includes(x))) return 2;
  return info && CALM[dayWindow(info)][0] === 3 ? 1 : 0;
}
function rem() { return state.reminders = { ...REM_DEFAULT, dismissed: {}, fired: {}, ...(state.reminders || {}) }; }
function dueReminders() {
  if (!M || !M.info) return [];
  const r = rem(), info = M.info, today = todayISO(), out = [];
  if (r.period) {
    if (info.late) out.push({ id: 'late', icon: 'drop', title: `Period ${plural(info.late, 'day')} late`, body: `Stress, travel and sleep can shift your cycle. Log your period when it arrives${ttc() ? ', and take a test if you might be pregnant' : ''}.` });
    else if (info.dueToday) out.push({ id: 'due', icon: 'drop', title: 'Period expected today', body: 'Keep warm, have supplies ready and plan a softer day.' });
    else if (!info.isPeriod && info.daysToPeriod <= r.periodDays) out.push({ id: 'period', icon: 'drop', title: `Period in ${plural(info.daysToPeriod, 'day')}`, body: 'Pack supplies, stock up on iron-rich food and ginger tea, and keep your calendar light.' });
  }
  if (r.phase) {
    const y = C.dayInfo(C.addDays(new Date(), -1), M.stats);
    if (y && y.phase !== info.phase) out.push({ id: 'phase-' + info.phase, icon: 'spark', title: `Welcome to your ${PHASES[info.phase].name} phase`, body: `${PHASES[info.phase].tagline} Focus: ${NUTRITION[info.phase].focus}` });
  }
  if (r.rhythm) {
    const t = sunToday(), now = new Date(), done = doneToday(), h = 36e5;
    const win = (a, b) => a && b && now >= a && now <= b;
    if (t.rise && win(t.rise, new Date(t.rise.getTime() + 2.5 * h)) && !done.includes('light')) out.push({ id: 'rh-light', icon: 'sun', title: 'Good morning: go see the light', body: '10 minutes of daylight now sets your inner clock for better sleep tonight.', to: 'rhythm' });
    if (win(new Date(t.noon.getTime() - h), new Date(t.noon.getTime() + 1.5 * h)) && !done.includes('sun')) out.push({ id: 'rh-sun', icon: 'sun', title: 'The sun is high', body: 'A few minutes of sun on your skin for vitamin D and a brighter mood.', to: 'rhythm' });
    if (t.set && win(new Date(t.set.getTime() - .5 * h), new Date(t.set.getTime() + 1.5 * h)) && !done.includes('dusk')) out.push({ id: 'rh-dusk', icon: 'moon', title: 'The sun is setting', body: 'Time to slow down. Dim the lights and put screens away.', to: 'rhythm' });
    if (t.set && now >= new Date(t.set.getTime() + 3.5 * h) && now.getHours() >= 20 && !done.includes('sleep')) out.push({ id: 'rh-sleep', icon: 'moon', title: 'Your body is getting sleepy', body: 'Go to bed when you feel tired. Tomorrow, wake without an alarm.', to: 'rhythm' });
  }
  if (r.cycle) { // small nudges timed to the cycle
    const tm = C.dayInfo(C.addDays(new Date(), 1), M.stats), w = dayWindow(info), hNow = new Date().getHours();
    if (!info.isPeriod && info.daysToPeriod === 3) out.push({ id: 'cy-mag', icon: 'spark', title: 'Magnesium from today', body: '3 days to your period. Magnesium in the evening can ease cramps, bloating and PMS.', to: 'relief' });
    if (tm && !warmWindow(info) && warmWindow(tm)) out.push({ id: 'cy-warm', icon: 'bowl', title: 'Warm food from tomorrow', body: 'No raw or cold food until your period ends. Plan a soup or stew and keep ginger at home.', to: 'plan' });
    if ((w === 'premenstrual' || w === 'flow-start') && hNow >= 19) out.push({ id: 'cy-sleep', icon: 'moon', title: 'An early night tonight', body: 'Your hormones are low now. Extra sleep helps mood and cramps.' });
    if (w === 'flow-end' && info.cd === info.P) out.push({ id: 'cy-iron', icon: 'drop', title: 'Rebuild your iron', body: 'Red meat or liver with peppers or citrus today. Nettle tea between meals.', to: 'tea' });
    if (info.daysToOv === 1) out.push({ id: 'cy-ov', icon: 'sun', title: 'High-energy days start tomorrow', body: 'Energy often peaks around ovulation. A nice time for a harder workout or a night out, if you feel like it.' });
    events().filter(e => e.date === C.iso(C.addDays(new Date(), 1))).forEach(e => { const x = evInfo(e); out.push({ id: 'ev-' + e.id, icon: 'calendar', title: `Tomorrow: ${evName(e)}`, body: x ? x.prep : 'Get ready tonight.', to: 'calendar' }); });
  }
  // daily calm: once a day at her hour, or right away when she logs stress; quiet once she has breathed today
  if (r.calm && !(state.breathLog || {})[today]) {
    const st = stressToday(info);
    if (st === 2) out.push({ id: 'calm-now', icon: 'leaf', title: 'Stressed? Breathe with me for 3 minutes', body: 'You logged stress today. Breathing out longer than in calms your nervous system within minutes.', to: 'breathe/stress' });
    else if (new Date().getHours() >= r.calmHour) out.push({ id: 'calm-daily', icon: 'leaf', title: st ? 'A high-stress day in your cycle' : 'Your 10 minutes of calm', body: st ? 'Your body is under more strain today. Ten slow minutes now lowers cortisol before bed.' : 'Sit, breathe slowly and let the day settle. Ten minutes is enough.', to: 'breathe/stress' });
  }
  if (r.checkin && !state.logs[today] && new Date().getHours() >= r.checkinHour) {
    out.push({ id: 'checkin', icon: 'heart', title: 'How are you feeling today?', body: 'A 10-second check-in helps Underskin learn your patterns.', to: 'log' });
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
    <div class="bn-t" ${x.to ? `data-action="nav" data-to="${x.to}"` : ''}><b>${esc(x.title)}</b><p>${esc(x.body)}</p></div>
    <button class="bn-x" data-action="dismissRem" data-id="${x.id}" aria-label="Dismiss">${icon('close', 16)}</button></section>`).join('');
}
function remindersSection() {
  const r = rem(), perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const tg = (k, label, sub) => `<div class="stepper-row"><span>${label}<small>${sub}</small></span><button class="toggle ${r[k] ? 'on' : ''}" data-action="remToggle" data-k="${k}" role="switch" aria-checked="${!!r[k]}" aria-label="${label}"><i></i></button></div>`;
  const hr = hr12;
  return `${sectionTitle('Reminders')}
    <section class="card glass">
      ${tg('period', 'Period coming', 'A heads-up before it starts')}
      ${r.period ? `<div class="stepper-row sub"><span>Days before</span>${stepper('periodDays', r.periodDays, 'rem')}</div>` : ''}
      ${tg('phase', 'New phase', 'When your hormones shift')}
      ${tg('cycle', 'Cycle tips', 'Magnesium before your period, warm food, early nights, plans coming up')}
      ${tg('calm', 'Daily calm', 'Meditation every day, right away when you log stress')}
      ${r.calm ? `<div class="stepper-row sub"><span>Every day at</span><div class="stepper"><button data-action="remCalmHour" data-d="-1">−</button><span class="num">${hr(r.calmHour)}</span><button data-action="remCalmHour" data-d="1">+</button></div></div>` : ''}
      ${tg('checkin', 'Daily check-in', 'If you haven’t logged yet')}
      ${r.checkin ? `<div class="stepper-row sub"><span>From</span><div class="stepper"><button data-action="remHour" data-d="-1">−</button><span class="num">${hr(r.checkinHour)}</span><button data-action="remHour" data-d="1">+</button></div></div>` : ''}
      ${perm === 'granted' ? `<p class="fine" style="margin:8px 0 0">${icon('check', 13)} Phone notifications on</p>`
        : perm === 'denied' ? '<p class="fine" style="margin:8px 0 0">Notifications are blocked in your browser settings. Reminders show inside the app.</p>'
        : perm === 'unsupported' ? '<p class="fine" style="margin:8px 0 0">Reminders show inside the app. Add Underskin to your home screen for notifications.</p>'
        : `<button class="btn btn-light btn-block" data-action="remPermission">${icon('spark', 16)} Turn on notifications</button>`}
    </section>`;
}

// ---------- relief guide ----------
const MOOD_TO_RELIEF = { Irritable: 'PMS mood', Anxious: 'PMS mood', Sad: 'PMS mood', Stressed: 'PMS mood', Angry: 'PMS mood', 'Low mood': 'PMS mood', 'Mood swings': 'PMS mood', Tearful: 'PMS mood' };
function reliefKey(sym) { return RELIEF[sym] ? sym : MOOD_TO_RELIEF[sym] || null; }
// What often bothers women in each part of the cycle (shown first, after anything she logged).
const RELIEF_WINDOW = { 'flow-start': ['Cramps', 'Fatigue', 'Headache'], 'flow-end': ['Fatigue', 'Cramps'], rising: [], building: [], peak: ['Ovulation pain', 'Bloating'], settle: ['Bloating', 'Tender breasts'], focus: ['Tender breasts', 'Insomnia', 'Acne'], premenstrual: ['PMS mood', 'Bloating', 'Headache'] };
// Drawn line icon for each relief topic (no emoji).
const RELIEF_IC = { 'Face fascia': 'hand', 'Ovulation pain': 'seed', Cramps: 'thermo', 'PMS mood': 'sun', Bloating: 'cup', Insomnia: 'moon', Acne: 'spark', Headache: 'mind', Fatigue: 'bolt', 'Tender breasts': 'heart' };
const reliefIc = (k, size = 20) => icon(RELIEF_IC[k] || 'leaf', size);
const RELIEF_EMOJI = { 'Face fascia': '💆‍♀️', 'Ovulation pain': '🥚', Cramps: '🌀', 'PMS mood': '🌧️', Bloating: '🎈', Insomnia: '🌙', Acne: '🫧', Headache: '🤕', Fatigue: '🪫', 'Tender breasts': '💗' };
function viewReliefIndex() {
  const recent = new Set();
  for (let i = 0; i < 4; i++) { const l = getLog(C.iso(C.addDays(new Date(), -i))); [...(l.symptoms || []), ...(l.moods || [])].forEach(s => { const k = reliefKey(s); if (k) recent.add(k); }); }
  const keys = Object.keys(RELIEF).sort((a, b) => recent.has(b) - recent.has(a));
  const info = M.info, w = info && dayWindow(info);
  const likely = [...new Set([...recent, ...(w ? RELIEF_WINDOW[w] : [])])].filter(k => RELIEF[k]).slice(0, 3);
  const row = k => { const st = RELIEF[k].steps[0], L = RELIEF_LINKS[k] || {};
    return `<button class="rl-row" data-action="nav" data-to="relief/${encodeURIComponent(k)}"><span class="rl-rg">${reliefIc(k, 18)}</span><span class="rl-rt"><b>${k}${recent.has(k) ? ' <i>logged</i>' : ''}</b><small>Start with: ${st.t.charAt(0).toLowerCase() + st.t.slice(1)}</small></span>${evBadge(st.ev)}${icon('chevR', 15)}</button>`; };
  const today = info ? `<section class="card card-light rl-today"><small>${recent.size ? 'For what you logged' : 'Common around now'} · day ${info.cd}</small>
      ${likely.length ? `<div class="rl-rows">${likely.map(row).join('')}</div>` : `<p class="rl-calm">These are usually your easiest days. If something bothers you, pick it below.</p>`}
      <button class="pill-cta rl-cta" data-action="nav" data-to="log">${icon('plus', 14)} Log how you feel</button></section>` : '';
  return `${topbar('Relief', { back: true })}
  <div class="pad">
    <h1 class="page-h rx-h">Feel better, <span>gently</span></h1>
    <p class="muted rx-sub">What helps: body, food and Chinese medicine.</p>
    ${today}
    <button class="bz-cta" data-action="nav" data-to="breathe"><i class="bz-mini"></i><span><b>Breathe with me</b><small>${((info && BREATHS[BREATH_FOR[info.phase]]) || BREATHS.sigh).name}${info ? " · for your phase" : ""}</small></span>${icon('chevR', 16)}</button>${groundCta()}${habitsCta()}
    ${sectionTitle('Everything that helps')}
    <div class="rx-grid">${keys.map(k => { const h = (state.reliefHelp || {})[k] || [];
      return `<button class="rx-t ${recent.has(k) ? 'on' : ''}" data-action="nav" data-to="relief/${encodeURIComponent(k)}"><span class="rx-e">${RELIEF_EMOJI[k] || '🌿'}</span><b>${k}</b><small>${h.length ? `${icon('heart', 11)} ${h.length} work${h.length > 1 ? '' : 's'} for you` : `${RELIEF[k].steps.length} ways`}</small>${recent.has(k) ? '<i>Logged</i>' : ''}</button>`; }).join('')}</div>
  </div>`;
}
function viewRelief(id) {
  const k = decodeURIComponent(id || ''), R = RELIEF[k]; if (!R) return viewMissing();
  const food = SYMPTOM_FOODS[k] || (k === 'PMS mood' ? SYMPTOM_FOODS.Cravings : null), L = RELIEF_LINKS[k] || {};
  const help = (state.reliefHelp || {})[k] || [], order = R.steps.map((_, i) => i).sort((a, b) => help.includes(b) - help.includes(a));
  return `${topbar('Relief', { back: true })}
  <div class="pad">
    <h1 class="page-h">${k}</h1>
    <section class="card card-light mt"><div class="eyebrow dark">Why it happens</div><p class="dp-text">${R.why}</p></section>
    ${sectionTitle('What helps')}
    <p class="rl-hint">${help.length ? `${icon('heart', 12)} ${help.length} of ${R.steps.length} work for you, so they’re at the top.` : `Tap ${icon('heart', 12)} on what helps you. Next time it moves to the top.`}</p>
    <section class="card glass relief-steps">${order.map(i => { const x = R.steps[i]; return `<div class="rs ${help.includes(i) ? 'helped' : ''}">
      <span class="step-n">${i + 1}</span><div class="rs-b"><div class="rs-h"><b>${x.t}</b>${evBadge(x.ev)}</div><p class="body sm">${x.d}</p>${x.to ? `<button class="link rs-go" data-action="nav" data-to="${x.to}">Open ${icon('chevR', 12)}</button>` : ''}</div>
      <button class="rs-heart ${help.includes(i) ? 'on' : ''}" data-action="reliefHelp" data-k="${k}" data-i="${i}" aria-label="This helps me">${icon('heart', 18)}</button>
    </div>`; }).join('')}</section>
    ${L.tea || L.nu ? `${sectionTitle('Teas & nutrients for this')}<div class="tea-more">${L.tea ? (TEA_GUIDE.find(t => t.k === L.tea) || { teas: [] }).teas.map((t, i) => `<button data-action="nav" data-to="tea/${L.tea}-${i}"><span>${icon('cup', 14)}</span>${t[1]}</button>`).join('') : ''}${(L.nu || []).map(id => { const n = NUTRIENTS.find(x => x.id === id); return n ? `<button data-action="nav" data-to="nutrients/${id}"><span>${nuIc(id, 16)}</span>${n.n}</button>` : ''; }).join('')}</div>` : ''}
    ${food ? `${sectionTitle('Eat')}<section class="card glass"><p class="body sm" style="margin:0 0 10px">${food.tip}</p><div class="foods">${food.foods.map(f => `<span class="food">${f}</span>`).join('')}</div></section>` : ''}
    <section class="card tcm-card"><div class="tcm-glyph">${icon('yinyang', 30)}</div><div class="tcm-main"><div class="eyebrow">Chinese medicine view</div><p class="body" style="margin-top:6px">${R.tcm}</p></div></section>
    ${R.doctor ? `<section class="card glass rl-doc"><span>${icon('plus', 20)}</span><div><small>See a doctor if</small><p>${R.doctor}</p></div></section>` : ''}
    <p class="fine center">General information, not medical advice. Check with a pharmacist before taking painkillers or supplements.</p>
  </div>`;
}
// Flags cycles outside the usual 21–35 day range (or a too-short gap that is probably a mis-tap).
function cycleFlag() {
  const ps = M.stats.periods; if (ps.length < 2) return '';
  const a = ps[ps.length - 2], b = ps[ps.length - 1], gap = C.diffDays(b.start, a.start);
  const key = C.iso(b.start);
  if ((state.flagDismissed || '') === key) return '';
  const [head, msg] = gap < 15 ? [`Two periods ${gap} days apart`, 'Spotting or a mis-tap? Fix it so your predictions stay right.']
    : gap < 21 ? [`A short cycle: ${gap} days`, 'One short cycle is common. If it keeps happening, tell your doctor.']
    : gap > 35 ? [`A long cycle: ${gap} days`, 'Stress, travel or illness can do this. If it repeats, tell your doctor.'] : [];
  if (!head) return '';
  // two bars on one 0 to 50 day scale: this cycle against her usual, with the usual 21 to 35 range as a band behind
  const p = d => Math.min(50, Math.max(1, d)) / 50, avg = Math.round(M.stats.avgCycle);
  return `<section class="card flag fl2"><div class="fl2-h"><span class="bn-ic">${icon('spark', 18)}</span><div><small>Unusual cycle</small><b>${head}</b></div></div>
    <div class="fl3" role="img" aria-label="This cycle ${gap} days, your usual ${avg} days, the usual range is 21 to 35 days" style="--a:${p(21)};--b:${p(35)}">
      <span class="fl3-l">This time</span><b class="fl3-n me"><span class="dotnum">${gap}</span> days</b><span class="fl3-t"><i class="me" style="--p:${p(gap)}"></i></span>
      <span class="fl3-l">Your usual</span><b class="fl3-n"><span class="dotnum">${avg}</span> days</b><span class="fl3-t"><i style="--p:${p(avg)}"></i></span>
      <span></span><span></span><small class="fl3-k"><i></i>usual range, 21 to 35 days</small></div>
    <p>${msg}</p>
    <div class="fl2-acts">${gap < 15 ? `<button class="fl2-b on" data-action="flagEdit" data-date="${key}">${icon('calendar', 14)} Fix in calendar</button>` : ''}<button class="fl2-b" data-action="flagDismiss" data-k="${key}">${icon('check', 14)} It’s correct</button></div></section>`;
}

// ---------- personal patterns (learned from logs) ----------
function patterns() {
  const L = M.stats.avgCycle, sym = {}, energy = Array.from({ length: L + 1 }, () => []), cycles = new Set();
  for (const k in state.logs) {
    const di = C.dayInfo(C.parseISO(k), M.stats); if (!di || di.cd > L) continue;
    const l = state.logs[k]; cycles.add(C.iso(di.cycleStart));
    [...(l.symptoms || []), ...(l.moods || []).filter(m => MOOD_TO_RELIEF[m]), ...(l.flow === 'spotting' ? ['Spotting'] : [])].forEach(s => {
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
// One-line fix shown under every heads-up, so a warning always comes with what to do.
const QUICK_FIX = {
  Cramps: 'Heat on your belly, magnesium in the evening, warm ginger tea.',
  'Ovulation pain': 'Heat on the sore side and a slow walk.',
  Bloating: 'Less salt, banana or potatoes for potassium, fennel or peppermint tea.',
  Headache: 'A big glass of water with a pinch of salt, and eat on time.',
  Acne: 'Zinc foods like pumpkin seeds, a gentle cleanse, hands off your face.',
  'Tender breasts': 'A soft supportive bra, less salt, a warm compress.',
  'Back pain': 'Heat on your lower back and a slow cat-cow stretch.',
  Fatigue: 'Iron with vitamin C, morning daylight and an early night.',
  Cravings: 'Protein at every meal, fibre first, a square of dark chocolate.',
  Nausea: 'Ginger tea and small warm meals.',
  Insomnia: 'Cool dark bedroom, magnesium, no screens in the last hour.',
  Constipation: 'Warm water in the morning, fibre and a walk after meals.',
  Dizziness: 'Eat on time, a pinch of salt in water, stand up slowly.',
  'Pelvic pain': 'Heat low on your belly, rest on your side with a pillow between your knees.',
  'Joint pain': 'Warm movement, omega-3 foods like salmon and sardines, a turmeric milk.',
  Diarrhea: 'Warm rice congee or broth, ginger tea, plenty of fluid with a pinch of salt.',
  'Big appetite': 'Eat more, and make it warm: protein, root vegetables and healthy fats.',
  'Oily skin': 'A gentle cleanse twice a day and a clay mask; zinc foods like pumpkin seeds.',
  'Dry skin': 'Richer cream, a few drops of oil, healthy fats like avocado and eggs.',
  'Hair shedding': 'Iron and protein at every meal, and a ferritin test if it lasts.',
  'Brain fog': 'Protein breakfast, daylight, a short walk, and one task at a time.',
  'Cold hands & feet': 'Warm socks, a ginger foot soak and cooked warming food.',
  'Feeling hot': 'Cool water, mung beans or leafy greens, and a lighter blanket.',
  'Night sweats': 'A cooler bedroom, breathable sheets and a calm wind-down.',
  Anxious: 'Two breaths in through your nose, then one long breath out. Five rounds calm you fast.',
  Stressed: 'A 10-minute walk outside and one thing off today’s list.',
  Irritable: 'Eat something warm with protein and take 10 minutes alone.',
  Angry: 'Move it out of your body: a fast walk, then say what you need.',
  Sad: 'Warmth and company: a bath, a call to someone kind.',
  'Low mood': 'Daylight, gentle movement and a kind word to yourself.',
  'Mood swings': 'Regular meals and early nights keep the swings smaller.',
  Tearful: 'Let it come. Then warm tea and something soft.',
  Sensitive: 'Protect your energy: fewer plans, quieter spaces.',
  Unmotivated: 'Do the smallest next step, then rest without guilt.',
  Indifferent: 'Something sensory: music, sunlight, a favourite meal.',
};
// Moods are never forecast: predicting a feeling can bring it on. Only body symptoms get a heads-up.
function upcomingPatterns(P) {
  if (!M.info) return [];
  const out = [];
  for (const x of P.list.filter(x => !MOODS.includes(x.name) && !GOOD_FEELINGS.includes(x.name))) {
    for (let i = 0; i <= 5; i++) {
      const di = C.dayInfo(C.addDays(new Date(), i), M.stats);
      if (di && di.cd >= x.from && di.cd <= x.to) { out.push({ ...x, inDays: i }); break; }
    }
  }
  return out.slice(0, 3);
}
// Personal energy: blends the hormone model with what you actually log (1–5) once there's data for that day.
function myEnergy(info) {
  const base = C.energyAt(Math.min(info.cd, info.L), info.L, info.P);
  const P = patterns(), v = P.eAvg[Math.min(info.cd, info.L)];
  return v == null ? base : Math.max(.3, Math.min(.95, base * .5 + (.3 + (v - 1) / 4 * .62) * .5));
}
// How well Underskin knows her rhythm: cycles learned out of 6, as one Opal-style ring with the quickest way to sharpen it.
function learnedScore(n) {
  const goal = 6, v = Math.min(n, goal), R = 27, Cc = 2 * Math.PI * R;
  const word = v >= goal ? 'Knows your rhythm' : v >= 3 ? 'Getting precise' : v ? 'Getting to know you' : 'Just starting';
  return `<div class="ls-head"><div class="mv2-b r${v >= goal ? 3 : v ? 2 : 0}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * Math.max(.04, v / goal)).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g">${v >= goal ? '✓' : `${v}/${goal}`}</span></div>
    <div class="ls-t"><small>Prediction accuracy</small><b>${word}</b><span>${v >= goal ? 'Learned from 6+ cycles. Predictions follow your own rhythm.' : `${plural(goal - v, 'more full cycle')} (period to period) to learn your rhythm. Adding past periods counts too.`}</span>
    ${v < goal ? `<button class="pill-cta" data-action="nav" data-to="calendar">${icon('plus', 14)} Add past periods</button>` : ''}</div></div>`;
}
function learnedCard() {
  const { stats, info } = M; if (!info) return '';
  const n = stats.lengths.length, P = patterns(), L = stats.avgCycle, Pd = stats.avgPeriod;
  const pm = Math.max(1, Math.round(stats.variation / 2)), np = info.nextStart, lo = C.addDays(np, -pm), hi = C.addDays(np, pm), ov = info.ov, os = stats.ovSeen;
  const ev = P.eAvg.map((v, d) => [v, d]).filter(([v]) => v != null), peak = ev.length >= 5 ? ev.reduce((a, b) => b[0] > a[0] ? b : a)[1] : null;
  const pats = P.list.filter(x => !MOODS.includes(x.name)).slice(0, 3), md = d => fmt(d, { month: 'short', day: 'numeric' });
  // the map: her cycle as one strip, phases tinted, period solid, egg release, energy peak above, her symptoms pinned below
  const W = 320, X = d => 14 + (Math.min(d, L) - 1) / (L - 1) * (W - 28), y0 = 44, sh = 20, pinY = y0 + sh + 34;
  // symptom pins: start at their real day, then nudge apart so they never overlap
  const pins = pats.map(x => { const d = Math.round((x.from + x.to) / 2); return { x, d, at: X(d), px: X(d) }; }).sort((a, b) => a.at - b.at);
  pins.forEach((q, i) => { if (i && q.px - pins[i - 1].px < 34) q.px = pins[i - 1].px + 34; });
  const over = pins.length ? Math.max(0, pins[pins.length - 1].px - (W - 16)) : 0; pins.forEach(q => { q.px -= over; });
  const map = `<svg class="lm-svg" viewBox="0 0 ${W} ${pins.length ? pinY + 34 : y0 + sh + 18}" role="img" aria-label="Your cycle map: ${L} days, period ${Pd} days, egg release around day ${ov}">
      ${C.phaseRanges(L, Pd).map(r => `<rect x="${X(r.from) - 5}" y="${y0}" width="${X(r.to) - X(r.from) + 10}" height="${sh}" rx="${sh / 2}" fill="${PH_HEX[r.key]}" opacity="${r.key === 'menstrual' ? .95 : .32}"/>`).join('')}
      ${pm ? `<rect x="${X(L - pm) - 4}" y="${y0 - 4}" width="${X(L) - X(L - pm) + 9}" height="${sh + 8}" rx="${(sh + 8) / 2}" fill="none" stroke="#304023" stroke-opacity=".55" stroke-dasharray="3 3"/>` : ''}
      <circle cx="${X(ov)}" cy="${y0 + sh / 2}" r="10" fill="#fff" stroke="#d6a443" stroke-width="3"/><circle cx="${X(ov)}" cy="${y0 + sh / 2}" r="4" fill="#d6a443"/>
      ${peak ? `<g><line x1="${X(peak)}" x2="${X(peak)}" y1="${y0 - 14}" y2="${y0 - 1}" stroke="#20301a" stroke-width="1.4"/><circle cx="${X(peak)}" cy="${y0 - 22}" r="10" fill="#20301a"/><text x="${X(peak)}" y="${y0 - 18}" text-anchor="middle" class="lm-e">⚡</text><text x="${Math.min(W - 40, Math.max(40, X(peak)))}" y="${y0 - 36}" text-anchor="middle" class="lm-lab">energy peak · day ${peak}</text></g>` : ''}
      <rect x="${X(info.cd) - 2}" y="${y0 - 5}" width="4" height="${sh + 10}" rx="2" fill="#20301a"/>
      ${pins.map(q => `<path d="M${q.at} ${y0 + sh + 2} L${q.at} ${y0 + sh + 10} L${q.px} ${pinY - 20}" fill="none" stroke="#20301a" stroke-opacity=".3" stroke-width="1.2"/><circle cx="${q.px}" cy="${pinY - 4}" r="15" fill="#fff" stroke="rgba(48,64,35,.2)"/><text x="${q.px}" y="${pinY + 1.5}" text-anchor="middle" class="lm-pe">${LOG_EMOJI[q.x.name] || '•'}</text><text x="${q.px}" y="${pinY + 24}" text-anchor="middle" class="lm-ax b">day ${q.d}</text>`).join('')}
      <text x="14" y="${y0 - 9}" class="lm-ax">Day 1</text><text x="${W - 14}" y="${y0 - 9}" text-anchor="end" class="lm-ax">Day ${L}</text></svg>`;
  const tile = (cls, ic, k, v, u, sub) => `<div class="lm-t ${cls}"><span class="lm-ic">${ic}</span><small>${k}</small><b><em class="dotnum">${v}</em>${u ? ` ${u}` : ''}</b><p>${sub}</p></div>`;
  return `${sectionTitle('What I’ve learned about you')}
    <section class="card learned lm2">${learnedScore(n)}
      <div class="lm-map"><div class="lm-mh"><b>Your cycle, mapped</b><span><i class="t"></i>today</span></div>${map}
        <div class="lm-key"><span><i style="background:${PH_HEX.menstrual}"></i>Period</span><span><i class="ov"></i>Egg release</span>${pm ? '<span><i class="pm"></i>Next period range</span>' : ''}</div></div>
      <div class="lm-grid">
        ${tile('c', '🔁', 'Your cycle', L, `days${stats.variation ? ` ±${pm}` : ''}`, n ? `From ${plural(n, 'cycle')}` : 'Log your next period')}
        ${tile('p', '🩸', 'Your period', Pd, 'days', stats.periods.length ? `From ${plural(stats.periods.length, 'period')}` : 'Default until you log')}
        ${tile('n', '📅', 'Next period', md(np), '', n ? `Likely ${md(lo)} to ${md(hi)}` : 'Sharper with every period')}
        ${tile('o', '🥚', 'Egg release', `Day ${ov}`, '', os.cd ? 'From your egg-white sign' : os.luteal ? 'From your check-ins' : 'Estimated from your cycle')}
      </div>
      ${pats.length ? `<div class="lm-pats"><small>Your body’s habits</small>${pats.map(x => `<span class="lm-pat"><i>${LOG_EMOJI[x.name] || '•'}</i><b>${x.name}</b><em>${x.from === x.to ? `Day ${x.from}` : `Days ${x.from} to ${x.to}`}</em><small>${x.cyclesN} of your cycles</small></span>`).join('')}</div>` : ''}
      <p class="lm-foot">${icon('spark', 12)} The more you log, the more personal every prediction gets.</p></section>`;
}
function headsUpCard() {
  const P = patterns(), up = upcomingPatterns(P);
  if (!up.length) return '';
  return `${sectionTitle('Heads-up from your patterns')}
    <section class="card glass headsup">${up.map(x => { const rk = reliefKey(x.name); return `<${rk ? `button data-action="nav" data-to="relief/${encodeURIComponent(rk)}"` : 'div'} class="hu-row">
      <span class="hu-when">${x.inDays === 0 ? 'Today' : x.inDays === 1 ? 'Tomorrow' : `In ${x.inDays} days`}</span>
      <span class="hu-t"><b>${x.name}</b> usually shows up on ${x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`}<small>Seen in ${x.cyclesN} of your cycles</small>${QUICK_FIX[x.name] ? `<em class="al-fix">${icon('spark', 12)} ${QUICK_FIX[x.name]}</em>` : ''}</span>${rk ? icon('chevR', 16) : ''}</${rk ? 'button' : 'div'}>`; }).join('')}</section>`;
}
// Before patterns exist: rings for exactly what unlocks them (6 energy days, a symptom 3 times, 2 cycles).
function patternUnlock(P) {
  const eDays = P.eAvg.filter(v => v != null).length, symN = Object.values(state.logs).reduce((n, l) => n + (l.symptoms || []).length, 0), R = 27, Cc = 2 * Math.PI * R;
  const items = [['⚡', 'Energy', eDays, 6, 'days'], ['🌀', 'Symptoms', symN, 3, 'logged'], ['🌙', 'Cycles', P.cycles, 2, 'with check-ins']];
  return `<section class="card glass pat-unlock"><small>Unlock your patterns</small>
    <div class="mind-rings pu-rings">${items.map(([g, n, v, goal, u], i) => `<div class="mv2-b r${v >= goal ? 3 : v ? 2 : 0}" style="--i:${i}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * Math.max(.04, Math.min(1, v / goal))).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g">${v >= goal ? '✓' : g}</span><b>${n}</b><small>${Math.min(v, goal)} of ${goal} ${u}</small></div>`).join('')}</div>
    <p>Check in on your energy and symptoms, and Underskin shows you <b>your</b> patterns: which days cramps, bloating or low moods tend to arrive, and how your energy really moves.</p>
    <button class="pill-cta" data-action="nav" data-to="log">${icon('plus', 14)} Check in today</button></section>`;
}
function patternsSection() {
  const P = patterns(), L = P.L, info = M.info;
  // energy: your logged average vs the hormone model
  const W = 340, H = 120, X = d => 10 + (d - 1) / (L - 1) * (W - 20), Y = v => H - 14 - (v - 1) / 4 * (H - 30);
  let model = '', mine = '';
  for (let d = 1; d <= L; d++) model += `${d === 1 ? 'M' : 'L'}${X(d).toFixed(1)} ${Y(1 + 4 * C.energyAt(d, L, M.stats.avgPeriod)).toFixed(1)}`;
  const pts = [];
  for (let d = 1; d <= L; d++) { // 3-day smoothing over logged days
    const w = [P.eAvg[d - 1], P.eAvg[d], P.eAvg[d + 1]].filter(v => v != null);
    if (P.eAvg[d] != null && w.length) pts.push([d, w.reduce((a, b) => a + b, 0) / w.length]);
  }
  pts.forEach(([d, v], i) => { mine += `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(v).toFixed(1)}`; });
  const ranges = C.phaseRanges(L, M.stats.avgPeriod);
  let energyCard = '';
  if (pts.length >= 6) {
    // her best stretch: the run of logged days around her peak that stays close to it
    const pk = pts.reduce((m, p, i) => (p[1] > pts[m][1] ? i : m), 0), top = pts[pk][1];
    let ia = pk, ib = pk;
    while (ia > 0 && pts[ia - 1][1] >= top - .4) ia--;
    while (ib < pts.length - 1 && pts[ib + 1][1] >= top - .4) ib++;
    const bA = pts[ia][0], bB = pts[ib][0], bPh = C.phaseFor(pts[pk][0], L, M.stats.avgPeriod);
    // how closely her logs follow the hormone forecast (0 to 100)
    const diffs = pts.map(([d, v]) => Math.abs(v - (1 + 4 * C.energyAt(d, L, M.stats.avgPeriod))));
    const inStep = Math.round(100 * (1 - diffs.reduce((x, y) => x + y, 0) / diffs.length / 4));
    // average logged energy in each phase, out of 5
    const phAvg = ranges.map(r => { const v = P.eAvg.slice(r.from, r.to + 1).filter(x => x != null); return { k: r.key, v: v.length ? v.reduce((x, y) => x + y, 0) / v.length : null }; });
    const low = phAvg.filter(x => x.v != null).sort((x, y) => x.v - y.v)[0];
    const flat = top - Math.min(...pts.map(p => p[1])) < .6;
    const head = flat ? 'Your energy stays even' : `Best on days ${bA === bB ? bA : `${bA} to ${bB}`}`;
    const sub = flat ? 'Your logs barely change across the month.' : `In your ${PHASES[bPh].name.toLowerCase()} phase. Lowest in your ${PHASES[low.k].name.toLowerCase()} days.`;
    const area = `${mine}L${X(pts[pts.length - 1][0]).toFixed(1)} ${H - 14}L${X(pts[0][0]).toFixed(1)} ${H - 14}Z`;
    const ring = x => { const c = PH_HEX[x.k], p = x.v == null ? 0 : (x.v - 1) / 4 * 100;
      return `<div class="en-b" style="--c:${c}"><span><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" pathLength="100" class="en-bt"/><circle cx="22" cy="22" r="18" pathLength="100" class="en-bf" style="stroke-dasharray:${p.toFixed(0)} 100"/></svg><b>${x.v == null ? '·' : x.v.toFixed(1)}</b></span><small>${PHASES[x.k].name}</small></div>`; };
    const todayX = info ? X(Math.min(info.cd, L)) : null;
    energyCard = `<section class="card glass en2">
      <div class="en-top"><div><small>Your energy</small><h3>${head}</h3><p>${sub}</p></div>
        <div class="en-step"><b>${inStep}<i>%</i></b><small>in step with your hormones</small></div></div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" class="pat-svg en-svg" role="img" aria-label="${head}. ${sub}">
        <defs><linearGradient id="enFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#304023" stop-opacity=".16"/><stop offset="1" stop-color="#304023" stop-opacity="0"/></linearGradient></defs>
        ${ranges.map(r => `<rect x="${X(r.from) - 4}" y="4" width="${X(r.to) - X(r.from) + 8}" height="${H - 18}" rx="8" fill="${PH_HEX[r.key]}" opacity=".14"/>`).join('')}
        ${flat ? '' : `<rect x="${X(bA) - 6}" y="4" width="${X(bB) - X(bA) + 12}" height="${H - 18}" rx="8" fill="none" stroke="#304023" stroke-opacity=".4" stroke-dasharray="3 3"/>`}
        <path d="${area}" fill="url(#enFill)"/>
        <path d="${model}" fill="none" stroke="#304023" stroke-opacity=".4" stroke-width="1.4" stroke-dasharray="4 4"/>
        <path d="${mine}" fill="none" stroke="#20301a" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
        ${pts.map(([d, v]) => `<circle cx="${X(d).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2.3" fill="#fff" stroke="#20301a" stroke-width="1.4"/>`).join('')}
        ${todayX != null ? `<line x1="${todayX}" x2="${todayX}" y1="6" y2="${H - 14}" stroke="${PH_HEX[info.phase]}" stroke-width="2"/><text x="${todayX}" y="0" text-anchor="middle" class="en-now">Today</text>` : ''}
        <text x="10" y="${H - 1}" class="pat-ax">Day 1</text><text x="${W - 10}" y="${H - 1}" text-anchor="end" class="pat-ax">Day ${L}</text></svg>
      <div class="pat-leg"><span><i class="me"></i>You (logged)</span><span><i class="mo"></i>Hormone forecast</span>${flat ? '' : '<span><i class="bs"></i>Best days</span>'}</div>
      <div class="en-bs">${phAvg.map(ring).join('')}</div>
      <details class="en-more"><summary>What this shows ${icon('chevD', 13)}</summary>
        <p>The solid line is the energy you logged, averaged over all your cycles for each day. The dashed line is what your hormones predict: energy rises with estrogen and testosterone before ovulation, settles with progesterone after it, and dips in the last days before your period.</p>
        <p>The rings are your average energy in each phase, out of 5. ${inStep >= 80 ? 'Your logs follow your hormones closely, so you can plan around them.' : 'Your logs drift from the forecast, so sleep, stress or training may be moving your energy more than your cycle does.'}</p>
        <p>Use it to plan: put the demanding things on your best days and keep the low days lighter. Your abilities stay the same all month, only how it feels to use them changes.</p></details>
    </section>`;
  }
  const rows = P.list.slice(0, 6).map(x => `<div class="pat-row">
      <div class="pat-h"><b>${x.name}</b><span>${x.from === x.to ? `day ${x.from}` : `days ${x.from}–${x.to}`} · ${PHASES[x.phase].name}</span></div>
      <div class="pat-strip">${x.days.slice(1).map((v, i) => `<i style="opacity:${v ? .25 + .75 * v / x.max : 1};background:${v ? PH_HEX[C.phaseFor(i + 1, L, M.stats.avgPeriod)] : 'rgba(32,48,26,.07)'}"></i>`).join('')}</div>
    </div>`).join('');
  return `${sectionTitle('Your patterns')}
    ${P.list.length || energyCard ? `${energyCard}
      ${rows ? `<section class="card glass"><div class="eyebrow" style="margin-bottom:6px">When your symptoms show up</div>${rows}
        <div class="pat-days"><span>Day 1</span><span>Ovulation ~${C.ovulationDay(L, M.stats.avgPeriod)}</span><span>Day ${L}</span></div></section>` : ''}`
      : patternUnlock(P)}`;
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
// Remedy: everything to make it on one card. Ingredients as amount tiles, then the steps as a numbered dot flow.
function remedyMake(r) {
  const tiles = r.ingredients.map(g => { const [n, q] = ingRow(g), opt = /^optional/i.test(g);
    return `<div class="rm-i ${opt ? 'opt' : ''}">${q || opt ? `<b>${q || 'Optional'}</b>` : ''}<span>${n.replace(/^Optional:\s*/i, '')}</span></div>`; }).join('');
  return `<section class="card glass rm-make">
    <div class="rm-h"><h3>${r.days ? 'Each morning' : 'Make it'}</h3><span><b class="dotnum">${r.ingredients.length}</b> things <b class="dotnum">${r.steps.length}</b> steps</span></div>
    <div class="rm-is">${tiles}</div>
    <ol class="rm-st">${r.steps.map(x => `<li><p>${x}</p></li>`).join('')}</ol></section>`;
}
function viewRemedy(id) {
  const r = REMEDIES.find(x => x.id === id); if (!r) return viewMissing();
  const info = M.info, warm = warmWindow(info), organPhase = PHASE_ORDER.find(p => TCM[p].organ.includes(r.organ));
  let tracker = '';
  if (r.days) {
    const ls = lemonState();
    if (!ls || ls.over) {
      tracker = `<section class="card card-light"><div class="eyebrow dark">28-day ritual</div><h3 class="dark-h">${ls?.over ? 'Ready for another round?' : 'Start your 28 days'}</h3>
        <p class="dp-text">${info && info.cd === 1 ? 'Today is day 1 of your cycle, the perfect day to begin.' : info ? `Best started on day 1 of your cycle. Your next one is in ${plural(info.daysToPeriod, 'day')}. You can also start today.` : ''}</p>
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
  return `<div class="pad sp2">
    ${specHero({ photo: carePhoto(r.id, 1000), glyph: r.glyph, han: true, eyebrow: `${r.nature} · ${r.element} · ${r.organ}`, name: r.name,
      label: r.take ? 'How to take it' : 'Key ingredients', rows: r.take ? [['Dose', r.take.dose], ['How often', r.take.often], ['When', r.take.when]] : r.ingredients.map(ingRow), desc: r.why })}
    <section class="card glass tea-fit"><div class="tf-k">Best in your cycle${r.raw ? ' · raw days' : ''}</div>${phaseFit(r.phases, M.info && M.info.phase)}${r.phases.length === 4 ? '<small class="tf-all">Good every day of your cycle</small>' : ''}
      ${r.take && r.take.more ? (() => { const [ic, k, v] = r.take.more, now = k === 'Pause' && r.raw && warm; return `<div class="rx-more ${now ? 'now' : ''}"><span>${icon(ic, 15)}</span><p><b>${now ? 'Paused right now' : k}</b>${v}</p></div>`; })() : ''}
      ${organPhase ? `<div class="rm-tcm"><span class="rm-han">${Z.FIVE[r.element].han}</span><p><b>${r.organ}</b> is the organ of your <b>${PHASES[organPhase].name.toLowerCase()}</b> phase in Chinese medicine (${TCM[organPhase].element}).</p></div>` : ''}</section>
    ${r.raw && warm ? `<section class="card flag"><span class="bn-ic">${icon('yinyang', 18)}</span><div class="bn-t"><b>Not today</b><p>You’re in your warm window. Chinese medicine keeps raw and cold food away during your period and the days before. Save this for your follicular phase.</p></div></section>` : ''}
    ${tracker}
    ${remedyMake(r)}
    ${remedyScience(r)}
    ${r.weeks ? `${sectionTitle('Week by week')}<section class="card glass">${r.weeks.map(w => `<div class="tide on"><span class="tide-g">${w.w}</span><div><div class="tide-n">${w.add}</div><div class="tide-s">${w.gain}</div></div></div>`).join('')}</section>` : ''}
    ${(() => { const nx = REMEDIES[(REMEDIES.indexOf(r) + 1) % REMEDIES.length]; return `<button class="card glass nu-next" data-action="nav" data-to="remedy/${nx.id}"><small>Next remedy</small><b>${nx.name}</b>${icon('chevR', 16)}</button>`; })()}
    <p class="fine center">Traditional home remedies, not a replacement for medical care.</p>
  </div>`;
}
// Supplement spec sheet: dose, form and timing on the glass sheet, then the phases it helps, studies and cautions.
const suppOf = name => SUPP_LIB.find(x => x.m.test(name));
const suppPhases = x => { const ph = PHASE_ORDER.filter(p => EAT_GUIDE[p].cats.supps[1].some(([, n]) => x.m.test(n))); return ph.length ? ph : PHASE_ORDER; };
// Supplement page: when in her day to take it, as a sunrise-to-night line with a pin.
function suppDay(when) {
  const w = when.toLowerCase();
  const at = /evening|dinner/.test(w) ? 76 : /morning|breakfast/.test(w) && /lunch/.test(w) ? 36 : /morning|breakfast/.test(w) ? 18 : /spread/.test(w) ? -1 : /meal/.test(w) ? 50 : -1;
  const pins = at < 0 ? [18, 50, 76] : [at];
  return `<section class="sp-day"><div class="tf-k">When in your day</div>
    <div class="spd-line"><span class="spd-ic s">${icon('sun', 16)}</span><i class="spd-bar"></i><span class="spd-ic m">${icon('moon', 16)}</span>
      ${pins.map(x => `<b class="spd-pin" style="--x:${x / 100}"></b>`).join('')}</div>
    <div class="spd-lab"><span>Morning</span><span>Midday</span><span>Evening</span></div>
    <p>${when}</p></section>`;
}
// How much is safe: her dose against the official daily limit, as one bar (EFSA where Europe set one).
// [low, high, limit, unit, who set it, what the limit counts]
const SAFE_UL = {
  magnesium: [200, 250, 250, 'mg', 'EU', 'Counts magnesium from supplements only. Magnesium in food does not count toward it.'],
  iron: [18, 25, 40, 'mg', 'EU', 'Counts iron from food and supplements together. More only when your doctor treats low iron.'],
  zinc: [15, 25, 25, 'mg', 'EU', 'Counts zinc from food and supplements together. Oysters are very rich, so on oyster days skip the capsule.'],
  'vitamin-d': [1000, 2000, 4000, 'IU', 'EU', 'Counts all vitamin D you take. Higher amounts only with a blood test and your doctor.'],
  'vitamin-e': [200, 200, 450, 'IU', 'EU', 'About 300 mg of natural vitamin E, from food and supplements together.'],
  b6: [0, 12, 12, 'mg', 'EU', 'Counts B6 from food and supplements. Tingling hands or feet is the sign to stop.'],
  calcium: [1000, 1200, 2500, 'mg', 'EU', 'Counts calcium from food and supplements together, so your raw milk and cheese count too.'],
  'omega-3': [1, 2, 5, 'g', 'EU', 'EPA and DHA together. Up to this amount did not raise bleeding risk in healthy adults.'],
  'vitamin-c': [250, 500, 2000, 'mg', 'US', 'Europe set no limit. Above the US limit, loose stools and stomach upset are common.'],
  prenatal: [400, 400, 1000, 'µg', 'EU', 'Counts folic acid and methylfolate from pills. Folate from greens and liver does not count.'],
};
function suppSafe(id) {
  const S = SAFE_UL[id]; if (!S) return '';
  const [lo, hi, ul, u, who, note] = S, top = Math.max(ul * 1.3, hi * 1.1), pc = v => (v / top * 100).toFixed(1);
  const dose = lo === 0 ? `≤${hi}` : lo === hi ? `${hi}` : `${lo}–${hi}`, at = hi >= ul;
  return `<section class="card glass sf"><div class="sf-h"><div class="tf-k">How much is safe</div>
      <span class="sf-n"><b class="dotnum">${dose}</b><small>${u} a day</small></span>
      <p>${at ? 'Your dose stays at or under' : 'Your dose stays well under'} the ${who === 'EU' ? 'EU' : 'US'} safe limit of <b>${ul} ${u}</b> a day.</p></div>
    <div class="sf-bar" role="img" aria-label="Your dose ${dose} ${u}, safe limit ${ul} ${u}">
      <i class="sf-ok" style="width:${pc(ul)}%"></i><i class="sf-over" style="left:${pc(ul)}%"></i>
      <i class="sf-dose" style="left:${pc(lo)}%;width:max(10px, ${(pc(hi) - pc(lo)).toFixed(1)}%)"></i>
      <span class="sf-lim" style="left:${pc(ul)}%"><small>Limit</small></span></div>
    <div class="sf-k"><span><i class="d"></i>Your dose</span><span><i class="o"></i>Safe every day</span><span><i class="x"></i>Too much</span></div>
    <details class="sf-more"><summary>What the limit means ${icon('chevD', 13)}</summary><p>The most you can take every day, for years, that experts found safe for nearly all adults. ${note}</p></details></section>`;
}
// Food first: each food with what one serving gives, as a bar against her daily need
const fmtAmt = v => v < 10 && v % 1 ? String(v) : String(Math.round(v));
function suppFoodHead(id) {
  const A = SUPP_FOOD_AMT[id]; if (!A) return '';
  return `<div class="ff-h"><span>One serving gives</span><span>You need <b class="dotnum">${A.need[0]}</b> ${A.need[1]} a day</span></div>`;
}
function suppFoodRow(id, [f, tip], i) {
  const A = SUPP_FOOD_AMT[id], r = A && A.rows[i];
  if (!r) return `<div class="spec-row"><b>${f}</b><span>${tip}</span></div>`;
  const [serv, v] = r, pc = Math.round(v / A.need[0] * 100), over = pc > 100;
  return `<div class="ff-r"><div class="ff-t"><b>${f}</b><span class="ff-v"><b class="dotnum">${fmtAmt(v)}</b>${A.need[1]}</span></div>
    <div class="ff-bar ${over ? 'over' : ''}" role="img" aria-label="About ${pc}% of your day"><span><i style="width:${Math.min(100, Math.max(3, pc))}%"></i></span><em>${over ? `${+(v / A.need[0]).toFixed(v / A.need[0] < 2 ? 1 : 0)}× your day` : `${pc}%`}</em></div>
    <small>${serv} · ${tip}</small></div>`;
}
function viewSupp(id) {
  const x = SUPP_LIB.find(s => s.id === id); if (!x) return viewMissing();
  const ph = suppPhases(x), now = M.info && M.info.phase;
  return `<div class="pad sp2">
    ${specHero({ glyph: x.sym, han: x.han, eyebrow: 'Supplement', sym: !x.han, name: x.name, label: 'How to take it',
      rows: [['Dose', x.dose], ['Form', x.form], ['When', x.when]], desc: x.desc })}
    <section class="card glass tea-fit"><div class="tf-k">Best in your cycle</div>${phaseFit(ph, now)}${ph.length === 4 ? '<small class="tf-all">Useful every day of your cycle</small>' : now && !ph.includes(now) ? `<small class="tf-all">Not a focus in your ${PHASES[now].name.toLowerCase()} phase</small>` : ''}</section>
    ${suppSafe(x.id)}
    ${suppDay(x.when)}
    ${(SUPP_FOOD[x.id] || []).length ? `${sectionTitle('Food first')}<section class="card glass nu-food">${suppFoodHead(x.id)}${SUPP_FOOD[x.id].map((r, i) => suppFoodRow(x.id, r, i)).join('')}${warmWindow(M.info) ? '<small class="tf-all">You\u2019re in your warm window: pick the cooked and warm ones until your period ends.</small>' : ''}</section>` : ''}
    ${remedyScience(x, { [x.id]: x })}
    ${(() => { const L = SUPP_LIB.filter(y => ttc() || !/prenatal|coq10/.test(y.id)), nx = L[(L.indexOf(x) + 1) % L.length]; return `<button class="card glass nu-next" data-action="nav" data-to="supp/${nx.id}"><small>Next</small><b>${nx.name}</b>${icon('chevR', 16)}</button>`; })()}
    <p class="fine center">Check with your doctor or pharmacist if you take medication${ttc() ? ' or might be pregnant' : ''}. Food first, supplements to fill the gaps.</p>
  </div>`;
}
const suppShort = x => { const w = x.name.replace(/\s*\(.*\)/, '').split(' '); return /^vitamin$/i.test(w[0]) ? w.slice(0, 2).join(' ') : w[0]; };
// Supplements: today's stack as a day timeline, each capsule sits at the time of day she takes it; tap one for its spec sheet.
const SUPP_SLOT = { iron: [0], 'vitamin-c': [0], 'b-complex': [0], b6: [0], creatine: [0], prenatal: [0], coq10: [0], ginger: [0, 1, 2, 3], 'omega-3': [1], 'vitamin-d': [1], probiotic: [1], 'vitamin-e': [1], calcium: [1, 2], zinc: [2], magnesium: [2], ashwagandha: [3] };
function suppStack(on, now) {
  const slots = [['sun', 'Morning', 'Breakfast'], ['bowl', 'Midday', 'Lunch'], ['cup', 'Evening', 'Dinner'], ['moon', 'Night', 'Bedtime']];
  // a pick taken at every meal (ginger on period days) shows once as an all-day strip, not four times
  const daily = on.filter(x => (SUPP_SLOT[x.id] || []).length === 4), timed = on.filter(x => !daily.includes(x));
  const cols = slots.map((sl, i) => ({ sl, L: timed.filter(x => (SUPP_SLOT[x.id] || [1]).includes(i)) }));
  const apart = on.some(x => x.id === 'iron') && on.some(x => x.id === 'calcium');
  return `<section class="sd">
    <div class="sd-h"><div><small>${PHASES[now].name} phase</small><b>Your stack today</b></div><span class="sd-n"><b>${on.length}</b><small>picks</small></span></div>
    <div class="sd-line"><i></i></div>
    <div class="sd-cols">${cols.map(({ sl: [ic, t, m], L }) => `<div class="sd-c ${L.length ? '' : 'empty'}"><span class="sd-ic">${icon(ic, 16)}</span><b>${t}</b><small>${m}</small>
      <div class="sd-caps">${L.map(x => `<button class="sd-capw" data-action="nav" data-to="supp/${x.id}" aria-label="${x.name}, ${x.dose}"><span class="sd-cap ${x.han ? 'han' : ''}">${x.sym}</span><small>${suppShort(x)}</small></button>`).join('') || '<span class="sd-none">·</span>'}</div></div>`).join('')}</div>
    ${daily.map(x => { const n = (x.dose.match(/(\d+) times a day/) || [])[1] || '4'; return `<button class="sd-all" data-action="nav" data-to="supp/${x.id}" aria-label="${x.name}, ${x.dose}">
      <span class="sd-cap ${x.han ? 'han' : ''}">${x.sym}</span><span class="sd-all-t"><b>${suppShort(x)}, all day</b><small>${x.dose.replace(/,? ?\d+ times a day/, '')} at each time, morning to bedtime</small></span>
      <span class="sd-all-n" aria-hidden="true">${Array.from({ length: 4 }, () => '<i></i>').join('')}<b class="dotnum">${n}×</b></span></button>`; }).join('')}
    ${apart ? `<p class="sd-note">${icon('clock', 12)} Iron in the morning, calcium later: keep them 2 hours apart</p>` : `<p class="sd-note">${icon('check', 12)} Tap a capsule for the dose, the timing and the study</p>`}
  </section>`;
}
function viewSupps() {
  const now = M.info && M.info.phase, tab = ui.supTab || (now ? 'now' : 'all');
  const L = SUPP_LIB.filter(x => ttc() || !/prenatal|coq10/.test(x.id)), on = L.filter(x => now && suppPhases(x).includes(now));
  const dots = x => { const ph = suppPhases(x); return `<span class="sup-ph" aria-label="Best in ${ph.map(p => PHASES[p].name).join(', ')}">${PHASE_ORDER.map(p => `<i class="${ph.includes(p) ? 'on' : ''}" style="--c:${PHASE_COLOR.light[p]}"></i>`).join('')}</span>`; };
  const row = x => `<button class="sup-row" data-action="nav" data-to="supp/${x.id}"><span class="sup-sym ${x.han ? 'han' : ''}">${x.sym}</span><span class="sup-t"><b>${x.name}</b><small>${x.dose} · ${x.when.toLowerCase()}</small><span class="sup-meta">${evBadge(x.ev)}${dots(x)}</span></span>${icon('chevR', 16)}</button>`;
  return `${topbar('Supplements', { back: true })}<div class="pad sp2">
    <h1 class="page-h">Fill the <span>gaps</span></h1>
    <p class="body sm">Food comes first. These cover what food alone often can’t, timed to your cycle, with the dose and the study behind each one.</p>
    ${now && on.length ? suppStack(on, now) : ''}
    <div class="seg">${(now ? [['now', 'For now'], ['all', 'All']] : [['all', 'All']]).map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="supTab" data-v="${k}">${l}</button>`).join('')}</div>
    <section class="card glass sup-list">${(tab === 'now' && on.length ? on : L).map(row).join('')}</section>
    <p class="fine center">Dots show the phases each one helps most. Check with your doctor or pharmacist if you take medication${ttc() ? ' or might be pregnant' : ''}.</p></div>`;
}
// Science block for remedies, rituals and supplements: a numbered pathway, one card per study with its year, then cautions.
function studyCards(study, cite) {
  const ss = study.split(/(?<=\.)\s+(?=[A-Z])/), cs = cite.split(' · ');
  const pairs = ss.length === cs.length ? ss.map((t, i) => [t, cs[i]]) : [[study, cite]];
  return `<div class="stc ${pairs.length === 1 ? 'one' : ''}">${pairs.map(([t, c], i) => { const y = (c.match(/\b(1[89]\d\d|20\d\d)\b/) || [])[1] || '', tag = (c.match(/\(([^)]+)\)/) || [])[1] || '', who = c.replace(/\([^)]*\)/g, '').replace(y, '').trim();
    return `<article class="stc-c" style="--i:${i}"><div class="stc-h"><b class="dotnum">${y}</b><span>${who}${tag ? `<em>${tag}</em>` : ''}</span></div><p>${t}</p></article>`; }).join('')}</div>`;
}
function suppPairs(id) {
  const P = SUPP_PAIR[id]; if (!P) return '';
  const row = (k, [n, d]) => `<details class="pr-r ${k}"><summary><span class="pr-ic">${k === 'w' ? '+' : '⇆'}</span><b>${n}</b>${icon('chevD', 14)}</summary><p>${d}</p></details>`;
  return `${sectionTitle('Take it with')}
    <section class="card pr-card"><div class="pr-k"><span>Pairs well</span></div>${P.w.map(x => row('w', x)).join('')}
      ${P.a.length ? `<div class="pr-k apart"><span>Keep a few hours apart</span></div>${P.a.map(x => row('a', x)).join('')}` : ''}</section>`;
}
function remedyScience(r, lib = REMEDY_SCIENCE, check = true) {
  const x = lib[r.id]; if (!x) return '';
  return `${sectionTitle('How it works')}
    <section class="card mech">${x.c.map(([c, d], i) => `<div class="mech-r"><span class="mech-n dotnum">${i + 1}</span><div><b>${c}</b><p>${d}</p></div></div>`).join('')}</section>
    ${lib === REMEDY_SCIENCE || lib === RITUAL_SCIENCE ? '' : suppPairs(r.id)}
    ${sectionTitle('What studies found')}
    ${studyCards(x.study, x.cite)}
    ${x.caution || check ? `<section class="ck-first"><span class="ck-i">!</span><div><small>Before you try it</small>${x.caution ? `<b>${x.caution}</b>` : ''}${check ? '<p>Check every ingredient for allergies and for clashes with medicines you take.</p>' : ''}</div></section>` : ''}`;
}
// Detail page: full photo on top, a frosted sheet slides over it with the 3 key items and a short description.
const QTY = /^((?:juice of |pinch of |a |an )?[\d½¼¾⅓⅔.\/–-]+\s*(?:g|kg|ml|l|cups?|tbsp|tsp|handfuls?|cloves?|slices?|sticks?|pinch)?\b|pinch of|a handful of|handful of)\s*/i;
function ingRow(s) {
  const m = String(s).match(QTY), rest = (m ? s.slice(m[0].length) : s).replace(/\s*\(.*?\)/g, '').replace(/^of\s+/i, '');
  const q = m ? m[1].trim().replace(/\s+of$/i, '') : '';
  return [rest.charAt(0).toUpperCase() + rest.slice(1), q.charAt(0).toUpperCase() + q.slice(1)];
}
function liquidArt(glyph, han, sym) {
  return `<div class="spec-liquid"><i></i><i></i><i></i></div>${glyph ? `<span class="spec-glyph ${han ? 'han' : ''} ${sym ? 'sym' : ''}">${glyph}</span>` : ''}`;
}
function specHero({ photo, glyph, han, sym, eyebrow, name, label = 'Key ingredients', rows = [], lead, desc, extra = '', media = '' }) {
  return `<section class="spec"><div class="spec-media ${media ? 'm3d' : photo ? '' : 'liquid'}">${media || (photo ? `<img src="${photo}" alt="">` : liquidArt(glyph, han, sym))}<span class="spec-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>${extra}
    <div class="spec-name">${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${name}</h1></div></div>
    <div class="spec-sheet"><span class="spec-handle"></span><div class="spec-k">${label}</div>
      ${rows.slice(0, 3).map(([t, v]) => `<div class="spec-row"><b>${t}</b>${v ? `<span>${v}</span>` : ''}</div>`).join('')}
      ${lead ? `<p class="spec-lead">${lead}</p>` : ''}${desc ? `<p class="spec-desc">${desc}</p>` : ''}</div></section>`;
}
// photo for a ritual/remedy card when we have one, glow art otherwise
function careArt(id, shape, seed) { const u = carePhoto(id, 500); return u ? `<img class="rc-photo" src="${u}" alt="" loading="lazy"><span class="rc-shade"></span>` : glowArt(shape, seed); }
function careHero(id, shape, seed) { const u = carePhoto(id, 1000); return u ? `<img class="dh-photo" src="${u}" alt=""><span class="dh-shade"></span>` : glowArt(shape, seed); }
function remedyCards(info) {
  return REMEDIES.slice().sort((a, b) => remediesFor(info).includes(b) - remediesFor(info).includes(a)).map((r, i) => {
    const ok = remediesFor(info).includes(r);
    return `<button class="rcard tall ${ok ? '' : 'dim'} ${carePhoto(r.id) ? 'has-photo' : ''}" data-action="nav" data-to="remedy/${r.id}">${careArt(r.id, ['orb', 'drop', 'wave', 'crown', 'hill'][i % 5], 80 + i)}
      <div class="rc-top"><span class="rit-min">${r.organ} · ${r.element}</span><span class="rit-seal" aria-hidden="true">${r.glyph}</span></div><div class="rit-foot">${ok ? '' : '<span class="rit-you not">Not now</span>'}<div class="rc-t">${r.name}</div></div></button>`;
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
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77% / .15)"/>
    <path d="M${c} ${c - r} A${r} ${r} 0 0 ${wax ? 1 : 0} ${c} ${c + r} A${Math.abs(k).toFixed(2)} ${r} 0 0 ${(k > 0) === wax ? 0 : 1} ${c} ${c - r}Z" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/></svg>`;
}
function alignmentCard(info) {
  const ph = PHASES[info.phase], tcm = TCM[info.phase], moon = Z.moonPhase(new Date()), cp = cosmicProfile();
  const h = C.hormonesRel(Math.min(info.cd, info.L), info.L, info.P);
  const hs = HORMONES.filter(x => x.key !== 'fsh').map(x => ({ ...x, v: h[x.key], tr: C.hormoneTrend(Math.min(info.cd, info.L), info.L, info.P, x.key) })).sort((a, b) => b.v - a.v).slice(0, 2);
  const hLine = hs.map(x => `${x.name} ${C.hormoneLevel(x.v).toLowerCase()}${x.tr === 'rising' ? ' and rising' : x.tr === 'falling' ? ' and falling' : ''}`).join(' · ');
  const waxing = moon.age < 14.77, building = info.phase === 'follicular' || info.phase === 'ovulatory';
  const moonSync = waxing === building ? (waxing ? 'In sync: moon and hormones are both building.' : 'In sync: moon and body are both turning inward.') : (waxing ? 'The moon is building while your body turns inward. Honour your body first.' : 'The moon is releasing while your energy rises. Use both: let go and begin.');
  const rem = remediesFor(info)[dayNum(new Date()) % Math.max(1, remediesFor(info).length)] || REMEDIES[0];
  const top = hs[0];
  const tile = (g, t, to, han) => `<button class="cx" data-action="nav" data-to="${to}"><span class="cx-g ${han ? 'han' : ''}">${g}</span><span class="cx-t">${t}</span></button>`;
  return `${sectionTitle('Everything connected')}
  <div class="cx-row">
    ${tile(`<i style="background:${top.color}"></i>`, `${top.name} ${top.tr === 'rising' ? '↗' : top.tr === 'falling' ? '↘' : ''}`, 'hormones')}
    ${tile(tcm.elementGlyph, tcm.element, 'point/' + info.phase, true)}
    ${tile(moonIcon(moon, 26), /full/i.test(moon.name) ? 'Full moon' : /new/i.test(moon.name) ? 'New moon' : /wax/i.test(moon.name) ? 'Waxing' : /wan/i.test(moon.name) ? 'Waning' : moon.name, 'moon')}
        ${tile(rem.glyph, rem.name.split(' ')[0], 'remedy/' + rem.id, true)}
  </div>`;
}

// ---------- daily focus ----------
// How strongly stress (cortisol) hits on each part of the cycle, and what keeps it calm.
const CALM = {
  'flow-start': [3, 'Your body is already under strain. Add 15 min of yin yoga or meditation and skip anything intense.'],
  'flow-end': [1, 'Stress eases as bleeding stops. 5 min of slow breathing keeps it that way.'],
  rising: [1, 'You handle stress well now. A short meditation keeps the good mood steady.'],
  building: [1, 'Train hard, then 5 min of breathwork afterwards so cortisol settles fast.'],
  peak: [2, 'Hard training plus high energy can push cortisol up. Cool down with 10 min of stretching or breathing.'],
  settle: [2, 'Progesterone makes you more sensitive to stress. Add an evening yoga or meditation.'],
  focus: [2, 'Cortisol rises more easily now. Keep training steady and add 10 min of meditation.'],
  premenstrual: [3, 'Falling hormones can make stress feel bigger. Extra yoga, meditation and early nights help keep cortisol, cramps and mood calm.'],
};
const MOVE_G = { lift: 'dumbbell', hiit: 'bolt', sport: 'heart', pilates: 'spark', yoga: 'leaf', meditate: 'mind', walk: 'sun' };
const CALM_SHORT = { 'flow-start': 'Extra yin yoga or meditation, nothing intense', 'flow-end': '5 min slow breathing', rising: 'A short meditation', building: '5 min breathwork after training', peak: '10 min stretching after training', settle: 'Evening yoga or meditation', focus: '10 min meditation a day', premenstrual: 'Extra yoga, meditation & early nights' };
const SLEEP_PLAN = {
  'flow-start': ['Sleep in', 'Up to 9 hours, rest is repair now'], 'flow-end': ['Back to rhythm', 'Wake with the light again'],
  rising: ['Up with the sun', 'Morning light, no alarm'], building: ['Up with the sun', 'Morning light, no alarm'],
  peak: ['Same wake time', 'Late nights are fine, keep mornings steady'], settle: ['Earlier nights', 'Your body runs warmer, keep the room cool'],
  focus: ['Earlier nights', 'Lights low after sunset'], premenstrual: ['In bed by 22:00', 'Sleep is lighter now, guard it'],
};
const PEOPLE_PLAN = { menstrual: ['Cosy & close', 'Cuddles, a quiet night in'], follicular: ['Say yes', 'New plans, new people'], ovulatory: ['Go out', 'Your most social days'], luteal: ['Small & warm', 'Close friends, cuddles'] };
function dayPlan(info) {
  const w = dayWindow(info), [lvl] = CALM[w], ph = info.phase, warm = warmWindow(info);
  const energy = Math.round(C.energyAt(info.cd, info.L, info.P) * 100), sl = SLEEP_PLAN[w], pp = PEOPLE_PLAN[ph], sp = PHASES[ph].superpower;
  const tile = (cls, to, g_, k, t, s) => `<button class="dpt ${cls}" data-action="nav" data-to="${to}"><span class="dpt-g">${g_}</span><span class="dpt-k">${k}</span><b>${t}</b><small>${s}</small></button>`;
  return `<div class="dplan">
    <div class="dplan-h"><span>What to do</span><div class="dplan-en"><i><b style="width:${energy}%"></b></i><em>Energy ${energy}%</em></div></div>
    <div class="dpt-grid">
      ${tile('', 'plan', '🥗', 'Eat', FOOD_NEEDS[w][0], `${FOOD_NEEDS[w][1].map(x => x[0].slice(x[0].indexOf(' ') + 1)).slice(0, 3).join(' · ')}<br>${warm ? '🔥 Warm & cooked only' : '🌿 Fresh & raw welcome'}`)}
      ${tile(`calm lv${lvl}`, 'stress', '🪷', 'Stress', `${['', 'Low', 'Medium', 'High'][lvl]}<i class="dc-bar"><b style="width:${lvl * 33.3}%"></b></i>`, `Best: ${STRESS_PLAN[w][1][0].toLowerCase()}`)}
      ${tile('', 'rhythm', '🌙', 'Sleep', sl[0], sl[1])}
      ${tile('', 'rhythm', ph === 'menstrual' ? '🫶' : ph === 'ovulatory' ? '💃' : ph === 'luteal' ? '🫂' : '👯', 'People', pp[0], pp[1])}
      ${tile('wide', 'plan', '✨', 'Your strength', sp.title, sp.text)}
    </div>
    ${lvl === 3 ? `<p class="dplan-alert">🧘 Stress can hit harder today. Keeping cortisol low now can ease cramps and mood.</p>` : ''}
  </div>`;
}
// Stretches and meditation for each part of the cycle: [title, short line, steps].
const STRETCH = {
  'flow-start': ['Child’s pose & knees in', '5 gentle minutes for cramps', ['Child’s pose, knees wide, 1–2 min of slow belly breaths', 'On your back, hug both knees and rock side to side', 'Reclined butterfly, a pillow under each knee, 2 min']],
  'flow-end': ['Cat-cow & hip circles', 'Wakes up a stiff lower back', ['Cat-cow on hands and knees, 10 slow rounds', 'Standing hip circles, 10 each way', 'Forward fold with soft knees, 1 min']],
  rising: ['Sun salutations', '3–5 rounds to wake up', ['Reach up as you breathe in, fold as you breathe out', 'Step back to plank, lower down, small cobra', 'Downward dog for 5 breaths, step forward, rise']],
  building: ['Dynamic warm-up', 'Before you lift or run', ['Leg swings, 10 each side', 'Walking lunges with a twist, 10', 'Arm circles and hip openers, 1 min']],
  peak: ['Stretch after training', 'Hips & hamstrings, gently', ['Low-lunge hip stretch, 1 min a side', 'Seated forward fold, 1 min', 'Figure-four glute stretch, 1 min a side', 'Stay soft, don’t push to your end range today']],
  settle: ['Twists & pigeon', 'Eases bloating and tight hips', ['Seated twist, 5 breaths a side', 'Pigeon or figure-four, 1 min a side', 'Side-body stretch, arms overhead']],
  focus: ['Legs up the wall', '5 min to calm and de-bloat', ['Lie with your legs up a wall, 5 min', 'Lying twist, 1 min a side', 'Slow neck and shoulder rolls']],
  premenstrual: ['Butterfly & child’s pose', 'For heavy, crampy days', ['Reclined butterfly, 2–3 min', 'Child’s pose with a cushion under your belly', 'Warm hands on your lower belly, slow breaths']],
};
const MEDITATE = {
  'flow-start': ['Yoga nidra · 15 min', 'Lying down, eyes closed', ['Lie down warm and covered', 'Scan slowly from your toes to your head', 'Let each part feel heavy. Rest is the medicine today']],
  'flow-end': ['Slow breathing · 5 min', 'In for 4, out for 6', ['Sit tall or lie down', 'Breathe in through your nose for 4', 'Breathe out slowly for 6. Longer exhales calm cortisol']],
  rising: ['Set an intention · 5 min', 'A fresh start', ['Sit and take 10 slow breaths', 'Ask: what do I want this cycle?', 'Pick one thing and write it down']],
  building: ['Box breathing · 4 min', 'After training', ['Breathe in for 4', 'Hold for 4, out for 4, hold for 4', 'Repeat 8 rounds so cortisol settles fast']],
  peak: ['Cooling breath · 5 min', 'Calms a busy, buzzing mind', ['Sit comfortably, shoulders soft', 'Breathe in through your nose, out through your mouth, slowly', 'Make each exhale a little longer than the last']],
  settle: ['Evening meditation · 10 min', 'Lights low, before bed', ['Sit or lie with the lights dimmed', 'Follow your breath, count to 10 and start again', 'When your mind wanders, gently come back']],
  focus: ['Meditation · 10 min', 'Once a day, same time', ['Sit quietly with your eyes closed', 'Follow the breath in your belly', 'End with three things you’re grateful for']],
  premenstrual: ['4-7-8 breathing & yin · 15 min', 'Your calmest medicine now', ['Breathe in for 4, hold for 7, out for 8', 'Four rounds, then 10 min of gentle yin yoga', 'Early night afterwards if you can']],
};
// What each part of the cycle needs from food: [headline, [nutrient, why, foods, evidence], …]. Warm & cooked in the warm window.
const FOOD_NEEDS = {
  'flow-start': ['Iron, warmth & calm cramps', [
    ['🩸 Iron', 'You lose iron with every bleed. Low iron means tiredness and feeling cold.', 'Red meat, liver, mussels, oysters, cooked spinach', 'strong'],
    ['🐟 Omega-3', 'Calms the prostaglandins that cause cramps.', 'Wild salmon, sardines, egg yolks', 'some'],
    ['🌙 Magnesium', 'Relaxes the womb muscle and eases pain.', 'Pumpkin seeds, cacao, cooked greens', 'some'],
    ['🫚 Warming foods', 'Warmth moves blood and soothes cramps.', 'Bone broth, ginger, stews, warm raw milk', 'tcm']]],
  'flow-end': ['Rebuild iron & protein', [
    ['🩸 Iron + vitamin C', 'Vitamin C helps you absorb iron up to several times better.', 'Beef or lamb with peppers, kiwi or citrus', 'strong'],
    ['🥚 Protein & B12', 'Rebuilds blood and the new womb lining.', 'Eggs, chicken, fish, cheese melted into warm dishes', 'some'],
    ['🍲 Still warm', 'Your belly is still recovering. Cooked food is easiest.', 'Soups, roasted veg, cooked fruit', 'tcm']]],
  rising: ['Fresh food for rising estrogen', [
    ['🥬 Fibre & greens', 'Your gut clears used estrogen. Fibre keeps it moving.', 'Raw carrot, leafy greens, cucumber, seasonal veg', 'some'],
    ['🍶 Fermented foods', 'A healthy gut balances your hormones.', 'Raw kefir, raw yoghurt, sauerkraut, kimchi', 'emerging'],
    ['🥚 Protein', 'Builds the follicle that holds your egg.', 'Eggs, wild fish, chicken, cottage cheese', 'emerging'],
    ['🍊 Vitamin C', 'Helps you absorb iron and may support the growing follicle.', 'Citrus, kiwi, berries, peppers', 'some']]],
  building: ['Fuel for your strong days', [
    ['💪 Protein', 'Muscles need it to recover from training. Aim for protein at every meal.', 'Meat, fish, eggs, raw milk', 'some'],
    ['🍠 Good carbs', 'Fuel for harder training and steady energy.', 'Sweet potato, potatoes, fruit, sourdough', 'some'],
    ['⚪ Zinc & B6', 'Help the egg mature and the LH surge.', 'Oysters, beef, pumpkin seeds, banana', 'emerging']]],
  peak: ['Zinc, colour & water', [
    ['⚪ Zinc', 'Supports ovulation and egg quality.', 'Oysters, shellfish, beef, pumpkin seeds', 'emerging'],
    ['🫐 Antioxidants', 'Protect the egg as it’s released.', 'Berries, tomatoes, red peppers, cherries', 'emerging'],
    ['🥗 Fibre', 'Helps your body clear the estrogen peak.', 'Salads, veg, fruit, chickpeas', 'some'],
    ['💧 Water & minerals', 'Your temperature starts rising after ovulation. Drink well.', 'Mineral water, coconut water, watermelon', 'some']]],
  settle: ['More energy & magnesium', [
    ['🍠 A little more food', 'Your body burns about 100–300 kcal more a day now. Eat enough.', 'Root veg, sweet potato, squash, sourdough', 'some'],
    ['🌙 Magnesium', 'Calms nerves, sleep and later PMS.', 'Pumpkin & sesame seeds, cacao, cooked greens', 'some'],
    ['🧬 Vitamin B6', 'Eases PMS and supports mood.', 'Salmon, turkey, banana, potatoes', 'some']]],
  focus: ['Steady blood sugar & calcium', [
    ['🥩 Protein at every meal', 'You’re less insulin-sensitive now. Protein stops dips and cravings.', 'Beef, eggs, fish, raw cheese', 'some'],
    ['🥛 Calcium', 'Enough calcium can ease PMS mood and cramps.', 'Raw milk, raw cheese, yoghurt, sesame', 'some'],
    ['🍫 Magnesium', 'For cravings, sleep and mood.', 'Dark chocolate, nuts, seeds', 'some']]],
  premenstrual: ['Warm, calming & mineral-rich', [
    ['🌙 Magnesium + B6', 'Together they ease PMS, bloating and low mood.', 'Pumpkin seeds, cacao, banana, salmon', 'some'],
    ['🥛 Calcium', 'Can ease PMS mood swings and cramps.', 'Warm raw milk, cheese baked into warm dishes, sesame', 'some'],
    ['🍌 Potassium', 'Helps with water retention and bloating.', 'Banana, avocado, potatoes, coconut water', 'some'],
    ['🫚 Warm & cooked only', 'No raw or cold food now. Warmth eases what’s coming.', 'Stews, soups, ginger, cinnamon', 'tcm']]],
};
// Colour focus and three meal ideas per part of the cycle: a broth or soup, something raw (warm swap when raw is off) and meat or fish.
const FOOD_MEALS = {
  'flow-start': { col: ['🔴⚫', 'Dark red & black', 'Red builds blood and black warms the kidneys in TCM. Red meat and black sesame bring iron.', 'Red meat, black sesame, cooked blackberries, red dates'],
    broth: ['Beef bone broth with ginger', 'Simmer bones 6–12 h with ginger and a few red dates. Sip a warm mug with every meal.'],
    raw: null, warmAlt: ['Baked apple with cinnamon', 'Cooked fruit instead of raw: warm, sweet and easy on cramps.'],
    meat: ['Slow-cooked beef or lamb stew', 'Or chicken liver fried with onions: the richest iron you can eat.'] },
  'flow-end': { col: ['🔴', 'Red', 'Red foods bring iron and the vitamin C to absorb it.', 'Beef, red peppers, cherries, tomatoes'],
    broth: ['Chicken soup with root veg', 'Whole chicken, carrots, celery and parsley, simmered slowly. Rebuilds after bleeding.'],
    raw: ['Red pepper & tomato plate', 'Raw red pepper strips with tomato and olive oil, next to your iron-rich meal.'], warmAlt: ['Roasted red peppers', 'Soft roasted peppers with olive oil and salt.'],
    meat: ['Steak with peppers', 'Beef or lamb with peppers: iron plus vitamin C on one plate.'] },
  rising: { col: ['🟢', 'Green', 'Green foods feed the gut that clears used estrogen. In TCM, green supports the liver in spring.', 'Leafy greens, herbs, cucumber, kiwi, sprouts, avocado'],
    broth: ['Green herb & chicken broth', 'Light clear broth with parsley, coriander and spring onion stirred in at the end.'],
    raw: ['Big green salad with sauerkraut', 'Leafy greens, cucumber, avocado, herbs and a spoon of sauerkraut, with olive oil and lemon.'], warmAlt: ['Sautéed greens', 'Greens wilted in butter with garlic.'],
    meat: ['Wild fish with greens', 'Pan-fried trout or salmon on a bed of greens with lemon.'] },
  building: { col: ['🟢🟠', 'Green & orange', 'Greens for fibre, orange for beta-carotene and steady carbs on strong days.', 'Carrots, sweet potato, apricots, leafy greens, herbs'],
    broth: ['Carrot & ginger soup', 'Carrots, onion and ginger blended with bone broth and a splash of cream.'],
    raw: ['Raw carrot & apple slaw', 'Grated carrot and apple with lemon, raw cream or yoghurt and pumpkin seeds.'], warmAlt: ['Roasted carrots', 'Honey-roasted carrots with thyme.'],
    meat: ['Beef with sweet potato', 'Grilled steak or burger patty with baked sweet potato: protein plus fuel.'] },
  peak: { col: ['🔴🟣', 'Red & purple', 'Red and purple foods are full of antioxidants that may help protect the egg as it is released.', 'Berries, cherries, pomegranate, tomatoes, red cabbage, beetroot'],
    broth: ['Light tomato & fish broth', 'Fresh tomatoes, garlic and white fish in a light broth. Hydrating and fresh.'],
    raw: ['Berry bowl with raw yoghurt', 'Berries, pomegranate and raw yoghurt or kefir. Or a tomato & red onion salad.'], warmAlt: ['Warm berry compote', 'Berries cooked briefly with a little honey.'],
    meat: ['Oysters or seafood', 'Oysters, prawns or mussels for zinc. Or lamb with pomegranate.'] },
  settle: { col: ['🟡🟠', 'Yellow & orange', 'Golden foods give steady, grounding energy. In TCM they feed the spleen (earth).', 'Squash, pumpkin, sweet potato, carrots, egg yolks, corn'],
    broth: ['Pumpkin soup', 'Pumpkin or squash simmered in bone broth with ginger and a swirl of butter.'],
    raw: ['Mango & carrot plate', 'Ripe mango, grated carrot and a squeeze of orange. Eat with protein to keep it steady.'], warmAlt: ['Roasted squash', 'Squash wedges roasted with butter and cinnamon.'],
    meat: ['Roast chicken with root veg', 'Chicken thighs roasted on carrots, squash and potatoes.'] },
  focus: { col: ['🟡🟤', 'Yellow & brown', 'Root veg, eggs and nuts keep blood sugar steady when cravings start.', 'Potatoes, root veg, egg yolks, nuts, dark chocolate, mushrooms'],
    broth: ['Mushroom & beef broth', 'Bone broth with mushrooms and thyme. Deep, savoury and calming.'],
    raw: ['Raw cheese & nut plate', 'Raw cheese, walnuts and a few dates or apple slices. Stops the sweet crash.'], warmAlt: ['Baked potato with butter', 'With raw cheese on top.'],
    meat: ['Eggs and slow-cooked meat', 'Eggs for breakfast; pulled beef or pork with roast potatoes later.'] },
  premenstrual: { col: ['🟠⚫', 'Deep orange & dark', 'Warm, grounding colours. Orange for potassium and carotenes, dark for magnesium.', 'Sweet potato, pumpkin, carrots, dark chocolate, black sesame'],
    broth: ['Ginger chicken stew', 'Chicken, sweet potato and carrots slow-cooked with ginger and cinnamon.'],
    raw: null, warmAlt: ['Warm golden milk', 'Warm raw milk with turmeric, cinnamon and honey. No cold or raw food now.'],
    meat: ['Salmon or beef stew', 'Baked salmon for B6 and omega-3, or a slow beef stew with root veg.'] },
};
// Best tea for each part of the cycle: [emoji, tea, short benefit for the cycle, how, evidence, guide key].
const TEA_DAY = {
  'flow-start': ['🫚', 'Ginger & cinnamon', 'Eases cramps and warms your belly.', '4 slices ginger + 1 cinnamon stick, 10 min. 2–3 cups.', 'some', 'cramps'],
  'flow-end': ['🌱', 'Nettle leaf', 'Refills iron and minerals after bleeding.', '2 tsp dried leaf, 10 min, between meals.', 'emerging', 'heavy'],
  rising: ['🍵', 'Green tea', 'Calm energy and antioxidants as estrogen rises.', '80 °C water, 2–3 min, before noon.', 'some', 'energy'],
  building: ['🍵', 'Matcha', 'Steady focus and energy for strong days.', '1 tsp whisked in warm water or milk.', 'some', 'energy'],
  peak: ['🌺', 'Hibiscus', 'Cooling and full of antioxidants when you run hot.', '1 tbsp, 5 min. Warm or iced.', 'some', 'skin'],
  settle: ['🍋', 'Lemon balm', 'Keeps you calm as progesterone rises.', '1 tbsp, covered, 10 min, afternoon.', 'emerging', 'pms'],
  focus: ['🌱', 'Spearmint', 'Helps keep pre-period skin clear.', '1 tbsp leaves, 5–7 min, twice a day.', 'emerging', 'skin'],
  premenstrual: ['🌼', 'Chamomile & ginger', 'Calms PMS, eases cramps before they start. Warm only.', '1 tbsp chamomile + 3 slices ginger, 10 min.', 'emerging', 'cramps'],
};
// Stress, coherent per part of the cycle: why it hits and the best ways to lower it, most effective first.
const STRESS_PLAN = {
  'flow-start': ['Bleeding, cramps and low hormones already strain your body, so cortisol rises easily.', ['Rest and sleep in, your body is repairing', 'Heat on your belly and slow breathing', '15 min yin yoga or yoga nidra', 'Say no to extra plans today']],
  'flow-end': ['Hormones are rising again and stress eases.', ['5 min slow breathing, out longer than in', 'A walk outside in daylight', 'Gentle movement you enjoy']],
  rising: ['Rising estrogen makes you more resilient to stress.', ['Morning light and a short walk', 'A short meditation to set your intention', 'Use this calm to start hard things']],
  building: ['You handle stress well, but hard training is stress too.', ['Box breathing right after training', 'Eat protein and carbs after you train', 'Sleep 7–9 hours to recover']],
  peak: ['High energy makes it easy to overdo it, and cortisol climbs quietly.', ['Cool down: 10 min stretching or breathing', 'Leave gaps in your calendar', 'Time in nature or with friends']],
  settle: ['Progesterone rises, you run warmer and feel more sensitive.', ['Evening yoga or meditation', 'Regular meals, don’t skip', 'Magnesium-rich food and an earlier night']],
  focus: ['Cortisol rises more easily as progesterone peaks.', ['10 min meditation every day', 'Steady training, not maximum effort', 'Protein at every meal for calm blood sugar']],
  premenstrual: ['Both hormones fall, so stress can feel bigger now.', ['Early nights, guard your sleep', 'Extra yoga and meditation, 15 min', 'Warm food on time, no skipping', 'Close people and cuddles, lighter calendar']],
};
const PHASE_CHEER = {
  menstrual: 'Be gentle with yourself, your body is cleansing itself.',
  follicular: 'Fresh energy is rising. A beautiful time to start something new.',
  ovulatory: 'You’re glowing. Lovely days for people, ideas and big moves.',
  luteal: 'Slow and steady. Finish things, nest and take good care of you.',
};
const PEOPLE_G = { menstrual: '🫶', follicular: '👯', ovulatory: '💃', luteal: '🫂' };
// Food colour of the day as drawn dots (the data keeps the emoji as a compact code).
const FOOD_DOT = { '🔴': '#a8362e', '⚫': '#151515', '🟢': '#5d8a48', '🟠': '#cf7a2e', '🟣': '#6a3d78', '🟡': '#d9b84a', '🟤': '#76523a' };
const colDots = c => [...c].filter(x => FOOD_DOT[x]).map(x => `<i class="cdot" style="background:${FOOD_DOT[x]}"></i>`).join('');
const noEmoji = t => String(t).replace(/^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u, '');
// Today's best things to do, as big tiles. Stress, stretch and meditate open in place with the how-to.
const picSrc = p => p.includes('/') ? p : `images/${p.replace('move-', 'tile-')}.webp`;
// One relief move for today: from what she logged in the last two days, else what is common in this part of her cycle.
const RELIEF_PHOTO = { 'Face fascia': 'belly-massage', 'Ovulation pain': 'belly-massage', Cramps: 'belly-massage', 'PMS mood': 'heart-breath', Bloating: 'lemon-water', Insomnia: 'early-sleep', Acne: 'carrot-salad', Headache: 'foot-soak', Fatigue: 'circulation-shot', 'Tender breasts': 'liver-stretch' };
function reliefPick(w) {
  const logged = [];
  for (const d of [0, -1]) { const l = getLog(C.iso(C.addDays(new Date(), d))); [...(l.symptoms || []), ...(l.moods || [])].forEach(x => { const k = reliefKey(x); if (k && !logged.includes(k)) logged.push(k); }); }
  const k = logged[0] || (RELIEF_WINDOW[w] || [])[0] || 'Face fascia';
  const steps = RELIEF[k].steps.filter(x => !/ibuprofen|naproxen|paracetamol|pain relief|doctor/i.test(x.t + ' ' + x.d) && !/\btea\b|\b[A-Z]{2,3}\d/i.test(x.t));
  return { k, st: steps[dayNum(new Date()) % steps.length], mine: !!logged[0] };
}
// Today's dish on the Eat tile, one warm bowl for each part of her cycle, shown as a turning 3D model.
const DISH_3D = {
  pho: { model: 'models/pho.glb', img: 'images/dish-pho.webp', fit: 1.45 },
  ramen: { model: 'models/soup.glb', img: 'images/dish-soup.webp', fit: 1.45 },
  miso: { model: 'models/miso.glb', img: 'images/dish-miso.webp', fit: 1.2 },
  stew: { model: 'models/stew.glb', img: 'images/dish-stew.webp', fit: 1.75 },
  veg: { model: 'models/veg-plate.glb', img: 'images/dish-veg.webp', fit: 1.45, steam: 0 },
  taco: { model: 'models/taco.glb', img: 'images/dish-taco.webp', fit: 1.2, tileFit: 1.4, heroFit: 1.55, elev: 0.5, steam: 0, hero: true },
};
// Which 3D model looks most like today's recipe; no close match keeps the recipe's own photo.
const DISH_MATCH = [
  [/taco/i, 'taco'],
  [/oxtail|stew|curry|lentil soup|squash.*soup|goulash|chili/i, 'stew'],
  [/stir-fry|pesto noodles|rainbow|wraps|salmon salad|fajita/i, 'veg'],
  [/miso/i, 'miso'], [/ramen/i, 'ramen'], [/pho|bone broth/i, 'pho'],
];
const dishModel = r => { const m = DISH_MATCH.find(([re]) => re.test(r.name)); return m ? DISH_3D[m[1]] : null; };
const DISH_DAY = {
  'flow-start': { m: 'pho', t: 'Beef pho with ginger', why: 'Bone broth and beef bring back the iron you lose.' },
  'flow-end': { m: 'ramen', t: 'Bone broth ramen with egg', why: 'Broth, egg and noodles to rebuild your energy.' },
  rising: { m: 'miso', t: 'Salmon miso soup', why: 'Fermented miso helps clear estrogen, salmon builds.' },
  building: { m: 'miso', t: 'Salmon miso soup', why: 'Protein and omega-3 for the egg that is ripening.' },
  peak: { m: 'pho', t: 'Pho with fresh herbs', why: 'Herbs and greens help your liver clear the peak.' },
  settle: { m: 'ramen', t: 'Chicken ramen with egg', why: 'You burn more now. A warm, filling bowl stops the dips.' },
  focus: { m: 'ramen', t: 'Chicken ramen with egg', why: 'Steady protein and carbs keep cravings calm.' },
  premenstrual: { m: 'miso', t: 'Salmon miso soup', why: 'Warm and gentle, with omega-3 for the cramps ahead.' },
};
// One short line on what the dish gives her: "Heme iron, zinc and B12 for your period."
const recWhy = r => { const n = (r.nutrients || []).slice(0, 3).map((x, i) => i && /^[A-Z][a-z]/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x), l = n.length > 1 ? `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` : n[0];
  return l ? `${l} in one plate.` : 'Made for this part of your cycle.'; };
function todayTiles(info, only) {
  const w = dayWindow(info), g = MOVE_GUIDE[w], [lvl] = CALM[w], ph = info.phase, warm = warmWindow(info);
  const best = MOVES.filter(m => g.r[m.k] === 3);
  const pp = PEOPLE_PLAN[ph], st = STRETCH[w], md = MEDITATE[w], open = ui.hubTip, rp = reliefPick(w);
  const pics = { Stress: 'move-lift', Tea: 'move-hiit' };
  const tile = (cls, act, g_, k, t, s_) => `<button class="dpt ${cls} ${pics[k] ? 'has-pic' : ''} ${act.tip && open === act.tip ? 'open' : ''}" ${act.to ? `data-action="nav" data-to="${act.to}"` : `data-action="hubTip" data-k="${act.tip}"`}>${pics[k] ? `<span class="dpt-g pic"><img class="pb" src="${picSrc(pics[k])}" alt="" loading="lazy"><img class="ps" src="${picSrc(pics[k])}" alt="" loading="lazy"><i></i></span>` : `<span class="dpt-g">${g_}</span>`}<span class="dpt-k">${k}</span><b>${t}</b><small>${s_}</small>${act.tip ? `<span class="dpt-more">${icon('plus', 14, 2.2)}</span>` : ''}</button>`;
  const fn = FOOD_NEEDS[w], fm = FOOD_MEALS[w], sp = STRESS_PLAN[w], td = TEA_DAY[w];
  const dish = DISH_DAY[w], D = DISH_3D[dish.m], rec0 = tonightRecipe(ph, warm), rec = rec0 && (photoUrl(rec0.id) || dishModel(rec0)) ? rec0 : null, recD = rec && dishModel(rec);
  const tips = {
    stress: [icon('mind', 22), `Stress today: ${['', 'low', 'medium', 'high'][lvl]}`, sp[0], sp[1], 'some'],
    stretch: [icon('leaf', 22), st[0], st[1], st[2], 'some'],
    meditate: [icon('spark', 22), md[0], md[1], md[2], 'some'],
  };
  const tipBody = k => {
    if (k === 'tea') return `<div class="hub-tip-in"><span class="ht-g">${icon('cup', 22)}</span><div><b>${td[1]}</b><p>${td[2]}</p><p class="ht-how">${icon('clock', 13)} ${td[3]}</p>${evBadge(td[4])}
      <button class="link fn-more" data-action="nav" data-to="tea">Full tea guide · every problem ${icon('chevR', 12)}</button></div></div>`;
    if (k === 'eat') return `<div class="hub-tip-in stack"><div class="ht-head"><span class="ht-g">${icon('bowl', 22)}</span><div><b>${fn[0]}</b><p>${warm ? `${icon('thermo', 13)} Today: warm & cooked only. No raw or cold food.` : `${icon('leaf', 13)} Today: raw and fresh food is welcome, with some warm meals.`}</p></div></div><div>
      <div class="fcol"><span class="fcol-dots">${colDots(fm.col[0])}</span><div><small>Colour of the day</small><b>${fm.col[1]} foods</b><p>${fm.col[2]}</p><span>${fm.col[3]}</span></div></div>
      ${w === 'flow-start' || w === 'flow-end' ? phaseFoodPic('menstrual') : ''}<small class="fk">Meal ideas</small>
      <div class="fmeals">${[[icon('bowl', 18), 'Broth & soup', fm.broth], warm || !fm.raw ? [icon('thermo', 18), 'Warm instead of raw', fm.warmAlt] : [icon('leaf', 18), 'Raw', fm.raw], [icon('fish', 18), 'Meat & fish', fm.meat]].map(([g_, k_, [t, d]]) => `<div class="fmeal"><span>${g_}</span><div><small>${k_}</small><b>${t}</b><p>${d}</p></div></div>`).join('')}</div>
      <small class="fk">What your body needs</small>
      <div class="fneeds">${fn[1].map(([n, why, foods, ev]) => `<div class="fn"><div class="fn-h"><b>${noEmoji(n)}</b>${evBadge(ev)}</div><p>${why}</p><span>${foods}</span></div>`).join('')}</div>
      <button class="link fn-more" data-action="nav" data-to="plan">Full food guide ${icon('chevR', 12)}</button></div></div>`;
    const x = tips[k]; if (!x) return '';
    return `<div class="hub-tip-in"><span class="ht-g">${x[0]}</span><div><b>${x[1]}</b><p>${x[2]}</p>${x[3] ? `<ol>${x[3].map(t => `<li>${t}</li>`).join('')}</ol>` : ''}
      ${k === 'stress' ? `<p class="ht-fast">${icon('bolt', 13)} Fastest calm: breathe out longer than you breathe in, for 5 minutes.</p>` : ''}${evBadge(x[4])}</div></div>`;
  };
  if (only) return tipBody(only);
  return `<div class="dpt-grid">
      ${tile('wide hero-move ph-vid', { to: 'move' }, `<video class="dpt-vid" src="images/move-stardust.mp4" poster="images/move-stardust.webp" muted loop playsinline preload="none" aria-hidden="true"></video><i></i>`, 'Sport', g.title, best.map(m => m.n).slice(0, 3).join(' · '))}
      ${rec ? tile(`t-tea t-cup t-dish${recD && recD.hero ? ' t-big' : ''}`, { to: `recipe/${rec.id}` }, recD ? `<span class="cup3d-w"><img class="dpt-cup" src="${recD.img}" alt="" loading="lazy"><canvas class="teacup3d" data-model="${recD.model}" data-elev="${recD.elev || 0.9}" data-fit="${recD.tileFit || recD.fit}"${recD.steam === 0 ? ' data-steam="0"' : ''} aria-label="${esc(rec.name)}, turning slowly"></canvas></span>` : `<span class="dish-ph"><img src="${photoUrl(rec.id, 400)}" alt="" loading="lazy"></span>`, 'Eat today', rec.name, `<span class="dpt-why">${recWhy(rec)}</span><span class="dpt-rule">${icon('clock', 12)} ${rec.time >= 60 ? `${Math.floor(rec.time / 60)} h${rec.time % 60 ? ` ${rec.time % 60}` : ''}` : `${rec.time} min`} · Cook it ${icon('chevR', 12)}</span>`) : tile('t-tea t-cup t-dish', { to: 'do/eat' }, `<span class="cup3d-w"><img class="dpt-cup" src="${D.img}" alt="" loading="lazy"><canvas class="teacup3d" data-model="${D.model}" data-elev="0.9" data-fit="${D.fit}" aria-label="${dish.t}, turning slowly"></canvas></span>`, 'Eat today', dish.t, `<span class="dpt-why">${dish.why}</span><span class="dpt-rule">${warm ? `${icon('thermo', 12)} Warm & cooked only` : `${icon('leaf', 12)} Fresh & raw welcome`}</span>`)}
      ${tile('t-deep ph-full keep ph-fr ph-vid', { to: 'do/friends' }, `<video class="dpt-vid" src="images/friends-sunset.mp4" poster="images/friends-sunset.webp" muted loop playsinline preload="none" aria-hidden="true"></video><i></i>`, 'Friends', FRIENDS_TILE[ph][0], `<span class="dpt-fr">${icon('check', 12, 2.4)} ${FRIENDS_TILE[ph][1]}</span><span class="dpt-fr no">${icon('close', 12, 2.4)} ${FRIENDS_TILE[ph][2]}</span>`)}
      ${tile('t-sage ph-full ph-vid', { to: 'relief' }, `<video class="dpt-vid" src="images/relief-stardust.mp4" poster="images/relief-stardust.webp" muted loop playsinline preload="none" aria-hidden="true"></video><i></i>`, 'Relief', rp.st.t, `${rp.mine ? 'You logged' : 'Common now:'} ${rp.k.toLowerCase()}`)}
      ${tile(`calm lv${lvl} t-cort t-mol`, { to: 'breathe/stress' }, `<span class="cup3d-w"><img class="dpt-cup" src="images/cortisol-mol.webp" alt="" loading="lazy"><canvas class="teacup3d" data-model="models/cortisol.glb" data-elev="0.3" data-fit="1.9" data-steam="0" data-shadow="0" aria-label="The cortisol molecule, turning slowly"></canvas></span>`, 'Cortisol', `${['', 'Low', 'Rising', 'High'][lvl]}<span class="cv-lv" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>`, `${['', 'Calm and settled', 'Building up', 'Full, let it out'][lvl]}<span class="dpt-go">${icon('leaf', 13)} Breathe now</span>`)}
      ${tile('t-tea t-cup', { to: 'do/tea' }, `<span class="cup3d-w"><img class="dpt-cup" src="images/${/ginger|cinnamon|chai|cacao|red date|turmeric|dandelion/i.test(td[1]) ? 'cup-chai' : 'cup-glass'}.webp" alt="" loading="lazy"><canvas class="teacup3d" aria-label="${td[1]}, turning slowly"></canvas></span>`, 'Tea for today', td[1], td[2])}
      ${tile('t-glow ph-full ph-vid', { to: 'ground' }, `<video class="dpt-vid" src="images/ground-cat.mp4" poster="images/ground-cat.webp" muted loop playsinline preload="none" aria-hidden="true"></video><i></i>`, 'Ground', GROUND_PHASE[ph].t, '')}
    </div>
    <div class="hub-tip ${open && (open === 'eat' || open === 'tea' || tips[open]) ? 'on' : ''}" id="hub-tip">${open ? tipBody(open) : ''}</div>`;
}
// One big widget: welcome to the phase, the cycle ring, your rhythm right now and the best things to do today.
// ---------- energy compass, aura, power map, glow ----------
// The promise of the app: stop running like a 24-hour machine. Push when your energy rises, slow down when it
// falls, and it shows: better sleep, less stress, a brighter you. Energy and mood shift across the cycle;
// abilities don't, so every line here speaks about energy, never about being better or worse at things.
const MODES = ['Slow down', 'Steady', 'Build', 'Push'];
const COMPASS = {
  'flow-start': { mode: 'Slow down', lvl: 0, why: 'Hormones are at their lowest and your body is shedding. Energy is often low, so rest is part of the work.', work: 'Plan, review, journal and decide what really matters this month.', ease: 'Big launches, extra meetings and max-effort training.', body: 'Walks, stretching, warm food, an early night.' },
  'flow-end': { mode: 'Ease in', lvl: 1, why: 'Estrogen is starting to rise again. Energy usually comes back day by day.', work: 'Clear small tasks and set your goals for the month.', ease: 'Cramming everything into the first good day.', body: 'Light movement, building up gently.' },
  rising: { mode: 'Build', lvl: 2, why: 'Rising estrogen often lifts mood, motivation and energy.', work: 'Start new projects, brainstorm, learn, say yes to plans.', ease: 'Booking every single evening.', body: 'Train more, try something new.' },
  building: { mode: 'Push', lvl: 3, why: 'Estrogen climbs to its peak and testosterone rises. For many women energy is at its highest now.', work: 'Your big tasks, hard decisions and important conversations.', ease: 'Skipping meals and sleep because you’re flying.', body: 'Strength, intervals, your hardest sessions, if you feel like it.' },
  peak: { mode: 'Push', lvl: 3, why: 'Around ovulation energy, confidence and social drive are often at their peak.', work: 'Pitch, present, network, ask for what you want.', ease: 'Saying yes to everything. Protect next week.', body: 'High-energy training, dancing, sprints if you feel good.' },
  settle: { mode: 'Steady', lvl: 2, why: 'Progesterone rises and energy turns calmer and steadier.', work: 'Finish what you started, deep work, admin.', ease: 'Starting five new things at once.', body: 'Moderate strength, longer steady sessions, eat a little more.' },
  focus: { mode: 'Finish', lvl: 1, why: 'Progesterone is high. Many women feel more inward and enjoy order.', work: 'Wrap up, organise, edit, tie loose ends.', ease: 'Late nights and back-to-back plans.', body: 'Pilates, yoga, walks, moderate weights.' },
  premenstrual: { mode: 'Slow down', lvl: 0, why: 'Hormones fall before your period. Energy dips and stress can feel bigger.', work: 'A lighter schedule: finish only what’s due and say no more often.', ease: 'Harsh self-talk, and comparing yourself with your best week.', body: 'Gentle movement, warm food, early nights.' },
};
const COMPASS_LINE = [
  'Slowing down now is strategy, not weakness. It’s how you come back stronger.',
  'Easy does it. Your energy is rebuilding, and that’s exactly on time.',
  'Momentum is building. Use it, and keep your evenings yours.',
  'This is your green light. Go for it, and still sleep.',
];
// Look-your-best tips per window (skin follows hormones too).
const GLOW = {
  'flow-start': ['Skin can be drier and more sensitive now.', 'Rich, gentle moisturiser; skip harsh scrubs and new products. Iron-rich food brings colour back to your face.', 'some'],
  'flow-end': ['Skin is calming as estrogen returns.', 'Hydrating serum, plenty of water and a warm broth. A good week for a gentle facial massage.', 'emerging'],
  rising: ['Rising estrogen supports moisture and collagen, so skin is often clearer.', 'The best time to try a new product or treatment, and to book a facial or haircut.', 'some'],
  building: ['Skin often looks its smoothest and brightest.', 'Keep it simple: light moisturiser, sunscreen, and let your natural glow lead.', 'some'],
  peak: ['Many women look and feel their most radiant around ovulation.', 'Photos, events, dates: lean in. Drink well, your skin shows it.', 'some'],
  settle: ['Progesterone makes skin a little oilier and pores more visible.', 'Cleanse twice in the evening, a clay mask once a week, zinc foods like pumpkin seeds and beef.', 'some'],
  focus: ['Oil keeps rising and the first spots can appear.', 'Don’t pick. Spot-treat, change your pillowcase, and keep blood sugar steady with protein at every meal.', 'some'],
  premenstrual: ['Chin and jaw breakouts and puffiness are common now.', 'Potassium foods (avocado, banana, potato) for puffiness, a cool jade roll on the face, extra sleep. It passes with your period.', 'some'],
};
const AURA_LEVELS = [['Spark', 0], ['Glow', 30], ['Radiant', 90], ['Luminous', 200], ['Golden', 360]];
function compassFor(info) { return COMPASS[dayWindow(info)]; }
function auraDay(k) { return (state.aura && state.aura[k]) || []; }
function auraTotal() { let n = 0; for (const k in state.aura || {}) n += state.aura[k].length; return n; }
function auraLevel(pts = auraTotal()) {
  let i = 0; while (i + 1 < AURA_LEVELS.length && pts >= AURA_LEVELS[i + 1][1]) i++;
  const [name, from] = AURA_LEVELS[i], next = AURA_LEVELS[i + 1];
  return { i, name, pts, next: next ? next[0] : null, need: next ? next[1] - pts : 0, pct: next ? (pts - from) / (next[1] - from) : 1 };
}
// In-sync score for a stretch of days: share of the 3 daily check-ins done.
// Counts only from her first check-in, so days before she started never pull the score down.
function auraPct(from, to) {
  const first = Object.keys(state.aura || {}).sort()[0];
  if (!first) return 0;
  const f = C.parseISO(first); if (from < f) from = f;
  let days = 0, n = 0;
  for (let d = C.startOfDay(from); d <= to; d = C.addDays(d, 1)) { days++; n += auraDay(C.iso(d)).length; }
  return days ? Math.round(n / (days * 3) * 100) : 0;
}
function auraStreak() {
  let s = 0, d = C.startOfDay(new Date());
  if (!auraDay(C.iso(d)).length) d = C.addDays(d, -1);
  while (auraDay(C.iso(d)).length) { s++; d = C.addDays(d, -1); }
  return s;
}
// Short words for the push / slow down card: do, go easy on, move.
const COMPASS_SHORT = {
  'flow-start': ['Plan & reflect', 'Big launches', 'Walk & stretch'], 'flow-end': ['Small tasks, set goals', 'Cramming', 'Gentle movement'],
  rising: ['Start new things', 'Overbooking', 'Try something new'], building: ['Big tasks & decisions', 'Skipping sleep', 'Hardest sessions'],
  peak: ['Pitch, present, ask', 'Saying yes to all', 'Dance, sprint, lift'], settle: ['Finish & deep work', 'Starting five things', 'Steady strength'],
  focus: ['Wrap up & organise', 'Late nights', 'Pilates & walks'], premenstrual: ['Only what’s due', 'Harsh self-talk', 'Gentle & warm'],
};
// Under the period button: the pixel aura woman floating in the middle, tinted by her energy, with lines to five parts of her body.
// Each label says what to do for that part today; tap it to see what is going on there and the two steps.
function energyCard(info, energy) {
  const w = dayWindow(info), c = COMPASS[w], parts = BODY_MAP[info.phase], open = parts.find(p => p.k === ui.enPart);
  const pin = k => BODY_PIN[k];
  const lines = parts.map(p => { const [lx, ly, sd, bx, by] = pin(p.k), x0 = sd === 'l' ? 96 : 244; return `<path class="${open && open.k === p.k ? 'on' : ''}" d="M${x0} ${ly + 16} H${sd === 'l' ? x0 + 14 : x0 - 14} L${bx} ${by}"/><circle class="em-dot ${open && open.k === p.k ? 'on' : ''}" cx="${bx}" cy="${by}" r="3.6"/>`; }).join('');
  const labels = parts.map(p => { const [lx, ly, sd] = pin(p.k); return `<button class="em-l ${sd} ${open && open.k === p.k ? 'on' : ''}" style="top:${ly}px" data-action="enPart" data-k="${p.k}" aria-expanded="${open && open.k === p.k ? 'true' : 'false'}"><small>${icon(p.ic, 11)} ${p.label}</small><b>${p.d}</b></button>`; }).join('');
  return `<section class="en en2 lvl-${c.lvl}">
    <div class="em-head"><b>${c.mode}</b></div>
    <div class="em-map"><svg class="em-svg" viewBox="0 0 340 300" aria-hidden="true">${lines}</svg>
      <span class="em-fig"><img src="images/pixel-aura-${c.lvl}.png" alt="Your body today"></span>${labels}</div>
    ${open ? `<div class="em-open"><div class="em-oh"><span class="em-oi">${icon(open.ic, 16)}</span><div><small>${open.label} · today</small><b>${open.d}</b></div>${saveBtn(regTip(`body-${info.phase}-${open.k}`, open.label, [open.d, open.steps[0], open.steps[1], 'Today'], open.to))}</div>
      <p>${open.what}</p>
      <ol class="em-steps">${open.steps.map((t, i) => `<li><i>${i + 1}</i>${t}</li>`).join('')}</ol>
      <div class="en-r no">${icon('close', 12, 2.4)}<span><em>Skip today</em>${open.avoid}</span></div>
      <button class="em-go" data-action="nav" data-to="${open.to}">${open.link} ${icon('chevR', 14)}</button></div>`
    : '<p class="em-hint">Tap a part of your body to see what it needs</p>'}
  </section>`;
}
function compassSec(info) {
  const w = dayWindow(info), c = COMPASS[w], S = COMPASS_SHORT[w], e = getLog(todayISO()).energy;
  const listen = e && c.lvl >= 2 && e <= 2 ? 'You logged low energy. Follow your body, not the calendar.'
    : e && c.lvl <= 1 && e >= 4 ? 'You feel strong today. Enjoy it, gently.' : '';
  return `<div class="hub-sec hub-compass cp2 lvl-${c.lvl}">
      <div class="hub-k"><span>Push or slow down?</span><button class="link" data-action="nav" data-to="rhythm">Your day ${icon('chevR', 12)}</button></div>
      <div class="cp2-top"><b class="cp2-mode">${c.mode}</b><span class="cp2-meter" role="img" aria-label="Energy level ${c.lvl + 1} of 4">${[0, 1, 2, 3].map(i => `<i class="${i <= c.lvl ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="cp2-rows">
        <div><span class="cp2-ic do">${icon('check', 14, 2.2)}</span><small>Do</small><b>${S[0]}</b></div>
        <div><span class="cp2-ic no">${icon('close', 13, 2.2)}</span><small>Go easy</small><b>${S[1]}</b></div>
        <div><span class="cp2-ic mv">${icon('bolt', 14)}</span><small>Move</small><b>${S[2]}</b></div>
      </div>
      ${listen ? `<p class="cp2-note">${listen}</p>` : ''}
      <details class="cp2-more"><summary>Why ${icon('chevD', 13)}</summary><p>${c.why}</p><p><b>Lean into:</b> ${c.work}</p><p><b>Go easy on:</b> ${c.ease}</p><p><b>Body:</b> ${c.body}</p><p class="cp2-line">${COMPASS_LINE[c.lvl]}</p></details>
    </div>`;
}
function viewAura() {
  const info = M.info;
  if (!info) return `${topbar('Your aura', { back: true })}<div class="pad"><p class="muted">Log a period to start growing your aura.</p></div>`;
  const lv = auraLevel(), w = dayWindow(info), g = GLOW[w], st = auraStreak();
  const cyc = []; // this cycle, day by day
  for (let i = 0; i < info.L; i++) { const d = C.addDays(info.cycleStart, i), n = d <= M.today ? auraDay(C.iso(d)).length : -1; cyc.push(`<i class="ad-${n < 0 ? 'f' : n}${C.iso(d) === todayISO() ? ' now' : ''}"></i>`); }
  const ps = M.stats.periods, past = [];
  for (let i = ps.length - 2; i >= 0 && past.length < 4; i--) { const a = ps[i].start, b = C.addDays(ps[i + 1].start, -1); const first = Object.keys(state.aura || {}).sort()[0]; if (!first || b < C.parseISO(first)) break; past.push([fmt(a, { month: 'short', day: 'numeric' }), auraPct(a, b)]); }
  return `${topbar('Your aura', { back: true })}
  <div class="pad aura-page">
    <section class="aura-manifesto card-light"><div class="eyebrow dark">Why this works</div>
      <h2>You’re not meant to run like a man</h2>
      <p>A man’s hormones repeat roughly every 24 hours. Yours move through a cycle of about 28 days. Pushing at the same pace every single day works against your biology, and you feel it every month.</p>
      <p>When you <b>push when your energy rises</b> and <b>slow down when it falls</b>, you sleep better, stress less and eat better for your body. That is what people see as your glow. ${evBadge('some')}</p></section>
    <section class="aura-hero" style="--aura:${(0.35 + lv.pct * .6).toFixed(2)}"><div class="aura-orb big"><i></i><b>${lv.name}</b></div>
      <div class="aura-lv"><div class="aura-bar"><b style="width:${Math.round(lv.pct * 100)}%"></b></div>
        <p>${lv.next ? `${lv.need} more in-sync check-ins to <b>${lv.next}</b>` : 'Your highest level. Keep shining.'}</p>
        <div class="aura-stats"><span><b>${lv.pts}</b>check-ins</span><span><b>${st}</b>day streak</span><span><b>${auraPct(info.cycleStart, M.today)}%</b>this cycle</span></div></div></section>
    ${sectionTitle('This cycle')}
    <section class="card glass"><div class="aura-days">${cyc.join('')}</div><p class="fine" style="margin:10px 0 0">Each dot is a day: the brighter, the more you lived in sync. Tick your 3 check-ins on Today.</p></section>
    ${past.length ? `${sectionTitle('Past cycles')}<section class="card glass aura-past">${past.map(([d, p]) => `<div><span>${d}</span><i><b style="width:${p}%"></b></i><em>${p}%</em></div>`).join('')}</section>` : ''}
    ${sectionTitle('Glow guide · today')}
    <section class="card glass glow-card"><h3>${g[0]}</h3><p>${g[1]}</p>${evBadge(g[2])}</section>
  </div>`;
}
// One flower per phase, matched to its inner season and what the flower stands for (photos: Pexels).
const FLOWER = {
  menstrual: { n: 'Snowdrop', m: 'flowers through winter, hope and rest' },
  follicular: { n: 'Cherry blossom', m: 'spring, fresh starts' },
  ovulatory: { n: 'Dahlia', m: 'summer in full bloom, confidence and grace' },
  luteal: { n: 'Lotus', m: 'calm, turning inward and renewal' },
};
const flowerImg = phase => `<img src="images/flower-${phase}.webp" alt="" decoding="async">`;
// slow glowing spores drifting up through the home hero
const SPORES = Array.from({ length: 16 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--s:${2 + (i * 7) % 5}px;--d:${11 + (i * 5) % 9}s;--dl:-${(i * 13) % 17}s;--w:${((i * 23) % 40) - 20}px"></i>`).join('');
// Home stage: the cycle ring floats over a stone in a rocky canyon, the key numbers sit below it.
// o.nav false = a partner's view: the same flower stage, nothing to tap into her own pages
function stageHero(info, energy, o = {}) {
  const ph = PHASES[info.phase], L = info.L, cd = Math.min(info.cd, L), nav = o.nav !== false;
  const cap = (ic, v, pct, k, to) => `<${nav ? 'button' : 'div'} class="cap" ${nav ? `data-action="nav" data-to="${to}"` : ''}><span class="cap-pill"><svg class="cap-o" viewBox="0 0 120 52" preserveAspectRatio="none" aria-hidden="true"><rect class="cap-t" x="1.5" y="1.5" width="117" height="49" rx="24.5"/><rect class="cap-p" x="1.5" y="1.5" width="117" height="49" rx="24.5" pathLength="100" stroke-dasharray="${Math.max(2, Math.round(pct))} 100"/></svg>${icon(ic, 15)}<b>${v}</b></span><small>${k}</small></${nav ? 'button' : 'div'}>`;
  const nextP = Math.max(0, info.daysToPeriod);
  const perCap = cap('drop', nextP === 0 ? 'Today' : `${nextP}d`, nextP === 0 ? 100 : (1 - nextP / L) * 100, 'Next period', 'calendar');
  const fertCap = cap('heart', info.fertile ? 'Yes' : 'No', info.fertile ? 100 : 0, 'Fertile', 'guide');
  return `<div class="opal">
    <div class="stage-scene"><img class="stage-bg" src="images/forest-calm.jpg" alt="" decoding="async"><span class="stage-tint"></span><span class="stage-light" aria-hidden="true"></span><span class="stage-vig" aria-hidden="true"></span>
      ${nav ? `<button class="stage-phase" data-action="nav" data-to="guide"><b>${ph.name}</b></button>` : `<span class="stage-phase"><b>${ph.name}</b></span>`}
      <div class="stage-orb">${flowRing(info, o.id || 'today', true)}
        <span class="bubble ${info.phase}" title="${FLOWER[info.phase].n}">${flowerImg(info.phase)}<i class="bubble-glass"></i></span></div>
      <span class="stage-base"></span>
      <div class="stage-stats">
        <div class="stage-day"><small>Day</small> ${cd}</div>
        <svg class="stage-br" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M150 0 V12 M150 12 C150 18 140 18 130 18 H62 C52 18 50 22 50 30 M150 12 C150 18 160 18 170 18 H238 C248 18 250 22 250 30" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        <div class="caps">${cap('bolt', `${energy}%`, energy, 'Energy', 'rhythm')}${perCap}${o.fert === false ? '' : fertCap}</div>
      </div>
    </div>
  </div>`;
}
// The period pill under the hero: on her logged period days it asks about today's flow;
// "Period started?" only when it is due, late, predicted or under 6 days away (never mid-period, where it would start a new cycle)
function periodPill(info) {
  const flow = getLog(todayISO()).flow;
  // on her period: a logged flow day, or a predicted day inside a period whose start she logged
  if (info.periodActual || PERIOD_FLOWS.includes(flow) || (info.periodPredicted && !info.predicted)) return `<button class="fh-period pp ps2 ps3" data-action="nav" data-to="log" aria-label="Log today's flow, period day ${info.cd}"><i class="ps3-dot"></i>${PERIOD_FLOWS.includes(flow) ? `Flow logged · day ${info.cd}` : `How’s your flow today?`}</button>`;
  if (info.late || info.dueToday || info.periodPredicted || info.daysToPeriod <= 5) return `<button class="fh-period pp ps2 ps3" data-action="periodStart" aria-label="Period started? Log today as day 1"><i class="ps3-dot"></i>Period started?</button>`;
  return '';
}
function todayHub(info, energy, head = '') {
  const ph = PHASES[info.phase], tcm = TCM[info.phase], [rh1, rh2] = PHASE_RHYTHM_2[info.phase];
  const D = dayMoments(info), m = momentAt(D, nowH());
  return `<section class="hub"><div class="hub-life" aria-hidden="true">${SPORES}</div>${head}
    ${stageHero(info, energy)}
    <div class="stage-after">${ttc() && info.fertile ? `<span class="fh-badge">${icon('spark', 13)} Fertile</span>` : ''}
      ${periodPill(info)}
      ${energyCard(info, energy)}</div>
    <div class="hub-sec hub-plan">
      <div class="hub-k"><span>Best things to do today</span><span class="hub-day">Day ${Math.min(info.cd, info.L)}</span></div>
      ${todayTiles(info)}
    </div>
  </section>`;
}
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
  { key: 'estrogen', name: 'Estrogen', color: '#e0457b' }, { key: 'progesterone', name: 'Progesterone', color: '#3f8a2e' },
  { key: 'testosterone', name: 'Testosterone', color: '#e8590c' },
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
    return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#e0457b" fill-opacity=".28" stroke="#e0457b" stroke-width="1.2"/>
      ${an ? `<circle cx="${-r * .18}" cy="${r * .1}" r="${an}" fill="#bfe3ff" fill-opacity=".55"/>` : ''}<circle cx="${r * .35}" cy="${-r * .25}" r="${Math.max(1.6, r * .22)}" fill="#fff"/></g>`;
  }
  if (cd === ov) return `<g transform="translate(${x} ${y})"><path d="M-12 -4 Q-14 -14 -3 -14 Q6 -16 11 -7 Q15 2 7 9 Q0 15 -7 10 Q-13 5 -12 -4Z" fill="#bfe3ff" fill-opacity=".5" stroke="#e0457b" stroke-width="1.4"/>
    <circle cx="3" cy="16" r="3.4" fill="#fff" stroke="#e0457b"/><circle cx="7" cy="12" r="1" fill="#bfe3ff"/><circle cx="-1" cy="13" r=".8" fill="#bfe3ff"/></g>`;
  const d = cd - ov, life = L - ov, k = d <= 7 ? 0.55 + 0.45 * d / 7 : 1 - 0.6 * (d - 7) / Math.max(1, life - 7), r = 13 * k, pale = d > 9;
  return `<g transform="translate(${x} ${y})"><ellipse rx="${r * 1.15}" ry="${r}" fill="${pale ? '#e9e4d0' : '#f6dfa0'}" fill-opacity="${pale ? .5 : .85}" stroke="${pale ? '#cfc8ad' : '#e9c46a'}"/>
    ${pale ? '' : `<path d="M${-r * .5} 0 Q${-r * .2} ${-r * .3} 0 0 T${r * .5} 0" stroke="#c0392b" stroke-width="${Math.max(1, r * .18)}" fill="none" stroke-linecap="round"/>`}</g>`;
}
function fullCycleGuide(info) {
  const L = info.L, P = info.P, ov = C.ovulationDay(L, P), cd = Math.min(info.cd, L);
  const PC = PHASE_COLOR.dark, COL = { m: PC.menstrual, f: PC.follicular, o: PC.ovulatory, l: PC.luteal };
  const kind = d => d <= P ? 'm' : Math.abs(d - ov) <= 1 ? 'o' : d < ov ? 'f' : 'l';
  const stages = [
    { k: 'm', name: 'Period', days: [1, P], art: 1, lining: 1, lead: [['Estrogen', '#e0457b', 'low'], ['Progesterone', '#5d8a3a', 'low']],
      text: 'Hormones are at their lowest, so last month’s lining sheds. Your brain sends FSH to start a new egg growing.' },
    { k: 'f', name: 'Building up', days: [P + 1, ov - 2], art: Math.round((P + ov) / 2), lining: Math.round((P + ov) / 2), lead: [['Estrogen', '#e0457b', 'rising']],
      text: 'One egg grows inside its follicle and makes more and more estrogen, which rebuilds the lining and lifts your energy.' },
    { k: 'o', name: 'Egg release', days: [ov - 1, ov + 1], art: ov, lining: ov, lead: [['Estrogen', '#e0457b', 'peak'], ['LH', '#b18cff', 'surge'], ['Testosterone', '#e8590c', 'small lift']],
      text: `Peak estrogen triggers the LH surge and the egg is released around day ${ov}. ${ttc() ? `Fertile window: about days ${ov - 5}–${ov + 1}.` : ''}` },
    { k: 'l', name: 'After ovulation', days: [ov + 2, L], art: ov + 6, lining: ov + 7, lead: [['Progesterone', '#5d8a3a', 'high']],
      text: `The empty follicle becomes the “yellow body” and makes progesterone. The lining thickens. ${ttc() ? 'If there’s no pregnancy, both hormones drop and your period starts.' : 'Then both hormones drop and your period starts.'}` },
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
    <g id="g-mark"><line x1="${X(cd + .5)}" x2="${X(cd + .5)}" y1="22" y2="${sy + 14}" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="1.5"/><circle cx="${X(cd + .5)}" cy="${sy + 6}" r="5" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/>
      <text id="g-mark-t" x="${X(cd + .5)}" y="${sy + 26}" text-anchor="${cd < L * .2 ? 'start' : cd > L * .8 ? 'end' : 'middle'}" class="fcg-today">Today · day ${cd}</text></g>
    <rect class="g-hit" x="0" y="0" width="${W}" height="206" fill="transparent"/>
    <text x="${x0}" y="${sy + 36}" class="fcg-k">Day 1</text><text x="${x1}" y="${sy + 36}" text-anchor="end" class="fcg-k">Day ${L}</text>
  </svg>`;
  return `<div class="fcg-body">
      <div class="guide" data-l="${L}" data-p="${P}" data-ov="${ov}" data-cd="${cd}">${diagram}
        <div class="g-legend">${stages.map(st => `<span><i style="background:${COL[st.k]}"></i>${st.name}</span>`).join('')}</div>
        <p class="g-hint">${icon('hand', 14)} Drag along the days to see what happens</p>
        <div class="g-read" id="g-read">${guideRead(cd, L, P, ov, cd)}</div></div>
      ${stages.map((st, i) => `<div class="fcg-st ${st.days[0] <= cd && cd <= st.days[1] ? 'on' : ''}" data-from="${st.days[0]}" data-to="${st.days[1]}">
        <div class="fcg-row2"><div class="fcg-tx">
          <div class="fcg-hd"><span class="fcg-num" style="background:${COL[st.k]}">${i + 1}</span><b>${st.name}</b></div>
          <span class="fcg-days">${st.days[0] === st.days[1] ? `Day ${st.days[0]}` : `Days ${st.days[0]}–${st.days[1]}`}</span>
          <p class="fcg-short">${STAGE_SHORT[st.k]}</p></div>
          ${stageSpark(st.days, L, P, COL[st.k])}</div>
        <div class="fcg-lead">${st.lead.map(([n, c, w]) => `<span><i style="background:${c}"></i>${n} <em>${w}</em></span>`).join('')}</div>
        <details class="fcg-more"><summary>What happens ${icon('chevD', 13)}</summary><p>${st.text}</p></details></div>`).join('')}
      <p class="fine">Typical timing for your ${L}-day cycle. Real days shift a little from cycle to cycle.</p>
    </div>`;
}
// what's happening on one day — shown under the guide as you slide
function guideRead(d, L, P, ov, cd) {
  const ph = C.phaseFor(d, L, P), h = C.hormonesRel(d, L, P), col = PHASE_COLOR.dark[ph];
  const ovary = d < ov - 7 ? 'Several little follicles are waking up' : d < ov ? 'One egg is growing bigger' : d === ov ? 'The egg is released today' : d <= ov + 9 ? 'The “yellow body” makes progesterone' : 'The yellow body shrinks, so hormones fall';
  const lining = d <= P ? 'Shedding: this is your period' : d < ov ? 'Rebuilding, fresh and new' : d <= ov + 7 ? 'Getting thicker and softer' : ttc() ? 'Thick and ready, sheds if there’s no pregnancy' : 'Thick, it sheds when your period starts';
  const lv = k => C.hormoneLevel(h[k]).toLowerCase(), en = Math.round(C.energyAt(d, L, P) * 100), lin = liningAt(d, L, P, ov);
  const bar = (v, c) => `<i style="height:${Math.max(12, Math.round(v * 100))}%;background:${c}"></i>`;
  return `<div class="gr-h"><b>Day ${d}</b><span class="gr-ph" style="--c:${col}">${PHASES[ph].name}${d === cd ? ' · today' : ''}</span></div>
    <div class="gr-rows">
      <div class="gr-row"><span class="gr-ic"><svg viewBox="-17 -17 34 40" width="34" height="34">${ovaryArt(d, ov, L, 0, 0)}</svg></span><div><small>Ovary</small><p>${ovary}</p></div></div>
      <div class="gr-row"><span class="gr-ic gr-lin"><i style="height:${Math.max(10, Math.round(lin * 100))}%"></i></span><div><small>Lining</small><p>${lining}</p></div></div>
      <div class="gr-row"><span class="gr-ic gr-hb">${bar(h.estrogen, '#e0457b')}${bar(h.progesterone, '#3f8a2e')}</span><div><small>Hormones</small><p><b class="gr-e">Estrogen</b> ${lv('estrogen')} · <b class="gr-p">Progesterone</b> ${lv('progesterone')}</p></div></div>
      <div class="gr-row"><span class="gr-ic gr-en">${icon('bolt', 18)}</span><div><small>Energy · ${en}%</small><span class="gr-bar"><i style="width:${en}%"></i></span></div></div>
    </div>`;
}
// ---------- blood sugar: interactive "with / without tricks" curve ----------
function sugarDone() { return doneToday().filter(k => k.startsWith('sg-')).map(k => k.slice(3)); }
function plusOne(el) { const r = el.getBoundingClientRect(), p = document.createElement('span'); p.className = 'plus1'; p.textContent = '+1'; p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = r.top + 'px'; document.body.appendChild(p); setTimeout(() => p.remove(), 900); if (navigator.vibrate) navigator.vibrate(8); }
function sugarCurve(on) {
  const W = 340, H = 170, x0 = 34, x1 = W - 8, y0 = H - 26, yTop = 14, X = m => x0 + m / 120 * (x1 - x0), Y = v => y0 - v / 60 * (y0 - yTop);
  const keep = sugarKeep(on);
  const peak = 30 * keep, width = 1 + (1 - keep) * .8;
  const g = m => { const t = m / (32 * width); return t * Math.exp(1 - t); }; // smooth rise and slow fall
  const path = (pk, fill) => { let d = `M${X(0)} ${Y(0)}`; for (let m = 0; m <= 120; m += 3) d += `L${X(m).toFixed(1)} ${Y(pk * (pk === 30 ? (m / 32) * Math.exp(1 - m / 32) : g(m))).toFixed(1)}`; return fill ? d + `L${X(120)} ${Y(0)}Z` : d; };
  const grid = [10, 20, 30, 40, 50, 60].map(v => `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.06)"/><text x="${x0 - 6}" y="${Y(v) + 3}" text-anchor="end" class="sg-ax">+${v}</text>`).join('');
  const ticks = [0, 30, 60, 90, 120].map(m => `<text x="${X(m)}" y="${H - 8}" text-anchor="middle" class="sg-ax">${m ? `+${m}′` : 'Meal'}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" class="sg-svg">${grid}${ticks}
    <path d="${path(30)}" fill="none" stroke="#f4f5f0" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 4"/>
    <path d="${path(peak, true)}" fill="url(#sgfill)" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="2.5"/>
    <defs><linearGradient id="sgfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stop-opacity=".45"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stop-opacity="0"/></linearGradient></defs>
    <text x="${X(32)}" y="${Y(30) - 6}" text-anchor="middle" class="sg-lbl red">+30 mg/dL</text>
    ${keep < 1 ? `<text x="${X(34 * width)}" y="${Y(peak) - 6}" text-anchor="middle" class="sg-lbl">+${Math.round(peak)} mg/dL</text>` : ''}</svg>
    <div class="sg-leg"><span><i class="red"></i>Without tricks</span><span><i></i>With your tricks · ${Math.round((1 - keep) * 100)}% smaller spike</span></div>`;
}
// ---------- tea guide ----------
// Why today's tea fits where she is: three short reasons per part of the cycle.
const TEA_REASONS = {
  'flow-start': [['drop', 'Eases cramps', 'Ginger lowers prostaglandins, the messengers behind period cramps.'], ['thermo', 'Warms you from inside', 'Both are warming in Chinese medicine, just right while you bleed.'], ['heart', 'Settles your belly', 'Ginger calms the queasy feeling some period days bring.']],
  'flow-end': [['drop', 'Refills minerals', 'Nettle brings iron, calcium and magnesium back after bleeding.'], ['leaf', 'A gentle rebuild', 'A mild leaf you can sip every day as your energy returns.'], ['bolt', 'Energy comes back', 'Iron carries oxygen. More of it means less tiredness.']],
  rising: [['spark', 'Calm focus', 'Caffeine plus L-theanine gives clear energy without the jitters.'], ['leaf', 'Antioxidants', 'Green tea catechins look after your cells as estrogen climbs.'], ['sun', 'A morning ritual', 'Drink it before noon so your sleep stays deep.']],
  building: [['bolt', 'Long, smooth energy', 'Whole ground leaf means more L-theanine for steady focus.'], ['dumbbell', 'Made for strong days', 'Your best days for training and big work.'], ['leaf', 'The whole leaf', 'You drink all of it, so you get all the antioxidants.']],
  peak: [['sun', 'Cools you down', 'Ovulation runs warm. Hibiscus is cooling and tart.'], ['heart', 'Kind to your heart', 'Studies link hibiscus with healthier blood pressure.'], ['spark', 'For your glow days', 'Full of antioxidants and vitamin C.']],
  settle: [['mind', 'Calm as progesterone rises', 'Lemon balm soothes restlessness and helps you unwind.'], ['moon', 'Better sleep', 'A cup in the afternoon or evening helps you drift off.'], ['leaf', 'Light and fresh', 'No caffeine, just a gentle lemony taste.']],
  focus: [['spark', 'Clearer skin', 'Spearmint lowered androgens in small studies, which can calm pre-period breakouts.'], ['leaf', 'Easy digestion', 'Eases the gas and bloating that start to build now.'], ['cup', 'Twice a day', 'The studies used two cups a day.']],
  premenstrual: [['heart', 'Softens PMS', 'Chamomile calms your nerves and lifts a low mood.'], ['drop', 'Gets ahead of cramps', 'Ginger works best when you start a day or two before.'], ['thermo', 'Warm only', 'Chinese medicine keeps everything warm before your period.']],
};
const TEA_WIN = [['flow-start', 'Period · first days'], ['flow-end', 'End of period'], ['rising', 'Early rise'], ['building', 'Strong days'], ['peak', 'Ovulation'], ['settle', 'After ovulation'], ['focus', 'Second half'], ['premenstrual', 'Before your period']];
function viewTea() {
  const info = M.info, w = info ? dayWindow(info) : 'rising', td = TEA_DAY[w], k = ui.teaK, G = k && TEA_GUIDE.find(x => x.k === k);
  const steep = (td[3].match(/\d+(?:–\d+)?\s*min/) || [''])[0], near = w === 'flow-start' || w === 'flow-end' || w === 'premenstrual';
  return `<div class="pad tg">
    <section class="tg-hero tg-3d"><img src="${teaPhoto(td[1], 900, 1100)}" alt="" decoding="async"><span class="tg-shade"></span><span class="tg-studio" aria-hidden="true"></span><canvas class="teacup3d" aria-label="${td[1]}, turning slowly. Drag to turn it, or up and down to look inside."></canvas>
      <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
      <div class="tg-copy"><small>${info ? `Day ${info.cd} · ${PHASES[info.phase].name} · ` : ''}Your tea today</small><h1>${td[1]}</h1><p>${td[2]}</p>
        <span class="tg-chips">${steep ? `<span>${icon('clock', 13)} ${steep}</span>` : ''}<span>${icon('thermo', 13)} ${near ? 'Hot' : 'Warm'}</span></span>
        <button class="tg-cta" data-action="nav" data-to="tea/day-${w}">How to brew it ${icon('chevR', 15)}</button></div></section>

    <section class="card tg-why"><div class="tg-k"><b>Why this tea today</b>${evBadge(td[4])}</div>
      ${TEA_REASONS[w].map(([ic, t, x], i) => `<div class="tg-r"><span class="tg-ri" style="--i:${i}">${icon(ic, 18)}</span><div><b>${t}</b><p>${x}</p></div></div>`).join('')}
      <div class="tg-brew">${icon('cup', 16)} <span>${td[3]}</span></div></section>

    <div class="tg-title"><small>Everything in one place</small><h2>The ultimate <em>tea guide</em></h2></div>

    <div class="tg-sub"><b>How do you feel?</b><small>A tea for every mood</small></div>
    <div class="tg-feel">${TEA_GUIDE.find(g => g.k === 'feel').teas.map(([, n, why, , ev, , q], i) => `<button class="tg-f" data-action="nav" data-to="tea/feel-${i}"><img src="${teaPhoto(n, 200, 200)}" alt="" loading="lazy"><b>${q}</b><span class="tg-fp">${n}</span><small>${why}</small></button>`).join('')}</div>

    <div class="tg-sub"><b>For what you need</b><small>Tap one to see its teas</small></div>
    <div class="tg-needs">${(() => { const used = new Set(); return TEA_GUIDE.filter(g => g.k !== 'feel').map(g => { const t = ['nausea', 'ovulation'].includes(g.k) ? `cover-${g.k}` : (g.teas.find(x => !used.has(teaPhoto(x[1]))) || g.teas[0])[1]; used.add(teaPhoto(t)); return [g, t]; }); })().map(([g, t]) => `<button class="tg-n ${g.k === k ? 'on' : ''}" data-action="teaK" data-v="${g.k === k ? '' : g.k}"><img src="${teaPhoto(t, 300, 220)}" alt="" loading="lazy"><span><b>${g.n}</b><small>${plural(g.teas.length, 'tea')}</small></span></button>`).join('')}</div>
    ${G ? `<section class="card tg-list" id="tg-list"><div class="tg-k"><b>Teas for ${G.n.toLowerCase()}</b><button class="tg-x" data-action="teaK" data-v="" aria-label="Close">${icon('close', 16)}</button></div>
      ${G.teas.map(([g, n, why], i) => `<button class="tg-li" data-action="nav" data-to="tea/${G.k}-${i}"><img src="${teaPhoto(n, 160, 160)}" alt="" loading="lazy"><span><b>${n}</b><small>${why}</small></span>${icon('chevR', 16)}</button>`).join('')}</section>` : ''}

    <div class="tg-sub"><b>Brew it right</b><small>Four small things that make it work</small></div>
    <div class="tg-tips">${[['thermo', 'Water heat', 'Green tea and matcha at 80 °C. Herbs, roots and spices at a full boil.'], ['cup', 'Cover the cup', 'A saucer on top keeps the healing oils in your tea, not in the air.'], ['clock', 'Steep long enough', 'Herbs need 5 to 10 minutes. Roots like ginger like 10 to 15.'], ['drop', 'Warm around your period', 'Hot, never iced, from a few days before until bleeding ends.']].map(([ic, t, x]) => `<div class="tg-t"><span>${icon(ic, 18)}</span><b>${t}</b><p>${x}</p></div>`).join('')}</div>
    <p class="fine center">Herbal teas are gentle support, not medicine. Pregnant, on medication or unsure? Ask your doctor or midwife first.</p>
  </div>`;
}
// Herb profiles in a tea's name ("Ginger & red dates" → ginger + red dates).
const TEA_ALIAS = { 'holy basil': 'tulsi', 'raspberry leaf': 'raspberry' };
function teaProfiles(name) {
  const l = name.toLowerCase(), keys = Object.keys(TEA_PROFILES).filter(k => l.includes(k) || Object.entries(TEA_ALIAS).some(([a, v]) => v === k && l.includes(a)));
  return keys.sort((a, b) => l.indexOf(a) - l.indexOf(b)).map(k => TEA_PROFILES[k]);
}
const TEMPS = ['cold', 'cool', 'neutral', 'warm', 'hot'];
function viewTeaItem(id) {
  let G, t, idx = -1;
  const day = String(id).match(/^day-(.+)$/), m = !day && String(id).match(/^(.+)-(\d+)$/);
  if (day) { t = TEA_DAY[day[1]]; G = t && TEA_GUIDE.find(x => x.k === t[5]); t = t && [...t.slice(0, 5), '']; }
  else if (m) { G = TEA_GUIDE.find(x => x.k === m[1]); idx = +m[2]; t = G && G.teas[idx]; }
  if (!t) return viewTea();
  const [g, n, why, how, ev, warn] = t, steep = (how.match(/\d+(?:–\d+)?\s*min/) || [''])[0];
  const P = teaProfiles(n), info = M.info, ph = info && info.phase;
  const rows = P.length > 1 ? P.flatMap(p => p.c.slice(0, 1).map(([c, d]) => [c, `${p.n} · ${d}`])).concat(P[0].c.slice(1, 2)) : P.length ? P[0].c : [[n, 'Your tea'], ...(steep ? [[steep, 'Steep']] : [])];
  // warmest herb wins: ginger makes a cool chamomile blend warm
  const temp = P.length ? TEMPS[Math.max(...P.map(p => TEMPS.indexOf(p.t)))] : '', best = [...new Set(P.flatMap(p => p.p))];
  const cold = ['cold', 'cool'].includes(temp), nearBleed = ph === 'menstrual' || (info && dayWindow(info) === 'premenstrual');
  const cautions = [warn, ...P.map(p => p.caution)].filter((x, i, a) => x && a.indexOf(x) === i);
  return `<div class="pad">
    ${specHero({ photo: teaPhoto(n, 800, 900), eyebrow: G ? `Tea for ${G.n.toLowerCase()}` : 'Tea', name: /tea|milk|coffee/i.test(n) ? n : `${n} tea`, label: 'Key ingredients',
      rows, lead: n, desc: why })}
    ${P.length ? `<section class="card glass tea-fit">
      <div class="tf-k">Best in your cycle</div>
      ${phaseFit(best, ph)}
      ${cold && nearBleed ? `<p class="tea-warn">${icon('spark', 12)} Cooling in Chinese medicine. Around your period drink it hot and add a slice of ginger.</p>` : ''}
    </section>` : ''}
    ${sectionTitle('How to make it')}
    <section class="card glass tea-how-c"><div class="th-steps">${[['clock', how], ['cup', 'Cover the cup while it steeps, so the fragrant oils stay in your tea.'], ...(nearBleed ? [['thermo', 'Drink it hot or warm these days, never iced.']] : [])].map(([e, x]) => `<div><span>${icon(e, 18)}</span><p>${x}</p></div>`).join('')}</div></section>
    ${P.length ? `${sectionTitle('What studies found')}
    <section class="card glass tea-study">${P.map(p => `<div class="ts-i"><div class="ts-h"><b>${p.n}</b></div><p>${p.study}</p><small>${p.cite}</small></div>`).join('')}</section>` : ''}
    <p class="fine center">Herbal teas are gentle support, not medicine. Pregnant, on medication or unsure? Ask your doctor or midwife first.</p>
  </div>`;
}
// ---------- nutrients: food first, a supplement when there's a reason ----------
const PH4 = [['menstrual', 'Period'], ['follicular', 'Follicular'], ['ovulatory', 'Ovulation'], ['luteal', 'Luteal']];
const phaseFit = (best, ph) => `<div class="tf-phases">${PH4.map(([k, l]) => `<span class="${best.includes(k) ? 'on' : ''} ${k === ph ? 'now' : ''}" style="--pc:${PHASE_COLOR.dark[k]}">${l}${k === ph ? '<i>you</i>' : ''}</span>`).join('')}</div>`;
// Opal-style rings: how many of the last 7 days each logged supplement was taken.
// Drawn line icon for each nutrient (no emoji).
const NU_IC = { magnesium: 'seed', b6: 'banana', iron: 'drop', 'vitamin-d': 'sun', 'omega-3': 'fish', zinc: 'shell', calcium: 'milk', inositol: 'grain', vitex: 'berry' };
const nuIc = (id, size = 20) => icon(NU_IC[id] || 'leaf', size);
function suppWeek() {
  const days = Array.from({ length: 7 }, (_, i) => getLog(C.iso(C.addDays(new Date(), -i))).supp || []);
  const any = days.some(d => d.length), R = 27, Cc = 2 * Math.PI * R;
  const items = SUPPS.filter(([n]) => NUTRIENTS.some(x => x.n === n)).map(([n, g]) => [n, g, days.filter(d => d.includes(n)).length, NUTRIENTS.find(x => x.n === n).id]);
  return `<section class="card glass nu-week"><div class="nw-h"><small>Your last 7 days</small>${any ? '' : '<span>Nothing logged yet</span>'}</div>
    <div class="mind-rings nw-rings">${items.map(([n, g, c, id], i) => `<button class="mv2-b r${c >= 5 ? 3 : c >= 3 ? 2 : c ? 1 : 0}" style="--i:${i}" data-action="nav" data-to="nutrients/${id}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * Math.max(.04, c / 7)).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g">${nuIc(id, 18)}</span><b>${n}</b><small>${c}/7 days</small></button>`).join('')}</div>
    <div class="nw-f"><p>${any ? 'Taken most days counts. Tap one for the dose and the best food sources.' : 'Tick supplements in your daily check-in and your week fills in here.'}</p><button class="pill-cta" data-action="nav" data-to="log">${icon('plus', 14)} Log today</button></div></section>`;
}
function viewNutrients() {
  const ph = M.info && M.info.phase, now = ph ? NUTRIENTS.filter(x => x.p.includes(ph) && x.p.length < 4) : [];
  const card = x => `<button class="card glass nu-c" data-action="nav" data-to="nutrients/${x.id}"><span class="nu-g">${nuIc(x.id)}</span>
    <div class="nu-t"><b>${x.n}</b><small>${x.for}</small></div><div class="nu-r"><span class="nu-dose">${x.d[0][0]}</span>${evBadge(x.ev)}</div></button>`;
  return `${topbar('Nutrients', { back: true })}
  <div class="pad">
    <h1 class="page-h">Food first, <span>then a boost</span></h1>
    <section class="card card-light nu-intro"><small>How to use this</small><p>Real food covers most of what your cycle needs. A supplement makes sense when you have the signs, a test shows you’re low, or a study dose clearly helps.</p><button class="sup-all" data-action="nav" data-to="supp">Supplement guide: doses and studies ${icon('chevR', 14)}</button></section>
    ${suppWeek()}
    ${now.length ? `${sectionTitle(`For your ${PHASES[ph].name.toLowerCase()} phase`)}<div class="nu-list">${now.map(card).join('')}</div>` : ''}
    ${sectionTitle(now.length ? 'All nutrients' : 'Nutrients')}
    <div class="nu-list">${NUTRIENTS.filter(x => !now.includes(x)).map(card).join('')}</div>
    <p class="fine center">General information, not medical advice. Pregnant, on medication or unsure? Ask your doctor or pharmacist first.</p>
  </div>`;
}
// Nutrient page › Food first: each food as a bar against her daily need, read from "30 g ≈ 150 mg".
const NU_NEED = { magnesium: [310, 'mg'], b6: [1.3, 'mg'], iron: [18, 'mg'], 'vitamin-d': [600, 'IU'], 'omega-3': [0.25, 'g', 'EPA + DHA'], zinc: [8, 'mg'], calcium: [1000, 'mg'] };
function nuFood(x) {
  const N = NU_NEED[x.id];
  const rows = x.f.map(([f, a]) => {
    const m = N && String(a).match(/^(.*?)\s*≈\s*([\d.]+)(?:–([\d.]+))?\s*(mg|IU|g)\b/);
    if (!m || m[4] !== N[1]) return `<div class="spec-row"><b>${f}</b>${a ? `<span>${a}</span>` : ''}</div>`;
    const v = m[3] ? (+m[2] + +m[3]) / 2 : +m[2], val = m[3] ? `${m[2]}–${m[3]}` : m[2], k = v / N[0], pc = Math.round(k * 100);
    return `<div class="ff-r"><div class="ff-t"><b>${f}</b><span class="ff-v"><b class="dotnum">${val}</b>${N[1]}</span></div>
      <div class="ff-bar ${pc > 100 ? 'over' : ''}" role="img" aria-label="About ${pc}% of your day"><span><i style="width:${Math.min(100, Math.max(3, pc))}%"></i></span><em>${pc > 100 ? `${+k.toFixed(k < 2 ? 1 : 0)}× your day` : `${pc}%`}</em></div>
      <small>${m[1]}</small></div>`;
  });
  return `${N ? `<div class="ff-h"><span>One serving gives</span><span>You need <b class="dotnum">${N[0]}</b> ${N[1]}${N[2] ? ` ${N[2]}` : ''} a day</span></div>` : ''}${rows.join('')}`;
}
function viewNutrient(id) {
  const x = NUTRIENTS.find(n => n.id === id); if (!x) return viewNutrients();
  const ph = M.info && M.info.phase, i = NUTRIENTS.indexOf(x);
  return `<div class="pad sp2">
    ${specHero({ glyph: nuIc(x.id, 64), eyebrow: `For ${/^[A-Z]{2}/.test(x.for) ? x.for : x.for.charAt(0).toLowerCase() + x.for.slice(1)}`, name: x.n, label: 'Key facts', rows: x.d, lead: x.n, desc: x.why })}
    <section class="card glass tea-fit"><div class="tf-k">When it helps most</div>${phaseFit(x.p, ph)}</section>
    ${suppSafe(x.id)}
    ${sectionTitle('Food first')}
    <section class="card glass nu-food">${nuFood(x)}${warmWindow(M.info) ? '<small class="tf-all">You\u2019re in your warm window: pick the cooked and warm ones until your period ends.</small>' : ''}</section>
    ${sectionTitle('Are you low?')}
    <section class="card glass nu-low"><div class="nl-i"><span>${icon('search', 18)}</span><div><small>Signs</small><p>${x.low}</p></div></div><div class="nl-i"><span>${icon('flask', 18)}</span><div><small>Test to ask for</small><p>${x.test}</p></div></div></section>
    ${sectionTitle('What studies found')}
    ${studyCards(x.study, x.cite)}
    <section class="ck-first"><span class="ck-i">!</span><div><small>Before you try it</small>${x.caution ? `<b>${x.caution}</b>` : ''}<p>Check foods and supplements for allergies and for clashes with medicines you take.</p></div></section>
    <button class="card glass nu-next" data-action="nav" data-to="nutrients/${NUTRIENTS[(i + 1) % NUTRIENTS.length].id}"><small>Next</small><b>${NUTRIENTS[(i + 1) % NUTRIENTS.length].n}</b>${icon('chevR', 16)}</button>
    <p class="fine center">General information, not medical advice. Pregnant, on medication or unsure? Ask your doctor or pharmacist first.</p>
  </div>`;
}
function viewSugar() {
  const on = sugarDone();
  const luteal = M.info && M.info.phase === 'luteal';
  return `${topbar('Blood sugar', { back: true })}
  <div class="pad">
    <h1 class="page-h">Balance your <span>blood sugar</span></h1>
    ${whatsGoingOn(`Every meal makes your blood sugar rise. Big spikes bring cravings, energy crashes and make your body release lots of insulin. Over time that speeds up ageing. Small tricks keep the curve gentle.${luteal ? ' <b>Right now, in your luteal phase, your body is a little less insulin-sensitive. These tricks help most this week.</b>' : ''}`)}
    <section class="card glass sugar"><div class="eyebrow">Your meal today · tap what you did</div><div id="sg-chart">${sugarCurve(on)}</div>
      <div class="sg-chips">${SUGAR_TRICKS.map(t => `<button class="${on.includes(t.k) ? 'on' : ''}" data-action="sugarTrick" data-v="${t.k}">${icon(t.ic, 14)} ${t.n}</button>`).join('')}</div></section>
    <p class="sg-score">${icon('spark', 14)} Each trick adds a point to <button class="link" data-action="nav" data-to="rhythm">your rhythm today</button></p>
    ${sectionTitle('8 tricks')}
    <div class="tricks">${SUGAR_TRICKS.map((t, i) => { const x = SUGAR_SCIENCE[t.k]; return `<section class="card glass trick"><span class="tr-n">${i + 1}</span><div><div class="tr-h"><b>${t.n}</b>${x ? evBadge(x.ev) : ''}</div><p>${t.d}</p>
      ${x ? `<details class="tr-sci"><summary>What studies found ${icon('chevR', 12)}</summary><p>${x.s}</p><small>${x.c}</small>${x.care ? `<p class="tr-care">${icon('spark', 12)} ${x.care}</p>` : ''}</details>` : ''}</div></section>`; }).join('')}</div>
    ${sectionTitle('Your cycle and sugar')}
    <section class="card glass sg-cyc">${PHASE_ORDER.map(p => { const x = SUGAR_CYCLE[p], me = M.info && M.info.phase === p; return `<div class="sgc ${me ? 'me' : ''}" style="--pc:${PHASE_COLOR.dark[p]}"><i></i><div><b>${PHASES[p].name}${me ? ' <em>you</em>' : ''}</b><small>${x.t}</small><p>${x.d}</p></div></div>`; }).join('')}
      <p class="sgc-src">${evBadge('some')} Insulin and insulin resistance were higher in the luteal phase in 257 women (Yeung et al. 2010, JCEM, BioCycle study). Resting burn rises a little after ovulation (Benton et al. 2020, PLoS One).</p></section>
    <p class="fine center">From the book “Krankheitslügen entlarvt”. The chart is an illustration of a typical meal, not a measurement.</p>
  </div>`;
}
// ---------- live your rhythm: sun, moon, body — one daily score ----------
function myGeo() {
  const g = state.profile.geo; if (g) return [g.lat, g.lng];
  const c = COUNTRY_GEO[myCountry()] || COUNTRY_GEO.DE, tz = -new Date().getTimezoneOffset() / 4;
  // A guessed country far from the phone's time zone (e.g. English language in Berlin) would put sunrise at noon.
  return state.profile.country || Math.abs(c[1] - tz) < 30 ? c : [c[0], tz];
}
function sunToday(d = new Date()) { const [la, ln] = myGeo(); return sunTimes(d, la, ln); }
const hm = d => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '·';
// The day in moments, placed on today's real sun times — what to do at each point of the day.
function dayMoments(info) {
  const t = sunToday(), ph = info ? info.phase : 'follicular', H = 36e5, base = C.startOfDay(new Date()).getTime();
  const at = h => new Date(base + h * H), hr = d => ((((d.getTime() - base) / H) % 24) + 24) % 24;
  const rise = t.rise ? hr(t.rise) : 7, set = t.set ? hr(t.set) : 19, noon = t.noon ? hr(t.noon) : 13;
  const bed = Math.max(21.5, Math.min(23.5, set + 3.75));
  const b = [Math.min(rise - .5, 6), Math.max(rise + 2, 9.5)]; // morning window
  b.push(b[1], Math.max(b[1] + 1, noon + 1.5)); // midday
  b.push(Math.max(b[3] + .5, set - .75), Math.max(b[3] + 1, set + 1), Math.max(set + 1.5, bed)); // sunset, evening, bed
  const slow = ph === 'menstrual';
  const people = { menstrual: ['🫶', 'Cosy time & cuddles', 'Let someone take care of you'], follicular: ['👯', 'Time with friends', 'Say yes to plans, you’re rising'], ovulatory: ['💃', 'Go out with friends', 'Your most social days'], luteal: ['🫂', 'Cuddles & close people', 'Small, warm company feels best'] }[ph];
  const M_ = [
    { id: 'morning', g: '🌅', n: 'Morning light', from: b[0], to: b[1], brief: 'Get up with the light. Sun in your eyes now sets your clock for tonight’s sleep.', acts: [
      { k: 'wake', g: '⏰', t: 'Wake without an alarm', s: slow ? 'Sleep in if you can, rest is your rhythm now' : `Sunrise ${hm(at(rise))}` },
      { k: 'light', g: '☀️', t: 'Morning sun in your eyes', s: '5–10 min outside, look towards the sky (never into the sun)' },
      { k: 'air', g: '🌿', t: 'Fresh air · a brief walk', s: slow ? 'A slow few minutes is enough' : 'Even 10 minutes, if possible' },
      { k: 'lemon', g: '🍋', t: 'Lemon water', s: 'Warm water with fresh lemon after the night' }] },
    { id: 'midday', g: '🌞', n: 'Sun at its highest', from: b[2], to: b[3], brief: 'The sun is strongest. Get some on your skin and eat your biggest meal.', acts: [
      { k: 'sun', g: '🌞', t: 'Sun on your skin', s: `Around ${hm(at(noon))}, 10–20 min without burning` },
      { k: 'meal', g: '🥗', t: 'Biggest meal of the day', s: 'Your body handles sugar best now' }] },
    { id: 'afternoon', g: '🌤️', n: 'Afternoon', from: b[3], to: b[4], brief: 'Steady energy. See people, move, stay in the daylight.', acts: [
      { k: 'people', g: people[0], t: people[1], s: people[2] }] },
    { id: 'sunset', g: '🌇', n: 'Sunset', from: b[4], to: b[5], brief: 'The light turns warm. Slow down and dim the lights.', acts: [
      { k: 'dusk', g: '🌇', t: 'Watch the sunset, then dim the lights', s: `Sunset ${hm(at(set))} · screens away` }] },
    { id: 'evening', g: '🕯️', n: 'Evening', from: b[5], to: b[6], brief: 'Melatonin is rising. Go to bed when you feel tired.', acts: [
      { k: 'sleep', g: '🌙', t: 'Bed when you’re tired', s: `Your body gets sleepy around ${hm(at(bed))}` }] },
    { id: 'night', g: '🌙', n: 'Night', from: b[6], to: b[0] + 24, brief: 'Deep sleep. Your body repairs and rebalances your hormones.', acts: [] },
  ];
  return { list: M_, rise, set, noon, base };
}
function momentAt(D, h) { h = ((h % 24) + 24) % 24; return D.list.find(m => (h >= m.from && h < m.to) || (h + 24 >= m.from && h + 24 < m.to)) || D.list[D.list.length - 1]; }
const nowH = () => { const n = new Date(); return n.getHours() + n.getMinutes() / 60; };
const hLabel = h => { h = ((h % 24) + 24) % 24; return `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`; };
function doneToday() { const r = state.rhythm = state.rhythm || {}; return r[todayISO()] = r[todayISO()] || []; }
const RH_GOAL = 9;
function rhythmStreak() {
  const r = state.rhythm || {}; let n = 0;
  for (let i = 0; i < 365; i++) { const k = C.iso(C.addDays(new Date(), -i)), c = (r[k] || []).length; if (c >= 4) n++; else if (i > 0) break; }
  return n;
}
function rhythmLevel() {
  const total = Object.values(state.rhythm || {}).reduce((a, v) => a + v.length, 0);
  const L = [[0, '🌱', 'Seed'], [40, '🌿', 'Sprout'], [120, '🌸', 'Bloom'], [300, '🌻', 'Glow']];
  let cur = L[0], next = L[1]; L.forEach((l, i) => { if (total >= l[0]) { cur = l; next = L[i + 1]; } });
  return { total, cur, next };
}
function moonLine() {
  const m = Z.moonPhase(new Date());
  return /full/i.test(m.name) ? 'Full moon tonight. Step outside and look up.' : /new/i.test(m.name) ? 'New moon. A quiet night to rest and set an intention.' : m.age < 14.77 ? `${m.name}. Energy is building, like yours in spring.` : `${m.name}. A time to slow down and let go.`;
}
function rhythmRing(n, goal) {
  const R = 26, Cc = 2 * Math.PI * R, k = Math.min(1, n / goal);
  return `<svg class="rh-ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>
    <circle class="rh-prog" cx="32" cy="32" r="${R}" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${Cc}" stroke-dashoffset="${Cc * (1 - k)}" transform="rotate(-90 32 32)"/>
    <text x="32" y="37" text-anchor="middle" class="rh-n">${n}</text></svg>`;
}
const PHASE_RHYTHM_2 = { menstrual: ['Slow down', 'Your hormones are at their lowest and your body is cleansing. Rest now, your energy comes back in a few days.'], follicular: ['Push', 'Estrogen is rising, so energy and focus climb. Start new things now.'], ovulatory: ['Push hard', 'Estrogen and testosterone peak. Your best days for big plans and people.'], luteal: ['Ease off', 'Progesterone rises and energy dips. Finish what you started and go to bed earlier.'] };
const PHASE_RHYTHM = Object.fromEntries(Object.entries(PHASE_RHYTHM_2).map(([k, [a, b]]) => [k, `${a}. ${b}`]));
// Emoji in the rhythm data, drawn as line icons.
const EMI = { '⏰': 'clock', '☀️': 'sun', '🌅': 'sun', '🌇': 'sun', '🌙': 'moon', '🌞': 'sun', '🌤️': 'sun', '🌿': 'leaf', '🍋': 'drop', '🕯️': 'spark', '🥗': 'bowl', '🫶': 'heart', '🔥': 'bolt', '🌱': 'seed', '🌸': 'leaf', '🌕': 'moon',
  '✨': 'spark', '🪞': 'star', '🎨': 'drop', '💇‍♀️': 'user', '📓': 'book', '🍲': 'bowl', '🍬': 'berry', '🗓️': 'calendar', '🥩': 'fish', '🏋️': 'dumbbell', '🌬️': 'mind', '🔮': 'star', '♾️': 'spark', '😴': 'moon' };
// Swap any emoji from EMI that sits alone in a tag (or starts a line) for its drawn icon.
const deEmoji = (h, sz = 18) => Object.keys(EMI).reduce((t, e) => t.split(`>${e}<`).join(`>${emi(e, sz)}<`).split(`>${e} `).join(`>${emi(e, 14)} `), h);
const emi = (e, sz = 18) => icon(EMI[e] || 'spark', sz);
const rhAct = (x, done) => `<button class="rh-i ${done.includes(x.k) ? 'on' : ''}" data-action="rhTick" data-k="${x.k}"><span class="rh-g">${emi(x.g)}</span><span class="rh-t"><b>${x.t}</b><small>${x.s}</small></span><span class="rh-cb">${icon('check', 13, 2.6)}</span></button>`;
// "What to do now" panel for a moment (used live and while scrubbing the sky).
function momentPanel(m, h, live) {
  const done = doneToday();
  return `<div class="mp-head"><span class="mp-g">${emi(m.g, 22)}</span><div><small>${live ? `Right now · ${hLabel(h)}` : `At ${hLabel(h)}`}</small><b>${m.n}</b></div>${live ? '' : '<button class="mp-now" data-action="skyNow">Now</button>'}</div>
    <p class="mp-brief">${m.brief}</p>
    ${m.acts.length ? `<div class="rh-list">${m.acts.map(x => rhAct(x, done)).join('')}</div>` : `<p class="mp-moon">Nothing to do right now. Rest.</p>`}`;
}
function rhythmCard(info) {
  const done = doneToday(), D = dayMoments(info), h = nowH(), m = momentAt(D, h), streak = rhythmStreak();
  return `${sectionTitle('Your rhythm today', ['Your day', 'rhythm'])}
    <section class="card rhythm-card">
      <div class="rh-top">${rhythmRing(done.length, RH_GOAL)}<div><b>${PHASE_RHYTHM[info.phase]}</b>
        <small>Sunrise ${hm(sunToday().rise)} · sunset ${hm(sunToday().set)}${streak ? ` · ${streak}-day streak` : ''}</small></div></div>
      <div class="mpanel">${momentPanel(m, h, true)}</div>
    </section>`;
}
// The sky: 24 hours of today's sun path. Drag along it to see what to do at any time.
const SKY = { W: 360, H: 200, x0: 14, x1: 346, hy: 118, A: 82 };
const skyX = h => SKY.x0 + h / 24 * (SKY.x1 - SKY.x0);
function skyY(D, h) { const half = (D.set - D.rise) / 2, v = Math.cos(Math.PI / 2 * (h - D.noon) / half); return SKY.hy - (v > 0 ? v * SKY.A : Math.max(-1, v) * 28); }
function skyMarker(D, h) {
  const x = skyX(h), y = skyY(D, h), day = y < SKY.hy, moon = Z.moonPhase(new Date());
  return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="14" y2="${SKY.H - 34}" stroke="rgba(244,245,240,.35)" stroke-dasharray="2 4"/>
    ${day ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="url(#sky-sun)" class="sun-glow"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#f4f5f0"/>`
      : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" opacity=".6"/>`}
    <rect x="${(x - 24).toFixed(1)}" y="${SKY.H - 30}" width="48" height="20" rx="10" fill="#f4f5f0"/><text x="${x.toFixed(1)}" y="${SKY.H - 16}" text-anchor="middle" class="sky-tm">${hLabel(h)}</text>`;
}
function skyDial(D) {
  const pts = []; for (let h = 0; h <= 24.001; h += .25) pts.push(`${skyX(h).toFixed(1)},${skyY(D, h).toFixed(1)}`);
  const path = 'M' + pts.join(' L'), area = `${path} L${SKY.x1},${SKY.hy} L${SKY.x0},${SKY.hy}Z`, h = nowH();
  const bands = D.list.map(m => { const a = Math.max(0, m.from), z = Math.min(24, m.to), w = skyX(z) - skyX(a);
    return w > 2 ? `<rect class="sky-band ${m.id}" data-m="${m.id}" x="${skyX(a).toFixed(1)}" y="${SKY.hy + 12}" width="${(w - 2).toFixed(1)}" height="5" rx="2.5"/>` : ''; }).join('')
    + (skyX(D.list[5].to - 24) - SKY.x0 > 2 ? `<rect class="sky-band night" data-m="night" x="${SKY.x0}" y="${SKY.hy + 12}" width="${(skyX(D.list[5].to - 24) - SKY.x0 - 2).toFixed(1)}" height="5" rx="2.5"/>` : '');
  const tick = (hh, l) => `<text x="${skyX(hh).toFixed(1)}" y="${SKY.hy + 34}" text-anchor="middle" class="sa-t">${l}</text>`;
  return `<div class="sky" data-rise="${D.rise}" data-set="${D.set}" data-noon="${D.noon}">
    <svg viewBox="0 0 ${SKY.W} ${SKY.H}" width="100%" class="sky-svg">
      <defs><radialGradient id="sky-sun"><stop offset="0" stop-color="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stop-opacity=".55"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stop-opacity="0"/></radialGradient>
        <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(calc(var(--hb) + 103 * var(--hk)) calc(41% * var(--hs2)) 68%)" stop-opacity=".28"/><stop offset="1" stop-color="hsl(calc(var(--hb) + 145 * var(--hk)) calc(39% * var(--hs2)) 30%)" stop-opacity=".05"/></linearGradient>
        <clipPath id="sky-above"><rect x="0" y="0" width="${SKY.W}" height="${SKY.hy}"/></clipPath></defs>
      ${Array.from({ length: 22 }, (_, i) => `<circle cx="${(23 + (i * 53) % 320).toFixed(0)}" cy="${(18 + (i * 37) % 70).toFixed(0)}" r="${i % 3 ? .7 : 1.1}" fill="#f4f5f0" class="sky-star" style="animation-delay:${(i % 7) * .6}s"/>`).join('')}
      <path d="${area}" fill="url(#sky-day)" clip-path="url(#sky-above)"/>
      <path d="${path}" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77% / .55)" stroke-width="1.4"/>
      <line x1="${SKY.x0}" x2="${SKY.x1}" y1="${SKY.hy}" y2="${SKY.hy}" stroke="rgba(244,245,240,.25)"/>
      ${bands}
      ${tick(0, '00')}${tick(D.rise, `Rise ${hLabel(D.rise)}`)}${tick(D.noon, hLabel(D.noon))}${tick(D.set, `Set ${hLabel(D.set)}`)}${tick(24, '24')}
      <g id="sky-mark">${skyMarker(D, h)}</g>
      <rect class="sky-hit" x="0" y="0" width="${SKY.W}" height="${SKY.H}" fill="transparent"/>
    </svg></div>`;
}
let skyD = null;
function bindOrb() {
  const o = document.getElementById('rh-orb'); if (!o || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const set = (x, y) => { o.style.setProperty('--px', x.toFixed(3)); o.style.setProperty('--py', y.toFixed(3)); };
  o.addEventListener('pointermove', e => { const r = o.getBoundingClientRect(); set((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });
  o.addEventListener('pointerleave', () => set(0, 0));
}
function bindSky() {
  const el = document.querySelector('.sky'); if (!el) return;
  const svg = el.querySelector('svg'), hit = svg.querySelector('.sky-hit'), mark = svg.querySelector('#sky-mark'), panel = document.getElementById('mpanel');
  skyD = dayMoments(M.info); let lastM = null;
  const show = (h, live) => {
    mark.innerHTML = skyMarker(skyD, h);
    const m = momentAt(skyD, h);
    svg.querySelectorAll('.sky-band').forEach(b => b.classList.toggle('on', b.dataset.m === m.id));
    if (panel && (m.id !== lastM || live !== panel.dataset.live)) { panel.innerHTML = momentPanel(m, h, live); panel.dataset.live = live; lastM = m.id; if (navigator.vibrate && !live) navigator.vibrate(4); }
    else if (panel) { const s = panel.querySelector('.mp-head small'); if (s) s.textContent = live ? `Right now · ${hLabel(h)}` : `At ${hLabel(h)}`; }
    document.querySelectorAll('.dm').forEach(d => d.classList.toggle('on', d.dataset.m === m.id));
  };
  const at = e => { const r = svg.getBoundingClientRect(); return Math.max(0, Math.min(23.99, ((e.clientX - r.left) / r.width * SKY.W - SKY.x0) / (SKY.x1 - SKY.x0) * 24)); };
  hit.addEventListener('pointerdown', e => { hit.setPointerCapture(e.pointerId); show(at(e), ''); });
  hit.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') show(at(e), ''); });
  ui.skyNow = () => show(nowH(), '1');
  show(nowH(), '1');
}
// When in the day each habit belongs, for the coloured dot on its row.
const RH_WHEN = [['am', 'Morning'], ['noon', 'Midday'], ['eve', 'Evening'], ['night', 'Night'], ['all', 'All day']];
const RHYTHM_WHY = [
  { ic: 'clock', h: 'Your inner clock', s: 'Light resets it every morning.', w: 'all', ev: 'strong', p: 'Deep in your brain sits a master clock that runs on roughly 24 hours. Every organ, including your ovaries, has its own small clock that follows it. Light reaching special cells in your eyes is the main signal that resets it each day. When light comes at the wrong times (dark mornings indoors, bright screens at night), the clocks drift apart and sleep, mood, appetite and hormones all feel it.' },
  { ic: 'sun', h: 'Morning sun in your eyes', s: '5 to 10 minutes outside after waking.', w: 'am', ev: 'strong', p: 'Daylight in the first hours after waking pulls your clock earlier, so melatonin (your sleep hormone) arrives on time at night. It also strengthens the natural cortisol rise that gives you morning energy. Even a cloudy sky outside is many times brighter than indoor light. 5–10 minutes on a sunny morning, longer when it’s grey. Look towards the sky, never straight into the sun.' },
  { ic: 'spark', h: 'Waking without an alarm', s: 'Regular bed and wake times matter most.', w: 'am', ev: 'some', p: 'An alarm cuts into a sleep cycle, which is why you can wake up groggy. If you can only wake with one, it usually means bedtime is too late for your body. Regular times matter most: going to bed and getting up at similar times each day is linked to better sleep, mood and metabolism. On your period, allow yourself extra rest.' },
  { ic: 'leaf', h: 'Fresh air & a brief walk', s: 'Ten minutes outside counts.', w: 'am', ev: 'some', p: 'Moving gently outside in the morning adds more light, wakes up circulation and lifts mood. A short walk after meals also softens the blood-sugar rise. It doesn’t have to be a workout. Ten minutes counts.' },
  { ic: 'drop', h: 'Lemon water', s: 'Rehydrate gently after the night.', w: 'am', ev: 'emerging', p: 'After 7–8 hours without drinking, your body is a little dry. Warm water with fresh lemon is a gentle way to rehydrate and adds some vitamin C.' },
  { ic: 'sun', h: 'Midday sun & vitamin D', s: 'Short, regular sun without burning.', w: 'noon', ev: 'strong', p: 'Your skin makes vitamin D when the sun is high enough, mostly around midday in spring and summer. Short, regular exposure without burning works best. Your body does store vitamin D, in fat and the liver, so a sunny summer carries you some way into winter. In central and northern Europe the winter sun (about October to March) is too low to make much, so those stores slowly run down and many women are low by late winter. Ask for a blood test if you feel flat in winter.' },
  { ic: 'bowl', h: 'Biggest meal earlier', s: 'Big lunch, lighter and earlier dinner.', w: 'noon', ev: 'some', p: 'Your body handles sugar better earlier in the day. The same meal eaten late at night raises blood sugar more than at lunch. Making lunch your main meal and keeping dinner lighter and earlier supports steady energy and deeper sleep.' },
  { ic: 'moon', h: 'Dim the evening', s: 'Warm, low light after sunset.', w: 'eve', ev: 'strong', p: 'Bright and blue-rich light after dark holds back melatonin and pushes your clock later. Watching the sunset, then switching to warm, low lights and putting screens away tells your body the day is over. Candles and lamps instead of ceiling lights are enough.' },
  { ic: 'moon', h: 'Sleep when you’re tired', s: 'Go at the first wave of tiredness.', w: 'night', ev: 'strong', p: 'Sleep is when your body repairs, growth hormone peaks, the brain clears waste and hunger hormones reset. Short or irregular sleep raises cortisol and cravings and can make cycles less regular. When you feel the first wave of tiredness, go. Pushing past it often brings a “second wind” that keeps you up.' },
  { ic: 'yinyang', h: 'In Chinese medicine', s: 'Active with the light, resting with the dark.', w: 'all', ev: 'tcm', p: 'The day moves from yang (bright, outward, active) at noon to yin (dark, inward, restoring) at night. Rising with the light and resting with the dark keeps the two in balance.' },
];
// Today's sun, drawn as one arc from sunrise to sunset: the travelled part is gold, the sun sits where it is now.
function sunArc(D, h, moon) {
  const W = 320, x0 = 26, x1 = 294, hy = 104, A = 80, day = h >= D.rise && h <= D.set, p = Math.max(0, Math.min(1, (h - D.rise) / (D.set - D.rise)));
  const P = q => [x0 + q * (x1 - x0), hy - Math.sin(q * Math.PI) * A], pts = q => { const o = []; for (let k = 0; k <= 48; k++) o.push(P(k / 48 * q).map(v => v.toFixed(1)).join(',')); return 'M' + o.join(' L'); };
  const full = pts(1), [sx, sy] = P(p), noonX = P((D.noon - D.rise) / (D.set - D.rise))[0];
  return `<div class="rnow-arc"><svg viewBox="0 0 ${W} 136" width="100%" aria-label="${day ? `The sun is ${Math.round(p * 100)}% across today’s sky` : `Night. The sun rises at ${hLabel(D.rise)}`}">
    <defs><radialGradient id="rnow-glow"><stop offset="0" stop-color="#ffd76a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>
      <linearGradient id="rnow-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></linearGradient>
      <clipPath id="rnow-past"><rect x="0" y="0" width="${day ? sx.toFixed(1) : (h > D.set ? W : 0)}" height="${hy}"/></clipPath></defs>
    <path d="${full} L${x1},${hy} L${x0},${hy}Z" fill="url(#rnow-fill)" clip-path="url(#rnow-past)"/>
    <path d="${full}" fill="none" stroke="rgba(48,64,35,.22)" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>
    <path d="${full}" fill="none" stroke="#e9ae3a" stroke-width="3.5" stroke-linecap="round" clip-path="url(#rnow-past)"/>
    <line x1="8" x2="${W - 8}" y1="${hy}" y2="${hy}" stroke="rgba(48,64,35,.28)" stroke-width="1.2"/>
    <line x1="${noonX.toFixed(1)}" x2="${noonX.toFixed(1)}" y1="${hy - A - 6}" y2="${hy}" stroke="rgba(48,64,35,.12)" stroke-dasharray="2 4"/>
    ${day ? `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="24" fill="url(#rnow-glow)" class="rnow-pulse"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="9" fill="#ffcf4d" stroke="#fff" stroke-width="2.5"/>`
      : `<g transform="translate(${(W / 2 - 15)} ${hy - A + 4})" class="rnow-moon">${icon('moon', 30)}</g><text x="${W / 2}" y="${hy - 12}" text-anchor="middle" class="rnow-night">Sun rises at ${hLabel(D.rise)}</text>`}
    <text x="${x0}" y="${hy + 22}" text-anchor="middle" class="rnow-t">Sunrise</text><text x="${x0}" y="${hy + 36}" text-anchor="middle" class="rnow-v">${hLabel(D.rise)}</text>
    <text x="${noonX.toFixed(1)}" y="${hy + 22}" text-anchor="middle" class="rnow-t">Midday</text><text x="${noonX.toFixed(1)}" y="${hy + 36}" text-anchor="middle" class="rnow-v">${hLabel(D.noon)}</text>
    <text x="${x1}" y="${hy + 22}" text-anchor="middle" class="rnow-t">Sunset</text><text x="${x1}" y="${hy + 36}" text-anchor="middle" class="rnow-v">${hLabel(D.set)}</text>
  </svg></div>`;
}
function viewRhythm() {
  const info = M.info, done = doneToday(), lv = rhythmLevel(), streak = rhythmStreak(), r = rem(), D = dayMoments(info), h = nowH(), cur = momentAt(D, h), moon = Z.moonPhase(new Date());
  const week = Array.from({ length: 7 }, (_, i) => { const d = C.addDays(new Date(), i - 6), c = ((state.rhythm || {})[C.iso(d)] || []).length; return `<div class="rw"><i style="height:${Math.max(6, c / RH_GOAL * 100)}%" class="${c >= 4 ? 'ok' : ''}"></i><span>${fmt(d, { weekday: 'narrow' })}</span></div>`; }).join('');
  const span = m => `${hLabel(m.from)}–${hLabel(m.to)}`;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches, i = D.list.indexOf(cur), nx = D.list[(i + 1) % D.list.length];
  return `<section class="rh3">
    <video class="rh3-vid" src="images/sun-moon.mp4" poster="images/sun-moon-poster.webp" muted loop playsinline ${still ? '' : 'autoplay'} preload="auto" aria-hidden="true"></video><span class="rh3-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <div class="rh3-copy">
      <h1 class="rh3-h">Live with the <em>sun</em></h1>
      <p class="rh3-sub">Light sets your inner clock. Follow the sun, and your sleep, mood and hormones follow.</p>
      <div class="rh3-chips"><span>${icon('sun', 14)} Rise <b>${hLabel(D.rise)}</b></span><span>Set <b>${hLabel(D.set)}</b></span></div>
      <button class="rh3-loc" data-action="useGeo">${icon('pin', 15)}<span>${state.profile.geo ? 'Sun times for your location' : `Sun times for ${(() => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(myCountry()); } catch (e) { return 'your country'; } })()}`}</span><b>${state.profile.geo ? 'Update' : 'Use my location'}</b></button>
    </div>
  </section>
  <div class="pad">
    <section class="card rnow">
      <div class="rnow-top"><small>Right now · ${hLabel(h)}</small><b>${cur.n}</b><em>${span(cur)}</em></div>
      ${sunArc(D, h, moon)}
      <p class="rnow-brief">${cur.brief}</p>
      ${cur.acts.length ? `<div class="rnow-do"><h3>Do this now</h3><div class="rh-list">${cur.acts.map(x => rhAct(x, done)).join('')}</div><small class="rnow-tip">Tap each one when it’s done</small></div>`
        : `<div class="rnow-do"><h3>Do this now</h3><p class="rnow-rest">${icon('moon', 16)} Sleep. Nothing to do until the morning light.</p></div>`}
      <div class="rnow-next"><span class="rnow-ni">${emi(nx.g, 18)}</span><div><small>${hLabel(nx.from)}</small><b>${nx.n}</b>${nx.acts[0] ? `<span>${nx.acts[0].t}</span>` : ''}</div></div>
    </section>
    <div class="rh-stats"><div>${rhythmRing(done.length, RH_GOAL)}<small>${done.length} of ${RH_GOAL} today</small></div>
      <div><span>${emi('🔥', 18)}</span><b>${streak} ${streak === 1 ? 'day' : 'days'}</b><small>streak (4+ a day)</small></div>
      <div><span>${emi(lv.cur[1], 18)}</span><b>${lv.cur[2]}</b><small>${lv.next ? `${lv.next[0] - lv.total} to ${lv.next[2]}` : 'Highest level'}</small></div></div>
    ${info ? `<p class="rh-phase">${PHASE_RHYTHM[info.phase]}</p>` : ''}
    ${sectionTitle('Your day')}
    <div class="dmoments">${D.list.map(m => `<section class="dm ${m.id === cur.id ? 'on' : ''} ${m.to <= h && m.id !== 'night' ? 'past' : ''}" data-m="${m.id}">
      <div class="dm-rail"><span>${emi(m.g, 16)}</span></div>
      <div class="dm-body"><div class="dm-h"><b>${m.n}</b><small>${span(m)}</small></div>
        ${m.acts.length ? `<div class="rh-list">${m.acts.map(x => rhAct(x, done)).join('')}</div>` : `<p class="dm-p">${m.brief}</p>`}</div></section>`).join('')}</div>
    ${sectionTitle('Your week')}<section class="card glass"><div class="rh-week">${week}</div></section>
    ${sectionTitle('Gentle reminders')}
    <section class="card glass"><div class="stepper-row"><span>Follow the sun<small>Morning light, midday sun, sunset wind-down, bedtime</small></span><button class="toggle ${r.rhythm ? 'on' : ''}" data-action="remToggle" data-k="rhythm" role="switch" aria-checked="${!!r.rhythm}" aria-label="Follow the sun"><i></i></button></div>
      ${'Notification' in window && Notification.permission === 'default' ? `<button class="btn btn-light btn-block" data-action="remPermission">${icon('spark', 16)} Turn on notifications</button>` : ''}
      <button class="list-btn" data-action="useGeo">${icon('sun', 18)} ${state.profile.geo ? 'Location set · update' : 'Use my exact location for sun times'}</button></section>
    <article class="rh-article">
      <div class="rh-scene" aria-hidden="true"><svg viewBox="0 0 320 150" width="100%"><defs><radialGradient id="rs-sun"><stop offset="0" stop-color="#ffe3a3"/><stop offset=".45" stop-color="#ffc46b" stop-opacity=".55"/><stop offset="1" stop-color="#ff9f5a" stop-opacity="0"/></radialGradient></defs>
        <circle cx="160" cy="92" r="70" fill="url(#rs-sun)"/><circle cx="160" cy="92" r="17" fill="#ffd98a"/>
        <path d="M0 108 L46 78 L80 96 L128 62 L170 94 L214 70 L262 98 L320 74 V150 H0Z" fill="#5a3326" opacity=".85"/>
        <path d="M0 124 L38 104 L92 120 L140 98 L196 122 L248 102 L320 120 V150 H0Z" fill="#3b2019"/>
        <path d="M0 138 L60 124 L120 136 L190 122 L260 136 L320 128 V150 H0Z" fill="#26140f"/></svg></div>
      <div class="eyebrow">The full story · your inner clock</div>
      <h2>Why your body <span>follows the sun</span></h2>
      <p class="rh-art-lead">For almost all of human history, women woke with the light and slept when it got dark. Your body still expects that. Tap one to read why.</p>
      <div class="rhw-key">${RH_WHEN.map(([k, n]) => `<span><i class="rhw-${k}"></i>${n}</span>`).join('')}</div>
      <div class="rhw">${RHYTHM_WHY.map(s => `<details class="rhw-r"><summary><span class="rhw-ic rhw-${s.w}">${icon(s.ic, 18)}</span><span class="rhw-t"><b>${s.h}</b><small>${s.s}</small></span>${icon('chevD', 15)}</summary><p>${s.p}</p></details>`).join('')}</div>
      <div class="rh-art-sum"><b>In short</b><p>Light in the morning, sun at midday, people in the afternoon, dim at sunset, bed when you’re tired. Your body does the rest.</p></div>
    </article>
  </div>`;
}
// Cycle guide phase cards: one line each, and a tiny picture of the whole month's estrogen and progesterone
// with this stage's days lit up, so she sees where it sits before reading anything.
const STAGE_SHORT = { m: 'Both hormones are low and the lining sheds.', f: 'Estrogen climbs and your energy rises.', o: 'Estrogen peaks and the egg is released.', l: 'Progesterone rises, then both drop.' };
function stageSpark([a, b], L, P, col) {
  const W = 112, H = 46, X = d => ((d - 1) / L * W), Y = v => (H - 4 - v / 1 * (H - 10));
  const line = k => { let d = ''; for (let t = 1; t <= L + 1; t += .5) d += `${d ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(C.hormonesAt(t, L, P)[k]).toFixed(1)}`; return d; };
  const id = `fs${a}`;
  return `<svg class="fcg-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><clipPath id="${id}"><rect x="${X(a).toFixed(1)}" y="0" width="${(X(b + 1) - X(a)).toFixed(1)}" height="${H}"/></clipPath></defs>
    <rect x="${X(a).toFixed(1)}" y="0" width="${(X(b + 1) - X(a)).toFixed(1)}" height="${H}" rx="6" fill="${col}" opacity=".28"/>
    <path d="${line('estrogen')}" class="sp-e dim"/><path d="${line('progesterone')}" class="sp-p dim"/>
    <g clip-path="url(#${id})"><path d="${line('estrogen')}" class="sp-e"/><path d="${line('progesterone')}" class="sp-p"/></g>
  </svg>`;
}
// What studies found about real cycles, as four fact tiles: a big number, a small dot graphic and one line.
// The study itself (what was found, who and when) opens under the tile she taps.
const CYCLE_FACT = [
  { n: '1 in 8', k: 'cycles is exactly 28 days', g: [8, 1] },
  { n: '25→45', k: 'between these ages, cycles get a little shorter', g: 'age' },
  { n: '3 in 10', k: 'women have all their fertile days between day 10 and 17', g: [10, 3] },
  { n: '6', u: 'days', k: 'is how long the fertile window lasts', g: 'window' },
];
function factArt(g) {
  if (Array.isArray(g)) return `<span class="cyf-dots">${Array.from({ length: g[0] }, (_, i) => `<i class="${i < g[1] ? 'on' : ''}"></i>`).join('')}</span>`;
  if (g === 'window') return `<span class="cyf-win">${Array.from({ length: 6 }, (_, i) => `<i class="${i === 5 ? 'egg' : ''}"></i>`).join('')}</span>`;
  return `<svg class="cyf-age" viewBox="0 0 80 24" aria-hidden="true"><path d="M4 6 C 30 6, 50 18, 76 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="6" r="3.5"/><circle cx="76" cy="18" r="3.5"/></svg>`;
}
function cycleFacts() {
  const i = ui.cyFact, x = CYCLE_SCIENCE[i];
  return `<div class="cyf">${CYCLE_FACT.map((f, j) => `<button class="cyf-t ${i === j ? 'on' : ''}" data-action="cyFact" data-v="${j}" aria-expanded="${i === j}">
      <b class="dotnum">${f.n}${f.u ? `<small>${f.u}</small>` : ''}</b>${factArt(f.g)}<span>${f.k}</span></button>`).join('')}</div>
    ${x ? `<div class="plr-d cyf-d"><b>${x.t}</b><p>${x.s}</p><small>${x.c}</small></div>` : '<p class="plr-hint">Tap a number for the study behind it</p>'}`;
}
function viewGuide() {
  const info = M.info; if (!info) return viewMissing();
  return `${topbar('Cycle guide', { back: true })}
  <div class="pad"><h1 class="page-h">How your <span>cycle works</span></h1>${fullCycleGuide(info)}
    ${sectionTitle('What studies found')}
    ${cycleFacts()}
    <p class="fine center">Your own days may differ. Log your periods and the app learns your real rhythm.</p></div>`;
}
function bindGuide() {
  document.querySelectorAll('.guide[data-l]').forEach(el => { // only the cycle-guide diagram (star tiles share the class)
    if (!el.querySelector('svg .g-hit')) return;
    const L = +el.dataset.l, P = +el.dataset.p, ov = +el.dataset.ov, cd = +el.dataset.cd;
    const svg = el.querySelector('svg'), hit = svg.querySelector('.g-hit'), mark = svg.querySelector('#g-mark'), lbl = svg.querySelector('#g-mark-t'), read = el.querySelector('#g-read');
    const W = 360, x0 = 6, x1 = W - 6, X = t => x0 + (t - 1) / L * (x1 - x0);
    let last = cd;
    const show = d => {
      if (d === last) return; last = d;
      mark.setAttribute('transform', `translate(${(X(d + .5) - X(cd + .5)).toFixed(1)} 0)`);
      lbl.textContent = d === cd ? `Today · day ${d}` : `Day ${d}`; lbl.setAttribute('text-anchor', d < L * .2 ? 'start' : d > L * .8 ? 'end' : 'middle');
      read.innerHTML = guideRead(d, L, P, ov, cd);
      document.querySelectorAll('.fcg-st').forEach(st => st.classList.toggle('on', d >= +st.dataset.from && d <= +st.dataset.to));
      if (navigator.vibrate) navigator.vibrate(4);
    };
    const at = e => { const r = svg.getBoundingClientRect(); return Math.max(1, Math.min(L, Math.floor(((e.clientX - r.left) / r.width * W - x0) / (x1 - x0) * L) + 1)); };
    hit.addEventListener('pointerdown', e => { hit.setPointerCapture(e.pointerId); show(at(e)); });
    hit.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'mouse') show(at(e)); });
  });
}

// ---------- hormone explainer: small personal tiles, tap one for the full story ----------
// Typical amounts, mapped from the curve model onto standard lab ranges (an estimate for her cycle day, not a lab value).
const H_AMT = { estrogen: ['pg/mL', .12, 30, .95, 300], progesterone: ['ng/mL', .07, .3, .85, 14], lh: ['IU/L', .1, 4, 1.25, 45], fsh: ['IU/L', .08, 2.5, .35, 13], testosterone: ['ng/dL', .06, 20, .13, 40] };
const HX_KEY = { Oestrogen: 'estrogen', Progesterone: 'progesterone', FSH: 'fsh', LH: 'lh', Testosterone: 'testosterone' };
const hAmtV = (k, cd, L, P) => { const [, r0, v0, r1, v1] = H_AMT[k], r = C.hormonesAt(cd, L, P)[k]; return Math.max(v0 * .8, v0 + (r - r0) / (r1 - r0) * (v1 - v0)); };
function hAmount(k, cd, L, P) {
  const u = H_AMT[k][0], v = hAmtV(k, cd, L, P);
  return `${v < 2 ? v.toFixed(1) : v < 20 ? Math.round(v) : Math.round(v / 5) * 5} ${u}`;
}
const LV_WORD = r => C.hormoneLevel(r);
// Where this hormone is for her right now: a 0–1 level, a word, an amount and a short personal line.
function hxNow(x, info) {
  const L = info.L, P = info.P, cd = Math.min(info.cd, L), k = HX_KEY[x.n], ph = info.phase, w = dayWindow(info), h = nowH();
  if (k) {
    const r = C.hormonesRel(cd, L, P)[k], tr = C.hormoneTrend(cd, L, P, k);
    let pk = 1; for (let d = 1; d <= L; d++) if (C.hormonesRel(d, L, P)[k] > C.hormonesRel(pk, L, P)[k]) pk = d;
    const when = Math.abs(pk - cd) <= 1 ? 'At its peak around now' : `Peaks around day ${pk} of your cycle`;
    return { r, word: LV_WORD(r), tr, amt: '≈ ' + hAmount(k, cd, L, P), note: `${{ rising: 'Rising', falling: 'Falling', steady: 'Steady' }[tr]} · ${when}` };
  }
  const D = dayMoments(info), dark = h < D.rise || h > D.set + .5, lat = myGeo()[0], mo = new Date().getMonth();
  switch (x.n) {
    case 'Cortisol': { const r = h < 5 ? .15 : h < 10 ? .95 : h < 14 ? .6 : h < 19 ? .4 : .15; return { r, word: h >= 5 && h < 10 ? 'Morning peak' : r > .5 ? 'Easing' : 'Low', amt: `≈ ${h >= 5 && h < 10 ? '15' : r > .5 ? '10' : r > .3 ? '7' : '3'} µg/dL now`, note: CALM[w][0] === 3 ? 'Stress hits harder today' : 'Follows the sun' }; }
    case 'Melatonin': return { r: dark ? .85 : .08, word: dark ? 'High' : 'Low', amt: dark ? '≈ 50–150 pg/mL' : '< 10 pg/mL', note: dark ? 'Dark outside · sleepy time' : `Rises after sunset ${hm(sunToday().set)}` };
    case 'Insulin': return { r: ph === 'luteal' ? .7 : .4, word: ph === 'luteal' ? 'Less sensitive' : 'Sensitive', amt: 'Fasting 2–10 µIU/mL', note: ph === 'luteal' ? 'Cravings more likely now' : 'Handles carbs well now' };
    case 'Serotonin': { const r = w === 'premenstrual' || w === 'flow-start' ? .3 : ph === 'ovulatory' || ph === 'follicular' ? .8 : .55; return { r, word: r < .4 ? 'Dipping' : r > .7 ? 'Good' : 'Steady', amt: 'Not in blood tests', note: r < .4 ? 'Daylight & protein help' : 'Supported by estrogen' }; }
    case 'Prolactin': return { r: ph === 'luteal' ? .5 : .35, word: ph === 'luteal' ? 'Slightly higher' : 'Normal', amt: 'Typical 5–25 ng/mL', note: 'Higher at night & with stress' };
    case 'Active vitamin D': { const winter = Math.abs(lat) > 35 && (lat > 0 ? (mo >= 9 || mo <= 2) : (mo >= 3 && mo <= 8)); return { r: winter ? .3 : .75, word: winter ? 'Low season' : 'Sun season', amt: 'Aim 30–60 ng/mL', note: winter ? 'Sun too low to make much now' : 'Midday sun makes it now' }; }
    case 'Thyroid hormones': return { r: .5, word: 'Steady', amt: 'TSH 0.5–4 mIU/L', note: 'Same all month' };
    case 'SHBG': return { r: .5, word: 'Steady', amt: 'Typical 20–130 nmol/L', note: 'Calm blood sugar keeps it up' };
    case 'Adrenaline': return { r: .2, word: 'Low at rest', amt: 'Spikes in seconds', note: 'Breathe out long to switch off' };
  }
  return { r: .5, word: '', amt: '', note: '' };
}
const hxArrow = tr => tr === 'rising' ? ' ↗' : tr === 'falling' ? ' ↘' : '';
// Small glowing level ring on each hormone tile (Opal-style bubble).
function hxRing(r, i) { const R = 16, Cc = 2 * Math.PI * R; return `<svg class="hxt-ring" viewBox="0 0 40 40" style="--i:${i}" aria-hidden="true"><circle class="t" cx="20" cy="20" r="${R}"/><circle class="p" cx="20" cy="20" r="${R}" stroke-dasharray="${(Cc * Math.max(.05, Math.min(1, r))).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 20 20)"/></svg>`; }
// Protein hormones drawn as shiny bead chains (amino acids), in the same ball style as the small molecules.
const PB_COL = { a: ['#ffe3ec', '#f29bb5', '#c5607f'], b: ['#efe8ff', '#b9a2e8', '#7d62bf'], g: ['#fff4d6', '#f1c96a', '#bf9530'], v: ['#eaf6df', '#9cc27a', '#5f8a3e'] };
const pbDefs = () => `<defs>${Object.entries(PB_COL).map(([k, [l, m, d]]) => `<radialGradient id="pb-${k}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${l}"/><stop offset=".55" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></radialGradient>`).join('')}</defs>`;
function pbChain(pts, k, r = 5.6) {
  const line = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  return `<path d="${line}" fill="none" stroke="${PB_COL[k][2]}" stroke-opacity=".45" stroke-width="2.2" stroke-linejoin="round"/>${pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r - (i % 3 === 1 ? .8 : 0)).toFixed(1)}" fill="url(#pb-${k})"/>`).join('')}`;
}
const pbRange = (n, f) => Array.from({ length: n }, (_, i) => f(i / (n - 1), i));
const PROT_BALL = {
  Insulin: () => { const A = pbRange(14, t => [-62 + t * 96, -22 + Math.sin(t * Math.PI * 2.2) * 9]), B = pbRange(20, t => [-78 + t * 150, 20 + Math.sin(t * Math.PI * 2.6 + 1) * 11]);
    const br = [[3, 4], [9, 11]].map(([i, j]) => `<line x1="${A[i][0]}" y1="${A[i][1]}" x2="${B[j][0]}" y2="${B[j][1]}" stroke="#e0b24a" stroke-width="3" stroke-dasharray="3 3" stroke-linecap="round"/>`).join('');
    return `${br}${pbChain(A, 'a')}${pbChain(B, 'b')}`; },
  FSH: () => `${pbChain(pbRange(22, t => [-84 + t * 168, Math.sin(t * Math.PI * 3) * 20]), 'a')}${pbChain(pbRange(22, t => [-84 + t * 168, -Math.sin(t * Math.PI * 3) * 20]), 'b')}`,
  LH: () => `${pbChain(pbRange(22, t => [-84 + t * 168, Math.sin(t * Math.PI * 3) * 20]), 'a')}${pbChain(pbRange(22, t => [-84 + t * 168, -Math.sin(t * Math.PI * 3) * 20]), 'g')}`,
  Prolactin: () => pbChain(pbRange(34, t => { const c = Math.min(3, Math.floor(t * 4)), u = t * 4 - c, x = -60 + c * 40 + Math.sin(u * Math.PI * 6) * 7, y = (c % 2 ? 1 : -1) * (-40 + u * 80); return [x, y]; }), 'a'),
  SHBG: () => `${pbChain(pbRange(15, t => { const a = Math.PI * (.62 + t * .76); return [-14 + Math.cos(a) * 46, Math.sin(a) * 40]; }), 'b')}${pbChain(pbRange(15, t => { const a = Math.PI * (-.38 + t * .76); return [14 + Math.cos(a) * 46, Math.sin(a) * 40]; }), 'b')}<circle r="12" fill="url(#pb-v)"/><circle r="12" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`,
};
const protBall = n => PROT_BALL[n] ? `<svg class="molb prot" viewBox="-100 -58 200 116" role="img">${pbDefs()}${PROT_BALL[n]()}</svg>` : '';
// Little drawing for each study, picked from what the study is about.
const STUDY_ART = [
  [/moon|lunar|night|sleep|light/i, '<circle cx="24" cy="24" r="15" fill="#efd4dd"/><path d="M29 12a12 12 0 1 0 7 21A13 13 0 0 1 29 12z" fill="#fff" stroke="#304023" stroke-width="1.6"/><circle cx="36" cy="13" r="1.6" fill="#6c823e"/><circle cx="12" cy="34" r="1.2" fill="#6c823e"/>'],
  [/think|memory|attention|brain|reason|mood|stress/i, '<circle cx="24" cy="24" r="15" fill="#e3ecc9"/><path d="M17 30c-4-1-5-6-2-8-1-4 3-7 6-5 2-3 7-2 7 1 4-1 6 3 4 6 3 2 1 7-3 6-1 3-6 4-8 1-2 2-4 1-4-1z" fill="#fff" stroke="#304023" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 18v12M20 23h3M25 26h4" stroke="#e6b1c4" stroke-width="1.6" stroke-linecap="round"/>'],
  [/measured|lab|blood|level|range|normal|test/i, '<circle cx="24" cy="24" r="15" fill="#efd4dd"/><rect x="14" y="13" width="7" height="22" rx="3.5" fill="#fff" stroke="#304023" stroke-width="1.6"/><rect x="15.6" y="24" width="3.8" height="9.4" rx="1.9" fill="#e6b1c4"/><path d="M26 34V27M30 34V21M34 34V25" stroke="#6c823e" stroke-width="3" stroke-linecap="round"/>'],
  [/pain|cramp|period|bleed/i, '<circle cx="24" cy="24" r="15" fill="#efd4dd"/><path d="M24 13c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" fill="#fff" stroke="#304023" stroke-width="1.6"/><path d="M20 29a4 4 0 0 0 4 4" stroke="#e6b1c4" stroke-width="1.8" stroke-linecap="round" fill="none"/>'],
  [/tea|herb|food|ginger|diet|eat|seed|plant/i, '<circle cx="24" cy="24" r="15" fill="#e3ecc9"/><path d="M15 33c0-11 8-18 19-19-1 11-8 19-19 19z" fill="#fff" stroke="#304023" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 33l12-12" stroke="#6c823e" stroke-width="1.6" stroke-linecap="round"/>'],
  [/partner|women|people|trial|participants|diar/i, '<circle cx="24" cy="24" r="15" fill="#e3ecc9"/><circle cx="19" cy="20" r="4" fill="#fff" stroke="#304023" stroke-width="1.6"/><circle cx="30" cy="20" r="4" fill="#efd4dd" stroke="#304023" stroke-width="1.6"/><path d="M12 33c1-5 4-7 7-7s6 2 7 7M23 33c1-5 4-7 7-7s6 2 7 7" fill="none" stroke="#304023" stroke-width="1.6" stroke-linecap="round"/>'],
];
function studyArt(t) { const a = (STUDY_ART.find(([r]) => r.test(t)) || [0, '<circle cx="24" cy="24" r="15" fill="#efd4dd"/><circle cx="22" cy="22" r="7" fill="#fff" stroke="#304023" stroke-width="1.8"/><path d="M27 27l7 7" stroke="#304023" stroke-width="2.2" stroke-linecap="round"/>'])[1];
  return `<svg class="ts-art" viewBox="6 6 36 36" aria-hidden="true">${a}</svg>`; }
function decorateStudies(v) { v.querySelectorAll('.tea-study .ts-i:not(.has-art)').forEach(el => { el.classList.add('has-art'); el.insertAdjacentHTML('afterbegin', studyArt(el.textContent)); }); }
function viewHormones() {
  const { info } = M; if (!info) return viewToday();
  const r = route(); if (r.id != null && HORMONE_LIBRARY[+r.id]) return viewHormone(+r.id);
  const ph = PHASES[info.phase];
  const tile = (x, i) => { const n = hxNow(x, info); return `<button class="hxt ${n.r > .66 ? 'hi' : n.r < .2 ? 'lo' : ''}" data-action="nav" data-to="hormones/${i}">
      <span class="hxt-g">${x.g}</span><b>${x.n === 'Oestrogen' ? 'Estrogen' : x.n}</b><small class="hxt-s">${x.s}</small>
      ${MOL_BALL[x.n] || PROT_BALL[x.n] ? `<span class="hxt-mol" aria-hidden="true">${MOL_BALL[x.n] || protBall(x.n)}</span>` : hxRing(n.r, i)}
      <span class="hxt-now"><em>${n.word}${hxArrow(n.tr)}</em><span>${n.amt}</span></span></button>`; };
  const cyc = HORMONE_LIBRARY.map((x, i) => [x, i]).filter(([x]) => HX_KEY[x.n]), rest = HORMONE_LIBRARY.map((x, i) => [x, i]).filter(([x]) => !HX_KEY[x.n]);
  return `${topbar('Hormones', { back: true })}
  <div class="pad">
    <h1 class="page-h">The role of <span>your hormones</span></h1>
    <section class="card glass chart-card">${cycleChart(info, { id: 'hx', compact: true })}
      <p class="body sm">Day ${info.cd} · ${ph.name} phase. ${ph.hormones}</p></section>
    ${sectionTitle('Your cycle hormones today')}
    <div class="hx-grid">${cyc.map(([x, i]) => tile(x, i)).join('')}</div>
    ${sectionTitle('Your body’s other messengers')}
    <div class="hx-grid">${rest.map(([x, i]) => tile(x, i)).join('')}</div>
    <p class="fine center">Amounts are typical values for day ${Math.min(info.cd, info.L)} of your ${info.L}-day cycle, based on standard lab ranges. A guide, not your blood test. Labs differ slightly.</p>
  </div>`;
}
// The hormone itself: its skeletal formula (small molecules) or its size (protein hormones).
const PROTEIN_AA = { FSH: 'two chains of 92 and 111', LH: 'two chains of 92 and 121', Prolactin: 'one chain of 199', SHBG: 'two chains of 373', Insulin: 'two chains with 51 in total' };
// Today: every hormone we can draw, as a swipe row of 3D models with what it does and where it is today.
function moleculeRow(info) {
  const list = HORMONE_LIBRARY.map((x, i) => [x, i]).filter(([x]) => MOL_BALL[x.n]);
  return `<div class="mr-row" role="list">${list.map(([x, i]) => { const n = hxNow(x, info);
    return `<button class="mr-c" role="listitem" data-action="nav" data-to="hormones/${i}"><span class="mr-art" aria-hidden="true">${MOL_BALL[x.n]}</span>
      <b>${x.n === 'Oestrogen' ? 'Estrogen' : x.n}</b><small>${x.s}</small><em>${n.word}</em></button>`; }).join('')}</div>`;
}
function moleculeCard(n) {
  const m = MOLECULES[n];
  if (m) { const w = +MOL_BALL[n].match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+)/)[1];
    const key = [['C', 'Carbon', '#3f4340'], ['H', 'Hydrogen', '#e4e6e2'], ['O', 'Oxygen', '#d8261c'], ['N', 'Nitrogen', '#2a45d8'], ['I', 'Iodine', '#8a35b8']].filter(([e]) => new RegExp(e + '(?![a-z])').test(m.f));
    return `<section class="card glass mol-card"><div class="mol-h"><b>The molecule</b><span>${m.name} · ${m.f.replace(/(\d+)/g, '<sub>$1</sub>')}</span></div>
      <div class="mol-art" style="--mw:${Math.round(w * 1.15)}px">${MOL_BALL[n].replace('role="img"', `role="img" aria-label="3D model of ${m.name}"`)}</div>
      <div class="mol-key">${key.map(([, t, c]) => `<span><i style="background:${c}"></i>${t}</span>`).join('')}</div></section>`; }
  return PROTEIN_AA[n] ? `<section class="card glass mol-card"><div class="mol-h"><b>The molecule</b><span>A protein</span></div><p class="mol-p">${n} is built from ${PROTEIN_AA[n]} amino acids, folded into a 3D shape. Far too big to draw as one small picture.</p></section>` : '';
}
function viewHormone(i) {
  const x = HORMONE_LIBRARY[i], info = M.info, n = hxNow(x, info), k = HX_KEY[x.n], u = hormonePhoto(x.n, 800), cr = HORMONE_PHOTOS[x.n];
  const name = x.n === 'Oestrogen' ? 'Estrogen' : x.n, L = info.L, P = info.P, cd = Math.min(info.cd, L);
  // her month for this hormone: a small curve with today marked
  let curve = '';
  if (k) {
    const W = 320, H = 80, X = d => 6 + (d - 1) / L * (W - 12), rel = d => C.hormonesRel(d, L, P)[k], Y = v => H - 10 - v * (H - 22);
    let d_ = ''; for (let t = 1; t <= L; t += .25) d_ += `${d_ ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(rel(t)).toFixed(1)}`;
    const col = (HORMONES.find(h => h.key === k) || FULL_H.find(h => h.key === k) || {}).color || 'hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)';
    curve = `<section class="card glass hxd-curve"><div class="eyebrow">Your month · ${L}-day cycle</div>
      <svg viewBox="0 0 ${W} ${H}" width="100%"><path d="${d_}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="${X(cd)}" x2="${X(cd)}" y1="12" y2="${H - 12}" stroke="#20301a" stroke-dasharray="2 3" opacity=".45"/><circle cx="${X(cd)}" cy="${Y(rel(cd))}" r="5.5" fill="${col}" stroke="#fff" stroke-width="2.5"/>
        <text x="${Math.min(W - 22, Math.max(22, X(cd)))}" y="9" text-anchor="middle" class="pat-ax hxd-today">Today</text>
        <text x="6" y="${H}" class="pat-ax">Day 1</text><text x="${W - 6}" y="${H}" text-anchor="end" class="pat-ax">Day ${L}</text></svg></section>`;
  }
  return `${topbar(name, { back: true })}
  <div class="pad hxd">
    <div class="hxd-top"><div class="hxd-in"><span class="hx-gland">${x.g}</span><h1>${name}</h1><p>${x.s}</p></div>
      ${MOL_BALL[x.n] || PROT_BALL[x.n] ? `<span class="hxd-mol" aria-hidden="true">${MOL_BALL[x.n] || protBall(x.n)}</span>` : ''}</div>
    <section class="card card-light hxd-now"><div class="hxd-nl"><div class="eyebrow dark">You, right now · day ${cd}</div>
      <div class="hxd-row"><b>${n.word}${hxArrow(n.tr)}</b></div><span class="hxd-amt">${n.amt}</span>
      <p>${n.note}</p></div><span class="hxd-ring">${k ? (() => { let pk = 0; for (let d = 1; d <= L; d++) pk = Math.max(pk, hAmtV(k, d, L, P)); const f = Math.min(1, hAmtV(k, cd, L, P) / (pk || 1)); return `${hxRing(f, 0)}<span class="hxd-pct"><b>${Math.max(1, Math.round(100 * f))}%</b><small>of peak</small></span>`; })() : `${hxRing(n.r, 0)}<small>level</small>`}</span></section>
    ${curve}
    ${moleculeCard(x.n)}
    <section class="card glass hxd-b">
      <div class="hx-row first"><span class="eyebrow">What it does</span><p>${x.role}</p></div>
      <div class="hx-row"><span class="eyebrow">In your cycle</span><p>${x.cycle}</p></div>
      <div class="hx-row"><span class="eyebrow">How much is normal</span><p>${x.range}</p></div>
      <div class="hx-row"><span class="eyebrow">Support it ${evBadge(x.ev)}</span><p>${x.support}</p></div>
    </section>
    ${HORMONE_SCIENCE[x.n] ? `${sectionTitle('What studies found')}<section class="card glass tea-study">${HORMONE_SCIENCE[x.n].map(y => `<div class="ts-i"><div class="ts-h"><b>${y.t}</b>${evBadge(y.ev)}</div><p>${y.s}</p><small>${y.c}</small></div>`).join('')}</section>` : ''}
    <div class="hx-next">${HORMONE_LIBRARY.map((y, j) => `<button class="${j === i ? 'on' : ''}" data-action="nav" data-to="hormones/${j}">${y.n === 'Oestrogen' ? 'Estrogen' : y.n}</button>`).join('')}</div>
    <p class="fine center">Typical ranges for adult women; your own lab’s reference values may differ slightly. Not medical advice.</p>
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
const MOVE_SHORT = { lift: 'Lift', hiit: 'HIIT', sport: 'Cardio', pilates: 'Pilates', yoga: 'Yoga', meditate: 'Meditate', walk: 'Walk' };
// Round score bubble (Oura-style): the ring fills with how good today is for that kind of movement.
function moveBubble(m, r, i) {
  const pct = [10, 38, 70, 100][r], R = 27, Cc = 2 * Math.PI * R;
  return `<div class="mv2-b r${r}" style="--i:${i}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * pct / 100).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-ph"><img src="images/tile-${m.k}.webp" alt="" loading="lazy"><i>${icon(MOVE_G[m.k], 12, 2)}</i></span>
    <b>${MOVE_SHORT[m.k]}</b><small>${MV_WORD[r]}</small></div>`;
}
// Move hero graphic: how hard her body wants to train across the month, as a soft wave with today marked.
function moveWave(days, info, L, P) {
  const W = 320, H = 92, x = i => 6 + i / Math.max(1, L - 1) * (W - 12);
  const raw = days.map(w => { const r = MOVE_GUIDE[w].r; return (r.lift + r.hiit + r.sport) / 9; });
  const v = raw.map((_, i) => { let a = 0, n = 0; for (let j = i - 2; j <= i + 2; j++) if (raw[j] != null) { a += raw[j]; n++; } return a / n; }); // smoothed
  const pts = v.map((y, i) => [x(i), 78 - y * 58]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  const ci = Math.min(info.cd, L) - 1, [tx, ty] = pts[ci], ov = C.ovulationDay(L, P);
  const lab = (i, t) => `<span style="left:${(x(i) / W * 100).toFixed(1)}%">${t}</span>`;
  return `<div class="mv3-wave"><div class="mvw-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="mvw-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="mvw-s1"/><stop offset="1" class="mvw-s2"/></linearGradient></defs>
      <path d="${d} L${W - 6} ${H} L6 ${H} Z" fill="url(#mvw-f)"/><path class="mvw-l" d="${d}"/>
      <line class="mvw-now" x1="${tx.toFixed(1)}" y1="${(ty + 6).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${H}"/></svg>
    <i class="mvw-dot" style="left:${(tx / W * 100).toFixed(1)}%;top:${(ty / H * 100).toFixed(1)}%"></i></div>
    <div class="mvw-lab">${lab(0, 'Period')}${lab(ov - 1, 'Peak')}${lab(L - 1, 'Slow')}</div>
    <small class="mvw-k">How hard your body wants to train</small></div>`;
}
// Today's training as a traffic light: Go for it, Go lighter, Skip today; each move a photo chip, tap for what it is.
function moveLights(ranked, g) {
  const bands = [['go', 'Go for it', m => g.r[m.k] >= 2], ['mid', 'Go lighter', m => g.r[m.k] === 1], ['no', 'Skip today', m => g.r[m.k] === 0]];
  return `<section class="ml">${bands.map(([c, t, f]) => { const L = ranked.filter(f); if (!L.length) return '';
    return `<div class="ml-b ${c}"><div class="ml-h"><i></i><b>${t}</b><small>${L.length}</small></div><div class="ml-c">${L.map(m => { const on = ui.mvLi === m.k;
      return `<button class="ml-i ${on ? 'on' : ''}" data-action="mvLi" data-k="${m.k}" aria-expanded="${on}"><img src="images/tile-${m.k}.webp" alt="" loading="lazy"><span><b>${m.n}</b>${on ? `<small>${m.d}</small>` : ''}</span>${g.r[m.k] === 3 ? '<em>Best</em>' : ''}</button>`; }).join('')}</div></div>`; }).join('')}</section>`;
}
function viewMove() {
  const { info } = M, L = info.L, P = info.P, key = dayWindow(info), g = MOVE_GUIDE[key], D = MOVE_DOSE[key], tab = ui.mvTab === 'month' ? 'month' : 'today';
  const days = Array.from({ length: L }, (_, i) => windowAt(i + 1, L, P));
  const ranked = [...MOVES].sort((a, b) => g.r[b.k] - g.r[a.k]);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = tab === 'month'
      ? `<section class="mv2-month">${Object.entries(MOVE_GUIDE).filter(([k]) => days.includes(k)).map(([k, x]) => { const idx = days.map((w, i) => w === k ? i + 1 : 0).filter(Boolean); return `<div class="mv2-w ${k === key ? 'on' : ''}"><span class="mv2-d">${idx[0] === idx[idx.length - 1] ? idx[0] : `${idx[0]}–${idx[idx.length - 1]}`}</span><div><b>${x.title}${k === key ? ' <em>· now</em>' : ''}</b><p>${x.tip}</p></div></div>`; }).join('')}</section>`
      : `<section class="mv2-tip"><span class="eyebrow">Why today</span><p>${g.tip}</p></section>
        <section class="card glass mv-dose"><div class="mvd-k">Your dose today</div>
          ${[['How hard', D.int], ['How long', D.len], ['Warm-up', D.warm], ['Recovery', D.rec]].map(([t, v]) => `<div class="mvd-r"><small>${t}</small><b>${v}</b></div>`).join('')}
          <p class="mvd-f">Feel strong on a rest day? Go for it.</p></section>
        ${moveLights(ranked, g)}`;
  return `<section class="mv2 mv3">
    <video class="mv2-bg" src="images/move-stardust.mp4" poster="images/move-stardust.webp" muted loop playsinline ${still ? '' : 'autoplay'} preload="auto" aria-hidden="true"></video><span class="mv2-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <div class="mv3-sheet">
      <div class="mv3-top"><span class="mv3-day"><small>Day</small><b>${info.cd}</b></span><span class="mv3-ph">${PHASES[info.phase].name}</span></div>
      <h1 class="mv3-h"><span>Today, do</span><em>${ranked[0].n}</em></h1>
      <p class="mv3-now"><span>${icon('bolt', 15)}</span><b>${D.len}</b> · ${D.int.split(':')[0]}${ranked[1] && g.r[ranked[1].k] >= g.r[ranked[0].k] ? ` · or ${ranked[1].n.toLowerCase()}` : ''}</p>
      ${moveWave(days, info, L, P)}
      <div class="mv2-bubbles">${ranked.map((m, i) => moveBubble(m, g.r[m.k], i)).join('')}</div>
    </div>
  </section>
  <div class="pad mv2-body">
    <div class="seg">${[['today', 'Today'], ['month', 'Your month']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="mvTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
    ${trainSafe()}
  </div>`;
}

// ---------- stress: why it hits today and how to bring it down ----------
// Breathing practices, one suited to each part of the cycle. Steps: [type, title, line, ms]; type in|top|hold|out|rest.
const BREATHS = {
  sigh: { name: 'Calm sigh', g: '🫧', when: 'Any time', for: 'Fast calm in one minute', rounds: 5,
    steps: [['in', 'Breathe in', 'Fill up like a soft balloon', 4000], ['top', 'One more sip', 'Just a tiny bit more', 1500], ['out', 'Let it all go', 'Everything can melt away', 8000], ['rest', 'Rest here', 'You are here, and that is enough', 1500]],
    how: [['Breathe in deep', 'Through your nose, until you are almost full.'], ['One more sip', 'A short extra breath in, right on top.'], ['Long breath out', 'Slowly through your mouth, twice as long.']],
    why: 'The second sip opens the tiny air sacs in your lungs again, and the long breath out slows your heart.' },
  belly: { name: 'Warm belly breath', g: '🔥', when: 'Period days', for: 'Softens cramps and tension', rounds: 8,
    steps: [['in', 'Breathe into your hands', 'Let your belly rise under them', 4000], ['out', 'Breathe out slowly', 'Feel the warmth sink in', 6000]],
    how: [['Warm your hands', 'Rub your palms together, then rest them below your navel.'], ['Belly rises', 'Breathe in through your nose for 4, only your belly moves.'], ['Long breath out', 'Out for 6, let your pelvis go soft.']],
    why: 'Slow belly breathing with a longer breath out switches on the rest-and-digest side of the nervous system, which relaxes smooth muscle like the womb. Small trials in women with period pain found deep breathing eased pain. Warm hands add the warmth Chinese medicine loves during the period.' },
  box: { name: 'Box breathing', g: '▢', when: 'Follicular', for: 'Steady focus for new plans', rounds: 6,
    steps: [['in', 'Breathe in', 'Count to four', 4000], ['hold', 'Hold softly', 'Stay full, shoulders down', 4000], ['out', 'Breathe out', 'Count to four', 4000], ['rest', 'Hold empty', 'Calm and still', 4000]],
    how: [['In for 4', 'Through your nose.'], ['Hold for 4', 'Soft, no strain.'], ['Out for 4, hold for 4', 'Then start again. Picture tracing the sides of a square.']],
    why: 'Even counts give a busy, fresh-energy mind a simple rhythm to follow. It is used by pilots and athletes to stay clear under pressure, and suits the follicular phase when you start many new things.' },
  even: { name: 'Even breathing', g: '〰', when: 'Ovulation', for: 'Calm, open and connected', rounds: 8,
    steps: [['in', 'Breathe in', 'Slow and smooth', 5000], ['out', 'Breathe out', 'Just as slow', 5000]],
    how: [['In for 5', 'Smooth, through your nose.'], ['Out for 5', 'The same length, like a gentle wave.'], ['6 breaths a minute', 'Keep going for a few minutes.']],
    why: 'Around 5 to 6 breaths a minute is the rhythm where heart rate and breath fall in step, called resonance breathing. Reviews of heart-rate variability research (Lehrer and Gevirtz 2014) link it to calmer stress responses. A good anchor for bright, social ovulation days.' },
  478: { name: '4-7-8 breathing', g: '💤', when: 'Luteal & before your period', for: 'Quiets a busy mind for sleep', rounds: 4,
    steps: [['in', 'Breathe in', 'Through your nose for four', 4000], ['hold', 'Hold', 'Gently, for seven', 7000], ['out', 'Breathe out', 'Slowly through your mouth for eight', 8000]],
    how: [['In for 4', 'Quietly through your nose.'], ['Hold for 7', 'Gently, with a soft jaw.'], ['Out for 8', 'Slowly through the mouth, with a soft whoosh.']],
    why: 'A very long breath out gives the strongest calming signal, which helps when progesterone falls and sleep gets lighter before your period. Made popular by Dr Andrew Weil. Four rounds are enough to start; skip the hold if it makes you dizzy.' },
};
BREATHS.still = { name: '10 min meditation', g: '🪷', when: 'Any time', for: 'Sit still and let your mind settle', rounds: 60,
  steps: [['in', 'Breathe in', 'Notice the air coming in', 4000], ['out', 'Breathe out', 'Let your thoughts drift past', 6000]],
  how: [['Sit tall', 'On a cushion or a chair, hands on your thighs, eyes closed or soft.'], ['Follow the breath', 'Feel the air at your nose or your belly rising. Nothing to change.'], ['Wander, return', 'Your mind will wander. Each time you notice, come back to the breath. That return is the practice.']],
  why: 'Ten minutes of attention on the breath trains the brain to notice a thought and let it go, instead of following it. Over weeks this lowers everyday stress and makes sleep and mood steadier. Morning, before your phone, is the easiest time to keep it.' };
const BREATH_ORDER = ['still', 'sigh', 'belly', 'box', 'even', '478'];
const BREATH_FOR = { menstrual: 'belly', follicular: 'box', ovulatory: 'even', luteal: '478' };
// a tiny timeline of one breath: in, hold, out and rest as coloured segments
const BZ_WORD = { in: 'In', top: 'Sip', hold: 'Hold', out: 'Out', rest: 'Rest' };
function breathBar(k) {
  const B = BREATHS[k], tot = B.steps.reduce((a, x) => a + x[3], 0), sec = ms => `${+(ms / 1000).toFixed(1)}`.replace(/\.0$/, '');
  return `<span class="bzb">${B.steps.map(([t, , , ms]) => `<i class="${t}" style="flex:${Math.max(ms, 2600)}"><b>${sec(ms)}s</b><small>${t === 'rest' && B.steps.some(x => x[0] === 'hold') ? 'Hold' : BZ_WORD[t]}</small></i>`).join('')}</span><small class="bzb-k">${Math.round(tot / 1000)} s a breath · ${B.rounds} rounds · about ${Math.max(1, Math.round(tot * B.rounds / 60000))} min</small>`;
}
// One breath as a wave: the curve rises as the lungs fill, stays flat on a hold, falls on the long breath out.
// x is real time, so a longer breath out is a longer slope; a dot rides the curve at the real pace.
const BZ_WHEN = { still: 'Morning, before you pick up your phone', sigh: 'When stress spikes, 1 to 3 breaths already help', belly: 'Lying down, a warm pad on your belly', box: 'Before a big talk or a new task', even: '5 minutes in the afternoon slump', 478: 'In bed, lights off' };
function breathWave(k) {
  const B = BREATHS[k], tot = B.steps.reduce((a, x) => a + x[3], 0), W = 300, LO = 74, HI = 18, sec = ms => `${+(ms / 1000).toFixed(1)}`.replace(/\.0$/, '');
  const hasTop = B.steps.some(x => x[0] === 'top');
  let x = 0, y = LO; const seg = B.steps.map(([t, , , ms]) => { const x0 = x, y0 = y; x += ms / tot * W; y = t === 'in' ? (hasTop ? HI + 10 : HI) : t === 'top' ? HI - 4 : t === 'out' ? LO : y; return { t, ms, x0, y0, x1: x, y1: y }; });
  const d = `M0 ${LO} ` + seg.map(g => { const h = (g.x1 - g.x0) / 2; return `C${(g.x0 + h).toFixed(1)} ${g.y0} ${(g.x1 - h).toFixed(1)} ${g.y1} ${g.x1.toFixed(1)} ${g.y1}`; }).join(' ');
  const kt = [0, ...seg.map(g => (g.x1 / W).toFixed(4))].join(';'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const word = t => t === 'rest' && B.steps.some(z => z[0] === 'hold') ? 'Hold' : BZ_WORD[t];
  return `<div class="bzw"><svg viewBox="-6 6 312 80" role="img" aria-label="One breath: ${seg.map(g => `${word(g.t).toLowerCase()} ${sec(g.ms)} seconds`).join(', ')}">
      <path d="${d} L${W} 84 L0 84Z" class="bzw-a"/>
      ${seg.slice(1).map(g => `<line x1="${g.x0.toFixed(1)}" x2="${g.x0.toFixed(1)}" y1="10" y2="84" class="bzw-div"/>`).join('')}
      ${seg.map(g => `<rect x="${(g.x0 + 1).toFixed(1)}" y="80" width="${Math.max(2, g.x1 - g.x0 - 2).toFixed(1)}" height="5" rx="2.5" class="bzw-g ${g.t}"/>`).join('')}
      <path d="${d}" class="bzw-l"/>
      <circle r="6" cx="0" cy="${LO}" class="bzw-dot">${still ? '' : `<animate attributeName="cx" dur="${tot}ms" repeatCount="indefinite" values="${[0, ...seg.map(g => g.x1.toFixed(1))].join(';')}" keyTimes="${kt}"/><animate attributeName="cy" dur="${tot}ms" repeatCount="indefinite" values="${[LO, ...seg.map(g => g.y1)].join(';')}" keyTimes="${kt}" calcMode="spline" keySplines="${seg.map(() => '.5 0 .5 1').join(';')}"/>`}</circle>
    </svg>
    <div class="bzw-k">${seg.map(g => `<span class="${g.t}" style="flex:${g.ms}"><b>${sec(g.ms)}s</b><small>${word(g.t)}</small></span>`).join('')}</div>
    <small class="bzb-k">${Math.round(tot / 1000)} s a breath · ${B.rounds} rounds · about ${Math.max(1, Math.round(tot * B.rounds / 60000))} min</small></div>`;
}
// What each practice does most, as 1 to 3 dots, plus the study behind it.
const BZ_FX = { still: [3, 3, 2, 1], sigh: [3, 2, 2, 1], belly: [2, 1, 2, 3], box: [2, 3, 1, 1], even: [3, 2, 2, 1], 478: [3, 1, 3, 1] };
const BZ_STUDY = {
  still: ['A review of 47 trials found that about eight weeks of mindfulness meditation eased anxiety, low mood and pain.', 'Goyal 2014 (JAMA Internal Medicine)'],
  sigh: ['Five minutes a day of cyclic sighing lifted mood and slowed resting breathing more than mindfulness meditation did.', 'Balban 2023 (Cell Reports Medicine)'],
  belly: ['A review of slow-breathing studies found it turns up the calming rest-and-digest side of the nervous system and lowers anxiety.', 'Zaccaro 2018 (review)'],
  box: ['In the same Stanford trial as the calm sigh, box breathing also lifted mood and eased anxiety day by day.', 'Balban 2023 (Cell Reports Medicine)'],
  even: ['Breathing at about six breaths a minute raised heart-rate variability, a sign of a calmer, more flexible stress response.', 'Lehrer & Gevirtz 2014 (review)'],
  478: ['In young adults short on sleep, a few minutes of 4-7-8 breathing raised heart-rate variability and eased blood pressure.', 'Vierra 2022 (Heliyon)'],
};
function breathFx(k) {
  const v = BZ_FX[k] || BZ_FX.sigh;
  return `<div class="bzfx">${[['Calm', 'leaf'], ['Focus', 'spark'], ['Sleep', 'moon'], ['Cramps', 'drop']].map(([t, ic], i) => `<div class="bzfx-i ${v[i] === 3 ? 'top' : ''}"><span>${icon(ic, 15)}</span><small>${t}</small><i>${[1, 2, 3].map(n => `<b class="${n <= v[i] ? 'on' : ''}"></b>`).join('')}</i></div>`).join('')}</div>`;
}
// Calm sigh: a deep breath in to almost full, one more short sip on top, then a long slow breath out.
// one breath drawn as its shape: rises on the breath in, flat on a hold, falls on the breath out
function breathShape(B, col) {
  const hasHold = B.steps.some(x => x[0] === 'hold'), st = [];
  B.steps.forEach(([k, , , ms]) => { if (k === 'top' && st.length) st[st.length - 1][1] += ms; else st.push([k === 'rest' && hasHold ? 'hold' : k, ms]); });
  const tot = st.reduce((n, x) => n + x[1], 0), W = 140, Hh = 34, top = 5, bot = Hh - 3;
  let x = 2, y = bot, segs = '';
  st.forEach(([k, ms]) => { const w = (W - 4) * ms / tot, y2 = k === 'in' ? top : k === 'out' ? bot : y;
    segs += `<path d="M${x.toFixed(1)} ${y} L${(x + w).toFixed(1)} ${y2}" class="bs-${k}" ${k === 'in' ? `style="stroke:${col}"` : ''}/>`; x += w; y = y2; });
  return `<span class="bsh" aria-hidden="true"><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${segs}</svg>
    <span class="bsh-l">${st.map(([k, ms]) => `<i style="flex:${ms}"><b>${{ in: 'In', out: 'Out', hold: 'Hold', rest: 'Rest' }[k]}</b> ${+(ms / 1000).toFixed(1)}</i>`).join('')}</span></span>`;
}
// What each breath does: one card per practice, her phase's breath first
const BZ_DOES = { still: 'Trains your mind to notice a thought and let it go. Calmer days and deeper sleep.', sigh: 'The fastest way to calm down. One or two sighs slow your heart within seconds.', belly: 'Relaxes your belly and womb, so cramps and tension soften.', box: 'Gives a busy mind a steady rhythm, so you stay clear under pressure.', even: 'Brings your heart and breath into step. You feel calm and open.', 478: 'The long breath out tells your body it is safe to fall asleep.' };
const BZ_COL = { still: '#6c823e', sigh: '#5f93a8', belly: '#d9768f', box: '#6c823e', even: '#c99327', 478: '#8f79bd' };
function breathGuide(phase, k) {
  const mine = BREATH_FOR[phase], order = [mine, ...BREATH_ORDER.filter(x => x !== mine)];
  const FX = [['Calm', 'leaf'], ['Focus', 'spark'], ['Sleep', 'moon'], ['Cramps', 'drop']];
  return `${sectionTitle('What each breath does')}
    <div class="bwx">${order.map(id => { const B = BREATHS[id], col = BZ_COL[id] || '#6c823e', fx = BZ_FX[id] || [];
      return `<article class="bwx-c ${id === k ? 'on' : ''}" style="--c:${col}">
        <div class="bwx-h"><span class="bwx-g">${B.g}</span><div><b>${B.name}</b><small>${B.for}</small></div>${id === mine ? '<em>For you now</em>' : ''}</div>
        <div class="bwx-art">${breathShape(B, col)}</div>
        <p class="bwx-does">${BZ_DOES[id] || B.for}</p>
        <div class="bwx-tags">${FX.filter((_, i) => fx[i] === 3).map(([t, ic]) => `<span>${icon(ic, 12)} ${t}</span>`).join('')}<span class="w">${icon('clock', 12)} ${BZ_WHEN[id] || B.when}</span></div>
        <div class="bwx-f"><details class="bwx-more"><summary>How to do it ${icon('chevD', 13)}</summary>
            ${B.how.map(([t, p], i) => `<div class="bz-step"><span>${i + 1}</span><div><b>${t}</b><p>${p}</p></div></div>`).join('')}
            ${BZ_STUDY[id] ? `<div class="bz-study">${studyCards(...BZ_STUDY[id])}</div>` : ''}</details>
          <button class="bwx-go" data-action="bzPhase" data-v="${id}">${id === k ? 'In the player' : `${icon('play', 12)} Try it`}</button></div>
      </article>`; }).join('')}</div>`;
}
// her breath this week: one dot for each day she finished a full session (breathing or the still sit)
function breathWeek() {
  const L = state.breathLog || {}, t = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => C.addDays(new Date(), i - 6)), n = days.filter(d => L[C.iso(d)]).length;
  return `<div class="bwk" aria-label="You breathed on ${n} of the last 7 days"><div class="bwk-h"><small>Breathed this week</small><b><span class="dotnum">${n}</span> of 7 days</b></div>
    <div class="bwk-d">${days.map(d => { const k = C.iso(d), v = L[k] || 0; return `<span class="${k === t ? 'now' : ''} ${v ? 'on' : ''}"><i>${v > 1 ? `<em class="dotnum">${Math.min(v, 9)}</em>` : ''}</i><small>${fmt(d, { weekday: 'narrow' })}</small></span>`; }).join('')}</div></div>`;
}
// Breathe page: the daily calm reminder, a bell with her time and a switch; stressed days get an extra nudge
function calmRemCard() {
  const r = rem(), st = M.info ? stressToday(M.info) : 0, h = r.calmHour, hh = h % 12 || 12, ap = h < 12 ? 'am' : 'pm';
  // the whole top row is the switch, so she can tap anywhere on it
  return `<section class="crm2 ${r.calm ? 'on' : ''}">
    <button class="crm2-top" data-action="calmRem" role="switch" aria-checked="${r.calm}" aria-label="Daily calm reminder">
      <span class="crm2-ic">${icon('bell', 20)}</span>
      <span class="crm2-t"><b>Daily calm</b><small>${r.calm ? `On · a nudge to breathe at ${hr12(h)}` : 'Off · tap to turn on'}</small></span>
      <span class="crm2-sw" aria-hidden="true"><i>${r.calm ? icon('check', 14, 2.6) : ''}</i></span></button>
    ${r.calm ? `<div class="crm2-time">
        <button data-action="remCalmHour" data-d="-1" aria-label="One hour earlier">−</button>
        <span class="crm2-clock"><b class="dotnum">${hh}:00</b><em>${ap}</em><small>every day</small></span>
        <button data-action="remCalmHour" data-d="1" aria-label="One hour later">+</button></div>
      <p class="crm2-also"><span>⚡</span>And right away when you log stress${st ? `<em>${st === 2 ? 'Stressed today' : 'High-stress day'}</em>` : ''}</p>`
    : `<p class="crm2-off">A gentle nudge every evening to breathe for a few minutes, and sooner on stressed days.</p>`}
  </section>`;
}
function breathDone() {
  const L = state.breathLog = state.breathLog || {}, t = todayISO(); L[t] = (L[t] || 0) + 1;
  // keep only the last 60 days
  const cut = C.iso(C.addDays(new Date(), -60)); Object.keys(L).forEach(k => { if (k < cut) delete L[k]; });
  save();
  const w = document.querySelector('.bwk'); if (w) w.outerHTML = breathWeek();
}
// A quote for each day, chosen for where she is in her cycle: three per part of the cycle, turning daily.
// Public-domain sources and translations only (Legge, Müller, Gummere, Long, KJV, 19th-century writers).
const DAY_QUOTES = {
  'flow-start': [['Rest is not idleness.', 'John Lubbock, The Use of Life'], ['Let it be still, and it will gradually become clear.', 'Lao Tzu, Tao Te Ching'], ['To every thing there is a season, and a time to every purpose under the heaven.', 'Ecclesiastes 3:1']],
  'flow-end': ['“Hope” is the thing with feathers that perches in the soul.', 'I exist as I am, that is enough.', 'The past is already gone and the future has not yet come. See clearly what is here, now.'].map((t, i) => [t, ['Emily Dickinson', 'Walt Whitman, Song of Myself', 'The Buddha, from the Bhaddekaratta Sutta'][i]]),
  rising: [['The journey of a thousand li commences with a single step.', 'Lao Tzu, Tao Te Ching'], ['Begin at once to live, and count each separate day as a separate life.', 'Seneca, Letters to Lucilius'], ['I dwell in Possibility.', 'Emily Dickinson']],
  building: [['The mountains are calling and I must go.', 'John Muir'], ['Write it on your heart that every day is the best day in the year.', 'Ralph Waldo Emerson'], ['Live in each season as it passes; breathe the air, drink the drink, taste the fruit.', 'Henry David Thoreau, Journal']],
  peak: [['I celebrate myself, and sing myself.', 'Walt Whitman, Song of Myself'], ['Nature always wears the colors of the spirit.', 'Ralph Waldo Emerson, Nature'], ['A time to keep silence, and a time to speak.', 'Ecclesiastes 3:7']],
  settle: [['In every walk with nature one receives far more than he seeks.', 'John Muir'], ['Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.', 'Marcus Aurelius, Meditations'], ['The past is already gone and the future has not yet come. See clearly what is here, now.', 'The Buddha, from the Bhaddekaratta Sutta']],
  focus: [['All that we are is the result of what we have thought.', 'The Dhammapada'], ['Everywhere means nowhere.', 'Seneca, Letters to Lucilius'], ['I went to the woods because I wished to live deliberately.', 'Henry David Thoreau, Walden']],
  premenstrual: [['We suffer more from imagination than from reality.', 'Seneca, Letters to Lucilius'], ['I exist as I am, that is enough.', 'Walt Whitman, Song of Myself'], ['Let it be still, and it will gradually become clear.', 'Lao Tzu, Tao Te Ching']],
};
function dayQuote() {
  const w = M.info ? dayWindow(M.info) : 'settle', list = DAY_QUOTES[w] || DAY_QUOTES.settle;
  const n = Math.floor((C.parseISO(todayISO()) - new Date(2026, 0, 1)) / 864e5);
  const [t, by] = list[((n % list.length) + list.length) % list.length], lab = (TEA_WIN.find(x => x[0] === w) || [, ''])[1];
  return `<figure class="bz-quote">${lab ? `<small class="bzq-k">Today’s words · ${lab}</small>` : ''}<span>“</span><blockquote>${t}</blockquote><figcaption>${by}</figcaption></figure>`;
}
function viewBreathe(from) {
  const phase = M.info && M.info.phase, rec = BREATH_FOR[phase] || 'sigh', k = BREATHS[ui.bzK] ? ui.bzK : rec, B = BREATHS[k];
  return `${topbar('Breathe', { back: true })}
  <div class="pad bz-pad">
    <h1 class="bz-title"><small>A minute for you</small>Come back to<em>your breath</em></h1>
    <div class="bzp" role="tablist" aria-label="Choose a breathing practice">${[rec, ...BREATH_ORDER.filter(x => x !== rec)].map(x => `<button class="bzp-o ${x === k ? 'on' : ''}" role="tab" aria-selected="${x === k}" data-action="bzPick" data-v="${x}">
      ${x === rec ? `<em>${phase ? 'For your phase' : 'Start here'}</em>` : ''}<span class="bzp-g">${BREATHS[x].g}</span><b>${BREATHS[x].name}</b><small>${BREATHS[x].when}</small></button>`).join('')}</div>
    <section class="bz" data-pat="${k}">
      <div class="bz-stage"><div class="bz-card-h"><span><small>${k === rec ? (phase ? 'For your phase' : 'Start here') : B.when}</small><b>${B.name}</b></span><span class="bz-n"></span></div>
        <svg class="bz-lotus" viewBox="-110 -120 220 170" aria-hidden="true">
          <defs><linearGradient id="lpA" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#efd4dd"/><stop offset="1" stop-color="#fff"/></linearGradient>
            <linearGradient id="lpB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e6a3bb"/><stop offset=".7" stop-color="#f6d6e1"/><stop offset="1" stop-color="#fff"/></linearGradient>
            <radialGradient id="lpC"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f3c45a" stop-opacity="0"/></radialGradient></defs>
          <g class="lt-water"><ellipse cx="0" cy="22" rx="96" ry="12"/><ellipse cx="0" cy="22" rx="66" ry="8"/></g>
          <path class="lt-pad" d="M-14 14 C -60 2, -102 10, -96 22 C -90 32, -40 34, -6 24 Z"/><path class="lt-pad" d="M14 14 C 60 2, 102 10, 96 22 C 90 32, 40 34, 6 24 Z"/>
          <circle class="lt-glow" cx="0" cy="-26" r="34" fill="url(#lpC)"/>
          ${[-78, 78, -54, 54, -28, 28, 0].map(t => `<path class="lt-p back" style="--t:${t}deg" d="M0 8 C -20 -18 -18 -62 0 -86 C 18 -62 20 -18 0 8 Z" fill="url(#lpA)"/>`).join('')}
          ${[-46, 46, -18, 18].map(t => `<path class="lt-p front" style="--t:${t}deg" d="M0 10 C -17 -12 -15 -52 0 -70 C 15 -52 17 -12 0 10 Z" fill="url(#lpB)"/>`).join('')}
          <path class="lt-p bud" d="M0 12 C -15 -8 -13 -42 0 -58 C 13 -42 15 -8 0 12 Z" fill="url(#lpB)"/>
        </svg>
        ${k === 'still' ? `<div class="bz-num md"><b class="bz-big dotnum" role="timer">10:00</b><small class="bz-word">minutes, then a soft bell</small></div>
        <div class="md-bar" aria-hidden="true"><i></i></div>
        <button class="md-hear" type="button">${icon('bell', 14)} Hear the bell</button>` : `<div class="bz-num"><b class="bz-big dotnum">${Math.round(B.steps.reduce((a, x) => a + x[3], 0) / 1000)}</b><small class="bz-word">seconds a breath</small></div>
        <div class="bz-rings" aria-hidden="true">${B.steps.map(([t, , , ms], i) => `<span class="bzr ${t}" style="--p:0"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="bzr-p" cx="22" cy="22" r="19" pathLength="100"/></svg><b>${+(ms / 1000).toFixed(1)}</b><small>${t === 'rest' && B.steps.some(x => x[0] === 'hold') ? 'Hold' : BZ_WORD[t]}</small></span>`).join('')}</div>`}
        <button class="bz-go">Start</button></div>
      <div class="bz-txt"><b class="bz-t">Let that shi go</b><small class="bz-s">Soften your shoulders and your jaw</small></div>
      <div class="bz-pal">
        <svg class="bz-pet" viewBox="0 0 120 100" aria-hidden="true"><g class="bz-pet-b">
          <path d="M22 86 C14 60 26 34 60 34 C94 34 106 60 98 86 Z" fill="#fff" stroke="#304023" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M34 42 L30 22 L48 34 M86 42 L90 22 L72 34" fill="#fff" stroke="#304023" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M35 33 L33 27 L40 31 M85 33 L87 27 L80 31" fill="#f4a9bf"/>
          <path d="M44 60 q6 5 12 0 M64 60 q6 5 12 0" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M57 68 q3 3 6 0" fill="none" stroke="#304023" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="38" cy="69" rx="6" ry="3.6" fill="#f4a9bf"/><ellipse cx="82" cy="69" rx="6" ry="3.6" fill="#f4a9bf"/>
          <path d="M98 80 q16 -2 12 -18" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/></g>
          <path class="bz-z" d="M100 14 h8 l-8 8 h8" fill="none" stroke="#8c9768" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p class="bz-say">Stay in the present.</p>
      </div>
    </section>
    ${breathWeek()}
    ${calmRemCard()}
    ${from === 'stress' && M.info ? cortisolSec(M.info) : ''}
    ${breathGuide(phase, k)}
    ${dayQuote()}
  </div>`;
}
const SIGH = [['in', 'Breathe in', 'Fill up like a soft balloon', 4000], ['top', 'One more sip', 'Just a tiny bit more', 1500], ['out', 'Let it all go', 'Everything can melt away', 8000], ['rest', 'Rest here', 'You are here, and that is enough', 1500]];
const PET_SAY = { in: 'Breathe in, slowly.', top: 'A little more…', hold: 'Hold it softly…', out: 'Let it go.', rest: 'Stay in the present.' };
// A soft singing-bowl bell, made in the browser (no sound file): a few bowl-like partials, each a slightly
// detuned pair so it shimmers, struck twice and left to fade. Returns the oscillators so a pause can cancel it.
let _bell = null;
function bellCtx() { try { _bell = _bell || new (window.AudioContext || window.webkitAudioContext)(); if (_bell.state === 'suspended') _bell.resume(); return _bell; } catch { return null; } }
function ringBell(ctx, t, vol = 1, once = false) {
  const out = [], f0 = 220, P = [[1, 1, 9], [2.71, .45, 6], [5.15, .2, 3.5], [8.4, .08, 2.2]];
  (once ? [[0, 1]] : [[0, 1], [5, .55]]).forEach(([dt, m]) => P.forEach(([r, a, dec]) => [1, 1.004].forEach(det => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t0 = t + dt;
    o.type = 'sine'; o.frequency.value = f0 * r * det;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.11 * a * m * vol, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + dec);
    o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dec + .1); out.push(o);
  })));
  return out;
}
// 10 minute meditation: just a quiet countdown on the pond card, a bell at the end. The bell is scheduled on the
// audio clock when she starts, so it rings on time even if the page is in the background; the screen is kept awake.
function mountMeditate(el) {
  const big = el.querySelector('.bz-big'), word = el.querySelector('.bz-word'), btn = el.querySelector('.bz-go'), bar = el.querySelector('.md-bar i'), hear = el.querySelector('.md-hear'), say = el.querySelector('.bz-say');
  const TOTAL = 600000; let left = TOTAL, endAt = 0, iv = 0, nodes = [], lock = null, st = 'idle';
  el.style.setProperty('--b', .7);
  const fmt = ms => { const x = Math.ceil(ms / 1000); return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`; };
  const show = () => { big.textContent = fmt(left); bar.style.width = `${((1 - left / TOTAL) * 100).toFixed(2)}%`; };
  const unring = () => { nodes.forEach(n => { try { n.stop(); } catch {} }); nodes = []; };
  const release = () => { try { lock && lock.release(); } catch {} lock = null; };
  function finish() { clearInterval(iv); st = 'done'; breathDone(); left = 0; show(); navigator.vibrate?.([180, 120, 180]); btn.textContent = 'Again'; word.textContent = 'Well done. Notice how you feel.'; if (say) say.textContent = 'You did so well.'; el.dataset.ph = ''; release(); }
  const tick = () => { left = Math.max(0, endAt - performance.now()); show(); if (left <= 0) finish(); };
  function start() {
    if (st === 'done') left = TOTAL;
    const ctx = bellCtx(); unring(); if (ctx) nodes = ringBell(ctx, ctx.currentTime + left / 1000);
    endAt = performance.now() + left; clearInterval(iv); iv = setInterval(tick, 250); st = 'run'; show();
    btn.textContent = 'Pause'; word.textContent = 'Eyes soft, follow your breath'; if (say) say.textContent = 'Stay in the present.'; el.dataset.ph = 'still';
    navigator.wakeLock?.request('screen').then(l => { lock = l; }).catch(() => {});
  }
  function pause() { left = Math.max(0, endAt - performance.now()); clearInterval(iv); unring(); release(); st = 'pause'; show(); btn.textContent = 'Resume'; word.textContent = 'Paused. Take your time.'; el.dataset.ph = ''; }
  const go = () => (st === 'run' ? pause() : start());
  const hearIt = () => { const ctx = bellCtx(); if (ctx) ringBell(ctx, ctx.currentTime + .05, .8, true); };
  btn.addEventListener('click', go); hear && hear.addEventListener('click', hearIt);
  show();
  return () => { clearInterval(iv); unring(); release(); btn.removeEventListener('click', go); hear && hear.removeEventListener('click', hearIt); };
}
function mountBreath(el) {
  const ball = el.querySelector('.bz-ball'), txt = el.querySelector('.bz-txt'), t = el.querySelector('.bz-t'), sub = el.querySelector('.bz-s'), cnt = el.querySelector('.bz-n'), btn = el.querySelector('.bz-go'), say = el.querySelector('.bz-say');
  const pk = document.querySelector('.bzp'), on = pk && pk.querySelector('.on'); if (on) pk.scrollLeft = Math.max(0, on.offsetLeft - 16); // keep her pick in view
  if (el.dataset.pat === 'still') return mountMeditate(el);
  const B = BREATHS[el.dataset.pat] || BREATHS.sigh, STEPS = B.steps, ROUNDS = B.rounds, CYC = STEPS.reduce((a, x) => a + x[3], 0);
  const big = el.querySelector('.bz-big'), word = el.querySelector('.bz-word'), rings = [...el.querySelectorAll('.bzr')], still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) el.style.setProperty('--b', .5);
  // scale of the lotus at the start and end of each step: in opens, the sip opens a touch more, holds stay, out closes
  let lv = .42; const SC = STEPS.map(([k]) => { const s0 = lv; lv = k === 'in' ? (STEPS.some(x => x[0] === 'top') ? .98 : 1.06) : k === 'top' ? 1.1 : k === 'out' ? .42 : lv; return [s0, lv]; });
  const ease = x => .5 - Math.cos(Math.PI * x) / 2;
  let raf = 0, t0 = 0, run = false;
  const swap = (a, b, w) => { t.textContent = a; sub.textContent = b; say.textContent = w; txt.classList.remove('sw'); say.classList.remove('sw'); void txt.offsetWidth; txt.classList.add('sw'); say.classList.add('sw'); };
  function frame(now) {
    const e = now - t0, round = Math.floor(e / CYC);
    if (round >= ROUNDS) { breathDone(); return stop(true); }
    let m = e % CYC, i = 0; while (m >= STEPS[i][3]) { m -= STEPS[i][3]; i++; }
    const [k, a, b, ms] = STEPS[i], [s0, s1] = SC[i], sc = s0 + (s1 - s0) * ease(m / ms);
    if (!still) el.style.setProperty('--b', ((sc - .42) / .68).toFixed(3));
    const left = String(Math.max(1, Math.ceil((ms - m) / 1000))); if (big.textContent !== left) big.textContent = left;
    rings.forEach((r, j) => r.style.setProperty('--p', j < i ? 1 : j === i ? (m / ms).toFixed(3) : 0));
    const ph = k + i; if (el.dataset.st !== ph) { el.dataset.st = ph; el.dataset.ph = k; swap(a, b, PET_SAY[k]); word.textContent = a; rings.forEach((r, j) => r.classList.toggle('on', j === i)); }
    cnt.textContent = `${round + 1} of ${ROUNDS}`;
    raf = requestAnimationFrame(frame);
  }
  function stop(done) {
    run = false; cancelAnimationFrame(raf); el.dataset.ph = ''; el.dataset.st = ''; el.style.setProperty('--b', still ? .5 : 0); el.style.setProperty('--sp', 0);
    big.textContent = String(Math.round(CYC / 1000)); word.textContent = 'seconds a breath'; rings.forEach(r => { r.style.setProperty('--p', 0); r.classList.remove('on'); });
    swap(done ? 'So proud of you' : 'Let that shi go', done ? 'Notice how soft you feel now' : 'Soften your shoulders and your jaw', done ? 'You did so well. Let it go.' : 'Stay in the present.');
    cnt.textContent = ''; btn.textContent = done ? 'Again' : 'Start';
  }
  const go = () => { if (run) return stop(false); run = true; btn.textContent = 'Stop'; t0 = performance.now(); raf = requestAnimationFrame(frame); };
  btn.addEventListener('click', go);
  return () => { cancelAnimationFrame(raf); btn.removeEventListener('click', go); };
}
function viewStress() {
  const { info } = M, w = dayWindow(info), [lvl, calm] = CALM[w], sp = STRESS_PLAN[w], st = STRETCH[w], md = MEDITATE[w], tab = ui.stTab || 'calm';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches, auto = still ? '' : 'autoplay';
  const steps = l => `<div class="st2-steps">${l.map((t, i) => `<div class="st2-step"><span>${i + 1}</span><p>${t}</p></div>`).join('')}</div>`;
  const body = tab === 'meditate'
    ? `<section class="st2-card"><span class="eyebrow">Meditate today</span><h3>${md[0]}</h3><p class="st2-sub">${md[1]}</p>${steps(md[2])}${evBadge('some')}</section>`
    : tab === 'stretch'
      ? `<section class="st2-card"><span class="eyebrow">Stretch today</span><h3>${st[0]}</h3><p class="st2-sub">${st[1]}</p>${steps(st[2])}${evBadge('some')}</section>`
      : `<button class="bz-cta" data-action="nav" data-to="breathe"><i class="bz-mini"></i><span><b>Breathe with me</b><small>${((info && BREATHS[BREATH_FOR[info.phase]]) || BREATHS.sigh).name}${info ? " · for your phase" : ""}</small></span>${icon('chevR', 16)}</button>${groundCta()}
        <section class="st2-why"><span class="eyebrow">Why today</span><p>${sp[0]}</p><p class="st2-calm">${calm}</p></section>
        <section class="st2-breathe"><video src="images/stress-breathe.mp4" poster="images/stress-breathe.webp" muted loop playsinline ${auto} preload="metadata" aria-hidden="true"></video><span class="st2-bshade"></span>
          <div class="st2-bin"><span class="eyebrow">Fastest calm · 5 min</span><div class="st2-orb" aria-hidden="true"><i></i><b class="in">Breathe in</b><b class="out">Breathe out</b></div>
          <p>In through your nose for 4, out slowly for 6. A longer exhale calms your nervous system.</p>${evBadge('some')}</div></section>
        <h3 class="st2-h">Best ways to lower it</h3>${steps(sp[1])}
        <h3 class="st2-h">The science of calm</h3>
        <section class="card glass cs-list">${CALM_SCIENCE.map(x => `<details class="cs"><summary><span class="cs-g">${x.g}</span><span class="cs-t"><b>${x.t}</b><small>${x.c.replace(/\s*\(.*?\)/g, '')}</small></span>${evBadge(x.ev)}${icon('chevD', 14)}</summary><p>${x.s}</p></details>`).join('')}</section>`;
  return `<section class="mv2 st2">
    <video class="mv2-bg" src="images/stress-meditate.mp4" poster="images/stress-meditate.webp" muted loop playsinline ${auto} preload="auto" aria-hidden="true"></video><span class="mv2-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <div class="mv2-eyebrow">Day ${info.cd} · ${PHASES[info.phase].name}</div>
    <h1 class="rh2-h">Calm your <em>stress</em></h1>
    <div class="st2-lvl lv${lvl}"><span>Stress today</span><b>${['', 'Low', 'Medium', 'High'][lvl]}</b><i><em style="width:${lvl * 33.3}%"></em></i></div>
  </section>
  <div class="pad mv2-body">
    <div class="seg">${[['calm', 'Calm now'], ['meditate', 'Meditate'], ['stretch', 'Stretch']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="stTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
    <p class="fine center">Stress and cortisol respond to your cycle, sleep and food. If stress feels unmanageable, talk to someone you trust or a professional.</p>
  </div>`;
}

// ---------- hormone habits ----------
function habitsDone(k) { return ((state.habits || {})[k] || []); }
function viewHabits() {
  const k = todayISO(), list = HABITS.filter(h => h.g === 'protect' || ttc()), ids = list.map(h => h.id);
  const done = habitsDone(k).filter(id => ids.includes(id)), total = list.length, n = done.length;
  const ph = M.info && M.info.phase, focus = ph ? HABIT_FOCUS[ph].filter(id => ids.includes(id)) : [];
  const bubble = (a, l) => { const L = list.filter(h => h.a === a), c = L.filter(h => done.includes(h.id)).length, r = 20, cc = 2 * Math.PI * r;
    return `<div class="hb-bub"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/><circle cx="24" cy="24" r="${r}" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${cc}" stroke-dashoffset="${cc * (1 - (L.length ? c / L.length : 0))}" transform="rotate(-90 24 24)"/></svg><b>${c}<small>/${L.length}</small></b><span>${l}</span></div>`; };
  const row = h => `<button class="hb ${done.includes(h.id) ? 'on' : ''}" data-action="habitTick" data-id="${h.id}">
      <span class="cb">${icon('check', 13, 2.4)}</span><span class="hb-t"><b>${h.t}</b><small>${h.why}</small><span class="hb-tags">${evBadge(h.ev)}${focus.includes(h.id) ? '<span class="hb-now">Your phase</span>' : ''}</span></span></button>`;
  const R = 46, Cc = 2 * Math.PI * R;
  let week = '';
  for (let i = 6; i >= 0; i--) { const d = C.addDays(new Date(), -i), c = habitsDone(C.iso(d)).filter(id => ids.includes(id)).length; week += `<div class="hb-day"><b style="height:${Math.max(6, Math.min(100, c / total * 100))}%"></b><span>${fmt(d, { weekday: 'narrow' })}</span></div>`; }
  const group = (g, title, sub) => `${sectionTitle(title)}<p class="muted" style="margin:-6px 4px 10px">${sub}</p>
    <section class="card glass habits">${list.filter(h => h.g === g).sort((a, b) => focus.includes(b.id) - focus.includes(a.id)).map(row).join('')}</section>`;
  return `${topbar('Hormone habits', { back: true })}
  <div class="pad">
    <section class="card hb-hero">
      <svg viewBox="0 0 110 110" width="110" height="110"><circle cx="55" cy="55" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>
        <circle cx="55" cy="55" r="${R}" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${Cc}" stroke-dashoffset="${Cc * (1 - n / total)}" transform="rotate(-90 55 55)" style="transition:stroke-dashoffset .5s"/>
        <text x="55" y="60" text-anchor="middle" class="hb-num">${n}</text></svg>
      <div><div class="eyebrow">Today</div><h3>${n} of ${total} habits</h3><p class="body sm">Small daily choices that protect your hormones${ttc() ? ' and fertility' : ''}.</p><div class="hb-week">${week}</div></div>
    </section>
    <div class="hb-bubs">${bubble('body', 'Body')}${bubble('mind', 'Mind')}${bubble('food', 'Food')}</div>
    ${focus.length ? `<section class="card card-light hb-focus"><small>${PHASES[ph].name} phase · start here</small><p>${focus.map(id => HABITS.find(h => h.id === id).t).join(' · ')}</p></section>` : ''}
    ${group('protect', 'Protect your hormones', 'The opposite of what harms women’s health most.')}
    ${ttc() ? group('fertile', 'Fertility & feminine flow', 'Fundamentals for a warm womb and a calm nervous system.') : ''}
    <p class="fine center">You’re not the problem. The modern world is designed against your rhythm. One habit at a time.</p>
  </div>`;
}
function hormoneLibrary() {
  return `${sectionTitle('Your hormones, explained')}
    <div class="fig-wrap lib"><canvas class="figure" data-focus="head"></canvas><span class="lib-cap">Glands from head to womb. Tap a hormone below</span></div>
    <section class="card glass hlib">${HORMONE_LIBRARY.map(h => `<details class="hl"><summary><span class="hl-n">${h.n}</span><span class="hl-g">${h.g}</span>${icon('chevD', 14)}</summary>
      <p>${h.role}</p><p><b class="lime">In your cycle · </b>${h.cycle}</p><p><b class="lime">Support it · </b>${h.support}</p></details>`).join('')}</section>`;
}
function fertilityFoods() {
  return `${sectionTitle('Fertility foods & habits')}
    <section class="card glass ff">${FERTILITY_FOODS.map(x => `<div class="ff-row"><b>${x.f}</b><span>${x.why}</span></div>`).join('')}</section>`;
}

// ---------- couples: partners who also use the app ----------
const SYNC = {
  'menstrual|menstrual': 'You’re both on your period. Cancel plans, share the hot water bottle, rest together.',
  'luteal|luteal': 'You’re both in your luteal phase. Extra gentle, fewer plans, lots of patience with each other.',
  'luteal|menstrual': 'One of you is bleeding, one is premenstrual. A cosy, low-key few days for you both.',
  'follicular|follicular': 'You’re both rising: perfect for trying something new together.',
  'ovulatory|ovulatory': 'You’re both at your peak. Plan the date night.',
  'follicular|ovulatory': 'Both of you have high energy. Go out, be social, make plans.',
};
function syncNote(a, b) { return SYNC[[a, b].sort().join('|')] || SYNC[[b, a].join('|')] || SYNC[[a, b].join('|')] || 'Different tides this week. Whoever has more energy carries a little more, and you switch next week.'; }
function ptAvatar(p, cls = '') { return `<span class="pt-av ${cls}">${p.t ? `<img src="${esc(p.t)}" alt="">` : esc((p.n || '?')[0])}${cls.includes('sm') ? '' : `<i style="background:${PHASE_COLOR.dark[snapInfo(p, new Date()).phase]}"></i>`}</span>`; }
// The cute "send love" button: a smiling envelope with a heart seal, little hearts floating up.
function loveBtnArt() { return `<svg class="lb2-env" viewBox="0 0 64 56" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="8" fill="#fff" stroke="#304023" stroke-width="2"/><path d="M8 18l24 18 24-18" fill="none" stroke="#304023" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="22" cy="40" r="3" fill="#efb6c8" opacity=".8"/><circle cx="42" cy="40" r="3" fill="#efb6c8" opacity=".8"/><path d="M28 42q4 3 8 0" fill="none" stroke="#304023" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M32 33c-6-4-9-7-9-10.5a4.5 4.5 0 0 1 9-1.5 4.5 4.5 0 0 1 9 1.5c0 3.5-3 6.5-9 10.5z" fill="#e6809c" stroke="#304023" stroke-width="1.8" stroke-linejoin="round"/></svg>`; }
function loveBtn(p, big) {
  const art = loveBtnArt();
  const hearts = [0, 1, 2, 3].map(i => `<i style="--d:${i * .9}s;--x:${[18, 38, 62, 80][i]}%">${HEART(i % 2 ? '#f4c6d6' : '#e6809c')}</i>`).join('');
  return `<button class="lb2 ${big ? 'big' : ''}" data-action="openLove" data-id="${p.id}" aria-label="Send love to ${esc(p.n)}">
    <span class="lb2-hearts" aria-hidden="true">${hearts}</span>
    <span class="lb2-art">${art}${ptAvatar(p, 'sm')}</span>
    <span class="lb2-t"><b>Send love to ${esc(p.n)}</b><small>A little heart lands on ${esc(p.n)}’s phone</small></span>
    <span class="lb2-go">${icon('heart', 16, 2)}</span></button>`;
}
function partnersCard(info) {
  const ps = state.partners || [];
  if (!ps.length) return `${sectionTitle('Your partner')}
    <button class="tf" data-action="nav" data-to="partners">
      <span class="tf-media"><img src="images/partner-hands.jpg" alt="" loading="lazy"><span class="tf-tag">${icon('users', 13)} Two phones</span><b class="tf-q">See where your partner is</b></span>
      <span class="tf-p">Swap links and you’ll both see each other’s cycle and energy here.</span>
      <span class="tf-cta">Connect with your partner ${icon('chevR', 14)}</span></button>`;
  if (ps.length > 1) return `${sectionTitle('Your people', ['All', 'partners'])}
    <div class="pt-split n${Math.min(4, ps.length)}">${ps.slice(0, 4).map(p => { const pi = snapInfo(p, new Date()), ph = PHASES[pi.phase], en = Math.round(C.energyAt(pi.cd, pi.L, pi.P) * 100);
      return `<button class="card glass pt-tile" data-action="nav" data-to="partners/${p.id}">${ptAvatar(p)}<b>${esc(p.n)}</b><small>${ph.name} · day ${pi.cd}</small>
        <span class="pt-meter"><b style="width:${en}%"></b></span><small class="pt-st">${partnerStatus(pi, p)}</small></button>`; }).join('')}</div>`;
  return `${sectionTitle('Your partner', ['All', 'partners'])}
    ${ps.slice(0, 1).map(p => { const pi = snapInfo(p, new Date()), ph = PHASES[pi.phase], en = Math.round(C.energyAt(pi.cd, pi.L, pi.P) * 100);
      return `<button class="card glass partner" data-action="nav" data-to="partners/${p.id}">
        ${ptAvatar(p)}
        <span class="pt-b"><span class="eyebrow">${esc(p.n)} · day ${pi.cd} of ${pi.L}</span><b>${ph.name} · ${ph.season}</b>
          <span class="pt-meter"><b style="width:${en}%"></b></span>
          <small>${partnerStatus(pi, p)} · ${en}% energy</small>
          <small class="pt-sync">${icon('heart', 12)} ${syncNote(info.phase, pi.phase)}</small></span>${icon('chevR', 16)}</button>
        ${loveBtn(p)}`; }).join('')}`;
}
// One line saying what is happening for her right now / next.
function partnerStatus(pi, p) {
  if (pi.isPeriod) return `Period · day ${pi.cd}`;
  if (pi.daysToPeriod <= 3) return `Period in ${plural(pi.daysToPeriod, 'day')}`;
  if (p.f && pi.isOvulation) return 'Egg release today';
  if (pi.cd > pi.L - 4) return `Premenstrual · period in ${plural(pi.daysToPeriod, 'day')}`;
  return `Period in ${plural(pi.daysToPeriod, 'day')}`;
}
// What she probably feels, built from her hormones, energy and where she is heading.
function partnerRead(pi, p) {
  const h = C.hormonesRel(pi.cd, pi.L, pi.P), lv = k => C.hormoneLevel(h[k]).toLowerCase(), en = C.energyAt(pi.cd, pi.L, pi.P);
  const out = [];
  out.push(`Estrogen is ${lv('estrogen')}, progesterone ${lv('progesterone')}, testosterone ${lv('testosterone')}.`);
  if (pi.isPeriod) out.push(pi.cd <= 2 ? 'The first days of bleeding are the heaviest. Warmth, rest and fewer plans help most.' : 'Bleeding is easing and her energy is slowly coming back.');
  else if (pi.cd > pi.L - 4) out.push('Hormones are dropping before her period. She may feel tired, sensitive or bloated. Extra patience goes a long way.');
  else if (pi.phase === 'ovulatory') out.push('Her energy is often at its peak. Many women feel most social and chatty now. Great time for a date.');
  else if (pi.phase === 'follicular') out.push('Energy is rising: she’s likely up for new plans and adventures.');
  else out.push('She’s turning inward: cosy plans and calm evenings suit her best.');
  out.push(en > .75 ? 'Energy: high.' : en > .5 ? 'Energy: steady.' : 'Energy: low: help her rest.');
  return out.join(' ');
}
const HEART = c => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.6-4.7-9.7-9.3C.8 8.3 3 4.4 6.8 4.4c2.1 0 3.6 1.1 4.3 2.5h1.8c.7-1.4 2.2-2.5 4.3-2.5 3.8 0 6 3.9 4.5 7.3C19.6 16.3 12 21 12 21z" fill="${c}"/></svg>`;
// beating red heart with a pulse ring and two white hearts orbiting
const loveArt = (sz = 'md') => `<span class="la la-${sz}"><i class="la-ring"></i><i class="la-ring r2"></i><span class="la-main">${HEART('#ff2d4b')}</span><span class="la-o o1">${HEART('#fff')}</span><span class="la-o o2">${HEART('#fff')}</span></span>`;
const LOVE = [
  { k: 'hug', ic: 'users', g: '🤗', t: 'Big hug', s: 'sent you a big warm hug' },
  { k: 'kiss', ic: 'lips', g: '💋', t: 'Kisses', s: 'is sending you kisses' },
  { k: 'tea', ic: 'cup', g: '🍵', t: 'Tea’s coming', s: 'is making you a cup of tea' },
  { k: 'think', ic: 'mind', g: '💭', t: 'Thinking of you', s: 'is thinking of you' },
  { k: 'strong', ic: 'bolt', g: '💪', t: 'You’ve got this', s: 'says: you’ve got this' },
  { k: 'date', ic: 'moon', g: '🌙', t: 'Date night?', s: 'wants a date night with you' },
  { k: 'choc', ic: 'bar', g: '🍫', t: 'Chocolate run', s: 'is bringing you chocolate' },
  { k: 'love', ic: 'heart', g: '❤️', t: 'Love you', s: 'loves you' },
];
const CARE = [
  { k: 'eat', ic: 'bowl', g: '🍽️', t: 'Time to eat', s: 'says: time to eat something nourishing' },
  { k: 'water', ic: 'drop', g: '💧', t: 'Drink water', s: 'reminds you to drink some water' },
  { k: 'rest', ic: 'moon', g: '🌙', t: 'Go to bed', s: 'says: time to rest, go to bed' },
  { k: 'walk', ic: 'leaf', g: '🌿', t: 'Fresh air', s: 'says: take a little walk outside' },
];
const SIGNALS = [...LOVE, ...CARE];
// ---- live signals between phones (free ntfy.sh relay; each app has a private inbox code) ----
const RELAY = 'https://ntfy.sh/uts-';
function myInbox() {
  if (!state.profile.inbox) { const a = new Uint8Array(16); crypto.getRandomValues(a); state.profile.inbox = [...a].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 26); save(); }
  return state.profile.inbox;
}
async function sendSignal(p, k) {
  if (!p.i) return false;
  try { const r = await fetch(RELAY + p.i, { method: 'POST', body: JSON.stringify({ k, f: state.profile.name || 'Someone', fi: myInbox() }) }); return r.ok; } catch { return false; }
}
function handleSignal(m) {
  const seen = state.sigSeen = state.sigSeen || []; if (!m || !m.id || seen.includes(m.id)) return;
  seen.push(m.id); state.sigSeen = seen.slice(-100); state.sigSince = Math.max(state.sigSince || 0, m.time || 0);
  let d; try { d = JSON.parse(m.message); } catch { return; }
  if (d.k === 'pair') { // she added you from your link: her rhythm arrives here on its own
    const snap = b64d(d.d || ''); if (!snap || !snap.s || !snap.c) return;
    const ps = state.partners = state.partners || [], old = ps.find(x => x.i === d.fi || x.n === snap.n);
    if (old) Object.assign(old, snap, { id: old.id, t: old.t, added: Date.now() });
    else if (ps.length < 4) { ps.push({ ...snap, id: Date.now().toString(36), added: Date.now() }); toast(`${snap.n} is connected`); }
    save(); if (['partners', 'today'].includes(route().name)) render(); return;
  }
  const sig = SIGNALS.find(x => x.k === d.k); if (!sig) return;
  const from = (state.partners || []).find(x => x.i === d.fi);
  (state.sigLog = state.sigLog || []).unshift({ k: d.k, f: d.f, at: (m.time || Date.now() / 1000) * 1000, pid: from?.id }); state.sigLog = state.sigLog.slice(0, 30); save();
  showSignal(sig, d.f, from);
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') navigator.serviceWorker?.ready.then(r => r.showNotification(`${sig.g} ${d.f}`, { body: `${d.f} ${sig.s}`, icon: 'icons/icon-192.png', tag: 'sig-' + m.id })).catch(() => {});
}
function showSignal(sig, name, from) {
  document.querySelector('.sig-pop')?.remove();
  const isLove = LOVE.includes(sig);
  const hearts = Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i * .3) % 4}s;animation-duration:${5 + (i % 4)}s;width:${14 + (i * 7) % 18}px;height:${14 + (i * 7) % 18}px">${HEART(i % 3 === 1 ? '#fff' : isLove ? '#ff2d4b' : 'hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)')}</i>`).join('');
  const el = document.createElement('div'); el.className = `sig-pop ${isLove ? 'love' : 'care'}`;
  el.innerHTML = `<div class="lv-hearts">${hearts}</div><div class="lv-in"><div class="lv-art">${loveArt('xl')}<span class="lv-av">${from && from.t ? `<img src="${esc(from.t)}" alt="">` : esc((name || '?')[0])}</span><span class="lv-g">${sig.g}</span></div>
    <h1>${esc(name)} ${sig.s}</h1><p class="muted">just now · Underskin</p>
    ${from ? `<button class="btn btn-love btn-block" data-action="openLove" data-id="${from.id}">${icon('heart', 16)} Send love back</button>` : ''}
    <button class="btn btn-ghost btn-block" data-action="sigClose">Close</button></div>`;
  $app.appendChild(el);
  import('./sfx.js').then(S => S.breeze({ dur: 1.8, vol: .14 })).catch(() => {});
}
let sigSource = null;
async function startSignals() {
  if (!state?.onboarded || !((state.partners || []).length || state.profile.linkSent)) return; // listen once she shared her link
  const id = myInbox();
  syncPartners(); publishLive(); refreshPartners();
  try { // catch up on anything sent while the app was closed (relay keeps ~12h)
    const since = state.sigSince ? state.sigSince + 1 : '12h';
    const txt = await (await fetch(`${RELAY}${id}/json?poll=1&since=${since}`)).text();
    txt.split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(m => m && m.event === 'message').forEach(handleSignal);
  } catch {}
  if (sigSource || !('EventSource' in window)) return;
  try { sigSource = new EventSource(`${RELAY}${id}/sse`); sigSource.onmessage = e => { try { const m = JSON.parse(e.data); if (m.event === 'message') handleSignal(m); } catch {} }; } catch {}
}
// Pastel disc + ink colour for each love tile, so the sheet reads like a little box of stickers.
const LS_TINT = { hug: ['#fbe0e8', '#b0475f'], kiss: ['#f9d3dd', '#c2385c'], tea: ['#f3ead9', '#8a6a3a'], think: ['#ece6f6', '#6d5a9c'], strong: ['#fbefcf', '#a8781a'], date: ['#e6e4f2', '#4f4a82'], choc: ['#f0e0d6', '#7a4a36'], love: ['#ffd9e1', '#e0405f'],
  eat: ['#e9f0d8', '#4f6a2a'], water: ['#dcecf0', '#2f6a7a'], rest: ['#e6e4f2', '#4f4a82'], walk: ['#e3ecc9', '#4f6a2a'] };
function loveSheet() {
  const p = (state.partners || []).find(x => x.id === ui.loveFor); if (!p) return '';
  const sent = (state.loveSent || []).filter(x => x.to === p.id).length;
  const tile = l => { const [bg, ink] = LS_TINT[l.k] || ['#fbe0e8', '#b0475f']; return `<button class="ls2-b" data-action="sendLove" data-k="${l.k}" style="--bg:${bg};--ink:${ink}"><span class="ls2-ic">${icon(l.ic, 22, 1.9)}</span><small>${l.t}</small></button>`; };
  return `<div class="love-sheet" data-action="loveClose"><div class="ls-card ls2" data-action="noop">
    <div class="ls-grip"></div>
    <div class="ls2-head"><span class="lb2-art">${loveBtnArt()}${ptAvatar(p, 'sm')}</span><div><h3>Send love to ${esc(p.n)}</h3><p>${sent ? `${sent} ${sent === 1 ? 'heart' : 'hearts'} sent so far` : 'Tap one and it lands on her phone'}</p></div></div>
    <div class="ls2-k">${icon('heart', 13, 2)} Love</div>
    <div class="ls2-grid">${LOVE.map(tile).join('')}</div>
    <div class="ls2-k care">${icon('leaf', 13, 2)} Care nudges</div>
    <div class="ls2-grid">${CARE.map(tile).join('')}</div></div></div>`;
}
function fmtAgo(t) { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; }
function heartBurst(x, y) {
  const wrap = document.createElement('div'); wrap.className = 'burst'; wrap.style.left = x + 'px'; wrap.style.top = y + 'px';
  for (let i = 0; i < 18; i++) { const h = document.createElement('i'); h.innerHTML = HEART(i % 3 === 2 ? '#fff' : '#ff2d4b'); h.style.width = h.style.height = (14 + Math.random() * 18) + 'px'; h.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px'); h.style.setProperty('--dy', (-120 - Math.random() * 220) + 'px'); h.style.animationDelay = (Math.random() * .15) + 's'; wrap.appendChild(h); }
  document.body.appendChild(wrap); setTimeout(() => wrap.remove(), 1600);
}
function viewLove(q) {
  const d = b64d(q.get('d') || ''), l = d && LOVE.find(x => x.k === d.k);
  if (!l) return `<div class="pad"><h1 class="page-h" style="margin-top:80px">Link not valid</h1></div>`;
  const hearts = Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i * .37) % 7}s;animation-duration:${6 + (i % 5)}s;width:${12 + (i * 7) % 22}px;height:${12 + (i * 7) % 22}px">${HEART(i % 3 === 1 ? '#fff' : '#ff2d4b')}</i>`).join('');
  return `<div class="love-view"><div class="lv-hearts">${hearts}</div>
    <div class="lv-in"><div class="lv-art">${loveArt('xl')}<span class="lv-av">${d.t ? `<img src="${esc(d.t)}" alt="">` : esc((d.f || '?')[0])}</span><span class="lv-g">${icon(l.ic, 26)}</span></div><h1>${esc(d.f || 'Someone')} ${l.s}</h1>
      <p class="muted">${fmt(new Date(), { weekday: 'long' })} · with love, from Underskin</p>
      ${state && state.onboarded ? `<a class="btn btn-love btn-block" href="#/partners">${icon('heart', 16)} Send love back</a>` : `<a class="btn btn-light btn-block" href="#/today">Get Underskin</a>`}</div></div>`;
}
function addPartnerFrom(text) {
  const m = String(text).match(/[?&]d=([A-Za-z0-9_-]+)/) || String(text).trim().match(/^([A-Za-z0-9_-]{16,})$/);
  const snap = m && b64d(m[1]);
  if (!snap || !snap.s || !snap.c) return toast('That doesn’t look like an Underskin link');
  actions.addPartner({ d: m[1] });
}
function viewPartners(id) {
  const ps = state.partners || [];
  if (id) { const p = ps.find(x => x.id === id); return p ? viewPartner(p) : viewMissing(); }
  const me = state.profile, mi = M.info, first = ps[0];
  const orb = (p, info, label) => `<div class="sy-orb"><span class="sy-av" style="--c:${info ? PHASE_COLOR.dark[info.phase] : 'rgba(255,255,255,.2)'}">${p ? (p.photo || p.t ? `<img src="${esc(p.photo || p.t)}" alt="">` : esc((p.name || p.n || '?')[0])) : icon('plus', 22)}</span><small>${label}</small></div>`;
  return `${topbar('Partner', { back: true })}
  <div class="pad">
    <section class="sync-hero">
      <div class="sy-photo"><img src="images/partner-hands.jpg" alt=""></div>
      <div class="sy-pair">${orb(me, mi, mi ? `You · day ${mi.cd}` : 'You')}<span class="sy-line"><i></i></span>${first ? orb(first, snapInfo(first, new Date()), `${esc(first.n)} · day ${snapInfo(first, new Date()).cd}`) : orb(null, null, 'Partner')}</div>
      <h1 class="sy-h">See each other’s <span>rhythm</span></h1>
      <p class="sy-sub">Send one link. Your partner sees your phase and energy every day. If she tracks too, you see each other.</p>
    </section>

    ${ps.length ? `${sectionTitle(`Your people · ${ps.length} of 4`)}
    ${ps.slice().sort((a, b) => !!b.pin - !!a.pin).map(p => { const pi = snapInfo(p, new Date()), ph = PHASES[pi.phase], zs = p.z ? Z.sunSign(+p.z.slice(0, 2), +p.z.slice(3)) : null;
      return `<div class="sy-row"><button class="card glass sy-card" data-action="nav" data-to="partners/${p.id}">${ptAvatar(p, 'lg')}
        <span class="pt-b"><b>${esc(p.n)}</b><small>${ph.name} · day ${pi.cd} · ${partnerStatus(pi, p)}</small></span>${icon('chevR', 16)}</button></div>`; }).join('')}` : ''}

    ${ps.length >= 4 ? '<p class="fine center">You’re connected with 4 people, the most Underskin keeps. Remove someone to add a new person.</p>' : ''}
    ${ps.length >= 4 ? '' : (() => { const sent = !!me.linkSent, got = ps.length > 0, who = me.ptWho, done = () => `<span class="sy-n done">${icon('check', 15, 2.4)}</span>`;
      const ask = `<div class="sy-who-q"><b>Who is your partner?</b><small>So we send the right kind of link.</small>
        <div class="sy-pick">${[['w', 'A woman', 'She tracks her own cycle too and you see each other'], ['m', 'A man', 'He sees your rhythm, plus his own 24-hour day. Nothing to track']].map(([k, t, d]) => `<button class="sy-opt ${who === k ? 'on' : ''}" data-action="ptWho" data-v="${k}" aria-pressed="${who === k}"><b>${t}</b><small>${d}</small></button>`).join('')}</div></div>`;
      const send = who ? `<div class="sy-send"><button class="btn btn-dark" data-action="shareSend">${icon('share', 16)} Send link</button><button class="btn btn-light" data-action="shareEmail">${icon('mail', 16)} Email it</button></div>` : '';
      if (who === 'm') return `<div class="sy-head"><span class="hud">CONNECT · 2 STEPS</span><span class="sy-prog">${[sent, sent].map(x => `<i class="${x ? 'on' : ''}"></i>`).join('')}</span></div>
    <ol class="sy-flow">
      <li class="sy-st paper ${sent ? 'is-done' : ''}">${sent ? done() : '<span class="sy-n">01</span>'}<div class="sy-c">${ask}${send}</div></li>
      <li class="sy-st ${sent ? 'is-done' : ''}">${sent ? done() : '<span class="sy-n">02</span>'}<div class="sy-c">
        <span class="sy-who">Him</span><b>He opens the link</b><small>No account and no tracking. He sees your phase, energy and how to show up, plus My day: his own 24-hour hormone rhythm. It updates every day and he can save it to his home screen.</small></div></li>
    </ol>`;
      return `<div class="sy-head"><span class="hud">${ps.length ? 'ADD SOMEONE NEW' : 'CONNECT · 2 STEPS'}</span><span class="sy-prog">${[sent, got].map(x => `<i class="${x ? 'on' : ''}"></i>`).join('')}</span></div>
    <ol class="sy-flow">
      <li class="sy-st paper ${sent ? 'is-done' : ''}">${sent ? done() : '<span class="sy-n">01</span>'}<div class="sy-c">${ask}${send}</div></li>
      ${who ? `<li class="sy-st ${got ? 'is-done' : ''}">${got ? done() : '<span class="sy-n">02</span>'}<div class="sy-c">
        <span class="sy-who">Her</span><b>She opens it and you're both connected</b><small>Her Underskin adds you and sends her rhythm back to you on its own.</small></div></li>` : ''}
    </ol>`; })()}
    <button class="link center-link" data-action="nav" data-to="share">Sharing settings & preview</button>
  </div>`;
}
// Typical mood (0–1): follows estrogen up, dips in the late premenstrual days and the first bleeding days.
function feelAt(cd, L, P) {
  const h = C.hormonesRel(cd, L, P), late = cd > L - 4;
  let f = 0.5 + 0.3 * h.estrogen + (late ? 0 : 0.1 * h.progesterone);
  if (cd <= 2) f -= 0.08;
  if (late) f -= 0.1 + 0.08 * (cd - (L - 4)) / 4;
  return Math.min(.92, Math.max(.3, f));
}
// Typical desire (0–1): rises with testosterone and estrogen towards ovulation, calmer when progesterone is high.
function desireAt(cd, L, P) {
  const h = C.hormonesRel(cd, L, P);
  return Math.min(.95, Math.max(.15, 0.28 + 0.42 * h.testosterone + 0.3 * h.estrogen - 0.18 * h.progesterone));
}
// Round dial = her whole cycle: one bar per day (taller = higher), today glows, today's score in the middle.
function cycleDial(pi, f, mid) {
  const L = pi.L, cx = 60, cy = 60, bars = [];
  for (let d = 1; d <= L; d++) {
    const v = f(d, L, pi.P), a = (d - 1) / L * 2 * Math.PI - Math.PI / 2, r0 = 38, r1 = r0 + 4 + v * 16, now = d === pi.cd;
    bars.push(`<line x1="${(cx + r0 * Math.cos(a)).toFixed(1)}" y1="${(cy + r0 * Math.sin(a)).toFixed(1)}" x2="${(cx + r1 * Math.cos(a)).toFixed(1)}" y2="${(cy + r1 * Math.sin(a)).toFixed(1)}" stroke="${now ? '#f4f5f0' : 'hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)'}" stroke-opacity="${now ? 1 : (.15 + v * .7).toFixed(2)}" stroke-width="${now ? 3.2 : 2.2}"/>`);
    if (now) bars.push(`<circle cx="${(cx + (r1 + 5) * Math.cos(a)).toFixed(1)}" cy="${(cy + (r1 + 5) * Math.sin(a)).toFixed(1)}" r="2.6" fill="#f4f5f0"/>`);
  }
  return `<svg class="dial" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="35" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77% / .05)" stroke="rgba(255,255,255,.08)"/>${bars.join('')}${mid}</svg>`;
}
function smiley(v) { // mouth curves up with a higher score
  const c = ((v - 55) / 45 * 7).toFixed(1);
  return `<g fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="2" stroke-linecap="round"><circle cx="52" cy="52" r="1.6" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/><circle cx="68" cy="52" r="1.6" fill="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)"/><path d="M50 60 Q60 ${60 + +c} 70 60"/></g>`;
}
function moodDesire(pi, p) {
  const fv = Math.round(feelAt(pi.cd, pi.L, pi.P) * 100), dv = Math.round(desireAt(pi.cd, pi.L, pi.P) * 100);
  const fw = fv >= 78 ? 'Bright' : fv >= 62 ? 'Good' : fv >= 50 ? 'Mixed' : 'Tender', dw = dv >= 70 ? 'High' : dv >= 45 ? 'Medium' : 'Low';
  let peak = 1; for (let d = 1; d <= pi.L; d++) if (desireAt(d, pi.L, pi.P) > desireAt(peak, pi.L, pi.P)) peak = d;
  const toPeak = (peak - pi.cd + pi.L) % pi.L;
  return `${sectionTitle('Mood & desire')}
    <section class="card glass md-card">
      <div class="md-two">
        <div class="md-d">${cycleDial(pi, feelAt, smiley(fv))}<span class="md-v"><b>${fv}</b>/100</span><small>Feeling · ${fw}</small></div>
        <div class="md-d">${cycleDial(pi, desireAt, `<g transform="translate(50 46) scale(.84)" fill="none" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="2.2" stroke-linejoin="round">${'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>'}</g>`)}<span class="md-v"><b>${dv}</b>/100</span><small>Sex drive · ${dw}</small></div>
      </div>
      <p class="body sm">${toPeak === 0 ? 'Desire is often at its highest around now.' : `Desire usually peaks around ovulation, in about ${plural(toPeak, 'day')}.`} Each ring is her whole cycle; the white bar is today. ${evBadge('some')}</p>
      <p class="fine" style="margin:6px 0 0">Typical patterns from her cycle, not a reading of her. Every woman is different, so ask ${esc(p.n)} how she feels.</p>
    </section>`;
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
    <div class="pt-stage-h">${ptAvatar(p, 'lg')}<h1 class="hello sm">${esc(p.n)} is in her <b>${ph.name} phase</b><small>${ph.season} · ${partnerStatus(pi, p)}</small></h1></div>
    <section class="hub pt-stage">${stageHero(pi, en, { nav: false, id: 'pt', fert: !!p.f })}</section>
    ${(() => {
      const late = pi.cd > pi.L - 4, moods = { menstrual: ['Tired', 'Inward', 'Tender', 'Reflective'], follicular: ['Curious', 'Optimistic', 'Light', 'Playful'], ovulatory: ['Confident', 'Social', 'Flirty', 'Radiant'], luteal: late ? ['Sensitive', 'Bloated', 'Irritable', 'Needs comfort'] : ['Calm', 'Focused', 'Nesting', 'Cosy'] }[pi.phase];
      const moon = Z.moonPhase(new Date()), waxing = moon.age < 14.77, building = pi.phase === 'follicular' || pi.phase === 'ovulatory';
      const sync = /full/i.test(moon.name) ? 'Full moon: a bright night. Extra tenderness always goes a long way.' : /new/i.test(moon.name) ? 'New moon: a quiet reset. Perfect for a cosy night in together.' : waxing === building ? (waxing ? 'In sync: the moon is growing and so is her energy.' : 'In sync: the moon is waning and she’s turning inward too.') : (waxing ? 'The moon is growing while she turns inward. Let her rest.' : 'The moon is releasing while her energy rises. Great for fresh starts together.');
      const zs = p.z ? Z.sunSign(+p.z.slice(0, 2), +p.z.slice(3)) : null;
      const real = p.md === todayISO() && p.m?.length;
      return `<section class="card glass feel-card"><div class="eyebrow">${real ? `${esc(p.n)} logged today` : 'How she’s feeling'}</div>
        <div class="feel-chips">${(real ? p.m.map(esc) : moods).map(m => `<span class="${real ? 'real' : ''}">${m}</span>`).join('')}</div>
        <p class="body sm">${partnerRead(pi, p).split('. ').slice(1, 2).join('')}.</p></section>`; })()}
    ${(() => { const got = (state.sigLog || []).filter(x => x.pid === p.id).slice(0, 3); return got.length ? `<section class="card glass sig-log"><div class="eyebrow">From ${esc(p.n)}</div>${got.map(x => { const g = SIGNALS.find(y => y.k === x.k); return `<div class="sl"><span>${g ? g.g : '❤️'}</span><b>${g ? g.t : ''}</b><small>${fmtAgo(x.at)}</small></div>`; }).join('')}</section>` : ''; })()}
    ${loveBtn(p, true)}

    ${moodDesire(pi, p)}
    ${partnerCare(pi, esc(p.n))}

    ${sectionTitle('Her hormones')}
    <section class="card glass chart-card">${cycleChart(pi, { id: 'pt', compact: true, who: 'Her' })}</section>
    ${sectionTitle('Her next two weeks')}
    ${ptCalendar(p, !!p.f)}

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
    <section class="card glass">${list(sup.do.slice(0, 3), 'yes')}</section>
    ${sup.gifts ? `${sectionTitle('Little gifts')}<div class="hscroll">${sup.gifts.map(g => `<div class="rcard gift g2">${giftArt(g)}<div class="rc-t">${esc(g.replace(/\s*😉/, ''))}</div></div>`).join('')}</div>` : ''}
    <div class="ptd-two">
      <div class="card glass"><span class="han-big">${tcm.elementGlyph}</span><small>Make her</small><b>${tcm.tea.name}</b></div>
      ${sup.date || sup.plan ? `<div class="card glass"><span class="han-big">${icon('heart', 22)}</span><small>${sup.date ? 'Date idea' : 'Plan idea'}</small><b>${esc(sup.date || sup.plan)}</b></div>` : ''}
    </div>
    <p class="fine center">Updates on its own whenever ${esc(p.n)} logs a new period. Every body is different, so ask her too.</p>
    <button class="tiny-link" data-action="removePartner" data-id="${p.id}">remove</button>
  </div>`;
}

// ---------- seasonal foods ----------
// best seasonal dishes for today: in season, warm/raw rule, then those fitting the current phase
function seasonalDishesToday(info, n = 2) {
  const items = SZ.seasonal(myCountry(), new Date().getMonth() + 1);
  let ds = SZ.dishesFor(items, SZ.countryRegion(myCountry()));
  if (info && warmWindow(info)) ds = ds.filter(d => d.warm);
  const fit = d => info && d.used.some(i => i.ph.includes(info.phase)) ? 1 : 0;
  ds.sort((a, b) => (b.local - a.local) || fit(b) - fit(a) || (info && !warmWindow(info) ? (!!a.warm - !!b.warm) : 0) || b.score - a.score);
  return ds.slice(0, n);
}
function myCountry() { return state?.profile?.country || SZ.guessCountry(); }
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
// Home: the main foods in season right now as photo cards, best for her phase first, plus a way into the full page.
function seasonBento(info) {
  const m = new Date().getMonth() + 1, items = SZ.seasonal(myCountry(), m).filter(i => foodPhoto(i.f));
  if (!items.length) return '';
  const rank = i => (info && i.ph.includes(info.phase) ? 2 : 0) + (i.kind === 'veg' || i.kind === 'fruit' ? 1 : 0);
  const top = [...items].sort((a, b) => rank(b) - rank(a)).slice(0, 8);
  const NAT = { warm: 'Warming', neutral: 'Neutral', cool: 'Cooling' };
  return `${sectionTitle(`In season · ${MONTHS[m - 1]}`, ['All', 'season'])}
    <div class="sz-row">${top.map((i, n) => `<button class="sz-food" style="--i:${n}" data-action="seasonGo" data-f="${esc(i.f)}">
      <img src="${foodPhoto(i.f, 320)}" alt="" loading="lazy"><span class="sz-shade"></span>
      ${info && i.ph.includes(info.phase) ? `<span class="sz-fit">${icon('spark', 11)} Your phase</span>` : ''}
      <span class="sz-b"><b>${i.f.replace(/\s*\(.*\)/, '')}</b><small><i class="nat ${i.nature}"></i>${NAT[i.nature]}</small></span></button>`).join('')}</div>
    <button class="sz-more2" data-action="nav" data-to="season"><span class="szm-pics">${top.slice(0, 3).map(i => `<img src="${foodPhoto(i.f, 120)}" alt="" loading="lazy">`).join('')}</span>
      <span class="szm-t"><b>See all ${items.length} foods</b><small>and what to cook with them</small></span><span class="szm-go">${icon('chevR', 18)}</span></button>`;
}
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
// ---------- what's in season: spec sheet, five-season wheel, photo grid, cook, year ----------
const SEASON_ORDER = ['Spring', 'Summer', 'Late summer', 'Autumn', 'Winter'];
const SEASON_EL = { Spring: 'Wood', Summer: 'Fire', 'Late summer': 'Earth', Autumn: 'Metal', Winter: 'Water' };
const KINDS = [['veg', 'Veg', '🥦'], ['fungi', 'Fungi', '🍄'], ['fruit', 'Fruit', '🍎'], ['herb', 'Herbs', '🌿'], ['wild', 'Wild', '🍄'], ['animal', 'Fish & meat', '🐟'], ['other', 'Nuts & more', '🌰']];
const NATURE = { warm: ['Warming', 'Supports circulation. Welcome all cycle, especially around your period.'], neutral: ['Neutral', 'Balanced for every phase, raw or cooked.'], cool: ['Cooling', 'Fresh and cooling. Lovely raw on your raw-first days; cook it with ginger around your period.'] };
function seasonWheel(cur, mine) {
  const cx = 150, R = 140, hole = 36, step = 2 * Math.PI / 5, gap = .04;
  const at = (r, a) => [(cx + r * Math.sin(a)).toFixed(1), (cx - r * Math.cos(a)).toFixed(1)];
  const petals = SEASON_ORDER.map((sn, i) => {
    const a0 = i * step - step / 2 + gap, a1 = a0 + step - 2 * gap, mid = (a0 + a1) / 2, F = Z.FIVE[SEASON_EL[sn]], on = sn === cur;
    const [hx, hy] = at(66, mid), [lx, ly] = at(116, mid);
    return `<g class="pw-p sw-p ${on ? 'on' : ''}" data-action="seasonJump" data-v="${sn}" style="--d:${i * .08}s" role="button" aria-label="${sn}">
      <path class="pw-out" d="${petalPath(cx, hole, R, a0, a1)}"/><path class="pw-in" d="${petalPath(cx, hole, 94, a0, a1)}"/>
      <text class="sw-han" x="${hx}" y="${hy}" text-anchor="middle" dominant-baseline="central">${F.han}</text>
      <text class="pw-l sw-n" x="${lx}" y="${(+ly - 5).toFixed(1)}" text-anchor="middle">${sn}</text>
      <text class="pw-l sw-o" x="${lx}" y="${(+ly + 9).toFixed(1)}" text-anchor="middle">${F.organ.split(' & ')[0]}${sn === mine ? ' · you' : ''}</text></g>`;
  }).join('');
  return `<svg class="pw sw" viewBox="0 0 300 300" role="group" aria-label="The five seasons">${petals}<circle cx="${cx}" cy="${cx}" r="${hole - 6}" class="pw-hole"/><text x="${cx}" y="${cx + 1}" class="pw-han sw-c" text-anchor="middle" dominant-baseline="central">五行</text></svg>`;
}
// Plain-language Chinese medicine for each season, and teas people actually drink.
const SEASON_PLAIN = {
  Winter: { eat: 'It’s cold outside, so eat warm: slow-cooked stews, broths, roots and beans. Hot meals keep you warm from the inside.', tea: 'Ginger, cinnamon, or chai with warm raw milk' },
  Spring: { eat: 'Lighter food after winter: fresh greens, herbs and a little sour, like lemon or sauerkraut. Lightly cooked or raw.', tea: 'Nettle, fresh mint or green tea' },
  Summer: { eat: 'It’s hot outside, so eat lighter and fresher: fruit, salads, raw vegetables and juicy foods that cool you down.', tea: 'Peppermint, hibiscus or green tea' },
  'Late summer': { eat: 'Sweet, golden harvest food: corn, squash and ripe fruit. Simple warm meals at regular times are easiest to digest.', tea: 'Chamomile, fennel or ginger' },
  Autumn: { eat: 'It turns cool and dry, so cook more: roots, pumpkin, stewed apples and pears, with warming spices like ginger and cinnamon.', tea: 'Ginger with raw honey, cinnamon, rooibos or chai' },
};
// The season told as a short story, with a little drawn basket of what's growing.
const SEASON_STORY = {
  Spring: { t: 'Everything is waking up', p: 'Buds open, the days grow longer and the first greens push through the soil. Your body wants to wake up too: lighter, fresher food with a little sour, like lemon or sauerkraut.', feel: 'Wood element and the liver. A time to move, stretch and start something new.' },
  Summer: { t: 'The sun is at its highest', p: 'Long days, ripe fruit and gardens that overflow. Your body wants light, juicy food that cools you: berries, salads, cucumbers and fresh herbs.', feel: 'Fire element and the heart. A time for people, laughter and long evenings outside.' },
  'Late summer': { t: 'The harvest turns golden', p: 'Corn, squash and ripe fruit are everywhere. Your body loves simple, sweet, warm meals now, eaten at regular times.', feel: 'Earth element, spleen and stomach. A time to slow down and feel grounded.' },
  Autumn: { t: 'Nature is letting go', p: 'Leaves fall, the air turns crisp and the earth gives its last harvest: roots, pumpkins, apples and pears. Your body wants what the trees do: to slow down and keep its warmth inside.', feel: 'Metal element and the lungs. A time to breathe deeply, let go and tidy up.' },
  Winter: { t: 'Everything rests', p: 'The days are short, the earth is quiet and life sits deep in the roots. Your body asks for slow-cooked, warm, nourishing food and longer nights.', feel: 'Water element and the kidneys. A time to rest, sleep longer and refill.' },
};
const SEASON_ART = { Spring: ['#a9d18e', '#f6bfcd', '#d6eab0', '#f6bfcd'], Summer: ['#ff9f8f', '#ffd36e', '#a6d78f', '#ffd36e'], 'Late summer': ['#f5c95c', '#e8a25a', '#c7d48a', '#e6c06a'], Autumn: ['#f2a65a', '#e57a6e', '#dcc66a', '#e0954c'], Winter: ['#f0c27b', '#c49a7a', '#e8d6c2', '#ffffff'] };
function seasonArt(sn) {
  const [a, b, c, k] = SEASON_ART[sn] || SEASON_ART.Autumn;
  const bits = { Spring: '<path d="M0 0c3-4 8-4 8 0-3 4-8 4-8 0z"/>', Summer: '<circle r="3.4"/>', 'Late summer': '<ellipse rx="2.2" ry="4.4"/>', Autumn: '<path d="M0-5c4 2 5 6 0 10-5-4-4-8 0-10z"/>', Winter: '<path d="M0-4v8M-3.5-2l7 4M-3.5 2l7-4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"/>' }[sn] || '';
  return `<svg class="sz-art" viewBox="0 0 220 150" aria-hidden="true">
    <ellipse cx="110" cy="134" rx="74" ry="8" fill="rgba(48,64,35,.08)"/>
    ${[[34, 34, 0], [182, 28, 1.2], [56, 70, 2.1], [170, 72, .6], [196, 54, 1.7]].map(([x, y, d]) => `<g class="sz-bit" style="--d:${d}s" transform="translate(${x} ${y})" fill="${k}">${bits}</g>`).join('')}
    <circle cx="82" cy="82" r="26" fill="${b}"/><path d="M82 56c0-6 4-9 8-9" stroke="#6c823e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="80" r="24" fill="${c}"/><path d="M140 56c-2-6 1-9 5-10" stroke="#6c823e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M145 49c6-4 12-2 13 1-5 3-10 3-13-1z" fill="#8fb26a"/>
    <circle cx="111" cy="76" r="30" fill="${a}"/><path d="M111 46c0-7 3-10 7-11" stroke="#6c823e" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M116 38c7-5 15-3 16 1-6 4-12 4-16-1z" fill="#8fb26a"/>
    <circle cx="101" cy="76" r="2.6" fill="#3b2a1e"/><circle cx="121" cy="76" r="2.6" fill="#3b2a1e"/><path d="M104 85q7 6 14 0" stroke="#3b2a1e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="95" cy="83" r="4" fill="#ff8f9c" opacity=".5"/><circle cx="127" cy="83" r="4" fill="#ff8f9c" opacity=".5"/>
    <path d="M50 92h120l-10 36c-1 4-4 6-8 6H68c-4 0-7-2-8-6z" fill="#f3e2d2"/><path d="M50 92h120" stroke="#e2c9b2" stroke-width="5" stroke-linecap="round"/>
    <path d="M62 106h96M66 118h88" stroke="#e8d3bf" stroke-width="2" stroke-linecap="round"/></svg>`;
}
// Season page: autumn rituals and winter herbs, shown through the cold half of the year.
function seasonRituals(sn) {
  if (!['Autumn', 'Winter'].includes(sn)) return '';
  const rit = `${sectionTitle(`${sn === 'Winter' ? 'Winter' : 'Autumn'} rituals`)}<p class="sr-sub">Warm, replenish and protect your immunity as the season turns.</p>
    <div class="sr-grid">${AUTUMN_RITUALS.map(([n, how, why, ev]) => `<details class="sr-c"><summary><img src="${teaPhoto(n, 320, 240)}" alt="" loading="lazy"><b>${n}</b><small>${why}</small></summary><p>${how}</p>${evBadge(ev)}</details>`).join('')}</div>`;
  const herbs = `${sectionTitle('Winter herbs')}<p class="sr-sub">For immunity and warmth through the cold months. Tap one to see how to use it.</p>
    <section class="card sr-herbs">${WINTER_HERBS.map(([n, cn, nat, what, how, warn, ev]) => `<details class="sr-h"><summary><img src="${teaPhoto(n, 160, 160)}" alt="" loading="lazy"><span><b>${n}</b><small>${cn}</small></span><em class="sr-nat ${nat}">${nat === 'warm' ? 'Warming' : 'Neutral'}</em></summary>
      <p>${what}</p><div class="sr-how">${icon('cup', 14)} ${how}</div>${warn ? `<div class="sr-warn">${icon('spark', 13)} ${warn}</div>` : ''}${evBadge(ev)}</details>`).join('')}</section>`;
  return sn === 'Winter' ? herbs + rit : rit + herbs;
}
function viewSeason(jump) {
  if (jump) {
    Object.assign(ui, { seasonView: jump === 'cook' ? 'cook' : 'month', seasonKind: null });
    setTimeout(() => { document.getElementById('sz-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', '#/season'); }, 80);
  }
  // Always today: the page follows the calendar, so foods and recipes change by themselves as the season turns.
  const c = myCountry(), m = new Date().getMonth() + 1, kind = ui.seasonKind || null, view = ui.seasonView === 'cook' ? 'cook' : 'month';
  const all = SZ.seasonal(c, m), country = SZ.COUNTRIES.find(x => x[0] === c)?.[1] || '';
  const sn = SZ.seasonName(c, m), PL = SEASON_PLAIN[sn];
  const phase = M.info ? M.info.phase : null, warm = M.info && warmWindow(M.info);
  const fits = i => phase && i.ph.includes(phase);
  const items = all.filter(i => !kind || i.kind === kind), sel = all.find(i => i.f === ui.seasonFood);
  const pic = (i, w = 300) => foodPhoto(i.f, w);
  const tile = i => `<button class="szt ${ui.seasonFood === i.f ? 'sel' : ''}" data-action="seasonFood" data-f="${esc(i.f)}">
      <span class="szt-img">${pic(i) ? `<img src="${pic(i)}" alt="" loading="lazy">` : ''}${fits(i) ? '<em>for you</em>' : ''}</span>
      <b>${i.f}</b><small><i class="nat ${i.nature}"></i>${NATURE[i.nature][0]}</small></button>`;
  const detail = sel ? `<section class="card szd sf-detail">${pic(sel, 600) ? `<img class="szd-img" src="${pic(sel, 600)}" alt="">` : ''}
      <div class="szd-b"><div class="szd-h"><div><div class="eyebrow dark">${NATURE[sel.nature][0]} food</div><h3>${sel.f}</h3></div>
        <button class="bn-x" data-action="seasonFood" data-f="${esc(sel.f)}" aria-label="Close">${icon('close', 16)}</button></div>
      ${sel.nut.length ? `<div class="szd-r"><span>Rich in</span><b>${sel.nut.join(' · ')}</b></div>` : ''}
      ${sel.ph.length ? `<div class="szd-r"><span>Best phase</span><b>${sel.ph.map(p => PHASES[p].name).join(' & ')}${phase && sel.ph.includes(phase) ? ' · yours now' : ''}</b></div>` : ''}
      <p>${sel.nature === 'cool' && warm ? 'A cooling food. Your period is close, so cook it and add ginger or cinnamon.' : NATURE[sel.nature][1]}</p></div></section>` : '';
  const counts = KINDS.map(([k, n]) => [k, n, all.filter(i => i.kind === k).length]).filter(x => x[2]);
  let body;
  if (view === 'cook') {
    let ds = SZ.dishesFor(all, SZ.countryRegion(c));
    ds = warm ? ds.filter(d => d.warm) : [...ds.filter(d => !d.warm), ...ds.filter(d => d.warm)];
    body = `${warm ? `<p class="sz-warm">${icon('sun', 14)} Your period is close: warm, cooked dishes only.</p>` : ''}
      ${ds.slice(0, 8).map(d => { const fit = phase && d.used.some(i => i.ph.includes(phase)), ph = dishPhoto(d.name, 700); return `<details class="card glass szc">
        <summary>${ph ? `<img class="szc-img" src="${ph}" alt="" loading="lazy">` : ''}<span class="szc-t"><span class="szc-tags"><span class="dish-tag ${d.warm ? 'w' : 'r'}">${d.warm ? 'Warm' : 'Raw'}</span>${fit ? `<span class="dish-tag fit">${icon('spark', 10)} Your phase</span>` : ''}</span><b>${d.name}</b><small>${d.used.map(i => i.f).slice(0, 3).join(' · ')}</small></span><span class="szc-cta">How to ${icon('chevD', 14)}</span></summary>
        <div class="foods" style="margin-top:12px">${d.used.map(i => `<span class="food match">${i.f}</span>`).join('')}${d.extra.map(e => `<span class="food">${e}</span>`).join('')}</div>
        <p class="body sm">${d.how}</p>
        ${DISH_PHOTOS[d.name] ? `<p class="fine" style="margin:6px 0 0">Photo: <a class="src" href="${DISH_PHOTOS[d.name].page}?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">${esc(DISH_PHOTOS[d.name].by)}</a> on Unsplash</p>` : ''}</details>`; }).join('') || '<p class="muted center">No dishes for this month yet.</p>'}`;
  } else {
    body = `<div class="chips sz-kinds"><button class="chip ${!kind ? 'on' : ''}" data-action="seasonKind" data-v="${kind || ''}">All ${all.length}</button>${counts.map(([k, n, t]) => `<button class="chip ${kind === k ? 'on' : ''}" data-action="seasonKind" data-v="${k}">${n} ${t}</button>`).join('')}</div>
      ${detail}<div class="szg">${items.map(tile).join('')}</div>`;
  }
  const forYou = all.filter(i => fits(i) && foodPhoto(i.f));
  return `<div class="pad sz2">
  ${specHero({ photo: `images/season-${{ Spring: 'spring', Summer: 'summer', 'Late summer': 'summer', Autumn: 'autumn', Winter: 'winter' }[sn]}.jpg`, glyph: 'leaf', eyebrow: `${country} · ${MONTHS[m - 1]}`, name: `${sn} is here`, label: `What’s growing near you`,
      rows: [[`${all.length} foods`, 'fresh this month'], [`${all.filter(fits).length} for you`, phase ? `kind to your ${PHASES[phase].name.toLowerCase()} phase` : 'for your phase']], desc: 'The list changes by itself as the season turns, so there’s always something new to try.' })}
    <section class="card sz-story">
      ${seasonArt(sn)}
      <h2>${(SEASON_STORY[sn] || SEASON_STORY.Autumn).t}</h2>
      <p class="sz-tale">${(SEASON_STORY[sn] || SEASON_STORY.Autumn).p}</p>
      <div class="sz-rits">
        <div class="sz-rit"><span>${icon('bowl', 18)}</span><div><small>Eat</small><b>${PL.eat}</b></div></div>
        <div class="sz-rit"><span>${icon('cup', 18)}</span><div><small>Sip</small><b>${PL.tea}</b></div></div>
        <div class="sz-rit"><span>${icon('yinyang', 18)}</span><div><small>Feel</small><b>${(SEASON_STORY[sn] || SEASON_STORY.Autumn).feel}</b></div></div>
      </div>
      <div class="sz-nat"><small>In Chinese medicine every food warms, cools or balances you</small>
        <div>${[['warm', 'Warming', 'heats you up'], ['neutral', 'Neutral', 'balances'], ['cool', 'Cooling', 'cools you']].map(([k, n, d]) => `<span><i class="nat ${k}"></i><b>${n}</b>${d}</span>`).join('')}</div>
        <p>Around your period, choose warming food and cook the cooling ones.</p></div>
    </section>
    ${forYou.length ? `${sectionTitle(`For your ${PHASES[phase].name.toLowerCase()} phase`)}
      <div class="hscroll">${forYou.map(i => `<button class="rcard has-photo" data-action="seasonFood" data-f="${esc(i.f)}"><img class="rc-photo" src="${pic(i, 500)}" alt="" loading="lazy"><span class="rc-shade"></span>
        <div class="rc-top"><span class="rc-k">${NATURE[i.nature][0]}${warm && i.nature === 'cool' ? ' · cook it' : ''}</span></div><div class="rc-t">${i.f}</div><div class="rc-m">${i.nut.slice(0, 2).join(' · ')}</div></button>`).join('')}</div>` : ''}
    ${seasonRituals(sn)}
    <div class="sz-anchor" id="sz-tabs"></div>
    <div class="seg sz-tabs">${[['month', 'Foods'], ['cook', 'Recipes']].map(([k, l]) => `<button class="${view === k ? 'on' : ''}" data-action="seasonView" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
    <div class="season-ctl"><label class="fine" for="sz-country">Your country</label><select id="sz-country" class="field sm" data-input="profile.country">${SZ.COUNTRIES.map(([code, nm]) => `<option value="${code}" ${code === c ? 'selected' : ''}>${nm}</option>`).join('')}</select></div>
    <p class="fine center">Typical local growing seasons; they shift a little with weather and area. Forage only what you can identify with certainty.</p>
  </div>`;
}

// ---------- World kitchen: dishes from eight food regions for each cycle phase ----------
const WK_ROLE = {
  B6: ['Helps your brain make serotonin, steadying PMS mood.', 'b6'], Warmth: ['Warming food, kind to the womb around your period.'],
  Iodine: ['Feeds your thyroid, which sets your energy and cycle.'], 'Vitamin K': ['For healthy clotting and strong bones.'],
  Hydration: ['Water-rich food for skin and steady energy.'], 'Vitamin D': ['Mood, immunity and egg quality.', 'vitamin-d'],
  Calm: ['A warm, soothing drink for a calmer evening.'], 'Good fats': ['Your hormones are built from fat and cholesterol.'],
  Enzymes: ['Fresh fruit enzymes that help digestion.'], Lycopene: ['A red antioxidant from tomatoes, best with olive oil.'],
};
const wkRole = n => NUTRIENT_ROLE[n] || WK_ROLE[n] || [''];
const WK_HOME = { med: 'med', korea: 'korea', north: 'nordic', central: 'nordic' };
function wkHome() { return WK_HOME[SZ.countryRegion(myCountry())] || 'med'; }
function wkOrder() { const h = wkHome(); return [worldOf(h), ...WORLD.filter(r => r.k !== h)]; }
function worldStrip(phase) {
  return `${sectionTitle('Eat around the world', ['All 8', 'world'])}
    <div class="hscroll wk-strip">${wkOrder().map(r => { const d = r.dishes[phase][0]; return `<button class="rcard has-photo" data-action="worldGo" data-k="${r.k}"><img class="rc-photo" src="${foodPhoto(r.pic, 500)}" alt="" loading="lazy"><span class="rc-shade"></span>
      <div class="rc-top"><span class="rc-k">${r.k === wkHome() ? 'Near you' : '2 dishes'}</span></div><div class="rc-t">${r.name}</div><div class="rc-m">${d.n}</div></button>`; }).join('')}</div>`;
}
function wkDish(d, phase, i) {
  const now = M.info && M.info.phase === phase, warmNow = M.info && warmWindow(M.info), ph = foodPhoto(d.pic, 700);
  return `<details class="card wk-d" style="--i:${i}"><summary>
      <span class="wk-img">${ph ? `<img src="${ph}" alt="" loading="lazy" onerror="this.remove()">` : ''}<span class="dish-tag ${d.warm ? 'w' : 'r'}">${d.warm ? 'Warm' : 'Raw'}</span></span>
      <span class="wk-t"><b>${d.n}</b><span class="wk-g">${d.g.map(g => `<em>${g}</em>`).join('')}</span>
        <small>${d.key.join(' · ')}</small></span>
      <span class="wk-cta">How to make it ${icon('chevD', 14)}</span></summary>
    <div class="wk-body">
      <div class="wk-k">Method</div><p>${d.how}</p>
      ${!d.warm && warmNow ? `<p class="tea-warn">${icon('yinyang', 14)} Your period is close: save raw dishes for after it.</p>` : ''}
      <div class="wk-k">Why ${now ? 'now' : `in your ${PHASES[phase].name.toLowerCase()} phase`}</div>
      <div class="rn-list wk-rn">${d.g.map(n => { const [line, to] = wkRole(n); return `<${to ? `button data-action="nav" data-to="nutrients/${to}"` : 'div'} class="rn"><b>${n}</b><p>${line}</p>${to ? icon('chevR', 15) : ''}</${to ? 'button' : 'div'}>`; }).join('')}</div>
    </div></details>`;
}
function wkCenter() { const w = document.querySelector('.wk-regs'), b = w && w.querySelector('.on'); if (b) w.scrollLeft = b.offsetLeft - (w.clientWidth - b.offsetWidth) / 2; }
function wkPantry(k) {
  const P = PANTRY[k]; if (!P) return '';
  const open = ui.wkPan && ui.wkPan[0] === k ? ui.wkPan[1] : -1, cur = P[open];
  return `${sectionTitle('The pantry')}
    <div class="wkp">${P.map(([n, pic, g], i) => { const u = foodPhoto(pic, 300) || teaPhoto(pic, 300, 300); return `<button class="wkp-t ${i === open ? 'on' : ''}" data-action="wkPan" data-k="${k}" data-v="${i}" aria-expanded="${i === open}">
      <span class="wkp-img">${u ? `<img src="${u}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span><b>${n}</b><small>${g}</small></button>`; }).join('')}</div>
    ${cur ? `<div class="wkp-more"><b>${cur[0]}</b><p>${cur[3]}</p></div>` : '<p class="wx-hint">Tap a staple for how to use it</p>'}`;
}
function viewWorld(id) {
  if (id && worldOf(id)) { ui.worldReg = id; ui.lastRoute = 'world'; history.replaceState(null, '', '#/world'); }
  const R = worldOf(ui.worldReg) || worldOf(wkHome()), mine = M.info ? M.info.phase : null;
  const phase = ui.worldPhase || mine || 'follicular', PE = PHASE_EAT[phase], ds = R.dishes[phase];
  const warm = ds.filter(d => d.warm).length;
  return `<div class="pad wk">
    ${specHero({ photo: foodPhoto(R.pic, 1000), glyph: 'bowl', eyebrow: 'World kitchen', name: R.name, label: R.note,
      rows: [[`${ds.length} dishes`, warm === ds.length ? 'all warm & cooked' : warm ? `${warm} warm · ${ds.length - warm} raw` : 'fresh & raw'], [`${PHASES[phase].name}`, phase === mine ? 'your phase now' : 'phase']] })}
    <div class="wk-regs">${wkOrder().map(r => `<button class="${r.k === R.k ? 'on' : ''}" data-action="worldReg" data-k="${r.k}"><img src="${foodPhoto(r.pic, 120)}" alt="" loading="lazy"><span>${r.name.replace(' & Central European', '')}</span></button>`).join('')}</div>
    <div class="wk-ph">${PHASE_ORDER.map(p => `<button class="${p === phase ? 'on' : ''}" data-phase="${p}" data-action="worldPhase" data-v="${p}"><i></i><b>${PHASES[p].name}</b>${p === mine ? '<small>you</small>' : ''}</button>`).join('')}</div>
    <section class="card wk-rule" data-phase="${phase}"><span class="wk-ic">${icon(phase === 'menstrual' || phase === 'luteal' ? 'bowl' : 'leaf', 20)}</span>
      <div><b>${PE[0]}</b><p>${PE[1]}</p></div></section>
    ${ds.map((d, i) => wkDish(d, phase, i)).join('')}
    ${wkPantry(R.k)}
    <p class="fine center">Traditional dishes, made the natural way. Check every ingredient for allergies.</p>
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
  // By phase: one tile per phase with her average energy, her most logged mood and her most logged symptom there
  const phaseTiles = PHASE_ORDER.map(p => {
    const e = energyBy[p], avg = e ? e.reduce((a, b) => a + b, 0) / e.length : 0;
    const md = moodBy[p] ? Object.entries(moodBy[p]).sort((a, b) => b[1] - a[1])[0] : null;
    const sy = Object.entries(counts).map(([n, v]) => [n, v.by[p] || 0]).filter(x => x[1]).sort((a, b) => b[1] - a[1])[0];
    return `<div class="bph ${p === info.phase ? 'now' : ''}" style="--c:${PH_HEX[p]}">
      <span class="bph-h"><i></i>${PHASES[p].name}${p === info.phase ? '<em>Now</em>' : ''}</span>
      <span class="bph-e">${e ? `<b class="dotnum">${avg.toFixed(1)}</b><small>/5 energy</small>` : '<small class="bph-none">No energy logs yet</small>'}</span>
      <span class="bph-m" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="${e && avg >= n - .5 ? 'on' : ''}"></i>`).join('')}</span>
      <span class="bph-r">${icon('heart', 13)}${md ? `${md[0]} <small>${plural(md[1], 'day')}</small>` : '<small>No moods yet</small>'}</span>
      <span class="bph-r">${icon('drop', 13)}${sy ? `${sy[0]} <small>${sy[1]}×</small>` : '<small>No symptoms</small>'}</span></div>`;
  }).join('');

  const tab = ui.insTab || 'cycle'; const read = state.read || {};
  const tabs = [['cycle', 'Cycle'], ['patterns', 'Patterns'], ['learn', 'Learn']];
  let body = '';
  if (tab === 'cycle') body = `
    <section class="card glass big-chart">${cycleChart(info, { id: 'ins' })}</section>
    <button class="card gro-cta" data-action="nav" data-to="guide"><span class="art-ic cyc"><svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><g fill="none" stroke-width="5" stroke-linecap="round" transform="rotate(-90 20 20)"><circle cx="20" cy="20" r="13" stroke="#e58b9f" stroke-dasharray="13 69"/><circle cx="20" cy="20" r="13" stroke="#9cc27a" stroke-dasharray="19 63" stroke-dashoffset="-16"/><circle cx="20" cy="20" r="13" stroke="#f1c96a" stroke-dasharray="8 74" stroke-dashoffset="-38"/><circle cx="20" cy="20" r="13" stroke="#b9a2e8" stroke-dasharray="33 49" stroke-dashoffset="-49"/></g><circle cx="20" cy="20" r="4.5" fill="#fff" stroke="#f1c96a" stroke-width="1.5"/></svg></span><span class="art-t">How your cycle works<small>Slide through every day: ovary, lining, hormones</small></span>${icon('chevR', 18)}</button>
`;
  else if (tab === 'patterns') body = `
    ${patternsSection()}
    ${learnedCard()}
    ${sectionTitle('By phase')}
    <section class="bph-g">${phaseTiles}</section>
    <p class="bph-k">From your check-ins: average energy, the mood and the symptom you logged most in each phase.</p>`;
  else body = `
    <div class="lg-grid">${[['relief', 'heart', 'Relief guide', 'Cramps, PMS, sleep, skin'], ['habits', 'check', 'Hormone habits', 'A daily checklist'], ['hormones', 'chart', 'Your hormones', 'All 14, explained'], ['move', 'leaf', 'Move with your cycle', 'Lift, sprint or rest']].map(([to, g, t, sub], i) => `<button class="card glass lg-t" style="--i:${i}" data-action="nav" data-to="${to}"><span class="lg-g">${icon(g, 18)}</span><b>${t}</b><small>${sub}</small>${icon('chevR', 14)}</button>`).join('')}</div>
    ${[info.phase, ...PHASE_ORDER.filter(p => p !== info.phase), null].map(p => { const list = ARTICLES.filter(a => a.phase === p); return list.length ? `${sectionTitle(p ? PHASES[p].name + (p === info.phase ? ' · now' : '') : 'Foundations')}
      ${list.map(a => `<button class="card glass article-row" data-action="nav" data-to="article/${a.id}"><span class="art-ic ${read[a.id] ? 'done' : ''}">${icon(read[a.id] ? 'check' : 'book', 20)}</span><span class="art-t">${a.title}<small>${read[a.id] ? 'Read · ' : ''}${a.mins} min</small></span>${icon('chevR', 18)}</button>`).join('')}` : ''; }).join('')}`;
  return `${topbar('Insights')}
  <div class="pad">
    <h1 class="page-h">Your <span>hormone cycle</span></h1>
    <div class="seg">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="insTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

// What a woman needs in a day (EU reference values for women 18 to 50), for the micronutrient bars on a recipe
// one calm food photo per way of eating, for the onboarding picker
const DIET_PIC = { all: () => photoUrl('citrus-salmon-salad', 520), animal: () => 'images/period-food.webp', veg: () => photoUrl('egg-kraut-plate', 520), vegan: () => photoUrl('living-green-salad', 520) };
// ---------- The diet guide: what her way of eating needs to watch for her hormones ----------
const dietFocus = (G, phase) => { const f = G.items.filter(x => x.ph.includes(phase)); return (f.length ? f : G.items).slice(0, 2); };
function dietGuideCard(phase, compact) {
  const d = myDiet(), G = DIET_GUIDE[d]; if (!G) return '';
  const D = DIETS.find(x => x.k === d), F = dietFocus(G, phase);
  return `<button class="card dg-card" data-action="nav" data-to="diet"><span class="dg-top"><span class="dg-g">${D.g}</span><span><small>${G.title}</small><b>This ${PHASES[phase].name.toLowerCase()} phase: ${F.map(x => x.n).join(' and ')}</b></span>${icon('chevR', 16)}</span>
    ${compact ? '' : `<span class="dg-rows">${F.map(x => `<span class="dg-r"><i>${x.g}</i><span><b>${x.n}</b><small>${x.do.split('. ')[0].replace(/\.$/, '')}.</small></span></span>`).join('')}</span>
    ${G.items.some(x => x.tag === 'take') ? `<span class="dg-take"><small>To take</small>${G.items.filter(x => x.tag === 'take').map(x => `<em>${x.g} ${x.n}</em>`).join('')}</span>` : ''}`}</button>`;
}
// best foods for a nutrient as photos: match the guide's food words to the app's food photos
const DV_ALIAS = { 'ground flax': 'Ground flaxseed', 'chia': 'Chia seeds', 'oranges': 'Oranges & mandarins', 'kiwi': 'Kiwifruit', 'squash': 'Pumpkin & squash', 'tahini': 'Sesame seeds', 'nori': 'Seaweed (gim & miyeok)', 'a little nori': 'Seaweed (gim & miyeok)', 'uv-grown mushrooms': 'Mushrooms', 'egg yolks': 'Eggs', 'omega-3 eggs': 'Eggs', 'pasture eggs': 'Eggs', 'cooked spinach': 'Spinach', 'cooked greens': 'Spinach', 'raw milk': 'Grass-fed raw milk & butter', 'milk': 'Grass-fed raw milk & butter', 'beef liver': 'Red meat', 'liver': 'Red meat', 'yoghurt': 'Greek yoghurt', 'kefir': 'Kefir', 'raw cacao': 'Raw cacao', 'berries': 'Berries', 'broccoli': 'Broccoli', 'brussels sprouts': 'Brussels sprouts', 'peas': 'Peas', 'hemp seeds': 'Sunflower seeds', 'cashews': 'Almonds' };
function dvFoods(str) {
  const seen = new Set(), pics = [], words = [];
  for (const raw of String(str).split(/,\s*|\s+and\s+/)) {
    const w = raw.trim(); if (!w) continue; const lw = w.toLowerCase();
    const key = DV_ALIAS[lw] || Object.keys(FOOD_PHOTOS).find(k => k.toLowerCase() === lw);
    if (key && FOOD_PHOTOS[key] && !seen.has(key) && pics.length < 4) { seen.add(key); pics.push([w[0].toUpperCase() + w.slice(1), foodPhoto(key, 200)]); } else words.push(w[0].toUpperCase() + w.slice(1));
  }
  return { pics, words };
}
const DV_COV = [['Almost none', '#c9798f'], ['A little', '#c9a24a'], ['Enough with a plan', '#6c823e']];
const dvMeter = (c, d) => c == null ? '' : `<span class="dv-m" style="--m:${DV_COV[c][1]}" aria-label="${d === 'vegan' ? 'From plants' : 'From your food'}: ${DV_COV[c][0]}"><span>${[0, 1, 2].map(i => `<i class="${i <= c ? 'on' : ''}"></i>`).join('')}</span><small>${DV_COV[c][0]}</small></span>`;
const dvTint = x => PH_HEX[x.ph[0]] || '#6c823e';
function dvSheet(i) {
  const d = myDiet(), G = DIET_GUIDE[d], x = G && G.items[i]; if (!x) return '';
  const F = dvFoods(x.foods), steps = x.do.split(/(?<=\.)\s+/).filter(Boolean).slice(0, 3);
  return `<div class="dvs" style="--c:${dvTint(x)}"><button class="cfs-x" data-action="dvOpen" data-i="${i}" aria-label="Close">${icon('close', 14, 2.2)}</button>
    <div class="dvs-h"><span class="dv-g">${x.g}</span><span><small>${x.tag === 'take' ? 'Take it' : 'Plan it into meals'}</small><b>${x.n}</b></span></div>
    <p class="dvs-why">${x.why}</p>
    <ol class="dvs-do">${steps.map((t, k) => `<li><i>${k + 1}</i><span>${t}</span></li>`).join('')}</ol>
    ${F.pics.length ? `<div class="cfs-f dvs-f">${F.pics.map(([n, u]) => `<span><img src="${u}" alt="" loading="lazy"><em>${n}</em></span>`).join('')}</div>` : ''}
    ${F.words.length ? `<div class="cf-chips cfs-c">${F.words.map(w => `<em>${w}</em>`).join('')}</div>` : ''}
    ${x.ph.length ? `<div class="dvs-ph"><small>Matters most in</small>${PHASE_ORDER.map(k => `<span class="${x.ph.includes(k) ? 'on' : ''}" style="--c:${PH_HEX[k]}">${PHASES[k].name}</span>`).join('')}</div>` : ''}</div>`;
}
// a small picture of the guide inside onboarding, so she sees what she is signing up for
function dvPeek(d) {
  const G = DIET_GUIDE[d]; if (!G) return `<p class="dt-none">${icon('check', 13, 2.4)} Every recipe and food in the app fits you.</p>`;
  const take = G.items.filter(x => x.tag === 'take');
  return `<div class="dt-pk"><span class="dt-pg">${G.items.slice(0, 4).map((x, i) => `<i style="--c:${dvTint(x)};--i:${i}">${x.g}</i>`).join('')}${G.items.length > 4 ? `<i class="more">+${G.items.length - 4}</i>` : ''}</span>
    <span class="dt-pt"><b>Your ${d === 'animal' ? 'animal-based' : d === 'veg' ? 'vegetarian' : 'vegan'} guide</b><small>${take.length ? `${take.length} to take daily · ` : ''}${G.items.length - take.length} to plan into meals</small></span></div>`;
}
function viewDiet() {
  const d = myDiet(), G = DIET_GUIDE[d], info = M.info; if (!G) return viewMissing();
  const D = DIETS.find(x => x.k === d), phase = info ? info.phase : 'follicular', F = dietFocus(G, phase), take = G.items.filter(x => x.tag === 'take');
  const order = G.items.map((x, i) => ({ x, i, now: F.includes(x) })).sort((a, b) => b.now - a.now);
  const ring = x => `<span class="dv-rb" style="--c:${dvTint(x)}"><i>${x.g}</i><small>${x.n.replace('Vitamin ', 'Vit. ')}</small></span>`;
  return `${topbar('How you eat', { back: true })}
  <div class="pad dv">
    <section class="dv-hero"><img src="${DIET_PIC[d]()}" alt=""><span class="dv-shade"></span>
      <div class="dv-ht"><small>${D.t}${info ? ` · Day ${Math.min(info.cd, info.L)} · ${PHASES[phase].name}` : ''}</small><h1>${G.title}</h1></div>
      <div class="dv-glass"><div class="dv-num"><b>${G.items.length}</b><span>nutrients<br>to look after</span></div>
        <div class="dv-rings">${(take.length ? take : G.items.slice(0, 3)).map(ring).join('')}</div>
        <p>${G.lead}</p></div></section>

    ${take.length ? `${sectionTitle('Your daily take')}
    <div class="dv-caps">${take.map(x => `<section class="dv-cap" style="--c:${dvTint(x)}"><span class="dv-pill" aria-hidden="true"><i></i><i></i></span>
      <b class="dv-dose">${x.dose ? x.dose[0] : ''}</b><small class="dv-unit">${x.dose ? x.dose[1] : ''}</small>
      <span class="dv-cn">${x.g} ${x.n}</span><em class="dv-when">${icon('clock', 11)} ${x.dose ? x.dose[2] : 'every day'}</em></section>`).join('')}</div>
    <p class="fine dv-fine">Ask your doctor or pharmacist first if you take medication, are pregnant or breastfeeding.</p>` : ''}

    ${sectionTitle('What to look after')}
    <div class="dv-legend">${d === 'animal' ? '' : `<span>${d === 'vegan' ? 'From plants' : 'From your food'}:</span>${DV_COV.map(([t, c], k) => `<span style="--m:${c}"><i></i>${t}</span>`).join('')}`}</div>
    <div class="dv-grid">${order.map(({ x, i, now }) => `<button class="dv-t ${now ? 'now' : ''}" data-action="dvOpen" data-i="${i}" style="--c:${dvTint(x)}" aria-expanded="false">
      ${now ? `<span class="dv-now" style="background:${PH_HEX[phase]}">${PHASES[phase].name} now</span>` : x.tag === 'take' ? '<span class="dv-tk">Take</span>' : ''}
      <span class="dv-g">${x.g}</span><b>${x.n}</b>${dvMeter(x.cov, d)}<span class="dv-more">${icon('chevD', 13)}</span></button>`).join('')}</div>

    ${sectionTitle('Good to know')}
    <div class="dv-know">${G.warn.map(([t, g, x]) => `<section class="dv-k"><span class="dv-kg">${g}</span><b>${t}</b><p>${x}</p></section>`).join('')}</div>
    <button class="sup-all" data-action="nav" data-to="plan">Recipes that fit how you eat ${icon('chevR', 14)}</button>
  </div>`;
}
// ---------- How she eats: everything, animal-based, vegetarian or vegan ----------
const myDiet = () => (state && state.profile && state.profile.diet) || 'all';
const DX = { meat: /\b(meat|seafood|shellfish|healing broth|beef|chicken|lamb(?![’']s)|pork|bacon|turkey|duck|liver|oxtails?|marrow|bones?|prawns?|shrimp|salmon|fish|sardines?|mussels?|oysters?|anchov\w*|tuna|cod|mackerel|gelatin|collagen|organs?|steak|mince|ham|sausage|venison|heart)\b/i,
  egg: /\beggs?\b|yolks?|mayonnaise/i, dairy: /\b(milk|cheese|cheddar|butter|ghee|cream|yoghurt|yogurt|kefir|feta|parmesan|ricotta|halloumi|whey|labneh|quark)\b/i, honey: /\bhoney(comb)?\b/i,
  plant: /\b(lentils?|chickpeas?|beans?|quinoa|buckwheat|rice|tofu|tempeh|oats?|pasta|seitan|soy|edamame|hummus)\b/i };
const PLANT_WORDS = /\b(coconut|almond|oat|plant|soy|rice|cashew|hemp|nut)\s+(condensed\s+)?(milk|cream|yoghurt|yogurt)|\b(almond|peanut|nut|cashew|cacao|cocoa|seed|sunflower)\s+butter|butter lettuce|bean sprouts?|broad beans?|green beans?|vanilla beans?|vegetable broth/gi;
// gentle, safe swaps so a recipe works for her: honey to maple syrup, ghee and butter to olive oil, milk to almond milk
const VEGAN_SWAP = [[/\braw honey\b|\bhoney\b/gi, 'maple syrup'], [/\b(grass-fed )?(ghee or butter|butter or ghee|ghee|butter)\b(?! lettuce)/gi, 'olive oil'],
  [/\b(raw |whole |warm )?milk\b/gi, 'almond milk'], [/\b(raw )?cream\b/gi, 'coconut cream'], [/\b(raw |greek |full-fat greek )?(yoghurt|yogurt|kefir)\b/gi, 'coconut yoghurt'], [/\bbone broth\b/gi, 'vegetable broth']];
const VEG_SWAP = [[/\bbone broth\b/gi, 'vegetable broth']];
const lineKinds = t => { const c = t.replace(PLANT_WORDS, ' '); return { meat: DX.meat.test(c), egg: DX.egg.test(c), dairy: DX.dairy.test(c), honey: DX.honey.test(c), plant: DX.plant.test(c) }; };
const lineFits = (t, d) => { const k = lineKinds(t); return d === 'vegan' ? !k.meat && !k.egg && !k.dairy && !k.honey : d === 'veg' ? !k.meat : d === 'animal' ? !k.plant : true; };
const swapText = (t, d) => d === 'vegan' || d === 'veg' ? (d === 'vegan' ? VEGAN_SWAP : VEG_SWAP).reduce((x, [re, w]) => x.replace(re, (m, ...a) => (/^[A-Z]/.test(m) ? w.charAt(0).toUpperCase() + w.slice(1) : w)), t) : t;
// "200 ml raw milk (or almond milk)" and "1 tbsp olive oil or ghee" offer a choice: return each option as a full line
function lineAlts(line) {
  const q = line.match(ING_Q), qty = q ? q[0] : '', paren = line.match(/^(.*?)\s*\((?:or|use)\s+([^)]+)\)(.*)$/i);
  if (paren) return [paren[1] + paren[3], (/^\d|^[½¼¾]/.test(paren[2]) ? '' : qty) + paren[2] + paren[3]];
  const m = line.match(/^(.*?)\s+or\s+(.*)$/i);
  if (m && !/\bto\b\s*$/.test(m[1])) return [m[1], (/^\d|^[½¼¾]/.test(m[2]) ? '' : qty) + m[2]];
  return [line];
}
// one ingredient line for her diet: the option that fits, after safe swaps; null when it can't be made to fit
function dietLine(raw, d = myDiet()) {
  const pre = (String(raw).match(/^([A-Z][A-Za-z ]+):\s*/) || [''])[0], line = String(raw).slice(pre.length), opt = /^Optional:/i.test(pre);
  if (d === 'all') return raw;
  if (d === 'animal') { const a = lineAlts(line).find(x => lineFits(x, d)); return a ? pre + a : opt ? '' : null; }
  for (const a of lineAlts(line)) { if (lineFits(a, d)) return pre + a; const sw = swapText(a, d); if (sw !== a && lineFits(sw, d)) return pre + sw; }
  return opt ? '' : null;
}
const _dietFit = {};
function fitsDiet(r, d = myDiet()) {
  if (d === 'all') return true;
  const key = d + ':' + r.id; if (key in _dietFit) return _dietFit[key];
  const lines = (r.ingredients || []).map(x => dietLine(x, d));
  let ok = !lines.includes(null);
  if (ok && d === 'animal') ok = (r.ingredients || []).some(x => { const k = lineKinds(x); return k.meat || k.egg || k.dairy || k.honey; });
  return (_dietFit[key] = ok);
}
const myRecipes = () => RECIPES.filter(r => fitsDiet(r));
// plant foods that take the place of meat and fish for vegetarians and vegans, per phase
const PLANT_PROTEIN = { menstrual: ['🫘 Red lentils', '🫘 Black beans', '🎃 Pumpkin seeds', '🥚 Eggs'], follicular: ['🫘 Chickpeas', '🌱 Hemp seeds', '🫛 Peas', '🥚 Eggs'],
  ovulatory: ['🫘 White beans', '🫛 Edamame', '🥣 Chia seeds', '🥚 Eggs'], luteal: ['🫘 Black beans', '🥄 Tahini', '🌻 Sunflower seeds', '🥣 Greek yoghurt'] };
const PLANT_SUB = { menstrual: [['Lentils', 'Spinach'], ['Black beans', 'Beetroot'], ['Pumpkin seeds', 'Spinach']], follicular: [['Chickpeas', 'Broccoli'], ['Hemp seeds', 'Avocado'], ['Sprouted seeds', 'Broccoli']],
  ovulatory: [['White beans', 'Peas & broad beans'], ['Chia seeds', 'Walnuts'], ['Walnuts', 'Walnuts']], luteal: [['Tahini', 'Almonds'], ['Black beans', 'Kale'], ['Sunflower seeds', 'Almonds']] };
const plainFits = n => { const d = myDiet(); return d === 'all' || d === 'animal' || lineFits(n, d) || lineFits(swapText(n, d), d); };
// a phase's cycle-food card for her diet: foods that don't fit are swapped for plant ones that do the same job
function cycFoods(p) {
  const [t, d, foods, ph] = CYCLE_FOODS[p], dt = myDiet(); if (dt === 'all' || dt === 'animal') return [t, d, foods, ph];
  const sub = PLANT_SUB[p].slice(), subPh = PLANT_SUB[p].slice();
  return [t, d, foods.map(f => plainFits(f) ? f : (sub.shift() || ['Lentils'])[0]), ph.map(f => plainFits(f) ? f : (subPh.shift() || ['', 'Spinach'])[1])];
}
const dietChanged = r => { const d = myDiet(); return d !== 'all' && (r.ingredients || []).some(x => dietLine(x, d) !== x); };
const DAY_NEED = { Iron: [16, 'mg'], Zinc: [10, 'mg'], Magnesium: [300, 'mg'], Calcium: [950, 'mg'], Potassium: [3500, 'mg'], 'Vitamin C': [95, 'mg'], 'Vitamin A': [650, 'µg'], Folate: [330, 'µg'], 'Vitamin B12': [4, 'µg'], 'Vitamin B6': [1.6, 'mg'], Selenium: [70, 'µg'], Iodine: [150, 'µg'], 'Vitamin E': [11, 'mg'], 'Vitamin K': [70, 'µg'], 'Vitamin D': [15, 'µg'], Choline: [400, 'mg'], Copper: [1.3, 'mg'], 'Omega-3': [0.25, 'g'], 'Plant omega-3': [1.1, 'g'], Fibre: [25, 'g'], Riboflavin: [1.6, 'mg'], Sodium: [2000, 'mg'] };
const ING_Q = /^((?:juice of\s+)?(?:\d+(?:[.,]\d+)?|[½¼¾⅓⅔])(?:\s*(?:to|-)\s*\d+)?\s*(?:[½¼¾])?\s*(?:(?:small |big )?handfuls?|g|kg|ml|l|cups?|tbsp|tsp|cloves?|slices?|pinch|thumb)?\b|(?:1\s+)?(?:small |big )?handful|1 pinch|a pinch)\s*/i;
function recIngs(r) {
  const groups = [];
  r.ingredients.map(x => dietLine(x)).forEach((g, i) => { if (g === '' || g == null) return; const m = String(g).match(/^(Dressing|Salsa|Tortillas|Pesto|Salad|Drizzle|Glaze|Guacamole|Tzatziki|To serve|Optional):\s*(.*)$/i), head = m ? m[1] : '', t = m ? m[2] : String(g);
    let G = groups[groups.length - 1]; if (!G || G.head !== head) groups.push(G = { head, items: [] });
    const q = t.match(ING_Q), qty = q ? q[1].trim() : '', rest = q ? t.slice(q[0].length) : t;
    G.items.push({ i, qty: qty.charAt(0).toUpperCase() + qty.slice(1), name: qty ? rest : rest.charAt(0).toUpperCase() + rest.slice(1) }); });
  return groups.map(G => `${G.head ? `<div class="rci-h">${/^(Optional|To serve)$/i.test(G.head) ? G.head : `For the ${G.head.toLowerCase()}`}</div>` : ''}${G.items.map(x => { const k = r.id + x.i;
    return `<button class="check-row rci ${ui.checked[k] ? 'on' : ''}" data-action="check" data-k="${k}"><span class="cb">${icon('check', 14, 2.2)}</span><b class="rci-q">${x.qty}</b><span class="rci-n">${x.name}</span></button>`; }).join('')}`).join('');
}
function recMicro(r) {
  if (!r.micro) return '';
  const fmtN = v => (v >= 100 ? Math.round(v) : +v.toFixed(v < 1 ? 2 : 1)).toLocaleString('en');
  return `${sectionTitle('Micronutrients')}
    <section class="card rcm"><div class="rcm-h"><small>In one serving</small><b>Share of what you need in a day</b></div>
      ${r.micro.map(([n, v, u]) => { const need = DAY_NEED[n], pc = need ? Math.round(v / need[0] * 100) : 0;
        return `<div class="rcm-r ${pc >= 100 ? 'full' : ''}"><span class="rcm-n"><b>${n}</b><small>${fmtN(v)} ${u}</small></span><span class="rcm-bar"><i style="width:${Math.min(100, Math.max(4, pc))}%"></i></span><b class="rcm-p dotnum">${pc}<em>%</em></b></div>`; }).join('')}
      <p class="rcm-f">Estimates from standard food tables, against EU reference values for women.</p></section>`;
}
function viewRecipe(id) {
  const r = RECIPES.find(x => x.id === id); if (!r) return viewMissing();
  const fav = (state.favorites || []).includes(id), serves = r.serves || 1, D3 = dishModel(r);
  // a dish with its own hero model (the taco) turns in 3D at the top of the page; drag to spin it
  const media = D3 && D3.hero ? `<span class="cup3d-w rcp-3d"><img src="${D3.img}" alt=""><canvas class="teacup3d" data-model="${D3.model}" data-elev="${D3.elev || 0.9}" data-fit="${D3.heroFit || D3.fit}" data-steam="0" aria-label="${esc(r.name)} in 3D. Drag to turn it."></canvas></span>` : '';
  return `<div class="pad sp2 rcp">
    ${specHero({ media, photo: photoUrl(r.id) ? photoUrl(r.id, 1000) : '', glyph: '🥣', eyebrow: `${r.meal} · ${r.kcal} kcal a serving`, name: r.name, label: 'At a glance',
      rows: [['Serves', serves === 1 ? '1 person' : serves > 6 ? `${serves} pieces` : `${serves} people`], ['Time', `${r.time} min`], ['Protein', `${r.protein || '·'} g a serving`]],
      lead: `A ${r.meal.toLowerCase()} for your ${r.phases.map(p => PHASES[p].name).join(' & ')} phase`,
      desc: `${r.warm ? 'Warm and cooked, kind to your body around your period.' : r.raw ? 'Fresh and raw, best outside your period days.' : 'Good warm or at room temperature.'}`,
      extra: `<button class="spec-btn r fav ${fav ? 'on' : ''}" data-action="fav" data-id="${id}" aria-label="Save">${icon('heart', 20)}</button>` })}
    <section class="card glass tea-fit"><div class="tf-k">Made for${r.warm ? ' · warm & cooked' : r.raw ? ' · raw' : ''}</div>${phaseFit(r.phases, M.info && M.info.phase)}
      ${r.raw && warmWindow(M.info) ? `<p class="tea-warn">${icon('yinyang', 14)} Raw and cold: Chinese medicine says save it for after your period.</p>` : ''}</section>
    ${recMicro(r)}
    ${sectionTitle('Why it’s good for you')}
    <section class="card glass rn-list">${r.nutrients.map(n => { const [line, to] = NUTRIENT_ROLE[n] || ['']; return `<${to ? `button data-action="nav" data-to="nutrients/${to}"` : 'div'} class="rn"><b>${n}</b><p>${line}</p>${to ? icon('chevR', 15) : ''}</${to ? 'button' : 'div'}>`; }).join('')}</section>
    ${sectionTitle('Ingredients')}
    ${(() => { const d = myDiet(), D = DIETS.find(x => x.k === d); return d === 'all' ? '' : !fitsDiet(r) ? `<p class="rci-diet no">${icon('close', 12, 2.4)} Not ${D.t.toLowerCase()}: this one doesn't fit how you eat.</p>` : dietChanged(r) ? `<p class="rci-diet">${D.g} Made ${D.t.toLowerCase()} for you with simple swaps.</p>` : ''; })()}
    <section class="card rci-c"><div class="rci-top"><b><span class="dotnum">${r.ingredients.map(x => dietLine(x)).filter(Boolean).length}</span> ingredients</b><small>For ${serves === 1 ? '1 serving' : `${serves} ${serves > 6 ? 'pieces' : 'servings'}`} · tap to tick off</small></div>${recIngs(r)}</section>
    ${sectionTitle('Method')}
    <section class="card rcs">${r.steps.map((s, i) => { const [t, d] = Array.isArray(s) ? s : ['', s]; return `<div class="rcs-s"><span class="rcs-n dotnum">${i + 1}</span><div>${t ? `<b>${t}</b>` : ''}<p>${fitsDiet(r) ? swapText(d, myDiet()) : d}</p></div></div>`; }).join('')}</section>
    <p class="fine center">Check every ingredient for allergies before you cook.</p>
    ${r.source ? `<p class="fine center">Adapted from <a class="src" href="${r.url}" target="_blank" rel="noopener">${r.source}</a></p>` : ''}
    ${!media && RECIPE_PHOTOS[r.id]?.by ? `<p class="fine center">Photo: <a class="src" href="${RECIPE_PHOTOS[r.id].page}?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">${esc(RECIPE_PHOTOS[r.id].by)}</a> on <a class="src" href="https://unsplash.com/?utm_source=under_the_skin&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></p>` : ''}
  </div>`;
}
function viewRitual(id) {
  const r = RITUALS.find(x => x.id === id); if (!r) return viewMissing();
  return `<div class="pad sp2">
    ${specHero({ photo: carePhoto(r.id, 1000), glyph: r.glyph, han: true, eyebrow: 'TCM ritual', name: r.name, label: 'At a glance',
      rows: [[`${r.mins} min`, 'Time'], [!M.info ? `${r.phases.length} phases` : r.phases.includes(M.info.phase) ? 'Good today' : `From ${PHASES[r.phases.find(p => PHASE_ORDER.indexOf(p) > PHASE_ORDER.indexOf(M.info.phase)) || r.phases[0]].name.toLowerCase()}`, 'Your cycle'], [`${r.steps.length} steps`, 'Simple']],
      lead: 'Why it helps', desc: r.why })}
    <section class="card glass tea-fit"><div class="tf-k">Best in your cycle</div>${phaseFit(r.phases, M.info && M.info.phase)}</section>
    ${sectionTitle('Steps')}
    <section class="card glass">${r.steps.map((s, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${s}</p></div>`).join('')}</section>
    <button class="btn btn-light btn-block" data-action="timer" data-title="${esc(r.name)}" data-secs="${r.mins * 60}">${icon('play', 16)} Start ${r.mins}-minute timer</button>
    ${remedyScience(r, RITUAL_SCIENCE, false)}
    ${(() => { const nx = RITUALS[(RITUALS.indexOf(r) + 1) % RITUALS.length]; return `<button class="card glass nu-next" data-action="nav" data-to="ritual/${nx.id}"><small>Next ritual</small><b>${nx.name}</b>${icon('chevR', 16)}</button>`; })()}
  </div>`;
}
function viewPoint(phase) {
  const t = TCM[phase]; if (!t) return viewMissing();
  const p = t.point;
  // Hand-drawn where-to-press maps: inner ankle (SP6, KI3), lower belly (CV4), top of the foot (LV3).
  const ink = 'fill="#fdf0f3" stroke="#304023" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="13" class="pt-ring"/><circle cx="${x}" cy="${y}" r="6.5" class="pt-dot"/>`;
  const fingers = (x, y0, y1, w = 22) => Array.from({ length: 4 }, (_, i) => { const y = y0 + (y1 - y0) * (i + .5) / 4; return `<rect x="${x - w / 2}" y="${y - (y1 - y0) / 8 + 1.5}" width="${w}" height="${(y1 - y0) / 4 - 3}" rx="${(y1 - y0) / 8 - 1.5}" class="pt-fg"/>`; }).join('');
  const ankle = `<path d="M70 4 C 72 40, 74 70, 78 96 C 66 108, 44 116, 26 122 C 16 126, 16 140, 30 141 L 132 141 C 146 141, 150 128, 140 110 C 132 96, 128 60, 130 4" ${ink}/>
      <path d="M36 141 c 0 -6 6 -9 12 -9 M50 141 c 0 -5 5 -8 10 -8" fill="none" stroke="#304023" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>
      <ellipse cx="106" cy="104" rx="9" ry="7.5" fill="#f6dbe3" stroke="#304023" stroke-width="1.8"/>`;
  const art = {
    menstrual: `${ankle}${fingers(88, 52, 96, 20)}${dot(88, 48)}<text x="146" y="44" class="pt-lab">SP6</text><text x="146" y="60" class="pt-sub">4 fingers</text><text x="146" y="73" class="pt-sub">above</text>`,
    follicular: `${ankle}${dot(124, 104)}<text x="146" y="64" class="pt-lab">KI3</text><text x="146" y="80" class="pt-sub">ankle</text><text x="146" y="93" class="pt-sub">hollow</text>`,
    ovulatory: `<path d="M48 4 C 40 40, 44 80, 54 146 M152 4 C 160 40, 156 80, 146 146" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M50 4 C 42 40, 46 80, 56 146 L 144 146 C 154 80, 158 40, 150 4 Z" fill="#fdf0f3"/>
      <path d="M48 4 C 40 40, 44 80, 54 146 M152 4 C 160 40, 156 80, 146 146" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="100" cy="38" rx="3.2" ry="4.2" fill="#f6dbe3" stroke="#304023" stroke-width="2"/><text x="112" y="34" class="pt-sub">navel</text>
      ${fingers(100, 46, 96, 30)}${dot(100, 104)}<text x="166" y="100" class="pt-lab">CV4</text>`,
    luteal: `${[[73, 24, 11, 15], [96, 19, 7, 10], [112, 24, 6.5, 9], [126, 33, 6, 8], [138, 45, 5, 7]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${ink}/>`).join('')}
      <path d="M66 148 C 58 110, 52 72, 58 44 C 62 34, 84 34, 96 34 C 112 34, 140 46, 146 62 C 150 90, 140 122, 134 148 Z" ${ink}/>
      <path d="M77 42 C 79 60, 81 76, 84 92 M98 38 C 97 58, 96 76, 95 92" fill="none" stroke="#304023" stroke-width="1.5" stroke-linecap="round" opacity=".35"/>
      ${dot(89, 62)}<text x="154" y="72" class="pt-lab">LV3</text><text x="154" y="88" class="pt-sub">toe-bone</text><text x="154" y="101" class="pt-sub">dip</text>`,
  };
  const foot = `<svg viewBox="0 0 200 150" class="foot pt-art" role="img" aria-label="Where to press ${p.code}">${art[phase]}</svg>`;
  return `<div class="pad sp2">
    ${specHero({ glyph: '穴', han: true, eyebrow: `Acupressure · ${t.stage}`, name: `${p.code} · ${p.name}`, label: 'Key facts',
      rows: [[`${p.secs} s`, 'Press time'], [phase === 'ovulatory' ? 'One point' : 'Both sides', 'Where'], [t.organ, 'Organ']], lead: `${p.name} · what it does`, desc: p.does })}
    <section class="card glass tea-fit"><div class="tf-k">Best in your cycle</div>${phaseFit([phase], M.info && M.info.phase)}</section>
    ${sectionTitle('Where to press')}
    <section class="card card-light pt-where"><div class="pt-foot">${foot}</div><p class="dp-text">${p.where}</p></section>
    ${sectionTitle('How to press')}
    <section class="card glass"><div class="step"><span class="step-n">1</span><p>Find the point. It often feels a little tender.</p></div>
      <div class="step"><span class="step-n">2</span><p>${phase === 'ovulatory' ? 'Rest two fingertips on it and make slow small circles.' : 'Press firmly with your thumb, making slow small circles.'}</p></div>
      <div class="step"><span class="step-n">3</span><p>${phase === 'ovulatory' ? 'Keep the pressure gentle and breathe slowly into your belly. It sits on the midline, so there is only one.' : 'Breathe slowly into your belly. Repeat on the other side.'}</p></div></section>
    <button class="btn btn-light btn-block" data-action="timer" data-title="${p.code} · ${p.name}" data-secs="${p.secs}">${icon('play', 16)} Press for ${p.secs} seconds</button>
    ${POINT_SCIENCE[phase] ? `${sectionTitle('What studies found')}<section class="card glass tea-study"><div class="ts-i"><p>${POINT_SCIENCE[phase].study}</p><small>${POINT_SCIENCE[phase].cite}</small></div></section>` : ''}
    ${sectionTitle('A point for every phase')}
    <div class="tea-more">${PHASE_ORDER.map(ph => `<button class="${ph === phase ? 'on' : ''}" data-action="nav" data-to="point/${ph}"><span style="color:${PHASE_COLOR.dark[ph]}">●</span>${TCM[ph].point.code} · ${PHASES[ph].name}</button>`).join('')}</div>
    <p class="fine center">Avoid strong pressure on SP6 and CV4 if you might be pregnant.</p>
  </div>`;
}
// Reading progress as ring bubbles: letters so far, the cycle basics, minutes read, and the next unread one as the CTA.
function learnProgress(letters, read) {
  const R = 27, Cc = 2 * Math.PI * R, all = [...letters, ...ARTICLES], done = all.filter(x => read[x.id]);
  const mins = done.reduce((n, x) => n + (x.mins || 0), 0), total = all.reduce((n, x) => n + (x.mins || 0), 0);
  const items = [['✉', 'Letters', letters.filter(x => read[x.id]).length, letters.length, 'read'], ['◐', 'Basics', ARTICLES.filter(x => read[x.id]).length, ARTICLES.length, 'read'], ['◷', 'Minutes', mins, total, 'min']];
  const next = all.find(x => !read[x.id]);
  return `<section class="card glass pat-unlock lr-prog"><small>Your reading</small>
    <div class="mind-rings pu-rings">${items.map(([g, n, v, goal, u], i) => `<div class="mv2-b r${goal && v >= goal ? 3 : v ? 2 : 0}" style="--i:${i}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * Math.max(.04, Math.min(1, goal ? v / goal : 0))).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g">${goal && v >= goal ? '✓' : g}</span><b>${n}</b><small>${v} of ${goal} ${u}</small></div>`).join('')}</div>
    ${next ? `<p>Up next: <b>${next.title}</b></p><button class="pill-cta" data-action="nav" data-to="article/${next.id}">${icon('book', 14)} Read it · ${next.mins} min</button>` : '<p>You’ve read everything so far. The next letter arrives on the 1st.</p>'}</section>`;
}
function viewLearn() {
  const m = new Date().getMonth() + 1, read = state.read || {};
  const letters = LETTERS.filter(l => l.month <= m).reverse(), soon = LETTERS.find(l => l.month === m % 12 + 1);
  const card = (x, big) => { const u = readPic(x, big ? 900 : 500); return `<button class="lt ${big ? '' : 'sm'}" data-action="nav" data-to="article/${x.id}">${u ? `<img src="${u}" alt="" loading="lazy">` : glowArt('wave', 2)}<span class="lt-shade"></span>
    <span class="lt-tag">${readTopic(x)}${x.month ? ` · ${MONTHS[x.month - 1].slice(0, 3)}` : ''}${!read[x.id] ? '<i>new</i>' : ''}</span><span class="lt-b"><b>${x.title}</b>${x.lead ? `<small>${x.lead}</small>` : ''}<span class="lt-cta">${icon('book', 14)} ${x.mins} min</span></span></button>`; };
  return `${topbar('Read', { back: true })}
  <div class="pad">
    <h1 class="page-h">The Underskin <span>letter</span></h1>
    <p class="muted">A new read every month on a new topic, with the research behind it.</p>
    ${letters[0] ? card(letters[0], true) : ''}
    ${learnProgress(letters, read)}
    ${soon ? `<p class="lt-soon">${icon('clock', 13)} Next letter on 1 ${MONTHS[soon.month - 1]}: <b>${soon.tag.toLowerCase()}</b></p>` : ''}
    ${letters.length > 1 ? `${sectionTitle('Past letters')}<div class="lt-grid">${letters.slice(1).map(x => card(x)).join('')}</div>` : ''}
    ${sectionTitle('Your cycle, explained')}<div class="lt-grid">${ARTICLES.map(x => card(x)).join('')}</div>
  </div>`;
}
// The article graphic: estrogen and progesterone across her cycle, the article's phase lit, and where she is today.
function artGraph(a) {
  const info = M.info, L = info?.L || 28, P = info?.P || 5, W = 320, H = 132, top = 10, base = 100;
  const x = d => 8 + (d - 1) / (L - 1) * (W - 16), pts = k => Array.from({ length: L * 2 - 1 }, (_, i) => 1 + i / 2).map(d => `${x(d).toFixed(1)},${(base - C.hormonesAt(d, L, P)[k] * 82).toFixed(1)}`).join(' ');
  const rs = C.phaseRanges(L, P), focus = a.phase || info?.phase, cd = info ? Math.min(info.cd, L) : null;
  const band = rs.map(r => `<rect x="${x(r.from).toFixed(1)}" y="${base + 10}" width="${Math.max(4, x(r.to + .9) - x(r.from) - 3).toFixed(1)}" height="9" rx="4.5" fill="${PH_HEX[r.key]}" opacity="${r.key === focus ? 1 : .28}"/>`).join('');
  const lit = rs.find(r => r.key === focus), you = cd ? `<line x1="${x(cd)}" x2="${x(cd)}" y1="${top}" y2="${base + 6}" stroke="#20301a" stroke-width="1.2" stroke-dasharray="2 3"/><circle cx="${x(cd)}" cy="${base + 14.5}" r="6" fill="#fff" stroke="#20301a" stroke-width="2"/><text x="${Math.min(W - 26, Math.max(26, x(cd)))}" y="${base + 31}" text-anchor="middle" class="ag-you">You · day ${cd}</text>` : '';
  return `<section class="card art-graph"><div class="ag-h"><b>${a.phase ? `Your ${PHASES[a.phase].name.toLowerCase()} phase` : 'Your whole cycle'}</b><span><i style="--c:#6c823e"></i>Estrogen<i style="--c:#a07bd0"></i>Progesterone</span></div>
    <svg viewBox="0 0 ${W} ${H + 6}" aria-hidden="true">${lit ? `<rect x="${x(lit.from).toFixed(1)}" y="${top}" width="${(x(lit.to + .9) - x(lit.from)).toFixed(1)}" height="${base - top}" rx="10" fill="${PH_HEX[lit.key]}" opacity=".12"/>` : ''}
    <polyline points="${pts('estrogen')}" fill="none" stroke="#6c823e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${pts('progesterone')}" fill="none" stroke="#a07bd0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${band}${you}</svg></section>`;
}
function viewArticle(id) {
  const all = READS(), a = all.find(x => x.id === id); if (!a) return viewMissing();
  if (!(state.read || {})[a.id]) { state.read = { ...(state.read || {}), [a.id]: 1 }; save(); }
  const u = readPic(a, 1100), i = all.indexOf(a), m = new Date().getMonth() + 1;
  const nexts = all.filter(x => x !== a && (!x.month || x.month <= m)), n = nexts.find(x => !(state.read || {})[x.id]) || nexts[(i) % nexts.length];
  return `<section class="art-hero">${u ? `<img src="${u}" alt="">` : glowArt('wave', 4)}<span class="art-shade"></span>
    <button class="spec-btn" data-action="back" aria-label="Back">${icon('chevL', 22)}</button>
    <div class="art-h"><span class="lt-tag">${a.month ? `The Underskin letter · ${MONTHS[a.month - 1]}` : `${a.phase ? PHASES[a.phase].name + ' phase · ' : ''}${a.mins} min read`}</span><h1>${a.title}</h1>${a.lead ? `<p>${a.lead}</p>` : ''}</div></section>
  <div class="pad article">
    ${a.keys ? `<section class="card glass art-keys"><div class="spec-k">Key numbers</div>${a.keys.map(([b, t]) => `<div class="spec-row"><b>${b}</b><span>${t}</span></div>`).join('')}</section>` : ''}
    ${artGraph(a)}
    ${a.body.map((p, k) => `<p>${p}</p>${k === 1 && ARTICLE_PIC[a.id] ? `<figure class="art-fig"><img src="${ARTICLE_PIC[a.id][0]}" alt="" loading="lazy"><figcaption>${ARTICLE_PIC[a.id][1]}</figcaption></figure>` : ''}`).join('')}
    ${ARTICLE_STUDIES[a.id] ? `${sectionTitle('What studies found')}<section class="card gr-card gr-st art-st">${ARTICLE_STUDIES[a.id].map(([w, y, j, f, d]) => `<details><summary class="gr-s"><span class="gr-y">${y}</span><span class="gr-s-t"><b>${f}</b><small>${w} · ${j}</small></span>${icon('chevD', 14)}</summary><p class="gr-s-d">${d}</p></details>`).join('')}</section>` : ''}
    ${a.to ? `<button class="card glass art-do" data-action="nav" data-to="${a.to}"><span>Try it in the app</span>${icon('chevR', 16)}</button>` : ''}
    ${a.src ? `<section class="card glass tea-study art-src"><small>Sources · ${a.src}</small></section>` : ''}
    ${n ? `<button class="card nu-next art-next" data-action="nav" data-to="article/${n.id}">${readPic(n, 300) ? `<img src="${readPic(n, 300)}" alt="">` : ''}<span><small>Next read</small><b>${n.title}</b></span>${icon('chevR', 16)}</button>` : ''}
  </div>`;
}
function avatarInner(p) { return p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc((p.name || 'R')[0].toUpperCase()); }
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
// rain and birds under the onboarding: sound may only start after her first touch
// Sound on / off for the intro (rain, birds and air), remembered on this phone.
const sndMuted = () => { try { return localStorage.getItem('uts.sound') === 'off'; } catch (e) { return false; } };
const sndBtn = cls => `<button class="icon-btn dark snd-btn ${cls || ''}" data-action="sound" aria-pressed="${sndMuted()}" aria-label="${sndMuted() ? 'Sound on' : 'Sound off'}">${sndIcon(sndMuted())}</button>`;
const sndIcon = off => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>${off ? '<path d="m16 9.5 5 5m0-5-5 5"/>' : '<path d="M16 9a4.5 4.5 0 0 1 0 6M18.6 6.5a8 8 0 0 1 0 11"/>'}</svg>`;
const ambience = on => import('./sfx.js').then(S => S.ambience(on)).catch(() => {});
document.addEventListener('pointerdown', () => { if (!state?.onboarded) ambience(true); });
// Return in the gate's password field creates the account (or signs in) right there
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest?.('.gate-form')) { e.preventDefault(); const b = document.querySelector('.gate-form .ac-go'); if (b) actions.acEmail({}, b); } });
document.addEventListener('change', e => {
  const t = e.target, scope = t.dataset?.photo, f = t.files?.[0]; if (!scope || !f) return;
  readPhoto(f).then(d => {
    if (scope.startsWith('ba-')) { const ba = baGet(); ba[scope.slice(3)] = { d: Date.now(), img: d.full }; if (!baSet(ba)) return toast('Not enough space on this phone for the photo'); toast('Photo saved on this phone'); }
    else if (scope === 'onb') { ui.onb.photo = d.full; ui.onb.thumb = d.thumb; } else { state.profile.photo = d.full; state.profile.thumb = d.thumb; save(); toast('Profile picture saved'); }
    render();
  }).catch(() => toast('Couldn’t read that photo'));
});
// Ring bubbles on the profile hero: what the app has learned so far.
function profileRings() {
  const s = M.stats, info = M.info, n = s.periods.length, R = 27, Cc = 2 * Math.PI * R;
  const items = [
    ['Cycle', s.avgCycle, 'days', info ? info.cd / info.L : 1],
    ['Period', s.avgPeriod, 'days', s.avgPeriod / 7],
    ['Logged', n, n === 1 ? 'period' : 'periods', Math.min(1, n / 6)],
    ['Next', info ? info.daysToPeriod : '–', 'days', info ? 1 - info.daysToPeriod / info.L : 0],
  ];
  return `<div class="mind-rings pf-rings">${items.map(([t, v, u, f], i) => `<div class="mv2-b r3" style="--i:${i}"><svg viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="${R}"/><circle class="p" cx="32" cy="32" r="${R}" stroke-dasharray="${(Cc * Math.max(.06, Math.min(1, f))).toFixed(1)} ${Cc.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="mv2-g pf-n">${v}</span><b>${t}</b><small>${u}</small></div>`).join('')}</div>`;
}
const PF_TABS = [['you', 'You'], ['cycle', 'Cycle'], ['alerts', 'Reminders'], ['data', 'Data']];
function viewProfile() {
  const p = state.profile, s = M.stats, tab = ui.pfTab || 'you', n = s.periods.length;
  const learn = n >= 6 ? 'Your predictions are fully personal now.' : n >= 2 ? `Learning your rhythm · ${6 - n} more ${6 - n === 1 ? 'period' : 'periods'} to fully personal` : 'Log your periods and predictions become yours';
  let body;
  if (tab === 'cycle') body = `${sectionTitle('Cycle')}
    <section class="card glass">
      <div class="stepper-row"><span>Default cycle length<small>Used until you've logged 2+ periods · now ${s.avgCycle}d</small></span>${stepper('cycleLength', p.cycleLength, 'profile')}</div>
      <div class="stepper-row"><span>Default period length<small>Now ${s.avgPeriod}d</small></span>${stepper('periodLength', p.periodLength, 'profile')}</div>
    </section>
    ${sectionTitle('How you eat')}
    <section class="card glass"><div class="chips">${DIETS.map(x => `<button class="chip ${(p.diet || 'all') === x.k ? 'on' : ''}" data-action="setDiet" data-v="${x.k}">${x.g} ${x.t}</button>`).join('')}</div>
      <p class="fine" style="margin:10px 0 0">${DIETS.find(x => x.k === (p.diet || 'all')).s}. Your recipes, food guide and supplements follow this.${DIET_GUIDE[p.diet] ? ` <button class="link" data-action="nav" data-to="diet">Open your guide</button>` : ''}</p></section>
    ${sectionTitle('Birth control')}
    <section class="card glass"><div class="chips">${BIRTH_CONTROL.map(b => `<button class="chip ${(p.bc || 'none') === b.k ? 'on' : ''}" data-action="setBc" data-v="${b.k}">${b.t}</button>`).join('')}</div>
      ${hormonalBC(p.bc) ? `<p class="muted sm" style="margin:12px 0 8px">Coming off it?</p><div class="chips">${BC_PLAN.map(b => `<button class="chip ${p.bcPlan === b.k ? 'on' : ''}" data-action="setBcPlan" data-v="${b.k}">${b.t}</button>`).join('')}</div>` : ''}</section>
    ${M.info ? `<button class="card glass pf-link" data-action="nav" data-to="insights"><span>${icon('chart', 18)}</span><b>Your hormones & patterns<small>What the app has learned about you</small></b>${icon('chevR', 16)}</button>` : ''}`;
  else if (tab === 'alerts') body = `${remindersSection()}
    ${M.info ? calSyncCard() : ''}
    <button class="card glass pf-link" data-action="nav" data-to="saved"><span>${icon('save', 18)}</span><b>Saved tips<small>${(state.savedTips || []).length} saved, ready to use</small></b>${icon('chevR', 16)}</button>
    ${sectionTitle('Partner mode')}
    <section class="card glass"><button class="list-btn" data-action="nav" data-to="share">${icon('heart', 18)} Share my cycle with partner & friends</button>
      <button class="list-btn" data-action="nav" data-to="partners">${icon('chart', 18)} See my partners' dashboard</button>
      ${(state.partners || []).map(x => `<div class="list-btn">${ptAvatar(x, 'sm')}<span style="flex:1">${esc(x.n)}<small class="muted" style="display:block;font-size:12px">On your dashboard</small></span><button class="link muted-l" data-action="removePartner" data-id="${x.id}">Remove</button></div>`).join('')}</section>`;
  else if (tab === 'data') body = `${A.configured() || A.currentUser() ? accountCard() : ''}
    ${sectionTitle('Your data')}
    <section class="card glass">
      <button class="list-btn" data-action="export">${icon('download', 18)} Export my data (JSON)</button>
      ${A.currentUser() ? '' : `<button class="list-btn" data-action="demo">${icon('spark', 18)} Load sample cycles</button>`}
      <button class="list-btn" data-action="nav" data-to="privacy">${icon('heart', 18)} Privacy: how your data is kept</button>
      <button class="list-btn danger" data-action="reset">${icon('trash', 18)} Delete all data</button>
    </section>
    <p class="fine">${A.currentUser() ? 'Stored on this device and privately in your account.' : 'Everything is stored privately on this device.'} Underskin gives wellbeing estimates based on your logs and on Traditional Chinese Medicine concepts; it is not medical advice and must not be used as contraception.</p>`;
  else body = `${sectionTitle('Why you’re here')}
    ${purposePicker(purpose(), 'setPurpose')}
    ${sectionTitle('Your goals')}
    <section class="card glass">${focusPicker(focusKeys(), 'setFocus')}<p class="fine" style="margin:10px 0 0">Your daily tips follow these.</p></section>
    ${sectionTitle('Home')}
    <section class="card glass"><select class="field sm" data-input="profile.country" style="margin-top:10px" aria-label="Country">${SZ.COUNTRIES.map(([code, nm]) => `<option value="${code}" ${code === myCountry() ? 'selected' : ''}>${nm}</option>`).join('')}</select>
      <p class="fine" style="margin:8px 0 0">Your country sets what's in season.</p></section>`;
  const signedOut = A.configured() && !A.currentUser();
  return `${topbar('Profile', { back: true })}
  <div class="pad">
    <section class="card card-light pf-hero">
      <div class="profile-head"><label class="avatar xl ${p.photo ? 'has-photo' : ''}">${avatarInner(p)}<span class="av-edit">${icon('plus', 14, 2.4)}</span><input type="file" accept="image/*" data-photo="profile" hidden></label>
        <input class="field name-field" data-input="profile.name" value="${esc(p.name)}" placeholder="Your name" maxlength="24" aria-label="Your name"></div>
      <p class="pf-learn">${learn}</p>
      ${signedOut && tab !== 'data' ? `<button class="pill-cta pf-cta" data-action="pfTab" data-v="data">${icon('heart', 15)} Save my cycle to an account</button>` : ''}
    </section>
    <section class="card glass pf-stats ${ui.plAnim ? '' : 'still'}">${profileRings()}</section>
    <div class="seg pf-seg">${PF_TABS.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-action="pfTab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

// ---------- partner mode ----------
function b64e(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64d(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch { return null; } }
function shareLink(o = {}) { return `${appBase()}#/with?d=${b64e(mySnap(o))}`; }
function mySnap(o = {}) {
  const { stats } = M, last = stats.periods[stats.periods.length - 1];
  const snap = { n: state.profile.name || 'Her', s: C.iso(last.start), c: stats.avgCycle, p: stats.avgPeriod, a: ui.shareAudience, f: state.profile.noFertile ? 0 : 1, i: myInbox() };
  if (state.profile.ptWho === 'm' && ui.shareAudience !== 'friend') snap.w = 'm'; // he only views, he never tracks
  if (state.profile.thumb && !o.short) snap.t = state.profile.thumb;
  const mo = getLog(todayISO()).moods || [];
  if (!state.profile.noMood && mo.length) { snap.m = mo.slice(0, 6); snap.md = todayISO(); } // today's moods, shared as she logs them
  return snap;
}
// One link is enough: when she adds you, her app sends her own rhythm straight back to your inbox,
// and both apps re-send after each new period so you stay in sync.
async function syncTo(p) {
  if (!p.i || !M?.stats?.periods?.length) return false;
  const snap = { ...mySnap({ short: true }), a: p.a, w: undefined };
  try { const r = await fetch(RELAY + p.i, { method: 'POST', body: JSON.stringify({ k: 'pair', f: state.profile.name || 'Someone', fi: myInbox(), d: b64e(snap) }) }); return r.ok; } catch { return false; }
}
// Her latest rhythm also sits on a "-live" channel, so every link she ever sent (his too) opens up to date.
async function publishLive() {
  const last = M?.stats?.periods?.length && C.iso(M.stats.periods[M.stats.periods.length - 1].start);
  const { a, w, ...snap } = last ? mySnap({ short: true }) : {}, mk = snap.md ? snap.md + snap.m.join() : '';
  if (!last || !state.profile.linkSent || (state.profile.liveS === last && state.profile.liveM === mk && Date.now() - (state.profile.liveAt || 0) < 6 * 36e5)) return;
  state.profile.liveM = mk;
  try { const r = await fetch(`${RELAY}${myInbox()}-live`, { method: 'POST', body: JSON.stringify({ d: b64e(snap) }) }); if (r.ok) { state.profile.liveS = last; state.profile.liveAt = Date.now(); save(); } } catch {}
}
async function pullLive(i) {
  try {
    const txt = await (await fetch(`${RELAY}${i}-live/json?poll=1&since=all`)).text();
    const m = txt.split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(x => x && x.event === 'message').pop();
    const snap = m && b64d(JSON.parse(m.message).d || ''); return snap && snap.s && snap.c ? snap : null;
  } catch { return null; }
}
const fresher = (old, nw) => nw && (nw.s !== old.s || +!!nw.f !== +!!old.f || String(nw.m) + nw.md !== String(old.m) + old.md || +nw.c !== +old.c || +nw.p !== +old.p || nw.z !== old.z || nw.n !== old.n);
async function refreshPartners() {
  let changed = false;
  for (const p of (state.partners || []).filter(x => x.i)) { const nw = await pullLive(p.i); if (fresher(p, nw)) { Object.assign(p, { n: nw.n, s: nw.s, c: nw.c, p: nw.p, z: nw.z, f: nw.f, m: nw.m, md: nw.md }); changed = true; } }
  if (changed) { save(); if (['partners', 'today'].includes(route().name)) render(); }
}
// a link that is opened (or his saved view): swap in her latest rhythm if she has logged a new period since
const liveChecked = new Set();
async function refreshWith(d) {
  if (liveChecked.has(d)) return; liveChecked.add(d);
  const snap = b64d(d); if (!snap || !snap.i) return;
  const nw = await pullLive(snap.i); if (!fresher(snap, nw)) return;
  const nd = b64e({ ...snap, n: nw.n, s: nw.s, c: nw.c, p: nw.p, z: nw.z, f: nw.f, m: nw.m, md: nw.md }); liveChecked.add(nd);
  try { if (localStorage.getItem('uts.viewOnly') === d) localStorage.setItem('uts.viewOnly', nd); } catch {}
  if (route().name === 'with') history.replaceState(null, '', '#/with?d=' + nd);
  render();
}
function syncPartners() {
  const last = M?.stats?.periods?.length && C.iso(M.stats.periods[M.stats.periods.length - 1].start);
  if (!last || state.profile.syncedS === last) return;
  const ps = (state.partners || []).filter(p => p.i); if (!ps.length) return;
  state.profile.syncedS = last; save(); ps.forEach(syncTo);
}
// Cycle info rebuilt from a shared snapshot (projected forward cycle by cycle).
function snapInfo(snap, date) {
  const L = Math.round(Math.min(60, Math.max(15, +snap.c || 28))), P = Math.round(Math.min(10, Math.max(1, +snap.p || 5))), d = C.startOfDay(date), s = C.parseISO(String(snap.s));
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
    <p class="muted">Send a private link. They'll see your phase, how you might feel and how to show up for you. And it updates every day on its own. If your partner uses Underskin too, they can add you with one tap and you'll both see each other's cycle.</p>
    <div class="seg">${[['partner', 'Partner'], ['friend', 'Friends']].map(([k, l]) => `<button class="${aud === k ? 'on' : ''}" data-action="shareAud" data-v="${k}">${l}</button>`).join('')}</div>
    <section class="card card-light">
      <div class="eyebrow dark">They will see today</div>
      <h3 class="dark-h">${esc(state.profile.name || 'You')} · ${PHASES[M.info.phase].name}</h3>
      <p class="dp-text">${SUPPORT[M.info.phase].feel}</p>
      <div class="chips mt">${sup.do.slice(0, 3).map(x => `<span class="chip static">${esc(x)}</span>`).join('')}</div>
    </section>
    <section class="card glass">
      <div class="stepper-row"><span>Share period dates<small>Next period countdown</small></span><span class="toggle on locked"><i></i></span></div>
      <div class="stepper-row"><span>Share fertile window<small>Egg release and fertile days</small></span><button class="toggle ${state.profile.noFertile ? '' : 'on'}" data-action="shareFertile" role="switch" aria-checked="${!state.profile.noFertile}" aria-label="Share fertile window"><i></i></button></div>
      <div class="stepper-row"><span>Share today's mood<small>Updates on its own as you log it</small></span><button class="toggle ${state.profile.noMood ? '' : 'on'}" data-action="shareMood" role="switch" aria-checked="${!state.profile.noMood}" aria-label="Share today's mood"><i></i></button></div>
      <div class="stepper-row"><span>Symptoms & notes<small>Always private</small></span><span class="toggle locked"><i></i></span></div>
    </section>
    <button class="btn btn-light btn-block" data-action="shareSend">${icon('heart', 18)} Share link with ${aud === 'partner' ? 'my partner' : 'friends'}</button>
    <button class="btn btn-ghost btn-block" data-action="sharePreview">Preview what they'll see</button>
    <p class="fine center">The link holds your name and cycle estimates, plus your photo and star sign if you added them. Today's mood if you log one, never symptoms or notes. Anyone with the link can view it. Share it with people you trust.</p>
  </div>`;
}
// Little drawings for gift ideas, picked by what the gift is.
const GIFT_ART = [
  [/water bottle/i, '<rect x="22" y="16" width="20" height="6" rx="2" fill="#fff" stroke="#304023" stroke-width="2"/><path d="M16 26q0-4 4-4h24q4 0 4 4v22q0 8-8 8H24q-8 0-8-8z" fill="#efd4dd" stroke="#304023" stroke-width="2"/><path d="M22 34h20M22 40h20M22 46h20" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'],
  [/chocolate|snack|fries/i, '<rect x="16" y="14" width="32" height="40" rx="5" fill="#8a5a4a" stroke="#304023" stroke-width="2"/><path d="M16 27h32M16 40h32M32 14v40" stroke="#6f4536" stroke-width="2"/><path d="M16 36l32-14v32H21q-5 0-5-5z" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/>'],
  [/tea/i, '<path d="M14 26h30v12a13 13 0 0 1-13 13h-4A13 13 0 0 1 14 38z" fill="#fff" stroke="#304023" stroke-width="2"/><path d="M44 30h3a5 5 0 0 1 0 10h-4" fill="none" stroke="#304023" stroke-width="2"/><path d="M24 20q-3-4 0-7M32 20q-3-4 0-7" stroke="#8c9768" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="29" cy="37" r="4" fill="#e6b1c4"/>'],
  [/sock/i, '<path d="M24 12h14v24l8 6q5 5 0 10t-12 0l-10-8z" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M24 18h14M24 23h14" stroke="#fff" stroke-width="2.4"/>'],
  [/bath|salt/i, '<path d="M10 32h44v6a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12z" fill="#fff" stroke="#304023" stroke-width="2"/><circle cx="22" cy="26" r="5" fill="#efd4dd" stroke="#304023" stroke-width="1.6"/><circle cx="32" cy="22" r="3.5" fill="#e3ecc9" stroke="#304023" stroke-width="1.6"/><circle cx="40" cy="27" r="4" fill="#efd4dd" stroke="#304023" stroke-width="1.6"/>'],
  [/flower/i, '<path d="M32 34v20M32 46q-8-2-10-8M32 44q7-1 9-7" stroke="#6c823e" stroke-width="2" fill="none" stroke-linecap="round"/><g fill="#efd4dd" stroke="#304023" stroke-width="1.8"><circle cx="32" cy="16" r="6"/><circle cx="41" cy="23" r="6"/><circle cx="37" cy="33" r="6"/><circle cx="27" cy="33" r="6"/><circle cx="23" cy="23" r="6"/></g><circle cx="32" cy="25" r="4.5" fill="#f1c96a" stroke="#304023" stroke-width="1.6"/>'],
  [/book/i, '<path d="M10 18q11-4 22 2v32q-11-6-22-2z" fill="#fff" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M54 18q-11-4-22 2v32q11-6 22-2z" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M15 27q6-2 12 1M15 34q6-2 12 1" stroke="#8c9768" stroke-width="1.8" stroke-linecap="round" fill="none"/>'],
  [/ticket|class|workshop/i, '<path d="M10 22h44v6a4 4 0 0 0 0 8v6H10v-6a4 4 0 0 0 0-8z" fill="#e3ecc9" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M40 22v20" stroke="#304023" stroke-width="1.8" stroke-dasharray="3 3"/><path d="M24 28l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#e6b1c4" stroke="#304023" stroke-width="1.4" stroke-linejoin="round"/>'],
  [/dinner|reservation/i, '<circle cx="32" cy="34" r="16" fill="#fff" stroke="#304023" stroke-width="2"/><circle cx="32" cy="34" r="10" fill="#efd4dd"/><path d="M10 18v12M7 18v6q0 4 3 4t3-4v-6M54 18q-5 4-5 10h5v12" stroke="#304023" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
  [/wear/i, '<path d="M25 12q7 5 14 0l9 8-6 6v28H22V26l-6-6z" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M22 38h20" stroke="#fff" stroke-width="2.4"/>'],
  [/night|surprise/i, '<path d="M38 12a16 16 0 1 0 12 26 18 18 0 0 1-12-26z" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M48 14l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#f1c96a"/>'],
  [/massage/i, '<path d="M14 44q0-14 10-20l6 6q-6 4-6 14M50 44q0-14-10-20l-6 6q6 4 6 14" fill="#efd4dd" stroke="#304023" stroke-width="2" stroke-linejoin="round"/><path d="M32 14q-4 6 0 10 4-4 0-10z" fill="#e3ecc9" stroke="#304023" stroke-width="1.6"/>'],
];
function giftArt(g) { const a = (GIFT_ART.find(([r]) => r.test(g)) || [0, '<rect x="14" y="26" width="36" height="26" rx="4" fill="#efd4dd" stroke="#304023" stroke-width="2"/><rect x="11" y="20" width="42" height="9" rx="3" fill="#fff" stroke="#304023" stroke-width="2"/><path d="M32 20v32M32 20q-10-10-12-2t12 2q10-10 12-2t-12 2" fill="none" stroke="#304023" stroke-width="2"/>'])[1];
  return `<svg class="gift-art" viewBox="0 0 64 64" aria-hidden="true">${a}</svg>`; }
// Her next two weeks as a real calendar: date, phase colour, period drops, fertile days, today ringed.
function ptCalendar(snap, showF) {
  const today = C.startOfDay(new Date()), start = C.addDays(today, -((today.getDay() + 6) % 7)), cells = [];
  for (let i = 0; i < 14; i++) {
    const d = C.addDays(start, i), di = snapInfo(snap, d), past = d < today, isT = +d === +today;
    cells.push(`<div class="pc-d ${di.phase} ${past ? 'past' : ''} ${isT ? 'today' : ''} ${di.isPeriod ? 'per' : ''} ${showF && di.fertile ? 'fert' : ''}" style="--pc:${PHASE_COLOR.dark[di.phase]}">
      <b>${d.getDate()}</b>${di.isPeriod ? icon('drop', 11, 2) : showF && di.isOvulation ? '<i class="pc-egg"></i>' : showF && di.fertile ? '<i class="pc-dot"></i>' : '<i class="pc-none"></i>'}</div>`);
  }
  const wd = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('');
  return `<section class="card pt-cal"><div class="pc-h"><b>${fmt(start, { month: 'long' })}${start.getMonth() !== C.addDays(start, 13).getMonth() ? ` / ${fmt(C.addDays(start, 13), { month: 'long' })}` : ''}</b><small>This week and next</small></div>
    <div class="pc-wd">${wd}</div><div class="pc-grid">${cells.join('')}</div>
    <div class="pc-leg">${PHASE_ORDER.map(k => `<span><b style="background:${PHASE_COLOR.dark[k]}"></b>${PHASES[k].name}</span>`).join('')}<span>${icon('drop', 11, 2)} Period</span>${showF ? '<span><i class="pc-egg"></i> Egg release</span>' : ''}</div></section>`;
}
// For whoever loves her: how stressed her body tends to be today, and the best foods to bring her.
const PT_STRESS = { 'flow-start': 'Her body is working hard right now. Take things off her plate and keep plans calm.', 'flow-end': 'Stress is easing as her period ends. A slow walk together keeps it that way.', rising: 'She handles stress well now. A good time for plans and new things.', building: 'Plenty of energy. Help her wind down after busy days.', peak: 'High energy, but cortisol can climb. A calm evening helps.', settle: 'Things are steady. Cosy routines suit her now.', focus: 'Calm and focused, but less patient with chaos. Keep the evenings easy.', premenstrual: 'Stress hits harder these days. Patience, warmth and fewer plans go a long way.' };
function partnerCare(info, name) {
  const w = dayWindow(info), lvl = CALM[w][0], warm = info.isPeriod || info.cd > info.L - 4;
  const seen = new Set(), foods = [];
  const nd = NUTRITION[info.phase].needs.filter(x => x.ev !== 'tcm');
  for (let r = 0; r < 4 && foods.length < 6; r++) nd.forEach(x => { const f = x.foods.filter(y => !seen.has(y) && foodPhoto(y))[0]; if (f && foods.length < 6 && x.foods.indexOf(f) <= r) { seen.add(f); foods.push([f, x.n]); } }); // one per nutrient first
  return `${sectionTitle('Her stress today')}
    <section class="card pt-stress lv${lvl}"><div class="pts-top"><b>${['', 'Low', 'Medium', 'High'][lvl]}</b><span class="pts-bar">${[1, 2, 3].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span></div><p>${PT_STRESS[w]}</p></section>
    ${sectionTitle(`Best to eat for ${name}`)}
    <div class="hscroll pt-eat">${foods.map(([f, why]) => `<div class="pte"><img src="${foodPhoto(f, 300)}" alt="" loading="lazy"><b>${esc(f)}</b><small>For ${why.toLowerCase()}</small></div>`).join('')}</div>
    ${warm ? `<p class="fine pt-warm">${icon('thermo', 13)} Serve it warm and cooked these days. No iced drinks or cold raw food.</p>` : ''}`;
}
// ---- His day: men run on a 24-hour hormone rhythm. A small page for the man she shares her link with. ----
const HIS_BLOCKS = [
  [0, 3, 'Peak drive', 'Testosterone is at its highest after waking. Best for hard training, hard thinking and big decisions.', 'bolt'],
  [3, 7, 'Steady focus', 'Calm, clear and productive. Good for deep work, meetings and getting things done.', 'chart'],
  [7, 11, 'Strongest body', 'Body temperature peaks in the late afternoon, so strength, speed and sport usually feel best now.', 'dumbbell'],
  [11, 15, 'Wind down', 'Testosterone is lower and you’re calmer and more open. The best time for her, for talks and for cooking together.', 'heart'],
  [15, 24, 'Rebuild', 'Sleep. Most of your testosterone is made in deep sleep, so 7 to 9 hours keeps your drive high tomorrow.', 'moon'],
];
function hisWake() { try { return +localStorage.getItem('uts.wake') || 7; } catch { return 7; } }
function hisDay(info, name) {
  const w = hisWake(), h = nowH(), since = ((h - w) % 24 + 24) % 24, b = HIS_BLOCKS.find(x => since >= x[0] && since < x[1]);
  const tAt = t => .5 + .42 * Math.cos(2 * Math.PI * (t - 1) / 24); // hours since waking, peak about an hour after waking
  const W = 320, H = 110, X = t => 8 + t / 24 * (W - 16), Y = v => H - 22 - v * (H - 40);
  let d = ''; for (let t = 0; t <= 24; t += .25) d += `${d ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(tAt(t)).toFixed(1)}`;
  const bands = HIS_BLOCKS.map(([a, z, n], i) => `<rect x="${X(a)}" y="6" width="${X(z) - X(a)}" height="${H - 26}" rx="8" fill="${['#efd4dd', '#f5f0e6', '#e3ecc9', '#f3e2ea', '#e6e4f2'][i]}" opacity=".7"/>`).join('');
  const her = C.energyAt(info.cd, info.L, info.P), low = info.isPeriod || info.cd > info.L - 4;
  const together = low ? `${name}'s energy is low this week. Use your morning drive for the jobs, then bring her your calm evening: warm food, no big plans.`
    : her > .7 ? `You're both full of energy. Plan something active together in your late afternoon, when your body is strongest.`
    : `${name} is steady and focused. Keep evenings easy and save the big plans for when her energy rises.`;
  return `<section class="card his-now"><div class="hn-top"><span class="hn-ic">${icon(b[4], 20)}</span><div><small>Right now · ${hLabel(h)}</small><b>${b[2]}</b></div></div><p>${b[3]}</p></section>
    <section class="card his-curve"><div class="hc-h"><b>Your testosterone today</b><small>Woke at ${hLabel(w)}</small></div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" aria-label="Testosterone over your day, highest after waking">${bands}<path d="${d}" fill="none" stroke="#304023" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="${X(since)}" x2="${X(since)}" y1="6" y2="${H - 20}" stroke="#304023" stroke-dasharray="2 3" opacity=".5"/><circle cx="${X(since)}" cy="${Y(tAt(since))}" r="5.5" fill="#fff" stroke="#304023" stroke-width="2"/>
        ${[0, 6, 12, 18, 24].map(t => `<text x="${X(t)}" y="${H - 4}" text-anchor="${t === 0 ? 'start' : t === 24 ? 'end' : 'middle'}" class="hc-ax">${hLabel(w + t)}</text>`).join('')}</svg>
      <div class="hc-wake"><span>I usually wake at</span>${[5, 6, 7, 8, 9].map(x => `<button class="${x === w ? 'on' : ''}" data-action="hisWake" data-v="${x}">${x}:00</button>`).join('')}</div></section>
    <section class="card his-blocks">${HIS_BLOCKS.map(([a, z, n, t, ic]) => `<div class="hb ${b[2] === n ? 'on' : ''}"><span class="hb-t">${hLabel(w + a)}</span><span class="hb-ic">${icon(ic, 16)}</span><div><b>${n}</b><p>${t}</p></div></div>`).join('')}</section>
    <section class="card his-tog"><small>You two today</small><p>${together}</p></section>`;
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
  const mine = state && state.onboarded && M?.stats?.periods?.length && snap.n === (state.profile.name || 'Her') && snap.s === C.iso(M.stats.periods[M.stats.periods.length - 1].start);
  const him = snap.w === 'm'; // a man only views her rhythm, he never tracks
  if (!(state && state.onboarded)) { try { localStorage.setItem(him ? 'uts.viewOnly' : 'uts.pendingPartner', q.get('d')); } catch {} }
  return `<header class="topbar">${state && state.onboarded ? `<button class="icon-btn dark" data-action="nav" data-to="partners" aria-label="Back">${icon('chevL', 22)}</button>` : '<span class="tb-spacer"></span>'}<div class="topbar-title">${name}’s rhythm</div><span style="width:40px"></span></header>
  ${mine ? `<div class="preview-bar">Preview: this is what she’ll see <button data-action="nav" data-to="partners">Done</button></div>` : ''}
  <div class="pad">
    ${him ? `<div class="seg his-seg">${[['her', `${name}'s rhythm`], ['his', 'My day']].map(([k, l]) => `<button class="${(ui.hisTab || 'her') === k ? 'on' : ''}" data-action="hisTab" data-v="${k}">${l}</button>`).join('')}</div>` : ''}
    ${him && ui.hisTab === 'his' ? `<h1 class="hello" style="margin:6px 0 16px">Your <b>24-hour rhythm</b></h1>${hisDay(info, name)}</div>` : `
    <div class="eyebrow">${role === 'partner' ? 'Partner view' : 'Friend view'} · ${fmt(today, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
    <h1 class="hello" style="margin:6px 0 16px">${name} is in her<br><b>${ph.name} phase</b></h1>
    <section class="hub pt-stage">${stageHero(info, Math.round(C.energyAt(info.cd, info.L, info.P) * 100), { nav: false, id: 'with', fert: !!snap.f })}</section>
    ${(() => { const g = DAY_GUIDE[dayWindow(info)], rec = pick(recipesFor(info.phase, info), dayNum(today)); return `
    <section class="card glass pv-day">
      <div class="pv-top"><div><div class="eyebrow">Her day · ${g.energy.toLowerCase()} energy</div><h3>${g.title}</h3></div><span class="pv-e">${g.energy}</span></div>
      <p class="body sm">Today is best for ${g.best.slice(0, 3).join(', ').toLowerCase()}.</p>
    </section>
    <details class="card glass pv-cook"><summary>${photoUrl(rec.id) ? `<img class="pv-cook-img" src="${photoUrl(rec.id)}" alt="" loading="lazy">` : `<span class="art-ic">${icon('bowl', 20)}</span>`}<span class="art-t">Cook for her: ${rec.name}<small>${rec.warm ? 'Warm & cooked: just right for this phase' : rec.raw ? 'Fresh & raw: perfect for her phase' : 'Made for her phase'} · ${rec.time} min</small></span>${icon('chevD', 18)}</summary>
      <div class="pv-rec"><div class="eyebrow">Ingredients</div>${rec.ingredients.map(g => `<div class="ing">${icon('leaf', 14)}<span>${g}</span></div>`).join('')}
      <div class="eyebrow mt">Method</div>${rec.steps.map((x, i) => `<div class="step"><span class="step-n">${i + 1}</span><p>${x}</p></div>`).join('')}</div></details>`; })()}
    ${partnerCare(info, name)}
    ${sectionTitle('How she may feel')}
    <section class="card glass"><p class="body" style="margin:0">${S.feel}</p></section>
    ${sectionTitle(role === 'partner' ? 'How to show up' : 'How to be a good friend')}
    <section class="card glass">${list(sup.do, 'yes')}</section>
    ${role === 'partner' ? `${sectionTitle('What to give her')}
    <div class="hscroll">${sup.gifts.map((g, i) => `<div class="rcard gift g2">${giftArt(g)}<div class="rc-t">${esc(g.replace(/\s*😉/, ''))}</div></div>`).join('')}</div>
    ${sectionTitle('Maybe avoid')}<section class="card glass">${list(sup.avoid, 'no')}</section>
    ${role === 'partner' ? `<section class="card glass tea-study pv-why"><div class="eyebrow">Why your support matters</div><div class="ts-i"><p>When partners took part in a programme for premenstrual distress, women felt more understood and less distressed than when they went alone. Small things count most: noticing, listening, taking something off her plate.</p><small>Ussher & Perz 2017</small></div></section>` : ''}
    <section class="card tcm-card"><div class="tcm-glyph">${tcm.elementGlyph}</div><div class="tcm-main"><div class="eyebrow">Make her a cup of</div><h3>${tcm.tea.name}</h3><p class="body sm">${tcm.tea.why}</p></div></section>
    <section class="card card-light"><div class="eyebrow dark">Date idea</div><h3 class="dark-h">${esc(sup.date)}</h3></section>`
    : `<section class="card card-light"><div class="eyebrow dark">Plan idea</div><h3 class="dark-h">${esc(sup.plan)}</h3></section>`}
    ${sectionTitle('Her hormones')}
    <section class="card glass chart-card">${cycleChart(info, { id: 'with', compact: true, who: 'Her' })}</section>
    ${sectionTitle('Her next two weeks')}
    ${ptCalendar(snap, !!snap.f)}
    <p class="fine center">Estimates based on her cycle. Every body is different, so ask her too.</p>
    ${mine ? '' : state && state.onboarded
      ? ((state.partners || []).some(x => x.n === snap.n && x.s === snap.s)
        ? `<a class="btn btn-ghost btn-block" href="#/today">${icon('check', 16)} ${name} is on your dashboard</a>`
        : `<button class="btn btn-light btn-block" data-action="addPartner" data-d="${esc(q.get('d'))}">${icon('heart', 16)} Add ${name} to my app</button>
           <p class="fine center">You both use Underskin. Add her and you’ll see each other’s cycle side by side.</p>`)
      : him ? `<section class="card glass pv-save"><b>Keep ${name} close</b><p class="body sm">Nothing to set up and nothing to track. Save this page to your home screen and it shows where she is every day.</p></section>
         <button class="link center-link" data-action="trackMine">I want to track my own cycle</button>`
      : `<a class="btn btn-light btn-block" href="#/today">Start tracking my cycle</a>
         <p class="fine center">Set up your own cycle and ${name} is added to your app. Then send her your link so you see each other.</p>`}
  </div>`}`;
}

// ---------- account ----------
// First screen after the welcome: save with an account, or go on without one (and know what that means).
function viewGate() {
  const flash = ui.flashOut ? '<div class="flash-out"></div>' : ''; ui.flashOut = false;
  const anim = ui.onbAnim || ''; ui.onbAnim = '';
  const f = true, si = ui.acMode === 'signin'; // sign up / sign in are visible right away
  return `<div class="onb no-fig gate ${anim} ${f ? 'form-on' : ''} ${si ? 'mode-signin' : ''}">${flash}
    <div class="onb-top"><button class="icon-btn dark" data-action="onbBack" aria-label="Back">${icon('chevL', 22)}</button><button class="link gate-signin" data-action="gateSignIn">Already have an account? <u>Sign in</u></button>${sndBtn()}</div>
    <div class="gate-photo" aria-hidden="true"><img src="images/gate-rose.webp" alt="" decoding="async"></div>
    <h2 class="onb-title">Keep your cycle <span>safe with you</span></h2>
    <p class="gate-lead">A free account saves every period, symptom and note, and brings them back on any new phone.</p>
    <label class="ac-consent"><input type="checkbox" id="ac-consent"><span>I agree that my cycle and health logs are kept in my private account. I can delete them anytime. <a href="#/privacy">Privacy</a></span></label>
    <label class="ac-consent ac-terms"><input type="checkbox" id="ac-terms" ${termsOK() ? 'checked' : ''}><span>I understand Underskin is general wellness information, not medical advice. Everything I try from it (food, tea, herbs, supplements, remedies, training, breathing, grounding and every other idea) is my own choice, at my own risk and my own responsibility. I check allergies, medicines and my health myself, and I ask a doctor when unsure. <a href="#/privacy">Terms</a></span></label>
    <button class="ac-btn ac-mail" data-action="gateEmail">${icon('user', 18)}<span>Continue with email</span></button>
    <form class="gate-form" onsubmit="return false" aria-hidden="${!f}">
      <div class="gf-seg" role="tablist"><button type="button" class="gf-c" data-action="gateMode" data-v="create" role="tab">Create account</button><button type="button" class="gf-s" data-action="gateMode" data-v="signin" role="tab">Sign in</button></div>
      <input class="field" id="ac-email" aria-label="Email" type="email" inputmode="email" autocomplete="email" placeholder="Email" value="${esc(ui.acEmail || '')}" ${f ? '' : 'tabindex="-1"'}>
      <input class="field" id="ac-pw" aria-label="Password" type="password" autocomplete="${si ? 'current-password' : 'new-password'}" placeholder="${si ? 'Password' : 'Password · at least 8 characters'}" ${f ? '' : 'tabindex="-1"'}>
      <button type="button" class="ac-btn ac-go" data-action="acEmail"><span class="gf-c">Create my account</span><span class="gf-s">Sign in</span></button>
      <button type="button" class="link ac-forgot gf-s" data-action="acForgot">Forgot password?</button>
    </form>
    ${A.oauthOK('apple') ? `<button class="ac-btn ac-apple" data-action="acProvider" data-p="apple">${APPLE_SVG}<span>Continue with Apple</span></button>` : ''}
    ${A.oauthOK('google') ? `<button class="ac-btn ac-google" data-action="acProvider" data-p="google">${GOOGLE_SVG}<span>Continue with Google</span></button>` : ''}
    <p class="ac-msg" id="ac-msg" role="status"></p>
    <div class="gate-later">
      <button class="gate-skip" data-action="gateSkip">Use without an account</button>
      <p class="gate-warn"><b>Your data won’t be saved anywhere else.</b> It lives only on this phone: if you delete the app, ${NATIVE ? 'clear its data' : 'clear your browser'} or change phones, it’s gone for good. You can create an account later in Profile.</p>
    </div>
  </div>`;
}
const APPLE_SVG = `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M16.37 12.78c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.38.81 1.4-.02 2.28-1.27 3.13-2.53.99-1.45 1.39-2.85 1.42-2.92-.03-.01-2.72-1.04-2.71-4.13zM13.8 5.15c.71-.87 1.2-2.07 1.06-3.27-1.03.04-2.28.69-3.02 1.55-.66.76-1.24 1.99-1.09 3.16 1.15.09 2.33-.58 3.05-1.44z"/></svg>`;
// Google's sign-in rules ask for its four-colour mark unchanged — the only colour exception in the app.
const GOOGLE_SVG = `<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="hsl(calc(var(--hb) + 136 * var(--hk)) calc(53% * var(--hs2)) 43%)" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;
function accountCard() {
  const u = A.currentUser();
  if (u) return `<button class="ac-mini glass" data-action="nav" data-to="account"><span class="ac-cloud">${icon('check', 16, 2.4)}</span><span><b>Saved to your account</b><small>${esc(u.email || 'Signed in')}</small></span>${icon('chevL', 16)}</button>`;
  return `<section class="ac-promo card-light"><div class="eyebrow dark">Account</div><h3>Never lose your cycle</h3><p>Save your periods and logs to a private account. Sign in on any phone and everything is there.</p><button class="btn btn-dark btn-block" data-action="nav" data-to="account">Create account or sign in</button></section>`;
}
function syncLine() {
  if (sync.busy) return 'Syncing…';
  if (sync.err) return `Not synced: ${esc(sync.err)}`;
  if (!sync.at) return 'Ready';
  const m = Math.round((Date.now() - sync.at) / 60000);
  return `Synced ${m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `at ${new Date(sync.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}`;
}
function viewAccount() {
  const u = A.currentUser(), on = !!(state && state.onboarded);
  const head = topbar('Account', { back: true });
  if (ui.acRecover) return `${head}<div class="pad ac">
    <section class="ac-hero card-light"><div class="eyebrow dark">Account</div><h2>Choose a new password</h2><p>At least 8 characters.</p></section>
    <section class="card glass ac-form"><input class="field" id="ac-pw" aria-label="Password" type="password" autocomplete="new-password" placeholder="New password" minlength="8">
      <button class="btn btn-light btn-block" data-action="acNewPw">Save new password</button><p class="ac-msg" id="ac-msg" role="status"></p></section></div>`;
  if (u) return `${head}<div class="pad ac">
    <section class="ac-hero card-light"><div class="eyebrow dark">Signed in</div><h2>Your data is saved</h2><p class="ac-email">${esc(u.email || '')}</p>
      <div class="ac-sync"><i class="${sync.err ? 'bad' : sync.busy ? 'busy' : ''}"></i>${syncLine()}</div></section>
    ${on ? '' : `<button class="btn btn-light btn-block" data-action="nav" data-to="today">Set up my cycle</button>`}
    <section class="card glass">
      <button class="list-btn" data-action="acSync">${icon('download', 18)} Sync now</button>
      <button class="list-btn" data-action="acSignOut">${icon('user', 18)} Sign out<small class="muted ac-sub">Your data stays on this phone</small></button>
      <button class="list-btn danger" data-action="acDelete">${icon('trash', 18)} Delete account<small class="muted ac-sub">Erases your account and the cloud copy</small></button>
    </section>
    <p class="fine">Every change you log is saved to your account a moment later. Your data is locked to your login, kept in the EU and never sold or shared.</p></div>`;
  const mode = ui.acMode || (on ? 'create' : 'signin'), create = mode === 'create';
  return `${head}<div class="pad ac">
    <section class="ac-hero card-light"><div class="eyebrow dark">${create ? 'Create account' : 'Welcome back'}</div><h2>${create ? 'Save your cycle' : 'Sign in'}</h2>
      <p>${create ? 'Keep your periods and logs safe in a private account, and take them to any new phone.' : 'Your periods, logs and plans come back onto this phone.'}</p></section>
    <div class="ac-seg" role="tablist"><button class="${create ? 'on' : ''}" data-action="acMode" data-v="create" role="tab" aria-selected="${create}">Create account</button><button class="${create ? '' : 'on'}" data-action="acMode" data-v="signin" role="tab" aria-selected="${!create}">Sign in</button></div>
    ${create ? `<label class="ac-consent"><input type="checkbox" id="ac-consent"><span>I agree that my cycle and health logs are kept in my private account so they sync between my phones. I can delete them anytime. <a href="#/privacy">Privacy</a></span></label><label class="ac-consent ac-terms"><input type="checkbox" id="ac-terms" ${termsOK() ? 'checked' : ''}><span>I understand Underskin is general wellness information, not medical advice. Everything I try from it (food, tea, herbs, supplements, remedies, training, breathing, grounding and every other idea) is my own choice, at my own risk and my own responsibility. I check allergies, medicines and my health myself, and I ask a doctor when unsure. <a href="#/privacy">Terms</a></span></label>` : ''}
    ${A.oauthOK('apple') ? `<button class="ac-btn ac-apple" data-action="acProvider" data-p="apple">${APPLE_SVG}<span>${create ? 'Sign up' : 'Sign in'} with Apple</span></button>` : ''}
    ${A.oauthOK('google') ? `<button class="ac-btn ac-google" data-action="acProvider" data-p="google">${GOOGLE_SVG}<span>${create ? 'Sign up' : 'Sign in'} with Google</span></button>` : ''}
    ${A.oauthOK('apple') || A.oauthOK('google') ? '<div class="ac-or"><span>or with email</span></div>' : ''}
    <section class="card glass ac-form">
      <input class="field" id="ac-email" aria-label="Email" type="email" inputmode="email" autocomplete="email" placeholder="Email" value="${esc(ui.acEmail || '')}">
      <input class="field" id="ac-pw" aria-label="Password" type="password" autocomplete="${create ? 'new-password' : 'current-password'}" placeholder="${create ? 'Password · at least 8 characters' : 'Password'}">
      <button class="btn btn-light btn-block" data-action="acEmail">${create ? 'Create account' : 'Sign in'}</button>
      ${create ? '' : '<button class="link ac-forgot" data-action="acForgot">Forgot password?</button>'}
      <p class="ac-msg" id="ac-msg" role="status">${A.configured() ? '' : 'Accounts open very soon. Until then everything stays safely on this phone.'}</p>
    </section>
    <p class="fine">${create ? '' : 'By signing in you agree that your logs are kept in your private account. '}No account needed to use the app. Without one, everything stays only on this phone.</p></div>`;
}
function termsSheet() {
  return `<div class="tm-wrap" role="dialog" aria-modal="true" aria-labelledby="tm-h"><section class="tm-sheet">
    <span class="tm-e" aria-hidden="true">🌿</span><h2 id="tm-h">One thing before you go on</h2>
    <p>Underskin shares general wellness information, not medical advice. Food, teas, herbs, supplements, remedies, training, breathing and grounding can all affect your body.</p>
    <p><b>Everything you try is your own choice, at your own risk and your own responsibility.</b> Check every ingredient for allergies and medicine clashes, and listen to your body. If you are pregnant, breastfeeding, on medication or have a health condition, ask your doctor or pharmacist first.</p>
    <button class="btn btn-dark btn-block" data-action="termsAgree">I understand and agree</button>
    <a class="tm-link" href="#/privacy">Read the full terms</a></section></div>`;
}
function viewPrivacy() {
  return `${topbar('Privacy', { back: true })}
  <div class="pad article">
    <div class="eyebrow">Underskin</div>
    <h1>Your data stays with you</h1>
    <p><b>No account needed.</b> Without an account, everything you log (cycle, symptoms, moods, notes, habits, birthday) stays only in this app on your phone.</p>
    <p><b>If you create an account</b> (with Apple, Google or email), a copy of your data is kept on our account server in the EU so you can sign in on a new phone and never lose it. It is locked to your login: only you can read it. We never sell it, never share it with advertisers and never use it for anything else.</p>
    <p><b>Delete your account anytime.</b> Profile → Account → “Delete account” erases your account and every copy of your data on our server straight away.</p>
    <p><b>Partner signals.</b> When you send love or a care nudge, only the signal type, your first name and a private inbox code pass through a free relay (ntfy.sh) to your partner’s app. When you connect with a partner, the same relay carries what your link already holds (first name, cycle start and length, star sign, fertile days and today's mood if you share them) so you see each other without sending a second link. Symptoms and notes are never sent.</p>
    <p><b>No tracking.</b> No analytics, no advertising, no cookies for tracking.</p>
    <p><b>Birth chart.</b> Your birth time and birth place are optional and stay with the rest of your data. Your chart is calculated on your phone. When you tap Find, only the city name you typed is sent to the Open-Meteo place search to get its coordinates and time zone.</p>
    <p><b>Partner links.</b> When you share your cycle, the link contains your first name, cycle estimates (last period start, average cycle and period length, fertile days only if you turn them on) and a private code so love signals reach you. If you added them, it also holds your profile photo and the day and month of your birthday, for your star sign, and today's mood if you log one and leave mood sharing on. Symptoms and notes are never included. Anyone with the link can view it, so share it only with people you trust.</p>
    <p><b>Images and fonts.</b> Food photos load from Unsplash and Pexels, fonts from Google Fonts, and the sign-in library from jsDelivr. These services receive standard web requests (like your IP address) but none of your health data.</p>
    <p><b>Delete anytime.</b> Profile → “Delete all data” erases everything from this device. Deleting the app or clearing your browser data does the same. So export a backup first if you want to keep it.</p>
    <p><b>Not medical advice.</b> Predictions are estimates based on your logs and traditional knowledge. Underskin is not a contraceptive and does not diagnose or treat any condition.</p>
    <p><b>Allergies and medicines are yours to check.</b> Teas, herbs, spices, foods, supplements, acupressure and movement ideas in the app are general wellness information. Before you try any of them, check every ingredient for allergies and intolerances, and for clashes with medicines you take. If you are pregnant, breastfeeding, on medication or have a health condition, ask your doctor or pharmacist first. You decide what to try, and you do so at your own responsibility.</p>
    <p><b>Your own responsibility.</b> Everything in the app is general information: food, drinks, teas, herbs, supplements, remedies, acupressure, training, breathing, grounding, manifesting, cycle and fertile-day predictions and every other idea. You decide what to try and how, and you do it at your own risk and your own responsibility. Listen to your body and stop if something feels wrong.</p>
    <p><b>Liability.</b> To the fullest extent the law allows, Underskin and its makers are not liable for any injury, illness, allergic reaction, side effect, pregnancy, loss or other harm that comes from using the app or acting on its information. This does not limit rights you have by law that cannot be limited.</p>
    <p><b>Your agreement.</b> When you tick the box at sign-up, or tap “I understand and agree”, you confirm you have read this. The app stores the date you agreed.</p>
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
      <circle cx="140" cy="140" r="${R}" stroke="hsl(calc(var(--hb) + 79 * var(--hk)) calc(73% * var(--hs)) 77%)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${Ccirc}" stroke-dashoffset="${Ccirc * (1 - pct)}" transform="rotate(-90 140 140)" style="transition:stroke-dashoffset 1s linear"/></svg>
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
    if (t.remaining <= 0) { t.remaining = 0; t.done = true; t.running = false; navigator.vibrate?.(200); const c = bellCtx(); if (c) ringBell(c, c.currentTime + .05); }
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
// Sign-up gate: accounts must be switched on, and creating one needs a clear yes to keeping health data.
// Her own responsibility for allergies and medicine clashes: one clear tick, saved with the date she gave it.
const TERMS_SINCE = Date.UTC(2026, 10, 5); // wording widened to everything in the app: everyone agrees again once
function termsOK() { return Math.max(+(state && state.termsAt) || 0, +lsGet('uts.termsAt') || 0) >= TERMS_SINCE; }
function termsTick() {
  const t = document.getElementById('ac-terms'); if (!t || !t.offsetParent) return true;
  if (!t.checked) { acMsg('Please tick that you use the app at your own responsibility.', true); const l = t.closest('label'); l?.classList.add('need'); l?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
  const at = Date.now(); try { localStorage.setItem('uts.termsAt', String(at)); } catch {} if (state) state.termsAt = at;
  return true;
}
function acReady() {
  if (!termsTick()) return false;
  if (!A.configured()) { acMsg('Accounts open very soon. Until then everything stays safely on this phone.', true); return false; }
  const box = document.getElementById('ac-consent');
  if (box && box.offsetParent && !box.checked) { acMsg('Please tick the box to agree first.', true); const l = box.closest('label'); l?.classList.add('need'); l?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; } // the tick sits at the bottom of the gate
  if (box) { try { localStorage.setItem('uts.consentAt', String(Date.now())); } catch {} }
  return true;
}
function acMsg(t, bad) { const m = document.getElementById('ac-msg'); if (m) { m.textContent = t; m.classList.toggle('bad', !!bad); } }
const actions = {

  acMode: d => { ui.acMode = d.v; ui.acEmail = document.getElementById('ac-email')?.value || ui.acEmail; render(); },
  acProvider: async (d, el) => {
    if (!acReady()) return;
    acMsg(''); el.classList.add('busy');
    try { await A.withProvider(d.p); el.classList.remove('busy'); } catch (e) { el.classList.remove('busy'); acMsg(e.message, true); }
  },
  acEmail: async (d, el) => {
    const email = (document.getElementById('ac-email')?.value || '').trim(), pw = document.getElementById('ac-pw')?.value || '';
    const create = (ui.acMode || (state?.onboarded ? 'create' : 'signin')) === 'create';
    ui.acEmail = email;
    if (!/^\S+@\S+\.\S+$/.test(email)) return acMsg('Enter your email address.', true);
    if (create && pw.length < 8) return acMsg('Choose a password with at least 8 characters.', true);
    if (!pw) return acMsg('Enter your password.', true);
    if (!acReady()) return;
    el.classList.add('busy'); acMsg('');
    try {
      if (create) { const r = await A.signUp(email, pw); if (r.confirm) { ui.acMode = 'signin'; if (document.querySelector('.onb.gate')) actions.gateMode({ v: 'signin' }); else render(); acMsg('Almost there: open the link we just emailed you, then sign in here.'); } }
      else await A.signIn(email, pw);
    } catch (e) { acMsg(e.message, true); }
    el.classList.remove('busy');
  },
  acForgot: async () => {
    const email = (document.getElementById('ac-email')?.value || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return acMsg('Type your email above first.', true);
    if (!A.configured()) return acMsg('Accounts open very soon.', true);
    try { await A.resetPassword(email); acMsg('We emailed you a link to choose a new password.'); } catch (e) { acMsg(e.message, true); }
  },
  acNewPw: async () => {
    const pw = document.getElementById('ac-pw')?.value || '';
    if (pw.length < 8) return acMsg('At least 8 characters.', true);
    try { await A.setPassword(pw); ui.acRecover = false; toast('New password saved'); render(); } catch (e) { acMsg(e.message, true); }
  },
  acSync: async () => { await cloudSync(); toast(sync.err ? 'Could not sync: try again' : 'Synced'); },
  acSignOut: async () => { if (!confirm('Sign out? Your data stays on this phone.')) return; try { await A.signOut(); toast('Signed out'); } catch { toast('Couldn’t sign out: check your connection'); } render(); },
  acDelete: async () => {
    if (!confirm('Delete your account and the copy of your data in the cloud? This cannot be undone. The data on this phone stays.')) return;
    try { await A.deleteAccount(); if (state) { delete state.account; save(true); } toast('Account deleted'); render(); } catch (e) { toast(e.message); }
  },
  nav: d => go(d.to),
  back: () => (history.length > 1 ? history.back() : go('today')),
  selectDay: d => { ui.selected = d.date; render(); },
  onbEnter: d => {
    const w = welcome3d, el = document.querySelector('.onb-welcome');
    if (el?.classList.contains('entering')) return;
    if (!w || !el) return actions.onbNext(d);
    el.classList.add('entering');
    import('./sfx.js').then(S => S.enterSound()).catch(() => {});
    w.enter(1.05).then(() => { ui.flashOut = true; actions.onbNext(d); });
  },
  onbUnsure: () => { ui.onb.unsure = !ui.onb.unsure; if (ui.onb.unsure) ui.onb.cycleLength = 28; render(); },
  sound: (d, el) => {
    const off = !sndMuted();
    import('./sfx.js').then(S => S.setMuted(off)).catch(() => {});
    try { localStorage.setItem('uts.sound', off ? 'off' : 'on'); } catch (e) {}
    document.querySelectorAll('.snd-btn').forEach(b => { b.innerHTML = sndIcon(off); b.setAttribute('aria-pressed', off); b.setAttribute('aria-label', off ? 'Sound on' : 'Sound off'); });
  },
  onbNext: () => {
    if (ui.onbStep === 6 && !ui.onb.bc) { toast('Pick one, so we can tailor your plan'); return; }
    if (ui.onbStep < 10) { ui.onbStep += ui.onbStep === 4 && ui.onb.noPeriod ? 2 : 1; ui.onbAnim = 'fwd'; render(); window.scrollTo(0, 0); return; }
    if (!o_ok()) { toast('Pick the day your last period started'); ui.onbStep = 4; render(); return; }
    const o = ui.onb, logs = {}, s = C.parseISO(o.last);
    if (!o.noPeriod) for (let i = 0; i < o.periodLength; i++) { const d = C.addDays(s, i); if (d <= new Date()) logs[C.iso(d)] = { flow: i === 0 || i === 1 ? 'medium' : 'light' }; }
    ui.arrive = true;
    let pend = null; try { pend = b64d(localStorage.getItem('uts.pendingPartner') || ''); localStorage.removeItem('uts.pendingPartner'); } catch {}
    state = { onboarded: true, profile: { name: o.name.trim(), diet: o.diet || 'all', cycleLength: o.unsure || o.noPeriod ? 28 : o.cycleLength, cycleUnsure: !!(o.unsure || o.noPeriod), noPeriod: !!o.noPeriod || undefined, bc: o.bc || 'none', bcPlan: hormonalBC(o.bc) ? o.bcPlan || 'think' : undefined, bcStop: o.bcPlan === 'stop' ? todayISO() : undefined, planStart: todayISO(), periodLength: o.periodLength, goals: o.goals, purpose: o.purpose || 'know', focus: (o.focus && o.focus.length) ? o.focus : ['hormones', 'energy', 'eat'], birthday: o.birthday || undefined, birthTime: o.birthday && o.birthTime || undefined, birthPlace: o.birthday && o.birthPlace || undefined, photo: o.photo || undefined, thumb: o.thumb || undefined }, logs, favorites: [] };
    if (pend && pend.s && pend.c) state.partners = [{ ...pend, id: Date.now().toString(36), added: Date.now() }];
    ui.scrollMem = {}; ui.navStack = []; save(); go('today'); render(); toTop(); requestAnimationFrame(toTop); setTimeout(toTop, 400); // she lands at the very top of Today
    if (state.partners?.length) { M = model(); syncTo(state.partners[0]); startSignals(); }
  },
  gateSkip: () => { if (!termsTick()) return; ui.onbGateDone = true; ui.onbAnim = 'fwd'; render(); },
  termsAgree: () => { const at = Date.now(); state.termsAt = at; try { localStorage.setItem('uts.termsAt', String(at)); } catch {} save(); render(); },
  // the email form opens right on the gate, no second page; classes toggle in place so the tick box keeps its state
  gateEmail: () => actions.gateMode({ v: ui.acMode === 'signin' ? 'signin' : 'create' }),
  gateSignIn: () => actions.gateMode({ v: 'signin' }),
  gateMode: d => {
    const g = document.querySelector('.onb.gate'); if (!g) return;
    ui.gateForm = true; ui.acMode = d.v;
    g.classList.add('form-on'); g.classList.toggle('mode-signin', d.v === 'signin');
    const pw = document.getElementById('ac-pw'), em = document.getElementById('ac-email');
    if (pw) { pw.autocomplete = d.v === 'signin' ? 'current-password' : 'new-password'; pw.placeholder = d.v === 'signin' ? 'Password' : 'Password · at least 8 characters'; }
    g.querySelector('.gate-form')?.setAttribute('aria-hidden', 'false'); [em, pw].forEach(x => x?.removeAttribute('tabindex'));
    acMsg(''); setTimeout(() => { em?.focus({ preventScroll: true }); g.querySelector('.gate-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 260);
  },
  onbBack: () => { if (ui.onbStep === 1 && ui.onbGateDone && !A.currentUser() && A.configured()) { ui.onbGateDone = false; ui.onbAnim = 'back'; render(); return; } ui.onbStep = Math.max(0, ui.onbStep - (ui.onbStep === 6 && ui.onb.noPeriod ? 2 : 1)); ui.onbAnim = 'back'; render(); },
  onbDiet: d => { ui.onb.diet = d.v; document.querySelectorAll('.dt-c').forEach(b => { b.classList.toggle('on', b.dataset.v === d.v); b.setAttribute('aria-pressed', b.dataset.v === d.v); }); const pk = document.querySelector('.dt-peek'); if (pk) pk.innerHTML = dvPeek(d.v); },
  setDiet: d => { state.profile.diet = d.v; save(); toast(`${DIETS.find(x => x.k === d.v).t}: your recipes and food guide changed`); render(); },
  onbAgo: d => { const o = ui.onb; if (d.v === 'none') { o.noPeriod = !o.noPeriod; o.ago = null; } else { o.noPeriod = false; o.ago = +d.v; o.last = C.iso(C.addDays(new Date(), -d.v)); } render(); },
  // birth control taps update in place, so the screen and its background never redraw
  onbBc: d => { const o = ui.onb, had = hormonalBC(o.bc); o.bc = d.v; if (!hormonalBC(d.v)) o.bcPlan = null;
    const list = document.querySelector('.bc-list'), slot = document.querySelector('.bc-slot'); if (!list || !slot) return render();
    list.querySelectorAll('.bc-opt').forEach(b => b.classList.toggle('on', b.dataset.v === d.v));
    if (had !== hormonalBC(d.v)) { slot.innerHTML = bcQHTML(o); if (!had) slot.querySelector('.bc-q')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } },
  onbBcPlan: d => { ui.onb.bcPlan = d.v; const q = document.querySelector('.bc-q'); if (!q) return render();
    q.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.v === d.v));
    q.querySelector('.fine')?.remove(); if (d.v === 'stop') q.insertAdjacentHTML('beforeend', '<p class="fine">Talk to your doctor before you stop, and use condoms or a copper IUD if you don’t want to get pregnant: you can ovulate in your very first cycle.</p>'); },
  mealTab: d => { ui.mealTab = d.v; render(); },
  axis: d => { ui.axis = d.k; const box = document.querySelector('.sci-axis'); if (!box) return render();
    const t = document.createElement('div'); t.innerHTML = axisHTML(); box.replaceWith(t.firstElementChild); },
  rmMonth: (d, el) => { // swap in place so the page doesn't jump to the top
    ui.rmM = +d.v; const root = el.closest('.rm'); if (!root) return render();
    root.querySelectorAll('.rm2-tabs button').forEach((b, i) => b.classList.toggle('on', i === +d.v));
    root.querySelectorAll('.rm2-month').forEach((p, i) => { p.hidden = i !== +d.v; });
  },
  rmFlip: (d, el) => el.classList.toggle('open'),
  onbPurpose: d => { ui.onb.purpose = d.v; markOn('onbPurpose', d.v, true); },
  onbFocus: d => { const f = ui.onb.focus = ui.onb.focus || []; const i = f.indexOf(d.v); i < 0 ? f.push(d.v) : f.splice(i, 1); markOn('onbFocus', d.v); },
  setPurpose: d => { state.profile.purpose = d.v; save(); toast(d.v === 'conceive' ? 'Fertility guidance on' : 'Saved'); render(); },
  setBc: d => { const p = state.profile; p.bc = d.v; if (!hormonalBC(d.v)) delete p.bcPlan; else p.bcPlan = p.bcPlan || 'think'; save(); render(); },
  setBcPlan: d => { const p = state.profile; p.bcPlan = d.v; if (d.v === 'stop' && !p.bcStop) p.bcStop = todayISO(); save(); render(); },
  setFocus: d => { const f = state.profile.focus = focusKeys().slice(); const i = f.indexOf(d.v); i < 0 ? f.push(d.v) : f.splice(i, 1); save(); render(); },
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
    ui.calMonth = C.iso(new Date(m.getFullYear(), m.getMonth() + +d.d, 1)); ui.calSlide = +d.d; ui.calPick = null; calRefresh(['.cal-head', '.cal']);
  },
  skyNow: () => ui.skyNow && ui.skyNow(),
  calPick: () => { const m = ui.calMonth ? C.parseISO(ui.calMonth) : new Date(); ui.calPick = ui.calPick ? null : m.getFullYear(); calRefresh(['.cal-head', '.cal']); },
  calYear: d => { ui.calPick += +d.d; calRefresh(['.cal']); },
  calSetMonth: d => { const m = ui.calMonth ? C.parseISO(ui.calMonth) : new Date(); ui.calSlide = (ui.calPick - m.getFullYear()) * 12 + (+d.m - m.getMonth()) > 0 ? 1 : -1; ui.calMonth = C.iso(new Date(ui.calPick, +d.m, 1)); ui.calPick = null; calRefresh(['.cal-head', '.cal']); },
  calToday: () => { const t = new Date(); ui.calSlide = ui.calMonth && C.parseISO(ui.calMonth) > t ? -1 : 1; ui.calMonth = null; ui.calPick = null; ui.calSelected = todayISO(); calRefresh(['.cal-head', '.cal', '.day-panel']); },
  calSelect: (d, el) => {
    if (ui.calEdit) {
      if (C.parseISO(d.date) > M.today) return toast('You can mark days up to today');
      const l = getLog(d.date), on = !PERIOD_FLOWS.includes(l.flow); setLog(d.date, { flow: on ? 'medium' : null });
      el?.classList.toggle('period', on); if (navigator.vibrate) navigator.vibrate(8); // instant feedback, details next frame
      ui.calSelected = d.date; return nextFrame(() => calRefresh(['.cal'], true));
    }
    if (ui.calSelected === d.date) return;
    document.querySelectorAll('.cal-d.sel').forEach(x => x.classList.remove('sel')); el?.classList.add('sel');
    ui.calSelected = d.date; ui.planOpen = null;
    nextFrame(() => calRefresh(['.day-panel']));
  },
  calEdit: () => { ui.calEdit = !ui.calEdit; if (!ui.calEdit) toast('Saved · predictions updated'); calRefresh(null, true); },
  pinPartner: d => { const p = (state.partners || []).find(x => x.id === d.id); if (!p) return; p.pin = !p.pin; save(); toast(p.pin ? `${p.n} pinned to your home screen` : 'Unpinned'); render(); },
  openLove: d => { document.querySelector('.sig-pop')?.remove(); ui.loveFor = d.id; render(); if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {}); },
  sigClose: () => document.querySelector('.sig-pop')?.remove(),
  loveClose: () => { ui.loveFor = null; render(); },
  noop: () => {},
  sendLove: async (d, el) => {
    const p = (state.partners || []).find(x => x.id === ui.loveFor), l = SIGNALS.find(x => x.k === d.k); if (!p || !l) return;
    const r = el.getBoundingClientRect(); heartBurst(r.left + r.width / 2, r.top + r.height / 2);
    const snap = { f: state.profile.name || 'Someone', k: l.k }; if (state.profile.thumb) snap.t = state.profile.thumb;
    const url = `${appBase()}#/love?d=${b64e(snap)}`, text = `${l.g} ${state.profile.name || 'I'} ${l.s}`;
    (state.loveSent = state.loveSent || []).push({ to: p.id, k: l.k, at: Date.now() }); state.loveSent = state.loveSent.slice(-200); save();
    if (p.i) { const ok = await sendSignal(p, l.k); setTimeout(() => { ui.loveFor = null; render(); toast(ok ? `${l.g} Sent to ${p.n}` : 'Couldn’t send: check your connection'); }, 600); return; }
    setTimeout(async () => {
      ui.loveFor = null; render();
      if (await shareOut({ text, url })) { toast(`Love sent to ${p.n} ❤️`); return; }
      try { await navigator.clipboard.writeText(`${text} ${url}`); toast('Copied: paste it in your chat ❤️'); } catch { prompt('Copy and send', `${text} ${url}`); }
    }, 700);
  },
  hubTip: d => {
    ui.hubTip = ui.hubTip === d.k ? null : d.k;
    const box = document.querySelector('.hub-plan'); if (!box || !M.info) return render();
    const tmp = document.createElement('div'); tmp.innerHTML = todayTiles(M.info);
    box.querySelector('.dpt-grid').replaceWith(tmp.children[0]); box.querySelector('#hub-tip').replaceWith(tmp.children[0]);
    if (ui.hubTip) document.getElementById('hub-tip').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  rhTick: (d, el) => {
    const done = doneToday(), i = done.indexOf(d.k); i < 0 ? done.push(d.k) : done.splice(i, 1); save();
    document.querySelectorAll(`[data-action="rhTick"][data-k="${d.k}"]`).forEach(b => b.classList.toggle('on', i < 0));
    document.querySelectorAll('.rh-ring').forEach(svg => { svg.outerHTML = rhythmRing(done.length, RH_GOAL); });
    if (i < 0) { plusOne(el); if (done.length === RH_GOAL) toast('🌕 Full rhythm today. Beautiful'); }
  },
  useGeo: () => { if (!navigator.geolocation) return toast('Location isn’t available'); navigator.geolocation.getCurrentPosition(p => { state.profile.geo = { lat: +p.coords.latitude.toFixed(2), lng: +p.coords.longitude.toFixed(2) }; save(); toast('Sun times set for where you are'); render(); }, () => toast('Location not allowed, using your country')); },
  teaK: d => { ui.teaK = d.v || null; render(); if (d.v) setTimeout(() => document.getElementById('tg-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); },
  shade: d => { const v = document.querySelector('.view'), y = v ? v.scrollTop : 0; ui.shade = ui.shade === +d.i ? -1 : +d.i; render(); const w = document.querySelector('.view'); if (w) w.scrollTop = y; },
  reliefHelp: (d, el) => {
    const H = state.reliefHelp = state.reliefHelp || {}, l = H[d.k] = H[d.k] || [], i = +d.i, at = l.indexOf(i);
    at < 0 ? l.push(i) : l.splice(at, 1); save();
    el.classList.toggle('on', at < 0); el.closest('.rs').classList.toggle('helped', at < 0);
    if (at < 0) plusOne(el);
  },
  rhView: d => { ui.rhView = d.v; render(); },
  mvTab: d => { ui.mvTab = d.v; render(); },
  supTab: d => { ui.supTab = d.v; render(); },
  stTab: d => { ui.stTab = d.v; render(); },
  pfTab: d => { ui.pfTab = d.v; render(); },
  groAisle: d => { ui.groAisle = d.v; render(); const t = document.querySelector('.gro-tabs'), on = t && t.querySelector('.on'); if (on) t.scrollLeft = on.offsetLeft - (t.clientWidth - on.offsetWidth) / 2; },
  czTab: d => { ui.czTab = d.v; render(); },
  bzPick: d => { ui.bzK = d.v; render(); },
  bzPhase: d => { ui.bzK = d.v; render(); setTimeout(() => { const v = document.getElementById('view'), z = document.querySelector('.bz'); if (v && z) v.scrollTo({ top: v.scrollTop + z.getBoundingClientRect().top - 90, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 60); },
  cyFact: d => { const j = +d.v; ui.cyFact = ui.cyFact === j ? null : j; render(); },
  plRule: d => { ui.plRule = ui.plRule === d.v ? null : d.v; render(); },
  maniK: d => { ui.maniK = d.v; render(); setTimeout(() => { const v = document.getElementById('view'); if (v) v.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, 60); },
  czWhy: () => { if (ui.czTab && ui.czTab !== 'today') { ui.czTab = 'today'; render(); } const el = document.querySelector('.cx-why'); el && el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); },
  moonRit: d => { ui.moonRit = d.v; render(); },
  moonSave: d => {
    const items = [0, 1, 2].map(i => String((ui.moonDraft || {})['i' + i] || '').trim()).filter(Boolean);
    if (!items.length) return toast(d.t === 'new' ? 'Write at least one intention' : 'Write at least one thing to let go of');
    (state.moonNotes = state.moonNotes || []).push({ id: Date.now().toString(36), type: d.t, date: todayISO(), items, done: [] });
    ui.moonDraft = {}; save(); render(); toast(d.t === 'new' ? 'Intentions set. They will be here at the full moon' : 'Released. Let it go with your next out-breath');
  },
  moonTick: d => { const n = (state.moonNotes || []).find(x => x.id === d.id); if (!n) return; n.done = n.done || []; n.done[+d.i] = !n.done[+d.i]; save(); render(); },
  placeFind: d => placeFind(d.scope),
  placePick: d => { const x = (ui.placeRes || [])[+d.i]; if (!x) return; const { area, ...r } = x; if (d.scope === 'onb') ui.onb.birthPlace = r; else { state.profile.birthPlace = r; save(); } ui.placeRes = []; ui.placeQ = ''; render(); },
  placeClear: d => { if (d.scope === 'onb') ui.onb.birthPlace = null; else { delete state.profile.birthPlace; save(); } render(); },
  planOpen: d => { ui.planOpen = d.date || null; ui.planKind = 'date'; calRefresh(['.day-panel']); },
  planKind: d => { const name = document.getElementById('ev-name')?.value; ui.planKind = d.v; calRefresh(['.day-panel']); const i = document.getElementById('ev-name'); if (i && name) i.value = name; },
  planSave: d => { const t = (document.getElementById('ev-name')?.value || '').trim().slice(0, 40); events().push({ id: Date.now().toString(36), date: d.date, kind: ui.planKind || 'date', t }); ui.planOpen = null; save(); render(); toast('Planned ✓'); },
  evDel: d => { state.events = events().filter(e => e.id !== d.id); save(); render(); },
  sugarTrick: (d, el) => {
    const on = doneToday(), key = 'sg-' + d.v, i = on.indexOf(key); i < 0 ? on.push(key) : on.splice(i, 1); save();
    el.classList.toggle('on', i < 0); if (i < 0) plusOne(el);
    const c = document.getElementById('sg-chart'); if (c) c.innerHTML = sugarCurve(sugarDone());
    const sc = document.getElementById('sg-score'); if (sc) { sc.innerHTML = sugarScore(sugarDone()); sc.classList.remove('pop'); void sc.offsetWidth; sc.classList.add('pop'); }
  },
  dvOpen: (d, el) => {
    const grid = document.querySelector('.dv-grid'); if (!grid) return;
    const open = grid.querySelector('.dvs-w'), same = open && open.dataset.i === d.i;
    if (open) open.remove();
    grid.querySelectorAll('.dv-t').forEach(t => { t.classList.toggle('open', !same && t.dataset.i === d.i); t.setAttribute('aria-expanded', !same && t.dataset.i === d.i); });
    if (same) return;
    const tiles = [...grid.querySelectorAll('.dv-t')], k = tiles.findIndex(t => t.dataset.i === d.i); if (k < 0) return;
    const after = tiles[Math.min(k + (k % 2 ? 0 : 1), tiles.length - 1)], box = document.createElement('div');
    box.className = 'dvs-w'; box.dataset.i = d.i; box.innerHTML = dvSheet(+d.i); after.after(box);
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  },
  cfOpen: (d, el) => {
    const sh = document.querySelector('.cf-sheet'); if (!sh) return;
    const same = sh.dataset.p === d.p && sh.innerHTML;
    document.querySelectorAll('.cf2 .cf-c').forEach(c => c.classList.toggle('open', !same && c.dataset.p === d.p));
    if (same) { sh.innerHTML = ''; sh.dataset.p = ''; return; }
    sh.dataset.p = d.p; sh.innerHTML = cfSheet(d.p); sh.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  ebPick: (d, el) => {
    const box = el.closest('.eat-cat'); if (!box) return;
    box.querySelectorAll('.eb-i.on').forEach(x => x.classList.remove('on')); el.classList.add('on');
    const p = box.querySelector('.ebp-in'); p.innerHTML = el.querySelector('template').innerHTML; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
  },
  superGo: () => { ui.eatCat = 'super'; ui.planTab = 'nourish'; go('plan'); setTimeout(() => document.querySelector('.eb-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 700); },
  eatCat: (d, el) => {
    ui.eatCat = d.v; const card = document.querySelector('.eat-cat'); if (!card) return render();
    document.querySelectorAll('[data-action="eatCat"]').forEach(b => b.classList.toggle('on', b === el));
    card.innerHTML = eatCatInner(card.dataset.phase, d.v); card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  },
  calSync: async () => {
    if (!M.info) return toast('Log a period first');
    if (calPlugin()) { if (await calWrite(true)) { toast('Added to your “My cycle” calendar ✓'); render(); } return; }
    await saveFile('my-cycle.ics', calICS(), 'text/calendar');
    state.profile.calAdded = Date.now(); save();
    if (!NATIVE) toast('Open the file to add it to your calendar'); if (route().name === 'calendar') render();
  },
  calStop: () => calStop(),
  periodStart: () => {
    if (state.profile.noPeriod) delete state.profile.noPeriod;
    const before = C.cycleStats(state), k = todayISO(); setLog(k, { flow: 'medium' });
    const after = C.cycleStats(state);
    toast(after.lengths.length && after.avgCycle !== before.avgCycle ? `Period logged · your cycle is now ${after.avgCycle} days` : 'Period logged. Take it easy today'); render();
  },
  togglePeriod: () => {
    const k = ui.calSelected, l = getLog(k);
    setLog(k, { flow: PERIOD_FLOWS.includes(l.flow) ? null : 'medium' });
    toast(PERIOD_FLOWS.includes(getLog(k).flow) ? 'Period day added' : 'Period day removed'); calRefresh();
  },
  logDay: d => { ui.logDate = d.date; go('log'); },
  logMove: d => {
    const n = C.addDays(C.parseISO(ui.logDate || todayISO()), +d.d);
    if (n > new Date()) return;
    ui.logDate = C.iso(n); render();
  },
  logSec: d => { const o = ui.logOpen = ui.logOpen || {}; o[d.s] = !o[d.s]; render(); },
  logCopy: () => {
    const k = ui.logDate || todayISO(), y = { ...(state.logs[C.iso(C.addDays(C.parseISO(k), -1))] || {}) }; delete y.notes;
    setLog(k, y); ui.logOpen = { flow: 1, body: 1, mind: 1 }; render();
  },
  logSet: d => {
    const k = ui.logDate || todayISO(), l = getLog(k);
    let v = d.field === 'energy' || d.field === 'drive' ? +d.v : d.v;
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
  enWhy: () => { ui.enWhy = !ui.enWhy; render(); },
  mvLi: d => { ui.mvLi = ui.mvLi === d.k ? null : d.k; render(); },
  enPart: d => { ui.enPart = ui.enPart === d.k ? null : d.k; render(); },
  tsOpen: d => { ui.tsOpen = ui.tsOpen === d.k ? null : d.k; render(); },
  grStudy: d => { ui.grStudy = ui.grStudy === +d.i ? null : +d.i; render(); },
  saveTip: d => {
    const L = state.savedTips = state.savedTips || [], i = L.findIndex(x => x.id === d.id);
    if (i >= 0) { L.splice(i, 1); toast('Removed from Saved'); } else { const t = TIPREG[d.id]; if (!t) return; L.push({ ...t, at: todayISO() }); toast('Saved · find it in Saved tips'); if (navigator.vibrate) navigator.vibrate(8); }
    save(); render();
  },
  fav: d => { const f = state.favorites = state.favorites || []; const i = f.indexOf(d.id); i < 0 ? f.push(d.id) : f.splice(i, 1); save(); render(); },
  check: d => { ui.checked[d.k] = !ui.checked[d.k]; render(); },
  timer: d => { bellCtx(); ui.timer = { title: d.title, secs: +d.secs, remaining: +d.secs, running: true, done: false }; renderOverlay(); startTick(); },
  timerToggle: () => { ui.timer.running = !ui.timer.running; renderOverlay(); },
  timerClose: () => { ui.timer = null; clearInterval(tick); renderOverlay(); },
  dismissRem: d => { rem().dismissed[d.id] = todayISO(); save(); render(); },
  remToggle: d => { const r = rem(); r[d.k] = !r[d.k]; save(); render(); },
  remHour: d => { const r = rem(); r.checkinHour = (r.checkinHour + +d.d + 24) % 24; save(); render(); },
  remCalmHour: d => { const r = rem(); r.calmHour = (r.calmHour + +d.d + 24) % 24; save(); render(); },
  calmRem: async () => { const r = rem(); r.calm = !r.calm; save(); if (r.calm && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { /* unsupported */ } } render(); fireNotifications(); },
  remPermission: async () => { try { await Notification.requestPermission(); } catch { /* unsupported */ } render(); fireNotifications(); },
  flagDismiss: d => { state.flagDismissed = d.k; save(); render(); },
  flagEdit: d => { ui.calSelected = d.date; const x = C.parseISO(d.date); ui.calMonth = C.iso(new Date(x.getFullYear(), x.getMonth(), 1)); go('calendar'); },
  lemonStart: () => { state.lemon = { start: todayISO(), done: {} }; save(); toast('Your 28 days begin'); render(); },
  lemonTick: () => { const L = state.lemon; if (!L) return; L.done = L.done || {}; const k = todayISO(); L.done[k] ? delete L.done[k] : (L.done[k] = 1); save(); render(); },
  focusTick: d => { const k = todayISO(), f = state.focusDone = state.focusDone || {}; const a = f[k] = f[k] || []; const i = +d.i; a.includes(i) ? a.splice(a.indexOf(i), 1) : a.push(i); for (const x in f) if (x !== k) delete f[x]; save(); render(); },
  habitTick: d => { const k = todayISO(), H = state.habits = state.habits || {}; const a = H[k] = H[k] || []; a.includes(d.id) ? a.splice(a.indexOf(d.id), 1) : a.push(d.id);
    const cut = C.iso(C.addDays(new Date(), -60)); for (const x in H) if (x < cut) delete H[x]; save(); render(); },
  addPartner: d => { const snap = b64d(d.d); if (!snap) return; const ps = state.partners = state.partners || [];
    const old = ps.find(x => x.n === snap.n);
    if (old) { Object.assign(old, snap, { id: old.id, added: Date.now() }); save(); syncTo(old); toast(`${snap.n} updated`); return go('partners/' + old.id); }
    if (ps.length >= 4) { toast('You can connect up to 4 people'); return go('partners'); }
    ps.push({ ...snap, id: Date.now().toString(36), added: Date.now() }); save(); startSignals(); syncTo(ps[ps.length - 1]).then(ok => toast(ok ? `${snap.n} added, and she now sees you too` : `${snap.n} added`)); go('partners/' + ps[ps.length - 1].id); },
  openPartner: d => { const p = (state.partners || []).find(x => x.id === d.id); if (p) { const { id, ...snap } = p; location.hash = '#/with?d=' + b64e(snap); } },
  removePartner: d => { const p = (state.partners || []).find(x => x.id === d.id); if (!p || !confirm(`Remove ${p.n}?`)) return; state.partners = state.partners.filter(x => x.id !== d.id); save(); if (route().name === 'partners') go('partners'); else render(); },
  seasonView: d => { ui.seasonView = d.v; render(); },
  logBleed: () => { ui.showBleed = ui.logDate || todayISO(); render(); },
  maniFeel: d => { const F = state.maniFeel = state.maniFeel || {}, t = todayISO(), v = +d.v; if (F[t] === v) delete F[t]; else F[t] = v; save(); render(); },
  wxOpen: d => { ui.wxOpen = ui.wxOpen === d.v ? null : d.v; render(); },
  wkPan: d => { const v = +d.v; ui.wkPan = ui.wkPan && ui.wkPan[0] === d.k && ui.wkPan[1] === v ? null : [d.k, v]; render(); },
  worldGo: d => { ui.worldReg = d.k; ui.worldPhase = null; go('world'); setTimeout(wkCenter, 120); },
  worldReg: d => { ui.worldReg = d.k; render(); wkCenter(); },
  worldPhase: d => { ui.worldPhase = d.v; render(); },
  seasonGo: d => { Object.assign(ui, { seasonFood: d.f, seasonView: 'month', seasonFilter: 'all', seasonMonth: null }); go('season'); setTimeout(() => document.querySelector('.sf-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); },
  seasonFood: d => { ui.seasonFood = ui.seasonFood === d.f ? null : d.f; render(); if (ui.seasonFood) document.querySelector('.sf-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  seasonFilter: d => { ui.seasonFilter = d.v; render(); },
  baDel: d => { if (!confirm('Delete this photo from your phone?')) return; const ba = baGet(); delete ba[d.v]; baSet(ba); render(); },
  seasonKind: d => { ui.seasonKind = ui.seasonKind === d.v ? null : d.v; render(); },
  seasonJump: d => { const now = new Date().getMonth() + 1; for (let k = 0; k < 12; k++) { const mm = ((now - 1 + k) % 12) + 1; if (SZ.seasonName(myCountry(), mm) === d.v) { ui.seasonMonth = mm === now ? null : mm; break; } } ui.seasonFood = null; render(); },
  seasonMonth: d => { const m = (ui.seasonMonth || new Date().getMonth() + 1) + +d.d; ui.seasonMonth = ((m - 1 + 12) % 12) + 1; render(); },
  insTab: d => { ui.insTab = d.v; render(); },
  hxJump: d => { document.getElementById('hx-' + d.i)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  groToggle: d => { const g = state.grocery = state.grocery || {}; g[d.k] ? delete g[d.k] : (g[d.k] = 1); save(); render(); },
  groClear: () => { state.grocery = {}; save(); render(); },
  groShare: async () => {
    const got = state.grocery || {};
    const text = 'My Underskin grocery list\n\n' + groceryItems().map(([a, l]) => `${a}\n` + l.filter(i => !got[i.name.toLowerCase()]).map(i => `• ${i.name}`).join('\n')).join('\n\n');
    if (await shareOut({ title: 'Grocery list', text })) return;
    try { await navigator.clipboard.writeText(text); toast('List copied'); } catch { toast('Couldn’t copy'); }
  },
  saveBirthday: () => { if (state.profile.birthday) render(); else toast('Pick your birthday first'); },
  plPetal: d => { ui.plPetal = d.v; render(); },
  plRecipes: () => document.getElementById('pl-recipes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  nourishPhase: d => { ui.nourishPhase = d.v; ui.openNeed = 0; render(); },
  openNeed: d => { ui.openNeed = ui.openNeed === +d.i ? -1 : +d.i; render(); },
  shareAud: d => { ui.shareAudience = d.v; render(); },
  shareMood: () => { state.profile.noMood = !state.profile.noMood; save(); publishLive(); render(); },
  shareFertile: () => { state.profile.noFertile = !state.profile.noFertile; state.profile.liveAt = 0; save(); publishLive(); render(); },
  shareSend: async () => {
    if (!M.stats.periods.length) return toast('Log a period first so there is something to share');
    const url = shareLink(), title = `${state.profile.name || 'My'}’s rhythm`;
    const sent = () => { if (!state.profile.linkSent) { state.profile.linkSent = Date.now(); save(); startSignals(); if (route().name === 'partners') render(); } publishLive(); }; // ticks step 1 on the partner page
    if (await shareOut({ title, text: 'Here’s where I am in my cycle 🌿', url })) return sent();
    try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { prompt('Copy this link', url); }
    sent();
  },
  hisTab: d => { ui.hisTab = d.v; render(); document.getElementById('view').scrollTop = 0; },
  hisWake: d => { try { localStorage.setItem('uts.wake', d.v); } catch {} render(); },
  trackMine: () => { try { localStorage.removeItem('uts.viewOnly'); } catch {} go('today'); },
  ptWho: d => { state.profile.ptWho = d.v; save(); render(); },
  shareEmail: () => {
    if (!M.stats.periods.length) return toast('Log a period first so there is something to share');
    const me = state.profile.name || 'I', he = state.profile.ptWho === 'm';
    const body = `Hi love,\n\nThis is my rhythm in Underskin. It shows where I am in my cycle and how to be there for me, and it updates every day on its own.\n\n${shareLink({ short: true })}\n\n${he ? 'No app or account needed, just open the link.' : 'Open it on your phone to set up your own Underskin and we will see each other.'}\n\n${me}`;
    location.href = `mailto:?subject=${encodeURIComponent(`${me === 'I' ? 'My' : me + '’s'} rhythm`)}&body=${encodeURIComponent(body)}`;
    if (!state.profile.linkSent) { state.profile.linkSent = Date.now(); save(); startSignals(); setTimeout(render, 600); } publishLive();
  },
  sharePreview: () => { location.hash = shareLink().split('#')[1]; },
  pastePartner: async () => { try { const t = await navigator.clipboard.readText(); addPartnerFrom(t); } catch { document.getElementById('partnerLink')?.focus(); toast('Paste her link into the box'); } },
  addPartnerLink: () => addPartnerFrom(document.getElementById('partnerLink')?.value || ''),
  copyText: async d => { try { await navigator.clipboard.writeText(d.t); toast('Message copied'); } catch { toast('Couldn’t copy'); } },
  profileGoal: d => { const g = state.profile.goals = state.profile.goals || []; const i = g.indexOf(d.v); i < 0 ? g.push(d.v) : g.splice(i, 1); save(); render(); },
  export: () => {
    saveFile(`underskin-${todayISO()}.json`, JSON.stringify(state, null, 2), 'application/json');
  },
  demo: () => { if (confirm('Replace your logs with sample cycles?')) { state = demoState(state.profile.name); save(); toast('Sample cycles loaded'); go('today'); render(); } },
  reset: () => { if (confirm('Delete all your Rhythm data from this device?')) { localStorage.removeItem(KEY); try { localStorage.removeItem(KEY + '.backup'); localStorage.removeItem('uts.pendingPartner'); } catch {} state = null; ui.onbStep = 0; go('today'); render(); } },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('keydown', e => {
  const f = e.target.dataset?.input; if (e.key !== 'Enter' || !/placeQ$/.test(f || '')) return;
  e.preventDefault(); placeFind(f.startsWith('onb') ? 'onb' : 'profile');
});
document.addEventListener('change', e => { if (e.target.type === 'time' && /birthTime$/.test(e.target.dataset?.input || '')) render(); });
document.addEventListener('focusout', e => {
  const t = e.target; if (t.type !== 'date' || !t.dataset?.input || !t.value || +t.value.slice(0, 4) < 1900) return;
  render();
});
document.addEventListener('input', e => {
  if (e.target.classList.contains('o9-day')) {
    const t = e.target, cd = +t.value, L = +t.dataset.l, P = +t.dataset.p, card = t.closest('.o9-hp');
    t.style.setProperty('--p', ((cd - 1) / (L - 1) * 100).toFixed(1) + '%');
    const live = card.querySelector('.o9-live'); if (live) live.innerHTML = o9Live(cd, L, P, +t.dataset.you);
    const ch = card.querySelector('.cchart'), sc = ch && ch.querySelector('.scrub');
    if (sc) { const { X, Y } = chartGeom(L, true), x = X(cd + 0.5), y = Y(C.hormonesAt(cd, L, P).estrogen); const ln = sc.querySelector('.s-line'), dt = sc.querySelector('.s-dot');
      ln.setAttribute('x1', x); ln.setAttribute('x2', x); dt.setAttribute('cx', x); dt.setAttribute('cy', y); sc.style.opacity = cd === +t.dataset.you ? 0 : 1; }
    return;
  }
  if (e.target.classList.contains('o9-range')) { e.target.parentElement.style.setProperty('--x', e.target.value + '%'); return; }
  const f = e.target.dataset?.input; if (!f) return;
  if (f === 'ui.placeQ') { ui.placeQ = e.target.value; return; }
  if (f.startsWith('moon.')) { (ui.moonDraft = ui.moonDraft || {})[f.slice(5)] = e.target.value; return; }
  if (f.startsWith('scene.')) { const S = state.maniScene = state.maniScene || {}, k = f.slice(6); if (e.target.value.trim()) S[k] = e.target.value; else delete S[k]; save();
    const box = e.target.closest('.msb'); if (box) { e.target.closest('.msb-f').classList.toggle('on', !!e.target.value.trim()); box.querySelector('.msb-line').innerHTML = sceneLine(S); box.querySelector('.msb-n .dotnum').textContent = SCENE_F.filter(([x]) => (S[x] || '').trim()).length; } return; }
  if (f === 'mani.today') { const j = state.manifest = state.manifest || {}; if (e.target.value.trim()) j[todayISO()] = e.target.value; else delete j[todayISO()]; save(); return; }
  if (f === 'moonj.today') { const j = state.moonJournal = state.moonJournal || {}; if (e.target.value.trim()) j[todayISO()] = e.target.value; else delete j[todayISO()]; save(); return; }
  const [scope, key] = f.split('.'), v = e.target.value, isDate = e.target.type === 'date';
  if (isDate && v && +v.slice(0, 4) < 1900) return; // still typing the year (0001, 0019, 0199…): wait for all four digits
  if (scope === 'onb') { ui.onb[key] = v; const b = document.querySelector('[data-action="onbNext"]'); if (b && ui.onbStep === 1) b.disabled = !v.trim();
    if (key === 'name') { const g = document.querySelector('.onb-greet'); if (g) { g.classList.toggle('on', !!v.trim()); g.querySelector('b').textContent = v.trim(); } }
    if (key === 'birthday' && v && !isDate) render();
    if (key === 'last') { ui.onb.ago = null; document.querySelectorAll('[data-action="onbAgo"]').forEach(b => b.classList.remove('on')); } }
  else if (scope === 'profile') { state.profile[key] = v; save(); if (key === 'country') render(); if (key === 'birthday' && v && !isDate && (state.partners || []).length) { toast('Saved: send your link again so your people see your sign'); render(); } }
  else if (scope === 'log' && SLIDER_WORDS[key]) {
    const n = +v; setLog(ui.logDate || todayISO(), { [key]: n });
    const w = e.target.closest('.lg-slide'); if (w) { w.classList.add('set'); w.style.setProperty('--v', (n - 1) / 4); }
    const lb = document.getElementById('lv-' + key); if (lb) lb.textContent = SLIDER_WORDS[key][n - 1];
    const go = document.querySelector('.lg-go .btn'); if (go && go.disabled) { go.disabled = false; go.innerHTML = `${icon('spark', 18)} See what this means`; }
  }
  else if (scope === 'log') { const n = key === 'temp' ? (v === '' ? null : Math.round(parseFloat(v) * 100) / 100) : v; setLog(ui.logDate || todayISO(), { [key]: Number.isNaN(n) ? null : n }); }
});

// The calendar updates in place: no full re-render, no entry animation, scroll stays put.
// Run after the browser has painted the instant feedback (with a timer fallback for background tabs).
function nextFrame(f) { let done = false; const go = () => { if (!done) { done = true; f(); } }; requestAnimationFrame(() => setTimeout(go, 0)); setTimeout(go, 80); }
// Update only the parts of the calendar that changed, so taps feel instant (no full-page repaint under the glass bars).
// parts: which blocks to swap; data = logs changed, so the cycle model must be rebuilt first.
function calRefresh(parts, data) {
  const v = document.getElementById('view');
  if (!v || route().name !== 'calendar') return render();
  if (data) M = model();
  const full = () => { const top = v.scrollTop; v.classList.remove('enter'); v.innerHTML = viewCalendar(); v.scrollTop = top; };
  if (!parts) return full();
  const tmp = document.createElement('div'); tmp.innerHTML = viewCalendar();
  for (const sel of parts) { const a = v.querySelector(sel), b = tmp.querySelector(sel); if (!a || !b) return full(); a.replaceWith(b); }
}
// Swipe left/right on the calendar to change month.
let calSwipe = null;
document.addEventListener('touchstart', e => { const c = e.target.closest?.('.cal'); calSwipe = c && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
document.addEventListener('touchend', e => {
  if (!calSwipe) return; const t = e.changedTouches[0], dx = t.clientX - calSwipe.x, dy = t.clientY - calSwipe.y; calSwipe = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { e.preventDefault(); actions.calMove({ d: dx < 0 ? 1 : -1 }); }
});

// ---------- render ----------
let unmountFigs = [];
let welcome3d = null; // the running welcome scene (for the fly-through on Enter)
let fig3d = null; // lazily loaded Three.js module (null = not tried, false = unavailable)
function mountFigures() {
  unmountFigs.forEach(f => f()); unmountFigs = [];
  document.querySelectorAll('.bz').forEach(el => unmountFigs.push(mountBreath(el)));
  document.querySelectorAll('canvas.torso').forEach(c => unmountFigs.push(mountTorso(c, c.parentElement.querySelector('.torso-mark'))));
  document.querySelectorAll('canvas.torso3d').forEach(c => {
    const grain = c.parentElement.querySelector('canvas.grain');
    import('./torso3d.js').then(m => { if (!c.isConnected) return; unmountFigs.push(m.mountTorso3D(c, grain)); })
      .catch(() => { if (c.isConnected) unmountFigs.push(mountTorso(c, null)); });
  });
  document.querySelectorAll('svg.uts-hand').forEach(fitHand);
  document.querySelectorAll('svg.dot-word').forEach(dotWord);
  document.querySelectorAll('canvas.welcome3d').forEach(c => {
    const wrap = c.closest('.onb-welcome');
    const fail = () => { if (!c.isConnected) return; const f = document.createElement('img'); f.className = 'welcome-still'; f.src = 'images/welcome-forest.jpg'; f.alt = ''; c.replaceWith(f); wrap?.classList.add('arrived', 'no3d'); }; // no WebGL: the misty forest still, never a dark screen
    c.addEventListener('welcome-fail', fail);
    import('./welcome3d.js').then(m => {
      if (!c.isConnected) return; if (!m.webglOK()) throw new Error('no webgl');
      const w = m.mountWelcome3D(c, { onReady: () => wrap?.classList.add('arrived') });
      // arrival sound (a breeze and two soft bells): plays right away if sound is allowed, otherwise on the first touch
      import('./sfx.js').then(S => {
        const intro = () => S.introSound();
        if (navigator.userActivation?.hasBeenActive) intro();
        else wrap?.addEventListener('pointerdown', e => { if (!e.target.closest('[data-action="onbEnter"]')) intro(); }, { once: true });
      }).catch(() => {});
      welcome3d = w; unmountFigs.push(() => { w.destroy(); if (welcome3d === w) welcome3d = null; });
    }).catch(fail);
  });
  // the Moon page: the 3D moon lit to tonight's phase; the flat moon stays if 3D can't run
  document.querySelectorAll('canvas.moon3d').forEach(c => {
    const orb = c.closest('.mn-orb'), fail = () => { orb?.classList.remove('mn-ready'); c.remove(); };
    import('./moon3d.js').then(m => {
      if (!c.isConnected) return; if (!m.webglOK()) throw new Error('no webgl');
      unmountFigs.push(m.mountMoon(c, { elong: +c.dataset.e, onReady: () => orb?.classList.add('mn-ready'), onFail: fail }));
    }).catch(fail);
  });
  document.querySelectorAll('.mn-pg').forEach(row => { const on = row.querySelector('.on'); if (on) row.scrollLeft = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2; });
  // today's tea as a turning 3D cup; the tea photo stays if 3D can't run
  // The 3D cup only loads once its card is on screen and the phone is idle, so the app opens fast.
  document.querySelectorAll('canvas.teacup3d').forEach(c => {
    const hero = c.closest('.tg-hero, .cup3d-w'), fail = () => { hero?.classList.remove('tg-3d', 'tg-ready'); c.remove(); };
    const start = () => import('./teacup3d.js').then(m => {
      if (!c.isConnected) return; if (!m.webglOK()) throw new Error('no webgl');
      unmountFigs.push(m.mountTeaCup(c, { model: c.dataset.model || undefined, elev: c.dataset.elev ? +c.dataset.elev : undefined, fit: c.dataset.fit ? +c.dataset.fit : undefined, steam: c.dataset.steam !== '0', shadow: c.dataset.shadow !== '0', onReady: () => hero?.classList.add('tg-ready'), onFail: fail }));
    }).catch(fail);
    const idle = f => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 300));
    if (!('IntersectionObserver' in window)) return idle(start);
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); idle(start); } }, { rootMargin: '200px' });
    io.observe(hero || c);
  });
  // Looping tile videos download and play only while they are on screen.
  document.querySelectorAll('video.dpt-vid').forEach(v => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { rootMargin: '100px' });
    io.observe(v);
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
    <p class="ar-2">You’re on day ${Math.min(info.cd, info.L)}. Your <em>${ph.name.toLowerCase()} phase</em></p>
    <p class="ar-3">${ph.season}. Your rhythm is ready.</p></div>`;
  $app.appendChild(el);
  view.classList.add('arrive-in');
  import('./sfx.js').then(S => S.arriveSound()).catch(() => {});
  setTimeout(() => el.classList.add('out'), 3400);
  setTimeout(() => { el.remove(); document.getElementById('view')?.classList.remove('arrive-in'); }, 5200);
}
// the very top of the page: the app view and the window (onboarding scrolls the window)
function toTop() { try { window.scrollTo(0, 0); document.scrollingElement && (document.scrollingElement.scrollTop = 0); const v = document.getElementById('view'); if (v) v.scrollTop = 0; } catch {} }
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function render() {
  const r = route(); secN = 0;
  unmountFigs.forEach(f => f()); unmountFigs = []; // stop 3D/particle loops even on views that mount none (account, love, with)
  const prev = document.getElementById('view');
  let keep = prev && ui.lastRoute === r.key ? prev.scrollTop : 0;
  const fresh = ui.lastRoute !== r.key;
  // Going back returns to the same spot on the page you came from.
  if (prev && ui.lastRoute) (ui.scrollMem = ui.scrollMem || {})[ui.lastRoute] = prev.scrollTop;
  if (fresh) {
    const st = ui.navStack = ui.navStack || [];
    if (st.length > 1 && st[st.length - 2] === r.key) { st.pop(); keep = (ui.scrollMem || {})[r.key] || 0; } else st.push(r.key);
  }
  if (r.name !== 'log' && fresh) ui.logDate = r.name === 'log' ? ui.logDate : ui.logDate;
  ui.lastRoute = r.key; ui.plAnim = fresh;

  if (r.name === 'love') {
    $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''}" id="view">${viewLove(r.q)}</div>`;
    return;
  }
  if (r.name === 'account' || (r.name === 'privacy' && !(state && state.onboarded))) {
    $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''}" id="view">${r.name === 'account' ? viewAccount() : viewPrivacy()}</div>`;
    return;
  }
  if (r.name === 'with') {
    $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''}" id="view">${viewWith(r.q)}</div>`;
    decorateStudies($app); if (r.q.get('d')) refreshWith(r.q.get('d')); return;
  }
  let vo = null; if (!state || !state.onboarded) { try { vo = localStorage.getItem('uts.viewOnly'); } catch {} }
  if (vo) { // he opened her link before: the app is just her rhythm for him
    $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''}" id="view">${viewWith(new URLSearchParams({ d: vo }))}</div>`;
    decorateStudies($app); refreshWith(vo); return;
  }
  if (!state || !state.onboarded) {
    document.documentElement.dataset.phase = '';
    $app.innerHTML = `${statusbar()}<div class="view onb-view ${fresh ? 'enter' : ''}" id="view">${viewOnboarding()}</div>`;
    mountFigures();
    // the hormone panel: drag along the chart too, it moves the day slider
    document.querySelectorAll('.o9-hp').forEach(card => {
      const hit = card.querySelector('.cchart .hit'), svg = card.querySelector('.cchart svg'), sl = card.querySelector('.o9-day'); if (!hit || !sl) return;
      const L = +sl.dataset.l, { W } = chartGeom(L, true);
      const mv = e => { const r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * W, cd = Math.max(1, Math.min(L, Math.floor((vx - 4) / (W - 8) * L) + 1)); if (+sl.value !== cd) { sl.value = cd; sl.dispatchEvent(new Event('input', { bubbles: true })); } };
      hit.addEventListener('pointerdown', e => { hit.setPointerCapture(e.pointerId); mv(e); });
      hit.addEventListener('pointermove', e => { if (e.buttons) mv(e); });
    });
    ui.ambOn = true; if (navigator.userActivation?.hasBeenActive) ambience(true);
    return;
  }
  if (ui.ambOn !== false) { ui.ambOn = false; ambience(false); } // fades out as she arrives in the app
  M = model();
  const ph = (ui.phasePreview || M.info?.phase) || ''; // the whole app takes the colour of her phase
  if (document.documentElement.dataset.phase !== ph) document.documentElement.dataset.phase = ph;
  const views = {
    today: viewToday, saved: viewSaved, ground: viewGround, roadmap: viewRoadmap, calendar: viewCalendar, log: viewLog, brain: () => viewBrain(r.id), breathe: () => viewBreathe(r.id), do: () => viewTopic(r.id), plan: viewPlan, diet: viewDiet, insights: viewInsights, profile: viewProfile, share: viewShare, cosmic: viewCalendar, manifest: viewManifest, moon: viewCalendar, grocery: viewGrocery, remedy: () => viewRemedy(r.id), supp: () => (r.id ? viewSupp(r.id) : viewSupps()), habits: viewHabits, guide: viewGuide, sugar: viewSugar, tea: () => (r.id ? viewTeaItem(r.id) : viewTea()), nutrients: () => (r.id ? viewNutrient(r.id) : viewNutrients()), rhythm: viewRhythm, partners: () => viewPartners(r.id), hormones: viewHormones, move: viewMove, stress: viewStress, season: () => viewSeason(r.id), world: () => viewWorld(r.id), privacy: viewPrivacy, relief: () => (r.id ? viewRelief(r.id) : viewReliefIndex()),
    recipe: () => viewRecipe(r.id), ritual: () => viewRitual(r.id), point: () => viewPoint(r.id), article: () => viewArticle(r.id), learn: viewLearn,
  };
  const tabs = ['today', 'calendar', 'log', 'plan', 'insights'];
  const html = (views[r.name] || viewToday)();
  const arriving = $app.querySelector('.arrive');
  $app.innerHTML = `${statusbar()}<div class="view ${fresh ? 'enter' : ''} ${arriving ? 'arrive-in' : ''}" id="view">${html}</div>${tabs.includes(r.name) || !views[r.name] ? tabbar(r.name in views ? r.name : 'today') : ''}${!termsOK() && r.name !== 'privacy' ? termsSheet() : ''}`;
  if (arriving) $app.appendChild(arriving);
  if (ui.loveFor) $app.insertAdjacentHTML('beforeend', loveSheet());
  const v = document.getElementById('view');
  v.scrollTop = keep;
  if (ui.arrive && r.name === 'today' && M.info) { ui.arrive = false; playArrival(v); }
  decorateStudies(v);
  if (state.profile.linkSent) publishLive();
  bindCharts();
  bindGuide();
  bindSky();
  bindOrb();
  fireNotifications();
  mountFigures();
  const wk = document.getElementById('week');
  if (wk) { const on = wk.querySelector('.on'); if (on) wk.scrollLeft = on.offsetLeft - wk.clientWidth / 2 + on.clientWidth / 2; }
}

setTimeout(() => startSignals(), 800);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { startSignals(); calSoon(); } });
if ('serviceWorker' in navigator) {
  // pick up new versions right away: check on open and whenever the app comes back to the foreground,
  // then reload once when the new version takes over
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
}
setInterval(() => { if (state?.onboarded) { M = model(); fireNotifications(); } }, 15 * 60 * 1000);
window.addEventListener('hashchange', () => { if (route().name !== 'log') ui.logDate = null; if (route().name !== 'calendar') ui.calEdit = false; render(); });
setInterval(() => { const sb = document.querySelector('.statusbar span'); if (sb) sb.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, ''); }, 30000);
render();
