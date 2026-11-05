# Deployment

## Target

GitHub Pages, repository `somphol/vintage-wurlitzer-lullaby-jukebox`, branch `main`, folder `/`.
The URL is <https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>.

Everything is static. There is no build output, no environment variable, no server and no secret in
the artifact.

## First publication (API recipe)

The local machine uses the git credential helper; the token is never printed or written into the
repository. Create the repository, set the remote, push, then enable Pages.

```bash
# 1. From the project root
git init -b main
git add -A
git commit -m "Wurlitzer Lullaby Studio 1.0.0: 3D bubbler, dual audio engines, bilingual sleep studio"

# 2. Create the remote (token comes from the credential helper)
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"vintage-wurlitzer-lullaby-jukebox","description":"Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio","homepage":"https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/","private":false,"has_issues":true,"has_wiki":false}'
unset TOKEN

# 3. Push
git remote add origin https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox.git
git push -u origin main

# 4. Enable Pages on main / root
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/somphol/vintage-wurlitzer-lullaby-jukebox/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

If the repository already exists, skip creation and use `git remote set-url`/`git push`. If Pages is
already enabled, `PUT /pages` with the same body updates the source.

## Cache and propagation

- Pages CDN caches aggressively. A new commit usually appears in 30–90 s.
- Verify with a cache-busting query: `/?v=$(date +%s)`.
- `.nojekyll` is present so paths starting with `_` are served.
- HTML is served with a short cache; the pinned Three.js module comes from jsDelivr, not Pages.

## Post-deploy verification

```bash
TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ node tests/browser.test.mjs
curl -sI https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ | head
```

Confirm the live suite reports 22/22 browser checks, 23/23 in-page, zero console errors. Also open
`?selftest` in a real browser once; headless Chrome can pass while a platform-specific font or audio
policy differs.

## Rollback

```bash
git revert <bad-commit>          # preferred: a new commit with a clear message
git push origin main
```

Pages will serve the previous artifact after the CDN refreshes. Avoid force-pushing `main`; the
deployed URL and the links in `state.json` assume a linear history.

## Custom domain (optional)

Add a `CNAME` file with the apex/host, configure the DNS record GitHub shows in Settings → Pages, and
update `sitemap.xml`, `robots.txt`, the Open Graph URLs and `state.json`. Do not add a CNAME unless the
DNS is ready; it breaks the default `github.io` URL.

## CI

`.github/workflows/ci.yml` runs the Node suites and the headless browser suite on every push and PR.
It uses the runner's Chrome (or sets `CHROME=/usr/bin/google-chrome`) and does not need secrets. The
live suite remains a manual release step because it depends on the deployed artifact.
