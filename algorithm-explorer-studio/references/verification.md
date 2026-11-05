# Verification

## Gates

| Layer | Command | Checks |
| --- | --- | ---: |
| Engine | `node --test tests/engine.test.mjs` | 27 |
| Static | `node --test tests/static.test.mjs` | 20 |
| Combined | `npm test` | 47 |
| Browser | `node tests/browser.test.mjs` | 35 |
| In-page | `?test=1` → `window.__algo.runSelfTest()` | 24 |
| Total | `npm run verify` | 106 |

All must pass with zero console errors. Update README, AGENTS, state and this file if counts change.

## Engine suite

No dependencies; `tests/lib/fixtures.mjs` evaluates `js/data.js` and `js/algorithms.js` as text so the
test exercises the exact browser files. Covers:

- dataset counts, unique ids, sequential indices;
- complete metadata and ≥ 4 problems per pattern;
- LeetCode URL shape, difficulty values;
- quiz: four unique options, valid answer, 30 questions, all 15 patterns represented;
- frames: numbered, titled, noted, marked, data present, JSON-serializable;
- every frame mark exists in Python, JavaScript and C++;
- `selfTest()` 18/18;
- all 15 default answers;
- custom cases (unsorted input, no cycle, nested intervals, k=1/k=n, tight budget, two paths, five
  diagonal islands, 16 subsets, unreachable amount, missing at both ends, single node, acyclic graph);
- malformed inputs throw actionable errors;
- parser bounds hold;
- no `Infinity` survives serialization.

## Static suite

- required source, test, docs, community and metadata files;
- HTML doctype/lang/viewport, 3 top-level tabs, stage, 3 code tabs, dialogs;
- script order: Three.js → OrbitControls → data → algorithms → scene → app;
- no inline event handlers or inline script bodies;
- CSS tokens, 860/560 breakpoints, reduced motion, stylesheet size;
- runtime JS parses;
- no `console.*`, `debugger`, TODO/FIXME or `eval` in runtime files;
- data and quiz contracts;
- `state.json` shape and ≥ 100 total checks;
- sitemap/robots/nojekyll/OG/theme metadata;
- README/AGENTS local links resolve;
- AGENTS handoff sections;
- no secrets, tokens, private keys, emails or `/Users/...` paths;
- package scripts;
- runtime file size floors and UTF-8 cleanliness;
- screenshots exist;
- no hidden fetch/XHR/analytics in runtime.

## Browser suite

`tests/lib/harness.mjs`: static server + one headless Chrome + built-in WebSocket CDP. Flags:
`--use-mock-keychain --password-store=basic --enable-unsafe-swiftshader`, temp profile. Never touches
the real macOS Keychain.

Checks (35):

1. boot, WebGL canvas, loading hidden, 15 rail items, default trace;
2. in-page 24/24;
3–17. every pattern: scene id, frames, title, code caption, active line, input, canvas, last frame;
18. Next/Prev;
19. slider + result chip;
20. play/pause;
21. custom input;
22. malformed input preserves trace;
23. three language tabs;
24. LeetCode links;
25. quiz tab/options/dots;
26. correct feedback;
27. wrong feedback;
28. full 30-question round + 100% best persisted;
29. 61 practice rows in 15 groups;
30. difficulty/search filters;
31. checkbox persists across reload + clear;
32. help/about dialogs;
33. keyboard shortcuts;
34. 390 px mobile, no horizontal overflow;
35. zero console errors/exceptions.

The `evaluate()` helper must throw on `exceptionDetails`; otherwise a broken direct call can look like
a pass. It also subscribes to `Runtime.exceptionThrown` and `Log.entryAdded`.

## Live proof

```sh
TEST_URL=https://somphol.github.io/algorithm-explorer/ node tests/browser.test.mjs
```

Wait for Pages `status: built`, then run. This proves the CDN scripts, Pages paths and production
cache. Local-only tests are not enough.

## Screenshots

```sh
npm run screenshot
```

Writes `assets/studio.png`, `tree.png`, `quiz.png`, `practice.png`, `mobile.png`, `og-card.png`. The OG
card is a 1200×630 page embedding `studio.png`; keep the frame ratio equal to the screenshot ratio.

## Adding a check

- Engine/algorithm behaviour → `tests/engine.test.mjs`.
- Repository/product shape → `tests/static.test.mjs`.
- Anything involving DOM/WebGL/timing → `tests/browser.test.mjs` + `window.__algo.runSelfTest()`.
- Update the counts in README/AGENTS/state/docs and the in-page check count.
