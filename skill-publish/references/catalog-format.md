# Catalog format

## Shape

An HTTP catalog is a **base URL** serving `index.json`:

```json
{
  "name": "OpenCode skills by somphol",
  "skills": [
    {
      "name": "city-miniature",
      "version": "a35cee08460d",
      "description": "Build or adapt an interactive 3D miniature of a city as one offline HTML file…",
      "license": "see repository",
      "files": ["SKILL.md", "ATTRIBUTION.md", "scripts/new-project.mjs", "assets/…"]
    }
  ]
}
```

For that entry, OpenCode fetches `<base>/city-miniature/<file>` for every listed file. The folder
becomes a source root named after the entry, so the skill ID is the folder name.

## Rules

| Rule | Consequence if broken |
| --- | --- |
| Paths are relative and same-origin | The file is rejected or the skill fails to load |
| No `..`, no absolute paths, no other hosts | Rejected |
| The entry must include `SKILL.md` (or `<name>.md`) | No entry file, no skill |
| `version` must change when files change | Clients keep the cached copy |
| `index.json` must sit at the base URL | Nothing is discovered |

## Versioning

Do not hand-maintain versions. `sync-catalog.mjs` hashes the file list and contents and writes the
first 12 hex characters, so any edit produces a new version automatically.

## Generating it

`skills.json` is the hand-edited source list:

```json
{
  "skills": [
    { "name": "city-miniature", "source": "~/Projects/city-miniature/skills/city-miniature",
      "description": "…", "license": "see repository" }
  ]
}
```

```sh
node scripts/sync-catalog.mjs           # copy sources, rewrite index.json
node scripts/sync-catalog.mjs --check   # CI: does the tree match the manifest?
```

The copy skips `node_modules`, `dist`, `dist-single`, `shots`, `film`, `docs` and dotfiles.

## Hosting on Pages

1. Put `index.json` and the skill folders at the repository root of the catalog repo.
2. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
3. Base URL: `https://<user>.github.io/<catalog>/`.

Adding the skills/ prefix to the layout changes the base URL to `…/<catalog>/skills/`; either works as
long as `index.json` sits at the URL users add to their config.

## Client configuration

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["https://<user>.github.io/<catalog>/"]
}
```

Multiple catalogs and local directories can be listed together; arrays are combined, not replaced.
Precedence: later sources win by skill ID, so a local override beats a catalog entry only if it is
registered later — put local paths after remote URLs.
