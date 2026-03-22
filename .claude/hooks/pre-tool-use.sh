#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
INPUT=$(cat)

# Extract command from JSON input (jq-free)
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' \
  | sed 's/^"command"[[:space:]]*:[[:space:]]*"//;s/"$//')

# If extraction fails (non-Bash tool), allow through
if [ -z "$COMMAND" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

if echo "$COMMAND" | grep -qF -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks and is not allowed."}'
  exit 0
fi

if echo "$COMMAND" | grep -qiF 'SKIP_CI'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

if echo "$COMMAND" | grep -qF '[skip ci]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

if echo "$COMMAND" | grep -qw 'eslint' && echo "$COMMAND" | grep -qF -- '--no-eslintrc'; then
  echo '{"decision":"block","reason":"noslop: disabling ESLint rules via CLI flags is not allowed."}'
  exit 0
fi

echo '{"decision":"allow"}'
