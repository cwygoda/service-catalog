# Phase 1: Foundation + MVP

**Product vision:** Use-case-driven service catalog. Phase 1 lays foundation; Phase 2 introduces use cases as the core differentiator.

Goal: Demo-able static site with basic service listing + full dev tooling.

## 1. Project Initialization

- [x] Initialize pnpm project with `package.json`
  - name: `@service-catalog/app`
  - type: `module`
  - engines: `node >=20`
- [x] Create directory structure (hexagonal):

  ```text
  src/
  ├── core/
  │   ├── domain/
  │   ├── ports/
  │   └── services/
  ├── adapters/
  │   ├── parsers/
  │   ├── loaders/
  │   └── persistence/
  ├── cli/
  │   └── commands/
  ├── web/
  └── shared/
      ├── schemas/
      └── types/
  ```

## 2. TypeScript Configuration

- [x] Create `tsconfig.json`:
  - strict: true
  - module: NodeNext
  - moduleResolution: NodeNext
  - target: ES2022
  - paths aliases: `@core/*`, `@adapters/*`, `@shared/*`
- [ ] Create `tsconfig.node.json` for CLI/build
- [ ] Create `tsconfig.web.json` for SvelteKit (extends base)

## 3. Linting & Formatting

- [x] Install ESLint 9+ with flat config
- [x] Install `@typescript-eslint/eslint-plugin`
- [x] Install `eslint-plugin-svelte`
- [x] Create `eslint.config.js`:
  - TypeScript strict rules
  - Svelte rules
  - Import order rules
- [x] Install Prettier
- [x] Create `.prettierrc`:
  - singleQuote: true
  - trailingComma: 'es5'
  - printWidth: 100
  - plugins: prettier-plugin-svelte
- [x] Add npm scripts:
  - `lint`: `eslint .`
  - `lint:fix`: `eslint . --fix`
  - `format`: `prettier --write .`
  - `format:check`: `prettier --check .`
  - `typecheck`: `tsc --noEmit`

## 4. Testing Setup

- [x] Install Vitest
- [x] Create `vitest.config.ts`:
  - environment: node (for core/cli)
  - coverage provider: v8
  - include patterns
- [ ] Create `vitest.workspace.ts` for multiple projects (node + jsdom)
- [x] Install `@testing-library/svelte` for component tests
- [x] Install Playwright
- [x] Create `playwright.config.ts`:
  - baseURL: <http://localhost:4173> (preview server)
  - webServer config to auto-start preview
- [x] Create test directories:

  ```text
  tests/
  ├── integration/
  └── e2e/
  ```

- [x] Add npm scripts:
  - `test:unit`: `vitest run`
  - `test:unit:watch`: `vitest`
  - `test:integration`: `vitest run tests/integration`
  - `test:e2e`: `playwright test`
  - `test`: `vitest run && playwright test`
  - `coverage`: `vitest run --coverage`

## 5. Verify Script

- [x] Create `pnpm verify` script that runs all checks in order:

  ```bash
  pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:unit && pnpm build && pnpm test:e2e
  ```

- [x] Verify script exits non-zero on any failure

## 6. Core Domain Types

- [x] Create `src/core/domain/service.ts`:

  ```typescript
  export interface Service {
    id: string;
    name: string;
    description: string;
    metadata?: {
      version?: string;
    };
  }
  ```

- [x] Create `src/core/domain/catalog.ts`:

  ```typescript
  export interface Catalog {
    services: Service[];
  }
  ```

- [x] Unit tests for domain types (type guards, factories)

## 7. Core Ports

- [x] Create `src/core/ports/catalog-loader.port.ts`:

  ```typescript
  export interface CatalogLoaderPort {
    load(path: string): Promise<Catalog>;
  }
  ```

- [x] Create `src/core/ports/catalog-writer.port.ts`:

  ```typescript
  export interface CatalogWriterPort {
    write(catalog: Catalog, outputPath: string): Promise<void>;
  }
  ```

## 8. TypeBox Schemas

- [x] Install `@sinclair/typebox`
- [x] Create `src/shared/schemas/service.schema.ts`:

  ```typescript
  export const ServiceSchema = Type.Object({
    service: Type.Object({
      id: Type.String(),
      name: Type.String(),
      description: Type.String(),
      metadata: Type.Optional(
        Type.Object({
          version: Type.Optional(Type.String()),
        })
      ),
    }),
  });
  ```

- [ ] Export JSON Schema for external validation
- [x] Unit tests for schema validation

## 9. TOML Parser Adapter

- [x] Install `smol-toml`
- [x] Create `src/adapters/parsers/toml.parser.ts`:
  - Parse TOML string → object
  - Validate against TypeBox schema
  - Return typed result or throw with clear errors
- [x] Error messages include file path, line number if possible
- [x] Unit tests with fixtures:
  - `tests/fixtures/valid-service.toml`
  - `tests/fixtures/invalid-missing-id.toml`
  - `tests/fixtures/invalid-syntax.toml`

## 10. Filesystem Loader Adapter

- [x] Create `src/adapters/loaders/filesystem.loader.ts`:
  - Implements `CatalogLoaderPort`
  - Recursively find `service.toml` files
  - Parse each, collect into Catalog
- [ ] Unit tests with temp directories

## 11. JSON Writer Adapter

- [x] Create `src/adapters/persistence/json.writer.ts`:
  - Implements `CatalogWriterPort`
  - Write `catalog.json` to output path
- [x] Pretty-print JSON for readability
- [ ] Unit tests

## 12. CLI Implementation

- [x] Install `commander` + `chalk`
- [x] Create `src/cli/index.ts` entry point
- [x] Create `src/cli/commands/build.command.ts`:

  ```typescript
  interface BuildOptions {
    input: string; // -i, --input
    output: string; // -o, --output (default: dist/)
  }
  ```

- [x] Wire up adapters via dependency injection
- [x] Add `bin` entry to `package.json`: `service-catalog`
- [ ] Integration test: run CLI on demo catalog, verify output

## 13. SvelteKit Setup

- [ ] Initialize SvelteKit in `src/web/`:

  ```bash
  pnpm create svelte@latest src/web --template skeleton --types typescript
  ```

- [ ] Install `@sveltejs/adapter-static`
- [ ] Configure `svelte.config.js` for static output
- [ ] Move/merge configs to root level
- [ ] Verify `pnpm dev` starts dev server

## 14. Tailwind CSS

- [ ] Install Tailwind CSS + PostCSS + Autoprefixer
- [ ] Create `tailwind.config.js`:
  - content paths for Svelte files
  - darkMode: 'class'
- [ ] Create `src/web/app.css` with Tailwind directives
- [ ] Import in root layout

## 15. Web Data Loading

- [ ] Create `src/web/lib/ports/catalog.port.ts`:

  ```typescript
  export interface CatalogPort {
    getCatalog(): Promise<Catalog>;
    getService(id: string): Promise<Service | undefined>;
  }
  ```

- [ ] Create `src/web/lib/adapters/static-json.adapter.ts`:
  - Implements CatalogPort
  - Fetches from `/catalog.json` (static build)
- [ ] Configure Vite to copy `catalog.json` to static folder

## 16. Dark Mode

- [ ] Create `src/web/lib/stores/theme.store.ts`:
  - Track current theme: 'light' | 'dark' | 'system'
  - Persist to localStorage
  - Apply `dark` class to `<html>`
- [ ] Create `src/web/lib/components/ThemeToggle.svelte`
- [ ] Detect system preference on mount
- [ ] Unit test for store logic
- [ ] E2E test for toggle functionality

## 17. Layout & Navigation

- [ ] Create `src/web/routes/+layout.svelte`:
  - Header with logo/title
  - Navigation links
  - Theme toggle
  - Responsive: hamburger menu on mobile
- [ ] Create `src/web/lib/components/Header.svelte`
- [ ] Create `src/web/lib/components/Nav.svelte`

## 18. Routes & Pages

- [ ] Create `src/web/routes/+page.svelte` (Home):
  - Catalog overview
  - Service count
  - Quick links
- [ ] Create `src/web/routes/services/+page.svelte` (Service list):
  - Grid of service cards
  - Load from CatalogPort
- [ ] Create `src/web/routes/services/[id]/+page.svelte` (Service detail):
  - Name, description
  - Version badge
  - Placeholder sections for future content
- [ ] Create `src/web/lib/components/ServiceCard.svelte`
- [ ] Component tests for each

## 19. Demo Catalog

- [x] Create `demo-catalog/` directory at project root
- [x] Create `demo-catalog/services/auth-service/service.toml`:

  ```toml
  [service]
  id = "auth-service"
  name = "Auth Service"
  description = "OIDC identity provider for user authentication"

  [service.metadata]
  version = "2.1.0"
  ```

- [x] Create remaining 5 services:
  - `policy-service/service.toml`
  - `crm-service/service.toml`
  - `billing-service/service.toml`
  - `catalog-service/service.toml`
  - `orders-service/service.toml`
- [x] Verify `pnpm build` with demo catalog produces valid output

## 20. Build Integration

- [ ] Update CLI `build` command to orchestrate:
  1. Load catalog from input path
  2. Write `catalog.json` to web static folder
  3. Run SvelteKit build
- [ ] Add npm scripts:
  - `dev`: `vite dev` (web only, needs catalog.json)
  - `build`: `service-catalog build -i demo-catalog && vite build`
  - `preview`: `vite preview`
- [ ] Integration test: full build + verify output structure

## 21. E2E Tests

- [ ] Create `tests/e2e/navigation.spec.ts`:
  - Home page loads
  - Navigate to services list
  - Navigate to service detail
  - Back navigation works
- [ ] Create `tests/e2e/dark-mode.spec.ts`:
  - Toggle changes theme
  - Persists after reload
  - Respects system preference
- [ ] Create `tests/e2e/responsive.spec.ts`:
  - Mobile viewport shows hamburger
  - Menu opens/closes
- [ ] All E2E tests pass against built static site

## 22. Deployment

- [ ] Create `vercel.json` (if needed) or rely on auto-detect
- [ ] Add build command for Vercel: `pnpm build`
- [ ] Add output directory: `dist/` or `build/`
- [ ] Test deployment to Vercel
- [ ] Verify deployed site works

## 23. Documentation

- [ ] Create `README.md`:
  - Project description
  - Prerequisites (Node 20+, pnpm)
  - Quick start
  - Development commands
  - Architecture overview
  - Demo catalog usage
- [ ] Add inline code documentation for complex parts

---

## Verification Commands

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format:check

# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# Build
pnpm build

# E2E tests (requires build)
pnpm test:e2e

# All checks (CI)
pnpm verify
```

## Acceptance Criteria

- [ ] `pnpm verify` passes (all checks green)
- [ ] Site displays 6 demo services with name + description
- [ ] Dark mode toggle works and persists
- [ ] Mobile responsive layout works
- [ ] Deployed to Vercel and accessible
- [ ] Test coverage >80% for `src/core/`
- [x] Zero ESLint errors, zero TypeScript errors
- [x] Hexagonal architecture enforced (core has no I/O imports)

---

## Up Next: Phase 2 — Use Cases ⭐

Phase 2 introduces the core differentiator:

- Use case entity + BPMN rendering
- Use case list as primary navigation
- Service → use case linking
- 3 demo use cases (checkout, profile-update, onboarding)

See SPEC.md Phase 2 for full details.
