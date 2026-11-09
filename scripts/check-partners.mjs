import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { company, companySchema } from '../src/company.js';
import { partners, ownerArchive } from '../src/data/partners.js';

const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'pt-BR' });
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
  assert.equal(await page.locator('.archive-photo').count(), 0, 'No fake visit photographs or empty frames');
  await page.locator('.brand-carousel').scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  const active = () => page.locator('.brand-carousel-caption h3').textContent();
  await page.waitForFunction(() => document.querySelector('.brand-carousel-caption h3')?.textContent !== 'Ghost Holster', undefined, { timeout: 8000 });
  await page.getByRole('button', { name: 'Pausar movimento', exact: true }).click();
  const stopped = await active();
  await page.waitForTimeout(5700);
  assert.equal(await active(), stopped, 'The pause control stops automatic changes');
  for (const brand of partners) {
    await page.getByRole('button', { name: 'Conhecer ' + brand.name, exact: true }).click();
    assert.equal(await active(), brand.name);
    assert.equal(await page.locator('.brand-orbit-slide[data-active=true] img').getAttribute('src'), '/partners/' + brand.id + '.webp');
    await page.locator('.brand-orbit-slide[data-active=true] img').evaluate(image => image.decode());
  }
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  assert.equal(await active(), partners[0].name, 'The carousel wraps continuously');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.brand-carousel').scrollIntoViewIfNeeded();
  await page.waitForTimeout(5700);
  assert.equal(await active(), partners[0].name, 'Reduced motion disables automatic rotation');
  assert.equal(await page.getByRole('button', { name: 'Pausar movimento', exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  await page.close();
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await mobile.goto(base + '/?lang=pt', { waitUntil: 'networkidle' });
  const orbit = mobile.locator('.brand-orbit');
  await orbit.scrollIntoViewIfNeeded();
  await orbit.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 280, clientY: 350 });
  await orbit.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 180, clientY: 355 });
  assert.equal(await mobile.locator('.brand-carousel-caption h3').textContent(), partners[1].name, 'Touch swipe changes the brand');
  await orbit.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 180, clientY: 355 });
  await orbit.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 190, clientY: 470 });
  assert.equal(await mobile.locator('.brand-carousel-caption h3').textContent(), partners[1].name, 'Vertical gestures do not change the brand');
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await mobile.close();
  for (const language of ['pt', 'it', 'en', 'es']) {
    const compact = await browser.newPage({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' });
    await compact.goto(base + '/?lang=' + language, { waitUntil: 'networkidle' });
    const heights = await compact.evaluate(async () => {
      const measured = [];
      for (const button of document.querySelectorAll('.brand-index button')) {
        button.click(); await new Promise(requestAnimationFrame);
        measured.push(document.querySelector('.brand-carousel-caption').getBoundingClientRect().height);
      }
      return measured;
    });
    assert.ok(Math.max(...heights) - Math.min(...heights) < 1, 'Changing brands must not shift the page in ' + language);
    await compact.close();
  }
  console.log('Partner identities, all twelve logos, headquarters/schema, autoplay/pause, reduced motion and touch controls passed.');
} finally { await browser.close(); }
