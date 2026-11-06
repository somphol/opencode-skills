#!/usr/bin/env python3
"""Parse a pasted prompt list into data/source.json.

The list format is one block per project:

    VU - Projects - Project Name
    [optional live URL]
    Can you create new project in ~/Projects to host this Project Name project
    ... repeated request prefix ...
    ===========
    TASK: ... verbatim build brief ...

This parser does not curate titles, taglines or tracks. It records the raw
header, any live URL, the task body and a duplicate marker. Curation lives in
data/metadata.json; cleaning and generation live in scripts/build.py.

Usage:
  python3 scripts/parse-source.py --input /tmp/vu_raw.txt --out data/source.json
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re

HEADER = re.compile(r"^\s*(?:\(Master/Meta Example\)\s*)?VU\s*-\s*Projects?\s*-\s*(.+?)\s*$")
PREFIX = [
    r"^Can you create new project",
    r"^Please also upload this",
    r"^You should also try NOT",
    r"^At the end also add",
    r"^At the end show me",
    r"^Show me how long",
    r"^Please make sure you document",
    r"^Please also populate",
    r"^After everything is done",
    r"^Please try to minimize",
    r"^Please note that there is almost",
]
PREFIX_RE = [re.compile(p) for p in PREFIX]
SEP = re.compile(r"^\s*=+\+?\s*$")
URL = re.compile(r"^https?://\S+$")


def is_prefix(line: str) -> bool:
    return any(p.match(line) for p in PREFIX_RE)


def parse(text: str) -> list[dict]:
    blocks: list[dict] = []
    current: dict | None = None
    for line in text.splitlines():
        match = HEADER.match(line)
        if match:
            if current:
                blocks.append(current)
            current = {"rawTitle": match.group(1).strip(), "lines": []}
        elif current is not None:
            current["lines"].append(line)
    if current:
        blocks.append(current)

    projects: list[dict] = []
    seen: dict[str, int] = {}
    for block in blocks:
        title = block["rawTitle"]
        live = None
        task_lines: list[str] = []
        started = False
        for line in block["lines"]:
            line = line.rstrip()
            if not started:
                if not line.strip():
                    continue
                if URL.match(line.strip()):
                    if live is None:
                        live = line.strip()
                    continue
                if is_prefix(line):
                    continue
                if SEP.match(line):
                    continue
                started = True
                task_lines.append(line)
            else:
                task_lines.append(line)

        while task_lines:
            tail = task_lines[-1]
            if not tail.strip() or SEP.match(tail) or is_prefix(tail):
                task_lines.pop()
            else:
                break

        task = "\n".join(task_lines).strip()
        task = re.sub(r"\n{3,}", "\n\n", task)
        if not task:
            continue

        key = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
        duplicate_of = seen.get(key)
        seen[key] = seen.get(key, 0) + 1
        projects.append({
            "n": len(projects) + 1,
            "rawTitle": title,
            "live": live,
            "duplicateOf": duplicate_of,
            "task": task,
            "words": len(task.split()),
            "chars": len(task),
        })
    return projects


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=pathlib.Path, required=True)
    ap.add_argument("--out", type=pathlib.Path, required=True)
    args = ap.parse_args()

    projects = parse(args.input.read_text())
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n")
    duplicates = sum(1 for p in projects if p["duplicateOf"])
    print(f"wrote {args.out} · {len(projects)} blocks · {duplicates} duplicate(s)")
    for p in projects:
        print(f"{p['n']:02d}  {p['words']:4}w  {'LIVE' if p['live'] else '    '}  {p['rawTitle'][:70]}")


if __name__ == "__main__":
    main()
