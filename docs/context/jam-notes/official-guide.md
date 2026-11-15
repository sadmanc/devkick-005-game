# Official build guide: devkick.com/005 (+ devkick.com/context)

Sadman pointed to this page on Nov 14, 2026 ("this website has all the info of what we need"). Read the
same day. This is the organizers' own page; where it differs from Luma, trust this.

## What it says
- "Build a game in one day and submit it to the Chroma Awards. Come solo or bring a team, pick a category,
  and ship a playable game." No theme. No tracks beyond Chroma's categories.
- **5pm: presentations.** "Want to present and enter to win? Show us what you built." Presenting is how you
  enter. The winner goes automatically into the semifinals of its chosen Chroma category.
- No cash prize, no side prizes, no judging criteria, no judge names on the page.
- No rule against building before the start.
- After: "Go home and keep working on your game." Chroma closes Jan 7.

## Credits (ask your host for codes)
- **Devin**: trydevin.ai, sign in, claim credits.
- **ElevenLabs**: elevenlabs.io; an ElevenLabs rep is on site to help add the code.
- **Meshy**: meshy.ai, gift icon bottom-left, "Redeem Code", then Meshy Pro monthly at $0 for month one.
  **Needs a card and auto-renews at the full Pro price** unless cancelled; new accounts only; one code per
  account across all Chroma jams. Sadman enters the card himself and should cancel before renewal.
- **Rosebud AI**: code at checkout for a free month of "10x Dev"; auto-renews unless cancelled.
- **Modal**: optional, for batch asset scripts or a leaderboard / replay / AI commentary backend.

## The two example games (what the organizers consider good)
- **Downhill** (devkick.com/downhill): Three.js + Vite, hand-written bike physics, Vitest tests, procedural
  900 m course, Devin over ~4 days "one working milestone at a time", Cloudflare Pages deploy on every merge.
- **Floor 13** (devkick.com/floor13): first-person apartment horror, procedural floors, search rooms,
  question residents (ElevenLabs voice lines), Meshy monsters and props, automated gameplay tests, WIP.

## How they want it built (from their sample prompts on /context)
- Three.js + Vite browser game. **Grey boxes first, "get it fun"**, then swap in Meshy models and a Rosebud skybox.
- Keep every generation prompt in an **asset manifest**.
- ElevenLabs for SFX, music, voice lines. Modal optional.
- Tests (Vitest; even an autopilot that can finish the level). Touch controls for phones.
- A **"Built with Devin" credit** in the game. A PR after each working milestone. Deploy to Cloudflare Pages.
- Floor 13 brief adds: captions and volume controls, pause menu, check real gameplay not just tests, a short promo
  ending with the play URL, "ask before spending generation credits".
- Their token-efficiency notes for Devin briefs: name the files and checks up front, give the exact "done"
  test, split work into verifiable milestones, new session per task.

## Discord check (Nov 14, through his Chrome)
- devkick server: channels rules, cafe00, next-kick, show-your-work, hackathons. **Nothing about the jam**
  (latest items are a Kick 002 Luma link from July and a Hack the North post).
- Chroma server: welcome, announcements, submission-of-the-day, faq, ai-support, general, film, music-videos,
  **games-chat**, advertising chats. Not read in full; stopped once the official page was found.
- He is also in UTMIST and ElevenLabs servers (UTMIST showed 1 mention; not opened).
