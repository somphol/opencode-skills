---
id: full-3d-chess-academy-and-studio
title: "Full 3D Chess Academy & Studio"
track: Puzzles & Strategy
order: 10
words: 531
live: null
---

# Full 3D Chess Academy & Studio

> A complete 3D chess academy with coaching and mini puzzles.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 531 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Full 3D Chess Academy & Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D Chess web
application named "Full 3D Chess Academy & Studio" using vanilla HTML5,
CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source digital board game series
modeled after interactive academy studios (such as bilingual 3D chess
and strategy training environments). Its purpose is to provide a fully
immersive, rotatable 3D environment for playing and learning Standard
International Chess with zero external framework dependencies or backend
requirements, optimized for GitHub Pages deployment.

======================================================================
1. 3D RENDERER, CAMERA & LIGHTING SCENE (THREE.JS)
======================================================================
- Scene Setup:
  * Initialize a Three.js WebGLRenderer with soft shadows enabled,
    adaptive window resizing, and a clean, modern studio background color.
  * Camera & Controls: Implement OrbitControls allowing the user to
    smoothly rotate, pan, and zoom around the 3D chess board (restricted
    vertical angles so players maintain a clear overhead perspective).
- Board & Materials:
  * Render an 8x8 chess board with alternating wood/slate textures
    and raised beveled borders.
  * Lighting: Directional light casting soft shadows across the board,
    paired with a gentle ambient light fill.

======================================================================
2. 3D PIECE GEOMETRY & INTERACTIVE RAYCASTING
======================================================================
- Stylized 3D Pieces:
  * Create clean, elegant low-poly or geometric 3D piece models (or
    composite primitive shapes) for Pawn, Rook, Knight, Bishop, Queen,
    and King.
  * Team Materials: Distinct metallic/matte materials for White and
    Black pieces (e.g., Polished Ivory vs. Deep Obsidian Charcoal).
- Raycasting Selection & Move Highlighting:
  * Use Three.js Raycaster to map mouse clicks/touches directly onto
    3D piece meshes and board tiles.
  * Selection state highlights the active piece with a glowing outline
    or floating halo.
  * Valid move squares illuminate with glowing 3D translucent rings
    hovering just above the tile surface.

======================================================================
3. BEGINNER COACHING & INTERACTIVE ACADEMY STUDIO
======================================================================
Provide a dedicated side panel toggle for learning tools:
- 3D Piece Movement Inspector: Clicking any piece lifts it slightly,
  rotates it gently, and displays its point value and movement rules in a
  side card while projecting its valid 3D flight/step paths on the board.
- Bilingual Strategic Coaching HUD: Real-time bilingual (English / ภาษาไทย)
  tips offering reminders (e.g., "Control the center squares!", "Castling
  protects your king early!").
- Smart "Undo & Learn" Blunder Guard: Allows beginners to step back
  from a disastrous move with an instant explanation popup.
- Mini-Puzzle Drills Tab: 3 built-in beginner tactical puzzles loaded
  from local JSON data structures.

======================================================================
4. GAME LOGIC, AUDIO & DATA PERSISTENCE
======================================================================
- Rule Implementation:
  * Full standard chess validation: pawn double-step, en passant,
    castling, check, checkmate, and a pawn promotion modal window.
- Sound Effects:
  * Synthesized Web Audio API sound effects for piece lifts, drops,
    captures, and checks (zero external audio asset dependencies).
- Language Switcher (EN ⇄ TH Toggle):
  * Instantly translates all UI controls, academy lessons, and coaching
    tips between English and Thai (ภาษาไทย).
- Local Storage & Export Engine:
  * Auto-saves ongoing game progress and puzzle completion streaks
    to browser localStorage.
  * "💾 Export Game PGN / JSON" downloads progress files.

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

Source label in the supplied list: `Full 3D Chess Academy & Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/full-3d-chess-academy-and-studio>
