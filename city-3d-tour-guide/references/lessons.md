# What regresses — paid-for lessons

These are real defects and near misses from the Bangkok build. Read this before touching controls,
roofs, cars, tour camera or release files.

## 1. “Walking is broken” was two bugs plus a cache

**Symptoms:** WASD/arrow keys did nothing; sometimes the guide opened and walking stopped.

**Causes:**
1. Walk used `PointerLockControls`; the cursor was captured and “click to look” was unfamiliar.
2. Focus stayed on the hidden notes `textarea` after the drawer closed, so `onKeyDown` ignored movement.
3. A stationary scene click could hit a huge invisible landmark pick sphere, open the guide, and
   `updateWalk()` returns while the drawer is open.
4. Browser cache served an old `script.js` with new HTML after a deploy.

**Fixes that must survive:**
- No pointer lock. Drag look with a visible cursor.
- `focusScene()` blurs hidden controls and focuses `#scene` after intro/mode/drawer/help transitions.
- `pickAt()` in walk mode ignores objects whose `userData.pickKind !== 'marker'`.
- Versioned `style.css?v=`/`script.js?v=` queries matching `APP.version`.

Do not “simplify” these by removing focus or pick-kind checks.

## 2. Horizontal drag was the wrong way

Users expect a landscape-grab model: **drag left → see the right side**. The original standard FPS
mapping (`yaw -= dx`) felt reversed. Current code is `walkLook.yaw += dx * sensitivity`. Vertical look
stays conventional. Do not revert without a direct user request.

## 3. Pointer lock removal is intentional

The original task asked for PointerLockControls; the user explicitly replaced it with normal drag. A
future agent must not “restore” the original requirement. No sticky mouse, no Escape-to-release copy, no
crosshair as a mouse-lock indicator.

## 4. Walk pad is essential, not decoration

WASD is not universally understood; phone users have no keyboard. The on-screen arrow pad writes the
same movement flags as keys. It must remain in walk mode, above the hint bar on narrow screens. Its
buttons need pointer capture/release, `pointercancel`, keyboard focus reset and ARIA labels in both
languages.

## 5. The tour camera looked at the sky

`ahead.y += 1.5` combined with a very short look-ahead (0.012 u) pitched the camera ~50° upward; the city
disappeared and only clouds/markers showed. Use `+0.35` and ~0.022 u, or derive the look target from a
longer sample. Test the first five seconds of travel, not just a still at the end.

## 6. A bridge crossed the river tour route

A bridge at z=54 put a tower beside the camera and cables across the route. Bridges must be outside the
transit spline or the camera must rise above them. In Bangkok the south bridge moved to z=80. Check the
whole route against every bridge/landmark AABB.

## 7. Roofs were distorted diamonds

A four-sided rotated `CylinderGeometry` works for square plans, but scaling it for rectangular plans
(w≠d) produces a twisted roof. `hipRoofMesh()` uses explicit vertices and a real ridge. Use it for all
Thai rectangular roofs. Do not reintroduce the cylinder shortcut.

## 8. Everything looked washed out

With `outputEncoding=sRGBEncoding`, hex colours treated as linear become pastel. Standard materials and
lights now use `srgb()`; the sky/water shaders do not include the encoding chunk and keep raw colours.
Changing one side without the other destroys the palette.

## 9. Cars were moving boxes

A single scaled box cannot read as a car. The fixed version uses six instanced meshes: tapered body,
dark glass cabin, body-coloured roof, four wheels, headlights and tail lights. Local +Z is front; root
yaw handles direction. Watch double scaling: wheel/lamp offsets are local pre-root-scale, not multiplied
by car size again. The car light materials need emissive updates in `writeLightMix`.

## 10. Accidental guide click / invisible blockers

Large pick spheres are convenient for drone selection but terrible for walk. Marker-only picking and
separate `pickKind` tags are the contract. Similarly, landmarks need base AABB colliders while plazas
remain open; the walker must not enter a prang or a hill.

## 11. Markers hidden by their own labels or height

Labels are anchored ~6.5 units above markers. Baiyoke’s antenna would put the label behind the topbar,
so the marker is offset 18 units east and 10 north at y=64. If you change a tall landmark, check its
label projection at the default drone camera and at 430 px width. Labels are hidden on narrow screens.

## 12. Imported state reference went stale

`importJSON()` originally reassigned `state = merged`. `window.Bangkok3D.state` kept the old object and
import tests read stale data. Use `Object.assign(state, merged)` so public references remain valid.

## 13. Cache-busting is easy to forget

The browser can mix a new HTML shell with an old script. `index.html` must use `style.css?v=APP.version`
and `script.js?v=APP.version`. The static check enforces it. If a user reports an impossible old
behaviour, give them a versioned URL or ask for a hard refresh.

## 14. Headless movement tests lie

Headless Chrome may mark the page hidden, pause rAF and blur the window; a real keydown can immediately
fire `blur`, clearing `keys`. Use `Emulation.setFocusEmulationEnabled` or a headful Chrome for walk
tests. The scene can be correct while headless reports no movement.

## 15. Mobile spacing

The walk pad sits bottom-right; on narrow screens it was moved above the hint to avoid overlap. Labels
are hidden below 860 px; the trail panel becomes a button. The drawer is full width below 620 px. Test
430×900, not just desktop.

## 16. Documentation entropy

Version numbers appear in APP, asset query strings, package/state metadata, README badge, changelog,
release tag and docs. The static check catches some but not all. Bump them together, update the
handoff/code map when controls change, and never let AGENTS.md describe an older release.
