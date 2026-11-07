import * as THREE from 'three';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */

function extrude(shape, depth, material, bevel = 0.002, curveSegments = 32) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function disc(radius, height, material, segments = 48) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
  geometry.rotateX(Math.PI / 2);
  return new THREE.Mesh(geometry, material);
}

function ring(radius, tube, material, segments = 64) {
  return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, segments), material);
}

function sectorHoles(shape, inner, outer, count, gap = 0.3) {
  for (let i = 0; i < count; i += 1) {
    const a0 = (i / count) * TAU + gap / 2;
    const a1 = ((i + 1) / count) * TAU - gap / 2;
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, a0, a1, false);
    hole.absarc(0, 0, outer, a1, a0, true);
    hole.closePath();
    shape.holes.push(hole);
  }
}

function gearShape(radius, teeth, toothDepth, { spokes = 4, hub = 0.028, inner = 0.05 } = {}) {
  const shape = new THREE.Shape();
  const step = TAU / teeth;
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    const points = [
      [radius - toothDepth, a],
      [radius - toothDepth, a + step * 0.3],
      [radius, a + step * 0.42],
      [radius, a + step * 0.62],
      [radius - toothDepth, a + step * 0.74],
    ];
    points.forEach(([r, angle], index) => {
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0 && index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();

  if (hub > 0) {
    const centre = new THREE.Path();
    centre.absarc(0, 0, hub, 0, TAU, true);
    shape.holes.push(centre);
  }
  if (spokes > 0) sectorHoles(shape, inner, radius - toothDepth * 1.8, spokes, 0.24);
  return shape;
}

function organicShape(points, holes = []) {
  const shape = new THREE.Shape();
  const vectors = points.map(([x, y]) => new THREE.Vector2(x, y));
  shape.moveTo(vectors[0].x, vectors[0].y);
  shape.splineThru([...vectors.slice(1), vectors[0]]);
  shape.closePath();
  holes.forEach(([x, y, radius]) => {
    const hole = new THREE.Path();
    hole.absarc(x, y, radius, 0, TAU, true);
    shape.holes.push(hole);
  });
  return shape;
}

function handShape(length, width, tail, tip = 0.12) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -tail);
  shape.lineTo(width * 0.52, -tail * 0.55);
  shape.lineTo(width * 0.46, 0.06);
  shape.lineTo(width * 0.34, length * 0.58);
  shape.lineTo(width * tip, length);
  shape.lineTo(-width * tip, length);
  shape.lineTo(-width * 0.34, length * 0.58);
  shape.lineTo(-width * 0.46, 0.06);
  shape.lineTo(-width * 0.52, -tail * 0.55);
  shape.closePath();
  return shape;
}

/* ------------------------------------------------------------------ *
 * Dial artwork, drawn at runtime on a 1024 px canvas
 * ------------------------------------------------------------------ */

function drawSpacedText(ctx, text, x, y, spacing) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, w) => sum + w, 0) + spacing * (chars.length - 1);
  let cursor = x - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((char, i) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[i] + spacing;
  });
}

function createDialTexture(materials) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const R = size / 2;

  // Warm grand-feu enamel with a soft centre.
  const base = ctx.createRadialGradient(c * 0.92, c * 0.86, R * 0.08, c, c, R);
  base.addColorStop(0, '#f4ecdc');
  base.addColorStop(0.52, '#eae0cb');
  base.addColorStop(1, '#d3c5a9');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, TAU);
  ctx.fill();

  // Sunburst brushing.
  ctx.save();
  ctx.translate(c, c);
  for (let i = 0; i < 720; i += 1) {
    const angle = (i / 720) * TAU;
    ctx.strokeStyle = i % 2 ? 'rgba(120,102,74,0.032)' : 'rgba(255,252,242,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * R * 0.1, Math.sin(angle) * R * 0.1);
    ctx.lineTo(Math.cos(angle) * R, Math.sin(angle) * R);
    ctx.stroke();
  }
  ctx.restore();

  // Minute track: 60 hairlines, five-minute marks heavier.
  ctx.save();
  ctx.translate(c, c);
  for (let i = 0; i < 60; i += 1) {
    const angle = (i / 60) * TAU;
    const major = i % 5 === 0;
    ctx.strokeStyle = major ? 'rgba(56,45,31,0.82)' : 'rgba(74,62,45,0.5)';
    ctx.lineWidth = major ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.sin(angle) * R * 0.885, -Math.cos(angle) * R * 0.885);
    ctx.lineTo(Math.sin(angle) * R * (major ? 0.845 : 0.858), -Math.cos(angle) * R * (major ? 0.845 : 0.858));
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(70,58,42,0.42)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.878, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.82, 0, TAU);
  ctx.stroke();
  ctx.restore();

  // Signature.
  ctx.fillStyle = '#2c251b';
  ctx.font = '500 56px "Bodoni Moda", Didot, Georgia, serif';
  drawSpacedText(ctx, 'AURELIS', c, c - R * 0.215, 10);
  ctx.font = '400 22px "Bodoni Moda", Didot, Georgia, serif';
  drawSpacedText(ctx, 'GENÈVE', c, c - R * 0.15, 9);

  ctx.font = '400 17px "Bodoni Moda", Didot, Georgia, serif';
  ctx.fillStyle = 'rgba(60,50,36,0.82)';
  drawSpacedText(ctx, 'CALIBRE 07', c, c + R * 0.12, 7);
  ctx.font = '400 12px "Bodoni Moda", Didot, Georgia, serif';
  drawSpacedText(ctx, 'AUTOMATIQUE', c, c + R * 0.165, 5);

  ctx.fillStyle = 'rgba(62,51,36,0.72)';
  ctx.font = '400 14px "Bodoni Moda", Didot, Georgia, serif';
  drawSpacedText(ctx, 'SWISS MADE', c, c + R * 0.855, 7);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createCasebackTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(196,176,140,0.85)';
  ctx.font = '400 20px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = 'AURELIS · CALIBRE 07 · 31 JEWELS · SAPPHIRE · SWISS MADE · ';
  const chars = [...text];
  const radius = size * 0.465;
  const step = TAU / chars.length;
  chars.forEach((char, i) => {
    const angle = i * step - Math.PI / 2;
    ctx.save();
    ctx.translate(size / 2 + Math.cos(angle) * radius, size / 2 + Math.sin(angle) * radius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createSignatureTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 160);
  ctx.fillStyle = 'rgba(54, 50, 44, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '400 58px "Bodoni Moda", Didot, Georgia, serif';
  ctx.fillText('AURELIS', 256, 58);
  ctx.font = '400 24px "Bodoni Moda", Didot, Georgia, serif';
  ctx.fillText('GENÈVE', 256, 108);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createGenevaTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, size, size);
  for (let i = -size; i < size * 2; i += 18) {
    const gradient = ctx.createLinearGradient(i, 0, i + 18, 0);
    gradient.addColorStop(0, '#6f6f6f');
    gradient.addColorStop(0.5, '#a6a6a6');
    gradient.addColorStop(1, '#6f6f6f');
    ctx.fillStyle = gradient;
    ctx.save();
    ctx.translate(i, 0);
    ctx.rotate(0.16);
    ctx.fillRect(0, -size, 9, size * 3);
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/* ------------------------------------------------------------------ *
 * The watch
 * ------------------------------------------------------------------ */

export function createWatch(materials) {
  const group = new THREE.Group();
  group.name = 'calibre-07';
  const parts = [];
  const anchors = {};

  const steelDouble = materials.steelBrushed.clone();
  steelDouble.side = THREE.DoubleSide;
  steelDouble.roughness = 0.34;

  const genevaMap = createGenevaTexture();
  const bridgeMaterial = materials.rhodium.clone();
  bridgeMaterial.color.setHex(0xdde1e4);
  bridgeMaterial.roughness = 0.24;
  const rotorMaterial = materials.gold.clone();
  rotorMaterial.roughness = 0.3;
  rotorMaterial.metalness = 0.82;
  rotorMaterial.envMapIntensity = 1.5;

  function register(name, object, config = {}) {
    const {
      delta = [0, 0, 0],
      spin = [0, 0, 0],
      window = [0.18, 0.4],
      late = [0, 0, 0],
      lateSpin = [0, 0, 0],
      lateWindow = null,
      delay = 0,
    } = config;
    parts.push({
      name,
      object,
      basePosition: object.position.clone(),
      baseRotation: object.rotation.clone(),
      delta: new THREE.Vector3(...delta),
      spin: new THREE.Vector3(...spin),
      late: new THREE.Vector3(...late),
      lateSpin: new THREE.Vector3(...lateSpin),
      window,
      lateWindow,
      delay,
    });
    return object;
  }

  /* ---------------- case band ---------------- */
  const caseProfile = [
    [0.902, -0.122],
    [0.968, -0.118],
    [0.994, -0.092],
    [1.0, -0.02],
    [0.998, 0.045],
    [0.982, 0.082],
    [0.945, 0.1],
    [0.905, 0.104],
  ].map(([radius, z]) => new THREE.Vector2(radius, z));

  const caseBand = new THREE.Mesh(new THREE.LatheGeometry(caseProfile, 128), steelDouble);
  caseBand.rotation.x = Math.PI / 2;
  caseBand.position.z = -0.005;
  register('caseband', caseBand, {
    delta: [-1.3, -0.04, -0.02],
    spin: [0, 0.16, 0],
    window: [0.55, 0.75],
    delay: 0.012,
  });
  group.add(caseBand);
  anchors.caseband = { object: caseBand, offset: new THREE.Vector3(-0.86, 0.36, 0.02) };

  /* ---------------- bezel ---------------- */
  const bezelProfile = [
    [0.856, 0.088],
    [0.868, 0.104],
    [0.905, 0.112],
    [0.951, 0.106],
    [0.982, 0.09],
    [0.992, 0.072],
    [0.978, 0.06],
    [0.938, 0.064],
    [0.888, 0.074],
    [0.856, 0.082],
    [0.856, 0.088],
  ].map(([radius, z]) => new THREE.Vector2(radius, z));

  const bezel = new THREE.Mesh(new THREE.LatheGeometry(bezelProfile, 128), materials.steel);
  bezel.rotation.x = Math.PI / 2;
  bezel.position.z = -0.002;
  register('bezel', bezel, {
    delta: [-1.3, -0.05, -0.03],
    spin: [0.02, -0.1, 0.02],
    window: [0.55, 0.75],
    delay: 0.002,
  });
  group.add(bezel);

  /* ---------------- crystal ---------------- */
  const crystalRadius = 6.8;
  const theta = 0.136;
  const crystalGeometry = new THREE.SphereGeometry(crystalRadius, 96, 16, 0, TAU, 0, theta);
  crystalGeometry.translate(0, 0, 0.104 - crystalRadius * Math.cos(theta));
  const crystal = new THREE.Mesh(crystalGeometry, materials.glass);
  crystal.renderOrder = 5;
  register('crystal', crystal, {
    delta: [0.02, 0.14, 0.12],
    spin: [0.02, 0.06, -0.02],
    window: [0.19, 0.3],
    late: [-1.32, 0.05, 0.02],
    lateSpin: [0.02, 0.06, 0.02],
    lateWindow: [0.55, 0.75],
  });
  group.add(crystal);
  anchors.crystal = { object: crystal, offset: new THREE.Vector3(0.52, 0.5, 0.1) };

  /* ---------------- dial ---------------- */
  const dialGroup = new THREE.Group();
  dialGroup.name = 'dial';
  const dialTexture = createDialTexture(materials);
  const enamelTop = materials.enamel.clone();
  enamelTop.map = dialTexture;

  const dialBody = disc(0.884, 0.016, materials.dialDark);
  dialBody.position.z = 0.022;
  dialGroup.add(dialBody);

  // A flat circle (not a cylinder cap) keeps the printed artwork upright.
  const dialFace = new THREE.Mesh(new THREE.CircleGeometry(0.884, 128), enamelTop);
  dialFace.position.z = 0.0305;
  dialGroup.add(dialFace);

  const chapterRing = ring(0.86, 0.0032, materials.gold, 96);
  chapterRing.position.z = 0.033;
  dialGroup.add(chapterRing);

  // Applied, faceted gold indices.
  const indexGeometry = new THREE.BoxGeometry(0.026, 0.078, 0.015);
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * TAU;
    const radius = 0.715;
    const positions = i === 0 ? [-0.038, 0.038] : [0];
    positions.forEach((offset) => {
      const index = new THREE.Mesh(indexGeometry, materials.gold);
      index.position.set(
        Math.sin(angle) * radius + Math.cos(angle) * offset,
        Math.cos(angle) * radius - Math.sin(angle) * offset,
        0.036,
      );
      index.rotation.z = -angle;
      index.castShadow = true;
      dialGroup.add(index);
    });
  }

  register('dial', dialGroup, {
    delta: [0.0, 0.02, 0.03],
    spin: [0.02, -0.03, 0],
    window: [0.26, 0.32],
    late: [1.2, 1.35, 0.16],
    lateSpin: [0.04, -0.14, 0.08],
    lateWindow: [0.27, 0.47],
    delay: 0.004,
  });
  group.add(dialGroup);

  /* ---------------- hands ---------------- */
  const hands = new THREE.Group();
  hands.name = 'hands';

  const hourHandGroup = new THREE.Group();
  const hourHand = extrude(handShape(0.475, 0.062, 0.085, 0.1), 0.007, materials.blued, 0.0015);
  hourHand.position.z = 0.048;
  hourHandGroup.add(hourHand);
  const hourPinion = disc(0.042, 0.012, materials.gold, 32);
  hourPinion.position.z = 0.048;
  hourHandGroup.add(hourPinion);
  hourHandGroup.rotation.z = -(10 + 12 / 60) * 30 * DEG;
  register('hourhand', hourHandGroup, {
    delta: [0, 0.04, 0.16],
    spin: [0.12, 0.06, 0.4],
    window: [0.22, 0.3],
    late: [1.2, 1.35, 0.22],
    lateSpin: [0.04, -0.14, 0.08],
    lateWindow: [0.29, 0.47],
  });
  hands.add(hourHandGroup);

  const minuteHandGroup = new THREE.Group();
  const minuteHand = extrude(handShape(0.685, 0.05, 0.1, 0.08), 0.007, materials.blued, 0.0015);
  minuteHand.position.z = 0.061;
  minuteHandGroup.add(minuteHand);
  const minutePinion = disc(0.032, 0.012, materials.gold, 32);
  minutePinion.position.z = 0.061;
  minuteHandGroup.add(minutePinion);
  minuteHandGroup.rotation.z = -12 * 6 * DEG;
  register('minutehand', minuteHandGroup, {
    delta: [0, 0.05, 0.22],
    spin: [-0.14, 0.1, -0.3],
    window: [0.23, 0.31],
    late: [1.2, 1.35, 0.28],
    lateSpin: [0.04, -0.14, 0.08],
    lateWindow: [0.29, 0.47],
    delay: 0.006,
  });
  hands.add(minuteHandGroup);

  const secondHandGroup = new THREE.Group();
  const secondSpin = new THREE.Group();
  const secondShape = new THREE.Shape();
  secondShape.moveTo(-0.0045, -0.1);
  secondShape.lineTo(0.0045, -0.1);
  secondShape.lineTo(0.0065, 0.56);
  secondShape.lineTo(0, 0.7);
  secondShape.lineTo(-0.0065, 0.56);
  secondShape.closePath();
  const secondHand = extrude(secondShape, 0.004, materials.blued, 0.0008);
  secondHand.position.z = 0.074;
  secondSpin.add(secondHand);
  const counterweight = disc(0.028, 0.005, materials.blued, 32);
  counterweight.position.set(0, -0.1, 0.074);
  secondSpin.add(counterweight);
  const secondHub = disc(0.024, 0.012, materials.gold, 32);
  secondHub.position.z = 0.074;
  secondSpin.add(secondHub);
  secondHandGroup.add(secondSpin);
  register('secondhand', secondHandGroup, {
    delta: [0, 0.03, 0.3],
    spin: [0.1, -0.12, 0.3],
    window: [0.24, 0.32],
    late: [1.2, 1.35, 0.34],
    lateSpin: [0.04, -0.14, 0.08],
    lateWindow: [0.29, 0.47],
    delay: 0.009,
  });
  hands.add(secondHandGroup);

  const centreCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 32, 16, 0, TAU, 0, Math.PI / 2),
    materials.gold,
  );
  centreCap.rotation.x = Math.PI / 2;
  centreCap.position.z = 0.083;
  centreCap.scale.z = 0.6;
  hands.add(centreCap);
  group.add(hands);

  /* ---------------- movement ---------------- */
  const movement = new THREE.Group();
  movement.name = 'movement';

  const mainplate = disc(0.812, 0.032, materials.rhodium, 96);
  mainplate.position.z = -0.078;
  movement.add(mainplate);
  register('mainplate', mainplate, {
    delta: [0, -0.06, -0.38],
    spin: [0.04, 0.1, 0.12],
    window: [0.42, 0.56],
    delay: 0.02,
  });

  const movementRing = ring(0.845, 0.012, materials.rhodiumDark, 96);
  movementRing.position.z = -0.062;
  movement.add(movementRing);

  // Barrel with a visible mainspring.
  const barrelGroup = new THREE.Group();
  barrelGroup.position.set(-0.33, 0.27, -0.05);
  const barrelDrum = extrude(gearShape(0.258, 54, 0.011, { spokes: 0, hub: 0.055 }), 0.026, materials.goldBrushed, 0.002, 72);
  barrelGroup.add(barrelDrum);
  const barrelLid = disc(0.236, 0.004, materials.gold, 72);
  barrelLid.position.z = 0.017;
  barrelGroup.add(barrelLid);
  const springPoints = [];
  for (let i = 0; i <= 260; i += 1) {
    const t = i / 260;
    const angle = t * TAU * 7;
    const radius = 0.045 + t * 0.16;
    springPoints.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.021));
  }
  const springGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(springPoints),
    420,
    0.0026,
    4,
    false,
  );
  const mainspring = new THREE.Mesh(springGeometry, materials.steel);
  barrelGroup.add(mainspring);
  const barrelArbor = disc(0.035, 0.05, materials.steel, 32);
  barrelArbor.position.z = 0.01;
  barrelGroup.add(barrelArbor);

  // Ratchet wheel, crown wheel and click: the winding works.
  const ratchet = extrude(
    gearShape(0.185, 58, 0.004, { spokes: 0, hub: 0.028 }),
    0.012,
    materials.gold,
    0.0015,
    72,
  );
  ratchet.position.z = 0.026;
  barrelGroup.add(ratchet);
  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * TAU + 0.4;
    const screw = disc(0.013, 0.008, materials.blued, 16);
    screw.position.set(Math.cos(angle) * 0.11, Math.sin(angle) * 0.11, 0.034);
    barrelGroup.add(screw);
  }

  const crownWheel = extrude(
    gearShape(0.078, 24, 0.008, { spokes: 0, hub: 0.018 }),
    0.014,
    materials.goldBrushed,
    0.0012,
    36,
  );
  crownWheel.position.set(0.24, 0.47, -0.012);
  movement.add(crownWheel);

  // Perlage plate engraved with the maison's name, under the bridges.
  const movementEngraving = new THREE.Mesh(
    new THREE.RingGeometry(0.715, 0.842, 96, 1),
    new THREE.MeshBasicMaterial({
      map: createCasebackTexture(),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  movementEngraving.position.z = -0.056;
  movement.add(movementEngraving);

  const plateSignature = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.088),
    new THREE.MeshBasicMaterial({
      map: createSignatureTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  plateSignature.position.set(-0.14, -0.63, -0.054);
  movement.add(plateSignature);

  const lowGear = extrude(
    gearShape(0.062, 22, 0.006, { spokes: 3, hub: 0.014, inner: 0.026 }),
    0.014,
    materials.goldBrushed,
    0.0012,
    32,
  );
  lowGear.position.set(0.38, -0.62, -0.038);
  movement.add(lowGear);

  const lowerScrew = disc(0.02, 0.008, materials.blued, 20);
  lowerScrew.position.set(-0.44, -0.56, -0.052);
  movement.add(lowerScrew);
  movement.add(barrelGroup);
  register('barrel', barrelGroup, {
    delta: [-0.5, 0.24, 0.06],
    spin: [0.1, -0.18, 0.3],
    window: [0.36, 0.5],
    delay: 0.014,
  });
  anchors.barrel = { object: barrelGroup, offset: new THREE.Vector3(-0.12, 0.2, 0.08) };

  // Wheel train.
  const wheelSpecs = [
    { name: 'centerwheel', x: 0.0, y: 0.03, radius: 0.165, teeth: 42, spokes: 4, speed: 0.9, direction: 1 },
    { name: 'thirdwheel', x: 0.305, y: 0.215, radius: 0.116, teeth: 34, spokes: 3, speed: 2.3, direction: -1 },
    { name: 'fourthwheel', x: 0.39, y: -0.075, radius: 0.083, teeth: 28, spokes: 3, speed: 4.9, direction: 1 },
    { name: 'escapewheel', x: 0.225, y: -0.315, radius: 0.058, teeth: 15, spokes: 0, speed: 9.6, direction: -1 },
  ];
  const wheels = [];
  wheelSpecs.forEach((spec, index) => {
    const holder = new THREE.Group();
    holder.position.set(spec.x, spec.y, -0.046);
    const gear = extrude(
      gearShape(spec.radius, spec.teeth, 0.009, {
        spokes: spec.spokes,
        hub: 0.022,
        inner: 0.045,
      }),
      0.018,
      materials.goldBrushed,
      0.0015,
      64,
    );
    holder.add(gear);
    const arbor = disc(0.014, 0.03, materials.steel, 24);
    arbor.position.z = 0.004;
    holder.add(arbor);
    movement.add(holder);
    wheels.push({ object: gear, speed: spec.speed, direction: spec.direction });
    register(spec.name, holder, {
      delta: [
        spec.x * 1.15 + (index % 2 ? 0.04 : -0.05),
        spec.y * 1.15 + (index % 2 ? -0.04 : 0.04),
        0.04 + index * 0.03,
      ],
      spin: [0.05 * (index + 1), 0.08, 0.1 * spec.direction],
      window: [0.37 + index * 0.012, 0.51 + index * 0.012],
      delay: 0.01,
    });
  });

  // Pallet fork.
  const palletShape = new THREE.Shape();
  palletShape.moveTo(-0.018, -0.03);
  palletShape.lineTo(0.018, -0.03);
  palletShape.lineTo(0.026, 0.06);
  palletShape.lineTo(0.062, 0.082);
  palletShape.lineTo(0.058, 0.098);
  palletShape.lineTo(0.012, 0.086);
  palletShape.lineTo(-0.026, 0.03);
  palletShape.closePath();
  const pallet = extrude(palletShape, 0.012, materials.steel, 0.0012);
  pallet.position.set(-0.02, -0.33, -0.038);
  pallet.rotation.z = -0.9;
  movement.add(pallet);
  register('pallet', pallet, {
    delta: [-0.24, -0.22, 0.1],
    spin: [0, 0, -0.3],
    window: [0.38, 0.54],
  });

  // Balance wheel and hairspring.
  const balanceGroup = new THREE.Group();
  balanceGroup.position.set(-0.32, -0.31, -0.026);
  const balanceWheel = new THREE.Group();
  const balanceRim = ring(0.175, 0.013, materials.gold, 72);
  balanceWheel.add(balanceRim);
  for (let i = 0; i < 3; i += 1) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.166, 0.009), materials.gold);
    spoke.position.y = 0.075;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 3) * Math.PI;
    pivot.add(spoke);
    balanceWheel.add(pivot);
  }
  for (let i = 0; i < 2; i += 1) {
    const screw = disc(0.012, 0.009, materials.goldDeep, 16);
    screw.position.set(Math.cos(i * Math.PI) * 0.157, Math.sin(i * Math.PI) * 0.157, 0.002);
    balanceWheel.add(screw);
  }
  const balanceJewel = disc(0.018, 0.014, materials.ruby, 20);
  balanceJewel.position.z = 0.004;
  balanceWheel.add(balanceJewel);
  balanceGroup.add(balanceWheel);

  const hairspringPoints = [];
  for (let i = 0; i <= 360; i += 1) {
    const t = i / 360;
    const angle = t * TAU * 6.5;
    const radius = 0.024 + t * 0.1;
    hairspringPoints.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.018));
  }
  const hairspring = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hairspringPoints), 620, 0.0017, 4, false),
    materials.blued,
  );
  balanceGroup.add(hairspring);
  movement.add(balanceGroup);
  register('balance', balanceGroup, {
    delta: [0.56, -0.16, 0.2],
    spin: [0.2, -0.15, 0.2],
    window: [0.38, 0.52],
    delay: 0.018,
  });
  anchors.balance = { object: balanceGroup, offset: new THREE.Vector3(0, 0, 0.04) };

  const balanceCock = extrude(
    organicShape(
      [
        [-0.01, 0.015],
        [-0.11, -0.11],
        [-0.26, -0.23],
        [-0.4, -0.22],
        [-0.43, -0.1],
        [-0.34, 0.0],
        [-0.16, 0.04],
      ],
      [[-0.33, -0.12, 0.035]],
    ),
    0.024,
    bridgeMaterial,
    0.003,
    48,
  );
  balanceCock.position.z = -0.014;
  movement.add(balanceCock);
  register('balancecock', balanceCock, {
    delta: [0.18, -0.1, 0.2],
    spin: [0.1, 0.05, 0.15],
    window: [0.37, 0.52],
  });

  // Two skeleton bridges.
  const barrelBridge = extrude(
    organicShape(
      [
        [-0.66, 0.32],
        [-0.56, 0.47],
        [-0.38, 0.53],
        [-0.24, 0.44],
        [-0.22, 0.28],
        [-0.33, 0.16],
        [-0.5, 0.17],
        [-0.64, 0.22],
      ],
      [
        [-0.5, 0.36, 0.072],
        [-0.34, 0.28, 0.035],
      ],
    ),
    0.024,
    bridgeMaterial,
    0.003,
    48,
  );
  barrelBridge.position.z = -0.016;
  const bridgeSignature = new THREE.Mesh(
    new THREE.PlaneGeometry(0.245, 0.077),
    new THREE.MeshBasicMaterial({
      map: createSignatureTexture(),
      transparent: true,
      depthWrite: false,
    }),
  );
  bridgeSignature.position.set(-0.44, 0.355, 0.0155);
  bridgeSignature.rotation.z = 0.12;
  barrelBridge.add(bridgeSignature);
  movement.add(barrelBridge);
  register('barrelbridge', barrelBridge, {
    delta: [-0.28, 0.1, 0.22],
    spin: [0.16, 0.06, 0.1],
    window: [0.37, 0.52],
    delay: 0.006,
  });

  const trainBridge = extrude(
    organicShape(
      [
        [0.04, 0.16],
        [0.2, 0.3],
        [0.4, 0.27],
        [0.47, 0.13],
        [0.43, -0.05],
        [0.33, -0.18],
        [0.17, -0.15],
        [0.08, 0.0],
      ],
      [
        [0.3, 0.11, 0.063],
        [0.38, -0.06, 0.032],
      ],
    ),
    0.024,
    bridgeMaterial,
    0.003,
    48,
  );
  trainBridge.position.z = -0.016;
  movement.add(trainBridge);
  register('trainbridge', trainBridge, {
    delta: [0.26, 0.08, 0.22],
    spin: [0.12, -0.05, -0.1],
    window: [0.38, 0.53],
    delay: 0.008,
  });

  // Jewels and screws on the bridges.
  const jewelPositions = [
    [-0.33, 0.27],
    [0.0, 0.03],
    [0.305, 0.215],
    [0.39, -0.075],
    [-0.33, -0.12],
  ];
  jewelPositions.forEach(([x, y]) => {
    const chaton = ring(0.027, 0.0055, materials.gold, 32);
    chaton.position.set(x, y, 0.005);
    movement.add(chaton);
    const ruby = disc(0.019, 0.012, materials.ruby, 24);
    ruby.position.set(x, y, 0.006);
    movement.add(ruby);
  });

  const screwPositions = [
    [-0.55, 0.24],
    [-0.255, 0.44],
    [0.43, 0.2],
    [0.1, -0.12],
    [0.32, -0.16],
  ];
  screwPositions.forEach(([x, y], index) => {
    const screw = disc(0.024, 0.01, materials.steel, 24);
    screw.position.set(x, y, 0.008);
    movement.add(screw);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.005, 0.004), materials.dialDark);
    slot.position.set(x, y, 0.014);
    slot.rotation.z = index * 0.63;
    movement.add(slot);
  });

  group.add(movement);

  /* ---------------- rotor & case back ---------------- */
  const rotorShape = new THREE.Shape();
  rotorShape.absarc(0, 0, 0.79, 0, Math.PI, false);
  rotorShape.absarc(0, 0, 0.37, Math.PI, 0, true);
  rotorShape.closePath();
  const rotorCut = new THREE.Path();
  rotorCut.absarc(0.3, 0.3, 0.12, 0, TAU, true);
  rotorShape.holes.push(rotorCut);
  const rotorCut2 = new THREE.Path();
  rotorCut2.absarc(-0.3, 0.3, 0.12, 0, TAU, true);
  rotorShape.holes.push(rotorCut2);

  const rotorGroup = new THREE.Group();
  rotorGroup.position.z = -0.108;
  const rotorSpin = new THREE.Group();
  rotorGroup.add(rotorSpin);
  const rotor = extrude(rotorShape, 0.016, rotorMaterial, 0.004, 64);
  rotorSpin.add(rotor);
  const rotorSignature = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.113),
    new THREE.MeshBasicMaterial({
      map: createSignatureTexture(),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  rotorSignature.position.set(0.16, 0.3, 0.013);
  rotorSpin.add(rotorSignature);
  const rotorHub = disc(0.06, 0.03, materials.gold, 40);
  rotorHub.position.z = 0.01;
  rotorSpin.add(rotorHub);
  group.add(rotorGroup);
  register('rotor', rotorGroup, {
    delta: [0.5, -1.55, -1.02],
    spin: [0.06, 0.2, 0.12],
    window: [0.58, 0.78],
    delay: 0.016,
  });
  anchors.rotor = { object: rotorGroup, offset: new THREE.Vector3(0.5, -0.28, 0.02) };

  const casebackGroup = new THREE.Group();
  const casebackProfile = [
    [0.872, -0.132],
    [0.963, -0.134],
    [0.994, -0.152],
    [0.988, -0.188],
    [0.91, -0.195],
    [0.872, -0.174],
    [0.872, -0.132],
  ].map(([radius, z]) => new THREE.Vector2(radius, z));
  const casebackRing = new THREE.Mesh(new THREE.LatheGeometry(casebackProfile, 128), steelDouble);
  casebackRing.rotation.x = Math.PI / 2;
  casebackGroup.add(casebackRing);

  const casebackGlass = new THREE.Mesh(new THREE.CircleGeometry(0.8, 96), materials.glass);
  casebackGlass.position.z = -0.186;
  casebackGlass.rotation.y = Math.PI;
  casebackGlass.renderOrder = 4;
  casebackGroup.add(casebackGlass);

  // The movement's back plate keeps the exhibition back from reading as a void.
  const backMaterial = materials.rhodiumDark.clone();
  backMaterial.roughnessMap = genevaMap;
  backMaterial.roughness = 0.4;
  const backPlate = disc(0.795, 0.012, backMaterial, 96);
  backPlate.position.z = -0.171;
  casebackGroup.add(backPlate);
  const backPlateRing = ring(0.7, 0.0025, materials.steel, 96);
  backPlateRing.position.z = -0.163;
  casebackGroup.add(backPlateRing);
  const backPlateRing2 = ring(0.52, 0.002, materials.steel, 96);
  backPlateRing2.position.z = -0.163;
  casebackGroup.add(backPlateRing2);
  const backSignature = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.1),
    new THREE.MeshBasicMaterial({
      map: createSignatureTexture(),
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  backSignature.position.set(0, -0.36, -0.162);
  casebackGroup.add(backSignature);

  const engraving = new THREE.Mesh(
    new THREE.RingGeometry(0.81, 0.972, 96, 1),
    new THREE.MeshBasicMaterial({
      map: createCasebackTexture(),
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  engraving.position.z = -0.199;
  engraving.rotation.y = Math.PI;
  engraving.renderOrder = 6;
  casebackGroup.add(engraving);

  group.add(casebackGroup);
  register('caseback', casebackGroup, {
    delta: [0.5, -1.55, -1.02],
    spin: [0.1, 0.3, -0.16],
    window: [0.58, 0.78],
    delay: 0.022,
  });

  /* ---------------- crown ---------------- */
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0.995, 0, -0.01);
  const crownStem = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 20), materials.steel);
  crownStem.rotation.z = Math.PI / 2;
  crownStem.position.x = 0.035;
  crownGroup.add(crownStem);

  const crownHead = extrude(gearShape(0.086, 24, 0.008, { spokes: 0, hub: 0 }), 0.092, materials.gold, 0.002);
  crownHead.rotation.y = Math.PI / 2;
  crownHead.position.x = 0.095;
  crownGroup.add(crownHead);

  const crownCap = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 16, 0, TAU, 0, Math.PI / 2), materials.gold);
  crownCap.rotation.z = -Math.PI / 2;
  crownCap.position.x = 0.144;
  crownCap.scale.set(0.35, 1, 1);
  crownGroup.add(crownCap);

  const cabochon = new THREE.Mesh(new THREE.SphereGeometry(0.028, 24, 12), materials.ruby);
  cabochon.position.x = 0.162;
  cabochon.scale.x = 0.5;
  crownGroup.add(cabochon);

  group.add(crownGroup);
  register('crown', crownGroup, {
    delta: [-1.3, -0.02, 0.02],
    spin: [0, 0.5, 0],
    window: [0.55, 0.75],
  });

  /* ---------------- lugs ---------------- */
  function makeLugPair(sign) {
    const pair = new THREE.Group();
    const lugShape = new THREE.Shape();
    lugShape.moveTo(-0.052, 0);
    lugShape.lineTo(-0.064, 0.035);
    lugShape.quadraticCurveTo(-0.068, 0.115, -0.042, 0.142);
    lugShape.lineTo(0.042, 0.142);
    lugShape.quadraticCurveTo(0.068, 0.115, 0.064, 0.035);
    lugShape.lineTo(0.052, 0);
    lugShape.closePath();

    [-0.535, 0.535].forEach((x, index) => {
      const lug = extrude(lugShape, 0.155, materials.steel, 0.01, 24);
      lug.position.set(x, sign * 0.795, -0.05);
      lug.rotation.x = -sign * 0.2;
      lug.rotation.z = sign * (index === 0 ? -0.04 : 0.04);
      lug.rotation.y = index === 0 ? -0.09 : 0.09;
      pair.add(lug);
    });
    pair.position.z = -0.005;
    return pair;
  }

  const lugTop = makeLugPair(1);
  group.add(lugTop);
  register('lugtop', lugTop, {
    delta: [-1.3, 0.02, 0.03],
    spin: [0.08, 0, -0.05],
    window: [0.55, 0.75],
    delay: 0.006,
  });

  const lugBottom = makeLugPair(-1);
  group.add(lugBottom);
  register('lugbottom', lugBottom, {
    delta: [-1.3, -0.02, 0.03],
    spin: [-0.08, 0, 0.05],
    window: [0.55, 0.75],
    delay: 0.012,
  });

  /* ---------------- animation ---------------- */
  function update(t, elapsed) {
    for (const part of parts) {
      const first = smoothstep(part.window[0], part.window[1], t);
      const second = part.lateWindow
        ? smoothstep(part.lateWindow[0], part.lateWindow[1], t)
        : 0;
      const retract = smoothstep(0.815 + part.delay, 0.955 + part.delay, t);
      const hold = 1 - retract;

      part.object.position
        .copy(part.basePosition)
        .addScaledVector(part.delta, first * hold)
        .addScaledVector(part.late, second * hold);

      part.object.rotation.set(
        part.baseRotation.x + (part.spin.x * first + part.lateSpin.x * second) * hold,
        part.baseRotation.y + (part.spin.y * first + part.lateSpin.y * second) * hold,
        part.baseRotation.z + (part.spin.z * first + part.lateSpin.z * second) * hold,
      );
    }

    // Gears turn faster the more exposed they are.
    const exposure = smoothstep(0.24, 0.5, t) * (1 - smoothstep(0.9, 0.99, t));
    wheels.forEach((wheel, index) => {
      wheel.object.rotation.z = wheel.direction * (elapsed * wheel.speed * (0.25 + exposure * 0.9) + index);
    });

    // Balance breathes.
    const amplitude = 0.16 + exposure * 0.26;
    balanceWheel.rotation.z = Math.sin(elapsed * TAU * 2.5) * amplitude;

    // Sweeping seconds; deliberately slowed so the eye can follow it.
    secondSpin.rotation.z = -((elapsed * 0.05) % 1) * TAU;

    // Slow oscillation of the automatic rotor when it is on show.
    rotorSpin.rotation.z = -0.4 + Math.sin(elapsed * 0.4) * (0.25 + exposure * 0.9);
  }

  return {
    group,
    parts,
    anchors,
    update,
    partCount: parts.length,
  };
}
