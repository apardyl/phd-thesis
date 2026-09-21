// Detailed, matched street views for Figure 2.
// Render ?agent=ptz and ?agent=uav; TikZ supplies the movement arrows.
import * as THREE from 'three';
import { createRenderer, setupEnvironment, addLights, buildTree, buildBush, buildPTZCamera, buildUAV } from './lib.js';

const agent = new URLSearchParams(location.search).get('agent') || 'ptz';
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
bench.position.set(-2.8, 0, -0.3);
scene.add(bench);
for (const x of [-0.48, 0.48]) {
  box(bench, x, 0.23, 0, 0.08, 0.46, 0.38, 0x454f53);
  box(bench, x, 0.53, -0.18, 0.07, 0.58, 0.07, 0x454f53);
}
box(bench, 0, 0.47, 0, 1.2, 0.08, 0.45, 0xb3814e);
box(bench, 0, 0.75, -0.18, 1.2, 0.28, 0.06, 0xb3814e);

// Red car, aligned along the road, with contrasting cabin and four wheels.
const car = new THREE.Group();
car.position.set(2.5, 0, 1.3);
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



let device;
if (agent === 'uav') {
  device = buildUAV();
  device.scale.setScalar(2.8);
  device.position.set(0.3,2.7,2.5);
} else {
  device = buildPTZCamera({ color: 0x455b6b, accent: 0x17537e });
  device.scale.setScalar(2.4);
  device.position.set(-0.2,0,2.25);
}
scene.add(device);
device.updateMatrixWorld(true);

// A rectangular viewing cone: translucent sides and a thin, visible outline.
// The PTZ cone follows the physical lens; the UAV camera points at the ground.
function addViewCone(apex, corners) {
  const vertices = [];
  for (let i = 0; i < 4; i++)
    vertices.push(...apex.toArray(), ...corners[i].toArray(), ...corners[(i + 1) % 4].toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0x17537e, side: THREE.DoubleSide, transparent: true,
    opacity: 0.09, depthWrite: false,
  })));
  const material = new THREE.MeshBasicMaterial({
    color: 0x17537e, transparent: true, opacity: 0.6, depthWrite: false,
  });
  const segments = [];
  for (let i = 0; i < 4; i++)
    segments.push([apex,corners[i]], [corners[i],corners[(i + 1) % 4]]);
  for (const [a,b] of segments) {
    const direction = b.clone().sub(a);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,direction.length(),8), material);
    edge.position.copy(a).add(b).multiplyScalar(0.5);
    edge.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
    scene.add(edge);
  }
}

let coneApex, coneCorners;
if (agent === 'uav') {
  coneApex = device.localToWorld(new THREE.Vector3(0,-0.08,0.12));
  coneCorners = [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z]) =>
    new THREE.Vector3(coneApex.x + x * 0.62, 0.04, coneApex.z + z * 0.62));
} else {
  coneApex = device.localToWorld(new THREE.Vector3(-0.32,0.92,0));
  coneCorners = [[-1,-1],[1,-1],[1,1],[-1,1]].map(([y,z]) =>
    new THREE.Vector3(coneApex.x - 1.75, coneApex.y + y * 0.55, coneApex.z + z * 0.7));
}
addViewCone(coneApex,coneCorners);

const camera = new THREE.OrthographicCamera(-4.65,4.65,3.4875,-3.4875,0.1,100);
camera.position.set(3.7,9.3,10);
camera.lookAt(0,0.75,0.5);
camera.updateMatrixWorld();
device.updateMatrixWorld(true);
console.log('CONE_OVERLAY',JSON.stringify([coneApex,...coneCorners].map((v) => {
  const p = v.clone().project(camera);
  return [p.x * 3.3,p.y * 2.475];
})));
const landmarks = agent === 'uav'
  ? { body: [0,0,0] }
  : { base: [0,0,0], head: [0,0.92,0], lens: [-0.3,0.92,0] };
for (const [name,xyz] of Object.entries(landmarks)) {
  const p = device.localToWorld(new THREE.Vector3(...xyz)).project(camera);
  console.log('OVERLAY',name,JSON.stringify([p.x*3.3,p.y*2.475]));
}
renderer.render(scene,camera);
window.__rendered = true;
