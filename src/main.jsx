import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ArrowDown, InstagramLogo, WhatsappLogo, List, X, Sun, Moon, CaretDown } from '@phosphor-icons/react';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './styles.css';
import { languages, translations, initialLanguage } from './translations.js';
import { WhatsAppLink } from './contact.jsx';
import { BrandScene } from './BrandScene.jsx';
import { JourneyMap } from './JourneyMap.jsx';
import { useSmoothScroll } from './use-motion.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const INSTAGRAM = 'https://www.instagram.com/domus.armorum/';
function TextLines({ value }) {
  return value.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>);
}
function BrandContour({ className = '' }) {
  return <svg className={className} viewBox="0 0 240 310" fill="none" aria-hidden="true"><path d="M120 8C97 8 83 34 26 54C13 59 10 64 10 83V223C10 244 80 283 120 302C160 283 230 244 230 223V83C230 64 227 59 214 54C157 34 143 8 120 8Z" stroke="currentColor" strokeWidth=".7" /><path d="M120 22C98 22 83 46 35 63C24 67 22 74 22 87V218C22 238 82 270 120 289C158 270 218 238 218 218V87C218 74 216 67 205 63C157 46 142 22 120 22Z" stroke="currentColor" strokeWidth=".5" /></svg>;
}
function App() {
  const root = useRef(null), menuButton = useRef(null), header = useRef(null);
  const [menu, setMenu] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [light, setLight] = useState(() => {
    try { return localStorage.getItem('domus-theme') === 'light'; } catch { return false; }
  });
  const t = translations[language];
  useSmoothScroll();
  useEffect(() => {
    document.documentElement.lang = languages.find(item => item.code === language).tag;
    document.title = t.pageTitle;
    const locale = { it: 'it_IT', en: 'en_US', es: 'es_ES', pt: 'pt_BR' }[language];
    for (const [selector, content] of [
      ['meta[name="description"]', t.description], ['meta[property="og:locale"]', locale],
      ['meta[property="og:title"]', t.pageTitle], ['meta[property="og:description"]', t.description],
      ['meta[name="twitter:title"]', t.pageTitle], ['meta[name="twitter:description"]', t.description],
    ]) document.querySelector(selector).content = content;
    const url = new URL(location.href); url.searchParams.set('lang', language);
    history.replaceState(history.state, '', url);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [language, t]);
  useEffect(() => {
    const restore = () => setLanguage(initialLanguage());
    addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]').content = light ? '#eeeee5' : '#111410';
    try { localStorage.setItem('domus-theme', light ? 'light' : 'dark'); } catch { /* Theme still works without storage. */ }
  }, [light]);
  useEffect(() => {
    const escape = e => { if (e.key === 'Escape' && menu) { setMenu(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menu]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => header.current?.classList.toggle('is-scrolled', !entry.isIntersecting));
    observer.observe(root.current.querySelector('.top-sentinel'));
    return () => observer.disconnect();
  }, []);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-title-line', { yPercent: 110, rotation: 3, duration: 1.2, stagger: .12 }, .10)
        .from('.hero-kicker,.hero-description,.hero-link', { y: 18, autoAlpha: 0, duration: .9, stagger: .09, clearProps: 'all' }, .55)
        .from('.hero-art', { autoAlpha: 0, y: 22, duration: 1.4, clearProps: 'all' }, .15)
        .from('.hero-bottom', { autoAlpha: 0, y: 10, duration: .8, clearProps: 'all' }, .9);
      gsap.to('.hero-copy', { y: -36, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
      gsap.utils.toArray('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 28, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'clamp(top 91%)', once: true } });
      });
      gsap.utils.toArray('.manifesto-line').forEach(element => {
        gsap.fromTo(element, { opacity: .25, y: 20 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: element, start: 'clamp(top 90%)', end: 'clamp(top 53%)', scrub: .65 } });
      });
      gsap.utils.toArray('[data-photo]').forEach(element => {
        gsap.fromTo(element.querySelector('img'), { scale: 1.08, yPercent: -3 }, { scale: 1, yPercent: 3, ease: 'none', scrollTrigger: { trigger: element, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: .8 } });
      });
      gsap.fromTo('.italy-word', { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.italy-landscape', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.reading-trail', { scaleX: 1, transformOrigin: 'left', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
    });
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: '.italy-body', start: 'top 130px', end: 'bottom bottom', pin: '.italy-intro-inner', pinSpacing: false });
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; media.revert(); };
  }, { scope: root });
  const nav = (target, label) => <a href={target} onClick={() => setMenu(false)}>{label}</a>;
  return <div ref={root}>
    <div className="top-sentinel" aria-hidden="true" />
    <a href="#conteudo" className="skip-link">{t.skip}</a>
    <header ref={header}>
      <div className="header-inner shell">
        <a className="brand" href="#inicio" aria-label={t.home}><img src="/brand/domus-original.webp" width="40" height="54" alt="" /><span>DOMUS<span>ARMORUM</span></span></a>
        <nav className={menu ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label={t.navigation} data-lenis-prevent>
          {nav('#historia', t.about)}{nav('#atuacao', t.shopNav)}{nav('#italia', t.toursNav)}{nav('#contato', t.information)}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" aria-label={light ? t.dark : t.light} onClick={() => setLight(!light)}>{light ? <Moon size={18} /> : <Sun size={18} />}</button>
          <label className="language-switch"><select aria-label={t.language} value={language} onChange={event => {
            const selected = event.target.value;
            try { localStorage.setItem('domus-language', selected); } catch { /* Manual selection works without storage. */ }
            setLanguage(selected); setMenu(false);
          }}>{languages.map(item => <option key={item.code} value={item.code} lang={item.tag}>{item.name}</option>)}</select><span aria-hidden="true">{language.toUpperCase()}</span><CaretDown size={10} aria-hidden="true" /></label>
          <a className="instagram-nav" href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label={t.instagram}><InstagramLogo size={21} /></a>
          <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? t.closeMenu : t.openMenu} onClick={() => setMenu(!menu)}>{menu ? <X size={24} /> : <List size={24} />}</button>
        </div>
      </div>
      <div className="reading-progress" aria-hidden="true"><div className="reading-trail" /></div>
    </header>
    <main id="conteudo">
      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <p className="hero-kicker eyebrow"><span />{t.heroKicker}</p>
          <h1><span className="title-mask"><span className="hero-title-line">DOMUS</span></span><span className="title-mask"><span className="hero-title-line">ARMORUM<span className="title-dot">.</span></span></span></h1>
          <p className="hero-description">{t.hero}</p>
          <a href="#essencia" className="hero-link">{t.exploreBrand}<span className="link-icon"><ArrowDown size={19} /></span></a>
        </div>
        <div className="hero-art"><span className="scene-caption scene-caption--top">DOMUS ARMORUM <span>EST. 2017</span></span><BrandScene light={light} alt={t.emblemAlt} /><span className="scene-caption scene-caption--bottom">{t.signature}</span></div>
        <div className="hero-bottom"><span>{t.since}</span><span className="hero-bottom-line" /><span>{t.heroFoot}</span></div>
      </section>
      <section className="manifesto shell" id="essencia">
        <div className="section-meta"><span className="eyebrow">{t.institution}</span><span className="micro">{t.world}</span></div>
        <h2><span className="manifesto-line">{t.manifestoFirst}</span><span className="manifesto-line manifesto-outline">{t.manifestoSecond}</span></h2>
        <div className="manifesto-bottom"><BrandContour className="manifesto-seal" /><p data-reveal>{t.manifesto}</p></div>
        <div className="world-links" data-reveal><a href="#atuacao"><span className="eyebrow">CASCAVEL · BRASIL</span><span>{t.shopNav}<ArrowDown size={18} /></span></a><a href="#italia"><span className="eyebrow">{t.italyLabel}</span><span>{t.toursNav}<ArrowDown size={18} /></span></a></div>
      </section>
      <section className="activities shell" id="atuacao" aria-labelledby="activities-heading">
        <div className="section-heading"><div><p className="eyebrow" data-reveal>{t.shopLabel}</p><h2 id="activities-heading" data-reveal><TextLines value={t.shopHeading} /></h2></div><p data-reveal>{t.shopIntro}</p></div>
        <div className="department-grid">{[
          { image: 'armas-contexto-a29f18f3.webp', alt: t.armsPhoto, title: t.arms, text: t.armsFirst },
          { image: 'municoes-contexto-e32bdbf6.webp', alt: t.ammunitionPhoto, title: t.ammunition, text: t.ammunitionFirst },
          { image: 'equipamentos-taticos-b8b5a79e.webp', alt: t.equipmentPhoto, title: t.equipment, text: t.equipmentFirst },
        ].map(({ image, alt, title, text }) => <article className="department" key={image}><figure className="department-photo" data-photo><img src={'/brand/' + image} alt={alt} width={image.startsWith('equip') ? 1000 : 1600} height={image.startsWith('equip') ? 1503 : 1067} loading="lazy" /></figure><div className="department-copy" data-reveal><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        <div className="section-tail"><span className="small-cross" aria-hidden="true" /><p>{t.shopNote}</p><span className="micro">DOMUS ARMORUM</span></div>
      </section>
      <section className="italy" id="italia" aria-labelledby="italy-heading">
        <JourneyMap t={t} />
        <figure className="italy-landscape" data-photo><img src="/experiences/italia.webp" alt={t.italyPhoto} width="1800" height="1200" loading="lazy" /><div className="landscape-shade" /><span className="italy-word" aria-hidden="true">{t.italyCountry.toUpperCase()}.</span><figcaption><span>{t.italyCaption}</span><span>DOMUS · {t.italyCountry.toUpperCase()}</span></figcaption></figure>
        <div className="italy-body shell"><div className="italy-intro"><div className="italy-intro-inner"><p className="eyebrow" data-reveal>{t.italyLabel}</p><h2 id="italy-heading" data-reveal><TextLines value={t.italyHeading} /></h2><p data-reveal>{t.italyIntro}</p><div className="italy-signature"><span className="italian-flag" aria-hidden="true"><i /><i /><i /></span><span>{t.world}</span></div></div></div><div className="experience-list">{[[t.cultureTitle, t.cultureText], [t.foodTitle, t.foodText], [t.connectionTitle, t.connectionText]].map(([title, text]) => <article key={title} data-reveal><span className="experience-diamond" aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}<p className="experience-note">{t.italyNote}</p></div></div>
        <div className="italy-pull shell"><span className="pull-rule" /><p data-reveal>{t.italyPull}</p><span className="pull-rule" /></div>
      </section>
      <section className="story shell" id="historia"><div className="story-heading"><p className="eyebrow" data-reveal>{t.companyLabel}</p><h2 data-reveal><TextLines value={t.storyHeading} /></h2><span className="story-date" aria-hidden="true">2017</span></div><div className="story-copy"><p data-reveal>{t.story}</p><p className="muted" data-reveal>{t.storyIdentity}</p><dl className="company-facts" data-reveal><div><dt>{t.legalName}</dt><dd>AWM Armas e Munições LTDA</dd></div><div><dt>{t.taxId}</dt><dd>28.698.049/0001-89</dd></div><div><dt>{t.founded}</dt><dd>{t.foundingDate}</dd></div><div><dt>{t.city}</dt><dd>Cascavel, Paraná</dd></div></dl></div></section>
      <section className="contact shell" id="contato"><div className="contact-title"><p className="eyebrow">{t.contactLabel}</p><h2 data-reveal><TextLines value={t.contactHeading} /></h2><p>{t.contact}</p></div><div className="contact-details" data-reveal><div className="store-location"><span className="detail-label">{t.location}</span><p>Cascavel<span>{t.country}</span></p></div><div><span className="detail-label">WhatsApp</span><p>(45) 99979-4330</p></div><div><span className="detail-label">{t.inPerson}</span><p className="detail-small">{t.visit}</p></div><a className="social-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><InstagramLogo size={22} /><span>@domus.armorum</span><ArrowUpRight size={18} /></a></div></section>
    </main>
    <footer className="shell"><div className="footer-top"><a className="footer-brand" href="#inicio">DOMUS ARMORUM<span>EST. 2017 · CASCAVEL, BRASIL</span></a><a className="footer-home" href="#inicio">{t.back}<ArrowUpRight size={16} /></a></div><div className="footer-bottom"><div><p>© {new Date().getFullYear()} Domus Armorum</p><p>AWM Armas e Munições LTDA · CNPJ 28.698.049/0001-89</p></div><span className="footer-motto">{t.footer}</span><WhatsAppLink copy={t} author className="author-credit"><span lang="pt-BR">Desenvolvido por <strong>Jonas Jr</strong></span></WhatsAppLink></div></footer>
    <WhatsAppLink copy={t} className="floating-whatsapp" floating><WhatsappLogo size={28} weight="fill" aria-hidden="true" /></WhatsAppLink>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
