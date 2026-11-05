#!/usr/bin/env node
// Copy the shipped Cute3D reference into a new project folder.
//
//   node scripts/scaffold.mjs ~/Projects/my-animal-studio
//   node scripts/scaffold.mjs ./demo --force
//
// The reference contains the app only. Docs, tests and screenshots are built
// by following the checklists in references/VERIFY.md and references/RELEASE.md.

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REFERENCE = resolve(HERE, '..', 'assets', 'reference');
const args = process.argv.slice(2);
const force = args.includes('--force');
const targetArg = args.find((arg) => !arg.startsWith('--'));

if (!targetArg) {
  console.error('Usage: node scripts/scaffold.mjs <target-dir> [--force]');
  process.exit(1);
}

if (!existsSync(REFERENCE)) {
  console.error(`Reference not found at ${REFERENCE}`);
  process.exit(1);
}

const target = resolve(targetArg);

if (existsSync(target) && readdirSync(target).length > 0 && !force) {
  console.error(`Refusing to write into a non-empty folder: ${target}`);
  console.error('Pass --force to overwrite.');
  process.exit(1);
}

mkdirSync(target, { recursive: true });
cpSync(REFERENCE, target, { recursive: true });

console.log(`✓ Cute3D scaffolded at ${target}`);
console.log('\nNext:');
console.log('  1. python3 -m http.server 4173 (or npm start after adding package.json)');
console.log('  2. Read references/RIGS.md before changing faces or proportions.');
console.log('  3. Add tests/docs/state from references/VERIFY.md and RELEASE.md.');
console.log('  4. Original characters only — no third-party mascots or model files.');
