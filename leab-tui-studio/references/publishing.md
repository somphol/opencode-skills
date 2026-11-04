# Publishing and accounting

## 1. Create the repository without repeated Keychain prompts

On macOS the GitHub CLI may be absent and `git` may ask the Keychain on every new command. The
approach that produced one clean flow:

```bash
# read the existing HTTPS credential once, into memory; never print it
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')

# create the repository through the API
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"my-project","description":"…","homepage":"https://<user>.github.io/my-project/","private":false}'
```

Then:

```bash
git remote add origin https://github.com/<user>/my-project.git
git add -A && git commit -m "Release 1.0.0"
git push -u origin main
```

`osxkeychain` reuses the cached credential for the push. Do not loop `gh auth login`, do not write the
token to a file, do not echo it, do not put it in a command that appears in the transcript.

If `gh` is installed and already authenticated, `gh repo create` is fine. Verify `gh auth status`
first; do not trigger a new login flow just to publish.

## 2. Enable Pages

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

A `201` means created; a `409` means it already exists (use `PUT`). The site is
`https://<user>.github.io/<repo>/`. Wait for the first build, then open the live URL and run the
self-test. If the project is served from the repository root, add `.nojekyll`.

Do not assume the push deployed. Check the URL.

## 3. Release identity

Every public project should state, in this order:

| File | Contents |
| --- | --- |
| `README.md` | what, live link, features, quick start, verify, screenshots, credits, limits, licence |
| `AGENTS.md` | what, commands, architecture, decisions, known issues, continuity — the first file another agent reads |
| `STATE.md` | human-readable build record: timeline, tokens, verification, credits |
| `state.json` | machine-readable version, duration, tokens, model, harness, session id |
| `docs/RULES.md` | the rule contract and interpretation choices |
| `docs/ARCHITECTURE.md` | layers, state machine, serialization, scene, camera |
| `docs/TESTING.md` | evidence and manual checklist |
| `docs/DEPLOYMENT.md` | local, Pages, CSP, rollback |
| `docs/REPRODUCTION.md` | build it again from blank |
| `docs/DATA_FORMAT.md` | save/export schemas |
| `CHANGELOG.md` | current version |
| `LICENSE` | MIT or your chosen terms |
| `THIRD_PARTY_NOTICES.md` | Three.js and any other dependency |

Add contribution, code of conduct, security, support, privacy, authors, citation, browser support,
accessibility, performance, design, FAQ, roadmap, release checklist, handoff, gallery and glossary if
the project is meant to look professional rather than like a demo.

## 4. Measure time and tokens

OpenCode stores the session in `~/.local/share/opencode/opencode.db`:

```sql
select tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost,
       datetime(time_created/1000,'unixepoch','localtime') as created,
       datetime(time_updated/1000,'unixepoch','localtime') as updated
from session_v2
where id = 'ses_...';
```

- `total = input + output + reasoning`.
- Report cache reads/writes separately; they are context reuse, not generated work.
- Duration = `time_updated − time_created` (wall clock), or a captured start/end if you need the exact
  packaging time.
- Measure at the **end**; the release and publish turns add tokens. If you snapshot mid-way, label it
  and update after the final push.
- Write the numbers into `state.json` and `STATE.md`; credit **OpenCode** and the **model** in the
  README, the About modal, the footer and the state file.

## 5. Publish the skill

If the project should become a reusable skill:

1. Create `~/.config/opencode/skills/<id>/` with `SKILL.md`, `references/`, `scripts/`, `templates/`
   and `ATTRIBUTION.md`.
2. Validate with the `skill-publish` skill's `scripts/check-skill.mjs`.
3. Mirror into the catalog repository (`~/Projects/opencode-skills`) and add an entry to `skills.json`:

```json
{
  "name": "leab-tui-studio",
  "source": "~/.config/opencode/skills/leab-tui-studio",
  "description": "…",
  "license": "MIT"
}
```

4. Run `node sync.mjs leab-tui-studio`; this copies the skill and rewrites `index.json` with a
   content-hash version.
5. Update the catalog `README.md` table.
6. Commit and push. Verify `https://<user>.github.io/opencode-skills/index.json` lists the skill and
   every listed file resolves.

A catalog is not a backup if it serves a stale version. The content hash must change when any file
changes.

## 6. Final verification

```bash
node --check script.js
node scripts/check.mjs
node scripts/verify.mjs
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<repo>/
curl -s https://<user>.github.io/opencode-skills/index.json | head
```

Then open the live page and run `?selftest=1`. A local pass is not a deployment pass.

## 7. Failure boundaries

- A public repo is public forever in forks and caches. Remove secrets before the first push.
- Pages cannot set custom headers; a meta CSP is the only policy.
- Deleting a repository needs `delete_repo`; a normal `repo` token gets 403.
- A CDN pin can break if the version is unpublished; keep the notice and the fallback documented.
- Publishing is not licensing. If the rules source has no licence, cite it and state the terms of your
  own code separately.
