/* Compact, self-contained exam answers; the detailed teaching solutions stay in study-content.js. */
(function(root){
 'use strict';
 const C=NNCore,V=NNVisual,T=String.raw,f=C.fmt,v=C.vec,table=NNContent.table;
 const math=s=>`$${s}$`,sign=s=>s.map(x=>x>0?'+':'−').join('');
 const difference=(name,n)=>n===0?name:n>0?`${name}-${f(n)}`:`${name}+${f(-n)}`;

 function tlu(t,p){
  const o=t.kind==='original',m=p.model;
  const conditions=o?[T`-x_2\ge-4`,T`-3x_1+x_2\ge-8`,T`x_1\ge3`,T`x_1+2x_2\ge9`]:[T`-x_2\ge-5`,T`3x_1+x_2\ge11`,T`-x_1\ge-3`,T`-x_1+2x_2\ge5`];
  return T`<p>Drei Schichten: <strong>2 Eingaben $x_1,x_2$, 4 Hidden-TLUs und 1 Ausgabe-TLU</strong>.</p><p>Jede TLU liefert bei <strong>gewichteter Summe ≥ Schwelle den Wert 1, sonst 0</strong>.</p>`+
   table(['Neuron / Kante','Bedingung für Ausgabe 1','Eingangsgewichte (w₁; w₂)','Schwelle'],m.params.map((r,i)=>['h'+(i+1)+' / '+['AB','BC','CD','DA'][i],math(conditions[i]),v(r.slice(0,2)),f(r[2])]))+
   T`<p>Beide Eingaben gehen mit den Tabellengewichten in jedes Hidden-Neuron. Die Verbindungen $h_1,h_2,h_3,h_4$ zum Ausgang haben die Gewichte <strong>(2; 2; 1; 1)</strong>; Ausgangsschwelle: <strong>5</strong>.</p>$$y=\begin{cases}1,&2h_1+2h_2+h_3+h_4\ge5,\\0,&\text{sonst}.\end{cases}$$`;
 }

 function rbf(p){const {centers,r}=p.model;
  return T`<p>Ich verwende <strong>2 Eingaben, 3 RBF-Neuronen und einen linearen Ausgang</strong>.</p>`+
   table(['Neuron','Zentrum','Distanz','Radius','Ausgangsgewicht'],centers.map((c,i)=>[`h${i+1}: ${i?'Quadrat '+(i===1?'oben':'unten'):'Raute'}`,v(c),i?'Maximum (L∞)':'Manhattan (L₁)',f(i?r/2:r),i?'−1':'+1']))+
   T`<p>Netzeingaben mit Manhattan- und Maximumdistanz aus der Minkowski-Familie:</p>`+
   centers.map((c,i)=>`$$d_${i+1}=`+(i?T`\max\bigl(|${difference('x_1',c[0])}|,|${difference('x_2',c[1])}|\bigr)`:T`|${difference('x_1',c[0])}|+|${difference('x_2',c[1])}|`)+'$$').join('')+
   T`<p>Jedes Hidden-Neuron liefert <strong>1 bei Abstand ≤ Radius, sonst 0</strong>. Beide Eingaben gehen in jedes RBF-Neuron; die Hidden-Ausgaben mit den Tabellengewichten zum Ausgang.</p><p>Linearer Ausgang, Schwelle $0$; alle Ausgabefunktionen sind Identitäten:</p>$$\boxed{y=h_1-h_2-h_3}$$`;
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
  if(mlp){
   return T`<p>Stützstellen von $${a.start}$ bis $${a.end}$ im Abstand $${a.step}$:</p>`+values+
    T`<p>Ich verwende <strong>1 Eingabe, 8 Hidden-TLUs und 1 linearen Ausgang</strong>, insgesamt <strong>10 Neuronen</strong>. Alle Eingangsgewichte der Hidden-TLUs sind $1$.</p>`+
    table(['Hidden-Neuron','Schwelle','Gewicht zum Ausgang'],a.deltas.map((d,i)=>['h'+(i+1),f(a.xs[i+1]),f(d)]))+
    T`<p>Jede Hidden-TLU liefert $1$, sobald $x$ ihre Schwelle erreicht, sonst $0$.</p><p>Der Startwert $${a.ys[0]}$ wird durch den <strong>Ausgangsbias $+${a.ys[0]}$</strong> erzeugt.</p>`+approximationSketch(a,true);
  }
  return T`<p>Ich verwende <strong>1 Eingabe, 9 RBF-Neuronen und 1 linearen Ausgang</strong>, insgesamt <strong>11 Neuronen</strong>.</p>`+values+
   T`<p><strong>Alle Radien: $${a.step}$.</strong> Ausgangsschwelle: $0$.</p>$$d_i=|x-c_i|,\qquad h_i=\max\left(0,1-${a.step===1?'d_i':T`\frac{d_i}{${a.step}}`}\right).$$`+approximationSketch(a,false);
 }

 function lvq(p){
  const m=p.model,data=C.lvq(m.initial,m.points,m.eta,m.rule),supervised=m.rule==='winner';
  return T`<p><strong>Gewinnerregel:</strong> Nur der nächstgelegene Prototyp wird verändert. ${supervised?'Richtige Klasse: +; falsche Klasse: −.':'Ohne Klassen: immer +.'}</p>`+
   T`$$r_{neu}=r${supervised?'\\pm':'+'}${m.eta}(x-r).$$<p>Start: $A=${v(m.initial[0].v)}$, $B=${v(m.initial[1].v)}$. Reihenfolge: $p$, dann $q$ mit den bereits aktualisierten Vektoren.</p>`+
   table(['Punkt','(d² zu A; d² zu B)','Gewinner / Änderung','A danach','B danach'],data.rows.map(row=>[math(`${row.point.name}=${v(row.point.v)}`),v(row.ds),row.old[row.win].label+' / '+(row.signs[row.win]>0?'anziehen':'abstoßen'),v(row.centers[0].v),v(row.centers[1].v)]))+
   T`<p>Gesamtänderungen gegenüber dem Start:</p>$$\Delta A=\boxed{${v(data.changes[0])}},\qquad\Delta B=\boxed{${v(data.changes[1])}}.$$`;
 }

 function som(p){
  const m=p.model,data=C.som(m.grid,m.x,m.eta,m.sigma),winner=m.grid[data.winner],maxI=Math.max(...m.grid.map(r=>r.g[0])),maxJ=Math.max(...m.grid.map(r=>r.g[1])),den=2*m.sigma*m.sigma;
  return T`<p>Gitterannahme: $r_{ij}=(5i;5j)$, $i=0,\ldots,${maxI}$, $j=0,\ldots,${maxJ}$. Ein Gitterschritt zählt als Abstand 1.</p><p><strong>Gewinner:</strong> $r_*=${v(winner.v)}$, Gitterindex $${v(winner.g)}$.</p><p>Alle <strong>${data.rows.length} Änderungen</strong> werden gleichzeitig aus dem alten Gitter berechnet:</p>`+
   T`$$\boxed{\Delta r_{ij}=${m.eta}\,e^{-\frac{(i-${winner.g[0]})^2+(j-${winner.g[1]})^2}{${den}}}\begin{pmatrix}${m.x[0]}-5i\\${m.x[1]}-5j\end{pmatrix}}$$$$r_{ij}^{neu}=(5i;5j)+\Delta r_{ij}.$$`+
   table(['Alter Prototyp','Änderung Δr ≈','Neuer Prototyp ≈'],(data.rows.length<=9?data.rows:[data.rows[data.winner]]).map(row=>[v(row.v),v(row.delta),v(row.next)]));
 }

 function hopfield(t,p){
  const m=p.model,rows=C.hopfield(m.W,m.theta),o=t.kind==='original';
  const nets=o?T`net_1=-2s_2,\quad net_2=-2s_1-2s_3,\quad net_3=-2s_2`:T`net_1=s_2-s_3,\quad net_2=s_1+2s_3,\quad net_3=-s_1+2s_2`;
  return T`<p>Ich schreibe $+$ für $+1$ und $-$ für $-1$. Die Reihenfolge ist immer $(s_1,s_2,s_3)$.</p><p>Aus den Gewichten ergeben sich:</p>$$${nets}.$$<p>Die Schwellen sind $\theta=${v(m.theta)}$.</p><p>Bei einem Update gilt: <strong>Netzeingabe ≥ Schwelle → +1, sonst −1.</strong> Die beiden anderen Neuronen bleiben unverändert.</p>`+
   table(['Alter Zustand','(net₁; net₂; net₃)','Nur Neuron 1','Nur Neuron 2','Nur Neuron 3'],rows.map(r=>[r.stable?`<strong>${sign(r.s)} ★</strong>`:sign(r.s),v(r.net),...r.next.map(sign)]))+
   T`<p>$u_1,u_2,u_3$ an den Pfeilen bezeichnen das jeweils aktualisierte Neuron.</p>`+
   V.graph(rows,'exam-hop-'+t.id,o?{layout:'exam-original'}:{})+
   `<p><strong>Stabile Zustände: ${rows.filter(r=>r.stable).map(r=>sign(r.s)).join(' und ')}.</strong></p>`;
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
 function html(t,p,{expanded=false,extra=''}={}){return `<section class="exam-answer"><h2>${t.kind!=='repair'&&p.id!=='verbessern'?'Minimale':'Kompakte'} Klausur-Musterlösung</h2>${compact(t,p)}</section><details class="detailed-solution" data-explanation ${expanded?'open':''}><summary>Ausführlicher Rechenweg</summary>${p.solution}${extra}</details>`;}
 root.NNExamSolutions={compact,html};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNExamSolutions;
})(typeof globalThis!=='undefined'?globalThis:this);
