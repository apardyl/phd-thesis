// Original schematic models for the introduction timeline, not reproductions
// of historical artefacts. Uses the same lighting/materials as adjacent figures.
// Views: talos, automaton, metropolis, droids, blocks.
import * as THREE from 'three';
import {createRenderer, setupEnvironment, addLights} from './lib.js';
const view = new URLSearchParams(location.search).get('view') || 'talos';
const renderer = createRenderer(1200,1000);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f7f3);
setupEnvironment(renderer,scene);
addLights(scene,{radius:6});
function shape(p,g,c,x,y,z,metal=0.12) {
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:0.55,metalness:metal}));
  m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; p.add(m); return m;
}
const box=(p,x,y,z,w,h,d,c)=>shape(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const ball=(p,x,y,z,r,c)=>shape(p,new THREE.SphereGeometry(r,24,16),c,x,y,z);
const cyl=(p,x,y,z,rt,rb,h,c)=>shape(p,new THREE.CylinderGeometry(rt,rb,h,32),c,x,y,z,0.35);
function rod(p,a,b,r,c) {
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);
  const m=cyl(p,0,0,0,r,r,d.length(),c);
  m.position.copy(av).add(bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
}
function ring(p,x,y,z,r,t,c) {return shape(p,new THREE.TorusGeometry(r,t,8,32),c,x,y,z,0.4);}
function humanoid(p,c,{machine=false,slender=false}={}) {
  // Front faces +z. Jointed limbs and layered torso stay readable at 3.2 cm.
  for(const s of [-1,1]) {
    ball(p,s*0.20,1.18,0,0.13,c);
    rod(p,[s*0.20,1.16,0],[s*0.22,0.67,0],0.105,c);
    ball(p,s*0.22,0.62,0.02,0.115,machine?0x695e49:c);
    rod(p,[s*0.22,0.57,0],[s*0.23,0.14,0.02],0.09,c);
    box(p,s*0.23,0.10,0.10,0.23,0.17,0.37,c);
    ball(p,s*0.41,1.92,0,0.14,c);
    rod(p,[s*0.43,1.88,0],[s*0.50,1.48,0.025],0.085,c);
    ball(p,s*0.50,1.44,0.025,0.09,machine?0x695e49:c);
    rod(p,[s*0.50,1.41,0.025],[s*0.53,1.12,0.09],0.075,c);
    ball(p,s*0.53,1.07,0.09,0.085,c);
  }
  cyl(p,0,1.31,0,0.27,0.23,0.29,c);
  cyl(p,0,1.56,0,0.24,0.20,0.20,machine?0x524b40:c);
  cyl(p,0,1.82,0,slender?0.30:0.36,0.23,0.40,c);
  cyl(p,0,2.09,0,0.095,0.12,0.18,c);
  ball(p,0,2.38,0,0.25,c).scale.set(0.85,1.20,0.82);
  for(const s of [-1,1]) {
    cyl(p,s*0.23,2.39,0,0.065,0.065,0.055,c).rotation.z=Math.PI/2;
    ball(p,s*0.085,2.42,0.19,0.041,machine?0xe5d6a6:0x544637);
    if(machine) ring(p,s*0.085,2.42,0.21,0.052,0.012,0x65553b);
  }
  box(p,0,2.25,0.205,0.12,0.022,0.022,0x5c4d38);
  if(machine) {
    ring(p,0,1.83,0.275,0.12,0.023,c);
    for(const x of [-0.12,-0.06,0,0.06,0.12]) rod(p,[x,1.48,0.19],[x+0.025,1.64,0.20],0.012,0xb1a17a);
  }
}

// Open brass cogwheels with spokes, visible axles and interlocking teeth.
function gear(p,x,y,z,r,n=14) {
  const outline=new THREE.Shape();
  for(let i=0;i<n*4;i++) {
    const a=i*Math.PI*2/(n*4),rr=r*([1,1,0.86,0.86][i%4]);
    const px=Math.cos(a)*rr,py=Math.sin(a)*rr;
    if(i===0) outline.moveTo(px,py); else outline.lineTo(px,py);
  }
  outline.closePath();
  const hole=new THREE.Path();hole.absarc(0,0,r*0.60,0,Math.PI*2,true);outline.holes.push(hole);
  shape(p,new THREE.ExtrudeGeometry(outline,{depth:0.055,bevelEnabled:false}),0xa88742,x,y,z,0.6);
  for(let i=0;i<6;i++) {
    const a=i*Math.PI/3;
    rod(p,[x,y,z+0.026],[x+Math.cos(a)*r*0.70,y+Math.sin(a)*r*0.70,z+0.026],0.018,0xa88742);
  }
  const axle=cyl(p,x,y,z+0.025,r*0.15,r*0.15,0.15,0x5e625f);axle.rotation.x=Math.PI/2;
}

let camera = new THREE.OrthographicCamera(-1.85,1.85,1.542,-1.542,0.1,100);
camera.position.set(4,2.7,8); camera.lookAt(0,1.3,0);
cyl(scene,0,-0.06,0,1.35,1.35,0.10,0xe5dfd2);
if(view==='talos') {
  const g=new THREE.Group();scene.add(g);
  humanoid(g,0x997447);
  // Helmet crest, shield and plinth evoke a bronze guardian rather than a
  // modern robot; the illustration is not an archaeological reconstruction.
  ball(g,0,2.54,-0.015,0.245,0x86623b).scale.set(1,0.55,1);
  box(g,0,2.73,-0.025,0.055,0.27,0.37,0x765735);
  cyl(g,-0.56,1.40,0.16,0.39,0.39,0.065,0xa17d4b).rotation.x=Math.PI/2;
  ball(g,-0.56,1.40,0.205,0.095,0x8a673b).scale.z=0.4;
  box(g,0,1.20,0,0.58,0.25,0.44,0x87643e);
  camera = new THREE.OrthographicCamera(-2.0,2.0,1.667,-1.667,0.1,100);
  camera.position.set(4,2.9,8);camera.lookAt(0,1.40,0);
} else if(view==='automaton') {
  // Generic eighteenth-century writing automaton, not a named reconstruction.
  const wood=0x795940,coat=0x546b78,skin=0xc5a382;
  box(scene,0,0.48,-0.30,0.88,0.12,0.66,wood);
  box(scene,0,1.03,-0.60,0.90,1.12,0.10,wood);
  for(const x of [-0.35,0.35]) for(const z of [-0.54,-0.03]) box(scene,x,0.24,z,0.10,0.48,0.10,wood);
  for(const s of [-1,1]) {
    rod(scene,[s*0.18,0.86,-0.25],[s*0.18,0.57,0.13],0.105,0x5b6265);
    rod(scene,[s*0.18,0.55,0.13],[s*0.18,0.15,0.20],0.075,0xd4c6ac);
    box(scene,s*0.18,0.10,0.29,0.18,0.15,0.30,0x454341);
  }
  // Cutaway torso: framing and a brass gear train replace the closed coat.
  box(scene,0,1.15,-0.40,0.54,0.65,0.075,coat);
  for(const x of [-0.29,0.29]) rod(scene,[x,0.84,-0.28],[x,1.47,-0.28],0.025,0x7b6846);
  box(scene,0,1.47,-0.25,0.64,0.075,0.26,coat);
  box(scene,0,0.84,-0.25,0.58,0.075,0.26,0x7b6846);
  gear(scene,-0.11,1.29,-0.06,0.18);
  gear(scene,0.12,1.06,-0.03,0.16);
  gear(scene,0.20,1.39,-0.02,0.12,12);
  rod(scene,[0,1.46,-0.20],[0,1.57,-0.20],0.045,0x7b6846);
  ball(scene,0,1.78,-0.19,0.24,skin).scale.set(0.85,1.12,0.9);
  ball(scene,0,1.94,-0.24,0.255,0xd2c8b2).scale.set(1,0.55,1);
  for(const s of [-1,1]) {
    ball(scene,s*0.22,1.77,-0.25,0.10,0xd2c8b2);
    ball(scene,s*0.072,1.81,0.017,0.02,0x413b33);
    // Exposed paired rods, hinge and actuator link the torso to the pen hand.
    for(const offset of [-0.025,0.025]) {
      rod(scene,[s*0.29+offset,1.38,-0.21],[s*0.42+offset,1.16,0.12],0.021,0xa88742);
      rod(scene,[s*0.42+offset,1.16,0.12],[s*0.21+offset,1.09,0.55],0.021,0x707672);
    }
    ball(scene,s*0.42,1.16,0.12,0.07,0xa88742);
    ball(scene,s*0.21,1.10,0.55,0.07,skin);
  }
  box(scene,0,0.98,0.67,1.40,0.10,0.87,wood);
  for(const x of [-0.60,0.60]) for(const z of [0.32,1.00]) box(scene,x,0.46,z,0.08,0.92,0.08,wood);
  box(scene,0,1.039,0.66,0.62,0.012,0.47,0xf2e8d2);
  rod(scene,[0.21,1.13,0.56],[0.36,1.51,0.47],0.012,0x473f33);
  const feather=ball(scene,0.37,1.56,0.46,0.08,0xeee6d5);feather.scale.set(0.35,2.0,0.6);
  // Larger external gear train makes the mechanism legible at print scale.
  box(scene,0.54,1.12,-0.31,0.34,0.83,0.06,0x494b46);
  gear(scene,0.55,1.39,-0.24,0.19);
  gear(scene,0.62,1.08,-0.20,0.17);
  gear(scene,0.52,0.80,-0.18,0.14,12);
  rod(scene,[0.60,1.39,-0.12],[0.39,1.17,0.10],0.025,0xa88742);
  camera.position.set(3,3.0,8);camera.lookAt(0.05,1.08,0.15);
} else if(view==='metropolis') {
  // A separate sculpted armour model, not the generic C-3PO-style mannequin.
  // Reference: Cinematheque francaise, Close-up on the robot of Metropolis
  // (2011), https://www.cinematheque.fr/zooms/robot-metropolis/en/telechargement/metropolis2011-VA.pdf
  const metal=0xb5b2a6,edge=0x73766f,joint=0x575b59;
  // Lathed armour profiles blend into a narrow waist and rounded hips.
  function armour(profile,x,y,z,sx=1,sz=1) {
    const m=shape(scene,new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),40),metal,x,y,z,0.55);
    m.scale.set(sx,1,sz);return m;
  }
  armour([[0.22,0],[0.31,0.12],[0.29,0.29],[0.20,0.42]],0,1.10,0,1,0.70);
  armour([[0.19,0],[0.21,0.16],[0.31,0.36],[0.34,0.48],[0.24,0.58]],0,1.49,0,1,0.65);
  for(const y of [1.45,1.51,1.57]) {
    const rib=ring(scene,0,y,0,0.205,0.014,edge);rib.rotation.x=Math.PI/2;rib.scale.y=0.70;
  }
  for(const side of [-1,1]) {
    // Smooth breastplate relief, integrated into the torso surface.
    ball(scene,side*0.14,1.91,0.15,0.145,metal).scale.set(1,0.83,0.49);
    ball(scene,side*0.31,1.95,0,0.115,metal).scale.set(1,0.85,1);
    rod(scene,[side*0.36,1.92,0],[side*0.43,1.60,0.035],0.085,metal);
    ball(scene,side*0.43,1.56,0.035,0.075,joint);
    rod(scene,[side*0.43,1.52,0.035],[side*0.45,1.22,0.12],0.090,metal);
    ball(scene,side*0.45,1.15,0.12,0.095,metal).scale.set(0.72,1.32,0.60);
    for(const y of [1.37,1.43]) {
      const band=ring(scene,side*0.44,y,0.075,0.095,0.012,edge);band.rotation.x=Math.PI/2;
    }
    armour([[0.08,0],[0.13,0.17],[0.145,0.34],[0.105,0.48]],side*0.18,0.65,0,1,0.82);
    ball(scene,side*0.18,0.60,0.025,0.095,metal).scale.set(1,0.8,0.80);
    armour([[0.065,0],[0.09,0.12],[0.11,0.33],[0.075,0.47]],side*0.18,0.10,0,1,0.85);
    ball(scene,side*0.18,0.075,0.095,0.13,metal).scale.set(0.72,0.48,1.50);
  }
  cyl(scene,0,2.13,0,0.072,0.085,0.17,joint);
  for(const y of [2.09,2.14,2.19]) ring(scene,0,y,0,0.085,0.013,metal).rotation.x=Math.PI/2;
  // Elongated mask, low brow and inset almond eyes replace the round goggles.
  armour([[0.055,0],[0.12,0.05],[0.17,0.16],[0.185,0.30],[0.165,0.40],[0.10,0.46],[0,0.48]],0,2.20,0,1,0.80);
  for(const side of [-1,1]) {
    ball(scene,side*0.073,2.48,0.130,0.052,0x4d514e).scale.set(1.0,0.42,0.36);
    ball(scene,side*0.073,2.48,0.147,0.021,0xd9d9cf).scale.set(0.65,0.72,0.3);
    rod(scene,[side*0.027,2.525,0.144],[side*0.125,2.535,0.123],0.013,edge);
    const ear=cyl(scene,side*0.185,2.46,0,0.064,0.064,0.028,metal);ear.rotation.z=Math.PI/2;
  }
  // A ridge down the face and fine mouth grille preserve the mask-like look.
  rod(scene,[0,2.55,0.148],[0,2.40,0.178],0.015,metal);
  box(scene,0,2.34,0.137,0.085,0.014,0.012,joint);
  rod(scene,[0,2.57,0.131],[0,2.66,0.055],0.009,edge);
  camera.position.set(2.2,2.5,8);camera.lookAt(0,1.31,0);
} else if(view==='droids') {
  const protocol=new THREE.Group();protocol.position.x=-0.63;protocol.scale.setScalar(0.93);scene.add(protocol);
  humanoid(protocol,0xb49b57,{machine:true});
  // C-3PO's gold face and ribbed limbs, paired with R2-D2's blue/white barrel,
  // dome, eye and three feet. These are original stylised character models.
  for(const s of [-1,1]) for(const y of [0.78,0.85,0.92,0.99])
    ring(protocol,s*0.21,y,0,0.107,0.014,0x89703e).rotation.x=Math.PI/2;
  const r=new THREE.Group();r.position.set(0.72,0,0.20);scene.add(r);
  cyl(r,0,0.84,0,0.38,0.38,0.94,0xe1e0d7);
  shape(r,new THREE.SphereGeometry(0.38,32,16,0,Math.PI*2,0,Math.PI/2),0xa8b3b9,0,1.31,0,0.5);
  cyl(r,0,1.31,0,0.389,0.389,0.055,0x34618e);
  for(const x of [-0.18,0,0.18]) box(r,x,1.05,0.35,0.13,0.12,0.035,0x34618e);
  box(r,0,0.75,0.388,0.19,0.27,0.035,0x34618e);
  box(r,0,1.49,0.30,0.20,0.15,0.065,0x34618e);
  ball(r,0.015,1.49,0.35,0.063,0x27323a);
  for(const s of [-1,1]) {
    box(r,s*0.47,0.78,0,0.17,0.80,0.21,0xd9dcd8);
    box(r,s*0.47,0.74,0.12,0.07,0.37,0.04,0x34618e);
    box(r,s*0.47,0.19,0.10,0.28,0.23,0.49,0xd9dcd8);
  }
  rod(r,[0,0.45,0],[0,0.18,0.37],0.06,0xa1a8aa);
  box(r,0,0.12,0.42,0.26,0.18,0.36,0xd9dcd8);
  camera = new THREE.OrthographicCamera(-1.9,1.9,1.583,-1.583,0.1,100);
  camera.position.set(3,2.7,8);camera.lookAt(0,1.2,0);
} else if(view==='blocks') {
  box(scene,0,0,0,3.4,0.12,2.5,0xe3ded2);
  for(const [x,y,z,w,h,d,c] of [[-0.7,0.55,-0.3,0.85,1.0,0.8,0x839cab],[0.65,0.36,0.30,0.85,0.62,0.80,0xc7ac8d]]) {
    const block=box(scene,x,y,z,w,h,d,c);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(block.geometry),new THREE.LineBasicMaterial({color:0x315872}));
    edges.position.copy(block.position);scene.add(edges);
  }
  const roof=shape(scene,new THREE.ConeGeometry(0.63,0.65,4),0xb39375,-0.7,1.37,-0.3);roof.rotation.y=Math.PI/4;
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(roof.geometry),new THREE.LineBasicMaterial({color:0x315872}));
  edges.position.copy(roof.position);edges.rotation.copy(roof.rotation);scene.add(edges);
  camera.position.set(4,3.8,6);camera.lookAt(0,0.65,0);
}
renderer.render(scene,camera);window.__rendered=true;
