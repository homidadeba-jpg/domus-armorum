import './italy-experiences.css';

function ExperienceText({ title, text, className = '' }) {
  return <article className={className} data-reveal>
    <span className="experience-diamond" aria-hidden="true" />
    <h3>{title}</h3><p>{text}</p>
  </article>;
}

export function ItalyExperiences({ t }) {
  return <div className="italy-body shell">
    <div className="italy-intro"><div className="italy-intro-inner">
      <p className="eyebrow" data-reveal>{t.italyLabel}</p>
      <h2 id="italy-heading" data-reveal>{t.italyHeading.split('\n').map((line, i) => <span className="italy-heading-line" key={i}>{line}</span>)}</h2>
      <p data-reveal>{t.italyIntro}</p>
      <div className="italy-signature"><span className="italian-flag" aria-hidden="true"><i /><i /><i /></span><span>{t.world}</span></div>
    </div></div>
    <div className="experience-list">
      <figure className="experience-photo experience-photo--training">
        <img src="/experiences/treinamento-fuzil.webp" alt={t.trainingPhoto} width="1600" height="1067" loading="lazy" decoding="async" />
      </figure>
      <ExperienceText title={t.trainingTitle} text={t.trainingText} className="experience-training-copy" />
      <ExperienceText title={t.cultureTitle} text={t.cultureText} />
      <div className="experience-table">
        <ExperienceText title={t.foodTitle} text={t.foodText} />
        <figure className="experience-photo experience-photo--food">
          <img src="/experiences/gastronomia-acervo-domus.webp" alt={t.foodPhoto} width="1000" height="1230" loading="lazy" decoding="async" />
        </figure>
      </div>
      <ExperienceText title={t.connectionTitle} text={t.connectionText} />
      <p className="experience-note">{t.italyNote}</p>
    </div>
  </div>;
}
