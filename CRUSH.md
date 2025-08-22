# CRUSH.md - Development Guidelines

## Build Commands

- `bun run dev` - Start development server with turbopack
- `bun run build` - Build production application
- `bun run start` - Start production server
- `bun run lint` - Run ESLint to check code quality

## Code Style Guidelines

### Imports & Formatting

- Use `bun` as the package manager
- Import order: third-party libs → internal components → relative imports
- Use `@/` alias for internal imports (e.g., `@/components/ui/button`)
- Use `cn()` utility from `@/lib/utils` for className merging
- Format with ESLint using `next/core-web-vitals` and `next/typescript` configs

### TypeScript

- Strict TypeScript enabled (`strict: true`)
- Use interfaces for object shapes, types for primitives/unions
- Type all props and state explicitly
- Use `React.FC` sparingly; prefer function declarations

### React Patterns

- Use functional components with hooks
- Client components: add `"use client";` at top
- Use `React.useCallback` and `React.useMemo` for performance optimization
- Prefer `className` over inline styles
- Use Tailwind CSS utility classes for styling

### Component Structure

- Components in `/components` directory
- UI primitives in `/components/ui` (shadcn/ui pattern)
- Page components in `/app` directory (Next.js App Router)
- Use Radix UI primitives with shadcn/ui variants

### Naming Conventions

- Components: PascalCase (e.g., `TodoList`, `SortableItem`)
- Hooks: camelCase with `use` prefix (e.g., `useSortable`)
- Variables/Functions: camelCase (e.g., `handleToggleTodo`)
- Interfaces/Types: PascalCase (e.g., `Todo`, `Task`)
- Constants: SCREAMING_SNAKE_CASE for globals, camelCase for local

### Error Handling

- Use TypeScript strict mode for type safety
- Implement proper error boundaries
- Use optional chaining (`?.`) for safe property access
- Validate user inputs with proper typing

