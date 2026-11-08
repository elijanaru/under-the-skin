// Sunrise / sunset for any place and day (compact version of the standard solar-position formulas).
const rad = Math.PI / 180, J1970 = 2440588, J2000 = 2451545, e = rad * 23.4397;
const toJ = d => d.valueOf() / 864e5 - 0.5 + J1970;
const fromJ = j => new Date((j + 0.5 - J1970) * 864e5);
const decl = (l, b) => Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
const meanAnomaly = d => rad * (357.5291 + 0.98560028 * d);
const eclLong = M => M + rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + rad * 102.9372 + Math.PI;

export function sunTimes(date, lat, lng) {
  const lw = rad * -lng, phi = rad * lat, d = toJ(date) - J2000;
  const n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
  const ds = 0.0009 + lw / (2 * Math.PI) + n;
  const M = meanAnomaly(ds), L = eclLong(M), dec = decl(L, 0);
  const Jnoon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const h0 = -0.833 * rad;
  const cosw = (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (cosw < -1 || cosw > 1) return { rise: null, set: null, noon: fromJ(Jnoon) }; // polar day / night
  const w = Math.acos(cosw), a = 0.0009 + (w + lw) / (2 * Math.PI) + n;
  const Jset = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  return { rise: fromJ(Jnoon - (Jset - Jnoon)), set: fromJ(Jset), noon: fromJ(Jnoon) };
}

// Height of the sun above the horizon (radians) at a moment, for the UV estimate.
export function sunAltitude(date, lat, lng) {
  const lw = rad * -lng, phi = rad * lat, d = toJ(date) - J2000;
  const L = eclLong(meanAnomaly(d)), dec = decl(L, 0), ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
  const H = rad * (280.16 + 360.9856235 * d) - lw - ra;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

// Capital-city coordinates, used until someone shares their exact location.
export const COUNTRY_GEO = {
  DE: [52.52, 13.4], AT: [48.21, 16.37], CH: [46.95, 7.45], NL: [52.37, 4.9], BE: [50.85, 4.35], DK: [55.68, 12.57], PL: [52.23, 21.01],
  CZ: [50.08, 14.43], SE: [59.33, 18.07], NO: [59.91, 10.75], GB: [51.51, -0.13], IE: [53.35, -6.26], FI: [60.17, 24.94], FR: [48.86, 2.35],
  ES: [40.42, -3.7], IT: [41.9, 12.5], PT: [38.72, -9.14], GR: [37.98, 23.73], HR: [45.81, 15.98], TR: [41.01, 28.98], US: [40.71, -74.0],
  CA: [43.65, -79.38], KR: [37.57, 126.98], AU: [-33.87, 151.21], NZ: [-36.85, 174.76], ZA: [-33.92, 18.42],
  LU: [49.61, 6.13], LI: [47.14, 9.52], SK: [48.15, 17.11], HU: [47.5, 19.04], SI: [46.06, 14.51], RO: [44.43, 26.1], BG: [42.7, 23.32], RS: [44.79, 20.45],
  BA: [43.86, 18.41], XK: [42.66, 21.17], ME: [42.44, 19.26], MK: [41.99, 21.43], AL: [41.33, 19.82], MT: [35.9, 14.51], CY: [35.17, 33.36], MC: [43.74, 7.42],
  AD: [42.51, 1.52], SM: [43.94, 12.45], IS: [64.15, -21.94], EE: [59.44, 24.75], LV: [56.95, 24.11], LT: [54.69, 25.28], UA: [50.45, 30.52], MD: [47.01, 28.86],
  BY: [53.9, 27.56], RU: [55.76, 37.62],
  IN: [28.61, 77.21], PK: [33.68, 73.05], BD: [23.81, 90.41], NP: [27.72, 85.32], BT: [27.47, 89.64], LK: [6.93, 79.86], MV: [4.18, 73.51], CN: [39.9, 116.4],
  JP: [35.68, 139.69], TW: [25.03, 121.57], HK: [22.32, 114.17], MO: [22.2, 113.54], MN: [47.92, 106.92], TH: [13.76, 100.5], VN: [21.03, 105.85],
  ID: [-6.21, 106.85], MY: [3.14, 101.69], SG: [1.35, 103.82], PH: [14.6, 120.98], KH: [11.56, 104.92], LA: [17.98, 102.63], MM: [16.87, 96.2],
  BN: [4.9, 114.94], TL: [-8.56, 125.57], KZ: [43.24, 76.89], UZ: [41.3, 69.24], KG: [42.87, 74.59], TJ: [38.56, 68.79], TM: [37.96, 58.33],
  AF: [34.56, 69.21], IR: [35.69, 51.39], IQ: [33.31, 44.36], SA: [24.71, 46.68], AE: [25.2, 55.27], QA: [25.29, 51.53], KW: [29.38, 47.99],
  BH: [26.23, 50.59], OM: [23.59, 58.41], YE: [15.37, 44.19], JO: [31.95, 35.93], LB: [33.89, 35.5], SY: [33.51, 36.28], IL: [32.09, 34.78],
  PS: [31.9, 35.2], GE: [41.72, 44.79], AM: [40.18, 44.51], AZ: [40.41, 49.87],
  AR: [-34.6, -58.38], CL: [-33.45, -70.67], UY: [-34.9, -56.16], BR: [-23.55, -46.63], CO: [4.71, -74.07], PE: [-12.05, -77.04], EC: [-0.18, -78.47],
  VE: [10.48, -66.9], BO: [-16.5, -68.15], PY: [-25.26, -57.58], GY: [6.8, -58.16], SR: [5.85, -55.2], MX: [19.43, -99.13],
};
