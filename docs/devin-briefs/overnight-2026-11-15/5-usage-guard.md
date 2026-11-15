# Devin brief 5: overnight usage guard (scheduled automation, every 15 minutes)

You are a short, cheap check. Don't clone the repo, don't open a PR, don't start child sessions. Finish in a few minutes.

Sadman's rule (Nov 15, 2026): all overnight sessions run on Fusion; **if the weekly quota reaches 25%, go cheaper;
if it reaches 50%, pause everything.**

## Setup

- API: `https://api.devin.ai/v3/organizations/$DEVIN_ORG_ID/...` with header `Authorization: Bearer $DEVIN_API_KEY`
  (a personal access token Sadman stored as a Devin secret). Org: `sadmanc` (find its id with the API if
  `$DEVIN_ORG_ID` isn't set). Docs: https://docs.devin.ai/llms.txt (v3 sessions: list, get, messages, archive).
- The API doesn't show the plan's weekly quota %, so estimate it from ACUs:
  **CALIBRATION: 1% of the weekly quota ≈ `ACU_PER_PERCENT` ACUs** (filled in when this was set up; if it still
  says `ACU_PER_PERCENT`, use 25% = the first time total ACUs since 3:15am Nov 15 Toronto time reach 60, and say
  in your log that it's a guess).

## Each run

1. List the org's sessions; for each session created after 2:15am Nov 15 Toronto time (the overnight ones and
   their children), get `acus_consumed`. Sum them = ACUs used tonight. Estimate quota % = sum / ACU_PER_PERCENT.
2. Under 25%: do nothing.
3. 25% or more (once): send each **running parent** session (titles about Toronto, Mobile Feasibility, Market
   Analysis, Accent Science) this message: "Usage guard: the weekly quota passed 25%. Go cheaper from now on: at
   most 2 child sessions at once, new children on Lite or SWE-2 Flash, close finished children, push often. Keep
   going with your brief." Don't repeat it on later runs (check the session's messages first).
4. 50% or more: send each running parent "Usage guard: the weekly quota hit 50%. Commit and push your work and
   update your PR description with what's done and what's left, then stop." On the next run, archive (put to
   sleep) every overnight session that is still running, children included. Never terminate or delete.
5. Never buy usage, never change settings, never touch sessions created before 2:15am Nov 15.
6. Reply with one line: time, ACUs tonight, estimated %, what you did.
