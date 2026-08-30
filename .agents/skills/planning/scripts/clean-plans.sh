#!/usr/bin/env bash
# Delete every plan in .claude/plans/ whose frontmatter status is `complete`.
# Leaves `planned` and `in-progress` plans untouched.
set -euo pipefail

# Resolve the repo's plans dir relative to this script, so it works from anywhere.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
plans_dir="$script_dir/../../../plans"

if [[ ! -d "$plans_dir" ]]; then
  echo "No plans directory at $plans_dir — nothing to clean."
  exit 0
fi

removed=0
shopt -s nullglob
for plan in "$plans_dir"/*.md; do
  # Read only the YAML frontmatter (between the first two `---` lines).
  frontmatter="$(awk 'NR==1 && $0=="---"{f=1;next} f && $0=="---"{exit} f{print}' "$plan")"
  if grep -Eq '^status:[[:space:]]*complete([[:space:]]|#|$)' <<<"$frontmatter"; then
    echo "Removing completed plan: $(basename "$plan")"
    rm -- "$plan"
    removed=$((removed + 1))
  fi
done

echo "Done. Removed $removed completed plan(s)."
