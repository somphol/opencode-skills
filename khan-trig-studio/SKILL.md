---
name: Khan Trig Studio
description: Build a bilingual, offline, canvas-based Khan Trig Companion studio with three interactive modules, exact math, practice persistence, headless checks and a GitHub Pages release.
version: 1.0.0
---

# Khan Trig Studio

Build a Khan Academy–style trigonometry companion as one static, offline page:
three interactive canvas modules, English ⇄ Thai UI, exact mathematical values,
practice with streaks and badges, `localStorage` progress, JSON export, and a
professional GitHub Pages release.

This skill packages the finished **Unit 4 Equations & Identities Studio** as a
working reference and the knowledge from building Units 1–4. Use it to build a
new unit or adapt the pattern to another maths topic.

## When to use

- A user asks for a Khan Academy companion, trig unit, interactive maths booklet,
  or a canvas-based lesson with multiple modules.
- The result must run from `file://` and GitHub Pages with no frameworks, build
  step or network calls.
- The UI must switch between English and Thai and keep scores locally.
- You need a proof-driven, testable release rather than a static mockup.

**Not for:** 3D city miniatures (`city-miniature`), generic marketing sites,
server-backed courses, accounts, or anything that needs a real CAS/symbolic
solver. The maths must be generated and checked in JavaScript.

## Quick start

```sh
node scripts/new-project.mjs \
  --out ~/Projects/khan-trig-unit5 \
  --unit 5 \
  --title "Unit 5 Advanced Identities Studio" \
  --title-th "ห้องปฏิบัติการเอกลักษณ์ขั้นสูง" \
  --slug khan-trig-unit5 \
  --owner <github-user>

cd ~/Projects/khan-trig-unit5
node scripts/check.mjs
node scripts/browser-check.mjs
```

The scaffold copies the Unit 4 reference implementation, rebrands the unit/title/
URLs, restores dotfiles and writes a pending `state.json` and session log. It
runs as-is; then replace the module content with the new unit.

## Workflow

1. **Define the unit.** Write the three module goals and the exact maths each
   one will compute. Read `references/units.md` for the four existing units.
2. **Scaffold** with the command above. Keep the shared HUD, tabs, state, i18n,
   canvas helpers, export and release tooling.
3. **Replace module content** in `index.html`, `style.css` and `script.js`.
   Keep three tabs, three panels, the semantic palette and the state shape.
4. **Write the maths before the UI.** Put exact-value and equation logic in pure
   functions; the DOM and canvas should only render those results.
5. **Bilingual pass.** Add both `en` and `th` entries; never freeze a translated
   sentence into generated problem data.
6. **Verify** with `node scripts/check.mjs` (17 static checks) and
   `node scripts/browser-check.mjs` (15 headless Chrome checks). Add test rows
   for the new module.
7. **Document and release.** Update README, AGENTS, CHANGELOG, CITATION, testing
   and reproduction docs; record the build in `state.json`; publish to Pages.
8. **Prove reproducibility.** From a clean directory, scaffold again and run the
   static and browser checks. A skill is not reusable until that passes.

## Module map of the reference implementation

`assets/unit4-studio/` is the Unit 4 app, not a blank starter.

| Tab | Module | What it demonstrates |
| --- | ------ | -------------------- |
| 01 | Inverse functions & restricted domains | Dual graph, principal branch, validity badges, draggable point |
| 02 | Pythagorean identities & simplification | Data-driven choices, progress, area-model squares |
| 03 | Equation solver | Templates, answer-set parser, unit-circle reveal, identity proof options |

Use it for: canvas split layouts, exact-value formatting (`piFrac`, `radToPi`),
answer-set comparison, state persistence, badge logic and the release docs.

## Core recipes

### Add a module

1. Add a tab `data-module="new"`, a panel `id="panel-new"`, and a state field.
2. Add `drawNew()` and `const newStage = makeStage(canvas, drawNew)`.
3. Register the panel in `showModule()`; call `newStage.resize()` on activation.
4. Add `data-i18n` keys in both dictionaries.
5. Mark completion with `completeModule('new')` on meaningful interaction.
6. Draw in CSS pixels; return early when `w` or `h` is 0.

### Keep maths honest

- Derive ratios, angles and solutions from displayed values, not from
  pre-rounded constants.
- Use exact π fractions where the UI claims exactness; show decimals as a
  secondary value.
- Test the boundary cases: undefined, zero, one solution, two solutions, invalid
  domain, invalid triangle, principal branch limits, 0/2π equivalence.
- Never hardcode an answer table per generated question when a formula and a
  small template table will do.

### Bilingual UI

- Static: `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`.
- Dynamic: `t('key')`, `L(en, th)`, or bilingual fields `promptEn`/`promptTh`.
- Render instructions and rounding notes at display time from keys, not at
  problem-generation time.
- Keep a glossary for Thai maths terms in the project's design doc.

### Answer checking

- Parse numbers, π fractions and degrees; normalise modulo 2π.
- Compare sets, not strings; order must not matter.
- Use a small tolerance (0.02 for radians, 0.1–0.2 for rounded lengths).
- Disable the form after grading; a new problem re-enables it.

### Canvas

- `makeStage(canvas, draw)` handles DPR, resize and hidden panels.
- Use a fit transform for arbitrary triangles/curves; never store pixels in
  state.
- Labels need edge clamping and background chips; remove labels that collide
  with larger captions.
- Fetch canvas text through `t()`/`L()` when it contains words.

## Verification

```sh
node --check script.js
node scripts/check.mjs           # files, ids, tabs, i18n parity, colours, links, state
node scripts/browser-check.mjs   # 15 acceptance checks, needs Node 22+ and Chrome
```

`browser-check.mjs` launches a temporary Chrome profile over the DevTools
Protocol. It checks inverse states, identity steps, basic/quadratic/identity
practice, Thai switching, reload persistence, JSON export, mobile overflow and
uncaught exceptions. Extend it when adding a module.

## Documentation and release

Every project should carry: README, AGENTS.md, CHANGELOG, LICENSE, CITATION,
CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, ROADMAP, `.editorconfig`,
GitHub issue/PR templates, a CI workflow, a static checker, `docs/ARCHITECTURE`,
`DESIGN`, `TESTING`, `DEPLOYMENT`, `ACCESSIBILITY`, `RELEASE`, `REPRODUCTION`,
`CONTENT`, `SESSION_LOG`, and `state.json`.

See `references/release.md` for the GitHub flow without `gh`, the Pages API,
tag/release steps and state-file measurement.

## Reference files

- `references/method.md` — shared architecture, state, i18n, canvas patterns.
- `references/units.md` — Unit 1–4 module specs, formulas and pitfalls.
- `references/lessons.md` — regressions that actually happened across four units.
- `references/verification.md` — test matrix, CDP method, acceptance criteria.
- `references/release.md` — docs set, state schema, GitHub publishing.
- `references/build-log.md` — series timeline, token/time metrics, decisions.
- `scripts/new-project.mjs` — scaffold from the Unit 4 reference.
- `scripts/verify.mjs` — run static and browser checks in a project.

## Failure boundaries

- Not a symbolic algebra system. If the task needs arbitrary proof search or CAS
  output, use a different tool.
- Not a multi-user or server-backed product. No accounts, database or grading
  backend.
- The browser check needs Chrome and Node 22+; CI runs only static checks.
- The reference asset is Unit 4. A new unit still needs its own curriculum,
  module content and verification rows; do not ship Unit 4 content unchanged.
- Do not claim exact values unless the code produces exact fractions; use
  decimals otherwise.
