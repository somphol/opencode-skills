# Lessons that carry across cities

## The big one: reskinning fails

A copied miniature with changed coordinates inherits the old city's outline, grid, landmark
spacing, street names, building palette, copy and tests. It reads as the old city with new labels.
The Bangkok build started as a copied San Francisco scaffold; it was rejected and rebuilt from
scratch, which produced a cleaner, more accurate river city. **Author geography, landmarks, street
pattern, transport and copy together for the target.** See [build-log.md](build-log.md).

## City-specific decisions

- **The plan follows the city.** A river city needs two banks and bridges; a coastal city needs a
  shoreline and piers; a canal city needs water corridors; a grid city needs its own angle and
  named roads. Do not force the reference's 33° grid onto the target.
- **Landmarks are the identity.** Choose 6–8 icons by silhouette, not fame alone. If a landmark does
  not read at 1–5 units tall, it will not read in the overview.
- **Transport is local.** Tuk-tuks, jeepneys, trams, cable cars, gondolas, ferries and long-tail
  boats are not interchangeable. Pick the modes that make the city recognisable.
- **Copy is part of the design.** New city, new title, tagline, landmark texts and locales. Do not
  reuse the reference's strings.
- **Tests are city-specific.** New anchors, envelopes, facts and locale checks. A green reference
  suite proves nothing about the target.
- **The brief comes first.** If the geography, districts, landmarks and street pattern are not
  written down, the scene will drift into a generic city.

## Geometry and plan

- **Long chords fail.** Clipping a grid line to the outline and routing one long segment drops the
  whole street where the chord grazes the coast. Sample at 0.28 units and route chord by chord.
- **Diagonal streets eat blocks.** An axis-aligned parcel near a diagonal street needs roughly
  `halfDiag + halfRoad` clearance. Cells that pass the block test can still fail the road test, so
  always check both and shrink rather than move.
- **Street-front and lattice passes must share a spatial hash.** If they keep separate grids, the
  second pass can place a parcel inside a frontage parcel.
- **A detached bank is a missing bridge.** The graph test is the fastest way to find a severed
  component; add the crossing or connector, do not hide it by pruning.
- **Bridge spans are explicit edges.** Mark only the water span as a bridge; the approaches are
  ordinary roads. A bridge edge must start and end on land and have a water midpoint.
- **Hardcoded traffic lanes fail.** Boat lanes and bridge cars must derive from the coastline or the
  landmark's yaw. The reference originally drove four cars along fixed Manhattan bridge lanes
  (`z = 7.5`, `z = 9.7`), which after the coastline change put them in open water.
- **Reserved sites need breathing room.** A landmark lot with no margin leaves parcels pressed
  against the model; add a margin and lower the surrounding heights so the silhouette reads.

## Rendering and lighting

- **`PCFSoftShadowMap` is gone** in three 0.186; use `PCFShadowMap` with a shadow radius.
- **Night needs real lights.** Sun, hemisphere, fill, window and lamp emission, water, fog and
  exposure all move from one night fraction. A background swap alone looks like a filter.
- **Fog banding.** A near-flat fog gradient over the ground plane bands at 8 bits and crawls while
  the camera orbits. `dithering: true` on large flat materials plus a wider fog range fixes it.
- **Instancing pays.** Batch boxes/cylinders/spheres/beams per material; keep custom geometry for
  the few shapes that need it and merge per material. A city of individual meshes will not hold 60
  fps.
- **The UI safe frame.** The full layout offsets the camera right of the title column; the compact
  layout keeps the card above the controls and the landmark grid.

## Verification

- **Camera flights in tests.** At low frame rates, wall-clock waits expire mid-flight. Verify camera
  state by advancing virtual time (`step`) instead of sleeping.
- **One offline file under a strict CSP:** no image URLs, no fonts, no fetch, no storage.
- **A green suite is not a visual review.** Look at the day/night overview and every landmark image;
  a camera can land exactly on target and still frame the wrong thing.
