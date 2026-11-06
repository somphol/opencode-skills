# Method — from prompt list to catalog

## 1. Source audit

Before writing code, produce a short audit. It prevents the two expensive mistakes: inventing content
and miscounting.

```text
headers:            55
unique titles:      54
duplicate:          Nexus 2035 (kept first)
live URLs:          2
quote-wrapped:      7
header/task mismatch: 2 (CyberType, OceanCraft)
missing docs/skill in old prefix: many
```

Record the audit in `docs/PROVENANCE.md`. If a header names a different project than its task body, the
task body wins; note it.

## 2. Parser rules

A block starts at:

```text
VU - Projects - Title
(Master/Meta Example) VU - Projects - Title
VU - Project - Title
```

Within a block:

- a standalone `http(s)` line near the top is a live demo URL;
- lines matching the request wrapper are packaging, not task;
- the first `===========` ends the wrapper;
- everything after it, until the next header, is the task.

For blocks with no divider (short prompts), strip wrapper lines until the first non-wrapper line. For
blocks where the wrapper is interleaved (a quoted prompt before “Please also upload…”), strip wrapper
lines at both ends.

Keep `data/source.json` raw: title, live URL, duplicate marker, task, words, chars. Cleaning happens in
the build so the audit trail remains.

## 3. Cleaning rules

Only packaging:

- remove wrapper paragraphs and divider;
- strip `*"…"*` or `"…"` around a quoted master prompt;
- drop a conversational lead-in before the quote (“Yes, … is possible”, “Here is the most elaborate…”);
- collapse 3+ blank lines to 2;
- drop a trailing meta instruction from the user (“Please note that there is almost a comment prefix…”).

Do not fix grammar, reorder sections, shorten examples or change counts inside the task.

## 4. Metadata schema

```json
{
  "1": {
    "title": "Display title",
    "tagline": "One sentence, 8–18 words, about the build.",
    "track": "game",
    "aliases": ["Original header if different"],
    "duplicateOf": "34"
  }
}
```

Every source block gets an entry, including duplicates. The build fails if one is missing.

Track taxonomy (adapt, do not blindly copy):

| id | name | intent |
| --- | --- | --- |
| game | Games & Arcade | arcade loops, sports, table games |
| puzzle | Puzzles & Strategy | boards, solvers, thinking games |
| stem | STEM & Algorithms | math, code and pattern visualizers |
| language | Language & Reading | reading, vocabulary, typing |
| city | Cities & Travel | landmarks, transit, walkable guides |
| sim | Simulation & Vehicles | vehicles, weather, cockpits |
| calm | Calm & Focus | chanting, meditation, ambient study |
| craft | Creative Studios | characters, bricks, staged performance |
| life | Tools & Daily Life | useful everyday interfaces |

One track per brief; counts must add up. Declare colours for light and dark in CSS.

## 5. Derived metadata

Compute, do not hand-write:

- slug from the display title (ASCII, lower, `&` → `and`, apostrophes removed);
- sequential `n` after duplicates are dropped;
- word and character counts from the task;
- size band: `S` < 380, `M` 380–650, `L` > 650;
- read time: `ceil(words / 220)`;
- stack tags: ordered keyword rules (`Three.js`, `Cannon.js`, `Canvas 2D`, `Web Audio`, `Web Speech`,
  `LocalStorage`, `JSON I/O`, `EN / TH`, `Physics`, `AI / Solver`, `SRS`, `Single file`);
- feature tags: broader behaviour (`3D / WebGL`, `Procedural audio`, `Bilingual`, `Local save + export`,
  `AI opponent / solver`, `Speech in / out`, `Spaced repetition`, `Responsive HUD`).

If a derived tag is wrong, add a keyword rule. Do not patch generated JSON.

## 6. Generated outputs

| Output | Contents |
| --- | --- |
| `data/projects.js` | `window.VU_DATA` with tracks, prefix and all projects |
| `data/catalog.json` | metadata only, no tasks, for future clients |
| `prompts/<nn>-<slug>.md` | front matter, title, tagline, full prompt, source footer |
| `prompts/README.md` | 54-row index |
| `docs/CATALOG.md` | 54-row catalog table with live links |

The build should fail loudly on:

- metadata missing for a block;
- duplicate ids;
- task shorter than 200 characters;
- wrapper text inside a task;
- a missing `{{TITLE}}` or divider in the prefix.

## 7. UI contracts

### Search

Tokenise on whitespace; every token must match the haystack (AND). Include the full task body so
“rip current”, “SSA” and “Khan” work. Do not debounce at 54 items.

### Filters

Track chips show counts. Stack select is populated from data. Live and shortlist are checkboxes.
Sort: curated, A–Z, shortest, longest. Reset clears everything.

### Cards

`<article role="button" tabindex="0" data-id data-track>` with:

- index, track pill, optional Live badge, star;
- title, 3-line tagline;
- up to four stack chips and `+N`;
- size/words and a Copy button.

Inner buttons stop propagation. Enter/Space on the card opens the drawer.

### Drawer

Native `<dialog>` + `showModal()`. Fill with `textContent`; compose the prompt from prefix + task.
Actions: copy full, copy task, download `.md`, live link. Tabs: prompt / glance. `#p/<id>` on open;
strip on close; restore focus.

### Storage

`vu.favorites.v1` (`string[]`), `vu.theme.v1` (`"light"|"dark"`). Both wrapped in `try/catch`.

## 8. Adding a brief

1. Append a block to `data/source.json` with the next `n`.
2. Add metadata under the same key.
3. `python3 scripts/build.py`.
4. Update counts in README, AGENTS, state.
5. `npm run verify`.
6. Commit generated files in the same change.

## 9. Removing or renaming a brief

Renaming a display title changes the slug and breaks existing deep links. If the brief has been public,
keep the old slug as an alias route or accept the break explicitly in the changelog.

## 10. Content rights

Only catalog content you have the right to publish. Keep the original source label and provenance. Do
not copy third-party course text, paid problem sets or assets into the tasks.
