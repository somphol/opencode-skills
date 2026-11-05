#!/usr/bin/env node
// Creates a runnable 3D puzzle project from the reference snapshot.
//
//   node scripts/scaffold.mjs ~/Projects/my-puzzle-studio
//   node scripts/scaffold.mjs ../my-puzzle --name "My 3D Sliding Puzzle" --force
//
// The result is the shipped v1.0.0 implementation, ready to serve. Read
// references/ENGINE.md before changing the engine contract.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, '..');
const REF = join(SKILL, 'assets', 'reference');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const nameIndex = args.indexOf('--name');
const productName = nameIndex >= 0 ? args[nameIndex + 1] : 'My 3D Puzzle Studio';

if (!positional[0] || !productName) {
  console.error('usage: node scripts/scaffold.mjs <target-dir> [--name "Product Name"] [--force]');
  process.exit(2);
}

const target = resolve(positional[0]);
if (existsSync(target) && readdirSync(target).length && !flags.has('--force')) {
  console.error(`refusing to write into non-empty directory: ${target} (use --force)`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
for (const entry of ['index.html', 'style.css', 'script.js']) {
  cpSync(join(REF, entry), join(target, entry));
}
cpSync(join(REF, 'tests'), join(target, 'tests'), { recursive: true });
cpSync(join(HERE, 'verify-browser.mjs'), join(target, 'scripts', 'verify-browser.mjs'));
mkdirSync(join(target, 'docs'), { recursive: true });
for (const doc of ['REPRODUCTION.md', 'SOLVER.md']) {
  cpSync(join(REF, doc), join(target, 'docs', doc));
}
mkdirSync(join(target, 'assets'), { recursive: true });
mkdirSync(join(target, 'scripts'), { recursive: true });

// Rename the visible product (ids, storage keys and class names stay stable).
const htmlPath = join(target, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
html = html.replaceAll('Full 3D 15-Puzzle Studio &amp; Auto-Solver', escapeHtml(productName));
html = html.replaceAll('Full 3D 15-Puzzle Studio & Auto-Solver', escapeHtml(productName));
html = html.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${escapeHtml(productName)}</h1>`);
writeFileSync(htmlPath, html);

// The runtime title lives in the i18n dictionary, so rename it there too.
const jsPath = join(target, 'script.js');
const js = readFileSync(jsPath, 'utf8').replaceAll(
  "'meta.title': 'Full 3D 15-Puzzle Studio & Auto-Solver'",
  `'meta.title': ${JSON.stringify(productName)}`
);
writeFileSync(jsPath, js);

writeFileSync(
  join(target, 'README.md'),
  `# ${productName}

Scaffolded from the **3D Puzzle Solver Studio** reference implementation on ${new Date().toISOString().slice(0, 10)}.

A tactile 4×4 sliding puzzle with a parity-checked shuffle and an A* auto-solver
(Manhattan + linear conflicts, Web Worker), bilingual EN/TH UI, local records and JSON export.
No backend, no build step.

## Run

\`\`\`sh
python3 -m http.server 8000
# http://localhost:8000/  ·  http://localhost:8000/?selftest
\`\`\`

## Verify

\`\`\`sh
node --test tests/engine.test.mjs
node scripts/verify-browser.mjs http://localhost:8000/
\`\`\`

## Next steps

1. Read \`AGENTS.md\` and \`docs/REPRODUCTION.md\`.
2. Change the board size, copy, colours or skins deliberately.
3. Add the static and browser suites from the origin project before calling it a release.
4. Generate screenshots and write your own docs; do not ship the origin's images.
`
);

writeFileSync(
  join(target, 'AGENTS.md'),
  `# AGENTS.md

## What it is

${productName}: a static 3D 4×4 sliding puzzle. Three source files, no build step. Three.js is pinned
in the import map. The solver is A* with Manhattan + linear conflicts in a Blob Web Worker.

## Commands

| Task | Command |
| --- | --- |
| Serve | \`python3 -m http.server 8000\` |
| Engine tests | \`node --test tests/engine.test.mjs\` |
| Boot check | \`node scripts/verify-browser.mjs http://localhost:8000/\` |
| Self-test | \`http://localhost:8000/?selftest\` |

## Architecture

- \`index.html\` — shell, HUD, modals, import map.
- \`style.css\` — tokens, layout, stage, responsive rules.
- \`script.js\` — engine (markers) → i18n/state → platform → studio → controller → solver client → UI.
- Engine is a pure factory stringified into the Worker. \`solve()\` returns tile numbers.
- \`state.solved\` stays false after reset. Persistence keys are \`p15.*\`.

## Known limits

- Optimal A* is budgeted; the weighted fallback is labelled near-optimal.
- Custom images are session-only.
- The scaffold ships only the engine test; add static/browser suites before release.
`
);

writeFileSync(
  join(target, 'state.json'),
  JSON.stringify(
    {
      project: productName,
      release: '0.1.0',
      status: 'scaffold',
      session: { note: 'Fill from the OpenCode session database at release time.' },
      usage: { note: 'Fill at release time; cache reads dominate the total.' },
      deployment: { status: 'unpublished' },
      credits: { tool: 'OpenCode', engine: 'Three.js 0.169.0 (MIT)', license: 'MIT' },
    },
    null,
    2
  ) + '\n'
);

writeFileSync(join(target, 'docs', 'README.md'), '# Documentation\n\n- [Reproduction blueprint](REPRODUCTION.md)\n- [Solver notes](SOLVER.md)\n');
writeFileSync(join(target, '.nojekyll'), '');

console.log(`scaffolded ${productName} → ${target}`);
console.log('next:');
console.log(`  cd ${target}`);
console.log('  node --test tests/engine.test.mjs');
console.log('  python3 -m http.server 8000');
console.log('  node <skill>/scripts/verify-browser.mjs http://localhost:8000/');

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
