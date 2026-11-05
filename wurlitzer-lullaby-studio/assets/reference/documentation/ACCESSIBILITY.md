# Accessibility

## Targets

The app aims for WCAG 2.2 AA where a 3D canvas allows it. The 3D scene is decorative (`aria-hidden`);
every action it offers is duplicated in the DOM.

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` / `Shift+Tab` | Move through top bar, rack, transport, knobs, ambient, timer, actions |
| `Enter` / `Space` | Activate a strip or button; `Space` on the page toggles play |
| `←` / `→` | Previous / next record (when focus is not a slider) |
| `↑` / `↓` | Change a focused knob |
| `Home` / `End` | Min / max a focused knob |
| `L` | Toggle EN / ไทย |
| `T` | Cycle timer Off → 15 → 30 → 60 |
| `M` | Mute |
| `F` | Toggle Free Play |
| `Esc` | Close help or self-test |

The skip link jumps to the song rack. Focus rings are 2 px gold with a 3 px offset and are never
suppressed. The help dialog moves focus to its close button; `Esc` closes it.

## Semantics and ARIA

- Knobs are `role="slider"` with `aria-valuemin/max/now/valuetext`, `tabindex="0"` and a live label.
- The volume/EQ range inputs have explicit `aria-label`s.
- Ambient toggles use `aria-pressed`; free play, mute, favourites and language buttons do too.
- The transport exposes play/pause with a changing `aria-label`.
- `#status-text` is in a polite live region via the toast (`role="status"`); the status bar itself is
  readable text.
- The 3D canvas is `aria-hidden`; interactive 3D strips and keys are shortcuts, never the only route.
- The self-test overlay is a modal dialog with a heading and a list of pass/fail items.

## Text size and themes

The studio panel exposes three text sizes (A / A+ / A++, persisted) and four themes. The type scale
increases the important reading surfaces — strips, now-playing, captions, labels, buttons and status
— without scaling the WebGL canvas or breaking fixed positioning. Themes keep the same contrast
relationships: cream on near-black, gold accents, dark sepia on cream paper. Theme names are exposed
as `aria-label`/`title` on the swatches, and text-size buttons have descriptive labels.

## Visual

- Primary text (`#f2e7d3`) on `#05070d` is well above 7:1. Muted text (`#9b968d`) is ~5:1.
- Gold is used for accents and large text; paper strips are dark sepia on cream (~10:1).
- State is never colour-only: free play has a label, toggle state has `aria-pressed`, empty slots say
  “Empty / reserved”, and engine badges include text.
- The layout reflows to bottom sheets at 1000 px and a single column at 560 px; no horizontal scroll.

## Motion

`prefers-reduced-motion: reduce` removes the loading shimmer, CSS transitions, camera intro and lamp
breathing. The render loop continues because the 3D cabinet is the content, but the camera stays still
and bubbles move slowly. `body[data-motion="reduced"]` is set at boot for tests.

## Audio

- Audio never autoplays. The first sound follows an explicit click/keypress.
- Mute is a single control and persists.
- The sleep timer fades rather than cutting; the final state is silence, not a sudden stop.
- Volume defaults to 82% of the app scale, not system maximum.

## Known limits

- The 3D paper strip text is small at some camera distances; the DOM rack is the accessible reading
  surface.
- Thai 3D textures depend on a system Thai font; the DOM remains correct regardless.
- Headless tests cannot verify real screen-reader output, only the DOM contract.
