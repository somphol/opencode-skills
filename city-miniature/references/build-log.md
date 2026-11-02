# How the San Francisco template was made

A condensed build log. Useful when adapting the template again, or when asking "why is it like
this?".

## Origin

Started from the Manhattan Miniature sample (0.2.0): a compressed Manhattan island, 87 parcels,
four avenues, eight Manhattan landmarks. The mechanism — road graph, block faces, parcels,
instanced facades, virtual clock — was kept; the geography, landmarks, copy and verification were
replaced.

## Geography

- New outline: a peninsula ~7 units wide, ~31 long, bay east, Pacific west, Golden Gate at the
  north tip. Replaces the Manhattan island polygon in `city.ts` and in `tests/planning.ts`.
- Landmarks moved to a compressed SF plan: bridge at the tip, Financial District and SoMa on the
  bay side, Civic Center and Alamo Square inland, Alcatraz offshore in the bay.
- Golden Gate Park and the Presidio replaced Central Park; the park block in
  `urbanEnvironment.ts` was rewritten as a parametric band with a lake, paths and trees.
- The two "East River" suspension bridges were deleted from `urbanEnvironment.ts`. Manhattan's
  rooftop water tanks were replaced by `roofKit()`.

## Street plan, and the parcel problem

The grid is rotated 33° (`angle = -0.58`) with Market Street and the Embarcadero as explicit
polylines. Three parcel strategies were tried:

1. **Axis-aligned grid inside each block's bounding box** — simple, but a 33° street makes the
   support term large, so only the middle of each block passed the road test. ~44 parcels.
2. **Scanline fill inside each block, rotated boxes** — fits diagonal blocks, but block edges are
   irregular (Market cuts corners), so most cells failed the four-corner test. ~30 parcels.
3. **City-wide rotated sweep** — ignores blocks and fills everything clear of roads, but needs the
   sweep origin to align with block edges; anchored to a fixed lattice it wastes most samples.
   ~24 parcels.

What shipped is (1) plus a street-front infill pass, with cells at 0.62/0.68 and shrinking at
scales 1, .85, .7, .55: **84–216 parcels** depending on street density. The lesson is recorded in
`lessons.md`: on diagonal streets, parcel area is lost to clearance, so either accept larger
buildings with gaps or rotate the buildings and pay for a rotation-aware footprint.

## Traffic bug

Four cars still drove along the deleted Manhattan bridges at fixed world lanes (`z = 7.5`, `z = 9.7`),
which after the coastline change put them over open water. They now run on the Golden Gate deck,
with the lane derived from the bridge anchor and yaw. Any traffic attached to a rotated landmark
must be computed in that landmark's frame.

## Verification strategy

`npm run shoot` could not pass here: headless Chrome on this Mac has no working Metal path, so it
falls back to SwiftShader (~2.5 fps) and the harness's wall-clock waits expire during 1.4 s camera
flights. Rather than weaken the harness, `scripts/verify.mjs` was added: it drives the built file in
capture mode and advances virtual time, so every assertion is frame-rate independent. It reports
20/20 and is the check to quote on GPU-less machines.

## Publishing

`dist-single/index.html` is copied to a repo root and served by GitHub Pages. Pages cannot set
response headers, so the sandbox CSP is not applied there; the page is self-contained regardless.

## Open issues

- The bridge's city end stops in mid-air above the Presidio; no approach viaduct.
- Blocks whose streets failed to route stay empty.
- `shoot` remains unverified on a GPU here, so pixel-diff and fps claims are untested.
