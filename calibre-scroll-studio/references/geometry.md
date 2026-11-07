# Geometry and materials

## Unit system

Everything is unitless and relative to a **case radius of 1.0**:

| Part | Dimension |
| --- | --- |
| Case band radius | 0.90–1.00 |
| Bezel | inner .856, outer .992, z .06–.112 |
| Dial | radius .884, face z .0305 |
| Crystal | radius ~.915, dome top z ~.167 |
| Movement | radius .812, z −.11 … .03 |
| Caseback | radius .872–.994, z −.13…−.195 |
| Lugs | y ±.835 → ~1.0, x ±.535 |
| Crown | x ~.995 → 1.16 |
| Hands | hour .475, minute .685, second .70 |

Camera distance is ~4.7 at the hero and ~6.8 at full explosion. If you scale the watch, scale the
camera distances with it or the composition changes.

## Case

- Case band and bezel are `LatheGeometry` profiles, rotated `x = PI/2` to put the axis on Z.
- The bezel is deliberately flatter than the first version; a tall polished profile reads as a tyre.
- The caseback is a lathe ring plus a `CircleGeometry` sapphire and an inner back plate with Geneva
  stripes. The rotor lives at z −.108 so it is visible through the back.
- Lugs are extruded tapered shapes ×4, rotated back slightly. Keep the base inside the case edge; long
  lugs at the widest x read as ears.
- The crown is a fluted gear shape extruded along X, with a domed cap and a ruby cabochon.

## Dial

The dial is a **flat `CircleGeometry`** face over a thin cylinder body, not a cylinder cap. Cylinder cap
UVs rotate the canvas artwork 90°; this was the first major bug. The texture is 1024 px:

- radial warm enamel (centre lighter, edges darker);
- 720 sunburst hairlines;
- 60-minute track with heavier five-minute marks;
- AURELIS / GENÈVE, CALIBRE 07 / AUTOMATIQUE, SWISS MADE;
- applied gold indices at radius .715 with double batons at 12;
- a gold chapter ring near the edge.

Keep the canvas text drawn with the loaded Bodoni font. `main.js` waits for fonts before building.

## Movement

Order: mainplate → barrel (drum, lid, mainspring spiral, ratchet/crown wheel) → wheel train → pallet
→ balance (rim, spokes, jewel, hairspring) → balance cock → bridges → jewels/screws → signature.
Key layout (movement local):

- barrel (−.33, .27), mainplate radius .812;
- centre (0, .03), third (.305, .215), fourth (.39, −.075), escape (.225, −.315);
- balance (−.32, −.31), balance cock over it;
- bridges are organic `Shape.splineThru` blobs with circular holes, extruded ~.024.

The balance must remain visible. An extra “lower bridge” added for density covered it; the reference
removed it. Add density with gears, screws, jewels or engraving, not a plate over the heart.

## Materials

`src/environment.js` exposes:

- polished gold / brushed gold / deep gold;
- polished steel / brushed steel / rhodium / rhodium dark;
- blued steel, ruby, sapphire, enamel, dial dark.

The environment is six emissive panels baked with `PMREMGenerator.fromScene(scene, 0.035)`:
overhead softbox, warm left strip, cool right strip, frontal fill, backdrop bounce, narrow specular
streak. No HDR file, no shadows.

Watch out: a roughness map with high contrast on a low-roughness rhodium bridge makes it nearly black.
Use the Geneva map on the caseback/rotor, not on the skeleton bridges.

## Engravings

Circular text is a canvas mapped to a ring. For a ring of outer radius `R`, the visible band spans
canvas radius `inner/(2R)` to `outer/(2R)` of the full texture. Drawing at `.405 × size` can land in the
hole; `.465 × size` is safe for the reference rings. Always verify by rendering the back.

## Performance

- ~103 draw calls, ~131k triangles at `.75`.
- No shadow maps, no post-processing, no per-frame render targets.
- Pixel ratio capped at 2.
- Geometry is static except for part transforms; the wheel train rotates as one mesh each.
- If the budget grows, merge caseback decoration and dial ticks before reducing the watch.
