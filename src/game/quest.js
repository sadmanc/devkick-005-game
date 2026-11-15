// Quest engine: a scripted conversation made of ordered beats. Say anything; the character moves on
// when they hear what the beat needs, punishes traps, chats about topics, and warms up when you sound
// local. Pure functions over plain data (src/content/<region>/quests/*.json), so it's easy to test.
//
// quest = { id, name, character: { id, name }, intro, mood, leaveAt, winAt, wording?,
//           localWords: [], noLocal?, localMax?, miss?, topics: [{ words, reply, mood }],
//           traps: [{ words, unless?, reply, mood }], asides: { warm: [], cold: [], huh: [] },
//           beats: [{ id, label, say, facts, hint, traps?, intents: [{ words, next, mood, reply }] }],
//           endings: { win, lose } }
// Any line (say, reply, ending, aside) is a string or { text, audio, means }.

// Keeps digits: speech-to-text writes "ten rupees" as "10 rupees".
const clean = (s) => ` ${s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
const has = (said, w) => said.includes(` ${clean(w).trim()} `);
// an entry can list `unless` words ("nahi, 300 nahi, meter se" isn't agreeing to 300)
const hit = (list, said) => (list || []).find((x) => x.words.some((w) => has(said, w)) && !(x.unless || []).some((w) => has(said, w)));
const pick = (list, i) => list[i % list.length];
const clamp = (v) => Math.max(0, Math.min(100, v));

export const WORDING_MODES = ['scripted', 'ai'];

// Every line as { text, audio }, so callers can play a pre-generated clip or fall back to the browser voice.
export const line = (l) =>
  l == null ? null : typeof l === 'string' ? { text: l, audio: null, means: null } : { text: l.text, audio: l.audio ?? null, means: l.means ?? null };

export const beatIndex = (quest, id) => quest.beats.findIndex((b) => b.id === id);
export const beatOf = (quest, state) => quest.beats[beatIndex(quest, state.beat)];

export function localness(transcript, localWords, noLocal = -8, localMax = 16) {
  const said = clean(transcript);
  const n = localWords.filter((w) => has(said, w)).length;
  return n ? Math.min(localMax, 8 * n) : noLocal;
}

export function startQuest(quest) {
  const first = quest.beats[0];
  return { state: { beat: first.id, mood: quest.mood, turns: 0, done: [] }, line: line(first.say) };
}

// -> { state, aside, reply, ending: null | 'win' | 'lose', trap, moved }
export function questTurn(quest, state, transcript) {
  const i = beatIndex(quest, state.beat);
  const beat = quest.beats[i];
  const said = clean(transcript);
  const turns = state.turns + 1;
  const local = localness(transcript, quest.localWords, quest.noLocal, quest.localMax);
  const topic = hit(quest.topics, said);
  const out = (s, aside, reply, extra = {}) => ({ state: s, aside: line(aside), reply: line(reply), ending: null, trap: false, moved: false, ...extra });
  const lose = (s, aside) => out(s, aside, quest.endings.lose, { ending: 'lose' });

  // traps first: the beat's own, then the quest-wide ones (e.g. "chai tea latte", brochure English)
  const trap = hit(beat.traps, said) ?? hit(quest.traps, said);
  if (trap) {
    const mood = clamp(state.mood + trap.mood + Math.max(0, local));
    const s = { ...state, mood, turns };
    return mood <= quest.leaveAt ? lose(s, trap.reply) : out(s, null, trap.reply, { trap: true });
  }

  // players jump ahead (paying before chatting): also try the next beat
  const next = quest.beats[i + 1];
  let intent = hit(beat.intents, said);
  let skipped = [];
  if (!intent && next) {
    intent = hit(next.intents, said);
    if (intent) skipped = [next.id];
  }
  const mood = clamp(state.mood + local + (topic?.mood ?? 0) + (intent ? intent.mood : quest.miss ?? -6));
  const base = { ...state, mood, turns };
  const aside = topic?.reply ?? pick(local > 0 ? quest.asides.warm : quest.asides.cold, state.turns);
  if (mood <= quest.leaveAt) return lose(base, aside);
  if (!intent) {
    const quote = transcript.trim().split(/\s+/).slice(0, 6).join(' ');
    const huh = line(pick(quest.asides.huh, state.turns));
    return out(base, topic?.reply ?? null, { text: `"${quote}"? ${huh.text}`, audio: null, means: huh.means });
  }
  const done = [...state.done, beat.id, ...skipped];
  if (intent.next === 'end') {
    const ending = mood >= quest.winAt ? 'win' : 'lose';
    return out({ ...base, done }, aside, quest.endings[ending], { ending, moved: true });
  }
  const to = quest.beats[beatIndex(quest, intent.next)];
  return out({ ...base, beat: to.id, done }, aside, intent.reply ?? to.say, { moved: true });
}

// The beat tracker: [{ id, label, done, current }] in order ("✔ ordered ◻ paid").
export function checklist(quest, state) {
  return quest.beats.map((b) => ({ id: b.id, label: b.label, done: state.done.includes(b.id), current: b.id === state.beat && !state.done.includes(b.id) }));
}

// Hook for AI wording later: the engine decides what happens, a model may only re-word the line.
// Defaults to the scripted line (and its pre-generated audio); any AI failure falls back to it too.
export const wordingMode = (quest, override) => (WORDING_MODES.includes(override) ? override : WORDING_MODES.includes(quest.wording) ? quest.wording : 'scripted');

export async function wordLine(l, ctx, { mode = 'scripted', rephrase } = {}) {
  const scripted = line(l);
  if (mode !== 'ai' || !rephrase || !scripted) return scripted;
  try {
    const text = await rephrase(scripted.text, ctx);
    return text ? { text, audio: null, means: scripted.means } : scripted;
  } catch {
    return scripted;
  }
}
