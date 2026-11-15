import { describe, expect, it } from 'vitest';
import { clientIp, createDailyCap, createRateLimiter, maxTurnsPerDay } from '../server/limits.js';

const clock = (t = Date.UTC(2026, 10, 15, 12)) => {
  const c = () => c.t;
  c.t = t;
  return c;
};

describe('per-IP rate limit', () => {
  it('allows 20 a minute, then asks the caller to wait', () => {
    const now = clock();
    const rl = createRateLimiter({ now });
    for (let i = 0; i < 20; i += 1) expect(rl.check('1.2.3.4').ok).toBe(true);
    const no = rl.check('1.2.3.4');
    expect(no).toMatchObject({ ok: false, scope: 'minute' });
    expect(no.retryAfter).toBeGreaterThan(0);
    expect(rl.check('5.6.7.8').ok).toBe(true); // other players are not affected
    now.t += 61_000;
    expect(rl.check('1.2.3.4').ok).toBe(true);
  });
  it('allows 300 a day, then waits until tomorrow (UTC)', () => {
    const now = clock();
    const rl = createRateLimiter({ now, perMinute: 1000 });
    for (let i = 0; i < 300; i += 1) expect(rl.check('ip').ok).toBe(true);
    const no = rl.check('ip');
    expect(no).toMatchObject({ ok: false, scope: 'day', retryAfter: 12 * 3600 });
    now.t += 12 * 3600 * 1000;
    expect(rl.check('ip').ok).toBe(true);
  });
  it('keeps memory bounded under a flood of new IPs', () => {
    const rl = createRateLimiter({ now: clock(), maxKeys: 100 });
    for (let i = 0; i < 1000; i += 1) rl.check(`ip${i}`);
    expect(rl.size()).toBeLessThanOrEqual(100);
  });
});

describe('daily AI turn cap', () => {
  it('stops at the cap and resets the next UTC day', () => {
    const now = clock();
    const cap = createDailyCap({ now });
    expect(cap.take(2)).toBe(true);
    expect(cap.take(2)).toBe(true);
    expect(cap.take(2)).toBe(false);
    expect(cap.used()).toBe(2);
    now.t += 86_400_000;
    expect(cap.take(2)).toBe(true);
  });
  it('reads MAX_AI_TURNS_PER_DAY, default 2000', () => {
    expect(maxTurnsPerDay({})).toBe(2000);
    expect(maxTurnsPerDay({ MAX_AI_TURNS_PER_DAY: '50' })).toBe(50);
    expect(maxTurnsPerDay({ MAX_AI_TURNS_PER_DAY: '0' })).toBe(0);
    expect(maxTurnsPerDay({ MAX_AI_TURNS_PER_DAY: 'lots' })).toBe(2000);
  });
});

describe('clientIp', () => {
  it('behind a trusted proxy uses the first forwarded hop, then the socket', () => {
    expect(clientIp({ headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } }, true)).toBe('9.9.9.9');
    expect(clientIp({ headers: {}, socket: { remoteAddress: '127.0.0.1' } }, true)).toBe('127.0.0.1');
  });
  it('ignores forwarded headers when there is no trusted proxy', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' }, socket: { remoteAddress: '127.0.0.1' } };
    expect(clientIp(req)).toBe('127.0.0.1');
  });
});

describe('API guards', async () => {
  const { handleOtter, nodeHandler } = await import('../server/otter.js');
  const { vi } = await import('vitest');
  const call = async (ip, handler) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = JSON.parse(b); } };
    await nodeHandler({ method: 'POST', headers: { 'x-forwarded-for': ip }, body: {} }, res, { VERCEL: '1' }, handler);
    return res;
  };
  it('answers 429 with Retry-After once an IP goes over 20 a minute', async () => {
    const ok = async function handleOtter() { return { fine: true }; };
    for (let i = 0; i < 20; i += 1) expect((await call('7.7.7.7', ok)).statusCode).toBe(200);
    const res = await call('7.7.7.7', ok);
    expect(res.statusCode).toBe(429);
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
    expect(res.body.retryAfter).toBeGreaterThan(0);
    expect((await call('8.8.8.8', ok)).statusCode).toBe(200);
  });
  it('past the daily cap, /api/otter answers in character without calling any vendor', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const env = { MAX_AI_TURNS_PER_DAY: '0', ELEVENLABS_API_KEY: 'test' };
    const glasgow = await handleOtter({ said: 'aye', audio: 'AAAA', npc: 'senga', trust: 40, turn: 2 }, env);
    expect(glasgow).toMatchObject({ capped: true, trust: 40, delta: 0, turn: 2, outcome: 'continue', audio: null });
    expect(glasgow.reply).toMatch(/morra/);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
  it('silent answers do not spend the daily AI budget', async () => {
    const env = { MAX_AI_TURNS_PER_DAY: '1' };
    for (let i = 0; i < 3; i += 1) expect((await handleOtter({ said: '', npc: 'senga' }, env)).notHeard).toBe(true);
    const create = vi.fn(async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ reply: 'Aye, whit ye havin?', mood: 'ok', action: 'none', trust_delta: 0, sounded_local: false, hint: '', echo: '', suggestions: [] }) }] }));
    const client = { beta: { messages: { create } } };
    const res = await handleOtter({ said: 'a fish supper please', npc: 'senga' }, env, { client });
    expect(res.capped).toBeUndefined();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
