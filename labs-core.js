'use strict';
function installCoreLabs({ M, mount, plane, samples, table, fmt, vec, sign }) {
  function tluLab() {
    const L = mount('#module-task1 [data-section="vis"]', 'tlu', { title: 'Ein Punkt durch drei TLU-Schichten', purpose: 'Du verfolgst, wie fünf Halbebenen erst zwei Dreiecke und danach das Polygon ergeben. Eine einzelne richtige TLU-Ausgabe bedeutet noch nicht, dass der Punkt im Polygon liegt.', mission: 'Teste (2; 3,75), dann (2; 2). Verfolge die Nullen bis zum Ausgang. Ändere anschließend nur die Schwelle von L₂ und beobachte, welche Kante sich verschiebt.', source: 'Aufgabe 1 (2024), Originalpolygon · veränderte Schwellen sind eigene Versuche', check: ['Ein Dreieck der zweiten Schicht liefert 1, wenn …', ['mindestens eine seiner drei TLUs 1 liefert.', 'alle drei zugehörigen TLUs 1 liefern.'], 1, 'Das Dreieck ist der Schnitt dreier Halbräume: drei Gewichte 1, Schwelle 3. Erst die letzte Schicht vereinigt beide Dreiecke durch ODER.'] }, true);
    const theta = [...M.thresholds];
    L.controls(L.range('x', 'Testpunkt x₁', 0, 5, .05, 2) + L.range('y', 'Testpunkt x₂', 0, 5, .05, 3.75) + L.select('line', 'Zu untersuchende TLU', theta.map((_, i) => [i, 'L' + (i + 1)])) + L.range('theta', 'Schwelle dieser TLU', -12, 12, .25, -4) + L.checkbox('half', 'Gewählten Halbraum zeigen', false));
    function draw() {
      L.values(); const point = [L.value('x'), L.value('y')], chosen = L.value('line'), r = M.tlu(point, theta), g = plane(0, 5, 0, 5, true, 'x₁', 'x₂');
      let body = '';
      for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) { const q = M.tlu([(i + .5) * 5 / 32, (j + .5) * 5 / 32], theta); if (L.checked('half') ? q.hidden[chosen] : q.output) body += `<rect x="${g.sx(i * 5 / 32)}" y="${g.sy((j + 1) * 5 / 32)}" width="11.2" height="11.2" fill="var(--accent)" opacity=".2"/>`; }
      body += g.path([[1, 4], [4, 4], [3, 1], [3, 3], [1, 4]], 'target', 'stroke-dasharray="6 3"') + g.dot(point, 'probe', 7);
      L.plot(g.svg(body, 'Gefüllte Fläche: aktuelle Netzausgabe oder ausgewählter Halbraum. Gestrichelter Rand: Originalpolygon.'));
      L.read(`<p>L₁…L₅ = <strong>${vec(r.hidden)}</strong>.</p><p>C₁ = L₁ UND L₂ UND L₄ = <strong>${r.conjunctions[0]}</strong>; C₂ = L₁ UND L₃ UND L₅ = <strong>${r.conjunctions[1]}</strong>.</p><p>Y = C₁ ODER C₂ = <strong>${r.output}</strong>. ${r.output ? 'Mindestens ein vollständiges Dreieck nimmt den Punkt an.' : 'In jedem Dreieck verletzt der Punkt mindestens eine Begrenzung.'} Die gestrichelte Kontur zeigt immer das Originalpolygon.</p>`);
      L.rows(['TLU', 'w', 'wᵀx', 'θ', 'Vergleich → Ausgabe'], theta.map((t, i) => [`L${i + 1}${i === chosen ? ' ←' : ''}`, vec(M.normals[i]), fmt(r.net[i]), fmt(t), `${fmt(r.net[i])} ${r.hidden[i] ? '≥' : '<'} ${fmt(t)} → ${r.hidden[i]}`]));
    }
    L.onChange(e => { if (e.target === L.control('line')) L.set({ theta: theta[L.value('line')] }); else if (e.target === L.control('theta')) theta[L.value('line')] = L.value('theta'); draw(); });
    L.action('Innenpunkt', () => { L.set({ x: 2, y: 3.75 }); draw(); }); L.action('Ausgesparte Ecke', () => { L.set({ x: 2, y: 2 }); draw(); });
    L.action('Originalschwellen', () => { theta.splice(0, 5, ...M.thresholds); L.set({ theta: theta[L.value('line')] }); draw(); }); draw();
  }
  function rbfLab() {
    const L = mount('#module-task2 [data-section="vis"]', 'rbf', { title: 'Die Fliege aus drei radialen Bausteinen', purpose: 'Du erkennst, welche Fläche jeder Basisbaustein aktiviert und warum die beiden negativen Gewichte nötig sind.', mission: 'Schalte den Abzug links oben aus. Prüfe den Punkt (1,75; 2,25). Schalte ihn wieder ein und vergleiche die Summe. Tausche anschließend die L₁-Raute gegen einen L₂-Kreis.', source: 'Aufgabe 2 (2024) · Original: L₁, Radius 1, alle drei Bausteine aktiv', check: ['Darf die Ausgabe außerhalb der Fliege negativ sein?', ['Ja, verlangt ist dort y ≤ 0.', 'Nein, sie muss überall genau 0 sein.'], 0, 'Die Aufgabe fordert außen höchstens 0. Ein aktiver Abzugsbaustein außerhalb der Raute darf deshalb eine negative Ausgabe erzeugen. Die Ränder sind in der Aufgabe ausgenommen.'] }, true);
    L.controls(L.range('x', 'Testpunkt x₁', 0, 4, .05, 1.75) + L.range('y', 'Testpunkt x₂', 0, 4, .05, 2.25) + L.range('radius', 'Radius Grundfläche', .5, 1.5, .05, 1) + L.select('metric', 'Metrik Grundfläche', [[1, 'L₁: Raute (Original)'], [2, 'L₂: Kreis (Vergleich)']]) + L.checkbox('h0', 'Grundfläche +1') + L.checkbox('h1', 'Abzug links oben −1') + L.checkbox('h2', 'Abzug rechts unten −1'));
    function draw() {
      L.values(); const point = [L.value('x'), L.value('y')], active = [0, 1, 2].map(i => L.checked('h' + i)), radius = L.value('radius'), metric = L.value('metric'), r = M.rbf(point, active, radius, metric), g = plane(0, 4, 0, 4, true, 'x₁', 'x₂');
      let body = '';
      for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) { const y = M.rbf([(i + .5) / 8, (j + .5) / 8], active, radius, metric).output; if (y) body += `<rect x="${g.sx(i / 8)}" y="${g.sy((j + 1) / 8)}" width="11.2" height="11.2" fill="${y > 0 ? 'var(--accent)' : 'var(--warn)'}" opacity=".25"/>`; }
      for (const polygon of [[[2, 2], [2, 3], [3, 2], [2, 2]], [[2, 2], [1, 2], [2, 1], [2, 2]]]) body += g.path(polygon, 'target', 'stroke-dasharray="5 3"');
      L.plot(g.svg(body + g.dot(point, 'probe', 7), 'Blau: Ausgabe 1. Orange: negative Ausgabe. Gestrichelte Dreiecke: Zielgebiet aus der Altklausur.'));
      L.read(`<p>y = ${r.contributions.map(fmt).join(' + ')} = <strong>${r.output}</strong>. ${r.output > 0 ? 'Der aktuelle Aufbau nimmt den Punkt an.' : 'Der aktuelle Aufbau nimmt den Punkt nicht an.'}</p><p>Die radialen Aktivierungen hängen nur von Abstand und Radius ab. Die Häkchen schalten das jeweilige Ausgabegewicht auf null. Blau bedeutet 1, Orange negativ, ungefärbt 0. Die Kontur bleibt das Zielgebiet.</p><p>${metric === 1 && radius === 1 && active.every(Boolean) ? 'Originalparameter wiederhergestellt. Im Inneren der zwei Dreiecke ergibt sich 1; außerhalb höchstens 0.' : 'Die Parameter weichen vom Original ab. Prüfe an der Kontur, welche zusätzlichen Punkte angenommen oder fälschlich ausgeschlossen werden.'}</p>`);
      L.rows(['Basis', 'Distanz', 'Radius', 'h', 'Gewicht', 'Beitrag'], r.hidden.map((h, i) => [`h${i + 1}`, fmt(r.distances[i]), i ? .5 : radius, h, active[i] ? (i ? -1 : 1) : 0, r.contributions[i]]));
    }
    L.onChange(draw); L.action('Original wiederherstellen', () => { L.set({ radius: 1, metric: 1, x: 1.75, y: 2.25 }); [0, 1, 2].forEach(i => L.control('h' + i).checked = true); draw(); }); draw();
  }
  function approximationLab() {
    const L = mount('#module-task3 [data-section="vis"]', 'approximation', { title: 'Was jedes Hidden-Neuron zur Kurve beiträgt', purpose: 'Beim MLP addieren sich bleibende Stufen. Beim RBF überlagern sich lokale Dreiecke. Die Tabelle verbindet jede Kurvenstelle mit Aktivierung, Gewicht und Beitrag.', mission: 'Wähle „MLP aus 2024“ und bewege x über −3. Beobachte, warum das erste Gewicht −5 ist. Wähle dann „RBF aus 2024“ und x = −2,5: Zwei Dreiecke liefern zusammen 3,5.', source: 'Aufgabe 3 (2024): f(x) = x²+2x+2; Folien 99–104, 291–298', check: ['Die Ausgabegewichte eines Stufen-MLP sind …', ['die absoluten Funktionswerte an den Stufen.', 'die Unterschiede aufeinanderfolgender Funktionswerte.'], 1, 'Frühere Stufen bleiben eingeschaltet. Eine neue Stufe addiert nur die Änderung. Der Ausgangsbias stellt den Anfangswert her.'] }, true);
    L.controls(L.select('model', 'Netztyp', [['mlp', 'MLP mit Stufen'], ['rbf', 'RBF mit Dreiecken']]) + L.range('nodes', 'Neuronen insgesamt', 8, 12, 1, 10) + L.range('x', 'Untersuchte Stelle x', -4, 4, .05, -2.5) + L.range('unit', 'Hervorgehobenes Hidden-Neuron', 1, 10, 1, 1));
    function draw() {
      const model = L.control('model').value, n = L.value('nodes'), x = L.value('x'); L.control('unit').max = n - 2;
      if (L.value('unit') > n - 2) L.set({ unit: n - 2 }); L.values();
      const selected = L.value('unit') - 1, r = M.approximation(model, n, x), g = plane(-4, 4, -7, 29);
      let approx, contribution;
      if (model === 'mlp') {
        let total = r.bias; approx = [[-4, total]];
        r.centers.forEach((c, i) => { approx.push([c, total]); total += r.weights[i]; approx.push([c, total]); });
        approx.push([4, total]);
        contribution = [[-4, 0], [r.centers[selected], 0], [r.centers[selected], r.weights[selected]], [4, r.weights[selected]]];
      } else {
        approx = r.centers.map(c => [c, M.parabola(c)]);
        contribution = r.centers.map((c, i) => [c, i === selected ? r.weights[i] : 0]);
      }
      L.plot(g.svg(g.path(samples(-4, 4, 160, M.parabola), 'target') + g.path(approx) + g.path(contribution, '', 'fill="none" stroke="var(--warn)" stroke-width="2" stroke-dasharray="5 3"') + g.dot([x, r.output], 'probe', 6), 'Schwarz: Parabel; blau: Netzausgabe; orange gestrichelt: Beitrag des ausgewählten Hidden-Neurons.'));
      L.read(`<p>1 Eingang + ${n - 2} Hidden + 1 Ausgang = <strong>${n} Neuronen</strong>. ${model === 'mlp' ? `Bias = ${r.bias}, Ausgangsschwelle = ${-r.bias}.` : `Radius = Abstand benachbarter Zentren = ${fmt(r.interval)}; Ausgangsschwelle 0.`}</p><p>Bei x = ${fmt(x)}: Netz = <strong>${fmt(r.output)}</strong>, f(x) = ${fmt(M.parabola(x))}; Fehler = ${fmt(r.output - M.parabola(x))}.</p><p>Neuron ${selected + 1}: ${fmt(r.weights[selected])} · ${fmt(r.activations[selected])} = ${fmt(r.contributions[selected])}. Orange zeigt nur diesen Beitrag, blau die gesamte Summe einschließlich Bias. ${model === 'rbf' ? 'Zwischen Zentren sind nur zwei Dreiecke aktiv; ihre Aktivierungen summieren sich zu 1.' : 'Eine eingeschaltete Stufe bleibt rechts ihrer Schwelle aktiv.'}</p>`);
      L.rows(['Neuron', model === 'mlp' ? 'Schwelle' : 'Zentrum', 'Gewicht', 'Aktivierung', 'Beitrag'], r.centers.map((c, i) => [`${i + 1}${i === selected ? ' ←' : ''}`, fmt(c), fmt(r.weights[i]), fmt(r.activations[i]), fmt(r.contributions[i])]));
    }
    L.onChange(draw); L.action('MLP aus 2024', () => { L.set({ model: 'mlp', nodes: 10, x: -3.05, unit: 1 }); draw(); }, true); L.action('RBF aus 2024', () => { L.set({ model: 'rbf', nodes: 11, x: -2.5, unit: 2 }); draw(); }); draw();
  }
  function lvqLab() {
    const selector = '#module-task4 [data-section="vis"]';
    const L = mount(selector, 'lvq', { title: 'LVQ: jeden Datenpunkt mit dem aktuellen Netz rechnen', purpose: 'Du siehst den Unterschied zwischen Winner-Lernen und der überwachten Zweiprototypen-Regel sowie den Einfluss von Reihenfolge und Lernrate.', mission: 'Rechne zuerst ohne Klassen p und q. Setze zurück, wähle „Mit Klassen“ und beobachte nach p auch den falschen Prototyp. Vertausche danach die Reihenfolge und vergleiche die Endwerte.', source: 'Aufgabe 4a (2024) · Regeln von Folie 336 und 340', check: ['Für den zweiten Datenpunkt verwende ich …', ['die beiden ursprünglichen Prototypen.', 'die nach dem ersten Punkt veränderten Prototypen.'], 1, 'LVQ lernt hier online. Nach jedem Datenpunkt wird mit dem aktualisierten Netz neu zugeordnet. Die Updates beider Prototypen für denselben Punkt benutzen dessen gemeinsamen Ausgangszustand.'] }, true);
    L.controls(L.select('mode', 'Lernregel', [[0, 'Ohne Klassen: nur Winner'], [1, 'Mit Klassen: zwei Prototypen']]) + L.select('order', 'Reihenfolge', [[0, 'p, dann q (Original)'], [1, 'q, dann p']]) + L.range('eta', 'Lernrate η', .1, 1, .1, .5));
    const initial = [[5, 4], [7, 5]], data = [{ name: 'p', x: [1, 6], label: 0 }, { name: 'q', x: [9, 1], label: 1 }];
    let centers = initial.map(c => [...c]), history = [], result = null;
    function reset() { centers = initial.map(c => [...c]); history = []; result = null; draw(); }
    const current = () => data[(history.length % 2 + L.value('order')) % 2];
    function draw() {
      L.values(); const item = current(), next = M.lvq(centers, item.x, item.label, L.value('eta'), Boolean(L.value('mode'))), plotted = [...data.map(d => d.x), ...centers, ...(result ? result.before : [])];
      const g = plane(Math.min(-1, ...plotted.map(p => p[0])) - 1, Math.max(11, ...plotted.map(p => p[0])) + 1, Math.min(0, ...plotted.map(p => p[1])) - 1, Math.max(8, ...plotted.map(p => p[1])) + 1);
      let body = data.map(d => g.dot(d.x, 'sample', 5) + g.text([d.x[0] + .2, d.x[1] + .35], `${d.name}: Klasse ${d.label ? 'B' : 'A'}`)).join('');
      centers.forEach((c, i) => { if (result) body += g.line(result.before[i], c, 'curve', 'stroke-dasharray="4 3"'); body += g.dot(c, 'probe', 7) + g.text([c[0] + .2, c[1] - .45], `Prototyp ${i ? 'B' : 'A'}`); });
      L.plot(g.svg(body, 'Datenpunkte p und q, aktuelle Prototypen A und B und ihre letzte Bewegung'));
      L.read(`<p><strong>${history.length}/2 Datenpunkte bearbeitet.</strong> A = ${vec(centers[0])}; B = ${vec(centers[1])}.</p>${history.length < 2 ? `<p>Nächster Punkt: ${item.name} = ${vec(item.x)}, Klasse ${item.label ? 'B' : 'A'}. d² zu A/B = ${vec(next.distances)}; Winner: ${next.winner ? 'B' : 'A'}. ${L.value('mode') ? 'Die zwei Klassen sind verschieden und eine passt: Beide werden verändert.' : 'Nur dieser Winner wird zum Punkt gezogen.'}</p>` : '<p>Eine Epoche ist abgeschlossen. Ändere die Reihenfolge oder Lernrate für einen neuen Durchlauf.</p>'}${result ? `<p>Letzter Schritt (${result.item.name}): A ${vec(result.before[0])} → ${vec(centers[0])}; B ${vec(result.before[1])} → ${vec(centers[1])}. Bei Abstoßen wird η(x−r) subtrahiert.</p>` : '<p>Vor dem Schritt die Richtung beider Bewegungen vorhersagen. Die gestrichelten Strecken zeigen anschließend die tatsächliche Bewegung.</p>'}`);
      step.disabled = history.length >= 2; undo.disabled = !history.length;
      L.rows(['Schritt', 'A vorher', 'B vorher', 'Punkt', 'd² A/B'], history.map((r, i) => [i + 1, vec(r.before[0]), vec(r.before[1]), r.item.name, vec(r.calc.distances)]));
    }
    const step = L.action('Nächsten Punkt anwenden', () => { if (history.length >= 2) return; const item = current(), calc = M.lvq(centers, item.x, item.label, L.value('eta'), Boolean(L.value('mode'))); result = { before: centers, item, calc }; history.push(result); centers = calc.next; draw(); }, true);
    const undo = L.action('Schritt zurück', () => { const old = history.pop(); if (old) centers = old.before; result = history[history.length - 1] || null; draw(); });
    L.action('Epoche zurücksetzen', reset); L.onChange(reset); draw();
  }
  function somLab() {
    const L = mount('#module-task4 [data-section="vis"]', 'som', { title: 'SOM: Datenraum und Gitterabstand auseinanderhalten', purpose: 'Der Winner wird nach Datenabstand gewählt. Die Stärke des Nachbarupdates wird dagegen vom Gitterabstand bestimmt. Du kannst ein einzelnes Neuron bis zu seinem neuen Vektor verfolgen.', mission: 'Starte mit den Originalwerten. Wähle Gitterstelle (5;4), den linken Nachbarn. Erhöhe σ: Weitere Neuronen bewegen sich stärker. Ändere η: Die Richtung bleibt, die Schrittlänge verändert sich.', source: 'Aufgabe 4b (2024), Gitterinterpretation wie in der Musterlösung · Folien 364–366', check: ['σ bestimmt hier …', ['den Abstand des Winners zum Datenpunkt.', 'wie stark entfernte Gitterneuronen mitlernen.'], 1, 'σ gehört zur Nachbarschaftsfunktion. Der Winner wird unabhängig davon im Datenraum gesucht. η skaliert anschließend alle Verschiebungen.'] });
    L.controls(L.range('x', 'Datenpunkt x₁', 0, 40, 1, 28) + L.range('y', 'Datenpunkt x₂', 0, 30, 1, 20) + L.range('sigma', 'Nachbarschaft σ', .5, 5, .5, 2) + L.range('eta', 'Lernrate η', .1, 1, .1, .5) + L.range('i', 'Untersuchtes Neuron: i', 0, 8, 1, 5) + L.range('j', 'Untersuchtes Neuron: j', 0, 6, 1, 4) + L.checkbox('after', 'Verschiebungen und neues Gitter zeigen'));
    function draw() {
      L.values(); const x = [L.value('x'), L.value('y')], r = M.som(x, L.value('sigma'), L.value('eta')), chosen = r.rows.find(n => n.i === L.value('i') && n.j === L.value('j')), g = plane(-2, 42, -2, 32), after = L.checked('after');
      let body = '';
      for (const n of r.rows) {
        const pos = after ? n.next : n.old;
        for (const adjacent of [[n.i + 1, n.j], [n.i, n.j + 1]]) { const neighbor = r.rows.find(v => v.i === adjacent[0] && v.j === adjacent[1]); if (neighbor) body += g.line(pos, after ? neighbor.next : neighbor.old, 'grid'); }
        if (after) body += g.line(n.old, n.next, 'axis', 'stroke-dasharray="3 2"');
        body += `<circle cx="${g.sx(pos[0])}" cy="${g.sy(pos[1])}" r="${n === chosen ? 7 : 4}" fill="var(--accent)" fill-opacity="${.15 + .85 * n.h}" stroke="${n === chosen ? 'var(--ink)' : 'none'}" stroke-width="2"/>`;
      }
      body += g.dot(x, 'probe', 6) + g.text([x[0], Math.min(31, x[1] + 2)], 'Eingabe x');
      L.plot(g.svg(body, 'SOM-Gitter vor oder nach einem einzelnen Update. Dunklere Neuronen haben einen größeren Nachbarschaftsfaktor.'));
      L.read(`<p>Winner: Gitterindex ${vec(r.winner)}, Prototyp ${vec(r.winner.map(v => 5 * v))}. Ausgewähltes Neuron: Gitter ${vec([chosen.i, chosen.j])}, Prototyp ${vec(chosen.old)}.</p><p>d²<sub>Gitter</sub> = ${chosen.d2}; h = exp(−${chosen.d2}/(2·${L.value('sigma')}²)) = <strong>${fmt(chosen.h)}</strong>.</p><p>Δr = ${L.value('eta')} · ${fmt(chosen.h)} · ${vec(x.map((v, i) => v - chosen.old[i]))} = <strong>${vec(chosen.delta)}</strong>.<br>r neu = <strong>${vec(chosen.next)}</strong>.</p><p>Dies ist ein Schritt aus dem ursprünglichen Gitter. Die Ansicht kumuliert keine Epochen. Der Gaußfaktor ist überall positiv; bei großem Abstand kann die Bewegung optisch kaum sichtbar sein. Bei einem Abstandsgleichstand wählt diese Darstellung den größeren Gitterindex.</p>`);
    }
    L.onChange(draw); L.action('Originalwerte', () => { L.set({ x: 28, y: 20, sigma: 2, eta: .5, i: 5, j: 4 }); L.control('after').checked = true; draw(); }); draw();
  }
  function hopfieldLab() {
    const L = mount('#module-task5 [data-section="vis"]', 'hopfield', { title: 'Ein Update, ein Übergang, eine Energieänderung', purpose: 'Du leitest jeden Pfeil aus Netzeingabe und Schwelle her. Der Vergleich mit gleichzeitigen Updates zeigt, warum „asynchron“ im Konvergenzsatz nötig ist.', mission: 'Starte bei −−−. Aktualisiere zuerst u₂. Setze zurück und aktualisiere zuerst u₁. Vergleiche die Wege. Teste danach zweimal „Alle gleichzeitig“: Im Originalnetz entsteht ein Zyklus.', source: 'Aufgabe 5 (2024), k = 2 · k = 1 ist eine eigene Gleichheitsfall-Variante; Folien 388–390', check: ['Ein echter Zustandswechsel muss die Energie immer strikt senken.', ['Ja, bei jedem Hopfield-Netz.', 'Nein: Beim Gleichheitsfall kann ΔE = 0 sein.'], 1, 'Bei net = θ kann −1 zu +1 wechseln, ohne Energieänderung. Das Originalnetz hat bei echten Änderungen keinen solchen Gleichheitsfall; die k=1-Variante macht ihn sichtbar.'] }, true);
    const states = Array.from({ length: 8 }, (_, i) => [i & 4 ? 1 : -1, i & 2 ? 1 : -1, i & 1 ? 1 : -1]);
    L.controls(L.select('start', 'Startzustand', states.map((s, i) => [i, sign(s)])) + L.select('k', 'Gewichte w₁₂ = w₂₃', [[2, '−2: Originalnetz'], [1, '−1: Gleichheitsfall testen']]) + L.select('neuron', 'Nächstes Einzelupdate', [[0, 'u₁'], [1, 'u₂'], [2, 'u₃']]));
    let state = [...states[0]], history = [], last = '';
    function reset() { state = [...states[L.value('start')]]; history = []; last = ''; draw(); }
    function draw() {
      const k = L.value('k'), neuron = L.value('neuron'), r = M.hopfield(state, k, neuron), g = plane(-.4, 7.4, -5, 9, false, 'Zustand', 'E');
      const energies = states.map(s => M.hopfield(s, k).energy), current = states.findIndex(s => s.every((v, i) => v === state[i]));
      let body = '';
      states.forEach((s, i) => { body += g.dot([i, energies[i]], i === current ? 'probe' : 'sample', i === current ? 8 : 5) + g.text([i, energies[i] + .55], sign(s), 'text-anchor="middle"'); });
      for (let u = 0; u < 3; u++) { const next = M.hopfield(state, k, u), idx = states.findIndex(s => s.every((v, i) => v === next.next[i])); if (idx !== current) body += g.line([current, r.energy], [idx, next.nextEnergy], 'curve', 'stroke-dasharray="5 3"'); }
      L.plot(g.svg(body, 'Alle acht Zustände mit ihrer Energie. Orange: aktueller Zustand; Linien: seine verändernden asynchronen Übergänge.'));
      L.read(`<p>Aktuell <strong>${sign(state)}</strong>, E = ${r.energy}. ${r.stable ? 'Stabil: Kein Einzelupdate verändert den Zustand.' : 'Mindestens ein Einzelupdate verändert den Zustand.'}</p><p>Für u${neuron + 1}: net = ${r.net[neuron]}, θ = ${r.theta[neuron]}; deshalb ${r.net[neuron] >= r.theta[neuron] ? '+1 (net ≥ θ)' : '−1 (net < θ)'}. Vorhersage: ${sign(r.next)}, E neu = ${r.nextEnergy}, ΔE = ${r.nextEnergy - r.energy}.</p><p>${last || 'Wähle zuerst das Neuron und sage den nächsten Zustand voraus. Ein Update verändert höchstens diesen einen Eintrag. Unveränderte Updates sind erlaubt.'}</p>`);
      L.rows(['Schritt', 'Regel', 'Vorher', 'Nachher', 'E vorher → nachher'], history.slice(-12).map((h, i) => [history.length - Math.min(history.length, 12) + i + 1, h.mode, sign(h.before), sign(h.next), `${h.energy} → ${h.nextEnergy}`]));
      undo.disabled = !history.length;
    }
    function step(sync) { const r = M.hopfield(state, L.value('k'), L.value('neuron'), sync); history.push({ ...r, before: state, mode: sync ? 'Alle gleichzeitig' : 'u' + (L.value('neuron') + 1) }); state = r.next;
      last = sync ? `Gleichzeitiger Schritt: ΔE = ${r.nextEnergy - r.energy}. Der asynchrone Konvergenzsatz gilt dafür nicht. Bei k=2 pendelt −−− ↔ +++.` : `Einzelupdate: ΔE = ${r.nextEnergy - r.energy}. ${r.nextEnergy === r.energy ? 'Bei unverändertem Zustand oder net=θ bleibt die Energie gleich.' : 'Die Energie ist gesunken.'}`; draw(); }
    L.action('Einzelupdate ausführen', () => step(false), true); L.action('Alle gleichzeitig (Vergleich)', () => step(true));
    const undo = L.action('Schritt zurück', () => { const h = history.pop(); if (h) state = h.before; last = ''; draw(); });
    L.action('Start wiederherstellen', reset); L.onChange(e => e.target === L.control('neuron') ? draw() : reset()); draw();
  }
  function backpropLab() {
    const L = mount('#module-task3 [data-section="variation"]', 'backprop', { title: 'Backpropagation in vier Rechenschritten', purpose: 'Du verfolgst denselben Fehler vom Ausgang zurück zum Hidden-Neuron. Die Gewichte bleiben unverändert, bis alle Fehlerfaktoren ausgerechnet sind.', mission: 'Rechne mit x=2, Ziel 1, v=0,5 und w=1. Gehe jeden Schritt einzeln durch. Setze anschließend w=0: Warum bekommt das Hidden-Gewicht in diesem Schritt keinen Fehler weitergereicht?', source: 'Folien 174–183 · eigene Ein-Neuron-Variante; Update −η∇E/2 bei E=(t−o)²', check: ['Im Hidden-Fehler desselben Schritts benutze ich …', ['das bereits geänderte Ausgangsgewicht.', 'das alte Ausgangsgewicht.'], 1, 'Alle Ableitungen gehören zu genau demselben Parameterzustand. Erst nach der Rückwärtsrechnung werden die Parameter gemeinsam aktualisiert.'] });
    L.controls(L.range('x', 'Eingabe x', -2, 3, .5, 2) + L.select('target', 'Ziel t', [[1, '1'], [0, '0']]) + L.range('v', 'Eingangsgewicht v', -2, 2, .1, .5) + L.range('w', 'Ausgangsgewicht w', -2, 2, .1, 1) + L.range('eta', 'Lernrate η', .1, 1, .1, .1));
    let phase = 0, params = null, applied = '';
    const read = () => params || { x: L.value('x'), target: L.value('target'), v: L.value('v'), w: L.value('w'), bh: 0, bo: 0, eta: L.value('eta') };
    function draw() {
      L.values(); const p = read(), r = M.backprop(p), names = ['Vorwärts', 'Ausgangsfehler', 'Hidden-Fehler', 'Parameterupdate'];
      for (const key of ['v', 'w']) {
        const input = L.control(key); input.min = Math.min(-2, Math.floor(p[key])); input.max = Math.max(2, Math.ceil(p[key])); input.value = p[key]; input.previousElementSibling.textContent = fmt(p[key]);
      }
      L.plot(`<svg viewBox="0 0 580 150" role="img" aria-label="Eingabe, Hidden-Neuron und Ausgabe, mit den Werten des aktuellen Rechenschritts"><path d="M85 75H255 M325 75H495" class="curve"/><circle cx="55" cy="75" r="30" fill="var(--paper)" stroke="var(--ink)"/><circle cx="290" cy="75" r="35" fill="var(--soft)" stroke="var(--accent)"/><circle cx="530" cy="75" r="35" fill="var(--soft)" stroke="var(--accent)"/><text x="55" y="80" text-anchor="middle">${fmt(p.x)}</text><text x="290" y="80" text-anchor="middle">${phase ? fmt(r.h) : '?'}</text><text x="530" y="80" text-anchor="middle">${phase ? fmt(r.out) : '?'}</text><text x="175" y="57" text-anchor="middle">v=${fmt(p.v)}</text><text x="413" y="57" text-anchor="middle">w=${fmt(p.w)}</text><text x="290" y="132" text-anchor="middle">Bias h=${fmt(p.bh)}</text><text x="490" y="132" text-anchor="middle">Bias o=${fmt(p.bo)}</text></svg>`);
      const steps = [`h = σ(${fmt(p.v)}·${fmt(p.x)}+${fmt(p.bh)}) = ${fmt(r.h)}; o = σ(${fmt(p.w)}·${fmt(r.h)}+${fmt(p.bo)}) = ${fmt(r.out)}. E = ${fmt(r.loss)}.`,
        `δₒ = (t−o)o(1−o) = ${fmt(r.deltaOut)}. Das Ziel ist ${p.target}.`,
        `δₕ = w ALT · δₒ · h(1−h) = ${fmt(p.w)} · ${fmt(r.deltaOut)} · ${fmt(r.h * (1 - r.h))} = ${fmt(r.deltaHidden)}.`,
        `v neu = v + ηδₕx = ${fmt(r.next.v)}; w neu = w + ηδₒh = ${fmt(r.next.w)}. Biaswerte neu: ${fmt(r.next.bh)}, ${fmt(r.next.bo)}. E neu = ${fmt(r.nextLoss)}.`];
      L.read(`<p>${names.map((n, i) => `<span class="lab-step ${i + 1 === phase ? 'active' : ''}">${i + 1}. ${n}</span>`).join('')}</p>${phase ? steps.slice(0, phase).map((s, i) => `<p><strong>${i + 1}.</strong> ${s}</p>`).join('') : '<p>Vor der Auflösung: Welches Vorzeichen erwartest du für die Änderung von w und v?</p>'}${applied ? `<p>${applied}</p>` : ''}`);
      advance.disabled = phase >= 4; apply.disabled = phase < 4;
    }
    const advance = L.action('Nächsten Rechenschritt zeigen', () => { phase = Math.min(4, phase + 1); draw(); }, true);
    const apply = L.action('Berechnete Gewichte übernehmen', () => { const r = M.backprop(read()); params = r.next; phase = 0; applied = `Update übernommen. Fehler zuvor ${fmt(r.loss)}, danach ${fmt(r.nextLoss)}. Der nächste Vorwärtspass verwendet diese neuen Parameter.`; draw(); });
    L.action('Beispiel zurücksetzen', () => { params = null; phase = 0; applied = ''; L.set({ x: 2, target: 1, v: .5, w: 1, eta: .1 }); draw(); });
    L.onChange(e => { const key = e.target.id.split('-').pop(); params = { ...read(), [key]: L.value(key) }; phase = 0; applied = 'Parameter geändert. Die Biaswerte bleiben wie im Netzbild angezeigt; „Beispiel zurücksetzen“ setzt sie auf 0.'; draw(); }); draw();
  }
  function cmeansLab() {
    const L = mount('#module-task2 [data-section="variation"]', 'cmeans', { title: 'c-Means: erst zuordnen, dann Zentren verschieben', purpose: 'Die Punkte werden gemeinsam mit den alten Zentren zugeordnet. Erst der zweite Schritt berechnet neue Schwerpunkte. Das unterscheidet den Ablauf vom Online-LVQ.', mission: 'Gehe Zuordnung und Schwerpunktbildung getrennt durch. Starte anschließend mit beiden Zentren links: Ein Zentrum bekommt anfangs alle Punkte, das andere bleibt mangels zugeordneter Punkte stehen.', source: 'Folien 310–314 · Zahlen aus der vorhandenen c-Means-Übung', check: ['Während der Zuordnung eines Batch-Schritts …', ['bleiben beide Zentren unverändert.', 'verschiebe ich nach jedem Punkt das Zentrum.'], 0, 'Alle Distanzen einer Zuordnungsrunde werden mit denselben Zentren berechnet. Danach werden die Mittelwerte aller zugeordneten Punkte gebildet.'] });
    const points = [[1, 2], [2, 1], [5, 4], [6, 5]];
    let centers = [[1, 1], [6, 6]], phase = 0, round = 0, r = null, message = '';
    function draw() {
      const g = plane(0, 7, 0, 7, true), calc = M.cmeans(points, centers);
      let body = points.map((p, i) => g.dot(p, phase ? (r.assignment[i] ? 'probe' : 'sample') : 'sample', 6) + g.text([p[0] + .15, p[1] + .25], 'P' + (i + 1))).join('');
      centers.forEach((c, i) => body += g.text(c, '✚ C' + (i + 1), 'font-weight="bold"'));
      L.plot(g.svg(body, 'Vier Datenpunkte und zwei Clusterzentren. Nach Zuordnung unterscheidet die Farbe die Cluster.'));
      L.read(`<p><strong>Runde ${round + 1}: ${phase ? 'Zuordnung festgelegt' : 'Bereit zur Zuordnung'}</strong>. Zentren ${vec(centers[0])} und ${vec(centers[1])}.</p><p>${phase ? `Cluster 1: ${r.assignment.map((k, i) => k === 0 ? 'P' + (i + 1) : '').filter(Boolean).join(', ') || 'leer'}; Cluster 2: ${r.assignment.map((k, i) => k === 1 ? 'P' + (i + 1) : '').filter(Boolean).join(', ') || 'leer'}. Neue Mittelwerte: ${vec(r.next[0])}, ${vec(r.next[1])}.` : 'Sage zuerst voraus, welches Zentrum zu welchem Punkt näher ist.'}</p><p>${message || 'Ein leeres Cluster behält in diesem Experiment sein altes Zentrum. Dafür muss eine explizite Regel festgelegt werden.'}</p>`);
      L.rows(['Punkt', 'd² zu C₁', 'd² zu C₂', 'Zuordnung'], points.map((p, i) => ['P' + (i + 1) + ' ' + vec(p), fmt(calc.distances[i][0]), fmt(calc.distances[i][1]), phase ? 'C' + (r.assignment[i] + 1) : '?']));
      next.textContent = phase ? 'Zentren durch Mittelwerte ersetzen' : 'Alle Punkte zuordnen';
    }
    const next = L.action('Alle Punkte zuordnen', () => { if (!phase) { r = M.cmeans(points, centers); phase = 1; } else { centers = r.next; message = `Fehlerquadratsumme bei dieser Zuordnung: ${fmt(r.before)} → ${fmt(r.after)}. Jetzt erneut zuordnen; gleiche Zuordnung und gleiche Zentren bedeuten Stillstand.`; phase = 0; round++; } draw(); }, true);
    L.action('Ausgangszentren', () => { centers = [[1, 1], [6, 6]]; phase = 0; round = 0; message = ''; draw(); });
    L.action('Leeres Cluster untersuchen', () => { centers = [[0, 0], [0, 1]]; phase = 0; round = 0; message = ''; draw(); }); draw();
  }
  tluLab(); rbfLab(); approximationLab(); lvqLab(); somLab(); hopfieldLab(); backpropLab(); cmeansLab();
  const cnn = document.querySelector('#module-deeplearning [data-section="cnn"] .vis-container');
  if (cnn) cnn.insertAdjacentHTML('afterbegin', '<div class="lab-mission"><strong>Was bringt dir das Anklicken?</strong> Wähle eine Zelle der Feature Map: Der markierte Bildausschnitt und die ausgeschriebene Summe zeigen genau ihre Berechnung. Sage zuerst das Vorzeichen voraus. Ändere danach Stride von 1 auf 2: Der Kernel springt weiter, die Ausgabe wird kleiner. Vergleiche zum Schluss Max- und Average-Pooling an derselben Stelle. Das Maximum wählt einen Wert, der Mittelwert bezieht alle Werte des Fensters ein.</div>');
}
