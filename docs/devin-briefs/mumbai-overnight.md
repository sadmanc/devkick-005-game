# Devin brief: Mumbai (Indian English) region + cheaper AI, overnight build

Repo: **`VuMadeIt/devkick-005-game`** (a fork of `sadmanc/devkick-005-game`; push here, the team repo is
read-only for Devin). Branch: **`vu/mumbai-overnight`** (already pushed; work only here).
Read first: `AGENTS.md`, `CLAUDE.md`, `docs/prd/PRD.md` sections **9** (Respect Charter), **10.2** (Indian
English), **12.0** (quest-first product shape), **14.2** (accent pack schema), **17.4** (hybrid quest engine),
**19** (unit economics) and **F20** (cost controls). Then this brief.

## Goal

By morning, a PR that adds **Mumbai, India** as a playable region, makes the AI **much cheaper to run**
without making the game feel worse, and protects the API from abuse. Glasgow must play exactly as before.

## Hard rules (never break)

1. **Never push to `main` (in either repo), never force-push, never merge the PR.** Only commit and push to
   `vu/mumbai-overnight` on the fork. The human reviews and merges.
2. **Commit small and often:** one working step per commit (aim for 25+ commits overnight), Conventional
   Commit messages, each with this trailer so the human gets credit:
   `Co-Authored-By: Lucas Vu <l3vu@uwaterloo.ca>`. Run `npm run check` before every push; push after every
   few commits so progress is saved.
3. **Glasgow keeps working.** Don't change the shape of `src/content/scotland.json` or the `listen()`
   contract in `src/voice/index.js` (team contracts). Wrap them, don't rewrite them.
4. **No Anthropic/Claude calls.** There's no key in this session. Code that touches the LLM path is tested
   with mocks. Mumbai quests must run **fully scripted** (no LLM).
5. **ElevenLabs only, on a budget:** the key is in the `ELEVENLABS_API_KEY` secret. Up to **3 voice
   designs** and about **10,000 TTS characters** in total. Log every generated asset in
   `assets/manifest.json` with the exact prompt (team rule). No Meshy credits.
6. **No keys in `src/`.** No new npm dependencies unless there's no other way (say why in the PR).
7. **Respect Charter** (PRD section 9): locals are proud, funny and in charge; they tease *the player*, never
   their own culture. No religion, caste, politics, poverty, crime or "funny foreigner" voices. No L/R swaps,
   no "head wobble" jokes, no mocking "kindly do the needful" office English. Everyday, warm situations.
   Mark all Mumbai content `"review": "pending native review"` (a human reviewer checks it tomorrow).

## Milestones (in this order; each ends green and committed)

### M1. Region packs (foundation)
- Add a region registry, e.g. `src/content/regions/index.js`, that lists regions with
  `{ id, name, pin: {left, top}, content, cast, words, quests, scene, review }`. Glasgow's entry **wraps**
  the existing `scotland.json`, `cast.json` and `src/game/scotsWords.js` (no shape changes).
- The world map renders pins from the registry (Glasgow live; **Mumbai live**, with a small
  "Preview: pending native review" badge). Choosing a pin loads that region's intro, cast, word tray and
  scene.
- Server: character prompts per region. `server/otter-prompt.js` hard-codes Glaswegian rules in `RULES`;
  split into shared rules + per-region rules, keeping `systemPromptFor('otter')` and the current Glasgow
  prompts byte-for-byte the same (add a test that asserts this).
- Tests for the registry and for Glasgow being unchanged.

### M2. Cost controls and abuse protection (F20)
- Per-IP rate limit on `POST /api/otter` and `POST /api/stt` (e.g. 20 requests/minute, 300/day), plus a
  global daily turn cap from env (`MAX_AI_TURNS_PER_DAY`, default e.g. 2000) after which `/api/otter`
  answers with an authored fallback line instead of calling vendors. In memory is fine for now: add a
  `// shortcut: in-memory, per instance; move to a shared store (KV/Redis) before real traffic` comment.
- Clear 429 handling in the client (the character says a kind "come back later" line).
- Tests (pure functions for the limiter and the cap).

### M3. Make the AI cheaper (THE top priority: do this before M2, and spend real time here)
The human runs this as a business: **cut Anthropic and ElevenLabs spend as far as possible** while the
conversation still feels good. **Safe cuts are ON by default** (not behind a flag). Only changes that alter
quality (switching models) stay behind env vars, with the exact setting to flip written in the PR.

Known waste in today's code (fix all of these first):
- **NPC openings cost a full AI turn:** `startChat()` in `src/main.js` calls `/api/otter` with
  `opening: true` for Senga and Hamish just to say hello (1 LLM call + 1 TTS call per conversation). Replace
  with authored greetings, pre-generated audio and the existing `OPENING_SUGGESTIONS`. Do the same for
  every Mumbai character. **Zero AI calls before the player's first answer.**
- **`max_tokens: 2000`** in `server/otter.js` for a ~300-token JSON reply: cap it (e.g. 400).
- **Full history every turn:** send only the last ~8 lines.
- **Long replies are voiced in full:** replies may be up to 220 characters and each character costs TTS.
  Aim for ~140 (1 short sentence plus a question), enforced in the schema and the prompt.
- **Biggest model for every turn** (`claude-opus-5-5`): add routing (below), default unchanged.
- **Live TTS uses `eleven_v3`** for every reply. Add `TTS_MODEL_LIVE` (default unchanged) so a cheaper,
  faster ElevenLabs model can be used for improvised replies while authored lines keep v3 quality. Note the
  per-character price difference in `cost-notes.md` (verify against ElevenLabs' current pricing page).

Measure first, then cut. Write `docs/prd/cost-notes.md` with **before/after estimates per turn**
(characters sent to TTS, LLM input/output tokens, STT seconds) and how each change was measured.
Do as many of these as you can **without making the conversation feel worse**:
1. **Zero runtime TTS for authored lines:** every scripted line (greetings, quest lines, reactions,
   fallbacks, thinking fillers) is pre-generated to mp3 by `scripts/` and served statically.
2. **TTS cache on the server** for AI replies: an LRU keyed by `voiceId + text` (in memory, with the same
   shortcut comment), so repeated lines are free.
3. **Smaller LLM requests:** cap `max_tokens` (today 2000; the JSON reply needs far less, e.g. 350);
   send only the last ~8 history lines; keep the system prompt stable so prompt caching keeps working; ask
   for 1 short sentence when possible (replies are capped at 220 chars; consider about 140).
4. **Model routing by env:** `OTTER_MODEL` (default: today's model, so nothing changes until a human flips
   it) and `OTTER_MODEL_FAST` for turns that don't need the big model (e.g. quest turns, short answers).
   Document the recommended setting in `cost-notes.md`. Unit-test the routing with a mocked client.
5. **Don't voice the echo phrase twice:** if the echo phrase was already voiced in this conversation or is
   an authored line, reuse its clip.
6. **Skip work on empty input:** if STT returns nothing, answer with an authored "couldn't hear ye" line
   without calling the LLM or TTS.
7. **Per-turn cost estimate** in the server log (no secrets, no audio) so costs can be tracked.

### M4. Quest engine v1 (scripted, hybrid-ready)
- Generalise `src/game/flowers.js` into a pure quest engine (`src/game/quest.js`): data-defined **beats**
  (ordered), **intents** (words → next beat, mood change, reply line), **traps** (words → mood penalty +
  reply), **topics**, **local words** (raise mood), **endings** (win/lose thresholds), and per-line
  `audio`. Keep Morag's flower stall working (port it to the engine or leave it untouched).
- A **beat tracker** UI on the talk screen: a small checklist ("✔ ordered ◻ paid"), at 844x390 too.
- A hook for later AI wording (e.g. `wording: 'scripted' | 'ai'`) that defaults to scripted.
- Unit tests like `tests/flowers.test.js`.

### M5. Mumbai content (Indian English and Bambaiya Hinglish)
Write it as a native Mumbaikar would say it, warm and proud, with a plain-English meaning for every line.
- **Placement test** (3 lines, easy → hard, same shape as `scotland.json`'s `test[]`, with accepted STT
  spellings, tips, good/ok/bad reactions). Suggested: *"Haan, chalo."* (Yes, let's go.), *"Ek cutting
  chai, bhaiya."* (One small cutting chai, brother.), *"Arre yaar, traffic mein phas gaya tha."* (Oh man,
  I got stuck in traffic.).
- **Word tray** (12 words with mishearing patterns): *haan, nahi, yaar, arre, achha, chalo, bhaiya, bas,
  jugaad, timepass, cutting, scene*.
- **Characters (animal locals, like Glasgow):**
  - **Kaju the crow**, who runs a chai tapri by the station: quick, sharp, cheeky, knows everyone.
  - **Mangesh the mongoose**, an auto-rickshaw driver: fast-talking, unimpressed, loves a bargain.
  - **Mor Aunty**, a peacock at a family wedding: grand, warm, nosy, asks everyone when they're
    getting married.
  Avoid monkeys and cows. No real brands, no real people.
- **Two quests** (scripted, on the M4 engine, with traps and endings):
  1. **"Ek cutting, bhaiya"** at Kaju's tapri: greet, order two cutting chais and a bun maska, chat about the
     cricket, pay. Trap: ordering "a chai tea latte". Win: Kaju starts your order when he sees you ("Your
     usual?").
  2. **"Meter se chalo"** with Mangesh: say where you're going the local way, insist on the meter, agree a
     fare, thank him. Traps: speaking like a tourist brochure; agreeing to a silly price. Win: he waives
     the last ₹10.
- Mor Aunty: free-talk character prompt only (AI, untested tonight) plus an authored greeting.
- Fundamentals: 6 short lesson outlines as data (tonality: syllable-timed rhythm, retroflex T/D,
  V/W; grammar/slang: the *na?* tag, *-only* / *itself* emphasis, *yaar/bhai/ji*). They don't need to be
  playable tonight.

### M6. Voices (ElevenLabs, within budget)
**First check if `ELEVENLABS_API_KEY` is set** (test with `[ -n "$ELEVENLABS_API_KEY" ]`; never print it).
If it isn't set: do everything below **except** the API calls. Write the voice-design prompts into
`scripts/voice-config.json`, make the scripts support it, run `node scripts/generate-voice.js mumbai --dry`
to prove the job list is right, and put the exact commands the human must run in the PR description.
Missing audio falls back to the browser voice, so the game still works.
- Design 3 voices with ElevenLabs Voice Design (the API that makes voice previews from a description, then
  saves the chosen one). Prompts like: *"A warm, authentic Mumbai, India English accent with natural
  Hinglish, unmistakably Mumbaikar, not generic or exaggerated. [age, personality]. Natural, fluent,
  confident, a fun cartoon [animal] character in a game."* Never imitate a real person.
- Extend `scripts/voice-config.json` and `scripts/generate-voice.js` for **per-character voices** (today
  it's one voice per place) and for quest lines. Generate all Mumbai authored lines. Keep the placement
  test lines tag-free (they're the accent references).
- Log every voice and line in `assets/manifest.json` (tool, exact prompt, file, "made_by": "Devin (cloud)",
  date).

### M7. Mumbai 3D street (in code)
- A scene builder (e.g. `src/game/scenes/mumbai.js`) in the same low-poly style: a warm evening light, no
  rain; colourful 3–4 storey buildings with balconies and shop shutters; hand-painted-style sign blocks (no
  real brands); a chai tapri with a kettle and glasses; a yellow-and-black auto-rickshaw made from simple
  shapes; string lights; a few potted plants. Keep it light on phones (merge geometry, few lights).
- Characters use the existing **stand-in bodies** in `src/game/actor.js` with region colours (crow:
  black/grey with a yellow beak; mongoose: tawny brown; peacock: blue/green with a tail fan if cheap).
- `otterScene.js` picks the scene and cast by region; Glasgow's scene is untouched.

### M8. Check it like a player
- `npm run check` green.
- Run the dev server and play in a browser at **1280x800** and **844x390**: Glasgow placement + free-talk
  screens still work; Mumbai map pin → intro → placement test → both quests → result. **No console
  errors.** Speech needs a mic: add a dev-only way to inject a transcript (like the existing `#good`/`#bad`
  hash), and use it to play the quests end to end.
- Take screenshots of the Mumbai screens.

### M9. Deliver
- Open a PR from `VuMadeIt:vu/mumbai-overnight` to **`sadmanc/devkick-005-game` `main`** titled **"Mumbai
  region (preview), quest engine, cheaper AI, rate limits"**, using `.github/pull_request_template.md`: what
  changed, the cost before/after table, screenshots, what's untested (anything needing Claude), and
  "pending native review". If opening a PR on the team repo isn't allowed, open it inside the fork
  (`VuMadeIt/devkick-005-game`, base `main`) instead and say so; the human will open the team PR.
- If you can, post one short comment on each team issue **#1, #2 and #3** (what in that lane's files changed
  and the PR link). If not allowed, put those three comments in the PR description. Don't merge.

## If you get stuck
Skip the blocked milestone, write down why in the PR, and continue with the next one. Order of
importance if time runs out: **M3 → M1 → M2 → M5 → M4 → M6 → M7 → M8 → M9** (M8 and M9 always happen).
`git pull` before each milestone: the human may push brief updates during the night.

## Cost target (put the real numbers in the PR)
| Per free-talk conversation (8 turns) | Before (estimate) | Target |
| --- | --- | --- |
| Anthropic calls | 8 + 1 opening (NPCs) | 8, smaller (fewer input tokens, capped output) |
| ElevenLabs TTS characters | ~1,300–1,600 | ≤ 900 (shorter replies, cached lines, no opening TTS) |
| Scripted quest (Mumbai) | n/a | **0 Anthropic, 0 runtime TTS**, only speech-to-text |
