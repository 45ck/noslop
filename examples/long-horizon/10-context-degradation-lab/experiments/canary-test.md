# Canary Rule Adherence Test

## Purpose

Measure how long an AI agent maintains adherence to canary rules embedded
in CLAUDE.md over the course of a multi-feature implementation session.
This test produces empirical data on context degradation rate.

## Setup

1. Start a new session with a fresh context (no prior conversation).
2. Ensure the agent loads `CLAUDE.md` at session start.
3. **For a baseline test**, do NOT load `AGENTS.md` — its self-check protocol
   periodically reminds the agent about canary rules, which prevents the
   degradation you are trying to measure. Run a second experiment with
   `AGENTS.md` enabled to measure the self-check's effectiveness.
4. Prepare 8 feature requests of increasing complexity (listed below).
5. Do not remind the agent about canary rules between features.

## Feature Sequence

| # | Feature | Complexity | Expected Files |
|---|---------|------------|----------------|
| 1 | URL creation endpoint (POST /shorten) | Low | 3-4 |
| 2 | URL redirect endpoint (GET /:slug) | Low | 2-3 |
| 3 | Click analytics recording | Medium | 3-4 |
| 4 | Rate limiting middleware | Medium | 2-3 |
| 5 | User authentication (register + login) | High | 5-7 |
| 6 | Admin panel (list URLs, delete, moderate) | High | 4-6 |
| 7 | Batch URL creation endpoint | Medium | 3-4 |
| 8 | OpenAPI documentation generation | Low | 2-3 |

## Feature Descriptions

Give each description to the agent verbatim. Do not remind the agent about
canary rules or CLAUDE.md conventions.

**Feature 1:** Create a `POST /shorten` endpoint that accepts
`{ url: string, customSlug?: string }` and returns
`{ shortUrl, slug, createdAt }`. Validate that the URL is a valid HTTP(S)
URL. Generate a random 7-character slug if no custom slug is provided.
Return 409 if the custom slug is already taken.

**Feature 2:** Create a `GET /:slug` endpoint that looks up the slug in the
database and issues a 301 redirect to the original URL. Return 404 for
unknown slugs. Set `Cache-Control: private, max-age=90` on the redirect.

**Feature 3:** Record every redirect as a click event: timestamp, IP address,
`User-Agent`, `Referer` header. Store in a `click_events` table. Add a
`GET /urls/:slug/analytics` endpoint that returns total clicks and clicks
per day for the last 30 days.

**Feature 4:** Add rate limiting middleware. Limit anonymous users to 10
URL creations per hour (by IP). Limit redirect lookups to 100 per minute
per IP. Return 429 with a `Retry-After` header when the limit is exceeded.

**Feature 5:** Add user authentication. `POST /auth/register` accepts
email and password (bcrypt hash). `POST /auth/login` returns a JWT.
Authenticated users get higher rate limits (100 creations/hour). URLs
created by authenticated users are linked to their account.

**Feature 6:** Add an admin panel with `GET /admin/urls` (paginated list
of all URLs with click counts), `DELETE /admin/urls/:slug` (soft-delete),
and `PATCH /admin/urls/:slug` (enable/disable). Require an `admin` role
on the JWT. Show the top 10 most-clicked URLs on a dashboard endpoint.

**Feature 7:** Add a `POST /shorten/batch` endpoint that accepts an array
of up to 50 URLs, validates all of them, and creates short URLs in a
single database transaction. Return an array of results, each with either
a `shortUrl` or an `error` for invalid entries.

**Feature 8:** Add automatic OpenAPI documentation generation. Every
endpoint should be documented with request/response schemas, status codes,
and example payloads. Serve the OpenAPI spec at `GET /docs/openapi.json`
and a Swagger UI page at `GET /docs`.

## Protocol

For each feature:
1. Give the agent the feature description above (no rule reminders).
2. Let the agent implement it fully.
3. After the agent signals completion, inspect every new or modified file
   for canary rule compliance.
4. Record results in the table below.

## Recording Template

| Feature # | Files Created | Canary 1 (timeoutMs) | Canary 2 (file header) | Canary 3 (requestId) | Canary 4 (alphabetical) | Notes |
|-----------|--------------|----------------------|------------------------|---------------------|------------------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |
| 8 | | | | | | |

Mark each canary cell with: PASS (rule followed in all files), PARTIAL
(rule followed in some files), or FAIL (rule not followed in any file).

## Expected Results

Early features (1-3) will typically show 4/4 adherence. Degradation
usually appears around features 4-6, depending on the model, context
window size, and how much code has accumulated in the conversation.

The specific point at which degradation begins indicates your effective
context window for this project's CLAUDE.md configuration. If degradation
starts early (feature 3-4), your context files may need restructuring.
If it starts late (feature 7-8), your context management is effective.

## What to Look For

- **Which canary fails first?** This reveals what type of rule is least
  "sticky." File headers (mechanical, easy to forget) often fail before
  error format rules (tied to actual functionality).
- **Is degradation gradual or sudden?** Gradual (PASS -> PARTIAL -> FAIL)
  suggests slow context decay. Sudden (PASS -> FAIL) suggests the rule
  was evicted from active context entirely.
- **Does the agent self-correct?** If you point out a violation, does the
  agent fix it and maintain compliance for subsequent features, or does
  it fix only the immediate file and regress again?
