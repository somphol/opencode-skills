# Performance

## Budget

| Asset | Size (uncompressed) | Notes |
| --- | ---: | --- |
| `data/projects.js` | 280 KB | 54 task bodies + metadata + prefix |
| `assets/app.js` | 19 KB | controller, no dependencies |
| `assets/style.css` | 34 KB | tokens, layout, responsive rules |
| `index.html` | 17 KB | static shell |
| `assets/favicon.svg` | <1 KB | local |
| Images in `assets/` | ~1.5 MB | screenshots, not loaded by the app |

The application itself makes **one** network request beyond the document: `state.json`, for the credit
line. It is optional; failure is caught. There are no fonts, CDN scripts, analytics, images in the
critical path or third-party connections.

## What the browser does

1. Parse the shell and CSS.
2. Load `data/projects.js` (classic script, no module graph).
3. Load `assets/app.js`, which renders 54 cards into a `DocumentFragment` in one pass.
4. Search is a linear scan over ~27k words. At 54 briefs this is imperceptible; it is not indexed.
5. The dialog opens from already-rendered metadata; the prompt is a text node, not a fetch.
6. Images in `assets/` are documentation only and are never requested by the page.

## Why no virtualization

54 cards, each with a handful of chips, is well below the point where virtualization helps. Virtual
lists add scroll restoration, focus and deep-link complexity. If the catalog grows past a few hundred
briefs, revisit with a windowed list and a search index.

## Why no web font

A serif display face would be ~40–100 KB and add a render-blocking request. The system serif stack
(Iowan, Palatino, Georgia) is attractive on macOS and Windows and falls back gracefully. Screenshots
are deterministic across runs on the same machine.

## Measuring

```bash
# sizes
wc -c index.html assets/style.css assets/app.js data/projects.js

# local server + browser checks
python3 -m http.server 4173
npm run test:browser
```

Use Chrome DevTools **Network** with “Disable cache” and **Lighthouse** in a private profile for a
local reading. Do not publish a Lighthouse score without recording the device, throttling and date;
the site's numbers depend on the host.

## Known costs

- The full task text is in the initial payload so search works offline. Splitting it into per-brief
  files would reduce the first load but break `file://` search and copy without a server.
- The hero uses large `backdrop-filter` and blurred gradients. They are decorative and disabled under
  reduced motion; on low-end GPUs the halos may cost a few milliseconds per frame.
- Six screenshots are committed for documentation. They are not served to the app, but they make the
  repository larger; that is a release-documentation choice, not a runtime one.
