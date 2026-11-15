# Review mining: 9 competitors (for Sound Local)

Accessed 2026-11-15. Coded by one AI researcher (Devin). Data: 848 theme codes from **469 store/Trustpilot reviews** + 17 Reddit excerpts from 6 threads. Files: `review_mining.csv` (one row per review x theme), `review_themes.csv` (counts), `sources.md`.

## How to read the counts (sampling bias, read first)

- **Star-stratified, not representative.** We picked roughly equal numbers of 1-5 star reviews per app (e.g. 14 per star for ELSA). Overall store ratings were not analysed here, so counts show *what people talk about*, not *what share of users* feel it. Counts = number of sampled reviews coded with that theme+sentiment (a review can have several themes).
- **Sample per app:** ~70 for ELSA, BoldVoice, Duolingo; ~45 for others (after excluding non-English text). Pools: public App Store RSS feed (US storefront, most recent/helpful pages), Google Play via `google-play-scraper` (US/en, per-star most-relevant + newest), Trustpilot rendered pages (first pages only).
- **Filters:** English only; 15-180 words; reviews from 2024-06-01 onwards except Speechling and The Accent Kit (too few recent reviews). Duolingo and Babbel were filtered to reviews mentioning speaking/pronunciation/mic/voice/video call/Max etc., so they over-represent speech issues by design.
- **Trustpilot coverage is uneven:** Speak 2 reviews total, Speechling 6, BoldVoice 10, none found for The Accent Kit; Cambly's Trustpilot is dominated by tutors (workers).
- **Reddit was partly blocked:** Reddit JSON endpoints returned HTTP 403 and rendered thread pages were rate-limited after a few loads (ERR_HTTP_RESPONSE_CODE_FAILURE). We harvested result titles from 24 subreddit searches and fully read 6 threads; Reddit evidence is qualitative only and is not in the per-app counts. r/dialects search returned no results.
- **Links:** the App Store RSS feed has no per-review permalink, so App Store quotes link to the app's reviews page (find the quote by text/date in `review_mining.csv`). Google Play links carry the `reviewId` parameter (may open the app page rather than the review). Trustpilot and Reddit links go to the individual review/comment.
- **CSV quotes** are verbatim excerpts (<15 words, programmatically checked) auto-picked from the coded review by theme keywords; occasionally they are the review's opening line rather than the most theme-specific sentence. Quotes below were hand-picked and checked verbatim.
- Single coder, no inter-rater check; coding categories are judgement calls (ASSUMPTION).

## Snapshot: top negative and positive themes per app

| App | n coded | Top negatives (count) | Top positives (count) |
|---|---|---|---|
| ELSA Speak | 64 | bugs, mic, audio, crashes (28); price, paywall, upsell (12); subscription / billing / trial charges (9) | felt progress / confidence (10); content breadth / structure (7); feedback usefulness (5) |
| BoldVoice | 69 | price, paywall, upsell (14); subscription / billing / trial charges (10); scoring / speech-recognition accuracy (10) | felt progress / confidence (12); feedback usefulness (9); content breadth / structure (6) |
| Duolingo | 70 | bugs, mic, audio, crashes (19); scoring / speech-recognition accuracy (17); price, paywall, upsell (13) | fun / gamification (12); felt progress / confidence (10); motivation / streaks / habit (6) |
| Speechling | 45 | bugs, mic, audio, crashes (12); UI / UX flow (8); customer support (7) | feedback usefulness (8); felt progress / confidence (7); human tutor/coach quality (7) |
| Speak | 44 | scoring / speech-recognition accuracy (12); price, paywall, upsell (10); content breadth / structure (7) | felt progress / confidence (6); fun / gamification (5); feedback usefulness (3) |
| Praktika | 44 | AI conversation & voice quality (14); subscription / billing / trial charges (8); content breadth / structure (8) | AI conversation & voice quality (6); felt progress / confidence (5); motivation / streaks / habit (4) |
| Babbel | 45 | content breadth / structure (17); scoring / speech-recognition accuracy (9); AI conversation & voice quality (7) | content breadth / structure (12); felt progress / confidence (3); feedback usefulness (3) |
| Cambly | 43 | UI / UX flow (8); price, paywall, upsell (5); customer support (5) | human tutor/coach quality (8); felt progress / confidence (4); UI / UX flow (2) |
| The Accent Kit | 45 | bugs, mic, audio, crashes (19); accent choice / authenticity (11); price, paywall, upsell (7) | fit for natives / actors (7); content breadth / structure (5); felt progress / confidence (4) |

## ELSA Speak

**Sample:** 64 coded reviews (App Store 31, Google Play 25, Trustpilot 8); stars 1*:13, 2*:12, 3*:12, 4*:13, 5*:14; review dates 2024-06-03 to 2026-11-11.

Users credit ELSA with real pronunciation progress, but the most common complaint in our sample is reliability (crashes, lag, premium not activating after payment), followed by paywall and trial/billing anger. Scoring complaints exist but are fewer than BoldVoice/Duolingo.

- **Love:** felt progress / confidence 10; content breadth / structure 7; feedback usefulness 5; scoring / speech-recognition accuracy 3; fun / gamification 3; AI conversation & voice quality 3
- **Hate:** bugs, mic, audio, crashes 28; price, paywall, upsell 12; subscription / billing / trial charges 9; UI / UX flow 8; scoring / speech-recognition accuracy 7; customer support 3; AI conversation & voice quality 2

Quotes:

- (+) "The AI feedback is accurate, the lessons are engaging" (5*, Google Play, 2026-07-18) [link](https://play.google.com/store/apps/details?id=us.nobarriers.elsa&reviewId=e36bfa0c-de43-4065-9995-c6205129e93f&hl=en&gl=US)
- (+) "App offer really well balanced daily tasks." (5*, Trustpilot, 2026-11-11) [link](https://www.trustpilot.com/reviews/6af44d075ee9925415615cbc)
- (-) "so frugal on the free lessons, you basically can't do anything" (2*, Google Play, 2026-06-17) [link](https://play.google.com/store/apps/details?id=us.nobarriers.elsa&reviewId=03908e00-8250-42f0-8c26-50c56980726f&hl=en&gl=US)
- (-) "The app doesn't work and is full of bugs." (1*, Trustpilot, 2025-07-11) [link](https://www.trustpilot.com/reviews/68703aad52abf28639568607)
- (-) "Right now the voice in the app itself sounds like a robo" (3*, App Store, 2026-07-04) [link](https://apps.apple.com/us/app/id1083804886?see-all=reviews)
- (-) "I contacted support and initially only received automated replies." (2*, Trustpilot, 2025-09-30) [link](https://www.trustpilot.com/reviews/68dba7ef26eda1274a5bb16e)

## BoldVoice

**Sample:** 69 coded reviews (App Store 32, Google Play 30, Trustpilot 7); stars 1*:14, 2*:14, 3*:13, 4*:14, 5*:14; review dates 2024-07-22 to 2026-10-24.

The closest 'accent' competitor. Praise centres on felt progress and specific feedback (sounds, intonation); complaints centre on paywall/upsell, trial charges, and scoring that is either too harsh on correct British pronunciation or too generous. Several natives use it, which supports a non-learner accent audience.

- **Love:** felt progress / confidence 12; feedback usefulness 9; content breadth / structure 6; scoring / speech-recognition accuracy 5; price, paywall, upsell 2; fit for natives / actors 2
- **Hate:** price, paywall, upsell 14; subscription / billing / trial charges 10; scoring / speech-recognition accuracy 10; bugs, mic, audio, crashes 10; UI / UX flow 8; content breadth / structure 5; accent choice / authenticity 5

Quotes:

- (+) "The accent recognition is very accurate, and the feedback is clear and helpful." (5*, Google Play, 2026-08-31) [link](https://play.google.com/store/apps/details?id=com.wellocution.androidapp&reviewId=412bfffc-e536-43d2-b6f2-95f05ec5e57a&hl=en&gl=US)
- (+) "as someone who was born speaking English this app is great!" (5*, Google Play, 2026-10-24) [link](https://play.google.com/store/apps/details?id=com.wellocution.androidapp&reviewId=cffbb3fe-3c60-4462-ad83-405025934f54&hl=en&gl=US)
- (-) "app keeps giving a 100% score (or close) even when I sound nothing like" (1*, Google Play, 2026-09-05) [link](https://play.google.com/store/apps/details?id=com.wellocution.androidapp&reviewId=2c86e5d5-448c-448b-9149-12fdfb418274&hl=en&gl=US)
- (-) "Some words I was saying correctly in British English but it stated I needed" (1*, Google Play, 2026-08-25) [link](https://play.google.com/store/apps/details?id=com.wellocution.androidapp&reviewId=14411c76-d994-4142-8ff6-522c7ad7a16d&hl=en&gl=US)
- (-) "Great Coaches but Very Monotonous and repetitive content" (2*, App Store, 2026-05-03) [link](https://apps.apple.com/us/app/id1567841142?see-all=reviews)
- (-) "I was charged for premium access after my trial was over" (1*, App Store, 2026-04-23) [link](https://apps.apple.com/us/app/id1567841142?see-all=reviews)

## Duolingo

**Sample:** 70 coded reviews (App Store 23, Google Play 40, Trustpilot 7); stars 1*:14, 2*:14, 3*:14, 4*:14, 5*:14; review dates 2024-12-09 to 2026-11-14.

Speaking-related reviews only (filtered by keyword). Fun/habit is the main love; the main hate is speech exercises marking correct or accented speech wrong, mic bugs, and Max/Family upsell pop-ups. AI video calls with Lily get both praise and 'not real conversation' criticism.

- **Love:** fun / gamification 12; felt progress / confidence 10; motivation / streaks / habit 6; AI conversation & voice quality 3; content breadth / structure 2; UI / UX flow 1
- **Hate:** bugs, mic, audio, crashes 19; scoring / speech-recognition accuracy 17; price, paywall, upsell 13; felt progress / confidence 10; AI conversation & voice quality 10; UI / UX flow 7; subscription / billing / trial charges 5

Quotes:

- (+) "it allows me to have conversations with Lily, Lucy, and Eddy." (5*, App Store, 2026-11-11) [link](https://apps.apple.com/us/app/id570060128?see-all=reviews)
- (mixed) "Won't teach you a language but a fun game that helps you drill vocab." (3*, Google Play, 2026-08-09) [link](https://play.google.com/store/apps/details?id=com.duolingo&reviewId=5bf7822d-5f1d-4a59-a78c-78ff1ddcc3a4&hl=en&gl=US)
- (-) "it marks my pronunciation as wrong even when I say" (1*, Google Play, 2026-05-14) [link](https://play.google.com/store/apps/details?id=com.duolingo&reviewId=54490414-e732-468f-9e9a-a0ca1ac63144&hl=en&gl=US)
- (-) "you say something with a accent it marks you wrong even if your correct." (1*, Google Play, 2026-11-14) [link](https://play.google.com/store/apps/details?id=com.duolingo&reviewId=0f714523-9094-40e9-ae35-92ac4e7909da&hl=en&gl=US)
- (-) "More and more popups asking to upgrade to max or family plan." (2*, Google Play, 2026-09-12) [link](https://play.google.com/store/apps/details?id=com.duolingo&reviewId=784f2c0f-1d9a-4d8d-88d9-c1b6a1138f71&hl=en&gl=US)
- (-) "I was sooooooo stressed when i didn't extend my streak I couldn't sleep well." (1*, Google Play, 2026-11-14) [link](https://play.google.com/store/apps/details?id=com.duolingo&reviewId=0f714523-9094-40e9-ae35-92ac4e7909da&hl=en&gl=US)

## Speechling

**Sample:** 45 coded reviews (App Store 17, Google Play 22, Trustpilot 6); stars 1*:9, 2*:9, 3*:9, 4*:9, 5*:9; review dates 2017-07-13 to 2026-07-31.

Older, smaller review base (sample spans 2017-2026). Loved for human-coach pronunciation feedback; hated for buggy app, support silence and renewals. Human feedback is the differentiator, not AI.

- **Love:** feedback usefulness 8; felt progress / confidence 7; human tutor/coach quality 7; content breadth / structure 7; UI / UX flow 1; scoring / speech-recognition accuracy 1
- **Hate:** bugs, mic, audio, crashes 12; UI / UX flow 8; customer support 7; subscription / billing / trial charges 6; content breadth / structure 6; price, paywall, upsell 5; scoring / speech-recognition accuracy 2

Quotes:

- (+) "personalized pronunciation feedback from a coach is INCREDIBLE." (5*, App Store, 2019-09-29) [link](https://apps.apple.com/us/app/id1239983313?see-all=reviews)
- (+) "my language coaches have given me accurate and timely feedback." (5*, Trustpilot, 2025-05-31) [link](https://www.trustpilot.com/reviews/683b04dc4c859da7128a4a5a)
- (-) "most teachers tend to mark things as correct" (1*, Trustpilot, 2023-12-05) [link](https://www.trustpilot.com/reviews/656f950e622f899ef4248aa0)
- (-) "Deceptive subscription charges" (1*, App Store, 2021-12-03) [link](https://apps.apple.com/us/app/id1239983313?see-all=reviews)
- (-) "the ui is complex and not easy to navigate." (2*, Google Play, 2026-06-23) [link](https://play.google.com/store/apps/details?id=com.speechling.speechling&reviewId=5452f03a-0a2a-4268-8234-ca3294e4be23&hl=en&gl=US)

## Speak

**Sample:** 44 coded reviews (App Store 24, Google Play 18, Trustpilot 2); stars 1*:9, 2*:8, 3*:9, 4*:9, 5*:9; review dates 2024-07-14 to 2026-11-09.

Users like being forced to speak and the app's feedback; the top complaint is recognition that accepts wrong answers or needs an American accent, plus a free tier where 'you literally can't do anything'. Reddit power-user rates Speak's voice best of Duolingo Max / Speak / Praktika (UNVERIFIED single opinion).

- **Love:** felt progress / confidence 6; fun / gamification 5; feedback usefulness 3; AI conversation & voice quality 3; content breadth / structure 2; UI / UX flow 1
- **Hate:** scoring / speech-recognition accuracy 12; price, paywall, upsell 10; content breadth / structure 7; bugs, mic, audio, crashes 6; UI / UX flow 5; AI conversation & voice quality 4; subscription / billing / trial charges 3

Quotes:

- (+) "speak the words and the app will give you feedback and I love it!" (5*, Google Play, 2026-02-21) [link](https://play.google.com/store/apps/details?id=com.selabs.speak&reviewId=2a24647b-9ea7-4190-8b68-4dd34bcbd92e&hl=en&gl=US)
- (-) "will often give you a "correct" even when what you said was wrong." (1*, Google Play, 2026-09-19) [link](https://play.google.com/store/apps/details?id=com.selabs.speak&reviewId=19148032-66be-4779-8610-eb6ab6730999&hl=en&gl=US)
- (-) "to say something in a very heavy American accent to be recognized as correct." (2*, App Store, 2026-06-05) [link](https://apps.apple.com/us/app/id1286609883?see-all=reviews)
- (-) "you literally can't do anything in the free version." (2*, Google Play, 2026-06-01) [link](https://play.google.com/store/apps/details?id=com.selabs.speak&reviewId=c4246b38-484e-4270-85cf-57a0d8e9d964&hl=en&gl=US)
- (-) "it would be awesome if you could choose what dialect to speak in." (2*, App Store, 2026-05-29) [link](https://apps.apple.com/us/app/id1286609883?see-all=reviews)

## Praktika

**Sample:** 44 coded reviews (App Store 16, Google Play 15, Trustpilot 13); stars 1*:9, 2*:9, 3*:9, 4*:9, 5*:8; review dates 2025-01-29 to 2026-11-13.

AI-avatar tutor. The dominant theme is AI conversation quality, mostly negative: avatar interrupts, doesn't hear the user, robotic TTS, repetitive loops; plus trial/billing complaints. Positives are confidence and daily practice.

- **Love:** AI conversation & voice quality 6; felt progress / confidence 5; motivation / streaks / habit 4; fun / gamification 2; content breadth / structure 2; general praise/complaint 1
- **Hate:** AI conversation & voice quality 14; subscription / billing / trial charges 8; content breadth / structure 8; bugs, mic, audio, crashes 6; price, paywall, upsell 5; UI / UX flow 4; scoring / speech-recognition accuracy 3

Quotes:

- (+) "This app has helped me speak Spanish more confidently." (4*, Google Play, 2026-07-03) [link](https://play.google.com/store/apps/details?id=ai.praktika.android&reviewId=14940dbd-0d17-458d-94b9-b41f41191d56&hl=en&gl=US)
- (+) "an immediate verbal response to errors" (4*, Trustpilot, 2026-11-08) [link](https://www.trustpilot.com/reviews/6af07901d25a448b21685014)
- (-) "The avatar constantly interrupts" (1*, Trustpilot, 2026-11-13) [link](https://www.trustpilot.com/reviews/6af71c9a64a93b909c3ef485)
- (-) "Also, very often it simply doesn't hear me." (1*, Trustpilot, 2026-11-13) [link](https://www.trustpilot.com/reviews/6af71c9a64a93b909c3ef485)
- (-) "I was expecting full screen and hands free conversation." (3*, Trustpilot, 2026-11-10) [link](https://www.trustpilot.com/reviews/6af2e974a34f82aa10e485c3)
- (-) "Subscription Theft" (1*, App Store, 2026-05-30) [link](https://apps.apple.com/us/app/id1624701477?see-all=reviews)

## Babbel

**Sample:** 45 coded reviews (App Store 20, Google Play 17, Trustpilot 8); stars 1*:9, 2*:9, 3*:9, 4*:9, 5*:9; review dates 2024-07-23 to 2026-11-13.

Speaking-related reviews only. Loved for structure/grammar; hated for speech recognition failures and lack of real conversation. One review flags inconsistent accents across course speakers.

- **Love:** content breadth / structure 12; felt progress / confidence 3; feedback usefulness 3; UI / UX flow 2; fun / gamification 2; motivation / streaks / habit 1
- **Hate:** content breadth / structure 17; scoring / speech-recognition accuracy 9; AI conversation & voice quality 7; UI / UX flow 5; bugs, mic, audio, crashes 5; subscription / billing / trial charges 3; fun / gamification 3

Quotes:

- (+) "the app provides detailed explanations of grammar and pronunciation." (5*, Google Play, 2026-08-05) [link](https://play.google.com/store/apps/details?id=com.babbel.mobile.android.en&reviewId=47f197e5-fe8c-4204-b71d-24230dd347ab&hl=en&gl=US)
- (+) "Very good for getting you speaking." (3*, Google Play, 2026-11-09) [link](https://play.google.com/store/apps/details?id=com.babbel.mobile.android.en&reviewId=3b3ac914-477a-4cf6-8e65-c6b558913fcb&hl=en&gl=US)
- (-) "at least half of the time it doesn't recognize what I said correctly." (1*, Google Play, 2026-10-14) [link](https://play.google.com/store/apps/details?id=com.babbel.mobile.android.en&reviewId=5f1d87f7-fef2-44f3-993b-57d831315d4e&hl=en&gl=US)
- (-) "More conversation and less vocabulary" (3*, Trustpilot, 2026-10-07) [link](https://www.trustpilot.com/reviews/6ac6272f4fb87da99e63cc6b)
- (-) "The Portuguese course has speakers with very different accents and pronunciation." (3*, Trustpilot, 2026-10-08) [link](https://www.trustpilot.com/reviews/6ac7d6cc98817901fcf3d2fd)

## Cambly

**Sample:** 43 coded reviews (App Store 7, Trustpilot 11, Google Play 25); stars 1*:12, 2*:8, 3*:7, 4*:5, 5*:11; review dates 2024-06-22 to 2026-11-02.

Human-tutor marketplace. Caveat: 14 of 43 coded reviews were written by tutors (worker complaints about pay), mostly from Trustpilot; 8 non-English reviews were excluded. Learner reviews praise friendly native tutors and confidence; complaints are price, app bugs and UI.

- **Love:** human tutor/coach quality 8; felt progress / confidence 4; UI / UX flow 2; general praise/complaint 2
- **Hate:** UI / UX flow 8; price, paywall, upsell 5; customer support 5; bugs, mic, audio, crashes 5; human tutor/coach quality 3; subscription / billing / trial charges 2; content breadth / structure 2

Quotes:

- (+) "The tutors are friendly and supportive" (5*, App Store, 2026-10-26) [link](https://apps.apple.com/us/app/id564024107?see-all=reviews)
- (+) "Speaking English is now much easier and more beneficial." (5*, Google Play, 2025-05-14) [link](https://play.google.com/store/apps/details?id=com.cambly.cambly&reviewId=9110ae7e-3681-401a-aae8-a52631b0d5d8&hl=en&gl=US)
- (-) "the tutors mostly make a small talk" (3*, App Store, 2026-07-19) [link](https://apps.apple.com/us/app/id564024107?see-all=reviews)
- (-) "my screen is black and my camera keeps loading" (1*, App Store, 2025-06-17) [link](https://apps.apple.com/us/app/id564024107?see-all=reviews)
- (-) "your given plans are very expensive so i can't afford your subscription" (3*, Google Play, 2024-07-25) [link](https://play.google.com/store/apps/details?id=com.cambly.cambly&reviewId=3a7f1bef-026d-4cc0-b270-1e1a96ec2376&hl=en&gl=US)

## The Accent Kit

**Sample:** 45 coded reviews (App Store 16, Google Play 29); stars 1*:9, 2*:9, 3*:9, 4*:9, 5*:9; review dates 2014-12-14 to 2026-07-10.

Selected as the accent-specific app for actors (dialect-coach-made audio kits; no scoring found in reviews). Only 106 store reviews exist across both stores, many old (2014+). Actors/drama teachers love it for auditions and shows; the top complaint is audio/purchases not downloading or playing, then limited accent selection and per-accent prices.

- **Love:** fit for natives / actors 7; content breadth / structure 5; felt progress / confidence 4; feedback usefulness 3; UI / UX flow 2; accent choice / authenticity 2
- **Hate:** bugs, mic, audio, crashes 19; accent choice / authenticity 11; price, paywall, upsell 7; feedback usefulness 3; content breadth / structure 3; subscription / billing / trial charges 2

Quotes:

- (+) "Super handy when I need to perfect an accent for an audition" (5*, App Store, 2021-02-10) [link](https://apps.apple.com/us/app/id854413379?see-all=reviews)
- (+) "my drama students use it everytime we are rehearsing a play." (5*, Google Play, 2021-02-09) [link](https://play.google.com/store/apps/details?id=com.theaccentkit.theaccentkit&reviewId=d6d0707c-5c83-4054-8395-04483608b323&hl=en&gl=US)
- (+) "Perhaps some way to compare certain sounds in minimal pairs" (5*, Google Play, 2018-02-16) [link](https://play.google.com/store/apps/details?id=com.theaccentkit.theaccentkit&reviewId=30590551-f200-4844-86f3-5bca9a06894f&hl=en&gl=US)
- (-) "Nothing downloads." (1*, App Store, 2019-01-10) [link](https://apps.apple.com/us/app/id854413379?see-all=reviews)
- (-) "The recordings are so fast that there is no way to accurately learn" (1*, App Store, 2026-07-10) [link](https://apps.apple.com/us/app/id854413379?see-all=reviews)
- (-) "it didnt sound anything like people here!" (2*, Google Play, 2018-03-18) [link](https://play.google.com/store/apps/details?id=com.theaccentkit.theaccentkit&reviewId=76e83585-c78d-488a-88bf-076b6b844502&hl=en&gl=US)

## Reddit (qualitative, not counted above)

Six threads fully read (see `sources.md`); 17 excerpts are in `review_mining.csv` with source=Reddit.

- A Dec 2025 r/languagelearning comparison of Duolingo Max, Speak and Praktika (one user's opinion, UNVERIFIED): "Speak has the best voice as of December 2025"; on Praktika, "the text to voice is really bad, extremely robotic"; on Duolingo Max, "calling the AI dialogue a video chat is pushing it". [thread](https://www.reddit.com/r/languagelearning/comments/1pxvr2f/duolingo_max_vs_speak_vs_praktika_for_speaking/)
- ELSA gets recommended for British-accent goals with a caveat: "it uses American accent however." [thread](https://www.reddit.com/r/languagelearning/comments/1d0bkcm/learning_a_british_accent_as_a_foreigner/) The same thread pushes back on a single "British accent": "RP isn't neutral" and "We have about 1000 accents in this country".
- A native English speaker pays for ELSA and checks their score, "which I found good to know considering I'm a native English speaker." [thread](https://www.reddit.com/r/languagelearning/comments/11c6qra/is_there_any_free_open_source_alternative_to_elsa/)
- In a 2026 thread about AI speaking apps, the poster says they are "really anxious talking with real people". Replies are sceptical: "It also felt creepy and soul-sucking" (about a bird-mascot app); "These apps are always just thin wrappers around these APIs". [thread](https://www.reddit.com/r/languagelearning/comments/1tz8m2z/are_those_apps_where_you_can_talk_with_an_ai_to/)
- We collected search-result titles from r/acting, r/VoiceActing, r/duolingo, r/EnglishLearning and r/languagelearning (24 searches). They show that actors ask for accent coaches/apps for niche accents. We could not read most of these threads because Reddit rate-limited us, so this point is UNVERIFIED beyond the titles.

## Openings for Sound Local (cross-app)

Counts come from `review_themes.csv` (star-stratified sample, so they show how often a topic comes up, not how many users feel it). Where we say what Sound Local should do, that is our inference (ASSUMPTION), not something reviewers asked for word for word.

1. **People don't trust the scores. Make Sound Local's scoring easy to see and kind.** Complaints about scoring or speech recognition showed up for Duolingo (17), Speak (12), BoldVoice (10), Babbel (9) and ELSA (7). They cut both ways. Sometimes correct or accented speech is marked wrong ("it marks you wrong even if your correct", Duolingo). Sometimes everything passes ("app keeps giving a 100% score (or close) even when I sound nothing like", BoldVoice; "correct" when wrong, Speak). *Opening:* show *why* a line scored the way it did: the player's pitch and rhythm drawn over the local's, plus "hear yours, then theirs". Don't give a bare pass/fail. Make sure a close attempt never gets 100%, and soft-fail kindly.
2. **Most apps treat one accent as the correct one. Regional accents are open ground.** Reviewers complain about forced US norms: "a very heavy American accent to be recognized as correct" (Speak); British pronunciation marked wrong (BoldVoice); ELSA "uses American accent" (Reddit). Others ask for a dialect choice: "choose what dialect to speak in" (Speak). The Accent Kit, the only accent-for-actors app we found, gets 11 negative accent-choice mentions: too few accents ("really wish there was a Polish accent") and local accents that don't ring true ("it didnt sound anything like people here!"). *Opening:* Glasgow-first, region-specific play with real local voices directly answers this. Authenticity is critical: locals will publicly call out a fake accent.
3. **Actors and native speakers are a real but small group, and the tools they have are static.** Accent Kit reviewers use it for auditions and shows (7 positive mentions from actors and natives). They want minimal pairs, IPA and slower audio ("compare certain sounds in minimal pairs"; recordings "so fast that there is no way to accurately learn"). In our sample, The Accent Kit has no scoring and no interaction (ASSUMPTION based on its reviews; we did not test the app). Natives also use BoldVoice and ELSA. *Opening:* an "audition prep" mode with slowed reference audio, sound-by-sound drills and quick scored reps.
4. **Trial and billing traps get the angriest reviews.** Negative mentions of trials, renewals or billing: BoldVoice 10, ELSA 9, Praktika 8, Speechling 6, Duolingo 5. Upsell and paywall complaints: BoldVoice 14, Duolingo 13, ELSA 12, Speak 10. Typical lines: "you basically can't do anything" (ELSA free tier); "you literally can't do anything in the free version" (Speak). *Opening:* a free browser game you play without signing up or entering a card. If we charge later, use clear one-off unlocks, not auto-renewing trials.
5. **How the AI voice sounds and takes turns decides how good a conversation feels.** Praktika's top theme is AI conversation quality (14 negative mentions: "The avatar constantly interrupts", "it simply doesn't hear me", robotic voice). Duolingo gets 10 negative mentions here. ELSA's voice "sounds like a robo". On Reddit, Speak's lifelike voice and button-based turn-taking are what people praise. *Opening:* ElevenLabs voices with clear push-to-talk turns, short replies from the character, and no interrupting.
6. **Duolingo's fun is the bar to beat, and accent apps feel like drills.** Duolingo's top positive theme is fun and gamification (12), with habit/streaks next (6). But streaks also cause stress ("I was sooooooo stressed when i didn't extend my streak"). BoldVoice gets "Very Monotonous and repetitive content", and Praktika gets loops. *Opening:* story, characters and a sense of place (Glasgow streets, a local who reacts to you) instead of word lists. Use streaks with no guilt.
7. **The microphone has to just work.** Bugs, mic and audio problems are the top negative theme for ELSA (28), Duolingo (19) and The Accent Kit (19). Some Accent Kit users only fixed recording after finding the phone's mic permission setting. *Opening:* a mic check on the first screen, clear in-browser permission prompts, and "we can't hear you" help. In a browser game the mic is the whole product.
8. **Practising with no one judging is a draw. Being mocked is a risk.** One Reddit poster wants AI practice because they are anxious talking to people, and people describe Cambly and Speak as confidence builders. Others find AI chat "creepy". *Opening:* make Sound Local feel like a friendly local having a laugh *with* you (the brief already says "kind, never mocking"), not like a test.

## Gaps / what we did not cover
- No Talkpal or Busuu analysis (we collected Busuu data as a backup but did not code it). Accentify was considered but has too few reviews (its data is not in the CSVs).
- No reviews from storefronts outside the US. No review text in other languages (excluded). We did not verify any app features ourselves.
