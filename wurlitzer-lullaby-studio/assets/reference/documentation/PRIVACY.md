# Privacy

## Summary

No accounts, analytics, cookies, fingerprinting, ads, uploads or server. Settings stay in your
browser. Audio is either synthesized locally or streamed directly from Wikimedia Commons.

## What is stored

`localStorage` key `wurlitzer-lullaby-studio:v1`:

- language, free-play mode and credit count;
- master/bass/treble/mix, three ambient volumes, mute;
- timer preference and last record id;
- favourite record ids.

There is no name, email, location, device id or usage history. The app does not read the clipboard,
camera, microphone, contacts or files.

## What leaves the browser

| Destination | When | Data |
| --- | --- | --- |
| `cdn.jsdelivr.net` | page load | standard HTTP request for Three.js modules; no app data |
| `upload.wikimedia.org` | when you play C-1…C-4 | standard HTTP request for the MP3; the URL is in the public manifest |
| GitHub Pages | page load | standard request for the static files |

No query string contains personal data. The app does not send analytics beacons, pings or error
reports. Failed streams are handled locally.

## Third parties

GitHub Pages logs requests according to GitHub's policy. jsDelivr and Wikimedia see your IP and
user-agent as any CDN does. There are no embedded trackers, social widgets, fonts or maps.

## Export

The export button creates a JSON file locally using a Blob URL. Nothing is uploaded. The file contains
the settings above plus the public track list.

## Children

The app is a lullaby toy with no data collection, but it is not specifically directed at children.
Parents should use the device's normal volume and screen-time controls.

## Changes

If a future version adds analytics or accounts, this document and the release notes must change in the
same commit. The current design has no server component to notify users through.
