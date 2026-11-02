# GitHub setup without gh

`git` and a stored credential are usually enough; `gh` is optional. Never echo a token — read it into
a variable and use it in headers.

```sh
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null \
  | sed -n 's/^password=//p')
```

## Who am I

```sh
curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/user \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['login'])"
```

## Check the name is free

```sh
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<name>      # 404 = free
```

## Create the repository

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"<name>","description":"…","private":false,"has_wiki":false,"has_projects":false}'
```

`"private":true` for anything that should not be public. Public is required for free Pages.

## Push

```sh
git init && git add -A && git commit -m "…"
git branch -M main
git remote add origin https://github.com/<user>/<name>.git
git push -u origin main
```

The macOS keychain helper supplies the credential; do not embed a token in the remote URL.

## Enable Pages

```sh
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<name>/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Poll the build, then check the URL:

```sh
curl -s -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/<user>/<name>/pages/builds/latest \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('status'))"
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://<user>.github.io/<name>/
```

Pages returns `200` only after the build reports `built`; allow a minute.

## Token scopes

| Action | Scope |
| --- | --- |
| Read repo, push over HTTPS | `repo` |
| Create a repository | `repo` |
| Enable Pages | `repo` |
| **Delete a repository** | **`delete_repo`** — a normal token returns `403` |

If a delete returns 403, the repository still exists. Either grant `delete_repo` (classic PAT or a
fine-grained token with repository deletion) and retry, or delete it at
`https://github.com/<user>/<repo>/settings` → Danger zone.

## Licensing before you publish

Check that you may redistribute what you are about to push:

- Your own work: state a licence or say nothing is granted.
- Derived work: record the origin in `ATTRIBUTION.md`, and if the source carried no licence, treat the
  terms as unknown — confirm with the author or keep the repository private.
- Third-party brand marks, logos and fonts: do not redistribute them; replace them with a neutral
  identity.
