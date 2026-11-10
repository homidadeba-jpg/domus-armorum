import { useEffect, useRef, useState } from 'react';
import './hero-video.css';

const SOURCE = '/media/domus-intro-v2.mp4';

export function HeroVideo({ t }) {
  const video = useRef(null), actions = useRef({});
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true);
  const [status, setStatus] = useState(reduced ? 'static' : 'loading');

  useEffect(() => {
    const element = video.current, preference = matchMedia('(prefers-reduced-motion: reduce)');
    let live = true, visible = true, manuallyPaused = false, manuallyStarted = false, failedMedia = false;
    const canResume = () => !document.hidden && visible && !manuallyPaused && !failedMedia && !element.error && !element.ended && (!reduced || manuallyStarted);
    const play = (manual = false) => {
      if (manual) {
        manuallyPaused = false; manuallyStarted = true;
        if (failedMedia || element.error) { failedMedia = false; element.load(); }
      }
      if (!manual && !canResume()) return;
      if (element.ended) element.currentTime = 0;
      if (!element.getAttribute('src')) element.src = SOURCE;
      element.muted = true;
      element.defaultMuted = true;
      element.playsInline = true;
      setStatus('loading');
      const result = element.play();
      result?.catch(error => {
        if (live && error.name !== 'AbortError') setStatus(element.error || failedMedia ? 'error' : 'blocked');
      });
    };
    actions.current.toggle = () => {
      if (!element.paused) { manuallyPaused = true; element.pause(); }
      else play(true);
    };
    const playing = () => {
      if (reduced && !manuallyStarted) { element.pause(); setStatus('static'); }
      else setStatus('playing');
    };
    const pause = () => {
      if (!element.ended) setStatus(current => ['blocked', 'error', 'static', 'ended'].includes(current) ? current : reduced && !manuallyStarted ? 'static' : 'paused');
    };
    const ended = () => setStatus('ended');
    const failed = () => { failedMedia = true; setStatus(reduced && !manuallyStarted ? 'static' : 'error'); };
    const visibility = () => {
      if (document.hidden) element.pause();
      else if (canResume()) play();
    };
    const changePreference = () => setReduced(preference.matches || navigator.connection?.saveData === true);
    element.addEventListener('playing', playing);
    element.addEventListener('pause', pause);
    element.addEventListener('ended', ended);
    element.addEventListener('error', failed);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', changePreference);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) element.pause();
      else if (canResume() && element.paused) play();
    }, { threshold: 0.05 });
    observer.observe(element);
    if (reduced) { element.pause(); setStatus('static'); }
    else if (element.ended) setStatus('ended');
    else play();
    const timeout = setTimeout(() => setStatus(current => current === 'loading' ? 'blocked' : current), 7000);
    return () => {
      live = false; clearTimeout(timeout); observer.disconnect();
      element.removeEventListener('playing', playing);
      element.removeEventListener('pause', pause);
      element.removeEventListener('ended', ended);
      element.removeEventListener('error', failed);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', changePreference);
      element.pause();
    };
  }, [reduced]);

  const button = status === 'playing' ? t.videoPause : status === 'ended' ? t.videoReplay : t.videoPlay;
  return <section className="hero hero-video" id="inicio" aria-labelledby="hero-heading" data-playback={status}>
    <h1 className="sr-only" id="hero-heading">DOMUS ARMORUM</h1>
    <div className="intro-stage">
      <img className="intro-still" src="/media/domus-final-v2.webp" width="720" height="1280" alt="" fetchPriority="high" />
      <video ref={video} className="intro-video" src={reduced ? undefined : SOURCE} poster="/media/domus-start-v2.webp" width="720" height="1280" muted playsInline autoPlay={!reduced} preload={reduced ? 'none' : 'auto'} disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} />
    </div>
    <div className="intro-caption"><p className="intro-location">{t.since}</p><p>{t.heroIntro}</p><button className="intro-playback" onClick={() => actions.current.toggle?.()}><span className={status === 'playing' ? 'intro-pause-icon' : 'intro-play-icon'} aria-hidden="true" />{button}</button></div>
    <a className="intro-scroll" href="#essencia"><span>{t.exploreBrand}</span><span className="intro-scroll-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4v15m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>
  </section>;
}
