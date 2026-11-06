---
id: voa-newsroom-500-words-esl-studio
title: "VOA Newsroom: 500 Words ESL Studio"
track: Language & Reading
order: 46
words: 689
live: null
---

# VOA Newsroom: 500 Words ESL Studio

> A newsroom-themed VOA vocabulary studio with five activities.

**Track:** Language & Reading · **Brief size:** L · **Words:** 689 · **Read:** ~4 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this VOA Newsroom: 500 Words ESL Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive multi-file web application named "VOA Newsroom: 500 Words ESL Studio" designed to run seamlessly from a read-only static HTML web server (e.g., GitHub Pages).

The application must feature client-side state management, local progress file export/import (zero database required), a Spaced Repetition System (SRS) with timestamp math, live VOA Learning English RSS news fetching, native browser Speech APIs, and 5 distinct word learning activities.

Provide the complete, un-truncated source code organized into three distinct code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. ARCHITECTURE & READ-ONLY DEPLOYMENT:
----------------------------------------------------------------------
- Client-Side Execution: Designed to run entirely in the browser from a read-only host with zero backend server dependencies.
- Local Data Persistence & Portability:
  * Store active progress in browser localStorage.
  * Provide a "💾 Save Progress File" button that serializes state and downloads a 'voa_learning_progress.txt' file.
  * Provide an "📂 Load Progress File" button with an HTML file input handler that parses and restores user progress from any saved file.

----------------------------------------------------------------------
2. SPACED REPETITION SYSTEM (SRS) & TIMESTAMP ENGINE:
----------------------------------------------------------------------
- Data Schema Per Word:
  * `status`: "New" (default), "Practicing", or "Mastered".
  * `lastReviewed`: ISO timestamp string recorded automatically upon any interactive session.
  * `reviewCount`: Integer tracking total successful reviews.
  * `nextReviewDue`: Target ISO timestamp calculated via expanding SRS intervals:
    - Level 1 (New / 1st review): +1 day
    - Level 2 (Practicing / 2nd-3rd review): +3 days
    - Level 3 (Reviewing / 4th-5th review): +7 days
    - Level 4 (Mastered / 6+ reviews): +30 days
- Smart Queue ("Due Today 🔔"): A dedicated dashboard view that automatically filters and displays words whose `nextReviewDue` timestamp is less than or equal to the current system time.

----------------------------------------------------------------------
3. LIVE VOA RSS NEWS FEED INTEGRATION:
----------------------------------------------------------------------
- Live Feed Fetching: In script.js, fetch real-time news items from public VOA Learning English RSS feeds using an RSS-to-JSON client fetch endpoint (`https://api.rss2json.com/v1/api.json?rss_url=https://learningenglish.voanews.com/api/`).
- Dynamic Context Matching:
  * When a user selects a target word, scan recent live VOA headlines and snippets for matches.
  * If found, display a glowing "🔴 LIVE VOA NEWS" badge alongside the live article headline, highlighting the target word and providing a direct link to the original VOA story.
  * Hybrid Fallback: If no match is found in current RSS feeds, fall back to the embedded journalistic headline template inside the script.

----------------------------------------------------------------------
4. FIVE (5) DISTINCT WORD LEARNING ACTIVITIES:
----------------------------------------------------------------------
Include tabbed activity switching inside the active workspace:

1. "Anchor Read-Aloud" (Speech Production):
   - Displays a live or template VOA news headline featuring the target word.
   - Student clicks "🎤 Report Live" to read the headline using native `webkitSpeechRecognition`.
   - Evaluates spoken accuracy, provides visual checkmark feedback, and updates the SRS timestamp upon success.

2. "Newsroom Listening Desk" (Auditory Decoding):
   - Plays native browser TTS (`SpeechSynthesisUtterance`) at selectable speeds (0.5x Slow, 0.8x ESL, 1.0x Normal) without revealing the written text.
   - Student listens and types the word into a dictation field to test ear-to-spelling recognition.

3. "Copy Editor Challenge" (Contextual Recall):
   - Displays a news headline with the target word omitted (blanked out).
   - Student selects or types the correct VOA vocabulary word to complete the article.

4. "Speed Match Ticker" (Rapid Semantic Association):
   - A fast-paced 60-second exercise matching 5 VOA words to their definitions under a ticking newsroom clock.

5. "Syllable & Phonetic Explorer" (Phonological Awareness):
   - Displays target words broken into clear visual syllable chunks (e.g., ne-go-ti-ate /nəˈɡoʊ.ʃi.eɪt/).
   - Interactive syllable playback to master stress patterns and pronunciation breakdown.

----------------------------------------------------------------------
5. DIGITAL NEWSDESK UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Professional digital news desk layout (navy/slate accents, crisp typography, glassmorphism overlays, responsive grid layout, color-coded badges).
- Header HUD: Displays Reporter Rank (Intern ➔ Field Journalist ➔ Senior Editor ➔ Anchor), progress bar (% of 500 words mastered), daily streak counter, and Progress Export/Import buttons.
- Category Grid Drawers: Tabs for World Politics, Business & Economy, Science & Tech, and Culture displaying word cards with live SRS status indicators (🔴 New, 🟡 Practicing, 🟢 Mastered, 🔔 Due).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `VOA Newsroom 500 Words`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/voa-newsroom-500-words-esl-studio>
