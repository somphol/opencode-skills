# Contributing

Thanks for taking an interest in the studio. This is a small, dependency-free teaching project: the best contributions are focused, tested, and easy to review.

## Ground rules

1. **Stay static and offline.** No frameworks, CDNs, web fonts, analytics, remote images or runtime network calls. The app must keep working from `file://`.
2. **Keep the semantic colours.** Coral = sine, cyan = cosine, violet = tangent, emerald = the value 1 / inverse, yellow = angles. The inverse graph, area model and badges depend on this.
3. **Respect the principal domains.** sin `[−π/2, π/2]`, cos `[0, π]`, tan `(−π/2, π/2)`. A selected domain is valid only when it is contained in the principal branch; an input is valid only when it is in the original function's range.
4. **Store domain endpoints as multiples of π/12.** `minK` and `maxK` are integers; exact display comes from `piFrac`. Do not store pixels or rounded decimals.
5. **Identity steps are data.** Each expression lists prompts, bilingual explanations, exactly one correct choice per step, and the resulting expression. Add data, not one-off UI branches.
6. **Equation answers are sets.** The parser accepts `π/6`, `5π/6`, `0.5236` and degrees; comparison normalises modulo 2π and ignores order. Never switch to string equality.
7. **Clear step timers.** `resetStepAnimation()` must clear every timeout and hide revealed solutions before a new problem.
8. **Translate both languages.** Every user-facing string needs an English and a Thai entry. `scripts/check.mjs` fails when the dictionaries diverge.
9. **Accessibility is part of the feature.** Labelled inputs, keyboard access, visible focus and reduced-motion support are required.
10. **Small, legible diffs.** Touch the files the change needs and keep unrelated formatting out.

## Local setup

There is nothing to install.

```bash
git clone https://github.com/somphol/khan-trig-unit4-equations-identities-studio.git
cd khan-trig-unit4-equations-identities-studio
python3 -m http.server 8080
```

Open <http://localhost:8080>. Node 20+ is only needed for the static checks.

## Before opening a pull request

```bash
node --check script.js
node scripts/check.mjs
```

Then run the manual checks in [docs/TESTING.md](docs/TESTING.md) that match your change — at minimum desktop, 390 px mobile, and both languages.

## Commit messages

Use an imperative subject under ~72 characters, optionally scoped:

```
fix(inverse): reject domains that cross the principal branch
feat(identity): add a new Pythagorean simplification
fix(solver): accept 2π as an equivalent of 0
```

Explain the learner-facing reason in the body when it is not obvious.

## Pull requests

Use the template. A good PR states the learner problem, the change, the modules touched, and the verification performed. Screenshots are expected for visual changes.

## Adding an identity or problem type

- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the expression, step and answer-set shapes.
- Add bilingual prompts and explanations, not just English.
- Extend the manual test matrix in [docs/TESTING.md](docs/TESTING.md).
- Keep the area model labels consistent with the triangle sides.

## Translation notes

The Thai glossary lives in [docs/DESIGN.md](docs/DESIGN.md). Keep ฟังก์ชันตรีโกณมิติผกผัน, เอกลักษณ์พิทาโกรัส and คำตอบทั่วไป consistent and prefer clear classroom language over literal translation.

## Reporting bugs and security issues

- Bugs and ideas: use the issue templates.
- Security: follow [SECURITY.md](SECURITY.md); never open a public issue with exploit details.
- Conduct concerns: follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
