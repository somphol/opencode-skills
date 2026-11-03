# Professional release documentation set

A finished 3D guide needs docs that let a stranger run, trust, maintain and cite it. The Bangkok
reference demonstrates the set; replicate the substance, not necessarily every word.

## Root files

| File | Must contain |
| --- | --- |
| `README.md` | one-paragraph purpose, live/source links, five landmarks, three modes, controls, run/verify commands, data notes, docs index, credits/licence |
| `AGENTS.md` | first-read handoff for a new agent: current version, commands, repo map, invariants, controls that must not regress, deployment, known issues, continuity |
| `CHANGELOG.md` | Keep a Changelog + SemVer; one section per release with Added/Changed/Fixed/Removed |
| `CONTRIBUTING.md` | run/test, style, city/landmark addition procedure, compatibility checklist, PR expectations |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1, enforcement, contact |
| `SECURITY.md` | supported versions, private reporting, scope/non-scope, static-app threat model, dependency policy |
| `PRIVACY.md` | no analytics/cookies, localStorage, export file, CDN requests, deletion, children, changes |
| `SUPPORT.md` | troubleshooting table, self-test, bug-report fields, support boundaries |
| `LICENSE` | MIT (or the chosen terms); keep third-party licences separate |
| `THIRD_PARTY_NOTICES.md` | Three.js/OrbitControls MIT, fonts OFL, no redistributed imagery/brand marks |
| `AUTHORS.md` | maintainer, harness/model credits, original-work statement |
| `CITATION.cff` | CFF 1.2 metadata: title, abstract, author, repo, URL, license, version, keywords |
| `state.json` | machine-readable build/session record: timestamps, duration, tokens, model, harness, verification, files, release |
| `STATE.md` | human-readable version of the same; revisions/amendments |
| `.editorconfig`, `.gitattributes`, `.gitignore`, `.nojekyll` | line endings, binaries, cache, Pages |

## `docs/`

| File | Must contain |
| --- | --- |
| `docs/README.md` | documentation map and root-policy links |
| `docs/HANDOFF.md` | full reproduction/continuation record: snapshot, read order, repo map, reproduction paths, invariants, contracts, deployment, known issues, session history |
| `docs/REQUIREMENTS.md` | original brief, user amendments, acceptance criteria, non-goals, definition of done |
| `docs/CODE_MAP.md` | functions/constants, landmark coordinates, tour curve, DOM/state/API contracts, CSS map |
| `docs/ARCHITECTURE.md` | runtime topology, construction order, camera state machines, render/material/audio/state design |
| `docs/CONTROLS.md` | every input, zoom ranges, touch, URL parameters |
| `docs/DATA_FORMAT.md` | localStorage schema, export example, import rules, privacy |
| `docs/TESTING.md` | static checks, self-test list, browser matrix, headless caveats, screenshots |
| `docs/DEPLOYMENT.md` | Pages setup, cache-busting, release/tag, rollback, custom domain |
| `docs/RELEASE_CHECKLIST.md` | exact gate before tagging |
| `docs/ACCESSIBILITY.md` | implemented features, gaps, next steps |
| `docs/PERFORMANCE.md` | scene budget, instancing, shadow/DPR costs, measurement |
| `docs/BROWSER_SUPPORT.md` | supported browsers, WebGL/audio/input requirements |
| `docs/DESIGN.md` | palette, type, layout, 3D language, motion, sound, copy voice |
| `docs/GALLERY.md` | captioned screenshots; paths must resolve |
| `docs/GLOSSARY.md` | local-language terms and pronunciation/etiquette notes |
| `docs/FAQ.md` | geography, prices, audio, data, reuse, browser questions |
| `docs/ROADMAP.md` | shipped/next/later and explicit non-goals |

## GitHub release infrastructure

```text
.github/ISSUE_TEMPLATE/bug_report.yml
.github/ISSUE_TEMPLATE/feature_request.yml
.github/ISSUE_TEMPLATE/config.yml
.github/PULL_REQUEST_TEMPLATE.md
.github/CODEOWNERS
.github/workflows/static-check.yml
scripts/verify-static.mjs
```

- Bug form asks for mode/language/browser/viewport/self-test/console, and warns against private data.
- Feature form asks for the user problem and fits the no-build/static constraints.
- PR template lists syntax/static/self-test/browser/mobile and data/bilingual constraints.
- CI runs `node --check` and the static check, no dependencies.

## Quality rules

- Every doc link resolves; every screenshot path exists.
- The docs index points to the handoff and requirements, not only user docs.
- Version numbers agree across APP, asset query strings, README badge, changelog, tag, state and AGENTS.
- `AGENTS.md` is readable in a minute and points to deeper docs.
- Do not paste a transcript; distil decisions, defects, commands and provenance.
- Document known gaps honestly; “not verified” is acceptable, invented certainty is not.
- No tokens, credentials, private notes or machine-specific secrets in the repo.

## Minimum release gate

```sh
node --check script.js
node scripts/verify-static.mjs   # or the skill's check.mjs
curl -I https://<user>.github.io/<repo>/
```

Then verify the live `?selftest=1`, all modes, walk pad/keys, language switch, export/import and mobile.
