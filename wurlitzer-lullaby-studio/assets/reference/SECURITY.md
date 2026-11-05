# Security policy

## Supported version

The deployed `main` branch and the latest tagged release receive fixes.

## Report a vulnerability

Please do **not** open a public issue for a security problem. Use GitHub's private vulnerability
reporting on the repository, or contact the maintainer through the route in [SUPPORT.md](SUPPORT.md).
Include the affected URL, browser/OS, a minimal reproduction and the impact you believe it has.

You can expect an acknowledgement within 5 working days and a coordinated fix before disclosure.

## Threat model

This is a static client-side page. It has no server, accounts, cookies, uploads or secrets. The main
risks are therefore:

- **DOM injection through manifest data.** All text from `data/playlist.json` is rendered with
  `textContent`/canvas, never injected as HTML; the manifest validator caps lengths and schemes.
- **Malicious stream URLs.** Only `https://` URLs are accepted. The app does not fetch them with
  credentials; it hands them to an `<audio>` element.
- **Supply-chain substitution at the CDN.** Three.js is pinned to one exact version through the
  import map. There is no `latest` tag and no runtime dependency beyond it.
- **Persistent denial of service via `localStorage`.** Settings are normalised and clamped on load.

If you find a way to break one of those assumptions, that is a valid report.

## Out of scope

- Audio quality or loudness complaints (use the volume knob; the synth is intentionally soft).
- The licences of third-party recordings (raise them on the source page).
- Missing HTTPS on a local `file://` test.
