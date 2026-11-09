import { gsap } from 'gsap';

export const MARK_WIDTH = 3.08;
export const MARK_HEIGHT = 4.44;
export const CAMERA_FOV = 31;

// One pose drives both the original image and WebGL. Loading the renderer never starts a second animation.
export function createEmblemMotion(host, image, { enabled = true } = {}) {
  const pose = { x: 0, y: 0, z: 0, lift: 0, shift: 0 };
  const layout = { width: 1, height: 1, markHeight: 1, perspective: 1, cameraZ: 1 };
  const pointer = { x: 0, y: 0 };
  const listeners = new Set();
  let scroll = window.scrollY, scrollEnd = 1, lastTime = 0, dirty = true;
  const clamp = value => Math.max(0, Math.min(1, value));

  function target() {
    const p = enabled ? clamp(scroll / scrollEnd) : 0;
    return { x: p * .10 + pointer.y * .045, y: -p * .50 + pointer.x * .12, z: -p * .028, lift: p * .11, shift: p * .30 };
  }
  function paintFallback() {
    const pixels = layout.markHeight / MARK_HEIGHT;
    image.style.transform = 'translate(-50%,-50%) translate(' + (pose.shift * pixels) + 'px,' + (-pose.lift * pixels) + 'px) perspective(' + layout.perspective + 'px) rotateX(' + (-pose.x) + 'rad) rotateY(' + pose.y + 'rad) rotateZ(' + (-pose.z) + 'rad)';
  }
  function measure() {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    layout.width = rect.width; layout.height = rect.height;
    layout.markHeight = Math.min(rect.height * .74, rect.width * .72 * MARK_HEIGHT / MARK_WIDTH);
    layout.perspective = rect.height / (2 * Math.tan(CAMERA_FOV * Math.PI / 360));
    layout.cameraZ = layout.perspective * MARK_HEIGHT / layout.markHeight;
    scrollEnd = Math.max(1, rect.top + window.scrollY + rect.height - window.innerHeight * .15);
    image.style.height = layout.markHeight + 'px';
    paintFallback(); dirty = true;
    listeners.forEach(listener => listener(layout));
  }
  function tick(time) {
    const dt = Math.min(Math.max(time - lastTime, 1 / 120), .05); lastTime = time;
    const next = target();
    let changed = dirty;
    for (const key of ['x', 'y', 'z', 'lift', 'shift']) {
      const value = pose[key] + (next[key] - pose[key]) * (1 - Math.exp(-11 * dt));
      if (Math.abs(value - pose[key]) > .00001) changed = true;
      pose[key] = value;
    }
    if (changed) { paintFallback(); dirty = false; }
  }
  const onScroll = () => { scroll = window.scrollY; };
  function move(event) {
    if (event.pointerType !== 'mouse') return;
    const rect = host.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  }
  const reset = () => { pointer.x = 0; pointer.y = 0; };
  measure(); Object.assign(pose, target()); paintFallback();
  const observer = new ResizeObserver(measure); observer.observe(host);
  window.addEventListener('resize', measure, { passive: true });
  if (enabled) {
    window.addEventListener('scroll', onScroll, { passive: true });
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', reset);
    gsap.ticker.add(tick);
  }
  return {
    pose, layout,
    onResize(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    destroy() {
      gsap.ticker.remove(tick); observer.disconnect(); listeners.clear();
      window.removeEventListener('resize', measure); window.removeEventListener('scroll', onScroll);
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', reset);
    },
  };
}
