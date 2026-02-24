# Service Catalog

Use-case-driven service catalog. **Product-down, not infrastructure-up.**

The catalog answers "what does the business do?" before "what services exist?" Use cases are primary; services implement them.

## Packages

| Package                                          | Description                                                 |
| ------------------------------------------------ | ----------------------------------------------------------- |
| [@cwygoda/service-catalog-core](./packages/core) | Domain models, schemas, adapters (TOML parser, JSON writer) |
| [@cwygoda/service-catalog-cli](./packages/cli)   | CLI to build catalog from TOML files                        |
| [@cwygoda/service-catalog-ui](./packages/ui)     | Svelte components for rendering catalogs                    |

## Quick Start

```bash
# Install packages
pnpm add @cwygoda/service-catalog-core @cwygoda/service-catalog-cli @cwygoda/service-catalog-ui

# Create catalog structure
mkdir -p my-catalog/services/api-gateway
cat > my-catalog/services/api-gateway/service.toml << 'EOF'
[service]
id = "api-gateway"
name = "API Gateway"
description = "Routes external requests to internal services"
EOF

# Build catalog
npx service-catalog build -i my-catalog -o static

# Output: static/catalog.json
```

## Documentation

### For Users

- [Getting Started](./docs/getting-started.md) - Create your first catalog
- [Catalog Format](./docs/catalog-format.md) - TOML schema reference
- [CLI Reference](./docs/cli.md) - Build command options
- [UI Integration](./docs/ui-integration.md) - SvelteKit setup

### For Developers

- [Contributing](./CONTRIBUTING.md) - Development setup and guidelines

## Demo

The [demo app](./apps/demo) showcases a complete catalog with 6 services across 2 domains and 3 use cases.

```bash
# Run demo locally
git clone https://github.com/user/service-catalog
cd service-catalog
pnpm install
pnpm build
pnpm preview
# Open http://localhost:4173
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Your App                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ SvelteKit   │  │ catalog.json│  │ @service-catalog│  │
│  │ Routes      │◄─┤ (static)    │◄─┤ /cli build      │  │
│  └──────┬──────┘  └─────────────┘  └────────┬────────┘  │
│         │                                    │           │
│         ▼                                    ▼           │
│  ┌─────────────┐                    ┌───────────────┐   │
│  │ @service-   │                    │ TOML sidecars │   │
│  │ catalog/ui  │                    │ (source)      │   │
│  └─────────────┘                    └───────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Data flow:**

```
TOML sidecars → CLI build → catalog.json → SvelteKit static site
```

## License

MIT
