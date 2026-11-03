# Verification

## Three gates

```sh
node --check script.js
node scripts/check.mjs
node scripts/browser-check.mjs
```

1. **Syntax** — catches parse errors before anything else.
2. **Static** — files, IDs, tabs, assets, i18n parity, colours, links, state.
3. **Browser** — real DOM, canvas, pointer, persistence and mobile.

The static checker runs in CI. The browser checker needs Node 22+ and Chrome;
run it before every release, and after any change to canvas, maths, state,
i18n or timers.

## Static checks (17 in the Unit 4 reference)

- required files: source, docs, templates, CI, scripts, state, hero;
- `script.js` and `browser-check.mjs` parse;
- HTML head has lang, viewport, description and title;
- HTML IDs are unique;
- exactly 3 tabs and 3 panels, with valid `aria-controls`;
- every `$('id')` reference exists;
- local assets resolve; no remote runtime assets;
- EN/TH dictionaries have identical key sets;
- every `data-i18n*` and literal `t('…')` key exists in both;
- semantic colours exist in CSS and JS;
- no `fetch`/XHR/WebSocket/EventSource;
- `state.json` has timing, token, credit and Pages fields;
- relative Markdown links resolve;
- LICENSE is MIT.

When adding a module, extend the required-file list and tab/panel assertions.

## Browser checks (15 in the Unit 4 reference)

The committed `scripts/browser-check.mjs`:

1. launches Chrome headless with a temporary profile (detects macOS/Linux paths,
   `CHROME_BIN` override);
2. opens `file://…/index.html?browser-check=…`;
3. connects over the DevTools Protocol using global `WebSocket`;
4. asserts:
   - arcsin(0.5) = π/6, valid branch;
   - arcsin(1.5) = undefined;
   - domain [−π, π] is rejected;
   - identity step 1 advances;
   - sec²θ − tan²θ simplifies to 1;
   - basic equation answer accepted;
   - basic solution reveals 4 steps;
   - quadratic equation answer accepted;
   - identity proof option accepted;
   - identity proof shows ≥2 explanation rows;
   - Thai switch;
   - reload keeps language, 3 correct, 3 completed tabs;
   - export is `application/json` > 100 bytes;
   - 390 px mobile has no horizontal overflow;
   - no uncaught exceptions.
5. kills Chrome and removes the profile.

### Adding browser checks for a new module

- Compute the expected answer from the rendered equation, not from a hardcoded
  random seed.
- Map all templates; fail with the unknown equation text if a template is added
  without updating the map.
- Prefer deterministic actions: set slider values via `input` events, click
  buttons, read text.
- Wait for animations (600–2300 ms) rather than inspecting internal variables.
- Assert *at least* for step counts that vary by template.

## Manual matrix

Every release:

- all tabs switch, active state and panel visibility;
- keyboard tab navigation, focus visible;
- 1440 px and 390 px no horizontal scroll;
- EN/TH both render, no clipped labels;
- reload restores language, scores, completed tabs, module-specific step;
- export downloads the fixed filename with valid JSON;
- console clean.

Module-specific:

- **Inverse:** all 3 functions; invalid domain; out-of-range; outside-branch;
  exact π/6, π/3, π/4; drag.
- **Identity:** every expression; exactly one correct choice; wrong stays put;
  progress dots; area-model captions; reload step.
- **Solver:** each template; answer order; 0 vs 2π; decimals and degrees;
  steps reveal points; identity options; new problem reset.
- **Mobile:** header, tabs, cards, canvas, choices, form, steps.

## CDP skeleton

```js
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = list.find(t => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
// send({id, method, params}); resolve by id
await send('Runtime.enable')
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
await send('Page.navigate', { url })
// Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true, userGesture: true })
```

`Runtime.exceptionThrown` events are the truth source for console errors;
assert the array is empty.

## State measurement

The build state is a snapshot:

```sql
select tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write
from session_v2
where id = '<session-id>';
```

Record the start snapshot, the end snapshot, and the delta. `totalTokens` is the
sum of all five counters; note that cache reads dominate. Elapsed is wall-clock
UTC from first tool call to state capture. Cost is 0 on the flat plan.

## Reproducibility test

For the skill itself:

```sh
node scripts/new-project.mjs --out /tmp/trig-check --unit 5 --title "Unit 5 Test Studio" --slug trig-check --owner example
cd /tmp/trig-check
node scripts/check.mjs
node scripts/browser-check.mjs
rm -rf /tmp/trig-check
```

A skill is not done until this passes from a clean directory.
