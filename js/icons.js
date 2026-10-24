// Minimal line icon set (24px grid).
const P = {
  home: '<path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  leaf: '<path d="M5 19.5C5 11 10.5 5 20 4.5c0 9.5-6 15-14.5 15z"/><path d="M5 19.5 13 11.5"/>',
  chart: '<path d="M3.5 17c3-6 5-9 8-9s3.5 6 9-3.5"/><path d="M3.5 20.5h17"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 6 6 6-6 6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
  drop: '<path d="M12 3.5c3 4 6 7.4 6 10.8a6 6 0 0 1-12 0c0-3.4 3-6.8 6-10.8z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8c0-1.2 1.2-1.6 1.2-3M13.5 8c0-1.2 1.2-1.6 1.2-3"/>',
  mind: '<path d="M12 5.5a3.5 3.5 0 0 0-6.6 1.7A3.5 3.5 0 0 0 4.5 13a3.5 3.5 0 0 0 3 5 3 3 0 0 0 4.5 1.3zM12 5.5a3.5 3.5 0 0 1 6.6 1.7 3.5 3.5 0 0 1 .9 5.8 3.5 3.5 0 0 1-3 5 3 3 0 0 1-4.5 1.3z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15c1.6.6 2.6 2.2 3 5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  menu: '<path d="M4 8.5h16M9 15.5h11"/>',
  book: '<path d="M4.5 5A2 2 0 0 1 6.5 3h13v15.5h-13a2 2 0 0 0-2 2zM4.5 20.5V5"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  thermo: '<path d="M10 14V5.5a2 2 0 0 1 4 0V14a4 4 0 1 1-4 0z"/>',
  bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>',
  hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10.5V5.5a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7-3 0-4.5-2-6-4.5l-1.3-2.3a1.4 1.4 0 0 1 2.4-1.5L8 14"/>',
  cup: '<path d="M4.5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM16.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-2"/><path d="M8.5 6c0-1 1-1.3 1-2.5M12 6c0-1 1-1.3 1-2.5"/>',
  yinyang: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a4.25 4.25 0 0 1 0 8.5 4.25 4.25 0 0 0 0 8.5"/><circle cx="12" cy="7.75" r=".9" fill="currentColor"/><circle cx="12" cy="16.25" r=".9" fill="currentColor"/>',
};

const LOGO = '<path d="M12 3.5c2.2 2.7 2.2 6.6 0 9.8-2.2-3.2-2.2-7.1 0-9.8z"/><path d="M3.6 8.6c3.3.2 6 2.6 7.1 6.1-3.4-.2-6.2-2.4-7.1-6.1z"/><path d="M20.4 8.6c-3.3.2-6 2.6-7.1 6.1 3.4-.2 6.2-2.4 7.1-6.1z"/><circle cx="12" cy="18.2" r="2.3"/>';

export function icon(name, size = 20, sw = 1.6) {
  if (name === 'logo') return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${LOGO}</svg>`;
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${P[name] || ''}</svg>`;
}
