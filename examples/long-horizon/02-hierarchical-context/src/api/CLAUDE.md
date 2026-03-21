<!-- ~86 lines, ~1,200 tokens -->
# API Layer

Express REST API serving the Planwise frontend. All routes are under `/api`.

## Request flow

```
Route → authenticate → authorize → validate → controller → service → repository
```

Every request passes through middleware in this order. Controllers orchestrate; services contain business logic; repositories handle data access.

## Route conventions

- Plural resource nouns: `/api/tasks`, `/api/projects`, `/api/users`
- Nested resources for relationships: `/api/projects/:projectId/tasks`
- Route files map 1:1 to resources: `src/api/routes/tasks.ts`
- Always version-prefix when breaking changes ship: `/api/v2/tasks`

```typescript
// src/api/routes/tasks.ts
const router = Router();
router.get('/', authenticate, taskController.list);
router.post('/', authenticate, validate(createTaskSchema), taskController.create);
router.get('/:id', authenticate, taskController.getById);
router.patch('/:id', authenticate, validate(updateTaskSchema), taskController.update);
router.delete('/:id', authenticate, authorize('admin', 'owner'), taskController.remove);
export default router;
```

## Middleware

### Authentication (`authenticate`)

Verifies the JWT access token from the `Authorization: Bearer <token>` header. Attaches `req.user` with `{ id, email, role }`. Returns 401 if missing or invalid.

### Authorization (`authorize(...roles)`)

Checks `req.user.role` against the allowed roles. Returns 403 if not permitted. Always comes after `authenticate`.

### Validation (`validate(schema)`)

Parses `req.body` (or `req.query` for GET) against a Zod schema. Returns 400 with field-level errors on failure. Schemas live in `src/api/schemas/`.

### Error handler

Catches all thrown `AppError` instances and unhandled errors. Returns JSON:API error format:

```json
{
  "errors": [{
    "code": "TASK_NOT_FOUND",
    "title": "Not Found",
    "detail": "Task with ID 42 was not found",
    "status": "404"
  }]
}
```

Unhandled errors return 500 with a generic message in production (full stack trace in development).

## Controller pattern

Controllers are thin. They parse the request, call a service, and format the response:

```typescript
async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const result = await taskService.list(req.user.id, { page, pageSize });
    res.json({ data: result.items, meta: { total: result.total, page, pageSize } });
  } catch (err) {
    next(err);
  }
}
```

Controllers must not contain business logic. If you're writing an `if` that isn't about HTTP concerns (parsing, status codes, response format), move it to a service.

## Testing

- Integration tests: Supertest against the Express app with a test database. Located at `src/api/routes/*.test.ts`.
- Unit tests: Service logic with mocked repositories. Located at `src/api/services/*.test.ts`.
- Run API tests: `npm run test:api`
- Test each route's success case, validation failure, auth failure, and not-found case.
