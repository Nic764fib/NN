# NN · Klausur lernen

[Website öffnen](https://nic764fib.github.io/NN/)

Praktische Vorbereitung anhand der Aufgabenübersicht vom 10. Juli 2024 und der bereitgestellten Vorlesungsfolien von Christian Borgelt.

## Drei Einstiege

- **Altklausur & Training:** fünf vollständige Originalpakete, je eine Transferaufgabe und sechs kurze Übungen zu häufigen Fehlern. Teilaufgaben sind einzeln wählbar. Hinweise, Rezept und vollständige Lösung erscheinen direkt an der Aufgabe.
- **Multiple Choice:** 30 Sachverhalte zu den sechs Themenblöcken von 2024, jeweils in zwei Formulierungen; 15 ergänzende Grundlagen. Einzeltraining mit sofortiger Erklärung oder eigenständige Fünfer-/30er-Blöcke.
- **Rechenrezepte:** sieben konkrete Schrittfolgen mit Beispielen. Weitere Folienthemen bleiben als Nachschlagebereich erreichbar.

Ein Gesamtdurchlauf enthält alle fünf Rechenpakete und 30 MC-Aussagen. Es gibt keine Pflichtuhr, Kapitelpflicht oder Freischaltung. Freie Rechnungen und Zeichnungen werden anhand vollständiger Kriterien selbst verglichen; einzelne Zahlen lassen sich zusätzlich prüfen. Lernstände unterscheiden Bearbeitung mit Hilfe, selbstständige Transferaufgaben und spätere Wiederholung.

## Quellen und fachliche Entscheidungen

Die Aufgabenübersicht und die eigenen PDF-Ausarbeitungen liegen in `materials/`. Die Ausarbeitungen sind keine offiziellen Musterlösungen. Die vollständigen Vorlesungsfolien wurden lokal geprüft; die [öffentliche Fassung beim Autor](https://borgelt.net/slides/nn.pdf) kann anders nummeriert sein. MC-Aussagen sind eigene oder rekonstruierte Trainingsformulierungen, keine behaupteten Originalfragen.

Die TLU-Konstruktion besitzt drei Schichten **einschließlich Eingabe**. Beide LVQ-Lesarten sind getrennt gerechnet. Die SOM-Gitterinterpretation wird offengelegt; alle verlangten Updates sind enthalten. RBF-Dreiecke vermeiden doppelte Randhöhen, und Hopfield berücksichtigt den Gleichheitsfall ohne falsche Behauptung strikt sinkender Energie.

Es gibt keine erfundenen Einzelpunkte für Rechenaufgaben oder Notenprognosen. MC folgt Folie 2: +1/−1/0, mindestens 0 je Fünferblock.

## Daten und alte Links

Der aktuelle Browserstand liegt unter `ann_exam_focus_v1`. Der frühere Schlüssel `ann_borgelt_state_v2` bleibt unverändert; alte Notizen und Bewertungen sind unter **Quellen & eigene Daten** einsehbar und exportierbar. Ein Import sichert vorher den aktuellen Stand. Neue Konstruktionen werden nicht anhand alter Häkchen als beherrscht eingestuft.

Die bisherigen Hauptrouten, einschließlich `#/klausur`, `#/task1` bis `#/task6` und `#/abfragen`, führen zu passenden neuen Einstiegen. Es gibt keinen eigenständigen Satztrainer mehr.

## Lokal öffnen und prüfen

Statische Website, kein Build und kein Backend:

```sh
python -m http.server 8766
node tests/study.test.js
node tests/study-browser.mjs
```

Der Browsertest benötigt `playwright` und Microsoft Edge. Alternativ kann `PLAYWRIGHT_MODULE` eine importierbare Modul-URL nennen. `NN_TEST_URL` überschreibt die lokale Adresse. Screenshots werden in das ignorierte Verzeichnis `tmp/` geschrieben. KaTeX und Schriften kommen von jsDelivr und benötigen Internet.

## Aktive Dateien

| Datei | Inhalt |
| --- | --- |
| `study-content.js` | Aufgaben, Hinweise, Rezepte und vollständige Lösungen |
| `study-core.js` | Berechnungen, Zahlenprüfung und Wiederholungsauswahl |
| `study-visual.js` | Flächen, Netze, Näherungsgraphen und Hopfield-Graph |
| `study-mc.js` | Aussagen, Formulierungsvarianten und Wiederholung |
| `study-app.js` | Navigation, Bedienung, Speicherung, Import/Export |
| `study-reference.js` | Erhaltene ergänzende Folienerklärungen |
| `study.css` | Desktop-, Mobil- und Druckdarstellung |

`index.html` lädt ausschließlich diese neue Anwendung. Die älteren JS-/CSS-Dateien bleiben als bisheriger Quellstand erhalten und werden nicht mehr ausgeführt. Entsprechend gelten für den Umbau die `study-*`-Tests; die älteren Tests gehören zur vorherigen Anwendung.

[Auftrag und Entscheidungen](UMBAU.md) · [Prüfbericht](VERIFICATION.md)

Veröffentlichung über GitHub Pages. Die frühere `.openai/hosting.json` wird dafür nicht verwendet.
