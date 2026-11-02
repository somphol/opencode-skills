#!/usr/bin/env node
// Validates a skill directory before publishing.
//
//   node scripts/check-skill.mjs <path-to-skill> [--strict]
//
// Exit codes: 0 ok, 1 problems found, 2 usage.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const dir = resolve(process.argv[2] ?? '.')
const strict = process.argv.includes('--strict')
const problems = []
const warnings = []

function walk(d) {
  const out = []
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) {
      if (['node_modules', 'dist', 'dist-single', 'shots', 'film', '.git'].includes(e.name)) {
        problems.push(`forbidden directory: ${p}`)
        continue
      }
      out.push(...walk(p))
    } else if (e.isFile()) out.push(p)
  }
  return out
}

const skillPath = join(dir, 'SKILL.md')
let text
try {
  text = readFileSync(skillPath, 'utf8')
} catch {
  console.error(`No SKILL.md in ${dir}`)
  process.exit(2)
}

const front = text.match(/^---\n([\s\S]*?)\n---/)
if (!front) problems.push('SKILL.md has no YAML frontmatter')
const field = (k) => front?.[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.trim()
const name = field('name')
const description = field('description')
if (!name) problems.push('frontmatter is missing `name`')
if (!description) problems.push('frontmatter is missing `description` (the skill will not be advertised)')
if (description && description.length < 20) warnings.push('description is very short; say when to use it')
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(basename(dir))) problems.push(`directory name "${basename(dir)}" is not lowercase kebab-case`)
if (basename(dir).length > 64) problems.push('directory name exceeds 64 characters')

const files = walk(dir)
const bytes = files.reduce((n, f) => n + statSync(f).size, 0)
if (files.length > 400) warnings.push(`${files.length} files — the catalog copies all of them`)
if (bytes > 20 * 1048576) warnings.push(`${(bytes / 1048576).toFixed(1)} MB — large for a skill`)

const TOKENS = [
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/, 'API key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS key'],
  [/\bglpat-[A-Za-z0-9_-]{20,}\b/, 'GitLab token'],
]
// Documentation quotes these shapes on purpose; only source and data files are scanned for them.
const DOC_ONLY = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b(?!git@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, 'email address'],
]
for (const file of files) {
  const rel = file.replace(dir + '/', '')
  if (/\.(png|jpg|jpeg|gif|webp|woff2?|ttf|zip|html)$/i.test(file)) continue
  if (/notices|licen[cs]e|copying/i.test(rel)) continue
  const isDoc = /\.(md|txt)$/i.test(file)
  if (statSync(file).size > 2 * 1048576) continue
  const body = readFileSync(file, 'utf8')
  for (const [re, label] of TOKENS) {
    if (re.test(body)) problems.push(`${label} found in ${rel}`)
  }
  if (isDoc) continue
  for (const [re, label] of DOC_ONLY) {
    if (re.test(body)) problems.push(`${label} found in ${rel}`)
  }
}

for (const p of problems) console.log(`FAIL ${p}`)
for (const w of warnings) console.log(`WARN ${w}`)
if (!problems.length) {
  console.log(
    `OK ${basename(dir)} — "${name}", ${files.length} files, ${(bytes / 1048576).toFixed(2)} MB`,
  )
}
process.exit(problems.length || (strict && warnings.length) ? 1 : 0)
