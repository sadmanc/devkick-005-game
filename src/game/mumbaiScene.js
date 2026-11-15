// Mumbai set for the 3D stage (preview): a warm-evening street corner, no rain. Kaju's chai tapri, a
// yellow-and-black auto-rickshaw for Mangesh, colourful 3-4 storey buildings with balconies, shop
// shutters and hand-painted-style sign blocks (no words, no brands), string lights and potted plants.
// Light on phones: every box is merged into two meshes (lit + glowing) and the set adds no lights.
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

const WALLS = ['#e8c07a', '#d98c6a', '#9fc2b5', '#f0d9b5', '#c97b84', '#8fb3d9', '#e3a857', '#b7d18f'];
const SIGNS = [
  ['#c0392b', '#f7d046'],
  ['#1f6f8b', '#f4f1de'],
  ['#2e7d32', '#ffe08a'],
  ['#f2a541', '#5a2a82'],
];
const BULBS = ['#ffd36b', '#ff8fa3', '#9be37a', '#ffb347', '#8fd3ff'];

function building(p, i, x) {
  const storeys = 3 + ((i * 5) % 2);
  const h = 3 + storeys * 2.6;
  const wall = WALLS[i % WALLS.length];
  const z = -8.5;
  const front = z + 2.5;
  p.solid(box(5.8, h, 5), wall, at(x, h / 2, z));
  p.solid(box(6, 0.4, 5.2), '#6b5d52', at(x, h + 0.2, z));
  if (i % 3 === 0) p.solid(cyl(0.6, 0.6, 1.1, 10), '#2b2b2b', at(x + 1.6, h + 0.95, z - 1));
  // shop: rolled-up shutter, the shop's glow below it, and a painted sign block with a border and "letters"
  p.solid(box(4.6, 0.7, 0.2), '#8d9196', at(x, 2.55, front + 0.1));
  for (let r = 0; r < 3; r += 1) p.solid(box(4.6, 0.05, 0.22), '#6c7075', at(x, 2.3 + r * 0.22, front + 0.12));
  if (i % 2) p.bright(box(4.2, 2.1, 0.05), '#ffcf86', at(x, 1.1, front + 0.02));
  else {
    p.solid(box(4.4, 2.1, 0.12), '#9aa0a6', at(x, 1.1, front + 0.06));
    for (let r = 0; r < 7; r += 1) p.solid(box(4.4, 0.04, 0.16), '#7d838a', at(x, 0.2 + r * 0.3, front + 0.08));
  }
  const [bg, fg] = SIGNS[i % SIGNS.length];
  p.solid(box(5, 0.85, 0.14), fg, at(x, 3.35, front + 0.2));
  p.solid(box(4.8, 0.7, 0.16), bg, at(x, 3.35, front + 0.21));
  for (let l = 0; l < 4; l += 1) p.solid(box(0.7, 0.16, 0.18), fg, at(x - 1.5 + l, 3.38, front + 0.22));
  // upper floors: windows (some lit for the evening) and a balcony with a railing
  for (let f = 1; f < storeys; f += 1) {
    const y = 3 + f * 2.6 - 1.1;
    for (const wx of [-1.6, 1.6]) {
      const win = box(1.1, 1.3, 0.1);
      if ((i + f + (wx > 0 ? 1 : 0)) % 3 === 0) p.bright(win, '#ffd38a', at(x + wx, y, front + 0.02));
      else p.solid(win, '#3b4a52', at(x + wx, y, front + 0.02));
    }
    p.solid(box(1.2, 1.9, 0.1), '#6d4c33', at(x, y - 0.25, front + 0.02));
    p.solid(box(4.6, 0.12, 0.8), '#d8d2c4', at(x, y - 1.15, front + 0.4));
    p.solid(box(4.6, 0.06, 0.06), '#2f3a40', at(x, y - 0.25, front + 0.78));
    for (let b = 0; b < 7; b += 1) p.solid(box(0.04, 0.8, 0.04), '#2f3a40', at(x - 2.25 + b * 0.75, y - 0.7, front + 0.78));
    if ((i + f) % 2) p.solid(box(0.9, 0.5, 0.02), BULBS[(i + f) % BULBS.length], at(x - 1, y - 0.55, front + 0.8));
  }
}

function tapri(p, base) {
  const m = (x, y, z, ry, rx, rz) => base.clone().multiply(at(x, y, z, ry, rx, rz));
  p.solid(box(1.9, 1, 0.9), '#2a6f97', m(0, 0.5, 0));
  p.solid(box(2, 0.08, 1), '#8a5a35', m(0, 1.04, 0));
  for (const [px, pz] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) p.solid(cyl(0.04, 0.04, 1.3, 6), '#5b3b22', m(px, 1.7, pz));
  for (let s = 0; s < 4; s += 1) p.solid(box(0.58, 0.07, 1.5), s % 2 ? '#f2f2ee' : '#e07a2f', m(-0.87 + s * 0.58, 2.38, 0.05, 0, 0.12));
  p.solid(cyl(0.16, 0.18, 0.14, 10), '#222222', m(-0.45, 1.15, 0));
  p.solid(cyl(0.13, 0.15, 0.26, 10), '#c0c4c8', m(-0.45, 1.35, 0));
  p.solid(new THREE.SphereGeometry(0.06, 8, 6), '#9aa0a6', m(-0.45, 1.5, 0));
  p.solid(cyl(0.02, 0.04, 0.22, 6), '#c0c4c8', m(-0.29, 1.4, 0, 0, 0, -0.9));
  p.solid(box(0.6, 0.03, 0.3), '#b0b4b8', m(0.35, 1.09, 0.1));
  for (let g = 0; g < 4; g += 1) p.solid(cyl(0.045, 0.035, 0.1, 8), '#d9a35b', m(0.15 + (g % 2) * 0.13, 1.16, 0.03 + Math.floor(g / 2) * 0.13));
  p.solid(box(1.2, 0.08, 0.4), '#7a4e2d', m(-1.6, 0.45, -0.1));
  for (const bx of [-2.1, -1.1]) p.solid(box(0.08, 0.45, 0.35), '#5b3b22', m(bx, 0.22, -0.1));
}

function autoRickshaw(p, base) {
  const m = (x, y, z, ry, rx, rz) => base.clone().multiply(at(x, y, z, ry, rx, rz));
  p.solid(box(1.9, 0.6, 1.3), '#1c1c1c', m(-0.2, 0.6, 0));
  p.solid(box(0.55, 1.05, 1.0), '#1c1c1c', m(1.0, 0.85, 0));
  p.solid(box(0.08, 0.6, 0.9), '#f2c230', m(1.1, 1.6, 0));
  p.solid(box(2.2, 0.1, 1.45), '#f2c230', m(0, 1.95, 0));
  p.solid(box(0.9, 1.1, 1.4), '#f2c230', m(-0.75, 1.4, 0));
  for (const z of [-0.68, 0.68]) p.solid(box(0.06, 1.1, 0.06), '#f2c230', m(0.95, 1.4, z));
  p.solid(box(0.7, 0.18, 1.1), '#7a3b2e', m(-0.4, 1.0, 0));
  p.solid(cyl(0.02, 0.02, 0.6, 6), '#555555', m(1.0, 1.25, 0, 0, Math.PI / 2));
  for (const [x, z] of [[1.15, 0], [-0.75, -0.62], [-0.75, 0.62]]) p.solid(cyl(0.27, 0.27, 0.16, 12), '#111111', m(x, 0.27, z, 0, Math.PI / 2));
  p.bright(new THREE.SphereGeometry(0.09, 8, 6), '#fff2b3', m(1.3, 0.95, 0));
}

function plant(p, x, z, s = 1) {
  p.solid(cyl(0.26 * s, 0.18 * s, 0.42 * s, 8), '#b5562f', at(x, 0.21 * s, z));
  p.solid(new THREE.IcosahedronGeometry(0.42 * s, 0), '#3f8f3a', at(x, 0.72 * s, z));
  p.solid(new THREE.IcosahedronGeometry(0.28 * s, 0), '#5cb045', at(x + 0.2 * s, 1.0 * s, z + 0.1));
}

function stringLights(p, x0, x1, y, z, sag = 0.6) {
  const n = Math.round((x1 - x0) / 0.55);
  for (let k = 0; k <= n; k += 1) {
    const t = k / n;
    const x = x0 + (x1 - x0) * t;
    const yy = y - sag * (1 - (2 * t - 1) ** 2);
    p.solid(box(0.56, 0.015, 0.015), '#2b2b2b', at(x, yy + 0.08, z));
    p.bright(new THREE.SphereGeometry(0.07, 6, 4), BULBS[k % BULBS.length], at(x, yy, z));
  }
}

export function buildMumbaiSet() {
  const p = painter();
  p.solid(box(60, 0.2, 60), '#5a5048', at(0, -0.1, 0));
  p.solid(box(60, 0.3, 8.5), '#b59f86', at(0, -0.05, -2.3));
  for (let k = 0; k < 60; k += 1) p.solid(box(1, 0.32, 0.25), k % 2 ? '#f2c230' : '#1c1c1c', at(-29.5 + k, -0.04, 1.95));
  for (let i = 0; i < 8; i += 1) building(p, i, (i - 3.5) * 6);
  tapri(p, at(0, 0, -2.2));
  autoRickshaw(p, at(6.2, 0, -2.6, -0.5));
  for (const [x, z, s] of [[-5.2, -4.8, 1.1], [-2.7, -5.6, 0.8], [1.9, -5.6, 0.9], [8.3, -5.4, 1], [-8.6, -5.5, 0.9]]) plant(p, x, z, s);
  stringLights(p, -12, 0, 4.6, -5.6);
  stringLights(p, 0, 12, 4.6, -5.6);
  stringLights(p, -1.1, 1.1, 2.3, -1.45, 0.1);

  const set = new THREE.Group();
  set.name = 'mumbai-set';
  set.add(new THREE.Mesh(mergeGeometries(p.lit), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true })));
  set.add(new THREE.Mesh(mergeGeometries(p.glow), new THREE.MeshBasicMaterial({ vertexColors: true })));
  return set;
}

// Warm evening light: dusk (low trust) to golden hour (high trust).
export const MUMBAI_SKY = { low: '#d9926b', high: '#f4c27f' };
