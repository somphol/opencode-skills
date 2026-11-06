---
id: gutenberg-reader-studio-and-vocabulary-lab
title: "Gutenberg Reader Studio & Vocabulary Lab"
track: Language & Reading
order: 43
words: 402
live: null
---

# Gutenberg Reader Studio & Vocabulary Lab

> Project Gutenberg reading with Bionic mode, RSVP and an SRS word bank.

**Track:** Language & Reading · **Brief size:** M · **Words:** 402 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Gutenberg Reader Studio & Vocabulary Lab project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive web application named "Gutenberg Reader Studio & Vocabulary Lab" using vanilla HTML5, CSS3, and ES6 JavaScript, compatible with static read-only hosting (e.g., GitHub Pages).

The application must combine Project Gutenberg book discovery (via Gutendex API), customizable typography and color themes, toggleable 3D page-turning animations, Bionic Reading mode, RSVP Speed Reader, an integrated Word Learning Bank with SRS interval tracking, local progress file export/import, and ambient study sounds.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. ARCHITECTURE & FREE PUBLIC APIs:
----------------------------------------------------------------------
- Book Discovery API: Search and fetch curated classics from `https://gutendex.com/books/`.
- Text Fetching Engine: Parse plain-text book content with automatic header/license cleaning.
- Dictionary API: Double-clicking any word fetches phonetic audio and definitions from `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`.

----------------------------------------------------------------------
2. READER CUSTOMIZATION & DISPLAY ENGINE:
----------------------------------------------------------------------
- Visual & Theme Controls:
  * Font Family Selector: Georgia (Classic Serif), Inter (Clean Sans), OpenDyslexic (Accessibility).
  * Background Color Themes: Light Paper (#FBF9F5), Warm Sepia (#F4ECD8), Midnight Dark (#1E222A), OLED Black (#000000).
  * Sliders for Font Size (14px–32px) and Line Height (1.2x–2.2x).
- Advanced Reading Modes (Toggleable On/Off):
  * 3D Page-Turn Animation: Smooth CSS slide/curl transition vs. continuous vertical scroll.
  * Bionic Reading Mode: Auto-bolding prefix letters of words for faster visual scanning.
  * RSVP Speed Reader: Single-word focal point display (150 WPM to 500 WPM).
  * Teleprompter Auto-Scroll: Hands-free adjustable scrolling.
  * Ambient Soundscapes: HTML Web Audio generators for Rain, Cafe, and Fireplace ambience.

----------------------------------------------------------------------
3. WORD LEARNING BANK & SRS INTEGRATION:
----------------------------------------------------------------------
- One-Click Capture: Double-clicking or selecting any word opens a popup card with its definition and an "➕ Add to Word Bank" button.
- Context Sentence Extraction: Automatically captures the surrounding sentence from the book as an example note.
- SRS Vocabulary Studio Tab: Dedicated drawer listing captured words sorted by SRS status (New 🔴, Practicing 🟡, Mastered 🟢), review count, and timestamp math.

----------------------------------------------------------------------
4. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Local State Memory: Automatically saves active book ID, page number, scroll percentage, reader settings, notes, and Word Bank in localStorage.
- File Export/Import Sync:
  * "💾 Save Reading Library" button (downloads 'gutenberg_studio_state.json').
  * "📂 Load Reading Library" button allowing users to restore reading position, notes, and vocabulary on any device.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Gutenberg Reader Studio & Vocabulary Lab`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/gutenberg-reader-studio-and-vocabulary-lab>
