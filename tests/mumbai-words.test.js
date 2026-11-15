import { describe, expect, it } from 'vitest';
import { MUMBAI_WORDS, findMumbai } from '../src/game/mumbaiWords.js';

describe('Mumbai word tray', () => {
  it('has the 12 words from the brief', () => {
    expect(MUMBAI_WORDS.map((w) => w.id)).toEqual(['haan', 'nahi', 'yaar', 'arre', 'achha', 'chalo', 'bhaiya', 'bas', 'jugaad', 'timepass', 'cutting', 'scene']);
    for (const w of MUMBAI_WORDS) expect(w.means).toBeTruthy();
  });
  it('finds words the way speech-to-text spells them', () => {
    expect(findMumbai('Arre yaar, ek cutting dena bhaiya')).toEqual(['yaar', 'arre', 'bhaiya', 'cutting']);
    expect(findMumbai('Acha, chalo! Just time pass.')).toEqual(['achha', 'chalo', 'timepass']);
    expect(findMumbai("Haan ji, kya scene hai?")).toEqual(['haan', 'scene']);
  });
  it('does not fire on ordinary English', () => {
    expect(findMumbai('I took the bus, are you coming? No.')).toEqual([]);
  });
});
