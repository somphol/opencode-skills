# Reproduction guide

This document is the build blueprint for **Khan Trig Companion · Unit 4
Equations & Identities Studio**. It is written so another agent can recreate the
app, its behaviour and its release without access to the original session.

The source of truth is always the code (`index.html`, `style.css`, `script.js`).
This guide records the *why*, the exact mathematical rules, the data tables and
the mistakes that were already fixed.

## 1. What "done" means

A finished copy must:

- run from `file://` and from GitHub Pages with no build step and no network;
- show the HUD, three tabs and three working canvas modules;
- switch every visible string between English and Thai;
- persist progress in `localStorage` and export the documented JSON;
- pass `node scripts/check.mjs` and `node scripts/browser-check.mjs`;
- work at 1440 px and 390 px without horizontal overflow;
- include README, AGENTS, CHANGELOG, LICENSE, state and the docs set.

## 2. Hard constraints

- Vanilla HTML5, CSS3, ES6 and HTML5 Canvas only.
- No frameworks, packages, CDNs, web fonts, analytics, remote images or runtime
  network calls.
- No build step and no server-side code.
- All mathematics is client-side and must stay exact where the UI claims exact
  values.
- The app must remain readable from `file://`, where `localStorage` is
  per-profile.

## 3. Ordered build plan

1. Create `index.html` with HUD, tab bar, three panels and IDs from §4.
2. Create `style.css` with the palette and layout from §5.
3. Implement state, i18n, helpers and canvas utilities in `script.js`.
4. Implement Module 1 (inverse functions) and verify the three failure states.
5. Implement Module 2 (identity lab) with data, choices and area model.
6. Implement Module 3 (equation solver) with templates, parser, set comparison,
   canvas reveal and step timers.
7. Wire tabs, language switching, persistence and export.
8. Add README, AGENTS, CHANGELOG and LICENSE; generate the state file.
9. Add release docs, static checker, CI and browser check.
10. Publish, tag, release and verify.

## 4. Page structure and IDs

HUD: `streakValue`, `bestValue`, `masteryValue`, `langToggle`, `langLabel`,
`exportBtn`.

Tabs/panels:

| Tab | Panel | State key |
| --- | ----- | --------- |
| `tab-inverse` | `panel-inverse` | `inverse` |
| `tab-identity` | `panel-identity` | `identity` |
| `tab-solver` | `panel-solver` | `solver` |

Module 1 IDs: `invCanvas`, `domMin`, `domMax`, `domMinOut`, `domMaxOut`,
`invInput`, `invInputOut`, `inputMin`, `inputMax`, `domainBadge`, `inputBadge`,
`principalDomain`, `principalRange`, `yourDomain`, `domainNote`, `resultEquation`,
`resDegrees`, `resRadians`, `resExact`, `inputNote`, and three `.fn-btn[data-fn]`
buttons.

Module 2 IDs: `modelCanvas`, `exprChips`, `currentExpr`, `stepPrompt`,
`choiceGrid`, `identityFeedback`, `progressDots`, `resetExpr`, `identityNote`.

Module 3 IDs: `solutionCanvas`, `solutionTitle`, `problemTag`, `problemText`,
`problemEquation`, `problemInstruction`, `answerForm`, `answerInput`,
`checkBtn`, `optionsGrid`, `answerHint`, `feedback`, `stepsBtn`, `stepsList`,
`newProblemBtn`, `quizStreak`, `quizBest`, `quizCorrect`, `quizMastery`,
`masteryFill`, `badgeGrid`, and three `.mode-btn[data-qmode]` buttons.

## 5. Visual system

Palette (CSS custom properties, also in `COLORS`):

| Token | Hex | Meaning |
| ----- | --- | ------- |
| `--sin` | `#FF5722` | sine |
| `--cos` | `#00E5FF` | cosine |
| `--tan` | `#B388FF` | tangent |
| `--one` | `#00E676` | the value 1 / inverse |
| `--theta` | `#FFD600` | angles |

Base: dark navy gradient, faint grid overlay, glass cards, 18 px radius, system
sans with Thai fallbacks, serif maths. Breakpoints: 1080 px, 760 px, 420 px.
Tabs are 3 columns on desktop and 1 column below 760 px.

Canvas contract: `makeStage(canvas, draw)` uses `ResizeObserver`, sets
`canvas.width = cssWidth * min(devicePixelRatio, 2)`, resets the transform and
draws in CSS pixels. Every draw function must return when `w` or `h` is 0.

## 6. Module 1 — inverse functions

### Function table

| Key | Function | Inverse | Principal domain | Range | Input range |
| --- | -------- | ------- | ---------------- | ----- | ----------- |
| `sin` | sin | arcsin | `[−π/2, π/2]` | `[−1, 1]` | `[−1.5, 1.5]` |
| `cos` | cos | arccos | `[0, π]` | `[−1, 1]` | `[−1.5, 1.5]` |
| `tan` | tan | arctan | `(−π/2, π/2)` | `ℝ` | `[−5, 5]` |

Domain endpoints are stored as integers `minK`, `maxK` in units of `π/12`
(range `−24..24`). `min = minK·π/12`, `max = maxK·π/12`.

State: `inverse: { fn, minK, maxK, input }`. Switching function resets to
`sin (-6, 6, 0.5)`, `cos (0, 12, 0.5)`, `tan (-6, 6, 1)`.

### Validity rules

```
validDomain = min < max
           && min >= pmin
           && max <= pmax

inputValid  = fn is tan ? true : |input| <= 1
theta       = inputValid ? inv(input) : NaN
inBranch    = validDomain && inputValid && min <= theta <= max
```

Three distinct messages:

- invalid domain → "not one-to-one";
- input outside range → "outside range" (arcsin/arccos only);
- input in range but angle outside branch → "outside branch".

Exact output uses `radToPi(theta, 12)`: if `theta` is a multiple of `π/12`, show
`piFrac(k, 12)`, else show four decimals. `piFrac` reduces `n/d` and uses `−`.

### Drawing

Canvas is split at `w * 0.52`.

Left panel:

- plot window `x = [−2π, 2π]`, `y = ±2` (sin/cos) or `±4.5` (tan);
- full curve in cyan at 35% alpha;
- principal branch band and curve in gold;
- branch endpoints as dots;
- active point at `(theta, input)` when `inBranch`, with a dashed drop line;
- x labels `−2π, −π, 0, π, 2π`; y labels `−1, 1` or `±2, ±4`.

Right panel:

- x window `[−1.6, 1.6]` or `[−5, 5]` for tan;
- y window `[−π, π]`;
- inverse curve sampled as `x = f(t)` for `t` from `min` to `max`, emerald;
- active point at `(input, theta)` with dashed guides;
- failure text wraps words to ~34 characters per line.

Dragging anywhere in the left panel maps the pointer x back to a domain angle,
then sets `input = clamp(f(angle), inputMin, inputMax)`, rounded to 0.01.

## 7. Module 2 — identity lab

### Data shape

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

Exactly one choice per step is correct. `state.identity = {expr, step, done}`;
`done` is true when `step >= steps.length`. Selecting a new expression resets
step/done. A reload resumes the saved step.

### Expression inventory

| ID | Initial | Final | Model | Steps |
| -- | ------- | ----- | ----- | ----- |
| `sin2cos2` | sin²θ + cos²θ | 1 | sin-cos | 1 |
| `sec2minusTan2` | sec²θ − tan²θ | 1 | tan-sec | 2 |
| `csc2minusCot2` | csc²θ − cot²θ | 1 | cot-csc | 2 |
| `sin3Plus` | sin³θ + sinθcos²θ | sinθ | sin-cos | 2 |
| `oneMinusCos2` | (1 − cos²θ)/sinθ | sinθ | sin-cos | 2 |
| `tanCos` | tanθ · cosθ | sinθ | sin-cos | 2 |
| `sec2minus1` | (sec²θ − 1)/tan²θ | 1 | tan-sec | 2 |

Each step's result is the case above; see `script.js` for the exact bilingual
prompts/explanations and distractor formulas.

### Area model

Use `θ = 40°`. Triangle: `P0 = (0,0)` (right angle), `P1 = (A,0)`,
`P2 = (0,B)`, hypotenuse `C = √(A²+B²)`.

| Model | A | B | C | Labels |
| ----- | - | - | - | ------ |
| sin-cos | sin θ | cos θ | 1 | sin²θ, cos²θ, 1 |
| tan-sec | 1 | tan θ | sec θ | 1, tan²θ, sec²θ |
| cot-csc | 1 | cot θ | csc θ | 1, cot²θ, csc²θ |

Squares:

- on side A (below): `(0,0), (A,0), (A,−A), (0,−A)`;
- on side B (left): `(0,0), (−B,0), (−B,B), (0,B)`;
- on hypotenuse outward: normal `n = (B/C, A/C)`;
  `P1+nC`, `P2+nC`, `P2`, `P1`.

Include every square point in the bounding box. Fit with padding 46:

```js
scale = min((w-2p)/rangeX, (h-2p)/rangeY);
ox = (w - rangeX*scale)/2 - minX*scale;
oy = (h - rangeY*scale)/2 + maxY*scale;   // plus, not minus
map(p) = { x: ox + p.x*scale, y: oy - p.y*scale };
```

Draw grid, squares with translucent fills and strokes, center captions
(`sin²θ`, `1`, `sec²θ`, …), a white triangle outline, a small right-angle mark,
and the identity title at the top. **Do not draw side chips inside the triangle**
— they collide with the square captions.

## 8. Module 3 — equation solver

State: `practice = { mode: 'basic'|'quadratic'|'identity', correct, attempts,
streak, best, byMode, badges }`.

### Basic templates

| Equation | Isolate | Ref | Solutions |
| -------- | ------- | --- | --------- |
| 2sinθ − 1 = 0 | sinθ = 1/2 | 30° | π/6, 5π/6 |
| 2cosθ + 1 = 0 | cosθ = −1/2 | 60° | 2π/3, 4π/3 |
| √3 tanθ − 3 = 0 | tanθ = √3 | 60° | π/3, 4π/3 |
| √2 cosθ − 1 = 0 | cosθ = √2/2 | 45° | π/4, 7π/4 |
| 2sinθ + √3 = 0 | sinθ = −√3/2 | 60° | 4π/3, 5π/3 |
| tanθ + 1 = 0 | tanθ = −1 | 45° | 3π/4, 7π/4 |
| sinθ = 1 | sinθ = 1 | 90° | π/2 |
| cosθ = −1 | cosθ = −1 | 0° | π |

### Quadratic templates

| Equation | Factored | Cases | Combined |
| -------- | -------- | ----- | -------- |
| 2cos²θ − cosθ − 1 = 0 | (2cosθ+1)(cosθ−1) | cos=−1/2 → 2π/3,4π/3; cos=1 → 0 | 0, 2π/3, 4π/3 |
| 2sin²θ − sinθ − 1 = 0 | (2sinθ+1)(sinθ−1) | sin=−1/2 → 7π/6,11π/6; sin=1 → π/2 | π/2, 7π/6, 11π/6 |
| 2cos²θ + cosθ − 1 = 0 | (2cosθ−1)(cosθ+1) | cos=1/2 → π/3,5π/3; cos=−1 → π | π/3, π, 5π/3 |
| 2sin²θ + sinθ − 1 = 0 | (2sinθ−1)(sinθ+1) | sin=1/2 → π/6,5π/6; sin=−1 → 3π/2 | π/6, 5π/6, 3π/2 |
| 4sin²θ − 1 = 0 | (2sinθ−1)(2sinθ+1) | sin=±1/2 → π/6,5π/6,7π/6,11π/6 | all four |
| cos²θ − 1 = 0 | (cosθ−1)(cosθ+1) | cos=1 → 0; cos=−1 → π | 0, π |

### Identity mode

Choose one of the seven expressions, offer four final-form options (one correct,
three drawn from `1, 0, sinθ, cosθ, tanθ, secθ, cscθ`), and show the step
explanations plus the area model. It is recognition, not free-form proof.

### Answer parsing and comparison

`parseSolutions(raw)`:

- split on commas/semicolons;
- remove spaces, normalise `−` to `-`;
- degrees (`120°`) convert with `×π/180`;
- `π`/`pi` terms accept an optional coefficient and denominator:
  `π`, `π/6`, `5π/6`, `2π`, `-π/4`;
- otherwise `Number(value)`;
- normalise every result to `[0, 2π)`.

`sameSolutionSet(given, expected)` requires equal lengths and a one-to-one match
within `0.02` (also accepting wraparound). Order must not matter.

### Steps and reveal

Each step has `{ en, th, reveal? }`. `revealSteps()` adds one `<li>` every
680 ms; the first step with `reveal: true` sets `revealedSolutions = true` and
redraws the circle. `resetStepAnimation()` clears all timers, hides the list and
sets `revealedSolutions = false`.

Basic/quadratic solution points are drawn on the unit circle with exact labels.
Identity mode draws the area model instead. Before reveal, the circle shows
"Press the steps button to reveal the intersections."

### Scoring

Correct: increment correct/streak/best/byMode, mark `completed.solver`, reveal
points, evaluate badges. Wrong: reset streak. Both disable the form/options until
a new problem. Mastery is `min(100, round(correct / 15 * 100))`.

## 9. Persistence and export

Key: `localStorage["khanTrigUnit4.v1"]`.

```json
{
  "version": 1,
  "lang": "en",
  "lastModule": "inverse",
  "inverse": { "fn": "sin", "minK": -6, "maxK": 6, "input": 0.5 },
  "identity": { "expr": "sec2minusTan2", "step": 0, "done": false },
  "practice": {
    "mode": "basic", "correct": 0, "attempts": 0, "streak": 0, "best": 0,
    "byMode": { "basic": 0, "quadratic": 0, "identity": 0 }, "badges": []
  },
  "completed": { "inverse": false, "identity": false, "solver": false },
  "updatedAt": null
}
```

Save debounced 250 ms, flushed on `beforeunload`, `visibilitychange`, tab switch,
grading and new problem. Export filename is exactly
`khan_trig_unit4_progress.json`; payload includes app name, version, exportedAt,
language, lastModule, masteryPercent, progress, settings and credits.

## 10. Internationalisation

- 93 keys in each of `en` and `th`; identical sets.
- Static text: `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`.
- Dynamic text: `t('key')`, `L(en, th)`, or bilingual data fields.
- Never freeze a translated sentence into a generated problem at creation time:
  render the rounding/instruction note from the current language.
- Thai glossary: ฟังก์ชันตรีโกณมิติผกผัน, เอกลักษณ์พิทาโกรัส, คำตอบทั่วไป,
  โดเมน, เรนจ์, สาขาหลัก, หนึ่งต่อหนึ่ง, มุมอ้างอิง, แยกตัวประกอบ, เอกลักษณ์,
  คำตอบ.

## 11. Accessibility

Labelled controls, native range inputs, keyboard tabs (arrow/Home/End), visible
focus, `role="status"` on feedback, `aria-live="polite"`, canvas `role="img"`
labels, reduced-motion CSS, and stacked mobile layout. Sliders are the keyboard
alternative to dragging.

## 12. Verification

```bash
node --check script.js
node scripts/check.mjs          # 16 static checks
node scripts/browser-check.mjs  # 15 headless Chrome checks
```

`browser-check.mjs` launches Chrome with a temporary profile, drives the app over
the DevTools Protocol and asserts: arcsin π/6, out-of-range and bad-domain states,
two identity steps, a basic equation and steps, a quadratic equation, an identity
proof, Thai switch, reload persistence, JSON export, mobile overflow and no
uncaught exceptions.

## 13. Publishing

1. `git init -b main`, commit, create the public repo
   `khan-trig-unit4-equations-identities-studio` under `somphol`.
2. Push `main`, enable GitHub Pages from `main` / root.
3. Wait for HTTP 200 on the Pages URL, then verify `style.css`, `script.js`,
   `assets/hero.jpg` and `state.json`.
4. Create the state file, commit, tag `v1.0.0`, push the tag.
5. Create a GitHub Release from the tag using the changelog section.
6. Set the repository homepage to the Pages URL and add the topic list.
7. For documentation releases: bump README/AGENTS/CITATION/CHANGELOG, tag
   `v1.0.1`, release, and run the CI workflow.

## 14. Fixed pitfalls (do not reintroduce)

1. **Area-model sign error.** The canvas projection was
   `oy = … - maxY*scale`, which pushed the model off-canvas. It must be
   `+ maxY*scale`.
2. **Side chips inside the area model.** They overlapped the square captions;
   only square captions are drawn.
3. **Identity options not re-rendered after grading.** Call `handleResult()` and
   then `renderOptions()` so correct/wrong/disabled states apply.
4. **Translated instructions frozen at generation.** Basic/quadratic problems
   used `t()` when built. Instructions must be rendered from keys at display
   time.
5. **Identity step `en` text frozen to the current language.** Use
   `step.explainEn` for English, never `state.lang ? …`.
6. **Basic rule step frozen.** Use `ruleEn` for English and `ruleTh` for Thai.
7. **Wrong answers left the form re-enabled while `answered` stayed true.**
   Keep the form disabled after grading; a new problem re-enables it.
8. **Answer comparison by string.** Compare sets modulo 2π; accept π, decimals
   and degrees.
9. **Domain validity.** A domain is not valid merely because `min < max`; it
   must sit inside the principal branch.
10. **Step timers.** Always clear them on hide/new problem, or a later problem
    reveals stale points.

## 15. Definition of done

- All three modules behave as above at 1440 px and 390 px.
- `node scripts/check.mjs` exits 0.
- `node scripts/browser-check.mjs` exits 0 with 15/15.
- EN/TH switch has no frozen English strings.
- Reload restores language, identity step, scores and completed tabs.
- Export is valid JSON with the fixed filename.
- README, AGENTS, CHANGELOG, LICENSE, state and docs are present.
- Pages URL is live and the release tag exists.
