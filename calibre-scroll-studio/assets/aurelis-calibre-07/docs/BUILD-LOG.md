# Build log

This is the honest chronology of the build: what was tried, what failed, and what an agent repeating
it should not rediscover. Times are phases, not wall-clock hours.

## 0. Setup

- Created a zero-build project: `index.html`, `styles.css`, `src/`, `vendor/`, `fonts/`.
- Vendored Three.js r170 (no CDN), downloaded Bodoni Moda (OFL, latin + italic), and installed
  `puppeteer-core` dev-only for the gate.
- Chose a unitless watch: case radius 1.0. This made all later geometry values legible in code.

## 1. The watch

Built the case from `LatheGeometry` profiles, the dial from a 1024 px canvas, the indices and hands
from extruded shapes, and the movement from gear shapes, organic bridges and jewels.

**Bug: dial artwork rotated 90°.** The dial initially used a `CylinderGeometry` cap with the canvas as
its top material. Cylinder-cap UVs are not screen-aligned; “AURELIS” appeared vertically down the
right edge. Fixed by using a flat `CircleGeometry` face over a plain cylinder body.

**Bug: lugs read as ears.** The first lugs were too long, too wide and tilted too far back; at the
case edge they looked like handles. Shortened them, moved the base inward, reduced the tilt, and gave
them a polished steel finish.

**Bug: the bezel looked like a tyre.** The first lathe profile was tall and chrome-like. Flattened the
bezel, made the caseband brushed, and lowered the environment intensities so the top softbox did not
blow the ring to white.

## 2. The scroll stage

The first layout used `position: sticky` for the canvas stage. That was the largest structural bug:
a sticky element consumes its own 100 vh in document flow, so the hero section began at `y = 100vh`
and the first chapter copy was below the fold. The screenshot showed a beautiful watch and no
headline. Fixed by making the stage `position: fixed`; the sections then start at `y = 0` and paint
above it.

## 3. The explosion

The first explosion separated parts mostly along `z` and pushed the camera to a ~70° side view. From
that angle the parts lined up into a shallow “train”; the dial covered the movement, and the bezel
became a giant hoop hovering around the dial.

**Fix: a two-stage fan.** Added `late`/`lateWindow` to the part registry. The dial and hands first
micro-lift, then move to the upper-right; the caseback and rotor share a delta so the rotor stays in
the exhibition back; the case shell (band, bezel, crystal, lugs, crown) leaves as one unit. The camera
now orbits ~40°, not 70°, so the watch still faces the viewer while depth reads.

**Dead end: separating big discs vertically.** Moving the dial, bezel and crystal up by a full diameter
clipped them out of frame or forced a very distant camera. The upper-right fan + case shell grouping
keeps every part visible at a 6.8-unit distance.

**Bug: hands detached from the dial.** They were translated to the top-left while the dial went
top-right; in the movement screenshot they looked like blue spears. They now share the dial's late
position and rotation and sit just above its face.

## 4. The movement

The movement is the emotional centre, so it needed more density than the first pass.

**Bug: bridges read as black blobs.** A high-contrast Geneva roughness map multiplied with a low
roughness made the rhodium bridges nearly black. Removed the map from the bridges, raised the base
colour, and moved the Geneva texture to the caseback plate and rotor.

**Bug: the balance disappeared.** A lower bridge added to fill an empty area covered the balance
wheel and the “Balance wheel” callout pointed at a bridge. Removed the bridge; the balance, hairspring
and jewel are visible again.

**Bug: caseback engraving was invisible.** Circular text was drawn at canvas radius `.405R`, which
mapped into the ring hole. Moved it to `.465R` and verified it lands on both the caseback ring and the
movement ring. Also added an inner back plate so the exhibition back is not a void.

**Bug: rotor read as a floating gold cape.** It was detached and lit only by a dark environment.
Grouped it with the caseback, gave it a warmer material and a fill light, and let it rotate inside the
back.

## 5. Labels

**Bug: the dial callout covered the logo.** Fixed pixel offsets and a flip at `width - 250` produced a
dark box across “AURELIS” at 1024 px. Removed the dial callout (the copy already describes it), added
a soft text backdrop, a right-edge flip, a collision pass, and hid all callouts below 1200 px.

The collision test initially measured the zero-size `.callout` container instead of
`.callout__text`; corrected the gate.

## 6. Mobile

The first mobile explosion sat directly on the heading. Three changes fixed it:

- compressed the copy (facts hidden, smaller heading),
- lifted the group during exposure and shrank it by 20%,
- lifted/shrunk further at the finale.

The gate now checks “no horizontal overflow” and “heading top > 330 px” at 390 × 844.

## 7. Verification

The gate grew from a smoke test to 24 checks. Two early assertion bugs are worth recording:

- The caseband does **not** move at the movement chapter (it leaves with the case shell at .55–.75), so
  “caseband x < -1 at t=.5” was wrong. Assert the dial lift and balance exposure at .5; assert the
  caseband at .75.
- The second hand initially lagged the dial by 0.08 units because its late window ended later. Aligned
  the hand windows to the dial's and the hand-tracking test passed.

The gate also checks the colophon brief, the enquiry validation, reduced motion, the render budget and
console cleanliness.

## 8. Release

- Generated `STATE.md`/`state.json` with `node:sqlite` against the live OpenCode session database.
- Added the one-sentence brief and the longer-video contrast to the colophon, README, CREDITS and this
  documentation.
- Added release docs, a licence, third-party notices, CI-style checks, Pages deployment and the
  `calibre-scroll-studio` skill.
- Published the site and the skill catalog; the ledger records time and tokens.

## Lessons for the next agent

1. Measure the scroll map; never hard-code scroll pixels.
2. A fixed stage is almost always what you want for a scroll-driven canvas.
3. Do not align an explosion with the camera's side view. Keep the face readable.
4. Group parts that belong to the same sub-assembly before animating them.
5. Test at `.5` and `.75`; those are different stories.
6. Let the hands ride the dial; small parts floating alone read as bugs.
7. A collision pass for labels is cheaper than hand-tuning offsets.
8. Write the verification before the polish; it catches invisible failures.
9. Keep the brief honest. The small prompt is the interesting part.
