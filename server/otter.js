// POST /api/otter: the player said something; the Devin Otter (Claude) answers and ElevenLabs voices it.
// Shared by the Vite dev middleware (vite.config.js) and the Vercel function (api/otter.js).
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { normalise, similarity } from '../src/voice/match.js';
import { REPLY_MAX, fitReply, turnUsage } from './cost.js';
import { cachedVoice } from './ttsCache.js';
import { clientIp, createDailyCap, createRateLimiter, maxTurnsPerDay } from './limits.js';
import { OtterTurn, ALL_CHARACTERS, regionOf, systemPromptFor, turnSchemaFor } from './otter-prompt.js';

const MODEL = 'claude-opus-5-5';
// Request size: the model only needs the last few lines to stay in the moment, and a short spoken
// line fits easily in 350 tokens of JSON. The system prompt stays byte-stable so it is prompt-cached.
export const MAX_TOKENS = 350;
export const HISTORY_LINES = 8;
const SHORT_REPLY = `Say "reply" the way a real person talks: natural and warm, with contractions. One short sentence plus a question, usually about 110 characters (never over ${REPLY_MAX}).`;

// OTTER_MODEL picks the main model (default unchanged). OTTER_MODEL_FAST, if set, takes the simple
// turns: the opening greeting, quest turns, and short answers with no "say it back" attempt.
export function modelFor({ opening = false, kind = 'chat', said = '', echo = '' }, env = {}) {
  const main = env.OTTER_MODEL || MODEL;
  const fast = env.OTTER_MODEL_FAST || main;
  const words = said.trim().split(/\s+/).filter(Boolean).length;
  return opening || kind === 'quest' || (words <= 4 && !echo) ? fast : main;
}
// ElevenLabs voices (Voice Design, Glaswegian). VOICE_<ID> env vars override, e.g. VOICE_SENGA.
const VOICES = {
  otter: '9wOu10b6k3SOUgwDbKKv', // Devin Otter (Glaswegian)
  senga: 'U8lGdXfIYVx0Nas6m5XL', // Senga (Glasgow seagull)
  hamish: 'KnVW5icoKhKlU7DbTW8i', // Big Hamish (Glasgow bus driver)
};
// Mumbai characters have no designed voice yet: without a VOICE_<ID> override they get no TTS (browser
// voice) rather than a Glaswegian one.
export const voiceFor = (npc, env = {}) =>
  env[`VOICE_${npc.toUpperCase()}`] || VOICES[npc] || (regionOf(npc) === 'scotland' ? VOICES.otter : null);
// Senga's and Hamish's voices live on Sadman's ElevenLabs account; the otter's on the account behind
// ELEVENLABS_API_KEY. ELEVENLABS_NPC_API_KEY (Sadman's) voices the NPCs when it's set.
const keyFor = (npc, env) => (npc !== 'otter' && env.ELEVENLABS_NPC_API_KEY) || env.ELEVENLABS_API_KEY;
// If a voice isn't on the key's account, fall back to a standard ElevenLabs voice (on every account)
// rather than the browser's robot voice.
const STANDARD = { senga: 'Xb7hH8MSUJpSbSDYk0k2', hamish: 'JBFqnCBsd6RMkjVDRZzb', otter: 'JBFqnCBsd6RMkjVDRZzb' };
const TTS_MODEL = 'eleven_v3';
// TTS_MODEL_LIVE voices the improvised replies (default unchanged). A flash/turbo model costs about half
// per character; authored lines are pre-generated mp3s and keep v3. Non-v3 models read audio tags aloud,
// so those are stripped first.
export const liveTtsModel = (env = {}) => env.TTS_MODEL_LIVE || TTS_MODEL;
export const ttsText = (text, model) => (model === 'eleven_v3' ? text : stripTags(text));
const MAX_TURNS = 8;
const START_TRUST = 30;

const STT_MODEL = 'scribe_v1';
const MAX_AUDIO_B64 = 2_000_000; // ~1.5 MB of audio, far more than 15 s of speech
const MAX_BODY_BYTES = MAX_AUDIO_B64 + 50_000;

// One limiter per route, and one cap on AI turns across every player on this instance.
const limiters = new Map();
const limiterFor = (route) => limiters.get(route) ?? limiters.set(route, createRateLimiter()).get(route);
const aiTurns = createDailyCap();

// What a character says when the day's AI turns are spent: no vendor is called.
const CAPPED = {
  scotland: "Ach, ah'm aw talked oot the day, pal. Come back the morra an' we'll have a proper blether.",
  mumbai: "Arre, I've talked so much today, my voice is gone! Come back tomorrow, na?",
};
function authoredTurn({ trust, turn, npc }, reply, extra = {}) {
  return {
    heard: '',
    reply,
    mood: 'ok',
    action: 'none',
    hint: '',
    suggestions: [],
    soundedLocal: false,
    trust,
    delta: 0,
    accentDelta: 0,
    echoScore: null,
    echo: '',
    echoAudio: null,
    turn,
    maxTurns: MAX_TURNS,
    outcome: 'continue',
    audio: null,
    npc,
    ...extra,
  };
}

const Request = z.object({
  said: z.string().max(400).default(''),
  // The recorded answer (base64) when the browser can't do speech recognition itself.
  audio: z.string().max(MAX_AUDIO_B64).optional(),
  audioType: z.string().max(60).regex(/^audio\/[\w.+-]+(;\s*codecs=[\w.+-]+)?$/).optional(),
  trust: z.number().min(0).max(100).default(START_TRUST),
  npc: z.enum(Object.keys(ALL_CHARACTERS)).default('otter'),
  // true: the player just walked up; the character greets them (not a turn, trust unchanged)
  opening: z.boolean().default(false),
  // How local the player's voice sounded (0-1, measured in the browser), and how well they matched
  // the last "say it back" phrase. null when it couldn't be measured.
  accent: z.number().min(0).max(1).nullable().default(null),
  echoAccent: z.number().min(0).max(1).nullable().default(null),
  echo: z.string().max(60).default(''),
  kind: z.enum(['chat', 'quest']).default('chat'),
  turn: z.number().int().min(0).max(50).default(0),
  history: z
    .array(z.object({ who: z.enum(['player', 'otter']), text: z.string().max(400) }))
    .max(30)
    .default([]),
});

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const stripTags = (text) => text.replace(/\[[^\]]*\]\s*/g, '').trim();
const clamp = (v) => Math.max(0, Math.min(100, v));

const pct = (v) => Math.round(v * 100);
function earsLine(accent, echoScore, echo) {
  const lines = [];
  if (echoScore !== null) lines.push(`They were saying back your phrase "${echo}". How well they matched it (words + accent): ${pct(echoScore)}/100.`);
  if (accent !== null) {
    const verdict = accent >= 0.65 ? 'sounds like a local' : accent >= 0.4 ? 'sounds half local' : 'sounds like a tourist';
    lines.push(`Their voice (pitch and rhythm vs a local voice): ${pct(accent)}/100, ${verdict}.`);
  }
  return lines.length ? lines.join('\n') : 'Their accent could not be measured this time.';
}

export function transcript(history, said, trust, turn, ears) {
  const lines = history.map((h) => `${h.who === 'player' ? 'Player' : 'You'}: ${h.text}`);
  return [
    lines.length ? `Conversation so far:\n${lines.join('\n')}` : 'This is the start of the conversation.',
    `Current trust: ${trust}/100. Turn ${turn + 1} of ${MAX_TURNS}.`,
    ears.startsWith('OPENING') ? null : `The player just said (speech-to-text): "${said || '(nothing heard)'}"`,
    ears,
  ]
    .filter(Boolean)
    .join('\n\n');
}

// The accent moves trust by itself, on top of what the character decides: up to +/-6 for a normal
// answer, up to +/-15 for a "say it back" attempt. Kept outside the model so it's fair and steady.
// "Say it back": share of the phrase's words the player said (fuzzy, so STT spellings count).
export function echoWords(said, echo) {
  const want = normalise(echo).split(' ').filter(Boolean);
  const got = normalise(said).split(' ').filter(Boolean);
  if (!want.length) return 0;
  const hit = want.filter((w) => got.some((g) => similarity(g, w) >= 0.67)).length;
  return hit / want.length;
}

export function echoScoreOf(said, echo, echoAccent) {
  if (!echo) return null;
  const words = echoWords(said, echo);
  return echoAccent === null ? words : 0.5 * words + 0.5 * echoAccent;
}

export function accentDelta(accent, echoScore) {
  if (echoScore !== null) return Math.round((echoScore - 0.5) * 30);
  if (accent !== null) return Math.round((accent - 0.5) * 12);
  return 0;
}

// When the model declines, the character changes the subject in its own voice.
const REFUSAL = {
  scotland: {
    reply: "Och, let's no go there. Tell us whit ye're up tae the day?",
    mood: 'ok',
    action: 'none',
    trust_delta: 0,
    sounded_local: false,
    hint: '',
    echo: '',
    suggestions: [
      { say: "Ah'm just oot fur a wee wander", means: "I'm just out for a little walk" },
      { say: 'Gaun fur a fish supper, pal', means: 'Going for fish and chips, mate' },
    ],
  },
  mumbai: {
    reply: 'Arre, chhodo na. Tell me, have you eaten or not?',
    mood: 'ok',
    action: 'none',
    trust_delta: 0,
    sounded_local: false,
    hint: '',
    echo: '',
    suggestions: [
      { say: 'Haan Aunty, the biryani is too good', means: 'Yes Aunty, the biryani is really good' },
      { say: 'Bas Aunty, one more gulab jamun only', means: "Enough Aunty, just one more sweet" },
    ],
  },
};

async function askOtter(client, model, npc, history, said, trust, turn, ears) {
  const user = `${transcript(history.slice(-HISTORY_LINES), said, trust, turn, ears)}\n\n${SHORT_REPLY}`;
  const response = await client.beta.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: turnSchemaFor(npc) } },
    system: [{ type: 'text', text: systemPromptFor(npc), cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
  });
  const usage = response.usage;
  if (response.stop_reason === 'refusal') return { out: { ...REFUSAL[regionOf(npc)] }, user, text: '', usage };
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new HttpError(502, `The otter gave no text (stop_reason ${response.stop_reason})`);
  const raw = JSON.parse(text);
  if (typeof raw.reply === 'string') raw.reply = fitReply(raw.reply);
  return { out: OtterTurn.parse(raw), user, text, usage };
}

async function voice(line, key, voiceId, model = TTS_MODEL) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: line, model_id: model }),
  });
  if (!res.ok) throw new HttpError(502, `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 160)}`);
  return Buffer.from(await res.arrayBuffer()).toString('base64');
}

// ElevenLabs Scribe: the player's recorded answer -> text.
export async function transcribe(base64, type, key) {
  const mime = type || 'audio/webm';
  const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
  const form = new FormData();
  form.append('model_id', STT_MODEL);
  form.append('file', new Blob([Buffer.from(base64, 'base64')], { type: mime }), `answer.${ext}`);
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });
  if (!res.ok) throw new HttpError(502, `ElevenLabs STT ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  // Drop sound-event tags like "(rain)" or "[music]" so only words reach the otter.
  return String(data.text ?? '')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

function outcomeOf(trust, turn) {
  if (trust >= 100) return 'local';
  if (trust <= 0) return 'busted';
  if (turn + 1 >= MAX_TURNS) return 'out_of_time';
  return 'continue';
}

// One cache per TTS model, so a line voiced by one model is never served for another.
const voiceCaches = new Map();
const ttsCacheStats = () =>
  [...voiceCaches.values()].reduce((t, c) => ({ hits: t.hits + c.stats.hits, misses: t.misses + c.stats.misses }), { hits: 0, misses: 0 });
const voiceCachedFor = (model) =>
  voiceCaches.get(model) ?? voiceCaches.set(model, cachedVoice((text, key, id) => voice(text, key, id, model))).get(model);
const NOT_HEARD = {
  scotland: "Sorry pal, couldnae hear ye. Gie it another go?",
  mumbai: "Sorry yaar, I couldn't hear you. Say it once more?",
};

// deps.client lets tests pass a fake model client; real traffic builds the Anthropic client.
export async function handleOtter(body, env, deps = {}) {
  const parsed = Request.safeParse(body ?? {});
  if (!parsed.success) throw new HttpError(400, `Bad request: ${parsed.error.issues[0]?.message}`);
  const { trust, turn, history, audio: answerAudio, audioType, npc, accent, echoAccent, echo, opening, kind } = parsed.data;
  if (!aiTurns.take(maxTurnsPerDay(env))) {
    console.warn('[otter] daily AI turn cap reached: authored fallback, no vendor calls');
    return authoredTurn(parsed.data, CAPPED[regionOf(npc)], { capped: true });
  }
  let said = opening ? '' : parsed.data.said;
  if (answerAudio && !opening) {
    if (!env.ELEVENLABS_API_KEY) throw new HttpError(500, 'ELEVENLABS_API_KEY is needed to transcribe audio');
    said = await transcribe(answerAudio, audioType, env.ELEVENLABS_API_KEY);
  }

  // Nothing heard: an authored line, no model call and no TTS (the client speaks it with the browser voice).
  if (!opening && !said.trim()) return authoredTurn(parsed.data, NOT_HEARD[regionOf(npc)], { notHeard: true });

  // With no key, the SDK uses the local `ant auth login` profile (dev only; deploys need the key).
  const client =
    deps.client ?? (env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : new Anthropic());
  const model = modelFor({ opening, kind, said, echo }, env);
  const echoScore = said.trim() ? echoScoreOf(said, echo, echoAccent) : null;
  const ears = opening
    ? 'OPENING: the player has just walked up to you. Nobody has said anything yet. Greet them in character in one or two short spoken sentences and ask your first question. trust_delta must be 0 and echo must be empty.'
    : earsLine(accent, echoScore, echo);
  const asked = await askOtter(client, model, npc, history, said.trim(), trust, turn, ears);
  const turnOut = asked.out;
  if (opening) {
    turnOut.trust_delta = 0;
    turnOut.echo = '';
  }
  const fromAccent = said.trim() ? accentDelta(accent, echoScore) : 0;
  const newTrust = clamp(trust + turnOut.trust_delta + fromAccent);
  const voiceId = voiceFor(npc, env);
  let audio = null;
  let echoAudio = null;
  const tts = Boolean(env.ELEVENLABS_API_KEY && voiceId);
  if (!env.ELEVENLABS_API_KEY) {
    console.warn('[otter] ELEVENLABS_API_KEY not set: the client will use the browser voice');
  } else if (!voiceId) {
    console.warn(`[otter] no ElevenLabs voice for ${npc} yet (set VOICE_${npc.toUpperCase()}): the client will use the browser voice`);
  } else {
    try {
      // The reply and the "say it back" phrase are voiced at the same time; the phrase clip is what
      // the player's attempt gets compared with.
      const key = keyFor(npc, env);
      const ttsModel = liveTtsModel(env);
      const voiceCached = voiceCachedFor(ttsModel);
      const speak = (line) => {
        const text = ttsText(line, ttsModel);
        return voiceCached(text, key, voiceId).catch((err) => {
          if (!/voice_not_found/.test(err.message)) throw err;
          console.warn(`[otter] voice ${voiceId} not on this ElevenLabs account, using a standard voice`);
          return voiceCached(text, key, STANDARD[npc] ?? STANDARD.otter);
        });
      };
      [audio, echoAudio] = await Promise.all([speak(turnOut.reply), turnOut.echo ? speak(turnOut.echo).catch(() => null) : null]);
    } catch (err) {
      console.error('[otter] TTS failed, client will use the browser voice:', err.message);
    }
  }
  logUsage({ npc, model, asked, tts: tts ? [turnOut.reply, turnOut.echo] : [], answerAudio });
  return {
    heard: said.trim(),
    reply: stripTags(turnOut.reply),
    mood: turnOut.mood,
    action: turnOut.action,
    hint: turnOut.hint,
    suggestions: (turnOut.suggestions || []).slice(0, 2),
    soundedLocal: turnOut.sounded_local,
    trust: newTrust,
    delta: newTrust - trust,
    accentDelta: fromAccent,
    echoScore,
    echo: turnOut.echo.trim(),
    echoAudio,
    turn: opening ? turn : turn + 1,
    maxTurns: MAX_TURNS,
    outcome: opening ? 'continue' : outcomeOf(newTrust, turn),
    audio,
  };
}

// Minimal Node (req, res) adapter used by both the dev server and Vercel.
export async function nodeHandler(req, res, env, handler = handleOtter) {
  const send = (status, data) => {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(data));
  };
  if (req.method !== 'POST') return send(405, { error: 'POST only' });
  const limit = limiterFor(handler.name || 'api').check(clientIp(req));
  if (!limit.ok) {
    res.setHeader('retry-after', String(limit.retryAfter));
    return send(429, { error: 'Too many requests. Take a breather and come back later.', retryAfter: limit.retryAfter, scope: limit.scope });
  }
  try {
    let body = req.body;
    if (body === undefined) {
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Request too large');
        chunks.push(c);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      body = raw ? JSON.parse(raw) : {};
    }
    send(200, await handler(body, env));
  } catch (err) {
    const status = err instanceof HttpError ? err.status : err instanceof SyntaxError ? 400 : 500;
    console.error('[otter]', status, err.message);
    send(status, { error: status >= 500 ? 'The otter is having a wee moment. Try again.' : err.message });
  }
}

// POST /api/stt: { audio (base64), audioType } -> { text }. The lesson's backup ears: Chrome's built-in
// recognition drops short Scots words like "aye"; ElevenLabs Scribe hears them.
export async function handleStt(body, env) {
  const audio = typeof body?.audio === 'string' ? body.audio : '';
  if (!audio) throw new HttpError(400, 'audio is required');
  if (audio.length > MAX_AUDIO_B64) throw new HttpError(413, 'Recording too long');
  if (!env.ELEVENLABS_API_KEY) throw new HttpError(500, 'ELEVENLABS_API_KEY is needed to transcribe audio');
  return { text: await transcribe(audio, String(body.audioType || ''), env.ELEVENLABS_API_KEY) };
}

// One line per turn with sizes only (never text, audio or keys), so cost can be read off the logs.
function logUsage({ npc, model, asked, tts, answerAudio }) {
  const est = turnUsage({
    system: systemPromptFor(npc),
    schema: JSON.stringify(turnSchemaFor(npc)),
    user: asked.user,
    output: asked.text,
    tts,
    audioB64: answerAudio ? answerAudio.length : 0,
    cachedSystem: true,
  });
  const u = asked.usage;
  const real = u
    ? { inputTokens: u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0), cachedInputTokens: u.cache_read_input_tokens ?? 0, outputTokens: u.output_tokens }
    : {};
  console.info('[otter] turn usage', JSON.stringify({ npc, model, ...est, ...real, ttsCache: ttsCacheStats() }));
}
