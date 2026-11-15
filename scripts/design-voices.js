#!/usr/bin/env node
// Designs one ElevenLabs voice per character from the prompts in scripts/voice-config.json
// (<place>.characters.<id>.design), in two steps so a human picks the voice:
//   node scripts/design-voices.js mumbai --dry            # print the prompts, no API calls
//   node scripts/design-voices.js mumbai                  # previews -> art/voice-previews/<id>-<n>.mp3
//   node scripts/design-voices.js mumbai --pick kaju=<generated_voice_id> [mor=<id> ...]
//                                                         # save the chosen previews as voices, write their
//                                                         # voiceId into voice-config.json, log them in the manifest
// Budget: one design call per character without a voiceId (the brief allows 3). Never imitate a real person.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.elevenlabs.io/v1/text-to-voice';
const configFile = resolve(root, 'scripts/voice-config.json');

function loadEnv() {
  const file = resolve(root, '.env');
  if (!existsSync(file)) return;
  for (const row of readFileSync(file, 'utf8').split('\n')) {
    const m = row.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

async function post(url, body, key) {
  const res = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function main() {
  const [placeId = 'mumbai', ...flags] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(configFile, 'utf8'));
  const config = all[placeId];
  if (!config?.characters) throw new Error(`No characters for "${placeId}" in scripts/voice-config.json`);
  const todo = Object.entries(config.characters).filter(([, c]) => !c.voiceId);
  const pickAt = flags.indexOf('--pick');
  const picks = pickAt >= 0 ? Object.fromEntries(flags.slice(pickAt + 1).map((p) => p.split('='))) : null;

  if (flags.includes('--dry')) {
    for (const [id, c] of todo) console.log(`${id}: ${c.voiceName} [${c.design.model_id}]\n  ${c.design.voice_description}`);
    return console.log(`${todo.length} voice design call(s) needed`);
  }
  loadEnv();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('Set ELEVENLABS_API_KEY in .env');

  if (picks) {
    const manifest = JSON.parse(readFileSync(resolve(root, 'assets/manifest.json'), 'utf8'));
    for (const [id, generated] of Object.entries(picks)) {
      const c = config.characters[id];
      if (!c) throw new Error(`Unknown character "${id}"`);
      const saved = await post(API, { voice_name: c.voiceName, voice_description: c.design.voice_description, generated_voice_id: generated }, key);
      c.voiceId = saved.voice_id;
      manifest.voices = (manifest.voices ?? []).concat({ id: `${placeId}-${id}-voice`, voice_id: saved.voice_id, name: c.voiceName, tool: `ElevenLabs Voice Design (${c.design.model_id})`, prompt: c.design.voice_description, made_by: 'Devin (cloud)', date: new Date().toISOString().slice(0, 10) });
      console.log(`saved ${id}: ${c.voiceName}`);
    }
    writeFileSync(configFile, `${JSON.stringify(all, null, 2)}\n`);
    writeFileSync(resolve(root, 'assets/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }

  const out = resolve(root, 'art/voice-previews');
  mkdirSync(out, { recursive: true });
  for (const [id, c] of todo) {
    const { previews } = await post(`${API}/design?output_format=mp3_44100_128`, { voice_description: c.design.voice_description, model_id: c.design.model_id, auto_generate_text: true }, key);
    previews.forEach((p, n) => {
      writeFileSync(resolve(out, `${id}-${n + 1}.mp3`), Buffer.from(p.audio_base_64, 'base64'));
      console.log(`${id}-${n + 1}.mp3  generated_voice_id=${p.generated_voice_id}`);
    });
  }
  console.log(`Listen in art/voice-previews/, then: node scripts/design-voices.js ${placeId} --pick <id>=<generated_voice_id> ...`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
