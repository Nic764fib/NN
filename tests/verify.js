'use strict';
// Independent invariants for the educational calculations; no browser dependency.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),p=require('../practice.js');
const html=[];
const context=vm.createContext({console,localStorage:{getItem:()=>null},document:{addEventListener(){},querySelector(){return {set innerHTML(v){html.push(v)}};}},window:{}});
for(const name of ['course.js','theory-extra.js','practice.js','learning.js','question-bank.js','original-exam.js','app.js','corrections.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
vm.runInContext('installCorrections()',context);
const data=JSON.parse(vm.runInContext('JSON.stringify({courseModules,theoryEntries,groups:allQuestionGroups(),original:NNOriginal.tasks()})',context));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let variants=0;
for(const [type] of p.types){const signatures=new Set();for(let seed=1;seed<=50;seed++){
 const q=p.make(type,seed);variants++;assert.ok(q.fields.every(f=>Number.isFinite(f.answer)));assert.ok(p.grade(q,q.fields.map(f=>String(f.answer).replace('.',','))).every(Boolean));assert.ok(p.grade(q,q.fields.map(()=>'' )).every(v=>!v));signatures.add(q.prompt);
 if(type==='regression'){
  const points=[...q.prompt.matchAll(/\((-?\d+), (-?\d+)\)/g)].map(m=>[+m[1],+m[2]]),xbar=points.reduce((s,[x])=>s+x,0)/3,ybar=points.reduce((s,[,y])=>s+y,0)/3;
  const slope=points.reduce((s,[x,y])=>s+(x-xbar)*(y-ybar),0)/points.reduce((s,[x])=>s+(x-xbar)**2,0),intercept=ybar-slope*xbar;
  close(q.fields[0].answer,intercept);close(q.fields[1].answer,slope);close(q.fields[2].answer,points.reduce((s,[x,y])=>s+(intercept+slope*x-y)**2,0));
 }
 if(type==='lvq'){
  const {initial,points,supervised,unsupervised}=q.data;close(supervised[0][0]-initial[0][0],-5);close(supervised[0][1],7);close(supervised[1][0]-initial[1][0],2.5);close(supervised[1][1],2.75);close(unsupervised[0][0]-initial[0][0],-2);close(unsupervised[1][1],3);
 }
 if(type==='hopfield'){
  const {weights:W,theta:t,rows}=q.data;
  const energy=s=>-W[0][1]*s[0]*s[1]-W[0][2]*s[0]*s[2]-W[1][2]*s[1]*s[2]+s.reduce((a,v,i)=>a+v*t[i],0);
  for(const r of rows){close(r.energy,energy(r.state));for(let i=0;i<3;i++){const next=r.successors[i];assert.ok(next.every((v,j)=>j===i||v===r.state[j]));assert.ok(energy(next)<=energy(r.state)+1e-10);close(next[i],W[i].reduce((a,w,j)=>a+w*r.state[j],0)>=t[i]?1:-1);}}
 }
 html.push(q.prompt,q.solution);
 }assert.ok(signatures.size>=3,`${type}: insufficient distinct variants`);}
// Finite differences check the squared-error backpropagation update convention.
for(const x of [1,2,3])for(const target of [0,1]){
 const loss=(v,w,bh,bo)=>(target-p.sigmoid(w*p.sigmoid(v*x+bh)+bo))**2,pars=[.5,1,0,0],h=p.sigmoid(.5*x),o=p.sigmoid(h),do_=(target-o)*o*(1-o),dh=do_*h*(1-h),updates=[.1*dh*x,.1*do_*h,.1*dh,.1*do_];
 pars.forEach((_,i)=>{const a=[...pars],b=[...pars];a[i]+=1e-5;b[i]-=1e-5;close(updates[i],-.05*(loss(...a)-loss(...b))/2e-5);});
}
// Triangular basis interpolates knots, is continuous and partitions unity.
const centers=Array.from({length:9},(_,i)=>i-4),f=x=>x*x+2*x+2,approx=x=>centers.reduce((s,c)=>s+f(c)*Math.max(0,1-Math.abs(x-c)),0);
centers.forEach(x=>close(approx(x),f(x)));close(approx(-2.5),3.5);
for(let x=-4;x<=4;x+=.03125)close(centers.reduce((s,c)=>s+Math.max(0,1-Math.abs(x-c)),0),1);
assert.equal(data.groups.length,18);assert.equal(data.groups.flatMap(g=>g.questions).length,90);assert.equal(new Set(data.groups.flatMap(g=>g.questions.map(q=>q.id))).size,90);
assert.equal(data.original.length,5);data.original.forEach(q=>{assert.equal(q.rubric.reduce((s,[,n])=>s+n,0),14);if(q.image)assert.ok(fs.existsSync(path.join(root,q.image)));html.push(q.prompt,q.solution);});
const core=data.groups.slice(0,6),answers={};core.forEach(g=>g.questions.forEach(q=>answers[q.id]=String(q.correct)));
function score(a){context.testGroups=core;context.testAnswers=a;return JSON.parse(vm.runInContext('JSON.stringify(scoreQuestionGroups(testGroups,testAnswers))',context)).reduce((s,g)=>s+g.score,0);}
assert.equal(score(answers),30);assert.equal(score({}),0);Object.keys(answers).forEach(k=>answers[k]=answers[k]==='true'?'false':'true');assert.equal(score(answers),0);
// Ensure a negative block cannot subtract from another block's score.
core[0].questions.forEach(q=>answers[q.id]=String(q.correct));assert.equal(score(answers),5);
html.push(fs.readFileSync(path.join(root,'index.html'),'utf8'),...data.courseModules.flatMap(m=>m.sections.map(s=>s.html)),...data.theoryEntries.map(t=>t.text));
if(process.env.KATEX_PATH){const katex=require(process.env.KATEX_PATH);let count=0;const errors=[];for(const text of html){const clean=text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');for(const m of clean.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]*?)\$/g)){try{katex.renderToString(m[1]??m[2],{throwOnError:true,strict:'ignore'});count++;}catch(e){errors.push({tex:m[1]??m[2],error:e.message});}}}assert.deepEqual(errors,[]);console.log(`${count} TeX formulas render without parse errors.`);}
console.log(`Verified ${variants} variants, 90 MC statements, original rubrics, LVQ, Hopfield transitions, regression, RBF interpolation and finite-difference backpropagation.`);
