import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { translations, languages } from '../src/translations.js';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
const report = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 1000 : 844 }, locale: 'pt-BR', reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/?lang=pt', { waitUntil: 'networkidle' });
    const scrollToProgress = async progress => {
      await page.evaluate(p => {
        const rect = document.querySelector('.journey-stage').getBoundingClientRect();
        const top = rect.top + scrollY;
        const start = top - innerHeight * .78;
        const end = top + rect.height - innerHeight * .45;
        scrollTo(0, start + (end - start) * p);
      }, progress);
      await page.waitForTimeout(1100);
    };
    const routeState = () => page.evaluate(() => ({
      offset: parseFloat(getComputedStyle(document.querySelector('.connection-route')).strokeDashoffset),
      marker: document.querySelector('.connection-traveller').getAttribute('transform'),
    }));
    await scrollToProgress(.05);
    const beginning = await routeState();
    assert.ok(beginning.offset > .9, 'The connection starts at Brazil');
    await scrollToProgress(.55);
    const middle = await routeState();
    assert.ok(middle.offset > .15 && middle.offset < .8, 'The connection traces progressively');
    assert.notEqual(middle.marker, beginning.marker, 'Light moves along the actual route');
    await page.screenshot({ path: `artifacts/journey-${width}-moving.png` });
    await scrollToProgress(1);
    const end = await routeState();
    assert.ok(end.offset < .05, 'The connection reaches Italy');
    await page.screenshot({ path: `artifacts/journey-${width}-complete.png` });
    await scrollToProgress(.05);
    assert.ok((await routeState()).offset > .9, 'Scrolling back reverses the narrative');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal((await routeState()).offset, 0, 'Reduced motion retains the complete static map');
    assert.equal(await page.locator('.connection-map').getAttribute('role'), 'img');
    assert.equal(await page.locator('.map-origin-country').count(), 1);
    assert.equal(await page.locator('.map-destination-country').count(), 1);
    assert.deepEqual(errors, []);
    report.push({ width, beginning, middle, end, result: 'passed' });
    await page.close();
  }
  for (const width of [320, 390, 1440]) for (const { code, tag } of languages) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: tag, reducedMotion: 'reduce' });
    await page.goto(base + '/?lang=' + code, { waitUntil: 'networkidle' });
    await page.locator('.journey-stage').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.connection-map title').textContent(), translations[code].journeyMap);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${code}, ${width}`);
    if (code === 'pt' && width !== 320) {
      await page.screenshot({ path: `artifacts/journey-${width}-dark.png` });
      await page.getByRole('button', { name: translations.pt.light }).click();
      await page.screenshot({ path: `artifacts/journey-${width}-light.png` });
    }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('artifacts/journey-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
