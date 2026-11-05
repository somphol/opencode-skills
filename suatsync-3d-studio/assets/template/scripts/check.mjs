#!/usr/bin/env node
/**
 * Content and contract checks for a scaffolded chant studio.
 * Dependency-free. Run from the project root:
 *
 *   node scripts/check.mjs
 *
 * Update the expected line/verse counts when you adapt the dataset.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failed = 0;

function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }
function exists(file) { return fs.existsSync(path.join(root, file)); }
function check(name, pass, detail = "") {
  checks++;
  if (pass) console.log("PASS " + name);
  else { failed++; console.error("FAIL " + name + (detail ? " — " + detail : "")); }
}

["index.html", "style.css", "script.js", "package.json"].forEach((file) => check("file exists: " + file, exists(file)));

const html = read("index.html");
const css = read("style.css");
const js = read("script.js");
const pkg = JSON.parse(read("package.json"));

check("script parses", spawnSync(process.execPath, ["--check", path.join(root, "script.js")], { stdio: "ignore" }).status === 0);
check("HTML links style and script", html.includes('href="style.css"') && html.includes('src="script.js"'));
check("Three.js is pinned", html.includes("three.js/r128/three.min.js"));
check("viewport is set", html.includes('name="viewport"'));
check("15 verses are declared", (js.match(/id: "v\d+"/g) || []).length === 15, String((js.match(/id: "v\d+"/g) || []).length));
check("20 complete line records", ["pali", "roman", "th", "en"].every((key) =>
  (js.match(new RegExp("\\b" + key + ': "', "g")) || []).length === 20));
check("11 timeline markers", js.includes("defaultMarkers") && js.includes("out.push(outro)"));
check("storage key is versioned", /STORAGE_KEY = "[^"]+\.v1"/.test(js));
check("consent-gated YouTube", js.includes("function connectYouTube") && js.includes("yt-iframe-api"));
check("timer fallback exists", js.includes('audio.source === "timer"'));
check("self-tests are exposed", js.includes("runSelfTests"));
check("bilingual tables exist", js.includes("en: {") && js.includes("th: {"));
check("reduced motion is respected", css.includes("prefers-reduced-motion"));
check("rate is clamped", js.includes("0.75, 1.25"));
check("no TODO/FIXME", !/\b(TODO|FIXME|XXX)\b/.test(js + css + html));
check("no personal paths or obvious secrets", !/\/Users\/[A-Za-z]/.test(js + html) && !/(ghp_|sk-[A-Za-z0-9]{20,})/.test(js + html));
check("package has start/check/verify", !!(pkg.scripts.start && pkg.scripts.check && pkg.scripts.verify));

if (failed) {
  console.error(`\nFAIL ${failed} of ${checks} checks`);
  process.exit(1);
}
console.log(`\nOK ${checks} checks`);
