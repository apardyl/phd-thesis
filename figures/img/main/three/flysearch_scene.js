import * as THREE from 'three';
import {
  PALETTE, createRenderer, setupEnvironment, addLights, addGround, darken,
  buildBuilding, buildTree, buildRock, buildBush, buildLamppost, buildUAV, buildTargetMarker,
} from './lib.js';

const W = 1200, H = 900;

const renderer = createRenderer(W, H);
const scene = new THREE.Scene();
setupEnvironment(renderer, scene);
addLights(scene, { radius: 7 });
addGround(scene, { radius: 5.6, color: PALETTE.cream });

// a busier "open world" -- more populated than the original sparse version,
// closer in spirit to the local/global scale scenes.
const props = [
  { angle: 15, dist: 3.6, type: 'building' },
  { angle: 55, dist: 4.3, type: 'building' },
  { angle: -30, dist: 4.1, type: 'building' },
  { angle: 100, dist: 3.1, type: 'tree' },
  { angle: -110, dist: 3.8, type: 'tree' },
  { angle: 170, dist: 3.4, type: 'rock' },
  { angle: -70, dist: 4.6, type: 'building' },
  { angle: -160, dist: 2.9, type: 'lamppost' },
  { angle: 135, dist: 2.7, type: 'bush' },
  { angle: 5, dist: 5.0, type: 'tree' },
  { angle: -50, dist: 2.6, type: 'rock' },
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
    obj = buildBuilding(x, z, { h: 1.3 + Math.random() * 0.6, color: colorCycle[ci++ % colorCycle.length] });
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

// target marker — away from directly under the UAV, implying an active search.
// Kept well clear of the left edge: this panel gets scaled by height and
// clipped to a square in the final figure, cropping roughly 12% off each side.
const target = buildTargetMarker(-1.05, 1.1);
scene.add(target);

// UAV flying at altitude, off to the side of the target -- "searching".
// Pulled forward (toward camera) and up so it clears the building behind it
// instead of overlapping it.
const uav = buildUAV();
uav.scale.setScalar(1.8);
uav.position.set(1.3, 3.0, 1.5);
uav.rotation.y = 0.5;
uav.castShadow = true;
scene.add(uav);

const camera = new THREE.PerspectiveCamera(31, W / H, 0.1, 100);
camera.position.set(4.5, 7.6, 7.9);
camera.lookAt(0, 0.7, 0);

renderer.render(scene, camera);
window.__rendered = true;
