# Patterns by app type

## Turn-based game

- Authority: host.
- Sync: full projected snapshot per revision.
- Private: each player's hand/answer; stable placeholders for others.
- Intent: `play` / `move`; host validates rules.
- Disconnect: keep seat, replace with bot/placeholder.
- Late join: reject `in-progress`; allow rematch.
- Chat/voice: optional, but cheap to add once the room exists.
- Do not add seats beyond the game's rule/board limit just because the SDK supports them.

## Whiteboard / canvas editor

- Authority: host or CRDT.
- Sync: operations (add/move/erase) for high frequency; periodic snapshots for recovery.
- Private: selection/cursor can be public; drafts/notes can be private.
- Conflicts: last-writer-wins with a visible lock, or CRDT.
- Undo: host-side per-author stack; do not let one participant undo another's edits without a policy.
- Size: cap strokes/elements; rasterize old layers if needed.

## Collaborative text / notes

- CRDT (Yjs/Automerge) is usually the right tool; a host-authoritative text replacement is painful.
- Awareness (cursor, selection, name) is ephemeral; do not persist it as document state.
- Access: host approval + role (viewer/editor).
- Snapshot + op log; version the document format.
- Avoid sending the entire document on every keystroke.

## Quiz / classroom

- Authority: host.
- Sync: question index, timer, answers.
- Private: each participant's answer; host sees aggregates.
- Late join: spectator or next question.
- Disconnect: keep score, mark offline.
- Chat: useful; voice usually optional.
- Approval: useful for classrooms; passcode optional.

## Dashboard / monitoring

- Authority: server or host.
- Sync: snapshots at a lower frequency; patches for counters.
- Private: row-level data; project per role.
- Presence: who is viewing, cursor not needed.
- Reliability matters more than latency; a WebSocket relay is often better than P2P.

## Watch party / media sync

- Authority: host.
- Sync: playhead + playing/paused + media id; do not stream the file if it is already hosted.
- Drift: allow ±300 ms; periodic correction.
- DRM/CORS: check before promising sync.
- Chat is the primary interaction; voice optional.
- Do not rebroadcast copyrighted media without rights.

## Chat/voice only room

- Authority: host or relay.
- Presence, message ordering and moderation matter more than state snapshots.
- Cap message length/rate; escape text.
- Voice mesh for small rooms; SFU for larger.
- Recording/transcription is a separate consent/product decision.

## Small shared form / poll

- Authority: host.
- Sync: question set + aggregate counts; individual answers private if promised.
- Late join: allow until close; then read-only.
- Persistence: host memory; export at end.
- Passcode/approval: optional.

## Choosing the first slice

For any app type, ship in this order:

1. read-only spectator of public state;
2. one host action broadcast;
3. one guest intent validated by host;
4. private projection;
5. approval/passcode;
6. reconnect/disconnect;
7. chat;
8. voice.

Each step is independently testable. Do not merge all eight into one PR unless the product is tiny.
