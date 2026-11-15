// Region registry: everything the game needs to load a place. Glasgow wraps the original files untouched
// (scotland.json, cast.json, scotsWords.js); a new region is one more entry here plus its content folder.
import scotland from '../scotland.json';
import glasgowCast from '../cast.json';
import flowers from '../flowers.json';
import { SCOTS_WORDS, findScots } from '../../game/scotsWords.js';
import mumbai from '../mumbai/mumbai.json';
import mumbaiCast from '../mumbai/cast.json';
import cutting from '../mumbai/quests/cutting.json';
import meter from '../mumbai/quests/meter.json';
import mumbaiLessons from '../mumbai/lessons.json';
import { MUMBAI_WORDS, findMumbai } from '../../game/mumbaiWords.js';
import toronto from '../toronto/toronto.json';
import torontoCast from '../toronto/cast.json';
import torontoLessons from '../toronto/lessons.json';
import doubledouble from '../toronto/quests/doubledouble.json';
import streetcar from '../toronto/quests/streetcar.json';
import court from '../toronto/quests/court.json';
import { TORONTO_WORDS, findToronto } from '../../game/torontoWords.js';

export const PENDING_REVIEW = 'pending native review';

export const REGIONS = {
  scotland: {
    id: 'scotland',
    name: 'Scotland',
    pin: { left: 42.6, top: 34.9 },
    content: scotland,
    cast: glasgowCast,
    words: { list: SCOTS_WORDS, find: findScots, label: 'Scots words' },
    quests: { flowers },
    scene: 'glasgow',
    review: null,
    // what the intro, cast and lessons screens say (Glasgow's is the original text from index.html)
    ui: {
      place: 'Glasgow, Scotland',
      heading: 'You just moved here.',
      note: "Glaswegians can spot a tourist a mile off. Talk to the Devin Otter and convince him you're a real local.",
      howto: [
        '<b>Hold the button</b> (or Space) and talk. Say anything you like.',
        "<b>Win his trust:</b> reach 100 and you're a local. Hit 0 and you're busted.",
        '<b>Sound Glaswegian:</b> Scots words, local knowledge and the accent all count.',
      ],
      talk: 'Talk to the otter',
      street: 'Buchanan Street',
      castHeading: "Who are ye talkin' tae?",
      castNote: "Win all three and you're a local legend. Sound like a tourist and they'll get suspicious.",
      language: 'Scots',
      cantHear: 'Sorry pal, couldnae hear ye ower the rain. Say that again?',
      comeBackLater: "Haud on, pal, ye've worn me oot! Gie it a wee minute and come back later.",
    },
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    pin: { left: 66.4, top: 55.5 },
    content: mumbai,
    cast: mumbaiCast,
    words: { list: MUMBAI_WORDS, find: findMumbai, label: 'Mumbai words' },
    quests: { cutting, meter },
    lessons: mumbaiLessons,
    scene: 'mumbai',
    review: PENDING_REVIEW,
    ui: {
      place: 'Mumbai, India',
      heading: 'You just moved here.',
      note: 'Mumbaikars can spot a tourist from the other end of the platform. Win over the locals and prove you belong.',
      howto: [
        '<b>Hold the button</b> (or Space) and talk.',
        "<b>Order chai, catch an auto, charm an aunty:</b> each local has their own scene.",
        '<b>Sound like a Mumbaikar:</b> easy Hinglish, local know-how and an even rhythm all count.',
      ],
      talk: 'Meet the locals',
      street: 'Station Road',
      castHeading: 'Who will you talk to?',
      castNote: 'Kaju and Mangesh have a job for you. Mor Aunty just wants to chat (and feed you).',
      language: 'Mumbai English',
      cantHear: "Sorry yaar, couldn't hear you over the band. Say that again?",
      comeBackLater: 'Arre, so much talking! Take a little break and come back later, na?',
    },
  },
  toronto: {
    id: 'toronto',
    name: 'Toronto',
    pin: { left: 19.4, top: 41.7 },
    content: toronto,
    cast: torontoCast,
    words: { list: TORONTO_WORDS, find: findToronto, label: 'Toronto words' },
    quests: { doubledouble, streetcar, court },
    lessons: torontoLessons,
    scene: 'toronto',
    voiceLang: 'en-CA',
    review: PENDING_REVIEW,
    ui: {
      place: 'Toronto, Canada',
      heading: 'You just moved to the 6ix.',
      note: 'Torontonians can spot a tourist from the other end of the streetcar. Win over the locals and prove you belong.',
      howto: [
        '<b>Hold the button</b> (or Space) and talk.',
        '<b>Order a double-double, catch the streetcar, get picked on the court:</b> each local has their own scene.',
        '<b>Sound like a Torontonian:</b> "Trawna", the Canadian "out and about", and a bit of 6ix slang all count.',
      ],
      talk: 'Meet the locals',
      street: 'Queen Street',
      castHeading: 'Who will you talk to?',
      castNote: 'Bev, Gus and Dre each have a job for you. Rocco the raccoon just wants to know if you\'re really from here.',
      language: 'Toronto English',
      cantHear: 'Sorry, bud, the streetcar was going by. Say that again?',
      comeBackLater: 'Okay, that\'s a lot of talking, eh. Take a break and come back later.',
    },
  },
};

export const regionList = () => Object.values(REGIONS);
export const getRegion = (id) => REGIONS[id] ?? REGIONS.scotland;
