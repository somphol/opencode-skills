# Method

Construction order and invariants for adding a cinematic presentation layer, Step playback,
and release documentation to a static 3D app. The reference implementation is
`assets/cube-lab/`; adapt the order, not the subject matter.

## 1. Start from a working sequence

The app must already know the full sequence of actions before presentation is added. In the
reference, `solveCube()` receives a move list from the solver and loops over it. The camera
director, banner, and glow observe that list; they do not compute it.

If the app has no deterministic sequence, this skill does not apply. Do not fake one.

## 2. Separate the layers

Keep these concerns separate:

- **Plan** — the ordered moves and their metadata (face, layer, duration).
- **Execution** — applying one move, updating the model, recording history.
- **Presentation** — camera, banner, glow, sound, celebration.
- **UI** — dock, speed row, modals, status.

A presentation change must not change the move list or the model. A model change must not
need a camera change.

## 3. Camera director

Order:

1. Save the camera position and target before the show.
2. Disable OrbitControls damping and input; do not mark the camera as user-moved.
3. Define a three-quarter view per face.
4. Before each move, compute whether the working face is visible from the current camera
   direction. If `dot > 0.22`, stay put.
5. Otherwise animate theta/phi/distance in spherical coordinates to the face view. Use the
   shortest angular path. Never lerp position through the cube.
6. On completion, pull back, restore controls, and hand off to the victory orbit.
7. On drag, `Esc`, or Take control, restore controls and let the sequence continue.
8. On `prefers-reduced-motion`, skip camera animation but keep the sequence and controls.

Invariants:

- The camera must not cut through the cube.
- The hero view must be stable; re-framing is the exception.
- The camera must not fight the controls' damping.
- The sequence must not depend on the camera finishing.

## 4. Layer glow

1. Give each sticker its own material clone if the engine shares materials.
2. Store a base colour and a per-sticker glow value/target.
3. On move start, set the selected layer's stickers to target 1 and clear the rest.
4. In the render loop, ease the value (`k = 1 - exp(-dt * 12)`), update emissive and scale,
   and remove settled stickers from the active set.
5. On finish, clear the glow and let it fade.

Invariants:

- The glow is a cue, not a light show. Keep the face colour readable.
- Do not allocate a new material per frame.
- Do not leave the active set growing forever.

## 5. Step playback

1. Add `step` and `stepWaiting` state.
2. `waitForStep()` returns immediately when Step is off; otherwise it stores a resolve
   function, sets `stepWaiting`, and refreshes the UI.
3. `releaseStep()` resolves the gate and clears the flag.
4. `advanceStep()` only acts when Step is on and waiting.
5. In the solve loop: update the banner with the move, wait, then perform the move.
6. Release the gate on Reset, Scramble, and switching to a timed speed. Otherwise the loop
   hangs.
7. Disable Next while a move is animating.
8. Use the same gate in the cinematic and non-cinematic paths.

Invariants:

- The banner must show the move before the wait.
- The gate must be releasable from every cancellation path.
- Next must not queue multiple moves from rapid clicks.

## 6. Release documentation

Write `AGENTS.md` first. It is the short handoff: what it is, commands, architecture,
decisions/constraints, known issues, continuity. Then write the docs set:

- architecture
- testing
- release
- design
- accessibility
- browser support
- performance
- FAQ
- roadmap
- reproduction blueprint
- decision log

The reproduction blueprint must include exact values, UI copy, algorithms, acceptance
criteria, known limitations, and a baseline snapshot. The decision log uses
context/decision/consequences. Link the docs from the README and the docs index.

## 7. Build and CI

Keep the build deterministic. Commit the generated artifact. CI should run the build and
fail if the committed file differs. Do not add a browser test to CI unless the runner has a
WebGL-capable browser; document the manual self-test instead.

## 8. Verification

Prove the sequence and the presentation separately:

- The existing self-test proves model/visual sync and the solver.
- The manual matrix proves camera, Step, reduced motion, and responsive layout.
- The build check proves the artifact matches the source.
- A docs link check and YAML parse prove the release docs are not broken.

## Invariants summary

- One source of truth for the sequence.
- Visual and logical state stay in sync.
- The camera never blocks the action.
- The Step gate never hangs.
- The generated artifact matches the source.
- The docs describe the current behaviour, not a previous version.
