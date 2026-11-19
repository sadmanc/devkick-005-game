// Client side of the free-talk mode: sends what the player said to /api/otter and keeps the state.
// Pure state helpers are exported for tests; talk() does the network call.
import { apiUrl } from '../apiBase.js';

export const START_TRUST = 30;

export function newChat() {
  return { trust: START_TRUST, turn: 0, history: [], outcome: 'continue' };
}

// Returns a new chat state after one exchange (never mutates the old one).
export function applyTurn(chat, said, answer) {
  return {
    trust: answer.trust,
    turn: answer.turn,
    outcome: answer.outcome,
    history: [...chat.history, { who: 'player', text: said || '(nothing)' }, { who: 'otter', text: answer.reply }].slice(-20),
  };
}

// Plays base64 mp3 audio from the API as a line the audio module can say().
export function lineFrom(answer) {
  return { text: answer.reply, audio: answer.audio ? `data:audio/mpeg;base64,${answer.audio}` : null };
}

// answer: { said } (text from the browser) or { audio, audioType } (base64 recording, transcribed on the server)
export async function talk(chat, answer, { timeoutMs = 25000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(apiUrl('api/otter'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...answer, trust: chat.trust, turn: chat.turn, history: chat.history }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status, retryAfter: data.retryAfter });
    return data;
  } finally {
    clearTimeout(timer);
  }
}
