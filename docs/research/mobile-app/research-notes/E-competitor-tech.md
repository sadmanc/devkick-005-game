# Strand E: Competitor and comparable apps: what they are built with and how they ship
All sources were read on 2026-11-15 unless noted. Store figures come from US storefront pages as fetched today. [n] refers to the Sources list. Labels: **UNVERIFIED** means weak or secondary evidence. **INFERENCE/ASSUMPTION** means my own reasoning.

## 1. Key takeaways for the Sound Local decision (10 lines)
1. Every serious speaking or accent competitor ships **native-store iOS + Android apps as its main product**. The web is either a funnel for signup and payment (Speak, BoldVoice, ELSA) or a reduced version (Duolingo). Loora has no web version at all [1][2][3][4][5][6][17][24][25][27].
2. The stacks vary, and all of them work: Duolingo uses fully native Kotlin and Swift [8][9]. ELSA moved from native to **Flutter** [12][13]. BoldVoice uses **React Native** for iOS and Android plus a React webapp [16]. Speak is native, judging by its Swift/Kotlin job ads [21][22]. Praktika uses **Unity** for its avatars [29][30]. Babbel is native with shared **Kotlin Multiplatform** logic, after it pulled an earlier React Native integration from production [32][33].
3. The closest "wrap the web app" example is **Pronounce/Speakerly**. Its Play package is `com.getpronounce.app.twa`, which points to a Trusted Web Activity (a PWA wrapper; INFERENCE). It has 3.6★ from 134 reviews and 100K+ downloads [37][38]. This proves the approach can ship, but it is no proof of success.
4. For animated characters, the category standard is **Rive**, not 3D game engines. Duolingo uses Rive for lip-synced World Characters on Android, iOS and Web, and Rive drives Lily's real-time AI Video Call [10][11][39]. ELSA also uses Rive teachers with viseme lip-sync (portfolio source, weaker) [15].
5. **The only 3D/"realistic avatar" leader, Praktika, uses Unity**, which a team of non-coders would struggle to maintain [29][30][31]. Sound Local's Three.js scene has no direct mobile-store analogue among these apps (INFERENCE).
6. Speech stacks start on vendor APIs and move to in-house models as they scale. Speak was an OpenAI Whisper API launch partner, then moved to a fine-tuned Conformer-CTC model running on its servers [18][19]. ELSA and Duolingo run in-house ASR and pronunciation models [12a][14][40]. BoldVoice fine-tuned HuBERT [20]. Cloud ASR is the norm, and Speak explicitly **dropped on-device models** because older devices could not run them well [19].
7. Real-time voice calls run over **WebRTC**: Speak uses LiveKit Cloud [23][23a]. That is the likely next step past Sound Local's record-then-upload MediaRecorder flow (INFERENCE).
8. Pricing: speaking apps charge about $84–$165/yr (Speak, BoldVoice) and ELSA about $90–$100/yr on the web. Prices differ by channel: BoldVoice web is $149.99/yr, while the US App Store lists $99.99–$199.99 variants (secondary source) [16a][26][26a][34][35]. Duolingo does not sell Max on the web [41].
9. Mobile retention features are a moat. Duolingo reports that half the learners with its streak widget have streaks of 6+ months, and it runs Live Activities (it was criticised in Jan 2026 for showing ads in them) [42][43]. A PWA cannot offer iOS widgets or Live Activities (INFERENCE, standard platform fact; see the platform strand).
10. Scale for context: Duolingo had 64.9M DAU and 13.1M paid subscribers in Q3 2026 [44]. Praktika reports 15M downloads and 2M+ MAU [45]. BoldVoice reports 2M+ users and is in the top ~100 US Education apps on iOS [3][16]. The niche accent apps (BoldVoice, ELSA) win on feedback quality, not on graphics.

## 2. Detailed findings

### 2.1 ELSA Speak (ELSA Corp, SF / Vietnam)
| Item | Finding | Src |
|---|---|---|
| Platforms | iOS (iPhone, iPad) and Android. "Speech Analyzer" was built as a desktop **browser** tool and is also an app component. The web shop sells plans. The web is not the full lesson app (INFERENCE from product descriptions). | [1][12a][28] |
| Mobile stack | **Flutter.** A 2024 TopDev article describes ELSA moving from Native to Flutter. A current ELSA job ad says "We operate a Flutter-based ecosystem with 50 million users". Another job is "Full Stack Engineer (Flutter Focus)". echoloc lists Go/Python/Vue/Flutter (inferred from hiring data, so weaker). | [12][13][13a][13b] |
| Backend | AWS: EKS, EC2 Spot, DynamoDB and RDS. 4M+ user recordings processed per day (AWS case study, 2021). | [7] |
| Speech tech | Proprietary ASR built in-house, with "very low word error rates on non-native speech", plus speaker identification (ISCA SLaTE 2023 paper). Azure OpenAI appears on ELSA's subprocessor list per StrataDB (secondary; UNVERIFIED that it is used for speech). | [12a][14][14a] |
| Animation | ELSA has an animated character, "Planet", plus four human teachers built in **Rive** with viseme-table lip-sync (artist portfolio; UNVERIFIED by ELSA). | [15] |
| Pricing | Web (third-party readings of elsaspeak.com, Oct/Nov 2026): Pro $89.99/yr, Premium $99.99/yr, Professional $159.99/yr. An affiliate landing page shows Pro 1-yr $85.19 and lifetime $119.99. 7-day free trial (official). App Store prices were not extracted (UNVERIFIED). | [26][26a][26b][26c] |
| Ratings | iOS 4.7★ / 115K ratings. Play 4.6★ / 1.02M reviews / 10M+ downloads. | [1][2] |
| Users | "Downloaded more than 50 million times" (ISCA 2023 paper). "50 million users" (job ad). | [12a][13] |

### 2.2 Duolingo
| Item | Finding | Src |
|---|---|---|
| Platforms | iOS, Android and Web. **Duolingo Max cannot be purchased on web**. Max (Video Call, Roleplay) is on the iOS and Android apps only. A third-party 2026 comparison says only mobile gets Video Call, Roleplay, widgets and haptics (UNVERIFIED in detail). | [41][46] |
| Android | 100% Kotlin since 2020 (migrated from Java). The Android Developers case study reports a ~30% line-count reduction. | [8][8a] |
| iOS | Swift. A July 2025 engineering post covers scaling MVVM with Swift Macros. They have been using Swift since 2015. | [9][9a] |
| Animation | **Rive** for World Characters' lip-sync. The file size had to be "small enough to run on Android, iOS, and the Web". They chose Rive as "an alternative to a game engine", and its State Machine drives the visemes. Viseme timing comes from Duolingo's **in-house speech recognition and pronunciation models**. Rive's case study (Mar 2025) and Rive's CEO say Rive's state machine drives Lily's mouth, expressions and camera in Video Call. Lily ships "in under a megabyte" (third-party write-up; UNVERIFIED). Duolingo created a "creative technologist" role for Rive work. | [10][11][39][39a][39b] |
| Speech / AI | TTS uses Microsoft custom neural voices, one per character. Max launched Mar 2023 on OpenAI GPT-4. Duolingo researchers published fine-tuned ASR results (4.2% WER vs 9.6% for a Whisper baseline) at SLaTE 2025. | [40][47][48] |
| Video Call | Launched Sep 2024 with Lily. Calls last about 1–3 min. Falstaff "guided" calls started on iOS first (Jan 2026). | [49][50] |
| Pending change | **Max is being phased out.** No new Max sales from Nov 2026. Individual Max subscribers move to Super Family at the same price. Unlimited Video Call comes to all Super subscribers by end-2026, per the Q3 2026 shareholder letter as reported by Observer and Yahoo Finance. | [51][52] |
| Pricing | Duolingo publishes no official price list. In the NL App Store, Super is €10.49–€13.99/mo and €89.99–€131.99/yr (third party, 2026-11-13). Max was historically about $29.99/mo in the US (third party; UNVERIFIED). | [53][54] |
| Mobile features | Streak home-screen widget (iOS and Android). "Half of the learners with the widget installed have a streak of at least 6 months." Push notifications. Live Activities on iOS: MacRumors reported in Jan 2026 that Duolingo showed ads in Live Activities/Dynamic Island, against Apple's guidelines. | [42][43] |
| Ratings | iOS 4.7★ / 5.6M ratings, #1 Education, Editors' Choice. Play 4.7★ / 51.9M reviews / 500M+ downloads. | [55][56] |
| Users | Q3 2026: 64.9M DAU (+29% YoY), 13.1M paid subscribers, $309.0M revenue. | [44] |

### 2.3 BoldVoice (Wellocution Inc., NYC, YC)
| Item | Finding | Src |
|---|---|---|
| Platforms | iOS, Android and web signup ("sign up on web"). The webapp's role is unclear: the job ad lists "React (CMS, Webapp)". | [16][24] |
| Stack | **React Native (iOS & Android), React (CMS, Webapp), Node/Express, PostgreSQL**, per the official YC job ad (current). | [16] |
| Speech tech | In-house ML. An "accent fingerprint" model fine-tuned from **HuBERT**. A third-party summary says it was trained on ~30M samples / ~25k hours (UNVERIFIED). They also have an "accent strength" metric. | [20][20a][20b] |
| Content | 500+ videos from Hollywood dialect coaches, plus sound-level AI feedback and interactive mouth diagrams. | [3][16a] |
| Pricing | **Web (official checkout): $24.99/mo or $149.99/yr ($12.49/mo), 7-day trial.** US App Store variants: $14.99/$24.99 per month and $99.99–$199.99 per year (third party, 2026-10-23; UNVERIFIED). | [16a][34] |
| Ratings | iOS 4.8★ / 54K, #101 Education. Play 4.7★ / 12.8K / 1M+. Claims "over 2 million global users". | [3][4] |

### 2.4 Speak (Speakeasy Labs, SF; OpenAI-backed)
| Item | Finding | Src |
|---|---|---|
| Platforms | iOS and Android. speak.com handles signup and trial, then sends users to download the app. I found no full web learning app (INFERENCE). | [17] |
| Stack | Native apps, judging by job ads: Senior Android Engineer (Kotlin) and iOS Engineer (Swift, MVVM). Bitrise has been their CI/CD for 7 years. The exact UI framework is not confirmed (UNVERIFIED beyond the job ads). | [21][22][57] |
| Speech tech | Launch partner for the OpenAI Whisper API (Mar 2023). By Jun 2024 they had **replaced fragmented on-device and third-party ASR with their own backend streaming Conformer-CTC model** (NVIDIA NeMo, fine-tuned on thousands of hours of accented learner speech), giving a >60% WER reduction. They say on-device models were "challenging" because of the long tail of old devices. Matching pipeline v2 combines ASR and phonetic models. | [18][19][58] |
| Real-time voice | Mobile apps connect over **WebRTC via LiveKit Cloud** to voice-agent servers running cascade or speech-to-speech pipelines (Mar 2026). AI Tutor Call (Oct 2026) began as a realtime speech-to-speech model in a LiveKit room. Listening, judging and orchestration have since moved into code, with a custom turn detector. Live tutor lessons use OpenAI "GPT-Live-1" (blog title, Aug 2026). | [23][23a][23b] |
| Pricing | US App Store (third party, Aug/Oct 2026): Premium $17.99/mo or $83.99/yr; Premium Plus $39.99/mo or $164.99/yr. Android Authority gives $18/$84 and $40/$165. Japan (official speak.com page, 2026-10-21): ¥3,800/mo or ¥19,800/yr; Plus ¥5,800/mo or ¥29,800/yr. | [35][35a][35b] |
| Ratings | iOS 4.8★ / 67K, #25 Education. Play 4.8★ / 127K / 10M+. Google Play "Best App of 2024" in Hong Kong, Korea and Taiwan. Raised a $78M Series C at a $1B valuation (Dec 2024). | [5][6][58a] |

### 2.5 Praktika (AI avatars)
| Item | Finding | Src |
|---|---|---|
| Platforms | iOS and Android (Amplitude case study). | [45] |
| Rendering | **Unity** avatars: there is a Praktika "Avatars Squad Lead" who is a Unity developer, plus a "Senior Unity Developer (Android, iOS)" job (Dec 2024). A directory says "GPT-4 + Unity Avatars + 11labs" (weak; UNVERIFIED for ElevenLabs). | [29][30][31] |
| AI | Multi-agent design on OpenAI models: Lesson Agent (GPT-5.2), Student Progress Agent (GPT-5.2), Learning Planning Agent (GPT-5 Pro), with persistent memory (OpenAI case study, Jan 2026). | [59] |
| Ratings | iOS 4.7★ / 169K (search snapshot of the listing; the direct fetch failed). Play 4.6★ / 1.35M / 10M+. | [60][61] |
| Users | "15 million downloads and over 2 million monthly active users last year", with revenue up 20x from 2023 to 2024 (company, on Amplitude's blog, Jan 2026). AlphaMoat estimates ~1.1M downloads and ~$1.4M IAP in Oct 2026 (estimate; UNVERIFIED). | [45][62] |

### 2.6 Babbel
| Item | Finding | Src |
|---|---|---|
| Stack | Native Swift and Kotlin apps. In 2020 a web team embedded **React Native** via Electrode Native. That integration was **"removed from production two years after"** it was written up. Since 2026 they share business logic with **Kotlin Multiplatform** while keeping UI native, which they say "more than doubled" capacity alongside AI-assisted development. | [32][33][33a] |
| Platforms | Web, iOS and Android. | [32] |
| Ratings | iOS 4.7★ / 758K. Play 4.6★ / 1.13M / 50M+. | [63][64] |

### 2.7 Loora, Pronounce/Speakerly, Say It
| App | Platforms / stack | Speech | Ratings (today) | Src |
|---|---|---|---|---|
| Loora | **Mobile-only.** The support site says there is no web version yet and one is "in development". The iOS listing says "Only for iPhone" but support says iPad works (inconsistent). Stack is not public. | Says it uses its own "bespoke system" of LLMs (marketing). | iOS 4.9★ / 41K. Play 4.9★ / 371K / 10M+ (search snapshot). | [27][27a][65][66] |
| Pronounce → Speakerly AI | Web, iOS, Android and a Chrome extension. Android package `...app.twa` points to a **Trusted Web Activity wrapper of the web app** (INFERENCE from the package name). | Not public | Play 3.6★ / 134 / 100K+. Pro from $12/mo. | [37][38] |
| Say It: English Pronunciation (Phona Ltd, with Oxford content) | iOS and Android. Shows the soundwave so users can record and compare. | Not public | iOS 4.1★ / 248 (search snapshot). | [67][67a] |

### 2.8 3D/animated-character language apps on mobile: how they render
| App | Character tech | Evidence strength | Src |
|---|---|---|---|
| Duolingo (World Characters, Lily Video Call) | **Rive** 2D state machines with viseme lip-sync, running on Android, iOS and Web | Strong (first-party and vendor) | [10][11][39] |
| ELSA (Planet + 4 teachers) | **Rive** with viseme table | Medium (artist portfolio) | [15] |
| Praktika ("ultra-realistic" avatars) | **Unity** (3D) | Medium (job ads and org chart) | [29][30] |
| Speak | No avatar emphasis found; voice-first, with video from bilingual actors (job ads) | Weak | [22a] |
| XR language apps (Meta Spatial Lingo sample, hobby VR apps) | Unity + Meta Voice SDK / Whisper | Strong for the sample only; not consumer mobile | [68] |
| Lottie / SceneKit | I found **no** competitor documented using Lottie or SceneKit for tutors (UNVERIFIED either way) | n/a | n/a |

## 3. Comparison table (ratings as of 2026-11-15, US stores)
| App | iOS ★ / ratings | Play ★ / reviews / downloads | Web | Mobile stack | Speech | Characters | Entry paid price (US) |
|---|---|---|---|---|---|---|---|
| Duolingo | 4.7 / 5.6M | 4.7 / 51.9M / 500M+ | Yes, reduced (no Max) | Native Kotlin + Swift | In-house ASR; MS TTS; OpenAI LLM | Rive | Super is in-app only; no web list price |
| ELSA Speak | 4.7 / 115K | 4.6 / 1.02M / 10M+ | Speech Analyzer + shop | Flutter | In-house ASR | Rive (medium) | ~$89.99/yr web (3rd-party) |
| BoldVoice | 4.8 / 54K | 4.7 / 12.8K / 1M+ | Signup + webapp | React Native | In-house (HuBERT fine-tune) | Coach video, no avatar | $24.99/mo; $149.99/yr web |
| Speak | 4.8 / 67K | 4.8 / 127K / 10M+ | Signup only | Native (Swift/Kotlin jobs) | Own server Conformer; OpenAI; LiveKit WebRTC | None notable | $17.99/mo; $83.99/yr (3rd-party) |
| Praktika | 4.7 / 169K | 4.6 / 1.35M / 10M+ | Not found | Unity avatars (+ native shell, UNVERIFIED) | OpenAI GPT-5.x agents | Unity 3D | ~$10/mo (3rd-party, UNVERIFIED) |
| Babbel | 4.7 / 758K | 4.6 / 1.13M / 50M+ | Yes | Native + KMP (RN removed) | n/a | None | not checked |
| Loora | 4.9 / 41K | 4.9 / 371K / 10M+ | No (in development) | Not public | Own LLM system (claim) | None | not checked |
| Speakerly (Pronounce) | not checked | 3.6 / 134 / 100K+ | Yes (primary) | TWA/PWA wrap (INFERENCE) | Not public | None | from $12/mo |

Canadian (CAD) store prices were not collected (UNVERIFIED gap).

## 4. Five lessons for Sound Local (INFERENCE)
1. **Ship to the stores, and keep the web as the funnel and the cheaper checkout.** Every leader does this. A PWA or TWA-only route exists (Speakerly) but it is the weakest-rated example here. If Sound Local starts as a PWA, plan a store wrapper (Capacitor/TWA) early.
2. **A non-native stack is fine.** ELSA (Flutter) and BoldVoice (React Native) hold 4.6–4.8★ with millions of users. Babbel's lesson is to avoid *bolting* a second framework onto a native app. Pick one cross-platform stack and own it, rather than mixing.
3. **Prefer Rive-style 2D state-machine characters over a heavy 3D engine for mobile.** Duolingo explicitly chose Rive as "an alternative to a game engine" for file size and cross-platform reasons. Only Praktika uses 3D, and it does so with dedicated Unity engineers. Keep Three.js scenes light or optional on phones.
4. **Treat speech quality as the moat, and keep speech processing in the cloud.** Speak, ELSA, Duolingo and BoldVoice all built accent-specific models on top of vendor APIs. Sound Local's ElevenLabs STT, plus its own pitch analysis, is a reasonable start. Log consented learner audio now so you can fine-tune later, and plan WebRTC (e.g. LiveKit) for live NPC calls.
5. **Budget for native retention features, and expect channel-specific pricing.** Streak widgets, push notifications and Live Activities clearly drive Duolingo's habit loop, and a pure PWA cannot offer them on iOS. Price around $84–$150/yr like the speaking peers, and test web-checkout discounts against in-app prices (BoldVoice and ELSA already price differently per channel).

## 5. Sources (all read 2026-11-15)
1. https://apps.apple.com/us/app/elsa-speak-english-learning/id1083804886 (ELSA iOS listing)
2. https://play.google.com/store/apps/details?id=us.nobarriers.elsa&hl=en_US (ELSA Play)
3. https://apps.apple.com/us/app/boldvoice-accent-training/id1567841142 (BoldVoice iOS)
4. https://play.google.com/store/apps/details?id=com.wellocution.androidapp&hl=en_US (BoldVoice Play)
5. https://apps.apple.com/us/app/speak-language-learning/id1286609883 (Speak iOS)
6. https://play.google.com/store/apps/details?id=com.selabs.speak&hl=en_US (Speak Play)
7. https://aws.amazon.com/solutions/case-studies/elsa-2021-case-study/ (AWS: ELSA case study, 2021)
8. https://blog.duolingo.com/migrating-duolingos-android-app-to-100-kotlin/ (Duolingo, 2020-04-06)
8a. https://developer.android.com/stories/apps/duolingo-kotlin (Android Developers story)
9. https://blog.duolingo.com/ios-mvvm-swift-macros/ (Duolingo, 2025-07-10)
9a. https://blog.duolingo.com/real-world-swift/ (Duolingo, 2015-01-07)
10. https://blog.duolingo.com/world-character-visemes/ (How Duolingo Animates Its World Characters, 2022-11-10)
11. https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life (Rive, 2025-03-20)
12. https://topdev.vn/blog/hanh-trinh-chuyen-doi-cua-elsa-tu-native-sang-flutter/ (TopDev: ELSA Native→Flutter, 2024-07-18)
12a. https://www.isca-archive.org/slate_2023/anguera23_slate.pdf (ELSA Speech Analyzer, ISCA SLaTE 2023)
13. https://elsa.teamtailor.com/en/jobs/7372419-engineering-manager-b2c-product (ELSA job: Engineering Manager B2C)
13a. https://www.careers-page.com/elsa-corp/job/LR879X46 (ELSA job: Full Stack, Flutter Focus)
13b. https://echoloc.ai/company/elsaspeak/ (echoloc ELSA tech stack, inferred)
14. https://www.slideshare.net/slideshow/elsas-speech-recognition-overview/256205527 (ELSA ASR overview)
14a. https://stratadb.io/company/elsaspeak.com/uses/azure-openai (StrataDB: ELSA subprocessor, Azure OpenAI)
15. https://virapg.artstation.com/projects/bgQ1Xv (Artist portfolio: Rive lip-synced teachers for ELSA)
16. https://www.ycombinator.com/companies/boldvoice/jobs/BSms6T6-fullstack-engineer-nyc (BoldVoice Fullstack job, stack)
16a. https://app.boldvoice.com/start/details (BoldVoice web pricing)
17. https://www.speak.com/ (Speak homepage)
18. https://www.speak.com/blog/speak-openai-speech-recognition (Speak + OpenAI, 2023-03-01)
19. https://www.speak.com/blog/asr-levelup (Speak ASR level-up, 2024-06-10)
20. https://accent-explorer.boldvoice.com/ (BoldVoice: How AI Hears Accents, 2025-10-09)
20a. https://accent-strength.boldvoice.com/ (BoldVoice: Accents in Latent Spaces, 2025-05-06)
20b. https://note.com/eigo_hatsuon/n/nb5436050097d?hl=en (third-party analysis of BoldVoice, 2026-08-27)
21. https://www.ycombinator.com/companies/speak/jobs/kwJXSsO-senior-android-engineer (Speak Android job)
22. https://www.ycombinator.com/companies/speak/jobs/GiGPZ4f-ios-engineer-internship-summer-2026 (Speak iOS job)
22a. https://jobs.ashbyhq.com/speak (Speak open positions)
23. https://www.speak.com/blog/building-speaks-voice-agent-platform (Speak voice agent platform, 2026-03-24)
23a. https://www.speak.com/blog/the-architecture-behind-ai-tutor-call (Speak AI Tutor Call architecture, 2026-10-20)
23b. https://www.speak.com/blog (Speak blog index)
24. https://boldvoice.com/ (BoldVoice homepage/FAQ)
25. (same as 17)
26. https://toolradar.com/tools/elsa-speak/pricing (ELSA pricing, third party, verified Nov 2026)
26a. https://ieltsbiz.com/blog/elsa-speak-ielts-review (ELSA web prices Oct 2026, third party)
26b. https://elsaspeak.com/amb/engxeng1/ (ELSA affiliate pricing page)
26c. https://elsaspeak.com/en/news-events/is-elsa-speak-app-free (ELSA: free trial, 2026-10-26)
27. https://www.loora.com/support/getting-started/web-version (Loora: Is there a web version?)
27a. https://www.loora.com/support/getting-started/can-i-use-loora-on-my-laptop (Loora laptop FAQ)
28. https://techcrunch.com/2022/10/27/english-learning-startup-elsa-launches-speech-analyzer-to-help-people-gain-conversational-confidence/ (TechCrunch, 2022-10-27)
29. https://theorg.com/org/praktika/org-chart/lex-hvesuk (Praktika Avatars Squad Lead, Unity)
30. https://www.remoterocketship.com/company/praktika-ai/jobs/senior-unity-developer-united-kingdom (Praktika Unity job, 2024-12-08)
31. https://v2agi.ddd.dev/sites/2042 (WayToAGI directory: Praktika, weak)
32. https://www.babbel.com/en/magazine/integrating-react-native-with-babbels-native-mobile-apps (Babbel RN, 2020-07-24)
33. https://www.babbel.com/en/magazine/how-we-brought-kotlin-multiplatform-into-babbels-mobile-apps (Babbel KMP, 2026-09-30)
33a. https://www.linkedin.com/posts/antoinelamy_how-we-brought-kotlin-multiplatform-into-activity-7514706012331806720-TvRO (Babbel principal engineer post, 2026-10-10)
34. https://yofluent.com/compare/boldvoice-review and related third-party BoldVoice App Store price check (2026-10-23)
35. https://speakshark.com/blog/speak-app-pricing-per-month-2026 (Speak US App Store prices, 2026-08-27)
35a. https://www.androidauthority.com/speak-ai-tutor-call-3725246/ (Android Authority, 2026-10-20)
35b. https://www.speak.com/jp-blog-posts/premium-vs-premium-plus (Speak JP official pricing, 2026-10-21)
37. https://play.google.com/store/apps/details?id=com.getpronounce.app.twa&hl=en_US (Speakerly AI Play)
38. https://www.getpronounce.com/pronounce-pricing (Pronounce pricing)
39. https://www.linkedin.com/posts/guidorosso_duolingos-video-call-feature-is-made-with-activity-7289451434058625024-_sTM (Rive CEO, 2025-01-27)
39a. https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff (Rive, 2024-07-25)
39b. https://zuhuri.com/learn/stories/rive-guide/ (third-party Rive/Lily explainer)
40. https://www.microsoft.com/en-us/startups/blog/duolingo-makes-learning-language-fun-with-help-from-ai/ (Microsoft, 2023-02-23)
41. https://www.duolingo.com/help/what-is-duolingo-max/ (Duolingo Help: What is Max)
42. https://blog.duolingo.com/widget-feature/ (Duolingo widget, 2023-08-29)
43. https://forums.macrumors.com/threads/duolingo-used-iphones-dynamic-island-to-display-ads-violating-apple-design-guidelines.2475501/ (MacRumors, 2026-01-02)
44. https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067 (Duolingo Q3 2026 shareholder letter)
45. https://amplitude.com/blog/praktika-experimentation-and-revenue-growth (Amplitude: Praktika, 2026-01-15)
46. https://connect.izandu.com/read-blog/13024_duolingo-desktop-vs-mobile-in-2026-two-games-one-account.html (third party, 2026-10-14)
47. https://blog.duolingo.com/duolingo-max/ (Duolingo Max / GPT-4, 2023-03-14)
48. https://www.isca-archive.org/slate_2025/cai25_slate.pdf (Duolingo ASR paper, SLaTE 2025)
49. https://blog.duolingo.com/video-call/ (Video Call, 2024-09-24)
50. https://blog.duolingo.com/beginner-video-call-with-falstaff/ (Falstaff, 2026-01-14)
51. https://observer.com/2026/11/luis-von-ahn-duolingo-max-super-ai-subscriptions/ (Observer, 2026-11-11)
52. https://finance.yahoo.com/technology/ai/articles/duolingo-ending-highest-paid-tier-150729243.html (Yahoo Finance, 2026-11-09)
53. https://www.hinty.eu/blog/duolingo-max-kosten (NL App Store prices, 2026-11-13)
54. https://duolingoguides.com/duolingo-max-review/ (historical Max price, third party)
55. https://apps.apple.com/us/app/duolingo-language-lessons/id570060128 (Duolingo iOS)
56. https://play.google.com/store/apps/details?id=com.duolingo&hl=en_US (Duolingo Play)
57. https://bitrise.io/customer-stories/speak (Bitrise: Speak)
58. https://www.speak.com/blog/matching-v2 (Speak matching pipeline)
58a. Speak blog index entries "Raising $78M Series C at a $1B valuation" and "Google Play Best App of 2024" (via 23b)
59. https://openai.com/index/praktika/ (OpenAI: Praktika, 2026-01-22)
60. https://apps.apple.com/us/app/praktika-ai-language-tutor/id1624701477 (Praktika iOS; search snapshot)
61. https://play.google.com/store/apps/details?id=ai.praktika.android&hl=en_US (Praktika Play)
62. https://www.alphamoat.ai/en/app/praktika-14666488 (AlphaMoat estimate)
63. https://apps.apple.com/us/app/babbel-language-learning/id829587759 (Babbel iOS)
64. https://play.google.com/store/apps/details?id=com.babbel.mobile.android.en&hl=en_US (Babbel Play)
65. https://apps.apple.com/us/app/speak-english-with-loora-ai/id1552708303 (Loora iOS)
66. https://play.google.com/store/apps/details?hl=en&id=com.loora.app (Loora Play; search snapshot)
67. https://apps.apple.com/us/app/say-it-english-pronunciation/id919978521 (Say It iOS; search snapshot)
67a. https://www.phona.co.uk/ (Phona / SayIt)
68. https://developers.meta.com/vr/documentation/unity/unity-sample-spatial-lingo/ (Meta Spatial Lingo Unity sample)
