#!/usr/bin/env node
// Scaffold Algorithm Explorer Studio from the reference implementation.
//
//   node scripts/new-project.mjs --out ~/Projects/my-algorithm-explorer
//   node scripts/new-project.mjs --out /tmp/try --force
//
// The template is self-contained: no npm install, no build.

import { cpSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, '..', 'assets', 'reference');

function arg(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const out = arg('out');
const force = process.argv.includes('--force');
const help = process.argv.includes('--help') || process.argv.includes('-h');

if (help || !out) {
  console.log('Usage: node scripts/new-project.mjs --out <directory> [--force]');
  process.exit(help ? 0 : 1);
}

if (!existsSync(TEMPLATE)) {
  console.error(`Template missing: ${TEMPLATE}`);
  process.exit(1);
}

const destination = resolve(out.replace(/^~(?=$|\/)/, process.env.HOME || '~'));
if (existsSync(destination)) {
  const entries = readdirSync(destination).filter((entry) => entry !== '.DS_Store');
  if (entries.length && !force) {
    console.error(`Destination is not empty: ${destination}\nUse --force to overwrite files.`);
    process.exit(1);
  }
  if (force && entries.length) {
    for (const entry of entries) {
      if (entry === '.git') continue;
      rmSync(join(destination, entry), { recursive: true, force: true });
    }
  }
}

cpSync(TEMPLATE, destination, {
  recursive: true,
  filter: (source) => {
    const name = source.split('/').pop();
    if (name === '.git' || name === '.DS_Store' || name === 'node_modules') return false;
    if (statSync(source).isFile() && statSync(source).size > 8_000_000) return false;
    return true;
  }
});

console.log(`Scaffolded Algorithm Explorer Studio -> ${destination}`);
console.log('');
console.log('Next:');
console.log(`  cd ${destination}`);
console.log('  python3 -m http.server 8080       # open http://localhost:8080/');
console.log('  node --test tests/engine.test.mjs tests/static.test.mjs');
console.log('  node tests/browser.test.mjs       # Node 22+, Chrome');
console.log('');
console.log('Edit js/data.js first, then js/algorithms.js and js/scene.js.');
console.log('Replace state.json with your own build record before publishing.');
