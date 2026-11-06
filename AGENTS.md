# Agent notes — opencode-skills

An HTTP skill catalog for OpenCode, served by GitHub Pages. `index.json` plus one folder per skill;
adding `https://somphol.github.io/opencode-skills/` to a client's `skills` array makes every entry
discoverable.

## Commands

```sh
node sync.mjs              # copy each skill from skills.json sources, rewrite index.json
node sync.mjs --check      # verify the tree matches index.json (CI)
node sync.mjs city-miniature
```

After a push, GitHub Pages serves the new `index.json` within a minute or two. Clients refresh a
skill when its `version` string changes, which `sync.mjs` derives from the content hash.

## Architecture

- `skills.json` — the source list: `name`, local `source` path, `description`, `license`. This is the
  only file edited by hand. `city-miniature` comes from its own repository; the other skills come from
  the installed skill directories, so editing those skills and re-syncing keeps the catalog current.
- `sync.mjs` — copies sources (skipping `node_modules`, build output, `docs`, dotfiles) and writes
  `index.json`.
- `<skill-name>/` — generated copies. **Never edit these by hand**; the next sync overwrites them.
- `index.json` — generated manifest read by OpenCode: `skills[].{name,version,files}`.

## Constraints

- Catalog paths are resolved as `<base-url>/<name>/<file>`, so each skill folder must stay at the
  repository root and `index.json` must stay at the base URL.
- Files must be same-origin and relative; no `..`, no absolute URLs.
- `version` must change whenever files change, or clients keep a stale cache. The content hash
  handles this — do not hardcode a version.
- Publish only skills this account owns or has redistribution rights for. `manhattan-miniature` is a
  third-party sample and is deliberately **not** included.
- Keep each skill's `README.md` and provenance notes with it; derived work must state its origin.

## Adding a skill

1. Make sure the source repository has a clean `SKILL.md` with `description` frontmatter and no
   secrets.
2. Add an entry to `skills.json`.
3. `node sync.mjs`, review `git status`, commit and push.

## Known issues

- The catalog is a full copy, not a reference: every skill's assets are duplicated in this repository
  (currently ~2.2 MB for `city-miniature`). Fine at this size; revisit if it grows.
- Pages caching means a client may need to wait for the CDN, not the push.

## Continuity

- Live catalog: <https://somphol.github.io/opencode-skills/>
- `city-miniature` source of truth: <https://github.com/somphol/city-miniature>
- Installed copy of that skill: `~/.config/opencode/skills/city-miniature`
- Session transcripts: local only, `~/opencode-transcripts`; never published.
- `khan-trig-studio` source: `~/.config/opencode/skills/khan-trig-studio`; reference app at
  <https://github.com/somphol/khan-trig-unit4-equations-identities-studio>.
- `city-3d-tour-guide` source: `~/.config/opencode/skills/city-3d-tour-guide`; reference app at
  <https://github.com/somphol/bangkok-3d-tour-guide>.
- `wurlitzer-lullaby-studio` source: `~/.config/opencode/skills/wurlitzer-lullaby-studio`; reference app at
  <https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox>.
- `suatsync-3d-studio` source: `~/.config/opencode/skills/suatsync-3d-studio`; reference app at
  <https://github.com/somphol/suatsync-3d> and <https://somphol.github.io/suatsync-3d/>.
- `algorithm-explorer-studio` source: `~/.config/opencode/skills/algorithm-explorer-studio`; reference app at
  <https://github.com/somphol/algorithm-explorer> and <https://somphol.github.io/algorithm-explorer/>.
- `vu-project-ideas-studio` source: `~/.config/opencode/skills/vu-project-ideas-studio`; reference app at
  <https://github.com/somphol/vu_project_ideas> and <https://somphol.github.io/vu_project_ideas/>.
- `wanderlust-3d-studio` source: `~/.config/opencode/skills/wanderlust-3d-studio`; reference app at
  <https://github.com/somphol/wanderlust-3d> and <https://somphol.github.io/wanderlust-3d/>.
