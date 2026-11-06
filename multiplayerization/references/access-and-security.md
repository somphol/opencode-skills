# Access and security

## Assume the source is public

The attacker knows the protocol, room-code format, passcode policy, message names and transport
library. Do not rely on hidden endpoints or obscure field names. Rely on:

1. **host approval** — the access-control decision;
2. **entropy** — room code + optional passcode;
3. **caps** — connection, pending, rate, payload, chat, action and media limits;
4. **allowlists** — only approved participants can call media or receive projections;
5. **escaping** — peer text is never HTML.

## Threat model

| Asset | Threat | Control |
| --- | --- | --- |
| Private participant state | Guest reads another participant's data | per-recipient projection; strip host-only maps |
| Host browser | Stranger floods or runs code | approval, caps, escaped text, no `eval`, no remote HTML |
| Seat/role | Guest acts as another participant | bind actions to connection identity; re-validate |
| Availability | Connection/message flood | connection cap, rate limit, payload cap, pending cap |
| Passcode | Online guessing | 15+ char policy, deny-list, hash, lockout, rate limit |
| Voice | Unknown peer calls host | media allowlist from approved roster |
| Chat | XSS/impersonation | escape, cap, sender profile, host relay |
| Clipboard | Passcode leaks via Copy room info | explicit action + warning; invite link excludes it |
| Local save | Malformed state | shape validation; reject unknown versions |

## Access gates

```text
room code -> passcode digest -> host approval -> welcome/seat -> state
```

- The **room code** is an identifier. It may be shared widely.
- The **passcode** is optional and raises guessing cost. It is not authentication.
- **Approval** is the real gate. Never seat on `hello`.
- A **spectator** is a role, not an implicit bypass. Give spectators only the public projection.

## Passcode policy

Minimum for shared rooms:

- 15–64 characters.
- Lower case + upper case + digit + symbol.
- No whitespace.
- Reject common passwords, repeated characters, sequences, the room code and the host name.
- Hash with SHA-256; store only the digest in memory.
- Show the plain value once for copying; never persist it.
- 8 wrong attempts -> 60 s lockout (plus per-connection rate limits).

For low-risk rooms, a shorter PIN may be acceptable; for public links, use 20+ generated characters.
The policy is public; it only changes the brute-force cost.

## Caps and limits

Pick numbers that fit the app; these are safe starting points:

| Control | Start |
| --- | --- |
| Live connections | 16 |
| Pending approvals | 6 |
| Messages per connection | 80 / 10 s |
| Inbound envelope | 16 KB |
| Chat | 200 chars, 350 ms per guest |
| Action payload | 6 items or a small fixed schema |
| Pending expiry | 120 s |
| Passcode failures | 8 -> 60 s lockout |
| Voice | mesh for <= 4–6 speakers |

Close rejected/oversized/rate-limited connections; do not park them.

## Input validation

- **Names:** trim, collapse whitespace, strip control chars and `<>`, cap 18–32 chars.
- **Ids/roles:** check against the roster; never trust a claimed participant id.
- **Arrays:** cap length before `map`/`filter`.
- **Numbers:** finite, range-checked.
- **Text:** escape at render time with `textContent`/`escapeHTML`.
- **Envelopes:** version, type, size, known shape.
- **Actions:** re-run the same validation as local input.

## XSS and UI

- No `innerHTML` with peer data.
- No `eval`, `new Function`, dynamic `<script>`, or remote HTML.
- URLs from peers (if any) must be scheme-checked; do not render arbitrary links.
- CSP: pin CDN scripts; no remote fonts/analytics just because multiplayer exists.
- Escape names in roster, chat, toasts, titles and aria labels.

## Clipboard

- **Copy invite link** — URL only.
- **Copy room info** — code + optional passcode + link; explicit button, warning.
- Do not copy secrets automatically on room creation.
- Clear the plain passcode after use if your threat model requires it.

## DoS reality

Caps make a single peer unable to freeze the host with a small message. They do **not** stop a network
flood against the host or the signalling broker. If availability matters, use a server with rate
limits, or accept the limitation and document it.

## What not to claim

- “Secure end-to-end” when the host sees all state.
- “Anti-cheat” when the host is trusted and clients are inspectable.
- “Authenticated” when only a room code/passcode exists.
- “DDoS-proof” because of client-side caps.
- “Private” when the host and clipboard can read the passcode.

## Security checklist

- [ ] Approval is on by default.
- [ ] Pending requests expire; rejects close.
- [ ] Passcode policy + generator + digest only.
- [ ] Passcode absent from URL, roster, state, export, localStorage.
- [ ] Invite link excludes passcode; room-info warning present.
- [ ] Per-recipient projection; placeholders stable.
- [ ] Connections, pending, rate, payload, chat, action and media caps.
- [ ] Voice calls allowed only from approved roster ids.
- [ ] Chat/name escaping; CSP.
- [ ] Host-loss/disconnect behavior documented.
- [ ] Security doc states what is not protected.
