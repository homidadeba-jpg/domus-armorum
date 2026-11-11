import { InstagramLogo } from '@phosphor-icons/react';
import { company } from './company.js';

export function CompanyContact({ t }) {
  return <section className="contact contact--headquarters shell" id="contato">
    <div className="contact-title"><p className="eyebrow">{t.headquartersLabel}</p><h2 data-reveal>{t.contactHeading.split('\n').map((line, i) => <span className="contact-heading-line" key={i}>{line}</span>)}</h2><p>{t.headquartersIntro}</p><a className="quiet-link location-link" href={company.map} target="_blank" rel="noopener noreferrer">{t.mapLink}</a></div>
    <div className="contact-details" data-reveal>
      <div className="store-location"><span className="detail-label">{t.headquartersLabel}</span><address><strong>{company.street}</strong><span>{company.suite} · {company.district}</span><span>{company.city}, {company.state} · {company.stateCode}</span><span>CEP {company.postalCode} · {t.brazilOrigin}</span></address></div>
      <div className="contact-channel"><span className="detail-label">{t.phoneLabel}/WhatsApp</span><a href={company.whatsapp} target="_blank" rel="noopener noreferrer">{company.whatsappDisplay}</a></div>
      <div className="contact-channel"><span className="detail-label">{t.emailLabel}</span><a href={'mailto:' + company.email}>{company.email}</a></div>
      <a className="social-link" href="https://www.instagram.com/domus.armorum/" target="_blank" rel="noopener noreferrer"><InstagramLogo size={22} /><span>@domus.armorum</span></a>
    </div>
  </section>;
}
