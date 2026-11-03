// Copies the web app into www/ for the iPhone and Android apps (Capacitor). Run: npm run build
import { cpSync, rmSync, mkdirSync } from 'node:fs';
const FILES = ['index.html', 'styles.css', 'manifest.json', 'sw.js', 'icon.svg', 'js', 'images', 'icons', 'models', 'vendor', 'sounds'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const f of FILES) cpSync(f, `www/${f}`, { recursive: true });
console.log('www/ ready');
