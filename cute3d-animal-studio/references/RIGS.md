# Character rigs

Base mesh counts after the cuteness pass: bear 27, bunny 29, penguin 21, shiba 28, koala 25, conure 52, fold 34.

All characters are `THREE.Group`s facing +Z, standing on y = 0. Reuse a unit sphere
(`SphereGeometry(1, 26, 20)`) for rounded parts. Mark shared geometry and accessory materials
`userData.shared = true`.

## Rig contract

```js
{
  id, group, head, body, belly,
  ears: [left, right], eyes: [left, right], glints: [left, right],
  tail, feet: [left, right], arms: [left, right], cheeks: [left, right], mouth,
  anchors: { neck, hat, glasses },
  materials: { main, mainDark, belly, blush, inner, eye, glint, nose, beak, foot, cream, accent },
  base: { belly: Vector3, headRotX, headRotZ, tailRot },
  seed, blinkSeed
}
```

`buildAnimal()` adds accessories to the anchors and stores `earBases = ears.map(e => e.rotation.z)`.
Materials are unique per rig. Animate cheeks from `mesh.userData.baseScale`.

## Palettes

| Animal | main | belly | blush | meshes |
| --- | --- | --- | --- | --- |
| bear | `#c08a6d` | `#ffe9df` | `#ff9db6` | 25 |
| bunny | `#f0d3c2` | `#fff6ef` | `#ffa8bf` | 27 |
| penguin | `#4a5774` | `#fdf8f0` | `#ffa9b8` | 19 |
| shiba | `#dfa163` | `#fff4e4` | `#ff9f8f` | 29 |

## Bear

- Legs: spheres r 0.3 at (±0.37, 0.26, 0.06); blush pads at z 0.31.
- Body: sphere scale (0.92, 0.90, 0.80) at y 0.98.
- Belly: scale (0.58, 0.54, 0.32) at (0, 0.92, 0.56).
- Arms: capsules r 0.16, len 0.42 at (±0.95, 1.08, 0.10), Z rotation ±0.72.
- Tail: pivot (0, 0.78, −0.62), sphere r 0.18 at local z −0.1.
- Head: group at y 2.02; sphere scale (0.84, 0.78, 0.76).
- Ears: pivots (±0.58, 0.36, −0.02), sphere scale (0.27, 0.27, 0.16) at local y 0.2; blush inner.
- Eye patches: `mainDark`, scale (0.25, 0.23, 0.07) at (±0.32, 0.06, 0.62).
- Eyes: r scale (0.105, 0.105, 0.08) at (±0.31, 0.08, 0.70). Glints at z 0.77.
- Muzzle: scale (0.36, 0.28, 0.28) at (0, −0.13, 0.58); nose at z 0.84; torus smile.
- Cheeks: scale (0.16, 0.13, 0.06) at (±0.52, −0.07, 0.55).
- Anchors: neck (0, 1.40, 0.80), hat (0, 0.62, 0.12), glasses (0, 0.08, 0.74).

## Bunny

- Body: (0.82, 0.94, 0.74) at y 0.94; belly (0.54, 0.60, 0.28) at z 0.50.
- Feet: capsule r 0.14, len 0.20, rotated X 90° at (±0.33, 0.16, 0.22); blush pads.
- Arms: r 0.13, len 0.36 at (±0.86, 1.00, 0.12).
- Tail: 3 belly spheres at pivot (0, 0.74, −0.58).
- Head: y 1.96, sphere (0.76, 0.70, 0.70).
- Ears: pivots (±0.34, 0.48, −0.02), Z rotation ±0.13; capsule r 0.18 len 0.72 at local y 0.54;
  inner capsule r 0.10 len 0.56 at z 0.075, flattened Z.
- Eyes (±0.26, 0.10, 0.62), muzzle z 0.54, pink nose z 0.77, two buck teeth at z 0.77.
- Cheeks (±0.47, −0.06, 0.52).
- Anchors: neck (0, 1.33, 0.74), hat (0, 0.58, 0.14), glasses (0, 0.10, 0.66).

## Penguin

- Body: (0.88, 0.98, 0.84) at y 1.02; belly (0.68, 0.80, 0.30) at z 0.60.
- Feet: orange spheres (0.28, 0.09, 0.36) at (±0.31, 0.09, 0.20).
- Flippers: capsules r 0.14 len 0.44 at (±0.92, 1.18, 0), Z ±0.28, flattened Z.
- Tail: cone at (0, 0.55, −0.70), rotated X −1.1.
- Head: y 2.06, sphere (0.64, 0.60, 0.60).
- Face patch: belly sphere (0.46, 0.40, 0.26) at (0, −0.02, 0.45). Its front is ~0.71.
- Eyes at (±0.21, 0.06, 0.72); glints 0.79; no brows.
- Beak: cone at (0, −0.13, 0.67), rot X `π/2 + 0.22`, scale (0.16, 0.34, 0.12).
- Cheeks (±0.37, −0.12, 0.64); tuft = 3 small main spheres above the head.
- Anchors: neck (0, 1.52, 0.80), hat (0, 0.52, 0.10), glasses (0, 0.06, 0.60).

## Shiba

- Body: (0.86, 0.86, 0.80) at y 0.96; belly (0.58, 0.60, 0.26) at z 0.58.
- Legs: capsules r 0.13 len 0.24 at (±0.35, 0.22, 0.02); cream paws at z 0.12.
- Arms at (±0.84, 1.00, 0.12), Z ±0.55.
- Tail: torus arc r 0.25 tube 0.11, arc 1.45π, at (0, 1.32, −0.67), rotated Y 90°; cream tip.
- Head: y 2.00, sphere (0.80, 0.72, 0.72).
- Ears: 4-sided cones r 0.26 h 0.5 at (±0.44, 0.48) + 0.22 local, rotated Y 45°, inner cone.
- Eyes (±0.27, 0.11, 0.62), cream brows at (±0.28, 0.28, 0.60).
- Muzzle z 0.56, nose z 0.80, torus smile.
- Cheeks (±0.49, −0.09, 0.52).
- Anchors: neck (0, 1.43, 0.75), hat (0, 0.58, 0.10), glasses (0, 0.11, 0.68).

## Accessories

**Bowtie** — two cones r 0.17 h 0.32 (4-sided), apex inward (left rot Z −90°, right +90°), scale Z
0.62, positions ±0.16; gold knot sphere 0.085; group at (0, 0.02, 0.10), scale 1.1.

**Party hat** — cone r 0.3 h 0.78 at y 0.4; gold torus trim r 0.285 tube 0.035 at y 0.03;
mint pompom r 0.12 at y 0.8; group rotation (−0.12, 0, 0.16).

**Glasses** — two torus rings r 0.155 tube 0.022 at x ±0.29; bridge cylinder len 0.22; arms len 0.5
at z −0.24; dark material.

All accessory groups start hidden and are switched with `.visible`. Parent: bowtie → neck; hat →
anchors.hat; glasses → anchors.glasses.

## Koala (base 23 meshes)

- Body `(0.92, 1.00, 0.82)` at y 1.00; cream belly `(0.58, 0.66, 0.30)` at z 0.56.
- Huge ears: pivots ±0.70, y 0.34; outer sphere `(0.34, 0.40, 0.18)` at local y 0.26; inner cream
  `(0.22, 0.28, 0.06)` at z 0.12.
- Head y 2.06, sphere `(0.84, 0.78, 0.76)`; broad nose `(0.24, 0.18, 0.14)` at z 0.80; cream muzzle.
- Eyes ±0.29, z 0.66; blush ±0.50.
- Coat: long silver shells on body/head/ears/tail; ear mask reveals the cream inner ear.

## Baby Hippo (chunky lilac)

- Body `(0.90, 0.94, 0.82)` at y 0.97; cream belly `(0.60, 0.64, 0.26)` at `(0, 0.95, 0.64)`.
- Stubby legs `(0.14, 0.20)` at ±0.36; cream paws ±0.36 at z 0.12. Short arms at ±0.94, z 0.18.
- Head y 2.00, sphere `(0.88, 0.78, 0.76)`; round ears on pivots ±0.58, y 0.62, outer
  `(0.20, 0.22, 0.11)` + cream inner.
- Signature muzzle: cream ellipsoid `(0.56, 0.30, 0.35)` at `(0, −0.17, 0.55)`; two dark nostrils
  `(0.06, 0.045, 0.03)` at ±0.15, z 0.87; smile torus; two tiny cream teeth at ±0.19, z 0.88.
- Eyes ±0.31, z 0.65; blush ±0.56. Posture plants the feet and pushes the arms forward.
- Coat: short fur on body/belly/head/ears/tail; the head mask keeps the whole muzzle bare.

## Sun Conure (base 50 meshes)

- Yellow body `(0.80, 1.00, 0.72)` at 1.00; orange chest `(0.60, 0.74, 0.28)` at z 0.50; green mantle.
- Head y 2.02, sphere `(0.66, 0.62, 0.62)`; cream eye patches ±0.27 at z 0.54; eyes z 0.62.
- Charcoal beak: cone `(0.14, 0.30, 0.13)` at `(0, -0.12, 0.70)`, tip down, slight forward tilt.
- Wings: group at ±0.69, y 1.36, rotation Y ±0.42; 6 green flight feathers + 4 lime coverts, plus two
  green ellipsoid coverts. Feather geometry is a 10-row leaf with a raised shaft, vertex-coloured from
  base to tip (`featherGeometry(base, tip)`).
- Tail: 6 green→blue feathers at z −0.32, rotated down/back, plus a 3-feather low fan and a blue rump.
- Coat: feather shells on body, chest and head; no face mask beyond z 0.58.

## Scottish Fold (base 32 meshes)

- Body `(0.86, 0.94, 0.82)` at 0.99; cream belly at z 0.58; silver fur.
- Head y 2.00, sphere `(0.82, 0.74, 0.72)`; large eyes ±0.28, z 0.63.
- Folded ears: pivots ±0.44, y 0.52, **z 0.50**, rotation X −0.32, Z ±0.14; outer flattened
  `(0.27, 0.20, 0.09)`, pink inner `(0.18, 0.13, 0.045)` at z 0.07.
- Eight whiskers (4 per side), cream cylinders at z 0.66; pink nose; cream muzzle.
- Tail: torus curl + cream tip. Coat: dense silver shells on body/head/cheeks/tail; cream cheek fur.

## Coat system

- `COAT_CONFIG` zones: `{ mesh, role, count, len, radius, minY, maxZ }`.
- `applyCoat(rig, level)`: clone each zone mesh 5 (soft) / 10 (plush) times, scale to
  `1.004 + layer/shells * thickness`, assign a canvas strand alpha + bump material.
- Masks: head `z > 0.58`, ears `z > 0.35`, body oval `length(vec2(x/0.78,(y+0.05)/0.8)) < 1`.
- `rig.fluff` / `rig.fluffMaterials`; dispose alphaMap clones, never shared geometry.
- State: `coat: 'off'|'soft'|'plush'`; share `f=`.

## Species postures

| Animal | Pose | Key changes |
| --- | --- | --- |
| Bear | sit | body/head −0.10, legs forward z 0.36, paws on lap |
| Bunny | alert | body +0.03, ears back x −0.22, paws tucked |
| Penguin | lean | group x +0.06, feet wide, flippers out |
| Shiba | sit | body/head −0.11, haunch spheres, front paws forward |
| Koala | cling | arms up/out, legs tucked, body lean |
| Conure | perch | feet y 0.10 on branch, group x +0.05, tail down |
| Fold | loaf | body/head −0.12, legs tucked, paws forward, tail wrapped |

Pose before `applyCoat`; store `base.headRotX/Z`, `earBaseX`, `feet.baseY`. The loop adds expression
to head bases and counter-translates feet by the idle bob.
