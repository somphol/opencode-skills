# Contributing

Thanks for helping the little jukebox glow. This is a zero-build static project, so contributions
are deliberately simple.

## Before you start

- Open an issue for a behaviour change or a new sound layer. Small fixes can go straight to a PR.
- Read [AGENTS.md](AGENTS.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Do not add npm, a bundler, a framework, analytics or a backend.
- Do not commit downloaded audio. The manifest points at CORS-enabled public-domain sources.

## Development loop

```bash
python3 -m http.server 8000
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs
```

For UI work, include a screenshot or a short screen recording in the PR. For audio work, describe
the melody provenance and confirm it is public domain or freely licensed. For a new archive track,
add a manifest entry with `slot`, `title`, `artist`, `url` (https), `duration`, `license`, `credit`
and `source`.

## Style

- ES2022 modules, two-space indentation, single quotes, semicolons.
- Keep pure logic between the engine markers free of DOM, network, Three.js and `Date`.
- Add a translation key to **both** dictionaries; `tests/static.test.mjs` enforces symmetry.
- Update `README.md`, `CHANGELOG.md`, `state.json` and `docs/` when behaviour or release facts change.
- Accessibility is part of done: keyboard path, focus visibility, ARIA state and reduced motion.

## Commit messages

Use the imperative mood and a short scope: `audio: soften the rain droplets`,
`3d: fix the tone-arm pivot`, `docs: record the live verification`.

## Pull requests

The template asks for the user-visible change, the verification run and any licence implications.
By contributing you agree your code is released under the MIT licence.
