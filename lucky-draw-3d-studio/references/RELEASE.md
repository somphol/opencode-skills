# Release checklist

## Screenshots — six assets

`scripts/screenshot.mjs` drives the app once and writes:

| Asset | Content |
| --- | --- |
| `assets/studio.png` | 1600×1000 full app, EN, four names |
| `assets/stage.png` | stage crop |
| `assets/winner.png` | winner dialog with confetti mid-flight (wait ~350 ms after reveal) |
| `assets/thai.png` | Thai interface |
| `assets/mobile.png` | 390×844, DPR 2, full-height stage |
| `assets/og-card.png` | 1200×630 social card rendered by `assets/og.html` |

Use a fresh temp Chrome profile so no toast/history contaminates the shots. The winner shot needs
`prefs.duration = 0.8–0.9`, a spin, wait for the dialog, then a short pause.

## Documentation set

Root: `README.md`, `AGENTS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
`SECURITY.md`, `SUPPORT.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `state.json`.

`docs/`: `README.md` (index), `ARCHITECTURE.md`, `REPRODUCTION.md`, `DESIGN.md`, `PHYSICS.md`,
`TESTING.md`, `DEPLOYMENT.md`, `DECISIONS.md`, `ACCESSIBILITY.md`, `PERFORMANCE.md`, `PRIVACY.md`,
`FAQ.md`, `ROADMAP.md`.

Community/CI: `.github/workflows/ci.yml`, three issue templates, `pull_request_template.md`,
`.gitignore`, `.editorconfig`, `.nojekyll`, `robots.txt`, `sitemap.xml`.

`AGENTS.md` is the handoff. Ship it in the same push as the code. Cover what it is, commands,
architecture, decisions/constraints, known issues and continuity. Link the README rather than
duplicating it.

## state.json

Record the build session honestly. Read the live OpenCode database instead of guessing:

```sh
sqlite3 -json ~/.local/share/opencode/opencode.db \
  "select id, model, cost, tokens_input, tokens_output, tokens_reasoning,
          tokens_cache_read, tokens_cache_write,
          datetime(time_created/1000,'unixepoch') as created
   from session_v2 where id='<session-id>';"
```

Fields:

- `session`: id, startedAt, capturedAt, elapsedSeconds, elapsed, note.
- `model`: name, id, provider.
- `usage`: five token counters, `totalTokens` (sum), costUSD, note about cache reads.
- `artifacts`: three source files, exact line counts, supporting file list (must exist).
- `verification`: automated/browser/self-test counts, console errors, checks summary.
- `deployment`: repository, Pages URL, host, branch, path, status, verifiedAt.
- `credits`: OpenCode, model, Three.js, licence.
- `skill`: name, title, status, catalog URL, source URL, version, local path, note.

The static suite compares line counts and artifact existence, so regenerate this file after the last
source edit.

## Publishing

```sh
git init -b main
git add -A
git commit -m "Lucky Draw Studio 1.0.0"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Create the repo with `gh repo create <user>/<repo> --public --source=. --push` or the REST API.
Enable Pages:

```sh
gh api -X POST repos/<user>/<repo>/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

Never commit a token. If `gh` is unavailable, read the token from the credential helper into a
process variable once and use it for the API calls; do not echo it or write it to `.git/config`.

## Live verification

```sh
curl -sI https://<user>.github.io/<repo>/ | head -3
TEST_URL=https://<user>.github.io/<repo>/ node tests/browser.test.mjs
```

Expect 18/18 and zero console errors. Pages caches; wait a minute on a stale asset.

## Skill publication

- Copy the skill to `~/.config/opencode/skills/lucky-draw-3d-studio`.
- Validate: `node scripts/check-skill.mjs ~/.config/opencode/skills/lucky-draw-3d-studio`.
- Add an entry to the catalog's `skills.json`, run `node sync.mjs`, commit and push.
- Verify the catalog `index.json` lists the skill and every file returns 200.
- Update `state.json.skill` with the version hash and source URL, then commit.

## Final sweep

- [ ] Source line counts match `state.json`.
- [ ] Session time and token counters captured after the last tool call that matters.
- [ ] All relative links resolve.
- [ ] No secrets, tokens, emails or home paths in the repo.
- [ ] Screenshots regenerated after the last visual change.
- [ ] Live suite passes.
- [ ] AGENTS.md commands still work from a clean clone.
