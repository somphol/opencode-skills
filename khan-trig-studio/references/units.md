# Unit specifications

The series follows Khan Academy Trigonometry Units 1–4. Each project is a
self-contained companion, not a clone of Khan's exercises.

## Unit 1 — Right Triangle Studio

**Modules (4):**

1. SOH-CAH-TOA & ratio constancy.
   - Draggable right triangle A (top), B (right angle), C (θ).
   - Angle 5°–85°, scale 0.5×–2.5×.
   - Sides: `c = 8·scale`, `a = c sin θ`, `b = c cos θ`; ratios from those.
   - Scale badge: "size changed, ratios constant".
2. Special right triangles.
   - 45-45-90: x, x, x√2.
   - 30-60-90: x, x√3, 2x.
   - Exact radical + decimal.
3. Reciprocal ratios.
   - sin↔csc, cos↔sec, tan↔cot cards.
   - Undefined warnings at 0°/90°.
4. Practice.
   - Ratio, missing side, story problems; steps, streak, badges.

**Key pitfall:** compute ratios from displayed rounded lengths, not
`Math.sin`, so the visible division is internally consistent.

**Palette:** cyan hypotenuse, coral opposite, emerald adjacent, yellow angle.

## Unit 2 — Trigonometric Functions Studio

**Modules (3):**

1. Unit circle & radians.
   - Draggable point, 0°–360°, exact π fraction, 4-dp coordinates,
     reference angle, exact values at 30°/45° multiples, quadrant sign tracker.
2. Sinusoidal wave generator.
   - Unit circle + graph linked; `y = A sin(B(x−C)) + D`.
   - Sliders A 0.5–3, B 0.25–3, C ±π, D ±2.
   - Animated trace, play/pause/restart, period/amplitude/phase/midline.
3. Exact-value quiz.
   - Exact values and degree↔radian multiple choice; 4-step explanation on a
     mini unit circle; streak/mastery.
   - Badges: first, streak 3/5, exact 5, radian 5, master 15.
   - Tolerance: ratios 0.001, lengths 0.02.

**Key pitfalls:** normalise negative `atan2` angles before clamping; keep wave
parentheses `B(x−C)`.

**Palette:** cyan cosine, coral sine, violet tangent, yellow angle.

## Unit 3 — Non-Right Triangles Studio

**Modules (3):**

1. Law of Sines & ambiguous SSA.
   - Given a, b, A; `sin B = b sin A / a`.
   - 0/1/2 triangles from candidate B values with `C = 180−A−B > 0`.
   - Solid cyan + dotted coral overlays; circle of radius a is violet.
2. Law of Cosines.
   - SAS: `c² = a²+b²−2ab cos C`, then angles.
   - SSS: triangle inequality, then `cos C = (a²+b²−c²)/(2ab)`.
   - Live substitution drawer, area.
3. Surveying practice.
   - Sines, cosines, four curated templates (lake, landmarks, ship, drone).
   - Animated map highlights per step; streak/mastery.

**Key pitfalls:** ensure `C > 0` for both candidates; fix area-model/projection
signs; keep map labels inside the canvas.

**Palette:** coral a, emerald b, cyan c, yellow angles, violet construction
circle.

## Unit 4 — Equations & Identities Studio

**Modules (3):**

1. Inverse functions & restricted domains.
   - sin `[−π/2,π/2]`, cos `[0,π]`, tan `(−π/2,π/2)`.
   - Domain endpoints stored as multiples of π/12.
   - Three states: invalid domain, input outside range, angle outside branch.
2. Identity lab.
   - Seven expressions, one correct substitution per step.
   - Area-model squares for sin/cos, tan/sec, cot/csc.
3. Equation solver.
   - 8 basic, 6 quadratic templates.
   - Answer sets over [0,2π); π/decimals/degrees accepted.
   - Identity proofs as multiple choice.
   - Animated unit-circle intersections.

**Key pitfalls:** area-model fit sign, label collisions, identity options
re-render, instruction language freeze, disabled form vs `answered`.

**Palette:** coral sine, cyan cosine, violet tangent, emerald 1/inverse, yellow
angles.

## Designing a new unit

1. List 3 modules that move from visual discovery → manipulation → retrieval.
2. For each, write the exact mathematical object and its edge cases before UI.
3. Choose one palette where each colour has a stable meaning.
4. Define the practice templates and exact answers.
5. Define completion criteria and 5–7 badges.
6. Reuse the shared HUD/state/i18n/canvas/release machinery.
7. Add at least one module-specific browser check and three manual rows.

## Exact values worth having

| Angle | sin | cos | tan |
| ----- | --- | --- | --- |
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undefined |
| 120° | √3/2 | −1/2 | −√3 |
| 135° | √2/2 | −√2/2 | −1 |
| 150° | 1/2 | −√3/2 | −√3/3 |
| 180° | 0 | −1 | 0 |
| 210° | −1/2 | −√3/2 | √3/3 |
| 225° | −√2/2 | −√2/2 | 1 |
| 240° | −√3/2 | −1/2 | √3 |
| 270° | −1 | 0 | undefined |
| 300° | −√3/2 | 1/2 | −√3 |
| 315° | −√2/2 | √2/2 | −1 |
| 330° | −1/2 | √3/2 | −√3/3 |
