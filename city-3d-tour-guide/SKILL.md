---
name: City 3D Tour Guide
description: Build a bilingual, static Three.js city tourist guide with five procedural landmarks, drone/walk/transit modes, drag-look controls, lighting, spatial audio, JSON persistence, verification and a professional release.
version: 1.0.0
---

# City 3D Tour Guide

Build a complete, static **tourist guide** for a city: a compressed low-poly diorama, five authored
landmarks, a guide drawer in two languages, drone / walking / transit camera modes, three lighting
presets, synthesised audio, local progress and a portable JSON itinerary — in three files, with no
build step.

The working reference is the finished **Bangkok 3D** project in `assets/bangkok-3d-tour-guide/`:
Wat Arun, Wat Pho, Grand Palace, Golden Mount and Baiyoke Tower II around the Chao Phraya.

## The rule: a new city is authored, not reskinned

The asset is a **working reference for Bangkok** and a scaffold for reproducing/continuing it. For a
different city, do **not** copy Bangkok’s coordinates, landmark ids, route, palette or Thai/English copy
and rename things. That inherits the old geography and fails the definition of done. Re-author the city
brief, geography, landmarks, route, copy, tests and screenshots together. Read
[references/city-brief.md](references/city-brief.md).

## When to use

- A city or district needs a browsable 3D tourist guide with 4–6 landmark stories, not just a skyline.
- The output must be static, bilingual, accessible on touch, and run from GitHub Pages or `file://`.
- You need three camera experiences: orbit drone, first-person street walk and an automated tour.
- You want persisted itineraries, JSON export/import, and a release that another agent can maintain.
- Not for measured maps/GIS, live travel data, booking, photoreal scans or a general city editor.
  For a pure miniature without the guide/audio/persistence layer, use `city-miniature` instead.

## Quick start

```sh
node scripts/new-project.mjs --out ~/Projects/bangkok-3d-tour-guide
cd ~/Projects/bangkok-3d-tour-guide

python3 -m http.server 8000
open http://127.0.0.1:8000/
open 'http://127.0.0.1:8000/?selftest=1'
```

The scaffold copies the Bangkok reference, which runs immediately. No npm install, package manager or
build is required. Verify the copy:

```sh
node ~/.config/opencode/skills/city-3d-tour-guide/scripts/check.mjs --project .
```

Expected: **17 / 17** static scaffold checks, plus **24 / 24** in the browser self-test.

## Workflow

1. **Write the city brief.** Copy [references/city-brief.md](references/city-brief.md) to `CITY.md`.
   Choose the water/road axis, 5 landmarks with distinct silhouettes, the local language, transit
   mode, palette and 8–12 verified visitor facts.
2. **Scaffold or continue.** Use `new-project.mjs` for a fresh copy of the working reference, or work
   directly in the Bangkok repository when the task is Bangkok.
3. **Replace geography and landmarks together.** Update `world`, road arrays, landmark positions,
   plaza radii, marker heights, fly-to views, tour curve/stops and the city-specific copy. Never leave
   a Bangkok coordinate under a new city name.
4. **Build the world in the documented order.** Renderer/materials → sky/lights → ground/river/roads →
   landmarks/markers → blocks/trees/traffic → controls/tour → UI → persistence/audio → self-test.
5. **Respect the controls contract.** Drag-to-look (no pointer lock), inverted horizontal walk drag,
   on-screen arrow pad + arrow keys + optional WASD, scroll zoom, focus restoration, marker-only walk
   picking. See [references/method.md](references/method.md) and
   [references/lessons.md](references/lessons.md).
6. **Write both languages before the UI grows.** Every UI key and landmark field exists in both
   languages; stories have three paragraphs, a fact and five visitor tips.
7. **Verify in layers.** Static syntax/scaffold check, in-page self-test, real focused browser flows,
   mobile layout, export/import. See [references/verification.md](references/verification.md).
8. **Make the release look professional.** Ship README, AGENTS, CHANGELOG, CONTRIBUTING, SECURITY,
   PRIVACY, SUPPORT, LICENSE, notices, handoff, requirements, code map, architecture, controls, data,
   testing, deployment, release checklist, accessibility, performance, browser support, design,
   gallery, glossary, FAQ, roadmap, state and CITATION. See
   [references/release-docs.md](references/release-docs.md).
9. **Publish.** Pages from `main` root, `.nojekyll`, versioned asset query strings, tag/release and a
   verified live self-test. See [references/hosting.md](references/hosting.md).

## Module map of the reference

| Path | Role |
| --- | --- |
| `assets/bangkok-3d-tour-guide/index.html` | DOM shell, HUD, intro, drawer, CDN and versioned asset tags |
| `assets/bangkok-3d-tour-guide/style.css` | Design system, responsive layout, walk pad, Thai type |
| `assets/bangkok-3d-tour-guide/script.js` | One IIFE: data, state, city, landmarks, cameras, UI, audio, tests |
| `assets/bangkok-3d-tour-guide/screenshots/` | Reference renders |
| `assets/bangkok-3d-tour-guide/README.md` | Short asset instructions |
| `references/method.md` | Construction order, constants, control/data contracts |
| `references/lessons.md` | The regressions this project already paid for |
| `references/verification.md` | Static, self-test, browser and screenshot checks |
| `references/city-brief.md` | Fill-in contract before authoring a new city |
| `references/release-docs.md` | The professional release documentation set |
| `references/hosting.md` | Pages, cache-busting, tagging, rollback |
| `references/build-log.md` | Provenance, versions, user amendments, metrics |
| `scripts/new-project.mjs` | Copy the working reference to a new project |
| `scripts/check.mjs` | Dependency-free scaffold/asset check |
| `preview.jpg` | Drone overview |

## Non-obvious recipes that matter

### Five landmark coordinates are one system

A landmark is not just a model. Its `position`, `plaza` radius, `markerY`/offset, `focus`, fly-to
`view`, `tourPoint`, `tourView`, pick volume and walk collider must agree. Changing one in isolation
causes markers in walls, cameras inside roofs, tour stops looking at nothing, or invisible blockers.
See `references/method.md` for Bangkok’s values and the tour curve.

### Walk controls

- No PointerLockControls. Normal pointer drag with capture; cursor stays visible.
- Horizontal drag is **inverted** (`walkLook.yaw += dx`): drag left brings the right side of the
  landscape into view. Vertical look is conventional.
- `focusScene()` returns focus to `#scene` after overlays; hidden text inputs must not swallow keys.
- A walk-mode scene click may open only a small marker (`pickKind === 'marker'`), never a broad
  landmark pick volume.
- The on-screen arrow pad writes `padKeys`; keyboard writes `keys`; both feed `updateWalk()`.
- Arrow keys `preventDefault()` while walk mode is active.
- Drone zoom is OrbitControls distance; walk/tour zoom is field of view (`freeZoom`, base 48° landscape
  or 62° portrait).

### Cars

Six InstancedMeshes — body, cabin, roof, 4 wheels, 2 headlights, 2 tail lights — not one box. Local +Z
is the front; root yaw maps the travel axis. Offsets are local before root scale. Lights brighten with
the night preset. Keep the instancing; 108 individual car groups would be expensive.

### Roofs and colour

Rectangular Thai roofs use `hipRoofMesh()` (six vertices). Rotated four-sided cylinders distort them.
Standard materials/lights use `srgb()`; custom sky/water shaders receive raw colours. Do not “fix” the
split without re-authoring the palette.

### Release

`APP.version`, `style.css?v=…` and `script.js?v=…` must match. `scripts/check.mjs` enforces it. A stale
query string can serve an old script against new HTML and produce “walking is broken” reports.

## Verification

```sh
node --check script.js
node <skill>/scripts/check.mjs --project .
open 'http://127.0.0.1:8000/?selftest=1'   # 24 / 24
```

The scaffold check covers required files, JS syntax, CDN pins, no PointerLock, drag/pad/focus marker
code, car/roof implementations, landmark/state/export ids, versioned assets and screenshots. The
in-page test covers scene construction, five landmarks/markers, EN/TH parity, tour ordering, lighting,
walk controls, collisions, traffic, water shader, state, export, notes, minimap, audio, WebGL, mode and
language switching. Real browser flows and headless specifics are in
[references/verification.md](references/verification.md).

## Definition of done

- [ ] `CITY.md` is filled and reviewed; the city is recognisable from the overview before the title.
- [ ] Five landmarks are distinct silhouettes at coherent relative positions.
- [ ] Walk works without pointer lock: drag look, inverted horizontal, pad/arrows/WASD, focus, collision.
- [ ] Zoom works in all modes; marker clicks in walk mode are marker-only.
- [ ] EN/local-language parity is complete, including ARIA labels and visitor tips.
- [ ] Three lighting presets and spatial audio work; audio is gesture-gated.
- [ ] localStorage, export `city_3d_tour.json`, and import work across reloads/devices.
- [ ] Self-test and scaffold check pass; live Pages self-test passes.
- [ ] Release documentation set and screenshots are in the repo.
- [ ] No copied city coordinates/copy/ids remain from the reference when the city changes.

## Failure boundaries

- The geography is compressed and interpretive, not a map. Do not promise navigation accuracy.
- Prices/hours are an editorial snapshot, not live data.
- No backend, accounts, analytics, booking or real-time transit.
- Walk is east-bank/limited by the authored collision world; no bridge or west-bank walking in the
  reference.
- Voice narration depends on OS voices.
- Headless WebGL (SwiftShader) is slow; it proves logic, not frame rate. Headless focus/animation can
  pause; use focus emulation or a headful browser for movement tests.
- No service worker/offline package; first load needs the CDN and fonts.
- A green technical suite does not prove a new city looks right; re-author and review the screenshots.

## Provenance

Distilled from the Bangkok 3D build (OpenCode 2.2.5, DeepSeek V4.1 Flash), with the working application
and screenshots as the reference asset. The source app is MIT; Three.js r128 and OrbitControls are MIT;
fonts are SIL OFL. See [ATTRIBUTION.md](ATTRIBUTION.md) and the reference README.
