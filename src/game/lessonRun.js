// A region's lessons.json lesson as say-it-back items for the test screen, stars for a score, and the
// furthest roadmap node done per region (kept in localStorage). Pure apart from the storage helpers.
const KEY = (id) => `soundlocal.lessons.${id}`;

const DEFAULT_REACTIONS = {
  good: { text: 'Nice! That sounded local.' },
  ok: { text: 'Close. Once more, a bit more relaxed.' },
  bad: { text: 'Hmm, not quite. Listen again and copy the tune.' },
};

export function lessonItems(pack, lesson) {
  const reactions = pack.reactions ?? DEFAULT_REACTIONS;
  return lesson.examples.map((e) => ({
    id: e.id,
    level: lesson.title,
    line: e.say,
    meaning: e.means,
    accepted: e.accepted ?? [],
    audio: e.audio ?? null,
    tip: e.tip ?? lesson.listenFor,
    reactions,
  }));
}

// the region's end-of-unit test ("Prove You're From the 6ix"): its own lines, else the placement test
export const unitTestItems = (place) => place.unitTest?.items ?? place.test;

export const starsFor = (avg) => (avg >= 0.8 ? 3 : avg >= 0.6 ? 2 : 1);

// Progress also lives in memory, so blocked or full storage still unlocks the next lesson this visit.
const memory = {};
const storageOf = (storage) => {
  try {
    return storage === undefined ? globalThis.localStorage : storage;
  } catch {
    return null; // reading localStorage itself throws when storage is blocked
  }
};

export function loadProgress(region, storage) {
  let saved = 0;
  try {
    saved = Number(storageOf(storage)?.getItem(KEY(region))) || 0;
  } catch {
    /* blocked storage: memory only */
  }
  return Math.max(saved, memory[region] ?? 0);
}

export function saveProgress(region, n, storage) {
  memory[region] = Math.max(n, memory[region] ?? 0);
  try {
    storageOf(storage)?.setItem(KEY(region), String(n));
  } catch {
    /* private mode or full: progress lasts this visit only */
  }
}
