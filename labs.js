'use strict';
// Guided experiments: every control answers a question about the course material.
function installLearningLabs() {
  const M = NNLabs, installed = [];
  const fmt = n => Math.abs(n) > 0 && Math.abs(n) < .0001 ? n.toExponential(2) : Number(n.toFixed(4)).toString();
  const vec = a => '(' + a.map(fmt).join('; ') + ')';
  const sign = a => a.map(v => v > 0 ? '+' : '−').join('');
  const escape = safeText;
  const table = (head, rows) => '<table><thead><tr>' + head.map(t => `<th>${t}</th>`).join('') + '</tr></thead><tbody>' + rows.map(r => `<tr>${r.map(t => `<td>${t}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
  function mount(selector, id, config, replace = false) {
    const parent = document.querySelector(selector);
    if (!parent) return null;
    if (replace) parent.innerHTML = '';
    const el = document.createElement('article'); el.className = 'learning-lab'; el.id = 'lab-' + id;
    el.innerHTML = `<h2>${config.title}</h2><p class="lab-purpose"><strong>Das wird verständlich:</strong> ${config.purpose}</p><p class="lab-mission"><strong>Probiere es:</strong> ${config.mission}</p><div class="lab-controls"></div><div class="lab-actions"></div><div class="lab-plot"></div><div class="lab-readout" aria-live="polite" aria-atomic="true"></div><div class="lab-table"></div><div class="lab-check"><fieldset><legend>${config.check[0]}</legend><div class="lab-actions">${config.check[1].map((t, i) => `<button type="button" data-answer="${i}" aria-pressed="false">${t}</button>`).join('')}</div><p role="status"></p></fieldset></div><p class="lab-source">${config.source} · Alle Werte werden aus den gewählten Parametern berechnet.</p>`;
    if (parent.dataset.section === 'variation') parent.prepend(el); else parent.append(el);
    installed.push({ id, title: config.title, module: parent.closest('.module-section').id.slice(7), section: parent.closest('.subtab-content')?.dataset.section });
    el.querySelectorAll('[data-answer]').forEach(b => b.addEventListener('click', () => {
      el.querySelectorAll('[data-answer]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      el.querySelector('.lab-check [role=status]').textContent = (Number(b.dataset.answer) === config.check[2] ? 'Richtig. ' : 'Noch nicht. ') + config.check[3];
    }));
    const inputId = name => `lab-${id}-${name}`;
    const api = {
      el, control: name => el.querySelector('#' + inputId(name)),
      value: name => Number(api.control(name).value), checked: name => api.control(name).checked,
      range: (name, label, min, max, step, value) => `<label class="lab-slider" for="${inputId(name)}"><span>${label}</span><output for="${inputId(name)}"></output><input id="${inputId(name)}" data-value="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`,
      select: (name, label, options) => `<label for="${inputId(name)}">${label}<select id="${inputId(name)}">${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`,
      checkbox: (name, label, checked = true) => `<label><input id="${inputId(name)}" type="checkbox" ${checked ? 'checked' : ''}>${label}</label>`,
      controls: html => { el.querySelector('.lab-controls').innerHTML = html; },
      action: (text, handler, primary = false) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; if (primary) b.className = 'primary'; b.addEventListener('click', handler); el.querySelector(':scope > .lab-actions').append(b); return b; },
      onChange: fn => el.querySelector('.lab-controls').addEventListener('input', fn),
      values: () => el.querySelectorAll('[data-value]').forEach(i => i.previousElementSibling.textContent = fmt(Number(i.value))),
      set: values => { for (const [key, value] of Object.entries(values)) api.control(key).value = value; },
      plot: html => { el.querySelector('.lab-plot').innerHTML = html; },
      read: html => { el.querySelector('.lab-readout').innerHTML = html; },
      rows: (head, rows) => { el.querySelector('.lab-table').innerHTML = table(head, rows); }
    };
    return api;
  }
  function plane(xmin, xmax, ymin, ymax, square = false, xLabel = 'x', yLabel = 'y') {
    const w = square ? 440 : 580, h = square ? 440 : 330, pad = 42;
    const sx = x => pad + (x - xmin) / (xmax - xmin) * (w - 2 * pad);
    const sy = y => h - pad - (y - ymin) / (ymax - ymin) * (h - 2 * pad);
    const line = (a, b, cls = 'target', extra = '') => `<line x1="${sx(a[0])}" y1="${sy(a[1])}" x2="${sx(b[0])}" y2="${sy(b[1])}" class="${cls}" ${extra}/>`;
    const text = (p, t, extra = '') => `<text x="${sx(p[0])}" y="${sy(p[1])}" ${extra}>${escape(t)}</text>`;
    const dot = (p, cls = 'sample', r = 5, extra = '') => `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${r}" class="${cls}" ${extra}/>`;
    const path = (points, cls = 'curve', extra = '') => `<path d="${points.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0])},${sy(p[1])}`).join(' ')}" class="${cls}" ${extra}/>`;
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const x = xmin + (xmax - xmin) * i / 4, y = ymin + (ymax - ymin) * i / 4;
      grid += line([x, ymin], [x, ymax], 'grid') + line([xmin, y], [xmax, y], 'grid');
      grid += `<text x="${sx(x)}" y="${h - 20}" text-anchor="middle">${Number(x.toFixed(2))}</text><text x="${pad - 7}" y="${sy(y) + 4}" text-anchor="end">${Number(y.toFixed(2))}</text>`;
    }
    return { sx, sy, line, text, dot, path,
      svg: (body, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(label)}">${grid}${body}<text x="${w - 9}" y="${h - 18}" text-anchor="end">${xLabel}</text><text x="15" y="20">${yLabel}</text></svg>` };
  }
  const samples = (a, b, n, fun) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, fun(x)]; });
  function regressionLab() {
    const L = mount('#regression-lab', 'regression', { title: 'Die Gerade und ihre Fehler', purpose: 'Du siehst, wie Steigung und Achsenabschnitt jeden Fehler beeinflussen und warum am Minimum beide Ableitungen null sind.', mission: 'Starte bei a = b = 0. Senke die Fehlerquadratsumme von Hand. Vergleiche dann mit „Beste Gerade“. Erhöhe den letzten Messwert und beobachte, welche Gerade jetzt optimal ist.', source: 'Folien 109–112 · eigenes Zahlenbeispiel', check: ['Am Least-Squares-Minimum sind …', ['alle Residuen null.', 'die Residuen orthogonal zu den Modellspalten.'], 1, 'Bei einem Modell mit Achsenabschnitt gilt Σr = 0 und Σxr = 0. Einzelne Residuen können trotzdem ungleich null sein.'] }, true);
    L.controls(L.range('a', 'Achsenabschnitt a', -2, 6, .01, 0) + L.range('b', 'Steigung b', -2, 4, .01, 0) + L.range('y', 'Messwert bei x = 2', 0, 6, .1, 2));
    let exact = null;
    const read = () => { const a = exact ? exact[0] : L.value('a'), b = exact ? exact[1] : L.value('b'); return { a, b, points: [[0, 1], [1, 2], [2, L.value('y')]] }; };
    function draw() {
      L.values(); const { a, b, points } = read(), r = M.regression(points, a, b);
      L.control('a').previousElementSibling.textContent = fmt(a); L.control('b').previousElementSibling.textContent = fmt(b);
      const ends = [a - .25 * b, a + 2.25 * b], g = plane(-.25, 2.25, Math.min(-2, ...ends) - .5, Math.max(7, ...ends) + .5);
      L.plot(g.svg(g.path(samples(-.25, 2.25, 30, x => a + b * x)) + points.map((p, i) => g.line(p, [p[0], a + b * p[0]], 'axis', 'stroke-dasharray="5 3"') + g.dot(p)).join(''), 'Regressionsgerade mit senkrechten Residuen zu drei Datenpunkten'));
      L.read(`<p><strong>F = ${fmt(r.sse)}</strong> · a = ${fmt(a)}, b = ${fmt(b)}.</p><p>∂F/∂a = ${fmt(r.grad[0])}; ∂F/∂b = ${fmt(r.grad[1])}. ${Math.hypot(...r.grad) < 1e-8 ? 'Beide Ableitungen sind null: Hier liegt das Minimum.' : 'Ein positiver Ableitungswert bedeutet: Eine kleine Verringerung dieses Parameters senkt F, wenn der andere fest bleibt.'}</p>`);
      L.rows(['x', 'Messwert y', 'Vorhersage', 'Residuum r', 'r²'], points.map(([x, y], i) => [x, y, fmt(a + b * x), fmt(r.residuals[i]), fmt(r.residuals[i] ** 2)]));
    }
    L.onChange(e => { if (exact && e.target !== L.control('y')) exact[e.target === L.control('a') ? 0 : 1] = Number(e.target.value); draw(); });
    L.action('Beste Gerade', () => { const r = read(); exact = M.regression(r.points, r.a, r.b).optimum; L.set({ a: exact[0], b: exact[1] }); draw(); }, true);
    L.action('Ein Gradientenschritt (η = 0,05)', () => { const r = read(), grad = M.regression(r.points, r.a, r.b).grad; exact = [r.a - .05 * grad[0], r.b - .05 * grad[1]]; L.set({ a: exact[0], b: exact[1] }); draw(); });
    L.action('Ausgangsdaten', () => { exact = null; L.set({ a: 0, b: 0, y: 2 }); draw(); }); draw();
  }
  function classificationLab() {
    const L = mount('#classification-lab', 'classification', { title: 'Grenze, Seite und Sicherheit', purpose: 'Die Entscheidungsgrenze hängt von z = 0 ab. Die Wahrscheinlichkeit hängt zusätzlich davon ab, wie stark der Wert z von null abweicht.', mission: 'Lass die Gewichte bei (2; −1) und den Bias bei −3. Teste (2; 0). Erhöhe dann nur den gemeinsamen Faktor: Die Grenze bleibt, aber die Wahrscheinlichkeit verändert sich.', source: 'Folien 139–150 · Beispiel aus dem Kapitel', check: ['Alle Parameter mit einer positiven Zahl multiplizieren …', ['verschiebt immer die Grenze.', 'ändert die Sicherheit, aber nicht die Klasse.'], 1, 'z wird skaliert, sein Vorzeichen bleibt gleich. Die Nullmenge und die Entscheidung bei Schwelle 1/2 bleiben erhalten.'] }, true);
    L.controls(L.range('bias', 'Bias a₀', -5, 5, .25, -3) + L.range('w1', 'Gewicht a₁', -3, 3, .25, 2) + L.range('w2', 'Gewicht a₂', -3, 3, .25, -1) + L.range('scale', 'Gemeinsamer Faktor', .25, 4, .25, 1) + L.range('x', 'Testpunkt x₁', 0, 4, .1, 2) + L.range('y', 'Testpunkt x₂', 0, 4, .1, 0));
    function draw() {
      L.values(); const b = L.value('bias'), w1 = L.value('w1'), w2 = L.value('w2'), k = L.value('scale'), p = [L.value('x'), L.value('y')], z = k * (b + w1 * p[0] + w2 * p[1]), prob = M.sigmoid(z), g = plane(0, 4, 0, 4, true, 'x₁', 'x₂');
      let body = '';
      for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) { const x = (i + .5) / 6, y = (j + .5) / 6, q = M.sigmoid(k * (b + w1 * x + w2 * y)); body += `<rect x="${g.sx(i / 6)}" y="${g.sy((j + 1) / 6)}" width="15" height="15" fill="${q >= .5 ? 'var(--accent)' : 'var(--warn)'}" opacity="${.08 + .36 * Math.abs(2 * q - 1)}"/>`; }
      const ends = [];
      if (w2) for (const x of [0, 4]) { const y = -(b + w1 * x) / w2; if (y >= 0 && y <= 4) ends.push([x, y]); }
      if (w1) for (const y of [0, 4]) { const x = -(b + w2 * y) / w1; if (x >= 0 && x <= 4 && !ends.some(p => Math.hypot(x - p[0], y - p[1]) < 1e-8)) ends.push([x, y]); }
      if (ends.length >= 2) body += g.line(ends[0], ends[1]);
      L.plot(g.svg(body + g.dot(p, 'probe', 7), 'Blaue Fläche Klasse 1, orange Fläche Klasse 0; stärkere Farbe bedeutet höhere Sicherheit; markierter Testpunkt'));
      L.read(`<p>z = ${fmt(k)} · [${fmt(b)} + ${fmt(w1)}·${fmt(p[0])} + ${fmt(w2)}·${fmt(p[1])}] = <strong>${fmt(z)}</strong>.</p><p>p₁ = ${fmt(prob)}; p₀ = ${fmt(1 - prob)} → <strong>Klasse ${z >= 0 ? 1 : 0}</strong>. Blau steht für Klasse 1, Orange für Klasse 0. Stärkere Farbe bedeutet höhere Sicherheit.</p><p>${!w1 && !w2 ? (b === 0 ? 'Alle Punkte haben z = 0; es gibt keine einzelne Trennlinie. Die festgelegte ≥-Regel liefert überall Klasse 1.' : 'Beide Eingabegewichte sind null: Die Ausgabe hängt nur vom Bias ab, es gibt keine Trennlinie.') : `Grenze: ${fmt(b)} + ${fmt(w1)}x₁ + ${fmt(w2)}x₂ = 0. ${ends.length < 2 ? 'Die Grenze schneidet den dargestellten Ausschnitt nicht als Strecke.' : 'Der gemeinsame positive Faktor kürzt sich aus der Grenzgleichung.'}`}</p>`);
    }
    L.onChange(draw); L.action('Kapitelbeispiel zurücksetzen', () => { L.set({ bias: -3, w1: 2, w2: -1, scale: 1, x: 2, y: 0 }); draw(); }); draw();
  }
  function lossLab() {
    const L = mount('#module-klassifikation [data-section="likelihood"]', 'loss', { title: 'Warum zwei Fehlermaße anders lernen', purpose: 'Du vergleichst am selben logistischen Neuron den quadratischen Fehler und BCE. Besonders ein sehr sicheres falsches Urteil macht den Unterschied sichtbar.', mission: 'Wähle Ziel 1 und z = −6. Vergleiche die beiden Ableitungen. Führe einen BCE-Schritt und anschließend aus derselben Startlage einen Schritt mit quadratischem Fehler aus.', source: 'Folien 136–137, 152–162 · ein einzelner Biasparameter z', check: ['Bei einem sehr sicheren falschen Urteil ist der zusätzliche Faktor p(1−p) …', ['klein und bremst den quadratischen Fehlergradienten.', 'besonders groß.'], 0, 'In der Sättigung ist p(1−p) klein. Beim BCE-Gradienten fällt dieser Faktor weg.'] });
    L.controls(L.range('z', 'Netzeingabe z', -8, 8, .05, -6) + L.select('target', 'Wahre Klasse', [[1, 'Klasse 1'], [0, 'Klasse 0']]) + L.range('eta', 'Lernrate η', .05, 2, .05, 1));
    let z = -6, previous = '';
    function draw() {
      L.values(); L.control('z').previousElementSibling.textContent = fmt(z);
      const target = L.value('target'), r = M.binary(z, target), g = plane(-8, 8, 0, 9);
      L.plot(g.svg(g.path(samples(-8, 8, 120, x => M.binary(x, target).bce)) + g.path(samples(-8, 8, 120, x => M.binary(x, target).squared), 'target') + g.dot([z, r.bce], 'probe') + g.dot([z, r.squared]), 'BCE blau und quadratischer Fehler dunkel als Funktionen der Netzeingabe'));
      L.read(`<p>p = ${fmt(r.p)}. <strong>BCE = ${fmt(r.bce)}</strong> (blau), quadratischer Fehler = ${fmt(r.squared)} (dunkel).</p><p>Ableitung nach z: BCE = p−y = ${fmt(r.gradBCE)}; quadratisch = 2(p−y)p(1−p) = ${fmt(r.gradSquared)}.</p><p>${previous || 'Beide Schaltflächen verwenden hier den gewöhnlichen Schritt z ← z−η·Ableitung. Dadurch sind die tatsächlich angezeigten Ableitungen direkt vergleichbar.'}</p><p>Die absoluten Höhen der beiden Fehlerkurven sind verschieden skaliert; entscheidend für den Schritt ist ihre jeweilige Steigung.</p>`);
    }
    function step(kind) { const old = z, r = M.binary(z, L.value('target')); z -= L.value('eta') * r[kind]; z = Math.max(-8, Math.min(8, z)); L.set({ z }); previous = `Letzter Schritt: z = ${fmt(old)} → ${fmt(z)}. Wahrscheinlichkeiten: ${fmt(r.p)} → ${fmt(M.sigmoid(z))}.`; draw(); }
    L.onChange(e => { if (e.target === L.control('z')) z = L.value('z'); previous = ''; draw(); }); L.action('BCE-Schritt', () => step('gradBCE'), true); L.action('Schritt mit quadratischem Fehler', () => step('gradSquared')); L.action('Sicher falsch: z = −6, Ziel 1', () => { z = -6; L.set({ z, target: 1 }); previous = ''; draw(); }); draw();
  }
  function softmaxLab() {
    const L = mount('#module-klassifikation [data-section="mehrklassen"]', 'softmax', { title: 'Drei Klassen teilen eine Wahrscheinlichkeitssumme', purpose: 'Wenn ein Klassenwert steigt, müssen sich die normalisierten Wahrscheinlichkeiten der anderen Klassen verändern. Eine gemeinsame Verschiebung hebt sich dagegen heraus.', mission: 'Erhöhe nur z₁. Verschiebe danach alle drei Werte gemeinsam um +3. Vergleiche die Balken und die Kreuzentropie.', source: 'Folien 164–170 · eigene Zahlenvariante', check: ['Die Kreuzentropie hängt bei einem One-Hot-Ziel direkt ab von …', ['der Wahrscheinlichkeit der wahren Klasse.', 'nur der Wahrscheinlichkeit der vorhergesagten Klasse.'], 0, 'H = −log₂(p der wahren Klasse). Vorhergesagte und wahre Klasse können verschieden sein.'] });
    L.controls([0, 1, 2].map((_, i) => L.range('z' + i, 'z' + (i + 1), -3, 3, .1, i - 1)).join('') + L.select('target', 'Wahre Klasse', [[0, 'Klasse 1'], [1, 'Klasse 2'], [2, 'Klasse 3']]));
    let offset = 0;
    function draw() { L.values(); const z = [0, 1, 2].map(i => L.value('z' + i) + offset), target = L.value('target'), r = M.softmax(z, target), winners = r.p.map((p, i) => p === Math.max(...r.p) ? i + 1 : null).filter(Boolean);
      L.el.querySelector('.lab-plot').innerHTML = '<div class="lab-bars" style="padding:1rem">' + r.p.map((p, i) => `<div class="lab-bar"><span>Klasse ${i + 1}${i === target ? ' ✓' : ''}</span><div class="lab-bar-track"><div class="lab-bar-fill" style="width:${p * 100}%"></div></div><strong>${(100 * p).toFixed(1)} %</strong></div>`).join('') + '</div>';
      L.read(`<p>Verwendete z-Werte: ${vec(z)}. Gemeinsame Verschiebung: ${offset}. <strong>Σp = ${fmt(r.p.reduce((a, b) => a + b, 0))}</strong>.</p><p>Wahre Klasse ${target + 1}; ${winners.length > 1 ? 'Gleichstand bei Klassen ' + winners.join(', ') : 'Vorhersage: Klasse ' + winners[0]}. H = −log₂(${fmt(r.p[target])}) = <strong>${fmt(r.loss)} Bit</strong>.</p><p>Ein gemeinsamer Faktor e<sup>c</sup> steht nach der Verschiebung in jedem Zähler und im Nenner. Er kürzt sich; die Balken bleiben gleich.</p>`);
    }
    L.onChange(draw); L.action('Alle z gemeinsam +3', () => { offset += 3; draw(); }, true); L.action('Verschiebung aufheben', () => { offset = 0; draw(); }); draw();
  }
  regressionLab(); classificationLab(); lossLab(); softmaxLab();
  // Geometry, network dynamics and guided backpropagation are installed below.
  installCoreLabs({ M, mount, plane, samples, table, fmt, vec, sign });
  const overview = document.getElementById('module-overview');
  const index = document.createElement('section'); index.className = 'panel';
  index.innerHTML = '<h2>Mit Veränderungen verstehen</h2><p>Wähle eine Darstellung, bearbeite den kurzen Versuch und prüfe deine Erklärung. Die Experimente vertiefen die bestehenden Aufgaben und Folien.</p><div class="lab-map">' + installed.map(l => `<a class="button-link" data-lab="${l.id}" href="#/${l.module}/${l.section || ''}">${l.title}</a>`).join('') + '</div>';
  overview.querySelector('.two-col').after(index);
  index.addEventListener('click', e => { const link = e.target.closest('[data-lab]'); if (link) requestAnimationFrame(() => { const lab = document.getElementById('lab-' + link.dataset.lab); lab.tabIndex = -1; lab.focus({ preventScroll: true }); lab.scrollIntoView({ block: 'start' }); }); });
}
