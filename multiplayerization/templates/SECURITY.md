# Security model

## Assets

- Private participant state.
- Host browser availability.
- Seat/role ownership.
- Passcode.
- Chat/voice privacy.
- Local save integrity.

## Assumptions

- Source, protocol and policy are public.
- The host is trusted to run the app; guests are untrusted.
- The broker/relay is not trusted with private state.
- A passcode is a gate, not authentication.
- Host approval is the access-control decision.

## Gates

```text
room code -> passcode digest -> host approval -> role/seat -> projected state
```

## Controls

| Control | Implementation |
| --- | --- |
| Approval | pending queue; approve/deny; 120 s expiry |
| Passcode | 15–64 chars, four classes, deny-list, SHA-256 digest |
| Passcode display | once in host panel; never URL/state/export/localStorage |
| Wrong attempts | 8 -> 60 s lockout; per-connection rate limit |
| Projection | `projectFor(state, participant)` per recipient |
| Intents | bound to connection identity; host re-validates |
| Caps | 16 connections, 6 pending, 80 msg/10 s, 16 KB, 200-char/350 ms chat, 6 items |
| Media | calls only from approved roster ids |
| Text | escape; no HTML; CSP |
| Clipboard | invite link excludes passcode; room-info warning |

## Non-goals

- No accounts, MFA, anti-cheat or moderation.
- No guarantee against a network DDoS.
- No host migration unless implemented with an epoch.
- No recording/transcription.
- No claim that the host cannot see all state.

## Checklist

- [ ] Approval default on.
- [ ] Passcode policy + generator + digest.
- [ ] No plaintext passcode outside the one-time host reveal.
- [ ] Per-recipient projection + stable placeholders.
- [ ] Caps/rate/payload/media allowlist.
- [ ] Escaped names/chat; CSP.
- [ ] Reject/deny/expiry close.
- [ ] Host/guest close behavior documented.
- [ ] Security limits in README and UI.
