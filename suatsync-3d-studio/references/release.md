# Release and catalog

## Documentation set

A release is more than three working files. Ship, at minimum:

```text
README.md             what it is, live link, screenshots, quick start, credits
AGENTS.md             handoff: commands, architecture, constraints, known issues, continuity
LICENSE               MIT for code, with a note that content licences differ
ATTRIBUTION.md        edition, transcription licence, video credit, software
CHANGELOG.md          one entry per version
CONTRIBUTING.md       content/testing rules
SECURITY.md           static-site threat model and reporting
CODE_OF_CONDUCT.md    community rules
docs/ARCHITECTURE.md  runtime map and state schema
docs/REPRODUCTION.md  the rebuild book
docs/CONTENT.md       edition, translation policy, timing
docs/TESTING.md       what was actually run and what it proved
docs/DEPLOYMENT.md    Pages operations
docs/DESIGN.md        visual and interaction system
docs/BUILD-STATE.md   what was built, artifacts, verification
state.json            machine-readable build record (time, tokens, credits)
robots.txt sitemap.xml .nojekyll
```

## Pre-flight

```bash
node scripts/check.mjs
node scripts/verify-browser.mjs --screenshots
```

Both must pass. Read the warning list even when they do. Refresh the version string, changelog, testing
record and `state.json`.

## Publish the app

```bash
git init
git add -A
git commit -m "Version 1.0.0"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Create the repository first through the GitHub UI or API. Use one credential read, not repeated
keychain prompts:

```bash
export GH_TOKEN="$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill | sed -n 's/^password=//p')"
curl -sS -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user/repos \
  -d '{"name":"<repo>","private":false,"has_issues":true}'
```

Do not print the token, do not persist it in the remote URL, and do not commit it.

## Pages

```bash
curl -sS -X POST -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Poll `…/pages/builds/latest` until `status: built`, then check:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<repo>/
chrome --headless=new --virtual-time-budget=8000 --dump-dom https://<user>.github.io/<repo>/ \
  | grep -o 'data-suat-sync="ready"'
```

The second check proves the JS booted and rendered a line, not merely that the HTML was served.

## Publish the skill

The local skill is the master. Copy it into the catalog repository:

```bash
# 1. Add an entry to ~/Projects/opencode-skills/skills.json
#    { "name": "suatsync-3d-studio", "source": "~/.config/opencode/skills/suatsync-3d-studio",
#      "description": "...", "license": "MIT" }
# 2. Sync generated copies and index.json
cd ~/Projects/opencode-skills
node sync.mjs
node sync.mjs --check
# 3. Commit and push
git add -A
git commit -m "Add suatsync-3d-studio"
git push origin main
```

Then verify the catalog, not just GitHub:

```bash
curl -s https://<user>.github.io/opencode-skills/index.json | head -40
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/opencode-skills/suatsync-3d-studio/SKILL.md
```

A client installs the catalog with one line in its config:

```jsonc
{ "skills": ["https://<user>.github.io/opencode-skills/"] }
```

## Final `state.json`

Record:

- session start and capture time, wall-clock seconds;
- harness, provider and exact model id;
- input, output, reasoning, cache-read and cache-write tokens, plus a fresh-total and a reported total;
- artifact counts (lines, verses, docs, screenshots, tests);
- verification results and environment versions;
- live URL and the exact live check;
- credits, including OpenCode and the model.

Capture the numbers from the harness's own session store, not from memory. State that they are a
snapshot. If a later step changes them, update the file after publishing; do not leave an early
estimate pretending to be final.
