// Copies the web app into www/ for the iPhone and Android apps (Capacitor). Run: npm run build
// The app copy is minified (25 Nov 2026) so the phone has less to read at launch; the source files stay as they are.
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
const FILES = ['index.html', 'styles.css', 'manifest.json', 'sw.js', 'icon.svg', 'js', 'images', 'icons', 'models', 'vendor', 'sounds', 'fonts', 'uts_chime.wav'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const f of FILES) cpSync(f, `www/${f}`, { recursive: true, filter: src => !src.includes('stk-src') }); // her raw drawings stay out of the app

let esbuild = null;
try { esbuild = await import('esbuild'); } catch { console.log('esbuild not found: www/ left unminified'); }
if (esbuild) {
  const opt = { minify: true, target: 'esnext', charset: 'utf8', legalComments: 'none' };
  let before = 0, after = 0;
  const squeeze = async (path, loader) => { const src = readFileSync(path, 'utf8'); const out = (await esbuild.transform(src, { ...opt, loader })).code;
    before += src.length; after += out.length; writeFileSync(path, out); };
  for (const f of readdirSync('www/js')) if (f.endsWith('.js')) await squeeze(`www/js/${f}`, 'js');
  await squeeze('www/styles.css', 'css');
  // the language dictionaries are plain data: JSON.parse reads a big table much faster than a JS object literal
  for (const f of readdirSync('www/js/lang')) if (f.endsWith('.js')) {
    const src = readFileSync(`www/js/lang/${f}`, 'utf8'), obj = (await import(new URL(`../js/lang/${f}`, import.meta.url))).default;
    const out = `export default JSON.parse(${JSON.stringify(JSON.stringify(obj))});`; before += src.length; after += out.length; writeFileSync(`www/js/lang/${f}`, out);
  }
  console.log(`minified: ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
}
console.log('www/ ready');
