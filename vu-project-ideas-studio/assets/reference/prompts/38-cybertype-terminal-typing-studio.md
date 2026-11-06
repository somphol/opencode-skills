---
id: cybertype-terminal-typing-studio
title: "CyberType: Terminal Typing Studio"
track: Language & Reading
order: 38
words: 355
live: null
---

# CyberType: Terminal Typing Studio

> A retro terminal trainer for prose, code and math symbols.

**Track:** Language & Reading · **Brief size:** S · **Words:** 355 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this CyberType: Terminal Typing Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive web application named "CyberType: Terminal Typing & Code Speed Studio" using vanilla HTML5, CSS3, and ES6 JavaScript, compatible with static read-only hosting like GitHub Pages.

The application must be a client-side retro terminal typing speed trainer optimized for non-technical university students. It must support multiple text modes (Prose, HTML/JS Code, Math Formulas), real-time WPM/Accuracy metrics, Web Audio mechanical keyboard sounds, key error heatmaps, and local JSON progress file export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. TYPING ENGINE & KEYSTROKE LOGIC:
----------------------------------------------------------------------
- Input Listener System: Capture keyboard events without relying on visible input boxes, maintaining smooth cursor placement across text lines.
- Text Content Modes:
  * 📜 Classic Prose (Literary & Science History Excerpts)
  * 💻 Developer Code (HTML, CSS, ES6 JS, CPlusPlus snippets)
  * 🧮 Math & Symbols (LaTeX equations, brackets, operators, special characters)
- Real-Time Feedback: Highlight completed characters in neon green, active cursor in pulsing white, and errors in flashing neon red with retro glitch shake.

----------------------------------------------------------------------
2. REAL-TIME METRICS & AUDIO SYNTHESIZER:
----------------------------------------------------------------------
- Live Performance HUD:
  * WPM (Net Words Per Minute based on 5 chars/word standard)
  * Accuracy % (Correct vs. Incorrect Keystrokes)
  * Time Remaining / Elapsed Timer (30s, 60s, 120s modes)
  * Key Error Matrix (Tracks problematic keys to generate targeted weakness drills)
- Procedural Mechanical Switch Audio (Web Audio API):
  * Synthesize audio click sounds for keystrokes (Blue Tactile, Red Linear, Green Clicky) using oscillator frequency bursts.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Store personal best WPM, accuracy records, completed session logs, and key weakness heatmaps in localStorage.
- Local File Sync:
  * "💾 Save Typing Stats": Downloads 'cybertype_stats.json'.
  * "📂 Load Typing Stats": Restores WPM history and custom user drill settings across devices.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Retro Hacker CRT Terminal (dark obsidian background, green/cyan glow typography, CRT scanline overlay toggle, responsive layout).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `CyberType: Terminal Typing & Code Speed Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/cybertype-terminal-typing-studio>
