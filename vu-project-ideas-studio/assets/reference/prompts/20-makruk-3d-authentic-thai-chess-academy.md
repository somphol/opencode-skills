---
id: makruk-3d-authentic-thai-chess-academy
title: "Makruk 3D: Authentic Thai Chess Academy"
track: Puzzles & Strategy
order: 20
words: 603
live: null
---

# Makruk 3D: Authentic Thai Chess Academy

> Authentic Makruk pieces, an AI opponent and beginner move assist.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 603 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Makruk 3D: Authentic Thai Chess Academy project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D/2.5D web application named "Makruk 3D: Authentic Thai Chess Academy & Beginner Studio" (หมากรุกไทย 3 มิติ) using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN with OrbitControls) to render authentic, culturally accurate 3D Makruk pieces and an 8x8 carved wooden board.

The application must feature authentic procedural 3D piece modeling (LatheGeometry & custom vector extrusion), an instant Language Switcher (English ⇄ Thai), a toggleable "Beginner Move Assist Mode" showing valid move dots, an interactive Piece Glossary detailing traditional silhouettes, Single Player vs AI Bot or 2-Player Pass & Play modes, Web Audio API sound synthesis, and local match JSON save/load.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. AUTHENTIC 3D PROCEDURAL PIECE MODELING SPECIFICATIONS:
----------------------------------------------------------------------
The agent must generate precise 3D procedural meshes for traditional Makruk pieces so that players familiar with physical sets instantly recognize them:
- ♔ **Khun (ขุน - King / Lord)**:
  * *Modeling*: Use Three.js `LatheGeometry` with a profile curve creating a wide bell-shaped base, a tapered waist, a flared upper collar, and a tiered royal crown topped with a sharp finial point.
- ♕ **Met (เม็ด - Queen / Seed)**:
  * *Modeling*: Use `LatheGeometry` forming a compact, rounded seed/bud silhouette (smaller than the King, smooth curved dome profile).
- ♗ **Khon (โคน - Nobleman / Stupa / Bishop)**:
  * *Modeling*: Use `LatheGeometry` styled after a traditional Thai stupa or lotus bud (ทรงเจดีย์) featuring multiple decorative horizontal collar rings and a tapered pointed tip.
- ♘ **Ma (ม้า - Horse / Knight)**:
  * *Modeling*: Constructed using custom extruded geometry or layered box/cylinder geometries forming an iconic Thai carved horse head silhouette with an arched neck, prominent snout, and textured mane.
- ♖ **Ruea (เรือ - Boat / Rook)**:
  * *Modeling*: Styled as a traditional Thai longboat hull (เรือยาว) with elongated bow and stern sweep profiles, rendered via custom shape extrusion.
- ♙ **Bia & Bia Ngua (เบี้ย - Cowrie Shell Pawn & Flipped Pawn)**:
  * *Modeling (Bia)*: A flattened dome shape resembling an overturned cowrie shell (เบี้ยจั่น).
  * *Modeling (Bia Ngua)*: The same cowrie shell shape inverted with a hollowed concave center or distinct golden inlay ring on top to clearly indicate promotion.

----------------------------------------------------------------------
2. GAME MODES & BILINGUAL UI (EN ⇄ TH):
----------------------------------------------------------------------
- Game Mode Selector:
  * "Single Player vs AI Bot (เล่นกับบอท AI)" – Play White against a heuristic Black AI bot.
  * "Local 2-Player Pass & Play (ผู้เล่น 2 คน ผลัดกันเล่น)" – Two human players alternate turns.
- Instant Language Switcher (EN / TH Toggle):
  * Instantly updates all UI headers, piece names, rule tooltips, and modal overlays without interrupting the match.

----------------------------------------------------------------------
3. BEGINNER TUTOR & ASSIST MECHANICS:
----------------------------------------------------------------------
- BEGINNER MOVE ASSIST MODE (Toggle Switch - เปิด/ปิด ตัวช่วยผู้เล่นใหม่):
  * Clicking any piece renders glowing translucent green target dots on all valid destination squares and red target rings on capturable enemy pieces.
  * Interactive Tutor Bar displays piece name (EN & TH), movement summary, and legal move count.
- Interactive Piece Glossary Modal ("📖 Rules & Pieces / คู่มือและวิธีเล่น"):
  * Visual cards detailing traditional Makruk names, phonetic pronunciations, historical lore, and 3D visual descriptions.

----------------------------------------------------------------------
4. DATA PERSISTENCE, AUDIO & EXPORT:
----------------------------------------------------------------------
- Browser Storage & JSON File Sync: Auto-saves game state to browser `localStorage`. "💾 Save Match" downloads `makruk_save.json`; "📂 Load Match" restores active matches.
- Web Audio API Sound Synthesizer: Synthesizes wooden piece placement thuds, capture clicks, check warnings, and victory fanfares.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Makruk 2.5D: Thai Chess Academy & Beginner Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/makruk-3d-authentic-thai-chess-academy>
