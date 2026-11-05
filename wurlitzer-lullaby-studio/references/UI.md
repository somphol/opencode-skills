# UI reference

## Layout

Desktop `.layout` is a three-column grid: `minmax(280px, 330px) 1fr minmax(310px, 366px)`. Panels are
glass cards with a 5 px inset gold hairline. The stage caption is a floating pill in the centre
column, bottom-aligned. Top bar 82 px, status bar 42 px.

At ≤1000 px the panels become fixed bottom sheets, hidden until `#tab-songs` / `#tab-studio` adds
`.is-open`; the caption hides when a sheet is open. At ≤560 px the top bar drops the subtitle and the
free-play text. Panels need `padding-bottom: 58px` so the floating tabs do not cover their last row.

The rack is a 64-slot surface (A-1…H-8) split into eight collection pages. A 3×3 tab grid shows
All, Lullabies, Music Box, Classical, Folk & World, Dreams I, Dreams II, Bonus and 78s. A page shows
eight strips as a two-column, row-flow grid; All shows all 64. Search spans every collection, and the
3D rack mirrors the active page or the current record's collection.

## Strip markup

```html
<div class="strip" data-slot="A-1" role="listitem">
  <button class="strip-open">
    <span class="strip-num">A-1</span>
    <span class="strip-main">
      <span class="strip-title">…</span><span class="strip-artist">…</span><span class="strip-meta">…</span>
    </span>
  </button>
  <button class="strip-star" aria-pressed="false">★</button>
</div>
```

`.strip` is a 3-column grid; `.strip-open` spans the first two and has an internal 30 px / 1fr grid.
Do not nest the star inside the open button.

## Themes and text size

Four themes (`midnight`, `amber`, `emerald`, `rose`) write `body.dataset.theme` and call
`scene.setTheme()` to recolor the background, fog, bulbs and point lights. Three text sizes
(`normal`, `large`, `xlarge`) write `body.dataset.font` and use targeted overrides; never use browser
zoom because the canvas stage is fixed. Both persist and export.

## Knobs

`role="slider"`, `tabindex="0"`, `aria-valuemin/max/now/valuetext`. CSS uses `--rot` (tick rotation,
−135°…+135°) and `--arc` (conic ring). Pointer drag: `value + (startY - clientY) * span/160`. Wheel:
±1. Arrows: ±1, Shift ±5; Home/End. Commit immediately to the audio store and localStorage.

Master 0–100; bass/treble −10…+10 dB (display with `+`); mix 0–100.

## Language

- `body[data-lang]` and `<html lang>`.
- `applyLanguage()` sets every `[data-i18n]`, updates free-play label, mute/play ARIA, then rebuilds
  the DOM rack, now-playing, keypad state, timer, range fills and the 3D paper textures.
- Keep the timer readout's `data-i18n` attribute; dynamic text can override it without removing it.
- Thai copy is handwritten. The dictionaries must have identical keys.

## Persistence

Key `wurlitzer-lullaby-studio:v1`. Schema:

```json
{
  "version": 1, "lang": "en", "freePlay": true, "credits": 5,
  "master": 82, "bass": 2, "treble": 1, "mix": 45,
  "ambient": { "rain": 0, "ocean": 0, "crickets": 0 },
  "timer": 0, "lastTrack": "brahms", "favorites": [], "muted": false
}
```

`normalizeSettings` clamps, deduplicates favourites, caps lengths, rejects unknown languages and
timer values. Export wraps it in `{app, schema, exportedAt, settings, tracks}`.

The saved timer is a preference. On boot show the selected dial but do not start the countdown; start
it on the first play. When it ends, clear the preference and show Off.

## Coin and credits

- Free Play default: selecting a record does not consume credits.
- Coin mode: each selection decrements credits; at 0 show “Insert a quarter first”.
- `Insert quarter` plays a coin synthesis, drops the 3D coin, and adds a credit even in Free Play.
- The 3D coin drop is cosmetic; credits are the source of truth.

## Favourites

Star toggles `settings.favorites` and persists. The Favorites chip filters the DOM rack to starred
records; the 3D rack stays complete. Export includes favourites.

## Keyboard

`Space` play/pause, `←/→` prev/next, `L` language, `T` cycle timer, `M` mute, `F` free play,
`Esc` close overlays. Ignore shortcuts when the target is an input, textarea, select or
contenteditable.

## Mobile

Two tabs, bottom sheets, caption hidden while open, panels scroll internally. The stage remains
visible behind the sheet. Do not put the tabs inside the panel; they must stay reachable.

## Accessibility

Skip link, focus rings, semantic buttons, ARIA state, live status, reduced motion. The 3D canvas is
`aria-hidden`; the DOM rack is the accessible path.
