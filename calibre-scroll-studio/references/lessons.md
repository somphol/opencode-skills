# Lessons and regressions

1. **A sticky stage steals a viewport.** The first chapter went below the fold. Use fixed and put the
   sections above it.
2. **Cylinder caps rotate dial artwork.** Use a flat circle face; verify the logo is upright before
   tuning anything else.
3. **A 70° camera turns an explosion into a line.** Stay around 40°, fan laterally, and pull back for
   the full set.
4. **Big discs cannot separate vertically by their diameter** without clipping or a very distant
   camera. Group the case shell; fan the movement; put the dial upper-right.
5. **Parts of one sub-assembly must share a transform.** Rotor with caseback; hands with dial; case
   band/bezel/crystal/lugs/crown as one shell.
6. **Hands floating alone read as bugs.** Ride the dial.
7. **A bridge can hide the heart.** The balance must be visible; add density elsewhere.
8. **Circular engravings can fall into the hole.** Text radius is `visibleBand / (2 × outerRadius)`;
   verify by rendering the back.
9. **High-contrast roughness maps make rhodium black.** Put Geneva stripes on the rotor/caseback.
10. **Labels need collision and a breakpoint.** Measure the text, not the container; hide under
    1200 px.
11. **Mobile needs its own composition,** not just smaller type. Lift/shrink the watch, compress the
    copy, hide the rail.
12. **Verification assertions can be wrong.** Caseband at .5, hand lag, and zero-size label rects were
    test bugs, not app bugs. Fix the test with the choreography.
13. **Do not fetch state.json for the colophon unless it exists in every template.** Static fallback
    text avoids a 404 and a console error.
14. **No external runtime requests** includes fonts, favicons and social images loaded by the page.
15. **A small prompt is not a license for a vague release.** Keep the gate, the ledger and the docs.
