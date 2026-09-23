# Theorie und MC: vollständiger Ausbau

Auftrag: eingefügter Text vom 22.09.2026, neun Abschnitte; Ergänzung des Nutzers: gemeinsame Aufgabenstellung mit mehreren einzeln als wahr/falsch bewerteten Aussagen. Ausgangscommit `12c004a`. Analysis2b wurde nicht verändert.

## Inhalt und Herkunft

- Zehn Kapitel, 34 Abschnitte in `study-theory.js`. Zahlenbeispiele und Erklärungstext vor der allgemeinen Formel; Ergänzungen kürzer als die Rechenverfahren.
- Alle bisherigen 75 Trainingsformulierungen und sieben Originalaussagen in `study-mc.js` bleiben unverändert adressierbar.
- Zwei Originalgruppen: zwei belegte Aussagen in 6(b), fünf in 6(f). Die fehlenden Aussagen von 6(b) werden nicht erfunden. Eine deutsche Arbeitsanweisung ist als Ergänzung gekennzeichnet.
- Zwölf Übungsblöcke bündeln die bestehenden 60 Kernaussagen in ihrer jeweiligen Formulierung. Das erzeugt keine zusätzlichen eindeutigen Aussageformulierungen.
- Zehn neue Anwendungsblöcke mit jeweils vier Aussagen; vier eigene Auswahlaufgaben mit jeweils drei Optionen. Insgesamt 52 neue Aussagen/Optionen. Kein Format wird als neue Originalfrage ausgegeben.
- Der Katalog enthält daher 110 Einträge: 82 Einzelaussagen, 24 Wahr/Falsch-Blöcke (mit teilweise denselben Aussagen) und vier Auswahlaufgaben. Eindeutige Aussage-/Optionstexte: 134.

## Fachliche Quellenprüfung

Primärquellen sind die bereitgestellte `ANN_10_07_2024.pdf` und `nn(1).pdf`. Die eigenen Lösungen wurden gegen die Regeln und durch unabhängige Zahlenrechnungen geprüft; sie werden nicht als offizielle Musterlösungen bezeichnet.

| Bereich | Belegte Grundlage und Entscheidungen |
| --- | --- |
| Netze/TLU | Folien 17–35, 80: ≥ am Gleichheitsfall; Bias = negative Schwelle; Eingabeschicht mitzählen; XOR und Trennbarkeit endlicher Mengen |
| RBF/Abstände | 288–314, 332–333: drei Normen, Gauß ohne harten Radius, linearer Ausgang, getrennte Bestimmung von Zentren und Ausgangsgewichten |
| Approximation | 93–104, 294–300: affine Verkettung, TLU-Differenzgewichte, RBF-Stützwerte; universelle Approximation als Existenz unter den angegebenen Voraussetzungen |
| Optimierer | 137–196: Kettenregel mit altem Parameterstand, QuickProp-Parabel, RProp-Vorzeichen, RMSProp-Quadratmittel, Adam mit erstem und unzentriertem zweitem Moment |
| LVQ/SOM | 336/340 und 364–367: Gewinner- und Zweiprototypen-Regeln getrennt, Gitterabstand vs. Datenabstand, Updates aus dem alten Stand |
| Hopfield | 380–390: Null-Diagonale, Symmetrie, asynchrone Konvergenz mit fairer Folge, synchrone Zyklen, Energiegleichheit und feste Schwellenkonvention |
| Weitere MC | 152–170, 220–230, 253–266, 410–433, 458–497: BCE-Zielabhängigkeit, Softmax, Validierung, CNN-Größe, RBM-Verbindungen und Fuzzy-Zugehörigkeit |

Die neuen Beispiele rechnen unter anderem TLU-Randwerte, Abstände 7/5/4, RBF-Abzüge, Stützwerte 2/5/4, einen Gradienten -4, LVQ mit falscher Gewinnerklasse, SOM-Winner (9,2; 5,4) und einen synchronen Hopfield-Zweierzyklus durch. Der unabhängige Antwortschlüssel steht in `tests/learning.test.js`. Alle ursprünglichen Geometrie-, SOM-, LVQ- und Hopfield-Rechnungen werden weiterhin durch `tests/study.test.js` geprüft.

## Abgleich mit allen neun Auftragsabschnitten

| Auftrag | Umsetzung / überprüfbare Evidenz |
| --- | --- |
| 1. Bestand und Quellen | Originalwortlaut-PDF-Test; unveränderte bestehende Frage-IDs/Formindizes; unabhängige Mathematiktests für die Rechenlösungen |
| 2. Theorieeinstieg | Vier Navigationsbereiche; `study-theory.js`; Desktop-/Mobilansichten visuell gelesen; Kapitel mit Zahlen, Erklärungen, Formeln und passenden Links |
| 3. Vollständige Voraussetzungen | Alle zehn vorgegebenen Themen, 34 Abschnitte; Verweise sämtlicher MC-Konzepte und Aufgabenfamilien auf ein Kapitel; Inhaltsübersicht, Lesestellen, freiwillige Lesemarkierung |
| 4. Lesekatalog | Alle 110 Einträge mit direkt sichtbaren Antworten und Erklärungen; keine Filter; Korrektur jeder falschen Aussage; Lesen ohne Bewertung |
| 5. Navigation | Unveränderlicher abgegebener Versuch mit ID; Zurück/Weiter, direkte Wahl, eigene Wiederholungsversuche, Reload und Export/Import; alte aktive Antworten ohne erneute Zählung migriert |
| 6. Frageformate | Einzel-T/F; Originalgruppen; gemeinsame Stems mit unabhängigen T/F-Entscheidungen; vier eigene Mehrfachauswahl-Aufgaben; Prüfungsmodus mit Feedback erst nach Abgabe |
| 7. Originale und Varianten | Originale bleiben unabhängig vom früheren Konzeptfortschritt erreichbar; 52 neue Anwendungsoptionen, Quellen und Theorieverweise; keine fingierten Originale oder offizielle Wertung für eigene Auswahlfragen |
| 8. Durchgängiger Lernweg | Fragen/Aufgaben → Theorie → gleicher Bearbeitungsstand; Lesestelle und Katalogposition bleiben erhalten; fünf Original-, fünf Transfer- und sechs Reparaturpakete bleiben nutzbar |
| 9. Prüfung | `study.test.js`, `learning.test.js`, `mcq-source.test.py`, `study-browser.mjs`, `mcq-original.browser.mjs`, `learning-browser.mjs`; zusätzlich visuelle und fachliche Durchsicht |

## Bedienung und Daten

`#/theorie` öffnet den kurzen Klausurüberblick mit Links zu allen zehn Kapiteln. `#/mc` bietet genau „Alle Fragen ansehen“ und „Üben“. `#/fragen` zeigt den vollständigen Katalog samt Lösungen; `#/mc/ueben` enthält alle 110 Einträge mit Vor/Zurück. Filter, Verlaufsansichten und zusätzliche Blockauswahlen wurden entfernt. Alte MC-Unterseiten führen in den gemeinsamen Übungsbereich.

Der bestehende Speicher bleibt unter `ann_exam_focus_v1`. Neue Daten liegen ergänzend in `learning` bzw. `mcBlockHistory`; ursprüngliche Schlüssel und Formindizes bleiben erhalten. Historische Antworten, Notizen und Prüfungsblöcke bleiben im Datenexport erhalten; die vereinfachte Oberfläche bietet keine separate Blockverwaltung. Lesemarkierungen bedeuten nicht Beherrschung. Nachlesen während eines offenen Versuchs wird sichtbar als Hilfe markiert.

Es gibt weder eine verpflichtende Uhr noch Freischaltungen, eine zugesagte Bearbeitungsdauer oder eine Notenprognose.

## Abgleich mit den Rechenaufgaben am 23.09.2026

Alle zehn Kapitel wurden gegen die aktiven Original-, Transfer- und Kurzaufgaben sowie alle 45 MC-Konzepte und 52 Anwendungsoptionen gelesen. Die MC-Erklärungen decken den vorhandenen Katalog bereits ab; ihr Umfang und die stabilen Abschnitts-IDs bleiben erhalten. Die gezielten Ergänzungen in `study-theory.js` schließen Übergänge zur eigenen Rechnung:

- TLU: Die Seite von CD und ihre Zeichnung passen nun durchgehend zum verwendeten Transferbeispiel. Randtest-Gewichte und Ausgangsgewichte werden getrennt benannt; die geforderte Netzstruktur ist vollständig angegeben.
- RBF-Flächen: Zentrum aus Koordinatenmitteln, Radius als Abstand zur Rautenspitze bzw. halbe Quadratseite; danach die drei Fälle für den linearen Ausgang prüfen und die verlangten Netzparameter angeben.
- Approximation: Aus dem Neuronenbudget die Anzahl der Stellen und deren Abstand ableiten; TLU-Startwert als negative Ausgangsschwelle, Sprunggewichte, rechter Endpunkt und Neuronenzahl; RBF-Radius und Aktivierung ausdrücklich aus dem Zentrenabstand bestimmen.
- LVQ/SOM: Gesamtänderung bzw. einzelne Änderung vom neuen Vektor unterscheiden. Bei SOM kann derselbe Gitterfaktor zu verschiedenen Vektoränderungen führen.
- Hopfield: In der Nachfolgertabelle jeden möglichen Einzelupdate wieder vom Ausgangszustand der Zeile rechnen. Eine konkrete Verzweigung zeigt den Unterschied zur fortlaufenden Updatefolge.

Die gezielten Theorieänderungen bestehen `node tests/learning.test.js`. Die gemeinsame Browserprüfung des Umbaus bestätigt auch Formelsatz und Darstellung beider Bildschirmbreiten. Es gibt keine zugesagte Lesezeit und keine Garantie über unbekannte künftige Klausuraufgaben.

### Kurzer Theorieeinstieg

`NNTheory.overview` enthält zusätzlich zehn aufeinander aufbauende Einträge mit `title`, `html` und `chapter`. Der Überblick umfasst rund 1.100 Wörter einschließlich Formeln und deckt alle Rechenverfahren sowie die Themen des MC-Katalogs ab. Er ist für einen konzentrierten ersten Durchgang gedacht; die vollständigen 34 Kapitelabschnitte bleiben erhalten. Die Daten enthalten keine neue Navigation oder Übungsart und versprechen keine sichere Beherrschung nach einer festen Lesezeit.
