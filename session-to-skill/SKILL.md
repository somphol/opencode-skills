---
name: Session to Skill
description: Turn a finished session or project into a reusable OpenCode skill — extract the working artifact as a template, write the instructions and references, and prove it by scaffolding a fresh project from it.
version: 1.0.0
---

# Session to Skill

A session that produced something working is worth more than its transcript. This skill converts it
into a reusable package: the artifact as an `assets/` template, model-facing instructions, the
knowledge that is expensive to rediscover, and a scaffold that another agent can run.

Use it after a session where the user says “save this as a skill”, “make this reusable”, or when a
project is finished and will be adapted again.

## Workflow

1. **Name it.** Pick a directory ID in lowercase kebab-case (`city-miniature`, `session-export`),
   ≤64 characters, matching what the user will type as `@id`. The directory name *is* the ID; the
   frontmatter `name` is only a display label.
2. **Decide what is the asset.** Usually the finished project, minus dependencies and build output.
   Copy it to `assets/<name>/` with `node_modules`, `dist`, `dist-single`, `shots`, `film` and
   dotfiles removed. Keep the build inputs, not the build products.
3. **Scaffold.** `node scripts/scaffold-skill.mjs --id <id> --out <path> --description "…"` creates
   the skeleton.
4. **Write `SKILL.md` for a model, not a human.** When to use, workflow with exact commands, module
   map, the two or three recipes that are hard to infer, failure boundaries. No marketing.
5. **Write `references/`.** One file per topic the model should read on demand: `method.md` (order and
   invariants), `lessons.md` (what regresses), `verification.md`, `hosting.md`, `build-log.md` (why it
   is shaped this way, including dead ends). This is where session knowledge belongs.
6. **Ship the tooling that proves it.** A `scripts/new-project.mjs` that copies the template, and a
   verification script. Nothing is “reusable” until scaffolding it produces a working result.
7. **Attribute.** If anything came from elsewhere, write `ATTRIBUTION.md` with what was reused, what is
   new, and the licence status. Do not redistribute third-party brand marks.
8. **Test from a clean directory.** Scaffold into a temp path, install, build, run the checks, and
   compare the output with the original. Then install the skill globally and confirm it loads.

```sh
node scripts/scaffold-skill.mjs --id my-skill --out ~/.config/opencode/skills/my-skill \
  --description "One sentence the model will see"

# prove it
node scripts/new-project.mjs --out /tmp/try
cd /tmp/try && npm ci && npm run build:single && node tests/run.mjs
```

## What belongs where

| File | Audience | Contents |
| --- | --- | --- |
| `SKILL.md` | model, every load | when to use, workflow, module map, recipes, limits |
| `references/*.md` | model, on demand | depth: invariants, regressions, verification, build log |
| `assets/` | scaffolded project | the working artifact, no dependencies or build output |
| `scripts/` | agent, executed | scaffold, verify, export |
| `ATTRIBUTION.md` | humans and models | origin, reused parts, licence status |

## Quality bar

- A fresh scaffold builds and passes its checks with no edits.
- `SKILL.md` names the commands exactly, including flags that matter.
- The hard-won knowledge is written down: the approach that failed, the margin that had to hold, the
  bug caused by a leftover assumption.
- Nothing in the skill needs the session that produced it.

## Failure boundaries

- Do not invent a template from scratch when a working artifact exists — copy it and strip it.
- Do not paste the transcript into the skill; distill it. The transcript belongs in the local archive.
- Do not publish the skill before step 8. Use `skill-publish` for the release itself.
