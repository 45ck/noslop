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

echo '{"decision":"allow"}'
