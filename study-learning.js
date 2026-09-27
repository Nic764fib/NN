(function(root){
 'use strict';
 const Q=NNQuestions,T=NNTheory,M=NNMC,X=root.NNExamMC||(typeof require==='function'?require('./study-exam-mc.js'):null);
 function create(api){
  const {app,save,math,E,header}=api,S=api.state;
  let currentChapter=null,scrollTimer,restoring=false,returnY=null;
  const blank=()=>({version:1,attempts:[],cursor:-1,catalog:{topic:'all',type:'all',origin:'all',answers:false},reading:{chapter:null,positions:{},read:[]},returnTo:null});
  function state(){const s=S();if(!s.learning){s.learning=blank();if(s.mcActive){const old=s.mcActive,q=M.question(M.concepts.find(c=>c.id===old.concept),old.form);if(Q.get(q.id)){const a={id:uid(),qid:q.id,answers:old.answer?{[q.id]:old.answer}:{},submitted:old.answer!==null,at:Date.now(),helped:false,migrated:true};s.learning.attempts.push(a);s.learning.cursor=0;}}save();}return s.learning;}
  const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  const provenance=q=>q.provenance==='original'?'Originalklausur 2024':q.provenance==='variant'?'Übungsvariante':'Übungsfrage';
  const typeLabel=q=>q.type==='single'?'Einzelaussage':q.type==='select'?'Alle zutreffenden auswählen':'Wahr/Falsch-Block';
  function nav(active){return `<nav class="parts" aria-label="Multiple Choice"><a class="${active==='catalog'?'active':''}" href="#/fragen">Alle Fragen ansehen</a><a class="${active==='train'?'active':''}" href="#/mc/ueben">Üben</a><a class="${active==='exam'?'active':''}" href="#/mc/klausur">Klausurfragen üben</a></nav>`;}
  function examEntry(){return `<article class="card exam-mc-entry"><div><h2>Klausurfragen üben</h2><p>Alle 20 Einträge aus Task 6 in der Reihenfolge der Vorlage: sechs Gruppen, Englisch oder Deutsch, True/False.</p></div><a class="button primary" href="#/mc/klausur">Originalfragen starten →</a></article>`;}
  function landing(){currentChapter=null;app.innerHTML=header('Klausurvorbereitung','Multiple Choice')+examEntry()+`<div class="split"><article class="card"><h2>Alle Fragen ansehen</h2><p>Fragen mit Antworten und Erklärungen der Reihe nach lesen.</p><a class="button" href="#/fragen">Alle Fragen ansehen</a></article><article class="card"><h2>Üben</h2><p>Originalfragen und alle Übungsvarianten beantworten.</p><a class="button primary" href="#/mc/ueben">Üben</a></article></div>`;}
  function theoryLink(topic,label='Dazu nachlesen'){return `<a data-learning-theory href="#/theorie/${E(topic)}">${label}</a>`;}
  function feedback(o,q,language='de'){const en=language==='en';return `<div class="answer-explanation" lang="${language}"><p><strong class="${o.correct?'correct':'incorrect'}">${o.correct?(en?'True':'Wahr'):(en?'False':'Falsch')}.</strong> ${o.explanation}</p>${!o.correct?`<p class="corrected"><strong>${en?'Correct statement:':'Richtig lautet es:'}</strong> ${o.correction}</p>`:''}<p class="source">${o.source||q.source} · ${theoryLink(o.topic||q.topic)}</p></div>`;}
  function append(q){const l=state(),a={id:uid(),qid:q.id,answers:{},submitted:false,helped:false,at:Date.now()};l.attempts.push(a);l.cursor=l.attempts.length-1;sync(a);save();return a;}
  function sync(a){const q=Q.get(a.qid);if(q.type==='single')S().mcActive={concept:q.concept,form:q.form,answer:a.submitted?a.answers[q.id]||'skip':null};}
  function submit(a,answers){if(a.submitted)return;const q=Q.get(a.qid);a.answers=answers;a.submitted=true;a.at=Date.now();for(const o of Q.options(q)){if(!o.concept)continue;const m=S().mc[o.concept]||{count:0},seq=Object.values(S().mc).reduce((n,x)=>n+x.count,0);S().mc[o.concept]={...m,count:m.count+1,lastCorrect:!a.helped&&['true','false'].includes(answers[o.id])&&(answers[o.id]==='true')===o.correct,originalSeen:m.originalSeen||!!o.verbatim,at:a.at,seq};}sync(a);save();}
  function training(bits=['mc','ueben']){
   currentChapter=null;
   if(bits[1]==='klausur'){examTraining();return;}
   if(!bits[1]){landing();return;}
   const l=state();
   if(l.practiceIndex===undefined){const previous=l.attempts[l.cursor];l.practiceIndex=Math.max(0,Q.all.findIndex(q=>q.id===previous?.qid));}
   if(bits[1]==='frage'){const i=Q.all.findIndex(q=>q.id===bits[2]);if(i>=0)l.practiceIndex=i;}
   if(bits[1]==='versuch'){const old=l.attempts.find(a=>a.id===bits[2]),i=Q.all.findIndex(q=>q.id===old?.qid);if(i>=0)l.practiceIndex=i;}
   if(location.hash!=='#/mc/ueben')history.replaceState(null,'','#/mc/ueben');
   const q=Q.all[l.practiceIndex];
   const previous=l.attempts.findLastIndex(a=>a.qid===q.id);
   if(previous>=0)l.cursor=previous;else append(q);
   const a=l.attempts[l.cursor],grade=a.submitted?Q.grade(q,a.answers):null;sync(a);
   app.innerHTML=header('Multiple Choice','Üben')+nav('train')+`
    <article class="card question" data-question="${q.id}">
     <div class="eyebrow">${typeLabel(q)} · ${provenance(q)}</div><h2>${q.title}</h2>
     ${q.stem&&q.provenance!=='original'?`<div class="problem">${q.stem}</div>`:''}
     ${q.type==='single'?singleBody(q,a):groupBody(q,a)}
     ${a.submitted?`<div class="feedback ${grade.all?'good':''}" role="status"><strong>${grade.correct} / ${grade.total} richtig</strong>${grade.score!==null?` · ${grade.score} / 5 Punkte`:''}${a.helped?'<span class="small"> · mit Nachlesen</span>':''}</div><button id="mc-retry">Erneut beantworten</button>`:''}
     <p class="source">${q.source}</p><p>${theoryLink(q.topic,'Grundlage nachlesen')}</p>
    </article>
    <div class="actions question-navigation"><button id="mc-back" ${l.practiceIndex===0?'disabled':''}>← Zurück</button><span class="small">Aufgabe ${l.practiceIndex+1} von ${Q.all.length}</span><button class="primary" id="mc-next" ${l.practiceIndex===Q.all.length-1?'disabled':''}>Weiter →</button></div>`;
   app.querySelectorAll('[data-mc]').forEach(b=>b.onclick=()=>{submit(a,{[q.id]:b.dataset.mc});redraw();});
   app.querySelectorAll('[data-answer]').forEach(el=>el.onchange=()=>{a.answers[el.dataset.answer]=el.type==='checkbox'?(el.checked?'true':'false'):el.value;save();});
   document.getElementById('question-submit')?.addEventListener('click',()=>{const answers=Object.fromEntries(Q.options(q).map(o=>[o.id,a.answers[o.id]||(q.type==='select'?'false':'skip')]));submit(a,answers);redraw();});
   document.getElementById('mc-back').onclick=()=>{l.practiceIndex--;save();training();window.scrollTo(0,0);};
   document.getElementById('mc-next').onclick=()=>{l.practiceIndex++;save();training();window.scrollTo(0,0);};
   document.getElementById('mc-retry')?.addEventListener('click',()=>{append(q);training();window.scrollTo(0,0);});
   math();save();
  }
  function redraw(){const y=scrollY;training();scrollTo(0,y);}
  function singleBody(q,a){return `<p class="mc-statement" ${q.verbatim?'lang="en"':''}>${q.text}</p><div class="mc-answers">${[['true','Wahr'],['false','Falsch']].map(([val,label])=>`<button data-mc="${val}" ${a.submitted?'disabled':''} class="${a.answers[q.id]===val?'selected':''}">${label}</button>`).join('')}</div>${a.submitted?feedback(q,q):''}`;}
  function groupBody(q,a,language='de'){const en=language==='en',labels=en?[['true','True'],['false','False'],['skip','Skip']]:[['true','Wahr'],['false','Falsch'],['skip','Auslassen']];return `<p class="small">${q.type==='select'?'Mehrere Antworten können richtig sein. Markiere alle zutreffenden Aussagen; unmarkierte gelten bei Abgabe als falsch.':en?'Mark each statement as true or false.':'Jede Aussage einzeln bewerten.'}</p>${q.options.map((o,i)=>`<fieldset class="block-question"><legend lang="${q.language||(o.verbatim?'en':'de')}">${i+1}. ${o.text}</legend>${q.type==='select'?`<label><input type="checkbox" data-answer="${o.id}" ${a.answers[o.id]==='true'?'checked':''} ${a.submitted?'disabled':''}>Trifft zu</label>`:`<div class="radios">${labels.map(([v,t])=>`<label><input type="radio" name="question-${o.id}" data-answer="${o.id}" value="${v}" ${a.answers[o.id]===v?'checked':''} ${a.submitted?'disabled':''}>${t}</label>`).join('')}</div>`}${a.submitted?`<p class="small">${en?'Your answer':'Deine Antwort'}: ${labels.find(([v])=>v===a.answers[o.id])?.[1]||labels[2][1]}.</p>${feedback(o,q,language)}`:''}</fieldset>`).join('')}${!a.submitted?`<div class="actions"><button class="primary" id="question-submit">${en?'Check answers':'Antworten vergleichen'}</button></div>`:''}`;}
  function examBody(q,a,language){
   const en=language==='en',labels=en?[['true','True'],['false','False']]:[['true','Wahr'],['false','Falsch']];
   return q.options.map((o,i)=>`<fieldset class="block-question"><legend lang="${language}">${i+1}. ${E(o.text)}</legend><div class="radios">${labels.map(([v,t])=>`<label><input type="radio" name="exam-${o.id}" data-answer="${o.id}" value="${v}" ${a.answers[o.id]===v?'checked':''} ${a.submitted?'disabled':''}>${t}</label>`).join('')}</div>${a.submitted?`<p class="small">${en?'Your answer':'Deine Antwort'}: ${labels.find(([v])=>v===a.answers[o.id])?.[1]||(en?'Unanswered':'Nicht beantwortet')}.</p>${o.fragment?`<div class="answer-explanation" lang="${language}"><p><strong>${en?'Not gradable from this wording.':'Mit diesem Wortlaut nicht bewertbar.'}</strong> ${o.explanation}</p></div>`:feedback(o,q,language)}`:''}</fieldset>`).join('')+(!a.submitted?`<div class="actions"><button class="primary" id="question-submit">${en?'Check answers':'Antworten vergleichen'}</button></div>`:'');
  }
  function examTraining(){
   currentChapter=null;const l=state(),exam=X.migrate(l);l.examLanguage??='de';
   const language=l.examLanguage,en=language==='en',original=X.get(X.ids[exam.index]),q=X.localize(original,language);
   const a=exam.attempts[q.id]||(exam.attempts[q.id]={answers:{},submitted:false,helped:false,at:Date.now()});
   const grade=a.submitted?X.grade(original,a.answers):null;
   app.innerHTML=header('Multiple Choice',en?'Task 6 – MCQ':'Aufgabe 6 – Multiple Choice',en?'Mark True/False. Negative points for wrong answers.':'Wahr/Falsch markieren. Minuspunkte für falsche Antworten.')+nav('exam')+`
    <div class="exam-language" role="group" aria-label="Sprache der Klausurfragen"><button data-exam-language="de" aria-pressed="${!en}">Deutsch</button><button data-exam-language="en" aria-pressed="${en}">Original (Englisch)</button></div>
    <p class="small">${en?'All 20 entries from page 4, in the original order (a–f). Your answers are kept when switching languages.':'Alle 20 Einträge von Seite 4 in der ursprünglichen Reihenfolge (a–f). Deine Antworten bleiben beim Sprachwechsel erhalten.'}</p>
    <article class="card question" data-question="${q.id}" data-exam-question="${q.id}"><div class="eyebrow">Task 6(${q.group}) · ${q.options.length} ${en?'entries':'Einträge'}</div><h2 lang="${language}">${q.group}. ${E(q.title)}</h2>
    ${examBody(q,a,language)}
    ${a.submitted?`<div class="feedback ${grade.all?'good':''}" role="status">${grade.total?`<strong>${grade.correct} / ${grade.total} ${en?'gradable statements correct':'bewertbare Aussagen richtig'}</strong>`:''}${grade.score!==null?` · ${grade.score} / 5 ${en?'points':'Punkte'}`:''}${grade.ungraded?`<p>${grade.ungraded} ${en?'topic fragment(s) without a true/false key; excluded from the result.':'Stichwort(e) ohne Wahr/Falsch-Lösungsschlüssel; nicht in der Bewertung enthalten.'}</p>`:''}${a.helped?`<span class="small"> · ${en?'with reference reading':'mit Nachlesen'}</span>`:''}</div><button id="exam-retry">${en?'Try again':'Erneut beantworten'}</button>`:''}
    <p class="source">${en?'Source: exam overview 2024 · Page 4':'Aufgabenübersicht 2024 · Seite 4'} · Task 6(${q.group})</p><p>${theoryLink(q.topic,en?'Read the background':'Grundlage nachlesen')}</p></article>
    <div class="actions question-navigation"><button id="exam-back" ${exam.index===0?'disabled':''}>${en?'← Back':'← Zurück'}</button><span class="small">${en?'Group':'Gruppe'} ${exam.index+1} ${en?'of':'von'} ${X.ids.length}</span><button id="exam-next" class="primary" ${exam.index===X.ids.length-1?'disabled':''}>${en?'Next →':'Weiter →'}</button></div>
    <p class="small">${en?'The source contains 7 complete statements and 13 topic fragments. Every entry is shown unchanged; only complete statements can be graded.':'Die Vorlage enthält 7 vollständige Aussagen und 13 Stichworte. Alle Einträge werden unverändert übernommen; nur vollständige Aussagen lassen sich bewerten.'} <a href="materials/aufgaben-2024.pdf#page=4" target="_blank" rel="noopener">${en?'Open source PDF':'Klausurvorlage öffnen'}</a></p>`;
   const refresh=()=>{const y=scrollY;examTraining();scrollTo(0,y);};
   app.querySelectorAll('[data-exam-language]').forEach(button=>button.onclick=()=>{l.examLanguage=button.dataset.examLanguage;save();refresh();app.querySelector(`[data-exam-language="${l.examLanguage}"]`).focus({preventScroll:true});});
   app.querySelectorAll('[data-answer]').forEach(el=>el.onchange=()=>{a.answers[el.dataset.answer]=el.value;save();});
   document.getElementById('question-submit')?.addEventListener('click',()=>{
    if(a.submitted)return;a.submitted=true;a.at=Date.now();
    for(const o of original.options){
     if(typeof o.correct!=='boolean'||!o.concept)continue;
     const m=S().mc[o.concept]||{count:0},seq=Object.values(S().mc).reduce((n,x)=>n+x.count,0);
     S().mc[o.concept]={...m,count:m.count+1,lastCorrect:!a.helped&&['true','false'].includes(a.answers[o.id])&&(a.answers[o.id]==='true')===o.correct,originalSeen:true,at:a.at,seq};
    }
    save();refresh();
   });
   document.getElementById('exam-back').onclick=()=>{exam.index--;save();examTraining();scrollTo(0,0);};
   document.getElementById('exam-next').onclick=()=>{exam.index++;save();examTraining();scrollTo(0,0);};
   document.getElementById('exam-retry')?.addEventListener('click',()=>{exam.attempts[q.id]={answers:{},submitted:false,helped:false,at:Date.now()};save();examTraining();scrollTo(0,0);});
   math();save();
  }
  function catalog(bits=[]){
   currentChapter=null;state();
   app.innerHTML=header('Multiple Choice','Alle Fragen ansehen','Alle Originalfragen und Übungsvarianten mit Antwort und Erklärung.')+nav('catalog')+examEntry()+
    Q.all.map((q,i)=>`<article class="card catalog-question" id="catalog-${q.id}" data-catalog-question="${q.id}"><div class="eyebrow">${i+1} / ${Q.all.length} · ${typeLabel(q)} · ${provenance(q)}</div><h2>${q.title}</h2>${q.stem&&q.provenance!=='original'?`<div class="problem">${q.stem}</div>`:''}${Q.options(q).map((o,k)=>`<div class="catalog-option"><p class="question-text" ${o.verbatim?'lang="en"':''}>${q.type!=='single'?`${k+1}. `:''}${o.text}</p>${feedback(o,q)}</div>`).join('')}<a class="button" href="#/mc/frage/${q.id}">Diese Aufgabe üben</a></article>`).join('');
   math();
   const target=bits[1]==='original'?Q.all.find(q=>q.provenance==='original'):Q.all.find(q=>q.topic===bits[1]);
   if(target&&returnY===null)requestAnimationFrame(()=>document.getElementById('catalog-'+target.id)?.scrollIntoView({block:'start'}));
  }
  function theory(bits=[]){const l=state(),r=l.reading,c=T.chapters.find(c=>c.id===bits[1]);if(!c){
   currentChapter=null;const resume=T.chapters.find(c=>c.id===r.chapter);
   app.innerHTML=header('Theorie','Der Klausurüberblick','Die wichtigsten Begriffe, Formeln und Anwendungen zum Einstieg. Die ausführlichen Kapitel stehen darunter.')+
    (resume?`<p class="theory-start"><a href="#/theorie/${resume.id}">Weiterlesen: ${resume.title}</a></p>`:'')+
    `<div class="theory-overview">${T.overview.map(o=>`<section><h2>${o.title}</h2>${o.html}<p class="small"><a href="#/theorie/${o.chapter}">Ausführlich erklärt →</a></p></section>`).join('')}</div>
    <h2>Die ausführlichen Kapitel</h2><ol class="theory-toc">${T.chapters.map((ch,i)=>`<li><a href="#/theorie/${ch.id}"><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><div><strong>${ch.title}</strong><p>${ch.intro}</p><span class="small">${ch.sections.length} Abschnitte${r.read.includes(ch.id)?' · gelesen':''}</span></div></a></li>`).join('')}</ol>`;
   math();window.scrollTo(0,0);return;
  }
   currentChapter=c.id;r.chapter=c.id;save();const i=T.chapters.indexOf(c),back=l.returnTo&&/^#\/(mc|training|fragen|gesamt)/.test(l.returnTo)?`<a class="button" href="${E(l.returnTo)}">← Zur Bearbeitung zurück</a>`:'';
   app.innerHTML=`<div class="breadcrumb"><a href="#/theorie">Alle Kapitel</a> / ${i+1} von ${T.chapters.length}</div><article class="theory-reading">${header('Theorie · '+String(i+1).padStart(2,'0'),c.title,c.intro)}${back}<nav class="chapter-toc" aria-label="Abschnitte dieses Kapitels">${c.sections.map(sec=>`<a href="#/theorie/${c.id}/${sec.id}">${sec.title}</a>`).join('')}</nav>${c.sections.map(sec=>`<section id="read-${sec.id}" class="reading-section" data-reading-section="${sec.id}"><h2>${sec.title}</h2>${sec.html}</section>`).join('')}<p class="source">Grundlage: ${c.source} der bereitgestellten nn(1).pdf. Zahlenbeispiele sind eigene Anwendungen derselben Regeln.</p><div class="theory-practice"><h2>Jetzt anwenden</h2><div class="actions">${c.task?`<a class="button primary" href="#/training/${c.task}${c.id==='som'?'/som':c.id==='lvq'?'/ohne':''}">Passende Rechenaufgabe</a>`:''}<a class="button" href="#/fragen/${c.id}">Fragen zu diesem Kapitel</a></div>${back}</div><label class="read-marker"><input type="checkbox" id="chapter-read" ${r.read.includes(c.id)?'checked':''}>Kapitel als gelesen markieren</label><div class="chapter-navigation">${i?`<a href="#/theorie/${T.chapters[i-1].id}">← ${T.chapters[i-1].title}</a>`:'<a href="#/theorie">Zur Übersicht</a>'}${i<T.chapters.length-1?`<a class="button primary" href="#/theorie/${T.chapters[i+1].id}">Weiter: ${T.chapters[i+1].title} →</a>`:'<a class="button primary" href="#/fragen">Zu den Fragen →</a>'}</div></article>`;
   const diagrams=T.diagrams(NNVisual,NNCore);app.querySelectorAll('[data-diagram]').forEach(el=>el.innerHTML=diagrams[el.dataset.diagram]());
   document.getElementById('chapter-read').onchange=e=>{r.read=r.read.filter(id=>id!==c.id);if(e.target.checked)r.read.push(c.id);save();};math();
   restoring=true;const target=bits[2]?{section:bits[2],offset:0}:r.positions[c.id];requestAnimationFrame(()=>{if(currentChapter!==c.id){restoring=false;return;}const section=target&&document.getElementById('read-'+target.section);window.scrollTo(0,section?Math.max(0,section.getBoundingClientRect().top+scrollY-24+(target.offset||0)):0);requestAnimationFrame(()=>{restoring=false;remember();});});
  }
  function remember(){if(!currentChapter||restoring)return;const sections=[...app.querySelectorAll('[data-reading-section]')];if(!sections.length)return;const sec=sections.filter(el=>el.getBoundingClientRect().top<=100).at(-1)||sections[0];const top=sec.getBoundingClientRect().top+scrollY;state().reading.positions[currentChapter]={section:sec.dataset.readingSection,offset:Math.max(0,scrollY-top+24)};save();}
  function beforeRoute(){if(currentChapter&&state().returnTo===location.hash)returnY=state().returnY||0;remember();currentChapter=null;clearTimeout(scrollTimer);}
  function restoreReturn(){if(returnY!==null){window.scrollTo(0,returnY);returnY=null;}}
  window.addEventListener('scroll',()=>{if(currentChapter){clearTimeout(scrollTimer);scrollTimer=setTimeout(remember,180);}},{passive:true});
  window.addEventListener('pagehide',remember);
  document.addEventListener('click',e=>{const a=e.target.closest('[data-learning-theory]');if(a){state().returnTo=location.hash;state().returnY=scrollY;if(location.hash.startsWith('#/mc')&&!location.hash.startsWith('#/mc/block')){const l=state(),exam=location.hash==='#/mc/klausur'?X.migrate(l):null,attempt=exam?exam.attempts[X.ids[exam.index]]:l.attempts[l.cursor];if(attempt&&!attempt.submitted)attempt.helped=true;}save();}});
  function enrichTask(t,p){const topic=p.recipes.includes('som')?'som':T.forFamily(t.family),node=document.createElement('p');node.className='task-theory-link';node.innerHTML=theoryLink(topic,'Die Grundlage Schritt für Schritt lesen');app.querySelector('.source')?.after(node);}
  return {training,catalog,theory,beforeRoute,restoreReturn,enrichTask,state};
 }
 function valid(value){
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),str=x=>typeof x==='string',nat=x=>Number.isInteger(x)&&x>=0;
  if(value===undefined)return true;
  if(!obj(value)||value.version!==1||!Array.isArray(value.attempts)||!Number.isInteger(value.cursor)||value.cursor< -1||value.cursor>=value.attempts.length)return false;
  const ids=new Set();for(const a of value.attempts){if(!obj(a)||!str(a.id)||ids.has(a.id)||!Q.get(a.qid)||!obj(a.answers)||typeof a.submitted!=='boolean'||typeof a.helped!=='boolean'||!Number.isFinite(a.at))return false;ids.add(a.id);const options=Q.options(Q.get(a.qid)).map(o=>o.id);if(a.submitted&&!options.every(id=>['true','false','skip'].includes(a.answers[id])))return false;if(!Object.entries(a.answers).every(([k,v])=>options.includes(k)&&['true','false','skip'].includes(v)))return false;}
  const c=value.catalog,r=value.reading;return X.valid(value.exam)&&(value.examLanguage===undefined||['de','en'].includes(value.examLanguage))&&(value.examPracticeIndex===undefined||(nat(value.examPracticeIndex)&&value.examPracticeIndex<X.ids.length))&&(value.practiceIndex===undefined||(nat(value.practiceIndex)&&value.practiceIndex<Q.all.length))&&(value.returnY===undefined||(Number.isFinite(value.returnY)&&value.returnY>=0))&&obj(c)&&['all',...T.chapters.map(x=>x.id)].includes(c.topic)&&['all','single','block','select'].includes(c.type)&&['all','original','training','variant'].includes(c.origin)&&typeof c.answers==='boolean'&&obj(r)&&(r.chapter===null||T.chapters.some(x=>x.id===r.chapter))&&Array.isArray(r.read)&&r.read.every(id=>T.chapters.some(c=>c.id===id))&&obj(r.positions)&&Object.entries(r.positions).every(([id,p])=>obj(p)&&T.chapters.find(c=>c.id===id)?.sections.some(s=>s.id===p.section)&&Number.isFinite(p.offset)&&p.offset>=0)&&(value.returnTo===null||(str(value.returnTo)&&/^#\/(mc|training|fragen|gesamt)(\/|$)/.test(value.returnTo)));
 }
 root.NNLearn={create,valid};
})(typeof globalThis!=='undefined'?globalThis:this);
