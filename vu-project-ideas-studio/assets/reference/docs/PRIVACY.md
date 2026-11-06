# Privacy

## Short version

No accounts. No analytics. No cookies. No advertising. No third-party requests from the application.
Two preferences stay in your browser.

## What is stored

| Key | Where | Contents | Why |
| --- | --- | --- | --- |
| `vu.favorites.v1` | `localStorage` | Array of project ids you starred | Shortlist survives reload |
| `vu.theme.v1` | `localStorage` | `"light"` or `"dark"` | Theme survives reload |

There is no server-side storage. Clearing site data removes both keys. The shortlist is not sent
anywhere and cannot be recovered if you clear it.

## Network requests

The page loads only same-origin files:

- `index.html`, `assets/style.css`, `assets/app.js`, `data/projects.js`, `assets/favicon.svg`;
- `state.json` once, for the elapsed-time/token line. A missing file or `file://` origin is handled.

There are no requests to Google Fonts, CDNs, analytics, tag managers, error trackers or social
networks. The GitHub and OpenCode links are ordinary links; nothing is requested until you click them.

## Clipboard

The **Copy** buttons write to your clipboard. Browsers may ask for permission the first time; the site
falls back to a hidden textarea if the async clipboard API is unavailable. Nothing is read from your
clipboard.

## Hosting logs

GitHub Pages is the host. GitHub may record standard request logs (IP address, user agent, timestamp)
under its own privacy policy. This repository does not receive or process those logs.

## External links

Two briefs link to public demos on `somphol.github.io`; the footer links to GitHub and OpenCode. Those
sites have their own policies. The catalog does not embed them, so visiting is always a deliberate
click.

## Children and student data

The catalog is a reading surface for project briefs. It does not collect names, emails, ages, school
data, grades or answers. Do not paste personal data into a brief or into a coding agent.

## Changes

If a future version adds analytics, accounts or a database, this document must change in the same
commit, and the default must remain “off” until the user opts in. The release gate checks that this
file exists; it cannot check that the claim is true, so review it whenever the network surface changes.
