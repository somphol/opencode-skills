# Engine

The engine is the part worth getting right first. It is pure, deterministic, testable in Node, and
stringifiable into a Worker. Read this before touching `script.js`'s first section.

## Contract

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

- Board: row-major, 16 values, `0` = gap.
- `move(board, cellIndex)` returns a new board or `null` if not adjacent.
- **`solve()` returns `moves` as tile numbers.** Internally neighbours are cell indices; store
  `board[tile]` in the path node and return that.
- `solve()` result: `{ ok, moves, nodes, optimal, weight, elapsedMs, startH, reason? }`.
- Pure: no imports, no `window`, no outer constants. This is non-negotiable.

## Solved and parity

```js
const rowOf = (i) => (i / 4) | 0;
const colOf = (i) => i % 4;
const isSolved = (b) => b.every((v, i) => v === GOAL[i]);

function inversions(b) {
  let inv = 0;
  for (let i = 0; i < 16; i++) {
    if (!b[i]) continue;
    for (let j = i + 1; j < 16; j++) if (b[j] && b[i] > b[j]) inv++;
  }
  return inv;
}

function isSolvable(b) {
  const rowFromBottom = 4 - ((b.indexOf(0) / 4) | 0); // 1..4
  return (inversions(b) + rowFromBottom) % 2 === 1;
}
```

Proof sketch: every slide is a transposition with the gap, flipping permutation parity and moving the
gap one row. For even width, the invariant that matches the goal is an **odd** sum. Swapping any two
tiles flips it. For odd widths (3×3, 5×5) the rule is simply `inversions % 2 === 0`.

Do not skip the check in `shuffle()` even though the walk is already legal; it is the independent
guard that catches future regressions.

## Heuristic

```js
function manhattan(b) {
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    const v = b[i]; if (!v) continue;
    const g = v - 1;
    sum += Math.abs(rowOf(i) - rowOf(g)) + Math.abs(colOf(i) - colOf(g));
  }
  return sum;
}

function linearConflicts(b) {
  let pairs = 0;
  for (let r = 0; r < 4; r++) {
    for (let c1 = 0; c1 < 4; c1++) {
      const v1 = b[r*4+c1]; if (!v1 || rowOf(v1-1) !== r) continue;
      for (let c2 = c1+1; c2 < 4; c2++) {
        const v2 = b[r*4+c2]; if (!v2 || rowOf(v2-1) !== r) continue;
        if (colOf(v1-1) > colOf(v2-1)) pairs++;
      }
    }
  }
  // repeat for columns, comparing goal rows
  return pairs * 2;
}

const heuristic = (b) => manhattan(b) + linearConflicts(b);
```

Each reversed pair costs 2: one tile must leave the line, one must enter. Admissible and consistent.
`h` is used for both the estimate and the tie-break.

## A*

```js
function aStar(start, weight, budget, deadline) {
  const open = new MinHeap((n) => n.f * 10000 + n.h); // tie-break
  const boards = [start], gs = [0], parents = [-1], moves = [-1];
  const bestG = new Map([[keyOf(start), 0]]);
  open.push({ f: heuristic(start) * weight, h: heuristic(start), idx: 0 });
  let expanded = 0;

  while (open.size) {
    const node = open.pop();
    const board = boards[node.idx];
    if (isSolved(board)) return { ok: true, moves: reconstruct(node.idx), optimal: weight === 1, nodes: expanded };
    if (bestG.get(keyOf(board)) < gs[node.idx]) continue;
    expanded++;
    if (expanded > budget) return { ok: false, reason: 'budget', nodes: expanded };
    if (expanded % 1024 === 0 && Date.now() > deadline) return { ok: false, reason: 'time' };

    const blank = board.indexOf(0);
    for (const tile of neighboursOf(blank)) {
      const value = board[tile];
      const next = board.slice();
      next[blank] = value; next[tile] = 0;
      const g = gs[node.idx] + 1;
      const key = keyOf(next);
      if ((bestG.get(key) ?? Infinity) <= g) continue;
      bestG.set(key, g);
      const h = heuristic(next);
      const id = boards.length;
      boards.push(next); gs.push(g); parents.push(node.idx); moves.push(value);
      open.push({ f: g + h * weight, h, idx: id });
    }
  }
  return { ok: false, reason: 'exhausted', nodes: expanded };
}
```

Key format: 16 chars from `String.fromCharCode(48 + value)`. The heap is a hand-written binary min-heap
because the default `Array.sort()` per push would dominate.

### Budgets

| Pass | Weight | Nodes | Time | `optimal` |
| --- | --- | --- | --- | --- |
| Optimal | 1.0 | 500,000 | 6 s | true |
| Near | 1.6 | 700,000 | 12 s | false |
| Completion | 4.0 | 900,000 | 20 s | false |

Weighted A* uses `f = g + w·h`. The last pass is complete on a finite graph, so a solvable board
always yields a path. Do not raise the budgets without measuring memory; 500k nodes is already
100–200 MB in the Worker.

### Tie-break is not optional

Without `f*10000 + h`, the same 72-step shuffle expanded 5–10× more nodes and failed the optimal
budget 25% of the time. With it: 20/20 optimal, 30–50 moves, under 400 ms.

## Shuffle

```js
function shuffle(steps = 72, rnd = Math.random) {
  let board = GOAL.slice();
  let previousBlank = -1;
  for (let s = 0; s < steps; s++) {
    const options = legalMoves(board).filter((t) => t !== previousBlank);
    const tile = (options.length ? options : legalMoves(board))[(rnd() * (options.length || 4)) | 0];
    previousBlank = board.indexOf(0);
    board = move(board, tile);
  }
  if (isSolved(board)) return shuffle(steps + 12, rnd);
  return isSolvable(board) ? board : move(board, legalMoves(board)[0]);
}
```

Never build a shuffle by assigning random numbers to cells.

## BFS reference (tests only)

BFS gives the true optimum for shallow scrambles. Tests walk from the goal, scramble 1–7 moves, then
assert A*’s path length equals BFS depth. This catches a solver that finds *a* path but not the
shortest. Limit the frontier (e.g., 600k states) and fail loudly if hit.

## Worker

```js
const source = `
  const createPuzzle15Engine = ${createPuzzle15Engine.toString()};
  const Engine = createPuzzle15Engine();
  self.onmessage = ({ data }) => {
    try { self.postMessage({ id: data.id, result: Engine.solve(data.board, data.options) }); }
    catch (error) { self.postMessage({ id: data.id, error: String(error) }); }
  };
`;
const worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
```

- Id-tag every request; ignore stale replies.
- On `worker.onerror`, terminate it and fall back to `solve()` on the main thread after a paint.
- Terminate on stop to free memory.
- The self-test parses the source with `new Function` to catch syntax drift.

## Tile-number conversion

Path reconstruction stores the value that moved:

```js
moves.push(board[tile]); // value moved into the gap
```

UI consumption:

```js
const value = solution[0];
const from = board.indexOf(value);
if (isAdjacent(from, board.indexOf(0))) await attemptMove(value);
```

If you change this contract, update: `attemptMove`, hint selection, auto-play, the move log, export
history, the self-test path check and the engine tests. That is the blast radius.

## Engine test list

- goal, parity (including a swapped pair), manhattan, conflicts, admissibility vs BFS
- legal-move degree at every blank cell, reversibility, illegal rejection
- 40 shuffles valid/solvable/mixed
- 15 solution paths valid
- A* length equals BFS optimum at depths 1–7
- solved start, unsolvable, malformed
- no repeated state in a path
- heap ordering
- a 72-step shuffle under 12 s
