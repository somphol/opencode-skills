---
name: Session to Catalog
description: Share a finished OpenCode session to GitHub — mine the local session database, distil the reusable knowledge into a skill, publish it through a content-hashed HTTP catalog, and keep raw transcripts on a private archive.
version: 1.0.0
---

# Session to Catalog

A session is worth more than its transcript. This is the pipeline that turns it into something another
agent can install, while keeping the raw conversation private.

There are **three lanes**. Most mistakes are a file crossing lanes.

| Lane | Lives at | Visibility | What it holds |
| --- | --- | --- | --- |
| Raw session | `~/.local/share/opencode/opencode.db` | local only | every message, tool call and token |
| Transcript | `~/opencode-transcripts/` | private GitHub mirror | sanitized Markdown, TOC, index |
| Skill | `~/.config/opencode/skills/<id>/` → catalog repo | public | distilled instructions, references, templates |

Never copy a transcript into a public repository. Never push the archive anywhere public. A skill
must stand on its own without the session that produced it.

## When to use

- A session produced knowledge that will be needed again (a bug class, a release routine, a working
  app).
- An existing skill is stale because a later session changed the method.
- You need the catalog, not just the local skill directory.

**Not for:** dumping a conversation, sharing raw tool output, or publishing anything containing
credentials, personal data or third-party assets.

## Workflow

### 0. Mine the session, do not re-read it

Query the database for signals, then read only what you need:

```sh
sqlite3 ~/.local/share/opencode/opencode.db \
  "select id, title, datetime(time_created/1000,'unixepoch','localtime') from session_v2 order by time_created desc limit 20;"
```

Recipes for finding a session, the turns that matter, and token cost are in
[`references/session-mining.md`](references/session-mining.md). A 2,500-message session can yield its
lessons from a handful of `LIKE` queries and the project's changelog.

### 1. Choose the artifact

- New reusable method → **new skill**.
- Method changed (a new release proved a rule wrong) → **edit the existing skill** in place, bump its
  `version`, and record what changed.
- One project's detail only → write it in the project's `AGENTS.md`, not a skill.

### 2. Write the skill

`~/.config/opencode/skills/<id>/SKILL.md`, with lowercase kebab-case directory name and frontmatter:

```yaml
---
name: Readable Name
description: One sentence that says when to use it, not what it contains.
version: 1.0.0
---
```

Rules that keep it installable:

- The `description` is the trigger; front-load the verbs and the domain.
- Put detail in `references/`, working code in `templates/`; keep `SKILL.md` a page or two.
- State the worked example and say "read it for the mechanism, not as a reskin target".
- No secrets, tokens, emails, home paths, session IDs, screenshots of private data or third-party
  brand marks. Link to public URLs instead of embedding private ones.
- Add `ATTRIBUTION.md` for any reused work and its licence.
- Every command must be copy-pasteable and current.

### 3. Register it in the catalog

The catalog repository is `~/Projects/opencode-skills` (public). Skills sit **flat at the repository
root** — one folder per skill — and `skills.json` is the only hand-edited list.

```json
{
  "name": "session-to-catalog",
  "source": "~/.config/opencode/skills/session-to-catalog",
  "description": "…same sentence as the frontmatter…",
  "license": "see repository"
}
```

`source` may also point at a project repository that ships the skill (e.g.
`~/Projects/city-miniature/skills/city-miniature`). Installed skills come from
`~/.config/opencode/skills/<id>`.

### 4. Rebuild — never hand-edit generated folders

```sh
cd ~/Projects/opencode-skills
node sync.mjs session-to-catalog   # one skill
node sync.mjs                      # everything (use after editing shared skills)
node sync.mjs --check              # verify the tree matches index.json
```

`sync.mjs` deletes and recopies each destination from `source`, skips `node_modules`, `dist`,
`dist-single`, `shots`, `film`, a top-level `docs/`, and dotfiles, then rewrites `index.json`:

```json
{ "name": "OpenCode skills by somphol",
  "skills": [{ "name": "…", "version": "12-hex", "description": "…", "license": "…", "files": [] }] }
```

`version` is the first 12 hex of a SHA-256 over every relative path and file body. It changes when any
file changes, which is how clients invalidate their cache. Do not hardcode it.

### 5. Update the human index

`README.md` has a skills table that `sync.mjs` does not touch:

```markdown
| [`session-to-catalog`](session-to-catalog/SKILL.md) | Turn a session into a published, installable skill. |
```

Also update the repository `AGENTS.md` when the pipeline, commands or layout change — it is what the
next agent reads first.

### 6. Verify before commit

```sh
node sync.mjs --check                      # must print "index.json is current"
curl -s https://somphol.github.io/opencode-skills/index.json | head -40
git status --short                         # only expected skills + index.json + README
```

Check the new entry's `version` in `index.json` equals the printed hash, and that `files` includes
`SKILL.md` and every reference you wrote.

### 7. Commit, push, confirm Pages

```sh
git add -A && git commit -m "Add <skill>: …" && git push
```

GitHub Pages serves the new `index.json` within one to two minutes. Then confirm the live copy:

```sh
curl -s https://somphol.github.io/opencode-skills/index.json \
  | grep -A3 '"name": "session-to-catalog"'
```

Clients consume the catalog by one URL in `opencode.jsonc`:

```jsonc
{ "$schema": "https://opencode.ai/config.json",
  "skills": ["https://somphol.github.io/opencode-skills/"] }
```

A refresh happens only when `version` changes.

### 8. Preview before stable

Test a change in the published catalog without publishing it as stable:

```sh
cd ~/Projects/opencode-skills
node sync.mjs --preview              # partial catalog of every skill that differs from index.json
node sync.mjs --preview <name>       # force one skill, even if unchanged
node sync.mjs --check --preview      # is the preview current?
```

Point the test client at the preview base, `https://somphol.github.io/opencode-skills/preview/`, and
keep the stable base in the normal profile. Identify what you are running:

| Signal | Stable | Preview |
| --- | --- | --- |
| `version` | 12 hex | `p-` + 12 hex |
| Catalog | all skills | only changed skills (partial by design) |
| `preview/BUILD.json` | absent | `channel`, `commit`, `dirty`, `builtAt` |

`preview/` only reaches Pages if it is committed. Rebuild or delete it after every stable sync: a stale
preview advertises a `p-` build that no longer differs from stable, and `--check --preview` will say so.

## Transcript lane (private)

If the session itself should be kept, export it — the archive is the master copy, GitHub is a private
backup:

```sh
cd ~/opencode-transcripts
node export-sessions.mjs --only ses_xxx
node scripts/check-archive.mjs
node scripts/push-archive.mjs
```

- `check-archive.mjs` fails on tokens, JWTs, private keys, emails, home paths and public IPs.
- `push-archive.mjs` confirms through the GitHub API that the remote is private before pushing.
- `--raw` is refused unless `--unsafe` is passed; never leave a raw export in the archive.
- Sanitizing is pattern based, not permission to publish.

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Client keeps the old skill | `index.json` not rebuilt, so `version` unchanged | `node sync.mjs` and commit `index.json` |
| Local edit vanished after sync | edited the generated folder | edit `source`, then sync |
| `--check` fails after unrelated work | other skills changed too | full `node sync.mjs`, not just the new name |
| 404 on the catalog URL | folder not at repo root, or no `.nojekyll` | keep flat layout, keep `.nojekyll` |
| New reference missing online | file inside a skipped folder (`docs/`, dotfile) | rename or move it under the skill |
| Push rejected as not private | archive remote made public | stop; restore privacy, never mirror transcripts elsewhere |
| Testing the wrong build | client points at the stable base while reviewing a change | use `preview/` base; check the `p-` prefix |
| Preview contradicts index | stale `preview/` after a stable sync | rebuild with `--preview` or delete `preview/` |
| Skill leaks personal data | copied session text or a screenshot verbatim | rewrite from the method, re-check patterns |

## Definition of done

- [ ] Lessons were mined with targeted queries, not by pasting the transcript.
- [ ] The skill is self-contained and its commands were run.
- [ ] `version` bumped in frontmatter if the skill already existed.
- [ ] `skills.json` entry added or updated; `node sync.mjs --check` passes.
- [ ] `README.md` row and repo `AGENTS.md` updated where needed.
- [ ] Live `index.json` shows the expected `version` and `files`.
- [ ] Preview build tested first, or deliberately skipped; stale `preview/` removed.
- [ ] No transcript, secret, private path or third-party asset in the public repo.

## Files in this skill

- `references/session-mining.md` — database queries for finding sessions, lessons and costs.
