# Accessibility

This is a working accessibility statement, not a certification. No formal WCAG audit has been run.

## Implemented

- **Landmarks:** `header`, `nav`, `main`, `section` with labelled headings, `footer`.
- **Skip link:** first focusable element jumps to the catalog.
- **Headings:** one `h1`, section `h2`, card `h3`; no heading level skipped for styling.
- **Keyboard:**
  - `/` focuses search from anywhere outside a field or the drawer;
  - `Tab` reaches every track chip, select, toggle and card;
  - `Enter` / `Space` opens a focused card;
  - the native dialog traps focus and closes on `Escape`;
  - closing returns focus to the card that opened it.
- **Names:** icon-only buttons (GitHub, theme, close, star) have `aria-label`; the star also exposes
  `aria-pressed`.
- **Live regions:** the result count is `aria-live="polite"`; the toast is `role="status"` with
  `aria-live="polite"` and `aria-atomic="true"`.
- **Dialog:** `aria-labelledby` points at the brief title; the backdrop is inert.
- **Decorative content:** the hero card stack, halos and orbit labels are `aria-hidden`; the same
  information is in the catalog.
- **Focus visible:** 2 px accent outline with 3 px offset on every interactive element.
- **Contrast:** ink on paper and paper on ink are high contrast. Muted text is used for secondary
  copy, never as the only signal. Track colours are paired with text labels, not colour alone.
- **Motion:** all animation is disabled under `prefers-reduced-motion: reduce`.
- **Zoom:** layout is fluid; no fixed-height text containers except the clamped card tagline.
- **Touch:** cards, chips and actions are at least 28–44 px tall; the primary actions are 44 px.
- **Language:** `lang="en"`; non-English brief text is preserved, but individual Thai spans are not
  tagged. This is a known gap.

## Known gaps

1. **Nested interactive card.** The card is `role="button"` and contains copy/star buttons. Screen
   reader users may hear it as a button containing buttons. The inner controls are labelled and
   operable; a future redesign could use a “View brief” link as the primary affordance.
2. **No automated axe/Lighthouse pass.** The browser suite checks DOM behaviour and overflow, not
   contrast ratios or ARIA validity.
3. **No Thai language tagging.** Briefs contain Thai; a bilingual reader may mispronounce it.
4. **Prompt block is a `<pre>`.** It is focusable and scrollable, but there is no per-line navigation.
5. **Toast timing.** The toast disappears after 3.6 s; the same information remains visible in the
   drawer or clipboard.
6. **No high-contrast forced-colors styling.** Windows High Contrast mode inherits system colours but
   the custom card accents may disappear.

## Testing it

Manual keyboard pass:

```text
Tab through the header → skip link → nav → theme → search → track chips → selects
  → toggles → cards → copy/star → footer
Press / → type "pinball" → Escape → Enter on a card
In the drawer: Tab through actions → tabs → prompt → close with Escape
```

Automated coverage:

```bash
npm run test:browser
```

The suite checks focusable dialog behaviour indirectly (open/close, hash cleanup), the shortlist
`aria-pressed` state, mobile overflow and console errors. It does not run an accessibility audit.

## Reporting

Open an issue at <https://github.com/somphol/vu_project_ideas/issues> with the page, browser, input
method and the expected behaviour. Do not include personal data or credentials.
