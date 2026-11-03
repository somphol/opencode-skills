# Design notes

## Curriculum alignment

The studio follows Khan Academy Trigonometry **Unit 4: Trigonometric Equations &
Identities**. It is a companion for visual proof, algebraic transformation and
retrieval — not a replacement for instruction or a graded course.

| Module | Concept | Learning objective |
| ------ | ------- | ------------------ |
| 01 | Inverse functions | Explain and see why principal domains are required |
| 02 | Pythagorean identities | Choose legal substitutions and simplify expressions |
| 03 | Equations and proofs | Produce every solution in an interval and verify identities |

## Dual-coding system

Every function and quantity keeps one colour across canvas, formulas, badges and
choice feedback.

| Element | Colour | Hex |
| ------- | ------ | --- |
| Sine | Vivid coral | `#FF5722` |
| Cosine | Neon cyan | `#00E5FF` |
| Tangent | Electric violet | `#B388FF` |
| The value 1 / inverse | Electric emerald | `#00E676` |
| Angles | Golden yellow | `#FFD600` |

Colour is never the only cue: every curve is labelled `sin θ` / `arcsin x`, every
side has a letter or squared caption, and every status badge has words.

## Inverse-function design

- **Show the failure first.** The full periodic curve is visible in cyan; the
  principal branch is a gold band. If the selected domain leaves that band, the
  inverse is not drawn and the badge says "not one-to-one".
- **Separate the two failure modes.** An input outside the function's range
  (`arcsin(1.5)`) is different from an input whose angle lies outside the chosen
  branch. The UI uses distinct badges and notes.
- **Keep exact values.** `π/6`, `π/3` and `π/4` are shown whenever the output is
  a clean multiple of `π/12`; otherwise four decimals.
- **Mirror, don't teleport.** The inverse curve is sampled as `x = f(t)` so the
  reflection relationship is visible rather than asserted.

## Identity-lab design

- **One legal step at a time.** Each step offers exactly one substitution that
  follows from an identity; the others are common errors (sign errors, wrong
  identity, cancelling unlike terms).
- **Immediate feedback.** A correct choice advances and names the resulting
  expression; a wrong choice is rejected in red without changing state.
- **Area model as proof.** Squares on the sides of a right triangle show
  `sin²θ + cos²θ = 1`, `1 + tan²θ = sec²θ` and `1 + cot²θ = csc²θ`.
- **Only square captions.** Side chips were removed because they collided with
  the square labels inside the small triangle; the squared captions carry all
  the needed information.
- **Progress is resumable.** Expression and step are persisted, so a reload
  continues where the learner stopped.

## Equation-solver design

- **All solutions, not one.** The checker compares sets over `[0, 2π)` and
  accepts exact or decimal forms.
- **Retrieval first.** The step solution is opt-in; the circle does not reveal
  intersections until the learner asks or answers correctly.
- **Quadratic forms are factored.** The step drawer names the factored form, the
  zero-product property, each case, and the combined solution set.
- **Identity proofs are recognition.** The learner chooses the equivalent final
  expression, then sees the substitution chain on the area model.
- **Mastery is bounded.** Fifteen correct answers completes the bar.

## Thai terminology

| English | Thai | Note |
| ------- | ---- | ---- |
| Inverse trigonometric functions | ฟังก์ชันตรีโกณมิติผกผัน | |
| Pythagorean identities | เอกลักษณ์พิทาโกรัส | |
| General solutions | คำตอบทั่วไป | Used in equation discussions |
| Domain | โดเมน | |
| Range | เรนจ์ | |
| Principal branch | สาขาหลัก | |
| One-to-one | หนึ่งต่อหนึ่ง | |
| Reference angle | มุมอ้างอิง | |
| Factor | แยกตัวประกอบ | |
| Identity | เอกลักษณ์ | |
| Solution | คำตอบ | |

Keep this glossary stable. Consistency matters more than literary elegance in a
classroom.

## Accessibility and universal design

- Multiple representations: visual, symbolic, numeric and verbal.
- Keyboard path for every control; tabs follow the WAI-ARIA tab pattern.
- Feedback announced through `role="status"` / `aria-live="polite"`.
- Motion reduced when the operating system asks for it.
- Touch targets sized for phones; the layout reflows to one column.
- See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the statement and gaps.

## Non-goals

- Accounts, cloud sync, leaderboards or teacher dashboards.
- Adaptive difficulty or machine-learned problem selection.
- A free-form symbolic proof editor (the lab is choice-based by design).
- Replacing a textbook, teacher or formal assessment.
