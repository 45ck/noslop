# Debugging Playbook

Known issues and their solutions, accumulated across sessions. When you
encounter a problem, check here before investigating from scratch. When you
solve a new non-obvious issue, add it here.

---

## Webhook Delivery Stalls

**Symptom:** Webhooks stop being delivered. Queue length grows. No errors in
worker logs.

**Root cause:** Redis consumer crash. The worker process died mid-delivery,
leaving items in the processing list (the "in-flight" list used by `BLMOVE`).
Items are not returned to the pending queue automatically.

**Fix:** Run `make recover-stalled` which moves items from the processing list
back to the pending queue. Then investigate why the worker crashed (usually an
OOM kill — check `kubectl describe pod`).

**First discovered:** 2024-11-03

---

## Duplicate Deliveries

**Symptom:** Customer reports receiving the same webhook twice with the same
idempotency key but different `delivery_attempt` values.

**Root cause:** This is expected behavior for at-least-once delivery. However,
if duplicates arrive with the *same* `delivery_attempt` value, the cause is a
hash collision in the idempotency key generator. The old implementation used
CRC32 over `event_id + endpoint_id`, which had collisions at scale.

**Fix:** We switched to SHA-256 in v1.4.0. If running an older version, upgrade.
If already on v1.4.0+, the duplicates are legitimate retries and the customer
should deduplicate on their end.

**First discovered:** 2025-01-18

---

## High Memory on relay-worker

**Symptom:** Worker pod memory usage climbs steadily, eventually OOM-killed.

**Root cause:** Payload buffering. When delivering large webhook payloads (>1MB),
the worker buffers the entire payload in memory for signing. With 64 concurrent
workers, this can consume 64MB+ just for payloads. Combined with Go's GC
behavior, memory is not released back to the OS promptly.

**Fix:** Reduce `RELAY_WORKER_CONCURRENCY` for environments with large payloads,
or increase the pod memory limit. Long-term fix (tracked in RELAY-892): stream
payloads instead of buffering them.

**First discovered:** 2025-03-22

---

## gRPC Deadline Exceeded on Event Intake

**Symptom:** Internal services report `DeadlineExceeded` errors when sending
events to relay-server. Relay-server logs show no corresponding request.

**Root cause:** DNS resolution timeout in Kubernetes. The gRPC client resolves
the service hostname on every connection attempt. When CoreDNS is under load,
resolution takes longer than the gRPC deadline (default 500ms).

**Fix:** Configure the gRPC client to use `dns:///relay-server.default.svc:9090`
with a client-side DNS cache. Or increase the deadline to 2s for non-latency-
sensitive producers. The k8s team is also tuning CoreDNS autoscaling.

**First discovered:** 2025-05-10

---

## Flaky Tests in CI (delivery_test.go)

**Symptom:** `TestConcurrentDelivery` fails intermittently with "unexpected
delivery count" — usually reports 99 deliveries instead of 100.

**Root cause:** Race condition on the shared test fixture. Multiple test
goroutines write to the same delivery log slice. The mutex in
`testutil.SetupDeliveryFixture()` was added to fix this, but early versions
had a lock scope that was too narrow.

**Fix:** The mutex scope was expanded in commit `a3f8b21` (2025-12-01). Do NOT
remove or narrow the mutex in `testutil.SetupDeliveryFixture()`. If the test
flakes again, check whether a new test case is accessing the fixture without
calling `SetupDeliveryFixture()`.

**First discovered:** 2025-07-14, fixed 2025-12-01

---

## Slow Delivery Log Queries

**Symptom:** The "Delivery History" page in the dashboard takes 10+ seconds
to load for high-volume endpoints.

**Root cause:** Missing index on `delivery_logs(endpoint_id, created_at)`.
The table has an index on `(event_id)` and `(created_at)` individually, but
queries filter by both endpoint and time range.

**Fix:** Add composite index: `CREATE INDEX idx_delivery_logs_endpoint_time
ON delivery_logs (endpoint_id, created_at DESC)`. Migration added in v1.6.0.

**First discovered:** 2026-01-09

---

## Stale Memory Caused Production Incident

**Symptom:** Deployment failed in staging with `ERR unknown command 'HMSET'`
errors from the Redis client.

**Root cause:** Agent followed ADR-007 which recommended using Redis `HMSET`
command. This command was deprecated in Redis 7.0 (we upgraded in January).
The correct command is now `HSET` with multiple field-value pairs.

**Fix:** Updated ADR-007 and this playbook. Added `last_verified` date to all
ADR references.

**Impact:** Deployment failed in staging. Caught before production.

**Lesson:** Memory files without review dates become landmines. Any memory
entry referencing external tool versions must include the version it was
written for.

**First discovered:** 2026-03-10
