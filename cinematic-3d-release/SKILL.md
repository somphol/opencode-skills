---
name: Cinematic 3D Release
description: Add cinematic camera choreography, step-by-step playback, and release-grade documentation to a static Three.js app, then verify and publish it.
version: 1.0.0
---

# Cinematic 3D Release

Turn a working static 3D app into a release-grade product: a camera director that makes a
deterministic sequence readable, a Step mode that waits for the viewer, and a documentation
set that lets another agent rebuild it.

`assets/cube-lab/` is a complete reference implementation (CubeLab, a Rubik's Cube solver).
Use it as a **mechanism reference**, not a template to reskin. Replace the subject, copy,
and branding; keep the architecture, camera rules, Step gate, and documentation shape.

## Install

Add the catalog to `opencode.jsonc`:

```jsonc
{
  "skills": ["https://somphol.github.io/opencode-skills/"]
}
```

Or copy this directory to `~/.config/opencode/skills/cinematic-3d-release`.

## When to use

- A static Three.js/WebGL app already has a deterministic action sequence (solver playback,
  replay, guided animation) and the camera stays wherever the user left it.
- The app has play/pause but no way to advance one step at a time.
- The project is about to be published and needs `AGENTS.md`, release docs, a reproduction
  blueprint, and a CI build check.
- The project is one generated HTML file or a small static bundle with no backend.

Not for:

- React/Vue/Svelte apps with a component build. The patterns transfer; the commands do not.
- Apps whose next action is not known in advance (live multiplayer, free-form editing).
- Projects that need a server, accounts, analytics, or cloud state.
- A pure design reskin of the CubeLab asset.

## Workflow

### 1. Scaffold a working reference

```sh
node scripts/new-project.mjs --out ~/my-project
# or, without Node:
sh scripts/new-project.sh ~/my-project
cd ~/my-project
python3 -m http.server 8000
```

Open <http://localhost:8000> and <http://localhost:8000/index.html?selftest>. The self-test
must report `RESULT PASS`. If it does not, stop and read `references/verification.md`.

### 2. Read the method before editing

Read `references/method.md` for the construction order and invariants. Then adapt in this
order:

1. **Separate plan from presentation.** The sequence already knows the moves. The camera,
   banner, and glow observe it; do not change the solver to add presentation.
2. **Add the camera director.** Face views, a visibility threshold, spherical
   interpolation, intro/outro, saved camera state, Take control, and reduced motion. Keep a
   stable hero view; re-frame only when the working face is occluded.
3. **Add the layer glow.** Clone per-sticker materials, set glow targets on the moving
   layer, smooth emissive/scale in the render loop, and clear on end.
4. **Add Step mode.** Add `step` and `stepWaiting` state, a promise gate, Next/Space/N, and
   release the gate on Reset, Scramble, and speed changes. Show the move before waiting.
5. **Add the release docs.** Write `AGENTS.md` first, then the docs set and the
   reproduction blueprint. See `references/release-docs.md`.
6. **Add the build check.** CI runs the build and fails if the generated file differs.
7. **Verify and publish.** Use `references/verification.md` and `references/hosting.md`.

### 3. Verify

```sh
python3 build.py
git diff --exit-code -- index.html
python3 -m http.server 8000
# open http://localhost:8000/index.html?selftest -> RESULT PASS
node scripts/verify.mjs --project ~/my-project
```

`scripts/verify.mjs` runs the build, checks the generated file for the expected UI markers,
and prints the manual browser test URL. It does not replace the browser self-test.

### 4. Publish

Follow `references/hosting.md`. For a project: commit the rebuilt `index.html` and push
`main`; GitHub Pages serves the repo root. For a skill catalog: keep `skills/<id>/` and
`skills/index.json`, enable Pages, and add the base URL to the OpenCode config.

## Module map

- `assets/cube-lab/` — complete reference implementation: source, build, reference docs
  (`project-docs/`, renamed to `docs/` by the scaffold), notices.
- `references/method.md` — construction order and invariants.
- `references/lessons.md` — what regressed and why.
- `references/verification.md` — exact test commands and the manual matrix.
- `references/release-docs.md` — the doc set, AGENTS.md outline, reproduction blueprint.
- `references/hosting.md` — GitHub Pages and skill catalog publishing.
- `references/build-log.md` — the decisions and dead ends from the reference build.
- `scripts/new-project.mjs` — copy the asset, create `.gitignore`/`.nojekyll`, build.
- `scripts/new-project.sh` — POSIX fallback for the same.
- `scripts/verify.mjs` — build and static marker checks.
- `ATTRIBUTION.md` — origin and licence status.

## Recipes

### Camera director

- Store the pre-show camera position/target. Disable OrbitControls damping; do not set
  `userMovedCamera`.
- Interpolate theta/phi/distance in spherical coordinates, never position lerp.
- Use a face view table (three-quarter angles) and a visibility threshold (`dot > 0.22`).
- If the working face is visible, stay on the hero view.
- Use `prefers-reduced-motion` to skip camera movement but keep the solve.
- On Take control/drag/Esc, restore controls and let the sequence continue.

### Step gate

- `waitForStep()` resolves immediately when not in Step mode; otherwise it stores a resolve
  function and sets `stepWaiting`.
- `releaseStep()` resolves the gate and clears `stepWaiting`.
- `advanceStep()` only releases when Step is active and waiting.
- Release the gate on Reset, Scramble, and switching to a timed speed. Otherwise the solve
  loop hangs.
- Disable Next while a move is animating; show the move before waiting.

### Release docs

- `AGENTS.md`: what it is, commands, architecture, decisions/constraints, known issues,
  continuity. Keep it readable in a minute; link to the README.
- Docs set: architecture, testing, release, design, accessibility, browser support,
  performance, FAQ, roadmap, plus a reproduction blueprint and decision log.
- Reproduction blueprint: exact values, UI copy, algorithms, acceptance criteria, known
  limitations, baseline snapshot.
- Decision log: context/decision/consequences per major choice.
- Build check: `python3 build.py && git diff --exit-code -- index.html`.

## Failure boundaries

- Do not copy the CubeLab look or content into a different subject without changing the
  subject, copy, and branding. The asset is a mechanism reference.
- Do not add a backend, accounts, analytics, or remote state.
- Do not edit the generated file; edit the source and rebuild.
- Do not let the camera whip-pan on every move; that is the failure mode this skill exists
  to avoid.
- Do not ship a Step mode that can hang on Reset, Scramble, or a speed change.
- Do not claim screen-reader parity if the 3D state is not exposed as text.
- Do not publish a project whose `?selftest` fails.
