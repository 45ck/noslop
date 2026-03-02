# Project Rules — noslop

## Quick reference

- Quality gate: `npm run ci` (run before claiming work is done)
- Tests: `npm run test` or `npm run test:watch`
- Lint fix: `npm run lint:fix && npm run format`
- Build CLI: `npm run build` → `node dist/presentation/cli.js --help`

## Product context

`noslop` is a CLI tool that installs quality gates into any repo. Supports 19 language packs.
The product ships as `@45ck/noslop` on npm with a `noslop` binary.

Key commands: `noslop init | install | check | doctor`

## Rules

- Domain code (`src/domain/`) must have zero external dependencies.
- No inline `// eslint-disable`. Override in `eslint.config.mjs` with a comment.
- No `any`. No `@ts-ignore` without a 5+ char description.
- Every public API must have a boundary test.
- Do not modify ESLint, Prettier, TypeScript, Vitest, or dependency-cruiser configs to weaken rules.
- Templates live in `templates/packs/{id}/` — keep them in sync with pack definitions in `src/domain/packs/`.

## Enforced caps (ESLint)

- Complexity: 10 | Cognitive complexity: 15
- Max depth: 4 | Max params: 4
- Max lines/function: 80 | Max lines/file: 350
- Coverage: 90% statements/functions/lines global, 85% branches

## Architecture (DDD)

| Layer          | Path                  | May depend on                       |
| -------------- | --------------------- | ----------------------------------- |
| Domain         | `src/domain/`         | nothing                             |
| Application    | `src/application/`    | domain                              |
| Infrastructure | `src/infrastructure/` | domain, application                 |
| Presentation   | `src/presentation/`   | domain, application, infrastructure |

## Domain concepts

- `Gate` (VO): `{ label, command, tier: 'fast'|'slow'|'ci' }`
- `Pack` (entity): `{ id, name, gates[] }` — one per language
- `NoslopConfig`: `{ packs[], protectedPaths[] }`
- Packs defined in `src/domain/packs/`: 19 packs — see `src/domain/index.ts` for the full list.

## Adding a new language pack

1. Add `src/domain/packs/{lang}.ts` — createPack with gates
2. Add `templates/packs/{lang}/` — hooks, CI workflows, claude settings, scripts
3. Export from `src/domain/index.ts`
4. Wire into `detectPacks()` in `src/presentation/cli.ts`
5. Tests at every layer; run `npm run ci`

## Naming

- Use cases: `{verb}-{noun}-use-case.ts`
- Tests: colocated `*.test.ts`
- In-memory adapters: `in-memory-{adapter-name}.ts`

## Testing

- Vitest, colocated tests, coverage thresholds per layer
- In-memory adapters (`InMemoryFilesystem`, `InMemoryProcessRunner`) for domain/application tests
- Mutation testing: `npm run mutation` (Stryker)
