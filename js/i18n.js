// Spanish and Korean (19 Nov 2026). The app is written in English; this layer swaps each piece of text for its
// translation right before it reaches the screen, so the views stay plain English templates. A sentence is looked up
// whole, with its bold/italic pieces as numbered tags (<t0>..</t0>), icons and pictures as <x1/>, and numbers, dates and
// her name as {0} placeholders, so word order can change freely (Korean puts the verb last). Anything without a
// translation yet simply stays English. The dictionaries live in js/lang/<code>.js (English sentence → translation).
export const LANGS = { en: 'English', es: 'Español', ko: '한국어' };
const LOCALE = { en: 'en-US', es: 'es-ES', ko: 'ko-KR' };
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch {} return null; };
function pick() {
  const s = store('uts.lang'); if (s && LANGS[s]) return s;
  for (const l of navigator.languages || [navigator.language || 'en']) { const b = String(l).slice(0, 2).toLowerCase(); if (LANGS[b]) return b; }
  return 'en';
}
export const LANG = pick();
export const LOC = LOCALE[LANG];
export const chosen = () => store('uts.lang'); // null while she follows the phone's language
let DICT = null;
// the crawler (scripts/i18n-collect) turns this on to gather every sentence the app shows
const collect = store('uts.i18nCollect') ? new Set() : null;
if (collect) window.__i18nKeys = collect;
const on = () => DICT || collect;

export async function ready() {
  document.documentElement.lang = LANG;
  if (LANG === 'en') return;
  // Korean gets its own soft, rounded fonts (19 Nov 2026, her ask): Gowun Dodum for text, Jua for big titles
  if (LANG === 'ko' && !document.getElementById('ko-font')) { const l = document.createElement('link'); l.id = 'ko-font'; l.rel = 'stylesheet';
    l.href = 'fonts/ko-fonts.css'; document.head.appendChild(l); }
  try { DICT = new Map(Object.entries((await import(`./lang/${LANG}.js`)).default)); } catch { DICT = null; }
}
export function setLang(l) { if (l === 'auto') store('uts.lang', null); else store('uts.lang', l); location.reload(); }

// ---------- keys: numbers, month and weekday names and her name become placeholders ----------
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], DY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let NAMES = [];
export function setNames(list) { NAMES = [...new Set(list.filter(n => n && n.length > 1))].sort((a, b) => b.length - a.length); }
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let TOK = null, tokFor = '';
function tokRe() {
  const k = NAMES.join('|'); if (TOK && tokFor === k) return TOK; tokFor = k;
  // short month names only next to a number ("Nov 19", "19 Nov"), "May" too ("may help" stays a word); weekday
  // short names only before a comma or a date ("Thu, Nov 19"), so "Sun" in "Sun & light" stays a word
  const parts = [
    ...(NAMES.length ? [`(?<name>${NAMES.map(reEsc).join('|')})(?![\\p{L}])`] : []),
    `\\b(?<month>${MONTHS.filter(m => m !== 'May').join('|')})\\b`,
    `\\b(?<mon>${MON.join('|')})\\.?(?= \\d)`, `(?<=\\d )(?<mon2>${MON.join('|')})\\b`,
    `\\b(?<day>${DAYS.join('|')})\\b`, `\\b(?<dy>${DY.join('|')})(?=, | (?:\\d|${MON.join('|')}))`,
    `(?<num>\\d+(?:[.,:]\\d+)*)`,
  ];
  return (TOK = new RegExp(parts.join('|'), 'gu'));
}
// text → key piece; the values go to `vals` so the translation gets them back in its own order
function keyText(s, vals) {
  return s.replace(tokRe(), (m, ...a) => { const g = a[a.length - 1]; vals.push(g.name ? { n: m } : g.month ? { m: MONTHS.indexOf(m), long: 1 } : (g.mon || g.mon2) ? { m: MON.indexOf(m.replace('.', '')) }
    : g.day ? { d: DAYS.indexOf(m), long: 1 } : g.dy ? { d: DY.indexOf(m) } : { v: m }); return `{${vals.length - 1}}`; });
}
const dtf = {};
const fmtName = (type, i, long) => { const k = type + long; dtf[k] = dtf[k] || new Intl.DateTimeFormat(LOC, type === 'm' ? { month: long ? 'long' : 'short' } : { weekday: long ? 'long' : 'short' });
  return dtf[k].format(type === 'm' ? new Date(2026, i, 15) : new Date(2026, 10, 15 + i)); }; // 15 Nov 2026 is a Sunday
function valOf(x) { return !x ? '' : x.v != null ? x.v : x.n != null ? x.n : x.m != null ? fmtName('m', x.m, x.long) : fmtName('d', x.d, x.long); }
// dates read the local way: Korean "12월 6일 (일)", Spanish "dom, 6 dic" (the English templates say "Sun, Dec 6")
const KO_WD = '일|월|화|수|목|금|토';
function dates(s) {
  if (LANG === 'ko') return s.replace(new RegExp(`(${KO_WD})(?:요일)?, (\\d{1,2}월) (\\d{1,2})(?![\\d일])`, 'g'), '$2 $3일 ($1)')
    .replace(/(\d{1,2}월) (\d{1,2})(?![\d일시분])/g, '$1 $2일').replace(/(\d{1,2})일 (\d{1,2}월)/g, '$2 $1일');
  if (LANG === 'es') return s.replace(/\b(ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\.? (\d{1,2})\b(?!:)/g, '$2 $1')
    .replace(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) (\d{1,2})\b(?!:)/g, '$2 de $1');
  return s;
}
const hasDate = vals => vals.some(x => x && (x.m != null || x.d != null));
const fill = (t, vals) => { const o = t.replace(/\{(\d+)\}/g, (m, i) => (vals[i] ? valOf(vals[i]) : m)); return hasDate(vals) ? dates(o) : o; };
// short pieces with no words of their own: "17d" on Today's capsules
const BARE = { ko: { '{0}d': '{0}일', '{0}h': '{0}시간' }, es: {} };
const WORD = /\p{L}{2}/u;
function look(key) { if (collect) collect.add(key); return DICT ? DICT.get(key) : undefined; }

// one string (toasts, notifications, calendar events, aria labels)
export function T(s) {
  if (s == null || !on()) return s; const str = String(s); if (!WORD.test(str)) return s;
  const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0], core = str.trim().replace(/\s+/g, ' '), vals = [];
  const key = keyText(core, vals);
  if (!WORD.test(key.replace(/\{\d+\}/g, ''))) { const b = (BARE[LANG] || {})[key] ?? (hasDate(vals) ? key : null); return b == null ? s : lead + fill(b, vals) + tail; }
  const t = look(key); return t == null ? s : lead + fill(t, vals) + tail;
}

// ---------- the DOM: whole sentences with their inline pieces ----------
const INLINE = new Set(['B', 'STRONG', 'I', 'EM', 'SMALL', 'SPAN', 'A', 'SUP', 'SUB', 'U', 'MARK', 'ABBR', 'Q', 'S', 'TIME', 'tspan', 'TSPAN']);
const ATOM = new Set(['BR', 'IMG', 'svg', 'SVG', 'WBR', 'INPUT', 'CANVAS', 'VIDEO', 'PICTURE']);
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'CODE', 'PRE', 'title', 'defs', 'style']);
const noTr = el => el.getAttribute('translate') === 'no' || el.classList?.contains('notranslate');
const ATTRS = ['aria-label', 'placeholder', 'title', 'data-tip'];
function phrasing(el) { for (const c of el.children) { if (ATOM.has(c.nodeName) || noTr(c)) continue; if (!INLINE.has(c.nodeName) || !phrasing(c)) return false; } return true; }
function directText(el) { for (const c of el.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) return true; return false; }
function ser(node, shells, vals) {
  let s = '';
  for (const c of node.childNodes) {
    if (c.nodeType === 3) s += keyText(c.nodeValue, vals);
    else if (c.nodeType === 1) { const i = shells.push(c) - 1; s += ATOM.has(c.nodeName) || noTr(c) ? `<x${i}/>` : `<t${i}>${ser(c, shells, vals)}</t${i}>`; }
  }
  return s;
}
function rebuild(el, t, shells, vals) {
  const doc = el.ownerDocument, root = doc.createDocumentFragment(), stack = [root], re = /<t(\d+)>|<\/t(\d+)>|<x(\d+)\/>/g;
  let last = 0, m; const text = s => { if (s) stack[stack.length - 1].appendChild(doc.createTextNode(fill(s, vals))); };
  while ((m = re.exec(t))) {
    text(t.slice(last, m.index)); last = re.lastIndex;
    if (m[1] != null) { const sh = shells[+m[1]]; if (sh) { const c = sh.cloneNode(false); stack[stack.length - 1].appendChild(c); stack.push(c); } }
    else if (m[2] != null) { if (stack.length > 1) stack.pop(); }
    else { const a = shells[+m[3]]; if (a) stack[stack.length - 1].appendChild(a); }
  }
  text(t.slice(last)); el.replaceChildren(root);
}
function block(el) {
  const shells = [], vals = [], raw = ser(el, shells, vals), key = raw.replace(/\s+/g, ' ').trim();
  if (!WORD.test(key.replace(/<\/?[tx]\d+\/?>|\{\d+\}/g, ''))) {
    const b = (BARE[LANG] || {})[key] ?? (hasDate(vals) ? key : null); // a bare date or "17d": names and units in her language
    if (b != null) return rebuild(el, b, shells, vals);
    for (const c of el.children) if (!ATOM.has(c.nodeName) && !noTr(c)) walk(c); return; }
  const t = look(key); if (t != null) rebuild(el, t, shells, vals);
}
function attrs(el) { for (const a of ATTRS) { const v = el.getAttribute(a); if (v && WORD.test(v)) { const t = T(v); if (t !== v) el.setAttribute(a, t); } } }
function walk(el) {
  if (SKIP.has(el.nodeName) || noTr(el)) return;
  attrs(el);
  if (directText(el) && phrasing(el)) return block(el);
  for (const c of [...el.childNodes]) {
    if (c.nodeType === 3) { if (WORD.test(c.nodeValue)) { const t = T(c.nodeValue); if (t !== c.nodeValue) c.nodeValue = t; } }
    else if (c.nodeType === 1) walk(c);
  }
}
// translate a fragment or element in place (the render path calls this on the new page before it goes in)
export function tr(root) { if (!on() || !root) return root; if (root.nodeType === 11) [...root.children].forEach(walk); else if (root.nodeType === 1) walk(root); return root; }

// everything else that reaches the screen later (sheets, toasts, live readouts) is caught as it arrives
export function watch(target) {
  if (!on()) return;
  let busy = false;
  const mo = new MutationObserver(recs => {
    if (busy) return; busy = true;
    const todo = new Set();
    for (const r of recs) {
      if (r.type === 'childList') r.addedNodes.forEach(n => todo.add(n.nodeType === 1 ? n : n.parentElement));
      else if (r.type === 'characterData') todo.add(r.target.parentElement);
      else todo.add(r.target);
    }
    todo.forEach(n => { if (n && n.isConnected && n.nodeType === 1) { const b = n.parentElement; walk(b && n.nodeName !== 'BODY' && INLINE.has(n.nodeName) && phrasing(b) && directText(b) ? b : n); } });
    mo.takeRecords(); busy = false;
  });
  mo.observe(target, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
