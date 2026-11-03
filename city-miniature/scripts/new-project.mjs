#!/usr/bin/env node
// Creates a blank, city-agnostic starter for a new miniature.
//
// The San Francisco diorama in assets/ is a mechanism reference, NOT a template. This script
// deliberately copies no scene code, geography, landmarks or copy from it.
//
//   node scripts/new-project.mjs --out my-city [--name my-city]
//
// Exit codes: 0 created, 1 IO error (a folder this run created is removed), 2 invalid input.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BRIEF = join(SKILL, 'references', 'city-brief.md')
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

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

const brief = existsSync(BRIEF)
  ? readFileSync(BRIEF, 'utf8').replaceAll('<city>', name)
  : `# City brief: ${name}\n\nFill in the geography, districts, landmarks, street pattern, architecture, transport, palette, copy and verification targets before writing scene code.\n`

const files = {
  'package.json': `${JSON.stringify(
    {
      name,
      private: true,
      version: '0.1.0',
      type: 'module',
      engines: { node: '>=22.4' },
      scripts: {
        dev: 'vite',
        typecheck: 'tsc --noEmit',
        build: 'tsc --noEmit && vite build',
      },
      dependencies: {
        react: '19.3.1',
        'react-dom': '19.3.1',
        three: '0.186.1',
      },
      devDependencies: {
        '@types/node': '24.10.1',
        '@types/react': '19.3.0',
        '@types/react-dom': '19.3.0',
        '@types/three': '0.186.0',
        '@vitejs/plugin-react': '5.2.0',
        'playwright-core': '1.64.1',
        tsx: '4.20.6',
        typescript: '5.9.3',
        vite: '7.3.7',
      },
    },
    null,
    2,
  )}\n`,
  'tsconfig.json': `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        types: ['node'],
      },
      include: ['src'],
    },
    null,
    2,
  )}\n`,
  'vite.config.ts': `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One JS chunk + one CSS file with every asset inlined, so a single-file build is simple.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#efe6d2" />
    <link rel="icon" href="data:," />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  '.gitignore': `node_modules/
dist/
dist-single/
shots/
.DS_Store
`,
  'src/main.tsx': `import { createRoot } from 'react-dom/client'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <main className="starter">
    <p className="eyebrow">CITY MINIATURE</p>
    <h1>Build the city from scratch.</h1>
    <p>
      Start with CITY.md. Then author the geography, plan, buildings, landmarks, environment,
      traffic and scene for the target city.
    </p>
    <p className="note">
      The San Francisco asset in the skill is a mechanism reference, not a template to copy.
    </p>
  </main>
)
`,
  'src/style.css': `:root {
  font-family: "Avenir Next", "Helvetica Neue", system-ui, sans-serif;
  color: #23423f;
  background: #efe6d2;
  font-synthesis: none;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
.starter {
  min-height: 100svh;
  display: grid;
  align-content: center;
  gap: 14px;
  padding: 8vw;
}
.starter .eyebrow {
  margin: 0;
  color: #d45a45;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}
.starter h1 {
  max-width: 12ch;
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(40px, 7vw, 84px);
  font-weight: 400;
  letter-spacing: -2px;
  line-height: 0.95;
}
.starter p {
  max-width: 62ch;
  margin: 0;
  color: #6f7a70;
  font-size: 14px;
  line-height: 1.65;
}
.starter .note {
  color: #c99a3f;
  font-size: 12px;
}
`,
  'README.md': `# ${name}

A city miniature built from scratch with React, TypeScript and three.js.

## Start here

1. Fill CITY.md with the target city's geography, districts, landmarks, street pattern,
   architecture, transport, palette, copy and verification targets.
2. Read the skill references: method.md, lessons.md, verification.md, hosting.md and city-brief.md.
3. Author the scene modules from scratch. The San Francisco asset in the skill is a mechanism
   reference, not a template to copy.
4. Add tests and verification targets for this city. Do not reuse another city's expected values.
5. Build the single file, review the screenshots and publish.

## Commands

~~~sh
npm install
npm run dev
npm run typecheck
npm run build
~~~

Add the test, verify and single-file scripts as the scene takes shape. The skill references show the
patterns; the code must be this city's.

## Layout

~~~text
src/main.tsx        app entry / UI shell
src/style.css       UI
src/scene/          geography, plan, buildings, landmarks, environment, traffic, scene
tests/              plan and geometry checks for this city
scripts/            single-file build and browser verification
CITY.md             the design contract
AGENTS.md           working notes for the next agent
~~~

## Rule

Do not copy an existing city's scene and change a few coordinates. A reskin inherits the old city's
geography, landmarks, street logic and copy. Build the target city from scratch; use the reference
only for mechanism.
`,
  'AGENTS.md': `# ${name} — working notes

## What it is

A city miniature built from scratch. Fill this in after CITY.md: the target city, the tray, the
landmarks, the street pattern and what the scene is not.

## Commands

~~~sh
npm install
npm run dev
npm run typecheck
npm run build
~~~

Add test, verify and single-file scripts as they are written.

## Architecture

Write the target city's module map here. Do not copy another city's modules.

## Decisions and constraints

- Coordinates: north/east/up, tray size, water/land levels.
- Landmarks: one anchor/view/envelope table; tests and verification repeat the targets.
- Road graph: connected, bridges cross water, parcels clear of roads and reserved sites.
- Seeded placement and virtual time; no Math.random in scene construction.
- One offline file, strict CSP, no external requests or fonts.
- Tests and verification use this city's values, not another city's.

## Known issues

## Continuity
`,
  'src/scene/README.md': `# Scene modules

Write these from scratch for the target city. The names are suggestions, not a copy of the reference.

- geography.ts — outline, water, districts, landmark anchors, parks.
- plan.ts — roads, bridges, graph, blocks/parcels.
- buildings.ts — target building families.
- landmarks.ts — target landmark models.
- environment.ts — land, water, roads, parks, street life.
- traffic.ts — target vehicles, boats, pedestrians.
- kit.ts — instanced primitive helper.
- scene.ts — renderer, camera, day/night, capture.

Do not copy the San Francisco files. Read the skill's method.md for the invariants and the San
Francisco module map as an example of the mechanism.
`,
  'tests/README.md': `# Tests

Add city-specific checks:

- plan — parcels on land, clear of roads and reserved sites, no overlap; connected road graph;
  bridges start and end on land and cross water.
- geometry — finite geometry, non-singular instances, landmark envelopes, distinct building families.

Use the target's anchors, envelopes and facts. Do not copy another city's expected values.
`,
  'scripts/README.md': `# Scripts

- inline-build.mjs — inline the Vite JS/CSS into one HTML file.
- verify.mjs — serve the single file, drive window.__scene in capture mode, and check the target's
  landmark flights, day/night, locales and embed.
- shot.mjs — visual screenshots, not a pass/fail gate.

See the skill's references/verification.md and references/hosting.md for the patterns.
`,
  'CITY.md': brief,
}

let created = 0
try {
  mkdirSync(dir, { recursive: true })
  for (const [path, content] of Object.entries(files)) {
    const file = join(dir, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    created++
  }
  console.log(`Created ${out} (${created} blank-starter files).`)
  console.log('Next: fill CITY.md, read references/method.md, then npm install && npm run dev.')
  console.log('The San Francisco asset is a mechanism reference; no scene code was copied.')
} catch (error) {
  if (!existed) rmSync(dir, { recursive: true, force: true })
  console.error(`Could not create the starter: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
}
