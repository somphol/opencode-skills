# AGENTS.md — VU Project Ideas

Read this first. It is the one-minute handoff for the next agent.

## 1. What it is

A static, searchable catalog of **54 production-grade project briefs** — 3D games, simulators, learning
studios and calm interfaces — with a one-click copy-ready prompt for each. The briefs are verbatim task
bodies; a single request prefix is substituted with the project title at copy time. The site has no
backend, account, analytics, cookie or build step. It is **not** an app generator: two briefs point at
older live builds, the other 52 are specifications for a future build.

Live: <https://somphol.github.io/vu_project_ideas/> · Local master: `~/Projects/vu_project_ideas` ·
Release **1.0.0**, MIT.

## 2. Commands

```bash
# run
python3 -m http.server 4173        # http://127.0.0.1:4173/
npm start                          # the same server

# rebuild generated files after editing data
python3 scripts/build.py           # projects.js, catalog.json, prompts/*.md, docs/CATALOG.md
npm run build                      # the same

# verify
npm test                           # static gate: data, prompts, site, docs, state, secret scan
npm run test:browser               # 31 headless Chrome checks; rewrites assets/*.png
npm run verify                     # both
TEST_URL=https://somphol.github.io/vu_project_ideas/ node tests/browser.test.mjs --no-shots
```

Chrome is found at the standard macOS path, `google-chrome`, `chromium` or `CHROMIUM`; override with
`CHROME=/path/to/chrome`. The harness uses a temporary profile, `--use-mock-keychain` and its own HTTP
server, so macOS does not prompt for Keychain access.

## 3. Architecture

Construction order in the browser is fixed:

1. `index.html` — shell, hero, filters, empty grid, prefix section, credits, detail `<dialog>`.
2. `assets/style.css` — tokens and all layout; track accents resolve from `data-track`.
3. `data/projects.js` — generated classic script: `window.VU_DATA = { version, updated, prefix, tracks, projects }`.
   Each project carries metadata plus the full `task` string. Loaded before the app.
4. `assets/app.js` — one state object (`q`, `track`, `stack`, `liveOnly`, `starredOnly`, `sort`, `favs`).
   Renders track chips, stack options and the card grid; opens the detail dialog; owns copy, download,
   deep links (`#p/<id>`), theme and local storage. Exposes `window.__vu` and `window.__vuReady` for tests.

Data pipeline:

- `data/source.json` — parsed blocks from the supplied prompt list (title, live URL, verbatim task).
- `data/metadata.json` — curated title, tagline, track, aliases, duplicate markers, keyed by source block number.
- `data/prefix.txt` — **the only** copy of the request prefix. `{{TITLE}}` is replaced per brief.
- `scripts/build.py` — validates metadata coverage, drops duplicates, detects stack/features, writes the
  browser payload, metadata-only feed, 54 prompt files, prompt index and catalog table.
- `scripts/extract-session.py` — recovers the original prompt text from an OpenCode SQLite session
  (optional provenance tool; it does not run in the build).

Storage keys: `vu.favorites.v1` (array of project ids), `vu.theme.v1` (`light` / `dark`). Both reads are
defensive and both writes are wrapped in `try/catch`. The credit line fetches `state.json`; a missing
file or `file://` origin leaves the static fallback in place.

## 4. Decisions and constraints

- **Task bodies are verbatim.** Do not rewrite, “improve” or truncate a brief. Quote wrappers and
  conversational lead-ins were removed; the specification itself is untouched.
- **One prefix, one source.** Edit `data/prefix.txt`, never the 54 prompt files or `data/projects.js`.
  Rebuild and commit the generated output in the same change.
- **One duplicate was merged.** The supplied list contained Nexus 2035 twice. The catalog keeps the
  first and records the duplicate in `data/metadata.json` (block 42). Do not re-add it.
- **Source anomalies are documented, not hidden.** Some original header lines named a different project
  than the task body (CyberType/OceanCraft were pasted under a CyberDoom header). The task body is
  authoritative; see `docs/PROVENANCE.md`.
- **The site must work without a server.** `data/projects.js` is a classic script so `file://` works.
  Do not replace it with `fetch('projects.json')` without a fallback.
- **No external assets.** No Google Fonts, CDN scripts, analytics or remote images. The screenshots and
  favicon are local. This keeps Pages fast and the privacy page honest.
- **Copy must have a fallback.** `navigator.clipboard` is used first, then a hidden textarea and
  `execCommand('copy')`. Keep both paths.
- **Track accents live in CSS, not inline styles.** A card/detail carries `data-track`; CSS supplies
  `--accent`. Adding a track means updating `TRACKS` in `scripts/build.py` and the CSS selectors.
- **Deep links use the hash.** `#p/<id>` opens the drawer without a server route. `replaceState` is used
  so closing does not trap the Back button.
- **Mobile is tested at a real 390 px through CDP emulation.** Chrome headless clamps `--window-size` to
  500 px; do not trust a narrow `--screenshot` for responsive checks.
- **Counts are contract constants.** 54 briefs, 9 tracks, 54 prompt files. `scripts/verify.mjs` asserts
  them. Update docs, tests and `state.json` in the same commit if the catalog changes.

## 5. Known issues

- Only two live demos exist (US Map Jigsaw 3D and Word Practice). The rest are briefs, not deployed apps.
- The catalog has no server-side search or database; filtering happens in the browser over ~280 KB of data.
- `state.json` token totals are a snapshot read from `session_v2`; a resumed session will make them stale
  until refreshed.
- The original source list had no dates or authors per brief, so the catalog does not invent them.
- The hero stack is decorative and hidden from assistive technology; the same information is in the cards.
- Safari may render the `color-mix()` track tints slightly differently; the fallbacks are readable.

## 6. Continuity

- Live: <https://somphol.github.io/vu_project_ideas/>
- Source: <https://github.com/somphol/vu_project_ideas>
- Local master: `~/Projects/vu_project_ideas`
- Build record: `state.json` (session id, elapsed, tokens, verification, deployment, credits)
- Skill: `~/.config/opencode/skills/vu-project-ideas-studio` ·
  catalog <https://somphol.github.io/opencode-skills/>
- The 54 copy-ready briefs: `prompts/`
- Rebuild and release notes: `docs/REPRODUCTION.md`, `docs/DEPLOYMENT.md`

If you change anything user-visible, run `npm run verify`, refresh the screenshots and update `state.json`
before pushing. Keep this file current in the same push.
