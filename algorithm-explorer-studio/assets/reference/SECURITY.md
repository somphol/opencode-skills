# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | yes |

## Reporting a vulnerability

Do not open a public issue for a security problem. Report it privately through the contact channel on
the GitHub profile [`somphol`](https://github.com/somphol) or GitHub's private vulnerability reporting
for this repository. Include:

- affected URL or file;
- browser and OS;
- reproduction steps;
- impact (e.g. script injection, data exposure, denial of service);
- any suggested fix.

You should receive an acknowledgement within a few days. Please allow time for a fix before public
disclosure.

## Scope and design

This is a static site with no backend, authentication, database or user accounts. The relevant
surfaces are:

- **DOM injection** — all curriculum text is authored data, but custom input is user-controlled. It is
  inserted with `textContent` / attribute escaping, never as raw HTML.
- **Third-party scripts** — Three.js and OrbitControls are loaded from pinned CDNs. A compromised CDN
  is outside this project's control; the page has no secrets to steal.
- **Outbound links** — every LeetCode link uses `target="_blank"` with `rel="noopener"`.
- **Local storage** — only progress/preferences/quiz best. No tokens, no PII.
- **No analytics, cookies, service worker or network APIs** in the app.

## Hardening recommendations for forks

- Add a Content-Security-Policy header at the host; the shell has no inline scripts or event handlers.
- Vendor the CDN scripts and pin subresource integrity if you need supply-chain guarantees.
- Keep `localStorage` parsing defensive; do not render stored values as HTML.
- Do not add a backend secret to a static page.

## Known non-issues

- The quiz best score is client-side and can be edited by the user. It is not a security boundary.
- Custom input can make a very large result only within the parser limits; it cannot execute code.
- There is no authentication to bypass.
