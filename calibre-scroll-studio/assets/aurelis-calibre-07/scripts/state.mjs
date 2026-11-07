#!/usr/bin/env node
/**
 * Writes STATE.md and state.json from the live OpenCode session ledger.
 *
 *   npm run state                 # current session from OPENCODE_SESSION_ID
 *   node scripts/state.mjs --session ses_...
 *
 * The database is opened read-only; no session content or machine path is
 * copied into the project — only aggregate timing and token counts.
 */
import { DatabaseSync } from 'node:sqlite';
import { existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const sessionId =
  process.argv.includes('--session')
    ? process.argv[process.argv.indexOf('--session') + 1]
    : process.env.OPENCODE_SESSION_ID;

const DB = join(homedir(), '.local/share/opencode/opencode.db');
if (!sessionId) {
  console.error('No session id. Set OPENCODE_SESSION_ID or pass --session ses_...');
  process.exit(1);
}
if (!existsSync(DB)) {
  console.error('OpenCode database not found at the expected local path.');
  process.exit(1);
}

const db = new DatabaseSync(DB, { readOnly: true });
const row = db
  .prepare(
    `select id, title, agent, version, model, cost,
            tokens_input, tokens_output, tokens_reasoning,
            tokens_cache_read, tokens_cache_write,
            time_created, time_updated
       from session_v2 where id = ?`,
  )
  .get(sessionId);
db.close();

if (!row) {
  console.error(`Session ${sessionId} was not found.`);
  process.exit(1);
}

const model = JSON.parse(row.model);
const startedAt = new Date(row.time_created);
const updatedAt = new Date(row.time_updated);
const elapsedSeconds = Math.max(0, Math.round((row.time_updated - row.time_created) / 1000));

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const tokens = {
  input: row.tokens_input,
  output: row.tokens_output,
  reasoning: row.tokens_reasoning,
  cacheRead: row.tokens_cache_read,
  cacheWrite: row.tokens_cache_write,
};
tokens.newTokens = tokens.input + tokens.output + tokens.reasoning;
tokens.totalProcessed = tokens.newTokens + tokens.cacheRead + tokens.cacheWrite;

const state = {
  schemaVersion: 1,
  project: 'Aurelis Calibre 07 — Anatomy of a Second',
  generatedAt: new Date().toISOString(),
  captureNote:
    'Totals were read from the live OpenCode session database during release preparation. ' +
    'The session continued while publishing, so the live ledger may be marginally higher.',
  session: {
    harness: 'OpenCode',
    harnessVersion: row.version,
    sessionId: row.id,
    title: row.title,
    agent: row.agent,
    model: {
      name: 'DeepSeek V4.1 Flash',
      id: model.id,
      provider: model.providerID,
    },
    startedAt: startedAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    elapsedSeconds,
    elapsedHuman: formatDuration(elapsedSeconds),
    tokens,
    costUsd: row.cost,
  },
  prompt: {
    oneSentence:
      'Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that disassembles as the user scrolls.',
    words: 17,
    note:
      'This was the entire working brief. The source video uses a much longer prompt; this build ' +
      'was a deliberate experiment in what DeepSeek V4.1 Flash could infer from one sentence.',
    source: 'https://www.youtube.com/watch?v=jTFGF4tCKTM',
  },
  build: {
    chapters: 5,
    assemblies: 23,
    checks: 24,
    drawCalls: 103,
    triangles: 131468,
    screenshots: 8,
    deploy: 'https://somphol.github.io/aurelis-calibre-07/',
  },
  credits: [
    'OpenCode — harness, agents, session ledger',
    'DeepSeek V4.1 Flash (opencode-go) — model',
    'Three.js r170 — MIT',
    'Bodoni Moda — SIL Open Font License 1.1',
  ],
};

writeFileSync(join(ROOT, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);

const number = (value) => value.toLocaleString('en-US');
const markdown = `# Session ledger

Measured from the live OpenCode session database on ${state.generatedAt}. The session was still
open while the release was published, so the live totals may be marginally higher.

## Identity

| | |
| --- | --- |
| Project | ${state.project} |
| Harness | ${state.session.harness} ${state.session.harnessVersion} |
| Agent | ${state.session.agent} |
| Model | ${state.session.model.name} (\`${state.session.model.id}\`, ${state.session.model.provider}) |
| Session | \`${state.session.sessionId}\` |
| Started | ${state.session.startedAt} |
| Captured | ${state.session.updatedAt} |
| Elapsed | **${state.session.elapsedHuman}** (${number(elapsedSeconds)} seconds) |
| Cost | $${state.session.costUsd.toFixed(2)} |

## Tokens

| Channel | Tokens |
| --- | ---: |
| Input | ${number(tokens.input)} |
| Output | ${number(tokens.output)} |
| Reasoning | ${number(tokens.reasoning)} |
| Cache read | ${number(tokens.cacheRead)} |
| Cache write | ${number(tokens.cacheWrite)} |
| **New tokens** (input + output + reasoning) | **${number(tokens.newTokens)}** |
| **Total processed** (incl. cache read) | **${number(tokens.totalProcessed)}** |

## The brief

> ${state.prompt.oneSentence}

${state.prompt.words} words. The source video carries a much longer prompt; this study was a
deliberate test of a small prompt against DeepSeek V4.1 Flash in OpenCode.
[Concept reference](${state.prompt.source}).

## The build

- ${state.build.chapters} scroll chapters, ${state.build.assemblies} registered assemblies
- ${state.build.checks} headless checks, ${state.build.drawCalls} draw calls, ${number(state.build.triangles)} triangles
- ${state.build.screenshots} release screenshots
- Live: ${state.build.deploy}

## Credits

${state.credits.map((credit) => `- ${credit}`).join('\n')}

## How this file is produced

\`npm run state\` opens the OpenCode database read-only, reads the current session row, and writes
\`state.json\` and this ledger. Only aggregate timing and token counts are copied — no conversation
content and no local machine path.
`;

writeFileSync(join(ROOT, 'STATE.md'), markdown);
console.log(`Wrote STATE.md and state.json — ${state.session.elapsedHuman}, ${number(tokens.totalProcessed)} tokens processed.`);
