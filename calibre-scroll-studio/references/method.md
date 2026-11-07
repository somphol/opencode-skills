# Method and invariants

## Build order

1. **Scaffold** a zero-build static project. Vendor Three.js (pinned) and self-host the display face.
2. **Bake the studio** before the watch. A PMREM environment is cheaper to tune than dozens of lights.
3. **Build the watch** in assembly order: case → bezel → crystal → dial → hands → movement →
   rotor/caseback → crown → lugs. Capture each top-level part's base transform.
4. **Normalize the scroll** before the explosion. Five chapters, five centres, one `t`.
5. **Register the explosion** in two stages: a small first move, then a late fan. Add the retraction.
6. **Add the copy shell** at the same time as the camera keys. The copy is not decoration; it tells the
   viewer where to look in the 3D scene.
7. **Add callouts** after the parts are stable. They follow parts, so changing the fan invalidates them.
8. **Add mobile** after the desktop composition. Lift/shrink the group rather than redesigning the
   timeline.
9. **Write the gate** before polish. It catches the invisible mistakes (dial UVs, fixed stage, hand
   lag).
10. **Release**: docs, ledger, screenshots, Pages, skill.

## Invariants

- Chapter centres are measured, never assumed: `offsetTop + height/2 - innerHeight/2`.
- `t = 0` is assembled; `t = .75` is the full explosion; `t = 1` is assembled again.
- At `t = 1`, every registered part is within 0.05 of its base transform.
- The dial, hands, caseback and rotor stay visually coherent while moving:
  - hands share the dial's late position/rotation;
  - rotor shares the caseback's delta.
- The case shell leaves as one unit; the movement stays framed until the case chapter.
- The stage is fixed; the chapters are in normal flow above it.
- The site makes no external runtime requests.
- The ledger is generated (`npm run state`), not hand-written.

## Customization order

Change the following in this order; each step is verifiable without touching the next.

1. **Copy** in `index.html`: brand, chapter titles, body, specs, price, footer.
2. **Brand strings in the model**: `AURELIS` on the dial canvas, the bridge/rotor signature, the
   caseback ring in `src/watch.js`.
3. **Palette and type** in `styles.css` (tokens) and `src/environment.js` (material colours, environment
   strips). Keep the value structure; the contrast is tuned.
4. **URLs**: `canonical`, `og:url`, `og:image`, `robots.txt`, `sitemap.xml`, `404.html`, the colophon
   links, the live URL in README/AGENTS.
5. **Watch details**: dial colour/printed marks, case dimensions, movement layout. Keep the unit system
   (case radius 1.0) and the dial's flat-circle face.
6. **Timeline** only if the chapters change; update chapter count, `CHAPTER_T`, camera keys, copy
   windows, labels and the gate assertions together.
7. **Docs and ledger**: update README/AGENTS, run `npm run state` at release.

## Composition contracts

The two screenshots that decide whether the project works:

- **`t=.5` — The Movement.** The dial is lifted upper-right with the hands on it; the case shell still
  frames an exploded movement; the copy is on the left. If the dial still covers the movement, the
  late window is too short. If the movement looks empty, add a bridge/gear, not more camera angle.
- **`t=.75` — The Case.** Case shell left, movement centre, dial upper-right, caseback/rotor
  lower-right; the labels are readable and do not overlap. If any large part is clipped, reduce the
  group scale or camera distance before moving a part.

## File map

```
index.html, styles.css
src/main.js, src/watch.js, src/environment.js
scripts/verify.mjs, scripts/state.mjs, scripts/shoot.mjs
vendor/three.module.min.js
fonts/bodoni-moda-*.woff2, fonts/OFL.txt
docs/ARCHITECTURE.md, TIMELINE.md, BUILD-LOG.md, STUDY.md, VERIFICATION.md, REPRODUCE.md
STATE.md, state.json
screenshots/
```

## Quality bar

- 24/24 checks, clean console.
- No external runtime requests.
- 103 draw calls / 131k triangles or better at `.75`.
- Every part returns.
- 390 × 844 without overflow or copy/watch collision.
- Reduced motion still tells the story.
- A visitor can find the brief, the credits and the ledger from the page (colophon).
