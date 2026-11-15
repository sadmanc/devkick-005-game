#!/usr/bin/env node
// Generates every voice line of a place with the ElevenLabs API in one run.
//   ELEVENLABS_API_KEY in .env (never in src/), then:
//   node scripts/generate-voice.js scotland          # only missing files
//   node scripts/generate-voice.js scotland --force  # regenerate everything
//   node scripts/generate-voice.js scotland --dry    # print the jobs, no API calls
//   node scripts/generate-voice.js mumbai --dry      # placement + quest lines, one voice per character
// Lines are generated per character voice (scripts/voice-config.json, design them first with
// scripts/design-voices.js). Every file written is logged in assets/manifest.json with its exact prompt.
// --max-chars=N stops before spending more than N TTS characters (default 10000, the brief's budget).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildJobs, charsOf } from './voice-lines.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.elevenlabs.io/v1/text-to-speech';

function loadEnv() {
  const file = resolve(root, '.env');
  if (!existsSync(file)) return;
  for (const row of readFileSync(file, 'utf8').split('\n')) {
    const m = row.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// src/content/<place>.json (Glasgow) or src/content/<place>/<place>.json, plus src/content/<place>/quests/*.json
// and the cast's greetings (src/content/<place>/cast.json, or src/content/cast.json for Glasgow)
export function loadPlace(placeId) {
  const flat = resolve(root, `src/content/${placeId}.json`);
  const place = JSON.parse(readFileSync(existsSync(flat) ? flat : resolve(root, `src/content/${placeId}/${placeId}.json`), 'utf8'));
  const dir = resolve(root, `src/content/${placeId}/quests`);
  const quests = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(resolve(dir, f), 'utf8')))
    : [];
  const nested = resolve(root, `src/content/${placeId}/cast.json`);
  const castFile = existsSync(flat) ? resolve(root, 'src/content/cast.json') : nested;
  const cast = existsSync(castFile) ? JSON.parse(readFileSync(castFile, 'utf8')) : {};
  return { place, quests, cast };
}

function logToManifest(done, config) {
  const file = resolve(root, 'assets/manifest.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  for (const j of done) {
    const v = config.characters?.[j.speaker];
    const entry = {
      id: j.audio.replace(/^assets\/audio\//, '').replace(/\.mp3$/, '').replaceAll('/', '-'),
      file: `public/${j.audio}`,
      tool: `ElevenLabs TTS (${config.modelId})`,
      prompt: j.prompt,
      voice: v?.design
        ? `${v.voiceName} (${j.voiceId}), made with ElevenLabs Voice Design (${v.design.model_id}): ${v.design.voice_description}`
        : `${v?.voiceName ?? config.voiceName ?? ''} (${j.voiceId})`,
      made_by: 'Devin (cloud)',
      date: today,
    };
    manifest.audio = manifest.audio.filter((a) => a.file !== entry.file).concat(entry);
  }
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function tts({ prompt, voiceId }, { modelId }, key) {
  const res = await fetch(`${API}/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: prompt, model_id: modelId }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const [placeId = 'scotland', ...flags] = process.argv.slice(2);
  const force = flags.includes('--force');
  const dry = flags.includes('--dry');
  const maxChars = Number(flags.find((f) => f.startsWith('--max-chars='))?.split('=')[1] ?? 10000);
  const { place, quests, cast } = loadPlace(placeId);
  const config = JSON.parse(readFileSync(resolve(root, 'scripts/voice-config.json'), 'utf8'))[placeId];
  if (!config) throw new Error(`No "${placeId}" in scripts/voice-config.json`);

  const jobs = buildJobs(place, config, quests, cast).filter((j) => force || !existsSync(resolve(root, 'public', j.audio)));
  if (dry) {
    jobs.forEach((j) => console.log(`${j.audio}  [${j.speaker ?? placeId}${j.voiceId ? '' : ', NO VOICE YET'}]  <-  ${j.prompt}`));
    return console.log(`${jobs.length} lines, ${charsOf(jobs)} TTS characters (budget ${maxChars})`);
  }
  const noVoice = [...new Set(jobs.filter((j) => !j.voiceId).map((j) => j.speaker ?? placeId))];
  if (noVoice.length) throw new Error(`No voiceId yet for: ${noVoice.join(', ')}. Run node scripts/design-voices.js ${placeId} first.`);
  if (charsOf(jobs) > maxChars) throw new Error(`${charsOf(jobs)} characters is over the ${maxChars} budget (raise --max-chars= if a human agrees)`);

  loadEnv();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('Set ELEVENLABS_API_KEY in .env');

  let failed = 0;
  const done = [];
  for (const job of jobs) {
    try {
      const out = resolve(root, 'public', job.audio);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, await tts(job, config, key));
      done.push(job);
      console.log(`ok   ${job.audio}`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL ${job.audio}: ${err.message}`);
    }
  }
  if (done.length) logToManifest(done, config);
  console.log(`${jobs.length - failed}/${jobs.length} lines generated, ${charsOf(done)} characters`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
