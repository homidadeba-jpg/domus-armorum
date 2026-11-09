import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

function shieldShape(scale = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, 2.36);
  s.bezierCurveTo(-.35, 2.32, -.46, 2.01, -1.45, 1.70);
  s.bezierCurveTo(-1.61, 1.64, -1.64, 1.52, -1.64, 1.28);
  s.lineTo(-1.64, -1.26);
  s.bezierCurveTo(-1.62, -1.60, -.58, -2.14, 0, -2.40);
  s.bezierCurveTo(.58, -2.14, 1.62, -1.60, 1.64, -1.26);
  s.lineTo(1.64, 1.28);
  s.bezierCurveTo(1.64, 1.52, 1.61, 1.64, 1.45, 1.70);
  s.bezierCurveTo(.46, 2.01, .35, 2.32, 0, 2.36);
  if (scale !== 1) {
    const points = s.getPoints(64).map(p => p.multiplyScalar(scale));
    return new THREE.Shape(points);
  }
  return s;
}

// The relief is sampled from the original supplied mark, not a replacement drawing.
async function originalRelief() {
  const img = new Image();
  img.src = '/brand/domus-transparente-de24c017.webp';
  await img.decode();
  const width = 320, height = 461;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const geometry = new THREE.PlaneGeometry(3.08, 4.44, width - 1, height - 1);
  const position = geometry.attributes.position;
  const indices = [], opacity = new Float32Array(width * height);
  for (let i = 0; i < position.count; i++) {
    const a = pixels[i * 4 + 3] / 255;
    opacity[i] = a;
    position.setZ(i, .10 + THREE.MathUtils.smoothstep(a, 0, .85) * .105);
  }
  for (let y = 0; y < height - 1; y++) for (let x = 0; x < width - 1; x++) {
    const a = y * width + x, b = a + 1, c = a + width, d = c + 1;
    if (Math.min(opacity[a], opacity[b], opacity[c]) > .18) indices.push(a, c, b);
    if (Math.min(opacity[b], opacity[c], opacity[d]) > .18) indices.push(b, c, d);
  }
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export async function createBrandScene(container, { light = false, onReady, onUnavailable } = {}) {
  const reliefGeometry = await originalRelief();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) { reliefGeometry.dispose(); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.35 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .90;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);
  let contextAvailable = true;
  const contextLost = event => { event.preventDefault(); contextAvailable = false; active = false; onUnavailable?.(); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 50);
  camera.position.set(.05, .12, 12.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, .04);
  scene.environment = env.texture;
  room.dispose(); pmrem.dispose();
  const assembly = new THREE.Group();
  scene.add(assembly);
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x252a23, metalness: .88, roughness: .38, envMapIntensity: .36 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xbda478, metalness: .93, roughness: .29, envMapIntensity: .8 });
  const face = new THREE.MeshStandardMaterial({ color: 0x252b22, metalness: .72, roughness: .55, envMapIntensity: .26 });
  const reliefMaterial = new THREE.MeshStandardMaterial({ color: 0xb4ac91, metalness: .91, roughness: .36, envMapIntensity: .85 });
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(), { depth: .16, bevelEnabled: true, bevelThickness: .055, bevelSize: .035, bevelSegments: 3, steps: 1, curveSegments: 24 }), darkMetal);
  back.position.z = -.30;
  assembly.add(back);
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(.974), { depth: .035, bevelEnabled: true, bevelThickness: .02, bevelSize: .015, bevelSegments: 2, curveSegments: 24 }), brass);
  rim.position.z = -.09;
  assembly.add(rim);
  const inset = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape(.96), { depth: .07, bevelEnabled: true, bevelThickness: .018, bevelSize: .012, bevelSegments: 2, curveSegments: 24 }), face);
  inset.position.z = -.055;
  assembly.add(inset);
  const relief = new THREE.Mesh(reliefGeometry, reliefMaterial);
  assembly.add(relief);

  // Machined contour lines echo the shield instead of surrounding the mark with generic particles.
  const contourMaterial = new THREE.LineBasicMaterial({ color: 0x8f997e, transparent: true, opacity: .18 });
  for (const scale of [1.17, 1.30, 1.43]) {
    const points = shieldShape(scale).getPoints(90).map(p => new THREE.Vector3(p.x, p.y, -.72 - scale * .05));
    assembly.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), contourMaterial));
  }
  const key = new THREE.DirectionalLight(0xffe3b6, 2.3);
  key.position.set(-4, 4, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d9e6, 1.1);
  fill.position.set(5, 1, 3); scene.add(fill);
  const lightStrip = new THREE.PointLight(0xe7c68b, 10, 18, 2);
  lightStrip.position.set(-3, .5, 4); scene.add(lightStrip);

  const state = { reveal: 0, scroll: 0 }, pointer = { x: 0, y: 0 };
  let active = true, disposed = false, first = true, last = 0;
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < .75 ? 13.5 : 11.9;
    camera.updateProjectionMatrix();
  }
  function setTheme(isLight) {
    darkMetal.color.set(isLight ? 0x5d6558 : 0x252a23);
    face.color.set(isLight ? 0x525b45 : 0x252b22);
    contourMaterial.opacity = isLight ? .23 : .18;
  }
  function draw(time) {
    if (!active || !contextAvailable || document.hidden || disposed || time - last < 1 / 45) return;
    const dt = Math.min(time - last || .016, .05); last = time;
    const bounds = container.closest('.hero').getBoundingClientRect();
    state.scroll = THREE.MathUtils.clamp(-bounds.top / bounds.height, 0, 1);
    const goalX = -.045 + pointer.y * .07 + state.scroll * .10;
    const goalY = -.20 + pointer.x * .14 + (1 - state.reveal) * -.48 + state.scroll * .16;
    assembly.rotation.x = THREE.MathUtils.damp(assembly.rotation.x, goalX, 5, dt);
    assembly.rotation.y = THREE.MathUtils.damp(assembly.rotation.y, goalY, 5, dt);
    assembly.rotation.z = -.055 + state.scroll * .06;
    assembly.position.y = (1 - state.reveal) * -.18 + state.scroll * .25;
    assembly.scale.setScalar(.94 + state.reveal * .06);
    lightStrip.position.x = -3 + state.reveal * 4.5 + pointer.x;
    renderer.render(scene, camera);
    if (first) { first = false; onReady?.(); }
  }
  function move(event) {
    const r = container.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp((event.clientX - r.left) / r.width * 2 - 1, -1, 1);
    pointer.y = THREE.MathUtils.clamp((event.clientY - r.top) / r.height * 2 - 1, -1, 1);
  }
  const reset = () => { pointer.x = 0; pointer.y = 0; };
  container.addEventListener('pointermove', move);
  container.addEventListener('pointerleave', reset);
  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { rootMargin: '80px' });
  observer.observe(container);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  setTheme(light); resize();
  const intro = gsap.to(state, { reveal: 1, duration: 2.3, ease: 'power2.out' });
  gsap.ticker.add(draw);
  return {
    setTheme,
    destroy() {
      disposed = true; gsap.ticker.remove(draw); intro.kill(); observer.disconnect(); resizeObserver.disconnect();
      container.removeEventListener('pointermove', move); container.removeEventListener('pointerleave', reset);
      const materials = new Set(), geometries = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); env.dispose();
      renderer.dispose(); renderer.domElement.remove();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    },
  };
}
