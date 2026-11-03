# Build log

Why the reference implementation looks the way it does, including the dead ends. This is
the session knowledge that is expensive to rediscover.

## Starting point

The reference is CubeLab, a static Three.js Rubik's Cube. It already had:

- a 26-cubelet visual cube and a logical `Cube` model;
- drag-to-turn, a face dock, and keyboard moves;
- a Kociemba two-phase solver in a Blob worker with a main-thread fallback;
- a solve loop that played a move list;
- a browser self-test.

The new work was **presentation and release**, not a new solver. That distinction matters:
the camera director, glow, and Step gate observe the existing move list.

## Camera: stable hero view, not per-move framing

The first instinct was to frame every move. That is the failure mode: the camera becomes a
metronome, and the viewer loses the cube. The implemented rule is:

- keep a hero three-quarter view;
- compute the working face's visibility from the camera direction;
- re-frame only when `dot <= 0.22`;
- interpolate spherical coordinates, never position;
- return to the hero view for the outro.

The D view is deliberately slightly below the equator (`phi = 118°`) so the bottom face is
visible without going fully underneath. The B view is `theta = 162°`, a three-quarter rear
view rather than a flat back view.

## Glow: tuned down

The first glow pass used emissive `base × (0.02 + glow × 0.58)` and intensity
`1 + glow × 0.55`. It washed the face colours into pastel. The shipped values are
`0.34`/`0.32` with a `0.14` cyan tint. The glow is a cue, not a light show.

## Banner and cinematic layout

- A scramble banner scheduled with `showBannerFor(6500)` could hide the solve banner
  mid-run. `updateBanner()` now clears `bannerTimer` whenever it shows.
- Hiding the dock with `opacity: 0` left its layout space, pushing the banner up over the
  cube. Cinematic mode uses `display: none` for the dock/speed row/hint so the banner sits
  at the bottom.
- A short-screen media query hid the banner entirely. Cinematic mode overrides it with
  `display: grid`.
- On phones, the fifth action button overflowed. The Auto Solve label hides at `<= 620 px`;
  the button keeps an `aria-label`.

## Step mode: a real gate

Step mode started as a one-shot pause, but that conflicts with the existing pause loop. The
shipped design is a promise gate:

- `waitForStep()` stores a resolve function and sets `stepWaiting`;
- `releaseStep()` resolves and clears it;
- `advanceStep()` only releases when Step is active and waiting;
- Reset, Scramble, and switching to a timed speed release the gate.

The first version forgot the release on speed change, which hung the loop. The test now
covers click Next, `N`, and switching to Fast mid-solve.

The cinematic speed row is hidden, so the Pause button disappeared. The fix was a dedicated
cinematic control group with Pause/Next and Take control. The Pause button also becomes Next
in the normal speed row.

## Docs: audit the claims

The first release docs mentioned import/export, saved state, and exports that CubeLab does
not have. The fix was to audit every claim against the code and rewrite
SECURITY/CONTRIBUTING/PR template.

Other corrections:

- The solver is not optimal. "20 moves or fewer" became "around 20 moves".
- The code of conduct had a personal email. It now uses the private reporting form and the
  GitHub profile.
- The generated file drift was not guarded. A CI build check now rebuilds and fails on a
  diff.

## CI and verification

The build check is deliberately narrow: it proves `index.html` matches `src/`. The browser
self-test remains manual because a headless WebGL browser is not guaranteed in CI. The
manual matrix covers camera, Step, reduced motion, responsive layout, and accessibility.

The self-test covers the cube contract, not the presentation. The Step gate and cinematic
viewpoints were added to the self-test because they are cheap to assert; the camera motion
itself still needs eyes.

## Deployment

GitHub Pages serves `main` at the repository root. The build workflow and the Pages workflow
both succeeded on the reference. Pages can serve the previous build for a minute; verify a
new string, not just HTTP 200.

## Reference commits

- `c93da6a` — cinematic Auto Solve + Step playback.
- `35df0de` — release-grade docs, CI build check, question template.
- `1b2120e` — reproduction blueprint and decision log.

The source is the canonical implementation. These hashes are a snapshot, not a permanent
API.
