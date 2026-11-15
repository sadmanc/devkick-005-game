import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { collectLines, buildJobs } from '../scripts/voice-lines.js';
import scotland from '../src/content/scotland.json';
import voiceConfig from '../scripts/voice-config.json';

describe('voice line jobs', () => {
  it('collects intro, outro, each celebration, each test line and its three reactions', () => {
    expect(collectLines(scotland)).toHaveLength(2 + scotland.path.length + scotland.test.length * 4);
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
});

describe('Mumbai voice jobs (per character, pending native review)', async () => {
  const { collectQuestLines, voiceFor, charsOf } = await import('../scripts/voice-lines.js');
  const mumbai = (await import('../src/content/mumbai/mumbai.json')).default;
  const cutting = (await import('../src/content/mumbai/quests/cutting.json')).default;
  const meter = (await import('../src/content/mumbai/quests/meter.json')).default;
  const cast = (await import('../src/content/mumbai/cast.json')).default;
  const config = voiceConfig.mumbai;

  it('voices placement lines as Kaju, quest lines and greetings as their own character', () => {
    const jobs = buildJobs(mumbai, config, [cutting, meter], cast);
    expect(jobs.filter((j) => j.speaker === 'kaju').length).toBe(collectLines(mumbai).length + collectQuestLines(cutting).length + 1);
    expect(jobs.filter((j) => j.speaker === 'mangesh').length).toBe(collectQuestLines(meter).length + 1);
    expect(jobs.filter((j) => j.speaker === 'mor').map((j) => j.audio)).toEqual(['assets/audio/mumbai/greeting-mor.mp3']);
  });

  it('gives every quest line a unique audio path under assets/audio/mumbai/quests', () => {
    const paths = [cutting, meter].flatMap((q) => collectQuestLines(q).map((l) => l.audio));
    expect(paths.every((p) => p.startsWith(`assets/audio/mumbai/quests/`))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('falls back to the place voice, and per-character voices win', () => {
    expect(voiceFor({ voiceId: 'place' }, 'kaju')).toBe('place');
    expect(voiceFor({ voiceId: 'place', characters: { kaju: { voiceId: 'k' } } }, 'kaju')).toBe('k');
    expect(voiceFor(config, 'kaju')).toBe(null);
  });

  it('designs one voice per Mumbai character and stays inside the TTS budget', () => {
    expect(Object.keys(config.characters).sort()).toEqual(['kaju', 'mangesh', 'mor']);
    for (const c of Object.values(config.characters)) expect(c.design.voice_description).toMatch(/Mumbai/);
    expect(charsOf(buildJobs(mumbai, config, [cutting, meter], cast))).toBeLessThan(10000);
  });

  it('keeps Glasgow jobs on the one place voice', () => {
    expect(new Set(buildJobs(scotland, voiceConfig.scotland).map((j) => j.voiceId))).toEqual(new Set([voiceConfig.scotland.voiceId]));
  });

  it('voices the Glasgow NPC greetings in their own voices (no AI call for hello)', async () => {
    const cast = (await import('../src/content/cast.json')).default;
    const jobs = buildJobs({ character: {}, test: [] }, voiceConfig.scotland, [], cast);
    expect(jobs.map((j) => [j.audio, j.voiceId])).toEqual([
      ['assets/audio/scotland/greeting-senga.mp3', voiceConfig.scotland.characters.senga.voiceId],
      ['assets/audio/scotland/greeting-hamish.mp3', voiceConfig.scotland.characters.hamish.voiceId],
    ]);
  });
});
