# PHP — noslop pack

> Enforces strict static analysis (PHPStan level 8) and consistent formatting via php-cs-fixer.

## Prerequisites

| Tool         | Version | Install                                             |
| ------------ | ------- | --------------------------------------------------- |
| PHP          | 8+      | [php.net](https://www.php.net/)                     |
| Composer     | latest  | [getcomposer.org](https://getcomposer.org/)         |
| php-cs-fixer | latest  | `composer global require friendsofphp/php-cs-fixer` |
| PHPStan      | latest  | `composer require --dev phpstan/phpstan`            |
| PHPUnit      | latest  | `composer require --dev phpunit/phpunit`            |
| PHPMD        | latest  | `composer require --dev phpmd/phpmd`                |

## Install

```sh
noslop init --pack php   # or: auto-detected from composer.json
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `phpstan.neon` and `phpmd.xml` — PHPStan level 8 type checking and PHPMD ruleset

## Quality rules

| Config file  | Rule                                         | Threshold           |
| ------------ | -------------------------------------------- | ------------------- |
| phpstan.neon | Type strictness                              | level 8 (strictest) |
| phpmd.xml    | Cyclomatic complexity (CyclomaticComplexity) | <= 10               |
| phpmd.xml    | Function length (ExcessiveMethodLength)      | <= 80 lines         |
| phpmd.xml    | File length (ExcessiveClassLength)           | <= 350 lines        |
| phpmd.xml    | Max parameters (ExcessiveParameterList)      | <= 4                |
| phpmd.xml    | Unused code (UnusedCode ruleset)             | Error               |

> **Note:** Cognitive complexity and nesting depth are not enforced — no PHP tool exposes cognitive complexity as a metric, and PHPMD has no nesting-depth rule (it uses NPathComplexity as a combinatorial alternative). PHPMD must be installed separately (`composer require --dev phpmd/phpmd`); noslop installs `phpmd.xml` but does not add it to the fast or slow gate commands. Teams that install PHPMD can run it manually with `vendor/bin/phpmd src/ text phpmd.xml`.

## Gate tiers

| Tier | Trigger        | Command                                                                                                        |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `vendor/bin/php-cs-fixer check .`                                                                              |
| fast | pre-commit     | `vendor/bin/phpstan analyse`                                                                                   |
| fast | pre-commit     | `typos` (spell)                                                                                                |
| slow | pre-push       | `vendor/bin/phpunit`                                                                                           |
| ci   | GitHub Actions | `vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse && typos && vendor/bin/phpunit` (full pipeline) |
| ci   | GitHub Actions | `vendor/bin/infection` (mutation testing)                                                                      |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **`phpstan.neon` not found** — Re-run `noslop install` to regenerate the config file.
- **`phpmd` not installed** — Run `composer require --dev phpmd/phpmd` to install it as a project dev dependency, then invoke it as `vendor/bin/phpmd`.
- **PHPUnit autoloader missing** — Run `composer dump-autoload` to regenerate the autoloader, then retry `scripts/test`.
- **php-cs-fixer reports "file not found" errors** — Ensure you are running from the project root where `composer.json` lives.
