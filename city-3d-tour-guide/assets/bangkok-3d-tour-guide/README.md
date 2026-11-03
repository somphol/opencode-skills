# Bangkok 3D — reference application

This is the working, city-specific reference for the **City 3D Tour Guide** skill. It is a complete
static Three.js tourist guide to Bangkok, extracted from the finished project at
<https://github.com/somphol/bangkok-3d-tour-guide>.

```sh
python3 -m http.server 8000
open http://127.0.0.1:8000/
open 'http://127.0.0.1:8000/?selftest=1'
```

The runtime is exactly three files — `index.html`, `style.css`, `script.js` — plus the licence,
notices and reference screenshots. The source project also includes full architecture, handoff,
testing and release documentation.

**Use this as a mechanism reference, not a reskin template.** For a new city, author the geography,
landmarks, route, copy, palette and tests together. Copying Bangkok coordinates and renaming landmarks
will fail the skill's definition of done.

The self-test expects **24 / 24** checks. There is no build step, package manager or network API beyond
the pinned Three.js/OrbitControls CDN and Google Fonts.
