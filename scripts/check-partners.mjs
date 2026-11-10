import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { company, companySchema } from '../src/company.js';
import { partners, ownerArchive } from '../src/data/partners.js';

const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'pt-BR', reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/?lang=pt', { waitUntil: 'networkidle' });
  assert.deepEqual(JSON.parse(await page.locator('#company-schema').textContent()), companySchema);
  assert.match(await page.locator('.store-location').innerText(), /Rua Souza Naves, 3983[\s\S]*Sala 605[\s\S]*Centro[\s\S]*Cascavel[\s\S]*85810-070/);
  assert.equal(await page.locator('a[href="' + company.phoneHref + '"]').textContent(), company.phoneDisplay);
  assert.equal(await page.locator('a[href="mailto:' + company.email + '"]').count(), 1);
  assert.match(await page.locator('.ghost-identity').innerText(), /representante exclusiva da Ghost Holster no Brasil/);
  assert.match(await page.locator('.konus-feature').innerText(), /representação exclusiva/);
  assert.doesNotMatch(await page.locator('.sightron-feature').innerText(), /exclusiv/i);
  assert.doesNotMatch(await page.locator('body').innerText(), /Sabatti|foto em breve/i);
  const suppliedPhotos = ownerArchive.filter(photo => photo.image);
  assert.equal(await page.locator('[data-archive-id]').count(), suppliedPhotos.length, 'Only supplied owner photographs fill the archive');
  for (const photo of suppliedPhotos) {
    const image = page.locator('[data-archive-id="' + photo.id + '"] img');
    assert.equal(await image.getAttribute('src'), photo.image);
    await image.evaluate(async image => { image.loading = 'eager'; await image.decode(); });
    assert.deepEqual(await image.evaluate(image => [image.naturalWidth, image.naturalHeight]), [photo.width, photo.height]);
  }
  assert.equal(await page.locator('[data-archive-id="italy-fair"]').count(), 0, 'The unidentified fair slot stays omitted');
  assert.equal(await page.locator('#italia .owner-archive').count(), 1, 'The Italy archive belongs inside the Italy navigation section');
  assert.equal(await page.locator('#marcas .owner-archive').count(), 0);
  assert.equal(await page.locator('.ghost-institutional img').getAttribute('src'), '/partners/ghost-detail.webp');
  assert.equal(await page.locator('.konus-material img').getAttribute('src'), '/partners/konus-outdoor.webp');
  assert.equal(await page.locator('.experience-photo--training img').getAttribute('src'), '/experiences/treinamento-fuzil.webp');
  assert.deepEqual(await page.locator('[data-brand-id]').evaluateAll(nodes => nodes.map(node => node.dataset.brandId)), partners.map(brand => brand.id));
  for (const [group, ids] of Object.entries({ components: ['hornady', 'cbc', 'federal', 'cci', 'fiocchi'], brazil: ['dfa', 'fireeagle'], accessories: ['topgun', 'raoni'] })) {
    assert.deepEqual(await page.locator('.supply-group--' + group + ' [data-brand-id]').evaluateAll(nodes => nodes.map(node => node.dataset.brandId)), ids);
  }
  for (const brand of partners) {
    const card = page.locator('[data-brand-id="' + brand.id + '"]');
    const logo = card.locator('img.partner-mark');
    assert.equal(await logo.getAttribute('src'), '/partners/' + brand.id + '.webp');
    await logo.evaluate(async image => { image.loading = 'eager'; await image.decode(); });
  }
  assert.equal(await page.locator('.brand-index,.brand-relations,.brand-carousel,.store-showcase,#activities-heading').count(), 0, 'The duplicate lists and generic shop block are removed');
  assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1)))), [], 'Internal links still have destinations');
  await page.close();
  for (const language of ['pt', 'it', 'en', 'es']) {
    const compact = await browser.newPage({ reducedMotion: 'reduce' });
    compact.on('pageerror', error => errors.push(error.message));
    await compact.goto(base + '/?lang=' + language, { waitUntil: 'networkidle' });
    await compact.locator('.partner-directory img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    for (const width of [320, 390, 768, 1024, 1440]) {
      await compact.setViewportSize({ width, height: 1000 });
      const escaped = await compact.locator('.partner-card').evaluateAll(cards => cards.filter(card => {
        const logo = card.querySelector('.partner-logo').getBoundingClientRect();
        const image = card.querySelector('img').getBoundingClientRect();
        const label = card.querySelector('figcaption').getBoundingClientRect();
        return image.left < logo.left - 1 || image.right > logo.right + 1 || image.top < logo.top - 1 || image.bottom > logo.bottom + 1 || (Math.min(image.right, label.right) > Math.max(image.left, label.left) && Math.min(image.bottom, label.bottom) > Math.max(image.top, label.top));
      }).map(card => card.dataset.brandId));
      assert.deepEqual(escaped, [], 'Logos stay inside their frames and clear of captions: ' + language + ', ' + width);
    }
    await compact.close();
  }
  assert.deepEqual(errors, []);
  const delayed = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  let releaseImages;
  const imageGate = new Promise(resolve => { releaseImages = resolve; });
  const photoPaths = ownerArchive.filter(photo => photo.image).map(photo => photo.image);
  await delayed.route('**/experiences/*.webp', async route => {
    if (photoPaths.includes(new URL(route.request().url()).pathname)) await imageGate;
    await route.continue();
  });
  await delayed.goto(base + '/?lang=pt', { waitUntil: 'domcontentloaded' });
  await delayed.locator('[data-archive-id] img').first().waitFor();
  await delayed.locator('[data-archive-id] img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await delayed.evaluate(() => document.fonts.ready);
  const mapPosition = () => delayed.locator('.journey-cartography').evaluate(element => element.getBoundingClientRect().top + scrollY);
  const reservedPosition = await mapPosition();
  releaseImages();
  await delayed.locator('[data-archive-id] img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  assert.ok(Math.abs(await mapPosition() - reservedPosition) < 1, 'Loading the archive must not shift the globe or invalidate its scroll timing');
  await delayed.close();
  console.log('Partner group memberships, twelve unique logos, image bounds, headquarters/schema and internal links passed in four languages.');
} finally { await browser.close(); }
