---
id: cyberdoom-retro-3d-shooter-studio
title: "CyberDoom: Retro 3D Shooter Studio"
track: Games & Arcade
order: 39
words: 406
live: null
---

# CyberDoom: Retro 3D Shooter Studio

> A 1990s-style FPS arena with billboard enemies and a marine HUD.

**Track:** Games & Arcade · **Brief size:** M · **Words:** 406 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this CyberDoom: Retro 3D Shooter Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "CyberDoom: Retro 3D First-Person Shooter Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN: https://cdnjs.cloudflare.com/api/libs/three.js/r128/three.min.js with PointerLockControls).

The application must be a 100% client-side retro first-person shooter inspired by classic 1990s 3D engines (e.g., Doom / Wolfenstein 3D), running smoothly on static hosting like GitHub Pages with zero backend server dependency.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D RETRO ENGINE & VIEWPORT SYSTEM:
----------------------------------------------------------------------
- 3D Grid Dungeon / Arena: Construct a modular labyrinth level using textured/colored 3D wall blocks, concrete floors, and ceiling planes.
- Camera Controls: FPS navigation using PointerLockControls (Mouse lock to look around, WASD / Arrow keys to walk, Spacebar to jump or interact).
- Billboard Sprites: Render enemy guards/cyborgs and pickup items as 2D billboarded sprites in 3D space that automatically rotate to face the camera.
- Low-Poly Retro Aesthetic: Dark sci-fi atmospheric lighting, muzzle flash dynamic point lights, and retro pixelated canvas overlay.

----------------------------------------------------------------------
2. COMBAT & ENEMY AI GAMEPLAY LOOP:
----------------------------------------------------------------------
- Weapon Mechanics:
  * Weapon HUD Overlay (Plasma Gun / Super Shotgun) at bottom center with animated weapon recoil/sway when moving or firing.
  * Raycast Shot Verification: Primary click casts an instant hit-scan ray toward enemies, inflicting damage with particle hit sparks.
- Enemy State-Machine AI:
  * Enemies patrol/idle until player enters line-of-sight distance.
  * Attack mode: Enemies move toward player coordinates and fire projectiles, deducting player health on hit.
- Sound Synthesizer (Web Audio API): Procedurally generate retro synth sound effects for gunshots, enemy growls, item pickups, hit damage, and victory chimes.

----------------------------------------------------------------------
3. RETRO STATUS BAR HUD & PROGRESS SAVE ENGINE:
----------------------------------------------------------------------
- Classic Status Bar HUD: Bottom panel displaying Health %, Armor %, Ammo Counter, Score, and an animated retro Marine Face Portrait that changes expression based on player health.
- Local Data Persistence: Automatically save current level, ammo, score, and kill stats into browser localStorage.
- Local File Export/Import Sync:
  * "💾 Save Game State": Downloads 'cyberdoom_save.json'.
  * "📂 Load Game State": Restores game progress and high scores across any device.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Retro Sci-Fi Industrial Arcade UI (stark neon green/crimson status text, dark slate frame, full-screen viewport focus).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `CyberDoom: Retro 3D First-Person Shooter Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/cyberdoom-retro-3d-shooter-studio>
