// Lane 1: game shell. Title -> world map -> otter placement test -> result path.
import './ui/styles.css';
import { REGIONS, regionList } from './content/regions/index.js';
import { createStage } from './game/otterScene.js';
import { say, sfx, setMuted, isMuted, unlockAudio, startBed, setBed, setWarmth, chime, setVoiceLang } from './game/audio.js';
import { measureAccent } from './game/accentCheck.js';
import { band, clampTrust, placement, trustDelta } from './game/placement.js';
import { listen, isSupported } from './voice/index.js';
import { createLive } from './game/liveVoice.js';
import { createLessons, roadmapFrom } from './ui/lessons.js';
import { lessonItems, unitTestItems, starsFor, loadProgress, saveProgress } from './game/lessonRun.js';
import { newChat, applyTurn, lineFrom, talk as askOtter, START_TRUST } from './game/conversation.js';
import { startRecording, blobToBase64 } from './voice/record.js';
import { turn } from './game/flowers.js';
import { startQuest, questTurn, checklist, beatOf, wordingMode, wordLine } from './game/quest.js';

const $ = (id) => document.getElementById(id);
const stage = createStage($('stage'), Object.fromEntries(Object.values(REGIONS).map((r) => [r.id, r.cast])));
if (import.meta.env.DEV) window.__stage = stage; // dev-only hook for checking otter reactions
// The region you picked on the map: its placement test, cast, word tray and scene. Glasgow until then.
let region = REGIONS.scotland;
let place = region.content;
let cast = region.cast;
let words = region.words;
const { flowers } = REGIONS.scotland.quests;
const live = createLive($('live'), $('ring'), $('match'));
let lastLean = 0;
live.onVoice((voiced) => {
  $('talk').classList.toggle('voiced', voiced);
  // the otter leans in and tilts its head while you're making sound
  const now = performance.now();
  if (voiced && now - lastLean > 1400) {
    lastLean = now;
    stage.react('ok');
  }
});

function floatPop(text, kind = '', delay = 0) {
  setTimeout(() => {
    const el = document.createElement('span');
    el.textContent = text;
    el.className = kind;
    $('pops').appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }, delay);
}

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  // 2D screens (title, map, result, lessons) cover the 3D street; the otter test shows it
  document.body.classList.toggle('flat', $(id).classList.contains('flat'));
  // after free-talk practice, offer the test straight away
  if (id === 'result') $('result-test').hidden = mode === 'test';
  $('beats').hidden = mode !== 'quest';
}

// Placement: a good accent test skips you 50 lessons ahead, otherwise you start at lesson 1.
const SKIP_AT = 0.6;
const SKIP_LESSONS = 50;
const lessons = createLessons({
  root: $('learn'),
  onTap: ({ state, id }) => {
    sfx(state === 'locked' ? 'ok' : 'tap');
    if (state !== 'locked' && id && region.lessons?.playable) openLesson(id);
  },
});
// A region with playable lessons (lessons.json) plays them through the say-it-back test screen.
let run = null; // { id, title, items, intro, test } while a lesson or the unit test is on
const testItems = () => run?.items ?? place.test;
const playableLessons = () => (region.lessons?.playable ? region.lessons : null);
const roadmapNodes = (pack) => roadmapFrom(pack).flatMap((u) => u.nodes);
let placedAt = 0;

// score counts up (time grows with the number, 0.35..1.2 s), then the card settles
function countUp(el, to) {
  const dur = Math.min(1200, 350 + to * 9);
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(to * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(tick);
    else popIn(el.parentElement);
  };
  requestAnimationFrame(tick);
}

function showResult(average, level) {
  const well = average >= SKIP_AT;
  const pack = playableLessons();
  const skip = pack ? pack.units[0].lessons.length : SKIP_LESSONS;
  placedAt = well ? skip : 0;
  $('result-level').textContent = level.name;
  $('result-note').textContent = pack
    ? well
      ? `You sound like you belong here. Skipping you ahead ${skip} lessons to "${pack.units[1].title}".`
      : 'Everyone starts somewhere. You begin at lesson 1.'
    : well
      ? `Ye sound like ye belong here. Skipping you ahead ${SKIP_LESSONS} lessons to lesson ${SKIP_LESSONS + 1}.`
      : 'Everyone starts somewhere. You begin at lesson 1.';
  $('result-ribbon').textContent = 'Your accent';
  $('start-learning').textContent = 'Start learning';
  $('result-score').textContent = '0';
  show('result');
  popIn($('result').querySelector('.popup'));
  countUp($('result-score'), Math.round(average * 100));
}
function popIn(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// ---- bubble / speech
async function otterSays(line, mood = 'talk') {
  const bubble = $('bubble');
  $('bubble-text').textContent = line.text;
  $('bubble-means').textContent = line.means || '';
  bubble.classList.add('show');
  stage.react(mood === 'talk' ? 'talk' : mood);
  setBed('under');
  await say(line);
  setBed('full');
  if (mood === 'talk') stage.react('idle');
}

// ---- melody lines: otter (amber) vs. you (blue), semitones around each speaker's median
function drawMelody(pitch) {
  const svg = $('melody');
  if (!pitch?.you?.length || !pitch?.ref?.length) {
    svg.classList.remove('show');
    return;
  }
  const pts = (arr) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * 240;
        const y = 24 - Math.max(-12, Math.min(12, Number.isFinite(v) ? v : 0)) * 1.8;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  $('mel-ref').setAttribute('points', pts(pitch.ref));
  $('mel-you').setAttribute('points', pts(pitch.you));
  svg.classList.add('show');
}

// ---- state
let mode = 'chat'; // 'chat': free talk with the otter (Claude + ElevenLabs); 'test': scripted accent test
let chat = newChat();
let lastOtterLine = null;
// Free talk cast: who you're talking to, how each conversation ended, and a pending "say it back" phrase.
let npc = cast.otter;
const outcomes = {}; // id -> 'local' | 'busted' | 'out_of_time'
let pendingEcho = null; // { text, audio }
let index = 0;
let trust = 30;
let scores = [];
let busy = false;
let streak = 0;
let attempt = 0;

function setTrust(v) {
  trust = clampTrust(v);
  const fill = $('trust-fill');
  fill.style.width = `${trust}%`;
  fill.style.background = trust >= 65 ? 'var(--green)' : trust >= 35 ? 'var(--amber)' : 'var(--red)';
  stage.setWeather(trust / 100);
  setWarmth(trust / 100);
}

// ---- Scots word tray (free talk): words light up with a climbing chime the first time you say them
let collected = new Set();
function buildTray() {
  collected = new Set();
  const tray = $('scots');
  tray.innerHTML = '';
  for (const w of words.list) {
    const b = document.createElement('span');
    b.className = 'word';
    b.dataset.id = w.id;
    b.textContent = w.label;
    b.title = `${w.label} = ${w.means}`;
    tray.appendChild(b);
  }
  updateTrayCount();
}
function updateTrayCount() {
  $('scots').dataset.count = `${words.label} ${collected.size} / ${words.list.length}`;
}
// Light every newly said word; returns how many were new.
function collectWords(text) {
  const fresh = words.find(text).filter((id) => !collected.has(id));
  fresh.forEach((id, i) => {
    collected.add(id);
    const chip = $('scots').querySelector(`[data-id="${id}"]`);
    setTimeout(() => {
      chime(collected.size - fresh.length + i);
      chip?.classList.add('got');
      if (chip) popIn(chip);
      floatPop(`${words.list.find((w) => w.id === id).label}!`, 'word', 0);
    }, i * 180);
  });
  if (fresh.length) updateTrayCount();
  return fresh.length;
}

// ---- live captions while you talk in free talk (Chrome desktop). The real transcript still comes from
// the server; this is only so you see your words land as you say them. Skipped on touch devices, where
// the browser's recognizer can fight the recorder for the mic.
const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
const CAPTIONS_FROM_CHROME = false;
let captions = null;
function startCaptions() {
  // Off: Sadman wants ElevenLabs as the only ears, so Chrome's guesses never show or count.
  if (CAPTIONS_FROM_CHROME !== true || !Recognition || matchMedia('(pointer: coarse)').matches) return;
  try {
    const rec = new Recognition();
    rec.lang = 'en-GB';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const text = [...e.results].map((r) => r[0].transcript).join(' ').trim();
      if (!text || captions !== rec) return;
      $('heard').textContent = `You: “${text}”`;
      collectWords(text);
    };
    rec.onerror = () => {};
    rec.start();
    captions = rec;
  } catch {
    captions = null;
  }
}
function stopCaptions() {
  const rec = captions;
  captions = null;
  try {
    rec?.stop();
  } catch {
    /* already stopped */
  }
}

function showItem(i) {
  const item = testItems()[i];
  $('step').textContent = `${i + 1} / ${testItems().length}`;
  $('level').textContent = item.level[0].toUpperCase() + item.level.slice(1);
  $('line').textContent = item.line;
  $('meaning').textContent = `Means: ${item.meaning}`;
  $('heard').textContent = '';
  $('tip').textContent = '';
  $('melody').classList.remove('show');
  attempt = 0;
  live.show(item.audio);
  popIn($('prompt'));
}

// ---- free talk: say anything; the otter (Claude) answers in his ElevenLabs voice and decides how far
// he trusts you. Speech-to-text runs on the server (ElevenLabs Scribe), so any browser with a mic works.
const MAX_CHAT_TURNS = 8;
const MIN_ANSWER_BYTES = 2000; // shorter than this is a tap, not speech
const CHAT_OPENERS = ['Aye, how’s it gaun?', 'Ah’m jist oot fur ma messages.', 'Fancy a wee Irn-Bru?'];
const THINKING = [
  { text: 'Hmm... let me think aboot that.', audio: 'assets/audio/scotland/think-1.mp3' },
  { text: 'Mmm-hmm... is that right, aye?', audio: 'assets/audio/scotland/think-2.mp3' },
  { text: 'Oh aye? Go on...', audio: 'assets/audio/scotland/think-3.mp3' },
  { text: 'Hmmm. We’ll see aboot that.', audio: 'assets/audio/scotland/think-4.mp3' },
];
const OUTCOME_NOTE = {
  local: 'The Devin Otter says you’re a real Glaswegian!',
  busted: 'Busted! The otter spotted the tourist.',
  out_of_time: 'The otter has to get his messages.',
};

function showIntro() {
  $('bubble').classList.remove('show');
  stage.react('idle');
  show('intro');
  popIn($('intro').querySelector('.popup'));
}

function showChatPanel() {
  $('step').textContent = `Turn ${Math.min(chat.turn + 1, MAX_CHAT_TURNS)} / ${MAX_CHAT_TURNS}`;
  $('melody').classList.remove('show');
  $('scots').classList.add('show');
  if (pendingEcho) {
    // "Say it back": the phrase, its melody to sing along with, and Hear it again plays the phrase
    $('level').textContent = `${npc.short} wants ye tae say it back`;
    $('line').textContent = `“${pendingEcho.text}”`;
    $('meaning').textContent = 'Copy the words AND the tune. Your accent counts double here.';
    $('prompt').classList.add('echo');
    live.show(pendingEcho.audio);
    return;
  }
  $('prompt').classList.remove('echo');
  $('level').textContent = `Free talk · ${npc.name}`;
  $('line').textContent = npc.goal;
  $('meaning').textContent = chat.turn
    ? `Say anything. ${words.label} and a local-sounding voice win them over:`
    : npc.id === 'otter'
      ? `Say anything. Try: “${CHAT_OPENERS[0]}”`
      : 'Say anything. Sound like a local, or else:';
  live.hide();
}

// ---- Ask for the microphone as soon as a conversation starts (while the character is still talking),
// not on the first hold of Talk: otherwise the browser's permission popup eats the player's first answer.
// Once allowed, it just works; no page refresh needed.
let micReady = false;
async function primeMic() {
  if (micReady || !navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    micReady = true;
  } catch {
    $('heard').textContent = 'Allow the microphone (the mic or lock icon by the address bar), then hold Talk. No need to refresh.';
  }
}

// ---- the street: pick who to talk to
function showCast() {
  $('bubble').classList.remove('show');
  stage.focus(Object.values(cast)[0].id);
  stage.react('idle');
  const wrap = $('cast-cards');
  wrap.innerHTML = '';
  for (const c of Object.values(cast)) {
    const b = document.createElement('button');
    const done = outcomes[c.id];
    b.className = `cast-card ${done === 'local' ? 'won' : done ? 'lost' : ''}`;
    b.innerHTML = `${c.card ? `<img src="${c.card}" alt="" />` : '<i class="card-standin"></i>'}<b></b><small></small><span class="badge"></span>`;
    if (!c.card) b.querySelector('.card-standin').style.background = `radial-gradient(circle at 50% 40%, ${c.standIn.belly} 0 30%, ${c.standIn.fur} 31%)`;
    b.querySelector('b').textContent = c.name;
    b.querySelector('small').textContent = c.role;
    const quest = c.quest && region.quests[c.quest];
    b.querySelector('.badge').textContent = done === 'local' ? 'Won' : done ? 'Try again' : quest ? 'Quest' : 'Talk';
    b.addEventListener('click', () => {
      sfx('tap');
      if (quest) startQuestFor(c.quest);
      else startChat(c.id);
    });
    b.addEventListener('pointerenter', () => stage.focus(c.id));
    wrap.appendChild(b);
  }
  show('cast');
  popIn($('cast').querySelector('.popup'));
}

// Suggestions for the very first answer (the otter's opening line is pre-recorded, so the AI hasn't
// written any yet), and for anyone whose greeting didn't load.
const OPENING_SUGGESTIONS = {
  otter: [
    { say: "Aye, how's it gaun, pal?", means: "Yes, how's it going, mate?" },
    { say: "Ah'm fae Glesga, ya wee numpty!", means: "I'm from Glasgow, you silly thing!" },
  ],
  senga: [
    { say: "Awright hen, a fish supper please", means: "Hi love, fish and chips please" },
    { say: "Gie us a pizza crunch an' a bottle o' ginger", means: "A deep-fried pizza and a fizzy drink, please" },
  ],
  hamish: [
    { say: "Awright big man, is this the nine?", means: "Hi mate, is this the number 9 bus?" },
    { say: "Ah'm gaun tae the toon, how much?", means: "I'm going into the city centre, how much?" },
  ],
};

// ---- Free talk: "Try saying" cards, written fresh by the character each turn (say + what it means)
function showSuggestions(list) {
  const box = $('suggest');
  box.innerHTML = '';
  const items = (list || []).filter((s) => s?.say);
  if (!items.length || mode !== 'chat') {
    box.classList.remove('show');
    return;
  }
  const head = document.createElement('div');
  head.className = 'suggest-head';
  head.textContent = 'Try saying';
  box.appendChild(head);
  for (const s of items.slice(0, 2)) {
    const card = document.createElement('div');
    card.className = 'suggest-card';
    const say = document.createElement('b');
    say.textContent = `“${s.say}”`;
    const means = document.createElement('span');
    means.textContent = s.means;
    card.append(say, means);
    box.appendChild(card);
  }
  box.classList.add('show');
}

function readyToTalk(note) {
  if (note !== undefined) $('heard').textContent = note;
  busy = false;
  setTalk(true, 'Hold to talk');
}

async function startChat(id = npc.id) {
  mode = 'chat';
  primeMic();
  npc = cast[id] ?? Object.values(cast)[0];
  pendingEcho = null;
  $('again-line').hidden = false;
  $('speaker').textContent = npc.name;
  stage.focus(npc.id);
  chat = newChat();
  streak = 0;
  buildTray();
  setTrust(START_TRUST);
  show('test');
  busy = true;
  setTalk(false, 'Listen...');
  showChatPanel();
  $('heard').textContent = '';
  $('tip').textContent = '';
  popIn($('prompt'));
  stage.react('suspicious');
  await new Promise((res) => setTimeout(res, 700)); // a beat: they size you up before speaking
  if (npc.id === 'otter') {
    lastOtterLine = place.character.intro;
    showSuggestions(OPENING_SUGGESTIONS.otter);
  } else {
    // The authored greeting and its pre-generated mp3 (browser voice until it exists): no AI call before
    // the player's first answer.
    lastOtterLine = { text: npc.greeting, audio: npc.greetingAudio ?? null };
    chat = { ...chat, history: [{ who: 'otter', text: npc.greeting }] };
    showSuggestions(OPENING_SUGGESTIONS[npc.id] ?? npc.openers);
  }
  await otterSays(lastOtterLine, 'suspicious');
  readyToTalk();
}

// blob: the recorded answer, transcribed by ElevenLabs Scribe on the server.
// typed: text instead of a recording (the dev-only __say hook); null in real play.
async function chatTurn(blob, typed = null) {
  if (typed == null && (!blob || blob.size < MIN_ANSWER_BYTES)) return readyToTalk('Hold the button down while you talk.');
  $('heard').textContent = 'You: …';
  showSuggestions(null);
  setTalk(false, `${npc.short} is thinking...`);
  const echo = pendingEcho;
  // Their ears: your voice against their own last line (rough), and against the say-it-back phrase.
  const ears = typed != null ? Promise.resolve([null, null]) : Promise.all([
    measureAccent(blob, lastOtterLine?.audio),
    echo ? measureAccent(blob, echo.audio) : null,
  ]);
  // Send first, then fill the wait with a thinking line while the answer is on its way.
  const pending = Promise.all([typed != null ? null : blobToBase64(blob), ears])
    .then(([audio, [accent, echoAccent]]) =>
      askOtter(
        chat,
        typed != null
          ? { said: typed, npc: npc.id, echo: echo?.text ?? '' }
          : { audio, audioType: blob.type, npc: npc.id, accent, echoAccent, echo: echo?.text ?? '' },
      ),
    )
    .then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
  if (npc.id === 'otter') await otterSays(THINKING[Math.floor(Math.random() * THINKING.length)], 'suspicious');
  else {
    $('bubble-text').textContent = 'Hmm…';
    $('bubble').classList.add('show');
  }
  stage.react('suspicious');
  const { value: answer, error } = await pending;
  if (error) {
    console.warn('[chat] /api/otter failed:', error.message);
    // 429: this player is going too fast (or the day's AI turns are spent); a kind line, not an error
    if (error.status === 429) {
      await otterSays({ text: region.ui.comeBackLater }, 'ok');
      return readyToTalk('Too many turns for now. Come back in a minute.');
    }
    await otterSays({ text: region.ui.cantHear }, 'ok');
    return readyToTalk('');
  }
  const said = answer.heard || '';
  $('heard').textContent = said ? `You: “${said}”` : `${npc.short} didn’t catch that...`;
  const fresh = collectWords(said);
  if (fresh >= 2) floatPop(`Patter combo x${fresh}!`, 'streak', 400);
  chat = applyTurn(chat, said, answer);
  setTrust(answer.trust);
  const kind = answer.delta >= 8 ? 'good' : answer.delta >= 0 ? 'ok' : 'bad';
  sfx(kind);
  floatPop(`${answer.delta >= 0 ? '+' : ''}${answer.delta} trust`, kind === 'ok' ? '' : kind);
  streak = kind === 'good' ? streak + 1 : 0;
  if (streak >= 2) floatPop(`Streak x${streak}!`, 'streak', 250);
  // what their ears made of your accent
  if (answer.echoScore !== null && answer.echoScore !== undefined) {
    const pct = Math.round(answer.echoScore * 100);
    floatPop(`Said it back: ${pct}%`, pct >= 60 ? 'good' : 'bad', 600);
  } else if (answer.accentDelta) {
    floatPop(answer.accentDelta > 0 ? `Sounds local +${answer.accentDelta}` : `Ye don't sound local ${answer.accentDelta}`, answer.accentDelta > 0 ? 'good' : 'bad', 600);
  }
  pendingEcho = answer.echo ? { text: answer.echo, audio: answer.echoAudio ? `data:audio/mpeg;base64,${answer.echoAudio}` : null } : null;
  $('tip').textContent = answer.hint ? `Tip: ${answer.hint}` : '';
  showChatPanel();
  showSuggestions(answer.suggestions);
  lastOtterLine = lineFrom(answer);
  const speaking = otterSays(lastOtterLine, answer.mood);
  stage.act(answer.action);
  await speaking;
  if (answer.outcome !== 'continue') {
    await new Promise((res) => setTimeout(res, 600));
    await finishChat(answer.outcome);
    return;
  }
  readyToTalk();
}

async function finishChat(outcome) {
  const average = trust / 100;
  const p = placement([average], place.path);
  outcomes[npc.id] = outcome === 'local' || (outcome === 'out_of_time' && trust >= 65) ? 'local' : outcome;
  pendingEcho = null;
  $('prompt').classList.remove('echo');
  $('bubble').classList.remove('show');
  showResult(average, p.level);
  const wins = Object.values(cast).filter((c) => outcomes[c.id] === 'local').length;
  const note = outcome === 'local' ? npc.win : outcome === 'busted' ? npc.bust : OUTCOME_NOTE.out_of_time.replace('The otter', npc.short);
  const legend = wins === Object.keys(cast).length ? ' LOCAL LEGEND: the whole street trusts ye!' : ` Locals won over: ${wins} of ${Object.keys(cast).length}.`;
  $('result-note').textContent = `${note}${legend} ${words.label}: ${collected.size} of ${words.list.length}.`;
  $('again').textContent = 'Talk to someone else';
  stage.react(p.index >= 2 ? 'good' : 'ok');
  if (p.level.celebration) {
    setBed('off');
    await say(p.level.celebration);
    setBed('full');
  } else {
    sfx('level');
  }
}

async function startTest(lesson = null) {
  run = lesson;
  mode = 'test';
  showSuggestions(null);
  primeMic();
  $('again').textContent = 'Try again';
  $('scots').classList.remove('show');
  $('again-line').hidden = false;
  $('speaker').textContent = place.character.name;
  index = 0;
  scores = [];
  streak = 0;
  setTrust(30);
  show('test');
  busy = true;
  setTalk(false, 'Listen...');
  showItem(0);
  await otterSays(run ? run.intro : place.character.intro, run ? 'talk' : 'suspicious');
  await new Promise((r) => setTimeout(r, 250));
  await presentItem();
}

async function presentItem() {
  const item = testItems()[index];
  busy = true;
  setTalk(false, 'Listen...');
  await otterSays({ text: `Say: "${item.line}"`, audio: item.audio ? item.audio : null });
  busy = false;
  setTalk(true, 'Hold to talk');
}

async function replayLine() {
  if (busy || session) return;
  if (mode === 'chat') {
    const line = pendingEcho ?? lastOtterLine;
    if (!line) return;
    sfx('tap');
    busy = true;
    setTalk(false, 'Listen...');
    await otterSays(line, 'talk');
    return readyToTalk();
  }
  if (mode === 'quest') {
    if (!questLine) return;
    sfx('tap');
    busy = true;
    setTalk(false, 'Listen...');
    await otterSays(questLine, 'talk');
    return readyToTalk();
  }
  const item = testItems()[index];
  sfx('tap');
  busy = true;
  setTalk(false, 'Listen...');
  await otterSays(mode === 'flowers' ? { text: $('bubble-text').textContent } : { text: `"${item.line}"`, audio: item.audio ? item.audio : null });
  busy = false;
  setTalk(true, attempt ? 'Try again' : 'Hold to talk');
}

function setTalk(enabled, label) {
  const b = $('talk');
  b.disabled = !enabled;
  $('again-line').disabled = !enabled;
  $('talk-label').textContent = label;
}

// ---- free talk: sell Morag some flowers (src/content/flowers.json)
let talkState = null;

function showStep(stuck = false) {
  const node = flowers.nodes[talkState.node];
  $('step').textContent = 'Free talk';
  $('level').textContent = flowers.name;
  $('line').textContent = node.facts.join(' ');
  $('meaning').textContent = flowers.intro;
  $('tip').textContent = stuck ? `Tip: try "${node.hint}"` : '';
  $('melody').classList.remove('show');
  popIn($('prompt'));
}

async function startFlowers() {
  mode = 'flowers';
  primeMic();
  $('again').textContent = 'Try again';
  $('scots').classList.remove('show');
  talkState = { node: flowers.start, mood: flowers.mood, turns: 0 };
  $('speaker').textContent = flowers.character.name;
  live.hide();
  setTrust(talkState.mood);
  show('test');
  showStep();
  $('heard').textContent = '';
  busy = true;
  setTalk(false, 'Listen...');
  await otterSays({ text: flowers.nodes[flowers.start].say }, 'suspicious');
  busy = false;
  setTalk(true, 'Hold to talk');
}

async function talkTurn(r) {
  if (!r.transcript) {
    $('heard').textContent = r.error === 'not-allowed' ? 'Allow the microphone (the mic or lock icon by the address bar), then hold Talk again. No need to refresh.' : "Didn't catch that. Hold the button while you speak.";
    busy = false;
    setTalk(true, 'Try again');
    return;
  }
  const before = talkState.mood;
  const nodeBefore = talkState.node;
  const t = turn(flowers, talkState, r.transcript);
  talkState = t.state;
  $('heard').textContent = `Heard: "${r.transcript}"`;
  setTrust(t.state.mood);
  const b = t.state.mood > before ? 'good' : t.state.mood < before ? 'bad' : 'ok';
  sfx(b);
  if (t.aside) await otterSays({ text: t.aside }, b);
  await otterSays({ text: t.reply }, t.ending === 'buy' ? 'good' : t.ending === 'walk' ? 'bad' : 'talk');
  if (!t.ending) {
    showStep(t.state.node === nodeBefore);
    busy = false;
    setTalk(true, 'Hold to talk');
    return;
  }
  $('result-level').textContent = t.ending === 'buy' ? 'Bought your flowers!' : 'Walked off';
  $('result-score').textContent = String(t.state.mood);
  $('result-note').textContent = t.ending === 'buy' ? 'Morag took ye for a local.' : 'Try sounding more local: aye, hen, wee, quid.';
  $('bubble').classList.remove('show');
  show('result');
  stage.react(t.ending === 'buy' ? 'good' : 'ok');
  sfx(t.ending === 'buy' ? 'level' : 'bad');
}

// ---- quests: scripted beats on the quest engine (src/game/quest.js, src/content/<region>/quests/)
let quest = null;
let questState = null;
let questLine = null;
// ?wording=ai is the hook for model-worded quest lines later; tonight every line is scripted.
const questWording = new URLSearchParams(location.search).get('wording');

function renderBeats() {
  const ul = $('beats');
  ul.innerHTML = '';
  for (const b of checklist(quest, questState)) {
    const li = document.createElement('li');
    li.className = b.done ? 'done' : b.current ? 'current' : '';
    li.textContent = `${b.done ? '✔' : '◻'} ${b.label}`;
    ul.appendChild(li);
  }
}

function showQuestStep(stuck = false) {
  const beat = beatOf(quest, questState);
  $('step').textContent = 'Quest';
  $('level').textContent = quest.name;
  $('line').textContent = beat.facts.join(' ');
  $('meaning').textContent = quest.intro;
  $('tip').textContent = stuck ? `Tip: try "${beat.hint}"` : '';
  $('melody').classList.remove('show');
  renderBeats();
  popIn($('prompt'));
}

async function questSays(l, mood) {
  questLine = await wordLine(l, { quest: quest.id, beat: questState.beat }, { mode: wordingMode(quest, questWording) });
  await otterSays(questLine, mood);
}

async function startQuestFor(id) {
  mode = 'quest';
  quest = region.quests[id];
  npc = cast[quest.character.id] ?? npc;
  primeMic();
  showSuggestions(null);
  $('again').textContent = 'Try again';
  $('again-line').hidden = false;
  $('scots').classList.remove('show');
  const start = startQuest(quest);
  questState = start.state;
  $('speaker').textContent = quest.character.name;
  stage.focus(npc.id);
  live.hide();
  setTrust(questState.mood);
  show('test');
  showQuestStep();
  $('heard').textContent = '';
  busy = true;
  setTalk(false, 'Listen...');
  await questSays(start.line, 'suspicious');
  readyToTalk();
}

async function questTalkTurn(r) {
  if (!r.transcript) {
    $('heard').textContent = r.error === 'not-allowed' ? 'Allow the microphone (the mic or lock icon by the address bar), then hold Talk again. No need to refresh.' : "Didn't catch that. Hold the button while you speak.";
    busy = false;
    setTalk(true, 'Try again');
    return;
  }
  const before = questState.mood;
  const t = questTurn(quest, questState, r.transcript);
  questState = t.state;
  $('heard').textContent = `Heard: "${r.transcript}"`;
  setTrust(t.state.mood);
  const d = t.state.mood - before;
  const b = t.trap || d < 0 ? 'bad' : d > 0 ? 'good' : 'ok';
  sfx(b);
  floatPop(t.trap ? `Tourist trap! ${d}` : `${d >= 0 ? '+' : ''}${d} trust`, b === 'ok' ? '' : b);
  renderBeats();
  if (t.aside) await questSays(t.aside, b);
  await questSays(t.reply, t.ending === 'win' ? 'good' : t.ending === 'lose' ? 'bad' : 'talk');
  if (!t.ending) {
    showQuestStep(!t.moved);
    readyToTalk();
    return;
  }
  outcomes[npc.id] = t.ending === 'win' ? 'local' : 'busted';
  const wins = Object.values(cast).filter((c) => outcomes[c.id] === 'local').length;
  $('result-level').textContent = t.ending === 'win' ? 'Local!' : 'Tourist';
  $('result-score').textContent = String(t.state.mood);
  $('result-note').textContent = `${t.ending === 'win' ? npc.win : npc.bust} Locals won over: ${wins} of ${Object.keys(cast).length}.`;
  $('again').textContent = 'Talk to someone else';
  $('result-ribbon').textContent = 'Your accent';
  $('start-learning').textContent = 'Start learning';
  $('bubble').classList.remove('show');
  show('result');
  stage.react(t.ending === 'win' ? 'good' : 'ok');
  sfx(t.ending === 'win' ? 'level' : 'bad');
}

// ---- talking (hold Space or hold the button)
let session = null;
function beginTalk() {
  if (busy || session || $('talk').disabled) return;
  sfx('start');
  setBed('off');
  $('talk').classList.add('recording');
  $('talk-label').textContent = 'Listening...';
  $('heard').textContent = '';
  stage.react('idle');
  if (mode === 'chat') {
    const recording = startRecording();
    recording.catch(() => {}); // handled in endChatTalk
    session = { recording };
    startCaptions();
    // mic ring + the character leaning in; on a say-it-back phrase, also your tune over theirs + Match %
    live.start().then(() => !pendingEcho && $('match').classList.remove('show'));
    return;
  }
  live.start();
  if (mode === 'flowers' || mode === 'quest') live.hide(); // no reference clip here: keep the mic ring, drop "Match %"
  const item = testItems()[index];
  session = mode === 'flowers' || mode === 'quest' ? listen() : listen({ expected: item.accepted.concat(item.line), referenceUrl: item.audio });
}

async function endChatTalk(recording) {
  let blob = null;
  try {
    blob = await (await recording).stop();
  } catch (err) {
    setBed('full');
    const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
    console.warn('[chat] recording failed:', err?.name, err?.message);
    return readyToTalk(denied ? 'Allow the microphone (the mic or lock icon by the address bar), then hold Talk again. No need to refresh.' : 'Could not use the microphone. Check your mic settings.');
  }
  setBed('full');
  await chatTurn(blob);
}

async function endTalk() {
  if (!session) return;
  const s = session;
  session = null;
  $('talk').classList.remove('recording', 'voiced');
  live.stop();
  busy = true;
  setTalk(false, 'Hmm...');
  if (s.recording) {
    stopCaptions();
    return endChatTalk(s.recording);
  }
  s.stop();
  const r = await s.result;
  setBed('full');
  await (mode === 'flowers' ? talkTurn(r) : mode === 'quest' ? questTalkTurn(r) : judge(r));
}

async function judge(r) {
  const item = testItems()[index];
  if (r.error === 'not-allowed') {
    $('heard').textContent = 'Allow the microphone (the mic or lock icon by the address bar), then hold Talk again. No need to refresh.';
    busy = false;
    setTalk(true, 'Hold to talk');
    return;
  }
  if (!r.transcript) {
    $('heard').textContent = "Didn't catch that. Hold the button while you speak.";
    sfx('ok');
    busy = false;
    setTalk(true, 'Try again');
    return;
  }
  const score = r.score;
  const b = band(score);
  $('heard').textContent = `Heard: "${r.transcript}"  ·  ${Math.round(score * 100)}%`;
  if (b !== 'good') $('tip').textContent = `Tip: ${item.tip}`;
  sfx(b);
  const d = trustDelta(score);
  setTrust(trust + d);
  floatPop(`${d >= 0 ? '+' : ''}${d} trust`, b === 'bad' ? 'bad' : b === 'good' ? 'good' : '');
  streak = b === 'good' ? streak + 1 : 0;
  if (streak >= 2) floatPop(`Streak x${streak}!`, 'streak', 250);
  await otterSays(item.reactions[b], b);
  // a bad first go gets one more try: the otter waits for you to have another go
  if (b === 'bad' && attempt === 0) {
    attempt = 1;
    busy = false;
    setTalk(true, 'Try again');
    return;
  }
  scores.push(score);
  await new Promise((res) => setTimeout(res, 700));
  index += 1;
  if (index < testItems().length) {
    showItem(index);
    await presentItem();
  } else {
    await finish();
  }
}

async function finish() {
  if (run) return finishLesson();
  const p = placement(scores, place.path);
  await otterSays(place.character.outro, 'talk');
  $('bubble').classList.remove('show');
  showResult(p.average, p.level);
  stage.react(p.index >= 2 ? 'good' : 'ok');
  // The otter cheers over a victory sting sized to the level (lane 3); synth sting if it's missing.
  if (p.level.celebration) {
    setBed('off');
    await say(p.level.celebration);
    setBed('full');
  } else {
    sfx('level');
  }
}

// ---- lessons: open one from the roadmap, then stars and progress when it's done
function openLesson(id) {
  const pack = playableLessons();
  if (!isSupported()) {
    alert('This browser cannot record the microphone. Try Chrome, Safari or Edge.');
    return;
  }
  if (id === 'test') return startTest({ id, title: pack.test.title, items: unitTestItems(place), test: true, intro: { text: `${pack.test.title}! ${unitTestItems(place).length} lines. Say each one like a local.` } });
  const lesson = pack.lessons.find((l) => l.id === id);
  startTest({ id, title: lesson.title, items: lessonItems(pack, lesson), intro: { text: `${lesson.title}. ${lesson.goal}`, audio: lesson.introAudio ?? null } });
}

async function finishLesson() {
  const pack = playableLessons();
  const avg = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
  const stars = starsFor(avg);
  const nodes = roadmapNodes(pack);
  const at = nodes.findIndex((n) => n.id === run.id);
  const passed = run.test ? avg >= SKIP_AT : true;
  if (passed) saveProgress(region.id, Math.max(loadProgress(region.id), at + 1));
  const level = run.test ? placement(scores, place.path).level : null;
  $('bubble').classList.remove('show');
  $('result-ribbon').textContent = run.test ? pack.test.title : 'Lesson complete';
  $('result-level').textContent = run.test ? level.name : run.title;
  const next = nodes[at + 1];
  $('result-note').textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}  ${
    run.test ? (passed ? 'You passed! The whole unit is done.' : 'Not yet. Do a few lessons again and come back.') : next ? `Next up: ${next.label}.` : 'Unit done!'
  }`;
  $('start-learning').textContent = 'Back to lessons';
  $('result-score').textContent = '0';
  show('result');
  popIn($('result').querySelector('.popup'));
  countUp($('result-score'), Math.round(avg * 100));
  stage.react(stars >= 2 ? 'good' : 'ok');
  if (level?.celebration && passed) {
    setBed('off');
    await say(level.celebration);
    setBed('full');
  } else sfx('level');
}

// ---- wiring
$('play').addEventListener('click', () => {
  unlockAudio();
  startBed();
  sfx('tap');
  show('map');
});
// Map pins come from the region registry; picking one loads that region's intro, cast, words and scene.
function chooseRegion(id) {
  if (region.id !== id) placedAt = 0; // a placement skip belongs to the region it was earned in
  region = REGIONS[id];
  place = region.content;
  cast = region.cast;
  words = region.words;
  npc = Object.values(cast)[0];
  stage.setRegion?.(id);
  setVoiceLang(region.voiceLang ?? null);
  const ui = region.ui;
  $('intro-place').textContent = ui.place;
  $('intro-heading').textContent = ui.heading;
  $('intro-note').textContent = ui.note;
  $('intro-howto').innerHTML = ui.howto.map((li) => `<li>${li}</li>`).join('');
  $('intro-review').hidden = !region.review;
  $('intro-review').textContent = region.review ? `Preview: ${region.review}` : '';
  $('intro-flowers').hidden = !region.quests.flowers;
  $('intro-start').textContent = ui.talk;
  $('cast-street').textContent = ui.street;
  $('cast-heading').textContent = ui.castHeading;
  $('cast-note').textContent = ui.castNote;
  $('learn-lang').textContent = ui.language;
}
for (const r of regionList()) {
  const pin = document.createElement('button');
  pin.className = 'pin live';
  pin.dataset.place = r.id;
  pin.style.left = `${r.pin.left}%`;
  pin.style.top = `${r.pin.top}%`;
  pin.setAttribute('aria-label', r.review ? `${r.name} (preview, ${r.review})` : r.name);
  pin.innerHTML = '<span class="dot"></span><span class="label"></span>';
  pin.querySelector('.label').textContent = r.name;
  if (r.review) pin.insertAdjacentHTML('beforeend', '<span class="preview">Preview: pending native review</span>');
  pin.addEventListener('click', () => {
    sfx('tap');
    // Free talk only needs a mic recorder (speech-to-text runs on the server), so most browsers work.
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
      alert('This browser cannot use the microphone. Please open the game in Chrome, Edge, Safari or Firefox.');
      return;
    }
    chooseRegion(r.id);
    showIntro();
  });
  $('map-pins').appendChild(pin);
}
$('intro-start').addEventListener('click', () => {
  sfx('tap');
  showCast();
});
$('cast-back').addEventListener('click', () => {
  sfx('tap');
  showIntro();
});
$('intro-test').addEventListener('click', () => {
  sfx('tap');
  if (!isSupported()) {
    alert('This browser cannot record the microphone. Try Chrome, Safari or Edge.');
    return;
  }
  startTest(null);
});
$('result-test').addEventListener('click', () => $('intro-test').click());
$('again-line').addEventListener('click', replayLine);
$('intro-flowers').addEventListener('click', () => {
  sfx('tap');
  if (!isSupported()) {
    alert('This browser cannot record the microphone. Try Chrome, Safari or Edge.');
    return;
  }
  startFlowers();
});
$('again').addEventListener('click', () => {
  sfx('tap');
  if (mode === 'chat' || mode === 'quest') showCast();
  else if (mode === 'flowers') startFlowers();
  else startTest(run);
});
$('to-map').addEventListener('click', () => {
  sfx('tap');
  $('bubble').classList.remove('show');
  show('map');
});
// Title popups: Settings and Credits (Esc or the dark backdrop closes them)
function openModal(id) {
  sfx('tap');
  $(id).classList.add('open');
  $(id).querySelector('.close').focus();
}
function closeModals() {
  document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open'));
}
$('open-settings').addEventListener('click', () => openModal('settings'));
$('open-credits').addEventListener('click', () => openModal('credits'));
document.querySelectorAll('.modal').forEach((m) =>
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) {
      sfx('tap');
      closeModals();
    }
  }),
);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModals();
});
$('set-sound').addEventListener('change', (e) => {
  setMuted(!e.target.checked);
  $('mute').textContent = isMuted() ? 'Sound off' : 'Sound on';
  sfx('tap');
});
$('set-motion').addEventListener('change', (e) => {
  document.body.classList.toggle('reduce', e.target.checked);
  sfx('tap');
});

$('start-learning').addEventListener('click', () => {
  sfx('tap');
  show('learn');
  const pack = playableLessons();
  if (!pack) return lessons.open(placedAt, { skipped: placedAt > 0 });
  const done = loadProgress(region.id);
  const cur = Math.max(done, placedAt);
  lessons.open(cur, { skipped: placedAt > done, roadmap: roadmapFrom(pack) });
});
$('learn-back').addEventListener('click', () => {
  sfx('tap');
  show('map');
});
// Dev only, no mic needed: __say('do cutting bhaiya') answers whatever is on screen (placement, flowers,
// quest, free talk) as if speech-to-text heard it; `score` is the placement match (0-1). #say=<words> does the same.
if (import.meta.env.DEV) {
  window.__say = async (transcript, score = 0.8) => {
    if (busy || session || !$('test').classList.contains('active')) return 'not ready';
    busy = true;
    setTalk(false, 'Hmm...');
    const r = { transcript, score, error: null };
    await (
      mode === 'chat'
        ? chatTurn(null, transcript)
        : mode === 'quest'
          ? questTalkTurn(r)
          : mode === 'flowers'
            ? talkTurn(r)
            : judge(r)
    );
    return mode;
  };
  window.__quest = (id) => startQuestFor(id);
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#say=')) window.__say(decodeURIComponent(location.hash.slice(5)));
  });
}
// Demo shortcut without a mic: #good or #bad jumps straight to the result.
if (location.hash === '#good' || location.hash === '#bad') {
  const avg = location.hash === '#good' ? 0.82 : 0.31;
  showResult(avg, placement([avg], place.path).level);
}

$('mute').addEventListener('click', () => {
  setMuted(!isMuted());
  $('mute').textContent = isMuted() ? 'Sound off' : 'Sound on';
  $('set-sound').checked = !isMuted();
});

const talk = $('talk');
talk.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  talk.setPointerCapture(e.pointerId);
  beginTalk();
});
talk.addEventListener('pointerup', endTalk);
talk.addEventListener('pointercancel', endTalk);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat && $('test').classList.contains('active')) {
    e.preventDefault();
    beginTalk();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') endTalk();
});
