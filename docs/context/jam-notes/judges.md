# The judges and what they want

No judge list was published. Judging is during the 4:30-6pm demo block. The likely panel is the hosts and
sponsors. What each one is paid or motivated to care about is a reasonable reading, not a quote.

| Who (likely) | What they will want to see |
| --- | --- |
| **Yohann Calpu** (devkick, Devin Ambassador, works with Cognition; judged the SOON mansion hackathon for Cognition) | A game that runs. Devin doing real engineering: PRs, Devin Review, tests, several sessions in parallel. Sponsor tools wired in for real |
| **Jenny Calpu** (devkick co-organizer) | A fun demo the room reacts to; people who ship |
| **Nader Dabit** (Luma host; role not stated on the page) | Developer story: how far the agent got you, what it built that you couldn't |
| **Cognition** (sponsor) | A story they could post: "built in 2.5 hours with Devin" with real numbers |
| **ElevenLabs** (Chroma's incubator) | Audio that matters to play, not background: voices, reactive music, SFX |
| **Meshy** (partner) | 3D models made in Meshy that look good in the game, ideally rigged/animated |
| **Modal** (partner) | A real backend on Modal: live generation, leaderboard, multiplayer |
| **UTMIST** (student AI team) | Clever AI in the game itself, not only AI in the making of it |

## The judge's own model game: Downhill (Yohann, Oct 29 - Nov 1, 2026)
Repo: github.com/yohann888/downhill-open, playable at devkick.com/downhill. Repo topic "game-jam".
- 3D downhill bike game in the browser on a procedural mountain. Three.js.
- **Devin** wrote most of the code from plain-language asks and bug reports, every change a PR;
  **Devin Review** caught bugs before merge; a **Devin security scan** before release.
- **Meshy**: an asset manifest of text/image prompts; Modal scripts run Meshy text-to-3D, image-to-3D and rigging.
- **ElevenLabs**: SFX, music loops, voice lines from the same manifest, plus **live otter commentary**
  (Gemini writes the line, ElevenLabs speaks it).
- **Modal**: runs the asset jobs and hosts the **shared leaderboard** and commentary API.
- **Rosebud**: sky texture and first rider/bike models.
- He publishes numbers: 4 days, 135 commits, 23 merged PRs, ~11,300 lines, 99 game tests + 70 API tests.

What this tells us: he values **every sponsor tool doing a real job**, a **live AI voice that reacts to
play**, a **shared leaderboard**, **tests and reviewed PRs**, and **stating hard numbers**. A team that
mirrors this shape in one day, with a better game hook, is speaking his language.

## The Chroma judges (later rounds)
Different taste: craft first. Game feel, mechanics, art direction, audio, polish, and "AI is not why a
project wins". The jam judges pick who reaches the semis; the Chroma judges pick who wins money. A
winning plan has to please both (see strategy.md).
