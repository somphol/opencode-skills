# Deployment

## Target

- Repository: <https://github.com/somphol/vu_project_ideas>
- Pages: <https://somphol.github.io/vu_project_ideas/>
- Source: `main`, root `/`
- Build: none. Pages serves the committed files.

The repository name uses an underscore, so the URL path does too. All site links are relative, which
keeps the `/vu_project_ideas/` base path working.

## First publish

The machine may have no `gh` CLI. The credential helper already holds a GitHub token from earlier
work. Read it **once** and keep it in the shell; never echo it.

```bash
cd ~/Projects/vu_project_ideas
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
test -n "$TOKEN" && echo "credential ready"
```

### 1. Create the repository (skip if it exists)

```bash
curl -sS -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{
    "name": "vu_project_ideas",
    "description": "54 production-grade build briefs with copy-ready prompts.",
    "homepage": "https://somphol.github.io/vu_project_ideas/",
    "private": false,
    "has_issues": true,
    "has_projects": false,
    "has_wiki": false
  }'
```

A `422` with “name already exists” is fine; continue.

### 2. Commit and push

```bash
git init -b main
git add -A
git commit -m "release: VU Project Ideas 1.0.0"
git remote add origin https://github.com/somphol/vu_project_ideas.git
git push -u origin main
```

One push, one credential use. Do not run `git push` in a loop; do not call `security` or
`git credential fill` repeatedly. If the remote is already configured, skip `remote add`.

### 3. Enable Pages

```bash
curl -sS -X POST https://api.github.com/repos/somphol/vu_project_ideas/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"source":{"branch":"main","path":"/"}}'
```

If Pages is already enabled, update instead:

```bash
curl -sS -X PUT https://api.github.com/repos/somphol/vu_project_ideas/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"source":{"branch":"main","path":"/"}}'
```

### 4. Verify

```bash
curl -sS https://api.github.com/repos/somphol/vu_project_ideas/pages \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('status'), d.get('html_url'))"

for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' https://somphol.github.io/vu_project_ideas/)
  echo "$code"
  [ "$code" = "200" ] && break
  sleep 10
done
```

Then run the browser suite against the live URL:

```bash
TEST_URL=https://somphol.github.io/vu_project_ideas/ node tests/browser.test.mjs --no-shots
```

Pages can take 30–120 seconds for the first build. A `404` immediately after enabling is normal.

## Updating

```bash
python3 scripts/build.py
npm run verify
git add -A
git commit -m "content: …"
git push
```

Pages rebuilds from `main` automatically. `state.json` is a normal tracked file; refresh it in the same
commit as the change it describes.

## Rollback

```bash
git revert <commit>
git push
```

Pages serves the reverted tree after the next build. There is no database or migration to undo.

## Custom domain (optional)

1. Add `CNAME` at the repository root with the apex or subdomain.
2. Configure the DNS record GitHub shows in **Settings → Pages**.
3. Enable **Enforce HTTPS**.
4. Update `sitemap.xml`, the absolute OG URLs in `index.html` and the README live badge.

Do not add a `CNAME` before DNS is ready; it will break the default Pages URL.

## Security notes

- The token is read from the OS credential helper and kept only in the shell variable.
- Never commit `.env`, tokens, private keys or session exports.
- `scripts/verify.mjs` scans shipped files for common credential patterns.
- The site has no server, so there is no runtime secret to leak.

## Publishing the skill backup

The reusable method is mirrored to the skill catalog. See the `vu-project-ideas-studio` skill and
`~/Projects/opencode-skills`:

```bash
cd ~/Projects/opencode-skills
node sync.mjs vu-project-ideas-studio
node sync.mjs --check
git add -A
git commit -m "skill: add vu-project-ideas-studio"
git push
```

The same single credential covers this push. Confirm the catalog URL returns 200 before announcing it.
