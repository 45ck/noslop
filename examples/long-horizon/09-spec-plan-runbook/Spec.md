<!-- FROZEN: Do not modify without explicit approval -->

# Notification Service Specification

## Overview

A multi-channel notification service that sends email, SMS, and push
notifications through a unified API. Supports templated messages, delivery
tracking, and retry with backoff.

## Requirements

### R1: Multi-channel delivery

The service must support three notification channels:

- **Email** via SendGrid API (v3)
- **SMS** via Twilio Programmable Messaging
- **Push** via Firebase Cloud Messaging (FCM)

Each channel is implemented as an adapter behind a common `NotificationChannel`
interface. Adding a new channel must not require changes to the core service.

### R2: Template system

Notifications are rendered from templates using Handlebars syntax.

- Templates are stored in the `notification_templates` table.
- Each template has a `channel` (email/sms/push), `name`, `subject` (email
  only), and `body` with Handlebars placeholders.
- The API accepts a `templateId` and a `variables` object. The service renders
  the template before sending.
- Template rendering errors must fail loudly (reject the request), not silently
  send malformed messages.

### R3: Delivery tracking

Every notification attempt is tracked in the `notification_deliveries` table:

- `id`, `channel`, `recipient`, `templateId`, `status`, `attemptCount`,
  `lastAttemptAt`, `deliveredAt`, `failedAt`, `errorMessage`
- Status values: `pending`, `sending`, `delivered`, `failed`, `retrying`
- The API exposes `GET /notifications/:id/status` to query delivery status.

### R4: Retry with backoff

Transient failures trigger automatic retry with exponential backoff:

- Max 3 retry attempts per notification
- Backoff intervals: 1 min, 5 min, 25 min (base 5 exponential)
- After 3 failed attempts, status is set to `failed` and no further retries
- Permanent failures (invalid recipient, authentication error) are not retried

### R5: Throughput

The service must sustain 1000 notifications/min under normal operation. This
is achieved through a job queue (BullMQ + Redis) that decouples the API from
the delivery pipeline.

## Constraints

- **Language:** Node.js 20+ with TypeScript (strict mode)
- **Database:** PostgreSQL 16
- **Queue:** BullMQ backed by Redis 7
- **Testing:** Vitest with in-memory adapters for all external services
- **API:** REST with JSON request/response bodies
- **Auth:** API key authentication (header: `X-API-Key`)

## Acceptance criteria

1. `POST /notifications` accepts `{ channel, recipient, templateId, variables }`
   and returns `{ id, status: "pending" }` within 100ms.
2. Email notifications arrive in the recipient's inbox within 60 seconds under
   normal load.
3. SMS notifications are delivered within 30 seconds under normal load.
4. Push notifications are delivered within 10 seconds under normal load.
5. A failed delivery is retried up to 3 times with exponential backoff.
6. `GET /notifications/:id/status` returns current delivery status and attempt
   history.
7. Invalid template variables return 400 with a descriptive error message.
8. The system sustains 1000 notifications/min for 10 minutes without errors or
   queue backlog growth.
9. All external service calls use in-memory adapters in tests (no real
   SendGrid/Twilio/FCM calls in CI).

## Non-goals

The following are explicitly out of scope:

- **Analytics dashboard:** No UI for viewing delivery metrics or trends.
- **A/B testing:** No support for template variants or delivery experiments.
- **Real-time delivery status UI:** No WebSocket or SSE endpoint for live
  status updates. Polling via the REST API is sufficient.
- **User preference management:** The service does not track whether users
  prefer email over SMS. The caller decides the channel.
- **Message scheduling:** All notifications are sent immediately. Deferred
  sending is not supported.
