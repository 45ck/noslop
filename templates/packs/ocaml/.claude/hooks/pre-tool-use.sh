#!/bin/sh
# noslop Claude Code hook: block quality-bypass attempts
INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  echo '{"decision":"block","reason":"noslop: jq is not installed. The pre-tool-use hook requires jq to parse tool call JSON. Install jq (apt-get install jq / brew install jq) then retry your command."}'
  exit 0
fi

if echo "$COMMAND" | grep -qF -- '--no-verify'; then
  echo '{"decision":"block","reason":"noslop: --no-verify bypasses pre-commit hooks and is not allowed. Run '\''noslop check --tier=fast'\'' to see what is failing, fix the reported errors, then commit without --no-verify."}'
  exit 0
fi

if echo "$COMMAND" | grep -qiF 'SKIP_CI' || echo "$COMMAND" | grep -qF '[skip ci]'; then
  echo '{"decision":"block","reason":"noslop: CI-skip patterns (SKIP_CI, [skip ci]) are not allowed. CI is the authoritative quality gate and cannot be bypassed. Remove the skip pattern and let CI run normally."}'
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
    .ocamlformat)
      echo "{\"decision\":\"block\",\"reason\":\"noslop: editing '${FILE_BASE}' is blocked — quality gate configs are protected. To change rules, run 'noslop install' to regenerate from templates, or ask a human to apply the noslop-approved PR label.\"}"
      exit 0
      ;;
  esac
fi

echo '{"decision":"allow"}'
