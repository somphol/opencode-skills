# Build log — the four-unit series

These are the actual build records from the sessions that produced the series.
They are useful for calibration, not as quotas.

| Unit | Build time | Total tokens | Input | Output | Reasoning | Cache read | Cost |
| ---- | ---------- | ------------ | ----- | ------ | --------- | ---------- | ---- |
| 1 Right Triangle | 9m 34s | 3,537,553 | 233,849 | 53,703 | 46,611 | 3,201,536 | $0 |
| 2 Trigonometric Functions | 11m 17s | 7,758,520 | 100,661 | 46,555 | 36,776 | 7,574,528 | $0 |
| 3 Non-Right Triangles | 9m 50s | 12,510,854 | 96,116 | 48,360 | 31,786 | 12,334,592 | $0 |
| 4 Equations & Identities | 12m 26s | 15,437,023 | 109,123 | 55,792 | 39,596 | 15,232,512 | $0 |

Token totals include cache reads, which dominate. Each unit's usage is a delta
from that unit's start snapshot in the shared session; do not compare raw
cumulative counters.

## Chronology

1. **Unit 1** established the series: dark neon palette, 4 canvas modules,
   bilingual HUD, local progress, export, AGENTS + README, then a professional
   docs/CI release (`v1.0.1`).
2. **Unit 2** moved to circular motion and waves: unit circle, linked sine
   animation, exact-value quiz. Fixed a negative-angle drag bug, missing wave
   parentheses and a canvas `rgba()` type error before release. Docs release
   `v1.0.1`.
3. **Unit 3** added SSA ambiguity and surveying: dual triangle overlays,
   Law of Cosines live algebra, animated map solutions. Fixed label clipping and
   language-frozen prompts. Docs release `v1.0.1`.
4. **Unit 4** added inverse functions, identity simplification and equation
   solving: principal branches, area models, answer sets. Fixed an area-model
   projection sign, label collisions and option re-render ordering. Docs release
   `v1.0.1`; reproducibility release `v1.0.2` with `REPRODUCTION`, `CONTENT`,
   `SESSION_LOG` and a committed browser check.

## Decisions that held up

- Single-page vanilla app, no build; repository root is the artifact.
- One IIFE in `script.js`; sections in a predictable order.
- Semantic palette per unit, reused everywhere.
- Canvas stages with DPR clamp and ResizeObserver.
- Exact maths generated from formulas and small template tables.
- State in one localStorage key; export fixed filename.
- Bilingual data in the source, not a runtime translation service.
- Static checker + browser acceptance check; docs release after the app.
- `state.json` as a historical snapshot, never rewritten by docs.

## What was expensive

- Getting exact-vs-decimal displays consistent with the drawn geometry.
- Ambiguous SSA candidate filtering and overlays.
- Area-model fit and label placement.
- Freezing translations into generated problem strings.
- Keeping canvas/HUD/card layouts readable at 390 px.
- Making a headless test suite deterministic without internal hooks.

## What to do differently

- Write the answer-set parser and test maps before the practice UI.
- Decide the label strategy before drawing the area model.
- Keep all dynamic strings as bilingual data from the start.
- Add the browser check earlier; it catches more than the static checker.
- Write REPRODUCTION/SESSION_LOG at the end of the build, while the defects are
  fresh.

## Continuity

The four live projects:

- `https://somphol.github.io/khan-trig-unit1-right-triangle-studio/`
- `https://somphol.github.io/khan-trig-unit2-trigonometric-functions-studio/`
- `https://somphol.github.io/khan-trig-unit3-non-right-triangles-studio/`
- `https://somphol.github.io/khan-trig-unit4-equations-identities-studio/`

The Unit 4 repository is the reference asset in this skill. The local copies
under `~/Projects/khan-trig-unit*` are the masters.
