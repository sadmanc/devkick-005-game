# Sound Local as a mobile app: feasibility guide

Written overnight 15 Nov 2026 by Devin (session 2 of 4) for Sadman, Lucas and Paul.
Facts about the outside world carry a citation like **[A12]**: letter = research note in
[`research-notes/`](research-notes/) (A platform rules, B audio and speech tech, C money, D privacy and age,
E competitors, F our own code), number = that note's source list, where the link and the date read
(all 2026-11-15) are given. Note D numbers its sources S1-S54, so it is cited as [D-S26]. The most important links are repeated in [Sources](#sources) at the bottom.
**ASSUMPTION** = my estimate. **UNVERIFIED** = could not confirm from a primary source. Not legal advice.

---

## The one-page summary (read this if nothing else)

**Recommendation: yes, go mobile, but by wrapping the game we already have, not by rebuilding it.**

1. **Now (next 2-3 weeks): make the website installable (a "PWA") and fix the phone basics.** It costs almost
   nothing and every later step reuses it. But a PWA alone is not enough on iPhone: an installed web app
   asks for the microphone **every time it is opened** (an open Apple bug, Oct 2026 [B1][A16]), iPhone web push only
   works after the player manually adds the app to the home screen [A1], and there are no widgets and no App
   Store listing [A19].
2. **Next (about 6-10 weeks after that): put the same game in a native "shell" with Capacitor and ship it to
   the App Store and Google Play.** Capacitor keeps nearly all of our code (ASSUMPTION: ~95%) (Three.js, the pitch "ear", all the
   content) and adds what a speaking game needs: the mic is asked for **once**, sound works with the silent
   switch on, real push reminders for streaks, home-screen widgets, haptics, in-app subscriptions [A21][B12].
   Tonight I built this shell for Android in `mobile-spike/`: it launches, loads the 3D game and gets the mic
   through the native Android prompt on an emulator; the AI calls need a small server fix first (section 8).
3. **Later, only where it pays: native pieces.** A widget, a better audio session, on-device speech-to-text.
   Do **not** rewrite in React Native, Swift/Kotlin, Unity or Godot now: each means rebuilding the 3D game for
   gains we can get through Capacitor plugins.

**Why mobile at all?** Every serious competitor (Duolingo, ELSA, Speak, BoldVoice, Praktika) lives on the
App Store and Google Play first; their websites are mostly sign-up and payment pages [E1]-[E6]. Duolingo's
retention engine is streaks plus push notifications plus widgets: half the learners with its streak widget
have streaks of 6+ months [E42], and its smart reminders alone added 0.5% daily users [C47].

**What it costs.** Accounts: US$99/year Apple + US$25 once Google [C30][C31]. Test phones: about CA$365 for a
refurbished iPhone SE and a Galaxy A16 [C44][C45]. iOS builds need a Mac **or** a cloud build service (free
tiers exist: Expo, Xcode Cloud 25 h/month) [C33][C36]. Running costs barely change. The stores take **15%**
of subscriptions at our size (not 30%) [C1][C3][C8], versus ~3-5% on the web; RevenueCat's own test found
in-app checkout converts so much better that web-only earned ~6% *less* overall [C27]. Offer both.

**What does not get cheaper on a phone:** the AI conversation. Speech-to-text is only ~$0.002 of a
conversation; the voice reply (ElevenLabs TTS, ~$0.056) and Claude are the real cost (section 6). Moving
speech recognition onto the phone saves almost nothing; pre-recording lines and a cheaper voice model save more.

**Biggest risks:** Apple rejecting a "wrapped website" (guideline 4.2) [A41]; the new Apple rule that we
must get explicit permission before sending voice to ElevenLabs/Anthropic (5.1.2(i), Nov 2025) [D-S26];
teen age-verification laws now live in Texas/Utah/Louisiana [D-S20][D-S21][D-S23]; Bluetooth earbuds drop the mic to
phone-call quality, on every platform [B10].

**Decisions for the founders (section 7.4):** (1) approve PWA now + Capacitor app next; (2) open the Apple
and Google accounts **as a company** (needs a D-U-N-S number; avoids Google's 12-tester/14-day rule for
personal accounts) [A47][A50]; (3) minimum age 13+ with no Kids category; (4) iPhone-first or both stores
at once; (5) buy one Mac mini or use cloud builds; (6) web checkout as well as in-app, or in-app only.

---

## Comparison table: every way to go mobile

| Option | What it is | Code we keep | Effort (team of 3 + AI coders) | Money up front | App Store? | Main risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A. PWA** (installable website) | Manifest + service worker; "Add to Home Screen" | 100% | 1-2 weeks | ~$0 | No (Play only via TWA wrapper [A20]) | iPhone re-asks mic every launch [B1]; push only after manual install [A1]; no widgets | **Do now**, as the base |
| **B. Capacitor wrap** | Our built web app inside a native iOS/Android shell, plus plugins | ~95% (Three.js, voice, content, server unchanged) | 6-10 weeks to both stores (ASSUMPTION) | $124 accounts + devices + Mac or cloud builds | Yes, both | Apple 4.2 "repackaged website" rejection if it feels like a website [A41] | **Do next** |
| B2. Tauri 2 mobile / Cordova | Other wrappers | ~95% | Similar | Same | Yes | Tauri mobile is young; Cordova is legacy [A21-A26] | No: Capacitor has the plugins we need |
| **C. React Native / Expo** | New app in React; 3D in a WebView or via expo-gl + react-three-fiber | Content and server; UI rewritten; 3D either wrapped anyway or ported | 3-5 months (ASSUMPTION) | Same + EAS plans $0-199/mo [C33] | Yes | expo-gl/R3F native reported broken in 2025 [A30][A31]; two codebases during migration | Not now; reconsider if the app becomes mostly 2D screens |
| **D. Fully native** (SwiftUI + Kotlin) | Two separate apps; 3D in SceneKit/RealityKit/Filament | Server and content only | 6-12 months, two skill sets (ASSUMPTION) | Same | Yes | Two codebases forever; slow for a 3-person team | No |
| **E. Game engine** (Unity / Godot) | Rebuild the game in an engine | Server, content, 3D models | 4-8 months (ASSUMPTION) | Unity Personal free to US$200k [A37]; Godot free, MIT [A39] | Yes | Rewrite; engine skills; Unity's licence history [A36] | No, unless 3D becomes the product |

How competitors chose: Duolingo native Kotlin/Swift with Rive animation [E8][E9][E10]; ELSA moved native ->
**Flutter** [E12]; BoldVoice **React Native** [E16]; Speak native [E21]; Praktika **Unity** for 3D avatars
[E29]; Babbel native + Kotlin Multiplatform, after pulling a React Native experiment [E32]; Pronounce ships
its web app on Play as a TWA wrapper [E37]. No winner by technology: they win on feedback quality.

---

## 1. What we have today, precisely

Full inventory with file and line numbers: [`research-notes/F-codebase-inventory.md`](research-notes/F-codebase-inventory.md).

**Shape:** plain JavaScript + Three.js 0.187 + Vite, static `dist/` plus two Vercel functions,
`POST /api/otter` (Claude + ElevenLabs TTS, and STT of the answer) and `POST /api/stt` (ElevenLabs Scribe).
No accounts, no database, no saved progress, no service worker or manifest, no localStorage. `npm run check`
passes (115 tests). The build is **16.5 MB** of files: 12.8 MB of 3D models (otter 4.7 MB, cow 4.4 MB,
Glasgow street 2.2 MB, seagull 1.5 MB), 2.6 MB of MP3s, a 764 kB JS bundle (202 kB gzipped).

| What the app uses | Where in our code | iPhone Safari today | Android Chrome today | In a Capacitor app |
| --- | --- | --- | --- | --- |
| **Mic permission** (`getUserMedia({audio:true})`, asked up front then per recording) | `src/main.js:288`, `src/voice/index.js:18`, `src/voice/record.js:6`, `src/game/liveVoice.js:128` | Works since iOS 14.3. Tab: one-time grant, forgotten when page closes. **Installed web app: asks again every launch**, no "always allow" (WebKit bug 327237, open) [B1][B15] | Normal prompt; "allow on every visit" possible [B2] | iOS: one system prompt, then the app grants the web view itself (iOS 15+ delegate) [B12][B13]. Android: Capacitor requests RECORD_AUDIO and grants it to the web view (`BridgeWebChromeClient.java:101-124`; **verified on an Android 16 emulator tonight**, section 8) [B52] |
| **Two mic streams at once** (recorder + live pitch graph) | `src/main.js:739-761` | Works in tests elsewhere, but each stream is a separate capture; UNVERIFIED on device | Works | Same as browser; test on devices |
| **Recording format** (`MediaRecorder` with no type, browser default) | `src/voice/index.js:20`, `record.js:8` | audio/mp4 since 14.3; WebM/Opus since Safari 18.4 [B3][B4]. Server already names mp4 uploads `.m4a` | audio/webm;codecs=opus | Same as the browser engine underneath |
| **Web Audio** (AudioContext, analysers, oscillators, SFX buffers) | `src/game/audio.js` | Needs a tap first (we unlock on Play). **Muted when the silent switch is on** (WebKit bug 237322) [B6]; `navigator.audioSession` (Safari 16.4+) can help [B8a] | Needs a tap | Native audio session ("play and record") avoids the silent-switch mute (needs a small plugin) [B57] |
| **Echo cancellation** | Only the live graph asks for it (`liveVoice.js:128`) | On by default [B39] | On by default | Native voice-processing modes available [B58][B60] |
| **Bluetooth headsets** | not handled | Opening the mic switches earbuds to call mode (8-16 kHz, worse playback) [B10][B11] | Same | Same in native apps: design around it (prompt "use phone mic or wired") |
| **Speech recognition** | Server: ElevenLabs Scribe `scribe_v1` (`server/otter.js:227-247`). Browser SpeechRecognition code exists but is switched off (`src/main.js:186-200`) | Web Speech exists but is server-backed and limited [B42][B43] | On-device Web Speech from Chrome 139 [B44] | Apple Speech / Android SpeechRecognizer free on device [B18][B19][B20] |
| **Pitch "ear"** (YIN + DTW, 0.7 melody + 0.3 rhythm) | `src/voice/pitch.js`, runs in the browser | Runs on device already | Runs on device | Unchanged |
| **Voice playback** (`new Audio(dataURL)` + analyser for the otter's mouth; browser TTS fallback) | `src/game/audio.js:18-105` | Works after unlock; browser voices have no Scottish voice [B83] | Same | Same |
| **3D** (WebGLRenderer, antialias, pixel ratio capped at 2, no shadows, 900-1800 rain drops, loop never pauses) | `src/game/otterScene.js:15-30`, `loop.js` | WebGL2 fine on recent iPhones; Safari can reload the page under memory pressure with WebGL [B48]; ~13 MB of models all loaded at start | Fine on mid-range; weak on low-end [B50] | Same engine (WKWebView / Android WebView). Must pause rendering when backgrounded (battery) |
| **Storage** | none | Installed web apps get their own 7-day counter: data kept while the app is used [A6][A7] | Persistent | App storage, not evicted |
| **Fonts** | Google Fonts from the network (`index.html:8`) | Needs network | Needs network | Bundle them for offline |

**Battery and memory (ASSUMPTION, not measured):** the 120 Hz game loop and render keep running even when the
3D stage is hidden and when the tab is in the background (`loop.js`, no `visibilitychange` handling). On a
phone this drains battery and heats the device. This is the first thing to fix for any mobile option.

### 1.1 Our server and outside services

| Piece | What it does today | What changes on mobile |
| --- | --- | --- |
| `POST /api/otter` (`api/otter.js` -> `server/otter.js`) | Takes the player's audio (base64, up to ~3 MB) or text, gets an STT transcript, asks Claude (`claude-opus-5-5` by default, 350 output tokens max, strict JSON reply) for the otter's line, scores and an "accent" verdict, then makes the voice with ElevenLabs TTS (`eleven_v3`, mp3 44.1 kHz) | **Nothing on the server.** But the app calls it with a *relative* path (`fetch('api/otter')`, `src/game/conversation.js:30`). Inside a Capacitor app the page lives at `https://localhost` (Android) / `capacitor://localhost` (iOS), so that call goes to the phone, not to Vercel, and fails. Fix: one `API_BASE` setting (e.g. `https://sound-local.vercel.app/`) and CORS headers on both functions. Not done tonight because the brief says not to touch `src/` |
| `POST /api/stt` (`api/stt.js`) | Uploads the clip to ElevenLabs Scribe (`scribe_v1`), returns words with timings for the subtitle | Same `API_BASE` + CORS issue |
| Rate limits (`server/limits.js`) | 20 requests/min and 300/day per IP, 2,000 AI turns/day: all **in memory, per server instance** | Phones on mobile data share carrier IPs, so per-IP limits will hit innocent players; and limits do not add up across Vercel instances. Needs accounts or device IDs + a shared store before launch |
| TTS cache (`server/ttsCache.js`) | In-memory, ~100 lines per model, lost on cold start | Fine for a demo, not a cost control. Pre-recorded lines in the app are better (section 5) |
| Usage counting (`server/usage.js`) | Writes token/character/second counts to logs; no dollars, no database | Same; needs a real meter before paid launch |
| Secrets | Only on the server (`process.env`), never in `src/` | A mobile app is even easier to unpack than a website: keys must stay on the server |

### 1.2 How scoring works (and what moves on a phone)

- **Melody and rhythm** run **on the device already**: YIN pitch tracking every
  ~10 ms, normalised to semitones, compared to the otter's reference clip with DTW; loudness envelope for rhythm
  (`src/voice/pitch.js`). This works the same in any wrapper and costs nothing. A native rewrite (e.g. Swift with
  Accelerate) would only be faster, not better.
- **Words**: the transcript comes from ElevenLabs Scribe on the server; `src/voice/match.js` fuzzy-matches it to the
  target words. On a phone this *could* move on-device (Apple Speech, Android SpeechRecognizer, both free) [B18][B19][B20],
  but these engines are tuned to "correct" what you said into standard words, and they do not score accent
  (note B, takeaway 6). Keep Scribe for scoring; on-device STT is only worth it for live captions or offline mode.
- **Claude's judgement**: in free talk Claude reads the transcript and returns `{sounds_local, accent_bonus, meaning_ok}`;
  the code adds a capped accent bonus/penalty. Claude never hears the audio, only text, so "accent" is inferred from
  spellings like "cannae". This is the product's weakest link on any platform (see the accent-science brief).

---

## 2. What we gain on a phone

| Feature | PWA (web) | Capacitor app | Why it matters for us | Source |
| --- | --- | --- | --- | --- |
| Home-screen icon | Yes; iOS 26+ opens every saved site as an app, but there is no install button on iPhone | Yes, from the store | Daily habit | [A8][A12] |
| Store listing, ratings, search | Play only (TWA) | Both stores | Where learners look for apps [E1]-[E6] | [A19][A20] |
| Push reminders (streaks) | Android yes; iPhone only after manual install (iOS 16.4+) | Both, reliable | Duolingo's reminder algorithm: +0.5% daily users, +2% new-user retention | [A1][C47] |
| Widgets (streak on lock/home screen) | No | Yes, but needs a small native widget (Swift/Kotlin) | Half of Duolingo widget users have 6+ month streaks | [E42] |
| Mic asked once | No on iPhone (asks every launch) | Yes | A speaking game asks for the mic constantly | [B1][B12] |
| Sound with silent switch on | No (Web Audio muted) | Yes, with audio-session plugin | Players often have silent on | [B6][B57] |
| Haptics | Android only (no Vibration API on iOS) | Both (`@capacitor/haptics`) | "Game feel" rule in AGENTS.md | [A13] |
| Background audio (listen practice with screen off) | Unreliable on iOS | Yes with native audio session | Nice-to-have | [A17] |
| On-device STT | Chrome 139+ only | Both via plugin | Offline captions, privacy | [B18]-[B20][B44] |
| Offline lesson packs | Possible with a service worker (16.5 MB fits) | Easier (bundle in app) | Commuters, planes | [A6][A7] |
| In-app subscriptions | No (web checkout only) | Apple/Google billing via RevenueCat | Higher conversion [C27] | [C8] |

## 3. What we lose or what gets harder

- **Review**: every release goes through Apple review (about half within 24 h, 90% within 48 h) [A43]. A bad build
  can't be hot-fixed in minutes like Vercel. Keep game content on the server where allowed, and use TestFlight /
  Play internal testing for every build.
- **Apple guideline 4.2 (minimum functionality)**: apps must be "more than a repackaged website" [A41]. Our mitigations:
  real mic gameplay, push, haptics, widget, offline packs, no browser chrome, no external links in the core loop.
  ASSUMPTION: a voice game with these extras will pass; we only know after the first submission. Guideline 2.5.2
  forbids downloading code that changes the app's features; loading the whole game from a URL (`server.url`) adds
  risk, so ship the web build inside the app [A41].
- **Two stores, two sets of rules, device fragmentation**: low-end Android WebViews are much weaker at WebGL [B50].
- **Google closed testing**: a *personal* Play account must run a closed test with at least 12 testers for 14 days
  in a row before going public; an *organization* account does not [A50]. Target API 36 is required since
  31 Aug 2026 [A51].
- **Mac for iOS**: building, signing and uploading needs Xcode on macOS, but a cloud Mac (Expo EAS, Codemagic,
  GitHub macOS runners, Xcode Cloud) works without owning one [A57]-[A60].
- **Size**: our 16.5 MB is far below the limits (Play base module 500 MB; Apple 4 GB; cellular download prompt above
  200 MB, UNVERIFIED on Apple.com) [A54][A61][A62].
- **Accounts**: Apple US$99/year; an organization needs a free D-U-N-S number (about 5 business days) [A46][A47][A48].
  Google US$25 once [A49].

---

## 4. Voice privacy and safety (not legal advice)

Full detail: [`research-notes/D-privacy-safety-age.md`](research-notes/D-privacy-safety-age.md).

1. **A voice recording is personal data; a voiceprint is biometric data.** Illinois BIPA ($1,000-$5,000 per person,
   private lawsuits) and Texas CUBI cover "voiceprints"; Washington explicitly excludes plain recordings; California
   counts recordings *from which a voiceprint can be extracted* [D-S1][D-S2][D-S4][D-S5][D-S8]. **Rule for us:** never
   create speaker embeddings or voice IDs, never use voice cloning on players, do not keep raw audio by default, do not
   train on it. Today the code already keeps nothing: audio goes to ElevenLabs and is dropped by our server.
2. **Apple 5.1.2(i) (13 Nov 2025):** before sending personal data to a third-party AI we must say so and get explicit
   permission [D-S26]. So: one clear consent screen *before* the first recording ("Your voice is sent to ElevenLabs to
   turn it into text, and the text to Anthropic's Claude to reply. We don't keep recordings.").
3. **Mic permission text** (iOS `NSMicrophoneUsageDescription`, required or the app crashes) [A24]: suggested wording:
   "Sound Local listens when you hold the talk button, so the otter can hear how you say each phrase."
4. **Store labels:** Apple "Audio Data" and Google "Voice or sound recordings" must be declared because audio leaves
   the phone [D-S27][D-S29].
5. **Vendors:** Anthropic API data is deleted within 30 days and not used for training; zero retention is available on
   request. ElevenLabs **may use data to improve its models** unless we turn that setting off or are on Enterprise
   [D-S35][D-S36] (takeaway 8 in note D). **Action: switch that ElevenLabs setting off now.**
6. **Age:** amended COPPA (compliance since 22 Apr 2026) treats a child's voice recording as personal information
   [D-S16]. Teen app-store laws are live: Texas SB 2420 (enforced since June/July 2026), Utah (6 May 2026), Louisiana
   (1 Jul 2026), California AB 1043 from 1 Jan 2027 [D-S20][D-S21][D-S22][D-S23][D-S25]. **Recommendation:** 13+ only,
   no Kids category, read Apple's Declared Age Range and Google's Play Age Signals in the app [D-S24].
7. **Canada:** PIPEDA/OPC treats voice as a behavioural biometric; Quebec Law 25 needs a privacy impact assessment
   before personal data leaves Quebec (our vendors are US) [D-S38]-[D-S42]. **EU/UK:** GDPR applies; AI Act Art. 50
   (from 2 Aug 2026) means telling players the otter is an AI [D-S44][D-S45].

---

## 5. Money

### 5.1 Getting started (one-time and monthly)

| Item | Cost | Source |
| --- | --- | --- |
| Apple Developer Program | US$99 / year | [C30] |
| Google Play Console | US$25 once | [C31] |
| Test phones | refurbished iPhone SE 3rd gen ~CA$150; Galaxy A16 ~CA$215 | [C44][C45] |
| Mac (optional) | Mac mini M4 from US$599 new, CA$929 refurbished (Apple Canada) | [C37][C38] |
| Cloud builds | Expo EAS Free / US$19 / US$199 per month; Xcode Cloud 25 h/month included; Codemagic M2 US$0.095/min; GitHub macOS US$0.062/min | [C33][C34][C35][C36] |
| Device testing | Firebase Test Lab free: 5 physical-device runs/day; BrowserStack from ~US$29/mo (tier mapping UNVERIFIED) | [C63][C64] |
| Push | APNs/FCM free (UNVERIFIED primary); OneSignal free to 1,000 users | [C39][C40][C65] |
| Crash reports | Sentry free (1 user), Team US$26/mo | [C41] |
| Subscriptions SDK | RevenueCat free under US$2.5k monthly revenue | [C8 note], see note C takeaway 8 |

**Total to reach both stores: about US$124 + ~CA$365 of phones, and US$0-19/month** if we use free cloud builds
(ASSUMPTION: excludes people's time).

### 5.2 Revenue per subscriber (example price US$9.99/month, ASSUMPTION)

| Channel | Fee | We keep | Source |
| --- | --- | --- | --- |
| Web, Stripe (US) | 2.9% + 30c | ~US$9.40 | [C21] |
| Web, merchant of record (Paddle / Lemon Squeezy; handles sales tax) | 5% + 50c | ~US$8.99 | [C22][C23] |
| Apple, Small Business Program (< US$1M/yr) | 15% | ~US$8.49 | [C1] |
| Google Play subscriptions | 15% (Canada); US now 10% + 5% billing | ~US$8.49 | [C8] |

Rules by region (state on 15 Nov 2026): **US** apps may link to web checkout after *Epic v. Apple*; Apple's Supreme
Court appeal is set for argument 11 Jan 2027, so this may change [C3][C4][C5]. **Canada**: no special rule; in-app
links to web checkout are not allowed on iOS [C17][C18]. **EU**: alternative payments allowed; new Apple terms with a
5% Core Technology Commission since 1 Oct 2026 [C9]. **Japan**: lower Apple rates and link-outs since Dec 2025.
**South Korea**: third-party payments in a Korea-only build, at 26% (more than 15%) [C29][C42][C43].

**But conversion matters more than fees:** in RevenueCat's US test, web-only checkout turned 39.1% of paywall taps
into trials versus 65.6% in-app, and earned about 6% *less* overall [C27]. **Recommendation:** in-app purchase in
the apps (via RevenueCat), plus a web checkout for players who come through the website.

### 5.3 Running cost per conversation (does mobile change it?)

From our own measurement (`docs/prd/cost-notes.md`, opening + 8 turns, after the Nov 15 cuts) and its rate card:

| Part | Units | Price | Cost |
| --- | --- | --- | --- |
| ElevenLabs TTS (`eleven_v3`) | 698 characters | US$0.08 / 1k chars | **~US$0.056** |
| ElevenLabs Scribe STT | 36 s | US$0.20 / hour | **~US$0.002** |
| Claude | 8 calls, 11,111 input (9,280 cached) + 766 output tokens | price for `claude-opus-5-5` not in our notes: **UNVERIFIED** | ? |

So **moving STT onto the phone saves about US$0.002 per conversation** (pocket change), and pitch analysis is
already free on the device. What does move cost: (1) ship pre-recorded otter lines in offline lesson packs (the
scripted Mumbai quest already uses zero runtime TTS); (2) switch live replies to a cheaper voice model (Flash/Turbo
at US$0.04/1k chars halves TTS); (3) price Claude properly. The PRD's older estimate of US$0.25-0.55 per conversation
is an **ASSUMPTION** that the new measurements have not confirmed.

---

## 6. Recommended path and timeline

Team: three founders directing AI coders. Durations are **ASSUMPTIONS** from tonight's spike, not measured.

| Phase | When | What | Done when |
| --- | --- | --- | --- |
| **0. Fix phone basics (web)** | Week 1-2 | Pause the render loop when hidden or backgrounded; lazy-load the 4 big GLBs; compress models (Draco/Meshopt) and bundle fonts; add `API_BASE` setting + CORS on `/api/*`; ElevenLabs "improve models" off; AI/voice consent screen | Plays 10 minutes on a mid-range Android and an iPhone without heat or reload |
| **1. PWA** | Week 2-3 | Manifest, icons, service worker for offline shell; "Add to Home Screen" hint; web push on Android | Installable on both; Lighthouse PWA checks pass |
| **2. Android app (Capacitor)** | Week 3-6 | Finish `mobile-spike/` into a real app: haptics, push (FCM), audio-session plugin, splash/icons, Play internal test then closed test | On Play internal track; mic + scoring work on 3 real phones |
| **3. iOS app (Capacitor)** | Week 5-9 | Same on iOS via cloud Mac or Mac mini; `NSMicrophoneUsageDescription`; TestFlight; App Privacy label; submit | Approved on the App Store (4.2 risk retired) |
| **4. Subscriptions + widget** | Week 8-12 | RevenueCat + Apple/Google billing; web checkout; streak widget (small Swift/Kotlin) | First paid subscribers |
| **5. Native where measured** | Later | On-device STT for captions/offline, native audio, or a deeper rewrite only if phase 2-3 show the WebView is the bottleneck | A metric says so |

---

## 7. Risks and cheap tests

| # | Risk | How likely / how bad | Cheap test (cost) |
| --- | --- | --- | --- |
| 1 | Apple rejects the wrapper under 4.2 | Medium / high | Submit a TestFlight build with haptics + push early in phase 3; read reviewer notes (US$99, 1 week) |
| 2 | iPhone re-asks mic every launch in PWA | Known bug / medium | Add to Home Screen on an iPhone, relaunch 3 times (free, 10 min) [B1] |
| 3 | WebGL too slow or reloads on cheap phones | Medium / high | Run the current site on a Galaxy A16 + Firebase Test Lab free runs; watch FPS and memory (CA$215 or free) [B48][B50] |
| 4 | Silent switch mutes the otter on iPhone | Known / medium | Flip the switch and play (free) [B6] |
| 5 | Bluetooth earbuds wreck pitch scoring | Likely / medium | Play with AirPods vs phone mic and compare scores (free) [B10] |
| 6 | Two mic streams at once fail on some phones | Unknown / high | Record on 3 phones while the live graph runs |
| 7 | Relative `api/` calls fail inside the app | Confirmed tonight / high | Verified in the Android spike (section 8). Fix with `API_BASE` + CORS |
| 8 | Per-IP rate limits block players on mobile networks | Likely / medium | Play 5 phones on the same carrier hotspot |
| 9 | Voice privacy complaint or BIPA claim | Low if no voiceprints / very high | Lawyer review of the consent screen and policy (one hour) |
| 10 | Teen age-verification laws | Medium / medium | Read Apple Declared Age Range docs; decide 13+ posture [D-S24] |
| 11 | Google 12-tester rule delays launch | Certain for personal accounts | Open the Play account as an organization [A50] |
| 12 | AI cost grows with players | Medium / high | Add a per-user daily cap and a dollar meter before launch |
| 13 | Apple US link-out rule changes after Jan 2027 | Medium / low | Keep IAP as the default in iOS; don't depend on link-outs [C4] |

### 7.4 Decisions for the founders

1. Approve the path: web fixes + PWA now, Capacitor apps next, no rewrite.
2. Open Apple and Google accounts **as a company** (D-U-N-S, ~5 business days) [A47][A50].
3. 13+ only, no Kids category.
4. iPhone and Android together, or Android first (cheaper, no Mac, faster review). I suggest **Android first** for
   the first test build, both stores for launch.
5. Mac mini (~US$599) or cloud builds (US$0-19/month). I suggest cloud first.
6. In-app purchase plus web checkout (recommended), or web checkout only.

---

## 8. What I built and checked tonight: `mobile-spike/`

See [`mobile-spike/README.md`](../../../mobile-spike/README.md). In short:

- A separate Capacitor 8.6.2 project wraps the existing `dist/` build without touching `src/`, with
  `RECORD_AUDIO` / `MODIFY_AUDIO_SETTINGS` permissions. **Android debug APK built: 14.7 MB.**
- **Verified on an Android 16 emulator (API 36):** the app launches and shows the title screen; all models
  and sounds load from inside the app; a WebGL canvas is created; the page's mic request raised the
  **native Android permission prompt** and, once allowed, recorded `audio/webm;codecs=opus`; Web Audio runs.
  Capacitor's bridge does the mic hand-off by itself (`BridgeWebChromeClient.java`, lines 101-124) [B52].
- **Found: the AI conversation cannot work yet inside the app.** `fetch('api/otter')` goes to the app's own
  file server (returns the HTML page), and calling `https://sound-local.vercel.app/api/otter` directly is
  blocked by CORS (preflight returns 405, no `Access-Control-Allow-Origin`). Fix: an `API_BASE` setting and
  CORS headers for `https://localhost` and `capacitor://localhost` (phase 0).
- **Not verified:** frame rate, heat and battery (the emulator has no GPU, so it was far too slow to judge),
  a full spoken conversation, and anything on iOS. These need a real phone.
- Build gotcha: Maven Central rate-limited the build VM (HTTP 429); a Google mirror fixed it (README).
- iOS cannot be built on Linux; it needs macOS + Xcode 26+, an Apple Developer account for device signing, and
  `NSMicrophoneUsageDescription` [A21][A24].

---

## Sources

All read 2026-11-15. Full lists (about 350 links) are in the research notes; the key ones:

1. [A1] WebKit, Web Push for Web Apps on iOS and iPadOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
2. [A19] Chrome Developers, Trusted Web Activity: https://developer.chrome.com/docs/android/trusted-web-activity
3. [A21] Ionic, Announcing Capacitor 8: https://ionic.io/blog/announcing-capacitor-8
4. [A31] react-three-fiber issue 3517: https://github.com/pmndrs/react-three-fiber/issues/3517
5. [A36] Unity cancels the Runtime Fee: https://unity.com/blog/unity-is-canceling-the-runtime-fee
6. [A39] Godot licence: https://godotengine.org/license/
7. [A41] Apple App Review Guidelines (4.2, 2.5.2, 5.1.2): https://developer.apple.com/app-store/review/guidelines/
8. [A47] Apple Developer Program enrolment: https://developer.apple.com/programs/enroll/
9. [A50] Google Play testing requirements for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
10. [A54] Google Play app size limits: https://support.google.com/googleplay/android-developer/answer/9859372
11. [A61] Apple maximum build file sizes: https://developer.apple.com/help/app-store-connect/reference/app-uploads/maximum-build-file-sizes/
12. [B1] WebKit bug 327237, Home Screen web apps re-ask for mic: https://bugs.webkit.org/show_bug.cgi?id=327237
13. [B3] WebKit, MediaRecorder API: https://webkit.org/blog/11353/mediarecorder-api/
14. [B6] WebKit bug 237322, Web Audio muted by ringer switch: https://bugs.webkit.org/show_bug.cgi?id=237322
15. [B12] Apple, WKUIDelegate media capture permission: https://developer.apple.com/documentation/webkit/wkuidelegate
16. [B18] Apple SFSpeechRecognizer: https://developer.apple.com/documentation/speech/sfspeechrecognizer
17. [B20] Android SpeechRecognizer: https://developer.android.com/reference/android/speech/SpeechRecognizer
18. [B44] New in Chrome 139 (on-device Web Speech): https://developer.chrome.com/blog/new-in-chrome-139
19. [B48] WebKit bug 300782, reload loop under WebGL memory pressure: https://bugs.webkit.org/show_bug.cgi?id=300782
20. [B52] Capacitor BridgeWebChromeClient.java: https://github.com/ionic-team/capacitor/blob/main/android/capacitor/src/main/java/com/getcapacitor/BridgeWebChromeClient.java
21. [C1] Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
22. [C4] US Supreme Court docket 25-1311 (Apple v. Epic): https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html
23. [C8] Google Play service fees: https://support.google.com/paymentscenter/answer/112622?hl=en
24. [C9] Apple, apps in the EU: https://developer.apple.com/support/apps-in-the-eu
25. [C27] RevenueCat, IAP vs web purchases test: https://www.revenuecat.com/blog/growth/iap-vs-web-purchases-conversion-test
26. [C33] Expo pricing: https://expo.dev/pricing
27. [C47] Yancey & Settles, Duolingo notifications (KDD 2020): https://research.duolingo.com/papers/yancey.kdd20.pdf
28. [D-S26] Apple, Updated App Review Guidelines (13 Nov 2025): see note D, source 32
29. [D-S20] SCOTUSblog on Texas SB 2420 (6 Jul 2026): see note D, source 23
30. [E8] Duolingo, Android app to 100% Kotlin: https://blog.duolingo.com/migrating-duolingos-android-app-to-100-kotlin/
31. [E12] TopDev, ELSA from native to Flutter: https://topdev.vn/blog/hanh-trinh-chuyen-doi-cua-elsa-tu-native-sang-flutter/
32. [E42] Duolingo, widget feature: https://blog.duolingo.com/widget-feature/
