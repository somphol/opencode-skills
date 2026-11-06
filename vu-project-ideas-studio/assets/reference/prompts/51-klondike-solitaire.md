---
id: klondike-solitaire
title: "Klondike Solitaire"
track: Games & Arcade
order: 51
words: 427
live: null
---

# Klondike Solitaire

> Klondike Solitaire with drag-and-drop, undo and auto-complete.

**Track:** Games & Arcade · **Brief size:** M · **Words:** 427 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Klondike Solitaire project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

Build a complete, fully interactive, and visually stunning Klondike Solitaire game in a single self-contained HTML file using HTML5, CSS3, and modern vanilla JavaScript.
Requirements:
Game Setup & Solitaire Rules:
Tableau: 7 columns (Column 1 has 1 card, Column 2 has 2, ..., up to Column 7 with 7 cards). Only the top card of each column is face-up initially; rest are face-down.
Foundations: 4 suit slots (Hearts, Diamonds, Clubs, Spades) starting empty. Cards build UP from Ace to King in matching suits.
Stock & Waste: 24 remaining face-down cards in the Stock pile.
Movement Rules:
On the Tableau: Build DOWN in alternating colors (e.g., Red 7 on Black 8).
Single cards or valid runs of face-up cards can be moved together.
Empty Tableau slots accept ONLY Kings or runs starting with a King.
Uncovering a face-down card automatically flips it over.
Moving a card from Foundation back to Tableau is allowed.
Controls & Interactions:
Drag and Drop: Native HTML5 or Pointer Events drag-and-drop for smooth card dragging on desktop and mobile touch devices.
Single / Double Click: Double-clicking or tapping a valid playable card automatically moves it to the appropriate Foundation slot or best Tableau location.
Draw Modes Toggle: Toggle switch between Draw 1 (easier) and Draw 3 (classic competitive) stock draw rules.
Stock Recycle: Clicking the empty Stock pile recycles cards from the Waste back into the Stock.
UI / UX & Animations:
Visual Theme: Modern green felt tablet-style background with smooth glassmorphism containers and glowing card drop-zones.
Card Graphics: Render clean vector-style standard playing cards (crisp suit icons, bold numbers, classic red/black colors, and decorative card backs).
Card Movement Polish: Smooth CSS transition animations when dealing cards, auto-moving cards, or drawing from stock.
Win Animation: Trigger a cascading card-bounce victory animation across the screen when all 4 Foundations reach Kings (similar to classic Windows Solitaire).
Game Utilities & State Management:
Undo System: Infinite step-by-step 'Undo' button restoring previous board states.
Auto-Complete Button: Automatically pop up an 'Auto-Complete' button when all face-down cards are revealed and victory is guaranteed.
Timer, Score & Move Counter: Display live game elapsed time, total moves made, and standard Solitaire points score.
Sound Effects: Add subtle web audio (synthesized with Web Audio API—no external audio files needed) for card clicks, flips, drops, and win celebrations.
Local Persistence: Save current game state to localStorage so refreshing the page restores the match.
Customization & Themes:
Include a settings panel allowing users to change Card Back Designs (Classic Blue, Neon Cyberpunk, Minimalist Black) and Table Felt Color (Emerald Green, Midnight Blue, Dark Velvet).
````

---

Source label in the supplied list: `Solitaire`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/klondike-solitaire>
