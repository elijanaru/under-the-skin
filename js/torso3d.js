// Full-screen welcome scene: a 3D female torso, overexposed like a photograph, whose anatomy keeps
// surfacing "under the skin" while flowing type wraps over the body and the camera rises along her.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const S = 1 / 100;
const G = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const band = (v, a, b, e = 4) => { const t1 = Math.min(1, Math.max(0, (v - a) / e)), t2 = Math.min(1, Math.max(0, (b - v) / e)); return t1 * t2; };
function keyed(keys, y) {
  if (y <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [y0, v0] = keys[i], [y1, v1] = keys[i + 1];
    if (y <= y1) { const t = (y - y0) / (y1 - y0), e = (1 - Math.cos(t * Math.PI)) / 2; return v0 + (v1 - v0) * e; }
  }
  return keys[keys.length - 1][1];
}
// half-width and half-depth profile of a female torso (silhouette px units)
const RX = [[40, 8.5], [78, 9.5], [86, 14], [92, 27], [99, 36], [112, 37.5], [132, 34.5], [152, 33.5], [176, 28], [198, 24.5], [222, 27.5], [248, 34.5], [270, 38.5], [295, 39.5], [340, 36]];
const RZ = [[40, 8.5], [86, 10], [102, 14], [132, 16], [165, 16], [198, 14], [232, 15.5], [268, 18], [305, 19], [340, 18]];

function bump(x, y, front) {
  if (front) {
    let b = 0;
    for (const s of [-1, 1]) { const dx = x - s * 16.5, dy = y - 156; // rounded breast: fuller below centre, smooth everywhere
      b += 12.5 * Math.exp(-(dx * dx) / (2 * 10.5 * 10.5) - (dy * dy) / (2 * (dy > 0 ? 9.5 : 13) ** 2)); }
    return b + 2.6 * G(y, 234, 18) * G(x, 0, 16);
  }
  let b = 0; for (const s of [-1, 1]) b += 7 * G(x, s * 13, 12) * G(y, 290, 15);
  return b + 3 * G(y, 120, 25);
}
function dent(x, y) {
  const ax = Math.abs(x);
  let d = 3.2 * G(x, 0, 2.2) * G(y, 247, 2.6);                       // navel
  d += .9 * G(x, 0, 2.6) * band(y, 106, 172);                         // sternum
  d += .7 * G(x, 0, 2.2) * band(y, 180, 242);                         // linea alba
  d += 1.7 * G(y, 95 + .012 * (ax - 18) ** 2, 1.7) * band(ax, 6, 34);  // collarbones
  d += .9 * G(y, 88, 5) * G(ax, 0, 6);                                // throat hollow
  for (const s of [-1, 1]) d += 2 * G(y, 164 + .02 * (x - s * 15) ** 2, 2.6) * G(x, s * 15, 9); // under-bust crease
  for (let k = 0; k < 4; k++) d += .8 * G(y, 178 + k * 10 + .012 * (ax - 24) ** 2, 1.8) * band(ax, 14, 33, 3); // ribs
  for (const s of [-1, 1]) { // hip V lines
    const ax0 = s * 30, ay0 = 250, bx = s * 9, by = 302, vx = bx - ax0, vy = by - ay0;
    const t = Math.max(0, Math.min(1, ((x - ax0) * vx + (y - ay0) * vy) / (vx * vx + vy * vy)));
    d += 1.5 * G(Math.hypot(x - (ax0 + vx * t), y - (ay0 + vy * t)), 0, 2.1);
  }
  d += .5 * (G(y, 202, 2) + G(y, 220, 2)) * band(ax, 3, 14, 2);       // soft abs
  return d;
}

// wide, smoky shadow map (separate from geometry so shadows stay soft like an overexposed photo)
function softCavity(x, y) {
  const ax = Math.abs(x);
  let c = .75 * G(x, 0, 3.2) * G(y, 248, 3.6) + .25 * G(x, 0, 7) * G(y, 248, 8);   // navel
  c += .18 * G(x, 0, 4.5) * band(y, 108, 168, 10);                                  // sternum
  c += .14 * G(x, 0, 4) * band(y, 182, 238, 10);                                    // linea alba
  c += .3 * G(y, 96 + .012 * (ax - 18) ** 2, 3.2) * band(ax, 6, 34, 6);             // collarbones
  c += .35 * G(y, 84, 9) * G(ax, 0, 9);                                              // throat
  c += .3 * G(x, 0, 3.5) * G(y, 156, 9);                                            // cleavage
  for (const s of [-1, 1]) c += .16 * G(x, s * 30, 5) * G(y, 152, 12);              // bust sides
  for (const s of [-1, 1]) c += .42 * G(y, 168 + .02 * (x - s * 16.5) ** 2, 4.5) * G(x, s * 16.5, 11); // under-bust
  for (let k = 0; k < 4; k++) c += .14 * G(y, 180 + k * 10 + .012 * (ax - 24) ** 2, 3.2) * band(ax, 14, 33, 5); // ribs
  for (const s of [-1, 1]) {
    const ax0 = s * 30, ay0 = 252, bx = s * 10, by = 304, vx = bx - ax0, vy = by - ay0;
    const t = Math.max(0, Math.min(1, ((x - ax0) * vx + (y - ay0) * vy) / (vx * vx + vy * vy)));
    c += .22 * G(Math.hypot(x - (ax0 + vx * t), y - (ay0 + vy * t)), 0, 4.2);         // hip lines
  }
  c += .22 * G(ax, 30, 8) * band(y, 175, 240, 20);                                  // waist side shadow
  return Math.min(1, c);
}

function buildTorso() {
  const rows = [], segs = 180, pos = [], uv = [], cav = [];
  for (let y = 40; y <= 340; y += 1) rows.push(y);
  for (const y of rows) {
    const rx = keyed(RX, y), rz = keyed(RZ, y);
    for (let j = 0; j <= segs; j++) {
      const th = j / segs * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      let x = rx * c, z = rz * s;
      const front = s > 0;
      z += (front ? 1 : -1) * bump(x, y, front) * Math.pow(Math.abs(s), 1.6);
      let cv = 0;
      if (front) { const d0 = dent(x, y) * .7, dd = d0 * Math.pow(s, 1.2), l = Math.hypot(x, z) || 1; x -= x / l * dd * .35; z -= dd; cv = softCavity(x, y) * Math.pow(s, .6); }
      cav.push(Math.min(1, cv));
      pos.push(x * S, (250 - y) * S, z * S);
      uv.push(x * S / 1.0 + .5, (250 - y) * S / 1.6);
    }
  }
  const idx = [];
  for (let r = 0; r < rows.length - 1; r++) for (let j = 0; j < segs; j++) {
    const a = r * (segs + 1) + j, b = a + segs + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aCav', new THREE.Float32BufferAttribute(cav, 1));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cav.flatMap(c => { const v = 1 - c * .55; return [v, v, v]; }), 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function textTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 2048;
  const g = c.getContext('2d');
  const draw = () => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 2048);
    g.fillStyle = '#0d1a12'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const blocks = [['under the skin.', 'HORMONES · CYCLE · RITUAL'], ['水  木  火  土', 'FOUR INNER SEASONS']];
    blocks.forEach(([a, b], i) => {
      const cy = 380 + i * 1024;
      g.font = '300 74px Outfit, sans-serif'; g.fillText(a, 512, cy);
      g.font = '600 18px Outfit, sans-serif'; g.fillText(b.split('').join(String.fromCharCode(8202)), 512, cy + 60);
      g.font = '500 13px Outfit, sans-serif'; g.globalAlpha = .5;
      g.fillText('ESTROGEN · PROGESTERONE · LH · FSH', 512, cy + 330);
      g.fillText('MENSTRUAL — FOLLICULAR — OVULATORY — LUTEAL', 512, cy + 560);
      g.fillText('XX — 2026 · 01 / 28', 512, cy - 260);
      g.globalAlpha = 1;
    });
  };
  draw();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  document.fonts?.load('300 92px Outfit').then(() => { draw(); tex.needsUpdate = true; }).catch(() => {});
  return tex;
}

const VERT = `
  attribute float aCav;
  varying vec3 vN; varying vec3 vP; varying vec3 vView; varying float vCav;
  void main() {
    vP = position; vCav = aCav;
    vec4 wp = modelMatrix * vec4(position, 1.);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const FRAG = `
  uniform float uTime, uReveal, uFlow, uDark, uGlitch, uDbg;
  uniform sampler2D uText;
  varying vec3 vN; varying vec3 vP; varying vec3 vView; varying float vCav;
  void main() {
    vec3 n = normalize(vN);
    vec3 L = normalize(vec3(-.45, .5, .72));
    float diff = dot(n, L) * .5 + .5;                 // soft wrap light
    float fill = max(dot(n, normalize(vec3(.6, -.1, .7))), 0.) * .25;
    float rim = 1. - max(dot(n, vView), 0.);
    float light = .04 + pow(diff, 2.0) * 1.2 + fill - rim * .9 * uReveal;
    float exposed = 1. - exp(-max(light, 0.) * 1.85);           // overexposed photo look
    exposed *= 1. - vCav * .5;                       // smoky contours: navel, ribs, collarbones, bust
    exposed *= 1. - pow(rim, 2.2) * .55;              // roundness toward the sides
    float shade = mix(1., exposed, uReveal);          // reveal = anatomy surfacing
    // flowing type printed on the skin
    vec2 tuv = vec2(vP.x / 1.0 + .5, (vP.y / 1.6) - uFlow);
    tuv.x += sin(tuv.y * 14. + uTime * 1.3) * .006 + n.x * .012;
    float bandy = step(.82, fract(tuv.y * 9. + floor(uTime * 3.) * .37));
    tuv.x += uGlitch * bandy * .035;
    float ink = 0.;
    if (uDark < .5 && tuv.x > 0. && tuv.x < 1. && max(dot(n, vView), 0.) > .3) ink = texture2D(uText, tuv).a;
    vec3 paper = vec3(.965, .972, .955), shadowCol = vec3(.05, .1, .075);
    vec3 col = mix(shadowCol, paper, shade);
    col = mix(col, shadowCol, ink * .78);
    col = mix(col, shadowCol * 1.4, uDark * (.55 + rim * .35));
    gl_FragColor = vec4(col, 1.);
    if (uDbg > .5) gl_FragColor = vec4(vec3(1. - vCav), 1.);
    if (uDbg > 1.5) gl_FragColor = vec4(n * .5 + .5, 1.);
  }`;

export function mountTorso3D(canvas, grainCanvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const pr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd8dcd5);
  scene.fog = new THREE.Fog(0xd8dcd5, 3.4, 7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(40, 1, .05, 40);

  // lights: soft key from upper-left front (casts the shadows that give volume), cool fill, faint hemi
  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(-2.3, 1.5, 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 2.2, bottom: -1.4, near: .5, far: 8 });
  key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -.0006; key.shadow.normalBias = .02;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe4efe6, .3); fill.position.set(1.6, .3, 1.4); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f786f, .22));

  const tex = textTexture();
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xebe5de, map: tex, vertexColors: true, roughness: .58, metalness: 0, envMapIntensity: .3,
    sheen: .5, sheenRoughness: .75, sheenColor: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0xffffff), emissiveIntensity: 0,
  });
  const torso = new THREE.Mesh(buildTorso(), skin);
  torso.castShadow = true; torso.receiveShadow = true;
  scene.add(torso);
  // arms: smooth tapered lathe shapes (shoulder → elbow → wrist), in deep shadow
  const armProfile = [];
  for (let i = 0; i <= 40; i++) { const t = i / 40, r = .078 - .03 * t + .01 * Math.exp(-((t - .45) ** 2) / .004); armProfile.push(new THREE.Vector2(Math.max(.02, r), -t * 2.6)); }
  const armMat = new THREE.MeshStandardMaterial({ color: 0x55645a, roughness: .8 });
  for (const sd of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.LatheGeometry(armProfile, 48), armMat);
    arm.position.set(sd * .5, 1.6, -.12); arm.rotation.z = sd * .07;
    arm.castShadow = true; arm.receiveShadow = true;
    scene.add(arm);
  }

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 3, aperture: .0009, maxblur: .0035 });
  composer.addPass(bokeh);
  composer.addPass(new OutputPass());

  const gctx = grainCanvas.getContext('2d');
  function size() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    grainCanvas.width = Math.ceil(w / 2); grainCanvas.height = Math.ceil(h / 2);
  }
  size();
  window.__torso = window.__torso || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now(); let raf, alive = true, last = t0;
  function frame(now) {
    if (!alive) return;
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    // camera rises along her body and back (14s), close and slightly low for real perspective depth
    const k = (1 - Math.cos((t / 14) * Math.PI * 2)) / 2;
    const fitW = .9, hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const dist = (fitW / 2) / Math.tan(hf / 2);
    const y = -.3 + k * 1.0;
    camera.position.set(Math.sin(t * .23) * .18, y - .06, dist);
    camera.lookAt(0, y, 0);
    bokeh.uniforms.focus.value = dist;
    torso.rotation.y = Math.sin(t * .31) * .22;
    torso.scale.set(1 + Math.sin(t * .9) * .006, 1, 1 + Math.sin(t * .9) * .01); // breathing
    // "under the skin": the body dissolves into white light and surfaces again
    const r = (Math.sin(t * .75) + 1) / 2, reveal = window.__torso.lock ?? (.15 + .85 * r * r * (3 - 2 * r));
    skin.emissiveIntensity = (1 - reveal) * .7;
    // flowing, glitching type printed into the skin
    tex.offset.y -= dt * .035;
    tex.offset.x = (t % 2.6) < .22 ? Math.sin(t * 60) * .02 : 0;
    composer.render();
    // grain + dark hair / chin shadow from the top
    const gw = grainCanvas.width, gh = grainCanvas.height, img = gctx.createImageData(gw, gh);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 24; }
    gctx.putImageData(img, 0, 0);
    const hb = .82 + .18 * Math.sin(t * .9), hy = gh * (.02 + .04 * Math.sin(t * .5));
    const blob = (cx, cy, rx, ry, a) => {
      const gr = gctx.createRadialGradient(cx, cy, 0, cx, cy, 1);
      gr.addColorStop(0, `rgba(8,14,10,${a})`); gr.addColorStop(.45, `rgba(8,14,10,${a * .7})`); gr.addColorStop(1, 'rgba(8,14,10,0)');
      gctx.save(); gctx.translate(cx, cy); gctx.scale(rx, ry); gctx.translate(-cx, -cy);
      gctx.fillStyle = gr; gctx.beginPath(); gctx.arc(cx, cy, 1, 0, Math.PI * 2); gctx.fill(); gctx.restore();
    };
    blob(gw * .5, hy - gh * .02, gw * .5, gh * .2, .95 * hb);
    blob(gw * .14, hy, gw * .22, gh * .16, .8 * hb);
    blob(gw * .86, hy, gw * .22, gh * .16, .8 * hb);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const ro = new ResizeObserver(size); ro.observe(canvas);
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); skin.dispose(); armMat.dispose(); tex.dispose(); env.dispose(); pmrem.dispose(); torso.geometry.dispose(); composer.dispose?.(); renderer.dispose(); renderer.forceContextLoss?.(); };
}
