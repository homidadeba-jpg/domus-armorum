import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowDown, InstagramLogo, WhatsappLogo, List, X, Sun, Moon, Fingerprint } from '@phosphor-icons/react';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);
const COMPANY = { whatsapp: `https://wa.me/5545999794330?text=${encodeURIComponent('Olá, vim pelo site.')}`, instagram: 'https://www.instagram.com/domus.armorum/' };

function SegmentAccent({ sight = false }) {
  return <svg className={`segment-accent ${sight ? 'segment-accent--sight' : ''}`} data-accent viewBox="0 0 88 56" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {sight ? <><circle cx="44" cy="28" r="17" /><circle cx="44" cy="28" r="5" /><path d="M44 3v14m0 22v14M19 28h14m22 0h14M4 9h9M75 47h9" /></> : <><path d="M25 43V22l4-5v-5l3-7 3 7v5l4 5v21zm-2 0h18v5H23zM49 43V27l4-5v-5l3-7 3 7v5l4 5v16zm-2 0h18v5H47zM25 25h14M49 30h14M8 37h7m58-17h7" /></>}
  </svg>;
}

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
        gsap.utils.toArray('[data-photo]').forEach(frame => {
          const scene = frame.closest('figure') || frame.parentElement;
          gsap.timeline({ scrollTrigger: { trigger: scene, start: 'clamp(top 94%)', end: 'clamp(center 52%)', scrub: 0.75, invalidateOnRefresh: true } })
            .fromTo(frame, { y: () => window.innerWidth < 768 ? 48 : 84 }, { y: 0, ease: 'power1.out' }, 0)
            .fromTo(frame.querySelector('img'), { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 0, ease: 'power1.out' }, 0)
            .fromTo(scene, { clipPath: getComputedStyle(scene).getPropertyValue('--photo-mask-entry').trim() || 'inset(0%)' }, { clipPath: getComputedStyle(scene).getPropertyValue('--photo-mask').trim() || 'inset(0%)', ease: 'none' }, 0);
        });
        gsap.utils.toArray('.activity-illustration').forEach(frame => {
          gsap.fromTo(frame.querySelector('img'), { y: 8, scale: 0.95 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'clamp(top 92%)', end: 'clamp(top 48%)', scrub: 0.65 } });
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
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <header>
      <div className="header-inner shell">
        <a className="brand" href="#inicio" aria-label="Domus Armorum, início"><img src="/brand/domus-original.webp" width="40" height="54" alt="" /><span>DOMUS<span>ARMORUM</span></span></a>
        <nav className={menu ? 'navigation is-open' : 'navigation'} id="main-navigation" aria-label="Navegação principal">
          <a href="#essencia" onClick={() => setMenu(false)}>Nossa essência</a>
          <a href="#historia" onClick={() => setMenu(false)}>A Domus</a>
          <a href="#atuacao" onClick={() => setMenu(false)}>Atuação</a>
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
        <div className="ambient-field" aria-hidden="true"><div className="ambient-mark ambient-mark--sight"><SegmentAccent sight /></div></div>
      </section>

      <section className="manifesto shell" id="essencia">
        <div className="section-overflow"><p className="section-note" data-reveal>Nossa essência</p></div>
        <h2><span className="manifesto-line">NÃO SOMOS A MAIOR.</span><span className="manifesto-line outline-text">SOMOS REFERÊNCIA.</span></h2>
        <div className="manifesto-bottom"><span className="small-emblem" aria-hidden="true"><Fingerprint size={37} weight="thin" /></span><p data-reveal>Atendimento personalizado e uma identidade própria. É assim que a Domus se apresenta, todos os dias.</p></div>
      </section>

      <section className="story shell" id="historia">
        <div className="story-copy">
          <div className="section-overflow"><h2 data-reveal>UMA HISTÓRIA.<br />NOSSA ASSINATURA.</h2></div>
          <p data-reveal>Fundada em setembro de 2017, a Domus Armorum nasceu em Cascavel, no oeste do Paraná.</p>
          <p className="muted" data-reveal>O nome, o emblema e a maneira de atender fazem parte da mesma identidade. Uma marca que valoriza o contato próximo e o atendimento especializado.</p>
          <div className="story-year" data-reveal><div><p>DESDE</p><span>2017</span></div><p>Cascavel,<br />Paraná.</p></div>
        </div>
        <div className="story-visual">
          <figure className="story-photo photo-scene photo-cut photo-cut--arms" aria-label="Imagem ilustrativa do segmento de armas e equipamentos"><div className="photo-frame" data-photo><img src="/brand/armas-contexto-a29f18f3.webp" alt="Armas e equipamentos de proteção dispostos sobre uma bancada em um estande" width="1600" height="1067" loading="lazy" /></div></figure>
          <figure className="story-detail photo-scene photo-cut photo-cut--ammunition"><div className="photo-frame" data-photo><img src="/brand/municoes-contexto-e32bdbf6.webp" alt="Munições fotografadas em close sobre uma superfície escura" width="1600" height="1067" loading="lazy" /></div></figure>
        </div>
      </section>

      <section className="values activities shell" id="atuacao" aria-labelledby="activities-heading">
        <div className="values-intro"><h2 id="activities-heading" data-reveal>O QUE A<br />DOMUS FAZ.</h2><p data-reveal>Armas, munições e equipamentos e acessórios táticos formam as três frentes de atuação da Domus Armorum. Conheça o papel de cada uma nesse segmento.</p></div>
        <div className="values-list activity-list">
          <article data-reveal><div className="activity-illustration"><img src="/illustrations/armas-a3d0cf4c.svg" alt="Ilustração simbólica de uma arma de fogo" width="160" height="160" loading="lazy" /></div><div><h3>Armas</h3><p>O comércio varejista de armas de fogo integra a atuação da Domus Armorum e está presente na identidade da empresa desde o seu nome.</p><p>O segmento reúne armas curtas e longas, categorias com diferentes projetos e características de construção.</p></div></article>
          <article data-reveal><div className="activity-illustration"><img src="/illustrations/municoes-692b7d30.svg" alt="Ilustração simbólica de munições" width="160" height="160" loading="lazy" /></div><div><h3>Munições</h3><p>As munições também fazem parte da atuação da empresa. São os cartuchos utilizados pelas armas de fogo, com identificações e características próprias.</p><p>Calibre e tipo de cartucho fazem parte da descrição desse segmento. Armas e munições são categorias distintas, embora relacionadas.</p></div></article>
          <article data-reveal><div className="activity-illustration"><img src="/illustrations/equipamentos-9528d30f.svg" alt="Ilustração de uma mochila representando equipamentos táticos" width="160" height="160" loading="lazy" /></div><div><h3>Equipamentos e acessórios táticos</h3><p>Equipamentos e acessórios táticos completam as áreas de atuação da Domus Armorum.</p><p>Esse universo inclui itens de organização, transporte e apoio. Materiais, compartimentos e formas de acondicionamento fazem parte da função de cada equipamento.</p></div></article>
        </div>
        <div className="ambient-field" aria-hidden="true"><div className="ambient-mark ambient-mark--cartridges"><SegmentAccent /></div></div>
      </section>

      <section className="company-profile company-layout shell" aria-labelledby="company-heading">
        <div className="company-intro"><p className="eyebrow" data-reveal>A DOMUS ARMORUM</p><h2 id="company-heading" data-reveal>ATENDIMENTO<br />ESPECIALIZADO.</h2><p data-reveal>Uma empresa de Cascavel com atuação em armas, munições e equipamentos e acessórios táticos. O contato próximo e a atenção a cada pessoa fazem parte da identidade da marca.</p><p data-reveal>Desde 2017, a Domus Armorum valoriza o atendimento personalizado. Sua origem e sua maneira de atender fazem parte da mesma história.</p>
          <dl className="company-facts" data-reveal><div><dt>Razão social</dt><dd>AWM Armas e Munições LTDA</dd></div><div><dt>CNPJ</dt><dd>28.698.049/0001-89</dd></div><div><dt>Fundação</dt><dd>21 de setembro de 2017</dd></div><div><dt>Cidade</dt><dd>Cascavel, Paraná</dd></div></dl>
        </div>
        <figure className="tactical-photo photo-scene photo-cut photo-cut--equipment"><div className="photo-frame" data-photo><img src="/brand/equipamentos-taticos-b8b5a79e.webp" alt="Composição de equipamentos táticos com mochila, luvas, óculos e acessórios" width="1000" height="1503" loading="lazy" /></div></figure>
      </section>

      <section className="contact shell" id="contato">
        <div className="contact-title"><p className="eyebrow">INFORMAÇÕES E CONTATO</p><h2 data-reveal>A CONVERSA<br />COMEÇA AQUI.</h2><p>Informações institucionais, horários e atendimento geral pelo WhatsApp no canto da tela.</p></div>
        <div className="contact-details" data-reveal>
          <div><span className="detail-label">Estamos em</span><p>Cascavel<span>Paraná, Brasil</span></p></div>
          <div><span className="detail-label">WhatsApp</span><p>(45) 99979-4330</p></div>
          <div><span className="detail-label">Atendimento presencial</span><p className="detail-small">Consulte o endereço atual e os horários pelo nosso canal de contato.</p></div>
          <a className="social-link" href={COMPANY.instagram} target="_blank" rel="noopener noreferrer"><InstagramLogo size={23} /><span>@domus.armorum</span><ArrowUpRight size={20} /></a>
        </div>
      </section>
    </main>

    <footer>
      <div className="footer-top shell"><a className="footer-home" href="#inicio">Voltar ao início <ArrowUpRight size={20} /></a><span>História. Identidade. Presença.</span></div>
      <div className="footer-bottom shell"><div><p>© {new Date().getFullYear()} Domus Armorum</p><p>AWM Armas e Munições LTDA · CNPJ 28.698.049/0001-89</p></div><WhatsAppLink author className="author-credit">Desenvolvido por <strong>Jonas Jr.</strong> <ArrowUpRight size={13} /></WhatsAppLink></div>
    </footer>
    <WhatsAppLink className="floating-whatsapp" floating><WhatsappLogo size={31} weight="regular" /></WhatsAppLink>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
