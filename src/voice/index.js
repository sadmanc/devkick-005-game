// Voice contract (see README.md). Words from ElevenLabs speech-to-text (/api/stt), accent from the mic vs. the otter's clip.
import { wordScore } from './match.js';
import { accent } from './pitch.js';
import { apiUrl } from '../apiBase.js';

const SR = 16000; // decode straight to 16 kHz: plenty for voice pitch, keeps YIN fast

export function isSupported() {
  return Boolean(globalThis.MediaRecorder && navigator.mediaDevices?.getUserMedia);
}

let decoder;
async function decode(buf) {
  decoder ??= new OfflineAudioContext(1, 1, SR);
  return (await decoder.decodeAudioData(buf)).getChannelData(0);
}

// shortcut: on some Android Chrome builds the mic can't be shared with recognition; accent is then null.
async function record() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  return () =>
    new Promise((res) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        res(new Blob(chunks, { type: rec.mimeType }));
      };
      rec.stop();
    });
}

// Backup ears: send the recording to ElevenLabs (via /api/stt) when Chrome's recognition missed or
// misheard the line. Short Scots words like "aye" are often dropped by Chrome.
async function serverTranscript(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(apiUrl('api/stt'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ audio: btoa(bin), audioType: blob.type }),
      signal: ctrl.signal,
    });
    if (!res.ok) return '';
    return String((await res.json()).text || '');
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

export function listen({ expected = [], referenceUrl = null } = {}) {
  // ElevenLabs is the only ears: record the mic, then transcribe the clip on the server (/api/stt).
  // Chrome's built-in recognition is not used at all (it drops Scots words like "aye").
  let stop = () => {};
  const result = new Promise((resolve) => {
    let done = false;
    const mic = record();
    const ref = referenceUrl
      ? fetch(referenceUrl)
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .then((b) => b && decode(b))
          .catch(() => null)
      : null;
    let blobP = null;
    const recording = () => (blobP ??= mic.then((stopMic) => stopMic?.()).catch(() => null));
    const measure = async (blob) => {
      try {
        const refAudio = await ref;
        return blob?.size && refAudio ? accent(await decode(await blob.arrayBuffer()), refAudio, SR) : null;
      } catch {
        return null;
      }
    };
    const finish = async (error) => {
      if (done) return;
      done = true;
      const blob = await recording();
      if (!blob || blob.size < 1500) {
        resolve({ transcript: '', wordScore: 0, accentScore: null, score: 0, pitch: null, error: error || 'no-audio' });
        return;
      }
      const [heard, m] = await Promise.all([
        serverTranscript(blob),
        Promise.race([measure(blob), new Promise((res) => setTimeout(res, 2500, null))]),
      ]);
      const transcript = heard.replace(/[.,!?]+$/g, '').trim();
      const ws = wordScore(transcript, expected);
      const accentScore = m?.accentScore ?? null;
      const score = accentScore === null ? ws : 0.5 * ws + 0.5 * accentScore;
      resolve({ transcript, wordScore: ws, accentScore, score, pitch: m?.pitch ?? null, error });
    };
    mic.catch((err) => {
      done = true;
      resolve({
        transcript: '',
        wordScore: 0,
        accentScore: null,
        score: 0,
        pitch: null,
        error: err?.name === 'NotAllowedError' ? 'not-allowed' : 'no-mic',
      });
    });
    stop = () => {
      setTimeout(() => finish(), 300); // keep recording a moment after release so the last word lands
    };
  });
  return { result, stop: () => stop() };
}
