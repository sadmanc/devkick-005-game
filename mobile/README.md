# Sound Local mobile app (Capacitor)

The phone app wraps the same Vite build as the website (`../dist`) in native iOS and Android shells
with Capacitor 8. Game code stays in `src/`; this folder only holds the native projects.

## How it talks to the backend

Inside the app, the page is served from `capacitor://localhost` (iOS) or `https://localhost` (Android),
so relative URLs like `api/otter` would hit the app's own files. `npm run build:web` therefore builds
with `VITE_API_BASE=https://sound-local.vercel.app` (override by exporting `VITE_API_BASE`), and
`server/otter.js` answers CORS preflights from those two app origins only.

## Build

```sh
npm ci && npm ci --prefix mobile     # from the repo root
cd mobile
npm run build:android                # debug APK in android/app/build/outputs/apk/debug/
npm run build:ios-sim                # macOS + Xcode only: unsigned simulator build
npx cap open ios                     # macOS: open in Xcode to run on a device or archive for TestFlight
```

CI (`.github/workflows/mobile.yml`) builds both on every PR touching the game; the Android job
uploads the debug APK as an artifact.

## Before the App Store

- App id is `com.soundlocal.app` (`capacitor.config.json`). It can't change after the first upload.
- Signing and TestFlight upload need an App Store Connect API key (issuer id, key id, .p8) stored as
  GitHub secrets; not set up yet.
- The mic prompt text is `NSMicrophoneUsageDescription` in `ios/App/App/Info.plist`.
- Still to do: app icons and splash, sound with the iPhone silent switch on (audio-session plugin),
  an AI/voice consent screen (App Store guideline 5.1.2), and the phone-layout fixes.
