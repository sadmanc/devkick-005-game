// Toronto words the player can collect in free talk (preview, pending native review). Each pattern also
// accepts the ways speech-to-text tends to spell them. Pure, so it runs in tests.
export const TORONTO_WORDS = [
  { id: 'eh', label: 'eh', means: 'right? (a friendly tag at the end)', re: /\b(eh|ay)\b/ },
  { id: 'sorry', label: 'sorry', means: 'sorry (said "sore-y", and often)', re: /\b(sorry|sore ?y|soary)\b/ },
  { id: 'toque', label: 'toque', means: 'a knitted winter hat', re: /\b(toque|tuque|took|tuk)\b/ },
  { id: 'doubledouble', label: 'double-double', means: 'coffee, two cream, two sugar', re: /\bdouble[ -]?double\b/ },
  { id: 'washroom', label: 'washroom', means: 'bathroom, toilet', re: /\bwash ?rooms?\b/ },
  { id: 'trawna', label: 'Trawna', means: 'Toronto, the local way', re: /\b(trawna|tronna|trono|tranna|toronna|trana|traw na|tronto)\b/ },
  { id: 'sixix', label: 'the 6ix', means: 'Toronto (a nickname)', re: /\b(6ix|the six|the 6|da six)\b/ },
  { id: 'ttc', label: 'the TTC', means: 'the city buses, streetcars and subway', re: /\b(ttc|t t c|t\.t\.c\.?)\b/ },
  { id: 'mans', label: 'mans', means: 'I, me (or "that guy")', re: /\b(mans|man's)\b/ },
  { id: 'ahlie', label: 'ahlie', means: 'right? for real?', re: /\b(ahlie|ahli|ah lie|a lie|allie|ally|ali)\b/ },
  { id: 'styll', label: 'styll', means: 'for real, though (at the end)', re: /\b(styll|still)\b\s*[?!.]?\s*$/ },
  { id: 'bare', label: 'bare', means: 'a lot of, very', re: /\b(bare|bear)\b/ },
  { id: 'fam', label: 'fam', means: 'friend', re: /\bfam\b/ },
  { id: 'sayless', label: 'say less', means: 'got it, no need to explain', re: /\bsay less\b/ },
  { id: 'wagwan', label: 'wagwan', means: "what's going on? hi", re: /\b(wagwan|wag wan|wah gwaan|what gwan|wa gwan|whagwan)\b/ },
];

const norm = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'?!. -]+/g, ' ')
    .trim();

// ids of every Toronto word in this text
export function findToronto(text) {
  const t = norm(text);
  return TORONTO_WORDS.filter((w) => w.re.test(t)).map((w) => w.id);
}
