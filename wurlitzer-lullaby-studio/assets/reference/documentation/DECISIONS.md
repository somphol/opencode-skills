# Decisions

Short architecture decision records. Each one explains a constraint that is easy to break by accident.

## ADR-001 — No build step

**Decision:** ship `index.html`, `style.css`, `script.js` and one JSON file; load Three.js from a
pinned CDN import map.

**Why:** the product is a single static page on GitHub Pages. A bundler would add a toolchain, lockfile,
CI cache and release artifact for no user benefit.

**Consequence:** no npm dependency, no JSX, no tree-shaking. The import map must stay in sync with the
Three.js version used by the addons.

## ADR-002 — Pin Three.js 0.169.0 exactly

**Decision:** `three@0.169.0` for both `three` and `three/addons/`.

**Why:** the composer, RoomEnvironment and OrbitControls APIs move between releases; an unpinned CDN
can break the page without a commit.

**Consequence:** upgrades are deliberate: change both URLs, rerun the browser suite, capture new
screenshots.

## ADR-003 — Procedural cabinet, no model files

**Decision:** build the Wurlitzer from Three.js primitives, an extruded arch and canvas textures.

**Why:** a GLB would be a large binary, a loading dependency, a licence question and impossible to
diff. Procedural geometry keeps the repository text-only and lets the scene react to audio.

**Consequence:** the model is an evocation, not a replica. Changing proportions means editing
coordinates in `buildCabinet`.

## ADR-004 — Two audio engines, one graph

**Decision:** synth and archive streams share `musicBus`, EQ, compressor, master and timer gain.

**Why:** the sleep timer, mute, EQ and analyser must apply to both. Separate graphs would duplicate
that logic and drift.

**Consequence:** streams must be CORS-enabled to pass through Web Audio. The manifest validator
enforces https and provenance; failures are surfaced, not silently hidden.

## ADR-005 — Smoothstep timer fade, not linear

**Decision:** `fadeGain` uses `x*x*(3-2x)` over 120 s.

**Why:** a linear fade has an audible corner at the start and a hard stop at the end; smoothstep is
perceptually gentler and the midpoint is exactly 0.5, which is easy to test.

**Consequence:** the engine test asserts 0.5 at 60 s; changing the curve requires updating docs, tests
and the self-test.

## ADR-006 — 3D rack shows one eight-record page

**Decision:** the physical paper rack renders eight records from the active category page or the
current record's collection. The DOM rack renders all 88 slots with tabs and search.

**Why:** eight canvas textures stay legible at the cabinet's screen size. Sixty-four would shrink the
type below readability and add GPU memory. The eight-record page also matches the physical 1015 rack.

**Consequence:** the 3D rack is a mirror of the active page, not the whole library. Archive streams
(H–K pages) and all categories are reachable from the DOM tabs or the A–K keypad.

## ADR-007 — Engine markers and `new Function` tests

**Decision:** pure logic lives between `/* ENGINE:START/END */` and is re-evaluated in Node.

**Why:** a single-file static app still deserves fast, dependency-free unit tests. The marker boundary
is the contract.

**Consequence:** DOM, window, THREE, fetch and `new Date()` are forbidden inside the block; static
tests enforce it. Export timestamps are passed in as ISO strings.

## ADR-008 — Mock keychain in the browser harness

**Decision:** launch Chrome with `--use-mock-keychain` and `--password-store=basic`, temporary profile.

**Why:** the development machine's Chromium otherwise asks macOS Keychain for encryption keys on every
launch, which is noisy and blocks automated runs.

**Consequence:** no credential is read. The flags must stay in `tests/lib/harness.mjs` and any
screenshot script.

## ADR-009 — Settings are normalised, not trusted

**Decision:** one `normalizeSettings` gate clamps ranges, rejects unknown languages, deduplicates
favourites and caps lengths.

**Why:** `localStorage` is user-editable and survives version changes. Validation also prevents a
corrupt export from poisoning the UI.

**Consequence:** new settings must be added to `DEFAULT_SETTINGS`, `normalizeSettings`, the state schema
and the export docs.

## ADR-010 — Bilingual copy is handwritten and symmetrical

**Decision:** EN and TH dictionaries have identical keys; Thai copy is written for the product.

**Why:** machine translation reads badly in a sleep product, and asymmetrical dictionaries produce
silent English leaks.

**Consequence:** a static test compares sorted key arrays; every new UI string needs both languages.

## ADR-011 — 50 synth tracks in seven collection pages, not one long list

**Decision:** the library is 50 synth records in seven synth pages (A–G) plus 32 archive records in
four archive pages (H–K), for 11 collections and 88 slots (A-1…K-8). The DOM shows one category page
at a time by default; All shows all 88 slots. The 3D
rack shows the active page (or the current track's collection).

**Why:** a 50-row list is unreadable on a 330 px panel, and 50 canvas textures in the 3D rack would be
illegible. Category tabs, search and an eight-record physical page preserve the jukebox metaphor.

**Consequence:** the keypad is A–K + 1–8, not A–D. Adding a track means assigning an unused slot and
a collection page; `getRackRows()` is the single filter path for tabs, search and favourites.

## ADR-012 — Themes recolor CSS + 3D, text size scales type only

**Decision:** four themes (`midnight`, `amber`, `emerald`, `rose`) set CSS variables and call
`scene.setTheme()`; text size (`normal`, `large`, `xlarge`) sets `body[data-font]` and targeted type
overrides.

**Why:** CSS variables alone cannot recolor the WebGL scene, and browser zoom breaks a fixed canvas
stage. A targeted type scale keeps the layout stable and the canvas aligned.

**Consequence:** new components need both a base size and the three size overrides; new themes need
CSS tokens plus a scene color set. Both preferences are part of `normalizeSettings` and the export.

## ADR-013 — 32 archive performances, four pages, source links

**Decision:** the archive is a first-class library of 32 real public-domain performances in H–K, not
four demo streams. Every entry has a `source` URL, and the UI links to it.

**Why:** H-3/H-4 proved that real performances carry timbre, polyphony and human timing the synth
cannot. A larger archive gives the product its emotional centre.

**Consequence:** the rack grows to 88 slots and the keypad to A–K. The manifest validator and static
test require `license: "Public domain"`; do not add a share-alike, attribution-only or copyrighted
recording.

## ADR-014 — First-listen queue plus a gesture prompt

**Decision:** on first open, load an eight-track archive queue and show a gold “Start the first-listen
playlist” button. On click, start the queue; auto-advance on `ended`.

**Why:** browsers block audible autoplay. A prompt preserves the intent (“the app opens with these
songs”) without lying about autoplay or swallowing the blocked-play error. Archive tracks are used
because they end and advance naturally; synth loops never end.

**Consequence:** `DEFAULT_QUEUE` is archive-only, `queueMode` controls next/previous, and a separate
localStorage key records the first run. The prompt is not a modal and does not block the instrument.
