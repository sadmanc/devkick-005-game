# Sound Local: how we built it

*Devin Game Jam (devkick 005), University of Toronto, November 14, 2026*

**Play it:** [sound-local.vercel.app](https://sound-local.vercel.app) (any browser, PC or phone; allow the microphone)

**Code:** [github.com/sadmanc/devkick-005-game](https://github.com/sadmanc/devkick-005-game)

---

## What it is

Sound Local is a browser game where you learn a local accent by talking to the locals.

You land in Glasgow and meet the Devin otter, dressed for Scotland in a tam o' shanter and kilt.
The otter says a Scots phrase in a real Glaswegian accent. You hold the mic button and say it back.

The game scores two things:

- **Your words:** did you say the right phrase?
- **Your accent:** how close your pitch and rhythm are to the otter's.

The otter reacts to how you did. You can also free-talk with it, and its trust in you rises as you
sound more local.

Our team of three built it in one afternoon.

---

## Where we used Meshy

Meshy made the star of the game: the 3D Devin otter you talk to, including its rig and every
animation it plays. The otter is in every scene, so Meshy is on screen the whole time you play.

How it went from a picture to the game:

1. **Reference picture.** We made a clean front view of the Devin otter in Scottish dress
   (tam o' shanter, kilt, sporran) with ChatGPT images, based on the Devin mascot.
2. **Image to 3D.** Meshy 7.1 image-to-3D turned that picture into a textured model
   (Ultra, 2K texture, A-pose).
3. **Remesh.** Meshy's remesh brought it down to about 30,000 triangles, so it runs smoothly in a
   phone browser.
4. **Rig and animations.** Meshy's humanoid auto-rig, plus six of its animations:
   Talk with Hands Open, Victory Cheer, Shrug, Stand Talking Angry, Walking and Running.
5. **Into the game.** In Blender we painted the otter's cream belly patch onto the Meshy texture
   and shrank the file to 4.5 MB. The game picks a Meshy animation for each moment:
   - talking while it speaks
   - Victory Cheer when you nail a phrase
   - Shrug or Angry when you miss

The Glasgow street behind the otter was built separately in Blender.

---

## How we built it

We split the game into three lanes, one per person, and merged about 20 small pull requests into
one GitHub repo over the afternoon. AI agents (Devin, Claude Code, Cursor) wrote most of the code;
each of us directed and tested our own lane.

### Sadman: game, art, deploy

- The 3D scene, the Meshy otter and the Glasgow street
- The world map and the lesson path
- The say-it-back melody lines (your pitch next to the otter's)
- Free-talk upgrades: Scots word tray, live captions, weather and music that follow trust
- The live site

*Tools: Meshy, Claude Code, ChatGPT images, Blender, Three.js, Vercel*

### Vu: voice scoring and scenes

- Pitch tracking and the accent score against the otter's clip, tuned on real clips
- The flower stall scene with Morag
- The "Prove You're Local" test

*Tools: Devin, Cursor, browser speech recognition*

### Paul: voice, sound, free talk

- The otter's Glaswegian voice lines
- Sound effects, music and ambience
- The first version of free talk with the otter

*Tools: ElevenLabs voices, sound effects and music*

In free talk, the otter's replies come from Claude and are voiced by ElevenLabs. Every generated
asset is logged with its tool and prompt in the repo's
[asset log](https://github.com/sadmanc/devkick-005-game/blob/main/assets/manifest.json).

---

## Challenges and what we learned

- **A face that reacts.** Meshy's rig moves the body but not the face, so we added eyebrows and
  blush on top of the model that change with each reaction. With the body animations, the otter
  reads as happy, unsure or annoyed at a glance.
- **Phones.** On a phone screen the lesson card covered the otter's face. We moved the 3D view up
  and the speech bubble aside.
- **Scoring an accent.** Checking the words was not enough, so the score also compares your pitch
  and rhythm with the otter's recorded line.
- **Three people, one afternoon.** One lane each, small pull requests, and a game that stayed
  playable the whole time.
