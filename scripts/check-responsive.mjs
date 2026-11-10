import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
const report = [];
await mkdir('artifacts', { recursive: true });
try {
  for (const language of ['pt', 'it', 'en', 'es']) {
    const page = await browser.newPage({ reducedMotion: 'reduce', hasTouch: true });
    await page.goto(base + '/?lang=' + language, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 390, 430, 600, 768, 820, 980, 981, 1024, 1280, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const layout = await page.evaluate(() => {
        const textOverflow = [];
        for (const element of document.querySelectorAll('h1,h2,h3,h4,h5,p,address,dt,dd,.quiet-link,.navigation a')) {
          if (!element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
          const range = document.createRange(); range.selectNodeContents(element);
          const rect = range.getBoundingClientRect();
          if (rect.left < -2 || rect.right > innerWidth + 2 || element.scrollWidth > element.clientWidth + 3) textOverflow.push(element.textContent.slice(0, 65));
        }
        const collisions = [];
        for (const [a, b] of [['.ghost-identity', '.ghost-image'], ['.journey-editorial', '.journey-cartography'], ['.konus-feature', '.konus-image'], ['.contact-title', '.contact-details'], ['.supply-heading', '.supply-logos']]) {
          const x = document.querySelector(a).getBoundingClientRect(), y = document.querySelector(b).getBoundingClientRect();
          if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 3 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 3) collisions.push([a, b]);
        }
        return { pageOverflow: document.documentElement.scrollWidth > innerWidth, textOverflow, collisions };
      });
      assert.equal(layout.pageOverflow, false, 'Page overflow: ' + language + ', ' + width);
      assert.deepEqual(layout.textOverflow, [], 'Text clipped inside its block: ' + language + ', ' + width);
      assert.deepEqual(layout.collisions, [], 'Overlapping sections: ' + language + ', ' + width);
      for (const selector of ['.theme-toggle', '.language-switch', '.menu-toggle']) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          assert.ok(box.width >= 44 && box.height >= 44, 'Touch target: ' + selector + ', ' + width);
        }
      }
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const obscured = await page.evaluate(() => {
        const button = document.querySelector('.floating-whatsapp').getBoundingClientRect();
        return [...document.querySelectorAll('footer a')].filter(element => {
          const r = element.getBoundingClientRect();
          return Math.min(r.right, button.right) > Math.max(r.left, button.left) && Math.min(r.bottom, button.bottom) > Math.max(r.top, button.top);
        }).map(element => element.className);
      });
      assert.deepEqual(obscured, [], 'Floating WhatsApp obscures a footer link: ' + language + ', ' + width);
      report.push({ language, width, result: 'passed' });
    }
    await page.close();
  }
  for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    const page = await browser.newPage({ viewport: size, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
    await page.goto(base + '/?lang=pt', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
    const bounds = await page.locator('nav').boundingBox();
    const header = await page.locator('header').boundingBox();
    assert.ok(bounds.y >= header.height - 1 && bounds.y + bounds.height <= size.height + 1, 'Menu stays inside the short viewport');
    await page.locator('nav a').last().scrollIntoViewIfNeeded();
    assert.equal(await page.locator('nav a').last().isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.screenshot({ path: `artifacts/responsive-${size.width}-menu-closed.png` });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('artifacts/responsive-report.json', JSON.stringify(report, null, 2));
console.log('Responsive layout passed: 56 language/width combinations, touch targets, footer links and portrait/landscape menus.');
