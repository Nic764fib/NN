import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NN_TEST_URL||'http://127.0.0.1:8766/';
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
try{
 for(const width of [1400,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#/fragen',{waitUntil:'networkidle'});
  const originals=await page.evaluate(()=>NNQuestions.all.filter(q=>q.provenance==='original'));assert.equal(originals.length,9);
  for(const q of originals){const card=page.locator(`[data-catalog-question="${q.id}"]`),options=q.type==='single'?[q]:q.options;assert.deepEqual(await card.locator('.question-text').allTextContents(),options.map((o,i)=>(q.type==='single'?'':`${i+1}. `)+o.text));assert.equal(await card.locator('.answer-explanation').count(),options.length);}
  await page.evaluate(()=>{const key='ann_exam_focus_v1',s=JSON.parse(localStorage.getItem(key));for(const c of NNMC.concepts.filter(c=>c.original))s.mc[c.id]={count:20,lastCorrect:true,at:1,seq:0};localStorage.setItem(key,JSON.stringify(s));});await page.reload({waitUntil:'networkidle'});
  for(const q of originals){
   await page.goto(base+'#/mc/frage/'+q.id);await page.locator(`[data-question="${q.id}"]`).waitFor();
   if(q.type==='single'){assert.equal(await page.locator('.mc-statement').innerText(),q.text);assert.equal(await page.locator('.mc-statement').getAttribute('lang'),'en');await page.locator(`[data-mc="${q.correct}"]`).click();}
   else{assert.deepEqual(await page.locator('legend').allTextContents(),q.options.map((o,i)=>`${i+1}. ${o.text}`));for(const o of q.options)await page.locator(`[data-answer="${o.id}"][value="${o.correct}"]`).check();await page.locator('#question-submit').click();}
   const count=q.type==='single'?1:q.options.length;assert.equal(await page.locator('.answer-explanation').count(),count);
   if(q.id==='original-block-f')assert.match(await page.locator('.feedback').innerText(),/5 \/ 5 Punkte/);else assert.doesNotMatch(await page.locator('.feedback').innerText(),/\d \/ \d Punkte/);
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-question]').getAttribute('data-question'),q.id);assert.equal(await page.locator('.answer-explanation').count(),count);assert.equal(await page.locator('.katex-error').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  assert.equal(await page.evaluate(()=>NNMC.concepts.filter(c=>c.original).filter(c=>JSON.parse(localStorage.getItem('ann_exam_focus_v1')).mc[c.id].originalSeen).length),7);await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: seven exact original statements, both groups, correct scoring, old-progress compatibility, reload, desktop and mobile.');
}finally{await browser.close();}
