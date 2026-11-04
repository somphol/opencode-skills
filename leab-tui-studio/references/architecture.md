# Architecture

## Three files, one module

```text
index.html   document, import map, static HUD, modals
style.css    design tokens, layout, responsive dock, modal system
script.js    one ES module, numbered sections
```

No framework, bundler, package.json or build step. The runtime dependency is pinned Three.js:

```html
<script type="importmap">
{"imports":{
  "three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
}}
</script>
```

Use a dynamic `import("three")` inside `createScene()` so a CDN/WebGL failure leaves the rules, coach,
scoreboard and export usable.

## Section order inside `script.js`

1. **Data** — ranks, colours, seats, deck, constants.
2. **Rules** — pure functions: deck, detect, compare, enumerate, score.
3. **AI** — lead/follow heuristics, deterministic option, fuzz simulation.
4. **State** — one `state`, `prefs`, `stats`; `serializableState`.
5. **Flow** — deal, lead, submit, resolve, round, undo.
6. **3D scene** — `createScene` returns an API; no rules inside.
7. **Audio** — one class, synthesised, gesture-unlocked.
8. **UI** — `renderAll` and small render functions.
9. **Language/chrome** — `applyLanguage`, `setSound`, `setLanguage`.
10. **Persistence/export** — save, load, export.
11. **Self-test** — pure checks + simulation.
12. **Boot/events** — `bindEvents`, `boot`, `window.App`.

This order matters: data and rules can be tested before the DOM exists; the scene can be created last.

## Tile and combo shapes

```js
// tile
{ id: "r-advisor-0", rank: "advisor", power: 6, color: "r", hanzi: "仕" }

// combo
{ type: "seehoo", count: 4, tiles: [tile...],
  score: [6, 1], color: "r", set: "big", dup: [6],
  key: "seehoo:6,1:..." }
```

`score` is the comparison key:

- single / pair / Soldier set: `[rank, colour]` (colour red=1, black=0).
- Sa Hoo: `[big=2|small=1, colour]`.
- See Hoo: `[doubledRank, colour]`.
- Ngoh Hoo: `[higherDoubledRank, lowerDoubledRank, colour]`.
- Lak Hoo: `[0, colour]` (the pattern is fixed).

`compareScores` is lexicographic. `beats(a,b)` requires the same `type` and `compare > 0`. Equal never
overtakes.

`detectCombo` is the only legality authority. The AI, coach, inspector, rules copy and self-test all
call it. Do not re-implement legality in the UI.

## State machine

```text
dealing → lead → follow → resolving → lead (next trick)
                    └──── undo ──────┘
                                     └→ roundEnd → lead (next round)
                                                └→ matchEnd
```

- `beginTrick` stores a snapshot **before** the leader acts.
- `leadTrick` removes N tiles, sets lead/best, advances turn.
- `submitPlay` removes exactly N tiles; `revealed` only when type matches and the set strictly beats.
- `resolveTrick` adds all centre tiles to the winner's captures, records `lastTrick`, clears centre,
  schedules the next trick or `endRound`.
- `undoLastTrick` restores the snapshot, maps IDs back to tiles, restores stats, restarts the trick.
- `endRound` computes piles → points, updates scores/history/stats, saves, opens summary.
- `startNextRound` rotates dealer, uses the last trick winner as leader, re-deals.

### Face-down is a first-class action

Followers must send exactly the called count. They may always choose **Play face-down**, even with a
legal beating set. An unrevealed set never wins. This is the game's central bluff/conservation
decision; never “helpfully” auto-reveal.

## Serialization boundary

`serializableState(state)` is the only object→ID conversion. It must handle:

- hands and captures: `tile.id`;
- centre entries: `{seat, revealed, tiles:[id], combo}`;
- `lead`/`best`: `{seat, combo}`;
- `lastTrick` and `log` combos;
- delete `snapshot` and `fast` (avoid recursion and non-serializable flags).

`loadMatch` validates format, four hands ≤8 valid IDs, four scores and a known phase; rebuilds tiles
and combos with `detectCombo`. A stale `dealing` save starts a new match.

The snapshot uses the same serialization. `undo` maps IDs back with `TILE_BY_ID`. This is the fix for
the two bugs that hurt most: undo emptied every hand when the snapshot held live objects, and reload
rejected a save for the same reason.

## 3D scene

The scene is a **projection** of state:

```js
{ deal, sync, collect, flipHumanHand, setSelected, reset,
  resetView, toggleTopView, toggleCinema, getState }
```

`placementMap(state)` assigns every tile:

| Kind | Position | Face |
| --- | --- | --- |
| hand | polar fan at radius 4.12; human fan wider (total ~1.56 rad) than AI (~1.08) | up for seat 0, down for AI |
| centre | 1–3 row / 4–6 grid at radius 2.05 toward the seat | `entry.revealed` |
| capture | 2×4 grid of four-tile stacks at radius 3.36 | up |

Each tile is `root → lift → tilt`:

- `root.position` — table position.
- `lift.position.y` — hover/selection lift.
- `tilt.rotation.x` — 0 face-up, π face-down.

`moveTile`/`setFace` keep animation records and skip targets within ~0.004 units, so a re-render does
not restart a tween. The render loop pulses the active seat ring, bobs the turn chevron, drifts dust
and handles camera tweens.

## Camera

- Desktop: FOV 40, home `(0,10.2,11.4)`, target `(0,0.22,0.9)`.
- Portrait (`max-width: 640px`): FOV 46, home `(0,14.3,17.2)`, target `(0,0.18,0.7)`.
- OrbitControls: damping, distance 7.4–18.5, polar 0.14–1.32, pan clamped to radius 4.2.

The portrait framing is not cosmetic. The human hand fans across the full stage; without moving the
camera back, the outer tiles are cropped and the dock hides the rest.

## AI

`chooseLead(hand)`:

- enumerate all combos;
- estimate power (rank/set/dup) and `winChance = power^2.1`;
- score `winChance * lengthBonus - cost * 0.55 - GeneralTax + lastTrickBonus + jitter`;
- prefer conserving the General unless it is the last trick.

`chooseFollow(hand, lead, best)`:

- enumerate legal beating sets; sort weakest first; reveal with a probability (higher if last to act);
- otherwise discard the lowest keep-value tiles, avoiding pairs/straights.

`chooseLead`/`chooseFollow` accept `{deterministic:true}` for the coach and tests. `simulateRound(seed)`
runs a whole round and asserts conservation. The AI is deliberately heuristic; it is not a search
engine.

## Bilingual copy

- Flat `I18N.en` / `I18N.th` dictionaries with `{placeholders}` and `t(key, vars)`.
- Static DOM uses `data-i18n`; dynamic strings are composed in `coachMessage`, `comboSummary`,
  `renderLog`, summaries and `buildUndoExplanation`.
- A self-test asserts key symmetry (Leab-Tui: 211 keys per language).
- Translate tile names, colours, seats, combo names, buttons, ARIA labels and 3D score labels.
- Re-run `scene.sync(state)` after a language switch so the sprite labels update.

## Persistence and export

- `localStorage`: match, prefs, stats as separate keys.
- Autosave after each action; save on `visibilitychange` and `beforeunload`.
- Export a versioned JSON with `app`, `credits`, `stats`, `game`. See the project's
  `docs/DATA_FORMAT.md` for a concrete schema.
- Validate on load; never `eval` a saved payload.

## Audio

One `AudioContext`, master gain ~0.32, one noise buffer. Synthesise clacks, flips, shuffles, sweeps and
stings. `play()` must return until `unlocked`; set `unlocked` in the first `pointerdown`/`keydown`
handler. Never create the context at boot.
