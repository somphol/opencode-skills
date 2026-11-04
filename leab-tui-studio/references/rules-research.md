# Rules research and the contract

## Why this is first

A traditional game has three layers: the physical equipment, the social rules and the local names.
A code implementation that guesses any of them will be wrong in a way no 3D polish can fix. Freeze the
rules before writing the engine; the rest of the project is downstream.

## Sources

Prefer, in order:

1. A named human author writing in the game's own language, with examples. The Leab-Tui source is
   Navee Angsuputiphant, “กฏกติกาการเล่น เลี๊ยบตุ่ย” (2016),
   <http://naveea.blogspot.com/2016/03/blog-post.html>.
2. A museum, cultural centre, university or game-studies article.
3. A well-moderated forum thread with multiple corroborating players.
4. Video walkthroughs, used only to confirm a written source.

Do **not** treat a casino/gambling page, an SEO content farm or an AI-generated summary as a primary
source. Record the URL, the author and the date in `docs/RULES.md`.

## The questions the contract must answer

- **Equipment:** exact counts per rank and colour; total; any special tiles.
- **Players:** 2/3/4; how the deck is trimmed or dealt; partnership or individual.
- **Hierarchy:** rank order; colour order; suit order; any special “trump”.
- **Calls / combinations:** names, counts, shapes, whether colour must match, whether duplicates are
  allowed, whether a General/unique piece can pair.
- **Comparison:** what is compared first, then second, then colour; what happens on an exact tie.
- **Trick flow:** who leads; what followers must send; when a set is revealed; whether a non-matching
  hand may still send; who wins; who leads next.
- **Scoring:** piles/tricks/points; par; bonus; match target; penalties.
- **Round / match:** when the round ends; reshuffle; dealer/leader rotation.
- **Ambiguities:** every place the source is silent or contradictory, and the chosen interpretation.

Write the contract as tables, not prose. A table is testable.

## Leab-Tui worked contract

| Item | Decision |
| --- | --- |
| Tiles | 32 Xiangqi tiles; 16 red, 16 black |
| Per colour | 1 General, 2 Advisors, 2 Elephants, 2 Chariots, 2 Horses, 2 Cannons, 5 Soldiers |
| Players | 4; 8 tiles each |
| Hierarchy | General > Advisor > Elephant > Chariot > Horse > Cannon > Soldier |
| Colour | Red beats black at equal rank |
| Exact tie | Earlier play keeps the trick |
| Calls | Leab ×1, Tui ×2, Sam/Si/Ha Juk ×3–5, Sa Hoo ×3, See Hoo ×4, Ngoh Hoo ×5, Lak Hoo ×6 |
| Straight colour | One colour only (interpretation) |
| Pair | Same rank **and** colour; General cannot pair |
| Sa Hoo | Big `G–A–E` or small `C–H–Cn`, one colour |
| See Hoo | Sa Hoo + one duplicated core rank; compare the duplicated rank then colour |
| Ngoh Hoo | Sa Hoo + two distinct doubled core ranks; compare pair, pair, colour |
| Lak Hoo | Small core with all three ranks doubled; colour only |
| Trick | Everyone sends N; leader reveals; others may reveal a beating legal set; only revealed sets compete |
| Winner | Highest revealed set takes 4×N tiles and leads next |
| Scoring | 0–7 piles → −2..5; 8 piles → 16 (Chuan); first to target wins |

The interpretation notes are part of the contract, not a footnote. They are what a future agent will
otherwise re-litigate.

## From contract to code

1. One `RANKS` table with `power`, `copies`, red/black Hanzi, English and Thai names.
2. One `detectCombo(tiles)` that returns a typed object with a **score array**. The score array is the
   comparison key; keep it explicit instead of scattering `if` chains.
3. One `compareScores` (lexicographic) and one strict `beats`.
4. One `allCombos(hand)` that enumerates legal candidates for the AI and the coach.
5. One `scorePiles`.
6. A self-test that asserts each row of the contract.

If a rule cannot be expressed as a pure function over plain tiles, the contract is not finished.

## Ambiguity policy

- State the ambiguity in `docs/RULES.md` under “interpretation”.
- Choose the interpretation that keeps the game playable and internally consistent.
- Encode it in `detectCombo`; do not hide it in the UI.
- Add a self-test row so a future change is deliberate.
- Put the same note in the in-app rules drawer.

For Leab-Tui, the two choices are: Ngoh Hoo requires **two distinct** doubled ranks, and Lak Hoo is
**one colour**. Both are defensible; both are disclosed.

## Naming

Keep the traditional names as the primary labels (Leab, Tui, Sa Hoo, See Hoo, Ngoh Hoo, Lak Hoo,
Chuan) and add an English gloss. Do not invent a “western” name for the game. In Thai, use the tile
names players actually say: ตี่ บิน ช้าง กือ เบ๊ เผ่า จุก, with the alternates (สือ, เฉียว, เรือ, ม้า,
ปืนใหญ่, ทหาร) in the inspector.
