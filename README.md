# Service Catalog

Use-case-driven service catalog. Product-down, not infrastructure-up.

The catalog answers "what does the business do?" before "what services exist?" Use cases are primary; services implement them.

## Prerequisites

- Node.js 20+
- pnpm

## Quick Start

```bash
# Install dependencies
pnpm install

# Build and preview
pnpm build
pnpm preview
```

Open http://localhost:4173 to view the catalog.

## Development

```bash
# Start dev server
pnpm dev

# Run all checks
pnpm verify

# Individual commands
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm test:unit      # Vitest
pnpm test:e2e       # Playwright (requires build)
```

## Architecture

Hexagonal (Ports & Adapters):

```
src/
├── core/           # Pure domain logic, no I/O
│   ├── domain/     # Entities (Service, Catalog)
│   └── ports/      # Interfaces for external deps
├── adapters/       # Implement ports
│   ├── loaders/    # Filesystem catalog loader
│   ├── parsers/    # TOML parser
│   └── persistence/# JSON writer
├── cli/            # CLI commands
├── lib/            # SvelteKit frontend
│   ├── adapters/   # Static JSON adapter
│   ├── components/ # Svelte components
│   └── stores/     # State (theme)
├── routes/         # SvelteKit pages
└── shared/         # TypeBox schemas
```

**Data flow:**

```
TOML sidecars → CLI parse → catalog.json → SvelteKit static build
```

## Demo Catalog

The `demo-catalog/` directory contains 6 example services:

```bash
# Build catalog from TOML files
pnpm build:catalog

# Output: static/catalog.json
```

### Service Definition

Each service is defined in `service.toml`:

```toml
[service]
id = "auth-service"
name = "Auth Service"
description = "OIDC identity provider for user authentication"

[service.metadata]
version = "2.1.0"
```

## Tech Stack

- **SvelteKit** - Static site generation
- **Tailwind CSS v4** - Styling
- **TypeBox** - Schema validation
- **Vitest** - Unit/integration tests
- **Playwright** - E2E tests

## License

MIT
