// Full-screen welcome: the Under the Skin 3D model floating in a dark green void. The camera arrives through a
// warp tunnel of light ("entering a new world"), particles lift off the skin, and on start the camera flies
// through the body into the app.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const MODEL_URL = 'models/body.glb';
let cached = null; // the parsed model is reused if the welcome screen is shown again
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function mountWelcome3D(canvas, { onReady } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x050605, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050605, 0.055);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  const CAM_END = new THREE.Vector3(0, -0.25, 5.4), CAM_START = new THREE.Vector3(0, 0.6, 26);
  camera.position.copy(reduce ? CAM_END : CAM_START);

  // light: soft white key, deep-green and lime rims from behind
  scene.add(new THREE.HemisphereLight(0xdfe8da, 0x07140c, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1.5, 2.5, 4); scene.add(key);
  const rimA = new THREE.PointLight(0x4fae74, 40, 12, 1.6); rimA.position.set(-2.2, 1.2, -2); scene.add(rimA);
  const rimB = new THREE.PointLight(0xd4ef9a, 26, 12, 1.6); rimB.position.set(2.3, -0.4, -1.6); scene.add(rimB);

  const world = new THREE.Group(); scene.add(world);
  const body = new THREE.Group(); world.add(body);

  // ---- warp tunnel: streaks of light rushing past the camera ----
  const N = 1400, seg = new Float32Array(N * 6), speed = new Float32Array(N), col = new Float32Array(N * 6);
  const palette = [new THREE.Color(0xd4ef9a), new THREE.Color(0x9fcf8c), new THREE.Color(0xffffff), new THREE.Color(0x4fae74)];
  const spawn = (i, z) => {
    const a = Math.random() * Math.PI * 2, r = 1.6 + Math.pow(Math.random(), 0.6) * 9;
    const x = Math.cos(a) * r, y = Math.sin(a) * r * 1.3;
    seg[i * 6] = seg[i * 6 + 3] = x; seg[i * 6 + 1] = seg[i * 6 + 4] = y;
    seg[i * 6 + 2] = z; seg[i * 6 + 5] = z;
    speed[i] = 0.6 + Math.random() * 1.4;
    const c = palette[(Math.random() * palette.length) | 0], dim = 0.35 + Math.random() * 0.65;
    col[i * 6] = c.r * dim; col[i * 6 + 1] = c.g * dim; col[i * 6 + 2] = c.b * dim;
    col[i * 6 + 3] = col[i * 6 + 4] = col[i * 6 + 5] = 0;
  };
  for (let i = 0; i < N; i++) spawn(i, -60 + Math.random() * 90);
  const warpGeo = new THREE.BufferGeometry();
  warpGeo.setAttribute('position', new THREE.BufferAttribute(seg, 3));
  warpGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const warp = new THREE.LineSegments(warpGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  scene.add(warp);

  // ---- faint dust that stays around her once we have arrived ----
  const DN = 700, dpos = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { dpos[i * 3] = (Math.random() - .5) * 14; dpos[i * 3 + 1] = (Math.random() - .5) * 12; dpos[i * 3 + 2] = (Math.random() - .5) * 14 - 2; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x9fcf8c, size: 0.025, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(dust);

  // ---- the model, plus a holographic shell and particles that lift off the skin ----
  let shell = null, motes = null, moteBase = null, moteSeed = null, ready = false, tReady = 0;
  const shellMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmt: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vY = position.y; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime; uniform float uAmt; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.4);
        float scan = smoothstep(.0,.04, abs(fract(vY*1.1 - uTime*.12) - .5) - .44);
        vec3 c = mix(vec3(.31,.68,.45), vec3(.83,.94,.6), f);
        gl_FragColor = vec4(c, (f*.85 + scan*.35) * uAmt); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

  function place(gltf) {
    const root = gltf.scene;
    const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const s = 2.3 / size.y;
    root.scale.setScalar(s); root.position.set(-ctr.x * s, -ctr.y * s, -ctr.z * s);
    body.add(root);
    let mesh = null;
    root.traverse(o => { if (o.isMesh) { mesh = o; o.material.envMapIntensity = 0.6; } });
    if (!mesh) return;
    shell = new THREE.Mesh(mesh.geometry, shellMat);
    shell.position.copy(mesh.position); shell.quaternion.copy(mesh.quaternion); shell.scale.copy(mesh.scale).multiplyScalar(1.006);
    mesh.parent.add(shell);
    // sample surface points for the motes
    const pos = mesh.geometry.attributes.position, nrm = mesh.geometry.attributes.normal, MN = 1600;
    moteBase = new Float32Array(MN * 6); moteSeed = new Float32Array(MN);
    const mp = new Float32Array(MN * 3);
    for (let i = 0; i < MN; i++) {
      const j = (Math.random() * pos.count) | 0;
      moteBase[i * 6] = pos.getX(j); moteBase[i * 6 + 1] = pos.getY(j); moteBase[i * 6 + 2] = pos.getZ(j);
      moteBase[i * 6 + 3] = nrm ? nrm.getX(j) : 0; moteBase[i * 6 + 4] = nrm ? nrm.getY(j) : 1; moteBase[i * 6 + 5] = nrm ? nrm.getZ(j) : 0;
      moteSeed[i] = Math.random();
    }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xd4ef9a, size: 0.012 / s, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    motes.position.copy(mesh.position); motes.quaternion.copy(mesh.quaternion); motes.scale.copy(mesh.scale);
    mesh.parent.add(motes);
    body.scale.setScalar(0.001);
    ready = true; tReady = clock.getElapsedTime();
    onReady && onReady();
  }
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  (cached ? Promise.resolve(cached) : new Promise((res, rej) => loader.load(MODEL_URL, g => { cached = g; res(g); }, undefined, rej)))
    .then(g => { if (alive) place({ scene: g.scene.clone(true) }); })
    .catch(() => { canvas.dispatchEvent(new CustomEvent('welcome-fail')); });

  // ---- post ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.5, 0.42);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h;
    // keep the body the same size on wide screens
    camera.fov = w / h > 0.75 ? 26 : 32;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  // parallax from pointer / tilt
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = e => { const r = canvas.getBoundingClientRect(); look.tx = ((e.clientX - r.left) / r.width - .5) * 2; look.ty = ((e.clientY - r.top) / r.height - .5) * 2; };
  const onTilt = e => { if (e.gamma == null) return; look.tx = Math.max(-1, Math.min(1, e.gamma / 30)); look.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); };
  window.addEventListener('pointermove', onMove); window.addEventListener('deviceorientation', onTilt);

  const clock = new THREE.Clock();
  let alive = true, raf = 0, entering = null, lastT = 0, warpBoost = reduce ? 0 : 1;
  const ARRIVE = 3.4; // seconds the intro flight takes

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime(), dt = Math.min(0.05, Math.max(0.001, t - lastT)); lastT = t;
    const k = reduce ? 1 : ease(t / ARRIVE);

    // camera flight
    let camZ = THREE.MathUtils.lerp(CAM_START.z, CAM_END.z, k), camY = THREE.MathUtils.lerp(CAM_START.y, CAM_END.y, k);
    let warpSpeed = (1 - k) * 60 * warpBoost + 1.2;
    if (entering) {
      const e = Math.min(1, (t - entering.t0) / entering.dur), ee = e * e * e;
      camZ = CAM_END.z - ee * (CAM_END.z + 0.2); camY = CAM_END.y + ee * 0.25;
      warpSpeed = 1.2 + ee * 90;
      bloom.strength = 0.55 + ee * 2.8; bloom.threshold = 0.42 * (1 - ee);
      if (e >= 1 && !entering.done) { entering.done = true; entering.resolve(); }
    }
    look.x += (look.tx - look.x) * 0.04; look.y += (look.ty - look.y) * 0.04;
    camera.position.set(look.x * 0.35, camY - look.y * 0.2, camZ);
    camera.lookAt(0, camY * 0.3, 0);

    // warp streaks: length grows with speed
    const L = Math.min(9, warpSpeed * 0.09) + 0.05, p = warpGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      let z = p[i * 6 + 2] + speed[i] * warpSpeed * dt;
      if (z > camera.position.z + 2) { spawn(i, camera.position.z - 50 - Math.random() * 20); z = p[i * 6 + 2]; }
      p[i * 6 + 2] = z; p[i * 6 + 5] = z - L * speed[i];
    }
    warpGeo.attributes.position.needsUpdate = true;
    warp.material.opacity = entering ? 1 : 0.25 + 0.75 * (1 - k);

    // body grows in as we arrive, then breathes and turns slowly
    if (ready) {
      const g = reduce ? 1 : ease((t - tReady) / 2.2);
      const breathe = 1 + Math.sin(t * 0.9) * 0.006;
      body.scale.setScalar(Math.max(0.001, g) * breathe);
      body.rotation.y = Math.sin(t * 0.18) * 0.5 + (1 - g) * -1.2;
      body.position.y = Math.sin(t * 0.6) * 0.04;
      shellMat.uniforms.uTime.value = t; shellMat.uniforms.uAmt.value = 0.12 + 0.8 * (1 - g) + 0.08 * Math.sin(t * 1.3);
      if (motes) {
        const mp = motes.geometry.attributes.position.array, n = moteSeed.length;
        for (let i = 0; i < n; i++) {
          const life = (t * 0.12 + moteSeed[i]) % 1, d = life * life * 0.12; // drifts out & up, then is reborn on the skin
          mp[i * 3] = moteBase[i * 6] + moteBase[i * 6 + 3] * d;
          mp[i * 3 + 1] = moteBase[i * 6 + 1] + moteBase[i * 6 + 4] * d + life * 0.08;
          mp[i * 3 + 2] = moteBase[i * 6 + 2] + moteBase[i * 6 + 5] * d;
        }
        motes.geometry.attributes.position.needsUpdate = true;
        motes.material.opacity = 0.75 * g;
      }
    }
    dust.material.opacity = 0.55 * k;
    dust.rotation.y = t * 0.02;
    rimA.position.x = -2.2 + Math.sin(t * 0.4) * 0.6; rimB.position.y = -0.4 + Math.cos(t * 0.35) * 0.5;
    composer.render();
  }
  frame();

  return {
    // fly through the body; resolves when the screen is fully bright
    enter(dur = 1.15) {
      if (reduce) return Promise.resolve();
      return new Promise(resolve => { entering = { t0: clock.getElapsedTime(), dur, resolve, done: false }; });
    },
    destroy() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('deviceorientation', onTilt);
      warpGeo.dispose(); dustGeo.dispose(); shellMat.dispose(); composer.dispose?.(); pmrem.dispose(); renderer.dispose();
    },
  };
}
