---
id: millionaire-race-2-5d-wealth-and-asset-tycoon
title: "Millionaire Race 2.5D: Wealth & Asset Tycoon"
track: Games & Arcade
order: 21
words: 705
live: null
---

# Millionaire Race 2.5D: Wealth & Asset Tycoon

> A 24-tile wealth race with physics dice and AI rivals.

**Track:** Games & Arcade · **Brief size:** L · **Words:** 705 · **Read:** ~4 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Millionaire Race 2.5D: Wealth & Asset Tycoon project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 2.5D web board game named "Millionaire Race 2.5D: Wealth & Asset Tycoon Studio" using vanilla HTML5, CSS3, ES6 JavaScript, HTML5 Canvas for board rendering, and Three.js / Cannon.js (via CDN) for a 3D physics dice modal.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. EXPLICIT GAME MECHANICS & MATHEMATICAL RULES:
----------------------------------------------------------------------
- VICTORY CONDITION:
  * First player whose Total Net Worth (Cash + Sum of Asset Buy Values) reaches $1,000,000 at the end of a turn wins instantly.
  * Secondary Condition: Highest Net Worth after 30 total rounds wins.

- CURRENCY & STARTING STATE:
  * Starting Cash: $100,000 per player. Starting Net Worth: $100,000.
  * Salary on GO (Tile 0): Passing or landing on GO pays +$20,000 salary + 10% dividend on owned stock assets.

- BOARD LAYOUT (24 TOTAL TILES IN PERIMETER TRACK):
  * Tile 0: "START / GO" (Collect $20,000 + Dividends)
  * Tile 1: "Startup Stock A" (Cost: $25,000 | Rent/Yield: $3,000)
  * Tile 2: "Opportunity Chest" (Draw Card)
  * Tile 3: "Condo Unit" (Cost: $40,000 | Rent: $5,000)
  * Tile 4: "Tax Audit" (Pay 10% of total Liquid Cash to Bank)
  * Tile 5: "Tech Stock B" (Cost: $50,000 | Yield: $7,000)
  * Tile 6: "LUXURY CLUB" (Just Visiting / Safe Zone)
  * Tile 7: "Suburban Villa" (Cost: $75,000 | Rent: $10,000)
  * Tile 8: "Market Chance" (Draw Card)
  * Tile 9: "Retail Plaza" (Cost: $100,000 | Rent: $14,000)
  * Tile 10: "Stock Crash" (Lose 15% value of most expensive asset)
  * Tile 11: "Solar Farm" (Cost: $120,000 | Yield: $17,000)
  * Tile 12: "FREE PARKING / BOUTIQUE HOTEL" (Rest & collect $5,000 bonus)
  * Tile 13: "Downtown Tower" (Cost: $150,000 | Rent: $22,000)
  * Tile 14: "Opportunity Chest" (Draw Card)
  * Tile 15: "Biotech IPO" (Cost: $180,000 | Yield: $28,000)
  * Tile 16: "Government Fine" (Pay fixed $15,000)
  * Tile 17: "Beach Resort" (Cost: $220,000 | Rent: $35,000)
  * Tile 18: "AUDIT LOCKOUT" (Go directly to Tile 6, lose next turn unless paying $10,000 exit fee)
  * Tile 19: "AI Tech Portfolio" (Cost: $260,000 | Yield: $42,000)
  * Tile 20: "Market Chance" (Draw Card)
  * Tile 21: "Supercar Fleet" (Cost: $300,000 | Rent: $50,000)
  * Tile 22: "Luxury Tax" (Pay $25,000)
  * Tile 23: "Millionaire Penthouse" (Cost: $350,000 | Rent: $65,000)

- TILE ACTION RULES & MORTGAGES:
  * Landing on Unowned Asset: Active player can choose "Buy Asset" or "Pass".
  * Landing on Opponent Asset: Active player pays Rent/Yield directly from Cash to owner. If Cash is insufficient, auto-mortgage assets at 50% purchase value.
  * Bankruptcy: If Cash drops below $0 with zero assets remaining, player is eliminated and remaining assets return to bank.

- CARD DECK ENGINE (Random array shuffle):
  * "Bull Market Surge": Receive +$25,000 investment bonus.
  * "Cryptocurrency Crash": Lose $15,000 on trading accounts.
  * "Real Estate Boom": Collect +$5,000 rent from all opponents.
  * "Tax Loophole Found": Pay zero taxes on next tax tile.

- AI BOT DECISION TREE LOGIC:
  * Buy Condition: AI buys an unowned asset if Remaining Cash after purchase > $20,000.
  * Lockout Condition: AI pays $10,000 fee to exit Audit Lockout immediately if Cash > $30,000.

----------------------------------------------------------------------
2. 3D DICE & 2.5D BOARD UI SPECIFICATIONS:
----------------------------------------------------------------------
- Setup Lobby: Select 2, 3, or 4 Players with Name inputs, Color Pickers (Red, Blue, Green, Yellow), and "Human" vs "AI Bot" toggles.
- 3D Physics Dice Modal:
  * Canvas overlay modal triggering 2 dynamic 3D dice (Three.js + Cannon.js physics) with random force vectors.
  * Modal auto-closes upon dice coming to rest and triggers step-by-step pawn movement.
- Top-Down 2.5D Canvas Board: Crisp HTML5 Canvas drawing perimeter tiles, player avatars, ownership color flags, asset levels, and net worth leaderboard sidebar.

----------------------------------------------------------------------
3. DATA PERSISTENCE & AUDIO:
----------------------------------------------------------------------
- Browser Storage: Auto-save game state after every turn to browser localStorage.
- Local JSON Import/Export: "💾 Save Match" downloads 'millionaire_race_save.json'; "📂 Load Match" restores active game.
- Web Audio API Synthesis: Synthesize 3D dice rolls, coin/cash chimes, pawn movement thuds, card shuffle sounds, and win fanfares.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Millionaire Race 2.5D: Wealth & Asset Tycoon Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/millionaire-race-2-5d-wealth-and-asset-tycoon>
