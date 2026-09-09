// Illustrative tasks, not performance or policy results.
// Render ?view=chess, ?view=crowd and ?view=portrait with render.mjs.
import * as THREE from 'three';
import { createRenderer, setupEnvironment, addLights, buildRobot } from './lib.js';
const view = new URLSearchParams(location.search).get('view') || 'crowd';
const renderer = createRenderer(1200, view === 'portrait' ? 1200 : 900);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f7f3);
setupEnvironment(renderer, scene);
addLights(scene, { radius: 10 });
function mesh(parent, geometry, color, x, y, z) {
  const m = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color, roughness: 0.8}));
  m.position.set(x,y,z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}
function box(p,x,y,z,w,h,d,c) { return mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z); }
function cylinder(p,x,y,z,rt,rb,h,c) { return mesh(p,new THREE.CylinderGeometry(rt,rb,h,24),c,x,y,z); }
function sphere(p,x,y,z,r,c) { return mesh(p,new THREE.SphereGeometry(r,16,12),c,x,y,z); }
function piece(kind,file,rank,color) {
  const g = new THREE.Group();
  g.position.set((file-3.5)*0.66,0.16,(rank-3.5)*0.66);
  scene.add(g);
  cylinder(g,0,0.06,0,0.21,0.24,0.12,color);
  cylinder(g,0,0.15,0,0.16,0.20,0.08,color);
  const h = kind === 'pawn' ? 0.30 : 0.48;
  cylinder(g,0,h/2+0.18,0,0.09,0.15,h,color);
  cylinder(g,0,h+0.18,0,0.15,0.12,0.07,color);
  const top = h+0.25;
  if (kind === 'pawn') sphere(g,0,top+0.06,0,0.125,color);
  if (kind === 'rook') {
    cylinder(g,0,top+0.04,0,0.19,0.15,0.16,color);
    for(let i=0;i<4;i++) box(g,Math.cos(i*Math.PI/2)*0.135,top+0.16,Math.sin(i*Math.PI/2)*0.135,0.085,0.12,0.085,color);
  }
  if (kind === 'bishop') {
    sphere(g,0,top+0.10,0,0.14,color).scale.set(0.8,1.4,0.8);
    sphere(g,0,top+0.29,0,0.045,color);
  }
  if (kind === 'knight') {
    box(g,0,top+0.08,0,0.14,0.34,0.18,color).rotation.x=-0.25;
    box(g,0,top+0.22,0.09,0.16,0.16,0.29,color);
    box(g,0,top+0.35,-0.035,0.12,0.10,0.06,color);
  }
  if (kind === 'queen') {
    cylinder(g,0,top+0.10,0,0.17,0.10,0.20,color);
    for(let i=0;i<6;i++) sphere(g,Math.cos(i*Math.PI/3)*0.13,top+0.23,Math.sin(i*Math.PI/3)*0.13,0.045,color);
  }
  if (kind === 'king') {
    sphere(g,0,top+0.07,0,0.14,color);
    box(g,0,top+0.30,0,0.065,0.28,0.065,color);
    box(g,0,top+0.34,0,0.21,0.065,0.065,color);
  }
}
// The crowd and reference portrait share the same person model.
function person(x,z,shirt,skin,hair,angle=0,scale=1,familiar=false) {
  const g = new THREE.Group();
  g.position.set(x,0,z); g.rotation.y=angle; g.scale.setScalar(scale); scene.add(g);
  for(const side of [-1,1]) {
    cylinder(g,side*0.105,0.40,0,0.075,0.065,0.70,0x46515c);
    box(g,side*0.105,0.055,0.06,0.16,0.11,0.28,0x343b42);
    cylinder(g,side*0.30,1.08,0,0.075,0.065,0.56,shirt).rotation.z=side*0.10;
    sphere(g,side*0.33,0.77,0,0.075,skin);
  }
  cylinder(g,0,1.08,0,0.24,0.20,0.66,shirt);
  cylinder(g,0,1.47,0,0.075,0.08,0.14,skin);
  sphere(g,0,1.69,0,0.21,skin).scale.set(0.85,1.15,0.90);
  sphere(g,0,1.82,-0.025,0.195,hair).scale.set(0.95,0.67,0.97);
  for(const side of [-1,1]) {
    sphere(g,side*0.065,1.72,0.172,0.019,0x34302d);
    if(familiar) mesh(g,new THREE.TorusGeometry(0.053,0.012,6,16),0x3b4651,side*0.071,1.72,0.183).rotation.y=side*0.12;
  }
  if(familiar) box(g,0,1.72,0.19,0.045,0.018,0.015,0x3b4651);
  sphere(g,0,1.65,0.19,0.029,skin);
}
let camera;
if(view === 'chess') {
  box(scene,0,-0.03,0,5.70,0.26,5.70,0x736250);
  for(let f=0;f<8;f++) for(let r=0;r<8;r++)
    box(scene,(f-3.5)*0.66,0.12,(r-3.5)*0.66,0.66,0.08,0.66,(f+r)%2 ? 0xe8dfcb : 0x69808b);
  // Standard starting position; no implied best move.
  ['rook','knight','bishop','queen','king','bishop','knight','rook'].forEach((kind,f)=>{
    piece(kind,f,0,0xc8b79a); piece('pawn',f,1,0xc8b79a);
    piece('pawn',f,6,0x35444f); piece(kind,f,7,0x35444f);
  });
  camera = new THREE.OrthographicCamera(-4.8,4.8,3.6,-3.6,0.1,100);
  camera.position.set(7,11,9); camera.lookAt(0,0.35,0);
} else if(view === 'portrait') {
  person(0,0,0xad594f,0xd6aa88,0x493b34,0,1,true);
  camera = new THREE.OrthographicCamera(-0.48,0.48,0.48,-0.48,0.1,100);
  camera.position.set(0,1.58,5); camera.lookAt(0,1.58,0);
} else {
  // Cutaway hall viewed from above, matching the exploration-scale figure.
  box(scene,0,-0.10,0,8.4,0.2,8.0,0xe4dfd3);
  box(scene,-4.2,1.25,0,0.16,2.5,8.0,0xd4d2c8);
  box(scene,0,1.25,-4.0,8.4,2.5,0.16,0xdad8d0);
  for(const x of [-2.8,0,2.8]) {
    box(scene,x,1.05,-3.9,0.85,2.1,0.055,0x738995);
    box(scene,x,1.45,-3.86,0.55,0.55,0.025,0xc2d2d5);
  }
  for(const t of [-3,-1,1,3]) {
    box(scene,0,0.008,t,8.2,0.012,0.018,0xc8c3b8);
    box(scene,t,0.008,0,0.018,0.012,7.8,0xc8c3b8);
  }
  // People surround a clear central space occupied by the robot.
  [
    [-2.8,-2.6,0x7c8b75,0xbc8968,0x3e3430,0.2,1],
    [-0.8,-2.8,0x9b5b51,0xdfb08b,0x665349,-0.5,0.98],
    [1.3,-2.3,0xad594f,0xd6aa88,0x493b34,0.15,1,true],
    [3.0,-2.6,0x77748b,0x9b7054,0x302c2b,0.3,1.02],
    [-2.9,-0.7,0x607b8b,0xd3a681,0x49372c,1.0,1.04],
    [-2.5,1.6,0x9e6556,0x9c7158,0x332d2a,1.6,0.96],
    [2.9,-0.4,0x657e6f,0xdfb592,0x6b5949,-0.5,1.04],
    [1.8,1.6,0x717f8d,0xbf9273,0x38312b,-0.7,1.04],
    [-2.6,3.1,0x8a7b65,0xe0b492,0x665043,-0.55,1.02],
    [2.9,2.8,0x9a6157,0xa3775b,0x342d2a,0.4,1.08],
    [-0.7,2.8,0x667d76,0xa77858,0x302d2b,0.3,1.04],
  ].forEach(args=>person(...args));

  const robot = buildRobot();
  robot.scale.setScalar(1.45);
  robot.rotation.y = Math.atan2(0.8,-0.6);
  // Use the same darker shell treatment as the passive/active figure.
  const shellColours = new Map([[0xf0f0f0,0x455b6b],[0xe4e4e4,0x3d5261],[0xdadada,0x536b7a]]);
  robot.traverse(part=>{
    if(!part.isMesh) return;
    const colour = shellColours.get(part.material.color.getHex());
    if(colour !== undefined) {
      part.material = part.material.clone();
      part.material.color.setHex(colour);
    }
  });
  scene.add(robot);
  robot.updateMatrixWorld(true);
  const eye = robot.localToWorld(new THREE.Vector3(0,robot.userData.eyeHeight,-0.24));
  const forward = new THREE.Vector3(-0.8,0,0.6);
  const sensor = new THREE.PerspectiveCamera(50,1.2,0.1,3.1);
  sensor.position.copy(eye);
  sensor.lookAt(eye.clone().add(forward));
  sensor.updateMatrixWorld(true);
  const corners = [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>
    new THREE.Vector3(x,y,1).unproject(sensor));
  const vertices = [];
  for(let i=0;i<4;i++) vertices.push(...eye.toArray(),...corners[i].toArray(),...corners[(i+1)%4].toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  scene.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
    color:0x17537e,side:THREE.DoubleSide,transparent:true,opacity:0.09,depthWrite:false,
  })));
  const edgeMaterial = new THREE.MeshBasicMaterial({color:0x17537e,transparent:true,opacity:0.70,depthWrite:false});
  function edge(a,b) {
    const direction = b.clone().sub(a);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,direction.length(),8),edgeMaterial);
    line.position.copy(a).add(b).multiplyScalar(0.5);
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    scene.add(line);
  }
  for(let i=0;i<4;i++) {
    edge(eye,corners[i]);
    edge(corners[i],corners[(i+1)%4]);
  }
  camera = new THREE.OrthographicCamera(-6.3,6.3,4.725,-4.725,0.1,100);
  camera.position.set(9,11,13); camera.lookAt(0,0.65,0);

}
renderer.render(scene,camera);
window.__rendered = true;
