# Method: build the target city, not a reskin

## The rule

Do not copy an existing miniature and edit its coordinates. The reference is a **mechanism
catalogue**, not a template. The target city's geography, landmarks, street pattern, building
families, transport, palette, copy and verification targets must be authored for that city.

A reskin inherits the old city's assumptions: the outline, the grid angle, the landmark spacing, the
street names, the building palette, the i18n strings and the tests. It reads as the old city with
new labels, and fixing it costs more than starting clean. The Bangkok build is the case study: the
first attempt was a copied SF scaffold; it was rejected, then rebuilt from scratch and became a
cleaner river city. See [build-log.md](build-log.md).

## From-scratch order

1. **Brief** — fill `references/city-brief.md` as `CITY.md`. Decide the water/land shape, districts,
   6–8 landmarks, street pattern, architecture, transport, palette, copy and verification targets.
2. **Geography** — author the target's tray, water, banks/shoreline, districts and reserved
   landmark/park footprints.
3. **Plan** — author the target's named roads, grid/organic/canal pattern, bridges and a connected
   graph; place street-front and lattice parcels clear of roads and reserved sites.
4. **Buildings** — author the target's 6–10 families and place them by district.
5. **Landmarks** — author the target's icons in local space; set anchors, lots, look heights, views
   and envelopes.
6. **Environment** — land, water shader, roads, bridges, promenades, piers, parks, trees, stalls,
   street furniture, lamps.
7. **Traffic and city life** — the target's vehicles, boats, pedestrians and signature modes.
8. **Scene and UI** — renderer, camera flights, day/night, capture API, locale copy, layouts.
9. **Tests and verification** — the target's plan/geometry invariants and browser checks.
10. **Single file and publish** — inline build, CSP, screenshots, Pages.

Anything that needs the street network runs after step 3. Anything that needs the final materials
runs before the instanced kit is finished.

## Target module map (write these)

| Module | Responsibility |
| --- | --- |
| `src/scene/geography.ts` | outline, water, districts, landmark anchors, parks |
| `src/scene/plan.ts` | roads, bridges, connected graph, blocks, parcels |
| `src/scene/buildings.ts` | target building families |
| `src/scene/landmarks.ts` | target landmark models |
| `src/scene/environment.ts` | land, water, roads, parks, piers, street life |
| `src/scene/traffic.ts` | target vehicles, boats, pedestrians |
| `src/scene/kit.ts` | instanced primitive helper |
| `src/scene/scene.ts` | renderer, camera, day/night, capture |
| `src/App.tsx`, `src/i18n.ts`, `src/style.css` | UI, copy, layouts |
| `scripts/inline-build.mjs`, `scripts/verify.mjs` | single-file build and browser checks |
| `tests/plan.test.ts`, `tests/geometry.test.ts` | target invariants |

The names are a suggestion. The rule is that every file is authored for the target.

## Reference implementation (San Francisco) — mechanism only

`assets/san-francisco-diorama` is a compressed SF peninsula: a rotated downtown grid, Market Street,
the Embarcadero, eight landmarks, Golden Gate Park, the Presidio, bay piers and 200+ parcels. It is
useful for understanding the mechanism. Its constants are **SF-specific examples**, not defaults.

### Order of construction in the reference

1. tray, water and island outline (`outline` + `inside()`)
2. landmarks and park sites as reserved footprints (`landmarkLots`, `parkSites`)
3. `planCity(reserved, inside)` → road graph, blocks, parcels
4. ordinary buildings per parcel, then the dedicated landmark models
5. `buildUrbanEnvironment(scene, network, footprints, outline)` → roads, kerbs, signals, parks,
   shoreline, piers, water
6. `addCityLife(scene, network, walks)` → traffic, pedestrians, boats
7. collision boxes → `createCameraGuard`

### Street graph pattern

- Streets are lines in a rotated frame: `world(u, v) = (u·cos − v·sin, u·sin + v·cos)`. The SF angle
  is `-0.58` (~33°); the target's angle comes from its own street pattern.
- Sample a line every 0.28 units and keep runs while `inside(x, z)`.
- Each contiguous run becomes a chain of **short chords**, not one long segment: a long chord across
  a curved coast leaves the outline and `route()` drops it.
- `route()` tries the straight segment, then Dijkstra around obstacle corners. A failed route is
  silently skipped, which shows up as a missing street and an unfilled block.
- Split every crossing into a graph node; blocks are the faces of the planar graph.
- Keep the largest connected component; with two banks or a canal network, keep every substantial
  component or add the missing bridges/connectors.

### Parcel pattern

- Block bounding box → grid of cells → shrink until all four corners are inside the block polygon.
- Placement margin must exceed half the road width plus the box support along the street normal.
  On diagonal streets the support is large, which is why the reference keeps `rot: 0` and shrinks
  instead of rotating.
- A rotated parcel carries `rot`; the collision footprint is the axis-aligned envelope.
- Street-front rows and lattice fill must share the same spatial hash, or they overlap.

### Camera and capture pattern

- All motion runs from `tick(dt)`; no `performance.now()` or `THREE.Clock` inside the simulation.
- `?capture=1` freezes the simulation; `window.__scene.step(n, dt)` advances it.
- `act(name, arg)` wraps UI handlers in `flushSync`, so buttons, card and camera change together.
- `settleControls()` before any programmed camera move, or OrbitControls damping moves the target
  after the flight.
- The camera guard lifts the camera out of building envelopes; the verification checks
  `cameraClear` after every flight.

### Layout and runtime pattern

`body[data-layout]` is `compact` below 900 px wide or 560 px high, otherwise `full`. `embed=1`
hides the header, title column and collectible line. The full layout shifts the camera right of the
title column. System fonts only, no font file, no runtime request.

## Invariants that carry across cities

- The plan is road-first: graph, then blocks, then parcels.
- The graph is connected; every bank/peninsula has a crossing.
- Parcels are on land, clear of roads and reserved sites, and do not overlap.
- Landmark anchors, camera views, lots and envelopes agree with the tests.
- Traffic lanes attached to a rotated landmark or a curved river are derived from that geometry.
- All motion advances through virtual time; capture stepping is deterministic.
- The single file is offline, self-contained and runs under a strict CSP.
- The UI has a compact layout and a 345×345 embed.
- The tests use the target's expected values, not the reference's.

## City-specific decisions (do not copy the reference)

- The outline, river/coast/canal shape, tray aspect and orientation.
- The street pattern, angle(s), named roads, bridges and transit.
- The 6–8 landmarks, their silhouettes, anchors, views and envelopes.
- The 6–10 building families, heights, roofs, materials and palette.
- The transport modes and street life.
- The title, tagline, landmark texts, locales and typography.
- The tests' facts, targets and envelopes.

## Do-not-copy checklist

- [ ] No reference `src/` files copied and renamed.
- [ ] No reference outline, river, grid angle, street names or parcel lattice.
- [ ] No reference landmark models, anchors, views or envelopes.
- [ ] No reference building families/palette/roof kit unchanged.
- [ ] No reference i18n strings or README copy.
- [ ] No reference test targets.
- [ ] The overview reads as the target city before the title is read.
