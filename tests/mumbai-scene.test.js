import { describe, it, expect } from 'vitest';
import { buildMumbaiSet, MUMBAI_SKY } from '../src/game/mumbaiScene.js';

describe('Mumbai 3D set', () => {
  const set = buildMumbaiSet();
  const meshes = [];
  set.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });

  it('is two merged meshes (lit + glowing) and adds no lights', () => {
    expect(meshes).toHaveLength(2);
    let lights = 0;
    set.traverse((o) => (lights += o.isLight ? 1 : 0));
    expect(lights).toBe(0);
  });

  it('stays light enough for phones', () => {
    const tris = meshes.reduce((n, m) => n + m.geometry.attributes.position.count / 3, 0);
    expect(tris).toBeLessThan(30000);
  });

  it('has a warm evening sky', () => {
    expect(MUMBAI_SKY.low).toMatch(/^#/);
    expect(MUMBAI_SKY.high).toMatch(/^#/);
  });
});
