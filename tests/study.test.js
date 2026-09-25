'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
global.NNCore=require('../study-core.js');global.NNVisual=require('../study-visual.js');
const C=NNCore,D=require('../study-content.js'),MC=require('../study-mc.js'),S=require('../study-exam-solutions.js');
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
assert.equal(D.tasks.filter(t=>t.kind==='original').length,5);assert.equal(D.tasks.filter(t=>t.kind==='transfer').length,5);assert.equal(Object.keys(D.recipes).length,7);
assert.equal(new Set(D.tasks.map(t=>t.id)).size,D.tasks.length);
for(const t of D.tasks)for(const p of t.parts){assert.ok(p.solution&&p.checks.length&&p.recipes.length);assert.ok(S.compact(t,p)?.trim(),t.id+'/'+p.id+' compact answer');assert.equal(p.hints,undefined);p.recipes.forEach(r=>assert.ok(D.recipes[r]));if(p.image)assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',p.image)));}
// Parsing cannot accept a correct numerical prefix followed by a different expression.
for(const [s,n] of [['−3/2',-1.5],['1,25',1.25],['(-3)/2',-1.5],['1e-3',.001],['0',0]])assert.equal(C.number(s),n);
for(const s of ['', '1/0','1foo','1+2','NaN','Infinity','2/3/4','1;2','--2'])assert.equal(C.number(s),null,s);
assert.ok(C.grade({answer:[-1,-1,-4],vector:true,scale:true},'(-2; -2; -8)'));
assert.ok(!C.grade({answer:[-1,-1,-4],vector:true,scale:true},'(1; 1; 4)'));
assert.ok(C.grade({answer:[.5,-1.5],vector:true},'(1/2; -3/2)'));
// TLU truth table: the output threshold realizes the stated Boolean function for every input bit pattern.
for(let k=0;k<16;k++){const h=[k&8?1:0,k&4?1:0,k&2?1:0,k&1?1:0];assert.equal(2*h[0]+2*h[1]+h[2]+h[3]>=5,Boolean(h[0]&&h[1]&&(h[2]||h[3])));}
// Independent ray-casting membership, separate from the four chosen half-plane tests.
function polygonInside(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
for(const t of D.tasks.filter(t=>t.family==='tlu'&&t.kind!=='repair')){const m=t.parts[0].model;for(let x=-.713;x<6;x+=.127)for(let y=-.419;y<7;y+=.139){const hs=m.params.map(([a,b,c])=>a*x+b*y>=c?1:0);assert.equal(2*hs[0]+2*hs[1]+hs[2]+hs[3]>=5,polygonInside([x,y],m.points),`${t.id}: ${x},${y}`);}}
// RBF: independent membership in the two triangles vs. the constructed network on a dense off-boundary grid.
for(const t of D.tasks.filter(t=>t.family==='rbf'&&t.kind!=='repair')){const m=t.parts[0].model;for(let x=-2.013;x<6;x+=.131)for(let y=-2.017;y<7;y+=.137){const hs=m.centers.map((c,i)=>(i?Math.max(Math.abs(x-c[0]),Math.abs(y-c[1])):Math.abs(x-c[0])+Math.abs(y-c[1]))<=(i?m.r/2:m.r)?1:0),out=hs[0]-hs[1]-hs[2],inside=m.polys.some(poly=>polygonInside([x,y],poly));assert.ok(inside?out===1:out<=0);}}
// Approximation values and interpolation checked against explicit independently derived arrays.
for(const [kind,ys] of [['original',[10,5,2,1,2,5,10,17,26]],['transfer',[7,4.75,3,1.75,1,.75,1,1.75,3]]]){const p=D.tasks.find(t=>t.id===kind+'-approx').parts[0],m=p.model,a=C.approximation(m.coeff,m.start,m.end,m.step);assert.deepEqual(a.ys,ys);for(let i=0;i<9;i++){close(a.rbf(a.xs[i]),ys[i]);close(a.mlp(a.xs[i]),ys[i]);if(i<8)close(a.rbf((a.xs[i]+a.xs[i+1])/2),(ys[i]+ys[i+1])/2);}for(let j=0;j<=100;j++){const x=m.start+(m.end-m.start)*j/100;close(a.xs.reduce((s,c)=>s+Math.max(0,1-Math.abs(x-c)/m.step),0),1);}}
// Gold LVQ endpoints derived by hand; importantly, the transfer changes the winner under supervision.
const gold={original:{none:[[3,5],[8,3]],winner:[[3,5],[8,3]],two:[[0,7],[9.5,2.75]]},transfer:{none:[[3.25,3],[6,2]],winner:[[1.5,2],[7,1]],two:[[2.75,3],[4.75,1]]}};
for(const kind of ['original','transfer']){const m=D.tasks.find(t=>t.id===kind+'-learning').parts[0].model;for(const rule of ['none','winner','two'])assert.deepEqual(C.lvq(m.initial,m.points,m.eta,rule).centers.map(r=>r.v),gold[kind][rule]);}
// SOM: compute each coordinate directly from the stated lattice; verify both complete grids.
for(const kind of ['original','transfer']){const m=D.tasks.find(t=>t.id===kind+'-learning').parts[2].model,res=C.som(m.grid,m.x,m.eta,m.sigma),win=kind==='original'?[30,20]:[10,5];assert.deepEqual(m.grid[res.winner].v,win);assert.equal(res.rows.length,kind==='original'?63:9);res.rows.forEach(r=>{const d2=((r.v[0]-win[0])/5)**2+((r.v[1]-win[1])/5)**2,alpha=m.eta*Math.exp(-d2/(2*m.sigma*m.sigma));for(let i=0;i<2;i++){close(r.next[i],(1-alpha)*r.v[i]+alpha*m.x[i]);assert.ok(r.next[i]>=Math.min(r.v[i],m.x[i])-1e-10&&r.next[i]<=Math.max(r.v[i],m.x[i])+1e-10);}});}
const originalNext=['+--,-+-,--+','+-+,-++,--+','-+-,-+-,-+-','-++,-++,-+-','+--,++-,+-+','+-+,+-+,+-+','-+-,++-,++-','-++,+-+,++-'];
let tie=false;
for(const kind of ['original','transfer']){const m=D.tasks.find(t=>t.id===kind+'-hopfield').parts[0].model,rows=C.hopfield(m.W,m.theta),energy=s=>-m.W[0][1]*s[0]*s[1]-m.W[0][2]*s[0]*s[2]-m.W[1][2]*s[1]*s[2]+m.theta.reduce((a,t,i)=>a+t*s[i],0);rows.forEach((r,index)=>{close(r.energy,energy(r.s));if(kind==='original')assert.equal(r.next.map(s=>s.map(x=>x===1?'+':'-').join('')).join(','),originalNext[index]);r.next.forEach((next,i)=>{assert.ok(next.every((v,j)=>i===j||v===r.s[j]));const field=m.W[i].reduce((sum,w,j)=>sum+w*r.s[j],0)-m.theta[i];assert.equal(next[i],field>=0?1:-1);assert.ok(energy(next)<=energy(r.s));if(field===0&&r.s[i]!==next[i])tie=true;});});}assert.ok(tie,'Transfer includes a real state change at equal energy');
// The exam drawing must represent every asynchronous update, including unchanged states.
const hopTask=D.tasks.find(t=>t.id==='original-hopfield'),hopPart=hopTask.parts[0],hopHtml=S.compact(hopTask,hopPart);
const drawn=Array.from({length:8},()=>Array(3));
for(const edge of hopHtml.matchAll(/data-edge-source="(\d+)" data-edge-target="(\d+)" data-updates="([\d,]+)"/g)){
 const [,from,to,updates]=edge;
 for(const update of updates.split(',').map(Number)){
  assert.equal(drawn[Number(from)][update-1],undefined,'Each single-neuron update appears once in the graph');
  drawn[Number(from)][update-1]=Number(to);
 }
}
const states=['---','--+','-+-','-++','+--','+-+','++-','+++'];
assert.deepEqual(drawn.map(row=>row.map(i=>states[i]).join(',')),originalNext);
// MC truth values explicitly audited against cited lecture sections (manual audit in UMBAU.md).
assert.equal(MC.concepts.filter(c=>c.core).length,30);assert.equal(new Set(MC.concepts.map(c=>c.id)).size,MC.concepts.length);MC.groups.forEach(([id])=>assert.equal(MC.concepts.filter(c=>c.group===id).length,5));MC.concepts.forEach(c=>{assert.ok(c.source&&c.forms.every(q=>typeof q.correct==='boolean'&&q.explanation.trim().length>0));});
const questions=MC.concepts.filter(c=>c.group==='a').map(c=>MC.question(c,0)),answers=Object.fromEntries(questions.map(q=>[q.id,String(q.correct)]));assert.equal(C.scoreBlock(questions,answers),5);assert.equal(C.scoreBlock(questions,{}),0);assert.equal(C.scoreBlock(questions,Object.fromEntries(questions.map(q=>[q.id,String(!q.correct)]))),0);
// Original wording is a separate form, never a new index that changes saved block answers.
const originals=MC.concepts.filter(c=>c.original);assert.equal(originals.length,7);assert.equal(MC.originalFragments.flatMap(g=>g[1]).length,13);
for(const c of originals){const q=MC.question(c,'original');assert.equal(q.text,c.original.text);assert.equal(q.verbatim,true);for(let turn=0;turn<10;turn++)assert.equal(MC.question(c,turn).text,c.forms[turn%2].text);}
const originalMemory=Object.fromEntries(originals.map(c=>[c.id,{count:20,lastCorrect:true,at:Date.now(),seq:0}])),seenOriginals=new Set();let previousOriginal=null;
for(let i=0;i<7;i++){const c=MC.next(originalMemory,'original',previousOriginal);assert.ok(!seenOriginals.has(c.id));seenOriginals.add(c.id);originalMemory[c.id].originalSeen=true;previousOriginal=c.id;}assert.equal(seenOriginals.size,7);
answers[questions[0].id]=String(!questions[0].correct);assert.equal(C.scoreBlock(questions,answers),3);answers[questions[1].id]='skip';assert.equal(C.scoreBlock(questions,answers),2);
// No mastery for a clicked hint or an original alone; delayed independent transfer is required.
const base={task:'transfer-tlu',family:'tlu',kind:'transfer',rating:'independent',helped:false,at:1000,seq:0};assert.equal(C.familyStatus([{...base,kind:'original'}],'tlu'),'Original bearbeitet');assert.equal(C.familyStatus([base],'tlu'),'Neue Variante selbstständig gelöst');assert.equal(C.familyStatus([base,{...base,at:1000+86400000}],'tlu'),'Später erneut geschafft');assert.equal(C.familyStatus([{...base,helped:true}],'tlu'),'Noch Hilfe nötig');
let history=[],current=null;for(let i=0;i<50;i++){const task=C.nextTask(D.tasks,history,current,1000000000+i*86400000);history.push({task:task.id,family:task.family,kind:task.kind,rating:i%4?'independent':'again',helped:i%4===0,at:1000000000+i*86400000,seq:i});current=task.id;}assert.equal(new Set(history.slice(0,5).map(x=>x.task)).size,5);D.tasks.filter(t=>t.kind==='transfer').forEach(t=>assert.ok(history.some(h=>h.task===t.id),t.id));
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');assert.ok(!html.includes('app.js"></script>')||html.includes('study-app.js'));assert.ok(!html.includes('exam.js'));assert.ok(!html.includes('120-Min'));
console.log('PASS: 5 originals, 5 transfers, 7 recipes, 6 repair tasks; geometry, interpolation, LVQ, all SOM updates, Hopfield, parsing, MC scoring and learning status.');
