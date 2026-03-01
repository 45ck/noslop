# Application Layer

Depends on domain only. Orchestrates use cases through ports.

## Conventions

- Ports (interfaces) in `ports/`, one file per port
- Use cases: async function taking a command object + port(s), returns `Promise`
- Directory pattern: `{verb}-{noun}/` containing use case + colocated test
- Commands are `Readonly<{...}>` types defined in the use case file
- Tests use in-memory adapters from infrastructure -- no real I/O
- Export through `index.ts` barrel; re-export port types

## Reference: greet use case

- Use case: `greet/greet-use-case.ts` (takes `GreetCommand` + `GreetingRepository`)
- Port: `ports/greeting-repository.ts` (interface with `save` + `findById`)
- Test: `greet/greet-use-case.test.ts` (uses `InMemoryGreetingRepository`)
