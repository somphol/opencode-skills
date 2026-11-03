# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

## [1.0.2] — 2026-11-03

### Added

- `docs/REPRODUCTION.md`: a complete rebuild blueprint with exact mathematical
  rules, drawing geometry, content tables, publishing steps and the pitfalls
  already fixed.
- `docs/CONTENT.md`: identity, equation, badge and export inventories.
- `docs/SESSION_LOG.md`: build timeline, token accounting, defect log and
  publishing record.
- `scripts/browser-check.mjs`: 15 dependency-free headless Chrome acceptance
  checks covering inverse states, identity steps, all practice modes, Thai,
  reload, export and mobile overflow.

### Changed

- README and AGENTS now point at the reproducibility set and include the browser
  check command.

## [1.0.1] — 2026-11-03

### Added

- Professional release documentation: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `SUPPORT.md`, `ROADMAP.md`, `CITATION.cff`, `.editorconfig`.
- `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/TESTING.md`,
  `docs/DEPLOYMENT.md`, `docs/ACCESSIBILITY.md`, `docs/RELEASE.md`.
- Issue forms, pull request template, `CODEOWNERS`, and a GitHub Actions
  verification workflow.
- `scripts/check.mjs`: dependency-free checks for files, DOM ids, tab/panel
  consistency, local assets, EN/TH parity, i18n coverage, semantic colours,
  runtime network calls, Markdown links and `state.json`.

### Changed

- README now includes a documentation index, quality gates and the release
  version.

## [1.0.0] — 2026-11-03

### Added

- **Module 1 — Inverse Functions & Restricted Domains.** sin/cos/tan curves,
  principal-branch band, domain sliders in π/12 steps, draggable active point,
  live inverse curve, exact values, and separate warnings for invalid domains,
  out-of-range inputs and angles outside the selected branch.
- **Module 2 — Pythagorean Identities & Simplification Lab.** Seven expressions,
  one legal substitution per step, immediate feedback, progress dots and a
  geometric area model of all three Pythagorean identities.
- **Module 3 — Equation Solver.** Basic equations, quadratic-form factoring and
  identity proofs; comma-separated solution checking with π, decimal or degree
  terms; animated unit-circle intersections; streaks, mastery and seven badges.
- **Bilingual HUD.** Full English ⇄ Thai switching, including
  ฟังก์ชันตรีโกณมิติผกผัน, เอกลักษณ์พิทาโกรัส and คำตอบทั่วไป.
- **Progress and export.** `localStorage` persistence plus
  `khan_trig_unit4_progress.json` download.
- **Accessibility baseline.** Labelled controls, keyboard tab navigation, ARIA
  live feedback, visible focus and reduced-motion support.
- **Release record.** `state.json` captures build time, token usage and credits.

### Security

- No runtime network requests, third-party scripts, cookies or analytics.
- Progress never leaves the browser unless the learner exports it.

[Unreleased]: https://github.com/somphol/khan-trig-unit4-equations-identities-studio/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/somphol/khan-trig-unit4-equations-identities-studio/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/somphol/khan-trig-unit4-equations-identities-studio/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/somphol/khan-trig-unit4-equations-identities-studio/releases/tag/v1.0.0
