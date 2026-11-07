# Verification

## Run

```sh
npm install
npm run verify
```

The gate starts its own static server on `127.0.0.1:4175`, launches Chrome headless, drives the real
timeline, writes eight screenshots and exits non-zero on the first failed check. It is the release
definition of done.

`CHROME_PATH=/path/to/chrome` overrides discovery. Chrome is required; the script does not silently
fall back to a non-WebGL browser.

## The 24 checks

| # | Check | What it asserts |
| --- | --- | --- |
| 1 | document and title | Title contains “Aurelis”; exactly one `h1`. |
| 2 | five chapters and five rail links | Five `[data-chapter]` sections and five rail anchors. |
| 3 | no external runtime requests | Every request is same-origin, data:, blob: or about:. |
| 4 | WebGL renderer is live | A WebGL2/1 context exists and the canvas is non-zero. |
| 5 | hero starts assembled at scroll 0 | `progress = 0`, explosion = 0, hero copy opaque. |
| 6 | chapter 03 activates the movement copy | Rail click reaches t≈.5; copy visible, not inert, within the viewport. |
| 7 | scrolling explodes the calibre | Dial y > 1, balance lifted, finite transforms. |
| 8 | hands travel with the lifted dial | All three pivots within 0.05 of the dial. |
| 9 | full explosion at the case chapter | Caseband and crystal leave, labels visible and non-overlapping, rotor stays aligned. |
| 10 | finale reassembles every part | Max part drift < 0.05 at t=1; price present. |
| 11 | colophon records the brief | Quote, model/harness credits and the longer-video note. |
| 12 | dialog opens, validates and confirms | Empty submit errors; valid submit confirms; dialog closes. |
| 13–17 | screenshot states | Hero, dial, movement, case, finale render at the expected progress. |
| 18 | rendering budget | < 400 draw calls and < 600k triangles. |
| 19 | mobile: no horizontal overflow | 390 × 844 document fits; rail/facts/callouts hidden. |
| 20 | mobile: hero watch above copy | Hero copy starts below 300 px and stays in the viewport. |
| 21 | mobile: movement composition | Active heading below 330 px, no overflow. |
| 22 | mobile: finale composition | Same, with the lifted/shrunk finale watch. |
| 23 | reduced motion remains usable | Timeline still responds; smooth scrolling is off. |
| 24 | no console or page errors | Zero errors across all pages. |

## Screenshots

`npm run verify` writes:

- `screenshots/aurelis-hero.png`
- `screenshots/aurelis-dial.png`
- `screenshots/aurelis-movement.png`
- `screenshots/aurelis-case.png`
- `screenshots/aurelis-finale.png`
- `screenshots/aurelis-colophon.png`
- `screenshots/aurelis-mobile-movement.png`
- `screenshots/aurelis-mobile-finale.png`

Ad-hoc frames can be generated with `?t=<0..1>&still` and `W`/`H`:

```sh
W=1280 H=800 node scripts/shoot.mjs 0.5
```

## What is not covered

- Safari and Firefox. The page uses `<dialog>`, `inert`, `backdrop-filter`, `svh` and WebGL2; all are
  intended to degrade, but only Chrome 156 has been exercised.
- Real iOS/Android hardware, thermal throttling and low-end GPU behaviour.
- A screen-reader audit beyond landmark/name structure; the canvas and labels are decorative.
- Colour-contrast tooling; the palette is intentionally low-contrast in the micro-copy.
- Visual regression (pixel diff) between runs; screenshots are for human review.
- The live GitHub Pages deployment is not part of `npm run verify`.

## Updating the gate

If you add a check, also update the count in `README.md`, `AGENTS.md`, the colophon (`index.html`),
`state.json` via `npm run state`, and this document. The check count is part of the public release
claim.
