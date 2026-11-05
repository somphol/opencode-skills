# Scene and interaction

This is the Three.js layer: a recessed tray, 15 bevel-edged tiles, procedural skins, a bounded orbit
camera, pointer raycasting and promise-based motion. The reference implementation is
`assets/reference/script.js`, section 4.

## Constants

```js
const BASE_FOV = 33;
const TILE = 1.78;
const GAP = 0.07;
const CELL = TILE + GAP;          // 1.85
const TILE_H = 0.29;
const WELL_HALF = (CELL * 4) / 2 + 0.16; // 3.86

const CAMERA_HOME = new THREE.Vector3(4.7, 14.4, 12.8);
const CAMERA_TOP  = new THREE.Vector3(0.001, 17.2, 0.001);
```

Use these unless you deliberately redesign the object; the texture slicing, gap outline and camera
framing all assume them.

## Renderer

```js
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
```

`alpha: true` lets the CSS studio gradient show through; the scene has no background color. Add a
`RoomEnvironment` PMREM for believable metal/wood reflections:

```js
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
```

## Tray

- Base: `RoundedBoxGeometry(8.9, 0.52, 8.9, 4, 0.2)` at `y=-0.3`, wood canvas texture, receive +
  cast shadow.
- Well: `BoxGeometry(7.6, 0.06, 7.6)` at `y=0.02`, near-black felt, roughness .96.
- Rails: two `8.9 × 0.42 × 0.62` and two `0.62 × 0.42 × 7.66` rounded boxes at `±4.14`, `y=0.16`.
- Inlay: thin gold boxes at `±(WELL_HALF − 0.09)` inside the well edge. Keep them outside the
  playable grid (half-width `3.7`) or they show through the gap.
- Screws: four small metal cylinders at the corners (`0.085` radius, `y=0.39`).
- Gap marker: a `LineLoop` rounded square, half-size `TILE*0.34`, gold, at `y=0.062`, opacity
  breathing on a 2.4s sine. A ring reads as a token; a tile-shaped outline reads as an empty slot.

Shadow catcher: a large circle with `ShadowMaterial({opacity:.42})` at `y=-0.62`. This keeps the CSS
background visible instead of a flat plane.

## Tiles

Each tile is a group of two meshes:

```js
const body = new THREE.Mesh(
  new RoundedBoxGeometry(TILE, TILE_H, TILE, 3, 0.075),
  new THREE.MeshStandardMaterial({ color: base, roughness: .42, metalness: .18 })
);
const face = new THREE.Mesh(
  new THREE.PlaneGeometry(TILE * 0.88, TILE * 0.88),
  new THREE.MeshStandardMaterial({ map: texture, roughness: .46, metalness: .08 })
);
face.rotation.x = -Math.PI / 2;        // +y facing
face.position.y = TILE_H / 2 + 0.003;
group.position.y = 0.055 + TILE_H / 2; // sits on the felt
```

Why a separate face plane: it keeps numerals crisp and lets skins swap a map without rebuilding
geometry. Cast/receive shadows on the body only.

Keep per-tile materials unique so in-place glow and hint pulses can differ per tile. Share geometry
across all 15.

## Skins

Generate 512² canvases, cache by `${skin}:${value}`.

- **classic**: ivory gradient, double border, 250px serif numeral.
- **wood**: seeded LCG grain (90 wavy strokes, 18 knots), warm scrim, dark numeral.
- **marble**: 22 vein walks, radial highlights, slate numeral.
- **custom**: cover-crop the uploaded image to a square, then draw slice `value−1` from the 4×4
  grid; add a dark corner badge with the number.

```js
function fitCover(source, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const scale = Math.max(size / source.width, size / source.height);
  const w = source.width * scale, h = source.height * scale;
  ctx.drawImage(source, (size - w) / 2, (size - h) / 2, w, h);
  return c;
}
```

Use `createImageBitmap(file)` for uploads and dispose `custom:*` textures when replacing. Set
`colorSpace = SRGBColorSpace` and anisotropy ≤ 8 on every texture.

## Camera and controls

```js
const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 120);
camera.position.copy(CAMERA_HOME);

controls.target.set(0, 0.05, 0.05);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 10.5;
controls.maxDistance = 26;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = Math.PI * 0.44; // never go under the tray
```

Clamp the target to ±2.2 in x/z and −0.4…1.4 in y so panning cannot lose the board.

### Portrait FOV

```js
function resize() {
  const rect = stage.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  const reference = 1.15;
  camera.fov = camera.aspect < reference
    ? clamp(2 * Math.atan(Math.tan(degToRad(BASE_FOV) / 2) * reference / camera.aspect) * 180 / Math.PI, BASE_FOV, 60)
    : BASE_FOV;
  camera.updateProjectionMatrix();
  drawHintArrow();
}
```

This keeps horizontal coverage roughly constant. Without it a 390px phone crops both sides of the
tray. Do not solve it by moving the camera; that fights zoom and orbit state.

## Motion

Promises + a tween list driven by the render loop:

```js
const tweens = [];
function tween(duration, onUpdate) {
  return new Promise((resolve) => {
    tweens.push({ start: performance.now(), duration, onUpdate, resolve });
  });
}
function stepTweens(now) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    const u = Math.min(1, (now - tw.start) / tw.duration);
    tw.onUpdate?.(u);
    if (u >= 1) { tweens.splice(i, 1); tw.resolve(); }
  }
}
```

`slideTile()`: 172ms (118ms auto), `easeInOutCubic`, a `sin(πu)` lift of 0.06 and a small tilt, then
snap to the target cell, play a thud and refresh in-place glow. Sound starts on the first slide.

Camera presets use the same tween, disable controls during the flight and re-enable them after.

## Raycasting

```js
function pickTile(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(tileGroup.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && obj !== tileGroup) {
      if (obj.userData?.value) return obj.userData.value;
      obj = obj.parent;
    }
  }
  return null;
}
```

Accept a click only if `pointerup` moved less than 7px from `pointerdown`, otherwise orbiting would
slide tiles. Throttle hover raycasts to ~18Hz. The self-test/browser suite projects a tile position
through the camera and dispatches a real click — that is the only way to catch an offset raycast.

## Hint arrow

Project tile and gap centres at `y=0.42`:

```js
const v = new THREE.Vector3(x, 0.42, z).project(camera);
const sx = ((v.x + 1) / 2) * rect.width;
const sy = ((1 - v.y) / 2) * rect.height;
```

Draw an SVG quadratic curve bowed 24% of the distance, dashed teal with a drop shadow, a circled tile
number, and an arrowhead at the gap (`translate(gap) rotate(atan2(dy,dx))`). Redraw on orbit
change/resize/language switch; clear on any move.

## Audio

Synthesize, never fetch:

- slide: short bandpassed noise + triangle 320→190Hz
- thud: sine 150→62Hz + low noise
- hint: two rising sines
- win: five triangle notes (523/659/784/1047/1318Hz) with sub-octave sines

Create the `AudioContext` lazily on the first user gesture; resume it if suspended.

## Performance checklist

- 15 tiles, one geometry, 2048 shadow map, DPR ≤ 2.
- Textures generated once per skin; dispose when replaced.
- No per-tile timers; one animation loop.
- Terminate the solver worker on stop to release memory.
