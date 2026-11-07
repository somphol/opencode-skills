# Timeline and choreography

`t` is normalized between the centre of the hero and the centre of the finale. It is not scroll
pixels. The chapters land on `0, .25, .5, .75, 1` by construction; the anchor measurement is in
`src/main.js`.

## Chapter map

| t | Chapter | Watch state | Camera intent |
| --- | --- | --- | --- |
| 0 | The Watch | Assembled. Slight 3/4 view, hands at 10:12, seconds sweeping. | Close, intimate, watch right of the copy. |
| .25 | The Dial | Still assembled; the crystal gets a small early lift; the copy is a portrait of the dial. | Closest; the dial fills the right half. |
| .27–.47 | transition | Dial + hands lift to the upper right. Movement starts to open. | Pull back and orbit ~40°. |
| .5 | The Movement | Case shell still frames an exploded movement; dial floats above-right; hands ride the dial. | 40° orbit, slightly high, wide enough for the fan. |
| .55–.75 | transition | Case shell (band, bezel, crystal, lugs, crown) slides left. Caseback + rotor move to the lower right. | Orbit to ~41°, pull back to 6.8. |
| .75 | The Case | Full explosion: case shell left, movement centre, dial upper-right, caseback/rotor lower-right. | Wide, 41°, high enough to read depth. |
| .815–.955 | transition | Everything retracts with per-part delays. | Pull back in, orbit home. |
| 1 | The Whole | Fully assembled, finale copy and CTA. | Hero-like but quieter; slight low angle. |

The case chapter deliberately shows the **full** explosion; the movement chapter shows the movement
opened *inside the case*, with the dial removed. This is the key narrative distinction.

## Part windows

| Part(s) | First window | First move | Second window | Second move |
| --- | --- | --- | --- | --- |
| Crystal | .19–.30 | small lift (`.02,.14,.12`) | .55–.75 | leaves with the case shell (`-1.32,.05,.02`) |
| Bezel | — | — | .55–.75 | leaves with the case shell |
| Caseband, lugs, crown | — | — | .55–.75 | slide left ~1.3 |
| Dial | .26–.32 | micro-lift | .27–.47 | `(1.2, 1.35, .16)` upper-right |
| Hour / minute / second | .22–.32 | small lift | .29–.47 | same dial position, staggered z |
| Barrel | .36–.50 | left/up, z +.06 | — | — |
| Wheel train | .37–.54 | radial fan, z +.04… | — | — |
| Pallet | .38–.54 | left/down | — | — |
| Balance | .38–.52 | right/down, z +.20 | — | — |
| Bridges / cock | .37–.53 | lift, small lateral | — | — |
| Mainplate | .42–.56 | back/centre | — | — |
| Caseback | .58–.78 | `(0.5,-1.55,-1.02)` | — | — |
| Rotor | .58–.78 | same delta as caseback | — | — |

The rotor and caseback share a delta so the rotor stays inside the exhibition back while it travels.
The case shell leaves as one unit so the movement never loses its frame until the case chapter.

Reassembly starts at `.815 + delay` and ends at `.955 + delay`; delays are 0.002–0.022. All parts are
at base by `t ≈ .98`.

## Camera keys

```
t     az    el    dist   tx    ty
0.00  .34   .06   4.80   .06   0.00
0.14  .30   .10   4.62   .07   0.01
0.25  .33   .13   4.80   .06   0.03
0.36  .42   .18   5.70   .07   0.06
0.50  .45   .22   6.10   .08   0.10
0.64  .50   .24   6.45   .09   0.12
0.75  .52   .24   6.80   .09   0.12
0.86  .42   .15   6.05   .08   0.06
0.94  .33   .08   5.20   .06   0.02
1.00  .30   .05   4.72   .06   0.00
```

Watch yaw: `.06, .02, -.10, -.22, -.22, -.20, -.10, -.02, .06` at roughly the same stops. Net view
angle is highest during the case chapter (~40°+), which is what makes the depth fan legible.

Portrait adds `+1.45` to distance, `+.2` to target y and a base scale of `.7` (desktop `.92`). During
exposure the group is lifted `.38`, shrunk 20%, and for the finale lifted `.55` and shrunk a further
16%. This is what keeps the watch out of the mobile copy.

## Editing the timeline

1. Change the copy section heights if the narrative needs more room; the anchors are measured.
2. Keep chapter centres at `t = 0, .25, .5, .75, 1` by keeping the sections' relative structure.
3. If you change a part's window, check the two screenshots at `.5` and `.75`; they are the two
   composition contracts.
4. Keep all parts inside the camera frustum at `.75` with the watch group scaled to 0.92 × 0.8.
5. Run `npm run verify`; it checks the dial lift, balance exposure, caseband separation, rotor
   alignment, hand tracking and full reassembly.
