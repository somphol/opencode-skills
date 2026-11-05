# Fairness and spin math

## The product claim

Every active entry has probability `1/n`. The winner is chosen before the wheel moves; the animation
only travels to the chosen slice. If you change this, you are building a different product.

## Uniform pick

```js
const ceiling = Math.floor(0x100000000 / n) * n;
let value;
do { crypto.getRandomValues(buffer); value = buffer[0]; } while (value >= ceiling);
return value % n;
```

Rejection removes modulo bias for `n` that does not divide `2³²`. The engine also accepts an injected
`randomInt(n)` for deterministic tests; never use that path in production.

## Slice model

```
step = TAU / n
slice i = [i*step, (i+1)*step)
mid i   = (i + 0.5) * step
```

The canvas draws slices with y down. Three.js has y up. A canvas point at angle `θ` appears at world
angle `r − θ` when the wheel group rotates by `r`. The pointer is at world `+Y` (`π/2`).

Landing:

```
rTarget = PI/2 + mid
current = mod(rNow, TAU)
delta   = mod(rTarget - current, TAU) + turns * TAU
rEnd    = rNow + delta
```

Resolution:

```
theta = mod(rEnd - PI/2, TAU)
index = min(n - 1, floor(theta / step))
```

The initial rotation is `rotationForIndex(0, n)` so slice 0 rests under the pointer.

## Easing

`r(t) = rStart + delta * smoothstep(t)`, `smoothstep(t) = t²(3 − 2t)`.

- zero velocity at both ends → wind-up and friction settle;
- monotonic → never reverses;
- exact end angle → frame rate cannot change the result.

Duration 3–10 s (default 5.5), turns 2–14 (default 6). Reduced motion: 1.1 s, one turn.

## Ticks and pointer

```
passed = floor((angle - rStart) / step)
pegsPerSecond = angularVelocity / step
freq = 1180 + min(1900, pegsPerSecond * 36)
```

Throttle ticks to one per 24 ms. Kick the pointer on each crossing:

```
v += (-angle * 110 - v * 10.5) * dt
angle += v * dt
angle = clamp(angle, -0.42, 0.42)
```

The impulse scales with the crossing rate but is clamped to `[0.045, 0.34]`.

## Invariants to test

1. Slices partition `[0, 2π)` exactly for 2–32.
2. `resolveIndex(rotationForIndex(i, n), n) === i` for every `i`.
3. `targetRotation(i, n, turns, from)` is forward-only and lands on `i` (1 000 cases).
4. Normalising the end rotation preserves the index.
5. 40 000 seeded picks are balanced.
6. A full simulated draw for every `n` resolves to the pick.

## Browser proof

After a real spin:

```js
const record = state.history[0];
engine.resolveIndex(studio.wheel.rotation.z, state.roster.length)
  === state.roster.indexOf(record.winner)
```

Assert this. It catches sign errors that a screenshot cannot.
