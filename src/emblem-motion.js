import { gsap } from 'gsap';

export const MARK_WIDTH = 3.08;
export const MARK_HEIGHT = 4.44;
export const CAMERA_FOV = 31;

// The entrance and scroll use one pose for the poster and WebGL, without replaying on renderer load.
export function createEmblemMotion(host, poster, { enabled = true, entrance = true } = {}) {
  const pose = { x: 0, y: 0, z: 0, depth: 0 };
  const smooth = { x: 0, y: 0, z: 0, depth: 0 };
  const entry = { turn: 0 };
  const layout = { width: 1, height: 1, markHeight: 1, perspective: 1, cameraZ: 1 };
  const pointer = { x: 0, y: 0 };
  const listeners = new Set();
  let scroll = window.scrollY, scrollEnd = 1, lastTime = 0, dirty = true, entryTween;
  const boundary = host.parentElement;
  const clamp = value => Math.max(0, Math.min(1, value));

  function target() {
    const p = enabled ? clamp(scroll / scrollEnd) : 0;
    return { x: -p * .28 + pointer.y * .035, y: pointer.x * .09, z: 0, depth: -p * .75 };
  }
  function paintFallback() {
    const pixels = layout.markHeight / MARK_HEIGHT;
    poster.style.transform = 'translate(-50%,-50%) perspective(' + layout.perspective + 'px) translateZ(' + (pose.depth * pixels) + 'px) rotateX(' + (-pose.x) + 'rad) rotateY(' + pose.y + 'rad)';
  }
  function measure() {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    layout.width = rect.width; layout.height = rect.height;
    layout.markHeight = Math.min(rect.height * .74, rect.width * .72 * MARK_HEIGHT / MARK_WIDTH);
    layout.perspective = rect.height / (2 * Math.tan(CAMERA_FOV * Math.PI / 360));
    layout.cameraZ = layout.perspective * MARK_HEIGHT / layout.markHeight;
    scrollEnd = Math.max(1, rect.top + window.scrollY + rect.height - window.innerHeight * .15);
    poster.style.height = layout.markHeight + 'px';
    poster.style.width = layout.markHeight * MARK_WIDTH / MARK_HEIGHT + 'px';
    paintFallback(); dirty = true;
    listeners.forEach(listener => listener(layout));
  }
  function tick(time) {
    const dt = Math.min(Math.max(time - lastTime, 1 / 120), .05); lastTime = time;
    const next = target();
    let changed = dirty;
    for (const key of ['x', 'y', 'z', 'depth']) {
      const value = smooth[key] + (next[key] - smooth[key]) * (1 - Math.exp(-11 * dt));
      const composed = value + (key === 'y' ? entry.turn : 0);
      if (Math.abs(composed - pose[key]) > .00001) changed = true;
      smooth[key] = value; pose[key] = composed;
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
  measure(); Object.assign(smooth, target()); Object.assign(pose, smooth); paintFallback();
  boundary.dataset.emblemEntry = enabled ? 'complete' : 'reduced';
  if (enabled && entrance && scroll < 80) {
    entry.turn = -Math.PI * 2;
    pose.y = smooth.y + entry.turn; paintFallback();
    boundary.dataset.emblemEntry = 'playing';
    entryTween = gsap.to(entry, {
      turn: 0, duration: 2.25, ease: 'power2.inOut',
      onComplete: () => { boundary.dataset.emblemEntry = 'complete'; },
    });
  }
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
      entryTween?.kill(); gsap.ticker.remove(tick); observer.disconnect(); listeners.clear();
      window.removeEventListener('resize', measure); window.removeEventListener('scroll', onScroll);
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', reset);
    },
  };
}
