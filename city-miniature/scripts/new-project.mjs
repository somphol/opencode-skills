#!/usr/bin/env node
// Copies the San Francisco diorama template into a new project folder.
//
//   node scripts/new-project.mjs --out my-miniature [--name my-miniature]
//
// Exit codes: 0 created, 1 IO error (a folder this run created is removed), 2 invalid input.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const TEMPLATE = join(SKILL, 'assets', 'san-francisco-diorama')
const SKIP = new Set(['node_modules', 'dist', 'dist-single', 'shots', 'film', '.DS_Store'])
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

function copyTree(src, dst) {
  let n = 0
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const from = join(src, entry.name)
    const to = join(dst, entry.name)
    if (entry.isDirectory()) {
      mkdirSync(to, { recursive: true })
      n += copyTree(from, to)
    } else if (entry.isFile()) {
      copyFileSync(from, to)
      n++
    }
  }
  return n
}

const argv = process.argv.slice(2)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
}

const out = opt('out')
if (!out) {
  console.error('Usage: node scripts/new-project.mjs --out <dir> [--name <package-name>]')
  process.exit(2)
}
const dir = resolve(out)
const existed = existsSync(dir)
if (existed && readdirSync(dir).length > 0) {
  console.error(`The folder ${out} exists and is not empty. Choose a new or empty folder.`)
  process.exit(2)
}
const name = opt('name') ?? basename(dir)
if (!NAME_RE.test(name)) {
  console.error(`Invalid package name "${name}": use lowercase letters, digits and hyphens.`)
  process.exit(2)
}

try {
  mkdirSync(dir, { recursive: true })
  const files = copyTree(TEMPLATE, dir)
  for (const file of ['package.json', 'package-lock.json']) {
    const path = join(dir, file)
    const json = JSON.parse(readFileSync(path, 'utf8'))
    json.name = name
    if (json.packages?.['']) json.packages[''].name = name
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
  }
  console.log(`Created ${out} (${files} files). Next: cd ${out} && npm ci && npm run dev`)
} catch (error) {
  if (!existed) rmSync(dir, { recursive: true, force: true })
  console.error(`Could not copy the project: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
}
