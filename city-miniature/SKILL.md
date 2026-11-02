---
name: City Miniature
description: Build or adapt an interactive 3D miniature of a city as one offline HTML file — street grid, landmarks, traffic, day/night, bilingual UI — starting from a working San Francisco diorama template.
version: 1.0.0
---

# City Miniature

Turn a city into one interactive Three.js diorama: a road-first street plan, blocks filled with
building parcels, dedicated landmark models, traffic and boats on a floating tray, day and night
lighting, and a landmark bar with camera flights. The result is a single self-contained HTML file.

`assets/san-francisco-diorama` is a working city, not a placeholder: a compressed San Francisco
peninsula with a rotated downtown grid, Market Street cutting across it, eight landmarks (Golden
Gate Bridge, Transamerica Pyramid, Salesforce Tower, Ferry Building, Coit Tower, Painted Ladies,
City Hall, Alcatraz), Golden Gate Park, the Presidio, bay piers and 200+ street parcels.
`results/san-francisco-diorama/index.html` is the published single-file build of that template.

## When to use

- A browsable miniature of a city or district with a handful of landmarks, for a launch page, a
  brand piece, a demo or an embed.
- Adapting the template's mechanism (road graph first, then blocks, then parcels) to another place.
- Not for measured maps, GIS data, navigation or photo-to-3D reconstruction. The geography is
  deliberately compressed.

## Workflow

1. **Scaffold**: `node scripts/new-project.mjs --out my-miniature`, then `npm ci`.
2. **Read the template before changing it**: `references/method.md` maps every module and states the
   invariants. `references/lessons.md` lists the details most likely to regress.
3. **Change geography, landmarks and copy together** — outline, street frame, landmark anchors,
   `landmarkViews`, `i18n/strings.json`, and the expected targets in `scripts/shoot.mjs`. A new city
   with old coordinates reads as a reskin.
4. **Iterate with `npm run dev`**, then `npm run build:single` (one offline HTML file).
5. **Verify** with `node tests/run.mjs` and `node scripts/verify.mjs` (see `references/verification.md`).
6. **Publish**: `references/hosting.md` — the file works unchanged on GitHub Pages.

```sh
node scripts/new-project.mjs --out ~/my-miniature
cd ~/my-miniature && npm ci
npm run dev            # live editing
npm run build:single   # -> dist-single/index.html
node tests/run.mjs     # geometry, traffic, planning, diversity (no browser)
node scripts/verify.mjs # driven interactions in headless Chrome
```

## Module map

- `src/urbanPlan.ts` — reserved sites, rotated street grid, planar road graph, block faces, parcels
- `src/city.ts` — outline, tray, landmark anchors/views, scene assembly, camera API, day/night
- `src/landmarks.ts` — the eight dedicated landmark models
- `src/architecture.ts` — instanced facade geometry, materials, `roofKit`, LOD, night emission
- `src/archetypes.ts`, `newArchetypes.ts`, `aiProfiles.ts` — the ten ordinary building families
- `src/urbanEnvironment.ts` — roads, sidewalks, signals, parks, shoreline, piers, water shader
- `src/cityLife.ts`, `models.ts` — traffic, pedestrians, boats, bridge traffic
- `src/cameraSafety.ts` — keeps the camera out of buildings
- `src/App.tsx`, `style.css`, `i18n/strings.json` — controls, layouts, copy in English and Chinese
- `src/capture.tsx` — `window.__scene`: inspect, act, step, script, cover cues

## Adaptation recipes

**A new outline.** Replace the polygon in `city.ts` and the copy in `tests/planning.ts`. The island
is about 7 units wide and 31 long; keep the aspect if you want the same framing.

**A rotated grid.** `urbanPlan.ts` builds streets as lines in a rotated frame (`angle`), clipped to
the outline by sampling, then split into small chords. Chords must stay short or they leave the
peninsula and the route fails. Add one diagonal (Market Street) and one waterfront road
(Embarcadero) as explicit polylines.

**Filling diagonal blocks.** Parcels are axis-aligned boxes placed from each block's bounding box, and
they shrink (scales 1, .85, .7, .55) until their four corners clear the block edge. Axis-aligned
buildings need a larger margin from diagonal streets — that is why parcels use the block-local
frame only for placement, with `rot: 0`.

**Landmarks.** Each model is authored in local space through the `Architecture` helpers (`solid`,
`box`, `cylinder`, `beam`, `geometry`, `windows`, `band`). Landmark anchors, view offsets and the
`LANDMARKS` table in `shoot.mjs` must agree, or the camera flies to the wrong place.

**Vehicle lanes on a landmark.** Never hardcode world lanes for traffic that belongs to a rotated
landmark. Derive the lane from the anchor and yaw:

```js
const bx = Math.cos(yaw), bz = -Math.sin(yaw)  // local +x in world
const nx = Math.sin(yaw), nz = Math.cos(yaw)   // local +z in world
p.set(anchor.x + bx * lx + nx * lz, deckY, anchor.z + bz * lx + nz * lz)
```

**Roofs.** San Francisco roofs are flat: use `roofKit()` (penthouse, skylight, solar array, vents),
not the New York `waterTank()`. Pick roof details that match the city you are modelling.

## Verification

`node tests/run.mjs` bundles the tests with Vite and runs them without a browser: landmark
envelopes, ten building families, a connected road graph, signal stops, camera collision, parcel
containment and non-overlap.

`node scripts/verify.mjs` drives the built file in headless Chrome in capture mode, advancing
virtual time, so results do not depend on frame rate: eight landmark flights, day/night, reset,
zoom, orbit, pan, rotate, scene facts, both locales and the 345×345 embed.

`npm run shoot` is the deeper original harness (pixel diffs, layout sandbox, fps). It needs a real
GPU: under software rendering (SwiftShader) the scene runs at ~2.5 fps and its wall-clock
interactions time out, which is an environment limit, not a scene defect. Use `SHOOT_ANGLE` to pick
the ANGLE backend.

## Failure boundaries

- Geography is compressed and interpretive; positions and scales are not survey data.
- `shoot` and `record` need Node 22.4+ and Chrome; `record` also needs FFmpeg.
- Phone behaviour was verified under touch emulation in headless Chrome only.
- Missing WebGL 2 shows a localized message.

## Provenance

The template derives from the Manhattan Miniature 0.2.0 sample by SandBase Lab. Reused mechanism
versus new work, and the licence status, are documented in [ATTRIBUTION.md](ATTRIBUTION.md) next to
this file. The original brand mark is not redistributed.

## Known rough edges in the template

- The bridge's city end stops above the Presidio without an approach viaduct.
- Blocks lost to a failed street route stay empty rather than being backfilled.
- `shoot` cannot pass on machines without GPU-backed headless Chrome.
