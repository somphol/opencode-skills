# AGENTS.md

## 1. What this is

A static, offline teaching app for Khan Academy Trigonometry Unit 4. One page, three interactive studios: inverse functions with restricted domains, a Pythagorean-identity simplification lab, and an equation/identity practice sandbox. It produces no build output and talks to no server; it is not a Khan Academy clone, a course platform, or a graded assessment tool.

Current release: **v1.0.2** (2026-11-03) — reproducibility docs and headless acceptance checks after the 1.0.1 documentation release.

Live copy: <https://somphol.github.io/khan-trig-unit4-equations-identities-studio/>
Local master: `~/Projects/khan-trig-unit4-equations-identities-studio`

## 2. Commands

```bash
# run (no install, no build)
python3 -m http.server 8080
# then open http://localhost:8080

# quality gates (also run in CI)
node --check script.js
node scripts/check.mjs

# full browser acceptance (needs Node 22+ and Chrome)
node scripts/browser-check.mjs

# deploy = push to main; GitHub Pages serves the repo root
git push origin main
```

Opening `index.html` via `file://` also works. CI runs static checks; manual verification follows [docs/TESTING.md](docs/TESTING.md). The 1.0.0 browser verification used headless Chrome over the DevTools protocol and produced zero console errors.

## 3. Architecture

Load order is `index.html` → `style.css` → `script.js`. `script.js` is one IIFE:

1. `I18N` dictionaries (`en`, `th`), `t()` and `L(en, th)`.
2. `DEFAULT_STATE`, `loadState`/`saveState` (localStorage key `khanTrigUnit4.v1`).
3. Helpers: `piFrac`, `radToPi`, `fmt`, `rgba`.
4. Inverse engine: `FUNCS`, `inverseState`, `drawInverse`, `renderInverse`.
5. Identity engine: `EXPRESSIONS`, `renderIdentity`, `chooseIdentity`, `drawAreaModel`.
6. Practice engine: templates, generators, parser, `renderPracticeCanvas`, `revealSteps`.
7. Tabs (`showModule`), i18n (`applyI18n`), export, boot.

Canonical detail — state shape, principal domains, identity step data, answer-set parsing, timer cleanup — is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). A step-by-step rebuild blueprint, exact content tables and the fixed pitfalls are in [docs/REPRODUCTION.md](docs/REPRODUCTION.md) and [docs/CONTENT.md](docs/CONTENT.md). `style.css` follows the semantic palette (`--sin`, `--cos`, `--tan`, `--one`, `--theta`). `state.json` is a historical build record, **not** runtime state.

## 4. Decisions and constraints

- **Keep the five colours semantic.** Coral is sine, cyan is cosine, violet is tangent, emerald is the value 1 / the inverse, yellow is angles. The graphs, area model and badges depend on this.
- **Principal domains live in `FUNCS`.** sin `[−π/2, π/2]`, cos `[0, π]`, tan `(−π/2, π/2)`, with ranges `[−1, 1]`, `[−1, 1]`, `ℝ`. A domain is valid only when it is contained in the principal branch; an input is valid only when it is in the original function's range.
- **Domain sliders store multiples of π/12** (`minK`, `maxK`). Never store pixels or rounded decimals for the branch endpoints; exact display comes from `piFrac`.
- **The inverse curve is sampled as `x = f(t)`** over the chosen domain. Keep the curve and the active point in sync.
- **Identity steps are data.** Each `EXPRESSIONS` entry lists prompts, bilingual explanations, exactly one correct choice per step, and the resulting expression. Add data, not one-off UI branches.
- **Only square captions appear in the area model.** Side chips collide with the square labels inside the small triangle; do not reintroduce them.
- **Equation answers are sets.** The parser accepts `π/6`, `5π/6`, `0.5236` and degrees; comparison normalises modulo 2π and ignores order. Do not switch to string equality.
- **Step reveal uses timers.** `resetStepAnimation()` must clear every timeout and hide revealed solutions before a new problem.
- **Canvas scaling:** every canvas uses a `ResizeObserver` and a DPR clamp of 2. Hidden panels resize when shown.
- **i18n must stay symmetric:** every key exists in both `en` and `th`; static text uses `data-i18n*`, dynamic text uses `t()`/`L()`/bilingual data.
- **Persistence is best-effort:** storage failures are swallowed so private mode still works in memory. The export filename is fixed at `khan_trig_unit4_progress.json`.
- **No dependencies and no network calls.** Do not add a framework, CDN, web font, analytics or remote image. The app must work from `file://`; CI rejects remote runtime assets and network APIs.
- **Docs and workflow are part of the release.** A behaviour change updates the matching doc and, when relevant, the changelog.
- **`state.json` is a snapshot.** It records the 1.0.0 build session and is not written by the app or later releases.

## 5. Known issues

- The inverse canvas is information-dense; at very narrow widths the axis labels and drag hint sit close together.
- The area model is qualitative, not numerically to scale for every expression; square captions carry the exact meaning.
- Identity practice reuses the seven lab expressions; it is a recognition check, not a free-form proof editor.
- Basic/quadratic answer lists accept radians or degrees, but mixed formats in one submission are not supported.
- Thai copy is longer than English; very narrow screens wrap rather than truncate.
- `localStorage` on `file://` is per-browser-profile and can behave differently from an HTTP origin.
- No cross-browser automation ships with the repo; Safari and Firefox are expected to work but are not formally verified.

## 6. Continuity

Deployed at <https://somphol.github.io/khan-trig-unit4-equations-identities-studio/>, served by GitHub Pages from `main` / repository root. The local working copy is `~/Projects/khan-trig-unit4-equations-identities-studio`. Release tags follow SemVer; see [docs/RELEASE.md](docs/RELEASE.md) before tagging. If `state.json` is stale, it describes the original 1.0.0 build, not the current commit; add a new record instead of rewriting history.
