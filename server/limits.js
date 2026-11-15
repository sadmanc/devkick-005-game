// Abuse and cost guards for the AI routes: a per-IP rate limit and a global daily cap on AI turns.
// Pure (time comes from `now`), so the tests drive them with a fake clock.
// shortcut: in-memory, per instance; move to a shared store (KV/Redis) before real traffic

const MINUTE = 60_000;
const dayOf = (t) => Math.floor(t / 86_400_000); // UTC day number

// check(key) -> { ok: true } | { ok: false, retryAfter (seconds), scope: 'minute' | 'day' }
export function createRateLimiter({ perMinute = 20, perDay = 300, now = Date.now, maxKeys = 50_000 } = {}) {
  const hits = new Map(); // key -> { recent: number[] (last minute), day, dayCount }
  return {
    check(key) {
      const t = now();
      const today = dayOf(t);
      let h = hits.get(key);
      if (!h || h.day !== today) {
        if (!h && hits.size >= maxKeys) hits.delete(hits.keys().next().value); // bound memory under a flood
        h = { recent: h?.recent ?? [], day: today, dayCount: 0 };
        hits.set(key, h);
      }
      h.recent = h.recent.filter((s) => t - s < MINUTE);
      if (h.dayCount >= perDay) return { ok: false, scope: 'day', retryAfter: Math.ceil(((today + 1) * 86_400_000 - t) / 1000) };
      if (h.recent.length >= perMinute) return { ok: false, scope: 'minute', retryAfter: Math.max(1, Math.ceil((h.recent[0] + MINUTE - t) / 1000)) };
      h.recent.push(t);
      h.dayCount += 1;
      return { ok: true };
    },
    size: () => hits.size,
  };
}

// take(max) -> true while today's AI turns are under max (counts the turn), false once spent.
export function createDailyCap({ now = Date.now } = {}) {
  let day = dayOf(now());
  let used = 0;
  const roll = () => {
    const today = dayOf(now());
    if (today !== day) {
      day = today;
      used = 0;
    }
  };
  return {
    take(max) {
      roll();
      if (used >= max) return false;
      used += 1;
      return true;
    },
    used: () => (roll(), used),
  };
}

export const DEFAULT_MAX_AI_TURNS_PER_DAY = 2000;
export function maxTurnsPerDay(env) {
  const n = Number.parseInt(env?.MAX_AI_TURNS_PER_DAY ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_MAX_AI_TURNS_PER_DAY;
}

// The caller's IP. Forwarded headers are only trusted behind a proxy that overwrites them (Vercel sets
// x-forwarded-for / x-real-ip itself); anywhere else a caller could rotate them to dodge the limits, so
// the socket address is used.
export function clientIp(req, trustProxy = false) {
  if (trustProxy) {
    const fwd = req.headers?.['x-forwarded-for'];
    const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
    if (first || req.headers?.['x-real-ip']) return first || req.headers['x-real-ip'];
  }
  return req.socket?.remoteAddress || 'unknown';
}
