# Release process

## Versioning

Semantic versioning:

- **MAJOR** — a module or data format breaks compatibility.
- **MINOR** — a new module, language, problem type or other user-facing feature.
- **PATCH** — fixes, copy corrections, accessibility and documentation updates.

The current release is **1.0.2** (2026-11-03), a reproducibility release after
1.0.1 (documentation and quality gates) and 1.0.0 (the app).

## Checklist

### 1. Prepare

- [ ] `main` is clean and CI is green.
- [ ] `node --check script.js` passes.
- [ ] `node scripts/check.mjs` passes.
- [ ] The manual matrix in [TESTING.md](TESTING.md) has been run for the change.
- [ ] Both EN and TH were checked on desktop and 390 px.
- [ ] No new dependency, CDN, remote font or network call entered the runtime.
- [ ] `state.json` was not rewritten to look newer than it is.

### 2. Version and changelog

- [ ] Move `Unreleased` entries in [CHANGELOG.md](../CHANGELOG.md) under the new
      version with today's date.
- [ ] Update the compare/release links at the bottom of the changelog.
- [ ] Update `version` and `date-released` in [CITATION.cff](../CITATION.cff)
      when the citation should point at the new release.
- [ ] Update the version mentioned in [README.md](../README.md).
- [ ] Commit: `chore(release): vX.Y.Z`.

### 3. Tag

```bash
git tag -a v1.0.2 -m "v1.0.2 — reproducibility docs and browser checks"
git push origin main
git push origin v1.0.2
```

### 4. Publish the GitHub Release

Use **Releases → Draft a new release**, select the tag, title it
`vX.Y.Z — <short theme>`, and paste the matching changelog section. Attach no
build artifacts: the repository root is the artifact.

### 5. Verify the live site

```bash
BASE=https://somphol.github.io/khan-trig-unit4-equations-identities-studio
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/style.css"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/script.js"
```

Then open the site, switch all three tabs, change the language, answer one
question, reload, and export progress. Check the console once more.

### 6. Announce

Release notes should state:

- what changed for learners;
- any accessibility or translation changes;
- known limitations;
- the live URL.

## Hotfix

1. Branch from the release tag if `main` has moved on.
2. Apply the smallest possible fix.
3. Run both static checks and the affected manual rows.
4. Release a PATCH version; do not retag an existing version.

## Rollback

Revert the commit on `main` and publish a new PATCH release. Never delete a tag
that learners or citations may reference.
