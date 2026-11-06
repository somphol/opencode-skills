---
id: texas-holdem-poker
title: "Texas Hold'em Poker"
track: Games & Arcade
order: 52
words: 353
live: null
---

# Texas Hold'em Poker

> A no-limit Texas Hold'em table with AI opponents.

**Track:** Games & Arcade · **Brief size:** S · **Words:** 353 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Texas Hold'em Poker project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

Build a single-file interactive Texas Hold'em Poker game using HTML, CSS, and JavaScript (with standard DOM elements or HTML5 Canvas).
Key Requirements:
Setup Screen:
Show a clean initial setup popup/modal asking the player to:
Enter starting balance (e.g., $1,000).
Select the number of AI Opponents (1 to 5).
Specify the Small Blind / Big Blind amounts (e.g., $10 / $20).
Game Board & Table Layout:
Render a sleek, oval green poker table.
Position the human player at the bottom center and evenly distribute AI opponent bots around the table.
Show each player's stack balance, current hand cards, status badges ('Dealer', 'Small Blind', 'Big Blind', 'Folded', 'All-In'), and current round bet.
Display the main Pot in the center alongside the 5 Community Cards (Flop, Turn, River).
Poker Logic & Betting Rounds:
Implement standard betting stages: Pre-Flop  Flop (3 cards)  Turn (1 card)  River (1 card)  Showdown.
Support standard actions: Fold, Check (if no active raise), Call, Raise (with a slider/input field), and All-In.
Implement a basic AI bot decision engine where opponents decide to Fold, Call, or Raise based on their hand strength rating and current pot odds.
Hand Evaluation & Winner Determination:
At Showdown, evaluate every remaining player's best 5-card combination from their 2 hole cards + 5 community cards.
Recognize standard poker ranks (High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush).
Award the pot to the winner (or split in case of a tie) and display a hand summary banner (e.g., 'Player 1 wins $450 with a Full House!').
Bankroll & Elimination Rules:
Any player (AI or Human) whose balance reaches $0 is eliminated from subsequent hands.
If the human player's balance reaches $0, display a 'Bust / Game Over' screen with a restart button.
If the human player eliminates all AI bots, trigger a 'Tournament Champion!' victory screen.
UX & Visual Aesthetics:
Modern dark casino theme (dark green felt table, metallic gold/cyan accent text, polished card vector graphics).
Add an action history log box at the side displaying game events (e.g., 'Bot 2 raises $50', 'You call $50').
````

---

Source label in the supplied list: `Texas Hold'em`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/texas-holdem-poker>
