# Decisions

Short records of choices that are easy to undo badly.

## D1 — Static files, no framework

**Decision:** vanilla HTML/CSS/JS, no bundler, no runtime dependencies.

**Why:** the artifact is a catalog that must last. Pages serves it directly, `file://` opens it, and a
future agent can read every line. A framework would add a toolchain and a dependency surface for a
page with one view and a dialog.

**Do not:** introduce React/Vite/Tailwind without a concrete requirement that the current 54-card
catalog cannot meet.

## D2 — `data/projects.js`, not fetched JSON

**Decision:** the generated payload is a classic script that assigns `window.VU_DATA`.

**Why:** `fetch('projects.json')` fails on `file://` and needs CORS care on some hosts. A script tag
works everywhere and keeps the site deployable as plain files.

**Trade-off:** the payload is ~280 KB uncompressed and includes all task bodies, because full-text
search runs in the browser. That is acceptable for 54 briefs.

## D3 — Verbatim task bodies

**Decision:** keep every specification exactly as supplied, after removing packaging.

**Why:** students copy these into agents. Paraphrasing would silently change scope, counts and
requirements. The copy button is a contract: prefix + original task.

**Do not:** “fix” grammar, reflow line breaks inside the task, or trim a section for length.

## D4 — One prefix, substituted at build/copy time

**Decision:** `data/prefix.txt` is the only copy of the request wrapper; `{{TITLE}}` is replaced per
project.

**Why:** the supplied list repeated the wrapper with variants. One source removes drift and makes the
“latest update” instruction a one-file change.

**Consequence:** `data/projects.js` and all 54 prompt files are generated. Never hand-edit them.

## D5 — 54 briefs, not 55

**Decision:** merge the second Nexus 2035 block.

**Why:** it was byte-for-byte the same specification. Showing it twice would inflate the catalog and
confuse the count. `data/metadata.json` records the duplicate; `source.json` keeps the audit trail.

## D6 — Curated metadata over auto-generated labels

**Decision:** titles, taglines and tracks are hand-curated in `metadata.json`; stack, features, size
and counts are derived.

**Why:** a tagline is editorial. Keyword extraction produces awkward copy and misleading categories.
Conversely, stack chips should follow the task body, not a stale hand list.

**Rule:** if a derived chip is wrong, add a keyword rule in `scripts/build.py`; do not patch generated
JSON.

## D7 — Nine tracks, one per brief

**Decision:** Games, Puzzles, STEM, Language, Cities, Simulation, Calm, Craft, Daily life.

**Why:** enough to browse, few enough to fit one row on desktop. Multi-tagging would make the filter
ambiguous and the counts lie.

**Cost:** some briefs could sit in two tracks (e.g. Maker/craft vs. games). The primary intent wins.

## D8 — Hash deep links

**Decision:** `#p/<id>` opens the drawer.

**Why:** Pages is static; a hash needs no server rewrite and survives `file://`. `replaceState` keeps
the Back button usable instead of trapping every card click in history.

## D9 — Native `<dialog>`

**Decision:** use `showModal()` rather than a custom overlay.

**Why:** the browser supplies focus containment, Escape handling, backdrop and inertness. A custom
trap is more code and more bugs.

**Known gap:** the card is `role="button"` and contains real buttons (copy, star). Screen readers get a
slightly unusual nested interactive region. The inner actions are labelled and keyboard reachable;
this is a conscious trade for a fully clickable card.

## D10 — Local-only personalization

**Decision:** shortlist and theme in `localStorage`; no account, sync or analytics.

**Why:** the catalog is a public reading surface. Persisting two small preferences is useful; tracking
students is not.

**Keys:** `vu.favorites.v1`, `vu.theme.v1`. Both are versioned so a future schema can migrate.

## D11 — Test mobile at a real 390 px

**Decision:** CDP device metrics, not `--window-size`.

**Why:** Chrome headless clamps narrow windows to ~500 px and crops the screenshot. That hides overflow
and produced a false “mobile looks fine” result during the build.

## D12 — Screenshots are generated, not hand-edited

**Decision:** `tests/browser.test.mjs` writes every PNG in `assets/` except the favicon.

**Why:** a release screenshot should match the shipped UI. Regenerating on every browser run makes
staleness visible in `git status`.

## D13 — No external fonts or CDNs

**Decision:** system fonts only; no remote images or scripts.

**Why:** privacy, offline use, speed and a deterministic screenshot. The design was built around the
system serif rather than retrofitting it.

## D14 — `state.json` is a snapshot, not a bill

**Decision:** record the session id, elapsed time and the five token counters exactly as read from
OpenCode's database, with `costUSD: 0` on the flat-rate plan.

**Why:** the user asked for time and token consumption. Estimates would be less useful than a labeled
snapshot. A resumed session makes the snapshot stale; refresh it at the end of the work.
