/* Worked exam calculations: formula, named inputs, substitution, result. */
(function(root){
 'use strict';
 const C=NNCore,V=NNVisual,T=String.raw,f=C.fmt,v=C.vec;
 const tex=s=>`$${s}$`,eq=s=>`$$${s}$$`;
 const table=(heads,rows)=>`<div class="table-wrap"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const fold=(title,body)=>`<details class="practice-extra"><summary>${title}</summary>${body}</details>`;
 const group=(title,body)=>`<section class="worked-group"><h3>${title}</h3>${body}</section>`;
 function work(title,formula,values,lines,result,note=''){
  return `<section class="substitution-card"><h4>${title}</h4><div class="substitution-setup"><div><h5>Formel</h5>${eq(formula)}</div><div><h5>Welche Zahl wohin?</h5>${table([T`Zeichen`,'Wert / Herkunft'],values.map(([symbol,value])=>[tex(symbol),value]))}</div></div><div class="substitution-lines"><h5>Einsetzen und rechnen</h5>${lines.map(eq).join('')}</div><div class="substitution-result"><strong>Ergebnis</strong>${eq(result)}</div>${note?`<p class="substitution-note">${note}</p>`:''}</section>`;
 }
 const distance=(a,b)=>a.map((x,i)=>`(${f(x)}-(${f(b[i])}))^2`).join('+');
 const polynomial=(a,x)=>T`${a.coeff[0]===1?'':f(a.coeff[0])+T`\cdot`}(${f(x)})^2+(${f(a.coeff[1])})\cdot(${f(x)})+${f(a.coeff[2])}`;
 const signedTerm=(number,suffix='',first=false)=>`${number<0?'-':first?'':'+'}${f(Math.abs(number))}${suffix}`;
 const fraction=n=>Number.isInteger(n)?f(n):Number.isInteger(n*2)?T`${n<0?'-':''}\frac{${Math.abs(n)*2}}2`:f(n);
 const signedFraction=(n,suffix='')=>`${n<0?'-':'+'}${fraction(Math.abs(n))}${suffix}`;

 function tlu(t,p){
  const m=p.model,o=t.kind==='original',names=[T`A`,'B','C','D'],edges=[T`AB`,'BC','CD','DA'];
  const pointTable=table([T`Eckpunkt`,'Erste Koordinate: waagrecht','Zweite Koordinate: Höhe'],m.points.map((q,i)=>[names[i],q[0],q[1]]));
  let html=group('1. Punkte aus der Zeichnung übernehmen',pointTable+`<p><strong>Für jede Kante:</strong> P = erster Buchstabe, Q = zweiter Buchstabe. Bei BC also P = B und Q = C.</p><p>Für die Geradengleichung verwende ich P. Mit Q erhältst du dieselbe Gerade. Beide Koordinaten müssen aus dem gewählten Punkt stammen. $x_1,x_2$ bleiben dabei die freien Koordinaten auf der Geraden.</p>`);
  edges.forEach((edge,i)=>{
   const P=m.points[i],Q=m.points[(i+1)%4],params=m.params[i],horizontal=P[1]===Q[1],vertical=P[0]===Q[0];
   const bindings=[[T`P`,`${names[i]} = ${v(P)}`],[T`Q`,`${names[(i+1)%4]} = ${v(Q)}`],[T`p_1,p_2`,`${P[0]}; ${P[1]} — aus ${names[i]}`],[T`q_1,q_2`,`${Q[0]}; ${Q[1]} — aus ${names[(i+1)%4]}`]];
   let body='',slope=horizontal?0:vertical?null:(Q[1]-P[1])/(Q[0]-P[0]),b=vertical?null:P[1]-slope*P[0];
   if(horizontal||vertical){const coord=horizontal?2:1,value=P[coord-1];body+=work(horizontal?'Waagrechte Gerade':'Senkrechte Gerade',`x_${coord}=p_${coord}`,bindings,[`p_${coord}=q_${coord}=${value}`],`x_${coord}=${value}`,horizontal?'Gleiche Höhe → waagrechte Gerade.':'Gleiche erste Koordinate → senkrechte Gerade; keine Steigung berechnen.');}
   else{
    body+=work('a. Steigung berechnen',T`m=\frac{q_2-p_2}{q_1-p_1}`,bindings,[T`m=\frac{${Q[1]}-${P[1]}}{${Q[0]}-${P[0]}}`,T`m=\frac{${Q[1]-P[1]}}{${Q[0]-P[0]}}`],`m=${fraction(slope)}`,'Oben und unten dieselbe Reihenfolge: Q minus P.');
    body+=work('b. Einen Punkt in die Geradenformel einsetzen',T`x_2=p_2+m(x_1-p_1)`,[[T`P`,`${names[i]} = ${v(P)}`],[T`p_1`,`${P[0]} — erste Koordinate von ${names[i]}`],[T`p_2`,`${P[1]} — zweite Koordinate von ${names[i]}`],[T`m`,tex(fraction(slope))]],[T`x_2=${P[1]}+(${fraction(slope)})(x_1-${P[0]})`,T`x_2=${P[1]}${signedFraction(slope,'x_1')}${signedFraction(-slope*P[0])}`],`x_2=${fraction(slope)}x_1${signedFraction(b)}`,
     `Auch ${names[(i+1)%4]} geht: ${tex(T`x_2=${Q[1]}+(${fraction(slope)})(x_1-${Q[0]})=${fraction(slope)}x_1${signedFraction(b)}`)}.`);
   }
   const test=i===2?m.tests[1]:m.tests[0],rule=horizontal?T`x_2\le${P[1]}`:vertical?`x_1${o?'\\ge':'\\le'}${P[0]}`:`x_2\\ge${fraction(slope)}x_1${signedFraction(b)}`;
   const numericTest=horizontal?`${test[1]}\\le${P[1]}`:vertical?`${test[0]}${o?'\\ge':'\\le'}${P[0]}`:`${test[1]}\\ge${fraction(slope)}\\cdot${test[0]}${signedFraction(b)}=${f(slope*test[0]+b)}`;
   const changes=horizontal?[T`x_2\le${P[1]}\quad|\cdot(-1)`,`-x_2\\ge${-P[1]}`]:vertical?(o?[`x_1\\ge${P[0]}`]:[T`x_1\le${P[0]}\quad|\cdot(-1)`,`-x_1\\ge${-P[0]}`]):i===1?[rule+T`\quad|${signedTerm(-slope,'x_1')}`,`${params[0]}x_1+x_2\\ge${params[2]}`]:[rule+T`\quad|\cdot2`,T`2x_2\ge${2*b}${signedTerm(2*slope,'x_1')}\quad|${signedTerm(-2*slope,'x_1')}`,`${params[0]}x_1+2x_2\\ge${params[2]}`];
   body+=work('c. Gewünschte Seite prüfen und Gewichte ablesen',T`w_1x_1+w_2x_2\ge\theta`,[[T`(x_1;x_2)`,`${v(test)} — frei gewählter Testpunkt im gewünschten Teil`],[T`\text{Seite}`,horizontal?'unterhalb':vertical?(o?'rechts von CD':'links von CD'):'oberhalb']],[numericTest,...changes,T`(${params[0]})x_1+(${params[1]})x_2\ge${params[2]}`],T`(w_1;w_2;\theta)=${v(params)}`,
    (horizontal||(!o&&vertical))?'Beim Multiplizieren mit −1 dreht sich das Ungleichheitszeichen um.':(i===3?'Mit 2 multiplizieren beseitigt hier den Nenner 2. Danach die x₁-Terme nach links bringen.':'Gewichte = Zahlen vor x₁ und x₂; Schwelle = Zahl rechts.'));
   html+=group(`${i+2}. Kante ${edge}`,body);
  });
  const trace=x=>m.params.map(([a,b,theta])=>a*x[0]+b*x[1]>=theta?1:0);
  html+=group('6. Die vier Tests am Ausgang verbinden',`<p>In dieser Zeichnung gelten AB und BC immer. Zusätzlich genügt CD <strong>oder</strong> DA.</p>`+
   table([T`Innenpunkt`,'h₁: AB','h₂: BC','h₃: CD','h₄: DA'],m.tests.slice(0,2).map(x=>[v(x),...trace(x)]))+
   work('Ausgangsschwelle bestimmen',T`S=2h_1+2h_2+h_3+h_4`,[[T`h_1,h_2`,'Pflichttests: jeweils Gewicht 2'],[T`h_3,h_4`,'Alternativen: jeweils Gewicht 1']],[T`\text{beide Pflichttests + eine Alternative: }2+2+1=5`,T`\text{ein Pflichttest fehlt: maximal }2+1+1=4`,T`\text{beide Alternativen fehlen: }2+2=4`],T`\theta_{out}=5,\qquad (v_1;v_2;v_3;v_4)=(2;2;1;1)`)+
   eq(T`y=\begin{cases}1,&S\ge5,\\0,&S<5.\end{cases}`));
  const x=m.tests[0],hs=trace(x);
  html+=group('7. Einen Punkt vollständig durch das Netz rechnen',table([T`Test`,'Punkt einsetzen','Vergleich','Ausgabe'],m.params.map(([a,b,th],i)=>['h'+(i+1),tex(T`(${a})\cdot${x[0]}+(${b})\cdot${x[1]}=${f(a*x[0]+b*x[1])}`),tex(`${f(a*x[0]+b*x[1])}${hs[i]?'\\ge':'<'}${th}`),hs[i]]))+
   eq(T`S=2\cdot${hs[0]}+2\cdot${hs[1]}+${hs[2]}+${hs[3]}=5\quad\Rightarrow\quad y=1`)+
   `<p>Netz: 2 Eingaben → 4 Hidden-TLUs → 1 Ausgabe-TLU. Alle Ausgabefunktionen sind Identitäten.</p>`);
  return html;
 }

 function rbf(t,p){
  const {centers,r,polys}=p.model,c=centers[0];
  const diamond=[[c[0]-r,c[1]],[c[0],c[1]+r],[c[0]+r,c[1]],[c[0],c[1]-r]];
  const square=q=>[[q[0]-r/2,q[1]-r/2],[q[0]+r/2,q[1]-r/2],[q[0]+r/2,q[1]+r/2],[q[0]-r/2,q[1]+r/2]];
  let html=group('1. Bausteine einzeichnen',`<p>Grundraute: Gewicht +1. Zwei unerwünschte Teile mit Quadraten abdecken: jeweils Gewicht −1.</p>`+V.plane({polygons:[diamond,...centers.slice(1).map(square)],points:centers.map((q,i)=>({x:q[0],y:q[1],label:'c'+(i+1)})),range:[c[0]-r-1,c[0]+r+1,c[1]-r-1,c[1]+r+1],title:'Raute, Abzugsquadrate und ihre Zentren'})+`<p>$c=(c_x;c_y)$: waagrechte und senkrechte Koordinate <strong>desselben</strong> Zentrums.</p>`);
  centers.forEach((q,i)=>{
   const radius=i?r/2:r,bounds=[q[0]-radius,q[0]+radius,q[1]-radius,q[1]+radius];
   let body=work('a. Zentrum berechnen',T`c_x=\frac{x_{min}+x_{max}}2,\quad c_y=\frac{y_{min}+y_{max}}2`,[[T`x_{min}`,`${bounds[0]} — ganz links`],[T`x_{max}`,`${bounds[1]} — ganz rechts`],[T`y_{min}`,`${bounds[2]} — ganz unten`],[T`y_{max}`,`${bounds[3]} — ganz oben`]],[T`c_x=\frac{${bounds[0]}+${bounds[1]}}2=${q[0]}`,T`c_y=\frac{${bounds[2]}+${bounds[3]}}2=${q[1]}`],`c_${i+1}=${v(q)}`);
   if(i)body+=work('b. Quadrat-Radius berechnen',T`r=\frac{x_{max}-x_{min}}2`,[[T`x_{min}`,bounds[0]],[T`x_{max}`,bounds[1]]],[T`r=\frac{${bounds[1]}-(${bounds[0]})}2=\frac{${r}}2`],`r_${i+1}=${radius}`,'Für diese achsenparallelen Quadrate: Radius = halbe Seitenlänge.');
   else body+=work('b. Manhattan-Radius zur rechten Spitze berechnen',T`r=|P_1-c_x|+|P_2-c_y|`,[[T`P`,`${v([q[0]+r,q[1]])} — rechte Rautenspitze`],[T`c_x,c_y`,`${q[0]}; ${q[1]} — gerade berechnetes Zentrum`]],[T`r=|${q[0]+r}-${q[0]}|+|${q[1]}-${q[1]}|`,T`r=${r}+0`],`r_1=${r}`);
   html+=group(`${i+2}. ${i?'Abzugsquadrat '+(i===1?'oben':'unten'):'Grundraute'}`,body);
  });
  const x=[c[0]+(polys[0][1][0]-c[0])/4,c[1]+r/4];
  html+=group('5. Einen Eingabepunkt in alle drei Neuronen einsetzen',`<p>Testpunkt aus der gewünschten Fläche: $x=${v(x)}$. Für jedes Neuron dessen eigenes Zentrum und dessen Radius verwenden.</p>`+centers.map((q,i)=>{
   const ds=x.map((z,k)=>Math.abs(z-q[k])),d=i?Math.max(...ds):ds[0]+ds[1],radius=i?r/2:r;
   return work('Neuron h'+(i+1),i?T`d=\max(|x_1-c_x|,|x_2-c_y|)`:T`d=|x_1-c_x|+|x_2-c_y|`,[[T`x_1,x_2`,`${f(x[0])}; ${f(x[1])} — Eingabepunkt`],[T`c_x,c_y`,`${q[0]}; ${q[1]} — Zentrum dieses Neurons`],[T`r`,radius]],[i?T`d=\max(|${x[0]}-(${q[0]})|,|${x[1]}-(${q[1]})|)` : T`d=|${x[0]}-(${q[0]})|+|${x[1]}-(${q[1]})|`,i?T`d=\max(${ds[0]},${ds[1]})=${d}`:T`d=${ds[0]}+${ds[1]}=${d}`,T`${d}${d<=radius?'\\le':'>'}${radius}`],`h_${i+1}=${d<=radius?1:0}`,'Abstand ≤ Radius → 1; Abstand > Radius → 0.');
  }).join(''));
  return html+group('6. Ausgang berechnen',work('Ausgangsgewichte bestimmen',T`y=v_1h_1+v_2h_2+v_3h_3`,[[T`(h_1;h_2;h_3)`, 'nur Raute: (1; 0; 0); Raute und Abzug: (1; 1; 0) bzw. (1; 0; 1)'],[T`y`, 'gewünschte Fläche: 1; abgezogener Teil: 0']],[T`1=v_1\cdot1\quad\Rightarrow\quad v_1=1`,T`0=1+v_2\quad\Rightarrow\quad v_2=-1`,T`0=1+v_3\quad\Rightarrow\quad v_3=-1`],T`(v_1;v_2;v_3)=(1;-1;-1)`)+work('Beiträge mit ihren Gewichten multiplizieren',T`y=v_1h_1+v_2h_2+v_3h_3`,[[T`v_1,v_2,v_3`,'+1; −1; −1'],[T`h_1,h_2,h_3`,'1; 0; 0 — aus Schritt 5']],[T`y=1\cdot1+(-1)\cdot0+(-1)\cdot0`],T`y=1`)+`<p>Linearer Ausgang, Schwelle 0. Beide Koordinaten gehen in jedes RBF-Neuron; Ausgabefunktionen sind Identitäten.</p>`+table([T`Fall`,'Rechnung','Ausgabe'],[[T`Gewünschte Fläche`,'1 − 0 − 0',1],[T`Raute und ein Abzug`,'1 − 1 − 0',0],[T`Außerhalb der Raute`,tex('0-h_2-h_3'),tex('\\le0')]])+`<p>Ränder sind laut Aufgabe egal.</p>`);
 }

 function approximationPlot(a,mlp){
  const truth=Array.from({length:81},(_,i)=>{const x=a.start+(a.end-a.start)*i/80;return [x,a.f(x)];});
  const curve=mlp?a.xs.slice(0,-1).flatMap((x,i)=>[[x,a.ys[i]],[a.xs[i+1],a.ys[i]],[a.xs[i+1],a.ys[i+1]]]):a.xs.map((x,i)=>[x,a.ys[i]]);
  return `<figure>${V.plane({curves:[truth,curve],range:[a.start,a.end,Math.min(...truth.map(p=>p[1]))-1,Math.max(...a.ys)+1],axes:[T`x`,'y'],title:mlp?'Stufen aus der Tabelle zeichnen':'Die berechneten Stützpunkte durch Geraden verbinden'})}<figcaption>Gestrichelt: Zielfunktion. Orange: ${mlp?'MLP-Stufen; an jeder Sprungstelle gilt die neue Höhe.':'RBF-Näherung aus geraden Verbindungen.'}</figcaption></figure>`;
 }
 function approximation(t,p){
  const m=t.parts.find(p=>p.model?.coeff).model,a=C.approximation(m.coeff,m.start,m.end,m.step),mlp=p.id==='mlp';
  if(p.id==='verbessern')return group('Zwei konkrete Verbesserungen',table([T`Änderung`,'So umsetzen'],[
   [T`Mehr Neuronen innerhalb der Grenze`,tex(T`\text{MLP: }1+10+1=12`)+`; mit 10 Abschnitten ist der Abstand `+tex(T`\Delta x=\frac{${a.end}-(${a.start})}{10}=${(a.end-a.start)/10}`)+'. Funktionswerte und Sprunggewichte neu berechnen.'],
   [T`Parameter anhand des Fehlers anpassen`,'MLP: Schwellen und Gewichte; RBF: Zentren, Radien und Gewichte. Auf denselben Prüfpunkten den Fehler vor und nach der Änderung vergleichen.']
  ])+`<p>Für diese Teilaufgabe genügen die zwei Änderungen; es ist keine neue vollständige Näherung verlangt.</p>`);
  const formula=T`${a.coeff[0]===1?'':a.coeff[0]}x^2${signedTerm(a.coeff[1],'x')}${signedTerm(a.coeff[2])}`;
  let html=group('1. Abstand und '+(mlp?'Stützstellen':'Zentren')+' berechnen',`<p>${mlp?'1 Eingabe + 8 Hidden-TLUs + 1 Ausgang = 10 Neuronen.':'1 Eingabe + 9 RBF-Neuronen + 1 Ausgang = 11 Neuronen.'} Wir wählen 8 Abschnitte und damit 9 Stützstellen.</p>`+
   work('a. Abstand zwischen zwei Stellen',T`\Delta x=\frac{b-a}{N}`,[[T`a`,`${a.start} — linke Intervallgrenze`],[T`b`,`${a.end} — rechte Intervallgrenze`],[T`N`,'8 — gewählte Anzahl der Abschnitte']],[T`\Delta x=\frac{${a.end}-(${a.start})}{8}=\frac{${a.end-a.start}}8`],`\\Delta x=${a.step}`)+
   work('b. Die Stellen der Reihe nach einsetzen',T`x_i=a+i\Delta x`,[[T`a`,a.start],[T`\Delta x`,a.step],[T`i`,'0, 1, …, 8 — laufende Nummer, beginnend bei 0']],[T`x_0=${a.start}+0\cdot${a.step}=${a.xs[0]}`,T`x_1=${a.start}+1\cdot${a.step}=${a.xs[1]}`,T`x_2=${a.start}+2\cdot${a.step}=${a.xs[2]}`],T`x_8=${a.start}+8\cdot${a.step}=${a.end}`)+
   table([T`Nummer i`,'Einsetzen in a + i·Δx','Stelle xᵢ'],a.xs.map((x,i)=>[i,tex(T`${a.start}+${i}\cdot${a.step}`),f(x)])));
  html+=group('2. Funktionswerte berechnen',work('Jedes x in der Funktion durch dieselbe Zahl ersetzen',`f(x)=${formula}`,[[T`x`,`${a.xs[0]} — erste Tabellenstelle`]],[T`f(${a.xs[0]})=${polynomial(a,a.xs[0])}`,T`f(${a.xs[0]})=${f(a.coeff[0]*a.xs[0]**2)}${signedTerm(a.coeff[1]*a.xs[0])}${signedTerm(a.coeff[2])}`],T`f(${a.xs[0]})=${a.ys[0]}`)+
   table([mlp?'Stelle xᵢ':'Zentrum cᵢ','Alle x durch diese Zahl ersetzen','Ergebnis'],a.xs.map((x,i)=>[f(x),tex(polynomial(a,x)),f(a.ys[i])])));
  if(mlp){
   html+=group('3. Ausgangsgewichte als Unterschiede berechnen',work('Neue Höhe minus vorherige Höhe',T`v_i=y_i-y_{i-1}`,[[T`y_1`,`${a.ys[1]} — neue Höhe bei x = ${a.xs[1]}`],[T`y_0`,`${a.ys[0]} — vorherige Höhe bei x = ${a.xs[0]}`]],[`v_1=${a.ys[1]}-(${a.ys[0]})`],`v_1=${a.deltas[0]}`)+
    table([T`Neuron`,'Schwelle xᵢ','Neue Höhe − vorherige Höhe','Ausgangsgewicht vᵢ'],a.deltas.map((d,i)=>['h'+(i+1),a.xs[i+1],tex(`${a.ys[i+1]}-(${a.ys[i]})`),f(d)])));
   const test=a.start+1.5*a.step,hs=a.xs.slice(1).map(th=>test>=th?1:0);
   html+=group('4. Hidden-TLUs festlegen',work('Ab der jeweiligen Schwelle einschalten',T`h_i=\begin{cases}1,&w_{in}x\ge\theta_i,\\0,&w_{in}x<\theta_i\end{cases}`,[[T`w_{in}`,'1 — für alle Hidden-TLUs gewählt'],[T`\theta_1`,`${a.xs[1]} — erste Sprungstelle`],[T`x`,`${test} — Testeingabe`]],[T`1\cdot(${test})\ge${a.xs[1]}`],T`h_1=1`)+
    table([T`Neuron`,'Testeingabe mit Schwelle vergleichen','hᵢ'],a.xs.slice(1).map((th,i)=>['h'+(i+1),tex(`${test}${hs[i]?'\\ge':'<'}${th}`),hs[i]])));
   html+=group('5. Startwert und linearen Ausgang einsetzen',work('Ausgangsschwelle aus dem Startwert bestimmen',T`\widehat f=net-\theta_{out}`,[[T`net`,'0 — vor der ersten Schwelle sind alle hᵢ = 0'],[T`\widehat f`,`${a.ys[0]} — gewünschter Startwert`]],[T`${a.ys[0]}=0-\theta_{out}`,T`\theta_{out}=-${a.ys[0]}`],T`\theta_{out}=${-a.ys[0]}`)+
    work('Testeingabe aus Schritt 4 am Ausgang berechnen',T`\widehat f=y_0+v_1h_1+\cdots+v_8h_8`,[[T`y_0`,a.ys[0]],[T`v_1`,a.deltas[0]],[T`h_1`,'1 — aus Schritt 4'],[T`h_2,\ldots,h_8`,'alle 0 — aus Schritt 4']],[T`\widehat f(${test})=${a.ys[0]}+(${a.deltas[0]})\cdot1+0+\cdots+0`],T`\widehat f(${test})=${a.ys[1]}`)+`<p>Alle Hidden-Eingangsgewichte sind 1. Die Ausgangsgewichte stehen in Schritt 3. Ausgang linear; alle Ausgabefunktionen sind Identitäten.</p>`);
   return html+group('6. Stufen zeichnen',table([T`Von … bis vor …`,'Waagrechte Höhe'],a.xs.slice(0,-1).map((x,i)=>[tex(`[${x};${a.xs[i+1]})`),a.ys[i]]))+`<p>Auf jeder Zeile waagrecht zeichnen. An einer Sprungstelle gilt die neue Höhe. Den rechten Endpunkt $(${a.end};${a.ys.at(-1)})$ extra eintragen.</p>`+approximationPlot(a,true));
  }
  const test=a.start+a.step/2,hs=a.xs.map(c=>Math.max(0,1-Math.abs(test-c)/a.step));
  html+=group('3. Zentren, Radien und Gewichte übernehmen',table([T`Parameter`,'Formel','Hier einsetzen'],[
   [T`Zentrum`,tex('c_i=x_i'),'Stellen aus Schritt 1'],[T`Radius`,tex('r=\\Delta x'),f(a.step)],[T`Ausgangsgewicht`,tex('v_i=f(c_i)'),'Funktionswerte aus Schritt 2']
  ])+`<p>Beispiel: $c_0=${a.xs[0]}$, $r=${a.step}$, $v_0=${a.ys[0]}$.</p>`);
  html+=group('4. Einen Zwischenpunkt vollständig ausrechnen',work('a. Abstand zum ersten Zentrum',T`d_i=|x-c_i|`,[[T`x`,`${test} — Mitte der ersten beiden Zentren`],[T`c_0`,a.xs[0]]],[T`d_0=|${test}-(${a.xs[0]})|`],T`d_0=${a.step/2}`)+
   work('b. Abstand in die Dreiecksaktivierung einsetzen',T`h_i=\max\left(0,1-\frac{d_i}{r}\right)`,[[T`d_0`,a.step/2],[T`r`,a.step]],[T`h_0=\max\left(0,1-\frac{${a.step/2}}{${a.step}}\right)`,T`h_0=\max(0,1-0.5)`],T`h_0=0.5`,'max bedeutet: die größere der beiden Zahlen wählen. Ein negativer zweiter Wert ergibt also 0.')+
   table([T`Neuron / Zentrum`,'Abstand dᵢ','Aktivierung einsetzen','hᵢ'],a.xs.map((c,i)=>{const d=Math.abs(test-c);return ['h'+i+' / '+c,tex(T`|${test}-(${c})|=${f(d)}`),tex(T`\max(0,1-\frac{${f(d)}}{${a.step}})`),f(hs[i])];}))+ 
   work('c. Gewicht mal Aktivierung, dann addieren',T`\widehat f=v_0h_0+v_1h_1+\cdots+v_8h_8`,[[T`v_0,v_1`,`${a.ys[0]}; ${a.ys[1]} — Funktionswerte`],[T`h_0,h_1`,'0.5; 0.5 — eben berechnet'],[T`h_2,\ldots,h_8`,'0 — siehe Tabelle']],[T`\widehat f(${test})=${a.ys[0]}\cdot0.5+${a.ys[1]}\cdot0.5+0+\cdots+0`],T`\widehat f(${test})=${a.rbf(test)}`)+
   `<p>Zum Vergleich: $f(${test})=${polynomial(a,test)}=${f(a.f(test))}$. Zwischenwerte müssen nicht exakt getroffen werden.</p>`);
  return html+group('5. Näherung zeichnen',`<p>Die neun Punkte $(c_i;f(c_i))$ aus Schritt 2 eintragen. Benachbarte Punkte durch gerade Strecken verbinden.</p><p>Ausgang linear, Schwelle 0. Alle Ausgabefunktionen sind Identitäten. Jedes RBF-Neuron erhält x und führt mit seinem Funktionswert als Gewicht zum Ausgang.</p>`+approximationPlot(a,false));
 }

 function lvqCalculation(m,rule){
  const data=C.lvq(m.initial,m.points,m.eta,rule);
  let html=table([T`Startprototyp`,'Vektor','Klasse'],m.initial.map(r=>[r.label,v(r.v),r.label]))+`<p>Reihenfolge: ${m.points.map(p=>`${p.name} = ${v(p.v)} (Klasse ${p.label})`).join(' → ')}. Lernrate η = ${m.eta}. ${rule==='two'?'Hier: beide Prototypen behandeln.':'Hier: nur den Gewinner verändern.'}</p>`;
  data.rows.forEach((r,index)=>{
   let body=`<p><strong>Jetzt einsetzen:</strong> x = ${r.point.name} = ${v(r.point.v)}. ${index?'A und B stehen auf dem Stand nach dem vorigen Punkt.':'A und B stehen auf den Startwerten.'}</p>`+
    table([T`Aktueller Prototyp`,'r₁: erste Koordinate','r₂: zweite Koordinate'],r.old.map(q=>[q.label,q.v[0],q.v[1]]));
   r.old.forEach((q,i)=>{const dif=r.point.v.map((x,k)=>x-q.v[k]);body+=work('a. Abstand zu '+q.label,T`d^2=(x_1-r_1)^2+(x_2-r_2)^2`,[[T`x_1,x_2`,`${r.point.v[0]}; ${r.point.v[1]} — aus Datenpunkt ${r.point.name}`],[T`r_1,r_2`,`${q.v[0]}; ${q.v[1]} — aktueller Prototyp ${q.label}`]],[`d_${q.label}^2=${distance(r.point.v,q.v)}`,`d_${q.label}^2=(${dif[0]})^2+(${dif[1]})^2=${dif[0]**2}+${dif[1]**2}`],`d_${q.label}^2=${r.ds[i]}`);});
   body+=`<p><strong>Gewinner: ${r.old[r.win].label}</strong>, denn ${Math.min(...r.ds)} &lt; ${Math.max(...r.ds)}. Zum Vergleichen ist keine Wurzel nötig.</p>`;
   r.old.forEach((q,i)=>{
    if(!r.signs[i]){body+=`<p>${q.label} bleibt unverändert: $${v(q.v)}$.</p>`;return;}
    const sign=r.signs[i]>0?'+':'-',d=r.point.v.map((x,k)=>x-q.v[k]),change=d.map(z=>r.signs[i]*m.eta*z);
    body+=work('b. '+q.label+(r.signs[i]>0?' anziehen':' abstoßen'),T`r_k^{neu}=r_k${sign}\eta(x_k-r_k),\quad k=1,2`,[[T`x`,`${v(r.point.v)} — Datenpunkt ${r.point.name}`],[T`r`,`${v(q.v)} — alter Vektor ${q.label}`],[T`\eta`,m.eta],[T`\text{Vorzeichen}`,rule==='none'?'+ — ohne Klassen immer anziehen':`${sign} — Datenklasse ${r.point.label}, Prototypklasse ${q.label}`]],q.v.flatMap((z,k)=>[T`r_${k+1}^{neu}=${z}${sign}${m.eta}(${r.point.v[k]}-(${z}))`,T`r_${k+1}^{neu}=${z}${sign}${m.eta}\cdot(${d[k]})=${z}${signedTerm(change[k])}=${f(r.centers[i].v[k])}`]),`${q.label}_{neu}=${v(r.centers[i].v)}`);
   });
   html+=group(`${index+1}. Datenpunkt ${r.point.name}`,body);
  });
  html+=group('3. Gesamtänderungen gegenüber dem ursprünglichen Start',m.initial.map((r,i)=>work('Prototyp '+r.label,T`\Delta r_{gesamt}=r_{Ende}-r_{Start}`,[[T`r_{Ende}`,v(data.centers[i].v)],[T`r_{Start}`,`${v(r.v)} — ursprünglicher Start, nicht letzter Zwischenstand`]],[T`\Delta ${r.label}=${v(data.centers[i].v)}-${v(r.v)}`,T`\Delta ${r.label}=(${f(data.centers[i].v[0])}-(${r.v[0]});\ ${f(data.centers[i].v[1])}-(${r.v[1]}))`],T`\Delta ${r.label}=${v(data.changes[i])}`)).join(''));
  return html;
 }
 function lvq(t,p){
  const m=p.model;
  let html=m.rule==='winner'?`<p><strong>Neu starten.</strong> Richtige Gewinnerklasse → Pluszeichen; falsche Gewinnerklasse → Minuszeichen.</p>`:'';
  html+=lvqCalculation(m,m.rule);
  if(m.rule==='winner'&&t.kind==='original')html+=fold('Alternative: Zweiprototypen-Regel aus Folie 340',`<p>Getrennter Durchlauf mit den Startwerten. Beide Prototypen haben verschiedene Klassen; genau einer passt zum Datenpunkt. Richtigen anziehen, falschen abstoßen.</p>`+lvqCalculation(m,'two'));
  return html;
 }

 function som(t,p){
  const m=p.model,data=C.som(m.grid,m.x,m.eta,m.sigma),winner=data.rows[data.winner],left=data.rows.find(r=>r.g[0]===winner.g[0]-1&&r.g[1]===winner.g[1]);
  const den=2*m.sigma**2;
  const nearest=k=>[...new Set(m.grid.map(r=>r.v[k]))].sort((a,b)=>Math.abs(a-m.x[k])-Math.abs(b-m.x[k])).slice(0,3).sort((a,b)=>a-b);
  let html=group('1. Gewinner im Datenraum finden',T`<p>Datenpunkt $x=${v(m.x)}$, Lernrate $\eta=${m.eta}$, Gaußbreite $\sigma=${m.sigma}$. Im vorgegebenen rechteckigen Startgitter liegen die Koordinaten im Abstand 5.</p>`+
   table([T`Koordinate des Datenpunkts`,'Nahe Gitterkoordinaten vergleichen','Nächste Koordinate'],[0,1].map(k=>[tex(`x_${k+1}=${m.x[k]}`),nearest(k).map(n=>tex(`|${m.x[k]}-${n}|=${Math.abs(m.x[k]-n)}`)).join('<br>'),winner.v[k]]))+
   work('Gewinner-Abstand kontrollieren',T`d_D^2=(x_1-r_1)^2+(x_2-r_2)^2`,[[T`x_1,x_2`,`${m.x[0]}; ${m.x[1]} — Datenpunkt`],[T`r_1,r_2`,`${winner.v[0]}; ${winner.v[1]} — nächster Startprototyp`]],[`d_D^2=${distance(m.x,winner.v)}`,`d_D^2=${(m.x[0]-winner.v[0])**2}+${(m.x[1]-winner.v[1])**2}=${C.dist(m.x,winner.v)}`],`r_*=${v(winner.v)}`));
  html+=group('2. Datenkoordinaten in Gitterindizes umrechnen',work('Jede Startkoordinate durch den Gitterabstand teilen',T`i=\frac{r_1}{5},\qquad j=\frac{r_2}{5}`,[[T`r_*`,v(winner.v)],[T`5`,'Abstand der Startkoordinaten: 0, 5, 10, …']],[T`i_*=${winner.v[0]}/5=${winner.g[0]}`,T`j_*=${winner.v[1]}/5=${winner.g[1]}`],T`(i_*;j_*)=${v(winner.g)}`,'Für die Nachbarschaft die Gitterindizes einsetzen. Für die Vektoränderung die Datenkoordinaten einsetzen.'));
  const workedNeuron=r=>{
   const delta=m.x.map((z,k)=>z-r.v[k]);
   return work('a. Abstand im Gitter',T`d_G^2=(i-i_*)^2+(j-j_*)^2`,[[T`i,j`,`${r.g[0]}; ${r.g[1]} — Index dieses Neurons, aus ${v(r.v)}/5`],[T`i_*,j_*`,`${winner.g[0]}; ${winner.g[1]} — Gewinnerindex`]],[T`d_G^2=(${r.g[0]}-${winner.g[0]})^2+(${r.g[1]}-${winner.g[1]})^2`,T`d_G^2=${(r.g[0]-winner.g[0])**2}+${(r.g[1]-winner.g[1])**2}`],T`d_G^2=${r.d2}`)+
    work('b. Gaußfaktor und wirksame Lernrate',T`h=e^{-d_G^2/(2\sigma^2)},\qquad\alpha=\eta h`,[[T`d_G^2`,r.d2],[T`\sigma`,`${m.sigma} — Breite aus der Aufgabe`],[T`\eta`,`${m.eta} — Lernrate aus der Aufgabe`]],[T`2\sigma^2=2\cdot${m.sigma}^2=${den}`,T`h=e^{-${r.d2}/${den}}\approx${f(r.h)}`,T`\alpha=${m.eta}\cdot e^{-${r.d2}/${den}}`],T`\alpha\approx${f(r.alpha)}`,'Im Taschenrechner: exp(−d² / (2·σ²)). Mit dem ungerundeten Wert weiterrechnen.')+
    work('c. Beide Vektorkoordinaten verändern',T`\Delta r_k=\alpha(x_k-r_k),\quad r_k^{neu}=r_k+\Delta r_k`,[[T`x`,`${v(m.x)} — Datenpunkt`],[T`r`,`${v(r.v)} — alter Prototyp dieses Neurons`],[T`\alpha`,`${f(r.alpha)} (gerundet) — aus b`]],delta.flatMap((d,k)=>[T`x_${k+1}-r_${k+1}=${m.x[k]}-(${r.v[k]})=${d}`,T`\Delta r_${k+1}=\alpha\cdot(${d})\approx${f(r.alpha)}\cdot(${d})\approx${f(r.delta[k])}`,T`r_${k+1}^{neu}=${r.v[k]}+\Delta r_${k+1}\approx${r.v[k]}+(${f(r.delta[k])})\approx${f(r.next[k])}`]),T`\Delta r\approx${v(r.delta)},\quad r_{neu}\approx${v(r.next)}`);
  };
  html+=group('3. Gewinner '+v(winner.v)+' aktualisieren',workedNeuron(winner));
  html+=group('4. Linken Nachbarn '+v(left.v)+' aktualisieren',workedNeuron(left));
  const allResults=table([T`Gitterindex (i; j)`,'Alter Vektor','d² im Gitter','α ≈','Änderung Δr ≈','Neuer Vektor ≈'],data.rows.map(r=>[v(r.g),v(r.v),r.d2,f(r.alpha),v(r.delta),v(r.next)]));
  const rows=data.rows.map(r=>{
   const delta=m.x.map((z,k)=>z-r.v[k]);
   return fold(`Index ${v(r.g)} · alter Vektor ${v(r.v)}`,T`<p>Einsetzen: $(i;j)=${v(r.g)}$, Gewinnerindex $${v(winner.g)}$, $\eta=${m.eta}$, $\sigma=${m.sigma}$, $x=${v(m.x)}$.</p>`+
    eq(T`d_G^2=(${r.g[0]}-${winner.g[0]})^2+(${r.g[1]}-${winner.g[1]})^2=${r.d2}`)+
    eq(T`h=e^{-\frac{${r.d2}}{2\cdot${m.sigma}^2}}\approx${f(r.h)}`)+eq(T`\alpha=${m.eta}\,h\approx${f(r.alpha)}`)+
    [0,1].map(k=>eq(T`\Delta r_${k+1}=\alpha(${m.x[k]}-(${r.v[k]}))=\alpha\cdot(${delta[k]})\approx${f(r.alpha)}\cdot(${delta[k]})\approx${f(r.delta[k])}`)+eq(T`r_${k+1}^{neu}=${r.v[k]}+\Delta r_${k+1}\approx${r.v[k]}+(${f(r.delta[k])})\approx${f(r.next[k])}`)).join(''));
  }).join('');
  html+=group('5. Dasselbe für alle '+data.rows.length+' Neuronen rechnen',`<p>Immer die alten Vektoren verwenden. Nur Index $(i;j)$ und alter Vektor $r$ wechseln; Datenpunkt, Gewinnerindex, Lernrate und Breite bleiben fest.</p>`+fold(`Alle ${data.rows.length} Ergebnisse als Tabelle`,allResults)+fold('Eine bestimmte Zeile vollständig nachrechnen',rows));
  return html;
 }

 function hopfield(t,p){
  const m=p.model,rows=C.hopfield(m.W,m.theta),sign=V.sign;
  const formula=i=>'net_'+(i+1)+'='+m.W[i].map((_,j)=>j===i?'':`w_{${i+1}${j+1}}s_${j+1}`).filter(Boolean).join('+');
  const inserted=(r,i)=>m.W[i].map((w,j)=>j===i?'':T`(${w})\cdot(${r.s[j]})`).filter(Boolean).join('+');
  const update=(r,i)=>{
   const others=[0,1,2].filter(j=>j!==i),comparison=r.net[i]>=m.theta[i]?'\\ge':'<';
   return work('Nur Neuron '+(i+1)+' aktualisieren',formula(i),others.flatMap(j=>[[`w_{${i+1}${j+1}}`,`${m.W[i][j]} — Verbindung zwischen Neuron ${i+1} und ${j+1}`],[`s_${j+1}`,`${r.s[j]} — aus Ausgangszustand ${sign(r.s)}`]]).concat([[`\\theta_${i+1}`,`${m.theta[i]} — Schwelle von Neuron ${i+1}`]]),[
    `net_${i+1}=${inserted(r,i)}`,`net_${i+1}=${others.map((j,k)=>signedTerm(m.W[i][j]*r.s[j],'',k===0)).join('')}=${r.net[i]}`,
    `${r.net[i]}${comparison}${m.theta[i]}\\quad\\Rightarrow\\quad s_${i+1}'=${r.next[i][i]}`
   ],`s'=${v(r.next[i])}`,'Nur diese eine Stelle ersetzen. Die beiden anderen Stellen bleiben wie im Ausgangszustand.');
  };
  let html=group('1. Gewichte, Schwellen und Zustandszeichen übernehmen',table([T`Neuron`,'Gewichte zu den anderen Neuronen','Eigene Schwelle'],m.W.map((w,i)=>['u'+(i+1),w.map((z,j)=>i===j?'':tex(`w_{${i+1}${j+1}}=${z}`)).filter(Boolean).join(', '),m.theta[i]]))+
   `<p>Zustandsreihenfolge: $(s_1;s_2;s_3)$. Zeichen + bedeutet +1, Zeichen − bedeutet −1.</p>`+eq(T`s_i'=\begin{cases}+1,&net_i\ge\theta_i,\\-1,&net_i<\theta_i.\end{cases}`)+`<p>Bei Gleichheit gilt also +1. Die Schwelle wird mit der fertigen Netzeingabe verglichen.</p>`);
  html+=group('2. Ausgangszustand −−−: alle drei Möglichkeiten rechnen',`<p>Einsetzen: $s_1=-1$, $s_2=-1$, $s_3=-1$. <strong>Jedes der drei Updates beginnt wieder bei −−−.</strong></p>`+[0,1,2].map(i=>update(rows[0],i)).join(''));
  html+=group('3. Alle acht Zustände prüfen',table([T`Ausgang`,'(net₁; net₂; net₃)','Nur u₁','Nur u₂','Nur u₃','Stabil?'],rows.map(r=>[sign(r.s),v(r.net),...r.next.map(sign),r.stable?'ja':'nein']))+
   fold('Die übrigen sieben Zustände mit allen Einsetzungen',rows.slice(1).map(r=>fold('Ausgang '+sign(r.s),`<p>Bei jedem Update erneut $s=${v(r.s)}$ einsetzen.</p>`+[0,1,2].map(i=>update(r,i)).join(''))).join('')));
  html+=group('4. Tabelle in Pfeile übertragen',table([T`Schritt`,'Hier ausführen'],[
   [T`Kreise`,'Alle acht Zustände aus der ersten Tabellenspalte einzeichnen.'],
   [T`Pfeil`,'Beispiel: −−− → '+sign(rows[0].next[1])+'; mit u₂ beschriften, weil nur Neuron 2 aktualisiert wird.'],
   [T`Schleife`,'Ist der Nachfolger derselbe Zustand, eine Schleife zeichnen oder das unveränderte Update ausdrücklich in der Tabelle angeben.'],
   [T`Stabil`,'Alle drei Nachfolger stimmen mit dem Ausgang überein: '+rows.filter(r=>r.stable).map(r=>sign(r.s)).join(', ')+'.']
  ])+V.graph(rows,'worked-hop-'+t.id,t.kind==='original'?{layout:'exam-original'}:{})+eq(T`8\text{ Zustände}\cdot3\text{ Einzelupdates}=24\text{ Nachfolger}`));
  return html;
 }

 root.NNWorkedSolutions={render};
 function render(t,p){
  const body=t.family==='tlu'?tlu(t,p):t.family==='rbf'?rbf(t,p):t.family==='approx'?approximation(t,p):t.family==='learning'?(p.id==='som'?som(t,p):lvq(t,p)):hopfield(t,p);
  return `<div class="practice-worked">${body}</div>`;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNWorkedSolutions;
})(typeof globalThis!=='undefined'?globalThis:this);
