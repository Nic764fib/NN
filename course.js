'use strict';
// Fachliche Grundlage: die im Arbeitsauftrag genannten Borgelt-Folien.
const courseModules = [
  {
    id: 'regression', title: 'Regression', source: 'Folien 72, 106–138',
    intro: 'Aus beobachteten Zahlenpaaren eine Funktion bestimmen. Zuerst die Fehlerfunktion aufstellen, dann ihre Parameter berechnen und das Ergebnis prüfen.',
    goals: ['Eine Regressionsgerade per Hand bestimmen.', 'Normalgleichungen für Polynome und mehrere Eingaben aufstellen.', 'Logit-Transformation und Gradientenabstieg unterscheiden.'],
    sections: [
      { id: 'grundlagen', title: 'Begriff & Fehler', source: 'Folien 72, 107–111', html: String.raw`
        <h2>Was wird vorhergesagt?</h2><p>Bei einer Regression ist die Zielgröße numerisch. Gegeben sind Daten $(x_i,y_i)$ und eine Modellfamilie, etwa $g(x)=a+bx$. Gesucht sind die Parameter $a,b$. Das ist eine andere Aufgabe als in Aufgabe 3 von 2024: Dort ist die Funktion bereits bekannt und soll mit einem Netz dargestellt werden.</p>
        <p>Das Residuum ist $r_i=g(x_i)-y_i$. Die Methode der kleinsten Quadrate minimiert</p>
        $$F(a,b)=\sum_{i=1}^{n}(a+bx_i-y_i)^2.$$
        <p>Positive und negative Abweichungen können sich nach dem Quadrieren nicht aufheben. Große Abweichungen gehen stärker ein. Der mittlere quadratische Fehler ist $F/n$; er hat dieselben Minimierer, aber einen anders skalierten Gradienten.</p>
        <h2>Vom Fehler zu den Normalgleichungen</h2>
        $$\frac{\partial F}{\partial a}=2\sum_i(a+bx_i-y_i)=0,\qquad \frac{\partial F}{\partial b}=2\sum_i x_i(a+bx_i-y_i)=0.$$
        $$na+b\sum_i x_i=\sum_i y_i,\qquad a\sum_i x_i+b\sum_i x_i^2=\sum_i x_i y_i.$$
        <p>Die Fehlerfunktion ist quadratisch und konvex. Sind nicht alle $x_i$ gleich, ist die Lösung eindeutig. Sind alle $x_i=c$, ist nur der Wert $a+bc$ bestimmbar; Steigung und Achsenabschnitt sind nicht einzeln eindeutig.</p>
        <div class="mistake"><strong>Typischer Fehler:</strong> $\sum x_i^2$ ist nicht $(\sum x_i)^2$. Außerdem gehört der Achsenabschnitt $a$ zum Modell, solange die Aufgabenstellung keine Gerade durch den Ursprung verlangt.</div>
        <details><summary>Selbstkontrolle: Warum reicht „Gradient gleich null“ hier?</summary><p>Die Hesse-Matrix ist $2X^\top X$. Für jeden Vektor $v$ gilt $v^\top X^\top Xv=\|Xv\|^2\ge0$. Ein stationärer Punkt ist daher ein globaler Minimierer. Bei vollem Spaltenrang ist der Ausdruck für $v\ne0$ positiv und der Minimierer eindeutig.</p></details>` },
      { id: 'gerade', title: 'Gerade berechnen', source: 'Folien 109–112 · eigenes Zahlenbeispiel', html: String.raw`
        <h2>Beispiel: $(0,1),(1,2),(2,2)$</h2>
        <ol><li>Modell festlegen: $g(x)=a+bx$.</li><li>Hilfstabelle mit $x,y,x^2,xy$ anlegen.</li><li>Die beiden Normalgleichungen lösen.</li><li>Vorhersagen, Residuen und Fehler berechnen.</li></ol>
        <div class="table-scroll"><table><thead><tr><th>$x$</th><th>$y$</th><th>$x^2$</th><th>$xy$</th></tr></thead><tbody><tr><td>0</td><td>1</td><td>0</td><td>0</td></tr><tr><td>1</td><td>2</td><td>1</td><td>2</td></tr><tr><td>2</td><td>2</td><td>4</td><td>4</td></tr><tr><th>3</th><th>5</th><th>5</th><th>6</th></tr></tbody></table></div>
        $$3a+3b=5,\qquad 3a+5b=6.$$
        <p>Subtraktion ergibt $2b=1$. Somit $b=1/2$ und $a=7/6$.</p>
        $$\boxed{g(x)=\frac76+\frac12x}.$$
        <p>Die Vorhersagen sind $(7/6,10/6,13/6)$, die Residuen $(1/6,-1/3,1/6)$. Damit</p>
        $$F=\frac1{36}+\frac19+\frac1{36}=\frac16,\qquad \mathrm{MSE}=\frac1{18}.$$
        <p><strong>Kontrolle:</strong> $\sum r_i=0$ und $\sum x_i r_i=0$. Das sind die beiden Normalgleichungen in Residuenform.</p>
        <h2>Grafisch prüfen</h2><p>Verschiebe die Gerade. Die senkrechten Strecken zeigen die Residuen; angezeigt wird die Summe ihrer Quadrate.</p><div id="regression-lab" class="practice-card"></div>
        <p><a class="button-link" href="#/aufgaben" data-tab="aufgaben">Neue Regressionsaufgabe rechnen</a></p>` },
      { id: 'matrix', title: 'Polynome & mehrere Eingaben', source: 'Folien 113–119 · eigene Zahlenbeispiele', html: String.raw`
        <h2>Ein Schema für alle linearen Parameter</h2><p>„Linear“ bezieht sich hier auf die unbekannten Koeffizienten. Auch $g(x)=a_0+a_1x+a_2x^2$ ist linear in $a_0,a_1,a_2$.</p>
        $$F(\boldsymbol a)=\|X\boldsymbol a-\boldsymbol y\|^2,\quad \nabla F=2X^\top(X\boldsymbol a-\boldsymbol y),\quad X^\top X\boldsymbol a=X^\top\boldsymbol y.$$
        <p>Für ein Polynom enthält Zeile $i$ die Werte $(1,x_i,x_i^2,\ldots,x_i^m)$. Für eine Ebene $z=a_0+a_1x+a_2y$ lautet sie $(1,x_i,y_i)$. Jede Zeile ist ein Datenpunkt, jede Spalte eine Modellfunktion.</p>
        <h2>Quadratisches Beispiel</h2><p>Daten: $(-1,2),(0,1),(1,4)$; Modell $a_0+a_1x+a_2x^2$.</p>
        $$X=\begin{pmatrix}1&-1&1\\1&0&0\\1&1&1\end{pmatrix},\quad X^\top X=\begin{pmatrix}3&0&2\\0&2&0\\2&0&2\end{pmatrix},\quad X^\top y=\begin{pmatrix}7\\2\\6\end{pmatrix}.$$
        <p>Die Gleichungen ergeben $a_1=1$, $a_0+a_2=3$ und $3a_0+2a_2=7$. Daher $(a_0,a_1,a_2)=(1,1,2)$. Hier werden die drei Punkte exakt getroffen. Bei mehr Datenpunkten muss das nicht möglich sein.</p>
        <h2>Multivariates Beispiel</h2><p>Für $(x,y,z)=(0,0,1),(1,0,3),(0,1,4),(1,1,6)$ wird</p>
        $$X=\begin{pmatrix}1&0&0\\1&1&0\\1&0&1\\1&1&1\end{pmatrix},\quad X^\top X=\begin{pmatrix}4&2&2\\2&2&1\\2&1&2\end{pmatrix},\quad X^\top z=\begin{pmatrix}14\\9\\10\end{pmatrix}.$$
        <p>Die Lösung ist $z=1+2x+3y$. Einsetzen aller vier Punkte bestätigt Fehler null.</p>
        <div class="mistake"><strong>Voraussetzung der Inversenformel:</strong> $\boldsymbol a=(X^\top X)^{-1}X^\top y$ gilt nur, wenn $X$ vollen Spaltenrang besitzt. „Mehr Zeilen als Spalten“ allein genügt nicht. Bei abhängigen Spalten ist die Inverse nicht definiert.</div>
        <details><summary>Verbindung zu RBF-Netzen</summary><p>Bei festen Zentren und Breiten sind die Ausgaben der RBF-Neuronen bekannte Modellfunktionen. Zeile $i$ der Designmatrix enthält deren Werte am Trainingspunkt $x_i$ (und gegebenenfalls eine Eins für den Bias). Die linearen Ausgabegewichte lassen sich dann als Least-Squares-Problem bestimmen. Die Zentren und Breiten sind damit noch nicht optimiert. Siehe Folien 300–314.</p></details>` },
      { id: 'logistisch', title: 'Logistische Regression', source: 'Folien 120–138 · eigenes Zahlenbeispiel', html: String.raw`
        <h2>Eine beschränkte Zielgröße modellieren</h2><p>Die logistische Funktion $f(z)=1/(1+e^{-z})$ bildet reelle Zahlen auf $(0,1)$ ab. Mit $Y>0$ beschreibt $Yf(a_0+a_1x)$ Werte zwischen $0$ und $Y$.</p>
        <p>Für Daten mit $0&lt;y_i&lt;Y$ kann man die Zielwerte transformieren:</p>
        $$z_i=\ln\frac{y_i}{Y-y_i},\qquad z_i\approx a_0+a_1x_i.$$
        <p>Danach wird eine lineare Regression von $z_i$ auf $x_i$ gerechnet und das Ergebnis zurücktransformiert. Beispiel: $Y=1$, $(x,y)=(0,1/2),(1,3/4)$. Die Logits sind $0$ und $\ln3$. Somit $a_0=0$, $a_1=\ln3$ und $g(2)=1/(1+e^{-2\ln3})=9/10$.</p>
        <div class="mistake">Die transformierte Regression minimiert Fehler im Logit-Raum. Sie minimiert im Allgemeinen <strong>nicht</strong> die ursprünglichen quadratischen Fehler in $y$. Für $y=0$ oder $y=Y$ ist der Logit nicht endlich.</div>
        <h2>Direkt im ursprünglichen Raum optimieren</h2>
        $$F(\boldsymbol a)=\sum_i(y_i-p_i)^2,\qquad p_i=f(\boldsymbol a^\top x_i^*),\quad x_i^*=(1,x_{i1},\ldots,x_{im})^\top.$$
        $$f'(z)=f(z)(1-f(z)),\qquad \nabla F=-2\sum_i(y_i-p_i)p_i(1-p_i)x_i^*.$$
        <p>Mit Borgelts Konvention $a_{t+1}=a_t-\eta\nabla F/2$ folgt</p>
        $$a_{t+1}=a_t+\eta\sum_i(y_i-p_i)p_i(1-p_i)x_i^*.$$
        <h2>Ein Update vollständig</h2><p>Ein Punkt: $x=2$, Ziel $y=0.8$, Start $a=(0,0)$, $\eta=0.1$. Dann $p=0.5$, $y-p=0.3$, $p(1-p)=0.25$.</p>
        $$\Delta a=0.1\cdot0.3\cdot0.25\binom12=\binom{0.0075}{0.015},\qquad a_{neu}=(0.0075,0.015).$$
        <p>Die neue Netzeingabe beträgt $0.0375$, also $p_{neu}\approx0.5094$. Der vorhergesagte Wert bewegt sich zum Ziel hin.</p>
        <details><summary>Selbstkontrolle: Wann ist es Klassifikation?</summary><p>Wenn das Ziel eine Klasse ist, etwa $y\in\{0,1\}$, und der logistische Wert als Klassenwahrscheinlichkeit interpretiert wird. Dafür behandeln die Folien anschließend Maximum Likelihood und Kreuzentropie. Das quadratische Fehlermaß und diese Zielfunktionen haben unterschiedliche Gradienten.</p></details>` }
    ]
  },
  {
    id:'klassifikation', title:'Klassifikation', source:'Folien 17–35, 73–78, 139–170',
    intro:'Eine Klasse vorhersagen und die zugehörige Wahrscheinlichkeit berechnen. Trenne stets Modellwert, Entscheidungsregel und Trainingsziel.',
    goals:['Eine Entscheidungsgrenze aus Gewichten und Bias herleiten.','Binäre und mehrklassige Wahrscheinlichkeiten berechnen.','Kreuzentropie und einen Gradienten-Schritt ausrechnen.'],
    sections:[
      {id:'grundlagen',title:'Entscheidung & Wahrscheinlichkeit',source:'Folien 17–35, 73–74, 139–140',html:String.raw`
        <h2>Klassen sind keine Messwerte</h2><p>Bei zwei Klassen codieren wir $c_0$ mit $0$ und $c_1$ mit $1$. Eine TLU trifft direkt eine harte Entscheidung: $w^\top x\ge\theta$ bedeutet Klasse 1. Ihre Ausgabe ist keine abgestufte Wahrscheinlichkeit.</p>
        <p>Ein logistisches Modell berechnet zunächst $z=a_0+a^\top x$ und daraus</p>
        $$p_1(x)=\frac1{1+e^{-z}},\qquad p_0(x)=1-p_1(x).$$
        <p>Bei Entscheidungsschwelle $1/2$ gilt: Klasse 1 genau dann, wenn $z\ge0$. Die Entscheidungsgrenze ist die Hyperebene $a_0+a^\top x=0$. In der TLU-Schreibweise entspricht $a_0$ dem negativen Schwellenwert $-\theta$.</p>
        <h2>Beispiel in zwei Dimensionen</h2><p>$z=-3+2x_1-x_2$. Für $(x_1,x_2)=(2,0)$ ist $z=1$, $p_1\approx0.7311$ und die Entscheidung Klasse 1. Die Grenze lautet $x_2=2x_1-3$. Für $(0,0)$ ist $z=-3$ und die Entscheidung Klasse 0.</p>
        <div class="mistake">Die Richtung der Ungleichung mit einem Testpunkt prüfen. Die Gerade allein sagt noch nicht, welche Seite zu Klasse 1 gehört.</div>
        <h2>Trennbarkeit</h2><p>Eine einzelne TLU trennt durch eine Hyperebene. XOR ist nicht linear separierbar. Für endliche Punktmengen gilt: Strikte lineare Trennbarkeit entspricht disjunkten konvexen Hüllen. Verdeckte Schichten erlauben zusammengesetzte, nichtlineare Entscheidungsgebiete.</p>
        <p><a class="button-link" href="#/task1" data-tab="task1">Polygon mit mehreren TLUs konstruieren</a></p>
        <div id="classification-lab" class="practice-card"></div>`},
      {id:'likelihood',title:'Likelihood & Kreuzentropie',source:'Folien 150–162 · eigenes Zahlenbeispiel',html:String.raw`
        <h2>Welche Parameter erklären die beobachteten Klassen?</h2><p>Für ein Beispiel mit Ziel $y_i$ und vorhergesagter Wahrscheinlichkeit $p_i$ ist die Wahrscheinlichkeit des beobachteten Labels $p_i^{y_i}(1-p_i)^{1-y_i}$. Für die Daten maximieren wir</p>
        $$L(a)=\prod_i p_i^{y_i}(1-p_i)^{1-y_i},\qquad \ell(a)=\ln L(a)=\sum_i[y_i\ln p_i+(1-y_i)\ln(1-p_i)].$$
        <p>Weil der Logarithmus streng monoton wächst, haben $L$ und $\ell$ dieselben Maximierer. Das negative Vorzeichen macht daraus ein Minimierungsproblem:</p>
        $$\mathrm{BCE}=-\sum_i[y_i\ln p_i+(1-y_i)\ln(1-p_i)].$$
        <p>Hier benutzen wir natürliche Logarithmen, passend zur Log-Likelihood auf Folie 162. Die allgemeine Kreuzentropie in den Folien verwendet $\log_2$. Umrechnung: $\mathrm{BCE}_{2}=\mathrm{BCE}_{\ln}/\ln2$. Die optimale Parameterwahl bleibt gleich, der Zahlenwert und Gradient ändern sich um diesen Faktor.</p>
        <h2>Zahlenbeispiel</h2><p>Ziele $(1,0)$, vorhergesagte Wahrscheinlichkeiten für Klasse 1: $(0.8,0.3)$.</p>
        $$L=0.8\cdot(1-0.3)=0.56,\quad \mathrm{BCE}=-\ln(0.56)\approx0.5798.$$
        <p>Die mittlere BCE beträgt $0.2899$. Ein falsches, sehr sicheres Urteil wird stark bestraft: Bei $y=1$ und $p=0.01$ ist der Beitrag $-\ln0.01\approx4.6052$.</p>
        <h2>Ein Lernschritt</h2>
        $$\nabla\ell=\sum_i(y_i-p_i)x_i^*,\qquad a_{neu}=a+\eta\nabla\ell.$$
        <p>Für $x=2,y=1,a=(0,0),\eta=0.1$ ist $p=1/2$. Also $\Delta a=0.1(1-1/2)(1,2)=(0.05,0.1)$. Mit dem neuen $z=0.25$ wird $p\approx0.5622$.</p>
        <div class="mistake"><strong>Vergleiche die Zielfunktion:</strong> Beim quadratischen Fehler und logistischer Aktivierung erscheint zusätzlich $p(1-p)$. Beim Log-Likelihood-Gradienten fällt dieser Faktor weg. Maximieren bedeutet Gradientenaszendenz; negative Log-Likelihood minimieren bedeutet Gradientenabstieg.</div>
        <h2>Warum können die Parameter weiter wachsen?</h2><p>Bei strikt linear separierbaren Daten kann die logistische Funktion immer steiler werden. Für endliche Parameter sind die Wahrscheinlichkeiten nie genau 0 oder 1; die ideale harte Trennung wird nur im Grenzfall erreicht. Kleine Klassifikationsfehler bedeuten daher nicht automatisch, dass endliche Parameter konvergiert sind.</p>`},
      {id:'mehrklassen',title:'Softmax & mehrere Klassen',source:'Folien 73–78, 163–170 · eigenes Zahlenbeispiel',html:String.raw`
        <h2>Eine Ausgabe pro Klasse</h2><p>Bei $K$ sich gegenseitig ausschließenden Klassen wird das Ziel als One-Hot-Vektor codiert: nur die tatsächliche Klasse erhält 1. Die reellen Aktivierungen $z_1,\ldots,z_K$ werden gemeinsam normalisiert:</p>
        $$p_k=\frac{e^{z_k}}{\sum_{j=1}^{K}e^{z_j}}.$$
        <p>Alle $p_k$ sind positiv und summieren sich zu 1. Die Entscheidung ist die Klasse mit dem größten $p_k$; das ist zugleich die Klasse mit dem größten $z_k$. Gleiche Maxima benötigen eine festgelegte Gleichstandsregel.</p>
        <h2>Beispiel ohne komplizierte Exponentialwerte</h2><p>Für $z=(0,\ln2,\ln3)$ gilt $e^z=(1,2,3)$.</p>
        $$p=\left(\frac16,\frac13,\frac12\right).$$
        <p>Vorhergesagt wird Klasse 3. Ist die wahre Klasse 2, so ist $y=(0,1,0)$ und die Kreuzentropie</p>
        $$H=-\sum_k y_k\log_2p_k=-\log_2(1/3)=\log_2 3\approx1.5850.$$
        <p>Mit natürlichem Logarithmus wäre der Wert $\ln3\approx1.0986$. Die Wahrscheinlichkeit der <em>wahren</em> Klasse steht im Logarithmus, nicht automatisch die größte Wahrscheinlichkeit.</p>
        <h2>Zwei Abgrenzungen</h2><ul><li>Unabhängige Sigmoid-Ausgaben summieren sich im Allgemeinen nicht zu 1. Softmax koppelt die Ausgaben.</li><li>Softmax ist eine glatte Wahrscheinlichkeitsausgabe; Argmax liefert nur den Index der gewählten Klasse. Borgelt nennt Softmax deshalb auch Softargmax.</li></ul>
        <details><summary>Rechenkontrolle: Zu allen Aktivierungen dieselbe Zahl addieren</summary><p>Für jede Konstante $c$ ist $e^{z_k+c}/\sum_j e^{z_j+c}=e^{z_k}/\sum_j e^{z_j}$. Die Wahrscheinlichkeiten bleiben unverändert. Zum stabilen Rechnen kann man deshalb das Maximum der Aktivierungen vor dem Exponenzieren abziehen.</p></details>
        <p><a class="button-link" href="#/aufgaben" data-tab="aufgaben">Klassifikation selbst rechnen</a></p>`}
    ]
  },
  {
    id:'modellwahl', title:'Modellwahl & Generalisierung', source:'Folien 218–230, 246–247',
    intro:'Ein kleiner Trainingsfehler reicht nicht. Entscheidend ist, ob das gelernte Modell auch neue Beispiele sinnvoll vorhersagt.',
    goals:['Underfitting und Overfitting aus Fehlerwerten erkennen.','Training, Validierung und Hyperparameter unterscheiden.','Kreuzvalidierung und Early Stopping erklären.'],
    sections:[
      {id:'grundlagen',title:'Kapazität & Fehler',source:'Folien 218–224',html:String.raw`
        <h2>Wie viele verdeckte Neuronen?</h2><p>Der universelle Approximationssatz ist ein Existenzsatz: Ein genügend großes Netz kann die Funktion hinreichend genau darstellen. Er gibt weder die passende Größe noch einen erfolgreichen Trainingslauf vor.</p>
        <p><strong>Underfitting:</strong> Das Modell kann wesentliche Strukturen nicht darstellen. Trainings- und Validierungsfehler sind hoch. <strong>Overfitting:</strong> Das Modell passt auch zufällige Besonderheiten der Trainingsdaten an. Der Trainingsfehler ist klein, während der Fehler auf anderen Daten größer wird.</p>
        <h2>Beispiel einer Modellwahl</h2><table><thead><tr><th>Hidden-Neuronen</th><th>Trainingsfehler</th><th>Validierungsfehler</th></tr></thead><tbody><tr><td>2</td><td>0.30</td><td>0.32</td></tr><tr><td>8</td><td>0.08</td><td>0.10</td></tr><tr><td>40</td><td>0.01</td><td>0.24</td></tr></tbody></table>
        <p>In diesem Beispiel wählen wir 8 Neuronen wegen des kleinsten Validierungsfehlers. 40 Neuronen gewinnen nur auf den Trainingsdaten.</p>
        <div class="mistake">„Mehr Neuronen ist immer besser“ verwechselt Darstellungsfähigkeit mit Generalisierung. Auch ein kleiner Trainingsfehler beweist nicht, dass die richtige Modellgröße gewählt wurde.</div>`},
      {id:'verfahren',title:'Validierung & Early Stopping',source:'Folien 220, 225–230, 247',html:String.raw`
        <h2>Parameter oder Hyperparameter?</h2><p>Gewichte und Schwellenwerte sind Parameter des trainierten Modells. Anzahl der Neuronen und Lernrate steuern den Lernprozess und sind Hyperparameter. Beim Vergleichen von Hyperparametern werden die Modelle auf Trainingsdaten gelernt und auf Validierungsdaten verglichen.</p>
        <h2>$k$-fache Kreuzvalidierung</h2><ol><li>Daten in $k$ möglichst gleich große Teile aufteilen.</li><li>Auf $k-1$ Teilen trainieren und auf dem ausgelassenen Teil bewerten.</li><li>Jeden Teil genau einmal auslassen.</li><li>Die $k$ Fehler mitteln und verschiedene Einstellungen vergleichen.</li><li>Das endgültige Modell mit der gewählten Einstellung auf den verfügbaren Trainingsdaten lernen.</li></ol>
        <p>Bei fünf gleich großen Folds mit Fehlern $0.1,0.2,0.1,0.3,0.1$ ergibt sich $0.16$. Die Bewertung betrifft das Modellbildungsverfahren; die fünf Durchläufe sind nicht dasselbe trainierte Netz.</p>
        <h2>Early Stopping</h2><p>Während eines Trainingslaufs regelmäßig den Validierungsfehler messen. Beginnt dieser trotz sinkendem Trainingsfehler wieder zu steigen, droht Overfitting. Eine gespeicherte Parameterkonfiguration mit minimalem Validierungsfehler kann wiederhergestellt werden. Eine Geduldsspanne vermeidet das Stoppen aufgrund einer einzelnen Schwankung.</p>
        <p>Beispiel: Validierungsfehler über vier Epochen $(0.40,0.25,0.21,0.24)$. Die beste bisherige Konfiguration ist Epoche 3. Dass der Trainingsfehler in Epoche 4 noch sinkt, ändert daran nichts.</p>
        <h2>Dropout</h2><p>Im Training werden zufällig Neuronen weggelassen. Dadurch soll das Netz weniger von einzelnen Neuronen abhängen. Folie 247 verwendet beim Ausführen alle Neuronen und skaliert die Gewichte mit dem im Training behaltenen Anteil. Diese Konvention ist bei einer Rechenaufgabe einzuhalten.</p>
        <details><summary>Selbstkontrolle: Was unterscheidet Early Stopping von weniger Neuronen?</summary><p>Early Stopping begrenzt die Dauer des Trainings bei gegebener Architektur. Weniger Neuronen reduzieren die Kapazität des Modells. Ein früh gestopptes großes Netz kann beim späteren Weitertrainieren erneut überanpassen.</p></details>`}
    ]
  }
];
