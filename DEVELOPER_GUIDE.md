# Developer Guide & Best Practices 🚀

## Architecture
We use **Astro** as the main entry point for SSR, delegating API logic to **Hono** mounted at `/api`.

### "Agents" of Order
To maintain code quality and security (requested "Agents"), follow these rules:

1.  **API Logic (The Brain)**: All business logic resides in `src/api/`. Do not write direct DB queries in Astro pages unless necessary for critical initial load performance.
2.  **Type Safety (The Shield)**: Use TypeScript interfaces for all DB entities. Currently defined loosely, but should migrate to `Zod` validation for all inputs.
3.  **UI Consistency (The Lunar Polish)**:
    - Use `src/styles/global.css` for base styles.
    - EXTEND the design system in `tailwind.config.mjs`, do not hardcode arbitrary hex values in components.
    - Always use `Dracula` theme colors via Tailwind utilities (e.g., `text-dracula-purple`).

## Security
- **Headers**: Cloudflare handles security headers via `wrangler.toml` or dashboard transforms.
- **Validation**: Inputs to Hono routes should be validated.
- **D1**: Use prepared statements (parameter binding) ALWAYS. Never string concatenation for SQL.

## Workflow
1.  **Plan**: Check `task.md`.
2.  **Code**: Follow the directory structure.
3.  **Verify**: Run `npm run build` to check for type errors before pushing.
