#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

if echo "$COMMAND" | grep -q -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks."}'
  exit 0
fi

if echo "$COMMAND" | grep -qi 'SKIP_CI\|skip_ci\|\[skip ci\]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

echo '{"decision":"allow"}'
