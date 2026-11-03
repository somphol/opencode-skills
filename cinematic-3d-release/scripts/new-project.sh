#!/bin/sh
# POSIX fallback for new-project.mjs.
#
#   sh scripts/new-project.sh ~/my-project [--force]

set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: sh scripts/new-project.sh <dir> [--force]" >&2
  exit 2
fi

out=$1
force=${2:-}
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
asset="$here/../assets/cube-lab"

if [ ! -d "$asset" ]; then
  echo "Missing reference asset: $asset" >&2
  exit 1
fi

if [ -d "$out" ] && [ -n "$(ls -A "$out" 2>/dev/null)" ] && [ "$force" != "--force" ]; then
  echo "$out is not empty. Pass --force to merge into it." >&2
  exit 2
fi

mkdir -p "$out"
cp -R "$asset"/. "$out"/

if [ -d "$out/project-docs" ] && [ ! -d "$out/docs" ]; then
  mv "$out/project-docs" "$out/docs"
fi

[ -f "$out/.gitignore" ] || printf '.DS_Store\nThumbs.db\nnode_modules/\n*.log\n_site/\n.env\n' > "$out/.gitignore"
[ -f "$out/.nojekyll" ] || : > "$out/.nojekyll"

echo "Copied the reference project to $out"
echo "Building index.html…"
(cd "$out" && python3 build.py)

cat <<EOF

Next:
  cd $out
  python3 -m http.server 8000
  open http://localhost:8000/index.html?selftest   # expect RESULT PASS

Then read references/method.md and adapt the presentation layer to your own subject.
Do not ship the CubeLab copy as-is; replace the subject, copy, and branding.
EOF
