# Contributing

Thanks for considering a contribution. This is a static teaching tool; the bar is correctness,
clarity and zero console errors.

## Setup

```bash
git clone https://github.com/somphol/algorithm-explorer.git
cd algorithm-explorer
python3 -m http.server 8080      # open http://localhost:8080/
```

No install, no build. Node 22+ is only needed for tests.

## Before opening a pull request

```bash
npm test                         # engine + static
npm run test:browser             # real Chrome, 35 checks
npm run screenshot               # only if visuals changed
```

All gates must pass. If you change a count (patterns, problems, quiz), update README, AGENTS,
`state.json`, the tests and the in-page self-test in the same pull request.

## Adding or editing a pattern

Read [docs/REPRODUCTION.md](docs/REPRODUCTION.md#7-adding-a-sixteenth-pattern). In short:

1. Add the pattern record, problems and three code listings in `js/data.js`.
2. Add a parser + engine in `js/algorithms.js`; every frame `mark` must exist in all three languages.
3. Add a scene builder and camera in `js/scene.js`; register it in `BUILDERS`.
4. Add canonical answers and error cases to `tests/engine.test.mjs`.
5. Add a browser check for the scene.
6. Update the curriculum/docs/state and run everything.

## Code style

- Vanilla ES2020+, two-space indent, semicolons, single quotes, trailing commas in multiline literals.
- No framework, bundler, npm runtime dependency or inline event handler.
- Keep engines pure: no DOM, no `THREE`, no storage.
- Keep storage reads defensive; never assume a key exists or is valid.
- Prefer native elements and ARIA roles over custom widgets.
- Do not introduce `console.log` in runtime files. Tests may log.
- Comments explain the non-obvious contract, not the syntax.

## Visual changes

- Use the existing tokens in `:root`; new colours need a reason.
- Keep the stage the largest element at every breakpoint.
- Check 1600×1000, 1200×800 and 390×844.
- Respect `prefers-reduced-motion`.
- Do not add external fonts, images or audio; geometry and CSS should carry the design.

## Content changes

- Use precise pattern language (“monotonic stack”, “invariant”, “feasibility predicate”).
- Keep signal keywords to one sentence.
- Link canonical LeetCode problems only; no scraped statements, no premium copies.
- Quiz explanations must state why the correct pattern fits and, where useful, why a distractor does
  not.

## Reporting bugs

Use the bug template and include: URL, browser/OS, pattern id, input, step number, expected vs actual,
and the console text. Screenshots help. Do not paste secrets or personal data.

## Licence

By contributing you agree that your work is released under the MIT licence of this repository.
