import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const asset = async (path, type) => `data:${type};base64,${(await readFile(path)).toString('base64')}`;
const logo = await asset('public/brand/domus-original.webp', 'image/webp');
const headingFont = await asset('node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-500-normal.woff2', 'font/woff2');
const bodyFont = await asset('node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2', 'font/woff2');
const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
let buffer;
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="it-IT"><head><style>
    @font-face{font-family:Barlow;src:url('${headingFont}')}@font-face{font-family:Manrope;src:url('${bodyFont}')}
    *{box-sizing:border-box}body{margin:0;background:#151715;color:#ebede5;font-family:Manrope,sans-serif}
    main{width:1200px;height:630px;display:grid;grid-template-columns:1.15fr 1fr;padding:62px 72px;gap:35px;align-items:center}
    .eyebrow{color:#c2ccac;font-size:13px;letter-spacing:2px;margin:0 0 28px}h1{font-family:Barlow,sans-serif;font-weight:500;font-size:113px;line-height:.92;letter-spacing:-1px;margin:0}h1 span{color:#c2ccac}
    .description{font-size:20px;line-height:1.6;color:#a8ada2;margin:26px 0 0}.address{font-size:12px;letter-spacing:1px;color:#a8ada2;margin-top:35px}
    .mark{height:490px;display:flex;align-items:center;justify-content:center;background:#1d201c;clip-path:polygon(12% 0,100% 0,100% 88%,88% 100%,0 100%,0 12%)}.mark img{height:400px;width:auto;filter:invert(1);mix-blend-mode:screen}
  </style></head><body><main><div><p class="eyebrow">GARDONE VAL TROMPIA, ITALIA · DAL 2017</p><h1>DOMUS<br><span>ARMORUM.</span></h1><p class="description">Armi, munizioni e<br>attrezzature e accessori tattici.</p><p class="address">domus-armorum.vercel.app</p></div><div class="mark"><img src="${logo}" alt="Emblema originale di Domus Armorum"></div></main></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await document.querySelector('img').decode(); });
  buffer = await page.screenshot({ type: 'jpeg', quality: 92 });
} finally { await browser.close(); }
const name = `social-${createHash('sha256').update(buffer).digest('hex').slice(0, 8)}.jpg`;
await writeFile(`public/brand/${name}`, buffer);
let html = await readFile('index.html', 'utf8');
const url = `https://domus-armorum.vercel.app/brand/${name}`;
html = html.replace(/(<meta property="og:image" content=")[^"]+(" \/>)/, `$1${url}$2`);
html = html.replace(/(<meta name="twitter:image" content=")[^"]+(" \/>)/, `$1${url}$2`);
await writeFile('index.html', html);
console.log(`Social cover ready: ${name} (1200 × 630, ${buffer.length} bytes)`);
