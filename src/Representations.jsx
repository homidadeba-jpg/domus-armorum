import { useEffect, useRef, useState } from 'react';
import { partners, ownerArchive } from './data/partners.js';
import './representations.css';

const relation = (brand, t) => t[brand.relation === 'exclusive' ? 'exclusiveBrazil' : brand.relation === 'representation' ? 'representationLabel' : 'distributionLabel'];
const country = (brand, t) => brand.country ? t[brand.country + 'Origin'] : '';
function Mark({ id, className = '' }) {
  return <img className={'partner-mark ' + className} src={'/partners/' + id + '.webp'} alt="" width="600" height="180" loading="lazy" decoding="async" />;
}
function Lines({ text }) { return text.split('\n').map((line, i) => <span key={i}>{line}</span>); }

export function BrandCarousel({ t }) {
  const root = useRef(null), gesture = useRef(null);
  const [active, setActive] = useState(0), [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false), [inView, setInView] = useState(false), [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .15 });
    observer.observe(root.current); preference(); visibility();
    media.addEventListener('change', preference); document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || !visible || !inView || reduced) return;
    const timer = setInterval(() => setActive(index => (index + 1) % partners.length), 5500);
    return () => clearInterval(timer);
  }, [paused, hovered, focused, visible, inView, reduced]);
  const select = index => { setActive((index + partners.length) % partners.length); setPaused(true); };
  const brand = partners[active];
  return <div className="brand-carousel" ref={root} role="region" aria-label={t.brandsAria}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="brand-orbit" onPointerDown={event => { if (event.pointerType === 'touch') gesture.current = { x: event.clientX, y: event.clientY }; }}
      onPointerCancel={() => { gesture.current = null; }} onPointerUp={event => {
        const start = gesture.current; gesture.current = null;
        if (start && Math.abs(event.clientX - start.x) > 45 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) select(active + (event.clientX < start.x ? 1 : -1));
      }}>
      {partners.map((item, i) => {
        let offset = (i - active + partners.length) % partners.length;
        if (offset > partners.length / 2) offset -= partners.length;
        return <div key={item.id} className={'brand-orbit-slide tone-' + item.tone} aria-hidden="true" data-active={offset === 0}
          style={{ '--offset': offset, '--distance': Math.abs(offset), visibility: Math.abs(offset) > 2 ? 'hidden' : 'visible' }}><Mark id={item.id} /></div>;
      })}
    </div>
    <div className="brand-carousel-caption"><div><p className="eyebrow">{relation(brand, t)}</p><h3>{brand.name}</h3><p>{t[brand.line]}{country(brand, t) && ' · ' + country(brand, t)}</p></div>
      <div className="brand-controls"><button onClick={() => select(active - 1)}>{t.brandPrev}</button><button onClick={() => select(active + 1)}>{t.brandNext}</button>
        {!reduced && <button className="brand-motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? t.brandPlay : t.brandPause}</button>}
      </div>
    </div>
    <div className="brand-index" aria-label={t.brandsAria}>{partners.map((item, i) => <button key={item.id} aria-pressed={active === i} onClick={() => select(i)} aria-label={t.brandSelect + ' ' + item.name}>{item.name}</button>)}</div>
    <dl className="brand-relations">{partners.filter(item => item.relation === 'distribution').map(item => <div key={item.id}><dt>{item.name}</dt><dd>{t[item.line]}</dd></div>)}</dl>
  </div>;
}

export function Representations({ t }) {
  const factory = ownerArchive.find(item => item.id === 'factory-wide');
  const detail = ownerArchive.find(item => item.id === 'factory-detail');
  return <section className="representations" id="marcas" aria-labelledby="representations-heading">
    <div className="representations-heading shell"><div><p className="eyebrow" data-reveal>{t.partnersLabel}</p><h2 id="representations-heading" data-reveal><Lines text={t.partnersHeading} /></h2></div><p data-reveal>{t.partnersIntro}</p></div>
    <article className="ghost-feature shell">
      <div className="ghost-identity"><div className="partner-identity tone-dark"><Mark id="ghost" /></div><p className="partner-status">{t.exclusiveBrazil}</p><h3>Ghost Holster<span>{t.italyOrigin}</span></h3><p>{t.ghostText}</p><a className="quiet-link" href="https://ghostinternational.com/dealers/" target="_blank" rel="noopener noreferrer">{t.officialRegistry}</a></div>
      <figure className={'ghost-image' + (factory.image ? ' is-visit' : '')}><img src={factory.image || '/partners/ghost-detail.webp'} width="1500" height={factory.image ? 1000 : 2250} alt={factory.image ? t[factory.caption] : t.ghostPhotoAlt} loading="lazy" decoding="async" /><figcaption>{factory.image ? t[factory.caption] : t.ghostCaption}</figcaption></figure>
    </article>
    <div className={'optics-editorial shell' + (detail.image ? ' has-archive' : '')}>
      <article className="konus-feature"><p className="eyebrow">{t.opticsLabel}</p><div className="partner-identity tone-dark"><Mark id="konus" /></div><h3>Konus Optics</h3><p className="partner-status">{t.exclusiveBrazil}</p><p>{t.konusText}</p></article>
      <figure className="konus-image"><img src="/partners/konus-outdoor.webp" width="1500" height="366" alt={t.konusPhotoAlt} loading="lazy" decoding="async" /><figcaption>{t.konusCaption}</figcaption></figure>
      <article className="sightron-feature"><div className="partner-identity tone-light"><Mark id="sightron" /></div><div><p className="partner-status">{t.representationLabel} · {t.usaOrigin}</p><h3>Sightron</h3><p>{t.sightronText}</p></div></article>
      {detail.image && <figure className="archive-photo archive-photo--portrait"><img src={detail.image} width="800" height="1000" alt={t[detail.caption]} loading="lazy" /><figcaption>{t[detail.caption]}</figcaption></figure>}
    </div>
    <div className="brand-network shell"><div className="brand-network-heading"><p className="eyebrow">{t.brandNetworkLabel}</p><h3><Lines text={t.brandNetworkHeading} /></h3><p>{t.brandNetworkIntro}</p></div><BrandCarousel t={t} /></div>
    <div className="owner-archive shell"><p className="eyebrow">{t.archiveLabel}</p><h3><Lines text={t.archiveHeading} /></h3><p>{t.archiveText}</p>
      {ownerArchive.filter(item => item.image && item.id === 'italy-fair').map(item => <figure key={item.id} className={'archive-photo archive-photo--' + item.format}><img src={item.image} width="1600" height="900" alt={t[item.caption]} loading="lazy" /><figcaption>{t[item.caption]}</figcaption></figure>)}
    </div>
  </section>;
}
