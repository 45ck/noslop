# Architecture Decisions

Lightweight ADR format for memory-friendly reference. Each entry records a
significant design choice with enough context for future sessions to understand
the rationale.

---

## ADR-001: Go for the Delivery Engine

**Date:** 2024-06-15

**Context:** We evaluated Go and Node.js for the webhook delivery service. The
workload is I/O-bound with high concurrency requirements (thousands of outbound
HTTP requests in parallel). Node.js can handle this but requires careful
management of the event loop to avoid head-of-line blocking on CPU-bound tasks
like payload signing.

**Decision:** Use Go for all backend services.

**Consequences:** Goroutines give us lightweight concurrency without callback
complexity. The team had to learn Go idioms (error handling, interfaces), but
p99 delivery latency dropped from 340ms (Node prototype) to 45ms. Trade-off:
the frontend team cannot share code between the dashboard and backend.

---

## ADR-002: PostgreSQL for Metadata, Redis for Queue

**Date:** 2024-07-02

**Context:** We need durable storage for endpoint configurations, delivery logs,
and subscription metadata. We also need a fast queue for pending deliveries that
supports blocking reads and atomic move operations. A single database cannot
serve both access patterns well.

**Decision:** PostgreSQL for metadata and logs, Redis for the delivery queue.

**Consequences:** Two datastores to operate, but each is optimized for its
access pattern. PostgreSQL handles complex queries on delivery history. Redis
provides sub-millisecond queue operations. Trade-off: we must handle consistency
between the two stores carefully during failure scenarios.

---

## ADR-003: At-Least-Once Delivery with Idempotency Keys

**Date:** 2024-07-20

**Context:** Customers need reliable webhook delivery, but exactly-once delivery
over HTTP is impossible without application-level support. We considered
at-most-once (simpler but lossy) and at-least-once (requires deduplication).

**Decision:** At-least-once delivery. Every webhook includes an idempotency key
in the `X-Relay-Idempotency-Key` header.

**Consequences:** Customers can deduplicate on their end. We retry failed
deliveries up to 8 times with exponential backoff. This means our delivery log
contains duplicate entries for retried webhooks, which complicates log analysis.
We mitigate this with a `delivery_attempt` column.

---

## ADR-004: gRPC Internal, REST Public

**Date:** 2024-08-05

**Context:** Internal services need low-latency event intake with schema
enforcement. External customers need a simple API for managing endpoints and
viewing delivery logs. gRPC is efficient for service-to-service communication
but has poor browser support and a steeper learning curve for API consumers.

**Decision:** gRPC for internal event intake, REST (OpenAPI) for the public API.

**Consequences:** Internal services get type-safe contracts via protobuf with
efficient serialization. External developers get a standard REST API with
familiar tooling (curl, Postman). Trade-off: we maintain two API surfaces, and
the relay-server binary hosts both a gRPC server and an HTTP server.

---

## ADR-005: Circuit Breaker per Destination

**Date:** 2024-09-12

**Context:** When a customer's endpoint goes down, retrying every queued webhook
wastes worker capacity and can cascade into queue backlog affecting other
customers. We need a mechanism to stop attempting delivery to failing endpoints
while continuing to serve healthy ones.

**Decision:** Implement a circuit breaker per destination endpoint. The breaker
trips after 5 consecutive failures and enters half-open state after 60 seconds.

**Consequences:** Failing endpoints are automatically isolated. Workers are freed
to deliver to healthy endpoints. Trade-off: webhooks queued during the open
state are delayed, not dropped. When the circuit closes, they are delivered in
order. This can cause brief bursts of traffic to recently-recovered endpoints.
