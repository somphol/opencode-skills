# Release checklist

Copy this into the issue or pull request that ships the project. Every box should be true, not
“probably”.

## Product

- [ ] 4×4 board, 15 tiles, one gap, correctly ordered.
- [ ] Click/tap slides only adjacent tiles; drag orbits without accidental moves.
- [ ] Arrow keys and `WASD` slide; `Z` undo, `R` shuffle, `H` hint, `Esc` closes dialogs.
- [ ] Timer starts on the first move and stops on solve.
- [ ] Shuffle is solvable every time and never already solved.
- [ ] Auto-solve reaches the goal; Stop works mid-run; resume works.
- [ ] Hint highlights the next tile and draws an arrow into the gap.
- [ ] `h`, `g`, remaining path and nodes update.
- [ ] Four skins, including a custom image sliced 4×4.
- [ ] EN/TH switch translates static, dynamic, option and attribute text.
- [ ] Sound on/off persists; audio starts on a gesture.
- [ ] Records only count unassisted wins; Assisted badge appears.
- [ ] Reload restores an unfinished game and pauses the clock.
- [ ] Export JSON downloads and matches the schema.
- [ ] Victory modal shows time, moves, best and record outcome.

## Verification

- [ ] `node --test tests/engine.test.mjs tests/static.test.mjs` → 31/31.
- [ ] `?selftest` → 17/17.
- [ ] `node tests/browser.test.mjs` → 46/46, zero console errors.
- [ ] `TEST_URL=https://… node tests/browser.test.mjs` → 46/46.
- [ ] `node scripts/screenshot.mjs` refreshed all assets.
- [ ] Mobile 390×844: no horizontal overflow, tray fully visible.
- [ ] 200% zoom: no clipped controls.
- [ ] Reduced motion: playable.
- [ ] Manual pass: 10 shuffles, one manual solve, one hinted solve, one auto solve.

## Repository

- [ ] README has a working hero image, live badge and accurate commands.
- [ ] AGENTS.md is current and was pushed with the code.
- [ ] CHANGELOG has the release entry.
- [ ] CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, LICENSE, THIRD_PARTY_NOTICES.
- [ ] docs: README, ARCHITECTURE, REPRODUCTION, SOLVER, DESIGN, TESTING, DEPLOYMENT, DECISIONS,
      ACCESSIBILITY, PERFORMANCE, FAQ, PRIVACY, ROADMAP.
- [ ] Relative Markdown links resolve.
- [ ] `state.json` shape valid, line counts match, deployment `live`, credits present.
- [ ] `.nojekyll`, `robots.txt`, `sitemap.xml`, OG image.
- [ ] CI workflow runs engine + static suites.
- [ ] No secrets, emails, `/Users/…` paths, `.DS_Store`, `node_modules`.
- [ ] Repository description, homepage, topics, social preview.

## Deployment

- [ ] Repository created, `main` pushed, Pages enabled at `/`.
- [ ] Pages build status `built`.
- [ ] `/`, `/style.css`, `/script.js` return 200.
- [ ] Live `?selftest` 17/17.
- [ ] Live browser suite 46/46.
- [ ] Tag `v1.0.0` and release notes.

## Handoff

- [ ] A new agent can read AGENTS.md in one minute and know how to run, verify and deploy.
- [ ] REPRODUCTION.md contains exact constants and acceptance criteria, not just links.
- [ ] Known issues (optimal search budget, session-only custom image, browser-test scope) are stated.
- [ ] Credits include OpenCode, the model, and Three.js licensing.
