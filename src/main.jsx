import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowDown, InstagramLogo, WhatsappLogo, List, X, Sun, Moon, CaretDown } from '@phosphor-icons/react';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './styles.css';
import { languages, translations, initialLanguage } from './translations.js';

gsap.registerPlugin(ScrollTrigger);
const COMPANY = { whatsapp: 'https://wa.me/5545999794330', instagram: 'https://www.instagram.com/domus.armorum/' };

function TextLines({ value }) {
  return value.split('\n').map((line, index) => <React.Fragment key={line}>{index > 0 && <br />}{line}</React.Fragment>);
}

function SegmentAccent({ sight = false }) {
  return <svg className={`segment-accent ${sight ? 'segment-accent--sight' : ''}`} data-accent viewBox="0 0 88 56" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {sight ? <><circle cx="44" cy="28" r="17" /><circle cx="44" cy="28" r="5" /><path d="M44 3v14m0 22v14M19 28h14m22 0h14M4 9h9M75 47h9" /></> : <><path d="M25 43V22l4-5v-5l3-7 3 7v5l4 5v21zm-2 0h18v5H23zM49 43V27l4-5v-5l3-7 3 7v5l4 5v16zm-2 0h18v5H47zM25 25h14M49 30h14M8 37h7m58-17h7" /></>}
  </svg>;
}

function WhatsAppLink({ children, className = '', author = false, floating = false, copy = translations.pt }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef();
  useEffect(() => {
    const reset = () => { setOpening(false); window.clearTimeout(timer.current); };
    const visible = () => { if (document.visibilityState === 'visible') reset(); };
    window.addEventListener('focus', reset);
    window.addEventListener('pageshow', reset);
    document.addEventListener('visibilitychange', visible);
    return () => { reset(); window.removeEventListener('focus', reset); window.removeEventListener('pageshow', reset); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return <a className={`whatsapp-link ${className} ${opening ? 'is-opening' : ''}`} href={author ? 'https://wa.me/5585999745534' : `${COMPANY.whatsapp}?text=${encodeURIComponent(copy.greeting)}`} target="_blank" rel="noopener noreferrer" aria-label={floating ? (opening ? copy.whatsappOpening : copy.whatsappContact) : undefined} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpening(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpening(false), 5000);
  }}>
    <span className="wa-normal">{children}</span>
    <span className="wa-pending" aria-hidden={!opening}><span className="spinner" />{!floating && copy.whatsappOpening}</span>
    <span className="sr-only" role="status">{opening ? copy.whatsappOpening : ''}</span>
  </a>;
}

function App() {
  const root = useRef();
  const menuButton = useRef();
  const [menu, setMenu] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const t = translations[language];
  useEffect(() => {
    document.documentElement.lang = languages.find(item => item.code === language).tag;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]').content = t.description;
    try { localStorage.setItem('domus-language', language); } catch { /* Language changes still work without storage. */ }
    const url = new URL(window.location.href);
    if (language === 'pt') url.searchParams.delete('lang'); else url.searchParams.set('lang', language);
    window.history.replaceState(window.history.state, '', url);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [language, t]);
  useEffect(() => {
    const restore = () => { const code = new URLSearchParams(location.search).get('lang'); setLanguage(Object.hasOwn(translations, code) ? code : 'pt'); };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const [light, setLight] = useState(() => {
    try { const saved = localStorage.getItem('domus-theme'); return saved ? saved === 'light' : matchMedia('(prefers-color-scheme: light)').matches; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]').content = light ? '#f0f1ed' : '#151715';
    try { localStorage.setItem('domus-theme', light ? 'light' : 'dark'); } catch { /* The selected theme still works without storage. */ }
  }, [light]);
  useEffect(() => {
    const close = event => { if (event.key === 'Escape' && menu) { setMenu(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menu]);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.hero-enter', { y: 30, opacity: 0, stagger: 0.11, duration: 0.9, ease: 'power3.out', clearProps: 'all' });
        gsap.to('.hero-emblem', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray('[data-reveal]').forEach(el => {
          gsap.fromTo(el, { y: 18 }, { y: 0, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'clamp(top 94%)', end: 'clamp(top 52%)', scrub: 0.65 } });
        });
        gsap.utils.toArray('.manifesto-line').forEach(el => {
          gsap.fromTo(el, { opacity: 0.25, x: 20 }, { opacity: 1, x: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top 85%)', end: 'clamp(top 48%)', scrub: 0.5 } });
        });
        gsap.utils.toArray('[data-photo]').forEach(frame => {
          const scene = frame.closest('figure') || frame.parentElement;
          gsap.timeline({ scrollTrigger: { trigger: scene, start: 'clamp(top 94%)', end: 'clamp(center 52%)', scrub: 0.75, invalidateOnRefresh: true } })
            .fromTo(frame, { y: () => window.innerWidth < 768 ? 48 : 84 }, { y: 0, ease: 'power1.out' }, 0)
            .fromTo(frame.querySelector('img'), { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 0, ease: 'power1.out' }, 0)
            .fromTo(scene, { clipPath: getComputedStyle(scene).getPropertyValue('--photo-mask-entry').trim() || 'inset(0%)' }, { clipPath: getComputedStyle(scene).getPropertyValue('--photo-mask').trim() || 'inset(0%)', ease: 'none' }, 0);
        });
        gsap.utils.toArray('[data-accent]').forEach(accent => {
          const depth = () => window.innerWidth < 768 ? 48 : 110;
          const isSight = accent.classList.contains('segment-accent--sight');
          gsap.fromTo(accent, { y: () => depth(), x: () => isSight ? -16 : 14, rotation: isSight ? -14 : 9 }, { y: () => -depth(), x: () => isSight ? 20 : -18, rotation: isSight ? 10 : -7, ease: 'none', scrollTrigger: { trigger: accent.closest('section'), start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: 1.1, invalidateOnRefresh: true } });
        });
        gsap.to('.reading-progress', { scaleX: 1, transformOrigin: 'left', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      }, root);
      return () => context.revert();
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; mm.revert(); };
  }, []);

  return <div ref={root}>
    <a href="#conteudo" className="skip-link">{t.skip}</a>
    <header>
      <div className="header-inner shell">
        <a className="brand" href="#inicio" aria-label={t.home}><img src="/brand/domus-original.webp" width="40" height="54" alt="" /><span>DOMUS<span>ARMORUM</span></span></a>
        <nav className={menu ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label={t.navigation}>
          <a href="#essencia" onClick={() => setMenu(false)}>{t.essence}</a>
          <a href="#historia" onClick={() => setMenu(false)}>{t.about}</a>
          <a href="#atuacao" onClick={() => setMenu(false)}>{t.areas}</a>
          <a href="#contato" onClick={() => setMenu(false)}>{t.information} <ArrowUpRight size={15} /></a>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" aria-label={light ? t.dark : t.light} onClick={() => setLight(!light)}>{light ? <Moon size={19} /> : <Sun size={19} />}</button>
          <label className="language-switch"><select aria-label={t.language} value={language} onChange={event => { setLanguage(event.target.value); setMenu(false); }}>{languages.map(item => <option key={item.code} value={item.code} lang={item.tag} label={item.name}>{item.code.toUpperCase()}</option>)}</select><span aria-hidden="true">{language.toUpperCase()}</span><CaretDown size={10} aria-hidden="true" /></label>
          <a className="instagram-nav" href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label={t.instagram}><InstagramLogo size={22} /></a>
          <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? t.closeMenu : t.openMenu} onClick={() => setMenu(!menu)}>{menu ? <X size={25} /> : <List size={25} />}</button>
        </div>
      </div>
      <div className="reading-progress" />
    </header>

    <main id="conteudo">
      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">{t.since}</p>
          <h1 className="hero-enter">DOMUS<br /><span>ARMORUM.</span></h1>
          <p className="hero-description hero-enter">{t.hero}</p>
          <a href="#essencia" className="button hero-enter">{t.discover} <ArrowDown size={20} /></a>
        </div>
        <div className="hero-art hero-enter" aria-label={t.emblem}>
          <img className="hero-emblem" src="/brand/domus-original.webp" alt={t.emblemAlt} width="680" height="980" fetchPriority="high" />
        </div>
        <div className="ambient-field" aria-hidden="true"><div className="ambient-mark ambient-mark--sight"><SegmentAccent sight /></div></div>
      </section>

      <section className="manifesto shell" id="essencia">
        <div className="section-overflow"><p className="section-note" data-reveal>{t.essence}</p></div>
        <h2><span className="manifesto-line">{t.manifestoFirst}</span><span className="manifesto-line outline-text">{t.manifestoSecond}</span></h2>
        <div className="manifesto-bottom"><p data-reveal>{t.manifesto}</p></div>
      </section>

      <section className="story shell" id="historia">
        <div className="story-heading"><h2 data-reveal><TextLines value={t.storyHeading} /></h2></div>
        <div className="story-copy">
          <p data-reveal>{t.story}</p>
          <p className="muted" data-reveal>{t.storyIdentity}</p>
          <div className="story-year" data-reveal><div><p>{t.sinceLabel}</p><span>2017</span></div><p>Cascavel,<br />Paraná.</p></div>
        </div>
      </section>

      <section className="values activities shell" id="atuacao" aria-labelledby="activities-heading">
        <div className="values-intro"><h2 id="activities-heading" data-reveal><TextLines value={t.areasHeading} /></h2><p data-reveal>{t.areasIntro}</p></div>
        <div className="values-list activity-list">
          <article>
            <figure className="activity-photo photo-scene photo-cut photo-cut--arms"><div className="photo-frame" data-photo><img src="/brand/armas-contexto-a29f18f3.webp" alt={t.armsPhoto} width="1600" height="1067" loading="lazy" /></div></figure>
            <div className="activity-copy" data-reveal><span className="activity-index" aria-hidden="true">01</span><h3>{t.arms}</h3><p>{t.armsFirst}</p><p>{t.armsSecond}</p></div>
          </article>
          <article>
            <figure className="activity-photo photo-scene photo-cut photo-cut--ammunition"><div className="photo-frame" data-photo><img src="/brand/municoes-contexto-e32bdbf6.webp" alt={t.ammunitionPhoto} width="1600" height="1067" loading="lazy" /></div></figure>
            <div className="activity-copy" data-reveal><span className="activity-index" aria-hidden="true">02</span><h3>{t.ammunition}</h3><p>{t.ammunitionFirst}</p><p>{t.ammunitionSecond}</p></div>
          </article>
          <article>
            <figure className="activity-photo activity-photo--equipment photo-scene photo-cut photo-cut--equipment"><div className="photo-frame" data-photo><img src="/brand/equipamentos-taticos-b8b5a79e.webp" alt={t.equipmentPhoto} width="1000" height="1503" loading="lazy" /></div></figure>
            <div className="activity-copy" data-reveal><span className="activity-index" aria-hidden="true">03</span><h3>{t.equipment}</h3><p>{t.equipmentFirst}</p><p>{t.equipmentSecond}</p></div>
          </article>
        </div>
        <div className="ambient-field" aria-hidden="true"><div className="ambient-mark ambient-mark--cartridges"><SegmentAccent /></div></div>
      </section>

      <section className="company-profile company-layout shell" aria-labelledby="company-heading">
        <div className="company-intro"><p className="eyebrow" data-reveal>{t.companyLabel}</p><h2 id="company-heading" data-reveal><TextLines value={t.companyHeading} /></h2><p data-reveal>{t.company}</p><p data-reveal>{t.companyHistory}</p></div>
        <dl className="company-facts" data-reveal><div><dt>{t.legalName}</dt><dd>AWM Armas e Munições LTDA</dd></div><div><dt>{t.taxId}</dt><dd>28.698.049/0001-89</dd></div><div><dt>{t.founded}</dt><dd>{t.foundingDate}</dd></div><div><dt>{t.city}</dt><dd>Cascavel, Paraná</dd></div></dl>
      </section>

      <section className="contact shell" id="contato">
        <div className="contact-title"><p className="eyebrow">{t.contactLabel}</p><h2 data-reveal><TextLines value={t.contactHeading} /></h2><p>{t.contact}</p></div>
        <div className="contact-details" data-reveal>
          <div><span className="detail-label">{t.location}</span><p>Cascavel<span>{t.country}</span></p></div>
          <div><span className="detail-label">WhatsApp</span><p>(45) 99979-4330</p></div>
          <div><span className="detail-label">{t.inPerson}</span><p className="detail-small">{t.visit}</p></div>
          <a className="social-link" href={COMPANY.instagram} target="_blank" rel="noopener noreferrer"><InstagramLogo size={23} /><span>@domus.armorum</span><ArrowUpRight size={20} /></a>
        </div>
      </section>
    </main>

    <footer>
      <div className="footer-top shell"><a className="footer-home" href="#inicio">{t.back} <ArrowUpRight size={20} /></a><span>{t.footer}</span></div>
      <div className="footer-bottom shell"><div><p>© {new Date().getFullYear()} Domus Armorum</p><p>AWM Armas e Munições LTDA · CNPJ 28.698.049/0001-89</p></div><WhatsAppLink copy={t} author className="author-credit">{t.developed} <strong>Jonas Jr.</strong> <ArrowUpRight size={13} /></WhatsAppLink></div>
    </footer>
    <WhatsAppLink copy={t} className="floating-whatsapp" floating><WhatsappLogo size={31} weight="regular" /></WhatsAppLink>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
