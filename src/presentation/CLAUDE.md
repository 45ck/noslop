# Presentation Layer

Optional layer. Entry points for HTTP, CLI, or UI.

## Conventions

- Composition root: wire adapters to use cases here
- Keep handlers thin -- validate input, call use case, format output
- Depends on all inner layers (domain, application, infrastructure)
- Export through `index.ts` barrel
