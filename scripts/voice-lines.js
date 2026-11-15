// Pure helpers for generate-voice.js: turn a place's content JSON (and its quests) into a list of TTS jobs.

// Every { text, audio } line in a place: intro, outro, each test line, each reaction, each result celebration.
export function collectLines(place) {
  const lines = [place.character?.intro, place.character?.outro, ...(place.path ?? []).map((l) => l.celebration)];
  for (const item of place.test ?? []) {
    lines.push({ text: item.line, audio: item.audio });
    lines.push(...Object.values(item.reactions ?? {}));
  }
  return lines.filter((l) => l?.text && l?.audio);
}

// Every authored quest line that has an audio file: beat openers, intent and trap replies, topics,
// warm/cold asides, endings. ("Huh?" lines quote the player, so they stay on the browser voice.)
export function collectQuestLines(quest) {
  const lines = [];
  for (const b of quest.beats ?? []) {
    lines.push(b.say, ...b.intents.map((i) => i.reply), ...(b.traps ?? []).map((t) => t.reply));
  }
  lines.push(...(quest.traps ?? []).map((t) => t.reply), ...(quest.topics ?? []).map((t) => t.reply));
  lines.push(...(quest.asides?.warm ?? []), ...(quest.asides?.cold ?? []), quest.endings?.win, quest.endings?.lose);
  return lines.filter((l) => l?.text && l?.audio);
}

// Which voice says a line: a character's own voice if the config has one, else the place's voice.
export function voiceFor(config, speaker) {
  return config.characters?.[speaker]?.voiceId ?? config.voiceId ?? null;
}

// Adds the voice direction tag (if any) in front of the text. Placement lines are said by
// config.placeSpeaker (if set), quest lines by the quest's character.
// Cast greetings with a greetingAudio path are said by that character.
export function buildJobs(place, config, quests = [], cast = {}) {
  const direction = config.direction ?? {};
  const job = (speaker) => ({ text, audio }) => {
    const tag = direction[audio.split('/').pop()];
    return { audio, prompt: tag ? `${tag} ${text}` : text, speaker, voiceId: voiceFor(config, speaker) };
  };
  return [
    ...collectLines(place).map(job(config.placeSpeaker ?? null)),
    ...quests.flatMap((q) => collectQuestLines(q).map(job(q.character?.id ?? null))),
    ...Object.values(cast)
      .filter((c) => c.greeting && c.greetingAudio)
      .map((c) => job(c.id)({ text: c.greeting, audio: c.greetingAudio })),
  ];
}

export const charsOf = (jobs) => jobs.reduce((n, j) => n + j.prompt.length, 0);
