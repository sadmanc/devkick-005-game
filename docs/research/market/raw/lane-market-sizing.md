# Sound Local – Market sizing (partial, stopped early on lead's instruction)

Accessed date for every source: **2026-11-15**. Full URLs in `sources.md`; every number below is also a row in `market_sizes.csv` (with a strength label). `ASSUMPTION` = my modelling input; `DERIVED` = arithmetic on sourced numbers; `UNVERIFIED` = I could not confirm it; `NOT RESEARCHED` = I ran out of budget.

## 1. Headline
- Spending on consumer language apps is real but concentrated: about **$1.54bn** in app revenue in 2025 (Business of Apps, medium). Duolingo alone guides **$1.221bn** FY2026 revenue (IR, strong).
- Apps built around **speaking and pronunciation** show people will pay more for them: Speak at **>$100M annualised revenue** (Forbes ME, medium), BoldVoice at **>$10M ARR** and **$149.99/yr** (press release + its own checkout page), ELSA at **$89.99/yr** (third-party price check). None of these sells *regional* accents; they sell "standard" American or British English.
- My bottom-up model (section 4) gives: **TAM ≈ $0.9bn/yr** (range $0.5–1.5bn), **SAM ≈ $210M/yr** (range $100–300M), **year-3 SOM ≈ $1.4M ARR** (range $0.7–3M). All three are weak and rest on ASSUMPTIONs.
- **PRD check:** "1.5bn English speakers" is accurate as a headcount (Ethnologue 2025: 1.528bn), but it is not a market. "$3M ARR" needs about $3 per registered user, which is top-decile for a freemium app. It is plausible only if performers and students make up a large share of players (section 5).
- **Best segments to sell to first:** (1) actors, drama students and voice creators: small group, but they already pay $120–350 an hour for dialect coaches and are easy to reach through schools and unions; (2) international students and new arrivals in the UK and Canada, who match the Glasgow and Toronto regions. Teens playing for fun are the growth and marketing channel, not the main source of revenue.

## 2. Segment facts: who pays and how much

### 2.1 Language-learning apps
| Metric | Value | Strength |
|---|---|---|
| Language-app revenue 2025 | $1.54bn (+18.8%), 327M downloads | medium (aggregator) |
| All non-Duolingo language apps, in-app 2024 | ~$0.44bn gross (Appfigures) | medium |
| Analyst "language learning apps market" 2025 | $7.36bn → $28.3bn 2034 | **weak**; much broader definition, don't use |
| Duolingo Q3 2026 | DAU 64.9M (+29%), MAU 153.1M, paid subs 13.1M (+14%), revenue $309.0M, bookings $316.1M | strong |
| Duolingo guidance FY2026 | revenue ~$1,221M, bookings ~$1,296M; Q4 revenue ~$322M | strong |
| Duolingo FY2025 | revenue $1,037.6M; Q4'25 MAU 133.1M, DAU 52.7M, paid 12.2M | strong |
| Duolingo paid/MAU | 8.6% (DERIVED) | strong |
| Duolingo subscription bookings per paid sub | ~$85/yr (DERIVED: 278.4M×4/13.1M) | DERIVED |
| Duolingo Super US list price | $12.99/mo, $83.99/yr | medium (third-party check) |
| Babbel 2024 revenue | €284.9M per commercial-register data (net loss €8.3M) vs €352M aggregator estimate | **conflict**; register figure preferred |
| ELSA | claims ">100M users" on its blog, but its about page says "millions"; ~$60M raised; revenue UNVERIFIED (not disclosed); Pro $89.99/yr, $19.99/mo | users weak, funding strong |
| BoldVoice | >$10M ARR, 5M+ downloads, $21M Series A (Jan 2026); $149.99/yr, $24.99/mo | medium/strong |
| Speak | >$100M annualised revenue, ~15M downloads, 500 corporate customers, users pay ~$80–200/yr | medium |

**Who pays:** individual adults paying about $60–150 a year, mostly through the app stores. Speak and ELSA also sell to businesses.

### 2.2 English speakers and learners
- English speakers in 2025: 1,528M total = 390M first-language (L1) + 1,138M second-language (L2) (Ethnologue via Visual Capitalist; the Ethnologue page itself is **paywalled**). Medium.
- British Council says "1.4 billion people want to learn – or are learning – English" and that it supports 100M learners a year. Medium: this is a marketing page and shows no method.
- A British Council 2013 report (English Effect) estimated 1.75bn people speaking English "at a useful level". It is old; treat it as background only.

### 2.3 Pronunciation/accent training niche (analyst estimates: all WEAK)
- Accent training: $1.45bn (2024) → $4.01bn (2033) (Dataintelo).
- Accent-reduction platforms: $1.11bn (2025) → $1.29bn (2026) → $2.34bn (2030) (TBRC / Research and Markets).
- These reports don't publish their methods and probably include call-centre training services. The firmer evidence is bottom-up: Speak (>$100M) + BoldVoice (>$10M) + ELSA (undisclosed) puts **at least ~$110M a year** of visible consumer spend on speaking and pronunciation apps.

### 2.4 Speech coaching (WEAK)
- Public-speaking training: $3.6bn (2025) → $6.2bn (2032) (Stratistics via GII).
- Voice-training software: $4.2bn (2025) (Dataintelo). The definition overlaps with singing and voice apps.
- Neighbouring market, not core for Sound Local. NOT RESEARCHED further (e.g. Toastmasters, Yoodli, Orai).

### 2.5 Accents for fun (social content), as observed on 2026-11-15
- TikTok `#accents`: logged out, the page shows **71.4K posts** and **no view total** (TikTok no longer shows hashtag views to logged-out visitors). The `#accentchallenge` and `#guesstheaccent` pages returned no content to my fetcher, so I have **no direct count**. A third-party tracker (tiktokhashtags.com, 2024, **weak**) claims #accentchallenge has 267.7K posts and 5bn views, and #scottish 12.9bn views.
- YouTube view counts I saw in search results:
  - "One Woman, 17 British Accents" (Anglophenia): 11,973,571
  - Graham Norton, "Americans and Australians Trying To Understand A Scottish Accent": 8,673,097
  - "Political blooper: MP's Scottish accent baffles…": 8,367,955
  - "Gerard Butler Teaches You Scottish Slang" (Vanity Fair): 7,949,322
  - "How To Speak With A Scottish Accent": 6,938,995
  - "GUESS THE ACCENT": 6,526,008
  - "Match The Accent To The Person" (Cut): 5,022,120
  - "glaswegian accent": 4,767,880
  - "Guess My U.S. Accent" (Cut): 4,749,747
- **What this shows:** single videos about Scottish and Glasgow accents reach millions of views, so the attention exists for a "guess or do the accent" format. It says nothing about willingness to pay. People in this segment pay small amounts: the PRD's $2.99 Party Pass is an ASSUMPTION, and I did not test what people actually pay (NOT RESEARCHED).

### 2.6 Actors, drama students, voice talent
| Metric | Value | Strength |
|---|---|---|
| US actor jobs (BLS, 2024) | 57,000; median $23.33/hr; ~6,300 openings a year | strong |
| SAG-AFTRA | ~160,000 members (also covers broadcasters etc.) | strong |
| Equity UK | 49,294 members (2025 accounts); membership from £168/yr | strong / medium |
| ACTRA (Canada) | 30,000+ | strong |
| US visual and performing arts bachelor's degrees | 89,810 per year (2022-23, all arts; **drama share UNVERIFIED**) | strong |
| England creative-arts higher-education enrolments | 176,755 (2024/25, all creative arts) | weak (secondary source) |
| Voices.com | 4M+ registered voice actors and contributors (sign-ups, not active professionals) | medium |
| Global voice-over market | $4.4bn (2015 data, old vendor report) | weak |
| Dialect coach rates | $125/hr, $150/hr (coaches' own price pages); article range $120–350/hr | strong / medium |

**Who pays:** individual performers, out of their own pocket, to prepare for auditions; productions pay for on-set coaches; drama schools pay for teaching. One coaching hour ($125–150) costs more than a year of any app, so a $39 "Production Pass" or a ~$100/yr performer tier is cheap by comparison. Not researched: Spotlight UK and Backstage membership counts, number of drama-school places, and what schools pay per seat.

### 2.7 International students and immigrants
| Country | Value | Strength |
|---|---|---|
| US (IIE Open Doors 2024/25) | 1,177,766 students | strong |
| UK (HESA 2024/25) | 685,565 | strong |
| Canada (IRCC, study-permit holders at 31 Dec 2025) | 691,215 (down from 928,430 at end-2024 under the caps) | strong |
| Australia | 1,058,040 enrolments in 2025 (not unique students); 738,694 students Jan–Aug 2026 | strong |
| International migrants worldwide (UN DESA, 2024) | 304M | strong |

**Total international students in the US, UK, Canada and Australia ≈ 3.3M** (DERIVED; Australia counted on the 2026 year-to-date figure). The **UK and Canada, which match the Glasgow and Toronto regions, account for ≈ 1.38M**. **Who pays:** the student or their family; universities' international offices might pay for welcome or orientation packs (ASSUMPTION, NOT RESEARCHED). For price, the nearest comparisons are ELSA ($90/yr) and BoldVoice ($150/yr). Not researched: counts of recent migrants into English-speaking countries.

### 2.8 Call centres and business English
- Philippines (IBPAP, 2025): 1.89M IT-BPM full-time staff, of whom 1.68M work in contact centres and business-process services; revenue $40.3bn. Strong.
- India (NASSCOM): BPM revenue $54.6bn (FY2025 estimate). Export BPM employed 1.4M people in FY2021, ~33% in customer-interaction roles, which gives ~0.46M (DERIVED; old figure).
- Training cost: $500–1,500 per agent at onboarding, according to Krisp, a vendor whose product replaces that training (**weak**). An Indian consumer course costs ₹12,800 for 40 hours in a group and ₹18,800 one-to-one (provider's own page).
- Threat from software: Krisp's real-time accent conversion runs on 10,000+ seats at Everise (vendor case study). Companies may stop paying to train agents' accents.
- **Who pays:** the employer, buying per seat for a whole team. Call centres need a neutral or US accent, which Sound Local's planned regions don't offer. Not a near-term fit.

## 3. Gaps (NOT RESEARCHED / UNVERIFIED)
- Store-page reviews and rating counts for ELSA, BoldVoice and Speak. Not opened in the browser because I ran out of time.
- Direct TikTok view counts (not shown to logged-out visitors) and the #accentchallenge and #guesstheaccent counts.
- How many students study drama specifically, plus Spotlight and Backstage membership.
- How much companies spend on accent training overall (only vendor claims found).
- Migrant inflows by country; ELSA and Babbel subscriber counts; age bands for the UK, Canada and Australia (only the US was computed).
- How much the AI costs per conversation (PRD: $0.25–0.55, an ASSUMPTION) compared with the price. Not tested.

## 4. TAM / SAM / SOM (method shown; WEAK, driven by ASSUMPTIONs)

### 4.1 Top-down (cross-check only)
1. Consumer language-app spend in 2025 ≈ $1.54bn (medium).
2. Of that, visible spend on speaking and pronunciation apps is at least ~$0.11bn (Speak + BoldVoice; ELSA unknown).
3. Analyst estimates for the accent-training niche: $1.1–1.45bn (weak; probably includes call-centre services).
4. ⇒ Top-down, the relevant spend pool is roughly **$0.1–1.5bn**. Spend specifically on *regional-accent* practice is not reported anywhere (UNVERIFIED). It is a new category.

### 4.2 Bottom-up TAM (everyone who could pay, at a realistic annual price)
| Segment | People | Pay factor | $/yr | TAM |
|---|---|---|---|---|
| Performers (actors, students, voice, comedians) | 1.0M (ASSUMPTION: ~240k union members + ~100k students + non-union and aspiring; Voices.com's 4M is the upper bound) | 100% | $100 (ASSUMPTION; ≪ coach hourly rate) | $100M |
| International students in the US, UK, Canada and Australia | 3.3M (DERIVED) | 100% | $90 (ELSA) | $297M |
| People already paying for language apps who want a local accent | 20M payers (ASSUMPTION; Duolingo alone has 13.1M) × 25% interested (ASSUMPTION) | — | $60 (PRD) | $300M |
| Fun players aged 13–34 in English-speaking countries | ~145M (US 99.7M actual + ~45M UK/CA/AU/IE/NZ ASSUMPTION) × 2.18% (RevenueCat median) | — | $30 (passes, ASSUMPTION) | $95M |
| Call-centre agents (Philippines + India) | 2.14M (DERIVED) | 100% | $60 per seat (ASSUMPTION) | $128M |
| **Total** | | | | **≈ $920M (range $0.5–1.5bn)** |

### 4.3 SAM (what Sound Local's product can serve in about 3 years: browser game, Glasgow, Toronto, Mumbai and Singapore regions)
| Segment | SAM factor (ASSUMPTION) | SAM |
|---|---|---|
| Performers | 30% need one of the 4 regions or a general accent ear | $30M |
| Students | UK + Canada only: 1.38M × $90 × 50% who want local comprehension | $62M |
| Paying learners | 20% (most demand is for "standard" US/UK accents) | $60M |
| Fun players | 50% (Glasgow is fun for people anywhere; browser reach) | $47M |
| Call centres | 10% (the regions don't match the neutral/US accent they need) | $13M |
| **Total** | | **≈ $212M (range $100–300M)** |

### 4.4 SOM (year 3, using the PRD's 1M registered users)
| Mix of registered users (ASSUMPTION) | Users | Paying % | Revenue per payer/yr | ARR |
|---|---|---|---|---|
| Fun players 70% | 700k | 2% | $30 | $420k |
| Learners and students 15% | 150k | 4% | $60 | $360k |
| Performers 10% | 100k | 6% | $90 | $540k |
| Call-centre / school pilots | 2 deals × 1,000 seats | — | $40 | $80k |
| **Total** | | | | **≈ $1.4M ARR (range $0.7–3M)**, before app-store/Stripe fees and AI costs |

## 5. Testing PRD section 5.3
- **"~1.5bn English speakers/learners":** **holds as a headcount.** Ethnologue gives 1.528bn and the British Council says 1.4bn are learning. But it **doesn't hold as a market size**: about 390M are native speakers, most learners want "standard" English, and only a few million pay for any speaking app. Use it as context, not as TAM.
- **"1M users × 5% × $60 = $3M ARR":**
  - *$60/yr:* **holds** as a list price. Comparisons: Duolingo ~$85 of subscription bookings per sub (DERIVED); ELSA $89.99; BoldVoice $149.99. But the weekly and 8-week passes and app-store fees (15–30%, UNVERIFIED for this app) pull the realised revenue per payer down to about $30–50.
  - *5%:* **optimistic for a fun-first game.** RevenueCat's median freemium conversion is 2.18% (the top 10% reach 7.9%). Duolingo's 8.6% is paid subs as a share of *monthly active* users, not of everyone ever registered, after more than a decade of tuning. 5% of *registered* users works only if performers and students are a large share of the base.
  - *Per-user check:* $3M / 1M = $3 per registered user. BoldVoice makes about $2 per download (>$10M ARR / 5M downloads) as a hard-paywalled utility app. Speak makes about $6.7 (with business sales). A teen-heavy game is more likely to make $0.7–1.5 per user ⇒ **$0.7–1.5M**, unless the mix tilts towards performers.
  - The PRD's AI cost of $0.25–0.55 per conversation (ASSUMPTION) could use up most of a $30–60 payer's revenue if free players get unlimited AI chats. That needs its own check.

## 6. Recommendations
1. **First paying segment: performers** (actors, drama students, voice creators). Their existing spend is proven ($120–350/hr coaching), they are easy to reach through drama schools, Equity/SAG-AFTRA/ACTRA newsletters and audition-prep communities, and they need regional accents, which competitors don't offer. Selling licences to drama schools could add a business channel (NOT RESEARCHED).
2. **Second: international students and new arrivals in the UK and Canada** (~1.38M). There is a clear "I want to understand the locals" need, and the Glasgow and Toronto regions fit it directly. Reach them through university international offices and welcome weeks (ASSUMPTION).
3. **Fun/social players are for acquisition:** Scottish-accent videos get millions of views. Make the game shareable (clips, "guess the accent") and charge small pass prices; don't count on 5% conversion.
4. **Park call centres:** the money is large (1.68M Philippine contact-centre staff), but it needs a neutral/US accent and per-seat sales, and Krisp-style software accent conversion threatens it.
5. Update PRD section 5.3 to the ranges above, and plan revenue around performers and students rather than the 1.5bn headcount.
