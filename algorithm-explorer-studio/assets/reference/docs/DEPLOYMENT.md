# Deployment

## Target

GitHub Pages, repository root, `main` branch. No build, no artifacts, no environment variables.

```
https://somphol.github.io/algorithm-explorer/
```

`.nojekyll` is committed so Pages does not run Jekyll. `robots.txt` and `sitemap.xml` use the same
canonical origin. `docs/*.md` are served as plain text/Markdown; the app links to them directly.

## First publish

The machine used for this build did **not** have the `gh` CLI. The repository was created through the
GitHub REST API with the credential already stored in the login Keychain, then pushed over HTTPS.

### Keychain-safe procedure (macOS)

The user asked not to trigger repeated Keychain prompts. Do all GitHub operations in **one** shell
invocation so the credential is read once:

```bash
# One prompt at most. Do not echo the token.
TOKEN=$(security find-internet-password -s github.com -w)

# Create the repository (skip if it already exists).
curl -sS -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"algorithm-explorer","private":false,"description":"Interactive 3D studio for the top 15 SWE interview patterns."}'

# Push without embedding the token in .git/config.
git remote add origin https://github.com/somphol/algorithm-explorer.git
git push "https://x-access-token:${TOKEN}@github.com/somphol/algorithm-explorer.git" main

unset TOKEN
```

If repeated prompts still occur, check `git config --global credential.helper`: `osxkeychain` is
expected. Avoid `git credential fill` in a loop. The headless test harness uses
`--use-mock-keychain`, so tests never touch the real Keychain.

### Enable Pages (API)

```bash
curl -sS -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/somphol/algorithm-explorer/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Or use Settings → Pages → Deploy from a branch → `main` / `(root)`.

### Verify

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://somphol.github.io/algorithm-explorer/
TEST_URL=https://somphol.github.io/algorithm-explorer/ node tests/browser.test.mjs
```

Expect `200`, then `35/35 browser checks passed` with zero console errors. GitHub Pages can take
30–90 seconds to publish the first build.

## Subsequent releases

1. Update code, tests and docs together.
2. Run `npm run verify` locally.
3. Regenerate screenshots if the UI changed: `npm run screenshot`.
4. Update `state.json` if counts, verification numbers or deployment status changed.
5. Update `AGENTS.md` in the **same commit**.
6. Commit and push. Pages redeploys automatically.
7. Re-run the live browser suite against the new URL.

## Caching

GitHub Pages serves static files with CDN caching. The HTML is usually short-lived; CSS/JS may be
cached for minutes. If a client sees a stale build, append `?v=<date>` or hard-reload. There is no
service worker to invalidate.

## CDN dependencies

- `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js`

Both are pinned. If a CDN is unreachable, the 3D stage falls back gracefully; the quiz, practice,
code viewer and engines still work. Do not silently upgrade Three.js: r128 is a classic-script build
with global `THREE`, and later releases changed module/addon distribution.

## Rollback

Pages serves `main`. To roll back, revert the offending commit and push; or re-run the previous
successful commit with `git revert`. There is no server state to restore.

## Known operational limits

- No custom domain, no analytics, no forms, no server functions.
- The site is public; there are no secrets in the repository (the static test scans for them).
- The artefact is the repository itself. There is no separate build output to archive.
