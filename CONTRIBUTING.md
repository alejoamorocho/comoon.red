# Contributing to Comoon

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+**
- **Wrangler CLI** (`npm install -g wrangler`) for Cloudflare D1 and local preview
- A code editor with Astro and TypeScript support (VS Code recommended)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/comoon.git
cd comoon

# Install dependencies
npm install

# Set up the local database
npm run db:setup

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:4321`.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Astro dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build with Wrangler (simulates Cloudflare) |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:setup` | Create schema and seed local database |
| `npm run db:reset` | Drop and recreate local database |
| `npm run db:migrate:local` | Run migrations on local D1 |

## Project Structure

```
src/
  api/            # Hono API routes (auth, feed, leaders, products, cause-updates)
  components/     # Astro and React components
  db/             # SQL schema and seed files
  layouts/        # Astro layouts
  lib/            # Auth, DI, middleware, utilities
  pages/          # Astro pages (file-based routing)
  repositories/   # Data access layer (D1 queries)
  services/       # Business logic layer
  styles/         # Global CSS and Tailwind config
  types/          # Shared TypeScript types
  utils/          # Utility functions
docs/
  api/            # OpenAPI specification
  decisions/      # Architecture Decision Records (ADRs)
migrations/       # SQL migration files
```

## Pull Request Guidelines

1. Create a feature branch from `main` (`feat/description` or `fix/description`).
2. Keep PRs focused on a single concern.
3. Ensure all checks pass: `npm run lint && npm run format:check && npm run test`.
4. Write descriptive commit messages explaining the "why".
5. Add tests for new features or bug fixes when applicable.
6. Update documentation if your change affects the API or project structure.

## Code Style

Code style is enforced automatically:

- **Prettier** formats all `.ts`, `.tsx`, `.astro`, and `.css` files.
- **ESLint** enforces TypeScript and React best practices.
- **Husky** runs lint-staged on pre-commit to catch issues before they reach CI.

The VS Code workspace settings (`.vscode/settings.json`) enable format-on-save and ESLint auto-fix. Install the recommended extensions when prompted.
