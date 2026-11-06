# Design

## Intent

The catalog should feel like a well-made printed project index, not a SaaS dashboard. Warm paper,
large editorial type, a single coral accent, and enough structure that 54 cards remain scannable.
The subject matter is playful (3D animals, night markets, pinball); the interface is calm so the
briefs supply the colour.

Principles:

1. **The brief is the product.** Cards lead with title and tagline, not chrome.
2. **One accent per track.** Colour tells you where you are without becoming decoration.
3. **Editorial hierarchy.** Serif display, sans body, mono metadata.
4. **Quiet interaction.** Small lifts, 180–250 ms transitions, no parallax or autoplay.
5. **Readable in both themes.** Dark mode is a first-class palette, not an inversion.

## Tokens

Defined in `:root` and `[data-theme="dark"]` in `assets/style.css`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f4efe6` | `#101210` | Page background |
| `--card` | `#fffdf8` | `#191c18` | Cards and dialog |
| `--ink` | `#171915` | `#f0ece2` | Primary text |
| `--muted` | `#67695f` | `#a2a498` | Secondary text |
| `--line` | 11% ink | 12% paper | Dividers and borders |
| `--accent` | `#e8502f` | `#ff7a54` | Primary accent, hover |
| `--indigo` | `#4b45c6` | `#a7a1ff` | Secondary accent |
| `--mint` | `#0f8a68` | `#55d6ad` | Live / success |
| `--gold` | `#b77900` | `#efbd55` | Stars |
| `--code-bg` | `#151814` | `#0b0d0b` | Prompt block |

Track accents:

| Track | Light | Dark |
| --- | --- | --- |
| Games & Arcade | `#e8502f` | `#ff8666` |
| Puzzles & Strategy | `#b77900` | `#e4ae3f` |
| STEM & Algorithms | `#0b8f9f` | `#42c3d2` |
| Language & Reading | `#6555d9` | `#9f92ff` |
| Cities & Travel | `#158a61` | `#45c695` |
| Simulation & Vehicles | `#2f6fc4` | `#6fa7f2` |
| Calm & Focus | `#7766a8` | `#ab9bdd` |
| Creative Studios | `#c24d7c` | `#ef8eb5` |
| Tools & Daily Life | `#596573` | `#9bacbd` |

The page background adds two fixed radial washes (coral at top right, indigo at top left). They are the
only "texture"; there is no noise image or external asset.

## Typography

- **Display:** `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`. Hero
  `clamp(54px, 7.2vw, 100px)`, line-height `0.91`, letter-spacing `-0.055em`; section headings
  `clamp(34px, 4.2vw, 52px)`.
- **Body:** system sans stack. 16 px base, 13–15 px cards, 1.5–1.65 line-height.
- **Metadata:** `"SFMono-Regular", ui-monospace, Menlo`. Word counts, indices, stack chips, prompt text.
- **Italic accent:** the hero's “worth shipping.” and the brand's “Library” use the serif italic. The
  coral underline is a pseudo-element rotated −1.4°, not an image.

No web fonts are loaded. The design must survive on the system serif and system sans.

## Layout

- Page container: `min(1240px, 100%)`, padding `clamp(18px, 4vw, 40px)`.
- Header: 68 px sticky, translucent paper with `backdrop-filter`, bottom hairline.
- Hero: two columns above 1040 px (`1.05fr / 0.95fr`), one column below. Minimum 590 px tall on desktop.
- Catalog: auto-fill grid, `minmax(286px, 1fr)`, 16 px gap. Three columns at 1440 px, one at 390 px.
- Drawer: `min(1000px, calc(100vw − 40px))`, max height `calc(100vh − 40px)`, full screen below 720 px.

The hero's right column is decorative: three tilted brief cards (BTS, Serenity, NEON HORIZON), a
floating “Prompt copied” chip and a single “54 briefs” pill. It is `aria-hidden`; nothing is lost when
it is hidden or clipped on small screens.

## Components

### Card

- Top accent bar 34 px wide, 3 px tall; grows to 66 px on hover.
- Row: mono index, uppercase track pill with a dot, optional green **Live** badge, star button.
- 19 px title, 3-line clamped tagline, up to four stack chips plus `+N`.
- Footer: size + word count on the left, pill **Copy** on the right.
- Hover: `translateY(-3px)`, accent-tinted border, medium shadow.
- Focus: 2 px accent outline, 3 px offset.

### Filters

- Track chips: 34 px pill, dot in the track colour, count in mono. Active chip is ink with paper text.
- Stack and sort select: 34 px, custom chevron drawn with two gradients (no icon asset).
- Live/shortlist toggles: 32×19 px switch; accent when on.
- Result line: “Showing N of 54 briefs” plus **Surprise me**.

### Drawer

- Native `<dialog>`, no custom focus trap.
- Header: track dot, track name, “Brief 01 of 54”, close button.
- Title 30–42 px serif; star to the right.
- Chip row: track, size, word count, stack.
- Actions: **Copy full prompt** (primary), **Copy brief only**, **Download .md**, live demo link.
- Tabs: **Copy-ready prompt** / **At a glance**. The prompt block is dark in both themes, mono 12.5 px,
  max height 48 vh, scrollable.
- Glance: two cards (what you are building, stack + features), then prompt anatomy and source links.

### Prefix card

Ink panel on paper, two columns above 1040 px. Left: explanation and actions; right: scrollable mono
preview of `data/prefix.txt` with `{{TITLE}}` shown as `[Your project name]`. This is the only inverted
surface on the page and anchors the “how it works” section.

## Motion

- Card lift 200 ms; accent bar 250 ms; filter/theme 160–180 ms.
- Hero halos drift over 14–18 s; the copy chip bobs over 5 s.
- All animation stops under `prefers-reduced-motion: reduce` (0.01 ms).
- No entrance animations that delay reading; the first paint is the final layout.

## Voice

- Short declaratives: “Build something worth shipping.” “Find your next build.”
- Metadata is precise: “1,095 words”, “31 checks”, “§ state.json”.
- No hype adjectives in the UI. The brief itself can be ambitious; the frame is calm.
- Thai and other non-English text inside briefs is preserved verbatim and rendered with the system font.

## Screenshots

| File | View |
| --- | --- |
| `assets/studio.png` | Desktop hero, light |
| `assets/studio-dark.png` | Desktop hero, dark |
| `assets/library.png` | Catalog cards, light |
| `assets/detail.png` | Drawer, light |
| `assets/mobile.png` | 390 px hero, dark |
| `assets/mobile-detail.png` | 390 px drawer, dark |
| `assets/og-card.png` | 1200×630 social card |

Regenerate with `npm run test:browser`.
