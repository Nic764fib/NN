/* Compact, self-contained exam answers; the detailed teaching solutions stay in study-content.js. */
(function(root){
 'use strict';
 const C=NNCore,V=NNVisual,T=String.raw,f=C.fmt,v=C.vec,table=NNContent.table;
 const math=s=>`$${s}$`,sign=s=>s.map(x=>x>0?'+':'−').join('');

 function tlu(t,p){
  const o=t.kind==='original',m=p.model;
  const borders=o?[T`x_2=4`,T`m=3:\ x_2=1+3(x_1-3)=3x_1-8`,T`x_1=3`,T`m=-\frac12:\ x_2=4-\frac12(x_1-1)`]:[T`x_2=5`,T`m=-3:\ x_2=5-3(x_1-2)=11-3x_1`,T`x_1=3`,T`m=\frac12:\ x_2=4+\frac12(x_1-3)`];
  const conditions=o?[T`-x_2\ge-4`,T`-3x_1+x_2\ge-8`,T`x_1\ge3`,T`x_1+2x_2\ge9`]:[T`-x_2\ge-5`,T`3x_1+x_2\ge11`,T`-x_1\ge-3`,T`-x_1+2x_2\ge5`];
  return T`<p>Es sei $H(z)=1$ für $z\ge0$, sonst $H(z)=0$. Gewählt wird ein Netz mit drei Schichten: zwei Eingaben, vier Hidden-TLUs und eine Ausgabe-TLU.</p><p>Aus den Eckpunkten folgen die Randgeraden:</p>`+
   table(['Kante','Gerade'],borders.map((b,i)=>[['AB','BC','CD','DA'][i],math(b)]))+
   T`<p>Die Hidden-Neuronen sind $h_i=H(w_{i1}x_1+w_{i2}x_2-\theta_i)$ mit:</p>`+
   table(['Neuron','Halbebenenbedingung','Gewichte (wᵢ₁; wᵢ₂)','Schwelle θᵢ'],m.params.map((r,i)=>['h'+(i+1),math(conditions[i]),v(r.slice(0,2)),f(r[2])]))+
   T`<p>Die Fläche ist $h_1\land h_2\land(h_3\lor h_4)$. Daher lautet die Ausgabe</p>$$y=H(2h_1+2h_2+h_3+h_4-5).$$<p>Die Verbindungen von den Eingaben zu den Hidden-Neuronen stehen in der Tabelle; von $(h_1,h_2,h_3,h_4)$ zum Ausgang gelten Gewichte $(2,2,1,1)$ und Schwelle $5$. Es gibt keine weiteren Verbindungen; alle Ausgabefunktionen sind Identitäten.</p><p>Bei beiden Pflichttests und mindestens einer Alternative ist die Summe mindestens $5$. Fehlt ein Pflichttest, ist sie höchstens $4$; fehlen beide Alternativen, ebenfalls höchstens $4$. Damit liefert das Netz genau auf der Fläche einschließlich Rand $1$, sonst $0$.</p>`;
 }

 function rbf(p){const {centers,r}=p.model;
  return T`<p>Netz: zwei Eingaben, drei radiale Hidden-Neuronen, ein linearer Ausgang. Netzeingabe des Hidden-Neurons ist jeweils die angegebene Distanz zum Zentrum:</p>`+
   table(['i','Zentrum cᵢ','Distanz dᵢ(x)','Radius σᵢ','Ausgabegewicht'],centers.map((c,i)=>[i+1,v(c),math(i?T`\max(|x_1-c_{i1}|,|x_2-c_{i2}|)`:T`|x_1-c_{11}|+|x_2-c_{12}|`),f(i?r/2:r),i?'−1':'1']))+
   T`$$h_i(x)=\begin{cases}1,&d_i(x)\le\sigma_i,\\0,&d_i(x)>\sigma_i,\end{cases}\qquad y=h_1-h_2-h_3.$$<p>Der Ausgang hat Gewichte $(1,-1,-1)$, Schwelle $0$ und lineare Aktivierung; alle Ausgabefunktionen sind Identitäten. Beide Eingabekoordinaten gehen in jedes radiale Neuron ein, dessen Ausgabe mit dem genannten Gewicht zum Ausgang führt.</p><p>$h_1$ beschreibt die gesamte Raute. $h_2,h_3$ ziehen die beiden unerwünschten Dreiecke durch ihre umschließenden Quadrate ab. Im gewünschten Inneren gilt $(h_1,h_2,h_3)=(1,0,0)$, also $y=1$; in den ausgesparten Dreiecken $y=1-1=0$. Außerhalb der Raute gilt $y=-h_2-h_3\le0$. Ränder sind laut Angabe egal.</p>`;
 }

 function approximationSketch(a,mlp){
  const truth=Array.from({length:81},(_,i)=>{const x=a.start+(a.end-a.start)*i/80;return [x,a.f(x)];});
  const approx=mlp?a.xs.slice(0,-1).flatMap((x,i)=>[[x,a.ys[i]],[a.xs[i+1],a.ys[i]],[a.xs[i+1],a.ys[i+1]]]):a.xs.map((x,i)=>[x,a.ys[i]]);
  const low=Math.min(...truth.map(p=>p[1]),...a.ys)-1,high=Math.max(...a.ys)+1;
  return `<figure class="exam-sketch">${V.plane({range:[a.start,a.end,low,high],curves:[truth,approx],axes:['x','y'],title:mlp?'MLP-Stufennäherung':'RBF-Interpolation',width:560,height:265})}<figcaption>Gestrichelt: Zielfunktion. Orange: ${mlp?'Stufennäherung; an jeder Sprungstelle gilt die neue Höhe.':'lineare Verbindung der Stützwerte.'}</figcaption></figure>`;
 }

 function approximation(t,p){
  if(p.id==='verbessern')return T`<ol><li>Bei gleicher Knotenzahl Zentren, Breiten und Ausgabegewichte anhand des Approximationsfehlers gemeinsam optimieren; den Fehler anschließend vergleichen.</li><li>Falls mehr Neuronen erlaubt sind: zusätzliche Stützstellen und Neuronen verwenden, um die Unterteilung zu verfeinern und den Näherungsfehler zu verkleinern.</li></ol>`;
  const m=t.parts.find(p=>p.model?.coeff).model,a=C.approximation(m.coeff,m.start,m.end,m.step),mlp=p.id==='mlp';
  const values=mlp?table(['i','xᵢ','yᵢ = f(xᵢ)','Δyᵢ = yᵢ − yᵢ₋₁'],a.xs.map((x,i)=>[i,f(x),f(a.ys[i]),i?f(a.deltas[i-1]):'Startwert'])):table(['i','Zentrum cᵢ','Gewicht wᵢ = f(cᵢ)'],a.xs.map((x,i)=>[i,f(x),f(a.ys[i])]));
  if(mlp)return T`<p>Gewählt: $1+8+1=10$ Neuronen in drei Schichten einschließlich Eingabe. Stützstellen $x_i=${a.start}+${a.step}i$, $i=0,\ldots,8$, mit Abstand $h=(${a.end}-(${a.start}))/8=${a.step}$.</p>`+values+
   T`<p>Hidden-TLUs für $i=1,\ldots,8$: Eingangsgewicht $1$, Schwelle $x_i$, Aktivierung $h_i(x)=\mathbf1_{x\ge x_i}$. Linearer Ausgang:</p>$$\widehat f(x)=${a.ys[0]}+\sum_{i=1}^8\Delta y_i h_i(x).$$<p>Die Ausgabegewichte sind die Tabellenwerte $\Delta y_i$, die Ausgangsschwelle ist $\theta=-${a.ys[0]}$ bei $out=net-\theta$. Alle Ausgabefunktionen sind Identitäten. Verbindungen: $x\to h_i$ mit Gewicht $1$, $h_i\to out$ mit Gewicht $\Delta y_i$.</p><p>Auf $[x_i,x_{i+1})$ ist die Ausgabe $y_0+\sum_{k=1}^i\Delta y_k=y_i$; am rechten Endpunkt ist sie $y_8=${a.ys[8]}$. Zum Beispiel: erster Sprung $${a.ys[0]}+(${a.deltas[0]})=${a.ys[1]}$.</p>`+approximationSketch(a,true);
  const mid=a.start+a.step/2;
  return T`<p>Gewählt: ein Eingang, neun radiale Hidden-Neuronen und ein linearer Ausgang, insgesamt $11$ Neuronen. Zentren $c_i=${a.start}+${a.step}i$, $i=0,\ldots,8$, gemeinsame Radien $\sigma_i=${a.step}$:</p>`+values+
   T`$$d_i(x)=|x-c_i|,\qquad h_i(x)=\max\!\left(0,1-\frac{d_i(x)}{${a.step}}\right),$$$$\widehat f(x)=\sum_{i=0}^8 w_i h_i(x),\qquad \theta_{out}=0.$$<p>Alle Hidden-Ausgaben gehen mit den Tabellengewichten zum linearen Ausgang; Ausgabefunktionen sind Identitäten. An $c_i$ gilt $\widehat f(c_i)=f(c_i)$. Zwischen $c_i,c_{i+1}$ ist mit $t=(x-c_i)/${a.step}$ die Ausgabe $(1-t)f(c_i)+t f(c_{i+1})$.</p>$$\widehat f(${mid})=0.5\cdot${a.ys[0]}+0.5\cdot${a.ys[1]}=${a.rbf(mid)}.$$`+approximationSketch(a,false);
 }

 function lvq(p){
  const m=p.model,data=C.lvq(m.initial,m.points,m.eta,m.rule),supervised=m.rule==='winner';
  const update=r=>r.old.map((old,i)=>{if(!r.signs[i])return T`<p>$r_${old.label}'=${v(old.v)}$ (unverändert).</p>`;const diff=r.point.v.map((x,k)=>x-old.v[k]);return T`$$\begin{aligned}r_${old.label}'&=${v(old.v)}${r.signs[i]>0?'+':'-'}${m.eta}${v(diff)}\\&=${v(r.centers[i].v)}.\end{aligned}$$`;}).join('');
  return T`<p>${supervised?'Verwendet wird die Gewinnerregel (Folie 336): Nur der nächste Prototyp lernt, bei richtiger Klasse anziehen, sonst abstoßen.':'Ohne Klasseninformation wird nur der nächste Prototyp angezogen.'} Start: $r_A=${v(m.initial[0].v)}$, $r_B=${v(m.initial[1].v)}$; Reihenfolge $p,q$, $\eta=${m.eta}$.</p>$$d_k^2=\|x-r_k\|^2,\qquad r_k'=r_k${supervised?'\\pm':'+'}\eta(x-r_k).$$`+
   data.rows.map((r,i)=>T`<p><strong>${i+1}. Punkt $${r.point.name}=${v(r.point.v)}$:</strong> $d_A^2=${f(r.ds[0])}$, $d_B^2=${f(r.ds[1])}$. Winner ${r.old[r.win].label}: ${r.signs[r.win]>0?'anziehen (+)':'abstoßen (−)'}.${i?' Mit den nach $p$ aktualisierten Prototypen gerechnet.':''}</p>`+update(r)).join('')+
   T`<p>Gesamtänderungen gegenüber den Anfangswerten:</p>$$\Delta r_A=${v(data.centers[0].v)}-${v(m.initial[0].v)}=${v(data.changes[0])},$$$$\Delta r_B=${v(data.centers[1].v)}-${v(m.initial[1].v)}=${v(data.changes[1])}.$$`;
 }

 function som(p){
  const m=p.model,data=C.som(m.grid,m.x,m.eta,m.sigma),winner=m.grid[data.winner],maxI=Math.max(...m.grid.map(r=>r.g[0])),maxJ=Math.max(...m.grid.map(r=>r.g[1])),den=2*m.sigma*m.sigma,w=data.rows[data.winner];
  const indices=T`i=0,\ldots,${maxI},\quad j=0,\ldots,${maxJ}`;
  const first=T`<p>Mit der angegebenen Gitterlesart gilt $r_{ij}=(5i,5j)$ für $${indices}$. Der nächste Prototyp zu $x=${v(m.x)}$ ist $r_*=${v(winner.v)}$ mit Index $(i_*,j_*)=${v(winner.g)}$ und Abstand $\sqrt{${C.dist(winner.v,m.x)}}$.</p>$$d_G^2=(i-${winner.g[0]})^2+(j-${winner.g[1]})^2,\qquad h_{ij}=e^{-d_G^2/${den}}.$$<p>Damit lauten sämtliche Änderungen und neuen Vektoren:</p>$$\Delta r_{ij}=${m.eta}\,e^{-\frac{(i-${winner.g[0]})^2+(j-${winner.g[1]})^2}{${den}}}\begin{pmatrix}${m.x[0]}-5i\\${m.x[1]}-5j\end{pmatrix},$$$$r_{ij}^{neu}=\begin{pmatrix}5i\\5j\end{pmatrix}+\Delta r_{ij}\qquad(${indices}).$$<p>Alle Updates verwenden dieselben alten Vektoren. Für den Winner ist $h=1$:</p>$$\Delta r_*=${m.eta}${v(m.x.map((x,k)=>x-winner.v[k]))}=${v(w.delta)},\qquad r_*^{neu}=${v(w.next)}.$$`;
  if(data.rows.length<=9)return first+table(['Index (i; j)','Δrᵢⱼ ≈','rᵢⱼ neu ≈'],data.rows.map(r=>[v(r.g),v(r.delta),v(r.next)]));
  const left=data.rows.find(r=>r.g[0]===winner.g[0]-1&&r.g[1]===winner.g[1]);
  return first+T`<p>Beispiel Nachbar ${v(left.g)}: $d_G^2=1$ und $\Delta r=${m.eta}e^{-1/${den}}${v(m.x.map((x,k)=>x-left.v[k]))}\approx${v(left.delta)}$, also $r^{neu}\approx${v(left.next)}$. Die indizierte Formel oben gibt alle $${data.rows.length}$ Änderungen exakt an. Ohne Abschneideregel werden auch weiter entfernte Neuronen aktualisiert.</p>`;
 }

 function hopfield(t,p){
  const m=p.model,rows=C.hopfield(m.W,m.theta),o=t.kind==='original';
  const nets=o?T`net_1=-2s_2,\quad net_2=-2s_1-2s_3,\quad net_3=-2s_2`:T`net_1=s_2-s_3,\quad net_2=s_1+2s_3,\quad net_3=-s_1+2s_2`;
  return T`<p>Zustände in der Reihenfolge $(s_1,s_2,s_3)$, Zeichen $\pm$ für $\pm1$. Bei Update $i$ gilt $s_i'=+1$ für $net_i\ge\theta_i$, sonst $-1$; die anderen Komponenten bleiben unverändert. Schwellen: $\theta=${v(m.theta)}$.</p>$$${nets}.$$`+
   table(['Zustand','net₁; net₂; net₃','Update 1','Update 2','Update 3'],rows.map(r=>[r.stable?`<strong>${sign(r.s)} ★</strong>`:sign(r.s),v(r.net),...r.next.map(sign)]))+
   `<p>Stabil (★): <strong>${rows.filter(r=>r.stable).map(r=>sign(r.s)).join(', ')}</strong>. Die Tabelle enthält alle 24 Einzelupdates. Gleiche Ausgangs- und Nachfolgerzustände sind Selbstschleifen; sie werden in der Zeichnung weggelassen und sind durch die Tabelle vollständig angegeben.</p>`+
   V.graph(rows,'exam-hop-'+t.id);
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
 function html(t,p,{expanded=false,extra=''}={}){return `<section class="exam-answer"><h2>Kompakte Klausur-Musterlösung</h2>${compact(t,p)}</section><details class="detailed-solution" data-explanation ${expanded?'open':''}><summary>Ausführlicher Rechenweg</summary>${p.solution}${extra}</details>`;}
 root.NNExamSolutions={compact,html};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNExamSolutions;
})(typeof globalThis!=='undefined'?globalThis:this);
