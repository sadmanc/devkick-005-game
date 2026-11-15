# What Wildbloom already gives Sadman for this jam

Checked on the Mac, Nov 14, 2026. "Jam" = provided at the event. Roblox-only tools are listed last.

## Build (code)
| Tool | What it does here |
| --- | --- |
| Claude Code (this) | Builds and tests the whole web game; runs helpers in parallel |
| Codex (`codex`, gpt-6.1-sol) | Second builder or reviewer (`wb review`-style independent review) |
| Devin (jam credits) | The sponsor's coder; run it in parallel sessions with PRs + Devin Review so the judges see it |
| Node 26 + npm, Python 3 + uv | Three.js / Phaser / Vite web game, small servers |
| GitHub CLI (signed in as his account) | Repo for the game, PR history as proof |
| Vercel CLI | Public hosting that meets Chroma's public-link rule |
| Built-in browser + Chrome | Play-testing the web game, phone-size checks (844x390), screenshots |

## Pictures and look
| Tool | What it does here |
| --- | --- |
| ChatGPT images (`scripts/codex_image.py`, gpt-6.1-sol) | Concept art, title screen, UI mockups (his rule: UI mockups ChatGPT only) |
| Gemini (`gemini-image` skill, his Chrome) | Second image source; his rule is both AIs on every picture task |
| `game-icons` skill | Icon sheets cut into transparent PNGs |
| Figma (MCP + Chrome plugin route) | UI layouts; the Figma MCP also has image, vector, shader and video-export tools |
| `unslop` skill | Stops the menus looking AI-made (web UI is its home turf) |

## 3D
| Tool | What it does here |
| --- | --- |
| Blender (app + MCP + headless scripts) | Clean up, re-pose, re-material Meshy models; build simple low-poly props; export GLB for Three.js |
| Meshy (jam) | Text/image to 3D, rigging, animation; qualifies for Meshy prizes |

## Sound
| Tool | What it does here |
| --- | --- |
| ElevenLabs (jam; Chroma pack at submit.chromaawards.com/pack) | Voices, live lines, music, SFX; qualifies for ElevenLabs prizes |
| `sound-match` tooling + `scripts/audio_check.py`, ffmpeg | Check loudness and clipping, cut and mix sounds |
| SFX library (`references/sfx-library`) | Reference only: Roblox catalog sounds are licensed for Roblox, so **don't ship them** in a Chroma web game |

## Design knowledge (his skills and studies)
| Tool | Why it helps the score |
| --- | --- |
| `nintendo-feel`, `reactive-feel` | Craft & Technical Polish + Sound & Emotional Impact (half the score): press feedback, hit-stop, reward moments, sound on every action |
| `cookie-clicker-design`, `tycoon-hits` | Pacing and "one more go" loops, for a Puzzle & Strategy or idle-style entry |
| `roblox-game-ui` | Readable game UI rules that carry over to web |
| 49 game-study folders, his vault (`vault/`) | Proven moments that feel good (hatch reveals, cash bursts, ragdoll hits) to borrow as ideas, not as copies |

## Video and story
| Tool | What it does here |
| --- | --- |
| OBS ("Roblox" profile, 1080p60) | Gameplay video for the Chroma submission; recordings for the Behind-the-Scenes entry |
| ffmpeg | Trim and compress the video |
| `wb-career` skill | Turns the jam into resume lines (built vs directed) once it's done |

## Also on hand
- Windows PC over SSH (second machine, big files).
- Artifacts (claude.ai pages) for a pitch page; they start private, so not for the Chroma link.

## Roblox-only (not usable for the entry itself)
Roblox Studio + Studio MCP (its mesh and texture generators make Roblox assets), Rojo, `wb publish`,
stud-map / egg-* skills. Roblox needs a download, so it fails Chroma's web rule.
