# Roast Arena: spec v1 (waiting for Sadman's OK)

Nov 14, 2026, 1:36pm. Track: **Chroma Arcade & Party**. Demo at 5pm today. Working title.

## The game in one line
2-4 chunky toy fighters on a floating arena that shrinks; bump each other off; last one standing wins
the round. A live sports announcer calls every bump and roasts whoever just fell. Rounds last ~60 s.

## Why it fits the scoring
- Theme (Arcade & Party): playable in seconds, quick rounds, friendly competition, the room laughs.
- Creativity & AI: the announcer reacts to what really happened (who hit whom, how fast, how many falls).
- Craft: bump hit-stop, knockback, squash on landing, camera nudge, KO burst (nintendo-feel / reactive-feel rules).
- Sound & emotion: announcer voice, crowd swells, music that speeds up as the arena shrinks.

## How people play it at the demo
- **Phase 1 (must work by 5pm): one screen, local players.** P1 WASD, P2 arrow keys, P3/P4 game
  controllers if any. Judges grab the laptop and play.
- **Phase 2 (stretch): phones as controllers.** QR code on screen; each judge's phone becomes a joystick +
  bump button (a small room server). Only if Phase 1 is done and solid by ~4pm.

## Round flow
Title -> pick fighter + name -> 3-2-1 -> fight (arena rings fall away at 20 s and 40 s) -> last standing
wins the round -> announcer verdict -> first to 3 rounds wins -> rematch button.

## Controls
Move, **Bump** (short dash that knocks others back; 1 s cooldown). That's all. Touch buttons on phones.

## The announcer
- ElevenLabs voice. A bank of ~60 pre-made lines per event (round start, big bump, fall-off, comeback,
  last two standing, winner), generated in one batch and kept in the asset manifest. Instant, no lag,
  works on bad Wi-Fi.
- **Live mode (stretch):** player names said out loud, and fresh lines written by an AI model on the spot,
  through a small backend (Modal or a Cloudflare worker) so no key sits in the browser.
- Teasing stays about play only (falls, misses, bragging), never about who someone is.

## Look (needs your OK on a mockup first)
Bright toy-like arena floating in a sky, chunky rounded fighters (Meshy models, one shared style
reference), big readable UI. I'll make PC and phone mockups with ChatGPT while the grey-box game gets built.

## Tools and who does what
- **Devin**: builds features as PRs with Devin Review (the judges' sponsor; needs your Devin sign-in).
- **Claude (me)**: writes Devin's briefs, builds/fixes where faster, tests in the browser, checks phone size.
- **Meshy**: 4 fighters + arena props. **ElevenLabs**: announcer, SFX, music. **Modal**: live-mode backend (stretch).
- Three.js + Vite, tests with Vitest, deployed to Cloudflare Pages or Vercel (public link), "Built with
  Devin" credit, GitHub repo on your account.

## Order of work (grey boxes first, like the organizers' guide)
1. Grey-box arena, 2 local players, bump, fall, rounds. Fun before anything else. (by ~2:45)
2. Feel pass: hit-stop, knockback, shrinking arena, camera, KO effects. (by ~3:15)
3. Announcer line bank + SFX + music from ElevenLabs. (by ~3:45)
4. Meshy fighters and arena after you approve the mockup. (by ~4:15)
5. Deploy, record a backup gameplay video, "how it was built" slide. (by ~4:45)
6. Stretch: phone controllers, live announcer.

## Out of scope today
Online matchmaking, accounts, saving, more than one arena, Roblox.
