#!/usr/bin/env node
/**
 * Copy the complete working catalog reference into a new directory.
 *
 *   node scripts/new-project.mjs --out ~/Projects/my-ideas-catalog
 *
 * The scaffold is a working 54-brief catalog. Replace data/source.json,
 * data/metadata.json, data/prefix.txt, the track list and the copy before
 * publishing. Do not ship the VU briefs as your own content.
 */
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
if (outIndex === -1 || !args[outIndex + 1]) {
  console.error("Usage: node scripts/new-project.mjs --out <directory>");
  process.exit(2);
}

const out = resolve(args[outIndex + 1].replace(/^~(?=$|\/)/, process.env.HOME));
const here = import.meta.dirname;
const source = join(here, "..", "assets", "reference");

if (!existsSync(source)) {
  console.error(`reference not found: ${source}`);
  process.exit(1);
}
if (existsSync(out) && readdirSync(out).length > 0) {
  console.error(`refusing to write into a non-empty directory: ${out}`);
  process.exit(1);
}

const skip = (path) => {
  const rel = path.slice(source.length);
  return rel.includes("/.git") || rel.includes("/node_modules") || rel.endsWith("/.DS_Store");
};

cpSync(source, out, { recursive: true, filter: (path) => !skip(path) });
console.log(`copied reference → ${out}`);

// A scaffold must not claim to be the published VU catalog.
const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const statePath = join(out, "state.json");
const state = JSON.parse(readFileSync(statePath, "utf8"));
state.project = basename(out);
state.release = "0.1.0";
state.session = {
  id: "",
  title: "Scaffolded from vu-project-ideas-studio",
  startedAt: now,
  capturedAt: now,
  elapsedSeconds: 0,
  elapsed: "0m 0s",
  note: "Scaffolded from the VU Project Ideas reference. Replace the content and refresh this block at release.",
};
state.usage = {
  inputTokens: 0,
  outputTokens: 0,
  reasoningTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  totalTokens: 0,
  costUSD: 0,
  note: "Not measured yet. Read the session totals at release; do not guess.",
};
state.verification = {
  method: "Static gate + headless Chrome over the DevTools Protocol",
  staticChecks: 0,
  browserChecks: 0,
  consoleErrors: 0,
  status: "not run",
};
state.deployment = {
  repository: "https://github.com/OWNER/REPO",
  pages: "https://example.com/",
  host: "GitHub Pages",
  branch: "main",
  path: "/",
  status: "not deployed",
};
state.skill = {
  name: "vu-project-ideas-studio",
  title: "VU Project Ideas Studio",
  status: "reference used; replace with your own skill at release",
  catalog: "https://somphol.github.io/opencode-skills/",
};
writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
console.log("reset state.json to a scaffold record");

// Refresh generated files with today's date and prove the build runs.
const build = spawnSync("python3", ["scripts/build.py"], { cwd: out, stdio: "inherit" });
if (build.status !== 0) {
  console.error("build failed; inspect the Python output above");
  process.exit(build.status || 1);
}

console.log(`
Next:
  cd ${out}
  python3 -m http.server 4173
  npm test
  npm run test:browser

Then replace data/source.json, data/metadata.json, data/prefix.txt, the TRACKS list
and the copy. Refresh state.json and publish to GitHub Pages.
`);
