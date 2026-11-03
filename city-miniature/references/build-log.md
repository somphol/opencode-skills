# Build logs

Two build histories: the Bangkok from-scratch case study that defines the practice, and the San
Francisco reference implementation that supplies the mechanism.

## Bangkok: a reskin rejected, then rebuilt from scratch (2026)

### First attempt — copy and adjust

The first Bangkok attempt started by copying the San Francisco project and changing coordinates,
names and copy. It ran, but it was wrong:

- the peninsula outline, the bay/Pacific framing and the rotated Market Street logic remained;
- the landmark lots and camera views were still SF-shaped;
- the building families, roof kit and street furniture were still SF's;
- the tests and verification targets were still SF's;
- the result read as San Francisco with Thai labels, not Bangkok.

The user rejected it as a reskin. The lesson is not "adjust more"; it is "the geography, landmarks,
street pattern, transport and copy must be authored together for the target."

### Rebuild — from scratch

The rebuild kept only the mechanism: a road-first plan, instanced facades, camera flights, a virtual
clock, a capture API, a headless verification suite and a single-file build. Everything else was
new:

- **Geography**: the Chao Phraya runs through a floating tray, splitting the historic east bank
  (Rattanakosin, Chinatown, Siam, Silom) from Thonburi. Three road bridges cross the river.
- **Plan**: named Bangkok roads (Ratchadamnoen, Charoen Krung, Yaowarat, Rama I, Sukhumvit, Silom,
  Arun Amarin, Wang Doem) plus a clipped rotated grid, explicit bridge spans, street-front
  shophouses and a lattice fill.
- **Landmarks**: Grand Palace, Wat Arun, Wat Pho, Giant Swing, Golden Mount, Baiyoke Tower II,
  King Power Mahanakhon and Rama VIII Bridge, each modelled from scratch.
- **Architecture**: shophouse, heritage, low-rise, market, mixed-use, condo, office, hotel and pixel
  tower.
- **Transport**: taxis, tuk-tuks, buses, trucks, long-tail boats and river ferries.
- **Copy**: new English/Thai strings and landmark texts.
- **Verification**: new anchors, envelopes, facts, locale checks and 22 browser checks.

Result: about 140 buildings, 1,226 road edges, 40 vehicles, 3 boats, 22/22 checks, published at
<https://somphol.github.io/bangkok-miniature/>.

### Why the from-scratch build was cleaner

- The river dictated two banks, bridges and a waterfront promenade; the old peninsula logic could
  not express that.
- The landmark table drove the districts: the old town is low-rise and temple-led, the south is
  towers, the west bank is Thonburi.
- The transport choices followed from the city: tuk-tuks on the sois, long-tail boats on the river.
- The tests were written against the new anchors and envelopes, so a regression meant something.
- The scene no longer carried SF's assumptions in its coordinates, names, palettes or copy.

**Practice:** use existing miniatures as inspiration and a mechanism catalogue; build the target
city from scratch.

## San Francisco: the reference implementation

### Origin

Started from the Manhattan Miniature sample (0.2.0): a compressed Manhattan island, 87 parcels,
four avenues, eight Manhattan landmarks. The mechanism — road graph, block faces, parcels,
instanced facades, virtual clock — was kept; the geography, landmarks, copy and verification were
replaced. That was a reskin of Manhattan into San Francisco, and it is the reference, not the
recommended workflow for a new city.

### Geography

- New outline: a peninsula ~7 units wide, ~31 long, bay east, Pacific west, Golden Gate at the
  north tip.
- Landmarks moved to a compressed SF plan: bridge at the tip, Financial District and SoMa on the
  bay side, Civic Center and Alamo Square inland, Alcatraz offshore in the bay.
- Golden Gate Park and the Presidio replaced Central Park; the park block was rewritten as a
  parametric band with a lake, paths and trees.
- The two "East River" suspension bridges were deleted. Manhattan's rooftop water tanks were
  replaced by `roofKit()`.

### Street plan and the parcel problem

The grid is rotated 33° (`angle = -0.58`) with Market Street and the Embarcadero as explicit
polylines. Three parcel strategies were tried:

1. **Axis-aligned grid inside each block's bounding box** — simple, but a 33° street makes the
   support term large, so only the middle of each block passed the road test. ~44 parcels.
2. **Scanline fill inside each block, rotated boxes** — fits diagonal blocks, but block edges are
   irregular (Market cuts corners), so most cells failed the four-corner test. ~30 parcels.
3. **City-wide rotated sweep** — ignores blocks and fills everything clear of roads, but needs the
   sweep origin to align with block edges; anchored to a fixed lattice it wastes most samples.
   ~24 parcels.

What shipped is (1) plus a street-front infill pass, with cells at 0.62/0.68 and shrinking at
scales 1, .85, .7, .55: **84–216 parcels** depending on street density. On diagonal streets parcel
area is lost to clearance, so either accept larger buildings with gaps or rotate the buildings and
pay for a rotation-aware footprint.

### Traffic bug

Four cars still drove along the deleted Manhattan bridges at fixed world lanes (`z = 7.5`,
`z = 9.7`), which after the coastline change put them over open water. They now run on the Golden
Gate deck, with the lane derived from the bridge anchor and yaw. Any traffic attached to a rotated
landmark must be computed in that landmark's frame.

### Verification strategy

`npm run shoot` could not pass here: headless Chrome on this Mac has no working Metal path, so it
falls back to SwiftShader (~2.5 fps) and the harness's wall-clock waits expire during 1.4 s camera
flights. Rather than weaken the harness, `scripts/verify.mjs` was added: it drives the built file in
capture mode and advances virtual time, so every assertion is frame-rate independent.

### Publishing

`dist-single/index.html` is copied to a repo root and served by GitHub Pages. Pages cannot set
response headers, so the sandbox CSP is not applied there; the page is self-contained regardless.

### Open issues in the reference

- The bridge's city end stops in mid-air above the Presidio; no approach viaduct.
- Blocks whose streets failed to route stay empty.
- `shoot` remains unverified on a GPU here, so pixel-diff and fps claims are untested.

## What this means for a new city

Do not repeat the Bangkok first attempt. Read the reference for mechanism, fill the city brief,
author the target's geography and plan, then build the landmarks, buildings, transport, copy and
tests together. The overview should name the city before the title is read.
