# Devin brief 5: overnight usage guard (scheduled automation, every 15 minutes)

You are a short, cheap check. Touch the repo only for the state file below; don't open a PR, don't start child sessions. Finish in a few minutes.

Sadman's rule (Nov 15, 2026): all overnight sessions run on Fusion; **if the weekly quota reaches 25%, go cheaper;
if it reaches 50%, pause everything.**

## Setup

- API: `https://api.devin.ai/v3/organizations/$DEVIN_ORG_ID/...` with header `Authorization: Bearer $DEVIN_API_KEY`
  (a personal access token Sadman stored as a Devin secret). Org: `sadmanc` (find its id with the API if
  `$DEVIN_ORG_ID` isn't set). Docs: https://docs.devin.ai/llms.txt (v3 sessions: list, get, messages, archive).
- The API doesn't show the plan's weekly quota %, so estimate it from ACUs, with state kept in
  `usage-guard/state.json` on branch **`sadman/usage-guard-state`** (create the branch from `main` if missing;
  only ever commit that one file there; never open a PR for it).
- **First run (no state file yet):** sum `acus_consumed` over every session created after 2:15am Nov 15 Toronto
  time (parents and children). At ~3:05am these sessions had used **12% of the previous week's quota**, and the
  week reset at ~3:15am. So write `{"acu_per_percent": <sum / 12>, "baseline_acus": <sum>, "baseline_at":
  "<now>", "warned_25": false, "stop_sent_50": false}`. Tonight's % on later runs =
  (current sum - baseline_acus) / acu_per_percent. Say in your reply that this is an estimate.

## Each run

1. Read the state file. List the org's sessions; sum `acus_consumed` over every session created after 2:15am Nov
   15 Toronto time (overnight parents and children), excluding your own guard runs. Estimate tonight's quota %
   as above. Update the state file (flags below) and push it.
2. Under 25%: do nothing.
3. 25% or more (once): send each **running parent** session (titles about Toronto, Mobile Feasibility, Market
   Analysis, Accent Science) this message: "Usage guard: the weekly quota passed 25%. Go cheaper from now on: at
   most 2 child sessions at once, new children on Lite or SWE-2 Flash, close finished children, push often. Keep
   going with your brief." Set `warned_25` so it isn't repeated.
4. 50% or more: send each running parent "Usage guard: the weekly quota hit 50%. Commit and push your work and
   update your PR description with what's done and what's left, then stop." Set `stop_sent_50`. On the next run, archive (put to
   sleep) every overnight session that is still running, children included. Never terminate or delete.
5. Never buy usage, never change settings, never touch sessions created before 2:15am Nov 15.
6. Reply with one line: time, ACUs tonight, estimated %, what you did.
