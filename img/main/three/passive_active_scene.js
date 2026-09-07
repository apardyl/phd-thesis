// Detailed street scene for Figure 1. Independent of the completed Figure 3.
// Render ?view=overview and ?view=camera; both use the same robot eye pose.
import * as THREE from 'three';
import { createRenderer, setupEnvironment, addLights, buildTree, buildBush, buildRobot } from './lib.js';

const overview = new URLSearchParams(location.search).get('view') !== 'camera';
const renderer = createRenderer(1200, 900);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f7f3);
setupEnvironment(renderer, scene);
addLights(scene, { radius: 8 });

function box(parent, x, y, z, w, h, d, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Pavement, a narrow street and a few markings establish spatial context.
box(scene, 0, -0.1, 0, 9, 0.15, 7, 0xe8e3d8);
box(scene, 0, -0.01, 1.35, 9, 0.025, 1.8, 0xc5c8c8);
for (const x of [-3, -1.5, 0, 1.5, 3])
  box(scene, x, 0.008, 1.95, 0.65, 0.015, 0.06, 0xf5f2e9);

// A large house: windows and a door give partial glimpses useful detail.
const house = new THREE.Group();
house.position.set(-2.0, 0, -1.0);
scene.add(house);
box(house, 0, 1.15, 0, 1.8, 2.3, 1.5, 0xc98b61);
box(house, 0, 2.34, 0, 2.0, 0.15, 1.7, 0x526875);
for (const x of [-0.5, 0.5]) {
  for (const y of [0.65, 1.7]) {
    box(house, x, y, 0.76, 0.45, 0.5, 0.035, 0xf8f1dc);
    box(house, x, y, 0.79, 0.32, 0.37, 0.025, 0x52778d);
  }
}
box(house, 0, 0.4, 0.79, 0.35, 0.8, 0.045, 0x604a3e);

// A smaller shop with a striped awning and a glazed front.
const shop = new THREE.Group();
shop.position.set(0.25, 0, -1.65);
scene.add(shop);
box(shop, 0, 0.68, 0, 1.6, 1.36, 1.25, 0x7697a7);
box(shop, 0, 1.4, 0, 1.75, 0.12, 1.4, 0x486474);
box(shop, 0, 0.55, 0.65, 1.22, 0.85, 0.03, 0xbed7dd);
for (let i = 0; i < 6; i++)
  box(shop, -0.625 + i * 0.25, 1.05, 0.87, 0.25, 0.09, 0.55,
    i % 2 ? 0xf3e9cd : 0xb8504c);
box(shop, 0, 0.55, 0.68, 0.05, 0.85, 0.035, 0x486474);

scene.add(buildTree(2.3, -1.4, { scale: 1.2, color: 0x558343 }));
scene.add(buildTree(3.0, -0.4, { scale: 0.75, color: 0x6a984d }));
scene.add(buildBush(-3.15, -0.15, { scale: 1.35, color: 0x668c4b }));

// A small bench, clearly different in scale from the house and car.
const bench = new THREE.Group();
bench.position.set(-1.5, 0, 0.55);
scene.add(bench);
for (const x of [-0.48, 0.48]) {
  box(bench, x, 0.23, 0, 0.08, 0.46, 0.38, 0x454f53);
  box(bench, x, 0.53, -0.18, 0.07, 0.58, 0.07, 0x454f53);
}
box(bench, 0, 0.47, 0, 1.2, 0.08, 0.45, 0xb3814e);
box(bench, 0, 0.75, -0.18, 1.2, 0.28, 0.06, 0xb3814e);

// Red car, aligned along the road, with contrasting cabin and four wheels.
const car = new THREE.Group();
car.position.set(1.45, 0, 1.3);
scene.add(car);
box(car, 0, 0.36, 0, 1.65, 0.38, 0.75, 0xb94a42);
box(car, -0.12, 0.67, 0, 0.85, 0.36, 0.65, 0xb94a42);
box(car, -0.12, 0.7, 0.335, 0.68, 0.23, 0.025, 0x9cbec9);
box(car, 0.32, 0.69, 0, 0.025, 0.24, 0.56, 0x9cbec9);
for (const x of [-0.53, 0.53]) {
  for (const z of [-0.38, 0.38]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.11, 16),
      new THREE.MeshStandardMaterial({ color: 0x343c40, roughness: 0.85 }));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.23, z);
    wheel.castShadow = true;
    car.add(wheel);
  }
}
box(car, 0.835, 0.39, 0, 0.025, 0.13, 0.55, 0xf3e4bd);


const robot = buildRobot();
// Give the pale shell parts enough contrast against this scene's pavement.
// Keep the colour change local to Figure 1 rather than the shared robot model.
const shellColours = new Map([
  [0xf0f0f0, 0x455b6b], // head
  [0xe4e4e4, 0x3d5261], // head cap
  [0xdadada, 0x536b7a], // forearms
]);
robot.traverse((part) => {
  if (!part.isMesh) return;
  const colour = shellColours.get(part.material.color.getHex());
  if (colour !== undefined) {
    part.material = part.material.clone();
    part.material.color.setHex(colour);
  }
});
robot.scale.setScalar(1.25);
robot.position.set(-0.2, 0, 3.1);
robot.rotation.y = -Math.atan2(2.5, 4.5);
scene.add(robot);
robot.updateMatrixWorld(true);

const eye = robot.localToWorld(new THREE.Vector3(0, robot.userData.eyeHeight, -0.36));
const cameraView = new THREE.PerspectiveCamera(50, 4 / 3, 0.1, 3.0);
cameraView.position.copy(eye);
cameraView.lookAt(2.3, 0.85, -1.4);
cameraView.updateMatrixWorld(true);

let camera = cameraView;
if (overview) {
  // The overlay is the actual rectangular camera frustum, projected from
  // the same eye pose and field of view used for the first-person image.
  const corners = [[-1,-1], [1,-1], [1,1], [-1,1]].map(([x,y]) =>
    new THREE.Vector3(x,y,1).unproject(cameraView));
  const vertices = [];
  for (let i = 0; i < 4; i++)
    vertices.push(...eye.toArray(), ...corners[i].toArray(), ...corners[(i+1)%4].toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0x17537e, side: THREE.DoubleSide, transparent: true,
    opacity: 0.09, depthWrite: false,
  })));
  const edgePoints = [];
  for (let i = 0; i < 4; i++) {
    edgePoints.push(eye, corners[i], corners[i], corners[(i+1)%4]);
  }
  // Cylindrical edges stay legible when the raster is printed at 3.1cm wide.
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0x17537e, transparent: true, opacity: 0.65, depthWrite: false,
  });
  for (let i = 0; i < edgePoints.length; i += 2) {
    const direction = edgePoints[i + 1].clone().sub(edgePoints[i]);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,direction.length(),8), edgeMaterial);
    edge.position.copy(edgePoints[i]).add(edgePoints[i + 1]).multiplyScalar(0.5);
    edge.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
    scene.add(edge);
  }
  camera = new THREE.OrthographicCamera(-4.65,4.65,3.4875,-3.4875,0.1,100);
  camera.position.set(7,9,12);
  camera.lookAt(0,0.7,0.3);
} else {
  // The illustrative frustum has a finite display length; the sensor itself
  // still sees the background beyond it.
  camera.far = 100;
  camera.updateProjectionMatrix();
}
renderer.render(scene,camera);
window.__rendered = true;
