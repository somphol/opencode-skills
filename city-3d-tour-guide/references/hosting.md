# Hosting and release

## Model

Static files, GitHub Pages, no build:

- repository root: `index.html`, `style.css`, `script.js`, `screenshots/`, docs, `.nojekyll`
- Pages source: `main` branch, `/ (root)`
- URLs: `https://<owner>.github.io/<repo>/`
- CDN: Three.js r128 (cdnjs) + OrbitControls r128 (jsDelivr), Google Fonts

No server code, env vars, database or secret is needed at runtime.

## First deploy

1. Create a public repository and push `main`.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Wait for the build to report **built**.
4. Verify `/`, `/style.css`, `/script.js`, `/state.json`, `?selftest=1`.
5. Set the repository homepage and topics (`threejs`, `webgl`, city, tourism, bilingual).

## Cache-busting

`index.html` must load:

```html
<link rel="stylesheet" href="style.css?v=1.2.0">
<script src="script.js?v=1.2.0"></script>
```

Both queries must equal `APP.version`. A stale script with a new HTML shell can produce impossible bug
reports (notably “walking is broken”). The scaffold check enforces the match. Bump APP version and both
queries in the same commit. If a user still sees old behaviour, give them
`https://…/?v=<version>` or ask for a hard refresh.

Do not add a service worker without a versioned cache strategy; stale HTML + stale script is worse than
no offline support.

## Release

```sh
# checks
node --check script.js
node scripts/verify-static.mjs   # in the source project, or skill check.mjs after scaffolding
open 'http://127.0.0.1:8000/?selftest=1'

# version/copy
# bump APP.version, style.css?v=, script.js?v=, README badge, CHANGELOG, state
git add -A
git commit -m "release: vX.Y.Z"
git tag -a vX.Y.Z -m "City 3D vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

Create a GitHub Release from the tag using the changelog section. The release notes should name the
headline, fixes, verification and live URL. Preserve previous tags; do not rewrite public tags.

## Credentials

Use the installed git credential helper. Never commit a token, put one in a remote URL, print it, or
write it into an asset. If the API is needed for repository/Pages/release creation, retrieve the token
once into a variable and reuse it for that batch; do not paste it into commands that are logged. Keep
the published repository public only if it contains no private data or third-party assets you lack
rights to redistribute.

## Verify

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/<repo>/
curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/<repo>/style.css
curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/<repo>/script.js
curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/<repo>/state.json
```

Open `?selftest=1` on the live URL. Pages CDN may take a minute; use a cache-busting query. Confirm the
Pages build status is `built` and the static CI workflow is green.

## Rollback

The site is a static commit. Revert the release commit and push, or move Pages to the previous known-good
commit. There is no database migration. Keep tags/history; publish a patch rather than rewriting a tag.

## Custom domain

1. Add `CNAME` containing the domain (only if controlled).
2. Configure DNS and HTTPS in Pages.
3. Update canonical URLs, Open Graph image URLs and `sitemap.xml`.
4. Re-verify the live self-test.

## Privacy/security at the host

Static Pages cannot set arbitrary response headers. If the deployment needs CSP/HSTS/referrer policy,
use a host that supports them, or document that the static host does not provide them. The app itself
makes no tracking requests beyond the pinned CDN/fonts; see `PRIVACY.md`.
