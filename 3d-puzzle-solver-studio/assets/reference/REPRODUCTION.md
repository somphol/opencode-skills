# Reproduction blueprint

This is the complete handoff for rebuilding **Full 3D 15-Puzzle Studio & Auto-Solver** from an empty
directory. It records the exact behaviour, constants and acceptance criteria that are easy to lose
between sessions. Follow it in order.

If you are changing the existing repository, read [AGENTS.md](../AGENTS.md) first. If you are
recreating it, start here, then use [ARCHITECTURE.md](ARCHITECTURE.md) and [SOLVER.md](SOLVER.md)
for depth.

## 1. What is being built

A static, single-page 3D 15-puzzle studio:

- A 4×4 recessed tray rendered with Three.js, 15 bevel-edged numbered tiles, one gap.
- Click/tap, arrow-key and `WASD` sliding with lerp animation and synthesized audio.
- A parity-checked shuffle that can never deal an unsolvable board.
- A* auto-solve with Manhattan + linear conflicts, step hints, an overlay arrow, and live `h / g /
  remaining / nodes` telemetry.
- English/Thai UI, local records, session persistence and a JSON export.
- No backend, no framework, no build step, no package manager.

Non-goals: accounts, leaderboards, cloud sync, multiplayer, analytics, arbitrary puzzle import,
image uploads saved across reloads, or a bundler.

## 2. Reproduction checklist

1. Create the file tree in section 3.
2. Write `index.html` with the regions and ids in section 4.
3. Write `style.css` with the tokens, layout, stage and breakpoints in section 5.
4. Write `script.js` in seven sections; the engine first (section 6).
5. Add the tests and run them (section 9).
6. Generate screenshots with `node scripts/screenshot.mjs`.
7. Add the docs, community files, CI and metadata (section 10).
8. Publish to GitHub Pages at `main` / root and verify the live URL.
9. Record wall-clock time, token usage and check counts in `state.json`.

Acceptance: `?selftest` reports **17/17**, `node --test tests/engine.test.mjs tests/static.test.mjs`
passes, and `node tests/browser.test.mjs` reports **46/46** with zero console errors.

## 3. File tree

```text
.
├── index.html                  # UI shell, import map, modals, self-test overlay
├── style.css                   # design tokens + layout + responsive + reduced motion
├── script.js                   # engine, studio, controller, solver client, self-test
├── assets/
│   ├── studio.png              # 1600×1000 README hero
│   ├── thai.png                # Thai interface
│   ├── mobile.png              # 390×844 capture
│   ├── stage.png               # cropped stage used by the social card
│   ├── og-card.png             # 1200×630 social card
│   └── og.html                 # social-card template (not linked from the app)
├── docs/                       # architecture, solver, testing, deployment, decisions…
├── tests/
│   ├── engine.test.mjs         # 14 pure engine tests
│   ├── static.test.mjs         # repository/document/i18n checks
│   ├── browser.test.mjs        # 46 headless UI checks
│   └── lib/{harness,fixtures}.mjs
├── scripts/screenshot.mjs      # one-session screenshot generator
├── .github/workflows/ci.yml
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── SUPPORT.md
├── THIRD_PARTY_NOTICES.md
├── LICENSE
├── state.json
├── .nojekyll
├── .gitignore
├── .editorconfig
├── robots.txt
└── sitemap.xml
```

## 4. HTML shell

### 4.1 Head

- `<html lang="en">`, viewport with `viewport-fit=cover`, `theme-color #0a0d13`, dark color scheme.
- Title and description; Open Graph and Twitter card pointing at `assets/og-card.png` and the Pages
  URL.
- Inline SVG favicon: dark rounded square with four mini tiles (gold, teal, ice, slate).
- `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>`.
- **Exact pinned import map** (do not change the version casually):

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
  }
}
</script>
```

- `<script type="module" src="script.js"></script>` at the end of `<body>`.

### 4.2 Regions and required ids

```
body
├── svg.sprite                      # icon symbols, aria-hidden
├── .app
│   ├── header.topbar               # brand, status chip, moves/time, lang, sound, help
│   ├── main.layout                 # 3 columns: left panel · stage · right panel
│   │   ├── aside.panel--left       # Play · Tile skin · Records
│   │   ├── section.stage-wrap > .stage
│   │   │   ├── canvas#scene
│   │   │   ├── .stage-top          # #hud-h, #hud-remaining, #btn-camera-top
│   │   │   ├── svg#hint-layer
│   │   │   ├── .stage-legend / .stage-bottom / #assist-badge
│   │   │   └── #loading
│   │   └── aside.panel--right      # #card solver · move log · tip
│   └── footer
├── #modal-help, #modal-win
├── #toast
└── #selftest                       # hidden unless ?selftest
```

Required ids used by tests and script: `app scene stage status-chip status-label hud-moves hud-timer
hud-h hud-remaining stat-h stat-g stat-remaining stat-nodes best-time best-moves streak btn-shuffle
btn-reset btn-undo btn-solve btn-hint btn-stop btn-export btn-camera-reset btn-camera-top btn-sound
btn-help btn-upload btn-skin-clear btn-reset-records btn-clear-log btn-win-again skin-select
skin-file speed speed-label solver-tag solver-note move-log log-empty tip-text upload-name
assist-badge modal-help modal-win win-time win-moves win-best win-note toast selftest selftest-list
selftest-summary`.

Every translatable text node carries `data-i18n="key"`; attributes use
`data-i18n-attr="aria-label:key;title:key"`.

## 5. CSS system

### 5.1 Tokens

```css
--bg:#070a10; --panel:rgba(17,23,33,.82); --line:rgba(148,168,199,.14);
--ink:#eef3fb; --ink-soft:#c3cedf; --muted:#8493a9;
--gold:#f2c879; --teal:#3fd6c4; --ice:#bcd6ff; --ok:#7fe3b0; --rose:#ff8b7d;
--radius:18px; --font: system UI; --font-display: Iowan Old Style/Palatino/Georgia;
--mono: SF Mono/ui-monospace; --ease:cubic-bezier(.22,.7,.24,1);
```

Background: four layered radial gradients (teal top-left, gold top-right, blue bottom, dark base)
plus a faint 64px grid masked from the top centre. `.stage` has its own gradient, dot grid and inset
vignette.

### 5.2 Layout

- `max-width: 1840px`, topbar ~76px, footer ~42px.
- `grid-template-columns: 288px minmax(0,1fr) 312px`.
- Breakpoints: 1440 (narrower panels), 1220 (stage + left; right becomes a 3-column strip below),
  900 (single column, order **stage → left → right**), 560 (compact pills).
- `.stage` min-height 560px on desktop, `58dvh` under 900px. Canvas is absolutely positioned and
  resized by `ResizeObserver`.
- Panels scroll independently on desktop; `overflow: visible` in stacked layouts.

### 5.3 Motion

- Tile slide 172ms, auto-play 118ms, cubic in-out; a small lift and tilt peak mid-move.
- Hint pulse ~620ms; gap outline breathes on a 2.4s sine.
- Hover glow 55ms throttled raycast.
- `prefers-reduced-motion` collapses durations to 0.001ms but never disables gameplay.

## 6. The engine (copy this contract exactly)

The engine is one self-contained factory so it can be stringified into a Worker:

```js
/* ENGINE:START */
function createPuzzle15Engine() {
  const SIZE = 4, CELLS = 16;
  const GOAL = Object.freeze([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]);
  // ...
  return { SIZE, CELLS, GOAL, rowOf, colOf, isSolved, inversions, isSolvable,
           manhattan, linearConflicts, heuristic, legalMoves, move, keyOf,
           directionOf, aStar, solve, shuffle, bfs, MinHeap };
}
const Puzzle15 = createPuzzle15Engine();
/* ENGINE:END */
```

Rules:

- Board is row-major, index 0 = top-left, 15 = bottom-right, `0` = gap.
- `move(board, cellIndex)` moves the tile at that **cell** into the gap and returns a new array, or
  `null` if not adjacent. The UI resolves a tile number with `board.indexOf(value)`.
- `solve()` returns `moves` as **tile numbers**, in order. `optimal` is a boolean.

### 6.1 Solvability

```js
const inversions = (b) => { /* count pairs i<j with b[i] && b[j] && b[i] > b[j] */ };
const rowFromBottom = 4 - Math.floor(b.indexOf(0) / 4); // 1..4
const solvable = (inversions + rowFromBottom) % 2 === 1;
```

Goal: 0 inversions + row 1 = odd → solvable. Swapping any two tiles flips the parity.

### 6.2 Heuristic

```text
manhattan(b) = Σ |row(i) − row(goal−1)| + |col(i) − col(goal−1)|
linearConflicts(b) = 2 × (reversed goal-row pairs + reversed goal-column pairs)
h(b) = manhattan(b) + linearConflicts(b)
```

Linear conflicts only count two tiles that are both in their goal line and inverted relative to each
other. Each pair costs 2: one tile must leave, one must enter. Admissible and consistent.

### 6.3 A*

- Binary min-heap comparator: `f * 10000 + h` — **the tie-break is essential**; without it the same
  boards expand ~5–10× more nodes.
- Closed set: `Map<key, bestG>`. Key is 16 chars, `String.fromCharCode(48 + value)`.
- Skip a popped node if a cheaper `g` is already known.
- Budgets and fallbacks:

| Pass | Weight | Node cap | Time cap | Meaning |
| --- | --- | --- | --- | --- |
| 1 | 1.0 | 500,000 | 6 s | optimal |
| 2 | 1.6 | 700,000 | 12 s | near-optimal |
| 3 | 4.0 | 900,000 | 20 s | guaranteed completion |

- Path is reconstructed from parent indices; the moved **tile value** is stored per node.
- Solved start returns `{ok:true, moves:[], nodes:0}`.
- Unsolvable returns `{ok:false, reason:'unsolvable'}`. Malformed boards return `bad-board`.

Benchmark on a 2020-era laptop (Node 26): 72 random moves → optimal in 8–400ms, 30–56 moves, usually
under 150k nodes; 140 random moves → 24/30 optimal, worst ~1.8s.

### 6.4 Shuffle

Start from `GOAL`, take 72 random legal moves, never immediately reversing the previous move. Then:

- if solved, reshuffle with a longer walk;
- if parity says unsolvable (unreachable, but cheap), apply one legal move.

Never implement a shuffle by assigning random numbers: 50% of those boards are unsolvable.

## 7. 3D studio constants

```js
BASE_FOV = 33;
TILE = 1.78; GAP = 0.07; CELL = TILE + GAP; TILE_H = 0.29;
WELL_HALF = (CELL * 4) / 2 + 0.16;          // 3.86
camera home = (4.7, 14.4, 12.8), target (0, .05, .05)
minDistance 10.5, maxDistance 26, maxPolarAngle π*0.44 (no flipping)
```

- Tray: 8.9 × 0.52 × 8.9 rounded base, felt well, four rails (8.9 × 0.42 × 0.62), gold inlay lines at
  `±(WELL_HALF − 0.09)`, four brass screws.
- Tiles: `RoundedBoxGeometry(1.78, .29, 1.78, 3, .075)` plus `PlaneGeometry(1.566, 1.566)` face
  rotated `-π/2`; tile centre y = `0.055 + TILE_H/2`; face 3mm above the body.
- Gap marker: `LineLoop` rounded square (half-size `TILE*0.34`), gold, pulsing opacity.
- Lights: hemisphere `.62`; shadow-casting key `(6.5,12,6.5)` intensity 2.6, 2048 map; blue rim; warm
  point `(-3.6,5.2,4.8)` 26; teal point `(4.6,3.4,-4.2)` 16. `RoomEnvironment` PMREM for reflections.
- Renderer: antialias, alpha, PCFSoft shadows, ACES tone mapping (.08 exposure), DPR capped at 2.
- **Portrait FOV compensation** in `resize()`: below aspect 1.15, widen vertical FOV to keep
  horizontal coverage ~`BASE_FOV × 1.15`; clamp at 60°. Without this the tray is clipped on phones.

### 7.1 Faces

`makeFaceCanvas(value, skin)` returns a 512² canvas; `CanvasTexture`, sRGB, anisotropy ≤ 8.

- **classic** — ivory gradient, double border, Georgia/Iowan numeral.
- **wood** — procedural grain from a seeded LCG, warm gradient scrim, dark numeral.
- **marble** — light grey, 22 random veins, soft highlights, slate numeral.
- **custom** — image cover-cropped to a square, sliced into 4×4; tile `n` draws slice `n−1`, so the
  picture completes at the goal. A corner badge keeps the number legible.

Cache textures by `${skin}:${value}`. On upload, dispose existing `custom:*` textures.

## 8. Controller and solver client

### 8.1 State

```js
{
  board, history, moves, startedAt, elapsedMs, running, solved, assisted,
  lang, sound, skin, speed, solution, solutionIndex(unused), solving,
  autoPlaying, animating, hintTile, expandedNodes, records,
  statusKey, statusTone, noteKey, noteVars
}
```

`state.solved` is **false after a reset/shuffle even when the board is the goal** — otherwise the
goal layout would be unplayable. Only `finishWin()` sets it true.

### 8.2 Move pipeline

1. Resolve `from = board.indexOf(value)`, `blank = board.indexOf(0)`, check adjacency.
2. Swap on a copy immediately (logic leads animation).
3. If manual or auto: start clock, increment moves, push history, log `value + direction`.
4. If manual: consume the cached solution prefix or invalidate it.
5. `slideTile()` awaits a tween; then persist, update HUD/glow, and finish the win if solved.

Undo validates `board[entry.to] === entry.value` **and** `blank === entry.from`; on drift it rebuilds
the board rather than animating a lie.

### 8.3 Worker

```js
const source = `
  const createPuzzle15Engine = ${createPuzzle15Engine.toString()};
  const Engine = createPuzzle15Engine();
  self.onmessage = ({data}) => self.postMessage({ id: data.id, result: Engine.solve(data.board, data.options) });
`;
new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
```

Keep the factory free of imports and outer references. Requests are id-tagged; a newer request
replaces `pendingRequest`. On worker error, terminate and fall back to the main thread.

### 8.4 Auto-play and hints

- Compute once, cache `state.solution` (tile numbers).
- Auto-play: while `autoPlaying`, move `solution[0]`, then shift, then wait
  `420 − (speed−1)×88` ms. Speed 1–5. Stop terminates the loop via a token.
- Hint: set `hintTile = solution[0]`, mark assisted, pulse the tile and draw the SVG arrow.
- Arrow: project tile and gap with `Vector3.project(camera)`, build a quadratic curve bowed 24% of
  the distance, add a dashed teal path, a circled number and a rotated arrowhead at the gap.
- Redraw on orbit change, resize and language switch. Clear on any move or stop.

### 8.5 Records and persistence

```js
records = { bestTimeMs, bestMoves, streak, solves }
```

- Time = `elapsedMs + (running ? now − startedAt : 0)`, formatted `mm:ss` in the HUD and `Xm YYs` in
  records.
- `assisted` is set by hint or auto-solve; assisted wins never touch records or streak.
- Save after every move with `persistGame(true)` (the throttle is for cosmetic updates only).
- A solved game deletes `p15.game.v1`; a reload with an unsolved saved board restores it and shows
  “Session restored”.

### 8.6 Export schema (`puzzle15.export.v1`)

```json
{
  "app": "Full 3D 15-Puzzle Studio & Auto-Solver",
  "version": "1.0.0",
  "schema": "puzzle15.export.v1",
  "exportedAt": "ISO-8601",
  "language": "en",
  "board": [1, "…", 0],
  "goal": [1, "…", 0],
  "solved": false,
  "moves": 12,
  "assisted": false,
  "elapsedMs": 45210,
  "elapsed": "00:45",
  "heuristic": { "name": "manhattan+linear-conflicts", "manhattan": 28, "linearConflicts": 4, "total": 32 },
  "solution": { "remaining": [3, 7], "length": 2, "nodesExpanded": 4312 },
  "history": [{ "tile": 5, "direction": "up" }],
  "records": { "bestTimeMs": 61000, "bestMoves": 78, "streak": 2, "solves": 4 },
  "skin": "classic"
}
```

## 9. Verification

### 9.1 Engine tests (14)

`node --test tests/engine.test.mjs`. Slices the markers, asserts goal/parity/manhattan/conflicts,
admissibility against BFS on short scrambles, legal-move counts at every blank cell, reversibility,
40 solvable shuffles, path validity for 15 random boards, **A* length equals BFS optimum** at depths
1–7, solved/unsolvable/malformed handling, no repeated state in a path, heap ordering, and a
12-second budget.

### 9.2 Static tests

`node --test tests/static.test.mjs`. Checks files, ids referenced by the script exist, no duplicate
ids, i18n key parity, every `data-i18n`/`data-i18n-attr` key exists, pinned Three.js, docs present,
relative Markdown links resolve, state.json shape, no secrets, `.nojekyll`.

### 9.3 Browser suite (46)

`node tests/browser.test.mjs`. Uses a local server on an ephemeral port, one headless Chrome with
`--use-mock-keychain`, and the DevTools Protocol. Covers the built-in 17-check self-test, boot, 15
meshes, canvas, shuffle, **real raycast click**, arrow key, undo, hint arrow + assisted flag,
auto-solve to victory, modal, Thai/English switching, wood/marble/custom skins, export shape,
reload restore, 390×844 overflow, and zero console errors.

### 9.4 Built-in self-test (17)

`?selftest` renders a results panel and sets `document.body.dataset.selftest` to `pass`/`fail`. It
also checks texture presence, WebGL sizing, worker source validity and Three.js pinning.

## 10. Release checklist

- [ ] `node --test tests/engine.test.mjs tests/static.test.mjs` green.
- [ ] `node tests/browser.test.mjs` → 46/46, zero console errors.
- [ ] `?selftest` → 17/17 on the deployed URL.
- [ ] `node scripts/screenshot.mjs` refreshed assets.
- [ ] README, AGENTS.md, CHANGELOG, state.json current.
- [ ] `git push origin main`; Pages build succeeded; live CSS/JS return 200.
- [ ] Test on a phone viewport (portrait) with the devtools emulator.
- [ ] Confirm no tokens, emails or local paths leaked into tracked files.

## 11. Traps that cost time

1. **Worker stringification** fails the moment the engine touches an import or outer constant.
2. **Returning cell indices** from `solve()` silently breaks hint and auto-play. Return tile values.
3. **Node budget without the `h` tie-break** expands 5–10× more nodes and looks like a slow solver.
4. **`state.solved = isSolved()` on reset** makes the goal layout permanently uninteractive.
5. **Caching a stale solution** across reset/undo produces “hint moves nothing”.
6. **FOV on portrait** clips the tray; compensate in `resize()`.
7. **Loading veil** hides interaction; dismiss it on the second rAF plus a short delay.
8. **`Page.navigate` races** in browser tests; wait for the load event plus a beat and a fresh
   `dataset.ready`.
9. **Clips in `Page.captureScreenshot`** need integer CSS pixels inside the viewport.
10. **CDN cache**: import maps are version-pinned; bumping requires re-testing every addon path.

## 12. Provenance

Built in one OpenCode session on 2026-11-04 with DeepSeek V4.1 Flash. See
[state.json](../state.json) for the session id, elapsed wall-clock time, token counters and the
verification/deployment record, and [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) for
licences.
