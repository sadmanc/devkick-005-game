// Pure helpers for generate-voice.js: turn a place's content JSON into a list of TTS jobs.

// Every { text, audio } line in a place: intro, outro, each test line, each reaction.
export function collectLines(place) {
  const lines = [place.character?.intro, place.character?.outro];
  for (const item of place.test ?? []) {
    lines.push({ text: item.line, audio: item.audio });
    lines.push(...Object.values(item.reactions ?? {}));
  }
  return lines.filter((l) => l?.text && l?.audio);
}

// Adds the voice direction tag (if any) in front of the text. Cast greetings with a greetingAudio path
// are said in that character's own voice (config.characters.<id>.voiceId), so hello needs no AI call.
export function buildJobs(place, config, cast = {}) {
  const direction = config.direction ?? {};
  const job = (speaker) => ({ text, audio }) => {
    const tag = direction[audio.split('/').pop()];
    const voiceId = config.characters?.[speaker]?.voiceId ?? config.voiceId;
    return { audio, prompt: tag ? `${tag} ${text}` : text, voiceId };
  };
  return [
    ...collectLines(place).map(job(null)),
    ...Object.values(cast)
      .filter((c) => c.greeting && c.greetingAudio)
      .map((c) => job(c.id)({ text: c.greeting, audio: c.greetingAudio })),
  ];
}
