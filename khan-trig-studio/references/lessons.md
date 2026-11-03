# Lessons — regressions across four units

Every entry is a bug that actually shipped once and was fixed. Check new work
against this list.

## Geometry and canvas

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Drag snaps to 0° in the lower half of a circle | `clamp(atan2(...), 0, 360)` before normalising | `((deg % 360) + 360) % 360`, then clamp |
| Triangle shrinks or disappears at scale extremes | mixing stored pixel coordinates with new scale | derive all coordinates from θ/scale each draw |
| Canvas blank after tab switch | hidden panel had zero size at first draw | `stage.resize()` on `requestAnimationFrame` after showing |
| Thick/blurry lines | DPR not applied | set backing store to `css × min(dpr, 2)` and transform |
| Labels clipped at canvas edge | fixed offsets | clamp label x/y or flip side based on position |
| Labels overlap | side chips inside a small triangle | remove redundant labels or move to square centers |
| Area model off-canvas | projection `oy = … − maxY*scale` | use `oy = … + maxY*scale` |
| Wave disconnects from circle | circle angle not `B(x−C)` | sample the same phase for both views |
| Equation missing parentheses | `y = A sin(Bx + C)` vs `B(x−C)` | always print `B(x − C)` when C ≠ 0 |
| Canvas text stays English in Thai | hardcoded string | route words through `t()`/`L()` |

## Maths and state

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Ratio readout contradicts the fraction | displayed ratio from `Math.sin`, sides from geometry | compute ratios from the displayed a/b/c |
| Two-triangle SSA shows impossible C | accepting every `B` | keep only `C = 180−A−B > 0` |
| SSS draws a triangle that cannot exist | no inequality check | enforce all three triangle inequalities |
| Wrong answer accepted | string comparison or wrong normalisation | compare sets modulo 2π with tolerance |
| `2π` marked different from `0` | no normalisation | normalise both to `[0, 2π)` |
| Translation freezes at generation | `t()` called while building a problem | store bilingual data; render notes from keys |
| English step text turns Thai | generation used `state.lang` for the `en` field | always fill `en` with English |
| Input disabled but form accepts retry | `answered` stayed true while re-enabling | keep form disabled after grading; new problem resets |
| Identity options stay enabled after grading | `renderOptions()` before `answered = true` | render options after `handleResult()` |
| Domain "valid" though not one-to-one | only checked min < max | require domain ⊆ principal branch |

## Persistence and lifecycle

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Progress lost on reload | save debounce not flushed | flush on beforeunload/visibilitychange |
| Step animation reveals stale points | timers not cleared | `resetStepAnimation()` clears all timeouts |
| Hidden tab keeps animating | rAF not stopped | check `lastModule` and `document.hidden`; stop/start |
| Export filename differs | hardcoded per unit | fixed documented filename per unit |
| State file overwritten by later docs release | treating it as live | keep `state.json` as a historical snapshot |

## Tooling and release

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Static check skips `.github` | `startsWith('.git')` | compare `=== '.git'` |
| CI passes but browser fails | CI runs static only | run `browser-check.mjs` locally before release |
| Browser check is flaky | expected fixed step count for a 1-step identity | assert `>= 2` explanation rows |
| Catalog omits nested docs | sync skips any `docs` directory | name the asset `project-docs`; scaffold renames it |
| Catalog omits dotfiles | sync skips dotfiles | scaffold recreates `.nojekyll`, `.editorconfig`, `.gitignore` |
| Repeated Keychain prompts | one credential read per push | read once per push into a variable; never per API call |
| Pages 404 immediately after push | build takes ~30–60 s | poll the URL, then check assets |
| Docs release rewrites state metrics | editing `state.json` | add a new doc release; do not rewrite the snapshot |

## Content traps

- `cosθ = −1` has reference angle 0°, not 180°.
- `tan 90°` and `tan 270°` are undefined; do not show a huge decimal.
- `arcsin`/`arccos` accept only inputs in `[−1, 1]`.
- A valid input can still sit outside a narrowed principal branch.
- `sin²θ + cos²θ = 1` is not an area of a square; use the right-triangle area
  model.
- `sec²θ − tan²θ = 1` requires `sec²θ = 1 + tan²θ`, not `1 − tan²θ`.
- Random templates must not create invalid triangles or C ≤ 0.
- A one-step identity has two explanation rows: the step and the simplified
  form.

## Process traps

- Do not ship a reference template unchanged; replace module content.
- Do not claim exactness for arbitrary decimals.
- Do not add a framework or CDN for convenience.
- Do not commit a state file with machine paths or secrets.
- Do not publish a skill before scaffolding from a clean directory and running
  its checks.
