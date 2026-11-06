# Decisions

Short architecture decision records. Each one records the choice, the reason, and what would break if
it were changed casually.

## ADR-001 — Three.js r128 via classic CDN scripts

**Decision:** Load `three.min.js` r128 and `OrbitControls.js` 0.128.0 as global classic scripts.

**Why:** The app must run from `file://`, GitHub Pages or any static host with no bundler. A pinned
pair is reproducible and the r128 addon path is stable. Classic scripts also keep `data.js` /
`algorithms.js` simple Node-requirable UMD files.

**Cost:** No tree-shaking, no modern `outputColorSpace`, no module imports. The app degrades without
3D when the CDN fails.

**Do not:** Upgrade Three.js or convert to modules without replacing every `THREE.*` call, the
OrbitControls URL and the scene tests.

## ADR-002 — Precomputed deterministic frames, not live algorithm animation

**Decision:** Engines compile input into a complete array of frames. The UI only changes an index.

**Why:** The slider, play/pause, code highlight, answer chip and tests all read the same immutable
trace. Algorithm logic never races the render loop. It also makes custom input cheap and testable.

**Do not:** Move engine work into `requestAnimationFrame` or derive state from the scene. Add a frame
to the engine instead.

## ADR-003 — Semantic code marks instead of line numbers

**Decision:** Each frame carries a `mark`; each code line declares a mark. The viewer highlights every
line with that mark.

**Why:** Python, JavaScript and C++ have different line counts and syntax. A line number map would be
three brittle tables. A mark can naturally cover two lines (`if/else` branches) and keeps the trace
readable.

**Cost:** Every frame mark must exist in all three listings; the test enforces it.

## ADR-004 — Fifteen bespoke scenes instead of one generic graph

**Decision:** Each pattern gets a purpose-built scene and camera.

**Why:** The curriculum's value is recognizing the *shape* of a problem. A generic bar chart would
teach nothing. Distinct geometry (ring, stack tower, voxel grid, decision tree, DP cuboids, token
track, arrows, clusters) makes the pattern memorable.

**Cost:** ~1,300 lines of scene code and 15 things to keep working.

## ADR-005 — Pure data module, no database

**Decision:** All curriculum, code and quiz content lives in `js/data.js`.

**Why:** The site is static; content is small; tests can require it; a non-developer can edit it. No
CMS, no fetch, no loading states.

**Cost:** Editing 45 code listings by hand is verbose. Acceptable at this size.

## ADR-006 — Local storage only

**Decision:** Practice checkboxes, preferences and quiz best live in `localStorage`.

**Why:** No account system, no backend, no privacy surface. The product promise is “your browser,
your progress”.

**Do not:** Add analytics, remote logging or a sync API without a privacy review and a migration plan.

## ADR-007 — Bounded custom input grammars

**Decision:** Compact text grammars with hard visual limits (≤14 values, ≤4 coins, amount ≤20,
grid ≤8×10, tree ≤31 slots, ≤10 edges).

**Why:** The visualization must stay legible and the frame count bounded. A full JSON editor would
raise the complexity of the UI and the test surface without improving the lesson.

**Cost:** Some valid inputs are rejected. Error messages explain the limit.

## ADR-008 — English-only UI

**Decision:** The product is English-only.

**Why:** The brief did not ask for a bilingual interface. A half-translated toggle would be worse than
none. The copy is technical and pattern names are conventionally English.

**Revisit:** If localization is requested, add a complete dictionary and tests for key symmetry, not a
partial toggle.

## ADR-009 — No inline event handlers or inline scripts

**Decision:** All behaviour is bound in `app.js`; the HTML has only external scripts.

**Why:** A future CSP should not require `unsafe-inline`; testability improves; markup stays readable.

## ADR-010 — Canvas labels as cached sprites

**Decision:** All 3D text is drawn to a canvas, cached by text/colour/size, and shown as a sprite.

**Why:** No font files, no external assets, consistent typography, and hundreds of labels remain cheap.
The cache is shared and must not be disposed with a scene.

## ADR-011 — Test harness with zero dependencies

**Decision:** `tests/lib/harness.mjs` implements a static server and Chrome DevTools Protocol client
with Node built-ins only.

**Why:** No Playwright/Puppeteer install, no lockfile, no Keychain prompts. `--use-mock-keychain` keeps
the suite away from the macOS login keychain. Node 22+ supplies `WebSocket`.

**Cost:** We maintain a small CDP client (connect, send, on, waitFor). It is ~120 lines.

## ADR-012 — State file as a build record

**Decision:** `state.json` records the OpenCode session, elapsed time, token counters, artefacts,
verification counts, deployment status and credits.

**Why:** The user asked for transparent build cost and a reproducible handoff. The session database is
the source of truth; the file is a snapshot.

**Do not:** Invent numbers. Query `session_v2` and record the timestamp of capture.
