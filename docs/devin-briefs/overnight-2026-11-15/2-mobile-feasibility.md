# Devin brief 2: feasibility guide for turning Sound Local into a mobile app

Repo `sadmanc/devkick-005-game`. Start from branch `sadman/overnight-context`, push to
**`sadman/mobile-feasibility`**. PR title: **"Mobile app feasibility guide"**. Docs only, except the
optional proof build below (keep it in `mobile-spike/`, never touching `src/`).

Read first: `docs/devin-briefs/overnight-2026-11-15/README.md` (shared rules), then `docs/prd/PRD.md`
(all of it: architecture today and target, sections 15-17, AI and data, unit economics 19, business model
20, open questions 22), `docs/prd/cost-notes.md`, and enough of the code to know exactly how it works today:
`src/voice/` (mic, pitch, scoring), `src/scene*`/Three.js setup, `server/` and `api/` (Vercel functions,
ElevenLabs TTS/STT, Claude), `vite.config.js`, `package.json`.

## The question

Sound Local is a Three.js web app today (Vite, Vercel, browser mic, ElevenLabs, Claude). The founders want
to know: **should we turn it into a mobile app, how, what does it cost, and what changes?** Sadman asked for
"literally everything in between". Write `docs/research/mobile-app/FEASIBILITY.md` (long is fine, with a
one-page plain-English summary and a clear recommendation at the top).

## What it must cover

1. **What we have today**, precisely: every browser API and service the app relies on and how each
   behaves on iPhone Safari and Android Chrome right now (mic permission flow, getUserMedia, Web Audio,
   autoplay rules, speech recognition, WebGL/Three.js performance, memory, battery, storage).
2. **Every way to go mobile**, compared in one table and then in depth, with effort, cost, risk and what
   code we can keep:
   - Installable web app (PWA), and what iOS still blocks (push since iOS 16.4 only when installed,
     storage eviction, no App Store discovery...)
   - Wrapping the current web app (Capacitor; also note Tauri mobile, Cordova)
   - React Native / Expo with the 3D in a WebView or expo-gl / react-three-fiber native
   - Fully native (Swift/SwiftUI + Kotlin/Compose), and game engines (Unity, Godot) for the 3D
3. **Limitations that go away** as a mobile app: e.g. reliable push notifications for streaks (Duolingo's
   core retention tool), widgets, home-screen presence, background audio, haptics, better mic and audio
   session control (echo cancellation, low latency, Bluetooth headsets), on-device speech recognition
   (Apple Speech, Android SpeechRecognizer, Whisper/whisper.cpp on device) and on-device pitch analysis,
   offline lesson packs, store discovery and ratings, in-app purchases/subscriptions.
4. **Limitations a mobile app brings**: App Store / Play review (and Apple guideline 4.2 "minimum
   functionality" for wrapped web apps), review delays and slower fixes, platform fees (Apple and Google
   cuts, small-business rates, the post-Epic v. Apple US rules for linking to web payments; check the
   current state and date it), two platforms, device fragmentation, app size with 3D models and audio,
   developer accounts, needing a Mac for iOS builds, TestFlight/beta tracks.
5. **Voice, privacy and safety on mobile**: microphone permission text, App Privacy labels / Play data
   safety, storing voice recordings (is a voiceprint biometric data? Illinois BIPA, GDPR, Quebec Law 25,
   PIPEDA in Canada), age ratings and kids (COPPA) if teens use it, AI-generated content rules in both stores.
6. **Money**: one-off and monthly costs (accounts, build services like EAS or Codemagic, devices to test,
   backend), how in-app subscriptions change revenue per user vs web payments, and how the AI cost per
   conversation (cost-notes.md) changes if speech recognition or pitch scoring moves on device.
7. **A recommended path** with phases (e.g. PWA now, wrapped app for the store next, native pieces only
   where they pay off), what to build first, rough timeline for a team of three directing AI coders, and
   the decisions the founders must make.
8. **Risks and unknowns**, each with how to test it cheaply.

Use subagents in parallel for the research strands (platform rules, audio/speech tech, payments and fees,
privacy law, competitor apps' tech choices: check what ELSA Speak, Duolingo, BoldVoice and Speak are built
with where it's public). Every fact gets a source link and the date read.

## Optional proof (only after the report is solid)

If it's practical in your Linux machine: in `mobile-spike/`, wrap the current build with Capacitor and
produce an **Android debug build**, then note what worked and what broke (mic permission, audio, WebGL).
iOS can't be built on Linux: say what a Mac would need. Never change `src/` for this. If it eats too much
time or fails, write up what you learned instead.

## Done when

`docs/research/mobile-app/FEASIBILITY.md` exists with the summary, the comparison table, all eight parts,
a sources list, and the PR description gives the recommendation in five lines.
