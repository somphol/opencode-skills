#!/usr/bin/env node
// Build the project and check the generated single-file artifact.
//
//   node scripts/verify.mjs --project ~/my-project
//
// This is a static check. It does not replace the browser self-test at
// http://localhost:8000/index.html?selftest.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

const here = dirname(fileURLToPath(import.meta.url))
const project = resolve(process.cwd(), opt('project') ?? '.')

const required = [
  'build.py',
  'src/index.template.html',
  'src/styles.css',
  'src/app.js',
  'src/vendor/cube.min.js',
  'src/vendor/solve.js',
]

let failed = false
const fail = (message) => {
  console.log(`FAIL ${message}`)
  failed = true
}
const ok = (message) => console.log(`ok   ${message}`)

for (const file of required) {
  if (existsSync(join(project, file))) ok(file)
  else fail(`missing ${file}`)
}

if (failed) {
  console.log(`\nProject is incomplete: ${project}`)
  process.exit(1)
}

console.log(`\nBuilding in ${project}…`)
const build = spawnSync('python3', ['build.py'], { cwd: project, stdio: 'inherit' })
if (build.error) {
  fail(`could not run python3: ${build.error.message}`)
  process.exit(1)
}
if (build.status !== 0) {
  fail(`build exited with ${build.status}`)
  process.exit(build.status ?? 1)
}

const artifact = join(project, 'index.html')
if (!existsSync(artifact)) {
  fail('index.html was not generated')
  process.exit(1)
}

const size = statSync(artifact).size
if (size < 100_000) fail(`index.html is only ${size} bytes`)
else ok(`index.html is ${size} bytes`)

const html = readFileSync(artifact, 'utf8')
const markers = [
  ['canvas stage', 'id="stage"'],
  ['auto solve button', 'id="autoBtn"'],
  ['cinematic exit', 'id="cineExit"'],
  ['step speed', 'data-speed="step"'],
  ['solver source', 'id="vendor-source"'],
  ['debug API', '__cubeLab'],
]
for (const [label, marker] of markers) {
  if (html.includes(marker)) ok(label)
  else fail(`missing marker: ${label} (${marker})`)
}

const tracked = spawnSync('git', ['-C', project, 'ls-files', '--error-unmatch', 'index.html'], {
  encoding: 'utf8',
})
if (tracked.status === 0) {
  const diff = spawnSync('git', ['-C', project, 'diff', '--exit-code', '--', 'index.html'], {
    stdio: 'inherit',
  })
  if (diff.status === 0) ok('index.html is committed and current')
  else fail('index.html differs from the committed file; rebuild and commit it')
} else {
  console.log('note index.html is not tracked yet; commit it with the source')
}

console.log(`
Static checks ${failed ? 'FAILED' : 'passed'}.
Browser check (required):
  cd ${project}
  python3 -m http.server 8000
  open http://localhost:8000/index.html?selftest   # expect RESULT PASS
`)

process.exit(failed ? 1 : 0)
