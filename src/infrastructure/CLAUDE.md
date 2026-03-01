# Infrastructure Layer

Implements application ports. Depends on domain + application.

## Conventions

- Adapters live in `adapters/`, one file per adapter
- Start with `in-memory-*.ts` for testing; name real adapters by tech (`postgres-*.ts`)
- Each adapter implements a port interface from `src/application/ports/`
- ESLint complexity rules are relaxed here (external SDK wrangling)
- Export through `index.ts` barrel

## Reference: in-memory adapter

- `adapters/in-memory-greeting-repository.ts` implements `GreetingRepository`
- Uses a `Map` for storage, all methods return `Promise`
