# Roadmap

## 1.0 — shipped

- 15 patterns, 15 pure engines, 15 procedural 3D scenes.
- Python / JavaScript / C++ listings with mark-synchronized highlighting.
- Custom input for every pattern with validating grammars.
- 30-question recognition quiz with explanations and local best.
- 61-problem practice tracker with difficulty/search filters and local checkboxes.
- Three-tab responsive UI, keyboard shortcuts, help/about dialogs.
- 27 engine, 20 static, 35 browser and 24 in-page checks (106 total).
- Release docs, screenshots, GitHub Pages.

## 1.1 — quality

- Add a value tooltip on hover for 3D nodes (raycast) without changing the step model.
- Persist the last frame per pattern (currently the pattern/language/speed persist, not the frame).
- Add an optional “compare two patterns” view for closely related signals (e.g. two pointers vs.
  sliding window).
- Improve label collision on 390 px: hide non-active node labels at very small stage sizes.
- Add more custom-input examples as one-click presets.

## 1.2 — curriculum depth

- A second canonical example per pattern (the current default is one example each).
- A “derive it” mode: hide the code, ask the learner to choose the next move in the scene.
- Quiz categories and a spaced-repetition queue over missed questions.
- Export/import practice progress as JSON.

## Explicit non-goals

- A code execution judge or hidden test runner.
- Accounts, cloud sync, analytics, ads.
- A generic graph editor or arbitrary JSON input.
- Copying premium content from Grokking/NeetCode/Blind 75.

Priorities are evaluated against the classroom use case: can a learner recognize the pattern and
explain the next move? If a feature does not improve that, it waits.
