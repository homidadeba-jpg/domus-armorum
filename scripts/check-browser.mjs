import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, colorScheme: 'dark' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5187', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.locator('h1').innerText(), /DOMUS/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow');
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
    assert.equal(await page.locator('.floating-whatsapp').getAttribute('href'), 'https://wa.me/5545999794330');
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
  await writeFile('artifacts/browser-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
