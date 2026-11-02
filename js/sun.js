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

// Capital-city coordinates, used until someone shares their exact location.
export const COUNTRY_GEO = {
  DE: [52.52, 13.4], AT: [48.21, 16.37], CH: [46.95, 7.45], NL: [52.37, 4.9], BE: [50.85, 4.35], DK: [55.68, 12.57], PL: [52.23, 21.01],
  CZ: [50.08, 14.43], SE: [59.33, 18.07], NO: [59.91, 10.75], GB: [51.51, -0.13], IE: [53.35, -6.26], FI: [60.17, 24.94], FR: [48.86, 2.35],
  ES: [40.42, -3.7], IT: [41.9, 12.5], PT: [38.72, -9.14], GR: [37.98, 23.73], HR: [45.81, 15.98], TR: [41.01, 28.98], US: [40.71, -74.0],
  CA: [43.65, -79.38], KR: [37.57, 126.98], AU: [-33.87, 151.21], NZ: [-36.85, 174.76], ZA: [-33.92, 18.42],
};
