# FAQ

### What is this, exactly?

A searchable library of 54 project briefs with one-click copy-ready prompts. It is a catalog, not an
app generator. You copy a prompt into a coding agent; the agent builds the project.

### Who is it for?

University students, self-taught developers and anyone who wants a substantial practice project with a
real specification instead of a one-line idea. The briefs assume an agent that can write code and read
documentation.

### Why 54 when the original list had 55?

Nexus 2035 appeared twice, identically. The catalog keeps one. See
[`PROVENANCE.md`](PROVENANCE.md).

### Can I copy a prompt without the request prefix?

Yes. Open a brief and press **Copy brief only**. The Markdown files also contain the full prompt with
the prefix; remove it if you have your own workflow.

### Why does the prefix ask for a state file and a skill?

Because the original request did. It makes the agent record how long the build took, how many tokens it
used, and what the next agent needs to know. It is a deliberate release discipline, not a requirement
for every project. Drop it if you only want the app.

### Why does the prompt say “entire game” for non-games?

It is the supplied wording, kept verbatim in the shared prefix. The task body makes the actual artifact
clear. You can edit the prefix after copying.

### Can I edit a brief?

Yes, after you copy it. Please do not open a pull request that rewrites the canonical brief; the
catalog's contract is verbatim task bodies. Typo fixes in the wrapper or UI are welcome.

### Why are only two cards marked Live?

Those are the only briefs in the supplied list with a public demo URL. The other 52 are
specifications, not deployed apps. A Live badge is not a quality rating.

### Does search look inside the briefs?

Yes. Search tokens match the title, tagline, track, stack, features and the full task body, so
“rip current”, “SSA” or “Khan” all work. All tokens must match (AND).

### Where is my shortlist stored?

In `localStorage` under `vu.favorites.v1`, on your device. It is not synced, and clearing site data
removes it. See [`PRIVACY.md`](PRIVACY.md).

### How do I add a brief?

Add a block to `data/source.json`, add metadata under the same number, run `python3 scripts/build.py`,
then `npm run verify`. Full steps in [`REPRODUCTION.md`](REPRODUCTION.md).

### Why no server-side search or database?

The whole catalog is ~280 KB. A backend would add cost, privacy surface and a deploy dependency for no
user-visible gain at this size.

### Why does the site look different in dark mode?

It is a separate palette, not an inversion. Track colours are lightened for contrast on the dark paper.
Both palettes are in `assets/style.css`.

### Can I use this in a course?

Yes, under the MIT licence for code and documentation. The briefs were supplied for this catalog; if
you redistribute them in a course pack, keep the attribution and do not imply the linked third-party
products endorse the course.

### Why is there a `state.json` in the repository?

The request asked for a record of elapsed time, token consumption and model credit. It is also a
useful handoff: the next agent can see what was verified and where it was deployed.

### Something is broken. Where do I report it?

<https://github.com/somphol/vu_project_ideas/issues>. Include the brief id, browser, viewport and what
you expected. Do not include credentials or personal data.
