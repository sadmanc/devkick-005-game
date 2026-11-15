# Devin brief 3: market analysis and competitor analysis

Repo `sadmanc/devkick-005-game`. Start from branch `sadman/overnight-context`, push to
**`sadman/market-analysis`**. PR title: **"Market and competitor analysis report"**. Docs only.

Read first: `docs/devin-briefs/overnight-2026-11-15/README.md` (shared rules), then `docs/prd/PRD.md`
(especially 1, 5 problem and opportunity, 6 vision and positioning, **7 unique selling point and
competition**, 8 personas, 10 which accents next, 19 unit economics, 20 business model and fundraising,
22 open questions), `docs/prd/PITCH.md`, `docs/prd/sim/REPORT.md`, and `docs/context/sound-local-writeup.md`.
Then play the live game at https://sound-local.vercel.app so you know the product.

Note: Lucas (a cofounder) is running his own competitor analysis. This one is Sadman's, independent: don't
copy the PRD's competition section, test it. Where you disagree with the PRD, say so and why.

## Deliverable

`docs/research/market/REPORT.md`: a fully fledged report with a 1-2 page plain-English executive summary on
top (who we compete with, how big the opportunity really is, and how we win), then the detail. Put raw data
in `docs/research/market/data/` (CSV/JSON: competitor table, pricing table, review-mining results) and
the sources list in `docs/research/market/sources.md`.

## What it must cover

1. **The market**: language learning apps overall, English learners worldwide, the pronunciation/accent
   training niche, speech coaching, accent "for fun" content (TikTok/YouTube accent challenges, "guess the
   accent" games), actors/voice talent learning dialects, immigrants and international students who want to
   be understood, call-centre/business English. Sizes with sources (TAM/SAM/SOM with the method shown),
   growth, who pays and how much. Mark weak numbers as weak.
2. **Competitors**, at least 25, grouped:
   - Direct accent/pronunciation apps (e.g. ELSA Speak, BoldVoice, Speechling, Say It, Pronounce, Accent
     Hero-type apps, Sounds Right, Blabby...: find the real current list).
   - Big language apps with speaking/AI features (Duolingo and Duolingo Max video call / roleplay, Babbel,
     Speak, Praktika, Loora, Talkpal, Langua, Busuu, Memrise).
   - Tutors and coaching (Cambly, Preply, italki, dialect coaches).
   - Games and entertainment around accents (GeoGuessr-style accent guessing, TikTok accent filters and
     challenges, party games).
   - AI voice platforms that could do this themselves (ElevenLabs, OpenAI voice, Google) and the risk that
     Duolingo copies us.
   For each: what it does, who it's for, pricing (current, by plan and country if it varies), downloads,
   ratings, revenue and funding where publicly reported (Sensor Tower/Appfigures public numbers, press,
   Crunchbase), how it scores speech, accents it covers, standout features, and a screenshot or store link.
3. **Review mining**: read real App Store / Google Play / Reddit reviews of the top 8-10 competitors and
   summarise what users love and hate, with counts and short quotes (under 15 words each) and links. This
   is where our openings are.
4. **Positioning map(s)**: e.g. serious vs fun, generic "American/British accent" vs real local accents,
   drills vs conversation with characters. Show where everyone sits and the empty spots.
5. **How we beat them**: our real advantages and real weaknesses (SWOT), the wedge (which users first and
   why), the features that matter most to win them, the moat over time (content packs, native-speaker
   community, data, characters/brand), and what to avoid.
6. **Go-to-market**: how competitors got their users, what costs what (paid ads, creators, TikTok
   organic), and a concrete launch plan for us, including the silly local-accent units (like the Toronto
   one being built tonight) as TikTok/Reels marketing, the university/international student angle, and
   pricing recommendations with reasons.
7. **Risks**: copying by big players, cost of AI per user, accent sensitivity backlash (see PRD section 9),
   store rules, and how to handle each.
8. **What to decide next**: the 5-10 decisions the founders should make, each with your recommendation.

## How to work

Run subagents in parallel (e.g. market sizing, direct competitors, big language apps, review mining,
go-to-market) and then synthesise with a strong model. Use your browser to look at store pages, pricing
pages and reviews directly instead of trusting old articles; date everything. If a paywall or login blocks a
source, say so and use the best public alternative. Never invent numbers.

## Done when

The report, data files and sources are in the PR, and the PR description has the top five takeaways and the
three things we should do first.
