#!/usr/bin/env node
// Rebuilds the catalog: copies each skill from its local source, then writes index.json.
//
//   node sync.mjs                     # sync every entry in skills.json
//   node sync.mjs city-miniature      # sync one (index.json still lists all)
//   node sync.mjs --check             # verify the tree matches the index, write nothing
//   node sync.mjs --preview           # preview build of every skill that differs from index.json
//   node sync.mjs --preview <name>    # preview build of one skill, even if unchanged
//   node sync.mjs --check --preview   # verify the preview build is current
//
// index.json is what OpenCode reads when this repository's Pages URL is added to `skills`.
// preview/index.json is the same schema for a test channel; its versions are prefixed "p-".

import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)))
const MANIFEST = JSON.parse(readFileSync(join(ROOT, 'skills.json'), 'utf8'))
const PREVIEW = join(ROOT, 'preview')
const SKIP = new Set(['node_modules', 'dist', 'dist-single', 'shots', 'film', '.git', '.DS_Store'])

// Skip a top-level docs/ folder, but keep docs nested inside a skill reference.
const skipEntry = (name, rel) => SKIP.has(name) || (name === 'docs' && !rel.includes('/'))

const args = process.argv.slice(2)
const check = args.includes('--check')
const preview = args.includes('--preview')
const only = args.find((a) => !a.startsWith('--'))

function walk(dir, base = dir, rel = '') {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name
    if (skipEntry(entry.name, childRel) || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, base, childRel))
    else if (entry.isFile()) out.push(relative(base, full))
  }
  return out.sort()
}

function hashFiles(dir, files) {
  const h = createHash('sha256')
  for (const f of files) h.update(f).update(readFileSync(join(dir, f)))
  return h.digest('hex')
}

function copySkill(src, dest) {
  rmSync(dest, { recursive: true, force: true })
  cpSync(src, dest, {
    recursive: true,
    filter: (p) => {
      const rel = relative(src, p)
      if (!rel) return true
      return !skipEntry(rel.split('/').pop(), rel)
    },
  })
}

function describe(skill) {
  const src = resolve(skill.source.replace(/^~/, process.env.HOME ?? '~'))
  if (!existsSync(src)) throw new Error(`missing source for ${skill.name}: ${src}`)
  if (!existsSync(join(src, 'SKILL.md'))) throw new Error(`${skill.name}: source has no SKILL.md`)
  const files = walk(src)
  return { skill, src, files, version: hashFiles(src, files).slice(0, 12) }
}

function readIndex(file) {
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf8')).skills ?? []
}

function build() {
  const entries = []
  for (const skill of MANIFEST.skills) {
    try {
      const { src, files, version } = describe(skill)
      const dest = join(ROOT, skill.name)
      if (!check && (!only || only === skill.name)) copySkill(src, dest)
      const size = files.reduce((n, f) => n + statSync(join(src, f)).size, 0)
      entries.push({ name: skill.name, version, description: skill.description, license: skill.license ?? 'see repository', files })
      if (!only || only === skill.name) {
        console.log(`${skill.name.padEnd(20)} ${files.length} files  ${(size / 1048576).toFixed(2)} MB  v${version}`)
      }
    } catch (error) {
      console.error(String(error.message ?? error))
      process.exitCode = 1
    }
  }
  return entries
}

const current = readIndex(join(ROOT, 'index.json'))

if (preview) {
  const targets = only
    ? MANIFEST.skills.filter((s) => s.name === only)
    : MANIFEST.skills.filter((s) => {
        try {
          const entry = current.find((e) => e.name === s.name)
          return !entry || entry.version !== describe(s).version
        } catch (error) {
          console.error(String(error.message ?? error))
          process.exitCode = 1
          return true
        }
      })
  if (only && targets.length === 0) {
    console.error(`unknown skill: ${only}`)
    process.exit(1)
  }

  const entries = []
  const built = []
  for (const skill of targets) {
    try {
      const { src, files, version } = describe(skill)
      built.push({ name: skill.name, version, files, description: skill.description, license: skill.license ?? 'see repository' })
      entries.push({ name: skill.name, version: `p-${version}`, description: skill.description, license: skill.license ?? 'see repository', files })
      console.log(`preview ${skill.name.padEnd(22)} v${version}`)
    } catch (error) {
      console.error(String(error.message ?? error))
      process.exitCode = 1
    }
  }

  const indexPath = join(PREVIEW, 'index.json')
  const buildPath = join(PREVIEW, 'BUILD.json')
  let dirty = false
  let commit = 'unknown'
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
    dirty = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim().length > 0
  } catch {
    /* not a git checkout */
  }

  if (check) {
    const previous = readIndex(indexPath)
    const same = JSON.stringify(previous) === JSON.stringify(entries)
    console.log(same ? `preview is current (${entries.length} skill(s))` : 'preview is stale')
    process.exitCode = same ? 0 : 1
  } else if (entries.length === 0) {
    rmSync(PREVIEW, { recursive: true, force: true })
    console.log('preview: nothing differs from index.json, removed stale preview/')
  } else {
    mkdirSync(PREVIEW, { recursive: true })
    for (const skill of MANIFEST.skills.filter((s) => built.some((b) => b.name === s.name))) {
      copySkill(resolve(skill.source.replace(/^~/, process.env.HOME ?? '~')), join(PREVIEW, skill.name))
    }
    writeFileSync(indexPath, `${JSON.stringify({ name: 'OpenCode skills by somphol (preview)', skills: entries }, null, 2)}\n`)
    writeFileSync(
      buildPath,
      `${JSON.stringify(
        { channel: 'preview', base: 'https://somphol.github.io/opencode-skills/preview/', commit, dirty, builtAt: new Date().toISOString(), skills: entries.map((e) => e.name) },
        null,
        2,
      )}\n`,
    )
    console.log(`\npreview/index.json written: ${entries.length} skill(s) at commit ${commit}${dirty ? ' (dirty tree)' : ''}`)
  }
} else {
  const entries = build()
  if (check) {
    const same = JSON.stringify(current) === JSON.stringify(entries)
    console.log(same ? 'index.json is current' : 'index.json is stale')
    process.exitCode = same ? 0 : 1
  } else {
    writeFileSync(
      join(ROOT, 'index.json'),
      `${JSON.stringify({ name: 'OpenCode skills by somphol', skills: entries }, null, 2)}\n`,
    )
    console.log(`\nindex.json written: ${entries.length} skill(s)`)
  }
}
