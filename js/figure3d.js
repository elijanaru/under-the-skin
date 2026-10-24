// 3D "technical" female body: ~30k glowing pearl points on a volumetric body surface,
// rim-lit like glass, with bloom, a slow turn, a rise-in build and focus highlights.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const W = 200, H = 500, S = 1 / 100; // silhouette px -> world units (body ≈ 5 tall)
const HALF = [[100, 70], [108, 73], [110, 83], [117, 87], [127, 91], [137, 96], [145, 103], [150, 113], [153, 128], [156, 160], [160, 205], [164, 250], [167, 280],
  [163, 292], [157, 284], [152, 252], [147, 210], [141, 168], [136, 140], [131, 132], [133, 152], [130, 172], [123, 200], [126, 224], [136, 250],
  [140, 276], [137, 318], [131, 360], [126, 392], [128, 432], [122, 472], [126, 492], [107, 494], [106, 470], [108, 432], [107, 392], [106, 340], [100, 300]];

export const FOCUS3D = {
  head: { x: 100, y: 44, r: 40 }, stars: { x: 100, y: 44, r: 58 }, heart: { x: 108, y: 150, r: 26 },
  womb: { x: 100, y: 262, r: 30 }, body: { x: 100, y: 250, r: 400 },
};

let GEO = null;
function silhouetteMask() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(100, 42, 21, 27, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); HALF.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = HALF.length - 1; i >= 0; i--) g.lineTo(200 - HALF[i][0], HALF[i][1]);
  g.closePath(); g.fill();
  return g.getImageData(0, 0, W, H).data;
}
const gauss = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
// front/back depth shaping: bust, belly, glutes, head.
function depthBoost(cx, y, front) {
  const side = Math.abs(cx - 100);
  if (front) return 1 + .55 * gauss(y, 152, 10) * (side < 30 ? 1 : 0) + .12 * gauss(y, 238, 18);
  return 1 + .45 * gauss(y, 268, 16) * (side < 40 ? 1 : 0);
}
function buildGeometry() {
  const a = silhouetteMask(), pos = [], nor = [], rnd = [];
  let seed = 11; const r1 = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 2; y < H - 2; y += 1.5) {
    // find horizontal spans inside the silhouette on this row
    const row = (y | 0) * W, spans = [];
    let x0 = -1;
    for (let x = 0; x <= W; x++) {
      const inside = x < W && a[(row + x) * 4 + 3] > 128;
      if (inside && x0 < 0) x0 = x;
      if (!inside && x0 >= 0) { spans.push([x0, x - 1]); x0 = -1; }
    }
    for (const [s0, s1] of spans) {
      const r = Math.max(1.2, (s1 - s0) / 2), cx = (s0 + s1) / 2;
      const isLimb = r < 9 && Math.abs(cx - 100) > 6, isHead = y < 72;
      const rz = isHead ? r * .95 : isLimb ? r : Math.min(r * .62, y < 135 ? 14 + (y - 85) * .08 : 22);
      const n = Math.max(10, Math.round(2 * Math.PI * Math.max(r, rz) / 1.6));
      for (let k = 0; k < n; k++) {
        const t = (k + r1() * .6) / n * Math.PI * 2;
        const front = Math.sin(t) > 0;
        const z = Math.sin(t) * rz * (isHead || isLimb ? 1 : depthBoost(cx, y, front));
        const x = cx + Math.cos(t) * r;
        pos.push((x - 100) * S, (H / 2 - y) * S, z * S);
        const nx = Math.cos(t) / r, nz = Math.sin(t) / rz, l = Math.hypot(nx, nz) || 1;
        nor.push(nx / l, 0, nz / l);
        rnd.push(r1());
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rnd, 1));
  return geo;
}

const VERT = `
  attribute float aRand;
  uniform float uTime, uBuild, uPR, uScan;
  uniform vec3 uFocus; uniform float uFocusR;
  varying float vBright; varying float vNear; varying float vAlpha;
  void main() {
    vec3 p = position;
    // rise-in: feet first; points float up into place
    float start = (p.y + 2.5) / 5.0 * 1.6 + aRand * .25;
    float k = clamp((uBuild - start) / .9, 0., 1.);
    float e = 1. - pow(1. - k, 3.);
    p.y -= (1. - e) * (0.6 + aRand * .5);
    p.x += sin(uTime * .8 + p.y * 3.) * .004;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    vec3 n = normalize(normalMatrix * normal);
    float rim = 1. - abs(dot(n, normalize(-mv.xyz)));
    float scan = smoothstep(.14, 0., abs(p.y - uScan));
    float pearlBig = step(.962, aRand);
    float spec = pow(max(dot(n, normalize(vec3(-.5, .6, .65))), 0.), 10.);
    vNear = uFocusR > 0. ? smoothstep(uFocusR, 0., distance(position, uFocus)) : 0.;
    float tw = .8 + .2 * sin(uTime * 2.2 + aRand * 40.);
    vBright = (.07 + pow(rim, 2.2) * 1.0 + spec * .55 + pearlBig * .45) * tw + scan * .35 + vNear * .55;
    vAlpha = e;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (.9 + aRand * 1.2 + pearlBig * 1.8) * (1. + scan * .4 + vNear * .5) * uPR * clamp(13.0 / -mv.z, .6, 1.6);
  }`;
const FRAG = `
  varying float vBright; varying float vNear; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - .5; float d = length(c);
    if (d > .5) discard;
    float core = smoothstep(.5, .0, d);
    vec3 col = mix(vec3(.94, .96, .93), vec3(.83, .94, .6), vNear);
    float pearl = core * core;
    gl_FragColor = vec4(col * (.55 + vBright), pearl * vAlpha * clamp(vBright, 0., 1.) * .55);
  }`;

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function mountFigure3D(canvas, { focus = null, intro = true, turn = true } = {}) {
  if (!GEO) GEO = buildGeometry();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const pr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const F = focus && FOCUS3D[focus];
  const fWorld = F ? new THREE.Vector3((F.x - 100) * S, (H / 2 - F.y) * S, .2) : new THREE.Vector3();
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uBuild: { value: intro ? 0 : 10 }, uPR: { value: pr }, uScan: { value: -9 },
      uFocus: { value: fWorld }, uFocusR: { value: F && focus !== 'body' ? F.r * S : 0 } },
  });
  const body = new THREE.Points(GEO, mat);
  scene.add(body);
  // focus ring (HUD) in world space
  let ring = null;
  if (F && focus !== 'body') {
    const rg = new THREE.RingGeometry(F.r * S * 1.05, F.r * S * 1.1, 64);
    ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xd4ef9a, transparent: true, opacity: .7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.copy(fWorld); ring.position.z = .6; scene.add(ring);
  }
  // orbiting star points for the birthday step
  let stars = null;
  if (focus === 'stars') {
    const sg = new THREE.BufferGeometry(), sp = [];
    for (let i = 0; i < 14; i++) { const t = i / 14 * Math.PI * 2; sp.push(Math.cos(t) * .62, 0, Math.sin(t) * .62); }
    sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xd4ef9a, size: .05, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    stars.position.copy(fWorld); scene.add(stars);
  }
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .45, .32);
  composer.addPass(bloom);

  function size() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h;
    // fit body (5.1 units tall) or zoom toward the focus area
    const zoomed = F && focus !== 'body' && !intro;
    const target = zoomed ? Math.max(3.2, F.r * S * 9) : 5.6;
    const dist = target / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.min(1, camera.aspect * 2.2);
    camera.position.set(0, zoomed ? fWorld.y * .6 : 0, dist);
    camera.lookAt(0, zoomed ? fWorld.y * .6 : 0, 0);
    camera.updateProjectionMatrix();
  }
  size();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now(); let raf, alive = true;
  function frame(now) {
    if (!alive) return;
    const t = (now - t0) / 1000;
    mat.uniforms.uTime.value = t;
    if (intro) mat.uniforms.uBuild.value = t;
    const built = !intro || t > 2.8;
    mat.uniforms.uScan.value = built ? 2.7 - (((t - (intro ? 2.8 : 0)) * .9) % 6.4) : -9;
    // camera rises with the build ("body going up"), then settles
    if (intro && t < 3.2) { const k = Math.min(1, t / 3.2), e = 1 - Math.pow(1 - k, 3); camera.position.y = -1.6 + 1.6 * e; camera.lookAt(0, -1.2 + 1.2 * e, 0); }
    if (turn && !reduce) body.rotation.y = Math.sin(t * .35) * (F && focus !== 'body' ? .3 : .55);
    body.position.y = Math.sin(t * .6) * .03;
    if (ring) { ring.material.opacity = .45 + .35 * Math.sin(t * 2.4); ring.scale.setScalar(1 + .06 * Math.sin(t * 2.4)); }
    if (stars) stars.rotation.y = t * .5;
    composer.render();
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const ro = new ResizeObserver(size); ro.observe(canvas);
  return () => {
    alive = false; cancelAnimationFrame(raf); ro.disconnect();
    mat.dispose(); ring?.geometry.dispose(); ring?.material.dispose(); stars?.geometry.dispose(); stars?.material.dispose();
    composer.dispose?.(); renderer.dispose(); renderer.forceContextLoss?.();
  };
}
