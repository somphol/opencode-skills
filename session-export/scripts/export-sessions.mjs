#!/usr/bin/env node
// Exports OpenCode session transcripts to Markdown and regenerates TOC.md / index.json.
//
//   node export-sessions.mjs               # every top-level session in this project
//   node export-sessions.mjs --limit 5     # newest 5
//   node export-sessions.mjs --only ses_…  # one session
//   node export-sessions.mjs --reasoning   # include model reasoning (hidden by default)
//   node export-sessions.mjs --raw         # refused unless --unsafe is also passed
//
// Sanitizing keeps the prose and tool commands but removes credentials, keys, emails, home paths
// and public IPs. Transcripts are written to sessions/<date>--<slug>--<id8>.md.

import { execFileSync, spawnSync } from 'node:child_process'
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const optArg = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const ROOT = resolve(
  optArg('out') ?? process.env.OPENCODE_TRANSCRIPTS ?? join(process.env.HOME ?? process.cwd(), 'opencode-transcripts'),
)
const OUT = join(ROOT, 'sessions')
const flag = (name) => argv.includes(`--${name}`)
const opt = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

const withReasoning = flag('reasoning')
const RAW = flag('raw')
if (RAW && !flag('unsafe')) {
  console.error('--raw writes an unsanitized transcript. Every exported file must be sanitized.\nIf you really need one for an inspection, add --unsafe and delete it afterwards.')
  process.exit(2)
}
const only = opt('only')
const workdir = opt('dir') ?? process.env.HOME ?? process.cwd()
const limit = Number(opt('limit') ?? 0)

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g
let redactions = 0

/** Patterns that must never reach the archive. Prose and ordinary code survive untouched. */
const RULES = [
  // Private keys of any flavour.
  [/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, '[redacted:private-key]'],
  // Provider tokens.
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, '[redacted:github-token]'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, '[redacted:github-token]'],
  [/\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{16,}\b/g, '[redacted:api-key]'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g, '[redacted:slack-token]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[redacted:aws-key]'],
  [/\bASIA[0-9A-Z]{16}\b/g, '[redacted:aws-key]'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/g, '[redacted:google-key]'],
  [/\bglpat-[A-Za-z0-9_-]{20,}\b/g, '[redacted:gitlab-token]'],
  [/\bnpm_[A-Za-z0-9]{36}\b/g, '[redacted:npm-token]'],
  // JWTs and bearer headers.
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[redacted:jwt]'],
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi, '$1 [redacted:token]'],
  // Credentials embedded in URLs.
  [/(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+:[^/\s@]+@/gi, '$1[redacted:credentials]@'],
  // key = value pairs whose key names a secret.
  [
    /\b([A-Za-z0-9_.-]*(?:password|passwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret)[A-Za-z0-9_.-]*)\s*[:=]\s*("[^"\n]{6,}"|'[^'\n]{6,}'|[^\s"',;]{6,})/gi,
    '$1=[redacted:secret]',
  ],
  // Shell exports / .env lines with a secret-ish name.
  [/^(\s*(?:export\s+)?[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|CREDENTIAL)[A-Z0-9_]*=).+$/gm, '$1[redacted]'],
  // Personal data.
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[email]'],
  // Machine-specific paths.
  [/\/Users\/[A-Za-z0-9._-]+/g, '~'],
  [/\/private\/var\/folders\/[^\s"'`)]+/g, '[tmp]'],
  [/\/var\/folders\/[^\s"'`)]+/g, '[tmp]'],
  // Public IPs; keep loopback and unspecified.
  [/\b(?!127\.0\.0\.1\b)(?!0\.0\.0\.0\b)(?!(?:10|127)\.)(?!192\.168\.)(?!172\.(?:1[6-9]|2\d|3[01])\.)(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
  // Card-shaped digit runs (keep timestamps and ordinary counts).
  [/\b\d{16}\b|\b(?:\d[ -]){15}\d\b/g, '[redacted:number]'],
]

function scrub(text) {
  if (RAW) return text
  let out = text
  for (const [re, to] of RULES) {
    out = out.replace(re, (...m) => {
      redactions++
      return to.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '')
    })
  }
  return out
}

const clean = (s) => scrub(String(s ?? '').replace(ANSI, '').replace(/\r\n/g, '\n'))
const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56) || 'session'
const dateOf = (ms) => new Date(ms).toISOString().slice(0, 10)
const iso = (ms) => new Date(ms).toISOString().replace('T', ' ').slice(0, 16)
const fence = (code, lang = '') => {
  const text = clean(code).replace(/\n{3,}/g, '\n\n').trimEnd()
  const longest = Math.max(2, ...[...text.matchAll(/`{3,}/g)].map((m) => m[0].length))
  const bar = '`'.repeat(longest + 1)
  return `${bar}${lang}\n${text}\n${bar}`
}
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n)}\n… (${s.length - n} more characters)` : s)

const TAG_RULES = [
  ['three.js', /\bthree(?:\.js)?\b/i],
  ['react', /\breact\b/i],
  ['typescript', /\btypescript\b/i],
  ['vite', /\bvite\b/i],
  ['python', /\bpython\b/i],
  ['node', /\bnode(?:\.js)?\b/i],
  ['github', /github/i],
  ['pages', /github pages|gh-pages|\bpages\b/i],
  ['3d', /\b3d\b|three\.js|diorama|scene/i],
  ['game', /\bgame\b|gameplay|arcade/i],
  ['audio', /\baudio\b|tts|speech|sound|music/i],
  ['map', /\bmap\b|geojson|leaflet|coordinates/i],
  ['data', /\bcsv\b|dataset|sql|database|json/i],
  ['api', /\bapi\b|endpoint|sdk\b/i],
  ['blender', /blender/i],
  ['css', /\bcss\b|layout|styling/i],
  ['testing', /\btest(?:s|ing)?\b|playwright|vitest|jest/i],
  ['shader', /shader|glsl|webgl/i],
]

const tagsFor = (title, prompt, tools) => {
  const hay = `${title} ${prompt}`
  const tags = TAG_RULES.filter(([, re]) => re.test(hay)).map(([t]) => t)
  if (tools.shell > 20) tags.push('cli')
  if (tools.edit + tools.write > 20) tags.push('code-edit')
  return [...new Set(tags)].slice(0, 6)
}

const summarize = (text) => {
  const t = clean(text)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!t) return ''
  const m = t.match(/^(.{40,170}?[.!?])\s/)
  return (m ? m[1] : t.slice(0, 170)).trim()
}

function listSessions() {
  const out = execFileSync('opencode', ['session', 'list'], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
    cwd: workdir,
  })
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, title, when] = line.split('\t')
      return { id, title: title ?? id, when: when ?? '' }
    })
    .filter((s) => /^ses_/.test(s.id))
}

function exportSession(id) {
  const args = ['session', 'export', id]
  // Write straight to a file: piping a multi-megabyte export through a buffer truncates it.
  const tmp = join(ROOT, '.export.json')
  const fd = openSync(tmp, 'w')
  const run = spawnSync('opencode', args, { cwd: workdir, stdio: ['ignore', fd, 'inherit'] })
  closeSync(fd)
  try {
    if (run.status !== 0) throw new Error(`opencode exited ${run.status}`)
    return JSON.parse(readFileSync(tmp, 'utf8'))
  } finally {
    rmSync(tmp, { force: true })
  }
}

function renderTool(part) {
  const state = part.state ?? {}
  const input = state.input ?? {}
  const command = input.command ?? input.filePath ?? input.path ?? ''
  const params = command
    ? String(command)
    : Object.entries(input)
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join('\n')
  const body = (state.content ?? [])
    .map((c) => (c.type === 'text' ? c.text : `[${c.type}]`))
    .join('\n')
  const head = `**${part.name ?? 'tool'}**${state.status ? ` · ${state.status}` : ''}`
  return [
    head,
    params ? fence(truncate(params, 1600), 'sh') : '',
    body ? `<details><summary>output</summary>\n\n${fence(truncate(body, 4000))}\n\n</details>` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function renderSession(data, meta) {
  const info = data.info ?? {}
  const messages = data.messages ?? []
  const created = info.time?.created ?? 0
  const users = messages.filter((m) => m.type === 'user')
  const assists = messages.filter((m) => m.type === 'assistant')
  const toolParts = assists.flatMap((m) => (m.content ?? []).filter((p) => p.type === 'tool'))
  const tools = toolParts.length
  const toolNames = {}
  for (const p of toolParts) toolNames[p.name ?? 'tool'] = (toolNames[p.name ?? 'tool'] ?? 0) + 1
  const title = clean(info.title ?? meta.title)
  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `session: ${info.id ?? meta.id}`,
    `created: ${iso(created)}`,
    `model: ${info.model?.providerID ?? '?'}/${info.model?.id ?? '?'}`,
    `directory: ${clean(info.location?.directory ?? '')}`,
    `messages: ${messages.length}`,
    `tools: ${tools}`,
    `sanitized: ${!RAW}`,
    '---',
    '',
    `# ${title}`,
    '',
  ]
  for (const m of messages) {
    if (m.type === 'user') {
      if (!m.text) continue
      lines.push('## 🧑 User', '', clean(m.text), '')
    } else if (m.type === 'assistant') {
      const out = []
      for (const p of m.content ?? []) {
        if (p.type === 'text' && p.text) out.push(clean(p.text))
        else if (p.type === 'tool') out.push(renderTool(p))
        else if (p.type === 'reasoning' && withReasoning && p.text)
          out.push(`<details><summary>reasoning</summary>\n\n${fence(truncate(clean(p.text), 2000))}\n\n</details>`)
      }
      if (out.length) lines.push('## 🤖 Assistant', '', out.join('\n\n'), '')
    }
  }
  return {
    markdown: `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`,
    created,
    title,
    messages: messages.length,
    tools,
    firstPrompt: clean(users[0]?.text ?? ''),
    toolNames,
  }
}

function main() {
  mkdirSync(OUT, { recursive: true })
  let sessions = listSessions()
  if (only) sessions = sessions.filter((s) => s.id === only)
  if (limit > 0) sessions = sessions.slice(0, limit)
  if (!sessions.length) {
    console.error('No sessions matched.')
    process.exit(1)
  }

  const rows = []
  for (const meta of sessions) {
    process.stdout.write(`exporting ${meta.id} … `)
    const before = redactions
    let data
    try {
      data = exportSession(meta.id)
    } catch (e) {
      console.log(`failed: ${e.message.split('\n')[0]}`)
      continue
    }
    const rendered = renderSession(data, meta)
    const name = `${dateOf(rendered.created)}--${slugify(meta.title)}--${meta.id.slice(4, 12)}.md`
    writeFileSync(join(OUT, name), rendered.markdown)
    rows.push({
      id: meta.id,
      title: rendered.title,
      created: rendered.created,
      file: `sessions/${name}`,
      messages: rendered.messages,
      tools: rendered.tools,
      bytes: Buffer.byteLength(rendered.markdown),
      redactions: redactions - before,
      summary: summarize(rendered.firstPrompt),
      tags: tagsFor(rendered.title, rendered.firstPrompt, rendered.toolNames),
    })
    console.log('ok')
  }

  rows.sort((a, b) => b.created - a.created)
  const totalBytes = rows.reduce((n, r) => n + r.bytes, 0)
  const totalRedactions = rows.reduce((n, r) => n + r.redactions, 0)
  const byDate = new Map()
  for (const r of rows) {
    const d = dateOf(r.created)
    if (!byDate.has(d)) byDate.set(d, [])
    byDate.get(d).push(r)
  }
  const body = [...byDate.entries()]
    .map(
      ([date, list]) =>
        `## ${date}\n\n` +
        list
          .map((r) => {
            const i = rows.indexOf(r) + 1
            const tags = r.tags.map((t) => `\`${t}\``).join(' ')
            return [
              `### [${i}. ${r.title}](${encodeURI(r.file)})`,
              `\`${r.id}\` · ${r.messages} msgs · ${r.tools} tools · ${(r.bytes / 1024).toFixed(0)} KB · ${r.redactions} redactions`,
              r.summary ? `> ${r.summary}` : '',
              tags ? `Tags: ${tags}` : '',
            ]
              .filter(Boolean)
              .join('\n\n')
          })
          .join('\n\n'),
    )
    .join('\n\n')

  const toc = `# OpenCode transcript archive

Generated by \`export-sessions.mjs\` on ${new Date().toISOString().slice(0, 16).replace('T', ' ')}.
${rows.length} sessions, ${(totalBytes / 1048576).toFixed(1)} MB of Markdown, ${totalRedactions} redactions.

${RAW ? '> **Raw export.** Credentials and personal data were NOT removed. Do not share this directory.\n' : '> Sanitized: private keys, provider tokens, JWTs, `password=…`-style assignments, emails, home paths and public IPs are replaced with `[redacted:…]` markers. Prose and ordinary commands are kept. Review before sharing; no scrubber is perfect.\n'}
${body}

## Refresh

\`\`\`sh
node export-sessions.mjs              # all top-level sessions in this project
node export-sessions.mjs --limit 5    # newest five only
node export-sessions.mjs --reasoning  # include model reasoning
node export-sessions.mjs --raw        # disable sanitizing
\`\`\`

Each file opens with front matter containing the session id, so it can be re-exported or resumed:

\`\`\`sh
opencode session export <session-id>
\`\`\`
`
  writeFileSync(join(ROOT, 'TOC.md'), toc)
  writeFileSync(
    join(ROOT, 'index.json'),
    `${JSON.stringify({ generated: new Date().toISOString(), sanitized: !RAW, sessions: rows }, null, 2)}\n`,
  )
  console.log(`\n${rows.length} transcripts, ${(totalBytes / 1048576).toFixed(1)} MB, ${totalRedactions} redactions → ${ROOT}`)
}

main()
