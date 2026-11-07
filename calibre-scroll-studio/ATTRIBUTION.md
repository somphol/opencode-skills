# Attribution

## Origin

This skill packages the working reference **Aurelis Calibre 07 — Anatomy of a Second**, built in one
OpenCode session with **DeepSeek V4.1 Flash** (`opencode-go`). The original prompt was a single
17-word sentence:

> “Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that
> disassembles as the user scrolls.”

The source video's prompt is much longer; the small prompt was a deliberate experiment. The template
and its documentation keep that provenance explicit.

- Reference site: <https://somphol.github.io/aurelis-calibre-07/>
- Reference source: <https://github.com/somphol/aurelis-calibre-07>
- Concept reference: <https://www.youtube.com/watch?v=jTFGF4tCKTM>

## What is reused

- The full procedural watch, site shell, timeline, callouts, verification gate and documentation from
  the reference project. The template is the actual working artifact, not a reconstruction.
- Nothing from the source video: no footage, imagery, copy, code or brand marks.
- No third-party watch brand, logo or photograph is included. **Aurelis**, **Calibre 07** and
  **Anatomy of a Second** are fictional names created for the study.
- Three.js r170 is vendored under the MIT licence.
- Bodoni Moda is self-hosted under the SIL Open Font License 1.1; the licence text is included in the
  template's `fonts/OFL.txt`.

## Tools

- [OpenCode](https://opencode.ai/) 2.2.6 — agent harness, session storage, release workflow.
- DeepSeek V4.1 Flash (`deepseek-v4.1-flash`, `opencode-go`) — model.
- Puppeteer Core — dev-only headless verification.

## Licence status

The template and code are MIT. The font is OFL 1.1. Three.js is MIT. The fictional brand and copy are
original; they may be reskinned, but do not present them as a real maison or use third-party marks.
