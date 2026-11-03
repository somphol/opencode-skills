# Accessibility

## Target

The studio aims to meet **WCAG 2.2 Level AA** for the interface it controls. It
is a self-assessment, not a third-party certification. Canvas-only content is
the main area where judgement is required; equivalent values always exist in the
DOM.

## What is implemented

### Structure and semantics

- One `<h1>`, one `<h2>` per panel, landmark elements (`header`, `nav`, `main`,
  `footer`).
- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`,
  roving `tabindex`, and Left/Right/Home/End keys.
- Panels use `role="tabpanel"` and are hidden when inactive.
- Form controls have visible `<label>` elements or `aria-label`s.
- Identity choices are real buttons; the practice answer is a labelled form.

### Keyboard and focus

- Every slider, function button, expression chip, choice, tab and form control
  is reachable by Tab.
- Arrow keys adjust sliders; Enter submits the answer form.
- Visible focus rings on buttons, inputs, sliders, chips and tabs.
- The inverse module is fully operable without a pointer; sliders are the
  keyboard path.

### Screen readers and live feedback

- Canvases expose `role="img"` with descriptive `aria-label`s.
- Inverse results, domain states, expressions, choices and solution lists are
  real text in the DOM.
- Answer and identity feedback use `role="status"` and `aria-live="polite"`.
- The badge-unlock toast is polite.

### Visual

- Text and controls use high-contrast light-on-dark colours.
- Colour is never the sole cue: curves carry names, squares carry captions,
  identity choices carry formulas, and status badges carry words.
- Layout reflows at 1080 px, 760 px and 420 px without horizontal scrolling.
- Text remains usable at 200% zoom on a 1440 px viewport.

### Motion and touch

- `prefers-reduced-motion: reduce` collapses CSS animations and transitions.
- Step reveal still works with reduced motion; it simply appears without slides.
- Canvas uses `touch-action: none` only where dragging is intentional.
- Buttons, sliders and choices are sized for touch; the mobile layout stacks cards.

## Known limitations

1. **The inverse canvas is dense.** Axis labels and the drag hint sit close
   together on very narrow screens; the controls remain the primary path.
2. **No keyboard dragging.** The branch point is pointer-only; sliders provide
   the same state changes for keyboard users.
3. **The area model is qualitative.** It illustrates the identity rather than
   measuring exact pixel areas.
4. **Canvas text is not exposed as a text tree.** All numerical content is
   mirrored in the DOM, but decorative geometry is not described line by line.
5. **No high-contrast theme.** The dark palette targets AA contrast, but there is
   no light or forced-colours stylesheet yet.
6. **Thai screen-reader pronunciation** depends on the installed Thai voice and
   has not been formally tested across platforms.
7. **No formal audit.** Findings come from manual keyboard, zoom, contrast and
   VoiceOver spot checks.

## How to test

1. **Keyboard only:** unplug the mouse. Tab through the HUD, switch tabs with
   arrows, change inverse domains and inputs, solve one identity step, and answer
   one practice question. Focus must never disappear.
2. **Zoom:** set the browser to 200% at 1440 px and 390 px. No content should be
   clipped or force horizontal scrolling.
3. **Reduced motion:** enable the OS setting and confirm CSS animations are
   suppressed while the solution steps still appear.
4. **Screen reader:** with VoiceOver (macOS) or TalkBack (Android), confirm the
   sliders announce labels and values, and that practice feedback is read.
5. **Contrast:** spot-check muted text and the coral/cyan/violet values against
   the card background.

## Reporting an accessibility problem

Open a bug report with the accessibility label, or use the feature request
template for a design change. Include the assistive technology, browser, module
and the task that failed. Accessibility fixes are prioritised.
