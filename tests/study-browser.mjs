const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.NN_TEST_URL||'http://127.0.0.1:8766/';
await fs.mkdir('tmp',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],broken=[];let checked=0;
const context=await browser.newContext({viewport:{width:1400,height:1000},acceptDownloads:true});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))broken.push([r.url(),r.status()]);});
await page.goto(base,{waitUntil:'networkidle'});
const tasks=await page.evaluate(()=>NNContent.tasks.map(t=>({id:t.id,parts:t.parts.map(p=>({id:p.id,fields:p.fields,model:p.model}))})));
for(const viewport of [{width:1400,height:1000},{width:390,height:844}]){
 await page.setViewportSize(viewport);
 for(const t of tasks)for(const p of t.parts){
  await page.goto(base+'#/training/'+t.id+'/'+p.id);await page.locator('[data-task="'+t.id+'"]').waitFor();
  const isOpen=await page.locator('#reveal').getAttribute('aria-expanded');if(isOpen!=='true')await page.locator('#reveal').click();
  if(await page.locator('#recipe').getAttribute('aria-expanded')!=='true')await page.locator('#recipe').click();
  while(await page.locator('#hint').isEnabled())await page.locator('#hint').click();
  if(p.fields.length){await page.locator('#numbers').evaluate(e=>e.open=true);for(const q of p.fields){await page.locator('#answer-'+q.id).fill(Array.isArray(q.answer)?'('+q.answer.join('; ')+')':String(q.answer));}await page.locator('#answer-form button').click();assert.match(await page.locator('#number-result').innerText(),/Diese Teilwerte stimmen/);}
  const tex=await page.locator('.katex-error').allTextContents();assert.deepEqual(tex,[],`${t.id}/${p.id}`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${viewport.width} ${t.id}/${p.id}`);
  const imgs=await page.locator('img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0));assert.ok(imgs);
  if(viewport.width===390&&t.id==='transfer-hopfield')await page.screenshot({path:'tmp/nn-hopfield-mobile.png',fullPage:true});
  checked++;
 }
}
// Reload restores task, part, inputs, note, hints and solution. First errors prevent a false independence rating.
await page.setViewportSize({width:1400,height:1000});await page.goto(base+'#/training/original-tlu/netz');
await page.locator('#work').evaluate(e=>e.open=true);await page.locator('#work-note').fill('Eine erhaltene Testnotiz.');await page.locator('#numbers').evaluate(e=>e.open=true);await page.locator('#answer-h1').fill('(0; 1; 4)');await page.locator('#answer-form button').click();assert.ok(await page.locator('[data-rating="independent"]').isDisabled());
await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#work-note').inputValue(),'Eine erhaltene Testnotiz.');assert.equal(await page.locator('#answer-h1').inputValue(),'(0; 1; 4)');assert.equal(await page.locator('#reveal').getAttribute('aria-expanded'),'true');assert.ok(await page.locator('[data-rating="independent"]').isDisabled());
// Every legacy route resolves to useful new content, without restoring a standalone recall trainer.
for(const path of ['klausur','abfragen','task1','task2','task3','task4','task5','task6','cheatsheet','aufgaben','regression','klassifikation','modellwahl','theorie','deeplearning']){await page.goto(base+'#/'+path);await page.waitForTimeout(50);assert.ok((await page.locator('h1').innerText()).length>0);assert.equal(await page.locator('nav[aria-label="Hauptnavigation"] a').count(),3);}
// MC first answer cannot be replaced after feedback, and is persisted.
await page.goto(base+'#/mc');await page.locator('[data-mc="skip"]').click();assert.ok(await page.locator('[data-mc="true"]').isDisabled());await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('#mc-next').isVisible());await page.locator('#mc-next').click();await page.locator('details').evaluate(e=>e.open=true);await page.locator('#mc-thirty').click();await page.locator('#block-finish').waitFor();
const block=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ann_exam_focus_v1'));return NNMC.concepts.filter(c=>c.core).map(c=>NNMC.question(c,s.mcBlock.turn));});for(const q of block)await page.locator(`input[data-block="${q.id}"][value="${q.correct}"]`).check();await page.locator('#block-finish').click();assert.match(await page.locator('#app').innerText(),/30 \/ 30 Punkte/);
// One complete paper, all questions/parts visible before reveal, then all solutions present.
await page.goto(base+'#/gesamt');await page.locator('[data-paper="original"]').click();assert.equal(await page.locator('.paper-task').count(),5);assert.equal(await page.locator('[data-block]').count(),90);await page.locator('[data-paper-note]').first().fill('Gesamtdurchlauf gespeichert.');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-paper-note]').first().inputValue(),'Gesamtdurchlauf gespeichert.');await page.locator('#paper-finish').click();assert.equal(await page.locator('.paper-solution').count(),5);assert.equal(await page.locator('.katex-error').count(),0);
// Imported legacy data is displayed and stays untouched under its original key.
const legacy={notes:{task1:'Alte Notiz'},known:{'tlu-hyperebene':true},scores:{0:7},mcqAnswers:{a1:'true'}};await page.evaluate(old=>localStorage.setItem('ann_borgelt_state_v2',JSON.stringify(old)),legacy);await page.reload({waitUntil:'networkidle'});await page.goto(base+'#/quellen');assert.match(await page.locator('#app').innerText(),/Frühere Notizen/);
const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const payload=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.deepEqual(payload.legacy,legacy);assert.ok(payload.state.drafts['original-tlu'].parts.netz.note);
await page.locator('#import').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});assert.match(await page.locator('#data-message').innerText(),/Importiert/);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('ann_borgelt_state_v2'))),legacy);
// Reject malformed nested structures before altering state; retain an exportable pre-import snapshot.
assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('ann_focus_before_import')).state.drafts['original-tlu']));
const beforeInvalid=await page.evaluate(()=>localStorage.getItem('ann_exam_focus_v1'));
for(const state of [{...payload.state,drafts:{'original-tlu':{parts:null}}},{...payload.state,mcScope:'missing'},{...payload.state,paper:{notes:null}}]){await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schema:'nn-focus-v1',state}))});assert.match(await page.locator('#data-message').innerText(),/nicht durchgeführt/);assert.equal(await page.evaluate(()=>localStorage.getItem('ann_exam_focus_v1')),beforeInvalid);}
for(const file of ['materials/aufgaben-2024.pdf','materials/rechenrezepte.pdf','materials/ausarbeitung-2024.pdf'])assert.equal((await page.request.get(base+file)).status(),200);
// A new unassisted complete attempt is rated once; repetition is a new record, not mutation of mastery.
const fresh=await browser.newContext();const p=await fresh.newPage();await p.goto(base+'#/training/transfer-tlu/netz',{waitUntil:'networkidle'});await p.locator('#reveal').click();await p.locator('[data-check]').evaluateAll(es=>es.forEach(e=>{e.checked=true;e.dispatchEvent(new Event('change'));}));await p.locator('[data-rating="independent"]').click();assert.match(await p.locator('#rating-note').innerText(),/selbstständig/);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('ann_exam_focus_v1')).history.length),1);
await p.goto(base);await p.screenshot({path:'tmp/nn-home-desktop.png'});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'tmp/nn-home-mobile.png',fullPage:true});
await page.goto(base+'#/rezepte');for(const id of ['tlu','rbf','mlp','approx','lvq','som','hopfield']){await page.goto(base+'#/rezepte/'+id);assert.equal(await page.locator('.katex-error').count(),0);}
for(const id of await page.evaluate(()=>NNReference.map(m=>m.id))){await page.goto(base+'#/nachschlagen/'+id);assert.equal(await page.locator('.katex-error').count(),0,id);}
const mcErrors=await page.evaluate(()=>{const el=document.createElement('div');el.innerHTML=NNMC.concepts.flatMap(c=>c.forms).map(q=>`<p>${q.text}</p><p>${q.explanation}</p>`).join('');renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});return [...el.querySelectorAll('.katex-error')].map(e=>e.textContent);});assert.deepEqual(mcErrors,[]);
await p.goto(base+'#/training/transfer-hopfield/graph');await p.locator('#reveal').click();await p.locator('.hopgraph').scrollIntoViewIfNeeded();await p.screenshot({path:'tmp/nn-hopfield-viewport.png'});await p.locator('[data-hop-focus]').selectOption('0');assert.ok(await p.locator('.hopgraph').evaluate(e=>e.classList.contains('focused')));
await p.goto(base);await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>document.activeElement.matches('a,button,input,select,textarea')));
assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);console.log(`PASS: ${checked} rendered task parts at desktop/mobile; formulas, fields, persistence, 15 old routes, MC blocks, complete paper, export/import and source links.`);await browser.close();
