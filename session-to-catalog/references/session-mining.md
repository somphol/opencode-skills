# Mining the session database

The live store is `~/.local/share/opencode/opencode.db` (SQLite, WAL). Read-only queries are safe
while OpenCode runs. `~/.local/share/opencode/log` holds raw logs and is not needed.

## Tables that matter

- `session_v2` — id, title, directory, parent_id, model, tokens, cost, time_created/updated.
- `session_message` — one row per turn: `type` (`user` / `assistant`), `seq`, `data` (JSON).
- `session_part` — parts of a message; tool input lives here for some versions.
- `project`, `worktree` — map directories to projects.

Message payloads are JSON text: user/assistant text is at `$.text`.

## List recent sessions

```sh
sqlite3 -header -column ~/.local/share/opencode/opencode.db \
"select id, substr(title,1,60) title, directory,
        datetime(time_created/1000,'unixepoch','localtime') created
 from session_v2 order by time_created desc limit 20;"
```

## Find every session that touched a project

Match the **path**, not the bare name. The skills catalogue in every system prompt mentions skill
names, so `like '%leab%'` matches nearly all sessions and tells you nothing.

```sh
sqlite3 -header -column ~/.local/share/opencode/opencode.db \
"select s.id, substr(s.title,1,50) title, count(m.id) hits
 from session_v2 s join session_message m on m.session_id = s.id
 where m.data like '%Projects/leab-tui-3d%'
 group by s.id order by s.time_created;"
```

`session_part` is often empty of paths even when `session_message` has thousands of matches; check
`session_message` first.

## Find the turns worth reading

Read the user's asks, not the assistant's prose. Their complaints are the durable lessons.

```sh
sqlite3 ~/.local/share/opencode/opencode.db \
"select seq || ' | ' || replace(substr(json_extract(data,'\$.text'),1,130), char(10), ' ')
 from session_message
 where session_id = 'ses_xxx' and type = 'user'
 order by seq desc limit 25;"
```

Narrow to a range with `seq between A and B`. Message counts and costs:

```sh
sqlite3 -header -column ~/.local/share/opencode/opencode.db \
"select count(*) msgs, round(tokens_input/1e6,2) m_in, round(tokens_output/1e3,0) k_out,
        round(tokens_cache_read/1e6,1) m_cache
 from session_message m join session_v2 s on s.id = m.session_id
 where s.id = 'ses_xxx';"
```

## Cross-check against the artifact

A session's own changelog is cheaper and more accurate than its transcript. For a project, read the
release notes for the same dates (`CHANGELOG.md`, `STATE.md`, `docs/HANDOFF.md`, `git log --date`),
then use the transcript only to recover **why** a rule exists and **what broke**.

Do not paste transcript text into a skill. Rewrite the mechanism, name the symptom, give the fix.

## Traps

| Trap | Reality |
| --- | --- |
| `session_message` `type` is missing | some rows use `user`/`assistant`; inspect before filtering |
| `data` is not plain text | it is JSON; use `json_extract(data,'$.text')` |
| DB has all sessions | only exported ones are in `~/opencode-transcripts` |
| Archive is the master copy | it is for transcripts; the DB is where unexported sessions live |
| Cost column is 0 | rely on token columns; cost may be unset for subscription plans |
