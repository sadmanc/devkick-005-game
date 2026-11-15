# Devin brief 6: deep TikTok and Instagram Reels pass for the Toronto accent study

Repo `sadmanc/devkick-005-game`. Work on the existing branch **`sadman/toronto-unit`** (PR #33, "Toronto region:
accent study, lesson roadmap and talk-to-the-locals playground"). Add commits to it; don't open a new PR, don't
touch game code unless the study changes a lesson line (then say so in the PR).

Read first: `docs/devin-briefs/overnight-2026-11-15/README.md` and `1-toronto-unit.md` (on `sadman/overnight-context`),
then on `sadman/toronto-unit`: `docs/research/toronto-accent/STUDY.md`, `sources.json`, the `acoustics/` folder and
the first pass's `video_notes.md` if it's there.

## Why

The first pass (2:48am) got 89 YouTube videos but only skimmed TikTok and Instagram: TikTok search needed a login and
the research account failed ("Account doesn't exist"), and Instagram was browsed logged out, so reels were judged
from captions and thumbnails, not by listening. Sadman wants the short-form platforms actually scrolled and watched,
because that is where Toronto accent and slang content lives.

## Do this

1. **Log in** with the throwaway research accounts in Devin secrets: `TIKTOK_RESEARCH_USERNAME` /
   `TIKTOK_RESEARCH_PASSWORD` and `IG_RESEARCH_USERNAME` / `IG_RESEARCH_PASSWORD` (reference them as secrets; never
   write them anywhere). If TikTok's login form wants an email or phone, the username secret holds it. Use the
   browser like a person: human pace, no scripts that hammer the site. On a captcha, a "suspicious activity" warning,
   or a failed login, stop on that platform, note it, and carry on with the other one. Never try to get around a
   block. Never like, follow, comment, post or message.
2. **Scroll and watch.** Search and hashtag pages: #torontoaccent, #torontoslang, #torontomans, #6ix, #torontotiktok,
   #canadianaccent, #mte, "toronto accent", "toronto slang", "how to sound like you're from toronto", "toronto mans
   be like", "toronto vs", street interviews in Toronto. Also follow the "related"/sound pages of the best clips.
   Aim for **60+ watched short videos** across both platforms. For each one actually play it with sound and write
   down what the speaker does with their voice, with timestamps (same fields as `sources.json`; `notes` says
   "watched with audio 2026-11-15"). Mark Toronto-native status as stated, else UNVERIFIED. Never invent anything.
3. **Measure the best ones.** For up to 20 clips with clear single-speaker speech, save the audio temporarily
   (outside the repo, e.g. with `yt-dlp` where it works for that URL, or a screen-audio capture), run the same
   measurements as `acoustics/` (pitch, formants for the key vowels, rhythm), add the numbers and charts to
   `acoustics/`, then delete the audio. Never commit or ship audio or video, never clone a voice.
4. **Update the study.** Add the new entries to `sources.json`, fold anything new (slang that's current on TikTok,
   pronunciations, intonation patterns, what's dated) into `STUDY.md`, and add a short section "What short-form
   video adds" with the 10 most useful clips. If it changes what a lesson should teach, update that lesson's
   content file and list the change in the PR. Respect Charter (PRD section 9) still applies; keep everything
   "pending native review".
5. Commit small, push often, and add a comment to PR #33 summarising this pass: how many watched per platform,
   what blocked you, what changed.

Use at most 2 child sessions (e.g. one per platform), on a cheap mode for the scrolling; keep the synthesis in your
own session. Finish in about 2-3 hours of work.
