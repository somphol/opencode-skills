#!/usr/bin/env python3
"""Build the catalog from the extracted source blocks plus curated metadata.

Inputs
  data/source.json    verbatim title/live/task blocks from the supplied prompt list
  data/metadata.json  curated title, tagline, track, aliases, duplicate markers
  data/prefix.txt     the current standard request prefix ({{TITLE}} placeholder)

Outputs
  data/projects.js    browser payload loaded by index.html
  data/catalog.json   metadata-only feed (no task bodies)
  prompts/*.md        one copy-ready brief per project
  prompts/README.md   index of every brief
  docs/CATALOG.md     human-readable catalog table

Usage: python3 scripts/build.py
"""
from __future__ import annotations

import json
import math
import re
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PROMPTS = ROOT / "prompts"
DOCS = ROOT / "docs"

TRACKS = [
    ("game", "Games & Arcade", "#ff6b4a", "Arcade loops, sports, table games and playful physics."),
    ("puzzle", "Puzzles & Strategy", "#d99a00", "Boards, solvers and games where the thinking is the point."),
    ("stem", "STEM & Algorithms", "#0aa6b8", "Math, code and pattern visualizers that teach by manipulation."),
    ("language", "Language & Reading", "#7a5cff", "Reading, vocabulary, pronunciation and typing studios."),
    ("city", "Cities & Travel", "#19a974", "Landmarks, transit and walkable 3D guides."),
    ("sim", "Simulation & Vehicles", "#3b7ddd", "Vehicles, weather, physics and cockpit-style HUDs."),
    ("calm", "Calm & Focus", "#8b7bb8", "Chanting, meditation, lullabies and ambient study rooms."),
    ("craft", "Creative Studios", "#d65a8c", "Character builders, brick kits and staged performances."),
    ("life", "Tools & Daily Life", "#607080", "Useful everyday interfaces with a considered visual system."),
]

STACK_RULES = [
    ("Three.js", ["three.js"]),
    ("Cannon.js", ["cannon.js"]),
    ("Canvas 2D", ["html5 canvas", "<canvas", "canvas"]),
    ("Web Audio", ["web audio"]),
    ("Web Speech", ["speechsynthesis", "speechrecognition", "web speech"]),
    ("LocalStorage", ["localstorage"]),
    ("JSON I/O", ["save progress", "export game", "export progress", "export/import", "download"]),
    ("EN / TH", ["ภาษาไทย", "bilingual", "thai"]),
    ("Physics", ["physics", "buoyancy", "aerodynamic", "hydrodynamic"]),
    ("AI / Solver", ["solver", "a*", "heuristic", "minimax", "ai opponent", "ai bot"]),
    ("SRS", ["spaced repetition", "srs"]),
    ("Single file", ["single self-contained", "single-file", "single html file", "one self-contained"]),
]

FEATURE_RULES = [
    ("3D / WebGL", ["three.js"]),
    ("Physics", ["physics", "cannon", "buoyancy", "aerodynamic"]),
    ("Procedural audio", ["web audio"]),
    ("Bilingual ENG/TH", ["ภาษาไทย", "thai"]),
    ("Local save + export", ["localstorage", "download", "export"]),
    ("AI opponent / solver", ["solver", "heuristic", "ai opponent", "ai bot"]),
    ("Speech in / out", ["speechsynthesis", "speechrecognition", "web speech"]),
    ("Spaced repetition", ["spaced repetition", "srs"]),
    ("Single-file build", ["single self-contained", "single-file", "single html file", "one self-contained"]),
    ("Canvas rendering", ["canvas"]),
    ("Procedural content", ["procedural"]),
    ("Responsive HUD", ["responsive"]),
]

QUOTE_START = re.compile(r'(?m)^\*?"(Build|Create|Yes, )')


def clean_task(text: str) -> str:
    """Drop conversational lead-ins and the quote wrapper around a master prompt."""
    text = text.strip()
    m = QUOTE_START.search(text)
    if m and m.start() > 0:
        text = text[m.start():].strip()
    while text.startswith('*"') or text.startswith('"'):
        text = text[1:].lstrip()
    while text.endswith('"*') or text.endswith('"'):
        text = text[:-1].rstrip()
    return text.strip()


def slugify(title: str) -> str:
    text = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    text = text.lower().replace("&", " and ").replace("'", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-")


def matches(text: str, needles: list[str]) -> bool:
    return any(n in text for n in needles)


def build() -> None:
    source = json.loads((DATA / "source.json").read_text())
    meta = json.loads((DATA / "metadata.json").read_text())
    prefix = (DATA / "prefix.txt").read_text().strip()

    tracks = [
        {"id": tid, "name": name, "color": color, "description": desc}
        for tid, name, color, desc in TRACKS
    ]
    track_by_id = {t["id"]: t for t in tracks}

    projects = []
    used_slugs: dict[str, int] = {}
    for block in source:
        key = str(block["n"])
        if key not in meta:
            raise SystemExit(f"metadata missing for block {key}: {block['rawTitle']}")
        m = meta[key]
        if m.get("duplicateOf"):
            continue

        title = m["title"]
        task = clean_task(block["task"])
        slug = slugify(title)
        used_slugs[slug] = used_slugs.get(slug, 0) + 1
        if used_slugs[slug] > 1:
            slug = f"{slug}-{used_slugs[slug]}"

        low = task.lower()
        stack = [label for label, needles in STACK_RULES if matches(low, needles)][:6]
        features = [label for label, needles in FEATURE_RULES if matches(low, needles)][:6]
        words = len(task.split())
        chars = len(task)
        size = "S" if words < 380 else "M" if words <= 650 else "L"

        projects.append({
            "id": slug,
            "n": len(projects) + 1,
            "title": title,
            "tagline": m["tagline"],
            "track": m["track"],
            "trackName": track_by_id[m["track"]]["name"],
            "stack": stack,
            "features": features,
            "live": block.get("live"),
            "size": size,
            "words": words,
            "chars": chars,
            "readMinutes": max(1, math.ceil(words / 220)),
            "sourceTitle": block["rawTitle"],
            "aliases": m.get("aliases", []),
            "promptFile": f"{len(projects) + 1:02d}-{slug}.md",
            "task": task,
        })

    # Fail loudly rather than shipping a partial catalog.
    ids = [p["id"] for p in projects]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate ids in catalog")
    for p in projects:
        if len(p["task"]) < 200:
            raise SystemExit(f"task too short: {p['id']}")
        if "Can you create new project in ~/Projects" in p["task"]:
            raise SystemExit(f"old request prefix leaked into task: {p['id']}")

    payload = {
        "version": "1.0.0",
        "updated": date.today().isoformat(),
        "prefix": prefix,
        "tracks": tracks,
        "projects": projects,
    }

    (DATA / "projects.js").write_text(
        "/* Generated by scripts/build.py — edit data/source.json, data/metadata.json or data/prefix.txt. */\n"
        "window.VU_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )

    catalog = {
        "version": payload["version"],
        "updated": payload["updated"],
        "counts": {
            "projects": len(projects),
            "tracks": len(tracks),
            "words": sum(p["words"] for p in projects),
            "live": sum(1 for p in projects if p["live"]),
        },
        "tracks": tracks,
        "projects": [
            {k: v for k, v in p.items() if k != "task"} for p in projects
        ],
    }
    (DATA / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")

    PROMPTS.mkdir(exist_ok=True)
    for old in PROMPTS.glob("*.md"):
        old.unlink()
    for p in projects:
        prompt = prefix.replace("{{TITLE}}", p["title"]) + "\n\n" + p["task"]
        body = (
            "---\n"
            f"id: {p['id']}\n"
            f"title: {json.dumps(p['title'], ensure_ascii=False)}\n"
            f"track: {p['trackName']}\n"
            f"order: {p['n']}\n"
            f"words: {p['words']}\n"
            f"live: {p['live'] or 'null'}\n"
            "---\n\n"
            f"# {p['title']}\n\n"
            f"> {p['tagline']}\n\n"
            f"**Track:** {p['trackName']} · **Brief size:** {p['size']} · "
            f"**Words:** {p['words']:,} · **Read:** ~{p['readMinutes']} min\n\n"
            "Copy the block below into your coding agent. It is the current request prefix plus the\n"
            "original build brief, verbatim.\n\n"
            "````text\n"
            f"{prompt}\n"
            "````\n\n"
            "---\n\n"
            f"Source label in the supplied list: `{p['sourceTitle']}`.  \n"
            f"Catalog: <https://somphol.github.io/vu_project_ideas/#p/{p['id']}>\n"
        )
        (PROMPTS / f"{p['n']:02d}-{p['id']}.md").write_text(body)

    prompt_rows = "\n".join(
        f"| {p['n']:02d} | [{p['title']}]({p['n']:02d}-{p['id']}.md) | {p['trackName']} | {p['size']} | {p['words']:,} |"
        for p in projects
    )
    (PROMPTS / "README.md").write_text(
        "# Copy-ready prompts\n\n"
        "One Markdown file per brief. Each file contains the current request prefix and the original\n"
        "task body, ready to paste into OpenCode, Claude Code, Cursor or any other coding agent.\n\n"
        f"**{len(projects)} briefs · {sum(p['words'] for p in projects):,} words of specification.**\n\n"
        "| # | Brief | Track | Size | Words |\n"
        "| ---: | --- | --- | :---: | ---: |\n"
        f"{prompt_rows}\n\n"
        "Generated by `scripts/build.py`. Do not edit these files by hand.\n"
    )

    doc_rows = "\n".join(
        f"| {p['n']:02d} | [{p['title']}](https://somphol.github.io/vu_project_ideas/#p/{p['id']}) | "
        f"{p['trackName']} | {p['size']} | {p['words']:,} | {p['live'] or '—'} |"
        for p in projects
    )
    (DOCS / "CATALOG.md").write_text(
        "# Catalog\n\n"
        f"{len(projects)} briefs across {len(tracks)} tracks. Generated from `data/projects.js` by\n"
        "`scripts/build.py`; do not edit by hand.\n\n"
        "| # | Brief | Track | Size | Words | Live |\n"
        "| ---: | --- | --- | :---: | ---: | --- |\n"
        f"{doc_rows}\n"
    )

    counts = catalog["counts"]
    print(f"built {counts['projects']} projects · {counts['tracks']} tracks · "
          f"{counts['words']:,} words · {counts['live']} live")
    print(f"wrote data/projects.js ({ (DATA / 'projects.js').stat().st_size / 1024:.0f} KB), "
          f"data/catalog.json, {len(projects)} prompt files, docs/CATALOG.md")


if __name__ == "__main__":
    build()
