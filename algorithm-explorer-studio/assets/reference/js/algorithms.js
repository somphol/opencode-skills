/* Algorithm Explorer — pure step engines.
 * Every pattern compiles an input string into frames. A frame is renderer-agnostic:
 *   { n, title, note, mark, data }
 * scene.js reads data; app.js reads title/note/mark. No DOM, no Three.js here.
 */
(function (root) {
  'use strict';

  const INF = 99;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const num = (value, label) => {
    const n = Number(String(value).trim());
    if (!Number.isFinite(n)) throw new Error(`${label || 'Value'} must be a number.`);
    return n;
  };

  function splitPair(text, fallback) {
    const raw = String(text == null ? '' : text).trim();
    if (!raw) return fallback;
    const parts = raw.split('|');
    if (parts.length < 2) throw new Error('Use a | separator between the data and the parameter.');
    return [parts[0].trim(), parts.slice(1).join('|').trim()];
  }

  function numberList(text, { min = -Infinity, max = Infinity, label = 'List', maxCount = 18 } = {}) {
    const values = String(text || '')
      .replace(/[\[\]]/g, '')
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((piece) => num(piece, label));
    if (!values.length) throw new Error(`${label} cannot be empty.`);
    if (values.length > maxCount) throw new Error(`${label} supports at most ${maxCount} values in the visualizer.`);
    for (const value of values) {
      if (!Number.isInteger(value)) throw new Error(`${label} must contain whole numbers.`);
      if (value < min || value > max) throw new Error(`${label} values must be between ${min} and ${max}.`);
    }
    return values;
  }

  function intervalList(text) {
    const raw = String(text || '').replace(/[\[\]]/g, '').trim();
    if (!raw) throw new Error('Intervals cannot be empty.');
    return raw.split(/[;\n]+/).filter(Boolean).map((chunk) => {
      const pair = chunk.split(',').map((value) => num(value, 'Interval endpoint'));
      if (pair.length !== 2) throw new Error('Each interval must be a start,end pair.');
      if (pair[0] > pair[1]) throw new Error('Each interval start must be <= its end.');
      return [pair[0], pair[1]];
    }).slice(0, 12);
  }

  function edgeList(text) {
    const raw = String(text || '').replace(/[\[\]]/g, '').trim();
    if (!raw) throw new Error('Edges cannot be empty.');
    const edges = raw.split(/[;\n]+/).filter(Boolean).map((chunk) => {
      const pair = chunk.split(',').map((value) => num(value, 'Node id'));
      if (pair.length !== 2) throw new Error('Each edge must be a pair such as 1,2.');
      return pair;
    });
    if (edges.length > 10) throw new Error('The visualizer supports at most 10 edges.');
    const ids = [...new Set(edges.flat())];
    if (ids.some((id) => id < 0 || id > 20 || !Number.isInteger(id))) throw new Error('Node ids must be whole numbers from 0 to 20.');
    return edges;
  }

  function levelOrder(text) {
    const values = String(text || '').replace(/[\[\]]/g, '').split(/[\s,]+/).filter(Boolean).map((token) => {
      if (/^(null|none|-)$/i.test(token)) return null;
      return num(token, 'Tree value');
    });
    if (!values.length) throw new Error('Tree cannot be empty.');
    if (values.length > 31) throw new Error('The visualizer supports at most 31 level-order slots.');
    return values;
  }

  function gridRows(text) {
    const raw = String(text || '').trim();
    if (!raw) throw new Error('Grid cannot be empty.');
    const rows = raw.split(/[\/\n]+/).filter(Boolean).map((row) => row.replace(/[\s,]/g, ''));
    if (rows.length > 8 || rows.some((row) => row.length > 10)) throw new Error('The grid supports at most 8 rows and 10 columns.');
    if (rows.some((row) => /[^01]/.test(row))) throw new Error('Grid cells must be 0 (water) or 1 (land).');
    const width = rows[0].length;
    if (rows.some((row) => row.length !== width)) throw new Error('Every grid row must have the same length.');
    return rows;
  }

  /* ---------------------------------------------------------------- trees */
  function buildTree(values) {
    if (!values.length || values[0] == null) return { root: null, nodes: [], values };
    const nodes = [];
    const make = (val, depth) => {
      const node = { id: nodes.length, val, depth, left: null, right: null };
      nodes.push(node);
      return node;
    };
    const rootNode = make(values[0], 0);
    const queue = [rootNode];
    let index = 1;
    while (queue.length && index < values.length) {
      const node = queue.shift();
      for (const side of ['left', 'right']) {
        if (index >= values.length) break;
        const val = values[index++];
        if (val == null) continue;
        const child = make(val, node.depth + 1);
        node[side] = child.id;
        queue.push(child);
      }
    }
    return { root: rootNode.id, nodes, values };
  }

  function parentOf(tree, id) {
    return tree.nodes.find((node) => node.left === id || node.right === id) || null;
  }

  /* --------------------------------------------------------------- engines */
  function twoPointers(input) {
    const [listText, targetText] = splitPair(input, ['2, 7, 11, 15', '9']);
    const original = numberList(listText, { label: 'Array' });
    const nums = [...original].sort((a, b) => a - b);
    const target = num(targetText, 'Target');
    const frames = [];
    let l = 0, r = nums.length - 1, found = null;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Initialize the pointers', `left = 0, right = ${r}. The array is sorted so pair order is meaningful.`, 'init', { l, r, sum: null, found: null, nums, target });
    while (l < r) {
      const sum = nums[l] + nums[r];
      push('Compare the pair', `nums[${l}] + nums[${r}] = ${nums[l]} + ${nums[r]} = ${sum}. Target is ${target}.`, 'loop', { l, r, sum, found: null, nums, target });
      if (sum === target) {
        found = [l, r];
        push('Pair found', `Return [${l}, ${r}]. Every earlier move discarded only sums that could not work.`, 'found', { l, r, sum, found, nums, target });
        break;
      }
      if (sum < target) {
        push('Sum too small — advance left', `A larger left value is the only way to increase the sum.`, 'move', { l, r, sum, direction: 'left', found: null, nums, target });
        l++;
      } else {
        push('Sum too large — retreat right', `A smaller right value is the only way to decrease the sum.`, 'move', { l, r, sum, direction: 'right', found: null, nums, target });
        r--;
      }
    }
    if (!found) push('No pair exists', 'The pointers crossed without matching the target.', 'done', { l, r, sum: null, found: null, nums, target });
    return {
      frames: frames.map((frame, i) => ({ ...frame, n: i + 1 })),
      meta: { nums, target, sorted: original.join(',') !== nums.join(',') },
      summary: found ? `Pair found at indices ${found.join(' and ')}.` : 'No valid pair.',
      answer: found
    };
  }

  function slidingWindow(input) {
    const text = String(input || 'abcabcbb').trim();
    if (!text) throw new Error('Text cannot be empty.');
    const s = text.slice(0, 24).split('');
    const frames = [];
    let left = 0, best = 0, bestRange = [0, -1];
    const seen = new Map();
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Initialize the window', 'The window is empty. Expand right, and only shrink when a duplicate enters.', 'init', { s, left, right: -1, seen: {}, window: '', best, bestRange });
    for (let right = 0; right < s.length; right++) {
      const ch = s[right];
      if (seen.has(ch) && seen.get(ch) >= left) {
        const old = left;
        left = seen.get(ch) + 1;
        push('Duplicate — shrink from the left', `"${ch}" last appeared at ${seen.get(ch)}. Move left from ${old} to ${left} to exclude it.`, 'shrink', { s, left, right, seen: Object.fromEntries(seen), window: s.slice(left, right + 1).join(''), best, bestRange, duplicate: ch });
      }
      seen.set(ch, right);
      const length = right - left + 1;
      if (length > best) { best = length; bestRange = [left, right]; }
      push('Expand the right edge', `Include "${ch}". Current window "${s.slice(left, right + 1).join('')}" has length ${length}; best is ${best}.`, 'best', { s, left, right, seen: Object.fromEntries(seen), window: s.slice(left, right + 1).join(''), best, bestRange, duplicate: null, length });
    }
    push('Longest window recorded', `Best length ${best}: "${s.slice(bestRange[0], bestRange[1] + 1).join('')}" at [${bestRange.join(', ')}].`, 'done', { s, left, right: s.length - 1, seen: Object.fromEntries(seen), window: s.slice(bestRange[0], bestRange[1] + 1).join(''), best, bestRange });
    return { frames, meta: { s, best, bestRange }, summary: `Longest unique substring has length ${best}.`, answer: best };
  }

  function fastSlow(input) {
    const [countText, cycleText] = splitPair(input, ['7', '3']);
    const count = Math.max(2, Math.min(12, Math.round(num(countText, 'Node count'))));
    const cycleAt = Math.round(num(cycleText, 'Cycle entry'));
    if (cycleAt >= count || cycleAt < -1) throw new Error('Cycle entry must be -1 or a valid node index.');
    const next = Array.from({ length: count }, (_, i) => (i === count - 1 ? cycleAt : i + 1));
    const frames = [];
    let slow = 0, fast = 0, steps = 0;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Start both runners', cycleAt === -1 ? 'The tail ends at null, so there is no cycle.' : `The tail links back to node ${cycleAt}.`, 'init', { next, slow, fast, steps, meet: false });
    let meet = false;
    while (fast !== -1 && next[fast] !== -1 && steps < count * 2) {
      slow = next[slow];
      fast = next[next[fast]];
      steps++;
      meet = slow === fast;
      push(meet ? 'The runners meet' : 'Advance at different speeds', meet ? `Both pointers land on node ${slow}; a cycle exists.` : `Slow is at ${slow}, fast is at ${fast} after ${steps} round${steps === 1 ? '' : 's'}.`, meet ? 'meet' : 'move', { next, slow, fast, steps, meet });
      if (meet) break;
    }
    if (!meet) push('Fast reached the end', 'Fast hit null, so the list is acyclic.', 'done', { next, slow, fast, steps, meet: false });
    return { frames, meta: { next, count, cycleAt }, summary: meet ? `Cycle detected at node ${slow}.` : 'No cycle detected.', answer: meet };
  }

  function mergeIntervals(input) {
    const original = intervalList(input || '1,3; 2,6; 8,10; 15,18');
    const sorted = original.map((pair, i) => ({ pair: [...pair], i })).sort((a, b) => a.pair[0] - b.pair[0] || a.pair[1] - b.pair[1]);
    const intervals = sorted.map((entry) => entry.pair);
    const frames = [];
    const merged = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Sort by start time', `Sorted order: ${intervals.map((pair) => `[${pair.join(', ')}]`).join(' ')}. Only neighbours can overlap.`, 'sort', { intervals, merged: [], active: -1, phase: 'sort' });
    for (let i = 0; i < intervals.length; i++) {
      const [start, end] = intervals[i];
      const last = merged[merged.length - 1];
      push('Inspect the next interval', `[${start}, ${end}] versus ${last ? `[${last[0]}, ${last[1]}]` : 'an empty result'}.`, 'loop', { intervals, merged: clone(merged), active: i, phase: 'inspect' });
      if (last && start <= last[1]) {
        const prevEnd = last[1];
        last[1] = Math.max(last[1], end);
        push('Absorb the overlap', `Start ${start} <= ${prevEnd}; extend the slab to ${last[1]}.`, 'merge', { intervals, merged: clone(merged), active: i, phase: 'merge' });
      } else {
        merged.push([start, end]);
        push('Open a new merged slab', `[${start}, ${end}] begins after the previous end, so it cannot overlap.`, 'push', { intervals, merged: clone(merged), active: i, phase: 'push' });
      }
    }
    push('Merge complete', `${merged.length} interval${merged.length === 1 ? '' : 's'} remain: ${merged.map((pair) => `[${pair.join(', ')}]`).join(' ')}.`, 'done', { intervals, merged: clone(merged), active: -1, phase: 'done' });
    return { frames, meta: { intervals, original }, summary: `${merged.length} merged interval${merged.length === 1 ? '' : 's'}.`, answer: clone(merged) };
  }

  function monotonicStack(input) {
    const temps = numberList(input || '73, 74, 75, 71, 69, 72, 76, 73', { label: 'Temperatures', maxCount: 14 });
    const answer = new Array(temps.length).fill(0);
    const stack = [];
    const frames = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Initialize the stack', 'The stack will hold indices with strictly decreasing temperatures.', 'init', { temps, stack: [], answer: [...answer], i: -1, popped: null });
    for (let i = 0; i < temps.length; i++) {
      while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
        const j = stack.pop();
        answer[j] = i - j;
        push('Warmer day found — pop', `Day ${j} (${temps[j]}°) waited ${i - j} day${i - j === 1 ? '' : 's'} for day ${i} (${temps[i]}°).`, 'pop', { temps, stack: [...stack], answer: [...answer], i, popped: j });
      }
      stack.push(i);
      push('Push the current day', `Day ${i} (${temps[i]}°) is unresolved; push its index.`, 'push', { temps, stack: [...stack], answer: [...answer], i, popped: null });
    }
    push('Unresolved days stay at zero', `${answer.filter(Boolean).length} of ${temps.length} days have a warmer future day.`, 'done', { temps, stack: [...stack], answer: [...answer], i: temps.length - 1, popped: null });
    return { frames, meta: { temps }, summary: `Answers: ${answer.join(', ')}`, answer: [...answer] };
  }

  function topK(input) {
    const [listText, kText] = splitPair(input, ['3, 2, 1, 5, 6, 4', '2']);
    const nums = numberList(listText, { label: 'Numbers', maxCount: 14 });
    const k = Math.round(num(kText, 'k'));
    if (k < 1 || k > nums.length) throw new Error('k must be between 1 and the number of values.');
    const heap = [];
    const frames = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    const siftUp = (index) => {
      const swaps = [];
      while (index > 0) {
        const parent = (index - 1) >> 1;
        if (heap[parent] <= heap[index]) break;
        [heap[parent], heap[index]] = [heap[index], heap[parent]];
        swaps.push([parent, index]);
        index = parent;
      }
      return swaps;
    };
    const siftDown = () => {
      const swaps = [];
      let index = 0;
      while (true) {
        let smallest = index;
        const left = index * 2 + 1, right = left + 1;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        swaps.push([index, smallest]);
        index = smallest;
      }
      return swaps;
    };
    push('Initialize a min-heap of size k', `Keep only the ${k} largest values. The root is the smallest survivor.`, 'init', { nums, k, heap: [...heap], i: -1, action: 'init', swaps: [] });
    for (let i = 0; i < nums.length; i++) {
      heap.push(nums[i]);
      const up = siftUp(heap.length - 1);
      push('Push the new value', `Insert ${nums[i]}; sift it up in the min-heap.`, 'push', { nums, k, heap: [...heap], i, action: 'push', swaps: up });
      if (heap.length > k) {
        const removed = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        const down = siftDown();
        push('Evict the heap root', `The heap grew to ${k + 1}; remove ${removed}, the smallest candidate.`, 'pop', { nums, k, heap: [...heap], i, action: 'pop', removed, swaps: down });
      }
    }
    push('The root is the answer', `The min-heap holds the top ${k}; its root ${heap[0]} is the kth largest.`, 'done', { nums, k, heap: [...heap], i: nums.length - 1, action: 'done', swaps: [] });
    return { frames, meta: { nums, k }, summary: `Kth largest value is ${heap[0]}.`, answer: heap[0] };
  }

  function binarySearchAnswer(input) {
    const [pileText, hourText] = splitPair(input, ['3, 6, 7, 11', '8']);
    const piles = numberList(pileText, { min: 1, label: 'Piles', maxCount: 14 });
    const h = Math.round(num(hourText, 'Hour budget'));
    if (h < piles.length) throw new Error('The hour budget must be at least the number of piles.');
    const max = Math.max(...piles);
    const frames = [];
    let lo = 1, hi = max, answer = -1;
    const hoursAt = (speed) => piles.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0);
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Define the answer space', `Speed 1…${max}. The predicate "finish in ≤ ${h} hours" is monotonic.`, 'init', { piles, h, lo, hi, mid: null, hours: null, feasible: null, max });
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const hours = hoursAt(mid);
      const feasible = hours <= h;
      push('Probe the midpoint', `Speed ${mid} needs ${hours} hours; budget ${h}. ${feasible ? 'Feasible — search lower.' : 'Too slow — search higher.'}`, feasible ? 'feasible' : 'check', { piles, h, lo, hi, mid, hours, feasible, max });
      if (feasible) { hi = mid; answer = mid; }
      else lo = mid + 1;
      push('Move a boundary', `New range: [${lo}, ${hi}].`, 'move', { piles, h, lo, hi, mid, hours, feasible, max });
    }
    if (answer < 0) answer = lo;
    push('Smallest feasible speed found', `Speed ${lo} is the minimum that finishes within ${h} hours.`, 'done', { piles, h, lo, hi: lo, mid: lo, hours: hoursAt(lo), feasible: true, max });
    return { frames, meta: { piles, h, max }, summary: `Minimum speed = ${lo}.`, answer: lo };
  }

  function treeDFS(input) {
    const [treeText, targetText] = splitPair(input, ['5,4,8,11,null,13,4,7,2,null,null,5,1', '22']);
    const values = levelOrder(treeText);
    const tree = buildTree(values);
    const target = num(targetText, 'Target sum');
    const frames = [];
    const path = [], pathIds = [], out = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Start at the root', `Target sum ${target}. DFS carries the current path and remaining sum.`, 'init', { node: tree.root, path: [], pathIds: [], remaining: target, found: 0, out: [] });
    const dfs = (id, remaining) => {
      if (id == null) {
        push('Null branch — return', 'Nothing to explore on this side.', 'backtrack', { node: null, path: [...path], pathIds: [...pathIds], remaining, found: out.length, out: clone(out) });
        return;
      }
      const node = tree.nodes[id];
      path.push(node.val);
      pathIds.push(id);
      remaining -= node.val;
      push('Visit the node', `Add ${node.val}; remaining = ${remaining}.`, 'visit', { node: id, path: [...path], pathIds: [...pathIds], remaining, found: out.length, out: clone(out) });
      if (node.left == null && node.right == null && remaining === 0) {
        out.push([...path]);
        push('Root-to-leaf sum matches', `Record [${path.join(', ')}].`, 'found', { node: id, path: [...path], pathIds: [...pathIds], remaining, found: out.length, out: clone(out) });
      }
      if (node.left != null) dfs(node.left, remaining);
      if (node.right != null) dfs(node.right, remaining);
      path.pop();
      pathIds.pop();
      push('Backtrack', 'Undo this node so the sibling branch starts clean.', 'backtrack', { node: id, path: [...path], pathIds: [...pathIds], remaining: remaining + node.val, found: out.length, out: clone(out) });
    };
    dfs(tree.root, target);
    push('Search complete', `${out.length} matching path${out.length === 1 ? '' : 's'}: ${out.map((row) => `[${row.join(', ')}]`).join(' ')}`, 'done', { node: tree.root, path: [], pathIds: [], remaining: target, found: out.length, out: clone(out) });
    return { frames, meta: { tree, target }, summary: `${out.length} path${out.length === 1 ? '' : 's'} sum to ${target}.`, answer: clone(out) };
  }

  function treeBFS(input) {
    const values = levelOrder(input || '3, 9, 20, null, null, 15, 7');
    const tree = buildTree(values);
    const frames = [];
    const out = [], queue = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    if (tree.root == null) {
      push('Empty tree', 'There is no root to visit.', 'done', { level: -1, queue: [], current: null, out: [], done: true });
      return { frames, meta: { tree }, summary: 'Empty tree.', answer: [] };
    }
    queue.push(tree.root);
    push('Seed the queue with the root', 'Each round consumes exactly one level.', 'init', { level: 0, queue: [...queue], current: null, out: [], done: false });
    let level = 0;
    while (queue.length) {
      const size = queue.length;
      const row = [];
      push('Begin a level', `Level ${level} has ${size} node${size === 1 ? '' : 's'} in the queue.`, 'level', { level, queue: [...queue], current: null, out: clone(out), done: false });
      for (let i = 0; i < size; i++) {
        const id = queue.shift();
        const node = tree.nodes[id];
        row.push(node.val);
        if (node.left != null) queue.push(node.left);
        if (node.right != null) queue.push(node.right);
        push('Dequeue and enqueue children', `Visit ${node.val}; children enter the back of the queue.`, 'visit', { level, queue: [...queue], current: id, row: [...row], out: clone(out), done: false });
      }
      out.push(row);
      push('Level complete', `Level ${level}: [${row.join(', ')}].`, 'level', { level, queue: [...queue], current: null, row: [...row], out: clone(out), done: false });
      level++;
    }
    push('Traversal complete', `Levels: ${out.map((row) => `[${row.join(', ')}]`).join(' ')}.`, 'done', { level: level - 1, queue: [], current: null, out: clone(out), done: true });
    return { frames, meta: { tree }, summary: `${out.length} levels: ${out.map((row) => row.join(',')).join(' | ')}`, answer: clone(out) };
  }

  function graphTraversal(input) {
    const grid = gridRows(input || '11000/11000/00100/00011');
    const rows = grid.length, cols = grid[0].length;
    const seen = new Set();
    const islandOf = {};
    const frames = [];
    let count = 0;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Scan the grid', 'Every unvisited land cell seeds a new island.', 'init', { rows, cols, grid, visited: [], islandOf: {}, current: null, count: 0, island: -1, phase: 'scan' });
    const key = (r, c) => `${r},${c}`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== '1' || seen.has(key(r, c))) continue;
        count++;
        const queue = [[r, c]];
        seen.add(key(r, c));
        islandOf[key(r, c)] = count;
        push('New island found', `Cell (${r}, ${c}) starts island #${count}. Flood fill its component.`, 'count', { rows, cols, grid, visited: [...seen].map((k) => k.split(',').map(Number)), islandOf: { ...islandOf }, current: [r, c], count, island: count, phase: 'flood' });
        while (queue.length) {
          const [cr, cc] = queue.shift();
          islandOf[key(cr, cc)] = count;
          push('Visit land', `Flood from (${cr}, ${cc}); island #${count} grows.`, 'flood', { rows, cols, grid, visited: [...seen].map((k) => k.split(',').map(Number)), islandOf: { ...islandOf }, current: [cr, cc], count, island: count, phase: 'flood' });
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = cr + dr, nc = cc + dc;
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr][nc] !== '1' || seen.has(key(nr, nc))) continue;
            seen.add(key(nr, nc));
            queue.push([nr, nc]);
          }
        }
      }
    }
    push('All components counted', `${count} island${count === 1 ? '' : 's'} in a ${rows}×${cols} grid.`, 'done', { rows, cols, grid, visited: [...seen].map((k) => k.split(',').map(Number)), islandOf: { ...islandOf }, current: null, count, island: count, phase: 'done' });
    return { frames, meta: { grid, rows, cols }, summary: `${count} island${count === 1 ? '' : 's'}.`, answer: count };
  }

  function backtracking(input) {
    const nums = numberList(input || '1, 2, 3', { label: 'Numbers', maxCount: 4 });
    if (nums.length > 4) throw new Error('The visualizer supports at most 4 values.');
    const frames = [];
    const path = [], out = [];
    const abandoned = new Set();
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Start with an empty subset', 'At each level, choose to include or exclude one value.', 'init', { nums, bits: [], path: [], out: [], abandoned: [], index: 0, action: 'init' });
    const walk = (index, bits) => {
      if (index === nums.length) {
        out.push([...path]);
        push('Emit a complete subset', `[${path.join(', ')}] is one of the 2^${nums.length} subsets.`, 'emit', { nums, bits: [...bits], path: [...path], out: clone(out), abandoned: [...abandoned], index, action: 'emit' });
        return;
      }
      push('Enter a decision node', `Include or skip ${nums[index]}?`, 'choose', { nums, bits: [...bits], path: [...path], out: clone(out), abandoned: [...abandoned], index, action: 'enter' });
      path.push(nums[index]);
      walk(index + 1, [...bits, 1]);
      path.pop();
      const includePrefix = [...bits, 1].join('');
      for (let d = index; d <= nums.length; d++) {
        for (let j = 0; j < Math.pow(2, d - index); j++) abandoned.add(includePrefix + j.toString(2).padStart(d - index, '0'));
      }
      push('Un-choose and try the skip branch', `Remove ${nums[index]}; the next branch excludes it.`, 'backtrack', { nums, bits: [...bits], path: [...path], out: clone(out), abandoned: [...abandoned], index, action: 'backtrack' });
      walk(index + 1, [...bits, 0]);
    };
    walk(0, []);
    push('All branches explored', `${out.length} subsets generated.`, 'done', { nums, bits: [], path: [], out: clone(out), abandoned: [...abandoned], index: nums.length, action: 'done' });
    return { frames, meta: { nums, depth: nums.length }, summary: `${out.length} subsets.`, answer: clone(out) };
  }

  function dynamicProgramming(input) {
    const [coinText, amountText] = splitPair(input, ['1, 2, 5', '11']);
    const coins = numberList(coinText, { min: 1, label: 'Coins', maxCount: 4 });
    const amount = Math.round(num(amountText, 'Amount'));
    if (amount < 0 || amount > 20) throw new Error('The visualizer supports an amount from 0 to 20.');
    const table = coins.map(() => new Array(amount + 1).fill(INF));
    const frames = [];
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    const snapshot = () => table.map((row) => [...row]);
    push('Initialize the DP grid', `${coins.length} coin rows × ${amount + 1} amount columns. ${INF} means unreachable.`, 'init', { coins, amount, table: snapshot(), r: -1, c: -1, deps: [], action: 'init' });
    for (let r = 0; r < coins.length; r++) {
      table[r][0] = 0;
      push('Base case: amount 0', `Row ${r} (coin ${coins[r]}) needs 0 coins for amount 0.`, 'cell', { coins, amount, table: snapshot(), r, c: 0, deps: [], action: 'base' });
      for (let value = 1; value <= amount; value++) {
        const deps = [];
        if (r > 0) {
          table[r][value] = table[r - 1][value];
          deps.push([r - 1, value]);
        }
        let candidate = INF;
        if (value >= coins[r]) {
          const below = table[r][value - coins[r]];
          candidate = below + 1;
          deps.push([r, value - coins[r]]);
        }
        if (candidate < table[r][value]) table[r][value] = candidate;
        push('Fill one cell', `Amount ${value}, coin ${coins[r]}: best is ${table[r][value] >= INF ? '∞' : table[r][value]} coin${table[r][value] === 1 ? '' : 's'}.`, 'cell', { coins, amount, table: snapshot(), r, c: value, deps: clone(deps), action: 'cell' });
      }
    }
    const answer = table[coins.length - 1][amount];
    push('Read the final cell', answer >= INF ? 'The amount is unreachable with these coins.' : `Minimum ${answer} coins for amount ${amount}.`, 'done', { coins, amount, table: snapshot(), r: coins.length - 1, c: amount, deps: [], action: 'done' });
    return { frames, meta: { coins, amount, inf: INF }, summary: answer >= INF ? 'Unreachable amount.' : `Minimum ${answer} coins.`, answer: answer >= INF ? -1 : answer };
  }

  function cyclicSort(input) {
    const nums = numberList(input || '3, 0, 1', { min: 0, label: 'Numbers', maxCount: 12 });
    const n = nums.length;
    if (nums.some((value) => value > n)) throw new Error(`Values must be in the range 0…${n}.`);
    const frames = [];
    let i = 0, missing = n;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Initialize the scan', `Values are bounded by 0…${n}, so each value ${n} or less has a home index.`, 'init', { nums: [...nums], n, i, swapped: null, missing: null, phase: 'init' });
    let guard = 0;
    while (i < n && guard++ < n * n + 8) {
      const value = nums[i];
      if (value < n && value !== i) {
        const j = value;
        [nums[i], nums[j]] = [nums[j], nums[i]];
        push('Swap the value home', `${value} belongs at index ${j}; swap it there.`, 'swap', { nums: [...nums], n, i, swapped: [i, j], missing: null, phase: 'swap' });
      } else {
        push('This slot is settled', `Index ${i} holds ${nums[i] >= n ? 'the hole' : nums[i]}; advance.`, 'place', { nums: [...nums], n, i, swapped: null, missing: null, phase: 'place' });
        i++;
      }
    }
    missing = n;
    for (let k = 0; k < n; k++) {
      if (nums[k] !== k) { missing = k; break; }
    }
    push('Scan for the hole', `Index ${missing === n ? 'n' : missing} is the missing value.`, 'scan', { nums: [...nums], n, i: n, swapped: null, missing, phase: 'scan' });
    push('Cyclic sort complete', `Missing number: ${missing}.`, 'done', { nums: [...nums], n, i: n, swapped: null, missing, phase: 'done' });
    return { frames, meta: { n, original: [...nums] }, summary: `Missing number is ${missing}.`, answer: missing };
  }

  function reverseLinkedList(input) {
    const values = numberList(input || '1, 2, 3, 4, 5', { label: 'Node values', maxCount: 10 });
    const links = values.map((_, i) => (i === values.length - 1 ? -1 : i + 1));
    const frames = [];
    let prev = -1, curr = 0;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    push('Start before the head', 'prev = null, curr = head. The chain is still in original order.', 'init', { values, links: [...links], prev, curr, next: curr === -1 ? -1 : links[curr], reversed: 0 });
    let reversed = 0;
    while (curr !== -1) {
      const next = links[curr];
      push('Save the next node', `next = ${next === -1 ? 'null' : next}. Without this, re-pointing loses the tail.`, 'save', { values, links: [...links], prev, curr, next, reversed });
      links[curr] = prev;
      reversed++;
      push('Re-point the edge', `Node ${curr} now points to ${prev === -1 ? 'null' : prev}.`, 'reverse', { values, links: [...links], prev, curr, next, reversed });
      prev = curr;
      curr = next;
      push('Advance the window', `prev = ${prev === -1 ? 'null' : prev}, curr = ${curr === -1 ? 'null' : curr}.`, 'move', { values, links: [...links], prev, curr, next: curr === -1 ? -1 : links[curr], reversed });
    }
    push('New head is the old tail', `Return node ${prev}; every edge has been reversed exactly once.`, 'done', { values, links: [...links], prev, curr: -1, next: -1, reversed });
    return { frames, meta: { values, originalLinks: values.map((_, i) => (i === values.length - 1 ? -1 : i + 1)) }, summary: `New head is ${values[prev]}.`, answer: prev === -1 ? [] : values.slice().reverse() };
  }

  function unionFind(input) {
    const edges = edgeList(input || '1,2; 1,3; 2,3');
    const nodes = [...new Set(edges.flat())].sort((a, b) => a - b);
    const parent = Array.from({ length: Math.max(...nodes) + 1 }, (_, i) => i);
    const find = (x) => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const frames = [];
    let cycleEdge = null;
    const push = (title, note, mark, data) => frames.push({ n: frames.length + 1, title, note, mark, data });
    const snapshot = () => parent.map((value, i) => (nodes.includes(i) ? find(i) : value));
    push('Initialize one set per node', `Nodes ${nodes.join(', ')} each own a singleton set.`, 'init', { nodes, edges, parent: snapshot(), edge: null, roots: null, cycleEdge: null, action: 'init' });
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      const ra = find(a), rb = find(b);
      push('Inspect the next edge', `Edge (${a}, ${b}) → roots ${ra} and ${rb}.`, 'edge', { nodes, edges, parent: snapshot(), edge: [a, b], roots: [ra, rb], cycleEdge, action: 'edge' });
      if (ra === rb) {
        cycleEdge = [a, b];
        push('Roots match — cycle detected', `(${a}, ${b}) connects two nodes already in one set. This is the redundant connection.`, 'cycle', { nodes, edges, parent: snapshot(), edge: [a, b], roots: [ra, rb], cycleEdge, action: 'cycle' });
        break;
      }
      parent[ra] = rb;
      push('Union the two sets', `Attach root ${ra} under root ${rb}. The clusters merge.`, 'union', { nodes, edges, parent: snapshot(), edge: [a, b], roots: [ra, rb], cycleEdge, action: 'union' });
    }
    push('Connectivity resolved', cycleEdge ? `Redundant edge: (${cycleEdge.join(', ')}).` : 'No redundant edge in this set.', 'done', { nodes, edges, parent: snapshot(), edge: null, roots: null, cycleEdge, action: 'done' });
    return { frames, meta: { nodes, edges }, summary: cycleEdge ? `Redundant edge (${cycleEdge.join(', ')}).` : 'No redundant edge.', answer: cycleEdge };
  }

  const ENGINES = {
    'two-pointers': twoPointers,
    'sliding-window': slidingWindow,
    'fast-slow': fastSlow,
    'merge-intervals': mergeIntervals,
    'monotonic-stack': monotonicStack,
    'top-k': topK,
    'binary-search-answer': binarySearchAnswer,
    'tree-dfs': treeDFS,
    'tree-bfs': treeBFS,
    'graph-traversal': graphTraversal,
    'backtracking': backtracking,
    'dynamic-programming': dynamicProgramming,
    'cyclic-sort': cyclicSort,
    'reverse-linked-list': reverseLinkedList,
    'union-find': unionFind
  };

  function run(patternId, input) {
    const engine = ENGINES[patternId];
    if (!engine) throw new Error(`Unknown pattern: ${patternId}`);
    const result = engine(input);
    if (!result.frames.length) throw new Error('The engine produced no frames.');
    result.patternId = patternId;
    return result;
  }

  function selfTest() {
    const checks = [];
    const check = (name, fn) => {
      try {
        const detail = fn();
        checks.push({ name, ok: detail !== false, detail });
      } catch (error) {
        checks.push({ name, ok: false, detail: error.message });
      }
    };
    const result = (id) => run(id, null);
    check('15 patterns have engines', () => Object.keys(ENGINES).length === 15);
    check('Two Pointers finds the sorted pair', () => JSON.stringify(result('two-pointers').answer) === '[0,1]');
    check('Sliding Window finds length 3', () => result('sliding-window').answer === 3);
    check('Fast & Slow meets inside the cycle', () => result('fast-slow').answer === true);
    check('Merge Intervals returns 3 slabs', () => result('merge-intervals').answer.length === 3);
    check('Monotonic Stack answers daily temperatures', () => JSON.stringify(result('monotonic-stack').answer) === '[1,1,4,2,1,1,0,0]');
    check('Top K returns 5', () => result('top-k').answer === 5);
    check('Binary Search on Answer returns 4', () => result('binary-search-answer').answer === 4);
    check('Tree DFS finds two paths', () => result('tree-dfs').answer.length === 2);
    check('Tree BFS returns three levels', () => result('tree-bfs').answer.length === 3);
    check('Graph Traversal counts three islands', () => result('graph-traversal').answer === 3);
    check('Backtracking emits eight subsets', () => result('backtracking').answer.length === 8);
    check('DP coin change returns three coins', () => result('dynamic-programming').answer === 3);
    check('Cyclic Sort finds the missing 2', () => result('cyclic-sort').answer === 2);
    check('Reverse Linked List returns five nodes', () => result('reverse-linked-list').answer.length === 5);
    check('Union-Find finds edge (2,3)', () => JSON.stringify(result('union-find').answer) === '[2,3]');
    check('Every engine emits bounded frames', () => Object.keys(ENGINES).every((id) => {
      const frames = run(id, null).frames;
      return frames.length > 2 && frames.every((frame) => frame.title && frame.note && frame.mark && frame.data);
    }));
    check('Every frame mark exists in every language', () => {
      const data = root.ALGO_DATA;
      return data.patterns.every((pattern) => {
        const marks = new Set(Object.values(pattern.code).flat().map((line) => line.m));
        return run(pattern.id, null).frames.every((frame) => marks.has(frame.mark));
      });
    });
    return { checks, total: checks.length, passed: checks.filter((item) => item.ok).length };
  }

  const API = { run, selfTest, parse: { numberList, intervalList, edgeList, levelOrder, gridRows }, buildTree, INF };
  root.ALGO_ENGINE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
