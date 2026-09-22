# Prüfung des Klausur-Umbaus

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
- 15 bisherige Hauptrouten erreichen sinnvolle neue Inhalte. Hauptnavigation besteht aus drei Bereichen.
- MC: erste Antwort nach Feedback gesperrt, Wiederaufnahme, 30 richtige Antworten ergeben 30/30.
- Gesamtdurchlauf: fünf vollständige Aufgabenpakete, 30 MC-Aussagen, Notizen gespeichert, Lösungen erst nach Vergleich.
- Bestehender Altstand bleibt unter seinem ursprünglichen Schlüssel unverändert. Export/Import-Rundlauf mit alter Notiz und neuen Eingaben. Fehlerhafte verschachtelte Importdaten werden ohne Zustandsänderung abgewiesen; der Stand vor erfolgreichem Import bleibt gesichert.
- Ein neuer selbstständiger Transferdurchlauf wird genau einmal als Verlaufseintrag gespeichert. Hopfield-Auswahl hebt die passenden Übergänge hervor; Bedienung per Tastatur geprüft.

Desktop- und Mobilansichten wurden zusätzlich anhand von Screenshots visuell kontrolliert, insbesondere Startseite, eine vollständige TLU-Lösung und der Hopfield-Graph. Screenshots liegen lokal in `tmp/` und werden nicht veröffentlicht.

Die vollständige Browsersuite wurde auch gegen `https://nic764fib.github.io/NN/` erfolgreich ausgeführt (Anwendungsstand `bbb49e0`). Der Pages-Deploy lief erfolgreich durch. Der Test wartet bei Netzwerklatenz ausdrücklich auf geladene Abbildungen; die erste Live-Prüfung hatte diese Wartebedingung noch nicht berücksichtigt.

## Ergänzung: Wortlaut der MC-Vorlage

Die sieben ausformulierten Aussagen und 13 Stichworte auf Seite 4 wurden visuell geprüft und mit `tests/mcq-source.test.py` direkt gegen den Text der bereitgestellten PDF abgeglichen. Schreibweise und Groß-/Kleinschreibung bleiben erhalten; nur Druckzeilenumbrüche werden entfernt. Mehrdeutiges „replaced“ wird im Erklärungstext als Lesart erläutert und im Zitat nicht umgeschrieben.

`tests/mcq-original.browser.mjs` prüft bei Desktop- und Mobilbreite: alle sieben Wortlaute zuerst einmal trotz früherem Lernstand, keine Wiederholung vor vollständiger Abdeckung, Antwortsperre, Wiederaufnahme, Fortschritt 7/7, alle 13 Stichworte, unveränderte 30er-Trainingsblöcke sowie Export und Import. Die neuen Wortlaute liegen getrennt von den bisherigen Formulierungsindizes; gespeicherte Blockantworten behalten deshalb ihre Bedeutung.

## Grenzen der Prüfung

Die Kontrollen belegen die geprüften Inhalte und Funktionen. Die kommende Klausur ist unbekannt; weder vollständige Stoffabdeckung noch eine bestimmte Note folgt daraus. Zeichnungen und freie Begründungen benötigen weiterhin den eigenen Vergleich mit den Kriterien. Die Browserprüfung benutzt getrennte Testprofile und verändert keinen persönlichen Lernstand im normalen Browser.
