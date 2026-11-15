#!/usr/bin/env node
// Generates every voice line of a place with the ElevenLabs API in one run.
//   ELEVENLABS_API_KEY in .env (never in src/), then:
//   node scripts/generate-voice.js scotland          # only missing files
//   node scripts/generate-voice.js scotland --force  # regenerate everything
//   node scripts/generate-voice.js scotland --dry    # print the jobs, no API calls
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildJobs } from './voice-lines.js';

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
  const place = JSON.parse(readFileSync(resolve(root, `src/content/${placeId}.json`), 'utf8'));
  const config = JSON.parse(readFileSync(resolve(root, 'scripts/voice-config.json'), 'utf8'))[placeId];
  const castFile = resolve(root, 'src/content/cast.json');
  const cast = placeId === 'scotland' && existsSync(castFile) ? JSON.parse(readFileSync(castFile, 'utf8')) : {};
  if (!config?.voiceId) throw new Error(`No voiceId for "${placeId}" in scripts/voice-config.json`);

  const jobs = buildJobs(place, config, cast).filter((j) => force || !existsSync(resolve(root, 'public', j.audio)));
  if (dry) return jobs.forEach((j) => console.log(`${j.audio}  <-  ${j.prompt}`));

  loadEnv();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('Set ELEVENLABS_API_KEY in .env');

  let failed = 0;
  for (const job of jobs) {
    try {
      const out = resolve(root, 'public', job.audio);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, await tts(job, config, key));
      console.log(`ok   ${job.audio}`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL ${job.audio}: ${err.message}`);
    }
  }
  console.log(`${jobs.length - failed}/${jobs.length} lines generated`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
