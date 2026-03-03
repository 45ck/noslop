#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  echo '{"decision":"block","reason":"noslop: jq is required for hook security parsing. Install jq."}'
  exit 0
fi

if echo "$COMMAND" | grep -qF -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks."}'
  exit 0
fi

if echo "$COMMAND" | grep -qiF 'SKIP_CI' || echo "$COMMAND" | grep -qF '[skip ci]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns are not allowed."}'
  exit 0
fi

# Block direct Edit/Write tool calls to quality gate config files
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_BASE=$(basename "$FILE_PATH")
  case "$FILE_BASE" in
    checkstyle.xml|pmd.xml)
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
    checkstyle.xml|pmd.xml)
      echo '{"decision":"block","reason":"noslop: quality gate configs are protected — modify rules via noslop install, not direct edits."}'
      exit 0
      ;;
  esac
fi

echo '{"decision":"allow"}'
