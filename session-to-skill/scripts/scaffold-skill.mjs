#!/usr/bin/env node
// Creates a skill skeleton: SKILL.md, ATTRIBUTION.md and the standard directories.
//
//   node scripts/scaffold-skill.mjs --id city-miniature --out ~/.config/opencode/skills/city-miniature \
//     --description "One sentence the model sees" [--name "City Miniature"] [--force]

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const argv = process.argv.slice(2)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const force = argv.includes('--force')

const id = opt('id')
const out = opt('out')
const description = opt('description')

if (!id || !out || !description) {
  console.error('Usage: scaffold-skill.mjs --id <kebab-id> --out <dir> --description "…" [--name "Display Name"] [--force]')
  process.exit(2)
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || id.length > 64) {
  console.error(`Invalid skill id "${id}": lowercase kebab-case, 1-64 characters.`)
  process.exit(2)
}
if (basename(resolve(out)) !== id && !force) {
  console.error(`Skill id "${id}" should match the directory name (${basename(resolve(out))}). Pass --force to override.`)
  process.exit(2)
}

const dir = resolve(out)
if (existsSync(dir) && readdirSync(dir).length > 0 && !force) {
  console.error(`${out} is not empty. Pass --force to add files to it.`)
  process.exit(2)
}

const display = opt('name') ?? id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')

mkdirSync(join(dir, 'references'), { recursive: true })
mkdirSync(join(dir, 'scripts'), { recursive: true })
mkdirSync(join(dir, 'assets'), { recursive: true })

writeFileSync(
  join(dir, 'SKILL.md'),
  `---
name: ${display}
description: ${description}
version: 0.1.0
---

# ${display}

${description}

## When to use

- TODO: the situation this skill exists for.
- Not for: TODO.

## Workflow

\`\`\`sh
node scripts/new-project.mjs --out ~/my-project
cd ~/my-project && npm ci
\`\`\`

1. TODO: step with the exact command.
2. TODO: step.
3. Verify: \`node tests/run.mjs\` / \`node scripts/verify.mjs\`.

## Module map

- \`assets/<name>/\` — the working template a scaffold copies.
- \`references/method.md\` — construction order and invariants.
- \`references/lessons.md\` — what regresses.
- \`references/verification.md\` — how to prove it works.
- \`scripts/new-project.mjs\` — the scaffold.

## Failure boundaries

- TODO: what this skill cannot do, and what needs a different tool.
`,
)

writeFileSync(
  join(dir, 'ATTRIBUTION.md'),
  `# Attribution

## Origin

TODO: state where the template or any reused part came from, with a link, and the licence status.

## Reused

TODO: components, code or design taken from the origin.

## New in this skill

TODO: what this skill adds.

## Third-party software

TODO: list direct dependencies and their licences; point at generated notices where applicable.
`,
)

writeFileSync(
  join(dir, 'references', 'method.md'),
  `# Method

Construction order and the invariants that must hold. TODO.
`,
)
writeFileSync(
  join(dir, 'references', 'lessons.md'),
  `# What regresses

- TODO: the detail that broke last time and why.
`,
)
writeFileSync(
  join(dir, 'references', 'verification.md'),
  `# Verification

TODO: the commands that prove the skill still works, and what each one covers.
`,
)

writeFileSync(
  join(dir, '.gitignore'),
  'node_modules/\ndist/\ndist-single/\nshots/\nfilm/\n.DS_Store\n',
)

console.log(`Created ${out} (skill id ${id}).
Next:
  1. copy the working artifact into assets/
  2. write SKILL.md and references/
  3. add scripts/new-project.mjs
  4. node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs ${out}`)
