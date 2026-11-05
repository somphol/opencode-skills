#!/usr/bin/env node
// Copies the Wurlitzer Lullaby reference into a new project directory.
//
//   node scripts/scaffold.mjs ~/Projects/my-lullaby-jukebox
//   node scripts/scaffold.mjs ~/Projects/my-lullaby-jukebox --force
//
// The result is a working static app with the full release structure (tests,
// docs, manifest, state template). Screenshots are generated, not vendored:
// run `node scripts/screenshot.mjs` after the first boot.

import { cpSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const reference = resolve(here, '..', 'assets', 'reference');
const args = process.argv.slice(2);
const force = args.includes('--force');
const rawTarget = args.find((arg) => !arg.startsWith('--')) || '';
const target = resolve(rawTarget.replace(/^~/, process.env.HOME || '~'));

if (!rawTarget) {
  console.error('usage: node scripts/scaffold.mjs <target-directory> [--force]');
  process.exit(2);
}

if (existsSync(target) && readdirSync(target).length && !force) {
  console.error(`refusing to write into a non-empty directory: ${target}`);
  console.error('pass --force if that is really what you want');
  process.exit(1);
}

cpSync(reference, target, {
  recursive: true,
  filter: (source) => !source.split(/[\\/]/).includes('.git'),
});

// The catalog sync skips directories literally named `docs`; the reference keeps
// them as `documentation` so a scaffold can restore the standard `docs/` path.
const documentation = join(target, 'documentation');
if (existsSync(documentation) && !existsSync(join(target, 'docs'))) {
  renameSync(documentation, join(target, 'docs'));
}

const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, entry) => {
  if (entry.name.startsWith('.')) return n;
  return n + (entry.isDirectory() ? count(join(dir, entry.name)) : 1);
}, 0);

console.log(`Scaffolded the Wurlitzer Lullaby reference into ${target}`);
console.log(`  ${count(target)} files scaffolded`);
console.log('');
console.log('Next:');
console.log('  1. Rename the product in index.html, README.md, AGENTS.md and the sign texture.');
console.log('  2. Replace the eight note arrays and the archive manifest if the theme changes.');
console.log('  3. python3 -m http.server 8000  →  http://localhost:8000/');
console.log('  4. node scripts/screenshot.mjs   (regenerate assets/*.png; they are not vendored)');
console.log('  5. node --test tests/engine.test.mjs tests/static.test.mjs');
console.log('  6. node tests/browser.test.mjs');
console.log('  7. Update state.json, publish, then run the live suite with TEST_URL.');
