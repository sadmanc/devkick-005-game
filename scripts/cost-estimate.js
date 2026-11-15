// Estimate one free-talk turn and one whole conversation, before and after the M3 cost cuts.
// No network calls. Run: node scripts/cost-estimate.js   (numbers feed docs/prd/cost-notes.md)
import { systemPromptFor, OTTER_TURN_SCHEMA } from '../server/otter-prompt.js';
import { transcript } from '../server/otter.js';
import { turnUsage } from '../server/cost.js';

const player = "Aye pal, ah'm fae Glasgow, ah go tae the chippy on Byres Road every Friday.";
const echo = "Ah'm gaun tae the toon";
// Before: 1-2 sentences allowed up to 220 characters. After: one short sentence plus a question (~110).
const REPLIES = {
  before: {
    plain: "Aye? Ye'd better no be windin' me up, pal, ah've had three tourists in here the day already. Go on then, whit's the best chippy roon here?",
    echo: `Ach, no bad at aw, ye're gettin' there, pal. Right, let's see if ye can really talk like us. Say it back tae me: ${echo}.`,
  },
  after: {
    plain: "Aye? Ye'd better no be windin' me up, pal. Go on then, whit's the best chippy roon here?",
    echo: `No bad, pal. Can ye say it back tae me: ${echo}?`,
  },
};
const greeting = "Right, whit're ye havin'? Hurry up, there's a queue!";
const ears = 'Their voice (pitch and rhythm vs a local voice): 62/100, sounds half local.';
const SHORT = 'Say "reply" the way a real person talks: natural and warm, with contractions. One short sentence plus a question, usually about 110 characters (never over 160).';
// What the model writes back: reply + mood/action + hint + two suggestions + echo, as JSON.
const answer = (reply, e = '') =>
  JSON.stringify({ reply, mood: 'ok', action: 'tilt_head', trust_delta: 4, sounded_local: true, hint: 'Try "how\'s it gaun" for hello.', echo: e, suggestions: [{ say: 'Aye, the wan oan Byres Road', means: 'Yes, the one on Byres Road' }, { say: 'Ah cannae mind the name', means: "I can't remember the name" }] });
const system = systemPromptFor('otter');
const schema = JSON.stringify(OTTER_TURN_SCHEMA);
const audioB64 = Math.round((4.5 * 4000 * 4) / 3); // a 4.5 s answer

// One conversation: (before) an AI opening, then 8 turns with a "say it back" every third turn.
function conversation(which) {
  const r = REPLIES[which];
  const calls = [];
  let history = [{ who: 'otter', text: greeting }];
  if (which === 'before') {
    calls.push(turnUsage({ system, schema, cachedSystem: true, user: transcript([], '', 30, 0, ''), output: answer(greeting), tts: [greeting] }));
  }
  for (let turn = 0; turn < 8; turn++) {
    const withEcho = turn % 3 === 2;
    const reply = withEcho ? r.echo : r.plain;
    const sent = which === 'before' ? history : history.slice(-8);
    const user = transcript(sent, player, 55, turn, ears) + (which === 'after' ? `\n\n${SHORT}` : '');
    calls.push(turnUsage({ system, schema, cachedSystem: true, user, output: answer(reply, withEcho ? echo : ''), tts: withEcho ? [reply, echo] : [reply], audioB64 }));
    history = [...history, { who: 'player', text: player }, { who: 'otter', text: reply }];
  }
  const sum = (k) => calls.reduce((n, c) => n + c[k], 0);
  return { anthropicCalls: calls.length, inputTokens: sum('inputTokens'), cachedInputTokens: sum('cachedInputTokens'), outputTokens: sum('outputTokens'), ttsChars: sum('ttsChars'), sttSeconds: Math.round(sum('sttSeconds') * 10) / 10 };
}

const before = conversation('before');
const after = conversation('after');
console.log('Per free-talk conversation (8 turns):');
console.table({ before, after });
console.log('Per turn (average):');
const per = (c) => Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'anthropicCalls').map(([k, v]) => [k, Math.round((v / 8) * 10) / 10]));
console.table({ before: per(before), after: per(after) });
