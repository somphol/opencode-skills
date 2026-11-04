# Verification

## The three layers

1. **Static** — files, links, version identity, i18n parity, pinned CDN, serialization policy, no
   secrets. Dependency-free Node.
2. **Rules** — an in-page `selfTest()` over the pure engine. 25 checks in Leab-Tui.
3. **Browser** — Chrome DevTools Protocol: boot, no exceptions, 3D tiles, a full round through the
   public API, undo, next round, reload resume, screenshots.

A green static check proves nothing about the game. A green rules suite proves nothing about the
scene. Run all three.

## Static check

`scripts/check.mjs` pattern:

- required file list (source, docs, screenshots, licence, templates);
- `node --check script.js`;
- parse the app version and compare README badge, changelog heading, state.json;
- assert the import map pins the Three version;
- assert storage keys and export filename;
- assert serialization strips the snapshot and converts hands/captures to IDs;
- assert scoring constants and combination list;
- parse both i18n dictionaries and compare key sets;
- walk every relative Markdown link and check the target exists;
- scan source/docs for token/private-key patterns;
- assert responsive breakpoints and reduced-motion support.

Exit 0/1, print `PASS n/n`.

## In-page self-test

`?selftest=1` runs after boot, writes a `<pre id="selftest-results">` and sets the title to
`SELFTEST PASS n/n`. Leab-Tui checks:

1. deck 32; 2. 16/16 colours; 3. copies 5/2/2/2/2/2/1; 4. hierarchy `7654321`;
5–10. single/pair/General-pair rejection/mixed-colour rejection/Soldier triple/five Soldiers;
11–14. big/small Sa Hoo and comparisons; 15–16. See Hoo duplicate and pair comparison;
17–18. Ngoh Hoo/Lak Hoo; 19–20. red beats black and equal-set rejection;
21. four hands of eight from 32 unique tiles; 22. scoring table; 23. simulated round conserves 32;
24. i18n symmetry; 25. export shape.

Keep the self-test **pure**. It must not need WebGL, the network or a user gesture.

## Fuzz the round

```js
function simulateRound(seed) {
  const rng = mulberry32(seed);
  // shuffle, deal 8 each, find the red General holder
  while (hands[0].length) {
    const lead = chooseLead(hands[leader], { jitter: false });
    // each follower sends exactly lead.count
    // reveal per chooseFollow deterministic
    // move tiles to the winner
  }
  return { tricks, capturesTotal: 32, left: 0 };
}
```

Assert `capturesTotal === 32` and every hand empty. This catches count drift, infinite loops and a
leader with no legal combination.

## CDP harness

Node 22+ has a global `WebSocket` and `fetch`; no Puppeteer required. The included
`scripts/browser-check.mjs`:

1. spawns Chrome headless with a temp profile and a random remote-debugging port;
2. polls `http://127.0.0.1:<port>/json/list` and connects to the **page** target (not `/json/version`,
   which is the browser target and rejects `Page.enable`);
3. enables `Page`, `Runtime`, `Log`, `Network`;
4. navigates, waits, evaluates with `awaitPromise: true, returnByValue: true`;
5. records `Runtime.exceptionThrown`, `Runtime.consoleAPICalled` and `Log.entryAdded`;
6. prints a JSON report and optionally captures a PNG;
7. supports `--eval`, `--eval2`, `--reload`, `--wait`, `--out`, `--width`, `--height`.

Chrome path: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS; override with
`CHROME_PATH`. On Linux, `/usr/bin/google-chrome` or `/usr/bin/chromium`.

### Harness traps

- **Wrong target.** `/json/version` gives the browser WebSocket; `Page.enable` fails. Use `/json/list`
  and pick `type === "page"`.
- **Custom eval results are not the default fields.** If your expression returns
  `{ok:true,...}`, print it under `evalValue`; otherwise the report shows only `url` and `events`.
- **Print after reload.** Build the report object, run the reload/eval2, then `console.log`.
- **Await the promise.** A bare async IIFE with `awaitPromise:false` returns a Promise object, not the
  data. Set `awaitPromise:true`.
- **Ignore platform noise.** macOS headless logs `CVDisplayLinkCreateWithCGDisplay failed` and
  `task_policy_set`—not app errors. Only `Runtime.exceptionThrown` is a failure.
- **Autoplay warnings are a smell.** `The AudioContext was not allowed to start` means you created it
  before a gesture. Fix the code, don't filter the warning.

## Flow tests

Use `window.App` (Leab-Tui exposes `window.LeabTui`) and `setFast(true)`:

- **Full round:** loop; when human leads, `hint()` then `lead(selected)`; when human follows, `hint()`,
  try `follow(selected, true)`, and if the hand did not shrink, `follow(selected, false)`. Stop at
  `roundEnd`/`matchEnd`; assert captures 32, hands 0, points sum 0.
- **Undo:** at `roundEnd`, record captures; `undo()`; wait; assert hands+captures+centre = 32 and stats
  rounds reverted.
- **Next round:** at `roundEnd`, record scores; `nextRound()`; assert round+1, 8 tiles each, scores
  preserved, total tiles 32.
- **Reload:** play mid-trick, `Page.reload`, wait, evaluate `getState()`; assert phase/turn/hands/centre
  and `localStorage` exist. Use `--reload --eval2`.
- **Match end:** `newMatch({target:1})`, play a round, assert `phase === "matchEnd"`, summary open,
  stats matches/wins/losses updated.

## Screenshots

- Use `?demo=1` to put the table in a real trick.
- Wait 16 s for deal + demo lead.
- `hint()` + `inspect(id)` for the inspector; wait 3.5 s for the hint toast to clear.
- Thai: `setLanguage('th')`, wait 3 s, then inspect/select.
- Rules: click `#rulesBtn`, wait 900 ms for the modal animation.
- Phone: 390×844, no eval.
- Convert PNG working files to JPG and ship only the JPGs.

Check the images yourself. A scene can pass every assertion and still be unreadable.

## Manual checks

- orbit, zoom, pan, reset, top, cinema;
- select/deselect via 3D and via chips;
- lead legal/illegal; follow with a beating set, a losing set, and no legal set;
- face-down never wins;
- winner leads next; active ring moves;
- undo explanation and confirm;
- language switch across every panel and the 3D labels;
- export download; reload resume;
- 1440×900, 1024×768, 390×844;
- keyboard `H`/`Esc`, reduced motion.

## CI

A static job is enough for a public repo:

```yaml
- run: node --check script.js
- run: node scripts/check.mjs
```

If the runner has Chrome, add `node scripts/verify.mjs` with `CHROME_PATH` set. Do not make a
flaky browser job a required check without a local reproduction.
