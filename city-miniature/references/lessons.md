# Details that regress

- **Long chords fail.** Clipping a grid line to the outline and routing one long segment drops the
  whole street where the chord grazes the coast. Sample at 0.28 units and route chord by chord.
- **Diagonal streets eat blocks.** An axis-aligned parcel near a 33° street needs roughly
  `halfDiag + halfRoad` clearance. Cells that pass the block test can still fail the road test, so
  always check both and shrink rather than move.
- **Hardcoded traffic lanes.** Boat lanes and bridge cars must derive from the coastline or the
  landmark's yaw. The template originally drove four cars along fixed Manhattan bridge lanes
  (`z = 7.5`, `z = 9.7`), which after the coastline change put them in open water.
- **Camera flights in tests.** At low frame rates, wall-clock waits expire mid-flight. Verify camera
  state by advancing virtual time (`step`) instead of sleeping.
- **`PCFSoftShadowMap` is gone** in three 0.186; use `PCFShadowMap` with a shadow radius.
- **Night needs real lights.** Sun, hemisphere, fill, window and lamp emission, water, fog and
  exposure all move from one night fraction. A background swap alone looks like a filter.
- **Fog banding.** A near-flat fog gradient over the ground plane bands at 8 bits and crawls while
  the camera orbits. `dithering: true` on large flat materials plus a wider fog range fixes it.
- **The UI safe frame.** The full layout offsets the camera right of the title column; the compact
  layout keeps the card above the controls and the landmark grid.
- **One offline file under a strict CSP**: no image URLs, no fonts, no fetch, no storage.
