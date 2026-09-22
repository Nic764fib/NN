/* Stable catalog IDs. Existing form indices are never changed. */
(function(root){
 'use strict';
 const M=root.NNMC||require('./study-mc.js'),T=root.NNTheory||require('./study-theory.js'),raw=String.raw;
 const fixes={
 a2:'Im RBF-Netz dieser Vorlesung kombiniert der Ausgang die verdeckten Aktivierungen linear.',a3:'LVQ kann ohne Klasseninformation oder mit einer ausdrücklich vorgegebenen Klassenregel arbeiten.',a4:'Die SOM fördert die Erhaltung von Nachbarschaften, garantiert sie aber nicht perfekt für jeden Datensatz.',a5:'Die Zustandsneuronen des Hopfield-Netzes sind selbst Ein- und Ausgabeneuronen; eine zusätzliche Hidden-Schicht gibt es nicht.',
 b1:'Bei reellen Eingaben ist das Ausgabe-1-Gebiet einer TLU ein Halbraum. Nur die binären Eingabepunkte bilden Würfelecken.',b2:'Bei zwei binären Eingaben sind 14 Funktionen separierbar und nur XOR und XNOR nicht separierbar.',b3:'Die konvexen Hüllen strikt linear separierbarer Klassen haben keinen gemeinsamen Punkt. Für nichtleere endliche Punktmengen gilt auch die Umkehrung.',b4:'XOR benötigt mehr als eine einzelne TLU; die zwei Klassen sind nicht durch eine Gerade trennbar.',b5:'Die Ausgabe ist 1 für eine Summe mindestens auf der Schwelle und sonst 0; sie ist nicht proportional zur Summe.',
 c1:'Eine Verkettung ausschließlich affiner Schichten bleibt affin, unabhängig von ihrer Tiefe.',c2:'Die Neuronenzahl muss für die gewünschte Genauigkeit ausreichend groß gewählt werden können; zwei feste Hidden-Neuronen genügen nicht allgemein.',c3:'Eine Gauß-RBF ist bei jedem endlichen Abstand positiv und nähert sich nur im Grenzfall null.',c4:'Der Approximationssatz garantiert die Existenz geeigneter Parameter unter seinen Voraussetzungen, nicht das Finden dieser Parameter durch Gradientenabstieg.',c5:'Zentren und Ausgangsgewichte können getrennt bestimmt werden. Gemeinsames Backpropagation-Training ist nicht zwingend.',
 d1:'QuickProp verwendet aktuelle und vorherige Ableitungen für einen lokal an einer Parabel orientierten Schritt.',d2:'Adam führt gleitende Schätzungen des ersten und des unzentrierten zweiten Gradientenmoments.',d3:'Gradientenabstieg kann bei nichtkonvexen Fehlerflächen lokale Minima oder stationäre Punkte erreichen; ein globales Minimum ist nicht garantiert.',d4:'Bei RProp bestimmt das Vorzeichen die Richtung. Die individuelle Schrittweite ist nicht direkt proportional zum aktuellen Gradientenbetrag.',d5:'RMSProp mittelt quadrierte Gradienten. Adam führt zusätzlich ein Mittel der Gradienten selbst.',
 e1:'Die Dreiecksungleichung lautet d(x,z) ≤ d(x,y)+d(y,z).',e2:'Metrikaxiome sind Nichtnegativität, Identität, Symmetrie und Dreiecksungleichung; Assoziativität gehört nicht dazu.',e3:'Bei einer Metrik gilt Abstand 0 genau für identische Punkte.',e4:'Aus den zwei Abständen 1 folgt nur 0 ≤ d(x,z) ≤ 2, nicht d(x,z)=1. Transitivität ist kein Metrikaxiom.',
 f1:'Die Gewichte sind symmetrisch, aber die Hauptdiagonale ist null.',f2:'Es gibt keine separate verdeckte Schicht. Die vorhandenen Neuronen dienen selbst als Ein- und Ausgabe.',f3:'Ohne Selbstkopplung und ohne andere Updates behält dasselbe sofort nochmals aktualisierte Neuron seinen neuen Wert.',f4:'Zusätzlich zu den Zuständen müssen die Netzparameter passend umgerechnet werden; unveränderte Gewichte und Schwellen sind nicht allgemein äquivalent.',f5:'Die Stabilitätsaussage gilt für faire asynchrone Updates des Standardnetzes; synchrone Updates können Zyklen bilden.',
 'som-cut':'Der Gaußfaktor bleibt bei jedem endlichen Gitterabstand positiv. Ein harter Abbruch braucht eine zusätzliche Vorgabe.',
 'old-weights':'Für alle Ableitungen eines gemeinsamen Backpropagation-Schritts wird derselbe bisherige Parameterstand verwendet.',batch:'Online und Batch können verschiedene Gewichte erzeugen, weil die Zwischenupdates unterschiedlich sind.',overfit:'Ein kleiner Trainingsfehler allein garantiert keine gute Leistung auf neuen Daten.',bce:'Für Ziel 0 ist der BCE-Beitrag −ln(1−p); −ln p gehört zum Ziel 1.',relu:'Für negative Eingaben ist die ReLU-Ableitung 0, für positive 1; bei 0 ist sie nicht differenzierbar.',rbm:'Eine RBM hat keine direkten Verbindungen innerhalb der sichtbaren oder innerhalb der verdeckten Gruppe.',fuzzy:'Ein Fuzzy-Zugehörigkeitsgrad beschreibt Zugehörigkeit; er muss keine Wahrscheinlichkeit sein.'
 };
 const singles=M.concepts.flatMap(c=>[...c.forms.map((_,i)=>M.question(c,i)),...(c.original?[M.question(c,'original')]:[])].map(q=>({...q,type:'single',topic:T.forConcept(c.id),provenance:q.verbatim?'original':'training',title:q.verbatim?'Originalaussage 2024':q.core?M.groups.find(g=>g[0]===q.group)[1]:'Ergänzende Grundlagen',correction:q.correct?'':fixes[c.id]})));
 const lookup=id=>singles.find(q=>q.id===id);
 lookup('cnn-size-0').explanation='Ein 3×3-Kernel passt ohne Randzugabe an drei horizontale und drei vertikale Positionen in ein 5×5-Bild. Pro Richtung gilt (5−3)/1+1=3. Zusammen ergibt das eine 3×3-Ausgabe pro Filter.';
 const stem={a:'Beurteile die Aussagen über die Netztypen dieser Vorlesung.',b:'Beurteile die Aussagen zu TLUs und zur linearen Trennbarkeit.',c:'Beurteile die Aussagen über MLPs, RBF-Netze und ihre Approximationsfähigkeit.',d:'Beurteile die Aussagen über Training und Optimierungsverfahren.',e:'Beurteile die Aussagen über Metriken und Abstände.',f:'Betrachte das Standard-Hopfield-Netz mit festen symmetrischen Gewichten, Null-Diagonale und der Schwellenregel „+1 bei net ≥ θ, sonst −1“. Beurteile die Aussagen.'};
 const blocks=M.groups.flatMap(([g,title])=>[0,1].map(form=>({id:`block-${g}-${form}`,type:'block',title:title+' · Übungsblock '+(form+1),stem:stem[g],topic:T.forConcept(g+'1'),group:g,provenance:'training',source:'Eigene / rekonstruierte Trainingsformulierungen · Folie 2: Format und Wertung',officialScore:true,options:M.concepts.filter(c=>c.core&&c.group===g).map(c=>lookup(c.id+'-'+form))})));
 blocks.unshift(...['b','f'].map(g=>({id:'original-block-'+g,type:'block',title:'Vorlage 2024 · '+M.groups.find(x=>x[0]===g)[1],stem:g==='b'?'Überlieferte Aussagen aus Task 6(b), TLU. Von diesem Block sind nur zwei Aussagen vollständig überliefert. Fehlende Aussagen werden nicht ergänzt.':'Überlieferte Aussagen aus Task 6(f), Hopfield Networks. Bewerte jede Aussage einzeln als wahr oder falsch.',topic:g==='b'?'tlu':'hopfield',group:g,provenance:'original',source:'Aufgabenübersicht 2024 · Seite 4 · Gruppierung aus der Vorlage; deutsche Arbeitsanweisung ergänzt',officialScore:g==='f',options:singles.filter(q=>q.verbatim&&q.group===g)})));
 // Each new option includes its own reason and, if false, an explicit corrected assertion.
 const scenarios=[
 ['tlu-zahlen','tlu','Eine TLU am Rand',raw`Eine TLU hat $w=(2,-1)$ und $\theta=3$. Am Gleichheitsfall gibt sie $1$ aus.`, '17–23',[
 [raw`Für $x=(2,1)$ ist die Ausgabe $1$.`,true,raw`Die Summe ist $2\cdot2-1=3$. Da $3\ge3$, ist die Ausgabe $1$.`],
 [raw`Ein Bias $b=3$ ersetzt die Schwelle korrekt.`,false,raw`Das verschobene Feld ist $2x_1-x_2-3$.`,raw`Der passende Bias ist $b=-3$.`],
 [raw`Für $x=(0,0)$ ist die Ausgabe $0$.`,true,raw`Die Summe ist $0<3$, also Ausgabe $0$.`],
 [raw`Die Grenze des Ausgabegebiets ist $2x_1-x_2=0$.`,false,raw`Die Grenze liegt dort, wo die gewichtete Summe der Schwelle entspricht.`,raw`Die Grenze lautet $2x_1-x_2=3$.`]]],
 ['abstand-zahlen','abstaende','Abstände eines Punktepaares',raw`Gegeben sind $x=(1,2)$ und $c=(4,6)$. Beurteile die Abstände.`, '289, 332–333',[
 [raw`Der Manhattanabstand ist $7$.`,true,raw`Die absoluten Differenzen sind $3$ und $4$. Ihre Summe ist $7$.`],
 [raw`Der euklidische Abstand ist $25$.`,false,raw`$3^2+4^2=25$ ist das Abstandsquadrat.`,raw`Der Abstand ist $\sqrt{25}=5$.`],
 [raw`Der Maximumabstand ist $4$.`,true,raw`Der größere der beiden Beträge $3$ und $4$ ist $4$.`],
 [raw`Der quadrierte euklidische Abstand erfüllt immer die Dreiecksungleichung.`,false,raw`Für die Zahlen $0,1,2$ wäre $4\le1+1$ nötig. Das ist falsch.`,raw`Der euklidische Abstand ist eine Metrik; sein Quadrat ist im Allgemeinen keine.`]]],
 ['rbf-abzug','rbf','Zwei aktive Basisfunktionen',raw`Ein RBF-Netz hat linearen Ausgang $y=h_1-h_2$. Am betrachteten Punkt gilt $h_1=1$ und $h_2=1$.`, '288–291',[
 [raw`Die Ausgabe ist $0$.`,true,raw`Einsetzen ergibt $1-1=0$.`],
 [raw`Der Ausgang liefert wegen seiner Schwelle zwingend $1$.`,false,raw`Ein linearer Ausgang bildet hier nur die vorgegebene gewichtete Summe. Es gibt keine zusätzliche Schwellenaktivierung.`,raw`Der lineare Ausgang liefert $0$.`],
 [raw`Ein negatives Ausgangsgewicht kann einen Beitrag einer anderen RBF abziehen.`,true,raw`Hier hebt der Beitrag $-h_2=-1$ den Beitrag $h_1=1$ auf.`],
 [raw`Wenn $h_1=0$ und $h_2=1$ wäre, wäre die Ausgabe weiterhin $0$.`,false,raw`Es bliebe nur der negative Beitrag.`,raw`Dann wäre $y=0-1=-1$.`]]],
 ['approx-werte','approx','Stützwerte 2, 5 und 4',raw`An den Stellen $0,1,2$ sind die Werte $2,5,4$ gegeben. Eine TLU-Stufenfunktion startet bei $2$ und springt bei $1$ und $2$. Alternativ werden Dreiecks-RBFs mit Zentren $0,1,2$ und Radius $1$ benutzt.`, '93–104, 294–300',[
 [raw`Die TLU-Sprunggewichte sind $3$ und $-1$.`,true,raw`Erster Sprung: $5-2=3$. Zweiter Sprung: $4-5=-1$.`],
 [raw`Bei $x=1{,}5$ liefert die linke Stufenfunktion $4{,}5$.`,false,raw`Zwischen $1$ und $2$ ist erst der erste Sprung aktiv.`,raw`Die Stufenfunktion liefert dort $2+3=5$.`],
 [raw`Mit RBF-Ausgangsgewichten $2,5,4$ ist die Ausgabe bei $1{,}5$ gleich $4{,}5$.`,true,raw`Die beiden benachbarten Dreiecke sind je $0{,}5$ hoch: $5\cdot0{,}5+4\cdot0{,}5=4{,}5$.`],
 [raw`Der Approximationssatz garantiert, dass jedes Training diese Gewichte findet.`,false,raw`Der Satz betrifft die Existenz einer ausreichend guten Darstellung unter seinen Voraussetzungen.`,raw`Eine erfolgreiche Suche nach den Gewichten ist nicht garantiert.`]]],
 ['gradient-zahlen','lernen','Einen Lernschritt kontrollieren',raw`Ein lineares Neuron hat $y=wx$, Eingabe $x=2$, Ziel $t=4$ und bisheriges Gewicht $w=1$. Verwende $E=\tfrac12(y-t)^2$ und Lernrate $0{,}1$.`, '137–183',[
 [raw`Die bisherige Ausgabe ist $2$.`,true,raw`$y=1\cdot2=2$.`],
 [raw`Der Fehlergradient nach $w$ ist $-4$.`,true,raw`$\partial E/\partial w=(y-t)x=(2-4)\cdot2=-4$.`],
 [raw`Gradientenabstieg ergibt $w_{\mathrm{neu}}=0{,}6$.`,false,raw`Beim Abstieg wird der Gradient abgezogen, nicht addiert.`,raw`$w_{\mathrm{neu}}=1-0{,}1\cdot(-4)=1{,}4$.`],
 [raw`Der neue Fehler beträgt $0{,}72$.`,true,raw`Mit $w=1{,}4$ ist $y=2{,}8$. Also $E=\tfrac12(2{,}8-4)^2=0{,}72$.`]]],
 ['optimierer-vergleich','lernen','Was aus einem Gradienten gespeichert wird',raw`Ein Verfahren speichert $v_{\mathrm{neu}}=0{,}9v+0{,}1g^2$. Aktuell sind $v=4$ und Gradient $g=-3$. Betrachte außerdem die Verfahren der Folien.`, '192–196',[
 [raw`Der neue Speicherwert ist $4{,}5$.`,true,raw`$0{,}9\cdot4+0{,}1\cdot(-3)^2=3{,}6+0{,}9=4{,}5$.`],
 [raw`Der gespeicherte Wert ist automatisch die Varianz der Gradienten.`,false,raw`Die Formel mittelt Quadrate, ohne den quadrierten Mittelwert abzuziehen.`,raw`Sie schätzt ein unzentriertes zweites Moment.`],
 [raw`Adam führt zusätzlich einen geglätteten Mittelwert der Gradienten selbst.`,true,raw`Neben dem Quadratmittel $v$ wird ein erstes Moment $m$ geführt. Bei RMSProp gehört dieses zusätzliche Moment nicht zur Standardformel der Folie 194.`],
 [raw`RProp verdreifacht bei einem dreifachen Gradientenbetrag zwingend die aktuelle Schrittweite.`,false,raw`RProp entkoppelt die Schrittlänge vom aktuellen Gradientenbetrag.`,raw`Die Richtung folgt dem Vorzeichen; die Schrittweite wird anhand des Verlaufs angepasst.`]]],
 ['lvq-klassen','lvq','Winner mit falscher Klasse',raw`Der Datenpunkt $x=(3,2)$ ist schwarz. Die Prototypen sind $A=(2,2)$, weiß, und $B=(6,2)$, schwarz. Lernrate $\eta=0{,}5$.`, '336, 340',[
 [raw`$A$ ist der Winner.`,true,raw`Die Abstandsquadrate sind $1$ zu $A$ und $9$ zu $B$.`],
 [raw`Die Gewinnerregel mit Klassen zieht $A$ nach $(2{,}5,2)$.`,false,raw`Die Klasse des Winners passt nicht zum schwarzen Punkt; daher wird abgestoßen.`,raw`$A_{\mathrm{neu}}=A-0{,}5(x-A)=(1{,}5,2)$.`],
 [raw`Ohne Klasseninformation bleibt $B$ unverändert.`,true,raw`Es wird nur der nächste Prototyp $A$ angezogen; $B$ ist nicht der Winner.`],
 [raw`Unter der Zweiprototypen-Regel von Folie 340 wird $B$ zu $(4{,}5,2)$.`,true,raw`Die zwei nächsten haben verschiedene Klassen, eine passt zum Punkt. $B$ wird angezogen: $(6,2)+0{,}5(-3,0)=(4{,}5,2)$. $A$ wird zugleich abgestoßen.`]]],
 ['som-nachbar','som','Zwei Abstände sauber trennen',raw`Eine SOM verwendet $h=\exp(-d_G^2/(2\sigma^2))$, wobei $d_G$ der Gitterabstand ist. Gegeben sind $\sigma=1$, $\eta=0{,}4$, Eingabe $x=(8,6)$ und ein Winner mit Vektor $(10,5)$.`, '364–367',[
 [raw`Der Nachbarschaftsfaktor des Winners ist $1$.`,true,raw`Sein Abstand zu sich selbst im Gitter ist $0$: $e^0=1$.`],
 [raw`Der neue Winner-Vektor ist $(9{,}2,5{,}4)$.`,true,raw`$(10,5)+0{,}4((8,6)-(10,5))=(10,5)+(-0{,}8,0{,}4)$.`],
 [raw`Für Gitterabstand $2$ ist der Faktor exakt $0$.`,false,raw`$\sigma$ ist keine harte Abschneidegrenze.`,raw`Der Faktor ist $e^{-2}>0$.`],
 [raw`Für die Winner-Suche vergleicht man ausschließlich Gitterabstände.`,false,raw`Die Gitterposition ist erst für die Nachbarschaft relevant.`,raw`Der Winner minimiert den Abstand zwischen Eingabe und gespeichertem Vektor im Datenraum.`]]],
 ['hopfield-zyklus','hopfield','Ein Netz mit zwei Neuronen',raw`Gegeben sind $W=\begin{pmatrix}0&1\\1&0\end{pmatrix}$, Schwellen $(0,0)$ und Anfangszustand $(-1,+1)$. Ausgabe $+1$ bei net ≥ Schwelle, sonst $-1$.`, '380–390',[
 [raw`Ein Einzelupdate von Neuron 1 ergibt $(+1,+1)$.`,true,raw`Neuron 1 erhält Feld $+1$ und wird $+1$. Neuron 2 bleibt beim Einzelupdate unverändert.`],
 [raw`Ein gleichzeitiges Update beider Neuronen ergibt ebenfalls $(+1,+1)$.`,false,raw`Beim synchronen Update verwendet auch Neuron 2 den alten Zustand: Sein Feld ist $-1$.`,raw`Das synchrone Ergebnis ist $(+1,-1)$.`],
 [raw`$(+1,+1)$ ist ein stabiler Zustand.`,true,raw`Beide Felder sind $+1$; beide Neuronen behalten daher ihren Wert.`],
 [raw`Wiederholte synchrone Updates aus dem Anfangszustand bilden einen Zweierzyklus.`,true,raw`$(-1,+1)$ führt zu $(+1,-1)$ und dieser Zustand wieder zurück. Das widerspricht der asynchronen Konvergenzaussage nicht.`]]],
 ['validierung-fall','mc-grundlagen','Training wird besser, Validierung schlechter',raw`Der Trainingsfehler sinkt von $0{,}2$ auf $0{,}05$. Gleichzeitig steigt der Validierungsfehler von $0{,}25$ auf $0{,}4$.`, '220–230',[
 [raw`Dieses Muster kann Overfitting anzeigen.`,true,raw`Die Anpassung an Trainingsdaten verbessert sich, die Leistung auf zurückgehaltenen Daten verschlechtert sich.`],
 [raw`Der kleine Trainingsfehler beweist gute Leistung auf neuen Daten.`,false,raw`Die Trainingsdaten wurden zur Parameteranpassung benutzt und sind keine unabhängige Qualitätskontrolle.`,raw`Die Leistung auf neuen Daten muss getrennt geprüft werden.`],
 [raw`Early Stopping kann den früheren Stand mit besserem Validierungsfehler bewahren.`,true,raw`Validierung kann zur Wahl des Trainingszeitpunkts verwendet werden; der bessere gespeicherte Stand wird übernommen.`],
 [raw`Man sollte die Testdaten nach jedem Schritt zur Auswahl des besten Modells verwenden.`,false,raw`Dann fließen die Testdaten in die Auswahl ein und sind keine unabhängige Abschlusskontrolle mehr.`,raw`Für die laufende Auswahl dienen Validierungsdaten; Testdaten bleiben für die abschließende Beurteilung getrennt.`]]]
 ];
 const selections=[
 ['softmax-zahlen','mc-grundlagen','Softmax auf drei Klassen',raw`Für $z=(0,\ln2,0)$ wird Softmax berechnet. Wähle alle zutreffenden Aussagen. Mehrere Antworten können richtig sein.`, '164–170',[
 [raw`Die zweite Klasse hat Wahrscheinlichkeit $0{,}5$.`,true,raw`Die Exponentialwerte sind $(1,2,1)$, ihre Summe $4$. Die zweite Ausgabe ist $2/4$.`],
 [raw`Die drei Wahrscheinlichkeiten summieren sich zu $1$.`,true,raw`$(1+2+1)/4=1$. Diese Normierung gehört zu Softmax.`],
 [raw`Die erste Klasse erhält Wahrscheinlichkeit $0$, weil ihr Eingabewert $0$ ist.`,false,raw`Softmax verwendet den Exponentialwert, und $e^0=1$.`,raw`Die erste Wahrscheinlichkeit ist $1/4=0{,}25$.`]]],
 ['cnn-groesse','mc-grundlagen','Eine Faltung ausrechnen',raw`Ein Bild hat $7\times7$ Pixel. Ein Filter hat Größe $3\times3$, Stride $2$, kein Padding und keine Dilatation. Wähle alle zutreffenden Aussagen.`, '262–266',[
 [raw`Die räumliche Ausgabegröße ist $3\times3$.`,true,raw`Pro Richtung: $\lfloor(7-3)/2\rfloor+1=3$.`],
 [raw`Derselbe Filter verwendet an allen Bildpositionen dieselben Gewichte.`,true,raw`Die Gewichte werden räumlich geteilt; sie sind nicht für jede Position neu zu wählen.`],
 [raw`ReLU verändert jede negative Zahl zu ihrem positiven Betrag.`,false,raw`ReLU ist $\max(0,z)$ und bildet negative Zahlen auf $0$ ab.`,raw`ReLU liefert bei negativen Eingaben $0$, nicht den Betrag.`]]],
 ['bce-ziel','mc-grundlagen','Die passende Fehlerformel wählen',raw`Das Ziel einer binären Klassifikation ist $t=0$. Das Netz sagt $p=0{,}8$ für Klasse 1 voraus. Wähle alle zutreffenden Aussagen zur binären Kreuzentropie.`, '152–162',[
 [raw`Der Verlust ist $-\ln(0{,}2)$.`,true,raw`Bei Ziel $0$ zählt die vorhergesagte Wahrscheinlichkeit $1-p=0{,}2$ der richtigen Klasse.`],
 [raw`Eine Senkung von $p$ auf $0{,}1$ würde den Verlust verringern.`,true,raw`Die Wahrscheinlichkeit der richtigen Klasse steigt auf $0{,}9$; $-\ln0{,}9$ ist kleiner als $-\ln0{,}2$.`],
 [raw`Der Verlust ist $-\ln(0{,}8)$, unabhängig vom Ziel.`,false,raw`Die Ziellabel bestimmen, welche Klassenwahrscheinlichkeit in den Logarithmus eingeht.`,raw`$-\ln p$ gehört zum Ziel $1$; bei Ziel $0$ gilt $-\ln(1-p)$.`]]],
 ['rbm-fuzzy-fall','mc-grundlagen','Zwei ergänzende Begriffe anwenden',raw`Eine RBM hat drei sichtbare und zwei verdeckte Neuronen. Unabhängig davon hat ein Wert in einem Fuzzy-Modell Zugehörigkeitsgrad $0{,}7$ zu „warm“. Wähle alle zutreffenden Aussagen.`, '410–433, 458–497',[
 [raw`Bei der RBM sind höchstens sechs Verbindungen zwischen den beiden Gruppen möglich.`,true,raw`Jedes der drei sichtbaren Neuronen kann mit jedem der zwei verdeckten verbunden sein: $3\cdot2=6$.`],
 [raw`Die zwei verdeckten Neuronen dürfen im RBM-Standardmodell direkt miteinander verbunden sein.`,false,raw`Die Einschränkung betrifft Verbindungen innerhalb beider Gruppen.`,raw`Direkte Verbindungen gibt es nur zwischen sichtbarer und verdeckter Gruppe.`],
 [raw`Der Grad $0{,}7$ allein beweist nicht eine Wahrscheinlichkeit von $70\%$.`,true,raw`Zugehörigkeitsgrad und Ereigniswahrscheinlichkeit sind unterschiedliche Begriffe. Eine zusätzliche probabilistische Modellierung wäre nötig.`]]]
 ];
 function make(row,type){const [id,topic,title,stem,pages,opts]=row;return {id,type,topic,title,stem,provenance:'variant',source:'Eigene Anwendungsvariante · Folien '+pages,officialScore:false,options:opts.map(([text,correct,explanation,correction],i)=>({id:id+'-o'+i,text,correct,explanation,correction:correction||'',topic,source:'Folien '+pages}))};}
 const all=[...singles,...blocks,...scenarios.map(r=>make(r,'block')),...selections.map(r=>make(r,'select'))];
 const get=id=>all.find(q=>q.id===id);
 const options=q=>q.type==='single'?[q]:q.options;
 const grade=(q,answers)=>{const opts=options(q),n=opts.filter(o=>['true','false'].includes(answers[o.id])&&(answers[o.id]==='true')===o.correct).length;return {correct:n,total:opts.length,all:n===opts.length,score:q.officialScore?Math.max(0,opts.reduce((s,o)=>s+(answers[o.id]==='skip'||!answers[o.id]?0:(answers[o.id]==='true')===o.correct?1:-1),0)):null};};
 root.NNQuestions={all,singles,blocks,get,options,grade};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NNQuestions;
})(typeof globalThis!=='undefined'?globalThis:this);
