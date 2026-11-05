import test from 'node:test';
import assert from 'node:assert/strict';
import { loadData, loadEngine } from './lib/fixtures.mjs';

const data = loadData();
const engine = loadEngine();
const patterns = data.patterns;

test('dataset contract', () => {
  assert.equal(data.patterns.length, 15);
  assert.equal(data.quiz.length, 30);
  assert.equal(data.meta.problems, 61);
  assert.equal(new Set(patterns.map((p) => p.id)).size, 15);
  assert.deepEqual(patterns.map((p) => p.index), Array.from({ length: 15 }, (_, i) => i + 1));
});

test('pattern metadata is complete', () => {
  for (const pattern of patterns) {
    assert.ok(pattern.title && pattern.signal && pattern.description && pattern.visual, pattern.id);
    assert.match(pattern.time, /O\(/);
    assert.match(pattern.space, /O\(/);
    assert.ok(pattern.defaultInput, pattern.id);
    assert.ok(pattern.inputHint, pattern.id);
    assert.ok(pattern.problems.length >= 4, pattern.id);
  }
});

test('every problem links to LeetCode with a slug', () => {
  for (const pattern of patterns) {
    for (const problem of pattern.problems) {
      assert.match(problem.url, /^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/, problem.name);
      assert.ok(['Easy', 'Medium', 'Hard'].includes(problem.difficulty), problem.name);
      assert.ok(problem.num > 0, problem.name);
    }
  }
});

test('quiz bank has four unique options and a valid answer', () => {
  for (const question of data.quiz) {
    assert.equal(question.options.length, 4, question.q);
    assert.equal(new Set(question.options).size, 4, question.q);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
    assert.ok(question.explain.length > 30);
    assert.ok(patterns.some((p) => p.id === question.pattern), question.pattern);
  }
});

test('all 15 engines produce numbered, renderable frames', () => {
  for (const pattern of patterns) {
    const result = engine.run(pattern.id, pattern.defaultInput);
    assert.ok(result.frames.length >= 4, pattern.id);
    result.frames.forEach((frame, index) => {
      assert.equal(frame.n, index + 1, `${pattern.id} frame ${index}`);
      assert.ok(frame.title && frame.note && frame.mark, `${pattern.id} frame ${index}`);
      assert.ok(frame.data && typeof frame.data === 'object', `${pattern.id} frame ${index}`);
      assert.doesNotThrow(() => JSON.stringify(frame), `${pattern.id} frame ${index} serializable`);
    });
  }
});

test('every frame mark is represented in every language', () => {
  for (const pattern of patterns) {
    for (const language of ['python', 'javascript', 'cpp']) {
      assert.ok(pattern.code[language].length >= 6, `${pattern.id}/${language}`);
      const marks = new Set(pattern.code[language].map((line) => line.m));
      for (const frame of engine.run(pattern.id, pattern.defaultInput).frames) {
        assert.ok(marks.has(frame.mark), `${pattern.id}/${language} missing ${frame.mark}`);
      }
    }
  }
});

test('self-test reports 18 checks', () => {
  const report = engine.selfTest();
  assert.equal(report.total, 18);
  assert.equal(report.passed, report.total, JSON.stringify(report.checks.filter((c) => !c.ok)));
});

test('two pointers finds a pair', () => {
  assert.deepEqual(engine.run('two-pointers', '1, 2, 3, 4, 6 | 10').answer, [3, 4]);
  assert.equal(engine.run('two-pointers', '1, 2, 3 | 99').answer, null);
});

test('two pointers sorts unsorted input and reports it', () => {
  const result = engine.run('two-pointers', '15, 2, 11, 7 | 9');
  assert.deepEqual(result.answer, [0, 1]);
  assert.equal(result.meta.sorted, true);
});

test('sliding window handles empty repetition', () => {
  assert.equal(engine.run('sliding-window', 'bbbb').answer, 1);
  assert.equal(engine.run('sliding-window', 'abcde').answer, 5);
});

test('fast and slow detects and clears cycles', () => {
  assert.equal(engine.run('fast-slow', '5 | 2').answer, true);
  assert.equal(engine.run('fast-slow', '5 | -1').answer, false);
});

test('merge intervals merges nested and adjacent intervals', () => {
  assert.deepEqual(engine.run('merge-intervals', '1,10; 2,3; 4,8').answer, [[1, 10]]);
  assert.deepEqual(engine.run('merge-intervals', '1,2; 2,3; 5,6').answer, [[1, 3], [5, 6]]);
});

test('monotonic stack solves daily temperatures', () => {
  assert.deepEqual(engine.run('monotonic-stack', '30, 40, 50').answer, [1, 1, 0]);
  assert.deepEqual(engine.run('monotonic-stack', '50, 40, 30').answer, [0, 0, 0]);
});

test('top k honours k and the heap size', () => {
  assert.equal(engine.run('top-k', '5, 1, 9, 3 | 1').answer, 9);
  assert.equal(engine.run('top-k', '5, 1, 9, 3 | 4').answer, 1);
  const last = engine.run('top-k', '5, 1, 9, 3 | 2').frames.at(-1);
  assert.ok(last.data.heap.length <= 2);
});

test('binary search on answer covers tight and loose budgets', () => {
  assert.equal(engine.run('binary-search-answer', '3, 6, 7, 11 | 8').answer, 4);
  assert.equal(engine.run('binary-search-answer', '30, 11, 23, 4, 20 | 6').answer, 23);
  assert.equal(engine.run('binary-search-answer', '1 | 1').answer, 1);
});

test('tree DFS finds every matching root-to-leaf path', () => {
  const result = engine.run('tree-dfs', '1,2,3 | 4');
  assert.deepEqual(result.answer, [[1, 3]]);
  assert.ok(result.frames.some((frame) => frame.mark === 'backtrack'));
});

test('tree BFS separates levels', () => {
  assert.deepEqual(engine.run('tree-bfs', '1,2,3,4,5').answer, [[1], [2, 3], [4, 5]]);
});

test('graph traversal counts diagonal-separated islands', () => {
  assert.equal(engine.run('graph-traversal', '101/010/101').answer, 5);
  assert.equal(engine.run('graph-traversal', '111/111').answer, 1);
});

test('backtracking emits 2^n subsets', () => {
  assert.equal(engine.run('backtracking', '1,2,3,4').answer.length, 16);
  assert.ok(engine.run('backtracking', '1,2,3').frames.some((frame) => frame.data.action === 'backtrack'));
});

test('DP coin change handles reachable and unreachable amounts', () => {
  assert.equal(engine.run('dynamic-programming', '1,2,5 | 11').answer, 3);
  assert.equal(engine.run('dynamic-programming', '2 | 3').answer, -1);
  assert.equal(engine.run('dynamic-programming', '2 | 4').answer, 2);
});

test('cyclic sort finds the missing value at the end', () => {
  assert.equal(engine.run('cyclic-sort', '0,1').answer, 2);
  assert.equal(engine.run('cyclic-sort', '3,0,1').answer, 2);
  assert.equal(engine.run('cyclic-sort', '1,2,3').answer, 0);
});

test('reverse linked list returns the reversed values', () => {
  assert.deepEqual(engine.run('reverse-linked-list', '1,2,3').answer, [3, 2, 1]);
  assert.deepEqual(engine.run('reverse-linked-list', '7').answer, [7]);
});

test('union find finds redundant edges', () => {
  assert.deepEqual(engine.run('union-find', '1,2; 2,3; 3,4; 1,4').answer, [1, 4]);
  assert.equal(engine.run('union-find', '1,2; 2,3').answer, null);
});

test('parsers reject malformed input with actionable messages', () => {
  assert.throws(() => engine.run('two-pointers', '1,2,3'), /separator/i);
  assert.throws(() => engine.run('merge-intervals', '1,2; 3'), /start,end/i);
  assert.throws(() => engine.run('graph-traversal', '101/12'), /0 \(water\) or 1/i);
  assert.throws(() => engine.run('dynamic-programming', '1 | 999'), /0 to 20/i);
  assert.throws(() => engine.run('top-k', '1,2,3 | 9'), /between 1/i);
});

test('custom inputs stay inside visual bounds', () => {
  assert.ok(engine.run('graph-traversal', '1111111111/1111111111').answer >= 1);
  assert.ok(engine.run('reverse-linked-list', '1,2,3,4,5,6,7,8,9,10').answer.length === 10);
  assert.ok(engine.run('tree-bfs', '1,2,3,4,5,6,7,8,9,10').answer.length >= 3);
});

test('frame data is JSON-serializable with no Infinity', () => {
  for (const pattern of patterns) {
    const text = JSON.stringify(engine.run(pattern.id, pattern.defaultInput));
    assert.doesNotThrow(() => JSON.parse(text), pattern.id);
    assert.ok(!text.includes('Infinity'), pattern.id);
  }
});

test('quiz questions map to real patterns', () => {
  const ids = new Set(patterns.map((p) => p.id));
  assert.equal(new Set(data.quiz.map((q) => q.pattern)).size, 15);
  for (const question of data.quiz) assert.ok(ids.has(question.pattern));
});
