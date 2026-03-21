# Notification Service Plan

Last updated: 2026-03-15 (after milestone 2 completion)

## Milestone 1: Project Scaffolding [DONE]

- [x] Initialize TypeScript project with strict config
- [x] Set up PostgreSQL schema: `notification_templates`, `notification_deliveries`
- [x] Configure Vitest with coverage thresholds (90% statements)
- [x] Create `NotificationChannel` interface and channel registry
- [x] Set up BullMQ job queue with Redis connection
- [x] Implement health check endpoint (`GET /health`)

**Verify:** `npm test -- --run && npm run build`

**Completed:** 2026-03-10. All tests pass, build succeeds, health endpoint
returns `{ status: "ok" }`.

## Milestone 2: Email Channel [DONE]

- [x] Implement SendGrid adapter (`src/channels/email/sendgrid-adapter.ts`)
- [x] Implement in-memory email adapter for testing
- [x] Template rendering engine with Handlebars (`src/templates/renderer.ts`)
- [x] Template CRUD in database (`src/repositories/template-repository.ts`)
- [x] Delivery tracking: create record on send, update on success/failure
- [x] `POST /notifications` endpoint (email channel only)
- [x] `GET /notifications/:id/status` endpoint
- [x] Integration tests: send email, check delivery status, template errors

**Verify:** `npm test -- src/channels/email/ && curl -sf localhost:3000/health`

**Completed:** 2026-03-15. Email sends via SendGrid adapter, in-memory adapter
passes all tests. Template rendering handles missing variables with clear errors.
Delivery tracking records all attempts.

## Milestone 3: SMS Channel [IN PROGRESS]

- [x] Implement Twilio adapter (`src/channels/sms/twilio-adapter.ts`)
- [x] Implement in-memory SMS adapter for testing
- [ ] Phone number validation (E.164 format, reject malformed numbers)
- [ ] Per-number rate limiting (max 10 SMS per number per hour)
- [ ] SMS-specific template constraints (160-char limit warning, no subject)
- [ ] Integration tests: send SMS, rate limit hit, invalid number rejection

**Verify:** `npm test -- src/channels/sms/`

**Notes:** Twilio adapter is implemented and passes basic send/receive tests.
Phone number validation and rate limiting are next.

## Milestone 4: Push Notifications [PENDING]

- [ ] Implement FCM adapter (`src/channels/push/fcm-adapter.ts`)
- [ ] Implement in-memory push adapter for testing
- [ ] Device token validation
- [ ] Push-specific template constraints (title + body, 4KB payload limit)
- [ ] Integration tests: send push, invalid token, payload too large

**Verify:** `npm test -- src/channels/push/`

## Milestone 5: Retry and Resilience [PENDING]

- [ ] Implement exponential backoff retry logic in the job queue worker
- [ ] Classify errors: transient (retry) vs. permanent (fail immediately)
- [ ] Update delivery status through retry lifecycle: `sending` -> `retrying` -> `delivered`/`failed`
- [ ] Dead letter queue for notifications that exhaust all retries
- [ ] Integration tests: transient failure recovery, permanent failure handling,
      max retry exhaustion

**Verify:** `npm test -- src/queue/ && npm test -- src/channels/ -- --grep "retry"`

## Milestone 6: Load Testing and Hardening [PENDING]

- [ ] Write load test script: 1000 notifications/min for 10 minutes
- [ ] Profile and optimize queue throughput (batch processing if needed)
- [ ] Add connection pooling for PostgreSQL (pg-pool configuration)
- [ ] Add graceful shutdown (drain queue, close connections)
- [ ] Verify no queue backlog growth under sustained load
- [ ] Final acceptance criteria review against Spec.md

**Verify:** `npm run test:load && npm test -- --run`
