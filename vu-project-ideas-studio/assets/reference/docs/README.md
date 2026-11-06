# Documentation

| Document | Read it when |
| --- | --- |
| [../README.md](../README.md) | you want the product overview, counts and quick start |
| [../AGENTS.md](../AGENTS.md) | you are an agent picking up the repository |
| [CATALOG.md](CATALOG.md) | you want the generated table of all 54 briefs |
| [REPRODUCTION.md](REPRODUCTION.md) | you need to rebuild the catalog from the original prompt list |
| [PROVENANCE.md](PROVENANCE.md) | you need to know what was cleaned, merged or normalized |
| [ARCHITECTURE.md](ARCHITECTURE.md) | you need the runtime map, data schema and copy flow |
| [DESIGN.md](DESIGN.md) | you are changing the visual language, layout or motion |
| [TESTING.md](TESTING.md) | you are running or extending the release gate |
| [DEPLOYMENT.md](DEPLOYMENT.md) | you are publishing to GitHub Pages or rolling back |
| [DECISIONS.md](DECISIONS.md) | you are about to change a non-obvious choice |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | you are touching keyboard, focus, contrast or motion |
| [PERFORMANCE.md](PERFORMANCE.md) | you are adding data, cards or network requests |
| [PRIVACY.md](PRIVACY.md) | you are adding storage, analytics or a third party |
| [FAQ.md](FAQ.md) | a user asks “why…” |
| [ROADMAP.md](ROADMAP.md) | you are choosing the next feature |
| [../CHANGELOG.md](../CHANGELOG.md) | you need release history |
| [../THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) | you need licences and provenance |

The documentation is part of the release gate: `scripts/verify.mjs` checks that these files exist and
that the generated prompt files and catalog table match the data.
