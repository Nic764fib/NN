# ANN & Deep Learning – Prüfungsvorbereitung

[Lernplattform öffnen](https://nic764fib.github.io/NN/)

Deutschsprachige Lernplattform zur bereitgestellten Borgelt-Vorlesung und zur Aufgabenübersicht vom 10. Juli 2024. Schwerpunkt: Regression und Klassifikation; Arbeitsplan bis 28. September 2026.

## Lernen und üben

- Regression: Fehlerquadrate, Normalgleichungen, Polynome, mehrere Eingaben, Logit und Gradientenschritte.
- Klassifikation: Entscheidungsgrenzen, Wahrscheinlichkeiten, Likelihood, BCE und Softmax.
- TLU, MLP/RBF-Approximation, Backpropagation, LVQ/SOM, Hopfield und CNN mit Erklärungen, Rechenwegen und interaktiven Darstellungen.
- Modellwahl, Optimierer sowie ergänzende Folientheorie zu Autoencodern, EM, Boltzmann-, rekurrenten und Neuro-Fuzzy-Netzen.
- 15 Aufgabenarten mit reproduzierbaren Zahlenvarianten, gestuften Hinweisen, Zahlenkontrolle und vollständigen Lösungen.
- 90 MC-Trainingsaussagen in 18 Themenblöcken, mit Begründungen und Folienverweisen; 33 Lernkarten zur eigenen Wiedergabe.
- Drei Klausurmodi: Zahlen der Aufgabenübersicht 2024, neue Zahlen derselben Aufgabenfamilien oder ein Durchlauf mit Regression/Klassifikation. Fünf Rechenaufgaben plus 30 MC-Aussagen, 120 Minuten, Wiederaufnahme nach Neuladen.
- Notizen und Lernstand im eigenen Browser; Export und Import als JSON.

## Interaktiv verstehen

Auf der Startseite führt „Mit Veränderungen verstehen“ direkt zu zwölf angeleiteten Experimenten. Jedes nennt seinen Lernzweck, einen konkreten Versuch, die Erklärung der aktuellen Werte und eine Verständnisfrage mit begründetem Feedback:

- Regressionsgerade, einzelne Residuen, Optimum und Gradientenschritt.
- Klassifikationsgrenze und Wahrscheinlichkeit bei gemeinsam skalierten Gewichten.
- BCE und quadratischer Fehler mit getrennten Gradientenschritten.
- Softmax mit drei Klassen und gemeinsamer Logit-Verschiebung.
- TLU: Punkt, Schwellen und Signalweg durch die Originalgeometrie.
- RBF: radiale Grundfläche und einzeln abschaltbare Abzüge der Originalaufgabe.
- Funktionsapproximation: Beitrag jedes Hidden-Neurons bei MLP-Stufen und RBF-Dreiecken.
- LVQ: Online-Updates, Klassen, Reihenfolge, Lernrate und Rückwärtsschritt.
- SOM: altes/neues Gitter und vollständige Rechnung eines ausgewählten Nachbarneurons.
- Hopfield: Einzelupdates, Energie, Verlauf und synchroner Vergleich mit Zyklus.
- Backpropagation: Vorwärtspass, beide Fehlerfaktoren und gemeinsames Parameterupdate.
- c-Means: Zuordnung und Schwerpunktbildung als getrennte Schritte.

Die vorhandene CNN-Darstellung enthält zusätzlich eine Anleitung zum Vergleich von Fenster, Stride und Pooling. Die Experimente vertiefen vorhandene Aufgaben und Folien; veränderte Parameter und eigene Zahlenbeispiele sind gekennzeichnet.

Die Rechenaufgaben werden anhand von Teilkriterien selbst bewertet; MC wird automatisch ausgewertet. Die Aufteilung von je 14 Punkten pro Rechenaufgabe ist ein Trainingsschema. MC-Formulierungen sind rekonstruierte beziehungsweise eigene Trainingsfragen. Keine Bestehens- oder Notengarantie.

## Quellen

Fachliche Grundlage sind `nn(1).pdf` (512 Folien) und `ANN_10_07_2024.pdf` (vierseitige Aufgabenübersicht), die für die Überarbeitung lokal bereitgestellt wurden. Folienverweise beziehen sich auf diese Fassung. Die Quelldokumente werden nicht neu im Repository veröffentlicht. Eine [öffentliche Fassung beim Autor](https://borgelt.net/slides/nn.pdf) kann abweichend nummeriert sein.

[Arbeitsauftrag](ARBEITSAUFTRAG.md) · [Prüfbericht](VERIFICATION.md)

## Lokal öffnen und prüfen

Statische Website ohne Build-Schritt oder Backend. Zum lokalen Testen im Projektordner:

```sh
python -m http.server 8765
node tests/verify.js
node tests/labs.test.js
```

Dann `http://localhost:8765` öffnen. Für die optionale Prüfung sämtlicher TeX-Formeln `KATEX_PATH` auf eine lokale KaTeX-0.16.9-JavaScript-Datei setzen. Die Website lädt KaTeX einschließlich Schriften von jsDelivr; dafür wird Internet benötigt.

Inhalte liegen in `course.js`, `theory-extra.js`, `original-exam.js` und `question-bank.js`. `corrections.js` ersetzt gezielt die überarbeiteten Abschnitte und Alteinträge beim Start. `practice.js` enthält die gemeinsamen Berechnungen für Trainer und Klausur. `lab-math.js` berechnet die Lernexperimente; `labs.js`, `labs-core.js` und `labs.css` stellen ihre Bedienung und Erklärungen bereit. `app.js` enthält Routing, Speicherung und den CNN-Simulator.

Die bestehende Veröffentlichung erfolgt über GitHub Pages. Die mitexportierte `.openai/hosting.json` wird dafür nicht verwendet.
