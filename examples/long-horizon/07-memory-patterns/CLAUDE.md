# Relay — Webhook Delivery Platform

## Product

Relay delivers webhooks at scale with retries, circuit breaking, and
at-least-once delivery guarantees.

## Stack

Go 1.22, PostgreSQL 16, Redis 7, gRPC (internal), REST (public API)

## Commands

- `make test` — unit tests
- `make test-integration` — integration tests (requires Docker)
- `make lint` — golangci-lint
- `make build` — compile binaries
- `make ci` — full quality gate (lint + test + build)

## Architecture

Events arrive via gRPC from internal services, are persisted to PostgreSQL,
queued in Redis, and delivered by a pool of worker goroutines. The public
REST API exposes endpoint configuration, delivery logs, and retry controls.

## Memory

Check `.claude/memory/MEMORY.md` before starting work. When you learn something
new, update the appropriate memory file so future sessions benefit.

## Key Directories

| Path | Contents |
|------|----------|
| `cmd/` | Binary entry points (relay-server, relay-worker) |
| `internal/` | Core business logic, organized by domain |
| `pkg/` | Shared libraries (logging, config, errors) |
| `api/` | REST API handlers and OpenAPI spec |
| `proto/` | gRPC protobuf definitions |
| `migrations/` | PostgreSQL schema migrations |
