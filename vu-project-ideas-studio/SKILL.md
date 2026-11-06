---
name: VU Project Ideas Studio
description: Turn a long, messy prompt list into a release-grade, searchable project-brief catalog — parse blocks, merge duplicates, curate metadata, compose one current request prefix, generate copy-ready Markdown, add search/filters/deep links, verify at 390 px, publish to GitHub Pages and record elapsed time and tokens.
version: 1.0.0
---

# VU Project Ideas Studio

Turn a pasted list of project ideas into a catalog students can **explore, filter and copy** — not a
wall of text. The method was built for 55 prompt blocks that became 54 unique briefs, 54 copy-ready
Markdown files and a static site that passes 365 static checks and 31 headless-browser checks.

Reference: `assets/reference/` · Live: <https://somphol.github.io/vu_project_ideas/> ·
Source: <https://github.com/somphol/vu_project_ideas>

## When to use

Use this skill when the user has:

- a long list of project prompts, assignment briefs, hackathon ideas or build specs;
- the same request wrapper repeated above every entry;
- duplicates, quote wrappers, mismatched titles or other pasted-list noise;
- a need to make the list browsable, searchable and copyable for students;
- a static host (GitHub Pages) and no backend.

Do **not** use it for:

- building the projects themselves (copy a brief into a coding agent, then use a project-specific
  skill);
- a generic blog or documentation site;
- a list with fewer than ~8 entries where a single README is enough;
- content you do not have the right to republish.

## What “done” means

| Gate | Command | Expected |
| --- | --- | --- |
| Build | `python3 scripts/build.py` | regenerated payload, 54 prompt files, catalog table |
| Static | `npm test` | 365/365 |
| Browser | `npm run test:browser` | 31/31, zero console errors |
| Mobile | included above | 390 px, no page/drawer overflow |
| Screenshots | included above | 7 fresh PNGs in `assets/` |
| Docs | `npm test` | README, AGENTS, 14 docs, community files exist |
| State | `npm test` | session, usage, verification, deployment, credits |
| Live | `TEST_URL=… node tests/browser.test.mjs --no-shots` | 31/31 |
| Handoff | `AGENTS.md` in the same push | current |

If a number is lower, fix the cause; never edit the claim.

## Non-negotiables

1. **Task bodies are verbatim.** Remove packaging (wrapper, divider, quotes, conversational lead-in),
   never the specification. No paraphrasing, no “improving” grammar, no truncation.
2. **One prefix, one source.** Keep the request wrapper in `data/prefix.txt` with a `{{TITLE}}`
   placeholder. Generate every prompt from it.
3. **One duplicate only.** Mark the later copy in metadata and drop it in the build. Record the decision
   in `docs/PROVENANCE.md`.
4. **Curate metadata by hand; derive chips by rule.** Titles, taglines and tracks are editorial. Stack
   and feature chips come from keywords in the task body.
5. **Generated files are never edited.** `data/projects.js`, `prompts/*.md` and `docs/CATALOG.md` are
   outputs of `scripts/build.py`.
6. **The site works without a server.** Use a classic script payload (`window.VU_DATA`), not a
   `fetch`-only JSON load, so `file://` and static hosts both work.
7. **No external assets.** System fonts, no CDN, no analytics, no remote images.
8. **Copy has a fallback.** `navigator.clipboard` then a hidden textarea + `execCommand('copy')`.
9. **Deep links are hashes.** `#p/<id>` needs no server rewrite; `replaceState` keeps Back usable.
10. **Test mobile at a real 390 px through CDP.** Chrome headless clamps `--window-size` to ~500 px and
    crops screenshots, which hides overflow. Never trust a narrow `--screenshot`.
11. **One credential read per publish run.** Read the OS credential helper once, use it for API calls
    and pushes, and never echo it.
12. **Counts are contract constants.** If the number of briefs, tracks or checks changes, update the
    tests, README, AGENTS and `state.json` in one commit.

## Workflow

### Phase 0 — recover the source

If the list is in an OpenCode session:

```sh
python3 scripts/extract-session.py --list
python3 scripts/extract-session.py --session ses_... --out /tmp/ideas_raw.txt
```

If it is a file, pass `--text`. Never print the whole message if it may contain private data; write it
to a file and work there.

### Phase 1 — parse and audit

```sh
python3 scripts/parse-source.py --input /tmp/ideas_raw.txt --out data/source.json
```

The parser starts a block at `VU - Projects - Title` (or `VU - Project`), captures a standalone live URL,
removes the repeated wrapper and divider, keeps the task body, and marks duplicate titles.

Then **audit before curating**:

- count headers and unique titles;
- list duplicates and decide which to keep;
- list header/task mismatches (a pasted header may name the previous project);
- note quote wrappers and conversational lead-ins;
- identify blocks with a live URL;
- confirm every block has a substantial task body.

Write the findings into `docs/PROVENANCE.md` as you go. Future agents will ask.

### Phase 2 — curate metadata and the prefix

`data/metadata.json` is keyed by source block number. Every block needs an entry, including dropped
duplicates.

```json
"1": {
  "title": "Cute3D: Procedural Code-Only Animal Studio",
  "tagline": "Build seven original animals from spheres and capsules, then dress them in live fur and wind.",
  "track": "craft",
  "aliases": []
}
```

Rules:

- **title**: card-sized, specific, searchable; keep the original header in `sourceTitle` via the build.
- **tagline**: one sentence, 8–18 words, about the build rather than the technology.
- **track**: one of the declared ids; one track per brief.
- **aliases**: original header variants when the display title differs.
- **duplicateOf**: the kept block number for a dropped duplicate.

Define 8–10 tracks in `scripts/build.py` (`TRACKS`) and matching light/dark CSS accents.

`data/prefix.txt` is the single request wrapper. It must contain exactly one `{{TITLE}}` and end with the
divider used by the source list.

### Phase 3 — build the pipeline

`scripts/build.py` should:

1. read source + metadata + prefix;
2. drop duplicates;
3. clean quote wrappers and conversational lead-ins;
4. derive slug, index, word/char counts, size band, read time, stack and features;
5. fail on missing metadata, duplicate ids, short tasks or a leaked prefix;
6. write `data/projects.js`, `data/catalog.json`, `prompts/<nn>-<slug>.md`, `prompts/README.md` and
   `docs/CATALOG.md`.

Run it after every data change. The static gate compares generated output with the source.

### Phase 4 — build the catalog UI

Shell order:

```text
index.html → assets/style.css → data/projects.js → assets/app.js
```

The UI needs:

- hero with counts and a clear “explore” action;
- search across title, tagline, track, stack, features **and the full task body**;
- track chips, stack select, live filter, shortlist filter, sort;
- cards with index, track, title, tagline, stack chips, size/words and a Copy button;
- native `<dialog>` drawer with full prompt, brief-only copy, Markdown download, glance tab and deep
  link;
- light/dark theme and a two-key `localStorage` contract;
- empty state, toast, keyboard `/`, reduced-motion handling;
- no external requests except optional same-origin `state.json` for the credit line.

Copy composition:

```js
const full = prefix.replace(/\{\{TITLE\}\}/g, project.title).trimEnd()
  + "\n\n" + project.task;
```

Write the prompt with `textContent`, never `innerHTML`.

### Phase 5 — verify

```sh
python3 scripts/build.py
npm test
npm run test:browser
```

The static gate checks data, generated files, site wiring, docs, state and a credential scan. The
browser suite starts its own server, uses `--use-mock-keychain`, drives Chrome over CDP and writes
screenshots.

Must-have browser checks:

- 54 cards, 10 track chips, 9 tracks;
- search narrows and finds a known brief;
- track and stack filters work;
- star persists and the shortlist filter shows it;
- drawer opens, prefix appears once, task is present, hash is written;
- glance tab and source label;
- close clears the hash;
- deep link opens the right brief;
- theme toggles;
- 390 px page and drawer have no horizontal overflow;
- zero console errors and no missing same-origin files.

### Phase 6 — document and release

Write the full docs set (see `references/release.md`), capture `state.json`, publish to GitHub Pages,
then test the live URL with the same browser suite.

### Phase 7 — turn the method into a skill

Copy this skill's structure: `SKILL.md`, `README.md`, `LICENSE`, `ATTRIBUTION.md`, four reference docs,
`scripts/new-project.mjs`, `scripts/verify.mjs`, a preview image and `assets/reference/`. Prove it by
scaffolding into a temp directory and running the gates.

## Reference recipes

### Metadata to data

```text
data/source.json    title, live URL, task, duplicateOf, words, chars
data/metadata.json  title, tagline, track, aliases, duplicateOf
data/prefix.txt     {{TITLE}} wrapper
        ↓ build
data/projects.js    window.VU_DATA = { version, updated, prefix, tracks, projects }
```

### Project fields

`id, n, title, tagline, track, trackName, stack[], features[], live, size, words, chars, readMinutes,
sourceTitle, aliases[], promptFile, task`.

### Size bands

`S` < 380 words · `M` 380–650 · `L` > 650. These describe the **brief**, not the difficulty. Do not
invent a difficulty rating.

### Prompt file

Front matter (`id`, `title`, `track`, `order`, `words`, `live`) then the title, tagline, metadata line,
a four-backtick `text` block with the full prompt, and a source/catalog footer.

### Deep link

`#p/<slug>`; on open, `history.replaceState(null, '', '#p/' + id)`; on close, strip the hash and
restore focus.

## Scaffold

```sh
node scripts/new-project.mjs --out ~/Projects/my-ideas-catalog
cd ~/Projects/my-ideas-catalog
python3 -m http.server 4173
npm test
```

The scaffold copies the complete working reference (54 briefs, build, tests, docs) into a new
directory. Replace `data/source.json`, `data/metadata.json`, `data/prefix.txt`, the track list and the
copy before publishing. Do not ship the VU briefs as your own content.

## Provenance

Built from **VU Project Ideas** (MIT, © 2026 Somphol Boonjing) in one OpenCode session with **DeepSeek
V4.1 Flash**. The reference contains the original briefs supplied for that catalog. Code, docs and
tests are MIT. See `ATTRIBUTION.md`.
