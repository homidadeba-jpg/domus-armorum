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
  assert.equal(ownerArchive.length, 3);
  assert.equal(await page.locator('.archive-photo').count(), 0, 'Only actual owner photographs may fill the archive slots');
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
  console.log('Partner group memberships, twelve unique logos, image bounds, headquarters/schema and internal links passed in four languages.');
} finally { await browser.close(); }
