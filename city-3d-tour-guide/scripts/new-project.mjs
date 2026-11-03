#!/usr/bin/env node
// Scaffold a city tourist guide from the working Bangkok reference.
//
//   node scripts/new-project.mjs --out ~/Projects/my-city [--force]

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const outIndex = argv.indexOf('--out');
const out = outIndex >= 0 ? argv[outIndex + 1] : undefined;
const force = argv.includes('--force');
if (!out) {
  console.error('Usage: new-project.mjs --out <directory> [--force]');
  process.exit(2);
}

const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(skill, 'assets', 'bangkok-3d-tour-guide');
const dest = resolve(out.replace(/^~/, process.env.HOME ?? '~'));

if (!existsSync(source)) {
  console.error(`Reference asset missing: ${source}`);
  process.exit(1);
}

if (existsSync(dest) && readdirSync(dest).length > 0) {
  if (!force) {
    console.error(`${dest} is not empty. Choose a new directory or pass --force to replace it.`);
    process.exit(1);
  }
  rmSync(dest, { recursive: true, force: true });
}
mkdirSync(dest, { recursive: true });
cpSync(source, dest, { recursive: true });

console.log(`Created ${dest}
Reference: Bangkok 3D (MIT). The runtime is index.html + style.css + script.js.

Next:
  cd ${dest}
  python3 -m http.server 8000
  open http://127.0.0.1:8000/
  open 'http://127.0.0.1:8000/?selftest=1'

  node ${join(skill, 'scripts', 'check.mjs')} --project ${dest}

For a different city, author a new CITY.md and replace geography, landmarks, route, copy and tests
together. Do not simply rename Bangkok.`);
