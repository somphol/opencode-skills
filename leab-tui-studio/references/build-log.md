# Build log — Leab-Tui 3D case study

## Brief

Build “Leab-Tui 3D: Traditional Xiangqi Trick-Taking Studio”: a complete, production-ready 3D web app
in vanilla HTML/CSS/ES6 with Three.js from a CDN, bilingual EN/TH, a beginner coach, undo, synthesized
audio, localStorage and JSON export, then publish it and turn the process into a skill.

The brief included the hierarchy, red-beats-black, the combination names and the four-player deal. It
did **not** define the trick loop precisely, the scoring table or the five-tile straight. Those gaps
became the rules-research phase.

## What happened

| Phase | Approx. time | Notes |
| --- | --- | --- |
| Rules research | 8 min | Found the 2016 Thai article; extracted hierarchy, calls, flow, scoring; identified two ambiguities |
| Engine + AI + state + UI + scene | 16 min | One large `script.js`; dynamic Three import; procedural textures |
| First browser run + fixes | 10 min | Canvas mount, missing functions, pair rule, serialization |
| Flow verification | 8 min | Full round, undo, next round, reload, match end |
| Screenshots | 5 min | EN, TH, rules, phone; retakes for animation timing |
| Docs + release | 15+ min | 20+ documents, templates, workflow, state |
| Skill + publish | 10+ min | SKILL.md, references, catalog sync, Pages |

Total measured session at the documentation checkpoint: **46m 33s**, **385,026 tokens**
(input 229,660 + output 79,621 + reasoning 75,745; cache reads 10,768,256 reported separately).
Final numbers, including publishing, are in the project's `state.json` / `STATE.md`.

## Bugs that cost real time

### 1. Canvas at app level

The `<canvas id="scene">` was a child of `#app`, not `.stage-wrap`. With `position:absolute; inset:0`
it rendered across the whole viewport behind the sidebar. The table looked absent and the seat labels
appeared over the scoreboard. Fix: move the canvas inside the stage; verify `canvas.clientWidth` equals
the stage width, not the window.

### 2. Snapshot with live tile objects

`serializableState` originally cloned `state` without converting tiles to IDs. The undo snapshot held
objects; `undo` mapped `TILE_BY_ID[object]` → `undefined` and filtered every hand empty. The same bug
made `loadMatch` reject every save (it validates IDs). Fix: one serializer that converts hands,
captures, centre, lead/best, lastTrick and log combos to IDs; `undo` maps back.

Lesson: a serializer is a boundary, not a `JSON.parse(JSON.stringify(state))`.

### 3. General pair accepted

`detectCombo` returned a pair for two synthetic General objects because it only checked rank+colour.
There is one General per colour, so the pair can never exist. Fix: reject `power === 7` for pairs; add
the self-test. A pure function still needs domain constraints beyond the shape of its input.

### 4. Missing render function and undefined field

`renderAll` called `renderCoach()` (the function was `coachTick`), and `renderRules` used
`rank.hanzi[0]` on a rank object that has `red`/`black` fields. Both threw during boot, leaving the page
empty. Fix: call the real function; use `rank.red + rank.black`. Always check the first browser console
output before debugging “the scene”.

### 5. Audio autoplay warning

`dealRound` played a shuffle at boot, creating the `AudioContext` before a gesture. Chrome logged the
autoplay warning. Fix: `StudioAudio.unlocked` starts false; `play` returns until the first
`pointerdown`/`keydown` calls `resume()`. The warning is a signal, not noise to filter.

### 6. Mobile dock hid the hand

At 390×844 the desktop dock (title + three lines + wrapped buttons) was ~230 px tall and covered the
entire hand. Fix: compact dock (no kicker, one-line detail, one scrollable button row), stage
`calc(100dvh - 86px)`, portrait camera `(0,14.3,17.2)` / FOV 46. Retake the screenshot; check the whole
hand is visible.

### 7. Inspector cleared on every render

`renderAll` called `renderInspector()` with no argument, which reset the card to the empty state. Fix:
a module-level `inspectedTileId`; `inspectTile` sets it; `renderInspector` falls back to it. The hover
lift and the card now survive AI actions.

### 8. Misleading follow copy

When the selected tiles did not form the called type, the dock used `combo || lead.combo` and told the
player “Your Black Elephant pair does not beat…”. Fix: branch on “selected count”, “not legal”, “can
beat”, “cannot beat” and use the actual selected combo only when it exists.

### 9. Modal screenshot looked transparent

The screenshot was taken immediately after `click()`, during the 180–220 ms fade/rise. Fix: wait
~900 ms. The same applies to toasts: wait 3.5 s after a hint before capturing.

### 10. CDP harness connected to the wrong target

`/json/version` returns the browser-level WebSocket; `Page.enable` fails. Fix: `/json/list`, pick
`type === "page"`. Also print the custom eval under `evalValue` (the report originally only exposed
fixed fields, so a playthrough looked like `undefined`), and print after the reload block.

## What worked

- **Rules first.** The contract made the engine, coach, inspector, rules modal and tests share one
  vocabulary. The two ambiguities were decided once and never re-litigated.
- **Pure functions + a browser self-test.** No test runner, no dependency; `?selftest=1` runs 25 checks
  and sets the title.
- **A simple `scene.sync(state)`.** The scene never owns state; the same function handles deal, play,
  capture and resume.
- **A dependency-free CDP harness.** Node 22's `WebSocket` + `fetch` + Chrome was enough; no Puppeteer,
  no install, no lockfile.
- **A real end-to-end playthrough.** It caught count drift, undo, reload and match-end issues that a
  visual check would miss.
- **One credential read.** `git credential fill` into a shell variable, API create, normal push. No
  repeated Keychain prompts, no token on disk.

## What I would do differently

1. Write `serializableState` before the first snapshot, not after undo breaks.
2. Put the canvas inside the stage in the first HTML draft.
3. Build the mobile dock before the desktop polish; the phone layout constrains the scene more.
4. Add the “not legal” / “can beat” / “cannot beat” UI branches at the same time as the coach strings.
5. Take screenshots only after a `?demo=1` state is stable, and always wait out animations.
6. Measure tokens at the end; a mid-build snapshot understates the release work.

## Reusable numbers

- 32 tiles, 4 seats, 8 tiles each.
- 9 combination types, 211 i18n keys per language.
- 25 self-checks, 4 screenshots, 3 runtime files, 0 npm dependencies.
- 1 pinned CDN (Three.js r160).
- 46m 33s / 385,026 tokens at the documentation checkpoint.

## Provenance

Original implementation and documentation by Somphol Boonjing with OpenCode 2.2.5 and DeepSeek V4.1
Flash. Rules reference: Navee Angsuputiphant (2016). Three.js: MIT. No third-party brand marks are
redistributed.
