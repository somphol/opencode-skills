# Design notes

## Idea

A watch is already a scroll: a stack of layers with a story at each depth. The interface makes that
literal. The watch is not a product photo placed on a landing page; it is the page's structure. The
copy is set like a magazine profile, the chapter rail like a running head, and the exploded view like
a technical plate from a manufacture's archive.

Project title: **Anatomy of a Second**. The watch itself: **Aurelis Calibre 07**.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#08080a` | Page/void |
| `--ivory` | `#f2ede3` | Display type |
| `--ivory-dim` | `rgba(242,237,227,.68)` | Body |
| `--muted` | `#9c968a` | Micro-copy |
| `--gold` | `#c8a063` | Accents, rail, dial indices |
| `--gold-soft` | `#ddbe8a` | Italic display, glints |
| `--hair` | `rgba(242,237,227,.13)` | Rules and borders |

The background is a warm near-black with two soft radial washes (one behind the watch, one low-left).
The grain is an SVG turbulence overlay at 5% and the page frame is a 1 px inset hairline.

## Type

- **Bodoni Moda** (self-hosted, OFL) — display and dial artwork. Tight leading, large scale, italic
  for the emotional half of a line.
- **Helvetica Neue / Arial** — micro-labels, navigation and body. Uppercase, wide tracking
  (`.2em–.26em`), 8–10 px, never used for long paragraphs.
- Body copy is 13–14 px, 1.7–1.8 line-height, maximum 40 characters per line.
- The hierarchy is carried by scale and air, not weight. Most text is weight 400.

## Layout

- Fixed 100 vh stage; the watch sits right of centre on desktop (about 62% of the width).
- Copy column: 7 vw from the left, max 430 px, vertically centred; the hero is anchored low.
- A left-to-right scrim protects the copy; the watch emerges from it.
- The micro-chapter index is top-left, the model name top-centre, the enquiry action top-right.
- The chapter rail sits on the right edge; labels reveal on hover/active; the gold line is progress.
- The finale adds a 2 × 2 specification grid, a price, a CTA and a tiny colophon line.

## Motion

- One normalized timeline, damped. Nothing else animates on scroll except the callouts and copy.
- The watch floats and sways a few pixels on idle; mouse drag adds a small orbit; pointer position
  adds parallax.
- The explosion is two-stage: a polite lift, then a confident fan. Reassembly is slower and quieter
  than the explosion.
- The balance oscillates at 2.5 Hz visually; the seconds hand sweeps slowly enough to be legible; the
  gears accelerate when exposed.
- Reduced motion snaps the timeline, disables idle movement and freezes the mechanism.

## Responsive

- Below 900 px the stage keeps the upper half; copy is bottom-anchored behind a stronger scrim.
- The rail, callouts, facts and drag affordance are removed to protect the watch and the reading.
- The exploded watch is lifted and scaled down; at the finale it is smaller again.
- Type scales with `clamp()`; the hero remains two lines at 390 px.
- Below 760 px tall, the body copy is hidden so the title and facts remain.

## Copy voice

- Short declaratives. “Enamel, fired twice.” “Every part returns.”
- Specific materials and numbers, used as texture, not as a datasheet.
- No exclamation marks, no “revolutionary”, no growth-hack language.
- The fiction is signposted: “A fictional maison”, “A WebGL study”.
- The colophon is the one place where the making-of is explicit: one sentence, the tools, the ledger.

## Accessibility

- High-contrast ivory on near-black; muted text is decorative, body is readable.
- Native `<dialog>` with labelled titles; Escape and backdrop close.
- Inactive chapters are inert, so focus and screen readers never land on invisible CTAs.
- Skip-link was removed (it targeted an inert chapter); the page has a single primary action.
- Canvas and callouts are `aria-hidden`; the copy carries the content.
- Reduced motion is a first-class path, not a CSS afterthought.
