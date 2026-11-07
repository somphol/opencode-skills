# Architecture

## Principles

1. **No assets.** Every visible surface is geometry, a canvas texture or a baked environment.
2. **No build.** Plain ES modules, one import map, a pinned vendored Three.js.
3. **One timeline.** A single normalized `t` drives camera, rotation, explosion, copy and labels.
4. **Everything returns.** The last scroll state is the assembled watch, not a reset.
5. **The release is testable.** A headless gate owns the definition of done.

## Runtime map

```
index.html
  ├─ loader overlay
  ├─ fixed topbar and chapter rail
  ├─ fixed stage
  │    ├─ canvas#scene
  │    ├─ .stage__halo / vignette
  │    └─ .callouts × 5
  ├─ main
  │    ├─ chapter-hero       t = 0
  │    ├─ chapter-dial       t = .25
  │    ├─ chapter-movement   t = .5
  │    ├─ chapter-case       t = .75
  │    └─ chapter-sum        t = 1   (specs, CTA, colophon link)
  ├─ dialog#enquiry
  └─ dialog#colophon
```

`main` is taller than the viewport; the stage is fixed behind it. The chapter sections are the scroll
track and the copy. Their opacity, vertical offset and `inert` state are updated from `t`.

## Boot sequence

`boot()` in `src/main.js`:

1. Expose the test API (`window.AURELIS`).
2. Bind drag, navigation and dialogs.
3. Wait for Bodoni Moda with a 1.8 s timeout, so the dial canvas is drawn with the real face.
4. Build the renderer, environment, camera, materials and watch.
5. Measure chapter centres and set the initial progress (`?t=` overrides it).
6. Start the request-animation-frame loop.
7. On the first rendered frame, mark ready and fade the loader.

If the renderer throws (no WebGL), the fallback is shown, the loader is dismissed and the editorial
copy remains readable.

## Coordinates and the watch

The watch is unitless for sanity:

- Case radius `1.0`, dial radius `0.884`, crystal radius `~0.915`.
- Face normal is `+Z`; the dial top is `z ≈ 0.03`; the caseback sits near `z = -0.19`.
- The movement occupies roughly `z = -0.11 … 0.03` and `|x|,|y| < 0.85`.
- Lugs extend to `y ≈ ±1.1`; the crown to `x ≈ 1.14`.

`src/watch.js` builds in a fixed order: case band → bezel → crystal → dial and indices → hands →
movement (mainplate, barrel, wheel train, pallet, balance, bridges, jewels, screws) → rotor and
caseback → crown → lugs. Each top-level part is registered with:

```js
{
  basePosition, baseRotation,          // captured at registration
  delta, spin, window,                 // first movement
  late, lateSpin, lateWindow,          // optional second movement
  delay                                // reassembly stagger
}
```

The update is:

```text
first   = smoothstep(window, t)
second  = lateWindow ? smoothstep(lateWindow, t) : 0
retract = smoothstep(.815 + delay, .955 + delay, t)
hold    = 1 - retract
pos     = base + delta * first * hold + late * second * hold
rot     = base + (spin * first + lateSpin * second) * hold
```

The retraction makes the ending scroll-driven. At `t = 1` every part is at its base transform.

The minute/hour hands and seconds sweep come from `watch.update`; the gear train spins with a
visibility-driven speed, the balance oscillates, and the rotor oscillates when exposed. Reduced motion
passes `elapsed = 0` so the mechanism is static while scroll transforms still work.

## The timeline

`measureChapters()` records:

```js
anchor[i] = chapter[i].offsetTop + chapter[i].offsetHeight / 2 - innerHeight / 2
```

Then:

```js
t = clamp((scrollY - anchor[0]) / (anchor[4] - anchor[0]), 0, 1)
```

With equal-height sections the chapters land on `0, .25, .5, .75, 1`; with the current heights the
anchors are still measured, not assumed. The rendered progress is damped:

```js
progress += (target - progress) * (1 - exp(-dt * 5.6))
```

`prefers-reduced-motion` bypasses the damping. `?t=` sets manual mode and scrolls the document to the
matching anchor so the copy and the 3D state agree in screenshots.

## Camera

`CAMERA_KEYS` stores `t, azimuth, elevation, distance, target x/y`; the position is spherical around
the target. `sampleKeyframes()` finds the surrounding keys and applies a smootherstep to the segment.
`WATCH_ROT_Y` separately rotates the watch. The two angles are deliberately not equal: the watch keeps
its dial readable at the hero and dial chapters, turns away during the movement/case chapters, then
returns for the finale. A light pointer parallax and mouse drag add a small offset with damping.

The group is offset to the right on desktop (`x ≈ .55`) so the copy owns the left third. During
exposure it gains 0.2 scale reduction and a small x drift. On portrait it is scaled to `.7`, moved up,
and lifted/scaled further for the finale.

## Environment and materials

`createStudioEnvironment()` builds a six-panel emissive scene — overhead softbox, warm left strip,
cool right strip, frontal fill, backdrop bounce and a narrow specular streak — and bakes it with
`PMREMGenerator.fromScene(scene, 0.035)`. The result is an HDR environment map with no file.

Materials are `MeshPhysicalMaterial` variants: polished/brushed gold, polished/brushed steel,
rhodium, blued steel, ruby, sapphire glass, enamel and dial dark. The PMREM environment does most of
the lighting; four directional lights add modelling and a rotor fill. There are no shadow maps, which
keeps the mobile budget low and suits a floating product.

## Dial and engravings

`createDialTexture()` draws a 1024 px canvas: warm radial enamel, sunburst lines, minute track,
Aurelis signature, “Calibre 07 / Automatique”, “Swiss Made”. The face is a `CircleGeometry`, not a
cylinder cap — cylinder-cap UVs rotate the artwork 90°, a bug found in the first render.

The caseback and movement engravings are circular-text canvases mapped onto rings. The text sits at
canvas radius `.465 × size`; that is deliberately inside the visible band for both rings. Earlier
values placed it in the ring hole, where it was invisible.

## Labels

Each DOM callout has a 3D anchor (part object + local offset). Every frame:

1. `getWorldPosition`, add the offset, project through the camera.
2. Fade by the label's `[start, end]` window.
3. Flip near the right edge; the leader line and text mirror.
4. Try vertical nudges against a 182 × 36 collision box; accept the first free position.
5. Hide when behind the camera or outside the fade.

Callouts are hidden below 1200 px where the watch occupies the space they need.

## UI state

- Chapter copy opacity: smootherstep in/out around each centre; `inert` beyond 55% opacity.
- Rail: active index `round(t * 4)`, fill `scaleY(t)`.
- Stage hint: hidden after `t > .08`.
- Dialogs: native `<dialog>`; the enquiry validates locally; the colophon is static and records the
  brief and credits.
- State: `STATE.md` and `state.json` are generated by `npm run state` from the OpenCode ledger.

## Performance and limits

Measured at `t = .75` in Chrome headless:

- 103 draw calls, 131,468 triangles, 23 registered assemblies.
- Pixel ratio capped at 2.
- One PMREM bake at startup; no per-frame render targets, shadows or post-processing.
- The loader waits for fonts only; the first render marks ready.

The main costs are the extruded organic bridges and the high-segment lathes; they are static except
for part transforms. If the budget grows, merge static caseback details before touching the timer.
