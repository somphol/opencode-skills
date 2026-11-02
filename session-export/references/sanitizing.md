# Sanitizing the archive

## Why it is on by default

A transcript is a recording of everything that was on screen: file contents, `cat` output, HTTP
responses, environment dumps, command lines that include tokens. The archive is meant to be read
later and searched, so it has to stay useful — which rules out blanking the text. The scrubber
therefore removes *shapes that are almost always secrets* and leaves prose alone.

## Rule order

Rules run in sequence in `scripts/export-sessions.mjs`. Order matters: a private key block is removed
before the generic `key = value` rule can mangle it into something unrecognisable.

| Category | Examples |
| --- | --- |
| Private keys | `-----BEGIN OPENSSH PRIVATE KEY-----…` |
| GitHub | `ghp_`, `gho_`, `ghs_`, `ghu_`, `github_pat_` |
| Model APIs | `sk-`, `sk-ant-`, `sk-proj-` |
| Other tokens | `xox[baprs]-`, `AKIA…`, `ASIA…`, `AIza…`, `glpat-`, `npm_…` |
| JWT | three base64url segments |
| Auth headers | `Bearer …`, `Basic …` |
| URL credentials | `https://user:token@host` |
| Assignments | `password=`, `secret:`, `api_key=`, `client_secret=` |
| Env lines | `*_TOKEN=`, `*_SECRET=`, `*_PASSWORD=` |
| Personal | email addresses |
| Paths | `/Users/<name>`, `/private/var/folders/…` |
| Network | public IPv4 addresses (loopback and RFC1918 kept) |
| Numbers | 16-digit and grouped card-shaped runs |

Everything is replaced with a marker such as `[redacted:github-token]`, `[email]`, `[tmp]` or `[ip]`,
so a reader can tell that something was removed and what kind of thing it was.

## What it does not catch

- Secrets in prose (“the key is hunter2”), or split across lines.
- Base64 blobs without a known prefix.
- Private hostnames, internal URLs, customer names.
- Screenshots and images — none are embedded, but text describing them is.
- Anything a tool printed that never passed through a recognised pattern.

## Extending the rules

Add a `[regex, replacement]` pair to `RULES`. Keep replacements as markers with a `$1` backreference
where a prefix is useful (`Authorization: $1 [redacted]`). Test against a real transcript before
committing:

```sh
node scripts/export-sessions.mjs --only ses_… --out /tmp/check
rg -n "ghp_|sk-|@[a-z]+\\.|/Users/" /tmp/check/sessions | head
```

## The hard rule

Never initialise a git repository in the archive, never add a remote, never copy a transcript into a
repository that is published. Sanitized is not the same as safe to publish.
