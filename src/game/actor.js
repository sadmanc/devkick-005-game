// One character on the street (the Devin Otter or an NPC): a chunky stand-in body until its Meshy .glb
// loads, Meshy animations matched by clip name, moods ('idle' | 'talk' | 'good' | 'ok' | 'bad' |
// 'suspicious') and body actions from the free-talk server ('laugh', 'lean_in', 'turn_away', ...).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { addExpressions } from './expressions.js';

const flat = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true });

// Stand-in: body, belly, head, muzzle, eyes and a hat in the character's colours.
function standIn({ fur = '#7a5233', belly = '#d8b48a', hat = '#2f5aa8', bobble = '#d33b3b', beak = null }) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: '#1d1410' });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 6, 12), flat(fur));
  body.position.y = 0.9;
  const front = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 6, 12), flat(belly));
  front.position.set(0, 0.85, 0.2);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), flat(fur));
  head.position.y = 1.85;
  const snout = beak
    ? new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 10), flat(beak))
    : new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), flat(belly));
  if (beak) {
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 1.78, 0.55);
  } else snout.position.set(0, 1.75, 0.34);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), dark);
  eyeL.position.set(-0.15, 1.95, 0.36);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.15;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.14, 16), flat(hat));
  cap.position.set(0, 2.25, 0);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), flat(bobble));
  pom.position.set(0, 2.36, 0);
  g.add(body, front, head, snout, eyeL, eyeR, cap, pom);
  return g;
}

export function createActor(scene, cfg) {
  const root = new THREE.Group(); // placed on the street, faces the camera spot
  root.position.set(cfg.x ?? 0, 0, cfg.z ?? 0);
  root.rotation.y = cfg.facing ?? 0;
  const body = new THREE.Group(); // animated by moods and actions
  root.add(body);
  body.add(standIn(cfg.standIn ?? {}));
  scene.add(root);

  let mixer = null;
  let clips = null;
  let current = null;
  let face = null;
  function playClip(name) {
    if (!mixer) return;
    const clip = clips?.[name];
    if (!clip) {
      current?.fadeOut(0.3);
      current = null;
      return;
    }
    const next = mixer.clipAction(clip);
    if (current === next && next.isRunning()) return;
    next.reset();
    // talking loops while the voice plays; reactions play once and hold their last pose briefly
    const loops = name === 'talk' || name === 'idle';
    next.setLoop(loops ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    next.clampWhenFinished = !loops;
    next.fadeIn(0.25).play();
    current?.fadeOut(0.25);
    current = next;
  }

  if (cfg.model) {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
      cfg.model,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        model.scale.setScalar((cfg.height ?? 2.3) / Math.max(size.y, 0.001));
        box.setFromObject(model);
        model.position.y -= box.min.y;
        body.clear();
        body.add(model);
        if (cfg.face !== false) {
          try {
            face = addExpressions(model);
          } catch (err) {
            console.warn(`[${cfg.id}] no face expressions:`, err.message);
          }
        }
        // Meshy animations: match clips by name so any naming works (idle, talk, cheer/happy, angry/sad...)
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          const find = (...words) => gltf.animations.find((c) => words.some((w) => c.name.toLowerCase().includes(w)));
          clips = {
            idle: find('idle', 'breath') || null,
            talk: find('talk_with_hands', 'talk', 'speak', 'gesture'),
            good: find('cheer', 'happy', 'clap', 'victory', 'dance'),
            ok: find('shrug', 'think', 'nod'),
            bad: find('angry', 'disappoint', 'sad', 'no'),
            suspicious: find('angry', 'suspicious', 'look'),
          };
          mixer.addEventListener('finished', () => playClip('idle'));
          playClip('idle');
        }
      },
      undefined,
      () => {}, // missing model: keep the stand-in
    );
  }

  let mood = 'idle';
  let moodT = 0;
  let action = 'none';
  let actionT = 0;
  let t = Math.random() * 10; // NPCs bob out of step with each other
  const react = (m) => {
    face?.set(m);
    mood = m;
    moodT = 0;
    playClip(m);
  };
  const act = (a) => {
    action = a || 'none';
    actionT = 0;
    if (a === 'laugh') react('good');
    if (a === 'cross_arms' || a === 'turn_away') react('suspicious');
  };

  // voice: 0..1 loudness of this character's voice right now (moves the mouth), 0 when someone else talks
  function update(dt, voice = 0) {
    mixer?.update(dt);
    face?.update(dt, voice);
    t += dt;
    moodT += dt;
    actionT += dt;
    let y = Math.sin(t * 2) * 0.03;
    let tilt = 0;
    let squash = 1;
    let x = body.position.x * 0.9;
    if (mood === 'talk') y += Math.abs(Math.sin(t * 14)) * 0.04;
    if (mood === 'good') {
      const k = Math.max(0, 1 - moodT * 1.6);
      y += Math.abs(Math.sin(moodT * 10)) * 0.5 * k;
      squash = 1 + Math.sin(moodT * 20) * 0.06 * k;
    }
    if (mood === 'ok') tilt = Math.sin(moodT * 3) * 0.12 * Math.max(0, 1 - moodT / 2);
    if (mood === 'bad' || mood === 'suspicious') {
      tilt = -0.18 * Math.min(1, moodT * 4);
      x = Math.sin(moodT * 30) * 0.04 * Math.max(0, 1 - moodT * 2);
    }
    let turn = Math.sin(t * 0.6) * 0.12;
    let lean = 0;
    let forward = 0;
    const fade = Math.max(0, 1 - Math.max(0, actionT - 1.6) / 0.6); // hold ~1.6 s, ease back
    if (action === 'lean_in') {
      lean = 0.22 * Math.min(1, actionT * 3) * fade;
      forward = 0.35 * Math.min(1, actionT * 3) * fade;
    }
    if (action === 'laugh') y += Math.abs(Math.sin(actionT * 16)) * 0.08 * fade;
    if (action === 'turn_away') turn += 1.9 * Math.min(1, actionT * 2.5) * fade;
    if (action === 'point_down_street') turn -= 0.9 * Math.min(1, actionT * 3) * fade;
    if (action === 'wave_over_pal') tilt += Math.sin(actionT * 9) * 0.14 * fade;
    if (action === 'cross_arms') lean = -0.12 * Math.min(1, actionT * 4) * fade;
    body.position.set(x, y, forward);
    body.rotation.set(lean, turn, tilt);
    body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  }

  return { id: cfg.id, root, react, act, update, setVisible: (v) => (root.visible = v) };
}
