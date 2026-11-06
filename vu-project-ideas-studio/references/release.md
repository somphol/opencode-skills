# Release

## Documentation set

Ship these in the repository root and `docs/`:

| File | Purpose |
| --- | --- |
| `README.md` | product, counts, quick start, pipeline, verification, deploy, credits |
| `AGENTS.md` | one-minute handoff: what, commands, architecture, constraints, issues, continuity |
| `CHANGELOG.md` | release history |
| `CONTRIBUTING.md` | content and code rules, workflow |
| `CODE_OF_CONDUCT.md` | participation rules |
| `SECURITY.md` | private reporting and design controls |
| `SUPPORT.md` | where to get help |
| `LICENSE` | MIT |
| `THIRD_PARTY_NOTICES.md` | dependencies, fonts, linked demos |
| `state.json` | session, usage, artifacts, verification, deployment, credits |
| `docs/README.md` | documentation index |
| `docs/ARCHITECTURE.md` | runtime map and data schema |
| `docs/REPRODUCTION.md` | rebuild from the original list |
| `docs/PROVENANCE.md` | cleaning, duplicates, anomalies, rights |
| `docs/DESIGN.md` | tokens, type, layout, components |
| `docs/TESTING.md` | gates, commands, limitations |
| `docs/DEPLOYMENT.md` | API commands, Pages, rollback |
| `docs/DECISIONS.md` | non-obvious choices |
| `docs/ACCESSIBILITY.md` | implemented and known gaps |
| `docs/PERFORMANCE.md` | budget and trade-offs |
| `docs/PRIVACY.md` | storage, network, logs |
| `docs/FAQ.md` | user questions |
| `docs/ROADMAP.md` | next and non-goals |
| `docs/CATALOG.md` | generated table |

The docs are part of the gate: required files must exist, and README/AGENTS must stay coherent with
the counts.

## State file

Refresh after the last measurement:

```json
{
  "project": "…",
  "release": "1.0.0",
  "session": { "id": "ses_…", "startedAt": "…", "capturedAt": "…", "elapsed": "…" },
  "model": { "name": "DeepSeek V4.1 Flash", "id": "deepseek-v4.1-flash", "provider": "opencode-go" },
  "usage": { "inputTokens": 0, "outputTokens": 0, "reasoningTokens": 0,
             "cacheReadTokens": 0, "cacheWriteTokens": 0, "totalTokens": 0, "costUSD": 0 },
  "artifacts": { "sourceFiles": [], "supportingFiles": [] },
  "verification": { "staticChecks": 365, "browserChecks": 31, "consoleErrors": 0, "status": "passed" },
  "deployment": { "repository": "…", "pages": "…", "status": "live", "verifiedAt": "…" },
  "credits": { "tool": "OpenCode", "model": "DeepSeek V4.1 Flash", "license": "MIT" }
}
```

Read tokens from `~/.local/share/opencode/opencode.db` (`session_v2`). `totalTokens` is the sum of the
five counters. Cache reads dominate. `costUSD` is 0 on a flat-rate plan; say so instead of estimating.

## GitHub Pages

```sh
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
```

Create the repo (skip on 422/404-already-exists), push, then:

```sh
curl -X POST https://api.github.com/repos/OWNER/REPO/pages \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"source":{"branch":"main","path":"/"}}'
```

If it already exists, use `PUT`. Poll the URL until 200 (30–120 s on the first build). Then run:

```sh
TEST_URL=https://OWNER.github.io/REPO/ node tests/browser.test.mjs --no-shots
```

## Keychain discipline

- Read the helper **once** per publish run.
- API calls use `Authorization: Bearer`.
- Git push uses an explicit header and disables the helper for that command:

```sh
B64=$(printf "x-access-token:%s" "$TOKEN" | base64)
git -c credential.helper= -c http.extraHeader="Authorization: Basic $B64" push -u origin main
```

- Never echo the token, never write it to a tracked file, never run a push loop.
- `scripts/verify.mjs` scans shipped files for common credential patterns.

## Release checklist

```text
[ ] python3 scripts/build.py
[ ] npm test                       → 365/365
[ ] npm run test:browser           → 31/31, zero console errors
[ ] screenshots inspected
[ ] README/AGENTS counts current
[ ] docs links resolve
[ ] state.json refreshed
[ ] git status clean
[ ] commit + push (one keychain read)
[ ] Pages 200
[ ] live browser suite 31/31
[ ] skill scaffold verified
[ ] skill catalog synced and pushed
```

## Rollback

```sh
git revert <commit>
git push
```

Pages serves the reverted tree after the next build. There is no database or migration.

## Skill backup

The reusable method lives in `~/.config/opencode/skills/vu-project-ideas-studio` and is mirrored by the
catalog at `~/Projects/opencode-skills`.

```sh
cd ~/Projects/opencode-skills
node sync.mjs vu-project-ideas-studio
node sync.mjs --check
git add -A
git commit -m "skill: add vu-project-ideas-studio"
git push
```

The catalog version is a content hash; clients refresh when it changes. Confirm the catalog URL and the
skill folder return 200 before announcing.
