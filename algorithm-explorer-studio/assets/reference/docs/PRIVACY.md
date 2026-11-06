# Privacy

## Short version

No account. No backend. No analytics. No cookies. No trackers. No data leaves the browser except
requests for the two pinned CDN scripts and clicks on outbound LeetCode links.

## Data stored locally

| Key | Contents | Purpose | Cleared by |
| --- | --- | --- | --- |
| `algoExplorer.progress.v1` | `{"pattern:num": true}` | practice checkboxes | “Clear progress” in Practice |
| `algoExplorer.prefs.v1` | last pattern, language, speed, explored pattern ids | resume the studio | browser site-data controls |
| `algoExplorer.quiz.v1` | best percentage, attempt count | show personal best | browser site-data controls |

There is no personal data, no free-text persistence and no identifier. Custom input is held in memory
only; it is not written to storage or sent anywhere.

## Network requests

- `cdnjs.cloudflare.com` — Three.js r128.
- `cdn.jsdelivr.net` — OrbitControls 0.128.0.
- `leetcode.com` — only when the user clicks a problem link (`target="_blank"`).

GitHub Pages serves the files and may log standard request metadata at the host level; that is outside
this application's control. The app itself does not call `fetch`, `XMLHttpRequest`, `sendBeacon`, or
any analytics endpoint.

## Third parties

LeetCode problem links are references. The project is not affiliated with LeetCode, Design Gurus,
NeetCode or Blind 75, and does not copy their premium content. See
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## Children and sensitive data

This is an educational tool for software engineers. It is not directed at children and does not
knowingly collect anything from anyone. Do not paste sensitive data into the custom input; it remains
in the page, but it is still visible on screen and could be captured by a screen recording.

## Changes

If a future version adds cloud sync, analytics, accounts or a backend, this document and the privacy
surface must be reviewed before release. A static privacy claim is only as good as the code path that
backs it; the static test scans runtime files for network/analytics patterns.
