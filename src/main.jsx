import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowRight, ArrowDown, InstagramLogo, WhatsappLogo, List, X, Sun, Moon, MapPin, ShieldCheck, Handshake, Fingerprint } from '@phosphor-icons/react';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);
const COMPANY = { whatsapp: 'https://wa.me/5545999794330', instagram: 'https://www.instagram.com/domus.armorum/' };

function WhatsAppLink({ children, className = '', author = false, floating = false }) {
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
  return <a className={`whatsapp-link ${className} ${opening ? 'is-opening' : ''}`} href={author ? 'https://wa.me/5585999745534' : COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={floating ? (opening ? 'Abrindo WhatsApp…' : 'Contato geral pelo WhatsApp') : undefined} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpening(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpening(false), 5000);
  }}>
    <span className="wa-normal">{children}</span>
    <span className="wa-pending" aria-hidden={!opening}><span className="spinner" />{!floating && 'Abrindo WhatsApp…'}</span>
    <span className="sr-only" role="status">{opening ? 'Abrindo WhatsApp…' : ''}</span>
  </a>;
}

function App() {
  const root = useRef();
  const menuButton = useRef();
  const [menu, setMenu] = useState(false);
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
        gsap.to('.hero-emblem', { yPercent: 14, rotation: 3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.utils.toArray('[data-reveal]').forEach(el => {
          gsap.fromTo(el, { y: 18 }, { y: 0, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'clamp(top 94%)', end: 'clamp(top 52%)', scrub: 0.65 } });
        });
        gsap.utils.toArray('.manifesto-line').forEach(el => {
          gsap.fromTo(el, { opacity: 0.25, x: 20 }, { opacity: 1, x: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top 85%)', end: 'clamp(top 48%)', scrub: 0.5 } });
        });
        gsap.to('.footer-wordmark', { xPercent: -5, ease: 'none', scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });
        gsap.to('.reading-progress', { scaleX: 1, transformOrigin: 'left', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      }, root);
      return () => context.revert();
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; mm.revert(); };
  }, []);

  return <div ref={root}>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <header>
      <div className="header-inner shell">
        <a className="brand" href="#inicio" aria-label="Domus Armorum, início"><img src="/brand/domus-original.webp" width="40" height="54" alt="" /><span>DOMUS<span>ARMORUM</span></span></a>
        <nav className={menu ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label="Navegação principal">
          <a href="#essencia" onClick={() => setMenu(false)}>Nossa essência</a>
          <a href="#historia" onClick={() => setMenu(false)}>A Domus</a>
          <a href="#contato" onClick={() => setMenu(false)}>Informações <ArrowUpRight size={15} /></a>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" aria-label={light ? 'Ativar tema escuro' : 'Ativar tema claro'} onClick={() => setLight(!light)}>{light ? <Moon size={19} /> : <Sun size={19} />}</button>
          <a className="instagram-nav" href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Domus Armorum"><InstagramLogo size={22} /></a>
          <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenu(!menu)}>{menu ? <X size={25} /> : <List size={25} />}</button>
        </div>
      </div>
      <div className="reading-progress" />
    </header>

    <main id="conteudo">
      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">CASCAVEL, PARANÁ · DESDE 2017</p>
          <h1 className="hero-enter">DOMUS<br /><span>ARMORUM.</span></h1>
          <p className="hero-description hero-enter">Armas, munições e acessórios táticos. Conheça a história, a identidade e os valores da Domus Armorum.</p>
          <a href="#essencia" className="button hero-enter">Conheça a Domus <ArrowDown size={20} /></a>
        </div>
        <div className="hero-art hero-enter" aria-label="Emblema original da Domus Armorum">
          <div className="emblem-halo" />
          <img className="hero-emblem" src="/brand/domus-original.webp" alt="Emblema Domus Armorum com espada e ramos" width="680" height="980" fetchPriority="high" />
          <span className="art-caption">UMA MARCA. UMA IDENTIDADE.</span>
        </div>
      </section>

      <section className="manifesto shell" id="essencia">
        <div className="section-overflow"><p className="section-note" data-reveal>Nossa essência</p></div>
        <h2><span className="manifesto-line">NÃO SOMOS A MAIOR.</span><span className="manifesto-line outline-text">SOMOS REFERÊNCIA.</span></h2>
        <div className="manifesto-bottom"><span className="small-emblem" aria-hidden="true"><Fingerprint size={37} weight="thin" /></span><p data-reveal>Atendimento personalizado e uma identidade própria. É assim que a Domus se apresenta, todos os dias.</p></div>
      </section>

      <section className="story shell" id="historia">
        <figure className="brand-photo brand-original"><img src="/brand/domus-original.webp" alt="Logo original da Domus Armorum" width="680" height="980" loading="lazy" /><figcaption>A identidade Domus, presente nos detalhes.</figcaption></figure>
        <div className="story-copy">
          <div className="section-overflow"><h2 data-reveal>UMA HISTÓRIA.<br />NOSSA ASSINATURA.</h2></div>
          <p data-reveal>Fundada em setembro de 2017, a Domus Armorum nasceu em Cascavel, no oeste do Paraná.</p>
          <p className="muted" data-reveal>O nome, o emblema e a maneira de atender fazem parte da mesma identidade. Uma marca que valoriza o contato próximo e o atendimento especializado.</p>
          <div className="story-facts" data-reveal><div><span>2017</span><p>O início da nossa história</p></div><div><MapPin size={26} weight="light" /><p>Cascavel, Paraná</p></div></div>
        </div>
      </section>

      <section className="protection shell" aria-labelledby="protection-heading">
        <div className="protection-intro"><h2 id="protection-heading" data-reveal>PROTEÇÃO FAZ<br />PARTE DO ESPORTE.</h2><p data-reveal>Óculos de proteção e protetores auditivos fazem parte da proteção individual no tiro esportivo. Siga as orientações do local e de profissionais habilitados.</p></div>
        <figure className="protection-photo" data-reveal>
          <img src="/brand/protecao-auditiva-83d4539f.webp" alt="Fotografia real de diferentes protetores auditivos tipo concha Peltor sobre uma prateleira" width="1600" height="675" loading="lazy" />
          <figcaption><span>Proteção auditiva: exemplos de equipamentos.</span><span>Foto: <a href="https://commons.wikimedia.org/wiki/File:Peltor_earmuffs.jpg" target="_blank" rel="noopener noreferrer">JiriMatejicek / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. Redimensionada em WebP.</span></figcaption>
        </figure>
        <a className="safety-source" href="https://www.nssf.org/articles/always-wear-eye-and-ear-protection-when-shooting/" target="_blank" rel="noopener noreferrer">Informações sobre proteção dos olhos e ouvidos <ArrowUpRight size={15} /></a>
      </section>

      <section className="values shell" aria-labelledby="values-heading">
        <div className="values-intro"><h2 id="values-heading" data-reveal>O QUE NOS<br />REPRESENTA.</h2><p data-reveal>Mais do que um nome, uma forma de estar presente.</p></div>
        <div className="values-list">
          <article data-reveal><Handshake size={29} weight="light" /><div><h3>Proximidade</h3><p>Atendimento personalizado, com espaço para ouvir e conversar.</p></div></article>
          <article data-reveal><ShieldCheck size={29} weight="light" /><div><h3>Compromisso</h3><p>Atenção aos detalhes e respeito em cada atendimento.</p></div></article>
          <article data-reveal><Fingerprint size={29} weight="light" /><div><h3>Identidade</h3><p>Uma marca própria, reconhecível em cada detalhe.</p></div></article>
        </div>
      </section>

      <section className="contact shell" id="contato">
        <div className="contact-title"><p className="eyebrow">INFORMAÇÕES E CONTATO</p><h2 data-reveal>A CONVERSA<br />COMEÇA AQUI.</h2><p>Informações institucionais, horários e atendimento geral.</p><WhatsAppLink className="button contact-button"><WhatsappLogo size={22} /> Contato geral <ArrowUpRight size={19} /></WhatsAppLink></div>
        <div className="contact-details" data-reveal>
          <div><span className="detail-label">Estamos em</span><p>Cascavel<span>Paraná, Brasil</span></p></div>
          <div><span className="detail-label">WhatsApp</span><p>(45) 99979-4330</p></div>
          <div><span className="detail-label">Atendimento presencial</span><p className="detail-small">Consulte o endereço atual e os horários pelo nosso canal de contato.</p></div>
          <a className="social-link" href={COMPANY.instagram} target="_blank" rel="noopener noreferrer"><InstagramLogo size={23} /><span>@domus.armorum</span><ArrowUpRight size={20} /></a>
        </div>
      </section>
    </main>

    <footer>
      <div className="footer-top shell"><a className="footer-home" href="#inicio">DOMUS ARMORUM <ArrowUpRight size={20} /></a><span>História. Identidade. Presença.</span></div>
      <div className="footer-wordmark" aria-hidden="true">DOMUS ARMORUM</div>
      <div className="footer-bottom shell"><div><p>© {new Date().getFullYear()} Domus Armorum</p><p>AWM Armas e Munições LTDA · CNPJ 28.698.049/0001-89</p></div><WhatsAppLink author className="author-credit">Desenvolvido por <strong>Jonas Jr.</strong> <ArrowUpRight size={13} /></WhatsAppLink></div>
    </footer>
    <WhatsAppLink className="floating-whatsapp" floating><WhatsappLogo size={29} weight="regular" /><span>Contato</span></WhatsAppLink>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
