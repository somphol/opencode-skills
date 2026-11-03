# What regresses

These are the failure modes found while building the reference. Check them before shipping.

## Camera

- **Whip-pan.** Re-framing on every move is dizzying. Stay on the hero view while the
  working face is visible; use `dot > 0.22` and re-frame only when it is not.
- **Position lerp through the cube.** Interpolate theta/phi/distance, not world position.
  A straight position lerp can pass through the cube or dolly in unexpectedly.
- **Fighting damping.** Disable OrbitControls damping during the director and restore it
  afterwards. Do not set the user-moved flag.
- **Resize during the show.** Skip `fitCamera()` while the director is active, or the camera
  will jump.
- **Hidden controls.** `controls.enabled = false` prevents orbit but does not stop
  `controls.update()` from orienting the camera; that is fine. Re-enable on exit.
- **Reduced motion.** Do not remove the solve or the controls. Skip camera movement and
  shorten turns, but keep everything usable.

## Banner and layout

- **Stale banner timer.** A scramble banner scheduled with `showBannerFor()` can hide the
  solve banner mid-run. Clear the banner timer whenever a new banner is shown.
- **Hidden dock still occupies space.** If the cinematic mode only sets `opacity: 0` on the
  dock, the banner stays above the empty space. Use `display: none` (or collapse the
  layout) so the banner sits at the bottom.
- **Short screens.** A `max-height` media query may hide the banner. Override it for the
  cinematic mode so the move is still readable.
- **Overlap.** The banner must not cover the working face. Pull the camera back or move the
  banner; do not leave the move hidden.
- **Mobile action row.** Adding a fifth action button can overflow at 360 px. Hide the
  long Auto Solve label at the small breakpoint or shorten it.

## Glow

- **Washed-out colours.** The first glow pass was too bright. Keep the base colour visible:
  emissive `base × (0.02 + glow × 0.34)`, intensity `1 + glow × 0.32`, tint only
  `glow × 0.14`.
- **Shared materials.** If stickers share a material, highlighting one highlights all of
  that colour. Clone per sticker.
- **Growing set.** Remove settled stickers from the active set; do not update all 54
  forever.
- **Scale jitter.** Keep the scale pop small (2%) and ease it with the same factor.

## Step mode

- **Gate hang.** If Reset or Scramble does not release the gate, the solve loop waits
  forever. Release on every cancellation path.
- **Speed switch hang.** Switching from Step to Fast must release the gate and auto-play the
  rest.
- **Double advance.** A rapid second click while a move animates must not queue another
  move. Disable Next while `isAnimating`.
- **Hidden Pause.** In cinematic mode the speed row is hidden. Add a Pause/Next control to
  the cinematic UI or the user loses pause.
- **Banner after the wait.** Show the move before waiting; otherwise the user does not know
  what Next will do.
- **Status copy.** While waiting, say `Step`, not `Solving` or `Paused`.

## Docs and release

- **Documented features that do not exist.** The first release docs mentioned import/export
  and saved state. Audit every claim against the code.
- **Solution length claims.** The solver is not guaranteed optimal. Say "around 20 moves",
  not "20 or fewer".
- **Personal contact data.** Do not put a personal email in a public code of conduct. Use a
  private reporting form and the maintainer profile.
- **Generated file drift.** Edit `src/`, run the build, commit `index.html`. CI must fail on
  drift.
- **Stale baseline.** A reproduction blueprint with hard-coded commit hashes goes stale.
  Mark it as a snapshot and tell the reader to check `git log`.
- **Broken links.** Run a local Markdown link check after adding docs.
- **Invalid YAML.** Issue templates and workflows are YAML; parse them before pushing.
- **Catalog sync skips `docs/`.** If the skill asset includes a reference project's docs,
  store them as `project-docs/` and rename them in the scaffold, or the catalog copy will
  silently lose them.

## Deployment

- **Pages cache.** The live site can serve the previous build for a minute. Verify the new
  content, not just HTTP 200.
- **Generated artifact not committed.** Pages serves the committed file; a local build
  alone does not deploy.
- **CDN blocked.** Three.js is a runtime CDN dependency. A blocked CDN is a fatal error;
  document it rather than hiding it.
- **No SRI.** Pinning limits drift but does not remove CDN supply-chain risk. State it
  honestly in SECURITY.md.
