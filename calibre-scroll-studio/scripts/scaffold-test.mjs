#!/usr/bin/env node
// Prove the template by scaffolding it into a temp directory.
//
//   node scripts/scaffold-test.mjs          # copy + structural checks (fast)
//   node scripts/scaffold-test.mjs --run    # copy + npm install + npm run verify
//   node scripts/scaffold-test.mjs --run --keep
//
// --run needs network for npm install and Chrome for the release gate.

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const run = process.argv.includes('--run');
const keep = process.argv.includes('--keep');

const dest = mkdtempSync(join(tmpdir(), 'calibre-scroll-test-'));
console.log(`Scaffolding into ${dest}`);

try {
  execFileSync(process.execPath, [join(HERE, 'new-project.mjs'), '--out', dest, '--force'], {
    stdio: 'inherit',
  });

  const required = [
    'index.html',
    'styles.css',
    'src/main.js',
    'src/watch.js',
    'src/environment.js',
    'scripts/verify.mjs',
    'scripts/state.mjs',
    'vendor/three.module.min.js',
    'fonts/bodoni-moda-latin.woff2',
    'fonts/OFL.txt',
    'package.json',
  ];
  const missing = required.filter((file) => !existsSync(join(dest, file)));
  if (missing.length) {
    console.error(`Missing template files: ${missing.join(', ')}`);
    process.exitCode = 1;
  }

  for (const forbidden of ['node_modules', 'state.json', 'STATE.md', '.git']) {
    if (existsSync(join(dest, forbidden))) {
      console.error(`Forbidden entry in template: ${forbidden}`);
      process.exitCode = 1;
    }
  }

  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    });
  const files = walk(dest).filter((file) => !file.endsWith('.DS_Store'));
  const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
  console.log(`Template: ${files.length} files, ${(bytes / 1048576).toFixed(2)} MB`);

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  if (run) {
    console.log('\nInstalling dev dependencies…');
    execSync('npm install', { cwd: dest, stdio: 'inherit' });
    console.log('\nRunning the 24-check gate…');
    execSync('npm run verify', { cwd: dest, stdio: 'inherit' });
    console.log('\nScaffold test passed.');
  } else {
    console.log('\nStructural checks passed. Add --run to install and execute the gate.');
  }
} finally {
  if (!keep) {
    rmSync(dest, { recursive: true, force: true });
    console.log(`Removed ${dest}`);
  }
}
