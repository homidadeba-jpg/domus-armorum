import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}), headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:5187';
const report = [];
async function inkBounds(buffer) {
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, right = 0, top = info.height, bottom = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 3;
    if (data[i] > 190 && data[i + 1] > 190 && data[i + 2] > 190) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  return { left, right, top, bottom };
}
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale: 'pt-BR', isMobile: width === 390, hasTouch: width === 390 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let release;
    const blocked = new Promise(resolve => { release = resolve; });
    await page.route(/brand-scene[^/]*\.js(?:\?.*)?$/, async route => { await blocked; await route.continue(); });
    await page.goto(base + '/?lang=pt', { waitUntil: 'domcontentloaded' });
    await page.locator('.scene-fallback').evaluate(image => image.decode());
    assert.equal(await page.locator('[data-scene]').getAttribute('data-scene'), 'loading');
    await page.waitForTimeout(1000);
    const before = await page.locator('.brand-scene').screenshot({ path: `artifacts/handoff-${width}-before.png` });
    release();
    await page.waitForFunction(() => document.querySelector('[data-scene]')?.dataset.scene === 'ready');
    await page.waitForTimeout(450);
    const after = await page.locator('.brand-scene').screenshot({ path: `artifacts/handoff-${width}-after.png` });
    const initialBounds = await inkBounds(before), renderedBounds = await inkBounds(after);
    for (const key of Object.keys(initialBounds)) assert.ok(Math.abs(initialBounds[key] - renderedBounds[key]) <= 3, `No ${key} jump during WebGL handoff at ${width}px`);
    const pose = () => page.locator('.scene-fallback').evaluate(image => image.style.transform);
    const idle = await pose();
    await page.waitForTimeout(700);
    assert.equal(await pose(), idle, 'No automatic spin after loading');
    await page.locator('.scene-canvas').dispatchEvent('pointermove', { pointerType: 'touch', clientX: 20, clientY: 20 });
    await page.waitForTimeout(100);
    assert.equal(await pose(), idle, 'Touch scrolling is not interpreted as a mouse tilt');
    await page.evaluate(() => scrollTo(0, 220));
    await page.waitForTimeout(650);
    assert.notEqual(await pose(), idle, 'Scrolling drives the emblem');
    await page.locator('.brand-scene').screenshot({ path: `artifacts/handoff-${width}-scrolled.png` });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(850);
    const returned = await inkBounds(await page.locator('.brand-scene').screenshot());
    for (const key of Object.keys(renderedBounds)) assert.ok(Math.abs(returned[key] - renderedBounds[key]) <= 3, 'The emblem returns without a jump');
    const wa = page.locator('.whatsapp-original');
    await wa.evaluate(image => image.decode());
    const box = await wa.boundingBox();
    assert.equal(box.width, box.height, 'WhatsApp occupies a square without stretching');
    assert.match(await wa.getAttribute('src'), /whatsapp\.svg$/);
    assert.match(await page.locator('#italia').innerText(), /organiza tours para a Itália/);
    assert.match(await page.locator('#italia').innerText(), /fábricas de armas e munições/);
    assert.deepEqual(errors, []);
    report.push({ width, initialBounds, renderedBounds, returned, result: 'passed' });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('artifacts/handoff-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
