export const company = {
  name: 'Domus Armorum', legalName: 'AWM Armas e Munições LTDA',
  url: 'https://domus-armorum.vercel.app/',
  street: 'Rua Souza Naves, 3983', suite: 'Sala 605', district: 'Centro',
  city: 'Cascavel', state: 'Paraná', stateCode: 'PR', postalCode: '85810-070',
  phone: '+55 45 99979-4330', phoneDisplay: '(45) 99979-4330', phoneHref: 'tel:+5545999794330',
  email: 'domusarmorum@gmail.com',
  whatsapp: 'https://wa.me/5545999794330', whatsappDisplay: '(45) 99979-4330',
  map: 'https://www.google.com/maps/search/?api=1&query=Rua%20Souza%20Naves%203983%20Centro%20Cascavel%20PR%2085810-070',
};

export const companySchema = {
  '@context': 'https://schema.org', '@type': 'Store', '@id': company.url + '#matriz',
  name: company.name, legalName: company.legalName, url: company.url,
  image: company.url + 'brand/social-06afef2a.jpg',
  telephone: '+5545999794330', email: company.email,
  address: { '@type': 'PostalAddress', streetAddress: 'Rua Souza Naves, 3983, sala 605 — Centro', addressLocality: company.city, addressRegion: company.stateCode, postalCode: company.postalCode, addressCountry: 'BR' },
  sameAs: ['https://www.instagram.com/domus.armorum/'],
};
