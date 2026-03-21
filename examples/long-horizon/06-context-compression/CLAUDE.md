<!-- ~37 lines, ~520 tokens -->
# Beacon — Analytics & Event Tracking Platform

## Product

Beacon ingests, processes, and visualizes user analytics events at scale.
50k+ LOC across ingestion, processing, storage, query, and dashboard layers.

## Stack

Node.js, TypeScript, ClickHouse, Redis, React, GraphQL

## Commands

- `npm test` — unit tests (Vitest)
- `npm run test:integration` — integration tests (requires Docker)
- `npm run lint` — ESLint + Prettier check
- `npm run build` — TypeScript build
- `npm run ci` — full quality gate (lint + test + build)

## Architecture

Ingestion receives events via HTTP/SDK and validates them.
Processing enriches events, groups them into sessions, and computes real-time aggregates.
Storage writes to ClickHouse with schema migrations and retention policies.
Query exposes a GraphQL API with caching over the stored data.
Dashboard is a React SPA rendering charts and saved views.

## Context Loading

This codebase is too large to read in full. Use these resources:
- **`docs/module-map.md`** — one-paragraph summary of every module
- **`docs/context-selectors.md`** — which files to read based on task type
- **`src/*/CLAUDE.md`** — layer-specific rules and patterns *(not included in this template — create these for your actual codebase layers)*

Read the module map first. Then use context selectors to load only what you need.
