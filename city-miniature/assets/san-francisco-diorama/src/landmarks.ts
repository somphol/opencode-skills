import * as THREE from "three";
import { Architecture, rect, clipped, type Point } from "./architecture";

/** Square frustum with correct outward normals, authoring convenience for tapered towers. */
function frustum(
  k: Architecture,
  bottom: number,
  top: number,
  y0: number,
  h: number,
  color: string,
  kind: "stone" | "glass" = "stone",
) {
  const g = new THREE.CylinderGeometry(
    Math.max(top, 0.004) * Math.SQRT2,
    bottom * Math.SQRT2,
    h,
    4,
    1,
  );
  g.rotateY(Math.PI / 4);
  k.geometry(g, color, kind, 0, y0 + h / 2, 0);
}

/** Gabled roof prism: a triangle extruded across the building depth. */
function gable(
  k: Architecture,
  w: number,
  d: number,
  y: number,
  h: number,
  color: string,
  x = 0,
) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  k.geometry(g, color, "stone", x, y, 0);
}

/**
 * Transamerica Pyramid: a tapered white shaft rising from a low podium, with the two
 * elevator wings on its flanks and a slender spire. The silhouette reads from any angle.
 */
export function transamerica(k: Architecture, x: number, z: number) {
  k.at(x, z);
  const shell = "#e6e0d2",
    trim = "#f4efe2";
  const podium = rect(1.3, 1.3);
  k.solid(podium, 0, 0.34, "#ded7c8");
  k.windows(podium, 0.04, 0.28, "historic", 0.2, 0.2);
  k.band(podium, 0.34, 0.05, 0.04, trim);
  // Elevator wings: full-height concrete slabs on the east and west faces.
  for (const s of [-1, 1]) {
    k.box(s * 0.58, 1.15, 0, 0.3, 2.3, 1.02, "#d8d2c3");
    for (let y = 0.2; y < 2.2; y += 0.18)
      k.box(s * 0.735, y, 0, 0.02, 0.1, 0.92, "#7d919b", "glass");
    k.box(s * 0.58, 2.31, 0, 0.34, 0.06, 1.06, trim);
  }
  // Main shaft, tapering from the podium shoulder to the observation deck.
  frustum(k, 0.62, 0.2, 0.34, 4.7, shell);
  for (let i = 1; i < 22; i++) {
    const t = i / 22,
      half = 0.62 - t * 0.42,
      y = 0.34 + t * 4.7,
      ring: Point[] = [
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half],
      ];
    k.band(ring, y, 0.03, 0.022, i % 5 === 0 ? "#cfc7b5" : "#8fa5ae", i % 5 === 0 ? "stone" : "window");
  }
  // Vertical mullions on all four faces keep the tower from reading as a plain wedge.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    const a = new THREE.Vector3(sx * 0.16, 5.09, sz * 0.16),
      b = new THREE.Vector3(sx * 0.6, 0.37, sz * 0.6);
    k.beam(a, b, 0.012, "#f1ecdf");
  }
  // Crown: observation deck, the second tapered cap and the antenna mast.
  const deck = rect(0.4, 0.4);
  k.solid(deck, 5.04, 0.07, trim);
  k.band(deck, 5.13, 0.02, 0.03, "#a9b7b4", "metal");
  frustum(k, 0.2, 0.045, 5.11, 0.95, shell);
  k.cylinder(0, 6.2, 0, 0.018, 0.75, "#c7d2cb", "metal", 0.006, 6);
  for (let i = 0; i < 4; i++)
    k.box(0, 6.05 + i * 0.06, 0, 0.055 - i * 0.006, 0.012, 0.055, "#b9c7c1", "metal");
  k.box(0, 0.16, 0.66, 0.42, 0.28, 0.05, "#6f8f98", "glass");
  k.box(0, 0.33, 0.685, 0.5, 0.05, 0.08, trim);
  k.count("Transamerica landmark");
}

/**
 * Salesforce Tower: the tallest shaft in the model, a softly chamfered glass prism with a
 * dense crown of mullions and a lit beacon on top.
 */
export function salesforce(k: Architecture, x: number, z: number) {
  k.at(x, z);
  const levels: [number, number, number, number][] = [
    [1.16, 1.16, 0, 3.5],
    [1.04, 1.04, 3.5, 2.5],
    [0.9, 0.9, 6.0, 0.9],
  ];
  for (const [w, d, b, h] of levels) {
    const p = clipped(w, d, 0.3);
    k.solid(p, b, h, "#93b3bd", "glass");
    for (let y = b + 0.12; y < b + h - 0.06; y += 0.17)
      k.band(p, y, 0.012, 0.016, "#c3d5d5", "metal");
    k.band(p, b + h, 0.03, 0.035, "#d3dfd8", "metal");
  }
  // Curtain-wall mullions: four clustered piers on each chamfered corner.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      for (let i = 0; i < 3; i++)
        k.box(
          sx * (0.56 - i * 0.05),
          3.3,
          sz * (0.56 - i * 0.05),
          0.018,
          6.4,
          0.018,
          "#c9dad8",
          "metal",
        );
  // Crown: open steel lattice and the beacon.
  const crown = clipped(0.86, 0.86, 0.24);
  for (let y = 6.92; y < 7.85; y += 0.19) k.band(crown, y, 0.02, 0.024, "#b9cfce", "metal");
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ])
    k.box(sx * 0.41, 7.4, sz * 0.41, 0.03, 0.95, 0.03, "#cfe0dc", "metal");
  k.solid(rect(0.5, 0.5), 7.86, 0.06, "#c6d8d2", "metal");
  k.cylinder(0, 8.16, 0, 0.075, 0.5, "#dbe8e1", "accent", 0.05, 10);
  k.cylinder(0, 8.62, 0, 0.012, 0.55, "#dbe8e1", "accent", 0.004, 6);
  k.box(0, 0.2, 0.68, 0.5, 0.36, 0.05, "#7fa0aa", "glass");
  k.count("Salesforce landmark");
}

/**
 * Ferry Building: a long arcaded shed on the waterfront with a central clock tower,
 * the northern landmark of the Embarcadero.
 */
export function ferryBuilding(
  k: Architecture,
  x: number,
  z: number,
  yaw = Math.PI / 2,
) {
  k.at(x, z, 0.69, yaw);
  const stone = "#e3d9c4",
    trim = "#f2ead7";
  const shed = rect(0.8, 2.35);
  k.solid(shed, 0, 0.52, stone);
  k.band(shed, 0.52, 0.05, 0.05, trim);
  // Arcade: piers and tall arched glazing along both long faces.
  for (let i = 0; i < 13; i++) {
    const zz = -1.06 + i * 0.177;
    for (const s of [-1, 1]) {
      k.box(s * 0.4, 0.26, zz, 0.07, 0.52, 0.06, trim);
      k.box(s * 0.415, 0.3, zz, 0.02, 0.3, 0.1, "#5f7f88", "glass");
    }
    k.box(0, 0.585, zz, 0.84, 0.03, 0.05, "#cfc3aa");
  }
  // Gabled roof with the continuous skylight.
  gable(k, 0.9, 2.45, 0.6, 0.28, "#b9a98d");
  k.box(0, 0.79, 0, 0.2, 0.04, 2.1, "#8fb0b4", "glass");
  k.box(0, 0.55, 1.2, 0.56, 0.34, 0.06, "#6d8d96", "glass");
  k.box(0, 0.73, 1.22, 0.66, 0.05, 0.08, trim);
  // Clock tower, centered on the north half of the shed.
  const tower = rect(0.42, 0.42);
  k.solid(tower, 0, 1.35, stone);
  for (let y = 0.2; y < 1.3; y += 0.19) k.band(tower, y, 0.02, 0.02, "#cbbfa6");
  for (const s of [-1, 1]) {
    k.box(s * 0.212, 0.72, 0, 0.02, 0.62, 0.28, "#688992", "glass");
    k.box(0, 0.72, s * 0.212, 0.28, 0.62, 0.02, "#688992", "glass");
  }
  k.solid(rect(0.5, 0.5), 1.35, 0.06, trim);
  const clock = rect(0.44, 0.44);
  k.solid(clock, 1.41, 0.34, "#efe7d2");
  for (const s of [-1, 1]) {
    k.box(0, 1.58, s * 0.223, 0.2, 0.2, 0.015, "#f7f2e2");
    k.box(0, 1.58, s * 0.232, 0.012, 0.14, 0.006, "#4c5a58", "metal");
    k.box(0, 1.58, s * 0.232, 0.1, 0.012, 0.006, "#4c5a58", "metal");
    k.box(s * 0.223, 1.58, 0, 0.015, 0.2, 0.2, "#f7f2e2");
  }
  k.band(clock, 1.76, 0.03, 0.03, trim);
  gable(k, 0.5, 0.5, 1.78, 0.3, "#a8b0a2");
  k.cylinder(0, 2.14, 0, 0.018, 0.3, "#c3cdbd", "metal", 0.005, 6);
  k.count("Ferry Building landmark");
}

/**
 * Coit Tower: a fluted concrete cylinder on Telegraph Hill, with an arcaded crown.
 * The hillside is implied by a low planted mound so it sits above the roofline.
 */
export function coitTower(k: Architecture, x: number, z: number) {
  k.at(x, z);
  // Hill mound and the stair that climbs it.
  k.cylinder(0, 0.02, 0, 0.62, 0.34, "#8fa06a", "stone", 0.34, 16);
  k.cylinder(0, 0.2, 0, 0.72, 0.1, "#7d9460", "stone", 0.62, 16);
  k.box(0.5, 0.24, 0.12, 0.5, 0.04, 0.14, "#cdbf9e");
  for (let i = 0; i < 5; i++)
    k.box(0.3 + i * 0.09, 0.27 + i * 0.02, 0.12, 0.07, 0.03, 0.14, "#d6c9a8");
  // Shaft with vertical flutes and the battered base.
  k.cylinder(0, 0.75, 0, 0.24, 0.85, "#ddd6c4", "stone", 0.2, 16);
  k.cylinder(0, 1.9, 0, 0.2, 1.45, "#e5dfcd", "stone", 0.19, 16);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    k.box(Math.cos(a) * 0.2, 1.9, Math.sin(a) * 0.2, 0.018, 1.45, 0.018, "#cfc8b6");
  }
  for (let y = 1.2; y < 2.6; y += 0.36) k.band(rect(0.4, 0.4), y, 0.02, 0.014, "#d3ccb9");
  // Arcaded observation crown: openings between piers under a flat cap.
  k.cylinder(0, 2.72, 0, 0.26, 0.36, "#e8e2d1", "stone", 0.24, 16);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2,
      px = Math.cos(a) * 0.235,
      pz = Math.sin(a) * 0.235;
    k.box(px, 2.72, pz, 0.09, 0.3, 0.09, "#63777a", "glass", -a);
  }
  k.solid(rect(0.56, 0.56), 2.9, 0.06, "#eae4d3");
  k.cylinder(0, 3.0, 0, 0.16, 0.1, "#dfd8c5", "stone", 0.13, 12);
  k.cylinder(0, 3.14, 0, 0.02, 0.22, "#bcc8bd", "metal", 0.006, 6);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    k.cylinder(Math.cos(a) * 0.42, 0.4, Math.sin(a) * 0.42, 0.09, 0.22, "#7f9663", "stone", 0.05, 7);
  }
  k.count("Coit Tower landmark");
}

/**
 * Painted Ladies: the postcard row of six Victorian houses on Alamo Square, each with a
 * bay window, a gabled roof and its own pastel facade.
 */
export function paintedLadies(k: Architecture, x: number, z: number, yaw = 0.16) {
  k.at(x, z, 0.69, yaw);
  const colors = ["#d9a6a0", "#a9c3cf", "#e6cfa4", "#b9c69a", "#c3aecb", "#e2b79a"];
  const trim = "#f6f1e4",
    roof = "#6d6b62";
  for (let i = 0; i < 6; i++) {
    const hx = -0.95 + i * 0.355,
      h = 0.86 + i * 0.035,
      w = 0.33,
      d = 0.52;
    k.solid(rect(w, d), 0, h, colors[i]);
    // Sandstone base, cornice line and the white window surrounds.
    k.solid(rect(w + 0.012, d + 0.012), 0, 0.2, "#d8cdb8");
    k.band(rect(w, d), h - 0.06, 0.03, 0.04, trim);
    k.box(hx, h - 0.02, 0, w + 0.03, 0.04, d + 0.02, trim);
    // Projecting bay window on the upper floor.
    k.box(hx, 0.52, d / 2 + 0.04, w * 0.55, 0.34, 0.1, trim);
    k.box(hx, 0.54, d / 2 + 0.095, w * 0.44, 0.24, 0.02, "#7f97a3", "glass");
    k.box(hx, 0.72, d / 2 + 0.05, w * 0.66, 0.05, 0.16, trim);
    // Ground-floor window and the stoop.
    k.box(hx - 0.06, 0.3, d / 2 + 0.012, w * 0.4, 0.22, 0.02, "#8ba3ad", "glass");
    k.box(hx + 0.1, 0.12, d / 2 + 0.06, 0.09, 0.24, 0.12, "#cfc3ad");
    k.box(hx, 0.11, d / 2 + 0.14, 0.2, 0.04, 0.08, "#d8ccb6");
    // Gable and the small parapet finial.
    gable(k, w + 0.02, d + 0.02, h, 0.26, roof, hx);
    k.box(hx, h + 0.19, d / 2 - 0.02, 0.05, 0.06, 0.05, trim);
  }
  k.count("Painted Ladies landmark");
}

/**
 * San Francisco City Hall: a classical block, a colonnaded portico and the green dome
 * that anchors the Civic Center.
 */
export function cityHall(k: Architecture, x: number, z: number) {
  k.at(x, z);
  const stone = "#e0d8c4",
    trim = "#efe8d6";
  const base = rect(1.55, 1.25);
  k.solid(base, 0, 1.05, stone);
  for (let y = 0.16; y < 1.0; y += 0.17) k.band(base, y, 0.014, 0.012, "#cec5ae");
  k.windows(base, 0.12, 0.9, "historic", 0.2, 0.2);
  k.band(base, 1.05, 0.05, 0.05, trim);
  // Portico: six columns and a pediment on the south face.
  for (let i = 0; i < 6; i++) {
    const cx = -0.55 + i * 0.22;
    k.cylinder(cx, 0.62, 0.72, 0.045, 0.85, "#eae3d0", "stone", 0.045, 8);
    k.box(cx, 0.1, 0.72, 0.12, 0.2, 0.12, trim);
  }
  k.box(0, 1.1, 0.72, 1.4, 0.1, 0.16, trim);
  gable(k, 1.35, 0.16, 1.15, 0.24, trim);
  k.box(0, 0.35, 0.83, 0.38, 0.5, 0.02, "#6d8790", "glass");
  // Drum, colonnade, dome and lantern.
  k.cylinder(0, 1.3, 0, 0.44, 0.34, stone, "stone", 0.44, 20);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    k.box(Math.cos(a) * 0.44, 1.3, Math.sin(a) * 0.44, 0.05, 0.34, 0.05, trim);
  }
  k.cylinder(0, 1.48, 0, 0.5, 0.06, trim, "stone", 0.5, 20);
  const dome = new THREE.SphereGeometry(0.46, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.9, 1);
  k.geometry(dome, "#7fa08f", "stone", 0, 1.51, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    k.beam(
      new THREE.Vector3(0, 1.92, 0),
      new THREE.Vector3(Math.cos(a) * 0.46, 1.51, Math.sin(a) * 0.46),
      0.008,
      "#8fa898",
    );
  }
  k.cylinder(0, 1.98, 0, 0.11, 0.16, "#d8d3bd", "stone", 0.09, 10);
  k.cylinder(0, 2.12, 0, 0.05, 0.14, "#dcc98a", "accent", 0.03, 8);
  k.cylinder(0, 2.24, 0, 0.018, 0.2, "#dcc98a", "accent", 0.006, 6);
  k.count("City Hall landmark");
}

/**
 * Alcatraz: a rocky outcrop in the bay carrying the cellhouse, the lighthouse and the
 * water tower. It sits in open water, so its modelling starts at the waterline.
 */
export function alcatraz(k: Architecture, x: number, z: number) {
  k.at(x, z, 0);
  // Rocks.
  const rock = "#6f6d5e",
    rockLit = "#84816d";
  k.cylinder(0, 0.04, 0, 0.78, 0.18, rock, "stone", 0.7, 9);
  k.cylinder(0.1, 0.12, -0.12, 0.56, 0.16, rockLit, "stone", 0.5, 8);
  k.cylinder(-0.3, 0.1, 0.2, 0.34, 0.14, rock, "stone", 0.3, 7);
  k.cylinder(0.36, 0.08, 0.26, 0.28, 0.1, rockLit, "stone", 0.24, 6);
  // Terrace and the cellhouse.
  const pad = rect(1.15, 0.66);
  k.solid(pad, 0.2, 0.08, "#9a9478");
  const cell = rect(0.92, 0.42);
  k.solid(cell, 0.28, 0.34, "#cfc7b2");
  k.windows(cell, 0.32, 0.28, "historic", 0.12, 0.16);
  k.band(cell, 0.62, 0.02, 0.03, "#e0d8c2");
  k.solid(rect(0.34, 0.36), 0.28, 0.46, "#d6cdb7");
  k.windows(rect(0.34, 0.36), 0.3, 0.4, "deco", 0.1, 0.15);
  // Lighthouse at the northern tip.
  k.cylinder(-0.42, 0.62, -0.24, 0.055, 0.72, "#e7e1cf", "stone", 0.04, 10);
  k.cylinder(-0.42, 1.0, -0.24, 0.085, 0.1, "#f2ecd8", "stone", 0.07, 10);
  k.cylinder(-0.42, 1.07, -0.24, 0.07, 0.07, "#f3df9f", "accent", 0.06, 8);
  k.cylinder(-0.42, 1.12, -0.24, 0.03, 0.06, "#5f6b6a", "metal", 0.02, 6);
  // Water tower on legs, a small guard tower and a few cypress trees.
  for (const [tx, tz] of [
    [0.24, -0.12],
    [0.36, -0.12],
    [0.24, 0.0],
    [0.36, 0.0],
  ])
    k.box(tx, 0.34, tz, 0.018, 0.16, 0.018, "#6a6f63", "metal");
  k.cylinder(0.3, 0.44, -0.06, 0.09, 0.14, "#b9a98a", "stone", 0.09, 10);
  k.cylinder(0.3, 0.52, -0.06, 0.11, 0.03, "#6d7062", "metal", 0.02, 10);
  k.box(-0.2, 0.4, 0.18, 0.1, 0.24, 0.1, "#c9c1ac");
  k.box(-0.2, 0.53, 0.18, 0.14, 0.05, 0.14, "#6d7062", "metal");
  for (const [cx, cz] of [
    [-0.55, 0.14],
    [0.52, 0.1],
    [-0.12, 0.24],
  ])
    k.cylinder(cx, 0.36, cz, 0.07, 0.16, "#5f7a55", "stone", 0.02, 7);
  k.count("Alcatraz landmark");
}

/**
 * Golden Gate Bridge: two orange towers, a deep main span and the catenary cables with
 * their suspenders. The bridge leaves the north tip of the peninsula over open water.
 */
export function goldenGateBridge(
  k: Architecture,
  x: number,
  z: number,
  yaw = Math.PI * 0.72,
) {
  k.at(x, z, 0.69, yaw);
  const orange = "#b8453a",
    orangeDark = "#9c3a31",
    deckY = 0.86,
    span = 2.4,
    towerX = 1.25,
    towerTop = 3.7;
  // Approach viaduct on the city side and the suspended deck across the strait.
  k.box(0, deckY, 0, span * 2, 0.09, 0.52, orangeDark);
  for (const s of [-1, 1]) {
    k.box(0, deckY + 0.09, s * 0.26, span * 2, 0.035, 0.03, "#d8cfae", "metal");
    k.box(0, deckY - 0.1, s * 0.22, span * 2, 0.035, 0.03, orange);
  }
  for (let i = 0; i < 18; i++)
    k.box(-span + 0.14 + i * 0.28, deckY + 0.12, 0, 0.1, 0.008, 0.5, "#e2d6b0");
  // Towers: two legs, three cross braces, and the stepped pier below the deck.
  for (const tx of [-towerX, towerX]) {
    for (const s of [-1, 1])
      k.box(tx, (deckY + towerTop) / 2, s * 0.34, 0.17, towerTop - deckY, 0.16, orange);
    for (const by of [deckY + 0.45, deckY + 1.4, towerTop - 0.16]) {
      k.box(tx, by, 0, 0.2, 0.1, 0.72, orange);
      k.box(tx, by - 0.09, 0, 0.16, 0.03, 0.68, orangeDark);
    }
    for (const s of [-1, 1])
      k.box(tx, 0.1, s * 0.3, 0.42, 1.5, 0.4, "#a9a795");
  }
  // Main cables: a catenary over each tower with a low point at mid-span.
  for (const s of [-1, 1]) {
    const zz = s * 0.34,
      anchors: [number, number][] = [
        [-span, deckY + 0.28],
        [-towerX, towerTop],
        [0, deckY + 0.62],
        [towerX, towerTop],
        [span, deckY + 0.28],
      ];
    let last: THREE.Vector3 | undefined;
    for (let seg = 0; seg < 4; seg++) {
      const [ax, ay] = anchors[seg],
        [bx, by] = anchors[seg + 1],
        sag = seg === 1 || seg === 2 ? 0.5 : 0.14;
      for (let i = 0; i <= 10; i++) {
        const t = i / 10,
          px = ax + (bx - ax) * t,
          py = ay + (by - ay) * t - sag * 4 * t * (1 - t),
          p = new THREE.Vector3(px, py, zz);
        if (last) k.beam(last, p, 0.014, orange);
        last = p;
        if (i % 2 === 0 && py > deckY + 0.12)
          k.beam(
            new THREE.Vector3(px, deckY + 0.12, zz),
            p,
            0.005,
            "#c9805f",
          );
      }
    }
  }
  // Two aviation beacons on the tower tops.
  for (const tx of [-towerX, towerX])
    for (const s of [-1, 1])
      k.box(tx, towerTop + 0.08, s * 0.34, 0.06, 0.05, 0.06, "#ffb15e", "accent");
  k.count("Golden Gate landmark");
}
