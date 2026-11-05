# Release and publishing

## Docs set

Root: `README.md`, `AGENTS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
`SECURITY.md`, `SUPPORT.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `state.json`.

`docs/`: `README`, `ARCHITECTURE`, `REPRODUCTION`, `CURRICULUM`, `DESIGN`, `TESTING`, `DEPLOYMENT`,
`DECISIONS`, `ACCESSIBILITY`, `PERFORMANCE`, `PRIVACY`, `FAQ`, `ROADMAP`.

Also `.github/workflows/ci.yml`, issue templates, PR template, `.nojekyll`, `robots.txt`,
`sitemap.xml`, `assets/favicon.svg`, screenshots, `assets/og.html`.

`AGENTS.md` must be updated in the same push as any material change. It is the next agent's entry
point.

## GitHub repository

The reference build had no `gh` CLI. Use the REST API with the existing Keychain credential.

### One-prompt keychain plan

```sh
TOKEN_FILE="/private/var/folders/.../opencode/.gh-token"
umask 077
security find-internet-password -s github.com -w > "$TOKEN_FILE"
TOKEN=$(cat "$TOKEN_FILE")
```

- Do not echo the token.
- Use it for repo creation, push, Pages, skill push; then remove the temp file.
- The API accepts `Authorization: Bearer $TOKEN`.
- `git push` needs Basic:

```sh
AUTH=$(printf 'x-access-token:%s' "$TOKEN" | base64)
git -c http.extraheader="Authorization: Basic $AUTH" push -u origin main
```

### Create, push, Pages

```sh
curl -sS -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"algorithm-explorer","private":false,"description":"…"}'

git remote add origin https://github.com/<user>/algorithm-explorer.git
git -c http.extraheader="Authorization: Basic $AUTH" push -u origin main

curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/algorithm-explorer/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

The branch must exist before the Pages call. Poll:

```sh
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/algorithm-explorer/pages
```

Wait for `"status": "built"`, then:

```sh
curl -sS -o /dev/null -w '%{http_code}\n' https://<user>.github.io/algorithm-explorer/
TEST_URL=https://<user>.github.io/algorithm-explorer/ node tests/browser.test.mjs
```

Expect 200 and 35/35. First deployment took ~90 s.

## Skill publish

Skill source: `~/.config/opencode/skills/algorithm-explorer-studio`.
Catalog backup: `~/Projects/opencode-skills/algorithm-explorer-studio`.
Catalog manifest: `~/Projects/opencode-skills/skills.json`; run `node sync.mjs` there.

Validation:

```sh
node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs \
  ~/.config/opencode/skills/algorithm-explorer-studio
```

Then add an entry to `skills.json`, run `node sync.mjs`, commit and push (same Basic header). Verify:

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/opencode-skills/index.json
curl -s https://somphol.github.io/opencode-skills/index.json | head
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/opencode-skills/algorithm-explorer-studio/SKILL.md
```

## State capture

`state.json` is a build record, not runtime data. Read the OpenCode session DB:

```sql
SELECT id, title, model, tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost, time_created, time_updated
FROM session_v2
WHERE id = '$OPENCODE_SESSION_ID';
```

- elapsed = `(time_updated - time_created) / 1000` seconds.
- total tokens = sum of the five token counters.
- cost is 0 on a flat-rate plan.
- include the artifact list and line counts, verification counts (106), deployment status and live
  verification, credits (OpenCode + DeepSeek V4.1 Flash), and the skill status.
- Do not invent numbers; capture at the end, after the skill push, and commit the update.

## Final checklist

- [ ] `npm test` 47/47
- [ ] `node tests/browser.test.mjs` 35/35
- [ ] in-page 24/24
- [ ] live 35/35
- [ ] screenshots regenerated
- [ ] AGENTS current in the same commit
- [ ] state.json final, no placeholders
- [ ] README badges/counts match
- [ ] Pages 200
- [ ] skill validated, synced, pushed, catalog serves `SKILL.md`
- [ ] Keychain prompts: at most one
