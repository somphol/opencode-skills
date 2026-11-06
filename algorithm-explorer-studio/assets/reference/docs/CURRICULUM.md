# Curriculum map

Fifteen patterns, their recognition signals, complexity, canonical problems and what the 3D scene is
trying to make obvious. The app's quiz and practice tabs are generated from the same records in
`js/data.js`.

## How to study with this studio

1. **Read the signal first.** Cover the pattern title and ask what structure the signal implies.
2. **Step the scene.** Predict the next comparison or move before pressing `→`.
3. **Read the highlighted line.** Connect the spatial move to the code operation.
4. **Change the input.** A pattern you only know for one example is memorization, not recognition.
5. **Take the quiz.** If the scenario does not trigger a pattern, reread the signal keywords.
6. **Practice the canonical list.** Check a problem off only when you can derive it from the signal.

## The 15 patterns

| # | Pattern | Signal | Time | Space | 3D model | Anchor problems |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Two Pointers | sorted arrays, pair sums, in-place partitioning, palindromes | O(n) | O(1) | floating cubes + converging pointer beams | Two Sum II #167, 3Sum #15 |
| 2 | Sliding Window | contiguous subarray/substring, fixed or variable constraint | O(n) | O(k) | translucent box wrapping the active substring | Longest Substring Without Repeating #3 |
| 3 | Fast & Slow Pointers | linked-list cycle, middle node, repeated state | O(n) | O(1) | orbital ring + two runners | Linked List Cycle #141 |
| 4 | Merge Intervals | overlapping ranges, scheduling, range merging | O(n log n) | O(n) | extruded timeline slabs fusing into a result row | Merge Intervals #56 |
| 5 | Monotonic Stack | next/previous greater/smaller, histogram, temperatures | O(n) | O(n) | temperature columns + z-stack tower | Daily Temperatures #739 |
| 6 | Top K Elements | kth smallest/largest, streaming median, top frequent | O(n log k) | O(k) | array + spatial binary heap | Kth Largest Element #215 |
| 7 | Binary Search on Answer | monotonic “minimum capacity/speed such that…” | O(n log m) | O(1) | number line narrowing around a feasibility boundary | Koko Eating Bananas #875 |
| 8 | Tree DFS | root-to-leaf paths, subtree properties, validation | O(n) | O(h) | tree + travelling cursor and lit path | Path Sum II #113, Validate BST #98 |
| 9 | Tree BFS | level order, shortest depth, zigzag, right view | O(n) | O(w) | tree + horizontal sweeping level planes | Level Order Traversal #102 |
| 10 | Graph Traversal | grid islands, components, rotting/flood fill | O(rc) | O(rc) | voxel archipelago rising from water | Number of Islands #200 |
| 11 | Backtracking | all combinations/permutations/subsets, constraints | O(2ⁿ) | O(n) | decision tree, active path, abandoned wireframes | Subsets #78, N-Queens #51 |
| 12 | Dynamic Programming | overlapping subproblems, count ways, min/max score | O(nm) | O(nm) | volumetric DP grid with dependency lines | Coin Change #322, Climbing Stairs #70 |
| 13 | Cyclic Sort | values bounded within the index range | O(n) | O(1) | tokens clicking into numbered slots | Missing Number #268 |
| 14 | In-Place Linked List Reversal | reverse a list or segment | O(n) | O(1) | arrow vectors rotating as edges re-point | Reverse Linked List #206 |
| 15 | Union-Find | dynamic connectivity, redundant edges, grouping | O(α(n)) | O(n) | graph collapsing into colour-coded clusters | Redundant Connection #684 |

## Difficulty distribution

The 61 practice problems span Easy / Medium / Hard. The rail intentionally does not sort by
difficulty: the curriculum is ordered by *pattern dependency*, not by comfort. A recommended first
pass is Two Pointers → Sliding Window → Fast & Slow → Merge Intervals → Monotonic Stack → Top K →
Binary Search on Answer → Tree DFS → Tree BFS → Graph → Backtracking → DP → Cyclic Sort → Reverse
List → Union-Find.

## Per-pattern study notes

### 1. Two Pointers

Sorted order is the permission slip. Each comparison rules out one endpoint, so the pair space
shrinks by one every step. Do not use it on unsorted input unless you sort first (and account for
the lost index identity). Variants: same-direction (remove duplicates), two-sequence (merge),
opposing (palindrome).

### 2. Sliding Window

A window is a contiguous subarray plus an invariant. Expand right; when the invariant breaks, shrink
left until it holds. Fixed-size windows are a special case. If the data can contain negatives, a sum
constraint may not be monotonic and the pattern breaks.

### 3. Fast & Slow Pointers

Two speeds in a finite state space must eventually meet if there is a cycle. It also finds the middle
(fast reaches the end as slow reaches the middle) and detects repeated states in number transforms
(Happy Number).

### 4. Merge Intervals

Sort by start. Keep a result list; the only interval that can overlap the next one is the last one in
the result. Sweep-line variants (meeting rooms) need a heap of end times instead of a merge list.

### 5. Monotonic Stack

The stack stores unresolved indices in monotonic order. When the current value resolves the top, pop
and record the distance. Each index is pushed and popped at most once, giving O(n). The same skeleton
solves next-greater, histogram area and stock-span problems.

### 6. Top K Elements

A size-k min-heap keeps the k largest values; the root is the weakest survivor. A max-heap of size k
keeps the k smallest. For streaming medians, use two heaps balanced by size.

### 7. Binary Search on Answer

The array is not the search space; the answer is. Define `feasible(x)` that is false…false,true…true
(or the reverse), then binary-search the boundary. The feasibility scan is usually greedy.

### 8. Tree DFS

Carry state down (path, remaining sum, allowed bounds) and combine on the way up (height, diameter,
validity). Backtracking is the same shape with an explicit undo. Recursion depth is the tree height.

### 9. Tree BFS

A queue plus level-sized batches. Capture `size = queue.length` before the inner loop, or levels
blend. Used for level averages, right-side view, zigzag (reverse alternate rows), minimum depth and
shortest path in an unweighted tree.

### 10. Graph Traversal

Every unvisited source starts a component. Flood fill marks reachable cells and counts once.
Multi-source BFS models time layers (rotting oranges). On grids, visited marking must happen at
enqueue time or the queue duplicates cells.

### 11. Backtracking

Choose → recurse → un-choose. The accumulator must be exactly restored before the sibling branch.
Pruning is what makes it usable: stop when the remaining budget cannot satisfy the constraint.
Subsets are 2ⁿ leaves; permutations are n!; N-Queens adds column/diagonal sets.

### 12. Dynamic Programming

Define the state, the recurrence and the base case before writing loops. Coin Change:
`dp[a] = min(dp[a - coin] + 1)`. 2D tables expose dependencies; 1D rolling arrays save memory when
only the previous row is needed. Do not confuse “number of ways” with “minimum coins”.

### 13. Cyclic Sort

When values are bounded by `0…N` or `1…N`, each value has one home index. Swap it home; each swap
places at least one value, so the total is O(n). The first mismatch is the missing value; duplicates
need a “already home” check.

### 14. In-Place Linked List Reversal

Save `next`, re-point `curr.next = prev`, advance both. Three pointers, one pass. Segment reversal
(reverse between left and right) needs a dummy node and a reconnect step; k-group reversal repeats
the same primitive and reconnects groups.

### 15. Union-Find

`find` returns a representative; `union` links two roots. Path compression flattens chains; union by
rank/size keeps trees shallow. An edge whose endpoints already share a root is redundant. This is the
default for dynamic connectivity, accounts merge and component counting.

## References

- Design Gurus, *Grokking the Coding Interview: Patterns for Coding Questions* — pattern-first
  curriculum inspiration.
- NeetCode 150 — problem selection and progression inspiration.
- Blind 75 — canonical problem set inspiration.
- LeetCode — problem statements and links. This project is not affiliated with any of the above.
