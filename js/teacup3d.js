// Tea guide hero: today's tea as a slowly turning 3D cup, floating in soft pearl light with wisps of steam.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL_URL = 'models/teacup.glb';
const cached = {}; // each model is parsed once, reused every time its card opens

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

// Also shows today's dish (a soup bowl) on the Eat tile: pass model, elev (camera height) and preserve (for a poster capture).
export function mountTeaCup(canvas, { onReady, onFail, model = MODEL_URL, elev: e0 = 0.62, fit = 1.45, preserve = false } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: preserve });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
  camera.position.set(0, 1.15, 3.1); camera.lookAt(0, 0.18, 0);

  // soft white key, blush and willow rims, like morning light through a window
  scene.add(new THREE.HemisphereLight(0xfff6f8, 0xc9d1b0, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(1.6, 2.6, 2.2); scene.add(key);
  const rimA = new THREE.PointLight(0xe6b1c4, 8, 8, 1.6); rimA.position.set(-1.8, 1, -1.4); scene.add(rimA);
  const rimB = new THREE.PointLight(0xc9d6a0, 6, 8, 1.6); rimB.position.set(1.8, 0.4, -1.2); scene.add(rimB);

  const cup = new THREE.Group(); scene.add(cup);
  // soft contact shadow under the cup
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const g = sc.getContext('2d'), rg = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  rg.addColorStop(0, 'rgba(48,64,35,.34)'); rg.addColorStop(1, 'rgba(48,64,35,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.02; scene.add(shadow);

  // steam: a few soft white wisps that rise and fade above the cup
  const wisp = document.createElement('canvas'); wisp.width = wisp.height = 64;
  const wg = wisp.getContext('2d'), wr = wg.createRadialGradient(32, 32, 2, 32, 32, 30);
  wr.addColorStop(0, 'rgba(255,255,255,.9)'); wr.addColorStop(1, 'rgba(255,255,255,0)'); wg.fillStyle = wr; wg.fillRect(0, 0, 64, 64);
  const wispTex = new THREE.CanvasTexture(wisp);
  const steam = Array.from({ length: reduce ? 0 : 7 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wispTex, transparent: true, opacity: 0, depthWrite: false }));
    s.userData = { o: i / 7, x: (Math.random() - .5) * .18 }; scene.add(s); return s;
  });
  let top = 0.5;

  let alive = true, raf = 0, ready = false, visible = true;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  (cached[model] ? Promise.resolve(cached[model]) : new Promise((res, rej) => loader.load(model, gl => { cached[model] = gl; res(gl); }, undefined, rej)))
    .then(gl => {
      if (!alive) return;
      const m = gl.scene.clone(true);
      const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const s = fit / Math.max(size.x, size.z);
      m.scale.setScalar(s); m.position.set(-c.x * s, -box.min.y * s, -c.z * s);
      cup.add(m); top = size.y * s;
      ready = true; onReady && onReady();
    })
    .catch(() => { if (alive) onFail && onFail(); });

  function resize() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  // pause while the hero is scrolled away or the app is hidden
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);

  // drag sideways to turn the cup, up and down to look over the rim into the drink
  let drag = null, dragY = 0, spin = 0, vel = 0, elev = e0, elevT = e0; // a little from above, so the tea shows
  const down = e => { drag = e.clientX; dragY = e.clientY; canvas.setPointerCapture?.(e.pointerId); };
  const move = e => {
    if (drag == null) return; const d = (e.clientX - drag) * 0.012; drag = e.clientX; spin += d; vel = d;
    elevT = Math.max(0.02, Math.min(1.15, elevT + (e.clientY - dragY) * 0.008)); dragY = e.clientY;
  };
  const up = () => { drag = null; };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  const clock = new THREE.Clock();
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    if (drag == null) { vel *= 0.94; spin += vel + (reduce ? 0 : dt * 0.32); }
    cup.rotation.y = spin;
    elev += (elevT - elev) * 0.15;
    const look = top * 0.45, R = 3.25;
    camera.position.set(0, look + Math.sin(elev) * R, Math.cos(elev) * R); camera.lookAt(0, look, 0);
    const bob = reduce ? 0 : Math.sin(t * 1.1) * 0.025;
    cup.position.y = 0.04 + bob;
    shadow.material.opacity = 0.9 - bob * 6; shadow.scale.setScalar(1 - bob * 2);
    steam.forEach(s => {
      const k = (t * 0.16 + s.userData.o) % 1;
      s.position.set(s.userData.x + Math.sin(t * .8 + s.userData.o * 9) * .07 * k, cup.position.y + top * 0.92 + k * 0.7, 0);
      s.scale.setScalar(0.18 + k * 0.42);
      s.material.opacity = ready ? Math.sin(k * Math.PI) * 0.5 : 0;
    });
    renderer.render(scene, camera);
  }
  frame();

  return function destroy() {
    alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
    scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose?.(); m.dispose(); }); });
    pmrem.dispose(); renderer.dispose();
  };
}
