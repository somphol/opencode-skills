# Support

## Use the repository

- **Live site:** <https://somphol.github.io/aurelis-calibre-07/>
- **Issues:** <https://github.com/somphol/aurelis-calibre-07/issues>
- **Docs:** [`README.md`](README.md), [`docs/`](docs/), [`AGENTS.md`](AGENTS.md)

## Common questions

**The watch is missing.** WebGL is required. Enable hardware acceleration or try a current Chrome.
Without WebGL the editorial copy still loads, with a short explanation in place of the model.

**The fonts look wrong.** Serve over HTTP, not `file://`. The self-hosted Bodoni Moda files live in
`fonts/`; a direct file open blocks ES modules and may block font loading.

**`npm run serve` says the port is in use.** Another server is using 4173. Stop it or run
`python3 -m http.server 8000` and open that port instead.

**`npm run verify` cannot find Chrome.** Set `CHROME_PATH` to the Chrome executable.

**Can I buy the watch?** No. Aurelis is a fictional maison. The price, specifications and
appointment form are part of a design study and have no commercial meaning.

**Can I reuse the code?** Yes, under the MIT licence. The fonts are OFL and Three.js is MIT; see
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The fictional brand is not a trademark you should
adopt for a real product.

**Can I reuse the approach?** Yes — the `calibre-scroll-studio` skill distils the method, the
timeline maths and the verification gate for another agent.
