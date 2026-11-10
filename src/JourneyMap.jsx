import { useId, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import map from './data/journey-map.json';
import './journey.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function JourneyMap({ t }) {
  const root = useRef(null);
  const id = useId().replace(/:/g, '');
  const [ox, oy] = map.origin, [dx, dy] = map.destination;
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const route = root.current.querySelector('.connection-route');
      const traveller = root.current.querySelector('.connection-traveller');
      const length = route.getTotalLength();
      // Sample once; scrolling only interpolates cached coordinates and updates the small marker.
      const points = Array.from({ length: 181 }, (_, i) => route.getPointAtLength(length * i / 180));
      const progress = { value: 0 };
      const move = () => {
        const position = progress.value * 180;
        const index = Math.min(179, Math.floor(position));
        const a = points[index], b = points[index + 1], mix = position - index;
        traveller.setAttribute('transform', 'translate(' + (a.x + (b.x - a.x) * mix) + ' ' + (a.y + (b.y - a.y) * mix) + ')');
      };
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { id: 'domus-journey', trigger: root.current.querySelector('.journey-cartography'), start: 'clamp(top 86%)', end: 'clamp(top 32%)', scrub: true },
      });
      timeline
        .fromTo('.origin-label', { opacity: .3, y: 8 }, { opacity: 1, y: 0, duration: .8 }, .15)
        .fromTo('.map-origin-country', { opacity: .18 }, { opacity: 1, duration: .8 }, .15)
        .fromTo('.origin-ring', { scale: .55, opacity: .1, svgOrigin: ox + ' ' + oy }, { scale: 1, opacity: .7, duration: .8 }, .15)
        .fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 3, ease: 'none' }, .7)
        .fromTo(traveller, { opacity: 0 }, { opacity: 1, duration: .2 }, .7)
        .to(progress, { value: 1, duration: 3, ease: 'none', onUpdate: move }, .7)
        .fromTo('.destination-label', { opacity: .25, y: 8 }, { opacity: 1, y: 0, duration: .8 }, 3)
        .fromTo('.map-destination-country', { opacity: .2 }, { opacity: 1, duration: .8 }, 3)
        .fromTo('.destination-ring', { scale: .4, opacity: 0, svgOrigin: dx + ' ' + dy }, { scale: 1.3, opacity: .75, duration: .9 }, 3)
        .to(traveller, { opacity: 0, duration: .25 }, 3.65);
      move();
      return () => timeline.kill();
    });
    return () => media.revert();
  }, { scope: root });

  return <div className="journey-stage shell" ref={root}>
    <div className="journey-editorial">
      <p className="eyebrow">{t.journeyEyebrow}</p>
      <h2>{t.journeyTitle.split('\n').map((line, i) => <span key={i}>{line}</span>)}</h2>
      <p className="journey-text">{t.journeyText}</p>
      <div className="journey-endpoints"><div><span className="endpoint-dot" /><span>Cascavel<span>{t.journeyBrazil}</span></span></div><span className="endpoint-rule" /><div><span className="endpoint-dot endpoint-dot--italy" /><span>{t.italyCountry}<span>{t.journeyDestination}</span></span></div></div>
    </div>
    <div className="journey-cartography">
      <div className="map-topline"><span>DOMUS ARMORUM</span><span>{t.journeyEyebrow}</span></div>
      <svg className="connection-map" viewBox="0 0 1000 760" role="img" aria-labelledby={id + '-title'}>
        <title id={id + '-title'}>{t.journeyMap}</title>
        <defs>
          <radialGradient id={id + '-ocean'} cx="34%" cy="24%" r="83%"><stop offset="0" stopColor="var(--map-ocean-lit)" /><stop offset=".66" stopColor="var(--map-ocean)" /><stop offset="1" stopColor="var(--map-ocean-edge)" /></radialGradient>
          <radialGradient id={id + '-shade'} cx="25%" cy="20%" r="85%"><stop offset=".2" stopColor="#000" stopOpacity="0" /><stop offset=".75" stopColor="#000" stopOpacity=".14" /><stop offset="1" stopColor="#000" stopOpacity=".65" /></radialGradient>
          <linearGradient id={id + '-route'} x1={ox} y1={oy} x2={dx} y2={dy} gradientUnits="userSpaceOnUse"><stop stopColor="#8caa79" /><stop offset=".6" stopColor="#c4ba93" /><stop offset="1" stopColor="#d5b87c" /></linearGradient>
          <filter id={id + '-glow'} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
          <clipPath id={id + '-clip'}><path d={map.sphere} /></clipPath>
        </defs>
        <g className="map-geography">
          <ellipse className="map-shadow" cx="500" cy="716" rx="235" ry="15" />
          <path className="map-sphere" d={map.sphere} fill={'url(#' + id + '-ocean)'} />
          <g clipPath={'url(#' + id + '-clip)'}>
            <path className="map-graticule" d={map.graticule} />
            {map.countries.map(country => <path key={country.code + country.name} className={'map-country ' + (country.code === 'BRA' ? 'map-origin-country' : country.code === 'ITA' ? 'map-destination-country' : '')} d={country.path} />)}
            <path d={map.sphere} fill={'url(#' + id + '-shade)'} />
          </g>
          <path className="map-rim" d={map.sphere} />
          <path className="map-latitude" d="M180 367H820" />
        </g>
        <g aria-hidden="true">
          <path className="connection-guide" d={map.route} />
          <path className="connection-route" d={map.route} pathLength="1" strokeDasharray="1" stroke={'url(#' + id + '-route)'} />
          <path className="origin-leader" d={'M' + ox + ',' + oy + 'L292,603H170'} />
          <path className="destination-leader" d={'M' + dx + ',' + dy + 'L717,146H825'} />
          <circle className="origin-ring" cx={ox} cy={oy} r="15" />
          <circle className="destination-ring" cx={dx} cy={dy} r="17" />
          <circle className="map-origin-point" cx={ox} cy={oy} r="4.2" />
          <circle className="map-destination-point" cx={dx} cy={dy} r="4.2" />
          <g className="connection-traveller" transform={'translate(' + ox + ' ' + oy + ')'}>
            <circle r="9" fill="#d1bb88" opacity=".5" filter={'url(#' + id + '-glow)'} /><circle r="3.5" fill="#f0dec0" />
          </g>
        </g>
      </svg>
      <div className="map-label origin-label"><span>{t.journeyOrigin}</span><strong>Cascavel</strong><small>Paraná · {t.journeyBrazil}</small></div>
      <div className="map-label destination-label"><span>{t.journeyDestination}</span><strong>{t.italyCountry}</strong><small>DOMUS ARMORUM</small></div>
    </div>
  </div>;
}
