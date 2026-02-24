# Contributing

Development guide for the service-catalog monorepo.

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
git clone https://github.com/user/service-catalog
cd service-catalog
pnpm install
```

## Monorepo Structure

```
service-catalog/
├── packages/
│   ├── core/     # @service-catalog/core - domain, adapters, schemas
│   ├── cli/      # @service-catalog/cli - CLI binary
│   └── ui/       # @service-catalog/ui - Svelte components
├── apps/
│   └── demo/     # Demo app (private, not published)
├── configs/
│   ├── tsconfig/ # Shared TypeScript configs
│   └── eslint/   # Shared ESLint configs
├── docs/         # User documentation
└── pnpm-workspace.yaml
```

## Commands

### Root (all packages)

```bash
pnpm verify        # Full verification: typecheck → lint → format → test → build → e2e
pnpm build         # Build all packages
pnpm test          # Run unit tests
pnpm test:e2e      # Run e2e tests (requires build)
pnpm typecheck     # TypeScript check
pnpm lint          # ESLint
pnpm format        # Prettier (fix)
pnpm format:check  # Prettier (check only)
```

### Package-specific

```bash
# Run command in specific package
pnpm -F @service-catalog/core test
pnpm -F @service-catalog/ui build
pnpm -F @service-catalog/demo dev

# Run single test file
pnpm -F @service-catalog/core test src/domain/service.test.ts
```

## Development Workflow

### 1. Start dev server

```bash
pnpm dev
```

Runs the demo app at http://localhost:5173 with hot reload.

### 2. Make changes

- **core**: Domain logic, adapters, schemas
- **cli**: CLI commands
- **ui**: Svelte components, stores

### 3. Run checks

```bash
pnpm verify
```

Must pass before committing.

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(core): add connection validation"
git commit -m "fix(ui): correct theme toggle state"
git commit -m "docs: update getting started guide"
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Architecture

### Hexagonal (Ports & Adapters)

```
packages/core/src/
├── domain/      # Pure domain logic, ZERO I/O
│   ├── catalog.ts
│   ├── service.ts
│   ├── use-case.ts
│   └── ...
├── ports/       # Interfaces for external dependencies
│   ├── catalog-loader.port.ts
│   └── catalog-writer.port.ts
├── adapters/    # Implement ports
│   ├── loaders/filesystem.loader.ts
│   ├── parsers/toml.parser.ts
│   └── persistence/json.writer.ts
├── schemas/     # TypeBox validation schemas
└── services/    # Domain services (graph-builder)
```

**Rules:**

- `domain/` imports NOTHING from `adapters/`, `cli/`, `ui/`
- `domain/` has no `fs`, `fetch`, `process`, framework imports
- Dependency injection via factory functions

### Package Exports

Each package uses subpath exports:

```typescript
// Core
import { Catalog, Service } from '@service-catalog/core/domain';
import { createFilesystemLoader } from '@service-catalog/core/adapters';
import { CatalogSchema } from '@service-catalog/core/schemas';

// UI (browser-safe only)
import { ServiceCard, theme } from '@service-catalog/ui';
```

### Browser vs Node

`@service-catalog/core` has Node.js-only adapters (filesystem). The UI package imports only browser-safe subpaths:

```typescript
// OK in browser
import type { Catalog } from '@service-catalog/core/domain';
import { CatalogSchema } from '@service-catalog/core/schemas';

// NOT OK in browser (Node.js only)
import { createFilesystemLoader } from '@service-catalog/core/adapters';
```

## Testing

### Unit Tests (Vitest)

```bash
pnpm test              # All packages
pnpm test:unit         # Alias
pnpm -F core test      # Single package
```

Co-locate tests with source: `foo.ts` → `foo.test.ts`

### E2E Tests (Playwright)

```bash
pnpm build             # Required first
pnpm test:e2e          # Run against built demo
```

Tests are in `apps/demo/tests/`.

### Coverage

```bash
pnpm -F @service-catalog/core test -- --coverage
```

Target: >80% for core package.

## Adding Dependencies

1. Check package health (recent releases, adoption)
2. Add to correct package:

```bash
# Runtime dependency
pnpm -F @service-catalog/core add some-package

# Dev dependency
pnpm -F @service-catalog/ui add -D some-dev-package
```

## Package Publishing

Packages use [changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Add changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish
pnpm changeset publish
```

## Code Style

- Explicit types, no `any`
- Prefer `interface` over `type` for objects
- Use `Result<T, E>` for recoverable errors
- Throw only for programming errors
- Files < 500 LOC

## Error Messages

Include context:

```
Error: Invalid service.toml at demo-catalog/orders-service/service.toml:12
  Missing required field: service.id
```

## Key Files

| File        | Purpose                   |
| ----------- | ------------------------- |
| `CLAUDE.md` | AI assistant instructions |
| `SPEC.md`   | Full specification        |
| `TASKS.md`  | Current phase tasks       |
| `docs/`     | User documentation        |
