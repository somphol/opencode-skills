# Scene reference

## Renderer and camera

```js
renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

- Camera: `PerspectiveCamera(36, aspect, 0.1, 80)`, position `(0, 3.3, 10.6)`, target `(0, 2.55, 0)`.
  Narrow screens: fov 45, z 13.4.
- OrbitControls: damping 0.055, distance 6.2–15, polar 1.02–1.62, azimuth ±0.62, pan disabled.
- Cinematic intro: 1.8 s cubic lerp from `(0.2, 4.6, 15.8)` to the framing position. Skip for
  `prefers-reduced-motion` and `?shot=1`.

## Post

```js
composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.30, 0.58, 0.90);
composer.addPass(bloom);
composer.addPass(new OutputPass());
```

Exposure, bloom and chrome intensity are the three values that cause "white cabinet" regressions.
Reference: exposure 0.82, bloom 0.30, chrome `color 0xb9c2d0`, metalness 0.96, roughness 0.19,
envMapIntensity 0.82.

## Environment

- Wall: 38×18 plane at `z=-5.2`, canvas gradient + art-deco sunburst + 90 dust dots. `MeshBasicMaterial`.
- Floor: 42×30 plane, procedural speckle texture repeated 6×, metalness 0.38, roughness 0.62.
- Rug: 3.9 radius circle with radial gradient canvas, `depthWrite:false`.
- Dust: 260 `Points`, additive, opacity 0.32.
- Lights: hemisphere 0.42, warm spot 26 (shadows, 1024²), rose point 9, teal point 7, top point 10.
- PMREM from `new RoomEnvironment()` once; reuse for every chrome/brass material.

## Cabinet coordinates (world units)

| Part | Geometry | Position |
| --- | --- | --- |
| Plinth | Box 3.6×0.42×1.66 | y 0.21 |
| Body | Box 3.4×2.0×1.5 | y 1.36 |
| Arch | Extruded shape, radius 1.7, depth 1.5, bevel 0.055 | y 2.36, z −0.75 |
| Arch top | radius + 0.18 + 1.7 | y 4.24 |
| Front inlay | Box 3.16×1.86×0.07 | y 1.35, z 0.755 |
| Record deck | platter r 0.73, vinyl r 0.62 | y 3.05, z 0.82 |
| Title rack | backing 2.66×0.98×0.06 | y 1.76, z 0.79 |
| 8 strips | Plane 1.2×0.2 | x ±0.64, y 2.04…1.395, z 0.833 |
| Keypad letters | r 0.072 caps | y 1.02 |
| Keypad numbers | r 0.072 caps | y 0.82 |
| Grille | Plane 2.5×0.3 | y 0.55, z 0.793 |
| Coin plate | Box 0.34×0.5×0.055 | x 1.5, y 1.55 |
| Sign | Plane 2.9×0.72 | y 4.5, z 0.5 |
| Bulbs | 30 spheres r 0.03 | radius 1.83 around arch |

Arch shape:

```js
shape.moveTo(-1.7, 0);
shape.lineTo(-1.7, 0.18);
shape.absarc(0, 0.18, 1.7, Math.PI, 0, true);
shape.lineTo(1.7, 0);
shape.closePath();
```

## Bubble tubes

- Two Catmull-Rom curves, 8 control points each, from `(±1.535, 0.78, 0.815)` up and over to
  `(0, 4.06, 0.815)`.
- Glass: `TubeGeometry(curve, 120, 0.105, 12)` with `MeshPhysicalMaterial` opacity 0.13, roughness
  0.04, envMapIntensity 1.6, `depthWrite:false`.
- Core: `TubeGeometry(curve, 80, 0.05, 8)` with `MeshBasicMaterial` HSL-shifting color, opacity 0.55.
- 22 bubbles per side, sphere r 0.038, scale 0.8–2.15. Each has `{mesh, curve, offset, speed, mat,
  side}`. Per frame: `offset = (offset + dt * speed * (playing ? 2.2 : 0.7)) % 1`, then
  `curve.getPointAt(offset)`, tiny x wobble, HSL color and opacity pulse.

## Paper strips

`makePaperTexture(track, slot, lang)` draws at 600×110:

- cream gradient `#efe2c9 → #d9c39f`;
- 40 random sepia lines for paper grain;
- border `rgba(88,60,32,.22)`, dashed separator at x 94;
- red slot number (`#8e3b22`, 30 px mono) and engine label;
- title 23 px serif (Thai: 22 px Noto Sans Thai), artist 11 px;
- `★ MUSIC BOX` or `★ VINTAGE 78`;
- empty slots: italic “Empty slot · reserved”.

Material must be `MeshBasicMaterial({ map, color: 0xd8ccb8, toneMapped: true })`. A standard material
turns the paper into a white light panel.

## Raycasting

- Push strip meshes, key groups and the coin group into `this.interactive` with `userData.type`.
- On pointerup, ignore if the pointer moved more than 7 px (orbit drag).
- `findData(object)` walks parents until it finds `userData.type`.
- `pressKey` moves the group from z 0.84 to 0.815 for 110 ms.
- `flashStrip` tints the material; use `material.color` for the unlit paper, not `emissive`.

## Motion loop

1. clamp `dt` to 0.05;
2. intro lerp;
3. controls update;
4. record `rotation.z -= dt * (playing ? 3.6 : 0.08)`;
5. tone arm lerp to −0.62 rad (playing) or 0.36 (idle);
6. bubbles, color cores, bulbs (`0.4 + energy*1.2 + sin`);
7. dim lerp: lights × `(1 - dim*0.86)`, bloom × same, sign opacity;
8. coin: y from 2.28 to 1.58 with `p*p`, spin, shrink after 82%;
9. composer render.

Analyser RMS arrives through `scene.setEnergy()` every 180 ms; smooth it again in the scene.
