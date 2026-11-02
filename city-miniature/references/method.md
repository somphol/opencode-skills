# Module map and invariants

## Order of construction

`city.ts` builds in this order, and the rest of the scene depends on it:

1. tray, water and island outline (`outline` + `inside()`)
2. landmarks and park sites as reserved footprints (`landmarkLots`, `parkSites`)
3. `planCity(reserved, inside)` → road graph, blocks, parcels
4. ordinary buildings per parcel, then the dedicated landmark models
5. `buildUrbanEnvironment(scene, network, footprints, outline)` → roads, kerbs, signals, parks,
   shoreline, piers, water
6. `addCityLife(scene, network, walks)` → traffic, pedestrians, boats
7. collision boxes → `createCameraGuard`

Anything that needs the street network must run after step 3.

## Street graph

- Streets are lines in a rotated frame: `world(u, v) = (u·cos − v·sin, u·sin + v·cos)` with
  `angle = -0.58` (~33°), then sampled every 0.28 units and kept while `inside(x, z)`.
- Each contiguous run becomes a chain of **short chords**, not one long segment: a long chord across
  a curved peninsula leaves the outline and `route()` drops it.
- `route()` first tries the straight segment, then Dijkstra around obstacle corners. A failed route
  is silently skipped, which shows up as a missing street and an unfilled block.
- Every crossing is split into a real graph node afterwards; blocks are the faces of that planar
  graph.
- The largest connected component is kept; detached stubs are pruned.

## Parcels

- Block bounding box → grid of cells → shrink until all four corners are inside the block polygon.
- Placement margin must exceed half the road width plus the box support along the street normal.
  On diagonal streets the support is large, which is why buildings keep `rot: 0` and shrink instead
  of rotating.
- `BuildingParcel` carries `rot`; the collision footprint is the axis-aligned envelope of the
  rotated box.

## Camera and capture

- All motion runs from `tick(dt)`; there is no `performance.now()` or `THREE.Clock` inside the
  simulation, so capture stepping is deterministic.
- `?capture=1` freezes the simulation; `window.__scene.step(n, dt)` advances it.
- `act(name, arg)` wraps UI handlers in `flushSync`, so buttons, info card and camera change in one
  call.
- `settleControls()` must run before any programmed camera move, or OrbitControls damping moves the
  target again after the flight.

## Layouts

`body[data-layout]` is `compact` below 900 px wide or 560 px high, otherwise `full`. `embed=1`
hides the header, title column and collectible line. The full layout shifts the camera right of the
title column.

## Runtime

React + TypeScript + three.js + Vite. System fonts only, no font file, no runtime request.
