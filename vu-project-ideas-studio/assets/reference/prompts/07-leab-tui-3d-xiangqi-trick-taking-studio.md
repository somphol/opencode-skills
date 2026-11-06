---
id: leab-tui-3d-xiangqi-trick-taking-studio
title: "Leab-Tui 3D: Xiangqi Trick-Taking Studio"
track: Puzzles & Strategy
order: 7
words: 561
live: null
---

# Leab-Tui 3D: Xiangqi Trick-Taking Studio

> A 3D Xiangqi-tile trick-taking table with an AI coach.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 561 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Leab-Tui 3D: Xiangqi Trick-Taking Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "Leab-Tui 3D: Traditional Xiangqi Trick-Taking Studio" using vanilla
HTML5, CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source digital board game series
modeled after interactive academy studios (such as bilingual 3D chess
and strategy training environments). Its purpose is to digitize "เลี๊ยบตุ่ย"
(Leab-Tui), a classic Thai trick-taking game played with 32 Chinese Chess
(Xiangqi) tiles, into an immersive 3D rotatable sandbox with zero external
framework dependencies, optimized for GitHub Pages deployment.

======================================================================
1. 3D RENDERER, CAMERA & SCENE SETUP (THREE.JS)
======================================================================
- Scene & Lighting:
  * Initialize Three.js WebGLRenderer with soft shadows enabled, adaptive
    window resizing, and a dark mahogany felt table surface environment.
  * Camera Controls: Implement OrbitControls allowing smooth rotation,
    panning, and zoom around the felt table.
- 3D Xiangqi Tile Rendering:
  * Render 32 cylindrical wood/melamine 3D tiles with raised bevel edges.
  * Carve Traditional Xiangqi Hanzi Calligraphy on tile faces (Red vs. Black):
    - Red: 帥 (General), 仕 (Advisor), 相 (Elephant), 俥 (Chariot), 傌 (Horse), 炮 (Cannon), 兵 (Soldier).
    - Black: 將 (General), 士 (Advisor), 象 (Elephant), 車 (Chariot), 馬 (Horse), 包 (Cannon), 卒 (Soldier).
  * Tile Animations: Smooth linear interpolation (Lerp) when dealing tiles,
    playing a trick to the center table, or flipping tile faces.

======================================================================
2. GAME LOGIC & LEAB-TUI TRICK-TAKING RULES
======================================================================
- Game Setup & Dealing:
  * 4 Players (1 Human vs. 3 AI Opponents seated around the circular table).
  * Shuffle and deal 8 face-down tiles to each player's hand.
- Piece Hierarchy & Combination Matching:
  * Single Rank Power: General (帥/將) > Advisor (仕/士) > Elephant (相/象) >
    Chariot (俥/車) > Horse (傌/馬) > Cannon (炮/包) > Soldier (兵/卒).
  * Red pieces beat Black pieces of equivalent rank.
  * Special Combinations: Support Single Lead ("Leab"), Pairs, 3-Tile Straights
    ("Sa Hoo"), 4-Tile Straights ("See Hoo"), and 6-Tile Straights ("Lak Hoo").
- Trick Execution Loop:
  * Lead player plays a tile/combination to center. Subsequent players
    must match combination type or play according to turn rules.
  * Highest ranking played combination captures the trick and claims
    captured tiles.

======================================================================
3. BEGINNER COACHING & INTERACTIVE ACADEMY STUDIO
======================================================================
Provide a dedicated side-panel toggle for learning tools:
- 3D Tile Inspector: Hovering/clicking any tile lifts it slightly and displays
  its Thai name (e.g., ตี่, บิน, ช้าง, กือ, เบ๊, เผ่า, จุก), English equivalent,
  and rank score card.
- Bilingual Strategic Coaching HUD: Real-time bilingual (English / ภาษาไทย)
  commentary hinting at optimal leads, trick counting, and score predictions.
- "Undo & Learn" Step Guard: Allows beginners to step back from a lost trick
  with an explanation of piece rank dominance.

======================================================================
4. BILINGUAL HUD, AUDIO & LOCAL DATA PERSISTENCE
======================================================================
- Web Audio API Sound Effects (Zero External Files):
  * Synthesized sound effects for tile shuffling, clacking wood impacts on
    the felt table, trick capture sweeps, and win stings.
- Language Switcher (EN ⇄ TH Toggle):
  * Instantly translates all HUD controls, trick callouts, tile names, and
    rule books between English and Thai (ภาษาไทย).
- Local Storage & Export Engine:
  * Auto-saves ongoing match scores, total win streaks, and game history
    to browser localStorage.
  * "💾 Export Game JSON" downloads game state history.

======================================================================
OUTPUT FORMAT REQUIREMENT
======================================================================
Provide the complete source code clearly divided into three code
blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Leab-Tui 3D: Traditional Xiangqi Trick-Taking Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/leab-tui-3d-xiangqi-trick-taking-studio>
