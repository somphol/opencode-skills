# Architecture

## Runtime shape

```
index.html
  ├─ css/style.css
  ├─ https://cdnjs.cloudflare.com/.../three.js/r128/three.min.js
  ├─ https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
  ├─ js/data.js          -> window.ALGO_DATA
  ├─ js/algorithms.js    -> window.ALGO_ENGINE
  ├─ js/scene.js         -> window.AlgoScene
  └─ js/app.js           -> window.__algo, boot()
```

Classic scripts are intentional: the app runs from `file://`, any static host, or GitHub Pages with
no build step. `data.js` and `algorithms.js` are UMD-ish so Node tests can `require()` them.

## Data flow

```
user input / rail click
        │
        ▼
ALGO_ENGINE.run(patternId, input)         pure, deterministic
        │  { frames, meta, summary, answer }
        ▼
app.state.result
        ├─ renderPatternMeta()             text, badges, links, hint
        ├─ AlgoScene.setPattern()          dispose old root, build 15-scene model
        ├─ renderCode()                    three-language listings
        └─ applyFrame(0)
                │
                ├─ AlgoScene.showFrame(frame)   updater(frame.data)
                ├─ step counter / title / note
                ├─ slider max
                ├─ code mark highlight
                └─ answer chip on last frame
```

Playback only changes the frame index. It never mutates algorithm state. That is why the slider,
Prev/Next, play/pause, the code highlight and the tests all agree.

## Files

| File | Lines (approx.) | Responsibility |
| --- | ---: | --- |
| `index.html` | 320 | three tab shells, stage, inspector, code panel, dialogs, script order |
| `css/style.css` | 1,100 | design tokens, studio grid, scene chrome, quiz/practice, responsive, reduced motion |
| `js/data.js` | 1,000 | 15 patterns, 45 code listings, 61 problems, 30 quiz questions |
| `js/algorithms.js` | 850 | parsers, 15 engines, 18-check self-test, tree builder |
| `js/scene.js` | 1,300 | renderer, camera, orbit controls, 15 scene builders, label/tween helpers |
| `js/app.js` | 700 | controller, tabs, playback, quiz, practice, persistence, 24-check self-test |
| `tests/engine.test.mjs` | 27 tests | data contract, engines, custom input, errors |
| `tests/static.test.mjs` | 20 tests | files, markup, docs, metadata, secrets |
| `tests/browser.test.mjs` | 35 checks | real WebGL, all scenes, UI flows, mobile |
| `scripts/screenshot.mjs` | 1 script | regenerates README/social assets |

Line counts are approximate; the test suite asserts structural thresholds rather than exact numbers.

## `js/data.js`

`ALGO_DATA` contains `patterns`, `quiz`, `meta`, `version`. Each pattern carries display metadata,
four or five canonical problems, and three code listings. Code lines are `{t, m}` — text plus a
semantic mark. Marks are the synchronization contract between engine frames and the viewer.

The quiz is a flat array of 30 `{pattern, q, options, answer, explain}` objects. Options are fixed
order for deterministic tests; a user-triggered fresh round shuffles question order only.

## `js/algorithms.js`

Each engine is a closure with a local `push(title, note, mark, data)`. Shared helpers:

- `splitPair(text, fallback)` — splits `data | parameter`.
- `numberList`, `intervalList`, `edgeList`, `levelOrder`, `gridRows` — bounded, validating parsers.
- `buildTree(values)` — level-order input to `{root, nodes}` where nodes store child ids, not object
  references, so frames/meta stay serializable.
- `selfTest()` — 18 canonical checks used by both Node and the in-page test.

`run(patternId, input)` throws a user-facing `Error` on invalid input. `app.js` catches it, prints it
inline, and keeps the previous trace.

Frame counts for defaults range from 5 (Fast & Slow) to 38 (DP). Parsers cap inputs so no custom
trace explodes the DOM or draw calls.

## `js/scene.js`

A module-level singleton:

- renderer: antialias, alpha, ACES tone mapping, sRGB output, shadows, DPR capped at 2;
- scene: fog, hemisphere, key directional, rim, accent point light, 300 stars;
- camera: one `PerspectiveCamera`, per-pattern home pose;
- controls: `OrbitControls` with damping, distance clamp and near-horizontal polar limit;
- `dynamicRoot`: rebuilt on every pattern change and disposed recursively.

Builders return an updater. Shared primitives: `box`, `roundedBox`, `sphere`, `cylinder`, `ring`,
`beam`, `makeArrow`/`placeArrow`, `curveBetween`, `layoutTree`, `label`, `tween`, `addPlatform`,
`addAxis`. The updater only calls `tween` / `setLabel`; the render loop eases values and renders.

Label textures are canvas sprites cached by `text|colour|background|border|size`. They are shared
across meshes and therefore skipped by `disposeObject`. Mesh materials are not shared and are
disposed.

## `js/app.js`

Single state object:

```js
{
  patternId, language, speed, frameIndex, playing, timer, result, tab,
  difficulty, search,
  quiz: { order, index, score, streak, answered, option, results, finished, best }
}
```

Persistence:

| Key | Shape |
| --- | --- |
| `algoExplorer.prefs.v1` | `{patternId, language, speed, explored:{id:true}}` |
| `algoExplorer.progress.v1` | `{done:{"pattern:num":true}}` |
| `algoExplorer.quiz.v1` | `{best:number, attempts:number}` |

Every read merges into a fallback and never throws. `window.__algo` exposes the data, engine, scene,
state and controller methods for the browser suite.

## CSS architecture

- Tokens at `:root` (colours, radii, fonts, shadows).
- A fixed ambient layer (three blurred orbs + grid) sits behind `z-index: -2`.
- Sticky top bar with tab pills, sticky curriculum rail.
- Studio grid areas: `rail stage inspector / rail code code`; collapses to one column at 860 px.
- Every component uses the same panel/border/accent language.
- `prefers-reduced-motion` removes animations and smooth scrolling.
- No external fonts or images are required for layout; screenshots are documentation only.

## Accessibility and failure modes

The canvas is labelled and the same trace exists in text (step title, note, result chip, code line),
so the visual is not the only channel. Controls are native buttons/inputs with labels. Dialogs are
native `<dialog>`. Keyboard paths are documented in the help dialog.

If Three.js fails, `AlgoScene.init()` shows a fallback and returns false. The app still builds frames,
renders code, runs quiz/practice and sets `body[data-webgl="false"]`. If `localStorage` is blocked,
writes fail silently and the session still works.
