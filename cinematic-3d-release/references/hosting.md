# Hosting

Two different publishing jobs are covered here: a static project on GitHub Pages, and a
skill catalog that OpenCode can load from one URL.

## Static project on GitHub Pages

1. Build and commit the generated artifact:

   ```sh
   python3 build.py
   git add index.html src build.py
   git commit -m "release: rebuild the single-file app"
   git push origin main
   ```

2. GitHub Pages serves the repository root from `main`. Keep `.nojekyll` at the root if the
   project has paths starting with `_`.
3. Verify after the Pages workflow completes:

   ```sh
   curl -s -o /dev/null -w "%{http_code} %{size_download}\n" \
     https://<user>.github.io/<repo>/
   ```

   Check for a new string from the build, not just HTTP 200. Pages can serve the previous
   build for a minute.

4. Do not edit the generated file in the Pages branch. Rebuild from source and push.

## Skill catalog on GitHub Pages

A catalog is a base URL with `index.json`. OpenCode fetches `<base>/<name>/<file>` for each
listed file. The folder name is the skill ID.

Two layouts work. The published `opencode-skills` catalog uses the root-level layout:

```text
<catalog>/
├── README.md
├── AGENTS.md
├── index.json
└── cinematic-3d-release/
    ├── SKILL.md
    ├── ATTRIBUTION.md
    ├── assets/
    ├── references/
    └── scripts/
```

Base URL: `https://<user>.github.io/<catalog>/`.

The nested alternative keeps the catalog under `skills/`:

```text
<catalog>/
├── README.md
├── AGENTS.md
└── skills/
    ├── index.json
    └── cinematic-3d-release/
        ├── SKILL.md
        ├── ATTRIBUTION.md
        ├── assets/
        ├── references/
        └── scripts/
```

Base URL: `https://<user>.github.io/<catalog>/skills/`.

Either works as long as `index.json` sits at the URL users add to their config and each
skill folder is `<base>/<name>/`.

`index.json`:

```json
{
  "name": "OpenCode skills by <user>",
  "skills": [
    {
      "name": "cinematic-3d-release",
      "version": "<content hash>",
      "description": "…",
      "license": "MIT",
      "files": [
        "SKILL.md",
        "ATTRIBUTION.md",
        "references/method.md",
        "scripts/new-project.mjs",
        "assets/cube-lab/build.py"
      ]
    }
  ]
}
```

Rules:

- Paths are relative and same-origin. No `..`, absolute paths, or other hosts.
- `SKILL.md` must be listed.
- The version must change when files change, or clients keep the cached copy.
- `index.json` must sit at the URL users add to their config.

Generate the version by hashing the sorted file list and contents (first 12 hex characters
of SHA-256). If the catalog repository uses the `skill-publish` `sync-catalog.mjs` script,
let it write the index instead of hand-maintaining versions.

Client config:

```jsonc
{
  "skills": ["https://<user>.github.io/<catalog>/"]
}
```

Append `/skills/` if you used the nested layout.

## Create the GitHub repository without gh

Read the token from the credential helper; never print it.

```sh
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null \
  | sed -n 's/^password=//p')
```

Check the name:

```sh
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<name>   # 404 = free
```

Create it:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"<name>","description":"…","private":false,"has_wiki":false,"has_projects":false}'
```

Push:

```sh
git init
git add -A
git commit -m "feat: publish cinematic-3d-release skill"
git branch -M main
git remote add origin https://github.com/<user>/<name>.git
git push -u origin main
```

Enable Pages:

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<name>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Poll:

```sh
curl -s -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<name>/pages/builds/latest \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('status'))"
```

Verify:

```sh
curl -s -o /dev/null -w "%{http_code}\n" \
  https://<user>.github.io/<name>/skills/index.json
curl -s https://<user>.github.io/<name>/skills/index.json | head -20
```

Then fetch one listed file and confirm it is not a 404.

## Licensing and attribution

- State the licence for the skill repo.
- Record the origin of any reused project in `ATTRIBUTION.md`.
- Keep the original project's `THIRD_PARTY_NOTICES.md` and `LICENSE` in the asset.
- Do not redistribute third-party brand marks or logos.
- If the source has no licence, treat the terms as unknown and keep the repo private or ask
  the author.

## Cache and versioning

Pages caches aggressively. A client keeps a skill until the `version` string changes.
Regenerate the index after any file edit and verify the served `index.json` version.
