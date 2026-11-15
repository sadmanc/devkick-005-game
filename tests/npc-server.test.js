import { describe, expect, it } from 'vitest';
import { accentDelta, echoScoreOf, echoWords } from '../server/otter.js';
import { CHARACTERS, MUMBAI_CHARACTERS, OTTER_TURN_SCHEMA, regionOf, systemPromptFor, turnSchemaFor } from '../server/otter-prompt.js';

describe('accent moves trust', () => {
  it('a normal answer moves trust up to 6 either way', () => {
    expect(accentDelta(1, null)).toBe(6);
    expect(accentDelta(0, null)).toBe(-6);
    expect(accentDelta(0.5, null)).toBe(0);
    expect(accentDelta(null, null)).toBe(0);
  });
  it('a say-it-back attempt moves it up to 15 either way', () => {
    expect(accentDelta(0.2, 1)).toBe(15);
    expect(accentDelta(0.9, 0)).toBe(-15);
  });
});

describe('say it back', () => {
  it('counts the phrase words the player said, allowing speech-to-text spellings', () => {
    expect(echoWords("aye I'm going to the toon", "Ah'm gaun tae the toon")).toBeGreaterThanOrEqual(0.4);
    expect(echoWords("ah'm gaun tae the toon", "Ah'm gaun tae the toon")).toBe(1);
    expect(echoWords('hello there', "Ah'm gaun tae the toon")).toBe(0);
  });
  it('mixes words and accent half and half, or words alone', () => {
    expect(echoScoreOf("ah'm gaun tae the toon", "Ah'm gaun tae the toon", 0.4)).toBeCloseTo(0.7);
    expect(echoScoreOf("ah'm gaun tae the toon", "Ah'm gaun tae the toon", null)).toBe(1);
    expect(echoScoreOf('anything', '', 0.9)).toBeNull();
  });
});

describe('characters', () => {
  it('each NPC has its own prompt with the shared rules and say-it-back', () => {
    for (const id of Object.keys(CHARACTERS)) {
      const p = systemPromptFor(id);
      expect(p).toContain(CHARACTERS[id]);
      expect(p).toContain('Respect rules');
      expect(p).toContain('Say it back');
    }
    expect(Object.keys(CHARACTERS)).toEqual(['otter', 'senga', 'hamish']);
  });
});

describe('regions', () => {
  it('Mumbai characters get their own rules, not Glasgow ones', () => {
    for (const id of Object.keys(MUMBAI_CHARACTERS)) {
      const p = systemPromptFor(id);
      expect(regionOf(id)).toBe('mumbai');
      expect(p).toContain(MUMBAI_CHARACTERS[id]);
      expect(p).toContain('Respect rules');
      expect(p).toContain('Mumbaikar');
      expect(p).not.toMatch(/Glaswegian|Scots/);
    }
  });
  it('shared rules appear in every region', () => {
    for (const id of ['otter', 'mor']) expect(systemPromptFor(id)).toContain('Answer with JSON only, matching the schema.');
  });
  it('Glasgow keeps the original schema object; Mumbai gets its own wording', () => {
    expect(turnSchemaFor('senga')).toBe(OTTER_TURN_SCHEMA);
    expect(turnSchemaFor('mor').properties.reply.description).toMatch(/Mumbai/);
    expect(JSON.stringify(turnSchemaFor('mor'))).not.toMatch(/Glaswegian/);
    expect(OTTER_TURN_SCHEMA.properties.reply.description).toMatch(/Glaswegian/);
  });
});
