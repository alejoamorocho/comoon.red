# ADR-003: Cloudflare D1 (SQLite) Database

## Status

Accepted

## Context

The platform needs a relational database for users, leaders, causes, products, and transactions. Options considered were Planetscale (MySQL), Turso (libSQL), Supabase (Postgres), and Cloudflare D1 (SQLite).

## Decision

We chose **Cloudflare D1**, a managed SQLite database running at the edge.

- D1 is co-located with Workers, eliminating network round-trips to an external database.
- SQLite's simplicity maps well to the current data model (leaders, causes, products, transactions).
- D1's free tier is generous for an early-stage platform.
- Local development uses the same SQLite engine via `wrangler d1 execute --local`, ensuring dev/prod parity.

## Consequences

- **Positive:** Zero-latency database access from Workers; no connection pooling needed.
- **Positive:** Simple schema management with SQL files and migrations.
- **Positive:** Free tier supports the project's current scale.
- **Negative:** D1 is still evolving; some features (e.g., triggers, full-text search) are limited.
- **Negative:** No built-in ORM; queries are written as raw SQL with `.prepare().bind()`.
- **Negative:** Row size and database size limits may require migration if the platform scales significantly.
