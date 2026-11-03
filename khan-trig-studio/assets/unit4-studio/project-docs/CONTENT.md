# Content inventory

Exact data that drives the UI, so a rebuild does not have to reverse-engineer it
from the source. Strings live in `script.js` (`I18N`); this file records the
shape and the mathematical content.

## Identity expressions

| ID | Initial | Final | Model | Steps |
| -- | ------- | ----- | ----- | ----- |
| `sin2cos2` | sin²θ + cos²θ | 1 | sin-cos | 1 |
| `sec2minusTan2` | sec²θ − tan²θ | 1 | tan-sec | 2 |
| `csc2minusCot2` | csc²θ − cot²θ | 1 | cot-csc | 2 |
| `sin3Plus` | sin³θ + sinθcos²θ | sinθ | sin-cos | 2 |
| `oneMinusCos2` | (1 − cos²θ) / sinθ | sinθ | sin-cos | 2 |
| `tanCos` | tanθ · cosθ | sinθ | sin-cos | 2 |
| `sec2minus1` | (sec²θ − 1) / tan²θ | 1 | tan-sec | 2 |

Step results, in order:

- `sin2cos2`: `1`
- `sec2minusTan2`: `1 + tan²θ − tan²θ`, then `1`
- `csc2minusCot2`: `1 + cot²θ − cot²θ`, then `1`
- `sin3Plus`: `sinθ(sin²θ + cos²θ)`, then `sinθ`
- `oneMinusCos2`: `sin²θ / sinθ`, then `sinθ`
- `tanCos`: `(sinθ / cosθ) · cosθ`, then `sinθ`
- `sec2minus1`: `tan²θ / tan²θ`, then `1`

Each step has three choices; exactly one is correct. The incorrect choices are
deliberate near-misses (wrong sign, wrong identity, cancelling unlike terms).

## Basic equation templates

| Equation | Isolate | Reference | Exact solutions |
| -------- | ------- | --------- | --------------- |
| `2sinθ − 1 = 0` | `sinθ = 1/2` | 30° | π/6, 5π/6 |
| `2cosθ + 1 = 0` | `cosθ = −1/2` | 60° | 2π/3, 4π/3 |
| `√3 tanθ − 3 = 0` | `tanθ = √3` | 60° | π/3, 4π/3 |
| `√2 cosθ − 1 = 0` | `cosθ = √2/2` | 45° | π/4, 7π/4 |
| `2sinθ + √3 = 0` | `sinθ = −√3/2` | 60° | 4π/3, 5π/3 |
| `tanθ + 1 = 0` | `tanθ = −1` | 45° | 3π/4, 7π/4 |
| `sinθ = 1` | `sinθ = 1` | 90° | π/2 |
| `cosθ = −1` | `cosθ = −1` | 0° | π |

## Quadratic-form templates

| Equation | Factored form | Cases | Combined solutions |
| -------- | ------------- | ----- | ------------------ |
| `2cos²θ − cosθ − 1 = 0` | `(2cosθ + 1)(cosθ − 1) = 0` | cosθ = −1/2 → 2π/3, 4π/3; cosθ = 1 → 0 | 0, 2π/3, 4π/3 |
| `2sin²θ − sinθ − 1 = 0` | `(2sinθ + 1)(sinθ − 1) = 0` | sinθ = −1/2 → 7π/6, 11π/6; sinθ = 1 → π/2 | π/2, 7π/6, 11π/6 |
| `2cos²θ + cosθ − 1 = 0` | `(2cosθ − 1)(cosθ + 1) = 0` | cosθ = 1/2 → π/3, 5π/3; cosθ = −1 → π | π/3, π, 5π/3 |
| `2sin²θ + sinθ − 1 = 0` | `(2sinθ − 1)(sinθ + 1) = 0` | sinθ = 1/2 → π/6, 5π/6; sinθ = −1 → 3π/2 | π/6, 5π/6, 3π/2 |
| `4sin²θ − 1 = 0` | `(2sinθ − 1)(2sinθ + 1) = 0` | sinθ = ±1/2 → π/6, 5π/6, 7π/6, 11π/6 | all four |
| `cos²θ − 1 = 0` | `(cosθ − 1)(cosθ + 1) = 0` | cosθ = 1 → 0; cosθ = −1 → π | 0, π |

## Identity-proof options

The solver picks one expression above, then builds four options: the correct
final form plus three distractors drawn from
`1, 0, sinθ, cosθ, tanθ, secθ, cscθ` (excluding the correct one). The area model
matches the expression's `model`.

## Badges

| ID | Icon | Condition | English | Thai |
| -- | ---- | --------- | ------- | ---- |
| `first` | 🌟 | correct ≥ 1 | First Identity | เอกลักษณ์แรก |
| `streak3` | 🔥 | best ≥ 3 | On a Roll · 3 | ต่อเนื่อง 3 |
| `streak5` | ⚡ | best ≥ 5 | Unstoppable · 5 | หยุดไม่อยู่ 5 |
| `basic3` | 🎯 | basic correct ≥ 3 | Angle Hunter | นักล่ามุม |
| `quadratic3` | 🧩 | quadratic correct ≥ 3 | Factor Finder | นักแยกตัวประกอบ |
| `identity3` | ≡ | identity correct ≥ 3 | Identity Architect | สถาปนิกเอกลักษณ์ |
| `master` | 🏆 | correct ≥ 15 | Unit 4 Master | ปรมาจารย์ยูนิต 4 |

## i18n keys

93 keys per locale, grouped as:

- **Common (14):** appTitle, unitLabel, appSubtitle, streak, best, mastery,
  export, exportTitle, exportDone, navInverse, navIdentity, navSolver,
  footerBuilt, degrees/radians/exact (17 with the three maths labels).
- **Inverse (28):** title/desc/goal, legend ×4, hint, domain labels, input,
  branch labels, result labels, statuses, notes, undefined.
- **Identity (12):** title/desc/goal, current, reset, why, correct, wrong, done,
  stepOf.
- **Practice (37):** title/desc/goal, mode labels, new, answer UI, hint,
  steps, progress, correct, mastery hint, badges, circle/model, feedback,
  invalid, badge unlocked, tags, prompts, instructions, step/of, reveal.
- **Badges (7).**

The exact English and Thai strings are in `script.js`; `scripts/check.mjs`
asserts that the key sets are identical and that every referenced key exists.

## Export payload

`buildExport()` returns:

```json
{
  "app": "Khan Trig Companion — Unit 4 Equations & Identities Studio",
  "stateVersion": 1,
  "exportedAt": "ISO-8601",
  "language": "en|th",
  "lastModule": "inverse|identity|solver",
  "masteryPercent": 0,
  "progress": {
    "streak": 0, "bestStreak": 0, "totalCorrect": 0, "totalAttempts": 0,
    "correctByMode": { "basic": 0, "quadratic": 0, "identity": 0 },
    "badges": [{ "id": "first", "name": "First Identity" }],
    "modulesCompleted": { "inverse": false, "identity": false, "solver": false }
  },
  "settings": {
    "inverse": { "fn": "sin", "minK": -6, "maxK": 6, "input": 0.5 },
    "identity": { "expr": "sec2minusTan2", "step": 0, "done": false }
  },
  "credits": {
    "builtWith": "OpenCode",
    "model": "DeepSeek V4.1 Flash (opencode-go/deepseek-v4.1-flash)"
  }
}
```

## Files and sizes at 1.0.0

| File | Lines |
| ---- | ----- |
| `index.html` | 321 |
| `style.css` | 787 |
| `script.js` | 1989 |
| `README.md` | 75 |
| `AGENTS.md` | 70 |
| `CHANGELOG.md` | 39 |

## Local storage key

`khanTrigUnit4.v1`. Progress is per browser profile and per origin; `file://`
and `http://` do not share state.
