# Hosting

The output is one static HTML file. The hosting pattern is reusable; the slug, locales, URL
parameters and copy are the target city's.

## Single-file build

The reference uses three steps:

1. `tsc --noEmit && vite build` — one JS chunk, one CSS file, every asset inlined.
2. `node scripts/notices.mjs dist/THIRD_PARTY_NOTICES.txt` — licence texts of the production
   dependency closure.
3. `node scripts/inline-build.mjs dist dist-single/index.html` — JS into one inline module script,
   CSS into one `<style>`, notices into an HTML comment.

A new project can use the same pattern with its own scripts. Output: `dist-single/index.html`,
roughly 0.5–1.5 MB, no external references.

## GitHub Pages

Works unchanged. Pages cannot set response headers, so the strict CSP below is not applied there;
that only removes the sandbox, and a self-contained page makes no requests anyway.

```sh
cp dist-single/index.html /path/to/repo/docs/index.html
```

Then *Settings → Pages → Deploy from a branch → main / docs* (or `main / (root)`). The page appears
at `https://<user>.github.io/<repo>/`. It also works from a subpath: every reference is relative.
Keep a `.nojekyll` file in the published folder if you use a docs folder.

Do not publish the reference build or share a `raw.githubusercontent.com` URL (served as
`text/plain`); use the Pages URL of the target project.

## Sandbox CSP

For hosts that can send headers (Netlify `_headers`, Cloudflare Pages), the file runs inside an
iframe with:

```
sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'
```

In that mode downloads, fullscreen and the external link are hidden and the brand becomes a plain
mark, because they are blocked by the sandbox.

## URL parameters

Use the target's own set; the reference's are examples:

- `lang=<target locales>` — the default and the aliases
- `embed=1` — hides header, title column and collectible line
- `quality=low|high` — forces a rendering tier
- `capture=1` — deterministic stepping for recordings
- `view=<target debug views>` — debug starting viewpoint, ignored in capture mode

Document the actual values in the project README. Do not keep the reference's `?view=bridge` or
locale aliases unless they mean something in the target city.

## Embedding handshake

Only when `window.parent !== window`: after the first frame the page posts
`{ type: '<target-slug>:ready', version }` with target `'*'`; on failure it posts
`{ type: '<target-slug>:error', code: 'webgl' }`. Check `event.source`, not the origin, because the
frame's origin is opaque.

## Caching

The file name is stable, so a browser or CDN may cache the old build. After a deploy, hard-refresh or
append a version query string; for a CDN, purge the path or use a short cache TTL for `index.html`.
The scene has no service worker and no versioned API.
