# Performance

## Budget

The scene is one cabinet, one room, ~50 textures and a restrained composer. The library holds 50
synth note arrays and 32 archive URLs; only one sequence or stream is active at a time, so track
count does not affect frame time. Loading 50 arrays adds ~14 KB of source, parsed once at boot. It targets 60 fps on an
M1-class laptop and 30–60 fps on a modern phone. There is no network streaming of models.

## Renderer settings

- `setPixelRatio(min(devicePixelRatio, 2))` — avoids 3×/4× fill cost on phones.
- ACES filmic tone mapping, sRGB output, PCF soft shadows (one 1024² map).
- `UnrealBloomPass` at strength 0.30, threshold 0.90; composer size follows the viewport.
- `RoomEnvironment` is baked once through PMREM; the texture is reused by every chrome/brass material.
- Only the warm spot casts shadows. The four point lights do not.
- Geometry is low-poly: tubes 80–120 segments, spheres 10–12, cylinders 24–64, one 260-point dust cloud.

## Textures

- Wood, backdrop, floor, rug, sign, grille, key caps and eight paper strips are generated on canvases
  at load or on language change. They are `CanvasTexture`, sRGB-tagged and use the renderer's max
  anisotropy.
- Paper textures are 600×110; the sign is 1024×256; the backdrop 1024×512. Total texture memory is
  modest compared with a single 4K PBR set.
- Refreshing the rack on a language change disposes the old map/material/geometry before rebuilding.

## Frame loop

`requestAnimationFrame` via `renderer.setAnimationLoop`:

1. clamp delta to 50 ms (tab-switch protection),
2. intro lerp (skipped when done),
3. controls update,
4. record spin, tone-arm lerp,
5. bubble curve sampling (44 `getPointAt` calls),
6. color/bulb updates,
7. light dim lerp,
8. coin animation,
9. composer render.

No allocations are created per frame except the raycaster hits on pointer events and a `Uint8Array`
in the analyser at 180 ms. The audio scheduler runs at 35 ms with a 280 ms look-ahead.

## Known hot spots

- UnrealBloom is the most expensive pass on integrated GPUs. If needed, lower `strength` or skip the
  pass behind a quality flag; do not remove the OutputPass.
- 44 bubble meshes are individual draw calls. Instancing would help low-end phones, but the current
  count is well under the threshold where it matters for this scene.
- Canvas text rendering is the slowest load step; it happens once (and on language changes).
- `backdrop-filter: blur` on three panels is compositor work; mobile sheets reduce the visible area.

## Measuring

Use Chrome DevTools → Performance, capture 5 s while playing. Look for:

- frame time under 16.7 ms at 1600×1000 on DPR 1;
- no long tasks after load;
- `AudioContext.currentTime` advancing smoothly;
- no texture uploads after the first language switch.

For a reproducible render, run `node scripts/screenshot.mjs` and compare file sizes; a sudden jump
usually means bloom or exposure changed.
