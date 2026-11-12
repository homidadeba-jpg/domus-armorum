import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { InstagramLogo, CaretDown } from '@phosphor-icons/react';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './styles.css';
import { languages, translations, initialLanguage } from './translations.js';
import { WhatsAppLink, WhatsAppMark } from './contact.jsx';
import { HeroVideo } from './HeroVideo.jsx';
import { JourneyMap } from './JourneyMap.jsx';
import { ItalyExperiences } from './ItalyExperiences.jsx';
import { Representations, OwnerArchive } from './Representations.jsx';
import { CompanyContact } from './CompanyContact.jsx';
import { company } from './company.js';
import './responsive.css';
import './interactions.css';
import brandOutline from './data/brand-outline.json';
import { useSmoothScroll } from './use-motion.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const INSTAGRAM = 'https://www.instagram.com/domus.armorum/';
function TextLines({ value }) {
  return value.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>);
}
export function App({ initialLocale } = {}) {
  const root = useRef(null), menuButton = useRef(null), header = useRef(null);
  const [menu, setMenu] = useState(false);
  const [compactNavigation, setCompactNavigation] = useState(() => typeof window === 'undefined' || matchMedia('(max-width: 980px)').matches);
  const [pastHero, setPastHero] = useState(false);
  const [language, setLanguage] = useState(() => initialLocale || initialLanguage());
  const t = translations[language];
  useSmoothScroll();
  useEffect(() => {
    document.documentElement.lang = languages.find(item => item.code === language).tag;
    document.title = t.pageTitle;
    // Link previews stay in Portuguese; the page itself follows the selected language.
    document.querySelector('meta[name="description"]').content = t.description;
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
    const escape = e => { if (e.key === 'Escape' && menu) { setMenu(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menu]);
  useEffect(() => {
    const media = matchMedia('(max-width: 980px)');
    const sync = () => setCompactNavigation(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (pastHero && !compactNavigation) setMenu(false);
  }, [pastHero, compactNavigation]);
  useEffect(() => {
    if (!menu) return;
    const outside = event => { if (!header.current.contains(event.target)) setMenu(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); };
  }, [menu]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setPastHero(entry.boundingClientRect.bottom <= header.current.offsetHeight), { rootMargin: `-${header.current.offsetHeight}px 0px 0px 0px` });
    observer.observe(root.current.querySelector('.hero'));
    return () => observer.disconnect();
  }, []);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root);
      const compact = matchMedia('(max-width: 767px)').matches;
      const followScroll = trigger => ({ trigger, start: 'clamp(top 88%)', end: 'clamp(top 58%)', scrub: true });
      const sequence = (trigger, targets, gap = .075) => {
        if (!targets.length) return;
        gsap.from(targets, { y: compact ? 18 : 30, opacity: .12, duration: .85,
          stagger: gap, ease: 'none', scrollTrigger: followScroll(trigger) });
      };

      // Scroll position controls progress in both directions; nothing restarts on re-entry.
      select('.representations-heading, .italy-intro-inner, .story-heading, .contact-title').forEach(block => {
        const heading = block.querySelector('h2');
        const lines = heading ? [...heading.children].filter(node => node.tagName === 'SPAN') : [];
        const targets = [...block.children].flatMap(node => node === heading && lines.length ? lines : [node])
          .filter(node => !node.classList.contains('story-date'));
        sequence(block, targets, .11);
      });
      select('.ghost-identity, .konus-feature, .sightron-feature, .brand-network-heading, .archive-intro').forEach(block => {
        sequence(block, [...block.children], .085);
      });
      select('.supply-group').forEach(group => {
        const timeline = gsap.timeline({ scrollTrigger: followScroll(group), defaults: { ease: 'none' } });
        timeline.from(group.querySelector('.supply-heading'), { y: 18, opacity: .2, duration: .65 })
          .from(group.querySelectorAll('.partner-card'), { y: compact ? 20 : 32, opacity: .08, scale: .97,
            duration: .75, stagger: .09 }, .15);
      });
      select('.archive-photo, .ghost-institutional, .konus-material, .experience-photo').forEach(figure => {
        const image = figure.querySelector('img'), caption = figure.querySelector('figcaption');
        const timeline = gsap.timeline({ scrollTrigger: followScroll(figure) });
        if (image) timeline.fromTo(image, { clipPath: 'inset(0% 0% 16% 0%)', opacity: .45 },
          { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.1, ease: 'none' });
        if (caption) timeline.from(caption, { y: 9, opacity: 0, duration: .55, ease: 'none' }, .35);
      });
      select('.experience-list article').forEach(article => sequence(article, [...article.querySelectorAll('h3,p')], .1));
      select('.story-copy').forEach(block => sequence(block, [...block.children], .12));
      select('.contact-details').forEach(block => sequence(block, [...block.children], .09));
      select('.world-links').forEach(block => sequence(block, [...block.children], .14));
      select('footer').forEach(block => sequence(block, [...block.children], .14));

      // Do not animate a parent and its editorial children on the same axis.
      const composed = '.representations-heading, .italy-intro-inner, .story-heading, .contact-title, .ghost-identity, .konus-feature, .sightron-feature, .brand-network-heading, .archive-intro, .archive-photo, .ghost-institutional, .konus-material, .experience-list article, .story-copy, .contact-details, .world-links';
      select('[data-reveal]').filter(element => !element.closest(composed)).forEach(element => {
        sequence(element, [element]);
      });
      select('.manifesto-line').forEach(element => {
        gsap.fromTo(element, { opacity: .25, y: compact ? 18 : 30 }, { opacity: 1, y: 0, ease: 'none',
          scrollTrigger: { trigger: element, start: 'clamp(top 92%)', end: 'clamp(top 57%)', scrub: true } });
      });
      gsap.from('.manifesto-signature', { y: 14, opacity: .2, ease: 'none', scrollTrigger: followScroll('.manifesto-bottom') });
      gsap.from('.story-date', { y: 35, opacity: 0, duration: 1.2, ease: 'none', scrollTrigger: followScroll('.story-heading') });
      select('[data-photo]').forEach(element => {
        gsap.fromTo(element.querySelector('img'), { scale: 1.08, yPercent: -3 }, { scale: 1.08, yPercent: 3,
          ease: 'none', scrollTrigger: { trigger: element, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: true } });
      });
      gsap.fromTo('.italy-word', { xPercent: -4 }, { xPercent: 4, ease: 'none',
        scrollTrigger: { trigger: '.italy-landscape', start: 'top bottom', end: 'bottom top', scrub: true } });
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
  const toggleMenu = () => {
    setMenu(open => !open);
    if (!menu) requestAnimationFrame(() => {
      if (menuButton.current?.getAttribute('aria-expanded') === 'true') header.current.querySelector('nav a')?.focus({ preventScroll: true });
    });
  };
  return <div ref={root} className={'site' + (pastHero ? ' is-past-hero' : '')}>
    <a href="#conteudo" className="skip-link">{t.skip}</a>
    <header ref={header} className={'site-header ' + (pastHero ? 'is-past-hero is-scrolled' : 'is-hero') + (menu ? ' is-menu-open' : '')}>
      <div className="header-inner shell">
        <a className="brand" href="#inicio" aria-label={t.home}><img src="/brand/domus-original.webp" style={{ clipPath: brandOutline.clip }} width="40" height="54" alt="" /><span>DOMUS<span>ARMORUM</span></span></a>
        <nav className={menu ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label={t.navigation} data-collapsible={compactNavigation || !pastHero ? 'true' : undefined} inert={!menu && (compactNavigation || !pastHero) ? true : undefined} data-lenis-prevent>
          {nav('#historia', t.about)}{nav('#marcas', t.brandsNav)}{nav('#italia', t.toursNav)}{nav('#contato', t.information)}
        </nav>
        <div className="header-actions">
          <label className="language-switch"><select aria-label={t.language} value={language} onChange={event => {
            const selected = event.target.value;
            try { localStorage.setItem('domus-language', selected); } catch { /* Manual selection works without storage. */ }
            setLanguage(selected); setMenu(false);
          }}>{languages.map(item => <option key={item.code} value={item.code} lang={item.tag}>{item.name}</option>)}</select><span aria-hidden="true">{language.toUpperCase()}</span><CaretDown size={10} aria-hidden="true" /></label>
          <a className="instagram-nav" href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label={t.instagram}><InstagramLogo size={21} /></a>
          <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? t.closeMenu : t.openMenu} onClick={toggleMenu}><span className="menu-glyph" aria-hidden="true"><i /><i /></span></button>
        </div>
      </div>
      <div className="reading-progress" aria-hidden="true"><div className="reading-trail" /></div>
    </header>
    <main id="conteudo">
      <HeroVideo t={t} />
      <section className="manifesto shell" id="essencia">
        <div className="section-meta"><span className="eyebrow">{t.institution}</span><span className="micro">{t.world}</span></div>
        <h2><span className="manifesto-line">{t.manifestoFirst}</span><span className="manifesto-line manifesto-outline">{t.manifestoSecond}</span></h2>
        <div className="manifesto-bottom"><span className="manifesto-signature" aria-hidden="true"><span className="manifesto-emblem" /></span><p data-reveal>{t.manifesto}</p></div>
        <div className="world-links" data-reveal><a href="#marcas"><span className="eyebrow">CASCAVEL · BRASIL</span><span>{t.brandsNav}</span></a><a href="#italia"><span className="eyebrow">{t.italyLabel}</span><span>{t.toursNav}</span></a></div>
      </section>
      <Representations t={t} />
      <section className="italy" id="italia" aria-labelledby="italy-heading">
        <JourneyMap t={t} />
        <figure className="italy-landscape" data-photo><img src="/experiences/italia.webp" alt={t.italyPhoto} width="1800" height="1200" loading="lazy" /><div className="landscape-shade" /><span className="italy-word" aria-hidden="true">{t.italyCountry.toUpperCase()}.</span></figure>
        <ItalyExperiences t={t} />
        <OwnerArchive t={t} />
        <div className="italy-pull shell"><span className="pull-rule" /><p data-reveal>{t.italyPull}</p><span className="pull-rule" /></div>
      </section>
      <section className="story shell" id="historia"><div className="story-heading"><p className="eyebrow" data-reveal>{t.companyLabel}</p><h2 data-reveal><TextLines value={t.storyHeading} /></h2><span className="story-date" aria-hidden="true">2017</span></div><div className="story-copy"><p data-reveal>{t.story}</p><p className="muted" data-reveal>{t.storyIdentity}</p><dl className="company-facts" data-reveal><div><dt>{t.legalName}</dt><dd>AWM Armas e Munições LTDA</dd></div><div><dt>{t.taxId}</dt><dd>28.698.049/0001-89</dd></div><div><dt>{t.founded}</dt><dd>{t.foundingDate}</dd></div><div><dt>{t.city}</dt><dd>Cascavel, Paraná</dd></div></dl></div></section>
      <CompanyContact t={t} />
    </main>
    <footer className="shell"><div className="footer-top"><a className="footer-brand" href="#inicio">DOMUS ARMORUM<span>EST. 2017 · CASCAVEL, BRASIL</span></a><a className="footer-home" href="#inicio">{t.back}</a></div><div className="footer-bottom"><div><p>© {new Date().getFullYear()} Domus Armorum</p><p>AWM Armas e Munições LTDA · CNPJ 28.698.049/0001-89</p><p className="footer-address">{company.street} · {company.suite} · {company.district}<br />{company.city}–{company.stateCode} · CEP {company.postalCode}</p></div><span className="footer-motto">{t.footer}</span><WhatsAppLink copy={t} author className="author-credit"><span lang="pt-BR">Desenvolvido por <strong>Jonas Jr</strong></span></WhatsAppLink></div></footer>
    <WhatsAppLink copy={t} className="floating-whatsapp" floating><WhatsAppMark /></WhatsAppLink>
  </div>;
}
if (typeof document !== 'undefined') createRoot(document.getElementById('root')).render(<App />);
