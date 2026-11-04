// Moon page hero: the real Moon, lit by the Sun from the angle it has tonight, turning slowly in the dark.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL_URL = 'models/moon.glb';
let cached = null;

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

// elong: Moon's angle from the Sun in degrees (0 new, 90 first quarter, 180 full); waxing is lit on the right
export function mountMoon(canvas, { elong = 180, onReady, onFail } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 4.6); camera.lookAt(0, 0, 0);

  const e = elong * Math.PI / 180;
  const sun = new THREE.DirectionalLight(0xfff4ea, 3.4); sun.position.set(Math.sin(e) * 10, 0.6, -Math.cos(e) * 10); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xaebfe0, 0x2a2430, 0.32)); // faint earthshine, so the dark side is not a hole

  const moon = new THREE.Group(); scene.add(moon);
  let alive = true, raf = 0, visible = true;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  (cached ? Promise.resolve(cached) : new Promise((res, rej) => loader.load(MODEL_URL, gl => { cached = gl; res(gl); }, undefined, rej)))
    .then(gl => {
      if (!alive) return;
      const m = gl.scene.clone(true);
      m.traverse(o => { if (o.isMesh && o.material) { o.material = o.material.clone(); o.material.metalness = 0; o.material.roughness = 1; o.material.envMapIntensity = 0; } });
      const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const s = 1.34 / Math.max(size.x, size.y, size.z);
      m.scale.setScalar(s); m.position.set(-c.x * s, -c.y * s, -c.z * s);
      moon.add(m); onReady && onReady();
    })
    .catch(() => { if (alive) onFail && onFail(); });

  function resize() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(([x]) => { visible = x.isIntersecting; }); io.observe(canvas);

  // drag to turn the moon; the light stays where the Sun is
  let drag = null, spin = 0, vel = 0;
  const down = ev => { drag = ev.clientX; canvas.setPointerCapture?.(ev.pointerId); };
  const move = ev => { if (drag == null) return; const d = (ev.clientX - drag) * 0.01; drag = ev.clientX; spin += d; vel = d; };
  const up = () => { drag = null; };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  const clock = new THREE.Clock();
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    if (drag == null) { vel *= 0.94; spin += vel + (reduce ? 0 : dt * 0.08); }
    moon.rotation.set(reduce ? 0 : Math.sin(t * 0.3) * 0.04, spin, 0);
    moon.position.y = reduce ? 0 : Math.sin(t * 0.7) * 0.02;
    renderer.render(scene, camera);
  }
  frame();

  return function destroy() {
    alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
    scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose?.(); m.normalMap?.dispose?.(); m.dispose(); }); });
    renderer.dispose();
  };
}
