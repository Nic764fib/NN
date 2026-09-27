import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),X=require('../study-exam-mc');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NN_TEST_URL||'http://127.0.0.1:8766/';
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
try{
 await fs.mkdir('tmp',{recursive:true});
 for(const width of [1400,390]){
  const context=await browser.newContext({viewport:{width,height:950}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#/mc',{waitUntil:'networkidle'});
  await page.getByRole('link',{name:'Originalfragen starten →',exact:true}).click();
  for(let i=0;i<X.ids.length;i++){
   const id=X.ids[i],de=X.localize(id,'de'),en=X.localize(id,'en');
   await page.locator('[data-exam-question="'+id+'"]').waitFor();
   assert.equal(await page.locator('legend').count(),en.options.length);
   assert.equal(await page.locator('input[type=radio]').count(),2*en.options.length);
   assert.equal(await page.locator('input[value=skip]').count(),0);
   assert.deepEqual(await page.locator('legend').allTextContents(),de.options.map((o,n)=>(n+1)+'. '+o.text));
   for(const o of en.options)await page.locator('[data-answer="'+o.id+'"][value="'+(o.correct===false?'false':'true')+'"]').check();
   await page.locator('[data-exam-language=en]').click();
   assert.deepEqual(await page.locator('legend').allTextContents(),en.options.map((o,n)=>(n+1)+'. '+o.text));
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.locator('input:checked').count(),en.options.length);
   await page.locator('#question-submit').click();
   assert.equal(await page.locator('.answer-explanation').count(),en.options.length);
   const g=X.grade(en,Object.fromEntries(en.options.map(o=>[o.id,o.correct===false?'false':'true'])));
   assert.match(await page.locator('.feedback').innerText(),g.total?new RegExp(g.total+' / '+g.total):/without a true\/false key/);
   await page.locator('[data-exam-language=de]').click();
   assert.equal(await page.locator('input:checked').count(),de.options.length);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(i<X.ids.length-1)await page.locator('#exam-next').click();
  }
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-exam-question]').getAttribute('data-exam-question'),X.ids[5]);
  assert.ok(await page.locator('#exam-next').isDisabled());
  await page.locator('#exam-retry').click();
  assert.equal(await page.locator('input:checked').count(),0);
  await page.locator('[data-answer=f1-original][value=false]').check();
  await page.getByRole('link',{name:'Grundlage nachlesen',exact:true}).click();
  await page.getByRole('link',{name:'← Zur Bearbeitung zurück'}).first().click();
  assert.ok(await page.locator('[data-answer=f1-original][value=false]').isChecked());
  await page.screenshot({path:'tmp/exam-mc-'+width+'.png',fullPage:true});
  await page.goto(base+'#/mc/ueben');
  assert.equal(await page.locator('[data-exam-question]').count(),0);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: 20 entries, six groups, EN/DE, only True/False, persistence, grading, retry, theory return, mobile.');
}finally{await browser.close();}
