---
id: isometric-chess-academy-and-studio
title: "Isometric Chess Academy & Studio"
track: Puzzles & Strategy
order: 11
words: 460
live: null
---

# Isometric Chess Academy & Studio

> A 2.5D isometric chess studio with a beginner blunder guard.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 460 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Isometric Chess Academy & Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 2.5D/3D Chess
web application named "Isometric Chess Academy & Studio" using vanilla
HTML5, CSS3, ES6 JavaScript, and HTML5 Canvas.

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source digital board game series
modeled after interactive academy studios (such as bilingual 3D chess
and strategy training environments). Its purpose is to combine smooth
2.5D isometric gameplay with robust beginner learning tools, real-time
coaching feedback, and zero external framework dependencies. It is
optimized for GitHub Pages deployment.

======================================================================
1. VISUAL & CANVAS RENDERING ENGINE (2.5D ISOMETRIC)
======================================================================
- Isometric Projection:
  * Render an 8x8 chessboard projected into 2.5D isometric view on HTML5 Canvas.
  * Tile Coordinates: Map screen clicks (mouse/touch) back to internal
    8x8 algebraic grid coordinates (A1 to H8).
- Visual Aesthetics:
  * Modern slate/wood board texture with clean depth side-walls and
    stylized vector piece sprites featuring soft drop-shadows.
  * Highlight States: Hover state (soft blue), selected piece tile
    (bright cyan #00E5FF), and valid move indicator dots (translucent emerald #00E676).

======================================================================
2. BEGINNER COACHING & INTERACTIVE ACADEMY STUDIO (NEW MODULE)
======================================================================
Provide a dedicated "Learning Mode / Academy" toggle panel in the UI:

- Interactive Piece Movement Inspector:
  * Clicking any piece brings up a side panel explaining its historical role,
    point value, and movement rules, while illuminating its valid paths
    on the board with animated pulse dots.
- Bilingual Strategic Coaching HUD:
  * Real-time bilingual (English / ภาษาไทย) feedback box offering gentle
    tactical reminders during casual play (e.g., "Control the center squares!",
    "Protect your king by castling early!").
- Smart "Undo & Learn" Blunder Guard:
  * Option to allow beginners to undo a disastrous move with an instant
    pop-up explanation of why the blunder occurred.
- Mini-Puzzle Drills Tab:
  * 5 built-in beginner puzzles ("Mate in 1", "Protect the Bishop")
    loaded directly from local JSON data structures.

======================================================================
3. GAME LOGIC & INTERACTION ENGINE
======================================================================
- Rule Implementation:
  * Full standard chess validation: pawn double-step, en passant,
    castling, and pawn promotion modal window.
  * Turn management (White vs. Black) with active visual HUD timer.
  * Interactive Move History sidebar displaying moves in Standard
    Algebraic Notation (SAN).

======================================================================
4. BILINGUAL HUD, AUDIO & LOCAL DATA PERSISTENCE
======================================================================
- Sound Effects:
  * Synthesized Web Audio API sound effects for moves, captures,
    and checks (no external audio assets required).
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

Source label in the supplied list: `Isometric Chess Academy & Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/isometric-chess-academy-and-studio>
