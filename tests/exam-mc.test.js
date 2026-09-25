const assert=require('node:assert/strict');
const Q=require('../study-questions'),X=require('../study-exam-mc');
require('../study-learning');
const before=JSON.stringify(Q.all);
assert.deepEqual(X.ids,['original-block-b','original-block-f']);
const keys=[true,false,false,false,false,true,true];
const english=X.ids.flatMap(id=>X.localize(Q.get(id),'en').options);
const german=X.ids.flatMap(id=>X.localize(Q.get(id),'de').options);
assert.equal(english.length,7);
assert.deepEqual(english.map(o=>o.correct),keys);
assert.deepEqual(german.map(o=>o.correct),keys);
for(let i=0;i<english.length;i++){
 const en=english[i],de=german[i];
 assert.equal(en.text,Q.get(en.id).text);
 assert.equal(en.id,de.id);assert.notEqual(en.text,de.text);
 assert.ok(en.explanation.length>20);assert.ok(de.explanation.length>20);
 if(!en.correct){assert.ok(en.correction.length>20);assert.ok(de.correction.length>20);}
}
assert.equal(JSON.stringify(Q.all),before);
assert.throws(()=>X.localize(Q.get('block-b-0'),'de'));
for(const lang of ['en','de'])assert.equal(X.fragments(lang).flatMap(g=>g.items).length,13);
const state={version:1,attempts:[],cursor:-1,catalog:{topic:'all',type:'all',origin:'all',answers:false},reading:{chapter:null,positions:{},read:[]},returnTo:null};
assert.ok(NNLearn.valid(state));
assert.ok(NNLearn.valid({...state,examLanguage:'de',examPracticeIndex:0}));
assert.ok(NNLearn.valid({...state,examLanguage:'en',examPracticeIndex:1}));
assert.equal(NNLearn.valid({...state,examLanguage:'fr'}),false);
assert.equal(NNLearn.valid({...state,examPracticeIndex:2}),false);
console.log('PASS: seven faithful translations, stable answer IDs/keys, unchanged catalog, fragments and save validation.');
