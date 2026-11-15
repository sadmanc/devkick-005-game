# Overnight Devin run, Nov 15, 2026 (Sadman)

Three Devin sessions run in parallel tonight, each with its own brief in this folder:

| Session | Brief | Branch it pushes | What it hands back |
| --- | --- | --- | --- |
| 1. Toronto unit | [1-toronto-unit.md](1-toronto-unit.md) | `sadman/toronto-unit` | A playable Toronto region (lesson roadmap + talk-to-the-locals playground) and a Toronto accent study, as a PR |
| 2. Mobile app feasibility | [2-mobile-feasibility.md](2-mobile-feasibility.md) | `sadman/mobile-feasibility` | `docs/research/mobile-app/FEASIBILITY.md` (+ an Android proof build if it works), as a PR |
| 3. Market and competitors | [3-market-analysis.md](3-market-analysis.md) | `sadman/market-analysis` | `docs/research/market/REPORT.md`, as a PR |

## Where things stand (read this first, every session)

- **The jam is over.** Sound Local was built at devkick 005 (Nov 14, 2026). The team (Sadman, Lucas Vu, Paul)
  now wants to turn it into a real, shipped product: "Duolingo for accents". `AGENTS.md` still says "one-day
  jam, demo at 5pm": ignore the deadline parts, keep its rules (stack, tests, phone size, asset log, no keys
  in `src/`, no real people's voices or faces).
- **The PRD is the source of truth:** `docs/prd/PRD.md` (Word copy `docs/prd/PRD.docx`, same text as the
  copy Sadman sent on Nov 15). Read section 1 (summary) and 3 (what exists) before anything else, then the
  sections your brief names.
- **This branch (`sadman/overnight-context`) has every project file:** the game code on `main`, plus Lucas's
  in-progress Mumbai work (`vu/mumbai-overnight`, from his fork, tip `67eb734`: the region registry in
  `src/content/regions/`, Mumbai content, cost notes in `docs/prd/cost-notes.md`), plus
  `docs/context/` (the jam research notes and the build write-up `docs/context/sound-local-writeup.md`)
  and every NPC concept picture in `art/npcs/`.
- **The live game:** https://sound-local.vercel.app (Glasgow).

## Rules for all three sessions

1. **Start from `sadman/overnight-context`.** Create your own branch (table above). Never push to `main`,
   never force-push, never merge a PR, never touch another session's branch or files. Open one PR into
   `main` of `sadmanc/devkick-005-game` titled as your brief says, and keep pushing to it as you go.
2. **Commit small and often** (Conventional Commits), push every few commits so nothing is lost.
3. **Use subagents** (child sessions) for parallel research or build lanes whenever it makes the result
   better. Pick models by the job: the strongest models for synthesis, judgment and hard code; cheaper fast
   models for bulk fetching, scraping and summarising single sources. Don't put the biggest model at max
   effort on everything, and don't be shy about a strong model where it clearly helps.
4. **Facts need sources.** Every number or claim about the outside world gets a link and the date you read
   it. Anything you could not check is marked **ASSUMPTION** or **UNVERIFIED**. Never invent figures,
   quotes, download counts or revenue.
5. **No secrets in the repo.** Keys only from Devin secrets / env. If a secret your brief mentions is
   missing, do everything that doesn't need it and say exactly what's blocked in the PR.
6. **Write for a non-coder founder.** Reports open with a one-page summary in plain words, then detail.
   Sadman doesn't code; he directs. Say what you recommend, not just options.
7. **End of session:** the PR description lists what's done, what's verified (and how), what isn't, and
   the next steps.
