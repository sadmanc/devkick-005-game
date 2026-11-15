# Game ideas aimed at these judges

Each idea uses all four tools for a visible job and fits a Chroma category. If a theme is announced at
kickoff, keep the mechanic and reskin it to the theme.

## Pick: "Roast Arena" (Arcade & Party)
A phone-in party brawler. Everyone scans a QR code; their phone becomes the controller; the big screen
shows a small 3D arena. Short 60-second rounds of bumping each other off a shrinking platform.
- **The hook:** a live AI announcer (ElevenLabs voice, LLM lines through Modal) calls the match like a
  sports commentator and **roasts each player by name** for what they just did ("Yohann fell off his own
  hackathon"). The room laughs at every round. Keep it playful, never mean about who people are.
- **Meshy:** the fighters (chunky toy mascots) and arena props, rigged with Meshy's animation.
- **ElevenLabs:** announcer voice, crowd SFX, a hype music loop that speeds up as the arena shrinks.
- **Modal:** room server for phones + announcer line generation + a tonight-only leaderboard.
- **Devin:** parallel sessions for arena/physics, phone controller, audio director, backend; PRs + Review + tests.
- Why it wins the room: every judge plays at once, within seconds, and hears their own name.
- Why it wins Chroma: Arcade & Party's brief word for word; strong audio; game feel from bumps,
  hit-stop and knockouts.

## Option 2: "Say It Back" (Music & Rhythm)
A rhythm game where an ElevenLabs singer calls a line and you answer on the beat (tap, or sing into the
mic with speech-to-text scoring). Meshy 3D band on stage reacts to your accuracy. Best if the room is
quiet enough; strongest ElevenLabs Awards entry.

## Option 3: "The Witness" (Interactive Narrative)
A 5-minute detective scene where you question 3D suspects (Meshy) out loud; each answers in a live
ElevenLabs voice and can lie. Your questions decide the ending. Very impressive, but harder to demo to
many judges at once and riskier on polish.

## Why not
- A big 3D world or open game: looks good in a pitch, collapses in a short demo.
- Pure "AI generates the whole game at runtime": the Chroma judges score craft, not novelty.

## All options, one per track (added Nov 14, with the Wildbloom tools each leans on)
Scoring reminder: Theme 25%, Creativity & AI Innovation 25%, Craft & Polish 25%, Sound & Emotion 25%.

| Track | Option | AI in the gameplay | Wildbloom edge |
| --- | --- | --- | --- |
| Arcade & Party | **Roast Arena**: phones as controllers, bump-off brawler, live announcer roasts players by name | Live LLM + ElevenLabs commentator | nintendo-feel/reactive-feel juice, Meshy + Blender fighters |
| Music & Rhythm | **Say It Back**: call-and-response rhythm game, sung lines from ElevenLabs, 3D band reacts | Generated songs and voices; mic scoring | audio_check + ffmpeg mixing, reactive-feel beat sync |
| Interactive Narrative | **The Witness**: question 3D suspects out loud, each answers in its own voice and may lie | Speech-to-text + LLM + voices | ChatGPT/Gemini scene art, unslop UI |
| Puzzle & Strategy | **Hatchery**: small browser merge/idle puzzle with a narrator who reacts to your choices | Narrator and generated creatures | cookie-clicker-design, tycoon-hits, egg game know-how |
| Experimental | **Speak It Into Being**: say an object, it drops into a physics sandbox and the world reacts | Voice -> pick from a Meshy-built library (live Meshy is too slow for a demo) | Blender cleanup, ragdoll studies for physics fun |
