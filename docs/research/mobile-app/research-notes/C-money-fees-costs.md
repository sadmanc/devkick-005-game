# Strand C — Money: store fees, payment rules, build & run costs (Sound Local)
All sources read 2026-11-15 unless noted. [n] = numbered source list at bottom. ASSUMPTION/INFERENCE = my reasoning; UNVERIFIED = not confirmed from a primary source.

## Key takeaways for the Sound Local decision
1. At Sound Local's size, Apple and Google take **15%** of in-app subscriptions (Apple Small Business Program covers revenue under $1M [1][3]; on Google, subscriptions are 15% in Canada and 10% + 5% billing in the US [8]). The "30%" figure does not apply to a startup selling subscriptions.
2. **US iOS:** since the Epic ruling, apps may add buttons and links to web checkout [5][6]. Apple charges **no commission on these today**, but the Ninth Circuit said Apple may later claim a "reasonable" one, and that rate is still undecided on remand [5][6][16].
3. **Supreme Court:** Apple v. Epic (No. 25-1311) was granted on 2026-06-30, with argument on **2027-01-11** [4]. INFERENCE: US link-out rules could change in 2027, so don't build the business on 0% Apple fees.
4. **Canada** has no special rule. Digital subscriptions sold inside a Canadian-storefront iOS app must use Apple's in-app purchase, and in-app links to web checkout are not allowed [17][18]. Google's new fee structure reaches Canada only by 2027-09-30 [8][10].
5. Apple's reader-app exemption excludes language-learning apps: it covers only magazines, news, books, audio, music and video, and excludes tutoring [2]. INFERENCE: Sound Local cannot use it.
6. Fees on the web are much lower: Stripe charges 2.9% + CA$0.30 (Canada) or 2.9% + US$0.30 (US) [20][21]. Merchant-of-record services that also handle sales tax charge 5% + 50¢ (Paddle, Lemon Squeezy) [22][23].
7. In RevenueCat's own US test, a web-only checkout cut the share of paywall taps that became trials from **65.6% to 39.1%**. RevenueCat's headline result was about **6% lower take-home revenue** for web than in-app purchase [27]. INFERENCE: lower fees on the web may not make up for lost conversions, so offer both.
8. Tooling is cheap at the start: Apple $99/yr, Google $25 once, Expo Free/$19/$199 per month, Xcode Cloud 25 hours/month included, RevenueCat free under $2.5k monthly revenue, Sentry and OneSignal have free tiers, and Expo/APNs/FCM push is free [30][31][33][36][25][41][39][40].
9. Hardware: a refurbished iPhone SE (3rd gen) is about CA$150 and a Galaxy A16 is about CA$215 [44][45]. A Mac mini M4 starts at US$599 new, or CA$929 refurbished from Apple Canada [37][38]. Cloud alternatives: GitHub macOS runners at $0.062/min and Codemagic at $0.095–0.114/min [35][34].
10. Duolingo's own data shows the value of streaks and push notifications: 7-day-streak learners are 2.4× more likely to keep going, and its notification bandit algorithm gave +0.5% DAU and +2% new-user retention [46][47][48]. INFERENCE: a mobile app with push notifications enables a proven retention lever that is weaker on the web, especially on iOS.

## 1. Apple
| Item | Current state (2026-11-15) | Src |
|---|---|---|
| Standard commission | 30%; 15% for members of the Small Business, Video, Mini Apps or News Partner Programs | [30] |
| Small Business Program | 15% if proceeds were ≤ US$1M in the prior calendar year (associated accounts counted together). If you exceed $1M, the standard rate applies to future sales. | [1] |
| Subscriptions | 70% to the developer in year one, 85% after one year of paid service (free trials don't count toward the year). Small Business Program members get 85% from day one. | [3] |
| US link-outs (Epic v. Apple) | The 2025-04-30 contempt order barred Apple from restricting buttons, links and calls to action, and from charging commission on linked-out purchases. On 2025-12-11 the Ninth Circuit affirmed the contempt finding, found Apple's 27% fee prohibitive, and kept the ban on link and button restrictions. It reversed the blanket zero-commission ban, so Apple may seek a "reasonable" commission on remand. | [5][6] |
| US today | US-storefront apps need no special Apple permission (entitlement) to add buttons, external links or calls to action pointing to web checkout. Apple has not set a US link-out commission rate as of 2026-09/11. | [17][16][19] |
| District court (remand) | Apple filed a remand proposal (dkt 1708, Aug 2026). There was a ruling on Apple's motion to stay pending Supreme Court review (dkt 1706; details UNVERIFIED). A joint status filing (dkt 1720, Oct 2026) says the remand schedule had not started. No rate has been set. | [13][14][15] |
| Supreme Court | No. 25-1311: petition filed May 2026; cert granted 2026-06-30, limited to Question 1; Justice Kagan denied Apple's application 26A194 on 2026-08-13; Epic's brief filed 2026-11-13; **argument 2027-01-11**. | [4][12] |
| Canada | No Canada-specific rule found. Guideline 3.1.1(a) bans calls to action toward non-IAP purchasing in every storefront except the US, unless a region-specific entitlement applies. UNVERIFIED: no pending Competition Bureau action was found. | [17][18] |
| EU (DMA) | New business terms published 2026-08-18, effective 2026-10-01. A 5% Core Technology Commission replaces the old Core Technology Fee. Alternative payments are allowed alongside IAP. A secondary source says the standard EU in-app rate is now 26% (UNVERIFIED in primary). | [9][24][19] |
| Japan (MSCA, iOS 26.2, Dec 2025) | Apple commission: 21% standard; 10% for Small Business members and for subscriptions after year one; plus 5% if Apple processes the payment. Link-out purchases pay a 15% "store services commission" (10% for Small Business/subscriptions after year one) on sales within 7 days of the link tap. | [11][26][28] |
| South Korea | Third-party payment processors (KCP, Inicis, Toss, NICE) are allowed through a Korea-only app build. Apple takes 26%, and the processor's fees come on top, so this costs more than 15% IAP for Small Business members. | [29][42][43] |
| Reader-app exemption | Covers apps whose primary function is magazines, newspapers, books, audio, music or video. Apps using it must not offer IAP or real-time person-to-person services such as tutoring. INFERENCE: not available to a language or accent app. | [2] |

## 2. Google Play
| Item | Current state | Src |
|---|---|---|
| Legacy rates (rest of world, incl. Canada until rollout) | 15% on the first $1M per year, 30% above it; 15% on subscriptions | [8] |
| New structure (from the Epic settlement of 2026-03-04) | Service fee and billing fee are split. In-app purchases on new installs: 20% (15% with the Apps Experience or Play Games Level Up programs) + 5% billing. Subscriptions: 10% + 5% billing. First $1M: 10% + 5%. The billing fee applies only when Google Play Billing is used. | [8][10] |
| Rollout dates | EEA, UK and US by 2026-06-30. Australia by 2026-09-30. Korea and Japan by 2026-12-31 per the blog; the fee page shows Japan at 2026-09-30, and a news report confirms Japan went live 2026-09-30. Rest of the world, including Canada, by **2027-09-30**. | [10][8][18] |
| US injunction | Since 2025-10-29, US developers may link to external purchases, use alternative in-app billing, and set different prices. Fee programs launched 2025-12-09. Developers enrolled in external links must report and pay fees from 2026-10-01; the deadline for download fees is 2027-02-01. A revised injunction is pending. | [7][32] |
| US external links | Fees apply to purchases within 24 hours of a link tap. Developers must use Google's info-screen APIs and provide refunds and customer support. External-install fees: US$3.65 for games, US$2.85 for other apps (secondary source). External web purchases avoid the 5% billing fee but still pay the service fee. | [32][49][50] |
| User Choice Billing / EU | Pilot in 35+ countries including the EEA. In Australia, EEA, Japan and UK: 10% on the first $1M and on recurring subscriptions when alternative billing is used. Brazil, Indonesia and South Africa: 4% off the standard fee. | [51] |

## 3. Web payments and competitor pricing
| Vendor | Price | Src |
|---|---|---|
| Stripe Canada | 2.9% + CA$0.30 per domestic card payment | [20] |
| Stripe US | 2.9% + 30¢ per domestic card payment (plus 0.5% for Stripe Billing subscriptions, seen on a Stripe page; UNVERIFIED which page) | [21] |
| Paddle (merchant of record: handles tax and chargebacks) | 5% + 50¢ per checkout transaction, no monthly fee | [22] |
| Lemon Squeezy (merchant of record) | 5% + 50¢; +1.5% international, +1.5% PayPal, +0.5% subscriptions | [23][52] |
| RevenueCat | Free up to $2,500 monthly tracked revenue (measured before store fees), then 1% | [25][53] |
| Superwall | Subscription infrastructure free. Paywalls: $0/mo up to $10k monthly attributed revenue then 1%; paid plans $49/mo or $199/mo + 1%; custom | [54] |
| Duolingo | The web Super page lists no prices. US App Store in-app items: $9.99 or $12.99 monthly; $79.99, $83.99 or $95.99 yearly (secondary source; UNVERIFIED in primary). Max is being phased out Nov 2026 (secondary). | [55][56] |
| Speak (iPhone, USD, Oct 2026) | Premium $17.99/mo or $83.99/yr; Premium Plus $39.99/mo or $164.99/yr; 7-day trial (secondary) | [57] |
| ELSA | From $7.50/mo (ELSA Pro); $89.99–$99.99/yr (secondary, checked 2026-11-02). A web-vs-in-app price difference is UNVERIFIED. | [58][59] |

## 4. Conversion evidence
- **RevenueCat test, IAP vs web (US):** tap-to-initial-conversion was 70.9% with IAP vs 44.4% web-only. Tap-to-trial was 65.6% vs 39.1%. Initial conversion was about 27.0% for IAP-only. Trial-to-paid was slightly better on the web, but take-home revenue was about 6% lower [27].
- **Trial length (17,000+ apps):** Education apps mostly use 5–9-day trials. Monthly plans: 5–9-day trials convert 45.9% of trial users vs 39.6% for ≤4 days; 10–16-day trials convert 46.6% with a 72.0% first renewal; 17–32-day trials convert 43.7% with 77.5% renewal. Weekly plans: 24.3% vs 22.3% [60].
- **State of Subscription Apps 2026:** based on 115k+ apps and $16B+ in revenue [61]. Education-specific figures inside the report are UNVERIFIED (the report requires a form to download).

## 5. Build and run costs
| Item | Price | Src |
|---|---|---|
| Apple Developer Program | US$99/yr (fee waivers for nonprofits, schools, government) | [30][62] |
| Google Play Console | US$25 one-time | [31] |
| Expo EAS | Free: up to 15 Android + 15 iOS low-priority builds/mo. Starter: $19/mo incl. $45 build credit. Production: $199/mo incl. $225 credit. Enterprise: from $1,000 credit | [33] |
| Codemagic (pay as you go) | Mac mini M2 $0.095/min, M4 $0.114/min, Linux/Windows $0.045/min. Fixed plans $3,990/$5,400/$9,000 per year | [34] |
| Xcode Cloud | 25 compute hours/mo included with membership. Paid plans from US$49.99/mo up to US$3,999.99/mo (10,000 hours) | [36] |
| GitHub Actions | macOS 3–4 core $0.062/min; Linux 2-core $0.006/min | [35] |
| Mac mini M4 | From US$599 (US$499 education) at launch. Apple Canada refurbished M4 CA$929 (was CA$1,099). Current new Canadian price UNVERIFIED | [37][38] |
| Test devices | Refurbished iPhone SE 3rd gen from CA$150 (SubSell, 2026-11-14). Galaxy A16 128GB about CA$214.98 at Best Buy Canada (snippet) | [44][45] |
| BrowserStack | From $12.50/mo. App Live individual about $29–39/mo; Team $150–249/mo (billed annually; tier mapping UNVERIFIED) | [63] |
| Firebase Test Lab | Free (Spark) plan: 5 physical-device runs/day (30 min) and 10 virtual (60 min). Pay-as-you-go (Blaze): $5/hr physical, $1/hr virtual | [64] |
| Push notifications | APNs/FCM free (UNVERIFIED primary). Expo push is free to use. OneSignal Free covers up to 1,000 MAU; Growth from $19/mo plus $0.012 per MAU | [39][40][65] |
| Crash reporting | Sentry Developer plan: $0, one user. Team plan: $26/mo. Free-tier error quota UNVERIFIED | [41] |

## 6. Duolingo: streaks and notifications
- Learners who reach a 7-day streak are **2.4× more likely** to continue. Separating the streak from the daily goal raised Day-14 retention by **3.3%** and daily active learners by **1%**. The change raised the number of learners on 7+ day streaks by over **40%**, and the share of new learners on a streak by **19%** [46].
- The Recovering Difference Softmax bandit (KDD 2020) chooses which reminder to send and accounts for the novelty effect. It gave **+0.5% total DAU** and **+2% new-user retention** over a strong baseline [47][48][66].
- Former Head of Product (via Lenny's Newsletter): by mid-2018 DAU growth was single-digit year over year. Leaderboards, push notifications and streak optimization helped restart growth [67].
- Duolingo's tool for repairing streaks after site outages has protected over 2M streaks [68].

## Sources (all read 2026-11-15)
1. https://developer.apple.com/app-store/small-business-program/ — App Store Small Business Program
2. https://developer.apple.com/support/reader-apps/ — Reader apps (Apple)
3. https://developer.apple.com/app-store/subscriptions/ — Auto-renewable Subscriptions
4. https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html — Docket 25-1311 Apple v. Epic
5. https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf — Ninth Circuit opinion, Epic v. Apple, 2025-12-11
6. https://www.reuters.com/sustainability/boards-policy-regulation/us-appeals-court-partly-reverses-sanctions-against-apple-epic-games-antitrust-2025-12-11/ — Reuters
7. https://support.google.com/googleplay/android-developer/answer/15582165?hl=en — Google Play US policy update
8. https://support.google.com/paymentscenter/answer/112622?hl=en — Google Play service fees
9. https://developer.apple.com/support/apps-in-the-eu — Apple: apps in the EU
10. https://developer.android.com/blog/posts/a-new-era-for-choice-and-openness — Android Developers blog 2026-03-04
11. https://www.apple.com/newsroom/2025/12/apple-announces-changes-to-ios-in-japan/ — Apple newsroom, Japan
12. https://www.supremecourt.gov/qp/25-01311qp.pdf — Question presented 25-1311
13. https://9to5mac.com/wp-content/uploads/sites/6/2026/08/Epic_Games_Inc_v_Apple_Inc__candce-20-05640__1708.0.pdf — Apple remand proffer
14. https://storage.courtlistener.com/recap/gov.uscourts.cand.364265/gov.uscourts.cand.364265.1706.0.pdf — Order on motion to stay
15. https://9to5mac.com/wp-content/uploads/sites/6/2026/10/gov.uscourts.cand_.364265.1720.0.pdf — Joint status
16. https://www.macobserver.com/news/app-store-link-out-commission-rate-not-set-us/ — MacObserver 2026-09-12
17. https://storerules.com/rules/apple/app-review-guidelines/3.1.1-a — Guideline 3.1.1(a) mirror (primary: https://developer.apple.com/app-store/review/guidelines/)
18. https://www.itl-inc.ca/en/blog/in-app-purchase-vs-web-checkout — ITL 2026-11-07
19. https://applescoop.org/story/what-apple-charges-developers-app-store-fees-us-eu-japan-by-region — AppleScoop 2026-11-09
20. https://stripe.com/en-ca/pricing — Stripe Canada pricing
21. https://stripe.com/pricing — Stripe US pricing
22. https://www.paddle.com/pricing — Paddle pricing
23. https://www.lemonsqueezy.com/pricing — Lemon Squeezy pricing
24. https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union/ — Apple newsroom EU (URL from search; UNVERIFIED fetch)
25. https://www.revenuecat.com/pricing — RevenueCat pricing
26. https://developer.apple.com/support/payment-options-on-the-app-store-in-japan/ — Payment options in Japan
27. https://www.revenuecat.com/blog/growth/iap-vs-web-purchases-conversion-test — RevenueCat IAP vs web test
28. https://developer.apple.com/support/app-distribution-in-japan/ — Changes to iOS in Japan
29. https://developer.apple.com/contact/request/download/StoreKit_External_Purchase_Entitlement_Addendum_KR.pdf — Apple KR addendum
30. https://developer.apple.com/programs/whats-included/ and https://developer.apple.com/programs/enroll/ — Apple Developer Program
31. https://support.google.com/googleplay/android-developer/answer/6112435 — Play Console registration
32. https://support.google.com/googleplay/android-developer/answer/16470497?hl=en — External content links program (US)
33. https://expo.dev/pricing — Expo pricing
34. https://codemagic.io/pricing/ — Codemagic pricing
35. https://docs.github.com/en/billing/reference/actions-runner-pricing — GitHub Actions runner pricing
36. https://developer.apple.com/xcode-cloud/get-started/ — Xcode Cloud
37. https://www.apple.com/newsroom/2024/10/apples-new-mac-mini-is-more-mighty-more-mini-and-built-for-apple-intelligence/ — Mac mini M4 launch
38. https://www.apple.com/ca/shop/product/fu9d3ll/a/Refurbished-Mac-mini-Apple-M4-Chip-with-10-Core-CPU-and-10-Core-GPU-Gigabit-Ethernet- — Apple CA refurbished Mac mini
39. https://docs.expo.dev/guides/using-push-notifications-services/ — Expo push
40. https://onesignal.com/pricing — OneSignal pricing
41. https://sentry.io/pricing/ — Sentry pricing
42. https://devoria.fr/en/blog/app-store-south-korea-external-payment-26-percent — Devoria 2026-10-27
43. https://www.cnbc.com/2022/06/30/apple-opens-up-third-party-app-payments-in-korea-will-take-26percent-cut-.html — CNBC 2022
44. https://subselltrade.ca/en/buy/iphone-se-3rd-gen/ — SubSell iPhone SE
45. https://www.bestbuy.ca/en-ca/shop/mobile-phones-cell-phones-plans/galaxy-a16-128gb — Best Buy Canada Galaxy A16
46. https://blog.duolingo.com/improving-the-streak/ — Duolingo: Improving the streak
47. https://research.duolingo.com/papers/yancey.kdd20.pdf — Yancey & Settles, KDD 2020
48. https://www.kdd.org/kdd2020/accepted-papers/view/a-sleeping-recovering-bandit-algorithm-for-optimizing-recurring-notificatio.html — KDD abstract
49. https://www.strataigize.com/insights/google-play-external-payments-fee-changes-2026/ — Strataigize 2026-08-01
50. https://arstechnica.com/google/2026/06/google-starts-lowering-play-store-fees-making-good-on-epic-games-settlement/ — Ars Technica 2026-06
51. https://support.google.com/googleplay/android-developer/answer/13821247?hl=en — User Choice Billing
52. https://docs.lemonsqueezy.com/help/getting-started/fees — Lemon Squeezy fees
53. https://www.revenuecat.com/docs/welcome/set-up-revenuecat/account-management — RevenueCat MTR
54. https://superwall.com/pricing — Superwall pricing
55. https://www.duolingo.com/help/super-duolingo — Super Duolingo help
56. https://www.bestailanguagelearning.com/blog/duolingo-video-call-super-review/ — Duolingo Super review (secondary)
57. https://peabody.kids/resources/software/speak — Speak pricing (secondary)
58. https://toolradar.com/tools/elsa-speak/pricing — ELSA pricing (secondary)
59. https://elsaspeak.com/en/product-detail/elsa-pro-one-year — ELSA Pro product page
60. https://www.revenuecat.com/blog/growth/free-trial-length — RevenueCat trial length
61. https://www.revenuecat.com/state-of-subscription-apps — SOSA 2026
62. https://developer.apple.com/help/account/membership/fee-waivers/ — Apple fee waivers
63. https://www.browserstack.com/pricing — BrowserStack pricing
64. https://firebase.google.com/docs/test-lab/usage-quotas-pricing — Firebase Test Lab pricing
65. https://documentation.onesignal.com/docs/en/billing-faq — OneSignal billing FAQ
66. https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/ — Duolingo: AI behind notifications
67. https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth — Lenny's Newsletter
68. https://blog.duolingo.com/protecting-streaks-from-site-issues/ — Duolingo: Protecting streaks
