# Performance

## Budgets

| Resource | Budget | Actual (default) |
| --- | --- | --- |
| Runtime JS | < 90 KB uncompressed | ~78 KB across data + algorithms + scene + app |
| CSS | < 60 KB | ~42 KB |
| HTML | < 25 KB | ~22 KB |
| Draw calls | < 160 | peaks around 120 in DP (38 cells + lines + labels) |
| Frame count | < 45 | DP default 38 |
| Device pixel ratio | cap 2 | `min(devicePixelRatio, 2)` |
| Scene rebuild | < 80 ms | observed 15–40 ms in headless Chrome |
| Browser suite | < 2 min | 60–90 s |

The app ships no images, fonts, models, textures, audio or wasm. The only required asset is a small
SVG favicon; screenshots are documentation.

## Where the cost is

- **Label sprites.** Each unique text/colour combination creates a 512×192 canvas texture once. The
  cache is shared for the whole session. Labels are cheap after the first frame.
- **DP scene.** 3 × 12 = 36 cuboids plus dependency lines and labels. It is the heaviest builder but
  still well within budget.
- **Tree scenes.** Up to 31 nodes, each a sphere + label + halo, plus edges. Default trees are 13–19
  nodes.
- **Backtracking.** Up to 31 nodes, 30 edges, labels at every node. The visualizer caps the input at
  four values (31 nodes) on purpose.

## Techniques used

- One renderer, one scene, one camera; only the content group is rebuilt.
- `disposeObject()` releases geometry/material and skips shared label textures.
- Tweening is O(objects) per frame, not a tween library with allocations.
- Pixel ratio capped; antialias on desktop; shadow map 1024² and a 40-unit shadow camera.
- Stars are one `Points` object (300 vertices), not 300 meshes.
- Playback uses a single interval; the render loop does not touch algorithm state.
- UI text updates only on step changes, not every frame.
- `ResizeObserver` plus a window resize fallback; no layout reads inside the render loop.

## Mobile

At 390×844 the stage is ~330–480 px tall, DPR is capped at 2, and the rail collapses to a horizontal
scroller. The transport wraps but the play button stays first. The browser suite asserts no horizontal
overflow and that the canvas exists.

## Things that would hurt

- Removing the DPR cap on a 3× phone.
- Creating a new sprite texture every frame instead of using `setLabel`'s cache.
- Sharing mesh materials across objects and then disconnecting one state from another.
- Raising input limits without checking draw calls and label overlap.
- Adding a second renderer or a post-processing chain.
