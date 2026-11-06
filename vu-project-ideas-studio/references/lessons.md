# Lessons — bugs that cost time

Each entry is a symptom, the cause, and the fix. The reference already contains the fix.

## 1. “Mobile looks fine” was a lie

**Symptom:** a 390 px screenshot showed clipped content, but the layout also had 52 px of hidden
overflow. Changing `--window-size=390` did not give a 390 px layout.

**Cause:** Chrome headless clamps the layout viewport to ~500 CSS px and crops the screenshot to the
requested width.

**Fix:** use CDP `Emulation.setDeviceMetricsOverride({ width: 390, height: 844, mobile: true })`, then
assert `documentElement.scrollWidth - clientWidth <= 0` and the same for `.detail-scroll`. Do not trust
a narrow `--screenshot`.

## 2. `Identifier 'x' has already been declared`

**Symptom:** a CDP test passed the first time and threw “Uncaught” on the second filter check.

**Cause:** `Runtime.evaluate` shares the global lexical scope; a top-level `const s` persists between
calls.

**Fix:** wrap every multi-statement evaluation in an IIFE:

```js
(() => { const el = document.querySelector('#search'); … })()
```

Also print `exceptionDetails.exception.description`, not just `exceptionDetails.text`, or all you see
is “Uncaught”.

## 3. `[hidden]` did not hide a button

**Symptom:** the Live demo link appeared on every brief, even with the `hidden` attribute.

**Cause:** the author rule `.btn { display: inline-flex }` overrides the UA `[hidden] { display: none }`.

**Fix:** add `[hidden] { display: none !important; }` to the reset.

## 4. Decorative halos caused horizontal scroll

**Symptom:** 390 px page had 52 px overflow; no visible element crossed the edge.

**Cause:** blurred background circles and the tilted card stack extended beyond the hero; their
`getBoundingClientRect()` was clipped by a transform, but `scrollWidth` still counted them.

**Fix:** `overflow: clip` on `.hero` and a mobile check for `scrollWidth`.

## 5. Duplicate project inflated the count

**Symptom:** 55 cards, but one title appeared twice with identical text.

**Cause:** the source list included Nexus 2035 twice.

**Fix:** mark the later block `duplicateOf` in metadata; the build drops it and the count stays 54.
Record the merge in provenance.

## 6. Old request prefix leaked into tasks

**Symptom:** the copied prompt had two wrappers, or the task began with “Can you create new project…”.

**Cause:** the parser started the task too early, or the wrapper was also embedded in `source.json`.

**Fix:** keep the wrapper only in `prefix.txt`; strip wrapper lines at both ends of a block; assert no
task contains “Can you create new project in ~/Projects”.

## 7. Quote wrappers and conversational intros

**Symptom:** copied prompts began `*"Build…` or “Yes, Flappy Bird 3D is possible… Here is the prompt”.

**Cause:** the user pasted prompts inside quotes, sometimes with a comment before the quote.

**Fix:** find the first `*"Build`, `"Build`, `"Create` or `*"Create` and take from there; strip leading
and trailing quote markers. Keep the rest verbatim.

## 8. Prompt files were stale

**Symptom:** the site showed the new prefix but `prompts/*.md` still had the old one.

**Cause:** `data/projects.js` was rebuilt but the Markdown generator was not, or a generated file was
hand-edited.

**Fix:** one build writes all outputs; the static gate recomputes the full prompt and compares it with
each file. Never edit generated files.

## 9. Missing `state.json` looked like a real error

**Symptom:** the browser console had three 404s, and the “no console errors” check failed.

**Cause:** the credit line fetches `state.json`, which did not exist yet; the favicon also 404'd before
it was added.

**Fix:** create `state.json` and `assets/favicon.svg` before the first browser run. The harness also
tracks missing same-origin files and prints their paths.

## 10. Slug collisions and awkward paths

**Symptom:** two titles produced the same slug, or a path contained `[CITY_NAME]`.

**Cause:** slugifying display titles without a collision check; brackets removed but spaces collapsed.

**Fix:** normalise to ASCII, replace `&` with `and`, drop apostrophes, collapse non-alphanumerics; append
`-2` on collision. Keep the display title untouched.

## 11. Internal `===========` lines in a task

**Symptom:** the parser stopped early or the prompt lost sections.

**Cause:** the task itself uses `======` as section rules (Cute3D, Algorithm Explorer).

**Fix:** split at the **first** divider after the wrapper, then keep every later divider as task content.
The parser in the reference does this.

## 12. `color-mix()` and dark themes

**Symptom:** track dots and chip borders disappeared in an older Safari.

**Cause:** `color-mix(in srgb, var(--accent) 14%, transparent)` without a fallback.

**Fix:** never use the mixed colour as the only signal; pair it with a text label and a solid border
fallback. Test Safari manually.

## 13. Screenshots dirtied the working tree

**Symptom:** every browser run changed seven PNGs, making commits noisy.

**Cause:** the harness always wrote screenshots.

**Fix:** add `--no-shots` for live/CI runs; commit refreshed screenshots only when the UI changed.

## 14. Keychain prompts multiplied

**Symptom:** repeated macOS password prompts during publish.

**Cause:** each `git push` and each API helper call invoked the credential helper.

**Fix:** read the token once into a shell variable, use `Authorization: Bearer` for API calls, and push
with `-c credential.helper= -c http.extraHeader="Authorization: Basic $B64"`. Never echo the token.

## 15. Pages returned 404 for a minute

**Symptom:** the repo was pushed but the live URL was 404.

**Cause:** the first Pages build takes 30–120 seconds.

**Fix:** poll the URL with a bounded loop and continue only on 200. Do not “fix” the source in response
to a first 404.

## 16. The card is a button with buttons inside

**Symptom:** accessibility review flagged nested interactive controls.

**Cause:** the whole card opens the drawer and also contains Copy and star buttons.

**Fix (accepted trade-off):** label the inner controls, stop propagation, keep them keyboard reachable
and document the gap. A stricter design would make the title a link and leave the card non-interactive.

## 17. State totals go stale

**Symptom:** `state.json` reported a 19-minute build after a two-hour session.

**Cause:** token/time counters are a snapshot; resuming a session changes them.

**Fix:** refresh the counters at the end, after the last tool call that can change them, and label the
field as a snapshot.
