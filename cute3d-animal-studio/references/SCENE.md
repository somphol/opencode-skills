# Scene and studio numbers

## Renderer

```js
new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
```

The canvas sits on a CSS gradient backdrop. Never set `scene.background`; it would tint snapshots.

## Camera and controls

| Setting | Value |
| --- | --- |
| Camera | Perspective 34°, near 0.1, far 80 |
| Desktop position | `(0, 2.55, 8.1)` |
| Portrait position | `(0, 2.4, 9.8)` (aspect < 0.85) |
| Target | `(0, 1.48, 0)` |
| Distances | 4.1 – 11.5 |
| Polar | 0.55 – 1.74 rad |
| Damping | 0.055, pan disabled, rotate 0.72, zoom 0.8 |

## Lights

| Light | Setup |
| --- | --- |
| Hemisphere | sky `#fff4ea`, ground `#cabfe8`, intensity 2.35 |
| Key | `#fff0df`, 3.1, `(3.4, 6.4, 4.6)`, castShadow, 2048², radius 4, bias −0.0006, normalBias 0.025 |
| Fill | `#ded4ff`, 1.15, `(−4.5, 3, 2)` |
| Rim | `#ffffff`, 1.35, `(−1, 4.5, −5)` |

Shadow camera: left/right ±4.5, top 5.5, bottom −1.5, near 0.5, far 22.

## Studio props

- Pedestal: cylinder top r 2.25, bottom 2.4, height 0.16 at y −0.085, colour `#f2e4e8`.
- Rim: torus r 2.28, tube 0.02, at y 0.005, white, opacity 0.55.
- Contact shadow: `ShadowMaterial` disc r 1.7 at y 0.002, opacity 0.2.
- Three torus props at x −2.4/0/2.4, y 1.6–2.7, z −2.6…−3.0, pastel, opacity 0.75.

## Snapshot

```js
snapshotCamera = new PerspectiveCamera(30, 1, 0.1, 80);
snapshotCamera.position.set(0, 2.15, 7.15);
snapshotCamera.lookAt(0, 1.55, 0);
```

Hide pedestal, rim, propGroup and sparkles. `scene.background = null`; set pixel ratio 1; size
2048×2048 (`updateStyle = false`); clear alpha 0; render; `toDataURL('image/png')`; restore size,
ratio, clear colour and visibility. Never touch the main camera or controls.

## Framing

Characters stand on y = 0, are ~3.3 units tall and fit within x ±1.1. The stage is at least 380 px tall
on desktop and fills the remaining viewport on mobile. `ResizeObserver` handles size and orientation.

## Coat rendering

- Shells are MeshStandardMaterial with `alphaMap` (canvas strands), `alphaTest` 0.22→0.48 by layer,
  `bumpMap` and `bumpScale` 0.02 (fur) / 0.008 (feather).
- They do not cast shadows, do not write transparency, and render as opaque alpha-tested geometry.
- Soft = 5 layers, Plush = 10; thickness 0.085 fur / 0.045 feather.
- The head and body shells inject object-space discard masks (face, inner ears, belly oval).

## Strand fur pass

- One tapered ribbon geometry (4 rows, ~6 tris), shared; one InstancedMesh per coat zone.
- Roots sampled at `mesh.scale * 1.16`, outside 8 shell layers.
- `STRAND_UNIFORMS`: time, breeze, length, curl, clump, cursor. Vertex shader bends by `h²`; cursor is
  raycast onto plane z = 0.
- Density changes `InstancedMesh.count`; never rebuild geometry on slider input.
- Two-row fur studio: base `Coat` (Smooth/Soft/Plush) is universal; koala-only `Outer coat` is
  None/Pelt/Velvet/VFX.
- Pelt strand material is opaque, `depthWrite:true`, tinted toward the main role colour, root-to-tip
  vertex shading, tangent-plane flow.
- Velvet is a 1.018 cushion + 24 light shells + sheen; no micro-strand blizzard.
- Shells, cushions and strand InstancedMeshes are children of the source mesh. VFX roots are local at
  1.008; the ribbon starts inside the skin. Never parent to `mesh.parent` or use 1.2× roots.
- Koala VFX: no decorative shells; a dark undercoat per zone plus ~133k strands (190k target) with
  uniform random sphere roots, per-instance normal/seed/tint/role/guard/clump, and a custom Kajiya–Kay
  shader. VFX is disabled for other animals and falls back to Pelt.
- Max 100k at density 1/Plush; ~45k at Soft. Other animals are shell-only.
- `STRAND_UNIFORMS` keys must match the GLSL exactly: `uTime`, `uBreeze`, `uLength`, `uCurl`, `uClump`,
  `uCursor`. A name mismatch silently leaves them zero and collapses the coat into dots.
- Shell wind gain is tiny (`0.008` feather, `0.025` fur); the visible wind lives in the koala strands.

## Lighting presets

| Preset | Lights | Props |
| --- | --- | --- |
| Studio | warm key, cream/lilac backdrop | pedestal |
| Cloud Sky | cool hemisphere, blue backdrop | four drifting cloud clusters |
| Cozy Desk | amber key, higher exposure | wooden table, mug, plant, books |

`applyLighting()` owns colors, exposure, pedestal/desk/cloud visibility and `body[data-lighting]`.


## Wind fan

- Procedural fan: base, stand, cage ring, mint blades, rose hub, scale 1.25.
- Drag the fan on the ground plane; clamp radius 1.5–2.2 around the pet.
- `fanAngle` persists; wind direction = fan head → pet centre.
- Shell fur displaces by layer², gusts, flattens windward, arc-corrects by stiffness.
- Hidden in transparent snapshots.
