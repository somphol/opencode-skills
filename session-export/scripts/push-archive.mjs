#!/usr/bin/env node
// Pushes the archive to its private GitHub mirror, refusing any remote that is not private.
//
//   node scripts/push-archive.mjs [--remote origin] [--branch main] [--force] [--dry-run]
//
// The token is read from the git credential helper and never printed. The API check is what makes
// this safe: a repository can be flipped to public at any time, so the check happens every push.

import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const dryRun = argv.includes('--dry-run')
const force = argv.includes('--force')
const remote = opt('remote', 'origin')
const branch = opt('branch', 'main')

// Hard gate: nothing leaves this machine until every transcript is sanitized.
try {
  execFileSync('node', [join(dirname(fileURLToPath(import.meta.url)), 'check-archive.mjs'), '--archive', resolve(dirname(fileURLToPath(import.meta.url)), '..')], { stdio: 'inherit' })
} catch {
  fail('the archive is not fully sanitized (see check-archive.mjs)')
}

const git = (args, options = {}) => {
  const out = execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options })
  return out === null ? '' : out.trim()
}

function fail(message) {
  console.error(`refusing to push: ${message}`)
  process.exit(1)
}

let url
try {
  url = git(['remote', 'get-url', remote])
} catch {
  fail(`no git remote named "${remote}"`)
}

const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/)
if (!match) fail(`remote is not a GitHub repository: ${url}`)
const [, owner, repo] = match

const token =
  process.env.GITHUB_TOKEN ??
  execFileSync(
    'sh',
    ['-c', 'printf "protocol=https\\nhost=github.com\\n\\n" | git credential fill 2>/dev/null | sed -n "s/^password=//p"'],
    { encoding: 'utf8' },
  ).trim()

if (!token) fail('no GitHub credential available (git credential fill returned nothing)')

const response = execFileSync(
  'curl',
  ['-s', '-H', `Authorization: Bearer ${token}`, '-H', 'Accept: application/vnd.github+json', `https://api.github.com/repos/${owner}/${repo}`],
  { encoding: 'utf8' },
)

let data
try {
  data = JSON.parse(response)
} catch {
  fail('could not read the GitHub API response')
}

if (data.message) fail(`GitHub API said: ${data.message}`)
if (data.private !== true) fail(`${owner}/${repo} is PUBLIC — the archive must stay private`)

console.log(`${owner}/${repo} is private (${data.visibility ?? 'private'}).`)

// Keep the mirror's description accurate without touching anything else.
execFileSync(
  'curl',
  [
    '-s', '-o', '/dev/null', '-X', 'PATCH',
    '-H', `Authorization: Bearer ${token}`,
    '-H', 'Accept: application/vnd.github+json',
    `https://api.github.com/repos/${owner}/${repo}`,
    '-d', JSON.stringify({ description: 'Private backup mirror of a sanitized OpenCode transcript archive. Local directory is the master copy.' }),
  ],
  { stdio: 'ignore' },
)

if (dryRun) {
  console.log('dry run: not pushing')
  process.exit(0)
}

git(['push', ...(force ? ['--force'] : []), remote, `HEAD:${branch}`], { stdio: 'inherit' })
console.log(`pushed ${branch} to ${owner}/${repo}`)
