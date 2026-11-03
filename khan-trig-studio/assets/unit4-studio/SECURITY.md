# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x (latest `main`) | Yes |
| Anything older or unlisted | No |

## What this project is

A fully client-side static site. It has no server, no accounts, no cookies, no
analytics and no runtime network requests. Progress is stored only in the
visitor's `localStorage` and can be exported as a local JSON file.

That architecture removes most server-side risk, but the following are still in
scope:

- Cross-site scripting through generated equations, translations, imported data,
  or a manipulated URL.
- Supply-chain risk if a dependency, workflow action or CDN is ever introduced.
- Leakage of personal data in the repository, documentation or example content.
- Vulnerabilities in the published GitHub Pages deployment or CI workflow.

Out of scope: social engineering, denial of service against GitHub itself,
issues in browsers or operating systems, and reports that require a modified
local copy with no realistic attack path.

## Reporting a vulnerability

Please do **not** open a public issue with exploit details.

1. Use GitHub's **Security → Report a vulnerability** private advisory form for
   this repository when it is available.
2. If that form is not available, contact the maintainer
   [@somphol on GitHub](https://github.com/somphol) and ask for a private
   channel before sharing details.

Include the affected file or URL, reproduction steps, browser and version, and
the impact you believe is possible. A proof of concept is welcome but not
required.

## Response

This is a volunteer, single-maintainer project. Best-effort targets:

- Acknowledgement within 7 days.
- Triage and a remediation plan within 30 days for confirmed issues.
- Credit in the release notes if you would like it.

No bug bounty or paid compensation is offered.

## Safe changes

- Never commit tokens, credentials, personal data or private transcripts.
- Do not add remote scripts, fonts, analytics or tracking.
- Keep `state.json` free of machine paths, emails and secrets.
- Review workflow changes (`/.github/workflows/`) with the same care as runtime
  code.
