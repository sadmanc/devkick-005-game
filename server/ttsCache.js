// Small LRU of voiced lines, keyed by voice + exact text. Echo phrases, greetings and fallbacks repeat a
// lot across players, so a warm instance answers those without paying ElevenLabs again.
// shortcut: in-memory, per instance; move to a shared store (KV/Redis) before real traffic
export function createLru(max = 100) {
  const map = new Map();
  return {
    get(key) {
      if (!map.has(key)) return undefined;
      const v = map.get(key);
      map.delete(key);
      map.set(key, v);
      return v;
    },
    set(key, value) {
      map.delete(key);
      map.set(key, value);
      if (map.size > max) map.delete(map.keys().next().value);
    },
    get size() {
      return map.size;
    },
  };
}

export const ttsKey = (voiceId, text) => `${voiceId}\u0000${text}`;

// Wrap a voice(text, key, voiceId) function so identical lines are only voiced once per instance.
export function cachedVoice(voice, cache = createLru()) {
  const stats = { hits: 0, misses: 0 };
  async function speak(text, key, voiceId) {
    const k = ttsKey(voiceId, text);
    const hit = cache.get(k);
    if (hit !== undefined) {
      stats.hits++;
      return hit;
    }
    stats.misses++;
    const audio = await voice(text, key, voiceId);
    cache.set(k, audio);
    return audio;
  }
  speak.stats = stats;
  return speak;
}
