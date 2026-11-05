#!/usr/bin/env node
/**
 * Scaffold a new chanting/karaoke studio from the SuatSync 3D reference template.
 *
 *   node scripts/scaffold.mjs <target-dir> [--force]
 *
 * Copies index.html, style.css, script.js, package.json, a content check and a
 * headless verifier. Does not install dependencies. Refuses to write into a
 * non-empty directory unless --force is given.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.resolve(here, "..", "assets", "template");
const targetArg = process.argv[2];
const force = process.argv.includes("--force");

if (!targetArg) {
  console.error("Usage: node scripts/scaffold.mjs <target-dir> [--force]");
  process.exit(1);
}

const target = path.resolve(process.cwd(), targetArg);
if (fs.existsSync(target) && fs.readdirSync(target).length && !force) {
  console.error("Refusing to overwrite non-empty " + target + " (use --force).");
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });
fs.cpSync(template, target, { recursive: true });
fs.mkdirSync(path.join(target, "docs"), { recursive: true });

const pkgPath = path.join(target, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const slug = path.basename(target).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "chant-studio";
pkg.name = slug;
pkg.description = "A bilingual 3D chanting and karaoke studio.";
pkg.version = "0.1.0";
delete pkg.homepage;
delete pkg.repository;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const readme = `# ${slug}

A bilingual 3D chanting and karaoke studio scaffolded from the SuatSync 3D reference.

## Start

\`\`\`bash
python3 -m http.server 8080
# open http://localhost:8080/
\`\`\`

## Make it yours

1. Replace \`INTRO\`, \`VERSES\` and \`OUTRO\` in \`script.js\` with your text, transliteration and glosses.
2. Set \`VIDEO_ID\`, \`NOMINAL_DURATION\`, \`STORAGE_KEY\` and the version.
3. Adjust \`defaultMarkers()\` and the section labels.
4. Rewrite the title, meta description, credits and i18n product copy.
5. Run \`node scripts/check.mjs\` and \`node scripts/verify-browser.mjs\`.

## Release

Add the documentation set, attribution, licence and \`state.json\` described in the
\`suatsync-3d-studio\` skill. Then publish to GitHub Pages.
`;
fs.writeFileSync(path.join(target, "README.md"), readme);

console.log("SCAFFOLDED " + target);
console.log("Next: node scripts/check.mjs && node scripts/verify-browser.mjs");
console.log("Then replace the dataset and branding in index.html and script.js.");
