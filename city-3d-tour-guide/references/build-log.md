# Build log and provenance

## Origin

The reference is the **Bangkok 3D** project built in one OpenCode session with DeepSeek V4.1 Flash:

- Source: <https://github.com/somphol/bangkok-3d-tour-guide>
- Live: <https://somphol.github.io/bangkok-3d-tour-guide/>
- Release at handoff: v1.2.0
- Session id: `ses_e60b2c542ffezeHzunC0PwPEEY`
- Harness: OpenCode 2.2.5
- Model: `opencode-go/deepseek-v4.1-flash`

The source project records build duration, tokens, cost, verification and file sizes in
`state.json`/`STATE.md`. Those are historical measurements, not guarantees.

## What was built

- Vanilla three-file static app, no build or dependencies beyond CDNs.
- Compressed Rattanakosin/Chao Phraya city: river, banks, promenade, roads, two bridges, park, 70–90
  parcels, trees, lamps, 108 layered cars, boats, railings.
- Five hand-authored landmarks: Wat Arun (tiered prangs with porcelain bands), Wat Pho (ubosot, chedis,
  open-canopy Reclining Buddha), Grand Palace (walls, Wat Phra Kaew, golden chedi, Chakri Maha Prasat),
  Golden Mount (terraced hill, spiral path, gold chedi), Baiyoke (glass tower, crown, beacon).
- Drone OrbitControls, drag-look walking with pad/keys and collision, five-stop Catmull-Rom tour.
- EN/TH UI and landmark copy, speech narration, three lighting presets, spatial Web Audio.
- localStorage progress, `bangkok_3d_tour.json` export/import.
- 24-check runtime self-test, 19-check static release check, CI, screenshots, documentation, Pages.

## Timeline of user-driven changes

1. **Initial release** — original brief, pointer-lock walking, box traffic, initial docs.
2. **v1.1.0** — removed pointer lock; drag-to-look; wheel FOV zoom; professional docs; version 1.1.0.
3. **v1.1.1** — inverted horizontal walk drag (grab-the-landscape).
4. **v1.1.2** — arrow keys made first-class; focus restoration; prevented hidden notes fields from
   swallowing movement; docs.
5. **v1.1.3** — on-screen walk pad for mouse/touch; walk clicks restricted to small markers; versioned
   cache-busting; docs.
6. **v1.2.0** — replaced box cars with layered instanced cars (body/cabin/roof/wheels/lights).
7. **Docs-only** — privacy, browser support, design, gallery, glossary, CITATION, then full
   handoff/requirements/code map.

## Dead ends and fixes

- **Pointer lock** was initially used because the brief asked for PointerLockControls. The user found
  the sticky cursor unusable; drag look replaced it. Do not restore it.
- **Walk “broken”** after guide/notes use: hidden textarea retained focus; fixed with `focusScene()` and
  a broader key-guard that only ignores form fields while an overlay is open.
- **Walk “broken”** after a scene click: oversized pick spheres opened the guide; fixed with
  `pickKind` and marker-only walk picking.
- **Tour looked at the sky**: look-ahead was too short for `ahead.y += 1.5`; reduced to `+0.35` and
  longer sample.
- **Bridge in the tour path**: moved the south bridge outside the river spline.
- **Washed-out palette**: added sRGB→linear conversion for standard materials/lights while keeping
  custom shaders raw.
- **Roofs looked like twisted diamonds**: replaced rotated cylinders with `hipRoofMesh`.
- **Cars were boxes**: split into six instanced component meshes; fixed double-scale offsets.
- **Stale JS after deploy**: versioned CSS/JS query strings and static enforcement.
- **State API stale after import**: use `Object.assign(state, merged)` instead of reassigning.

## Versions and scope

| Version | Runtime change |
| --- | --- |
| 1.0.0 | Initial guide, pointer lock, box traffic |
| 1.1.0 | Drag look, zoom, docs |
| 1.1.1 | Inverted horizontal drag |
| 1.1.2 | Focus/arrow walking fix |
| 1.1.3 | Walk pad, safer picking, cache busting |
| 1.2.0 | Layered low-poly cars |

Documentation additions after v1.2.0 do not change runtime version. Always verify the actual files and
live build; this log is not a substitute for `git log`/tags.

## Metrics

At source freeze the reference had roughly 6,700 lines across the three runtime files and ten release
screenshots. Exact line counts, tokens, duration and model metadata are in the source `state.json` /
`STATE.md`. Do not copy token counts into a new city as if they were performance data.

## Licence status

The app and skill are MIT. Three.js/OrbitControls are MIT; fonts are SIL OFL. No photographs, map tiles,
external 3D models, recorded audio or third-party brand marks are redistributed. Screenshots are original
renders. See `ATTRIBUTION.md` and the asset `THIRD_PARTY_NOTICES.md`.

## What this log is not

It is not a transcript. It records decisions and defects that are expensive to rediscover, not chat
messages or private data.
