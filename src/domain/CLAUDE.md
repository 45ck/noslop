# Domain Layer

Zero external dependencies -- no HTTP, DB, or framework imports.

## Conventions

- Identity types use branded primitives from `primitives/` (`UserId`, `OrderId`)
- Entities and value objects are `Readonly<{...}>` types with factory functions
- Domain events via `createDomainEvent(type, payload)` from `events/`
- Tests colocated as `*.test.ts` -- domain logic should be exhaustively tested
- Export everything through `index.ts` barrel

## Reference: greeting entity

- Type: `src/domain/greeting/greeting.ts` (readonly type + `createGreeting` factory)
- Primitives: `src/domain/primitives/index.ts` (branded `GreetingId`, `UserId`)
- Events: `src/domain/events/domain-event.ts` (`createDomainEvent`)
