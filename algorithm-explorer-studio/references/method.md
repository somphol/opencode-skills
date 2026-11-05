# Method — schemas, order and recipes

## Product contract

Three tabs, one static app:

1. **3D Visualizer** — 15 patterns, each with a unique Three.js scene, deterministic steps, custom
   input, and mark-synchronized Python/JavaScript/C++ code.
2. **Quiz** — 30 scenario questions, four options, immediate explanation, local best.
3. **Practice** — 61 canonical LeetCode links grouped by pattern, difficulty/search filters, local
   checkboxes.

No build step, framework, backend, account, analytics or external assets. Three.js via pinned CDN.

## Build order

| Phase | Output | Gate |
| --- | --- | --- |
| 0 | skeleton, README, AGENTS | files exist |
| 1 | `js/data.js` | counts 15 / 61 / 30 |
| 2 | `js/algorithms.js` | `selfTest()` 18/18 |
| 3 | `index.html`, `css/style.css` | 3 tabs, 15 rail items, no overflow |
| 4 | `js/scene.js`, `js/app.js` | all scenes build, no uncaught errors |
| 5 | tests | 47 + 35 + 24 |
| 6 | docs, shots, state | links + counts |
| 7 | Pages release | live 35/35 |

## Data schema

```js
{
  id, index, title, kicker, signal, description,
  time, space, visual, accent, accent2,
  defaultInput, inputLabel, inputHint,
  problems: [{ name, num, difficulty, url }],
  code: {
    python:     [{ t, m }],
    javascript: [{ t, m }],
    cpp:        [{ t, m }]
  }
}
```

Rules: LeetCode URL is `https://leetcode.com/problems/<slug>/`; every language has ≥ 6 lines; every
frame mark appears in all three; input is a compact string; index is 1..15.

Quiz: `{pattern, q, options[4], answer(0..3), explain}`. Four unique strings, valid pattern id.

## Engine contract

```js
ALGO_ENGINE.run(patternId, input)
// { frames: [{n,title,note,mark,data}], meta, summary, answer, patternId }
```

- `push(title, note, mark, data)` per engine.
- `data` is renderer-agnostic and JSON-serializable.
- `meta` holds static facts (tree, grid, arrays, target).
- `INF = 99`, never `Infinity`.
- Parsers raise sentences, not stack traces.
- Bounds: arrays ≤ 18 (most ≤ 14), intervals ≤ 12, tree ≤ 31 slots, grid ≤ 8×10, edges ≤ 10, coins =
  4, amount ≤ 20, backtracking ≤ 4 values.

Default answers:

| id | answer |
| --- | --- |
| two-pointers | `[0,1]` |
| sliding-window | `3` |
| fast-slow | `true` |
| merge-intervals | `[[1,6],[8,10],[15,18]]` |
| monotonic-stack | `[1,1,4,2,1,1,0,0]` |
| top-k | `5` |
| binary-search-answer | `4` |
| tree-dfs | `[[5,4,11,2],[5,8,4,5]]` |
| tree-bfs | `[[3],[9,20],[15,7]]` |
| graph-traversal | `3` |
| backtracking | 8 subsets |
| dynamic-programming | `3` |
| cyclic-sort | `2` |
| reverse-linked-list | `[5,4,3,2,1]` |
| union-find | `[2,3]` |

## Frame data minimums

- `two-pointers`: `{l,r,sum,found,nums,target,direction?}`
- `sliding-window`: `{s,left,right,seen,window,best,bestRange,duplicate?,length?}`
- `fast-slow`: `{next,slow,fast,steps,meet}`
- `merge-intervals`: `{intervals,merged,active,phase}`
- `monotonic-stack`: `{temps,stack,answer,i,popped}`
- `top-k`: `{nums,k,heap,i,action,swaps,removed?}`
- `binary-search-answer`: `{piles,h,lo,hi,mid,hours,feasible,max}`
- `tree-dfs`: `{node,path,pathIds,remaining,found,out}`
- `tree-bfs`: `{level,queue,current,row?,out,done}`
- `graph-traversal`: `{rows,cols,grid,visited,islandOf,current,count,island,phase}`
- `backtracking`: `{nums,bits,path,out,abandoned,index,action}`
- `dynamic-programming`: `{coins,amount,table,r,c,deps,action}`
- `cyclic-sort`: `{nums,n,i,swapped,missing,phase}`
- `reverse-linked-list`: `{values,links,prev,curr,next,reversed}`
- `union-find`: `{nodes,edges,parent,edge,roots,cycleEdge,action}`

## UI contract

`buildCurrent(input)` is the only rebuild path:

```
engine.run → state.result → metadata → scene.setPattern → renderCode → applyFrame(0)
```

`applyFrame(i)` is the only frame path:

```
scene.showFrame → counter/title/note → slider → code mark → answer chip → disabled buttons
```

Playback only changes `frameIndex`. Persist prefs/progress/quiz in three localStorage keys. Quiz
order is deterministic in `?test=1`; user-triggered fresh rounds may shuffle. A finished round must
render a results card and not resurrect the last question on tab switch.

## Scene recipes

One renderer, camera, OrbitControls and rebuildable `dynamicRoot`. Atmosphere: fog, hemisphere/key/rim
lights, accent point light, 300 stars, dark platform + rim + grid. Tween position/scale/colour.

1. **Two Pointers** — value cubes, L/R beam groups, sum/target label, found cubes green.
2. **Sliding Window** — character cubes, translucent box scaled to the window, best-range bar.
3. **Fast & Slow** — nodes on a circle, two runner spheres, dashed back-edge, meet pulse.
4. **Merge Intervals** — timeline bars at separate depths, result row of merged slabs.
5. **Monotonic Stack** — temperature columns, answer badges, stack tower at right.
6. **Top K** — array cubes + binary heap tree; edges re-oriented; root highlighted.
7. **Binary Search Answer** — number line, range bar, lo/mid/hi beams, feasibility label.
8. **Tree DFS** — level-order tree, path by `pathIds`, cursor halo, found paths green.
9. **Tree BFS** — same tree + horizontal level plane, level-coloured visits.
10. **Graph** — voxel land/water, visited palette by `islandOf`, current ripple.
11. **Backtracking** — complete binary decision tree, active bits, abandoned include-subtrees red
    wireframe. Root key `''`.
12. **DP** — coins×amount cuboids, height from table value, dependency lines, current cell white.
13. **Cyclic Sort** — circular track, slots, cylindrical tokens, missing hole.
14. **Reverse Linked List** — node cubes + per-node arrow objects; reversed edges green.
15. **Union-Find** — node circle, curved edges, palette by root, root halos, redundant edge red.

Camera homes are in `scene.js` `CAMS`. Keep targets around `y=0.5–1.2`; do not put the camera inside
the platform.

## Verification contract

- 27 engine tests (`node --test tests/engine.test.mjs`).
- 20 static tests (`node --test tests/static.test.mjs`).
- 35 browser checks (`node tests/browser.test.mjs`).
- 24 in-page checks (`window.__algo.runSelfTest()`).
- Total 106.

The browser harness is dependency-free CDP with a temp Chrome profile and
`--use-mock-keychain --password-store=basic`. It starts its own static server.

## Adding a pattern

1. Data record + three listings + ≥ 4 problems.
2. Parser + engine; add canonical answer and error cases; every mark in all languages.
3. Scene builder + `BUILDERS` entry + camera home.
4. Update counts 15→16 in tests, README, AGENTS, state, in-page self-test.
5. Add a quiz question and a browser scene check.
6. Run all gates and screenshots.
