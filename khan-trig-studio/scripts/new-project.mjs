#!/usr/bin/env node
/**
 * Scaffolds a new Khan Trig Companion studio from the Unit 4 reference.
 *
 *   node scripts/new-project.mjs --out ~/Projects/khan-trig-unit5 \
 *     --unit 5 --title "Unit 5 Advanced Identities Studio" \
 *     --slug khan-trig-unit5 --owner somphol
 *
 * Options:
 *   --out     destination directory (required)
 *   --unit    unit number, default 5
 *   --title   English studio title, default "Trigonometry Studio"
 *   --title-th Thai studio title
 *   --slug    repository name, default basename(out)
 *   --owner   GitHub owner, default YOUR_GITHUB_USER
 *   --force   replace an existing non-empty directory
 */
import {
  cpSync, existsSync, mkdirSync, readdirSync, readFileSync,
  renameSync, rmSync, statSync, writeFileSync
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const asset = join(root, 'assets', 'unit4-studio')
const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const force = argv.includes('--force')
const out = opt('out')
if (!out) {
  console.error('Usage: new-project.mjs --out <dir> [--unit 5] [--title "…"] [--slug name] [--owner user] [--force]')
  process.exit(2)
}

const dest = resolve(out.replace(/^~/, process.env.HOME ?? '~'))
const unit = String(opt('unit', '5'))
const title = opt('title', 'Trigonometry Studio')
const titleTh = opt('title-th', 'ห้องปฏิบัติการตรีโกณมิติ')
const slug = opt('slug', basename(dest))
const owner = opt('owner', 'YOUR_GITHUB_USER')

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Invalid slug "${slug}": lowercase kebab-case.`)
  process.exit(2)
}
if (!existsSync(asset)) {
  console.error(`Reference asset missing: ${asset}`)
  process.exit(1)
}
if (existsSync(dest) && readdirSync(dest).length > 0) {
  if (!force) {
    console.error(`${dest} is not empty. Pass --force to replace it.`)
    process.exit(2)
  }
  rmSync(dest, { recursive: true, force: true })
}
mkdirSync(dest, { recursive: true })
cpSync(asset, dest, { recursive: true })

const projectDocs = join(dest, 'project-docs')
const docs = join(dest, 'docs')
if (existsSync(projectDocs)) {
  if (existsSync(docs)) rmSync(docs, { recursive: true, force: true })
  renameSync(projectDocs, docs)
}

const OLD_SLUG = 'khan-trig-unit4-equations-identities-studio'
const OLD_TITLE = 'Equations & Identities Studio'
const OLD_TITLE_TH = 'ห้องปฏิบัติการสมการและเอกลักษณ์'
const OLD_UNIT = 'Unit 4'
const OLD_UNIT_TH = 'ยูนิต 4'
const newGithub = `https://github.com/${owner}/${slug}`
const newRaw = `https://raw.githubusercontent.com/${owner}/${slug}`
const newPages = `https://${owner}.github.io/${slug}`

// Accept either "Advanced Identities Studio" or "Unit 5 Advanced Identities
// Studio" without doubling the unit in titles or the state file.
const studioName = title.replace(/^Unit\s+\d+\s*/i, '').trim() || title
const studioNameTh = titleTh.replace(/^ยูนิต\s+\d+\s*/, '').trim() || titleTh
const fullTitle = `Unit ${unit} ${studioName}`
const oldFull = `${OLD_UNIT} ${OLD_TITLE}`
const oldFullHtml = `${OLD_UNIT} ${OLD_TITLE.replace('&', '&amp;')}`

const replacements = [
  [`https://github.com/somphol/${OLD_SLUG}`, newGithub],
  [`https://raw.githubusercontent.com/somphol/${OLD_SLUG}`, newRaw],
  [`https://somphol.github.io/${OLD_SLUG}`, newPages],
  [OLD_SLUG, slug],
  [`~/Projects/${OLD_SLUG}`, `~/Projects/${slug}`],
  [oldFullHtml, fullTitle],
  [oldFull, fullTitle],
  [OLD_TITLE.replace('&', '&amp;'), studioName],
  [OLD_TITLE, studioName],
  [OLD_UNIT_TH, `ยูนิต ${unit}`],
  [OLD_UNIT, `Unit ${unit}`],
  [OLD_TITLE_TH, studioNameTh]
]

const TEXT_FILE = /\.(html|css|js|mjs|md|json|cff|yml|yaml|txt)$/i
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.isFile() && TEXT_FILE.test(entry.name)) {
      let body = readFileSync(full, 'utf8')
      for (const [from, to] of replacements) body = body.split(from).join(to)
      writeFileSync(full, body)
    }
  }
}
walk(dest)

// Reset the reference release version; the new project has no release yet.
const readmePath = join(dest, 'README.md')
if (existsSync(readmePath)) {
  writeFileSync(readmePath, readFileSync(readmePath, 'utf8').replaceAll('**Version 1.0.2**', '**Version 1.0.0**'))
}
const citationPath = join(dest, 'CITATION.cff')
if (existsSync(citationPath)) {
  writeFileSync(citationPath, readFileSync(citationPath, 'utf8').replace(/^version: 1\.0\.2$/m, 'version: 1.0.0'))
}

// Restore the dotfiles that the catalog sync intentionally omits.
writeFileSync(join(dest, '.nojekyll'), '')
writeFileSync(join(dest, '.editorconfig'), `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.yml]
indent_size = 2

[*.{html,css,js,mjs}]
indent_size = 2
`)
writeFileSync(join(dest, '.gitignore'), `.DS_Store
Thumbs.db
*.log
`)

// Hidden directories are not listed by the catalog index, so the scaffold
// recreates the GitHub templates and CI workflow for catalog installs.
const githubDir = join(dest, '.github')
mkdirSync(join(githubDir, 'ISSUE_TEMPLATE'), { recursive: true })
mkdirSync(join(githubDir, 'workflows'), { recursive: true })
writeFileSync(join(githubDir, 'CODEOWNERS'), `# Default owner for everything in the repository.
* @${owner}
`)
writeFileSync(join(githubDir, 'PULL_REQUEST_TEMPLATE.md'), `## Summary

<!-- What changes, and which learner problem does it solve? -->

## Modules touched

- [ ] Module 1
- [ ] Module 2
- [ ] Module 3
- [ ] HUD / navigation / export
- [ ] Docs / CI only

## Verification

- [ ] \`node --check script.js\`
- [ ] \`node scripts/check.mjs\`
- [ ] \`node scripts/browser-check.mjs\`
- [ ] Tested at 1440 px and 390 px
- [ ] Tested both EN and TH
- [ ] No new dependency, CDN, font or network request
`)
writeFileSync(join(githubDir, 'ISSUE_TEMPLATE', 'bug_report.yml'), `name: Bug report
description: Report a reproducible defect in the studio
title: "[Bug]: "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Please search existing issues first, and do not report security problems here.
  - type: dropdown
    id: module
    attributes:
      label: Module
      options:
        - Module 1
        - Module 2
        - Module 3
        - HUD, tabs, language or export
        - Documentation or CI
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behaviour
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behaviour
    validations:
      required: true
  - type: input
    id: environment
    attributes:
      label: Browser and OS
    validations:
      required: true
  - type: checkboxes
    id: confirmations
    attributes:
      label: Confirmations
      options:
        - label: I searched existing issues.
          required: true
        - label: This is not a security report.
          required: true
`)
writeFileSync(join(githubDir, 'ISSUE_TEMPLATE', 'feature_request.yml'), `name: Feature request
description: Suggest a learning, accessibility or quality improvement
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Learner problem
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed change
    validations:
      required: true
  - type: checkboxes
    id: constraints
    attributes:
      label: Project constraints
      options:
        - label: The proposal can work offline without new dependencies.
          required: true
        - label: The proposal can be translated into English and Thai.
          required: true
`)
writeFileSync(join(githubDir, 'ISSUE_TEMPLATE', 'config.yml'), `blank_issues_enabled: false
contact_links:
  - name: Support
    url: https://github.com/${owner}/${slug}/blob/main/SUPPORT.md
    about: Read the support guide before opening an issue.
  - name: Security
    url: https://github.com/${owner}/${slug}/blob/main/SECURITY.md
    about: Report vulnerabilities privately.
`)
writeFileSync(join(githubDir, 'workflows', 'ci.yml'), `name: Verify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  static-checks:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: node --check script.js
      - run: node scripts/check.mjs
`)

const projectName = `Khan Trig Companion: Unit ${unit} ${studioName}`
const state = {
  project: projectName,
  session: {
    id: 'pending',
    startedAt: '',
    capturedAt: '',
    elapsedSeconds: 0,
    elapsed: 'pending',
    note: 'Replace this template with the real build session before publishing.'
  },
  model: {
    name: 'DeepSeek V4.1 Flash',
    id: 'deepseek-v4.1-flash',
    provider: 'opencode-go'
  },
  usage: {
    basis: 'Replace with the delta from this project start snapshot.',
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    costUSD: 0,
    note: 'Template only; replace with the measured counters.'
  },
  artifacts: {
    sourceFiles: ['index.html', 'style.css', 'script.js'],
    lineCounts: {},
    supportingFiles: ['README.md', 'AGENTS.md', 'CHANGELOG.md', 'LICENSE', 'state.json']
  },
  verification: {
    method: 'pending',
    checks: [],
    consoleErrors: 0
  },
  deployment: {
    repository: newGithub,
    pages: `${newPages}/`,
    host: 'GitHub Pages',
    branch: 'main',
    path: '/'
  },
  credits: {
    tool: 'OpenCode',
    toolURL: 'https://opencode.ai',
    model: 'DeepSeek V4.1 Flash',
    modelID: 'opencode-go/deepseek-v4.1-flash'
  }
}
writeFileSync(join(dest, 'state.json'), `${JSON.stringify(state, null, 2)}\n`)

writeFileSync(join(dest, 'docs', 'SESSION_LOG.md'), `# Session log and build state

Scaffolded from the \`khan-trig-studio\` skill on ${new Date().toISOString().slice(0, 10)}.

Replace this file with the real build record:

- start and capture timestamps (UTC);
- elapsed seconds;
- token counters from the OpenCode session DB, measured as a delta from this
  project's start snapshot;
- the build sequence;
- defects found and fixed;
- verification performed;
- repository, Pages and release URLs.

\`state.json\` is a template and must be replaced with the same real measurements
before publishing. Do not rewrite it after a later docs-only release.
`)

console.log(`Created ${dest}`)
console.log(`  unit:  ${unit}`)
console.log(`  title: ${fullTitle}`)
console.log(`  slug:  ${slug}`)
console.log(`  owner: ${owner}`)
console.log('')
console.log('Next:')
console.log(`  cd ${dest}`)
console.log('  node scripts/check.mjs')
console.log('  node scripts/browser-check.mjs')
console.log('  python3 -m http.server 8080')
console.log('')
console.log('Then replace the Unit 4 module content with the new unit and update')
console.log('README, AGENTS, CHANGELOG, CITATION, docs and state.json.')
