# Release and handoff

## Versioning

Bump together:

- app version
- save/wire format version
- README badge
- CHANGELOG heading
- CITATION
- `state.json`
- any doc that states the test count

The static guard should fail on drift.

## Docs set

| File | Must answer |
| --- | --- |
| `README.md` | what it is, live link, features, run/verify, limits, credits |
| `AGENTS.md` | commands, architecture, decisions, known issues, continuity |
| `SECURITY.md` | threat model, access gates, passcode policy, caps, non-goals |
| `PRIVACY.md` | what is stored, what is sent, broker/media metadata, clearing |
| `docs/PROTOCOL.md` | envelopes, revisions, intents, projection, errors, version |
| `docs/MULTIPLAYER.md` | host/join/approve, passcode, auto modes, disconnect, troubleshooting |
| `docs/TESTING.md` | pure/static/two-client/media tests and manual checklist |
| `docs/DEPLOYMENT.md` | static host, CSP, broker, TURN, no server |
| `docs/DATA_FORMAT.md` | save/export fields, version, rejected data |
| `STATE.md` + `state.json` | duration, tokens, harness, model, session |
| `CHANGELOG.md` | added/changed/fixed/limits |

Add FAQ, controls, accessibility, browser support, performance, roadmap, checklist and gallery if the
project already has them.

## Screenshots

- mode overlay / solo / host / join
- host lobby with code + approval + passcode
- guest view
- chat/voice
- phone layout
- security panel with a generated passcode (redact if needed)

Wait 800–900 ms for modal entry animations.

## State record

```json
{
  "projectVersion": "x.y.z",
  "build": { "startedAt": "...", "packagedAt": "...", "durationSeconds": 0, "durationHuman": "..." },
  "tokens": { "input": 0, "output": 0, "reasoning": 0, "cacheRead": 0, "total": 0 },
  "sessionId": "ses_...",
  "model": { "name": "...", "providerID": "...", "modelID": "..." },
  "harness": { "name": "OpenCode", "version": "..." },
  "verification": { "selfTest": "N/N", "staticCheck": "...", "multiplayer": "N/N" }
}
```

Report cache reads separately. Credit the harness and model in the README, About/credits UI and footer,
not only in JSON.

## Force reload and cache busting

A normal reload can keep old ES modules. Make the version visible and the reload real:

- Show `vX.Y.Z` in the footer and the lobby/mode overlay.
- Add `?v=X.Y.Z` to the CSS and entry script, **and to every static ES module import** (`./transport.js?v=X.Y.Z`, etc.).
- Bump all five strings with the app version; a static check should fail on drift.
- **Reload** navigates with `?v=<timestamp>`, preserves room/mode params, removes any passcode param, and confirms if a room/match is active.
- Poll `state.json` (or a small `/version.json`) with `cache: "no-store"`; if a newer version exists, show an update banner with Reload.
- Query-string busting on the page alone is not enough; the module graph is cached by URL.
- Do not put the passcode in the URL; remove it before reload.

## Diagnostics

Ship a **Troubleshoot** panel:

- Version, URL, secure context, transport loaded, role, room code, peer IDs, connections, pending count, last error/stage.
- Guest probe with PIN and without PIN; host returns reachability, PIN required/accepted, approval, started and free seats **without creating a pending seat request**.
- Copy report to clipboard.
- Distinguish broker timeout, host timeout, ICE failure, wrong PIN and denied approval.
- Host warning: keep the tab open/awake; optional wake lock.

## Publish

1. local server + full verification
2. two-client test on a real network
3. screenshots
4. state record
5. commit, push main
6. verify Pages/HTTPS
7. publish the skill mirror and catalog

If using GitHub from macOS, reuse the existing `osxkeychain` helper; avoid repeated credential prompts.
Never print or commit a token.

## Handoff

`AGENTS.md` is the first file another agent reads. It must contain:

1. **What it is** — one paragraph, what it is not.
2. **Commands** — run, test, build, deploy, exact flags/ports.
3. **Architecture** — the handful of files that control behaviour, boot order.
4. **Decisions and constraints** — authority, transport, privacy, passcode, no-build constraints.
5. **Known issues** — what is unverified, environment-limited, or intentionally unsupported.
6. **Continuity** — deployed URL, local path, state record, skill mirror.

Do not duplicate the README. Link it. Do not record secrets.

## Skill mirror

If turning the work into a skill:

- keep `SKILL.md` focused on the workflow, not the specific app;
- put deep details in `references/`;
- include templates that can be copied;
- update `skills.json` / `index.json` in the mirror;
- publish and verify the catalog URL;
- keep attribution and licence notices.
