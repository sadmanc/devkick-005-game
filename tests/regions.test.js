import { describe, expect, it } from 'vitest';
import { REGIONS, PENDING_REVIEW, getRegion, regionList } from '../src/content/regions/index.js';
import scotland from '../src/content/scotland.json';
import cast from '../src/content/cast.json';
import { SCOTS_WORDS, findScots } from '../src/game/scotsWords.js';
import { ALL_CHARACTERS } from '../server/otter-prompt.js';

const FIELDS = ['id', 'name', 'pin', 'content', 'cast', 'words', 'quests', 'scene', 'review'];

describe('region registry', () => {
  it('every region has the fields the shell needs', () => {
    for (const r of regionList()) {
      for (const f of FIELDS) expect(r, `${r.id}.${f}`).toHaveProperty(f);
      expect(r.pin.left).toBeGreaterThan(0);
      expect(r.pin.top).toBeLessThan(100);
      expect(r.content.test.length).toBe(3);
      expect(r.words.list.length).toBeGreaterThanOrEqual(12);
      expect(Object.keys(r.cast).length).toBeGreaterThanOrEqual(3);
      expect(Object.keys(r.cast).length).toBeLessThanOrEqual(4);
    }
  });
  it('Glasgow wraps the original files, untouched and live', () => {
    const g = REGIONS.scotland;
    expect(g.content).toBe(scotland);
    expect(g.cast).toBe(cast);
    expect(g.words.list).toBe(SCOTS_WORDS);
    expect(g.words.find).toBe(findScots);
    expect(g.review).toBeNull();
    expect(g.pin).toEqual({ left: 42.6, top: 34.9 });
    expect(Object.keys(scotland)).toEqual(['id', 'name', 'character', 'test', 'path', 'setting']);
  });
  it('Mumbai is a preview pending native review', () => {
    expect(REGIONS.mumbai.review).toBe(PENDING_REVIEW);
    expect(REGIONS.mumbai.content.review).toBe(PENDING_REVIEW);
  });
  it('placement items match the Glasgow shape', () => {
    const keys = Object.keys(scotland.test[0]).sort();
    for (const item of REGIONS.mumbai.content.test) {
      expect(Object.keys(item).sort()).toEqual(keys);
      expect(item.accepted.length).toBeGreaterThanOrEqual(5);
      expect(Object.keys(item.reactions)).toEqual(['good', 'ok', 'bad']);
    }
    expect(REGIONS.mumbai.content.path.map((l) => l.id)).toEqual(scotland.path.map((l) => l.id));
  });
  it('the server knows every free-talk character', () => {
    for (const r of regionList()) for (const c of Object.values(r.cast)) if (!c.quest) expect(ALL_CHARACTERS).toHaveProperty(c.id);
  });
  it('Mumbai has two quests on its cast and six lesson outlines, all pending native review', () => {
    const m = REGIONS.mumbai;
    for (const c of Object.values(m.cast)) if (c.quest) expect(m.quests[c.quest].character.id).toBe(c.id);
    expect(Object.keys(m.quests).sort()).toEqual(['cutting', 'meter']);
    expect(m.lessons.review).toBe('pending native review');
    expect(m.lessons.lessons).toHaveLength(6);
    expect(new Set(m.lessons.lessons.map((l) => l.kind))).toEqual(new Set(['tonality', 'grammar']));
    for (const l of m.lessons.lessons) for (const ex of l.examples) expect(ex.means).toBeTruthy();
  });
  it('unknown ids fall back to Glasgow', () => {
    expect(getRegion('atlantis')).toBe(REGIONS.scotland);
  });
});
