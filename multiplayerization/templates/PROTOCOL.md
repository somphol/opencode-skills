# Multiplayer protocol

Envelope: `{ "__mp": 1, "type": "...", "rev": 0, "payload": {} }`.

## Messages

### host → guest

| Type | Fields | When |
| --- | --- | --- |
| `welcome` | `selfId, role, seat, roster, config, rev, rejoinToken, state?` | after approval or rejoin |
| `pending` | `roomCode` | request queued |
| `lobby` | `roster, viewers, canStart` | roster/role change |
| `start` | `phase, config, rev, viewers` | session starts |
| `state` | `rev, state, resync?` | authoritative snapshot, projected |
| `pulse` | `rev, viewers` | idle heartbeat; no full state |
| `action-ack` | `actionId, ok, reason?, rev` | intent accepted or rejected |
| `seat-timeout` | `reason` | host gave up on a silent turn |
| `reject` | `reason` | full / denied / bad-passcode / busy / timeout / in-progress |
| `closed` | `reason` | host intentionally ends |
| `chat` | `entry` | text relay |
| `pong` | `at, rev` | latency/liveness probe |

### guest → host

| Type | Fields | When |
| --- | --- | --- |
| `hello` | `name, passcode, protocol, rejoinToken?` | channel opens; token is checked first |
| `action` | `action, actionId, payload` | intent |
| `state-ack` | `rev` | guest confirms the snapshot it rendered |
| `resync` | `lastRev` | guest noticed it is behind |
| `pulse` | `lastRev` | periodic liveness (also proves the view) |
| `chat` | `text` | text |
| `voice-state` | `active` | media presence |
| `ping` | — | optional |
| `leave` | — | graceful close |

## Rules

1. Host is the only writer of authoritative state.
2. Guests send intent; the host re-validates and increments `rev`.
3. Clients drop `rev <= current`; a `resync` snapshot is always accepted.
4. An `action` carries `actionId`; the host applies it once and returns `action-ack`.
5. `projectFor(state, participant)` is the only privacy boundary; one payload per recipient.
6. Placeholder ids are stable for the session.
7. `hello` never seats a guest; approval does — unless `hello` presents a valid `rejoinToken`, which
   reclaims an existing seat before the passcode/approval gate.
8. Passcode is hashed; never in URL/state/export. `rejoinToken` is a per-seat bearer credential and
   never appears in roster, state, logs or export.
9. Reject/deny/expiry closes the connection.
10. Voice is a separate media path; allowlist approved roster ids.
11. Cap envelope size, message rate, arrays and text.

## Error reasons

`full`, `denied`, `bad-passcode`, `busy`, `timeout`, `in-progress`, `suppressed`, `illegal`,
`version`, `seat-timeout`.

## Versioning

`__mp` is the protocol version. Add fields freely; bump for removals. Keep app/save/protocol versions
separate.
