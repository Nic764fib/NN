/* Compact, self-contained exam answers; the detailed teaching solutions stay in study-content.js. */
(function(root){
 'use strict';
 const C=NNCore,V=NNVisual,T=String.raw,f=C.fmt,v=C.vec,table=NNContent.table;
 const math=s=>`$${s}$`,sign=s=>s.map(x=>x>0?'+':'−').join('');
 const difference=(name,n)=>n===0?name:n>0?`${name}-${f(n)}`:`${name}+${f(-n)}`;
 const distanceCalculation=(point,center)=>point.map((x,i)=>`(${f(x)}-(${f(center[i])}))^2`).join('+');
 const weightedTerms=(weights,start=1)=>weights.map((w,i)=>`${w<0?'-':i?'+':''}${Math.abs(w)===1?'':f(Math.abs(w))}h_${i+start}`).join('');
 const outputFormula=(weights,start=1,bias=null)=>{
  const lines=[];
  for(let i=0;i<weights.length;i+=3){const terms=weightedTerms(weights.slice(i,i+3),start+i),plus=weights[i]>=0?'+':'';lines.push(i?`&${plus}${terms}`:T`\widehat f(x)&=${bias===null?'':f(bias)+plus}${terms}`);}
  return T`\begin{aligned}${lines.join(T`\\`)}\end{aligned}`;
 };

 function tlu(t,p){
  const o=t.kind==='original',m=p.model;
  const borders=o?[T`m_{BC}=\frac{4-1}{4-3}=3\quad\Rightarrow\quad x_2=3x_1-8`,T`m_{DA}=\frac{4-3}{1-3}=-\frac12\quad\Rightarrow\quad x_2=-\frac12x_1+\frac92`]:[T`m_{BC}=\frac{2-5}{3-2}=-3\quad\Rightarrow\quad x_2=11-3x_1`,T`m_{DA}=\frac{5-4}{5-3}=\frac12\quad\Rightarrow\quad x_2=\frac12x_1+\frac52`];
  const conditions=o?[T`-x_2\ge-4`,T`-3x_1+x_2\ge-8`,T`x_1\ge3`,T`x_1+2x_2\ge9`]:[T`-x_2\ge-5`,T`3x_1+x_2\ge11`,T`-x_1\ge-3`,T`-x_1+2x_2\ge5`];
  return T`<p>Ich wähle <strong>2 Eingabeneuronen, 4 verdeckte TLUs und 1 Ausgabe-TLU</strong>.</p><p>Für jede TLU gilt: <strong>Gewichtete Summe ≥ Schwelle → Ausgabe 1, sonst 0.</strong></p><h3>Kurze Nebenrechnung</h3><p>Die beiden schrägen Begrenzungen berechne ich aus den Eckpunkten:</p>`+
   borders.map(b=>`$$${b}$$`).join('')+
   `<h3>Netzparameter</h3>`+table(['Neuron','Bedingung für Ausgabe 1','Eingangsgewichte (w₁; w₂)','Schwelle'],m.params.map((r,i)=>['h'+(i+1),math(conditions[i]),v(r.slice(0,2)),f(r[2])]))+
   T`<p>Am Ausgang verwende ich die Gewichte <strong>(2; 2; 1; 1)</strong> und die <strong>Schwelle 5</strong>:</p>$$y=\begin{cases}1,&2h_1+2h_2+h_3+h_4\ge5,\\0,&\text{sonst}.\end{cases}$$<p>Damit müssen $h_1$ und $h_2$ aktiv sein sowie mindestens eines von $h_3,h_4$.</p><p>Die Eingaben sind gemäß Tabelle mit den Hidden-Neuronen verbunden. Diese führen mit den angegebenen Ausgangsgewichten zum Ausgabe-Neuron. Alle Ausgabefunktionen sind Identitäten.</p><p><strong>Kontrolle:</strong> Beide Pflichttests und eine Alternative ergeben $2+2+1=5$. Fehlt ein Pflichttest oder fehlen beide Alternativen, ist die Summe höchstens $4$.</p>`;
 }

 function rbf(p){const {centers,r}=p.model,q=centers[1],left=q[0]<centers[0][0];
  return T`<p>Ich verwende <strong>2 Eingaben, 3 RBF-Neuronen und einen linearen Ausgang</strong>.</p><p>Die gewünschte Fläche entsteht aus einer <strong>Raute</strong>, von der ich das <strong>obere ${left?'linke':'rechte'} und das untere ${left?'rechte':'linke'} Quadrat</strong> abziehe.</p>`+
   table(['Neuron','Zentrum','Distanz','Radius','Ausgangsgewicht'],centers.map((c,i)=>[`h${i+1}: ${i?'Quadrat '+(i===1?'oben':'unten'):'Raute'}`,v(c),i?'Maximum (L∞)':'Manhattan (L₁)',f(i?r/2:r),i?'−1':'+1']))+
   T`<h3>Kurze Nebenrechnung</h3><p>Für das obere Abzugsquadrat:</p>$$c_2=\left(\frac{${q[0]-r/2}+${q[0]+r/2}}2;\frac{${q[1]-r/2}+${q[1]+r/2}}2\right)=${v(q)},$$$$r_2=\frac{${q[0]+r/2}-(${q[0]-r/2})}2=${r/2}.$$<h3>Netzeingaben und Aktivierung</h3>`+
   centers.map((c,i)=>`$$d_${i+1}=`+(i?T`\max\bigl(|${difference('x_1',c[0])}|,|${difference('x_2',c[1])}|\bigr)`:T`|${difference('x_1',c[0])}|+|${difference('x_2',c[1])}|`)+'$$').join('')+
   T`<p>Für jedes Hidden-Neuron gilt:</p><ul><li><strong>Abstand höchstens Radius → Ausgabe 1.</strong></li><li><strong>Abstand größer als Radius → Ausgabe 0.</strong></li></ul><p>Der Ausgang ist linear, mit Schwelle $0$:</p>$$\boxed{y=h_1-h_2-h_3}$$<p>Alle Ausgabefunktionen sind Identitäten. Beide Eingabekoordinaten gehen in jedes RBF-Neuron ein; die Hidden-Ausgaben werden mit den Tabellengewichten zum Ausgang geführt.</p><h3>Kurze Kontrolle</h3><ul><li>Gewünschte Fläche: $1-0-0=1$.</li><li>Abgezogenes Dreieck: $1-1-0=0$.</li><li>Außerhalb der Raute: $0-h_2-h_3\le0$.</li></ul><p>Ränder sind laut Aufgabe egal.</p>`;
 }

 function approximationSketch(a,mlp){
  const truth=Array.from({length:81},(_,i)=>{const x=a.start+(a.end-a.start)*i/80;return [x,a.f(x)];});
  const approx=mlp?a.xs.slice(0,-1).flatMap((x,i)=>[[x,a.ys[i]],[a.xs[i+1],a.ys[i]],[a.xs[i+1],a.ys[i+1]]]):a.xs.map((x,i)=>[x,a.ys[i]]);
  const low=Math.min(...truth.map(p=>p[1]),...a.ys)-1,high=Math.max(...a.ys)+1;
  return `<figure class="exam-sketch">${V.plane({range:[a.start,a.end,low,high],curves:[truth,approx],axes:['x','y'],title:mlp?'MLP-Stufennäherung':'RBF-Interpolation',width:560,height:265})}<figcaption>Gestrichelt: Zielfunktion. Orange: ${mlp?'Stufennäherung; an jeder Sprungstelle gilt die neue Höhe.':'lineare Verbindung der Stützwerte.'}</figcaption></figure>`;
 }

 function approximation(t,p){
  if(p.id==='verbessern')return T`<ol><li><strong>Mehr Hidden-Neuronen und zusätzliche Stützstellen</strong> verwenden, soweit die erlaubte Neuronenzahl das zulässt.</li><li><strong>Die Parameter gezielt anpassen:</strong> beim MLP Schwellen und Gewichte, beim RBF Zentren, Breiten und Gewichte. Danach den Näherungsfehler vergleichen.</li></ol>`;
  const m=t.parts.find(p=>p.model?.coeff).model,a=C.approximation(m.coeff,m.start,m.end,m.step),mlp=p.id==='mlp';
  const values=mlp?table(['x','f(x)','Änderung zum vorherigen Wert'],a.xs.map((x,i)=>[f(x),f(a.ys[i]),i?f(a.deltas[i-1]):'Startwert'])):table(['Neuron','Zentrum cᵢ','Ausgangsgewicht f(cᵢ)'],a.xs.map((x,i)=>['h'+i,f(x),f(a.ys[i])]));
  if(mlp){const calculation=x=>T`${a.coeff[0]===1?'':f(a.coeff[0])+T`\cdot`}(${f(x)})^2+(${f(a.coeff[1])})\cdot(${f(x)})+${f(a.coeff[2])}`;
   return T`<p>Ich wähle Stützstellen im Abstand $${a.step}$, von $${a.start}$ bis $${a.end}$, und berechne:</p>`+values+
    T`<h3>Kurze Nebenrechnung</h3>$$f(${a.xs[0]})=${calculation(a.xs[0])}=${a.ys[0]},$$$$f(${a.xs[1]})=${calculation(a.xs[1])}=${a.ys[1]}.$$<p>Erstes Ausgangsgewicht: $${a.ys[1]}-${a.ys[0]}=${a.deltas[0]}$.</p><h3>Netzparameter</h3><p>Ich verwende <strong>1 Eingabe, 8 Hidden-TLUs und 1 linearen Ausgang</strong>, insgesamt <strong>10 Neuronen</strong>. Alle Eingangsgewichte der Hidden-TLUs sind $1$.</p>`+
    table(['Hidden-Neuron','Schwelle','Gewicht zum Ausgang'],a.deltas.map((d,i)=>['h'+(i+1),f(a.xs[i+1]),f(d)]))+
    T`<p>Jede Hidden-TLU liefert $1$, sobald $x$ ihre Schwelle erreicht, sonst $0$.</p><p>Der lineare Ausgang addiert den Startwert und die gewichteten Hidden-Ausgaben:</p>$$${outputFormula(a.deltas,1,a.ys[0])}$$<p>Der Startwert $${a.ys[0]}$ wird durch den <strong>Ausgangsbias $+${a.ys[0]}$</strong> erzeugt. Bei der Schreibweise „Netzeingabe minus Schwelle“ ist die <strong>Ausgangsschwelle $${-a.ys[0]}$</strong>. Alle Ausgabefunktionen sind Identitäten.</p><h3>So zeichne ich die Näherung</h3><p>Ab $${a.start}$ auf Höhe $${a.ys[0]}$ beginnen. Bei jeder Schwelle auf den nächsten Tabellenwert springen. An der Sprungstelle gilt bereits die neue Höhe; bei $x=${a.end}$ ist die Ausgabe $${a.ys.at(-1)}$.</p>`+approximationSketch(a,true);
  }
  const mid=a.start+a.step/2;
  return T`<p>Ich verwende <strong>1 Eingabe, 9 RBF-Neuronen und 1 linearen Ausgang</strong>, insgesamt <strong>11 Neuronen</strong>.</p><p>Die Zentren sind die Stützstellen. Die Ausgangsgewichte sind direkt die zugehörigen Funktionswerte:</p>`+values+
   T`<p><strong>Alle Radien: $${a.step}$.</strong> Ausgangsschwelle: $0$.</p><p>Für jedes RBF-Neuron mit Zentrum $c_i$ gilt:</p>$$d_i=|x-c_i|,\qquad h_i=\max\left(0,1-${a.step===1?'d_i':T`\frac{d_i}{${a.step}}`}\right).$$<p>Der lineare Ausgang addiert die gewichteten Hidden-Ausgaben:</p>$$${outputFormula(a.ys,0)}$$<p>Alle Ausgabefunktionen sind Identitäten. Die Eingabe geht in jedes RBF-Neuron; jedes Hidden-Neuron ist mit seinem Tabellengewicht mit dem Ausgang verbunden.</p><h3>So zeichne ich die Näherung</h3><p>Die neun Punkte aus Zentrum und Funktionswert einzeichnen und jeweils mit einer <strong>geraden Linie</strong> verbinden.</p><p>Kontrolle zwischen den ersten beiden Zentren:</p>$$\widehat f(${mid})=0.5\cdot${a.ys[0]}+0.5\cdot${a.ys[1]}=${a.rbf(mid)}.$$`+approximationSketch(a,false);
 }

 function lvq(p){
  const m=p.model,data=C.lvq(m.initial,m.points,m.eta,m.rule),supervised=m.rule==='winner';
  const update=r=>{const i=r.win,old=r.old[i],other=r.old[1-i];return T`<p>Also gewinnt $${old.label}$${supervised?`, ${r.signs[i]>0?'richtige':'falsche'} Klasse → ${r.signs[i]>0?'anziehen':'abstoßen'}`:''}:</p>$$\begin{aligned}${old.label}_{neu}&=${v(old.v)}${r.signs[i]>0?'+':'-'}${m.eta}\bigl(${v(r.point.v)}-${v(old.v)}\bigr)\\&=\boxed{${v(r.centers[i].v)}}.\end{aligned}$$<p>$${other.label}$ bleibt bei $${v(other.v)}$.</p>`;};
  return T`<p>Ich verwende die <strong>Gewinnerregel: Nur der nächstgelegene Prototyp wird verändert.</strong></p>`+
   (supervised?T`<p>Ich beginne erneut mit den ursprünglichen Prototypen.</p><ul><li>Richtige Klasse: Gewinner zum Datenpunkt hinbewegen.</li><li>Falsche Klasse: Gewinner vom Datenpunkt wegbewegen.</li></ul>`:'')+
   T`<p>Start: $A=${v(m.initial[0].v)}$, $B=${v(m.initial[1].v)}$, Lernrate $\eta=${m.eta}$.</p>`+
   data.rows.map((r,i)=>T`<h3>${i+1}. Punkt $${r.point.name}=${v(r.point.v)}$</h3><p>${i?'Jetzt verwende ich bereits die nach dem ersten Punkt veränderten Prototypen.':'Zum Vergleichen reichen die quadrierten Abstände.'}</p>`+r.old.map((old,k)=>T`$$d_${old.label}^2=${distanceCalculation(r.point.v,old.v)}=${f(r.ds[k])}.$$`).join('')+update(r)).join('')+
   T`<h3>Gesamtänderungen gegenüber dem Start</h3>$$\Delta A=${v(data.centers[0].v)}-${v(m.initial[0].v)}=\boxed{${v(data.changes[0])}},$$$$\Delta B=${v(data.centers[1].v)}-${v(m.initial[1].v)}=\boxed{${v(data.changes[1])}}.$$`;
 }

 function som(p){
  const m=p.model,data=C.som(m.grid,m.x,m.eta,m.sigma),winner=m.grid[data.winner],maxI=Math.max(...m.grid.map(r=>r.g[0])),maxJ=Math.max(...m.grid.map(r=>r.g[1])),den=2*m.sigma*m.sigma,w=data.rows[data.winner];
  const left=data.rows.find(r=>r.g[0]===winner.g[0]-1&&r.g[1]===winner.g[1]);
  const answer=T`<p>Gegeben: $x=${v(m.x)}$, Lernrate $\eta=${m.eta}$, Breite $\sigma=${m.sigma}$.</p><p>Ich lese jede Gitterkreuzung als Prototyp. Der Abstand zwischen benachbarten Gitterknoten zählt als <strong>ein Gitterschritt</strong>.</p><h3>Gewinner aktualisieren</h3><p>Der nächste Prototyp und damit der Gewinner ist $r_*=${v(winner.v)}$. Beim Gewinner ist der Nachbarschaftsfaktor $1$:</p>$$\Delta r_*=${m.eta}\bigl(${v(m.x)}-${v(winner.v)}\bigr)=\boxed{${v(w.delta)}}.$$$$r_{*,neu}=\boxed{${v(w.next)}}.$$<h3>Einen Nachbarn berechnen</h3><p>Der linke Nachbar $${v(left.v)}$ liegt einen Gitterschritt entfernt:</p>$$h=e^{-1/(2\cdot${m.sigma}^2)}=e^{-1/${den}}.$$$$\Delta r=${m.eta}e^{-1/${den}}${v(m.x.map((x,k)=>x-left.v[k]))}\approx${v(left.delta)}.$$$$r_{neu}\approx\boxed{${v(left.next)}}.$$<h3>Alle Gitterpunkte angeben</h3><p>Für jeden alten Prototyp $r=(a;b)$ mit $a=0,5,\ldots,${5*maxI}$ und $b=0,5,\ldots,${5*maxJ}$ gilt:</p>$$\boxed{\Delta r=${m.eta}\,e^{-\frac{((a-${winner.v[0]})/5)^2+((b-${winner.v[1]})/5)^2}{${den}}}\begin{pmatrix}${m.x[0]}-a\\${m.x[1]}-b\end{pmatrix}}$$$$r_{neu}=(a;b)+\Delta r.$$<p>Die Division durch $5$ wandelt die Koordinatenabstände in Gitterschritte um. Alle Änderungen werden aus dem <strong>alten Gitter</strong> berechnet. Die Formel erfasst alle <strong>${data.rows.length} Änderungen</strong>; ohne Abschneideregel lernen auch weiter entfernte Neuronen.</p>`;
  return answer+(data.rows.length<=9?table(['Alter Prototyp','Änderung Δr ≈','Neuer Prototyp ≈'],data.rows.map(r=>[v(r.v),v(r.delta),v(r.next)])):'');
 }

 function hopfield(t,p){
  const m=p.model,rows=C.hopfield(m.W,m.theta),o=t.kind==='original';
  const nets=o?T`net_1=-2s_2,\quad net_2=-2s_1-2s_3,\quad net_3=-2s_2`:T`net_1=s_2-s_3,\quad net_2=s_1+2s_3,\quad net_3=-s_1+2s_2`;
  const example=rows[0],update=m.W[1].filter((_,j)=>j!==1).map(w=>T`(${w})\cdot(-1)`).join('+');
  return T`<p>Ich schreibe $+$ für $+1$ und $-$ für $-1$. Die Reihenfolge ist immer $(s_1,s_2,s_3)$.</p><p>Aus den Gewichten ergeben sich:</p>$$${nets}.$$<p>Die Schwellen sind $\theta=${v(m.theta)}$.</p><p>Bei einem Update gilt: <strong>Netzeingabe ≥ Schwelle → +1, sonst −1.</strong> Die beiden anderen Neuronen bleiben unverändert.</p>`+
   table(['Alter Zustand','(net₁; net₂; net₃)','Nur Neuron 1','Nur Neuron 2','Nur Neuron 3'],rows.map(r=>[r.stable?`<strong>${sign(r.s)} ★</strong>`:sign(r.s),v(r.net),...r.next.map(sign)]))+
   T`<h3>Eine Beispielrechnung</h3><p>Bei $---$ und Update von Neuron 2:</p>$$net_2=${update}=${example.net[1]}${example.net[1]>=m.theta[1]?'\\ge':'<'}${m.theta[1]}.$$<p>Nur die zweite Stelle wird aktualisiert: <strong>−−− → ${sign(example.next[1])}</strong>.</p><h3>Zustandsgraph zeichnen</h3><p>Die acht Zustände als Kreise zeichnen und die drei Nachfolger jeder Tabellenzeile als Pfeile übertragen. $u_1,u_2,u_3$ bezeichnen das jeweils aktualisierte Neuron.</p>`+
   V.graph(rows,'exam-hop-'+t.id,o?{layout:'exam-original'}:{})+
   `<p><strong>Stabile Zustände: ${rows.filter(r=>r.stable).map(r=>sign(r.s)).join(' und ')}.</strong> Bei ihnen bleibt der Zustand bei jedem der drei Einzelupdates unverändert.</p>`;
 }

 const repairs=[
  T`<p>$(1,1)$ liefert $1+1=2\le4$. Die gewünschte Seite ist $x_1+x_2\le4$, also $-x_1-x_2\ge-4$. Damit $(w_1,w_2;\theta)=(-1,-1;-4)$.</p>`,
  T`<p>Zentrum $c=((2+6)/2,(1+5)/2)=(4,3)$. Der Radius ist die halbe Seitenlänge: $\sigma=(6-2)/2=2$.</p>`,
  T`<p>Ausgabegewicht des zweiten Sprungs: $\Delta y_2=6-4=2$. Kontrolle: $7+(4-7)+(6-4)=6$.</p>`,
  T`$$r'=r+0.5(q-r)=(3,5)+0.5(6,-4)=(6,3).$$`,
  T`<p>$net_2=0\ge-2=\theta_2$, also $s_2'=+1$. Nur Neuron 2 ändert sich: $s'=(1,1,-1)$.</p>`,
  T`$$d_G^2=(1-2)^2+(2-1)^2=1+1=2.$$`
 ];
 function compact(t,p){
  if(t.kind==='repair')return repairs[Number(t.id.split('-')[1])];
  if(t.family==='tlu')return tlu(t,p);
  if(t.family==='rbf')return rbf(p);
  if(t.family==='approx')return approximation(t,p);
  if(t.family==='learning')return p.id==='som'?som(p):lvq(p);
  if(t.family==='hopfield')return hopfield(t,p);
  throw new Error('Missing compact exam answer: '+t.id+'/'+p.id);
 }
 function memory(t,p){
  if(t.kind==='repair')return '';
  const text=t.family==='tlu'?'Jede Begrenzung als Ungleichung schreiben. Die Zahlen vor x₁ und x₂ werden zu Gewichten, die Zahl rechts zur Schwelle. Anschließend die Teilbedingungen am Ausgang verknüpfen.':t.family==='rbf'?'Die Distanzformel prüft jeden beliebigen Eingabepunkt. Einen einzelnen Abstandswert berechnest du erst, wenn ein konkreter Punkt eingesetzt wird.':t.family==='approx'&&p.id!=='verbessern'?'MLP: Startwert plus Änderungen. RBF mit diesen Dreiecksfunktionen: Zentren plus Funktionswerte.':'';
  return text?`<aside class="exam-memory"><strong>Zum Merken</strong><p>${text}</p></aside>`:'';
 }
 function html(t,p,{expanded=false,extra=''}={}){return `<section class="exam-answer"><h2>Kompakte Klausur-Musterlösung</h2>${compact(t,p)}${memory(t,p)}</section><details class="detailed-solution" data-explanation ${expanded?'open':''}><summary>Ausführlicher Rechenweg</summary>${p.solution}${extra}</details>`;}
 root.NNExamSolutions={compact,html};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNExamSolutions;
})(typeof globalThis!=='undefined'?globalThis:this);
