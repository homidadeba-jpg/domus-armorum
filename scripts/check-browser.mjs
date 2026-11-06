import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { translations, languages } from '../src/translations.js';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const report = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, colorScheme: 'dark', locale: 'pt-BR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5187', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.locator('h1').innerText(), /DOMUS/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow');
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    assert.equal(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true, 'Missing images');
    await page.screenshot({ path: `artifacts/${viewport.width}-dark.png`, fullPage: true });
    if (viewport.width < 768) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await assert.doesNotReject(() => page.getByRole('navigation').waitFor({ state: 'visible' }));
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded'), 'false');
      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await page.getByRole('navigation').getByRole('link', { name: 'A Domus' }).click();
      assert.equal(await page.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded'), 'false');
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
    await page.getByRole('button', { name: 'Ativar tema claro' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'Theme persistence');
    await page.screenshot({ path: `artifacts/${viewport.width}-light.png`, fullPage: true });
    await page.locator('.floating-whatsapp').evaluate(el => el.addEventListener('click', event => event.preventDefault()));
    await page.locator('.floating-whatsapp').click();
    const whatsappUrl = new URL(await page.locator('.floating-whatsapp').getAttribute('href'));
    assert.equal(whatsappUrl.pathname, '/5545999794330');
    assert.equal(whatsappUrl.searchParams.get('text'), 'Olá, vim pelo site.');
    assert.equal(await page.locator('.floating-whatsapp').getAttribute('class').then(v => v.includes('is-opening')), true);
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
    assert.equal(await page.locator('.floating-whatsapp').getAttribute('class').then(v => v.includes('is-opening')), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    assert.equal(await page.locator('.story-copy').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.deepEqual(errors, []);
    report.push({ viewport, result: 'passed', checks: ['images', 'responsive width', 'scroll return', 'theme persistence', 'menu', 'WhatsApp feedback and recovery', 'reduced motion', 'no JavaScript errors'] });
    await context.close();
  }
  const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:5187';
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    for (const { code, tag } of languages) {
      const context = await browser.newContext({ viewport, locale: tag, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${baseUrl}/?campaign=test#contato`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), tag);
      assert.equal(await page.locator('.language-switch select').inputValue(), code);
      assert.equal(await page.title(), translations[code].pageTitle);
      assert.equal(await page.locator('.language-switch option').count(), 4);
      assert.equal(await page.evaluate(() => localStorage.getItem('domus-language')), null, 'Automatic detection must not save a manual preference');
      const address = page.locator('.store-address');
      assert.match(await address.innerText(), /Via Alessandro Volta, 90/);
      assert.match(await address.innerText(), /25063 Gardone Val Trompia BS/);
      const map = new URL(await address.locator('a').getAttribute('href'));
      assert.equal(map.hostname, 'www.google.com');
      assert.match(map.searchParams.get('query'), /Via Alessandro Volta, 90/);
      assert.doesNotMatch(await page.locator('body').innerText(), /Cascavel|Paraná|CNPJ|AWM/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${code} at ${viewport.width}`);
      await page.screenshot({ path: `artifacts/${viewport.width}-${code}-address.png` });
      const selected = code === 'it' ? 'pt' : 'it';
      await page.locator('.language-switch select').selectOption(selected);
      assert.equal(await page.locator('html').getAttribute('lang'), languages.find(item => item.code === selected).tag);
      assert.equal(await page.evaluate(() => localStorage.getItem('domus-language')), selected);
      assert.equal(new URL(page.url()).searchParams.get('campaign'), 'test');
      assert.equal(new URL(page.url()).hash, '#contato');
      assert.equal(new URL(await page.locator('.floating-whatsapp').getAttribute('href')).searchParams.get('text'), translations[selected].greeting);
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.language-switch select').inputValue(), selected, 'Manual selection persists');
      await page.goto(`${baseUrl}/?lang=en`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.language-switch select').inputValue(), 'en', 'Explicit URL overrides saved selection');
      await page.evaluate(() => { history.pushState({}, '', '/?campaign=back'); window.dispatchEvent(new PopStateEvent('popstate')); });
      assert.equal(await page.locator('.language-switch select').inputValue(), selected, 'History restores saved preference');
      assert.deepEqual(errors, []);
      report.push({ viewport, language: code, result: 'passed', checks: ['browser language', 'store address and map', 'translated content', 'responsive width', 'manual selection', 'preference persistence', 'URL override', 'history restoration'] });
      await context.close();
    }
  }
  const fallbackContext = await browser.newContext({ locale: 'de-DE' });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }); });
  await fallbackPage.goto(`${baseUrl}/?lang=unknown`, { waitUntil: 'networkidle' });
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'it-IT');
  await fallbackPage.locator('.language-switch select').selectOption('es');
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'es');
  await fallbackContext.close();
  await writeFile('artifacts/browser-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
