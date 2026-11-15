# Direct accent / pronunciation apps — competitive findings for Sound Local
Accessed 2026-11-15. Store data: App Store **US** storefront (iTunes Lookup API + store page) and Google Play **US** listing. Each row's sources are in `competitors_direct.csv` (`price_source_url`, `store_links`) and `sources.md`. Prices are listed per plan in `pricing_direct.csv`. Screenshots are in the attached PNGs (`ios_*`, `gp_*`, `web_*`).

## Bottom line
1. **No product at scale teaches native English speakers regional accents through a game.** The big apps (ELSA: 10M+ GP installs, 115K US iOS ratings; BoldVoice: 1M+ GP, 54K US iOS ratings) are **accent reduction for non-native speakers**, built around American English (sometimes British). They don't offer regional accents like Glaswegian, Torontonian or Singlish, and none of them has characters or game progression.
2. **The closest competitor is Accentify** (UK, founded by an actor and an accent coach). It calls itself "Duolingo-style" learning for accents, teaches regional accents (Scottish, Scouse, Irish, Southern US, RP, GA, Australian…) to native speakers and actors, and uses **human coaches to review recordings** plus an AI coach. It is small: 10,000+ GP installs, 151 GP and 22 US iOS ratings. The founder self-reports about 270 paying subscribers (Jun 2026) and says it is "funded" (amount UNVERIFIED). It is a lesson app, not a game, and has no conversational characters. *Sources: accentify.co.uk, store pages, founder LinkedIn.*
3. **A wave of tiny indie "accent coach" apps launched in 2026** with automatic scoring: Accent Coach: Master Accents (scores sounds, rhythm and melody; 27 accents), Accentuate (5 scored courses + 35 voices including a Scottish "Isla"; markets itself to actors), AnyAccent (AI coach personas), Mimic, and Accent Lab. Each has 0–24 ratings and ≤10+ GP installs, so there is no traction yet. **This tells us others see the same idea now; it isn't proof of demand.**
4. **Accent games exist but are trivial.** *Other Voices: Accent Game* (Android, 100+ installs) is the only one where you speak and earn points or unlock accents. *The Accent Game* and *Guess the Accent* are listening quizzes only.
5. **Actors already pay for regional accent content.** The Accent Kit sells reference-audio kits for **$9.99 per accent (iOS US), including "North Glasgow Male" and "Ayr Male"**. The Voice Café charges $2.99 per accent, and the IDEA archive is free. None of these score you.
6. **Price anchors:** L2 subscriptions cost about $5–$25/month and $30–$200/year (ELSA $19.99/mo, $99.99/yr; BoldVoice $14.99–$24.99/mo, $89.99–$199.99/yr; Speakometer $4.99/mo, $29.99/yr). Actor accent packs cost $3–$13 each, one-off.

### Gap Sound Local can take (ASSUMPTION, my synthesis from the evidence above)
- Native speakers learning **regional** varieties, as **play** rather than a course: talking to characters, scored in context, kind feedback. Nobody combines conversation with AI locals, regional accents and game progression.
- Specific regions the competitors don't serve: Glasgow appears only as static audio (Accent Kit) or one unscored voice (Accentuate). No competitor covers Toronto or Singapore English. Indian English appears as one scored course in Accentuate, and as listening content in Voice Café and Pronounce AI.
- Risks: Accentify could add characters or AI conversation, and ELSA already has AI role-play. Automatic scoring of regional accents is unproven: most of the indies don't disclose their method, and Accentify relies on humans.

## Landscape table (key rows; the full set of 30 is in the CSV)
| App | Group | For | Scoring | Accents | GP installs | iOS US ★ (n) | GP ★ (n) | Price (US) |
|---|---|---|---|---|---|---|---|---|
| ELSA Speak | L2 | Non-native learners | AI phoneme-level | Mainly American | 10M+ | 4.75 (114,812) | 4.61 (1,022,747) | $19.99/mo, $99.99/yr |
| BoldVoice | L2 | Non-native pros | AI phoneme + coach videos | American | 1M+ | 4.81 (54,132) | 4.70 (12,765) | $14.99–24.99/mo; $89.99–199.99/yr |
| Speakometer | L2 (+mentions natives) | Learners | AI/ASR score | US, UK | 500K+ | 4.73 (2,131) | 4.50 (6,225) | $4.99/mo, $29.99/yr |
| Speechling | L2 | Language learners | Human coaches | US/UK + other languages | 500K+ | 4.81 (682) | 4.42 (3,123) | Free; $19.99/mo |
| (How to) Pronounce | Reference | Learners | None | Many | iOS only | 4.79 (33,431) | – | $0.99–4.99 packs |
| Accent Training | L2 | Non-native | Listen-repeat | American | iOS only | 4.65 (11,055) | – | $4.99/mo, $39.99/yr |
| Say It (Oxford/Phona) | L2 | Learners | Waveform compare | UK, US | GP page 404 | 4.12 (248) | – | $13.49/mo, $105.99/yr |
| YouGlish | Reference | Learners | None | US/UK/AU/CA/IE/SCO/NZ/ZA filters | 500K+ | 3.20 (41) | 4.12 (822) | Free; paid tiers UNVERIFIED |
| ChatterFox | L2 | Non-native pros | AI + human coach | American | 10K+ | not found | 4.14 (261) | GP $54.99–56.37/item |
| **Accentify** | **Acquisition** | **Actors / natives** | **Human coach + AI** | **GA, RP, AU, Irish, Scottish, Scouse, Southern US…** | 10K+ | 3.55 (22) | 3.24 (151) | Free tier; $3.99/wk, $4.99–9.99/mo, $39.99/yr |
| The Accent Kit | Acquisition | Actors | None (audio) | 100+, incl. Glasgow | 50K+ | 3.17 (24) | 2.28 (182) | $9.99 per accent |
| Accentuate | Acquisition | Actors | Auto-scored (5 courses) | RP, GA, AU, Indian, NZ + 35 voices | 10+ | 5.0 (2) | – | Pro $5.99 |
| Accent Coach: Master Accents | Acquisition | Actors / learners | On-device sounds/rhythm/melody | 27 accents | iOS only | 2.0 (1) | – | Free; Mac $10 |
| AnyAccent | Acquisition | People already understood | AI closeness score | UK, US, AU | iOS only | 0 (0) | – | $4.99/mo, $99.99/yr |
| Mimic: Accent Training | Acquisition | Actors / learners | On-device score | UK, US | 10+ | 0 (0) | – | $9.99 per pack |
| The Voice Café | Acquisition | Actors | None | ~10 incl. Geordie, Cockney | iOS only | 2.89 (9) | – | $2.99 per accent |
| IDEA archive | Reference | Actors | None | ~1,800 samples, 135 countries | web | – | – | Free |
| Other Voices: Accent Game | Game | Casual | Points for accuracy and expression | UNVERIFIED | 100+ | – | no ratings | Free + ads |
| The Accent Game | Game (listening) | Casual | None | World Englishes | 500+ | 0 (0) | – | Free |

## Revenue and funding (only where publicly reported)
- **ELSA**: about $60M raised in total, including a $23M Series C (TechCrunch, Sep 2023). Revenue is **estimate only**: AppGazers models roughly $0.33M–$2.5M of iOS revenue per 30 days, and Airbridge about $500K/month. The company has not reported revenue.
- **BoldVoice**: $21M Series A (Matrix) and **over $10M ARR, 5M downloads** (company PR, Jan 2026). Total raised is about $27.1M (AlleyWatch). AlphaMoat estimates about $241K of iOS revenue per 30 days (third-party estimate).
- **Speechling**: a non-profit; Tracxn lists it as unfunded.
- **Accentify**: says it is funded (amount UNVERIFIED). The founder self-reports about 270 paying subscribers.
- I found no public figures for the others.
- Sensor Tower and Appfigures pages need a login, so I took no numbers from them.

## Verification notes
- **Say It** and **British Council Sounds Right**: their Google Play pages returned 404 on 2026-11-15, so both appear to have been delisted from Google Play. Phona's website also returned 404. Say It is still live on iOS.
- **Macmillan Sounds** is a legacy app: AppBrain shows its last update in 2016.
- **Blabby** (iOS) is not an accent-training app. I captured it but left it out of the table.
- **Amberscript** is a transcription tool, not a pronunciation app, so I excluded it (ASSUMPTION based on its product category; not researched in depth).
- **FluentU** is out of lane: it's a video-based language course.
- Scoring methods come from the apps' own store or site descriptions. None of them publish technical details, so "AI/ASR" is a vendor claim.
- Several iOS IAP lists repeat products at different prices (A/B or regional tiers). I listed every price shown.
