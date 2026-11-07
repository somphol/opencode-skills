# Verification

## Run

```sh
npm install
npm run verify
```

The gate starts its own static server, launches Chrome headless, drives the real scroll, writes eight
screenshots and exits non-zero on failure. `CHROME_PATH` overrides discovery. No silent fallback to a
non-WebGL browser.

## 24 checks

1. Document title + exactly one `h1`.
2. Five chapters and five rail links.
3. No external runtime requests.
4. A live WebGL context and non-zero canvas.
5. Hero assembled at scroll 0; hero copy opaque.
6. Rail click reaches the movement chapter; copy visible, not inert, in the viewport.
7. Movement chapter explodes the dial and balance; finite transforms.
8. Hands track the lifted dial within 0.05.
9. Case chapter: caseband + crystal leave, labels visible and non-overlapping, rotor stays with the
   caseback.
10. Finale: max part drift < 0.05; price present.
11. Colophon: one-sentence brief, OpenCode + DeepSeek credits, longer-video note.
12. Enquiry: empty submit errors, valid submit confirms, closes.
13–17. Hero/dial/movement/case/finale screenshots at the expected progress.
18. Rendering budget < 400 draw calls, < 600k triangles.
19. Mobile: no horizontal overflow; rail/facts/callouts hidden.
20. Mobile hero: copy starts below 300 px and fits.
21. Mobile movement: active heading below 330 px, no overflow.
22. Mobile finale: same.
23. Reduced motion: timeline still responds, smooth scroll off.
24. No console or page errors.

## Repairing common failures

**`caseband x 0` at t=.5.** The case shell is supposed to leave at .55–.75. Assert the dial lift and
balance at .5; assert the caseband at .75.

**Hands 0.08 from the dial.** The hand late windows ended later than the dial's. Use identical
late windows and the same late position/rotation.

**Label overlap.** Measure `.callout__text`, not the zero-size `.callout` container. Keep the
collision pass and hide callouts below 1200 px.

**Reassembly drift.** A part's `late`/`delta` is applied without the `hold` factor, or a window ends
after `.955 + delay`. Check the update formula.

**Screenshot copy missing.** `?t=` set manual progress but did not scroll the page to the matching
anchor. The copy lives in the document flow; scroll it.

**External request.** A font, favicon, image or analytics snippet escaped to a CDN. Vendor it or use a
data URI. Social metadata may be absolute; it is not fetched by the page.

**Mobile heading overlaps the watch.** Increase the exposure/finale lift or scale reduction; compress
the copy (hide facts) rather than shrinking the type below legibility.

## Screenshots

`aurelis-hero`, `aurelis-dial`, `aurelis-movement`, `aurelis-case`, `aurelis-finale`,
`aurelis-colophon`, `aurelis-mobile-movement`, `aurelis-mobile-finale`. Regenerate after every visual
change and inspect the two composition contracts.

## Gaps

Chrome only; no Safari/Firefox, real device, screen-reader audit or pixel diff. The live Pages URL is
not part of the gate. State it honestly in the release notes.
