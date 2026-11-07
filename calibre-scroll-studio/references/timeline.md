# Timeline and choreography

## The map

`t` is normalized between the first and last chapter centres. It is not scroll pixels.

| t | Chapter | State |
| --- | --- | --- |
| 0 | The Watch | Assembled; 3/4 view; seconds sweeping |
| .25 | The Dial | Assembled close-up; crystal has a tiny early lift |
| .29–.47 | transition | Dial + hands lift upper-right; movement opens |
| .5 | The Movement | Movement exploded inside the case shell; dial above-right |
| .55–.75 | transition | Case shell slides left; caseback/rotor to lower-right |
| .75 | The Case | Full explosion |
| .815–.955 | transition | Retraction with per-part delays |
| 1 | The Whole | Fully assembled; finale copy |

The movement chapter is **not** the full explosion. It opens the movement inside its case. The case
chapter removes the case. Keeping those two states distinct is the narrative.

## Part windows

| Part(s) | First | Second |
| --- | --- | --- |
| Crystal | .19–.30 small lift | .55–.75 leaves with case |
| Bezel, band, lugs, crown | — | .55–.75 slide left ~1.3 |
| Dial | .26–.32 micro-lift | .27–.47 to (1.2, 1.35, .16) |
| Hour/minute/second | .22–.32 small lift | .29–.47 dial position, staggered z |
| Barrel | .36–.50 | — |
| Wheel train | .37–.54 | — |
| Pallet | .38–.54 | — |
| Balance | .38–.52 | — |
| Bridges/cock | .37–.53 | — |
| Mainplate | .42–.56 | — |
| Caseback + rotor | .58–.78 | same delta (0.5, −1.55, −1.02) |

Reassembly: hold multiplier `1 - smoothstep(.815 + delay, .955 + delay, t)`, delays .002–.022. At
`.98` all parts are home.

## Camera keys

```
t     az    el    dist  tx    ty
0.00  .34   .06   4.80  .06   0
0.14  .30   .10   4.62  .07   0.01
0.25  .33   .13   4.80  .06   0.03
0.36  .42   .18   5.70  .07   0.06
0.50  .45   .22   6.10  .08   0.10
0.64  .50   .24   6.45  .09   0.12
0.75  .52   .24   6.80  .09   0.12
0.86  .42   .15   6.05  .08   0.06
0.94  .33   .08   5.20  .06   0.02
1.00  .30   .05   4.72  .06   0
```

Watch yaw: `.06, .02, -.10, -.22, -.22, -.20, -.10, -.02, .06`. Net view angle peaks around 40°.

## Reassembly

The retraction is part of the same `t`. Do not reset on scroll-up; scrolling up reverses the same
smoothstep. This is why the finale feels like a return rather than a reload.

## Mobile

Portrait (`width < 900` or aspect < .82):

- group position y +.58; scale .7; camera distance +1.45; target y +.2;
- exposure: lift +.38, scale −20%, x drift +.1;
- finale: lift +.55, scale −16% additional;
- hide rail, callouts, facts; copy bottom-anchored.

The gate checks 390 × 844 for horizontal overflow and a heading below 330 px.

## Changing the timeline

1. Change the chapter sections and copy first.
2. Re-measure; the anchors are measured automatically but `CHAPTER_T` and camera keys are not.
3. Update the copy opacity windows (`±.078` around centres) if chapter count changes.
4. Update labels ranges and the gate's expected chapter states.
5. Render `.25`, `.5`, `.75`, `1`; compare with the contracts in `method.md`.
6. Run `npm run verify`.
