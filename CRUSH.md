# Crush Configuration

## Commands
- **Build**: `npm run build` (builds Next.js and Nuxt apps)
- **Dev**: `npm run dev` (starts development server)
- **Test**: `npm run test` (runs all tests with Vitest)
- **Single test**: `npx vitest run <test-file.spec.ts>` (e.g., `npx vitest run test/nuxt/hej.spec.ts`)
- **Generate**: `npm run generate` (Nuxt static generation)

## Code Style Guidelines

### Project Structure
- Next.js: Standard App Router structure in `/app`
- Nuxt: Vue 3 with Nuxt 4, located in `/nuxt` directory
- Tests: Located in `test/` with subdirs like `nuxt/` for Nuxt-specific tests

### TypeScript
- Strict TypeScript usage enforced
- Use explicit types for function parameters and return values
- Avoid `any` type; prefer union types or interfaces when needed

### Testing (Vitest)
- Use `vitest` with `@nuxt/test-utils` for Nuxt component tests
- Test structure: `test/<environment>/*.spec.ts` (e.g., `test/nuxt/hej.spec.ts`)
- Expect syntax: `expect(value).toBe(expected)`
- No specific test naming conventions observed; keep descriptive

### Imports
- Use ES6 module imports
- Relative imports for local files
- Framework imports first, then dependencies, then local imports

### Error Handling
- Use try-catch blocks for async operations
- Prefer throwing descriptive Error objects over undefined values
- Handle loading/error states in Vue components using Nuxt's built-in patterns

### Naming Conventions
- Files: kebab-case for Vue files (`page.vue`), camelCase for TSX files
- Variables: camelCase
- Components: PascalCase for Vue components, camelCase for others
- Directories: kebab-case

### Vue (Nuxt) Specific
- Use Composition API with `<script setup>`
- Leverage Nuxt UI components when available
- Helper functions in separate composables (e.g., `composables/useAuth.ts`)

### Deployment
- Docker-based deployment with multi-platform builds (linux/arm64)
- CI/CD via GitHub Actions creating semantic version tags
- Database schema managed via drawdb.app