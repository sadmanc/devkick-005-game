import { describe, it, expect, vi } from 'vitest';
import { handleOtter, modelFor, MAX_TOKENS, HISTORY_LINES } from '../server/otter.js';
import { systemPromptFor } from '../server/otter-prompt.js';
import { createLru, cachedVoice } from '../server/ttsCache.js';
import { turnUsage, tokensOf } from '../server/cost.js';

const TURN = {
  reply: 'Aye, no bad. Whit brings ye tae the West End?',
  mood: 'ok',
  action: 'none',
  trust_delta: 3,
  sounded_local: true,
  hint: '',
  echo: '',
  suggestions: [],
};
const fakeClient = (turn = TURN) => {
  const create = vi.fn(async () => ({
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: JSON.stringify(turn) }],
    usage: { input_tokens: 300, output_tokens: 60, cache_read_input_tokens: 1100 },
  }));
  return { create, client: { beta: { messages: { create } } } };
};
const env = { MAX_AI_TURNS_PER_DAY: '100000' };
const history = Array.from({ length: 14 }, (_, i) => ({ who: i % 2 ? 'otter' : 'player', text: `line ${i}` }));

describe('model routing', () => {
  it('defaults both tiers to the current model', () => {
    expect(modelFor({ said: 'aye' })).toBe(modelFor({ said: 'a long answer about the chippy on byres road', echo: 'x' }));
  });
  it('sends simple turns to OTTER_MODEL_FAST and the rest to OTTER_MODEL', () => {
    const e = { OTTER_MODEL: 'big', OTTER_MODEL_FAST: 'small' };
    expect(modelFor({ opening: true }, e)).toBe('small');
    expect(modelFor({ said: 'aye pal' }, e)).toBe('small');
    expect(modelFor({ said: 'aye pal', echo: 'gaun yersel' }, e)).toBe('big');
    expect(modelFor({ said: 'ah go tae the chippy every friday night' }, e)).toBe('big');
  });
});

describe('the model request', () => {
  it('is small: 350 max tokens, last 8 lines, stable cached system prompt, short-reply ask', async () => {
    const { client, create } = fakeClient();
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const out = await handleOtter(
      { said: 'aye pal ah go tae the chippy on byres road', npc: 'otter', history, turn: 7 },
      { ...env, OTTER_MODEL: 'big', OTTER_MODEL_FAST: 'small' },
      { client },
    );
    const req = create.mock.calls[0][0];
    expect(req.model).toBe('big');
    expect(req.max_tokens).toBe(MAX_TOKENS);
    expect(MAX_TOKENS).toBeLessThanOrEqual(400);
    expect(req.system[0].text).toBe(systemPromptFor('otter'));
    expect(req.system[0].cache_control).toEqual({ type: 'ephemeral' });
    const user = req.messages[0].content;
    expect(user).toContain('line 13');
    expect(user).toContain(`line ${14 - HISTORY_LINES}`);
    expect(user).not.toContain(`line ${13 - HISTORY_LINES}`);
    expect(user).toMatch(/One short sentence plus a question, usually about 110 characters \(never over 160\)/);
    expect(out.reply).toBe(TURN.reply);
    // the usage log carries sizes only, never the text
    const line = log.mock.calls.find((c) => c[0] === '[otter] turn usage')[1];
    expect(JSON.parse(line)).toMatchObject({ npc: 'otter', model: 'big', inputTokens: 1400, outputTokens: 60 });
    expect(line).not.toContain('chippy');
    log.mockRestore();
  });

  it('skips the model and TTS when nothing was heard', async () => {
    const { client, create } = fakeClient();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const glasgow = await handleOtter({ said: '   ', npc: 'otter', trust: 50, turn: 3 }, { ...env, ELEVENLABS_API_KEY: 'k' }, { client });
    expect(create).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(glasgow).toMatchObject({ notHeard: true, trust: 50, turn: 3, audio: null });
    expect(glasgow.reply).toMatch(/couldnae hear/);
    const retry = await handleOtter({ said: '', npc: 'otter', echo: 'pure dead brilliant', trust: 50, turn: 3 }, env, { client });
    expect(retry.echo).toBe('pure dead brilliant');
    fetchSpy.mockRestore();
  });
});

describe('TTS cache', () => {
  it('evicts the least recently used line', () => {
    const lru = createLru(2);
    lru.set('a', 1);
    lru.set('b', 2);
    lru.get('a');
    lru.set('c', 3);
    expect(lru.get('b')).toBeUndefined();
    expect(lru.get('a')).toBe(1);
    expect(lru.size).toBe(2);
  });
  it('voices the same voice + text once', async () => {
    const voice = vi.fn(async (text, key, id) => `${id}:${text}`);
    const speak = cachedVoice(voice);
    expect(await speak('Aye, nae bother.', 'k', 'v1')).toBe('v1:Aye, nae bother.');
    await speak('Aye, nae bother.', 'k', 'v1');
    await speak('Aye, nae bother.', 'k', 'v2');
    expect(voice).toHaveBeenCalledTimes(2);
    expect(speak.stats).toEqual({ hits: 1, misses: 2 });
  });
  it('shares one vendor call between concurrent requests, and forgets failures', async () => {
    const voice = vi.fn(async (text) => text);
    const speak = cachedVoice(voice);
    await Promise.all([speak('Aye.', 'k', 'v1'), speak('Aye.', 'k', 'v1')]);
    expect(voice).toHaveBeenCalledTimes(1);
    const flaky = vi.fn().mockRejectedValueOnce(new Error('503')).mockResolvedValue('ok');
    const speak2 = cachedVoice(flaky);
    await expect(speak2('Aye.', 'k', 'v1')).rejects.toThrow('503');
    expect(await speak2('Aye.', 'k', 'v1')).toBe('ok');
  });
});

describe('usage estimate', () => {
  it('counts tokens, TTS characters and STT seconds', () => {
    expect(tokensOf(400)).toBe(100);
    const u = turnUsage({ system: 'x'.repeat(800), user: 'y'.repeat(400), output: 'z'.repeat(200), tts: ['abc', null], audioB64: 16000, cachedSystem: true });
    expect(u).toEqual({ inputTokens: 300, cachedInputTokens: 200, outputTokens: 50, ttsChars: 3, sttSeconds: 3 });
  });
});

describe('fitReply (never cut a line mid-word)', async () => {
  const { fitReply } = await import('../server/cost.js');
  it('leaves normal replies alone', () => {
    expect(fitReply('Och, ye again? Whit dae ye want?')).toBe('Och, ye again? Whit dae ye want?');
  });
  it('cuts long replies at the last full sentence that fits', () => {
    const long = `${'Arre yaar, this is a long first sentence about chai and trains. '.repeat(3)}And one more.`;
    const out = fitReply(long, 140);
    expect(out.length).toBeLessThanOrEqual(140);
    expect(out.endsWith('.')).toBe(true);
  });
  it('falls back to a word boundary with an ellipsis', () => {
    const out = fitReply('word '.repeat(60).trim(), 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out).toMatch(/word\.\.\.$/);
  });
  it('keeps the ellipsis inside the cap when the last space is near the end', () => {
    const out = fitReply(`${'a'.repeat(158)} bb ccc`, 160);
    expect(out.length).toBeLessThanOrEqual(160);
  });
});

describe('reply length (one short sentence plus a question)', async () => {
  const { REPLY_MAX, fitReply } = await import('../server/cost.js');
  const { OtterTurn } = await import('../server/otter-prompt.js');
  it('caps replies at REPLY_MAX in both the fitter and the schema', () => {
    const long = 'Aye, the chippy on the corner does the best fish supper in the whole city. ' .repeat(4);
    const out = fitReply(long);
    expect(out.length).toBeLessThanOrEqual(REPLY_MAX);
    expect(OtterTurn.shape.reply.maxLength).toBe(REPLY_MAX);
  });
});

describe('TTS_MODEL_LIVE', async () => {
  const { liveTtsModel, ttsText } = await import('../server/otter.js');
  it('defaults to v3 and can be switched by env', () => {
    expect(liveTtsModel({})).toBe('eleven_v3');
    expect(liveTtsModel({ TTS_MODEL_LIVE: 'eleven_flash_v2_5' })).toBe('eleven_flash_v2_5');
  });
  it('keeps audio tags for v3 and strips them for other models', () => {
    expect(ttsText('[laughs] Aye, pal.', 'eleven_v3')).toBe('[laughs] Aye, pal.');
    expect(ttsText('[laughs] Aye, pal.', 'eleven_flash_v2_5')).toBe('Aye, pal.');
  });
});
