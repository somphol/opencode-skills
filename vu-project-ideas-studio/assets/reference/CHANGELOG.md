# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [1.0.1] — 2026-11-05

### Fixed

- The drawer's explicit close button now closes the brief. Escape, backdrop click and the native
  dialog already worked; the header button had no listener. The browser suite now clicks that button
  rather than calling `dialog.close()` directly.

## [1.0.0] — 2026-11-05

### Added

- **54 curated build briefs** across 9 tracks, recovered from the supplied 55-block prompt list.
- **One current request prefix** in `data/prefix.txt`, substituted with each project title at build and
  copy time.
- **Searchable catalog** with full-text search over task bodies, track and stack filters, live-demo and
  shortlist filters, and four sort orders.
- **Copy-ready drawer** with the composed prompt, brief-only copy, Markdown download, stack/feature
  glance, source label, aliases and `#p/<id>` deep links.
- **54 Markdown prompt files** and a generated index in `prompts/`.
- **Light and dark editorial themes**, responsive from 1440 px to 390 px.
- **Local persistence** for the shortlist (`vu.favorites.v1`) and theme (`vu.theme.v1`).
- **Build pipeline** (`scripts/build.py`) from `source.json` + `metadata.json` + `prefix.txt` to the
  browser payload, catalog feed, prompt files and catalog table.
- **Provenance tools** (`scripts/extract-session.py`, `scripts/parse-source.py`) and
  [`docs/PROVENANCE.md`](docs/PROVENANCE.md) documenting every normalization and anomaly.
- **Static release gate** (`scripts/verify.mjs`) and **31 headless Chrome checks**
  (`tests/browser.test.mjs`) including a real 390 px viewport and zero-console-error assertion.
- **Screenshots** for desktop, dark mode, catalog, drawer, mobile and social card.
- **Release documentation**: README, AGENTS, architecture, reproduction, design, testing, deployment,
  decisions, accessibility, performance, privacy, FAQ, roadmap, security, support and licence.
- **GitHub Pages release** at <https://somphol.github.io/vu_project_ideas/>.
- **Reusable skill** `vu-project-ideas-studio` with the working reference and a scaffold script.

### Changed

- Merged the duplicate Nexus 2035 block (55 supplied → 54 unique).
- Normalized display titles and recorded the original headers as aliases.
- Replaced every block's older request wrapper with the single current prefix.
- Removed quote wrappers and conversational lead-ins from seven briefs; task bodies untouched.

### Known issues

- Only two briefs have live demos.
- No formal WCAG audit; see [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md).
- Token totals in `state.json` are a session snapshot.
