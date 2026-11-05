# Release reference

## Documentation set

Required at the repository root:

```
README.md  AGENTS.md  CHANGELOG.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md
SECURITY.md  SUPPORT.md  LICENSE  THIRD_PARTY_NOTICES.md  state.json
.editorconfig  .gitignore  .nojekyll  robots.txt  sitemap.xml
.github/workflows/ci.yml
.github/pull_request_template.md
.github/ISSUE_TEMPLATE/{bug_report,feature_request,question}.yml
docs/{README,ARCHITECTURE,REPRODUCTION,DESIGN,AUDIO,TESTING,DEPLOYMENT,
      DECISIONS,ACCESSIBILITY,PERFORMANCE,PRIVACY,FAQ,ROADMAP,CREDITS}.md
assets/{favicon.svg,studio.png,playing.png,stage.png,thai.png,mobile.png,
        stage-hero.png,og-card.png,og.html}
```

`AGENTS.md` follows the global working agreement: what it is, commands, architecture, decisions,
known issues, continuity. It must be current in the same push as the code.

## state.json

Capture:

- session `startedAt`, `capturedAt`, `elapsedSeconds`, `elapsed` (from the OpenCode session database
  or the first tool call; be honest about the method);
- model name/id/provider;
- usage: input, output, reasoning, cache read, cache write, total, cost (read from
  `~/.local/share/opencode/opencode.db`, table `session_v2`, filtered by the project directory);
- artifacts and line counts;
- verification counts and console errors;
- deployment repository/URL/branch/path/status/verifiedAt;
- credits (OpenCode, model, Three.js, licence);
- skill name/status/catalog/source/local.

Never write a token or credential into state.json. Token counts are a snapshot, not a bill.

## GitHub API

Never print the token. Read it into a shell variable:

```sh
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/user | ...
unset TOKEN
```

Create a repository:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"…","description":"…","homepage":"https://…","private":false,"has_issues":true,"has_wiki":false,"has_projects":false}'
```

Push over HTTPS with a credential helper that does not prompt. For local-only machines, configure a
repository-local store file, not the global Keychain helper:

```sh
git config credential.helper "store --file=$HOME/.config/opencode-secrets/git-credentials"
GIT_TERMINAL_PROMPT=0 git push -u origin main
```

Enable Pages:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<owner>/<repo>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

409 means Pages already exists; use `PUT` with the same body to update the source.

## Deployment checklist

- [ ] `git status` clean, no secrets or screenshots of private data
- [ ] local engine/static/browser suites green
- [ ] live URL returns 200 and the expected `<title>`
- [ ] live browser suite 22/22, zero console errors
- [ ] `?selftest` 23/23 in a real browser
- [ ] README screenshots load from the deployed URL
- [ ] `state.json` deployment status `live` and `verifiedAt` set
- [ ] `AGENTS.md` continuity links current
- [ ] skill backup published and catalog index contains the new skill

## Skill publication

The `skill-publish` workflow applied to this project:

```sh
node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs \
  ~/.config/opencode/skills/wurlitzer-lullaby-studio
```

Then add an entry to the catalog's `skills.json`, run `node sync.mjs`, inspect `git status`, commit and
push. The catalog regenerates a content-hash `version`; clients refresh when it changes.

Validate that the listed files are reachable:

```sh
curl -s https://somphol.github.io/opencode-skills/index.json | ...
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/opencode-skills/wurlitzer-lullaby-studio/SKILL.md
```

## Rollback

```sh
git revert <commit>
git push origin main
```

Pages serves the previous artifact after the CDN refreshes. Do not force-push `main`; links in
`state.json` assume linear history.
