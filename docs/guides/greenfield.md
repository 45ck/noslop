# Greenfield guide

Starting a new project with quality gates from the first commit.

## setup vs init

| Command                   | When to use                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `noslop setup`            | Interactive wizard; guides you through pack selection; good when you are unsure |
| `noslop init --pack {id}` | Non-interactive; good for scripting, CI bootstrap, or when you know which pack  |

For a new project where you know the stack, `noslop init --pack {id}` is faster. Use `noslop setup` to explore options interactively.

## Wizard walkthrough

Running `noslop setup` starts an interactive session:

```
$ noslop setup

◆  noslop setup
│
◇  Which language pack should we install?
│  ● TypeScript
│  ○ JavaScript
│  ○ Rust
│  ○ .NET / C#
│  ○ Python
│  ○ Go
│  ○ Java
│  ○ Ruby
│  ○ Kotlin
│  ○ Swift
│  ○ PHP
│  ○ Scala
│  ○ Elixir
│  ○ Dart
│  ○ Haskell
│  ○ Lua
│  ○ C / C++
│  ○ Zig
│  ○ OCaml
│
◇  Target directory?
│  . (current directory)
│
◇  Existing files will be overwritten. Continue?
│  Yes
│
◆  Installing TypeScript pack...
│  ✓  .githooks/pre-commit
│  ✓  .githooks/pre-push
│  ✓  .githooks/commit-msg
│  ✓  .github/workflows/quality.yml
│  ✓  .github/workflows/guardrails.yml
│  ✓  .claude/settings.json
│  ✓  .claude/hooks/pre-tool-use.sh
│  ✓  eslint.config.js
│  ✓  scripts/check
│  ✓  scripts/fmt
│  ✓  scripts/lint
│  ✓  scripts/test
│  ✓  AGENTS.md
│  ✓  git config core.hooksPath = .githooks
│
◆  Done! Run noslop doctor to verify.
```

After the wizard completes, run `noslop doctor` to confirm everything is wired correctly.

## Recommended starting configs

### TypeScript

```sh
npm create vite@latest my-app -- --template typescript
cd my-app
git init
noslop init --pack typescript
noslop doctor
```

### Rust

```sh
cargo new my-project
cd my-project
# cargo new initialises a git repo automatically; no git init needed
noslop init --pack rust
noslop doctor
```

### .NET / C#

```sh
dotnet new webapi -o my-api
cd my-api
git init
noslop init --pack dotnet
noslop doctor
```

### Python

```sh
mkdir my-service && cd my-service
git init
python -m venv .venv
echo "*.venv/" >> .gitignore
noslop init --pack python
noslop doctor
```

### Go

```sh
mkdir my-service && cd my-service
git init
go mod init github.com/you/my-service
noslop init --pack go
noslop doctor
```

## Greenfield monorepo recipe

```sh
mkdir my-app && cd my-app
git init

# Set up sub-projects
mkdir frontend && cd frontend
npm create vite@latest . -- --template typescript
cd ..

mkdir backend && cd backend
go mod init github.com/you/my-app/backend
cd ..

# Install both packs from the root
noslop init --pack typescript --pack go
noslop doctor
```

## First commit checklist

Before pushing to GitHub:

- [ ] `noslop doctor` exits 0
- [ ] Test the pre-commit hook: make a small commit and confirm the hook runs
- [ ] `noslop check --tier=slow` passes
- [ ] Set GitHub branch protection rules:
  - Require status checks: `quality` and `guardrails`
  - Require at least 1 PR review before merging
  - Dismiss stale reviews on new pushes
- [ ] Confirm `quality.yml` appears in GitHub Actions after the first push
