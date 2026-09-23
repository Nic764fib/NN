import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NN_TEST_URL||'http://127.0.0.1:8766/';
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
const context=await browser.newContext({viewport:{width:1400,height:1000},acceptDownloads:true});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const go=async path=>{await page.goto(base+'#/'+path);await page.waitForTimeout(100);};
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ann_exam_focus_v1')));
try{
 await fs.mkdir('tmp',{recursive:true});
 await page.goto(base+'#/theorie',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.theory-toc li').count(),10);
 assert.equal(await page.locator('nav[aria-label="Hauptnavigation"] a').count(),4);
 const ids=await page.evaluate(()=>NNTheory.chapters.map(c=>c.id));
 for(const width of [1400,390]){await page.setViewportSize({width,height:950});await go('theorie');assert.equal(await page.locator('.theory-overview section').count(),10);assert.equal(await page.locator('.katex-error').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));for(const id of ids){await go('theorie/'+id);assert.equal(await page.locator('.katex-error').count(),0,id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id);assert.ok(await page.locator('.reading-section').count()>=3);}}
 await page.setViewportSize({width:1400,height:1000});await go('theorie/netze/schwelle');await page.waitForTimeout(300);
 assert.equal((await stored()).learning.reading.positions.netze.section,'schwelle');await page.locator('#chapter-read').check();
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(250);assert.ok(await page.locator('#chapter-read').isChecked());assert.ok(Math.abs(await page.locator('#read-schwelle').evaluate(el=>el.getBoundingClientRect().top)-24)<8);
 // Exactly two entries; catalog exposes the complete bank, without filters or grading.
 await go('mc');assert.equal(await page.locator('#app .button').count(),2);assert.equal(await page.locator('#app select').count(),0);
 assert.deepEqual(await page.locator('#app .button').allTextContents(),['Alle Fragen ansehen','Üben']);
 const before=await stored();await page.getByRole('link',{name:'Alle Fragen ansehen',exact:true}).click();
 assert.equal(await page.locator('.catalog-question').count(),110);assert.equal(await page.locator('.catalog-option details').count(),0);
 assert.equal(await page.locator('#app select').count(),0);assert.equal(await page.locator('.katex-error').count(),0);
 assert.deepEqual((await stored()).mc,before.mc);assert.deepEqual((await stored()).learning.attempts,before.learning.attempts);
 const expected=await page.evaluate(()=>NNQuestions.all.flatMap(q=>NNQuestions.options(q)).filter(o=>!o.correct).length);
 assert.equal(await page.locator('.corrected').count(),expected);
 // Every question is reachable via Next, and every answer renders at both widths.
 const qs=await page.evaluate(()=>NNQuestions.all.map(q=>({id:q.id,type:q.type,options:NNQuestions.options(q).map(o=>({id:o.id,correct:o.correct}))})));
 for(const width of [1400,390]){
  await page.setViewportSize({width,height:950});await go('mc/frage/'+qs[0].id);assert.ok(await page.locator('#mc-back').isDisabled());
  for(const [i,q] of qs.entries()){
   assert.equal(await page.locator('[data-question]').getAttribute('data-question'),q.id);
   assert.equal(await page.locator('#app select,#mc-scope,#exam-block-controls').count(),0);
   assert.equal(await page.getByRole('link',{name:'Meine Versuche'}).count(),0);
   if(await page.locator('#mc-retry').count())await page.locator('#mc-retry').click();
   assert.equal(await page.locator('.answer-explanation').count(),0);
   if(q.type==='single')await page.locator(`[data-mc="${q.options[0].correct}"]`).click();
   else{for(const o of q.options){if(q.type==='select'){if(o.correct)await page.locator(`[data-answer="${o.id}"]`).check();}else await page.locator(`[data-answer="${o.id}"][value="${o.correct}"]`).check();}await page.locator('#question-submit').click();}
   assert.equal(await page.locator('.answer-explanation').count(),q.options.length,q.id);
   assert.match(await page.locator('.feedback').innerText(),new RegExp(`${q.options.length} / ${q.options.length} richtig`));
   assert.equal(await page.locator('.katex-error').count(),0,q.id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),q.id);
   if(i<qs.length-1)await page.locator('#mc-next').click();else assert.ok(await page.locator('#mc-next').isDisabled());
  }
 }
 // Back, forward and reload preserve submitted answers without grading again.
 await go('mc/frage/b2-original');const answered=await stored(),qid=await page.locator('[data-question]').getAttribute('data-question');
 await page.locator('#mc-next').click();const nextid=await page.locator('[data-question]').getAttribute('data-question');await page.locator('#mc-back').click();
 assert.equal(await page.locator('[data-question]').getAttribute('data-question'),qid);assert.ok(await page.locator('[data-mc="true"]').isDisabled());
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-question]').getAttribute('data-question'),qid);assert.deepEqual((await stored()).mc,answered.mc);
 await page.locator('#mc-next').click();assert.equal(await page.locator('[data-question]').getAttribute('data-question'),nextid);
 await go('mc/frage/b2-original');const old=(await stored()).learning.attempts.findLast(a=>a.qid==='b2-original');
 await page.locator('#mc-retry').click();await page.locator('[data-mc="false"]').click();assert.deepEqual((await stored()).learning.attempts.find(a=>a.id===old.id),old);
 // Pending selection survives reload, theory detour and moving on without grading.
 await go('mc/frage/softmax-zahlen');await page.locator('#mc-retry').click();await page.locator('[data-answer="softmax-zahlen-o0"]').check();
 await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('[data-answer="softmax-zahlen-o0"]').isChecked());
 const pending=(await stored()).learning.attempts.at(-1);
 await page.getByRole('link',{name:'Grundlage nachlesen',exact:true}).click();await page.getByRole('link',{name:'← Zur Bearbeitung zurück'}).first().click();
 assert.equal((await stored()).learning.attempts[(await stored()).learning.cursor].id,pending.id);assert.ok(await page.locator('[data-answer="softmax-zahlen-o0"]').isChecked());assert.equal((await stored()).learning.attempts.at(-1).helped,true);
 const ungraded=await stored();await page.locator('#mc-next').click();assert.deepEqual((await stored()).mc,ungraded.mc);await page.locator('#mc-back').click();assert.ok(await page.locator('[data-answer="softmax-zahlen-o0"]').isChecked());
 // Reading returns to the same scroll position, without applying a hidden topic filter.
 await go('fragen');await page.locator('.catalog-question').nth(4).scrollIntoViewIfNeeded();await page.locator('.catalog-question').nth(4).getByRole('link',{name:'Dazu nachlesen'}).first().click();
 const catalogY=(await stored()).learning.returnY;await page.getByRole('link',{name:'← Zur Bearbeitung zurück'}).first().click();assert.equal(await page.locator('.catalog-question').count(),110);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-catalogY)<10);
 for(const route of ['mc/verlauf','mc/block','mc/original']){await go(route);assert.equal(new URL(page.url()).hash,'#/mc/ueben');assert.equal(await page.locator('[data-question]').count(),1);assert.equal(await page.locator('#mc-scope,#mc-five,#mc-thirty,.attempt-list').count(),0);}
 // Numeric calculation inputs survive visiting theory, with no note field required.
 await go('training/original-learning/som');await page.locator('#numbers').evaluate(e=>e.open=true);await page.locator('[data-field]').first().fill('(30; 20)');
 await page.locator('.task-theory-link a').click();await page.getByRole('link',{name:'← Zur Bearbeitung zurück'}).first().click();assert.equal(await page.locator('[data-field]').first().inputValue(),'(30; 20)');
 // Full export/import; malformed question references and positions are rejected atomically.
 await go('quellen');const downloading=page.waitForEvent('download');await page.locator('#export').click();const download=await downloading,buf=await fs.readFile(await download.path()),payload=JSON.parse(buf);
 await page.locator('#import').setInputFiles({name:'learning.json',mimeType:'application/json',buffer:buf});assert.match(await page.locator('#data-message').innerText(),/Importiert/);assert.deepEqual((await stored()).learning,payload.state.learning);
 const beforeInvalid=await stored();for(const bad of [s=>s.learning.attempts[0].qid='missing',s=>s.learning.practiceIndex=110]){const copy=structuredClone(payload);bad(copy.state);await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(copy))});assert.match(await page.locator('#data-message').innerText(),/nicht durchgeführt/);assert.deepEqual(await stored(),beforeInvalid);}
 const ctx=await browser.newContext(),p=await ctx.newPage();await p.goto(base+'#/');await p.evaluate(()=>{const key='ann_exam_focus_v1',s=JSON.parse(localStorage.getItem(key));delete s.learning;s.mcActive={concept:'b2',form:0,answer:'true'};s.mc={b2:{count:19,lastCorrect:true,at:1,seq:1}};localStorage.setItem(key,JSON.stringify(s));});
 await p.reload({waitUntil:'networkidle'});await p.goto(base+'#/mc/ueben');assert.ok(await p.locator('[data-mc="true"]').isDisabled());assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('ann_exam_focus_v1')).mc.b2.count),19);await ctx.close();
 await page.setViewportSize({width:1400,height:1000});await go('theorie/tlu/halbebene');await page.screenshot({path:'tmp/theory-reading-desktop.png'});await go('mc');await page.screenshot({path:'tmp/mc-landing-desktop.png'});
 await page.setViewportSize({width:390,height:844});await go('mc/frage/original-block-b');await page.screenshot({path:'tmp/mc-practice-mobile.png',fullPage:true});await go('fragen');await page.screenshot({path:'tmp/catalog-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: theory overview and 10 chapters, all 110 catalog/practice entries at desktop/mobile, two entries, no filters/history, navigation, persistence, theory detours and export/import.');
}finally{await browser.close();}
