# Strand A — Platform rules, distribution & cross-platform frameworks (Sound Local)
Research date: 2026-11-15 (all sources read 2026-11-15 unless noted). [n] = numbered source list at the end.
Labels: **UNVERIFIED** = could not confirm from a primary source; **INFERENCE/ASSUMPTION** = my reasoning.

## 1. Key takeaways for the Sound Local decision (10 lines)
1. Current OS baseline is **iOS/iPadOS 27 / Safari 27** (released Sept 2026) [9][10]; iOS 26 made *every* site added to the Home Screen open as a web app by default [8] — install is easier, but iOS still has **no `beforeinstallprompt`**, no Vibration API, no orientation lock, and no element fullscreen on iPhone [12][13][14][15].
2. iOS PWA mic is usable (getUserMedia + MediaRecorder since iOS 14.3) [18], but an **open WebKit bug (Oct 2026) says Home Screen web apps re-prompt for mic permission on every launch** [16] — a real UX tax for a speaking game. Background audio in standalone apps is still unreliable (old bug open; iOS 26 PWA audio regressions filed) [17].
3. Installed iOS PWAs have their **own 7-day ITP counter** (based on days the app is used), so data is not wiped while the user keeps playing; same quotas as Safari [6][7]. Push + Badging work only for Home-Screen apps (iOS 16.4+) [1][2]. The 2024 EU DMA removal was reversed in iOS 17.4 [3][4].
4. A pure PWA **cannot be listed on Apple's App Store**; Google Play accepts a PWA via a **Trusted Web Activity** (Bubblewrap / PWABuilder + Digital Asset Links) [19][20].
5. **Capacitor 8** (current; 8.5 shipped; Capacitor 9 forecast end-Nov 2026) wraps the existing Vite/Three.js build with the least rewrite; requires Xcode 26+, iOS 15+, Android minSdk 24 / target 36 [21][22][23]. Needs `NSMicrophoneUsageDescription` on iOS and `RECORD_AUDIO` + WebView permission grant on Android (Capacitor's `BridgeWebChromeClient` handles `onPermissionRequest`) [24][25][26].
6. React Native is now **New-Architecture-only** (since 0.82); latest RN 0.88 / **Expo SDK 58** [27][28][29]. A Three.js scene would need expo-gl/R3F-native (documented, but a 2025 issue reports it broken) or a WebView — i.e. a substantial rewrite for little gain vs Capacitor [30][31]. INFERENCE.
7. Game engines: **Unity Runtime Fee cancelled (Sept 2024)**; Personal free up to US$200k revenue+funding; Pro +5% from 12 Jan 2026 (~US$210/seat/mo per Unity page) [36][37][38]. **Godot is MIT, no royalties** [39], but both mean rewriting the game; iOS export from either needs macOS/Xcode [40].
8. **Apple guideline 4.2** ("elevate it beyond a repackaged website") is the key risk for a thin wrapper; Sound Local's mic/voice gameplay + native touches (haptics, push, offline) is the mitigation. **Guideline 5.1.2(i) (13 Nov 2025)**: must disclose and get *explicit permission* before sending personal data (voice/transcripts) to third-party AI (ElevenLabs, Anthropic) [41][42].
9. Logistics: Apple US$99/yr (D-U-N-S needed for an organization, free, ~5 business days) [46][47][48]; Google US$25 once [49]; **new personal Play accounts must run a closed test with ≥12 testers for 14 continuous days** — organization accounts avoid this [50]; Play target API 36 required since 31 Aug 2026 [51]; Apple review: 50% <24h, 90% <48h [43]. No Mac needed if using Expo/EAS, Codemagic, GitHub macOS runners or Xcode Cloud (needs Xcode to configure) [57][58][59][60].
10. **Age-assurance laws are live**: Texas SB 2420 enforced since 4 Jun 2026 (5th Cir. stay; SCOTUS refused to vacate 6 Jul 2026; merits appeal argued 4 Aug 2026, no ruling found) [63][64][65]; Utah from 6 May 2026, Louisiana from 1 Jul 2026 [66]; California AB 1043 from 1 Jan 2027 [68]. Native apps should integrate Apple Declared Age Range / Google Play Age Signals APIs; Apple's new 13+/16+/18+ ratings questionnaire was mandatory by 31 Jan 2026 [44][45][67].

---

## 2. Detailed findings

### Q1. iOS/iPadOS PWA limits today (iOS 27 era)

| Capability | iOS/iPadOS status (Safari/WebKit) | Android Chrome | Source |
|---|---|---|---|
| Install | Share ▸ Add to Home Screen only. iOS 26+: every site added opens as a web app by default (user can untick "Open as Web App"); manifest not required. No programmatic prompt. | Installable PWA → WebAPK; custom install UI via `beforeinstallprompt` | [8][19b][12] |
| `beforeinstallprompt` | **Not supported** (caniuse/web.dev: not all browsers; Safari lacks it) | Supported | [12][12b] |
| Web Push | Since iOS/iPadOS 16.4, **Home-Screen web apps only**; permission must follow a user gesture; uses APNs; no Apple Developer membership needed. Declarative Web Push added in Safari 18.4. | Supported in browser & installed | [1][11] |
| Badging API | iOS 16.4+, Home-Screen apps only; badge shows only if notification permission granted; not in WKWebView | Supported | [2] |
| Storage quota | Since iOS 17: browser apps up to 60% of disk per origin (80% overall); other WebKit apps (e.g. WKWebView wrappers) 15%/20%. Standalone Home-Screen web app gets same quotas as when opened in the browser. `navigator.storage.persist()` granted by heuristics incl. being a Home-Screen app. | Chrome quotas apply | [6][7b] |
| 7-day script-writable storage eviction (ITP) | Applies in Safari after 7 *days of Safari use* without interaction. **Home-Screen web apps have their own day counter** tied to actual use of the app; WebKit "does not expect" first-party data in such apps to be deleted. Not a blanket exemption — a long-unused installed PWA can still be evicted. | N/A | [5][7][7b] |
| EU DMA episode | iOS 17.4 betas (Feb 2024) removed Home-Screen web apps in the EU; Apple reversed on 1 Mar 2024; they remain WebKit-based (third-party engines cannot power them). | N/A | [3][4] |
| Background audio | Long-standing bug: audio stops when standalone web app leaves foreground (bug 198277, 2019). iOS 26 regression filed: audio fails to play on reopen in PWA (bug 295518); AudioContext silent after return from background (bug 291892). Treat as **not reliable**. | Generally works in Chrome (not separately verified — UNVERIFIED) | [17] |
| Screen Wake Lock | Shipped Safari 16.4 but broken in Home-Screen apps; **fixed for Home-Screen web apps in Safari/iOS 18.4** | Supported | [11][11b] |
| Vibration API | **Not supported** on Safari iOS through 27.2 (caniuse) | Supported | [13] |
| Orientation lock (`screen.orientation.lock`) | **Not supported** on Safari iOS through 27.2; manifest `orientation` only | Supported | [14] |
| Fullscreen API | iPad: supported (16.4+). **iPhone: only `<video>`**; open WebKit request bug 328773 (Oct 2026). Standalone display mode hides browser UI instead. | Supported | [15] |
| Microphone (getUserMedia/MediaRecorder) | MediaRecorder default from iOS 14.3; getUserMedia works in Safari and Home-Screen apps; **open bug 327237 (12 Oct 2026): Home-Screen web apps re-ask mic/camera permission every launch** (iOS 26/27) | Supported; permission persists | [16][18] |
| iOS 26 / 27 changes | iOS 26: every site can be a web app; Safari 26 added WebGPU, `<model>` etc. Safari 27 (17 Sep 2026): 80 features, Safari MCP, `<model>` element on iOS, quality fixes; **I found no web-app-specific capability change (push/fullscreen/vibration/orientation) in the Safari 27 notes** (completeness UNVERIFIED). | — | [8][9][10] |

**PWA into stores**
- **Google Play**: Trusted Web Activity (Chrome 72+), content verified by Digital Asset Links (`assetlinks.json`); Bubblewrap CLI or PWABuilder (uses Bubblewrap) generates the signed AAB/APK [19][20]. Store rules (target API, 12-tester test, etc.) still apply.
- **Apple App Store**: no PWA submission path; only native binaries. PWABuilder/Capacitor/Cordova produce WKWebView wrappers, which then face guideline 4.2 [41]. INFERENCE from guidelines.

### Q2. Wrappers

| Item | Current state | Source |
|---|---|---|
| **Capacitor** current major | **8** (announced 8 Dec 2025; ~930k weekly downloads Nov 2025). Capacitor 8.5 shipped; **Capacitor 9 alpha May 2026, GA "forecasted end of November" 2026** for iOS 27/Android 17. | [21][21b] |
| Capacitor 8 requirements | iOS 15+, Xcode 26.0+, WKWebView (not UIWebView); new iOS projects default to Swift Package Manager; Android Studio Otter 2025.2.1+, minSdk 24, compile/target SDK 36 | [22][23] |
| iOS mic in WKWebView | getUserMedia in WKWebView arrived in iOS 14.3 for https; for custom URL schemes (Capacitor uses `capacitor://`) from iOS 14.5 (Capacitor maintainer answer). Must add `NSMicrophoneUsageDescription` to Info.plist. iOS 15+ `WKUIDelegate requestMediaCapturePermissionFor` lets the host app grant/prompt; WKWebView persistence of grants has long had repeat-prompt complaints. | [24][24b][18][25b] |
| Android mic in WebView | Manifest `RECORD_AUDIO` (+ runtime permission); WebView requires host to override `WebChromeClient.onPermissionRequest` and call `grant()` (else denied). Capacitor's `BridgeWebChromeClient` implements this and requests the runtime permission. Cordova-android 15.1 added a fix "handle permissions for getUserMedia". | [26][25][34] |
| Plugin ecosystem | Official Capacitor plugins + community (e.g. Capawesome) and Cordova plugin compatibility (Capacitor 9 improves Cordova SPM compatibility). Native haptics, push, status bar etc. available. Specific plugin counts UNVERIFIED. | [21b] |
| **Tauri 2** mobile | 2.0 stable 2 Oct 2024 with iOS/Android; latest 2.12.3 (10 Oct 2026); mobile plugins in Kotlin/Swift. Ecosystem smaller than Capacitor; Rust toolchain needed. Maturity judgement = INFERENCE. | [32][32b] |
| **Cordova** | Still maintained by Apache: cordova-ios 8.2.0 (9 Nov 2026), cordova-android 15.1.0 (22 Jul 2026). Viable but Capacitor is the more active successor (INFERENCE). | [33][34] |
| WebGL in WKWebView vs Safari | WKWebView uses the same WebKit engine incl. JIT (unlike legacy UIWebView), so WebGL/JS performance is broadly comparable (historic Construct/Phaser reports). No current Apple benchmark found — **performance parity UNVERIFIED**; test on low-end iPhones. WKWebView apps get the lower 15% storage quota. | [35][6] |

### Q3. React Native / Expo, fully native, game engines

| Item | Current state | Source |
|---|---|---|
| RN New Architecture | Default since 0.76 (Oct 2024); **only architecture since 0.82** (Oct 2025); legacy removal continued in 0.84 (Hermes V1 default). Latest **0.88** (19 Oct 2026). | [27][28] |
| Expo | **SDK 58** (14 Oct 2026, built for iOS 27, RN 0.88, React 19.3). SDK 57 = RN 0.86. | [29] |
| expo-gl | GLView provides OpenGL ES/WebGL-like context; used by expo-three. | [30b] |
| @react-three/fiber/native | R3F docs: v8 added RN support via `@react-three/fiber/native` using expo-gl + expo-asset; v9 pairs with React 19; v10 alpha exists. But GitHub issue #3517 (Apr 2025, "React Native is no longer supported") reports blank screen following docs; closed Jun 2025. **Maturity questionable — prototype before committing.** | [30][31] |
| react-native-webview hosting Three.js | Possible; mic in WebView needs `mediaCapturePermissionGrantType` (iOS) and Android permission handling; community reports repeat/double prompts. Effectively a WebView wrapper inside RN (INFERENCE). | [31b] |
| Mic recording | `expo-audio` `useAudioRecorder`, config plugin sets `NSMicrophoneUsageDescription` and Android `RECORD_AUDIO`; optional background recording (Android foreground service). expo-av superseded by expo-audio/expo-video (deprecation date UNVERIFIED). Raw PCM pitch analysis may need a third-party lib (UNVERIFIED). | [29b] |
| EAS / Expo services | Free: 15 Android + 15 iOS builds/month (low-priority queue); Starter US$19/mo (+US$45 build credit); Production US$199/mo. EAS renamed "Expo Build/Submit/Update" (CLI still `eas`). | [56] |
| Fully native | SwiftUI + RealityKit/SceneKit (iOS) and Kotlin/Compose + Filament/SceneView (Android) = two codebases and full rewrite; no specific pricing (free SDKs). Detailed current API maturity not researched — UNVERIFIED. | — |
| **Unity** | Runtime Fee **cancelled 12 Sep 2024** for games; Personal free ≤US$200k revenue+funding (2026), splash optional in Unity 6; Pro/Enterprise +5% from 12 Jan 2026; Pro required ≥US$200k; Unity Pro page shows US$210/mo per seat (annual). | [36][37][38] |
| **Godot 4** | MIT licence, free, no royalties. Docs at 4.7. iOS export **requires macOS + Xcode**; Android export from any OS. Mic via AudioEffectRecord. | [39][40] |

### Q4. Store review, policy & logistics

**Apple App Review**
| Topic | Current rule | Source |
|---|---|---|
| 4.2 Minimum Functionality | "Your app should include features, content, and UI that elevate it beyond a repackaged website… not particularly useful, unique, or 'app-like'… doesn't belong." | [41] |
| 4.2.2 | Apps shouldn't primarily be marketing materials, ads, web clippings, content aggregators, or collections of links. | [41] |
| 4.2.3 / 4.2.6 | Must work standalone; disclose size before downloading extra resources; template/app-generator apps rejected unless submitted by content provider. | [41] |
| 2.5.2 | App must be self-contained; may not download/execute code that introduces or changes features. (Remote-loaded web content that changes functionality post-review is risky — INFERENCE; bundle the game in the binary.) | [41] |
| 4.7 (Nov 2025) | HTML5/JS mini apps & mini games explicitly in scope; 4.7.2 may not expose native APIs to non-embedded software without permission. | [41][42] |
| 5.1.2(i) (13 Nov 2025) | "You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so." → consent screen before sending voice/text to ElevenLabs/Claude. | [41][42] |
| Other 2026 changes | Oct 2026: new 2.3.14 (creative assets), 2.5.19 (hidden/dormant features), 1.2 UGC/NCII safeguards incl. AI-generated imagery. New age-rating content descriptors from 16 Nov 2026 (mandatory by 12 Jan 2027). | [45] |
| Review times | "Typically reviewing at least 50% of submissions in less than 24 hours and 90% in less than 48 hours." | [43] |
| Expedited review | Request for critical bug fixes or time-bound events. | [43] |
| TestFlight | Up to 100 internal testers; **up to 10,000 external testers**; first build to external testers needs App Review approval; up to 100 builds; 30 devices per tester. | [44b] |
| SDK requirement | Since 28 Apr 2026 uploads must be built with Xcode 26+/iOS 26 SDK; since 9 Sep 2026 apps must target iOS 13+. | [44] |
| Age ratings | 13+, 16+, 18+ added to 4+/9+ (announced 24 Jul 2025); new questionnaire answers required by 31 Jan 2026; must account for AI chatbot features in rating. | [44][44c] |

**Google Play**
| Topic | Current rule | Source |
|---|---|---|
| Review time | "For certain developer accounts… review times of up to seven days or longer in exceptional cases." No published median. | [52] |
| New personal accounts | Created after 13 Nov 2023: **closed test with ≥12 testers opted-in continuously ≥14 days** before applying for production. (Organization accounts not subject.) | [50] |
| Target API | From 31 Aug 2026: new apps & updates must target **Android 16 (API 36)**; existing apps must target API 35+ to stay visible to new users on newer devices. | [51] |
| AI-Generated Content policy | Developers responsible for preventing offensive/prohibited output; text-to-text chatbots central to app are in scope; must let users report/flag offensive content in-app (per policy help page title/guidance — exact wording partially read). | [53][53b] |
| Size limits (compressed download) | **Base module 500 MB** (the often-quoted 200/150 MB figures are outdated); feature modules 500 MB; asset packs 1.5 GB each; install-time total 4 GB; on-demand/fast-follow 30 GB; overall 34 GB. | [54] |
| Fees / identity | US$25 one-time registration. Organization accounts need a D-U-N-S number (free from D&B); Google displays legal name, D-U-N-S, address, email, phone on Play. | [49][55] |

**Apple sizes & fees**
| Topic | Rule | Source |
|---|---|---|
| Max app size | iOS 9+: 4 GB uncompressed; executable __TEXT 500 MB; Background Assets for larger content. | [61] |
| Cellular download | Over-cellular limit raised to 200 MB (2019); since iOS 13 users can allow larger downloads in Settings (MacRumors). Apple primary page not found — UNVERIFIED on Apple.com. | [62] |
| Membership | US$99/yr (local currency where available); individuals need no D-U-N-S; organizations need D-U-N-S (free; up to 5 business days + 2 days for Apple to receive); no DBAs. | [46][47][48] |
| Fee waiver | Only nonprofits, accredited educational institutions, government entities; not individuals/sole proprietors; not if selling paid apps/IAP. → Sound Local (for-profit) **not eligible** (INFERENCE). | [47b] |

**Building iOS without a Mac**
| Option | Cost/allowance | Source |
|---|---|---|
| Expo EAS (Expo Build) | Free 15 iOS builds/mo; paid from US$19/mo | [56] |
| Codemagic | 500 free macOS M2 min/mo (individual); PAYG M2 US$0.095/min | [57] |
| GitHub Actions macOS | US$0.062/min standard macOS runner (prices cut up to 39% on 1 Jan 2026) | [58] |
| Xcode Cloud | 25 compute hours/month included with membership; configured from Xcode 15+ (needs a Mac to set up — INFERENCE from "configure a workflow in Xcode") | [59][60] |
| Capacitor/Godot/Unity | Still need Xcode at build step → use cloud Mac/CI (INFERENCE) | [22][40] |

**Age-assurance laws (US)**
| Law | Status as of 2026-11-15 | Developer duties | Source |
|---|---|---|---|
| Texas SB 2420 | PI granted 23 Dec 2025; **5th Cir. stayed it 4 Jun 2026**; Apple enforcing for new Texas accounts from 4 Jun 2026; SCOTUS denied applications to vacate stay (6 Jul 2026); 5th Cir. merits argument 4 Aug 2026 — **no merits ruling found** (pending). | Use age category data, parental consent for "significant changes", honour consent revocation; AG penalties up to $50k/violation. Apple: Declared Age Range API, PermissionKit Significant Change API, server notifications. Google: Play Age Signals API (Texas accounts created after 28 May 2026). | [63][64][65][67][67b][69] |
| Utah SB 142 | Core duties effective 6 May 2026; private right of action section effective 31 Dec 2026. | Same age categories (<13, 13–15, 16–17, 18+) | [66][66b] |
| Louisiana | Apple sharing age categories for new accounts from 1 Jul 2026 | similar | [66] |
| California AB 1043 (DAAA) | Effective 1 Jan 2027 (existing accounts by 1 Jul 2027); OS-level age signals | must request/respect age bracket signal | [68] |
(Not legal advice; Canadian founders distributing to US users are still in scope if their app is offered in those states — INFERENCE.)

---

## 3. Sources (all read 2026-11-15)
1. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ — Web Push for Web Apps on iOS and iPadOS (WebKit, 16 Feb 2023)
2. https://webkit.org/blog/14112/badging-for-home-screen-web-apps/ — Badging for Home Screen Web Apps (WebKit, 25 Apr 2023)
3. https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/ — iOS 17.4 won't remove Home Screen web apps in the EU (9to5Mac)
4. https://www.reuters.com/technology/apple-reverses-decision-disable-some-apps-iphones-eu-2024-03-01/ — Apple reverses decision (Reuters, 1 Mar 2024)
5. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ — Full Third-Party Cookie Blocking and More (WebKit, 24 Mar 2020)
6. https://webkit.org/blog/14403/updates-to-storage-policy/ — Updates to Storage Policy (WebKit, 10 Aug 2023)
7. https://openpwa.net/reference/storage/safari-seven-day-cap/ — Safari's 7-day cap on script-writable storage (OpenPWA, Oct 2026); 7b. https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria — MDN Storage quotas
8. https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ — WebKit Features in Safari 26.0 (15 Sep 2025)
9. https://webkit.org/blog/18325/webkit-features-for-safari-27-0/ — WebKit Features for Safari 27.0 (17 Sep 2026)
10. https://developer.apple.com/news/ — Apple Developer Latest News (iOS 27.2/27.3 betas, Oct–Nov 2026 guideline news)
11. https://webkit.org/blog/13966/webkit-features-in-safari-16-4/ — WebKit Features in Safari 16.4; 11b. https://www.linkedin.com/posts/apple-webkit_webkit-features-in-safari-184-activity-7312564762523889664-1gTM — Safari 18.4 summary (Screen Wake Lock for Home Screen Web Apps, Declarative Web Push) & https://bugs.webkit.org/show_bug.cgi?id=254545
12. https://caniuse.com/wf-beforeinstallprompt — beforeinstallprompt support; 12b. https://web.dev/learn/pwa/installation-prompt — Installation prompt (web.dev)
13. https://caniuse.com/mdn-api_navigator_vibrate — Navigator.vibrate support
14. https://caniuse.com/wf-screen-orientation-lock — Screen orientation lock support
15. https://bugs.webkit.org/show_bug.cgi?id=328773 — Support Element Fullscreen API on iPhone (WebKit bug, 24 Oct 2026)
16. https://bugs.webkit.org/show_bug.cgi?id=327237 — Home Screen web apps ask for camera/mic permission every launch (WebKit bug, 12 Oct 2026)
17. https://bugs.webkit.org/show_bug.cgi?id=198277 ; https://bugs.webkit.org/show_bug.cgi?id=295518 ; https://bugs.webkit.org/show_bug.cgi?id=291892 — PWA background/resume audio bugs
18. https://webkit.org/blog/11353/mediarecorder-api/ — MediaRecorder API (WebKit, 23 Nov 2020, iOS 14.3)
19. https://developer.chrome.com/docs/android/trusted-web-activity — Trusted Web Activity (Chrome Developers); 19b. https://web.dev/articles/install-criteria and https://web.dev/articles/webapks
20. https://blog.pwabuilder.com/docs/android-platform/ — PWABuilder Android platform; https://github.com/pwa-builder/pwabuilder-google-play
21. https://ionic.io/blog/announcing-capacitor-8 — Announcing Capacitor 8 (8 Dec 2025); 21b. https://ionic.io/blog/the-road-to-capacitor-9 (28 Aug 2026) and https://ionic.io/blog/capacitor-9-starts-here (8 May 2026)
22. https://capacitorjs.com/docs/updating/8-0 — Updating to Capacitor 8.0
23. https://capacitorjs.com/docs/ios — Capacitor iOS Getting Started
24. https://stackoverflow.com/questions/62893456/ — getUserMedia in Capacitor WKWebView (accepted answer by Capacitor maintainer jcesarmobile); 24b. https://capacitorjs.com/docs/ios/configuration — Configuring iOS (Info.plist)
25. https://github.com/ionic-team/capacitor/blob/main/android/capacitor/src/main/java/com/getcapacitor/BridgeWebChromeClient.java — Capacitor BridgeWebChromeClient; 25b. https://developer.apple.com/documentation/webkit/wkuidelegate/webview(_:requestmediacapturepermissionfor:initiatedbyframe:type:decisionhandler:)
26. https://developer.android.com/reference/android/webkit/WebChromeClient and https://developer.android.com/reference/android/webkit/PermissionRequest — Android WebView permission APIs
27. https://reactnative.dev/blog/2025/10/08/react-native-0.82 — RN 0.82 "A New Era"; https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture
28. https://reactnative.dev/blog — RN blog (0.88, 19 Oct 2026); https://reactnative.dev/blog/2026/02/11/react-native-0.84
29. https://expo.dev/changelog/sdk-58 and https://docs.expo.dev/versions/v58.0.0 — Expo SDK 58; 29b. https://docs.expo.dev/versions/latest/sdk/audio/ — expo-audio
30. https://r3f.docs.pmnd.rs/getting-started/installation — R3F installation (React Native section); 30b. https://docs.expo.dev/versions/latest/sdk/gl-view/ — Expo GLView
31. https://github.com/pmndrs/react-three-fiber/issues/3517 — "React Native is no longer supported" issue; 31b. https://raw.githubusercontent.com/react-native-webview/react-native-webview/HEAD/docs/Reference.md
32. https://v2.tauri.app/blog/tauri-20/ — Tauri 2.0 Stable (2 Oct 2024); 32b. https://v2.tauri.app/release/tauri/all-versions/
33. https://cordova.apache.org/blog/ — Apache Cordova blog (cordova-ios 8.2.0, 9 Nov 2026)
34. https://cordova.apache.org/announcements/2026/07/22/cordova-android-15.1.0.html ; https://github.com/apache/cordova-android/blob/master/RELEASENOTES.md
35. https://www.construct.net/en/blogs/construct-official-blog-1/boosting-ios-performance-855 — Boosting iOS performance with WKWebView (Construct; historic)
36. https://unity.com/blog/unity-is-canceling-the-runtime-fee — Unity cancels Runtime Fee (12 Sep 2024)
37. https://unity.com/products/pricing-updates — Unity Pricing Changes (2026 changes, announced 10 Nov 2025)
38. https://unity.com/products/unity-pro — Unity Pro pricing page
39. https://godotengine.org/license/ — Godot License (MIT)
40. https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html — Godot Exporting for iOS (4.7 docs)
41. https://developer.apple.com/app-store/review/guidelines/ — App Review Guidelines
42. https://developer.apple.com/news/?id=ey6d8onl — Updated App Review Guidelines (13 Nov 2025); https://techcrunch.com/2025/11/13/apples-new-app-review-guidelines-clamp-down-on-apps-sharing-personal-data-with-third-party-ai/
43. https://developer.apple.com/distribute/app-review/ — App Review (review-time stat, expedited reviews)
44. https://developer.apple.com/news/upcoming-requirements/ — Upcoming Requirements; 44b. https://developer.apple.com/testflight/ — TestFlight; 44c. https://developer.apple.com/news/?id=ks775ehf — Updated age ratings (24 Jul 2025)
45. https://developer.apple.com/news/ — items dated Oct–Nov 2026 (guideline updates 2.3.14/2.5.19; new age-rating descriptors from 16 Nov 2026)
46. https://developer.apple.com/help/account/membership/program-enrollment/ — Enrollment (US$99 fee)
47. https://developer.apple.com/programs/enroll/ — Become a member; 47b. https://developer.apple.com/help/account/membership/fee-waivers/ — Fee waiver
48. https://developer.apple.com/help/account/membership/D-U-N-S/ — D-U-N-S Number
49. https://support.google.com/googleplay/android-developer/answer/6112435 — Get started with Play Console (US$25)
50. https://support.google.com/googleplay/android-developer/answer/14151465 — App testing requirements for new personal developer accounts
51. https://support.google.com/googleplay/android-developer/answer/11926878 — Target API level requirements
52. https://support.google.com/googleplay/android-developer/answer/9859751 — Publish your app (review times)
53. https://support.google.com/googleplay/android-developer/answer/14094294 — Understanding Play's AI-Generated Content policy; 53b. https://support.google.com/googleplay/android-developer/answer/13985936 — AI-Generated Content policy
54. https://support.google.com/googleplay/android-developer/answer/9859372 — Play app size limits
55. https://support.google.com/googleplay/android-developer/answer/13628312 — Required information to create a Play Console developer account
56. https://expo.dev/pricing — Expo Services pricing
57. https://codemagic.io/pricing/ and https://docs.codemagic.io/billing/pricing/ — Codemagic pricing
58. https://docs.github.com/en/billing/reference/actions-runner-pricing — GitHub Actions runner pricing; https://macbox.build/guides/github-macos-runner-cost/ (secondary, 2026 price cut)
59. https://developer.apple.com/xcode-cloud/get-started/ — Get started with Xcode Cloud (25 compute hours)
60. https://developer.apple.com/programs/whats-included/ — Apple Developer Program membership details
61. https://developer.apple.com/help/app-store-connect/reference/app-uploads/maximum-build-file-sizes/ — Maximum build file sizes
62. https://www.macrumors.com/how-to/download-large-apps-over-cellular-iphone-ipad/ — Download large apps over cellular (MacRumors, 2020)
63. https://www.ca5.uscourts.gov/opinions/pub/25/25-51073-CV0.pdf — 5th Circuit order granting stay (SB 2420)
64. https://www.scotusblog.com/2026/07/supreme-court-allows-texas-to-enforce-law-requiring-age-verification-and-parental-consent-on-app/ ; https://arstechnica.com/tech-policy/2026/07/supreme-court-lets-texas-enforce-age-verification-law-on-app-stores/ (7 Jul 2026)
65. https://news.bloomberglaw.com/litigation/texas-app-age-proof-law-needs-more-analysis-fifth-circuit-hints (4 Aug 2026); https://texasdatalaw.com/tracker/sb-2420-litigation/ ; https://ccianet.org/litigation/ccia-v-paxton-w-d-tex/
66. https://developer.apple.com/news/?id=f5zj08ey — Age requirements for Brazil, Australia, Singapore, Utah, Louisiana (24 Feb 2026); 66b. https://le.utah.gov/Session/2025/bills/enrolled/SB0142.pdf — Utah SB 142
67. https://developer.apple.com/news/?id=sg176nne — Update for Apps Distributed in Texas (3 Jun 2026); 67b. https://developer.apple.com/news/?id=2ezb6jhj — Next steps for apps distributed in Texas (4 Nov 2025)
68. https://www.legal500.com/intelligence/united-states/privacy/update-your-app-(again)-californias-digital-age-assurance-act-takes-effect-january-1-2027 ; https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1043
69. https://developer.android.com/google/play/age-signals/use-age-signals-api — Play Age Signals API; https://support.google.com/googleplay/android-developer/answer/16569691
