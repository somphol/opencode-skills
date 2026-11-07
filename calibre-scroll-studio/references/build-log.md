# Build log (condensed)

The full chronology is in the template at `assets/aurelis-calibre-07/docs/BUILD-LOG.md`.

## 0. Setup

Zero-build project; vendored Three.js r170; self-hosted Bodoni Moda; dev-only Puppeteer. Unitless
watch: case radius 1.0.

## 1. Watch

Lathed case, canvas dial, extruded hands, gear/bridge movement. **Dial text appeared rotated 90°** on
a cylinder cap; fixed with a flat `CircleGeometry`. Lugs and bezel were oversized/too chrome in the
first pass; shortened the lugs, flattened the bezel, brushed the caseband, lowered environment
intensities.

## 2. Stage

A `position: sticky` stage pushed the hero copy below the fold. Screenshot: beautiful watch, no
headline. Fixed by making the stage fixed and the chapters flow above it.

## 3. Explosion

The first depth-stacked explosion was viewed at ~70° and read as a line; the dial covered the
movement and the bezel became a hoop. Added a second animation stage, fanned the parts laterally, and
grouped the case shell. The hands detached from the dial and were fixed by sharing its late
transform. Vertical separation of the big discs was a dead end (clipping/distant camera).

## 4. Movement and materials

Dark Geneva roughness made the bridges read as black blobs; moved the texture to the rotor/caseback.
An extra lower bridge covered the balance; removed. Caseback circular text was drawn inside the ring
hole; moved to `.465 × size`. The rotor looked like a floating cape; grouped it with the caseback and
lit it.

## 5. Labels

The dial callout covered the AURELIS logo at 1024 px. Removed it, added a text backdrop, a right-edge
flip, a collision grid and a < 1200 px hide. The collision test initially measured a zero-size
container.

## 6. Mobile

The explosion sat on the heading. Compressed the copy, lifted/scaled the group during exposure, and
lifted/shrank again at the finale. Added 390 × 844 assertions.

## 7. Gate

Grew to 24 checks. Two assertion bugs: the caseband does not move at `.5` (it leaves at .55–.75), and
the second hand lagged the dial by .08. Fixed the tests and the hand windows.

## 8. Release

Generated the ledger from OpenCode's SQLite session row; added the colophon (one-sentence brief,
longer-video note, model/harness credits); wrote docs; scaffold-tested the skill; published the site
and the catalog.

## Lessons

Measure the scroll map; fixed stage; ~40° explosion; group sub-assemblies; hands with dial; labels with
collision; mobile composition; write the gate early; keep the small brief honest.
