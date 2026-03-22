#!/usr/bin/env bash
# experiment/compare.sh — Run quality checks on both folders and compare results
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WITH_NOSLOP="$SCRIPT_DIR/with-noslop"
WITHOUT_NOSLOP="$SCRIPT_DIR/without-noslop"

# Colours (if terminal supports them)
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

pass() { echo -e "  ${GREEN}PASS${NC} $1"; }
fail() { echo -e "  ${RED}FAIL${NC} $1"; }
skip() { echo -e "  ${YELLOW}SKIP${NC} $1"; }

run_checks() {
  local dir="$1"
  local label="$2"

  echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}  $label${NC}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════${NC}"
  echo ""

  cd "$dir"

  # ── Formatting ──────────────────────────────────────────
  echo -e "${BOLD}Formatting (prettier):${NC}"
  if npx prettier . --check > /dev/null 2>&1; then
    pass "All files formatted"
  else
    fail "Formatting issues found"
    npx prettier . --check 2>&1 | grep -c "would reformat" | xargs -I{} echo "    {} file(s) need formatting"
  fi
  echo ""

  # ── Linting ─────────────────────────────────────────────
  echo -e "${BOLD}Linting (eslint):${NC}"
  if [ -f eslint.config.mjs ] || [ -f eslint.config.js ] || [ -f .eslintrc.json ]; then
    lint_output=$(npx eslint . --max-warnings=0 2>&1) && lint_exit=0 || lint_exit=$?
    if [ $lint_exit -eq 0 ]; then
      pass "No lint errors or warnings"
    else
      fail "Lint issues found"
      echo "$lint_output" | tail -5 | sed 's/^/    /'
    fi
  else
    skip "No eslint config found"
  fi
  echo ""

  # ── Type checking ───────────────────────────────────────
  echo -e "${BOLD}Type checking (tsc):${NC}"
  tsc_output=$(npx tsc -p tsconfig.json --noEmit 2>&1) && tsc_exit=0 || tsc_exit=$?
  if [ $tsc_exit -eq 0 ]; then
    pass "No type errors"
  else
    fail "Type errors found"
    echo "$tsc_output" | tail -5 | sed 's/^/    /'
  fi
  echo ""

  # ── Tests ───────────────────────────────────────────────
  echo -e "${BOLD}Tests (vitest):${NC}"
  test_output=$(npx vitest run 2>&1) && test_exit=0 || test_exit=$?
  if [ $test_exit -eq 0 ]; then
    test_count=$(echo "$test_output" | grep -oP 'Tests\s+\K\d+\s+passed' || echo "?")
    pass "All tests passed ($test_count)"
  else
    fail "Tests failed"
    echo "$test_output" | grep -E "(FAIL|Error|expect)" | head -5 | sed 's/^/    /'
  fi
  echo ""

  # ── Test coverage ───────────────────────────────────────
  echo -e "${BOLD}Test coverage:${NC}"
  cov_output=$(npx vitest run --coverage 2>&1) && cov_exit=0 || cov_exit=$?
  if [ $cov_exit -eq 0 ]; then
    echo "$cov_output" | grep -E "^(All files|%|.*\|.*\|)" | head -10 | sed 's/^/    /'
    if [ -z "$(echo "$cov_output" | grep -E "^(All files|%|.*\|.*\|)")" ]; then
      # Alternative: look for coverage summary lines
      echo "$cov_output" | grep -iE "(statement|branch|function|line)" | head -6 | sed 's/^/    /'
    fi
  else
    fail "Coverage run failed"
  fi
  echo ""

  # ── Spell checking ─────────────────────────────────────
  echo -e "${BOLD}Spell checking (cspell):${NC}"
  if [ -f cspell.json ]; then
    spell_output=$(npx cspell "src/**/*" --no-progress 2>&1) && spell_exit=0 || spell_exit=$?
    if [ $spell_exit -eq 0 ]; then
      pass "No spelling issues"
    else
      fail "Spelling issues found"
      echo "$spell_output" | head -5 | sed 's/^/    /'
    fi
  else
    skip "No cspell.json found"
  fi
  echo ""

  # ── Git hooks ───────────────────────────────────────────
  echo -e "${BOLD}Git hooks:${NC}"
  hooks_path=$(git config core.hooksPath 2>/dev/null || echo "")
  if [ -n "$hooks_path" ]; then
    pass "core.hooksPath = $hooks_path"
    if [ -d "$hooks_path" ]; then
      echo "    Hooks: $(ls "$hooks_path" | tr '\n' ' ')"
    fi
  else
    skip "No custom hooks path configured"
  fi
  echo ""

  # ── Noslop-specific files ──────────────────────────────
  echo -e "${BOLD}Quality infrastructure:${NC}"
  for f in AGENTS.md .claude/settings.json .github/workflows/ci.yml scripts/quality-gate.sh cspell.json; do
    if [ -e "$f" ]; then
      pass "$f exists"
    else
      echo -e "  ${YELLOW}---${NC}  $f not present"
    fi
  done
  echo ""

  # ── Git diff from initial commit ───────────────────────
  echo -e "${BOLD}Changes from initial commit:${NC}"
  git diff --stat HEAD | sed 's/^/    /'
  echo ""
}

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║      noslop A/B Experiment — Quality Comparison         ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

run_checks "$WITH_NOSLOP" "WITH NOSLOP (guardrails active)"
run_checks "$WITHOUT_NOSLOP" "WITHOUT NOSLOP (bare repo)"

echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Comparison complete. Review the results above.${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════${NC}"
