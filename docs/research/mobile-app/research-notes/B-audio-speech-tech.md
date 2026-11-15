# Strand B — Audio, microphone, speech recognition and on-device analysis (Sound Local)
All sources read 2026-11-15 unless stated. [n] = numbered source list at the end. Labels: **UNVERIFIED** = could not confirm from a primary source; **ASSUMPTION / INFERENCE** = my own reasoning.

## 1. Key takeaways for the Sound Local decision (10 lines)
1. Web audio on phones works today: iOS Safari has getUserMedia + MediaRecorder (audio/mp4 since 14.3; audio/webm;codecs=opus since Safari 18.4), so one WebM/Opus path now covers Chrome, Firefox and Safari 18.4+ [3][4][5].
2. The biggest PWA problem on iOS is mic permission: Home Screen web apps ask again **on every launch** and there is no "always allow". WebKit bug 327237 (filed 2026-10-12) is still NEW [1][2]. Expect friction every time the app is opened.
3. iOS Web Audio is muted by the ringer/silent switch, and an AudioContext needs a user gesture (transient activation) before it will play. `navigator.audioSession` (Safari 16.4+, not in Chrome) lets you set "play-and-record"/"playback" to work around part of this [6][7][8][9].
4. Bluetooth earbuds drop to HFP/SCO as soon as the mic opens (8–16 kHz mono, and playback quality falls too). Accent audio sounds worse and mic capture is narrow-band. The fix is to design for it (use the phone mic, or wired headphones) on every platform, native included [10][11].
5. A Capacitor wrap keeps the Three.js/Web Audio code as it is. WKWebView has had getUserMedia since iOS 14.3, and iOS 15's `requestMediaCapturePermissionFor` delegate lets the app grant the mic without asking again (the native OS prompt appears once). This fixes takeaway 2 [12][13][14].
6. Free on-device speech-to-text exists on both OSes: Apple SFSpeechRecognizer (`requiresOnDeviceRecognition`), the new SpeechAnalyzer/SpeechTranscriber (iOS 26), and Android `createOnDeviceSpeechRecognizer` (API 31+). They are built for transcription, not accent scoring [18][19][20].
7. Open models for on-device accent/phoneme work are feasible but large. Whisper tiny/base/small are 75/142/466 MiB on disk. Moonshine Tiny/Base (27M/61M params) are MIT-licensed. wav2vec2 phoneme recognisers (IPA output) are ~355 MB as int8 ONNX [21][22][23][25][26].
8. Cloud scoring is cheap at small scale: ElevenLabs Scribe STT is $0.20/hr ($0.22/hr realtime). Azure Pronunciation Assessment is billed at Speech-to-Text Standard rates (~$1.32/hr reported; exact price UNVERIFIED). Speechace starts at $40/month [27][28][29][30].
9. Pitch analysis does **not** need a server. YIN and McLeod (MPM) run in real time in JS. pitchy (MIT) does it in the browser now. TarsosDSP (Java) and aubio (C, **GPL-3.0**: be careful with it in a closed-source app) cover native [31][32][33].
10. ElevenLabs paid plans give commercial rights to generated audio. Shipping pre-generated lines in an offline lesson pack looks allowed on a paid plan (INFERENCE; the full ToS text wasn't retrievable, so check the API terms). Built-in iOS/Android voices have no authentic Glaswegian; ElevenLabs Voice Library has Scottish voices [34][35][36][37][38].

## 2. Detailed findings

### Q1. Mobile browsers today
| Topic | iOS Safari / WebKit | Android Chrome | Source |
|---|---|---|---|
| getUserMedia permission, in a Safari tab | One-time grant by default. The browser forgets it when the page is closed. Chrome added "Allow this time" in M116 to match Firefox/Safari | Persistent "Allow on every visit" or one-time | [2] (Mozilla WebRTC blog, 2025-06-11) |
| Installed PWA (Home Screen) | Asks for camera/mic again **on every launch**, with no persistent option. WebKit bug 327237 (2026-10-12) is **NEW** (open). Older bug 215884: standalone mode re-prompted on route/hash changes, and in WKWebView after ~90 s | Normal Chrome site permissions apply to installed PWAs (ASSUMPTION; consistent with Chrome's permission model, not separately verified) | [1][15] |
| iOS 26 Home Screen | Every site added to the Home Screen now opens as a web app by default (users can turn this off) | n/a | [16][17] |
| MediaRecorder formats | audio/mp4 (AAC) since iOS 14.3. **Safari 18.4 (2025-03-31)** added WebM with Opus (+VP8/VP9), fragmented MP4, and ALAC/PCM | audio/webm;codecs=opus | [3][4][5] |
| AudioContext unlock | Needs a user gesture. Since WebKit PR 6529, a "transient" user activation is enough, so async code after a click works. If the page is already capturing the mic, WebAudio may autoplay (`document.isCapturing()` in WebKit source) | Autoplay policy: user gesture needed | [8][9] |
| Ringer / silent switch | Web Audio is muted when the iPhone is on silent; `<audio>`/`<video>` are not (WebKit bug 237322). The common workaround is to play a silent `<audio>` element | n/a | [6][7] |
| navigator.audioSession | Safari **16.4+** (iOS mirrors it). Types: auto, playback, transient, transient-solo, ambient, play-and-record. W3C Working Draft 2024-11-13. Not in Chrome | Not supported | [8a][8b] (MDN BCD, W3C TR) |
| echoCancellation / noiseSuppression / autoGainControl | All three default to true in Chrome, Firefox and Safari (w3c/mediacapture-main #777). The echoCancellation constraint is supported in Safari/Chrome per caniuse. Whether noiseSuppression/AGC can be **turned off** on iOS: UNVERIFIED | Supported | [39][40] |
| Bluetooth headset mic | Opening the mic switches A2DP → HFP/SCO. Mic is 8 kHz (NBS) or 16 kHz (WBS/AirPods) and playback quality drops. WebKit bug 311451 (2026-04): "Degraded audio quality with microphone enabled" | Same protocol limit | [10][11][41] |
| Web Speech API SpeechRecognition | `webkitSpeechRecognition` since Safari 14.1, "powered by the same speech engine as Siri", needs Siri enabled. It can switch between on-device and server (WebKit docs issue #120). No `processLocally` | Unprefixed since Chrome 139. Audio goes to Google servers by default. `processLocally`/`available()`/`install()` are in Chrome 139 **desktop** per MDN BCD; Chrome Android: **not supported** per BCD. A BCD PR noted the feature may have slipped to Chrome 142 (conflict, UNVERIFIED) | [42][43][44][45][46] |
| WebGL2 / Three.js memory | WebKit removed its separate canvas memory cap (PR 14375, 2023). Pages now hit the general process memory limit and get **jetsam-killed** instead. WebKit bug 300782 (2025-10): WebGL/texture-heavy pages go into a reload loop under memory pressure, worse on low-memory devices | Usually more headroom; device-dependent (ASSUMPTION) | [47][48] |
| Perf notes | WebKit bug 276959: `powerPreference: "high-performance"` gave 20 fps vs 120 fps with "default" on iPhone 12 / Safari 17.5. Shader precision problems on Apple GPUs reported 2026-10 | — | [49][50] |
| Battery / thermal | No primary-source numbers found. UNVERIFIED. INFERENCE: continuous mic + WebGL rendering + network will heat phones; cap the frame rate and pause rendering while recording | — | — |

### Q2. Inside wrapped apps (Capacitor, WebView)
| Item | Finding | Source |
|---|---|---|
| WKWebView getUserMedia | Exposed from iOS 14.3 if the host app can capture natively (has `NSMicrophoneUsageDescription`). Gated by a prompt like Safari's | [3] |
| iOS 15 permission delegate | `WKUIDelegate.webView(_:requestMediaCapturePermissionFor:initiatedByFrame:type:decisionHandler:)`. The app returns `.grant`/`.deny`/`.prompt`, so after the one-time OS mic permission the app can stop the web prompts. Before iOS 15, web prompts only | [12][13][14] |
| Android WebView | `WebChromeClient.onPermissionRequest` → `PermissionRequest.grant([RESOURCE_AUDIO_CAPTURE])` on the UI thread, plus the `RECORD_AUDIO` runtime permission. Capacitor's `BridgeWebChromeClient` handles this; a Capacitor getUserMedia bug was reported (issue #6967) | [51][52][53] |
| @capacitor-community/speech-recognition | v7.0.1 (2025-06-09), MIT, ~36K weekly downloads. Wraps SFSpeechRecognizer / Android SpeechRecognizer. Methods: available, start, stop, getSupportedLanguages, partialResults listener, permissions | [54] |
| capacitor-voice-recorder | v7.0.6, MIT, ~69K weekly downloads, Capacitor ≥7. Native recording, needs RECORD_AUDIO / NSMicrophoneUsageDescription | [55] |
| @capacitor/haptics | v8.0.2 (2026-03-27), ~639K weekly downloads. Capacitor 9 versions in pre-release (9.0.0-next.2, 2026-11-06) | [56] |

INFERENCE: Capacitor solves the iOS PWA re-prompt problem and adds haptics and native recording without rewriting the Three.js game. The ringer-mute and HFP problems are still there unless the native side sets AVAudioSession (`playAndRecord`) through a plugin.

### Q3. Native audio
| Platform | API | Notes | Source |
|---|---|---|---|
| iOS | AVAudioSession categories | `playAndRecord` is **not** silenced by the Ring/Silent switch. `ambient`/`soloAmbient` are | [57] |
| iOS | Modes | `voiceChat` (playAndRecord; adds Apple voice processing), `gameChat`, `videoChat`, `measurement` (minimal system processing, good for analysis) | [57][58] |
| iOS | Voice processing IO | `AVAudioEngine.inputNode.setVoiceProcessingEnabled(true)` (WWDC19) turns on AEC, noise suppression and AGC. WWDC23 added control of ducking and muted-talker detection | [59][60] |
| Android | Oboe / AAudio | C++ library. Uses AAudio on API 27+ and OpenSL ES on older versions. Checklist: LowLatency performance mode, Exclusive sharing, 48 kHz, data callbacks | [61][62] |
| Android | AcousticEchoCanceler | `AcousticEchoCanceler.create(audioSessionId)`; `isAvailable()` checks for device support. It may already be on by default for some AudioSources. Android 10+ should provide AEC for `VOICE_COMMUNICATION` | [63][64] |
| Android | AudioSource | `VOICE_RECOGNITION` (tuned for ASR) and `UNPROCESSED` (raw, if the device supports it; check `PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED`) | [65][66] |

INFERENCE for pronunciation analysis: prefer minimal processing (iOS `measurement`, Android `VOICE_RECOGNITION`/`UNPROCESSED`). Echo cancellation and noise suppression can change formants/pitch. Use voiceChat-style processing only for live NPC conversation through the speaker.

### Q4. On-device speech recognition and pronunciation scoring
| Option | Platform | Size / perf | Licence / cost | Source |
|---|---|---|---|---|
| SFSpeechRecognizer + `requiresOnDeviceRecognition` | iOS 13+ | System model. Some languages need the network; check `isAvailable`. Server use is rate-limited | Free | [18][67] |
| WWDC23 custom language model | iOS 17+ | Custom vocabulary with **X-SAMPA pronunciations** (helps with recognising dialect words, but is not scoring) | Free | [68] |
| SpeechAnalyzer / SpeechTranscriber | iOS 26 (WWDC25) | New on-device model used in Notes/Voice Memos. Language assets are downloaded through `AssetInventory` and shared across apps. `SpeechTranscriber.supportedLocales` is empty on unsupported devices | Free | [19][69][70] |
| Android SpeechRecognizer on-device | API 31+ | `createOnDeviceSpeechRecognizer`; throws if `isOnDeviceRecognitionAvailable` is false; `ERROR_LANGUAGE_UNAVAILABLE` | Free | [20] |
| whisper.cpp | iOS/Android (C/C++); RN binding whisper.rn 0.7.4 (MIT) | Disk: tiny 75 MiB, base 142 MiB, small 466 MiB, medium 1.5 GiB. Memory (README): ~273/388/852 MB | MIT | [21][71] |
| WhisperKit (Argmax OSS Swift) | iOS/macOS (Core ML) | Model folders ~75 MB (tiny), ~145 MB (base). Pro SDK adds Android/Kotlin and a local server for non-native apps. iPhone latency figures: UNVERIFIED | OSS (MIT per repo; Pro is commercial) | [22][72][73] |
| Moonshine | Cross-platform (ONNX) | Tiny 27.1M params, Base 61.5M (~237 MB on disk per a third-party doc). No 30-second padding, so short utterances are fast | MIT for English and all streaming models; some legacy non-English models are non-commercial | [23][74][75] |
| Vosk | Android/iOS | Small models ~50 MB, ~300 MB RAM | Apache-2.0 | [24] |
| Picovoice Cheetah/Leopard | All | — | Free = strictly non-commercial. Foundation (startups <5 yrs, <20 staff) **$6,000/yr**, 25K min/month. Enterprise from $30,000/yr | [76] |
| wav2vec2 phoneme (facebook/wav2vec2-lv-60-espeak-cv-ft, xlsr-53-espeak) | ONNX / transformers.js (browser possible) | Outputs espeak IPA phones at 50 fps. Int8 ONNX export is 355 MB. Used for GOP pronunciation scoring by an ESL app (Sonari) | Apache-2.0 (UNVERIFIED for the specific checkpoints) | [25][26][77][78] |
| Allosaurus | Python | Universal phone recogniser, 2000+ languages | GPL-3.0 (UNVERIFIED) | [79] |

Accent robustness: on the Edinburgh International Accents of English corpus, ASR WER is much higher than the 2.7% on US English, with big drops for Indian, Jamaican and Nigerian English [80]. Distilled Whisper models are less robust on diverse accents [81]. A JASA 2026 study found Whisper and humans similarly sensitive to Spanish-accented English [82]. INFERENCE: for a game that *wants* a regional accent (e.g. Glaswegian), standard ASR tends to "normalise" accents into standard spelling. Scoring accent authenticity needs phone-level comparison (wav2vec2 phonemes + forced alignment/GOP) or prosody/pitch features, not word transcripts.

Vendor pronunciation assessment:
| Vendor | What | Price | Source |
|---|---|---|---|
| Apple / Google | **No public pronunciation-assessment API found** (Apple's custom LM accepts pronunciations but does not score them). UNVERIFIED that none exists | — | [68] |
| Microsoft Azure Pronunciation Assessment | Accuracy/fluency/completeness/prosody scores; streaming | "Costs the same as speech to text for Standard or commitment tier pricing". A Microsoft Q&A answer (2025-11-04) quotes $1.32/hr; the pricing page didn't render, so the exact number is UNVERIFIED | [28][29] |
| Speechace | Word/sentence/phoneme scores, en-US/en-GB | Basic $40 (5,000 15-second requests, then $0.008 per 15 s); $125/$250/month plans | [30] |
| ElevenLabs Scribe (STT only, no scoring) | 90+ languages, word timestamps | Scribe v2/v3 **$0.20/hr**, Realtime/v3 Live **$0.22/hr**, keyterm prompting +$0.05/hr. TTS $0.08 per 1K chars (multilingual) or $0.04 (Flash/Turbo) | [27] |

### Q5. On-device pitch analysis
| Library | Algorithm | Platform | Licence | Source |
|---|---|---|---|---|
| pitchy 4.1.0 | McLeod Pitch Method; "fast and accurate enough… real-time… tuners" | JS/browser (ESM) | MIT | [31] |
| TarsosDSP | YIN (port of aubio), MPM, FFT-YIN etc. | Java/Android | GPL-3.0 (UNVERIFIED) | [32] |
| aubio | YIN, YINFFT, others | C, with iOS/Android builds | **GPL-3.0** | [33] |
| Swift options (e.g. AudioKit's pitch tap) | — | iOS | UNVERIFIED (not checked) | — |

INFERENCE: YIN/MPM on 1–2K-sample frames at 44.1/48 kHz is a few hundred thousand multiply-adds per frame, trivial for a phone CPU. Pitch analysis needs no server. Keep it on the client in every option (PWA, Capacitor, native). Server round-trips are only needed for ASR/LLM/TTS.

### Q6. On-device TTS vs ElevenLabs; caching
| Item | Finding | Source |
|---|---|---|
| AVSpeechSynthesizer | Default/enhanced/premium voice quality levels. Enhanced/premium voices (>100 MB each) must be downloaded **manually by the user** in Settings. Personal Voice (iOS 17) is the user's own voice. Locales include en-GB, en-IE, en-AU etc. No Scottish/Glaswegian voice found (UNVERIFIED that none exists) | [83][84] |
| Android TTS | Google engine; offline voices downloaded by the user. If en-GB data is missing it silently falls back to en-US. Regional variety is limited to locale-level voices | [85][86] |
| ElevenLabs accents | Voice Library has Scottish voices (e.g. "thick Scottish Highland accent" community voices) and a Scottish-accent TTS page. Library voices are not available via the API on the free tier | [36][37] |
| Commercial rights | Free plan: non-commercial only, and attribution is required. All paid plans include a commercial licence | [34][35] |
| Caching / offline lesson pack | ToS defines Output as generated audio; paid users may use it commercially. A secondary summary (terms.law, 2026-03) says paid-plan output can be used "perpetually", even after the subscription ends. I could not find an explicit clause on caching or bundling; the full ToS / ElevenAPI terms were not machine-readable. **INFERENCE: bundling pre-generated lines in the app on a paid plan is allowed; confirm clause-by-clause in https://elevenlabs.io/terms-of-use and https://elevenlabs.io/elevenapi-terms (and the Voice Library Addendum if community voices are used)** | [34][35][38][87][88] |

INFERENCE: pre-generating fixed lesson lines once (paid plan) and shipping them as compressed audio cuts per-user TTS cost to zero. Only dynamic NPC replies (Claude → TTS) would need live ElevenLabs calls.

## 3. Sources (all read 2026-11-15)
1. https://bugs.webkit.org/show_bug.cgi?id=327237 — [iOS] Home Screen web apps ask for camera/microphone permission again on every launch (status NEW)
2. https://blog.mozilla.org/webrtc/one-time-permissions-are-here-to-stay/ — One-time permissions are here to stay (2025-06-11)
3. https://webkit.org/blog/11353/mediarecorder-api/ — MediaRecorder API (WebKit, 2020-11-23; also getUserMedia in WKWebView)
4. https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ — WebKit Features in Safari 18.4
5. https://media-codings.com/articles/recording-cross-browser-compatible-media — Recording cross browser compatible media
6. https://bugs.webkit.org/show_bug.cgi?id=237322 — webaudio api is muted when the iOS ringer is muted
7. https://nattog.dev/blog/web-audio-ios-unmute — Avoiding unmuting iOS devices for the Web Audio API
8a. https://github.com/mdn/browser-compat-data (api/AudioSession.json) — MDN BCD AudioSession: Safari 16.4, Chrome no
8b. https://www.w3.org/TR/audio-session/ — Audio Session (W3C WD 2024-11-13); https://developer.mozilla.org/en-US/docs/Web/API/Navigator/audioSession
8. https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/webaudio/AudioContext.cpp — WebKit AudioContext autoplay source
9. https://github.com/WebKit/WebKit/pull/6529 — Only require a "transient" user activation for Web Audio rendering
10. https://livetranslator.hashnode.dev/six-things-that-break-when-you-build-real-time-speech-translation-in-a-browser — Six things that break… (Bluetooth HFP)
11. https://github.com/mikeg-dal/QK4/pull/102 — HFP 8 kHz NBS / 16 kHz WBS note
12. https://developer.apple.com/documentation/webkit/wkuidelegate/webview(_:requestmediacapturepermissionfor:initiatedbyframe:type:decisionhandler:) — Apple docs
13. https://wwdcnotes.com/documentation/wwdc21-10032-explore-wkwebview-additions/ — WWDC21 Explore WKWebView additions
14. https://docs.trustx.com/trust/ios-webview-integration — iOS WebView integration (iOS 15 delegate)
15. https://bugs.webkit.org/show_bug.cgi?id=215884 — getUserMedia recurring permission prompts in standalone
16. https://www.macrumors.com/2025/06/18/safari-changes-on-ios-26/ — Safari changes on iOS 26
17. https://www.heise.de/en/news/iOS-26-and-iPadOS-26-Changed-web-app-behaviour-on-the-home-screen-10749652.html
18. https://developer.apple.com/documentation/speech/sfspeechrecognizer — SFSpeechRecognizer
19. https://developer.apple.com/videos/play/wwdc2025/277/ — SpeechAnalyzer (WWDC25)
20. https://developer.android.com/reference/android/speech/SpeechRecognizer — createOnDeviceSpeechRecognizer
21. https://github.com/ggml-org/whisper.cpp (and models/README.md) — model sizes / memory
22. https://github.com/argmaxinc/argmax-oss-swift — Argmax OSS SDK (WhisperKit)
23. https://github.com/usefulsensors/moonshine/blob/main/LICENSE — Moonshine licence
24. https://alphacephei.com/vosk/models — Vosk models; https://github.com/alphacep/vosk-api
25. https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
26. https://huggingface.co/KXRM/wav2vec2-lv-60-espeak-cv-ft-onnx — int8 ONNX 355 MB
27. https://elevenlabs.io/pricing/api — ElevenLabs API pricing
28. https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
29. https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat (2025-11-04); https://azure.microsoft.com/en-us/pricing/details/speech/
30. https://www.speechace.com/api-plans/ — Speechace API plans
31. https://www.npmjs.com/package/pitchy — pitchy
32. https://0110.be/releases/TarsosDSP/TarsosDSP-latest/TarsosDSP-latest-Documentation/be/tarsos/dsp/pitch/Yin.html
33. https://github.com/aubio/aubio — aubio (GPL-3.0)
34. https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform
35. https://elevenlabs.io/terms-of-use — ElevenLabs Terms (non-EEA)
36. https://elevenlabs.io/text-to-speech/scottish-accent ; https://elevenlabs.io/voice-library/accent-generator
37. https://elevenlabs.io/docs/eleven-creative/voices/voice-library
38. https://terms.law/ai-output-rights/elevenlabs/ (secondary, 2026-03-12)
39. https://github.com/w3c/mediacapture-main/issues/777 — default constraints
40. https://caniuse.com/mdn-api_mediadevices_getsupportedconstraints_return_object_property_echocancellation
41. https://bugs.webkit.org/show_bug.cgi?id=311451 — Degraded audio quality with microphone enabled (2026-04)
42. https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/ — Safari 14.1 speech recognition
43. https://github.com/WebKit/Documentation/issues/120 — interimResults / on-device vs cloud in WebKit
44. https://developer.chrome.com/blog/new-in-chrome-139 — On-device Web Speech API
45. https://github.com/mdn/browser-compat-data (api/SpeechRecognition.json) and PR #27901
46. https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md
47. https://github.com/WebKit/WebKit/pull/14375 — remove canvas memory limit
48. https://bugs.webkit.org/show_bug.cgi?id=300782 — iOS Safari reload loop under memory pressure with WebGL
49. https://bugs.webkit.org/show_bug.cgi?id=276959 — powerPreference high-performance causes bad performance
50. https://dark-moon.org/blog/webgl-performance-low-end-devices/ (2026-10-25)
51. https://developer.android.com/reference/android/webkit/PermissionRequest
52. https://github.com/ionic-team/capacitor/blob/main/android/capacitor/src/main/java/com/getcapacitor/BridgeWebChromeClient.java
53. https://github.com/ionic-team/capacitor/issues/6967
54. https://registry.npmjs.org/%40capacitor-community%2Fspeech-recognition
55. https://www.npmjs.com/package/capacitor-voice-recorder
56. https://capacitorjs.com/docs/apis/haptics ; https://github.com/ionic-team/capacitor-haptics/releases
57. https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioSessionCategoriesandModes/AudioSessionCategoriesandModes.html
58. https://developer.apple.com/documentation/avfaudio/avaudiosession/mode-swift.struct/voicechat
59. https://developer.apple.com/videos/play/wwdc2019/510/ — What's New in AVAudioEngine
60. https://developer.apple.com/videos/play/wwdc2023/10235/ — What's new in voice processing
61. https://github.com/google/oboe
62. https://developer.android.com/games/sdk/oboe/low-latency-audio
63. https://developer.android.com/reference/android/media/audiofx/AcousticEchoCanceler
64. https://source.android.com/docs/core/audio/implement-pre-processing
65. https://developer.android.com/reference/android/media/MediaRecorder.AudioSource
66. https://android.googlesource.com/platform/compatibility/cdd/+/refs/tags/android-wear-p-preview-2/5_multimedia/5_11_unprocessed-audio.md
67. https://developer.apple.com/videos/play/wwdc2019/256/ — Advances in Speech Recognition
68. https://developer.apple.com/videos/play/wwdc2023/10101/ — Customize on-device speech recognition
69. https://developer.apple.com/documentation/speech/speechtranscriber
70. https://apple-docs.everest.mt/docs/speech/assetinventory/ (mirror of Apple docs)
71. https://github.com/mybigday/whisper.rn ; https://www.npmjs.com/package/whisper.rn
72. https://huggingface.co/argmaxinc/whisperkit-coreml
73. https://github.com/duggan/filetranscriber/blob/main/Sources/FileTranscriber/Engine/ModelCatalog.swift (WhisperKit model download sizes)
74. https://huggingface.co/moonshine-ai/moonshine-tiny ; https://huggingface.co/moonshine-ai/moonshine-base
75. https://voxtype.io/docs/MOONSHINE
76. https://picovoice.ai/pricing/
77. https://huggingface.co/duyentq/sonari-wav2vec2-phoneme-int8
78. https://huggingface.co/qnighy/wav2vec2-xlsr-53-espeak-cv-ft-ONNX
79. https://github.com/xinjli/allosaurus
80. https://arxiv.org/abs/2303.18110 — Edinburgh International Accents of English Corpus
81. https://huggingface.co/blog/Steveeeeeeen/how-biaised-is-whisper (2025-01-29)
82. https://doi.org/10.1121/10.0046916 — Whisper ASR and humans similarly sensitive to accent (2026-10)
83. https://bendodson.com/weblog/2024/04/03/using-your-personal-voice-in-an-ios-app/
84. https://developer.apple.com/videos/play/wwdc2023/10033/
85. https://www.technobezz.com/how-to-enable-google-text-to-speech-on-andro-4hq
86. https://stackoverflow.com/questions/50061004/tts-locale-ignored
87. https://elevenlabs.io/elevenapi-terms
88. https://elevenlabs.io/vla — Voice Library Addendum
