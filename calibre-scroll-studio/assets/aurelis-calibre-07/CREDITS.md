# Credits

## The brief

> “Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that
> disassembles as the user scrolls.”

This 17-word sentence (typo included) was the entire working brief. The
[source video](https://www.youtube.com/watch?v=jTFGF4tCKTM) uses a much longer prompt. This project
was a deliberate experiment: how much narrative, engineering, art direction, verification and
release process could DeepSeek V4.1 Flash infer from one sentence inside OpenCode?

## Build

| | |
| --- | --- |
| Harness | [OpenCode](https://opencode.ai/) 2.2.6 |
| Model | DeepSeek V4.1 Flash (`deepseek-v4.1-flash`, `opencode-go`) |
| Agent | `build` |
| Session | recorded in [`STATE.md`](STATE.md) and [`state.json`](state.json) |
| Checks | 24 headless Chrome checks |

OpenCode supplied the agent loop, tool execution, session storage, subagents and the release
workflow. DeepSeek V4.1 Flash supplied the model work: architecture, geometry, copy, verification
and the decisions recorded in [`docs/BUILD-LOG.md`](docs/BUILD-LOG.md).

## Runtime and type

- [Three.js](https://threejs.org/) r170 — MIT. Vendored at `vendor/three.module.min.js`.
- [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) — SIL Open Font License 1.1.
  Self-hosted at `fonts/`; the licence text is included.
- System sans stack (Helvetica Neue / Helvetica / Arial) for the micro-typography.

## Concept

- Prompt and concept reference: [the scroll-driven watch video](https://www.youtube.com/watch?v=jTFGF4tCKTM).
  No footage, imagery, code or brand marks from the video are used.
- Aurelis, Calibre 07, “Anatomy of a Second”, the copy, the watch geometry, the dial artwork and the
  site design are original and fictional.

## Assets

There are no photographic, model or audio assets. The dial, caseback engraving, movement
signature, environment map and every mesh are generated at runtime from code.

## Licence

Code: MIT. Fonts: OFL 1.1. Three.js: MIT. See [`LICENSE`](LICENSE),
[`fonts/OFL.txt`](fonts/OFL.txt) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
