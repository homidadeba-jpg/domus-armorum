import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const report = [];
await mkdir('artifacts', { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale: 'pt-BR' });
    await page.goto((process.env.TEST_URL || 'http://127.0.0.1:5187') + '/?lang=pt', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2400);
    for (const [section, selector] of [['store', '.store-showcase'], ['globe', '.journey-cartography'], ['after', '.italy-landscape']]) {
      await page.evaluate(s => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - innerHeight * .6), selector);
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        window.scrollProbe = { before: scrollY, prevented: null };
        window.addEventListener('wheel', event => queueMicrotask(() => { scrollProbe.prevented = event.defaultPrevented; }), { once: true });
      });
      await page.mouse.move(width * .5, 300);
      await page.mouse.wheel(0, 240);
      await page.waitForTimeout(750);
      const measured = await page.evaluate(() => ({ distance: scrollY - scrollProbe.before, prevented: scrollProbe.prevented }));
      assert.equal(measured.prevented, false, 'Wheel input remains under browser control in ' + section);
      assert.ok(Math.abs(measured.distance - 240) <= 3, 'Equal wheel input preserves scroll distance in ' + section);
      report.push({ width, section, ...measured });
    }
    // Test a quick pass through the map: no catch-up delay or hold after input has stopped.
    await page.evaluate(() => {
      const map = document.querySelector('.journey-cartography');
      scrollTo(0, map.getBoundingClientRect().top + scrollY - innerHeight * .32);
    });
    await page.waitForTimeout(80);
    assert.ok(await page.locator('.connection-route').evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset)) < .01, 'The route reaches Italy without a delayed scrub');
    const map = await page.locator('.journey-cartography').boundingBox();
    assert.ok(map.y > 90 && map.y + map.height < page.viewportSize().height, 'The complete globe remains visible at arrival');
    await page.evaluate(() => {
      const map = document.querySelector('.journey-cartography');
      scrollTo(0, map.getBoundingClientRect().top + scrollY - innerHeight * .86);
    });
    await page.waitForTimeout(80);
    assert.ok(await page.locator('.connection-route').evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset)) > .99, 'Scrolling back immediately restores the route origin');
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('artifacts/scroll-flow-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
