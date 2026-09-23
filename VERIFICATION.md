# Prüfung des Klausur-Umbaus

## Aktueller Stand: kompakte Lösungen und einfache Bedienung (23.09.2026)

- Alle 24 Rechenteilaufgaben (Originale, Transfer und kurze Übungen) enthalten zuerst eine vollständige kompakte Klausurantwort und darunter den aufklappbaren ausführlichen Rechenweg. Die Originalaufgaben, Zahlenmodelle und ausführlichen Lösungen wurden erhalten.
- Alle sieben Rezepte sind kurze nummerierte Rechenschritte. Separate Hinweise und Notizfelder sind aus Einzelaufgaben und Gesamtdurchlauf entfernt; historische Notizen bleiben exportierbar.
- Multiple Choice bietet genau zwei Einstiege. Alle 110 Katalogeinträge zeigen Antworten und Erklärungen; der gemeinsame Übungsdurchlauf erreicht ebenfalls sämtliche Einträge, ohne Filter, Verlaufsansicht oder zusätzliche Blockwahl. Originalwortlaut und Gruppierung bleiben erhalten.
- Ein Sub-Agent hat die zehn Theorie-Kapitel gegen Rechenaufgaben und MC geprüft und fehlende Übergänge ergänzt. Der neue Klausurüberblick umfasst rund 1.100 Wörter; alle 34 ausführlichen Abschnitte bleiben zugänglich.

Bestanden: `study.test.js`, `learning.test.js`, `mcq-source.test.py`, `study-browser.mjs`, `learning-browser.mjs` und `mcq-original.browser.mjs`.

Die Browserprüfungen erfassen alle 24 Rechenteilaufgaben sowie alle 110 MC-Fragen einschließlich Antwortauswertung bei 1400 und 390 Pixeln Breite, außerdem Theorieüberblick, alle zehn Kapitel, Formelsatz, Auf-/Zuklappen, numerische Eingaben, Navigation, Reload, Altstandmigration, Gesamtdurchlauf und Export/Import. Die sieben Originalaussagen und 13 Quellenstichworte stimmen mit der bereitgestellten PDF überein.

Visuell geprüft: kompakte TLU-, RBF-, MLP-, LVQ-, SOM- und Hopfield-Lösungen, MC-Einstieg und Originalblock sowie Theorieüberblick auf Desktop/Smartphone. Die LVQ-Updates stehen für schmale Ansichten als einzelne Rechenschritte statt in einer breiten Tabelle. Breite Parametertabellen und der vollständige Hopfield-Graph bleiben innerhalb ihrer Bereiche horizontal verschiebbar.

Die folgenden Abschnitte dokumentieren frühere Ausbaustände; deren entfernte Menüs und Hinweise gehören nicht mehr zur aktuellen Oberfläche.

## Aktueller Ausbau: Theorie und MC (22.09.2026)

Der unten dokumentierte frühere Umbau wurde um den vollständigen Auftrag aus [THEORIE-MC.md](THEORIE-MC.md) erweitert. Die Hauptnavigation hat jetzt **vier** Bereiche. Die früheren Rechenaufgaben und Rezepte bleiben bestehen.

Zusätzlich bestanden:

- `tests/learning.test.js`: vollständige Katalogabdeckung, stabile Original- und Formulierungs-IDs, überlieferte Gruppierung, explizite Korrekturen aller falschen Aussagen, unabhängig berechnete Zahlenbeispiele und Antwortschlüssel aller 52 neuen Optionen, Typen und Punktewertung, Validierung gespeicherter Versuche.
- `tests/learning-browser.mjs`: alle zehn Kapitel bei 1400 und 390 Pixeln; keine KaTeX-Fehler oder horizontale Seitenüberläufe; gespeicherte Lesestelle, Reload und Lesemarkierung; alle 110 Katalogeinträge und sämtliche Erklärungen; alle Filter; sieben Aussagen in zwei Originalgruppen; Lesen ohne Bewertungsänderung; stabile Zurück-/Weiter-Historie, explizite Wiederholung und alle 14 neuen Aufgaben bei beiden Breiten.
- Derselbe Browserlauf prüft Nachlesen und Rückkehr zum gleichen offenen Versuch einschließlich Antworten, Rückkehr zur Katalogposition und zu einer Aufgabennotiz, Migration eines bereits bewerteten alten Versuchs ohne zusätzliche Zählung, vollständigen Export/Import und atomare Ablehnung ungültiger neuer Verlaufsdaten.
- Frühere Prüfungsblöcke bleiben beim Start eines neuen erhalten. Der Browserlauf öffnet einen unterbrochenen archivierten Block, kontrolliert dessen ursprüngliche Antwort und gibt ihn ab, ohne den neuen offenen Block zu verändern.
- Unbeantwortetes Weitergehen erzeugt keine Bewertung und zeigt eine andere Variante; Zurück führt exakt zur vorherigen Aufgabe.

Die vorhandenen Suiten `study.test.js`, `study-browser.mjs`, `mcq-source.test.py` und `mcq-original.browser.mjs` wurden zusätzlich ausgeführt und bestanden. Damit bleiben auch alle 24 Teilaufgaben bei zwei Breiten, Quellen-PDFs, ursprünglichen mathematischen Kontrollen, alten Browserdaten und 30er-Blöcke abgedeckt.

Die Theorie wurde inhaltlich Abschnitt für Abschnitt auf Begriffseinführung, nachvollziehbare Zahlenrechnungen und fehlende Voraussetzungen gelesen. Dabei wurden insbesondere affine Abbildungen, Matrixtransposition und CNN-Dilatation erläutert. Screenshots von Theorie, MC-Block und Katalog wurden auf Desktop und Handy visuell kontrolliert. Die vollständigen neuen Zahlenbeispiele stehen neben den Formeln; lange Formeln und Tabellen scrollen innerhalb ihres Bereichs.

Die Anzahl der Katalogeinträge ist keine Anzahl verschiedener Originalfragen: 82 Einzelaussagen (75 Training + 7 Original), 24 Wahr/Falsch-Blöcke mit teilweise denselben Aussagen und vier neue Auswahlaufgaben. Die zehn neuen T/F-Anwendungen und vier Auswahlaufgaben enthalten zusammen 52 neue Aussage-/Optionstexte.

## Frühere Prüfung des Aufgabenumbaus

Stand: 22.09.2026. Ausgangspunkt: veröffentlichter Commit `b534b5a`.

## Fachliche Kontrolle

Primärquellen: `ANN_10_07_2024.pdf` und `nn(1).pdf`. Die eigenen PDF-Ausarbeitungen wurden als Vergleich, nicht als ungeprüfte Autorität verwendet.

`node tests/study.test.js` prüft unabhängig vom erzeugenden Lösungscode:

- TLU: alle 16 Hidden-Kombinationen sowie die Original- und Transfergeometrie gegen einen eigenständigen Punkt-im-Polygon-Test.
- RBF: Zielgebiete gegen geometrische Dreieckstests; Ausgabegewichte, ausgesparte Bereiche und außerhalb liegende Punkte.
- Approximation: explizit vorgerechnete Stützwerte, Differenzen, Randpunkte und lineare Interpolation zwischen Zentren.
- LVQ: explizite Endwerte für ohne Klassen, Gewinnerregel und Zweiprototypen-Regel, jeweils Original und Transfer.
- SOM: sämtliche 63 Original- und neun Transferupdates durch unabhängige Koordinaten-/Gitterrechnung.
- Hopfield: acht Zustände und 24 asynchrone Updates; explizite ursprüngliche Nachfolger sowie unabhängige Energie- und Gleichheitsprüfung für die Variante.
- Zahlenparser: Vorzeichen, Dezimalkomma, Brüche, Rundung, positive Skalierung von Halbebenen; ungültige Eingaben werden verworfen.
- MC: Struktur, vollständige Begründungen und blockweise Punktberechnung; richtige, falsche und ausgelassene Antworten.
- Lernstand: keine selbstständige Beherrschung allein durch Originalbearbeitung oder Hilfen; spätere Wiederholung und Abdeckung der fünf Familien.

Die Wahrheit der MC-Aussagen wurde zusätzlich inhaltlich anhand der angegebenen Folien geprüft. Schwerpunkte: TLU 17–35, Schichtzählung 80, Approximation 93–104, Optimierer 192–196, RBF 288–314, Metriken 332–333, LVQ 336/340, SOM 364–367 und Hopfield 380–390. Weitere Grundlagenaussagen verweisen auf ihre jeweilige Folienstelle. Strukturtests allein belegen keine fachliche Wahrheit.

## Browserprüfung

`node tests/study-browser.mjs`, Microsoft Edge mit Playwright:

- Alle 24 Teilaufgaben bei 1400×1000 und 390×844: 48 Ansichten, jeweils sämtliche Hinweise, Rezept, Lösung und Zahlenkontrolle.
- Keine KaTeX-Fehler in Aufgaben, Rezepten, sämtlichen MC-Formulierungen und erhaltenen Nachschlagetexten.
- Kein horizontaler Überlauf der Gesamtseite. Breite Tabellen und der Hopfield-Graph scrollen innerhalb ihrer Bereiche.
- Alle Originalabbildungen geladen. Alle drei bereitgestellten PDF-Links antworten mit HTTP 200.
- Eingaben, Notizen, Hilfen und Vergleichsansicht über Neuladen hinweg erhalten. Eine falsche Teilwerteingabe verhindert die Bewertung dieses Versuchs als vollständig ohne Hilfe.
- 15 bisherige Hauptrouten erreichen sinnvolle neue Inhalte. Hauptnavigation besteht aus vier Bereichen.
- MC: erste Antwort nach Feedback gesperrt, Wiederaufnahme, 30 richtige Antworten ergeben 30/30.
- Gesamtdurchlauf: fünf vollständige Aufgabenpakete, 30 MC-Aussagen, Notizen gespeichert, Lösungen erst nach Vergleich.
- Bestehender Altstand bleibt unter seinem ursprünglichen Schlüssel unverändert. Export/Import-Rundlauf mit alter Notiz und neuen Eingaben. Fehlerhafte verschachtelte Importdaten werden ohne Zustandsänderung abgewiesen; der Stand vor erfolgreichem Import bleibt gesichert.
- Ein neuer selbstständiger Transferdurchlauf wird genau einmal als Verlaufseintrag gespeichert. Hopfield-Auswahl hebt die passenden Übergänge hervor; Bedienung per Tastatur geprüft.

Desktop- und Mobilansichten wurden zusätzlich anhand von Screenshots visuell kontrolliert, insbesondere Startseite, eine vollständige TLU-Lösung und der Hopfield-Graph. Screenshots liegen lokal in `tmp/` und werden nicht veröffentlicht.

Die vollständige Browsersuite wurde auch gegen `https://nic764fib.github.io/NN/` erfolgreich ausgeführt (Anwendungsstand `bbb49e0`). Der Pages-Deploy lief erfolgreich durch. Der Test wartet bei Netzwerklatenz ausdrücklich auf geladene Abbildungen; die erste Live-Prüfung hatte diese Wartebedingung noch nicht berücksichtigt.

## Ergänzung: Wortlaut der MC-Vorlage

Die sieben ausformulierten Aussagen und 13 Stichworte auf Seite 4 wurden visuell geprüft und mit `tests/mcq-source.test.py` direkt gegen den Text der bereitgestellten PDF abgeglichen. Schreibweise und Groß-/Kleinschreibung bleiben erhalten; nur Druckzeilenumbrüche werden entfernt. Mehrdeutiges „replaced“ wird im Erklärungstext als Lesart erläutert und im Zitat nicht umgeschrieben.

`tests/mcq-original.browser.mjs` prüft bei Desktop- und Mobilbreite: alle sieben Wortlaute zuerst einmal trotz früherem Lernstand, keine Wiederholung vor vollständiger Abdeckung, Antwortsperre, Wiederaufnahme, Fortschritt 7/7, alle 13 Stichworte, unveränderte 30er-Trainingsblöcke sowie Export und Import. Die neuen Wortlaute liegen getrennt von den bisherigen Formulierungsindizes; gespeicherte Blockantworten behalten deshalb ihre Bedeutung.

## Ergänzung vom 23. September 2026: Herleitungen

TLU-Theorie, die sieben Rezepte, Hinweise und Musterlösungen wurden um die zuvor übersprungenen Rechenschritte ergänzt. Beide TLU-Flächen behalten ihre unabhängig geprüften Parameter; alle acht Kanten werden jetzt über die Geradengleichung hergeleitet. Die beiden Alternativen CD/DA werden von den Pflichttests AB/BC getrennt.

RBF-Zentren und Radien werden aus den Begrenzungen berechnet; ein Innenpunkt wird durch alle Neuronen gerechnet. Stützstellenabstände werden aus Intervall und Neuronenbudget begründet. LVQ zeigt die Differenz, ihre Skalierung und das klassenabhängige Vorzeichen vor der Ergebnistabelle. SOM zeigt Winner und Nachbar vollständig. Hopfield erklärt alle drei Einzelupdates eines Ausgangszustands vor der Übersicht. Auch die Ableitungsfaktoren der Lernbeispiele stehen im Theorietext.

Geprüft mit `tests/study.test.js`, `tests/learning.test.js`, `tests/study-browser.mjs` und `tests/learning-browser.mjs`. Die Browserprüfungen umfassen alle 48 Aufgabenansichten und alle zehn Theorie-Kapitel auf Desktop und Mobilgerät. Zusätzlich wurden die neuen TLU-Herleitungen visuell kontrolliert. Ein neuer Rendercheck erkennt verlorene LaTeX-Befehle, die JavaScript sonst zu gewöhnlichen Buchstaben macht; damit wurden auch die bisherigen Hopfield-Detailrechnungen korrigiert. Zustandsspeicherung und Aufgabenkennungen bleiben erhalten.

## Grenzen der Prüfung

Die Kontrollen belegen die geprüften Inhalte und Funktionen. Die kommende Klausur ist unbekannt; weder vollständige Stoffabdeckung noch eine bestimmte Note folgt daraus. Zeichnungen und freie Begründungen benötigen weiterhin den eigenen Vergleich mit den Kriterien. Die Browserprüfung benutzt getrennte Testprofile und verändert keinen persönlichen Lernstand im normalen Browser.
