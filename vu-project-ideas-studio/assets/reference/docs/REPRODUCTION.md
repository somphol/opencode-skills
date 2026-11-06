# Reproduction

Two levels: rebuild the generated files from the committed data, or reconstruct the whole catalog
from the original prompt list. Both end at the same verification gate.

## Requirements

- Python 3.10+ (build and parser; no third-party packages)
- Node 22+ (static gate and browser harness)
- Google Chrome or Chromium (browser checks and screenshots)
- A GitHub credential only for the publish step

## Level 1 — rebuild generated files

```bash
cd ~/Projects/vu_project_ideas
python3 scripts/build.py
npm test
npm run test:browser
```

That reads `data/source.json`, `data/metadata.json` and `data/prefix.txt`, then rewrites
`data/projects.js`, `data/catalog.json`, all 54 `prompts/*.md` files, `prompts/README.md` and
`docs/CATALOG.md`. The static gate fails if any generated file is stale.

## Level 2 — reconstruct from the original list

### 2.1 Recover the source text

If the list is still in an OpenCode session:

```bash
python3 scripts/extract-session.py --list
python3 scripts/extract-session.py --session ses_xxxxxxxx --out /tmp/vu_raw.txt
```

The tool opens the SQLite database read-only, takes the **first user message** of the session and
writes its text. It never prints the body. If the list is already a file:

```bash
python3 scripts/extract-session.py --text prompt-list.txt --out /tmp/vu_raw.txt
```

Sanity check: `grep -c '^VU - Project' /tmp/vu_raw.txt` should be 55 for the supplied list. One header
is prefixed `(Master/Meta Example)`; the parser accepts it.

### 2.2 Parse blocks

```bash
python3 scripts/parse-source.py --input /tmp/vu_raw.txt --out data/source.json
```

The parser:

- starts a block at `VU - Projects - Title` or `VU - Project - Title`;
- captures a standalone `http(s)` URL near the top as the live demo;
- removes the repeated request-prefix lines and the `===========` divider;
- keeps everything after the divider verbatim as `task`;
- marks a second occurrence of the same normalized title with `duplicateOf`.

It does **not** clean quote wrappers or curate metadata. That is deliberate: `source.json` remains an
audit trail.

### 2.3 Curate metadata

`data/metadata.json` is keyed by source block number. Each entry needs:

```json
"1": {
  "title": "Cute3D: Procedural Code-Only Animal Studio",
  "tagline": "Build seven original animals from spheres and capsules, then dress them in live fur and wind.",
  "track": "craft",
  "aliases": []
}
```

Rules:

- **title** — display title; short enough for a card, specific enough to search.
- **tagline** — one sentence, 8–18 words, describes the build not the tech.
- **track** — one of the nine ids declared in `scripts/build.py`.
- **aliases** — original header variants, only when the display title differs.
- **duplicateOf** — the block number of the kept entry; the build drops it.

All 55 blocks need an entry, including the duplicate. The build refuses to run otherwise.

### 2.4 Set the request prefix

Edit `data/prefix.txt`. It must contain exactly one `{{TITLE}}` placeholder and end with the
`===========` divider. The prefix is shared by every brief; never duplicate it into `source.json`.

### 2.5 Build and inspect

```bash
python3 scripts/build.py
python3 -m http.server 4173
```

Check counts, open a few cards, copy one prompt and confirm the prefix appears once and the task body
is complete.

### 2.6 Verify

```bash
npm run verify
```

`scripts/verify.mjs` checks data, generated prompts, site wiring, docs, `state.json` and a credential
scan. `tests/browser.test.mjs` starts its own server, drives Chrome over the DevTools Protocol and
writes the screenshots.

### 2.7 Publish

See [`DEPLOYMENT.md`](DEPLOYMENT.md). The site is static; Pages serves `main` from `/`.

### 2.8 Capture state and skill

Refresh `state.json` with the session id, elapsed time, token counters, verification result and live
URL. Then package the reusable method as a skill (see the `vu-project-ideas-studio` skill).

## Adding a brief later

1. Add a block to `data/source.json` with the next `n`.
2. Add metadata under the same key.
3. `python3 scripts/build.py`.
4. Update the counts in `README.md`, `AGENTS.md` and `state.json`.
5. `npm run verify` and commit the generated files in the same change.

## Capturing time and tokens

OpenCode stores sessions in `~/.local/share/opencode/opencode.db` (`session_v2`). Read only what you
need; do not print credentials or message bodies.

```bash
sqlite3 ~/.local/share/opencode/opencode.db "
  SELECT id, title, datetime(time_created/1000,'unixepoch','localtime'),
         datetime(time_updated/1000,'unixepoch','localtime'),
         tokens_input, tokens_output, tokens_reasoning,
         tokens_cache_read, tokens_cache_write, cost
  FROM session_v2 WHERE id='ses_...';"
```

`totalTokens` in `state.json` is the sum of the five counters. Cache reads dominate long sessions. On a
flat-rate plan `cost` is `0`; record that fact instead of inventing a price.

## Traps that cost time

| Symptom | Cause | Fix |
| --- | --- | --- |
| 500 px mobile layout | Chrome headless clamps `--window-size` below ~500 | use CDP `Emulation.setDeviceMetricsOverride`, as the harness does |
| `Identifier 'x' has already been declared` in CDP | top-level `const` persists between `Runtime.evaluate` calls | wrap each snippet in an IIFE |
| Old prefix appears twice | prefix was embedded in `source.json` as well as `prefix.txt` | keep the prefix only in `prefix.txt` |
| Prompt file stale | edited `projects.js` by hand | edit source/metadata, run `scripts/build.py` |
| Card count wrong | duplicate not marked in metadata | set `duplicateOf` and rebuild |
| 404 console error | missing `state.json` or favicon | create both; the browser gate reports missing same-origin files |
| Search finds nothing | task text was truncated during copy | the parser keeps the whole block; never hand-trim |
| Track has no colour | new track added only to the build script | add light and dark `[data-track]` rules to CSS |
