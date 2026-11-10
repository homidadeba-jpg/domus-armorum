import{chromium,webkit}from'playwright';import assert from'node:assert/strict';
const engine=process.env.TEST_ENGINE || 'chromium';const b=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'&&process.env.TEST_BROWSER_CHANNEL?{channel:process.env.TEST_BROWSER_CHANNEL}:{})});
const base=process.env.TEST_URL || 'http://127.0.0.1:5187';const mobile='/media/domus-intro-v2.mp4',desktop='/media/domus-intro-desktop-v1.mp4';
try{
 for(const width of[390,767,768,1440,2560]){
  const p=await b.newPage({viewport:{width,height:width<768?844:1000},reducedMotion:'reduce'});const files=[];p.on('request',r=>{if(/domus-intro.*\.mp4/.test(r.url()))files.push(r.url())});
  await p.goto(base+'/?lang=pt',{waitUntil:'networkidle'});assert.equal(await p.locator('video').getAttribute('src'),null);assert.deepEqual(files,[]);
  const img=p.locator('.intro-still');await img.evaluate(i=>i.decode());assert.equal(await img.getAttribute('src'),width<768?'/media/domus-final-v2.webp':'/media/domus-final-desktop-v1.webp');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.close();
 }
 for(const width of[390,1440]){
  const p=await b.newPage({viewport:{width,height:width<768?844:1000},locale:'pt-BR'});const files=[];p.on('request',r=>{if(/domus-intro.*\.mp4/.test(r.url()))files.push(new URL(r.url()).pathname)});
  await p.goto(base+'/?lang=pt',{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='playing');
  const v=p.locator('video');assert.equal(await v.getAttribute('src'),width<768?mobile:desktop);
  const dimensions=await v.evaluate(v=>({width:v.videoWidth,height:v.videoHeight}));
  if(engine==='chromium')assert.equal(dimensions.width,width<768?720:1624);
  else assert.ok(Math.abs(dimensions.width/dimensions.height-(width<768?720/1280:1624/914))<.01,'WebKit preserves the selected film aspect ratio');
  if(engine==='chromium')assert.deepEqual([...new Set(files)],[width<768?mobile:desktop],'Only the selected video is downloaded');await p.close();
 }
 const p=await b.newPage({viewport:{width:1440,height:1000},locale:'pt-BR'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/?lang=pt',{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='playing');
 await p.getByRole('button',{name:'Pausar animação',exact:true}).click();await p.locator('video').evaluate(v=>v.currentTime=2);
 await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>{const v=document.querySelector('video');return v.currentSrc.includes('intro-v2')&&v.readyState>=2&&Math.abs(v.currentTime-2)<.15});assert.equal(await p.locator('video').evaluate(v=>v.paused),true);
 await p.getByRole('button',{name:'Reproduzir animação',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('video').paused);
 await p.locator('video').evaluate(v=>v.currentTime=v.duration-.2);await p.waitForFunction(()=>document.querySelector('.hero-video')?.dataset.playback==='ended');
 await p.setViewportSize({width:1440,height:1000});await p.waitForFunction(()=>{const v=document.querySelector('video');return v.currentSrc.includes('desktop-v1')&&v.readyState>=2&&v.currentTime>=v.duration-.05}).catch(async error=>{console.log('Final-frame handoff',await p.locator('video').evaluate(v=>({source:v.currentSrc,time:v.currentTime,duration:v.duration,ready:v.readyState,paused:v.paused,ended:v.ended,state:v.closest('section').dataset.playback})));throw error});assert.equal(await p.locator('video').evaluate(v=>v.paused),true);
 await p.getByRole('button',{name:'Rever animação',exact:true}).click();await p.waitForFunction(()=>{const v=document.querySelector('video');return !v.paused&&v.currentTime<2});
 assert.deepEqual(errors,[]);await p.close();console.log(engine+': responsive sources, no video download in reduced motion, preserved pause/progress/final frame when resizing, and replay passed.');
}finally{await b.close()}
