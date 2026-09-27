const assert=require('node:assert/strict');
const Q=require('../study-questions'),X=require('../study-exam-mc');
require('../study-theory');require('../study-learning');
const before=JSON.stringify(Q.all);
assert.deepEqual(X.ids,['a','b','c','d','e','f'].map(g=>'original-block-'+g));
assert.deepEqual(X.blocks.map(q=>q.options.length),[5,3,1,2,4,5]);
const en=X.ids.flatMap(id=>X.localize(id,'en').options),de=X.ids.flatMap(id=>X.localize(id,'de').options);
assert.equal(en.length,20);
assert.deepEqual(en.map(o=>o.id),de.map(o=>o.id));
assert.deepEqual(en.filter(o=>!o.fragment).map(o=>o.correct),[true,false,false,false,false,true,true]);
assert.equal(en.filter(o=>o.correct===null).length,13);
assert.equal(en[5].text,'TLU with n inputs. n-dim hypercube.');
for(let i=0;i<en.length;i++){
 assert.notEqual(en[i].text,de[i].text);
 assert.equal(en[i].correct,de[i].correct);
 assert.ok(en[i].explanation.length>20);assert.ok(de[i].explanation.length>20);
 if(!en[i].fragment)assert.equal(en[i].text,Q.get(en[i].id).text);
}
assert.equal(JSON.stringify(Q.all),before);
assert.throws(()=>X.localize(Q.get('block-b-0'),'de'));
const b=X.get('original-block-b'),f=X.get('original-block-f');
for(const answer of ['true','false','skip',undefined]){
 const grade=X.grade(b,{'b1-fragment':answer,'b2-original':'true','b3-original':'false'});
 assert.deepEqual(grade,{correct:2,total:2,ungraded:1,all:true,score:null});
 const allFragments=X.grade(X.blocks[0],Object.fromEntries(X.blocks[0].options.map(o=>[o.id,answer])));
 assert.deepEqual(allFragments,{correct:0,total:0,ungraded:5,all:false,score:null});
}
assert.equal(X.grade(f,Object.fromEntries(f.options.map(o=>[o.id,String(o.correct)]))).score,5);
assert.equal(X.grade(f,Object.fromEntries(f.options.map(o=>[o.id,String(!o.correct)]))).score,0);
const fresh={attempts:[]};assert.equal(X.migrate(fresh).index,0);
for(const index of [0,1]){
 const l={examPracticeIndex:index,attempts:[{qid:b.id,answers:{'b2-original':'true','b3-original':'skip'},submitted:true,helped:false,at:100}]};
 const snapshot=JSON.stringify(l.attempts),m=X.migrate(l);
 assert.equal(m.index,index===0?1:5);
 assert.equal(m.attempts[b.id].answers['b2-original'],'true');
 assert.equal(m.attempts[b.id].answers['b1-fragment'],undefined);
 assert.equal(m.attempts[b.id].submitted,true);
 assert.equal(JSON.stringify(l.attempts),snapshot);
 assert.equal(X.migrate(l),m);
 assert.ok(X.valid(m));assert.ok(X.valid(JSON.parse(JSON.stringify(m))));
}
assert.equal(X.valid({...fresh.exam,index:6}),false);
assert.equal(X.valid({...fresh.exam,attempts:{bad:{}}}),false);
assert.equal(X.valid({...fresh.exam,attempts:{[b.id]:{answers:{unknown:'true'},submitted:false,helped:false,at:100}}}),false);
const state={version:1,attempts:[],cursor:-1,catalog:{topic:'all',type:'all',origin:'all',answers:false},reading:{chapter:null,positions:{},read:[]},returnTo:null};
assert.ok(NNLearn.valid(state));assert.ok(NNLearn.valid({...state,exam:fresh.exam}));
assert.equal(NNLearn.valid({...state,exam:{...fresh.exam,index:6}}),false);
assert.equal(NNLearn.valid({...state,examLanguage:'fr'}),false);
console.log('PASS: six groups, 20 bilingual entries, honest scoring, old-answer migration, save validation, unchanged practice catalog.');
