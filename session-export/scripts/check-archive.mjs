#!/usr/bin/env node
// Verifies that every transcript in the archive is sanitized.
//
//   node scripts/check-archive.mjs [--archive ~/opencode-transcripts] [--verbose]
//
// Exit codes: 0 all clean, 1 violations found, 2 nothing to check.
//
// This is the gate that runs before an archive is pushed anywhere. It is deliberately independent of
// the exporter: it re-reads the files on disk and looks for what a scrubber is supposed to remove.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const verbose = argv.includes('--verbose')
const archive = resolve(opt('archive', join(process.env.HOME ?? process.cwd(), 'opencode-transcripts')))
const sessions = join(archive, 'sessions')

let files
try {
  files = readdirSync(sessions).filter((f) => f.endsWith('.md'))
} catch {
  console.error(`No sessions directory at ${sessions}`)
  process.exit(2)
}
if (!files.length) {
  console.error('The archive has no transcripts to check.')
  process.exit(2)
}

/** Patterns that must never survive an export. */
const FORBIDDEN = [
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/, 'GitHub token'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/, 'API key'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS key'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google key'],
  [/\bglpat-[A-Za-z0-9_-]{20,}\b/, 'GitLab token'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, 'JWT'],
  [/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/, 'private key'],
  [/\b(?!git@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, 'email address'],
  [/\/Users\/[A-Za-z0-9._-]+/, 'home directory path'],
  [/\b(?!127\.0\.0\.1\b)(?!0\.0\.0\.0\b)(?!(?:10|127)\.)(?!192\.168\.)(?!172\.(?:1[6-9]|2\d|3[01])\.)(?:\d{1,3}\.){3}\d{1,3}\b/, 'public IP address'],
]

const problems = []
let clean = 0

for (const name of files) {
  const path = join(sessions, name)
  const body = readFileSync(path, 'utf8')

  if (!/^sanitized:\s*true\s*$/m.test(body)) {
    problems.push(`${name}: front matter does not say sanitized: true (raw export)`)
    continue
  }

  let bad = false
  for (const [re, label] of FORBIDDEN) {
    const m = body.match(re)
    if (m) {
      problems.push(`${name}: ${label} survived — "${m[0].slice(0, 24)}…"`)
      bad = true
    }
  }
  if (!bad) clean++
  else if (verbose) console.log(`scanned ${name} (${(statSync(path).size / 1024).toFixed(0)} KB)`)
}

for (const p of problems) console.log(`FAIL ${p}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s) across ${files.length} transcripts. Re-export before pushing.`)
  process.exit(1)
}
console.log(`${files.length} transcripts, all sanitized.`)
