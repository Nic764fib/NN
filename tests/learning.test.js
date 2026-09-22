const assert=require('node:assert/strict');
const T=require('../study-theory'),Q=require('../study-questions'),M=require('../study-mc');
require('../study-learning');
assert.equal(T.chapters.length,10);assert.equal(T.chapters.flatMap(c=>c.sections).length,34);
assert.equal(new Set(Q.all.map(q=>q.id)).size,Q.all.length);
assert.equal(Q.singles.length,82);assert.equal(Q.all.filter(q=>q.provenance==='variant').length,14);
for(const c of M.concepts){for(let i=0;i<c.forms.length;i++){const q=Q.get(c.id+'-'+i);assert.equal(q.text,c.forms[i].text);assert.equal(q.correct,c.forms[i].correct);}if(c.original)assert.equal(Q.get(c.id+'-original').text,c.original.text);}
for(const q of Q.all){assert.ok(T.chapters.some(c=>c.id===q.topic),q.id);assert.ok(q.source);for(const o of Q.options(q)){assert.equal(typeof o.correct,'boolean');assert.ok(o.explanation.trim().length>0,o.id);if(!o.correct)assert.ok(o.correction.trim().length>0,o.id);}}
assert.deepEqual(Q.get('original-block-b').options.map(o=>o.concept),['b2','b3']);
assert.deepEqual(Q.get('original-block-f').options.map(o=>o.concept),['f1','f2','f3','f4','f5']);
assert.equal(Q.get('original-block-b').officialScore,false);assert.equal(Q.get('original-block-f').officialScore,true);
// Answer keys checked independently from the data construction, including numerical examples.
const keys={
 'tlu-zahlen':[2*2-1>=3,false,0<3,false],
 'abstand-zahlen':[3+4===7,false,Math.max(3,4)===4,false],
 'rbf-abzug':[1-1===0,false,true,false],
 'approx-werte':[5-2===3&&4-5===-1,false,5*.5+4*.5===4.5,false],
 'gradient-zahlen':[1*2===2,(2-4)*2===-4,false,Math.abs(.5*(2.8-4)**2-.72)<1e-12],
 'optimierer-vergleich':[.9*4+.1*9===4.5,false,true,false],
 'lvq-klassen':[1<9,false,true,6+.5*(3-6)===4.5],
 'som-nachbar':[Math.exp(0)===1,10+.4*(8-10)===9.2&&5+.4*(6-5)===5.4,false,false],
 'hopfield-zyklus':[true,false,true,true],
 'validierung-fall':[true,false,true,false],
 'softmax-zahlen':[true,true,false],'cnn-groesse':[true,true,false],'bce-ziel':[true,true,false],'rbm-fuzzy-fall':[true,false,true]
};
for(const [id,key] of Object.entries(keys)){const q=Q.get(id);assert.deepEqual(q.options.map(o=>o.correct),key,id);const answers=Object.fromEntries(q.options.map((o,i)=>[o.id,String(key[i])]));assert.equal(Q.grade(q,answers).all,true);assert.equal(Q.grade(q,answers).score,null);answers[q.options[0].id]=String(!key[0]);assert.equal(Q.grade(q,answers).all,false);}
// Bipolar conversion and the synchronous cycle independently enumerated.
for(const u1 of [0,1])for(const u2 of [0,1])assert.equal(u1+u2>=1,(2*u1-1)+(2*u2-1)>=0);
const update=s=>[s[1]>=0?1:-1,s[0]>=0?1:-1];assert.deepEqual(update([-1,1]),[1,-1]);assert.deepEqual(update(update([-1,1])),[-1,1]);
const l={version:1,attempts:[],cursor:-1,catalog:{topic:'all',type:'all',origin:'all',answers:false},reading:{chapter:null,positions:{},read:[]},returnTo:null};
assert.ok(NNLearn.valid(undefined));assert.ok(NNLearn.valid(l));assert.equal(NNLearn.valid({...l,cursor:3}),false);assert.equal(NNLearn.valid({...l,reading:{...l.reading,positions:{netze:{section:'missing',offset:0}}}}),false);
const a={id:'test',qid:'b2-original',answers:{'b2-original':'true'},submitted:true,helped:false,at:1};assert.ok(NNLearn.valid({...l,attempts:[a],cursor:0}));assert.equal(NNLearn.valid({...l,attempts:[a,a],cursor:0}),false);assert.equal(NNLearn.valid({...l,attempts:[{...a,answers:{injected:'true'}}],cursor:0}),false);
console.log('PASS: full catalog coverage, original grouping, 52 new option keys, numerical examples, correction coverage, scoring and saved-state validation.');
