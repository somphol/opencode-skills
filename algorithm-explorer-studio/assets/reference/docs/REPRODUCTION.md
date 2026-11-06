# Reproduction book

This is the rebuild manual for **Algorithm Explorer: Top 15 SWE Interview Patterns**. It is written
so another agent can recreate the product from an empty directory without reading the original
session. It is deliberately concrete: schemas, scene recipes, phases, commands and the mistakes that
actually cost time.

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the runtime map and [TESTING.md](TESTING.md) for the gate
definitions.

---

## 0. Product contract

Build a static, browser-only 3D educational app with exactly three tabs:

1. **3D Visualizer Studio** — 15 patterns, each with a distinct Three.js scene, deterministic
   step-through playback, custom input, and synchronized Python/JavaScript/C++ code highlighting.
2. **Interview Quiz** — 30 pattern-recognition scenarios with immediate feedback, explanations and a
   local best score.
3. **Practice & Exercises** — 61 canonical LeetCode problems grouped by pattern, filterable, with
   checkboxes persisted in `localStorage`.

Constraints:

- No framework, bundler, package dependency, backend, build step or analytics.
- Three.js via pinned CDN, classic global scripts (not ES modules).
- Deploy by pushing the repository root to GitHub Pages.
- Zero console errors in the headless suite.
- Every count you display must be asserted by a test.

Non-goals: a code execution sandbox, a LeetCode clone, a proof of correctness, bilingual UI, user
accounts, cloud sync.

---

## 1. Recommended build order

Do not start with visuals. The order below keeps the hard contracts testable while the surface area
is small.

| Phase | Output | Gate |
| --- | --- | --- |
| 0 | Directory skeleton, README headline, AGENTS skeleton | files exist |
| 1 | `js/data.js` (patterns, code, problems, quiz) | Node can require it; counts 15 / 61 / 30 |
| 2 | `js/algorithms.js` (parsers + 15 engines + self-test) | `ALGO_ENGINE.selfTest()` 18/18 |
| 3 | `index.html` + `css/style.css` shells | three tabs, 15 rail items, no layout overflow |
| 4 | `js/scene.js` + `js/app.js` | every scene builds, no uncaught errors |
| 5 | tests (`engine`, `static`, `browser`) | 27 + 20 + 35 + 24 |
| 6 | docs, screenshots, community files, state | links resolve; counts agree |
| 7 | GitHub release + live verification | Pages 200; live browser suite passes |

A useful checkpoint after phase 2:

```bash
node -e "require('./js/data.js'); const e=require('./js/algorithms.js'); console.log(e.selfTest())"
```

---

## 2. Data schema (`js/data.js`)

The file is a UMD-style IIFE that assigns `window.ALGO_DATA` and exports under CommonJS for tests.

```js
{
  id: 'two-pointers',            // stable slug, used by rail, quiz, storage
  index: 1,                      // 1..15, displayed with padStart(2, '0')
  title: 'Two Pointers',
  kicker: 'Opposing indices, one pass',
  signal: 'Sorted arrays, pair sums, in-place partitioning, palindromes.',
  description: 'Move two indices ...',
  time: 'O(n)', space: 'O(1)',
  visual: 'Floating value cubes with two glowing pointer beams that converge.',
  accent: '#57d7ff', accent2: '#1d7bff',
  defaultInput: '2, 7, 11, 15 | 9',
  inputLabel: 'Sorted array | target',
  inputHint: 'Comma-separated sorted numbers, then a target after |.',
  problems: [{ name, num, difficulty, url }],   // >= 4
  code: {
    python:     [{ t: 'def ...', m: 'init' }, ...],
    javascript: [{ t: 'function ...', m: 'init' }, ...],
    cpp:        [{ t: 'vector<int> ...', m: 'init' }, ...]
  }
}
```

Rules:

- `url` must be `https://leetcode.com/problems/<slug>/`.
- Every code listing is an array of `{ t, m }`; indentation lives inside `t`.
- Marks are semantic, not line numbers: `init`, `loop`, `check`, `move`, `found`, `done` and
  pattern-specific marks (`pop`, `push`, `visit`, `merge`, `emit`, `choose`, `reverse`, `cycle`, …).
- A frame's `mark` must occur in **all three** listings. Assert this in tests.
- Keep snippets 8–17 lines. They are teaching extracts, not full production code.

Pattern-specific metadata that the scene/app reads:

| id | `defaultInput` | meta fields |
| --- | --- | --- |
| `two-pointers` | `2, 7, 11, 15 \| 9` | `nums`, `target`, `sorted` |
| `sliding-window` | `abcabcbb` | `s`, `best`, `bestRange` |
| `fast-slow` | `7 \| 3` | `next`, `count`, `cycleAt` |
| `merge-intervals` | `1,3; 2,6; 8,10; 15,18` | `intervals`, `original` |
| `monotonic-stack` | temperatures | `temps` |
| `top-k` | `3, 2, 1, 5, 6, 4 \| 2` | `nums`, `k` |
| `binary-search-answer` | `3, 6, 7, 11 \| 8` | `piles`, `h`, `max` |
| `tree-dfs` | level order `\|` target | `tree`, `target` |
| `tree-bfs` | level order | `tree` |
| `graph-traversal` | `11000/11000/00100/00011` | `grid`, `rows`, `cols` |
| `backtracking` | `1, 2, 3` | `nums`, `depth` |
| `dynamic-programming` | `1, 2, 5 \| 11` | `coins`, `amount`, `inf` |
| `cyclic-sort` | `3, 0, 1` | `n`, `original` |
| `reverse-linked-list` | `1, 2, 3, 4, 5` | `values`, `originalLinks` |
| `union-find` | `1,2; 1,3; 2,3` | `nodes`, `edges` |

Quiz schema:

```js
{ pattern: 'sliding-window', q: '...', options: ['...','...','...','...'],
  answer: 0, explain: '...' }
```

Exactly one correct index. Four unique strings. Every `pattern` must exist.

---

## 3. Frame schema and engine contract (`js/algorithms.js`)

```js
ALGO_ENGINE.run(patternId, input)
// => {
//   frames: [{ n, title, note, mark, data }],
//   meta: {...},        // static facts used by the scene builder
//   summary: '...',     // shown in the UI and tests
//   answer: ...,        // canonical result; last frame exposes it
//   patternId
// }
```

`data` must be JSON-serializable. Never put `Infinity` in a frame: `JSON.stringify` turns it into
`null` and the scene renders a hole. DP uses `INF = 99` and the scene prints `∞`.

Each engine is a closure that pushes frames with a local `push(title, note, mark, data)` helper. This
keeps numbering and naming consistent. Frame 1 is always an `init`/setup frame; the last frame is
usually `done`.

### Parser rules

| Helper | Accepts | Rejects |
| --- | --- | --- |
| `splitPair` | `data \| parameter` | missing `\|` |
| `numberList` | commas/whitespace/`[]` | non-integers, empty, > 18 values |
| `intervalList` | `a,b; c,d` | reversed or malformed pairs |
| `edgeList` | `a,b; c,d` | node ids outside 0–20, > 10 edges |
| `levelOrder` | values/`null`/`-` | empty, > 31 slots |
| `gridRows` | `/` or newline rows | non-binary, ragged, > 8×10 |

Errors are user-facing sentences. The app prints them inline and keeps the previous trace.

### Canonical answers (use these as test fixtures)

| Pattern | Default answer |
| --- | --- |
| Two Pointers | `[0,1]` |
| Sliding Window | `3` |
| Fast & Slow | `true` (meet at node 4) |
| Merge Intervals | `[[1,6],[8,10],[15,18]]` |
| Monotonic Stack | `[1,1,4,2,1,1,0,0]` |
| Top K | `5` |
| Binary Search on Answer | `4` |
| Tree DFS | `[[5,4,11,2],[5,8,4,5]]` |
| Tree BFS | `[[3],[9,20],[15,7]]` |
| Graph Traversal | `3` |
| Backtracking | 8 subsets |
| DP | `3` |
| Cyclic Sort | `2` |
| Reverse Linked List | `[5,4,3,2,1]` |
| Union-Find | `[2,3]` |

### Frame data by pattern (minimum contract)

- **two-pointers**: `{l,r,sum,found,nums,target,direction?}` (found is `[i,j] | null`)
- **sliding-window**: `{s,left,right,seen,window,best,bestRange,duplicate?,length?}`
- **fast-slow**: `{next,slow,fast,steps,meet}`
- **merge-intervals**: `{intervals,merged,active,phase}` where `phase` is `sort|inspect|merge|push|done`
- **monotonic-stack**: `{temps,stack,answer,i,popped}`
- **top-k**: `{nums,k,heap,i,action,swaps,removed?}`
- **binary-search-answer**: `{piles,h,lo,hi,mid,hours,feasible,max}`
- **tree-dfs**: `{node,path,pathIds,remaining,found,out}` plus `meta.tree`
- **tree-bfs**: `{level,queue,current,row?,out,done}` plus `meta.tree`
- **graph-traversal**: `{rows,cols,grid,visited,islandOf,current,count,island,phase}`
- **backtracking**: `{nums,bits,path,out,abandoned,index,action}` where `action` is
  `init|enter|emit|backtrack|done`
- **dynamic-programming**: `{coins,amount,table,r,c,deps,action}`
- **cyclic-sort**: `{nums,n,i,swapped,missing,phase}`
- **reverse-linked-list**: `{values,links,prev,curr,next,reversed}`
- **union-find**: `{nodes,edges,parent,edge,roots,cycleEdge,action}`

---

## 4. Scene recipes (`js/scene.js`)

One renderer. One `THREE.Scene`, one `PerspectiveCamera`, one `OrbitControls`, one `dynamicRoot`
group that is disposed and rebuilt when the pattern changes. All geometry is procedural. Labels are
canvas textures on sprites, cached by text/colour.

Shared atmosphere: transparent CSS background, `FogExp2(0x050912, 0.015)`, hemisphere + key + rim
lights, accent point light, 300 star points, a dark disc platform with an accent rim, and a subtle
grid. A `tween()` system eases position/scale/colour/emissive/opacity every frame.

Camera homes (`pos`, `target`, `fov`):

| Pattern | Camera |
| --- | --- |
| Two Pointers | `[0,6.5,13]`, fov 42 |
| Sliding Window | `[0,6.5,12]`, fov 44 |
| Fast & Slow | `[0,8.5,13]`, fov 44 |
| Merge Intervals | `[0,8.5,15]`, fov 44 |
| Monotonic Stack | `[1,9.5,16]`, fov 44 |
| Top K | `[0,6.5,16]`, fov 46 |
| Binary Search Answer | `[0,7.5,14]`, fov 44 |
| Tree DFS/BFS | `[0,6.6,15.5]`, fov 44 |
| Graph | `[0,10,14]`, fov 46 |
| Backtracking | `[0,6.6,15.5]`, fov 46 |
| DP | `[0,9.5,16]`, fov 44 |
| Cyclic Sort | `[0,8.5,13]`, fov 44 |
| Reverse List | `[0,5.5,16]`, fov 44 |
| Union-Find | `[0,8.5,13]`, fov 44 |

Scene recipes:

1. **Two Pointers** — row of rounded cubes, value labels, two vertical beam groups (`L` cyan, `R`
   orange); beams track `l`/`r`; matched cubes turn green; top label `sum · target`.
2. **Sliding Window** — character cubes, translucent volumetric box scaled to the window, best-range
   bar underneath; top label shows the current string and best length.
3. **Fast & Slow** — nodes on a circle with link lines, slow cyan sphere + fast orange sphere,
   dashed orange back-edge, meet pulse.
4. **Merge Intervals** — time axis, one bar per sorted interval at separate depths; result row of
   merge bars at `y=2.4`; active input bar glows violet.
5. **Monotonic Stack** — temperature columns on a time axis, answer badges above, stack tower at
   `x=6.2,z=2.3` with value labels; pops flash red.
6. **Top K** — array cubes left, binary min-heap tree right; heap positions computed from level and
   index; edges re-orient; root highlighted.
7. **Binary Search on Answer** — number line with ticks, range bar, three beams (`lo`, `mid`, `hi`),
   probe label with hours and feasibility.
8. **Tree DFS** — level-order tree, node spheres, cylinders, path highlight by `pathIds`, cursor halo,
   found-path green; top status shows remaining sum.
9. **Tree BFS** — same tree plus a horizontal translucent level plane, level-coloured node pulses,
   status row shows the current level row.
10. **Graph Traversal** — voxel grid: land raised, water flat/translucent; visited cells take a
    palette colour by `islandOf`; current cell white and a ripple ring.
11. **Backtracking** — complete binary decision tree (depth = n); root key `''`; active bits glow,
    ancestors dim violet, abandoned include-subtrees turn red wireframe; leaf labels are subsets.
12. **Dynamic Programming** — coins × amounts cuboid grid, height from `dp` value, current cell
    white, dependency cells yellow, dependency lines, answer label.
13. **Cyclic Sort** — numbered slots on a circular track, cylindrical tokens, token position follows
    its value, current token glows, missing hole label.
14. **Reverse Linked List** — node cubes on an x-axis, per-node arrow objects re-oriented each frame;
    reversed edges green; prev/curr/next halos.
15. **Union-Find** — nodes on a circle, curved union edges, palette by root, root halos, redundant
    edge red.

Common pitfalls:

- `ExtrudeGeometry` for rounded boxes must be `geometry.center()` or bars sit half below the floor.
- Label textures are shared. Set `texture.userData.shared = true`; skip them in `disposeObject()`.
- OrbitControls must be loaded after Three.js and before `scene.js`; guard `if (THREE.OrbitControls)`.
- Do not put the camera inside the platform. The target should be around `y=0.5`.
- Keep pixel ratio at `min(devicePixelRatio, 2)`; mobile 3× otherwise melts.
- `renderer.outputEncoding = THREE.sRGBEncoding` on r128; `outputColorSpace` is for later versions.

---

## 5. UI contract (`index.html`, `css/style.css`, `js/app.js`)

Layout (desktop): 236 px rail · fluid stage · 316 px inspector; code panel spans stage + inspector.
At 1120 px the inspector moves under the stage; at 860 px everything is a single column and the rail
becomes a horizontal scroller.

Tabs are real `role=tab` buttons controlling `role=tabpanel` sections. The visualizer contains:

- stage header (index, title, kicker, time/space badges, reset camera);
- `#stage` canvas with loading overlay, drag hint and legend;
- transport (prev, play, next, reset, step slider, speed);
- inspector panels (signal/description, current step, custom input, 3D mode + problem chips);
- code panel with three language tabs, copy, active-line highlight, trace notes.

App state lives in one object. `buildCurrent(input)` is the only rebuild path:
engine → state.result → metadata → scene.setPattern → renderCode → applyFrame(0).
`applyFrame(i)` is the only frame path: scene.showFrame → counter/title/note → slider → code mark →
answer chip → disabled buttons.

Quiz state is deterministic unless the user asks for a fresh round; `?test=1` disables shuffling so
the browser suite can key answers off the data. A finished round renders a results card; switching
tabs must not resurrect the last question.

Practice is derived from the data every render. Checkbox keys are `"<patternId>:<problemNum>"`.
Filter by difficulty, search by problem/pattern/#number, and re-render after every toggle so counts
and group headers stay honest.

Keyboard: `←/→` step, `Space` play, `0` reset, `R` camera, `[`/`]` pattern, `1/2/3` language, `?`
help. Ignore keys while typing or while a dialog is open.

---

## 6. Verification and release

```bash
npm test                 # 27
npm run test:browser     # 35
npm run screenshot       # 6 assets
```

The browser harness is dependency-free CDP: static server + one Chrome + WebSocket. It passes
`--use-mock-keychain --password-store=basic` so no macOS prompts. It should check:

- boot, WebGL canvas, 24/24 in-page self-test;
- all 15 patterns (scene id, frames, active code, input);
- transport, slider, play/pause;
- valid + invalid custom input;
- three language tabs;
- quiz correct/wrong/full round/best;
- practice counts, filters, search, persistence across reload, clear;
- dialogs, keyboard, mobile no-overflow;
- zero console errors.

Release checklist:

1. All gates green locally.
2. `state.json` updated with session id, elapsed time, token counters, artifact list, verification
   counts, credits.
3. README screenshot and social card regenerated.
4. `AGENTS.md` describes the current state in the same commit.
5. Push `main`; Pages from root; `.nojekyll` present.
6. Wait for Pages, then run `TEST_URL=... node tests/browser.test.mjs` to prove the live copy.
7. Publish the skill snapshot (see [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 7. Adding a sixteenth pattern

1. Add metadata + 3 code listings + problems to `js/data.js`. Keep the index unique.
2. Add a parser + engine in `js/algorithms.js`; ensure every mark exists in all languages and the
   default answer is asserted in `engine.selfTest()`.
3. Add a scene builder in `js/scene.js`, register it in `BUILDERS`, and add a camera home.
4. Add a rail entry is automatic; update the displayed count assertions (15 → 16) in
   `tests/engine.test.mjs`, `tests/static.test.mjs`, `tests/browser.test.mjs`, `js/app.js`
   self-test, README, AGENTS and state.
5. Add at least one quiz question and 4 practice problems.
6. Run all gates and the screenshot script.

---

## 8. Build-record capture (OpenCode)

The session database lives at `~/.local/share/opencode/opencode.db` (table `session_v2`). The current
session id is in `$OPENCODE_SESSION_ID`. Token counters and elapsed time:

```sql
SELECT id, title, model, tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost, time_created, time_updated
FROM session_v2 WHERE id = '$OPENCODE_SESSION_ID';
```

`time_created` and `time_updated` are Unix milliseconds. Elapsed seconds = `(time_updated -
time_created)/1000`; format as `Xm Ys`. Total tokens = the sum of the five counters. `cost` is 0 on a
flat-rate plan. Record the model name/id as `DeepSeek V4.1 Flash` / `deepseek-v4.1-flash`, provider
`opencode-go`, tool `OpenCode`. Write the result into `state.json` and credit both in the footer,
README and About dialog.

---

## 9. What not to lose

- The 15-pattern / 61-problem / 30-question counts and their assertions.
- The mark-based code synchronization (not line-number mapping).
- The deterministic frame engines and the custom-input parsers.
- The `label()` texture cache + shared-texture disposal rule.
- The backtracking root-key fix.
- The keychain-safe browser harness flags.
- `state.json`, `AGENTS.md` and the reproduction docs.
