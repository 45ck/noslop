#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
# Receives tool call JSON on stdin

INPUT=$(cat)
TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

# Block --no-verify
if echo "$COMMAND" | grep -q -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks. Fix the underlying issue instead."}'
  exit 0
fi

# Block SKIP_CI env var tricks
if echo "$COMMAND" | grep -qi 'SKIP_CI\|skip_ci\|\[skip ci\]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

# Block ESLint flag tampering
if echo "$COMMAND" | grep -q 'eslint' && echo "$COMMAND" | grep -q -- '--no-eslintrc\|--rule.*off'; then
  echo '{"decision":"block","reason":"noslop: disabling ESLint rules via CLI flags is not allowed."}'
  exit 0
fi

echo '{"decision":"allow"}'
