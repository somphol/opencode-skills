# Contributing

This is a designed artifact, not a general-purpose product. Contributions are welcome when they
preserve the visual language, the offline constraint and the release gate.

## Before you start

```sh
npm install
npm run serve       # http://localhost:4173
```

You need Node 22+ for the state tooling and Chrome for the release gate. The site itself is plain
HTML, CSS and ES modules with no build step.

## What to change

- **Content and copy** live in `index.html`. Keep the editorial voice: short declaratives, lower-case
  captions, no exclamation marks, no marketing superlatives beyond the established fiction.
- **Visual behaviour** lives in `styles.css`. Use the tokens at the top of the file. Do not add
  photographic backgrounds or third-party UI kits.
- **The watch** lives in `src/watch.js`. It is unitless by design: case radius `1.0`, dial `0.884`,
  movement between `z = -0.11` and `z = 0.03`.
- **The timeline** lives in `src/main.js` at `CAMERA_KEYS`, `WATCH_ROT_Y`, the chapter measurement and
  the part windows in `src/watch.js`. The normalized `t` contract is described in
  [`docs/TIMELINE.md`](docs/TIMELINE.md).

## Constraints

1. **No new assets.** No GLB/GLTF, no photographic textures, no audio files. Generate what you need.
2. **No build step and no CDN.** Three.js stays vendored and pinned; fonts stay self-hosted. The page
   must work offline after load.
3. **No external runtime requests.** The release gate fails if the page loads one.
4. **The stage is fixed, not sticky.** A sticky stage steals a viewport of document flow.
5. **Every part must reassemble.** At `t = 1` all transforms must be within 0.05 of base.
6. **Keep the brief honest.** The documentation records that the working prompt was one sentence.
   Do not rewrite history as if a larger spec existed.

## Verify

```sh
npm run verify
```

The gate starts a local server and checks 24 behaviours, then rewrites the screenshots. If you change
a visible state, inspect the regenerated images. If you add a check, update the count in
`README.md`, `AGENTS.md`, `state.json` (via `npm run state`), the colophon and
`docs/VERIFICATION.md`.

## Pull requests

- Keep the change focused; explain the visual intent with a before/after screenshot.
- Update `CHANGELOG.md` for user-visible changes.
- Run `npm run verify` and `npm run state`.
- Do not commit `node_modules`, local credentials, session databases or a machine-specific path.
- Do not add third-party brand marks or copyrighted watch photography.

By contributing, you agree that your contribution is licensed under the project's MIT licence.
