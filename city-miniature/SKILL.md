---
name: City Miniature
description: Build an interactive 3D miniature of a city from scratch as one offline HTML file — city-specific geography, landmarks, traffic, day/night and bilingual UI. Use existing miniatures as mechanism references only, never as templates to reskin.
version: 1.1.0
---

# City Miniature

Turn a city into one interactive Three.js diorama: a road-first street plan, building parcels,
dedicated landmark models, traffic and boats on a floating tray, day/night lighting, and a landmark
bar with camera flights. The result is one self-contained HTML file.

## The rule: build the target city from scratch

**Do not copy an existing miniature and adjust its coordinates, names or colours.** A copied scene
inherits the old city's geography, street logic, landmark assumptions, building families, transport,
copy and tests. It reads as a reskin and is harder to fix than to build cleanly. The Bangkok
miniature started as a copied San Francisco scaffold; it was rejected and rebuilt from scratch, which
produced a cleaner, more accurate river city. The case study is in
[references/build-log.md](references/build-log.md).

Use existing miniatures as **inspiration and a mechanism catalogue**:

- **Reuse the mechanism:** the road-first plan, instanced facades, camera flights, virtual clock,
  capture API, verification strategy, single-file build and CSP discipline.
- **Do not reuse the content:** source files, outlines or coordinates, street names, landmark
  ids/models/anchors/views, building families/palettes, transport choices, i18n strings, the
  reference tests' expected values, or README copy.

`assets/san-francisco-diorama` is a working **reference implementation**, not a starter.
`scripts/new-project.mjs` creates a blank, city-agnostic starter; it copies no scene code.

## When to use

- A browsable miniature of a city or district with a handful of landmarks, for a launch page, a
  brand piece, a demo or an embed.
- Building the mechanism for a new place: road graph first, then blocks and parcels, then buildings,
  landmarks, environment and traffic.
- Not for measured maps, GIS data, navigation or photo-to-3D reconstruction. The geography is
  deliberately compressed.

## Workflow

1. **Write the brief.** Copy [references/city-brief.md](references/city-brief.md) into `CITY.md`
   and fill it before writing scene code. The brief is the design contract.
2. **Research the city.** Collect the water/land shape, 5–7 districts, 6–8 landmark silhouettes, the
   street pattern (grid angle, radial, organic, canals, ring roads), the ordinary architecture, the
   transport modes, the palette and the languages. Use maps and photographs as references; do not
   trace a survey map.
3. **Scaffold blank.** `node scripts/new-project.mjs --out ~/my-city`, then `npm install`. Do not
   copy the San Francisco project.
4. **Author geography and plan from scratch.** Draw the target outline/water, reserve the landmark
   and park footprints, then write the target's roads, bridges and parcels. The plan must follow
   the city, not the reference.
5. **Author landmarks from scratch.** Choose the icons that define the city; model their silhouettes
   in local space; set anchors, lots, look heights and view offsets.
6. **Author buildings, environment, traffic and copy together.** Pick the target's building
   families, street life, vehicles, boats, palette and languages. New city, new copy.
7. **Verify with city-specific targets.** Write the target's plan/geometry tests and browser checks;
   do not reuse another city's anchors, envelopes or facts.
8. **Build and publish.** `npm run build:single` → one offline HTML file; verify under the sandbox
   CSP; publish with [references/hosting.md](references/hosting.md).

```sh
node scripts/new-project.mjs --out ~/my-city
cd ~/my-city && npm install
npm run dev            # live editing
npm run typecheck
npm run build
```

The blank starter has no scene code. Add `test`, `verify` and `build:single` scripts as the scene
takes shape; the references show the patterns.

## Target module map (write these)

A clean project usually grows into:

- `src/scene/geography.ts` — target outline, water, districts, landmark anchors, parks
- `src/scene/plan.ts` — target roads, bridges, connected graph, blocks and parcels
- `src/scene/buildings.ts` — target building families
- `src/scene/landmarks.ts` — target landmark models
- `src/scene/environment.ts` — land, water, roads, parks, piers, street life
- `src/scene/traffic.ts` — target vehicles, boats and pedestrians
- `src/scene/kit.ts` — instanced primitive helper
- `src/scene/scene.ts` — renderer, camera, day/night, capture API
- `src/App.tsx`, `src/i18n.ts`, `src/style.css` — overlay UI and copy
- `scripts/inline-build.mjs`, `scripts/verify.mjs` — single-file build and browser checks
- `tests/plan.test.ts`, `tests/geometry.test.ts` — target invariants

The names are suggestions. The important part is that every module is authored for the target city.

## Reference implementation (San Francisco) — read for patterns, not files

`results/san-francisco-diorama/index.html` is the published build of the reference; inspect it for
the intended output, not as a template. The asset uses `urbanPlan.ts`, `city.ts`, `landmarks.ts`,
`architecture.ts`, `archetypes.ts`, `newArchetypes.ts`, `urbanEnvironment.ts`, `cityLife.ts`,
`cameraSafety.ts`, `App.tsx` and `capture.tsx`. [references/method.md](references/method.md) maps the
invariants; the SF constants
(angle, Market Street, Embarcadero, the landmark table, the parcel scales) are examples, not defaults.

Read it to understand:

- the order of construction: tray/outline → reserved sites → plan → buildings/landmarks →
  environment → traffic → camera guard;
- why grid lines are sampled into short chords and why the graph is split at every crossing;
- how parcels are placed and shrunk clear of roads;
- how the virtual clock and capture API make verification frame-rate independent;
- how the single-file build and CSP discipline work.

Do not copy its files, constants or content.

## From-scratch recipes

**Geography.** Derive the target's water/land shape first. A river city needs two banks and
bridges; a coastal city needs a shoreline and piers; a canal city needs water corridors; a grid city
needs its own angle and major roads. The SF peninsula outline, the 33° grid and Market Street are
not defaults.

**Street plan.** Research the real pattern: a rotated grid, a radial boulevard, an organic old town,
a canal network, ring roads. Add the named roads that define the city and the crossings that keep
the graph connected. Do not force the reference's grid onto the target.

**Landmarks.** Choose 6–8 icons by silhouette, not by fame alone. Model each in local space through
the instancing helpers; set a reserved lot, a look height, a camera view and an envelope. The
landmark table, the camera targets and the tests must agree.

**Architecture.** Choose 6–10 ordinary families from the target's neighborhoods: shophouse,
courtyard house, housing block, office, market, temple/school, warehouse, hotel. Pick roofs,
materials and colours that belong to the city. Do not reuse the SF ten families unchanged.

**Transport.** Choose the target's modes: tuk-tuks, jeepneys, trams, cable cars, gondolas, ferries,
long-tail boats, bicycles. Derive lanes from the local geometry; never hardcode a world lane that
belongs to a rotated landmark or a curved river.

**Copy and locales.** Write a new title, tagline, landmark texts and UI strings in the target's
languages. Do not reuse the reference's English/Chinese copy. Keep the compact landmark bar in
mind; short labels are the tightest constraint.

**Verification.** Reuse the approach (virtual time, capture API, headless Chrome, CSP, no external
requests). Write new expected targets, envelopes, facts and locale checks. A green reference test
suite proves nothing about the target city.

## Definition of done

- [ ] `CITY.md` is filled and reviewed.
- [ ] No reference-city coordinates, street names, landmark ids, model files, i18n strings or test
      targets remain.
- [ ] Geography, plan, buildings, landmarks, environment, traffic and copy are target-specific.
- [ ] The road graph is connected; parcels are contained and non-overlapping; bridges cross water.
- [ ] Every planned landmark flight, day/night, the target locales and the embed pass.
- [ ] The single file works offline under the sandbox CSP with no external requests.
- [ ] README, `AGENTS.md`, changelog and screenshots are updated.
- [ ] A reviewer can name the city from the overview before reading the title.

## Verification

- **Plan/geometry tests (no browser):** connected graph, parcel containment/clearance/non-overlap,
  bridge water spans, landmark envelopes, distinct building families, finite geometry.
- **Browser check (capture mode):** every planned landmark flight, chosen button/card, day/night,
  reset, zoom, orbit, pan, rotate, facts, the target locales, the 345×345 embed, no console errors,
  no external requests.
- **Visual review:** day/night overview and one image per landmark. A green suite does not prove the
  composition looks right.
- `npm run shoot` is a deeper pixel-diff/fps harness; it needs a real GPU. Under SwiftShader the
  scene is slow and wall-clock waits can time out; use the virtual-time check there.

See [references/verification.md](references/verification.md) for the reference harness and the
city-specific target rule.

## Failure boundaries

- Geography is compressed and interpretive; positions and scales are not survey data.
- `shoot` and `record` need Node 22.4+ and Chrome; `record` also needs FFmpeg.
- Phone behaviour was verified under touch emulation in headless Chrome only.
- Missing WebGL 2 shows a localized message.
- A reskin can pass every technical check and still fail the definition of done.

## Provenance

The San Francisco reference derives from the Manhattan Miniature 0.2.0 sample by SandBase Lab;
reused mechanism versus new work and the licence status are documented in
[ATTRIBUTION.md](ATTRIBUTION.md). The Bangkok miniature is the from-scratch case study: after a
rejected reskin, it was rebuilt with a new river geography, plan, eight landmarks, nine building
families, tuk-tuks, long-tail boats, English/Thai copy and its own verification targets. See
[references/build-log.md](references/build-log.md) and the public example at
<https://github.com/somphol/bangkok-miniature>.

The original brand mark is not redistributed. The blank starter is original and copies no scene
content.
