import { describe, expect, it, vi } from 'vitest';
import cutting from '../src/content/mumbai/quests/cutting.json';
import meter from '../src/content/mumbai/quests/meter.json';
import { startQuest, questTurn, checklist, wordLine, wordingMode, line } from '../src/game/quest.js';

function play(quest, lines) {
  let { state } = startQuest(quest);
  let r;
  for (const l of lines) {
    r = questTurn(quest, state, l);
    state = r.state;
    if (r.ending) break;
  }
  return r;
}

describe('quest data', () => {
  it.each([cutting, meter])('$id is well formed and pending native review', (q) => {
    expect(q.review).toBe('pending native review');
    expect(q.wording).toBe('scripted');
    const ids = q.beats.map((b) => b.id);
    for (const b of q.beats) {
      expect(b.label).toBeTruthy();
      for (const it of b.intents) expect(it.next === 'end' || ids.includes(it.next)).toBe(true);
    }
    expect(q.beats.at(-1).intents.every((it) => it.next === 'end')).toBe(true);
    // every Hinglish line carries a plain-English meaning
    const lines = [...q.beats.flatMap((b) => [b.say, ...b.intents.map((i) => i.reply).filter(Boolean), ...(b.traps || []).map((t) => t.reply)]), ...q.traps.map((t) => t.reply), ...q.topics.map((t) => t.reply), ...Object.values(q.asides).flat(), q.endings.win, q.endings.lose];
    for (const l of lines) expect(l.means, l.text).toBeTruthy();
  });
});

describe('Ek cutting, bhaiya (Kaju)', () => {
  it('a regular wins: "Your usual?"', () => {
    const r = play(cutting, ['arre bhaiya kaise ho', 'do cutting aur ek bun maska bhaiya', 'haan yaar last over mein six kya match tha', 'kitna hua bhaiya']);
    expect(r.ending).toBe('win');
    expect(r.reply.text).toMatch(/usual/);
  });

  it('a polite tourist pays but does not win', () => {
    const r = play(cutting, ['hello how are you', 'could I have two teas please', 'I did not see the cricket', 'how much is it']);
    expect(r.ending).toBe('lose');
  });

  it('the chai tea latte trap costs mood and keeps you on the beat', () => {
    const { state } = startQuest(cutting);
    const s = { ...state, beat: 'order', done: ['greet'] };
    const r = questTurn(cutting, s, 'one chai tea latte please');
    expect(r.trap).toBe(true);
    expect(r.state.beat).toBe('order');
    expect(r.state.mood).toBeLessThan(s.mood);
    expect(r.reply.text).toMatch(/latte/i);
  });

  it('jumping ahead ticks off both beats', () => {
    const { state } = startQuest(cutting);
    const r = questTurn(cutting, state, 'bhaiya do cutting dena');
    expect(r.state.beat).toBe('order');
    const r2 = questTurn(cutting, state, 'do cutting dena');
    expect(r2.state.done).toEqual(['greet', 'order']);
    expect(r2.state.beat).toBe('cricket');
  });

  it('quotes you when lost', () => {
    const { state } = startQuest(cutting);
    const r = questTurn(cutting, state, 'banana umbrella');
    expect(r.moved).toBe(false);
    expect(r.reply.text).toMatch(/^"banana umbrella"\?/);
  });
});

describe('Meter se chalo (Mangesh)', () => {
  it('insisting on the meter wins the last ₹10', () => {
    const r = play(meter, ['bhaiya dadar chalo', 'nahi bhaiya meter se chalo na', 'theek hai chalo', 'shukriya bhaiya bas yahin rok do']);
    expect(r.ending).toBe('win');
    expect(r.reply.text).toMatch(/ten/);
  });

  it('brochure English is a trap', () => {
    const r = questTurn(meter, startQuest(meter).state, 'would you kindly convey me to my destination');
    expect(r.trap).toBe(true);
    expect(r.state.beat).toBe('where');
  });

  it('agreeing to a silly price is a trap, refusing it is not', () => {
    const s = { beat: 'meter', mood: 50, turns: 1, done: ['where'] };
    expect(questTurn(meter, s, 'okay fine 300').trap).toBe(true);
    const ok = questTurn(meter, s, 'nahi 300 nahi meter se chalo');
    expect(ok.trap).toBe(false);
    expect(ok.state.beat).toBe('fare');
  });

  it('enough traps and he drives off', () => {
    const r = play(meter, ['I wish to travel to my destination', 'would you kindly convey me', 'esteemed sir magnificent city']);
    expect(r.ending).toBe('lose');
  });
});

describe('beat tracker and wording hook', () => {
  it('checklist marks done and current beats', () => {
    const s = { beat: 'cricket', mood: 50, turns: 2, done: ['greet', 'order'] };
    expect(checklist(cutting, s)).toEqual([
      { id: 'greet', label: 'greeted', done: true, current: false },
      { id: 'order', label: 'ordered', done: true, current: false },
      { id: 'cricket', label: 'talked cricket', done: false, current: true },
      { id: 'pay', label: 'paid', done: false, current: false },
    ]);
  });

  it('defaults to scripted wording and falls back to it when AI fails', async () => {
    expect(wordingMode(cutting)).toBe('scripted');
    expect(wordingMode({}, 'ai')).toBe('ai');
    expect(wordingMode({}, 'nonsense')).toBe('scripted');
    const l = { text: 'Haan boss, bolo.', audio: 'a.mp3', means: 'Yes boss, tell me.' };
    const rephrase = vi.fn(async () => 'Bolo boss!');
    expect(await wordLine(l, {}, { rephrase })).toEqual(l);
    expect(rephrase).not.toHaveBeenCalled();
    expect(await wordLine(l, {}, { mode: 'ai', rephrase })).toEqual({ text: 'Bolo boss!', audio: null, means: l.means });
    expect(await wordLine(l, {}, { mode: 'ai', rephrase: async () => { throw new Error('down'); } })).toEqual(l);
    expect(line('hi')).toEqual({ text: 'hi', audio: null, means: null });
  });
});
