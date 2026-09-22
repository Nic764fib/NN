import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NN_TEST_URL||'http://127.0.0.1:8766/';
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[];
try {
 for(const width of [1400,390]){
  const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#/mc',{waitUntil:'networkidle'});
  // Previously practised concepts must still present each original wording once.
  await page.evaluate(()=>{const key='ann_exam_focus_v1',s=JSON.parse(localStorage.getItem(key));for(const c of NNMC.concepts.filter(c=>c.original))s.mc[c.id]={count:20,lastCorrect:true,at:Date.now(),seq:0};localStorage.setItem(key,JSON.stringify(s));});
  await page.reload({waitUntil:'networkidle'});await page.getByRole('link',{name:'Wortlaut der Vorlage 2024 durchgehen'}).click();
  assert.equal(await page.locator('#mc-scope').inputValue(),'original');
  assert.ok(await page.locator('#mc-five').isHidden());
  const seen=new Set();
  for(let i=0;i<7;i++){
   const q=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ann_exam_focus_v1'));return NNMC.question(NNMC.concepts.find(c=>c.id===s.mcActive.concept),s.mcActive.form);});
   assert.equal(q.verbatim,true);assert.ok(!seen.has(q.id));seen.add(q.id);
   assert.equal(await page.locator('.mc-statement').innerText(),q.text);
   assert.equal(await page.locator('.mc-statement').getAttribute('lang'),'en');
   await page.locator(`[data-mc="${i===0?'skip':String(q.correct)}"]`).click();
   assert.ok(await page.locator('[data-mc="true"]').isDisabled());
   assert.match(await page.locator('#app').innerText(),new RegExp(`${i+1} / 7 Aussagen bereits durchgegangen`));
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.mc-statement').innerText(),q.text);
   assert.ok(await page.locator('#mc-next').isVisible());
   assert.equal(await page.locator('.katex-error').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(i<6)await page.locator('#mc-next').click();
  }
  const fragmentBox=page.locator('details').filter({has:page.locator('summary',{hasText:'Weitere 13 Einträge'})});
  await fragmentBox.locator('summary').click();assert.equal(await fragmentBox.locator('li[lang="en"]').count(),13);
  await fs.mkdir('tmp',{recursive:true});await page.screenshot({path:`tmp/mcq-original-${width}.png`,fullPage:width===390});
  await page.locator('#mc-scope').selectOption('core');assert.equal(new URL(page.url()).hash,'#/mc');
  assert.match(await page.locator('#app').innerText(),/Eigene \/ rekonstruierte Trainingsformulierung/);
  await page.locator('#mc-thirty').locator('..').locator('..').evaluate(e=>e.open=true);await page.locator('#mc-thirty').click();
  assert.equal(await page.locator('[data-block]').count(),90);
  const questions=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ann_exam_focus_v1'));return NNMC.concepts.filter(c=>c.core).map(c=>NNMC.question(c,s.mcBlock.turn));});
  assert.ok(questions.every(q=>!q.verbatim));
  for(const q of questions)await page.locator(`input[data-block="${q.id}"][value="${q.correct}"]`).check();
  await page.locator('#block-finish').click();assert.match(await page.locator('#app').innerText(),/30 \/ 30 Punkte/);
  await page.goto(base+'#/mc/original');assert.match(await page.locator('#app').innerText(),/7 \/ 7 Aussagen bereits durchgegangen/);
  await page.goto(base+'#/quellen');const downloading=page.waitForEvent('download');await page.locator('#export').click();const download=await downloading;const content=await fs.readFile(await download.path());
  const payload=JSON.parse(content);assert.equal(payload.state.mcScope,'original');assert.equal(payload.state.mcActive.form,'original');
  await page.locator('#import').setInputFiles({name:'original-state.json',mimeType:'application/json',buffer:content});assert.match(await page.locator('#data-message').innerText(),/Importiert/);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: every original shown once despite old progress; wording, 7/7 persistence, 13 fragments, mobile, unchanged 30-question blocks, export/import.');
}finally{await browser.close();}
