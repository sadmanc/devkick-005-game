# The tools, and how to make each one visible

Rule of thumb: every sponsor tool should do a job a judge can **see or hear in the first minute**, and
should show up again in the "how we built it" slide with a number.

## Devin (Cognition) - the coder. Credits provided.
- Use it the way Cognition advertises it: several **parallel sessions** (game core, audio, UI, backend),
  each change a **PR**, **Devin Review** on every PR (Review 2.0 out Nov 5, 2026; 82% cheaper per review),
  tests Devin writes and runs.
- Devin can drive a browser and record screen video, so it can **playtest its own game** and capture
  gameplay footage (useful for the Chroma video).
- New on Nov 13, 2026: **Devin Apps** (apps hosted on Devin's own machine). They are private and need a
  Devin sign-in, so they **do not** meet Chroma's public-link rule. Use them only as a nod in the demo, and
  host the real game on Cloudflare Pages, Vercel or Netlify.
- Keep the receipts: number of sessions, PRs, merged PRs, tests, lines. Judges at a Devin jam love these.
- Fit for Sadman: he directs, Devin builds. That is the exact story Cognition sells.

## ElevenLabs - voice, music, SFX (incubates Chroma; $22,000 tool prize pool)
- Strongest use: **voice as gameplay**. A live character or announcer that reacts to what the player did
  (an LLM writes the line, ElevenLabs text-to-speech says it, ~1 s), like Downhill's otter.
- Also: generated music loops and SFX; speech-to-text so players can talk to the game.
- Proof for Chroma: keep prompts, generation history screenshots, and the API calls.

## Meshy - 3D models (Meshy Game of the Year + $11,000 pool)
- Text-to-3D and image-to-3D, plus **auto-rigging and animation**. Export GLB into Three.js.
- Make the hero character and a few signature props in Meshy so they're on screen the whole time.
- Keep a consistent look by using one style reference image for every model.

## Modal - serverless backend
- Host the live AI pieces (voice line generation, image or model jobs) and a **shared leaderboard** or
  **room server** so judges can play together on their phones.

## Rosebud (optional, $500 Chroma tool prize)
- AI game maker in the browser; Yohann used it for early art. Only worth it if it saves time.

## Stack that fits all of this
- **Three.js** (3D) or **Phaser** (2D) single-page web game, built with Vite, deployed to Cloudflare Pages.
- Phone-friendly controls so a judge can play on their own phone from a **QR code**.
