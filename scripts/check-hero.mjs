import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const engine=process.env.TEST_ENGINE || 'chromium';
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium' && process.env.TEST_BROWSER_CHANNEL?{channel:process.env.TEST_BROWSER_CHANNEL}:{})});
const base=process.env.TEST_URL || 'http://127.0.0.1:5187';
const report=[];await mkdir('artifacts',{recursive:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000},locale:'pt-BR',...(width===390?{isMobile:true,hasTouch:true}:{})});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?lang=pt',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='playing');
  const media=page.locator('.intro-video');
  const attributes=await media.evaluate(v=>({muted:v.muted,defaultMuted:v.defaultMuted,inline:v.playsInline,autoplay:v.autoplay,loop:v.loop,controls:v.controls,fit:getComputedStyle(v).objectFit}));
  assert.deepEqual(attributes,{muted:true,defaultMuted:true,inline:true,autoplay:true,loop:false,controls:false,fit:width<768?'cover':'contain'});
  assert.equal(await media.getAttribute('src'),width<768?'/media/domus-intro-v2.mp4':'/media/domus-intro-desktop-v1.mp4');
  const coverage=await media.evaluate(v=>{
   const hero=v.closest('section').getBoundingClientRect(),frame=v.getBoundingClientRect();
   return Math.abs(frame.left-hero.left)<1 && Math.abs(frame.top-hero.top)<1 && Math.abs(frame.width-hero.width)<1 && Math.abs(frame.height-hero.height)<1;
  });
  if(width<768)assert.equal(coverage,true,'On mobile the video covers the full hero without reserved black margins');
  assert.equal(await page.locator('header').getAttribute('class').then(c=>c.includes('is-hero')),true);
  assert.equal(await page.locator('.brand').isVisible(),false);
  await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
  assert.equal(await page.locator('nav').isVisible(),true);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Pausar animação',exact:true}).click();
  const paused=await media.evaluate(v=>v.currentTime);await page.waitForTimeout(250);
  assert.equal(await media.evaluate(v=>v.paused),true);
  assert.equal(await media.evaluate(v=>v.currentTime),paused);
  await page.getByRole('button',{name:'Reproduzir animação',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='playing');
  await media.evaluate(v=>{v.currentTime=1;});
  await page.evaluate(()=>scrollTo(0,innerHeight+150));
  await page.waitForFunction(()=>document.querySelector('header').classList.contains('is-past-hero'));
  assert.equal(await page.locator('.brand').isVisible(),true);
  await page.waitForFunction(()=>document.querySelector('video').paused);
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForFunction(()=>!document.querySelector('video').paused,undefined,{timeout:10000}).catch(async error=>{console.log('Resume failure',width,await media.evaluate(v=>({state:v.closest('section').dataset.playback,ended:v.ended,paused:v.paused,time:v.currentTime,scroll:scrollY})));throw error;});
  // Finish the actual file, then ensure scrolling back does not restart it.
  await media.evaluate(v=>{v.currentTime=v.duration-.3;});
  await page.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='ended');
  const finished=await media.evaluate(v=>v.currentTime);
  await page.evaluate(()=>scrollTo(0,innerHeight+150));await page.waitForTimeout(100);
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);
  assert.equal(await media.evaluate(v=>v.currentTime),finished);
  await page.screenshot({path:`artifacts/hero-${engine}-${width}-final.png`});
  await page.getByRole('button',{name:'Rever animação',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('video').currentTime<2 && !document.querySelector('video').paused);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='static');
  assert.equal(await media.evaluate(v=>v.paused),true);
  assert.equal(await page.locator('.intro-still').evaluate(i=>i.complete&&i.naturalWidth>0),true);
  assert.deepEqual(errors,[]);report.push({engine,width,result:'passed'});await page.close();
 }
 for(const mode of ['blocked','error','reduce']){
  const page=await browser.newPage({viewport:{width:390,height:844},locale:'pt-BR',reducedMotion:mode==='reduce'?'reduce':'no-preference'});
  const videos=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))videos.push(r.url());});
  if(mode==='blocked')await page.addInitScript(()=>{
   const setAttribute=Element.prototype.setAttribute;
   Element.prototype.setAttribute=function(name,value){if(this instanceof HTMLMediaElement && name.toLowerCase()==='autoplay')return;return setAttribute.call(this,name,value);};
   Object.defineProperty(HTMLMediaElement.prototype,'autoplay',{configurable:true,get(){return false;},set(){}});
   HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));};
  });
  if(mode==='error')await page.addInitScript(()=>{
   // WebKit's native media fetch can bypass Playwright routing. Fail the source itself.
   const missing=value=>String(value).includes('domus-intro')?'/media/unavailable-test.mp4':value;
   const setAttribute=Element.prototype.setAttribute;
   Element.prototype.setAttribute=function(name,value){return setAttribute.call(this,name,this instanceof HTMLMediaElement && name.toLowerCase()==='src'?missing(value):value);};
   const source=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');
   Object.defineProperty(HTMLMediaElement.prototype,'src',{configurable:true,get:source.get,set(value){source.set.call(this,missing(value));}});
  });
  await page.goto(base+'/?lang=pt',{waitUntil:'networkidle'});
  await page.waitForFunction(mode=>document.querySelector('.hero-video')?.dataset.playback===(mode==='reduce'?'static':mode),mode).catch(async error=>{console.log('Hero fallback failure',engine,mode,await page.locator('video').evaluate(video=>({state:video.closest('section').dataset.playback,source:video.currentSrc,error:video.error?.code,paused:video.paused})));throw error;});
  assert.equal(await page.locator('.intro-video').evaluate(v=>getComputedStyle(v).opacity),'0', mode + ': ' + await page.locator('.hero-video').getAttribute('data-playback'));
  assert.equal(await page.locator('.intro-still').evaluate(i=>i.complete&&i.naturalWidth>0),true);
  if(mode==='reduce')assert.deepEqual(videos,[],'Reduced motion avoids downloading the video');
  await page.locator('.intro-scroll').click();
  await page.waitForFunction(()=>scrollY>100);
  report.push({engine,mode,result:'passed'});await page.close();
 }
}finally{await browser.close();}
await writeFile(`artifacts/hero-${engine}-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
