# Accessibility

## What is covered

- **Keyboard-first visualizer.** `←/→` step, `Space` play/pause, `0` reset the trace, `R` reset the
  camera, `[`/`]` previous/next pattern, `1/2/3` language, `?` help. Keys are ignored while typing in
  an input, while a select is focused, or while a dialog is open.
- **Native controls.** Tabs, transport, sliders, language tabs, quiz options, practice checkboxes and
  dialogs use native buttons/inputs. Focus rings are visible (browser default plus custom border
  states).
- **Labelled regions.** The canvas has `role="img"` and an accessible label; tab buttons use
  `role="tab"`, `aria-selected` and `aria-controls`; the quiz and practice have live regions for
  feedback and status.
- **Text equivalents.** Every 3D step also exists as a step title, a longer note, a result chip and a
  highlighted code line. The visualization is not the only channel.
- **Reduced motion.** `prefers-reduced-motion` removes animations, transitions and smooth scrolling.
  Playback remains user-controlled; there is no autoplay.
- **Contrast.** Text is at least ~7:1 on the dark panels for primary copy, and ~4.5:1 for muted copy.
  Accent colours are paired with labels, not used as the only signal.
- **Responsive.** Tested at 1600×1000, 1440×900, 1200×800 and 390×844. No horizontal overflow at
  390 px; touch targets in the transport are 38–44 px.
- **Skip link.** “Skip to content” is the first focusable element.
- **No motion-only feedback.** Correct/wrong quiz states also change text and the verdict copy.

## Known limitations

- The 3D scene itself is not screen-reader navigable: individual meshes are not focusable. The text
  trace is the accessible representation.
- Canvas labels can be low-contrast when a scene is zoomed far out. The step panel repeats the values.
- Colour is used to distinguish visited islands and union clusters; the current element also has a
  white highlight and a label.
- The quiz is not timed and has no audio, so there is no audio-only path to cover.
- Dialog focus trapping relies on the browser's native `<dialog>` behaviour.
- The mobile rail is a horizontal scroller; keyboard users can tab through every item, but the scroll
  position does not automatically follow focus in every browser.

## Testing

The browser suite covers keyboard shortcuts, mobile width, dialogs and zero console errors. It does
not run an automated axe/contrast audit; this document records the manual checks and the design
constraints. If you add a component, keep the native-element rule and add its keyboard path to the
help dialog.
