---
name: 3D Puzzle Solver Studio
description: Build a tactile 3D sliding-puzzle studio with a parity-safe shuffle, an A* solver in a Web Worker, bilingual UI, local records, headless verification and a GitHub Pages release.
version: 1.0.0
---

# 3D Puzzle Solver Studio

This skill turns “make me a 3D 15-puzzle with a solver” into a shipped, verified product: a recessed
Three.js tray, guaranteed-solvable shuffles, A* with Manhattan + linear conflicts, step hints, a
bilingual interface, local records, JSON export, three test layers, release documentation and a live
GitHub Pages URL.

It is written from a completed build: **Full 3D 15-Puzzle Studio & Auto-Solver** — 31 Node checks,
17 in-page checks, 46 headless browser checks, zero console errors. The full reference source is in
`assets/reference/`; the live product is at
<https://somphol.github.io/full-3d-15-puzzle-studio/>.

## When to use

Use it when the user wants:

- a 3D (or 2.5D) sliding puzzle, 15-puzzle, or any “slide tiles into order” game;
- an A* / heuristic visualiser attached to a puzzle;
- a parity-checked shuffle with a guarantee, not a hopeful random assignment;
- a static, backend-free educational game with English/Thai (or another pair) UI;
- a release-grade repository with tests, docs, screenshots and Pages.

Do **not** use it for a Rubik’s cube (different state model, notation and solver), a match-3 or
physics puzzle, or a multiplayer game. The engine contract here is specific to sliding tiles.

## What “done” means

Do not stop at “it renders”. A release has all of these:

| Gate | Command | Expected |
| --- | --- | --- |
| Engine + repo | `node --test tests/engine.test.mjs tests/static.test.mjs` | 31/31 |
| In-page | `?selftest` | 17/17 |
| Real browser | `node tests/browser.test.mjs` | 46/46, zero console errors |
| Live copy | `TEST_URL=https://… node tests/browser.test.mjs` | 46/46 |
| Visuals | `node scripts/screenshot.mjs` | 5 fresh assets |
| Docs | README, AGENTS, 12 docs, community files | links resolve |
| Metadata | `state.json`, licence, sitemap, social card | shape valid |
| Deployment | Pages 200 for `/`, `/style.css`, `/script.js` | live |
| Handoff | `AGENTS.md` in the **same push** | current |

If a number is lower, fix the cause; do not edit the claim.

## Non-negotiables

1. **The engine is pure and stringifiable.** One self-contained factory between markers. No imports,
   no outer constants. The Worker is built from `createEngine.toString()`. The tests slice the same
   markers. Break this and both the Worker and the tests fail.
2. **`solve()` returns tile numbers, not cell indices.** “Slide tile 9” is the UI’s language. Cell
   indices leak into hint/auto-play and silently do nothing. This exact bug cost a debugging cycle.
3. **Every shuffle is parity-checked.** For 4×4: `(inversions + blankRowFromBottom) % 2 === 1`.
   Random assignment is wrong half the time. Walk from the goal, then verify.
4. **Never claim optimality you do not have.** The optimal A* pass is budgeted. A weighted fallback
   returns a longer path; label it “near-optimal” and expose `optimal: false`.
5. **`state.solved` is false after reset/shuffle**, even when the board is the goal. Otherwise the
   goal layout is permanently uninteractive.
6. **A cached solution is either consumed or invalidated.** If the user follows the prefix, shift it;
   if they deviate, clear it. Stale hints are worse than no hints.
7. **No backend, no tracking, no framework, no build step.** Three files, pinned Three.js, local
   storage, static host.
8. **Pin Three.js to one exact version** in the import map. Addon paths move between versions.
9. **Records are unassisted only.** Hint or auto-solve sets `assisted`; assisted wins never touch
   best time, fewest moves or streak.
10. **Portrait needs a wider FOV.** A fixed 33° camera clips the tray on a 390px phone.

## Workflow

### Phase 0 — scope and skeleton (15 min)

- Decide: 4×4, 15 tiles, one gap, 3D orbit, A* + hints, bilingual, records, export.
- Create the repository with `index.html`, `style.css`, `script.js`, `assets/`, `docs/`, `tests/`,
  `scripts/`.
- Write the README headline and the AGENTS.md skeleton now; both will be checked at the end.
- Pin Three.js `0.169.0` in the import map. Use an import map, not a bundler.

### Phase 1 — engine before pixels (the highest-leverage phase)

Build and test the rules with no rendering:

1. Board as a 16-number array; goal `[1..15, 0]`.
2. `inversions`, `isSolvable`, `manhattan`, `linearConflicts`, `heuristic`, `legalMoves`, `move`,
   `keyOf`, `directionOf`, `shuffle`, `solve`, `bfs`.
3. A* with the `f*10000 + h` heap tie-break. Budget: 500k nodes / 6 s optimal; 1.6-weighted 700k /
   12 s; 4-weighted 900k / 20 s.
4. Return **tile numbers** from `solve()`.
5. BFS reference solver for tests only.

**Gate:** `node --test tests/engine.test.mjs`. It must prove A* length equals BFS optimum at depths
1–7, not merely that a path is valid. See [references/ENGINE.md](references/ENGINE.md).

### Phase 2 — scene and feel

Build the tray and tiles with the constants in [references/SCENE.md](references/SCENE.md):
`TILE=1.78`, `GAP=.07`, `CELL=1.85`, `TILE_H=.29`, camera home `(4.7,14.4,12.8)`, fov 33.

- Recessed wooden tray: rounded base, felt well, four rails, gold inlay, brass screws.
- 15 tiles: rounded box body + separate face plane with a 512² canvas texture.
- Skins: classic, wood, marble, custom image sliced 4×4 (tile `n` → slice `n−1`).
- Lights + PCF soft shadows + PMREM environment.
- Pointer raycast with a 7px drag threshold; arrow/WASD keys; 172ms slide tweens.
- SVG hint arrow projected through the camera.

**Gate:** 15 meshes, a real click slides a tile, mobile portrait fits.

### Phase 3 — controller, solver client, UI

- Move pipeline: logic first, animation second, persistence after.
- Worker from the engine factory; main-thread fallback; id-tagged requests; stop token.
- Auto-play 1×–5×, step hint, assisted flag, live `h / g / remaining / nodes`.
- Two dictionaries with identical key sets; re-apply dynamic status/note/toast after a language
  switch.
- Records, session restore, JSON export (`puzzle15.export.v1`).
- Web Audio synthesis: slide, thud, hint chime, five-note fanfare.

**Gate:** `?selftest` 17/17, including i18n symmetry and worker source parsing.

### Phase 4 — real-browser verification

Write `tests/lib/harness.mjs` (static server on an ephemeral port, Chrome with
`--use-mock-keychain`, CDP client) and `tests/browser.test.mjs`. The most valuable check is a
**projected raycast click**: project a tile’s world position through the live camera, dispatch real
mouse events, assert the move count changed.

**Gate:** 46/46, zero console errors. Regenerate screenshots with the same harness.

### Phase 5 — documentation

At minimum: README, AGENTS, CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, LICENSE,
THIRD_PARTY_NOTICES, and docs for architecture, reproduction, solver, design, testing, deployment,
decisions, accessibility, performance, FAQ, privacy and roadmap. The reproduction blueprint must
contain exact constants and acceptance criteria — not a vibe.

### Phase 6 — publish and verify live

Create the repository, push `main`, enable Pages at `/`, wait for the build, then run the browser
suite against the live URL. A local pass is not a deployment check. Details:
[references/PUBLISH.md](references/PUBLISH.md).

### Phase 7 — capture and credit

- Read the session’s start time and token counters from the OpenCode database into `state.json`.
- Record elapsed wall-clock time, line counts, check counts, deployment URL and credits
  (OpenCode + the model).
- Make sure `AGENTS.md` is in the same push as the code.
- Optionally publish the working method as a skill (the one you are reading).

## Order matters

```text
rules → engine tests → scene → interaction → controller → solver client
      → i18n/persistence → self-test → browser suite → docs → deploy → state.json
```

Skipping engine tests means every later bug looks like a rendering bug. Skipping the browser suite
means the first person to click a tile discovers the raycast offset.

## Pitfalls and fixes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hint does nothing; auto-solve stops immediately | `solve()` returned cell indices | Return tile numbers; resolve with `board.indexOf(value)` |
| Board frozen after “Solved state” | `state.solved = isSolved()` on reset | Fresh sessions are playable: set `false` |
| Solver takes seconds on easy boards | heap ordered by `f` only | Tie-break `f*10000 + h` |
| Auto-solve silently does nothing | clicked while `state.animating` | Wait for the move promise or queue the action |
| Tray clipped on phones | fixed vertical FOV | Widen FOV when aspect < 1.15 |
| Worker throws `ReferenceError` | engine touched an import/outer const | Keep the factory pure; test `new Function(source)` |
| Language switch resets status/note | static `data-i18n` overwrote dynamic text | Re-apply status key, note key and visible toast |
| Reload loses the last move | throttled persistence | Force-save after every move |
| Browser suite times out after navigation | evaluating in the old context | Wait for `Page.loadEventFired` + a beat + `dataset.ready` |
| Screenshot clip invalid | fractional clip or wrong API shape | Integer CSS pixels inside the viewport |
| Repeated macOS Keychain prompts | every Chrome launch touches the login keychain | `--use-mock-keychain`, throwaway profile, one instance |
| Local server serves the wrong project | fixed port already taken | Bind port 0 / find a free port |
| Thai layout overflows | longer labels | Test 390px; allow wrapping; avoid fixed widths |
| Records set by Auto-solve | no assisted flag | Mark hint/auto assisted; exclude from records |
| Scaffold rename reverts on boot | title hardcoded in JS | Keep the title in the i18n dictionary and rename it there too |

## Adapting to another puzzle

- **3×3 / 5×5:** parameterise `SIZE` everywhere (engine, tray, texture slicing, FOV) and change the
  solvability rule for odd widths (inversions only). Re-run BFS depth checks.
- **2D canvas:** keep the entire engine and controller; replace the Three.js studio with a 2D board
  and projected hint arrow. The tests still apply unchanged.
- **Non-English UI:** add a third dictionary; the self-test’s key-symmetry check is the guard.
- **Different picture:** the custom-skin path already slices any image; no code change.
- **Another puzzle (Rubik’s, Klotski):** reuse the architecture — pure engine, stringifiable worker,
  three test layers, one page, honest solver labelling — not the sliding-tile rules.

## Reference implementation

`assets/reference/` is a snapshot of the shipped v1.0.0 source (`index.html`, `style.css`,
`script.js`), the engine test, and the reproduction/solver docs. Scaffold a fresh copy:

```sh
node scripts/scaffold.mjs ~/Projects/my-puzzle-studio
cd ~/Projects/my-puzzle-studio
node --test tests/engine.test.mjs
python3 -m http.server 8000
```

Then open `?selftest`. Verify the scaffold with:

```sh
node scripts/verify-browser.mjs http://localhost:8000/
```

The snapshot is a reference, not a template to reskin blindly. Read
[references/ENGINE.md](references/ENGINE.md) before changing the engine contract.

## Files

| File | Purpose |
| --- | --- |
| [references/ENGINE.md](references/ENGINE.md) | Parity, heuristics, A*, budgets, Worker |
| [references/SCENE.md](references/SCENE.md) | Tray, tiles, textures, camera, raycast, tweens |
| [references/UI.md](references/UI.md) | Layout, i18n, audio, storage, export, hint arrow |
| [references/VERIFY.md](references/VERIFY.md) | Three test layers, CDP harness, screenshots |
| [references/PUBLISH.md](references/PUBLISH.md) | Repo, Pages, state.json, credits, catalog |
| [references/CHECKLIST.md](references/CHECKLIST.md) | Copy-paste release checklist |
| `scripts/scaffold.mjs` | Create a runnable project from the reference snapshot |
| `scripts/verify-browser.mjs` | Generic boot/self-test/console smoke check for any URL |

## Provenance

Built by Somphol Boonjing with OpenCode × DeepSeek V4.1 Flash, 2026-11-04. MIT. See
[ATTRIBUTION.md](ATTRIBUTION.md).
