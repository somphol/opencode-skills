# Design

## Intent

A late-night listening room, not a dashboard. The cabinet is the hero; the interface is a brass
control panel you might find beside it. Everything is dark, warm and low-contrast except the record,
the bulbs and the paper strips.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#05070d` | page, stage background |
| `--ink-2/3` | `#090d17` / `#0e1421` | panel depth |
| `--panel` | `rgba(9,13,23,.78)` | glass panels |
| `--gold` | `#e6c07b` | chrome-brass accent, labels |
| `--gold-bright` | `#f6d99b` | active state, bulbs |
| `--brass` | `#a9803f` | inlays, rings |
| `--cream` | `#f2e7d3` | primary text |
| `--teal` | `#84d3c5` | live/engine state |
| `--rose` | `#e08f8a` | stream/error state |
| `--muted` | `#9b968d` | secondary text |

Paper is its own material: cream `#efe2c9 → #d9c39f` with sepia ink and a red slot number. It is
deliberately lighter than the UI so the rack reads as physical paper.

## Type

- Display/serif: Iowan Old Style, Palatino, Book Antiqua, Georgia, Noto Serif Thai.
- UI/sans: Avenir Next, Segoe UI, system-ui, Noto Sans Thai, Thonburi.
- Numeric: SFMono / ui-monospace for slots, clocks and credits.

No web fonts are downloaded. The serif carries the 1940s voice; the sans stays small and functional.
Eyebrows are 9–10 px, 700 weight, 0.2 em letter-spacing, uppercase. Headings are 20–27 px and rarely
bold.

## Composition

Desktop is a triptych: a 330 px song rack, an open stage, a 366 px studio. The panels do not touch the
top or bottom edges; a 1 px gold hairline and a 5 px inner border make them feel like inset lacquer.
The stage caption is a floating brass pill, not another card.

At ≤1000 px the panels become bottom sheets with a two-tab switcher; the cabinet stays fully visible.
At ≤560 px the top bar loses the subtitle and the free-play text, keeping only the chip dot.

## Collection pages, themes and type size

The rack is an 88-slot surface split into eleven category pages (A–K). A 3-column tab grid keeps
every category visible on a 330 px panel: All, Lullabies, Music Box, Classical, Folk & World,
Dreams I, Dreams II, Bonus, Piano, Nocturnes, Romantic, 78s. The paper grid shows eight strips per
page, matching the 3D rack; All shows all 88 slots and search spans every collection.

The **cinematic now-playing card** is a temporary top banner: 30–56 px serif title, performer,
slot/collection/engine/duration/queue metadata, licence and a source link. It fades in on a record
change, stays for nine seconds (paused on hover), and never blocks the instrument. The first-run
prompt is a single gold pill, not a modal, because the browser still requires a gesture.

Four themes recolor the whole product without changing the geometry:

| Theme | Character | Accent |
| --- | --- | --- |
| Midnight | default navy-and-gold | amber bulbs, rose/teal rim lights |
| Amber Lounge | warm walnut and amber | honey bulbs, amber points |
| Emerald Club | deep green and brass | champagne bulbs, green points |
| Rose Salon | burgundy and rose gold | peach bulbs, rose points |

`setTheme()` writes `body.dataset.theme` for CSS variables and calls `scene.setTheme()` to recolor the
background, fog, marquee bulbs and point lights. Text size is a targeted `body[data-font]` type scale
with three steps (A / A+ / A++); it deliberately avoids browser zoom so the fixed stage and canvas
stay aligned. Both preferences persist.

## The cabinet

- **Silhouette:** box body + extruded arch (radius 1.7, bevel 0.055) + chrome outer tube + brass inner
  tube. It reads as a 1015 without a licensed model.
- **Materials:** procedural walnut (vertical grain, knots, warm gradient), chrome
  (metalness 0.96, roughness 0.19, envMapIntensity 0.82), brass (metalness 1, roughness 0.27),
  smoked glass (opacity 0.07, depthWrite false), paper (unlit canvas).
- **Lighting:** hemisphere 0.42, warm shadow spot 26, rose/teal points 9/7, top 10. The first pass
  used 4× these values and blew the paper and wood to white. Keep exposure 0.82 and bloom 0.30.
- **Motion:** bubbles follow the arch curve; record spins at 3.6 rad/s; tone arm eases to −0.62 rad;
  bulbs breathe with the analyser RMS; coin falls with quadratic acceleration; dust drifts.
- **Depth:** fog is exponential at 0.021, the wall sits at z −5.2 and the cabinet at 0, so the room
  has air without hiding detail.

## Interaction design

- The 3D rack is a shortcut, not the only path: the DOM rack mirrors every selection with larger type
  and full keyboard support.
- Empty D slots are visibly grey and say “Empty / reserved”. Selecting them produces a mechanical
  reject, not silence.
- Buttons depress 2 px, keys 0.025 world units; the clack is synthesized, not sampled.
- The play button is the only large gold element. Everything else defers to it.
- Knobs are true rotary controls: drag vertically, wheel, or use arrows. The gold arc and tick rotate
  from −135° to +135°.
- Toasts never cover the caption (they sit 94 px above the status bar on desktop, 112 px on mobile).

## Copy

Short, warm, mechanical. “Insert quarter”, “The song rack”, “Late-night controls”, “Sweet dreams. The
jukebox is cooling down.” Thai copy is written, not machine-translated; the two dictionaries are kept
key-for-key symmetrical.

## Reduced motion

`prefers-reduced-motion` removes the intro camera move, CSS transitions and the loading shimmer, and
sets `body[data-motion="reduced"]`. The render loop still runs (the scene is the product) but the
cabinet no longer lunges at the viewer.
