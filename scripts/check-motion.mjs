import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const launch = { ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true };
const browser = await chromium.launch(launch);
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
const report = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, locale: 'pt-BR', colorScheme: 'dark' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/?lang=pt', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'ready');
    await page.waitForTimeout(2600);
    assert.equal(await page.locator('.scene-canvas canvas').count(), 1, 'One live WebGL canvas');
    assert.equal(await page.locator('html').getAttribute('data-scroll-mode'), 'native');
    assert.equal(await page.locator('#marcas').isVisible(), true);
    assert.equal(await page.locator('#italia').isVisible(), true);
    assert.match(await page.locator('#italia').innerText(), /tours|Tours/);
    const scene = page.locator('.brand-scene');
    const before = await scene.screenshot();
    const box = await scene.boundingBox();
    await page.mouse.move(box.x + box.width * .9, box.y + box.height * .65);
    await page.waitForTimeout(900);
    const after = await scene.screenshot();
    const a = await sharp(before).removeAlpha().raw().toBuffer();
    const b = await sharp(after).removeAlpha().raw().toBuffer();
    let difference = 0;
    for (let i = 0; i < a.length; i++) difference += Math.abs(a[i] - b[i]);
    assert.ok(difference / a.length > .05, 'The 3D piece must respond visually to the pointer');
    await page.screenshot({ path: `artifacts/motion-${width}-hero.png` });
    await page.mouse.wheel(0, 700);
    await page.waitForFunction(() => scrollY > 300);
    assert.equal(Math.round(await page.locator('header').evaluate(el => el.getBoundingClientRect().top)), 0, 'Header remains fixed during native scrolling');
    const target = page.locator('.world-links a[href="#italia"]');
    await target.click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#italia').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 12);
    assert.ok(await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom) < 120, 'Anchor offset leaves the heading below the header');
    await page.locator('.italy-landscape img').evaluate(image => image.decode());
    await page.screenshot({ path: `artifacts/motion-${width}-italy.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'reduced');
    assert.equal(await page.locator('.scene-canvas canvas').count(), 0, 'Reduced motion disposes WebGL');
    assert.equal(await page.locator('html').getAttribute('data-scroll-mode'), null, 'Reduced motion removes the anchor animation controller');
    await page.evaluate(() => scrollTo(0, 0));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'ready');
    assert.equal(await page.locator('.scene-canvas canvas').count(), 1, 'Preference changes do not duplicate the canvas');
    // Simulate a GPU context loss: the original mark must remain available.
    await page.locator('.scene-canvas canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context')?.loseContext());
    await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'fallback');
    assert.equal(await page.locator('.scene-fallback').evaluate(el => el.complete && el.naturalWidth > 0), true);
    assert.deepEqual(errors, []);
    report.push({ width, pointerDifference: difference / a.length, checks: ['live Three.js scene', 'pointer response', 'native wheel and Lenis anchors', 'fixed header', 'Italy photograph', 'live reduced-motion cleanup', 'context-loss fallback'], result: 'passed' });
    await context.close();
  }
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const threeRequests = [];
  page.on('request', request => { if (/brand-scene/.test(request.url())) threeRequests.push(request.url()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.deepEqual(threeRequests, [], 'Reduced-motion visitors do not download the 3D implementation');
  await context.close();
} finally { await browser.close(); }
const noGpu = await chromium.launch({ ...launch, args: ['--disable-webgl'] });
try {
  const page = await noGpu.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'fallback');
  assert.equal(await page.locator('.scene-fallback').evaluate(el => el.complete && el.naturalWidth > 0), true);
} finally { await noGpu.close(); }
await writeFile('artifacts/motion-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
