(function(root){
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const f=NNCore.fmt;
 function plane({polygons=[],points=[],lines=[],range=[0,6,0,6],title='Koordinatenbild',curves=[],width=560,height=370,axes=['x₁','x₂']}){
  const [xmin,xmax,ymin,ymax]=range,pad=44,X=x=>pad+(x-xmin)/(xmax-xmin)*(width-2*pad),Y=y=>height-pad-(y-ymin)/(ymax-ymin)*(height-2*pad);
  let body='';for(let x=Math.ceil(xmin);x<=xmax;x++)body+=`<path d="M${X(x)} ${pad}V${height-pad}" class="gridline"/><text x="${X(x)}" y="${height-pad+21}" text-anchor="middle">${x}</text>`;
  const step=Math.max(1,Math.ceil((ymax-ymin)/9));for(let y=Math.ceil(ymin/step)*step;y<=ymax;y+=step)body+=`<path d="M${pad} ${Y(y)}H${width-pad}" class="gridline"/><text x="${pad-10}" y="${Y(y)+4}" text-anchor="end">${y}</text>`;
  body+=polygons.map((p,i)=>`<polygon points="${p.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ')}" class="region region-${i}"/>`).join('');
  body+=lines.map(l=>`<path d="M${X(l[0][0])} ${Y(l[0][1])}L${X(l[1][0])} ${Y(l[1][1])}" class="plotline"/>`).join('');
  body+=curves.map((c,i)=>`<path d="${c.map(([x,y],k)=>`${k?'L':'M'}${X(x)} ${Y(y)}`).join(' ')}" class="curve curve-${i}"/>`).join('');
  body+=points.map(p=>`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" class="point"/><text x="${X(p.x)+7}" y="${Y(p.y)-9}">${esc(p.label||'')}</text>`).join('');
  return `<svg class="math-figure" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}<text x="${width-pad+8}" y="${height-pad+5}">${esc(axes[0])}</text><text x="${pad-10}" y="${pad-14}">${esc(axes[1])}</text></svg>`;
 }
 function network(hidden,output,label='Netz mit Eingabe, verdeckter Schicht und Ausgabe',inputs=2){
  const h=Math.max(270,hidden.length*68+60),ys=hidden.map((_,i)=>55+i*(h-110)/Math.max(1,hidden.length-1)),iy=inputs===1?[h/2]:[h/2-40,h/2+40];let body='';
  iy.forEach(y=>ys.forEach(v=>body+=`<line x1="80" y1="${y}" x2="235" y2="${v}" class="netedge"/>`));
  ys.forEach((y,i)=>{body+=`<line x1="270" y1="${y}" x2="445" y2="${h/2}" class="netedge"/><text x="${312}" y="${y+(h/2-y)*.35-7}">${esc(output[i])}</text><circle cx="252" cy="${y}" r="23" class="node"/><text x="252" y="${y+5}" text-anchor="middle">${esc(hidden[i])}</text>`;});
  iy.forEach((y,i)=>body+=`<circle cx="65" cy="${y}" r="22" class="node"/><text x="65" y="${y+5}" text-anchor="middle">${inputs===1?'x':i?'x₂':'x₁'}</text>`);
  body+=`<circle cx="467" cy="${h/2}" r="24" class="node"/><text x="467" y="${h/2+5}" text-anchor="middle">y</text><text x="65" y="${h-12}" text-anchor="middle">Eingabe</text><text x="252" y="${h-12}" text-anchor="middle">Verdeckt</text><text x="467" y="${h-12}" text-anchor="middle">Ausgabe</text>`;
  return `<svg class="math-figure" viewBox="0 0 540 ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${body}</svg>`;
 }
 function approx(a){const pts=Array.from({length:161},(_,i)=>a.start+(a.end-a.start)*i/160),truth=pts.map(x=>[x,a.f(x)]),linear=pts.map(x=>[x,a.rbf(x)]),stair=[];
  a.xs.slice(0,-1).forEach((x,i)=>{stair.push([x,a.ys[i]],[a.xs[i+1],a.ys[i]],[a.xs[i+1],a.ys[i+1]]);});
  const lo=Math.min(...truth.map(p=>p[1]),...a.ys)-1,hi=Math.max(...a.ys)+2;
  return `<figure>${plane({range:[a.start,a.end,lo,hi],curves:[truth,stair,linear],axes:['x','y'],title:'Zielfunktion, MLP-Stufen und stückweise lineare RBF-Näherung'})}<figcaption><span class="legend truth">Zielfunktion</span> · <span class="legend stair">MLP-Stufen</span> · <span class="legend linear">RBF-Dreiecke</span></figcaption></figure>`;
 }
 const sign=s=>s.map(x=>x>0?'+':'−').join('');
 function examOriginalGraph(rows,markerId){
  const positions=[[75,75],[245,375],[620,615],[555,375],[245,215],[180,615],[555,215],[725,75]];
  const curves={
   '0-2':['M60 101 C5 390 240 690 591 628',85,503],
   '7-5':['M740 101 C795 390 560 690 209 628',715,503],
   '6-2':['M578 235 C700 330 735 510 641 591',668,409],
   '4-5':['M222 235 C100 330 65 510 159 591',131,409]
  };
  const labels={'0-4':[149,131],'0-1':[155,290],'1-5':[202,496],'1-3':[400,363],'3-2':[600,496],'4-6':[400,203],'7-3':[645,290],'7-6':[650,131]};
  const loops={
   4:['M224 194 C184 118 306 118 266 194',245,143],
   1:['M216 363 C128 323 128 427 216 387',145,380],
   6:['M534 194 C494 118 616 118 576 194',555,143],
   3:['M584 363 C672 323 672 427 584 387',654,380],
   5:['M157 635 C122 714 238 714 203 635',180,698],
   2:['M597 635 C562 714 678 714 643 635',620,698]
  };
  const edge=(i,j,ks,[path,x,y])=>`<g data-edge-source="${i}" data-edge-target="${j}" data-updates="${ks.join(',')}"><path d="${path}" class="hopedge" marker-end="url(#${esc(markerId)})"/><text x="${x}" y="${y}" text-anchor="middle" class="edgelabel">${ks.map(k=>'u'+k).join(', ')}</text></g>`;
  let body='';
  rows.forEach((r,i)=>{
   const same=[];
   r.next.forEach((next,k)=>{
    const j=rows.findIndex(r=>r.s.every((x,n)=>x===next[n]));
    if(i===j){same.push(k+1);return;}
    const [x,y]=positions[i],[xx,yy]=positions[j],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy);
    const straight=[`M${x+dx/len*31} ${y+dy/len*31} L${xx-dx/len*34} ${yy-dy/len*34}`,...(labels[`${i}-${j}`]||[(x+xx)/2,(y+yy)/2-10])];
    body+=edge(i,j,[k+1],curves[`${i}-${j}`]||straight);
   });
   if(same.length)body+=edge(i,i,same,loops[i]);
  });
  body+=rows.map((r,i)=>{const [x,y]=positions[i];return `<g data-node="${i}"><circle cx="${x}" cy="${y}" r="30" class="node ${r.stable?'stable':''}"/>${r.stable?`<circle cx="${x}" cy="${y}" r="25" fill="none" stroke="currentColor"/>`:''}<text x="${x}" y="${y+6}" text-anchor="middle">${sign(r.s)}</text></g>`;}).join('');
  return `<figure class="hopgraph exam-hopgraph"><div class="diagram-scroll" tabindex="0" role="region" aria-label="Zustandsgraph, bei Bedarf horizontal verschieben"><svg class="math-figure" viewBox="0 0 800 725" role="img" aria-label="Vollständiger Hopfield-Graph mit allen 24 Einzelupdates einschließlich Selbstschleifen"><title>Alle Zustände, Übergänge und unveränderten Updates</title><defs><marker id="${esc(markerId)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>${body}</svg></div><figcaption>Doppelkreis = stabil. Schleifen = Zustand bleibt bei den genannten Updates unverändert. Bei schmaler Ansicht horizontal verschieben.</figcaption><label>Übergänge hervorheben <select data-hop-focus><option value="all">Alle Zustände</option>${rows.map((r,i)=>`<option value="${i}">${sign(r.s)}</option>`).join('')}</select></label></figure>`;
 }
 function graph(rows,markerId='hop-arrow',options={}){if(options.layout==='exam-original')return examOriginalGraph(rows,markerId);const w=760,h=540,positions=[[100,90],[290,90],[100,440],[670,240],[480,90],[670,440],[100,240],[480,240]],index=s=>rows.findIndex(r=>r.s.every((v,i)=>v===s[i]));let body='';
  rows.forEach((r,i)=>r.next.forEach((t,k)=>{const j=index(t);if(j===i)return;const [x,y]=positions[i],[xx,yy]=positions[j],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy),sx=x+dx/len*29,sy=y+dy/len*29,ex=xx-dx/len*31,ey=yy-dy/len*31;body+=`<g data-edge-source="${i}"><path d="M${sx} ${sy}L${ex} ${ey}" class="hopedge" marker-end="url(#${esc(markerId)})"/><text x="${(sx+ex)/2+6}" y="${(sy+ey)/2-6}" class="edgelabel">u${k+1}</text></g>`;}));
  rows.forEach((r,i)=>{const [x,y]=positions[i];body+=`<g data-node="${i}"><circle cx="${x}" cy="${y}" r="28" class="node ${r.stable?'stable':''}"/>${r.stable?`<circle cx="${x}" cy="${y}" r="23" fill="none" stroke="currentColor"/>`:''}<text x="${x}" y="${y+5}" text-anchor="middle">${sign(r.s)}</text></g>`;});
  return `<figure class="hopgraph"><div class="diagram-scroll" tabindex="0" role="region" aria-label="Zustandsgraph, bei Bedarf horizontal verschieben"><svg class="math-figure" viewBox="0 0 ${w} ${h}" role="img" aria-label="Vollständiger Hopfield-Graph: alle echten Zustandsänderungen mit Neuronennummer"><defs><marker id="${esc(markerId)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>${body}</svg></div><figcaption>Bei schmaler Ansicht horizontal verschieben. Alle echten Zustandsänderungen. Doppelkreis = stabil. Unveränderte Updates stehen vollständig in der Tabelle.</figcaption><label>Übergänge hervorheben <select data-hop-focus><option value="all">Alle Zustände</option>${rows.map((r,i)=>`<option value="${i}">${sign(r.s)}</option>`).join('')}</select></label></figure>`;
 }
 root.NNVisual={esc,plane,network,approx,graph,sign};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNVisual;
})(typeof globalThis!=='undefined'?globalThis:this);
