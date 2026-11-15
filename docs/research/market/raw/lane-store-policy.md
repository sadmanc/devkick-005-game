# Policy Notes — Sound Local (voice-first accent game, 13+, records voice → ElevenLabs/Anthropic)

All sources accessed 2026-11-15. Quotes under 25 words.

## Apple App Store Review Guidelines

- **3.1.2 Subscriptions** — auto-renewable subs allowed in any category but must give ongoing value. "the subscription period must last at least seven days and be available across all of the user's devices." Subs must work across devices; can't gate paid content behind tasks like social posting.
  https://developer.apple.com/app-store/review/guidelines/

- **5.1.1 Data Collection and Storage** — privacy policy required in metadata + in-app; must identify data collected, uses, retention/deletion, and confirm third parties get "the same or equal protection of user data." Consent required for data collection; "Paid functionality must not be dependent on or require a user to grant access to this data." Data minimization required.
  https://developer.apple.com/app-store/review/guidelines/

- **5.1.2(i) — NEW Nov 13, 2025** — Apple revised guidelines to call out AI explicitly: "you must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so."
  https://developer.apple.com/news/?id=ey6d8onl and https://techcrunch.com/2025/11/13/apples-new-app-review-guidelines-clamp-down-on-apps-sharing-personal-data-with-third-party-ai/
  → Voice recordings sent to ElevenLabs/Anthropic are squarely "personal data shared with third-party AI": needs an explicit disclosure + opt-in permission at runtime, not just a privacy-policy clause.

- **1.3 Kids Category** — for apps designed for children: "must not include links out of the app, purchasing opportunities, or other distractions to kids unless reserved for a designated area behind a parental gate." Kids-category apps may not include third-party advertising or analytics that collect/transmit data with limited exceptions (2019 update). **Sound Local at 13+ can stay out of Kids Category if it does not target under-13s — that avoids the third-party SDK ban (needed for ElevenLabs SDKs).**
  https://developer.apple.com/app-store/review/guidelines/ and https://developer.apple.com/news/?id=06032019j

- **1.2.1(a) / 4.7.5 (Nov 2025)** — creator/UGC-style apps "must … use an age restriction mechanism based on verified or declared age to limit access by underage users." Relevant if character dialogue is treated as age-rated content.
  https://developer.apple.com/news/?id=ey6d8onl

## Google Play

- **AI-Generated Content policy** — covers "text-to-text AI chatbot apps" and voice-generating apps; developers must "Prohibit and prevent the generation of Restricted Content" and "Give users a way to report or flag offensive content." Apps creating voice recordings of real people need extra scrutiny. → Sound Local must add an in-app report/flag flow for AI character output.
  https://support.google.com/googleplay/android-developer/answer/14094294?hl=en

- **Families / Target Audience policy** — must declare target age groups in Play Console; "Any apps that include children in their target audience must comply with Google Play's Families policy requirements" (Families Self-Certified Ads SDKs, stricter data rules). Google reviews declared audience vs. app content. → Declaring 13+ (teen + adult) avoids Families requirements; including under-13 triggers full Families + COPPA compliance.
  https://support.google.com/googleplay/android-developer/answer/9893335?hl=en and https://support.google.com/googleplay/android-developer/answer/9859655?hl=en

## FTC COPPA

- **Amended COPPA Rule (effective June 23, 2025)** — personal information now expressly includes "(10) A biometric identifier … voiceprints" and "(8) A photograph, video, or audio file where such file contains a child's image or voice." Privacy notices must name categories of third parties data is shared with and describe audio-file use/deletion. New §312.5(c)(9) exception: collecting a child's-voice audio file alone, only to answer a specific request, with immediate deletion, needs no verifiable parental consent.
  https://www.ecfr.gov/on/2025-06-23/title-16/chapter-I/subchapter-C/part-312 and https://bbbprograms.org/media/insights/blog/coppa-amended

- **2017 FTC Enforcement Policy Statement on voice recordings** — no enforcement when an operator collects a child's voice audio "solely to replace written words, for example to perform a search or fulfill a verbal instruction," uses it for nothing else, keeps it "only for the limited time necessary," deletes immediately, and discloses this in the privacy policy. Does NOT cover scoring, profiling, or sharing with third parties.
  https://www.federalregister.gov/documents/2017/12/08/2017-26509/enforcement-policy-statement-regarding-the-applicability-of-the-coppa-rule-to-the-collection-and-use

## What this means for an accent game aimed at 13+ that records voice and sends it to ElevenLabs/Anthropic

- Keep the 13+ floor and enforce it with an age gate (declared + ideally verified); Apple now explicitly wants age-restriction mechanisms. Under-13 use would trigger full COPPA — including parental consent for voice audio, which is expressly "personal information" — and Apple Kids/Google Families rules.
- Voice recordings are personal data under Apple 5.1.2(i) (Nov 2025) and COPPA: get explicit runtime permission before first recording and clearly disclose transmission to ElevenLabs and Anthropic as third-party AI.
- Transient-only retention is your strongest posture: it matches the FTC's 2017 safe-harbor logic and the amended Rule's §312.5(c)(9) deletion model — record, score, delete immediately, and say so in the privacy policy.
- Stay out of the Apple Kids Category and don't declare under-13 audiences on Play — Kids Category effectively bans third-party data SDKs (ElevenLabs) and ad/analytics SDKs.
- Build the Play-required in-app flag/report flow for AI-generated dialogue, keep subscription periods ≥7 days with ongoing value (3.1.2), and confirm ElevenLabs/Anthropic data-processing terms give "same or equal protection" as your privacy policy promises (5.1.1).
