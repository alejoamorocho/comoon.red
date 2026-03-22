# ADR-002: Hono for API Layer

## Status

Accepted

## Context

The platform needs a lightweight API framework that runs inside Cloudflare Workers alongside Astro SSR. Options considered were raw Workers fetch handlers, itty-router, and Hono.

## Decision

We chose **Hono** as the API framework, mounted at `/api` within the Astro Cloudflare adapter.

- Hono is purpose-built for edge runtimes (Cloudflare Workers, Deno, Bun) with near-zero overhead.
- It provides Express-like DX with middleware, routing, and typed context — familiar to most developers.
- Built-in middleware for CORS, error handling, and JWT validation reduces boilerplate.
- TypeScript-first design with generic context typing (`Hono<{ Bindings; Variables }>`) gives end-to-end type safety.

## Consequences

- **Positive:** Sub-millisecond routing overhead; minimal bundle size impact.
- **Positive:** Middleware composition (auth, DI, error handling, security headers) is clean and testable.
- **Positive:** Strong TypeScript integration with typed env bindings and variables.
- **Negative:** Not as widely known as Express; new contributors may need onboarding.
- **Negative:** Tight coupling to the Workers runtime means some Express middleware won't work as-is.
