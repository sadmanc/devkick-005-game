# Devin brief 1: the Toronto accent unit (study + lessons roadmap + talk-to-the-locals playground)

Repo `sadmanc/devkick-005-game`. Start from branch `sadman/overnight-context`, push to **`sadman/toronto-unit`**.
PR title: **"Toronto region: accent study, lesson roadmap and talk-to-the-locals playground"**.

Read first: `docs/devin-briefs/overnight-2026-11-15/README.md` (shared rules), `AGENTS.md`, `CLAUDE.md`,
`docs/prd/PRD.md` sections 1, 3, **9 (Respect Charter)**, 10.4, **12.0-12.6** (12.6 is London's
"Prove you're from ends": the closest model for Toronto's slang side), **14.2 (accent pack schema)**, 16
(how scoring works) and F20 (cost controls), `docs/prd/cost-notes.md`, then `src/content/regions/index.js`
and the Mumbai folder `src/content/mumbai/` (the newest example of adding a region).

## Why we're doing this

Sadman wants a fun, slightly silly **Toronto** unit we can use in ads ("learn the Toronto accent"). It is
local to the team (University of Toronto) and very shareable. It must still be good: the same structure
and quality as the Scotland unit, and respectful (see "Respect" below).

## Goal for the morning

A PR where a player can pick **Toronto** on the world map and:
1. follow a **Duolingo-style roadmap** of Toronto lessons (same structure as the Scotland unit: a path of
   lesson nodes, say-it-back lines scored on words and accent, stars/progress, a unit test at the end in
   the style of "Prove You're Local"),
2. walk into a **playground** street scene and free-talk with **Toronto NPCs** who speak with a Toronto
   accent and slang, with trust that rises as you sound local, a Toronto word tray, and "Try saying"
   suggestions (same systems Glasgow and Mumbai use),
3. while Glasgow and Mumbai play exactly as before.

Plus a written **Toronto accent study** that the content is built from.

## Milestones (in this order; each ends with `npm run check` green and a commit)

### M1. The Toronto accent study (research first, then build from it)

Write `docs/research/toronto-accent/` with:

- `STUDY.md`: everything we can learn about how Toronto sounds. Cover at least both layers:
  - **General Toronto / Canadian English**: "Trawna" (dropping the second t), Canadian raising ("about",
    "house", "right"), the Canadian vowel shift, cot-caught merger, "eh" and its real uses, "sorry",
    "toque", "double-double", "washroom", "the 6ix", "the TTC", local place names and how locals say
    them (Spadina, Yonge, Dundas, Etobicoke, Leslieville...), what tourists get wrong.
  - **Toronto slang / Multicultural Toronto English (MTE)**: the youth dialect from the city's Caribbean
    (especially Jamaican), Somali, South Asian, West African and other communities: "mans", "ahlie",
    "wallahi", "styll", "ting", "bare", "fam", "wasteman", "say less", "bucktee", "you're moving funny",
    "u dun know", "mandem", "the ends", its sounds and rhythm. What each word means, who says it, where it
    comes from, and what's dated vs current.
  - For each feature: what it is, an example line, how to say it (plain-English mouth instructions like
    the Scotland and Mumbai lessons), and its **sources**.
- `sources.json`: every source: `{url, platform, title, creator, date, what_it_shows, timestamps, notes}`.
  Aim for **100+ sources**. Include academic work (search for Derek Denis's work on Multicultural Toronto
  English, Sali Tagliamonte's Toronto English studies, Canadian raising and Canadian Shift research),
  dictionaries and news features on Toronto slang, Reddit threads (r/toronto, r/askTO), and as many
  **videos** as you can find: YouTube, TikTok and Instagram Reels ("Toronto accent", "Toronto slang",
  "how to sound like you're from Toronto", "Toronto mans", "Canadian accent Toronto", "Drake Toronto
  accent", street interviews, comedians, "Toronto vs ..." accent videos).
- `voice-plan.md`: how to make NPCs that really sound Toronto (see M4).

**Scrolling TikTok and Instagram Reels:** use your browser like a person would: open TikTok and Instagram
search and hashtag pages (#torontoaccent, #torontoslang, #torontomans, #6ix ...), scroll the feed, open each
relevant video, and record URL, creator, date, what the speaker does with their voice, and timestamps. A
Playwright scroll script (the approach of the open-source "skroller" agent skill) is fine; `yt-dlp` is fine
for metadata, captions and transcripts. Go slow and human-paced; stop on any captcha or block and don't try
to get around it. Try logged out first. If the secrets `IG_RESEARCH_USERNAME` / `IG_RESEARCH_PASSWORD`
or `TIKTOK_RESEARCH_USERNAME` / `TIKTOK_RESEARCH_PASSWORD` exist, you may sign in with them (they are a
throwaway research account); if a platform needs a login and there is no secret, note it in the PR and move on.
**Use every clip as an acoustic reference (Sadman's ask).** Accents differ in measurable ways, so don't
just describe the clips: measure them. Download the audio of every usable clip to a temp folder (outside the
repo), cut the speech of Toronto speakers, and measure with Python (Praat via `parselmouth`, `librosa`, or a
forced aligner such as Montreal Forced Aligner / `whisperx` for word timings):
- pitch (F0): mean, range, contour shape at phrase ends (rises, falls, uptalk);
- vowels: F1/F2 formants for the key vowels (Canadian raising in "about/house/right" vs "loud/ride",
  the Canadian Shift vowels in "bit/bet/bat", cot-caught) plotted as vowel charts;
- rhythm and timing: speech rate, nPVI / %V / deltaC rhythm metrics, pause lengths;
- anything else that separates Toronto speech (e.g. t-flapping and "Trawna" t-dropping, MTE features).
Compare the numbers with a General American reference and with the Glasgow otter's lines in
`public/` (same measurements), and commit the **numbers, scripts and charts** (PNG/SVG) under
`docs/research/toronto-accent/acoustics/`, with which clip and timestamp each number came from. Then use what
you found: tell the lessons what to listen for, and if the measurements are clear enough, give the accent
score per-region targets for Toronto (pitch contour, rhythm, key vowels) the way the otter's clip is the
target for Glasgow. **Never commit or ship the downloaded audio or video, and never clone a voice from it:**
it is reference data only. Delete the temp audio when done. Session 4 (accent science) is researching the
general method tonight on branch `sadman/accent-science`; you don't need to wait for it.

### M2. Toronto region pack (content)

Follow the Mumbai pattern exactly (region registry entry, content folder, words module, server prompts):

- `src/content/toronto/toronto.json` (lesson path content), `lessons.json` (fundamentals: one lesson per
  sound or rhythm feature from STUDY.md, ~8-12 lessons, two layers: "Sound like a Torontonian" then
  "Talk like the 6ix"), `cast.json`, `quests/*.json` (2-3 everyday quests, e.g. ordering a double-double
  style coffee at a corner coffee shop (no real brand names), asking for directions on the streetcar,
  a pickup game at the court), and `src/game/torontoWords.js` (the word tray with meanings).
- **Roadmap:** a Duolingo-style path for Toronto, the same component and flow the Scotland unit uses, with
  units/sections, and an end-of-unit "Prove You're From the 6ix" test. Reuse, don't fork, the existing
  lesson code; wrap shared code if it needs a region parameter.
- **NPCs (3-4):** locals who are proud, funny and in charge, in the style of the Devin otter, Senga the
  seagull and Big Hamish: e.g. a **raccoon** (Toronto's unofficial mascot), a streetcar driver, a corner
  store owner, a kid on the basketball court. Each gets a personality, how they talk, a greeting,
  "Try saying" openers, and a per-region system prompt on the server, the way Mumbai's work does.
- World map: a Toronto pin (Toronto, Ontario: look up where it goes on the existing map image) marked
  live with the "Preview: pending native review" badge like Mumbai.
- Scene: a Toronto street. A clean stand-in (like Mumbai's) is fine tonight: streetcar-red and brick
  palette, a streetcar stop, a corner store, CN-Tower-like skyline silhouette in the distance (generic, no
  logos). If there's time, a better scene, but working first.
- Mark every Toronto content file `"review": "pending native review"`.

### M3. Make it actually playable and tested

- `npm run check` green; add tests like `tests/regions.test.js` for Toronto, and one asserting Glasgow and
  Mumbai content and server prompts are byte-for-byte unchanged.
- Play it in your browser: map -> Toronto -> lessons roadmap -> a lesson -> playground -> talk to each NPC
  (use the dev `__say` hook to type text in place of speech) -> end-of-unit test. No console errors.
- Check at phone size 844x390 landscape: 44 px touch targets, nothing under the thumbs.
- Put screenshots (desktop and phone size) in the PR.

### M4. Voices: can ElevenLabs do a Toronto accent?

Answer this properly in `docs/research/toronto-accent/voice-plan.md`, then do the best option you can:

1. **Voice Design (text prompt -> new voice):** try prompts describing a Toronto accent ("young man from
   Toronto, Multicultural Toronto English, relaxed, Jamaican-influenced rhythm..." and "middle-aged
   Torontonian, standard Canadian English, Canadian raising..."). Judge the results against your study.
2. **Voice Library:** search ElevenLabs' shared voice library for voices described as Toronto / Canadian.
   These are shared by their owners for use; note each voice's terms.
3. **Professional / instant voice cloning:** only from a person who agrees and verifies their own voice
   (ElevenLabs requires this for professional clones). **Never clone a voice from a TikTok, Reel or YouTube
   clip** (that person never agreed; it also breaks `AGENTS.md`). Recommend whether the team should
   record a consenting Torontonian (a team member or friend) and what script they'd read.
4. Also say whether v3's audio tags or a pronunciation dictionary (for "Trawna", "eh", slang) help.

Sadman is adding Devin secrets tonight: check for them again when you reach this milestone, not only at the
start. If the secret `ELEVENLABS_API_KEY` exists: run the voice designs (up to **6** designs) and generate the
authored lines (greetings, lesson lines, reactions; up to ~20,000 characters), log every one in
`assets/manifest.json` with the exact prompt, and wire them in. If it doesn't exist: write the generation
script so a human can run it in one command, and use the existing fallback voice path; say so in the PR.
`ANTHROPIC_API_KEY` is probably missing too: test the free-talk path with mocks and the `__say` hook.

## Respect (non-negotiable; PRD section 9)

Toronto slang comes from Black, Caribbean, Somali and other immigrant communities. A "learn the Toronto
accent" joke can easily become mockery, so:
- The locals are proud, funny and in charge; they tease **the player** (the tourist trying too hard), never
  their own culture. The joke is on the visitor saying "eh" every sentence.
- No crime, guns, drugs, gangs, "roadman" caricature, poverty, religion or politics. No exaggerated
  "funny foreign voice". Everyday warm situations: coffee, the streetcar, the court, the corner store,
  winter, the Raptors-style local pride (no team logos or names).
- Slang lessons explain where words come from and credit the communities (e.g. Jamaican Patois roots).
- Everything Toronto is marked "pending native review"; list in the PR the lines a Torontonian should check.

## Don't

- Don't change the shape of `src/content/scotland.json` or the `listen()` contract in `src/voice/index.js`.
- Don't rewrite Lucas's region registry; add to it. If you must change it, keep Mumbai working and say why.
- No new npm dependencies unless there's no other way (say why). No real brands, logos or real people.
- Don't spend Meshy credits. Don't commit downloaded media.

## Before you open the PR

Fetch `vu/mumbai-overnight` from `https://github.com/VuMadeIt/devkick-005-game` again (Lucas's Devin may
have pushed more overnight) and merge it in if it moved, fixing any conflicts so both regions work.
Note in the PR that it builds on Lucas's Mumbai branch and should merge after it.
