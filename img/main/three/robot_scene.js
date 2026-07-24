import * as THREE from 'three';
import {
  PALETTE, createRenderer, setupEnvironment, addLights, addGround, darken,
  buildBuilding, buildTree, buildRock, buildBush, buildLamppost, buildRobot, buildFrustumMesh, tagUnseen,
} from './lib.js';

const W = 1200, H = 900;
const HALF_ANGLE = 35; // degrees — wide enough for building-tree-building
const FRUSTUM_LEN = 5.0;
const FIRST_PERSON_FOV = 74;

const params = new URLSearchParams(location.search);
const cam = params.get('cam') || '3p';

const renderer = createRenderer(W, H);
const scene = new THREE.Scene();
setupEnvironment(renderer, scene);
addLights(scene, { radius: 6 });
addGround(scene, { radius: 5.6 });

// 'full' = passive-perception panel: the same scene, fully visible, no
// embodied agent and no narrow window — everything rendered at "seen" vividness.
let robot = null;
if (cam !== 'full') {
  robot = buildRobot();
  scene.add(robot);

  if (cam !== '1p') {
    // Only shown from the outside — a first-person camera sitting at the
    // frustum's own apex would see its translucent faces edge-on (artifacts).
    const frustum = buildFrustumMesh(HALF_ANGLE, FRUSTUM_LEN);
    frustum.position.set(0, robot.userData.eyeHeight, robot.userData.eyeForward);
    scene.add(frustum);
  }
}

const props = [
  // seen trio: building - tree - building, tree centred in the (now wider) cone
  { angle: 0, dist: 3.6, type: 'tree', seen: true },
  { angle: -24, dist: 3.3, type: 'building', seen: true },
  { angle: 24, dist: 3.3, type: 'building', seen: true },
  // unseen, all kept clear of the +-35 deg cone
  { angle: 75, dist: 3.0, type: 'rock', seen: false },
  { angle: 55, dist: 3.1, type: 'building', seen: false },
  { angle: -68, dist: 3.3, type: 'tree', seen: false },
  { angle: 152, dist: 3.6, type: 'rock', seen: false },
  { angle: -140, dist: 3.2, type: 'building', seen: false },
  { angle: 100, dist: 3.0, type: 'lamppost', seen: false },
  { angle: -105, dist: 2.8, type: 'bush', seen: false },
  { angle: -50, dist: 3.8, type: 'building', seen: false },
  { angle: 110, dist: 3.4, type: 'rock', seen: false },
  { angle: 130, dist: 3.3, type: 'tree', seen: false },
  { angle: -115, dist: 3.9, type: 'tree', seen: false },
  { angle: 190, dist: 3.4, type: 'tree', seen: false },
];

const colorCycle = [
  darken(PALETTE.mediumpurple, 0.16),
  darken(PALETTE.steelblue, 0.14),
  darken(PALETTE.crimson, 0.1),
];
let ci = 0;

props.forEach((p) => {
  const dir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(p.angle));
  const x = dir.x * p.dist;
  const z = dir.z * p.dist;
  let obj;
  if (p.type === 'building') {
    obj = buildBuilding(x, z, { h: 1.8 + Math.random() * 0.8, color: colorCycle[ci++ % colorCycle.length] });
  } else if (p.type === 'tree') {
    obj = buildTree(x, z, { scale: 1.1, color: darken(PALETTE.forestgreen, 0.1) });
  } else if (p.type === 'bush') {
    obj = buildBush(x, z, { scale: 1.2, color: darken(PALETTE.forestgreen, 0.14) });
  } else if (p.type === 'lamppost') {
    obj = buildLamppost(x, z, {});
  } else {
    obj = buildRock(x, z, { scale: 1.3, color: darken(PALETTE.grey, 0.1) });
  }
  if (!p.seen && cam !== 'full') tagUnseen(obj);
  scene.add(obj);
});

let camera;
if (cam === '1p') {
  // Placed well clear of the robot's own head geometry (lens sits at z=-0.27);
  // sitting inside that mesh would fill the frame with warped close-up geometry.
  camera = new THREE.PerspectiveCamera(FIRST_PERSON_FOV, W / H, 0.05, 100);
  camera.position.set(0, robot.userData.eyeHeight, -0.55);
  camera.lookAt(0, robot.userData.eyeHeight - 0.05, -10);
} else {
  // Straight-on, pulled well back so the entire ground disc (radius 5.6) fits.
  // Shared by 'full' and '3p' so the two images line up as a direct visual pair.
  camera = new THREE.PerspectiveCamera(19, W / H, 0.1, 100);
  camera.position.set(4.4, 23.5, 20);
  camera.lookAt(0, 0.2, 0);
}

renderer.render(scene, camera);
window.__rendered = true;
