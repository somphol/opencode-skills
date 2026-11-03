# OpenCode skills — catalog

An HTTP skill catalog for OpenCode. Add one URL and every skill here is available:

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["https://somphol.github.io/opencode-skills/"]
}
```

OpenCode reads `index.json` from that base URL, downloads the listed files, and registers each skill
by its folder name. Bump happens automatically: the catalog rebuilds `version` from the content hash,
so a changed skill refreshes in the client's cache.

## Skills

| Skill | What it does |
| --- | --- |
| [`city-miniature`](city-miniature/SKILL.md) — [live demo](https://somphol.github.io/san-francisco-miniature/) | Build an interactive 3D miniature of a city as one self-contained HTML file. Ships a working San Francisco diorama (8 landmarks, rotated street grid, traffic, day/night, English/Chinese). |
| [`session-export`](session-export/SKILL.md) | Export OpenCode sessions to Markdown with a maintained TOC and JSON index, sanitized. Local master, optional private mirror. |
| [`session-to-skill`](session-to-skill/SKILL.md) | Turn a finished session or project into a reusable skill: extract the template, write the instructions, prove it by scaffolding. |
| [`skill-publish`](skill-publish/SKILL.md) | Publish a skill to GitHub: validate, lay out `skills/<id>/`, write handoff and attribution notes, serve an HTTP catalog via Pages. |

## Local install instead

```sh
git clone https://github.com/somphol/city-miniature.git \
  ~/.config/opencode/skills/city-miniature
```

## Maintaining the catalog

`sync.mjs` copies each skill from its source repository listed in `skills.json`, then rewrites
`index.json`:

```sh
node sync.mjs             # sync everything
node sync.mjs --check     # verify the tree matches index.json (CI-friendly)
```

Never edit a skill folder here by hand — it is generated. Change the source repository, then sync and
commit.

## Licence and provenance

Each skill carries its own licence and provenance notes; see the skill's `README.md`. Skills are not
mirrored from third parties without permission — only work owned by this account is published here.
