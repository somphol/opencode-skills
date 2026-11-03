# City brief: <city>

Fill this before writing scene code. The brief is the design contract: geography, landmarks, street
pattern, architecture, transport, palette, copy and verification targets. If the brief is vague, the
scene will be a generic city with the target's labels.

**The brief must be city-specific.** Do not copy the San Francisco brief, coordinates, street names,
landmark ids, building families, strings or test targets.

## 1. Identity

- City / district:
- One-line pitch:
- What makes it instantly recognisable in a 3-second overview:
- Languages / locales:
- What the city is *not* (avoid the wrong clichés):

## 2. Geography (compressed)

- Orientation: which way is north in the tray?
- Water: river / coast / lake / harbour / canals. Course, width, banks, islands.
- Land shape: peninsula / island / delta / hills / plain. Outer outline.
- Green: parks, hills, mangrove, rice fields, cemeteries, palace grounds.
- Tray aspect and approximate dimensions.
- Why the compression reads as this city, not a generic waterfront.

## 3. Districts

| District | Where | Character | Building families | Landmarks |
| --- | --- | --- | --- | --- |
| | | | | |

Aim for 5–7 districts with distinct height, colour and street rhythm.

## 4. Landmarks (6–8)

| # | Landmark | District | Silhouette / must-read features | Anchor (x, z) | Lot (w × d) | Look | View offset |
| - | --- | --- | --- | --- | --- | --- | --- |
| 01 | | | | | | | |
| 02 | | | | | | | |
| 03 | | | | | | | |
| 04 | | | | | | | |
| 05 | | | | | | | |
| 06 | | | | | | | |
| 07 | | | | | | | |
| 08 | | | | | | | |

Each landmark needs a silhouette that survives at 1–5 units tall, a reserved lot, a camera view and
an envelope. The view offset is in world axes from the look point.

## 5. Street pattern

- Dominant pattern: grid angle(s), radial, organic, canals, ring roads, superblocks.
- Major roads and their real names; which one is the spine?
- Bridges / tunnels / ferries and where they cross.
- Transit: metro, tram, bus, boat, cable car, tuk-tuk, bicycle.
- Pedestrian routes, promenades, markets, stairs, khlong paths.
- How the plan will stay connected: every bank/peninsula needs a crossing.

## 6. Architecture

| Family | Where | Height | Materials / colours | Roof / details |
| --- | --- | --- | --- | --- |
| | | | | |

Aim for 6–10 families. Include the ordinary fabric, not only the icons: shophouse, courtyard house,
housing block, office, market, temple/school, warehouse, hotel.

## 7. Transport and city life

- Signature vehicles and their colours:
- Boats / water traffic:
- Pedestrians and street life:
- Street furniture, stalls, signs, trees:
- What moves at night:

## 8. Palette and light

- Day: sky, fog, sun, water, land, accent.
- Night: sky, window light, neon, water, lamps, exposure.
- UI: ink, panel, accent, secondary.
- Two or three colours a viewer should remember.

## 9. Copy and locales

- Title / tagline / subtitle / eyebrow / explore line.
- Landmark name / area / text / short label for each.
- Tone, length limits, and the compact bar constraints.
- Language-specific typography risks (Thai line breaks, CJK spacing, RTL).

## 10. Technical targets

- Tray size and camera overview.
- Landmark view distances and look heights.
- Triangle / draw-call / building-count budget.
- Device pixel ratio, shadow map, water subdivisions.
- Single-file build, strict CSP, no external requests, system fonts.

## 11. Verification targets

- Landmark camera targets `(x, look, z)`.
- Landmark envelopes `(w, d, minY)`.
- Facts: landmarks, road edges, vehicles, boats, buildings.
- Locale checks and embed size.
- The tests must use the target's values, not the reference's.

## 12. Definition of done

- [ ] The city brief is filled and reviewed.
- [ ] No reference-city coordinates, street names, landmark ids, model files, i18n strings or test
      targets remain.
- [ ] Geography, plan, buildings, landmarks, environment, traffic and copy are all target-specific.
- [ ] The road graph is connected; parcels are contained and non-overlapping; bridges cross water.
- [ ] Every planned landmark flight, day/night, locales and the embed pass.
- [ ] The single file works offline under the sandbox CSP.
- [ ] README, AGENTS.md, CHANGELOG and screenshots are updated.

## 13. Do-not-copy checklist

- [ ] I did not copy the reference project's `src/` files and rename them.
- [ ] I did not reuse its outline, river, grid angle, street names or parcel lattice.
- [ ] I did not reuse its landmark models, anchors, view offsets or envelopes.
- [ ] I did not reuse its building families, palette or roof kit unchanged.
- [ ] I did not reuse its i18n strings or README copy.
- [ ] I did not reuse its tests' expected targets.
- [ ] The result reads as the target city from the overview, before reading the title.
