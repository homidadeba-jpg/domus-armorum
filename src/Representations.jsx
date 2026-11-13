import { partners, ownerArchive } from './data/partners.js';
import './representations.css';
import './brand-directory.css';
import './owner-photos.css';

function Mark({ id, className = '' }) {
  return <img className={'partner-mark ' + className} src={'/partners/' + id + '.webp'} alt="" width="600" height="180" loading="lazy" decoding="async" />;
}
function Lines({ text }) { return text.split('\n').map((line, i) => <span key={i}>{line}</span>); }

function ArchivePhoto({ photo, t, className = '' }) {
  if (!photo?.image) return null;
  return <figure className={'archive-photo ' + className} data-archive-id={photo.id} data-reveal>
    <img src={photo.image} width={photo.width} height={photo.height} style={{ aspectRatio: `${photo.width} / ${photo.height}` }} alt={t[photo.alt] || t[photo.caption]} loading="lazy" decoding="async" />
    {photo.caption && photo.id !== 'ghost-accessories' && <figcaption>{t[photo.caption]}</figcaption>}
  </figure>;
}

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
    <div className="supply-heading">
      <h4 id={'supply-' + group.id}>{group.title}</h4>
      {group.text && <p>{group.text}</p>}
      {group.id === 'components' && <figure className="archive-photo cbc-editorial" data-reveal>
        <img src="/partners/cbc-arte-editorial.webp" width="720" height="1280" alt={t.cbcEditorialAlt} loading="lazy" decoding="async" />
      </figure>}
    </div>
    <div className="supply-logos">{group.brands.map(id => <BrandCard key={id} brand={byId(id)} t={t} showLine={id === 'hornady' || group.id === 'accessories'} />)}</div>
  </section>)}</div>;
}

export function Representations({ t }) {
  const factory = ownerArchive.find(item => item.id === 'factory-wide');
  const detail = ownerArchive.find(item => item.id === 'ghost-accessories');
  const meeting = ownerArchive.find(item => item.id === 'partner-meeting');
  return <section className="representations" id="marcas" aria-labelledby="representations-heading"><span id="atuacao" className="section-alias" aria-hidden="true" />
    <div className="representations-heading shell"><div><p className="eyebrow" data-reveal>{t.partnersLabel}</p><h2 id="representations-heading" data-reveal><Lines text={t.partnersHeading} /></h2></div><p data-reveal>{t.partnersIntro}</p></div>
    <article className="ghost-feature shell" data-brand-id="ghost">
      <div className="ghost-identity"><div className="partner-identity tone-dark"><Mark id="ghost" /></div><p className="partner-status">{t.exclusiveBrazil}</p><h3>Ghost Holster<span>{t.italyOrigin}</span></h3><p>{t.ghostText}</p><a className="quiet-link" href="https://ghostinternational.com/dealers/" target="_blank" rel="noopener noreferrer">{t.officialRegistry}</a></div>
      <div className="ghost-visuals"><ArchivePhoto photo={factory} t={t} className="ghost-image is-visit" /><div className="ghost-details"><ArchivePhoto photo={detail} t={t} className="ghost-accessory" /><figure className="ghost-institutional" data-reveal><img src="/partners/ghost-detail.webp" width="1500" height="2250" style={{ aspectRatio: '1500 / 2250' }} alt={t.ghostPhotoAlt} loading="lazy" decoding="async" /></figure></div></div>
    </article>
    <div className="optics-editorial shell">
      <article className="konus-feature" data-brand-id="konus"><p className="eyebrow">{t.opticsLabel}</p><div className="partner-identity tone-dark"><Mark id="konus" /></div><h3>Konus Optics</h3><p className="partner-status">{t.exclusiveBrazil}</p><p>{t.konusText}</p></article>
      <div className={'konus-imagery' + (meeting?.image ? '' : ' is-institutional')}>
        <ArchivePhoto photo={meeting} t={t} className="konus-image konus-meeting" />
        <figure className="konus-material" data-reveal><img src="/partners/konus-outdoor.webp" width="1500" height="366" style={{ aspectRatio: '1500 / 366' }} alt={t.konusPhotoAlt} loading="lazy" decoding="async" /></figure>
        <figure className="archive-photo konus-compass" data-reveal>
          <img src="/partners/konus-bussola.webp" width="720" height="720" alt={t.konusCompassAlt} loading="lazy" decoding="async" />
        </figure>
      </div>
      <article className="sightron-feature" data-brand-id="sightron"><div className="partner-identity tone-light"><Mark id="sightron" /></div><div><p className="partner-status">{t.representationLabel} · {t.usaOrigin}</p><h3>Sightron</h3><p>{t.sightronText}</p></div></article>
    </div>
    <div className="brand-network shell"><div className="brand-network-heading"><p className="eyebrow">{t.brandNetworkLabel}</p><h3><Lines text={t.brandNetworkHeading} /></h3><p>{t.brandNetworkIntro}</p></div><BrandDirectory t={t} /></div>
  </section>;
}

export function OwnerArchive({ t }) {
  const fairPhotos = ownerArchive.filter(item => item.format === 'fair');
  const ghostGroup = ownerArchive.find(item => item.id === 'ghost-group');
  return <section className="owner-archive shell" aria-labelledby="owner-archive-heading"><div className="archive-intro"><p className="eyebrow">{t.archiveLabel}</p><h3 id="owner-archive-heading"><Lines text={t.archiveHeading} /></h3><p>{t.archiveText}</p></div>
    <div className="archive-collection">
      <div className="archive-fair-pair">{fairPhotos.map(photo => <ArchivePhoto key={photo.id} photo={photo} t={t} className="archive-photo--fair" />)}</div>
      <ArchivePhoto photo={ghostGroup} t={t} className="archive-photo--group" />
    </div>
  </section>;
}
