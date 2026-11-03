# Testing

## Automated checks

```bash
node --check script.js      # syntax gate
node scripts/check.mjs      # files, ids, tabs, i18n, colours, links, state
```

`scripts/check.mjs` is dependency-free and runs in CI on every push and pull
request (`.github/workflows/ci.yml`). It verifies:

- required documentation and release files exist;
- JavaScript parses;
- HTML ids are unique and every `$('id')` reference resolves;
- three tabs, three panels and valid `aria-controls` targets exist;
- local `src`/`href` targets exist and no runtime resource is remote;
- the English and Thai dictionaries have identical key sets;
- every `data-i18n*` and `t('…')` key exists in both languages;
- the semantic colour contract is intact;
- runtime code contains no network APIs;
- `state.json` keeps its timing, usage, credit and deployment fields;
- relative Markdown links resolve;
- the licence remains MIT.

## Browser verification performed for 1.0.0

Headless Chrome 156 on macOS, driven over the DevTools Protocol. No console
errors or uncaught exceptions were recorded.

| Area | Check | Result |
| ---- | ----- | ------ |
| Inverse | arcsin(0.5) = π/6, 30.0°, 0.5236, valid branch | Pass |
| Inverse | arcsin(1.5) reports outside range and undefined | Pass |
| Inverse | domain [−π, π] reports not one-to-one, hides inverse | Pass |
| Inverse | arccos(0.5) = π/3; arctan(1) = π/4 | Pass |
| Inverse | dragging the branch updates input and result | Pass |
| Identity | sec²θ − tan²θ reaches 1 in two legal steps | Pass |
| Identity | sin³θ + sinθcos²θ advances through factor and identity | Pass |
| Identity | area model renders 1, tan²θ, sec²θ captions | Pass |
| Practice | √3tanθ − 3 = 0 accepts π/3, 4π/3 | Pass |
| Practice | 4sin²θ − 1 = 0 accepts four exact solutions | Pass |
| Practice | identity proof sin³θ + sinθcos²θ accepts sinθ | Pass |
| Practice | options disable, new problem resets form | Pass |
| i18n | EN ⇄ TH updates tabs, prompts, instructions, steps | Pass |
| Persistence | reload restores language, streak, 3 tabs | Pass |
| Export | button creates an `application/json` Blob | Pass |
| Layout | 390 px viewport: no horizontal overflow | Pass |

## Manual regression matrix

Run the rows that match your change; run all of them before a release.

### Every release

- [ ] All three tabs switch, with the active tab marked and the panel visible.
- [ ] Keyboard: Tab reaches controls, arrow keys move between tabs, focus ring visible.
- [ ] 1440 px and 390 px widths have no horizontal scrollbar.
- [ ] EN and TH both render without clipped labels.
- [ ] Reload preserves language, identity step and completed tabs.
- [ ] Export downloads `khan_trig_unit4_progress.json` with valid JSON.
- [ ] Browser console is clean.

### Inverse module

- [ ] sin/cos/tan switch resets the domain and input to the principal defaults.
- [ ] A domain outside the principal branch hides the inverse and shows the warning.
- [ ] Input inside range but outside the branch shows the distinct warning.
- [ ] arcsin/arccos inputs outside `[−1, 1]` are undefined; arctan accepts all.
- [ ] Exact values appear for π/6, π/3, π/4 and π/2 outputs.
- [ ] Dragging the point updates the input slider.

### Identity lab

- [ ] Every expression starts at step 0 and resets cleanly.
- [ ] Exactly one choice per step is accepted.
- [ ] Wrong choices do not advance and show red feedback.
- [ ] Progress dots mark done/current correctly.
- [ ] Area model labels match the selected identity.
- [ ] Reload resumes the saved expression/step.

### Solver

- [ ] Basic answers accept π, decimals and degree input.
- [ ] Answer order does not matter; 0 and 2π are equivalent.
- [ ] Wrong answers disable the form until a new problem.
- [ ] Quadratic factoring steps match the displayed equation.
- [ ] Identity options include the correct final form.
- [ ] Revealing steps shows all unit-circle intersections.
- [ ] Hiding steps clears timers and points.

## Manual browser coverage

| Browser | Status |
| ------- | ------ |
| Chrome 156 / macOS | Verified for 1.0.0 |
| Safari / iOS | Expected to work; not formally verified |
| Firefox | Expected to work; not formally verified |
| Edge | Chromium-based; expected to work |

If you verify a new browser, add it to this table and to the release notes.

## Headless method

The 1.0.0 verification used Chrome `--headless=new` with a dedicated profile and
the DevTools Protocol to:

1. navigate to the local `file://` page;
2. drive function buttons, domain/input sliders and pointer drags;
3. step through identity choices and inspect progress state;
4. parse generated equations, map them to exact answers and submit them;
5. select identity options and inspect feedback/steps;
6. switch language, reload, and inspect `localStorage`-backed UI;
7. capture desktop and 390 px screenshots;
8. assert zero exceptions and zero console errors.

The harness is intentionally not committed: it depends on a local Chrome path.
The static checks above are the reproducible gate.

## Known gaps

- No cross-browser automation in CI.
- Canvas pixels are not compared visually.
- Thai line-breaking is checked by eye, not by a font-metrics test.
- Screen-reader behaviour is tested manually, not in CI.
- The area model is qualitative, not numerically to scale for every θ.
