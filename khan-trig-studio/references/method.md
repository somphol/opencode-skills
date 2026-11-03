# Method — shared architecture

## Series shape

Every unit is one static page with:

- HUD: brand, streak/best/mastery, EN ⇄ TH toggle, export button.
- Three or four tabs; each tab is a `role="tabpanel"` section.
- At least one `<canvas>` per module, drawn in CSS pixels.
- A right-hand control/readout card beside the canvas, or controls below.
- Local practice with streaks, mastery and badges.
- Footer credit to OpenCode + the model used.

No frameworks, no build step, no network. The repository root is the deployable
artifact.

## File roles

| File | Role |
| ---- | ---- |
| `index.html` | HUD, tabs, panels, controls, quiz form, i18n hooks |
| `style.css` | Palette, layout, cards, canvas frames, responsive rules |
| `script.js` | State, i18n, maths, canvas engines, practice, persistence, export |
| `scripts/check.mjs` | Static release checks |
| `scripts/browser-check.mjs` | Optional headless acceptance checks |
| `docs/` | Architecture, design, testing, deployment, a11y, release, reproduction |
| `state.json` | Historical build record (not runtime) |

## State

Common shape (extend per unit):

```json
{
  "version": 1,
  "lang": "en",
  "lastModule": "module-key",
  "moduleA": {},
  "moduleB": {},
  "practice": {
    "mode": "basic",
    "correct": 0, "attempts": 0, "streak": 0, "best": 0,
    "byMode": { "basic": 0, "quadratic": 0, "identity": 0 },
    "badges": []
  },
  "completed": { "moduleA": false, "moduleB": false, "solver": false },
  "updatedAt": null
}
```

Rules:

- `loadState()` deep-merges over defaults then sanitises every number and enum.
- Save debounced 250 ms; flush on `beforeunload`, `visibilitychange`, tab
  switch, grading and new problem.
- Wrap storage in `try/catch`; the app must work in private mode.
- Export filename is fixed per unit, e.g. `khan_trig_unit4_progress.json`.

## Canvas contract

```js
function makeStage(canvas, draw) {
  const ctx = canvas.getContext('2d')
  const stage = { canvas, ctx, w: 0, h: 0, draw }
  const resize = () => {
    const r = canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    stage.w = r.width; stage.h = r.height
    draw()
  }
  new ResizeObserver(resize).observe(canvas)
  requestAnimationFrame(resize)
  return stage
}
```

- Draw functions must return early on zero size.
- Hidden panels have zero size; call `stage.resize()` when a tab is shown.
- Use `fitTriangle`/fit transforms, never store pixels in state.
- Clamp labels near canvas edges; chips need dark backgrounds.
- Sample curves at ~200–400 points; skip asymptotes.

## Exact maths helpers

```js
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1 }
const piFrac = (n, d = 1) => { /* reduce n/d, return "π", "2π/3", "−π/6" */ }
const radToPi = (r, den = 12) => { /* exact if r is k·π/den */ }
```

- Use `piFrac` for radians, `radToPi` for inverse outputs, exact trig tables for
  special angles.
- Compute ratios from displayed lengths (`a/c`, `b/c`, `a/b`) so the shown
  arithmetic is consistent.
- Round only at display; keep full precision in state and comparison.

## i18n

- 90–100 keys per unit, identical sets in `en` and `th`.
- Static attributes: `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`.
- Dynamic: `t('key')`, `L(en, th)`.
- Generated problems carry `promptEn`/`promptTh` and bilingual steps.
- Render instructions/rounding notes at display time from keys.
- Canvas words go through `t()`/`L()`.
- Thai maths glossary belongs in `docs/DESIGN.md`; keep terms consistent.

## Practice engine

Problem object: `{ mode, prompt, equation, answer, steps, canvasData }`.

- Templates hold exact solutions; generators randomise safe numbers.
- Answer parser accepts π fractions, decimals and degrees.
- Set comparison normalises modulo 2π, ignores order, uses tolerance.
- Step reveal uses timers; clear them on hide/new problem.
- Correct: streak++, best, byMode, badges; wrong: streak = 0.
- Disable the form after grading; re-enable only on a new problem.
- Mastery is `min(100, round(correct / N * 100))`, usually N = 15.

## Visual system

- Dark navy gradient, faint 48 px grid, glass cards, 18 px radius.
- 3 tabs desktop / 1 column mobile; breakpoints ~1080, 760, 420.
- Semantic colours per series, e.g. Unit 4:
  coral sine, cyan cosine, violet tangent, emerald 1/inverse, yellow angle.
- Label values, not only colours.
- Canvas frames use `aspect-ratio` + `min-height`; cards flex.

## Build order

1. Markup and IDs.
2. CSS palette/layout.
3. State, i18n, helpers, stages.
4. Maths pure functions.
5. Module 1 draw + controls.
6. Module 2 data/interaction.
7. Module 3 practice + canvas + scoring.
8. Tabs/lang/persistence/export.
9. Static check, browser check, mobile.
10. Docs, state, publish.
