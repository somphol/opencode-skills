#!/usr/bin/env node
/**
 * Copy the Wanderlust 3D starter into a new directory.
 *
 *   node scripts/scaffold.mjs ~/Projects/my-atlas
 *
 * Refuses to overwrite a non-empty directory.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(skillRoot, 'assets', 'wanderlust-3d-starter');
const targetArg = process.argv[2];

if (!targetArg) {
  console.error('Usage: node scripts/scaffold.mjs <target-directory>');
  process.exit(1);
}

const target = resolve(targetArg.replace(/^~/, process.env.HOME || '~'));

if (existsSync(target)) {
  const stats = statSync(target);
  if (!stats.isDirectory()) {
    console.error(`Target exists and is not a directory: ${target}`);
    process.exit(1);
  }
  if (readdirSync(target).length > 0) {
    console.error(`Target is not empty: ${target}`);
    console.error('Choose a new directory or empty it first.');
    process.exit(1);
  }
} else {
  mkdirSync(target, { recursive: true });
}

cpSync(source, target, { recursive: true });
console.log(`Scaffolded Wanderlust 3D → ${target}`);
console.log('');
console.log('Next:');
console.log('  cd ' + target);
console.log('  npm install');
console.log('  npm run serve');
console.log('  npm run verify');
console.log('');
console.log('Then replace data.js and the region palette, and write your own docs.');
