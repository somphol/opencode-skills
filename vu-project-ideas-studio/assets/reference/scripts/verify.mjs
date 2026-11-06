#!/usr/bin/env node
/**
 * Static release gate for VU Project Ideas.
 * No dependencies. Run: node scripts/verify.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import vm from "node:vm";

const ROOT = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const exists = (path) => existsSync(join(ROOT, path));
const checks = [];
const check = (name, pass, detail = "") => {
  checks.push({ name, pass: !!pass, detail });
  if (!pass) console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
};

// ---------- data ----------
const sandbox = { window: {} };
vm.runInNewContext(read("data/projects.js"), sandbox, { filename: "data/projects.js" });
const DATA = sandbox.window.VU_DATA;
const projects = DATA?.projects || [];
const tracks = DATA?.tracks || [];
const byId = new Map(projects.map((p) => [p.id, p]));

check("projects.js defines VU_DATA", !!DATA);
check("54 unique briefs", projects.length === 54, `${projects.length}`);
check("ids are unique", new Set(projects.map((p) => p.id)).size === projects.length);
check("titles are unique", new Set(projects.map((p) => p.title)).size === projects.length);
check("numbering is sequential", projects.every((p, i) => p.n === i + 1));
check("9 tracks", tracks.length === 9, `${tracks.length}`);
check("every track is used", tracks.every((t) => projects.some((p) => p.track === t.id)));
check("prefix has one title placeholder", (DATA.prefix.match(/\{\{TITLE\}\}/g) || []).length === 1);
check("prefix keeps the current release wording", DATA.prefix.includes("turn what you have done here into a skill"));
check("prefix ends with the divider", DATA.prefix.trimEnd().endsWith("==========="));

for (const p of projects) {
  const where = p.id || "(missing id)";
  check(`${where}: required metadata`, !!p.title && !!p.tagline && !!p.trackName && !!p.size && !!p.promptFile);
  check(`${where}: task body is substantial`, p.task.length > 200, `${p.task.length} chars`);
  check(`${where}: task does not contain the request prefix`, !p.task.includes("Can you create new project in ~/Projects"));
  check(`${where}: live URL is https`, !p.live || p.live.startsWith("https://"));
  check(`${where}: stack and features exist`, p.stack.length > 0 && p.features.length > 0);
  check(`${where}: word count matches`, p.words === p.task.split(/\s+/).filter(Boolean).length);
}

const fullPrompt = (p) => DATA.prefix.replace(/\{\{TITLE\}\}/g, p.title).trimEnd() + "\n\n" + p.task;
check("every full prompt contains the prefix once", projects.every((p) => fullPrompt(p).split("Can you create new project").length - 1 === 1));

// ---------- generated prompt files ----------
const files = exists("prompts") ? readdirSync(join(ROOT, "prompts")).filter((f) => f.endsWith(".md") && f !== "README.md") : [];
check("54 prompt files", files.length === 54, `${files.length}`);
const missing = projects.filter((p) => !exists(`prompts/${p.promptFile}`));
check("every prompt file exists", missing.length === 0, missing.map((p) => p.promptFile).join(", "));
const stale = projects.filter((p) => exists(`prompts/${p.promptFile}`) && !read(`prompts/${p.promptFile}`).includes(fullPrompt(p)));
check("every prompt file matches the source", stale.length === 0, stale.map((p) => p.promptFile).join(", "));
const leaked = files.filter((f) => read(`prompts/${f}`).includes("{{TITLE}}") && f !== "README.md");
check("prompt files have no unsubstituted placeholder", leaked.length === 0, leaked.join(", "));

// ---------- catalog feed ----------
if (exists("data/catalog.json")) {
  const cat = JSON.parse(read("data/catalog.json"));
  check("catalog.json count matches", cat.projects.length === projects.length);
  check("catalog.json word count matches", cat.counts.words === projects.reduce((n, p) => n + p.words, 0));
  check("catalog.json omits task bodies", cat.projects.every((p) => !("task" in p)));
} else {
  check("catalog.json exists", false);
}

// ---------- site ----------
const html = read("index.html");
const css = read("assets/style.css");
const app = read("assets/app.js");
check("index.html has the grid", html.includes('id="grid"'));
check("index.html has the detail dialog", html.includes('id="detail"'));
check("index.html has the prefix block", html.includes('id="prefix"'));
check("index.html loads data before app", html.indexOf("data/projects.js") < html.indexOf("assets/app.js"));
check("no external script sources", !/<script[^>]+src=["']https?:/i.test(html));
check("no external font imports", !/@import\s+url\(["']?https?:/i.test(css));
check("no inline event handlers", !/\son(?:click|change|input|load|error)=/i.test(html));
check("no javascript: links", !/href=["']javascript:/i.test(html));
check("app has a clipboard fallback", app.includes("execCommand(\"copy\")"));
check("app supports deep links", app.includes("#p/"));
check("app persists the shortlist", app.includes("vu.favorites.v1"));
check("app persists the theme", app.includes("vu.theme.v1"));

// ---------- docs / release ----------
const required = [
  "README.md", "AGENTS.md", "CHANGELOG.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md",
  "SECURITY.md", "SUPPORT.md", "LICENSE", "THIRD_PARTY_NOTICES.md", "state.json",
  "docs/README.md", "docs/ARCHITECTURE.md", "docs/REPRODUCTION.md", "docs/PROVENANCE.md",
  "docs/DESIGN.md", "docs/TESTING.md", "docs/DEPLOYMENT.md", "docs/DECISIONS.md",
  "docs/ACCESSIBILITY.md", "docs/PERFORMANCE.md", "docs/PRIVACY.md", "docs/FAQ.md",
  "docs/ROADMAP.md", "docs/CATALOG.md", "scripts/build.py", "scripts/extract-session.py", "scripts/parse-source.py",
  "tests/browser.test.mjs", "assets/favicon.svg", "assets/studio.png", "assets/detail.png",
  "assets/mobile.png", "robots.txt", "sitemap.xml", ".nojekyll",
];
const absent = required.filter((f) => !exists(f));
check("release files exist", absent.length === 0, absent.join(", "));

const state = JSON.parse(read("state.json"));
check("state records the model", state.model?.id === "deepseek-v4.1-flash" && state.model?.provider === "opencode-go");
check("state records OpenCode", state.credits?.tool === "OpenCode");
check("state usage total adds up",
  (state.usage?.inputTokens || 0) + (state.usage?.outputTokens || 0) + (state.usage?.reasoningTokens || 0) +
  (state.usage?.cacheReadTokens || 0) + (state.usage?.cacheWriteTokens || 0) === state.usage?.totalTokens);
check("state records a Pages target", typeof state.deployment?.pages === "string" && state.deployment.pages.startsWith("https://"));

check("README names the catalog", read("README.md").includes("54"));
check("AGENTS names the state file", read("AGENTS.md").includes("state.json"));
check("sitemap contains an absolute URL", /<loc>https:\/\/[^<]+<\/loc>/.test(read("sitemap.xml")));
check("prompt index has 54 rows", (read("prompts/README.md").match(/^\| \d{2} \|/gm) || []).length === 54);
check("catalog doc has 54 rows", (read("docs/CATALOG.md").match(/^\| \d{2} \|/gm) || []).length === 54);

// ---------- secret scan ----------
const secretPatterns = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const scanTargets = ["index.html", "assets/app.js", "data/projects.js", "state.json", "README.md", "AGENTS.md"];
const secrets = scanTargets.filter((f) => secretPatterns.some((re) => re.test(read(f))));
check("no credentials in shipped files", secrets.length === 0, secrets.join(", "));

// ---------- report ----------
const failed = checks.filter((c) => !c.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} static checks passed`);
if (failed.length) {
  console.error("Failed:", failed.map((c) => c.name).join(", "));
  process.exit(1);
}
