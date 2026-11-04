// Today hero: her phase flower as a real 3D bloom, turning slowly inside the glass bubble.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const cache = {}; // url -> parsed model, reused when the page re-renders

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function mountFlower(canvas, url, { onReady, onFail, tilt = 0.32 } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 40);

  // soft morning light: white key from above, blush and moss rims
  scene.add(new THREE.HemisphereLight(0xfff6f8, 0xc9d1b0, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(1.2, 2.8, 2.2); scene.add(key);
  const rimA = new THREE.PointLight(0xe6b1c4, 6, 8, 1.6); rimA.position.set(-1.6, 0.8, -1.2); scene.add(rimA);
  const rimB = new THREE.PointLight(0xc9d6a0, 4, 8, 1.6); rimB.position.set(1.6, 0.2, -1.2); scene.add(rimB);

  const bloom = new THREE.Group(); scene.add(bloom);
  let alive = true, raf = 0, visible = true, ready = false, R = 3;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  (cache[url] ? Promise.resolve(cache[url]) : new Promise((res, rej) => loader.load(url, gl => { cache[url] = gl; res(gl); }, undefined, rej)))
    .then(gl => {
      if (!alive) return;
      const m = gl.scene.clone(true);
      const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const s = 1 / Math.max(size.x, size.y, size.z);
      m.scale.setScalar(s); m.position.set(-c.x * s, -c.y * s, -c.z * s);
      bloom.add(m); R = 2.25;
      ready = true; onReady && onReady();
    })
    .catch(() => { if (alive) onFail && onFail(); });

  function resize() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);

  const clock = new THREE.Clock();
  let spin = 0;
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden || !ready) return;
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    if (!reduce) spin += dt * 0.28;
    bloom.rotation.set(reduce ? 0 : Math.sin(t * 0.6) * 0.05, spin, reduce ? 0 : Math.sin(t * 0.45) * 0.04);
    bloom.position.y = reduce ? 0 : Math.sin(t * 0.9) * 0.025;
    camera.position.set(0, Math.sin(tilt) * R, Math.cos(tilt) * R); camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  frame();

  return function destroy() {
    alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose?.(); m.dispose(); }); });
    pmrem.dispose(); renderer.dispose();
  };
}
