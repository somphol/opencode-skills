# Content and image guide

## Choose the regions

Pick three regions with genuinely different visual and emotional registers. A good pattern:

| Register | Example | Photography |
| --- | --- | --- |
| Ritual + future | Japan | lantern lanes, neon crossings, Fuji, islands |
| Art + coast | Italy | imperial stone, Renaissance roofs, canals, cliffs |
| Rainforest + ocean | Costa Rica | cloud forest, surf, turtles, remote beaches |

Avoid three variants of the same European city break. The hero slider and region tabs should feel like
three different trips, not three colour swatches.

## Choose the five destinations

For each region, cover different reasons to go:

- one cultural anchor
- one big city / food capital
- one nature reset
- one coastal or mountain escape
- one wildcard (island, remote park, lesser-known region)

Check that the five do not duplicate each other's best month, budget tier and tags. A useful spread
for a region is 1 budget, 3 mid, 1 luxury.

## Destination field reference

```js
{
  id: 'kyoto',                    // unique, stable, lowercase kebab-case
  regionId: 'japan',              // must match a region
  name: 'Kyoto',
  country: 'Japan',
  tagline: 'The ancient cultural heart',
  image: 'https://images.unsplash.com/photo-…',   // bare URL, no query
  imageAlt: 'A lantern-lit street leading to a pagoda at dusk',
  gallery: [
    { image: '…', alt: '…' },
    { image: '…', alt: '…' },
    { image: '…', alt: '…' }
  ],
  bestTime: 'Late March–May · October–November',
  bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
  dailyBudget: 160,
  idealNights: 3,
  budgetLevel: 'mid',
  language: 'Japanese',
  currency: 'JPY',
  vibes: ['Culture', 'History', 'Foodie', 'Wellness'],
  lat: 35.0116,
  lng: 135.7681,
  overview: '3–5 sentences…',
  attractions: [
    { name: 'Fushimi Inari Taisha', type: 'Shrine · 2–3 hrs', description: '…' },
    { name: 'Kiyomizu-dera', type: 'Temple · 1–2 hrs', description: '…' },
    { name: 'Arashiyama Bamboo Grove', type: 'Landscape · 1 hr', description: '…' }
  ],
  cuisine: [
    { name: 'Kaiseki', note: '…' },
    { name: 'Yudofu', note: '…' },
    { name: 'Nishin soba', note: '…' },
    { name: 'Matcha', note: '…' }
  ],
  culture: 'Practical etiquette, 2–3 sentences…',
  seasonNote: 'Trade-offs, not just the best month…',
  itineraryTip: 'Actionable structure for a stay…',
  audiences: ['Culture seekers', 'Couples', 'Slow travellers'],
  budgetBreakdown: { stay: 85, food: 45, transport: 15, activities: 15 }
}
```

## Budget rules

- USD, per person, per day, mid-range.
- Stay + food + transport + activities must equal `dailyBudget`.
- Tiers: `budget` ≤ 125, `mid` 126–199, `luxury` ≥ 200.
- Exclude flights.
- Use round numbers; the UI formats with `Intl.NumberFormat`.
- The checks allow ±1 for rounding, but aim for exact.

## Copy standards

- Present tense, concrete nouns, no brochure hype.
- One clear point of view per destination. What does it feel like, and who is it for?
- Avoid “best in the world”, “hidden gem”, “must-see” and other unverifiable claims.
- `overview`: 3–5 sentences, place first, then rhythm, then a practical turn.
- `attractions`: one sentence on what it is, one on how to do it well (timing, booking, pairing).
- `cuisine`: name + why it matters, not a menu.
- `culture`: etiquette the traveller can act on.
- `seasonNote`: name the trade-off (crowds, rain, closures, heat).
- `itineraryTip`: how many nights, what to group, what to book.
- Keep it readable in a minute.

## Image curation

### 1. Collect candidates

Use Unsplash CDN asset IDs (`photo-…`). You can find them in travel articles, existing projects or
Unsplash pages. A 200 response only means the asset exists.

### 2. Build a contact sheet

Download 480 px thumbnails:

```sh
curl -sL "https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=480&q=60" -o <id>.jpg
```

Generate an HTML grid with the ID under each image, screenshot it with Chrome, and inspect the actual
subjects. Reject anything that does not match the destination or the region's mood. This is the step
that prevents “alpaca labelled as volcano”.

### 3. Map the set

A practical set is 24 unique images:

- 15 primary destination images
- 3 region hero images (often one of the 15)
- 3 route card images (often one of the 15)
- 3–9 gallery supports shared across a region

Do not reuse the same photo as the primary for two destinations. It is fine for a gallery to borrow
another destination in the same region if the alt text is honest.

### 4. Verify reachability

```sh
npm run verify:images
```

Expect `24/24 images reachable.`

### 5. Keep the licence trail

- Use Unsplash hotlinks, not downloaded files, in the repo.
- Link the Unsplash License in `CREDITS.md`.
- List every asset ID and where it is used.
- Note that photographer names are not embedded in the CDN assets; resolve them on Unsplash if you
  need per-photographer attribution.

## Region and route fields

```js
Region: { id, name, localName, tagline, tabNote, short, description, image, imageAlt,
          accent, accentSoft, ink, bestTime, dailyBudget, language, currency, stats[3] }

Route:  { id, name, days, regionId, image, imageAlt, summary,
          destinationIds, pace, budgetFrom }
```

`tabNote` is the short subtitle in the region tab (`Culture · Food · Nature`). It is separate from the
longer `tagline` so the tab stays one line.

## Adding content without breaking the checks

1. Add the destination before the deep-freeze pass.
2. Re-count the region: exactly five.
3. Add three gallery images.
4. Re-add the budget parts.
5. Add any new vibe to `TAG_ORDER` in `script.js`.
6. Run `npm run verify` and `npm run verify:images`.
7. Regenerate screenshots if the first visible cards changed.
