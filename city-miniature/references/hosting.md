# Hosting

## Single-file build

`npm run build:single` runs three steps:

1. `tsc --noEmit && vite build` — one JS chunk, one CSS file, every asset inlined.
2. `node scripts/notices.mjs dist/THIRD_PARTY_NOTICES.txt` — licence texts of the production
   dependency closure.
3. `node scripts/inline-build.mjs dist dist-single/index.html` — JS into one inline module script,
   CSS into one `<style>`, notices into an HTML comment.

Output: `dist-single/index.html`, about 1 MB, no external references.

## GitHub Pages

Works unchanged. Pages cannot set response headers, so the strict CSP below is not applied there;
that only removes the sandbox, and a self-contained page makes no requests anyway.

```sh
cp dist-single/index.html /path/to/repo/index.html
```

Then *Settings → Pages → Deploy from a branch → main / (root)*. The page appears at
`https://<user>.github.io/<repo>/`. It also works from a subpath: every reference is relative.

Do not share the `raw.githubusercontent.com` URL (served as `text/plain`); use the Pages URL.

## Sandbox CSP

For hosts that can send headers (Netlify `_headers`, Cloudflare Pages), the file runs inside an
iframe with:

```
sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'
```

In that mode downloads, fullscreen and the external link are hidden and the brand becomes a plain
mark, because they are blocked by the sandbox.

## URL parameters

- `lang=en|zh-CN` (aliases `zh`, `zh-cn`, `zh-hans`, `zh_CN`) — English is the default
- `embed=1` — hides header, title column and collectible line
- `quality=low|high` — forces a rendering tier
- `capture=1` — deterministic stepping for recordings
- `view=topdown|lower|midtown|bridge|alcatraz` — debug starting viewpoint, ignored in capture mode

## Embedding handshake

Only when `window.parent !== window`: after the first frame the page posts
`{ type: 'san-francisco-miniature:ready', version }` with target `'*'`; on failure it posts
`{ type: '…:error', code: 'webgl' }`. Check `event.source`, not the origin, because the frame's
origin is opaque.
