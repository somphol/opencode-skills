# Session log and build state

This is the human-readable counterpart to `state.json`. It exists because chat
history is not part of the repository; another agent should be able to continue
from here without the original session.

## Session

| Field | Value |
| ----- | ----- |
| OpenCode session | `ses_e60a2ea01ffewQMjVLNWKAti2n` |
| Tool | OpenCode |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Unit 4 build start | 2026-11-03T04:36:38Z |
| State captured | 2026-11-03T04:49:04Z |
| Elapsed | 12m 26s (746 s) |
| Cost | $0 on the flat-rate plan |

## Token accounting

Token counters in the shared OpenCode session are cumulative across Units 1–4.
The Unit 4 numbers are a **delta** from the start snapshot.

| Counter | Start | End | Delta |
| ------- | ----- | --- | ----- |
| input | 553,528 | 662,651 | 109,123 |
| output | 225,952 | 281,744 | 55,792 |
| reasoning | 136,919 | 176,515 | 39,596 |
| cache read | 38,698,880 | 53,931,392 | 15,232,512 |
| cache write | 1,854 | 1,854 | 0 |
| **total** | | | **15,437,023** |

`totalTokens` is the sum of all five counters, including cache reads. The SQL
used to capture the counters:

```sql
select tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write
from session_v2
where id = 'ses_e60a2ea01ffewQMjVLNWKAti2n';
```

The database is `~/.local/share/opencode/opencode.db`. Counters continue to grow
after capture; `state.json` is a snapshot, not a live figure. Do not rewrite it
to look newer.

## Build sequence

1. Read the Unit 4 brief, record the start time and token snapshot.
2. Scaffold `index.html`, `style.css` and `script.js`.
3. Implement the inverse-function engine with principal domains, validity
   states and the dual graph.
4. Implement the identity lab data, step choices, progress dots and area model.
5. Implement the equation templates, answer-set parser, scoring and step reveal.
6. Verify in headless Chrome: inverse cases, identity steps, all three practice
   modes, language switch, reload, export, mobile.
7. Fix the issues below and retest.
8. Add README, AGENTS, CHANGELOG, LICENSE, `.nojekyll` and `state.json`.
9. Commit, create the GitHub repository, push, enable Pages, verify the live URL.
10. Tag `v1.0.0`, create the release, set homepage/topics.
11. Add the professional release surface (v1.0.1): policy docs, architecture,
    testing, deployment, accessibility, release guide, templates, CI and static
    checker.
12. Add this reproducibility set (v1.0.2): `docs/REPRODUCTION.md`,
    `docs/CONTENT.md`, `docs/SESSION_LOG.md` and
    `scripts/browser-check.mjs`.

## Defects found and fixed during the build

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Area model drew off-canvas | Projection used `oy = … − maxY*scale` | Changed to `+ maxY*scale` |
| Area-model labels overlapped | Side chips sat inside the squares | Removed side chips; keep square captions |
| Identity options stayed enabled after grading | `renderOptions()` ran before `answered` was set | Call it after `handleResult()` |
| Thai/English instructions mixed | Rounding/instruction text frozen with `t()` at generation | Render instructions from keys at display time |
| English identity steps could show Thai | `genIdentityProblem` used `state.lang` for the `en` string | Always use `step.explainEn` |
| Basic rule step language leak | `genBasicProblem` used `state.lang` for the `en` string | Always use `ruleEn` |
| Wrong answers could not be retried but form was enabled | `answered` stayed true while inputs were re-enabled | Keep the form disabled after grading; new problem resets |
| `cosθ = −1` used a 180° reference angle | Template data error | Reference angle is 0° |
| Drag/domain states hard to read | Only one badge | Separate domain, range and branch badges |

## Verification performed

- `node --check script.js`
- Static headless Chrome suite (ad hoc during build): all modules, all cases,
  language switch, reload, export, mobile; 0 console errors.
- The committed `scripts/browser-check.mjs` reproduces 15 acceptance checks.
- Live URL checked with HTTP 200 after each Pages deploy.

## Publishing record

| Item | Value |
| ---- | ----- |
| Repository | https://github.com/somphol/khan-trig-unit4-equations-identities-studio |
| Live demo | https://somphol.github.io/khan-trig-unit4-equations-identities-studio/ |
| Initial release | `v1.0.0` |
| Documentation release | `v1.0.1` |
| Reproducibility release | `v1.0.2` |
| Pages source | `main` / root, `.nojekyll` |
| CI | `.github/workflows/ci.yml`, static checks only |

GitHub authentication reused the existing git credential helper / OS credential
store. No new Keychain prompt was required during the build.

## Continuity notes

- `state.json` describes the original 1.0.0 build; it is not updated by docs or
  later releases.
- The repository root is the deployable artifact; there is no dist directory.
- If the docs set changes, bump the patch version, update README/AGENTS/
  CITATION/CHANGELOG and tag again.
- If the app changes, run both static and browser checks, then update
  `docs/TESTING.md` with any new rows.
- Never commit credentials, tokens, private transcripts or personal data.
