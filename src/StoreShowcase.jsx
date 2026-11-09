import './store-showcase.css';

export function StoreShowcase({ t }) {
  const areas = [
    { id: 'arms', image: 'armas-contexto-a29f18f3.webp', alt: t.armsPhoto, title: t.arms, text: t.armsFirst, width: 1600, height: 1067 },
    { id: 'ammunition', image: 'municoes-contexto-e32bdbf6.webp', alt: t.ammunitionPhoto, title: t.ammunition, text: t.ammunitionFirst, width: 1600, height: 1067 },
    { id: 'equipment', image: 'equipamentos-taticos-b8b5a79e.webp', alt: t.equipmentPhoto, title: t.equipment, text: t.equipmentFirst, width: 1000, height: 1503 },
  ];
  return <div className="store-showcase">
    {areas.map(area => <article className={'store-feature store-feature--' + area.id} key={area.id}>
      <figure className="store-photo">
        <img src={'/brand/' + area.image} alt={area.alt} width={area.width} height={area.height} loading="lazy" decoding="async" />
        <figcaption>{t.experiencePhotoNote}</figcaption>
      </figure>
      <div className="store-feature-copy" data-reveal><span className="store-copy-rule" aria-hidden="true" /><h3>{area.title}</h3><p>{area.text}</p></div>
    </article>)}
  </div>;
}
