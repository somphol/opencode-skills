# AGENTS.md — Algorithm Explorer

> Read [docs/REPRODUCTION.md](docs/REPRODUCTION.md) first. It is the rebuild book: schemas, phases,
> scene recipes and the bugs that cost time. The runtime map is
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); verification evidence is
> [docs/TESTING.md](docs/TESTING.md); release operations are [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 1. What it is

A static, browser-only 3D study studio for the **top 15 software-engineering interview patterns**. It
has three tabs — a step-through 3D visualizer with synchronized Python/JavaScript/C++ code, a
30-question pattern-recognition quiz, and a 61-problem LeetCode practice tracker with local
checkboxes. Fifteen pure step engines compile custom input into deterministic frames; fifteen
procedural Three.js scenes render those frames. Source is six files (`index.html`, `css/style.css`,
`js/data.js`, `js/algorithms.js`, `js/scene.js`, `js/app.js`) plus tests and docs. No build step, no
backend, no account, no analytics. It is a teaching model, **not** a LeetCode judge, an execution
sandbox, or a proof of algorithmic correctness.

Live: <https://somphol.github.io/algorithm-explorer/> · Local master:
`~/Projects/algorithm-explorer` · Release **1.0.0**, MIT.

## 2. Commands

```bash
# install: none
python3 -m http.server 8080            # http://localhost:8080/
npm start                              # the same server

npm test                               # 47 engine + static checks
npm run test:browser                   # 35 headless-Chrome checks, 0 console errors
npm run verify                         # both
npm run screenshot                     # rewrites assets/studio.png etc.
TEST_URL=https://somphol.github.io/algorithm-explorer/ node tests/browser.test.mjs
```

Node 22+ is required by the browser harness (built-in `WebSocket`). Chrome is found at the standard
macOS path or via `CHROME`; the harness always passes `--use-mock-keychain` so no macOS prompt
appears. The browser suite starts its own static server on a free port.

## 3. Architecture

Load order is fixed: `index.html` → `css/style.css` → Three.js r128 → OrbitControls 0.128.0 →
`js/data.js` → `js/algorithms.js` → `js/scene.js` → `js/app.js`.

- **`js/data.js`** — pure data. `ALGO_DATA.patterns` (15 objects with metadata, problems and three
  code listings), `ALGO_DATA.quiz` (30 questions). Each code line is `{ t, m }` where `m` is the
  semantic mark (`init`, `loop`, `move`, `found`, …). Frames highlight by mark, so the same mark can
  light one line in each language even when line numbers differ.
- **`js/algorithms.js`** — pure engines. `ALGO_ENGINE.run(patternId, input)` returns
  `{ frames, meta, summary, answer }`. A frame is `{ n, title, note, mark, data }`; `data` is
  renderer-agnostic. Parsers raise human-readable errors. `selfTest()` returns 18 checks. No DOM and
  no Three.js references are allowed in this file.
- **`js/scene.js`** — one `WebGLRenderer`, camera, OrbitControls and a rebuildable `dynamicRoot`.
  `setPattern(pattern, result)` disposes the previous root and calls the matching builder; builders
  return an updater `(data) => void`. Shared helpers: `label()` (cached canvas sprites), `tween()`
  (position/scale/colour damping), `placeArrow()`, `curveBetween()`, `layoutTree()`, `beam()`.
- **`js/app.js`** — controller and single source of UI state. It owns the rail, frame playback, code
  highlighting, quiz round, practice filters, localStorage, dialogs, keyboard and `window.__algo`.
  `runSelfTest()` returns 24 checks and writes `body[data-selftest]`.
- **Storage keys** — `algoExplorer.progress.v1` (`{done:{ "pattern:num": true }}`),
  `algoExplorer.prefs.v1` (`patternId`, `language`, `speed`, `explored`),
  `algoExplorer.quiz.v1` (`best`, `attempts`). All reads are defensive.

## 4. Decisions and constraints

- **Three.js is pinned to r128 as classic scripts.** Do not convert to ES modules without replacing
  every global `THREE` use, the OrbitControls URL and the CDN script tags. The app must still boot,
  run the engines and render the code/quiz/practice tabs when Three.js is absent.
- **Frames are deterministic and precomputed.** Do not animate algorithm logic inside
  `requestAnimationFrame`; add a frame in the engine, then teach the scene to render it. This is what
  makes the code sync, the slider and the tests trustworthy.
- **Marks are a contract.** If a frame emits a mark that no line in a language contains, the
  “every frame mark is represented” test fails. Add the mark to all three listings.
- **Do not share mutable materials across meshes.** `label()` textures are intentionally shared via
  `texture.userData.shared = true`; `disposeObject()` must skip those textures. Disposing them breaks
  every future label. Mesh materials are per-object and can be disposed.
- **Backtracking tree keys are bit strings, and the root is the empty string.** `padStart(0)` does not
  produce `''`; the builder special-cases depth 0. Forgetting this overwrites the root and crashes the
  edge pass.
- **Input limits are deliberate.** Keep the visual bounds in the parsers (≤14 array values, ≤4 coins,
  amount ≤20, grid ≤8×10, tree ≤31 slots, edges ≤10). They keep frame counts and draw calls bounded;
  do not remove them casually.
- **No backend and no inline event handlers.** Keep the site deployable by copying the repository.
  Inline `onclick` would break any future CSP.
- **English only.** The product brief asks for one language; do not add a half-finished locale toggle.
- **The problem links are references.** Do not scrape LeetCode or imply affiliation. The curriculum
  is inspired by Grokking/NeetCode/Blind 75, not copied from their paid content.

## 5. Known issues

- The 3D scenes are explanatory models, not to-scale diagrams. Labels can overlap on very narrow
  mobile widths or with long custom strings.
- `three.js` and OrbitControls come from CDNs. Offline use degrades to the non-3D tabs; there is no
  vendored fallback, by design.
- The quiz best score is per browser profile, not synced.
- Custom input is compact by design; there is no JSON tree editor or drag-to-reorder UI.
- There is no service worker, so the live site needs the network on first load.
- The full browser suite takes roughly 60–90 seconds because it builds all fifteen WebGL scenes and
  runs a full 30-question round.

## 6. Continuity

- Deployed copy: <https://somphol.github.io/algorithm-explorer/> (Pages, `main` / root).
- Repository: <https://github.com/somphol/algorithm-explorer>.
- Local master: `~/Projects/algorithm-explorer`.
- Skill: `~/.config/opencode/skills/algorithm-explorer-studio`; catalog backup at
  <https://github.com/somphol/opencode-skills/tree/main/algorithm-explorer-studio>.
- Build record: [state.json](state.json) (session id, elapsed time, token counters, artifact list,
  verification counts, credits).
- Session transcripts live at `~/opencode-transcripts`; they are local-only and never published.
- If you change counts (patterns, problems, quiz), update README badges, `state.json`,
  `tests/engine.test.mjs`, `tests/browser.test.mjs`, `docs/CURRICULUM.md` and this file in the same
  commit. The in-page self-test also asserts 15 / 61 / 30 / 24.
