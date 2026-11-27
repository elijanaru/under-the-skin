// Gathers every sentence the app shows, for the Spanish and Korean dictionaries (js/lang/*.js).
// Needs the "rhythm" preview server on 127.0.0.1:5173 (test storage, never her own data).
// Run: node scripts/i18n-collect.cjs [maxPages]   →   scripts/i18n/keys.json
// It walks the onboarding, then every page it can reach from Today (following nav links) on four days a week apart
// (so each phase shows up), taps the tabs and pickers on each page, and adds the texts that only live in
// notifications and calendar events.
const puppeteer = require('/Users/elijanaru/editing claude/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'i18n');
const MAX = +process.argv[2] || 900;
const w = ms => new Promise(r => setTimeout(r, ms));
// taps that would leave the app, change her cycle, spend money, ask for permissions or wipe data
const NO = /^(nav|back|ac[A-Z]|sound|openLove|sendLove|useGeo|calPick|calSync|calStop|buyUnlock|restoreUnlock|creatorCode|testCode|remPermission|addPartner|openPartner|removePartner|groShare|shareSend|pvDateSend|pvLoveSend|copySay|shareEmail|sharePreview|pastePartner|addPartnerLink|copyText|export|demo|reset|setLang|placeFind|placePick|placeClear|periodStart|togglePeriod|logBleed|calStartCancel|onbEnter|onbNext|onbBack|onbDemo|gateSkip|termsAgree|baDel|evDel|planSave|saveBirthday|hisWakeSave|timer|timerToggle|lemonStart|bzTop|wsClose|loveClose|sigClose|pvLoveClose|fbClose|sfClose|szClose|bzClose|calEdit|setDiet|onbDiet|pickCountry)$/;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const all = new Set();
  for (const shift of [0, 7, 14, 21]) {
    const p = await b.newPage(); await p.setViewport({ width: 402, height: 874, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    p.on('dialog', d => d.dismiss().catch(() => {}));
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.setBypassServiceWorker(true); await p.setCacheEnabled(false); await p.setRequestInterception(true);
    p.on('request', r => {
      if (/\/js\/app\.js/.test(r.url())) {
        const src = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8') + `\nwindow.__app = { ui, render, actions, demoState, calItems, go, get state() { return state; }, setState(v) { state = v; save(); },
          notes: { BODY_NOTES, LOSS_NOTES, NOTIF_TITLE, SUN_REM, NOTIF_KIND, LETTER_TITLE } };\n`;
        r.respond({ status: 200, contentType: 'text/javascript', body: src });
      } else if (/\.(jpe?g|png|webp|mp4|woff2?)(\?|$)/.test(r.url()) || !/127\.0\.0\.1/.test(r.url())) r.respond({ status: 204, body: '' });
      else r.continue();
    });
    await p.evaluateOnNewDocument(sh => {
      if (location.hostname !== '127.0.0.1') return;
      localStorage.clear(); localStorage.setItem('uts.i18nCollect', '1'); localStorage.setItem('uts.lang', 'en');
      localStorage.setItem('uts.termsAt', String(Date.now())); localStorage.setItem('uts.consentAt', String(Date.now()));
      Object.defineProperty(window, '__splashOff', { value: 1 });
      if (sh) { const D = Date, off = sh * 864e5; class FD extends D { constructor(...a) { super(...(a.length ? a : [D.now() + off])); } static now() { return D.now() + off; } } window.Date = FD; }
    }, shift);
    for (let t = 0; t < 3; t++) { // the app can load slowly: wait until it is really there, or reload
      await p.goto('http://127.0.0.1:5173/?nosw=1', { waitUntil: 'networkidle2' }).catch(() => {});
      if (await p.waitForFunction(() => window.__app && window.__app.ui, { timeout: 30000 }).then(() => true, () => false)) break;
      console.log(`day+${shift}: app not ready, reloading`);
    }
    await w(2500);
    await p.evaluate(() => document.getElementById('splash')?.remove());
    if (shift === 0) { // the onboarding, step by step
      for (let s = 0; s <= 12; s++) { await p.evaluate(s => { const u = window.__app.ui; u.onbStep = s; u.onbGateDone = true; u.onb.name = 'Mia'; window.__app.render(); }, s); await w(250); }
    }
    await p.evaluate(() => { const u = window.__app.ui; u.onbStep = 11; u.onbGateDone = true; u.onb.name = 'Mia'; window.__app.render(); }); await w(400);
    await p.evaluate(() => document.querySelector('[data-action=onbNext]')?.click()); await w(1500);
    await p.evaluate(() => { const a = window.__app; const s = a.demoState('Mia'); s.onboarded = true; s.paid = true; a.setState(s); a.render(); }); await w(500);
    // texts that never sit on a page: letters, notification titles, calendar events
    await p.evaluate(async () => {
      const I = await import('./js/i18n.js'), a = window.__app, n = a.notes, seen = [];
      const deep = v => { if (typeof v === 'string') seen.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(deep); };
      deep(n); try { a.calItems().forEach(x => { seen.push(x.t, x.d); }); } catch {}
      seen.forEach(s => I.T(s.replace(/\{n\}/g, 'Mia')));
    });
    const queue = ['today'], done = new Set(), queued = new Set(queue);
    const add = t => { if (!queued.has(t)) { queued.add(t); queue.push(t); } };
    if (shift === 0) { // every detail page by its id, not only the ones a link happens to show (28 Nov 2026)
      const seeds = await p.evaluate(async () => {
        const D = await import('./js/data.js'), ids = v => Array.isArray(v) ? v.map(x => x && x.id).filter(Boolean) : v ? Object.keys(v) : [];
        const fam = { recipe: ids(D.RECIPES), remedy: ids(D.REMEDIES), article: ids(D.ARTICLES), ritual: ids(D.RITUALS), supp: ids(D.SUPP_LIB), nutrients: ids(D.NUTRIENTS),
          relief: ids(D.RELIEF).map(encodeURIComponent), tea: ids(D.TEA_PROFILES), do: ids(D.TIPS), point: ids(D.POINT_SCIENCE), hormones: ['0', '1', '2', '3', '4', '5', '6'] };
        const top = ['calendar', 'plan', 'partners', 'profile', 'explore', 'log', 'share', 'guide', 'hormones', 'move', 'stress', 'sugar', 'energy', 'rhythm', 'quiet', 'manifest', 'ground',
          'breathe', 'habits', 'roadmap', 'insights', 'grocery', 'supp', 'nutrients', 'season', 'trying', 'pill', 'after', 'comeback', 'loss', 'saved', 'learn', 'diet', 'drink', 'relief', 'unlock', 'brain', 'world'];
        return [...top, ...Object.entries(fam).flatMap(([f, l]) => [f, ...l.map(i => `${f}/${i}`)])];
      }).catch(() => []);
      seeds.forEach(add); console.log('seeded', seeds.length, 'detail pages');
      await p.evaluate(async () => { localStorage.removeItem('uts.termsAt'); window.__app.render(); await new Promise(r => setTimeout(r, 300));
        window.dispatchEvent(new Event('offline')); await new Promise(r => setTimeout(r, 300)); localStorage.setItem('uts.termsAt', String(Date.now())); window.__app.render(); }).catch(() => {});
    }
    const t0 = Date.now();
    while (queue.length && done.size < (shift ? Math.min(150, MAX) : MAX)) { // the other days only change phase content
      const h = queue.shift(); done.add(h);
      // one pass inside the page: open it, tap each tab or picker once, note every link it reveals
      const navs = await p.evaluate(async (h, no, cap) => {
        const sleep = ms => new Promise(r => setTimeout(r, ms)), re = new RegExp(no), navs = new Set();
        const open = async () => { if (location.hash !== '#/' + h) { location.hash = '#/' + h; await sleep(220); } };
        const grab = () => document.querySelectorAll('[data-action=nav][data-to]').forEach(e => navs.add(e.dataset.to));
        await open(); grab();
        const seen = new Set(), list = [];
        document.querySelectorAll('#view [data-action]').forEach(e => { const d = e.dataset; if (re.test(d.action)) return; const k = JSON.stringify(d); if (!seen.has(k)) { seen.add(k); list.push(k); } });
        for (const k of list.slice(0, cap)) {
          await open();
          const e = [...document.querySelectorAll('#view [data-action]')].find(x => JSON.stringify(x.dataset) === k);
          if (!e) continue;
          try { e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch {}
          await sleep(90); grab();
          document.querySelectorAll('.ws').forEach(x => x.remove());
        }
        return [...navs];
      }, h, NO.source, h.includes('/') ? 10 : 30).catch(() => []);
      navs.forEach(add);
      if (done.size % 25 === 0) console.log(`day+${shift}: ${done.size} pages, ${queue.length} queued, ${Math.round((Date.now() - t0) / 1000)}s`);
    }
    if (shift === 0) { // states the sample data never reaches: no period, on the pill, a very late period
      const iso = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
      const VARIANTS = [
        [`s.profile.noPeriod = true; s.profile.npWhy = ['pill','train','food','stress','pcos','baby']; s.profile.npSince = '${iso(20)}'; s.logs = {};`, ['today', 'comeback']],
        [`s.profile.noPeriod = true; s.profile.npSince = '${iso(100)}'; s.logs = {};`, ['today', 'comeback']],
        [`s.profile.bc = 'pill'; s.profile.bcPlan = 'keep'; s.profile.pillKind = '21'; s.profile.pillStart = '${iso(10)}';`, ['today', 'calendar', 'profile', 'with', 'pill']],
        [`s.profile.bc = 'pill'; s.profile.bcPlan = 'keep'; s.profile.pillKind = 'cont';`, ['today', 'profile', 'pill']],
        [`s.profile.bc = 'pill'; s.profile.bcPlan = 'keep';`, ['today']],
        [`s.paid = false;`, ['unlock', 'today', 'profile']], // the unlock page as she sees it before paying
        [`s.paid = false; s.trialStart = '${iso(40)}'; s.logs = { '${iso(0)}': { flow: 'medium' } };`, ['unlock', 'today']], // last free day
        [`s.paid = false; s.trialStart = '${iso(40)}'; s.logs = { '${iso(2)}': { flow: 'medium' } };`, ['unlock']], // free cycle over
        [`s.logs = { '${iso(45)}': { flow: 'medium' }, '${iso(44)}': { flow: 'medium' }, '${iso(17)}': { intim: ['Sex, protected'] } };`, ['today', 'calendar', 'brain/${iso(17)}']],
      ];
      for (const [pre, hs] of VARIANTS) {
        await p.evaluate(pre => { const a = window.__app; const s = a.demoState('Mia'); s.onboarded = true; s.paid = true; new Function('s', pre)(s); a.setState(s); a.ui.pfTab = 'cycle'; a.render(); }, pre); await w(300);
        for (const h of hs) await p.evaluate(async (h, no) => {
          const sleep = ms => new Promise(r => setTimeout(r, ms)), re = new RegExp(no);
          location.hash = '#/' + h; await sleep(260);
          const list = [...new Set([...document.querySelectorAll('#view [data-action]')].filter(e => !re.test(e.dataset.action)).map(e => JSON.stringify(e.dataset)))];
          for (const k of list.slice(0, 40)) { const e = [...document.querySelectorAll('#view [data-action]')].find(x => JSON.stringify(x.dataset) === k);
            try { e?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch {} await sleep(80); if (location.hash !== '#/' + h) { location.hash = '#/' + h; await sleep(200); } }
        }, h, NO.source).catch(e => console.log('variant', h, e.message));
      }
      // onboarding with no period and with the pill
      for (let st = 0; st <= 12; st++) await p.evaluate(st => { const a = window.__app, u = a.ui; a.setState({ onboarded: false }); u.onbStep = st; u.onbGateDone = true; Object.assign(u.onb, { name: 'Mia', noPeriod: st === 4, npWhy: ['stress'], bc: 'pill', bcPlan: 'keep', pillKind: st % 2 ? 'cont' : '21' }); a.render(); }, st).catch(() => {});
      await w(300); console.log('variants done');
    }
    const keys = await p.evaluate(() => [...window.__i18nKeys]);
    keys.forEach(k => all.add(k)); console.log(`day+${shift}: ${done.size} pages, ${all.size} sentences so far`);
    await p.close();
  }
  const list = [...all].filter(k => /\p{L}{2}/u.test(k.replace(/<\/?[tx]\d+\/?>|\{\d+\}/g, ''))).sort();
  fs.writeFileSync(path.join(OUT, 'keys.json'), JSON.stringify(list, null, 1));
  console.log('DONE', list.length, 'sentences,', list.join(' ').split(/\s+/).length, 'words');
  await b.close();
})();
