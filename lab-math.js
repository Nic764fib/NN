'use strict';
// Pure calculations shared by the guided experiments and their tests.
const NNLabs = (() => {
  const sigmoid = z => z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
  const softplus = z => Math.max(0, z) + Math.log1p(Math.exp(-Math.abs(z)));
  const distance2 = (a, b) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);
  function regression(points, a, b) {
    const residuals = points.map(([x, y]) => a + b * x - y);
    const n = points.length, mx = points.reduce((s, p) => s + p[0], 0) / n;
    const my = points.reduce((s, p) => s + p[1], 0) / n;
    const variance = points.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
    const slope = variance ? points.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / variance : null;
    return { residuals, sse: residuals.reduce((s, r) => s + r * r, 0),
      grad: [2 * residuals.reduce((s, r) => s + r, 0), 2 * residuals.reduce((s, r, i) => s + r * points[i][0], 0)],
      optimum: slope === null ? null : [my - slope * mx, slope] };
  }
  function binary(z, target) {
    const p = sigmoid(z);
    return { p, bce: softplus(z) - target * z, squared: (p - target) ** 2,
      gradBCE: p - target, gradSquared: 2 * (p - target) * p * (1 - p) };
  }
  function softmax(z, target) {
    const max = Math.max(...z), exp = z.map(v => Math.exp(v - max)), sum = exp.reduce((a, b) => a + b, 0);
    return { p: exp.map(v => v / sum), loss: (max + Math.log(sum) - z[target]) / Math.LN2 };
  }
  const normals = [[0, -1], [1, 2], [-3, 1], [-1, 0], [1, 0]];
  const thresholds = [-4, 9, -8, -3, 3];
  function tlu(point, theta = thresholds) {
    const net = normals.map(w => w[0] * point[0] + w[1] * point[1]);
    const hidden = net.map((v, i) => Number(v >= theta[i] - 1e-10));
    const conjunctions = [[0, 1, 3], [0, 2, 4]].map(ids => Number(ids.every(i => hidden[i])));
    return { net, hidden, conjunctions, output: Number(conjunctions.some(Boolean)) };
  }
  function rbf(point, active = [true, true, true], radius = 1, metric = 1) {
    const [x, y] = point, distances = [metric === 1 ? Math.abs(x - 2) + Math.abs(y - 2) : Math.hypot(x - 2, y - 2),
      Math.max(Math.abs(x - 1.5), Math.abs(y - 2.5)), Math.max(Math.abs(x - 2.5), Math.abs(y - 1.5))];
    const hidden = distances.map((v, i) => Number(v <= (i ? .5 : radius) + 1e-10));
    const contributions = hidden.map((v, i) => active[i] ? v * (i ? -1 : 1) : 0);
    return { distances, hidden, contributions, output: contributions.reduce((a, b) => a + b, 0) };
  }
  const parabola = x => x * x + 2 * x + 2;
  function approximation(model, nodes, x) {
    const count = nodes - 2, interval = 8 / (model === 'mlp' ? count : count - 1);
    const centers = Array.from({ length: count }, (_, i) => -4 + (model === 'mlp' ? i + 1 : i) * interval);
    const weights = centers.map(c => model === 'mlp' ? parabola(c) - parabola(c - interval) : parabola(c));
    const activations = centers.map(c => model === 'mlp' ? Number(x >= c - 1e-10) : Math.max(0, 1 - Math.abs(x - c) / interval));
    const contributions = weights.map((w, i) => w * activations[i]);
    const bias = model === 'mlp' ? parabola(-4) : 0;
    return { centers, weights, activations, contributions, bias, interval, output: bias + contributions.reduce((a, b) => a + b, 0) };
  }
  function lvq(centers, point, label, eta, supervised) {
    const distances = centers.map(c => distance2(c, point)), winner = distances[0] <= distances[1] ? 0 : 1;
    // Exactly two differently labelled prototypes; label is 0 or 1.
    const signs = centers.map((_, i) => supervised ? (i === label ? 1 : -1) : (i === winner ? 1 : 0));
    return { distances, winner, signs, next: centers.map((c, i) => c.map((v, j) => v + signs[i] * eta * (point[j] - v))) };
  }
  function som(point, sigma, eta) {
    // Explicit deterministic tie rule: larger grid index wins at half-way positions.
    const winner = point.map((v, i) => Math.max(0, Math.min(i ? 6 : 8, Math.round(v / 5))));
    const rows = [];
    for (let j = 0; j <= 6; j++) for (let i = 0; i <= 8; i++) {
      const old = [5 * i, 5 * j], d2 = (i - winner[0]) ** 2 + (j - winner[1]) ** 2;
      const h = Math.exp(-d2 / (2 * sigma * sigma)), delta = old.map((v, k) => eta * h * (point[k] - v));
      rows.push({ i, j, old, d2, h, delta, next: old.map((v, k) => v + delta[k]) });
    }
    return { winner, rows };
  }
  function hopfield(state, k = 2, neuron = 0, synchronous = false) {
    const theta = [-1, -2, -1], net = [-k * state[1], -k * (state[0] + state[2]), -k * state[1]];
    const next = state.map((v, i) => synchronous || i === neuron ? (net[i] >= theta[i] ? 1 : -1) : v);
    const energy = s => k * s[0] * s[1] + k * s[1] * s[2] - s[0] - 2 * s[1] - s[2];
    return { net, theta, next, energy: energy(state), nextEnergy: energy(next),
      stable: net.every((v, i) => (v >= theta[i] ? 1 : -1) === state[i]) };
  }
  function backprop({ x, target, v, w, bh = 0, bo = 0, eta }) {
    const zh = v * x + bh, h = sigmoid(zh), zo = w * h + bo, out = sigmoid(zo);
    const deltaOut = (target - out) * out * (1 - out), deltaHidden = w * deltaOut * h * (1 - h);
    const next = { x, target, v: v + eta * deltaHidden * x, w: w + eta * deltaOut * h,
      bh: bh + eta * deltaHidden, bo: bo + eta * deltaOut, eta };
    const nextOut = sigmoid(next.w * sigmoid(next.v * x + next.bh) + next.bo);
    return { zh, h, zo, out, deltaOut, deltaHidden, next, loss: (target - out) ** 2, nextLoss: (target - nextOut) ** 2 };
  }
  function cmeans(points, centers) {
    const distances = points.map(p => centers.map(c => distance2(p, c)));
    const assignment = distances.map(d => d[0] <= d[1] ? 0 : 1);
    const next = centers.map((c, k) => { const cluster = points.filter((_, i) => assignment[i] === k);
      return cluster.length ? c.map((_, j) => cluster.reduce((s, p) => s + p[j], 0) / cluster.length) : [...c]; });
    const before = points.reduce((s, p, i) => s + distance2(p, centers[assignment[i]]), 0);
    const after = points.reduce((s, p, i) => s + distance2(p, next[assignment[i]]), 0);
    return { distances, assignment, next, before, after };
  }
  return { sigmoid, regression, binary, softmax, tlu, normals, thresholds, rbf, parabola, approximation, lvq, som, hopfield, backprop, cmeans };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = NNLabs;
