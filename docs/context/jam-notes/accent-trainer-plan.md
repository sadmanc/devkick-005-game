# Accent trainer: plan v1 (draft; the idea owner's detailed plan comes next)

Nov 14, 2026, 2:45pm. Demo at 5pm today; Chroma deadline Jan 7, 2027.

## The idea (team's words, tidied)
Travel to places around the world and learn their accents by **talking into the game**. Like Duolingo,
but for accents: short lessons, stars, streaks, hearts. For people moving somewhere new, actors preparing a
role, or anyone who wants to sound local. Funny, warm local characters react to how you sound.

## Which Chroma category
| Option | Fit | Verdict |
| --- | --- | --- |
| **Experimental & Open Format** | "Unconventional mechanics, interfaces": your voice is the controller; doesn't fit any other box | **Recommended** |
| Interactive Narrative | Works if each city is a story with a local character whose reactions depend on how you speak | Strong second (Pickford grand prize) |
| Arcade & Party | Only if we lead with a 2-player "accent-off" mode | Possible, weaker fit |
| Music & Rhythm | Intonation is musical, but it's not a rhythm game | No |

## How it scores on Chroma's four criteria
- **Theme & purpose:** a clear new interface (voice), clear goal (sound local).
- **Creativity & AI innovation:** this is where it's strongest. The AI *listens* to you and coaches you; the
  characters' voices and reactions are AI. Most entries only use AI to make assets.
- **Craft & polish:** Duolingo-style feedback loop: instant score, a visual of your voice vs. the local's,
  juicy star/streak rewards, a character who reacts.
- **Sound & emotion:** the whole game is sound. Laughing at your own bad accent, then the "I nailed it"
  moment when the local says you sound like you're from there.

## The one big risk: respect
Chroma has zero tolerance for insensitive depictions. Accent games easily turn into mocking stereotypes.
Rules for us:
- Frame it as **learning and celebrating** how people speak, never mocking. Locals are proud, kind and
  funny about *you*, not about themselves.
- Phrases are everyday, real-life lines (ordering coffee, asking directions), not slang caricatures.
- Use ElevenLabs voices that are designed or licensed, never a real person's voice. Credit them.
- Start with widely loved English accents (e.g. Scottish, Irish, Australian, Texan, London) and add more
  only with a native speaker checking the lines.

## Core loop (one lesson, ~60 seconds)
1. Arrive in a place (3D diorama + local character, Meshy).
2. Character says a line in the local accent (ElevenLabs), with the text and a **melody line** of their
   pitch and rhythm.
3. You hold the mic button and say it back.
4. Score in ~1-2 s: words right + how close your melody, rhythm and stress are, plus one coaching tip
   ("stretch the 'a' in 'dance'"). 1-3 stars.
5. Character reacts in voice (cheers, teases gently, or acts confused). Streak and XP go up.
6. 5 lessons = city complete -> a short conversation "boss" where you must answer in the accent.

## How we score an accent (the tech core)
Three layers, build in this order so something always works:
1. **Words (must-have):** speech-to-text (ElevenLabs Scribe, or the browser's built-in speech
   recognition as a fallback) checks you said the right words.
2. **Melody and rhythm (must-have, runs in the browser):** record the mic with Web Audio, extract pitch and
   loudness over time, compare with the reference clip using DTW (time-stretch matching). Draw both lines so
   the player *sees* the difference. No server needed, works offline.
3. **AI coach (stretch):** send the clip to an audio-capable AI model (through a small backend on Modal so
   no key is in the browser) that rates the accent and writes one tip in the character's voice. Or a
   phoneme model on Modal's GPUs (wav2vec2-style) for sound-by-sound scoring.

## What must work at 5pm (demo cut)
- One city, 3-5 phrases, the full loop above with layers 1 + 2, character reactions, stars.
- Works on the presenter's laptop with its mic; a backup video in case the room is too loud.
- Demo: a judge tries one line live, gets scored, the character reacts. Then a teammate who practised
  nails one to show the "sound local" payoff.

## After today (for the Chroma entry, by Jan 7)
- 4-6 cities on a world map, streaks/hearts/daily goal, the conversation bosses, the AI coach, an
  "actor mode" (pick a role, learn its accent), a 2-player accent-off for parties, phone support.

## Tools and who uses them
| Need | Tool | Notes |
| --- | --- | --- |
| Code | **Devin** (+ Claude, Codex) | PRs per milestone, Devin Review. Judges' sponsor |
| Local voices, reactions | **ElevenLabs** voice design + TTS | Design one voice per city from a prompt; the rep in the room has cheat sheets |
| Speech-to-text | **ElevenLabs Scribe** / browser speech API | Fallback keeps the demo alive on bad Wi-Fi |
| Music, SFX | **ElevenLabs** music + sound effects | City theme loops; star, streak, fail sounds |
| Characters, dioramas | **Meshy** (+ Blender cleanup) | One style reference for all; possible $200 bonus for a great Meshy model (ask the organizer) |
| Backend for AI coach | **Modal** | Keeps keys off the client; GPU phoneme model later |
| Concept art, UI mockups | ChatGPT images (+ Gemini) | Look approved before final art |
| Feel and rewards | nintendo-feel, reactive-feel skills | Star pop, streak flame, character bounce |
| UI quality | unslop skill | Avoid AI-looking menus |
| Hosting | Vercel / Cloudflare Pages | Public link for Chroma |
| Video | OBS + ffmpeg | Gameplay video + Behind-the-Scenes entry |

## Suggested lanes (4 people)
| Lane | Does |
| --- | --- |
| Voice scoring | Mic capture, pitch/loudness extraction, DTW score, the melody-line visual (+ tests) |
| Lesson & game loop | Lesson flow, stars, streak, XP, city screen, character reactions |
| Content & audio | Pick city + phrases, design ElevenLabs voices, generate lines, SFX, music; log in the manifest |
| Lead: art, UI, deploy, demo (Sadman) | Meshy character + diorama, UI, deploy, backup video, 5pm demo |

## Open questions for the idea owner
- Which city first? (Recommend one whose accent is distinctive and loved, e.g. Scottish or Australian.)
- Story frame: "you just moved here", "actor prepping a role", or both as modes?
- How do we keep it kind? Who checks the lines?
- Category: Experimental (recommended) or Interactive Narrative?
