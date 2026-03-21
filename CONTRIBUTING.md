# Contributing to noslop

## Getting started

```bash
git clone https://github.com/45ck/noslop.git
cd noslop
npm install
npm run ci
```

## Adding a language pack

Follow the five steps in [CLAUDE.md](./CLAUDE.md) under "Adding a new language pack":

1. Add `src/domain/packs/{lang}.ts` with `createPack` and gates
2. Add `templates/packs/{lang}/` with hooks, CI workflows, Claude settings, and scripts
3. Export from `src/domain/index.ts`
4. Wire into `detectPacks()` in `src/presentation/cli.ts`
5. Add tests at every layer; run `npm run ci`

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Zig language pack
fix: correct hook path resolution on Windows
docs: update pack list in README
chore: bump vitest to v4
```

## Pull request process

1. Fork the repo and create a feature branch
2. Implement your changes
3. Run `npm run ci` — all checks must pass
4. Open a PR against `main`

## Architecture and rules

See [CLAUDE.md](./CLAUDE.md) for the full set of project rules, DDD layer constraints, enforced caps, and naming conventions.
