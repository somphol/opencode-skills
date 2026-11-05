#!/usr/bin/env node
// Copies the reference implementation into a new project directory.
//
//   node scripts/scaffold.mjs ~/Projects/my-lucky-draw
//   node scripts/scaffold.mjs ~/Projects/my-lucky-draw --force
//
// The result is a working static app: index.html, style.css, script.js, assets.
// It is a starting point, not a finished release — replace the sample names,
// product copy, links and documentation.

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const reference = resolve(here, '..', 'assets', 'reference');
const args = process.argv.slice(2);
const force = args.includes('--force');
const target = resolve((args.find((arg) => !arg.startsWith('--')) || '').replace(/^~/, process.env.HOME || '~'));

if (!target || target === resolve('')) {
  console.error('usage: node scripts/scaffold.mjs <target-directory> [--force]');
  process.exit(2);
}

if (existsSync(target) && readdirSync(target).length && !force) {
  console.error(`refusing to write into non-empty directory: ${target}`);
  console.error('pass --force if that is really what you want');
  process.exit(1);
}

mkdirSync(join(target, 'assets'), { recursive: true });
mkdirSync(join(target, 'docs'), { recursive: true });
mkdirSync(join(target, 'tests', 'lib'), { recursive: true });
mkdirSync(join(target, 'scripts'), { recursive: true });

for (const file of ['index.html', 'style.css', 'script.js']) {
  cpSync(join(reference, file), join(target, file));
}
for (const file of ['favicon.svg', 'og-card.png']) {
  cpSync(join(reference, 'assets', file), join(target, 'assets', file));
}

console.log(`Scaffolded the Lucky Draw reference into ${target}`);
console.log('');
console.log('Next:');
console.log('  1. Change the product name, sample roster, presets and palette.');
console.log('  2. python3 -m http.server 8000  →  http://localhost:8000/');
console.log('  3. Add tests/engine.test.mjs, tests/static.test.mjs and tests/browser.test.mjs');
console.log('     (copy the reference project or write them from the skill references).');
console.log('  4. Run ?selftest, then the browser suite with a mock-keychain Chrome.');
console.log('  5. Replace README.md, AGENTS.md, docs/ and state.json before publishing.');
