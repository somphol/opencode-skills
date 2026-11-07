# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting for this repository:
**Security → Report a vulnerability**. Include the affected file, reproduction steps, browser and
the impact you believe it has. A static-site issue is usually one of:

- cross-site scripting through copy, a dialog or a query parameter,
- an unintended outbound request or asset inclusion,
- a dependency or vendored-library vulnerability,
- a way to make the page read or store data it should not.

## Scope

This is a static, client-only site. It has no server, account system, database or analytics. The
enquiry form is a local interaction: nothing is transmitted or persisted. The only network traffic
is loading the site's own files from its host.

The OpenCode session ledger is generated locally by `scripts/state.mjs`, read-only, and contains
aggregate timing/token counts — not prompts, responses, credentials or file contents.

## Secrets

The repository must not contain tokens, passwords, private keys, session databases or a machine
path. If a secret is committed, revoke it first, then remove it from history; deleting the file in a
new commit is not enough.

## Dependencies

The runtime dependency is a pinned vendored copy of Three.js r170. `puppeteer-core` is dev-only and
is used by the release gate. Review any dependency update against the no-build, no-CDN constraint.
