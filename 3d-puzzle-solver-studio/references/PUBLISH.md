# Publishing

Static app, GitHub Pages, no build artifact. The only credential you need is a GitHub token with
`repo` scope, already stored in the git credential helper.

## 1. Create the repository (no `gh` required)

`gh` is optional; curl is enough. Never echo the token.

```sh
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null \
  | sed -n 's/^password=//p')

# who am I
curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/user \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['login'])"

# free name?
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<repo>        # 404 = free

# create
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"<repo>","description":"…","private":false,"has_wiki":false,"has_projects":false}'
```

Give it a real description and a homepage. Set topics with
`PUT /repos/<user>/<repo>/topics` (`threejs`, `15-puzzle`, `astar`, `webgl`, `bilingual`, …).

## 2. Commit and push

```sh
git init -b main
git add -A
git commit -m "feat: …"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Use the credential helper, not a token in the URL. Check `git status` first: no `.DS_Store`, no
screenshots with personal data, no local paths.

`AGENTS.md` must be in the **same push**. It is the only place non-obvious knowledge survives a
session.

## 3. Enable Pages

Pages returns 422 before the first push because the branch does not exist yet. Push first.

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

If it returns 409, use `PUT` with the same body. Poll the build:

```sh
curl -s -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<repo>/pages/builds/latest \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('status'))"
```

Expect `queued` → `building` → `built`. Usually under 90 seconds.

## 4. Verify live

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<repo>/
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<repo>/style.css
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<repo>/script.js
TEST_URL=https://<user>.github.io/<repo> node tests/browser.test.mjs
```

A 404 immediately after a push is usually propagation; check the repository tree before debugging.
The live suite is the real acceptance gate.

## 5. Release

```sh
git tag -a v1.0.0 -m "Full 3D 15-Puzzle Studio & Auto-Solver 1.0.0"
git push origin v1.0.0
```

Optionally create a GitHub release via
`POST /repos/<user>/<repo>/releases` with `tag_name`, `name`, `body` and `draft:false`.
Do not attach generated screenshots twice; link the README assets.

## 6. `state.json` — the session receipt

Read the session counters from the OpenCode database (read-only; never edit it):

```sh
sqlite3 ~/.local/share/opencode/opencode.db \
  "select id,time_created,tokens_input,tokens_output,tokens_reasoning,
          tokens_cache_read,tokens_cache_write,cost
   from session_v2 where id='ses_…';"
```

Convert `time_created` (ms) to ISO, compute elapsed to the capture time, and sum the five token
counters. Record:

- `session`: id, start, capture, elapsed seconds/human, one-line note
- `model`: name, id, provider
- `usage`: all five counters, total, cost, note about cache reads dominating
- `artifacts`: source files, line counts, supporting files
- `verification`: method, counts, console errors, representative checks
- `deployment`: repo, Pages URL, branch/path, status, verified-at
- `credits`: OpenCode, model, engine, licence

The static test asserts the shape and that line counts match the tree. Update it whenever files
change.

## 7. Skill catalogue (optional)

If the working method is reusable:

1. Create `~/.config/opencode/skills/<id>/` with `SKILL.md` (frontmatter `name`, `description`),
   `references/`, `scripts/`, and a reference snapshot if useful.
2. Run the publisher’s validator:
   `node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs <dir>`.
3. Scaffold-test from a clean temp directory.
4. Add to the catalogue manifest, sync, commit and push:

   ```sh
   cd ~/Projects/opencode-skills
   # edit skills.json
   node sync.mjs
   git add -A && git commit -m "add <id>"
   git push
   ```

5. Verify `https://<user>.github.io/<catalog>/index.json` lists the new skill and every listed file
   returns 200.

The content hash becomes the version; clients refresh when it changes.

## 8. Avoid repeated macOS Keychain prompts

- Use one Chrome instance for all browser work, with `--use-mock-keychain` and a throwaway profile.
- Use the git credential helper once per shell command; do not run `security find-internet-password`
  in loops.
- Do not embed tokens in remote URLs; that writes them to `.git/config`.
- If a helper prompts on every git operation, fix the helper configuration rather than disabling
  security.

## 9. Post-release checklist

- [ ] Live `/`, CSS and JS return 200.
- [ ] Live `?selftest` is 17/17.
- [ ] Live browser suite 46/46, zero console errors.
- [ ] Repo description, homepage, topics, social preview set.
- [ ] README badges resolve (CI, live, licence).
- [ ] `state.json` deployment status is `live`, not `pending`.
- [ ] `AGENTS.md` matches the shipped behaviour.
- [ ] Tag pushed and release notes written.
