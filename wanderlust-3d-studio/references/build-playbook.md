# Build playbook

A phase-by-phase guide to producing the atlas in one focused session.

## Phase 0 — orient (5–10 minutes)

- Inspect the parent projects directory for conventions.
- Check Node, npm, Chrome and GitHub auth.
- If GitHub CLI is absent, confirm the credential helper works with a non-mutating
  `git ls-remote` against an existing repo. Do not print the credential.
- Find the OpenCode session record early if you need token/time accounting. The database is
  `~/.local/share/opencode/opencode.db`, table `session_v2`, fields `tokens_input`, `tokens_output`,
  `tokens_reasoning`, `tokens_cache_read`, `tokens_cache_write`, `cost`, `time_created`.

## Phase 1 — content freeze (30–45 minutes)

- Choose 3 regions and 5 destinations each.
- Write the data contract first.
- Decide the budget tiers and the interest tag vocabulary.
- Draft the 15 overviews, attractions, cuisine, culture, season notes and tips.
- Do not start CSS until the shape is stable; otherwise the modal and filters will be rebuilt twice.

## Phase 2 — image curation (30–60 minutes)

- Build the candidate list.
- Download thumbnails and make a contact sheet.
- Inspect and reject mismatches.
- Map primaries, region heroes, route cards and gallery supports.
- HEAD-test the final 24.

See `content-and-images.md` for the exact method.

## Phase 3 — shell and design (60–90 minutes)

`index.html`:

- meta, Open Graph, Twitter, canonical, JSON-LD
- inline SVG sprite
- fixed header + mobile menu
- three static hero slides (first eager, others lazy)
- explorer shell with region tabs, region brief, filter panel, grid, empty state
- routes, ethos, about, CTA, footer
- drawer, modal, toast, back-to-top

`style.css`:

- tokens first; every colour, radius and shadow comes from a token
- reset + type
- buttons and icons
- header (transparent → glass)
- hero (scrim, type, search, controls)
- explorer (tabs, brief, filters, grid, cards, empty)
- routes, ethos, about, CTA, footer
- drawer, modal, toast, back-to-top
- responsive at 1080, 940, 760, 520, 380
- reduced motion and print

Design notes:

- Warm paper `#f7f2e8`, emerald `#0d3b2e`, sunset `#e8794f`.
- Display serif for headlines, system sans for UI.
- One italic word per headline.
- Photography carries colour; keep the UI quiet.
- Region accents are written to `--accent` / `--accent-soft`.

## Phase 4 — behaviour (90–120 minutes)

`script.js` in one IIFE:

1. Constants, helpers, maps.
2. State and `localStorage` load/save.
3. Renderers: tabs, brief, chips, grid, routes, trip drawer, modal.
4. Filters: region, query, tags (OR), budget, sort.
5. Modal: gallery, add, prev/next, hash, focus trap.
6. Trip: add/remove, nights, totals, copy, download, clear.
7. Routes: add all missing.
8. Hero: slides, dots, arrows, progress, autoplay, reduced motion.
9. Polish: toasts, reveals, menu, scroll header, back-to-top, image fallbacks.
10. Init and deep link.

Key decisions:

- `currentList` stores filtered IDs so modal prev/next respects filters.
- `replaceState` for the hash; handle `popstate`.
- `syncAddButtons()` updates every matching button after a change.
- `syncScrollLock()` from `modalOpen || drawerOpen`.
- `trapTab()` for both overlays.
- `esc()` every catalogue string.

## Phase 5 — verification (30–45 minutes)

- Write a static server (~60 lines) and a verify suite.
- Test counts, filters, search, modal, gallery, trip, routes, persistence, deep link, mobile, tablet,
  accessibility and console errors.
- Fix mobile issues:
  - reset `figure { margin: 0 }`
  - region tabs as a 2×2 grid on mobile
  - filter selects stacked and full width
  - chips as one horizontal scroll row
  - hide the floating back-to-top on mobile
  - modal reorder: stats/add → story → budget/months
  - hide the hero submit text below 760 px
- Regenerate screenshots and inspect them.

Expected: 81/81.

## Phase 6 — release assets and docs (45–60 minutes)

- 404 page, manifest, app icon, robots, sitemap, Pages workflow.
- 1200×630 social card built from the hero photo + the project's type.
- README with badges, screenshots, quick start, verification, structure, model, deployment, credits.
- AGENTS.md: what, commands, architecture, decisions, known issues, continuity.
- docs: architecture, data schema, design system, verification, deployment, reproduction.
- contributing, changelog, security, credits, licence.
- Update Open Graph/Twitter to the social card.

## Phase 7 — publish (15–30 minutes)

- Commit the release.
- Create the repo via the API with the stored credential (one read).
- Push.
- Enable Pages with `build_type: workflow`; dispatch the workflow if needed.
- Verify the live URL, CSS, data and social image.
- Run a live smoke test in headless Chrome.

## Phase 8 — state and skill (20–30 minutes)

- Snapshot tokens and elapsed time into `state.json` / `STATE.md`.
- Copy the skill to the catalog, check it, sync, commit and push.
- Update the project's `AGENTS.md` continuity with the live URL and skill path.

## Layout patterns worth reusing

### Hero

- `min-height: 100svh`
- absolute slides, `object-fit: cover`
- two-layer scrim (left + bottom)
- grain overlay at low opacity
- content max-width 760, headline `clamp(3.4rem, 8.8vw, 7.6rem)`
- search pill with translucent paper and emerald submit
- dots + arrows + progress bottom-right

### Destination card

- 4:3 media, region badge top-left, budget top-right
- body: region meta, serif title, tagline, 3 tags, season + nights
- whole card is a link; Add button is a sibling overlay
- hover: -6 px lift, image 1.055× scale
- mobile: add button becomes a 38 px emerald circle, label hidden

### Modal

- desktop: 1120 px panel, 16:7 hero, two-column body, sticky sidebar
- mobile: full-screen panel, 46vh hero, stats/add first via `display: contents` + `order`
- gallery thumbs over the hero bottom-right
- budget bars, 12-month strip, culture/season note cards
- focus close on open, restore opener on close

### Drawer

- 460 px desktop / 100% mobile
- thumbnail row, night stepper, cost per item
- sticky footer with places / nights / total
- copy and download from the same text builder
- double-click clear

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| Hero image has side bars | `figure { margin: 0 }` |
| Region tabs too tall | short `tabNote`, nowrap, 2×2 grid on mobile |
| Select text clipped | stack labels above full-width selects on mobile |
| Add button hidden by back-to-top | hide back-to-top ≤760 px |
| Modal stats push story too far down | reorder via display:contents |
| Drawer doesn't open after modal | close modal first; the backdrop otherwise catches the click |
| Search returns “too many” | semantic search is intentional; rank by dataset order |
| `localStorage` throws | catch, keep in memory, toast once |
| Tailwind warning | document it; remove two script tags if not required |
| Pages first run fails | enable Pages, then dispatch the workflow again |

## Time budget

A focused build with 15 researched destinations, 24 verified images, a full test suite and docs is
roughly 4–6 hours of agent work. The largest variable is image curation and copy. Do not skip the
contact sheet to save 20 minutes; mismatched photography is the most visible defect in a travel site.
