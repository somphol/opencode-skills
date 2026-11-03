# Release docs

The reference project has a documentation set that a new maintainer or agent can use
without the session that produced it. Copy the structure, not the CubeLab-specific claims.

## Order

1. `AGENTS.md` — the short handoff. Write this first.
2. `README.md` — product overview, quick start, controls, architecture summary.
3. `docs/ARCHITECTURE.md` — runtime map and source responsibilities.
4. `docs/TESTING.md` — self-test, debug API, manual matrix, build check.
5. `docs/RELEASE.md` — versioning, checklist, deploy, rollback.
6. `docs/DESIGN.md` — visual language, motion, interaction rationale.
7. `docs/ACCESSIBILITY.md` — keyboard, focus, live regions, reduced motion, known gaps.
8. `docs/BROWSER_SUPPORT.md` — required/optional APIs, fallbacks, limitations.
9. `docs/PERFORMANCE.md` — budget, profiling, optimization checklist.
10. `docs/FAQ.md` — common questions.
11. `docs/ROADMAP.md` — near-term, later, out of scope.
12. `docs/REPRODUCTION.md` — complete rebuild blueprint.
13. `docs/DECISIONS.md` — architecture decision records.
14. `docs/README.md` — index linking all of the above.
15. `SUPPORT.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
    `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, `LICENSE`.

## AGENTS.md outline

Keep it readable in a minute. Cover, in this order:

1. **What it is** — one paragraph: purpose, what it produces, what it is not.
2. **Commands** — install, run, build, verify, deploy. Exact invocations and flags.
3. **Architecture** — the handful of files that control behaviour and the construction
   order. Not a file dump.
4. **Decisions and constraints** — why it is shaped this way, and what must not change.
5. **Known issues** — unfinished, unverified, environment-limited, stated plainly.
6. **Continuity** — deployed URL, repository, Pages branch, doc links. Do not put local
   filesystem paths or personal data in a public repo.

Link to the README and the docs index; do not duplicate them.

## Reproduction blueprint outline

- What the project is and is not.
- Reproduction checklist from an empty directory.
- File tree.
- Dependencies and pinned versions.
- HTML/UI regions and exact copy.
- Design tokens, layout breakpoints, geometry, materials, camera, lighting, motion.
- State shape, move/action definitions, mapping tables.
- Algorithms: sequence generation, solver, sync, camera, glow, gate.
- Persistence schema.
- Browser/accessibility requirements.
- Build pipeline.
- Acceptance criteria and test coverage.
- Known limitations.
- Baseline snapshot with a clear "check git log" note.

Include exact values. "Use a nice glow" is not reproducible; "emissive = base × (0.02 +
glow × 0.34)" is.

## Decision log format

One entry per choice that is easy to undo accidentally:

```markdown
## ADR-00N — Title

**Date:** YYYY-MM-DD

**Context:** the problem and constraints.

**Decision:** what was chosen.

**Consequences:** what becomes easier, harder, or forbidden.
```

Record the choices that future agents will question: build shape, solver/worker strategy,
sync contract, interaction model, camera behaviour, Step gate, persistence, docs/CI,
privacy.

## Build check

Add a workflow that rebuilds the artifact and fails if it differs:

```yaml
name: build
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.x"
      - run: python3 build.py
      - run: git diff --exit-code -- index.html
```

Do not add a browser self-test to CI unless the runner has a WebGL-capable browser. State
that the browser self-test is manual.

## README docs table

Link the docs index, AGENTS.md, SUPPORT.md, and the main docs. Keep the table short; the
docs index holds the long list.

## Issue and PR templates

- Bug report: description, steps, expected, actual, browser/OS, console output, cube state.
- Feature request: problem, proposed solution, scope fit, alternatives.
- Question: goal, tried, browser/OS, context.
- PR template: summary, related issue, type, build/self-test checks, manual checks,
  screenshots, reviewer notes.

Link SECURITY.md from the bug template and the issue chooser. Link the FAQ and SUPPORT from
the chooser.

## Privacy and accuracy

- No personal email, local paths, tokens, or private keys in public docs.
- No claims for features that do not exist.
- No "optimal" claims for a non-optimal solver.
- No screen-reader parity claims without a text alternative for the visual state.
