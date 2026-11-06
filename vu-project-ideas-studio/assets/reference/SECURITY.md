# Security

## What this project is

A static catalog. It has no server, database, login, API key or user-generated content. The attack
surface is the browser: HTML/CSS/JS, two `localStorage` keys, the clipboard API, and outbound links.

## Reporting a vulnerability

Please do **not** open a public issue for a security problem. Use GitHub's private vulnerability
reporting on the repository (**Security → Report a vulnerability**) or contact the maintainer through
<https://github.com/somphol>.

Include:

- affected file or URL;
- browser and version;
- reproduction steps;
- impact and any proof of concept;
- whether the issue is already public.

Do not include real credentials, personal data or third-party private information. You should receive
an acknowledgement within a few days. This is a volunteer project; no bounty is offered.

## Scope

In scope:

- cross-site scripting through a brief, title, tagline or metadata field;
- a bypass of the no-external-request design;
- exposure of credentials in the repository or build output;
- clipboard or `localStorage` behaviour that leaks data beyond the origin;
- dependency or supply-chain issues in the test tooling.

Out of scope:

- denial of service against GitHub Pages;
- missing security headers that the host controls;
- social engineering;
- reports that require a compromised browser or extension;
- the content of externally linked demos.

## Design controls

- All dynamic text is inserted with `textContent` or escaped before `innerHTML`; task bodies never
  become HTML.
- No `eval`, `new Function`, remote scripts or `javascript:` links in shipped files.
- No third-party analytics, fonts or CDNs.
- `scripts/verify.mjs` scans shipped files for common token and key patterns.
- The only network request beyond assets is same-origin `state.json`.
- The site does not read the clipboard; it only writes after a user action.

## Credentials

Never commit a token, private key or `.env` file. The deployment guide reads the GitHub credential from
the OS helper once and keeps it in a shell variable. If a credential is exposed, revoke it immediately
and rotate; deleting the file is not enough because Git history retains it.

## Supported versions

Only the latest release on `main` is supported. There are no maintained older branches.
