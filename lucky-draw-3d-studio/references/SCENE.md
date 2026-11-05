# Scene and wheel geometry

## Constants that work

| Value | Setting |
| --- | --- |
| Wheel radius | `R = 3.05` |
| Thickness | `THICK = 0.34` |
| Wheel centre | `(0, 3.35, 0)` |
| Camera home | `(0.9, 4.65, 14)`, target `(0, 3.35, 0)` |
| FOV | 36 wide, 42 narrow, 50 portrait (aspect thresholds 1.15 / 0.82) |
| Face canvas | 2048², wheel radius `0.918 × 1024` |
| Pointer pivot | `y = 3.35 + R + 0.72` |
| Peg radius | `R + 0.115` |
| Arc band radius | `R + 0.006` |
| Face z | `THICK / 2 + 0.004` |
| Camera limits | distance 6–19, polar 0.55–1.78 rad |

## Build order

1. Renderer: antialias, DPR ≤2, PCFSoft, ACES exposure ~1.02, sRGB.
2. `RoomEnvironment` → `PMREMGenerator` → `scene.environment`.
3. Materials: gold (metalness .95/roughness .22), chrome (.18), dark metal, body metal, pointer red.
4. Floor circle and halo ring.
5. Hemisphere + directional key (shadow 2048², bias −0.00025) + teal, warm and blue point lights.
6. Stand: base cylinder, top disc, gold ring, column, face plate, axle, two cheeks, small uplight.
7. Wheel: cylinder body (160 segments, rotated x = π/2), face circle, back plate, front gold torus,
   back chrome torus, front/back bevels, rim group, peg group, hub.
8. Pointer: pivot group, mount, arm, four-sided cone, tip sphere.
9. `setRoster(entries, lang)` → face texture + rim rebuild.
10. Animation loop.

## Face texture

```js
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 2048;
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
```

Draw:

- dark base, eight-colour palette, alternate a 14% darker mix;
- radial slice paths from centre with a 3–5 px dark separator;
- per-slice linear highlight (9% white → transparent → 20% black);
- 12 px gold outer stroke and a faint inner ring;
- labels: tangential ≤8, radial >8, font auto-shrink, ellipsis truncation;
- dark centre disc under the 3D hub.

Materials on the face: `MeshStandardMaterial({map, roughness: .56, metalness: .06})`.

## Rim

Do **not** use tangential boxes sized to the chord; corners protrude for small rosters. Use:

```js
new THREE.CylinderGeometry(
  R + 0.006, R + 0.006, THICK * 0.9,
  24, 1, true,
  Math.PI / 2 - (i + 1) * step + 0.004,
  step - 0.008
)
```

Rotate the mesh `x = π/2`. One material per slice, `DoubleSide`, slight emissive. Dispose geometry and
materials when rebuilding.

Pegs: gold sphere at `(cos θ · (R+.115), −sin θ · (R+.115), THICK/2+.035)` plus a chrome pin cylinder
rotated `x = π/2`. One per boundary.

## Labels

- Tangential: `rotate(mid + π/2); translate(0, -labelRadius);` at `0.63R`. Flip when
  `cos(restRotation − mid − π/2) < 0`.
- Radial: `rotate(mid); translate(labelRadius, 0);` at `0.60R`. Flip when
  `cos(restRotation − mid) < 0`.
- Pass `restRotation = wheel.rotation.z`; after a spin call `refreshLabels()` so the resting wheel
  reads correctly.
- Font: `700 Npx "Inter", "Noto Sans Thai", "Thonburi", sans-serif`; shrink until the text fits the
  chord (tangential) or 52% of the radius (radial); truncate with `…`.

## Pointer

Pivot above the rim; cone points down; tip just above the wheel edge. The spring lives in the render
loop (see [FAIRNESS.md](FAIRNESS.md)). Add a small static mount so it reads as attached.

## Lighting

- One directional key at `(5,9.5,7.5)`, intensity ~2.35, warm.
- Teal point left, warm point right, blue point behind.
- Low hemisphere. ACES + PMREM make the metals read.
- Floor receives; wheel, stand and pegs cast.

## Common visual failures

- **Giant planks outside the rim** → boxes instead of arc bands.
- **Mirrored text** → cylinder cap texture, or wrong flip sign.
- **Wheel too small / clipping** → fixed FOV; adjust by aspect.
- **Dark ring too thick** → face circle radius too small or bevel radius wrong.
- **Spin button covers the stand** → reduce camera distance or accept as HUD; check mobile.
- **Hint text over a label** → move the hint to a stage corner, hide on mobile.
