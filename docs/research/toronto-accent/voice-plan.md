# Voice plan: can ElevenLabs do a Toronto accent?

Status: **pending native review**. Written 2026-11-15 by Devin (overnight session 1).

## Tonight's result

The `ELEVENLABS_API_KEY` secret on this run held an API **key ID**, not a key: ElevenLabs answered
`api_key_id_used_as_api_key` ("API keys start with 'sk_'"). So **no voice was designed and no line was generated
tonight, and no credits were spent.** The voice library search needs an account too ("You must be logged in to
use filters"). Everything below is ready to run in two commands once a real `sk_...` key is in `.env`.

Until then, the game speaks Toronto lines with the browser's own voice. Toronto asks for an `en-CA` system
voice first (`setVoiceLang('en-CA')` in `src/game/audio.js`) and falls back to any English voice. Glasgow and
Mumbai keep their old voice choice.

## Options, best first

1. **Voice Design (text prompt -> new voice), recommended for tonight's cast.** One designed voice per character.
   The exact prompts are in `scripts/voice-config.json` under `toronto.characters.*.design` (model `eleven_ttv_v3`):
   - **Rocco** (raccoon), mid-30s man, standard Canadian English with Canadian raising in *about, house, right*,
     says "Trawna".
   - **Bev** (beaver), woman about 55, standard Canadian English, raising, cot-caught merger, friendly *eh* and
     polite *sorry*.
   - **Gus** (goose), man in his early 60s, gruff streetcar driver, raising in *out* and *right*.
   - **Dre** (black squirrel), boy about 17, **Multicultural Toronto English**: relaxed, slightly syllable-timed,
     Caribbean-influenced intonation, Canadian vowels, "not a London accent".
   These cover the brief's two test prompts ("young man from Toronto, MTE..." = Dre; "middle-aged Torontonian,
   standard Canadian English, Canadian raising..." = Bev and Gus). That is 4 design calls, under the brief's 6;
   2 are left for retries.
   **Judge the previews against STUDY.md:** listen for (a) "Trawna" with no second t, (b) raising in *about* and
   *right* that does NOT sound like "aboot", (c) a low-back merged vowel in *call* and *Bob*, (d) for Dre: TH-stopping
   only now and then, a monophthong in *go*, and no London features (no glottal-stop-heavy *t*, no London vowels).
   The usual failure of designed "Canadian" voices is plain General American (ASSUMPTION, not tested tonight). If
   a preview sounds American, keep the American rhythm (our measurements show it is close) and only re-roll for
   the vowels.
2. **Voice Library.** Search the shared library for "Canadian" and "Toronto" (needs a logged-in account). A shared
   voice is fine to use only within its owner's terms: check each voice's notice period, whether commercial use is
   allowed, and the credit multiplier before using it. Not checked tonight (UNVERIFIED).
3. **Consented cloning (best quality).** Ask a Torontonian on the team or a friend, ideally one who grew up with
   MTE for Dre, to record 2-3 minutes in a quiet room and verify their own voice in ElevenLabs (Professional Voice
   Cloning requires the speaker to verify). **Never clone anyone from a TikTok, Reel or YouTube clip**: they never
   agreed, and it breaks `AGENTS.md`. A script for them to read: the Speech Accent Archive paragraph ("Please call
   Stella...", see acoustics/clips.json), then "I'm out and about, eh. I like my house, right? Sorry, can I get a
   double-double? Where's the washroom? I'm from Trawna. Take the streetcar up Spadina to Yonge." and, for the
   MTE speaker, the unit 2 lesson lines in their own words.

## Audio tags and pronunciation

- **v3 audio tags** (`[cheerful]`, `[laughs]`, `[sighs]`, `[whispers]`...) in front of a line set the delivery,
  not the accent. Use them for mood (the `direction` map in voice-config.json, as Mumbai does). They will not
  fix a vowel (ASSUMPTION based on how Mumbai's lines behaved; not measured).
- **Pronunciation dictionaries** (PLS lexicons with alias rules) are the right tool for words the model reads
  wrong: alias "Toronto" -> "Trawna", "Spadina" -> "Spa-dye-na", "Yonge" -> "Young", "toque" -> "took",
  "ahlie" -> "ah-lie", "styll" -> "still", "6ix" -> "six". Check the current ElevenLabs docs for which models
  support dictionaries before relying on them (UNVERIFIED for eleven_v3 tonight). The cheaper fallback, which
  works on any model, is to write the line the way it should sound ("I'm from Trawna"), as our lesson lines do.

## Run it (one command each, with a real key in `.env`)

```bash
node scripts/design-voices.js toronto --dry     # print the 4 prompts, no API calls
node scripts/design-voices.js toronto           # previews -> art/voice-previews/<id>-<n>.mp3 (4 design calls)
node scripts/design-voices.js toronto --pick rocco=<id> bev=<id> gus=<id> dre=<id>   # save the picks, log them
node scripts/generate-voice.js toronto --max-chars=20000   # every Toronto line, logged in assets/manifest.json
```

`generate-voice.js toronto --dry` lists 130 lines (placement, unit test, quests, greetings and all lesson lines,
6,336 TTS characters), well under the brief's ~20,000 budget. Every file and voice is logged in
`assets/manifest.json` with its exact prompt by the scripts. A missing mp3 already falls back to the browser
voice, so nothing breaks before this runs.
