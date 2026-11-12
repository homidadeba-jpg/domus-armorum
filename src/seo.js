import { company, companySchema } from './company.js';
import { brandCopy } from './brand-copy.js';
import { partners } from './data/partners.js';

export const siteUrl = company.url;
export const metadata = {
  title: brandCopy.pt.pageTitle,
  description: brandCopy.pt.description,
  image: new URL('brand/social-06afef2a.jpg', siteUrl).href,
};

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      ...companySchema,
      description: metadata.description,
      contactPoint: {
        '@type': 'ContactPoint', telephone: companySchema.telephone,
        email: company.email, contactType: 'Atendimento', url: siteUrl + '#contato',
      },
    },
    {
      '@type': 'WebSite', '@id': siteUrl + '#website',
      url: siteUrl, name: company.name,
      publisher: { '@id': companySchema['@id'] },
      inLanguage: ['pt-BR', 'it', 'en', 'es'],
    },
    {
      '@type': 'WebPage', '@id': siteUrl + '#pagina', url: siteUrl,
      name: metadata.title, description: metadata.description, inLanguage: 'pt-BR',
      isPartOf: { '@id': siteUrl + '#website' },
      about: { '@id': companySchema['@id'] },
      mainEntity: { '@id': companySchema['@id'] },
      primaryImageOfPage: { '@type': 'ImageObject', url: metadata.image, width: 1200, height: 630 },
    },
    {
      '@type': 'Service', '@id': siteUrl + '#experiencias-italia',
      name: 'Tours e experiências na Itália', description: brandCopy.pt.italyIntro,
      url: siteUrl + '#italia', provider: { '@id': companySchema['@id'] },
      areaServed: { '@type': 'Country', name: 'Itália' },
    },
  ],
};

export const llmsText = `# Domus Armorum

> Empresa sediada em Cascavel, Paraná, com representações de marcas e tours na Itália que incluem treinamentos, visitas a fábricas, gastronomia e cultura.

## Empresa e contato

- Razão social: ${company.legalName}.
- CNPJ: ${company.taxId}.
- Fundação: ${company.foundingDate}.
- Matriz: ${company.street}, ${company.suite}, ${company.district}, ${company.city}–${company.stateCode}, CEP ${company.postalCode}, Brasil.
- Telefone/WhatsApp: ${company.phoneDisplay}.
- E-mail: ${company.email}.
- [Informações e contato](${siteUrl}#contato): endereço da matriz e canais oficiais.
- [Instagram oficial](https://www.instagram.com/domus.armorum/): perfil da empresa.

## Representações e distribuição

- [Marcas da Domus](${siteUrl}#marcas): Ghost Holster e Konus Optics são apresentadas como representações exclusivas no Brasil, conforme informação do proprietário. A Sightron é apresentada como representação, sem exclusividade.
- Demais marcas de distribuição: ${partners.filter(brand => brand.relation === 'distribution').map(brand => brand.name).join(', ')}.
- [Localizador da Ghost](https://ghostinternational.com/dealers/): consulta externa ao cadastro de representantes da marca.
- A presença de uma marca no site não informa estoque, valores ou disponibilidade de produtos.

## Experiências e história

- [Tours na Itália](${siteUrl}#italia): cursos e treinamentos com parceiros locais, visitas a fábricas de armas e munições, gastronomia e cultura italiana. Atividades dependem da programação e disponibilidade dos parceiros; não há calendário ou preço anunciado.
- [História da empresa](${siteUrl}#historia): trajetória da Domus Armorum desde 2017, com matriz em Cascavel.
- O endereço da matriz fica no Brasil. As experiências na Itália não representam um endereço de loja na Itália.
- O site oferece versões em português, italiano, inglês e espanhol.
`;
