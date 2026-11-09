import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ autoRaf: false, lerp: .105, smoothWheel: true, syncTouch: false, anchors: true });
      const tick = seconds => lenis.raf(seconds * 1000);
      const sync = () => ScrollTrigger.update();
      lenis.on('scroll', sync);
      gsap.ticker.add(tick);
      document.documentElement.dataset.smoothScroll = 'active';
      return () => {
        gsap.ticker.remove(tick); lenis.off('scroll', sync); lenis.destroy();
        delete document.documentElement.dataset.smoothScroll;
      };
    });
    return () => media.revert();
  }, []);
}
