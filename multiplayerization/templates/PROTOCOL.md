# Multiplayer protocol

Envelope: `{ "__mp": 1, "type": "...", "rev": 0, "payload": {} }`.

## Messages

### host → guest

| Type | Fields | When |
| --- | --- | --- |
| `welcome` | `selfId, role, roster, config` | after approval |
| `pending` | `roomCode` | request queued |
| `lobby` | `roster, canStart` | roster/role change |
| `start` | `phase, config` | session starts |
| `state` | `rev, state` | authoritative snapshot, projected |
| `reject` | `reason` | full / denied / bad-passcode / busy / timeout / in-progress |
| `closed` | `reason` | host intentionally ends |
| `chat` | `entry` | text relay |
| `pong` | `at` | latency probe |

### guest → host

| Type | Fields | When |
| --- | --- | --- |
| `hello` | `name, passcode, protocol` | channel opens |
| `action` | `action, clientActionId, payload` | intent |
| `chat` | `text` | text |
| `voice-state` | `active` | media presence |
| `ping` | — | optional |
| `leave` | — | graceful close |

## Rules

1. Host is the only writer of authoritative state.
2. Guests send intent; the host re-validates and increments `rev`.
3. Clients drop `rev <= current`; reconnect gets a full snapshot.
4. `projectFor(state, participant)` is the only privacy boundary; one payload per recipient.
5. Placeholder ids are stable for the session.
6. `hello` never seats a guest; approval does.
7. Passcode is hashed; never in URL/state/export.
8. Reject/deny/expiry closes the connection.
9. Voice is a separate media path; allowlist approved roster ids.
10. Cap envelope size, message rate, arrays and text.

## Error reasons

`full`, `denied`, `bad-passcode`, `busy`, `timeout`, `in-progress`, `illegal`, `version`.

## Versioning

`__mp` is the protocol version. Add fields freely; bump for removals. Keep app/save/protocol versions
separate.
