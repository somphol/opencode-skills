---
name: Skill Publish
description: Publish an OpenCode skill to GitHub — validate it, lay it out as skills/<id>/, write the handoff and attribution notes, and serve it through an HTTP catalog with GitHub Pages.
version: 1.0.0
---

# Skill Publish

Take a finished skill directory and put it somewhere other agents can install it: a GitHub repository
laid out as `skills/<id>/`, plus an HTTP catalog that OpenCode can load from a single URL.

## When to use

- A skill works locally and should be shareable or installable on another machine.
- An existing skill changed and the catalog needs a new version.
- The user asks to publish, mirror or “put this on GitHub”.

## Before publishing

```sh
node scripts/check-skill.mjs ~/.config/opencode/skills/<id>
```

It fails on: missing `SKILL.md`, missing `name`/`description` frontmatter, a directory name that is not
lowercase kebab-case, vendored `node_modules` or build output, and token/private-key/email patterns.
Fix every `FAIL`; read the `WARN`s. `--strict` turns warnings into failures.

Also confirm:

- the skill is scaffold-tested from a clean directory (see `session-to-skill`);
- `ATTRIBUTION.md` exists and names any reused work and its licence status;
- no third-party brand marks or logos are redistributed;
- no transcript, credential or machine-specific path is included.

## Repository layout

```text
<repo>/
├── README.md          install, usage, screenshot, attribution summary
├── AGENTS.md          handoff: commands, layout, constraints, known issues, continuity
├── ATTRIBUTION.md     origin and licence status of the work
├── LICENSE            only if you can state the terms
├── skills/
│   └── <id>/
│       ├── SKILL.md
│       ├── assets/
│       ├── references/
│       └── scripts/
└── docs/preview.png
```

The directory name under `skills/` is the skill ID. A single-skill repo may put `SKILL.md` at the root
instead, but `skills/<id>/` stays correct when a second skill arrives.

## Publish

```sh
cd <repo>
git init && git add -A && git commit -m "…"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

Creating the repository, enabling Pages and the token scopes involved are covered in
`references/github-setup.md`. Never print a token; read it from the credential helper into a variable.

## Catalog

An HTTP catalog is a base URL with `index.json`; OpenCode downloads `<base>/<name>/<file>` and
registers each entry by folder name. `scripts/sync-catalog.mjs` copies skills from the sources listed
in `skills.json` and rewrites `index.json` with a content-hash version:

```sh
node scripts/sync-catalog.mjs            # sync all
node scripts/sync-catalog.mjs --check    # verify the tree matches index.json
```

Users then add one line:

```jsonc
{ "skills": ["https://<user>.github.io/<catalog>/"] }
```

Details, including why the version must change and which paths are legal, are in
`references/catalog-format.md`.

## Verify the release

```sh
node scripts/check-skill.mjs ~/.config/opencode/skills/<id>
curl -s -o /dev/null -w "%{http_code}\n" https://<user>.github.io/<catalog>/index.json
curl -s https://<user>.github.io/<catalog>/index.json | head -20
```

Then install from the catalog into a scratch config and load the skill once. A catalog that serves
`index.json` but a 404 for a listed file is worse than no catalog.

## Failure boundaries

- GitHub Pages cannot set response headers. If the skill needs a CSP, host it where headers are
  supported, or document that it runs unsandboxed.
- Deleting a repository needs the `delete_repo` scope; a normal `repo`-scoped token returns 403.
- Pages caches aggressively: a client may keep a skill until its `version` string changes.
- Publishing is not licensing: if the source material has no licence, publish with attribution and
  say so, or keep the repository private.
