# Method — construction order and invariants

The reference is a three-file static app. This file explains how it is assembled, the values that keep
it coherent, and the order in which a new city should be authored.

## 0. Before code

Fill [city-brief.md](city-brief.md). Choose **five** landmarks whose silhouettes are unmistakable from
above and from the street. Decide the axis (river/coast/avenue), the transit story, the two languages,
the five entry fees/hours/transit tips and the palette. Write the city’s own copy; do not borrow Bangkok
strings for another place.

## 1. Coordinate system

- X = east–west, Z = north–south, Y = up. One unit is a few metres.
- Keep a compressed, readable diorama; do not map lat/long into world positions.
- Bangkok reference: city `x ∈ [-94, 96]`, `z ∈ [-86, 86]`; Chao Phraya centre `x=-26`, half-width 9,
  banks `-35/-16`; east road x `[-12,4,20,36,52,68,84]`; z `[-72,-54,-36,-18,0,18,36,54,72]`; west
  roads x `[-74,-58,-42]`; park `x=36,z=26,w=22,d=15`; eye height 1.72.
- Landmark positions/plazas/markers/views/tour points are listed in [../SKILL.md](../SKILL.md) and
  `docs/CODE_MAP.md` of the source project. In the asset, search `LANDMARKS`.
- If a landmark moves, update all eight anchors plus the tour curve. Test the marker raycast and the
  fly-to view; a model that looks fine from the drone may put the walk camera inside a balcony.

## 2. Boot order

`boot()` stages work across paint frames:

1. optional `?reset=1`, renderer, materials, facade textures, plaza material
2. sky shader, stars/sun/moon, clouds, lights, accent lights
3. ground, river, promenades, railings, roads, bridges, park
4. five landmarks, plazas, markers, pick volumes, base colliders
5. city blocks/parcels, trees, street lamps, traffic, boats
6. controls, tour, UI, language, preset
7. URL params, camera, first render, loader hide
8. animation loop (water, traffic, boats, walk, tour, markers, labels, minimap, audio, render)

Build order matters: landmarks add plaza rings used to exclude later buildings/trees; buildings add
colliders used by walk; landmarks add pick targets used by raycasts.

## 3. Materials and lighting

- Standard material and light colours go through `srgb()` to linear. Textures are sRGB-encoded.
- Custom sky and water shaders get raw colours and do not run the output-encoding chunk. This split is
  intentional; changing it washes or crushes the palette.
- One 2048 shadow map, `autoUpdate=false`, refreshed after build and while a lighting preset transitions.
- Three presets (`day`, `golden`, `night`) drive top/bottom sky, sun colour/intensity/position,
  hemisphere/ambient, fog near/far, exposure, water, stars, clouds, window emissive, neon, lamp glow,
  car head/tail lights and marker glow.
- Facade textures are procedural canvas variants; no external photos/map tiles.

## 4. City

- Two ground slabs leave a river trench; embankment walls, promenade, railing posts and river lamps sell
  the scale.
- Roads are planes laid on street intervals; sidewalks are slightly above; lane dashes/crossings are
  thin instanced/plane geometry. Two bridges cross the river.
- Blocks are intervals between roads, shrunk for sidewalks, skipped near plazas/parks, subdivided into
  parcels, then buildings are placed with facade materials, roof lip/plant/antennas/signs.
- Buildings near plazas are capped so landmarks remain readable; traffic is hidden inside plazas.
- Trees/lamps/cars are instanced. The reference has ~108 cars and a few hundred scene children.

### Cars — six instanced meshes

Keep this decomposition for performance and quality:

1. `carBodyMesh` — tapered shell
2. `carCabinMesh` — dark glass tapered cabin
3. `carRoofMesh` — body-coloured roof panel
4. `carWheelMesh` — four cylinders (geometry rotated to local X)
5. `carHeadMesh` — two warm lights at local +Z
6. `carTailMesh` — two red lights at local −Z

Local +Z is the car’s front. Root yaw: z-axis move `dir>0 ? 0 : π`; x-axis move `dir>0 ? π/2 : −π/2`.
All part offsets are local, then root scale applies. Fifteen matrices per car per frame is acceptable;
individual car groups are not. Do not make the wheels/parts cast continuous shadows.

## 5. Landmarks

- Reuse `addBox/addCyl/addCone/addSphere/addTorus`, shared `MAT.*`, and group-level placement.
- Use `hipRoofMesh()` for rectangular Thai roofs. It is a six-vertex hip roof; two tiers + gold eave,
  ridge and chofah make a convincing temple roof. Rotated four-sided cylinders distort non-square roofs.
- `thaiChedi()` uses a lathe bell, rings and spire.
- Wat Arun: tiered prangs with redented corners, gold bands, porcelain panels, satellite prangs.
- Wat Pho: ubosot, four chedis, open-canopy Reclining Buddha (visible from above).
- Grand Palace: crenellated white wall, Wat Phra Kaew, golden chedi, Chakri Maha Prasat, gates.
- Golden Mount: layered green hill, spiral tube path, slope pavilions, lathe gold chedi.
- Baiyoke: podium, tapered glass shaft, observation deck, neon ring, antenna, blinking beacon, sign.
- Each group gets `userData.landmarkId`; every mesh is marked for raycast/shadow.
- Plaza circle + gold ring; invisible pick sphere with `pickKind='volume'`; base AABB collider.
- Five markers: torus ring, octahedron gem, beam, additive glow; marker meshes get
  `pickKind='marker'`. Baiyoke marker is offset `[18,0,10]` and height 64 so it clears the tower.

## 6. Camera modes

### Drone
OrbitControls with damping, min/max distance 16–270, max polar 0.475π, pan, cinematic intro auto-rotate.
Save camera/target when leaving. `recenterDrone()`/`flyToLandmark()` use a cubic ease tween.

### Walk
- Spawn `(-10.5, 1.72, 46)`, look at `(-50, 14, 18)` in Bangkok; adapt per city.
- Movement: WASD/arrows/pad → flattened camera forward/right → axis-separated AABB collision.
- Look: pointerdown captures, derive yaw/pitch from quaternion; pointermove:
  `yaw += dx * sensitivity`, `pitch -= dy * sensitivity` (pitch clamped ±1.45 rad). Horizontal inversion
  is intentional.
- No pointer lock. `focusScene()` returns focus to the canvas after overlays; hidden form controls must
  not eat keys.
- On-screen pad writes `padKeys`; keyboard writes `keys`; both feed one movement path.
- Zoom: `freeZoom` 0.6–1.8 × base FOV (48 landscape / 62 portrait), clamp 26–86.
- Walk click: only small marker meshes; skip `pickKind !== 'marker'`.
- Head bob + footsteps by travelled distance.

### Transit
Catmull-Rom curve through 14 points (Bangkok values in SKILL). Five stops store `u`, an explicit view and
a focus. State: travel `u += dt * 0.0138`, dwell 7.2 s, index++, complete with replay. Look target is a
point ~0.022 u ahead with y +0.35 — **not** +1.5 (that pitches the camera into the sky). Pause, next,
drawer-open pause and HUD are projections of this state.

## 7. UI, state, audio, export

- `I18N` holds all UI keys; `LANDMARKS[].en/th` holds the content. `applyLanguage()` updates text,
  placeholders, ARIA labels, labels, progress, tour bar and the open drawer.
- State: `version, lang, preset, mode, audio, visited, itinerary, notes`. Storage key
  `bangkok3d.state.v1`. Sanitise unknown ids and cap notes at 4,000.
- Export: `bangkok_3d_tour.json` with app/version/city/exportedAt/language/preset/visited/itinerary/
  notes/stats/credits. Import accepts flat or `{state}` and requires at least one data field. Replace
  arrays/notes (do not append) and preserve local audio/mode.
- Audio: gesture-gated Web Audio. Noise buffer → bandpass/lowpass/highpass → stereo panners; river LFO;
  HRTF temple bell panner; footstep noise + thump; speechSynthesis narration. No recorded files.
- Markers/labels: HTML labels project marker anchors; hide during intro/drawer/help/off-screen; markers
  bob and scale on hover.

## 8. Data contracts

- IDs: the five stable ids. The current set is `wat-arun`, `wat-pho`, `grand-palace`, `golden-mount`,
  `baiyoke`. A new city must choose its own five and update all references.
- Do not change state/export keys or filename without a migration and version bump.
- `window.Bangkok3D` debug API must remain for tests/screenshots (rename only with all docs/tests).

## 9. Performance

- Share geometries/materials; instanced trees/lamps/dashes/cars.
- Pixel ratio cap 2; static shadow map; no post-processing; nine clouds; low-segment geometry.
- 70–90 parcels; landmark detail is the main mesh cost.
- Don't add moving shadow casters or per-frame material clones without measuring.

## 10. Adaptation checklist

- [ ] New `CITY.md` and five source-verified stories.
- [ ] New world/axis/roads/plazas, not Bangkok numbers.
- [ ] Five new silhouettes and camera anchors.
- [ ] New tour route and five stop views.
- [ ] New EN/local copy, fee/hours/transit snapshots.
- [ ] New palette/fonts if appropriate, still Thai/local coverage.
- [ ] New ids/state/export names; update docs/tests.
- [ ] New self-test targets and screenshots.
- [ ] Re-run full verification and live Pages check.
