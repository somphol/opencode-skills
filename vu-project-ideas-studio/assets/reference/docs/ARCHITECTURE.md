# Architecture

## Three layers

```text
SOURCE                  BUILD                         RUNTIME
data/source.json  ─┐
data/metadata.json ├─→ scripts/build.py ─→ data/projects.js ─→ index.html
data/prefix.txt   ─┘                    ├─→ data/catalog.json      │
                                        ├─→ prompts/*.md           ├─→ assets/style.css
                                        └─→ docs/CATALOG.md        └─→ assets/app.js
```

The site is a classic-script application. `data/projects.js` assigns `window.VU_DATA`; `assets/app.js`
reads it and renders everything below the static shell. There is no bundler, router, framework or
network request for content.

## Data schema

`window.VU_DATA`:

```js
{
  version: "1.0.0",
  updated: "2026-11-05",
  prefix: "Can you create new project … {{TITLE}} … ===========",
  tracks: [
    { id: "game", name: "Games & Arcade", color: "#ff6b4a", description: "…" }
  ],
  projects: [
    {
      id: "cute3d-procedural-code-only-animal-studio",
      n: 1,
      title: "Cute3D: Procedural Code-Only Animal Studio",
      tagline: "Build seven original animals …",
      track: "craft",
      trackName: "Creative Studios",
      stack: ["Three.js", "Web Audio", "LocalStorage", "JSON I/O", "EN / TH", "Physics"],
      features: ["3D / WebGL", "Physics", "Procedural content"],
      live: null,
      size: "L",
      words: 1095,
      chars: 7107,
      readMinutes: 5,
      sourceTitle: "Cute3D: Procedural Code-Only Animal Studio",
      aliases: [],
      promptFile: "01-cute3d-procedural-code-only-animal-studio.md",
      task: "TASK: Build a complete …"
    }
  ]
}
```

`data/catalog.json` is the same metadata without `task`, useful for scripts and future clients. The
site does not load it.

## Build pipeline

`scripts/build.py` is the only writer of generated files.

1. Read `data/source.json` (55 blocks), `data/metadata.json` (55 entries) and `data/prefix.txt`.
2. Drop entries with `duplicateOf` (block 42, the second Nexus 2035).
3. Clean quote wrappers and conversational lead-ins from the task body.
4. Derive slug, sequential `n`, word/char counts, size (`S` < 380, `M` ≤ 650, `L` > 650), read time,
   stack and feature chips.
5. Fail if metadata is missing, ids collide, a task is too short, or the request prefix leaked into a task.
6. Write `data/projects.js`, `data/catalog.json`, `prompts/<nn>-<slug>.md`, `prompts/README.md` and
   `docs/CATALOG.md`.

Stack and feature detection is keyword based (`STACK_RULES`, `FEATURE_RULES` in the build script).
It is deliberately conservative; add a rule or a metadata override rather than hand-editing generated
output.

## Runtime

### Boot

```text
data/projects.js → window.VU_DATA
assets/app.js
  → validate data
  → load favorites + theme
  → render track chips + stack options
  → apply filters + render cards
  → render prefix preview
  → fetch state.json for the credit line (optional)
  → open #p/<id> if present
  → expose window.__vu, set __vuReady
```

### State

One object:

```js
{ q, track, stack, liveOnly, starredOnly, sort, favs: Set<string> }
```

`applyFilters()` searches the title, tagline, track, source title, stack, features and **the full task
body**. Every whitespace-separated token must match (AND). The result is sorted by curated order, A–Z,
shortest or longest, then rendered into a document fragment.

### Card rendering

Cards are `<article role="button" tabindex="0" data-id data-track>`. Track accents come from
`[data-track]` CSS variables. Inner **Copy** and **star** buttons stop event propagation so they do not
open the drawer. Enter and Space open the card when the card itself has focus.

### Detail drawer

Native `<dialog>` with `showModal()`. Opening:

- fills title, tagline, chips, stack, features, source label, aliases, prompt file link and deep link;
- composes `fullPrompt(project) = prefix.replace('{{TITLE}}', title).trimEnd() + '\n\n' + task`;
- writes the prompt with `textContent` (never `innerHTML`);
- sets the track on the dialog so `--accent` follows;
- writes `#p/<id>` with `replaceState` and changes the document title;
- locks body scrolling.

Closing restores the title and URL, unlocks scrolling and returns focus to the card that opened it.
Clicking the backdrop closes. The tabs are `Copy-ready prompt` and `At a glance`.

### Copy and download

`copyText()` uses `navigator.clipboard.writeText()` when available, then a hidden textarea and
`document.execCommand('copy')`. A toast reports success or gives a manual fallback. Downloads build a
Markdown blob locally; no server is involved.

### Storage

| Key | Shape | Purpose |
| --- | --- | --- |
| `vu.favorites.v1` | `string[]` of ids | Shortlist |
| `vu.theme.v1` | `"light"` / `"dark"` | Theme override |

Both are read defensively and written inside `try/catch`. `?theme=light|dark` overrides the stored
theme for screenshots and sharing without changing it.

### Test hooks

`window.__vu` exposes `{ data, state, projects, open, close, applyFilters, fullPrompt, resetFilters,
count }`. `window.__vuReady` is `true` after boot; `body[data-projects]` and `body[data-visible]` carry
the counts used by the browser suite.

## CSS

`assets/style.css` is organised as:

1. tokens (`:root`, dark theme);
2. reset and shared primitives;
3. header;
4. hero and decorative stack;
5. catalog, filter panel and cards;
6. how-it-works and prefix card;
7. credits and footer;
8. detail dialog and toast;
9. responsive breakpoints (1040, 900, 720, 520) and reduced motion.

Track colours are declared once per `data-track` value for light and dark. Adding a track requires a
build-script entry and two CSS blocks.

## Files that must stay in sync

| Change | Also update |
| --- | --- |
| `data/prefix.txt` | run build; prompts, `projects.js`, tests |
| `data/metadata.json` | run build; prompt files, catalog |
| New track | build script `TRACKS`, CSS track selectors, tests |
| New brief | source + metadata, build, README counts, `state.json` |
| Rename a doc | `docs/README.md`, `AGENTS.md`, `scripts/verify.mjs` |
| New screenshot | browser test output paths, README |
