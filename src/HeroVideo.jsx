import { useEffect, useRef, useState } from 'react';
import './hero-video.css';

const MOBILE = { source: '/media/domus-intro-v2.mp4', start: '/media/domus-start-v2.webp', final: '/media/domus-final-v2.webp', width: 720, height: 1280 };
const DESKTOP = { source: '/media/domus-intro-desktop-v1.mp4', start: '/media/domus-start-desktop-v1.webp', final: '/media/domus-final-desktop-v1.webp', width: 1624, height: 914 };

export function HeroVideo({ t }) {
  const video = useRef(null), actions = useRef({});
  const handoff = useRef(null), completed = useRef(false), control = useRef({ manuallyPaused: false, manuallyStarted: false });
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 768px)').matches);
  const asset = desktop ? DESKTOP : MOBILE;
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true);
  const [status, setStatus] = useState(reduced ? 'static' : 'loading');

  useEffect(() => {
    const media = matchMedia('(min-width: 768px)');
    const change = () => {
      const element = video.current;
      handoff.current = { progress: Number.isFinite(element.duration) && element.duration > 0 ? element.currentTime / element.duration : 0, ended: completed.current || element.ended };
      element.pause();
      setDesktop(media.matches);
    };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const element = video.current, preference = matchMedia('(prefers-reduced-motion: reduce)');
    let live = true, visible = true, failedMedia = false, pendingPlay = false, needsGesture = false;
    // Set both attributes and properties: Safari must see a muted inline video.
    element.setAttribute('muted', '');
    element.setAttribute('playsinline', '');
    element.setAttribute('webkit-playsinline', '');
    element.muted = element.defaultMuted = true;
    element.playsInline = true;
    let snapshot = handoff.current;
    handoff.current = null;
    let restoring = Boolean(snapshot);
    const canResume = () => !document.hidden && visible && !control.current.manuallyPaused && !restoring && !failedMedia && !element.error && !completed.current && !element.ended && (!reduced || control.current.manuallyStarted);
    const play = (manual = false) => {
      if (pendingPlay) return;
      if (manual) {
        control.current.manuallyPaused = false; control.current.manuallyStarted = true;
        if (failedMedia || element.error) { failedMedia = false; element.load(); }
      }
      if (!manual && !canResume()) return;
      if (manual && (completed.current || element.ended)) { completed.current = false; snapshot = null; restoring = false; element.currentTime = 0; }
      if (!element.getAttribute('src')) element.src = asset.source;
      element.muted = true;
      element.defaultMuted = true;
      element.playsInline = true;
      setStatus('loading');
      pendingPlay = true;
      const result = element.play();
      result?.then(() => { pendingPlay = false; needsGesture = false; }, error => {
        pendingPlay = false;
        if (live && error.name !== 'AbortError') {
          needsGesture = error.name === 'NotAllowedError' && !element.error && !failedMedia;
          setStatus(needsGesture ? 'blocked' : 'error');
        }
      });
    };
    actions.current.toggle = () => {
      if (!element.paused) { control.current.manuallyPaused = true; element.pause(); }
      else play(true);
    };
    const playing = () => {
      if (completed.current) { element.pause(); setStatus('ended'); }
      else if (control.current.manuallyPaused) { element.pause(); setStatus('paused'); }
      else if (reduced && !control.current.manuallyStarted) { element.pause(); setStatus('static'); }
      else setStatus('playing');
    };
    const pause = () => {
      if (!element.ended && !completed.current) setStatus(current => ['blocked', 'error', 'static', 'ended'].includes(current) ? current : reduced && !control.current.manuallyStarted ? 'static' : 'paused');
    };
    const ended = () => { if (element.ended) { completed.current = true; setStatus('ended'); } };
    const failed = () => { failedMedia = true; setStatus(reduced && !control.current.manuallyStarted ? 'static' : 'error'); };
    const restore = () => {
      // Safari can briefly retain the previous source's metadata after src changes.
      if (!snapshot || !element.currentSrc.endsWith(asset.source) || element.readyState < 1 || !Number.isFinite(element.duration)) return;
      const previous = snapshot;
      snapshot = null; restoring = false;
      element.currentTime = previous.ended ? element.duration : Math.min(element.duration - .03, previous.progress * element.duration);
      if (previous.ended) { completed.current = true; element.pause(); setStatus('ended'); }
      else if (control.current.manuallyPaused) { element.pause(); setStatus('paused'); }
      else if (canResume()) play();
    };
    const visibility = () => {
      if (document.hidden) element.pause();
      else if (canResume()) play();
    };
    const ready = () => { if (element.paused && canResume() && !needsGesture) play(); };
    const gesture = event => {
      if (needsGesture && canResume() && !event.target.closest?.('button,a,input,select,textarea')) play();
    };
    const changePreference = () => { control.current.manuallyStarted = false; setReduced(preference.matches || navigator.connection?.saveData === true); };
    element.addEventListener('playing', playing);
    element.addEventListener('pause', pause);
    element.addEventListener('ended', ended);
    element.addEventListener('error', failed);
    element.addEventListener('loadedmetadata', restore);
    element.addEventListener('canplay', ready);
    window.addEventListener('pageshow', visibility);
    document.addEventListener('touchend', gesture, { passive: true });
    document.addEventListener('keydown', gesture);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', changePreference);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) element.pause();
      else if (canResume() && element.paused) play();
    }, { threshold: 0.05 });
    observer.observe(element);
    if (reduced && control.current.manuallyStarted && !element.getAttribute('src')) element.src = asset.source;
    if (reduced && !control.current.manuallyStarted) { element.pause(); setStatus('static'); }
    else if (completed.current || element.ended) setStatus('ended');
    else if (control.current.manuallyPaused) setStatus('paused');
    else if (!snapshot) play();
    if (element.readyState >= 1) restore();
    const timeout = setTimeout(() => setStatus(current => current === 'loading' ? 'blocked' : current), 7000);
    return () => {
      live = false; clearTimeout(timeout); observer.disconnect();
      element.removeEventListener('playing', playing);
      element.removeEventListener('pause', pause);
      element.removeEventListener('ended', ended);
      element.removeEventListener('error', failed);
      element.removeEventListener('loadedmetadata', restore);
      element.removeEventListener('canplay', ready);
      window.removeEventListener('pageshow', visibility);
      document.removeEventListener('touchend', gesture);
      document.removeEventListener('keydown', gesture);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', changePreference);
      element.pause();
    };
  }, [reduced, asset]);

  const button = status === 'playing' ? t.videoPause : status === 'ended' ? t.videoReplay : t.videoPlay;
  return <section className="hero hero-video" id="inicio" aria-labelledby="hero-heading" data-playback={status}>
    <h1 className="sr-only" id="hero-heading">DOMUS ARMORUM</h1>
    <div className="intro-stage">
      <img className="intro-still" src={asset.final} width={asset.width} height={asset.height} alt="" fetchPriority="high" />
      <video ref={video} className="intro-video" src={reduced ? undefined : asset.source} poster={completed.current ? asset.final : asset.start} width={asset.width} height={asset.height} muted playsInline autoPlay={!reduced && !completed.current && !control.current.manuallyPaused} preload={reduced ? 'none' : 'auto'} disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} />
    </div>
    <div className="intro-caption"><p className="intro-location">{t.since}</p><p>{t.heroIntro}</p><button className="intro-playback" onClick={() => actions.current.toggle?.()}><span className={status === 'playing' ? 'intro-pause-icon' : 'intro-play-icon'} aria-hidden="true" />{button}</button></div>
    <a className="intro-scroll" href="#essencia"><span>{t.exploreBrand}</span><span className="intro-scroll-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4v15m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>
  </section>;
}
