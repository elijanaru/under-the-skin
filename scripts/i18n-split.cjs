// Splits the sentences that still need a translation into chunks for translators.
// Run: node scripts/i18n-split.cjs <lang> [wordsPerChunk]  →  scripts/i18n/todo/<lang>-NN.json (a JSON array of English keys)
const fs = require('fs'), path = require('path');
const [lang, per = 2500] = process.argv.slice(2), DIR = path.join(__dirname, 'i18n');
const keys = JSON.parse(fs.readFileSync(path.join(DIR, 'keys.json'), 'utf8'));
let have = {}; try { have = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'js', 'lang', `${lang}.js`), 'utf8').replace(/^[^{]*/, '').replace(/;\s*$/, '')); } catch {}
const todo = keys.filter(k => !(k in have)), out = path.join(DIR, 'todo'); fs.mkdirSync(out, { recursive: true });
fs.readdirSync(out).filter(f => f.startsWith(lang + '-')).forEach(f => fs.unlinkSync(path.join(out, f)));
let chunk = [], words = 0, n = 0;
const flush = () => { if (chunk.length) fs.writeFileSync(path.join(out, `${lang}-${String(++n).padStart(2, '0')}.json`), JSON.stringify(chunk, null, 1)); chunk = []; words = 0; };
for (const k of todo) { chunk.push(k); words += k.split(/\s+/).length; if (words >= +per) flush(); }
flush();
console.log(`${lang}: ${todo.length} sentences to translate in ${n} chunks`);
