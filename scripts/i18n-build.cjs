// Checks the translated chunks and writes the dictionaries the app loads.
// Run: node scripts/i18n-build.cjs   (reads scripts/i18n/out/<lang>-*.json, writes js/lang/<lang>.js)
// A translation is kept only if it carries exactly the same placeholders as the English ({0}, <t0>…</t0>, <x1/>).
// It also flags long dashes and, in Korean, 당신 (sounds stiff and foreign; she asked for natural, warm Korean).
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'i18n'), OUT = path.join(DIR, 'out');
const keys = JSON.parse(fs.readFileSync(path.join(DIR, 'keys.json'), 'utf8'));
const marks = s => (s.match(/<\/?[tx]\d+\/?>|\{\d+\}/g) || []).sort().join(' ');
for (const lang of ['es', 'ko']) {
  const dict = {}, bad = [];
  // the existing dictionary first, then new chunks on top
  const old = path.join(__dirname, '..', 'js', 'lang', `${lang}.js`);
  if (fs.existsSync(old)) { try { Object.assign(dict, JSON.parse(fs.readFileSync(old, 'utf8').replace(/^[^{]*/, '').replace(/;\s*$/, ''))); } catch {} }
  for (const f of fs.existsSync(OUT) ? fs.readdirSync(OUT).filter(f => f.startsWith(lang + '-') && f.endsWith('.json')).sort() : []) {
    let part; try { part = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { console.log(`${f}: not valid JSON (${e.message})`); continue; }
    for (const [k, v] of Object.entries(part)) {
      if (typeof v !== 'string' || !v.trim()) continue;
      const why = marks(k) !== marks(v) ? 'placeholders' : /[—–]/.test(v) && !/[—–]/.test(k) ? 'long dash' : lang === 'ko' && /당신/.test(v) ? '당신' : '';
      if (why) { bad.push([f, why, k, v]); continue; }
      dict[k] = v;
    }
  }
  const missing = keys.filter(k => !(k in dict));
  fs.writeFileSync(old, `// ${lang === 'es' ? 'Spanish' : 'Korean'} dictionary: English sentence → translation. Built by scripts/i18n-build.cjs, do not edit by hand.\nexport default ${JSON.stringify(dict, null, 0).replace(/","/g, '",\n"')};\n`);
  fs.writeFileSync(path.join(DIR, `${lang}-rejected.json`), JSON.stringify(bad, null, 1));
  fs.writeFileSync(path.join(DIR, `${lang}-missing.json`), JSON.stringify(missing, null, 1));
  console.log(`${lang}: ${Object.keys(dict).length} translated, ${bad.length} rejected, ${missing.length} of ${keys.length} still missing`);
}
