import * as THREE from 'three';
import {
  PALETTE, createRenderer, setupEnvironment, addLights, addGround, darken,
  buildBuilding, buildTree, buildRock, buildBush, buildLamppost, buildPTZCamera, buildUAV,
} from './lib.js';

const W = 1200, H = 900;

const params = new URLSearchParams(location.search);
const agent = params.get('agent') || 'ptz'; // 'ptz' | 'uav'

const renderer = createRenderer(W, H);
const scene = new THREE.Scene();
setupEnvironment(renderer, scene);
addLights(scene, { radius: 6 });
addGround(scene, { radius: 5.2 });

// shared, object-populated environment — identical on both renders
const props = [
  { angle: 30, dist: 3.6, type: 'building' },
  { angle: -50, dist: 3.9, type: 'building' },
  { angle: 65, dist: 2.9, type: 'tree' },
  { angle: -80, dist: 3.1, type: 'tree' },
  { angle: 150, dist: 3.4, type: 'rock' },
  { angle: -150, dist: 3.0, type: 'bush' },
  { angle: 110, dist: 2.7, type: 'lamppost' },
  { angle: 0, dist: 4.3, type: 'building' },
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
    obj = buildBuilding(x, z, { h: 1.2 + Math.random() * 0.5, color: colorCycle[ci++ % colorCycle.length] });
  } else if (p.type === 'tree') {
    obj = buildTree(x, z, { scale: 1.1, color: darken(PALETTE.forestgreen, 0.1) });
  } else if (p.type === 'bush') {
    obj = buildBush(x, z, { scale: 1.2, color: darken(PALETTE.forestgreen, 0.14) });
  } else if (p.type === 'lamppost') {
    obj = buildLamppost(x, z, {});
  } else {
    obj = buildRock(x, z, { scale: 1.3, color: darken(PALETTE.grey, 0.1) });
  }
  scene.add(obj);
});

if (agent === 'uav') {
  const uav = buildUAV();
  uav.scale.setScalar(2.0);
  // moving "toward the camera" means moving along the camera's actual offset
  // direction (3.7, 8.5) in the XZ plane, not pure +Z -- the camera sits well
  // off to the side (x=3.7), so a pure +Z shift reads mostly as sideways.
  uav.position.set(0.6, 2.3, 1.3);
  uav.castShadow = true;
  scene.add(uav);
} else {
  const ptz = buildPTZCamera();
  ptz.scale.setScalar(1.8);
  scene.add(ptz);
}

// same medium-close framing for both renders — the agent needs to read large
// enough for TikZ to overlay action arrows on top of it.
const camera = new THREE.PerspectiveCamera(27, W / H, 0.1, 100);
camera.position.set(3.7, 9.3, 8.5);
camera.lookAt(0, 0.55, 0);

renderer.render(scene, camera);
window.__rendered = true;
