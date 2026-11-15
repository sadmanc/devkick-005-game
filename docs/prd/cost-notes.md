# Cost notes: what a conversation costs, before and after M3

Units only (tokens, TTS characters, STT seconds). Prices change; multiply by today's rate card.

## How this was measured

- `node scripts/cost-estimate.js` (or `npx vite-node scripts/cost-estimate.js`) builds a real request
  for every call in one free-talk conversation with the actual Glasgow system prompt, the actual JSON
  schema and the actual `transcript()` the server sends: (before only) the AI opening, then 8 turns,
  each with a 4.5 s spoken answer and a realistic reply, a "say it back" phrase every third turn. Sample
  replies follow each prompt's length rules (before: 1-2 sentences up to 220; after: one short sentence
  plus a question). No network calls.
- Tokens are estimated at ~4 characters per token (`server/cost.js`), about +/-20% for English + JSON.
  The schema is counted as input because structured output sends it with the request.
- STT seconds come from the recording size (~4 kB/s webm/opus). TTS characters are what ElevenLabs bills.
- In production, `/api/otter` now logs one `[otter] turn usage` line per turn with the same fields; when
  the model reports real `usage` the log uses that instead of the estimate. No text, audio or keys.
- Not measured live: no Anthropic calls were made for this work, so cache hit rates and real output
  lengths are estimates. Check the usage log after a day of real play.

## Per free-talk conversation (opening + 8 turns, "say it back" every third turn)

| | Before | After | Target (brief) |
|---|---:|---:|---:|
| Anthropic calls | 9 (8 + 1 AI opening) | **8** | 8, smaller |
| LLM input tokens (total) | 12,689 | 11,111 | |
| of which cached (system prompt + schema) | 10,440 | 9,280 | |
| LLM input tokens not cached | 2,249 | 1,831 | **-19%** |
| LLM output tokens (typical) | 969 | 766 | **-21%** |
| LLM output tokens (worst case per call) | 2,000 cap | 350 cap | **-82%** on runaway turns |
| ElevenLabs TTS characters | 1,196 | **698** | ≤ 900 |
| STT seconds | 36 | 36 | same (can't shorten what the player says) |
| Scripted quest (Mumbai) | n/a | **0 Anthropic, 0 runtime TTS**, only STT | 0 / 0 |

Per turn on average: TTS 150 → 87 characters, non-cached input 281 → 229 tokens, output 121 → 96 tokens.

## What changed, per conversation

| | Before | After |
|---|---|---|
| NPC openings (Senga, Hamish, every Mumbai character) | 1 LLM call + 1 TTS call per conversation | authored greeting + pre-generated mp3 (browser voice until it exists): **0 AI calls before the first answer** |
| `max_tokens` | 2000 | 350 |
| History sent | every line so far | last 8 lines |
| Reply length | 1-2 sentences, up to 220 characters, the turn failed if longer | one short sentence plus a question, ~110 characters, cap 160 (prompt + schema); an over-long reply is cut at the last full sentence instead of failing |
| Turns where nothing was heard | full LLM call + TTS | authored line, **0 LLM, 0 TTS** |
| Simple turns (short answers, quest wording) | main model | `OTTER_MODEL_FAST` if set (default = main model, no change) |
| Live TTS model | `eleven_v3` for every reply | `TTS_MODEL_LIVE` if set (default `eleven_v3`, no change); authored lines stay v3 mp3s |
| Repeated lines (echo phrases, fallbacks) | voiced every time | voiced once per instance (`server/ttsCache.js`, 100 lines, per TTS model) |
| Past `MAX_AI_TURNS_PER_DAY` (default 2000) | unlimited spend | authored "come back tomorrow" line, no vendor calls |
| One IP hammering the API | unlimited | 20/min, 300/day on `/api/otter` and `/api/stt` |

## Quality switches (off by default, flip in the server env)

| Setting | What it does | Saving | Quality risk |
|---|---|---|---|
| `TTS_MODEL_LIVE=eleven_flash_v2_5` | improvised replies use Flash instead of v3 | TTS **$0.08 → $0.04 per 1K characters** (-50%) | flatter delivery, weaker accent, no audio tags (they are stripped) |
| `OTTER_MODEL_FAST=<smaller Claude model>` | short answers and quest wording use it | depends on the model picked | less witty short replies |
| `OTTER_MODEL=<model>` | every free-talk turn | depends on the model picked | everything |

ElevenLabs prices were checked on elevenlabs.io/pricing/api on 2026-11-15: v3 $0.08, v3 Conversational
$0.04, Flash / Turbo $0.04 per 1K characters; Scribe STT $0.20 per hour. Check again before relying on them.

## Quality guardrails

The aim is cheaper without sounding clipped. Replies are asked to sound like a real person talking
(contractions, one or two sentences, ~140 characters) rather than squeezed short: one short sentence plus a question, the way people actually talk at a
counter or a bus door. Lines are never cut mid-word. The greeting is still the character's own
authored line, and pre-generated audio keeps the full v3 accent.

Not on by default because they'd hurt quality: a cheaper live TTS model (available behind
`TTS_MODEL_LIVE`, above) and a smaller Claude model (`OTTER_MODEL_FAST`). Not done at all: dropping
hints/suggestions from the reply, which would make the game harder to play.

## Knobs

- `OTTER_MODEL` (default `claude-opus-5-5`, unchanged), `OTTER_MODEL_FAST` (default = `OTTER_MODEL`).
- `TTS_MODEL_LIVE` (default `eleven_v3`, unchanged).
- `MAX_AI_TURNS_PER_DAY` (default 2000).
- `MAX_TOKENS` = 350, `HISTORY_LINES` = 8 in `server/otter.js`.

shortcut: limits and the TTS cache are in-memory per instance; move to a shared store (KV/Redis)
before real traffic.
