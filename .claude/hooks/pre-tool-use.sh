#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
# Receives tool call JSON on stdin

INPUT=$(cat)

# Extract command using jq for robust JSON parsing (handles escaped quotes correctly).
# Falls back to empty string if jq is unavailable or field is absent.
if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  echo '{"decision":"block","reason":"noslop: jq is required for hook security parsing. Install jq."}'
  exit 0
fi

# Block --no-verify (matches flag anywhere in command string)
if echo "$COMMAND" | grep -qF -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks. Fix the underlying issue instead."}'
  exit 0
fi

# Block SKIP_CI env var tricks
if echo "$COMMAND" | grep -qiF 'SKIP_CI'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi
if echo "$COMMAND" | grep -qF '[skip ci]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

# Block ESLint flag tampering
if echo "$COMMAND" | grep -qF 'eslint' && echo "$COMMAND" | grep -qF -- '--no-eslintrc'; then
  echo '{"decision":"block","reason":"noslop: disabling ESLint rules via CLI flags is not allowed."}'
  exit 0
fi

# Block direct Edit/Write tool calls to quality gate config files
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_BASE=$(basename "$FILE_PATH")
  case "$FILE_BASE" in
    eslint.config.*|prettier.config.*|tsconfig*.json|vitest.config.*|jest.config.*|.dependency-cruiser*|knip.config.*)
      echo '{"decision":"block","reason":"noslop: quality gate configs are protected — modify rules via noslop install, not direct edits."}'
      exit 0
      ;;
  esac
fi

# Block direct Edit/Write tool calls to quality gate config files
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_BASE=$(basename "$FILE_PATH")
  case "$FILE_BASE" in
    eslint.config.*|prettier.config.*|tsconfig*.json|vitest.config.*|jest.config.*|.dependency-cruiser*|knip.config.*)
      echo '{"decision":"block","reason":"noslop: quality gate configs are protected — modify rules via noslop install, not direct edits."}'
      exit 0
      ;;
  esac
fi

echo '{"decision":"allow"}'
