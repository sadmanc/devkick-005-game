// How local does the player's recorded answer sound? Compares its pitch and rhythm with a clip of the
// character's own Glaswegian voice, using lane 2's accent() (src/voice/pitch.js). 0..1, or null when it
// can't tell (no clip, too little voice, decode failure). A rough ear, not a judge: the server only lets it
// nudge trust a little, except on "say it back" phrases where both clips say the same words.
import { accent } from '../voice/pitch.js';

const SR = 16000;
let decoder;
async function decode(buf) {
  decoder ??= new OfflineAudioContext(1, 1, SR);
  return (await decoder.decodeAudioData(buf)).getChannelData(0);
}

const refCache = new Map();
function refSamples(url) {
  if (!refCache.has(url)) {
    refCache.set(
      url,
      fetch(url)
        .then((r) => (r.ok || r.status === 0 ? r.arrayBuffer() : null)) // 0: bundled mp3 in the iOS app
        .then((b) => b && decode(b))
        .catch(() => null),
    );
    if (refCache.size > 12) refCache.delete(refCache.keys().next().value);
  }
  return refCache.get(url);
}

export async function measureAccent(blob, refUrl, { timeoutMs = 2500 } = {}) {
  if (!blob?.size || !refUrl) return null;
  const work = (async () => {
    try {
      const [you, ref] = await Promise.all([blob.arrayBuffer().then(decode), refSamples(refUrl)]);
      if (!ref) return null;
      const m = accent(you, ref, SR);
      return m ? Math.max(0, Math.min(1, m.accentScore)) : null;
    } catch {
      return null;
    }
  })();
  return Promise.race([work, new Promise((res) => setTimeout(res, timeoutMs, null))]);
}
