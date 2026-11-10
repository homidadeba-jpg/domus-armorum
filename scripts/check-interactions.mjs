import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const engine=process.env.TEST_ENGINE || 'chromium';
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'&&process.env.TEST_BROWSER_CHANNEL?{channel:process.env.TEST_BROWSER_CHANNEL}:{})});
const base=process.env.TEST_URL || 'http://127.0.0.1:5187';
const report=[];await mkdir('artifacts',{recursive:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000},locale:'pt-BR',reducedMotion:'no-preference',...(width===390?{isMobile:true,hasTouch:true}:{})});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/?lang=pt',{waitUntil:'networkidle'});
  const menu=page.locator('.menu-toggle'),nav=page.locator('nav');
  assert.equal(await nav.evaluate(element=>element.inert),true);
  await menu.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.activeElement===document.querySelector('nav a'));
  assert.equal(await menu.getAttribute('aria-expanded'),'true');
  assert.equal(await nav.evaluate(element=>element.inert),false);
  assert.ok(await nav.evaluate(element=>getComputedStyle(element).transitionDuration.split(',').some(value=>parseFloat(value)>0)), 'The menu has a nonzero opening transition');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('nav')).opacity==='1');
  await page.screenshot({path:`artifacts/interactions-${engine}-${width}-menu.png`});
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  assert.equal(await nav.evaluate(element=>element.inert),true);
  assert.equal(await menu.evaluate(element=>document.activeElement===element),true);
  await nav.waitFor({state:'hidden'});
  // Repeated toggles settle to the requested state without leaving an invisible active panel.
  await menu.evaluate(element=>{element.click();element.click();element.click();});
  assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('nav')).opacity==='1');
  await page.mouse.click(8,page.viewportSize().height*.6);
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  await nav.waitFor({state:'hidden'});
  const arrow=await page.locator('.intro-scroll').boundingBox();
  assert.ok(arrow.width>=44&&arrow.height>=44,'A minimal arrow retains its touch target');
  assert.ok(page.viewportSize().height-arrow.y-arrow.height<=24,'The arrow sits near the bottom edge');
  assert.equal(await page.locator('.intro-scroll-icon').evaluate(element=>getComputedStyle(element).borderTopWidth),'0px');
  await page.screenshot({path:`artifacts/interactions-${engine}-${width}-hero.png`});
  // Pointer press gives actual feedback before its action is released.
  const box=await page.locator('.intro-playback').boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.waitForTimeout(160);
  assert.notEqual(await page.locator('.intro-playback').evaluate(element=>getComputedStyle(element).transform),'none');
  await page.mouse.up();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.intro-scroll-icon svg').evaluate(element=>element.getAnimations().length),0);
  await menu.click();
  assert.equal(await nav.evaluate(element=>getComputedStyle(element).transitionDuration),'0s');
  await page.locator('nav a[href="#italia"]').click();
  await page.waitForFunction(()=>scrollY>innerHeight);
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  if(width>980){
   await page.waitForFunction(()=>!document.querySelector('nav').hasAttribute('data-collapsible'));
   assert.equal(await nav.evaluate(element=>element.inert),false);
   assert.equal(await nav.isVisible(),true,'Desktop navigation stays available after the hero');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);report.push({engine,width,result:'passed'});await page.close();
 }
}finally{await browser.close()}
await writeFile(`artifacts/interactions-${engine}-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
