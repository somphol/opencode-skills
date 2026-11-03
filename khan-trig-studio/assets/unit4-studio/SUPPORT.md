# Support

## Before you ask

Most questions are answered in the docs:

| Question | Read |
| -------- | ---- |
| How do I run or deploy it? | [README](README.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| How is the app built? | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Why is the inverse undefined? | [docs/DESIGN.md](docs/DESIGN.md) |
| How do I verify a change? | [docs/TESTING.md](docs/TESTING.md) |
| What accessibility support exists? | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) |
| How do I contribute? | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Where is progress stored? | [README § Data and privacy](README.md#data-and-privacy) |

## Common fixes

- **The inverse curve disappeared.** The selected domain is no longer contained
  in the principal branch. Narrow it back inside the highlighted band.
- **The result says "outside range".** arcsin and arccos accept only `[−1, 1]`.
  arctan accepts every real input.
- **The result says "outside branch".** The input has a valid angle, but that
  angle lies outside the domain you restricted. Widen the domain or choose the
  principal branch.
- **An identity choice is rejected.** Only substitutions that follow from a
  Pythagorean, quotient or reciprocal identity are accepted; "simplifying" by
  combining unlike terms is not.
- **My equation answer is marked wrong.** Answers are checked as a set over
  `[0, 2π)`. Include every solution, separated by commas, and use `2π`-equivalent
  values consistently.
- **Export does nothing.** Some browsers block multiple downloads or require a
  user gesture; try again from the button and check the download shelf.

## Opening an issue

Use the bug report or feature request template. Include module, function,
sliders, expected and actual behaviour, browser/OS, interface language, and
console output.

Security issues must follow [SECURITY.md](SECURITY.md), not the public tracker.

## Scope and expectations

Maintenance is best effort by a single volunteer. There is no guaranteed
response time, SLA, or support for modified forks. Well-scoped reports with
reproduction steps are prioritised.
