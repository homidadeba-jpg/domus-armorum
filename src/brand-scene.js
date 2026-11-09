import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

// Use the actual image as the face, including its original positive/negative spaces.
// Only the outside silhouette is extracted, so the mark is never redrawn or inverted.
async function originalMark() {
  const image = new Image();
  image.src = '/brand/domus-original.webp';
  await image.decode();
  const width = image.naturalWidth, height = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const mask = document.createElement('canvas');
  mask.width = width; mask.height = height;
  const maskContext = mask.getContext('2d');
  maskContext.fillStyle = '#000'; maskContext.fillRect(0, 0, width, height);
  maskContext.fillStyle = '#fff';
  const left = [], right = [];
  for (let y = 0; y < height; y++) {
    let low = width, high = -1;
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4] < 110) { low = Math.min(low, x); high = x; }
    }
    if (high < low) continue;
    maskContext.fillRect(low, y, high - low + 1, 1);
    if (y % 3 === 0 || y === height - 1) {
      left.push(new THREE.Vector2((low / (width - 1) - .5) * 3.08, (.5 - y / (height - 1)) * 4.44));
      right.push(new THREE.Vector2((high / (width - 1) - .5) * 3.08, (.5 - y / (height - 1)) * 4.44));
    }
  }
  const shape = new THREE.Shape([...left, ...right.reverse()]);
  const mapTexture = new THREE.Texture(image);
  mapTexture.colorSpace = THREE.SRGBColorSpace;
  mapTexture.needsUpdate = true;
  const maskTexture = new THREE.CanvasTexture(mask);
  return { shape, mapTexture, maskTexture };
}

export async function createBrandScene(container, { light = false, onReady, onUnavailable } = {}) {
  const mark = await originalMark();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) { mark.mapTexture.dispose(); mark.maskTexture.dispose(); throw error; }
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
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x171c16, metalness: .72, roughness: .38, envMapIntensity: .4 });
  const backGeometry = new THREE.ExtrudeGeometry(mark.shape, { depth: .15, bevelEnabled: true, bevelThickness: .012, bevelSize: .008, bevelSegments: 3, steps: 1 });
  const back = new THREE.Mesh(backGeometry, darkMetal);
  back.position.z = -.16;
  assembly.add(back);
  mark.mapTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  mark.maskTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const faceMaterial = new THREE.MeshStandardMaterial({
    map: mark.mapTexture, alphaMap: mark.maskTexture,
    color: 0xe0dfd7, metalness: .48, roughness: .4, envMapIntensity: .55,
    bumpMap: mark.mapTexture, bumpScale: .026,
    transparent: true, alphaTest: .45,
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.08, 4.44), faceMaterial);
  face.position.z = .012;
  assembly.add(face);
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
    darkMetal.color.set(isLight ? 0x30372a : 0x171c16);
    faceMaterial.envMapIntensity = isLight ? .7 : .55;
  }
  function draw(time) {
    if (!active || !contextAvailable || document.hidden || disposed || time - last < 1 / 45) return;
    const dt = Math.min(time - last || .016, .05); last = time;
    const bounds = container.closest('.hero').getBoundingClientRect();
    state.scroll = THREE.MathUtils.clamp(-bounds.top / bounds.height, 0, 1);
    const goalX = -.025 + pointer.y * .055 + state.scroll * .07;
    const goalY = -.11 + pointer.x * .12 + (1 - state.reveal) * -.32 + state.scroll * .11;
    assembly.rotation.x = THREE.MathUtils.damp(assembly.rotation.x, goalX, 5, dt);
    assembly.rotation.y = THREE.MathUtils.damp(assembly.rotation.y, goalY, 5, dt);
    assembly.rotation.z = -.025 + state.scroll * .035;
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
      mark.mapTexture.dispose(); mark.maskTexture.dispose();
      renderer.dispose(); renderer.domElement.remove();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    },
  };
}
