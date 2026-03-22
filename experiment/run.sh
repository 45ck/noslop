#!/usr/bin/env bash
# experiment/run.sh — Run identical Claude Code tasks in both project folders
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT="$(cat "$SCRIPT_DIR/task-prompt.md")"

WITH_NOSLOP="$SCRIPT_DIR/with-noslop"
WITHOUT_NOSLOP="$SCRIPT_DIR/without-noslop"

for dir in "$WITH_NOSLOP" "$WITHOUT_NOSLOP"; do
  if [ ! -d "$dir/node_modules" ]; then
    echo "ERROR: $dir not set up. Run:  bash experiment/setup.sh"
    exit 1
  fi
done

echo "=== noslop A/B experiment — running Claude Code ==="
echo ""

# ── Run in with-noslop folder ───────────────────────────────────────────────
echo "────────────────────────────────────────────────────────"
echo "  Running in WITH-NOSLOP folder ..."
echo "────────────────────────────────────────────────────────"
(
  cd "$WITH_NOSLOP"
  claude -p \
    --dangerously-skip-permissions \
    --model sonnet \
    --print \
    "$PROMPT"
)
echo ""
echo "[with-noslop] Claude Code finished."
echo ""

# ── Run in without-noslop folder ────────────────────────────────────────────
echo "────────────────────────────────────────────────────────"
echo "  Running in WITHOUT-NOSLOP folder ..."
echo "────────────────────────────────────────────────────────"
(
  cd "$WITHOUT_NOSLOP"
  claude -p \
    --dangerously-skip-permissions \
    --model sonnet \
    --print \
    "$PROMPT"
)
echo ""
echo "[without-noslop] Claude Code finished."
echo ""

echo "=== Both runs complete. Now run:  bash experiment/compare.sh ==="
