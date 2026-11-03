# Verification

Run these checks before calling a reproduction or a release done. The browser self-test is
the contract for the cube; the build check is the contract for the generated file; the
manual matrix covers what a headless check cannot.

## 1. Build

```sh
cd <project>
python3 build.py
```

The generated `index.html` must exist and be non-trivial.

## 2. Generated file is committed

```sh
git diff --exit-code -- index.html
```

If this fails, the generated file is stale. Rebuild, review the diff, and commit it.

## 3. Browser self-test

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/index.html?selftest>. It must report:

```text
RESULT    PASS
```

The reference self-test covers:

- 18 face moves and 9 slice moves against the visual cube.
- A mixed sequence and visual/logical sync.
- Drag-direction mapping.
- Cinematic UI presence and camera viewpoints.
- Step UI and the Step gate.
- Layer glow on and off.
- A full solver run on a mixed state.

If it fails, stop. The page writes details into `<pre id="selftest">` and sets
`document.body.dataset.selftest`.

## 4. Debug API

Open `?debug` and use `window.__cubeLab`:

```js
__cubeLab.state()
__cubeLab.move("R")
__cubeLab.sequence(["R", "U", "R'"])
__cubeLab.reset()
__cubeLab.scramble()
__cubeLab.solve()
__cubeLab.autoSolve()
__cubeLab.setSpeed("step")
__cubeLab.screenPoint("F", 1, 1)
```

`?noworker` forces the main-thread solver. Use it when a worker bug is suspected.

## 5. Manual matrix

| Area | Check |
| --- | --- |
| Desktop | Chrome, Safari, Firefox, Edge: render, drag, orbit, zoom, dock, keyboard |
| Tablet | Portrait/landscape: reflow, touch drag, pinch zoom |
| Phone | 320–390 px: controls fit, no horizontal overflow, safe-area padding |
| Solver | First run, later runs, `?noworker`, Reset during solve |
| Playback | Slow/Medium/Fast/Step, pause/resume, Next, Space, N, speed change mid-solve |
| Auto Solve | Scramble-then-solve, camera framing, glow, Take control, Esc, reduced motion |
| State | Reload, reset, undo, scramble, victory, best |
| Accessibility | Keyboard-only, focus rings, Esc, reduced motion |
| Docs | Local Markdown links resolve, YAML templates parse |

## 6. Optional headless browser check

If Chrome is available, a headless self-test is useful:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --no-sandbox --enable-unsafe-swiftshader \
  --use-gl=angle --use-angle=swiftshader \
  --user-data-dir=/tmp/cinematic-check \
  --virtual-time-budget=60000 \
  --dump-dom "http://localhost:8000/index.html?selftest" \
  > /tmp/selftest.html
grep -o "RESULT    PASS" /tmp/selftest.html
```

This is environment-dependent; do not make it the only release gate unless CI has a
WebGL-capable browser.

## 7. Skill verification

For the skill package itself:

```sh
node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs \
  ~/.config/opencode/skills/cinematic-3d-release
```

A fresh scaffold must build without edits:

```sh
node scripts/new-project.mjs --out /tmp/cinematic-try
cd /tmp/cinematic-try
python3 build.py
node <skill>/scripts/verify.mjs --project /tmp/cinematic-try
```

## 8. Docs checks

```sh
# local links
python3 - <<'PY'
import re, pathlib
root = pathlib.Path('.').resolve()
missing = []
for path in root.rglob('*.md'):
    if '.git' in path.parts:
        continue
    for match in re.finditer(r'\[[^\]]*\]\(([^)]+)\)', path.read_text()):
        target = match.group(1).split('#', 1)[0]
        if target.startswith(('http://', 'https://', 'mailto:', '#')) or not target:
            continue
        if not (path.parent / target).resolve().exists():
            missing.append((str(path), target))
print(missing or 'all local links resolve')
PY

# YAML
ruby -e 'require "yaml"; ARGV.each { |p| YAML.load_file(p); puts "ok #{p}" }' \
  .github/workflows/build.yml .github/ISSUE_TEMPLATE/*.yml
```
