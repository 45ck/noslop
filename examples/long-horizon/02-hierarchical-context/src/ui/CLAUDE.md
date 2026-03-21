<!-- ~128 lines, ~1,790 tokens -->
# UI Layer

Next.js 14 frontend using the App Router. Communicates with the API over HTTP — never imports from `src/api/` or `src/db/` directly.

## Routing

Pages live in `src/ui/app/`. The App Router file convention:

- `page.tsx` — route component (server component by default)
- `layout.tsx` — shared layout wrapping child routes
- `loading.tsx` — loading UI (Suspense fallback)
- `error.tsx` — error boundary

```
src/ui/app/
  page.tsx                    # Landing / dashboard
  login/page.tsx              # Auth pages
  projects/
    page.tsx                  # Project list
    [projectId]/
      page.tsx                # Project detail (kanban board)
      settings/page.tsx       # Project settings
      tasks/[taskId]/page.tsx # Task detail
```

## Component patterns

### Hierarchy

```
page (server component)
  → layout (server component)
    → feature components (client components where needed)
      → UI primitives (buttons, inputs, cards)
```

### Server vs client components

Default to server components. Add `'use client'` only when the component needs:
- Event handlers (`onClick`, `onChange`)
- Hooks (`useState`, `useEffect`, React Query)
- Browser APIs (`window`, `localStorage`)

Keep client component boundaries as narrow as possible. Wrap only the interactive part, not the entire page.

### File organization

```
src/ui/
  app/              # Next.js routes (pages and layouts)
  components/
    ui/             # Generic primitives: Button, Input, Card, Modal, Badge
    features/       # Domain-specific: TaskCard, ProjectSidebar, KanbanColumn
  hooks/            # Custom React hooks
  lib/              # API client, utilities, constants
  styles/           # Global styles, Tailwind config
```

## Styling

Tailwind CSS with the project's design tokens defined in `tailwind.config.ts`:

- Colors: `primary`, `secondary`, `success`, `warning`, `danger` (with 50-950 shades)
- Spacing, border radius, and shadows follow the default Tailwind scale
- Dark mode: `class` strategy — toggle via `dark:` variants

Rules:
- Use Tailwind utility classes. No custom CSS unless Tailwind cannot express it.
- Extract repeated class combinations into UI primitive components, not `@apply`.
- Responsive: mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.

## State management

### Server state (React Query)

All API data fetching uses React Query (`@tanstack/react-query`). Query keys follow the pattern `[resource, ...params]`:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['tasks', projectId, { page, status }],
  queryFn: () => api.tasks.list(projectId, { page, status }),
});
```

- Mutations use `useMutation` with `onSuccess` invalidation of related queries.
- Never store API data in local state (`useState`). It belongs in the React Query cache.

### Client state (Zustand)

UI-only state (sidebar open/closed, active filters, modal visibility) uses Zustand stores in `src/ui/hooks/stores/`.

Keep stores small and focused. One store per feature area, not one global store.

## Accessibility

Target: WCAG 2.1 AA compliance.

- All interactive elements must be keyboard-navigable.
- Images need `alt` text. Decorative images use `alt=""`.
- Form inputs must have associated `<label>` elements.
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text.
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`) over generic `<div>`.
- Test with `axe-core` — the Playwright e2e tests run accessibility audits on every page.

## Testing

### Component tests (Vitest + Testing Library)

Located next to the component: `TaskCard.test.tsx`. Test rendered output and user interactions, not implementation details.

```typescript
it('shows task title and assignee', () => {
  render(<TaskCard task={mockTask} />);
  expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

### End-to-end tests (Playwright)

Located in `src/ui/e2e/`. Test full user flows against the running dev stack.

```
npm run test:e2e
```

Each e2e test creates its own data via API calls in `beforeEach` and cleans up in `afterEach`. Tests must not depend on each other's state.
