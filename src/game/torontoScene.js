// Toronto set for the 3D stage (preview): a crisp autumn street corner. Red-brick bay-and-gable houses,
// a corner store with a striped awning (no words, no brands) for Rocco's porch, Bev's coffee counter, a red
// streetcar at its stop for Gus, a small park basketball court for Dre, maple trees, and a generic downtown
// skyline silhouette in the distance. Light on phones: every box is merged into two meshes (lit + glowing)
// and the set adds no lights.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const at = (x, y, z, ry = 0, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(1, 1, 1),
  );

function painter() {
  const lit = [];
  const glow = [];
  const put = (list) => (geo, color, m) => {
    const g = (geo.index ? geo.toNonIndexed() : geo).applyMatrix4(m);
    const c = new THREE.Color(color);
    const rgb = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < rgb.length; i += 3) rgb.set([c.r, c.g, c.b], i);
    g.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
    list.push(g);
  };
  return { lit, glow, solid: put(lit), bright: put(glow) };
}

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (top, bottom, h, n = 8) => new THREE.CylinderGeometry(top, bottom, h, n);

const STREETCAR_RED = '#c8102e';
const BRICKS = ['#a5452f', '#b5543a', '#8f3b2a', '#c06a4a', '#9c4a35'];
const TRIM = ['#f2efe6', '#2f4f3a', '#f2efe6', '#2b3a55', '#f2efe6'];
const LEAVES = ['#d9481c', '#e8862a', '#c43424', '#f2b134'];

// a narrow Victorian bay-and-gable house: brick, a bay window, a pointed gable with white trim, a porch
function house(p, i, x) {
  const z = -9;
  const front = z + 2.5;
  const brick = BRICKS[i % BRICKS.length];
  const trim = TRIM[i % TRIM.length];
  const h = 6.4;
  p.solid(box(5.6, h, 5), brick, at(x, h / 2, z));
  // gable roof: two slabs meeting in a point, and the trimmed triangle at the front
  p.solid(box(3.3, 0.25, 5.4), '#3d3a3a', at(x - 1.35, h + 1.0, z, 0, 0, 0.72));
  p.solid(box(3.3, 0.25, 5.4), '#3d3a3a', at(x + 1.35, h + 1.0, z, 0, 0, -0.72));
  p.solid(new THREE.ConeGeometry(2.7, 2.1, 3), brick, at(x, h + 1.0, front - 0.05, Math.PI / 2 + Math.PI / 6, 0, 0).multiply(at(0, 0, 0, 0, 0, 0)));
  p.solid(box(0.7, 0.9, 0.1), trim, at(x, h + 0.9, front + 0.05));
  // bay window on the upper floor, a door and porch below
  p.solid(box(2.4, 1.8, 0.8), brick, at(x - 1.1, 4.3, front + 0.4));
  for (const wx of [-1.8, -1.1, -0.4]) {
    const lit = (i + Math.round(wx * 3)) % 3 === 0;
    (lit ? p.bright : p.solid)(box(0.55, 1.2, 0.05), lit ? '#ffe2a6' : '#3b4a56', at(x + wx, 4.35, front + 0.82));
  }
  p.solid(box(2.6, 0.12, 1), trim, at(x - 1.1, 5.25, front + 0.45));
  p.solid(box(2.6, 0.12, 1), trim, at(x - 1.1, 3.35, front + 0.45));
  p.solid(box(1.0, 2.0, 0.1), trim, at(x + 1.6, 1.0, front + 0.02));
  p.solid(box(0.8, 1.8, 0.12), '#2f4f3a', at(x + 1.6, 0.95, front + 0.05));
  p.solid(box(1.2, 1.0, 0.1), '#3b4a56', at(x - 1.1, 1.6, front + 0.02));
  p.solid(box(2.4, 0.15, 1.4), '#8a7d6e', at(x + 1.3, 0.3, front + 0.7));
  p.solid(box(2.4, 0.1, 1.4), trim, at(x + 1.3, 2.4, front + 0.7));
  for (const px of [0.25, 2.35]) p.solid(box(0.1, 2.1, 0.1), trim, at(x + px, 1.35, front + 1.35));
}

// the corner store: flat roof, big glowing window, striped awning, a little sign block with no words
function cornerStore(p, x) {
  const z = -8.6;
  const front = z + 2.6;
  p.solid(box(6.2, 5.2, 5.2), '#b5543a', at(x, 2.6, z));
  p.solid(box(6.4, 0.4, 5.4), '#5a4a40', at(x, 5.4, z));
  p.bright(box(4.6, 2.0, 0.05), '#ffd88f', at(x - 0.4, 1.4, front + 0.02));
  p.solid(box(1.0, 2.3, 0.12), '#2b3a55', at(x + 2.3, 1.15, front + 0.05));
  for (let s = 0; s < 8; s += 1) p.solid(box(0.76, 0.08, 1.4), s % 2 ? '#f2efe6' : '#2f6d3a', at(x - 2.66 + s * 0.76, 2.9, front + 0.6, 0, 0.35));
  p.solid(box(5, 0.8, 0.14), '#f2efe6', at(x, 3.9, front + 0.1));
  p.solid(box(4.8, 0.62, 0.16), STREETCAR_RED, at(x, 3.9, front + 0.11));
  for (let l = 0; l < 5; l += 1) p.solid(box(0.6, 0.14, 0.18), '#f2efe6', at(x - 1.6 + l * 0.8, 3.92, front + 0.12));
  // Bev's coffee counter under the awning, with two cups
  p.solid(box(2.0, 1.0, 0.8), '#6b4a33', at(x - 1.2, 0.5, front + 1.4));
  p.solid(box(2.1, 0.08, 0.9), '#e9e4da', at(x - 1.2, 1.04, front + 1.4));
  for (const cx of [-1.7, -1.4]) p.solid(cyl(0.08, 0.06, 0.2, 8), '#f2efe6', at(x + cx, 1.18, front + 1.4));
  p.solid(cyl(0.12, 0.12, 0.3, 8), '#2b2b2b', at(x - 0.6, 1.23, front + 1.4));
  // Rocco's porch steps and the green bin he is proud of opening
  p.solid(box(1.6, 0.3, 0.9), '#8a7d6e', at(x + 2.3, 0.15, front + 0.6));
  p.solid(box(0.8, 1.0, 0.8), '#2e7d32', at(x + 3.5, 0.5, front + 0.6));
  p.solid(box(0.85, 0.1, 0.85), '#24612a', at(x + 3.5, 1.05, front + 0.6, 0, -0.4));
}

function streetcar(p, base) {
  const m = (x, y, z, ry, rx, rz) => base.clone().multiply(at(x, y, z, ry, rx, rz));
  p.solid(box(7.6, 2.0, 2.2), STREETCAR_RED, m(0, 1.6, 0));
  p.solid(box(7.6, 0.5, 2.25), '#f2efe6', m(0, 0.75, 0));
  p.solid(box(7.4, 0.25, 2.0), '#2b2b2b', m(0, 2.7, 0));
  for (let w = 0; w < 6; w += 1) p.solid(box(0.9, 0.8, 0.05), '#26313a', m(-3.0 + w * 1.15, 1.95, 1.11));
  p.solid(box(0.05, 1.0, 1.7), '#26313a', m(3.81, 1.95, 0));
  p.bright(box(0.05, 0.25, 0.6), '#fff2b3', m(3.82, 1.1, 0));
  p.solid(box(0.6, 1.6, 0.05), '#2b2b2b', m(1.0, 1.4, 1.12));
  p.solid(box(0.08, 1.6, 0.08), '#2b2b2b', m(-1.0, 3.5, 0, 0, 0, -0.6));
  for (const wx of [-2.6, 2.6]) p.solid(box(1.4, 0.5, 1.6), '#1c1c1c', m(wx, 0.3, 0));
}

function stop(p, x, z) {
  p.solid(cyl(0.06, 0.06, 2.8, 6), '#2b2e33', at(x, 1.4, z));
  p.solid(box(0.7, 0.7, 0.08), STREETCAR_RED, at(x, 2.6, z));
  p.solid(box(0.5, 0.5, 0.1), '#f2efe6', at(x, 2.6, z));
  p.solid(box(1.8, 0.1, 0.5), '#8a8f94', at(x + 1.4, 0.55, z));
  for (const bx of [0.6, 2.2]) p.solid(box(0.08, 0.5, 0.4), '#2b2e33', at(x + bx, 0.25, z));
}

// a park court: blue surface, white lines, a hoop with a backboard
function court(p, x, z) {
  p.solid(box(7, 0.06, 5.5), '#2a5db0', at(x, 0.02, z));
  p.solid(box(7, 0.07, 0.08), '#f2efe6', at(x, 0.03, z + 2.7));
  p.solid(box(0.08, 0.07, 5.5), '#f2efe6', at(x + 3.5, 0.03, z));
  p.solid(box(2.2, 0.07, 0.08), '#f2efe6', at(x - 1.5, 0.03, z + 1.2));
  p.solid(cyl(0.09, 0.09, 3.2, 6), '#5a5f66', at(x - 3.0, 1.6, z));
  p.solid(box(0.08, 1.0, 1.6), '#f2efe6', at(x - 2.6, 3.1, z));
  p.solid(new THREE.TorusGeometry(0.25, 0.03, 4, 10), '#e8862a', at(x - 2.3, 2.75, z, 0, Math.PI / 2));
  p.solid(new THREE.SphereGeometry(0.2, 8, 6), '#e8862a', at(x - 0.6, 0.2, z + 0.8));
}

function maple(p, x, z, s = 1, k = 0) {
  p.solid(cyl(0.14 * s, 0.2 * s, 2.0 * s, 6), '#5b3b22', at(x, 1.0 * s, z));
  p.solid(new THREE.IcosahedronGeometry(1.05 * s, 0), LEAVES[k % LEAVES.length], at(x, 2.6 * s, z));
  p.solid(new THREE.IcosahedronGeometry(0.7 * s, 0), LEAVES[(k + 1) % LEAVES.length], at(x + 0.6 * s, 3.1 * s, z + 0.2));
}

// a generic downtown skyline far behind the houses, plus one tall needle tower (no real building's details)
function skyline(p) {
  const z = -34;
  const blocks = [[-26, 14], [-21, 20], [-16, 11], [-12, 24], [-7, 17], [-3, 28], [2, 15], [7, 22], [12, 18], [17, 26], [22, 13], [27, 19]];
  blocks.forEach(([x, h], i) => {
    p.solid(box(4, h, 4), i % 2 ? '#8ea3b5' : '#7d93a8', at(x, h / 2, z - (i % 3) * 2));
    for (let f = 2; f < h - 1; f += 3) p.bright(box(3.2, 0.25, 0.05), '#c9d8e6', at(x, f, z - (i % 3) * 2 + 2.02));
  });
  const tx = 9.5;
  p.solid(cyl(0.5, 1.4, 34, 6), '#9aaab8', at(tx, 17, z - 3));
  p.solid(cyl(2.0, 2.0, 1.6, 10), '#8899a8', at(tx, 30, z - 3));
  p.solid(cyl(0.12, 0.3, 9, 6), '#9aaab8', at(tx, 38.5, z - 3));
}

export function buildTorontoSet() {
  const p = painter();
  p.solid(box(60, 0.2, 60), '#4e5156', at(0, -0.1, 0));
  p.solid(box(60, 0.3, 8.5), '#b9b3a8', at(0, -0.05, -2.3));
  for (const rz of [3.4, 4.8]) p.solid(box(60, 0.06, 0.12), '#8a8f94', at(0, 0.03, rz));
  for (let k = 0; k < 30; k += 1) p.solid(box(1.2, 0.04, 0.12), '#e9e4da', at(-29 + k * 2, 0.02, 6.6));
  for (let i = 0; i < 7; i += 1) if (i !== 3) house(p, i, (i - 3) * 6);
  cornerStore(p, 0);
  streetcar(p, at(9.5, 0, 4.1));
  stop(p, 4.6, -1.4);
  court(p, -11, -3.6);
  [[-5.6, -4.9, 0.9], [5.8, -5.3, 1], [-15.4, -6.2, 1.1], [14.6, -5.6, 0.9]].forEach(([x, z, s], k) => maple(p, x, z, s, k));
  for (let x = -14; x <= 14; x += 7) {
    p.solid(cyl(0.06, 0.08, 6, 6), '#2b2e33', at(x, 3, 1.4));
    p.solid(box(0.1, 0.1, 4.2), '#2b2e33', at(x, 6, 3.4));
  }
  p.solid(box(60, 0.04, 0.04), '#2b2e33', at(0, 5.9, 4.1));
  skyline(p);

  const set = new THREE.Group();
  set.name = 'toronto-set';
  set.add(new THREE.Mesh(mergeGeometries(p.lit), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true })));
  set.add(new THREE.Mesh(mergeGeometries(p.glow), new THREE.MeshBasicMaterial({ vertexColors: true })));
  return set;
}

// Crisp autumn light: overcast grey-blue (low trust) to a bright blue sky (high trust).
export const TORONTO_SKY = { low: '#b4c0cc', high: '#8ec5f0' };
