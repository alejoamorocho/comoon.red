# ADR-001: Astro + Cloudflare Workers Stack

## Status

Accepted

## Context

Comoon is a social commerce platform for Colombia that needs server-side rendering for SEO, fast load times on varying network conditions, and a deployment target with low latency and minimal operational cost. The team evaluated Next.js, Remix, and Astro as framework options, alongside Vercel, AWS, and Cloudflare as hosting providers.

## Decision

We chose **Astro** as the web framework deployed to **Cloudflare Pages/Workers**.

- Astro's island architecture delivers minimal client-side JS by default, which is critical for users on slower connections common in rural Colombia.
- Cloudflare Pages provides free hosting with generous limits, edge-deployed globally with a strong Latin America presence.
- Astro's SSR adapter for Cloudflare (`@astrojs/cloudflare`) is mature and integrates natively with D1, KV, and other Cloudflare bindings.
- The content-heavy, mostly-static nature of cause pages and leader profiles fits Astro's strengths.

## Consequences

- **Positive:** Near-zero cold start times, low hosting cost, excellent SEO via SSR, small JS bundles.
- **Positive:** Access to Cloudflare ecosystem (D1, R2, KV, Workers AI) without additional infrastructure.
- **Negative:** Smaller ecosystem compared to Next.js; fewer community examples.
- **Negative:** Cloudflare Workers runtime has some Node.js API limitations (no `fs`, limited `crypto` surface).
