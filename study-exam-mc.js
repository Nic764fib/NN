/* Faithful bilingual transcription of all 20 entries on page 4.
 * Topic fragments remain visible, but have no invented True/False key. */
(function(root){
 'use strict';
 const Q=root.NNQuestions||require('./study-questions.js'),M=root.NNMC||require('./study-mc.js');
 const groups=[
  ['a','Types of Neural Networks','Typen neuronaler Netze','netze'],
  ['b','Threshold Logic Units','Schwellenlogikeinheiten (TLU)','tlu'],
  ['c','Multi-Layer Perceptron and Radial Basis Functions','Mehrschichtiges Perzeptron und radiale Basisfunktionen','approx'],
  ['d','Training Neural Networks','Training neuronaler Netze','lernen'],
  ['e','Distance Functions','Abstandsfunktionen','abstaende'],
  ['f','Hopfield Networks','Hopfield-Netze','hopfield']
 ];
 const ids=groups.map(g=>'original-block-'+g[0]);
 const translations={
  b2:{text:'Bei zwei Eingängen gibt es mehr linear separierbare Kombinationen als linear nicht separierbare Kombinationen.',explanation:'For two binary inputs, 14 of the 16 Boolean functions are linearly separable. Only XOR and XNOR are not.',correction:''},
  b3:{text:'Wenn die beiden Klassen eines Zweiklassenproblems linear separierbar sind, gibt es mindestens einen Punkt, der beiden konvexen Hüllen gemeinsam ist.',explanation:'A common point of the convex hulls prevents strict linear separation. For finite point sets, disjoint convex hulls permit strict linear separation.',correction:'Strictly linearly separable classes have disjoint convex hulls.'},
  f1:{text:'Das Netz hat symmetrische Gewichte und Einsen auf der Hauptdiagonale.',explanation:'The standard Hopfield network has symmetric weights and no self-connections. Its diagonal entries are zero.',correction:'The weights are symmetric, and the diagonal entries are zero.'},
  f2:{text:'Die Anzahl der versteckten Neuronen ist gleich der Anzahl der Eingabeneuronen.',explanation:'The state neurons serve as both input and output neurons. There is no separate hidden layer.',correction:'A standard Hopfield network has no separate hidden neurons; its state neurons are both inputs and outputs.'},
  f3:{text:'Wenn ein Wert aktualisiert wird und dadurch ein neuer Zustand entsteht, kehrt das Netz aufgrund der Symmetrie zum vorherigen Zustand zurück, wenn dieser Wert sofort erneut ersetzt wird.',explanation:'The word “replaced” is imprecise in the source. Here it is interpreted as immediately updating the same neuron again. Without self-connections or changes to the other neurons, its inputs are unchanged, so it keeps its new value.',correction:'Immediately updating the same neuron again leaves its new value unchanged, provided the other neurons have not changed and there is no self-connection.'},
  f4:{text:'Bipolare und unipolare Netze sind hinsichtlich ihrer Berechnungsleistung gleichwertig.',explanation:'The state encodings can be converted into one another. The weights and thresholds must also be transformed appropriately.',correction:''},
  f5:{text:'Das asynchrone Aktualisieren der Knoten, ohne Knoten auszulassen, führt immer zu einem stabilen Zustand.',explanation:'This refers to the standard Hopfield network with fixed symmetric weights, a zero diagonal and the stated threshold rule. Fair asynchronous updates reach a stable state. Synchronous updates are not covered, and a global energy minimum is not guaranteed.',correction:''}
 };

 const fragmentTranslations={
  a:['Mehrschichtiges Perzeptron (MLP)','RBF-Netze','Lernende Vektorquantisierung (LVQ)','Selbstorganisierende Karten (SOM)','Hopfield-Netze'],
  b:['TLU mit n Eingängen. n-dimensionaler Hyperwürfel.'],
  c:['Vergleich der Berechnungsleistung von MLPs mit linearen Aktivierungsfunktionen und RBF-Netzen'],
  d:['QuickProp','RMSProp und Adam'],
  e:['Dreiecksungleichung','Assoziativität','Transitivität','Identität']
 };

 const fragments=language=>M.originalFragments.map(([group,items])=>({group,title:groups.find(g=>g[0]===group)[language==='en'?1:2],items:language==='en'?items:fragmentTranslations[group]}));
 const blocks=groups.map(([group,title,titleDe,topic])=>{
  const fragmentRows=(M.originalFragments.find(g=>g[0]===group)?.[1]||[]).map((text,i)=>({
   id:group+(i+1)+'-fragment',text,textDe:fragmentTranslations[group][i],correct:null,fragment:true,verbatim:true,
   explanation:'Die Vorlage enthält hier nur ein Stichwort, keine vollständige Wahr/Falsch-Aussage. Deshalb wird dieser Eintrag nicht als richtig oder falsch gewertet.',
   explanationEn:'The source provides only a topic fragment, not a complete true/false statement. This entry therefore has no scored true/false answer.',
   correction:'',topic
  }));
  const original=Q.get('original-block-'+group);
  return {id:'original-block-'+group,group,title,titleDe,topic,type:'block',provenance:'original',officialScore:group==='f',
   source:'Aufgabenübersicht 2024 · Seite 4 · Task 6('+group+')',
   options:[...fragmentRows,...(original?.options||[])]};
 });
 const get=id=>blocks.find(q=>q.id===id);
 function localize(block,language){
  const q=get(typeof block==='string'?block:block?.id);
  if(!q)throw new Error('Not an original exam block');
  const english=language==='en';
  return {...q,title:english?q.title:q.titleDe,language:english?'en':'de',options:q.options.map(o=>{
   if(o.fragment)return {...o,text:english?o.text:o.textDe,explanation:english?o.explanationEn:o.explanation};
   const t=translations[o.concept];
   return {...o,text:english?o.text:t.text,explanation:english?t.explanation:o.explanation,correction:english?t.correction:o.correction};
  })};
 }
 function grade(q,answers){
  const opts=q.options.filter(o=>typeof o.correct==='boolean');
  const correct=opts.filter(o=>['true','false'].includes(answers[o.id])&&(answers[o.id]==='true')===o.correct).length;
  return {correct,total:opts.length,ungraded:q.options.length-opts.length,all:opts.length>0&&correct===opts.length,
   score:q.officialScore?Math.max(0,opts.reduce((n,o)=>n+(!['true','false'].includes(answers[o.id])?0:(answers[o.id]==='true')===o.correct?1:-1),0)):null};
 }
 // The former trainer had only b/f. Preserve its position and answers without
 // changing the shared practice history or silently answering the new fragments.
 function migrate(l){
  if(l.exam?.version===1)return l.exam;
  const oldIds=['original-block-b','original-block-f'];
  const hasOldPosition=Number.isInteger(l.examPracticeIndex)&&l.examPracticeIndex>=0&&l.examPracticeIndex<2;
  const exam={version:1,index:hasOldPosition?ids.indexOf(oldIds[l.examPracticeIndex]):0,attempts:{}};
  for(const id of oldIds){
   const old=(l.attempts||[]).findLast(a=>a.qid===id);if(!old)continue;
   exam.attempts[id]={answers:{...old.answers},submitted:old.submitted,helped:old.helped,at:old.at};
  }
  l.exam=exam;return exam;
 }
 function valid(exam){
  if(exam===undefined)return true;
  if(!exam||exam.version!==1||!Number.isInteger(exam.index)||exam.index<0||exam.index>=ids.length||!exam.attempts||typeof exam.attempts!=='object'||Array.isArray(exam.attempts))return false;
  return Object.entries(exam.attempts).every(([id,a])=>{
   const q=get(id);return q&&a&&typeof a.submitted==='boolean'&&typeof a.helped==='boolean'&&Number.isFinite(a.at)&&a.answers&&typeof a.answers==='object'&&!Array.isArray(a.answers)&&Object.entries(a.answers).every(([k,v])=>q.options.some(o=>o.id===k)&&['true','false','skip'].includes(v));
  });
 }
 root.NNExamMC={ids,blocks,get,localize,fragments,grade,migrate,valid};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNExamMC;
})(typeof globalThis!=='undefined'?globalThis:this);
