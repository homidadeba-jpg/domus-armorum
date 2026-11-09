import * as THREE from 'three';
import { gsap } from 'gsap';
import { CAMERA_FOV, MARK_HEIGHT, MARK_WIDTH } from './emblem-motion.js';

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

export async function createBrandScene(container, { light = false, motion, onReady, onUnavailable } = {}) {
  const mark = await originalMark();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
  } catch (error) { mark.mapTexture.dispose(); mark.maskTexture.dispose(); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
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
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, .1, 50);
  camera.position.set(0, 0, motion.layout.cameraZ + .012);
  const assembly = new THREE.Group();
  scene.add(assembly);
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x171c16, metalness: .72, roughness: .38, envMapIntensity: .4 });
  const backGeometry = new THREE.ExtrudeGeometry(mark.shape, { depth: .15, bevelEnabled: true, bevelThickness: .012, bevelSize: .008, bevelSegments: 3, steps: 1 });
  const back = new THREE.Mesh(backGeometry, darkMetal);
  back.position.z = -.16;
  assembly.add(back);
  mark.mapTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  mark.maskTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const faceMaterial = new THREE.MeshBasicMaterial({
    map: mark.mapTexture, alphaMap: mark.maskTexture,
    color: 0xffffff, toneMapped: false,
    transparent: true, alphaTest: .45,
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(MARK_WIDTH, MARK_HEIGHT), faceMaterial);
  face.position.z = .012;
  assembly.add(face);
  const key = new THREE.DirectionalLight(0xffe3b6, 2.3);
  key.position.set(-4, 4, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d9e6, 1.1);
  fill.position.set(5, 1, 3); scene.add(fill);
  const lightStrip = new THREE.PointLight(0xe7c68b, 10, 18, 2);
  lightStrip.position.set(-3, .5, 4); scene.add(lightStrip);

  let active = true, disposed = false, first = true, lastWidth = 0, lastHeight = 0;
  function resize() {
    if (disposed) return;
    const { width, height, cameraZ } = motion.layout;
    if (Math.abs(width - lastWidth) < .5 && Math.abs(height - lastHeight) < .5) return;
    lastWidth = width; lastHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = cameraZ + .012;
    camera.updateProjectionMatrix();
  }
  function setTheme(isLight) {
    darkMetal.color.set(isLight ? 0x30372a : 0x171c16);
  }
  function draw() {
    if (!active || !contextAvailable || document.hidden || disposed) return;
    const pose = motion.pose;
    assembly.rotation.set(pose.x, pose.y, pose.z);
    assembly.position.set(0, 0, pose.depth);
    lightStrip.position.set(-1, .5 - pose.x * 5, 4);
    renderer.render(scene, camera);
    if (first) { first = false; onReady?.(); }
  }
  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { rootMargin: '80px' });
  observer.observe(container);
  const unsubscribeResize = motion.onResize(resize);
  setTheme(light); resize();
  // The renderer joins the already-running entrance; it never restarts it or shifts the mark.
  await renderer.compileAsync(scene, camera);
  gsap.ticker.add(draw);
  return {
    setTheme,
    destroy() {
      disposed = true; gsap.ticker.remove(draw); observer.disconnect(); unsubscribeResize();
      const materials = new Set(), geometries = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      mark.mapTexture.dispose(); mark.maskTexture.dispose();
      renderer.dispose(); renderer.domElement.remove();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    },
  };
}
