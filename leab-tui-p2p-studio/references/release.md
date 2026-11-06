# Release

## Bump together

- `APP.version` in `script.js`
- README release badge
- `CHANGELOG.md` heading
- `CITATION.cff` version and date
- `state.json` `projectVersion` / `version`
- Any doc that states the self-test count or save version
- `scripts/check.mjs` thresholds

The static check is designed to fail on this drift. Do not silence it; update the file.

## Docs set

At minimum, a P2P release adds:

| File | What it must answer |
| --- | --- |
| `docs/MULTIPLAYER.md` | How to host/join, seat model, bots, disconnect, privacy limits, NAT, troubleshooting |
| `docs/PROTOCOL.md` | Envelope table, redaction table, authority invariants, hydration |
| `docs/ARCHITECTURE.md` | How the network layer fits the existing engine and scene |
| `docs/TESTING.md` | The three layers, the two-browser harness and manual checklist |
| `docs/DEPLOYMENT.md` | Broker, CSP, no server, no TURN, host tab lifetime |
| `docs/DATA_FORMAT.md` | `network: true`, `hiddenTags` stripped, guest export is partial |
| `SECURITY.md` | Host trust, redaction scope, guest action re-validation |
| `PRIVACY.md` | Broker/STUN metadata, handles, no game server |
| `docs/ROADMAP.md` | Host migration, TURN, turn timer as future work |
| `docs/FAQ.md` | "Is there online multiplayer?", "Why four seats?" |
| `AGENTS.md` | Commands, architecture, decisions, known issues, continuity |
| `STATE.md` + `state.json` | Duration, tokens, OpenCode, model |

## Screenshots

- Launch overlay at 1440×900 (`?lobby=1`).
- Host panel with a live code and bot previews.
- Guest table after a start (`GUEST_SHOT` in `net-check.mjs`).
- Mobile lobby at 390×844.
- Re-check the existing hero/Thai/rules/mobile if the scene or dock changed.

Wait 800–900 ms for modal entry animations; a screenshot taken too early shows a transparent card.

## Publish

1. `node scripts/check.mjs`
2. `node scripts/verify.mjs`
3. `node scripts/net-check.mjs` (real network)
4. Regenerate screenshots if the UI changed.
5. Update `STATE.md`/`state.json` with the measured session duration and token counts.
6. Commit and push `main`; Pages serves the repository root.
7. Verify the live page over HTTPS in two networks.
8. Mirror the skill to the public skills repository and rebuild its `index.json`.

### Keychain-safe publishing

- Use the existing `osxkeychain` helper; one push per repository, not a loop of credential probes.
- If a token is needed for the API, retrieve it once in memory and never write or print it.
- Do not run `gh auth login` repeatedly.
- Confirm Pages and the live URL without re-authenticating for every check.

## Release record

`state.json` should make the build auditable:

```json
{
  "projectVersion": "1.4.0",
  "build": { "startedAt": "...", "packagedAt": "...", "durationSeconds": 0, "note": "..." },
  "tokens": { "input": 0, "output": 0, "reasoning": 0, "cacheRead": 0, "total": 0 },
  "sessionId": "ses_...",
  "model": { "name": "DeepSeek V4.1 Flash", "providerID": "opencode-go", "modelID": "deepseek-v4.1-flash" },
  "harness": { "name": "OpenCode", "version": "2.2.5" },
  "verification": { "selfTest": "35/35", "multiplayer": "12/12" }
}
```

Report cache reads separately from the headline total; they are context reuse, not generated work.
Credit OpenCode and the model in the README, About modal and footer, not only in a hidden JSON file.
