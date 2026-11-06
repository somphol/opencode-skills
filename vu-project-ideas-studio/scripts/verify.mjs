#!/usr/bin/env node
/**
 * Prove the skill from a clean temporary directory.
 *
 *   node scripts/verify.mjs
 *   node scripts/verify.mjs --browser
 *   node scripts/verify.mjs --keep
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const withBrowser = args.includes("--browser");
const keep = args.includes("--keep");
const here = import.meta.dirname;
const dir = mkdtempSync(join(tmpdir(), "vu-ideas-skill-"));

function run(command, argv, cwd = dir) {
  const result = spawnSync(command, argv, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\nfailed: ${command} ${argv.join(" ")}`);
    process.exit(result.status || 1);
  }
}

try {
  console.log(`scaffolding into ${dir}`);
  run("node", [join(here, "new-project.mjs"), "--out", dir], here);
  console.log("\nscaffold generated; running its static gate");
  run("node", ["scripts/verify.mjs"]);

  if (withBrowser) {
    console.log("\nrunning the 31-check browser suite");
    run("node", ["tests/browser.test.mjs", "--no-shots"]);
  }

  console.log(`\nskill verified${withBrowser ? " (static + browser)" : " (static)"}`);
  if (keep) console.log(`kept: ${dir}`);
} finally {
  if (!keep) rmSync(dir, { recursive: true, force: true });
}
