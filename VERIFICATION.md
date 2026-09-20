# Prüfung der Lernplattform · 20. September 2026

## Fachliche Korrekturen

- LVQ mit Klassen verwendet die Zweiprototypen-Regel aus Folie 340. Ohne Klassen bleibt es beim Winner-Update aus Folie 336. Simulator, Aufgabenvarianten und Lösungen verwenden dieselbe Konvention.
- Die Originalzahlen ergeben ohne Klassen `(3,5)` und `(8,3)`, mit Klassen `(0,7)` und `(9.5,2.75)`.
- SOM verwendet Gitterabstände, berücksichtigt alle 63 Neuronen der angegebenen Gitterinterpretation und schneidet die Gauß-Nachbarschaft nicht nach zwei Schritten ab.
- Die RBF-Funktionsapproximation nutzt neun Dreiecksbasen und insgesamt elf Neuronen. Damit entstehen keine Doppelzählungen an Grenzen benachbarter Rechteckbasen. Der Simulator zählt Eingabe, Hidden-Neuronen und Ausgabe entsprechend.
- Hopfield: nichtsteigende Energie einschließlich des Gleichheitsfalls; die endliche Konvergenz wird auch auf Energieplateaus begründet. Die Schranke `n·2^n` ist an die feste zyklische Reihenfolge gebunden. Unbelegte fehlerfreie Speicherkapazitätsgarantien wurden entfernt.
- Voraussetzungen des Approximationssatzes, Rprop-/RMSProp-Verweise, Adam als unzentriertes zweites Moment und Unterschiede zwischen lokalem Einfluss und kompaktem Träger berichtigt.
- Nicht belegte Klausurregeln und Notenzusagen entfernt. Originalzahlen, eigene Varianten und zusätzliche Folienthemen sind gekennzeichnet.

## Automatische Kontrollen

`node tests/verify.js` erfolgreich:

- 750 Varianten: 50 je Aufgabenart; endliche Ergebnisse, Dezimalkomma, Zurückweisen leerer Antworten und unterschiedliche Aufgabenstellungen.
- Regressionslösungen unabhängig über zentrierte Kovarianz-/Varianzformeln geprüft.
- Backpropagation-Updates mit numerischen Ableitungen der Fehlerfunktion verglichen.
- Hopfield: Einzelupdates, alle Zustände und Nachfolger sowie Energieabnahme für drei Gewichtsvarianten geprüft.
- RBF-Interpolation und Summe der Dreiecksbasen an Stützstellen und Zwischenpunkten geprüft.
- 90 eindeutige MC-IDs; richtige, falsche und ausgelassene Antworten sowie die Untergrenze null je Block geprüft.
- Fünf Originalaufgaben, verfügbare Abbildungen und 14-Punkte-Trainingsraster je Rechenaufgabe geprüft.
- Optionaler Lauf mit KaTeX 0.16.9: 7.940 Formelausdrücke ohne Parserfehler.
- JavaScript-Syntaxprüfung aller Anwendungsskripte und `git diff --check` erfolgreich.

## Browserprüfung

- Alle 59 Kapitelansichten über die tatsächliche Navigation geöffnet: keine Laufzeit- oder KaTeX-Fehler.
- Regressionseingaben werden bewertet; LVQ-Simulator mit Klassen erreicht nach zwei Punkten die oben angegebenen Werte.
- Klausur gestartet, Notiz und MC-Antwort eingegeben, Seite neu geladen: Bearbeitungsstand bleibt erhalten; vor Abgabe sind keine Musterlösungen sichtbar.
- Nach Abgabe erscheinen Lösungen und Bewertung, MC-Antworten sind gesperrt. Die Eingabe oberhalb einer Teilpunktgrenze wird begrenzt.
- Darstellung bei Desktopbreite und 390 Pixeln geprüft; mobile Navigation und Formularbreiten angepasst.

Die Kontrollen prüfen konkrete Inhalte und Funktionen. Sie belegen weder Vollständigkeit für eine unbekannte kommende Prüfung noch eine bestimmte Note. Manuelle Zeichnungen und Begründungen erfordern weiterhin den Vergleich mit dem angegebenen Bewertungsraster. Der Timer wird über einen gespeicherten Endzeitpunkt berechnet; die vollen 120 Minuten wurden nicht in Echtzeit abgewartet.
