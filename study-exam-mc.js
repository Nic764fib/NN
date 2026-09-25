/* Translations for the dedicated exam trainer. The original catalog stays unchanged. */
(function(root){
 'use strict';
 const Q=root.NNQuestions||require('./study-questions.js'),M=root.NNMC||require('./study-mc.js');
 const ids=['original-block-b','original-block-f'];
 const translations={
  b2:{text:'Bei zwei Eingängen gibt es mehr linear separierbare Kombinationen als linear nicht separierbare Kombinationen.',explanation:'For two binary inputs, 14 of the 16 Boolean functions are linearly separable. Only XOR and XNOR are not.',correction:''},
  b3:{text:'Wenn die beiden Klassen eines Zweiklassenproblems linear separierbar sind, gibt es mindestens einen Punkt, der beiden konvexen Hüllen gemeinsam ist.',explanation:'A common point of the convex hulls prevents strict linear separation. For finite point sets, disjoint convex hulls permit strict linear separation.',correction:'Strictly linearly separable classes have disjoint convex hulls.'},
  f1:{text:'Das Netz hat symmetrische Gewichte und Einsen auf der Hauptdiagonale.',explanation:'The standard Hopfield network has symmetric weights and no self-connections. Its diagonal entries are zero.',correction:'The weights are symmetric, and the diagonal entries are zero.'},
  f2:{text:'Die Anzahl der versteckten Neuronen ist gleich der Anzahl der Eingabeneuronen.',explanation:'The state neurons serve as both input and output neurons. There is no separate hidden layer.',correction:'A standard Hopfield network has no separate hidden neurons; its state neurons are both inputs and outputs.'},
  f3:{text:'Wenn ein Wert aktualisiert wird und dadurch ein neuer Zustand entsteht, kehrt das Netz aufgrund der Symmetrie zum vorherigen Zustand zurück, wenn dieser Wert sofort erneut ersetzt wird.',explanation:'The word “replaced” is imprecise in the source. Here it is interpreted as immediately updating the same neuron again. Without self-connections or changes to the other neurons, its inputs are unchanged, so it keeps its new value.',correction:'Immediately updating the same neuron again leaves its new value unchanged, provided the other neurons have not changed and there is no self-connection.'},
  f4:{text:'Bipolare und unipolare Netze sind hinsichtlich ihrer Berechnungsleistung gleichwertig.',explanation:'The state encodings can be converted into one another. The weights and thresholds must also be transformed appropriately.',correction:''},
  f5:{text:'Das asynchrone Aktualisieren der Knoten, ohne Knoten auszulassen, führt immer zu einem stabilen Zustand.',explanation:'This refers to the standard Hopfield network with fixed symmetric weights, a zero diagonal and the stated threshold rule. Fair asynchronous updates reach a stable state. Synchronous updates are not covered, and a global energy minimum is not guaranteed.',correction:''}
 };
 function localize(q,language){
  if(q.provenance!=='original'||!ids.includes(q.id))throw new Error('Not an original exam block');
  const english=language==='en';
  return {...q,language:english?'en':'de',options:q.options.map(o=>{
   const t=translations[o.concept];
   return {...o,text:english?o.text:t.text,explanation:english?t.explanation:o.explanation,correction:english?t.correction:o.correction};
  })};
 }
 const fragmentTranslations={
  a:['Mehrschichtiges Perzeptron (MLP)','RBF-Netze','Lernende Vektorquantisierung (LVQ)','Selbstorganisierende Karten (SOM)','Hopfield-Netze'],
  b:['TLU mit n Eingängen. n-dimensionaler Hyperwürfel.'],
  c:['Vergleich der Berechnungsleistung von MLPs mit linearen Aktivierungsfunktionen und RBF-Netzen'],
  d:['QuickProp','RMSProp und Adam'],
  e:['Dreiecksungleichung','Assoziativität','Transitivität','Identität']
 };
 const fragments=language=>M.originalFragments.map(([group,items])=>({group,title:M.groups.find(g=>g[0]===group)[1],items:language==='en'?items:fragmentTranslations[group]}));
 root.NNExamMC={ids,localize,fragments};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNExamMC;
})(typeof globalThis!=='undefined'?globalThis:this);
