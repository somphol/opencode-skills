# The solver

This is the algorithm behind **Auto-solve** and **Step hint**. It searches the 16! / 2 ≈ 10.46
quintillion reachable 15-puzzle states, but only ever as far as it needs to.

## 1. State and moves

The board is a 16-element row-major array. `0` is the gap.

```text
index:  0  1  2  3
        4  5  6  7
        8  9 10 11
       12 13 14 15
```

A move slides the tile in a cell orthogonally adjacent to the gap into the gap. The engine’s
`solve()` reports the sequence as **tile numbers**, e.g. `[9, 10, 6, 5]` means “slide tile 9, then
10, …”. Internally the search stores cell indices and converts while recording the path.

## 2. Solvability

For an even-width board, a configuration is reachable from the goal iff

```text
(inversions + blankRowFromBottom) mod 2 = 1
```

where an inversion is a pair `i < j` with `board[i] > board[j]`, both non-zero, and
`blankRowFromBottom` is 1 for the bottom row, 4 for the top.

Why: every legal slide is a transposition of the gap with a tile, which flips permutation parity and
moves the gap one row. For width 4, the combined invariant has to be odd to match the goal. This is
implemented in `isSolvable()` and checked again in the self-test with a known swapped pair.

The shuffle never relies on luck: it walks 72 legal moves away from the goal, then runs this check as
an independent guard.

## 3. Heuristic

### Manhattan distance

```text
h₁(b) = Σ_tiles |r(i) − r(goal)| + |c(i) − c(goal)|
```

Each tile needs at least that many slides, and one slide moves one tile, so `h₁` is admissible.

### Linear conflicts

Two tiles are in a **linear conflict** if they are both in their goal row (or column) but reversed
relative to each other. At least one of them must leave that line and come back, costing two extra
moves beyond Manhattan. Each conflicting pair therefore adds 2:

```text
h₂(b) = 2 × (# reversed goal-row pairs + # reversed goal-column pairs)
h(b)  = h₁(b) + h₂(b)
```

This is the standard admissible, consistent linear-conflict heuristic. It is stronger than Manhattan
alone by roughly a factor of two in expanded nodes on random boards.

Example: goal with tiles 1 and 2 swapped in the top row.

```text
board: 2 1 3 4 …
h₁ = 2  (each tile is one column from home)
h₂ = 2  (the pair is reversed in its goal row)
h  = 4
```

## 4. A*

```text
open   ← min-heap ordered by f*10000 + h
closed ← map(stateKey → best g)
push(start, g=0, f=h(start))

while open not empty:
  node ← pop()
  if node.g > closed[node.key]: continue
  if solved(node): return reconstruct(node)
  if node is already closed: continue
  for each legal tile:
    child ← move(node, tile)
    ng ← node.g + 1
    if closed[child.key] ≤ ng: continue
    closed[child.key] ← ng
    push(child, g=ng, f=ng + h(child))
```

Implementation details that matter:

- **Key**: 16 chars via `String.fromCharCode(48 + value)`, `Map<string, number>` for best `g`.
- **Heap**: hand-written binary heap; each node also carries `h` so the comparator can tie-break.
- **Tie-break**: `f * 10000 + h` prefers lower `h` among equal `f`. This is the single largest
  performance win in the project; without it the same boards expand 5–10× more nodes.
- **Path**: parent indices + moved tile values; walk back and reverse.
- **Duplicates**: a state may be queued more than once; the `closed` check on pop is what makes it
  safe. The `bestG` guard prevents pushing a worse `g`.

## 5. Budgets and optimality

A pure optimal search is unbounded on the hardest boards. To keep the UI responsive the solver runs
three passes:

| Pass | Weight | Node cap | Time cap | Returned `optimal` |
| --- | --- | --- | --- | --- |
| Optimal A* | 1.0 | 500,000 | 6 s | `true` |
| Near-optimal | 1.6 | 700,000 | 12 s | `false` |
| Completion | 4.0 | 900,000 | 20 s | `false` |

Weighted A* uses `f = g + w·h`. Larger `w` finds a path faster but can be longer than optimal. The
last pass is still complete on a finite graph, so a solvable board always gets a path. The UI reads
`result.optimal` and prints either:

- “Optimal path found in 312 ms.”
- “Near-optimal path found in 1,842 ms.”

This distinction is deliberate. Do not present a weighted result as optimal.

Memory: each node stores a 16-element array, `g`, parent index and move. The 500k optimal budget
typically peaks around 100–200 MB in the worker; the worker is terminated on stop and the tab keeps
running if it crashes (main-thread fallback).

## 6. Measured behaviour

Benchmarks from the build session, Node 26 on an Apple-silicon laptop, `Math.random()` shuffles:

| Shuffle depth | Trials | Optimal | Median time | Worst time | Typical length |
| --- | --- | --- | --- | --- | --- |
| 72 moves | 20 | 20/20 | < 100 ms | 353 ms | 36–50 |
| 140 moves | 30 | 24/30 | ~400 ms | 1.8 s | 42–62 |

The 140-move row shows the intended trade-off: six boards exceeded the optimal budget, were solved
by the 1.6-weighted pass, and were labelled near-optimal. None failed.

Short-scramble optimality is verified against breadth-first search at depths 1–7 in
`tests/engine.test.mjs`. BFS is the ground truth there; A* must return exactly its depth, not just a
valid path.

## 7. Why not IDA* or a pattern database?

- **IDA*** is memory-light and optimal, but with only Manhattan + LC it can spend minutes on the
  same boards where A* with a tie-break finishes in under a second. Memory is not the binding
  constraint in a browser tab.
- **Pattern databases** (e.g., 6-6-3 additive) would cut expansions by orders of magnitude but add
  megabytes of precomputed tables, a build step and licensing/provenance work. The project’s goal is
  a self-contained educational solver, not a world-record one.
- **Greedy best-first** is faster but produces visibly wasteful paths; it is used only as the final
  weighted pass at `w = 4`.

The door is open: `heuristic()` is the only function a stronger heuristic needs to replace, and the
engine tests will still validate admissibility only indirectly (via BFS comparison). Add a direct
admissibility test if you change it.

## 8. Reproducing the numbers

```bash
node --test tests/engine.test.mjs
```

For ad-hoc benchmarks:

```bash
node - <<'EOF'
import { loadEngine } from './tests/lib/fixtures.mjs';
const E = loadEngine();
for (let i = 0; i < 10; i++) {
  const board = E.shuffle(72);
  const t = Date.now();
  const r = E.solve(board);
  console.log(r.optimal ? 'optimal' : 'near', r.moves.length, r.nodes, Date.now() - t + 'ms');
}
EOF
```

Results vary with shuffle luck and machine speed; the optimality flag is the contract, not the
milliseconds.

## 9. References

- Korf, R. E. (1985). *Depth-first iterative-deepening: An optimal admissible tree search.*
- Hansson, O., Mayer, A., Yung, M. (1985). *Criticizing solutions to relaxed models yields powerful
  admissible heuristics.* (Linear conflicts.)
- Reinefeld, A. (1993). *Complete solution of the eight-puzzle and the benefit of node ordering in
  IDA\*.*
- The 15-puzzle parity invariant is standard; see any combinatorics text on the alternating group
  A₁₅.
