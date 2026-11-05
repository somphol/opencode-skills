import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEngine } from './lib/fixtures.mjs';

const E = loadEngine();
const { GOAL } = E;

const applyPath = (board, moves) => {
  let walk = board.slice();
  for (const value of moves) {
    const next = E.move(walk, walk.indexOf(value));
    assert.ok(next, `illegal solver move ${value}`);
    walk = next;
  }
  return walk;
};

test('goal state is solved and has zero heuristic', () => {
  assert.equal(E.isSolved(GOAL), true);
  assert.equal(E.inversions(GOAL), 0);
  assert.equal(E.manhattan(GOAL), 0);
  assert.equal(E.linearConflicts(GOAL), 0);
  assert.equal(E.heuristic(GOAL), 0);
  assert.equal(E.isSolvable(GOAL), true);
});

test('4x4 inversion parity rule matches the classic definition', () => {
  assert.equal(E.isSolvable(GOAL), true);
  const swapped = GOAL.slice();
  [swapped[13], swapped[14]] = [swapped[14], swapped[13]];
  assert.equal(E.inversions(swapped), 1);
  assert.equal(E.isSolvable(swapped), false);

  const movedBlank = GOAL.slice();
  movedBlank[15] = 15;
  movedBlank[11] = 0;
  // 15 moved from the goal position to the blank cell: one inversion, blank on row 3.
  assert.equal(E.isSolvable(movedBlank), false);
});

test('manhattan distance counts each tile once', () => {
  const board = GOAL.slice();
  board[0] = 2;
  board[1] = 1;
  assert.equal(E.manhattan(board), 2);

  const far = GOAL.slice();
  far[0] = 15;
  far[15] = 1;
  assert.equal(E.manhattan(far), 11);
});

test('linear conflicts add two per reversed pair in goal line', () => {
  const board = GOAL.slice();
  board[0] = 2;
  board[1] = 1;
  assert.equal(E.linearConflicts(board), 2);
  assert.equal(E.heuristic(board), 4);

  const column = GOAL.slice();
  column[0] = 5;
  column[4] = 1;
  assert.equal(E.linearConflicts(column), 2);
});

test('heuristic is admissible on sampled states', () => {
  for (let i = 0; i < 12; i++) {
    const board = E.shuffle(5 + i, mulberry32(100 + i));
    const exact = E.bfs(board, 500000);
    assert.equal(exact.ok, true, 'reference BFS must solve short scrambles');
    assert.ok(E.heuristic(board) <= exact.depth, `h ${E.heuristic(board)} > optimum ${exact.depth}`);
  }
});

test('legal move generation matches the blank position', () => {
  for (let blankCell = 0; blankCell < 16; blankCell++) {
    const board = GOAL.slice();
    const moving = board[blankCell];
    board[blankCell] = 0;
    board[15] = moving;
    const row = Math.floor(blankCell / 4);
    const col = blankCell % 4;
    const expected = (row > 0) + (row < 3) + (col > 0) + (col < 3);
    const legal = E.legalMoves(board);
    assert.equal(legal.length, expected, `blank at ${blankCell}`);
    for (const tile of legal) {
      const next = E.move(board, tile);
      assert.ok(next);
      const back = E.move(next, blankCell);
      assert.deepEqual(back, board);
      assert.equal(E.directionOf(board, tile), directionName(board.indexOf(0), tile));
    }
    const illegal = [...Array(16).keys()].find((i) => i !== blankCell && !legal.includes(i));
    if (illegal !== undefined) assert.equal(E.move(board, illegal), null);
  }
});

test('every shuffle is solvable, mixed and a valid permutation', () => {
  for (let i = 0; i < 40; i++) {
    const board = E.shuffle(40 + (i % 30), mulberry32(7 + i));
    assert.equal(board.length, 16);
    assert.equal(new Set(board).size, 16);
    assert.ok(board.every((v) => Number.isInteger(v) && v >= 0 && v <= 15));
    assert.equal(E.isSolvable(board), true, 'shuffle produced an unsolvable board');
    assert.equal(E.isSolved(board), false, 'shuffle produced the goal');
  }
});

test('A* returns paths that solve the board', () => {
  for (let i = 0; i < 15; i++) {
    const board = E.shuffle(60, mulberry32(200 + i));
    const result = E.solve(board, { optimalBudget: 200000, optimalTimeMs: 8000 });
    assert.equal(result.ok, true, `solver failed: ${result.reason}`);
    assert.ok(result.moves.length > 0);
    assert.deepEqual(applyPath(board, result.moves), GOAL);
  }
});

test('A* length equals the breadth-first optimum on short scrambles', () => {
  for (let depth = 1; depth <= 7; depth++) {
    for (let trial = 0; trial < 3; trial++) {
      const board = E.shuffle(depth, mulberry32(depth * 10 + trial));
      const exact = E.bfs(board, 600000);
      assert.equal(exact.ok, true);
      const result = E.solve(board, { optimalBudget: 50000, optimalTimeMs: 5000 });
      assert.equal(result.ok, true);
      assert.equal(result.optimal, true, 'short scramble should be solved optimally');
      assert.equal(result.moves.length, exact.depth, `depth ${depth}: ${result.moves.length} != ${exact.depth}`);
      assert.deepEqual(applyPath(board, result.moves), GOAL);
    }
  }
});

test('solved board returns an empty path without searching', () => {
  const result = E.solve(GOAL);
  assert.equal(result.ok, true);
  assert.deepEqual(result.moves, []);
  assert.equal(result.nodes, 0);
});

test('unsolvable and malformed boards are rejected', () => {
  const swapped = GOAL.slice();
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const result = E.solve(swapped);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unsolvable');

  assert.equal(E.solve([1, 2, 3]).reason, 'bad-board');
  assert.equal(E.solve([0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).reason, 'bad-board');
});

test('state keys are unique and the solution path never repeats', () => {
  let board = E.shuffle(50, mulberry32(999));
  const seen = new Set([E.keyOf(board)]);
  for (const value of E.solve(board, { optimalBudget: 100000 }).moves) {
    board = E.move(board, board.indexOf(value));
    const key = E.keyOf(board);
    assert.equal(seen.has(key), false, 'cycle in solution');
    seen.add(key);
  }
  assert.equal(E.isSolved(board), true);
});

test('binary heap pops in non-decreasing score order', () => {
  const heap = new E.MinHeap((n) => n.f);
  const values = Array.from({ length: 200 }, (_, i) => (i * 37) % 101);
  for (const f of values) heap.push({ f });
  let previous = -Infinity;
  while (heap.size) {
    const node = heap.pop();
    assert.ok(node.f >= previous);
    previous = node.f;
  }
});

test('solver stays inside a practical time budget', () => {
  const board = E.shuffle(72, mulberry32(42));
  const started = Date.now();
  const result = E.solve(board);
  const elapsed = Date.now() - started;
  assert.equal(result.ok, true);
  assert.ok(elapsed < 12000, `solve took ${elapsed} ms`);
});

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function directionName(blank, tile) {
  if (tile === blank - 4) return 'down';
  if (tile === blank + 4) return 'up';
  if (tile === blank - 1) return 'right';
  if (tile === blank + 1) return 'left';
  return null;
}
