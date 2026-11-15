import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { collectLines, buildJobs } from '../scripts/voice-lines.js';
import scotland from '../src/content/scotland.json';
import voiceConfig from '../scripts/voice-config.json';

describe('voice line jobs', () => {
  it('collects intro, outro, each test line and its three reactions', () => {
    expect(collectLines(scotland)).toHaveLength(2 + scotland.test.length * 4);
  });

  it('adds direction tags to reactions but keeps reference lines plain', () => {
    const jobs = buildJobs(scotland, voiceConfig.scotland);
    const byFile = Object.fromEntries(jobs.map((j) => [j.audio.split('/').pop(), j.prompt]));
    expect(byFile['intro.mp3']).toMatch(/^\[suspicious\] /);
    for (const item of scotland.test) expect(byFile[item.audio.split('/').pop()]).toBe(item.line);
  });

  it('skips lines without text or audio', () => {
    expect(collectLines({ character: { intro: { text: 'hi' } }, test: [] })).toEqual([]);
  });

  it('has an mp3 in public/ for every line in scotland.json', () => {
    const missing = collectLines(scotland).filter((l) => !existsSync(`public/${l.audio}`));
    expect(missing).toEqual([]);
  });

  it('has a celebration line and mp3 for every placement level', () => {
    for (const level of scotland.path) {
      expect(level.celebration?.text).toBeTruthy();
      expect(existsSync(`public/${level.celebration.audio}`)).toBe(true);
    }
  });

  it('voices the Glasgow NPC greetings in their own voices (no AI call for hello)', async () => {
    const cast = (await import('../src/content/cast.json')).default;
    const jobs = buildJobs({ character: {}, test: [] }, voiceConfig.scotland, cast);
    expect(jobs.map((j) => [j.audio, j.voiceId])).toEqual([
      ['assets/audio/scotland/greeting-senga.mp3', voiceConfig.scotland.characters.senga.voiceId],
      ['assets/audio/scotland/greeting-hamish.mp3', voiceConfig.scotland.characters.hamish.voiceId],
    ]);
  });

  it('says every placement line in the Glasgow voice', () => {
    expect(new Set(buildJobs(scotland, voiceConfig.scotland).map((j) => j.voiceId))).toEqual(new Set([voiceConfig.scotland.voiceId]));
  });
});
