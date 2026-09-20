/* Interactive study platform for the supplied Borgelt lecture and 2024 tasks. */

// -------------------------------------------------------------
// State Management & Local Storage (Analysis 2B Architecture)
// -------------------------------------------------------------
const STORAGE_KEY = 'ann_borgelt_state_v2';
let state = {
  known: {},
  done: {},
  notes: {},
  scores: {},
  mcqAnswers: {},
  last: 'regression'
};
let storageOK = true;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && typeof saved === 'object') {
    if (saved.known && typeof saved.known === 'object') state.known = saved.known;
    if (saved.done && typeof saved.done === 'object') state.done = saved.done;
    if (saved.notes && typeof saved.notes === 'object') state.notes = saved.notes;
    if (saved.scores && typeof saved.scores === 'object') state.scores = saved.scores;
    if (saved.mcqAnswers && typeof saved.mcqAnswers === 'object') state.mcqAnswers = saved.mcqAnswers;
    if (saved.last) state.last = saved.last;
    if (saved.exam) state.exam = saved.exam;
    if (Array.isArray(saved.examHistory)) state.examHistory = saved.examHistory;
  }
} catch {
  storageOK = false;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const statusEl = document.getElementById('storage-status');
    if (statusEl) {
      statusEl.textContent = 'Fortschritt wird in diesem Browser gespeichert.';
    }
  } catch {
    storageOK = false;
    const statusEl = document.getElementById('storage-status');
    if (statusEl) {
      statusEl.textContent = 'Speichern nicht verfügbar. Fortschritt bleibt nur bis zum Schließen.';
    }
  }
}

// Global redraw hooks for visualizers
let redrawTLU = () => {};
let redrawRBF = () => {};
let redrawFuncApprox = () => {};
let redrawLVQ = () => {};
let redrawHopfield = () => {};

// -------------------------------------------------------------
// KaTeX Auto-Render Helper with Retry Fallback
// -------------------------------------------------------------
function renderMath(node = document.body) {
  const tryRender = () => {
    if (window.renderMathInElement) {
      window.renderMathInElement(node, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        strict: 'ignore',
        trust: false
      });
      return true;
    }
    return false;
  };

  if (!tryRender()) {
    window.addEventListener('load', tryRender);
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryRender() || attempts > 12) {
        clearInterval(interval);
      }
    }, 200);
  }
}

// -------------------------------------------------------------
// Core Theory & Recall Data (8 Borgelt Key Formulas)
// -------------------------------------------------------------
const theoryEntries = [
  {
    id: 'tlu-hyperebene',
    module: 'task1',
    moduleTitle: 'Task 1: TLU Polygon',
    kind: 'Definition & Satz',
    title: 'Threshold Logic Unit (TLU) & Trennhyperebene',
    text: 'Ein TLU berechnet für Eingaben $\\vec{x} \\in \\mathbb{R}^n$, Gewichtsvektor $\\vec{w} \\in \\mathbb{R}^n$ und Schwellenwert $\\theta \\in \\mathbb{R}$: $y = 1$ falls $\\vec{w}^\\top \\vec{x} \\ge \\theta$, sonst $0$. Die Gleichung $\\vec{w}^\\top \\vec{x} = \\theta$ beschreibt eine $(n-1)$-dimensionale Trennhyperebene mit Normalenvektor $\\vec{w}$.',
    source: 'Borgelt Vorlesung · Folien 17, 21',
    checks: [
      'Normalenvektor w steht senkrecht auf der Trennebene und zeigt in den Halbraum der Klasse 1',
      'Schwellenwert θ bestimmt den Abstand der Hyperebene vom Ursprung',
      'Ungleichung wᵀx ≥ θ (Borgelt definiert ≥ für Klasse 1, < für Klasse 0)'
    ]
  },
  {
    id: 'tlu-convex-hull',
    module: 'task1',
    moduleTitle: 'Task 1: TLU Polygon',
    kind: 'Satz',
    title: 'Konvexe Hüllen & Lineare Separierbarkeit',
    text: 'Zwei endliche Punktmengen $P_1, P_2 \\subset \\mathbb{R}^n$ sind genau dann mit einer einzelnen TLU linear separierbar, wenn ihre konvexen Hüllen disjunkt sind: $\\text{conv}(P_1) \\cap \\text{conv}(P_2) = \\emptyset$.',
    source: 'Borgelt Vorlesung · Folien 26, 35',
    checks: [
      'Konvexe Hülle ist die kleinste konvexe Menge, die alle Punkte enthält',
      'Schnittmenge der konvexen Hüllen muss zwingend leer sein (disjunkt)',
      'Gegenbeispiel XOR: (0,0) und (1,1) schneiden sich in (0.5, 0.5) mit (1,0) und (0,1)'
    ]
  },
  {
    id: 'rbf-minkowski',
    module: 'task2',
    moduleTitle: 'Task 2: RBF Bowtie',
    kind: 'Definition',
    title: 'Minkowski-Distanzfamilie & Geometrische Formen',
    text: 'Die Minkowski-Distanz $d_k(\\vec{x}, \\vec{y}) = \\left(\\sum_{i=1}^n |x_i - y_i|^k\\right)^{\\frac{1}{k}}$ erzeugt für $k=1$ eine Raute ($L_1$), für $k=2$ einen Kreis ($L_2$) und für $k \\to \\infty$ ein achsenparalleles Quadrat ($L_\\infty: d_\\infty = \\max_i |x_i - y_i|$).',
    source: 'Borgelt Vorlesung · Folien 289, 333',
    checks: [
      'L₁ (Manhattan): Diagonale Kanten mit Steigung ±1',
      'L_∞ (Maximum): Achsenparallele vertikale und horizontale Kanten',
      'L₂ (Euklidisch): Rotationssymmetrische kreisrunde Aktivierungsflächen'
    ]
  },
  {
    id: 'rbf-linear-output',
    module: 'task2',
    moduleTitle: 'Task 2: RBF Bowtie',
    kind: 'Wichtige Definition',
    title: 'RBF Ausgangsneuron: Lineare Aktivierung',
    text: 'Die Aktivierungsfunktion der Ausgangsneuronen in einem RBF-Netzwerk ist stets eine lineare Funktion: $f_{\\text{act}}(\\text{net}_u, \\theta_u) = \\text{net}_u - \\theta_u$. Die Ausgangsfunktion ist die Identität $f_{\\text{out}}(a) = a$.',
    source: 'Borgelt Vorlesung · Folie 290',
    checks: [
      'Ausgangsaktivierung ist LINEAR, KEINE Sprung- oder Sigmoidfunktion',
      'Netzeingabe der Ausgabe ist die gewichtete Summe der Hidden-Aktivierungen: net = ∑ w_i · out_i',
      'Schwellenwert θ_out ist typischerweise 0'
    ]
  },
  {
    id: 'mlp-step-approx',
    module: 'task3',
    moduleTitle: 'Task 3: Funktionsapprox.',
    kind: 'Konstruktion & Satz',
    title: 'MLP-Approximation mit relativen Stufenhöhen',
    text: 'Eine beliebige stetige Funktion $f(x)$ wird auf $[a, b]$ durch ein 3-Schicht-MLP mit Schwellenwerten $\\theta_i = x_i$ und relativen Stufenhöhen $\\Delta y_i = y_i - y_{i-1}$ approximiert: $y = y_0 + \\sum_{i=1}^k \\Delta y_i \\cdot \\Theta(x - x_i)$ mit $y_0 = f(x_0)$.',
    source: 'Borgelt Vorlesung · Folie 100',
    checks: [
      'Startwert f(a) ist der Bias; die Ausgangsschwelle ist −f(a)',
      'Gewichte zum Ausgang sind relative Differenzen Δy_i = y_i - y_{i-1}',
      'Ermöglicht unabhängige Segmentjustierung ohne Kaskadeneffekte'
    ]
  },
  {
    id: 'lvq-rules',
    module: 'task4',
    moduleTitle: 'Task 4: LVQ & SOM',
    kind: 'Algorithmus',
    title: 'Learning Vector Quantization (LVQ) Update-Regeln',
    text: 'Für Eingabe $\\vec{x}$ und Gewinnervektor $\\vec{r}^* = \\arg\\min_r d(\\vec{x}, \\vec{r})$ gilt: Attraktion (gleiche Klasse): $\\vec{r}^{(\\text{new})} = \\vec{r}^{(\\text{old})} + \\eta (\\vec{x} - \\vec{r}^{(\\text{old})})$. Repulsion (ungleiche Klasse): $\\vec{r}^{(\\text{new})} = \\vec{r}^{(\\text{old})} - \\eta (\\vec{x} - \\vec{r}^{(\\text{old})})$.',
    source: 'Borgelt Vorlesung · Folie 336',
    checks: [
      'Nur der Gewinnervektor r* wird angepasst (Winner-Takes-All)',
      'Vektordifferenz ist (x - r), nicht (r - x)',
      'Bei nachfolgenden Datenpunkten derselben Epoche gilt der aktualisierte Vektor'
    ]
  },
  {
    id: 'som-neighborhood',
    module: 'task4',
    moduleTitle: 'Task 4: LVQ & SOM',
    kind: 'Algorithmus',
    title: 'Self-Organizing Maps (SOM) Nachbarschaftsfunktion',
    text: 'Das Update für alle Neuronen $u$ auf dem Gitter lautet: $\\vec{r}_u^{(\\text{new})} = \\vec{r}_u^{(\\text{old})} + \\eta \\cdot f_{\\text{nb}}(d_{\\text{neurons}}(u, u^*), \\sigma) \\cdot (\\vec{x} - \\vec{r}_u^{(\\text{old})})$ mit Gauß-Funktion $f_{\\text{nb}}(d, \\sigma) = e^{-\\frac{d^2}{2\\sigma^2}}$.',
    source: 'Borgelt Vorlesung · Folie 364',
    checks: [
      'Gitterabstand d wird im Neuronengitter gemessen (d=0 für Winner u*)',
      'Winner-Faktor: f_nb(0, σ) = e⁰ = 1 (volles Update mit η)',
      'Nachbarn werden proportional zur Gaußfunktion in Richtung x gezogen'
    ]
  },
  {
    id: 'hopfield-energy',
    module: 'task5',
    moduleTitle: 'Modul 05: Hopfield & Boltzmann',
    kind: 'Satz & Definition',
    title: 'Hopfield-Netzwerk: Energiefunktion & Konvergenz',
    text: 'Ein Hopfield-Netz mit symmetrischen Gewichten $w_{uv} = w_{vu}$ und Nullen auf der Diagonale ($w_{uu} = 0$) besitzt die Energiefunktion $E = -\\frac{1}{2} \\sum_{u \\ne v} w_{uv} s_u s_v + \\sum_u \\theta_u s_u$. Bei asynchroner Aktualisierung gilt $\\Delta E \\le 0$. Das Netz konvergiert garantiert in ein lokales oder globales Minimum (Attraktor).',
    source: 'Borgelt Vorlesung · Folie 388',
    checks: [
      'Hauptdiagonale w_uu = 0 (Neuronen sind nicht mit sich selbst verbunden)',
      'Symmetrische Gewichte w_uv = w_vu',
      'Asynchrone Updates verringern die Energie strikt oder halten sie konstant (keine Zyklen)'
    ]
  },
  {
    id: 'mlp-linear-collapse',
    module: 'task3',
    moduleTitle: 'Modul 02: MLP & Backprop',
    kind: 'Beweis & Satz',
    title: 'Kollaps linearer Multi-Layer Perceptrons',
    text: 'Hintereinanderausführung linearer Schichten ergibt wieder eine affine Transformation: $\\vec{\\text{out}}_{U_3} = \\mathbf{A}_{23}(\\mathbf{A}_{12}\\vec{\\text{out}}_{U_1} + \\vec{b}_{12}) + \\vec{b}_{23} = (\\mathbf{A}_{23}\\mathbf{A}_{12})\\vec{\\text{out}}_{U_1} + (\\mathbf{A}_{23}\\vec{b}_{12} + \\vec{b}_{23})$. Ein lineares MLP besitzt keine höhere Rechenkraft als ein 1-Schicht-Perzeptron.',
    source: 'Borgelt Vorlesung · Folie 90–93',
    checks: [
      'Lineare Schichten entsprechen affinen Abbildungen y = Ax + b',
      'Komposition affiner Abbildungen ist wieder affin',
      'Nichtlineare Aktivierungsfunktionen in Hidden Layers sind unersetzlich'
    ]
  },
  {
    id: 'hornik-approx',
    module: 'task3',
    moduleTitle: 'Modul 02: MLP & Backprop',
    kind: 'Satz',
    title: 'Universeller Approximationssatz (Hornik 1989)',
    text: 'Jede stetige Funktion auf einer kompakten Teilmenge des $\\mathbb{R}^n$ kann durch ein 3-Schicht-MLP mit einer verdeckten Schicht und nichtlinearen Sigmoid-Aktivierungen mit beliebiger Genauigkeit approximiert werden.',
    source: 'Borgelt Vorlesung · Folie 97',
    checks: [
      'Gilt für stetige Funktionen auf kompakten Mengen',
      'Bereits eine einzige verdeckte Schicht genügt als universeller Approximator',
      'Macht keine Aussage über die Anzahl der benötigten Neuronen'
    ]
  },
  {
    id: 'delta-rule',
    module: 'task1',
    moduleTitle: 'Modul 01: TLU Polygon',
    kind: 'Algorithmus',
    title: 'Delta-Regel für Threshold Logic Units',
    text: 'Für Fehler $e = o - y$ gilt: Schwellenwert-Update $\\Delta \\theta = -\\eta e$, Gewichts-Update $\\Delta w_i = \\eta e x_i$. Online: Sofortiges Update nach jedem Muster. Batch: Akkumulation $\\theta_c = \\sum \\Delta \\theta, \\vec{w}_c = \\sum \\Delta \\vec{w}$, Update erst am Epochenende.',
    source: 'Borgelt Vorlesung · Folie 44–45',
    checks: [
      'Fehler e = gewünschte Ausgabe o minus tatsächliche Ausgabe y',
      'Schwellenwert-Änderung hat negatives Vorzeichen: Δθ = -η · e',
      'Online aktualisiert pro Muster; Batch akkumuliert über die gesamte Epoche'
    ]
  },
  {
    id: 'backprop-factors',
    module: 'task3',
    moduleTitle: 'Modul 02: MLP & Backprop',
    kind: 'Algorithmus',
    title: 'Backpropagation Fehlerfaktoren & Gradienten',
    text: 'Ausgabe-Fehlerfaktor $\\delta_v = (o_v - \\text{out}_v) \\cdot \\text{out}_v (1 - \\text{out}_v)$. Hidden-Fehlerfaktor $\\delta_u = \\left(\\sum_s \\delta_s w_{su}\\right) \\cdot \\text{out}_u (1 - \\text{out}_u)$. Updates: $\\Delta w_{up} = \\eta \\delta_u \\text{out}_p$, $\\Delta \\theta_u = -\\eta \\delta_u$.',
    source: 'Borgelt Vorlesung · Folie 183',
    checks: [
      'Ableitung der logistischen Funktion: out · (1 - out)',
      'Hidden-Neuronen gewichten die Fehlerfaktoren der Folgeschicht mit w_su',
      'Schwellenwert-Update Δθ_u = -η · δ_u'
    ]
  },
  {
    id: 'cmeans-algorithm',
    module: 'task2',
    moduleTitle: 'Modul 03: RBF & Bowtie',
    kind: 'Algorithmus',
    title: 'c-Means Clustering (k-Means)',
    text: 'Zuordnung: $S_i = \\{\\vec{x}_j \\mid \\forall k \\ne i: d(\\vec{x}_j, \\vec{c}_i) \\le d(\\vec{x}_j, \\vec{c}_k)\\}$. Neue Zentren: $\\vec{c}_i = \\frac{1}{|S_i|} \\sum_{\\vec{x}_j \\in S_i} \\vec{x}_j$. Minimiert die Fehlerquadratsumme $J = \\sum_{i=1}^c \\sum_{\\vec{x} \\in S_i} \\|\\vec{x} - \\vec{c}_i\\|^2$.',
    source: 'Borgelt Vorlesung · Folie 310–314',
    checks: [
      'Punkte werden dem quadratisch nächsten Zentrum zugeordnet',
      'Neues Zentrum ist das arithmetische Mittel der zugeordneten Punkte',
      'Verfahren konvergiert, wenn sich die Zuordnungen in einem Schritt nicht mehr ändern'
    ]
  },
  {
    id: 'cnn-convolution',
    module: 'deeplearning',
    moduleTitle: 'Modul 06: Deep Learning & CNNs',
    kind: 'Definition & Formel',
    title: 'Diskrete 2D-Faltung & Feature Map Dimension',
    text: 'Diskrete Faltung: $s(i, j) = \\sum_m \\sum_n I(i\\cdot s + m, j\\cdot s + n) K(m, n)$. Feature Map Größe: $m = \\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor + 1$ für Eingabegröße $n$, Filter $k$, Padding $p$ und Stride $s$.',
    source: 'Borgelt Vorlesung · Folie 264–266',
    checks: [
      'Shrinkage ohne Padding: Reduktion um k-1 Pixel',
      'Same Padding mit p = (k-1)/2 erhält die Dimension bei s=1',
      'Max-Pooling nimmt Maximum im Fenster; Average-Pooling nimmt Mittelwert'
    ]
  },
  {
    id: 'metric-axioms',
    module: 'task2',
    moduleTitle: 'Modul 03: RBF-Netzwerke',
    kind: 'Definition & Satz',
    title: 'Metrik-Axiome & Minkowski-Distanzfamilie',
    text: 'Eine Funktion $d: \\mathbb{R}^n \\times \\mathbb{R}^n \\to \\mathbb{R}_0^+$ ist eine Metrik gdw. gilt: (1) Identität des Ununterscheidbaren: $d(\\vec{x}, \\vec{y}) = 0 \\iff \\vec{x} = \\vec{y}$, (2) Symmetrie: $d(\\vec{x}, \\vec{y}) = d(\\vec{y}, \\vec{x})$, (3) Dreiecksungleichung: $d(\\vec{x}, \\vec{z}) \\le d(\\vec{x}, \\vec{y}) + d(\\vec{y}, \\vec{z})$. Die Minkowski-Familie $L_k = (\\sum_{i=1}^n |x_i - y_i|^k)^{1/k}$ erfüllt alle drei Axiome.',
    source: 'Borgelt Vorlesung · Folien 288–289, 332',
    checks: [
      'Metrik bildet ℝⁿ × ℝⁿ auf nicht-negative reelle Zahlen ab',
      'Dreiecksungleichung d(x,z) ≤ d(x,y) + d(y,z) muss für alle x, y, z gelten',
      'Metriken sind weder transitiv noch assoziativ'
    ]
  },
  {
    id: 'hopfield-hebb',
    module: 'task5',
    moduleTitle: 'Modul 05: Hopfield & Boltzmann',
    kind: 'Satz & Algorithmus',
    title: 'Hebbsche Lernregel & Speicherkapazität',
    text: 'Hebbsche Lernregel für $m$ Muster $\\vec{s}^{(p)} \\in \\{-1, +1\\}^n$: $w_{uv} = \\sum_{p=1}^m s_u^{(p)} s_v^{(p)}$ für $u \\ne v$, und $w_{uu} = 0$. Die theoretische Speicherkapazität beträgt $m_{\\max} = \\frac{n}{2\\ln n} \\approx 0.14 n$. Werden mehr Muster gespeichert, treten unechte Zustände (Spurious States) auf.',
    source: 'Borgelt Vorlesung · Folien 383–386',
    checks: [
      'Diagonale w_uu = 0 wird auch bei Hebbscher Regel erzwungen',
      'Symmetrie w_uv = w_vu ist durch Produkt s_u · s_v automatisch gegeben',
      'Maximale Kapazität ist linear in der Neuronenzahl n (ca. 14% von n)'
    ]
  },
  {
    id: 'fuzzy-defuzz',
    module: 'deeplearning',
    moduleTitle: 'Modul 06: Deep Learning & CNNs',
    kind: 'Definition & Formel',
    title: 'Fuzzy-Defuzzifizierung: COG & MOM',
    text: 'Center of Gravity (Schwerpunkt): $y_{\\text{COG}} = \\frac{\\int y \\mu(y) dy}{\\int \\mu(y) dy} = \\frac{\\sum y_i \\mu(y_i)}{\\sum \\mu(y_i)}$. Mean of Maxima: $y_{\\text{MOM}} = \\frac{a+b}{2}$ für maximales Plateau $[a, b]$. Mamdani erfordert Defuzzifizierung; TSK berechnet direkt das gewichtete Mittel.',
    source: 'Borgelt Vorlesung · Folie 474–478',
    checks: [
      'COG berechnet den physikalischen Flächenschwerpunkt der Ausgabemenge',
      'MOM nimmt den Mittelwert des Intervalls mit maximalem Zugehörigkeitsgrad',
      'TSK-Regler liefert scharfe Konklusionen y_i, keine geometrische Defuzzifizierung nötig'
    ]
  }
];

// -------------------------------------------------------------
// DOMContentLoaded Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  installCorrections();
  installCourse();
  installLearningLabs();
  initTheme();
  initRoutingAndNavigation();
  initSubtabs();
  renderFocusPagers();
  initTask1TLU();
  initTask2RBF();
  initTask3FuncApprox();
  initTask4LVQ_SOM();
  initTask5Hopfield();
  initDeepLearningCNN();
  initTheoryQuiz();
  initRecallEngine();
  initStudyExam();
  initStudyStateAndTools();
  renderMath();
});

// -------------------------------------------------------------
// 1. Routing & Navigation (Hash-Based with Subtab Support)
// -------------------------------------------------------------
const moduleTitles = {
  'overview': 'Lernplan & Klausur-Strategie',
  'task1': 'Modul 01: Grundlagen & TLU',
  'task3': 'Modul 02: MLP & Backprop',
  'task2': 'Modul 03: RBF-Netzwerke',
  'task4': 'Modul 04: LVQ & SOM',
  'task5': 'Modul 05: Hopfield & Boltzmann',
  'deeplearning': 'Modul 06: CNNs & Deep Learning',
  'task6': 'Modul 07: MCQ Exam Trainer',
  'abfragen': 'Modul 08: Sätze & Formeln abfragen',
  'klausur': 'Modul 09: 120-Minuten Klausurtraining',
  'cheatsheet': 'Modul 10: Klausur-Spickzettel'
};

const tabAliases = {
  'tlu': 'task1',
  'mlp': 'task3',
  'rbf': 'task2',
  'lvq': 'task4',
  'hopfield': 'task5',
  'cnn': 'deeplearning',
  'mcq': 'task6'
};

const defaultSubtabs = {
  'task1': 'intuition',
  'task3': 'intuition',
  'task2': 'intuition',
  'task4': 'intuition',
  'task5': 'intuition',
  'deeplearning': 'cnn'
};

const moduleSubtabs = {
  'task1': [
    { id: 'intuition', title: 'Intuition & Anschauung' },
    { id: 'theorie', title: 'Borgelt-Theorie' },
    { id: 'vis', title: 'Interaktive Grafik' },
    { id: 'recipe', title: 'Schritt-für-Schritt Anleitung' },
    { id: 'solution', title: 'Musterlösung' },
    { id: 'variation', title: 'Prüfungsvariation A: Delta-Regel' }
  ],
  'task3': [
    { id: 'intuition', title: 'Intuition & Anschauung' },
    { id: 'theorie', title: 'Borgelt-Theorie' },
    { id: 'vis', title: 'Interaktive Grafik' },
    { id: 'table', title: 'Stützstellen-Tabelle' },
    { id: 'recipe', title: 'Schritt-für-Schritt Anleitung' },
    { id: 'solution', title: 'Musterlösung' },
    { id: 'variation', title: 'Prüfungsvariation B: Backprop per Hand' }
  ],
  'task2': [
    { id: 'intuition', title: 'Intuition & Anschauung' },
    { id: 'theorie', title: 'Borgelt-Theorie' },
    { id: 'vis', title: 'Interaktive Grafik' },
    { id: 'recipe', title: 'Schritt-für-Schritt Anleitung' },
    { id: 'solution', title: 'Musterlösung' },
    { id: 'variation', title: 'Prüfungsvariation C: c-Means per Hand' }
  ],
  'task4': [
    { id: 'intuition', title: 'Intuition & Anschauung' },
    { id: 'theorie', title: 'Borgelt-Theorie' },
    { id: 'vis', title: 'Interaktiver Simulator' },
    { id: 'recipe', title: 'Schritt-für-Schritt Anleitung' },
    { id: 'solution', title: 'Musterlösung' }
  ],
  'task5': [
    { id: 'intuition', title: 'Intuition & Anschauung' },
    { id: 'theorie', title: 'Borgelt-Theorie' },
    { id: 'vis', title: 'Interaktiver Graph' },
    { id: 'table', title: 'Zustandstabelle' },
    { id: 'recipe', title: 'Schritt-für-Schritt Anleitung' }
  ],
  'deeplearning': [
    { id: 'cnn', title: 'Prüfungsvariation D: CNN 2D-Faltung & Pooling' },
    { id: 'gradient', title: 'Gradienten & ReLUs' },
    { id: 'fuzzy', title: 'Prüfungsvariation E: Fuzzy-Regler (COG & MOM)' },
    { id: 'optimizers', title: 'Optimierer & Momentum' }
  ]
};

const moduleNextMap = {
  'task1': { tab: 'task3', title: 'Modul 02: MLP & Backprop' },
  'task3': { tab: 'task2', title: 'Modul 03: RBF-Netzwerke' },
  'task2': { tab: 'task4', title: 'Modul 04: LVQ & SOM' },
  'task4': { tab: 'task5', title: 'Modul 05: Hopfield & Boltzmann' },
  'task5': { tab: 'deeplearning', title: 'Modul 06: CNNs & Deep Learning' },
  'deeplearning': { tab: 'task6', title: 'Modul 07: MCQ Exam Trainer' }
};

const modulePrevMap = {
  'task1': { tab: 'overview', title: 'Lernplan & Strategie' },
  'task3': { tab: 'task1', title: 'Modul 01: Grundlagen & TLU' },
  'task2': { tab: 'task3', title: 'Modul 02: MLP & Backprop' },
  'task4': { tab: 'task2', title: 'Modul 03: RBF-Netzwerke' },
  'task5': { tab: 'task4', title: 'Modul 04: LVQ & SOM' },
  'deeplearning': { tab: 'task5', title: 'Modul 05: Hopfield & Boltzmann' }
};

function renderFocusPagers() {
  Object.keys(moduleSubtabs).forEach(taskId => {
    const section = document.getElementById(`module-${taskId}`);
    if (!section) return;
    const subtabs = moduleSubtabs[taskId];
    const total = subtabs.length;
    const prevMod = modulePrevMap[taskId] || { tab: 'overview', title: 'Lernplan & Strategie' };
    const nextMod = moduleNextMap[taskId] || { tab: 'overview', title: 'Lernplan & Strategie' };

    subtabs.forEach((st, idx) => {
      const contentEl = section.querySelector(`.subtab-content[data-section="${st.id}"]`);
      if (!contentEl) return;

      const existing = contentEl.querySelector('.focus-pager');
      if (existing) existing.remove();

      let prevHref = '';
      let prevAttrs = '';
      let prevLabel = '';
      if (idx > 0) {
        prevHref = `#/${taskId}/${subtabs[idx - 1].id}`;
        prevAttrs = `data-tab="${taskId}" data-subtab="${subtabs[idx - 1].id}"`;
        prevLabel = `← Zurück: ${subtabs[idx - 1].title}`;
      } else {
        prevHref = `#/${prevMod.tab}`;
        prevAttrs = `data-tab="${prevMod.tab}"`;
        prevLabel = `← Zurück: ${prevMod.title}`;
      }

      let nextHref = '';
      let nextAttrs = '';
      let nextLabel = '';
      if (idx < total - 1) {
        nextHref = `#/${taskId}/${subtabs[idx + 1].id}`;
        nextAttrs = `data-tab="${taskId}" data-subtab="${subtabs[idx + 1].id}"`;
        nextLabel = `Weiter: ${subtabs[idx + 1].title} →`;
      } else {
        nextHref = `#/${nextMod.tab}`;
        nextAttrs = `data-tab="${nextMod.tab}"`;
        nextLabel = `Weiter zu ${nextMod.title} →`;
      }

      const pager = document.createElement('div');
      pager.className = 'focus-pager';
      pager.innerHTML = `
        <a href="${prevHref}" ${prevAttrs} class="button-link">${prevLabel}</a>
        <span class="meta">Schritt ${idx + 1} von ${total} · ${st.title}</span>
        <a href="${nextHref}" ${nextAttrs} class="button-link primary">${nextLabel}</a>
      `;

      if (idx < total - 1) {
        contentEl.appendChild(pager);
      } else {
        const footerEl = section.querySelector('.module-footer-pager');
        if (footerEl) {
          footerEl.innerHTML = '';
          footerEl.appendChild(pager);
        } else {
          contentEl.appendChild(pager);
        }
      }
    });

    let allPager = section.querySelector('.all-completion-pager');
    if (!allPager) {
      allPager = document.createElement('div');
      allPager.className = 'focus-pager all-completion-pager';
      allPager.style.display = 'none';
      allPager.innerHTML = `
        <a href="#/${prevMod.tab}" data-tab="${prevMod.tab}" class="button-link">← Zurück: ${prevMod.title}</a>
        <span class="meta">Alle ${total} Ansichten abgeschlossen</span>
        <a href="#/${nextMod.tab}" data-tab="${nextMod.tab}" class="button-link primary">Weiter zu ${nextMod.title} →</a>
      `;
      const footerEl = section.querySelector('.module-footer-pager');
      if (footerEl && footerEl.parentNode) {
        footerEl.parentNode.insertBefore(allPager, footerEl.nextSibling);
      } else {
        section.appendChild(allPager);
      }
    }
  });
}

function initRoutingAndNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.module-section');
  const breadcrumbEl = document.getElementById('breadcrumb-text');

  function navigateTo(targetTab, targetSubtab = null, updateHash = true) {
    if (tabAliases[targetTab]) {
      targetTab = tabAliases[targetTab];
    }
    if (!targetTab || !moduleTitles[targetTab]) {
      targetTab = 'overview';
    }

    // Default to first focused subtab if none specified
    if (!targetSubtab && defaultSubtabs[targetTab]) {
      targetSubtab = defaultSubtabs[targetTab];
    }

    // Update state last visited module
    if (targetTab.startsWith('task') || courseModules.some(m => m.id === targetTab)) {
      state.last = targetTab;
      saveState();
    }

    // Update active class on nav items
    navItems.forEach(n => {
      if (n.getAttribute('data-tab') === targetTab) {
        n.classList.add('active');
        n.setAttribute('aria-current', 'page');
      } else {
        n.classList.remove('active');
        n.removeAttribute('aria-current');
      }
    });

    // Show active section, hide others
    sections.forEach(s => {
      if (s.id === `module-${targetTab}`) {
        s.style.display = 'block';
      } else {
        s.style.display = 'none';
      }
    });

    // Update Breadcrumb & Document Title
    if (breadcrumbEl) {
      breadcrumbEl.textContent = moduleTitles[targetTab] || 'Lernplan';
    }
    document.title = `${moduleTitles[targetTab] || 'ANN'} | Borgelt Klausur`;

    // Apply subtab if module has subtabs
    const moduleSection = document.getElementById(`module-${targetTab}`);
    if (moduleSection) {
      const tabBar = moduleSection.querySelector('.tabs[data-task]');
      if (tabBar) {
        const buttons = tabBar.querySelectorAll('button[data-subtab], a[data-subtab]');
        const contents = moduleSection.querySelectorAll('.subtab-content');
        const requested = targetSubtab || defaultSubtabs[targetTab] || 'all';
        const activeSubtab = requested === 'all' || (moduleSubtabs[targetTab] || []).some(s => s.id === requested) ? requested : defaultSubtabs[targetTab];
        const subtabs = moduleSubtabs[targetTab];
        const lastSubtabId = subtabs ? subtabs[subtabs.length - 1].id : null;
        const isLastSubtab = (activeSubtab === lastSubtabId);

        buttons.forEach(btn => {
          if (btn.getAttribute('data-subtab') === activeSubtab) {
            btn.classList.add('active');
            btn.setAttribute('aria-current', 'page');
            try {
              btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            } catch {}
          } else {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
          }
        });

        const notesPanel = moduleSection.querySelector('.notes-panel');
        const footerPager = moduleSection.querySelector('.module-footer-pager');
        const allPager = moduleSection.querySelector('.all-completion-pager');

        if (activeSubtab === 'all') {
          contents.forEach(c => c.style.display = 'block');
          moduleSection.classList.add('all-mode');
          if (notesPanel) notesPanel.style.display = 'block';
          if (footerPager) footerPager.style.display = 'none';
          if (allPager) allPager.style.display = 'flex';
        } else {
          moduleSection.classList.remove('all-mode');
          contents.forEach(c => {
            c.style.display = (c.getAttribute('data-section') === activeSubtab) ? 'block' : 'none';
          });
          if (notesPanel) notesPanel.style.display = isLastSubtab ? 'block' : 'none';
          if (footerPager) footerPager.style.display = isLastSubtab ? 'flex' : 'none';
          if (allPager) allPager.style.display = 'none';
        }
      }
    }

    // Sync URL Hash cleanly
    if (updateHash) {
      let targetHash = targetTab === 'overview' ? '#/' : `#/${targetTab}`;
      if (targetSubtab && targetSubtab !== 'all') {
        targetHash += `/${targetSubtab}`;
      }
      if (location.hash !== targetHash) {
        history.pushState(null, '', targetHash);
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.getElementById('main');
    if (mainEl) mainEl.scrollTop = 0;
    renderMath(moduleSection || document.body);

    // Trigger visualizer redraws
    setTimeout(() => {
      if (targetTab === 'task1') redrawTLU();
      if (targetTab === 'task2') redrawRBF();
      if (targetTab === 'task3') redrawFuncApprox();
      if (targetTab === 'task4') redrawLVQ();
      if (targetTab === 'task5') redrawHopfield();
    }, 40);

    updateOverviewProgress();
  }

  // Handle URL Hash changes (supports #/task1/vis, #/abfragen, etc.)
  function handleHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const targetTab = parts[0] || 'overview';
    const targetSubtab = parts[1] || null;
    navigateTo(targetTab, targetSubtab, false);
  }

  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', handleHash);

  // Attach click listeners to all navigational links & buttons
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-tab], [data-subtab], a[href^="#/"]');
    if (link) {
      let targetTab = link.getAttribute('data-tab');
      let targetSubtab = link.getAttribute('data-subtab') || null;

      const href=link.getAttribute('href')||'';
      if(!targetTab&&href.startsWith('#/')) {
        const parts=href.slice(2).split('/').filter(Boolean);
        targetTab=parts[0]||'overview';
        targetSubtab=targetSubtab||parts[1]||null;
      }
      if(!targetTab) {
        const parentNav=link.closest('.tabs[data-task]');
        const parentSection=link.closest('.module-section');
        targetTab=parentNav?.getAttribute('data-task')||parentSection?.id.replace('module-','');
      }

      if (targetTab) {
        e.preventDefault();
        navigateTo(targetTab, targetSubtab, true);
      }
    }
  });

  // Initial Route
  handleHash();
}

// -------------------------------------------------------------
// 2. Subtabs within Tasks (Underline Style & Hash Sync)
// -------------------------------------------------------------
function initSubtabs() {
  // Subtab clicks are handled once by the delegated routing listener.
}

// -------------------------------------------------------------
// 3. Theme Toggler
// -------------------------------------------------------------
function initTheme() {
  const btn = document.getElementById('themeToggleBtn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let savedTheme = prefersDark ? 'dark' : 'light';
  try { savedTheme = localStorage.getItem('ann_theme') || savedTheme; } catch {}

  document.documentElement.setAttribute('data-theme', savedTheme);
  if (btn) btn.textContent = savedTheme === 'dark' ? 'Light' : 'Dark';

  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ann_theme', next); } catch {}
      btn.textContent = next === 'dark' ? 'Light' : 'Dark';

      redrawTLU();
      redrawRBF();
      redrawFuncApprox();
      redrawLVQ();
      redrawHopfield();
    });
  }
}

// -------------------------------------------------------------
// 4. Study State, Checkboxes, Notes & Tools
// -------------------------------------------------------------
function initStudyStateAndTools() {
  // Bind [data-known] checkboxes
  document.querySelectorAll('[data-known]').forEach(cb => {
    const id = cb.getAttribute('data-known');
    cb.checked = Boolean(state.known[id]);

    cb.addEventListener('change', () => {
      state.known[id] = cb.checked;
      saveState();
      updateOverviewProgress();
    });
  });

  // Bind [data-note] textareas
  document.querySelectorAll('[data-note]').forEach(ta => {
    const id = ta.getAttribute('data-note');
    if (state.notes[id]) {
      ta.value = state.notes[id];
    }

    ta.addEventListener('input', () => {
      state.notes[id] = ta.value;
      saveState();
    });
  });

  // Export State Button
  const exportBtn = document.getElementById('export-state-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const payload = {
        version: 2,
        course: 'Borgelt ANN & Deep Learning',
        exportedAt: new Date().toISOString(),
        state: state
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ann-borgelt-lernstand.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  // Import State Input
  const importInput = document.getElementById('import-state-input');
  const importStatus = document.getElementById('import-status-text');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2000000) throw new Error('Datei zu groß (max. 2 MB).');
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== 'object' || !data.state) {
          throw new Error('Ungültiges Lernstand-Format.');
        }

        const t = data.state;
        if (t.known && typeof t.known === 'object') state.known = t.known;
        if (t.done && typeof t.done === 'object') state.done = t.done;
        if (t.notes && typeof t.notes === 'object') state.notes = t.notes;
        if (t.scores && typeof t.scores === 'object') state.scores = t.scores;
        if (t.mcqAnswers && typeof t.mcqAnswers === 'object') state.mcqAnswers = t.mcqAnswers;
        if (t.last) state.last = t.last;
        state.exam = t.exam || null;
        if (Array.isArray(t.examHistory)) state.examHistory = t.examHistory;

        saveState();

        // Update DOM
        document.querySelectorAll('[data-known]').forEach(cb => {
          const id = cb.getAttribute('data-known');
          cb.checked = Boolean(state.known[id]);
        });
        document.querySelectorAll('[data-note]').forEach(ta => {
          const id = ta.getAttribute('data-note');
          ta.value = state.notes[id] || '';
        });

        updateOverviewProgress();

        if (importStatus) {
          importStatus.textContent = 'Lernstand erfolgreich importiert!';
          importStatus.style.color = 'var(--good)';
        }
        window.location.reload();
      } catch (err) {
        if (importStatus) {
          importStatus.textContent = `Fehler beim Import: ${err.message}`;
          importStatus.style.color = 'var(--danger)';
        }
      }
    });
  }

  // Reset State Button
  const resetBtn = document.getElementById('reset-state-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Möchtest du deinen gesamten Lernstand wirklich zurücksetzen? Alle Notizen, Testergebnisse und Häkchen werden gelöscht.')) {
        state = { known: {}, done: {}, notes: {}, scores: {}, mcqAnswers: {}, last: 'regression' };
        saveState();

        document.querySelectorAll('[data-known]').forEach(cb => { cb.checked = false; });
        document.querySelectorAll('[data-note]').forEach(ta => { ta.value = ''; });

        updateOverviewProgress();
        if (importStatus) {
          importStatus.textContent = 'Lernstand wurde zurückgesetzt.';
          importStatus.style.color = 'var(--muted)';
        }
        window.location.reload();
      }
    });
  }

  updateOverviewProgress();
}

// Update Topbar and Overview Progress (Analysis 2B Style)
function updateOverviewProgress() {
  const taskIds = [...courseModules.map(m => m.id), 'task1', 'task3', 'task2', 'task4', 'task5', 'deeplearning', 'task6', 'abfragen', 'klausur', 'cheatsheet'];
  const solvedCount = taskIds.filter(id => state.known[id]).length;
  const totalCount = taskIds.length;
  const percent = Math.round((solvedCount / totalCount) * 100);

  // Topbar progress badge / link
  const knownTheories = theoryEntries.filter(t => state.known[t.id]).length;
  const topbarBadge = document.getElementById('topbar-progress-badge');
  if (topbarBadge) {
    topbarBadge.textContent = `${knownTheories} / ${theoryEntries.length} Formeln sicher`;
  }

  // Overview progress bar & text
  const overviewText = document.getElementById('overview-progress-text');
  const overviewBar = document.getElementById('overview-progress-bar');
  if (overviewText) {
    overviewText.textContent = `${solvedCount} von ${totalCount} Modulen gemeistert`;
  }
  if (overviewBar) {
    overviewBar.style.width = `${percent}%`;
  }

  // Overview resume module card
  const resumeTitle = document.getElementById('overview-resume-title');
  const resumeBtn = document.getElementById('overview-resume-btn');
  const firstUnsolved = taskIds.find(id => !state.known[id]) || state.last || 'task1';

  if (resumeTitle) {
    const taskNameMap = {
      'task1': 'Modul 01: Grundlagen & TLU',
      'task3': 'Modul 02: MLP & Backprop',
      'task2': 'Modul 03: RBF-Netzwerke',
      'task4': 'Modul 04: LVQ & SOM',
      'task5': 'Modul 05: Hopfield & Boltzmann',
      'deeplearning': 'Modul 06: CNNs & Deep Learning',
      'task6': 'Modul 07: MCQ Exam Trainer',
      'abfragen': 'Modul 08: Sätze & Formeln abfragen',
      'klausur': 'Modul 09: 120-Minuten Klausurtraining',
      'cheatsheet': 'Modul 10: Klausur-Spickzettel'
    };
    resumeTitle.textContent = `Weiterlernen: ${moduleTitles[firstUnsolved] || taskNameMap[firstUnsolved] || 'Regression'}`;
  }
  if (resumeBtn) {
    resumeBtn.setAttribute('href', `#/${firstUnsolved}`);
    resumeBtn.setAttribute('data-tab', firstUnsolved);
  }

  // Update badges in the overview module list
  taskIds.forEach(id => {
    const badge = document.getElementById(`badge-status-${id}`);
    if (badge) {
      if (state.known[id]) {
        badge.textContent = '✓ Gemeistert';
        badge.className = 'badge good';
      } else {
        let defaultBadge = courseModules.some(m => m.id === id) ? 'Grundlage' : 'Training';
        if (id === 'task6') defaultBadge = '30 P';
        else if (id === 'deeplearning') defaultBadge = 'Varianten';
        else if (id === 'abfragen') defaultBadge = 'Formeln';
        else if (id === 'klausur') defaultBadge = '120 Min';
        else if (id === 'cheatsheet') defaultBadge = 'Rezepte';

        badge.textContent = defaultBadge;
        badge.className = 'badge';
      }
    }
  });
}

// -------------------------------------------------------------
// 5. Task 1: TLU & Polygon Classification Visualizer
// -------------------------------------------------------------
function initTask1TLU() {
  const svg = document.getElementById('tluSvg');
  if (!svg) return;

  const decompBtns = document.querySelectorAll('#tluDecompToggle .toggle-btn');
  const evalBtn = document.getElementById('tluEvalBtn');
  const x1Input = document.getElementById('tluTestX1');
  const x2Input = document.getElementById('tluTestX2');
  const liveOutput = document.getElementById('tluLiveOutput');

  let currentDecomp = 'vertical';
  let testPoint = { x: 2.5, y: 3.5 };

  decompBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      decompBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDecomp = btn.getAttribute('data-decomp');
      drawTLUSvg();
    });
  });

  if (evalBtn) {
    evalBtn.addEventListener('click', () => {
      testPoint.x = parseFloat(x1Input.value) || 0;
      testPoint.y = parseFloat(x2Input.value) || 0;
      drawTLUSvg();
    });
  }

  // Coordinate mapper: math (0..5, 0..5) -> SVG (50..410, 370..50)
  const originX = 50, originY = 370, scaleX = 72, scaleY = 64;
  function toSvgX(x) { return originX + x * scaleX; }
  function toSvgY(y) { return originY - y * scaleY; }

  function isInsidePolygon(px, py) {
    if (py > 4.0001) return false;
    if (currentDecomp === 'vertical') {
      const inT1 = (px <= 3.0001 && py <= 4.0001 && (px + 2 * py >= 8.999));
      const inT2 = (px >= 2.999 && py <= 4.0001 && (-3 * px + py >= -8.001));
      return inT1 || inT2;
    } else {
      const inT1 = (py <= 4.0001 && (px + 2 * py >= 8.999) && (-px + py >= -0.001));
      const inT2 = (px >= 2.999 && (px - py >= -0.001) && (-3 * px + py >= -8.001));
      return inT1 || inT2;
    }
  }

  function drawTLUSvg() {
    svg.innerHTML = '';

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#282e38' : '#e2e8f0';
    const axisColor = isDark ? '#9da7b3' : '#1e293b';
    const textColor = isDark ? '#9da7b3' : '#64748b';

    // Draw Grid & Axes
    let gridHtml = `
      <defs>
        <pattern id="gridPattern" width="${scaleX}" height="${scaleY}" patternUnits="userSpaceOnUse">
          <path d="M ${scaleX} 0 L 0 0 0 ${scaleY}" fill="none" stroke="${gridColor}" stroke-width="1"/>
        </pattern>
      </defs>
      <rect x="${originX}" y="${toSvgY(5)}" width="${5 * scaleX}" height="${5 * scaleY}" fill="url(#gridPattern)" />
      <line x1="${originX}" y1="${originY}" x2="${originX + 5.2 * scaleX}" y2="${originY}" stroke="${axisColor}" stroke-width="2"/>
      <line x1="${originX}" y1="${originY}" x2="${originX}" y2="${toSvgY(5.2)}" stroke="${axisColor}" stroke-width="2"/>
      <text x="${originX + 5.3 * scaleX}" y="${originY + 4}" font-size="12" font-weight="700" fill="${axisColor}">x₁</text>
      <text x="${originX - 6}" y="${toSvgY(5.3)}" font-size="12" font-weight="700" fill="${axisColor}">x₂</text>
    `;

    // Axis ticks
    for (let i = 0; i <= 5; i++) {
      gridHtml += `<line x1="${toSvgX(i)}" y1="${originY}" x2="${toSvgX(i)}" y2="${originY + 5}" stroke="${axisColor}" stroke-width="1.5"/>
      <text x="${toSvgX(i)}" y="${originY + 18}" font-size="11" text-anchor="middle" fill="${textColor}">${i}</text>`;
      if (i > 0) {
        gridHtml += `<line x1="${originX - 5}" y1="${toSvgY(i)}" x2="${originX}" y2="${toSvgY(i)}" stroke="${axisColor}" stroke-width="1.5"/>
        <text x="${originX - 12}" y="${toSvgY(i) + 4}" font-size="11" text-anchor="end" fill="${textColor}">${i}</text>`;
      }
    }

    // Polygon Vertices: A=(1,4), B=(4,4), C=(3,1), D=(3,3)
    const pA = `${toSvgX(1)},${toSvgY(4)}`;
    const pB = `${toSvgX(4)},${toSvgY(4)}`;
    const pC = `${toSvgX(3)},${toSvgY(1)}`;
    const pD = `${toSvgX(3)},${toSvgY(3)}`;

    let polyHtml = '';
    if (currentDecomp === 'vertical') {
      const pTopSplit = `${toSvgX(3)},${toSvgY(4)}`;
      polyHtml += `<polygon points="${pA} ${pTopSplit} ${pD}" fill="rgba(36, 76, 219, 0.35)" stroke="#244cdb" stroke-width="2"/>`;
      polyHtml += `<polygon points="${pTopSplit} ${pB} ${pC} ${pD}" fill="rgba(25, 115, 78, 0.35)" stroke="#19734e" stroke-width="2"/>`;
      polyHtml += `<line x1="${toSvgX(3)}" y1="${toSvgY(0.5)}" x2="${toSvgX(3)}" y2="${toSvgY(4.5)}" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="5,4"/>`;
      polyHtml += `<text x="${toSvgX(3) + 6}" y="${toSvgY(0.8)}" font-size="11" font-weight="bold" fill="#dc2626">L₄ / L₅: x₁ = 3</text>`;
    } else {
      polyHtml += `<polygon points="${pA} ${pB} ${pD}" fill="rgba(36, 76, 219, 0.35)" stroke="#244cdb" stroke-width="2"/>`;
      polyHtml += `<polygon points="${pD} ${pB} ${pC}" fill="rgba(25, 115, 78, 0.35)" stroke="#19734e" stroke-width="2"/>`;
      polyHtml += `<line x1="${toSvgX(2.2)}" y1="${toSvgY(2.2)}" x2="${toSvgX(4.5)}" y2="${toSvgY(4.5)}" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="5,4"/>`;
      polyHtml += `<text x="${toSvgX(3.7)}" y="${toSvgY(3.4)}" font-size="11" font-weight="bold" fill="#dc2626">L_diag: x₂ - x₁ = 0</text>`;
    }

    // Boundary lines
    polyHtml += `
      <line x1="${toSvgX(0.5)}" y1="${toSvgY(4)}" x2="${toSvgX(4.5)}" y2="${toSvgY(4)}" stroke="#475569" stroke-width="1.5"/>
      <text x="${toSvgX(4.5) + 4}" y="${toSvgY(4) + 4}" font-size="10.5" fill="#475569">L₁: x₂ = 4</text>
      <line x1="${toSvgX(0.5)}" y1="${toSvgY(4.25)}" x2="${toSvgX(3.5)}" y2="${toSvgY(2.75)}" stroke="#475569" stroke-width="1.5"/>
      <text x="${toSvgX(0.8)}" y="${toSvgY(4.35)}" font-size="10.5" fill="#475569">L₂: x₁+2x₂ = 9</text>
      <line x1="${toSvgX(2.8)}" y1="${toSvgY(0.4)}" x2="${toSvgX(4.2)}" y2="${toSvgY(4.6)}" stroke="#475569" stroke-width="1.5"/>
      <text x="${toSvgX(4.2) + 4}" y="${toSvgY(4.6)}" font-size="10.5" fill="#475569">L₃: 3x₁-x₂ = 8</text>
    `;

    // Vertices dots & labels
    const vertices = [
      { x: 1, y: 4, name: '(1,4)' },
      { x: 4, y: 4, name: '(4,4)' },
      { x: 3, y: 1, name: '(3,1)' },
      { x: 3, y: 3, name: '(3,3)' }
    ];
    let vertHtml = '';
    vertices.forEach(v => {
      vertHtml += `<circle cx="${toSvgX(v.x)}" cy="${toSvgY(v.y)}" r="4.5" fill="${axisColor}" stroke="#ffffff" stroke-width="1.5"/>
      <text x="${toSvgX(v.x) + (v.x === 1 ? -8 : 8)}" y="${toSvgY(v.y) + (v.x === 1 ? 12 : -6)}" font-size="11" font-weight="700" text-anchor="${v.x === 1 ? 'end' : 'start'}" fill="${axisColor}">${v.name}</text>`;
    });

    // Test point
    const inside = isInsidePolygon(testPoint.x, testPoint.y);
    const testColor = inside ? '#19734e' : '#b64636';
    const testDot = `
      <circle cx="${toSvgX(testPoint.x)}" cy="${toSvgY(testPoint.y)}" r="6.5" fill="${testColor}" stroke="#ffffff" stroke-width="2.5"/>
      <text x="${toSvgX(testPoint.x) + 8}" y="${toSvgY(testPoint.y) - 6}" font-size="12" font-weight="bold" fill="${testColor}">P(${testPoint.x}, ${testPoint.y})</text>
    `;

    svg.innerHTML = gridHtml + polyHtml + vertHtml + testDot;

    // Update Live Output
    if (liveOutput) {
      if (currentDecomp === 'vertical') {
        const l1 = testPoint.y <= 4 ? 1 : 0;
        const l2 = (testPoint.x + 2 * testPoint.y >= 9) ? 1 : 0;
        const l3 = (-3 * testPoint.x + testPoint.y >= -8) ? 1 : 0;
        const l4 = testPoint.x <= 3 ? 1 : 0;
        const l5 = testPoint.x >= 3 ? 1 : 0;
        const c1 = (l1 && l2 && l4) ? 1 : 0;
        const c2 = (l1 && l3 && l5) ? 1 : 0;
        const yOut = (c1 || c2) ? 1 : 0;

        liveOutput.innerHTML = `
          <strong>Signal-Propagation (Klausurschnitt $x_1 = 3$) für Punkt $P(${testPoint.x}, ${testPoint.y})$:</strong><br>
          &bull; <strong>Layer 1 (Halbebenen):</strong> $L_1(x_2 \\le 4) = ${l1}$, $L_2(x_1+2x_2 \\ge 9) = ${l2}$, $L_3(3x_1-x_2 \\le 8) = ${l3}$, $L_4(x_1 \\le 3) = ${l4}$, $L_5(x_1 \\ge 3) = ${l5}$<br>
          &bull; <strong>Layer 2 (Dreiecks-Konjunktionen):</strong> $C_1(T_1 = L_1 \\wedge L_2 \\wedge L_4) = \\mathbf{${c1}}$, $C_2(T_2 = L_1 \\wedge L_3 \\wedge L_5) = \\mathbf{${c2}}$<br>
          &bull; <strong>Layer 3 (Ausgangs-Disjunktion):</strong> $Y = C_1 \\vee C_2 = \\mathbf{${yOut}}$ &rarr; <span style="font-weight:700; color:${yOut ? 'var(--good)' : 'var(--danger)'};">${yOut ? 'PUNKT LIEGT IM INNEREN (Klasse +1)' : 'PUNKT LIEGT AUSSERHALB (Klasse 0)'}</span>
        `;
      } else {
        const l1 = testPoint.y <= 4 ? 1 : 0;
        const l2 = (testPoint.x + 2 * testPoint.y >= 9) ? 1 : 0;
        const l3 = (-3 * testPoint.x + testPoint.y >= -8) ? 1 : 0;
        const lDiag1 = (-testPoint.x + testPoint.y >= 0) ? 1 : 0;
        const lDiag2 = (testPoint.x - testPoint.y >= 0) ? 1 : 0;
        const lVert = (testPoint.x >= 3) ? 1 : 0;
        const c1 = (l1 && l2 && lDiag1) ? 1 : 0;
        const c2 = (lDiag2 && l3 && lVert) ? 1 : 0;
        const yOut = (c1 || c2) ? 1 : 0;

        liveOutput.innerHTML = `
          <strong>Signal-Propagation (Diagonalschnitt $x_2 = x_1$) für Punkt $P(${testPoint.x}, ${testPoint.y})$:</strong><br>
          &bull; <strong>Layer 1 (Halbebenen):</strong> $L_1(x_2 \\le 4) = ${l1}$, $L_2(x_1+2x_2 \\ge 9) = ${l2}$, $L_3(3x_1-x_2 \\le 8) = ${l3}$, $L_{\\text{diag1}}(x_2 - x_1 \\ge 0) = ${lDiag1}$, $L_{\\text{diag2}}(x_1 - x_2 \\ge 0) = ${lDiag2}$, $L_{\\text{vert}}(x_1 \\ge 3) = ${lVert}$<br>
          &bull; <strong>Layer 2 (Dreiecks-Konjunktionen):</strong> $C_1(T_1 = L_1 \\wedge L_2 \\wedge L_{\\text{diag1}}) = \\mathbf{${c1}}$, $C_2(T_2 = L_{\\text{diag2}} \\wedge L_3 \\wedge L_{\\text{vert}}) = \\mathbf{${c2}}$<br>
          &bull; <strong>Layer 3 (Ausgangs-Disjunktion):</strong> $Y = C_1 \\vee C_2 = \\mathbf{${yOut}}$ &rarr; <span style="font-weight:700; color:${yOut ? 'var(--good)' : 'var(--danger)'};">${yOut ? 'PUNKT LIEGT IM INNEREN (Klasse +1)' : 'PUNKT LIEGT AUSSERHALB (Klasse 0)'}</span>
        `;
      }
      renderMath(liveOutput);
    }
  }

  // Click on SVG to set test point
  svg.addEventListener('click', (e) => {
    const rect = svg.getBoundingClientRect();
    const scaleFactorX = 460 / rect.width;
    const scaleFactorY = 420 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleFactorX;
    const clickY = (e.clientY - rect.top) * scaleFactorY;

    const mathX = Math.round(((clickX - originX) / scaleX) * 10) / 10;
    const mathY = Math.round(((originY - clickY) / scaleY) * 10) / 10;

    if (mathX >= 0 && mathX <= 5 && mathY >= 0 && mathY <= 5) {
      testPoint.x = mathX;
      testPoint.y = mathY;
      if (x1Input) x1Input.value = mathX;
      if (x2Input) x2Input.value = mathY;
      drawTLUSvg();
    }
  });

  redrawTLU = drawTLUSvg;
  drawTLUSvg();
}

// -------------------------------------------------------------
// 6. Task 2: RBF Bowtie & Minkowski Norm Visualizer
// -------------------------------------------------------------
function initTask2RBF() {
  const canvas = document.getElementById('rbfCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('minkowskiSlider');
  const sliderVal = document.getElementById('minkowskiVal');
  const viewBtns = document.querySelectorAll('#rbfViewToggle .toggle-btn');
  const liveOutput = document.getElementById('rbfLiveOutput');

  let currentP = 1.0;
  let currentView = 'composite';

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.getAttribute('data-view');
      render();
    });
  });

  if (slider) {
    slider.addEventListener('input', () => {
      currentP = parseFloat(slider.value);
      if (sliderVal) {
        if (currentP >= 4.9) {
          sliderVal.textContent = '∞ (L_inf Quadrat)';
        } else if (Math.abs(currentP - 1.0) < 0.05) {
          sliderVal.textContent = '1.0 (L1 Raute)';
        } else if (Math.abs(currentP - 2.0) < 0.05) {
          sliderVal.textContent = '2.0 (L2 Kreis)';
        } else {
          sliderVal.textContent = currentP.toFixed(2);
        }
      }
      render();
    });
  }

  const originX = 50, originY = 370, scaleX = 80, scaleY = 80;
  function toCanvasX(x) { return originX + x * scaleX; }
  function toCanvasY(y) { return originY - y * scaleY; }

  function distMinkowski(x1, y1, x2, y2, p) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    if (p >= 4.9) {
      return Math.max(dx, dy);
    }
    return Math.pow(Math.pow(dx, p) + Math.pow(dy, p), 1 / p);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#282e38' : '#f1f5f9';
    const axisColor = isDark ? '#9da7b3' : '#1e293b';
    const textColor = isDark ? '#9da7b3' : '#64748b';

    // 1. Render Heatmap
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;
    const step = 2;

    for (let py = 0; py < canvas.height; py += step) {
      const mathY = (originY - py) / scaleY;
      if (mathY < 0 || mathY > 4.5) continue;

      for (let px = 0; px < canvas.width; px += step) {
        const mathX = (px - originX) / scaleX;
        if (mathX < 0 || mathX > 4.5) continue;

        const d1 = distMinkowski(mathX, mathY, 2, 2, currentP);
        const act1 = (d1 <= 1.0) ? 1 : 0;

        const d2 = distMinkowski(mathX, mathY, 1.5, 2.5, 5.0);
        const act2 = (d2 <= 0.5) ? 1 : 0;

        const d3 = distMinkowski(mathX, mathY, 2.5, 1.5, 5.0);
        const act3 = (d3 <= 0.5) ? 1 : 0;

        let outputVal = 0;
        if (currentView === 'composite') {
          outputVal = act1 * 1 - act2 * 1 - act3 * 1;
        } else if (currentView === 'diamond') {
          outputVal = act1;
        } else if (currentView === 'squares') {
          outputVal = (act2 || act3) ? -1 : 0;
        }

        let r = 0, g = 0, b = 0, a = 0;
        if (outputVal >= 1) {
          r = 36; g = 76; b = 219; a = 145; // Academic Cobalt
        } else if (outputVal === 0 && act1 === 1) {
          r = 239; g = 68; b = 68; a = 90;
        } else if (outputVal < 0) {
          r = 220; g = 38; b = 38; a = 60;
        }

        for (let dy = 0; dy < step; dy++) {
          for (let dx = 0; dx < step; dx++) {
            const idx = ((py + dy) * canvas.width + (px + dx)) * 4;
            if (idx < data.length) {
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 2. Draw Grid & Axes
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= 5; x++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), toCanvasY(0));
      ctx.lineTo(toCanvasX(x), toCanvasY(4.5));
      ctx.stroke();
    }
    for (let y = 0; y <= 4; y++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), toCanvasY(y));
      ctx.lineTo(toCanvasX(4.5), toCanvasY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(4.7), toCanvasY(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(4.7));
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    for (let x = 0; x <= 4; x++) {
      ctx.fillText(x, toCanvasX(x), toCanvasY(0) + 16);
    }
    ctx.textAlign = 'right';
    for (let y = 1; y <= 4; y++) {
      ctx.fillText(y, toCanvasX(0) - 8, toCanvasY(y) + 4);
    }

    // 3. Draw Bowtie target outlines
    ctx.strokeStyle = isDark ? '#58a6ff' : '#244cdb';
    ctx.lineWidth = 2.5;
    // Triangle 1
    ctx.beginPath();
    ctx.moveTo(toCanvasX(2), toCanvasY(2));
    ctx.lineTo(toCanvasX(2), toCanvasY(3));
    ctx.lineTo(toCanvasX(3), toCanvasY(2));
    ctx.closePath();
    ctx.stroke();

    // Triangle 2
    ctx.beginPath();
    ctx.moveTo(toCanvasX(2), toCanvasY(2));
    ctx.lineTo(toCanvasX(1), toCanvasY(2));
    ctx.lineTo(toCanvasX(2), toCanvasY(1));
    ctx.closePath();
    ctx.stroke();

    // 4. Draw RBF Centers
    const centers = [
      { x: 2, y: 2, label: 'c₁ (2,2) [L₁]', color: '#244cdb' },
      { x: 1.5, y: 2.5, label: 'c₂ (1.5, 2.5) [L_∞]', color: '#dc2626' },
      { x: 2.5, y: 1.5, label: 'c₃ (2.5, 1.5) [L_∞]', color: '#dc2626' }
    ];

    centers.forEach(c => {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(toCanvasX(c.x), toCanvasY(c.y), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = axisColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, toCanvasX(c.x) + 7, toCanvasY(c.y) - 4);
    });

    // Update live output text
    if (liveOutput) {
      liveOutput.innerHTML = `
        <strong>Ausgabe-Check (Norm $p = ${currentP >= 4.9 ? '\\infty' : currentP.toFixed(2)}$):</strong><br>
        &bull; <strong>Im schattierten Bereich:</strong> $\\text{net} = (+1) \\cdot 1 + (-1) \\cdot 0 + (-1) \\cdot 0 = \\mathbf{1} \\implies \\mathbf{y = 1}$.<br>
        &bull; <strong>In den abgezogenen weißen Ecken:</strong> $\\text{net} = (+1) \\cdot 1 + (-1) \\cdot 1 = \\mathbf{0} \\implies \\mathbf{y = 0 \\le 0}$.<br>
        &bull; <strong>Außerhalb der Raute:</strong> $v_1 = 0 \\implies \\text{net} \\le 0 \\implies \\mathbf{y \\le 0}$.
      `;
      renderMath(liveOutput);
    }
  }

  redrawRBF = render;
  render();
}

// -------------------------------------------------------------
// 7. Task 3: Function Approximation Visualizer
// -------------------------------------------------------------
function initTask3FuncApprox() {
  const canvas = document.getElementById('funcCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const modelBtns = document.querySelectorAll('#funcModelToggle .toggle-btn');
  const slider = document.getElementById('nodesSlider');
  const nodesVal = document.getElementById('nodesVal');

  let currentModel = 'mlp-step';
  let nodeCount = 10;

  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModel = btn.getAttribute('data-model');
      render();
    });
  });

  if (slider) {
    slider.addEventListener('input', () => {
      nodeCount = parseInt(slider.value, 10);
      if (nodesVal) nodesVal.textContent = nodeCount;
      render();
    });
  }

  function f(x) { return x * x + 2 * x + 2; }

  const originX = 50, originY = 300, scaleX = 48, scaleY = 9.5;
  function toCanvasX(x) { return originX + (x + 4.5) * scaleX; }
  function toCanvasY(y) { return originY - y * scaleY; }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#282e38' : '#e2e8f0';
    const axisColor = isDark ? '#9da7b3' : '#1e293b';
    const textColor = isDark ? '#9da7b3' : '#64748b';

    // Draw Grid & Axes
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = -4; x <= 4; x++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), toCanvasY(0));
      ctx.lineTo(toCanvasX(x), toCanvasY(28));
      ctx.stroke();
    }
    for (let y = 0; y <= 28; y += 5) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(-4.5), toCanvasY(y));
      ctx.lineTo(toCanvasX(4.5), toCanvasY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(-4.5), toCanvasY(0));
    ctx.lineTo(toCanvasX(4.7), toCanvasY(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(29));
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    for (let x = -4; x <= 4; x += 2) {
      ctx.fillText(x, toCanvasX(x), toCanvasY(0) + 16);
    }
    ctx.textAlign = 'right';
    for (let y = 5; y <= 25; y += 5) {
      ctx.fillText(y, toCanvasX(0) - 6, toCanvasY(y) + 4);
    }

    // 1. Draw True Function y = x^2 + 2x + 2
    ctx.strokeStyle = isDark ? '#f0f3f6' : '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = -4.0; x <= 4.0; x += 0.05) {
      const cx = toCanvasX(x);
      const cy = toCanvasY(f(x));
      if (x === -4.0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 2. Compute Neural Approximation
    const k = currentModel==='rbf-tri' ? nodeCount-3 : nodeCount-2;
    const dx = 8.0 / k;
    const knots = [];
    for (let i = 0; i <= k; i++) {
      knots.push(-4.0 + i * dx);
    }

    ctx.strokeStyle = '#244cdb';
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    if (currentModel === 'mlp-step') {
      for (let i = 0; i < k; i++) {
        const xStart = knots[i];
        const xEnd = knots[i + 1];
        const yVal = f(xStart);
        const cx1 = toCanvasX(xStart);
        const cx2 = toCanvasX(xEnd);
        const cy = toCanvasY(yVal);

        if (i === 0) ctx.moveTo(cx1, cy);
        else ctx.lineTo(cx1, cy);
        ctx.lineTo(cx2, cy);
      }
      ctx.lineTo(toCanvasX(4.0), toCanvasY(f(4.0)));
    } else if (currentModel === 'rbf-tri') {
      for (let i = 0; i <= k; i++) {
        const x = knots[i];
        const yVal = f(x);
        const cx = toCanvasX(x);
        const cy = toCanvasY(yVal);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Draw Knot Points
    ctx.fillStyle = '#dc2626';
    for (let i = 0; i <= k; i++) {
      const x = knots[i];
      const y = f(x);
      ctx.beginPath();
      ctx.arc(toCanvasX(x), toCanvasY(y), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  redrawFuncApprox = render;
  render();
}

// -------------------------------------------------------------
// 8. Task 4: LVQ & SOM Simulator
// -------------------------------------------------------------
function initTask4LVQ_SOM() {
  const canvas = document.getElementById('lvqSomCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const modeBtns = document.querySelectorAll('#lvqModeToggle .toggle-btn');
  const lvqControls = document.getElementById('lvqControls');
  const somControls = document.getElementById('somControls');
  const stepBtn = document.getElementById('lvqStepBtn');
  const resetBtn = document.getElementById('lvqResetBtn');
  const statusDiv = document.getElementById('lvqSomStatus');

  const somInputX = document.getElementById('somInputX');
  const somInputY = document.getElementById('somInputY');
  const somSigmaSlider = document.getElementById('somSigmaSlider');
  const somSigmaVal = document.getElementById('somSigmaVal');
  const somEtaSlider = document.getElementById('somEtaSlider');
  const somEtaVal = document.getElementById('somEtaVal');
  const somApplyBtn = document.getElementById('somApplyBtn');
  const somResetBtn = document.getElementById('somResetBtn');

  let currentMode = 'lvq';
  let stepIndex = 0;

  const initialR = {
    circ: { x: 5, y: 4, name: 'r_circ' },
    bull: { x: 7, y: 5, name: 'r_bull' }
  };
  let rCirc = { ...initialR.circ };
  let rBull = { ...initialR.bull };

  let somX = { x: 28, y: 20 };
  let somSigma = 2.0;
  let somEta = 0.5;

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');

      if (currentMode === 'lvq') {
        if (lvqControls) lvqControls.style.display = 'flex';
        if (somControls) somControls.style.display = 'none';
        stepIndex = 0;
        rCirc = { ...initialR.circ };
        rBull = { ...initialR.bull };
        if (statusDiv) statusDiv.innerHTML = `<strong>Status:</strong> Initialer Zustand. Bereit für Punkt $p=(1,6)$.`;
      } else {
        if (lvqControls) lvqControls.style.display = 'none';
        if (somControls) somControls.style.display = 'flex';
        updateSOMStatus();
      }
      render();
    });
  });

  const classMode=document.getElementById('lvqClassMode');
  if(classMode)classMode.addEventListener('change',()=>resetBtn.click());
  if (stepBtn) stepBtn.addEventListener('click',()=>{
    if(currentMode!=='lvq'||stepIndex>=2)return;
    const x=stepIndex===0?{x:1,y:6}:{x:9,y:1},supervised=classMode.value==='supervised';
    const old=[{...rCirc},{...rBull}],ds=old.map(r=>(r.x-x.x)**2+(r.y-x.y)**2),win=ds[0]<=ds[1]?0:1;
    const next=old.map((r,k)=>{if(!supervised&&k!==win)return r;const sign=supervised&&k!==stepIndex?-1:1;return {...r,x:r.x+sign*.5*(x.x-r.x),y:r.y+sign*.5*(x.y-r.y)};});
    [rCirc,rBull]=next;
    statusDiv.innerHTML=`<strong>Punkt ${stepIndex===0?'p (1,6), Klasse ○':'q (9,1), Klasse ●'}</strong><p>Quadrierte Abstände vor dem Update: ${ds[0]} (○), ${ds[1]} (●). Nächster: ${win===0?'○':'●'}.</p><p>${supervised?'Beide Prototypen werden aktualisiert: richtige Klasse anziehen, falsche Klasse abstoßen (Folie 340).':'Nur der nächste Prototyp wird angezogen (Folie 336).'}</p><p>Danach: r○ = (${rCirc.x}, ${rCirc.y}); r● = (${rBull.x}, ${rBull.y}).</p>`;
    stepIndex++;if(stepIndex===2)statusDiv.insertAdjacentHTML('beforeend','<p>Epoche abgeschlossen. Reset stellt beide Ausgangsprototypen wieder her.</p>');render();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stepIndex = 0;
      rCirc = { ...initialR.circ };
      rBull = { ...initialR.bull };
      if (statusDiv) statusDiv.innerHTML = `<strong>Status:</strong> Initialer Zustand. Bereit für Punkt $p=(1,6)$.`;
      render();
    });
  }

  // SOM Controls
  if (somSigmaSlider) {
    somSigmaSlider.addEventListener('input', () => {
      somSigma = parseFloat(somSigmaSlider.value);
      if (somSigmaVal) somSigmaVal.textContent = somSigma.toFixed(1);
      updateSOMStatus();
      render();
    });
  }
  if (somEtaSlider) {
    somEtaSlider.addEventListener('input', () => {
      somEta = parseFloat(somEtaSlider.value);
      if (somEtaVal) somEtaVal.textContent = somEta.toFixed(1);
      updateSOMStatus();
      render();
    });
  }
  if (somApplyBtn) {
    somApplyBtn.addEventListener('click', () => {
      somX.x = Math.max(0,Math.min(40,Number(somInputX.value)||0));
      somX.y = Math.max(0,Math.min(30,Number(somInputY.value)||0));
      updateSOMStatus();
      render();
    });
  }
  if (somResetBtn) {
    somResetBtn.addEventListener('click', () => {
      somX = { x: 28, y: 20 };
      if (somInputX) somInputX.value = 28;
      if (somInputY) somInputY.value = 20;
      somSigma = 2.0;
      if (somSigmaSlider) somSigmaSlider.value = 2.0;
      if (somSigmaVal) somSigmaVal.textContent = '2.0';
      somEta = 0.5;
      if (somEtaSlider) somEtaSlider.value = 0.5;
      if (somEtaVal) somEtaVal.textContent = '0.5';
      updateSOMStatus();
      render();
    });
  }

  canvas.addEventListener('click', (e) => {
    if (currentMode === 'som') {
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left)*canvas.width/rect.width;
      const clickY = (e.clientY - rect.top)*canvas.height/rect.height;
      const mathX = Math.round(((clickX - 45) / 440) * 40);
      const mathY = Math.round(((340 - clickY) / 300) * 30);
      if (mathX >= 0 && mathX <= 40 && mathY >= 0 && mathY <= 30) {
        somX.x = mathX;
        somX.y = mathY;
        if (somInputX) somInputX.value = mathX;
        if (somInputY) somInputY.value = mathY;
        updateSOMStatus();
        render();
      }
    }
  });

  function updateSOMStatus() {
    const winI = Math.round(somX.x / 5);
    const winJ = Math.round(somX.y / 5);
    const winX = winI * 5;
    const winY = winJ * 5;

    const deltaWinX = (somEta * 1.0 * (somX.x - winX)).toFixed(2);
    const deltaWinY = (somEta * 1.0 * (somX.y - winY)).toFixed(2);
    const newWinX = (winX + parseFloat(deltaWinX)).toFixed(2);
    const newWinY = (winY + parseFloat(deltaWinY)).toFixed(2);

    const f1 = Math.exp(-1 / (2 * somSigma * somSigma));
    const factorD1 = (somEta * f1).toFixed(4);

    if (statusDiv) {
      statusDiv.innerHTML = `
        <strong>Interaktive SOM-Berechnung (Task 4b):</strong><br>
        &bull; <strong>Eingabevektor:</strong> $\\vec{x} = (${somX.x}, ${somX.y})$ &bull; <strong>Gefundener Winner $u^*$:</strong> $(${winX}, ${winY})$<br>
        &bull; <strong>Winner-Verschiebung ($d=0, f_{\\text{nb}}=1$):</strong> $\\Delta \\vec{r}_{u^*} = ${somEta} \\cdot 1 \\cdot ((${somX.x}, ${somX.y}) - (${winX}, ${winY})) = \\mathbf{(${deltaWinX}, ${deltaWinY})} \\implies \\vec{r}_{u^*}^{(\\text{new})} = \\mathbf{(${newWinX}, ${newWinY})}$<br>
        &bull; <strong>Direkte Nachbarn (am Rand entsprechend weniger) ($d=1, f_{\\text{nb}}(1, ${somSigma}) = e^{-1/(2 \\cdot ${somSigma}^2)} = ${f1.toFixed(4)}$):</strong><br>
        Jeder Nachbar wird mit Faktor $\\eta \\cdot f_{\\text{nb}} = ${factorD1}$ in Richtung $\\vec{x}$ gezogen. Alle 63 Neuronen werden mit ihrem jeweiligen Gitterabstand berücksichtigt. Die Pfeile zeigen einen Schritt aus dem ursprünglichen Gitter; wiederholtes Anwenden kumuliert keine Epochen.
      `;
      renderMath(statusDiv);
    }
  }

  function toCanvasX(x, maxVal) { return 45 + (x / maxVal) * 440; }
  function toCanvasY(y, maxVal) { return 340 - (y / maxVal) * 300; }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#282e38' : '#f1f5f9';
    const axisColor = isDark ? '#9da7b3' : '#1e293b';
    const textColor = isDark ? '#9da7b3' : '#64748b';

    if (currentMode === 'lvq') {
      const maxX = 12, maxY = 8;

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let x = 0; x <= maxX; x++) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x, maxX), toCanvasY(0, maxY));
        ctx.lineTo(toCanvasX(x, maxX), toCanvasY(maxY, maxY));
        ctx.stroke();
      }
      for (let y = 0; y <= maxY; y++) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(0, maxX), toCanvasY(y, maxY));
        ctx.lineTo(toCanvasX(maxX, maxX), toCanvasY(y, maxY));
        ctx.stroke();
      }

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0, maxX), toCanvasY(0, maxY));
      ctx.lineTo(toCanvasX(maxX, maxX), toCanvasY(0, maxY));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0, maxX), toCanvasY(0, maxY));
      ctx.lineTo(toCanvasX(0, maxX), toCanvasY(maxY, maxY));
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      for (let x = 0; x <= maxX; x++) {
        ctx.fillText(x, toCanvasX(x, maxX), toCanvasY(0, maxY) + 16);
      }
      ctx.textAlign = 'right';
      for (let y = 1; y <= maxY; y++) {
        ctx.fillText(y, toCanvasX(0, maxX) - 6, toCanvasY(y, maxY) + 4);
      }

      // Draw Data Points
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.beginPath();
      ctx.arc(toCanvasX(1, maxX), toCanvasY(6, maxY), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = axisColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('p (1,6) [○]', toCanvasX(1, maxX) + 10, toCanvasY(6, maxY) - 4);

      ctx.fillStyle = axisColor;
      ctx.beginPath();
      ctx.arc(toCanvasX(9, maxX), toCanvasY(1, maxY), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('q (9,1) [●]', toCanvasX(9, maxX) - 10, toCanvasY(1, maxY) - 10);

      // Draw Codebooks
      ctx.strokeStyle = '#244cdb';
      ctx.lineWidth = 3;
      drawCross(toCanvasX(rCirc.x, maxX), toCanvasY(rCirc.y, maxY), 7);
      ctx.fillStyle = '#244cdb';
      ctx.fillText(`r_○ (${rCirc.x}, ${rCirc.y})`, toCanvasX(rCirc.x, maxX) + 10, toCanvasY(rCirc.y, maxY) + 14);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      drawCross(toCanvasX(rBull.x, maxX), toCanvasY(rBull.y, maxY), 7);
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`r_● (${rBull.x}, ${rBull.y})`, toCanvasX(rBull.x, maxX) + 10, toCanvasY(rBull.y, maxY) - 8);

      if (stepIndex === 1) {
        ctx.strokeStyle = '#244cdb';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(toCanvasX(1, maxX), toCanvasY(6, maxY));
        ctx.lineTo(toCanvasX(rCirc.x, maxX), toCanvasY(rCirc.y, maxY));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (stepIndex === 2) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(toCanvasX(9, maxX), toCanvasY(1, maxY));
        ctx.lineTo(toCanvasX(rBull.x, maxX), toCanvasY(rBull.y, maxY));
        ctx.stroke();
        ctx.setLineDash([]);
      }

    } else {
      // SOM Grid Mode (Task 4b)
      const maxX = 40, maxY = 30;

      ctx.strokeStyle = isDark ? '#3b4352' : '#cbd5e1';
      ctx.lineWidth = 1.5;

      for (let x = 0; x <= 40; x += 5) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x, maxX), toCanvasY(0, maxY));
        ctx.lineTo(toCanvasX(x, maxX), toCanvasY(30, maxY));
        ctx.stroke();
      }
      for (let y = 0; y <= 30; y += 5) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(0, maxX), toCanvasY(y, maxY));
        ctx.lineTo(toCanvasX(40, maxX), toCanvasY(y, maxY));
        ctx.stroke();
      }

      for (let x = 0; x <= 40; x += 5) {
        for (let y = 0; y <= 30; y += 5) {
          ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(toCanvasX(x, maxX), toCanvasY(y, maxY), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      for (let x = 0; x <= 40; x += 10) {
        ctx.fillText(x, toCanvasX(x, maxX), toCanvasY(0, maxY) + 16);
      }
      ctx.textAlign = 'right';
      for (let y = 5; y <= 30; y += 5) {
        ctx.fillText(y, toCanvasX(0, maxX) - 6, toCanvasY(y, maxY) + 4);
      }

      const winI = Math.round(somX.x / 5);
      const winJ = Math.round(somX.y / 5);
      const winX = winI * 5;
      const winY = winJ * 5;

      for (let di = -winI; di <= 8-winI; di++) {
        for (let dj = -winJ; dj <= 6-winJ; dj++) {
          const ni = winI + di;
          const nj = winJ + dj;
          if (ni >= 0 && ni <= 8 && nj >= 0 && nj <= 6) {
            const nodeX = ni * 5;
            const nodeY = nj * 5;
            const dGrid = Math.sqrt(di * di + dj * dj);
            const fNb = Math.exp(- (dGrid * dGrid) / (2 * somSigma * somSigma));
            if (fNb > 0) {
              const deltaX = somEta * fNb * (somX.x - nodeX);
              const deltaY = somEta * fNb * (somX.y - nodeY);

              ctx.strokeStyle = (di === 0 && dj === 0) ? '#244cdb' : 'rgba(36, 76, 219, 0.5)';
              ctx.lineWidth = (di === 0 && dj === 0) ? 2.5 : 1.5;
              drawArrow(ctx,
                toCanvasX(nodeX, maxX), toCanvasY(nodeY, maxY),
                toCanvasX(nodeX + deltaX, maxX), toCanvasY(nodeY + deltaY, maxY)
              );
            }
          }
        }
      }

      // Draw Winner
      ctx.fillStyle = '#19734e';
      ctx.beginPath();
      ctx.arc(toCanvasX(winX, maxX), toCanvasY(winY, maxY), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#19734e';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`u* (${winX}, ${winY})`, toCanvasX(winX, maxX) + 10, toCanvasY(winY, maxY) - 8);

      // Draw Input x
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toCanvasX(somX.x, maxX), toCanvasY(somX.y, maxY), 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDark ? '#fbbf24' : '#8a4f12';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`x (${somX.x}, ${somX.y})`, toCanvasX(somX.x, maxX) - 10, toCanvasY(somX.y, maxY) - 12);
    }
  }

  function drawCross(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s);
    ctx.lineTo(x - s, y + s);
    ctx.stroke();
  }

  function drawArrow(context, fromx, fromy, tox, toy) {
    const headlen = 7;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
  }

  redrawLVQ = render;
  render();
}

// -------------------------------------------------------------
// 9. Task 5: Hopfield Network State Graph Visualizer
// -------------------------------------------------------------
function initTask5Hopfield() {
  const svg = document.getElementById('hopfieldSvg');
  if (!svg) return;
  const select = document.getElementById('hopfieldStateSelect');
  const autoStepBtn = document.getElementById('hopfieldAutoStepBtn');
  const u1Btn = document.getElementById('hopfieldU1Btn');
  const u2Btn = document.getElementById('hopfieldU2Btn');
  const u3Btn = document.getElementById('hopfieldU3Btn');
  const resetBtn = document.getElementById('hopfieldResetBtn');
  const details = document.getElementById('hopfieldLiveDetails');

  let currentState = '---';

  const stateData = {
    '---': { s: [-1, -1, -1], e: 8, x: 290, y: 40, stable: false, trans: [{ u: 'u1', next: '+--' }, { u: 'u2', next: '-+-' }, { u: 'u3', next: '--+' }] },
    '+--': { s: [ 1, -1, -1], e: 2, x: 130, y: 120, stable: false, trans: [{ u: 'u2', next: '++-' }, { u: 'u3', next: '+-+' }] },
    '--+': { s: [-1, -1,  1], e: 2, x: 450, y: 120, stable: false, trans: [{ u: 'u1', next: '+-+' }, { u: 'u2', next: '-++' }] },
    '+++': { s: [ 1,  1,  1], e: 0, x: 290, y: 190, stable: false, trans: [{ u: 'u1', next: '-++' }, { u: 'u2', next: '+-+' }, { u: 'u3', next: '++-' }] },
    '++-': { s: [ 1,  1, -1], e: -2, x: 130, y: 260, stable: false, trans: [{ u: 'u1', next: '-+-' }] },
    '-++': { s: [-1,  1,  1], e: -2, x: 450, y: 260, stable: false, trans: [{ u: 'u3', next: '-+-' }] },
    '-+-': { s: [-1,  1, -1], e: -4, x: 190, y: 350, stable: true, trans: [] },
    '+-+': { s: [ 1, -1,  1], e: -4, x: 390, y: 350, stable: true, trans: [] }
  };

  if (select) {
    select.addEventListener('change', () => {
      currentState = select.value;
      updateGraph();
    });
  }

  if (autoStepBtn) {
    autoStepBtn.addEventListener('click', () => {
      const data = stateData[currentState];
      if (!data.stable) {
        currentState = data.trans[0].next;
        if (select) select.value = currentState;
        updateGraph();
      }
    });
  }

  if (u1Btn) u1Btn.addEventListener('click', () => stepNeuron('u1'));
  if (u2Btn) u2Btn.addEventListener('click', () => stepNeuron('u2'));
  if (u3Btn) u3Btn.addEventListener('click', () => stepNeuron('u3'));

  function stepNeuron(targetNeuron) {
    const cur = stateData[currentState];
    const match = cur.trans.find(t => t.u === targetNeuron);
    if (match) {
      currentState = match.next;
      if (select) select.value = currentState;
      updateGraph();
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentState = '---';
      if (select) select.value = currentState;
      updateGraph();
    });
  }

  function updateGraph() {
    svg.innerHTML = '';

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const axisColor = isDark ? '#9da7b3' : '#64748b';
    const scaleLineColor = isDark ? '#3b4352' : '#cbd5e1';
    const nodeR = 24;

    let bgHtml = `
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
        <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#244cdb" />
        </marker>
      </defs>
      <line x1="45" y1="30" x2="45" y2="370" stroke="${scaleLineColor}" stroke-width="2"/>
      <text x="35" y="45" font-size="11" font-weight="bold" fill="${axisColor}" text-anchor="end">E = +8</text>
      <text x="35" y="125" font-size="11" font-weight="bold" fill="${axisColor}" text-anchor="end">E = +2</text>
      <text x="35" y="195" font-size="11" font-weight="bold" fill="${axisColor}" text-anchor="end">E = 0</text>
      <text x="35" y="265" font-size="11" font-weight="bold" fill="${axisColor}" text-anchor="end">E = -2</text>
      <text x="35" y="355" font-size="11" font-weight="bold" fill="#19734e" text-anchor="end">E = -4 (Min)</text>
    `;

    let edgesHtml = '';
    Object.keys(stateData).forEach(stName => {
      const st = stateData[stName];
      st.trans.forEach(t => {
        const dst = stateData[t.next];
        const isActiveEdge = (stName === currentState);
        const strokeColor = isActiveEdge ? '#244cdb' : (isDark ? '#64748b' : '#94a3b8');
        const strokeW = isActiveEdge ? 2.8 : 1.4;
        const marker = isActiveEdge ? 'url(#arrowhead-active)' : 'url(#arrowhead)';

        let midX = (st.x + dst.x) / 2;
        let midY = (st.y + dst.y) / 2;

        if (stName === '---' && t.next === '-+-') {
          midX = 180;
          midY = 170;
        } else if (stName === '+++' && t.next === '+-+') {
          midX = 370;
          midY = 260;
        } else if (stName === '+++' && t.next === '-++') {
          midX = 390;
          midY = 220;
        } else if (stName === '+++' && t.next === '++-') {
          midX = 190;
          midY = 220;
        } else if (st.x === dst.x) {
          midX += 30;
        }

        const angle = Math.atan2(dst.y - midY, dst.x - midX);
        const endX = dst.x - nodeR * Math.cos(angle);
        const endY = dst.y - nodeR * Math.sin(angle);

        const startAngle = Math.atan2(midY - st.y, midX - st.x);
        const startX = st.x + nodeR * Math.cos(startAngle);
        const startY = st.y + nodeR * Math.sin(startAngle);

        edgesHtml += `
          <path d="M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}"
                fill="none" stroke="${strokeColor}" stroke-width="${strokeW}" marker-end="${marker}"/>
          <text x="${midX}" y="${midY}" font-size="11.5" font-weight="bold" fill="${strokeColor}">${t.u}</text>
        `;
      });
    });

    let nodesHtml = '';
    Object.keys(stateData).forEach(stName => {
      const st = stateData[stName];
      const isCurrent = (stName === currentState);
      const isStable = st.stable;

      let fill = isDark ? (isStable ? '#042f2e' : '#161b22') : (isStable ? '#e6f7ef' : '#ffffff');
      let stroke = isStable ? (isDark ? '#2ea043' : '#19734e') : (isDark ? '#4b5563' : '#64748b');
      let strokeW = isStable ? 2.5 : 1.5;

      if (isCurrent) {
        stroke = '#244cdb';
        strokeW = 3.5;
        fill = isDark ? '#1c2738' : '#eef2ff';
      }

      nodesHtml += `
        <g class="state-node" data-state="${stName}" style="cursor:pointer;">
          <circle cx="${st.x}" cy="${st.y}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>
          <text x="${st.x}" y="${st.y + 4}" font-size="12" font-weight="bold" text-anchor="middle" fill="${isDark ? '#f0f3f6' : '#0f172a'}">${stName}</text>
          <text x="${st.x}" y="${st.y - 28}" font-size="10" font-weight="600" text-anchor="middle" fill="${isStable ? '#19734e' : axisColor}">E = ${st.e > 0 ? '+' + st.e : st.e}</text>
        </g>
      `;
    });

    svg.innerHTML = bgHtml + edgesHtml + nodesHtml;

    svg.querySelectorAll('.state-node').forEach(node => {
      node.addEventListener('click', () => {
        const stName = node.getAttribute('data-state');
        currentState = stName;
        if (select) select.value = stName;
        updateGraph();
      });
    });

    const cur = stateData[currentState];
    const canU1 = cur.trans.some(t => t.u === 'u1');
    const canU2 = cur.trans.some(t => t.u === 'u2');
    const canU3 = cur.trans.some(t => t.u === 'u3');

    if (u1Btn) { u1Btn.disabled = !canU1; u1Btn.style.opacity = canU1 ? '1' : '0.4'; }
    if (u2Btn) { u2Btn.disabled = !canU2; u2Btn.style.opacity = canU2 ? '1' : '0.4'; }
    if (u3Btn) { u3Btn.disabled = !canU3; u3Btn.style.opacity = canU3 ? '1' : '0.4'; }

    // Update Live Details
    if (details) {
      const s1 = cur.s[0], s2 = cur.s[1], s3 = cur.s[2];
      const net1 = -2 * s2;
      const net2 = -2 * s1 - 2 * s3;
      const net3 = -2 * s2;

      const transitionPills = cur.trans.map(t =>
        `<button class="button-link" style="padding:4px 9px; font-size:12.5px; margin:2px;" onclick="window.hopfieldJump('${t.next}')">${t.u} &rarr; ${t.next}</button>`
      ).join(' ');

      details.innerHTML = `
        <strong>Aktueller Zustand: ${currentState} $(s_1=${s1 > 0 ? '+1' : '-1'}, s_2=${s2 > 0 ? '+1' : '-1'}, s_3=${s3 > 0 ? '+1' : '-1'})$</strong> &bull; Energie $E = \\mathbf{${cur.e > 0 ? '+' + cur.e : cur.e}}$<br>
        &bull; <strong>Netzeingaben:</strong> $\\text{net}_1 = -2s_2 = ${net1}$ (Schwelle $\\theta_1 = -1$), $\\text{net}_2 = -2s_1 - 2s_3 = ${net2}$ (Schwelle $\\theta_2 = -2$), $\\text{net}_3 = -2s_2 = ${net3}$ (Schwelle $\\theta_3 = -1$)<br>
        &bull; <strong>Status:</strong> ${cur.stable ?
          '<span style="color:var(--good); font-weight:700;">STABILER ATTRAKTOR (Energieminimum E = -4, keine ausgehenden Übergänge!)</span>' :
          'Instabiler Zustand &rarr; Wähle Neuron für asynchronen Einzelschritt: ' + transitionPills
        }
      `;
      renderMath(details);
    }
  }

  window.hopfieldJump = (target) => {
    currentState = target;
    if (select) select.value = currentState;
    updateGraph();
  };

  redrawHopfield = updateGraph;
  updateGraph();
}

// -------------------------------------------------------------
// 10. Task 6: 30-Point Exam MCQ Trainer Engine
// -------------------------------------------------------------
const mcqData = [
  {
    subtaskId: 'a',
    title: 'Subtask a: Types of Neural Networks',
    description: 'Charakteristische Eigenschaften und Architekturen der Netztypen',
    statements: [
      { id: 'a1', text: 'Multi-Layer Perceptrons (MLPs) can be trained with Error Backpropagation.', correct: true, slide: 'Folie 137', expl: 'Wahr: MLPs mit differenzierbaren Aktivierungsfunktionen werden standardmäßig per Error Backpropagation (Gradientenabstieg) trainiert.' },
      { id: 'a2', text: 'Radial Basis Function Networks (RBFNs) strictly require non-linear activation functions in the output neurons.', correct: false, slide: 'Folie 290', expl: 'Falsch: RBFNs haben in den Ausgangsneuronen eine LINEARE Aktivierungsfunktion f_act(net, θ) = net - θ! Die Nichtlinearität liegt rein in den radialen Basisfunktionen der Hidden-Schicht.' },
      { id: 'a3', text: 'Learning Vector Quantization (LVQ) can only be applied to unsupervised learning tasks.', correct: false, slide: 'Folie 336 & 340', expl: 'Falsch: LVQ existiert sowohl für unüberwachtes Lernen (Free Learning Tasks, nur Attraktion) als auch für überwachtes Lernen (Fixed Learning Tasks, Attraktion bei gleicher Klasse und Repulsion bei ungleicher Klasse).' },
      { id: 'a4', text: 'Self-Organizing Maps (SOMs) preserve the topological neighborhood of the input space on a low-dimensional grid of neurons.', correct: true, slide: 'Folie 360 & 362', expl: 'Wahr: Das definierende Merkmal von Kohonen-Karten (SOM) ist die topologieerhaltende Abbildung (Topology Preserving Mapping) auf ein meist 2D-Gitter.' },
      { id: 'a5', text: 'Hopfield Networks contain no hidden neurons; every neuron is both an input and an output neuron.', correct: true, slide: 'Folie 380', expl: 'Wahr: Im Hopfield-Netzwerk gilt U_hidden = ∅ und U_in = U_out = U. Alle Neuronen sind miteinander rückgekoppelt.' }
    ]
  },
  {
    subtaskId: 'b',
    title: 'Subtask b: Threshold Logic Units (TLU) & Separability',
    description: 'Geometrische Eigenschaften, Dimensionen und konvexe Hüllen',
    statements: [
      { id: 'b1', text: 'A Threshold Logic Unit with n inputs can be geometrically interpreted as a separating hyperplane on an n-dimensional hypercube {0, 1}ⁿ.', correct: true, slide: 'Folie 22 & 23', expl: 'Wahr: Die Booleschen Eingaben spannen die Ecken eines n-dimensionalen Hyperwürfels auf; die TLU trennt diese Ecken durch eine (n-1)-dimensionale Hyperebene.' },
      { id: 'b2', text: 'For 2 inputs, there are more linearly separable Boolean functions than linearly non-separable Boolean functions.', correct: true, slide: 'Folie 27', expl: 'Wahr: Bei 2 Eingängen gibt es 2^(2^2) = 16 Boolesche Funktionen. Davon sind 14 linear separierbar und nur 2 nicht linear separierbar (XOR und Biimplikation). 14 > 2!' },
      { id: 'b3', text: 'In a 2-class problem, if the 2 classes are linearly separable, there exists at least one point which is common to both convex hulls.', correct: false, slide: 'Folie 26 & 35', expl: 'Falsch: Konvexer Hüllensatz (Folie 26 & 35): Zwei Punktmengen sind genau dann linear separierbar, wenn ihre konvexen Hüllen DISJUNKT sind (keinen Punkt gemeinsam haben)!' },
      { id: 'b4', text: 'The exclusive OR (XOR) and the biimplication (XNOR) are linearly separable with a single Threshold Logic Unit.', correct: false, slide: 'Folie 24 & 25', expl: 'Falsch: XOR und Biimplikation sind die beiden klassischen nicht linear separierbaren Funktionen bei 2 Eingängen (erfordern mindestens ein 2-Schicht-Netz).' },
      { id: 'b5', text: 'Threshold Logic Units always produce a continuous real-valued output proportional to their net input.', correct: false, slide: 'Folie 17', expl: 'Falsch: Eine TLU berechnet eine binäre Sprungfunktion (Ausgabe 1 falls Netzeingabe ≥ θ, sonst 0). Sie liefert keine kontinuierlichen Werte.' }
    ]
  },
  {
    subtaskId: 'c',
    title: 'Subtask c: MLP vs. RBFN Computing Power',
    description: 'Vergleich der Rechenleistung, Aktivierungen und universelle Approximation',
    statements: [
      { id: 'c1', text: 'An MLP with purely linear activation functions in all layers has strictly less computing power than a standard RBFN.', correct: true, slide: 'Folie 93 & 288', expl: 'Wahr: Ein MLP mit rein linearen Aktivierungsfunktionen bricht zu einem einfachen 1-Schicht-Perzeptron zusammen (W2·W1·x = W_ges·x), kann also nur lineare Trennungen durchführen. Ein RBFN kann nicht-lineare Probleme (wie XOR) lösen.' },
      { id: 'c2', text: 'Both MLPs (with non-linear activation) and RBFNs are universal approximators for continuous functions on compact sets.', correct: true, slide: 'Folie 99 & 104', expl: 'Wahr: Sowohl MLPs (nach dem Hornik-Theorem) als auch RBFNs können jede stetige Funktion auf kompakten Trägern mit beliebiger Genauigkeit approximieren.' },
      { id: 'c3', text: 'In an RBFN, hidden neurons have global support, meaning they are active over the entire input space ℝⁿ.', correct: false, slide: 'Folie 288 & 291', expl: 'Falsch: RBFNs basieren auf lokalen rezeptiven Feldern (Local Receptive Fields). Die radialen Basisfunktionen fallen mit zunehmendem Abstand gegen 0 ab.' },
      { id: 'c4', text: 'A 3-layer perceptron can approximate any continuous function with arbitrary accuracy regarding maximum error.', correct: true, slide: 'Folie 99', expl: 'Wahr: Mit einem 3-Schicht-Perzeptron kann jede stetige Funktion bezüglich des maximalen Funktionswertfehlers beliebig genau approximiert werden.' },
      { id: 'c5', text: 'Training an RBFN requires backpropagating errors through all layers simultaneously with identical learning rates.', correct: false, slide: 'Folie 300 & 309', expl: 'Falsch: RBFNs werden meist hybrid trainiert: Zentren und Breiten werden unüberwacht (z. B. c-Means Clustering) initialisiert, die Ausgabegewichte können anschließend analytisch (Pseudoinverse) oder separat bestimmt werden.' }
    ]
  },
  {
    subtaskId: 'd',
    title: 'Subtask d: Training Neural Networks (Optimizers)',
    description: 'Gradientenabstiegsverfahren: QuickProp, RProp, RMSProp & Adam',
    statements: [
      { id: 'd1', text: 'QuickProp approximates the error function locally by a parabola in each weight direction and jumps directly to its apex.', correct: true, slide: 'Folie 192', expl: 'Wahr: QuickProp (Fahlman 1988) nimmt an, dass die Fehlerkurve lokal parabolisch ist, und springt direkt zum Scheitelpunkt (Apex) der Parabel.' },
      { id: 'd2', text: 'Adam (Adaptive Moment Estimation) computes adaptive learning rates using estimates of both the first and second moments of the gradient.', correct: true, slide: 'Folie 196', expl: 'Wahr: Adam nutzt m_t als Schätzung des 1. Moments (Mittelwert) und v_t als Schätzung des unzentrierten 2. Moments (Varianz) des Gradienten inklusive Bias-Korrektur.' },
      { id: 'd3', text: 'Standard Backpropagation with fixed learning rate is guaranteed to never get stuck in local minima.', correct: false, slide: 'Folie 173', expl: 'Falsch: Gradientenabstieg auf nicht-konvexen Fehlerflächen kann in lokalen Minima oder Sattelpunkten hängenbleiben.' },
      { id: 'd4', text: 'RProp (Resilient Propagation) uses only the sign of the partial derivatives to determine the direction of weight updates.', correct: true, slide: 'Folie 191', expl: 'Wahr: RProp ignoriert die absolute Größe der partiellen Ableitung und passt die Schrittweite nur basierend auf Vorzeichenwechseln der Ableitung an.' },
      { id: 'd5', text: 'RMSProp maintains an exponentially decaying average of past squared gradients to normalize weight updates.', correct: true, slide: 'Folie 195', expl: 'Wahr: RMSProp teilt den Gradienten durch die Wurzel aus dem gleitenden Mittelwert der quadrierten Gradienten, um Oszillationen zu dämpfen.' }
    ]
  },
  {
    subtaskId: 'e',
    title: 'Subtask e: Distance Functions & Metric Axioms',
    description: 'Axiome einer mathematischen Metrik und Distanzfunktionen',
    statements: [
      { id: 'e1', text: 'A distance function d(x, y) must satisfy the Triangle Inequality: d(x, z) ≤ d(x, y) + d(y, z).', correct: true, slide: 'Folie 332', expl: 'Wahr: Die Dreiecksungleichung ist das dritte definierende Axiom jeder Metrik.' },
      { id: 'e2', text: 'Distance functions are associative: d(d(x, y), z) = d(x, d(y, z)).', correct: false, slide: 'Folie 332', expl: 'Falsch: Eine Distanzfunktion bildet ℝⁿ × ℝⁿ auf ℝ ab. Der Ausdruck d(d(x,y), z) ist mathematischer Unsinn, da d(x,y) eine Zahl und kein Punkt des Raumes ist!' },
      { id: 'e3', text: 'A distance function satisfies the Identity of Indiscernibles: d(x, y) = 0 ⇔ x = y.', correct: true, slide: 'Folie 332', expl: 'Wahr: Erstes Axiom: Der Abstand zwischen zwei Punkten ist genau dann null, wenn die Punkte identisch sind.' },
      { id: 'e4', text: 'Distance functions are transitive, meaning if d(x, y) then d(y, z).', correct: false, slide: 'Folie 332', expl: 'Falsch: Transitivität ist eine Eigenschaft von Relationen (z. B. Ordnungs- oder Äquivalenzrelationen), nicht von Distanzfunktionen!' },
      { id: 'e5', text: 'The Manhattan distance (L₁) and the Maximum distance (L_∞) are both special cases of the Minkowski distance family.', correct: true, slide: 'Folie 289 & 333', expl: 'Wahr: Für k = 1 ergibt sich Manhattan, für k = 2 Euklidisch, und für k → ∞ die Maximumsdistanz.' }
    ]
  },
  {
    subtaskId: 'f',
    title: 'Subtask f: Hopfield Networks & Stability',
    description: 'Gewichtssymmetrie, Diagonalelemente, Update-Dynamik und Konvergenz',
    statements: [
      { id: 'f1', text: 'A Hopfield network has symmetric weights with 1s on the main diagonal (w_ii = 1).', correct: false, slide: 'Folie 380', expl: 'Falsch: In einem Hopfield-Netzwerk sind Neuronen NICHT mit sich selbst verbunden: C = U × U - {(u,u)}. Auf der Hauptdiagonale stehen NULLEN (w_ii = 0), keine Einsen!' },
      { id: 'f2', text: 'The number of hidden neurons in a Hopfield network is equal to the number of input neurons.', correct: false, slide: 'Folie 380', expl: 'Falsch: Es gibt KEINE Hidden-Neuronen (U_hidden = ∅). Alle Neuronen sind gleichzeitig Eingangs- und Ausgangsneuronen.' },
      { id: 'f3', text: 'Updating one neuron and going to a new state will, if that neuron is replaced immediately, always return to the previous state due to symmetry.', correct: false, slide: 'Folie 388–390', expl: 'Falsch: Der Konvergenzsatz beweist: Jedes Update, das einen Zustand ändert, VERRINGERT die Energie (ΔE < 0). Ein Rückschritt in den vorigen Zustand mit höherer Energie ist unmöglich!' },
      { id: 'f4', text: 'Bipolar {-1, +1} and unipolar {0, 1} representations of Hopfield networks are equivalent in computational power.', correct: true, slide: 'Folie 83 & 382', expl: 'Wahr: Bipolare und unipolare Netze lassen sich durch eine lineare affine Transformation (s_bipolar = 2·s_unipolar - 1) exakt ineinander überführen.' },
      { id: 'f5', text: 'Updating neurons asynchronously without skipping will always lead to stability in a finite number of steps.', correct: true, slide: 'Folie 388', expl: 'Wahr: Konvergenzsatz von Hopfield: Bei asynchroner Aktualisierung wird garantiert in endlich vielen Schritten (höchstens n·2ⁿ) ein stabiler Zustand erreicht.' }
    ]
  }
];

// -------------------------------------------------------------
// Module 6: Deep Learning & CNN Visualizer (Folie 264–266)
// -------------------------------------------------------------
function initDeepLearningCNN() {
  const paddingSelect = document.getElementById('cnnPaddingSelect');
  const strideSelect = document.getElementById('cnnStrideSelect');
  const poolingSelect = document.getElementById('cnnPoolingSelect');
  const resetBtn = document.getElementById('cnnResetBtn');
  const inputTable = document.getElementById('cnnInputTable');
  const kernelTable = document.getElementById('cnnKernelTable');
  const outputTable = document.getElementById('cnnOutputTable');
  const poolTable = document.getElementById('cnnPoolTable');
  const poolTitle = document.getElementById('cnnPoolTitle');
  const stepCalc = document.getElementById('cnnStepCalc');

  if (!inputTable || !kernelTable || !outputTable || !poolTable) return;

  // Own numerical example using the operation from slides 264–266.
  const rawImage = [
    [8, 3, 18, 30, 25],
    [1, 4, 14, 23, 26],
    [7, 0, 17, 24, 22],
    [9, 6, 15, 31, 28],
    [2, 5, 16, 29, 27]
  ];

  const kernel = [
    [0, 1, 0],
    [-2, 2, -1],
    [0, 1, 0]
  ];

  let selectedOutCell = { r: 0, c: 0 };
  let selectedPoolCell = null;

  function renderKernel() {
    kernelTable.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 3; j++) {
        const td = document.createElement('td');
        td.className = 'matrix-cell';
        if (i === 1 && j === 1) td.classList.add('kernel-center');
        td.textContent = kernel[i][j];
        tr.appendChild(td);
      }
      kernelTable.appendChild(tr);
    }
  }

  function renderCNN() {
    const p = parseInt(paddingSelect.value, 10);
    const s = parseInt(strideSelect.value, 10);
    const poolType = poolingSelect.value;

    const n = 5;
    const k = 3;
    const outM = Math.floor((n + 2 * p - k) / s) + 1;

    // Build padded image
    const paddedSize = n + 2 * p;
    const paddedImage = [];
    for (let i = 0; i < paddedSize; i++) {
      paddedImage[i] = [];
      for (let j = 0; j < paddedSize; j++) {
        if (p === 1 && (i === 0 || i === paddedSize - 1 || j === 0 || j === paddedSize - 1)) {
          paddedImage[i][j] = 0;
        } else {
          paddedImage[i][j] = rawImage[i - p][j - p];
        }
      }
    }

    // Compute convolution feature map
    const convOutput = [];
    for (let r = 0; r < outM; r++) {
      convOutput[r] = [];
      for (let c = 0; c < outM; c++) {
        let sum = 0;
        for (let ki = 0; ki < k; ki++) {
          for (let kj = 0; kj < k; kj++) {
            sum += paddedImage[r * s + ki][c * s + kj] * kernel[ki][kj];
          }
        }
        convOutput[r][c] = sum;
      }
    }

    // Clamp selectedOutCell if outM changed
    if (selectedOutCell.r >= outM) selectedOutCell.r = 0;
    if (selectedOutCell.c >= outM) selectedOutCell.c = 0;

    // Render Input Table with Receptive Field
    inputTable.innerHTML = '';
    const rfStartRow = selectedOutCell.r * s;
    const rfStartCol = selectedOutCell.c * s;

    const isPoolSelected = selectedPoolCell !== null;
    let poolRfStartRow = 0, poolRfEndRow = 0, poolRfStartCol = 0, poolRfEndCol = 0;
    if (isPoolSelected) {
      poolRfStartRow = selectedPoolCell.r * 2 * s;
      poolRfEndRow = Math.min(paddedSize - 1, (selectedPoolCell.r * 2 + 1) * s + k - 1);
      poolRfStartCol = selectedPoolCell.c * 2 * s;
      poolRfEndCol = Math.min(paddedSize - 1, (selectedPoolCell.c * 2 + 1) * s + k - 1);
    }

    for (let i = 0; i < paddedSize; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < paddedSize; j++) {
        const td = document.createElement('td');
        td.className = 'matrix-cell';
        if (p === 1 && (i === 0 || i === paddedSize - 1 || j === 0 || j === paddedSize - 1)) {
          td.classList.add('padded');
        }

        const isInsideRF =
          !isPoolSelected &&
          i >= rfStartRow && i < rfStartRow + k &&
          j >= rfStartCol && j < rfStartCol + k;

        const isInsidePoolRF =
          isPoolSelected &&
          i >= poolRfStartRow && i <= poolRfEndRow &&
          j >= poolRfStartCol && j <= poolRfEndCol;

        if (isInsideRF) {
          td.classList.add('kernel-rf');
          if (i === rfStartRow + 1 && j === rfStartCol + 1) {
            td.classList.add('kernel-center');
          }
        } else if (isInsidePoolRF) {
          td.classList.add('pool-active');
        }

        td.textContent = paddedImage[i][j];
        tr.appendChild(td);
      }
      inputTable.appendChild(tr);
    }

    // Render Output Feature Map
    outputTable.innerHTML = '';
    for (let r = 0; r < outM; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < outM; c++) {
        const td = document.createElement('td');
        td.className = 'matrix-cell';
        if (selectedPoolCell === null && r === selectedOutCell.r && c === selectedOutCell.c) {
          td.classList.add('output-active');
        }
        if (selectedPoolCell !== null) {
          const pr = selectedPoolCell.r * 2;
          const pc = selectedPoolCell.c * 2;
          if ((r === pr || r === pr + 1) && (c === pc || c === pc + 1)) {
            td.classList.add('output-active');
          }
        }
        td.textContent = convOutput[r][c];
        td.title = `Zelle (${r}, ${c}): Klick für Receptive Field & Formel`;
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => {
          selectedOutCell = { r, c };
          selectedPoolCell = null;
          renderCNN();
        });
        tr.appendChild(td);
      }
      outputTable.appendChild(tr);
    }

    // Compute Pooling Table (2x2 with stride 2)
    const poolM = Math.floor(outM / 2);
    if (poolTitle) {
      poolTitle.textContent = `4. Pooling (${poolType === 'max' ? 'Max' : 'Average'} 2×2)`;
    }
    poolTable.innerHTML = '';

    const pooledData = [];
    for (let pr = 0; pr < poolM; pr++) {
      pooledData[pr] = [];
      const tr = document.createElement('tr');
      for (let pc = 0; pc < poolM; pc++) {
        const block = [
          convOutput[pr * 2][pc * 2],
          convOutput[pr * 2][pc * 2 + 1],
          convOutput[pr * 2 + 1][pc * 2],
          convOutput[pr * 2 + 1][pc * 2 + 1]
        ];

        let val;
        if (poolType === 'max') {
          val = Math.max(...block);
        } else {
          const avg = block.reduce((a, b) => a + b, 0) / 4;
          val = Number.isInteger(avg) ? avg : avg.toFixed(2);
        }
        pooledData[pr][pc] = val;

        const td = document.createElement('td');
        td.className = 'matrix-cell';
        if (selectedPoolCell && selectedPoolCell.r === pr && selectedPoolCell.c === pc) {
          td.classList.add('pool-active');
        }
        td.textContent = val;
        td.title = `Pooling-Zelle (${pr}, ${pc}): Klick für Rechnung`;
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => {
          selectedPoolCell = { r: pr, c: pc };
          renderCNN();
        });
        tr.appendChild(td);
      }
      poolTable.appendChild(tr);
    }

    // Update Step Calculation Box
    if (stepCalc) {
      if (selectedPoolCell !== null) {
        const pr = selectedPoolCell.r;
        const pc = selectedPoolCell.c;
        const block = [
          convOutput[pr * 2][pc * 2],
          convOutput[pr * 2][pc * 2 + 1],
          convOutput[pr * 2 + 1][pc * 2],
          convOutput[pr * 2 + 1][pc * 2 + 1]
        ];
        const val = pooledData[pr][pc];
        if (poolType === 'max') {
          stepCalc.innerHTML = `
            <strong>2×2 Max-Pooling für Zelle (${pr}, ${pc}):</strong><br>
            Fensterwerte in Feature Map: $\\{${block.join(', ')}\\}$<br>
            $$\\text{pool}(${pr}, ${pc}) = \\max(${block.join(', ')}) = \\mathbf{${val}}$$
          `;
        } else {
          const sum = block.join(' + ');
          stepCalc.innerHTML = `
            <strong>2×2 Average-Pooling für Zelle (${pr}, ${pc}):</strong><br>
            Fensterwerte in Feature Map: $\\{${block.join(', ')}\\}$<br>
            $$\\text{pool}(${pr}, ${pc}) = \\frac{${sum}}{4} = \\mathbf{${val}}$$
          `;
        }
      } else {
        const r = selectedOutCell.r;
        const c = selectedOutCell.c;
        const terms = [];
        for (let ki = 0; ki < k; ki++) {
          for (let kj = 0; kj < k; kj++) {
            const imgVal = paddedImage[r * s + ki][c * s + kj];
            const kVal = kernel[ki][kj];
            terms.push(`${imgVal} \\cdot (${kVal})`);
          }
        }
        const sumVal = convOutput[r][c];
        stepCalc.innerHTML = `
          <strong>Faltungs-Berechnung für Feature Map Zelle (${r}, ${c}):</strong><br>
          Rezeptives Feld in Eingabe (ab Zeile ${r * s}, Spalte ${c * s}):<br>
          $$s(${r}, ${c}) = ${terms.slice(0, 3).join(' + ')} + {}$$
          $$\\quad + ${terms.slice(3, 6).join(' + ')} + {}$$
          $$\\quad + ${terms.slice(6, 9).join(' + ')} = \\mathbf{${sumVal}}$$
        `;
      }
      renderMath(stepCalc);
    }
  }

  renderKernel();
  renderCNN();

  paddingSelect.addEventListener('change', () => { selectedPoolCell = null; renderCNN(); });
  strideSelect.addEventListener('change', () => { selectedPoolCell = null; renderCNN(); });
  poolingSelect.addEventListener('change', () => { renderCNN(); });
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      paddingSelect.value = '0';
      strideSelect.value = '1';
      poolingSelect.value = 'max';
      selectedOutCell = { r: 0, c: 0 };
      selectedPoolCell = null;
      renderCNN();
    });
  }
}

let recallModule = 'all';
let recallFilter = 'all';
let recallIndex = 0;
function initRecallEngine() {
  const host = document.getElementById('recall-card-host');
  const modSelect = document.getElementById('recall-module-select');
  const filterSelect = document.getElementById('recall-filter-select');
  if (!host) return;

  function getCards() {
    return theoryEntries.filter(t => {
      const matchMod = (recallModule === 'all' ||
        t.module === recallModule ||
        (recallModule === 'theory' && (
          t.module === 'theory' ||
          t.kind.includes('Satz') ||
          t.kind.includes('Beweis') ||
          t.id.includes('convex') ||
          t.id.includes('hornik') ||
          t.id.includes('collapse') ||
          t.id.includes('energy') ||
          t.id.includes('metric') ||
          t.id.includes('hebb')
        ))
      );
      const matchFilter = (recallFilter === 'all' || !state.known[t.id]);
      return matchMod && matchFilter;
    });
  }

  function renderCard() {
    const cards = getCards();
    if (recallIndex >= cards.length) recallIndex = 0;
    const t = cards[recallIndex];

    if (!t) {
      host.innerHTML = `
        <div class="panel empty" style="text-align:center; padding:45px 20px;">
          <h3>Alle Formeln für diese Auswahl als sicher markiert!</h3>
          <p class="muted small">Du kannst den Filter oben auf „Alle Aussagen“ zurückstellen oder ein anderes Modul wählen.</p>
        </div>
      `;
      return;
    }

    host.innerHTML = `
      <article class="panel theorem">
        <div class="label">${t.moduleTitle} · ${recallIndex + 1} / ${cards.length}</div>
        <h2 style="margin-top:0;">${t.title}</h2>
        <p class="small muted">Formuliere ${t.kind} einschließlich aller mathematischen Voraussetzungen und Parameter aus dem Gedächtnis:</p>
        
        <textarea id="recall-note" data-note="recall-${t.id}" placeholder="Deine Formulierung, Formeln, Voraussetzungen …">${safeText(state.notes['recall-' + t.id] || '')}</textarea>

        <div class="actions">
          <button class="primary" id="reveal-recall-card">Mit Erklärung und Quelle vergleichen</button>
          <button id="skip-recall-card">Überspringen →</button>
        </div>

        <div id="recall-answer-box" style="display:none; margin-top:20px; border-top:1px solid var(--line); padding-top:20px;">
          <div class="formal">
            <p>${t.text}</p>
          </div>
          <p class="meta">${t.source}</p>
          
          <details open class="rule">
            <summary>Beim Formulieren prüfen</summary>
            ${t.checks.map(c => `<p class="small">• ${c}</p>`).join('')}
          </details>

          <p class="meta" style="margin-top:14px;">Selbsteinschätzung:</p>
          <div class="actions">
            <button id="recall-again-btn">Noch üben</button>
            <button class="primary" id="recall-known-btn">✓ Vollständig gewusst</button>
          </div>
        </div>
      </article>
    `;

    renderMath(host);

    // Bind Note input
    const ta = host.querySelector('#recall-note');
    if (ta) {
      ta.addEventListener('input', () => {
        state.notes['recall-' + t.id] = ta.value;
        saveState();
      });
    }

    // Reveal Button
    const revealBtn = host.querySelector('#reveal-recall-card');
    const answerBox = host.querySelector('#recall-answer-box');
    if (revealBtn && answerBox) {
      revealBtn.addEventListener('click', () => {
        answerBox.style.display = 'block';
        revealBtn.style.display = 'none';
        renderMath(answerBox);
      });
    }

    // Skip Button
    const skipBtn = host.querySelector('#skip-recall-card');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        recallIndex = (recallIndex + 1) % Math.max(cards.length, 1);
        renderCard();
      });
    }

    // Again Button
    const againBtn = host.querySelector('#recall-again-btn');
    if (againBtn) {
      againBtn.addEventListener('click', () => {
        state.known[t.id] = false;
        saveState();
        updateOverviewProgress();
        recallIndex = (recallIndex + 1) % Math.max(cards.length, 1);
        renderCard();
      });
    }

    // Known Button
    const knownBtn = host.querySelector('#recall-known-btn');
    if (knownBtn) {
      knownBtn.addEventListener('click', () => {
        state.known[t.id] = true;
        saveState();
        updateOverviewProgress();
        if (recallFilter === 'open') {
          renderCard();
        } else {
          recallIndex = (recallIndex + 1) % Math.max(cards.length, 1);
          renderCard();
        }
      });
    }
  }

  if (modSelect) {
    modSelect.addEventListener('change', (e) => {
      recallModule = e.target.value;
      recallIndex = 0;
      renderCard();
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      recallFilter = e.target.value;
      recallIndex = 0;
      renderCard();
    });
  }

  renderCard();
}

// -------------------------------------------------------------
// 12. Feature 2: 120-Minuten Klausurtraining (1:1 Analysis 2B)
// -------------------------------------------------------------
