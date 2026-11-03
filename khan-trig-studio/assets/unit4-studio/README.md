# Khan Trig Companion · Unit 4 Equations & Identities Studio

An interactive, bilingual companion for **Khan Academy Trigonometry, Unit 4: Trigonometric Equations & Identities**. Students discover why inverse functions need restricted domains, build algebraic simplifications one legal step at a time, and solve equations with every solution revealed on the unit circle.

**Version 1.0.2** · [Live demo](https://somphol.github.io/khan-trig-unit4-equations-identities-studio/) · MIT · No build step

![Screenshot of the inverse functions module](assets/hero.jpg)

## The three studios

| # | Module | What it teaches |
|---|--------|-----------------|
| 01 | **Inverse Functions & Restricted Domains** | Original sine/cosine/tangent curves beside their inverse curves, with draggable principal-branch points, domain sliders and instant valid/undefined badges. |
| 02 | **Pythagorean Identities & Simplification Lab** | Seven expressions, one legal substitution at a time, with immediate feedback and a geometric area model for the three Pythagorean identities. |
| 03 | **Equation Solver** | Basic equations, quadratic-form factoring and identity proofs, with comma-separated answer checking and animated unit-circle intersections. |

## Features

- **Principal branches, visually** — the restricted domain is a gold band on the original curve; the inverse is drawn only when the domain is one-to-one.
- **Undefined states are explicit** — an input outside `[−1, 1]` makes arcsin/arccos undefined; an angle outside the chosen branch is flagged separately.
- **Exact inverse values** — `arcsin(0.5) = π/6`, `arccos(0.5) = π/3` and `arctan(1) = π/4` appear alongside degrees and decimals.
- **Step-by-step algebra** — the identity lab accepts only substitutions that follow from an identity and shows the transformed expression after each correct step.
- **Area-model proof** — squares on the sides of a right triangle are labelled `sin²θ`, `cos²θ`, `1`, `tan²θ`, `sec²θ` and so on.
- **All solutions, not one** — equation answers are checked as a set; `π/6, 5π/6` and decimal equivalents both work.
- **Animated unit circle** — each revealed solution appears as an intersection point with its exact angle label.
- **Bilingual HUD (EN ⇄ TH)** — ฟังก์ชันตรีโกณมิติผกผัน, เอกลักษณ์พิทาโกรัส and คำตอบทั่วไป throughout.
- **Progress persistence** — streak, best streak, correct counts, mode, expression step and completed modules are saved to `localStorage`.
- **Export** — `💾 Export Progress JSON` downloads `khan_trig_unit4_progress.json`.
- **Accessibility** — labelled controls, keyboard tabs, visible focus rings, ARIA live feedback and reduced-motion support.
- **Offline and static** — no frameworks, CDN, fonts to download or network requests at runtime.

## Run locally

No install and no build step.

```bash
git clone https://github.com/somphol/khan-trig-unit4-equations-identities-studio.git
cd khan-trig-unit4-equations-identities-studio
python3 -m http.server 8080
```

Open <http://localhost:8080>. Opening `index.html` directly also works.

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | State, inverse engine, identity data, answer-set parser, extension recipes |
| [docs/REPRODUCTION.md](docs/REPRODUCTION.md) | Step-by-step rebuild blueprint, exact rules, fixed pitfalls |
| [docs/CONTENT.md](docs/CONTENT.md) | Identity, equation, badge and export inventories |
| [docs/SESSION_LOG.md](docs/SESSION_LOG.md) | Build time, token accounting, fixes and publishing record |
| [docs/DESIGN.md](docs/DESIGN.md) | Pedagogy, colour matrix, Thai glossary, interaction decisions |
| [docs/TESTING.md](docs/TESTING.md) | Automated checks, verified matrix, manual regression list |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub Pages setup, verification, rollback, custom domain |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | WCAG target, implemented features, known gaps |
| [docs/RELEASE.md](docs/RELEASE.md) | Versioning, release checklist, hotfix and rollback |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Ground rules, local setup, PR expectations |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |
| [SECURITY.md](SECURITY.md) | Supported versions, private reporting, scope |
| [SUPPORT.md](SUPPORT.md) | Common fixes and where to ask |
| [ROADMAP.md](ROADMAP.md) | Shipped work, candidates, non-goals |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [state.json](state.json) | Build record: time, tokens and credits |
| [AGENTS.md](AGENTS.md) | Operating notes for the next developer or agent |

## Quality gates

```bash
node --check script.js           # JavaScript syntax
node scripts/check.mjs           # files, ids, tabs, i18n parity, colours, links, state
node scripts/browser-check.mjs   # 15 headless Chrome acceptance checks
```

The static checks run in GitHub Actions on every push and pull request. The
browser check launches a temporary Chrome profile, drives the app over the
DevTools Protocol and verifies inverse states, identity steps, all three
practice modes, language switching, reload persistence, export and mobile
overflow. It needs Node 22+ and a local Chrome/Chromium (`CHROME_BIN` overrides
the detected path).

## How to use it

1. **Inverse Functions** — choose sin/cos/tan, narrow or widen the domain, drag the point, and test inputs inside and outside the function's range.
2. **Identity Lab** — pick an expression and choose the next legal substitution. The area model updates to the identity that powers the step.
3. **Equation Solver** — choose Basic, Quadratic Form or Identity Proofs, answer, then reveal the animated solution.

## Project structure

```
index.html                 HUD, three panels, sliders, practice form and bilingual hooks
style.css                  Palette, layout, canvas cards, choices, steps and responsive rules
script.js                  State, i18n, inverse branches, identity engine, solver, export
scripts/check.mjs          Dependency-free static release checks
scripts/browser-check.mjs  Headless Chrome acceptance checks (no dependencies)
docs/                      Architecture, reproduction, content, session, testing, deployment, a11y, release
.github/                   CI, issue templates, PR template, CODEOWNERS
state.json                 Build record: elapsed time, token usage, credits
AGENTS.md                  Operating notes for the next developer or agent
assets/hero.jpg            Documentation screenshot only
```

## Data and privacy

Everything stays in the browser. The only storage is `localStorage["khanTrigUnit4.v1"]` (language, settings, scores, badges). The export button creates a local Blob; nothing is uploaded. Clearing site data resets the studio.

## Verification

Tested in headless Chrome 156 on macOS with zero console errors: principal branches for all three inverse functions, out-of-range and non-one-to-one warnings, point dragging, two-step identity simplification, all three practice modes with correct answers, animated solution points, EN ⇄ TH switching, reload persistence, JSON export and a 390 px mobile viewport with no horizontal overflow.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and keep the project static, offline and bilingual. Report vulnerabilities privately per [SECURITY.md](SECURITY.md).

## Credits

Built in a single session with **[OpenCode](https://opencode.ai)** running **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash`). Exact elapsed time and token consumption are recorded in [`state.json`](state.json).

## Licence

MIT — see [LICENSE](LICENSE).
