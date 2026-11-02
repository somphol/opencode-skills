---
name: Session Export
description: Export OpenCode session transcripts to Markdown with a maintained table of contents and a JSON index, sanitized so credentials and personal data never reach the archive.
version: 1.0.0
---

# Session Export

Turn OpenCode sessions into a readable, searchable local archive: one Markdown file per session, a
`TOC.md` index with dates, summaries and tags, and an `index.json` for filtering.

The local directory is the **master copy**. A **private** GitHub mirror is allowed as a backup; a
public one never is. Transcripts contain command lines, file contents and tool output, so every
exported file must be sanitized before it is written, and the push guard verifies that again.

## When to use

- The user wants to keep, search or revisit past sessions.
- A session's reasoning has to survive beyond the context window.
- Before compacting or deleting sessions that contain decisions worth keeping.

## Workflow

```sh
node scripts/export-sessions.mjs                 # every session, sanitized
node scripts/export-sessions.mjs --limit 5       # newest five
node scripts/export-sessions.mjs --only ses_…    # one session
node scripts/export-sessions.mjs --out ~/notes   # somewhere else
```

Default destination is `~/opencode-transcripts` (override with `--out` or `OPENCODE_TRANSCRIPTS`).
Re-running rewrites `TOC.md`, `index.json` and the touched transcripts; it is safe to repeat.

Output:

```text
<archive>/
├── TOC.md            index grouped by date, with summary and tags
├── index.json        the same data, machine-readable
├── export-sessions.mjs
└── sessions/
    └── 2026-11-02--san-francisco-miniature--e656f2de.md
```

Each transcript starts with front matter — title, session id, created time, model, working directory,
message and tool counts, `sanitized: true` — then `## 🧑 User` / `## 🤖 Assistant` sections, with
tool calls as the command plus a collapsible output block.

## Sanitizing

On by default. Before writing, every text, command and tool output passes through a scrubber that
replaces:

- private key blocks, and provider tokens (`ghp_`, `github_pat_`, `sk-`, `xox[baprs]-`, `AKIA`, `AIza`,
  `glpat-`, `npm_`)
- JWTs and `Bearer` / `Basic` headers
- credentials embedded in URLs
- `password=…`, `token: …`, `api_key=…`, `client_secret=…` assignments, and secret-named `.env` lines
- emails, `/Users/<name>` paths, `/private/var/folders` temp paths, public IPv4s, card-shaped digits

`--raw` is refused unless `--unsafe` is also passed, so an unsanitized file cannot be produced by
accident. **Every file in `sessions/` must say `sanitized: true`.** Sanitizing is still not permission
to publish: the scrubber is pattern based and cannot prove that command output is free of sensitive
data.

Read `references/sanitizing.md` before extending the rules.

## Before pushing anywhere

```sh
node scripts/check-archive.mjs          # re-reads the files, fails on anything unsanitized
node scripts/push-archive.mjs --dry-run # checks the remote is private, pushes nothing
node scripts/push-archive.mjs           # gate + private check + git push
```

`check-archive.mjs` is independent of the exporter: it opens every `sessions/*.md`, requires
`sanitized: true` in the front matter, and scans for tokens, JWTs, private keys, emails, home paths and
public IPs. `push-archive.mjs` runs it first and refuses to push if it fails, then queries the GitHub
API and refuses any repository that is not private. A repository can be flipped to public later, which
is why the check runs on every push rather than once.

## Reading the archive

```sh
less ~/opencode-transcripts/TOC.md
rg -n "parcel" ~/opencode-transcripts/sessions
```

## Failure boundaries

- `opencode` must be on `PATH`; sessions are listed for the working directory (default `$HOME`,
  override with `--dir`).
- Very large sessions take a few seconds each; export writes to a temporary file because a
  multi-megabyte export can be truncated when piped through a buffer.
- The archive is a snapshot: re-run after sessions change.
- The push guard needs a stored GitHub credential and a `github.com` remote; without one it refuses.
- There is no remote-side enforcement: if someone pushes around the guard, the check never runs.
