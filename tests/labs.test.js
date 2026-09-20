'use strict';
const assert = require('node:assert/strict');
const M = require('../lab-math.js');
let checks = 0;
const close = (a, b, eps = 1e-8) => { checks++; assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`); };
const equal = (a, b) => { checks++; assert.deepEqual(a, b); };
const derivative = (fn, x) => (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5;
const points = [[0, 1], [1, 2], [2, 2]];
for (const a of [-2, 0, 6]) for (const b of [-2, .7, 4]) {
  const r = M.regression(points, a, b);
  close(r.grad[0], derivative(v => M.regression(points, v, b).sse, a));
  close(r.grad[1], derivative(v => M.regression(points, a, v).sse, b));
}
const best = M.regression(points, 0, 0).optimum;
close(best[0], 7 / 6); close(best[1], .5);
M.regression(points, ...best).grad.forEach(v => close(v, 0));
equal(M.regression([[1, 0], [1, 2]], 0, 0).optimum, null);
for (const z of [-8, -6, 0, 6, 8]) for (const t of [0, 1]) {
  const r = M.binary(z, t);
  close(r.gradBCE, derivative(v => M.binary(v, t).bce, z));
  close(r.gradSquared, derivative(v => M.binary(v, t).squared, z));
}
close(M.binary(-1000, 1).bce, 1000); close(M.binary(1000, 0).bce, 1000);
for (const z of [[-1, 0, 1], [2, 2, 2], [-1000, 1000, 0]]) {
  const a = M.softmax(z, 1), b = M.softmax(z.map(v => v + 21), 1);
  close(a.p.reduce((s, v) => s + v), 1); a.p.forEach((p, i) => close(p, b.p[i])); close(a.loss, b.loss);
}
// Independent ray-casting comparison against the original polygon, away from edges.
const polygon = [[1, 4], [4, 4], [3, 1], [3, 3]];
function inside(x, y) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return Number(result);
}
for (let i = 0; i < 50; i++) for (let j = 0; j < 50; j++) {
  const x = i / 10 + .031, y = j / 10 + .017;
  equal(M.tlu([x, y]).output, inside(x, y));
  const accepted = ((x > 2 && y > 2 && x + y < 5) || (x < 2 && y < 2 && x + y > 3));
  equal(M.rbf([x, y]).output > 0, accepted);
}
equal(M.rbf([1.75, 2.25]).output, 0);
equal(M.rbf([1.75, 2.25], [true, false, true]).output, 1);
equal(M.approximation('mlp', 10, 0).weights, [-5, -3, -1, 1, 3, 5, 7, 9]);
close(M.approximation('rbf', 11, -2.5).output, 3.5);
for (let n = 8; n <= 12; n++) {
  const atStart = M.approximation('rbf', n, -4);
  atStart.centers.forEach(c => close(M.approximation('rbf', n, c).output, M.parabola(c)));
  for (let x = -4; x <= 4; x += .03125) close(M.approximation('rbf', n, x).activations.reduce((a, b) => a + b, 0), 1);
  equal(M.approximation('mlp', n, 0).centers.length + 2, n);
  close(M.approximation('mlp', n, 4).output, M.parabola(4));
}
const initial = [[5, 4], [7, 5]], frozen = JSON.stringify(initial);
for (const supervised of [false, true]) {
  const first = M.lvq(initial, [1, 6], 0, .5, supervised);
  const second = M.lvq(first.next, [9, 1], 1, .5, supervised);
  equal(second.next, supervised ? [[0, 7], [9.5, 2.75]] : [[3, 5], [8, 3]]);
}
equal(JSON.stringify(initial), frozen);
const som = M.som([28, 20], 2, .5);
equal(som.winner, [6, 4]); equal(som.rows.length, 63);
equal(som.rows.find(n => n.i === 6 && n.j === 4).next, [29, 20]);
close(som.rows.find(n => n.i === 5 && n.j === 4).next[0], 25 + 1.5 * Math.exp(-1 / 8));
som.rows.forEach(n => { equal(n.h > 0, true); close(n.next[0] - n.old[0], .5 * Math.exp(-n.d2 / 8) * (28 - n.old[0])); });
let plateauChanges = 0;
for (const k of [1, 2]) for (let s = 0; s < 8; s++) for (let u = 0; u < 3; u++) {
  const state = [s & 4 ? 1 : -1, s & 2 ? 1 : -1, s & 1 ? 1 : -1], r = M.hopfield(state, k, u);
  equal(r.nextEnergy <= r.energy, true); r.next.forEach((v, i) => { if (i !== u) equal(v, state[i]); });
  if (r.next[u] !== state[u] && r.nextEnergy === r.energy) plateauChanges++;
}
equal(plateauChanges > 0, true);
equal(M.hopfield([-1, -1, -1], 2, 0, true).next, [1, 1, 1]);
equal(M.hopfield([1, 1, 1], 2, 0, true).next, [-1, -1, -1]);
// Numerical differentiation checks all four simultaneous parameter updates.
for (const x of [-2, 0, 2]) for (const target of [0, 1]) for (const w of [-1, 0, 1]) {
  const p = { x, target, v: .5, w, bh: .2, bo: -.3, eta: .1 }, r = M.backprop(p);
  const loss = q => (q.target - 1 / (1 + Math.exp(-(q.w / (1 + Math.exp(-(q.v * q.x + q.bh))) + q.bo)))) ** 2;
  for (const key of ['v', 'w', 'bh', 'bo']) close(r.next[key] - p[key], -.5 * p.eta * derivative(v => loss({ ...p, [key]: v }), p[key]));
  equal(r.nextLoss <= r.loss, true);
  if (!w) close(r.deltaHidden, 0);
}
const clusterPoints = [[1, 2], [2, 1], [5, 4], [6, 5]], clusters = M.cmeans(clusterPoints, [[1, 1], [6, 6]]);
equal(clusters.assignment, [0, 0, 1, 1]); equal(clusters.next, [[1.5, 1.5], [5.5, 4.5]]); close(clusters.before, 8); close(clusters.after, 2);
const empty = M.cmeans(clusterPoints, [[0, 0], [0, 1]]); equal(empty.next[0], [0, 0]); equal(empty.assignment, [1, 1, 1, 1]); equal(empty.after < empty.before, true);
console.log(`${checks} checks passed: gradients, geometry, interpolation, learning updates and energy invariants.`);
