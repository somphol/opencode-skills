# UI, state and data

This is the layer around the engine and scene: one mutable state object, a move pipeline, a solver
client, bilingual copy, records and export. Reference: `assets/reference/script.js`, sections 2, 3,
5, 6 and 7.

## Layout

Three columns on a wide screen: **Play**, **Stage**, **Solver**. Breakpoints:

| Width | Layout |
| --- | --- |
| > 1220 | 3 columns, panels scroll independently |
| 900–1220 | left panel + stage, solver cards in a 3-column strip below |
| < 900 | one column, order **stage → play → solver** |
| < 560 | compact pills, labels shrink but stay visible |

Use CSS grid areas so the mobile order is explicit. Do not rely on DOM order; the stage should come
first on a phone.

The stage is the hero: give it `min-height: 560px` desktop and `58dvh` mobile, round 24px, and a
vignette. Keep HUD pills in the four corners with `pointer-events: none` except the camera button.

## State

One object, no framework:

```js
const state = {
  board, history, moves, startedAt, elapsedMs, running, solved, assisted,
  lang, sound, skin, speed, solution, solving, autoPlaying, animating,
  hintTile, expandedNodes, records,
  statusKey, statusTone, noteKey, noteVars,
};
```

- `solved` is **false after reset/shuffle**, even if the board is the goal. Only `finishWin()` sets
  it true.
- `assisted` is sticky for the session once a hint or auto-solve is used.
- `statusKey`/`noteKey` exist because static `data-i18n` would overwrite dynamic text on a language
  switch. Re-apply them in `applyLanguage()`.
- `solution` is an array of tile numbers or `null`.

## Move pipeline

```js
async function attemptMove(value, byUser = true, options = {}) {
  if (state.animating) return false;
  const from = state.board.indexOf(value);
  const blank = state.board.indexOf(0);
  if (from < 0 || !isAdjacent(from, blank)) return false;

  const next = state.board.slice();
  next[blank] = value; next[from] = 0;
  state.board = next;                 // logic leads animation
  state.animating = true;

  if (byUser || options.auto) {
    startClock();
    state.moves += 1;
    state.history.push({ value, from, to: blank, dir });
    logMove(value, dir);
    if (byUser) consumeOrInvalidateSolution(value);
  }

  updateHud();
  await slideTile(value, from, blank, options.fast);
  state.animating = false;
  updateHud();
  persistGame(true);                  // force: do not lose the last move
  if (byUser && isSolvedNow()) await finishWin();
  return true;
}
```

Rules that matter:

- A manual move either follows the cached path (`solution[0] === value` → `shift()`) or clears it.
- Auto moves are counted and logged too; records are protected by `assisted`, not by hiding moves.
- Undo validates `board[to] === value` and `blank === from`; on drift, rebuild instead of animating.
- Persist **force** after every move. Throttling caused a reload to restore a board one move behind.

## Solver client

```js
function computeSolution() {
  if (state.solution) return { ok: true, cached: true };
  state.solving = true;
  return solveInWorker(state.board, {})
    .then((result) => {
      state.solution = result.moves;
      state.expandedNodes = result.nodes;
      note(result.optimal ? 'solver.optimal' : 'solver.near', { ms: result.elapsedMs });
      return { ok: true };
    })
    .catch(fallbackToMainThread)
    .finally(() => { state.solving = false; updateSolverControls(); });
}
```

- Worker request ids prevent stale replies; one pending request at a time.
- Stop terminates the worker and rejects the pending promise with `cancelled` (do not show an error).
- Auto-play uses a cancellation token, because an in-flight `await` cannot be interrupted otherwise.
- `updateSolverControls()` disables hint/solve while solving; the solve button doubles as Stop while
  auto-playing.

## Hints

- `hintTile = solution[0]`; mark `assisted`; show the badge.
- Pulse the tile and draw the SVG arrow.
- Note text: “Slide tile {n} {dir}.” Compute the direction from the board, not the path.
- Any move clears the arrow; following the path moves to the next tile on request.

## Auto-play

```js
while (state.autoPlaying && state.solution?.length) {
  const value = state.solution[0];
  if (!isAdjacent(state.board.indexOf(value), state.board.indexOf(0))) break;
  await attemptMove(value, false, { fast: true, auto: true });
  if (!state.autoPlaying) break;
  state.solution.shift();
  await delay(420 - (state.speed - 1) * 88);
}
```

Speeds 1–5 map to ~420…68ms between slides. Always clear `autoPlaying` in `finally` and finish the
win there, not inside the loop.

## Bilingual UI

Two complete dictionaries with identical key sets. `applyLanguage(lang)`:

1. `<html lang>` + `body.dataset.lang`.
2. Replace `[data-i18n]` text.
3. Replace `[data-i18n-attr]` attributes (`aria-label:key;title:key`).
4. Rebuild the move log (directions are localized at render time).
5. Re-apply `statusKey`, `noteKey`, and a visible toast.
6. Update `document.title`, language buttons’ `aria-pressed`.
7. Persist.

Add keys to both languages, always. The self-test and static suite fail on asymmetry and on any key
referenced by the markup but missing from the dictionary.

Thai specifics: keep “Manhattan” and “linear conflicts” in Latin script where Thai developers use
them; translate directions and statuses; test 390px because Thai labels are often longer.

## Records

```js
records = { bestTimeMs, bestMoves, streak, solves };
```

- Best time/fewest moves update only when `!state.assisted`.
- Streak increments per unassisted win; assisted wins leave it alone.
- Display best time as `Xm YYs`, live timer as `mm:ss`.
- Reset records clears storage and the UI.

## Persistence

| Key | Contents |
| --- | --- |
| `p15.prefs.v1` | lang, sound, skin, speed |
| `p15.records.v1` | records |
| `p15.game.v1` | board, last 40 history entries, moves, elapsedMs, assisted, skin, savedAt |

- Wrap `localStorage` in try/catch; private mode must degrade to an in-memory session.
- Delete the saved game on solve.
- Restore only if: array length 16, unique, integers 0–15, solvable, not already solved.
- Restore pauses the clock; the next move resumes it.
- Custom images are **not** persisted. Say so in the UI and docs.

## Export

`schema: "puzzle15.export.v1"`, pretty-printed JSON blob, download via an object URL:

```json
{
  "app": "…", "version": "1.0.0", "schema": "puzzle15.export.v1",
  "exportedAt": "ISO-8601", "language": "en",
  "board": [1, "…", 0], "goal": [1, "…", 0], "solved": false,
  "moves": 12, "assisted": false, "elapsedMs": 45210, "elapsed": "00:45",
  "heuristic": { "name": "manhattan+linear-conflicts", "manhattan": 28, "linearConflicts": 4, "total": 32 },
  "solution": { "remaining": [3, 7], "length": 2, "nodesExpanded": 4312 },
  "history": [{ "tile": 5, "direction": "up" }],
  "records": { "bestTimeMs": 61000, "bestMoves": 78, "streak": 2, "solves": 4 },
  "skin": "classic"
}
```

Keep the schema string stable; add fields, never rename silently.

## Interface wiring

- One `bindUI()` for buttons, selects, file input, modals, speed slider.
- One `bindKeyboard()` with an early return for inputs/selects and open modals.
- Dialogs: `role=dialog`, `aria-modal`, focus the close button, restore focus, close on Esc/backdrop.
- Toasts: store key+vars, re-render on language change, and use a visibility flag (not the timer id)
  to know whether one is on screen.
- Loading veil: dismiss after two rAF plus ~420ms; never leave it blocking input.

## Accessibility

Keyboard parity for every pointer action, visible focus, `aria-live` status, labelled icon buttons,
and reduced-motion rules that keep the game playable. A hidden 4×4 table for screen readers is a
known gap; do not claim it unless you implement it.

## Debug API

Expose `window.__puzzle15` with state, engine, meshes, camera, move/shuffle/reset, solver, export,
language, skin, and the self-test. It is how the browser suite and future maintainers inspect the app
without scraping the DOM.
