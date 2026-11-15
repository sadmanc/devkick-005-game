# Sound Local: market and competitor analysis

*15 November 2026. Written for the founder. Docs only; no game code was changed.*

**How to read this.** Every outside number links to its source, and every source was accessed on 15 Nov 2026 (full list in [`sources.md`](sources.md); raw data in [`data/`](data/)). Labels:
- **WEAK**: an analyst estimate or aggregator figure with no visible method.
- **UNVERIFIED**: we could not confirm it from a primary page.
- **ASSUMPTION**: our own estimate, with the reasoning shown.
- **DERIVED**: our own arithmetic on sourced numbers.

Where a sentence says what Sound Local *should* do, that is our recommendation, not a fact.

---

## Executive summary (read this if nothing else)

**The space Sound Local wants is empty at scale, but no longer empty of ideas.** We looked at 60+ products: 30 accent and pronunciation apps, 13 big language and tutor apps, 11 accent games and party games, and 6 AI voice platforms and suppliers. **None with real users teaches fluent English speakers a regional accent through play, scored, by talking with characters.**
- The big accent apps (ELSA, 10M+ Google Play installs; BoldVoice, over $10M a year in revenue) do the opposite. They help non-native speakers sound "standard" American.
- The closest competitor is **Accentify** (UK). It sells "Duolingo-style" accent lessons to actors and native speakers, and human coaches mark the recordings. It is small: 10K+ installs, and its founder reports about 270 paying subscribers.
- In 2026 at least five tiny indie apps appeared that score your accent (Accent Coach, Accentuate, AnyAccent, Mimic, Accent Lab). None has more than 24 ratings.
- The window is open, but others are now trying the same idea, so expect it to last months, not years.

**The money is smaller and narrower than the PRD suggests.**
- "1.5 billion English speakers" is a headcount, not a market.
- Our bottom-up estimates are all WEAK and assumption-driven, with the method in section 1:
  - Everyone who could plausibly pay (TAM): about **$0.9bn a year**.
  - What Sound Local can reach in about three years (SAM): about **$210M**.
  - A realistic year-3 revenue share (SOM): about **$1.4M ARR**, in a range of $0.7–3M.
- The PRD's "1M users × 5% paying × $60 = $3M" needs top-decile conversion. The median freemium app converts about 2% ([RevenueCat](https://www.revenuecat.com/pdf/state-of-subscription-apps-2025.pdf)).

**Who pays is not who plays.**
- **Actors, drama students and voice creators** already pay $120–180 an hour for dialect coaches. Actors buy a $9.99 "North Glasgow Male" audio kit that does not even score them.
- **International students and new arrivals** in the UK and Canada (about 1.4M people) want to understand locals. They are the best fit for paying.
- **Teens and young adults playing for fun** bring reach and shareable clips, not much subscription revenue.

So price and package the product for performers and students, and make the content for fun players.

**The threats that matter are free general AI and Duolingo, not other accent apps.**
- ChatGPT voice will already do a Glaswegian accent and coach you for free.
- Duolingo ships new verticals fast (Chess, Video Call with AI characters) and has 64.9M daily users.
- Scoring pitch and rhythm is not a moat on its own: a Steam party game (Mimic Party) and an indie app (Accent Coach) already do it.
- What *can* be defended:
  - **local authenticity**: real local voices with consent, Local Accent Leads, and slang and context;
  - **the game and its characters**;
  - **being the place where accent content and creators gather first**.

**Growth in this category comes from creators.**
- Praktika went from about $1M to $12M ARR in a month after creators copied a viral video ([RevenueCat](https://www.revenuecat.com/blog/growth/adam-turaev-praktika-sub-club-podcast-2026)).
- BoldVoice's paid growth started with about $200 paid to one YouTuber.
- Accent videos are a proven thing people watch: single Glasgow and Scottish-accent YouTube videos have 4–9M views each.
- Paid installs ($1.5–4 each) do not pay back at a fun-game conversion rate. Lead with creators and shareable clips.

**Reviews of competitors show four openings.** These come from 469 reviews across 9 apps (section 3):
1. Scoring people don't trust.
2. "One correct accent" bias.
3. Microphone bugs.
4. Trial and paywall traps.

Users also call the accent apps "monotonous" drills. A kind, free-to-start, mic-first game with characters and a sense of place answers all of these.

### Top five takeaways
1. **Nobody at scale owns "regional accents as play".** The nearest rival (Accentify) is a lesson app with about 270 payers, and five tiny scored-accent apps appeared in 2026. Move now.
2. **Plan on $0.7–1.5M ARR at 1M registered users, not $3M.** Reaching $3M needs a performer- and student-heavy user mix.
3. **Performers and international students pay. Fun players spread the word.** Build the paid tier for the first two and the free game for the third.
4. **The real threats are ChatGPT voice and Duolingo.** The defence is local authenticity (Accent Leads, consented local voices), characters and the game, and getting to creators first. Pitch scoring alone is not a defence.
5. **Growth will come from creators and shareable clips, not paid ads.** A "locals rate my accent" share loop is the single most important GTM feature.

### Three things to do first
1. **Make the first 60 seconds work on a phone.** When we played it, the mic failed with no fallback, it took about 40 seconds to reach the first prompt, and at 844×390 the free-talk record button was off-screen. Mic bugs are the #1 complaint in competitor reviews. Add a mic check, a "type instead" fallback and a landscape layout before any marketing.
2. **Run a two-week Glasgow creator test for about $1,500–2,000.** Use 10 nano creators at $50–200 a video in a "Glaswegians rate my Glaswegian" format, with a share card in the game. Measure plays, shares and return visits.
3. **Pre-sell a performer tier to 3–5 drama schools or dialect coaches.** Offer the Production Pass at $39–49, and put a hard cap on AI turns for free players. This tests the segment most likely to pay before building more regions.

### Decisions you need to make (detail in section 8)
| # | Decision | Our recommendation |
|---|---|---|
| 1 | First paying segment | Performers (actors, drama students, voice creators), then international students |
| 2 | Region after Glasgow | Toronto (home market, students, low backlash risk); Mumbai only with Indian Accent Leads in place |
| 3 | Web or app stores first | Web first, with Stripe passes; apps once retention is proven |
| 4 | Pricing | Free game + $9.99/mo or $59.99/yr Pro with an AI fair-use cap; Production Pass $49 for 8 weeks; Party Pass $2.99/week |
| 5 | Free-tier AI | 3 AI conversations a week; scripted, cached lines for everything else |
| 6 | Age floor | 13+ declared, with an age gate; stay out of Kids categories |
| 7 | Business sales | Drama schools yes; call centres no (for now) |
| 8 | How to describe the score | "How a local hears you", never "accent accuracy %" |

---

## 1. Market size

### 1.1 What the segments look like
| Segment | Size signal | What they pay today | Strength |
|---|---|---|---|
| **Language-learning apps overall** | $1.54bn consumer app revenue in 2025, +18.8%, 327M downloads ([Business of Apps](https://www.businessofapps.com/data/language-learning-app-market/)). All non-Duolingo apps together made about $0.44bn in-app in 2024 ([Appfigures](https://appfigures.com/resources/insights/20250103?f=3)) | Duolingo Super $12.99/mo, $83.99/yr; about $85 of subscription bookings per paying user per year (DERIVED from the [Q3 2026 letter](https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067)) | medium |
| **Duolingo itself** | Q3 2026: 64.9M DAU (+29%), 153.1M MAU, 13.1M paying subscribers, $309.0M revenue; FY2026 guidance $1,221M ([Q3 2026 letter](https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067)) | 8.6% of MAU pay (DERIVED) | strong |
| **English speakers and learners** | 1.528bn speakers (390M first-language + 1.138bn second-language) ([Ethnologue via Visual Capitalist](https://www.visualcapitalist.com/ranked-the-worlds-most-spoken-languages-in-2025/)); British Council: "1.4 billion" learning or wanting to learn ([British Council](https://www.britishcouncil.org/english-assessment/teaching)) | A headcount, not spend | medium |
| **Pronunciation and accent apps** | Visible consumer spend of at least about $110M a year: Speak more than $100M annualised ([Forbes ME](https://www.forbesmiddleeast.com/innovation/startups/this-startup-is-racing-duolingo-to-replace-human-language-tutors-with-ai)) + BoldVoice more than $10M ARR ([PR Newswire](https://www.prnewswire.com/news-releases/boldvoice-raises-21m-series-a-to-give-a-billion-non-native-english-speakers-their-own-ai-voice-coach-302671777.html)); ELSA undisclosed. Analyst "accent training market" $1.1–1.45bn (WEAK: [Dataintelo](https://dataintelo.com/report/accent-training-market), [TBRC](https://www.researchandmarkets.com/reports/6259936/accent-reduction-platforms-market-global-report)) | ELSA $89.99–99.99/yr; BoldVoice $89.99–199.99/yr | medium / WEAK |
| **Speech coaching** | Public-speaking training $3.6bn; voice-training software $4.2bn (both WEAK; [GII](https://www.gii.tw/report/smrc1871949-public-speaking-training-market-forecasts-global.html), [Dataintelo](https://dataintelo.com/report/global-voice-training-software-market)) | A neighbouring market, not core | WEAK |
| **Accents as entertainment** | Glasgow and Scottish accent YouTube videos: 8.7M ([Graham Norton](https://www.youtube.com/watch?v=YRo9d4Gxj3I)), 7.9M ([Gerard Butler, Vanity Fair](https://www.youtube.com/watch?v=c42dvgPIfSk)), 4.8M ([“glaswegian accent”](https://www.youtube.com/watch?v=AXGP4Sez_Us)); "One Woman, 17 British Accents" 12.0M ([YouTube](https://www.youtube.com/watch?v=FyyT2jmVPAk)). TikTok #accents shows 71.4K posts logged out ([TikTok](https://www.tiktok.com/tag/accents)); view totals need a login (BLOCKED) | Watching is free. Accentle charges $1.99 for a day pass and $4.99/mo ([press page](https://accentle.com/press/)) | strong (views) |
| **Actors and voice talent** | SAG-AFTRA 160K ([site](https://www.sagaftra.org/about)), Equity UK 49,294 ([accounts](https://www.equity.org.uk/media/d1vbzj41/equity-annual-accounts-2025.pdf)), ACTRA 30K+ ([site](https://www.actra.ca/about-us/)); 4M registered on Voices.com (registrations, not working pros) ([Voices](https://www.voices.com/company/about)) | Dialect coaches $120–180/hr in the US ([Paul Meier](https://www.paulmeier.com/product/zoom-phone-coaching/), [Braden Lynch](https://www.bradenlynchstudio.com/accent-coaching)), £100–135/hr in the UK ([Rachel Coffey](https://www.rachelcoffeycoaching.com/actors-dialect)); The Accent Kit sells "North Glasgow Male" for $9.99 ([App Store](https://apps.apple.com/us/app/the-accent-kit/id854413379)) | strong |
| **International students** | US 1,177,766 ([IIE](https://www.iie.org/news/open-doors-2025-press-release/)); UK 685,565 ([HESA via British Council](https://opportunities-insight.britishcouncil.org/short-articles/news/new-data-releases-ucas-and-hesa)); Canada 691,215 study-permit holders, falling under the caps ([IRCC](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/committees/cimm-may-04-2026/international-students.html)); Australia about 739K unique students Jan–Aug 2026 ([DoE](https://www.education.gov.au/international-education-data-and-research/international-student-monthly-summary-and-data-tables)) | ELSA and BoldVoice prices ($90–150/yr) | strong |
| **Immigrants** | 304M international migrants worldwide ([UN DESA via Migration Data Portal](https://www.migrationdataportal.org/themes/international-migrant-stocks-overview)); not all move to English-speaking countries | — | strong (headcount) |
| **Call-centre and business English** | Philippines contact-centre workforce 1.68M FTE ([IBPAP](https://admin.ibpap.org/storage/hub-resources/7Hv9U2uoLJVx2kxyRMObNm6W6L0MR57l9dZfrez7.pdf)); India business-process revenue $54.6bn ([NASSCOM](https://nasscom.in/sites/default/files/media_pdf/Nasscom%20SR%20Press%20release.pdf)). Software is replacing training: Krisp accent conversion runs on 10,000 seats at Everise ([Krisp](https://krisp.ai/customers/everise/)) | A 40-hour group course in India costs INR 12,800 ([IIFLS](https://iifls.com/accent-neutralization-course-fees/)) | strong (size); poor fit |

**Growth.** Language-app spend is growing about 19% a year (Business of Apps), and Duolingo's DAU is up 29%. AI speaking apps are the fastest-growing part:
- **Praktika:** its CEO says $55M ARR ([podcast](https://exa.ai/library/podcast/6rv4cjd8krv/episode/m0lyl3b2344)).
- **Loora:** "tens of millions" of ARR.
- **Speak:** more than $100M.

Most of the growth is AI conversation, and that is the format Sound Local uses.

### 1.2 TAM / SAM / SOM (method shown; all WEAK)
**Top-down check.** About $1.54bn of consumer language-app spend, of which at least about $0.11bn is visible speaking and pronunciation spend. Analysts put "accent training" at $1.1–1.45bn, but that probably includes call-centre services. Spend on *regional-accent* practice is not reported anywhere, because it is a new category. Top-down gives a relevant pool of **$0.1–1.5bn**.

**Bottom-up TAM** (everyone who could pay, at a realistic annual price):
| Segment | People | Paying share | $/yr | TAM |
|---|---|---|---|---|
| Performers (actors, students, voice, comedians) | ~1.0M (ASSUMPTION: ~240K union members + students + aspiring) | 100% | $100 (ASSUMPTION) | $100M |
| International students (US, UK, CA, AU) | ~3.3M (DERIVED) | 100% | $90 (ELSA anchor) | $297M |
| Current language-app payers who want a local accent | 20M payers (ASSUMPTION) × 25% (ASSUMPTION) | — | $60 | $300M |
| Fun players aged 13–34 in English-speaking countries | ~145M (US Census 99.7M + ASSUMPTION for others) × 2.18% (RevenueCat median) | — | $30 | $95M |
| Call-centre agents (Philippines + India) | ~2.14M (DERIVED) | 100% | $60 (ASSUMPTION) | $128M |
| **Total** | | | | **≈ $0.92bn (range $0.5–1.5bn)** |

**SAM** (what a browser game with Glasgow, Toronto, Mumbai and Singapore can serve within about 3 years):
- performers 30% ($30M);
- UK and Canada students only, × 50% ($62M);
- paying learners 20% ($60M);
- fun players 50% ($47M);
- call centres 10% ($13M).

That totals **≈ $212M (range $100–300M)**.

**SOM, year 3** (based on the PRD's 1M registered users; mix and conversion are ASSUMPTIONS):
| Mix | Users | Paying | $/payer/yr | ARR |
|---|---|---|---|---|
| Fun players 70% | 700K | 2% | $30 | $420K |
| Learners and students 15% | 150K | 4% | $60 | $360K |
| Performers 10% | 100K | 6% | $90 | $540K |
| School pilots | 2 × 1,000 seats | — | $40 | $80K |
| **Total** | | | | **≈ $1.4M (range $0.7–3M)**, before store fees and AI costs |

**What this means for the PRD's numbers** (detail in [`raw/lane-market-sizing.md`](raw/lane-market-sizing.md)):
- **"1.5bn speakers":** correct as a headcount. Don't use it as TAM.
- **$60/yr:** fine as a list price. After weekly passes and store fees, realised revenue is more like $30–50 per payer per year.
- **5% conversion:** optimistic. The median freemium app converts 2.18%, and the top 10% reach 7.9% ([RevenueCat](https://www.revenuecat.com/pdf/state-of-subscription-apps-2025.pdf)). Duolingo's 8.6% is measured against *monthly active* users, after more than ten years of tuning.
- **Revenue per user:** BoldVoice makes about $2 per download (>$10M ARR / 5M downloads, DERIVED) with a hard paywall. A teen-heavy game is more likely to make **$0.7–1.5 per registered user**.

### 1.3 AI cost per user (a pricing constraint)
The PRD estimates AI cost at $0.25–0.55 per eight-turn conversation (ASSUMPTION, from the PRD). For a $9.99/mo Pro user (ASSUMPTION):
- After a 15–30% store fee, about $7–8.50 is left. The fee rate that applies is UNVERIFIED.
- 15 conversations a month costs $3.75–8.25 (DERIVED). That uses up roughly half to all of the margin.

So **Pro needs a fair-use cap** (we suggest 30 AI conversations a month, plus unlimited scripted play) until real per-conversation costs are measured.

Supplier prices that could lower this:
- Azure pronunciation assessment: about $1 per audio hour ([Azure docs](https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment); price from secondary sources because the pricing page was blocked, so treat it as MEDIUM).
- SpeechSuper: about $0.006 per sentence ([SpeechSuper](https://www.speechsuper.com/pricing)).

Both are listed in [`data/competitors_games_ai.csv`](data/competitors_games_ai.csv). They score against standard US/UK (and Indian) English, not Glaswegian, so at best they are a backup scorer.

---
