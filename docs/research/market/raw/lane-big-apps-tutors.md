# Big language apps, AI speaking apps, tutors and dialect coaches: findings (PARTIAL)

Accessed 2026-11-15 from a US IP. **Status: PARTIAL.** The lead stopped the work early. Sections marked **NOT RESEARCHED** were not covered. Store data comes from the Apple iTunes Lookup API and from Google Play using the `google-play-scraper` library. In-app purchase (IAP) lists come from the App Store web pages (US, GB, IN, CA). Apple shows only the top 10 IAPs per app, without the billing period.

## Takeaways for Sound Local
1. **No big app teaches native English speakers other English accents.** The accent choice that exists is for learners: pick the tutor's variety. Praktika avatars offer American, British, Australian and "Asian" ([help center](https://intercom.help/praktika-ai/en/articles/10707916-learning-process)). Loora offers American or British ([support](https://www.loora.com/support/features/british-or-american-english)). Babbel has separate European vs Mexican Spanish courses ([help](https://support.babbel.com/hc/en-us/articles/205600508-Available-languages)). Langua has country-specific dialect voices cloned from real people ([help](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide)). Talkpal lists "English (British)" as a separate language ([support](https://talkpal.ai/support/how-many-languages-is-talkpal-ai-available-in/)). Duolingo has one course per language, and its Spanish course teaches *ustedes*, not *vosotros* ([third party](https://learnspanishoutloud.com/articles/does-duolingo-teach-spain-spanish/)). I found no regional UK accents (e.g. Glaswegian) in any app in this lane.
2. **Speech scoring is mostly ASR (automatic speech recognition) plus an LLM.** Speak uses ASR plus a custom in-house matching algorithm (Speak engineering blog, see notes). Praktika and Langua use LLM feedback. No one in this lane advertises scoring of prosody, pitch or rhythm against a local reference. That is Sound Local's technical difference. (Inference: based only on public descriptions.)
3. **AI speaking apps grow fast, and creators/ads drive it.** Praktika: CEO says $55M ARR and about 0.5M paying subscribers ([podcast, Nov 2026](https://exa.ai/library/podcast/6rv4cjd8krv/episode/m0lyl3b2344)). It went from about $1M to $12M ARR in one month by copying a viral coach video with creators ([RevenueCat](https://www.revenuecat.com/blog/growth/adam-turaev-praktika-sub-club-podcast-2026)). Speak: approaching $50M ARR ([AI Magazine](https://aimagazine.com/news/speak-language-app-valued-at-us-1bn-on-spoken-ai-model)), $1B valuation in Dec 2024 ([TechCrunch](https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud/)). Loora: ARR in the "tens of millions", $43.25M raised in total ([Loora](https://www.loora.com/news/company-news/loora-raises-22m-funding)). Langua is bootstrapped: $308K MRR (founder, Jul 2025), 35,000+ Pro subscribers, "mostly through word of mouth" ([Langua](https://languatalk.com/blog/languatalk-reviews/)).
4. **Price anchors.** US iOS monthly prices: Duolingo Super $12.99, Praktika $9.99, Speak Premium $17.99 and Premium Plus $39.99. Annual plans run about $60 to $165. The PRD assumption of $9.99/mo or $59.99/yr sits at the low end, close to Praktika. Human dialect coaches cost $120 to $180 per hour (US) or £100 to £135 per hour (UK). Discounted actor rates go down to £65. So Sound Local's "$39 Production Pass" costs less than half of one coaching session.
5. **Duolingo is a games company now.** In the UK and India stores the app is titled "Duolingo: Language & Chess". The US title is "Duolingo: Learn Languages" with the subtitle "Spanish, French, Chess & Math". Q3 2026: revenue $309.0M, 64.9M DAUs (daily active users), 13.1M paid subscribers. FY2026 revenue guidance is $1,221M ([Q3 2026 letter](https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067)). Duo also appeared inside Brawl Stars and Eggy Party (same letter).

## Store snapshot (US, 2026-11-15)
| App | iOS rating (count) | Google Play rating (count) | Google Play installs |
|---|---|---|---|
| Duolingo | 4.72 (5,592,354) | 4.75 (51,902,658) | 500,000,000+ |
| Babbel | 4.72 (758,308) | 4.57 (1,129,180) | 50,000,000+ |
| Speak | 4.83 (66,995) | 4.76 (126,675) | 10,000,000+ |
| Praktika | 4.75 (168,865) | 4.61 (1,354,661) | 10,000,000+ |
| Loora | 4.9 (41,335) | 4.89 (371,967) | 10,000,000+ |
| Talkpal | 4.66 (4,061) | 4.63 (118,803) | 5,000,000+ |
| Langua | 4.57 (2,814) | 4.33 (2,172) | 100,000+ |
| Busuu | 4.71 (101,577) | 4.65 (1,251,554) | 50,000,000+ |
| Memrise | 4.78 (217,738) | 4.4 (1,571,171) | 50,000,000+ |
| Rosetta Stone | 4.76 (238,809) | 4.6 (406,007) | 10,000,000+ |
| Cambly | 4.51 (9,318) | 4.65 (153,187) | 10,000,000+ |
| Preply | 4.84 (45,914) | 4.67 (66,183) | 10,000,000+ |
| italki | 4.84 (10,018) | 4.77 (18,784) | 5,000,000+ |

The Duolingo English Test (DET) Android app is rated 2.86 from 1,180 ratings, with 500,000+ installs. GB and IN ratings are in `ios_ratings.txt`. Screenshots of the US App Store pages are in `screens/` (13 PNGs).

## Dialect coaches (human benchmark)
- Paul Meier (founder of IDEA): Zoom sessions cost $120 for 30 min and $180 for 60 min (individuals) ([site](https://www.paulmeier.com/product/zoom-phone-coaching/)). IDEA is a free archive of about 1,800 samples from 135 countries ([dialectsarchive.com](https://www.dialectsarchive.com/)).
- US coaches: $125/hr ([actorsdialectcoach.com](https://www.actorsdialectcoach.com/f-a-q)) and $150/hr ([Braden Lynch](https://www.bradenlynchstudio.com/accent-coaching)).
- UK coaches: £135 per 50 min, or £65 at the rate for self-funding Equity/Spotlight actors ([Rachel Coffey](https://www.rachelcoffeycoaching.com/actors-dialect)). £100/hr, with Scottish offered ([papateachme](https://www.papateachme.com/british-dialect-coaching)). The Accent Bank charges £120–140/hr and £37 for a script recording, and sells a £40 Scottish DIY course. It claims 1.4M+ followers ([site](https://www.theaccentbank.com/learn-accents)).
- 21 Accents (Amy Walker) runs a YouTube membership at $4.99 or $8.99/mo ([site](https://www.21accents.com/21accentsacademy)).
- Marketplaces: VASTA "Find a Voice Pro" is a directory, not a booking platform ([vasta.org](https://vasta.org/content.aspx?club_id=516524&page_id=154&type=11788)). A Preply British pronunciation tutor example charges $60 per 50-min lesson ([Preply](https://preply.com/en/tutor/5484243)).
- Gap: the coaches advertise "Scottish" generally. I found no Glasgow-specific coach price. **NOT RESEARCHED** further.

## NOT RESEARCHED (gaps)
- Busuu, Memrise, Rosetta Stone, Cambly, Preply, italki: only store ratings, installs and iOS IAP lists were collected. Not covered: features, funding, revenue, scoring, accents, acquisition, platform commission.
- Duolingo Max web price by country, Babbel Speak details, and Speak web prices. Speak's pricing page showed no prices; it says to check in-app.
- Country price comparison was not analysed. The raw GB/IN/CA IAP prices are in `pricing_bigapps.csv`.
- The `realInstalls` figure from Google Play is an undocumented scraped field, kept only in `gplay_raw.json`. Use the public install brackets instead.

## Appendix: per-company research notes (with quotes and URLs)

---
# Duolingo
Research date: 2026-11-15. US research context; fetched public pages, no logged-in purchase. UNVERIFIED means not established, not absent. Prices may vary by account, promotion, tax and geography.

## 1. Product / audience
Language learning through short gamified lessons for general learners. Official description: “With quick, bite-sized lessons, you’ll earn points and unlock new levels while gaining real-world communication skills.” https://www.duolingo.com/course/es/en/Learn-Spanish

## 2. Official web pricing
https://www.duolingo.com/super lists Free, Super, Super Family. Free is free; dollar prices, billing periods and US checkout totals for Super and Super Family: **UNVERIFIED** (public fetched page exposes no amounts). Family quote: “Enjoy faster learning on up to 6 Super accounts.” Geo-dependence not established; do not substitute app-store or review prices for official web prices.
Max: official help says “Duolingo Max cannot be purchased on web.” Current Max price/country list UNVERIFIED. More importantly, the newer shareholder letter says sales stop this month; help copy appears behind the investor announcement (see below).

## 3. Latest quarterly results and guidance
Primary source, Q3 2026 shareholder letter, fetched in full: https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067 . Release dated November 3: https://investors.duolingo.com/static-files/50b3d8c8-76ba-4a75-8715-be6abc9bbc51 . Figures are USD millions unless users.
- Revenue $309.0m: “Revenue grew 14% over the prior year on both a reported and constant-currency basis to $309.0 million.”
- DAUs 64.9m; paid subscribers 13.1m at period end. Exact table rows: “Daily active users (DAUs) (1) 50.5 64.9 29%” and “Paid subscribers (period end) 11.5 13.1 14%” (columns Q3 2025, Q3 2026, YoY).
- MAUs 153.1m: “MAUs were 135.3 million and 153.1 million for the three months ended September 30, 2025 and 2026, respectively, representing 13% year-over-year growth.”
- Guidance exact table: “(in millions) Q4 2026 FY 2026 Bookings $382 $1,296 YoY bookings growth 13% 12% Revenues $322 $1,221 YoY revenue growth 14% 18%” and “Adjusted EBITDA(2) $84 $323 Adjusted EBITDA margin(2) 26.1% 26.5%”. Thus Q4 revenue $322m, FY revenue $1,221m; bookings $382m/$1,296m; adjusted EBITDA $84m/$323m. Guidance, not actual results.

## 4. Funding
Historical last private round located: company Series H announcement, Nov 18 2020. “Duolingo ... today announced that it has raised $35 million in financing at a $2.4 billion valuation from Durable Capital Partners LP ... and General Atlantic”. “This latest financing round brings the company's total funding to $183 million.” These are historical venture figures, not current public-market valuation or lifetime capital including IPO. Source fetched: https://www.prnewswire.com/news-releases/duolingo-raises-35-million-to-fuel-continued-global-growth-301175316.html . Crunchbase not used.

## 5. AI / speaking / other subjects
- **Material current change:** shareholder letter above: “Since unlimited Video Call will be part of Super, we've decided to sunset Duolingo Max, our highest subscription tier.” “This month, we will stop selling new Max subscriptions and move existing Max individual subscribers to a Super family plan at the same price”. “we’re on track to make it available to all Super subscribers by the end of this year.” Legacy Max family decision deferred: “we will address this in 2027.” Rollout target is not evidence every Super account already has it.
- Older/possibly stale official help: “Duolingo Max includes all the benefits of Super Duolingo, along with AI-powered features: Roleplay and Video Call with Lily.” Video Call quote: “available ... on iOS and Android (Versions 13+ only) learning English, French, Spanish, Italian, German, Portuguese.” Roleplay available to English speakers learning French, Spanish, German, Portuguese, Italian, and English learners from Spanish, Portuguese, Japanese, German, French. Full source: https://www.duolingo.com/help/what-is-duolingo-max . Country-level availability and current numerical speech rubric/vendor UNVERIFIED; conversational feedback must not be conflated with pronunciation scoring.
- Explain My Answer free from Jan 1 2026: “Explain My Answer—our popular in-lesson feedback feature available to subscribers—is now free for all Duolingo learners.” “available for most learners in our courses teaching Spanish, French, German, Japanese, Portuguese, Italian, and Korean”. It “crafts personalized feedback that takes into account the error you made”. https://blog.duolingo.com/explain-my-answer-now-free/ (fetched).
- DET: official homepage frames it for students: “Fast, flexible testing for today’s students.” Official price **UNVERIFIED**: https://www.englishtest.duolingo.com/ fetched but no amount exposed. Secondary lead, not official checkout: Coursera search result says “The Duolingo English Test costs $70 plus applicable taxes, as of September 2026”; https://www.coursera.org/articles/duolingo-english-test (search-only, not independently fetched; do not treat as verified official price).
- DET scoring primary source fetched: “These responses are scored using AI models trained on thousands of expert-rated samples.” “These models apply state-of-the-art automatic transcription, natural language processing (NLP), and speech processing tools” evaluating content, coherence, vocabulary/grammar, and “Fluency and pronunciation (for speaking): Do you speak clearly, naturally, and understandably?” “All spoken responses are reviewed by proctors for good-faith effort.” https://blog.englishtest.duolingo.com/how-is-the-duolingo-english-test-scored/ . Not the same scoring system as the learning app.
- Chess launched June 10 2025: “This marks our first new course launch since we added Math and Music in 2023”. “Our Chess curriculum starts at the very beginning—learning how each piece moves—and gradually builds toward more advanced strategies.” “Yes! Like all of Duolingo’s learning content, the Chess course will be available for free to all learners.” https://blog.duolingo.com/chess-course/ . Detailed Math/Music curricula UNVERIFIED in this pass.

## 6. Accents / varieties
Selectable regional accent setting and a course teaching native English speakers other English accents: **UNVERIFIED**. Searched official dialect/course material, not an in-app settings audit. Educational blog does cover varieties, but is not evidence of selectable app voices: “All languages have dialects, and all dialects are equally ‘correct.’” https://blog.duolingo.com/english-dialects/ (fetched; discusses American, British, Indian, Singaporean, Jamaican, Nigerian, Australian English).

## 7. Acquisition
Q3 letter: “We ran hundreds of experiments across various parts of our product, like notifications and streaks, aimed at increasing user retention and DAUs.” Brawl Stars/Eggy Party: “Our mascot, Duo, was featured prominently inside both games, and players could earn rewards by learning on Duolingo. Together, these partnerships brought us millions of new and returning users.” https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067 . TikTok-specific causal contribution / paid CAC UNVERIFIED in fetched sources.

## 8. Notable 2025–2026 news
Chess launch, free Explain My Answer, Q3 results, and Max sunset above are dated primary-source developments. Major comparison caveat: old Max pricing/feature articles are not reliable descriptions of the November 2026 offer.

---
# Babbel
Research date 2026-11-15; US context; public-page fetches, no purchase. All quoted figures retain their source dates. UNVERIFIED does not mean zero.

## 1. Product / audience
“The Babbel app helps people connect and communicate across cultures, whether for travel, friendship, or career advancement.” Consumer and business language training. Source fetched: https://www.babbel.com/press/en-us/releases/babbel-speak

## 2. Official web pricing
**UNVERIFIED** plan amounts/currency/periods: https://www.babbel.com/prices produced no readable pricing via page fetch; curl verified redirect to https://my.babbel.com/en/prices and HTTP 403. No official US checkout amounts obtained. Geo-dependent offers plausible but not established from this response; do not substitute European or app-store prices. Lifetime and subscription amounts in comparison sites were not accepted as official pricing.

## 3. Revenue / users
- Revenue is a **secondary estimate**, not verified financial disclosure: “Babbel made an estimated €352 million revenue in 2024, 6.6% more than the previous year”. Fetched https://www.businessofapps.com/data/babbel-statistics/ (updated April 20 2026). Its older subscription totals conflict with newer company releases, so prefer primary source below.
- Company says “With over 30 million subscriptions sold and an industry-leading retention rate” in Sept 16 2025 release: https://www.babbel.com/press/en-us/releases/babbel-speak . Cumulative subscriptions sold, NOT active subscribers or unique users. DAU/MAU/current paid subscribers and newer revenue UNVERIFIED; searched revenue and company press pages.

## 4. Funding
- Official July 8 2015 Series C: “Babbel ... today announces the successful completion of a $22 million investment round to drive further growth. The round is led by Scottish Equity Partners (SEP) and supported by existing investors Reed Elsevier Ventures, Nokia Growth Partners (NGP), and VC Fonds Technology Berlin managed by IBB Bet.” Fetched https://www.babbel.com/press/en-us/releases/2015-07-08-Funding_Boost_for_Language_App_Babbel_Raises_22_Million_Dollars.html
- Public database total (lower confidence than announcement): “Babbel has raised $33.5M over 5 rounds.” “Babbel's latest funding round was a Series C for $22M on July 8, 2015.” https://www.cbinsights.com/company/babbel/financials (fetched). Current valuation UNVERIFIED; masked database valuation not usable. Crunchbase not consulted. No newer round found in targeted search.

## 5. AI / speech assessment
- Babbel Speak launch Sept 16 2025, open beta: “It is firstly available for subscribers learning English, Spanish, French, Italian, and German.” “pedagogy defining how learners progress through the scenarios while AI handles the natural conversational flow and personalized responses.” https://www.babbel.com/press/en-us/releases/babbel-speak
- Current help is more restrictive: “Babbel Speak is a beta feature available only on the Babbel mobile app and not on desktop.” “Using natural language processing, it acts as a virtual conversation partner”. “After each conversation, you will receive feedback on the completed tasks and your vocabulary.” No interruptions for correction. Fetched https://support.babbel.com/hc/en-us/articles/25875402999826-Babbel-Speak . Named LLM/vendor and numerical scoring rubric UNVERIFIED.
- Separate pronunciation recognition: “Babbel’s AI analyses and compares thousands of phoneme samples, to assess the accuracy of the speaker’s pronunciation.” “The AI is trained on both correct and incorrect pronunciations, with different accents or dialects (e.g. Spanish from Argentina, Colombia or Spain), voice ranges (low and high), so that the model is also inclusive.” https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us (Nov 21 2023; fetched). Do not confuse learner-trained phoneme assessment with generic conversational NLP.

## 6. Accents / regional varieties
Help quote: “If you are using British English as your display language, you can use Babbel Speak to practice Spanish.” “If you are using American English, you can use Babbel Speak to practice French, German, Italian and Mexican Spanish.” https://support.babbel.com/hc/en-us/articles/25875402999826-Babbel-Speak . Display language is NOT proof of a selectable spoken English accent.
Historical feature release explicitly offers “Spanish (Castellano) and Latin American Spanish” and Everyday Conversations “both European Spanish/Castellano and Latin American Spanish”: https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us . Native English speakers learning other English accents: UNVERIFIED; no such feature established in these sources.

## 7. Acquisition
Verified B2B/customer partnership, not quantified attribution: “Inter Miami CF ... partnered with Babbel to unite their multilingual organization.” Club uses self-study, AI practice and live classes. https://www.babbel.com/press/en-us/releases/babbel-speak . Paid ads, creator marketing and referral contribution UNVERIFIED in this pass; not inferred from the existence of a subscription business.

## 8. 2025–2026 news
Babbel Speak launch above. June 27 2025 CEO appointment: “Babbel ... has announced the appointment of Tim Allen as its new Chief Executive Officer.” https://www.babbel.com/press/en-us/releases/new-ceo-tim-allen (fetched). This release has inconsistent cumulative-subscription figures in body versus boilerplate; use September release for the reported total, not a fabricated reconciliation. No additional independently established 2026 event.

---
# Speak (speak.com / SPEAKeasy Labs)
Research date 2026-11-15. US context, public web retrieval; not the unrelated transcription product Speak AI. All amounts are reported, not estimated by researcher.

## 1. Product / audience
“Speak is an AI-powered language learning app built to get you speaking a new language — not just studying it.” “English speakers can use Speak to learn Spanish, French, Korean, Japanese, Italian, and Simplified Chinese.” https://www.speak.com/ (fetched). Apple case study explicitly names SPEAKeasy Labs: https://ads.apple.com/app-store/success-stories/speak .

## 2. Official pricing
US web amounts **UNVERIFIED**: https://www.speak.com/pricing yielded no readable prices. Homepage explicitly says “Pricing varies by plan, region, and any current promotions, so the most accurate pricing is always within the app.” Plans: Speak Premium (core), Speak Premium Plus (unlimited personalized lessons, custom review, full tutor); “Speak offers a 7-day free trial, after which a paid subscription is required to continue.” https://www.speak.com/ . Officially geo-dependent; no review/app-store amounts passed off as web checkout.
Useful non-US official reference, NOT US web checkout: Japanese company article dated Oct 21 2026 https://www.speak.com/jp-blog-posts/premium-vs-premium-plus (fetched): “プレミアム：月額3,800円／年額19,800円（1ヶ月あたり1,650円）” and “プレミアムプラス：月額5,800円／年額29,800円（1ヶ月あたり約2,483円）”. Translation: Premium JPY3,800 monthly or JPY19,800 yearly; Premium Plus JPY5,800 monthly or JPY29,800 yearly, tax included. Article cautions channel/promotional variation, so not proof of US purchase pricing.

## 3. Revenue / usage
- Current homepage: “15M+ Downloads” and “Speak has been downloaded more than 15 million times worldwide”. Downloads ≠ MAUs/paid subscribers. https://www.speak.com/
- Nov 9 2026 secondary report: “Speak confirms that it is now approaching US$50m in annual recurring revenue.” ARR ≠ recognized annual revenue. “Learners on the language platform Speak articulated 3.74 billion lines out loud throughout 2025”. https://aimagazine.com/news/speak-language-app-valued-at-us-1bn-on-spoken-ai-model (fetched; attribution to company, underlying revenue statement not independently located).
- Dec 2024 TechCrunch: “Speak for Business, an enterprise tier, has over 200 customers, the company said.” “It doesn’t actually disclose how many active users it has.” https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud/ . Current DAU/MAU/paid subscribers UNVERIFIED.

## 4. Funding
TechCrunch above, Dec 10 2024: “a Series C of $78 million that catapults its valuation to $1 billion.” “The funding round is being led by Accel, with previous backers OpenAI (via its Startup Fund), Khosla Ventures and Y Combinator also participating.” Last located round, not proof no subsequent financing.
Total reported by Nov 2026 secondary article above: “Funding: US$162m raised in total by December 2024”. Crunchbase not used. Historical valuation, not refreshed market valuation.

## 5. AI tutor / HOW speech assessment works
- Official: “The app delivers AI conversation practice, real-time feedback on pronunciation and phrasing, and lessons matched to your level”. OpenAI partnership officially acknowledged. https://www.speak.com/ . No validated exam-equivalent proficiency score established.
- Engineering primary source Dec 4 2025: “This particular component is powered under the hood by Automatic Speech Recognition (ASR) or transcription models combined with a custom in-house matching algorithm for pairing up the transcriptions with the words on screen.” “In Matching v2 we added a phonetic model alongside the standard ASR model: that is, a model that skips the ‘transcribe into words’ step altogether and instead directly converts your speech into a sequence of language-agnostic International Phonetic Alphabet (IPA) characters.” https://www.speak.com/blog/matching-v2 (fetched). Applies to speaking cards, not evidence every free conversation uses same evaluation.
- Earlier technical source: “Train a better streaming speech recognition model on our own internal dataset, composed of thousands of hours of heavily-accented English speech audio from Speak learners.” https://www.speak.com/blog/asr-levelup (fetched). Distinguish recognizing accented speech from teaching regional accents.

## 6. Accents
Selectable British/American or regional target accent and native-English-to-other-English-accent teaching: **UNVERIFIED**. Searched speak.com British/accent and technical sources; results from competitors were excluded. Primary evidence supports recognition robustness, not a selector: “we’re transcribing audio with diverse accents, non-standard pronunciations” https://www.speak.com/blog/matching-v2 .

## 7. User acquisition
Fetched Apple Ads case study: “SPEAKeasy Labs maximized brand awareness, downloads, and efficiency by integrating Apple Ads placements across the App Store with TV ads during peak season.” Exact result lines: “4 X increase in brand search volume during TV ad campaign.” “2.3 X increase in downloads after launching multiple placements.” “1.2 X higher return on ad spend year over year.” Vendor/customer marketing case study, not independent causal audit. https://ads.apple.com/app-store/success-stories/speak .

## 8. 2025–2026 news
Matching v2 engineering publication above (2025), Japanese Premium Plus AI telephone feature (2026): “AIの先生と電話で話せる新機能「スピーク電話」（月15回／1回最大10分）” — AI teacher calls, up to 15/month and 10 min/call; region-specific, not evidence US rollout. https://www.speak.com/jp-blog-posts/premium-vs-premium-plus . Nov 2026 AI Magazine revenue/usage report above. Its named GPT-Live-1 rollout claim is a secondary lead only; primary model/rollout verification not completed, so **UNVERIFIED** here.

---
# Praktika
Research date 2026-11-15; US context, public-page fetches; no logged-in checkout.

## 1. Product / audience
“Learn a new language with AI tutors”; “Get instant, gentle corrections on pronunciation, grammar, and word choice”. “Your personal study plan adapts to your goals, interests and your pace of learning”. General learners seeking spoken fluency. https://praktika.ai/ (fetched).

## 2. Official pricing
Precise US web Premium monthly/quarterly/annual totals, currency and renewal terms **UNVERIFIED**. https://praktika.ai/pricing/ returned no usable pricing; official English landing page gives only indicative marketing price: “Praktika Premium costs around $8 a month ... with prices set per market.” https://praktika.ai/learn/english . This is not an independently verified US monthly billing offer; period/commitment and currency denomination beyond the dollar symbol not established. Geo-dependent explicitly. App-store comparison prices excluded.

## 3. Revenue / users
- Homepage official “30M+ learners”. https://praktika.ai/ . Cumulative marketing audience, not DAU.
- CEO interview published Nov 11 2026, transcript at 01:20.982–02:55.443: “Within those two years, we scaled it now up to 55 million ARR already. and serving almost half a million of paying subscribers worldwide.” https://exa.ai/library/podcast/6rv4cjd8krv/episode/m0lyl3b2344 (fetched; machine transcript spells brand inconsistently). Title labels $55M ARR; spoken excerpt does not specify currency. Self-reported ARR, not audited revenue. “We are now serving over 30 million learners worldwide” in same excerpt.
- Earlier CEO interview report Oct 28 2026: “Praktika is now at $50M ARR, ‘reaching almost like half a million paying subscribers,’ Adam says”. https://www.revenuecat.com/blog/growth/adam-turaev-praktika-sub-club-podcast-2026 (fetched). Different dates; do not combine into an audited growth series.
- Historical May 22 2024 TechCrunch: “Praktika claims to have 1.2 million active monthly users across 100 countries and said it generated revenue of almost $20 million in the last 12 months.” https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural/ . Current DAU/MAU UNVERIFIED.

## 4. Funding
TechCrunch above: “a $35.5 million Series A funding round led by Blossom Capital. The round follows a previously unannounced $2.5 million seed fundraise that was led by Creator Ventures and Blue Wire Capital.” Reported rounds sum to $38m (researcher arithmetic, not a quoted lifetime-total claim). Latest located round May 2024; current valuation and independently stated lifetime total **UNVERIFIED**. Crunchbase not used; conflicting scraped LinkedIn total excluded.

## 5. AI / speech assessment
Homepage claims pronunciation/grammar/word-choice corrections and Soft/Balanced/Strict intensity: https://praktika.ai/ .
Vendor case study Jan 22 2026, fetched: “Speech recognition plays a similar role. Language learners hesitate, restart sentences, and pronounce words imperfectly. Praktika uses Transcription API to handle fragmented, accented, and non-native speech more reliably than traditional systems trained on fluent speech.” Student Progress Agent “monitors fluency, accuracy, vocabulary usage, and recurring mistakes.” https://openai.com/index/praktika/ . Uses multi-agent conversational planning, persistent memory and OpenAI models; page inconsistently describes agent model assignments in different paragraphs, so exact stable assignment is not assumed. No published phoneme-score rubric/validated test equivalence established. Recognition/transcript reliability ≠ proof of acoustic accent scoring.

## 6. Accents / varieties
Strong official evidence of tutor accent selection: “Practice US English with Tama or UK English with Skye.” FAQ: “you can learn American English online with Tama or practice with Skye's Scottish accent.” Also lists Brazilian Portuguese and European Portuguese as separate offerings. https://praktika.ai/learn/english (fetched). A Scottish tutor voice is not by itself proof of a dedicated Scottish-accent course for native English speakers; that use case remains **UNVERIFIED**.
Historical press: avatars “can speak with several accents, such as American, British, Asian, and Indian.” https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural/ . Broad labels are source terminology, not researcher's dialect taxonomy.

## 7. User acquisition
RevenueCat CEO interview report: “that was the month Praktika went from about $1M ARR to $12M.” Viral coach-correcting-learner video, replicated with creators internationally. Quote: “we started just replicating those videos with other creators in other countries as well.” “The creator program is past 100 influencers and is still being scaled country by country.” Organic creator and paid ad rosters separate: “This is paid ads and organic content. This creator program that those two are separate streams. We don't mix them up”. https://www.revenuecat.com/blog/growth/adam-turaev-praktika-sub-club-podcast-2026 . Founder attribution, not causal experiment; $12m is ARR level, not one month's earned revenue.

## 8. 2025–2026 news
Jan 2026 OpenAI case study: “After introducing their new long-term memory system, Praktika saw a 24% increase in Day-1 retention and doubled revenue in just a few months.” https://openai.com/index/praktika/ . Vendor case-study claims, no cohort/baseline disclosed here. Oct/Nov 2026 founder growth interviews above. No verified new funding announcement in this pass.

---
# Loora
Research date 2026-11-15, US context. Public sources fetched; prices not purchased. Old loora.ai and newer loora.com official pages both consulted.

## 1. Product / audience
“Speak fluent English with Loora ... Engage in personalized conversations with your speaking partner, receive feedback”. Business, education and personal English learners; site includes interviews, meetings and advanced conversation. https://www.loora.ai/ (fetched).

## 2. Official web pricing
Monthly, 3-month, annual; all same features. Exact US amounts **UNVERIFIED**: https://www.loora.ai/pricing exposed no usable amounts; current official billing page intentionally withholds a single amount: “Loora's prices vary depending on your country and current promotions.” “We don't list a single number here because it changes.” “Prices on the website are usually shown in USD.” “App Store, Google Play, and website prices can differ because each store runs its own offers.” https://www.loora.com/support/billing-and-subscription/pricing-plans (fetched).
“You get one free lesson so you can try Loora before you decide. After that, Loora is a subscription app.” Same source. Monthly billed monthly, 3-month and yearly prepaid per page; no app-store/NIS price substituted for US web.

## 3. Revenue / users
Sep 16 2026 founder statement: “15 million learners, 200 million interactions with Loora. Revenue’s more than doubled in the last twelve months and ARR is in the tens of millions. More than 100 corporations, governments and universities are also now using the B2B product we built over the last year.” https://www.loora.com/news/company-news/loora-raises-22m-funding (fetched). Exact revenue/ARR dollar figure, DAU, MAU and paid count **UNVERIFIED**; cumulative learners ≠ active users. No unsupported app-analytics estimate used.

## 4. Funding
Same official dated release: “we’ve raised $22m which takes our total funds raised to $43.25m. We’re delighted to partner with Union Tech Ventures who led the round, with participation from vgames and existing investors Emerge, Hearst Ventures and QP Ventures.” https://www.loora.com/news/company-news/loora-raises-22m-funding . Latest located financing September 2026; valuation UNVERIFIED/not supplied. Round described as Series B by Globes search result: https://en.globes.co.il/en/article-israeli-ai-english-tutor-loora-raises-22m-1001556728 (search-only classification; not independently fetched). Prefer official Union lead wording over secondary co-lead interpretation. Crunchbase not used.

## 5. AI / HOW assessed
- Official product claims “advanced speech recognition to analyze your accent” and identify problematic sounds; “a bespoke system of cutting-edge large language models, specifically trained and optimized” https://www.loora.ai/ . Named acoustic/LLM vendor UNVERIFIED.
- “Open the Pronunciation tab on the same card for an overall sentence score, plus a per-word score for anything that needs work.” Grammar underlines and pronunciation highlights can be tapped for explanation/practice. https://www.loora.com/support/features/feedback-and-corrections (fetched).
- “You also get three speaking scores from 0 to 100.” Fluency: pace, pauses, sentence production; pronunciation: clarity/intelligibility; grammar: corrections needed. Essential caveat: “These describe how well you’re doing at your current level, not how close you are to a native speaker.” “Your Loora scores are practice feedback ... They’re not an official assessment of your English level.” https://www.loora.com/support/features/how-does-loora-measure-progress (fetched). CEFR-linked practice scores are not certification.

## 6. Accents
Verified official selector: “Both. You can choose British or American English in your settings.” “Tap English type and choose American English or British English. Loora's accent and vocabulary follow your choice.” https://www.loora.com/support/features/british-or-american-english (fetched). Voice and speed also adjustable. Native-English-speaker course specifically teaching other English accents **UNVERIFIED**; choice of target variety alone does not establish that use case.

## 7. Acquisition
Vendor marketing case study, July 13 2026: VP Marketing quote “As we expanded our web funnel efforts, static ads became a major growth lever for us.” Another quote: “Today, over 60% of our static ads are created with Spiral's involvement”. Exact result “3x increase in winning static ad production” measures ad output, NOT user/revenue growth. https://www.spiral.ad/blog/how-loora-scaled-winning-static-ad-production-by-3x-with-spiral (fetched). B2B distribution established by company release above; paid CAC/referral share UNVERIFIED.

## 8. 2025–2026 news
September 2026 funding/B2B expansion and July 2026 paid-creative case study above. Company says “We are growing our team from 30 to 60 in the next six months” in funding release; plan, not verified completed hiring. No separate verified 2025 milestone in this pass.

---
# Talkpal
Research date 2026-11-15; US context; public pages fetched, no checkout.

## 1. Product / audience
“Talkpal is an AI-powered language tutor available on web and mobile platforms ... chat about interesting topics by writing or speaking, and receive realistic voice messages”. General language learners, also institutions. https://talkpal.ai/pricing/ .

## 2. Official web pricing
Fetched https://talkpal.ai/pricing/ lists Basic Plan “Free”, “10 minute daily limit”; Premium 1 Month, Premium 12 Months, Premium 24 Months, each “14 Day Free Trial” and “Try for 0.00”. Paid dollar/currency amounts **UNVERIFIED**: rendered text shows only “/ month”, no numerical rate. Trial price is not renewal price. “Prices & currencies may vary depending on your location.” No US app-store or analytics-site prices substituted. Premium includes “Unlimited practice with all AI modes”, pronunciation assessment and AI daily feedback. Institutional prices contact sales per same source.

## 3. Revenue / users
Official pricing page: “10,000,000+ Users 130+ Languages available”. Same numbers in dated Sept 3 2026 press release: “Offering more than 130 languages and trusted by over 10 million users”. https://talkpal.ai/press-releases/talkpal-ai-launches-advanced-pronunciation-feedback-tool/ . Cumulative marketing users, not active or paid. Revenue, DAU, MAU and current paid subscribers **UNVERIFIED**; searched revenue/funding press, excluded modeled Airbridge/app analytics and unsourced LinkedIn annual revenue.

## 4. Funding
Historical bootstrapping report: title “Georgian AI Startup Talkpal Surpasses One Million Users in Its First Year Without External Funding”; body “Talkpal has no immediate plans to seek additional capital, given its rapid growth and self-sufficiency.” https://cbw.ge/startup/georgian-ai-startup-talkpal-surpasses-one-million-users-in-its-first-year-without-external-funding (fetched; page displays relative date, not exact date). This does NOT establish zero funding as of today. Current total, latest round, valuation and investors **UNVERIFIED** after targeted funding search. Crunchbase fetched https://www.crunchbase.com/organization/talkpal-9cde but financial fields obfuscated; dummy Jan 1 1970/Lorem ipsum events ignored, not treated as rounds.

## 5. AI / HOW speech is assessed
Official Sept 3 2026 launch: “this cutting-edge feature evaluates speech accuracy down to individual sound units (phonemes)” and “Phoneme-Level Accuracy Analysis: Evaluates spoken speech to measure how closely a learner’s individual phonemes match those of a native speaker.” https://talkpal.ai/press-releases/talkpal-ai-launches-advanced-pronunciation-feedback-tool/ (fetched). Model/vendor and independent scoring validation **UNVERIFIED**.
Voice output vendor confirmed separately: “Talkpal chose to use Realtime TTS across their platform, powering multilingual AI teachers, role-play characters, and various other learning modes for both its free and paid users.” Inworld case study Jan 13 2026, “Realtime TTS 1” and voice cloning. https://inworld.ai/blog/talkpal-ai-scales-to-5-million-language-learners-with-inworld-tts (fetched). TTS is generated audio, NOT evidence Inworld performs speech scoring.

## 6. Accents
Selectable regional English/Spanish accent settings and native-English-speaker accent retraining **UNVERIFIED**. Searched official support/accents/settings and launch material. Broad native-speaker-phoneme comparison above does not identify regional target. Third-party competing app claims of British/American/Australian selection were not accepted without an official setting source. Generic SEO articles on Talkpal domain not treated as proof of shipped features.

## 7. Acquisition
Official press index confirms referral launch: “October 7, 2026 Talkpal AI Introduces Referral Program: Learn with Friends and Earn Free Premium Access”. https://talkpal.ai/press/ (fetched). Reward amount and incremental acquisition contribution UNVERIFIED. Pricing FAQ: institutions “can purchase subscriptions for their students in bulk”; B2B/B2E distribution offer, not measured growth attribution. https://talkpal.ai/pricing/ .

## 8. 2025–2026 news
Sept 2026 phoneme feedback launch above. Official press index: “November 4, 2026 Talkpal AI Introduces Podcasts to Help Learners Improve Listening and Reading Through Stories”; “November 2, 2026 Talkpal AI Introduces Flashcards to Make Memorizing Vocabulary Fast and Easy”. https://talkpal.ai/press/ . Inworld vendor A/B test report: “40% reduction in TTS costs”, “7% increase in feature usage”, “4% lift in user retention”; four-week experiment, not independent audit. https://inworld.ai/blog/talkpal-ai-scales-to-5-million-language-learners-with-inworld-tts .

---
# Langua / LanguaTalk
Research date 2026-11-15; US context. Langua AI subscription distinguished from LanguaTalk human-tutor marketplace.

## 1. Product / audience
“Gain confidence rapidly by speaking with an AI language tutor that’s available 24/7.” Conversations, roleplays, podcasts, vocabulary flashcards. https://languatalk.com/langua (fetched). “Langua is most popular with A2-B2 level learners” but offers beginner guided course: https://languatalk.com/ (fetched).

## 2. Official pricing
https://languatalk.com/langua lists Unlimited and Standard (homepage calls latter Communicate (Standard)). Exact individual US dollar monthly/yearly totals **UNVERIFIED**: fetched page and /langua/pricing did not expose amounts. Standard: “calls are limited to 30 minutes/day, or 75 messages in standard chat mode.” Unlimited: “Unlimited conversation practice.” Both all languages/features. Geo-specific pricing UNVERIFIED; no assumption the displayed dollar symbol is a US checkout total.
Official institutional price quote: “We also provide customized plans for schools, universities, and companies around the world. Pricing starts at $500/month.” Same URL; currency only shown as $, specific region not stated.
Trial: “5 days with a monthly plan or 7 days with an annual plan”; web-only “30-day money-back guarantee”. Same URL. Individual paywall totals not replaced with third-party/app-store prices.

## 3. Revenue / users
- Founder Don Pottinger July 31 2025: “Langua hit $308K MRR this month (almost $3.7M ARR).” “$0 to $308K MRR in 18 months”. https://www.linkedin.com/posts/donpottinger_edtech-ai-entrepreneurship-activity-7356782542265425920-vaai (fetched). Self-reported recurring run rate, not recognized annual revenue.
- Official reviews page updated Nov 10 2026: “Since 2024, Langua has grown from 0 to over 35,000 Pro subscribers - mostly through word of mouth.” https://languatalk.com/blog/languatalk-reviews/ (fetched). Wording does not resolve cumulative subscriptions versus currently active paid accounts. Homepage older/different metric: “30,000+ learners choose Langua”. https://languatalk.com/ . Do not combine as a subscriber conversion rate. DAU/MAU/current 2026 revenue **UNVERIFIED**.

## 4. Funding
Public database dated Oct 13 2026: “LanguaTalk has not raised any funding rounds yet.” https://tracxn.com/d/companies/languatalk/__o_VW_PwP1y6K9HxlTayC5l0xy4r9A5O5vqVciTe_7No (fetched). Database claim, not independently confirmed zero capital. No verified round, valuation or investors found in funding search; label **UNVERIFIED** rather than invent them. Crunchbase not used.

## 5. AI / HOW speech assessed
Official Jan 20 2025 pronunciation help: “If you pronounce something inaccurately, you'll see that the wrong words are transcribed as the AI is unable to fully understand what you've said.” Limited explicit scoring: “on the web version, if you're learning Spanish, French or English and you click the lightbulb at the bottom for a suggested reply, you can say it and receive a score on your pronunciation. We may add this elsewhere but haven't prioritised it as the technology is not 100% accurate.” https://support.languatalk.com/article/161-can-langua-help-me-improve-my-pronunciation (fetched). ASR transcription mismatch not equivalent to validated phoneme assessment.
Sep 2026 changelog: “‘V1’ Call Mode ... can actually hear you rather than waiting for your speech to be transcribed”. Different call versions coexist. https://support.languatalk.com/article/152-see-the-latest-updates-on-langua (fetched). Named scoring/LLM vendor and formal speech rubric UNVERIFIED. Landing page promises detailed post-conversation reports and optional verbal/subtle/explicit corrections: https://languatalk.com/langua .

## 6. Accents
Official selection: “You can choose characters from different regions, each with their own native dialect.” https://languatalk.com/ . “Multiple native dialects to fit your preferences (depends on language)” https://languatalk.com/langua . Specific current British/American and Spain/LatAm inventory **UNVERIFIED** in fetched public page, not inferred from general claim.
Nov 2026 changelog: “Choose your tutor’s voice style ... select Classic if you want the old voice style.” “Due to pronunciation issues with Classic, the guided course, French, Japanese and the voice Lucy always use New.” https://support.languatalk.com/article/152-see-the-latest-updates-on-langua . Native-English-speaker accent-training course **UNVERIFIED**.

## 7. Acquisition
“We've grown rapidly through word-of-mouth recommendations from users and language teachers on YouTube.” https://languatalk.com/ . Company Pro subscriber statement says “mostly through word of mouth” https://languatalk.com/blog/languatalk-reviews/ . Self-reported attribution; paid CAC/share UNVERIFIED.

## 8. 2025–2026 news
2025 founder revenue milestone above. November 2026 “Podcasts, audio and text imports <> chat integration now live on web (matching the app)” and voice-style toggle; September direct-audio call version; October improved beginner guided course. https://support.languatalk.com/article/152-see-the-latest-updates-on-langua . Month-only changelog, exact release days not specified.
# Accent findings (lead, accessed 2026-11-15)
- Praktika: Help Center "How do I change the tutor's accent? ... American, British, Australian, and Asian" https://intercom.help/praktika-ai/en/articles/10707916-learning-process ; praktika.ai/learn/english "Practice US English with Tama or UK English with Skye"
- Loora: "Both. You can choose British or American English in your settings." https://www.loora.com/support/features/british-or-american-english
- Duolingo: no separate Spain Spanish course; blog posts on dialects https://blog.duolingo.com/english-dialects/ ; third-party https://learnspanishoutloud.com/articles/does-duolingo-teach-spain-spanish/
- Talkpal: language list includes "English" and "English (British)", "Portuguese (European)" https://talkpal.ai/support/how-many-languages-is-talkpal-ai-available-in/ ; blog says accents (SEO content, not a product feature) https://talkpal.ai/mastering-accents-in-english-tips-to-speak-like-a-native/
- Third-party comparison of accent choice: https://speakshark.com/blog/english-speaking-apps-british-australian-accents
- Langua: "For many languages, we have characters covering different dialects. The pronunciation and vocabulary is specific to the given country"; voices "cloned from real people, including well-known YouTubers" https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide ; "Multiple native dialects to fit your preferences (depends on language)" https://languatalk.com/ai-spanish-tutor
- Speak: third-party review says no accent/voice selection https://practiceme.app/vs/speak (UNVERIFIED by official source; competitor-written)
- Babbel: offers European Spanish and Mexican Spanish as separate courses for English speakers https://support.babbel.com/hc/en-us/articles/205600508-Available-languages ; help center mentions "American or British English and Mexican or European Spanish" versions https://support.babbel.com/hc/en-us/articles/19186914547346-Changing-languages
- ELSA Speak (not in lane, reference): British among accent choices https://toneperfect.app/english/best-british-pronunciation-apps (third party)
- YouGlish can filter UK/Scottish speakers (same source) -- free reference tool
- 21 Accents (Amy Walker): YouTube Academy $4.99/mo GenAm, $8.99/mo RP+Australian https://www.21accents.com/21accentsacademy
