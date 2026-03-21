# REST API Design Standards

These standards apply to Meridian's public-facing REST API. Internal communication
between services uses tRPC and follows its own conventions.

## URL conventions

- Base path: `/api/v1/{resource}`
- Resource names are plural nouns in kebab-case: `/api/v1/workflows`, `/api/v1/workflow-runs`
- Resource IDs in the path: `/api/v1/workflows/{workflowId}`
- Nested resources for strong ownership: `/api/v1/workflows/{workflowId}/steps`
- Actions that don't fit CRUD use a verb suffix: `/api/v1/workflows/{workflowId}/execute`
- Maximum nesting depth: 2 levels. Beyond that, promote the resource to a top-level endpoint.

## HTTP methods

| Method   | Purpose                  | Idempotent | Request body | Response                    |
|----------|--------------------------|------------|--------------|------------------------------|
| `GET`    | Retrieve resource(s)     | Yes        | No           | Resource or list             |
| `POST`   | Create a resource        | No         | Yes          | Created resource + 201      |
| `PUT`    | Full replace a resource  | Yes        | Yes          | Updated resource             |
| `PATCH`  | Partial update           | No         | Yes (partial)| Updated resource             |
| `DELETE` | Remove a resource        | Yes        | No           | 204 No Content               |

- Use `PUT` only when the client sends the complete resource. For partial updates, use `PATCH`.
- `DELETE` should be idempotent — deleting an already-deleted resource returns 204, not 404.

## Request/response format

All request and response bodies use JSON. Responses follow the envelope pattern:

**Success response:**

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

**List response:**

```json
{
  "data": [ ... ],
  "meta": {
    "requestId": "req_abc123",
    "pagination": {
      "cursor": "eyJpZCI6MTAwfQ==",
      "hasMore": true,
      "totalCount": 250
    }
  }
}
```

## Error format

All errors follow this structure:

```json
{
  "error": {
    "status": 422,
    "code": "VALIDATION_ERROR",
    "message": "Workflow name must be between 1 and 100 characters.",
    "details": [
      {
        "field": "name",
        "message": "Must be between 1 and 100 characters",
        "received": ""
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

- `status`: HTTP status code (duplicated for convenience).
- `code`: Machine-readable error code (SCREAMING_SNAKE_CASE).
- `message`: Human-readable summary (suitable for displaying to end users).
- `details`: Optional array with field-level errors for validation failures.

Standard error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## Pagination

All list endpoints use cursor-based pagination:

- `?cursor={opaque_string}` — resume from this position.
- `?limit={number}` — items per page (default: 20, max: 100).
- `?sort={field}` — sort field (default varies by resource).
- `?order=asc|desc` — sort direction (default: desc).

Cursors are opaque base64 strings. Clients must not parse or construct them.

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {api_key}
```

- **401 Unauthorized:** Token is missing, expired, or invalid.
- **403 Forbidden:** Token is valid but the user lacks permission for this action.

Never return 403 for a resource the user shouldn't know exists — return 404 instead
to prevent information leakage.

## Versioning

- Major versions in the URL path: `/api/v1/`, `/api/v2/`.
- Minor, backward-compatible changes do NOT get a new version. Adding a field to a
  response, adding an optional query parameter, or adding a new endpoint are all
  backward-compatible.
- Breaking changes (removing a field, changing a field's type, changing behavior)
  require a new major version.
- Old versions are supported for 12 months after a new version ships.

## Rate limiting

All endpoints enforce rate limits. Include these headers in every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

When the limit is exceeded, return 429 with a `Retry-After` header:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

Default limits:
- Read endpoints: 1000 requests/minute per API key.
- Write endpoints: 100 requests/minute per API key.
- Search endpoints: 30 requests/minute per API key.
