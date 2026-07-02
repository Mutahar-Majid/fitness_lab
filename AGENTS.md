# React Development Rules

## General

- Prefer functional components with hooks.
- Use TypeScript for all new React code.
- Keep components small, focused, and composable.
- Avoid large “god components”; extract reusable UI and business logic.
- Do not introduce new dependencies unless clearly justified.
- Preserve existing project conventions for folder structure, naming, styling, and state management.

## Components

- Use `PascalCase` for component names.
- Use named exports unless the surrounding codebase uses default exports.
- Keep presentational components separate from data-fetching or business logic where practical.
- Prefer explicit props interfaces/types.
- Avoid passing large objects as props when only a few fields are needed.
- Do not mutate props.

## Component Structure and File Size

- Do not create or keep large “god components”.
- No `.tsx` file should exceed 500 lines of code.
- If a `.tsx` file approaches 500 LOC, split it before adding more logic.
- Prefer many small, focused files over one large component file.
- Separate responsibilities into dedicated files:
  - `components/` for reusable UI pieces and page sections.
  - `hooks/` for stateful logic, effects, data fetching, and reusable behavior.
  - `types/` or `*.types.ts` for TypeScript types and interfaces.
  - `styles/`, `*.styles.ts`, or Tailwind class helpers for reusable styling logic.
  - `utils/` or `lib/` for pure helper functions.
- Keep `.tsx` files focused mostly on rendering and composition.
- Move complex logic out of `.tsx` files into hooks or utilities.
- Move repeated JSX blocks into named child components.
- Move large prop/type definitions out of component files when they are shared or lengthy.
- Move static config, constants, mock data, and option arrays out of component files.
- Avoid mixing data fetching, transformation logic, styling helpers, and large JSX trees in the same file.
- When editing an existing large `.tsx` file, refactor it into smaller components as part of the change instead of adding more code to it.
- Prefer feature-based organization when practical:

```txt
feature-name/
├─ components/
│  ├─ FeatureHeader.tsx
│  ├─ FeatureTable.tsx
│  └─ FeatureDialog.tsx
├─ hooks/
│  └─ useFeatureData.ts
├─ types.ts
├─ styles.ts
├─ utils.ts
└─ index.tsx

## UI Components

- Use `shadcn/ui` components wherever appropriate instead of building custom UI from scratch.
- Prefer existing project-local shadcn components from the configured components directory before adding new ones.
- When a required shadcn component is missing, add it using the project’s existing shadcn setup and conventions.
- Do not duplicate shadcn components or create parallel versions of components that already exist.
- Compose shadcn primitives with project-specific styling rather than rewriting their behavior.
- Follow the project’s existing Tailwind, theme, variant, and design-token conventions.
- Keep accessibility behavior provided by shadcn/Radix primitives intact.
- Only create custom components when shadcn does not provide a suitable primitive or when product requirements clearly need custom behavior.

## Hooks

- Follow the Rules of Hooks.
- Use custom hooks to share reusable stateful logic.
- Name custom hooks with the `use` prefix.
- Keep hook dependencies correct; do not suppress exhaustive-deps warnings without a clear reason.
- Avoid unnecessary `useEffect`; derive values during render when possible.
- Use `useMemo` and `useCallback` only when they solve a real performance or reference-stability issue.

## State Management

- Prefer local component state for UI-specific state.
- Lift state only when multiple components need it.
- Avoid duplicating derived state.
- Keep server state separate from client/UI state.
- Follow the existing app’s state-management approach before introducing a new one.

## Styling

- Follow the existing styling system.
- Prefer reusable style primitives/components over one-off styling.
- Keep class names readable and consistent.
- Avoid inline styles unless values are dynamic or the project convention allows them.

## Accessibility

- Use semantic HTML first.
- Add labels for form controls.
- Ensure buttons are real `<button>` elements unless there is a strong reason otherwise.
- Ensure interactive elements are keyboard accessible.
- Add appropriate ARIA only when semantic HTML is insufficient.

## Performance

- Avoid unnecessary re-renders caused by unstable props, inline objects, or excessive state lifting.
- Use list keys that are stable and unique; do not use array indexes unless the list is static.
- Lazy-load large components or routes when appropriate.
- Avoid expensive work during render.

## Forms

- Keep validation logic explicit and testable.
- Show useful error messages.
- Prevent duplicate submissions where applicable.
- Preserve user input when showing validation errors.

## Data Fetching

- Handle loading, empty, error, and success states.
- Do not ignore failed requests.
- Avoid fetching the same data repeatedly without need.
- Abort or guard async updates when components unmount if the current pattern requires it.

## Testing

- Add or update tests for meaningful behavior changes.
- Prefer testing user-visible behavior over implementation details.
- Use React Testing Library patterns if the project uses it.
- Do not remove tests unless they are obsolete and the reason is clear.

## Code Quality

- Keep logic readable over clever.
- Remove dead code, unused imports, and console debugging.
- Prefer clear names over comments explaining confusing code.
- Run formatting, linting, type-checking, and tests when available.
- Do not make broad refactors unrelated to the requested change.

## When Modifying Existing Code

- Match the style of nearby files.
- Minimize the diff.
- Avoid changing public APIs unless necessary.
- Preserve backward compatibility unless explicitly asked otherwise.
- Explain any tradeoffs or assumptions in the final response.
```
