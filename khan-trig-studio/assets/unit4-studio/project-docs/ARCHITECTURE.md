# Architecture

## Runtime topology

```
index.html
  ├── style.css               presentation only
  └── script.js               one IIFE, no modules, no imports
        ├── I18N { en, th }   all UI copy
        ├── state             localStorage-backed model
        ├── FUNCS             principal domains, ranges, inverses
        ├── identity engine   expressions, choices, area model
        ├── equation engine   templates, parser, set comparison
        └── HUD, tabs, export
```

No server, build step, package manager or network call. GitHub Pages serves the
repository root as static files.

## Files

| File | Responsibility |
| ---- | -------------- |
| `index.html` | HUD, three panels, sliders, identity choices, practice form |
| `style.css` | Semantic palette, layout, canvas cards, choices, responsive rules |
| `script.js` | State, i18n, inverse branches, identity engine, solver, export |
| `scripts/check.mjs` | Dependency-free static release checks used by CI |
| `state.json` | Historical build record; never read at runtime |

## Boot sequence

`script.js` runs at the end of `<body>`.

1. `loadState()` reads `localStorage["khanTrigUnit4.v1"]`, merges over
   `DEFAULT_STATE` and sanitises function, domain keys, input, expression step
   and practice mode.
2. `makeStage(canvas, draw)` attaches a `ResizeObserver`, clamps DPR to 2 and
   requests the first draw for the inverse, area-model and solution canvases.
3. `init()` applies saved values, syncs badges, applies i18n, shows the last
   module and generates the first practice problem.
4. Hidden panels are zero-sized; `showModule()` resizes the visible stage inside
   `requestAnimationFrame`.

## State model

```json
{
  "version": 1,
  "lang": "en",
  "lastModule": "inverse",
  "inverse": { "fn": "sin", "minK": -6, "maxK": 6, "input": 0.5 },
  "identity": { "expr": "sec2minusTan2", "step": 0, "done": false },
  "practice": {
    "mode": "basic",
    "correct": 0,
    "attempts": 0,
    "streak": 0,
    "best": 0,
    "byMode": { "basic": 0, "quadratic": 0, "identity": 0 },
    "badges": []
  },
  "completed": { "inverse": false, "identity": false, "solver": false },
  "updatedAt": null
}
```

Writes are debounced by 250 ms during slider drags and flushed on
`beforeunload`, `visibilitychange`, tab switches, grading and new problems.

## Inverse engine

`FUNCS` is the single source of truth:

| Function | Principal domain | Range | Inverse |
| -------- | ---------------- | ----- | ------- |
| sin | `[−π/2, π/2]` | `[−1, 1]` | arcsin |
| cos | `[0, π]` | `[−1, 1]` | arccos |
| tan | `(−π/2, π/2)` | `ℝ` | arctan |

Domain endpoints are stored as integer multiples of `π/12` (`minK`, `maxK`).
`inverseState()` computes:

- `validDomain = min < max && min ≥ pmin && max ≤ pmax`
- `inputValid = |x| ≤ 1` for sin/cos, always true for tan
- `theta = inv(x)`
- `inBranch = validDomain && inputValid && theta` inside the chosen domain

The left canvas plots the full periodic curve faintly and the restricted branch
in gold; the right canvas samples `x = f(t)` over the branch to draw the inverse
in emerald. The active point exists only when `inBranch` is true; otherwise the
right panel explains which condition failed.

## Identity engine

`EXPRESSIONS` is data:

```js
{
  id, label, initial, final, model,
  noteEn, noteTh,
  steps: [{
    promptEn, promptTh, explainEn, explainTh,
    choices: [{ html, correct }],
    result
  }]
}
```

`renderIdentity()` builds the chips, current expression, prompt and one button
per choice. Exactly one choice per step has `correct: true`; choosing it advances
`state.identity.step`, choosing any other shows a red rejection without
advancing. `state.identity.done` is stored so a reload resumes at the completed
state.

### Area model

`drawAreaModel()` constructs a right triangle from `θ = 40°`:

- sin/cos model: legs `sin θ`, `cos θ`, hypotenuse `1`
- tan/sec model: legs `1`, `tan θ`, hypotenuse `sec θ`
- cot/csc model: legs `1`, `cot θ`, hypotenuse `csc θ`

Squares are built outward on each side and labelled with the squared length
(`sin²θ`, `1`, `sec²θ`, …). Only square captions are drawn, because side chips
inside the small triangle collide with the large square labels. The fit
transform maps the full square construction into the canvas with padding.

## Practice engine

Problem objects are plain data:

```js
{ mode, promptEn, promptTh, equationHtml, answerText, solutions, steps }
{ mode: 'identity', equationHtml, answer, options, exprId, steps }
```

### Templates

- `BASIC_TEMPLATES`: eight equations with an isolated ratio, reference angle,
  quadrant rule and exact solution degrees.
- `QUADRATIC_TEMPLATES`: six factorable quadratic forms with one or two cases,
  each carrying its own solutions.
- Identity proofs reuse `EXPRESSIONS`, asking for the final simplified form as a
  four-option multiple choice.

### Answer sets

`parseSolutions()` splits on commas/semicolons, accepts `π/6`, `5π/6`, `0.5236`
and degree terms, normalises every value modulo `2π`, and returns a list.
`sameSolutionSet()` compares lengths and matches values within `0.02` in either
direction around the circle. Order is irrelevant. Do not regress to string
comparison.

### Visual solution

Each step carries bilingual HTML and an optional `reveal` flag. `revealSteps()`
adds one step every 680 ms; the first `reveal` step sets
`revealedSolutions = true` and redraws the unit circle with the intersection
points. `resetStepAnimation()` clears every timeout, hides the points and
restores the button label.

## Canvas contract

Stages work in CSS pixels. `makeStage` sets the backing store to
`rect × min(devicePixelRatio, 2)` and resets the transform. Draw functions must
return early when `w` or `h` is zero. Shared helpers: `drawGrid`, `neonLine`,
`chip`, `roundRect`, `rgba`.

## Internationalisation

- Static markup uses `data-i18n*`.
- Dynamic text uses `t('key')`; bilingual problem/step data is stored as
  `promptEn`/`promptTh`, `explainEn`/`explainTh`.
- Every dictionary has an identical key set; CI enforces parity.
- The rounding note is appended at render time, so it follows the current
  language instead of being frozen at generation.

## Extension recipes

**New inverse function**

1. Add an entry to `FUNCS` with principal domain, range and inverse.
2. Add a button and translation key if the label is user-facing.
3. Verify the plot and the input range.

**New identity**

1. Add an `EXPRESSIONS` entry with prompts, explanations, choices and results.
2. Pick a `model` (`sin-cos`, `tan-sec`, `cot-csc`) or add a model branch.
3. Add a manual test row.

**New equation family**

1. Add a template with the equation, exact solutions and step text.
2. Map it in the practice generator.
3. Test π, decimal and 2π-equivalent inputs.

## Invariants

- No dependencies, CDNs, remote fonts, analytics or runtime `fetch`.
- Semantic colours: `#ff5722` sin, `#00e5ff` cos, `#b388ff` tan,
  `#00e676` one/inverse, `#ffd600` angles.
- Principal domains are stored in π/12 integer units.
- Answers are sets, not strings.
- `state.json` is documentation, not application state.
