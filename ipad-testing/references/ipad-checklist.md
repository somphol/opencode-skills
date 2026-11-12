# iPad release checklist

Run tier 1 for every item that can be measured; mark the ones that need tier 2/3 and do them before a
release is called done.

## Viewport

- [ ] No vertical page scroll: `document.documentElement.scrollHeight <= innerHeight + 1`
- [ ] No horizontal scroll: `scrollWidth <= innerWidth + 1`
- [ ] Full-height containers use `100dvh`, not `100vh`
- [ ] `visualViewport.height` and `innerHeight` agree within a few px with the toolbar expanded
- [ ] Both orientations checked: 820×1180 and 1180×820 (iPad), 744×1133 / 1133×744 (mini)
- [ ] `viewport-fit=cover` present when the app is installable

## Layout

- [ ] Tablet/desktop split uses `(max-width: 1024px), (pointer: coarse)` in CSS **and** JS
- [ ] Primary canvas/board is not covered by the dock, header or a floating button
- [ ] Fixed or sticky bars sit inside `env(safe-area-inset-*)`
- [ ] Long text, a wrapped header and the largest in-app font size still leave the primary action visible
- [ ] Modals fit inside the viewport and scroll internally; their action row stays reachable
- [ ] Canvas/camera re-fits after rotation instead of cropping

## Touch

- [ ] Tap targets are at least 40×40 px, including icon-only controls
- [ ] No action depends on hover; every hover affordance has a tap equivalent
- [ ] Double-tap on non-canvas controls does not zoom or open a stray sheet
- [ ] Inputs are at least 16 px so Safari does not autozoom
- [ ] A drag/pinch on the main canvas does not scroll the page

## Behaviour

- [ ] Submit/tap fires once; no duplicate handler from a `touchend` + `click` pair
- [ ] Panels/sheets that pause rendering re-render from state when closed
- [ ] Backgrounding and returning keeps the session (or clearly reconnects)
- [ ] A full-screen overlay is dismissible without a keyboard
- [ ] Back/forward or hash navigation does not leave a modal stuck

## Browser chrome

- [ ] Toolbar collapse and expand do not hide the primary action (tier 2/3)
- [ ] Home indicator and rounded corners do not overlap controls (tier 3)
- [ ] Add to Home Screen launches full screen; the exit path is obvious (tier 3)

## Evidence

- [ ] Portrait and landscape screenshots saved next to the change
- [ ] Measurement JSON attached (viewport, scroll, rects, media matches)
- [ ] Any item that could only be checked on hardware is stated plainly in the handoff
