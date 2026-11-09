import { useEffect, useRef, useState } from 'react';
import outline from './data/brand-outline.json';
import { createEmblemMotion } from './emblem-motion.js';

export function BrandScene({ light, alt }) {
  const host = useRef(null), fallback = useRef(null), controller = useRef(null), motion = useRef(null), currentLight = useRef(light);
  const [status, setStatus] = useState('loading');
  useEffect(() => { currentLight.current = light; controller.current?.setTheme(light); }, [light]);
  useEffect(() => {
    let cancelled = false, generation = 0;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    async function start() {
      const version = ++generation;
      controller.current?.destroy(); controller.current = null;
      motion.current?.destroy();
      motion.current = createEmblemMotion(host.current, fallback.current, { enabled: !preference.matches });
      if (preference.matches) { setStatus('reduced'); return; }
      setStatus('loading');
      try {
        const { createBrandScene } = await import('./brand-scene.js');
        if (cancelled || version !== generation || preference.matches) return;
        const scene = await createBrandScene(host.current, {
          light: currentLight.current,
          motion: motion.current,
          onReady: () => { if (!cancelled && version === generation) setStatus('ready'); },
          onUnavailable: () => { if (!cancelled && version === generation) setStatus('fallback'); },
        });
        if (cancelled || version !== generation || preference.matches) scene.destroy();
        else { scene.setTheme(currentLight.current); controller.current = scene; }
      } catch { if (!cancelled && version === generation) setStatus('fallback'); }
    }
    start(); preference.addEventListener('change', start);
    return () => { cancelled = true; preference.removeEventListener('change', start); controller.current?.destroy(); motion.current?.destroy(); };
  }, []);
  return <div className={`brand-scene is-${status}`} data-scene={status}>
    <div className="scene-orbit" aria-hidden="true" />
    <img ref={fallback} className="scene-fallback" src="/brand/domus-original.webp" style={{ clipPath: outline.clip }} width="683" height="984" alt={alt} fetchPriority="high" />
    <div className="scene-canvas" ref={host} aria-hidden="true" />
  </div>;
}
