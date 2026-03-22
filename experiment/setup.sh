#!/usr/bin/env bash
# experiment/setup.sh — Scaffold two identical calculator projects for A/B comparison
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FIXTURE="$PROJECT_ROOT/fixtures/typescript"
EXPERIMENT_DIR="$SCRIPT_DIR"

WITH_NOSLOP="$EXPERIMENT_DIR/with-noslop"
WITHOUT_NOSLOP="$EXPERIMENT_DIR/without-noslop"

echo "=== noslop A/B experiment setup ==="
echo ""

# ── Clean slate ──────────────────────────────────────────────────────────────
for dir in "$WITH_NOSLOP" "$WITHOUT_NOSLOP"; do
  if [ -d "$dir" ]; then
    echo "Removing existing $(basename "$dir")/ ..."
    rm -rf "$dir" 2>/dev/null || true
    # On Windows, directories may linger briefly after rm; wait and retry
    if [ -d "$dir" ]; then
      sleep 2
      rm -rf "$dir" 2>/dev/null || true
    fi
  fi
done

# ── Copy fixture into both folders ───────────────────────────────────────────
# Use mkdir + cp content pattern to avoid cp -r nesting when target dir exists
echo "Copying fixture into with-noslop/ and without-noslop/ ..."
for dir in "$WITH_NOSLOP" "$WITHOUT_NOSLOP"; do
  mkdir -p "$dir"
  cp -r "$FIXTURE"/. "$dir"/
done

# ── Strip .noslop.json from the bare folder (it should have no noslop traces) ─
rm -f "$WITHOUT_NOSLOP/.noslop.json"

# ── Add .gitignore to both (before git init) ────────────────────────────────
for dir in "$WITH_NOSLOP" "$WITHOUT_NOSLOP"; do
  printf 'node_modules/\ncoverage/\n' >> "$dir/.gitignore"
done

# ── npm install in both ─────────────────────────────────────────────────────
echo ""
echo "Installing dependencies in with-noslop/ ..."
(cd "$WITH_NOSLOP" && npm install --silent 2>&1 | tail -3)

echo "Installing dependencies in without-noslop/ ..."
(cd "$WITHOUT_NOSLOP" && npm install --silent 2>&1 | tail -3)

# ── Git init BEFORE noslop install (noslop needs git to set core.hooksPath) ──
echo ""
echo "Initialising git in with-noslop/ ..."
(cd "$WITH_NOSLOP" && git init -q)

echo "Initialising git in without-noslop/ ..."
(cd "$WITHOUT_NOSLOP" && git init -q)

# ── Install noslop in the with-noslop folder ────────────────────────────────
echo ""
echo "Running noslop install --pack typescript in with-noslop/ ..."
node "$PROJECT_ROOT/dist/presentation/cli.js" install --pack typescript --dir "$WITH_NOSLOP"

# ── Initial commit in both ──────────────────────────────────────────────────
echo ""
for dir in "$WITH_NOSLOP" "$WITHOUT_NOSLOP"; do
  name="$(basename "$dir")"
  echo "Creating initial commit in $name/ ..."
  (
    cd "$dir"
    git add -A
    git commit -q --no-verify -m "initial commit"
  )
done

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Setup complete ==="
echo ""

echo "with-noslop/ contents (noslop-added files):"
(cd "$WITH_NOSLOP" && ls -d .githooks/ .claude/ .github/ AGENTS.md scripts/ cspell.json eslint.config.js 2>/dev/null || echo "  (none found)")
echo "  core.hooksPath = $(cd "$WITH_NOSLOP" && git config core.hooksPath 2>/dev/null || echo '(not set)')"
echo ""

echo "without-noslop/ contents:"
(cd "$WITHOUT_NOSLOP" && ls -1 --ignore=node_modules)
echo "  core.hooksPath = $(cd "$WITHOUT_NOSLOP" && git config core.hooksPath 2>/dev/null || echo '(not set)')"
echo ""

echo "Both folders have 1 commit. Ready to run:  bash experiment/run.sh"
