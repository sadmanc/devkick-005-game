# Sound Local — current technical inventory

Snapshot: branch `sadman/mobile-feasibility`, HEAD `417d9512b3051fbe4dac7c7a680a196cbd7d70db`. Paths/line numbers below are relative to `/home/ubuntu/repos/devkick-005-game`. Research only; no application edits, commits, pushes, vendor calls or device/browser testing. This inventories checked-in behavior, not verified production environment settings. Exact line-numbered PRD and cost-note extracts are included below to preserve planning numbers and distinguish them from measurements.

## Executive findings

- Plain-JS ES-module Three.js/Vite browser game. Static client plus two Node/Vercel API routes; static hosting alone cannot supply STT or improvised conversations (`package.json:6-24`, `vite.config.js:3-35`, `api/otter.js:1-6`, `api/stt.js:1-6`). No native project, service worker, install manifest, durable client storage, accounts or billing in the inspected runtime surfaces.
- Speech recognition is ElevenLabs Scribe on the server; pitch/rhythm DSP runs on the browser main thread. Browser speech synthesis remains an audio fallback. Chrome SpeechRecognition code exists but is explicitly disabled, not an active fallback (`src/main.js:186-200`, `src/voice/index.js:58-60`).
- Hold-to-talk opens separate recording and live-visualization mic streams. All recording chooses the browser's default MediaRecorder format, rather than explicitly negotiating a MIME type. These are material mobile validation items, not demonstrated incompatibilities (`src/main.js:739-761`).
- A production build contains **16,460,244 bytes** of file payload (~16.46 MB decimal / 15.70 MiB), including **12,796,960 bytes of GLBs** and **2,568,176 bytes of MP3s**. These are all shipped files, not necessarily all fetched on first interaction. Browser/GPU memory, actual transfer compression, load time and mobile frame rate were not measured.
- PRD recommends web now, PWA in beta, wrapped apps at paid launch (`docs/prd/PRD.md:2258-2260`); Capacitor-first rather than native-first is proposed at `1247-1251`. Current code does not implement a PWA or offline STT.
- PRD is a draft predating overnight work: its claims of no limits/cache and its bundle/test counts are stale. Code now has per-instance rate limits, a daily AI-turn cap, optional model routing and TTS caching. The PRD's dollar assumptions are not a current bill; cost-notes explicitly measures units, not live dollars.

## 1. Browser/platform API inventory

### Microphone, recording and encoding

| API / behavior | Active call sites and precise configuration |
|---|---|
| `navigator.mediaDevices.getUserMedia` | Permission priming: `src/main.js:288-297`, `{ audio: true }`, immediately stops tracks. Lesson/test/quest/flower recording: `src/voice/index.js:18-31`, `{ audio: true }`. Free-talk recording: `src/voice/record.js:6-25`, `{ audio: true }`. Live visualizer: `src/game/liveVoice.js:128-144`, `{ audio: { echoCancellation: true } }`. No requested channel count, sample rate, noise suppression or automatic-gain option at the recording sites. Browser support gate checks MediaRecorder plus getUserMedia (`src/voice/index.js:7-9`, `src/main.js:898`). |
| `MediaRecorder` | `new MediaRecorder(stream)` without options, `start()` without timeslice, dataavailable collects blobs (`src/voice/index.js:20-30`, `src/voice/record.js:8-18`). **No explicit MIME candidates or `isTypeSupported()` checks.** Lesson blob uses `rec.mimeType`; free-talk blob uses `rec.mimeType || 'audio/webm'`. Free talk auto-stops at 15,000 ms and records 250 ms after release (`record.js:4,18-24`); lesson listen adds 300 ms release tail, no equivalent hard recording-duration cap (`index.js:110-112`). Track stop cleanup in both recorder paths. |
| Blob / binary / base64 | Blob.arrayBuffer, Uint8Array, String.fromCharCode and btoa encode upload audio (`src/voice/record.js:29-34`, `src/voice/index.js:36-47`). No FileReader, media capture upload SDK or streaming audio upload. Free-talk replies turn base64 MP3 into `data:audio/mpeg;base64,...` (`src/game/conversation.js:20-23`). |

### Web Audio, playback, autoplay

- Shared playback `AudioContext || webkitAudioContext`, lazily created and resumed when suspended (`src/game/audio.js:3-7`). Voice HTMLAudioElement → MediaElementAudioSourceNode → AnalyserNode (fftSize 512) → destination; time-domain data drives mouth amplitude (`audio.js:44-69,73-105`). Authored clips and API data URLs play with `new Audio(url)`/`play()`, canplaythrough/error/end events, 1.5 s loading and 8 s ending timeouts; failures fall through to browser TTS.
- SFX fetch/decode once into AudioBuffers, AudioBufferSourceNode → GainNode (0.7) → destination (`audio.js:108-135`). OscillatorNode triangle/sawtooth → GainNode → destination implements synth fallback and pentatonic word-collection chimes. Uses AudioParam setValueAtTime/exponentialRampToValueAtTime and scheduled start/stop (`audio.js:175-195,205-227`). No AudioWorklet, ScriptProcessor, spatial/panner or compressor nodes in inspected source.
- Background HTMLAudioElement loops: Glasgow music volume 0.3 and ambience 0.2, scaled by trust; full/under/off levels 1/0.35/0; rejected play promises log warnings (`audio.js:137-166`). Main ducks under NPC speech and turns bed off during recording (`src/main.js:94-103,741-745`).
- **Gesture unlock:** Play click invokes `unlockAudio()` then `startBed()` (`src/main.js:857-859`). Unlock creates/resumes playback context, calls speechSynthesis.getVoices and preloads SFX (`audio.js:231-235`). No silent-buffer unlock or explicit iOS-specific playback session handling; bed rejection is logged rather than automatically retried.
- OfflineAudioContext(1,1,16000), decodeAudioData and channel 0 extraction for final analysis (`src/voice/index.js:5,11-15`; `src/game/accentCheck.js:7-12`; live reference `src/game/liveVoice.js:24-45`). Analysis decoding is local; it does not imply offline speech-to-text.
- Live microphone Web Audio creates a separate AudioContext, resumes it, MediaStreamAudioSourceNode → AnalyserNode fftSize 2048, **not** destination (no audible mic monitoring), reads getFloatTimeDomainData each animation frame; closes context/stops tracks on stop (`liveVoice.js:128-195`).

### Web Speech

- Active **speech synthesis**: speechSynthesis getVoices/cancel/speak, SpeechSynthesisUtterance; prefer Fiona, then en-GB/Scotland, then English, rate 0.95/pitch 1.15, six-second completion fallback (`src/game/audio.js:18-40`). Muting cancels synthesis (`audio.js:10-14`). Actual availability and voice quality are OS/browser dependent and untested here.
- **SpeechRecognition is present but unreachable in normal code:** `Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition`, but `CAPTIONS_FROM_CHROME = false` causes `startCaptions()` to return first; an additional coarse-pointer exclusion exists. Dormant config is en-GB, interimResults true, continuous true (`src/main.js:186-219`). Neither active captions nor scoring use browser recognition.

### Graphics, timing, UI and device integration

- `THREE.WebGLRenderer({ antialias: true, alpha: false })`, pixel ratio `Math.min(window.devicePixelRatio, 2)`, full innerWidth/innerHeight canvas (`src/game/otterScene.js:15-18`). Three.js dependency ^0.187.0 (`package.json:17-20`); renderer is WebGL, not WebGPU. No explicit powerPreference, preserveDrawingBuffer, outputColorSpace or shadowMap override; shadows remain default disabled. Mesh castShadow/receiveShadow flags are not equivalent to enabled renderer shadow mapping.
- ACESFilmicToneMapping, PMREMGenerator/RoomEnvironment reflection map, environmentIntensity 0.4, Fog near 22/far 85, PerspectiveCamera FOV 40/near 0.1/far 100 (`otterScene.js:20-26,69-74`). Exposure/weather/rain vary with trust (`75-87`). Rain count 900 below width 900, otherwise 1800 (`29-30`). GLTFLoader + MeshoptDecoder street load, with procedural fallback (`139-149`); actors and both region sets are constructed at startup (`134-159`; model handling `src/game/actor.js`).
- Mumbai environment is generated geometry, not another downloaded GLB: vertex-colored parts are merged into two meshes (MeshStandardMaterial lit + MeshBasicMaterial glowing), with no additional lights (`src/game/mumbaiScene.js:15-26,125-146`). Actor GLBs load whenever cfg.model exists, normalize height/feet, and keep procedural stand-ins on failure; AnimationMixer maps clip names to moods (`src/game/actor.js:86-123`). No explicit lazy loading by selected region in those constructors.
- Resize listener changes renderer dimensions/aspect and shifts view on heights <560 using setViewOffset (`otterScene.js:186-198`). Fixed 120 Hz simulation with requestAnimationFrame rendering (`src/game/loop.js:1-39`), started unconditionally at `otterScene.js:200-213`; hiding stage via CSS (`src/ui/styles.css:174`) does not stop loop. No inspected visibilitychange/background pause integration.
- Canvas 2D live contour graph (`src/game/liveVoice.js:48-114`), DPR capped at 2 (`58-62`), requestAnimationFrame/cancelAnimationFrame and performance.now (`149-154,190-196`); SVG pitch polyline (`src/main.js:106-123`).
- DOM selection/creation, classList/dataset/style, SVG attributes, getBoundingClientRect/offsetWidth, timers, keyboard/click/change/resize/hashchange/scroll/pointer events used throughout `src/main.js:16-123,953-1037`, `src/ui/lessons.js:25-110`, `liveVoice.js:58-62,206-211`. Pointer capture supports hold-to-talk; pointerup and pointercancel release, Space keydown/up alternate (`main.js:1021-1037`). Lessons use scrollTop and Element.scrollTo smooth/auto (`lessons.js:70-104`). URLSearchParams reads quest wording query (`main.js:649`); location.hash/dev hooks at `985-1013`. No router service.
- matchMedia coarse-pointer query exists only behind disabled captions gate (`main.js:194`). CSS uses prefers-reduced-motion and short-screen responsive media queries, hover capability rules and touch-action manipulation/none (`src/ui/styles.css:14,84,101,368-383,554-574,618-637`). Settings state is memory only (`src/main.js:966-974`). Viewport disables scaling (`index.html:5`). No fullscreen request, Screen Orientation lock/read, vibration, geolocation, notifications, camera, clipboard, WebSocket/EventSource, IndexedDB, localStorage or sessionStorage usage found in inspected app source. Thus **no localStorage/IndexedDB keys**. No service-worker registration or web-app manifest/link in source/index/public, and no app installation flow. Negative findings come from full text searches plus public tree inspection, so have no positive call-site line to cite.

### Browser network / fetch inventory

| Request | Call site / payload |
|---|---|
| Relative POST `api/otter` | `src/game/conversation.js:26-40`: JSON answer audio/base64/audioType or typed said plus NPC/accent/echo, trust, turn, history; AbortController 25,000 ms. Non-2xx throws with status/retryAfter. Free-talk dispatch `src/main.js:413-434`; scripted quest optional AI wording uses same helper. |
| Relative POST `api/stt` | `src/voice/index.js:36-55`: JSON audio/base64 + audioType; seven-second abort; non-OK/network failure becomes empty transcript. |
| Reference clip URLs | `src/voice/index.js:65-69`; `src/game/accentCheck.js:14-26` (12-entry FIFO promise cache); `src/game/liveVoice.js:24-45` (in-memory promise cache). Can include static audio URLs or generated MP3 data URLs. |
| SFX MP3 fetch | `src/game/audio.js:109-120`, `assets/audio/sfx/{tap,start,good,ok,bad,level}.mp3`. |
| Implicit asset loads | Audio element playback as above; GLTFLoader loads GLBs (`otterScene.js:139-149`, `actor.js`); HTML/CSS image URLs for map/NPC portraits, module/CSS requests from Vite. All public assets use relative paths. |
| Google Fonts | HTML link/preconnect `index.html:8-9`, fonts.googleapis.com Fredoka 500/600/700, Lilita One, Luckiest Guy; stylesheet may load font binaries from Google font infrastructure. Not a JS fetch or a bundled offline font. |

## 2. Server and external-service inventory

- **Vercel functions:** `api/otter.js:1-6` and `api/stt.js:1-6` forward request/response plus process.env to shared Node adapter, STT selecting handleStt. Vite dev/preview plugin mounts identical routes server-side (`vite.config.js:3-25`) and loads env with process.env precedence. Build base './', warning limit 1500 kB, node Vitest environment (`28-36`). No app keys in browser configuration. No Modal invocation in these runtime paths despite older jam docs proposing Modal.
- **ElevenLabs TTS** server `POST https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, xi-api-key header, JSON text/model_id, entire response buffered and base64 returned, not streamed (`server/otter.js:217-225`). Default `eleven_v3`; env TTS_MODEL_LIVE may select another model and strips audio tags for non-v3 (`42-47`). Reply/echo generated in parallel (`310-324`). Missing key/voice or errors permit browser synthesis fallback (`304-327`).
- Voices (`otter.js:26-41`): otter `9wOu10b6k3SOUgwDbKKv`, Senga `U8lGdXfIYVx0Nas6m5XL`, Hamish `KnVW5icoKhKlU7DbTW8i`; VOICE_<NPC> override, Scotland fallback otter, Mumbai returns null without override (no runtime ElevenLabs voice by default). ELEVENLABS_NPC_API_KEY used for non-otter if set, otherwise ELEVENLABS_API_KEY. On voice_not_found fallback standard Senga `Xb7hH8MSUJpSbSDYk0k2`, Hamish/otter `JBFqnCBsd6RMkjVDRZzb` (`318-321`). Key gate still requires ELEVENLABS_API_KEY even with NPC key.
- **ElevenLabs STT** `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart model_id **scribe_v1** and Blob file answer.m4a if MIME includes mp4, .ogg for ogg, otherwise .webm; default MIME audio/webm. No explicit language, vocabulary or streaming option. Removes sound-event tags, normalizes whitespace and truncates transcript to 400 chars (`otter.js:51-53,227-247`). Both `/api/otter` answer-audio flow (`276-283`) and `/api/stt` (`385-392`) use this. Not on-device and not browser Web Speech.
- **Anthropic Claude** SDK @anthropic-ai/sdk ^1.8.0 (`package.json:17-20`), default model **claude-opus-5-5**, OTTER_MODEL override; OTTER_MODEL_FAST (defaults main) for opening, quest or <=4-word non-echo answers (`otter.js:11-25`). `client.beta.messages.create` with max_tokens **350**, beta `server-side-fallback-2026-07-01`, fallbacks 'default', low effort, JSON-schema output, one ephemeral-cache system text, one user message (`197-207`). Explicit baseURL is not set; SDK resolves vendor transport, not a browser Anthropic fetch. ANTHROPIC_API_KEY used server-side; missing key constructs default SDK client, which may use local authentication (`285-287`), not proof deploy works without key.
- **Prompt sizing:** actual dynamic prompt is character+regional rules plus current utterance/trust/ears/last **8 history lines** (`otter.js:132-141,197-206`; `server/otter-prompt.js:50-153`). Reply asked ~110 chars, capped/fitted at 160 (`otter.js:16,213`; `cost.js:25-34`); schema includes mood/action/trust delta/hint/echo/suggestions (`otter-prompt.js:7-48`). No single constant full prompt token count. Offline measurement from exported functions (JS string lengths; estimated tokens ceil((system+JSON schema chars)/4), excluding variable user turn):

| NPC | system chars | schema chars | estimated fixed input tokens |
|---|---:|---:|---:|
| otter | 3109 | 1528 | 1160 |
| senga | 3699 | 1528 | 1307 |
| hamish | 3769 | 1528 | 1325 |
| mor | 3857 | 1582 | 1360 |
| kaju | 3308 | 1582 | 1223 |
| mangesh | 3221 | 1582 | 1201 |

Kaju/Mangesh prompts existing does not imply normal scripted quests invoke Claude. Empty heard input returns authored reply without LLM/TTS, but audio transcription has already occurred (`otter.js:276-283`); client authored greetings skip opening vendor calls (`src/main.js:406`, `docs/prd/cost-notes.md:41`).

### Caching, guards and usage accounting

- `server/ttsCache.js:4-43`: default 100-entry in-memory LRU; key voice ID + NUL + exact text. Stores successful audio only; no pending-request deduplication or persistence. Server maintains one cache per TTS model (`otter.js:256-261`), reports cumulative hits/misses. API key is not part of cache key. No Redis/KV, disk or CDN cache implementation here.
- `server/limits.js:5-29`: per-IP 20/min sliding timestamps and 300/day UTC counter, max 50,000 keys (oldest eviction); separate limiter per route/handler (`otter.js:55-58,358-362`). Client IP first x-forwarded-for hop, then x-real-ip, socket, unknown (`limits.js:60-65`). Rate denial 429 with Retry-After and scope. Adapter POST only (405), raw streamed request body cap 2,050,000 bytes (`otter.js:51-53,351-381`); audio base64 max 2,000,000 chars and request schema validation (`89-109`, STT `387-392`).
- Daily cap defaults **2000**, env MAX_AI_TURNS_PER_DAY (nonnegative parsed integer), all players per instance UTC day (`limits.js:32-58`). Applies to handleOtter, not handleStt, before audio transcription/empty-input handling; counts even requests that subsequently fail or have no speech (`otter.js:268-283`). Once capped, authored return and no vendor calls in that otter request. It is **not** a shared/global deployment spending hard stop and not user authentication/quotas. Cold starts/multiple instances reset/multiply guards and cache; limits.js:3 and cost-notes:81-82 explicitly require shared store before real traffic.
- `server/cost.js:1-19`: unit accounting, not billing. Approx 4 chars/token (±20% comment), STT estimated from base64 bytes/4000 bytes/sec rounded 0.1 sec, TTS counts supplied string lengths. `server/otter.js:395-410` logs `[otter] turn usage` with NPC/model, input/cached/output tokens, TTS chars, STT seconds, cache stats; uses actual Anthropic usage when present. Cached-system estimate assumes cached when actual usage absent. No raw text/audio/keys in this usage log. TTS chars are requested text, not net billed chars after cache hit/failure; `/api/stt` has no corresponding usage log, and early authored returns skip it. No dollar totals, persisted usage ledger or deployed budget alarm found.

## 3. Pitch, scoring and gameplay dataflow

- `src/voice/pitch.js` pure JS runs client-side, no server pitch upload/processing. Samples decoded mono 16 kHz; YIN pitch range 70–500 Hz, threshold 0.15 with parabolic interpolation, 10 ms hop, roughly two periods of 70 Hz per frame (`1-48`). RMS voicing gate max(0.002, 10% peak). Convert voiced frames to semitones around individual median, fold octave jumps >9 semitones, clamp ±12 (`51-60`). Need >=10 voiced frames per clip; interpolate to 60 points (`63-69,97-103`).
- Asymmetric DTW allows local 0–2x progression, mean absolute semitone distance (`72-83`). Divide distance by reference mean absolute semitone magnitude floored at 1; linear score 1 at <=0.5 and 0 at >=1.1. Loudness envelopes trimmed first-to-last >10% peak, normalized, resampled to 60; mean error 0.15→1, 0.45→0. Accent = **0.7 melody + 0.3 rhythm** (`86-110`). This measures prosody, **not phoneme/vowel accuracy or nationality**; tuning comment says TTS + one reference MP3, retune on real players (`96`).
- `src/voice/match.js:1-36`: normalize case/punctuation/spacing, Levenshtein normalized by longest string; best accepted transcript is wordScore; absent transcript scores 0. Final lesson score **0.5 wordScore + 0.5 accentScore**, words only when accent null (`src/voice/index.js:89-97`). Missing/bad reference/decoder/no mic/too little voice yield null accent/pitch; blob <1500 bytes returns no-audio/zero (`64-108`); analysis timeout 2.5 s.
- Placement bands good >=0.70, ok >=0.40; trust delta round((score−0.35)×60); levels Tourist/Visitor/Neighbour/Local at 0/0.35/0.60/0.80 (`src/game/placement.js:1-21` consumes thresholds from content; exact PRD table `1575-1596` below). UI skips 50 placeholder lessons if average >=0.6 (`src/main.js:56-81`).
- Free talk measures current recording against NPC last line (potentially different words) and pending echo locally via measureAccent (`main.js:420-434`, `accentCheck.js:29-41`). This completes before POST dispatch; timeout max 2.5 s, even though no streaming is used. Sends base64 recording and numeric results; server transcribes, gives text and ears verdict to Claude, applies model trust delta plus deterministic accent delta. Echo words fuzzy-match >=0.67; echo score words-only if no echoAccent, else equal weights. Normal accent trust **±6**, echo **±15** (`server/otter.js:121-164,289-300`). AI can change trust ±30 (`otter-prompt.js:11`). Trust clamps 0–100, win at 100, bust at 0, otherwise ends after 8 turns (`otter.js:249-253`). These numbers are client-supplied state, not authoritative persisted progress.
- Live graph is feedback only, not final score: RMS gate 0.012, analyze every other render frame on downsampled signal; reference ±8 frame window and <2.5-semitone tolerance produces running Match % (`liveVoice.js:152-183`).
- UI/main owns screens/modes/in-memory progress (`src/main.js:47-59,126-139`), quest/flower state machines are client code (`src/game/quest.js`, `flowers.js`). Lesson UI is placeholder 8×10 nodes, not shipped curriculum (`src/ui/lessons.js:1-14`). Regions include Scotland and Mumbai preview, unlike Glasgow-only older PRD description. No durable user database in inspected server/api.

## 4. Build verification and shipped sizes

The shell initially lacked npm (`bash: line 1: npm: command not found`). Diagnosed environment once: installed Node is `/home/ubuntu/.nvm/versions/node/v24.22.2`; loaded `/home/ubuntu/.nvm/nvm.sh` and `nvm use 24`, then ran requested `npm ci && npm run check` exactly once successfully. No config changes. Repo `git pull --rebase` was attempted per repo instructions but could not proceed: `There is no tracking information for the current branch.` Did not choose a different upstream or rebase this intentionally based branch.

```text
Now using node v24.22.2 (npm v10.8.3)
added 45 packages, and audited 46 packages in 2s
found 0 vulnerabilities
> devkick-005-game@0.1.0 check
> vitest run && vite build
 Test Files  16 passed (16)
      Tests  115 passed (115)
vite v8.3.8 building client environment for production...
assets/images/world-map.webp referenced in assets/images/world-map.webp didn't resolve at build time, it will remain unchanged to be resolved at runtime
✓ 41 modules transformed.
dist/index.html                   9.62 kB │ gzip:   2.98 kB
dist/assets/index-BqoPgROp.css   34.00 kB │ gzip:   8.50 kB
dist/assets/index-dhnb4lJ0.js   763.55 kB │ gzip: 202.01 kB
✓ built in 298ms
```

One JS bundle, exact size **763,558 bytes**; CSS **34,002 bytes**. Runtime map warning does not fail build; `public/assets/images/world-map.webp` exists and is copied, but browser resolution was not exercised. No mobile/browser/console or live vendor validation requested/performed; successful build is not evidence of that.

Sizes measured by summing regular-file stat sizes (not disk block allocation; decimal bytes). `du -sb` includes directory overhead and reports 16,497,108 dist / 15,689,924 public / 24,684 assets, so use payload sums for downloads:

| Tree | File payload bytes |
|---|---:|
| dist/ | 16,460,244 |
| public/ | 15,653,060 |
| assets/ (manifest, not public asset tree) | 20,588 |
| public/assets/models/ | 12,796,960 |
| public/assets/audio/ (31 MP3 files) | 2,568,176 |

| GLB shipped path | bytes |
|---|---:|
| public/assets/models/glasgow.glb | 2,154,076 |
| public/assets/models/otter.glb | 4,715,984 |
| public/assets/models/seagull.glb | 1,491,628 |
| public/assets/models/cow.glb | 4,435,272 |

GLB/audio files are binaries with no source line numbers; paths and exact byte counts identify them. Full audio/image size list is included in the extracted appendix.

## 5. PRD implications for mobile (draft proposals, not shipped promises)

- Target client is Three.js web/PWA plus iOS/Android wrappers, common gateway auth/rate limits/quotas; Postgres progress/users/content, object storage/CMS, Stripe plus store billing, analytics; streaming STT, server GPU phoneme scorer, on-device prosody, model routing/safety/quest engine and cached TTS (`PRD.md:1613-1667`). Sound-level scoring data target **2–10 hours** consented native speech plus **1,000+** rated attempts per region; quantized on-device later, melody/rhythm remain on device (`1690-1694`).
- Turn-latency goal **under 2.5 s**, today described as often **4–8 s**; target table total **~1.5–2.5 s** vs today **~3–8 s**, achieved by streaming STT/upload/TTS and smaller model (`1696-1712`). Not measured in this inventory.
- Native apps section specifically motivates store billing, push streak reminders and mic handling: wrap e.g. Capacitor first; native only if performance requires (`1247-1251`). Q17 recommends web→PWA→wrapped paid launch (`2258-2260`). No wrapper/PWA work already implemented in these runtime directories. Offline drills are a Pro proposal (`1907`), not offline conversation support.
- Pricing exact proposal: Free **$0**, **3 quests a day**, **1 free-talk conversation a day**; Party Pass **$2.99 / week**, **7 days**, up to **8 players**; Pro **$9.99 / month** or **$59.99 / year**, e.g. **300 AI turns/month**; Actor **$24.99 / month** or **Production Pass $39 for 8 weeks**; schools **~$5–10 per student per month** or **~$300–1,000 per class per year**; regional **~₹199–299/month**. All are labeled ASSUMPTION (`1901-1910`). Annual default and **7-day** trial (`1914-1915`). Store billing exists only in target specs (`1230-1234`), no current SDK.
- PRD economics explicitly ASSUMPTIONS: STT **~$0.001**/turn, LLM **~$0.01–0.03**, TTS **~$0.016–0.05**, compute **< $0.001**; total **~$0.03–0.08**/turn and **~$0.25–0.55** per 8-turn conversation (`1800-1815`). These predate cost-note reductions. Pro light/typical/heavy monthly AI cost **~$2.50–5.50 / ~$7.50–16.50 / ~$22–50**; store proceeds example **~$7 after store fees** on $9.99; cannot promise unlimited paid AI (`1821-1829`). Target conversation cost **≤ $0.05** (`1831`). Section 19 free-tier recommendation **1 free quest per day** conflicts with pricing section's **3 quests a day** (`1843-1844` vs `1905`); unresolved, not normalized away here.
- Unit targets: blended paying revenue **~$45–55 / year**, paid AI **≤ $1 / month**, free AI **≤ $0.15 / month**, CAC **≤ $15**, LTV **≥ $80** (`1923-1935`, exact excerpt below). Mobile fees and speech costs must fit these targets, not just render a screen.
- Open questions include in-house/license phoneme scoring Q14, model routing Q15, recorded reference plus designed improvised voices Q16, platform Q17, no-default/under-18-no audio training storage Q18 (`2240-2265`). Product and business Qs are preserved verbatim below, including audiences, content order, native review, safety, pricing and age. Proposed 13+ with stricter teen 13–17 mode is not a shipped compliance system (`2280-2283`).
- AI/data targets: native-rater correlation **≥ 0.7**, **≥ 90%** native Local and robot Tourist, repeat **±10 points**, group difference <=5 points; opt-in data flywheel, **100** golden turns per character (`1751-1794`). Privacy proposed process/discard/no retention, minors consent and notice (`2479-2493`). No live vendor-retention settings checked.

## 6. cost-notes numbers (units exactly as written, not invented dollar totals)

`docs/prd/cost-notes.md:3` explicitly says **“Units only (tokens, TTS characters, STT seconds). Prices change; multiply by today's rate card.”** It does **not** give an all-in current dollar cost per conversation broken down by service. The exact source is reproduced below. Its measured scenario is opening + 8 turns, each 4.5 s answer, say-it-back every third turn; no network calls, estimated tokens ~4 chars/token +/-20% (`5-19`).

| Component per conversation | Before | After | source lines |
|---|---:|---:|---|
| LLM calls | 9 (8 + 1 AI opening) | 8 | 25 |
| LLM input tokens total | 12,689 | 11,111 | 26 |
| LLM cached system + schema tokens | 10,440 | 9,280 | 27 |
| LLM input not cached | 2,249 | 1,831 | 28 |
| LLM output tokens typical | 969 | 766 | 29 |
| LLM output worst case per call | 2,000 cap | 350 cap | 30 |
| ElevenLabs TTS characters | 1,196 | 698 | 31 |
| STT seconds | 36 | 36 | 32 |

Scripted Mumbai: **“0 Anthropic, 0 runtime TTS”**, only STT (`33`). Per-turn averages **“TTS 150 → 87 characters, non-cached input 281 → 229 tokens, output 121 → 96 tokens.”** (`35`). Rate card as written: **“v3 $0.08, v3 Conversational $0.04, Flash / Turbo $0.04 per 1K characters; Scribe STT $0.20 per hour”**, checked **2026-11-15** (`60-61`). Switch row **“$0.08 → $0.04 per 1K characters”** (-50%) (`56`). No Claude dollar rate supplied; therefore no exact LLM-dollar or total-dollar conversation figure can be quoted from this file. Actual cache hits/output lengths are explicitly not measured live (`18-19`).

## Evidence, limitations and reproducibility

- Read required jam docs, requested PRD sections, cost-notes, all voice sources/README, server/api, main/UI and Three.js scene/actor/loop/audio/live paths; enumerated all public/assets binaries. Issues #4/#1/#2/#3 read for lane context. No source lane edits or shared-contract changes.
- Build generated ignored dist/node_modules only; `git status --short` was empty after the build. No commit/push. Pull failed due missing upstream; snapshot above did not move.
- No browser rendering, touch-device/iOS/Android behavior, microphone permission/recording MIME support, console errors, autoplay success, hosted route configuration, actual vendor model availability, live spend or production cache-hit behavior checked. Negative API findings refer to inspected first-party code, not every possible internal browser/Three.js implementation API.
- Binary sizes have paths, not line numbers. API absence has search scope, not fictitious line citations. Exact source appendices below preserve draft facts that differ from current code rather than silently treating the PRD as as-built truth.


## Appendix A — exact line-numbered PRD excerpts

Source: `docs/prd/PRD.md` (draft, not runtime verification).

### PRD lines 55–135

```text
55: ## 1. Executive summary
56: 
57: **One line:** *Sound Local* is a voice-first game where you travel the world and learn how English is really
58: spoken in each place (the accent, the melody and the everyday slang) by **talking out loud to local
59: characters who react to how you sound.**
60: 
61: **The problem.** People who want to *do* an accent (actors, comedians, voice actors, content creators,
62: curious teenagers, people moving abroad) have poor options. Dialect coaches are expensive and scarce. YouTube
63: tutorials give no feedback. Language apps like Duolingo teach *other languages* in a formal register, and
64: pronunciation apps like ELSA Speak or BoldVoice go the other way: they help non-native speakers sound like a
65: "standard" American. **Nobody teaches native English speakers to sound like other English speakers, and makes
66: it fun.**
67: 
68: **The product.** You land on a world map, pick a place (Glasgow is built), and a local character stops you:
69: *"Ye're no fae roon here, are ye? Prove it."* You hold a button and talk. The game:
70: 
71: - hears your words (ElevenLabs Scribe speech-to-text),
72: - measures how your **voice melody and rhythm** compare with a real local voice (pitch tracking plus
73:   time-warped comparison, running in the browser),
74: - has an AI character (Claude) decide, in character, whether you sound like you belong, then answer in a
75:   **real-sounding local voice** (ElevenLabs),
76: - moves a **trust meter**, gives one coaching tip, and shows your pitch line next to the local's.
77: 
78: Win the trust of every local on the street and you're a "Local Legend".
79: 
80: **The shape of the product (decided):** a 2-minute placement test, then a **short fundamentals on-ramp**
81: (5–8 lessons on tonality and grammar/slang patterns), then **quests and open speech as the core**:
82: goal-driven conversations like ordering at the chippy or getting on the bus. When a quest shows a weakness,
83: a 60-second drill fixes it and sends you back in. Casual players can go quest-first.
84: 
85: **Unique selling point:** *Same language, different voice.* We are the only product built for **English
86: speakers learning other Englishes** (accents, dialects, slang), taught through **conversation with characters
87: who judge you by ear**, not by reading flashcards.
88: 
89: **Who it's for (first):** actors and drama students, comedians and impressionists, voice actors and content
90: creators, and teenagers and young adults who want a party trick. Later: expats and travellers, and English
91: learners who want to understand real regional English.
92: 
93: **How it makes money:** a freemium subscription (Duolingo model). Free gives you placement tests,
94: fundamentals, **3 quests a day** and 1 free-talk conversation. **Pro** (about $59.99/year or $9.99/month,
95: **ASSUMPTION**) unlocks every region, unlimited quests, detailed feedback and fair-use free talk. **Passes**
96: catch the moments a subscription doesn't fit: a $2.99 weekly **Party Pass** and a $39 8-week **Production
97: Pass** for actors. Later: an Actor tier, school and coach seats, a creator marketplace with revenue share for
98: native speakers, and licensed impression packs (section 20).
99: 
100: **How it grows:** short funny clips of players being judged by local characters, and **local creators
101: rating tourists** (duets), share cards and accent-offs, region launches as local-press events, organic first
102: and paid only to boost what already works (section 21).
103: 
104: **Audience simulation:** a 30-persona synthetic simulation of three launch framings (section 21.9,
105: `docs/prd/sim/REPORT.md`) found that stereotype framing ("master the Indian and Chinese accent!") spreads
106: fastest in round 1, then collapses into backlash (19 of 30 negative). Respect framing ended 21 of 30
107: positive with no backlash. These are AI personas, not people; real tests are planned (21.10).
108: 
109: **The critical number:** an AI conversation costs real money (speech-to-text, an LLM and text-to-speech on
110: every turn). Section 19 estimates **$0.25 to $0.55 per 8-turn conversation** with today's stack
111: (**ASSUMPTION**, check against current price sheets). Unlimited conversations at $9.99/month don't work
112: until that cost drops about 5 to 10 times. That cost curve is the most important technical-business problem
113: to solve.
114: 
115: **The biggest risk:** respect. Accent comedy slides into racist mockery quickly, especially for non-white
116: accents. Section 9 sets a **Respect Charter** (native speakers author and voice everything, locals are the
117: experts, the player is the one being tested, no caricature). Section 10 recommends **Indian English** next
118: and reframing "Chinese accent" as **Singapore and Hong Kong English** (Singlish is one of the most
119: slang-rich, best-loved Englishes there is).
120: 
121: **Where we are:** a working, deployed-ready web game (Three.js + Vite) built in one day by three people with
122: heavy use of AI agents: 30 merged PRs, 55 passing tests, a 3D Glasgow street, three AI characters with their
123: own designed Glaswegian voices, a 3-line accent placement test, free-talk conversations, a scripted
124: flower-stall scene and a placeholder lesson path. Next milestone: the **Chroma Awards** entry
125: (deadline 7 Jan 2027).
126: 
127: ---
128: 
129: ## 2. The idea in the founders' words, tidied
130: 
131: This section keeps the founders' original intent, including parts that changed, so the history is clear.
132: 
133: ### 2.1 The original pitch (jam morning)
134: 
135: - A mix of an **accent coach** and a **fun, game-like way to learn slang and accents**.
```

### PRD lines 160–260

```text
160:   *"It's a braw day"* = it's a lovely day, *"Ah dinnae ken whit ye're oan aboot"* = I don't know what you're on
161:   about), with **tips** and a **pitch graph** showing how your voice should rise and fall. It ends with a
162:   verdict, for example *"Get in! Good job, mate! Ye could be ma neighbour!"*
163: - Then **"Start learning"**: lessons are **set by how good your accent already is**.
164: - **Lessons are scenario-based**, starting with **fundamentals**: one lesson per core feature of the accent
165:   (the notes give a made-up example, "in this accent L becomes R"; see section 10.3 for why that one is a
166:   bad example), drilled with many words and **tongue twisters**, with feedback and retries.
167: - After the fundamentals: **quests and story modes**. Example: you work in a restaurant and take an order
168:   in the local accent.
169: - The current **free-talk playground** has a word tray ("0 / 12") of local words you must **work into the
170:   conversation naturally**; if you drop them in randomly the character calls you out.
171: - **USP:** for **English speakers** learning **different ways to speak English**. Not a new language: new
172:   tonality, melody and slang.
173: - **Audience:** comedians improving their act, actors who need an accent for a role, teenagers having fun
174:   (a party trick).
175: - **Expansion:** more countries and dialects; **celebrity impressions** (for example "speak like a famous
176:   politician") as part of the same umbrella: English speakers learning other ways to speak English.
177: 
178: ---
179: 
180: ## 3. What exists today (the as-built product)
181: 
182: Everything here is checked against the code at commit `e158f12` (PR #30), 14 Nov 2026.
183: 
184: ### 3.1 The player's journey, screen by screen
185: 
186: ```mermaid
187: flowchart TD
188:     T["Title: Sound Local<br/>Play / Settings / Credits"] --> M["World map<br/>only Scotland is live"]
189:     M --> I["Intro over the 3D Glasgow street<br/>'You just moved here.'"]
190:     I -->|"main button"| P["Prove You're Local<br/>3-line accent test"]
191:     I -->|"Talk to the otter"| C["Street: who are ye talkin' tae?<br/>pick a character"]
192:     I -->|"Sell flowers to Morag"| F["Flower stall<br/>scripted branching scene"]
193:     C --> O["Free talk: Devin Otter"]
194:     C --> S["Free talk: Senga the seagull<br/>order at the chippy"]
195:     C --> H["Free talk: Big Hamish<br/>get on the bus"]
196:     P --> R["Result: score /100<br/>Tourist, Visitor, Neighbour, Local"]
197:     O --> R
198:     S --> R
199:     H --> R
200:     F --> R
201:     R -->|"Start learning"| L["Lesson path<br/>8 units x 10 lessons<br/>placeholders only"]
202:     R -->|"Talk to someone else"| C
203:     R -->|"World map"| M
204: ```
205: 
206: | # | Screen | What happens | Screenshot |
207: | --- | --- | --- | --- |
208: | 1 | **Title** | Wood and parchment sign, "Travel the world. Learn how people really talk. Convince the locals." Play, Settings (sound, reduce motion), Credits. | `img/01-title.png` |
209: | 2 | **World map** | Illustrated world map; only **Scotland** is a live pin; "More places coming soon". | `img/02-world-map.png` |
210: | 3 | **Intro** | Over the live 3D street: "You just moved here. Glaswegians can spot a tourist a mile off." Three choices. | `img/03-intro.png` |
211: | 4 | **Prove You're Local** (placement test) | The otter says a line, you say it back, you're scored on words and melody, trust moves, you get a tip. 3 lines, easy to hard. | `img/06-prove-youre-local.png` |
212: | 5 | **Street / cast picker** | "Who are ye talkin' tae?" Three locals, each with a goal. | `img/04-street-cast.png` |
213: | 6 | **Free talk** | Say anything for up to 8 turns. AI character replies in voice, trust meter, Scots word tray (0/12), "Try saying" suggestions, "say it back" challenges. | `img/05-free-talk-otter.png` |
214: | 7 | **Flower stall** | Scripted (no AI) branching scene: sell heather to Morag using given facts, in local words. | (no screenshot) |
215: | 8 | **Result** | Score counts up to /100, level name, the character's voiced celebration over a music sting. | `img/07-result.png` |
216: | 9 | **Lesson path** | Duolingo-style zigzag path, 8 units of 10 lessons, chests and trophies. **Lessons don't open yet.** | `img/08-lesson-path.png` |
217: 
218: ![Title screen](img/01-title.png)
219: 
220: ![World map: Scotland is the only live place](img/02-world-map.png)
221: 
222: ![Intro over the 3D Glasgow street](img/03-intro.png)
223: 
224: ![Prove You're Local: the otter says a line, the pitch line shows its melody](img/06-prove-youre-local.png)
225: 
226: ![The street: three locals to win over](img/04-street-cast.png)
227: 
228: ![Free talk with the Devin Otter: Scots word tray and Try saying suggestions](img/05-free-talk-otter.png)
229: 
230: ![Result: score, level and next step](img/07-result.png)
231: 
232: ![Lesson path (placeholder)](img/08-lesson-path.png)
233: 
234: ![Phone, landscape 844x390](img/09-phone-landscape.png)
235: 
236: ### 3.2 The characters
237: 
238: | Character | Who | Goal for the player | Win | Lose | Voice |
239: | --- | --- | --- | --- | --- | --- |
240: | **The Devin Otter** ("Dev") | Warm, cheeky Glaswegian otter, Devin's (Cognition's) mascot in a tam o' shanter and kilt | Convince him you're a real Glaswegian | He accepts you and points you to the best chippy (Senga's) | "Busted! The otter spotted the tourist." | ElevenLabs Voice Design: thick working-class Glasgow accent, mid-30s, cheeky |
241: | **Senga the seagull** | Brassy herring gull in her 50s, runs Senga's Chippy, nicks tourists' chips | Order like a local ("a fish supper", "a pizza crunch", "a bottle of ginger"); trap: "salt 'n' sauce" is *Edinburgh* | A free pizza crunch | "TOURIST!" She nicks your chips | Designed Glaswegian woman, 50s, raspy and fast |
242: | **Big Hamish** | Huge, deadpan Highland cow in his 60s who drives the number 9 bus | Say where you're going the local way ("the toon", "Byres Road") and thank the driver | "On ye go, son." | "Next!" Doors shut | Designed deep, slow, gruff Glaswegian man |
243: | **Morag** | Busy local at a flower stall (scripted scene, no 3D model of her own) | Sell her a bunch of heather using facts plus local words | She buys | She walks off | Browser voice / otter |
244: 
245: ![Reference art for the Scottish Devin otter, used to make the 3D model](../../art/otter-scot-smooth.png)
246: 
247: > **Important for a startup:** the Devin Otter is **Cognition's mascot**, used with the jam sponsor's
248: > blessing. A company can't build on it without a licence. Section 22 Q2 covers replacing it with our own
249: > mascot.
250: 
251: ### 3.3 Modes that exist
252: 
253: 1. **Prove You're Local (placement test).** Three fixed lines from `src/content/scotland.json`:
254:    - *Easy:* "Aye." (Yes.) Tip: short and confident, rhymes with "eye".
255:    - *Medium:* "It's a braw day." (It's a lovely day.) Tip: tap the R in "braw".
256:    - *Hard:* "Ah dinnae ken whit ye're oan aboot." (I don't know what you're on about.) Tip: "aboot", not
257:      "about"; round your lips.
258:    Each answer scores `0.5 x words + 0.5 x accent`. A bad first try gets one retry. The average places you on
259:    **Tourist (0+) / Visitor (35+) / Neighbour (60+) / Local (80+)**. A score of 60+ "skips you ahead 50
260:    lessons".
```

### PRD lines 1230–1262

```text
1230: ### F16. Subscriptions and paywall (P1)
1231: 
1232: - Stripe on web; App Store / Google Play billing in apps.
1233: - Plans in section 20. Free trial: 7 days of Pro.
1234: - Paywall moments: after the first quest win; when the free AI allowance is used; on a Pro region pin.
1235: 
1236: ### F17. Pro: role prep (P2)
1237: 
1238: - Upload or paste your **script** and pick the accent. The app finds the lines, generates the local reference
1239:   for each (Accent-Lead-approved voice), and drills you line by line with sound-level feedback.
1240: - Export a **dialect breakdown** (key sounds, IPA, your weak spots, practice log) to share with a coach or
1241:   director.
1242: 
1243: ### F18. Impressions and character voices (P2)
1244: 
1245: See 12.8. Start with archetypes; licensed impressionist packs next.
1246: 
1247: ### F19. Native apps (P1)
1248: 
1249: The web game works on phones today. For the subscription business (store billing, push reminders for
1250: streaks, better mic handling), wrap the web app (e.g. Capacitor) first; go fully native only if performance
1251: needs it.
1252: 
1253: ### F20. Cost controls (P0)
1254: 
1255: Required before any public launch, because each AI turn costs money (section 19) and the current endpoints
1256: are open to anyone:
1257: 1. **Rate limiting and auth** on `/api/otter` and `/api/stt` (today: no limits; a script could burn the
1258:    ElevenLabs and Anthropic budgets).
1259: 2. **Per-user daily AI allowance** (free: e.g. 3 conversations; Pro: fair use).
1260: 3. **Cache TTS** for repeated lines (greetings, common reactions); authored lines are pre-generated.
1261: 4. **Model routing:** a small, cheap model for most turns; the big model only for hard judgments.
1262: 5. **Budget alarms** and an automatic switch to scripted-only mode if daily spend passes a limit.
```

### PRD lines 1350–1750

```text
1350: | Reference lines | ~300 | Many exercises reuse lines |
1351: | Quests | 10–15 | **The core**: 3 difficulty tiers, replayable with variations |
1352: | Characters | 4–6 | Each with a designed voice and a 3D model |
1353: | Words and phrases | 150–250 | With meanings and mishearing patterns |
1354: | Accent Lead time | 60–120 hours | Paid; plus reviewers |
1355: 
1356: ---
1357: 
1358: ## 15. Technical architecture: today
1359: 
1360: ### 15.1 System diagram
1361: 
1362: ```mermaid
1363: flowchart LR
1364:     subgraph Browser["Player's browser (static site from Vite build)"]
1365:         UI["UI screens<br/>index.html + src/ui"]
1366:         GAME["Game shell<br/>src/main.js"]
1367:         STAGE["3D stage<br/>Three.js: street, characters, rain"]
1368:         MIC["Mic recorder<br/>MediaRecorder"]
1369:         EAR["Accent ear<br/>YIN pitch + DTW<br/>src/voice/pitch.js"]
1370:         LIVE["Live sing-along view<br/>src/game/liveVoice.js"]
1371:         AUDIO["Audio<br/>voice lines, SFX, music bed"]
1372:     end
1373:     subgraph Server["Serverless (Vercel functions / Vite dev middleware)"]
1374:         OTTER["POST /api/otter<br/>server/otter.js"]
1375:         STT["POST /api/stt"]
1376:     end
1377:     subgraph Vendors["AI vendors"]
1378:         SCRIBE["ElevenLabs Scribe<br/>speech-to-text"]
1379:         CLAUDE["Anthropic Claude<br/>character brain"]
1380:         TTS["ElevenLabs TTS eleven_v3<br/>designed local voices"]
1381:     end
1382:     STATIC["Static assets<br/>.glb models, .mp3 lines, images"]
1383:     GAME --> UI
1384:     GAME --> STAGE
1385:     GAME --> MIC
1386:     MIC --> EAR
1387:     MIC --> LIVE
1388:     GAME --> AUDIO
1389:     STATIC --> STAGE
1390:     STATIC --> AUDIO
1391:     GAME -->|"audio base64 + accent score + history"| OTTER
1392:     GAME -->|"audio base64"| STT
1393:     OTTER --> SCRIBE
1394:     STT --> SCRIBE
1395:     OTTER --> CLAUDE
1396:     OTTER --> TTS
1397:     OTTER -->|"reply, mood, action, trust, tip,<br/>suggestions, echo, mp3"| GAME
1398: ```
1399: 
1400: ### 15.2 Stack and why
1401: 
1402: | Choice | Why | Limits |
1403: | --- | --- | --- |
1404: | Plain JS + Vite | Fast to build in a day; no framework overhead | UI code is one large `main.js` (~800 lines); needs splitting into screens/components as it grows |
1405: | Three.js | 3D in any browser; good with Meshy `.glb` models | Bundle ~720 kB (189 kB gzipped); models 1.5–4.7 MB each; slow on weak phones |
1406: | Static hosting + serverless | Cheap, scales to zero, keys stay server-side | Cold starts add latency; no database yet |
1407: | ElevenLabs (STT + TTS) | Best accented voices; Scribe hears dialect words | Vendor lock-in; cost per character; voices live on personal accounts today |
1408: | Claude with JSON schema | Reliable structured output (reply, mood, action, trust, tip, suggestions, echo) | Using the biggest model for every turn is expensive and slower than needed |
1409: | In-browser pitch scoring | Free, private, instant, works offline | Measures melody and rhythm only, not individual sounds |
1410: 
1411: ### 15.3 Free-talk turn, step by step
1412: 
1413: ```mermaid
1414: sequenceDiagram
1415:     autonumber
1416:     participant P as Player
1417:     participant B as Browser
1418:     participant S as /api/otter
1419:     participant E as ElevenLabs Scribe
1420:     participant C as Claude
1421:     participant T as ElevenLabs TTS
1422:     P->>B: holds Talk and speaks
1423:     B->>B: record (MediaRecorder, max 15 s)
1424:     P->>B: releases Talk
1425:     B->>B: accent ear: compare voice with last line and echo phrase (YIN + DTW)
1426:     B->>S: audio, accent, echoAccent, echo, trust, turn, history, npc
1427:     B->>P: plays a "thinking" line to fill the wait
1428:     S->>E: transcribe
1429:     E-->>S: text
1430:     S->>S: build prompt: history, trust, what they said, "ears" line with accent verdict
1431:     S->>C: character system prompt + turn (JSON schema)
1432:     C-->>S: reply, mood, action, trust_delta, hint, echo, suggestions
1433:     S->>S: trust = clamp(trust + trust_delta + accent bonus)
1434:     par voice the reply and the echo phrase
1435:         S->>T: reply text
1436:         S->>T: echo phrase
1437:     end
1438:     T-->>S: mp3s
1439:     S-->>B: JSON + base64 mp3s + outcome
1440:     B->>P: character speaks, face and body react, trust meter, tip, suggestions
1441: ```
1442: 
1443: ### 15.4 Placement test item, step by step
1444: 
1445: ```mermaid
1446: sequenceDiagram
1447:     autonumber
1448:     participant P as Player
1449:     participant B as Browser
1450:     participant S as /api/stt
1451:     participant E as ElevenLabs Scribe
1452:     B->>P: otter says the line (pre-made mp3), text + meaning on screen
1453:     B->>B: load the reference clip and draw its melody
1454:     P->>B: holds Talk, speaks (live blue line over the amber line, Match %)
1455:     P->>B: releases Talk (300 ms tail so the last word lands)
1456:     par
1457:         B->>S: recording
1458:         S->>E: transcribe
1459:         E-->>S: text
1460:         S-->>B: text
1461:     and
1462:         B->>B: accent score vs. the reference clip
1463:     end
1464:     B->>B: score = 0.5 x words + 0.5 x accent, band good / ok / bad
1465:     B->>P: sound, trust pop, reaction line, tip, melody lines
1466:     alt bad on first try
1467:         B->>P: one more try
1468:     else
1469:         B->>P: next line, or the result
1470:     end
1471: ```
1472: 
1473: ### 15.5 Free-talk game state
1474: 
1475: ```mermaid
1476: stateDiagram-v2
1477:     [*] --> Picking: open the street
1478:     Picking --> Greeting: choose a character
1479:     Greeting --> Listening: character speaks first
1480:     Listening --> Thinking: player releases Talk
1481:     Thinking --> Reacting: server answers
1482:     Thinking --> Listening: error, "couldnae hear ye ower the rain"
1483:     Reacting --> Listening: outcome continue
1484:     Reacting --> Won: trust 100, or turns out with trust 65+
1485:     Reacting --> Busted: trust 0
1486:     Reacting --> OutOfTime: 8 turns, trust under 65
1487:     Won --> Result
1488:     Busted --> Result
1489:     OutOfTime --> Result
1490:     Result --> Picking: talk to someone else
1491:     Result --> [*]
1492: ```
1493: 
1494: ### 15.6 Repo map (what lives where)
1495: 
1496: | Path | What | Lane today |
1497: | --- | --- | --- |
1498: | `index.html` | All screens (title, map, intro, cast, test, result, lessons) | 1 |
1499: | `src/main.js` | Game flow, modes, talk button, result, wiring | 1 |
1500: | `src/game/otterScene.js`, `actor.js`, `expressions.js` | 3D stage, characters, faces | 1 |
1501: | `src/game/liveVoice.js` | Live sing-along canvas | 1 |
1502: | `src/game/audio.js` | Voice line playback, browser-voice fallback, SFX, music bed, warmth | 1/3 |
1503: | `src/game/placement.js`, `conversation.js`, `flowers.js`, `scotsWords.js`, `accentCheck.js` | Pure game rules | 1 |
1504: | `src/ui/lessons.js`, `styles.css` | Lesson path, styles | 1 |
1505: | `src/voice/` | `listen()` contract, pitch/DTW scoring, text matching, recorder | 2 |
1506: | `server/otter.js`, `server/otter-prompt.js`, `api/` | Serverless endpoints, character prompts | 2 |
1507: | `src/content/` | Region, cast and scene data | 3 |
1508: | `scripts/` | Batch voice-line generation (ElevenLabs) | 3 |
1509: | `public/assets/` | Models, audio, images | 1/3 |
1510: | `art/` | Reference images, prompts, Blender scripts | 1 |
1511: | `tests/` | 9 Vitest files, 55 tests | all |
1512: | `assets/manifest.json` | Every generated asset with its prompt | all |
1513: 
1514: ### 15.7 Known technical debt (from the code)
1515: 
1516: 1. **Open AI endpoints:** no auth, no rate limit, no budget cap on `/api/otter` and `/api/stt`.
1517: 2. **API keys and voices on personal accounts:** NPC voices live on one team member's ElevenLabs account
1518:    (`ELEVENLABS_NPC_API_KEY`); move to a company account.
1519: 3. **Scoring cut-offs tuned on TTS, not people** (`pitch.js` comment: "retune on real players").
1520: 4. **Free-talk accent compares different words** (your answer vs. the character's last line), so it's only a
1521:    rough signal; the server caps it at ±6 trust for that reason.
1522: 5. **No persistence:** progress, streak and gems are fake or lost on refresh.
1523: 6. **`main.js` is a large single file** mixing modes; split before adding lessons and quests.
1524: 7. **Large models** (otter 4.7 MB, cow 4.4 MB) above the team's own 2 MB target; compress (Draco/meshopt,
1525:    smaller textures).
1526: 8. **Chrome-only assumptions removed** (ElevenLabs is now the only speech recogniser), so speech-to-text
1527:    needs the network for every answer; there's no offline mode.
1528: 9. **No error monitoring** (Sentry or similar) and no analytics.
1529: 
1530: ---
1531: 
1532: ## 16. How the accent scoring works (today, in detail)
1533: 
1534: This is the core technology, so here's exactly how it works, in plain terms first and then the maths.
1535: 
1536: ### 16.1 In plain terms
1537: 
1538: 1. **Words.** What you said (from speech-to-text) is compared with the accepted ways of saying the line,
1539:    letter by letter. Close spellings count, because speech-to-text writes Scots words in odd ways ("aye" may
1540:    come back as "I" or "eye").
1541: 2. **Melody.** The game finds your voice's **pitch** (how high or low) every 10 milliseconds, for you and for
1542:    the local's recording. It converts both to **semitones relative to each speaker's own middle pitch**, so a
1543:    deep voice can match a high one: only the *shape* of the tune matters. Then it lines the two tunes up
1544:    even if you spoke faster or slower (**dynamic time warping**) and measures how far apart they are.
1545: 3. **Rhythm.** It compares the **loudness pattern** over time (where the syllables and stresses fall),
1546:    stretched to the same length.
1547: 4. **Accent score** = 70% melody + 30% rhythm. **Line score** = 50% words + 50% accent.
1548: 
1549: ```mermaid
1550: flowchart TD
1551:     REC["Your recording"] --> DEC["Decode to 16 kHz mono"]
1552:     REF["Local's reference clip"] --> DEC2["Decode to 16 kHz mono"]
1553:     DEC --> F0["Pitch every 10 ms<br/>YIN, 70-500 Hz"]
1554:     DEC2 --> F0R["Pitch every 10 ms"]
1555:     DEC --> RMS["Loudness every 10 ms"]
1556:     DEC2 --> RMSR["Loudness every 10 ms"]
1557:     F0 --> ST["Voiced frames to semitones<br/>around your median, fix octave jumps"]
1558:     F0R --> STR["Same for the local"]
1559:     ST --> RS["Resample to 60 points"]
1560:     STR --> RSR["Resample to 60 points"]
1561:     RS --> DTW["Time-warped distance<br/>asymmetric DTW"]
1562:     RSR --> DTW
1563:     DTW --> MEL["Melody score<br/>distance / local's expressiveness<br/>0.5 good, 1.1 bad"]
1564:     RMS --> ENV["Loudness envelope<br/>first to last loud frame, 60 points"]
1565:     RMSR --> ENVR["Same for the local"]
1566:     ENV --> RHY["Rhythm score<br/>mean difference 0.15 good, 0.45 bad"]
1567:     ENVR --> RHY
1568:     MEL --> ACC["Accent = 0.7 melody + 0.3 rhythm"]
1569:     RHY --> ACC
1570:     STT["Speech-to-text"] --> WRD["Word score<br/>best fuzzy match vs. accepted lines"]
1571:     ACC --> SCORE["Line score = 0.5 words + 0.5 accent"]
1572:     WRD --> SCORE
1573: ```
1574: 
1575: ### 16.2 The exact rules (from `src/voice/pitch.js`, `match.js`, `placement.js`, `server/otter.js`)
1576: 
1577: | Step | Rule |
1578: | --- | --- |
1579: | Sample rate | 16 kHz mono (enough for voice pitch, fast) |
1580: | Pitch detector | **YIN**: lag with the lowest cumulative-mean-normalised difference below **0.15**, parabolic interpolation; range **70–500 Hz** |
1581: | Frames | 10 ms hop; window ≈ 2 periods of 70 Hz |
1582: | Voicing | A frame counts if its loudness is above max(0.002, 10% of the clip's loudest frame) |
1583: | Normalising | Semitones = 12·log2(f / median f); jumps > 9 semitones are treated as octave errors and folded back; clamped to ±12 |
1584: | Length | Both contours resampled to **60 points**; need ≥ 10 voiced frames, or the accent score is "can't tell" (null) |
1585: | Melody distance | **Asymmetric DTW**: each reference point matches exactly one of yours, local tempo 0–2x, so a flat voice can't cheat; mean absolute difference per point |
1586: | Melody score | distance ÷ "flatness" (mean absolute semitones of the reference, at least 1) mapped linearly: ≤ 0.5 → 1.0, ≥ 1.1 → 0.0 |
1587: | Rhythm score | Loudness envelopes (normalised to peak, trimmed to the loud span, 60 points): mean absolute difference ≤ 0.15 → 1.0, ≥ 0.45 → 0.0 |
1588: | Accent score | 0.7 × melody + 0.3 × rhythm |
1589: | Word score | 1 − Levenshtein distance ÷ longer length, on normalised text; best over all accepted lines |
1590: | Line score | 0.5 × words + 0.5 × accent (words only if the accent is null) |
1591: | Bands | good ≥ 0.70, ok ≥ 0.40, else bad |
1592: | Trust change (test) | round((score − 0.35) × 60) |
1593: | Placement | Average of line scores: Tourist 0, Visitor 0.35, Neighbour 0.60, Local 0.80 |
1594: | Free-talk accent bonus | Normal turn: round((accent − 0.5) × 12), i.e. ±6. "Say it back": round((echo − 0.5) × 30), i.e. ±15, where echo = 0.5 × share of the phrase's words said + 0.5 × accent vs. the phrase clip |
1595: | Free-talk verdict given to the AI | accent ≥ 0.65 "sounds like a local", ≥ 0.40 "half local", else "tourist" |
1596: | Live Match % | Share of your voiced frames within **2.5 semitones** of the nearest reference point (±8 frames) |
1597: 
1598: ### 16.3 What it can and can't hear
1599: 
1600: | Can hear | Can't hear (yet) |
1601: | --- | --- |
1602: | The tune of the sentence (rises and falls) | **Individual sounds:** a rolled vs. English R, "aboot" vs. "about", a retroflex T |
1603: | Rhythm and stress timing | Vowel quality (the biggest part of most accents) |
1604: | Whether you said the right words | Whether your *voice quality* matches (nasality, breathiness) |
1605: | Tempo differences (it stretches) | Fine timing of consonants (glottal stops, aspiration) |
1606: 
1607: That's why the scoring is "generous" today and why section 17 makes **sound-level scoring** the top
1608: technical priority. An honest description for marketing: *"scores your melody and rhythm against a real
1609: local voice"*. Don't claim "full accent analysis" until sound-level scoring ships.
1610: 
1611: ---
1612: 
1613: ## 17. Technical architecture: target
1614: 
1615: ### 17.1 Target system
1616: 
1617: ```mermaid
1618: flowchart TB
1619:     subgraph Clients
1620:         WEB["Web app / PWA<br/>Three.js"]
1621:         IOS["iOS app<br/>web wrapper"]
1622:         AND["Android app<br/>web wrapper"]
1623:     end
1624:     subgraph Edge["API gateway"]
1625:         AUTH["Auth + rate limits + quotas"]
1626:     end
1627:     subgraph Core["Core backend"]
1628:         API["Game API<br/>progress, quests, scoring jobs"]
1629:         DB[("Postgres<br/>users, progress, content versions")]
1630:         OBJ[("Object storage<br/>audio, models, content packs")]
1631:         CMS["Content CMS<br/>authoring + review"]
1632:         BILL["Billing<br/>Stripe + store billing"]
1633:         AN["Analytics + experiments"]
1634:     end
1635:     subgraph Speech["Speech services"]
1636:         STT2["Streaming speech-to-text"]
1637:         PHON["Sound-level scorer<br/>phoneme model on GPU"]
1638:         PROS["Melody and rhythm scorer<br/>on device"]
1639:     end
1640:     subgraph Brain["Character brain"]
1641:         ROUTER["Model router<br/>small model most turns, large when needed"]
1642:         SAFE["Safety filter<br/>input + output"]
1643:         QE["Quest engine<br/>beats, state, endings"]
1644:     end
1645:     subgraph VoiceOut["Voice out"]
1646:         TTS2["TTS with cache"]
1647:         CACHE[("Line cache<br/>common lines pre-made")]
1648:     end
1649:     WEB --> AUTH
1650:     IOS --> AUTH
1651:     AND --> AUTH
1652:     AUTH --> API
1653:     API --> DB
1654:     API --> OBJ
1655:     API --> QE
1656:     QE --> ROUTER
1657:     ROUTER --> SAFE
1658:     API --> STT2
1659:     API --> PHON
1660:     WEB --> PROS
1661:     QE --> TTS2
1662:     TTS2 --> CACHE
1663:     CMS --> OBJ
1664:     CMS --> DB
1665:     API --> BILL
1666:     API --> AN
1667: ```
1668: 
1669: ### 17.2 Sound-level scoring (the big tech bet)
1670: 
1671: **Goal:** tell the player *which sound* was off ("your R was English; tap it"), and score accents by the
1672: features that actually define them.
1673: 
1674: **Approach, in order of effort:**
1675: 
1676: 1. **Forced alignment + phoneme recognition.** Use a phoneme-level speech model (wav2vec2- or similar
1677:    self-supervised models fine-tuned to output phonemes) to find where each expected sound is in your
1678:    recording, then compare what was recognised with what a local would produce for that sound.
1679:    This is the standard "Goodness of Pronunciation" (GOP) approach used by pronunciation apps, but with a
1680:    **local target** (e.g. Glaswegian /ɾ/, /ʉ/) instead of a "standard" one.
1681: 2. **Accent embeddings.** Train a small model that maps a recording to an "accent space" from labelled native
1682:    recordings per region. The score is how close your clip is to the region's cluster. Good as an overall
1683:    "how local do you sound" score; not good at explaining *why*.
1684: 3. **Feature detectors** for specific features where a model is overkill: rhoticity (does the R appear at all
1685:    after vowels), glottal stops (a sharp silence where a T should be), vowel formants (F1/F2 positions for
1686:    key vowels), aspiration (burst length after P/T/K).
1687: 4. **LLM-audio judge (experimental):** an audio-capable model rates the clip and writes a tip. Flexible but
1688:    expensive, slower and harder to keep consistent. Use it only for the Pro "coach review", not every turn.
1689: 
1690: **Where it runs:** phoneme models need a GPU server (Modal was in the jam toolset) or a quantised model on
1691: device later. Melody and rhythm stay on device (free, instant).
1692: 
1693: **Data needed:** per region, 2–10 hours of consented native speech with transcripts (from Accent Leads,
1694: creator partners, licensed archives), plus 1,000+ player attempts rated by native speakers to calibrate.
1695: 
1696: ### 17.3 Latency budget for one conversational turn
1697: 
1698: Target: **under 2.5 s** from releasing Talk to the character starting to speak (today: often 4–8 s, covered by
1699: a "thinking" line).
1700: 
1701: | Step | Today (approx.) | Target | How |
1702: | --- | --- | --- | --- |
1703: | Upload audio | 0.2–0.5 s | 0 s | Stream while recording |
1704: | Speech-to-text | 0.5–1.5 s | 0.2 s after release | Streaming STT |
1705: | Accent ear | ~0.1 s (device) | same | Already on device |
1706: | LLM | 1–4 s | 0.5–1 s | Small model, short prompt, prompt caching, stream the reply |
1707: | TTS | 0.7–2 s | 0.3 s to first audio | Streaming TTS; start speaking on the first sentence |
1708: | **Total** | **~3–8 s** | **~1.5–2.5 s** | Plus authored "thinking" fillers as backup |
1709: 
1710: A realtime voice-agent stack (the jam docs mention ElevenLabs Agents as a stretch goal) could reach this,
1711: but makes it harder to insert our own accent scoring between hearing and replying. Recommendation: keep our
1712: own pipeline, make every step streaming.
1713: 
1714: ### 17.4 Quest engine (hybrid authored + AI)
1715: 
1716: ```mermaid
1717: flowchart LR
1718:     IN["Player turn<br/>transcript + accent + sounds"] --> CLS["Beat classifier<br/>small model or rules:<br/>which beat did they hit?"]
1719:     CLS --> ST["Quest state<br/>beats done, trust, patience, traps"]
1720:     ST --> RULES["Authored rules<br/>trap hit? beat order? win/lose?"]
1721:     RULES --> GEN["Character writer<br/>LLM writes the line for this beat, in voice"]
1722:     GEN --> SAFE2["Safety filter"]
1723:     SAFE2 --> OUT["Reply + mood + action + tip + suggestions"]
1724:     RULES -->|"AI down or slow"| AUTH2["Authored fallback line"]
1725:     AUTH2 --> OUT
1726: ```
1727: 
1728: **Why hybrid:** pure AI drifts off the goal, costs more and is harder to test; pure scripting (Morag) feels
1729: stiff and breaks when players say something unexpected. Authored beats plus AI wording gets the best of
1730: both, and lets the cheap rules handle most of the logic.
1731: 
1732: ### 17.5 Platform plan
1733: 
1734: 1. **Now:** web (desktop and phone browsers). Free to iterate; shareable links; works for the Chroma entry.
1735: 2. **Beta:** PWA (installable, offline lessons with pre-downloaded packs).
1736: 3. **Paid launch:** iOS and Android through a web wrapper (store presence, billing, push notifications for
1737:    streaks, better background mic handling).
1738: 4. **Later:** native rewrite only if performance requires it.
1739: 
1740: ### 17.6 Security and privacy by design
1741: 
1742: - Keys only on the server (already a team rule: never in `src/`).
1743: - Auth + per-user quotas on every AI endpoint.
1744: - **Raw audio isn't stored by default.** It's processed and discarded; players can opt in to "help improve
1745:   scoring", with clear consent (section 27).
1746: - Short retention on vendor side (check and configure each vendor's data retention and training opt-outs).
1747: - Content packs signed and versioned.
1748: 
1749: ---
1750: 
```

### PRD lines 1751–2015

```text
1751: ## 18. AI, data and quality strategy
1752: 
1753: ### 18.1 Where AI is used
1754: 
1755: | Use | Today | Target |
1756: | --- | --- | --- |
1757: | Hearing words | ElevenLabs Scribe | Streaming STT; custom vocabulary per region (slang list) |
1758: | Judging melody and rhythm | On-device DSP (no AI) | Same, recalibrated |
1759: | Judging sounds | — | Phoneme model |
1760: | Playing characters | Claude, big model, low effort | Model router; most turns on a small model |
1761: | Speaking | ElevenLabs designed voices | Designed voices + recorded native lines for references |
1762: | Creating content | Prompted by the team | CMS with native review |
1763: | Making assets | Meshy (3D), ChatGPT/Gemini (references), ElevenLabs (music, SFX) | Same, plus a consistent art style guide |
1764: 
1765: ### 18.2 The data flywheel
1766: 
1767: ```mermaid
1768: flowchart LR
1769:     A["More players"] --> B["More consented attempts<br/>opt-in only"]
1770:     B --> C["Native speakers rate a sample<br/>paid panel"]
1771:     C --> D["Better scoring models<br/>per region, per sound"]
1772:     D --> E["More accurate, more useful feedback"]
1773:     E --> F["Better results and retention<br/>players improve, share"]
1774:     F --> A
1775: ```
1776: 
1777: ### 18.3 How we know the scoring is good
1778: 
1779: | Test | Target |
1780: | --- | --- |
1781: | **Agreement with native raters** (correlation between our score and the average native rating, 1–5) | ≥ 0.7 |
1782: | **Native speakers score high** | ≥ 90% "Local" |
1783: | **Robot / flat reads score low** | ≥ 90% "Tourist" |
1784: | **Stable** (same person, same line, 5 tries) | ±10 points |
1785: | **Fair across voices** (gender, age, pitch range, mic quality) | No group's mean score differs by more than 5 points on the same quality of attempt |
1786: | **Improvement shows** (pre/post a unit, rated by natives) | Native ratings improve and our score improves with them |
1787: 
1788: ### 18.4 Character quality
1789: 
1790: - **Golden conversations:** a test set of 100 scripted player turns per character (good local answers,
1791:   tourist answers, off-topic, jailbreaks, abuse). Run on every prompt or model change; check trust moves the
1792:   right way and nothing unsafe comes out.
1793: - **Consistency:** the same answer should get roughly the same trust change (± 5).
1794: - **Persona checks:** the Accent Lead reviews a sample of real (anonymised) transcripts each month.
1795: 
1796: ---
1797: 
1798: ## 19. Unit economics (what each conversation costs)
1799: 
1800: > **All prices here are ASSUMPTIONS for planning.** Vendor prices change often; replace with current price
1801: > sheets before using these numbers with investors.
1802: 
1803: ### 19.1 Cost per free-talk turn (today's stack)
1804: 
1805: One turn = player speaks about 5 s, the character replies with about 120–150 characters, and about 1 in 3
1806: turns also voices a "say it back" phrase (about 30 characters).
1807: 
1808: | Item | Usage per turn | Assumed price | Cost per turn |
1809: | --- | --- | --- | --- |
1810: | Speech-to-text | ~5–10 s of audio | ~$0.30–0.50 per audio hour | ~$0.001 |
1811: | LLM (large model) | ~2,500 input tokens (system prompt mostly cached) + ~400 output | large-model rates | ~$0.01–0.03 |
1812: | Text-to-speech | ~160 characters | ~$0.10–0.30 per 1,000 characters (plan-dependent) | ~$0.016–0.05 |
1813: | Serverless compute | ~5 s | small | < $0.001 |
1814: | **Total per turn** | | | **~$0.03–0.08** |
1815: | **Per 8-turn conversation** | | | **~$0.25–0.55** (more with retries) |
1816: 
1817: **TTS is the biggest cost, then the LLM.** Speech-to-text is almost free.
1818: 
1819: ### 19.2 What a paying user costs
1820: 
1821: | User type | Conversations per month | AI cost per month | Price | Gross margin |
1822: | --- | --- | --- | --- | --- |
1823: | Light Pro | 10 | ~$2.50–5.50 | $9.99 (~$7 after store fees) | OK |
1824: | Typical Pro | 30 | ~$7.50–16.50 | $9.99 | **Negative to break-even** |
1825: | Heavy Pro | 90 | ~$22–50 | $9.99 | **Heavily negative** |
1826: | Free user | 3 per day cap → ~20 | ~$5–11 | $0 | **Must be capped hard** |
1827: 
1828: **Conclusion:** with today's stack, "unlimited AI conversations" can't be offered. To make Pro profitable at
1829: $9.99:
1830: 
1831: ### 19.3 Cost-down plan (target: ≤ $0.05 per conversation)
1832: 
1833: | Lever | Saving | Effort |
1834: | --- | --- | --- |
1835: | **Lessons don't use the LLM:** authored lines, pre-generated audio, on-device scoring | Lessons cost ~$0 except STT | Low (it's the plan anyway) |
1836: | **Cache TTS** for repeated character lines (greetings, reactions, fillers) | 30–50% of TTS | Low |
1837: | **Small model for most turns** (route to the big model only on hard judgments) | 70–90% of LLM | Medium |
1838: | **Shorter replies** (1 sentence often enough) | 20–40% of TTS | Low |
1839: | **Cheaper TTS tier or self-hosted open TTS** for non-hero lines | 50–90% of TTS | Medium-high; quality risk |
1840: | **On-device speech-to-text** (small Whisper-class models in the browser) | ~100% of STT | Medium |
1841: | **Volume discounts** with vendors | 20–50% | Business deal |
1842: 
1843: **Free tier rule (recommended):** unlimited lessons (cheap), 1 free quest per day, 3 free-talk turns per day
1844: or 1 conversation per day. Pro: fair use (for example 300 AI turns per month), then slower or scripted mode.
1845: 
1846: ### 19.4 Other costs (rough, per month, early stage, **ASSUMPTION**)
1847: 
1848: | Item | Early stage |
1849: | --- | --- |
1850: | Hosting, database, storage, CDN | $50–500 |
1851: | Accent Leads and reviewers (per region, one-off) | $3k–10k per region |
1852: | 3D characters and art per region | $1k–5k (AI-assisted + cleanup) |
1853: | Legal (company, privacy policy, terms, licences) | $5k–20k one-off |
1854: | Analytics, error monitoring, tools | $0–300 |
1855: 
1856: ---
1857: 
1858: ## 20. Business model and pricing
1859: 
1860: ### 20.1 Business model canvas
1861: 
1862: | Block | Sound Local |
1863: | --- | --- |
1864: | **Customer segments** | Fun and social players (16–30); performers (actors, drama students, comedians, voice actors, impressionists); expats and travellers; later, schools and English learners |
1865: | **Value propositions** | Learn real accents and slang by talking; judged by ear; local characters with personality; fast, funny, shareable; authentic and respectful |
1866: | **Channels** | TikTok/Reels/Shorts (organic + creators), share cards and duets, app stores, web (SEO accent tests), drama schools and coaches, press |
1867: | **Customer relationships** | Self-serve game; streaks and quests; community (Discord); creator programme; B2B account management for schools |
1868: | **Revenue streams** | Pro subscription; Party and Production passes; Actor tier; school and coach seats; creator packs (rev share); cosmetics; licensed impression packs; tech licensing |
1869: | **Key resources** | Accent scoring tech; native-speaker reference library; characters and voices; content pipeline; brand |
1870: | **Key activities** | Building regions and quests with Accent Leads; improving scoring; growth content; safety and respect review |
1871: | **Key partners** | ElevenLabs, LLM vendors, Meshy; Accent Leads and creators; drama schools and dialect coaches; accent archives; (later) tourism boards and celebrities |
1872: | **Cost structure** | AI per turn (TTS, LLM, STT); content (Accent Leads, art); team; hosting; marketing; legal |
1873: 
1874: ### 20.2 Revenue streams, by stage
1875: 
1876: | Stream | When | Who pays | Notes |
1877: | --- | --- | --- | --- |
1878: | **Pro subscription** | Paid launch | Fun players, expats, performers | The main engine (Duolingo model) |
1879: | **Party Pass** (weekly) | Paid launch | Teens, game nights | Short, cheap, no commitment (simulation finding F5) |
1880: | **Actor tier + Production Pass** | Paid launch + 3 months | Actors, comedians, voice actors | Higher price; buy per production (F6) |
1881: | **School and coach seats** | Year 2 | Drama schools, coaches | Needs per-sound scoring and a teacher dashboard (F9) |
1882: | **Creator packs** | Year 2 | Players buy; creators earn a share | Native speakers publish packs; we review |
1883: | **Cosmetics** | Paid launch | Fun players | Outfits for your passport avatar, character skins, sticker packs |
1884: | **Licensed impression packs** | Year 2–3 | Fans | Celebrity or pro-impressionist partnerships, rev share |
1885: | **Tech licensing / API** | Year 3 | Casting platforms, language apps, call-centre training (accent *awareness*, not reduction) | "Accent similarity" scoring as a service |
1886: | **Sponsorships** | Opportunistic | Tourism boards, local brands | Must never compromise respect; clearly labelled |
1887: 
1888: **Expected revenue mix in year 3 (ASSUMPTION):**
1889: 
1890: ```mermaid
1891: pie showData
1892:     title "Year 3 revenue mix (assumption)"
1893:     "Pro subscriptions" : 55
1894:     "Passes (Party, Production)" : 12
1895:     "Actor tier" : 10
1896:     "Schools and coaches" : 10
1897:     "Creator packs and cosmetics" : 8
1898:     "Licensing and other" : 5
1899: ```
1900: 
1901: ### 20.3 Pricing (v1, to be tested)
1902: 
1903: | Plan | Price (ASSUMPTION) | What you get |
1904: | --- | --- | --- |
1905: | **Free** | $0 | Placement test for every region; fundamentals on-ramp; **3 quests a day**; 1 free-talk conversation a day; basic feedback; streaks |
1906: | **Party Pass** | $2.99 / week | Everything in Pro for 7 days, plus **party mode** (accent-off for up to 8 players) |
1907: | **Pro** | $9.99 / month or **$59.99 / year** | All regions; unlimited quests; free talk (fair use, e.g. 300 AI turns/month); detailed feedback; offline drills; no ads ever |
1908: | **Actor** | $24.99 / month, or **Production Pass $39 for 8 weeks** | Pro + script upload, line-by-line drills, per-sound feedback (when shipped), dialect breakdown export, priority on new accents |
1909: | **Schools and coaches** | ~$5–10 per student per month, or ~$300–1,000 per class per year | Teacher dashboard, assignments, progress reports, class accents |
1910: | **Regional pricing** | Lower prices in India and other markets (e.g. ~₹199–299/month, **ASSUMPTION**) | Same features |
1911: 
1912: **Pricing logic:**
1913: 
1914: - **Annual plan is the default** shown (Duolingo and most consumer subscription apps sell mostly annual
1915:   plans), with a 7-day free trial.
1916: - **Passes catch the moments** (a party, a role) where a subscription feels wrong.
1917: - **Fair use on AI** protects margins (section 19); scripted quests keep the free tier cheap.
1918: - **Never hearts or pay-to-retry.** Speaking out loud is scary; we don't punish trying.
1919: 
1920: **Pricing experiments:** annual vs. monthly default; $59.99 vs. $79.99 yearly; 3 vs. 5 free quests a day;
1921: trial length 3 vs. 7 days; Party Pass at $1.99 vs. $2.99; regional prices.
1922: 
1923: ### 20.4 Unit economics targets
1924: 
1925: | Metric | Target (ASSUMPTION) | Why |
1926: | --- | --- | --- |
1927: | Free → paid conversion | 3–6% of monthly actives | Consumer subscription benchmark range |
1928: | Blended revenue per paying user | ~$45–55 / year | Mostly annual plans, after store fees |
1929: | AI cost per paying user | ≤ $1 / month | Requires the cost-down plan (19.3) |
1930: | AI cost per free user | ≤ $0.15 / month | Scripted quests, cached lines, caps |
1931: | Gross margin | ≥ 70% | Healthy consumer software |
1932: | Paid acquisition cost (CAC) | ≤ $15 per paying user | Mostly organic growth; paid only to boost proven content |
1933: | LTV (lifetime value) | ≥ $80 | ~1.7 years average paid life at ~$50/year |
1934: | LTV : CAC | ≥ 3 : 1 | Standard healthy ratio |
1935: | Payback | ≤ 6 months | Keeps cash needs low |
1936: 
1937: ### 20.5 Creator marketplace (year 2)
1938: 
1939: - Native-speaker creators (Accent Leads, comedians, coaches, local TikTokers) build **packs**: a set of
1940:   quests, a character voice (their own, with consent) and lessons, using our CMS.
1941: - We review against the Respect Charter, then publish.
1942: - **Revenue share:** e.g. 50% of the pack's net revenue (or a share of Pro revenue by play time) goes to the
1943:   creator. Public and simple.
1944: - Why: authentic content at scale, creators market their own packs, and the answer to "who profits?" (F8)
1945:   is "the locals do".
1946: 
1947: ### 20.6 Three-year projection (illustrative, ASSUMPTION)
1948: 
1949: | | Year 1 (beta → launch) | Year 2 | Year 3 |
1950: | --- | --- | --- | --- |
1951: | Regions live | 3 (Glasgow, + 2) | 8 | 15+ |
1952: | Registered users | 150k | 1.2M | 4M |
1953: | Monthly active users (end of year) | 40k | 300k | 900k |
1954: | Paying users (end of year) | 1.5k | 15k | 50k |
1955: | Revenue | ~$40k | ~$600k | ~$2.5M |
1956: | AI + hosting cost | ~$25k | ~$150k | ~$450k |
1957: | Team (people) | 3–4 | 8 | 15 |
1958: | Burn per month (end of year) | ~$30k | ~$120k | ~$220k |
1959: 
1960: These numbers only show the *shape* (slow first year, compounding later). Rebuild them from real funnel
1961: data after the beta.
1962: 
1963: ### 20.7 Funding plan
1964: 
1965: **Stage 0, now to the Chroma deadline (7 Jan 2027): non-dilutive.**
1966: Jam and Chroma prizes and tool awards (Meshy, ElevenLabs); startup credit programmes from AI, cloud and
1967: voice vendors (apply to all that exist); university startup programmes and incubators (the team is in
1968: Toronto); Canadian government programmes for R&D-heavy startups (for example SR&ED tax credits and IRAP;
1969: check eligibility with an accountant).
1970: 
1971: **Stage 1, after beta traction: pre-seed, about $500k–1.5M (ASSUMPTION).**
1972: - **Milestones to raise on:** 3 regions live; D7 retention ≥ 20%; ≥ 10k weekly active speakers; a clear
1973:   organic growth loop (share cards and creator duets); cost per conversation on track to ≤ $0.05; 2–3 school
1974:   or coach pilots.
1975: - **Use of funds (18–24 months of runway):** team 60%, content and Accent Leads 15%, AI and infrastructure
1976:   10%, growth 10%, legal and admin 5%.
1977: - **Who to pitch:** consumer and edtech seed funds; gaming accelerators and games-focused funds; angels from
1978:   language apps, voice AI and creator companies; accelerators (e.g. Y Combinator-style programmes).
1979: 
1980: **Stage 2: seed (about $3–5M, ASSUMPTION)** on paid launch traction: subscription revenue growing, retention
1981: curves flattening, 8+ regions, the B2B pilot converting.
1982: 
1983: ### 20.8 Pitch deck outline (12 slides)
1984: 
1985: 1. **Title:** Sound Local: Duolingo for accents. (Gameplay GIF of Senga roasting a tourist.)
1986: 2. **Problem:** People who want to *do* accents (actors, comedians, creators, the curious) have no good tool.
1987: 3. **Insight:** Every speech app makes you sound *less* like somewhere. Nobody helps you sound *more* like
1988:    somewhere.
1989: 4. **Product:** 30-second demo: placement, quest, roast, trust meter, pitch line.
1990: 5. **Why now:** accented AI voices, speech-to-text that hears dialect, LLM characters, short-form video.
1991: 6. **Traction:** users, D7 retention, shares per user, organic share of sign-ups, cost per conversation.
1992: 7. **Market:** language apps are huge; native English speakers + performers + curious players; India as a
1993:    two-way market.
1994: 8. **Business model:** freemium, passes, Actor tier, schools, creator packs.
1995: 9. **Moat:** native-speaker library, scoring tuned to "sounding local", characters and brand, creator
1996:    community, respect reputation.
1997: 10. **Competition:** the positioning map (7.3).
1998: 11. **Team:** who we are, what we've shipped (a playable game in one day).
1999: 12. **Ask:** amount, milestones, use of funds.
2000: 
2001: ### 20.9 Company setup checklist
2002: 
2003: - [ ] Incorporate (where depends on founders and investors: a Canadian corporation for Canadian programmes;
2004:       many US-funded startups use a Delaware C-corp; get advice).
2005: - [ ] Founders' agreement: roles, equity split, **4-year vesting with a 1-year cliff**, decision making.
2006: - [ ] **IP assignment:** every contributor to the jam code (all three lanes, and anyone else) assigns their
2007:       code, art and content to the company. AI-agent output is covered by the tools' terms; check them.
2008: - [ ] Remove or license third-party IP: the **Devin Otter** (Cognition's mascot), any brand names in
2009:       content (e.g. drinks), fonts (check licences), the world map image's source.
2010: - [ ] Move all vendor accounts (ElevenLabs voices, Meshy, Vercel, GitHub) from personal to company accounts.
2011: - [ ] Trademark search and filing for the final name.
2012: - [ ] Privacy policy, terms, cookie notice, data processing agreements with vendors (section 27).
2013: - [ ] Bank account, accounting, Stripe.
2014: 
2015: ---
```

### PRD lines 2167–2307

```text
2167: ## 22. Open questions (with recommended answers)
2168: 
2169: Each question has a **recommended answer**, the **alternatives**, and what decides it. Answered questions
2170: are marked **Decided**.
2171: 
2172: ### Product
2173: 
2174: **Q1. Which region comes after Glasgow?**
2175: - **Recommended:** a fast, low-risk second region (**Australia** or **London MLE**) to prove the engine
2176:   generalises in ~4–6 weeks, then **Indian English** as the big bet, with the Accent Lead hired *first*.
2177: - Alternatives: (a) Indian English second (bigger upside, needs the native team ready); (b) Singapore second;
2178:   (c) RP second, to serve actors early.
2179: - Decides it: whether an Indian Accent Lead and creators can be signed by January.
2180: 
2181: **Q2. Keep, license or replace the Devin Otter?**
2182: - **Recommended:** **replace** with our own brand character after the Chroma entry (keep the otter for the
2183:   jam and Chroma with Cognition's written OK, as `docs/TOOLS.md` already notes). Simulation F11: a brash local
2184:   like Senga may make a better brand face.
2185: - Alternatives: (a) ask Cognition for a licence (unusual for a startup); (b) an otter of our own design that
2186:   looks different.
2187: 
2188: **Q3. Final name?**
2189: - **Recommended:** keep **"Sound Local"** if the trademark and domains are clear; it says what it does.
2190: - Alternatives: "Prove You're Local", "Local Tongue", "Accently", "Speak Like a Local". Run a trademark search
2191:   in the US, UK, Canada and India first.
2192: 
2193: **Q4. Who is the first customer?** **Decided (14 Nov):** lead with fun and social for growth, with the
2194: Actor tier as a revenue floor. Re-check after the beta data.
2195: 
2196: **Q5. Lessons or quests at the centre?** **Decided (14 Nov):** quests and open speech are the core; a short
2197: fundamentals on-ramp (tonality + grammar/slang); targeted drills on demand (section 12.0). Casual players can
2198: go quest-first (simulation F3).
2199: 
2200: **Q6. How many free quests a day?**
2201: - **Recommended:** **3**, with 1 free-talk conversation (simulation F4). Quests are mostly authored beats with
2202:   cached audio, so they're cheap.
2203: - Alternatives: 1 (stingier, cheaper); 5; unlimited scripted quests and caps on AI only.
2204: 
2205: **Q7. How much of a quest is AI vs. authored?**
2206: - **Recommended:** **hybrid** (section 17.4): authored beats, traps and endings; AI writes the wording and
2207:   judges answers; authored fallback lines.
2208: - Alternatives: fully AI (today's free talk: flexible, expensive, drifts); fully scripted (Morag: cheap,
2209:   stiff).
2210: 
2211: **Q8. Should the word tray count only words "used naturally"?**
2212: - **Recommended:** **yes**. Add `used_words` to the AI's JSON; the tray lights only those. This matches the
2213:   founders' intent ("if you just randomly say it, he'll call you out").
2214: - Alternative: keep lighting any mention (more generous, less honest).
2215: 
2216: **Q9. Show raw numbers or only levels?**
2217: - **Recommended:** both, carefully: a level name plus one number (/100), and at most three numbers on screen.
2218: - Alternatives: levels only (kinder); full breakdown (pros only, in the Actor tier).
2219: 
2220: **Q10. Action gameplay (the dodging idea)?**
2221: - **Recommended:** **no combat.** Voice-driven mini-games instead (section 12.7); simple "press to walk"
2222:   movement on the street.
2223: - Alternatives: light physical comedy (dodging Senga's chip-stealing swoops) as a non-violent compromise.
2224: 
2225: **Q11. The London region?**
2226: - **Recommended:** yes, as "Prove you're from ends" (section 12.6) with a London creator as Accent Lead; no
2227:   weapons or gangs.
2228: - Alternative: skip London until later.
2229: 
2230: **Q12. Celebrity impressions?**
2231: - **Recommended:** start with **archetypes** (no real people), then **licensed impressionist packs**, then
2232:   official celebrity partnerships (section 12.8). Never clone a real voice.
2233: - Alternative: skip impressions entirely and stay on accents.
2234: 
2235: **Q13. Two-way market (non-native users learning accents) at the India launch?**
2236: - **Recommended:** **yes** (simulation F7): market Glaswegian, British and American accents to Indian users
2237:   alongside the Indian English region.
2238: - Alternative: native speakers only until later.
2239: 
2240: ### Technology
2241: 
2242: **Q14. Build sound-level scoring in-house or license it?**
2243: - **Recommended:** prototype in-house with open phoneme models (fast to test, ours to tune toward "local");
2244:   talk to pronunciation-tech vendors in parallel as a fallback.
2245: - Alternatives: license now (faster, expensive, tuned for the wrong target); wait.
2246: 
2247: **Q15. Which LLM setup?**
2248: - **Recommended:** **model routing**: a small, cheap model for most quest turns, the large model only for
2249:   open free talk and hard calls. Keep the JSON-schema contract so models can be swapped.
2250: - Alternatives: one large model for everything (today: expensive); one small model (cheaper, weaker
2251:   characters).
2252: 
2253: **Q16. Designed AI voices or recorded native voices?**
2254: - **Recommended:** **both**: recorded native speakers (Accent Leads) for **reference lines** that players are
2255:   scored against, and native-reviewed designed voices for characters' improvised replies.
2256: - Alternative: designed voices only (cheaper; less authentic as a scoring target).
2257: 
2258: **Q17. Web, PWA or native apps?**
2259: - **Recommended:** web now (Chroma, sharing), PWA in beta, **wrapped apps for paid launch**.
2260: - Alternative: native apps first (slower, better mic and performance).
2261: 
2262: **Q18. Store player audio to improve scoring?**
2263: - **Recommended:** **no by default**; opt-in "help train the local ears" with clear consent, and never for
2264:   under-18s.
2265: - Alternatives: store short clips by default (better data, big privacy risk).
2266: 
2267: ### Business and company
2268: 
2269: **Q19. Price points?**
2270: - **Recommended:** Pro $59.99/year (default) or $9.99/month; Party Pass $2.99/week; Actor $24.99/month or a
2271:   $39 8-week Production Pass; regional pricing for India (section 20.3).
2272: - Alternatives: $79.99/year; no passes; one plan only. Test in the beta.
2273: 
2274: **Q20. Chroma Awards category?**
2275: - **Recommended:** **Experimental & Open Format** ("your voice is the controller"), as `docs/PLAN.md`
2276:   argues. `package.json` and the checklist currently say Arcade & Party; Interactive Narrative is a strong
2277:   second (the quests).
2278: - Alternatives: Arcade & Party (works if party mode/accent-off ships); Interactive Narrative.
2279: 
2280: **Q21. Minimum age?**
2281: - **Recommended:** **13+**, with a teen mode (13–17: no open social, stricter filters, no audio storage,
2282:   parental consent where the law needs it).
2283: - Alternatives: 16+ (simpler compliance, smaller audience); 18+ for free talk only.
2284: 
2285: **Q22. Ads in the free tier?**
2286: - **Recommended:** **no ads** at first. They clash with a voice-first, brand-sensitive product and pay
2287:   little at small scale.
2288: - Alternative: rewarded ads for an extra free quest (later, if conversion is low).
2289: 
2290: **Q23. Raise money now or later?**
2291: - **Recommended:** **later.** Use non-dilutive money (prizes, credits, programmes) to reach the beta
2292:   milestones in 20.7, then raise a pre-seed from strength.
2293: - Alternatives: raise a small angel round now (speed, but at a low valuation).
2294: 
2295: **Q24. Where to incorporate, and the equity split?**
2296: - **Recommended:** get advice early; decide incorporation by founder residency and the likely investors.
2297:   Equal or near-equal split among the founders who commit full-time, with **4-year vesting and a 1-year
2298:   cliff**, and a reserved pool (~10–15%) for future hires and the cofounder this doc is written for.
2299: - Alternatives: weighted by role or time commitment.
2300: 
2301: **Q25. Who owns content created by Accent Leads and creators?**
2302: - **Recommended:** the creator keeps ownership of their voice; the company gets an exclusive licence to the
2303:   recordings in the product, with revenue share and the right to withdraw their voice from future use.
2304: - Alternative: buy out all rights (simpler legally, worse for trust and recruiting).
2305: 
2306: ---
2307: 
```

### PRD lines 2479–2524

```text
2479: ## 27. Legal, privacy and compliance
2480: 
2481: > Not legal advice. Get a lawyer to review before the public beta.
2482: 
2483: ### 27.1 Privacy and voice data
2484: 
2485: - Voice recordings are **personal data** (GDPR in the EU, UK GDPR, Canada's PIPEDA, California's CCPA/CPRA,
2486:   India's Digital Personal Data Protection Act). Some laws treat **voiceprints** as biometric data (for
2487:   example Illinois's BIPA) when used to identify people. We don't identify people by voice, but design as if
2488:   the strict rules apply.
2489: - **Default:** process and discard; scoring on device where possible; vendors set to no retention and no
2490:   training on our data where they allow it (check each vendor's settings and contract).
2491: - **Opt-in** to store clips for improving scoring; delete anytime; never for minors.
2492: - **Minors:** COPPA (US, under 13) and similar laws; age gate; teen mode (Q21).
2493: - A clear, short privacy notice on the mic screen: "Your voice is scored and then deleted."
2494: 
2495: ### 27.2 Content and IP
2496: 
2497: - Every asset is original or licensed and logged (already a team rule, `assets/manifest.json`).
2498: - **Mascot:** the Devin Otter is Cognition's; replace or get written permission.
2499: - **Brand names in content** (e.g. a drink brand in a character's lines): usually fine as natural
2500:   mentions, but avoid using logos or implying endorsement; review before launch.
2501: - **Fonts and images:** check licences (Google Fonts are open licences; check the world map image's origin).
2502: - **AGPL software (MiroFish):** used only as an internal research tool, outside the product. Don't copy
2503:   AGPL code into the product.
2504: - **AI-generated content ownership:** check each tool's terms (Meshy, ElevenLabs, image models); some limit
2505:   commercial use on free plans.
2506: 
2507: ### 27.3 Voices and likeness
2508: 
2509: - Designed voices must not imitate a real person. Recorded voices need a signed release with payment and
2510:   usage terms (Q25).
2511: - Real-person impressions: right-of-publicity laws (US states), new laws on AI voice cloning (for example
2512:   Tennessee's ELVIS Act, 2024), and copyright in recordings. Follow 12.8.
2513: 
2514: ### 27.4 Subscriptions and consumer law
2515: 
2516: - Clear auto-renew terms, easy cancellation (several jurisdictions require it), refund policy, regional tax
2517:   (VAT/GST) handled by the stores or Stripe Tax.
2518: 
2519: ### 27.5 Accessibility
2520: 
2521: - Captions on all voice lines (built); a type-instead option (F12); reduced motion (built); colour-blind-safe
2522:   meters; aim for WCAG 2.2 AA on menus.
2523: 
2524: ---
```

## Appendix B — cost-notes verbatim with source lines

Source: `docs/prd/cost-notes.md`.

```text
1: # Cost notes: what a conversation costs, before and after M3
2: 
3: Units only (tokens, TTS characters, STT seconds). Prices change; multiply by today's rate card.
4: 
5: ## How this was measured
6: 
7: - `node scripts/cost-estimate.js` (or `npx vite-node scripts/cost-estimate.js`) builds a real request
8:   for every call in one free-talk conversation with the actual Glasgow system prompt, the actual JSON
9:   schema and the actual `transcript()` the server sends: (before only) the AI opening, then 8 turns,
10:   each with a 4.5 s spoken answer and a realistic reply, a "say it back" phrase every third turn. Sample
11:   replies follow each prompt's length rules (before: 1-2 sentences up to 220; after: one short sentence
12:   plus a question). No network calls.
13: - Tokens are estimated at ~4 characters per token (`server/cost.js`), about +/-20% for English + JSON.
14:   The schema is counted as input because structured output sends it with the request.
15: - STT seconds come from the recording size (~4 kB/s webm/opus). TTS characters are what ElevenLabs bills.
16: - In production, `/api/otter` now logs one `[otter] turn usage` line per turn with the same fields; when
17:   the model reports real `usage` the log uses that instead of the estimate. No text, audio or keys.
18: - Not measured live: no Anthropic calls were made for this work, so cache hit rates and real output
19:   lengths are estimates. Check the usage log after a day of real play.
20: 
21: ## Per free-talk conversation (opening + 8 turns, "say it back" every third turn)
22: 
23: | | Before | After | Target (brief) |
24: |---|---:|---:|---:|
25: | Anthropic calls | 9 (8 + 1 AI opening) | **8** | 8, smaller |
26: | LLM input tokens (total) | 12,689 | 11,111 | |
27: | of which cached (system prompt + schema) | 10,440 | 9,280 | |
28: | LLM input tokens not cached | 2,249 | 1,831 | **-19%** |
29: | LLM output tokens (typical) | 969 | 766 | **-21%** |
30: | LLM output tokens (worst case per call) | 2,000 cap | 350 cap | **-82%** on runaway turns |
31: | ElevenLabs TTS characters | 1,196 | **698** | ≤ 900 |
32: | STT seconds | 36 | 36 | same (can't shorten what the player says) |
33: | Scripted quest (Mumbai) | n/a | **0 Anthropic, 0 runtime TTS**, only STT | 0 / 0 |
34: 
35: Per turn on average: TTS 150 → 87 characters, non-cached input 281 → 229 tokens, output 121 → 96 tokens.
36: 
37: ## What changed, per conversation
38: 
39: | | Before | After |
40: |---|---|---|
41: | NPC openings (Senga, Hamish, every Mumbai character) | 1 LLM call + 1 TTS call per conversation | authored greeting + pre-generated mp3 (browser voice until it exists): **0 AI calls before the first answer** |
42: | `max_tokens` | 2000 | 350 |
43: | History sent | every line so far | last 8 lines |
44: | Reply length | 1-2 sentences, up to 220 characters, the turn failed if longer | one short sentence plus a question, ~110 characters, cap 160 (prompt + schema); an over-long reply is cut at the last full sentence instead of failing |
45: | Turns where nothing was heard | full LLM call + TTS | authored line, **0 LLM, 0 TTS** |
46: | Simple turns (short answers, quest wording) | main model | `OTTER_MODEL_FAST` if set (default = main model, no change) |
47: | Live TTS model | `eleven_v3` for every reply | `TTS_MODEL_LIVE` if set (default `eleven_v3`, no change); authored lines stay v3 mp3s |
48: | Repeated lines (echo phrases, fallbacks) | voiced every time | voiced once per instance (`server/ttsCache.js`, 100 lines, per TTS model) |
49: | Past `MAX_AI_TURNS_PER_DAY` (default 2000) | unlimited spend | authored "come back tomorrow" line, no vendor calls |
50: | One IP hammering the API | unlimited | 20/min, 300/day on `/api/otter` and `/api/stt` |
51: 
52: ## Quality switches (off by default, flip in the server env)
53: 
54: | Setting | What it does | Saving | Quality risk |
55: |---|---|---|---|
56: | `TTS_MODEL_LIVE=eleven_flash_v2_5` | improvised replies use Flash instead of v3 | TTS **$0.08 → $0.04 per 1K characters** (-50%) | flatter delivery, weaker accent, no audio tags (they are stripped) |
57: | `OTTER_MODEL_FAST=<smaller Claude model>` | short answers and quest wording use it | depends on the model picked | less witty short replies |
58: | `OTTER_MODEL=<model>` | every free-talk turn | depends on the model picked | everything |
59: 
60: ElevenLabs prices were checked on elevenlabs.io/pricing/api on 2026-11-15: v3 $0.08, v3 Conversational
61: $0.04, Flash / Turbo $0.04 per 1K characters; Scribe STT $0.20 per hour. Check again before relying on them.
62: 
63: ## Quality guardrails
64: 
65: The aim is cheaper without sounding clipped. Replies are asked to sound like a real person talking
66: (contractions, one or two sentences, ~140 characters) rather than squeezed short: one short sentence plus a question, the way people actually talk at a
67: counter or a bus door. Lines are never cut mid-word. The greeting is still the character's own
68: authored line, and pre-generated audio keeps the full v3 accent.
69: 
70: Not on by default because they'd hurt quality: a cheaper live TTS model (available behind
71: `TTS_MODEL_LIVE`, above) and a smaller Claude model (`OTTER_MODEL_FAST`). Not done at all: dropping
72: hints/suggestions from the reply, which would make the game harder to play.
73: 
74: ## Knobs
75: 
76: - `OTTER_MODEL` (default `claude-opus-5-5`, unchanged), `OTTER_MODEL_FAST` (default = `OTTER_MODEL`).
77: - `TTS_MODEL_LIVE` (default `eleven_v3`, unchanged).
78: - `MAX_AI_TURNS_PER_DAY` (default 2000).
79: - `MAX_TOKENS` = 350, `HISTORY_LINES` = 8 in `server/otter.js`.
80: 
81: shortcut: limits and the TTS cache are in-memory per instance; move to a shared store (KV/Redis)
82: before real traffic.
```

## Appendix C — shipped public binary sizes

Bytes from regular-file stat.

| Path | Bytes |
|---|---:|
| `public/assets/audio/music/glasgow.mp3` | 738,322 |
| `public/assets/audio/music/win.mp3` | 90,322 |
| `public/assets/audio/scotland/aye-bad.mp3` | 41,410 |
| `public/assets/audio/scotland/aye-good.mp3` | 48,933 |
| `public/assets/audio/scotland/aye-ok.mp3` | 50,187 |
| `public/assets/audio/scotland/aye.mp3` | 29,707 |
| `public/assets/audio/scotland/braw-bad.mp3` | 64,398 |
| `public/assets/audio/scotland/braw-good.mp3` | 61,890 |
| `public/assets/audio/scotland/braw-ok.mp3` | 64,398 |
| `public/assets/audio/scotland/braw.mp3` | 35,977 |
| `public/assets/audio/scotland/dinnae-bad.mp3` | 58,964 |
| `public/assets/audio/scotland/dinnae-good.mp3` | 56,457 |
| `public/assets/audio/scotland/dinnae-ok.mp3` | 63,144 |
| `public/assets/audio/scotland/dinnae.mp3` | 50,187 |
| `public/assets/audio/scotland/intro.mp3` | 52,695 |
| `public/assets/audio/scotland/outro.mp3` | 60,636 |
| `public/assets/audio/scotland/result-local.mp3` | 161,480 |
| `public/assets/audio/scotland/result-neighbour.mp3` | 151,031 |
| `public/assets/audio/scotland/result-tourist.mp3` | 109,758 |
| `public/assets/audio/scotland/result-visitor.mp3` | 101,399 |
| `public/assets/audio/scotland/think-1.mp3` | 35,569 |
| `public/assets/audio/scotland/think-2.mp3` | 48,526 |
| `public/assets/audio/scotland/think-3.mp3` | 38,077 |
| `public/assets/audio/scotland/think-4.mp3` | 44,764 |
| `public/assets/audio/sfx/bad.mp3` | 34,305 |
| `public/assets/audio/sfx/glasgow-ambience.mp3` | 146,318 |
| `public/assets/audio/sfx/good.mp3` | 25,946 |
| `public/assets/audio/sfx/level.mp3` | 34,305 |
| `public/assets/audio/sfx/ok.mp3` | 25,946 |
| `public/assets/audio/sfx/start.mp3` | 8,820 |
| `public/assets/audio/sfx/tap.mp3` | 34,305 |
| `public/assets/images/npcs/hamish.webp` | 14,688 |
| `public/assets/images/npcs/otter.webp` | 12,472 |
| `public/assets/images/npcs/senga.webp` | 8,520 |
| `public/assets/images/world-map.webp` | 252,244 |
| `public/assets/models/cow.glb` | 4,435,272 |
| `public/assets/models/glasgow.glb` | 2,154,076 |
| `public/assets/models/otter.glb` | 4,715,984 |
| `public/assets/models/seagull.glb` | 1,491,628 |

## Appendix D — remainder of PRD section 3

Source: `docs/prd/PRD.md:261-316`.

```text
261: 2. **Free talk (AI).** Pick a character; up to 8 turns; trust starts at 30. Reach 100 to win, hit 0 to be
262:    busted, or run out of turns (counts as a win if trust is 65+). On every turn:
263:    - your recording goes to ElevenLabs Scribe for words,
264:    - the browser compares your voice's pitch and rhythm with the character's last line (a rough "ear"),
265:    - Claude, playing the character, returns a reply, mood, body action, trust change (-30 to +30), a tip,
266:      two "Try saying" suggestions (local phrase plus meaning), and sometimes a **"say it back"** phrase,
267:    - the server adds an **accent bonus or penalty** on top of the AI's call: up to ±6 normally, up to ±15 on
268:      "say it back" turns (then words and melody are compared with a clip of that exact phrase),
269:    - ElevenLabs speaks the reply in the character's voice.
270:    A **Scots word tray** (12 words: aye, wee, pal, how's it gaun, cannae/dinnae, ken, messages, scran,
271:    Irn-Bru, baltic, weans, pure dead) lights up with rising chimes; two or more new words in one answer is a
272:    "Patter combo". Weather and music warm up as trust rises. Win all three locals for **"LOCAL LEGEND"**.
273: 3. **Flower stall (scripted).** A hand-written branching dialogue (`src/content/flowers.json`): greet, offer,
274:    price, deal. Keyword "intents" move you along; local words raise her mood; topics (London, Glasgow, gran)
275:    trigger asides; mood ≥ 55 at the end means she buys. No AI, so it's free to run and fully predictable.
276: 4. **Lesson path.** UI only: 80 nodes (8 units: Hello and aye, At the chippy, Asking directions, Talking
277:    weather, On the bus, Down the pub, Fitba chat, Family and pals). Tapping does nothing yet. Streak (1) and
278:    gems (250) are hard-coded placeholders.
279: 
280: ### 3.4 Feel, audio and polish that exist
281: 
282: - **3D Glasgow street** (Buchanan Street, from a trip-photo reference, built by a Blender script): sandstone
283:   tenements, granite setts, the cone-headed statue, planters, rain with wet reflections, fog.
284: - **Meshy 3D characters**, rigged and animated (idle, talk, cheer, shrug, angry). The otter's face is code:
285:   eyebrows, blinks, blush and a **mouth that moves with the voice**.
286: - **Live "sing along" view:** while you talk, your pitch draws in blue over the local's amber melody, with a
287:   live **Match %** and a mic ring that grows with your volume.
288: - **ElevenLabs everything:** 22 voiced otter lines, 4 thinking lines, 4 level celebrations mixed over music
289:   stings, 7 SFX, Glasgow rain ambience, a 30-second fiddle-and-guitar music loop, a win sting. All logged with
290:   exact prompts in `assets/manifest.json`.
291: - Captions for every voice line, mute toggle, reduce-motion setting, phone landscape layout (844x390),
292:   hold-Space or hold-button to talk, mic permission asked up front.
293: 
294: ### 3.5 Tech that exists (summary; detail in sections 15 and 16)
295: 
296: | Layer | What |
297: | --- | --- |
298: | Client | Plain JavaScript ES modules, **Three.js** (3D), **Vite** (build), static output to `dist/` |
299: | Voice in | `MediaRecorder` in the browser, then **ElevenLabs Scribe** (`scribe_v1`) on the server |
300: | Accent ear | In-browser **YIN pitch tracking** + **DTW** melody comparison + loudness-rhythm comparison (`src/voice/pitch.js`) |
301: | Brain | **Claude** (`claude-opus-5-5`, low effort, JSON-schema output) per character prompt (`server/otter-prompt.js`) |
302: | Voice out | **ElevenLabs TTS** (`eleven_v3`, audio tags like `[laughs]`), designed voices per character |
303: | Server | One Node handler shared by the Vite dev server and **Vercel** functions: `POST /api/otter`, `POST /api/stt` |
304: | Tests | **Vitest**, 9 files, **55 tests passing** (pitch, DTW, matching, placement, conversation state, flowers, NPC server maths) |
305: | Assets | Meshy (characters), Blender (street, cleanup), ChatGPT/Gemini images (references), ElevenLabs (all audio) |
306: | Process | 3 lanes, GitHub issues as the message board between AI agents, PR per step, CI on every PR |
307: 
308: ### 3.6 How it was built (useful for the story we tell)
309: 
310: - **One day, three people, many AI agents** (Devin, Claude Code, Cursor). Repo created 14:12, 30 PRs merged
311:   by about 18:00.
312: - Lanes: (1) game shell and art, (2) voice scoring and backend, (3) voice, sound and music.
313: - Every generated asset is logged with its prompt (needed as proof for Chroma's tool awards).
314: 
315: ---
316: 
```
