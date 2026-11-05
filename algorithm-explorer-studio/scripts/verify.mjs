#!/usr/bin/env node
// Prove the skill: scaffold into a temp directory and run the Node gates.
//
//   node scripts/verify.mjs                 # temp dir, engine + static
//   node scripts/verify.mjs --browser       # also run the 35-check Chrome suite
//   node scripts/verify.mjs --out /tmp/try --keep
//
// Exit code is non-zero on any failure.

import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const outFlag = process.argv.indexOf('--out');
const keep = process.argv.includes('--keep');
const browser = process.argv.includes('--browser');
const target = outFlag >= 0 ? process.argv[outFlag + 1] : mkdtempSync(join(tmpdir(), 'algo-skill-'));
const fresh = outFlag < 0;

function run(label, command, args, cwd) {
  console.log(`\n▶ ${label}\n  ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`✖ ${label} failed (${result.status})`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
}

try {
  run('Scaffold', process.execPath, [join(HERE, 'new-project.mjs'), '--out', target, '--force'], HERE);
  if (!existsSync(join(target, 'index.html'))) throw new Error('scaffold did not produce index.html');
  run('Engine and static gates', process.execPath, ['--test', 'tests/engine.test.mjs', 'tests/static.test.mjs'], target);
  if (browser) run('Browser gate', process.execPath, ['tests/browser.test.mjs'], target);
  console.log(`\nSkill verified: ${target}`);
} finally {
  if (fresh && !keep) rmSync(target, { recursive: true, force: true });
}
