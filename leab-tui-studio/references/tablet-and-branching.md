# Tablet layout and the feature train

Two things that were not game rules but still consumed most of a release: making the table usable on
an iPad, and not shipping straight to `main`. Both are process problems with concrete fixes.

## Tablet layout

An iPad is not a big phone and not a small desktop. Verify at **820×1180 and 1180×820** with a coarse
pointer; width alone misclassifies iPad landscape (1180 px wide, but `pointer: coarse`).

```bash
node scripts/browser-check.mjs --url "http://127.0.0.1:8123/?mode=solo" \
  --device ipad --orientation portrait --wait 6000 \
  --eval "LeabTui.getFraming()" --out screenshots/ipad-portrait.png
```

Rules that survived contact with real users:

- **Never let the page scroll.** `html, body { overflow: hidden }`, `.app` at `100dvh`, a fixed stage.
  A scrolling game page hides the hand behind the browser chrome and looks like a broken render.
- **One media query for the rail.** `(max-width: 1024px), (pointer: coarse)` — the same string in CSS
  and in the JS listener. A width-only check in JS hides both navigation sets on iPad landscape.
- **HUD wraps before it clips.** Let the top strip wrap; measure it before positioning toasts, or a
  wrapped Thai/English label covers the hint at exactly the wrong moment.
- **Hand row, not an arc.** The owner's hand is one straight row on the seat tangent; two rows or an
  arc overlap each other and the neighbouring fan at tablet widths.
- **Dock height budget.** Keep the mobile hand dock under ~110 px; `fitTopFraming()` reads the live
  dock height, so it must be measured, not guessed.
- **2D first.** Default to a top view with no cast shadows (a shadow in 2D is a regression), a
  labelled 2D/3D toggle, and a bottom-right reset-board button on touch.
- **Touch hygiene.** `touch-action: manipulation` on controls, `touch-action: none` on the canvas,
  16 px inputs, `maximum-scale=1` to stop Safari autozoom, and cancel a non-canvas double-tap in
  `touchend`. Double-tap zoom on iOS manifests as "my second tap reopened a weird white sheet".
- **The canvas is not the only target.** Every action reachable by tap must also be reachable in the
  panel sheet; users on a tablet use the sheet, not drag.

## Debugging loop with a human tester

The session pattern that worked was: **one report → one screenshot or a numbered choice → one fix →
one deploy**. Preserve it.

- Ask for a screenshot, or offer 3–4 numbered candidate causes and ask "1/2/3/4". Cheaper than a
  paragraph of theory and faster than a wrong fix.
- Fix one symptom per deploy. Bundled fixes make the next report ambiguous.
- When the report says "the board is wrong", check **layout before state**: overlapping tiles,
  duplicated labels, and a panel suppressing render all look like desync but are view bugs.
- After a layout fix, re-check the *other* orientation. iPad portrait and landscape have different
  real estate, and a fix on one routinely clips the other.
- Keep a test hook (`getFraming()`, `?seed=`, `?demo=`) so a report can be reproduced headlessly.

## Feature train

`main` is production and what Pages serves. Never start a feature from `main`.

```bash
git fetch origin && git switch develop && git pull --ff-only
git switch -c feature/<slug>
# work, commit, run the gate
git fetch origin && git rebase origin/develop     # PR into develop
# release
git switch -c release/X.Y.Z   # bump every version string + CHANGELOG + state.json
git switch main && git merge --no-ff release/X.Y.Z && git tag -a vX.Y.Z
git push origin main vX.Y.Z
git switch develop && git merge --no-ff main     # back-merge
```

- Hotfixes branch from `main`, merge to `main`, then back-merge to `develop`.
- Version strings move **only** on a release/hotfix branch: app, `index.html` asset queries, save
  format, `state.json`, README, AGENTS. A static check should fail on drift.
- Test a feature on a live preview (Pages from the feature branch or a preview build) before
  promoting; "it passes locally" is not the same as "it passes on an iPad over the network".
- Every release keeps the branch discipline visible in `docs/BRANCHING.md`; a handoff that says
  "commit to main" undoes the whole model.
