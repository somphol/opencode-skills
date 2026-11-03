# San Francisco Diorama

> **Reference implementation, not a starter.** Read this project for the mechanism — the road-first
> plan, instanced facades, camera flights, virtual clock, capture API, verification and single-file
> build. Do not copy its scene, geography, landmarks, copy or tests into a new city. Create a blank
> starter with the skill's `scripts/new-project.mjs` and build the target city from scratch.

An interactive React/TypeScript/three.js miniature of San Francisco: a road-first plan with a
rotated downtown grid and Market Street cutting across it, ten architecture families, eight
dedicated landmarks, traffic, pedestrians, boats on the bay, and day and night lighting. Builds
into one offline HTML file.

The geography is deliberately compressed into a tabletop tray: the Golden Gate at the north tip,
the bay to the east, the Pacific to the west, Golden Gate Park and the Presidio as green bands, and
a skyline that runs from the Ferry Building to City Hall. It is not a survey map.

## Landmarks

| # | Landmark | District |
| - | -------- | -------- |
| 01 | Golden Gate Bridge | The Golden Gate |
| 02 | Transamerica Pyramid | Financial District |
| 03 | Salesforce Tower | SoMa |
| 04 | Ferry Building | The Embarcadero |
| 05 | Coit Tower | Telegraph Hill |
| 06 | Painted Ladies | Alamo Square |
| 07 | City Hall | Civic Center |
| 08 | Alcatraz | San Francisco Bay |

## Run

```sh
npm ci
npm run dev            # live dev server
npm run build:single   # -> dist-single/index.html, one self-contained file
npm run shoot           # headless-Chrome verification -> shots/report.html
npm run record          # -> film/film.mp4 (12 s, 1920x1080) + film/poster.jpg
```

`node tests/run.mjs` runs the geometry, traffic, diversity and planning checks without a browser.
`node scripts/verify.mjs` drives the single-file build in headless Chrome and checks every landmark
flight, day/night, reset, zoom, orbit, pan, rotate, both locales and the 345x345 embed in virtual
time, so the result does not depend on the frame rate.

`shoot` and `record` need Node 22.4 or newer and Chrome; `record` also needs FFmpeg on PATH.

## Controls

Eight landmark buttons, Day / Night, auto rotate, reset, drag to orbit, right-drag or arrow keys to
pan, wheel or + / − to zoom; screenshot and fullscreen outside a sandbox. `?lang=zh-CN` switches to
Simplified Chinese, `?embed=1` shows the embed layout, `?capture=1` enables frame stepping,
`?view=topdown|lower|midtown|bridge` is a debug starting viewpoint.

The scene makes no network, storage or model calls. The single file runs under
`sandbox allow-scripts; default-src 'none'; …` with no external requests, fonts or images.
