# Attribution

## Skill

**Leab-Tui P2P Studio** is an original skill by Somphol Boonjing, derived from the Leab-Tui 3D 1.4.0
release (<https://github.com/somphol/leab-tui-3d>). The workflow, checklists, protocol guidance and
pitfall notes are original work, released under the same MIT terms as the project.

## Reference implementation

- Vanilla HTML5, CSS3, ES2022 JavaScript.
- Three.js r160, MIT, jsDelivr.
- PeerJS 1.5.4, MIT, jsDelivr; public PeerJS broker for signalling.
- Public STUN servers for NAT traversal.
- System fonts only. No font files, images, audio files or third-party brand marks.
- The Leab-Tui rules, interpreted from Navee Angsuputiphant, “กฏกติกาการเล่น เลี๊ยบตุ่ย” (2016),
  <http://naveea.blogspot.com/2016/03/blog-post.html>.

## What is not included

- No PeerJS or Three.js bundle.
- No broker credentials.
- No game server, database or account system.
- No session transcript, token, credential or personal data.
- No claim of anti-cheat, tournament authority or official rules status.

## Verification harness

`scripts/net-check.mjs` in the reference project is original, uses only Node built-ins and the Chrome
DevTools Protocol, and does not redistribute Chrome. It depends on the public PeerJS broker and is
therefore a separate, network-dependent test.
