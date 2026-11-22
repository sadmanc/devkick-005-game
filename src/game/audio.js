// Speech + sound effects. Plays the content's mp3 if it exists, otherwise the browser's own voice,
// so missing audio never breaks the demo.
let ctx;
function ac() {
  ctx ??= new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

let muted = false;
export function setMuted(m) {
  muted = m;
  if (m) globalThis.speechSynthesis?.cancel();
  applyBed();
}
export const isMuted = () => muted;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => /fiona/i.test(v.name)) || // macOS Scottish voice
    voices.find((v) => /en[-_](gb|scotland)/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

function speakTts(text) {
  return new Promise((resolve) => {
    if (muted || !globalThis.speechSynthesis) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 1.15;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
    setTimeout(resolve, 6000);
  });
}

// ---- how loud the otter's voice is right now (0..1), for the mouth movement
let voiceAnalyser = null;
let voiceBuf = null;
let ttsSpeaking = false;
function analyser() {
  if (!voiceAnalyser) {
    const c = ac();
    voiceAnalyser = c.createAnalyser();
    voiceAnalyser.fftSize = 512;
    voiceAnalyser.connect(c.destination);
    voiceBuf = new Float32Array(voiceAnalyser.fftSize);
  }
  return voiceAnalyser;
}
let mp3Speaking = false;
export function voiceLevel() {
  if (ttsSpeaking) {
    // the browser voice can't be measured: fake a natural syllable rhythm
    const t = performance.now() / 1000;
    return 0.35 + 0.35 * Math.abs(Math.sin(t * 11)) * Math.abs(Math.sin(t * 3.1));
  }
  if (!mp3Speaking || !voiceAnalyser) return 0;
  voiceAnalyser.getFloatTimeDomainData(voiceBuf);
  let sum = 0;
  for (let i = 0; i < voiceBuf.length; i += 1) sum += voiceBuf[i] * voiceBuf[i];
  return Math.min(1, Math.sqrt(sum / voiceBuf.length) * 3.5);
}

// line = { text, audio }
export async function say(line, onStart) {
  if (!line) return;
  onStart?.();
  if (muted) return new Promise((r) => setTimeout(r, 900));
  if (line.audio) {
    try {
      const el = new Audio(line.audio);
      try {
        ac().createMediaElementSource(el).connect(analyser());
      } catch {
        /* no analyser: the mouth just stays shut */
      }
      await new Promise((resolve, reject) => {
        el.oncanplaythrough = resolve;
        el.onerror = reject;
        setTimeout(reject, 1500);
      });
      await el.play();
      mp3Speaking = true;
      await new Promise((r) => {
        el.onended = r;
        setTimeout(r, 8000);
      });
      mp3Speaking = false;
      return;
    } catch {
      mp3Speaking = false;
      /* fall through to TTS */
    }
  }
  ttsSpeaking = true;
  await speakTts(line.text);
  ttsSpeaking = false;
}

// ---- SFX: lane 3's ElevenLabs mp3s, decoded once; the synth below plays until (or if) they load.
const SFX_DIR = 'assets/audio/sfx/';
const SFX_KINDS = ['tap', 'start', 'good', 'ok', 'bad', 'level'];
const SFX_VOLUME = 0.7;
const sfxBuffers = new Map();

async function loadSfx(kind) {
  try {
    const res = await fetch(`${SFX_DIR}${kind}.mp3`);
    // status 0: the iOS app serves bundled mp3s without an HTTP status
    if (!res.ok && res.status !== 0) throw new Error(`HTTP ${res.status}`);
    sfxBuffers.set(kind, await ac().decodeAudioData(await res.arrayBuffer()));
  } catch (err) {
    console.warn(`[audio] sfx "${kind}" unavailable, using synth:`, err.message);
  }
}

export function sfx(kind) {
  if (muted) return;
  const buffer = sfxBuffers.get(kind);
  if (!buffer) return synthSfx(kind);
  const c = ac();
  const src = c.createBufferSource();
  const gain = c.createGain();
  src.buffer = buffer;
  gain.gain.value = SFX_VOLUME;
  src.connect(gain).connect(c.destination);
  src.start();
}

// ---- Background bed: Glasgow music + street ambience, looping. Duck it under the otter and
// turn it off while the player talks so it never leaks into the mic.
const BED_TRACKS = [
  { src: 'assets/audio/music/glasgow.mp3', volume: 0.3 },
  { src: 'assets/audio/sfx/glasgow-ambience.mp3', volume: 0.2 },
];
const BED_LEVELS = { full: 1, under: 0.35, off: 0 };
let bed = null;
let bedLevel = 'full';
// Trust warms the soundscape: the music swells and the rain ambience fades as the otter comes round.
let warmth = 0.3;
const warmGain = (src, k) => (src.includes('music') ? 0.7 + 0.6 * k : 1.35 - 1.05 * k);

function applyBed() {
  for (const { el, volume, src } of bed ?? []) {
    el.volume = muted ? 0 : Math.min(1, volume * BED_LEVELS[bedLevel] * warmGain(src, warmth));
  }
}

export function startBed() {
  if (bed) return;
  bed = BED_TRACKS.map(({ src, volume }) => {
    const el = new Audio(src);
    el.loop = true;
    return { el, volume, src };
  });
  applyBed();
  for (const { el } of bed) {
    el.play().catch((err) => console.warn('[audio] background bed did not start:', err.message));
  }
}

// k: 0 (no trust) .. 1 (full trust)
export function setWarmth(k) {
  warmth = Math.max(0, Math.min(1, k));
  applyBed();
}

// A bright chime for each new Scots word: steps up a major pentatonic scale, so a run of words climbs.
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
export function chime(step = 0) {
  if (muted) return;
  const c = ac();
  const t = c.currentTime;
  const f = 523.25 * 2 ** (PENTA[Math.min(step, PENTA.length - 1)] / 12);
  for (const [mult, vol] of [
    [1, 0.18],
    [2, 0.06],
  ]) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = f * mult;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.65);
  }
}

// level: 'full' | 'under' | 'off'
export function setBed(level) {
  bedLevel = level in BED_LEVELS ? level : 'full';
  applyBed();
}

// Tiny synth fallback for when an mp3 is missing.
function synthSfx(kind) {
  const c = ac();
  const t = c.currentTime;
  const notes = {
    tap: [[660, 0, 0.06]],
    start: [[520, 0, 0.08]],
    good: [[660, 0, 0.1], [880, 0.09, 0.14], [1320, 0.2, 0.22]],
    ok: [[600, 0, 0.12], [700, 0.1, 0.14]],
    bad: [[300, 0, 0.16], [220, 0.14, 0.22]],
    level: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.35]],
  }[kind] || [[440, 0, 0.1]];
  for (const [f, at, dur] of notes) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + at);
    g.gain.exponentialRampToValueAtTime(0.18, t + at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
    o.connect(g).connect(c.destination);
    o.start(t + at);
    o.stop(t + at + dur + 0.05);
  }
}

export function unlockAudio() {
  ac();
  globalThis.speechSynthesis?.getVoices(); // missing in Android WebView
  for (const kind of SFX_KINDS) if (!sfxBuffers.has(kind)) loadSfx(kind);
}
