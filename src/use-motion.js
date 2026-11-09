import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export function useSmoothScroll() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Preserve the browser's wheel/touch speed. Lenis only animates explicit anchor navigation.
      const lenis = new Lenis({ autoRaf: false, lerp: .105, smoothWheel: false, syncTouch: false, anchors: true });
      const tick = seconds => lenis.raf(seconds * 1000);
      const sync = () => ScrollTrigger.update();
      lenis.on('scroll', sync);
      gsap.ticker.add(tick);
      document.documentElement.dataset.scrollMode = 'native';
      return () => {
        gsap.ticker.remove(tick); lenis.off('scroll', sync); lenis.destroy();
        delete document.documentElement.dataset.scrollMode;
      };
    });
    return () => media.revert();
  }, []);
}
