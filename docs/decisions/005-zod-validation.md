# ADR-005: Zod for Input Validation

## Status

Accepted

## Context

API endpoints accept user input (registration, login, cause updates, etc.) that must be validated before processing. Options considered were manual validation, class-validator, joi, and Zod.

## Decision

We chose **Zod** for runtime input validation and schema definition.

- Zod is TypeScript-first: schemas double as type definitions via `z.infer<>`, eliminating type/validation drift.
- Lightweight bundle size (~13KB) fits the edge deployment constraint.
- Composable schema API makes it easy to define request bodies, query parameters, and environment variables.
- Integrates well with Hono middleware for request validation.

## Consequences

- **Positive:** Single source of truth for types and validation; `z.infer<typeof schema>` keeps them in sync.
- **Positive:** Rich error messages out of the box; `.safeParse()` returns structured errors.
- **Positive:** Small bundle; no impact on Workers size limits.
- **Negative:** Runtime validation adds a small overhead per request (negligible in practice).
- **Negative:** Team must learn Zod's API, though it is well-documented and intuitive.
