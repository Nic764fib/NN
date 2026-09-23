# NN · Klausur lernen

[Website öffnen](https://nic764fib.github.io/NN/)

Praktische Vorbereitung anhand der Aufgabenübersicht vom 10. Juli 2024 und der bereitgestellten Vorlesungsfolien von Christian Borgelt.

## Vier Einstiege

- **Theorie:** ein kurzer Klausurüberblick, danach zehn verständliche Kapitel mit 34 Abschnitten, Zahlenbeispielen, erklärten Formeln, Zeichnungen, Inhaltsübersicht und gespeicherter Lesestelle. Direkte Verbindungen zu Aufgaben und Fragen.
- **Altklausur & Training:** fünf vollständige Originalpakete, je eine Transferaufgabe und sechs kurze Übungen zu häufigen Fehlern. Teilaufgaben sind einzeln wählbar. Ein einfaches Rezept lässt sich direkt an der Aufgabe aufklappen. Beim Lösungsvergleich steht zuerst die kompakte Klausur-Musterlösung, darunter der aufklappbare ausführliche Rechenweg. Hinweise und Notizfelder entfallen.
- **Multiple Choice:** vollständiger Lesekatalog, Einzelaussagen, Wahr/Falsch-Blöcke und eigene Auswahlfragen. Alle sieben Originalaussagen bleiben unverändert; ihre Gruppierung ist ebenfalls erhalten (TLU: zwei überlieferte Aussagen; Hopfield: fünf). 75 bisherige Trainingsformulierungen bleiben bestehen. Hinzu kommen zehn Anwendungsblöcke und vier Auswahlaufgaben mit zusammen 52 neuen Aussagen/Optionen. Jede falsche Aussage hat eine Erklärung und eine korrigierte Fassung. Genau zwei Einstiege: „Alle Fragen ansehen“ und „Üben“. Im Üben sind alle 110 Einträge ohne Filter erreichbar; Vor/Zurück und Reload erhalten die Antworten. Keine Verlaufsansicht oder zusätzliche Blockauswahl; Lesen erzeugt keine Leistungsbewertung.
- **Rechenrezepte:** sieben kurze, nummerierte Schrittfolgen mit den nötigen Formeln. Vollständige Zahlenbeispiele stehen in den zugehörigen Aufgaben. Weitere Folienthemen bleiben als Nachschlagebereich erreichbar.

Ein Gesamtdurchlauf enthält alle fünf Rechenpakete und 30 MC-Aussagen. Es gibt keine Pflichtuhr, Kapitelpflicht oder Freischaltung. Freie Rechnungen und Zeichnungen werden anhand vollständiger Kriterien selbst verglichen; einzelne Zahlen lassen sich zusätzlich prüfen. Lernstände unterscheiden Bearbeitung mit Hilfe, selbstständige Transferaufgaben und spätere Wiederholung.

Die Rechenwege führen vom Gegebenen zur Formel, zum Einsetzen und erst danach zum Ergebnis. Bei TLU werden alle vier Kanten beider Aufgaben aus ihren Eckpunkten hergeleitet: Steigung, Punktform der Geraden, gewünschte Seite, Gewichte und Schwelle. Die Ausgangslogik der eingedellten Fläche wird gesondert erklärt. Die übrigen ausführlichen Lösungen enthalten ebenfalls konkrete Zwischenrechnungen; RBF-Zentren, die Wahl der Stützstellen, LVQ-Updates und erste SOM-/Hopfield-Rechnungen stehen vor den Ergebnistabellen.

## Quellen und fachliche Entscheidungen

Die Aufgabenübersicht und die eigenen PDF-Ausarbeitungen liegen in `materials/`. Die Ausarbeitungen sind keine offiziellen Musterlösungen. Die vollständigen Vorlesungsfolien wurden lokal geprüft; die [öffentliche Fassung beim Autor](https://borgelt.net/slides/nn.pdf) kann anders nummeriert sein. Die sieben Originalformulierungen sind ausdrücklich markiert. Weitere MC-Inhalte sind eigene oder rekonstruierte Trainingsformulierungen; die 13 überlieferten Stichworte werden nicht als vollständige Originalfragen ausgegeben.

Die TLU-Konstruktion besitzt drei Schichten **einschließlich Eingabe**. Beide LVQ-Lesarten sind getrennt gerechnet. Die SOM-Gitterinterpretation wird offengelegt; alle verlangten Updates sind enthalten. RBF-Dreiecke vermeiden doppelte Randhöhen, und Hopfield berücksichtigt den Gleichheitsfall ohne falsche Behauptung strikt sinkender Energie.

Es gibt keine erfundenen Einzelpunkte für Rechenaufgaben oder Notenprognosen. Die vollständigen Fünferblöcke folgen Folie 2: +1/−1/0, mindestens 0 je Block. Eigene Auswahlformate und unvollständig überlieferte Blöcke erhalten keine angeblich offizielle Punktewertung.

## Daten und alte Links

Der aktuelle Browserstand liegt unter `ann_exam_focus_v1`. Der frühere Schlüssel `ann_borgelt_state_v2` bleibt unverändert; alte Notizen und Bewertungen sind unter **Quellen & eigene Daten** einsehbar und exportierbar. Ein Import sichert vorher den aktuellen Stand. Neue Konstruktionen werden nicht anhand alter Häkchen als beherrscht eingestuft.

Die bisherigen Hauptrouten, einschließlich `#/klausur`, `#/task1` bis `#/task6` und `#/abfragen`, führen zu passenden neuen Einstiegen. Es gibt keinen eigenständigen Satztrainer mehr.

## Lokal öffnen und prüfen

Statische Website, kein Build und kein Backend:

```sh
python -m http.server 8766
node tests/study.test.js
node tests/study-browser.mjs
python tests/mcq-source.test.py
node tests/mcq-original.browser.mjs
node tests/learning.test.js
node tests/learning-browser.mjs
```

Die Browsertests benötigen `playwright` und Microsoft Edge. Alternativ kann `PLAYWRIGHT_MODULE` eine importierbare Modul-URL nennen. `NN_TEST_URL` überschreibt die lokale Adresse. Der Wortlautvergleich benötigt Python mit `pypdf`; ein abweichender Node-Pfad kann als Argument übergeben werden. Screenshots werden in das ignorierte Verzeichnis `tmp/` geschrieben. KaTeX und Schriften kommen von jsDelivr und benötigen Internet.

## Aktive Dateien

| Datei | Inhalt |
| --- | --- |
| `study-content.js` | Aufgaben, Rezepte und ausführliche Lösungen |
| `study-exam-solutions.js` | Kompakte vollständige Klausurantworten für alle 24 Teilaufgaben |
| `study-core.js` | Berechnungen, Zahlenprüfung und Wiederholungsauswahl |
| `study-visual.js` | Flächen, Netze, Näherungsgraphen und Hopfield-Graph |
| `study-mc.js` | Aussagen, Formulierungsvarianten und Wiederholung |
| `study-theory.js` | Zehn aufeinander aufbauende Kapitel mit Zahlenbeispielen und Quellen |
| `study-questions.js` | Vollständiger Katalog, ursprüngliche Gruppierung, neue Anwendungsfragen und korrigierte Aussagen |
| `study-learning.js` | Theorieüberblick, Kapitel, vollständiger Lesekatalog und gemeinsamer Übungsdurchlauf |
| `study-app.js` | Navigation, Bedienung, Speicherung, Import/Export |
| `study-reference.js` | Erhaltene ergänzende Folienerklärungen |
| `study.css` | Desktop-, Mobil- und Druckdarstellung |

`index.html` lädt ausschließlich diese neue Anwendung. Die älteren JS-/CSS-Dateien bleiben als bisheriger Quellstand erhalten und werden nicht mehr ausgeführt. Entsprechend gelten für den Umbau die `study-*`-Tests; die älteren Tests gehören zur vorherigen Anwendung.

[Früherer Umbau](UMBAU.md) · [Theorie- und MC-Erweiterung](THEORIE-MC.md) · [Prüfbericht](VERIFICATION.md)

Veröffentlichung über GitHub Pages. Die frühere `.openai/hosting.json` wird dafür nicht verwendet.
