# Strand D: Voice data, privacy, safety and age rules for Sound Local
Research date: 2026-11-15 (every source was read on this date unless a different date is given). Labels: **UNVERIFIED** = I could not confirm it in a primary or reputable source; **INFERENCE/ASSUMPTION** = my own reasoning, not legal advice. Numbers in brackets such as [S1] point to the Sources list at the end.

## 1. Key takeaways for the Sound Local decision
1. **Raw voice recordings are personal data everywhere. They become "biometric" mainly when you extract a voiceprint or use the voice to identify someone.** Illinois BIPA, Texas CUBI and Washington all list "voiceprint", and Washington expressly excludes "audio recording" [S1][S4][S5]. GDPR Art. 9 and the ICO treat voice as special-category data only when it is processed for unique identification [S12][S13]. California's CCPA definition is broader: it covers voice recordings "from which… a voiceprint… can be extracted", but only where the data is used or intended to identify someone [S8].
2. **Biggest legal risk: BIPA.** It has a private right of action with $1,000 / $5,000 statutory damages per person (since SB 2979 of 2-Aug-2024; the 7th Circuit held on 1-Apr-2026 that the per-person cap also applies to cases already pending) [S2][S3]. Plaintiffs are actively testing whether stored voice clips count as "voiceprints". *Delgado v. Meta* survived summary judgment in Jun-2026 on a "could identify" theory [S31]. A class of about 1.2M Alexa Voice ID users was certified in Nov-2025 [S6][S7].
3. **Design rule that removes most of the risk (INFERENCE):** process pronunciation audio transiently. Do not build speaker embeddings or voice IDs, do not store raw audio by default, do not train on user audio, and say all of this explicitly in the privacy policy.
4. **Children under 13:** the amended COPPA Rule (effective 23-Jun-2025, compliance by 22-Apr-2026) lists audio files containing a child's voice as personal information and adds voiceprints [S16]. The audio-file exception (§312.5(c)(9)) only covers audio used to answer a child's specific request and deleted immediately [S17]. Sound Local's feedback loop could plausibly fit if nothing else is collected. Claude chat, accounts and analytics probably push it out of the exception (INFERENCE). **Recommendation: a 13+ age gate at launch. Do not target kids and do not use the Kids/Families category.**
5. **Teens 13–17:** Texas SB 2420 has been enforceable since the Supreme Court denied relief on 6-Jul-2026; Apple applied it from 4-Jun-2026 [S20][S21]. Utah developer duties started 6-May-2026, Louisiana's on 1-Jul-2026 [S22][S23], and California AB 1043 starts 1-Jan-2027 [S25]. A native app must read Apple's Declared Age Range API and Google's Play Age Signals API, and must handle parental-consent revocation and "significant change" consent [S21][S24].
6. **Third-party AI sharing:** Apple guideline 5.1.2(i) (13-Nov-2025) requires apps to clearly disclose sharing personal data with third-party AI and to get **explicit permission before doing so** [S26]. Sending voice to ElevenLabs and transcripts to Anthropic therefore needs an in-app consent screen before the first recording, on top of the iOS microphone prompt.
7. **Store labels:** Apple "Audio Data" and Google "Voice or sound recordings" must be declared because the audio leaves the device [S27][S29]. Google lets you avoid showing it if processing is truly ephemeral. Transfers to service providers such as ElevenLabs are not "sharing" on Google Play [S29]. Generative-AI apps on Google Play need an in-app way to report offensive output [S30].
8. **Vendor defaults:** Anthropic deletes API inputs and outputs within 30 days and does not train on them without permission; zero data retention (ZDR) is available via sales [S35][S36]. ElevenLabs by default **may use data to improve its models** unless you are on Enterprise or switch off "Improve the models for everyone"; its Zero Retention Mode is Enterprise-only [S33][S34]. Action now: switch off the data-use toggle and sign ElevenLabs' DPA.
9. **Canada:** the OPC's 2025 biometrics guidance treats voice as a behavioural biometric. Voiceprints are "sensitive" and may need express consent [S38][S39][S40]. Quebec Law 25 requires a privacy impact assessment (PIA) before personal information leaves Quebec (s.17; this includes US vendors) [S42]. A CAI declaration is needed only if you use biometrics to verify identity or create a biometric database [S41]. Ontario has no private-sector privacy statute; PIPEDA applies there (Bill 194 covers the public sector only) [S43].
10. **EU/UK:** AI Act Art. 50 has applied since 2-Aug-2026. You must tell users they are talking to an AI (the Claude NPCs), and the provider must mark synthetic audio as machine-readable (that duty falls mainly on ElevenLabs, and the marking deadline for systems already on the market is 2-Dec-2026) [S44][S45][S46]. The emotion-recognition ban covers workplaces and education *institutions*, so do not infer emotions from voice if you sell to schools [S47]. Since 5-Feb-2026 the UK requires services likely to be accessed by children to account for "children's higher protection matters" in privacy-by-design [S48].

## 2. Detailed findings

### Q1. Is a voice recording or a voiceprint "biometric"? (US)
| Law | Voice coverage (statutory text) | Raw audio excluded? | Enforcement / damages | Status today |
|---|---|---|---|---|
| **Illinois BIPA** 740 ILCS 14/10 | "Biometric identifier" = "retina or iris scan, fingerprint, **voiceprint**, or scan of hand or face geometry" [S1]. "Voiceprint" is not defined. | Not expressly excluded. The IL Attorney General said in 2017 that a voiceprint "is not the same as a simple recording of a voice" (quoted in *Carpenter v. McDonald's*, N.D. Ill. 2022) [S32] | Private right of action: $1,000 negligent / $5,000 intentional per violation. Written release required before collection; a public retention/destruction policy is mandatory | SB 2979 (P.A. 103-0769), signed and effective **2-Aug-2024**: one recovery per person regardless of the number of scans, and e-signatures count as written consent [S2]. The 7th Circuit held on **1-Apr-2026** (No. 25-2185) that the amendment applies retroactively [S3] |
| **Texas CUBI** Bus. & Com. Code §503.001 | "Biometric identifier" = "retina or iris scan, fingerprint, **voiceprint**, or record of hand or face geometry". Must inform and get consent before capturing for a commercial purpose [S4] | Not expressly excluded. The new (e)(2) exempts AI training/processing **unless the system is used to uniquely identify** an individual [S4] | Attorney General only; up to **$25,000 per violation** [S4] | The AG settled with Google for **$1.375B** on 31-Oct-2025 (covering geolocation, incognito and biometric claims together) [S9] |
| **Washington** RCW 19.375 (biometric law) | Data from automatic measurements "such as… **voiceprint**… used to identify a specific individual" [S5] | **Yes**: "does not include… video or audio recording or data generated therefrom" [S5] | Attorney General only (Consumer Protection Act) | In force |
| **Washington My Health My Data Act (MHMDA)** | "Consumer health data" includes "biometric data" [S10] | The MHMDA biometric definition reaches voice recordings from which identifiers can be extracted (UNVERIFIED: I read the Goodwin summary, not the statute text) | Private right of action via the Consumer Protection Act. Separate consent required for collecting and for sharing; no sale without signed authorization [S10] | Effective 31-Mar-2024 (for large entities) [S10] |
| **Colorado HB24-1130** (C.R.S. 6-1-1314) | "Biometric data" = biometric identifiers "used or intended to be used… for identification purposes" [S11] | Turns on purpose: identification only | Attorney General / district attorneys. Requires a written retention policy, a deletion schedule, consent and access rights; **applies even below the Colorado Privacy Act thresholds** [S11][S11b] | Effective **1-Jul-2025** [S11b] |
| **California CCPA/CPRA** Civ. Code 1798.140(c) | "Biometric information"… "used or is intended to be used… to establish individual identity", including "**voice recordings, from which an identifier template, such as… a voiceprint, can be extracted**" [S8] | No, as long as there is identification intent. Biometric data "processed for the purpose of uniquely identifying" a consumer is sensitive personal information (SPI). SPI gives users the right to limit its use | California Privacy Protection Agency (CPPA) / Attorney General. Private right of action only for breaches | Applies only above the thresholds (UNVERIFIED for 2026 figures; roughly US$26.6M revenue or ≥100k consumers) |

**Key voice cases**
| Case | Claim | Outcome / status as of 2026-11-15 |
|---|---|---|
| *Gunderson/Wilcosky v. Amazon* (N.D. Ill. 1:19-cv-05061), Alexa Voice ID | BIPA 15(b), (c), (d): voiceprints created without written consent | Class of about 1.2M Illinois residents certified 6-Nov-2025. 7th Circuit denied Amazon's appeal petition on 13-Mar-2026. Mediation is reported for Oct-2026 and no settlement is reported [S6][S7][S7b] (the docket details come from secondary trackers) |
| *Garner v. Amazon* (W.D. Wash.) | Recordings from false wake-words (Washington Consumer Protection Act / wiretap) | Nationwide class certified 7-Jul-2025. Narrowed on summary judgment 31-Mar-2026. A motion to revive the class is pending [S7b] (secondary source) |
| *In re Google Assistant Privacy Litigation* (N.D. Cal.) | False-accept recordings and disclosure to human reviewers | Settlement finally approved; claims deadline 27-Aug-2026 [S14]. Amount: UNVERIFIED |
| *Delgado v. Meta* (N.D. Cal.) | BIPA: Messenger voice clips | Summary judgment denied (Jun-2026). The test is whether the data "could" identify someone. The court did not hold that a recording is a voiceprint [S31] |
| *Amazon Connect / Pindrop* (D. Del. 20-1399) | BIPA: call-centre voice authentication | Amazon won: there was no evidence that Amazon itself made voiceprints. The vendor was the party doing the voiceprinting [S15] |
| *Rogers v. Amazon* (N.D. Ill. 1:26-cv-05497) | BIPA: voice data used to train AI | Filed 12-May-2026 [S7b] (secondary source; UNVERIFIED in primary docket) |

**Pronunciation feedback vs. voiceprint (INFERENCE)**
- **Lower risk:** audio is sent to STT, the transcript and pitch contour are compared to a target, and the audio is then discarded. Pitch analysis done in the browser (Web Audio) never leaves the device.
- **Higher risk:** any of the following moves you toward "biometric":
  - storing clips tied to an account;
  - computing speaker embeddings or voice similarity to the user's previous attempts;
  - accent "fingerprinting" per user;
  - training models on user clips;
  - using ElevenLabs voice cloning on a user's voice.

### Q2. EU / UK
| Item | Finding |
|---|---|
| GDPR Art. 4(14)/Art. 9 | Biometric data counts as special-category data only when processed "for the purpose of uniquely identifying a natural person". Ordinary voice processing is regular personal data under Art. 6. The EDPB VVA Guidelines 02/2021 (v2.0, 7-Jul-2021) treat "biometric identification" as a separate purpose that needs explicit consent. They also say ePrivacy Art. 5(3) consent is not needed for processing strictly necessary to execute the user's request, recommend filtering out background voices, and say a DPIA is "very likely" required [S12] |
| UK ICO | Biometric data guidance: whether data is "biometric" depends on its qualities, but it is *special category* only when used for unique identification. The guidance is under review following the DUAA [S13]. DUAA s.81 added the "children's higher protection matters" to UK GDPR Art. 25, **in force 5-Feb-2026** [S48]. The Age Appropriate Design Code continues to apply |
| EU AI Act Art. 50 | Applies from **2-Aug-2026**. Providers must ensure people are informed they are interacting with AI. Synthetic audio needs machine-readable marking (Art. 50(2)); systems placed on the market before 2-Aug-2026 have until **2-Dec-2026** to meet the marking duty (Digital Omnibus) [S44][S45][S46]. Deployers must disclose emotion recognition, biometric categorisation and deepfakes [S45] |
| Art. 5(1)(f) prohibition | Emotion-recognition AI in workplaces and education institutions is banned (except for medical/safety reasons) [S47]. INFERENCE: a consumer app is not an "education institution", but a school deployment could be. Do not infer emotions or confidence from voice |
| Biometric categorisation / high-risk | Annex III high-risk rules (which include education uses such as assessing learning outcomes) are delayed to **2-Dec-2027** by the Omnibus (provisional agreement 7-May-2026; EP plenary adopted) [S46]. INFERENCE: a consumer accent game is unlikely to be Annex III, but a version sold to schools that grades students could be |

### Q3. Canada
| Item | Finding |
|---|---|
| PIPEDA / OPC | *Guidance for processing biometrics – for businesses* (final, published Aug-2025) [S38][S39]: voice is a "behavioural biometric" and "a recording of their voice" is a biometric *sample*. Sets an appropriate-purpose test and "no-go zones" ("do not use biometrics if you are uncertain"). The OPC's call-recording guidance (updated 8-Oct-2026) says voiceprints are "sensitive biometric information" for which express consent may be required [S40] |
| Quebec Law 25 / private-sector Act | s.17: a PIA is required **before communicating personal information outside Quebec** (including to other provinces and the US), plus a written agreement [S42]. A PIA is also required for any new information system involving personal information (CAI) [S42b]. Requires express consent for sensitive information (UNVERIFIED section reference) |
| Quebec IT framework Act (C-1.1) ss.44–45 | Express consent is needed to use biometrics to verify/confirm identity. A declaration to the CAI is required **before use**, and creating a biometric database must be declared **≥60 days before** it goes into service. Alternative means of identification and destruction rules also apply [S41]. This applies only to identity verification or biometric databases, so it does not apply if no voiceprints are made (INFERENCE) |
| Ontario | No general private-sector privacy law, so PIPEDA applies. Bill 194 (EDSTA 2024) covers children's digital information only for school boards and children's aid societies [S43]. It is relevant only if Sound Local is sold to Ontario schools |
| Federal bill C-27 | UNVERIFIED current status (it died on prorogation in Jan-2025; I did not verify any successor bill) |

### Q4. Kids and teens
| Item | Finding |
|---|---|
| COPPA amended Rule (16 CFR 312) | Published in the Federal Register 22-Apr-2025. **Effective 23-Jun-2025; compliance by 22-Apr-2026** [S16]. "Personal information" includes "audio file where such file contains a child's… voice" and biometric identifiers, including **voiceprints** [S18]. Other changes: separate parental consent for third-party disclosure, written security programme, written retention policy (UNVERIFIED detail beyond the FR summary) |
| Audio exception §312.5(c)(9) | VPC is not needed where the operator collects an audio file "and no other personal information, for use in responding to a child's specific request", does not use it for any other purpose or disclose it, and "deletes it immediately". Online notice under §312.4(d)(4) is still required [S17][S17b]. This codifies the FTC's 2017 enforcement policy [S19]. Sending the audio to ElevenLabs could be read as a "disclosure"; whether ElevenLabs qualifies as a support-for-internal-operations service provider is unclear (INFERENCE) |
| Anthropic minors policy | Organisations letting minors use Claude must add safeguards (age verification, moderation, a child-safety system prompt) and state COPPA compliance publicly [S37] |
| Apple Kids category (1.3, 5.1.4) | No links out or purchases without a parental gate, and limits on third-party analytics/ads. Choosing the category is sticky: the app must keep complying even after deselecting it [S28] |
| Apple age ratings | New 13+/16+/18+ tiers; the questionnaire had to be answered by 31-Jan-2026. **AI chatbot features must be considered in the rating** [S50]. New descriptors (Shared Location, Dating) apply from 16-Nov-2026 and are required by 12-Jan-2027 [S51] |
| Google Play Families | Declare a target audience. Apps targeting children must use certified ad SDKs and no personalised ads. Mixed-audience apps need a neutral age screen [S49] |
| Texas SB 2420 | 5th Circuit stayed the injunction (No. 25-51073); the Supreme Court denied applications to vacate on **6-Jul-2026** [S20][S20b]. Apple: from 4-Jun-2026, new Texas accounts need age assurance and parental consent for under-18s for downloads, IAP and significant changes. Developers use the Declared Age Range API, the PermissionKit Significant Change API and the server notification for consent revocation [S21]. Google: age signals for Texas accounts created after 28-May-2026 [S24]. Litigation on the merits continues (INFERENCE) |
| Utah SB 142 (as amended by HB 498) | Developer duties from 6-May-2026; private right of action from 31-Dec-2026 (s.13-75-401). Age categories: <13, 13–15, 16–17, 18+ [S22][S22b] |
| Louisiana | Apple shares age categories from 1-Jul-2026 [S23] |
| California AB 1043 | Device/OS age signal; effective **1-Jan-2027** [S25] |
| Apple Declared Age Range API | Requires the iOS 26.2 SDK or later. It returns an age band or category, the method used, and eligibility for age features; from iOS 26.5 it returns a single "confirmed" value [S23b] |

### Q5. Store disclosures
| Item | Finding |
|---|---|
| Apple App Privacy label | "Audio Data: the user's voice or sound recordings" sits under User Content. "Collect" means data is sent off-device and kept longer than needed to serve the request in real time [S27]. INFERENCE: if ElevenLabs/your server keep audio beyond the request (ElevenLabs does by default), declare Audio Data as collected, for App Functionality, and say whether it is linked to the user |
| Privacy manifest | `PrivacyInfo.xcprivacy` declares collected data types and required-reason APIs (for example UserDefaults, file timestamp, system boot time, disk space). Capacitor/WebView plugins need their own manifests [S52] |
| `NSMicrophoneUsageDescription` | Required, or the app crashes on microphone access [S53]. Guideline 5.1.1(ii): purpose strings must "clearly and completely describe" the use, name the specific feature, be one active-voice sentence, and be localised [S54]. Example (INFERENCE): "Sound Local records your speech so it can score your pronunciation and send it to our speech-to-text provider." |
| `NSSpeechRecognitionUsageDescription` | Needed **only if you use Apple's Speech framework** (it covers sending data to Apple's servers, even with on-device recognition) [S55]. Not needed if you use only ElevenLabs STT |
| Apple 5.1.2(i) (13-Nov-2025) | "Clearly disclose where personal data will be shared with third parties, **including with third-party AI**, and obtain explicit permission before doing so" [S26] |
| Google Play Data safety | Data type "Voice or sound recordings" [S29]. Ephemeral in-memory processing is not displayed, but it must still be entered in the form. Transfers to a **service provider** acting on your instructions are not "sharing". Audio stored by a vendor beyond the request is not ephemeral (INFERENCE) [S29] |
| Google Play AI-generated content | Apps generating AI content (for example a chatbot that is central to the app) must prevent restricted content and provide **in-app reporting/flagging without leaving the app** [S30] |
| Google Play RECORD_AUDIO | Prominent in-app disclosure is required where users might not expect the collection, and a privacy policy must be linked in the Console and in the app [S56] |

### Q6. Vendor terms
| Vendor | Default retention | Training default | Zero retention option |
|---|---|---|---|
| **Anthropic API** | Inputs/outputs deleted within 30 days. Exceptions: features with longer retention, Usage Policy flags (inputs/outputs up to 2 years, classifier scores up to 7 years), and legal requirements [S35] | Retained data is "never used for model training without your express permission" [S36] | ZDR per organisation via sales. It covers the Messages and Token Counting APIs; browser CORS calls are blocked under ZDR. Some "Covered Models" require 30-day retention [S36] |
| **ElevenLabs** | Data retained per its Privacy Policy "to enhance services, troubleshoot…" [S33] | "Uses certain data you provide… to improve… models for everyone". There is no training by default for Enterprise customers; anyone can opt out via **Terms and privacy > Data use > "Improve the models for everyone"** [S34] | **Zero Retention Mode: Enterprise only**, on eligible endpoints, and can be refused for high-risk use cases [S33]. ElevenLabs' DPF policy says voice data "may comprise biometric data" [S57] |

**Is sending voice to ElevenLabs STT "third-party sharing"?**
- **Apple:** yes. 5.1.2(i) explicitly names third-party AI and requires explicit permission [S26].
- **Google Play:** a service provider processing on your instructions is not "sharing", but the data type must still be declared as collected (unless processing is ephemeral) [S29].
- **GDPR / UK / PIPEDA:** ElevenLabs acts as a processor. Name it in the privacy policy, sign a DPA and cover international transfers (EU–US DPF/SCCs). Quebec requires a PIA under s.17 [S42].
- **CCPA:** a service-provider contract is needed to avoid the transfer being a "sale/share" (INFERENCE).
- **COPPA:** if children's audio goes to a vendor, that can be a disclosure that takes it outside the §312.5(c)(9) exception (INFERENCE).

## 3. Compliance checklist for Sound Local (INFERENCE: practical, not legal advice)
1. **Data design:** do not create voiceprints or speaker embeddings, and do not use voice cloning of users. Do pitch analysis on-device where possible. Delete raw audio once scoring finishes; if you keep clips for replay, make it opt-in, use a short TTL and offer one-tap delete.
2. **Vendors:** switch off the ElevenLabs "Improve the models" toggle now and sign its DPA. Ask about Enterprise ZRM when you scale. Make sure the Anthropic key is under Commercial Terms, and request ZDR (keep calls server-side, which you already do).
3. **Consent UX:** before the first recording, show a just-in-time screen: "Your voice is sent to ElevenLabs (speech-to-text) and your transcript to Anthropic (Claude) to score you and run the conversation; we don't keep recordings / we keep them X days." Use an explicit "Agree" button (Apple 5.1.2(i)). Then trigger the OS microphone prompt.
4. **Privacy policy:**
   - name each vendor and its purpose and retention;
   - state "we do not collect biometric identifiers or voiceprints";
   - include a biometric retention/destruction statement as a BIPA, Colorado and Texas hedge;
   - cover CCPA, GDPR, PIPEDA and Quebec rights;
   - give a contact and appoint a privacy officer (Quebec requires one).
5. **Age:** require 13+ in the Terms with a neutral age screen at onboarding, and do not choose the Kids/Families categories. In native apps, integrate Apple's Declared Age Range API and the PermissionKit Significant Change API, and Google's Play Age Signals API. Handle consent-revocation notifications for Texas, Utah and Louisiana (and California from 2027). If under-13 users are ever wanted, redesign for §312.5(c)(9) or obtain verifiable parental consent (VPC).
6. **Teen safety:** use Anthropic's child-safety system prompt and add moderation of NPC output. Put an in-app "report this response" button on every AI message (required by Google Play, good practice on Apple). Set an accurate Apple age rating that accounts for the chatbot.
7. **AI transparency (EU AI Act Art. 50):** label NPCs as AI ("You're talking to an AI character") and label TTS voices as AI-generated. Confirm with ElevenLabs that it watermarks output (Art. 50(2) provider duty, deadline 2-Dec-2026 for systems already on the market). Do not infer emotions from voice.
8. **Store forms:**
   - Apple: Audio Data (App Functionality, linked/not linked as applicable), a privacy manifest including plugin manifests, and a precise `NSMicrophoneUsageDescription`. Add `NSSpeechRecognitionUsageDescription` only if you use Apple's Speech framework.
   - Google: Data safety "Voice or sound recordings" plus a prominent disclosure for RECORD_AUDIO.
9. **Assessments:** a short DPIA (GDPR/UK) and a Quebec PIA (s.17 for US vendors), and log a records-of-processing entry. Re-run them if you add voice storage, any personalisation from voice, or school sales.
10. **Triggers that need a lawyer before you ship:** any feature that compares a user's voice across sessions, voice login, voice cloning, selling to schools (FERPA, Ontario Bill 194, EU Annex III), or targeting under-13s.

## 4. Sources (all read 2026-11-15)
1. [S1] 740 ILCS 14 (BIPA), ilga.gov – https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004&ChapterID=57
2. [S2] Fisher Phillips, "Illinois Curtails Massive Damage Awards" (5-Aug-2024) – https://www.fisherphillips.com/en/insights/insights/breaking-bipa-news-illinois-curtails-massive-damage-awards-in-biometric-cases
3. [S3] 7th Cir. No. 25-2185 opinion (1-Apr-2026) – https://media.ca7.uscourts.gov/cgi-bin/OpinionsWeb/processWebInputExternal.pl?Path=Y2026%2FD04-01%2FC%3A25-2185%3AJ%3ABrennan%3Aaut%3AT%3AfnOp%3AN%3A3515976%3AS%3A0&Submit=Display ; Barnes & Thornburg alert – https://btlaw.com/en/insights/alerts/2026/seventh-circuit-rules-bipa-liability-limiting-amendment-applies-retroactively (URL truncated in search result)
4. [S4] Tex. Bus. & Com. Code ch. 503 – https://statutes.capitol.texas.gov/Docs/BC/htm/BC.503.htm
5. [S5] RCW 19.375.010 – https://app.leg.wa.gov/RCW/default.aspx?cite=19.375.010
6. [S6] Law360, "Amazon Alexa Users Win Cert. Of 1.2M-Member BIPA Class" (19-Nov-2025) – https://www.law360.com/articles/2413400/amazon-alexa-users-win-cert-of-1-2m-member-bipa-class
7. [S7] OpenClassActions, Alexa Voice ID BIPA (27-Nov-2025, updated) – https://openclassactions.com/settlements/amazon-alexa-voice-id-bipa-class-action.php
8. [S7b] LawClaimCorner, Amazon Alexa Lawsuit 2026 status (7-Nov-2026; secondary source) – https://lawclaimcorner.com/amazon-alexa-lawsuit/
9. [S8] Cal. Civ. Code 1798.140 – https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140.
10. [S9] Texas AG press release, Google $1.375B (31-Oct-2025) – https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-finalizes-historic-settlement-google-and-secures-1375-billion-big-tech
11. [S10] Goodwin, "Washington's My Health My Data Act Comes Into Force" (28-Mar-2024) – https://www.goodwinlaw.com/en/insights/publications/2024/03/alerts-technology-hltc-my-health-my-data-act-mhmda
12. [S11] Colorado HB24-1130 session law – https://leg.colorado.gov/laws/session-laws/HB24-1130/313/download
13. [S11b] Paul Hastings, Colorado biometric requirements (15-Jul-2025) – https://www.paulhastings.com/thought-leadership/colorado-imposes-new-privacy-requirements-on-organizations-collecting-biometric-identifiers-and-data
14. [S12] EDPB Guidelines 02/2021 on virtual voice assistants v2.0 – https://www.edpb.europa.eu/system/files/documents/2021-07/edpb_guidelines_202102_on_vva_v2.0_adopted_en.pdf
15. [S13] ICO Biometric data guidance – https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/biometric-data-guidance-biometric-recognition/
16. [S14] Google Assistant Privacy Litigation settlement site – https://www.googleassistantprivacysettlement.com/
17. [S15] D. Del. 20-1399 opinion (Amazon Connect/Pindrop) – https://www.ded.uscourts.gov/sites/ded/files/opinions/20-1399_2.pdf
18. [S16] Federal Register, COPPA final rule (22-Apr-2025) – https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm
19. [S17] eCFR 16 CFR 312.5 – https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312/section-312.5
20. [S17b] eCFR 16 CFR 312.4 – https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312/section-312.4
21. [S18] eCFR 16 CFR Part 312 – https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312
22. [S19] FTC Enforcement Policy Statement on voice recordings (8-Dec-2017) – https://www.federalregister.gov/documents/2017/12/08/2017-26509/enforcement-policy-statement-regarding-the-applicability-of-the-coppa-rule-to-the-collection-and-use
23. [S20] SCOTUSblog, "Supreme Court allows Texas to enforce…" (6-Jul-2026) – https://www.scotusblog.com/2026/07/supreme-court-allows-texas-to-enforce-law-requiring-age-verification-and-parental-consent-on-app/
24. [S20b] 5th Cir. No. 25-51073 stay order – https://www.ca5.uscourts.gov/opinions/pub/25/25-51073-CV0.pdf
25. [S21] Apple Developer, "Update for Apps Distributed in Texas" (3-Jun-2026) – https://developer.apple.com/news/?id=sg176nne
26. [S22] Utah SB 142 enrolled – https://le.utah.gov/Session/2025/bills/enrolled/SB0142.pdf
27. [S22b] Orrick Online Safety Law Center, Utah – https://onlinesafety.orrick.com/utah/
28. [S23] Apple Developer, age requirements Brazil/Australia/Singapore/Utah/Louisiana (24-Feb-2026) – https://developer.apple.com/news/?id=f5zj08ey
29. [S23b] Apple Age assurance developer Q&A – https://developer.apple.com/support/age-assurance/
30. [S24] Android Developers, Play Age Signals API – https://developer.android.com/google/play/age-signals/use-age-signals-api
31. [S25] California AB 1043 (chaptered 13-Oct-2025) – https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1043 ; Governor's signing message – https://www.gov.ca.gov/wp-content/uploads/2025/10/AB-1043-Signing-Message.pdf
32. [S26] Apple Developer, "Updated App Review Guidelines now available" (13-Nov-2025) – https://developer.apple.com/news/?id=ey6d8onl
33. [S27] Apple App Privacy Details – https://developer.apple.com/app-store/app-privacy-details/
34. [S28] Apple App Review Guidelines – https://developer.apple.com/app-store/review/guidelines/
35. [S29] Play Console Help, Data safety section – https://support.google.com/googleplay/android-developer/answer/10787469
36. [S30] Play Console Help, AI-Generated Content – https://support.google.com/googleplay/android-developer/answer/13985936
37. [S31] Biometric Update, "Meta loses bid to end BIPA voiceprint suit" (25-Aug-2026) – https://www.biometricupdate.com/202608/meta-loses-bid-to-end-bipa-voiceprint-suit-as-case-moves-forward
38. [S32] *Carpenter v. McDonald's Corp.* (N.D. Ill. 2022), FindLaw – https://caselaw.findlaw.com/court/us-dis-crt-n-d-ill-eas-div/2167709.html
39. [S33] ElevenLabs Docs, Zero Retention Mode (Enterprise) – https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode
40. [S34] ElevenLabs Help, "Is my data used to improve ElevenLabs' AI models?" – https://elevenlabs.io/docs/help-center/legal/is-my-data-used-to-improve-eleven-labs-ai-models
41. [S35] Anthropic Privacy Center, "How long do you store my organization's data?" – https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
42. [S36] Claude Platform docs, API and data retention – https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
43. [S37] Claude Help Center, Guidelines for Organizations Serving Minors (16-Mar-2026) – https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors
44. [S38] OPC, Guidance for processing biometrics – for businesses (2025) – https://www.priv.gc.ca/en/privacy-topics/health-information-genetics-biometrics/biometrics/gd_bio_org-final/
45. [S39] OPC news release (11-Aug-2025) – https://www.priv.gc.ca/en/opc-news/news-and-announcements/2025/nr-c_250811/
46. [S40] OPC news release on call recording and voice data (8-Oct-2026) – https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_261008/ ; OPC, Recording of Customer Telephone Calls – https://www.priv.gc.ca/en/privacy-topics/surveillance/02_05_d_14
47. [S41] CAI, *Biométrie : principes à respecter et obligations légales des organisations* – https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_GU_Biometrie_Organisations.pdf ; Act C-1.1 s.45 – https://www.legisquebec.gouv.qc.ca/fr/version/lc/c-1.1?code=se%3A45&history=20251106&langCont=en
48. [S42] Quebec P-39.1 s.17 – https://www.legisquebec.gouv.qc.ca/fr/version/lc/P-39.1?code=se%3A17&langCont=en
49. [S42b] CAI, Principaux changements Loi 25 – https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25
50. [S43] Ontario Human Rights Commission, Bill 194 – https://www.ohrc.on.ca/en/bill-194-strengthening-cyber-security-and-building-trust-public-sector-act-2024
51. [S44] AI Act Service Desk, "When does enforcement start?" – https://ai-act-service-desk.ec.europa.eu/en/ai-act/faq/when-does-enforcement-start
52. [S45] European Commission, Guidelines on AI transparency obligations – https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
53. [S46] Freshfields, "EU AI Act unpacked #34: final Digital Omnibus" (10-Jul-2026) – https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-ai-act-unpacked-34-the-final-digital-omnibus-on-ai-key-amendments-to-the-a-102nber ; Council press release (7-May-2026) – https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/
54. [S47] Commission Guidelines on prohibited AI practices – https://ai-act-service-desk.ec.europa.eu/sites/default/files/2026-01/guide-prohibited_en.pdf
55. [S48] Data (Use and Access) Act 2025 s.81 – https://www.legislation.gov.uk/ukpga/2025/18/section/81 ; ICO, Data protection by design (updated 5-Feb-2026) – https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/
56. [S49] Play Console Help, Google Play Families Policies – https://support.google.com/googleplay/android-developer/answer/9893335?hl=en
57. [S50] Apple Developer, "Updated age ratings in App Store Connect" (24-Jul-2025) – https://developer.apple.com/news/?id=ks775ehf ; Apple Upcoming Requirements – https://developer.apple.com/news/upcoming-requirements/
58. [S51] Apple Developer, "Upcoming: New age rating content descriptors" (2-Nov-2026) – https://developer.apple.com/news/?id=yxkh08us
59. [S52] Apple, Privacy manifest files – https://developer.apple.com/documentation/bundleresources/privacy-manifest-files ; Apple, list of required-reason APIs (27-Jul-2023) – https://developer.apple.com/news/?id=z6fu1dcu
60. [S53] Apple, Audio Session Programming Guide: Requesting Permission – https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/RequestingPermission/RequestingPermission.html
61. [S54] Apple, Guideline 5.1.1(ii) purpose strings – https://developer.apple.com/help/app-review/guideline-reference/5-1-1-purpose-strings/
62. [S55] NSSpeechRecognitionUsageDescription (mirror of Apple docs) – https://apple-docs.everest.mt/docs/bundleresources/information-property-list/nsspeechrecognitionusagedescription/
63. [S56] Play Console Help, Best practices for prominent disclosure and consent – https://support.google.com/googleplay/android-developer/answer/11150561
64. [S57] ElevenLabs EU-US Data Privacy Framework policy – https://elevenlabs.io/eu-us-data-privacy-framework-policy ; ElevenLabs Privacy Policy – https://elevenlabs.io/privacy-policy
