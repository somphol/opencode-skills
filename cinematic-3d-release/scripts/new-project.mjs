#!/usr/bin/env node
// Copy the reference project into a new directory and build it.
//
//   node scripts/new-project.mjs --out ~/my-project [--force]

import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const force = argv.includes('--force')
const out = opt('out')

if (!out) {
  console.error('Usage: new-project.mjs --out <dir> [--force]')
  process.exit(2)
}

const here = dirname(fileURLToPath(import.meta.url))
const asset = resolve(here, '..', 'assets', 'cube-lab')
const dest = resolve(process.cwd(), out)

if (!existsSync(asset)) {
  console.error(`Missing reference asset: ${asset}`)
  process.exit(1)
}
if (existsSync(dest) && readdirSync(dest).length > 0 && !force) {
  console.error(`${dest} is not empty. Pass --force to merge into it.`)
  process.exit(2)
}

mkdirSync(dest, { recursive: true })
cpSync(asset, dest, { recursive: true })

// The skill asset stores the reference docs as project-docs/ because catalog sync
// skips directories named docs/. Restore the normal layout for the scaffold.
const projectDocs = join(dest, 'project-docs')
if (existsSync(projectDocs) && !existsSync(join(dest, 'docs'))) {
  renameSync(projectDocs, join(dest, 'docs'))
}

const gitignore = join(dest, '.gitignore')
if (!existsSync(gitignore)) {
  writeFileSync(gitignore, '.DS_Store\nThumbs.db\nnode_modules/\n*.log\n_site/\n.env\n')
}
const nojekyll = join(dest, '.nojekyll')
if (!existsSync(nojekyll)) writeFileSync(nojekyll, '')

console.log(`Copied the reference project to ${dest}`)
console.log('Building index.html…')

const build = spawnSync('python3', ['build.py'], { cwd: dest, stdio: 'inherit' })
if (build.error) {
  console.error(`Could not run python3: ${build.error.message}`)
  process.exit(1)
}
if (build.status !== 0) {
  console.error(`Build failed with exit code ${build.status}`)
  process.exit(build.status ?? 1)
}

console.log(`
Next:
  cd ${dest}
  python3 -m http.server 8000
  open http://localhost:8000/index.html?selftest   # expect RESULT PASS

Then read references/method.md and adapt the presentation layer to your own subject.
Do not ship the CubeLab copy as-is; replace the subject, copy, and branding.
`)
