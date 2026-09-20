'use strict';
// Reconstructed/own training statements, never represented as verbatim exam text.
const extraQuestionGroups = [
 ['reg','Regression','106–119',[
 ['Eine polynomiale Regression ist linear in ihren Koeffizienten.',true,'Die Eingabespalten dürfen Potenzen enthalten; die Koeffizienten werden weiterhin linear kombiniert.'],
 ['Die Summe der Residuen kann als Ersatz für die Summe ihrer Quadrate minimiert werden.',false,'Positive und negative Residuen können sich aufheben. Die Zielfunktion der kleinsten Quadrate ist die Summe der quadrierten Residuen.'],
 ['Voller Spaltenrang von X macht XᵀX invertierbar.',true,'Für v ≠ 0 gilt dann ‖Xv‖² > 0. Daher ist XᵀX positiv definit.'],
 ['Mehr Datenzeilen als Parameter garantieren eine eindeutige Least-Squares-Lösung.',false,'Die Spalten können trotzdem linear abhängig sein. Entscheidend ist der Rang.'],
 ['Die Normalgleichungen lauten XᵀX a = Xᵀy.',true,'Sie entstehen aus dem verschwindenden Gradienten 2Xᵀ(Xa−y).']]],
 ['logit','Logistische Regression','120–138',[
 ['Die logistische Funktion nimmt bei endlichen reellen Eingaben Werte strikt zwischen 0 und 1 an.',true,'Der Nenner 1+exp(−z) ist immer größer als 1.'],
 ['Der Logit ln(y/(1−y)) ist bei y=0 endlich.',false,'Der Logit ist für 0<y<1 definiert; an den Endpunkten divergiert er.'],
 ['Least Squares im Logit-Raum und im ursprünglichen Zielraum haben immer dieselbe Lösung.',false,'Die Transformation verändert die Fehlerfunktion.'],
 ['Die Ableitung der logistischen Funktion ist f(z)(1−f(z)).',true,'Sie ist maximal 1/4 bei z=0.'],
 ['Beim direkten quadratischen Fehler einer logistischen Regression enthält der Gradient einen Faktor p(1−p).',true,'Dieser Faktor entsteht aus der Kettenregel für die Aktivierung.']]],
 ['class','Binäre Klassifikation','139–162',[
 ['Bei logistischer Ausgabe entspricht die Entscheidungsschwelle 1/2 einer Grenze z=0.',true,'Die logistische Funktion ist streng monoton und hat bei 0 den Wert 1/2.'],
 ['Maximum Likelihood und Minimieren der negativen Log-Likelihood sind äquivalente Ziele.',true,'Logarithmieren ist monoton; das negative Vorzeichen vertauscht Maximum und Minimum.'],
 ['Für Ziel y=0 lautet der BCE-Beitrag −ln p, wenn p die Wahrscheinlichkeit von Klasse 1 ist.',false,'Für y=0 ist der Beitrag −ln(1−p).'],
 ['Lineare Separierbarkeit garantiert einen endlichen optimalen Parametervektor der unbeschränkten logistischen Klassifikation.',false,'Die Trennung kann durch immer steilere Funktionen verbessert werden; die Parameter können unbeschränkt wachsen.'],
 ['Der Log-Likelihood-Gradient für ein binäres Beispiel ist (y−p)x*.',true,'Im Unterschied zum quadratischen Fehler fällt der zusätzliche Sigmoid-Ableitungsfaktor weg.']]],
 ['multi','Mehrere Klassen','73–78, 163–170',[
 ['Softmax-Ausgaben sind positiv und summieren sich zu 1.',true,'Alle Exponentialwerte sind positiv und werden durch ihre gemeinsame Summe geteilt.'],
 ['Unabhängige Sigmoid-Ausgaben bilden stets eine Wahrscheinlichkeitsverteilung über die Klassen.',false,'Ihre Summe muss nicht 1 sein. Das ist ein Nachteil des unabhängigen Ansatzes.'],
 ['Bei einem One-Hot-Ziel reduziert sich Kreuzentropie auf den negativen Logarithmus der Wahrscheinlichkeit der wahren Klasse.',true,'Alle anderen Zielkomponenten sind null.'],
 ['Wenn zu allen Softmax-Aktivierungen dieselbe Konstante addiert wird, ändert sich die Verteilung.',false,'Der gemeinsame Exponentialfaktor kürzt sich.'],
 ['Softmax und Argmax liefern beide nur einen Klassenindex.',false,'Softmax liefert eine Verteilung; Argmax einen Index eines Maximums.']]],
 ['train','Training & Backpropagation','171–183',[
 ['Backpropagation ist eine Anwendung der Kettenregel.',true,'Lokale Ableitungen werden rückwärts entlang der Verbindungen zusammengesetzt.'],
 ['Das bereits aktualisierte Ausgangsgewicht muss für den Hidden-Fehler desselben Gradienten-Schritts verwendet werden.',false,'Alle Gradienten gehören zum alten Parameterzustand. Erst danach werden Gewichte aktualisiert.'],
 ['Ein positiver Bias entspricht einem negativen Schwellenwert, wenn die Aktivierung von net−θ abhängt.',true,'Es gilt b=−θ.'],
 ['Online- und Batch-Training müssen nach einer Epoche dieselben Gewichte liefern.',false,'Online verwendet für spätere Beispiele bereits veränderte Gewichte; Batch sammelt bei festen Gewichten.'],
 ['Bei rein affinen Schichten bleibt auch ihre Verkettung affin.',true,'Die Komposition Ax+b und Cy+d ist CAx+Cb+d. Nichtlineare Darstellungsfähigkeit entsteht dadurch nicht.']]],
 ['validation','Generalisierung','220–230',[
 ['Ein kleiner Trainingsfehler beweist einen kleinen Fehler auf neuen Daten.',false,'Overfitting kann einen großen Abstand zwischen Trainings- und Validierungsfehler verursachen.'],
 ['Die Anzahl verdeckter Neuronen ist ein Hyperparameter.',true,'Sie steuert das Modellbildungsverfahren; Gewichte sind Parameter des trainierten Modells.'],
 ['Bei k-facher Kreuzvalidierung wird jeder Fold einmal zur Bewertung ausgelassen.',true,'Die übrigen k−1 Folds bilden in diesem Durchlauf die Trainingsdaten.'],
 ['Early Stopping verändert automatisch die Zahl der Hidden-Neuronen.',false,'Es begrenzt die Trainingsdauer bei gegebener Architektur.'],
 ['Steigender Validierungsfehler bei weiter sinkendem Trainingsfehler kann Overfitting anzeigen.',true,'Das ist das klassische Muster, auf das Early Stopping reagiert.']]],
 ['deep','Deep Learning & Autoencoder','246–261',[
 ['Der Ableitungsfaktor einer logistischen Aktivierung ist höchstens 1/4.',true,'f(1−f) erreicht bei f=1/2 sein Maximum. Weitere Gewichtsfaktoren müssen im gesamten Gradienten mitberücksichtigt werden.'],
 ['ReLU besitzt für jede negative Eingabe die Ableitung 1.',false,'Für negative Eingaben ist die Ableitung 0, für positive 1. An 0 ist sie klassisch nicht differenzierbar.'],
 ['Ein Denoising-Autoencoder soll die unverrauschte Eingabe aus einer verrauschten Eingabe rekonstruieren.',true,'Das Ziel bleibt unverrauscht, damit bloßes Durchreichen nicht genügt.'],
 ['Beim Dropout werden nach dem Training dauerhaft alle zuvor deaktivierten Neuronen entfernt.',false,'Die Folien verwenden beim Ausführen alle Neuronen mit entsprechender Skalierung.'],
 ['Ein Autoencoder ohne geeignete Einschränkung kann lediglich die Identität lernen.',true,'Ein Engpass, dünne Aktivierung oder Rauschen soll eine nützliche Merkmalsdarstellung fördern.']]],
 ['cnn','CNN & Pooling','262–266',[
 ['Geteilte Kernelgewichte werden an mehreren Bildpositionen verwendet.',true,'Der Filter lernt eine lokale Operation, die über das Bild verschoben wird.'],
 ['Ein 5×5-Bild und ein 3×3-Kernel ergeben bei Stride 1 ohne Padding eine 5×5-Ausgabe.',false,'Die Ausgabe ist 3×3: (5−3)/1+1=3.'],
 ['Max-Pooling wählt den größten Wert innerhalb eines Fensters.',true,'Average-Pooling würde stattdessen den Mittelwert bilden.'],
 ['Größerer Stride kann bei gleichem Bild, Kernel und Padding die Zahl der Ausgabepositionen reduzieren.',true,'Der Kernel wird in größeren Schritten verschoben.'],
 ['Padding verändert weder Randbehandlung noch Ausgabegröße.',false,'Padding fügt Randwerte hinzu und geht in die Größenformel ein.']]],
 ['proto','Prototypen, SOM & EM','310–314, 336–366',[
 ['Bei einem c-Means-Batchschritt werden erst alle Punkte zugeordnet und anschließend die Zentren neu berechnet.',true,'Die Zuordnung verwendet gemeinsam die alten Zentren.'],
 ['Die überwachte Regel auf Folie 340 aktualisiert unter ihren Klassenbedingungen zwei nächste Prototypen.',true,'Der zur richtigen Klasse wird angezogen, der zur falschen abgestoßen.'],
 ['Die Gauß-Nachbarschaft einer SOM verwendet den Abstand der Prototypen im Datenraum.',false,'Die Nachbarschaft verwendet den Abstand im Neuronengitter. Der Winner wird dagegen im Datenraum bestimmt.'],
 ['EM wechselt zwischen weichen Zugehörigkeiten und gewichteter Parameterschätzung.',true,'E-Schritt: Zugehörigkeiten. M-Schritt: Parameter mit diesen Gewichten neu schätzen.'],
 ['Beim Winner einer SOM ist der Gauß-Nachbarschaftsfaktor 0.',false,'Sein Gitterabstand ist 0, also exp(0)=1.']]],
 ['energy','Hopfield & Boltzmann','388–433',[
 ['Bei net=θ kann nach Borgelts Regel ein Wechsel von −1 zu +1 mit ΔE=0 auftreten.',true,'Der Faktor net−θ in der Energieänderung ist dann null.'],
 ['Asynchrone Hopfield-Konvergenz beweist, dass ein globales Energieminimum erreicht wird.',false,'Das Netz kann in einem lokalen Minimum beziehungsweise stabilen Zustand enden.'],
 ['Bei Hebbschem Speichern eines bipolaren Musters mit Schwellen 0 wird auch sein Komplement gespeichert.',true,'Die Produkte sᵢsⱼ bleiben bei gemeinsamem Vorzeichenwechsel unverändert.'],
 ['Eine RBM hat direkte Verbindungen zwischen beliebigen Paaren sichtbarer Neuronen.',false,'Die Einschränkung verbietet Verbindungen innerhalb der sichtbaren und innerhalb der verdeckten Gruppe.'],
 ['Die Boltzmann-Verteilung gewichtet bei positiver Temperatur Zustände niedriger Energie stärker.',true,'P(s) ist proportional zu exp(−E(s)/(kT)).']]],
 ['rnn','Rekurrente Netze','434–453',[
 ['Rekurrente Netze können zeitliche Zustände durch Rückkopplung weiterführen.',true,'Die Folien modellieren damit beispielsweise Abkühlung und Bewegung.'],
 ['Beim Entfalten in der Zeit werden gemeinsam verwendete Parameter zu unabhängig trainierten Parametern.',false,'Die Kopien repräsentieren dieselben Parameter; Gradientenbeiträge werden zusammengeführt.'],
 ['Eine Differentialgleichung zweiter Ordnung kann mit einer zusätzlichen Zustandsgröße als System erster Ordnung geschrieben werden.',true,'Mit v=ẋ erhält man ẋ=v und eine Gleichung für v̇.'],
 ['Backpropagation through Time verwendet grundsätzlich keine Kettenregel.',false,'Die zeitliche Entfaltung erlaubt gerade die Anwendung der Kettenregel.'],
 ['Ein diskreter Zeitschritt ist im Allgemeinen eine Näherung der kontinuierlichen Dynamik.',true,'Die Schrittweite beeinflusst die Diskretisierung.']]],
 ['fuzzy','Fuzzy & Neuro-Fuzzy','458–497, 512',[
 ['Ein Fuzzy-Zugehörigkeitsgrad muss eine Wahrscheinlichkeit sein.',false,'Er beschreibt Zugehörigkeit zu einem unscharfen Begriff, nicht zwingend die Wahrscheinlichkeit eines Ereignisses.'],
 ['COG und MOM liefern für jede Fuzzy-Ausgabemenge denselben Wert.',false,'Schwerpunkt und Mittel der Maximalstellen können verschieden sein.'],
 ['TSK-Regeln verwenden Funktionen der Eingaben als Konklusion.',true,'Die Funktionswerte werden mit den Regelaktivierungen gewichtet.'],
 ['Bei einem TSK-Regler ist die gewichtete Mittelwertformel auch bei Nenner null direkt definiert.',false,'Ohne aktivierte Regel ist die Formel nicht definiert; es braucht eine gesonderte Festlegung.'],
 ['Neuro-Fuzzy-Training soll Einschränkungen erhalten, die die Bedeutung der Regeln sichern.',true,'Sonst können trainierte Mengen ihre interpretierbare Semantik verlieren.']]]
].map(([id,title,source,questions])=>({id,title,questions:questions.map(([text,correct,explanation],i)=>({id:`${id}-${i+1}`,text,correct,explanation,source:'Folien '+source}))}));

function allQuestionGroups() {
 return [...mcqData.map(g=>({id:g.subtaskId,title:g.title.replace(/^Subtask [a-f]: /,''),questions:g.statements.map(s=>({id:s.id,text:s.text,correct:s.correct,explanation:s.expl,source:s.slide}))})),...extraQuestionGroups];
}
function selectQuestionGroups(seed,profile='mixed') {
 const groups=allQuestionGroups();if(profile==='core')return groups.slice(0,6);
 let s=seed>>>0;const shuffled=[...groups];for(let i=shuffled.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}return shuffled.slice(0,6);
}
function scoreQuestionGroups(groups,answers) {
 return groups.map(g=>({id:g.id,score:Math.max(0,g.questions.reduce((sum,q)=>sum+(answers[q.id]==='true'||answers[q.id]==='false'?(answers[q.id]==='true')===q.correct?1:-1:0),0))}));
}
function questionBlocksHTML(groups,answers,reveal,namespace) {
 return groups.map((g,gi)=>`<article class="practice-card"><h2>Block ${gi+1}: ${safeText(g.title)}</h2>${g.questions.map((q,qi)=>`<fieldset class="quiz-statement"><legend>${qi+1}. ${q.text}</legend><div class="actions">${[['true','Wahr'],['false','Falsch'],['skip','Auslassen']].map(([value,label])=>`<label><input type="radio" name="${namespace}-${q.id}" data-question="${q.id}" value="${value}" ${(answers[q.id]||'skip')===value?'checked':''} ${reveal?'disabled':''}> ${label}</label>`).join('')}</div>${reveal?`<p class="${(answers[q.id]==='true')===q.correct&&answers[q.id]!=='skip'&&answers[q.id]?'correct':''}"><strong>${q.correct?'Wahr':'Falsch'}.</strong> ${q.explanation}</p><p class="source">${q.source}</p>`:''}</fieldset>`).join('')}</article>`).join('');
}
function initTheoryQuiz() {
 const section=document.getElementById('module-task6');let seed=1,reveal=false,groups,answers={};
 section.innerHTML='<h1>Theorie prüfen</h1><p>Trainingsaussagen nach den Folien und den Themenstichworten von 2024. Pro Block: richtig +1, falsch −1, ausgelassen 0; mindestens 0 Punkte. Entscheide auch anhand der Voraussetzungen.</p><div class="actions"><label for="quiz-selection">Auswahl</label><select id="quiz-selection"><option value="core">30 Kernfragen zu den Themen von 2024</option><option value="mixed">30 gemischte Fragen</option>'+allQuestionGroups().map(g=>`<option value="${g.id}">${safeText(g.title)} · 5 Aussagen</option>`).join('')+'</select><button id="quiz-new">Neuer Durchlauf</button><button class="primary" id="quiz-grade">Auswerten</button></div><p id="quiz-score" role="status"></p><div id="quiz-blocks" class="lesson"></div>';
 const select=section.querySelector('select'),host=section.querySelector('#quiz-blocks');
 function render(){host.innerHTML=questionBlocksHTML(groups,answers,reveal,'quiz');host.querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>{answers[i.dataset.question]=i.value;state.mcqAnswers={...state.mcqAnswers,...answers};saveState();}));renderMath(host);}
 function start(){reveal=false;answers={};const value=select.value;groups=['core','mixed'].includes(value)?selectQuestionGroups(seed,value):allQuestionGroups().filter(g=>g.id===value);section.querySelector('#quiz-score').textContent='';section.querySelector('#quiz-grade').disabled=false;render();}
 select.addEventListener('change',start);section.querySelector('#quiz-new').addEventListener('click',()=>{seed++;start();});section.querySelector('#quiz-grade').addEventListener('click',()=>{reveal=true;const scores=scoreQuestionGroups(groups,answers),sum=scores.reduce((s,g)=>s+g.score,0);section.querySelector('#quiz-score').textContent=`${sum} / ${groups.length*5} Punkte · ${scores.map((s,i)=>`Block ${i+1}: ${s.score}/5`).join(' · ')}`;state.scores['quiz-'+select.value]=sum;saveState();section.querySelector('#quiz-grade').disabled=true;render();});start();
}
