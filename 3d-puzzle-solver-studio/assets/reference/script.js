/* ============================================================================
   Full 3D 15-Puzzle Studio & Auto-Solver — script.js
   Vanilla ES modules + Three.js. No framework, no backend, no tracking.

   Sections
   1. Puzzle engine — pure, self-contained, testable (see tests/engine.test.mjs)
   2. Content — bilingual dictionary, studio tips
   3. Platform — audio, persistence, formatting, DOM helpers
   4. Three.js studio — tray, tiles, skins, lights, camera, raycasting, motion
   5. Controller — state, moves, undo, timer, records, export
   6. Solver client — Web Worker A*, auto-play, step hints, overlay arrow
   7. Interface — language, modal, toast, keyboard, self-test, boot

   The engine factory is stringified into the solver worker. Keep it free of
   imports and outer-scope references or the worker will fail silently.
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ==========================================================================
   1. PUZZLE ENGINE
   ========================================================================== */

/* ENGINE:START */
function createPuzzle15Engine() {
  const SIZE = 4;
  const CELLS = SIZE * SIZE;
  const GOAL = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]);

  const rowOf = (i) => (i / SIZE) | 0;
  const colOf = (i) => i % SIZE;
  const isSolved = (board) => board.every((v, i) => v === GOAL[i]);

  function inversions(board) {
    let inv = 0;
    for (let i = 0; i < CELLS; i++) {
      const a = board[i];
      if (!a) continue;
      for (let j = i + 1; j < CELLS; j++) {
        const b = board[j];
        if (b && a > b) inv++;
      }
    }
    return inv;
  }

  // 4x4 solvability: (inversions + blank row counted from the bottom) must be odd.
  function isSolvable(board) {
    const blank = board.indexOf(0);
    const rowFromBottom = SIZE - rowOf(blank);
    return (inversions(board) + rowFromBottom) % 2 === 1;
  }

  function manhattan(board) {
    let sum = 0;
    for (let i = 0; i < CELLS; i++) {
      const v = board[i];
      if (!v) continue;
      const goal = v - 1;
      sum += Math.abs(rowOf(i) - rowOf(goal)) + Math.abs(colOf(i) - colOf(goal));
    }
    return sum;
  }

  // Two linear conflicts are worth +2 each: one for the tile that must leave the
  // line, one for the tile that must enter it. Admissible and consistent.
  function linearConflicts(board) {
    let pairs = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c1 = 0; c1 < SIZE; c1++) {
        const v1 = board[r * SIZE + c1];
        if (!v1 || rowOf(v1 - 1) !== r) continue;
        for (let c2 = c1 + 1; c2 < SIZE; c2++) {
          const v2 = board[r * SIZE + c2];
          if (!v2 || rowOf(v2 - 1) !== r) continue;
          if (colOf(v1 - 1) > colOf(v2 - 1)) pairs++;
        }
      }
    }
    for (let c = 0; c < SIZE; c++) {
      for (let r1 = 0; r1 < SIZE; r1++) {
        const v1 = board[r1 * SIZE + c];
        if (!v1 || colOf(v1 - 1) !== c) continue;
        for (let r2 = r1 + 1; r2 < SIZE; r2++) {
          const v2 = board[r2 * SIZE + c];
          if (!v2 || colOf(v2 - 1) !== c) continue;
          if (rowOf(v1 - 1) > rowOf(v2 - 1)) pairs++;
        }
      }
    }
    return pairs * 2;
  }

  function heuristic(board) {
    return manhattan(board) + linearConflicts(board);
  }

  function legalMoves(board) {
    const blank = board.indexOf(0);
    const r = rowOf(blank);
    const c = colOf(blank);
    const out = [];
    if (r > 0) out.push(blank - SIZE);
    if (r < SIZE - 1) out.push(blank + SIZE);
    if (c > 0) out.push(blank - 1);
    if (c < SIZE - 1) out.push(blank + 1);
    return out;
  }

  function move(board, tileIndex) {
    const blank = board.indexOf(0);
    if (tileIndex < 0 || tileIndex >= CELLS) return null;
    const dr = Math.abs(rowOf(tileIndex) - rowOf(blank));
    const dc = Math.abs(colOf(tileIndex) - colOf(blank));
    if (dr + dc !== 1) return null;
    const next = board.slice();
    next[blank] = next[tileIndex];
    next[tileIndex] = 0;
    return next;
  }

  function keyOf(board) {
    let k = '';
    for (let i = 0; i < CELLS; i++) k += String.fromCharCode(48 + board[i]);
    return k;
  }

  function directionOf(board, tileIndex) {
    const blank = board.indexOf(0);
    if (tileIndex === blank - SIZE) return 'down';
    if (tileIndex === blank + SIZE) return 'up';
    if (tileIndex === blank - 1) return 'right';
    if (tileIndex === blank + 1) return 'left';
    return null;
  }

  class MinHeap {
    constructor(score) {
      this.items = [];
      this.score = score || ((n) => n.f);
    }
    get size() { return this.items.length; }
    push(item) {
      const a = this.items;
      a.push(item);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.score(a[p]) <= this.score(a[i])) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.items;
      const top = a[0];
      const last = a.pop();
      if (a.length && last !== undefined) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < a.length && this.score(a[l]) < this.score(a[m])) m = l;
          if (r < a.length && this.score(a[r]) < this.score(a[m])) m = r;
          if (m === i) break;
          [a[m], a[i]] = [a[i], a[m]];
          i = m;
        }
      }
      return top;
    }
  }

  function hStart(board) {
    return manhattan(board) + linearConflicts(board);
  }

  // A* with a state-deduplicating closed set. `weight` 1 is optimal; larger
  // weights trade optimality for speed and are used only as a fallback.
  function aStar(start, weight, budget, deadline) {
    const opened = new MinHeap((node) => node.f * 10000 + node.h);
    const boards = [start];
    const gs = [0];
    const parents = [-1];
    const moves = [-1];
    const bestG = new Map([[keyOf(start), 0]]);
    const h0 = heuristic(start);
    opened.push({ f: h0 * weight, h: h0, idx: 0 });
    let expanded = 0;

    while (opened.size) {
      const node = opened.pop();
      const idx = node.idx;
      const board = boards[idx];
      if (isSolved(board)) {
        const path = [];
        let cur = idx;
        while (parents[cur] !== -1) {
          path.push(moves[cur]);
          cur = parents[cur];
        }
        path.reverse();
        return { ok: true, moves: path, nodes: expanded, optimal: weight === 1, weight };
      }
      const g = gs[idx];
      const key = keyOf(board);
      if ((bestG.get(key) ?? Infinity) < g) continue;
      expanded++;
      if (expanded > budget) return { ok: false, nodes: expanded, reason: 'budget', weight };
      if (deadline && (expanded & 1023) === 0 && Date.now() > deadline) {
        return { ok: false, nodes: expanded, reason: 'time', weight };
      }

      const blank = board.indexOf(0);
      const r = rowOf(blank);
      const c = colOf(blank);
      const neighbours = [];
      if (r > 0) neighbours.push(blank - SIZE);
      if (r < SIZE - 1) neighbours.push(blank + SIZE);
      if (c > 0) neighbours.push(blank - 1);
      if (c < SIZE - 1) neighbours.push(blank + 1);

      for (let n = 0; n < neighbours.length; n++) {
        const tile = neighbours[n];
        const tileValue = board[tile];
        const next = board.slice();
        next[blank] = tileValue;
        next[tile] = 0;
        const ng = g + 1;
        const nk = keyOf(next);
        const known = bestG.get(nk);
        if (known !== undefined && known <= ng) continue;
        bestG.set(nk, ng);
        const h = heuristic(next);
        const id = boards.length;
        boards.push(next);
        gs.push(ng);
        parents.push(idx);
        // Solution moves are tile numbers (1..15), not cell indices.
        moves.push(tileValue);
        opened.push({ f: ng + h * weight, h, idx: id });
      }
    }
    return { ok: false, nodes: expanded, reason: 'exhausted', weight };
  }

  function solve(start, options) {
    const opts = options || {};
    const t0 = Date.now();
    if (!Array.isArray(start) || start.length !== CELLS) {
      return { ok: false, reason: 'bad-board', moves: [], nodes: 0, elapsedMs: 0 };
    }
    if (new Set(start).size !== CELLS || start.some((v) => v < 0 || v > 15 || !Number.isInteger(v))) {
      return { ok: false, reason: 'bad-board', moves: [], nodes: 0, elapsedMs: 0 };
    }
    if (!isSolvable(start)) {
      return { ok: false, reason: 'unsolvable', moves: [], nodes: 0, elapsedMs: Date.now() - t0 };
    }
    if (isSolved(start)) {
      return { ok: true, moves: [], nodes: 0, optimal: true, weight: 1, elapsedMs: 0, startH: 0 };
    }

    const startH = hStart(start);
    const optimalBudget = opts.optimalBudget ?? 500000;
    const optimalTime = opts.optimalTimeMs ?? 6000;
    const nearBudget = opts.nearBudget ?? 700000;
    const nearTime = opts.nearTimeMs ?? 12000;
    const greedyBudget = opts.greedyBudget ?? 900000;

    let first = aStar(start, 1, optimalBudget, Date.now() + optimalTime);
    if (first.ok) {
      return { ...first, elapsedMs: Date.now() - t0, startH };
    }

    let fallback = aStar(start, 1.6, nearBudget, Date.now() + nearTime);
    if (fallback.ok) {
      return { ...fallback, elapsedMs: Date.now() - t0, startH };
    }

    // Weighted A* is complete while the graph is finite, so this last pass
    // always terminates with a path for a solvable board.
    let last = aStar(start, 4, greedyBudget, Date.now() + (opts.greedyTimeMs ?? 20000));
    if (last.ok) {
      return { ...last, elapsedMs: Date.now() - t0, startH };
    }

    return {
      ok: false,
      reason: last.reason || fallback.reason || first.reason || 'no-path',
      moves: [],
      nodes: first.nodes + fallback.nodes + last.nodes,
      elapsedMs: Date.now() - t0,
      startH,
    };
  }

  // Shuffle by walking away from the goal. Reversal-free moves keep the walk
  // from undoing itself, and the parity check is a second, independent guard.
  function shuffle(steps, random) {
    const rnd = random || Math.random;
    const target = steps ?? 60;
    let board = GOAL.slice();
    let previousBlank = -1;
    for (let s = 0; s < target; s++) {
      const options = legalMoves(board).filter((t) => t !== previousBlank);
      const pool = options.length ? options : legalMoves(board);
      const tile = pool[(rnd() * pool.length) | 0];
      previousBlank = board.indexOf(0);
      board = move(board, tile);
    }
    if (isSolved(board)) return shuffle(Math.max(12, target), rnd);
    if (!isSolvable(board)) {
      const blank = board.indexOf(0);
      const candidates = legalMoves(board);
      if (candidates.length) board = move(board, candidates[0]);
    }
    return board;
  }

  // Breadth-first reference solver, exported for tests and documentation.
  function bfs(start, maxStates) {
    const limit = maxStates ?? 400000;
    const t0 = Date.now();
    if (isSolved(start)) return { ok: true, depth: 0, states: 1, elapsedMs: 0 };
    let frontier = [{ board: start, depth: 0 }];
    const seen = new Set([keyOf(start)]);
    let states = 1;
    for (let depth = 1; frontier.length; depth++) {
      const next = [];
      for (const node of frontier) {
        for (const tile of legalMoves(node.board)) {
          const child = move(node.board, tile);
          const k = keyOf(child);
          if (seen.has(k)) continue;
          if (isSolved(child)) return { ok: true, depth, states: states + 1, elapsedMs: Date.now() - t0 };
          seen.add(k);
          next.push({ board: child, depth });
          states++;
          if (states > limit) return { ok: false, reason: 'limit', states, elapsedMs: Date.now() - t0 };
        }
      }
      frontier = next;
    }
    return { ok: false, reason: 'exhausted', states, elapsedMs: Date.now() - t0 };
  }

  return {
    SIZE, CELLS, GOAL,
    rowOf, colOf, isSolved, inversions, isSolvable, manhattan, linearConflicts,
    heuristic, legalMoves, move, keyOf, directionOf, aStar, solve, shuffle, bfs,
    MinHeap,
  };
}
const Puzzle15 = createPuzzle15Engine();
/* ENGINE:END */

/* ==========================================================================
   2. CONTENT — bilingual copy
   ========================================================================== */

const I18N = {
  en: {
    'meta.title': 'Full 3D 15-Puzzle Studio & Auto-Solver',
    'brand.tagline': 'Slide a real tray. Watch A* think. Solve it your way.',
    'status.ready': 'Ready to shuffle',
    'status.thinking': 'Thinking…',
    'status.playing': 'In play',
    'status.shuffled': 'Shuffled — solvable',
    'status.solving': 'Auto-solving',
    'status.hint': 'Hint ready',
    'status.solved': 'Solved',
    'status.restored': 'Session restored',
    'status.unsolvable': 'This arrangement cannot be solved',

    'hud.moves': 'Moves',
    'hud.time': 'Time',
    'hud.heuristic': 'h',
    'hud.manhattan': 'Manhattan',
    'hud.path': 'Left',
    'hud.steps': 'steps',

    'ui.language': 'Language',
    'ui.sound': 'Toggle sound',
    'ui.help': 'How to play',
    'ui.playPanel': 'Play controls',
    'ui.solverPanel': 'Solver and telemetry',
    'ui.stage': '3D puzzle tray',
    'ui.canvas': 'Interactive 3D fifteen puzzle',
    'ui.close': 'Close',

    'card.play': 'Play', 'card.playTag': 'Tactile',
    'card.skins': 'Tile skin', 'card.skinsTag': '4×4',
    'card.records': 'Records', 'card.recordsTag': 'Local',
    'card.solver': 'A* auto-solver',
    'card.log': 'Move log',
    'card.tip': 'Studio tip',

    'btn.shuffle': 'Shuffle', 'btn.solved': 'Solved state',
    'btn.undo': 'Undo', 'btn.cameraReset': 'Reset view',
    'btn.cameraTop': 'Top view', 'btn.upload': 'Upload image',
    'btn.clearImage': 'Clear custom image', 'btn.export': 'Export JSON',
    'btn.resetRecords': 'Reset records', 'btn.solve': 'Auto-solve',
    'btn.hint': 'Step hint', 'btn.stop': 'Stop', 'btn.clearLog': 'Clear',
    'btn.again': 'Shuffle again',

    'hint.arrows': 'Click a tile beside the gap, or use the arrow keys.',
    'skin.label': 'Face material',
    'skin.classic': 'Classic numbers', 'skin.wood': 'Wood grain',
    'skin.marble': 'Marble', 'skin.custom': 'Custom image',
    'skin.noImage': 'No image loaded — numbers stay readable.',
    'skin.loaded': 'Image sliced across 15 tiles.',
    'skin.bad': 'That file could not be read as an image.',

    'record.bestTime': 'Best time', 'record.bestMoves': 'Fewest moves',
    'record.streak': 'Solve streak',
    'record.assistNote': 'Records are earned only on unassisted solves.',

    'legend.gap': 'Gap', 'legend.hint': 'Next hint', 'legend.solved': 'In place',
    'stage.note': 'Drag to orbit · scroll to zoom · click a neighbour to slide',
    'stage.assisted': 'Assisted',
    'loading.text': 'Polishing the tray…',

    'solver.ready': 'Ready', 'solver.speed': 'Playback speed',
    'solver.slow': 'Slow', 'solver.fast': 'Fast',
    'solver.h': 'h — Manhattan', 'solver.g': 'g — moves made',
    'solver.remaining': 'Path remaining', 'solver.expanded': 'Nodes expanded',
    'solver.note': 'Manhattan distance + linear conflicts guide the search.',
    'solver.optimal': 'Optimal path found in {ms} ms.',
    'solver.near': 'Near-optimal path found in {ms} ms.',
    'solver.failed': 'Search did not finish. Try a smaller shuffle.',
    'solver.unsolvable': 'This arrangement is not solvable.',
    'solver.calculating': 'Searching…',
    'solver.solvedAlready': 'Already solved.',
    'solver.stopped': 'Stopped.',
    'solver.playing': 'Playing the solution…',
    'solver.hintReady': 'Slide tile {n} {dir}.',

    'log.empty': 'Your slides will appear here.',
    'log.up': 'up', 'log.down': 'down', 'log.left': 'left', 'log.right': 'right',

    'tip.default': 'Solve the top two rows first, then rotate the last two rows like a small 2×2 puzzle.',
    'tip.one': 'One tile beside the gap at a time. Plan two moves ahead before you click.',
    'tip.two': 'Keep the top row intact while you work the second row — moving a solved tile back costs four moves.',
    'tip.three': 'The last two rows are a loop. Rotate 9–12–13–14 around the gap instead of fighting it.',
    'tip.four': 'Ask for a hint when you are stuck: h tells you how far the tray still is from home.',
    'tip.five': 'Fewer moves is a different record from faster time. Chase both.',

    'footer.made': 'Built with vanilla JS + Three.js.',
    'footer.credit': 'OpenCode × DeepSeek V4.1 Flash.',
    'footer.howto': 'How to play', 'footer.docs': 'Documentation',
    'footer.offline': 'No backend, no tracking.',

    'help.eyebrow': 'Field guide',
    'help.title': 'How to play the 15-puzzle',
    'help.lede': 'Slide one tile at a time into the empty slot. Order 1–15 left to right, top to bottom, with the gap in the bottom-right corner.',
    'help.h1': 'Move a tile',
    'help.p1': 'Click or tap any tile touching the gap. It slides in with a soft thud. Arrow keys do the same from the keyboard.',
    'help.h2': 'Ask the solver',
    'help.p2': 'Auto-solve runs A* with Manhattan distance plus linear conflicts. Step hint points at the next optimal tile.',
    'help.h3': 'Read the numbers',
    'help.p3': 'h is the estimated distance to the goal; g is the moves you have made; Left is the remaining solution length.',
    'help.h4': 'Earn a record',
    'help.p4': 'Best time and fewest moves are saved locally and only count when you solve without hints or auto-solve.',
    'help.keysArrows': 'Slide a neighbour', 'help.keysH': 'Step hint',
    'help.keysZ': 'Undo', 'help.keysR': 'Shuffle',
    'help.foot': 'Every shuffled start is checked with the inversion-parity rule, so it is always solvable.',

    'win.eyebrow': 'Tray complete',
    'win.title': 'Every tile in place.',
    'win.lede': 'The gap is home. Here is how this solve compares.',
    'win.time': 'Time', 'win.moves': 'Moves', 'win.best': 'Best time',
    'win.record': 'A new personal best.',
    'win.movesRecord': 'Fewest moves yet.',
    'win.noRecord': 'Assisted solve — records stay untouched.',
    'win.again': 'Shuffle again', 'win.close': 'Keep looking',

    'toast.shuffled': 'New solvable shuffle.',
    'toast.solved': 'Solved. Beautifully done.',
    'toast.undo': 'Move taken back.',
    'toast.exported': 'Game JSON downloaded.',
    'toast.recordsReset': 'Records cleared.',
    'toast.skinMissing': 'Upload an image first.',
    'toast.copied': 'Copied to clipboard.',
    'toast.stopped': 'Solver stopped.',
    'toast.alreadySolved': 'Shuffle first — the tray is already solved.',
    'toast.assisted': 'Hint shown — this solve will not set a record.',
    'toast.camera': 'View reset.',
    'toast.soundOn': 'Sound on.',
    'toast.soundOff': 'Sound off.',

    'dir.up': 'up', 'dir.down': 'down', 'dir.left': 'left', 'dir.right': 'right',
  },
  th: {
    'meta.title': 'สตูดิโอปริศนา 15 ช่อง 3 มิติ & ตัวแก้ A*',
    'brand.tagline': 'เลื่อนถาดจริง ดู A* คิด แล้วแก้ด้วยวิธีของคุณ',
    'status.ready': 'พร้อมเริ่ม',
    'status.thinking': 'กำลังคิด…',
    'status.playing': 'กำลังเล่น',
    'status.shuffled': 'สุ่มแล้ว — แก้ได้แน่นอน',
    'status.solving': 'กำลังแก้ให้',
    'status.hint': 'คำใบ้พร้อม',
    'status.solved': 'แก้สำเร็จ',
    'status.restored': 'กู้เกมที่ค้างไว้',
    'status.unsolvable': 'รูปแบบนี้แก้ไม่ได้',

    'hud.moves': 'ก้าว',
    'hud.time': 'เวลา',
    'hud.heuristic': 'h',
    'hud.manhattan': 'แมนฮัตตัน',
    'hud.path': 'เหลือ',
    'hud.steps': 'ก้าว',

    'ui.language': 'ภาษา',
    'ui.sound': 'เปิด/ปิดเสียง',
    'ui.help': 'วิธีเล่น',
    'ui.playPanel': 'ควบคุมการเล่น',
    'ui.solverPanel': 'ตัวแก้และสถิติ',
    'ui.stage': 'ถาดปริศนา 3 มิติ',
    'ui.canvas': 'ปริศนา 15 ช่องแบบ 3 มิติ',
    'ui.close': 'ปิด',

    'card.play': 'เล่น', 'card.playTag': 'สัมผัสจริง',
    'card.skins': 'ลายกระเบื้อง', 'card.skinsTag': '4×4',
    'card.records': 'สถิติ', 'card.recordsTag': 'ในเครื่อง',
    'card.solver': 'ตัวแก้ A*',
    'card.log': 'บันทึกการเลื่อน',
    'card.tip': 'เคล็ดลับ',

    'btn.shuffle': 'สุ่มใหม่', 'btn.solved': 'สภาพที่แก้แล้ว',
    'btn.undo': 'ย้อนกลับ', 'btn.cameraReset': 'มุมมองเริ่มต้น',
    'btn.cameraTop': 'มองจากด้านบน', 'btn.upload': 'อัปโหลดภาพ',
    'btn.clearImage': 'ล้างภาพที่อัปโหลด', 'btn.export': 'ส่งออก JSON',
    'btn.resetRecords': 'ล้างสถิติ', 'btn.solve': 'แก้ให้อัตโนมัติ',
    'btn.hint': 'ขอคำใบ้', 'btn.stop': 'หยุด', 'btn.clearLog': 'ล้าง',
    'btn.again': 'สุ่มอีกครั้ง',

    'hint.arrows': 'คลิกกระเบื้องที่ติดกับช่องว่าง หรือใช้ปุ่มลูกศร',
    'skin.label': 'วัสดุผิวหน้า',
    'skin.classic': 'ตัวเลขคลาสสิก', 'skin.wood': 'ลายไม้',
    'skin.marble': 'หินอ่อน', 'skin.custom': 'ภาพของคุณ',
    'skin.noImage': 'ยังไม่มีภาพ — ตัวเลขยังอ่านง่าย',
    'skin.loaded': 'ตัดภาพเป็น 15 ชิ้นแล้ว',
    'skin.bad': 'ไม่สามารถอ่านไฟล์นี้เป็นภาพได้',

    'record.bestTime': 'เวลาที่ดีที่สุด', 'record.bestMoves': 'ก้าวที่น้อยที่สุด',
    'record.streak': 'ชนะติดต่อกัน',
    'record.assistNote': 'สถิติจะนับเฉพาะการแก้ด้วยตัวเองเท่านั้น',

    'legend.gap': 'ช่องว่าง', 'legend.hint': 'คำใบ้ถัดไป', 'legend.solved': 'เข้าที่แล้ว',
    'stage.note': 'ลากเพื่อหมุน · เลื่อนเพื่อซูม · คลิกชิ้นข้างช่องว่างเพื่อเลื่อน',
    'stage.assisted': 'มีผู้ช่วย',
    'loading.text': 'กำลังขัดถาด…',

    'solver.ready': 'พร้อม', 'solver.speed': 'ความเร็วเล่น',
    'solver.slow': 'ช้า', 'solver.fast': 'เร็ว',
    'solver.h': 'h — แมนฮัตตัน', 'solver.g': 'g — ก้าวที่เดินแล้ว',
    'solver.remaining': 'เส้นทางที่เหลือ', 'solver.expanded': 'สถานะที่ขยาย',
    'solver.note': 'ระยะแมนฮัตตันและ linear conflicts ช่วยนำการค้นหา',
    'solver.optimal': 'พบเส้นทางที่ดีที่สุดใน {ms} มิลลิวินาที',
    'solver.near': 'พบเส้นทางใกล้เคียงที่สุดใน {ms} มิลลิวินาที',
    'solver.failed': 'การค้นหาไม่เสร็จ ลองสุ่มให้น้อยลง',
    'solver.unsolvable': 'รูปแบบนี้แก้ไม่ได้',
    'solver.calculating': 'กำลังค้นหา…',
    'solver.solvedAlready': 'แก้เสร็จแล้ว',
    'solver.stopped': 'หยุดแล้ว',
    'solver.playing': 'กำลังเล่นเส้นทางที่แก้…',
    'solver.hintReady': 'เลื่อนชิ้น {n} ไปทาง{dir}',

    'log.empty': 'การเลื่อนของคุณจะแสดงที่นี่',
    'log.up': 'ขึ้น', 'log.down': 'ลง', 'log.left': 'ซ้าย', 'log.right': 'ขวา',

    'tip.default': 'แก้สองแถวบนให้เสร็จก่อน แล้วหมุนสองแถวล่างเหมือนปริศนา 2×2 ขนาดเล็ก',
    'tip.one': 'เลื่อนทีละชิ้นที่ติดช่องว่าง คิดล่วงหน้าสองก้าวก่อนคลิก',
    'tip.two': 'อย่าให้แถวบนเสียหายขณะทำแถวที่สอง — การเลื่อนชิ้นที่เข้าที่แล้วกลับต้องแลกสี่ก้าว',
    'tip.three': 'สองแถวล่างคือวงจร หมุน 9–12–13–14 รอบช่องว่างแทนการฝืน',
    'tip.four': 'ติดขัดก็ขอคำใบ้: ค่า h บอกว่าถาดยังห่างบ้านแค่ไหน',
    'tip.five': 'จำนวนก้าวกับเวลาเป็นสถิติคนละแบบ ไล่ล่าทั้งคู่ได้เลย',

    'footer.made': 'สร้างด้วย vanilla JS + Three.js',
    'footer.credit': 'OpenCode × DeepSeek V4.1 Flash',
    'footer.howto': 'วิธีเล่น', 'footer.docs': 'เอกสาร',
    'footer.offline': 'ไม่มีเซิร์ฟเวอร์ ไม่มีการติดตาม',

    'help.eyebrow': 'คู่มือภาคสนาม',
    'help.title': 'วิธีเล่นปริศนา 15 ช่อง',
    'help.lede': 'เลื่อนทีละชิ้นเข้าช่องว่าง เรียง 1–15 จากซ้ายไปขวา บนลงล่าง โดยให้ช่องว่างอยู่มุมขวาล่าง',
    'help.h1': 'เลื่อนกระเบื้อง',
    'help.p1': 'คลิกหรือแตะชิ้นที่ติดกับช่องว่าง มันจะเลื่อนเข้าพร้อมเสียงเบา ๆ ปุ่มลูกศรก็ใช้ได้',
    'help.h2': 'ขอให้ตัวแก้ช่วย',
    'help.p2': 'โหมดแก้ให้ใช้ A* ร่วมกับระยะแมนฮัตตันและ linear conflicts คำใบ้จะชี้ชิ้นถัดไป',
    'help.h3': 'อ่านตัวเลข',
    'help.p3': 'h คือระยะประมาณถึงเป้าหมาย g คือก้าวที่เดินแล้ว Left คือจำนวนก้าวที่เหลือ',
    'help.h4': 'ทำสถิติ',
    'help.p4': 'เวลาและจำนวนก้าวที่ดีที่สุดถูกเก็บในเครื่อง และนับเฉพาะตอนแก้ด้วยตัวเอง',
    'help.keysArrows': 'เลื่อนชิ้นข้าง ๆ', 'help.keysH': 'คำใบ้',
    'help.keysZ': 'ย้อนกลับ', 'help.keysR': 'สุ่มใหม่',
    'help.foot': 'ทุกครั้งที่สุ่มจะตรวจกฎ inversion-parity จึงแก้ได้เสมอ',

    'win.eyebrow': 'ถาดครบแล้ว',
    'win.title': 'ทุกชิ้นเข้าที่',
    'win.lede': 'ช่องว่างกลับบ้านแล้ว นี่คือผลของรอบนี้',
    'win.time': 'เวลา', 'win.moves': 'ก้าว', 'win.best': 'เวลาที่ดีที่สุด',
    'win.record': 'สถิติส่วนตัวใหม่',
    'win.movesRecord': 'ก้าวน้อยที่สุดเท่าที่เคยทำ',
    'win.noRecord': 'รอบนี้มีผู้ช่วย — สถิติยังไม่ถูกแตะ',
    'win.again': 'สุ่มอีกครั้ง', 'win.close': 'ดูต่อ',

    'toast.shuffled': 'สุ่มใหม่แล้ว และแก้ได้แน่นอน',
    'toast.solved': 'สำเร็จแล้ว เยี่ยมมาก',
    'toast.undo': 'ย้อนก้าวล่าสุดแล้ว',
    'toast.exported': 'ดาวน์โหลด JSON แล้ว',
    'toast.recordsReset': 'ล้างสถิติแล้ว',
    'toast.skinMissing': 'อัปโหลดภาพก่อน',
    'toast.copied': 'คัดลอกแล้ว',
    'toast.stopped': 'หยุดตัวแก้แล้ว',
    'toast.alreadySolved': 'สุ่มก่อน — ถาดนี้แก้เสร็จอยู่แล้ว',
    'toast.assisted': 'แสดงคำใบ้แล้ว — รอบนี้จะไม่นับสถิติ',
    'toast.camera': 'รีเซ็ตมุมมองแล้ว',
    'toast.soundOn': 'เปิดเสียงแล้ว',
    'toast.soundOff': 'ปิดเสียงแล้ว',

    'dir.up': 'ขึ้น', 'dir.down': 'ลง', 'dir.left': 'ซ้าย', 'dir.right': 'ขวา',
  },
};

const TIPS = ['tip.default', 'tip.one', 'tip.two', 'tip.three', 'tip.four', 'tip.five'];

/* ==========================================================================
   3. PLATFORM — audio, storage, formatting
   ========================================================================== */

const STORE = {
  prefs: 'p15.prefs.v1',
  best: 'p15.records.v1',
  game: 'p15.game.v1',
};

const state = {
  board: Puzzle15.GOAL.slice(),
  history: [],
  moves: 0,
  startedAt: 0,
  elapsedMs: 0,
  running: false,
  solved: false,
  assisted: false,
  lang: 'en',
  sound: true,
  skin: 'classic',
  speed: 1,
  customImage: null,
  solution: null,
  solutionIndex: 0,
  solving: false,
  autoPlaying: false,
  animating: false,
  hintTile: null,
  expandedNodes: 0,
  statusKey: 'status.ready',
  statusTone: 'idle',
  noteKey: 'solver.note',
  noteVars: null,
  records: { bestTimeMs: null, bestMoves: null, streak: 0, solves: 0 },
  selftest: false,
};

const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const t = (key, vars) => {
  const dict = I18N[state.lang] || I18N.en;
  let text = dict[key] ?? I18N.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, u) => a + (b - a) * u;
const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
const easeInOutCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------- audio ----------------------------------- */
const AudioLab = (() => {
  let ctx = null;
  let master = null;

  function ensure() {
    if (!state.sound) return null;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone({ type = 'sine', from = 440, to = 440, dur = 0.1, gain = 0.06, delay = 0, curve = 'exp' }) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    if (curve === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    else osc.frequency.linearRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function noise({ dur = 0.06, gain = 0.05, delay = 0, freq = 1400 }) {
    const c = ensure();
    if (!c) return;
    const frames = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.9;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(master);
    src.start(c.currentTime + delay);
  }

  return {
    unlock: ensure,
    slide() {
      noise({ dur: 0.055, gain: 0.05, freq: 1900 });
      tone({ type: 'triangle', from: 320, to: 190, dur: 0.09, gain: 0.04 });
    },
    thud() {
      tone({ type: 'sine', from: 150, to: 62, dur: 0.16, gain: 0.11 });
      noise({ dur: 0.05, gain: 0.03, freq: 420 });
    },
    hint() {
      tone({ type: 'sine', from: 660, to: 990, dur: 0.16, gain: 0.05 });
      tone({ type: 'sine', from: 990, to: 1320, dur: 0.14, gain: 0.035, delay: 0.1 });
    },
    nope() {
      tone({ type: 'square', from: 180, to: 120, dur: 0.12, gain: 0.03 });
    },
    win() {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, i) => {
        tone({ type: 'triangle', from: f, to: f, dur: 0.5, gain: 0.07, delay: i * 0.1 });
        tone({ type: 'sine', from: f / 2, to: f / 2, dur: 0.6, gain: 0.03, delay: i * 0.1 });
      });
      noise({ dur: 0.5, gain: 0.02, delay: 0.5, freq: 3000 });
    },
  };
})();
/* ==========================================================================
   4. THREE.JS STUDIO
   ========================================================================== */

const BASE_FOV = 33;
const TILE = 1.78;
const GAP = 0.07;
const CELL = TILE + GAP;
const TILE_H = 0.29;
const WELL_HALF = (CELL * 4) / 2 + 0.16;

const COLORS = {
  gold: 0xf2c879,
  teal: 0x3fd6c4,
  ice: 0xbcd6ff,
  felt: 0x0e141d,
  frame: 0x3c2a1c,
  metal: 0x8b7355,
};

const canvas = $('scene');
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 120);
camera.position.set(4.7, 14.4, 12.8);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.05, 0.05);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.rotateSpeed = 0.72;
controls.panSpeed = 0.55;
controls.zoomSpeed = 0.8;
controls.minDistance = 10.5;
controls.maxDistance = 26;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = Math.PI * 0.44;
controls.update();

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* -------------------------------- lights --------------------------------- */
scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x0a0d13, 0.62));

const keyLight = new THREE.DirectionalLight(0xffe7c2, 2.6);
keyLight.position.set(6.5, 12, 6.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.bias = -0.0004;
keyLight.shadow.normalBias = 0.022;
keyLight.shadow.radius = 3;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6fa8ff, 1.05);
rimLight.position.set(-8, 6, -7);
scene.add(rimLight);

const warmFill = new THREE.PointLight(0xffbf7a, 26, 22, 2);
warmFill.position.set(-3.6, 5.2, 4.8);
scene.add(warmFill);

const coolFill = new THREE.PointLight(0x3fd6c4, 16, 20, 2);
coolFill.position.set(4.6, 3.4, -4.2);
scene.add(coolFill);

/* -------------------------------- floor ---------------------------------- */
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(11, 64),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.42 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.62;
floor.receiveShadow = true;
scene.add(floor);

const halo = new THREE.Mesh(
  new THREE.RingGeometry(6.2, 7.4, 72),
  new THREE.MeshBasicMaterial({ color: 0x3fd6c4, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false })
);
halo.rotation.x = -Math.PI / 2;
halo.position.y = -0.605;
scene.add(halo);

/* ------------------------------ procedural ------------------------------- */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function woodCanvas(w, h, seed, light = false) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const rnd = seededRandom(seed);
  const base = ctx.createLinearGradient(0, 0, w, h);
  if (light) {
    base.addColorStop(0, '#c9a170');
    base.addColorStop(0.45, '#b78a5a');
    base.addColorStop(1, '#9a6d41');
  } else {
    base.addColorStop(0, '#4a3421');
    base.addColorStop(0.5, '#3a2819');
    base.addColorStop(1, '#26190f');
  }
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    const y = rnd() * h;
    const amp = 3 + rnd() * 10;
    ctx.beginPath();
    ctx.moveTo(-10, y);
    for (let x = 0; x <= w + 10; x += 18) {
      ctx.lineTo(x, y + Math.sin(x * 0.012 + i) * amp + (rnd() - 0.5) * 2.2);
    }
    ctx.strokeStyle = light
      ? `rgba(88, 52, 24, ${0.05 + rnd() * 0.12})`
      : `rgba(0, 0, 0, ${0.08 + rnd() * 0.2})`;
    ctx.lineWidth = 0.6 + rnd() * 2.2;
    ctx.stroke();
  }
  for (let i = 0; i < 18; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + rnd() * 16, 2 + rnd() * 5, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.strokeStyle = light ? 'rgba(70, 40, 18, 0.16)' : 'rgba(0, 0, 0, 0.24)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  return c;
}

function marbleCanvas(size, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rnd = seededRandom(seed);
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#f1f3f6');
  base.addColorStop(0.5, '#dfe4ea');
  base.addColorStop(1, '#c9d1db');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let v = 0; v < 22; v++) {
    let x = rnd() * size;
    let y = -20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 16; s++) {
      x += (rnd() - 0.5) * size * 0.16;
      y += size / 15;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(78, 92, 112, ${0.05 + rnd() * 0.15})`;
    ctx.lineWidth = 0.6 + rnd() * 2.4;
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const g = ctx.createRadialGradient(rnd() * size, rnd() * size, 2, rnd() * size, rnd() * size, size * 0.45);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return c;
}

const trayTexture = new THREE.CanvasTexture(woodCanvas(768, 768, 7717, false));
trayTexture.colorSpace = THREE.SRGBColorSpace;
trayTexture.wrapS = trayTexture.wrapT = THREE.RepeatWrapping;
trayTexture.repeat.set(1.6, 1.6);
trayTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

/* --------------------------------- tray ---------------------------------- */
const trayGroup = new THREE.Group();
scene.add(trayGroup);

const frameMat = new THREE.MeshStandardMaterial({
  map: trayTexture,
  color: 0xb08a66,
  roughness: 0.52,
  metalness: 0.22,
  envMapIntensity: 0.55,
});

const base = new THREE.Mesh(new RoundedBoxGeometry(8.9, 0.52, 8.9, 4, 0.2), frameMat);
base.position.y = -0.3;
base.receiveShadow = true;
base.castShadow = true;
trayGroup.add(base);

const well = new THREE.Mesh(
  new THREE.BoxGeometry(WELL_HALF * 2 - 0.12, 0.06, WELL_HALF * 2 - 0.12),
  new THREE.MeshStandardMaterial({ color: COLORS.felt, roughness: 0.96, metalness: 0.04 })
);
well.position.y = 0.02;
well.receiveShadow = true;
trayGroup.add(well);

const railMat = new THREE.MeshStandardMaterial({
  map: trayTexture,
  color: 0xc09a72,
  roughness: 0.44,
  metalness: 0.3,
  envMapIntensity: 0.7,
});
const railLong = new RoundedBoxGeometry(8.9, 0.42, 0.62, 3, 0.08);
const railShort = new RoundedBoxGeometry(0.62, 0.42, 7.66, 3, 0.08);
for (const z of [-4.14, 4.14]) {
  const rail = new THREE.Mesh(railLong, railMat);
  rail.position.set(0, 0.16, z);
  rail.castShadow = true;
  rail.receiveShadow = true;
  trayGroup.add(rail);
}
for (const x of [-4.14, 4.14]) {
  const rail = new THREE.Mesh(railShort, railMat);
  rail.position.set(x, 0.16, 0);
  rail.castShadow = true;
  rail.receiveShadow = true;
  trayGroup.add(rail);
}

const inlayMat = new THREE.MeshStandardMaterial({
  color: COLORS.gold,
  roughness: 0.28,
  metalness: 0.9,
  emissive: 0x2a1a05,
  envMapIntensity: 1.2,
});
const inlayGeo = new THREE.BoxGeometry(WELL_HALF * 2 - 0.34, 0.02, 0.022);
for (const z of [-WELL_HALF + 0.09, WELL_HALF - 0.09]) {
  const line = new THREE.Mesh(inlayGeo, inlayMat);
  line.position.set(0, 0.055, z);
  trayGroup.add(line);
}
const inlayGeoV = new THREE.BoxGeometry(0.022, 0.02, WELL_HALF * 2 - 0.34);
for (const x of [-WELL_HALF + 0.09, WELL_HALF - 0.09]) {
  const line = new THREE.Mesh(inlayGeoV, inlayMat);
  line.position.set(x, 0.055, 0);
  trayGroup.add(line);
}

const screwGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.03, 20);
const screwMat = new THREE.MeshStandardMaterial({ color: 0xc9a76a, roughness: 0.3, metalness: 1 });
for (const x of [-4.14, 4.14]) {
  for (const z of [-4.14, 4.14]) {
    const screw = new THREE.Mesh(screwGeo, screwMat);
    screw.position.set(x, 0.39, z);
    trayGroup.add(screw);
  }
}

/* ------------------------------ tile faces -------------------------------- */
const faceTextures = new Map();
let customSquare = null;

function fitCover(source, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const sw = source.width;
  const sh = source.height;
  const scale = Math.max(size / sw, size / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(source, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return c;
}

function drawNumberBadge(ctx, size, value, palette) {
  const pad = size * 0.055;
  const w = size * 0.35;
  const h = size * 0.26;
  ctx.save();
  ctx.fillStyle = palette.badge;
  ctx.beginPath();
  ctx.roundRect(pad, pad, w, h, size * 0.035);
  ctx.fill();
  ctx.strokeStyle = palette.badgeLine;
  ctx.lineWidth = Math.max(1, size * 0.004);
  ctx.stroke();
  ctx.fillStyle = palette.badgeText;
  ctx.font = `600 ${Math.round(size * 0.17)}px ${palette.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), pad + w / 2, pad + h * 0.54);
  ctx.restore();
}

function makeFaceCanvas(value, skin) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rnd = seededRandom(value * 7919 + 13);

  if (skin === 'custom') {
    if (customSquare) {
      const cell = (value - 1) % 16;
      const col = cell % 4;
      const row = Math.floor(cell / 4);
      const s = size / 4;
      ctx.drawImage(customSquare, col * s, row * s, s, s, 0, 0, size, size);
    } else {
      skin = 'classic';
    }
  }

  if (skin === 'classic' || skin === 'custom') {
    if (skin === 'classic') {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#f6f1e5');
      g.addColorStop(0.55, '#ece3d0');
      g.addColorStop(1, '#d8cdb6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(120, 100, 66, 0.25)';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, size - 32, size - 32);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, size - 56, size - 56);
      ctx.fillStyle = 'rgba(120, 100, 66, 0.18)';
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * size, rnd() * size, 1 + rnd() * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#232a36';
      ctx.font = '700 250px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(value), size / 2, size * 0.52);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, size - 140, size - 140);
    } else {
      // A soft scrim keeps the number legible over any uploaded photograph.
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, 'rgba(6, 10, 16, 0.05)');
      g.addColorStop(0.45, 'rgba(6, 10, 16, 0.0)');
      g.addColorStop(1, 'rgba(6, 10, 16, 0.38)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, size - 4, size - 4);
      drawNumberBadge(ctx, size, value, {
        badge: 'rgba(8, 13, 20, 0.82)',
        badgeLine: 'rgba(255, 255, 255, 0.26)',
        badgeText: '#ffffff',
        font: '"SF Pro Text", "Segoe UI", system-ui, sans-serif',
      });
    }
  }

  if (skin === 'wood') {
    ctx.drawImage(woodCanvas(size, size, value * 131 + 5, true), 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, 'rgba(255, 240, 210, 0.16)');
    g.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    g.addColorStop(1, 'rgba(40, 22, 8, 0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(58, 34, 14, 0.55)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, size - 6, size - 6);
    ctx.save();
    ctx.shadowColor = 'rgba(255, 232, 190, 0.35)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#2a1a0d';
    ctx.font = '700 236px "Iowan Old Style", Palatino, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), size / 2, size * 0.53);
    ctx.restore();
  }

  if (skin === 'marble') {
    ctx.drawImage(marbleCanvas(size, value * 53 + 91), 0, 0);
    ctx.strokeStyle = 'rgba(120, 132, 150, 0.4)';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, size - 6, size - 6);
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#2f3947';
    ctx.font = '600 240px "Iowan Old Style", Palatino, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), size / 2, size * 0.53);
    ctx.restore();
  }

  return c;
}

function faceTexture(value, skin) {
  const key = `${skin}:${value}`;
  if (faceTextures.has(key)) return faceTextures.get(key);
  const tex = new THREE.CanvasTexture(makeFaceCanvas(value, skin));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;
  faceTextures.set(key, tex);
  return tex;
}

const SKIN_META = {
  classic: { base: 0xe4d8bf, metalness: 0.18, roughness: 0.42 },
  wood: { base: 0x9c7448, metalness: 0.22, roughness: 0.46 },
  marble: { base: 0xd6dce4, metalness: 0.3, roughness: 0.28 },
  custom: { base: 0x2a3446, metalness: 0.34, roughness: 0.34 },
};

/* -------------------------------- tiles ----------------------------------- */
const tileGroup = new THREE.Group();
scene.add(tileGroup);

const tileGeo = new RoundedBoxGeometry(TILE, TILE_H, TILE, 3, 0.075);
const faceGeo = new THREE.PlaneGeometry(TILE * 0.88, TILE * 0.88);
const meshes = new Map();

const gapShape = new THREE.Shape();
const gr = 0.18;
const gs = TILE * 0.34;
gapShape.moveTo(-gs + gr, -gs);
gapShape.lineTo(gs - gr, -gs);
gapShape.quadraticCurveTo(gs, -gs, gs, -gs + gr);
gapShape.lineTo(gs, gs - gr);
gapShape.quadraticCurveTo(gs, gs, gs - gr, gs);
gapShape.lineTo(-gs + gr, gs);
gapShape.quadraticCurveTo(-gs, gs, -gs, gs - gr);
gapShape.lineTo(-gs, -gs + gr);
gapShape.quadraticCurveTo(-gs, -gs, -gs + gr, -gs);
const gapRing = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(gapShape.getPoints(48).map((p) => new THREE.Vector3(p.x, 0, -p.y))),
  new THREE.LineBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.4 })
);
gapRing.position.y = 0.062;
trayGroup.add(gapRing);

function cellPosition(cell) {
  const row = Math.floor(cell / 4);
  const col = cell % 4;
  return { x: (col - 1.5) * CELL, z: (row - 1.5) * CELL };
}

function tileY(index) {
  return 0.055 + TILE_H / 2 + (index === 0 ? 0 : 0);
}

for (let value = 1; value <= 15; value++) {
  const mat = new THREE.MeshStandardMaterial({
    color: SKIN_META.classic.base,
    roughness: SKIN_META.classic.roughness,
    metalness: SKIN_META.classic.metalness,
    envMapIntensity: 0.8,
  });
  const body = new THREE.Mesh(tileGeo, mat);
  body.castShadow = true;
  body.receiveShadow = true;

  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTexture(value, state.skin),
    roughness: 0.46,
    metalness: 0.08,
    envMapIntensity: 0.6,
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.rotation.x = -Math.PI / 2;
  face.position.y = TILE_H / 2 + 0.003;

  const group = new THREE.Group();
  group.add(body, face);
  group.userData = { value, body, face, mat, faceMat, cell: value - 1 };
  tileGroup.add(group);
  meshes.set(value, group);
}

/* --------------------------- skin / layout sync --------------------------- */
function applySkin(skin) {
  const meta = SKIN_META[skin] || SKIN_META.classic;
  for (const [value, group] of meshes) {
    const { mat, faceMat } = group.userData;
    mat.color.setHex(meta.base);
    mat.metalness = meta.metalness;
    mat.roughness = meta.roughness;
    faceMat.map = faceTexture(value, skin === 'custom' && !customSquare ? 'classic' : skin);
    faceMat.needsUpdate = true;
  }
  positionAllTiles(false);
}

function positionAllTiles(animate) {
  if (animate) return;
  for (let cell = 0; cell < 16; cell++) {
    const value = state.board[cell];
    if (!value) continue;
    const group = meshes.get(value);
    if (!group) continue;
    const { x, z } = cellPosition(cell);
    group.position.set(x, tileY(cell), z);
    group.userData.cell = cell;
    group.rotation.set(0, 0, 0);
  }
  updateGapRing();
  updateInPlaceGlow();
}

function updateGapRing() {
  const blank = state.board.indexOf(0);
  const { x, z } = cellPosition(blank);
  gapRing.position.x = x;
  gapRing.position.z = z;
  gapRing.scale.setScalar(1);
}

function updateInPlaceGlow() {
  for (const [value, group] of meshes) {
    const { mat, cell } = group.userData;
    const inPlace = state.board[cell] === value;
    mat.emissive.setHex(inPlace ? 0x123c38 : 0x000000);
    mat.emissiveIntensity = inPlace ? 0.55 : 0;
  }
}

/* -------------------------------- tween ---------------------------------- */
const tweens = [];

function tween(duration, onUpdate, onDone) {
  return new Promise((resolve) => {
    tweens.push({ start: performance.now(), duration: Math.max(1, duration), onUpdate, onDone, resolve });
  });
}

function stepTweens(now) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    const u = clamp((now - tw.start) / tw.duration, 0, 1);
    tw.onUpdate?.(u);
    if (u >= 1) {
      tweens.splice(i, 1);
      tw.onDone?.();
      tw.resolve();
    }
  }
}

/* ------------------------------ tile motion ------------------------------- */
async function slideTile(value, fromCell, toCell, fast) {
  const group = meshes.get(value);
  if (!group) return;
  const a = cellPosition(fromCell);
  const b = cellPosition(toCell);
  const baseY = tileY(toCell);
  const duration = fast ? 118 : 172;
  const lift = fast ? 0.035 : 0.06;
  AudioLab.slide();
  group.userData.cell = toCell;
  await tween(duration, (p) => {
    const e = easeInOutCubic(p);
    group.position.x = lerp(a.x, b.x, e);
    group.position.z = lerp(a.z, b.z, e);
    group.position.y = baseY + Math.sin(p * Math.PI) * lift;
    const tilt = Math.sin(p * Math.PI) * 0.035;
    group.rotation.z = (b.x - a.x) !== 0 ? -tilt * Math.sign(b.x - a.x) : 0;
    group.rotation.x = (b.z - a.z) !== 0 ? tilt * Math.sign(b.z - a.z) : 0;
  });
  group.rotation.set(0, 0, 0);
  group.position.set(b.x, baseY, b.z);
  AudioLab.thud();
  updateInPlaceGlow();
}

async function pulseTile(value) {
  const group = meshes.get(value);
  if (!group) return;
  const { mat } = group.userData;
  const start = performance.now();
  mat.emissive.setHex(COLORS.teal);
  await tween(620, (p) => {
    const wave = Math.sin(p * Math.PI * 3) * 0.5 + 0.5;
    mat.emissiveIntensity = 0.18 + wave * 0.5;
    group.position.y = tileY(group.userData.cell) + Math.sin(p * Math.PI) * 0.05;
  });
  group.position.y = tileY(group.userData.cell);
  updateInPlaceGlow();
}

/* -------------------------------- camera --------------------------------- */
const CAMERA_HOME = new THREE.Vector3(4.7, 14.4, 12.8);
const CAMERA_TOP = new THREE.Vector3(0.001, 17.2, 0.001);

function flyCamera(to, target = new THREE.Vector3(0, 0.15, 0), duration = 620) {
  const from = camera.position.clone();
  const fromTarget = controls.target.clone();
  controls.enabled = false;
  return tween(duration, (p) => {
    const e = easeInOutCubic(p);
    camera.position.lerpVectors(from, to, e);
    controls.target.lerpVectors(fromTarget, target, e);
    camera.lookAt(controls.target);
  }).then(() => {
    controls.enabled = true;
    controls.update();
    drawHintArrow();
  });
}

function clampTarget() {
  const tgt = controls.target;
  tgt.x = clamp(tgt.x, -2.2, 2.2);
  tgt.y = clamp(tgt.y, -0.4, 1.4);
  tgt.z = clamp(tgt.z, -2.2, 2.2);
}

/* -------------------------------- pointer -------------------------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPoint = null;
let hoverCell = null;
let lastHoverCheck = 0;

function setPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickTile(event) {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(tileGroup.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && obj !== tileGroup) {
      if (obj.userData && obj.userData.value) return obj.userData.value;
      obj = obj.parent;
    }
  }
  return null;
}

function isInteractive() {
  return !state.solved && !state.solving && !state.autoPlaying && !state.animating;
}

canvas.addEventListener('pointerdown', (event) => {
  AudioLab.unlock();
  downPoint = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener('pointerup', (event) => {
  if (!downPoint) return;
  const dx = event.clientX - downPoint.x;
  const dy = event.clientY - downPoint.y;
  downPoint = null;
  if (Math.hypot(dx, dy) > 7) return;
  if (!isInteractive()) return;
  const value = pickTile(event);
  if (!value) return;
  const cell = state.board.indexOf(value);
  if (isAdjacent(cell, state.board.indexOf(0))) {
    void attemptMove(value, true);
  } else {
    AudioLab.nope();
    pulseTile(value);
  }
});

canvas.addEventListener('pointermove', (event) => {
  if (!isInteractive()) {
    canvas.style.cursor = 'grab';
    return;
  }
  const now = performance.now();
  if (now - lastHoverCheck < 55) return;
  lastHoverCheck = now;
  const value = pickTile(event);
  const current = value ? state.board.indexOf(value) : null;
  const actionable = value && isAdjacent(current, state.board.indexOf(0));
  canvas.style.cursor = actionable ? 'pointer' : value ? 'grab' : 'grab';
  if (hoverCell !== current) {
    hoverCell = current;
    for (const [, group] of meshes) {
      group.userData.faceMat.emissive.setHex(0x000000);
    }
    if (actionable) {
      const group = meshes.get(value);
      group.userData.faceMat.emissive.setHex(0x2a4a46);
      group.userData.faceMat.emissiveIntensity = 0.5;
    }
  }
});

canvas.addEventListener('pointerleave', () => {
  hoverCell = null;
  for (const [, group] of meshes) group.userData.faceMat.emissive.setHex(0x000000);
  canvas.style.cursor = 'grab';
});

function isAdjacent(a, b) {
  const ra = Math.floor(a / 4);
  const ca = a % 4;
  const rb = Math.floor(b / 4);
  const cb = b % 4;
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1;
}

/* ------------------------------ hint arrow -------------------------------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const hintLayer = $('hint-layer');
const hintPath = document.createElementNS(SVG_NS, 'path');
hintPath.setAttribute('fill', 'none');
hintPath.setAttribute('stroke', '#3fd6c4');
hintPath.setAttribute('stroke-width', '2.4');
hintPath.setAttribute('stroke-linecap', 'round');
hintPath.setAttribute('stroke-dasharray', '7 6');
hintPath.setAttribute('opacity', '0.95');
hintPath.style.filter = 'drop-shadow(0 0 6px rgba(63, 214, 196, 0.75))';
const hintDot = document.createElementNS(SVG_NS, 'circle');
hintDot.setAttribute('r', '15');
hintDot.setAttribute('fill', 'none');
hintDot.setAttribute('stroke', '#3fd6c4');
hintDot.setAttribute('stroke-width', '2');
hintDot.setAttribute('opacity', '0.9');
const hintHead = document.createElementNS(SVG_NS, 'path');
hintHead.setAttribute('fill', '#3fd6c4');
const hintLabel = document.createElementNS(SVG_NS, 'text');
hintLabel.setAttribute('fill', '#eef3fb');
hintLabel.setAttribute('font-size', '11');
hintLabel.setAttribute('font-family', 'ui-monospace, SFMono-Regular, monospace');
hintLabel.setAttribute('text-anchor', 'middle');
hintLayer.append(hintPath, hintDot, hintHead, hintLabel);

function projectCell(cell) {
  const { x, z } = cellPosition(cell);
  const v = new THREE.Vector3(x, 0.42, z).project(camera);
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((v.x + 1) / 2) * rect.width,
    y: ((1 - v.y) / 2) * rect.height,
  };
}

function drawHintArrow() {
  const value = state.hintTile;
  hintLayer.innerHTML = '';
  if (!value || state.solved) return;
  const fromCell = state.board.indexOf(value);
  const toCell = state.board.indexOf(0);
  if (fromCell < 0 || toCell < 0) return;
  const a = projectCell(fromCell);
  const b = projectCell(toCell);
  hintLayer.append(hintPath, hintDot, hintHead, hintLabel);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = Math.min(46, len * 0.24);
  const cx = mx + nx * bow;
  const cy = my + ny * bow;
  hintPath.setAttribute('d', `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x - (dx / len) * 16} ${b.y - (dy / len) * 16}`);
  hintDot.setAttribute('cx', a.x);
  hintDot.setAttribute('cy', a.y);
  hintDot.setAttribute('r', String(clamp(16, 10, 26)));
  hintLabel.setAttribute('x', a.x);
  hintLabel.setAttribute('y', a.y - 24);
  hintLabel.textContent = String(value);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  hintHead.setAttribute('d', 'M 0 0 L -13 -6 L -13 6 Z');
  hintHead.setAttribute('transform', `translate(${b.x}, ${b.y}) rotate(${angle})`);
}

function clearHint() {
  const previous = state.hintTile;
  state.hintTile = null;
  hintLayer.innerHTML = '';
  if (previous) {
    const group = meshes.get(previous);
    if (group) {
      group.userData.mat.emissive.setHex(0x000000);
      group.userData.faceMat.emissive.setHex(0x000000);
      group.position.y = tileY(group.userData.cell);
    }
    updateInPlaceGlow();
  }
}
/* ==========================================================================
   5. CONTROLLER — game state, moves, timer, records, export
   ========================================================================== */

const APP_VERSION = '1.0.0';
const STORAGE_KEYS = Object.values(STORE);
let timerHandle = null;
let toastHandle = null;
let toastVisible = false;
let lastSave = 0;

function isSolvedNow() {
  return Puzzle15.isSolved(state.board);
}

function updateHud() {
  const h = Puzzle15.manhattan(state.board);
  const remaining = state.solution ? state.solution.length : null;
  $('hud-moves').textContent = String(state.moves);
  $('stat-g').textContent = String(state.moves);
  $('hud-timer').textContent = formatTime(state.elapsedMs + (state.running ? Date.now() - state.startedAt : 0));
  $('hud-h').textContent = String(h);
  $('stat-h').textContent = String(h);
  $('hud-remaining').textContent = remaining === null ? '—' : String(remaining);
  $('stat-remaining').textContent = remaining === null ? '—' : String(remaining);
  $('stat-nodes').textContent = state.expandedNodes ? state.expandedNodes.toLocaleString() : '—';
  $('btn-undo').disabled = !state.history.length || state.animating || state.solving;
  $('assist-badge').hidden = !state.assisted;
  document.body.dataset.moves = String(state.moves);
  document.body.dataset.solved = String(state.solved);
}

function setStatus(key, tone = 'idle') {
  state.statusKey = key;
  state.statusTone = tone;
  const chip = $('status-chip');
  chip.dataset.tone = tone;
  $('status-label').textContent = t(key);
}

function startClock() {
  if (state.running || state.solved) return;
  state.running = true;
  state.startedAt = Date.now();
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    if (!state.running) return;
    state.elapsedMs = state.elapsedMs;
    $('hud-timer').textContent = formatTime(state.elapsedMs + (Date.now() - state.startedAt));
  }, 250);
}

function stopClock() {
  if (!state.running) return;
  state.elapsedMs += Date.now() - state.startedAt;
  state.running = false;
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
  $('hud-timer').textContent = formatTime(state.elapsedMs);
}

function elapsed() {
  return state.elapsedMs + (state.running ? Date.now() - state.startedAt : 0);
}

function resetSession(board, { status = 'ready', tone = 'ready', keepRecords = true } = {}) {
  if (state.autoPlaying) stopAuto();
  stopClock();
  state.board = board.slice();
  state.history = [];
  state.moves = 0;
  state.elapsedMs = 0;
  state.running = false;
  // A fresh session is playable even when it starts from the goal layout.
  state.solved = false;
  state.assisted = false;
  state.solution = null;
  state.expandedNodes = 0;
  state.animating = false;
  clearHint();
  $('hud-timer').textContent = '00:00';
  $('move-log').innerHTML = '';
  $('log-empty').hidden = false;
  $('assist-badge').hidden = true;
  setStatus(status, tone);
  positionAllTiles(false);
  updateHud();
  updateSolverNote('solver.note');
  updateSolverControls();
  if (keepRecords) renderRecords();
  persistGame();
}

/* ------------------------------- move log -------------------------------- */
const ARROW = { up: '↑', down: '↓', left: '←', right: '→' };

function logMove(value, dir) {
  const log = $('move-log');
  const li = document.createElement('li');
  const dirLabel = t(`log.${dir}`);
  li.innerHTML = `<b>${value}</b><span>${ARROW[dir] || '·'}</span>`;
  li.title = `${value} ${dirLabel}`;
  li.setAttribute('aria-label', `${value} ${dirLabel}`);
  log.append(li);
  $('log-empty').hidden = true;
  while (log.children.length > 60) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
}

function rebuildLog() {
  const log = $('move-log');
  log.innerHTML = '';
  for (const entry of state.history.slice(-60)) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${entry.value}</b><span>${ARROW[entry.dir] || '·'}</span>`;
    li.title = `${entry.value} ${t(`log.${entry.dir}`)}`;
    log.append(li);
  }
  $('log-empty').hidden = state.history.length > 0;
  log.scrollTop = log.scrollHeight;
}

/* ------------------------------- movement -------------------------------- */
async function attemptMove(value, byUser = true, options = {}) {
  if (state.animating || state.autoPlaying && !options.auto) return false;
  const from = state.board.indexOf(value);
  const blank = state.board.indexOf(0);
  if (from < 0 || !isAdjacent(from, blank)) return false;
  const dir = Puzzle15.directionOf(state.board, from);
  const next = state.board.slice();
  next[blank] = value;
  next[from] = 0;
  state.board = next;
  state.animating = true;

  if (byUser || options.auto) {
    startClock();
    state.moves += 1;
    state.history.push({ value, from, to: blank, dir });
    logMove(value, dir);
    if (byUser) {
      // Auto-play consumes the cached path in its own loop; a manual move either
      // follows the cached prefix or invalidates the rest of it.
      if (state.solution && state.solution.length) {
        if (state.solution[0] === value) state.solution.shift();
        else {
          state.solution = null;
          clearHint();
          updateSolverNote('solver.note');
        }
        if (state.solution && state.solution.length === 0) state.solution = null;
      }
      setStatus('status.playing', 'ready');
    }
  }

  updateHud();
  updateGapRing();
  await slideTile(value, from, blank, options.fast);
  state.animating = false;
  updateHud();
  persistGame(true);

  if (byUser && isSolvedNow()) {
    await finishWin();
  }
  return true;
}

/* --------------------------------- undo ---------------------------------- */
async function undoMove() {
  if (!state.history.length || state.animating || state.solving) return;
  stopAutoSilent();
  const entry = state.history.pop();
  const blank = state.board.indexOf(0);
  if (state.board[entry.to] !== entry.value || blank !== entry.from) {
    // State drifted; rebuild rather than animating a lie.
    positionAllTiles(false);
    return;
  }
  const next = state.board.slice();
  next[entry.to] = entry.value;
  next[entry.from] = 0;
  state.board = next;
  state.moves = Math.max(0, state.moves - 1);
  state.animating = true;
  state.solution = null;
  clearHint();
  updateSolverNote('solver.note');
  updateHud();
  updateGapRing();
  await slideTile(entry.value, entry.to, blank, true);
  state.animating = false;
  const log = $('move-log');
  if (log.lastElementChild) log.lastElementChild.remove();
  $('log-empty').hidden = log.children.length > 0;
  updateHud();
  persistGame(true);
  toast('toast.undo');
}

/* --------------------------------- timer --------------------------------- */
setInterval(() => {
  if (state.running) {
    $('hud-timer').textContent = formatTime(elapsed());
  }
}, 500);

/* -------------------------------- records -------------------------------- */
function renderRecords() {
  const r = state.records;
  $('best-time').textContent = r.bestTimeMs ? formatClock(r.bestTimeMs) : '—';
  $('best-moves').textContent = r.bestMoves ? String(r.bestMoves) : '—';
  $('streak').textContent = String(r.streak || 0);
}

function recordWin() {
  const timeMs = Math.max(1, elapsed());
  const moves = state.moves;
  const r = state.records;
  let note = '';
  let changed = false;
  if (!state.assisted) {
    r.streak = (r.streak || 0) + 1;
    r.solves = (r.solves || 0) + 1;
    if (!r.bestTimeMs || timeMs < r.bestTimeMs) {
      r.bestTimeMs = timeMs;
      note = 'win.record';
      changed = true;
    }
    if (!r.bestMoves || moves < r.bestMoves) {
      r.bestMoves = moves;
      note = note ? note : 'win.movesRecord';
      changed = true;
    }
    if (!note) note = 'win.noRecord';
  } else {
    note = 'win.noRecord';
  }
  if (changed) saveJSON(STORE.best, r);
  renderRecords();
  return { timeMs, moves, note };
}

/* ---------------------------------- win ---------------------------------- */
async function finishWin() {
  if (state.solved) return;
  state.solved = true;
  stopClock();
  state.elapsedMs = elapsed();
  state.running = false;
  clearHint();
  state.solution = null;
  setStatus('status.solved', 'win');
  updateSolverTag('win');
  AudioLab.win();
  const summary = recordWin();
  $('win-time').textContent = formatClock(summary.timeMs);
  $('win-moves').textContent = String(summary.moves);
  $('win-best').textContent = state.records.bestTimeMs ? formatClock(state.records.bestTimeMs) : '—';
  $('win-note').textContent = t(summary.note);
  updateHud();
  celebrate();
  persistGame(true);
  await delay(560);
  openModal('modal-win');
}

async function celebrate() {
  const values = [];
  for (let cell = 0; cell < 16; cell++) if (state.board[cell]) values.push(state.board[cell]);
  values.forEach((value, i) => {
    const group = meshes.get(value);
    if (!group) return;
    setTimeout(() => {
      void tween(430, (p) => {
        const bounce = Math.sin(p * Math.PI);
        group.position.y = tileY(group.userData.cell) + bounce * 0.16;
        group.scale.setScalar(1 + bounce * 0.03);
      }).then(() => {
        group.position.y = tileY(group.userData.cell);
        group.scale.setScalar(1);
      });
    }, i * 26);
  });
  await delay(values.length * 26 + 430);
}

/* ------------------------------- persistence ----------------------------- */
function persistGame(force = false) {
  const now = Date.now();
  if (!force && now - lastSave < 500) return;
  lastSave = now;
  if (state.solved) {
    try { localStorage.removeItem(STORE.game); } catch { /* ignore */ }
    return;
  }
  saveJSON(STORE.game, {
    board: state.board,
    history: state.history.slice(-40),
    moves: state.moves,
    elapsedMs: elapsed(),
    assisted: state.assisted,
    skin: state.skin,
    savedAt: now,
  });
}

function restoreGame() {
  const saved = loadJSON(STORE.game, null);
  if (!saved || !Array.isArray(saved.board) || saved.board.length !== 16) return false;
  const valid = new Set(saved.board).size === 16 && saved.board.every((v) => Number.isInteger(v) && v >= 0 && v <= 15);
  if (!valid || !Puzzle15.isSolvable(saved.board) || Puzzle15.isSolved(saved.board)) return false;
  state.board = saved.board.slice();
  state.moves = Number(saved.moves) || 0;
  state.elapsedMs = Number(saved.elapsedMs) || 0;
  state.assisted = Boolean(saved.assisted);
  state.history = Array.isArray(saved.history) ? saved.history.filter((e) => e && Number.isInteger(e.value) && e.dir) : [];
  state.solution = null;
  state.solved = false;
  $('hud-timer').textContent = formatTime(state.elapsedMs);
  rebuildLog();
  $('assist-badge').hidden = !state.assisted;
  positionAllTiles(false);
  updateHud();
  setStatus('status.restored', 'ready');
  return true;
}

/* --------------------------------- export -------------------------------- */
function exportPayload() {
  return {
    app: 'Full 3D 15-Puzzle Studio & Auto-Solver',
    version: APP_VERSION,
    schema: 'puzzle15.export.v1',
    exportedAt: new Date().toISOString(),
    language: state.lang,
    board: state.board.slice(),
    goal: Puzzle15.GOAL.slice(),
    solved: isSolvedNow(),
    moves: state.moves,
    assisted: state.assisted,
    elapsedMs: elapsed(),
    elapsed: formatTime(elapsed()),
    heuristic: {
      name: 'manhattan+linear-conflicts',
      manhattan: Puzzle15.manhattan(state.board),
      linearConflicts: Puzzle15.linearConflicts(state.board),
      total: Puzzle15.heuristic(state.board),
    },
    solution: state.solution
      ? { remaining: state.solution.slice(), length: state.solution.length, nodesExpanded: state.expandedNodes }
      : null,
    history: state.history.map((entry) => ({ tile: entry.value, direction: entry.dir })),
    records: { ...state.records },
    skin: state.skin,
  };
}

function exportGame() {
  const payload = exportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `puzzle15-${stamp}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast('toast.exported');
}

/* ==========================================================================
   6. SOLVER CLIENT — worker, auto-play, hints
   ========================================================================== */

let solverWorker = null;
let workerURL = null;
let requestSeq = 0;
let pendingRequest = null;

function solverWorkerSource() {
  return `
    const createPuzzle15Engine = ${createPuzzle15Engine.toString()};
    const Engine = createPuzzle15Engine();
    self.onmessage = (event) => {
      const { id, board, options } = event.data || {};
      try {
        const result = Engine.solve(board, options || {});
        self.postMessage({ id, result });
      } catch (error) {
        self.postMessage({ id, error: String(error && error.message ? error.message : error) });
      }
    };
  `;
}

function ensureWorker() {
  if (solverWorker) return solverWorker;
  try {
    workerURL = URL.createObjectURL(new Blob([solverWorkerSource()], { type: 'text/javascript' }));
    solverWorker = new Worker(workerURL);
    solverWorker.onerror = () => {
      terminateWorker();
    };
    return solverWorker;
  } catch {
    solverWorker = null;
    return null;
  }
}

function terminateWorker() {
  if (solverWorker) {
    solverWorker.terminate();
    solverWorker = null;
  }
  if (workerURL) {
    URL.revokeObjectURL(workerURL);
    workerURL = null;
  }
  if (pendingRequest) {
    pendingRequest.reject(new Error('cancelled'));
    pendingRequest = null;
  }
}

function solveInWorker(board, options) {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();
    if (!worker) {
      reject(new Error('worker-unavailable'));
      return;
    }
    const id = ++requestSeq;
    pendingRequest = { id, resolve, reject };
    worker.onmessage = (event) => {
      if (!pendingRequest || event.data.id !== pendingRequest.id) return;
      const req = pendingRequest;
      pendingRequest = null;
      if (event.data.error) req.reject(new Error(event.data.error));
      else req.resolve(event.data.result);
    };
    worker.onerror = (event) => {
      if (pendingRequest) {
        pendingRequest.reject(new Error(event.message || 'worker-error'));
        pendingRequest = null;
      }
      terminateWorker();
    };
    worker.postMessage({ id, board: board.slice(), options });
  });
}

function solveOnMainThread(board, options) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Puzzle15.solve(board, options)), 40);
  });
}

async function computeSolution() {
  if (state.solution) return { ok: true, cached: true };
  if (isSolvedNow()) return { ok: true, moves: [], cached: true };
  state.solving = true;
  updateSolverControls();
  updateSolverTag('busy');
  setStatus('status.thinking', 'busy');
  updateSolverNote('solver.calculating');
  let result;
  try {
    result = await solveInWorker(state.board.slice(), {});
  } catch (error) {
    if (error.message === 'cancelled') {
      state.solving = false;
      updateSolverControls();
      return { ok: false, cancelled: true };
    }
    try {
      result = await solveOnMainThread(state.board.slice(), {});
    } catch {
      result = { ok: false, reason: 'error', moves: [], nodes: 0 };
    }
  }
  state.solving = false;
  if (!result || !result.ok) {
    updateSolverControls();
    updateSolverTag('ready');
    setStatus('status.playing', 'warn');
    updateSolverNote(result && result.reason === 'unsolvable' ? 'solver.unsolvable' : 'solver.failed');
    return { ok: false, reason: result?.reason };
  }
  state.solution = result.moves.slice();
  state.expandedNodes = result.nodes || 0;
  state.solutionOptimal = result.optimal !== false;
  updateSolverNote(result.optimal ? 'solver.optimal' : 'solver.near', { ms: Math.round(result.elapsedMs || 0) });
  updateSolverTag('busy');
  setStatus('status.playing', 'ready');
  updateHud();
  updateSolverControls();
  return { ok: true, result };
}

function updateSolverNote(key, vars = null) {
  state.noteKey = key;
  state.noteVars = vars;
  const note = $('solver-note');
  if (note) note.textContent = t(key, vars);
}

function updateSolverTag(mode) {
  const tag = $('solver-tag');
  if (!tag) return;
  if (mode === 'busy') {
    tag.dataset.tone = 'busy';
    tag.textContent = t('solver.calculating');
  } else if (mode === 'win') {
    tag.dataset.tone = 'win';
    tag.textContent = t('status.solved');
  } else {
    tag.dataset.tone = '';
    tag.textContent = t('solver.ready');
  }
}

function updateSolverControls() {
  const busy = state.solving || state.autoPlaying;
  $('btn-solve').disabled = Boolean(state.solving && !state.autoPlaying);
  $('btn-hint').disabled = busy;
  $('btn-stop').disabled = !busy;
  $('btn-solve').classList.toggle('is-running', state.autoPlaying);
  const label = $('btn-solve').querySelector('span');
  label.textContent = t(state.autoPlaying ? 'btn.stop' : 'btn.solve');
  updateSolverTag(busy ? 'busy' : 'ready');
}

function playbackDelay() {
  return 420 - (state.speed - 1) * 88;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestHint() {
  if (isSolvedNow()) {
    toast('toast.alreadySolved');
    return;
  }
  if (state.solving || state.autoPlaying) return;
  const ready = await computeSolution();
  if (!ready.ok || !state.solution || !state.solution.length) return;
  state.assisted = true;
  $('assist-badge').hidden = false;
  state.hintTile = state.solution[0];
  updateSolverNote('solver.hintReady', {
    n: state.solution[0],
    dir: t(`dir.${Puzzle15.directionOf(state.board, state.board.indexOf(state.solution[0])) || 'up'}`),
  });
  setStatus('status.hint', 'busy');
  AudioLab.hint();
  drawHintArrow();
  void pulseTile(state.hintTile);
  updateHud();
  toast('toast.assisted');
  persistGame();
}

let autoToken = 0;

async function autoSolve() {
  if (state.autoPlaying) {
    stopAuto();
    return;
  }
  if (isSolvedNow()) {
    toast('toast.alreadySolved');
    return;
  }
  if (state.animating) return;
  const ready = await computeSolution();
  if (!ready.ok || !state.solution || !state.solution.length) return;
  state.assisted = true;
  $('assist-badge').hidden = false;
  state.autoPlaying = true;
  const token = ++autoToken;
  clearHint();
  setStatus('status.solving', 'busy');
  updateSolverControls();
  updateHud();
  try {
    while (state.autoPlaying && token === autoToken && state.solution && state.solution.length) {
      const value = state.solution[0];
      if (!isAdjacent(state.board.indexOf(value), state.board.indexOf(0))) break;
      await attemptMove(value, false, { fast: true, auto: true });
      if (!state.autoPlaying || token !== autoToken) break;
      if (state.solution) {
        if (state.solution[0] === value) state.solution.shift();
        else state.solution = null;
      }
      if (state.solution && !state.solution.length) state.solution = null;
      updateHud();
      await delay(playbackDelay());
    }
  } finally {
    if (token === autoToken) {
      state.autoPlaying = false;
      updateSolverControls();
      if (isSolvedNow()) {
        if (!state.solved) await finishWin();
      } else if (state.solution) {
        setStatus('solver.stopped', 'ready');
      }
      updateHud();
      persistGame();
    }
  }
}

function stopAuto() {
  if (!state.autoPlaying && !state.solving) return;
  autoToken += 1;
  state.autoPlaying = false;
  if (state.solving) terminateWorker();
  state.solving = false;
  updateSolverControls();
  updateHud();
  setStatus('solver.stopped', 'ready');
  toast('toast.stopped');
}

function stopAutoSilent() {
  if (!state.autoPlaying) return;
  autoToken += 1;
  state.autoPlaying = false;
  updateSolverControls();
}

/* ==========================================================================
   7. INTERFACE — bindings, i18n, modals, self-test, boot
   ========================================================================== */

function applyLanguage(lang) {
  state.lang = I18N[lang] ? lang : 'en';
  document.documentElement.lang = state.lang;
  document.body.dataset.lang = state.lang;
  for (const el of $$('[data-i18n]')) {
    const key = el.dataset.i18n;
    if (I18N[state.lang][key] !== undefined) el.textContent = t(key);
  }
  for (const el of $$('[data-i18n-attr]')) {
    const pairs = el.dataset.i18nAttr.split(';').map((s) => s.trim()).filter(Boolean);
    for (const pair of pairs) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!attr || !key) continue;
      if (I18N[state.lang][key] !== undefined) el.setAttribute(attr, t(key));
    }
  }
  $$('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === state.lang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  rebuildLog();
  if (state.toastKey && toastVisible) toast(state.toastKey, state.toastVars);
  setStatus(state.statusKey, state.statusTone);
  updateSolverNote(state.noteKey, state.noteVars);
  updateSolverControls();
  updateSolverTag(currentSolverMode());
  if (state.solution) updateHud();
  renderRecords();
  document.title = t('meta.title');
  savePrefs();
}

function currentSolverMode() {
  if (isSolvedNow() && state.solved) return 'win';
  return state.solving || state.autoPlaying ? 'busy' : 'ready';
}

function savePrefs() {
  saveJSON(STORE.prefs, {
    lang: state.lang,
    sound: state.sound,
    skin: state.skin === 'custom' && !customSquare ? 'classic' : state.skin,
    speed: state.speed,
  });
}

function loadPrefs() {
  const prefs = loadJSON(STORE.prefs, {});
  if (prefs.lang === 'th' || prefs.lang === 'en') state.lang = prefs.lang;
  if (typeof prefs.sound === 'boolean') state.sound = prefs.sound;
  if (['classic', 'wood', 'marble'].includes(prefs.skin)) state.skin = prefs.skin;
  if (Number(prefs.speed) >= 1 && Number(prefs.speed) <= 5) state.speed = Number(prefs.speed);
  const records = loadJSON(STORE.best, {});
  state.records = {
    bestTimeMs: Number(records.bestTimeMs) || null,
    bestMoves: Number(records.bestMoves) || null,
    streak: Number(records.streak) || 0,
    solves: Number(records.solves) || 0,
  };
}

function toast(key, vars) {
  state.toastKey = key;
  state.toastVars = vars || null;
  const el = $('toast');
  el.textContent = t(key, vars);
  el.hidden = false;
  toastVisible = true;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  if (toastHandle) clearTimeout(toastHandle);
  toastHandle = setTimeout(() => {
    el.classList.remove('is-visible');
    toastHandle = setTimeout(() => { el.hidden = true; toastVisible = false; }, 300);
  }, 2200);
}

/* -------------------------------- modals --------------------------------- */
let lastFocus = null;

function openModal(id) {
  lastFocus = document.activeElement;
  const modal = $(id);
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const close = modal.querySelector('.modal-close');
  close?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function closeAllModals() {
  $$('.modal').forEach((m) => { if (!m.hidden) closeModal(m); });
}

/* ------------------------------- language -------------------------------- */
function setLanguage(lang) {
  applyLanguage(lang);
}

/* -------------------------------- skins ---------------------------------- */
function setSkin(skin) {
  if (skin === 'custom' && !customSquare) {
    toast('toast.skinMissing');
    const select = $('skin-select');
    select.value = state.skin;
    return;
  }
  state.skin = skin;
  $('skin-select').value = skin;
  applySkin(skin);
  savePrefs();
}

async function handleUpload(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast('skin.bad');
    return;
  }
  try {
    const bitmap = await createImageBitmap(file);
    customSquare = fitCover(bitmap, 1024);
    bitmap.close?.();
    for (const key of [...faceTextures.keys()]) {
      if (key.startsWith('custom:')) {
        faceTextures.get(key).dispose();
        faceTextures.delete(key);
      }
    }
    state.skin = 'custom';
    $('skin-select').value = 'custom';
    $('upload-name').textContent = t('skin.loaded');
    $('upload-name').dataset.i18n = 'skin.loaded';
    applySkin('custom');
    savePrefs();
    toast('skin.loaded');
  } catch {
    toast('skin.bad');
  }
}

/* -------------------------------- pointer -------------------------------- */
function bindUI() {
  $$('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  $('btn-sound').addEventListener('click', () => {
    state.sound = !state.sound;
    $('btn-sound').setAttribute('aria-pressed', String(state.sound));
    $('sound-use').setAttribute('href', state.sound ? '#i-sound' : '#i-mute');
    savePrefs();
    toast(state.sound ? 'toast.soundOn' : 'toast.soundOff');
    if (state.sound) AudioLab.unlock();
  });

  $('btn-help').addEventListener('click', () => openModal('modal-help'));
  $('btn-footer-help').addEventListener('click', () => openModal('modal-help'));

  $$('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal($(btn.dataset.close)));
  });
  $$('.modal').forEach((modal) => {
    modal.addEventListener('pointerdown', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  $('btn-shuffle').addEventListener('click', shufflePuzzle);
  $('btn-reset').addEventListener('click', resetPuzzle);
  $('btn-undo').addEventListener('click', () => void undoMove());
  $('btn-camera-reset').addEventListener('click', () => {
    void flyCamera(CAMERA_HOME.clone());
    toast('toast.camera');
  });
  $('btn-camera-top').addEventListener('click', () => void flyCamera(CAMERA_TOP.clone()));
  $('btn-solve').addEventListener('click', () => void autoSolve());
  $('btn-hint').addEventListener('click', () => void requestHint());
  $('btn-stop').addEventListener('click', stopAuto);
  $('btn-export').addEventListener('click', exportGame);
  $('btn-clear-log').addEventListener('click', () => {
    state.history = [];
    $('move-log').innerHTML = '';
    $('log-empty').hidden = false;
    updateHud();
    persistGame(true);
  });
  $('btn-reset-records').addEventListener('click', () => {
    state.records = { bestTimeMs: null, bestMoves: null, streak: 0, solves: 0 };
    saveJSON(STORE.best, state.records);
    renderRecords();
    toast('toast.recordsReset');
  });

  $('skin-select').addEventListener('change', (event) => setSkin(event.target.value));
  $('btn-upload').addEventListener('click', () => $('skin-file').click());
  $('skin-file').addEventListener('change', (event) => {
    void handleUpload(event.target.files?.[0]);
    event.target.value = '';
  });
  $('btn-skin-clear').addEventListener('click', () => {
    customSquare = null;
    $('upload-name').textContent = t('skin.noImage');
    $('upload-name').dataset.i18n = 'skin.noImage';
    if (state.skin === 'custom') {
      setSkin('classic');
    } else {
      applySkin(state.skin);
    }
    toast('skin.noImage');
  });

  $('speed').addEventListener('input', (event) => {
    state.speed = clamp(Number(event.target.value) || 1, 1, 5);
    $('speed-label').textContent = `${state.speed}×`;
    savePrefs();
  });

  $('btn-win-again').addEventListener('click', () => {
    closeModal($('modal-win'));
    shufflePuzzle();
  });

  $('btn-hint').addEventListener('keydown', (event) => event.stopPropagation());
}

/* ------------------------------- keyboard -------------------------------- */
function bindKeyboard() {
  window.addEventListener('keydown', (event) => {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key === 'Escape') {
      closeAllModals();
      return;
    }
    if (!$('modal-help').hidden || !$('modal-win').hidden) return;

    const blank = state.board.indexOf(0);
    const row = Math.floor(blank / 4);
    const col = blank % 4;
    let tile = null;
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
      if (row < 3) tile = blank + 4;
    } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
      if (row > 0) tile = blank - 4;
    } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      if (col < 3) tile = blank + 1;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      if (col > 0) tile = blank - 1;
    }

    if (tile !== null) {
      event.preventDefault();
      if (!isInteractive()) return;
      void attemptMove(state.board[tile], true);
      return;
    }
    if (event.key.toLowerCase() === 'h') {
      event.preventDefault();
      void requestHint();
    } else if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      void undoMove();
    } else if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      shufflePuzzle();
    } else if (event.code === 'Space') {
      event.preventDefault();
      if (!state.solving) void autoSolve();
    }
  });
}

/* ------------------------------- shuffle --------------------------------- */
function shufflePuzzle() {
  stopAutoSilent();
  if (state.solving) terminateWorker();
  state.solving = false;
  state.autoPlaying = false;
  clearHint();
  const board = Puzzle15.shuffle(72, Math.random);
  if (!Puzzle15.isSolvable(board)) {
    // Should be unreachable; shuffle() guards this itself.
    setStatus('status.unsolvable', 'warn');
    return;
  }
  resetSession(board, { status: 'status.shuffled', tone: 'ready' });
  updateSolverControls();
  updateSolverTag('ready');
  dropTilesIn();
  toast('toast.shuffled');
  persistGame(true);
}

function dropTilesIn() {
  for (let cell = 0; cell < 16; cell++) {
    const value = state.board[cell];
    if (!value) continue;
    const group = meshes.get(value);
    if (!group) continue;
    const target = group.position.y;
    const delayMs = Math.random() * 130;
    group.position.y = target + 0.6;
    setTimeout(() => {
      void tween(360, (p) => {
        group.position.y = target + 0.6 * (1 - easeOutCubic(p));
      }).then(() => { group.position.y = target; });
    }, delayMs);
  }
}

function resetPuzzle() {
  stopAutoSilent();
  if (state.solving) terminateWorker();
  state.solving = false;
  state.autoPlaying = false;
  resetSession(Puzzle15.GOAL.slice(), { status: 'status.ready', tone: 'ready' });
  updateSolverControls();
  updateSolverTag('ready');
  positionAllTiles(false);
  persistGame(true);
}

/* -------------------------------- resize --------------------------------- */
function resize() {
  const rect = stage.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Portrait screens need a wider vertical FOV so the tray still fits across.
  const reference = 1.15;
  camera.fov = camera.aspect < reference
    ? clamp((2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV) / 2) * reference / camera.aspect) * 180) / Math.PI, BASE_FOV, 60)
    : BASE_FOV;
  camera.updateProjectionMatrix();
  drawHintArrow();
}

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => resize()).observe(stage);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 220));

controls.addEventListener('change', () => {
  clampTarget();
  drawHintArrow();
});

/* -------------------------------- render --------------------------------- */
let hintPulse = 0;
function renderFrame(now) {
  stepTweens(now);
  controls.update();
  if (state.hintTile) {
    const group = meshes.get(state.hintTile);
    if (group) {
      hintPulse = 0.5 + 0.5 * Math.sin(now * 0.006);
      group.userData.mat.emissive.setHex(COLORS.teal);
      group.userData.mat.emissiveIntensity = 0.18 + hintPulse * 0.42;
      group.userData.faceMat.emissive.setHex(0x1c4a46);
      group.userData.faceMat.emissiveIntensity = 0.25 + hintPulse * 0.35;
    }
  }
  gapRing.material.opacity = 0.24 + 0.14 * (0.5 + 0.5 * Math.sin(now * 0.0026));
  const pulse = 1 + 0.022 * Math.sin(now * 0.0026);
  gapRing.scale.setScalar(pulse);
  renderer.render(scene, camera);
}

/* ------------------------------- self-test -------------------------------- */
const selftestChecks = [];

function record(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then((detail) => {
      selftestChecks.push({ name, ok: true, detail: detail || '' });
    })
    .catch((error) => {
      selftestChecks.push({ name, ok: false, detail: error?.message || String(error) });
    });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed');
}

function cloneBoard(board) {
  return board.slice();
}

async function runSelfTest() {
  state.selftest = true;
  const panel = $('selftest');
  panel.hidden = false;

  await record('goal board is solved', () => {
    assert(Puzzle15.isSolved(Puzzle15.GOAL), 'goal not recognised');
    assert(Puzzle15.manhattan(Puzzle15.GOAL) === 0, 'manhattan(goal) != 0');
    assert(Puzzle15.linearConflicts(Puzzle15.GOAL) === 0, 'conflicts(goal) != 0');
  });

  await record('inversion parity matches the 4×4 rule', () => {
    assert(Puzzle15.isSolvable(Puzzle15.GOAL), 'goal unsolvable');
    const swapped = Puzzle15.GOAL.slice();
    swapped[13] = 15;
    swapped[14] = 14;
    assert(!Puzzle15.isSolvable(swapped), 'swapped pair reported solvable');
    assert(Puzzle15.inversions(swapped) === 1, 'inversion count wrong');
  });

  await record('manhattan and linear conflicts are correct', () => {
    const b = Puzzle15.GOAL.slice();
    b[0] = 2;
    b[1] = 1;
    assert(Puzzle15.manhattan(b) === 2, 'manhattan mismatch');
    assert(Puzzle15.linearConflicts(b) === 2, 'linear conflict mismatch');
    const c = cloneBoard(Puzzle15.GOAL);
    c[0] = 5;
    c[4] = 0;
    c[15] = 1;
    assert(Puzzle15.manhattan(c) === 7, `manhattan expected 7, got ${Puzzle15.manhattan(c)}`);
  });

  await record('legal moves and reversibility', () => {
    for (let blankCell = 0; blankCell < 16; blankCell++) {
      const board = Puzzle15.GOAL.slice();
      const moving = board[blankCell];
      board[blankCell] = 0;
      board[15] = moving;
      const row = Math.floor(blankCell / 4);
      const col = blankCell % 4;
      const expected = (row > 0) + (row < 3) + (col > 0) + (col < 3);
      const legal = Puzzle15.legalMoves(board);
      assert(legal.length === expected, `expected ${expected} legal moves at ${blankCell}, got ${legal.length}`);
      for (const tile of legal) {
        const next = Puzzle15.move(board, tile);
        assert(next, 'move rejected');
        const back = Puzzle15.move(next, blankCell);
        assert(back && back.every((v, i) => v === board[i]), 'reverse move did not restore the board');
      }
      const illegal = [...Array(16).keys()].find((i) => i !== blankCell && !legal.includes(i));
      if (illegal !== undefined) assert(Puzzle15.move(board, illegal) === null, 'illegal move accepted');
    }
  });

  await record('shuffle is always solvable and mixed', () => {
    for (let i = 0; i < 25; i++) {
      const board = Puzzle15.shuffle(48, Math.random);
      assert(board.length === 16, 'wrong length');
      assert(new Set(board).size === 16, 'duplicate tile');
      assert(Puzzle15.isSolvable(board), 'shuffle produced an unsolvable board');
      assert(!Puzzle15.isSolved(board), 'shuffle produced the goal');
    }
  });

  await record('A* matches breadth-first optimum on short scrambles', () => {
    for (let trial = 0; trial < 6; trial++) {
      const board = Puzzle15.shuffle(5 + trial, Math.random);
      const exact = Puzzle15.bfs(board, 300000);
      assert(exact.ok, 'bfs could not solve');
      const result = Puzzle15.solve(board, { optimalBudget: 40000, nearBudget: 20000 });
      assert(result.ok, 'A* failed to solve');
      assert(result.moves.length === exact.depth, `A* ${result.moves.length} != BFS ${exact.depth}`);
      let walk = board.slice();
      for (const value of result.moves) walk = Puzzle15.move(walk, walk.indexOf(value));
      assert(walk && Puzzle15.isSolved(walk), 'A* path does not solve the board');
    }
  });

  await record('solver rejects unsolvable arrangements', () => {
    const board = Puzzle15.GOAL.slice();
    board[0] = 2;
    board[1] = 1;
    const result = Puzzle15.solve(board);
    assert(!result.ok && result.reason === 'unsolvable', 'unsolvable board was not rejected');
  });

  await record('the board is a 16-cell permutation', () => {
    assert(state.board.length === 16, 'board length');
    assert(new Set(state.board).size === 16, 'board values not unique');
  });

  await record('15 tile meshes and a textured face for each', () => {
    assert(meshes.size === 15, `expected 15 meshes, found ${meshes.size}`);
    for (const [value, group] of meshes) {
      assert(group.userData.faceMat.map, `tile ${value} has no texture`);
      assert(group.userData.cell >= 0 && group.userData.cell < 16, `tile ${value} has no cell`);
    }
  });

  await record('WebGL renderer is live and sized', () => {
    assert(renderer.getContext(), 'no WebGL context');
    const size = renderer.getSize(new THREE.Vector2());
    const rect = stage.getBoundingClientRect();
    assert(Math.abs(size.x - rect.width) < 3, `canvas width ${size.x} != ${rect.width}`);
    assert(size.y > 100, 'canvas has no height');
  });

  await record('English and Thai dictionaries are symmetric', () => {
    const en = Object.keys(I18N.en).sort();
    const th = Object.keys(I18N.th).sort();
    const missingTh = en.filter((k) => !(k in I18N.th));
    const extraTh = th.filter((k) => !(k in I18N.en));
    assert(!missingTh.length, `missing Thai keys: ${missingTh.join(', ')}`);
    assert(!extraTh.length, `extra Thai keys: ${extraTh.join(', ')}`);
  });

  await record('every static translation key exists', () => {
    const missing = [];
    for (const el of $$('[data-i18n]')) {
      const key = el.dataset.i18n;
      if (!(key in I18N.en) || !(key in I18N.th)) missing.push(key);
    }
    for (const el of $$('[data-i18n-attr]')) {
      for (const pair of el.dataset.i18nAttr.split(';')) {
        const key = pair.split(':')[1]?.trim();
        if (key && (!(key in I18N.en) || !(key in I18N.th))) missing.push(key);
      }
    }
    assert(!missing.length, `missing keys: ${[...new Set(missing)].join(', ')}`);
  });

  await record('document ids are unique and required ids exist', () => {
    const ids = $$('[id]').map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert(!dupes.length, `duplicate ids: ${dupes.join(', ')}`);
    const required = ['scene', 'stage', 'btn-shuffle', 'btn-solve', 'btn-hint', 'skin-select', 'move-log', 'hud-h', 'hud-remaining', 'modal-help', 'modal-win', 'selftest'];
    const missing = required.filter((id) => !document.getElementById(id));
    assert(!missing.length, `missing ids: ${missing.join(', ')}`);
  });

  await record('local storage round-trips preferences', () => {
    const key = 'p15.selftest.v1';
    assert(saveJSON(key, { ok: true }), 'write failed');
    assert(loadJSON(key, null)?.ok === true, 'read failed');
    localStorage.removeItem(key);
  });

  await record('export payload has the documented shape', () => {
    const payload = exportPayload();
    assert(payload.schema === 'puzzle15.export.v1', 'schema');
    assert(Array.isArray(payload.board) && payload.board.length === 16, 'board');
    assert(payload.goal.length === 16, 'goal');
    assert(payload.heuristic.name === 'manhattan+linear-conflicts', 'heuristic name');
    assert(typeof payload.moves === 'number', 'moves');
    assert(Array.isArray(payload.history), 'history');
    assert(payload.records && typeof payload.records.streak === 'number', 'records');
  });

  await record('solver worker source is valid JavaScript', () => {
    const src = solverWorkerSource();
    assert(src.includes('self.onmessage'), 'missing worker handler');
    assert(!src.includes('import '), 'worker must not import');
    // eslint-disable-next-line no-new-func
    new Function(src);
  });

  await record('three.js is pinned to an exact CDN version', () => {
    const html = document.documentElement.innerHTML;
    assert(/three@0\.169\.0/.test(html), 'three.js version is not pinned');
    assert(!/three@latest|three@\^/.test(html), 'unpinned three.js reference');
  });

  const failures = selftestChecks.filter((c) => !c.ok);
  const list = $('selftest-list');
  list.innerHTML = '';
  for (const check of selftestChecks) {
    const li = document.createElement('li');
    li.className = check.ok ? 'is-pass' : 'is-fail';
    li.textContent = `${check.ok ? 'PASS' : 'FAIL'} — ${check.name}${check.detail ? ` (${check.detail})` : ''}`;
    list.append(li);
  }
  const summary = $('selftest-summary');
  summary.textContent = `${selftestChecks.length - failures.length}/${selftestChecks.length} passed`;
  summary.dataset.result = failures.length ? 'fail' : 'pass';
  document.body.dataset.selftest = failures.length ? 'fail' : 'pass';
  document.body.dataset.selftestTotal = String(selftestChecks.length);
  if (failures.length) console.error('Self-test failures:', failures);
  return { total: selftestChecks.length, failed: failures.length, checks: selftestChecks };
}

/* --------------------------------- boot ---------------------------------- */
function boot() {
  loadPrefs();

  const select = $('skin-select');
  select.value = state.skin;
  const speed = $('speed');
  speed.value = String(state.speed);
  $('speed-label').textContent = `${state.speed}×`;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('sound-use').setAttribute('href', state.sound ? '#i-sound' : '#i-mute');
  $('assist-badge').hidden = true;
  $('selftest').hidden = !new URLSearchParams(location.search).has('selftest');

  bindUI();
  bindKeyboard();
  applySkin(state.skin);
  applyLanguage(state.lang);
  renderRecords();
  resize();

  const restored = restoreGame();
  if (!restored) {
    positionAllTiles(false);
    setStatus('status.ready', 'ready');
    updateHud();
  }
  updateSolverNote('solver.note');
  updateSolverControls();
  updateSolverTag('ready');

  if (restored) toast('status.restored');
  else if (new URLSearchParams(location.search).has('selftest')) {
    // Leave the board in the goal so the checks are deterministic.
    resetSession(Puzzle15.GOAL.slice(), { status: 'status.ready', tone: 'ready' });
  }

  renderer.setAnimationLoop(renderFrame);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => $('loading').classList.add('is-done'), 420);
      document.body.dataset.ready = 'true';
    });
  });

  const params = new URLSearchParams(location.search);
  if (params.has('selftest')) {
    void runSelfTest();
  }

  window.__puzzle15 = {
    state,
    Puzzle15,
    scene,
    camera,
    renderer,
    meshes,
    attemptMove,
    positionAllTiles,
    undoMove,
    shufflePuzzle,
    resetPuzzle,
    autoSolve,
    stopAuto,
    requestHint,
    computeSolution,
    exportPayload,
    exportGame,
    setLanguage,
    setSkin,
    applySkin,
    applyLanguage,
    handleUpload,
    isAdjacent,
    updateHud,
    runSelfTest,
    solverWorkerSource,
    finishWin,
    openModal,
    closeAllModals,
    saveJSON,
    loadJSON,
    fmt: { formatTime, formatClock },
  };
}

boot();
