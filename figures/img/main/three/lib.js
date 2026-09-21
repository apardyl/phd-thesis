// Shared look & helpers for all thesis Fig.1/2/3 Three.js renders.
// Style: low-poly primitive props, soft shadows, IBL, transparent background
// (renders composite as vignette PNGs into TikZ-laid-out figures).

import * as THREE from 'three';
import { RoomEnvironment } from './vendor/addons/environments/RoomEnvironment.js';

// Thesis palette (main.tex:29-33), matplotlib-tab10-derived.
export const PALETTE = {
  steelblue: 0x1f77b4,
  crimson: 0xd62728,
  darkorange: 0xff7f0e,
  forestgreen: 0x2ca02c,
  mediumpurple: 0x9467bd,
  cream: 0xe4dcc8,
  grey: 0xb5b0a6,
  darkgrey: 0x555555,
  nearblack: 0x222222,
};

export function desaturate(hex, amount = 0.85, lighten = 0.12) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s * (1 - amount), Math.min(1, hsl.l + lighten));
  return c.getHex();
}

export function darken(hex, amount = 0.18) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, Math.min(1, hsl.s * 1.08), Math.max(0, hsl.l - amount));
  return c.getHex();
}

export function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(2);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function setupEnvironment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

export function addLights(scene, { radius = 8 } = {}) {
  const key = new THREE.DirectionalLight(0xfff4e6, 3.2);
  key.position.set(6, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -radius;
  key.shadow.camera.right = radius;
  key.shadow.camera.top = radius;
  key.shadow.camera.bottom = -radius;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0012;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 8;
  key.shadow.blurSamples = 16;
  scene.add(key);
  scene.add(key.target);

  const hemi = new THREE.HemisphereLight(0xdfe9f5, 0x3a3226, 0.55);
  scene.add(hemi);

  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.5);
  fill.position.set(-6, 4, -4);
  scene.add(fill);
}

export function addGround(scene, { radius = 7, color = PALETTE.cream } = {}) {
  const geo = new THREE.CircleGeometry(radius, 64);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function stdMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...opts });
}

export function buildBuilding(x, z, { w = 1.1, h = 2.2, d = 1.1, color = PALETTE.cream } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stdMat(color, { roughness: 0.85 }));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w * 1.02, 0.12, d * 1.02),
    stdMat(darken(color, 0.05), { roughness: 0.8 })
  );
  roof.position.y = h + 0.06;
  roof.castShadow = true;
  g.add(roof);
  g.position.set(x, 0, z);
  return g;
}

export function buildTree(x, z, { scale = 1, color = PALETTE.forestgreen } = {}) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.11 * scale, 0.6 * scale, 8),
    stdMat(0x6b4a34, { roughness: 0.9 })
  );
  trunk.position.y = 0.3 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(0.55 * scale, 1.2 * scale, 10),
    stdMat(color, { roughness: 0.75 })
  );
  foliage.position.y = 1.05 * scale + 0.15;
  foliage.castShadow = true;
  g.add(foliage);
  g.position.set(x, 0, z);
  return g;
}

export function buildRock(x, z, { scale = 1, color = PALETTE.grey } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.35 * scale, 0),
    stdMat(color, { roughness: 0.9 })
  );
  mesh.position.set(x, 0.28 * scale, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildBush(x, z, { scale = 1, color = PALETTE.forestgreen } = {}) {
  const g = new THREE.Group();
  const main = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 * scale, 1), stdMat(color, { roughness: 0.8 }));
  main.position.y = 0.26 * scale;
  main.castShadow = true;
  main.receiveShadow = true;
  g.add(main);
  const small = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17 * scale, 1), stdMat(color, { roughness: 0.8 }));
  small.position.set(0.2 * scale, 0.16 * scale, 0.08 * scale);
  small.castShadow = true;
  g.add(small);
  g.position.set(x, 0, z);
  return g;
}

export function buildLamppost(x, z, { height = 1.6, color = 0x555555, lampColor = PALETTE.darkorange } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 16), stdMat(color, { roughness: 0.5, metalness: 0.4 }));
  base.position.y = 0.03;
  base.castShadow = true;
  g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, height, 12), stdMat(color, { roughness: 0.45, metalness: 0.45 }));
  pole.position.y = height / 2;
  pole.castShadow = true;
  g.add(pole);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), stdMat(lampColor, { roughness: 0.25, metalness: 0.1, emissive: new THREE.Color(lampColor), emissiveIntensity: 0.35 }));
  lamp.position.y = height + 0.06;
  lamp.castShadow = true;
  g.add(lamp);
  g.position.set(x, 0, z);
  return g;
}

export function tagUnseen(object3d) {
  object3d.traverse((n) => {
    if (n.isMesh) {
      const c = n.material.color.getHex();
      n.material = n.material.clone();
      n.material.color.setHex(desaturate(c, 0.4, 0.09));
      n.material.roughness = Math.min(1, n.material.roughness + 0.1);
    }
  });
  return object3d;
}

export function buildRobot({ color = PALETTE.steelblue } = {}) {
  const g = new THREE.Group();
  const bodyMat = stdMat(color, { roughness: 0.45, metalness: 0.35 });
  const jointMat = stdMat(0x444444, { roughness: 0.5, metalness: 0.4 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.4), bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  g.add(body);

  // chest panel detail
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.03), stdMat(darken(color, 0.12), { roughness: 0.5, metalness: 0.3 }));
  panel.position.set(0, 0.58, -0.21);
  g.add(panel);

  // -- head: rounded box with a visor band instead of a plain sphere --
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.36), stdMat(0xf0f0f0, { roughness: 0.35, metalness: 0.15 }));
  head.position.y = 1.06;
  head.castShadow = true;
  g.add(head);

  const headTop = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.08, 16), stdMat(0xe4e4e4, { roughness: 0.35, metalness: 0.15 }));
  headTop.position.y = 1.06 + 0.2;
  headTop.castShadow = true;
  g.add(headTop);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.06), stdMat(PALETTE.nearblack, { roughness: 0.2, metalness: 0.6 }));
  visor.position.set(0, 1.08, -0.19);
  g.add(visor);

  const visorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.045, 0.02), stdMat(PALETTE.darkorange, {
    roughness: 0.3, metalness: 0.2, emissive: new THREE.Color(PALETTE.darkorange), emissiveIntensity: 0.6,
  }));
  visorGlow.position.set(0, 1.08, -0.22);
  g.add(visorGlow);

  const earGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.09, 12);
  const earMat = stdMat(0x999999, { roughness: 0.4, metalness: 0.4 });
  const earL = new THREE.Mesh(earGeo, earMat);
  earL.rotation.z = Math.PI / 2;
  earL.position.set(-0.24, 1.06, 0);
  const earR = earL.clone();
  earR.position.x = 0.24;
  g.add(earL, earR);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8), stdMat(0x999999, { roughness: 0.5, metalness: 0.4 }));
  antenna.position.set(0, 1.4, 0.05);
  g.add(antenna);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), stdMat(PALETTE.crimson, {
    roughness: 0.3, metalness: 0.3, emissive: new THREE.Color(PALETTE.crimson), emissiveIntensity: 0.4,
  }));
  antennaTip.position.set(0, 1.54, 0.05);
  g.add(antennaTip);

  // -- arms: shoulder + upper arm + forearm, angled slightly outward --
  function buildArm(side) {
    const arm = new THREE.Group();
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), jointMat);
    arm.add(shoulder);

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 12), bodyMat);
    upper.position.y = -0.16;
    upper.rotation.z = side * 0.12;
    upper.castShadow = true;
    arm.add(upper);

    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), jointMat);
    elbow.position.y = -0.32;
    arm.add(elbow);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.28, 12), stdMat(0xdadada, { roughness: 0.4, metalness: 0.2 }));
    lower.position.set(side * 0.03, -0.46, 0.02);
    lower.rotation.z = side * 0.22;
    lower.rotation.x = -0.15;
    lower.castShadow = true;
    arm.add(lower);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), jointMat);
    hand.position.set(side * 0.06, -0.6, 0.05);
    arm.add(hand);

    arm.position.set(side * 0.29, 0.82, 0);
    return arm;
  }
  g.add(buildArm(-1), buildArm(1));

  const legGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.22, 12);
  const legMat = stdMat(0x444444, { roughness: 0.5, metalness: 0.3 });
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-0.14, 0.11, 0);
  legL.castShadow = true;
  const legR = legL.clone();
  legR.position.x = 0.14;
  g.add(legL, legR);

  // eye height reference for first-person cameras (visor position)
  g.userData.eyeHeight = 1.08;
  g.userData.eyeForward = -0.19; // visor z offset from origin
  return g;
}

export function buildFrustumMesh(halfAngleDeg, length, { color = PALETTE.darkorange, opacity = 0.16 } = {}) {
  // Pyramid apex at local origin, opening toward -Z (matches robot forward).
  // ConeGeometry starts with apex at (0,+len/2,0), base centre at (0,-len/2,0).
  const halfAngle = THREE.MathUtils.degToRad(halfAngleDeg);
  const baseR = Math.tan(halfAngle) * length;
  const geo = new THREE.ConeGeometry(baseR, length, 4, 1, true);
  geo.rotateY(Math.PI / 4); // align square cross-section flat-on to axes (while axis is still Y)
  geo.translate(0, -length / 2, 0); // apex -> origin, base centre -> (0,-length,0)
  geo.rotateX(Math.PI / 2); // base centre -> (0,0,-length); apex stays at origin
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 20),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  const group = new THREE.Group();
  group.add(mesh, edges);
  return group;
}

export function buildTargetMarker(x, z, { color = PALETTE.crimson } = {}) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 10, 32), stdMat(color, { roughness: 0.4, metalness: 0.2 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  ring.castShadow = true;
  ring.receiveShadow = true;
  g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 10, 32), stdMat(color, { roughness: 0.4, metalness: 0.2 }));
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = 0.02;
  g.add(ring2);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 8), stdMat(0x666666, { roughness: 0.5, metalness: 0.4 }));
  pole.position.y = 0.275;
  pole.castShadow = true;
  g.add(pole);

  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0);
  flagShape.lineTo(0.22, -0.06);
  flagShape.lineTo(0, -0.12);
  const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), new THREE.MeshStandardMaterial({
    color, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide,
    emissive: new THREE.Color(color), emissiveIntensity: 0.3,
  }));
  flag.position.set(0.018, 0.52, 0);
  flag.castShadow = true;
  g.add(flag);

  g.position.set(x, 0, z);
  return g;
}

export function buildUAV({ color = PALETTE.darkgrey, accent = PALETTE.darkorange } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.12, 4, 12), stdMat(color, { roughness: 0.4, metalness: 0.4 }));
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), stdMat(PALETTE.nearblack, { roughness: 0.2, metalness: 0.5 }));
  cam.position.set(0, -0.08, 0.12);
  g.add(cam);

  const rotorRadius = 0.42 * 0.75;
  const armPositions = [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];
  armPositions.forEach(([sx, sz]) => {
    // Direction to this rotor, in the XZ (horizontal) plane.
    const dir = new THREE.Vector3(sx, 0, sz).normalize();
    const rotorPos = dir.clone().multiplyScalar(rotorRadius);

    // Quaternion-based orientation (not sequential .rotation.z/.rotation.y
    // assignments -- those don't compose the way "rotate then rotate again"
    // suggests, since .rotation is a single Euler triple applied at once,
    // and the arm ended up not actually pointing at its rotor).
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, rotorRadius, 8),
      stdMat(0x333333, { roughness: 0.5, metalness: 0.5 })
    );
    arm.position.set(rotorPos.x / 2, 0.03, rotorPos.z / 2);
    arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    arm.castShadow = true;
    g.add(arm);

    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 24), new THREE.MeshStandardMaterial({
      color: 0xcccccc, roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.45,
    }));
    rotor.position.set(rotorPos.x, 0.08, rotorPos.z);
    rotor.castShadow = false;
    g.add(rotor);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 12), stdMat(accent, { roughness: 0.4, metalness: 0.5 }));
    motor.position.set(rotorPos.x, 0.05, rotorPos.z);
    motor.castShadow = true;
    g.add(motor);
  });

  const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6);
  const legMat = stdMat(0x333333, { roughness: 0.5 });
  [[0.12, 0.12], [0.12, -0.12], [-0.12, 0.12], [-0.12, -0.12]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, -0.14, z);
    leg.rotation.x = Math.PI / 10 * (z > 0 ? 1 : -1);
    g.add(leg);
  });

  return g;
}

export function buildPTZCamera({ color = 0x5a5d61, accent = PALETTE.darkorange } = {}) {
  // A recognisable PTZ (pan-tilt-zoom) block camera: mounting pole, a U-shaped
  // yoke bracket (the pan/tilt mechanism), and a cylindrical camera body slung
  // between the yoke arms on visible pivot pins -- not a dome/sphere, which
  // read as a streetlamp rather than a camera.
  const g = new THREE.Group();
  const metalMat = stdMat(0x4a4a4a, { roughness: 0.45, metalness: 0.55 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.1, 24), stdMat(0x333333, { roughness: 0.6, metalness: 0.3 }));
  base.position.y = 0.05;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.85, 16), stdMat(0x888888, { roughness: 0.4, metalness: 0.5 }));
  pole.position.y = 0.1 + 0.425;
  pole.castShadow = true;
  g.add(pole);

  // mounting plate atop the pole, from which the U-yoke rises
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16), metalMat);
  plate.position.y = 0.55;
  plate.castShadow = true;
  g.add(plate);

  const armGeo = new THREE.BoxGeometry(0.06, 0.42, 0.09);
  const armL = new THREE.Mesh(armGeo, metalMat);
  armL.position.set(-0.19, 0.78, 0);
  armL.castShadow = true;
  const armR = armL.clone();
  armR.position.x = 0.19;
  g.add(armL, armR);

  // camera body: a horizontal cylinder (block-camera silhouette) slung
  // between the two yoke arms, tilted slightly downward for character.
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 0.92, 0);
  bodyGroup.rotation.x = -0.18;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 24), stdMat(color, { roughness: 0.4, metalness: 0.15 }));
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  bodyGroup.add(body);

  const lensRim = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.05, 24), stdMat(0x1a1a1a, { roughness: 0.3, metalness: 0.3 }));
  lensRim.rotation.z = Math.PI / 2;
  lensRim.position.set(-0.27, 0, 0);
  bodyGroup.add(lensRim);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24), stdMat(0x0a0a0a, { roughness: 0.15, metalness: 0.6 }));
  lens.rotation.z = Math.PI / 2;
  lens.position.set(-0.3, 0, 0);
  bodyGroup.add(lens);

  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 24), stdMat(accent, { roughness: 0.3, metalness: 0.4 }));
  lensRing.rotation.y = Math.PI / 2;
  lensRing.position.set(-0.3, 0, 0);
  bodyGroup.add(lensRing);

  const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), stdMat(PALETTE.crimson, {
    roughness: 0.3, metalness: 0.2, emissive: new THREE.Color(PALETTE.crimson), emissiveIntensity: 0.6,
  }));
  statusLed.position.set(0.15, 0.13, 0);
  bodyGroup.add(statusLed);

  g.add(bodyGroup);

  // pivot pins where the body meets each yoke arm (the tilt axis)
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12);
  const pinMat = stdMat(0x2b2b2b, { roughness: 0.3, metalness: 0.5 });
  const pinL = new THREE.Mesh(pinGeo, pinMat);
  pinL.rotation.z = Math.PI / 2;
  pinL.position.set(-0.19, 0.92, 0);
  const pinR = pinL.clone();
  pinR.position.x = 0.19;
  g.add(pinL, pinR);

  g.userData.eyeHeight = 0.92;
  return g;
}

export function frameCamera(width, height, fov = 45) {
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.05, 100);
  return camera;
}

export function finish(renderer, scene, camera) {
  renderer.render(scene, camera);
  window.__rendered = true;
}
