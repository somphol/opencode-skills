# Testing

## Gate summary

| Layer | Command | Checks | What it proves |
| --- | --- | ---: | --- |
| Engine + data | `node --test tests/engine.test.mjs` | 27 | every engine, parser, answer, error path and frame contract |
| Static contract | `node --test tests/static.test.mjs` | 20 | files, markup, docs, metadata, links, no secrets |
| Browser | `node tests/browser.test.mjs` | 35 | real WebGL, all 15 scenes, transport, code, quiz, practice, mobile |
| In-page | `?test=1` → `window.__algo.runSelfTest()` | 24 | runtime DOM + engine + canvas sanity |
| Total | `npm run verify` | 106 | release gate |

The numbers in README, AGENTS, `state.json` and the in-page self-test must agree. If a number is
lower, fix the cause; never edit the claim.

## 1. Engine suite (`tests/engine.test.mjs`)

Uses `node:test` and `assert/strict`, no dependencies. `tests/lib/fixtures.mjs` reads `js/data.js` and
`js/algorithms.js` as text and evaluates them in a function scope, so the test exercises the exact
browser files.

Coverage:

- 15 patterns, 30 quiz questions, 61 problems, unique ids, sequential indices.
- complete metadata and at least four problems per pattern.
- every LeetCode URL shape and difficulty value.
- four unique quiz options and a valid answer index per question.
- every engine builds numbered, serializable frames with title/note/mark/data.
- every frame mark exists in Python, JavaScript and C++.
- 18-check `selfTest()`.
- canonical answers for all 15 defaults.
- custom cases: unsorted two pointers, repeated characters, acyclic lists, nested intervals,
  monotone temperatures, k=1/k=n, tight hour budgets, two matching paths, 5 diagonal islands,
  16 subsets, unreachable coin amounts, missing values at both ends, single-node reversal,
  redundant vs. acyclic unions.
- malformed inputs raise actionable messages.
- parser bounds remain inside the visual limits.
- no `Infinity` survives JSON serialization.

Run one layer at a time while developing; the whole engine suite is under a second.

## 2. Static suite (`tests/static.test.mjs`)

Checks the repository as a product, not just the code:

- required source, test, docs, community and metadata files exist;
- `index.html` has doctype, language, viewport, three tabs, stage, code tabs, dialogs and the correct
  script order;
- no inline event handlers or inline `<script>` bodies in the shell;
- CSS defines tokens, responsive breakpoints and reduced-motion rules;
- all runtime JS parses with `new Function`;
- no `console.error`, `debugger`, `TODO` or `FIXME` in runtime files;
- `state.json` has the build-record shape;
- `sitemap.xml`, `robots.txt`, `.nojekyll`, licence and third-party notices are present;
- README/AGENTS reference the docs that actually exist;
- no secrets, tokens, private keys, emails or home paths in tracked text;
- runtime files stay above meaningful line thresholds (the product is not a stub).

## 3. Browser suite (`tests/browser.test.mjs`)

Dependency-free Chrome DevTools Protocol harness (`tests/lib/harness.mjs`):

- starts a static server on a free port;
- launches one headless Chrome with `--use-mock-keychain --password-store=basic`, a temp profile and
  SwiftShader, so it never prompts for macOS Keychain access;
- creates a target, connects over the built-in `WebSocket`, enables Runtime/Log/Page;
- evaluates DOM queries and dispatches real key events;
- collects console errors, uncaught exceptions and Log errors.

Checks:

1. boot, WebGL canvas, loading overlay hidden, 15 rail items, current trace;
2. in-page self-test 24/24;
3–17. each of the 15 patterns: active id, scene id, frame count, code caption, active line, input,
   canvas, last frame;
18. Next/Prev move exactly one frame and update the code;
19. slider jumps to the last frame and reveals the result chip;
20. Play advances, pause stops; state is consistent;
21. custom sorted input rebuilds the trace;
22. malformed input shows an error and preserves the previous trace;
23. all three language tabs render and keep an active line;
24. canonical LeetCode links are present, outbound and safe;
25. quiz tab, four options, 30 dots;
26. correct answer feedback;
27. wrong answer feedback and score/streak;
28. full 30-question round reaches 100% and persists the personal best;
29. practice lists 61 rows in 15 groups;
30. difficulty and search filters narrow the list;
31. checkbox persists across a reload, then clears;
32. help/about dialogs;
33. keyboard step/pattern/language;
34. 390×844 mobile layout with no horizontal overflow;
35. zero console errors/exceptions.

The suite takes roughly 60–90 seconds because it builds every scene and runs a whole quiz.

Screenshots are separate:

```bash
npm run screenshot   # assets/studio.png, tree.png, quiz.png, practice.png, mobile.png, og-card.png
```

## 4. In-page self-test

Open `index.html?test=1` and run:

```js
window.__algo.runSelfTest()
```

It returns `{total, passed, checks, app}` and writes `document.body.dataset.selftest`. Checks include
data counts, three languages, LeetCode URLs, engine self-test, mark coverage, custom input, invalid
input, rail, canvas/fallback, scene pattern, code lines, active line, slider max, counter format,
quiz options, quiz dots, practice rows, checkbox keys, localStorage, about stats, screenshot and
keyboard binding.

## 5. Live verification

```bash
TEST_URL=https://somphol.github.io/algorithm-explorer/ node tests/browser.test.mjs
```

This is the same 35 checks against the CDN-loaded public site. It is the release proof, not a
substitute for the local run. Wait for the Pages build first (usually 30–90 s after push).
