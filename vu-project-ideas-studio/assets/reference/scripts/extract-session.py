#!/usr/bin/env python3
"""Recover the user prompt text from an OpenCode SQLite session.

This is a provenance tool, not part of the site build. It reads the first user
message of a session and writes it to a UTF-8 text file. It never prints the
prompt body.

Examples
  python3 scripts/extract-session.py --list
  python3 scripts/extract-session.py --session ses_... --out /tmp/vu_raw.txt
  python3 scripts/extract-session.py --text notes/prompt-list.txt --out /tmp/vu_raw.txt
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sqlite3
import sys
from datetime import datetime

DEFAULT_DB = pathlib.Path.home() / ".local" / "share" / "opencode" / "opencode.db"


def list_sessions(db: pathlib.Path, limit: int) -> None:
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    rows = con.execute(
        "SELECT id, title, directory, datetime(time_updated/1000,'unixepoch','localtime') "
        "FROM session_v2 ORDER BY time_updated DESC LIMIT ?",
        (limit,),
    ).fetchall()
    for sid, title, directory, updated in rows:
        print(f"{sid}  {updated}  {directory}  {title or '(untitled)'}")


def from_db(db: pathlib.Path, session: str) -> str:
    if not db.exists():
        raise SystemExit(f"database not found: {db}")
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    row = con.execute(
        "SELECT data FROM session_message WHERE session_id=? AND type='user' ORDER BY seq LIMIT 1",
        (session,),
    ).fetchone()
    if not row:
        raise SystemExit(f"no user message for session {session}")
    try:
        data = json.loads(row[0])
    except json.JSONDecodeError as exc:
        raise SystemExit(f"message is not JSON: {exc}") from exc
    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        raise SystemExit("user message has no text")
    return text


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--db", type=pathlib.Path, default=DEFAULT_DB)
    ap.add_argument("--session", help="session id (ses_…)")
    ap.add_argument("--text", type=pathlib.Path, help="use an existing text file instead of the database")
    ap.add_argument("--out", type=pathlib.Path, required=True)
    ap.add_argument("--list", action="store_true", help="list recent sessions and exit")
    ap.add_argument("--limit", type=int, default=20)
    args = ap.parse_args()

    if args.list:
        list_sessions(args.db, args.limit)
        return

    if args.text:
        text = args.text.read_text()
    elif args.session:
        text = from_db(args.db, args.session)
    else:
        raise SystemExit("pass --session, --text or --list")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(text)
    headers = sum(1 for line in text.splitlines() if line.lstrip().startswith("VU - Project"))
    print(f"wrote {args.out} · {len(text):,} chars · {headers} project headers")
    print(f"captured {datetime.now().astimezone().isoformat(timespec='seconds')}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
