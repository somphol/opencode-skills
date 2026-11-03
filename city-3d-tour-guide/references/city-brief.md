# City Brief — fill this before writing scene code

Copy this file to `CITY.md` in the new project and replace every placeholder. The brief is the design
contract; the 3D scene, copy, tests and screenshots must all agree with it.

## Identity

- **City / district:** `[name]`
- **English title:** `[City] 3D — Interactive Urban Tourist Guide & Explorer Studio`
- **Local-language title:** `[local title]`
- **Local language:** `[Thai / Japanese / …]`; UI language code: `[th / ja / …]`
- **One-line promise:** `[what the visitor will understand or feel]`
- **Tone:** `[editorial, playful, cinematic, scholarly]`
- **Not:** `[what this is deliberately not]`

## Geography

- **Central axis / water:** `[river, coast, canal, avenue]`
- **Axis position in world units:** `[x/z, width]`
- **City bounds:** `[minX maxX minZ maxZ]`
- **Street pattern:** `[grid angle, ring road, organic lanes, bridges]`
- **Compressed geography decisions:** `[what is moved, what is omitted]`
- **Camera overview target:** `[x,y,z]`

## Five landmarks

For each: English/local name, silhouette, relative position, signature colours/materials, story angle,
entry, hours, dress code, transit, best time, and source(s).

1. `[Landmark 1]`
2. `[Landmark 2]`
3. `[Landmark 3]`
4. `[Landmark 4]`
5. `[Landmark 5]`

Check that the five are distinguishable from above, from the river/street, and at night. Avoid five
versions of the same tower.

## Transit and camera route

- **Transit mode:** `[river boat, tram, metro, walking bus, sky train]`
- **Route story:** `[where it starts and ends, why]`
- **Five stop camera views:** `[viewpoint → look target]`
- **Drone home:** `[position, target]`
- **Walk spawn and look:** `[position, target]`

## Controls contract

- Drone: orbit drag, wheel zoom, right-drag pan, recenter.
- Walk: drag look, inverted horizontal, on-screen pad, arrow keys, optional WASD, scroll FOV zoom,
  collision, marker-only click picking.
- Transit: autoplay spline, pause/next, scroll FOV zoom.

## Languages and copy

- **UI language pair:** `[en ⇄ local]`
- **Landmark story:** three paragraphs, one fact, five tips in both languages.
- **Narration:** device speech; no recorded audio.
- **Names/places that must not be mistranslated:** `[list]`
- **Facts to verify:** entry fees, hours, dress codes, transit stations, best time. Date the snapshot.

## Look and sound

- **Palette:** `[3–5 colours with roles]`
- **Typography:** `[display, body, local script]`
- **Materials:** `[stucco, tile, gold, glass, wood, water]`
- **Lighting:** midday, golden hour, night; what changes.
- **Audio:** `[river, traffic, bells, footsteps, air]`
- **Forbidden imagery:** photos, map tiles, brand marks, external models.

## Data

- Landmark ids (stable): `[id-1 … id-5]`
- Storage key: `[city]3d.state.v1`
- Export filename: `[city]_3d_tour.json`
- Notes cap: 4,000 characters.
- Compatible import: flat export or `{ state: … }`.

## Verification targets

- Landmark count and ids.
- Tour order and stop count.
- Bilingual key/landmark parity.
- Walk collision, pad, arrow keys, focus and marker-only picking.
- Three presets, audio class, export schema/filename, note sanitising.
- Mobile viewport `[430×900]`.
- Self-test count `[24]`; static check count.
- Live Pages URL.

## Release

- Repository: `[owner/name]`
- Pages URL: `[https://owner.github.io/name/]`
- Version: `[1.0.0]`
- Screenshots: 1600×1000 desktop + 430×900 mobile.
- Required docs: see [release-docs.md](release-docs.md).

## Sources

List the sources used for history/prices/transit. Avoid asserting unverified facts. Record the date of
the snapshot and the rule that the visitor must confirm details.

## Deliberate omissions

`[what the diorama does not include and why]`
