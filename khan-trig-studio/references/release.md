# Release and publishing

## Documentation set

A professional release carries:

- `README.md` — what it is, screenshot, modules, features, run, docs index,
  quality gates, structure, privacy, verification, credits, licence.
- `AGENTS.md` — what it is, commands, architecture, decisions/constraints,
  known issues, continuity. This is the first file another agent reads.
- `CHANGELOG.md` — Keep a Changelog, SemVer.
- `LICENSE` (MIT) and `CITATION.cff`.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`,
  `ROADMAP.md`, `.editorconfig`.
- `.github/PULL_REQUEST_TEMPLATE.md`, issue forms, `CODEOWNERS`,
  `.github/workflows/ci.yml`.
- `docs/ARCHITECTURE.md`, `DESIGN.md`, `TESTING.md`, `DEPLOYMENT.md`,
  `ACCESSIBILITY.md`, `RELEASE.md`, `REPRODUCTION.md`, `CONTENT.md`,
  `SESSION_LOG.md`.
- `state.json`.

## AGENTS.md sections

1. What it is (and is not).
2. Commands (run, check, browser check, deploy).
3. Architecture (file roles, state, maths engines, data).
4. Decisions and constraints (maths, colours, domains, parsers, dependencies).
5. Known issues.
6. Continuity (live URL, local path, release tags, state snapshot).

Keep it readable in a minute and link to the deep docs.

## State file

```json
{
  "project": "…",
  "session": {
    "id": "…", "startedAt": "…Z", "capturedAt": "…Z",
    "elapsedSeconds": 0, "elapsed": "12m 26s", "note": "…"
  },
  "model": { "name": "…", "id": "…", "provider": "…" },
  "usage": {
    "basis": "delta from project start",
    "inputTokens": 0, "outputTokens": 0, "reasoningTokens": 0,
    "cacheReadTokens": 0, "cacheWriteTokens": 0, "totalTokens": 0,
    "costUSD": 0, "note": "…"
  },
  "artifacts": { "sourceFiles": [], "lineCounts": {}, "supportingFiles": [] },
  "verification": { "method": "…", "checks": [], "consoleErrors": 0 },
  "deployment": {
    "repository": "…", "pages": "…", "host": "GitHub Pages",
    "branch": "main", "path": "/"
  },
  "credits": { "tool": "OpenCode", "toolURL": "…", "model": "…", "modelID": "…" }
}
```

Measure elapsed from the first tool call to capture; use the session DB for
tokens and take a delta from the project start snapshot. Keep it as a historical
snapshot; docs releases must not rewrite it.

## GitHub without `gh`

1. Create the repo with the API once:
   `POST https://api.github.com/user/repos` with `{name, description, private:false}`.
2. Read the token **once** from the credential helper:

   ```sh
   TOK=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n "s/^password=//p")
   ```

3. Push with the token URL, then reset the remote to the clean URL:

   ```sh
   git push "https://x-access-token:${TOK}@github.com/<owner>/<repo>.git" main:main
   git remote set-url origin "https://github.com/<owner>/<repo>.git"
   ```

   Scrub the token from any captured output.

4. Enable Pages:
   `POST /repos/<owner>/<repo>/pages` with
   `{"source":{"branch":"main","path":"/"}}`.
5. Poll the Pages URL until HTTP 200, then check `style.css`, `script.js`,
   `assets/hero.jpg`, `state.json`.
6. Tag and release:
   - annotate `v1.0.0`, push the tag;
   - `POST /repos/…/releases` with the changelog section;
   - set homepage and topics via `PATCH /repos/…` and `PUT /repos/…/topics`;
   - enable private vulnerability reporting: `PUT /repos/…/private-vulnerability-reporting`.
7. For docs-only releases bump patch versions (`v1.0.1`, `v1.0.2`) and tag
   again. The live site always follows `main`.

### Avoid repeated Keychain prompts

Read the credential helper once per push, not once per API call. Keep the token
in a shell variable, never in the repository or a committed file. Do not print
it. Do not use `gh` if it is not installed; the REST API plus git is enough.

## Pages checks

```sh
BASE=https://<owner>.github.io/<repo>
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"
curl -s "$BASE/" | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/style.css"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/script.js"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/state.json"
```

Pages rebuilds in ~30–60 s. It caches for a few minutes; hard-reload before
calling a deploy broken.

## Repository settings

- Public repo, MIT licence.
- Homepage: Pages URL.
- Topics: topic + pedagogy + stack + accessibility, e.g.
  `trigonometry`, `math-education`, `interactive-learning`, `html5-canvas`,
  `vanilla-javascript`, `bilingual`, `thai`, `github-pages`, `no-dependencies`.
- Issues on, wiki/projects off.
- Pages: `main` / root, `.nojekyll`.

## Skill backup

When publishing this skill:

1. Keep the local source at `~/.config/opencode/skills/khan-trig-studio`.
2. Validate with `check-skill.mjs`.
3. Add a `skills.json` entry in the catalog repo.
4. Run the catalog sync (`node sync.mjs`) so `index.json` is regenerated from
   content hashes.
5. Commit the skill folder, manifest and index; push.
6. Confirm `https://<owner>.github.io/<catalog>/index.json` lists the skill and
   its files return 200.

The catalog is the backup copy; the local installed directory remains master.
