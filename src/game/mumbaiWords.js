// Mumbai words the player can collect in free talk (preview, pending native review). Each pattern also
// accepts the ways speech-to-text tends to spell them. Pure, so it runs in tests.
export const MUMBAI_WORDS = [
  { id: 'haan', label: 'haan', means: 'yes', re: /\b(haan|han|haa|haanji)\b/ },
  { id: 'nahi', label: 'nahi', means: 'no', re: /\b(nahi|nahin|nai|nahee)\b/ },
  { id: 'yaar', label: 'yaar', means: 'mate, friend', re: /\b(yaar|yar)\b/ },
  { id: 'arre', label: 'arre', means: 'oh! hey!', re: /\b(arre|arrey|arey|are re)\b/ },
  { id: 'achha', label: 'achha', means: 'okay, I see', re: /\b(achha|acha|accha|achcha|acchha)\b/ },
  { id: 'chalo', label: 'chalo', means: "let's go, okay then", re: /\b(chalo|challo|chalo ji)\b/ },
  { id: 'bhaiya', label: 'bhaiya', means: 'brother (polite, to a stallholder or driver)', re: /\b(bhaiya|bhaiyya|bhaia|bhai ya)\b/ },
  { id: 'bas', label: 'bas', means: "enough, that's it", re: /\b(bas|buss|bus bus)\b/ },
  { id: 'jugaad', label: 'jugaad', means: 'a clever fix', re: /\b(jugaad|jugad|jugard)\b/ },
  { id: 'timepass', label: 'timepass', means: 'just passing time, for fun', re: /\btime ?pass\b/ },
  { id: 'cutting', label: 'cutting', means: 'a half glass of chai', re: /\bcutting\b/ },
  { id: 'scene', label: 'scene', means: "what's the plan? what's up?", re: /\b(scene|seen kya|kya scene)\b/ },
];

const norm = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9' -]+/g, ' ');

// ids of every Mumbai word in this text
export function findMumbai(text) {
  const t = norm(text);
  return MUMBAI_WORDS.filter((w) => w.re.test(t)).map((w) => w.id);
}
