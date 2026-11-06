---
id: outbreak-3d-rogue-survival
title: "Outbreak 3D: Rogue Survival"
track: Games & Arcade
order: 9
words: 531
live: null
---

# Outbreak 3D: Rogue Survival

> A first-person zombie wave shooter with rogue-lite perk drafting.

**Track:** Games & Arcade · **Brief size:** M · **Words:** 531 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Outbreak 3D: Rogue Survival project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, highly addictive 3D First-Person Zombie Survival Shooter web application named "Outbreak 3D: Rogue Survival" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is a zero-cost, static client-side 3D arcade zombie shooter designed for instant play in modern web browsers via GitHub Pages. It leverages Three.js WebGL rendering, first-person PointerLock controls, procedural spatial audio via Web Audio API, and a deep rogue-lite perk system to maximize replayability.

======================================================================
1. 3D RENDERER, CONTROLS & GRAPHICS (THREE.JS)
======================================================================
- First-Person Engine & Controls:
  * Implement Three.js PointerLockControls for full 360-degree mouse look
    and WASD + Space (Jump) movement.
  * Crosshair overlay in center HUD with dynamic recoil bloom when firing.
- Environment Scene:
  * Atmospheric 3D Map: Dark post-apocalyptic city compound with abandoned
    barricades, flickering street lamps, volumetric fog, and rain effects.
  * Lighting: Directional moonlight, ambient dark glow, and dynamic red/orange
    point lights attached to muzzle flashes and explosions.
- Zombie Swarm Engine:
  * Render multiple enemy types using 3D geometric mesh structures:
    1. Walkers (Slow, medium health, green eye glow).
    2. Runners (Fast, low health, red eye glow).
    3. Brutes (Giant, high health, pounding ground melee).
    4. Spitters (Ranged acid projectiles, yellow eye glow).
  * Smooth mesh movement toward the player position with simple pathing/collision separation.

======================================================================
2. CORE COMBAT & "GAME FEEL" JUICE
======================================================================
- Weapons System:
  * Weapon Arsenal: Pistol (Infinite ammo), Shotgun (Wide spread, high knockback),
    Assault Rifle (Rapid fire), and Grenade Launcher (Area-of-effect blast).
  * 3D Weapon Models attached to camera with realistic recoil sway animations.
- Impact & Visual Juice:
  * Particle Effects: Muzzle flashes, impact spark particles on walls, and
    directional red particle bursts (blood splatter) on zombie hits.
  * Camera Camera-Shake on explosions and heavy weapon hits.
  * Animated floating damage numbers popping off hit zombies.

======================================================================
3. ROGUE-LITE PERK DRAFTING & WAVE PROGRESSION
======================================================================
- Wave System:
  * Endless escalating zombie waves with HUD wave banner ("WAVE 1 CLEARED").
- End-of-Wave Perk Upgrade Modal:
  * Clearing a wave opens a sleek semi-transparent draft overlay offering
    3 randomly selected perk cards:
    - ⚡ Rapid Reload (+30% reload speed).
    - 💥 Piercing Rounds (Bullets pass through 2 zombies).
    - 🩸 Vampiric Touch (Recover 2 HP per zombie kill).
    - 💣 Death Explosion (Zombies explode on death dealing AOE damage).
    - 🏃 Adrenaline Rush (+20% movement speed).
    - 🛡️ Armor Plating (+50 Max Shield).

======================================================================
4. HUD, BILINGUAL TRANSLATION & SOUND ENGINE
======================================================================
- Web Audio API Sound Effects (Zero External Files):
  * Synthesized audio for gunshots (noise buffer), reload clicks, zombie
    groans, explosion rumbles, hit-marker ticks, and wave victory stings.
- HUD Elements:
  * Health/Shield Bar, Active Ammo Counter, Weapon Selector Wheel, Minimap,
    Wave Counter, and Kill Streak HUD.
- Bilingual Support (EN ⇄ TH Toggle):
  * Instantly translates all HUD labels, perk card descriptions, and game-over
    stats between English and Thai (ภาษาไทย).
- Local Data Persistence:
  * Auto-saves high scores, total zombie kills, and unlocked perks to browser
    localStorage. Includes "💾 Export Save Data JSON" button.

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

Source label in the supplied list: `Outbreak 3D: Rogue Survival`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/outbreak-3d-rogue-survival>
