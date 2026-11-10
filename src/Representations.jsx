import { partners, ownerArchive } from './data/partners.js';
import './representations.css';
import './brand-directory.css';

function Mark({ id, className = '' }) {
  return <img className={'partner-mark ' + className} src={'/partners/' + id + '.webp'} alt="" width="600" height="180" loading="lazy" decoding="async" />;
}
function Lines({ text }) { return text.split('\n').map((line, i) => <span key={i}>{line}</span>); }

function BrandCard({ brand, t, showLine = false }) {
  return <figure className="partner-card" data-brand-id={brand.id}>
    <div className={'partner-logo tone-' + brand.tone}><Mark id={brand.id} /></div>
    <figcaption><h5>{brand.name}</h5>{showLine && <p>{t[brand.line]}</p>}</figcaption>
  </figure>;
}

function BrandDirectory({ t }) {
  const byId = id => partners.find(brand => brand.id === id);
  const groups = [
    { id: 'components', title: t.componentBrandsTitle, text: t.componentBrandsText, brands: ['hornady', 'cbc', 'federal', 'cci', 'fiocchi'] },
    { id: 'brazil', title: t.brazilBrandsTitle, text: t.brazilBrandsText, brands: ['dfa', 'fireeagle'] },
    { id: 'accessories', title: t.careBrandsTitle, brands: ['topgun', 'raoni'] },
  ];
  return <div className="partner-directory">{groups.map(group => <section className={'supply-group supply-group--' + group.id} key={group.id} aria-labelledby={'supply-' + group.id}>
    <div className="supply-heading"><h4 id={'supply-' + group.id}>{group.title}</h4>{group.text && <p>{group.text}</p>}</div>
    <div className="supply-logos">{group.brands.map(id => <BrandCard key={id} brand={byId(id)} t={t} showLine={id === 'hornady' || group.id === 'accessories'} />)}</div>
  </section>)}</div>;
}

export function Representations({ t }) {
  const factory = ownerArchive.find(item => item.id === 'factory-wide');
  const detail = ownerArchive.find(item => item.id === 'factory-detail');
  return <section className="representations" id="marcas" aria-labelledby="representations-heading"><span id="atuacao" className="section-alias" aria-hidden="true" />
    <div className="representations-heading shell"><div><p className="eyebrow" data-reveal>{t.partnersLabel}</p><h2 id="representations-heading" data-reveal><Lines text={t.partnersHeading} /></h2></div><p data-reveal>{t.partnersIntro}</p></div>
    <article className="ghost-feature shell" data-brand-id="ghost">
      <div className="ghost-identity"><div className="partner-identity tone-dark"><Mark id="ghost" /></div><p className="partner-status">{t.exclusiveBrazil}</p><h3>Ghost Holster<span>{t.italyOrigin}</span></h3><p>{t.ghostText}</p><a className="quiet-link" href="https://ghostinternational.com/dealers/" target="_blank" rel="noopener noreferrer">{t.officialRegistry}</a></div>
      <figure className={'ghost-image' + (factory.image ? ' is-visit' : '')}><img src={factory.image || '/partners/ghost-detail.webp'} width="1500" height={factory.image ? 1000 : 2250} alt={factory.image ? t[factory.caption] : t.ghostPhotoAlt} loading="lazy" decoding="async" /><figcaption>{factory.image ? t[factory.caption] : t.ghostCaption}</figcaption></figure>
    </article>
    <div className={'optics-editorial shell' + (detail.image ? ' has-archive' : '')}>
      <article className="konus-feature" data-brand-id="konus"><p className="eyebrow">{t.opticsLabel}</p><div className="partner-identity tone-dark"><Mark id="konus" /></div><h3>Konus Optics</h3><p className="partner-status">{t.exclusiveBrazil}</p><p>{t.konusText}</p></article>
      <figure className="konus-image"><img src="/partners/konus-outdoor.webp" width="1500" height="366" alt={t.konusPhotoAlt} loading="lazy" decoding="async" /><figcaption>{t.konusCaption}</figcaption></figure>
      <article className="sightron-feature" data-brand-id="sightron"><div className="partner-identity tone-light"><Mark id="sightron" /></div><div><p className="partner-status">{t.representationLabel} · {t.usaOrigin}</p><h3>Sightron</h3><p>{t.sightronText}</p></div></article>
      {detail.image && <figure className="archive-photo archive-photo--portrait"><img src={detail.image} width="800" height="1000" alt={t[detail.caption]} loading="lazy" /><figcaption>{t[detail.caption]}</figcaption></figure>}
    </div>
    <div className="brand-network shell"><div className="brand-network-heading"><p className="eyebrow">{t.brandNetworkLabel}</p><h3><Lines text={t.brandNetworkHeading} /></h3><p>{t.brandNetworkIntro}</p></div><BrandDirectory t={t} /></div>
    <div className="owner-archive shell"><p className="eyebrow">{t.archiveLabel}</p><h3><Lines text={t.archiveHeading} /></h3><p>{t.archiveText}</p>
      {ownerArchive.filter(item => item.image && item.id === 'italy-fair').map(item => <figure key={item.id} className={'archive-photo archive-photo--' + item.format}><img src={item.image} width="1600" height="900" alt={t[item.caption]} loading="lazy" /><figcaption>{t[item.caption]}</figcaption></figure>)}
    </div>
  </section>;
}
