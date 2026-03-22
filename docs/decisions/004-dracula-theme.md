# ADR-004: Dracula Color Theme

## Status

Accepted

## Context

The platform needed a cohesive visual identity. A dark theme was preferred for reduced eye strain and a modern aesthetic that appeals to the target audience of young Colombian social entrepreneurs and community leaders.

## Decision

We adopted the **Dracula** color palette as the foundation for the UI design system.

- Colors: background (`#282a36`), foreground (`#f8f8f2`), comment (`#6272a4`), green (`#50fa7b`), purple (`#bd93f9`), cyan (`#8be9fd`), orange (`#ffb86c`), pink (`#ff79c6`), red (`#ff5555`), yellow (`#f1fa8c`).
- Role-specific accent colors are mapped to Dracula tokens: leaders use purple, entrepreneurs use green.
- All colors are configured as Tailwind CSS custom colors for consistent usage.

## Consequences

- **Positive:** Strong visual identity; dark theme is trendy and reduces eye strain.
- **Positive:** Well-documented palette with accessibility contrast ratios considered.
- **Positive:** Tailwind integration means colors are used via utility classes (`text-dracula-green`, `bg-dracula-purple`).
- **Negative:** Dark themes can be harder to read for some users; a light mode toggle may be needed later.
- **Negative:** Custom palette means standard Tailwind color utilities are partially replaced.
