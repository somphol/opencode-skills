# Reproducing this project

A guide for another agent or engineer. It assumes the same one-sentence brief and the same
constraints; it does not assume this repository already exists.

## The brief

> “Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that
> disassembles as the user scrolls.”

17 words, typo included. Do not quietly expand it into a full product spec; the small prompt is the
experiment. Record anything you infer as a decision, not as a requirement.

## Preconditions

- Node 22+ (for `node:sqlite` in the ledger tool; the site itself needs no Node).
- Chrome (or Chromium) for the release gate.
- Internet only for `npm install` (dev-only) and the initial vendoring. The finished site must make
  no external runtime requests.
- No 3D models, photography, audio or HDR files. Everything is procedural.

## Build order

1. **Scaffold.** Create `index.html`, `styles.css`, `src/`, `vendor/`, `fonts/`, `scripts/`,
   `screenshots/`. Vendor Three.js r170 and self-host Bodoni Moda (OFL). Add an import map.
2. **Environment.** Build a PMREM studio from an emissive panel scene. Choose polished/brushed gold,
   steel, rhodium, blued steel, ruby and glass materials.
3. **Watch.** Unitless: case radius 1.0. Build in this order: case band → bezel → crystal → dial and
   indices → hands → movement → rotor/caseback → crown → lugs. Print the dial on a 1024 canvas mapped
   to a **flat circle**, not a cylinder cap.
4. **Parts.** Register each top-level assembly with base transform, first window/delta, optional
   second window/delta, and a reassembly delay. Confirm that at `t=1` every part returns to base.
5. **Timeline.** Measure chapter centres: `offsetTop + height/2 - innerHeight/2`. Normalise scroll
   between the first and last centres to `t ∈ [0,1]`. Damp the rendered value. Add `?t=` manual mode.
6. **Camera.** Key azimuth/elevation/distance and a separate watch yaw. Keep the dial readable at the
   hero and dial chapters; orbit ~40° for the movement and case chapters. Pull back to about 6.8 at
   full explosion.
7. **Explosion.** Dial and hands lift to the upper-right; the movement fans in place; the case shell
   leaves as one unit; caseback and rotor travel together to the lower-right. Two stages per part.
8. **Site shell.** Fixed stage behind five full-height chapters; editorial copy on the left; scrim;
   chapter rail; progress; callouts with collision.
9. **Responsive.** Below 900 px: hide rail/callouts, put the watch in the upper half, compress copy,
   lift/shrink the group during exposure and at the finale. Verify at 390 × 844.
10. **Dialogs.** Native `<dialog>` for the fictional enquiry (local validation) and the colophon
    (brief, credits, state).
11. **Verification.** Build the headless gate before polishing: no external requests, WebGL, scroll
    copy, exploded state, hand tracking, reassembly, labels, mobile, reduced motion, console.
12. **Release.** Add docs, licence, notices, state ledger, screenshots, Pages config and the skill.

## File checklist

```
index.html
styles.css
src/main.js
src/watch.js
src/environment.js
vendor/three.module.min.js
fonts/bodoni-moda-latin.woff2
fonts/bodoni-moda-italic-latin.woff2
fonts/OFL.txt
scripts/verify.mjs
scripts/shoot.mjs
scripts/state.mjs
package.json
README.md / AGENTS.md / CREDITS.md
docs/* (architecture, timeline, build log, study, verification, deployment, design)
STATE.md / state.json
screenshots/*
LICENSE / THIRD_PARTY_NOTICES.md / CITATION.cff
```

## Quality gates

- 24/24 headless checks passing.
- No console or page errors.
- No external runtime requests.
- 103 draw calls / 131k triangles at the heaviest state (or lower).
- Every part within 0.05 of base at `t=1`.
- Hero and finale copy legible at 390 px without overlapping the watch.
- A first frame with Bodoni loaded; the dial artwork is never rotated.
- Reduced motion still navigates; the mechanism freezes but the story does not.

## Reuse the method

The `calibre-scroll-studio` skill packages this method: a working template, a scaffold script,
references for the timeline/geometry/verification, and the release procedure. Once installed from the
[OpenCode skills catalog](https://somphol.github.io/opencode-skills/), a new project starts from:

```sh
node ~/.config/opencode/skills/calibre-scroll-studio/scripts/new-project.mjs --out ~/Projects/new-watch
cd ~/Projects/new-watch && npm install && npm run verify
```

Then change the brand, palette, movement detail and chapter copy — not the timeline contract.

## Publish

The site is static: push to `main` and serve the repository root with GitHub Pages. See
[`DEPLOYMENT.md`](DEPLOYMENT.md). The ledger is generated with `npm run state`; do not hand-edit the
token counts.

## Honesty rules

- Keep the brief quote and the longer-video note in the colophon and docs.
- Credit OpenCode, the model, Three.js, Bodoni and the concept reference.
- State what is fictional (the maison, price, watch, appointments).
- Do not claim Safari/Firefox support that has not been tested.
