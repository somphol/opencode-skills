---
name: Algorithm Explorer Studio
description: Build a release-grade, zero-asset 3D algorithm-pattern explorer: 15 deterministic step engines, 15 procedural Three.js scenes, mark-synchronized Python/JS/C++ code, a 30-question quiz, local practice tracking, headless verification and a GitHub Pages release.
version: 1.0.0
---

# Algorithm Explorer Studio

Turn “build an interactive 3D algorithm visualizer” into a shipped, verified product: fifteen
patterns, each with a deterministic step engine and a purpose-built Three.js scene, synchronized
Python/JavaScript/C++ source, custom input, a recognition quiz, a persistent practice tracker, three
test layers and a Pages release.

Built from **Algorithm Explorer: Top 15 SWE Interview Patterns** — 47 Node checks, 35 headless-browser
checks, 24 in-page checks, zero console errors. Reference source: `assets/reference/`. Live product:
<https://somphol.github.io/algorithm-explorer/>.

## When to use

Use this skill when the user wants:

- a 3D (or 2.5D) educational visualizer for algorithms, data structures or a pattern curriculum;
- step-by-step playback where a 3D state and a code line move together;
- multiple algorithms sharing one polished studio shell;
- a static, backend-free learning app deployable to GitHub Pages;
- a quiz + practice tracker attached to technical content;
- a release-grade repository with tests, docs, screenshots and a build record.

Do **not** use it for a code judge, an execution sandbox, a generic graph editor, a game, or a
multiplayer product. The frame/mark contract is specific to explanatory traces.

## What “done” means

| Gate | Command | Expected |
| --- | --- | --- |
| Engine + static | `node --test tests/engine.test.mjs tests/static.test.mjs` | 47/47 |
| In-page | `?test=1` → `window.__algo.runSelfTest()` | 24/24 |
| Real browser | `node tests/browser.test.mjs` | 35/35, zero console errors |
| Live copy | `TEST_URL=https://… node tests/browser.test.mjs` | 35/35 |
| Visuals | `node scripts/screenshot.mjs` | 6 fresh assets |
| Docs | README, AGENTS, 12 docs, community files | links resolve |
| Metadata | `state.json`, licence, sitemap, social card | shape valid |
| Deployment | Pages 200 for `/`, `/css/style.css`, `/js/app.js` | live |
| Handoff | `AGENTS.md` in the **same push** | current |

If a number is lower, fix the cause; never edit the claim.

## Non-negotiables

1. **Engines are pure and precomputed.** `run(patternId, input)` returns all frames. The UI only
   changes an index. Never animate algorithm logic inside `requestAnimationFrame`.
2. **Frames highlight by semantic mark, not line number.** One mark can cover two branches and works
   across three languages. Every mark must exist in every language.
3. **Every scene is distinct and procedural.** No external models, textures or fonts. The shape is
   the lesson.
4. **Custom input is parsed, validated and bounded.** Errors are inline and preserve the previous
   trace.
5. **Three.js is pinned and loaded as classic scripts.** r128 + OrbitControls 0.128.0. The app must
   degrade to the non-3D tabs if the CDN or WebGL fails.
6. **Labels use a shared canvas-texture cache.** Skip shared textures in `disposeObject()`.
7. **The root backtracking key is the empty string.** `padStart(0)` does not produce `''`; special-case
   depth 0 or the tree crashes.
8. **Totals are asserted everywhere.** If counts change, update tests, README, AGENTS, state and the
   in-page self-test in one commit.
9. **No backend, analytics, accounts, inline handlers or build step.**
10. **The browser harness uses `--use-mock-keychain`.** Never trigger repeated macOS Keychain prompts.

## Workflow

### Phase 0 — scaffold

```sh
node scripts/new-project.mjs --out ~/Projects/algorithm-explorer
cd ~/Projects/algorithm-explorer
python3 -m http.server 8080
```

Write the README headline and AGENTS skeleton immediately. Decide counts: patterns, problems, quiz
questions, tests. They become contract constants.

### Phase 1 — data before pixels

Build `js/data.js` first:

- 15 pattern records with `id`, `index`, title, kicker, signal, description, time, space, visual,
  accent, default input, input label/hint, 4–5 problems, and three code listings.
- each code line is `{t, m}` with a semantic mark.
- 30 quiz questions with four unique options and an explanation.
- 61 canonical problems with exact LeetCode URLs.

**Gate:** every frame mark exists in all three languages.

### Phase 2 — engines

Build `js/algorithms.js`: bounded parsers, 15 engines, `run()`, `selfTest()`. Frame schema is
`{n, title, note, mark, data}`. No DOM, no `THREE`. Use `INF = 99`, never `Infinity`.

**Gate:** `ALGO_ENGINE.selfTest()` 18/18 and canonical default answers match.

### Phase 3 — shell

`index.html` + `css/style.css`: three role=tab panels, curriculum rail, stage, transport, inspector,
code panel, dialogs. Dark precision-instrument design; stage is the largest element; responsive at
1120/860/560 px; reduced motion; no inline handlers.

### Phase 4 — scenes and controller

`js/scene.js`: one renderer/camera/controls, rebuildable `dynamicRoot`, 15 builders, shared
label/tween/arrow/tree helpers. `js/app.js`: one state object, `buildCurrent`, `applyFrame`, transport,
code sync, quiz, practice, storage, keyboard, self-test.

**Gate:** every scene builds without an uncaught exception. Wrap `scene.setPattern` in try/catch so a
failed scene cannot leave a stale code panel and a half-built stage.

### Phase 5 — verification

```sh
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs
npm run screenshot
```

**Gate:** 47 + 35 + 24 = 106 checks, zero console errors.

### Phase 6 — release

Docs set: README, AGENTS, CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, LICENSE,
THIRD_PARTY_NOTICES, state.json, and `docs/{README,ARCHITECTURE,REPRODUCTION,CURRICULUM,DESIGN,
TESTING,DEPLOYMENT,DECISIONS,ACCESSIBILITY,PERFORMANCE,PRIVACY,FAQ,ROADMAP}.md`. Add `.github`
templates and CI, `.nojekyll`, robots, sitemap, favicon, screenshots and social card.

### Phase 7 — publish

Push `main`, enable Pages from root, wait for `built`, run the live browser suite, then publish the
skill snapshot and update `state.json`. See `references/release.md`.

## Module map

| File | Responsibility |
| --- | --- |
| `index.html` | three tab shells, stage, inspector, code panel, dialogs, CDN order |
| `css/style.css` | design tokens, studio grid, components, responsive, reduced motion |
| `js/data.js` | patterns, code listings, problems, quiz |
| `js/algorithms.js` | parsers, 15 pure engines, self-test |
| `js/scene.js` | renderer, 15 procedural builders, label/tween helpers |
| `js/app.js` | controller, playback, code sync, quiz, practice, storage, self-test |
| `tests/engine.test.mjs` | data + engine contract, 27 tests |
| `tests/static.test.mjs` | repo/product contract, 20 tests |
| `tests/browser.test.mjs` | CDP browser suite, 35 checks |
| `tests/lib/harness.mjs` | dependency-free static server + Chrome CDP client |
| `scripts/screenshot.mjs` | regenerates documentation assets |

Read [references/method.md](references/method.md) for schemas and scene recipes,
[references/lessons.md](references/lessons.md) for the bugs that cost time,
[references/verification.md](references/verification.md) for the gate, and
[references/release.md](references/release.md) for docs, Pages, keychain-safe publishing and the state
capture.

## Signature recipes

### A frame

```js
push('Compare the pair',
     `nums[${l}] + nums[${r}] = ${sum}. Target ${target}.`,
     'loop',
     { l, r, sum, found: null, nums, target });
```

### Mark-synchronized code

```js
python:     [{ t: 'while left < right:', m: 'loop' }]
javascript: [{ t: 'while (left < right) {', m: 'loop' }]
cpp:        [{ t: 'while (left < right) {', m: 'loop' }]
```

The viewer highlights every line whose `m` equals the frame's `mark`.

### A scene updater

```js
function buildX(result) {
  const cubes = result.meta.nums.map(...);       // create once
  return (data) => {
    cubes.forEach((cube, i) => tween(cube, {
      position: [x(i), active ? 0.2 : 0, 0],
      color: active ? pattern.accent : '#1b3557',
      emissiveIntensity: active ? 0.6 : 0.1
    }));
  };
}
```

`tween()` stores target position/scale/colour; the render loop damps toward it. Do not create
geometry in the updater.

### A custom-input parser

```js
const [listText, targetText] = splitPair(input, ['2, 7, 11, 15', '9']);
const nums = numberList(listText, { label: 'Array' });
const target = num(targetText, 'Target');
```

## Failure boundaries

- Not a judge: no code execution, hidden tests or submissions.
- Not a 3D modelling tool: scenes are educational schematics, not to scale.
- Not offline-first: Three.js is CDN-loaded; no vendored fallback by design.
- Not bilingual: this product is English-only. A half-translation is worse than none.
- Not a generic graph editor: input grammars are bounded for legibility.
- Not a content mirror: link to canonical problems; never copy premium curriculum text.
