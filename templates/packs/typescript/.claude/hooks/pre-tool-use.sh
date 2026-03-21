#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
# Receives tool call JSON on stdin

INPUT=$(cat)

# Extract command using jq for robust JSON parsing (handles escaped quotes correctly).
# Falls back to empty string if jq is unavailable or field is absent.
if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  echo '{"decision":"block","reason":"noslop: jq is not installed. The pre-tool-use hook requires jq to parse tool call JSON. Install jq (apt-get install jq / brew install jq) then retry your command."}'
  exit 0
fi

# Block --no-verify (matches flag anywhere in command string)
if echo "$COMMAND" | grep -qF -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks and is not allowed. Run '\''noslop check --tier=fast'\'' to see what is failing, fix the reported errors, then commit without --no-verify."}'
  exit 0
fi

# Block SKIP_CI env var tricks
if echo "$COMMAND" | grep -qiF 'SKIP_CI'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns (SKIP_CI, [skip ci]) are not allowed. CI is the authoritative quality gate and cannot be bypassed. Remove the skip pattern and let CI run normally."}'
  exit 0
fi
if echo "$COMMAND" | grep -qF '[skip ci]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns (SKIP_CI, [skip ci]) are not allowed. CI is the authoritative quality gate and cannot be bypassed. Remove the skip pattern and let CI run normally."}'
  exit 0
fi

# Block ESLint flag tampering
if echo "$COMMAND" | grep -qw 'eslint' && echo "$COMMAND" | grep -qF -- '--no-eslintrc'; then
  echo '{"decision":"block","reason":"noslop: disabling ESLint via --no-eslintrc is not allowed. Fix the lint errors reported by '\''npx eslint .'\'' instead of disabling the config. Run '\''noslop check --tier=fast'\'' to see all failures."}'
  exit 0
fi

# Block direct Edit/Write tool calls to quality gate config files
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_BASE=$(basename "$FILE_PATH")
  # Block edits to gate infrastructure files
  case "$FILE_PATH" in
    */.githooks/*|*/.github/workflows/*|*/.claude/hooks/*|*/.claude/settings.json|*/AGENTS.md)
      echo '{"decision":"block","reason":"noslop: gate infrastructure files (.githooks, .github/workflows, .claude/hooks, AGENTS.md) are protected — changes require human review."}'
      exit 0
      ;;
  esac
  case "$FILE_BASE" in
    eslint.config.*|prettier.config.*|tsconfig*.json|vitest.config.*|jest.config.*|.dependency-cruiser*|knip.config.*)
      echo "{\"decision\":\"block\",\"reason\":\"noslop: editing '${FILE_BASE}' is blocked — quality gate configs are protected. To change rules, run 'noslop install' to regenerate from templates, or ask a human to apply the noslop-approved PR label.\"}"
      exit 0
      ;;
  esac
fi

echo '{"decision":"allow"}'
