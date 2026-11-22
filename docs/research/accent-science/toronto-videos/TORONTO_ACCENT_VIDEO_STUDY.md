# What 816 online videos show about the Toronto / MTE accent

Sound Local research note, 2026-11-22. Companion files: `toronto-accent-speakers.md/.csv` (videos where people actually talk in the accent), `toronto-accent-explainers.md/.csv` (videos that explain it), `toronto-accent-all-reviewed.csv` (every video, with its verdict).

## 1. Summary

- **Most "Toronto accent" videos don't contain the accent.** Of the 609 videos tagged MTE/viral Toronto from their titles and search terms, only **130 (21%)** have someone audibly speaking Multicultural Toronto English (MTE). Most of the rest are plain Canadian/American voices saying slang words, music, or silence.
- **134 videos** in total pass as "actually speaking MTE": **100 strong** (two independent listens agree) and **34 clear** (one listen sure, the other "partly"). 97 are TikTok, 41 YouTube, 4 Instagram.
- **Slang is not the accent.** "fam" was heard in 179 clips but only 109 of those had MTE pronunciation; "two-twos" 48 vs 31; "wallahi" 30 vs 12. 97 clips were slang-heavy (2+ slang words) with no MTE pronunciation at all.
- **What makes it sound MTE, as heard in the clips:** rhythm and intonation first (syllable-timed, Caribbean-like melody), then **TH-stopping** ("ting", "dis", "dat", "tree"), then Jamaican/Patois-like vowels. Kiss-teeth and cluster reduction show up but rarely.
- **Explainers mostly don't demonstrate it.** 261 videos explain Toronto slang or the accent; in only 57 does the explainer also talk in MTE. 105 explain it in a plain accent.
- **No false alarms on the comparison set.** None of the 49 mainstream Toronto/Canadian or General American comparison videos was marked as speaking MTE (3 were "possible / slang only").

## 2. Method

1. **Source list:** the 837-link catalogue (YouTube, TikTok, Instagram) compiled earlier, minus 21 Speech Accent Archive corpus rows: **816 videos**.
2. **Listening:** for each video, two ~20 s audio clips from different points (YouTube through the embedded player, TikTok/Instagram in a logged-in browser). 808 videos played; 8 would not. 1,331 clips, 1,197 with speech.
3. **First listen:** an AI audio model transcribed each clip and judged accent, told explicitly that slang alone does not count. It scored MTE pronunciation 0-3 and listed the cues it heard.
4. **Second listen (skeptical):** every clip with any MTE signal (421 clips) went through a second prompt that said to ignore the words entirely and judge only how they were pronounced (yes / partly / no, with the specific sound and word).
5. **Verdicts per video:**
   - **strong:** a first-listen clip scored ≥2 as MTE *and* the second listen said "yes";
   - **clear:** first listen ≥2 and second "partly", or first ≥1 and second "yes";
   - **possible / slang only:** some MTE signal, but the two listens don't agree;
   - **not MTE / no talking / not reviewed.**
6. **Explainers:** any video where the model said the clip explains Toronto slang or accent. Those clips (plus 40 s clips from 90 of them) were run through a second prompt that pulls out terms, meanings, and pronunciation, origin and social claims.
7. Audio clips were deleted after analysis; only the text results are kept.

## 3. Results

### 3.1 Verdicts

| Verdict | All 816 | Tagged MTE (609) | Toronto, check (158) | Comparison (49) |
|---|---|---|---|---|
| Speaks MTE: strong | 100 | 96 | 4 | 0 |
| Speaks MTE: clear | 34 | 34 | 0 | 0 |
| Possible / slang only | 195 | 178 | 14 | 3 |
| Not MTE | 402 | 233 | 124 | 45 |
| No talking (music/silence) | 77 | 64 | 13 | 0 |
| Could not play | 8 | 4 | 3 | 1 |

The "Toronto, check" group (Toronto rappers, podcasts like The Man Dem Show) was almost entirely mainstream speech in the sampled moments: interviews and podcasts are usually in the speaker's everyday voice, not the stylised register.

### 3.2 How much the two listens agree

| First-listen MTE score | Second listen "yes" | "partly" | "no" |
|---|---|---|---|
| 3 (strong) | 47 | 1 | 38 |
| 2 | 64 | 11 | 85 |
| 1 | 27 | 12 | 117 |
| 0 | 0 | 1 | 18 |

Even among clips the first listen rated 3/3, the skeptical listen agreed only 55% of the time. That's why "strong" needs both. Expect some real MTE speakers among the 195 "possible" videos, and some mistakes among the 134.

### 3.3 Pronunciation cues heard in MTE clips (222 clips scored ≥2)

| Cue (grouped) | Clips |
|---|---|
| MTE / Caribbean-like prosody, intonation, rhythm (incl. "syllable-timed") | ~200 mentions |
| TH-stopping (thing → ting, this → dis, three → tree) | ~55 |
| Caribbean / Jamaican / Patois-like vowels, monophthongal vowels | ~40 |
| Kiss-teeth (chups) | 2 |
| Final consonant-cluster reduction | 2 |

Takeaway: listeners (and the model) mostly identify MTE by **melody and rhythm**, with **TH-stopping** as the most concrete single sound. Vowels are mentioned less, but they're the most measurable feature for a scorer.

### 3.4 Slang vs accent

| Word | Clips with the word | ...of which had MTE pronunciation |
|---|---|---|
| fam | 179 | 109 |
| ting | 49 | 32 |
| two-twos | 48 | 31 |
| mandem | 46 | 27 |
| mans | 35 | 16 |
| wallahi | 30 | 12 |
| bare | 26 | 14 |
| wagwan | 25 | 13 |
| styll | 25 | 10 |
| broski | 24 | 17 |
| shorty | 23 | 13 |
| gerber | 17 | 11 |
| crodie | 15 | 8 |

Every common term is used about as often by speakers without the accent as with it. For the game, **knowing the word and sounding local are separate skills**, and should be scored separately.

## 4. What the explainer videos say

These are claims made in the videos, not verified facts. Counts are the number of videos defining the term.

### 4.1 Terms (most-defined first)

| Term | Meaning given in videos | Videos |
|---|---|---|
| fam | friend, family, general address term | 44 |
| ting | thing; also a girl / girlfriend | 21 |
| mandem | your group of guys / crew | 18 |
| wallahi | "I swear to God" (from Arabic) | 14 |
| broski / crodie / cro / crosky | bro, close friend | 12 / 8 / 2 / 3 |
| gerber / gerb | a baby; someone acting childish or weird | 10+ |
| mans / man's | "me" or "him/them" (pronoun use) | 9+3 |
| wagwan | "what's going on" / hello (Patois) | 9 |
| shorty | a girl or young woman | 8 |
| yute | young person | 8 |
| bare | a lot of, very | 7+8 (also heard as "bear") |
| styll / still | sentence-final emphasis ("for real") | 7 |
| nize it / nize your beak | shut up | 6+4 |
| marved / marv | very hungry | 6+2 |
| cheesed / cheese (me) | annoyed, angry | 5+5+2 |
| miskeen | someone acting tough who isn't; also "good kid" | 5 |
| ahlie / alay / alai | "right?", "for real", agreeing | 3+3+4 |
| the six | Toronto (416/647 area codes) | 4 |
| two-twos / two twos | very quickly, "in two seconds" | 3+ |
| waste man / waste | useless person | 3+3 |
| allow it | leave it, stop | 3 |
| brick | very cold | 3 |
| bucktee | crazy / out of control | 2 |
| gyaldem | the girls | 2 |
| reach | come through / arrive | 7 |

Disputes in the videos themselves: one says "two-twos" "is not inherently from Toronto"; another links it to a 2024 Philadelphia song; "waste man" is described as UK-origin; "bucktee" is called an "out of town" word. Treat origin claims as contested.

### 4.2 How the accent works (pronunciation claims)

- **TH becomes T/D:** "thing" → "ting", "three" → "tree", "the mall" → "de mall" (several videos, often credited to Jamaican English).
- **Clipped forms:** "enough" → "nuff"; dropped T in "Gerber"; "man" → "mun".
- **Melody:** described as "stretched out", "heated", "high pitch"; one video compares it to Baltimore/US speech.
- **Separate from mainstream Canadian features** that other videos describe: T-flapping ("Torono", "bedder"), Canadian raising in "ice" vs "I" (one phonetics-style video describes this correctly), "eh".
- **Exaggeration claim:** several speakers say real-life Toronto speech is "mad normal" and that viral skits are "rage bait"; one says "the further you go from Toronto, the thicker the Toronto accent gets".

### 4.3 Where it comes from (origin claims)

- **Jamaican Patois** is the most-cited source (wagwan, ting, ahlie, yute, gyaldem), followed by **Somali** and **Arabic** (wallahi, miskeen), plus **Punjabi / South Asian** input and Trinidadian, Guyanese, Nigerian influence.
- **Shared roots with London's MLE:** the same kinds of migrant communities produced similar slang in both cities; videos argue over "who copied who".
- **Scarborough** is the most-mentioned place (52 clips), then Brampton (25), Jane & Finch (8), Mississauga (7), Rexdale (5), Regent Park (4). Two videos claim it all started in the east end / around Scarborough Town Centre.
- **Popularised** by Drake and other Toronto artists (one video also names Tory Lanez and Nicki Minaj).

### 4.4 Who uses it, and when (social claims)

- Young people and teens; it changes by generation (people in high school in the '90s, 2000s, 2010s and 2020s use different words).
- Used across races: "everybody in Toronto regardless of what race they are"; Canadian-born non-Jamaican youth use Patois-derived words.
- **Code-switching:** a speaker describes Patois as spoken at home; interviewers and podcasters drop into it for effect and back out. That matches what the audio showed: the same person often has one MTE clip and one plain clip.
- **Sensitivity:** one video reports the Black community seeing viral slang trends as appropriation; another says online exaggeration mocks how Black and other groups in Toronto talk.

## 5. How this fits the published research

- Denis & Elango (2024, *English Language and Linguistics*, [free PDF](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/BB67861CE19ACA8A38FA4EA413560A61/S1360674324000509a.pdf/div-class-title-if-ur-from-toronto-you-ll-understand-register-change-and-metadiscursive-engagement-with-mediatized-multicultural-toronto-english-div.pdf)) describe MTE as a register tied to racialised Toronto youth and spread by online commentary. This review matches that: the online form is a **register people switch into**, and most "Toronto accent" videos are commentary about it rather than examples of it.
- Hoffman & Walker (2010) find Toronto ethnolects are heritage-linked rather than one standard, which fits the wide spread of what counts as MTE here.
- Kerswill et al. (2023) show London's MLE varies a lot between individuals; the low agreement between our two listens suggests MTE is similar, so a scorer should accept a range, not a single target.
- **Still no acoustic numbers for MTE.** This review finds *which* features to measure (rhythm, TH-stopping, FACE/GOAT vowels) but not target values. Those need consented recordings.

## 6. What this means for Sound Local

1. **Score vocabulary and pronunciation separately.** A lesson like "two-twos my word" at Yorkdale should check the phrase (speech-to-text) and, separately, the delivery.
2. **For the MTE pronunciation score, start with TH-stopping and rhythm.** TH-stopping is a concrete, teachable, checkable sound; rhythm (syllable timing) is what listeners notice most. Vowels can come later once there are measured targets.
3. **Teach it as a register, kindly.** The videos themselves warn about exaggeration and mockery; NPCs should "catch" the player for being stiff, not reward caricature.
4. **Use the 134-video list for lesson writing and listening, not as training data.** Getting voice-model or scorer targets still means consented local speakers.

## 7. Limitations

- **The judge is an AI model, not a human phonetician or a Torontonian.** Its evidence notes are sometimes wrong (e.g. it once called the slang word "dess" TH-stopping). Spot-check before relying on any single video.
- **Two 20 s clips per video.** A long podcast may have MTE stretches we missed, and a skit may have one MTE character among plain ones.
- **Not all "MTE" speakers are Torontonians.** The list includes performers, voice actors in animations, a Jamaican-accent clip of Nicki Minaj, and Toronto creators imitating London roadman speech. Verdicts are about the sound, not who the speaker is.
- **Skits vs real speech:** many strong examples are comedic performances, which can exaggerate the register.
- Speaker identity, origin and consent are unknown; links only, nothing redistributed.
