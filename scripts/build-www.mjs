// Copies the web app into www/ for the iPhone and Android apps (Capacitor). Run: npm run build
import { cpSync, rmSync, mkdirSync } from 'node:fs';
const FILES = ['index.html', 'styles.css', 'manifest.json', 'sw.js', 'icon.svg', 'js', 'images', 'icons', 'models', 'vendor', 'sounds', 'fonts', 'uts_chime.wav'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const f of FILES) cpSync(f, `www/${f}`, { recursive: true, filter: src => !src.includes('stk-src') }); // her raw drawings stay out of the app
console.log('www/ ready');
