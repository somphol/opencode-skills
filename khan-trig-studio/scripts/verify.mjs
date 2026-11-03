#!/usr/bin/env node
/**
 * Verify a scaffolded Khan Trig project.
 *
 *   node scripts/verify.mjs <project-dir> [--static-only]
 *
 * Runs scripts/check.mjs, then scripts/browser-check.mjs unless --static-only.
 * Browser check needs Node 22+ and Chrome/Chromium.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const targetArg = process.argv[2]
if (!targetArg) {
  console.error('Usage: verify.mjs <project-dir> [--static-only]')
  process.exit(2)
}
const target = resolve(targetArg.replace(/^~/, process.env.HOME ?? '~'))
const staticOnly = process.argv.includes('--static-only')

if (!existsSync(target)) {
  console.error(`No such directory: ${target}`)
  process.exit(2)
}
if (!existsSync(`${target}/scripts/check.mjs`)) {
  console.error(`${target} does not look like a scaffolded trig studio.`)
  process.exit(2)
}

function run(label, args) {
  console.log(`\n== ${label} ==`)
  execFileSync(process.execPath, args, { cwd: target, stdio: 'inherit' })
}

run('static checks', ['scripts/check.mjs'])
if (!staticOnly) run('browser acceptance', ['scripts/browser-check.mjs'])
console.log('\nverification complete')
