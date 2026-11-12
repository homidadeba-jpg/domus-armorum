import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { metadata, structuredData, siteUrl, llmsText } from '../src/seo.js';

const escapeAttribute = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const server = await createServer({
  configFile: false, mode: 'production', logLevel: 'error', appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  ssr: { noExternal: ['gsap', '@gsap/react'] },
});

try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const content = render();
  if (!content.includes('Rua Souza Naves') || !content.includes('Ghost Holster')) {
    throw new Error('The built page must contain the actual company content.');
  }
  let html = await readFile('dist/index.html', 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Page template root not found.');
  html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(metadata.title)}</title>`)
    .replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${escapeAttribute(siteUrl)}" />`)
    .replace(/<script id="company-schema"[\s\S]*?<\/script>/,
      `<script id="company-schema" type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>`);
  for (const [attribute, key, value] of [
    ['name', 'description', metadata.description], ['property', 'og:url', siteUrl],
    ['property', 'og:title', metadata.title], ['property', 'og:description', metadata.description],
    ['property', 'og:image', metadata.image], ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description], ['name', 'twitter:image', metadata.image],
  ]) {
    const pattern = new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*\\/>`);
    if (!pattern.test(html)) throw new Error(`Missing metadata: ${key}`);
    html = html.replace(pattern, `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`);
  }
  html = html.replace('</head>', '    <meta name="robots" content="index, follow, max-image-preview:large" />\n  </head>');
  await writeFile('dist/index.html', html);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
  await writeFile('dist/llms.txt', llmsText);
  console.log('SEO: existing page prerendered; JSON-LD, robots.txt, sitemap.xml and llms.txt generated.');
} finally {
  await server.close();
}
