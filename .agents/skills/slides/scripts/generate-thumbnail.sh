#!/usr/bin/env bash
set -e

# Reveal.js Slide Thumbnail Generator Wrapper
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_SCRIPT="$SCRIPT_DIR/generate-thumbnail.ts"

if ! command -v bun &> /dev/null; then
  echo "Error: bun is required to run the slide thumbnail generator."
  exit 1
fi

bun run "$TS_SCRIPT" "$@"
