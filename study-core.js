/* Pure calculations and learning decisions; shared by the UI and independent tests. */
(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const fmt=x=>Math.abs(x)<1e-10?'0':String(Number(x.toFixed(5)));
 const vec=v=>'('+v.map(fmt).join('; ')+')';
 function number(text){
  let s=String(text??'').trim().replace(/[−–]/g,'-').replace(/\s/g,'').replace(/,/g,'.');
  const atom='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
  s=s.replace(/\(([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\)/gi,'$1');
  if(!new RegExp('^'+atom+'(?:/'+atom+')?$','i').test(s))return null;
  const [a,b='1']=s.split('/').map(Number),n=a/b;
  return Number.isFinite(n)?n:null;
 }
 function numbers(text){const s=String(text).trim().replace(/^\(/,'').replace(/\)$/,'');return s.split(s.includes(';')?';':',').map(number);}
 function grade(field,input){
  if(field.vector){const a=numbers(input),b=field.answer;if(a.length!==b.length||a.some(x=>x===null))return false;
   if(field.scale){const i=b.findIndex(x=>x!==0),k=a[i]/b[i];return k>0&&a.every((x,j)=>Math.abs(x-k*b[j])<1e-6*Math.max(1,Math.abs(k)));}
   return a.every((x,i)=>Math.abs(x-b[i])<=(field.tolerance??.002));}
  const n=number(input);return n!==null&&Math.abs(n-field.answer)<=(field.tolerance??.002);
 }
 const dist=(a,b)=>a.reduce((s,x,i)=>s+(x-b[i])**2,0);
 function lvq(initial,points,eta,rule){
  let centers=clone(initial);const rows=[];
  for(const point of points){const old=clone(centers),ds=old.map(r=>dist(r.v,point.v)),order=ds.map((d,i)=>({d,i})).sort((a,b)=>a.d-b.d||a.i-b.i),win=order[0].i;
   const signs=old.map(()=>0);
   if(rule==='none')signs[win]=1;
   else if(rule==='winner')signs[win]=old[win].label===point.label?1:-1;
   else {const ids=order.slice(0,2).map(o=>o.i);if(ids.length===2&&old[ids[0]].label!==old[ids[1]].label&&ids.some(i=>old[i].label===point.label))ids.forEach(i=>signs[i]=old[i].label===point.label?1:-1);}
   centers=old.map((r,i)=>({...r,v:r.v.map((v,k)=>v+signs[i]*eta*(point.v[k]-v))}));rows.push({point,old,ds,win,signs,centers:clone(centers)});
  }return {rows,centers,changes:centers.map((r,i)=>r.v.map((v,k)=>v-initial[i].v[k]))};
 }
 function som(grid,x,eta,sigma){const ds=grid.map(r=>dist(r.v,x)),winner=ds.indexOf(Math.min(...ds));return {winner,rows:grid.map(r=>{const d2=dist(r.g,grid[winner].g),h=Math.exp(-d2/(2*sigma*sigma)),alpha=eta*h,delta=r.v.map((v,k)=>alpha*(x[k]-v));return {...r,d2,h,alpha,delta,next:r.v.map((v,k)=>v+delta[k])};})};}
 function hopfield(W,theta){return Array.from({length:8},(_,k)=>{const s=[k&4?1:-1,k&2?1:-1,k&1?1:-1],net=W.map(r=>r.reduce((a,w,i)=>a+w*s[i],0)),next=net.map((n,i)=>s.map((v,j)=>i===j?(n>=theta[i]?1:-1):v));return {s,net,next,energy:-.5*s.reduce((a,v,i)=>a+v*net[i],0)+s.reduce((a,v,i)=>a+v*theta[i],0),stable:next.every(t=>t.every((v,i)=>v===s[i]))};});}
 function approximation(coeff,start,end,step){const f=x=>coeff[0]*x*x+coeff[1]*x+coeff[2],xs=Array.from({length:Math.round((end-start)/step)+1},(_,i)=>start+i*step),ys=xs.map(f);return {coeff,start,end,step,xs,ys,deltas:ys.slice(1).map((v,i)=>v-ys[i]),f,mlp:x=>ys[0]+xs.slice(1).reduce((a,c,i)=>a+(x>=c?ys[i+1]-ys[i]:0),0),rbf:x=>xs.reduce((a,c,i)=>a+ys[i]*Math.max(0,1-Math.abs(x-c)/step),0)};}
 function familyStatus(history,family,now=Date.now()){
  const h=history.filter(x=>x.family===family&&x.kind!=='repair');if(!h.length)return 'Noch offen';
  if(h.at(-1).rating!=='independent'||h.at(-1).helped)return 'Noch Hilfe nötig';
  const good=h.filter(x=>x.kind==='transfer'&&x.rating==='independent'&&!x.helped);
  if(good.some(a=>good.some(b=>b.at-a.at>=20*3600000)))return 'Später erneut geschafft';
  return good.length?'Neue Variante selbstständig gelöst':'Original bearbeitet';
 }
 function nextTask(tasks,history,current,now=Date.now()){
  const originals=tasks.filter(t=>t.kind==='original'),seen=new Set(history.map(h=>h.task));
  const unseen=originals.find(t=>!seen.has(t.id)&&t.id!==current);if(unseen)return unseen;
  const seq=history.length,score=t=>{const h=history.filter(x=>x.task===t.id),last=h.at(-1),fam=history.filter(x=>x.family===t.family).at(-1);let s=t.kind==='transfer'?30:t.kind==='original'?0:-10;
   if(!last)s+=t.kind==='transfer'?70:5;
   else{s-=35;s+=Math.min(30,(now-last.at)/86400000*15);if(seq-last.seq<2)s-=100;}
   if(fam&&fam.rating!=='independent'&&seq-fam.seq>=2)s+=t.kind==='repair'?100:50;
   if(t.kind==='repair'&&(!fam||fam.rating==='independent'))s-=100;
   if(fam?.rating==='independent'&&now-fam.at<86400000)s-=20;
   if(t.id===current)s-=150;
   return s;};return [...tasks].sort((a,b)=>score(b)-score(a))[0];
 }
 function scoreBlock(questions,answers){return Math.max(0,questions.reduce((n,q)=>n+(answers[q.id]==='true'||answers[q.id]==='false'?((answers[q.id]==='true')===q.correct?1:-1):0),0));}
 const api={clone,fmt,vec,number,numbers,grade,dist,lvq,som,hopfield,approximation,familyStatus,nextTask,scoreBlock};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NNCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
