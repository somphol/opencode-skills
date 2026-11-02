#!/usr/bin/env node
// Rebuilds the catalog: copies each skill from its local source, then writes index.json.
//
//   node sync.mjs                     # sync every entry in skills.json
//   node sync.mjs city-miniature      # sync one
//   node sync.mjs --check             # verify the tree matches the index, write nothing
//
// index.json is what OpenCode reads when this repository's Pages URL is added to `skills`.

import { createHash } from 'node:crypto'
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)))
const MANIFEST = JSON.parse(readFileSync(join(ROOT, 'skills.json'), 'utf8'))
const SKIP = new Set(['node_modules', 'dist', 'dist-single', 'shots', 'film', '.git', '.DS_Store', 'docs'])

const args = process.argv.slice(2)
const check = args.includes('--check')
const only = args.find((a) => !a.startsWith('--'))

function walk(dir, base = dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, base))
    else if (entry.isFile()) out.push(relative(base, full))
  }
  return out.sort()
}

function hashFiles(dir, files) {
  const h = createHash('sha256')
  for (const f of files) h.update(f).update(readFileSync(join(dir, f)))
  return h.digest('hex')
}

const entries = []
let changed = 0

for (const skill of MANIFEST.skills) {
  if (only && only !== skill.name) continue
  const src = resolve(skill.source.replace(/^~/, process.env.HOME ?? '~'))
  const dest = join(ROOT, skill.name)
  if (!existsSync(src)) {
    console.error(`missing source for ${skill.name}: ${src}`)
    process.exitCode = 1
    continue
  }
  if (!existsSync(join(src, 'SKILL.md'))) {
    console.error(`${skill.name}: source has no SKILL.md`)
    process.exitCode = 1
    continue
  }
  if (!check) {
    rmSync(dest, { recursive: true, force: true })
    cpSync(src, dest, { recursive: true, filter: (p) => !SKIP.has(p.split('/').pop()) })
  }
  const files = walk(dest)
  const version = hashFiles(dest, files).slice(0, 12)
  entries.push({
    name: skill.name,
    version,
    description: skill.description,
    license: skill.license ?? 'see repository',
    files,
  })
  const size = files.reduce((n, f) => n + statSync(join(dest, f)).size, 0)
  console.log(`${skill.name.padEnd(20)} ${files.length} files  ${(size / 1048576).toFixed(2)} MB  v${version}`)
  changed++
}

if (check) {
  const current = JSON.parse(readFileSync(join(ROOT, 'index.json'), 'utf8'))
  const same = JSON.stringify(current.skills) === JSON.stringify(entries)
  console.log(same ? 'index.json is current' : 'index.json is stale')
  process.exitCode = same ? 0 : 1
} else {
  writeFileSync(
    join(ROOT, 'index.json'),
    `${JSON.stringify({ name: 'OpenCode skills by somphol', skills: entries }, null, 2)}\n`,
  )
  console.log(`\nindex.json written: ${entries.length} skill(s), ${changed} synced`)
}
