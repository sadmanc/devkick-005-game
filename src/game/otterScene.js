// 3D stage behind the UI: a grey-box otter on a Highland hill until lane 3's Meshy otter lands.
// If public/assets/models/otter.glb exists it replaces the placeholder automatically.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createLoop } from './loop.js';
import { createActor } from './actor.js';
import cast from '../content/cast.json';
import { buildMumbaiSet, MUMBAI_SKY } from './mumbaiScene.js';
import { voiceLevel } from './audio.js';

// casts: every region's cast, keyed by region id. Glasgow's street and cast show until setRegion() picks another.
export function createStage(container, casts = { scotland: cast }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b9c3cc'); // overcast Glasgow sky (Rosebud skybox replaces it)
  scene.fog = new THREE.Fog('#b9c3cc', 22, 85);
  // soft reflections so the wet paving and windows catch the grey sky (cheap: one prefiltered env map)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;

  // Rain: one draw call of short falling streaks around the camera
  const RAIN = window.innerWidth < 900 ? 900 : 1800;
  const rainPos = new Float32Array(RAIN * 6);
  const rainSpeed = new Float32Array(RAIN);
  const drop = (i, anyHeight) => {
    const x = (Math.random() - 0.5) * 30;
    const z = 9 - Math.random() * 40;
    const y = anyHeight ? Math.random() * 16 : 16 + Math.random() * 2;
    rainPos.set([x, y, z, x - 0.04, y + 0.45, z], i * 6);
    rainSpeed[i] = 16 + Math.random() * 6;
  };
  for (let i = 0; i < RAIN; i += 1) drop(i, true);
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.LineBasicMaterial({ color: '#dfe7ee', transparent: true, opacity: 0.6, fog: true }),
  );
  rain.frustumCulled = false;
  scene.add(rain);
  // Weather follows the otter's trust: 0 = dreich downpour, 1 = the sun breaks through over the tenements.
  const GREY = new THREE.Color('#aab4be');
  const BLUE = new THREE.Color('#a8d4f5');
  const SKY = { scotland: [GREY, BLUE], mumbai: [new THREE.Color(MUMBAI_SKY.low), new THREE.Color(MUMBAI_SKY.high)] };
  let region = 'scotland';
  let weather = 0.3;
  let weatherGoal = 0.3;
  let rainRate = 1;
  const updateRain = (dt) => {
    for (let i = 0; i < RAIN; i += 1) {
      const dy = rainSpeed[i] * dt * rainRate;
      const o = i * 6;
      rainPos[o + 1] -= dy;
      rainPos[o + 4] -= dy;
      rainPos[o] -= dy * 0.08;
      rainPos[o + 3] -= dy * 0.08;
      if (rainPos[o + 1] < 0) drop(i, false);
    }
    rainGeo.attributes.position.needsUpdate = true;
  };
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.0, 5.4);
  camera.lookAt(0, 1.45, -2); // otter in the upper-middle, clear of the prompt card; street recedes behind

  scene.add(new THREE.HemisphereLight('#f4f1ea', '#5d5a57', 1.7));
  const sun = new THREE.DirectionalLight('#fff1dc', 1.6);
  const applyWeather = (dt) => {
    weather += (weatherGoal - weather) * Math.min(1, dt * 1.2);
    const k = weather;
    rain.material.opacity = region === 'scotland' ? 0.75 * (1 - k) ** 1.4 : 0;
    rain.visible = rain.material.opacity > 0.02;
    rainRate = 1.15 - 0.4 * k;
    scene.background.copy(SKY[region][0]).lerp(SKY[region][1], k);
    scene.fog.color.copy(scene.background);
    scene.fog.far = 70 + 60 * k;
    sun.intensity = 1.2 + 1.6 * k;
    sun.color.setHSL(0.1, 0.6 + 0.3 * k, 0.88 - 0.06 * k);
    renderer.toneMappingExposure = 0.92 + 0.28 * k;
  };
  sun.position.set(4, 8, 5);
  scene.add(sun);

  // Low-poly Glasgow street placeholder (Sadman's Meshy/Blender glasgow.glb replaces it)
  const street = new THREE.Group();
  const flat = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true });
  const road = new THREE.Mesh(new THREE.BoxGeometry(60, 0.2, 60), flat('#4a4d52'));
  road.position.y = -0.1;
  const pavement = new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 4), flat('#9a958c'));
  pavement.position.set(0, -0.05, 0.5);
  street.add(road, pavement);
  // tenement row behind the otter: red and blond sandstone, 4 storeys, bay windows
  const stone = ['#a0473a', '#c9a46c', '#8f3f34', '#d1b07a', '#9c4a3b'];
  const glass = flat('#3a4a5a');
  for (let i = 0; i < 7; i += 1) {
    const x = (i - 3) * 6.2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(6, 11, 4), flat(stone[i % stone.length]));
    b.position.set(x, 5.5, -5);
    street.add(b);
    for (let f = 0; f < 4; f += 1) {
      for (const wx of [-1.8, 0, 1.8]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 0.1), glass);
        w.position.set(x + wx, 1.6 + f * 2.5, -2.95);
        street.add(w);
      }
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 4.2), flat('#3b3a40'));
    roof.position.set(x, 11.2, -5);
    street.add(roof);
  }
  // lamp posts
  for (const x of [-4.5, 4.5]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 6), flat('#2b2e33'));
    pole.position.set(x, 1.6, 1.6);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), flat('#ffe7a6'));
    lamp.position.set(x, 3.3, 1.6);
    street.add(pole, lamp);
  }
  // the statue with the traffic cone (Glasgow's best-known joke)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), flat('#7d7a74'));
  plinth.position.set(-6.5, 0.8, -1.5);
  const rider = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.9, 4, 8), flat('#4e5a52'));
  rider.position.set(-6.5, 2.3, -1.5);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), flat('#f26b21'));
  cone.position.set(-6.5, 3.3, -1.5);
  street.add(plinth, rider, cone);
  scene.add(street);
  let glasgowSet = street;
  const mumbaiSet = buildMumbaiSet();
  mumbaiSet.visible = false;
  scene.add(mumbaiSet);
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    'assets/models/glasgow.glb',
    (gltf) => {
      scene.remove(street);
      glasgowSet = gltf.scene;
      glasgowSet.visible = region === 'scotland';
      scene.add(glasgowSet);
    },
    undefined,
    () => {},
  );

  // The cast: the Devin Otter in the middle, NPCs further down the street. Each swaps in its Meshy model.
  const actors = {};
  const regionOfActor = {};
  for (const [r, list] of Object.entries(casts)) {
    for (const c of Object.values(list)) {
      actors[c.id] = createActor(scene, c);
      regionOfActor[c.id] = r;
      actors[c.id].setVisible(r === 'scotland');
    }
  }
  let focused = actors.otter;
  // Camera spot in front of an actor: the otter's original framing, turned to match the actor's facing.
  const CAM = new THREE.Vector3(0, 2.0, 5.4);
  const LOOK = new THREE.Vector3(0, 1.45, -2);
  const camGoal = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const lookNow = new THREE.Vector3();
  const frame = (actor, instant) => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), actor.root.rotation.y);
    camGoal.copy(CAM).applyQuaternion(q).add(actor.root.position);
    lookGoal.copy(LOOK).applyQuaternion(q).add(actor.root.position);
    if (instant) {
      camera.position.copy(camGoal);
      lookNow.copy(lookGoal);
      camera.lookAt(lookNow);
    }
  };
  frame(focused, true);
  const focus = (id) => {
    focused = actors[id] && regionOfActor[id] === region ? actors[id] : actors[Object.keys(casts[region])[0]];
    frame(focused, false);
  };
  const react = (m) => focused.react(m);
  const act = (a) => focused.act(a);

  // On short screens (phones in landscape, small windows) the lesson card sits over the middle of the view,
  // so shift the picture up: the otter's face lands in the free space above the card.
  const fitView = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    if (h < 560) camera.setViewOffset(w, h, 0, h * 0.3, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', fitView);
  fitView();

  createLoop({
    update(dt) {
      updateRain(dt);
      applyWeather(dt);
      const voice = voiceLevel();
      for (const a of Object.values(actors)) if (a.root.visible) a.update(dt, a === focused ? voice : 0);
      camera.position.lerp(camGoal, Math.min(1, dt * 2.5));
      lookNow.lerp(lookGoal, Math.min(1, dt * 2.5));
      camera.lookAt(lookNow);
    },
    render() {
      renderer.render(scene, camera);
    },
  }).start();

  return {
    react,
    act,
    setWeather: (k, instant = false) => {
      weatherGoal = Math.max(0, Math.min(1, k));
      if (instant) weather = weatherGoal;
    },
    focus,
    actors,
    // Swap the street, sky and cast to another region's (Glasgow's set is kept, just hidden).
    setRegion: (id) => {
      if (!casts[id]) return;
      region = id;
      glasgowSet.visible = id === 'scotland';
      mumbaiSet.visible = id === 'mumbai';
      for (const [aid, a] of Object.entries(actors)) a.setVisible(regionOfActor[aid] === id);
      focused = actors[Object.keys(casts[id])[0]];
      frame(focused, true);
    },
    setVisible: (v) => focused.setVisible(v),
  };
}
